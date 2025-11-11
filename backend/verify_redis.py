#!/usr/bin/env python
"""
Redis Configuration Verification Script
Checks if Redis is properly configured for production
"""
import os
import sys
import django
from pathlib import Path

# Add project to path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR / 'src'))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')
django.setup()

from django.conf import settings
from django.core.cache import cache
import redis

print("=" * 60)
print("Redis Configuration Verification")
print("=" * 60)

# 1. Check settings
print("\n1. Django Settings:")
print(f"   USE_REDIS_CACHE: {getattr(settings, 'USE_REDIS_CACHE', 'Not set')}")
print(f"   REDIS_URL: {getattr(settings, 'REDIS_URL', 'Not set')}")
print(f"   CELERY_BROKER_URL: {getattr(settings, 'CELERY_BROKER_URL', 'Not set')}")

# 2. Check cache configuration
print("\n2. Cache Configuration:")
cache_config = settings.CACHES.get('default', {})
print(f"   Backend: {cache_config.get('BACKEND', 'Not set')}")
print(f"   Location: {cache_config.get('LOCATION', 'Not set')}")

# 3. Check Celery configuration
print("\n3. Celery Configuration:")
print(f"   Broker URL: {settings.CELERY_BROKER_URL}")
print(f"   Result Backend: {settings.CELERY_RESULT_BACKEND}")
print(f"   Task Serializer: {settings.CELERY_TASK_SERIALIZER}")
print(f"   Accept Content: {settings.CELERY_ACCEPT_CONTENT}")

# 4. Test cache connection
print("\n4. Testing Cache Connection:")
try:
    if settings.USE_REDIS_CACHE:
        cache.set('redis_test', 'working', 10)
        result = cache.get('redis_test')
        if result == 'working':
            print("   ✓ Cache connection successful (Redis)")
            cache.delete('redis_test')
        else:
            print("   ✗ Cache set but couldn't retrieve value")
    else:
        print("   ℹ Redis cache disabled, using local memory")
except Exception as e:
    print(f"   ✗ Cache connection failed: {str(e)}")

# 5. Test Redis directly (for broker)
print("\n5. Testing Redis Broker Connection:")
try:
    redis_url = settings.CELERY_BROKER_URL
    if redis_url.startswith('redis://'):
        # Parse Redis URL
        from urllib.parse import urlparse
        parsed = urlparse(redis_url)
        
        r = redis.Redis(
            host=parsed.hostname or 'localhost',
            port=parsed.port or 6379,
            password=parsed.password,
            db=int(parsed.path.lstrip('/')) if parsed.path else 0,
            socket_connect_timeout=5,
            socket_timeout=5,
        )
        
        if r.ping():
            print(f"   ✓ Redis broker connection successful")
            print(f"      Host: {parsed.hostname or 'localhost'}:{parsed.port or 6379}")
            print(f"      DB: {int(parsed.path.lstrip('/')) if parsed.path else 0}")
        else:
            print("   ✗ Redis broker responded but ping failed")
    else:
        print(f"   ℹ Broker is not Redis: {redis_url}")
except redis.ConnectionError as e:
    print(f"   ✗ Redis broker connection failed: {str(e)}")
    print("      Make sure Redis is running and accessible")
except Exception as e:
    print(f"   ✗ Unexpected error: {str(e)}")

# 6. Test Celery
print("\n6. Testing Celery Configuration:")
try:
    from config.celery import app
    print(f"   Celery App: {app.main}")
    
    # Check if broker is accessible
    try:
        app.connection().connect()
        print("   ✓ Celery broker connection successful")
    except Exception as e:
        print(f"   ✗ Celery broker connection failed: {str(e)}")
        
except Exception as e:
    print(f"   ✗ Error loading Celery: {str(e)}")

# 7. Summary
print("\n" + "=" * 60)
print("Summary:")
print("=" * 60)
if settings.USE_REDIS_CACHE:
    print("✓ Redis cache is ENABLED (recommended for production)")
else:
    print("ℹ Redis cache is DISABLED (using local memory)")

print("✓ Celery broker configured to use Redis")
print("\nNext steps:")
print("1. Ensure REDIS_URL environment variable is set correctly")
print("2. Test with: celery -A config inspect ping")
print("3. Start worker: celery -A config worker -l info")
print("=" * 60)
