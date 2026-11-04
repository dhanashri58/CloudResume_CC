"""Pydantic validation schemas for resumes, experience, education, etc."""
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class ExperienceSchema(BaseModel):
    """Schema for work experience item."""

    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    id: Optional[str] = None
    company: str = Field(..., min_length=1, max_length=200)
    role: str = Field(..., min_length=1, max_length=200)
    startDate: Optional[str] = Field(None, alias="start_date")
    endDate: Optional[str] = Field(None, alias="end_date")
    current: bool = Field(False, alias="is_current")
    location: Optional[str] = Field(None, max_length=150)
    bullets: List[str] = Field(default_factory=list)


class EducationSchema(BaseModel):
    """Schema for education item."""

    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    id: Optional[str] = None
    institution: str = Field(..., min_length=1, max_length=200)
    degree: Optional[str] = Field(None, max_length=150)
    field: Optional[str] = Field(None, alias="field_of_study", max_length=150)
    startDate: Optional[str] = Field(None, alias="start_date")
    endDate: Optional[str] = Field(None, alias="end_date")
    gpa: Optional[str] = Field(None, max_length=20)
    honors: Optional[str] = Field(None, max_length=255)


class ProjectSchema(BaseModel):
    """Schema for project item."""

    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    id: Optional[str] = None
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    technologies: List[str] = Field(default_factory=list)
    url: Optional[str] = Field(None, max_length=255)
    github: Optional[str] = Field(None, max_length=255)


class SkillGroupSchema(BaseModel):
    """Schema for skill group item."""

    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    id: Optional[str] = None
    category: str = Field(..., min_length=1, max_length=100)
    skills: List[str] = Field(default_factory=list)


class PersonalInfoSchema(BaseModel):
    """Schema for contact information."""

    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    fullName: Optional[str] = Field(None, alias="full_name", max_length=150)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    location: Optional[str] = Field(None, max_length=150)
    website: Optional[str] = Field(None, max_length=255)
    linkedin: Optional[str] = Field(None, max_length=255)
    github: Optional[str] = Field(None, max_length=255)
    headline: Optional[str] = Field(None, max_length=255)


class ResumeCreateSchema(BaseModel):
    """Schema for creating a new resume."""

    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    title: str = Field("Untitled Resume", min_length=1, max_length=255)
    templateId: str = Field("executive", alias="template_id", max_length=50)
    status: str = Field("draft", pattern="^(draft|active|archived)$")
    targetRole: Optional[str] = Field(
        None, alias="target_role", max_length=255
    )
    targetCompany: Optional[str] = Field(
        None, alias="target_company", max_length=255
    )
    personalInfo: Optional[PersonalInfoSchema] = Field(
        None, alias="personal_info"
    )
    summary: Optional[str] = None
    experience: List[ExperienceSchema] = Field(default_factory=list)
    education: List[EducationSchema] = Field(default_factory=list)
    projects: List[ProjectSchema] = Field(default_factory=list)
    skills: List[SkillGroupSchema] = Field(default_factory=list)


class ResumeUpdateSchema(BaseModel):
    """Schema for updating an existing resume."""

    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    templateId: Optional[str] = Field(None, alias="template_id", max_length=50)
    status: Optional[str] = Field(None, pattern="^(draft|active|archived)$")
    targetRole: Optional[str] = Field(
        None, alias="target_role", max_length=255
    )
    targetCompany: Optional[str] = Field(
        None, alias="target_company", max_length=255
    )
    atsScore: Optional[int] = Field(None, alias="ats_score", ge=0, le=100)
    personalInfo: Optional[PersonalInfoSchema] = Field(
        None, alias="personal_info"
    )
    summary: Optional[str] = None
    experience: Optional[List[ExperienceSchema]] = None
    education: Optional[List[EducationSchema]] = None
    projects: Optional[List[ProjectSchema]] = None
    skills: Optional[List[SkillGroupSchema]] = None


class ResumeSummaryResponseSchema(BaseModel):
    """Lightweight summary schema for dashboard resume cards."""

    id: str
    title: str
    templateId: str
    templateName: str
    status: str
    lastModified: str
    targetRole: Optional[str] = None
    targetCompany: Optional[str] = None
    atsScore: Optional[int] = None
    views: int = 0


class ResumeDetailResponseSchema(BaseModel):
    """Full detail schema for resume editor."""

    id: str
    title: str
    templateId: str
    status: str
    targetRole: Optional[str] = None
    targetCompany: Optional[str] = None
    atsScore: Optional[int] = None
    views: int = 0
    personalInfo: PersonalInfoSchema
    summary: str
    experience: List[ExperienceSchema]
    education: List[EducationSchema]
    projects: List[ProjectSchema]
    skills: List[SkillGroupSchema]
    createdAt: str
    updatedAt: str
