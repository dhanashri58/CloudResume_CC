"""Health check and dependency probe routes for CloudResumeAI.

Provides:
- GET /api/health: Full component health status (DB, storage, version, env).
- GET /api/health/live: Lightweight container liveness probe (HTTP 200).
- GET /api/health/ready: Dependency readiness probe (HTTP 200 or 503).
"""
from datetime import datetime, timezone
import logging
import os
from flask import Blueprint, current_app, jsonify
from sqlalchemy import text

logger = logging.getLogger(__name__)

health_bp = Blueprint("health", __name__)


def check_db_connectivity() -> dict:
    """Safely check if DB is reachable without exposing credentials."""
    db_url = (
        current_app.config.get("SQLALCHEMY_DATABASE_URI")
        or current_app.config.get("DATABASE_URL", "")
    )
    if not db_url or "placeholder" in db_url:
        return {
            "status": "unconfigured",
            "message": "Database URL not configured or using placeholder",
        }

    try:
        from app.extensions import db

        db.session.execute(text("SELECT 1"))
        return {
            "status": "connected",
            "message": "PostgreSQL connection successful",
        }
    except Exception as exc:
        logger.error("Database connectivity check failed: %s", str(exc))
        return {
            "status": "unreachable",
            "message": "Database connection failed",
        }


def check_storage_status() -> dict:
    """Safely check object storage configuration without leaking keys."""
    mode = str(
        current_app.config.get("AZURE_STORAGE_MODE", "local")
    ).lower()

    if mode == "azure":
        account = current_app.config.get("AZURE_STORAGE_ACCOUNT_NAME", "")
        conn_str = current_app.config.get(
            "AZURE_STORAGE_CONNECTION_STRING", ""
        )
        container = current_app.config.get(
            "AZURE_STORAGE_CONTAINER_NAME", "cloudresumeai-resumes"
        )
        is_configured = bool(account or conn_str)
        return {
            "mode": "azure",
            "status": "configured" if is_configured else "unconfigured",
            "container": container,
        }

    # Local filesystem mode
    local_dir = current_app.config.get(
        "LOCAL_STORAGE_DIR",
        os.path.join(
            os.path.dirname(
                os.path.dirname(
                    os.path.dirname(os.path.abspath(__file__))
                )
            ),
            "storage",
            "blobs",
        ),
    )
    is_ready = os.path.isdir(local_dir) or os.access(
        os.path.dirname(local_dir), os.W_OK
    )
    return {
        "mode": "local",
        "status": "configured" if is_ready else "degraded",
    }


@health_bp.route("/health", methods=["GET"])
def health_check():
    """Comprehensive health endpoint verifying all service dependencies."""
    db_status = check_db_connectivity()
    storage_status = check_storage_status()

    is_degraded = db_status.get("status") == "unreachable"
    overall_status = "degraded" if is_degraded else "healthy"

    response_data = {
        "status": overall_status,
        "service": "cloudresumeai-backend",
        "version": "0.1.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "environment": current_app.config.get("ENV", "development"),
        "database": db_status,
        "storage": storage_status,
    }

    return jsonify(response_data), 200


@health_bp.route("/health/live", methods=["GET"])
def liveness_check():
    """Liveness probe: returns HTTP 200 as long as the process is alive."""
    return jsonify({
        "status": "alive",
        "service": "cloudresumeai-backend",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }), 200


@health_bp.route("/health/ready", methods=["GET"])
def readiness_check():
    """Readiness probe: verifies backend can safely serve requests."""
    db_status = check_db_connectivity()
    if db_status.get("status") == "unreachable":
        return jsonify({
            "status": "not_ready",
            "reason": "Database connection is unreachable",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }), 503

    return jsonify({
        "status": "ready",
        "database": db_status.get("status"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }), 200
