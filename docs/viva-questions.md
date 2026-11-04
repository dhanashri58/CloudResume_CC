# CloudResumeAI: Viva & Oral Exam Preparation Guide

This guide contains frequently asked viva / oral examination questions, standard concise answers, and technical rationale for evaluators reviewing **CloudResumeAI** in a Cloud Computing course.

---

## 1. Cloud Architecture & Service Models

### Q1: What cloud service model does CloudResumeAI use?
**Answer**:
CloudResumeAI utilizes all three major cloud service models:
- **SaaS (Software as a Service)** from the end-user perspective: Users access the web application through a browser to build and download resumes without managing any software.
- **PaaS (Platform as a Service)** from the deployment perspective: The application is deployed onto Azure Container Apps (managed serverless container environment) and Azure Database for PostgreSQL Flexible Server (managed relational database).
- **IaaS (Infrastructure as a Service)** from the underlying compute perspective: Azure provisions the underlying virtual machines that host the container nodes.

### Q2: Why did you choose Azure Container Apps instead of Azure App Service or Virtual Machines (IaaS)?
**Answer**:
1. **Cost Efficiency**: Azure Container Apps features *Scale to Zero* (`minReplicas = 0`). During periods of zero traffic, the compute cost drops to $0. App Service and VMs incur continuous 24/7 billing regardless of traffic.
2. **Simplified Microservices & Portability**: Container Apps natively runs standard Docker images, meaning the exact same container running locally on Docker runs in the cloud.
3. **Built-in Ingress & Traffic Splitting**: Includes managed HTTPS certificates, ingress routing, and revision management out of the box.

### Q3: What is Infrastructure as Code (IaC), and how does your project implement it?
**Answer**:
Infrastructure as Code is the practice of managing computing infrastructure using version-controlled, declarative configuration files instead of manual portal clicks.
In CloudResumeAI, we use **Azure Bicep** (`infra/bicep/main.bicep` and modules). When deployed, Bicep provisions the Resource Group, Managed Identity, Azure Container Registry, Storage Account, Key Vault, PostgreSQL Flexible Server, and Container Apps in a single repeatable, audited deployment.

---

## 2. Containerization & Docker

### Q4: Why use multi-stage Docker builds?
**Answer**:
Multi-stage builds separate the build environment from the runtime environment:
- In the **Frontend Dockerfile**: Stage 1 uses Node.js 20 to install build tools, execute TypeScript compiler, and bundle Vite assets. Stage 2 copies only the compiled static files (`dist/`) into a lightweight Nginx Alpine image. This reduces image size from ~800MB to ~30MB and eliminates Node.js runtime vulnerabilities in production.
- In the **Backend Dockerfile**: Compiles dependencies and copies only virtual environment wheels into a slim Python 3.12 runner running under a non-root user (`clouduser`).

### Q5: What is the difference between Docker Compose and Kubernetes? Why use Docker Compose here?
**Answer**:
- **Docker Compose** is a lightweight tool for defining and running multi-container applications on a single host. It is ideal for local development and academic projects.
- **Kubernetes** is an enterprise container orchestration platform designed for multi-node clustering, self-healing, and complex service meshes. For a 3-container application, Kubernetes introduces excessive operational overhead, network complexity, and high hosting costs. Azure Container Apps provides Kubernetes-like capabilities (it runs on AKS under the hood) without requiring manual cluster management.

---

## 3. Storage & Databases

### Q6: Why did you store generated PDF resumes in Azure Blob Storage instead of inside the PostgreSQL database?
**Answer**:
1. **Database Bloat**: Storing binary large objects (BLOBs) directly in PostgreSQL tables as `BYTEA` increases database storage size, degrades cache efficiency, and slows down database backups.
2. **Cost Optimization**: Object storage is significantly cheaper per gigabyte than high-performance SSD database storage.
3. **Direct Streaming & Caching**: Blob storage is optimized for binary file storage and retrieval, allowing resumes to be cached and served efficiently.

### Q7: How do you prevent one user from accessing another user's resume PDF?
**Answer**:
Tenant isolation is enforced in multiple layers:
1. **Database Level**: Every resume query filters by `WHERE user_id = :current_user_id`.
2. **Storage Path Partitioning**: PDFs are stored with a partitioned prefix: `users/{user_id}/resumes/{resume_id}.pdf`. The backend verifies that the requester's authenticated ID matches the path before reading from storage.
3. **Audit Logging**: Any unauthorized cross-user attempt is rejected with HTTP 404 and logged as a `[SECURITY] event=CROSS_USER_DENIED` event.

---

## 4. Security & Identity

### Q8: How does Microsoft Entra ID (Azure AD) authentication work in your application?
**Answer**:
We use standard OAuth 2.0 with OpenID Connect:
1. The user logs in via MSAL.js in the React frontend, authenticating against Microsoft Entra ID.
2. Microsoft issues a digitally signed JWT (JSON Web Token).
3. The frontend passes this token in the `Authorization: Bearer <token>` header.
4. The Flask backend fetches Microsoft's public RSA signing keys from the discovery JWKS endpoint (`https://login.microsoftonline.com/common/discovery/v2.0/keys`), validates the digital signature, verifies expiration, issuer, and audience claims, and identifies the user without ever storing a password.

### Q9: What is a Managed Identity in Azure, and why is it preferred over connection strings?
**Answer**:
A **User-Assigned Managed Identity** is an identity registered in Microsoft Entra ID that Azure automatically manages.
Instead of storing sensitive credentials (like a storage account connection string or database password) in plaintext configuration files, the application container is assigned this identity. Azure automatically injects short-lived tokens, eliminating credentials from source control and deployment logs.

### Q10: How does your application protect sensitive data in application logs?
**Answer**:
We implemented a custom Python logging filter (`SensitiveDataFilter` in `app/utils/logging.py`).
Before any log statement is written to standard output or sent to Azure Application Insights, regex patterns automatically detect and sanitize:
- Bearer JWT tokens (`Bearer [REDACTED]`)
- Google Gemini API keys (`[REDACTED_GEMINI_KEY]`)
- Database passwords (`password=[REDACTED]`)
- Secret keys (`secret=[REDACTED]`)

---

## 5. Performance & AI Orchestration

### Q11: Why did you choose `gemini-3.5-flash-lite` over other Gemini models?
**Answer**:
Resume optimization and chat coaching require rapid response times to feel interactive. `gemini-3.5-flash-lite` delivers sub-second to ~1.2-second response latency while maintaining high precision for structured JSON extraction and resume rewriting. Larger models (e.g. `gemini-1.5-pro` or `gemini-2.5-flash`) incurred latencies exceeding 8-15 seconds, which degraded user experience.

### Q12: How do you handle AI API timeouts and rate limits?
**Answer**:
1. **SDK Timeout Enforcement**: We set `types.HttpOptions(timeout=20000)` (20 seconds) directly on the Google GenAI SDK.
2. **Graceful Status Mapping**: If a request exceeds 20 seconds, the backend intercepts `DEADLINE_EXCEEDED` or socket timeouts and returns `504 Gateway Timeout` with a friendly error envelope instead of a generic 500 crash.
3. **Rate Limit Retry**: On HTTP 429 (`ResourceExhausted`) or 503 errors, the backend applies an exponential backoff retry. It never retries client errors (400, 422).

---

## 6. CI/CD & Testing

### Q13: What does your CI/CD pipeline do?
**Answer**:
Implemented using **GitHub Actions**:
- On every `git push` or pull request, the CI workflow (`ci.yml`):
  1. Installs Python dependencies and runs **Flake8** linting and **Pytest** (109 tests).
  2. Installs Node.js dependencies and runs **Vitest** (52 tests), TypeScript typecheck, and Vite production build.
  3. Validates both frontend and backend Dockerfiles by building the images.
- A separate manual deployment workflow (`deploy.yml`) uses OIDC Federated Credentials to deploy Bicep infrastructure and push container images to Azure Container Registry.

### Q14: How many automated tests does CloudResumeAI have, and what do they verify?
**Answer**:
CloudResumeAI has **161 automated tests** with a 100% pass rate:
- **109 Backend Tests (Pytest)**: Testing AI endpoints, token verification, ReportLab PDF generation, dual-mode storage, Alembic migrations, database models, health probes, and structured log redaction.
- **52 Frontend Tests (Vitest)**: Testing React components, API clients, authentication helpers, routing, and page rendering.

