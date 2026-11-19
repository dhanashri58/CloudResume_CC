output "backend_url" {
  description = "Public URL of the backend Cloud Run service."
  value       = module.cloud_run.backend_url
}

output "frontend_url" {
  description = "Public URL of the frontend Cloud Run service."
  value       = module.cloud_run.frontend_url
}

output "gcs_bucket_name" {
  description = "Private GCS bucket storing user resumes."
  value       = module.cloud_storage.bucket_name
}

output "artifact_registry_url" {
  description = "Artifact Registry Docker repository endpoint."
  value       = module.artifact_registry.repository_url
}

output "cloud_sql_ip" {
  description = "Cloud SQL PostgreSQL public IP."
  value       = module.cloud_sql.public_ip
}
