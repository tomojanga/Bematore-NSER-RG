@echo off
REM NSER-RG Celery Worker Script for Windows

echo ==========================================
echo NSER-RG Celery Worker Starting...
echo ==========================================

REM Activate virtual environment
call ienv\Scripts\activate.bat

REM Navigate to src directory
cd src

echo Starting Celery Worker...
echo Press CTRL+C to stop the worker
echo ==========================================
echo.

REM Run Celery worker with solo pool (Windows compatible)
celery -A config worker -l info --pool=solo

pause
