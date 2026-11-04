"""Unit and integration tests for CloudResumeAI Storage Service.

Tests LocalStorageProvider, AzureBlobStorageProvider (mocked),
user ownership validation, path traversal prevention, private containers,
and integration with PDF export.
"""
import shutil
import tempfile
from unittest.mock import MagicMock, patch
import pytest

from app.services.storage_service import (
    AzureBlobStorageProvider,
    LocalStorageProvider,
    StorageAccessDeniedError,
    StorageConfigurationError,
    StorageService,
)
from app.models.user import User


@pytest.fixture
def temp_storage_dir():
    """Create a temporary storage directory for isolated testing."""
    tmp_dir = tempfile.mkdtemp(prefix="cloudresume_test_storage_")
    yield tmp_dir
    shutil.rmtree(tmp_dir, ignore_errors=True)


@pytest.fixture(autouse=True)
def reset_storage_provider():
    """Ensure StorageService cached provider is reset between tests."""
    StorageService.reset_provider()
    yield
    StorageService.reset_provider()


# ─── LocalStorageProvider Tests ─────────────────────────────────────────────


def test_local_storage_lifecycle(temp_storage_dir):
    """Test full upload, exists, download, and delete lifecycle locally."""
    provider = LocalStorageProvider(base_dir=temp_storage_dir)
    blob_name = "resumes/user-1/sample.pdf"
    test_data = b"%PDF-1.4 sample binary payload"

    assert not provider.exists(blob_name)
    assert provider.download(blob_name) is None

    stored_name = provider.upload(blob_name, test_data)
    assert stored_name == blob_name
    assert provider.exists(blob_name)

    downloaded = provider.download(blob_name)
    assert downloaded == test_data

    deleted = provider.delete(blob_name)
    assert deleted is True
    assert not provider.exists(blob_name)
    assert provider.download(blob_name) is None


def test_local_storage_traversal_prevention(temp_storage_dir):
    """Test that directory traversal attempts are strictly blocked."""
    provider = LocalStorageProvider(base_dir=temp_storage_dir)

    with pytest.raises(StorageAccessDeniedError):
        provider.upload("../../../etc/shadow", b"malicious content")

    with pytest.raises(StorageAccessDeniedError):
        provider.download("..\\..\\windows\\system32\\cmd.exe")


# ─── AzureBlobStorageProvider Tests (Mocked) ────────────────────────────────


def test_azure_blob_storage_upload_and_download():
    """Test AzureBlobStorageProvider upload and download with mocked SDK."""
    provider = AzureBlobStorageProvider(
        container_name="test-resumes",
        account_name="testaccount",
    )

    mock_blob_service = MagicMock()
    mock_container_client = MagicMock()
    mock_blob_client = MagicMock()

    mock_blob_service.get_container_client.return_value = mock_container_client
    mock_container_client.get_blob_client.return_value = mock_blob_client

    mock_download_stream = MagicMock()
    mock_download_stream.readall.return_value = b"%PDF-1.4 azure blob data"
    mock_blob_client.download_blob.return_value = mock_download_stream
    mock_blob_client.exists.return_value = True

    with patch.object(provider, "_get_client", return_value=mock_blob_service):
        blob_name = "resumes/user-42/resume.pdf"
        stored_id = provider.upload(blob_name, b"%PDF-1.4 azure blob data")
        assert stored_id == blob_name
        mock_blob_client.upload_blob.assert_called_once()

        data = provider.download(blob_name)
        assert data == b"%PDF-1.4 azure blob data"
        assert provider.exists(blob_name) is True

        deleted = provider.delete(blob_name)
        assert deleted is True
        mock_blob_client.delete_blob.assert_called_once()


def test_azure_blob_storage_private_container_enforcement():
    """Verify Azure Blob containers are created with public_access=None."""
    provider = AzureBlobStorageProvider(
        container_name="secure-private-container",
        account_name="testaccount",
    )

    mock_blob_service = MagicMock()
    mock_container = MagicMock()
    mock_blob_service.get_container_client.return_value = mock_container

    with patch.object(provider, "_get_client", return_value=mock_blob_service):
        client = provider._get_container_client()
        assert client == mock_container
        # Enforce that public_access was explicitly passed as None (private)
        mock_container.create_container.assert_called_once_with(
            public_access=None
        )


def test_azure_blob_storage_missing_configuration():
    """Verify that missing account name and connection string raises error."""
    provider = AzureBlobStorageProvider(
        container_name="resumes",
        account_name=None,
        connection_string=None,
    )
    with pytest.raises(StorageConfigurationError):
        provider._get_client()


def test_azure_blob_storage_resource_not_found():
    """Verify ResourceNotFoundError returns None for read and False for del."""
    from azure.core.exceptions import ResourceNotFoundError

    provider = AzureBlobStorageProvider(
        container_name="test-resumes",
        account_name="testaccount",
    )
    mock_blob_service = MagicMock()
    mock_container = MagicMock()
    mock_blob_client = MagicMock()
    mock_blob_service.get_container_client.return_value = mock_container
    mock_container.get_blob_client.return_value = mock_blob_client

    mock_blob_client.download_blob.side_effect = (
        ResourceNotFoundError("Not found")
    )
    mock_blob_client.delete_blob.side_effect = (
        ResourceNotFoundError("Not found")
    )

    with patch.object(provider, "_get_client", return_value=mock_blob_service):
        assert provider.download("resumes/missing.pdf") is None
        assert provider.delete("resumes/missing.pdf") is False


# ─── StorageService & User Isolation Tests ──────────────────────────────────


def test_storage_service_blob_naming_and_isolation():
    """Test deterministic blob naming and user boundary enforcement."""
    blob_name = StorageService.get_blob_name("user-abc", "resume-123")
    assert blob_name == "resumes/user-abc/resume-123.pdf"

    # Authorized user matches
    assert StorageService.validate_user_access(blob_name, "user-abc") is True

    # Cross-user access is denied
    assert StorageService.validate_user_access(blob_name, "user-xyz") is False
    assert StorageService.validate_user_access(blob_name, "user-ab") is False


def test_storage_service_cross_user_denial():
    """Verify cross-user attempts to fetch or delete raise AccessDenied."""
    victim_blob = "resumes/user-victim/secret.pdf"

    # User attacker attempting to fetch victim's blob
    with pytest.raises(StorageAccessDeniedError):
        StorageService.get_blob_by_name(
            blob_name=victim_blob,
            user_id="user-attacker",
        )

    # User attacker attempting to delete victim's blob
    with pytest.raises(StorageAccessDeniedError):
        StorageService.delete_blob_by_name(
            blob_name=victim_blob,
            user_id="user-attacker",
        )


def test_storage_service_mode_selection():
    """Test provider resolution based on AZURE_STORAGE_MODE config."""
    local_provider = StorageService.get_provider(
        {"AZURE_STORAGE_MODE": "local"}
    )
    assert isinstance(local_provider, LocalStorageProvider)

    StorageService.reset_provider()
    azure_provider = StorageService.get_provider(
        {
            "AZURE_STORAGE_MODE": "azure",
            "AZURE_STORAGE_ACCOUNT_NAME": "myacct",
        }
    )
    assert isinstance(azure_provider, AzureBlobStorageProvider)


# ─── End-to-End PDF Export & Storage Integration Tests ──────────────────────


def test_pdf_export_persists_to_storage_and_downloads(
    client, user_a_headers, temp_storage_dir
):
    """Verify POST export-pdf generates, stores, and downloads PDF."""
    create_resp = client.post(
        "/api/resumes",
        json={
            "title": "Cloud Engineer Azure Resume",
            "templateId": "horizon",
            "fullName": "Jordan Taylor",
            "headline": "Lead Cloud Infrastructure Architect",
        },
        headers=user_a_headers,
    )
    assert create_resp.status_code == 201
    resume_id = create_resp.get_json()["id"]

    # Configure local storage directory to temporary dir
    with patch(
        "app.services.storage_service.StorageService.get_provider"
    ) as mock_get_provider:
        local_provider = LocalStorageProvider(base_dir=temp_storage_dir)
        mock_get_provider.return_value = local_provider

        export_resp = client.post(
            f"/api/resumes/{resume_id}/export-pdf",
            headers=user_a_headers,
        )
        assert export_resp.status_code == 200
        assert export_resp.mimetype == "application/pdf"
        assert export_resp.data.startswith(b"%PDF")

        # Verify the PDF was persisted in storage
        user = User.query.filter_by(email="user.a@example.com").first()
        blob_name = StorageService.get_blob_name(user.id, resume_id)
        assert local_provider.exists(blob_name) is True
        stored_bytes = local_provider.download(blob_name)
        assert stored_bytes.startswith(b"%PDF")


def test_delete_resume_removes_stored_pdf(
    client, user_a_headers, temp_storage_dir
):
    """Verify that deleting a resume also purges its stored PDF."""
    create_resp = client.post(
        "/api/resumes",
        json={"title": "Temporary Resume To Delete"},
        headers=user_a_headers,
    )
    resume_id = create_resp.get_json()["id"]

    with patch(
        "app.services.storage_service.StorageService.get_provider"
    ) as mock_get_provider:
        local_provider = LocalStorageProvider(base_dir=temp_storage_dir)
        mock_get_provider.return_value = local_provider

        # Export to create the stored PDF
        client.post(
            f"/api/resumes/{resume_id}/export-pdf",
            headers=user_a_headers,
        )

        user = User.query.filter_by(email="user.a@example.com").first()
        blob_name = StorageService.get_blob_name(user.id, resume_id)
        assert local_provider.exists(blob_name) is True

        # Delete resume
        del_resp = client.delete(
            f"/api/resumes/{resume_id}",
            headers=user_a_headers,
        )
        assert del_resp.status_code == 200

        # Verify stored PDF was purged
        assert local_provider.exists(blob_name) is False
