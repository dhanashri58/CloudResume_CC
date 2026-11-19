variable "project_id" {
  description = "The Google Cloud Platform (GCP) Project ID."
  type        = string
}

variable "region" {
  description = "The default GCP region for serverless compute and database resources."
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Target deployment environment (dev, staging, prod)."
  type        = string
  default     = "dev"
}

variable "workload_name" {
  description = "Workload prefix used for consistent resource naming."
  type        = string
  default     = "cloudresumeai"
}

variable "db_user" {
  description = "PostgreSQL database user."
  type        = string
  default     = "cloudresume_user"
}

variable "db_password" {
  description = "PostgreSQL database password."
  type        = string
  sensitive   = true
}

variable "db_tier" {
  description = "Cloud SQL machine tier (e.g., db-f1-micro for free-tier/dev, db-custom-1-3840 for prod)."
  type        = string
  default     = "db-f1-micro"
}

variable "flask_secret_key" {
  description = "Flask session encryption secret key."
  type        = string
  sensitive   = true
}

variable "gemini_api_key" {
  description = "Google Gemini AI API Key for resume ATS analysis and generation."
  type        = string
  sensitive   = true
}

variable "gemini_model" {
  description = "Gemini model version."
  type        = string
  default     = "gemini-3.5-flash-lite"
}

variable "google_client_id" {
  description = "Optional Google OAuth Client ID for identity verification."
  type        = string
  default     = ""
}

variable "cors_origins" {
  description = "Allowed CORS origins for the backend API."
  type        = string
  default     = "*"
}
