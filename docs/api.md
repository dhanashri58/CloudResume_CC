# REST API Specification & Endpoint Documentation

## 1. API Architecture Overview

The CloudResumeAI backend provides a RESTful JSON API organized under the `/api` prefix.

Key API conventions:
- **Authentication**: Endpoints marked **Authenticated** require a valid Microsoft Entra ID JWT Bearer token in the `Authorization: Bearer <token>` header, or a valid `X-Dev-User-Email` header when running in local development mode.
- **Request Tracing**: All endpoints accept an optional `X-Request-ID` header. If omitted, the server generates a unique trace ID (`req-<12-hex>`) and returns it in the response header.
- **Latency Telemetry**: Performance headers are emitted on every response:
  - `Server-Timing: total;dur=<ms>` on all endpoints.
  - `Server-Timing: gemini;dur=<ms>` on Gemini AI endpoints.
- **Status Codes**: Standard HTTP status codes (200, 201, 400, 401, 404, 422, 500, 503, 504) are returned with structured error payloads.

---

## 2. Health & Monitoring Endpoints

### 2.1 `GET /api/health`
- **Auth Required**: None (Public)
- **Purpose**: Comprehensive health check verifying database and storage dependencies.
- **Response**:
  ```json
  {
    "status": "healthy",
    "service": "cloudresumeai-backend",
    "version": "0.1.0",
    "timestamp": "2026-11-04T18:15:00.000000Z",
    "environment": "development",
    "database": {
      "status": "connected",
      "message": "PostgreSQL connection successful"
    },
    "storage": {
      "mode": "local",
      "status": "configured"
    }
  }
  ```
- **Error Codes**: Returns `200 OK` with `"status": "degraded"` if database is unreachable (masks internal credentials).

### 2.2 `GET /api/health/live`
- **Auth Required**: None (Public)
- **Purpose**: Kubernetes/Container Apps liveness probe confirming process execution.
- **Response**:
  ```json
  {
    "status": "alive",
    "timestamp": "2026-11-04T18:15:00.000000Z"
  }
  ```
- **Status Code**: `200 OK`.

### 2.3 `GET /api/health/ready`
- **Auth Required**: None (Public)
- **Purpose**: Container Apps readiness probe checking if backend can serve traffic.
- **Response (Ready)**: `200 OK`
  ```json
  {
    "status": "ready",
    "database": "connected"
  }
  ```
- **Error Codes**: `503 Service Unavailable` if database is disconnected.

---

## 3. Resume Management Endpoints

### 3.1 `GET /api/resumes`
- **Auth Required**: Yes
- **Purpose**: List all resumes belonging to the authenticated user.
- **Response (200 OK)**:
  ```json
  {
    "count": 1,
    "resumes": [
      {
        "id": "c4b1e7f0-32a1-46b2-a4f7-e5b128527a01",
        "title": "Cloud Engineer Resume",
        "template_id": "executive",
        "status": "draft",
        "target_role": "Cloud DevOps Engineer",
        "target_company": "Microsoft",
        "ats_score": 88,
        "views": 3,
        "created_at": "2026-11-04T10:00:00Z",
        "updated_at": "2026-11-04T10:30:00Z"
      }
    ]
  }
  ```
- **Error Codes**: `401 Unauthorized`.

### 3.2 `POST /api/resumes`
- **Auth Required**: Yes
- **Purpose**: Create a new resume with optional child sections (experiences, educations, projects, skills).
- **Request Body**:
  ```json
  {
    "title": "Cloud Engineer Resume",
    "template_id": "modern",
    "target_role": "Cloud Architect",
    "target_company": "Contoso Cloud",
    "full_name": "Jane Doe",
    "email": "jane@example.com",
    "summary": "Experienced cloud developer specializing in Azure and Flask.",
    "experiences": [
      {
        "company": "Tech Corp",
        "role": "Cloud Engineer",
        "start_date": "2024-01",
        "is_current": true,
        "bullets": ["Designed Azure Bicep templates for 10 microservices."],
        "order_index": 0
      }
    ],
    "skills": [
      {
        "category": "Cloud & DevOps",
        "skills": ["Azure", "Docker", "Bicep", "GitHub Actions"],
        "order_index": 0
      }
    ]
  }
  ```
- **Response**: `201 Created` with full created resume object.
- **Error Codes**: `401 Unauthorized`, `422 Validation Error` (malformed payload).

### 3.3 `GET /api/resumes/<resume_id>`
- **Auth Required**: Yes
- **Purpose**: Fetch complete resume details including all nested collections.
- **Response**: `200 OK` with full resume details.
- **Error Codes**: `401 Unauthorized`, `404 Not Found` (if resume does not exist or belongs to another user).

### 3.4 `PUT /api/resumes/<resume_id>`
- **Auth Required**: Yes
- **Purpose**: Update resume metadata and child collections.
- **Request Body**: Partial or full fields from `ResumeUpdateSchema`.
- **Response**: `200 OK` with updated resume object.
- **Error Codes**: `401 Unauthorized`, `404 Not Found`, `422 Validation Error`.

### 3.5 `DELETE /api/resumes/<resume_id>`
- **Auth Required**: Yes
- **Purpose**: Delete a resume, cascading to child records and deleting cached PDF from storage.
- **Response**: `200 OK`
  ```json
  {
    "message": "Resume deleted successfully.",
    "id": "c4b1e7f0-32a1-46b2-a4f7-e5b128527a01"
  }
  ```
- **Error Codes**: `401 Unauthorized`, `404 Not Found`.

### 3.6 `POST /api/resumes/<resume_id>/export-pdf` & `GET /api/resumes/<resume_id>/export-pdf`
- **Auth Required**: Yes
- **Purpose**: Generate and stream a publication-ready PDF compiled via ReportLab and cached in blob storage.
- **Response**: `200 OK` with `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="<title>.pdf"`.
- **Error Codes**: `401 Unauthorized`, `404 Not Found`, `500 PDF Generation Error`.

---

## 4. User Profile Endpoints

### 4.1 `GET /api/profile`
- **Auth Required**: Yes
- **Purpose**: Fetch current user account and profile settings.
- **Response (200 OK)**:
  ```json
  {
    "id": "usr-12345",
    "email": "student@example.edu",
    "profile": {
      "first_name": "Jane",
      "last_name": "Doe",
      "headline": "Cloud Computing Student",
      "phone": "+1 555-0199",
      "location": "Seattle, WA",
      "website": "https://janedoe.dev",
      "linkedin": "https://linkedin.com/in/janedoe",
      "github": "https://github.com/janedoe"
    }
  }
  ```
- **Error Codes**: `401 Unauthorized`.

### 4.2 `PUT /api/profile`
- **Auth Required**: Yes
- **Purpose**: Update user profile information.
- **Request Body**: JSON containing fields to update (`first_name`, `last_name`, `phone`, `location`, `headline`, `website`, `linkedin`, `github`).
- **Response**: `200 OK` with updated profile.
- **Error Codes**: `401 Unauthorized`, `422 Validation Error`.

---

## 5. Gemini AI Assistant Endpoints

### 5.1 `GET /api/ai/status`
- **Auth Required**: None (Public)
- **Purpose**: Check if the Gemini API key is configured and verify the active model name.
- **Response (200 OK)**:
  ```json
  {
    "available": true,
    "model": "gemini-3.5-flash-lite",
    "message": "Gemini AI features are ready."
  }
  ```

### 5.2 `POST /api/ai/improve-summary`
- **Auth Required**: Yes
- **Purpose**: Transform a raw summary into a compelling, professional career summary.
- **Request Body**:
  ```json
  {
    "summary": "I am a student who knows Python and Azure.",
    "target_role": "Junior Cloud Architect"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "improved_summary": "Aspiring Cloud Architect with strong competencies in Python, Microsoft Azure, and automated infrastructure...",
    "responseTimeMs": 950
  }
  ```
- **Error Codes**: `401 Unauthorized`, `422 Validation Error`, `503 AI Service Unavailable`, `504 Gateway Timeout`.

### 5.3 `POST /api/ai/improve-experience`
- **Auth Required**: Yes
- **Purpose**: Transform experience descriptions into action-oriented bullet points using the Google XYZ formula ("Accomplished [X], as measured by [Y], by doing [Z]").
- **Request Body**:
  ```json
  {
    "text": "Created docker containers for the project",
    "role": "Cloud DevOps Intern",
    "company_or_project": "OpenSource Lab"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "improved_bullets": [
      "Containerized 3-tier microservice using Docker, reducing developer onboarding time by 60%.",
      "Configured multi-stage Docker builds to reduce production image size from 1.2GB to 180MB."
    ],
    "responseTimeMs": 1120
  }
  ```
- **Error Codes**: `401 Unauthorized`, `422 Validation Error`, `503 AI Service Unavailable`, `504 Gateway Timeout`.

### 5.4 `POST /api/ai/match-job`
- **Auth Required**: Yes
- **Purpose**: Compare resume content against a target job description; computes ATS compatibility score (0-100), key matching keywords, missing keywords, and specific recommendations.
- **Request Body**:
  ```json
  {
    "job_description": "Looking for a Cloud Engineer with Docker, Kubernetes, Bicep, and PostgreSQL experience.",
    "resume_content": "Experience with Docker, PostgreSQL, Azure Bicep, and Python Flask."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "score": 85,
    "matching_keywords": ["Docker", "PostgreSQL", "Bicep"],
    "missing_keywords": ["Kubernetes"],
    "recommendations": [
      "Highlight hands-on Kubernetes orchestration or container orchestration exposure in your project bullets."
    ],
    "responseTimeMs": 1420
  }
  ```
- **Error Codes**: `401 Unauthorized`, `422 Validation Error`, `503 AI Service Unavailable`, `504 Gateway Timeout`.

### 5.5 `POST /api/ai/chat`
- **Auth Required**: Yes
- **Purpose**: Real-time conversational AI resume coach.
- **Request Body**:
  ```json
  {
    "messages": [
      {"role": "user", "content": "How can I present my academic projects better?"}
    ],
    "resume_context": {
      "title": "Cloud Computing Resume",
      "target_role": "DevOps Engineer"
    }
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "reply": "Focus on the measurable impact of your project: specify technologies used, cloud architecture deployed, and performance metrics achieved.",
    "responseTimeMs": 1050
  }
  ```
- **Error Codes**: `401 Unauthorized`, `422 Validation Error`, `503 AI Service Unavailable`, `504 Gateway Timeout`.

