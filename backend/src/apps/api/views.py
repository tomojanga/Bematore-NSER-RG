"""
API Error Handlers
Custom error pages for consistent API responses
"""
import json
from django.http import JsonResponse
from django.utils import timezone


def error_400(request, exception=None):
    """Bad Request handler"""
    return JsonResponse({
        'error': True,
        'status_code': 400,
        'message': 'Bad Request',
        'detail': str(exception) if exception else 'The request could not be understood.',
        'timestamp': timezone.now().isoformat()
    }, status=400)


def error_403(request, exception=None):
    """Forbidden handler"""
    return JsonResponse({
        'error': True,
        'status_code': 403,
        'message': 'Forbidden',
        'detail': 'You do not have permission to access this resource.',
        'timestamp': timezone.now().isoformat()
    }, status=403)


def error_404(request, exception=None):
    """Not Found handler"""
    return JsonResponse({
        'error': True,
        'status_code': 404,
        'message': 'Not Found',
        'detail': 'The requested resource was not found.',
        'timestamp': timezone.now().isoformat()
    }, status=404)


def error_500(request):
    """Internal Server Error handler"""
    return JsonResponse({
        'error': True,
        'status_code': 500,
        'message': 'Internal Server Error',
        'detail': 'An unexpected error occurred. Please try again later.',
        'timestamp': timezone.now().isoformat()
    }, status=500)
