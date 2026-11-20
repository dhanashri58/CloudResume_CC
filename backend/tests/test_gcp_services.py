"""Unit tests for Google Cloud Platform (GCP) services integration.

Verifies:
- GoogleCloudStorageProvider upload, download, exists, and delete operations.
- StorageService provider resolution for GCS / GCP modes.
- KeyVaultService retrieval from Google Cloud Secret Manager.
- TokenVerifier support for Google Identity Services / OIDC tokens.
"""
import os
from unittest.mock import MagicMock, patch
import pytest

from app.services.storage_service import (
    GoogleCloudStorageProvider,
    StorageService,
)
from app.services.keyvault_service import KeyVaultService
from app.services.token_verifier import TokenVerifier


@pytest.fixture(autouse=True)
def reset_services():
    """Reset cached providers and clients between tests."""
    StorageService.reset_provider()
    KeyVaultService.reset_client()
    yield
    StorageService.reset_provider()
    KeyVaultService.reset_client()


# -----------------------------------------------------------------------------
# Google Cloud Storage (GCS) Tests
# -----------------------------------------------------------------------------

def test_gcs_provider_upload():
    """Verify GCS provider uploads blob with content type."""
    mock_blob = MagicMock()
    mock_bucket = MagicMock()
    mock_bucket.blob.return_value = mock_blob
    mock_client = MagicMock()
    mock_client.bucket.return_value = mock_bucket

    provider = GoogleCloudStorageProvider(
        bucket_name="my-gcp-resumes", project_id="my-gcp-project"
    )
    provider._storage_client = mock_client

    result = provider.upload("resumes/user1/test.pdf", b"%PDF-test", "application/pdf")

    assert result == "resumes/user1/test.pdf"
    mock_bucket.blob.assert_called_once_with("resumes/user1/test.pdf")
    mock_blob.upload_from_string.assert_called_once_with(
        b"%PDF-test", content_type="application/pdf"
    )


def test_gcs_provider_download_found_and_not_found():
    """Verify GCS provider downloads byte payload or returns None if absent."""
    mock_blob = MagicMock()
    mock_blob.exists.return_value = True
    mock_blob.download_as_bytes.return_value = b"%PDF-downloaded-bytes"
    mock_bucket = MagicMock()
    mock_bucket.blob.return_value = mock_blob
    mock_client = MagicMock()
    mock_client.bucket.return_value = mock_bucket

    provider = GoogleCloudStorageProvider(bucket_name="my-gcp-resumes")
    provider._storage_client = mock_client

    # Case 1: Exists
    data = provider.download("resumes/user1/test.pdf")
    assert data == b"%PDF-downloaded-bytes"

    # Case 2: Does not exist
    mock_blob.exists.return_value = False
    data_missing = provider.download("resumes/user1/missing.pdf")
    assert data_missing is None


def test_gcs_provider_exists_and_delete():
    """Verify GCS exists and delete methods."""
    mock_blob = MagicMock()
    mock_blob.exists.return_value = True
    mock_bucket = MagicMock()
    mock_bucket.blob.return_value = mock_blob
    mock_client = MagicMock()
    mock_client.bucket.return_value = mock_bucket

    provider = GoogleCloudStorageProvider(bucket_name="my-gcp-resumes")
    provider._storage_client = mock_client

    assert provider.exists("resumes/user1/test.pdf") is True
    assert provider.delete("resumes/user1/test.pdf") is True
    mock_blob.delete.assert_called_once()


def test_storage_service_resolves_gcs_provider():
    """Verify StorageService instantiates GoogleCloudStorageProvider when configured."""
    cfg = {
        "STORAGE_PROVIDER": "gcs",
        "GCS_BUCKET_NAME": "custom-gcs-bucket",
        "GCP_PROJECT_ID": "gcp-project-123",
    }
    provider = StorageService.get_provider(app_config=cfg)
    assert isinstance(provider, GoogleCloudStorageProvider)
    assert provider.bucket_name == "custom-gcs-bucket"
    assert provider.project_id == "gcp-project-123"


# -----------------------------------------------------------------------------
# Google Cloud Secret Manager Tests
# -----------------------------------------------------------------------------

def test_secret_manager_retrieval():
    """Verify KeyVaultService retrieves secrets from Google Secret Manager."""
    mock_response = MagicMock()
    mock_response.payload.data = b"secret-gemini-ai-key-from-gcp"

    mock_client = MagicMock()
    mock_client.access_secret_version.return_value = mock_response

    with patch.object(KeyVaultService, "get_gcp_client", return_value=mock_client):
        val = KeyVaultService.get_gcp_secret(
            "GEMINI_API_KEY", project_id="my-gcp-project"
        )
        assert val == "secret-gemini-ai-key-from-gcp"
        mock_client.access_secret_version.assert_called_once_with(
            name="projects/my-gcp-project/secrets/GEMINI-API-KEY/versions/latest"
        )


def test_secret_manager_fallback_to_env():
    """Verify fallback to os.getenv when Secret Manager client fails or secret is absent."""
    with patch.dict(os.environ, {"LOCAL_KEY": "env-secret-val", "GCP_PROJECT_ID": "my-project"}):
        mock_client = MagicMock()
        mock_client.access_secret_version.side_effect = Exception("Secret not found")
        with patch.object(KeyVaultService, "get_gcp_client", return_value=mock_client):
            val = KeyVaultService.get_secret("LOCAL_KEY", project_id="my-project")
            assert val == "env-secret-val"


# -----------------------------------------------------------------------------
# Google Identity / OIDC Token Verification Tests
# -----------------------------------------------------------------------------

def test_token_verifier_resolves_google_jwks():
    """Verify TokenVerifier derives Google's official JWKS endpoint."""
    cfg = {
        "GOOGLE_CLIENT_ID": "123456789-apps.googleusercontent.com",
        "AZURE_ENTRA_TENANT_ID": "",
    }
    jwks_uri = TokenVerifier.resolve_jwks_uri(cfg)
    assert jwks_uri == "https://www.googleapis.com/oauth2/v3/certs"

    expected_iss = TokenVerifier.resolve_expected_issuer(cfg)
    assert expected_iss == "https://accounts.google.com"


# -----------------------------------------------------------------------------
# GCP Terraform and Deployment CI/CD Tests
# -----------------------------------------------------------------------------

def test_gcp_terraform_modules_exist():
    """Verify all GCP Terraform modules and root configuration exist."""
    root_dir = os.path.dirname(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    )
    tf_dir = os.path.join(root_dir, "infra", "terraform")
    modules_dir = os.path.join(tf_dir, "modules")

    expected_files = [
        os.path.join(tf_dir, "main.tf"),
        os.path.join(tf_dir, "variables.tf"),
        os.path.join(tf_dir, "outputs.tf"),
        os.path.join(tf_dir, "versions.tf"),
        os.path.join(tf_dir, "terraform.tfvars.example"),
        os.path.join(modules_dir, "iam", "main.tf"),
        os.path.join(modules_dir, "artifact_registry", "main.tf"),
        os.path.join(modules_dir, "cloud_storage", "main.tf"),
        os.path.join(modules_dir, "secret_manager", "main.tf"),
        os.path.join(modules_dir, "cloud_sql", "main.tf"),
        os.path.join(modules_dir, "cloud_run", "main.tf"),
    ]

    for fpath in expected_files:
        assert os.path.isfile(fpath), f"Terraform file missing: {fpath}"


def test_gcp_deploy_workflow_structure():
    """Verify GCP deployment GitHub Actions workflow contains required steps."""
    root_dir = os.path.dirname(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    )
    workflow_path = os.path.join(
        root_dir, ".github", "workflows", "deploy-gcp.yml"
    )
    assert os.path.isfile(workflow_path), "deploy-gcp.yml must exist"

    with open(workflow_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "workflow_dispatch:" in content
    assert "google-github-actions/auth@v2" in content
    assert "google-github-actions/setup-gcloud@v2" in content
    assert "gcloud run deploy" in content
    assert "/api/health" in content
