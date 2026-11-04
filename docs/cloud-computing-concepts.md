# Cloud Computing Concepts & Architecture Mapping

This document provides a comprehensive mapping of core Cloud Computing syllabus concepts to their exact implementation in the **CloudResumeAI** project. Designed specifically for a second-year Information Technology / Computer Engineering Cloud Computing curriculum.

---

## 1. Summary Matrix

| Concept | Project Component | Implementation Status | Cloud Role / Service |
| :--- | :--- | :--- | :--- |
| **SaaS (Software as a Service)** | CloudResumeAI Web Platform | **Implemented** | End-user interactive resume creation & AI tailoring application |
| **PaaS (Platform as a Service)** | Azure Container Apps, Azure PostgreSQL Flexible Server | **Azure Prepared (IaC)** | Managed container runtime and managed database without OS management |
| **IaaS (Infrastructure as a Service)** | Docker Linux containers / Azure compute nodes | **Locally Implemented / Azure Prepared** | Virtualized execution environment hosting application workloads |
| **Containerization** | Dockerfiles (`backend/Dockerfile`, `frontend/Dockerfile`) | **Implemented** | Multi-stage, reproducible, lightweight container images |
| **Cloud Storage** | Dual-mode `StorageService` & Azure Blob Storage module | **Implemented (Local) & Prepared (Azure)** | Private object storage for compiled PDF resumes with user isolation |
| **Cloud Databases** | PostgreSQL 16 + Bicep `database.bicep` | **Implemented (Local) & Prepared (Azure)** | ACID-compliant relational DB with connection pooling and SSL |
| **IAM (Identity & Access Management)** | Microsoft Entra ID (Azure AD) + MSAL.js + Token Verifier | **Implemented** | OAuth 2.0 / OpenID Connect JWT verification with role isolation |
| **Cloud Security** | Azure Key Vault + RBAC + Redaction Filter | **Implemented & Prepared** | Secret isolation, least-privilege RBAC, and credential redacting logs |
| **Resource Management** | Docker Compose limits & Bicep CPU/Memory specs | **Implemented & Prepared** | Declarative compute and memory allocation per tier |
| **Autoscaling** | Container Apps HTTP autoscaling rules (`0` to `5` replicas) | **Azure Prepared (IaC)** | Scale-to-zero in non-production; load-driven scaling |
| **Monitoring & Observability** | OpenTelemetry + App Insights + `X-Request-ID` | **Implemented & Prepared** | Distributed correlation, health probes, and log analytics |
| **REST APIs** | Flask Blueprints + Pydantic validation | **Implemented** | Stateless, standard HTTP request/response interfaces |
| **CI / CD** | GitHub Actions workflows (`ci.yml`, `deploy.yml`) | **Implemented** | Automated build, test, lint, containerization, and rollout |
| **Infrastructure as Code** | Azure Bicep modular templates (`infra/bicep/`) | **Implemented** | Declarative, version-controlled cloud infrastructure definitions |
| **Cost Optimization** | Consumption Budgets (`budget.bicep`) + Scale-to-Zero | **Implemented & Prepared** | Automated budget alerts and idle compute resource shutoff |

---

## 2. In-Depth Concept Explanations

### 2.1 Cloud Service Models: IaaS, PaaS, and SaaS

#### Explanation for Engineering Students
- **IaaS (Infrastructure as a Service)** delivers basic compute, storage, and networking hardware (e.g. Virtual Machines, virtual disks) where the user manages the OS, runtime, and application.
- **PaaS (Platform as a Service)** delivers a fully managed runtime environment where the cloud provider manages the operating system, patches, and hardware, and developers only deploy application code or containers (e.g. Azure Container Apps, managed PostgreSQL).
- **SaaS (Software as a Service)** delivers a complete end-user application accessible over the web without the user managing any infrastructure (e.g. Microsoft 365, Google Docs).

#### CloudResumeAI Implementation
- **SaaS Component**: The CloudResumeAI web application itself acts as SaaS for job applicants who create, edit, AI-tailor, and download resumes via a browser.
- **PaaS Component**: In Azure, CloudResumeAI is designed to run entirely on PaaS services: **Azure Container Apps** (serverless container platform) and **Azure Database for PostgreSQL Flexible Server** (managed database).
- **IaaS Component**: The underlying virtualization layer that hosts containers.
- **Status**: SaaS is **Implemented**; PaaS is **Prepared via Azure Bicep IaC**; local development uses Docker Compose to simulate PaaS services.

---

### 2.2 Virtualization vs. Containerization

#### Explanation for Engineering Students
- **Virtualization (Hypervisor-based)** simulates entire computer hardware systems, running a guest operating system on top of a hypervisor. This introduces significant storage, memory, and startup latency overhead.
- **Containerization (OS-level virtualization)** shares the host OS kernel and isolates processes using Linux namespaces and cgroups. Containers are lightweight, launch in milliseconds, and ensure consistent execution across developer machines and cloud production servers.

#### CloudResumeAI Implementation
- **Frontend Container (`frontend/Dockerfile`)**: A 2-stage build:
  1. *Build Stage*: Node.js 20 Alpine compiles TypeScript and bundles HTML/CSS/JS via Vite.
  2. *Production Stage*: Unprivileged Nginx Alpine image serves static assets and reverse-proxies `/api` traffic.
- **Backend Container (`backend/Dockerfile`)**: Multi-stage Python 3.12 image with a non-root system user (`clouduser`), running Gunicorn WSGI.
- **Status**: **Fully Implemented**. Tested locally via Docker Compose and validated in CI.

---

### 2.3 Cloud Object Storage

#### Explanation for Engineering Students
Unlike relational databases that store structured tables, or block storage that acts like a hard drive, **Object Storage** stores unstructured data (images, PDFs, videos) as discrete blobs with unique URIs and custom metadata. Object storage scales virtually without limits and is far cheaper than relational database storage.

#### CloudResumeAI Implementation
- **Component**: `backend/app/services/storage_service.py` and `infra/bicep/modules/storage.bicep`.
- **How it works**:
  - Resumes compiled by ReportLab are binary PDF streams. Rather than storing large binary blobs in PostgreSQL (which degrades database performance), CloudResumeAI writes PDFs to object storage.
  - Uses private blob containers without public anonymous access.
  - Multi-tenancy is enforced by partitioning paths: `users/{user_id}/resumes/{resume_id}.pdf`.
- **Status**: **Fully Implemented**. Local filesystem simulation with path traversal defense is active in development; Azure Blob Storage SDK integration is implemented and tested via mocks.

---

### 2.4 Cloud Databases & Managed RDBMS

#### Explanation for Engineering Students
In on-premises systems, administrators must manually install, patch, backup, and cluster databases. In cloud computing, **Managed Databases** automate automated backups, point-in-time recovery, high availability, storage autoscaling, and TLS encryption.

#### CloudResumeAI Implementation
- **Component**: PostgreSQL 16 container locally; `infra/bicep/modules/database.bicep` for Azure.
- **How it works**:
  - The application connects via standard PostgreSQL connection strings (`DATABASE_URL`).
  - Schema migrations are automated with Alembic/Flask-Migrate.
  - Enforces SSL connection (`sslmode=require`) in production environments.
- **Status**: **Implemented locally** (Docker PostgreSQL 16 container); **Prepared for Azure** (Flexible Server B1ms burstable tier).

---

### 2.5 Identity & Access Management (IAM)

#### Explanation for Engineering Students
IAM manages digital identities, authentication (verifying *who* a user is), and authorization (verifying *what* an authenticated user is permitted to do). Modern cloud applications delegate identity to standard OAuth 2.0 / OpenID Connect identity providers rather than storing plaintext passwords.

#### CloudResumeAI Implementation
- **Component**: `frontend/src/auth/` (MSAL.js) and `backend/app/services/token_verifier.py`.
- **How it works**:
  - Users sign in using Microsoft Entra ID. The browser receives a signed JWT token.
  - The token is transmitted as an `Authorization: Bearer <JWT>` HTTP header.
  - The backend dynamically queries Microsoft's public JWKS endpoint (`https://login.microsoftonline.com/common/discovery/v2.0/keys`), verifies the RSA signature, checks issuer and audience claims, and extracts the verified user identity.
  - In Azure, the backend container uses a **User-Assigned Managed Identity** to authenticate to Key Vault and Blob Storage with zero stored passwords.
- **Status**: **Fully Implemented**.

---

### 2.6 Cloud Security & Least Privilege

#### Explanation for Engineering Students
The **Principle of Least Privilege** states that an application or user should possess only the bare minimum permissions necessary to perform its intended job. Storing secrets (API keys, database passwords) in source code repositories is a major security vulnerability.

#### CloudResumeAI Implementation
- **Zero Secrets in Code**: Sourced from environment variables or Azure Key Vault.
- **Azure RBAC Roles**:
  - `Storage Blob Data Contributor`: Scoped only to the resume blob storage account.
  - `Key Vault Secrets User`: Scoped only to reading application secrets.
  - `AcrPull`: Scoped only to pulling images from Azure Container Registry.
- **Data Protection**: `SensitiveDataFilter` scrubs JWT tokens and API keys from all application logs before they reach disk or Azure Monitor.
- **Security Auditing**: `SecurityMonitor` audits repeated authentication failures and flags cross-user access attempts.
- **Status**: **Fully Implemented**.

---

### 2.7 Autoscaling & Elasticity

#### Explanation for Engineering Students
**Elasticity** is the ability of cloud systems to dynamically allocate or deallocate compute resources in real time to match fluctuating workload demands, ensuring consistent response times during peak usage while avoiding over-paying during idle periods.

#### CloudResumeAI Implementation
- **Component**: `infra/bicep/modules/backend.bicep` and `frontend.bicep`.
- **How it works**:
  - Azure Container Apps HTTP scale rules are declared in Bicep:
    ```bicep
    scale: {
      minReplicas: environment == 'prod' ? 1 : 0
      maxReplicas: 5
      rules: [
        {
          name: 'http-rule'
          http: {
            metadata: {
              concurrentRequests: '50'
            }
          }
        }
      ]
    }
    ```
  - When traffic increases beyond 50 concurrent requests per replica, the platform automatically provisions additional containers up to 5 instances. When idle in development, replicas scale down to 0 to save costs.
- **Status**: **Prepared in Bicep IaC**.

---

### 2.8 Observability & Distributed Monitoring

#### Explanation for Engineering Students
In distributed cloud architectures, requests travel across reverse proxies, frontend SPAs, API services, databases, and third-party AI APIs. **Observability** encompasses structured logging, distributed tracing (matching a user request across all services using a correlation ID), and metric collection.

#### CloudResumeAI Implementation
- **Component**: `backend/app/utils/logging.py` and `backend/app/services/telemetry.py`.
- **How it works**:
  - Incoming requests receive an `X-Request-ID` header, propagated across logs and response headers.
  - Request execution latency is returned via `Server-Timing: total;dur=<ms>`.
  - Gemini API latency is tracked separately: `Server-Timing: gemini;dur=<ms>`.
  - Microsoft `azure-monitor-opentelemetry` sends traces and exceptions to Azure Application Insights and a Log Analytics workspace.
  - Standard liveness (`/api/health/live`) and readiness (`/api/health/ready`) probes enable container orchestrators to manage traffic routing.
- **Status**: **Fully Implemented**.

---

### 2.9 Infrastructure as Code (IaC)

#### Explanation for Engineering Students
Infrastructure as Code is the practice of managing and provisioning computing infrastructure through machine-readable definition files, rather than physical hardware configuration or interactive web consoles. IaC guarantees consistency, eliminates manual configuration drift, and allows infrastructure changes to be reviewed via version control.

#### CloudResumeAI Implementation
- **Component**: `infra/bicep/main.bicep` and modular templates in `infra/bicep/modules/`.
- **How it works**:
  - Declarative Azure Bicep code provisions the complete cloud footprint: Resource Groups, Managed Identities, Container Registry, Storage Account, Key Vault, PostgreSQL Flexible Server, Container Apps Environment, and Container Apps.
  - Parameter files (`parameters.dev.json` and `parameters.prod.json`) allow identical architecture to be deployed across development and production environments.
- **Status**: **Fully Implemented & Automated** in GitHub Actions workflows.

---

### 2.10 Cost Optimization in Cloud Computing

#### Explanation for Engineering Students
Cloud computing operates on a utility billing model (pay-for-what-you-use). Unmanaged cloud resources quickly generate excessive bills. Effective cloud engineering requires proactive architectural choices: burstable instance tiers, scale-to-zero when idle, and hard budget alarms.

#### CloudResumeAI Implementation
- **Scale to Zero**: Non-production Container Apps set `minReplicas = 0`, ensuring \$0 compute charges when the app is not receiving traffic.
- **Burstable Database**: Uses `Standard_B1ms` burstable PostgreSQL tier (~$12-15/month).
- **Consumption Budgets**: `infra/bicep/modules/budget.bicep` configures an Azure Consumption Budget with automated email notifications when spending hits 50%, 75%, 90%, and 100% of the assigned monthly budget.
- **Status**: **Implemented & Prepared in IaC**.

