"""
Custom Exception Handlers for API
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.db import DatabaseError
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that provides consistent error responses
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # Handle database connection errors specially
    if isinstance(exc, DatabaseError):
        logger.error(f"Database connection error: {str(exc)}")
        return Response(
            {
                'success': False,
                'error': {
                    'message': 'Database connection error. Please try again later.',
                    'type': 'DatabaseError',
                    'status_code': status.HTTP_503_SERVICE_UNAVAILABLE
                }
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    if response is not None:
        # Customize the response format
        custom_response_data = {
            'success': False,
            'error': {
                'message': str(exc),
                'type': exc.__class__.__name__,
                'status_code': response.status_code
            }
        }
        
        # Include field-specific errors if available
        if hasattr(exc, 'detail'):
            if isinstance(exc.detail, dict):
                custom_response_data['error']['details'] = exc.detail
            elif isinstance(exc.detail, list):
                custom_response_data['error']['details'] = exc.detail
        
        response.data = custom_response_data
        # Ensure we have a renderer set
        if not hasattr(response, 'accepted_renderer') or not response.accepted_renderer:
            from rest_framework.renderers import JSONRenderer
            response.accepted_renderer = JSONRenderer()
            # Initialize renderer_context if it doesn't exist
            if not hasattr(response, 'renderer_context'):
                response.renderer_context = {}
            response.renderer_context['response'] = response
    
    return response
