"""Resume repository handling CRUD and relational synchronization."""
from typing import List, Optional
from app.extensions import db
from app.models.resume import Resume, Experience, Education, Project, Skill


class ResumeRepository:
    """Repository handling Resume entity lifecycle and relational cascades."""

    @staticmethod
    def list_by_user(user_id: str) -> List[Resume]:
        """Fetch all resumes belonging to user, sorted newest first."""
        stmt = (
            db.select(Resume)
            .where(Resume.user_id == user_id)
            .order_by(Resume.updated_at.desc())
        )
        return list(db.session.execute(stmt).scalars().all())

    @staticmethod
    def get_by_id_and_user(resume_id: str, user_id: str) -> Optional[Resume]:
        """Fetch resume strictly verifying user ownership isolation."""
        stmt = db.select(Resume).where(
            Resume.id == resume_id,
            Resume.user_id == user_id
        )
        resume = db.session.execute(stmt).scalar_one_or_none()

        # Audit potential cross-user unauthorized access attempt
        if not resume:
            other_user_resume = db.session.execute(
                db.select(Resume.id).where(Resume.id == resume_id)
            ).scalar_one_or_none()
            if other_user_resume:
                from app.services.security_monitor import SecurityMonitor
                from flask import has_request_context, request

                ip = (
                    request.remote_addr if has_request_context() else "unknown"
                )
                path = request.path if has_request_context() else "service"
                SecurityMonitor.record_cross_user_denial(
                    user_id=user_id,
                    target_resource=f"resume:{resume_id}",
                    endpoint=path,
                    client_ip=ip,
                )

        return resume

    @staticmethod
    def create(user_id: str, data: dict) -> Resume:
        """Create new resume with all relational child sections."""
        personal = data.get("personalInfo") or data.get("personal_info") or {}

        template_id = (
            data.get("templateId") or data.get("template_id") or "executive"
        )
        target_role = (
            data.get("targetRole") or data.get("target_role")
        )
        target_company = (
            data.get("targetCompany") or data.get("target_company")
        )

        resume = Resume(
            user_id=user_id,
            title=data.get("title", "Untitled Resume"),
            template_id=template_id,
            status=data.get("status", "draft"),
            target_role=target_role,
            target_company=target_company,
            full_name=personal.get("fullName") or personal.get("full_name"),
            email=personal.get("email"),
            phone=personal.get("phone"),
            location=personal.get("location"),
            website=personal.get("website"),
            linkedin=personal.get("linkedin"),
            github=personal.get("github"),
            headline=personal.get("headline"),
            summary=data.get("summary")
        )
        db.session.add(resume)

        # Synchronize child entities
        ResumeRepository._sync_children(resume, data)

        db.session.commit()
        return resume

    @staticmethod
    def update(resume: Resume, data: dict) -> Resume:
        """Update existing resume attributes and child collections."""
        if "title" in data and data["title"] is not None:
            resume.title = data["title"]

        template_id = data.get("templateId") or data.get("template_id")
        if template_id is not None:
            resume.template_id = template_id

        if "status" in data and data["status"] is not None:
            resume.status = data["status"]

        if "targetRole" in data or "target_role" in data:
            resume.target_role = (
                data.get("targetRole") or data.get("target_role")
            )
        if "targetCompany" in data or "target_company" in data:
            resume.target_company = (
                data.get("targetCompany") or data.get("target_company")
            )
        if "atsScore" in data or "ats_score" in data:
            resume.ats_score = data.get("atsScore") or data.get("ats_score")
        if "summary" in data:
            resume.summary = data["summary"]

        personal = data.get("personalInfo") or data.get("personal_info")
        if personal is not None:
            full_name = personal.get("fullName") or personal.get("full_name")
            if full_name is not None:
                resume.full_name = full_name
            if "email" in personal:
                resume.email = personal["email"]
            if "phone" in personal:
                resume.phone = personal["phone"]
            if "location" in personal:
                resume.location = personal["location"]
            if "website" in personal:
                resume.website = personal["website"]
            if "linkedin" in personal:
                resume.linkedin = personal["linkedin"]
            if "github" in personal:
                resume.github = personal["github"]
            if "headline" in personal:
                resume.headline = personal["headline"]

        ResumeRepository._sync_children(resume, data)

        db.session.commit()
        return resume

    @staticmethod
    def _sync_children(resume: Resume, data: dict):
        """Synchronize child relational records for sections."""
        if "experience" in data and data["experience"] is not None:
            resume.experiences.clear()
            for idx, item in enumerate(data["experience"]):
                is_current = (
                    item.get("current")
                    if "current" in item
                    else item.get("is_current", False)
                )
                exp = Experience(
                    resume=resume,
                    company=item.get("company", ""),
                    role=item.get("role", ""),
                    start_date=item.get("startDate") or item.get("start_date"),
                    end_date=item.get("endDate") or item.get("end_date"),
                    is_current=is_current,
                    location=item.get("location"),
                    bullets=item.get("bullets", []),
                    order_index=idx
                )
                db.session.add(exp)

        if "education" in data and data["education"] is not None:
            resume.educations.clear()
            for idx, item in enumerate(data["education"]):
                field_of_study = (
                    item.get("field") or item.get("field_of_study")
                )
                ed = Education(
                    resume=resume,
                    institution=item.get("institution", ""),
                    degree=item.get("degree"),
                    field_of_study=field_of_study,
                    start_date=item.get("startDate") or item.get("start_date"),
                    end_date=item.get("endDate") or item.get("end_date"),
                    gpa=item.get("gpa"),
                    honors=item.get("honors"),
                    order_index=idx
                )
                db.session.add(ed)

        if "projects" in data and data["projects"] is not None:
            resume.projects.clear()
            for idx, item in enumerate(data["projects"]):
                proj = Project(
                    resume=resume,
                    name=item.get("name", ""),
                    description=item.get("description"),
                    technologies=item.get("technologies", []),
                    url=item.get("url"),
                    github=item.get("github"),
                    order_index=idx
                )
                db.session.add(proj)

        if "skills" in data and data["skills"] is not None:
            resume.skills.clear()
            for idx, item in enumerate(data["skills"]):
                sk = Skill(
                    resume=resume,
                    category=item.get("category", ""),
                    skills=item.get("skills", []),
                    order_index=idx
                )
                db.session.add(sk)

    @staticmethod
    def delete(resume: Resume):
        """Delete resume entity with cascading removal of all child records."""
        db.session.delete(resume)
        db.session.commit()
