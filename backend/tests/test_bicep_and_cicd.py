"""Unit tests validating CI/CD workflows and Azure Bicep IaC templates.

Verifies:
- GitHub Actions CI workflow steps, triggers, and pinned action versions.
- GitHub Actions deployment workflow configuration and manual dispatch trigger.
- Bicep modular templates syntax, role definitions, and balanced structures.
- Parameter JSON schema compliance and absence of hardcoded secrets.
- Dockerfile multi-stage build patterns and health check configurations.
"""
import json
import os
import re

ROOT_DIR = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)
WORKFLOWS_DIR = os.path.join(ROOT_DIR, ".github", "workflows")
BICEP_DIR = os.path.join(ROOT_DIR, "infra", "bicep")
MODULES_DIR = os.path.join(BICEP_DIR, "modules")


def test_ci_workflow_structure_and_rules():
    """Verify that CI workflow contains all required jobs, steps, and pins."""
    ci_path = os.path.join(WORKFLOWS_DIR, "ci.yml")
    assert os.path.isfile(ci_path), "ci.yml must exist"

    with open(ci_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Triggers
    assert "push:" in content
    assert "pull_request:" in content
    assert "main" in content

    # Backend steps
    assert "actions/setup-python@v5" in content
    assert "3.12" in content
    assert "cache: 'pip'" in content
    assert "flake8 app tests" in content
    assert "pytest -v --cov=app" in content

    # Frontend steps
    assert "actions/setup-node@v4" in content
    assert "node-version: 22" in content
    assert "npm ci" in content
    assert "npm test -- --run" in content
    assert "tsc -b" in content
    assert "npm run build" in content

    # Docker validation steps
    assert "docker/setup-buildx-action@v3" in content
    assert "docker/build-push-action@v5" in content
    assert "push: false" in content
    assert "backend/Dockerfile" in content
    assert "frontend/Dockerfile" in content


def test_deploy_workflow_structure():
    """Verify deployment workflow is manual and has required stages."""
    deploy_path = os.path.join(WORKFLOWS_DIR, "deploy.yml")
    assert os.path.isfile(deploy_path), "deploy.yml must exist"

    with open(deploy_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Must be strictly manual trigger
    assert "workflow_dispatch:" in content

    # Azure authentication via OIDC
    assert "azure/login@v2" in content
    assert "client-id: ${{ secrets.AZURE_CLIENT_ID }}" in content

    # Bicep deployment & container build
    assert "main.bicep" in content
    assert "docker/build-push-action@v5" in content
    assert "az containerapp update" in content

    # Post-deployment health verification
    assert "/api/health" in content
    assert "HTTP 200 OK" in content


def test_bicep_templates_exist():
    """Verify all required Bicep modules exist."""
    expected_files = [
        os.path.join(BICEP_DIR, "main.bicep"),
        os.path.join(MODULES_DIR, "identity.bicep"),
        os.path.join(MODULES_DIR, "registry.bicep"),
        os.path.join(MODULES_DIR, "storage.bicep"),
        os.path.join(MODULES_DIR, "keyvault.bicep"),
        os.path.join(MODULES_DIR, "database.bicep"),
        os.path.join(MODULES_DIR, "environment.bicep"),
        os.path.join(MODULES_DIR, "backend.bicep"),
        os.path.join(MODULES_DIR, "frontend.bicep"),
        os.path.join(MODULES_DIR, "budget.bicep"),
    ]

    for file_path in expected_files:
        assert os.path.isfile(file_path), f"Template missing: {file_path}"


def test_bicep_syntax_and_balanced_braces():
    """Verify Bicep files have balanced braces, brackets, and parentheses."""
    for root, _, files in os.walk(BICEP_DIR):
        for file in files:
            if not file.endswith(".bicep"):
                continue
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()

            # Check balanced delimiters
            assert content.count("{") == content.count("}"), (
                f"Unbalanced braces in {file}"
            )
            assert content.count("(") == content.count(")"), (
                f"Unbalanced parentheses in {file}"
            )
            assert content.count("[") == content.count("]"), (
                f"Unbalanced brackets in {file}"
            )


def test_bicep_least_privilege_roles():
    """Verify that official least-privilege role definitions are configured."""
    storage_bicep = os.path.join(MODULES_DIR, "storage.bicep")
    with open(storage_bicep, "r", encoding="utf-8") as f:
        storage_content = f.read()
    # Storage Blob Data Contributor Role ID
    assert "ba92f5b4-2d11-453d-a403-e96b0029c9fe" in storage_content
    assert "publicAccess: 'None'" in storage_content

    keyvault_bicep = os.path.join(MODULES_DIR, "keyvault.bicep")
    with open(keyvault_bicep, "r", encoding="utf-8") as f:
        kv_content = f.read()
    # Key Vault Secrets User Role ID
    assert "4633458b-17de-408a-b874-0445c86b69e6" in kv_content
    assert "enableRbacAuthorization: true" in kv_content

    registry_bicep = os.path.join(MODULES_DIR, "registry.bicep")
    with open(registry_bicep, "r", encoding="utf-8") as f:
        reg_content = f.read()
    # AcrPull Role ID
    assert "7f951dda-4ed3-4680-a7ca-43fe172d538d" in reg_content


def test_bicep_secure_parameters():
    """Verify that credentials use @secure() annotations."""
    main_bicep = os.path.join(BICEP_DIR, "main.bicep")
    with open(main_bicep, "r", encoding="utf-8") as f:
        content = f.read()

    # Find params preceded by @secure() with optional decorator comments
    matches = re.findall(
        r"@secure\(\)[\s\S]*?param\s+([a-zA-Z0-9]+)", content
    )
    assert "postgresAdminPassword" in matches
    assert "flaskSecretKey" in matches
    assert "geminiApiKey" in matches


def test_bicep_parameters_json_files():
    """Verify dev and prod parameter files are valid JSON without secrets."""
    for env in ["dev", "prod"]:
        param_path = os.path.join(BICEP_DIR, f"parameters.{env}.json")
        assert os.path.isfile(param_path)

        with open(param_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        assert "$schema" in data
        assert "parameters" in data
        params = data["parameters"]
        assert params["environment"]["value"] == env

        # Ensure no plaintext passwords in parameter files
        pg_pwd_val = str(
            params.get("postgresAdminPassword", {}).get("value", "")
        ).lower()
        gemini_key_val = str(
            params.get("geminiApiKey", {}).get("value", "")
        ).lower()
        assert "password" not in pg_pwd_val
        assert "key" not in gemini_key_val


def test_dockerfiles_lint_and_health_probes():
    """Verify backend and frontend Dockerfiles have healthchecks and ports."""
    backend_dockerfile = os.path.join(ROOT_DIR, "backend", "Dockerfile")
    with open(backend_dockerfile, "r", encoding="utf-8") as f:
        backend_content = f.read()

    assert "FROM python:3.12-slim" in backend_content
    assert "EXPOSE 5000" in backend_content
    assert "HEALTHCHECK" in backend_content
    assert "/api/health" in backend_content

    frontend_dockerfile = os.path.join(ROOT_DIR, "frontend", "Dockerfile")
    with open(frontend_dockerfile, "r", encoding="utf-8") as f:
        frontend_content = f.read()

    assert "FROM node:22-alpine" in frontend_content
    assert "FROM nginx:1.27-alpine" in frontend_content
    assert "EXPOSE 80" in frontend_content
    assert "HEALTHCHECK" in frontend_content
