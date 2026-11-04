"""Storage service supporting Local filesystem and Azure Blob Storage.

Enforces user ownership, private container access, and path sanitization.
"""
import abc
import logging
import os
import re
from typing import Optional

logger = logging.getLogger(__name__)


class StorageError(Exception):
    """Base exception for storage errors."""

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class StorageConfigurationError(StorageError):
    """Raised when storage configuration is invalid or missing."""

    pass


class StorageAccessDeniedError(StorageError):
    """Raised when a user attempts to access an unauthorized blob."""

    pass


class BaseStorageProvider(abc.ABC):
    """Abstract interface for resume storage providers."""

    @abc.abstractmethod
    def upload(
        self,
        blob_name: str,
        data: bytes,
        content_type: str = "application/pdf"
    ) -> str:
        """Upload binary data and return stored blob identifier."""
        pass

    @abc.abstractmethod
    def download(self, blob_name: str) -> Optional[bytes]:
        """Download binary data from storage. Return None if not found."""
        pass

    @abc.abstractmethod
    def exists(self, blob_name: str) -> bool:
        """Check if blob exists in storage."""
        pass

    @abc.abstractmethod
    def delete(self, blob_name: str) -> bool:
        """Delete blob from storage. Return True if deleted, False if not."""
        pass


class LocalStorageProvider(BaseStorageProvider):
    """Local filesystem storage provider for development and testing."""

    def __init__(self, base_dir: str):
        self.base_dir = os.path.abspath(base_dir)
        os.makedirs(self.base_dir, exist_ok=True)

    def _resolve_path(self, blob_name: str) -> str:
        """Safely resolve blob path and prevent directory traversal."""
        clean_name = blob_name.replace("\\", "/").strip("/")
        full_path = os.path.abspath(os.path.join(self.base_dir, clean_name))
        # Ensure path does not escape base_dir
        if not full_path.startswith(self.base_dir):
            raise StorageAccessDeniedError(
                f"Illegal blob path traversal: {blob_name}"
            )
        return full_path

    def upload(
        self,
        blob_name: str,
        data: bytes,
        content_type: str = "application/pdf"
    ) -> str:
        target_path = self._resolve_path(blob_name)
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        with open(target_path, "wb") as f:
            f.write(data)
        logger.debug("Stored file locally at %s", target_path)
        return blob_name

    def download(self, blob_name: str) -> Optional[bytes]:
        target_path = self._resolve_path(blob_name)
        if not os.path.isfile(target_path):
            return None
        with open(target_path, "rb") as f:
            return f.read()

    def exists(self, blob_name: str) -> bool:
        target_path = self._resolve_path(blob_name)
        return os.path.isfile(target_path)

    def delete(self, blob_name: str) -> bool:
        target_path = self._resolve_path(blob_name)
        if os.path.isfile(target_path):
            try:
                os.remove(target_path)
                return True
            except OSError as e:
                logger.warning(
                    "Failed to delete local file %s: %s", target_path, e
                )
                return False
        return False


class AzureBlobStorageProvider(BaseStorageProvider):
    """Production storage provider backed by Azure Blob Storage."""

    def __init__(
        self,
        container_name: str = "cloudresumeai-resumes",
        account_name: Optional[str] = None,
        connection_string: Optional[str] = None,
    ):
        self.container_name = container_name
        self.account_name = account_name
        self.connection_string = connection_string
        self._blob_service_client = None
        self._container_client = None

    def _get_client(self):
        """Initialize Azure BlobServiceClient via conn string or identity."""
        if self._blob_service_client is not None:
            return self._blob_service_client

        from azure.storage.blob import BlobServiceClient

        if self.connection_string:
            self._blob_service_client = (
                BlobServiceClient.from_connection_string(
                    self.connection_string
                )
            )
        elif self.account_name:
            from azure.identity import DefaultAzureCredential

            account_url = f"https://{self.account_name}.blob.core.windows.net"
            credential = DefaultAzureCredential()
            self._blob_service_client = BlobServiceClient(
                account_url=account_url, credential=credential
            )
        else:
            raise StorageConfigurationError(
                "Azure Blob Storage requires AZURE_STORAGE_ACCOUNT_NAME or "
                "AZURE_STORAGE_CONNECTION_STRING."
            )
        return self._blob_service_client

    def _get_container_client(self):
        """Get container client, ensuring private container exists."""
        if self._container_client is not None:
            return self._container_client

        service_client = self._get_client()
        container_client = service_client.get_container_client(
            self.container_name
        )
        try:
            # Enforce strictly private access: public_access=None
            container_client.create_container(public_access=None)
            logger.info(
                "Created private Azure Blob container '%s'",
                self.container_name
            )
        except Exception:
            # Container already exists or caller has no create permissions
            pass

        self._container_client = container_client
        return self._container_client

    def upload(
        self,
        blob_name: str,
        data: bytes,
        content_type: str = "application/pdf"
    ) -> str:
        from azure.storage.blob import ContentSettings

        container = self._get_container_client()
        clean_name = blob_name.replace("\\", "/").lstrip("/")
        blob_client = container.get_blob_client(clean_name)
        content_settings = ContentSettings(content_type=content_type)
        blob_client.upload_blob(
            data, overwrite=True, content_settings=content_settings
        )
        logger.info(
            "Uploaded blob '%s' to Azure container '%s'",
            clean_name,
            self.container_name,
        )
        return clean_name

    def download(self, blob_name: str) -> Optional[bytes]:
        from azure.core.exceptions import ResourceNotFoundError

        container = self._get_container_client()
        clean_name = blob_name.replace("\\", "/").lstrip("/")
        blob_client = container.get_blob_client(clean_name)
        try:
            stream = blob_client.download_blob()
            return stream.readall()
        except ResourceNotFoundError:
            return None
        except Exception as e:
            logger.error("Error downloading blob '%s': %s", clean_name, e)
            raise StorageError(f"Failed to download blob '{clean_name}': {e}")

    def exists(self, blob_name: str) -> bool:
        container = self._get_container_client()
        clean_name = blob_name.replace("\\", "/").lstrip("/")
        blob_client = container.get_blob_client(clean_name)
        return blob_client.exists()

    def delete(self, blob_name: str) -> bool:
        from azure.core.exceptions import ResourceNotFoundError

        container = self._get_container_client()
        clean_name = blob_name.replace("\\", "/").lstrip("/")
        blob_client = container.get_blob_client(clean_name)
        try:
            blob_client.delete_blob()
            return True
        except ResourceNotFoundError:
            return False
        except Exception as e:
            logger.error("Error deleting blob '%s': %s", clean_name, e)
            return False


class StorageService:
    """Service facade for resume storage with user ownership isolation."""

    _provider: Optional[BaseStorageProvider] = None

    @classmethod
    def get_provider(
        cls, app_config: Optional[dict] = None
    ) -> BaseStorageProvider:
        """Resolve storage provider based on application configuration."""
        if cls._provider is not None:
            return cls._provider

        config = app_config or {}
        mode = str(
            config.get(
                "AZURE_STORAGE_MODE",
                os.getenv("AZURE_STORAGE_MODE", "local")
            )
        ).lower()

        if mode == "azure":
            container = config.get(
                "AZURE_STORAGE_CONTAINER_NAME",
                os.getenv(
                    "AZURE_STORAGE_CONTAINER_NAME", "cloudresumeai-resumes"
                ),
            )
            account = config.get(
                "AZURE_STORAGE_ACCOUNT_NAME",
                os.getenv("AZURE_STORAGE_ACCOUNT_NAME", ""),
            )
            conn_str = config.get(
                "AZURE_STORAGE_CONNECTION_STRING",
                os.getenv("AZURE_STORAGE_CONNECTION_STRING", ""),
            )
            cls._provider = AzureBlobStorageProvider(
                container_name=container,
                account_name=account or None,
                connection_string=conn_str or None,
            )
        else:
            default_dir = os.path.join(
                os.path.dirname(
                    os.path.dirname(
                        os.path.dirname(os.path.abspath(__file__))
                    )
                ),
                "storage",
                "blobs",
            )
            local_dir = config.get(
                "LOCAL_STORAGE_DIR",
                os.getenv("LOCAL_STORAGE_DIR", default_dir),
            )
            cls._provider = LocalStorageProvider(base_dir=local_dir)

        return cls._provider

    @classmethod
    def reset_provider(cls):
        """Reset cached provider instance (primarily used for unit testing)."""
        cls._provider = None

    @staticmethod
    def get_blob_name(
        user_id: str, resume_id: str, filename: Optional[str] = None
    ) -> str:
        """Construct deterministic, isolated blob path for a resume."""
        clean_user_id = re.sub(r"[^a-zA-Z0-9_\-]", "", str(user_id))
        clean_resume_id = re.sub(r"[^a-zA-Z0-9_\-]", "", str(resume_id))
        return f"resumes/{clean_user_id}/{clean_resume_id}.pdf"

    @classmethod
    def validate_user_access(cls, blob_name: str, user_id: str) -> bool:
        """Verify that a blob belongs strictly to the authenticated user."""
        clean_user_id = re.sub(r"[^a-zA-Z0-9_\-]", "", str(user_id))
        expected_prefix = f"resumes/{clean_user_id}/"
        clean_name = blob_name.replace("\\", "/").lstrip("/")
        is_valid = clean_name.startswith(expected_prefix)
        if not is_valid:
            try:
                from app.services.security_monitor import SecurityMonitor
                from flask import has_request_context, request

                ip = (
                    request.remote_addr if has_request_context() else "unknown"
                )
                path = request.path if has_request_context() else "storage"
                SecurityMonitor.record_cross_user_denial(
                    user_id=user_id,
                    target_resource=clean_name,
                    endpoint=path,
                    client_ip=ip,
                )
            except Exception:
                pass
        return is_valid

    @classmethod
    def save_resume_pdf(
        cls,
        user_id: str,
        resume_id: str,
        data: bytes,
        filename: Optional[str] = None,
        config: Optional[dict] = None,
    ) -> str:
        """Save generated PDF to storage and return blob identifier."""
        blob_name = cls.get_blob_name(user_id, resume_id, filename)
        provider = cls.get_provider(config)
        return provider.upload(blob_name, data, content_type="application/pdf")

    @classmethod
    def get_resume_pdf(
        cls,
        user_id: str,
        resume_id: str,
        filename: Optional[str] = None,
        config: Optional[dict] = None,
    ) -> Optional[bytes]:
        """Fetch resume PDF from storage, strictly verifying user ownership."""
        blob_name = cls.get_blob_name(user_id, resume_id, filename)
        if not cls.validate_user_access(blob_name, user_id):
            raise StorageAccessDeniedError(
                "Access to this resume storage blob is denied."
            )
        provider = cls.get_provider(config)
        return provider.download(blob_name)

    @classmethod
    def delete_resume_pdf(
        cls,
        user_id: str,
        resume_id: str,
        config: Optional[dict] = None,
    ) -> bool:
        """Delete stored resume PDF, strictly verifying user ownership."""
        blob_name = cls.get_blob_name(user_id, resume_id)
        if not cls.validate_user_access(blob_name, user_id):
            raise StorageAccessDeniedError(
                "Access to this resume storage blob is denied."
            )
        provider = cls.get_provider(config)
        return provider.delete(blob_name)

    @classmethod
    def get_blob_by_name(
        cls,
        blob_name: str,
        user_id: str,
        config: Optional[dict] = None,
    ) -> Optional[bytes]:
        """Fetch blob by direct path, validating ownership against user_id."""
        if not cls.validate_user_access(blob_name, user_id):
            raise StorageAccessDeniedError(
                "Access to this resume storage blob is denied."
            )
        provider = cls.get_provider(config)
        return provider.download(blob_name)

    @classmethod
    def delete_blob_by_name(
        cls,
        blob_name: str,
        user_id: str,
        config: Optional[dict] = None,
    ) -> bool:
        """Delete blob by direct path, validating ownership against user_id."""
        if not cls.validate_user_access(blob_name, user_id):
            raise StorageAccessDeniedError(
                "Access to this resume storage blob is denied."
            )
        provider = cls.get_provider(config)
        return provider.delete(blob_name)
