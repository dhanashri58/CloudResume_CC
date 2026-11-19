#!/usr/bin/env bash
# ==============================================================================
# CloudResumeAI - 1-Click GCP Deployment Script (Bash / Linux / macOS / Cloud Shell)
# ==============================================================================
set -euo pipefail

echo "=========================================================="
echo "      Deploying CloudResumeAI to Google Cloud Platform     "
echo "=========================================================="

# 1. Check GCP Project
PROJECT_ID="${1:-$(gcloud config get-value project 2>/dev/null || echo '')}"
REGION="${2:-us-central1}"

if [ -z "$PROJECT_ID" ]; then
    echo "ERROR: GCP Project ID is required."
    echo "Usage: ./scripts/deploy-gcp.sh <PROJECT_ID> [REGION]"
    exit 1
fi

echo "[*] Using GCP Project: $PROJECT_ID"
echo "[*] Using GCP Region:  $REGION"
gcloud config set project "$PROJECT_ID"

# 2. Enable Required Google Cloud APIs
echo "[*] Enabling Google Cloud Services..."
gcloud services enable \
    run.googleapis.com \
    storage.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com \
    cloudbuild.googleapis.com \
    sqladmin.googleapis.com

# 3. Create Artifact Registry repository if not exists
REPO_NAME="cloudresumeai-repo"
if ! gcloud artifacts repositories describe "$REPO_NAME" --location="$REGION" &>/dev/null; then
    echo "[*] Creating Artifact Registry repository: $REPO_NAME..."
    gcloud artifacts repositories create "$REPO_NAME" \
        --repository-format=docker \
        --location="$REGION" \
        --description="Docker repository for CloudResumeAI"
fi

REGISTRY_URL="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}"

# 4. Create GCS Bucket for Resumes
BUCKET_NAME="cloudresumeai-resumes-${PROJECT_ID}"
if ! gsutil ls -b "gs://${BUCKET_NAME}" &>/dev/null; then
    echo "[*] Creating Google Cloud Storage bucket: gs://${BUCKET_NAME}..."
    gsutil mb -p "$PROJECT_ID" -c standard -l "$REGION" -b on "gs://${BUCKET_NAME}"
fi

# 5. Build and Deploy Backend Container to Cloud Run
echo "[*] Building backend container image..."
gcloud builds submit backend \
    --tag "${REGISTRY_URL}/backend:latest"

echo "[*] Deploying Backend to Cloud Run..."
BACKEND_SERVICE="cloudresumeai-backend"
gcloud run deploy "$BACKEND_SERVICE" \
    --image "${REGISTRY_URL}/backend:latest" \
    --platform managed \
    --region "$REGION" \
    --allow-unauthenticated \
    --port 5000 \
    --memory 1Gi \
    --set-env-vars "STORAGE_PROVIDER=gcs,GCS_BUCKET_NAME=${BUCKET_NAME},GCP_PROJECT_ID=${PROJECT_ID},FLASK_ENV=production,DEV_AUTH_ENABLED=true"

BACKEND_URL=$(gcloud run services describe "$BACKEND_SERVICE" --platform managed --region "$REGION" --format "value(status.url)")
echo "[+] Backend URL: $BACKEND_URL"

# 6. Build and Deploy Frontend Container to Cloud Run
echo "[*] Building frontend container image with VITE_API_BASE_URL=${BACKEND_URL}..."
gcloud builds submit frontend \
    --tag "${REGISTRY_URL}/frontend:latest"

echo "[*] Deploying Frontend to Cloud Run..."
FRONTEND_SERVICE="cloudresumeai-frontend"
gcloud run deploy "$FRONTEND_SERVICE" \
    --image "${REGISTRY_URL}/frontend:latest" \
    --platform managed \
    --region "$REGION" \
    --allow-unauthenticated \
    --port 80 \
    --memory 512Mi

FRONTEND_URL=$(gcloud run services describe "$FRONTEND_SERVICE" --platform managed --region "$REGION" --format "value(status.url)")

echo "=========================================================="
echo "                Deployment Successful!                   "
echo "=========================================================="
echo "Frontend URL: $FRONTEND_URL"
echo "Backend URL:  $BACKEND_URL"
echo "Health Check: ${BACKEND_URL}/api/health"
echo "=========================================================="
