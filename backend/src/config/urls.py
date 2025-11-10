"""
NSER-RG Main URL Configuration
Comprehensive API routing for all modules
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from apps.core.views import landing_page

# API Documentation
schema_view = get_schema_view(
    openapi.Info(
        title="NSER & RG API",
        default_version='v1',
        description="""
        National Self-Exclusion Register & Responsible Gambling API
        
        **Features:**
        - User Registration & Authentication
        - Self-Exclusion Management
        - BST Token Generation & Validation
        - Risk Assessment (Lie/Bet, PGSI, DSM-5)
        - Operator Integration
        - Real-time Notifications
        - Compliance Reporting
        
        **Performance:**
        - Lookup: <50ms
        - Registration: <200ms
        - Propagation: <5s
        """,
        terms_of_service="https://grak.go.ke/terms/",
        contact=openapi.Contact(email="api@grak.go.ke"),
        license=openapi.License(name="Proprietary"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

# URL Patterns
urlpatterns = [
    # Landing Page
    path('', landing_page, name='landing'),
    
    # Admin (use settings.ADMIN_URL for obscurity in production)
    path(settings.ADMIN_URL if hasattr(settings, 'ADMIN_URL') else 'admin/', admin.site.urls),
    
    # API Documentation
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='api-docs'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='api-redoc'),
    path('api/schema/', schema_view.without_ui(cache_timeout=0), name='api-schema'),
    
    # Health Check
    path('health/', include('apps.monitoring.urls')),
    
    # API v1
    path('api/v1/auth/', include('apps.authentication.urls')),
    path('api/v1/users/', include('apps.users.urls')),
    path('api/v1/nser/', include('apps.nser.urls')),
    path('api/v1/bst/', include('apps.bst.urls')),
    path('api/v1/screening/', include('apps.screening.urls')),
    path('api/v1/operators/', include('apps.operators.urls')),
    path('api/v1/settlements/', include('apps.settlements.urls')),
    path('api/v1/analytics/', include('apps.analytics.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    path('api/v1/compliance/', include('apps.compliance.urls')),
    
    # Dashboard WebSocket endpoints
    path('ws/', include('apps.dashboards.urls')),
]

# Static and Media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    
    # Debug Toolbar
    if 'debug_toolbar' in settings.INSTALLED_APPS:
        import debug_toolbar
        urlpatterns = [path('__debug__/', include(debug_toolbar.urls))] + urlpatterns

# Custom Error Handlers
handler400 = 'apps.api.views.error_400'
handler403 = 'apps.api.views.error_403'
handler404 = 'apps.api.views.error_404'
handler500 = 'apps.api.views.error_500'
