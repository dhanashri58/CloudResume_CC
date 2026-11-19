variable "project_id" {
  type = string
}

variable "region" {
  type = string
}

variable "workload_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "repository_url" {
  type = string
}

variable "service_account_email" {
  type = string
}

variable "gcs_bucket_name" {
  type = string
}

variable "gemini_api_key" {
  type      = string
  sensitive = true
}

variable "gemini_model" {
  type    = string
  default = "gemini-3.5-flash-lite"
}

variable "flask_secret_key" {
  type      = string
  sensitive = true
}

variable "db_user" {
  type = string
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "db_host" {
  type = string
}

variable "db_name" {
  type = string
}

variable "cors_origins" {
  type    = string
  default = "*"
}
