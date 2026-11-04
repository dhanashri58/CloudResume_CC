# System Architecture & Technical Design

## 1. System Architecture Overview

CloudResumeAI is an AI-powered resume engineering and cloud deployment platform architected specifically to demonstrate modern cloud-native principles: separation of concerns, containerization, least-privilege security, asynchronous AI orchestration, and cloud infrastructure as code.

The system is organized into a clean 5-tier architecture:

1. **Client / Presentation Layer**: Single Page Application (SPA) built with React 18, TypeScript, Tailwind CSS, and Vite. Implements Microsoft Entra authentication context, responsive resume editing interfaces, live ATS scoring, real-time AI assistant chat, and PDF preview/downloading.
2. **Application / REST API Layer**: Python 3.12 Flask service built with an Application Factory pattern. Features modular blueprints, Pydantic request/response validation, structured JSON logging, and correlation ID tracing.
3. **Domain & Business Logic Layer**: Isolated services handling authentication verification, AI prompt engineering, ReportLab PDF rendering, storage abstractions, and security event auditing.
4. **Data Persistence & Object Storage**:
   - Relational: PostgreSQL 16 (locally containerized; prepared for Azure Database for PostgreSQL Flexible Server).
   - Object/Blob Storage: Dual-mode storage engine supporting local filesystem storage with path traversal prevention and Azure Blob Storage private containers.
5. **External Cloud & AI Services**:
   - Google Gemini API (`gemini-3.5-flash-lite`) for conversational assistance and content optimization.
   - Microsoft Entra ID (Azure AD) for enterprise OAuth2/OIDC token verification.
   - Azure Key Vault for centralized cloud secret management.
   - Azure Monitor / Application Insights via OpenTelemetry for cloud observability.

---

## 2. High-Level Architecture Diagram

```mermaid
graph TD
    subgraph Client["Client Tier (Browser)"]
        UI["React 18 SPA (Vite + TypeScript)"]
        MSAL["MSAL.js Auth Provider"]
    end

    subgraph Edge["Ingress & Web Server"]
        Nginx["Nginx Reverse Proxy (:3000 / :80)"]
    end

    subgraph AppTier["Application Tier (Backend)"]
        Flask["Flask 3.0 REST API (:5000)"]
        AuthFilter["Auth Guard & Entra Verifier"]
        APIRoutes["Route Blueprints (/api/resumes, /api/ai, /api/profile, /api/health)"]
        ServiceLayer["Service Layer (Resume, AI, PDF, Storage, Security)"]
    end

    subgraph DataTier["Persistence & Storage Tier"]
        DB[(PostgreSQL 16 Database)]
        Storage{"Storage Provider"}
        LocalStorage[("Local Blob Storage: storage/blobs/")]
        AzureBlob[("Azure Blob Storage: private container")]
    end

    subgraph External["External Cloud Services"]
        Entra["Microsoft Entra ID (OIDC / JWKS)"]
        Gemini["Google Gemini API (gemini-3.5-flash-lite)"]
        AppInsights["Azure Monitor / Application Insights"]
        KeyVault["Azure Key Vault (Secrets)"]
    end

    UI -->|HTTPS / Port 3000| Nginx
    Nginx -->|Proxy /api/*| Flask
    Flask --> AuthFilter
    AuthFilter -.->|Verify JWT / Fetch JWKS| Entra
    AuthFilter --> APIRoutes
    APIRoutes --> ServiceLayer
    ServiceLayer -->|SQLAlchemy ORM| DB
    ServiceLayer --> Storage
    Storage -->|Dev Mode| LocalStorage
    Storage -->|Cloud Mode| AzureBlob
    ServiceLayer -.->|Prompt & Stream| Gemini
    Flask -.->|OpenTelemetry| AppInsights
    Flask -.->|Fetch Secrets on Boot| KeyVault
```

---

## 3. Subsystem Architectures & Workflows

### 3.1 User Authentication Flow

CloudResumeAI supports dual-mode authentication:
1. **Production Mode**: Microsoft Entra ID (Azure AD) OAuth2/OIDC JWT Bearer tokens verified against Microsoft's public JWKS endpoints with in-memory key caching.
2. **Development / Test Mode**: Controlled `X-Dev-User-Email` header, strictly rejected in production environments (`FLASK_ENV=production` or `ENV=production`).

Upon first login, the user is provisioned just-in-time (JIT) into the PostgreSQL database.

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant React as React Frontend (MSAL)
    participant Entra as Microsoft Entra ID
    participant API as Flask Backend
    participant JWKS as Microsoft JWKS Cache
    participant DB as PostgreSQL Database
    participant Sec as Security Monitor

    User->>React: Click "Sign in with Microsoft"
    React->>Entra: Authenticate (OAuth2 / OIDC)
    Entra-->>React: Return ID Token & Access Token
    User->>React: Navigate to Resume Editor
    React->>API: GET /api/resumes (Authorization: Bearer <JWT>)
    API->>API: Extract Bearer Token
    alt Token Missing or Malformed
        API->>Sec: record_auth_failure(reason, ip, endpoint)
        API-->>React: 401 Unauthorized
    else Valid Token Format
        API->>JWKS: Resolve RSA Public Key (kid)
        alt Key Not Found
            API->>Entra: Fetch latest discovery JWKS keys
            Entra-->>JWKS: Update cache
        end
        API->>API: Verify Signature, Issuer, Audience, Expiry
        API->>DB: Query User by email / auth_provider_id
        alt User Does Not Exist
            API->>DB: Create User + Initial UserProfile (JIT Provisioning)
        end
        API->>Sec: record_auth_success(ip)
        API->>DB: Fetch Resumes for User ID
        DB-->>API: Return Resumes
        API-->>React: 200 OK + Resumes Payload
    end
```

---

### 3.2 Resume Creation and PDF Export Flow

The PDF generation engine is powered by Python ReportLab, compiling resume JSON structures into high-resolution, vector-quality PDF documents. Documents are cached in the configured storage provider (Local or Azure Blob Storage) with private per-user partitioning.

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant React as React Frontend
    participant Route as Resumes Blueprint (/api/resumes)
    participant Auth as AuthService
    participant Svc as ResumeService
    participant PDF as PDFService (ReportLab)
    participant Store as StorageService
    participant DB as PostgreSQL Database

    User->>React: Click "Download PDF" (Template: Modern / Executive / Minimal)
    React->>Route: POST /api/resumes/{id}/export-pdf
    Route->>Auth: require_auth
    Auth-->>Route: Authenticated User Object
    Route->>Svc: export_pdf(resume_id, user)
    Svc->>DB: Fetch Resume + Experiences + Education + Projects + Skills
    alt Resume Not Found or Belongs to Another User
        Svc-->>Route: Return None (Audited as CROSS_USER_DENIED)
        Route-->>React: 404 Not Found
    else Resume Owned by User
        Svc->>Store: Check if cached PDF exists in blob storage
        alt Cache Miss
            Svc->>PDF: generate_resume_pdf(resume_data, template_id)
            PDF->>PDF: Compile ReportLab Canvas (Fonts, Margins, Sections)
            PDF-->>Svc: BytesIO Buffer
            Svc->>Store: save_file(user_id, blob_name, pdf_bytes)
            Store-->>Svc: Storage Path
        end
        Svc-->>Route: (pdf_buffer, download_filename)
        Route-->>React: 200 OK (Content-Type: application/pdf, Attachment)
        React->>User: Trigger Browser File Download
    end
```

---

### 3.3 Gemini AI Request Flow

The AI subsystem integrates Google Gemini (`gemini-3.5-flash-lite`) to provide instant resume summary rewriting, experience bullet bullet point optimization, job description alignment scoring, and conversational career guidance.

Features:
- Fixed SDK timeout using `types.HttpOptions(timeout=20000)`.
- Retry mechanism with exponential backoff on HTTP 429 rate limits or 503 transient overload.
- Prompt trimming to only 6 conversational messages to keep latency low.
- Request ID correlation propagated through `Server-Timing: gemini;dur=<ms>` response headers.

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant React as React Frontend
    participant Route as AI Blueprint (/api/ai/chat)
    participant AISvc as AIService
    participant GeminiSDK as Google GenAI Client
    participant GoogleAPI as Google Gemini API

    User->>React: Ask: "How can I improve my AWS project bullets?"
    React->>Route: POST /api/ai/chat (headers: X-Request-ID, Authorization)
    Route->>AISvc: chat(messages, resume_context, request_id)
    AISvc->>AISvc: Trim conversation history to last 6 messages
    AISvc->>AISvc: Assemble system prompt with resume context
    AISvc->>GeminiSDK: client.models.generate_content(model="gemini-3.5-flash-lite", config=...)
    GeminiSDK->>GoogleAPI: HTTPS POST /v1beta/models/gemini-3.5-flash-lite:generateContent
    alt Rate Limit (429) or Server Overload (503)
        GoogleAPI-->>GeminiSDK: 429 ResourceExhausted
        GeminiSDK->>AISvc: Catch Temporary Error
        AISvc->>AISvc: Backoff wait (1.5s)
        AISvc->>GeminiSDK: Retry call
        GeminiSDK->>GoogleAPI: HTTPS POST
    end
    alt Timeout (> 20s) or Deadline Exceeded
        GoogleAPI-->>GeminiSDK: DEADLINE_EXCEEDED / Socket Timeout
        GeminiSDK-->>AISvc: Timeout Exception
        AISvc-->>Route: Raise AIProcessingError(status_code=504)
        Route-->>React: 504 Gateway Timeout ("AI request timed out")
    else Success
        GoogleAPI-->>GeminiSDK: 200 OK + Candidates
        GeminiSDK-->>AISvc: Response Text
        AISvc->>AISvc: Calculate responseTimeMs
        AISvc-->>Route: {"reply": "...", "responseTimeMs": 1140}
        Route-->>React: 200 OK (Headers: Server-Timing: gemini;dur=1140, X-Request-ID)
        React->>User: Render formatted AI reply in chat bubble
    end
```

---

### 3.4 Azure Blob Storage Architecture & Workflow

Resume PDFs must remain strictly private to the user who created them. CloudResumeAI enforces zero public blob access through container configuration and strict user ID partition isolation.

```mermaid
graph TD
    subgraph StorageRouter["Storage Layer Router"]
        Mode{"AZURE_STORAGE_MODE"}
    end

    subgraph LocalStorage["Local Storage Provider (Dev)"]
        LocalPath["storage/blobs/users/{user_id}/"]
        PathCheck["Path Traversal Defense: os.path.commonpath"]
        LocalDisk[("Local Filesystem")]
    end

    subgraph CloudStorage["Azure Blob Storage Provider (Prod)"]
        AzureClient["BlobServiceClient (DefaultAzureCredential / ConnStr)"]
        BlobPath["Blob Name: users/{user_id}/resumes/{resume_id}.pdf"]
        PrivateContainer[("Azure Blob Container (Private / No Public Access)")]
    end

    Mode -->|mode == 'local'| LocalPath
    LocalPath --> PathCheck
    PathCheck --> LocalDisk

    Mode -->|mode == 'azure'| AzureClient
    AzureClient --> BlobPath
    BlobPath --> PrivateContainer
```

---

### 3.5 CI/CD and Azure Deployment Architecture

Continuous integration and infrastructure deployment are managed entirely declaratively through GitHub Actions and Azure Bicep templates.

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant Git as GitHub Repository
    participant Actions as GitHub Actions Runner
    participant ACR as Azure Container Registry
    participant Bicep as Azure Resource Manager (Bicep)
    participant ACA as Azure Container Apps
    participant App as Live Health Check

    Dev->>Git: git push origin main
    Git->>Actions: Trigger CI Workflow (.github/workflows/ci.yml)
    par Backend CI
        Actions->>Actions: Install Python 3.12 dependencies
        Actions->>Actions: Run Flake8 linting
        Actions->>Actions: Run Pytest test suite (109 tests)
    and Frontend CI
        Actions->>Actions: Install Node.js dependencies (npm ci)
        Actions->>Actions: Run Vitest test suite (52 tests)
        Actions->>Actions: Run TypeScript typecheck (tsc -b)
        Actions->>Actions: Run Production Vite build
    and Docker Validation
        Actions->>Actions: Build Backend Docker image
        Actions->>Actions: Build Frontend Docker image
    end
    Actions-->>Git: All CI Checks Green ✓

    Note over Dev,Actions: Manual Deployment via workflow_dispatch (.github/workflows/deploy.yml)
    Dev->>Git: Trigger Deploy Workflow (env: dev/prod)
    Git->>Actions: Start Deploy Workflow
    Actions->>Actions: Authenticate to Azure using OIDC Federated Credentials
    Actions->>Bicep: az deployment group create --template-file infra/bicep/main.bicep
    Bicep-->>Actions: Provisioned: ACR, Storage, Key Vault, PostgreSQL, Container Apps
    Actions->>ACR: Build & Push Docker images with Git commit SHA tags
    Actions->>ACA: Update Container Apps revisions (Frontend & Backend)
    Actions->>App: Probe GET https://<frontend-url>/api/health
    App-->>Actions: 200 OK {"status": "healthy"}
    Actions-->>Dev: Deployment Completed Successfully
```

