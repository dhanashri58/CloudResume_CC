"""Gemini AI service for resume enhancement and career assistance."""
import json
import logging
import os
import re
import time
from typing import Optional, Dict, Any, List, Union
from flask import current_app
import httpx
from google import genai
from google.genai import errors as genai_errors
from google.genai import types

logger = logging.getLogger(__name__)

DEFAULT_TIMEOUT_SECONDS = 20.0


class AIServiceUnavailableError(Exception):
    """Raised when Gemini API key is not configured."""

    def __init__(
        self,
        message: str = (
            "Gemini API key is not configured. Please set GEMINI_API_KEY "
            "in the backend environment to enable AI features."
        )
    ):
        self.message = message
        super().__init__(self.message)


class AIProcessingError(Exception):
    """Raised when Gemini API request fails or times out."""

    def __init__(
        self,
        message: str = "AI request failed",
        status_code: int = 500,
    ):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class AIService:
    """Manages interactions with Google Gemini AI models."""

    @classmethod
    def _resolve_api_key(cls) -> str:
        """Resolve Gemini API key from environment or app config."""
        if "GEMINI_API_KEY" in os.environ:
            return os.environ.get("GEMINI_API_KEY", "").strip()
        try:
            return (current_app.config.get("GEMINI_API_KEY") or "").strip()
        except RuntimeError:
            return ""

    @classmethod
    def is_available(cls) -> bool:
        """Check if GEMINI_API_KEY is configured with a valid value."""
        api_key = cls._resolve_api_key()
        if not api_key:
            return False
        lowered = api_key.lower()
        if "placeholder" in lowered or "your-api-key" in lowered:
            return False
        return True

    @classmethod
    def _get_client(cls) -> genai.Client:
        """Initialize and return Gemini Client with sensible timeout."""
        if not cls.is_available():
            raise AIServiceUnavailableError()
        api_key = cls._resolve_api_key()

        try:
            timeout_sec = float(
                os.getenv(
                    "GEMINI_TIMEOUT_SECONDS", str(DEFAULT_TIMEOUT_SECONDS)
                )
            )
        except (ValueError, TypeError):
            timeout_sec = DEFAULT_TIMEOUT_SECONDS

        # Google GenAI SDK expects timeout in milliseconds as an integer
        timeout_ms = int(timeout_sec * 1000)
        http_options = types.HttpOptions(timeout=timeout_ms)
        return genai.Client(api_key=api_key, http_options=http_options)

    @classmethod
    def _get_model(cls) -> str:
        """Get configured Gemini model name."""
        env_model = os.environ.get("GEMINI_MODEL", "").strip()
        if env_model:
            return env_model
        try:
            return current_app.config.get(
                "GEMINI_MODEL", "gemini-3.5-flash-lite"
            )
        except RuntimeError:
            return "gemini-3.5-flash-lite"

    @classmethod
    def _extract_json(cls, text: str) -> Dict[str, Any]:
        """Safely parse JSON from model output, stripping code fences."""
        cleaned = text.strip()
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
            cleaned = re.sub(r"\s*```$", "", cleaned)
        try:
            return json.loads(cleaned)
        except Exception:
            match = re.search(r"\{.*\}", cleaned, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(0))
                except Exception:
                    pass
            return {}

    @classmethod
    def _call_gemini_with_retry(
        cls,
        client: genai.Client,
        model: str,
        contents: str,
        config: Optional[types.GenerateContentConfig] = None,
        max_retries: int = 1,
    ):
        """Execute Gemini generate_content with retry for 429/503 only."""
        attempt = 0
        while True:
            try:
                if config:
                    return client.models.generate_content(
                        model=model, contents=contents, config=config
                    )
                return client.models.generate_content(
                    model=model, contents=contents
                )
            except genai_errors.APIError as err:
                code = getattr(err, "code", None)
                # Retry temporary server overload (503) or rate-limit (429)
                if attempt < max_retries and code in (429, 503):
                    attempt += 1
                    sleep_time = 1.0 * attempt
                    logger.warning(
                        "Gemini API returned %s; retry %d/%d after %.1fs",
                        code, attempt, max_retries, sleep_time
                    )
                    time.sleep(sleep_time)
                    continue
                raise
            except Exception:
                raise

    @classmethod
    def _handle_gemini_error(
        cls,
        err: Exception,
        op_name: str,
        model: str,
        request_id: Optional[str] = None,
    ) -> AIProcessingError:
        """Log diagnostic error safely and return formatted error."""
        req_prefix = f"[{request_id}] " if request_id else ""
        err_str = str(err).lower()
        is_timeout = (
            isinstance(err, (TimeoutError, httpx.TimeoutException))
            or "timed out" in err_str
            or "timeout" in err_str
            or "deadline_exceeded" in err_str
            or "deadline expired" in err_str
            or (
                isinstance(err, genai_errors.APIError)
                and (
                    getattr(err, "code", None) in (408, 504)
                    or getattr(err, "status", "") == "DEADLINE_EXCEEDED"
                )
            )
        )
        if is_timeout:
            logger.error(
                "%sGemini API call timed out during %s (model=%s): %s",
                req_prefix, op_name, model, err,
            )
            return AIProcessingError(
                "AI request timed out. Please try again with a shorter "
                "prompt.",
                status_code=504,
            )

        if isinstance(err, genai_errors.APIError):
            code = getattr(err, "code", None)
            msg = getattr(err, "message", None) or str(err)
            logger.error(
                "%sGemini API error during %s (model=%s, code=%s): %s",
                req_prefix, op_name, model, code, msg,
            )
            return AIProcessingError(
                f"Gemini API error: {msg}",
                status_code=500,
            )
        logger.error(
            "%sUnexpected error during %s (model=%s): %s",
            req_prefix, op_name, model, str(err),
        )
        return AIProcessingError(
            f"{op_name} failed: {str(err)}",
            status_code=500,
        )

    @classmethod
    def improve_summary(
        cls,
        summary: str,
        target_role: Optional[str] = None,
        request_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Rewrite resume summary to be more concise and professional."""
        client = cls._get_client()
        model = cls._get_model()
        start_time = time.perf_counter()
        req_tag = f"[{request_id}] " if request_id else ""

        role_instruction = (
            f"Tailor the summary for a target role of '{target_role}'. "
            if target_role else ""
        )
        prompt = (
            "You are an expert ATS resume consultant and career coach.\n"
            "Task: Rewrite the following resume summary to be professional, "
            "concise, and compelling for recruiters.\n"
            "Strict Guidelines:\n"
            "1. Preserve all original facts, titles, and metrics.\n"
            "2. Never invent qualifications, experience, degrees, or "
            "companies.\n"
            f"{role_instruction}\n"
            "3. Format your response strictly as valid JSON with keys:\n"
            '   "improvedSummary": (string with the polished summary),\n'
            '   "keyChanges": (list of 2-4 brief bullet points '
            "explaining changes)\n\n"
            f"Original Summary:\n{summary}\n"
        )

        config = types.GenerateContentConfig(max_output_tokens=500)

        try:
            response = cls._call_gemini_with_retry(
                client, model=model, contents=prompt, config=config
            )
            raw_text = response.text or ""
            parsed = cls._extract_json(raw_text)
            improved = parsed.get("improvedSummary") or raw_text.strip()
            changes = parsed.get("keyChanges") or [
                "Enhanced professional tone and conciseness",
                "Strengthened clarity and value proposition",
            ]
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.info(
                "%sGemini improve_summary completed in %.2fms (model=%s)",
                req_tag, duration_ms, model
            )
            return {
                "originalSummary": summary,
                "improvedSummary": improved,
                "keyChanges": changes,
                "responseTimeMs": duration_ms,
            }
        except Exception as err:
            raise cls._handle_gemini_error(
                err, "improve_summary", model, request_id=request_id
            )

    @classmethod
    def improve_experience(
        cls,
        text: str,
        role: Optional[str] = None,
        company_or_project: Optional[str] = None,
        request_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Transform descriptions into action-oriented bullet points."""
        client = cls._get_client()
        model = cls._get_model()
        start_time = time.perf_counter()
        req_tag = f"[{request_id}] " if request_id else ""

        context_info = []
        if role:
            context_info.append(f"Role: {role}")
        if company_or_project:
            context_info.append(f"Company/Project: {company_or_project}")
        ctx_line = f" ({', '.join(context_info)})" if context_info else ""

        prompt = (
            "You are an expert technical resume writer.\n"
            f"Task: Transform the following description{ctx_line} into "
            "action-oriented bullet points using the STAR method "
            "(Strong Action Verb + Context + Outcome).\n"
            "Strict Guidelines:\n"
            "1. Preserve original facts and technologies.\n"
            "2. Do not invent metrics, tools, or accomplishments not stated.\n"
            "3. Format your response strictly as valid JSON with keys:\n"
            '   "improvedBullets": (list of 3-5 strings starting with '
            "strong verbs),\n"
            '   "tips": (list of 1-3 suggestions for adding '
            "quantifiable metrics)\n\n"
            f"Original Text:\n{text}\n"
        )

        config = types.GenerateContentConfig(max_output_tokens=600)

        try:
            response = cls._call_gemini_with_retry(
                client, model=model, contents=prompt, config=config
            )
            raw_text = response.text or ""
            parsed = cls._extract_json(raw_text)
            bullets = parsed.get("improvedBullets") or [
                b.strip("- •* ")
                for b in raw_text.split("\n")
                if b.strip()
            ]
            tips = parsed.get("tips") or [
                "Consider adding specific percentage or time savings "
                "if available."
            ]
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.info(
                "%sGemini improve_experience completed in %.2fms (model=%s)",
                req_tag, duration_ms, model
            )
            return {
                "originalText": text,
                "improvedBullets": bullets,
                "tips": tips,
                "responseTimeMs": duration_ms,
            }
        except Exception as err:
            raise cls._handle_gemini_error(
                err, "improve_experience", model, request_id=request_id
            )

    @classmethod
    def match_job(
        cls,
        job_description: str,
        resume_summary: Optional[str] = None,
        skills: Optional[List[str]] = None,
        experience_text: Optional[str] = None,
        request_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Analyze alignment between candidate and a job description."""
        client = cls._get_client()
        model = cls._get_model()
        start_time = time.perf_counter()
        req_tag = f"[{request_id}] " if request_id else ""

        skills_str = ", ".join(skills[:20]) if skills else "None listed"
        exp_part = experience_text[:800] if experience_text else "None"
        resume_block = (
            f"Summary: {resume_summary[:400] if resume_summary else 'None'}\n"
            f"Skills: {skills_str}\n"
            f"Experience: {exp_part}\n"
        )

        prompt = (
            "You are an objective hiring analyst and resume advisor.\n"
            "Task: Compare candidate info with the job description.\n"
            "Strict Guidelines:\n"
            "1. Identify matching skills honestly based on candidate data.\n"
            "2. Identify missing skills required by the job posting.\n"
            "3. Estimate match score (0-100) based on alignment.\n"
            "4. Format response strictly as valid JSON with keys:\n"
            '   "matchScore": (integer between 0 and 100),\n'
            '   "matchingSkills": (list of strings),\n'
            '   "missingSkills": (list of strings),\n'
            '   "suggestions": (list of 2-4 actionable tailoring tips)\n\n'
            f"Job Description:\n{job_description[:1500]}\n\n"
            f"Candidate Profile:\n{resume_block}\n"
        )

        config = types.GenerateContentConfig(max_output_tokens=600)

        try:
            response = cls._call_gemini_with_retry(
                client, model=model, contents=prompt, config=config
            )
            raw_text = response.text or ""
            parsed = cls._extract_json(raw_text)
            score = parsed.get("matchScore")
            if score is None or not isinstance(score, (int, float)):
                score = 70
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.info(
                "%sGemini match_job completed in %.2fms (model=%s)",
                req_tag, duration_ms, model
            )
            return {
                "matchScore": int(min(max(score, 0), 100)),
                "matchingSkills": parsed.get("matchingSkills") or [],
                "missingSkills": parsed.get("missingSkills") or [],
                "suggestions": parsed.get("suggestions") or [
                    "Highlight relevant keywords in your experience bullets."
                ],
                "disclaimer": (
                    "Match score is an AI heuristic estimate and does not "
                    "guarantee ATS acceptance or job selection."
                ),
                "responseTimeMs": duration_ms,
            }
        except Exception as err:
            raise cls._handle_gemini_error(
                err, "match_job", model, request_id=request_id
            )

    @classmethod
    def chat(
        cls,
        message: str,
        history: Optional[List[Dict[str, str]]] = None,
        resume_context: Optional[Union[str, Dict[str, Any]]] = None,
        request_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Provide conversational career and resume writing guidance."""
        client = cls._get_client()
        model = cls._get_model()
        start_time = time.perf_counter()
        req_tag = f"[{request_id}] " if request_id else ""

        # Build concise resume context, avoiding bloat and duplication
        if resume_context:
            if isinstance(resume_context, dict):
                parts = []
                title = resume_context.get("title")
                role = (
                    resume_context.get("targetRole")
                    or resume_context.get("target_role")
                )
                summary = resume_context.get("summary")
                skills = resume_context.get("skills")
                if title:
                    parts.append(f"Title: {title}")
                if role:
                    parts.append(f"Target Role: {role}")
                if summary:
                    parts.append(f"Summary: {str(summary)[:350]}")
                if skills:
                    if (
                        isinstance(skills, list)
                        and skills
                        and isinstance(skills[0], dict)
                    ):
                        skills_items = [
                            s.get("name", str(s)) for s in skills
                        ]
                    else:
                        skills_items = [str(s) for s in skills]
                    parts.append(f"Skills: {', '.join(skills_items[:15])}")
                ctx_str = (
                    "\n".join(parts) if parts else str(resume_context)[:500]
                )
            else:
                ctx_str = str(resume_context)[:500].strip()
            context_prompt = (
                f"\n[Candidate Resume Context]:\n{ctx_str}\n"
                if ctx_str else ""
            )
        else:
            context_prompt = ""

        # Keep only the most recent 6 relevant conversation messages
        history_lines = []
        if history:
            clean_history = [
                item for item in history
                if item.get("content", "").strip()
                and item.get("role") in ("user", "assistant", "model")
            ][-6:]
            for item in clean_history:
                role = "User" if item.get("role") == "user" else "Assistant"
                content = item.get("content", "").strip()
                # Cap individual history message to prevent prompt bloat
                if len(content) > 500:
                    content = content[:497] + "..."
                history_lines.append(f"{role}: {content}")

        history_block = (
            f"\nConversation History:\n{chr(10).join(history_lines)}\n"
            if history_lines else ""
        )

        system_instruction = (
            "You are CloudResumeAI Assistant, a cloud career advisor.\n"
            "Guidelines:\n"
            "1. Answer questions on resume writing, ATS, and career.\n"
            "2. Never invent qualifications, employment history, or degrees.\n"
            "3. Ground suggestions in resume context when provided.\n"
            "4. Keep answers friendly, professional, and concise.\n"
        )

        full_prompt = (
            f"{system_instruction}"
            f"{context_prompt}"
            f"{history_block}\n"
            f"User Question: {message}\n"
            "Assistant Reply:"
        )

        config = types.GenerateContentConfig(max_output_tokens=800)

        try:
            response = cls._call_gemini_with_retry(
                client, model=model, contents=full_prompt, config=config
            )
            reply = (response.text or "").strip()
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.info(
                "%sGemini chat completed in %.2fms (model=%s)",
                req_tag, duration_ms, model
            )
            return {
                "reply": reply,
                "suggestions": [
                    "Can you suggest keywords for this role?",
                    "How can I make my bullet points more concise?",
                ],
                "responseTimeMs": duration_ms,
            }
        except Exception as err:
            raise cls._handle_gemini_error(
                err, "chat", model, request_id=request_id
            )
