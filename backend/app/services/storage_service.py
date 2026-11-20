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


class GoogleCloudStorageProvider(BaseStorageProvider):
    """Production storage provider backed by Google Cloud Storage (GCS)."""

    def __init__(
        self,
        bucket_name: str = "cloudresumeai-resumes",
        project_id: Optional[str] = None,
    ):
        self.bucket_name = bucket_name
        self.project_id = project_id
        self._storage_client = None
        self._bucket = None

    def _get_client(self):
        """Initialize Google Cloud Storage client via Application Default Credentials (ADC)."""
        if self._storage_client is not None:
            return self._storage_client

        try:
            from google.cloud import storage

            self._storage_client = storage.Client(project=self.project_id)
            return self._storage_client
        except Exception as e:
            raise StorageConfigurationError(
                f"Google Cloud Storage client initialization failed: {e}"
            )

    def _get_bucket(self):
        """Get or initialize GCS Bucket instance."""
        if self._bucket is not None:
            return self._bucket

        client = self._get_client()
        try:
            self._bucket = client.bucket(self.bucket_name)
            return self._bucket
        except Exception as e:
            raise StorageConfigurationError(
                f"Failed to access Google Cloud Storage bucket '{self.bucket_name}': {e}"
            )

    def upload(
        self,
        blob_name: str,
        data: bytes,
        content_type: str = "application/pdf"
    ) -> str:
        clean_name = blob_name.replace("\\", "/").lstrip("/")
        bucket = self._get_bucket()
        blob = bucket.blob(clean_name)
        blob.upload_from_string(data, content_type=content_type)
        logger.info(
            "Uploaded blob '%s' to Google Cloud Storage bucket '%s'",
            clean_name,
            self.bucket_name,
        )
        return clean_name

    def download(self, blob_name: str) -> Optional[bytes]:
        clean_name = blob_name.replace("\\", "/").lstrip("/")
        bucket = self._get_bucket()
        blob = bucket.blob(clean_name)
        try:
            if not blob.exists():
                return None
            return blob.download_as_bytes()
        except Exception as e:
            logger.error("Error downloading GCS blob '%s': %s", clean_name, e)
            raise StorageError(f"Failed to download GCS blob '{clean_name}': {e}")

    def exists(self, blob_name: str) -> bool:
        clean_name = blob_name.replace("\\", "/").lstrip("/")
        bucket = self._get_bucket()
        blob = bucket.blob(clean_name)
        try:
            return blob.exists()
        except Exception:
            return False

    def delete(self, blob_name: str) -> bool:
        clean_name = blob_name.replace("\\", "/").lstrip("/")
        bucket = self._get_bucket()
        blob = bucket.blob(clean_name)
        try:
            if blob.exists():
                blob.delete()
                return True
            return False
        except Exception as e:
            logger.error("Error deleting GCS blob '%s': %s", clean_name, e)
            return False


class S3StorageProvider(BaseStorageProvider):
    """Production storage provider backed by Amazon Simple Storage Service (S3)."""

    def __init__(
        self,
        bucket_name: str = "cloudresume-resumes-tanmay-617711904818",
        region_name: Optional[str] = "ap-southeast-2",
        profile_name: Optional[str] = None,
    ):
        self.bucket_name = bucket_name
        self.region_name = region_name or os.getenv("AWS_REGION", "ap-southeast-2")
        self.profile_name = profile_name or os.getenv("AWS_PROFILE", None)
        self._s3_client = None

    def _get_client(self):
        """Initialize Boto3 S3 client using environment or configured profile."""
        if self._s3_client is not None:
            return self._s3_client

        try:
            import boto3

            if self.profile_name:
                session = boto3.Session(
                    profile_name=self.profile_name, region_name=self.region_name
                )
                self._s3_client = session.client("s3")
            else:
                self._s3_client = boto3.client("s3", region_name=self.region_name)
            return self._s3_client
        except Exception as e:
            raise StorageConfigurationError(
                f"AWS S3 client initialization failed: {e}"
            )

    def upload(
        self,
        blob_name: str,
        data: bytes,
        content_type: str = "application/pdf"
    ) -> str:
        clean_name = blob_name.replace("\\", "/").lstrip("/")
        client = self._get_client()
        try:
            client.put_object(
                Bucket=self.bucket_name,
                Key=clean_name,
                Body=data,
                ContentType=content_type,
                ServerSideEncryption="AES256",
            )
            logger.info(
                "Uploaded blob '%s' to Amazon S3 bucket '%s'",
                clean_name,
                self.bucket_name,
            )
            return clean_name
        except Exception as e:
            logger.error("Error uploading S3 blob '%s': %s", clean_name, e)
            raise StorageError(f"Failed to upload S3 blob '{clean_name}': {e}")

    def download(self, blob_name: str) -> Optional[bytes]:
        from botocore.exceptions import ClientError

        clean_name = blob_name.replace("\\", "/").lstrip("/")
        client = self._get_client()
        try:
            response = client.get_object(Bucket=self.bucket_name, Key=clean_name)
            return response["Body"].read()
        except ClientError as e:
            if e.response["Error"]["Code"] in ("NoSuchKey", "404"):
                return None
            logger.error("Error downloading S3 blob '%s': %s", clean_name, e)
            raise StorageError(f"Failed to download S3 blob '{clean_name}': {e}")
        except Exception as e:
            logger.error("Error downloading S3 blob '%s': %s", clean_name, e)
            raise StorageError(f"Failed to download S3 blob '{clean_name}': {e}")

    def exists(self, blob_name: str) -> bool:
        from botocore.exceptions import ClientError

        clean_name = blob_name.replace("\\", "/").lstrip("/")
        client = self._get_client()
        try:
            client.head_object(Bucket=self.bucket_name, Key=clean_name)
            return True
        except ClientError:
            return False

    def delete(self, blob_name: str) -> bool:
        from botocore.exceptions import ClientError

        clean_name = blob_name.replace("\\", "/").lstrip("/")
        client = self._get_client()
        try:
            client.delete_object(Bucket=self.bucket_name, Key=clean_name)
            return True
        except ClientError as e:
            logger.error("Error deleting S3 blob '%s': %s", clean_name, e)
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
                "STORAGE_PROVIDER",
                config.get(
                    "AZURE_STORAGE_MODE",
                    os.getenv(
                        "STORAGE_PROVIDER",
                        os.getenv("AZURE_STORAGE_MODE", "local")
                    )
                )
            )
        ).lower()

        if mode in ("gcs", "gcp", "google"):
            bucket = config.get(
                "GCS_BUCKET_NAME",
                config.get(
                    "GCP_STORAGE_BUCKET",
                    os.getenv(
                        "GCS_BUCKET_NAME",
                        os.getenv(
                            "GCP_STORAGE_BUCKET",
                            "cloudresumeai-resumes"
                        )
                    )
                )
            )
            project_id = config.get(
                "GCP_PROJECT_ID",
                os.getenv("GCP_PROJECT_ID", "")
            )
            cls._provider = GoogleCloudStorageProvider(
                bucket_name=bucket,
                project_id=project_id or None,
            )
        elif mode == "azure":
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
        elif mode in ("s3", "aws"):
            bucket = config.get(
                "S3_BUCKET_NAME",
                config.get(
                    "AWS_S3_BUCKET",
                    os.getenv(
                        "S3_BUCKET_NAME",
                        os.getenv("AWS_S3_BUCKET", "cloudresume-resumes-tanmay-617711904818")
                    )
                )
            )
            region = config.get(
                "AWS_REGION",
                os.getenv("AWS_REGION", "ap-southeast-2")
            )
            profile = config.get(
                "AWS_PROFILE",
                os.getenv("AWS_PROFILE", None)
            )
            cls._provider = S3StorageProvider(
                bucket_name=bucket,
                region_name=region,
                profile_name=profile or None,
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
