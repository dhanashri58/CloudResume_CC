"""Azure Key Vault service integration with local environment fallback.

Supports Managed Identity authentication on Microsoft Azure without hardcoded
credentials, and transparently falls back to local environment variables during
development and testing.
"""
import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)


class KeyVaultService:
    """Helper to fetch secrets from GCP Secret Manager, Azure Key Vault, or env."""

    _client = None
    _gcp_client = None

    @classmethod
    def get_gcp_client(cls):
        """Lazily initialize Google Cloud Secret Manager client."""
        if cls._gcp_client is not None:
            return cls._gcp_client
        try:
            from google.cloud import secretmanager

            cls._gcp_client = secretmanager.SecretManagerServiceClient()
            return cls._gcp_client
        except Exception as e:
            logger.debug(
                "Could not initialize GCP Secret Manager client: %s", str(e)
            )
            return None

    @classmethod
    def get_client(cls, vault_url: Optional[str] = None):
        """Lazily initialize SecretClient if vault_url is configured."""
        if cls._client is not None:
            return cls._client

        vault_url = vault_url or os.getenv("AZURE_KEY_VAULT_URL", "")
        if not vault_url:
            return None

        try:
            from azure.identity import DefaultAzureCredential
            from azure.keyvault.secrets import SecretClient

            credential = DefaultAzureCredential()
            cls._client = SecretClient(
                vault_url=vault_url, credential=credential
            )
            return cls._client
        except Exception as e:
            logger.warning(
                "Could not initialize Azure Key Vault client: %s", str(e)
            )
            return None

    @classmethod
    def reset_client(cls):
        """Reset cached clients (useful for unit testing)."""
        cls._client = None
        cls._gcp_client = None

    @classmethod
    def get_gcp_secret(
        cls,
        secret_name: str,
        project_id: Optional[str] = None,
        default: Optional[str] = None,
    ) -> Optional[str]:
        """Fetch secret from Google Cloud Secret Manager."""
        proj = project_id or os.getenv("GCP_PROJECT_ID", "")
        if not proj:
            return os.getenv(secret_name, default)

        client = cls.get_gcp_client()
        if client:
            gcp_name = secret_name.replace("_", "-")
            secret_path = f"projects/{proj}/secrets/{gcp_name}/versions/latest"
            try:
                response = client.access_secret_version(name=secret_path)
                val = response.payload.data.decode("UTF-8")
                if val is not None:
                    return val
            except Exception as e:
                logger.debug(
                    "GCP Secret Manager '%s' lookup failed; fallback to env: %s",
                    secret_path,
                    str(e),
                )
        return os.getenv(secret_name, default)

    @classmethod
    def get_secret(
        cls,
        secret_name: str,
        default: Optional[str] = None,
        vault_url: Optional[str] = None,
        project_id: Optional[str] = None,
    ) -> Optional[str]:
        """Fetch secret from GCP Secret Manager, Azure Key Vault, or env.

        If GCP_SECRET_MANAGER_ENABLED is active, checks Google Secret Manager.
        Otherwise checks Azure Key Vault if configured.
        Falls back to os.getenv or default.
        """
        gcp_enabled = (
            os.getenv("GCP_SECRET_MANAGER_ENABLED", "0").lower()
            in ("1", "true", "yes")
        )
        if gcp_enabled or project_id:
            val = cls.get_gcp_secret(
                secret_name, project_id=project_id, default=None
            )
            if val is not None:
                return val

        client = cls.get_client(vault_url=vault_url)
        if client:
            kv_name = secret_name.replace("_", "-")
            try:
                secret = client.get_secret(kv_name)
                if secret and secret.value is not None:
                    return secret.value
            except Exception as e:
                logger.debug(
                    "Key Vault secret '%s' lookup failed; using env: %s",
                    kv_name,
                    str(e),
                )

        return os.getenv(secret_name, default)
