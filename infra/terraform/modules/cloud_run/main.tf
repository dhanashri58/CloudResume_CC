resource "google_cloud_run_v2_service" "backend_service" {
  name     = "${var.workload_name}-backend-${var.environment}"
  location = var.region
  project  = var.project_id
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = var.service_account_email

    scaling {
      min_instance_count = var.environment == "prod" ? 1 : 0
      max_instance_count = 5
    }

    containers {
      image = "${var.repository_url}/backend:latest"

      ports {
        container_port = 5000
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "1Gi"
        }
      }

      env {
        name  = "FLASK_ENV"
        value = var.environment
      }

      env {
        name  = "STORAGE_PROVIDER"
        value = "gcs"
      }

      env {
        name  = "GCS_BUCKET_NAME"
        value = var.gcs_bucket_name
      }

      env {
        name  = "GCP_PROJECT_ID"
        value = var.project_id
      }

      env {
        name  = "GEMINI_MODEL"
        value = var.gemini_model
      }

      env {
        name  = "GEMINI_API_KEY"
        value = var.gemini_api_key
      }

      env {
        name  = "SECRET_KEY"
        value = var.flask_secret_key
      }

      env {
        name  = "DATABASE_URL"
        value = "postgresql+psycopg2://${var.db_user}:${var.db_password}@${var.db_host}:5432/${var.db_name}"
      }

      env {
        name  = "CORS_ORIGINS"
        value = var.cors_origins
      }

      startup_probe {
        http_get {
          path = "/api/health/live"
          port = 5000
        }
        period_seconds   = 10
        failure_threshold = 3
      }

      liveness_probe {
        http_get {
          path = "/api/health/live"
          port = 5000
        }
        period_seconds   = 15
        failure_threshold = 3
      }
    }
  }
}

resource "google_cloud_run_v2_service_iam_member" "backend_public" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.backend_service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_v2_service" "frontend_service" {
  name     = "${var.workload_name}-frontend-${var.environment}"
  location = var.region
  project  = var.project_id
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    scaling {
      min_instance_count = var.environment == "prod" ? 1 : 0
      max_instance_count = 5
    }

    containers {
      image = "${var.repository_url}/frontend:latest"

      ports {
        container_port = 80
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }
    }
  }
}

resource "google_cloud_run_v2_service_iam_member" "frontend_public" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.frontend_service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

output "backend_url" {
  value = google_cloud_run_v2_service.backend_service.uri
}

output "frontend_url" {
  value = google_cloud_run_v2_service.frontend_service.uri
}
