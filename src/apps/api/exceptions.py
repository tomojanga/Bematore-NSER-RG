"""
Custom Exception Handlers for API
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Custom exception handler that provides consistent error responses
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
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
    
    return response
