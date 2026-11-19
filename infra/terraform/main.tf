# -----------------------------------------------------------------------------
# Google Cloud Platform (GCP) Infrastructure as Code
# CloudResumeAI Root Orchestrator
# -----------------------------------------------------------------------------

# 1. Identity and Access Management (Least-Privilege Service Account)
module "iam" {
  source        = "./modules/iam"
  project_id    = var.project_id
  workload_name = var.workload_name
  environment   = var.environment
}

# 2. Google Artifact Registry (Container Images)
module "artifact_registry" {
  source        = "./modules/artifact_registry"
  project_id    = var.project_id
  region        = var.region
  workload_name = var.workload_name
}

# 3. Google Cloud Storage (Private Resume Vector PDFs)
module "cloud_storage" {
  source        = "./modules/cloud_storage"
  project_id    = var.project_id
  region        = var.region
  workload_name = var.workload_name
  environment   = var.environment
}

# 4. Google Cloud Secret Manager (API Keys & Credentials)
module "secret_manager" {
  source           = "./modules/secret_manager"
  project_id       = var.project_id
  gemini_api_key   = var.gemini_api_key
  flask_secret_key = var.flask_secret_key
  db_password      = var.db_password
}

# 5. Google Cloud SQL (PostgreSQL 16 Database)
module "cloud_sql" {
  source        = "./modules/cloud_sql"
  project_id    = var.project_id
  region        = var.region
  workload_name = var.workload_name
  environment   = var.environment
  db_tier       = var.db_tier
  db_user       = var.db_user
  db_password   = var.db_password
}

# 6. Google Cloud Run (Serverless Microservices: Backend & Frontend)
module "cloud_run" {
  source                = "./modules/cloud_run"
  project_id            = var.project_id
  region                = var.region
  workload_name         = var.workload_name
  environment           = var.environment
  repository_url        = module.artifact_registry.repository_url
  service_account_email = module.iam.service_account_email
  gcs_bucket_name       = module.cloud_storage.bucket_name
  gemini_api_key        = var.gemini_api_key
  gemini_model          = var.gemini_model
  flask_secret_key      = var.flask_secret_key
  db_user               = var.db_user
  db_password           = var.db_password
  db_host               = module.cloud_sql.public_ip
  db_name               = module.cloud_sql.database_name
  cors_origins          = var.cors_origins
}
