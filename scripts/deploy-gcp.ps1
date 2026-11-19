# ==============================================================================
# CloudResumeAI - 1-Click GCP Deployment Script (PowerShell / Windows)
# ==============================================================================
param (
    [Parameter(Mandatory=$false)]
    [string]$ProjectId,

    [Parameter(Mandatory=$false)]
    [string]$Region = "us-central1"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "      Deploying CloudResumeAI to Google Cloud Platform     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check or Prompt for Project ID
if (-not $ProjectId) {
    $ProjectId = (gcloud config get-value project 2>$null)
    if (-not $ProjectId -or $ProjectId -eq "(unset)") {
        $ProjectId = Read-Host "Please enter your GCP Project ID"
    }
}

if (-not $ProjectId) {
    Write-Error "GCP Project ID is required to deploy."
    exit 1
}

Write-Host "[*] GCP Project: $ProjectId" -ForegroundColor Green
Write-Host "[*] GCP Region:  $Region" -ForegroundColor Green
gcloud config set project $ProjectId

# 2. Enable Required APIs
Write-Host "[*] Enabling Required Google Cloud Services..." -ForegroundColor Yellow
gcloud services enable `
    run.googleapis.com `
    storage.googleapis.com `
    artifactregistry.googleapis.com `
    secretmanager.googleapis.com `
    cloudbuild.googleapis.com `
    sqladmin.googleapis.com

# 3. Artifact Registry
$RepoName = "cloudresumeai-repo"
$RepoCheck = (gcloud artifacts repositories list --location=$Region --filter="name:$RepoName" --format="value(name)" 2>$null)
if (-not $RepoCheck) {
    Write-Host "[*] Creating Artifact Registry repository: $RepoName..." -ForegroundColor Yellow
    gcloud artifacts repositories create $RepoName `
        --repository-format=docker `
        --location=$Region `
        --description="Docker repository for CloudResumeAI"
}

$RegistryUrl = "${Region}-docker.pkg.dev/${ProjectId}/${RepoName}"

# 4. GCS Bucket
$BucketName = "cloudresumeai-resumes-${ProjectId}"
$BucketCheck = (gsutil ls -b "gs://${BucketName}" 2>$null)
if (-not $BucketCheck) {
    Write-Host "[*] Creating Google Cloud Storage bucket: gs://${BucketName}..." -ForegroundColor Yellow
    gsutil mb -p $ProjectId -c standard -l $Region -b on "gs://${BucketName}"
}

# 5. Build and Deploy Backend
Write-Host "[*] Building backend container image via Cloud Build..." -ForegroundColor Yellow
gcloud builds submit backend --tag "${RegistryUrl}/backend:latest"

Write-Host "[*] Deploying Backend to Cloud Run..." -ForegroundColor Yellow
$BackendService = "cloudresumeai-backend"
gcloud run deploy $BackendService `
    --image "${RegistryUrl}/backend:latest" `
    --platform managed `
    --region $Region `
    --allow-unauthenticated `
    --port 5000 `
    --memory 1Gi `
    --set-env-vars "STORAGE_PROVIDER=gcs,GCS_BUCKET_NAME=${BucketName},GCP_PROJECT_ID=${ProjectId},FLASK_ENV=production,DEV_AUTH_ENABLED=true"

$BackendUrl = (gcloud run services describe $BackendService --platform managed --region $Region --format "value(status.url)")
Write-Host "[+] Backend live at: $BackendUrl" -ForegroundColor Green

# 6. Build and Deploy Frontend
Write-Host "[*] Building frontend container image via Cloud Build..." -ForegroundColor Yellow
gcloud builds submit frontend --tag "${RegistryUrl}/frontend:latest"

Write-Host "[*] Deploying Frontend to Cloud Run..." -ForegroundColor Yellow
$FrontendService = "cloudresumeai-frontend"
gcloud run deploy $FrontendService `
    --image "${RegistryUrl}/frontend:latest" `
    --platform managed `
    --region $Region `
    --allow-unauthenticated `
    --port 80 `
    --memory 512Mi

$FrontendUrl = (gcloud run services describe $FrontendService --platform managed --region $Region --format "value(status.url)")

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "                Deployment Successful!                   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Frontend URL: $FrontendUrl" -ForegroundColor Green
Write-Host "Backend URL:  $BackendUrl" -ForegroundColor Green
Write-Host "Health Check: ${BackendUrl}/api/health" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
