"""
Django Production Settings
Optimized settings for production deployment
"""
from .base import *
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.redis import RedisIntegration

# Debug - ensure False in production (can be overridden by env var)
DEBUG = env.bool('DEBUG', default=False)

# Security
SECRET_KEY = env('SECRET_KEY', default='your-secret-key-change-in-env')

# CORS settings for production
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[
    'https://nser.go.ke',  
])
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

# Disable ALLOWED_HOSTS check
ALLOWED_HOST_ENFORCEMENT = False

# HTTPS/SSL
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Database connection pooling
DATABASES['default']['CONN_MAX_AGE'] = 600
DATABASES['default']['OPTIONS'] = {
    'connect_timeout': 10,
    'options': '-c statement_timeout=30000',  # 30 seconds
}

# Disable ATOMIC_REQUESTS for better performance (manual transaction management)
DATABASES['default']['ATOMIC_REQUESTS'] = False

# CRITICAL: Force remove replica database configuration for cPanel deployment
# cPanel doesn't support multiple databases - only use 'default'
if 'replica' in DATABASES:
    del DATABASES['replica']
    
DATABASES = {'default': DATABASES['default']}

# CRITICAL: Disable database routers completely
# No read replicas on cPanel shared hosting
DATABASE_ROUTERS = []

# Read replicas - Disabled for cPanel deployment (shared hosting)
# Uncomment and configure if you have a dedicated replica database
# DATABASES['replica'] = {
#     **DATABASES['default'],
#     'NAME': env('DB_REPLICA_NAME', default=DATABASES['default']['NAME']),
#     'HOST': env('DB_REPLICA_HOST', default=DATABASES['default']['HOST']),
# }
# DATABASE_ROUTERS = ['config.db_router.ReplicaRouter']

# Cache - Use local memory cache for cPanel (Redis not available on shared hosting)
# Old Redis cache config (requires Redis server):
# try:
#     if 'OPTIONS' in CACHES['default']:
#         CACHES['default']['OPTIONS']['CONNECTION_POOL_KWARGS'] = {
#             'max_connections': 100,
#             'retry_on_timeout': True,
#         }
# except (KeyError, TypeError):
#     pass

# Active cache config for cPanel shared hosting
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'nser-production-cache',
        'TIMEOUT': 300,
        'OPTIONS': {
            'MAX_ENTRIES': 1000
        }
    }
}

# Static files - AWS S3 for production
if env.bool('USE_S3', default=False):
    AWS_ACCESS_KEY_ID = env('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = env('AWS_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = env('AWS_STORAGE_BUCKET_NAME')
    AWS_S3_REGION_NAME = env('AWS_S3_REGION_NAME', default='eu-west-1')
    AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
    AWS_S3_OBJECT_PARAMETERS = {'CacheControl': 'max-age=86400'}
    AWS_DEFAULT_ACL = 'public-read'
    
    # Static files
    STATIC_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/static/'
    STATICFILES_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    
    # Media files
    MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/media/'
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'

# Sentry Error Tracking
if env('SENTRY_DSN', default=''):
    sentry_sdk.init(
        dsn=env('SENTRY_DSN'),
        integrations=[
            DjangoIntegration(),
            CeleryIntegration(),
            RedisIntegration(),
        ],
        traces_sample_rate=0.1,
        send_default_pii=False,
        environment='production',
        release=env('GIT_COMMIT', default='unknown'),
    )

# Logging - Disabled file logging for cPanel (no /var/log access on shared hosting)
# Logs will go to console/passenger logs instead
# LOGGING['handlers']['file']['filename'] = '/var/log/nser-rg/django.log'
# LOGGING['handlers']['celery'] = {
#     'class': 'logging.handlers.RotatingFileHandler',
#     'filename': '/var/log/nser-rg/celery.log',
#     'maxBytes': 1024 * 1024 * 15,
#     'backupCount': 10,
#     'formatter': 'verbose',
# }
# LOGGING['loggers']['celery'] = {
#     'handlers': ['celery', 'console'],
#     'level': 'INFO',
#     'propagate': False,
# }

# Performance optimizations
CONN_MAX_AGE = 600

# Cache middleware - Disabled for cPanel (requires Redis)
# Uncomment if you have Redis available
# MIDDLEWARE.insert(1, 'django.middleware.cache.UpdateCacheMiddleware')
# MIDDLEWARE.append('django.middleware.cache.FetchFromCacheMiddleware')
# CACHE_MIDDLEWARE_ALIAS = 'default'
# CACHE_MIDDLEWARE_SECONDS = 600
# CACHE_MIDDLEWARE_KEY_PREFIX = 'nser_prod'

# REST Framework - production optimizations
REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'] = [
    'rest_framework.renderers.JSONRenderer',
]
REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {
    'anon': '60/hour',
    'user': '5000/hour',
    'operator': '50000/hour',
}

# Celery - production settings
CELERY_TASK_ALWAYS_EAGER = False
CELERY_TASK_ACKS_LATE = True
CELERY_WORKER_PREFETCH_MULTIPLIER = 4
CELERY_WORKER_MAX_TASKS_PER_CHILD = 1000

# Email - production SMTP
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_USE_TLS = True

# M-Pesa - production mode
MPESA_ENVIRONMENT = 'production'

# Monitoring - Prometheus metrics (optional)
# Disabled for cPanel - enable if you install django-prometheus
# INSTALLED_APPS += ['django_prometheus']
# MIDDLEWARE.insert(0, 'django_prometheus.middleware.PrometheusBeforeMiddleware')
# MIDDLEWARE.append('django_prometheus.middleware.PrometheusAfterMiddleware')

# Admin URL - obscure in production
ADMIN_URL = env('ADMIN_URL', default='admin/')

# Production-specific settings
PRODUCTION_MODE = True
MOCK_EXTERNAL_APIS = False
ENABLE_API_DOCS = env.bool('ENABLE_API_DOCS', default=False)  # Enable via .env
