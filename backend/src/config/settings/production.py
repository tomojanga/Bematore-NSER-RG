"""
Django Production Settings
Optimized settings for production deployment
"""
from .base import *
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.redis import RedisIntegration

# Debug - always False in production
DEBUG = False

# Security
SECRET_KEY = env('SECRET_KEY')
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS')

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

# Database-specific options (already configured in base.py, but can override here)
DATABASE_ENGINE = DATABASES['default'].get('ENGINE', '')

# Additional PostgreSQL optimizations for production
if 'postgresql' in DATABASE_ENGINE or 'postgres' in DATABASE_ENGINE:
    DATABASES['default']['OPTIONS'].update({
        'options': '-c statement_timeout=30000',  # 30 seconds
    })
    
# Additional MySQL optimizations for production
elif 'mysql' in DATABASE_ENGINE:
    DATABASES['default']['OPTIONS'].update({
        'read_timeout': 30,
        'write_timeout': 30,
    })

# Add read replicas for scaling
DATABASES['replica'] = {
    **DATABASES['default'],
    'NAME': env('DB_REPLICA_NAME', default=DATABASES['default']['NAME']),
    'HOST': env('DB_REPLICA_HOST', default=DATABASES['default']['HOST']),
}

# Database routing for read replicas
DATABASE_ROUTERS = ['config.db_router.ReplicaRouter']

# Cache - production Redis with connection pooling
CACHES['default']['OPTIONS']['CONNECTION_POOL_KWARGS'] = {
    'max_connections': 100,
    'retry_on_timeout': True,
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

# Logging - production logging to files and external services
LOGGING['handlers']['file']['filename'] = '/var/log/nser-rg/django.log'
LOGGING['handlers']['celery'] = {
    'class': 'logging.handlers.RotatingFileHandler',
    'filename': '/var/log/nser-rg/celery.log',
    'maxBytes': 1024 * 1024 * 15,
    'backupCount': 10,
    'formatter': 'verbose',
}
LOGGING['loggers']['celery'] = {
    'handlers': ['celery', 'console'],
    'level': 'INFO',
    'propagate': False,
}

# Performance optimizations
CONN_MAX_AGE = 600
MIDDLEWARE.insert(1, 'django.middleware.cache.UpdateCacheMiddleware')
MIDDLEWARE.append('django.middleware.cache.FetchFromCacheMiddleware')

CACHE_MIDDLEWARE_ALIAS = 'default'
CACHE_MIDDLEWARE_SECONDS = 600
CACHE_MIDDLEWARE_KEY_PREFIX = 'nser_prod'

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

# Monitoring - Prometheus metrics
INSTALLED_APPS += ['django_prometheus']
MIDDLEWARE.insert(0, 'django_prometheus.middleware.PrometheusBeforeMiddleware')
MIDDLEWARE.append('django_prometheus.middleware.PrometheusAfterMiddleware')

# Admin URL - obscure in production
ADMIN_URL = env('ADMIN_URL', default='admin/')

# Production-specific settings
PRODUCTION_MODE = True
MOCK_EXTERNAL_APIS = False
ENABLE_API_DOCS = False  # Disable Swagger in production
