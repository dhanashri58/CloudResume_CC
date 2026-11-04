"""Unit tests for Azure Key Vault integration and environment fallback."""
import os
from unittest.mock import MagicMock, patch
import pytest

from app.services.keyvault_service import KeyVaultService


@pytest.fixture(autouse=True)
def reset_keyvault_client():
    """Reset cached KeyVaultService client between tests."""
    KeyVaultService.reset_client()
    yield
    KeyVaultService.reset_client()


def test_keyvault_fallback_to_env_when_unconfigured():
    """Verify that get_secret falls back to os.getenv when URL is unset."""
    env_mock = {
        "AZURE_KEY_VAULT_URL": "",
        "CUSTOM_SECRET": "local_secret_value",
    }
    with patch.dict(os.environ, env_mock):
        val = KeyVaultService.get_secret("CUSTOM_SECRET")
        assert val == "local_secret_value"

        # Non-existent secret returns default
        res = KeyVaultService.get_secret("NON_EXISTENT", default="my_default")
        assert res == "my_default"


def test_keyvault_fetches_secret_with_dash_name():
    """Verify get_secret queries Key Vault converting underscores to dashes."""
    mock_client = MagicMock()
    mock_secret = MagicMock()
    mock_secret.value = "super-secret-gemini-key"
    mock_client.get_secret.return_value = mock_secret

    with patch.object(KeyVaultService, "get_client", return_value=mock_client):
        val = KeyVaultService.get_secret(
            "GEMINI_API_KEY", vault_url="https://test-kv.vault.azure.net/"
        )
        assert val == "super-secret-gemini-key"
        # Key Vault names cannot have underscores; verify dashed name queried
        mock_client.get_secret.assert_called_once_with("GEMINI-API-KEY")


def test_keyvault_fallback_when_secret_not_found():
    """Verify that ResourceNotFoundError falls back to environment variable."""
    from azure.core.exceptions import ResourceNotFoundError

    mock_client = MagicMock()
    mock_client.get_secret.side_effect = ResourceNotFoundError("Not found")

    with patch.object(KeyVaultService, "get_client", return_value=mock_client):
        with patch.dict(os.environ, {"MY_PASSWORD": "env_password_value"}):
            val = KeyVaultService.get_secret("MY_PASSWORD")
            assert val == "env_password_value"


def test_keyvault_client_creation_error_handled_gracefully():
    """Verify client initialization errors are caught without crashing."""
    vault_url = "https://invalid-vault.vault.azure.net/"
    with patch.dict(os.environ, {"AZURE_KEY_VAULT_URL": vault_url}):
        with patch(
            "azure.keyvault.secrets.SecretClient",
            side_effect=Exception("Auth error")
        ):
            client = KeyVaultService.get_client()
            assert client is None
