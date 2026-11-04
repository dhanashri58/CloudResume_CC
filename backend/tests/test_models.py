"""Unit tests for database models and relationships."""
from app.extensions import db
from app.models.user import User, UserProfile
from app.models.resume import Resume, Experience, Education, Project, Skill


def test_user_and_profile_relationship(app):
    """Test User and UserProfile 1:1 relationship and cascading behavior."""
    user = User(email="test.user@example.com")
    profile = UserProfile(
        user=user,
        first_name="Jane",
        last_name="Doe",
        headline="Principal Cloud Architect"
    )
    db.session.add(user)
    db.session.add(profile)
    db.session.commit()

    assert user.id is not None
    assert profile.id is not None
    assert profile.full_name == "Jane Doe"
    assert user.profile.first_name == "Jane"
    assert profile.user.email == "test.user@example.com"

    # Test cascade delete: removing user should remove profile
    user_id = user.id
    profile_id = profile.id
    db.session.delete(user)
    db.session.commit()

    assert db.session.get(User, user_id) is None
    assert db.session.get(UserProfile, profile_id) is None


def test_resume_and_child_entities_cascade(app):
    """Test Resume relationship with Experience, Education, Project, Skill."""
    user = User(email="author@example.com")
    db.session.add(user)
    db.session.commit()

    resume = Resume(
        user_id=user.id,
        title="Full Stack Engineer CV",
        template_id="horizon",
        status="active",
        summary="Experienced engineer."
    )
    db.session.add(resume)
    db.session.flush()

    exp = Experience(
        resume=resume,
        company="TechCorp",
        role="Senior Engineer",
        bullets=["Shipped major feature", "Reduced latency"]
    )
    ed = Education(
        resume=resume,
        institution="University of Technology",
        degree="B.S.",
        field_of_study="Computer Science"
    )
    proj = Project(
        resume=resume,
        name="Open Cloud",
        technologies=["Python", "React"]
    )
    sk = Skill(
        resume=resume,
        category="Languages",
        skills=["Python", "TypeScript", "SQL"]
    )
    db.session.add_all([exp, ed, proj, sk])
    db.session.commit()

    assert len(resume.experiences) == 1
    assert len(resume.educations) == 1
    assert len(resume.projects) == 1
    assert len(resume.skills) == 1
    expected_bullets = ["Shipped major feature", "Reduced latency"]
    assert resume.experiences[0].bullets == expected_bullets
    assert resume.skills[0].skills == ["Python", "TypeScript", "SQL"]

    # Deleting resume must cascade delete child records
    exp_id = exp.id
    ed_id = ed.id
    proj_id = proj.id
    sk_id = sk.id
    resume_id = resume.id

    db.session.delete(resume)
    db.session.commit()

    assert db.session.get(Resume, resume_id) is None
    assert db.session.get(Experience, exp_id) is None
    assert db.session.get(Education, ed_id) is None
    assert db.session.get(Project, proj_id) is None
    assert db.session.get(Skill, sk_id) is None
