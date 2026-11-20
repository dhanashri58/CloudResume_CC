# Local Setup, Development & Multi-Cloud Deployment Guide

This guide walks you through setting up and running **CloudResumeAI** locally on your workstation, running tests, executing with Docker Compose, and deploying to **Amazon Web Services (AWS)**, **Google Cloud Platform (GCP)**, and **Microsoft Azure**.

---

## Live Production Deployment on AWS

| Cloud Component | Service | Endpoint / Resource | Region |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | **AWS Amplify Hosting (CloudFront CDN)** | [https://main.dfikzx2dg0tka.amplifyapp.com](https://main.dfikzx2dg0tka.amplifyapp.com) | `ap-southeast-2` |
| **Backend API** | **AWS Lambda (Function URL)** | [https://dcjovytpk37z6noqf7et5nt3uq0lnrvj.lambda-url.ap-southeast-2.on.aws/api/health](https://dcjovytpk37z6noqf7et5nt3uq0lnrvj.lambda-url.ap-southeast-2.on.aws/api/health) | `ap-southeast-2` |
| **Relational Database** | **Amazon RDS (PostgreSQL 16.14)** | `cloudresume-postgres.cd8ewc4qw5qp.ap-southeast-2.rds.amazonaws.com:5432` | `ap-southeast-2` |
| **Object Storage** | **Amazon S3** | `s3://cloudresume-resumes-tanmay-617711904818` | `ap-southeast-2` |
| **Container Registry** | **Amazon ECR** | `617711904818.dkr.ecr.ap-southeast-2.amazonaws.com/cloudresume-backend` | `ap-southeast-2` |

> **Security Notice**: Never commit real passwords, tokens, or API keys. Always use placeholder values in `.env.example` templates and keep real `.env` files in `.gitignore`.

---

## 1. Prerequisites

Before starting, ensure you have the following installed on your machine:
- **Node.js**: `v20.x` or later (LTS recommended) and `npm v10+`
- **Python**: `v3.12` or `v3.13`
- **Git**: `v2.40+`
- **(Optional)**: Docker & Docker Compose (for containerized mode)
- **(Optional for Cloud Deploy)**: Google Cloud CLI (`gcloud`) or Azure CLI (`az`)

---

## 2. Local Workstation Setup

### 2.1 1-Click Quickstart (`start.bat`) 🚀 (Windows)

The repository includes a unified, zero-configuration launcher:

```cmd
start.bat
```
*(Or double-click `start.bat` in File Explorer).*

The launcher automatically:
1. Verifies Python and Node.js installations.
2. Initializes the backend virtual environment (`backend/venv`) and installs dependencies.
3. Installs frontend npm packages (`frontend/node_modules`).
4. Creates `.env` files configured for instant **SQLite** execution (`cloudresume.db`) with zero external daemons required.
5. Initializes the database schema.
6. Launches the **Backend API** (port 5000) and **Frontend SPA** (port 5173) in dedicated, titled console windows.
7. Opens `http://localhost:5173` automatically in your default browser.

---

### 2.2 Manual Dual-Terminal Setup

#### Step 1: Backend Setup (Terminal 1 - Port 5000)

```powershell
cd backend

# 1. Activate Python virtual environment
.\venv\Scripts\activate      # Windows
# source venv/bin/activate   # macOS / Linux

# 2. Install dependencies (if not already installed)
pip install -r requirements-dev.txt

# 3. Start Flask REST API
python wsgi.py
```
Backend API will start on `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`).

#### Step 2: Frontend Setup (Terminal 2 - Port 5173)

```powershell
cd frontend

# 1. Start Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser. All `/api/*` network calls are automatically reverse-proxied to `http://localhost:5000`.

---

## 3. Full Docker Compose Execution (Single Command)

To run the complete containerized stack:

```bash
docker-compose up --build
```

- **Frontend SPA**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **Health Check**: `http://localhost:3000/api/health`
- **PostgreSQL Database**: `localhost:5432`

To stop all services:
```bash
docker-compose down
```

---

## 4. Running the Automated Test Suites

CloudResumeAI includes **180 automated tests** passing with 100% success:

### 4.1 Backend Pytest & Flake8 (128 Tests)
```bash
cd backend
.\venv\Scripts\activate

# 1. Linting (0 errors)
flake8 app tests

# 2. Run all 128 tests
pytest tests -v
```

### 4.2 Frontend Vitest & TypeScript Check (52 Tests)
```bash
cd frontend

# 1. Run unit tests
npm test -- --run

# 2. Run TypeScript compilation check
npx tsc -b

# 3. Build production bundle
npm run build
```

---

## 5. Google Cloud Platform (GCP) 1-Click Deployment Guide

Deploy the entire platform to your Google Cloud project using our automated PowerShell script:

### 5.1 Prerequisites
1. An active Google Cloud account with the free trial (\$300 credits) activated.
2. Google Cloud CLI (`gcloud`) installed.
3. Your GCP Project ID: `cloudresume-ai`.

### 5.2 1-Click PowerShell Deployment
Run from the root directory:
```powershell
.\scripts\deploy-gcp.ps1 -ProjectId "cloudresume-ai"
```

The script automatically:
1. Enables the required Google Cloud APIs (`run.googleapis.com`, `storage.googleapis.com`, `artifactregistry.googleapis.com`, `secretmanager.googleapis.com`).
2. Creates the private Google Cloud Storage bucket: `gs://cloudresumeai-resumes-cloudresume-ai`.
3. Creates the Google Artifact Registry repository: `cloudresumeai-repo`.
4. Builds and pushes the backend and frontend Docker containers.
5. Deploys both services onto **Google Cloud Run (v2)** with **Scale-to-Zero** enabled.
6. Returns the live public URLs (e.g. `https://cloudresumeai-frontend-xxxx-uc.a.run.app`).

### 5.3 Live Cloud Dashboards
Once deployed, monitor your resources in real-time on Google Cloud Console:
- **Cloud Run Services**: [https://console.cloud.google.com/run?project=cloudresume-ai](https://console.cloud.google.com/run?project=cloudresume-ai)
- **Cloud Storage Bucket**: [https://console.cloud.google.com/storage/browser?project=cloudresume-ai](https://console.cloud.google.com/storage/browser?project=cloudresume-ai)
- **Secret Manager**: [https://console.cloud.google.com/security/secret-manager?project=cloudresume-ai](https://console.cloud.google.com/security/secret-manager?project=cloudresume-ai)
- **Cloud Logging (Logs Explorer)**: [https://console.cloud.google.com/logs/query?project=cloudresume-ai](https://console.cloud.google.com/logs/query?project=cloudresume-ai)

---

## 6. Microsoft Azure Cloud Deployment (Secondary Target)

The project also maintains complete Azure Bicep templates for multi-cloud redundancy:
- **IaC Templates**: Located in [`infra/bicep/main.bicep`](infra/bicep/main.bicep).
- **Target Services**: Azure Container Apps, Azure Blob Storage, Azure Key Vault, Azure Database for PostgreSQL Flexible Server, and Application Insights.
- **Workflow**: Automated via GitHub Actions in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
