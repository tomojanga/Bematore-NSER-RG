@echo off
REM NSER-RG Run Script for Windows

echo ==========================================
echo NSER-RG System Starting...
echo ==========================================

REM Check if venv exists
if not exist venv\Scripts\activate.bat (
    echo Error: Virtual environment 'venv' not found!
    echo Please create it first: python -m venv venv
    pause
    exit /b 1
)

REM Activate virtual environment
echo Activating virtual environment (venv)...
call venv\Scripts\activate.bat

REM Navigate to src directory
cd src

REM Check if .env exists
if not exist ..\.env (
    echo Warning: .env file not found!
    echo Please create .env file with your configuration
    pause
)

REM Run migrations (if needed)
echo Checking for pending migrations...
python manage.py migrate --check >nul 2>&1
if errorlevel 1 (
    echo Running migrations...
    python manage.py migrate
)

REM Collect static files (skip in development)
REM python manage.py collectstatic --noinput

echo ==========================================
echo Starting Django Development Server...
echo ==========================================
echo.
echo API: http://localhost:8000/api/v1/
echo Admin: http://localhost:8000/admin/
echo API Docs: http://localhost:8000/api/docs/
echo.
echo Press CTRL+C to stop the server
echo ==========================================
echo.

REM Run Django server
python manage.py runserver 0.0.0.0:8000

pause
