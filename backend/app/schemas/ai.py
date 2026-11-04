"""Pydantic validation schemas for Gemini AI features."""
from typing import Optional, List, Union, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class ImproveSummaryRequestSchema(BaseModel):
    """Request schema for resume professional summary improvement."""

    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    summary: str = Field(..., min_length=10, max_length=4000)
    target_role: Optional[str] = Field(
        None, max_length=150, alias="targetRole"
    )


class ImproveSummaryResponseSchema(BaseModel):
    """Response schema containing improved professional summary."""

    original_summary: str = Field(..., alias="originalSummary")
    improved_summary: str = Field(..., alias="improvedSummary")
    key_changes: List[str] = Field(
        default_factory=list, alias="keyChanges"
    )
    response_time_ms: Optional[float] = Field(
        None, alias="responseTimeMs"
    )


class ImproveExperienceRequestSchema(BaseModel):
    """Request schema for experience and project bullet point enhancement."""

    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    text: str = Field(..., min_length=10, max_length=4000)
    role: Optional[str] = Field(None, max_length=150)
    company_or_project: Optional[str] = Field(
        None, max_length=150, alias="companyOrProject"
    )


class ImproveExperienceResponseSchema(BaseModel):
    """Response schema with enhanced action-driven bullet points."""

    original_text: str = Field(..., alias="originalText")
    improved_bullets: List[str] = Field(..., alias="improvedBullets")
    tips: List[str] = Field(default_factory=list)
    response_time_ms: Optional[float] = Field(
        None, alias="responseTimeMs"
    )


class JobMatchRequestSchema(BaseModel):
    """Request schema for job description matching."""

    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    job_description: str = Field(
        ..., min_length=20, max_length=10000, alias="jobDescription"
    )
    resume_summary: Optional[str] = Field(
        None, max_length=4000, alias="resumeSummary"
    )
    skills: Optional[List[str]] = Field(default_factory=list)
    experience_text: Optional[str] = Field(
        None, max_length=10000, alias="experienceText"
    )


class JobMatchResponseSchema(BaseModel):
    """Response schema detailing job description match analysis."""

    match_score: int = Field(..., ge=0, le=100, alias="matchScore")
    matching_skills: List[str] = Field(
        default_factory=list, alias="matchingSkills"
    )
    missing_skills: List[str] = Field(
        default_factory=list, alias="missingSkills"
    )
    suggestions: List[str] = Field(default_factory=list)
    disclaimer: str = (
        "Match score is an AI heuristic estimate and does not "
        "guarantee ATS acceptance or job selection."
    )
    response_time_ms: Optional[float] = Field(
        None, alias="responseTimeMs"
    )


class ChatMessageSchema(BaseModel):
    """Single message in chat history."""

    role: str = Field(..., pattern="^(user|model|assistant|system)$")
    content: str = Field(..., min_length=1, max_length=4000)


class ChatRequestSchema(BaseModel):
    """Request schema for conversational AI Resume Assistant."""

    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    message: str = Field(..., min_length=1, max_length=2000)
    history: Optional[List[ChatMessageSchema]] = Field(default_factory=list)
    resume_context: Optional[Union[str, Dict[str, Any]]] = Field(
        None, alias="resumeContext"
    )


class ChatResponseSchema(BaseModel):
    """Response schema for conversational AI assistant replies."""

    reply: str
    suggestions: Optional[List[str]] = Field(default_factory=list)
    response_time_ms: Optional[float] = Field(
        None, alias="responseTimeMs"
    )
