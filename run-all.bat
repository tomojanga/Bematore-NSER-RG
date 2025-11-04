@echo off
REM NSER-RG Run All Services Script for Windows

echo ==========================================
echo NSER-RG - Starting All Services
echo ==========================================

REM Check if ienv exists
if not exist ienv\Scripts\activate.bat (
    echo Error: Virtual environment 'ienv' not found!
    pause
    exit /b 1
)

echo Starting services in separate windows...
echo.

REM Start Django server
start "NSER-RG Django Server" cmd /k "ienv\Scripts\activate.bat && cd src && python manage.py runserver 0.0.0.0:8000"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start Celery worker
start "NSER-RG Celery Worker" cmd /k "ienv\Scripts\activate.bat && cd src && celery -A config worker -l info --pool=solo"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start Celery Beat (periodic tasks)
start "NSER-RG Celery Beat" cmd /k "ienv\Scripts\activate.bat && cd src && celery -A config beat -l info"

echo ==========================================
echo All services started in separate windows!
echo ==========================================
echo.
echo Django Server: http://localhost:8000/
echo API Docs: http://localhost:8000/api/docs/
echo Admin: http://localhost:8000/admin/
echo.
echo Close this window or press any key...
pause
