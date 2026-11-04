"""Gemini AI feature routes."""
from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from app.services.auth_service import require_auth
from app.services.ai_service import (
    AIService,
    AIServiceUnavailableError,
    AIProcessingError,
)
from app.schemas.ai import (
    ImproveSummaryRequestSchema,
    ImproveExperienceRequestSchema,
    JobMatchRequestSchema,
    ChatRequestSchema,
)

ai_bp = Blueprint("ai", __name__)


def _build_ai_response(result: dict):
    """Wrap AI result in JSON response with Server-Timing header."""
    response = jsonify(result)
    dur = result.get("responseTimeMs")
    if dur is not None:
        response.headers["Server-Timing"] = f"gemini;dur={dur}"
    req_id = request.headers.get("X-Request-ID")
    if req_id:
        response.headers["X-Request-ID"] = req_id
    return response, 200


def _handle_processing_error(err: AIProcessingError):
    """Map AI processing errors to appropriate status codes."""
    status_code = getattr(err, "status_code", 500)
    is_timeout = (
        status_code == 504
        or "timed out" in err.message.lower()
        or "deadline_exceeded" in err.message.lower()
        or "deadline expired" in err.message.lower()
    )
    if is_timeout:
        status_code = 504
        error_title = "Gateway Timeout"
    else:
        error_title = "AI Processing Error"

    response = jsonify({
        "error": error_title,
        "message": err.message
    })
    req_id = request.headers.get("X-Request-ID")
    if req_id:
        response.headers["X-Request-ID"] = req_id
    return response, status_code


@ai_bp.route("/ai/status", methods=["GET"])
def get_ai_status():
    """Check whether Gemini AI features are configured and available."""
    available = AIService.is_available()
    model = AIService._get_model()
    msg = (
        "Gemini AI features are ready."
        if available
        else "Gemini API key is not configured. Set GEMINI_API_KEY in backend."
    )
    return jsonify({
        "available": available,
        "model": model,
        "message": msg
    }), 200


@ai_bp.route("/ai/improve-summary", methods=["POST"])
@require_auth
def improve_summary():
    """Rewrite a resume summary using Gemini AI."""
    payload = request.get_json(silent=True) or {}
    try:
        validated = ImproveSummaryRequestSchema(**payload)
    except ValidationError as err:
        return jsonify({
            "error": "Validation Error",
            "details": err.errors()
        }), 422

    req_id = request.headers.get("X-Request-ID")
    try:
        result = AIService.improve_summary(
            summary=validated.summary,
            target_role=validated.target_role,
            request_id=req_id,
        )
        return _build_ai_response(result)
    except AIServiceUnavailableError as err:
        return jsonify({
            "error": "AI Service Unavailable",
            "message": err.message
        }), 503
    except AIProcessingError as err:
        return _handle_processing_error(err)


@ai_bp.route("/ai/improve-experience", methods=["POST"])
@require_auth
def improve_experience():
    """Enhance experience or project descriptions into action bullets."""
    payload = request.get_json(silent=True) or {}
    try:
        validated = ImproveExperienceRequestSchema(**payload)
    except ValidationError as err:
        return jsonify({
            "error": "Validation Error",
            "details": err.errors()
        }), 422

    req_id = request.headers.get("X-Request-ID")
    try:
        result = AIService.improve_experience(
            text=validated.text,
            role=validated.role,
            company_or_project=validated.company_or_project,
            request_id=req_id,
        )
        return _build_ai_response(result)
    except AIServiceUnavailableError as err:
        return jsonify({
            "error": "AI Service Unavailable",
            "message": err.message
        }), 503
    except AIProcessingError as err:
        return _handle_processing_error(err)


@ai_bp.route("/ai/match-job", methods=["POST"])
@require_auth
def match_job():
    """Match resume content against a job description."""
    payload = request.get_json(silent=True) or {}
    try:
        validated = JobMatchRequestSchema(**payload)
    except ValidationError as err:
        return jsonify({
            "error": "Validation Error",
            "details": err.errors()
        }), 422

    req_id = request.headers.get("X-Request-ID")
    try:
        result = AIService.match_job(
            job_description=validated.job_description,
            resume_summary=validated.resume_summary,
            skills=validated.skills,
            experience_text=validated.experience_text,
            request_id=req_id,
        )
        return _build_ai_response(result)
    except AIServiceUnavailableError as err:
        return jsonify({
            "error": "AI Service Unavailable",
            "message": err.message
        }), 503
    except AIProcessingError as err:
        return _handle_processing_error(err)


@ai_bp.route("/ai/chat", methods=["POST"])
@require_auth
def chat():
    """Chat with the conversational AI resume assistant."""
    payload = request.get_json(silent=True) or {}
    try:
        validated = ChatRequestSchema(**payload)
    except ValidationError as err:
        return jsonify({
            "error": "Validation Error",
            "details": err.errors()
        }), 422

    history_dicts = (
        [item.model_dump() for item in validated.history]
        if validated.history else []
    )

    req_id = request.headers.get("X-Request-ID")
    try:
        result = AIService.chat(
            message=validated.message,
            history=history_dicts,
            resume_context=validated.resume_context,
            request_id=req_id,
        )
        return _build_ai_response(result)
    except AIServiceUnavailableError as err:
        return jsonify({
            "error": "AI Service Unavailable",
            "message": err.message
        }), 503
    except AIProcessingError as err:
        return _handle_processing_error(err)
