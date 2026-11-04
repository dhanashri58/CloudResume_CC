"""Tests for structured logging, privacy, security monitoring, and health.

Verifies:
- Structured log formatting and ISO timestamp formatting.
- Redaction of sensitive tokens, passwords, and API keys.
- Request ID correlation via X-Request-ID headers.
- Health checks: /api/health, /api/health/live, /api/health/ready.
- Database connectivity failure masking (zero secret leaks).
- Security event logging: auth failure logging and alerts.
- Application Insights graceful inactive state when unconfigured.
"""
import logging
from unittest.mock import patch

from app.services.security_monitor import SecurityMonitor
from app.services.telemetry import TelemetryService
from app.utils.logging import SensitiveDataFilter, StructuredFormatter


# ─── 1. Structured Logging & Redaction Tests ───────────────────────────────


def test_sensitive_data_filter_redacts_credentials():
    """Verify SensitiveDataFilter redacts tokens, passwords, and keys."""
    privacy_filter = SensitiveDataFilter()

    # 1. Bearer token
    record1 = logging.LogRecord(
        name="test", level=logging.INFO, pathname=__file__, lineno=1,
        msg="Header Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIx",
        args=(), exc_info=None
    )
    privacy_filter.filter(record1)
    assert "Bearer [REDACTED]" in record1.msg
    assert "eyJhbGci" not in record1.msg

    # 2. Gemini API key
    record2 = logging.LogRecord(
        name="test", level=logging.INFO, pathname=__file__, lineno=2,
        msg="Gemini call key AIzaSyD1234567890abcdefghijklmnopqrstuvw",
        args=(), exc_info=None
    )
    privacy_filter.filter(record2)
    assert "[REDACTED_GEMINI_KEY]" in record2.msg
    assert "AIzaSyD" not in record2.msg

    # 3. Password
    record3 = logging.LogRecord(
        name="test", level=logging.INFO, pathname=__file__, lineno=3,
        msg="Connection failure: password=supersecretpass123 for db user",
        args=(), exc_info=None
    )
    privacy_filter.filter(record3)
    assert "password=[REDACTED]" in record3.msg
    assert "supersecretpass123" not in record3.msg


def test_structured_formatter_output():
    """Verify structured formatter includes UTC timestamp and context."""
    formatter = StructuredFormatter(
        "[%(utc_time)s] [%(levelname)s] [req=%(request_id)s] %(message)s"
    )
    record = logging.LogRecord(
        name="app.test", level=logging.INFO, pathname=__file__, lineno=10,
        msg="System booted successfully",
        args=(), exc_info=None
    )
    output = formatter.format(record)
    assert "[INFO]" in output
    assert "System booted successfully" in output
    assert "req=" in output


def test_request_id_correlation_propagation(client):
    """Verify X-Request-ID is propagated or generated in responses."""
    # 1. Custom incoming request ID is preserved
    resp1 = client.get(
        "/api/health", headers={"X-Request-ID": "custom-trace-id-1234"}
    )
    assert resp1.status_code == 200
    assert resp1.headers.get("X-Request-ID") == "custom-trace-id-1234"

    # 2. Generated request ID when none provided
    resp2 = client.get("/api/health")
    assert resp2.status_code == 200
    req_id = resp2.headers.get("X-Request-ID")
    assert req_id is not None
    assert req_id.startswith("req-")

    # 3. Server-Timing header contains request duration
    timing = resp2.headers.get("Server-Timing")
    assert timing is not None
    assert "total;dur=" in timing


# ─── 2. Health & Probe Tests ───────────────────────────────────────────────


def test_health_endpoints_live_and_ready(client):
    """Test /api/health/live (liveness) and /api/health/ready (readiness)."""
    # Liveness probe
    live_resp = client.get("/api/health/live")
    assert live_resp.status_code == 200
    live_data = live_resp.get_json()
    assert live_data["status"] == "alive"

    # Readiness probe
    ready_resp = client.get("/api/health/ready")
    assert ready_resp.status_code == 200
    ready_data = ready_resp.get_json()
    assert ready_data["status"] == "ready"


def test_health_endpoint_masks_database_exception(client):
    """Verify database exceptions do not expose raw error traces."""
    err_msg = "FATAL: password auth failed for user postgres"
    with patch(
        "app.extensions.db.session.execute",
        side_effect=Exception(err_msg),
    ):
        resp = client.get("/api/health")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["status"] == "degraded"
        assert data["database"]["status"] == "unreachable"
        # Ensure credentials/internal details are masked
        assert "password auth failed" not in data["database"]["message"]
        assert data["database"]["message"] == "Database connection failed"

        # Readiness probe returns 503 on DB unreachable
        ready_resp = client.get("/api/health/ready")
        assert ready_resp.status_code == 503
        ready_data = ready_resp.get_json()
        assert ready_data["status"] == "not_ready"


# ─── 3. Security Monitoring & Repeated Failure Tracking ───────────────────


def test_security_monitor_repeated_failures_alert():
    """Verify SecurityMonitor logs alert when failure threshold exceeded."""
    SecurityMonitor.reset()
    client_ip = "198.51.100.25"

    with patch("app.services.security_monitor.logger") as mock_logger:
        # Trigger 4 failures (below threshold of 5)
        for i in range(4):
            count = SecurityMonitor.record_auth_failure(
                reason="Invalid token",
                client_ip=client_ip,
                endpoint="/api/resumes",
            )
            assert count == i + 1

        mock_logger.warning.assert_called()
        mock_logger.error.assert_not_called()

        # 5th failure triggers security alert
        count5 = SecurityMonitor.record_auth_failure(
            reason="Invalid token",
            client_ip=client_ip,
            endpoint="/api/resumes",
        )
        assert count5 == 5
        mock_logger.error.assert_called_once()
        alert_msg = mock_logger.error.call_args[0][0]
        assert "REPEATED_AUTH_FAILURES" in alert_msg


def test_security_monitor_cross_user_denial_logged(client, user_a_headers):
    """Verify cross-user access attempts trigger audit event logging."""
    # User A creates resume
    resp = client.post(
        "/api/resumes",
        json={"title": "Private Resume"},
        headers=user_a_headers,
    )
    resume_id = resp.get_json()["id"]

    # User B headers attempting to access User A's resume
    user_b_headers = {"X-Dev-User-Email": "attacker.user@example.com"}

    with patch("app.services.security_monitor.logger") as mock_logger:
        get_resp = client.get(
            f"/api/resumes/{resume_id}", headers=user_b_headers
        )
        assert get_resp.status_code == 404

        # Verify cross-user denial was recorded
        mock_logger.warning.assert_called()
        found_audit = any(
            "CROSS_USER_DENIED" in str(call_arg)
            for call in mock_logger.warning.call_args_list
            for call_arg in call[0]
        )
        assert found_audit, "Expected CROSS_USER_DENIED audit log"


# ─── 4. Telemetry Unconfigured State ───────────────────────────────────────


def test_telemetry_unconfigured_fallback(app):
    """Verify TelemetryService remains disabled when unconfigured."""
    TelemetryService.reset()
    with patch.dict(app.config, {"APPLICATIONINSIGHTS_CONNECTION_STRING": ""}):
        enabled = TelemetryService.init_app(app)
        assert enabled is False
        assert TelemetryService.is_enabled() is False
