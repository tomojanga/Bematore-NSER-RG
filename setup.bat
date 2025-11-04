@echo off
REM NSER-RG System Setup Script for Windows

echo ==========================================
echo NSER-RG System Setup
echo ==========================================

REM Check Python version
python --version
if errorlevel 1 (
    echo Error: Python is not installed
    exit /b 1
)

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install requirements
echo Installing dependencies...
pip install -r requirements/development.txt

REM Create .env file if not exists
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo Please update .env with your configuration
)

REM Create necessary directories
echo Creating project directories...
if not exist src\static mkdir src\static
if not exist src\media mkdir src\media
if not exist src\locale mkdir src\locale
if not exist logs mkdir logs
if not exist backups mkdir backups

echo ==========================================
echo Setup Complete!
echo ==========================================
echo Next steps:
echo 1. Update .env with your configuration
echo 2. Run: cd src ^&^& python manage.py migrate
echo 3. Run: python manage.py createsuperuser
echo 4. Run: python manage.py runserver

pause
