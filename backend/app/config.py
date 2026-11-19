"""Application configuration settings."""
import os
import urllib.parse
from dotenv import load_dotenv

# Load environment variables from .env file if present
load_dotenv()
_backend_env = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"
)
if os.path.isfile(_backend_env):
    load_dotenv(_backend_env)


class Config:
    """Base application configuration loaded from environment variables."""

    ENV = os.getenv("FLASK_ENV", "development")
    DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-insecure-key-change-in-prod")
    PORT = int(os.getenv("PORT", 5000))

    # Allowed CORS origins (comma-separated string or list)
    default_cors = (
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
    )
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", default_cors).split(",")
        if origin.strip()
    ]

    # Database configuration
    POSTGRES_USER = os.getenv("POSTGRES_USER", "cloudresume_user")
    POSTGRES_PASSWORD = os.getenv(
        "POSTGRES_PASSWORD", "cloudresume_password_placeholder"
    )
    POSTGRES_DB = os.getenv("POSTGRES_DB", "cloudresumeai_dev")
    POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")

    _enc_user = urllib.parse.quote_plus(POSTGRES_USER)
    _enc_pw = urllib.parse.quote_plus(POSTGRES_PASSWORD)

    default_db_url = (
        f"postgresql+psycopg2://{_enc_user}:{_enc_pw}"
        f"@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
    )
    raw_db_url = os.getenv("DATABASE_URL", default_db_url)
    if raw_db_url.startswith("postgresql://"):
        raw_db_url = raw_db_url.replace(
            "postgresql://", "postgresql+psycopg2://", 1
        )
    DATABASE_URL = raw_db_url
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # PostgreSQL SSL Configuration (for Azure Database for PostgreSQL)
    POSTGRES_SSLMODE = os.getenv("POSTGRES_SSLMODE", "")
    _effective_sslmode = POSTGRES_SSLMODE
    if not _effective_sslmode and (
        "postgres.database.azure.com" in DATABASE_URL or ENV == "production"
    ):
        _effective_sslmode = "require"

    _engine_options = {}
    if _effective_sslmode and "postgresql" in DATABASE_URL:
        _engine_options["connect_args"] = {"sslmode": _effective_sslmode}
    SQLALCHEMY_ENGINE_OPTIONS = _engine_options

    # Cloud Storage Configuration (Supports Local, Azure Blob, and Google Cloud Storage GCS)
    STORAGE_PROVIDER = os.getenv(
        "STORAGE_PROVIDER", os.getenv("AZURE_STORAGE_MODE", "local")
    ).lower()
    AZURE_STORAGE_MODE = STORAGE_PROVIDER
    AZURE_STORAGE_ACCOUNT_NAME = os.getenv("AZURE_STORAGE_ACCOUNT_NAME", "")
    AZURE_STORAGE_CONTAINER_NAME = os.getenv(
        "AZURE_STORAGE_CONTAINER_NAME", "cloudresumeai-resumes"
    )
    AZURE_STORAGE_CONNECTION_STRING = os.getenv(
        "AZURE_STORAGE_CONNECTION_STRING", ""
    )
    GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID", "")
    GCP_REGION = os.getenv("GCP_REGION", "us-central1")
    GCS_BUCKET_NAME = os.getenv(
        "GCS_BUCKET_NAME",
        os.getenv("GCP_STORAGE_BUCKET", "cloudresumeai-resumes")
    )
    _default_storage_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "storage",
        "blobs",
    )
    LOCAL_STORAGE_DIR = os.getenv("LOCAL_STORAGE_DIR", _default_storage_dir)

    # Cloud Secrets Management Configuration (Azure Key Vault & GCP Secret Manager)
    AZURE_KEY_VAULT_URL = os.getenv("AZURE_KEY_VAULT_URL", "")
    GCP_SECRET_MANAGER_ENABLED = os.getenv("GCP_SECRET_MANAGER_ENABLED", "0").lower() in ("1", "true", "yes")

    # Application Insights / Cloud Monitoring Configuration
    APPLICATIONINSIGHTS_CONNECTION_STRING = os.getenv(
        "APPLICATIONINSIGHTS_CONNECTION_STRING", ""
    )
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

    # Development identity guard: strictly disabled in production.
    # Defaults to False unless explicitly set.
    if ENV == "production":
        DEV_AUTH_ENABLED = False
    else:
        DEV_AUTH_ENABLED = os.getenv("DEV_AUTH_ENABLED", "0").lower() in (
            "1", "true", "yes"
        )

    # Microsoft Entra External ID (OIDC / JWT) Configuration
    AZURE_ENTRA_TENANT_ID = os.getenv("AZURE_ENTRA_TENANT_ID", "")
    AZURE_ENTRA_CLIENT_ID = os.getenv("AZURE_ENTRA_CLIENT_ID", "")
    AZURE_ENTRA_AUDIENCE = os.getenv(
        "AZURE_ENTRA_AUDIENCE", AZURE_ENTRA_CLIENT_ID
    )
    AZURE_ENTRA_ISSUER = os.getenv("AZURE_ENTRA_ISSUER", "")
    AZURE_ENTRA_JWKS_URI = os.getenv("AZURE_ENTRA_JWKS_URI", "")
    AZURE_ENTRA_PUBLIC_KEY = os.getenv("AZURE_ENTRA_PUBLIC_KEY", "")

    # Google Cloud / Google Identity Configuration
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_OAUTH_AUDIENCE = os.getenv(
        "GOOGLE_OAUTH_AUDIENCE", GOOGLE_CLIENT_ID
    )

    # Gemini AI Configuration
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")


class TestConfig(Config):
    """Configuration for testing."""

    TESTING = True
    DEBUG = True
    DATABASE_URL = "sqlite:///:memory:"
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_ENGINE_OPTIONS = {}
    DEV_AUTH_ENABLED = True
    AZURE_STORAGE_MODE = "local"
