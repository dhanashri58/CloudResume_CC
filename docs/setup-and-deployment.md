# Local Setup, Development & Azure Deployment Guide

This guide walks you through setting up and running **CloudResumeAI** locally on your workstation, running tests, executing with Docker Compose, and deploying to Microsoft Azure using automated CI/CD.

> **Security Notice**: Never commit real passwords, tokens, or API keys. Always use placeholder values in `.env` files and keep real `.env` files in your `.gitignore`.

---

## 1. Prerequisites

Before starting, ensure you have the following installed on your machine:
- **Node.js**: `v20.x` or later (LTS recommended) and `npm v10+`
- **Python**: `v3.12`
- **Docker**: Docker Desktop or Docker Engine `v24+` with Docker Compose
- **Git**: `v2.40+`
- **(Optional for Cloud Deploy)**: Azure CLI (`az`) and GitHub account

---

## 2. Local Workstation Setup (Dual-Terminal Workflow)

### 2.1 Clone Repository & Root Inspection
```bash
git clone https://github.com/<your-username>/CLOUDRESUME_CC.git
cd CLOUDRESUME_CC
```

---

### 2.2 PostgreSQL Database Setup
You can run a local PostgreSQL database quickly using Docker:

```bash
docker run -d \
  --name cloudresumeai-postgres \
  -e POSTGRES_USER=cloudresume_user \
  -e POSTGRES_PASSWORD=cloudresume_password_placeholder \
  -e POSTGRES_DB=cloudresumeai_dev \
  -p 5432:5432 \
  postgres:16-alpine
```

Verify that the database is running:
```bash
docker ps
```

---

### 2.3 Backend Setup (Terminal 1)

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   # On Windows PowerShell:
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1

   # On macOS / Linux:
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt -r requirements-dev.txt
   ```

4. **Configure environment variables**:
   Copy the example file to `.env`:
   ```bash
   cp .env.example .env
   ```

   Edit `backend/.env` with your preferred editor:
   ```env
   FLASK_ENV=development
   FLASK_DEBUG=1
   SECRET_KEY=dev-secret-key-change-in-production
   DATABASE_URL=postgresql://cloudresume_user:cloudresume_password_placeholder@localhost:5432/cloudresumeai_dev
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000

   # Gemini AI Configuration
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-3.5-flash-lite
   GEMINI_TIMEOUT_SECONDS=20

   # Storage Configuration
   AZURE_STORAGE_MODE=local

   # Observability
   LOG_LEVEL=INFO
   ```

5. **Run database migrations**:
   ```bash
   flask db upgrade
   ```

6. **Start the backend development server**:
   ```bash
   python wsgi.py
   ```
   The backend API will start on `http://localhost:5000`.

7. **Verify health endpoint**:
   In your browser or via curl:
   ```bash
   curl http://localhost:5000/api/health
   ```
   You should receive a `200 OK` JSON response indicating the database is connected.

---

### 2.4 Frontend Setup (Terminal 2)

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Copy the example file to `.env`:
   ```bash
   cp .env.example .env
   ```

   Edit `frontend/.env`:
   ```env
   VITE_API_URL=/api
   # Microsoft Entra ID (Azure AD) - optional for local dev auth
   VITE_ENTRA_CLIENT_ID=00000000-0000-0000-0000-000000000000
   VITE_ENTRA_TENANT_ID=00000000-0000-0000-0000-000000000000
   VITE_DEV_USER_EMAIL=student@example.edu
   ```

4. **Start the frontend development server**:
   ```bash
   npm run dev
   ```
   Open your browser to `http://localhost:5173`.

---

## 3. Full Docker Compose Execution (Single Command)

To test the entire containerized stack without manually starting separate terminals:

1. **Validate docker-compose file**:
   ```bash
   docker-compose config
   ```

2. **Build and run all services**:
   ```bash
   docker-compose up --build
   ```

3. **Service breakdown**:
   - `cloudresumeai-db`: PostgreSQL 16 on `localhost:5432`
   - `cloudresumeai-backend`: Python Flask on `localhost:5000`
   - `cloudresumeai-frontend`: Nginx serving React SPA on `localhost:3000`

4. **Access the application**:
   - Frontend: `http://localhost:3000`
   - Backend Health Check: `http://localhost:3000/api/health`

5. **Stop containers**:
   ```bash
   docker-compose down
   ```

---

## 4. Running the Test Suites

### 4.1 Backend Pytest & Flake8
```bash
# In backend/ directory with .venv activated:
flake8 app tests
pytest tests -v
```

### 4.2 Frontend Vitest & TypeScript Check
```bash
# In frontend/ directory:
npm test -- --run
npm run build
```

---

## 5. Microsoft Azure Cloud Deployment Guide

The deployment pipeline is fully automated using GitHub Actions and Azure Bicep.

### 5.1 Azure Cloud Prerequisites
1. An active Microsoft Azure Subscription.
2. An Azure Resource Group (e.g. `rg-cloudresumeai-dev` in region `eastus`).
3. An App Registration configured for GitHub Actions **OIDC Federated Credentials** (zero stored secrets).

### 5.2 GitHub Repository Configuration
In your GitHub repository, navigate to **Settings -> Secrets and variables -> Actions**:

#### Action Secrets:
- `AZURE_CLIENT_ID`: App Registration / Managed Identity Client ID
- `AZURE_TENANT_ID`: Microsoft Entra Tenant ID
- `AZURE_SUBSCRIPTION_ID`: Azure Subscription ID
- `POSTGRES_ADMIN_PASSWORD`: Strong password for PostgreSQL Flexible Server
- `FLASK_SECRET_KEY`: Random 64-character string
- `GEMINI_API_KEY`: Google Gemini API key

#### Action Variables:
- `AZURE_RESOURCE_GROUP`: `rg-cloudresumeai-dev`
- `AZURE_ACR_LOGIN_SERVER`: `<your-acr-name>.azurecr.io`

### 5.3 Triggering Automated Deployment
1. Navigate to the **Actions** tab in GitHub.
2. Select the **CloudResumeAI Azure Deploy** workflow.
3. Click **Run workflow**, choose the target environment (`dev` or `prod`), and execute.
4. The workflow will:
   - Authenticate to Azure via OIDC.
   - Deploy/update infrastructure using `infra/bicep/main.bicep`.
   - Build and push container images to Azure Container Registry.
   - Update revisions in Azure Container Apps.
   - Run a live health check on the deployed endpoint.

