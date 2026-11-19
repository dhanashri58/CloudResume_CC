resource "google_service_account" "cloudresume_runner" {
  account_id   = "${var.workload_name}-runner-${var.environment}"
  display_name = "CloudResumeAI Cloud Run Service Account (${var.environment})"
  project      = var.project_id
}

# Grant least-privilege roles to the service account
resource "google_project_iam_member" "cloudsql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.cloudresume_runner.email}"
}

resource "google_project_iam_member" "secretmanager_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.cloudresume_runner.email}"
}

resource "google_project_iam_member" "storage_object_admin" {
  project = var.project_id
  role    = "roles/storage.objectUser"
  member  = "serviceAccount:${google_service_account.cloudresume_runner.email}"
}

resource "google_project_iam_member" "log_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.cloudresume_runner.email}"
}

output "service_account_email" {
  description = "Service account email used for Cloud Run workloads."
  value       = google_service_account.cloudresume_runner.email
}
