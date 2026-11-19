# CloudResumeAI - Google Cloud Platform (GCP) Infrastructure as Code

This directory contains the production-grade **Terraform** configuration for provisioning CloudResumeAI on **Google Cloud Platform (GCP)**.

---

## Architecture Overview

```
                                +---------------------------+
                                |      GitHub Actions       |
                                |     (CI / CD Pipeline)    |
                                +-------------+-------------+
                                              |
                       +----------------------+----------------------+
                       | Builds & pushes images to                  |
                       v                                            v
        +-----------------------------+               +----------------------------+
        |  Google Artifact Registry   |               |    Automated Test Suites   |
        |      (Docker Registry)      |               |  (Vitest & Pytest on Push) |
        +--------------+--------------+               +----------------------------+
                       |
                       v
        +-----------------------------------------------------------+
        |                 Google Cloud Run (Serverless)             |
        |                                                           |
        |   +-----------------------+   +-----------------------+   |
        |   |   Frontend Service    |   |    Backend Service    |   |
        |   |    (React / Nginx)    |-->|     (Python Flask)    |   |
        |   +-----------------------+   +-----------+-----------+   |
        |                                           |               |
        +-------------------------------------------|---------------+
                                                    |
         +--------------------+---------------------+--------------------+
         |                    |                                          |
         v                    v                                          v
+------------------+ +-----------------------------------+ +--------------------+
|  Secret Manager  | | Google Cloud SQL for PostgreSQL   | |   Cloud Storage    |
| (API Keys & Keys)| | (Managed RDBMS - PostgreSQL 16)   | | (Private Bucket)   |
+------------------+ +-----------------------------------+ +--------------------+
```

---

## Resource Modules

| Module | GCP Service | Purpose |
| :--- | :--- | :--- |
| `iam` | Cloud IAM | Least-privilege service account for Cloud Run (`cloudresumeai-runner`) |
| `artifact_registry` | Artifact Registry | Secure Docker repository storing backend & frontend images |
| `cloud_storage` | Cloud Storage (GCS) | Private, encrypted bucket storing vector resume PDFs |
| `secret_manager` | Secret Manager | Zero-secret management for `GEMINI_API_KEY`, database credentials |
| `cloud_sql` | Cloud SQL | PostgreSQL 16 managed database with automated backups |
| `cloud_run` | Cloud Run | Fully managed containerized microservices with scale-to-zero |

---

## Prerequisites

1. Install [Google Cloud CLI (`gcloud`)](https://cloud.google.com/sdk/docs/install).
2. Install [Terraform (>= 1.5.0)](https://developer.hashicorp.com/terraform/install).
3. Authenticate with GCP:
   ```bash
   gcloud auth login
   gcloud auth application-default login
   gcloud config set project YOUR_PROJECT_ID
   ```
4. Enable necessary GCP APIs:
   ```bash
   gcloud services enable \
     run.googleapis.com \
     sqladmin.googleapis.com \
     storage.googleapis.com \
     secretmanager.googleapis.com \
     artifactregistry.googleapis.com \
     compute.googleapis.com
   ```

---

## Deployment Steps

1. Copy variable template:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```
2. Edit `terraform.tfvars` with your project ID, Gemini API key, and database password.
3. Initialize Terraform:
   ```bash
   terraform init
   ```
4. Preview the changes:
   ```bash
   terraform plan
   ```
5. Apply infrastructure:
   ```bash
   terraform apply -auto-approve
   ```
6. Once deployed, Terraform will output the public URLs:
   - `backend_url`: `https://cloudresumeai-backend-dev-xyz.a.run.app`
   - `frontend_url`: `https://cloudresumeai-frontend-dev-xyz.a.run.app`
