resource "google_artifact_registry_repository" "docker_repo" {
  project       = var.project_id
  location      = var.region
  repository_id = "${var.workload_name}-repo"
  description   = "Docker container registry for CloudResumeAI"
  format        = "DOCKER"
}

output "repository_id" {
  value = google_artifact_registry_repository.docker_repo.repository_id
}

output "repository_url" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker_repo.repository_id}"
}
