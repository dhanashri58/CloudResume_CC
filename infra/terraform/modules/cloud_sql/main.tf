resource "random_id" "db_suffix" {
  byte_length = 3
}

resource "google_sql_database_instance" "postgres_instance" {
  name             = "${var.workload_name}-psql-${var.environment}-${random_id.db_suffix.hex}"
  project          = var.project_id
  region           = var.region
  database_version = "POSTGRES_16"

  settings {
    tier              = var.db_tier
    availability_type = var.environment == "prod" ? "REGIONAL" : "ZONAL"
    disk_size         = 10
    disk_type         = "PD_SSD"

    backup_configuration {
      enabled = var.environment == "prod"
    }

    ip_configuration {
      ipv4_enabled = true
      # Authorized networks for connection or Cloud SQL Auth Proxy
      authorized_networks {
        name  = "all"
        value = "0.0.0.0/0"
      }
    }
  }

  deletion_protection = var.environment == "prod"
}

resource "google_sql_database" "database" {
  name     = "${var.workload_name}_${var.environment}"
  project  = var.project_id
  instance = google_sql_database_instance.postgres_instance.name
}

resource "google_sql_user" "db_user" {
  name     = var.db_user
  project  = var.project_id
  instance = google_sql_database_instance.postgres_instance.name
  password = var.db_password
}

output "instance_connection_name" {
  value = google_sql_database_instance.postgres_instance.connection_name
}

output "public_ip" {
  value = google_sql_database_instance.postgres_instance.public_ip_address
}

output "database_name" {
  value = google_sql_database.database.name
}
