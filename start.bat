@echo off
setlocal enabledelayedexpansion
title CloudResumeAI - Unified Application Launcher

echo ===============================================================================
echo                ____ _                 _ ____                               _ 
echo               / ___| | ___  _   _  __| |  _ \ ___  ___ _   _ _ __ ___   ___ / \  _ _ 
echo              | |   | |/ _ \| | | |/ _` | |_) / _ \/ __| | | | '_ ` _ \ / _ / _ \(_)
echo              | |___| | (_) | |_| | (_| |  _ <  __/\__ | |_| | | | | | |  _/ ___ _ 
echo               \____|_|\___/ \__,_|\__,_|_| \_\___||___/\__,_|_| |_| |_|\__/_/   (_)
echo ===============================================================================
echo                Cloud Resume AI - Full Stack Platform Launcher
echo ===============================================================================
echo.

:: Detect root directory
set "SCRIPT_DIR=%~dp0"
if exist "%SCRIPT_DIR%CloudResume_CC" (
    set "PROJECT_ROOT=%SCRIPT_DIR%CloudResume_CC"
) else (
    set "PROJECT_ROOT=%SCRIPT_DIR%"
)

cd /d "%PROJECT_ROOT%"
echo [1/5] Verifying Project Directory: %PROJECT_ROOT%

:: Check Python installation
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python is not installed or not in PATH! Please install Python 3.12 or 3.13.
    pause
    exit /b 1
)

:: Check Node.js installation
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH! Please install Node.js v20+.
    pause
    exit /b 1
)

:: Check Backend Virtual Environment
echo [2/5] Checking Backend Python Virtual Environment...
if not exist "%PROJECT_ROOT%\backend\venv\Scripts\python.exe" (
    echo       Virtual environment not found. Creating virtual environment in backend\venv...
    cd /d "%PROJECT_ROOT%\backend"
    python -m venv venv
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to create virtual environment!
        pause
        exit /b 1
    )
    echo       Upgrading pip and installing backend dependencies (this may take a minute)...
    .\venv\Scripts\python -m pip install --upgrade pip
    .\venv\Scripts\pip install -r requirements-dev.txt
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install backend dependencies!
        pause
        exit /b 1
    )
    cd /d "%PROJECT_ROOT%"
    echo       Backend virtual environment successfully initialized!
) else (
    echo       Backend virtual environment found at backend\venv.
)

:: Check Frontend Node Modules
echo [3/5] Checking Frontend Node Modules...
if not exist "%PROJECT_ROOT%\frontend\node_modules" (
    echo       node_modules not found. Installing frontend dependencies (npm install)...
    cd /d "%PROJECT_ROOT%\frontend"
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install frontend dependencies!
        pause
        exit /b 1
    )
    cd /d "%PROJECT_ROOT%"
    echo       Frontend dependencies successfully installed!
) else (
    echo       Frontend node_modules found.
)

:: Check .env configuration files
echo [4/5] Checking Environment Configuration Files...
if not exist "%PROJECT_ROOT%\backend\.env" (
    echo       Creating backend\.env from template...
    (
        echo FLASK_ENV=development
        echo FLASK_DEBUG=1
        echo SECRET_KEY=cloudresume-super-secret-development-key-2026-xyz
        echo PORT=5000
        echo CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
        echo DATABASE_URL=sqlite:///cloudresume.db
        echo DEV_AUTH_ENABLED=true
        echo DEV_USER_EMAIL=dev@cloudresume.ai
        echo STORAGE_PROVIDER=local
        echo LOCAL_STORAGE_DIR=storage/blobs
        echo LOG_LEVEL=INFO
        echo GEMINI_MODEL=gemini-3.5-flash-lite
    ) > "%PROJECT_ROOT%\backend\.env"
)

if not exist "%PROJECT_ROOT%\frontend\.env" (
    echo       Creating frontend\.env from template...
    (
        echo VITE_API_BASE_URL=
        echo VITE_API_PROXY_TARGET=http://localhost:5000
    ) > "%PROJECT_ROOT%\frontend\.env"
)
echo       Environment files are verified.

:: Initialize database tables
echo       Ensuring database tables are initialized...
cd /d "%PROJECT_ROOT%\backend"
.\venv\Scripts\python -c "from app import create_app, db; app = create_app(); ctx = app.app_context(); ctx.push(); db.create_all();" >nul 2>nul
cd /d "%PROJECT_ROOT%"

:: Launch Services in separate titled windows
echo [5/5] Launching Backend API and Frontend Dev Server...
echo.

:: Start Backend API (Port 5000)
start "CloudResumeAI - Backend API (Port 5000)" cmd /k "cd /d ""%PROJECT_ROOT%\backend"" && title CloudResumeAI Backend API (Port 5000) && .\venv\Scripts\activate && python wsgi.py"

:: Start Frontend Vite Server (Port 5173)
start "CloudResumeAI - Frontend SPA (Port 5173)" cmd /k "cd /d ""%PROJECT_ROOT%\frontend"" && title CloudResumeAI Frontend SPA (Port 5173) && npm run dev"

:: Wait 3 seconds for servers to bind
timeout /t 3 /nobreak >nul

:: Display Dashboard
cls
echo ===============================================================================
echo                CLOUDRESUMEAI - APPLICATION SERVICES ONLINE
echo ===============================================================================
echo.
echo   [!] Frontend SPA:        http://localhost:5173
echo   [!] Backend REST API:    http://localhost:5000
echo   [!] API Health Check:    http://localhost:5000/api/health
echo   [!] Resumes Endpoint:    http://localhost:5000/api/resumes
echo   [!] Auth Endpoints:      http://localhost:5000/api/auth/login
echo   [!] AI Analysis:         http://localhost:5000/api/ai/analyze-resume
echo.
echo -------------------------------------------------------------------------------
echo   AUTHENTICATION / PERSONAS (1-Click Demo Login in Frontend):
echo   - Student:    alex.mercer@cloudresume.ai
echo   - Evaluator:  evaluator@university.edu
echo   - Recruiter:  sarah.jenkins@techcloud.io
echo   - Or register any new account using standard email/password!
echo.
echo -------------------------------------------------------------------------------
echo   STORAGE & DATABASE:
echo   - Storage Provider: Local Filesystem (storage/blobs/ with user isolation)
echo   - Database:         SQLite (backend/cloudresume.db) or PostgreSQL
echo -------------------------------------------------------------------------------
echo   Both backend and frontend services are currently running in their own windows.
echo   Opening the frontend in your browser now...
echo.

:: Automatically open browser
start http://localhost:5173

echo   Press any key to close this launcher menu (services will remain running).
pause >nul
