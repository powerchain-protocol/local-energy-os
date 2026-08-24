terraform {
  required_version = ">= 1.10.0, < 2.0.0"
}

variable "environment" {
  type        = string
  description = "Deployment environment name"
  default     = "staging"
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "environment must be development, staging, or production"
  }
}

variable "region" {
  type        = string
  description = "Primary cloud region"
  default     = "us-east-1"
}

output "deployment_summary" {
  value = {
    application = "powerchain-platform"
    version     = "1.0.0"
    environment = var.environment
    region      = var.region
  }
}
