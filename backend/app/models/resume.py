"""Resume, Experience, Education, Project, and Skill database models."""
from app.extensions import db
from app.models.base import TimestampMixin


class Resume(TimestampMixin, db.Model):
    """Resume entity belonging to an authenticated user."""

    __tablename__ = "resumes"

    user_id = db.Column(
        db.String(36),
        db.ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    title = db.Column(
        db.String(255), default="Untitled Resume", nullable=False
    )
    template_id = db.Column(db.String(50), default="executive", nullable=False)
    status = db.Column(db.String(20), default="draft", nullable=False)
    target_role = db.Column(db.String(255), nullable=True)
    target_company = db.Column(db.String(255), nullable=True)
    ats_score = db.Column(db.Integer, nullable=True)
    views = db.Column(db.Integer, default=0, nullable=False)

    # Personal details stored with the resume document
    full_name = db.Column(db.String(150), nullable=True)
    email = db.Column(db.String(255), nullable=True)
    phone = db.Column(db.String(50), nullable=True)
    location = db.Column(db.String(150), nullable=True)
    website = db.Column(db.String(255), nullable=True)
    linkedin = db.Column(db.String(255), nullable=True)
    github = db.Column(db.String(255), nullable=True)
    headline = db.Column(db.String(255), nullable=True)
    summary = db.Column(db.Text, nullable=True)

    # Relationships
    user = db.relationship("User", back_populates="resumes")
    experiences = db.relationship(
        "Experience",
        back_populates="resume",
        cascade="all, delete-orphan",
        order_by="Experience.order_index"
    )
    educations = db.relationship(
        "Education",
        back_populates="resume",
        cascade="all, delete-orphan",
        order_by="Education.order_index"
    )
    projects = db.relationship(
        "Project",
        back_populates="resume",
        cascade="all, delete-orphan",
        order_by="Project.order_index"
    )
    skills = db.relationship(
        "Skill",
        back_populates="resume",
        cascade="all, delete-orphan",
        order_by="Skill.order_index"
    )

    def __repr__(self):
        return f"<Resume id={self.id} title='{self.title}'>"


class Experience(TimestampMixin, db.Model):
    """Work experience entry for a resume."""

    __tablename__ = "experiences"

    resume_id = db.Column(
        db.String(36),
        db.ForeignKey("resumes.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    company = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(200), nullable=False)
    start_date = db.Column(db.String(50), nullable=True)
    end_date = db.Column(db.String(50), nullable=True)
    is_current = db.Column(db.Boolean, default=False, nullable=False)
    location = db.Column(db.String(150), nullable=True)
    bullets = db.Column(db.JSON, default=list, nullable=False)
    order_index = db.Column(db.Integer, default=0, nullable=False)

    resume = db.relationship("Resume", back_populates="experiences")

    def __repr__(self):
        return f"<Experience {self.role} at {self.company}>"


class Education(TimestampMixin, db.Model):
    """Education credential entry for a resume."""

    __tablename__ = "educations"

    resume_id = db.Column(
        db.String(36),
        db.ForeignKey("resumes.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    institution = db.Column(db.String(200), nullable=False)
    degree = db.Column(db.String(150), nullable=True)
    field_of_study = db.Column(db.String(150), nullable=True)
    start_date = db.Column(db.String(50), nullable=True)
    end_date = db.Column(db.String(50), nullable=True)
    gpa = db.Column(db.String(20), nullable=True)
    honors = db.Column(db.String(255), nullable=True)
    order_index = db.Column(db.Integer, default=0, nullable=False)

    resume = db.relationship("Resume", back_populates="educations")

    def __repr__(self):
        return f"<Education {self.degree} at {self.institution}>"


class Project(TimestampMixin, db.Model):
    """Project portfolio entry for a resume."""

    __tablename__ = "projects"

    resume_id = db.Column(
        db.String(36),
        db.ForeignKey("resumes.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    technologies = db.Column(db.JSON, default=list, nullable=False)
    url = db.Column(db.String(255), nullable=True)
    github = db.Column(db.String(255), nullable=True)
    order_index = db.Column(db.Integer, default=0, nullable=False)

    resume = db.relationship("Resume", back_populates="projects")

    def __repr__(self):
        return f"<Project {self.name}>"


class Skill(TimestampMixin, db.Model):
    """Categorized skill grouping entry for a resume."""

    __tablename__ = "skills"

    resume_id = db.Column(
        db.String(36),
        db.ForeignKey("resumes.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    category = db.Column(db.String(100), nullable=False)
    skills = db.Column(db.JSON, default=list, nullable=False)
    order_index = db.Column(db.Integer, default=0, nullable=False)

    resume = db.relationship("Resume", back_populates="skills")

    def __repr__(self):
        return f"<Skill {self.category}>"
