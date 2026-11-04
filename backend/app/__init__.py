"""Application factory for the Flask backend."""
import os
from flask import Flask, jsonify
from flask_cors import CORS
from app.config import Config
from app.extensions import db, migrate
from app.utils.logging import setup_logging
from app.services.telemetry import TelemetryService


def create_app(config_class=Config):
    """Application factory for extensions, blueprints, and error handlers."""
    application = Flask(__name__)
    application.config.from_object(config_class)

    # Initialize structured logging and telemetry
    setup_logging(application)
    TelemetryService.init_app(application)

    # Initialize database extensions
    db.init_app(application)
    migrations_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "migrations"
    )
    migrate.init_app(application, db, directory=migrations_dir)

    # Import models for metadata registration
    import app.models  # noqa: F401

    # Initialize CORS
    default_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]
    cors_origins = application.config.get("CORS_ORIGINS", default_origins)
    CORS(
        application,
        resources={r"/api/*": {"origins": cors_origins}},
        supports_credentials=True,
    )

    # Register API blueprints
    from app.routes.health import health_bp
    from app.routes.resumes import resumes_bp
    from app.routes.profile import profile_bp
    from app.routes.ai import ai_bp

    application.register_blueprint(health_bp, url_prefix="/api")
    application.register_blueprint(resumes_bp, url_prefix="/api")
    application.register_blueprint(profile_bp, url_prefix="/api")
    application.register_blueprint(ai_bp, url_prefix="/api")

    # Global safe error handlers
    @application.errorhandler(404)
    def handle_not_found(e):
        return jsonify({
            "error": "Not Found",
            "message": "The requested API resource does not exist."
        }), 404

    @application.errorhandler(500)
    def handle_internal_error(e):
        return jsonify({
            "error": "Internal Server Error",
            "message": "An unexpected error occurred. Please try again later."
        }), 500

    return application
