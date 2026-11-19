variable "project_id" {
  type = string
}

variable "gemini_api_key" {
  type      = string
  sensitive = true
}

variable "flask_secret_key" {
  type      = string
  sensitive = true
}

variable "db_password" {
  type      = string
  sensitive = true
}
