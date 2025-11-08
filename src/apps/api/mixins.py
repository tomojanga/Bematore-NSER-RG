"""
API View Mixins
Reusable mixins for common API functionality
"""
from rest_framework import status
from rest_framework.response import Response
from django.utils import timezone
import time


class AuditLogMixin:
    """Mixin to automatically log API requests"""
    
    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        
        # Log to audit system
        if hasattr(request, 'start_time'):
            response_time = (time.time() - request.start_time) * 1000
            
            # Create audit log synchronously (Celery not configured)
            try:
                from apps.compliance.tasks import create_audit_log
                create_audit_log(
                    user_id=str(request.user.id) if request.user.is_authenticated else None,
                    action=f"{request.method} {request.path}",
                    resource_type=self.__class__.__name__,
                    resource_id=None,
                    details={'response_code': response.status_code},
                    ip_address=self.get_client_ip(request)
                )
            except Exception:
                pass  # Silently fail audit logging
        
        return response
    
    @staticmethod
    def get_client_ip(request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')


class TimingMixin:
    """Mixin to track request timing"""
    
    def initial(self, request, *args, **kwargs):
        request.start_time = time.time()
        super().initial(request, *args, **kwargs)
    
    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        
        if hasattr(request, 'start_time'):
            response_time = (time.time() - request.start_time) * 1000
            response['X-Response-Time'] = f"{response_time:.2f}ms"
        
        return response


class CacheMixin:
    """Mixin for response caching"""
    cache_timeout = 300  # 5 minutes default
    
    def get_cache_key(self, request):
        """Generate cache key"""
        return f"{self.__class__.__name__}:{request.path}:{request.query_params.urlencode()}"
    
    def get_cached_response(self, request):
        """Get cached response"""
        from django.core.cache import cache
        cache_key = self.get_cache_key(request)
        return cache.get(cache_key)
    
    def set_cached_response(self, request, response):
        """Set cached response"""
        from django.core.cache import cache
        cache_key = self.get_cache_key(request)
        cache.set(cache_key, response.data, self.cache_timeout)


class RateLimitMixin:
    """Mixin for custom rate limiting"""
    
    def check_rate_limit(self, request):
        """Check if rate limit exceeded"""
        if hasattr(request, 'api_key'):
            # Check operator rate limit
            from apps.operators.models import APIKey
            # Implementation would check Redis for rate limiting
            pass


class ErrorHandlerMixin:
    """Mixin for consistent error handling"""
    
    def handle_exception(self, exc):
        """Handle exceptions consistently"""
        response = super().handle_exception(exc)
        
        # Add error details
        if hasattr(exc, 'detail'):
            response.data = {
                'error': True,
                'message': str(exc.detail) if isinstance(exc.detail, str) else exc.detail,
                'status_code': response.status_code,
                'timestamp': timezone.now().isoformat()
            }
        
        return response


class PaginationInfoMixin:
    """Mixin to add pagination metadata"""
    
    def get_paginated_response(self, data):
        response = super().get_paginated_response(data)
        
        # Add pagination metadata
        response.data = {
            'count': response.data.get('count'),
            'next': response.data.get('next'),
            'previous': response.data.get('previous'),
            'page_size': self.paginator.page_size if hasattr(self, 'paginator') else None,
            'results': response.data.get('results'),
        }
        
        return response


class SuccessResponseMixin:
    """Mixin for consistent success responses"""
    
    def success_response(self, data=None, message=None, status_code=status.HTTP_200_OK):
        """Return consistent success response"""
        response_data = {
            'success': True,
            'message': message or 'Operation completed successfully',
            'timestamp': timezone.now().isoformat()
        }
        
        if data is not None:
            response_data['data'] = data
        
        return Response(response_data, status=status_code)
    
    def error_response(self, message, errors=None, status_code=status.HTTP_400_BAD_REQUEST):
        """Return consistent error response"""
        response_data = {
            'success': False,
            'message': message,
            'timestamp': timezone.now().isoformat()
        }
        
        if errors:
            response_data['errors'] = errors
        
        return Response(response_data, status=status_code)
