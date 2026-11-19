resource "google_secret_manager_secret" "gemini_key" {
  project   = var.project_id
  secret_id = "GEMINI-API-KEY"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "gemini_key_v1" {
  secret      = google_secret_manager_secret.gemini_key.id
  secret_data = var.gemini_api_key
}

resource "google_secret_manager_secret" "flask_secret" {
  project   = var.project_id
  secret_id = "SECRET-KEY"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "flask_secret_v1" {
  secret      = google_secret_manager_secret.flask_secret.id
  secret_data = var.flask_secret_key
}

resource "google_secret_manager_secret" "db_password" {
  project   = var.project_id
  secret_id = "DATABASE-PASSWORD"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "db_password_v1" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = var.db_password
}

output "gemini_secret_id" {
  value = google_secret_manager_secret.gemini_key.secret_id
}

output "flask_secret_id" {
  value = google_secret_manager_secret.flask_secret.secret_id
}
