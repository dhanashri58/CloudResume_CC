"""Unit & integration tests for PDF generation and export endpoint."""
from unittest.mock import patch
from app.extensions import db
from app.models.user import User
from app.models.resume import Resume, Experience, Education, Project, Skill
from app.services.pdf_service import PDFService, PDFGenerationError


def test_pdf_service_successful_generation(app):
    """Test generating a full-featured resume PDF in memory."""
    user = User(
        email="alex.rivera@example.com",
        auth_provider_id="oid-alex-rivera-1",
    )
    db.session.add(user)
    db.session.commit()

    resume = Resume(
        user_id=user.id,
        title="Full Stack Cloud Resume",
        template_id="horizon",
        full_name="Alex Rivera",
        headline="Senior Cloud Solutions Architect",
        email="alex.rivera@example.com",
        phone="+1 (555) 234-5678",
        location="Seattle, WA",
        linkedin="linkedin.com/in/alexrivera",
        github="github.com/alexrivera",
        website="https://alexrivera.dev",
        summary=(
            "Cloud architect with 8+ years designing scalable AWS "
            "architectures."
        ),
    )
    db.session.add(resume)
    db.session.flush()

    exp = Experience(
        resume_id=resume.id,
        company="TechCorp Solutions",
        role="Principal Cloud Engineer",
        start_date="2021",
        end_date="Present",
        is_current=True,
        location="Seattle, WA",
        bullets=[
            "Architected multi-region serverless API handling 10M req/day.",
            "Cut AWS cloud costs by 35% via rightsizing and Spot instances.",
        ],
        order_index=0,
    )
    edu = Education(
        resume_id=resume.id,
        institution="University of Washington",
        degree="B.S.",
        field_of_study="Computer Science",
        start_date="2013",
        end_date="2017",
        gpa="3.85",
        honors="Cum Laude",
        order_index=0,
    )
    sk = Skill(
        resume_id=resume.id,
        category="Cloud & DevOps",
        skills=["AWS", "Terraform", "Docker", "Kubernetes", "Python"],
        order_index=0,
    )
    proj = Project(
        resume_id=resume.id,
        name="Automated Resume Scanner",
        description="Built automated ATS scanner using NLP and Python.",
        technologies=["Python", "FastAPI", "React", "PostgreSQL"],
        url="https://scanner.example.com",
        github="github.com/alexrivera/scanner",
        order_index=0,
    )
    db.session.add_all([exp, edu, sk, proj])
    db.session.commit()

    pdf_buffer = PDFService.generate_resume_pdf(resume)
    assert pdf_buffer is not None
    data = pdf_buffer.getvalue()

    # Validate PDF signature and size
    assert data.startswith(b"%PDF")
    assert len(data) > 1000

    # Validate content rendered into PDF stream
    text_content = data.decode("latin1", errors="ignore")
    assert "Alex Rivera" in text_content
    assert "TechCorp Solutions" in text_content
    assert "University of Washington" in text_content


def test_pdf_content_type_and_signature(client, user_a_headers):
    """Test POST /api/resumes/<id>/export-pdf returns valid PDF attachment."""
    # 1. Create a resume
    create_payload = {
        "title": "Production Backend Resume",
        "templateId": "executive",
        "personalInfo": {
            "fullName": "Jane Doe",
            "email": "jane.doe@cloudresume.ai",
            "headline": "Lead Python Engineer",
        },
        "summary": "Expert in distributed backend systems and PostgreSQL.",
    }
    create_resp = client.post(
        "/api/resumes", json=create_payload, headers=user_a_headers
    )
    assert create_resp.status_code == 201
    resume_id = create_resp.get_json()["id"]

    # 2. Export via POST
    export_resp = client.post(
        f"/api/resumes/{resume_id}/export-pdf", headers=user_a_headers
    )
    assert export_resp.status_code == 200
    assert export_resp.headers["Content-Type"] == "application/pdf"
    assert "attachment" in export_resp.headers["Content-Disposition"]
    assert "Jane_Doe_Resume.pdf" in export_resp.headers["Content-Disposition"]
    assert export_resp.data.startswith(b"%PDF")


def test_pdf_export_get_also_supported(client, user_a_headers):
    """Test GET /api/resumes/<id>/export-pdf also delivers valid PDF."""
    create_resp = client.post(
        "/api/resumes",
        json={"title": "Get Method Resume"},
        headers=user_a_headers,
    )
    resume_id = create_resp.get_json()["id"]

    get_resp = client.get(
        f"/api/resumes/{resume_id}/export-pdf", headers=user_a_headers
    )
    assert get_resp.status_code == 200
    assert get_resp.headers["Content-Type"] == "application/pdf"
    assert get_resp.data.startswith(b"%PDF")


def test_pdf_export_missing_resume_returns_404(client, user_a_headers):
    """Test export request for non-existent resume returns HTTP 404."""
    resp = client.post(
        "/api/resumes/non-existent-uuid-9999/export-pdf",
        headers=user_a_headers,
    )
    assert resp.status_code == 404
    data = resp.get_json()
    assert data["error"] == "Not Found"
    assert "not found" in data["message"].lower()


def test_pdf_export_unauthorized_returns_401(client):
    """Test exporting without authentication header returns HTTP 401."""
    resp = client.post("/api/resumes/any-resume-id/export-pdf")
    assert resp.status_code == 401


def test_pdf_export_cross_user_denial(client, user_a_headers, user_b_headers):
    """Test that User B cannot export User A's private resume (HTTP 404)."""
    # User A creates a private resume
    create_resp = client.post(
        "/api/resumes",
        json={"title": "User A Proprietary Resume"},
        headers=user_a_headers,
    )
    assert create_resp.status_code == 201
    resume_id = create_resp.get_json()["id"]

    # User B attempts to export User A's resume
    b_resp = client.post(
        f"/api/resumes/{resume_id}/export-pdf",
        headers=user_b_headers,
    )
    assert b_resp.status_code == 404
    assert "not found" in b_resp.get_json()["message"].lower()


def test_pdf_service_optional_fields_missing(app):
    """Test that a resume with all optional fields missing renders cleanly."""
    user = User(
        email="sam.solo@example.com",
        auth_provider_id="oid-sam-solo",
    )
    db.session.add(user)
    db.session.commit()

    sparse_resume = Resume(
        user_id=user.id,
        title="Minimal Resume",
        template_id="clarity",
        full_name="Sam Solo",
        # All other fields None
        email=None,
        phone=None,
        location=None,
        summary=None,
    )
    db.session.add(sparse_resume)
    db.session.commit()

    pdf_buffer = PDFService.generate_resume_pdf(sparse_resume)
    assert pdf_buffer is not None
    assert pdf_buffer.getvalue().startswith(b"%PDF")


def test_pdf_service_multi_page_generation(app):
    """Test that long resumes span multiple pages without error."""
    user = User(
        email="morgan.stanley@example.com",
        auth_provider_id="oid-morgan-stanley",
    )
    db.session.add(user)
    db.session.commit()

    long_resume = Resume(
        user_id=user.id,
        title="Extensive Senior Executive Resume",
        template_id="executive",
        full_name="Dr. Morgan Stanley",
        headline="Distinguished Vice President of Engineering",
        summary=(
            "Over 25 years of technology leadership across Fortune 500." * 5
        ),
    )
    db.session.add(long_resume)
    db.session.flush()

    # Add 12 distinct experience entries with multiple bullets to overflow
    for i in range(12):
        exp = Experience(
            resume_id=long_resume.id,
            company=f"Enterprise Technology Corp #{i}",
            role=f"Vice President of Engineering {i}",
            start_date=f"{2010 + i}",
            end_date=f"{2011 + i}",
            is_current=(i == 11),
            location="San Francisco, CA",
            bullets=[
                f"Led team of 150+ engineers for project {i}.",
                f"Delivered {i * 10}M revenue via cloud platform.",
                f"Standardized microservices across {i + 5} repos.",
            ],
            order_index=i,
        )
        db.session.add(exp)

    db.session.commit()

    pdf_buffer = PDFService.generate_resume_pdf(long_resume)
    assert pdf_buffer is not None
    data = pdf_buffer.getvalue()
    assert data.startswith(b"%PDF")

    # Verify that multi-page footer page count exists
    content = data.decode("latin1", errors="ignore")
    assert "Page 1 of" in content
    assert "Page 2 of" in content


def test_pdf_service_unsupported_template_fallback(app):
    """Test that an unknown template_id safely falls back to executive."""
    user = User(
        email="taylor.swift@example.com",
        auth_provider_id="oid-taylor-swift",
    )
    db.session.add(user)
    db.session.commit()

    resume = Resume(
        user_id=user.id,
        title="Custom Template Resume",
        template_id="unsupported_neon_template_999",
        full_name="Taylor Swift",
        headline="Lead Audio Architect",
    )
    db.session.add(resume)
    db.session.commit()

    pdf_buffer = PDFService.generate_resume_pdf(resume)
    assert pdf_buffer is not None
    assert pdf_buffer.getvalue().startswith(b"%PDF")


def test_pdf_service_safe_filename():
    """Test get_safe_filename produces clean, filesystem/URL safe names."""
    r1 = Resume(full_name="John Doe, Jr.")
    assert PDFService.get_safe_filename(r1) == "John_Doe_Jr_Resume.pdf"

    r2 = Resume(full_name="Dr. Sarah O'Connor-Smith")
    assert (
        PDFService.get_safe_filename(r2) == "Dr_Sarah_OConnor_Smith_Resume.pdf"
    )

    r3 = Resume(full_name="", title="Cloud & DevOps Engineer / Architect")
    assert (
        PDFService.get_safe_filename(r3)
        == "Cloud_DevOps_Engineer_Architect_Resume.pdf"
    )

    r4 = Resume(full_name=None, title=None)
    assert PDFService.get_safe_filename(r4) == "Resume_Resume.pdf"


def test_pdf_generation_failure_handling(client, user_a_headers):
    """Test that PDFGenerationError maps to HTTP 500 without trace leaks."""
    create_resp = client.post(
        "/api/resumes",
        json={"title": "Error Handling Resume"},
        headers=user_a_headers,
    )
    resume_id = create_resp.get_json()["id"]

    with patch(
        "app.services.pdf_service.PDFService.generate_resume_pdf"
    ) as mock_gen:
        mock_gen.side_effect = PDFGenerationError("ReportLab internal failure")

        resp = client.post(
            f"/api/resumes/{resume_id}/export-pdf", headers=user_a_headers
        )
        assert resp.status_code == 500
        data = resp.get_json()
        assert data["error"] == "PDF Generation Error"
        assert "ReportLab internal failure" in data["message"]
