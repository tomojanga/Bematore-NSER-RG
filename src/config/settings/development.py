"""
Django Development Settings
Settings for local development environment
"""
from .base import *

# Debug
DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '[::1]']

# Database - use local PostgreSQL
DATABASES['default']['NAME'] = 'nser_rg_dev'

# Email - console backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# CORS - allow all origins in dev
CORS_ALLOW_ALL_ORIGINS = True

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

# Logging - verbose for development
LOGGING['root']['level'] = 'DEBUG'
LOGGING['loggers']['django']['level'] = 'DEBUG'
LOGGING['loggers']['apps']['level'] = 'DEBUG'

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
