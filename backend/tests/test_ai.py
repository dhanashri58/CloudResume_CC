"""Unit and integration tests for AI Service and AI REST endpoints."""
import json
from unittest.mock import MagicMock, patch
from google.genai import errors as genai_errors
from app import create_app
from app.config import Config
from app.services.ai_service import AIService
from tests.conftest import TEST_PUBLIC_PEM, TEST_AUDIENCE


def test_ai_status_unconfigured(client, monkeypatch):
    """GET /api/ai/status reports available=False when API key is missing."""
    monkeypatch.setenv("GEMINI_API_KEY", "")
    response = client.get("/api/ai/status")
    assert response.status_code == 200
    data = response.get_json()
    assert data["available"] is False
    assert "not configured" in data["message"].lower()


def test_ai_status_configured(client, monkeypatch):
    """GET /api/ai/status reports available=True when API key is set."""
    monkeypatch.setenv("GEMINI_API_KEY", "test-api-key-12345")
    response = client.get("/api/ai/status")
    assert response.status_code == 200
    data = response.get_json()
    assert data["available"] is True
    assert "ready" in data["message"].lower()


def test_ai_endpoints_require_auth(client):
    """All modification endpoints require authentication."""
    endpoints = [
        "/api/ai/improve-summary",
        "/api/ai/improve-experience",
        "/api/ai/match-job",
        "/api/ai/chat",
    ]
    invalid_headers = {"Authorization": "Bearer invalid-or-expired-token"}
    for ep in endpoints:
        resp = client.post(ep, headers=invalid_headers, json={})
        assert resp.status_code == 401, f"{ep} did not enforce auth"


def test_ai_endpoints_return_503_when_no_api_key(
    client, user_a_headers, monkeypatch
):
    """AI endpoints return HTTP 503 when GEMINI_API_KEY is not configured."""
    monkeypatch.setenv("GEMINI_API_KEY", "")

    resp = client.post(
        "/api/ai/improve-summary",
        headers=user_a_headers,
        json={"summary": "Experienced software engineer with 5 years in AWS."}
    )
    assert resp.status_code == 503
    assert "not configured" in resp.get_json()["message"].lower()

    resp = client.post(
        "/api/ai/improve-experience",
        headers=user_a_headers,
        json={"text": "Worked on backend microservices with Python and Flask."}
    )
    assert resp.status_code == 503

    resp = client.post(
        "/api/ai/match-job",
        headers=user_a_headers,
        json={"job_description": "Looking for a Python backend engineer."}
    )
    assert resp.status_code == 503

    resp = client.post(
        "/api/ai/chat",
        headers=user_a_headers,
        json={"message": "How do I optimize my resume for cloud roles?"}
    )
    assert resp.status_code == 503


def test_improve_summary_validation(client, user_a_headers, monkeypatch):
    """Test input validation for improve-summary endpoint."""
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")

    # Too short (<10 chars)
    resp = client.post(
        "/api/ai/improve-summary",
        headers=user_a_headers,
        json={"summary": "Short"}
    )
    assert resp.status_code == 422
    assert "at least 10 characters" in str(resp.get_json()["details"])

    # Missing summary field
    resp = client.post(
        "/api/ai/improve-summary",
        headers=user_a_headers,
        json={}
    )
    assert resp.status_code == 422


def test_improve_summary_success(client, user_a_headers, monkeypatch):
    """Test successful summary improvement with mocked Gemini client."""
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")

    fake_response = MagicMock()
    fake_response.text = json.dumps({
        "improvedSummary": (
            "Results-driven Cloud Engineer with 5+ years architecting "
            "scalable systems on AWS and Azure."
        ),
        "keyChanges": [
            "Quantified years of experience",
            "Added high-impact action verbs",
        ]
    })

    with patch("google.genai.Client") as mock_client_cls:
        mock_instance = MagicMock()
        mock_client_cls.return_value = mock_instance
        mock_instance.models.generate_content.return_value = fake_response

        resp = client.post(
            "/api/ai/improve-summary",
            headers=user_a_headers,
            json={
                "summary": "I am a cloud engineer with 5 years of experience.",
                "targetRole": "Senior Cloud Architect"
            }
        )

        assert resp.status_code == 200
        data = resp.get_json()
        assert "Results-driven" in data["improvedSummary"]
        assert len(data["keyChanges"]) == 2
        assert data["originalSummary"] == (
            "I am a cloud engineer with 5 years of experience."
        )


def test_improve_experience_validation(client, user_a_headers, monkeypatch):
    """Test input validation for improve-experience endpoint."""
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")

    resp = client.post(
        "/api/ai/improve-experience",
        headers=user_a_headers,
        json={"text": "Dev"}
    )
    assert resp.status_code == 422


def test_improve_experience_success(client, user_a_headers, monkeypatch):
    """Test successful bullet point enhancement with mocked Gemini client."""
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")

    fake_response = MagicMock()
    fake_response.text = (
        "```json\n" + json.dumps({
            "improvedBullets": [
                "Architected RESTful microservices reducing API latency "
                "by 35%",
                "Engineered automated CI/CD pipelines deploying Docker"
            ],
            "tips": ["Quantify exact request volume handled"]
        }) + "\n```"
    )

    with patch("google.genai.Client") as mock_client_cls:
        mock_instance = MagicMock()
        mock_client_cls.return_value = mock_instance
        mock_instance.models.generate_content.return_value = fake_response

        resp = client.post(
            "/api/ai/improve-experience",
            headers=user_a_headers,
            json={
                "text": "Built backend services using Flask and Docker.",
                "roleTitle": "Software Engineer",
                "company": "Acme Corp"
            }
        )

        assert resp.status_code == 200
        data = resp.get_json()
        assert len(data["improvedBullets"]) == 2
        assert "Architected" in data["improvedBullets"][0]
        assert len(data["tips"]) == 1


def test_match_job_validation(client, user_a_headers, monkeypatch):
    """Test input validation for match-job endpoint."""
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")

    resp = client.post(
        "/api/ai/match-job",
        headers=user_a_headers,
        json={"job_description": "Too brief"}
    )
    assert resp.status_code == 422


def test_match_job_success(client, user_a_headers, monkeypatch):
    """Test job description matching with mocked Gemini client."""
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")

    fake_response = MagicMock()
    fake_response.text = json.dumps({
        "matchScore": 85,
        "matchingSkills": ["Python", "Docker", "PostgreSQL"],
        "missingSkills": ["Kubernetes", "Terraform"],
        "suggestions": [
            "Highlight any container orchestration experience",
            "Mention infrastructure as code exposure"
        ],
        "disclaimer": "AI match is advisory only."
    })

    with patch("google.genai.Client") as mock_client_cls:
        mock_instance = MagicMock()
        mock_client_cls.return_value = mock_instance
        mock_instance.models.generate_content.return_value = fake_response

        resp = client.post(
            "/api/ai/match-job",
            headers=user_a_headers,
            json={
                "job_description": (
                    "Looking for a Senior Python Developer with Docker, "
                    "Kubernetes, Terraform and PostgreSQL."
                ),
                "skills": ["Python", "Docker", "PostgreSQL"],
                "resume_summary": "Full stack engineer building cloud systems."
            }
        )

        assert resp.status_code == 200
        data = resp.get_json()
        assert data["matchScore"] == 85
        assert "Python" in data["matchingSkills"]
        assert "Kubernetes" in data["missingSkills"]
        assert len(data["suggestions"]) == 2


def test_match_job_score_clamping():
    """Verify that match score out of bounds is clamped between 0 and 100."""
    with patch("google.genai.Client") as mock_client_cls:
        mock_instance = MagicMock()
        mock_client_cls.return_value = mock_instance
        fake_response = MagicMock()
        fake_response.text = json.dumps({
            "matchScore": 150,
            "matchingSkills": ["Python"],
            "missingSkills": [],
            "suggestions": []
        })
        mock_instance.models.generate_content.return_value = fake_response

        with patch.dict("os.environ", {"GEMINI_API_KEY": "test-key"}):
            result = AIService.match_job(
                job_description="We need a Python developer."
            )
            assert result["matchScore"] == 100


def test_chat_success(client, user_a_headers, monkeypatch):
    """Test chat endpoint with conversation history and resume context."""
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")

    fake_response = MagicMock()
    fake_response.text = (
        "To make your resume more ATS-friendly, use standard section titles "
        "and clear bullet points with measurable impact."
    )

    with patch("google.genai.Client") as mock_client_cls:
        mock_instance = MagicMock()
        mock_client_cls.return_value = mock_instance
        mock_instance.models.generate_content.return_value = fake_response

        resp = client.post(
            "/api/ai/chat",
            headers=user_a_headers,
            json={
                "message": "How do I optimize my bullets for ATS?",
                "history": [
                    {"role": "user", "content": "Hello!"},
                    {"role": "assistant", "content": "Hi, how can I help?"}
                ],
                "resumeContext": {
                    "title": "Software Engineer Resume",
                    "skills": ["Python", "Flask"]
                }
            }
        )

        assert resp.status_code == 200
        data = resp.get_json()
        assert "ATS-friendly" in data["reply"]


def test_ai_gemini_error_returns_500(client, user_a_headers, monkeypatch):
    """Test that Gemini API errors return HTTP 500 with friendly message."""
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")

    with patch("google.genai.Client") as mock_client_cls:
        mock_instance = MagicMock()
        mock_client_cls.return_value = mock_instance
        mock_instance.models.generate_content.side_effect = (
            genai_errors.APIError(
                500, {"error": {"message": "Service unavailable upstream"}}
            )
        )

        resp = client.post(
            "/api/ai/improve-summary",
            headers=user_a_headers,
            json={"summary": "Experienced engineer with AWS experience."}
        )

        assert resp.status_code == 500
        assert "Gemini API error" in resp.get_json()["message"]


def test_ai_chat_development_auth_success(client, monkeypatch):
    """Verify that development authentication succeeds on AI chat route."""
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    fake_response = MagicMock()
    fake_response.text = "Hello! I am ready to enhance your cloud resume."

    with patch("google.genai.Client") as mock_client_cls:
        mock_instance = MagicMock()
        mock_client_cls.return_value = mock_instance
        mock_instance.models.generate_content.return_value = fake_response

        dev_headers = {
            "X-Dev-User-Email": "alex.mercer@cloudresume.ai",
            "Content-Type": "application/json",
        }
        resp = client.post(
            "/api/ai/chat",
            headers=dev_headers,
            json={"message": "Can you check my resume summary?"}
        )

        assert resp.status_code == 200
        data = resp.get_json()
        assert "Hello!" in data["reply"]


def test_ai_endpoints_reject_missing_authentication(client):
    """Verify endpoints reject requests with completely missing auth."""
    endpoints = [
        "/api/ai/improve-summary",
        "/api/ai/improve-experience",
        "/api/ai/match-job",
        "/api/ai/chat",
    ]
    for ep in endpoints:
        resp = client.post(ep, headers={}, json={"message": "test"})
        assert resp.status_code == 401
        data = resp.get_json()
        assert data["error"] == "Unauthorized"
        assert "Missing authentication" in data["message"]


def test_ai_endpoints_reject_dev_auth_when_disabled():
    """Verify that when DEV_AUTH_ENABLED is False, dev headers are rejected."""
    class DisabledDevConfig(Config):
        TESTING = True
        DEV_AUTH_ENABLED = False
        SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"

    app_instance = create_app(DisabledDevConfig)
    c = app_instance.test_client()

    dev_headers = {
        "X-Dev-User-Email": "alex.mercer@cloudresume.ai",
        "Content-Type": "application/json",
    }
    resp = c.post(
        "/api/ai/chat",
        headers=dev_headers,
        json={"message": "Test question"}
    )
    assert resp.status_code == 401
    data = resp.get_json()
    assert data["error"] == "Unauthorized"
    assert "Missing Authorization header" in data["message"]


def test_ai_endpoints_reject_dev_auth_in_production():
    """Verify production mode strictly refuses X-Dev-User-Email on AI."""
    class ProdConfig(Config):
        TESTING = True
        ENV = "production"
        DEV_AUTH_ENABLED = True
        SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
        AZURE_ENTRA_PUBLIC_KEY = TEST_PUBLIC_PEM
        AZURE_ENTRA_AUDIENCE = TEST_AUDIENCE

    prod_app = create_app(ProdConfig)
    c = prod_app.test_client()

    dev_hdr = {
        "X-Dev-User-Email": "attacker@example.com",
        "Content-Type": "application/json",
    }
    resp = c.post(
        "/api/ai/chat",
        headers=dev_hdr,
        json={"message": "Test message"}
    )
    assert resp.status_code == 401
    assert resp.get_json()["error"] == "Unauthorized"


def test_ai_chat_with_entra_bearer_token(client, make_jwt, monkeypatch):
    """Verify that normal Entra ID RS256 Bearer tokens authenticate AI chat."""
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")

    token = make_jwt(
        oid="entra-ai-user-123",
        email="entra.user@cloudresume.ai",
        name="Entra User"
    )

    fake_response = MagicMock()
    fake_response.text = "Here is advice tailored for your Entra profile."

    with patch("google.genai.Client") as mock_client_cls:
        mock_instance = MagicMock()
        mock_client_cls.return_value = mock_instance
        mock_instance.models.generate_content.return_value = fake_response

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }
        resp = client.post(
            "/api/ai/chat",
            headers=headers,
            json={"message": "Help me with AWS certification bullets"}
        )

        assert resp.status_code == 200
        data = resp.get_json()
        assert "Here is advice" in data["reply"]


def test_ai_response_time_and_server_timing(
    client, user_a_headers, monkeypatch
):
    """Verify responses include responseTimeMs and Server-Timing header."""
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    fake_response = MagicMock()
    fake_response.text = json.dumps({
        "improvedSummary": "Optimized summary text.",
        "keyChanges": ["Sharpened tone"]
    })

    with patch("google.genai.Client") as mock_client_cls:
        mock_instance = MagicMock()
        mock_client_cls.return_value = mock_instance
        mock_instance.models.generate_content.return_value = fake_response

        resp = client.post(
            "/api/ai/improve-summary",
            headers=user_a_headers,
            json={"summary": "Experienced engineer with AWS experience."}
        )

        assert resp.status_code == 200
        assert "Server-Timing" in resp.headers
        assert "gemini;dur=" in resp.headers["Server-Timing"]
        data = resp.get_json()
        assert "responseTimeMs" in data
        assert isinstance(data["responseTimeMs"], (int, float))


def test_ai_timeout_returns_504(client, user_a_headers, monkeypatch):
    """Verify that timeout errors map to HTTP 504 Gateway Timeout."""
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")

    with patch("google.genai.Client") as mock_client_cls:
        mock_instance = MagicMock()
        mock_client_cls.return_value = mock_instance
        mock_instance.models.generate_content.side_effect = (
            TimeoutError("The read operation timed out")
        )

        resp = client.post(
            "/api/ai/chat",
            headers=user_a_headers,
            json={"message": "Long query causing timeout"}
        )

        assert resp.status_code == 504
        data = resp.get_json()
        assert data["error"] == "Gateway Timeout"
        assert "timed out" in data["message"].lower()


def test_ai_retry_on_429_rate_limit(client, user_a_headers, monkeypatch):
    """Verify that transient 429 rate limit errors retry successfully."""
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    fake_response = MagicMock()
    fake_response.text = "Success on retry!"

    with patch("google.genai.Client") as mock_client_cls:
        mock_instance = MagicMock()
        mock_client_cls.return_value = mock_instance
        # Fail once with 429, then succeed on retry
        mock_instance.models.generate_content.side_effect = [
            genai_errors.APIError(
                429, {"error": {"message": "Rate limit exceeded"}}
            ),
            fake_response,
        ]

        with patch("time.sleep") as mock_sleep:
            resp = client.post(
                "/api/ai/chat",
                headers=user_a_headers,
                json={"message": "Retry test"}
            )
            assert resp.status_code == 200
            assert mock_sleep.called
            data = resp.get_json()
            assert data["reply"] == "Success on retry!"


def test_ai_no_retry_on_400_bad_request(client, user_a_headers, monkeypatch):
    """Verify non-retryable 400 errors fail immediately without retry."""
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")

    with patch("google.genai.Client") as mock_client_cls:
        mock_instance = MagicMock()
        mock_client_cls.return_value = mock_instance
        mock_instance.models.generate_content.side_effect = (
            genai_errors.APIError(
                400, {"error": {"message": "Invalid argument provided"}}
            )
        )

        with patch("time.sleep") as mock_sleep:
            resp = client.post(
                "/api/ai/chat",
                headers=user_a_headers,
                json={"message": "Invalid query test"}
            )
            assert resp.status_code == 500
            assert not mock_sleep.called


def test_ai_client_timeout_configured_in_ms(monkeypatch):
    """Verify AIService._get_client configures timeout in milliseconds."""
    monkeypatch.setenv("GEMINI_API_KEY", "test-key-valid")
    monkeypatch.setenv("GEMINI_TIMEOUT_SECONDS", "18.5")

    with patch("google.genai.Client") as mock_client_cls:
        AIService._get_client()
        assert mock_client_cls.called
        kwargs = mock_client_cls.call_args[1]
        http_options = kwargs["http_options"]
        assert http_options.timeout == 18500


def test_ai_deadline_exceeded_returns_504(client, user_a_headers, monkeypatch):
    """Verify 504 DEADLINE_EXCEEDED ServerError maps to HTTP 504."""
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")

    with patch("google.genai.Client") as mock_client_cls:
        mock_instance = MagicMock()
        mock_client_cls.return_value = mock_instance
        err_response = MagicMock()
        err_response.status_code = 504
        err_response.headers = {}
        err_response.text = (
            '{"error": {"code": 504, "message": "Deadline expired before '
            'operation could complete.", "status": "DEADLINE_EXCEEDED"}}'
        )
        mock_instance.models.generate_content.side_effect = (
            genai_errors.ServerError(504, err_response.text)
        )

        resp = client.post(
            "/api/ai/chat",
            headers=user_a_headers,
            json={"message": "Query that hits server deadline"}
        )

        assert resp.status_code == 504
        data = resp.get_json()
        assert data["error"] == "Gateway Timeout"
        assert "timed out" in data["message"].lower()


def test_ai_request_id_correlation_header(client, user_a_headers, monkeypatch):
    """Verify X-Request-ID is preserved and echoed in responses."""
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    fake_response = MagicMock()
    fake_response.text = "Hello with correlation ID!"

    with patch("google.genai.Client") as mock_client_cls:
        mock_instance = MagicMock()
        mock_client_cls.return_value = mock_instance
        mock_instance.models.generate_content.return_value = fake_response

        headers = dict(user_a_headers)
        headers["X-Request-ID"] = "test-corr-id-12345"

        resp = client.post(
            "/api/ai/chat",
            headers=headers,
            json={"message": "Testing correlation ID"}
        )

        assert resp.status_code == 200
        assert resp.headers.get("X-Request-ID") == "test-corr-id-12345"
