"""
WebSocket Routing Configuration
ASGI routing for WebSocket connections
"""
from django.urls import re_path
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator

# Import consumers
from apps.dashboards.consumers import DashboardConsumer
from apps.notifications.consumers import NotificationConsumer
from apps.monitoring.consumers import MonitoringConsumer


# WebSocket URL patterns
websocket_urlpatterns = [
    # Dashboard real-time updates
    re_path(r'ws/dashboard/$', DashboardConsumer.as_asgi()),
    
    # Real-time notifications
    re_path(r'ws/notifications/$', NotificationConsumer.as_asgi()),
    
    # System monitoring (staff only)
    re_path(r'ws/monitoring/$', MonitoringConsumer.as_asgi()),
]

# ASGI application
application = ProtocolTypeRouter({
    # WebSocket handler
    'websocket': AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        )
    ),
})
