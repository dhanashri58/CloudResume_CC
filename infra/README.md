# CloudResumeAI - Cloud Architecture Reference

This document outlines how the CloudResumeAI foundation aligns with target Microsoft Azure cloud architecture for upcoming project stages.

## Target Architecture Overview

```
                                +---------------------------+
                                |      GitHub Actions       |
                                |     (CI / CD Pipeline)    |
                                +-------------+-------------+
                                              |
                       +----------------------+----------------------+
                       | Builds & pushes images to                  | Runs tests &
                       v                                            v validations
        +-----------------------------+               +----------------------------+
        |   Azure Container Registry  |               |    Automated Test Suites   |
        |            (ACR)            |               |  (Vitest & Pytest on Push) |
        +--------------+--------------+               +----------------------------+
                       |
                       v
        +-----------------------------------------------------------+
        |                Azure Container Apps (ACA)                 |
        |                                                           |
        |   +-----------------------+   +-----------------------+   |
        |   |   Frontend Container  |   |   Backend Container   |   |
        |   |    (React / Nginx)    |-->|     (Python Flask)    |   |
        |   +-----------------------+   +-----------+-----------+   |
        |                                           |               |
        +-------------------------------------------|---------------+
                                                    |
         +--------------------+---------------------+--------------------+
         |                    |                                          |
         v                    v                                          v
+------------------+ +-----------------------------------+ +--------------------+
|  Azure Key Vault | | Azure Database for PostgreSQL     | | Azure Blob Storage |
| (Secrets & Keys) | | (Flexible Server - Managed RDBMS) | | (Resumes & Assets) |
+------------------+ +-----------------------------------+ +--------------------+
```

## Component Mapping

| Local Component | Local Development Setup | Future Azure Target | Stage Alignment |
| :--- | :--- | :--- | :--- |
| **Frontend** | React 18 + Vite (dev: 5173, prod: Nginx container :3000) | Azure Container Apps / Azure Static Web Apps | Stage 8 Production Ready |
| **Backend API** | Flask 3 + Gunicorn container (:5000 / dynamic `$PORT`) | Azure Container Apps (managed HTTPS, autoscaling) | Stage 8 Production Ready |
| **Database** | PostgreSQL 16 container (`db`) | Azure Database for PostgreSQL (Flexible Server, SSL enforced) | Stage 8 Production Ready |
| **Configuration** | `.env` / Docker Compose env vars | Azure Container Apps Secrets + Azure Key Vault References | Stage 8 Production Ready |
| **Object Storage** | Local filesystem (`storage/blobs/`) | Azure Blob Storage (private containers, SDK integration) | Stage 8 Production Ready |
| **CI / CD** | Local test runners (`vitest`, `pytest`) | GitHub Actions CI & Deploy (`.github/workflows/`) | Stage 8 Production Ready |
| **Infrastructure** | Manual Docker Compose | Declarative Azure Bicep Templates (`infra/bicep/`) | Stage 8 Production Ready |
| **Monitoring & Logging** | Console logging + `X-Request-ID` | Azure Monitor / Application Insights (OpenTelemetry) | Stage 9 Production Ready |
| **Cost Management** | Free local execution | Azure Consumption Budget Alerts & Scale-to-Zero | Stage 9 Production Ready |

---

## Azure Bicep Infrastructure as Code (IaC)

### Template Directory Structure
```text
infra/bicep/
├── main.bicep                  # Orchestrator template
├── parameters.dev.json         # Development environment parameters
├── parameters.prod.json        # Production environment parameters
└── modules/
    ├── identity.bicep          # User-Assigned Managed Identity
    ├── registry.bicep          # Azure Container Registry (Basic SKU, AcrPull role)
    ├── storage.bicep           # Azure Storage + Private Blob Container (Blob Contributor role)
    ├── keyvault.bicep          # Azure Key Vault + RBAC (Key Vault Secrets User role)
    ├── database.bicep          # Azure Database for PostgreSQL Flexible Server (Burstable B1ms)
    ├── environment.bicep       # Container Apps Environment + Log Analytics Workspace
    ├── backend.bicep           # Backend Flask Container App (health probes, secrets, env vars)
    └── frontend.bicep          # Frontend React Container App (ingress, reverse proxy)
```

### Role Assignments (Least Privilege)
The User-Assigned Managed Identity (`identity.bicep`) is granted minimal privileges:
1. **`Storage Blob Data Contributor`** (`ba92f5b4-2d11-453d-a403-e96b0029c9fe`): Scoped to the resume storage account.
2. **`Key Vault Secrets User`** (`4633458b-17de-408a-b874-0445c86b69e6`): Scoped to the Key Vault.
3. **`AcrPull`** (`7f951dda-4ed3-4680-a7ca-43fe172d538d`): Scoped to the container registry.

### Azure CLI Infrastructure Commands
```bash
# 1. Log in to Azure account
az login

# 2. Create the target resource group
az group create --name rg-cloudresumeai-dev --location eastus

# 3. Validate Bicep templates
az deployment group validate \
  --resource-group rg-cloudresumeai-dev \
  --template-file infra/bicep/main.bicep \
  --parameters @infra/bicep/parameters.dev.json

# 4. Deploy all resources via Bicep
az deployment group create \
  --name deploy-cloudresumeai-dev \
  --resource-group rg-cloudresumeai-dev \
  --template-file infra/bicep/main.bicep \
  --parameters @infra/bicep/parameters.dev.json
```

### GitHub Actions Secrets & Variables Required for Deployment
Configure these in GitHub Repository **Settings -> Secrets and variables -> Actions**:
- **Secrets**:
  - `AZURE_CLIENT_ID`: Managed Identity / App Registration Client ID (for OIDC).
  - `AZURE_TENANT_ID`: Microsoft Entra Tenant ID.
  - `AZURE_SUBSCRIPTION_ID`: Azure Subscription ID.
  - `POSTGRES_ADMIN_PASSWORD`: Strong password for PostgreSQL.
  - `FLASK_SECRET_KEY`: Random 64-character string.
  - `GEMINI_API_KEY`: Google Gemini API key.
- **Variables**:
  - `AZURE_RESOURCE_GROUP`: `rg-cloudresumeai-dev` or `rg-cloudresumeai-prod`.
  - `AZURE_ACR_LOGIN_SERVER`: `<registry-name>.azurecr.io`.

### Cost Considerations (Student Budget Optimized)
- **Azure Container Apps**: Consumption tier (first 180,000 vCPU-seconds and 360,000 GiB-seconds free each month; scales to zero in non-production environments).
- **PostgreSQL Flexible Server**: `Standard_B1ms` burstable tier (~$12-15/month).
- **Storage Account**: Standard LRS Hot tier (pennies per month).
- **Container Registry**: Basic SKU (~$0.16/day).
- **Key Vault**: Standard tier (per-transaction, cents per month).
- **Budget Alerts**: Azure Consumption Budget (`infra/bicep/modules/budget.bicep`) enforces email notifications at 50%, 75%, 90%, and 100% of the configured spending ceiling.

---

## Cloud Monitoring and Observability (Stage 9)

### 1. Azure Monitor and Application Insights (OpenTelemetry)
- **SDK**: Microsoft official `azure-monitor-opentelemetry` package.
- **Graceful Activation**: Monitored automatically when `APPLICATIONINSIGHTS_CONNECTION_STRING` is set in Azure Container Apps. In local development or unit testing, telemetry remains safely inactive with zero crashes or network egress.
- **Log Analytics Workspace**: Managed by `infra/bicep/modules/environment.bicep` for centralized log ingestion and query with Kusto (KQL).

### 2. Health Monitoring Probes
- **Comprehensive Dependency Check**: `GET /api/health`
  - Validates PostgreSQL connectivity (`SELECT 1`) and storage container configuration.
  - Returns `200 OK` (healthy / degraded), masking internal credentials and connection string secrets.
- **Liveness Probe**: `GET /api/health/live`
  - Instantaneous HTTP 200 check confirming Flask process execution.
- **Readiness Probe**: `GET /api/health/ready`
  - Validates critical dependencies before receiving traffic; returns `HTTP 503` if PostgreSQL is unreachable.

### 3. Structured Logging and Request Correlation
- **Request Tracing**: `X-Request-ID` header injected on incoming requests or generated via UUIDv4; returned in response headers for cross-tier log correlation.
- **Performance Timing**: `Server-Timing: total;dur=<ms>` returned on all API responses.
- **Sensitive Data Redaction**: `SensitiveDataFilter` automatically redacts Bearer JWT tokens, Gemini API keys, passwords, and secrets before log emission.
- **Security Auditing**:
  - `[SECURITY]` event on authentication failures and cross-user resource access denials.
  - `[SECURITY_ALERT]` raised if >= 5 failed authentication attempts occur from an IP within 5 minutes.


## Azure Security and Compliance Guidelines

1. **Zero Hardcoded Secrets**: Secrets are always sourced from environment variables; in Azure, these map to Key Vault secret references (`@Microsoft.KeyVault(SecretUri=...)`).
2. **Managed Identities**: When deploying to Azure Container Apps, system-assigned or user-assigned Managed Identities will be used to access Key Vault and Blob Storage without storing connection strings in plaintext.
3. **Stateless Containers**: Both frontend and backend containers are completely stateless. Container instances can scale horizontally between 0 and N instances.
4. **Health Probes**:
   - Backend liveness / readiness: `GET /api/health`
   - Frontend liveness: `GET /` (handled by Nginx static check)

