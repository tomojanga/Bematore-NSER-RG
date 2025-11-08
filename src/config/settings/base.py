"""
Django Base Settings
Core settings shared across all environments
"""
import os
from pathlib import Path
from datetime import timedelta
import environ

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ROOT_DIR = BASE_DIR.parent

# Environment variables
env = environ.Env(
    DEBUG=(bool, False),
    ALLOWED_HOSTS=(list, []),
)
env_file = ROOT_DIR / '.env'

if not env_file.exists():
    alternate_env_file = BASE_DIR / '.env'
    if alternate_env_file.exists():
        env_file = alternate_env_file

if env_file.exists():
    environ.Env.read_env(env_file)

# Security
SECRET_KEY = env('SECRET_KEY', default='CHANGE-ME-IN-PRODUCTION')
DEBUG = env('DEBUG')
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS')

# Application definition
INSTALLED_APPS = [
    # Django core
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.postgres',
    
    # Third-party
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',  # Keep this near the top
    'django_filters',
    'drf_yasg',  # API documentation
    'channels',
    'django_celery_beat',
    'django_celery_results',
    'phonenumber_field',
    'django_countries',
    
    # Local apps
    'apps.core',
    'apps.authentication',
    'apps.users',
    'apps.nser',
    'apps.bst',
    'apps.screening',
    'apps.operators',
    'apps.api',
    'apps.dashboards',
    'apps.settlements',
    'apps.analytics',
    'apps.notifications',
    'apps.compliance',
    'apps.monitoring',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # CORS middleware should be as high as possible
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.locale.LocaleMiddleware',
]

# CORS Settings are defined in development.py and production.py
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
    'x-device-id',  # Our custom header
    'http_x_device_id',  # Django's convention
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# Database
DATABASES = {
    'default': env.db('DATABASE_URL'),
}

DATABASES['default'].update({
    'ATOMIC_REQUESTS': True,
    'CONN_MAX_AGE': 600,
})

DATABASES['default'].setdefault('OPTIONS', {})
DATABASES['default']['OPTIONS'].setdefault('connect_timeout', 10)

# Custom User Model
AUTH_USER_MODEL = 'users.User'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en'
LANGUAGES = [
    ('en', 'English'),
    ('sw', 'Swahili'),
]
TIME_ZONE = 'Africa/Nairobi'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
    'MAX_PAGE_SIZE': 1000,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '10000/hour',
        'operator': '100000/hour',
    },
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
    'EXCEPTION_HANDLER': 'apps.api.exceptions.custom_exception_handler',
    'DATETIME_FORMAT': '%Y-%m-%dT%H:%M:%S.%fZ',
    'DATE_FORMAT': '%Y-%m-%d',
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}

# CORS Settings
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[
    'http://localhost:3000',
    'http://localhost:8000',
])
CORS_ALLOW_CREDENTIALS = True

# Celery Configuration
CELERY_BROKER_URL = env('REDIS_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = 'django-db'
CELERY_CACHE_BACKEND = 'default'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'

# Redis Cache
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': env('REDIS_URL', default='redis://localhost:6379/1'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'PARSER_CLASS': 'redis.connection.HiredisParser',
            'CONNECTION_POOL_KWARGS': {'max_connections': 50},
            'SOCKET_CONNECT_TIMEOUT': 5,
            'SOCKET_TIMEOUT': 5,
        },
        'KEY_PREFIX': 'nser',
        'TIMEOUT': 300,
    }
}

# Channels (WebSocket)
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [env('REDIS_URL', default='redis://localhost:6379/2')],
            'capacity': 1500,
            'expiry': 10,
        },
    },
}

# Email Configuration
EMAIL_BACKEND = env('EMAIL_BACKEND', default='django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = env('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = env.int('EMAIL_PORT', default=587)
EMAIL_USE_TLS = env.bool('EMAIL_USE_TLS', default=True)
EMAIL_HOST_USER = env('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default='noreply@grak.go.ke')

# SMS Configuration (Africa's Talking)
SMS_PROVIDER = env('SMS_PROVIDER', default='africastalking')
SMS_API_KEY = env('SMS_API_KEY', default='')
SMS_USERNAME = env('SMS_USERNAME', default='')
SMS_SENDER_ID = env('SMS_SENDER_ID', default='GRAK')

# M-Pesa Configuration (Safaricom Daraja API)
MPESA_ENVIRONMENT = env('MPESA_ENVIRONMENT', default='sandbox')  # sandbox or production
MPESA_CONSUMER_KEY = env('MPESA_CONSUMER_KEY', default='')
MPESA_CONSUMER_SECRET = env('MPESA_CONSUMER_SECRET', default='')
MPESA_SHORTCODE = env('MPESA_SHORTCODE', default='')
MPESA_PASSKEY = env('MPESA_PASSKEY', default='')
MPESA_INITIATOR_NAME = env('MPESA_INITIATOR_NAME', default='testapi')
MPESA_SECURITY_CREDENTIAL = env('MPESA_SECURITY_CREDENTIAL', default='')

# M-Pesa Callback URLs
MPESA_CALLBACK_URL = env('MPESA_CALLBACK_URL', default=f'{env("SITE_URL", default="http://localhost:8000")}/api/v1/settlements/mpesa/callback/')
MPESA_B2C_RESULT_URL = env('MPESA_B2C_RESULT_URL', default=f'{env("SITE_URL", default="http://localhost:8000")}/api/v1/settlements/mpesa/b2c/result/')
MPESA_B2C_TIMEOUT_URL = env('MPESA_B2C_TIMEOUT_URL', default=f'{env("SITE_URL", default="http://localhost:8000")}/api/v1/settlements/mpesa/b2c/timeout/')
MPESA_STATUS_RESULT_URL = env('MPESA_STATUS_RESULT_URL', default=f'{env("SITE_URL", default="http://localhost:8000")}/api/v1/settlements/mpesa/status/result/')
MPESA_STATUS_TIMEOUT_URL = env('MPESA_STATUS_TIMEOUT_URL', default=f'{env("SITE_URL", default="http://localhost:8000")}/api/v1/settlements/mpesa/status/timeout/')
MPESA_BALANCE_RESULT_URL = env('MPESA_BALANCE_RESULT_URL', default=f'{env("SITE_URL", default="http://localhost:8000")}/api/v1/settlements/mpesa/balance/result/')
MPESA_BALANCE_TIMEOUT_URL = env('MPESA_BALANCE_TIMEOUT_URL', default=f'{env("SITE_URL", default="http://localhost:8000")}/api/v1/settlements/mpesa/balance/timeout/')

# Elasticsearch
ELASTICSEARCH_DSL = {
    'default': {
        'hosts': env('ELASTICSEARCH_URL', default='localhost:9200')
    },
}

# Security Settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = not DEBUG
SECURE_HSTS_PRELOAD = not DEBUG

# Encryption Settings
ENCRYPTION_KEY = env('ENCRYPTION_KEY', default='')
FIELD_ENCRYPTION_KEY = env('FIELD_ENCRYPTION_KEY', default='')

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.server': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['console'],
            'level': 'WARNING',
            'propagate': False,
        },
        'django.db.backends': {
            'handlers': [],
            'level': 'WARNING',
            'propagate': False,
        },
        'apps': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Custom App Settings
NSER_SETTINGS = {
    'MAX_EXCLUSION_PERIOD_DAYS': 1825,  # 5 years
    'DEFAULT_EXCLUSION_PERIOD': '1_year',
    'AUTO_RENEW_PERMANENT': True,
    'PROPAGATION_TIMEOUT_SECONDS': 30,
    'MAX_PROPAGATION_RETRIES': 3,
}

BST_SETTINGS = {
    'TOKEN_VERSION': '02',
    'TOKEN_EXPIRY_YEARS': 10,
    'ENABLE_TOKEN_ROTATION': True,
    'ROTATION_INTERVAL_MONTHS': 12,
}

SCREENING_SETTINGS = {
    'QUARTERLY_SCREENING_ENABLED': True,
    'HIGH_RISK_THRESHOLD': 70,
    'MANDATORY_SCREENING_INTERVAL_DAYS': 90,
    'ENABLE_ML_PREDICTIONS': True,
}

COMPLIANCE_SETTINGS = {
    'AUDIT_LOG_RETENTION_DAYS': 2555,  # 7 years
    'ENABLE_AUDIT_LOGGING': True,
    'DATA_RETENTION_DEFAULT_DAYS': 2555,
}
