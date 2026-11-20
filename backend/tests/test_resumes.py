"""Integration tests for Resume REST APIs and user ownership isolation."""


def test_create_and_get_resume(client, user_a_headers):
    """Test creating a new resume and fetching full details."""
    payload = {
        "title": "Cloud Architect Resume",
        "templateId": "horizon",
        "status": "draft",
        "targetRole": "Cloud Architect",
        "personalInfo": {
            "fullName": "Alice Johnson",
            "email": "alice@example.com",
            "phone": "+1-555-0199",
            "location": "Seattle, WA"
        },
        "summary": "Proven track record designing scalable cloud systems.",
        "experience": [
            {
                "company": "Cloud Corp",
                "role": "Lead Architect",
                "startDate": "2021",
                "endDate": "Present",
                "current": True,
                "location": "Seattle, WA",
                "bullets": [
                    "Designed multi-region topology",
                    "Cut cloud costs"
                ]
            }
        ],
        "education": [
            {
                "institution": "University of Washington",
                "degree": "MS",
                "field": "Software Engineering",
                "startDate": "2018",
                "endDate": "2020"
            }
        ],
        "projects": [
            {
                "name": "CloudResumeAI",
                "description": "Production resume builder",
                "technologies": ["Flask", "React", "PostgreSQL"]
            }
        ],
        "skills": [
            {
                "category": "Cloud & DevOps",
                "skills": ["Azure", "Docker", "Terraform", "Kubernetes"]
            }
        ]
    }

    # Create
    create_resp = client.post(
        "/api/resumes", json=payload, headers=user_a_headers
    )
    assert create_resp.status_code == 201
    created_data = create_resp.get_json()
    assert created_data["id"] is not None
    assert created_data["title"] == "Cloud Architect Resume"
    assert created_data["templateId"] == "horizon"
    assert len(created_data["experience"]) == 1
    assert created_data["experience"][0]["company"] == "Cloud Corp"
    assert len(created_data["skills"]) == 1

    resume_id = created_data["id"]

    # Fetch
    get_resp = client.get(f"/api/resumes/{resume_id}", headers=user_a_headers)
    assert get_resp.status_code == 200
    detail = get_resp.get_json()
    assert detail["id"] == resume_id
    assert detail["personalInfo"]["fullName"] == "Alice Johnson"
    expected_summary = "Proven track record designing scalable cloud systems."
    assert detail["summary"] == expected_summary


def test_list_resumes(client, user_a_headers):
    """Test listing user resumes returns summary format."""
    p1 = {"title": "Resume 1", "templateId": "executive"}
    p2 = {"title": "Resume 2", "templateId": "clarity"}
    client.post("/api/resumes", json=p1, headers=user_a_headers)
    client.post("/api/resumes", json=p2, headers=user_a_headers)

    resp = client.get("/api/resumes", headers=user_a_headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["count"] == 2
    titles = [r["title"] for r in data["resumes"]]
    assert "Resume 1" in titles
    assert "Resume 2" in titles


def test_update_resume(client, user_a_headers):
    """Test updating existing resume fields."""
    create_resp = client.post(
        "/api/resumes", json={"title": "Initial Title"}, headers=user_a_headers
    )
    resume_id = create_resp.get_json()["id"]

    update_payload = {
        "title": "Updated Title",
        "status": "active",
        "targetRole": "Principal Engineer",
        "summary": "Updated summary text."
    }
    update_resp = client.put(
        f"/api/resumes/{resume_id}",
        json=update_payload,
        headers=user_a_headers
    )
    assert update_resp.status_code == 200
    updated_data = update_resp.get_json()
    assert updated_data["title"] == "Updated Title"
    assert updated_data["status"] == "active"
    assert updated_data["summary"] == "Updated summary text."


def test_delete_resume(client, user_a_headers):
    """Test deleting resume."""
    create_resp = client.post(
        "/api/resumes", json={"title": "To Delete"}, headers=user_a_headers
    )
    resume_id = create_resp.get_json()["id"]

    del_resp = client.delete(
        f"/api/resumes/{resume_id}", headers=user_a_headers
    )
    assert del_resp.status_code == 200

    get_resp = client.get(f"/api/resumes/{resume_id}", headers=user_a_headers)
    assert get_resp.status_code == 404


def test_user_ownership_isolation(client, user_a_headers, user_b_headers):
    """Test that User B cannot access, modify, or delete User A's resume."""
    create_resp = client.post(
        "/api/resumes",
        json={"title": "User A Private Resume"},
        headers=user_a_headers
    )
    resume_id = create_resp.get_json()["id"]

    # User B attempts to read
    b_get = client.get(f"/api/resumes/{resume_id}", headers=user_b_headers)
    assert b_get.status_code == 404

    # User B attempts to update
    b_put = client.put(
        f"/api/resumes/{resume_id}",
        json={"title": "Hacked Title"},
        headers=user_b_headers
    )
    assert b_put.status_code == 404

    # User B attempts to delete
    b_del = client.delete(f"/api/resumes/{resume_id}", headers=user_b_headers)
    assert b_del.status_code == 404

    # User A can still access untouched resume
    a_get = client.get(f"/api/resumes/{resume_id}", headers=user_a_headers)
    assert a_get.status_code == 200
    assert a_get.get_json()["title"] == "User A Private Resume"


def test_validation_error_handling(client, user_a_headers):
    """Test that invalid payload returns 422 with structured details."""
    invalid_payload = {
        "title": "",  # min_length=1
        "status": "invalid_status_enum"
    }
    resp = client.post(
        "/api/resumes", json=invalid_payload, headers=user_a_headers
    )
    assert resp.status_code == 422
    data = resp.get_json()
    assert data["error"] == "Validation Error"
    assert "details" in data


def test_upload_and_optimize_json_and_file(client):
    """Test /api/resumes/upload-optimize endpoint with json and multipart file."""
    import io

    # 1. Test JSON payload
    resp = client.post(
        "/api/resumes/upload-optimize",
        json={"raw_text": "Aarav Sharma\naarav@example.com\nPython, Cloud Run"}
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["success"] is True
    assert "resume" in data
    assert "personal_info" in data["resume"]

    # 2. Test multipart file upload
    file_bytes = io.BytesIO(b"Candidate Name\nSoftware Engineer\ncontact@example.com")
    resp_file = client.post(
        "/api/resume/upload-optimize",
        data={"file": (file_bytes, "test_resume.txt")},
        content_type="multipart/form-data"
    )
    assert resp_file.status_code == 200
    file_data = resp_file.get_json()
    assert file_data["success"] is True
    assert file_data["filename"] == "test_resume.txt"
    assert "resume" in file_data
