resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "google_storage_bucket" "resumes_bucket" {
  name                        = "${var.workload_name}-resumes-${var.environment}-${random_id.bucket_suffix.hex}"
  project                     = var.project_id
  location                    = var.region
  uniform_bucket_level_access = true
  force_destroy               = var.environment != "prod"

  versioning {
    enabled = true
  }

  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

output "bucket_name" {
  value = google_storage_bucket.resumes_bucket.name
}

output "bucket_url" {
  value = google_storage_bucket.resumes_bucket.url
}
