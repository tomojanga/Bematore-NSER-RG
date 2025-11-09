"""
Monitoring & Health Check API URLs
System health, metrics, alerts, performance monitoring
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'monitoring'

# Router for ViewSets
router = DefaultRouter()
router.register(r'metrics', views.SystemMetricViewSet, basename='metric')
router.register(r'health-checks', views.HealthCheckViewSet, basename='health_check')
router.register(r'alerts', views.AlertViewSet, basename='alert')
router.register(r'api-logs', views.APIRequestLogViewSet, basename='api_log')

urlpatterns = [
    # Health Checks
    path('health/', views.HealthCheckView.as_view(), name='health'),
    path('health/liveness/', views.LivenessProbeView.as_view(), name='liveness'),
    path('health/readiness/', views.ReadinessProbeView.as_view(), name='readiness'),
    path('health/detailed/', views.DetailedHealthCheckView.as_view(), name='detailed_health'),
    
    # System Status
    path('status/', views.SystemStatusView.as_view(), name='system_status'),
    path('status/services/', views.ServicesStatusView.as_view(), name='services_status'),
    path('status/dependencies/', views.DependenciesStatusView.as_view(), name='dependencies_status'),
    
    # Metrics
    path('metrics/prometheus/', views.PrometheusMetricsView.as_view(), name='prometheus_metrics'),
    path('metrics/system/', views.SystemMetricsView.as_view(), name='system_metrics'),
    path('metrics/application/', views.ApplicationMetricsView.as_view(), name='application_metrics'),
    path('metrics/database/', views.DatabaseMetricsView.as_view(), name='database_metrics'),
    path('metrics/cache/', views.CacheMetricsView.as_view(), name='cache_metrics'),
    
    # Performance Monitoring
    path('performance/response-times/', views.ResponseTimeMetricsView.as_view(), name='response_times'),
    path('performance/throughput/', views.ThroughputMetricsView.as_view(), name='throughput'),
    path('performance/errors/', views.ErrorRateMetricsView.as_view(), name='error_rate'),
    path('performance/slow-queries/', views.SlowQueriesView.as_view(), name='slow_queries'),
    
    # Alerts
    path('alerts/active/', views.ActiveAlertsView.as_view(), name='active_alerts'),
    path('alerts/<uuid:pk>/acknowledge/', views.AcknowledgeAlertView.as_view(), name='acknowledge_alert'),
    path('alerts/<uuid:pk>/resolve/', views.ResolveAlertView.as_view(), name='resolve_alert'),
    path('alerts/trigger/', views.TriggerAlertView.as_view(), name='trigger_alert'),
    
    # API Request Logs
    path('api-logs/search/', views.SearchAPILogsView.as_view(), name='search_api_logs'),
    path('api-logs/errors/', views.APIErrorLogsView.as_view(), name='api_error_logs'),
    path('api-logs/slow/', views.SlowAPIRequestsView.as_view(), name='slow_api_requests'),
    path('api-logs/statistics/', views.APILogStatisticsView.as_view(), name='api_log_statistics'),
    
    # Resource Usage
    path('resources/cpu/', views.CPUUsageView.as_view(), name='cpu_usage'),
    path('resources/memory/', views.MemoryUsageView.as_view(), name='memory_usage'),
    path('resources/disk/', views.DiskUsageView.as_view(), name='disk_usage'),
    path('resources/network/', views.NetworkUsageView.as_view(), name='network_usage'),
    
    # Service Discovery
    path('services/', views.RegisteredServicesView.as_view(), name='registered_services'),
    path('services/<str:service_name>/health/', views.ServiceHealthView.as_view(), name='service_health'),
    
    # Uptime & Availability
    path('uptime/', views.UptimeView.as_view(), name='uptime'),
    path('availability/', views.AvailabilityView.as_view(), name='availability'),
    path('sla/', views.SLAMetricsView.as_view(), name='sla_metrics'),
    
    # Router URLs
    path('', include(router.urls)),
]
