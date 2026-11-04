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
    """Helper to fetch secrets from Azure Key Vault or fallback to env."""

    _client = None

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
        """Reset cached client (useful for unit testing)."""
        cls._client = None

    @classmethod
    def get_secret(
        cls,
        secret_name: str,
        default: Optional[str] = None,
        vault_url: Optional[str] = None,
    ) -> Optional[str]:
        """Fetch secret from Azure Key Vault; fallback to os.getenv or default.

        Azure Key Vault secret names allow only alphanumeric characters and
        hyphens. Environment variables with underscores (e.g. GEMINI_API_KEY)
        are mapped to hyphens (e.g. GEMINI-API-KEY).
        """
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
