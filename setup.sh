#!/bin/bash
# NSER-RG System Setup Script

echo "=========================================="
echo "NSER-RG System Setup"
echo "=========================================="

# Check Python version
python --version
if [ $? -ne 0 ]; then
    echo "Error: Python is not installed"
    exit 1
fi

# Create virtual environment
echo "Creating virtual environment..."
python -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Upgrade pip
echo "Upgrading pip..."
python -m pip install --upgrade pip

# Install requirements
echo "Installing dependencies..."
pip install -r requirements/development.txt

# Create .env file if not exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "Please update .env with your configuration"
fi

# Create necessary directories
echo "Creating project directories..."
mkdir -p src/static
mkdir -p src/media
mkdir -p src/locale
mkdir -p logs
mkdir -p backups

echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo "Next steps:"
echo "1. Update .env with your configuration"
echo "2. Run: cd src && python manage.py migrate"
echo "3. Run: python manage.py createsuperuser"
echo "4. Run: python manage.py runserver"
