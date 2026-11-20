@echo off
setlocal
title CloudResumeAI - Full Stack Platform Launcher

echo ===============================================================================
echo                CLOUD RESUME AI - FULL STACK PLATFORM LAUNCHER
echo ===============================================================================
echo.

:: Resolve project root directory
set "PROJECT_ROOT=%~dp0"
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"

cd /d "%PROJECT_ROOT%"
echo [1/5] Verifying Project Directory: %PROJECT_ROOT%

:: Check Python installation
where python >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH! Please install Python 3.12 or 3.13.
    pause
    exit /b 1
)

:: Check Node.js installation
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH! Please install Node.js v20+.
    pause
    exit /b 1
)

:: Check Backend Virtual Environment
echo [2/5] Checking Backend Python Virtual Environment...
if exist "%PROJECT_ROOT%\backend\venv\Scripts\python.exe" goto venv_exists

echo       Virtual environment not found. Creating in backend\venv...
cd /d "%PROJECT_ROOT%\backend"
python -m venv venv
if errorlevel 1 (
    echo [ERROR] Failed to create virtual environment!
    pause
    exit /b 1
)
echo       Installing backend dependencies...
call .\venv\Scripts\python -m pip install --upgrade pip
call .\venv\Scripts\pip install -r requirements-dev.txt
if errorlevel 1 (
    echo [ERROR] Failed to install backend dependencies!
    pause
    exit /b 1
)
cd /d "%PROJECT_ROOT%"
echo       Backend virtual environment successfully initialized!

:venv_exists
if exist "%PROJECT_ROOT%\backend\venv\Scripts\python.exe" (
    echo       Backend virtual environment verified.
)

:: Check Frontend Node Modules
echo [3/5] Checking Frontend Node Modules...
if exist "%PROJECT_ROOT%\frontend\node_modules" goto modules_exist

echo       node_modules not found. Running npm install...
cd /d "%PROJECT_ROOT%\frontend"
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install frontend dependencies!
    pause
    exit /b 1
)
cd /d "%PROJECT_ROOT%"
echo       Frontend dependencies successfully installed!

:modules_exist
if exist "%PROJECT_ROOT%\frontend\node_modules" (
    echo       Frontend dependencies verified.
)

:: Check .env configuration files
echo [4/5] Checking Environment Configuration Files...
if exist "%PROJECT_ROOT%\backend\.env" goto check_frontend_env

echo       Creating backend\.env template...
copy /y "%PROJECT_ROOT%\backend\.env.example" "%PROJECT_ROOT%\backend\.env" >nul

:check_frontend_env
if exist "%PROJECT_ROOT%\frontend\.env" goto env_done

echo       Creating frontend\.env template...
copy /y "%PROJECT_ROOT%\frontend\.env.example" "%PROJECT_ROOT%\frontend\.env" >nul

:env_done
echo       Environment files verified.

:: Initialize database tables
echo       Ensuring database tables are initialized...
cd /d "%PROJECT_ROOT%\backend"
call .\venv\Scripts\python -c "from app import create_app, db; app = create_app(); ctx = app.app_context(); ctx.push(); db.create_all();" >nul 2>nul
cd /d "%PROJECT_ROOT%"

:: Launch Services in separate titled windows
echo [5/5] Launching Backend API and Frontend Dev Server...
echo.

start "CloudResumeAI - Backend API (Port 5000)" cmd /k "cd /d ""%PROJECT_ROOT%\backend"" && title CloudResumeAI Backend API (Port 5000) && call .\venv\Scripts\activate.bat && python wsgi.py"

start "CloudResumeAI - Frontend SPA (Port 5173)" cmd /k "cd /d ""%PROJECT_ROOT%\frontend"" && title CloudResumeAI Frontend SPA (Port 5173) && npm run dev"

:: Wait 3 seconds for servers to bind
ping -n 4 127.0.0.1 >nul

cls
echo ===============================================================================
echo                CLOUDRESUMEAI - APPLICATION SERVICES ONLINE
echo ===============================================================================
echo.
echo   [*] Frontend SPA:        http://localhost:5173
echo   [*] Backend REST API:    http://localhost:5000
echo   [*] API Health Check:    http://localhost:5000/api/health
echo   [*] Resumes Endpoint:    http://localhost:5000/api/resumes
echo   [*] Auth Endpoints:      http://localhost:5000/api/auth/login
echo   [*] AI Analysis:         http://localhost:5000/api/ai/analyze-resume
echo.
echo -------------------------------------------------------------------------------
echo   AUTHENTICATION / PERSONAS (1-Click Demo Login in Frontend):
echo   - Student:    alex.mercer@cloudresume.ai
echo   - Evaluator:  evaluator@university.edu
echo   - Recruiter:  sarah.jenkins@techcloud.io
echo   - Or register any new account using standard email/password
echo.
echo -------------------------------------------------------------------------------
echo   STORAGE AND DATABASE:
echo   - Storage Provider: Local Filesystem (storage/blobs/ with user isolation)
echo   - Database:         SQLite (backend/cloudresume.db) or PostgreSQL
echo -------------------------------------------------------------------------------
echo   Both backend and frontend services are currently running in their own windows.
echo   Opening the frontend in your browser now...
echo.

start http://localhost:5173

echo   Press any key to close this launcher menu (services will remain running).
pause >nul
