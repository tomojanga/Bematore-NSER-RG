# cPanel Deployment Guide - Django Backend to api.bematore.com

## Prerequisites
- cPanel account with:
  - Python App support (Python 3.9+)
  - MySQL database access
  - SSH access (recommended)
  - SSL certificate (Let's Encrypt recommended)
- Domain: api.bematore.com pointing to your cPanel server

## Part 1: Database Setup (MySQL)

### 1.1 Create MySQL Database in cPanel
1. Login to cPanel
2. Go to **MySQL Databases**
3. Create a new database:
   - Database Name: `bematore_nser_production` (cPanel will prefix with your username)
   - Note the full database name (e.g., `username_nser_prod`)

### 1.2 Create Database User
1. In the same MySQL Databases section:
   - Username: `bematore_api`
   - Generate a strong password
   - **Save these credentials securely**

### 1.3 Grant Privileges
1. Add user to database with **ALL PRIVILEGES**
2. Note your connection details:
   ```
   Database Host: localhost (or specific host from cPanel)
   Database Name: username_nser_prod
   Database User: username_api
   Database Password: [your password]
   ```

## Part 2: Prepare Application Files

### 2.1 Update Models for MySQL Compatibility
Before deployment, the following models have been updated to replace PostgreSQL-specific `ArrayField` with JSON fields:

**Files Modified:**
- `apps/users/models.py` - backup_codes (ArrayField → JSONField)
- `apps/notifications/models.py` - attachments, cc_emails, bcc_emails, target_user_ids
- `apps/operators/models.py` - scopes, ip_whitelist
- `apps/compliance/models.py` - regulatory_requirement, affected_data_types
- `apps/screening/models.py` - anomaly_flags
- `apps/core/models.py` - Removed PostgreSQL-specific indexes (GinIndex, BTreeIndex)

**Settings Modified:**
- Removed `django.contrib.postgres` from `INSTALLED_APPS`
- Added MySQL database engine configuration
- Updated for production environment

### 2.2 Create Production Environment File
Create `.env` file with production settings:

```bash
# Django Settings
DJANGO_SETTINGS_MODULE=config.settings.production
SECRET_KEY=your-super-secret-key-change-this-immediately-use-50-chars-min
DEBUG=False
ALLOWED_HOSTS=api.bematore.com,www.api.bematore.com
DJANGO_ENVIRONMENT=production

# Database (MySQL)
DATABASE_URL=mysql://username_api:your_password@localhost:3306/username_nser_prod
DATABASE_NAME=username_nser_prod
DATABASE_USER=username_api
DATABASE_PASSWORD=your_database_password
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_CONN_MAX_AGE=600

# Redis (if available on cPanel - otherwise disable Celery and caching)
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
CACHE_REDIS_URL=redis://localhost:6379/3

# Security
ENCRYPTION_KEY=generate-using-python-secrets-token-urlsafe-32
JWT_SECRET_KEY=generate-strong-jwt-secret-key-here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_LIFETIME=900
JWT_REFRESH_TOKEN_LIFETIME=86400

# Site URL
SITE_URL=https://api.bematore.com

# CORS (Add your frontend domains)
CORS_ALLOWED_ORIGINS=https://bematore.com,https://www.bematore.com,https://citizen.bematore.com

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=mail.bematore.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=noreply@bematore.com
EMAIL_HOST_PASSWORD=your_email_password
DEFAULT_FROM_EMAIL=noreply@bematore.com

# SMS Configuration (Africa's Talking)
SMS_PROVIDER=africastalking
SMS_API_KEY=your_africastalking_api_key
SMS_USERNAME=your_africastalking_username
SMS_SENDER_ID=NSER

# M-Pesa Configuration (Production)
MPESA_ENVIRONMENT=production
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_INITIATOR_NAME=your_initiator
MPESA_SECURITY_CREDENTIAL=your_credential

# Feature Flags
ENABLE_ML_PREDICTIONS=False
ENABLE_REAL_TIME_DASHBOARDS=True
ENABLE_WEBHOOK_NOTIFICATIONS=True
ENABLE_GEOLOCATION=True

# Performance
CONN_MAX_AGE=600
GUNICORN_WORKERS=4
```

### 2.3 Create Requirements File for Production
Create `requirements.txt` (simplified for cPanel):

```
Django==5.2.1
django-environ==0.11.2
pytz==2025.2

# MySQL Database
pymysql==1.1.1
mysqlclient==2.2.1

# API & REST Framework
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.1
django-filter==24.3
drf-spectacular==0.27.2
django-cors-headers==4.3.1

# Authentication & Security
PyJWT==2.10.1
python-jose[cryptography]==3.3.0
cryptography==45.0.3
argon2-cffi==23.1.0

# Validation
django-phonenumber-field[phonenumbers]==7.1.0
phonenumbers==8.13.23
django-countries==7.5.1

# File Storage
Pillow==12.0.0

# Reports
reportlab==4.4.4
openpyxl==3.1.5

# External Integrations
requests==2.31.0
africastalking==1.2.9
sendgrid==6.11.0

# Production Server
gunicorn==23.0.0
whitenoise==6.9.0

# Utilities
python-dateutil==2.8.2
python-dotenv==1.0.0
```

## Part 3: Upload Files to cPanel

### 3.1 Prepare Local Files
1. Zip your backend directory (excluding venv, __pycache__, .git):
```bash
# On your local machine
cd d:\DEVELOPMENT PROJECT\BEMATORE TECHNOLOGIES\nser-rg\backend
# Create a zip excluding unnecessary files
```

### 3.2 Upload via cPanel File Manager
1. Login to cPanel
2. Go to **File Manager**
3. Navigate to your public_html or create a subdirectory (e.g., `/home/username/api_backend`)
4. Upload the zip file
5. Extract the files

### 3.3 Alternative: Upload via FTP/SFTP
Use FileZilla or similar FTP client:
- Host: your-server-ftp-address
- Username: your-cpanel-username
- Password: your-cpanel-password
- Port: 21 (FTP) or 22 (SFTP)

## Part 4: Setup Python Application in cPanel

### 4.1 Create Python App
1. In cPanel, go to **Setup Python App**
2. Click **Create Application**
3. Configure:
   - Python Version: 3.9 or higher
   - Application Root: `/home/username/api_backend` (where you uploaded files)
   - Application URL: `api.bematore.com` or `/` if using subdomain
   - Application Startup File: `src/config/wsgi.py`
   - Application Entry Point: `application`

### 4.2 Configure Virtual Environment
cPanel will create a virtual environment automatically. Note the path shown (e.g., `/home/username/virtualenv/api_backend`)

### 4.3 Install Dependencies
1. Click on **Enter to virtual environment** or use SSH:
```bash
source /home/username/virtualenv/api_backend/bin/activate
cd /home/username/api_backend
pip install --upgrade pip
pip install -r requirements.txt
```

2. If you encounter MySQL client issues:
```bash
# On cPanel with SSH access
pip install mysqlclient
# Or use PyMySQL as alternative
pip install pymysql
```

## Part 5: Configure Django Application

### 5.1 Create .env File
Using cPanel File Manager or SSH:
```bash
cd /home/username/api_backend
nano .env
# Paste your production .env content from Part 2.2
```

### 5.2 Collect Static Files
```bash
source /home/username/virtualenv/api_backend/bin/activate
cd /home/username/api_backend
python src/manage.py collectstatic --noinput
```

### 5.3 Run Database Migrations
```bash
python src/manage.py migrate
```

### 5.4 Create Superuser
```bash
python src/manage.py createsuperuser
```

### 5.5 Test Database Connection
```bash
python src/manage.py shell
>>> from django.db import connection
>>> connection.ensure_connection()
>>> print("Database connected successfully!")
>>> exit()
```

## Part 6: Configure Domain and SSL

### 6.1 Setup Subdomain
1. In cPanel, go to **Subdomains**
2. Create subdomain: `api`
3. Document Root: Point to your application directory or Python app handles this

### 6.2 Install SSL Certificate
1. Go to **SSL/TLS** in cPanel
2. Use **Let's Encrypt** (recommended):
   - Select `api.bematore.com`
   - Issue certificate
3. Or upload your own SSL certificate

### 6.3 Force HTTPS
1. In cPanel, go to **File Manager**
2. Navigate to the directory containing `.htaccess` for api.bematore.com
3. Add redirect rules:
```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## Part 7: Configure WSGI and Application Entry

### 7.1 Update passenger_wsgi.py (cPanel's entry point)
Create `/home/username/api_backend/passenger_wsgi.py`:

```python
import sys
import os

# Add your project directory to the sys.path
project_home = '/home/username/api_backend'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Add src directory
src_path = os.path.join(project_home, 'src')
if src_path not in sys.path:
    sys.path.insert(0, src_path)

# Set environment variables
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings.production'

# Load environment variables from .env
from dotenv import load_dotenv
env_path = os.path.join(project_home, '.env')
load_dotenv(env_path)

# Import Django's WSGI application
from config.wsgi import application
```

## Part 8: Configure Production Settings

### 8.1 Update config/settings/production.py
Ensure MySQL-specific settings:

```python
# Remove PostgreSQL-specific configurations
# Remove from INSTALLED_APPS:
# 'django.contrib.postgres',

# Database configuration is handled via DATABASE_URL in .env

# For MySQL, ensure proper charset:
DATABASES['default']['OPTIONS'] = {
    'charset': 'utf8mb4',
    'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
}
```

### 8.2 Disable Redis-dependent features (if Redis not available)
If your cPanel doesn't support Redis:

```python
# In production.py, comment out or modify:
# CACHES - Use database cache instead
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
        'LOCATION': 'django_cache_table',
    }
}

# Create cache table
# python manage.py createcachetable
```

## Part 9: Start Application

### 9.1 Restart Python App
1. In cPanel, go to **Setup Python App**
2. Find your application
3. Click **Restart**

### 9.2 Verify Application
Visit: `https://api.bematore.com`
- You should see API response or Django admin login

### 9.3 Test Admin Panel
Visit: `https://api.bematore.com/admin/`
- Login with superuser credentials

## Part 10: Post-Deployment Configuration

### 10.1 Setup Cron Jobs (Optional - for periodic tasks)
In cPanel → Cron Jobs:

```bash
# Run Django management commands
# Example: Clear expired sessions daily
0 2 * * * source /home/username/virtualenv/api_backend/bin/activate && cd /home/username/api_backend && python src/manage.py clearsessions
```

### 10.2 Setup Error Logging
Create logs directory:
```bash
mkdir -p /home/username/api_backend/logs
chmod 755 /home/username/api_backend/logs
```

Update settings to log to this directory.

### 10.3 Configure Backups
1. In cPanel → Backup:
   - Schedule automatic backups
   - Include database and application files

### 10.4 Monitor Application
1. Check error logs: `/home/username/logs/`
2. Use cPanel's error log viewer
3. Monitor Python app status in Setup Python App

## Part 11: Troubleshooting

### Issue: 500 Internal Server Error
**Solution:**
1. Check error logs in cPanel
2. Verify .env file has correct settings
3. Check database connection
4. Ensure all migrations are run
5. Check file permissions (755 for directories, 644 for files)

### Issue: Database Connection Failed
**Solution:**
1. Verify MySQL credentials in .env
2. Check if database user has proper privileges
3. Test connection with MySQL client
4. Ensure DATABASE_URL format is correct

### Issue: Static Files Not Loading
**Solution:**
1. Run `python manage.py collectstatic`
2. Check STATIC_ROOT in settings
3. Verify web server can access static directory
4. Check .htaccess rules

### Issue: Import Errors
**Solution:**
1. Verify virtual environment is activated
2. Check all dependencies are installed
3. Ensure Python version compatibility
4. Check sys.path in passenger_wsgi.py

### Issue: ModuleNotFoundError: No module named 'MySQLdb'
**Solution:**
```bash
# Option 1: Install mysqlclient
pip install mysqlclient

# Option 2: Use PyMySQL as alternative
pip install pymysql
# Add to config/__init__.py:
import pymysql
pymysql.install_as_MySQLdb()
```

## Part 12: Security Checklist

- [ ] DEBUG=False in production
- [ ] SECRET_KEY is strong and unique
- [ ] Database credentials are secure
- [ ] ALLOWED_HOSTS is properly configured
- [ ] SSL certificate is installed and active
- [ ] CORS origins are restricted
- [ ] File permissions are correct (not 777)
- [ ] .env file is not publicly accessible
- [ ] Admin URL is secured (consider changing from /admin/)
- [ ] Rate limiting is enabled
- [ ] Security headers are configured
- [ ] Database backups are scheduled

## Part 13: Performance Optimization

### 13.1 Enable Database Query Optimization
- Use select_related() and prefetch_related()
- Add database indexes for frequently queried fields
- Monitor slow queries

### 13.2 Enable Caching
- Use database cache table if Redis unavailable
- Cache API responses where appropriate
- Use WhiteNoise for static files

### 13.3 Configure CDN (Optional)
- Use Cloudflare or similar CDN
- Cache static assets
- Enable DDoS protection

## Part 14: Monitoring and Maintenance

### 14.1 Regular Tasks
- Monitor error logs daily
- Review database size and optimize
- Update dependencies regularly
- Check SSL certificate expiry
- Monitor API response times

### 14.2 Updates
```bash
# To update application
source /home/username/virtualenv/api_backend/bin/activate
cd /home/username/api_backend
git pull  # if using git
pip install -r requirements.txt --upgrade
python src/manage.py migrate
python src/manage.py collectstatic --noinput
# Restart app in cPanel
```

## Part 15: API Documentation
Access API documentation at:
- Swagger UI: `https://api.bematore.com/api/docs/`
- ReDoc: `https://api.bematore.com/api/redoc/`

## Support and Contacts
- Technical Support: tech@bematore.com
- Emergency: [Your emergency contact]
- Documentation: https://docs.bematore.com

---

## Quick Command Reference

```bash
# Activate virtual environment
source /home/username/virtualenv/api_backend/bin/activate

# Navigate to project
cd /home/username/api_backend

# Run migrations
python src/manage.py migrate

# Create superuser
python src/manage.py createsuperuser

# Collect static files
python src/manage.py collectstatic --noinput

# Check deployment
python src/manage.py check --deploy

# Database shell
python src/manage.py dbshell

# Django shell
python src/manage.py shell
```

---

**Deployment completed successfully!** 🎉
Your API should now be accessible at: `https://api.bematore.com`
