"""Routes package initialization."""
from app.routes.health import health_bp
from app.routes.resumes import resumes_bp
from app.routes.profile import profile_bp
from app.routes.ai import ai_bp

__all__ = ["health_bp", "resumes_bp", "profile_bp", "ai_bp"]
