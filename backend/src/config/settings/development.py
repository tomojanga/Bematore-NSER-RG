"""
Django Development Settings
Settings for local development environment
"""
from .base import *

# Debug - ensure True in development (can be overridden by env var)
DEBUG = env.bool('DEBUG', default=True)

# Database - use local PostgreSQL
# DATABASES['default']['NAME'] = 'nser_rg_dev'  # Commented out to use nser_rg from .env

# Email - console backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# CORS settings for development
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-device-id',
    'http_x_device_id',
]

# Security - relaxed for development
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# Django Debug Toolbar
INSTALLED_APPS += ['debug_toolbar']
MIDDLEWARE.insert(0, 'debug_toolbar.middleware.DebugToolbarMiddleware')
INTERNAL_IPS = ['127.0.0.1', 'localhost']

DEBUG_TOOLBAR_CONFIG = {
    'SHOW_TOOLBAR_CALLBACK': lambda request: DEBUG,
}

# Logging - minimal for development
LOGGING['root']['level'] = 'INFO'
LOGGING['loggers']['django']['level'] = 'INFO'
LOGGING['loggers']['django.server']['level'] = 'INFO'
LOGGING['loggers']['django.request']['level'] = 'WARNING'
LOGGING['loggers']['django.db.backends']['level'] = 'WARNING'
LOGGING['loggers']['apps']['level'] = 'INFO'

# Celery - eager execution for development
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# Cache - dummy cache for development
CACHES['default']['BACKEND'] = 'django.core.cache.backends.dummy.DummyCache'

# Static files - no compression in dev
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

# M-Pesa - sandbox mode
MPESA_ENVIRONMENT = 'sandbox'

# SMS - fake backend for development
SMS_BACKEND = 'apps.notifications.backends.console.ConsoleSMSBackend'

# Development-specific settings
DEV_MODE = True
MOCK_EXTERNAL_APIS = True
