"""
WebSocket Routing for Real-Time Dashboards
Channels routing configuration
"""
from django.urls import path
from . import consumers

websocket_urlpatterns = [
    # Real-Time Dashboard Updates
    path('ws/dashboard/', consumers.DashboardConsumer.as_asgi(), name='dashboard'),
    path('ws/dashboard/grak/', consumers.GRAKDashboardConsumer.as_asgi(), name='grak_dashboard'),
    path('ws/dashboard/operator/', consumers.OperatorDashboardConsumer.as_asgi(), name='operator_dashboard'),
    path('ws/dashboard/hq/', consumers.HQDashboardConsumer.as_asgi(), name='hq_dashboard'),
    
    # Real-Time Notifications
    path('ws/notifications/', consumers.NotificationConsumer.as_asgi(), name='notifications'),
    
    # Real-Time Statistics
    path('ws/statistics/', consumers.StatisticsConsumer.as_asgi(), name='statistics'),
    path('ws/statistics/exclusions/', consumers.ExclusionStatisticsConsumer.as_asgi(), name='exclusion_statistics'),
    
    # Real-Time Monitoring
    path('ws/monitoring/', consumers.MonitoringConsumer.as_asgi(), name='monitoring'),
    path('ws/alerts/', consumers.AlertConsumer.as_asgi(), name='alerts'),
]
