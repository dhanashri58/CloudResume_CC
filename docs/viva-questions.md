# CloudResumeAI: Viva & Oral Exam Preparation Guide

This guide contains frequently asked viva / oral examination questions, standard concise answers, and technical rationale for evaluators reviewing **CloudResumeAI** in a Cloud Computing Course Project (CP) curriculum.

---

## 1. Cloud Architecture & Service Models

### Q1: What cloud service models does CloudResumeAI use?
**Answer**:
CloudResumeAI utilizes all primary cloud service models across its architecture:
- **SaaS (Software as a Service)** from the end-user perspective: Users access the web application through a browser to build, edit, AI-tailor, and download resumes without managing any underlying infrastructure.
- **Serverless / PaaS (Platform as a Service)** from the compute perspective: Deployed onto **Google Cloud Run (v2)** (and Azure Container Apps). The cloud provider fully manages hardware, container orchestration, OS patching, and network ingress.
- **DBaaS (Database as a Service)** from the persistence perspective: Deployed onto **Google Cloud SQL for PostgreSQL 16** (or Azure Flexible Server) with automated backups, point-in-time recovery, and SSL encryption.
- **Object Storage as a Service**: Resumes are decoupled from the database and stored in **Google Cloud Storage (GCS)** buckets with user partition isolation.
- **IaaS (Infrastructure as a Service)**: The underlying virtualized hardware nodes managed by Google Cloud.

### Q2: Why did you choose Google Cloud Run (Serverless) instead of Virtual Machines (IaaS)?
**Answer**:
1. **Cost Efficiency & Scale-to-Zero**: Cloud Run scales down to **0 instances** (`min_instance_count = 0`) when no requests are active. This completely eliminates idle compute billing (\$0.00). Traditional VMs (like Compute Engine) run 24/7 and incur continuous charges even when idle.
2. **Automated Elasticity**: Cloud Run automatically scales up in milliseconds based on concurrent request load (configured to 80 concurrent requests per container).
3. **Container Portability**: Cloud Run runs standard OCI-compliant Docker containers, ensuring identical execution between local workstations, CI/CD pipelines, and cloud production.
4. **Zero Server Maintenance**: Google automatically manages operating system updates, security patches, TLS certificates, and HTTP load balancing.

### Q3: What is Infrastructure as Code (IaC), and how does your project implement it?
**Answer**:
Infrastructure as Code is the practice of provisioning and managing cloud infrastructure using declarative, version-controlled definition files instead of manual clicks in web consoles.
In CloudResumeAI, we implement IaC using **HashiCorp Terraform (`infra/terraform/`)**:
- `modules/artifact_registry`: Container image repository.
- `modules/cloud_run`: Serverless microservices for frontend and backend.
- `modules/cloud_storage`: Private GCS bucket for resume storage.
- `modules/secret_manager`: Cloud Secret Manager for API keys and database credentials.
- `modules/cloud_sql`: PostgreSQL 16 database instance.
- `modules/iam`: Least-privilege service account permissions.
*(We also provide secondary Azure Bicep templates in `infra/bicep/` for multi-cloud parity).*

---

## 2. Containerization & Docker

### Q4: Why use multi-stage Docker builds?
**Answer**:
Multi-stage builds separate the compile-time dependencies from the runtime environment:
- In the **Frontend Dockerfile**: Stage 1 uses Node.js 20 Alpine to compile TypeScript and bundle assets with Vite. Stage 2 copies only the compiled static HTML/CSS/JS (`dist/`) into a lightweight Nginx Alpine image. This slashes image size from ~800MB to ~30MB and eliminates Node.js runtime attack surfaces in production.
- In the **Backend Dockerfile**: Compiles dependencies and copies the virtual environment wheels into a slim Python 3.12 runner running under a non-root system user (`clouduser`).

### Q5: What is the difference between Docker Compose and Kubernetes? Why use Docker Compose locally?
**Answer**:
- **Docker Compose** is a lightweight tool for running multi-container applications on a single host. It is ideal for local development, rapid testing, and zero-cost academic evaluation.
- **Kubernetes** is an enterprise container orchestration platform designed for multi-node clustering and service meshes. For a 3-tier application, Kubernetes introduces excessive operational overhead, network complexity, and high hosting costs. In production, **Google Cloud Run** provides Kubernetes-like capabilities (it runs on Knative under the hood) without requiring manual cluster management.

---

## 3. Storage & Databases

### Q6: Why did you store generated PDF resumes in Google Cloud Storage (GCS) instead of inside the PostgreSQL database?
**Answer**:
1. **Database Bloat**: Storing binary large objects (BLOBs) directly in PostgreSQL tables as `BYTEA` increases database storage size, degrades cache efficiency, and slows down database backups.
2. **Cost Optimization**: Cloud Object Storage (GCS) is significantly cheaper per gigabyte than high-performance SSD database storage.
3. **Direct Streaming & Scalability**: GCS is optimized for binary file streaming and massive concurrency, allowing resumes to be served efficiently.

### Q7: How do you prevent one user from accessing another user's resume PDF (Multi-Tenancy & Data Isolation)?
**Answer**:
Data isolation is enforced across three defensive layers:
1. **Database Level**: Every resume query enforces `WHERE user_id = :current_user_id`.
2. **Storage Path Partitioning**: PDFs are stored with a strictly partitioned key: `resumes/{user_id}/{resume_id}.pdf`.
3. **Backend Authorization Verification**: Before downloading from storage, `StorageService.validate_user_access()` verifies that the requested blob prefix matches `g.current_user.id`. Any mismatch raises `StorageAccessDeniedError`, returns HTTP 404, and flags an audit event in `SecurityMonitor`.

---

## 4. Security, IAM & Observability

### Q8: How does Cloud Identity (IAM / OIDC) work in your application?
**Answer**:
We use standard OAuth 2.0 with OpenID Connect (OIDC):
1. The user authenticates against Google Identity Services or Microsoft Entra ID.
2. The identity provider issues a digitally signed JWT (JSON Web Token).
3. The frontend passes this token in the `Authorization: Bearer <token>` header.
4. The Flask backend fetches the provider's public RSA signing keys from the discovery JWKS endpoint (`googleapis.com/oauth2/v3/certs`), validates the digital signature (RS256), verifies expiration and audience claims, and extracts the verified user identity without storing plaintext passwords.
5. `TokenVerifier` caches public JWKS keys in memory for 1 hour (`lifespan=3600`) to minimize network latency.

### Q9: How does the application enforce the "Zero Secrets in Code" principle?
**Answer**:
- All sensitive credentials (`GEMINI_API_KEY`, database passwords, Flask secret keys) are managed dynamically via **Google Cloud Secret Manager** (or Azure Key Vault).
- No secrets are ever hardcoded or committed to Git.
- At application startup, the service account fetches the required secret versions securely over TLS.

### Q10: How does your application protect sensitive data in application logs?
**Answer**:
We implemented a custom Python logging filter (`SensitiveDataFilter` in `app/utils/logging.py`).
Before any log statement is written to standard output or sent to Google Cloud Logging, regex patterns automatically detect and sanitize:
- Bearer JWT tokens (`Bearer [REDACTED]`)
- Google Gemini API keys (`[REDACTED_GEMINI_KEY]`)
- Database passwords (`password=[REDACTED]`)
- Secret keys (`secret=[REDACTED]`)

### Q11: What is Distributed Tracing, and how is it implemented?
**Answer**:
Distributed tracing correlates requests across microservices. In CloudResumeAI:
- Every incoming HTTP request is assigned a unique UUIDv4 `X-Request-ID` correlation identifier.
- The request execution duration is measured and injected into the response via `Server-Timing: total;dur=<ms>, gemini;dur=<ms>`.
- The `X-Request-ID` is embedded in all structured JSON log entries, allowing developers to trace a user request end-to-end in Google Cloud Logging.

---

## 5. Performance & AI Orchestration

### Q12: Why did you choose `gemini-3.5-flash-lite` over other Gemini models?
**Answer**:
Resume optimization and chat coaching require rapid response times to feel interactive. `gemini-3.5-flash-lite` delivers sub-second to ~1.2-second response latency while maintaining high precision for structured JSON extraction and resume rewriting. Larger models (e.g. `gemini-1.5-pro`) incurred latencies exceeding 8-15 seconds, which degraded user experience.

### Q13: How do you handle AI API timeouts and rate limits?
**Answer**:
1. **SDK Timeout Enforcement**: We set `types.HttpOptions(timeout=20000)` (20 seconds) directly on the Google GenAI SDK.
2. **Graceful Status Mapping**: If a request exceeds 20 seconds, the backend intercepts `DEADLINE_EXCEEDED` or socket timeouts and returns `504 Gateway Timeout` with a friendly error envelope instead of a generic 500 crash.
3. **Rate Limit Retry**: On HTTP 429 (`ResourceExhausted`) or 503 errors, the backend applies an exponential backoff retry.

---

## 6. CI/CD & Automated Testing

### Q14: What does your CI/CD pipeline do?
**Answer**:
Implemented using **GitHub Actions**:
- On every `git push` or pull request, the CI workflow (`ci.yml`):
  1. Installs Python dependencies and runs **Flake8** linting and **Pytest** (129 backend tests).
  2. Installs Node.js dependencies and runs **Vitest** (52 frontend tests), TypeScript typecheck, and Vite production build.
  3. Validates both frontend and backend Dockerfiles by building the images.
- A deployment workflow (`deploy-gcp.yml`) runs Terraform apply, pushes container images to Google Artifact Registry, and deploys new revisions to Google Cloud Run.

### Q15: How many automated tests does CloudResumeAI have, and what do they verify?
**Answer**:
CloudResumeAI has **180 automated tests** with a 100% pass rate:
- **129 Backend Tests (Pytest)**: Testing AI endpoints, token verification, ReportLab PDF generation, Amazon S3, GCS, and Azure multi-cloud storage, Alembic migrations, database models, health probes, and structured log redaction.
- **52 Frontend Tests (Vitest)**: Testing React components, API clients, authentication helpers, routing, and page rendering.
