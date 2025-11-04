"""
Monitoring & Performance Serializers
Health checks, metrics, alerts, system monitoring
"""
from rest_framework import serializers
from django.utils import timezone
from .models import SystemMetric, HealthCheck, Alert, APIRequestLog


class SystemMetricSerializer(serializers.ModelSerializer):
    """System metric serializer"""
    
    class Meta:
        model = SystemMetric
        fields = [
            'id', 'metric_name', 'metric_type', 'value',
            'timestamp', 'tags', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'timestamp', 'created_at', 'updated_at']


class HealthCheckSerializer(serializers.ModelSerializer):
    """Health check serializer"""
    status_icon = serializers.SerializerMethodField()
    
    class Meta:
        model = HealthCheck
        fields = [
            'id', 'service_name', 'status', 'status_icon',
            'response_time_ms', 'checks', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_status_icon(self, obj):
        icons = {
            'healthy': '✅',
            'degraded': '⚠️',
            'unhealthy': '❌'
        }
        return icons.get(obj.status, '❓')


class AlertSerializer(serializers.ModelSerializer):
    """Alert serializer"""
    severity_icon = serializers.SerializerMethodField()
    time_open = serializers.SerializerMethodField()
    
    class Meta:
        model = Alert
        fields = [
            'id', 'alert_name', 'alert_type', 'severity',
            'severity_icon', 'message', 'triggered_at',
            'resolved_at', 'is_resolved', 'time_open',
            'metadata', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'triggered_at', 'resolved_at',
            'created_at', 'updated_at'
        ]
    
    def get_severity_icon(self, obj):
        icons = {
            'low': '🔵',
            'medium': '🟡',
            'high': '🟠',
            'critical': '🔴'
        }
        return icons.get(obj.severity, '⚪')
    
    def get_time_open(self, obj):
        if obj.is_resolved:
            return None
        
        delta = timezone.now() - obj.triggered_at
        hours = int(delta.total_seconds() / 3600)
        
        if hours >= 24:
            days = hours // 24
            return f"{days} day{'s' if days != 1 else ''}"
        elif hours > 0:
            return f"{hours} hour{'s' if hours != 1 else ''}"
        else:
            minutes = int(delta.total_seconds() / 60)
            return f"{minutes} minute{'s' if minutes != 1 else ''}"


class APIRequestLogSerializer(serializers.ModelSerializer):
    """API request log serializer"""
    status_category = serializers.SerializerMethodField()
    is_slow = serializers.SerializerMethodField()
    
    class Meta:
        model = APIRequestLog
        fields = [
            'id', 'method', 'path', 'status_code', 'status_category',
            'response_time_ms', 'is_slow', 'user_id', 'operator_id',
            'ip_address', 'user_agent', 'request_id', 'error_message',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_status_category(self, obj):
        if 200 <= obj.status_code < 300:
            return 'success'
        elif 300 <= obj.status_code < 400:
            return 'redirect'
        elif 400 <= obj.status_code < 500:
            return 'client_error'
        elif 500 <= obj.status_code < 600:
            return 'server_error'
        return 'unknown'
    
    def get_is_slow(self, obj):
        # Consider slow if > 1000ms
        return obj.response_time_ms > 1000


class DetailedHealthCheckSerializer(serializers.Serializer):
    """Detailed health check response"""
    status = serializers.CharField()
    timestamp = serializers.DateTimeField()
    services = serializers.DictField()
    overall_health = serializers.CharField()


class SystemStatusSerializer(serializers.Serializer):
    """System status serializer"""
    status = serializers.CharField()
    uptime_seconds = serializers.IntegerField()
    version = serializers.CharField()
    environment = serializers.CharField()
    database_status = serializers.CharField()
    cache_status = serializers.CharField()
    celery_status = serializers.CharField()
    storage_status = serializers.CharField()
    timestamp = serializers.DateTimeField()


class PrometheusMetricsSerializer(serializers.Serializer):
    """Prometheus metrics serializer (text format)"""
    metrics_text = serializers.CharField()


class SystemMetricsSerializer(serializers.Serializer):
    """System metrics serializer"""
    cpu_usage_percent = serializers.FloatField()
    memory_usage_percent = serializers.FloatField()
    memory_used_mb = serializers.FloatField()
    memory_total_mb = serializers.FloatField()
    disk_usage_percent = serializers.FloatField()
    disk_used_gb = serializers.FloatField()
    disk_total_gb = serializers.FloatField()
    network_sent_mb = serializers.FloatField()
    network_received_mb = serializers.FloatField()
    active_connections = serializers.IntegerField()
    timestamp = serializers.DateTimeField()


class ResponseTimeMetricsSerializer(serializers.Serializer):
    """Response time metrics serializer"""
    period = serializers.CharField()
    avg_response_time_ms = serializers.FloatField()
    p50_response_time_ms = serializers.FloatField()
    p95_response_time_ms = serializers.FloatField()
    p99_response_time_ms = serializers.FloatField()
    max_response_time_ms = serializers.FloatField()
    min_response_time_ms = serializers.FloatField()
    total_requests = serializers.IntegerField()
    slow_requests_count = serializers.IntegerField()


class ThroughputMetricsSerializer(serializers.Serializer):
    """Throughput metrics serializer"""
    period = serializers.CharField()
    total_requests = serializers.IntegerField()
    requests_per_second = serializers.FloatField()
    requests_per_minute = serializers.FloatField()
    requests_per_hour = serializers.FloatField()
    peak_requests_per_second = serializers.FloatField()
    by_endpoint = serializers.DictField()
    by_method = serializers.DictField()


class ErrorRateMetricsSerializer(serializers.Serializer):
    """Error rate metrics serializer"""
    period = serializers.CharField()
    total_requests = serializers.IntegerField()
    successful_requests = serializers.IntegerField()
    failed_requests = serializers.IntegerField()
    error_rate_percent = serializers.FloatField()
    by_status_code = serializers.DictField()
    by_endpoint = serializers.DictField()
    top_errors = serializers.ListField(child=serializers.DictField())


class SlowQueriesSerializer(serializers.Serializer):
    """Slow queries serializer"""
    query = serializers.CharField()
    execution_time_ms = serializers.FloatField()
    frequency = serializers.IntegerField()
    first_seen = serializers.DateTimeField()
    last_seen = serializers.DateTimeField()
    database = serializers.CharField()


class TriggerAlertSerializer(serializers.Serializer):
    """Trigger alert serializer"""
    alert_name = serializers.CharField(required=True, max_length=255)
    alert_type = serializers.CharField(required=True, max_length=50)
    severity = serializers.ChoiceField(
        choices=['low', 'medium', 'high', 'critical'],
        required=True
    )
    message = serializers.CharField(required=True)
    metadata = serializers.JSONField(required=False)


class APILogSearchSerializer(serializers.Serializer):
    """API log search serializer"""
    method = serializers.CharField(required=False)
    path = serializers.CharField(required=False)
    status_code = serializers.IntegerField(required=False)
    min_response_time = serializers.FloatField(required=False)
    max_response_time = serializers.FloatField(required=False)
    user_id = serializers.UUIDField(required=False)
    operator_id = serializers.UUIDField(required=False)
    ip_address = serializers.IPAddressField(required=False)
    start_date = serializers.DateTimeField(required=False)
    end_date = serializers.DateTimeField(required=False)
    has_error = serializers.BooleanField(required=False)


class UptimeSerializer(serializers.Serializer):
    """Uptime serializer"""
    uptime_seconds = serializers.IntegerField()
    uptime_display = serializers.CharField()
    start_time = serializers.DateTimeField()
    current_time = serializers.DateTimeField()
    availability_percent = serializers.FloatField()


class SLAMetricsSerializer(serializers.Serializer):
    """SLA metrics serializer"""
    period = serializers.CharField()
    target_uptime_percent = serializers.FloatField()
    actual_uptime_percent = serializers.FloatField()
    target_response_time_ms = serializers.FloatField()
    actual_response_time_ms = serializers.FloatField()
    target_error_rate_percent = serializers.FloatField()
    actual_error_rate_percent = serializers.FloatField()
    sla_compliance = serializers.BooleanField()
    incidents_count = serializers.IntegerField()
    downtime_minutes = serializers.FloatField()
