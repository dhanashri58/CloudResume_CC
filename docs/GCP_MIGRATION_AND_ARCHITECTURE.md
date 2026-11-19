# CloudResumeAI — Google Cloud Platform (GCP) Architecture & Migration Guide

> **Course**: Cloud Computing & Distributed Systems Lab (Course Project - CP)  
> **Project Title**: CloudResumeAI — AI-Powered Cloud Resume Engineering Platform  
> **Target Cloud**: Google Cloud Platform (GCP)  
> **Infrastructure as Code**: Terraform (`infra/terraform/`)  
> **Serverless Compute**: Google Cloud Run  
> **Managed Storage & Database**: Google Cloud Storage (GCS) & Google Cloud SQL (PostgreSQL 16)  
> **AI Foundation**: Google Gemini (`gemini-3.5-flash-lite` / `gemini-1.5-flash`) via Google GenAI SDK  

---

## 1. Executive Summary: Why GCP for CloudResumeAI?

While our initial prototype demonstrated cloud infrastructure using Azure Bicep, migrating to **Google Cloud Platform (GCP)** elevates this project into a truly unified, cloud-native ecosystem for one fundamental reason:

> **Gemini AI is Google's native flagship foundational model.**  
> By hosting our application on **Google Cloud Platform**, the serverless compute (Cloud Run), storage (Cloud Storage), secrets (Secret Manager), and intelligence layer (Google Gemini) reside in the **same Google Cloud global backbone network**, drastically slashing latency, simplifying IAM security, and leveraging GCP's generous **Free Tier and Student Credits**.

---

## 2. Cloud Architecture Mapping: Azure vs. GCP

| Architectural Layer | Previous (Azure) | Implemented (Google Cloud Platform - GCP) | Academic Justification |
| :--- | :--- | :--- | :--- |
| **Serverless Compute** | Azure Container Apps | **Google Cloud Run (v2)** | Knative-based fully managed container runtime. Automatically scales from 0 to N instances in sub-seconds. **Scale-to-zero eliminates idle cost.** |
| **Object / Blob Storage** | Azure Blob Storage | **Google Cloud Storage (GCS)** | Private, uniform bucket-level access with AES-256 server-side encryption. User resumes isolated at `resumes/{user_id}/{resume_id}.pdf`. |
| **Managed RDBMS** | Azure Database for PostgreSQL | **Google Cloud SQL for PostgreSQL 16** | ACID-compliant relational storage, automated daily backups, point-in-time recovery, high availability. |
| **Secrets Management** | Azure Key Vault | **Google Cloud Secret Manager** | Secure, versioned secrets for `GEMINI_API_KEY`, DB passwords, and Flask session keys. Zero secrets committed to source code. |
| **Container Registry** | Azure Container Registry (ACR) | **Google Artifact Registry** | Secure OCI-compliant container repository for frontend and backend Docker images. |
| **AI Orchestration** | Google Gemini API (external call) | **Google Gemini AI (Google Cloud Ecosystem)** | Sub-second latency, structured JSON response mode, exponential backoff, ATS scoring, and XYZ experience rewriting. |
| **Infrastructure as Code** | Azure Bicep | **HashiCorp Terraform (`infra/terraform`)** | The open-source industry standard for declarative multi-cloud infrastructure orchestration. |
| **Identity & Access** | Microsoft Entra ID | **Google Identity Services / OAuth 2.0 + Dev Auth** | JWT token verification against `https://www.googleapis.com/oauth2/v3/certs`, with zero-config Dev Auth for offline evaluation. |
| **CI / CD Automation** | GitHub Actions (Azure Login) | **GitHub Actions (`deploy-gcp.yml`)** | Automated linting, test suites (118 tests), multi-stage Docker builds, Artifact Registry push, and Cloud Run revision rollout. |
| **Observability** | Azure Monitor / App Insights | **Google Cloud Logging & Cloud Monitoring** | Structured JSON logging with `X-Request-ID` correlation, latency metrics, and health probes (`/api/health`). |

---

## 3. High-Level GCP System Architecture Diagram

```mermaid
graph TD
    subgraph ClientTier["Client Tier (User Browser)"]
        Browser["React 18 Single Page Application<br/>(Tailwind CSS + Lucide Icons)"]
    end

    subgraph GCP["Google Cloud Platform (GCP) us-central1"]
        subgraph ServerlessCompute["Cloud Run (Fully Managed Serverless Containers)"]
            FrontendRun["Cloud Run: Frontend Service<br/>(Nginx 1.27 + React SPA :80)"]
            BackendRun["Cloud Run: Backend Service<br/>(Python 3.12 Flask + Gunicorn :5000)"]
        end

        subgraph ContainerRegistry["Google Artifact Registry"]
            DockerRepo["cloudresumeai-repo<br/>(Docker Images)"]
        end

        subgraph CloudStorage["Google Cloud Storage (GCS)"]
            GCSBucket["Private Bucket: cloudresumeai-resumes<br/>(Resumes: resumes/{user_id}/{resume_id}.pdf)"]
        end

        subgraph CloudDatabase["Google Cloud SQL"]
            CloudSQL["PostgreSQL 16 Instance<br/>(Users, Resumes, Profiles, ATS History)"]
        end

        subgraph Security["Google Cloud Secret Manager"]
            Secrets["GEMINI-API-KEY<br/>DATABASE-PASSWORD<br/>SECRET-KEY"]
        end

        subgraph AIService["Google Generative AI"]
            Gemini["Google Gemini AI Engine<br/>(gemini-3.5-flash-lite / gemini-1.5-flash)"]
        end
    end

    Browser -->|HTTPS :443| FrontendRun
    Browser -->|REST API Calls /api/*| BackendRun
    DockerRepo -->|Pulls Images| FrontendRun
    DockerRepo -->|Pulls Images| BackendRun
    BackendRun -->|SQLAlchemy / SQL Engine| CloudSQL
    BackendRun -->|GCS Python SDK (Upload/Download)| GCSBucket
    BackendRun -->|SecretManager SDK (Fetch Secrets)| Secrets
    BackendRun -->|Google GenAI SDK (HTTPS)| Gemini
```

---

## 4. Subsystems Implementation Details

### 4.1 Serverless Compute on Google Cloud Run
- **Why Cloud Run?** Unlike traditional virtual machines (Google Compute Engine), Cloud Run is **serverless containerization**. When no requests arrive, instance count drops to **0** (cost is \$0.00). When a traffic burst occurs, Cloud Run automatically spins up new container instances in milliseconds.
- **Port Handling**: Cloud Run passes a dynamic `$PORT` environment variable (default `8080` in production). Our `backend/Dockerfile` and Gunicorn entrypoint dynamically read `0.0.0.0:${PORT:-5000}`.
- **Health Probes**: Integrated startup and liveness probes query `/api/health/live` to guarantee zero-downtime rolling deployments.

### 4.2 Storage Service: Dual-Mode with Google Cloud Storage (GCS)
Located in `backend/app/services/storage_service.py`:
- Implements `GoogleCloudStorageProvider(BaseStorageProvider)`.
- When `STORAGE_PROVIDER=gcs` (or `GCP_PROJECT_ID` is set), files are streamed directly to GCS via `google-cloud-storage`.
- In local development or testing without cloud credentials, it transparently falls back to `LocalStorageProvider` (`storage/blobs/`), ensuring developer velocity.
- **Security**: The bucket has `uniform_bucket_level_access = true` and `allUsers` read permissions are disabled. Resumes are downloadable only through authenticated backend API streams (`/api/resumes/<id>/pdf`).

### 4.3 Secrets Management: Google Cloud Secret Manager
Located in `backend/app/services/keyvault_service.py`:
- `KeyVaultService.get_gcp_secret(secret_name, project_id)` retrieves encrypted values from `projects/{project_id}/secrets/{secret_name}/versions/latest`.
- Zero secrets exist in source code or git history.
- Automatic fallback to `.env` / environment variables for local testing.

### 4.4 Authentication & Identity Verification
Located in `backend/app/services/token_verifier.py`:
- Validates JWT tokens against Google's public JWKS authority (`https://www.googleapis.com/oauth2/v3/certs`) when Google Identity is active.
- Seamless Dev Auth mode (`DEV_AUTH_ENABLED=1`) enables grading and testing without configuring external OAuth consent screens.

---

## 5. Infrastructure as Code (Terraform) Structure

All GCP infrastructure is codified in `infra/terraform/`:

```text
infra/terraform/
├── versions.tf                       # Terraform & Google provider constraints
├── variables.tf                      # Input variables (project_id, region, db credentials)
├── main.tf                           # Root orchestrator invoking all modules
├── outputs.tf                        # Output endpoints (Backend URL, Frontend URL, GCS Bucket)
├── terraform.tfvars.example          # Variable template for easy configuration
└── modules/
    ├── iam/                          # Least-privilege Service Account & IAM roles
    ├── artifact_registry/            # Artifact Registry Docker repository
    ├── cloud_storage/                # Encrypted GCS bucket with CORS rules
    ├── secret_manager/               # Google Cloud Secret Manager secrets
    ├── cloud_sql/                    # PostgreSQL 16 Cloud SQL instance
    └── cloud_run/                    # Frontend and Backend Cloud Run services
```

---

## 6. How to Deploy (Step-by-Step for Group Members)

### Method 1: 1-Click Automated Script (Recommended)

#### On Windows (PowerShell):
```powershell
# Run the deployment script with your GCP project ID
.\scripts\deploy-gcp.ps1 -ProjectId "your-gcp-project-id" -Region "us-central1"
```

#### On Linux / macOS / Google Cloud Shell:
```bash
chmod +x ./scripts/deploy-gcp.sh
./scripts/deploy-gcp.sh "your-gcp-project-id" "us-central1"
```

**What this script does automatically**:
1. Verifies Google Cloud CLI authentication.
2. Enables all necessary APIs (Cloud Run, Cloud Build, GCS, Artifact Registry, Secret Manager).
3. Creates the Artifact Registry Docker repository.
4. Creates the secure GCS bucket for resume storage.
5. Builds and deploys the backend container to Cloud Run.
6. Builds and deploys the frontend React container to Cloud Run.
7. Outputs your live website URLs!

---

### Method 2: Deploying via Terraform

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your GCP project ID and Gemini API key
# Then run:
terraform init
terraform plan
terraform apply -auto-approve
```

---

### Method 3: Running Locally (Zero Cloud Setup Needed)

If you need to demonstrate the project offline or locally to your teacher:
```bash
# Terminal 1: Backend
cd backend
.\.venv\Scripts\activate
python wsgi.py

# Terminal 2: Frontend
cd frontend
npm run dev
```
Open `http://localhost:5173` — the app runs with full Dev Auth and local vector PDF generation!

---

## 7. Cloud Computing Syllabus Concepts Demonstrated

When your teacher asks: *"How does this project demonstrate Cloud Computing?"*, highlight these 10 core concepts:

1. **Platform as a Service (PaaS) & Serverless Compute**:
   - Google Cloud Run abstracts all virtual machine provisioning, OS patching, and network routing. We only deploy our containerized workload.
2. **Elastic Autoscaling & Scale-to-Zero**:
   - Cloud Run dynamically scales from 0 to 5 instances based on incoming request load, demonstrating dynamic capacity provisioning.
3. **Object Storage vs. Block Storage**:
   - Resumes and binary PDFs are stored as immutable objects in Google Cloud Storage (GCS) with distinct URIs and metadata, rather than block volumes.
4. **Relational Database as a Service (DBaaS)**:
   - Google Cloud SQL provides managed PostgreSQL 16 with automated failover, point-in-time recovery, and connection management.
5. **Infrastructure as Code (IaC)**:
   - Declarative provisioning using Terraform (`infra/terraform/`) guarantees repeatable, version-controlled cloud environments.
6. **Zero-Trust Security & Secrets Management**:
   - Credentials (API keys, database passwords) are stored exclusively in Google Cloud Secret Manager and accessed via IAM roles with no hardcoded credentials.
7. **Principle of Least Privilege (PoLP)**:
   - Cloud Run executes under a dedicated service account (`cloudresumeai-runner`) possessing only the exact permissions needed (`roles/cloudsql.client`, `roles/storage.objectUser`, `roles/secretmanager.secretAccessor`).
8. **Containerization & OCI Portability**:
   - Multi-stage Docker builds ensure identical execution across local developer workstations, CI/CD runners, and Cloud Run.
9. **Continuous Integration & Continuous Deployment (CI/CD)**:
   - GitHub Actions workflow (`.github/workflows/deploy-gcp.yml`) automates automated testing (118 Pytest unit tests), container builds, and deployment.
10. **Cost Engineering & Cloud Economics**:
    - Utilizing Cloud Run's scale-to-zero and Cloud SQL's `db-f1-micro` tier ensures the entire deployment runs within Google Cloud's **Always Free Tier**.

---

## 8. Presentation & Viva Q&A Cheat Sheet

#### Q1: Why did you decide to use Google Cloud Platform (GCP)?
> *"Our project natively integrates Google Gemini AI for ATS scoring and resume tailoring. By deploying our backend on Google Cloud Run and storage on Google Cloud Storage, our entire stack resides within the Google Cloud ecosystem, maximizing network throughput, eliminating third-party AI egress hops, and leveraging Google's native IAM and Secret Manager security."*

#### Q2: What is the difference between Google Cloud Run and Google Compute Engine (VMs)?
> *"Compute Engine is Infrastructure as a Service (IaaS) where we must manage OS updates, firewall rules, and pay for 24/7 idle CPU runtime. Cloud Run is a serverless Container Platform (PaaS) that runs our Docker containers on-demand, scales automatically with HTTP traffic, and scales down to zero when idle, resulting in zero cost when no requests are being processed."*

#### Q3: Where are the resume PDF files stored and how are they kept private?
> *"Resumes are generated server-side using Python ReportLab and stored as binary blobs in Google Cloud Storage (GCS) under private, user-isolated prefixes: `resumes/{user_id}/{resume_id}.pdf`. Public bucket access is completely blocked (`uniform_bucket_level_access = true`), and files can only be accessed by authenticated users through our backend API."*

#### Q4: How is security handled for API keys and database passwords?
> *"We follow the Cloud 12-Factor App methodology and Zero Secrets in Code principle. Sensitive keys like the Gemini API Key and PostgreSQL password are encrypted in Google Cloud Secret Manager. The backend service account retrieves them at runtime via IAM role `roles/secretmanager.secretAccessor`."*

#### Q5: How do you handle continuous deployment to GCP?
> *"We built an automated GitHub Actions pipeline (`deploy-gcp.yml`). On dispatch, it runs our 118 unit tests, builds the production Docker images, pushes them to Google Artifact Registry, and deploys new revisions to Google Cloud Run with automated health check verification (`/api/health`)."*
