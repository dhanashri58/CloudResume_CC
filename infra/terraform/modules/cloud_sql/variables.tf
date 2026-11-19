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

variable "db_tier" {
  type    = string
  default = "db-f1-micro"
}

variable "db_user" {
  type    = string
  default = "cloudresume_user"
}

variable "db_password" {
  type      = string
  sensitive = true
}
