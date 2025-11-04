"""
Monitoring & Performance Models
System health, performance metrics, and alerting
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.core.models import TimeStampedModel, UUIDModel, PriorityChoices


class SystemMetric(TimeStampedModel):
    """Real-time system performance metrics"""
    metric_name = models.CharField(max_length=100, db_index=True)
    metric_type = models.CharField(max_length=50, choices=[
        ('counter', 'Counter'),
        ('gauge', 'Gauge'),
        ('histogram', 'Histogram')
    ])
    value = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    tags = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'monitoring_system_metrics'
        ordering = ['-timestamp']
        indexes = [models.Index(fields=['metric_name', 'timestamp'], name='metric_name_time_idx')]


class HealthCheck(TimeStampedModel, UUIDModel):
    """System health checks"""
    service_name = models.CharField(max_length=100, db_index=True)
    status = models.CharField(max_length=20, choices=[
        ('healthy', 'Healthy'),
        ('degraded', 'Degraded'),
        ('unhealthy', 'Unhealthy')
    ], db_index=True)
    response_time_ms = models.FloatField()
    checks = models.JSONField(default=dict)
    
    class Meta:
        db_table = 'monitoring_health_checks'
        ordering = ['-created_at']


class Alert(TimeStampedModel, UUIDModel):
    """System alerts and notifications"""
    alert_name = models.CharField(max_length=255)
    alert_type = models.CharField(max_length=50, db_index=True)
    severity = models.CharField(max_length=20, choices=PriorityChoices.choices, db_index=True)
    message = models.TextField()
    triggered_at = models.DateTimeField(auto_now_add=True, db_index=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    is_resolved = models.BooleanField(default=False, db_index=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'monitoring_alerts'
        ordering = ['-triggered_at']


class APIRequestLog(TimeStampedModel, UUIDModel):
    """API request logs for monitoring and debugging"""
    method = models.CharField(max_length=10)
    path = models.CharField(max_length=500, db_index=True)
    status_code = models.PositiveSmallIntegerField(db_index=True)
    response_time_ms = models.FloatField()
    user_id = models.UUIDField(null=True, blank=True, db_index=True)
    operator_id = models.UUIDField(null=True, blank=True, db_index=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    request_id = models.UUIDField(db_index=True)
    error_message = models.TextField(blank=True)
    
    class Meta:
        db_table = 'monitoring_api_request_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['path', 'status_code'], name='api_path_status_idx'),
            models.Index(fields=['created_at', 'response_time_ms'], name='api_time_resp_idx'),
        ]

