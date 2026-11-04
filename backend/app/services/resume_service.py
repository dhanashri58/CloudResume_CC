"""Resume service handling business logic, formatting, and ownership."""
import io
import logging
from typing import List, Optional, Tuple
from app.models.user import User
from app.models.resume import Resume
from app.repositories.resume_repository import ResumeRepository
from app.services.pdf_service import PDFService
from app.services.storage_service import StorageService

logger = logging.getLogger(__name__)

TEMPLATE_NAMES = {
    "executive": "Executive",
    "clarity": "Clarity",
    "horizon": "Horizon",
    "prism": "Prism",
    "scholar": "Scholar",
    "atlas": "Atlas",
    "pulse": "Pulse",
    "meridian": "Meridian",
}


class ResumeService:
    """Service handling resume business operations and domain serialization."""

    @staticmethod
    def list_resumes(user: User) -> List[dict]:
        """List summary card dictionaries for all resumes belonging to user."""
        resumes = ResumeRepository.list_by_user(user.id)
        return [ResumeService.format_summary(r) for r in resumes]

    @staticmethod
    def get_resume(resume_id: str, user: User) -> Optional[dict]:
        """Fetch full detailed resume for user, or None if not found."""
        resume = ResumeRepository.get_by_id_and_user(resume_id, user.id)
        if not resume:
            return None
        return ResumeService.format_detail(resume)

    @staticmethod
    def create_resume(user: User, data: dict) -> dict:
        """Create a new resume with all sections transactionally."""
        resume = ResumeRepository.create(user.id, data)
        return ResumeService.format_detail(resume)

    @staticmethod
    def update_resume(
        resume_id: str, user: User, data: dict
    ) -> Optional[dict]:
        """Update existing resume or return None if not found."""
        resume = ResumeRepository.get_by_id_and_user(resume_id, user.id)
        if not resume:
            return None
        updated = ResumeRepository.update(resume, data)
        return ResumeService.format_detail(updated)

    @staticmethod
    def delete_resume(resume_id: str, user: User) -> bool:
        """Delete resume transactionally and purge stored PDF if found."""
        resume = ResumeRepository.get_by_id_and_user(resume_id, user.id)
        if not resume:
            return False
        ResumeRepository.delete(resume)
        try:
            StorageService.delete_resume_pdf(user.id, resume_id)
        except Exception as e:
            logger.warning(
                "Could not delete stored resume PDF for %s: %s", resume_id, e
            )
        return True

    @staticmethod
    def export_pdf(
        resume_id: str, user: User
    ) -> Tuple[Optional[io.BytesIO], str]:
        """Generate PDF for resume if found and persist to storage."""
        resume = ResumeRepository.get_by_id_and_user(resume_id, user.id)
        if not resume:
            return None, ""
        filename = PDFService.get_safe_filename(resume)
        pdf_buffer = PDFService.generate_resume_pdf(resume)

        # Store in configured storage provider (Local or Azure Blob Storage)
        try:
            StorageService.save_resume_pdf(
                user_id=user.id,
                resume_id=resume.id,
                data=pdf_buffer.getvalue(),
                filename=filename,
            )
        except Exception as e:
            logger.warning(
                "Could not persist PDF to storage for resume %s: %s",
                resume_id,
                e,
            )

        return pdf_buffer, filename

    @staticmethod
    def format_summary(resume: Resume) -> dict:
        """Format resume entity as dashboard summary card dictionary."""
        template_name = TEMPLATE_NAMES.get(
            resume.template_id,
            resume.template_id.capitalize()
        )
        return {
            "id": resume.id,
            "title": resume.title,
            "templateId": resume.template_id,
            "templateName": template_name,
            "status": resume.status,
            "lastModified": resume.updated_at.strftime("%Y-%m-%d"),
            "targetRole": resume.target_role,
            "targetCompany": resume.target_company,
            "atsScore": resume.ats_score,
            "views": resume.views,
        }

    @staticmethod
    def format_detail(resume: Resume) -> dict:
        """Format resume entity as full nested dictionary for resume editor."""
        return {
            "id": resume.id,
            "title": resume.title,
            "templateId": resume.template_id,
            "status": resume.status,
            "targetRole": resume.target_role or "",
            "targetCompany": resume.target_company or "",
            "atsScore": resume.ats_score,
            "views": resume.views,
            "personalInfo": {
                "fullName": resume.full_name or "",
                "email": resume.email or "",
                "phone": resume.phone or "",
                "location": resume.location or "",
                "website": resume.website or "",
                "linkedin": resume.linkedin or "",
                "github": resume.github or "",
                "headline": resume.headline or "",
            },
            "summary": resume.summary or "",
            "experience": [
                {
                    "id": exp.id,
                    "company": exp.company,
                    "role": exp.role,
                    "startDate": exp.start_date or "",
                    "endDate": exp.end_date or "",
                    "current": exp.is_current,
                    "location": exp.location or "",
                    "bullets": exp.bullets or [],
                }
                for exp in resume.experiences
            ],
            "education": [
                {
                    "id": ed.id,
                    "institution": ed.institution,
                    "degree": ed.degree or "",
                    "field": ed.field_of_study or "",
                    "startDate": ed.start_date or "",
                    "endDate": ed.end_date or "",
                    "gpa": ed.gpa or "",
                    "honors": ed.honors or "",
                }
                for ed in resume.educations
            ],
            "projects": [
                {
                    "id": proj.id,
                    "name": proj.name,
                    "description": proj.description or "",
                    "technologies": proj.technologies or [],
                    "url": proj.url or "",
                    "github": proj.github or "",
                }
                for proj in resume.projects
            ],
            "skills": [
                {
                    "id": sk.id,
                    "category": sk.category,
                    "skills": sk.skills or [],
                }
                for sk in resume.skills
            ],
            "createdAt": resume.created_at.isoformat(),
            "updatedAt": resume.updated_at.isoformat(),
        }
