"""
Passenger WSGI Entry Point for cPanel Django Deployment
api.bematore.com

This file is the entry point for Passenger (cPanel Python App).
It loads environment variables from .env and initializes the Django application.
"""
import os
import sys
from pathlib import Path

# ========================================
# Path Configuration
# ========================================

# Get the directory where this file is located (application root)
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))

# Add the backend directory to Python path
sys.path.insert(0, BACKEND_DIR)

# Add the src directory to Python path (where manage.py and config folder are)
SRC_DIR = os.path.join(BACKEND_DIR, 'src')
sys.path.insert(0, SRC_DIR)

# ========================================
# Django Settings Module
# ========================================

# Set Django settings module to production
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')

# ========================================
# Load Environment Variables from .env
# ========================================

# Load environment variables from .env file using django-environ
try:
    import environ
    env = environ.Env()
    
    # Look for .env in the backend directory (same level as this file)
    env_file = os.path.join(BACKEND_DIR, '.env')
    
    if os.path.exists(env_file):
        environ.Env.read_env(env_file)
        print(f"[OK] Loaded environment variables from: {env_file}")
    else:
        print(f"[WARNING] .env file not found at: {env_file}")
        print("   Environment variables should be set in cPanel Python App configuration")
        
except ImportError:
    print("[WARNING] django-environ not installed")
    print("   Install with: pip install django-environ")
    print("   Environment variables should be set in cPanel Python App configuration")

# ========================================
# Force Remove Replica Database Configuration
# ========================================

# This must happen AFTER Django setup but BEFORE any requests
def remove_replica_database():
    """Force remove any replica database configuration"""
    try:
        from django.conf import settings
        if hasattr(settings, 'DATABASES'):
            # Remove replica database if it exists
            if 'replica' in settings.DATABASES:
                del settings.DATABASES['replica']
                print("[INFO] Removed replica database from DATABASES")
            
            # Ensure only default database exists
            databases_copy = settings.DATABASES.copy()
            settings.DATABASES.clear()
            if 'default' in databases_copy:
                settings.DATABASES['default'] = databases_copy['default']
                print("[INFO] Ensured only 'default' database is configured")
            
            # Remove database router if it exists
            if hasattr(settings, 'DATABASE_ROUTERS'):
                settings.DATABASE_ROUTERS = []
                print("[INFO] Cleared DATABASE_ROUTERS")
                
            # Verify main database
            main_db = settings.DATABASES.get('default', {})
            db_host = main_db.get('HOST', 'unknown')
            db_name = main_db.get('NAME', 'unknown')
            print(f"[INFO] Using database: {db_name}@{db_host}")
            
            # Log all configured databases
            print(f"[INFO] Configured databases: {list(settings.DATABASES.keys())}")
    except Exception as e:
        print(f"[WARNING] Could not verify database settings: {e}")

# ========================================
# Initialize Django Application
# ========================================

try:
    from django.core.wsgi import get_wsgi_application
    application = get_wsgi_application()
    
    # Force remove replica AFTER Django loads settings
    remove_replica_database()
    
    print("[OK] Django application initialized successfully")
    
except Exception as e:
    print(f"[ERROR] Error initializing Django application: {e}")
    raise

# ========================================
# Debug Information (only printed on startup)
# ========================================

def print_startup_info():
    """Print startup information for debugging"""
    try:
        print("\n" + "="*50)
        print("NSER & RG API - Passenger WSGI Startup")
        print("="*50)
        print(f"Backend Directory: {BACKEND_DIR}")
        print(f"Source Directory: {SRC_DIR}")
        print(f".env File: {os.path.join(BACKEND_DIR, '.env')}")
        print(f"Settings Module: {os.environ.get('DJANGO_SETTINGS_MODULE', 'Not Set')}")
        print(f"Python Version: {sys.version.split()[0]}")
        print(f"Python Path:")
        for path in sys.path[:3]:
            print(f"   - {path}")
        
        # Try to import Django and show version
        try:
            import django
            print(f"Django Version: {django.get_version()}")
        except ImportError:
            print("[WARNING] Django not found in Python path")
            
        print("="*50 + "\n")
        
    except Exception as e:
        print(f"Error printing startup info: {e}")

# Print startup info (only shown in logs during startup)
print_startup_info()

# ========================================
# Health Check Endpoint
# ========================================

# Note: Passenger will route all requests through Django's URL routing
# The landing page at '/' and health check at '/health/' are handled by Django
