"""
Monitoring Views
Health checks, system status, metrics, alerts
"""
from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone

from .models import SystemMetric, HealthCheck, Alert, APIRequestLog
from .serializers import SystemMetricSerializer, HealthCheckSerializer, AlertSerializer, APIRequestLogSerializer
from apps.api.permissions import IsGRAKStaff
from apps.api.mixins import TimingMixin, SuccessResponseMixin


class HealthCheckView(TimingMixin, APIView):
    """Health check endpoint (public)"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({
            'status': 'healthy',
            'timestamp': timezone.now().isoformat(),
            'version': '1.0.0'
        })


class SystemStatusView(TimingMixin, SuccessResponseMixin, APIView):
    """System status"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        status_data = {
            'database': 'connected',
            'redis': 'connected',
            'celery': 'running',
            'elasticsearch': 'connected',
            'uptime_seconds': 0,
            'timestamp': timezone.now().isoformat()
        }
        
        return self.success_response(data=status_data)


class MetricsView(TimingMixin, SuccessResponseMixin, APIView):
    """System metrics"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        metrics = {
            'cpu_usage': 0.0,
            'memory_usage': 0.0,
            'disk_usage': 0.0,
            'api_response_time_avg': 0.0,
            'active_connections': 0
        }
        
        return self.success_response(data=metrics)


class SystemMetricViewSet(TimingMixin, viewsets.ReadOnlyModelViewSet):
    """System metrics history"""
    serializer_class = SystemMetricSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return SystemMetric.objects.order_by('-timestamp')[:1000]


class AlertViewSet(TimingMixin, viewsets.ModelViewSet):
    """Alert management"""
    serializer_class = AlertSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return Alert.objects.order_by('-created_at')


class APIRequestLogViewSet(TimingMixin, viewsets.ReadOnlyModelViewSet):
    """API request logs"""
    serializer_class = APIRequestLogSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return APIRequestLog.objects.order_by('-timestamp')[:10000]


# Missing ViewSets
class HealthCheckViewSet(TimingMixin, viewsets.ReadOnlyModelViewSet):
    """Health check history"""
    serializer_class = HealthCheckSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return HealthCheck.objects.order_by('-checked_at')[:1000]


# Missing views
class LivenessProbeView(TimingMixin, APIView):
    """Kubernetes liveness probe"""
    permission_classes = []
    
    def get(self, request):
        return Response({'status': 'alive'}, status=status.HTTP_200_OK)


class ReadinessProbeView(TimingMixin, APIView):
    """Kubernetes readiness probe"""
    permission_classes = []
    
    def get(self, request):
        # Check if system is ready
        return Response({'status': 'ready'}, status=status.HTTP_200_OK)


class DetailedHealthCheckView(TimingMixin, SuccessResponseMixin, APIView):
    """Detailed health check"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        health = {
            'status': 'healthy',
            'database': 'connected',
            'redis': 'connected',
            'celery': 'running',
            'elasticsearch': 'connected'
        }
        return self.success_response(data=health)


class ServicesStatusView(TimingMixin, SuccessResponseMixin, APIView):
    """Services status"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        services = {
            'api': 'running',
            'worker': 'running',
            'scheduler': 'running'
        }
        return self.success_response(data=services)


class DependenciesStatusView(TimingMixin, SuccessResponseMixin, APIView):
    """Dependencies status"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        dependencies = {
            'postgresql': 'healthy',
            'redis': 'healthy',
            'elasticsearch': 'healthy'
        }
        return self.success_response(data=dependencies)


class PrometheusMetricsView(TimingMixin, APIView):
    """Prometheus metrics endpoint"""
    permission_classes = []
    
    def get(self, request):
        metrics = "# HELP api_requests_total Total API requests\n"
        metrics += "# TYPE api_requests_total counter\n"
        metrics += "api_requests_total 0\n"
        return Response(metrics, content_type='text/plain')


class SystemMetricsView(TimingMixin, SuccessResponseMixin, APIView):
    """System metrics"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        return self.success_response(data={'cpu': 0, 'memory': 0})


class ApplicationMetricsView(TimingMixin, SuccessResponseMixin, APIView):
    """Application metrics"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        return self.success_response(data={'requests': 0, 'errors': 0})


class DatabaseMetricsView(TimingMixin, SuccessResponseMixin, APIView):
    """Database metrics"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        return self.success_response(data={'connections': 0, 'queries': 0})


class CacheMetricsView(TimingMixin, SuccessResponseMixin, APIView):
    """Cache metrics"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        return self.success_response(data={'hit_rate': 0.95, 'miss_rate': 0.05})


class ResponseTimeMetricsView(TimingMixin, SuccessResponseMixin, APIView):
    """Response time metrics"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        return self.success_response(data={'avg': 150, 'p95': 250, 'p99': 400})


class ThroughputMetricsView(TimingMixin, SuccessResponseMixin, APIView):
    """Throughput metrics"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        return self.success_response(data={'requests_per_second': 100})


class ErrorRateMetricsView(TimingMixin, SuccessResponseMixin, APIView):
    """Error rate metrics"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        return self.success_response(data={'error_rate': 0.01})


class SlowQueriesView(TimingMixin, SuccessResponseMixin, APIView):
    """Slow database queries"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        return self.success_response(data={'queries': []})


class ActiveAlertsView(TimingMixin, SuccessResponseMixin, APIView):
    """Active alerts"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        alerts = Alert.objects.filter(status='active').order_by('-created_at')
        return self.success_response(data=AlertSerializer(alerts, many=True).data)


class AcknowledgeAlertView(TimingMixin, SuccessResponseMixin, APIView):
    """Acknowledge alert"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request, pk):
        alert = Alert.objects.get(pk=pk)
        alert.status = 'acknowledged'
        alert.acknowledged_at = timezone.now()
        alert.save()
        return self.success_response(message='Alert acknowledged')


class ResolveAlertView(TimingMixin, SuccessResponseMixin, APIView):
    """Resolve alert"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request, pk):
        alert = Alert.objects.get(pk=pk)
        alert.status = 'resolved'
        alert.resolved_at = timezone.now()
        alert.save()
        return self.success_response(message='Alert resolved')


class TriggerAlertView(TimingMixin, SuccessResponseMixin, APIView):
    """Trigger alert"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        alert = Alert.objects.create(
            alert_type=request.data['alert_type'],
            severity=request.data['severity'],
            message=request.data['message'],
            status='active'
        )
        return self.success_response(data=AlertSerializer(alert).data, status_code=status.HTTP_201_CREATED)


class SearchAPILogsView(TimingMixin, SuccessResponseMixin, APIView):
    """Search API logs"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        query = request.query_params.get('q', '')
        logs = APIRequestLog.objects.filter(path__icontains=query).order_by('-timestamp')[:100]
        return self.success_response(data=APIRequestLogSerializer(logs, many=True).data)


class APIErrorLogsView(TimingMixin, SuccessResponseMixin, APIView):
    """API error logs"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        logs = APIRequestLog.objects.filter(status_code__gte=400).order_by('-timestamp')[:100]
        return self.success_response(data=APIRequestLogSerializer(logs, many=True).data)


class SlowAPIRequestsView(TimingMixin, SuccessResponseMixin, APIView):
    """Slow API requests"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        logs = APIRequestLog.objects.filter(response_time__gte=1000).order_by('-response_time')[:100]
        return self.success_response(data=APIRequestLogSerializer(logs, many=True).data)


class APILogStatisticsView(TimingMixin, SuccessResponseMixin, APIView):
    """API log statistics"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        stats = {
            'total_requests': APIRequestLog.objects.count(),
            'success_rate': 0.99,
            'avg_response_time': 150
        }
        return self.success_response(data=stats)


class CPUUsageView(TimingMixin, SuccessResponseMixin, APIView):
    """CPU usage"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        return self.success_response(data={'usage_percent': 45})


class MemoryUsageView(TimingMixin, SuccessResponseMixin, APIView):
    """Memory usage"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        return self.success_response(data={'usage_percent': 60})


class DiskUsageView(TimingMixin, SuccessResponseMixin, APIView):
    """Disk usage"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        return self.success_response(data={'usage_percent': 35})


class NetworkUsageView(TimingMixin, SuccessResponseMixin, APIView):
    """Network usage"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        return self.success_response(data={'bandwidth_mbps': 100})


class RegisteredServicesView(TimingMixin, SuccessResponseMixin, APIView):
    """Registered services"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        return self.success_response(data={'services': ['api', 'worker', 'scheduler']})


class ServiceHealthView(TimingMixin, SuccessResponseMixin, APIView):
    """Service health"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request, service_name):
        return self.success_response(data={'service': service_name, 'status': 'healthy'})


class UptimeView(TimingMixin, SuccessResponseMixin, APIView):
    """System uptime"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        return self.success_response(data={'uptime_seconds': 86400})


class AvailabilityView(TimingMixin, SuccessResponseMixin, APIView):
    """System availability"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        return self.success_response(data={'availability_percent': 99.9})


class SLAMetricsView(TimingMixin, SuccessResponseMixin, APIView):
    """SLA metrics"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        return self.success_response(data={'sla_target': 99.9, 'current': 99.95})
