from django.shortcuts import render
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def landing_page(request):
    """
    Modern landing page for NSER & RG API
    Displays API information, endpoints, and documentation links
    """
    context = {
        'api_name': 'NSER & RG API',
        'api_version': 'v1',
        'api_description': 'National Self-Exclusion Register & Responsible Gambling API',
        'base_url': request.build_absolute_uri('/'),
        'docs_url': request.build_absolute_uri('/api/docs/'),
        'redoc_url': request.build_absolute_uri('/api/redoc/'),
        'health_url': request.build_absolute_uri('/health/'),
        'endpoints': [
            {'name': 'Authentication', 'url': '/api/v1/auth/', 'desc': 'User login, registration & token management'},
            {'name': 'Users', 'url': '/api/v1/users/', 'desc': 'User profile and management'},
            {'name': 'NSER', 'url': '/api/v1/nser/', 'desc': 'Self-exclusion register operations'},
            {'name': 'BST Tokens', 'url': '/api/v1/bst/', 'desc': 'Token generation and validation'},
            {'name': 'Screening', 'url': '/api/v1/screening/', 'desc': 'Risk assessment and screening'},
            {'name': 'Operators', 'url': '/api/v1/operators/', 'desc': 'Operator management'},
            {'name': 'Analytics', 'url': '/api/v1/analytics/', 'desc': 'Data analytics and insights'},
            {'name': 'Compliance', 'url': '/api/v1/compliance/', 'desc': 'Compliance reporting'},
        ],
        'features': [
            {'icon': '⚡', 'title': 'High Performance', 'desc': 'Lookup < 50ms, Registration < 200ms'},
            {'icon': '🔒', 'title': 'Secure', 'desc': 'End-to-end encryption with JWT authentication'},
            {'icon': '📊', 'title': 'Real-time', 'desc': 'Live dashboards and notifications'},
            {'icon': '🎯', 'title': 'Accurate', 'desc': 'DSM-5, PGSI, and Lie/Bet screening'},
        ]
    }
    return render(request, 'core/landing.html', context)
