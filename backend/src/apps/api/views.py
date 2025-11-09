"""
API Error Handlers
Custom error pages for consistent API responses
"""
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone


def error_400(request, exception=None):
    """Bad Request handler"""
    return Response({
        'error': True,
        'status_code': 400,
        'message': 'Bad Request',
        'detail': str(exception) if exception else 'The request could not be understood.',
        'timestamp': timezone.now().isoformat()
    }, status=status.HTTP_400_BAD_REQUEST)


def error_403(request, exception=None):
    """Forbidden handler"""
    return Response({
        'error': True,
        'status_code': 403,
        'message': 'Forbidden',
        'detail': 'You do not have permission to access this resource.',
        'timestamp': timezone.now().isoformat()
    }, status=status.HTTP_403_FORBIDDEN)


def error_404(request, exception=None):
    """Not Found handler"""
    return Response({
        'error': True,
        'status_code': 404,
        'message': 'Not Found',
        'detail': 'The requested resource was not found.',
        'timestamp': timezone.now().isoformat()
    }, status=status.HTTP_404_NOT_FOUND)


def error_500(request):
    """Internal Server Error handler"""
    return Response({
        'error': True,
        'status_code': 500,
        'message': 'Internal Server Error',
        'detail': 'An unexpected error occurred. Please try again later.',
        'timestamp': timezone.now().isoformat()
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
