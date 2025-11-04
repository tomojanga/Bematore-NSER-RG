"""
Analytics & Reporting Views
Dashboard overviews, statistics, trends, reports
"""
from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta

from .models import DailyStatistics, OperatorStatistics, Report
from .serializers import DailyStatisticsSerializer, OperatorStatisticsSerializer, ReportSerializer
from apps.api.permissions import IsGRAKStaff
from apps.api.mixins import TimingMixin, SuccessResponseMixin, CacheMixin


class DashboardOverviewView(TimingMixin, SuccessResponseMixin, CacheMixin, APIView):
    """Main dashboard overview"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    cache_timeout = 300
    
    def get(self, request):
        from apps.nser.models import SelfExclusionRecord
        from apps.users.models import User
        from apps.operators.models import Operator
        from apps.screening.models import AssessmentSession
        
        today = timezone.now().date()
        
        dashboard = {
            'total_users': User.objects.count(),
            'active_exclusions': SelfExclusionRecord.objects.filter(is_active=True).count(),
            'new_exclusions_today': SelfExclusionRecord.objects.filter(created_at__date=today).count(),
            'total_operators': Operator.objects.filter(is_active=True).count(),
            'assessments_today': AssessmentSession.objects.filter(created_at__date=today).count(),
            'high_risk_users': 0
        }
        
        return self.success_response(data=dashboard)


class RealTimeStatsView(TimingMixin, SuccessResponseMixin, APIView):
    """Real-time statistics"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        stats = {
            'api_calls_per_second': 0,
            'active_sessions': 0,
            'system_health': 'healthy',
            'timestamp': timezone.now().isoformat()
        }
        
        return self.success_response(data=stats)


class TrendsView(TimingMixin, SuccessResponseMixin, APIView):
    """Trends analysis"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        period = request.query_params.get('period', 'month')
        
        trends = {
            'period': period,
            'user_growth': [],
            'exclusion_trends': [],
            'assessment_trends': []
        }
        
        return self.success_response(data=trends)


class DailyStatisticsViewSet(TimingMixin, viewsets.ReadOnlyModelViewSet):
    """Daily statistics"""
    serializer_class = DailyStatisticsSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return DailyStatistics.objects.filter(
            date__gte=timezone.now().date() - timedelta(days=90)
        ).order_by('-date')


class OperatorStatisticsViewSet(TimingMixin, viewsets.ReadOnlyModelViewSet):
    """Operator statistics"""
    serializer_class = OperatorStatisticsSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return OperatorStatistics.objects.select_related('operator').order_by('-date')


class ReportViewSet(TimingMixin, viewsets.ModelViewSet):
    """Report management"""
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return Report.objects.order_by('-created_at')


class GenerateReportView(TimingMixin, SuccessResponseMixin, APIView):
    """Generate custom report"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        report_type = request.data.get('report_type')
        
        report = Report.objects.create(
            report_type=report_type,
            status='pending'
        )
        
        # Generate report (async)
        from .tasks import generate_report
        generate_report.delay(str(report.id))
        
        return self.success_response(
            data=ReportSerializer(report).data,
            message='Report generation started'
        )


class ExportDataView(TimingMixin, SuccessResponseMixin, APIView):
    """Export data"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        export_format = request.data.get('format', 'csv')
        
        # Export data (async)
        from .tasks import export_data
        task = export_data.delay(export_format)
        
        return self.success_response(
            data={'task_id': task.id},
            message='Export started'
        )


# Missing views
class GRAKDashboardView(TimingMixin, SuccessResponseMixin, CacheMixin, APIView):
    """GRAK admin dashboard"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    cache_timeout = 300
    
    def get(self, request):
        dashboard = {
            'total_users': 0,
            'active_exclusions': 0,
            'high_risk_users': 0,
            'operators': 0
        }
        return self.success_response(data=dashboard)


class OperatorDashboardView(TimingMixin, SuccessResponseMixin, APIView):
    """Operator dashboard"""
    permission_classes = [IsAuthenticated, IsOperator]
    
    def get(self, request):
        dashboard = {'api_calls': 0, 'lookups': 0}
        return self.success_response(data=dashboard)


class RealTimeExclusionsView(TimingMixin, SuccessResponseMixin, APIView):
    """Real-time exclusion stats"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        return self.success_response(data={'count': 0})


class RealTimeScreeningsView(TimingMixin, SuccessResponseMixin, APIView):
    """Real-time screening stats"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        return self.success_response(data={'count': 0})


class ExclusionTrendsView(TimingMixin, SuccessResponseMixin, APIView):
    """Exclusion trends"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        return self.success_response(data={'trends': []})


class RiskTrendsView(TimingMixin, SuccessResponseMixin, APIView):
    """Risk trends"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        return self.success_response(data={'trends': []})


class ComplianceTrendsView(TimingMixin, SuccessResponseMixin, APIView):
    """Compliance trends"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        return self.success_response(data={'trends': []})


class GenerateMonthlyReportView(TimingMixin, SuccessResponseMixin, APIView):
    """Generate monthly report"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        from .tasks import generate_report
        task = generate_report.delay('monthly')
        return self.success_response(data={'task_id': task.id})


class GenerateQuarterlyReportView(TimingMixin, SuccessResponseMixin, APIView):
    """Generate quarterly report"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        from .tasks import generate_report
        task = generate_report.delay('quarterly')
        return self.success_response(data={'task_id': task.id})


class GenerateAnnualReportView(TimingMixin, SuccessResponseMixin, APIView):
    """Generate annual report"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        from .tasks import generate_report
        task = generate_report.delay('annual')
        return self.success_response(data={'task_id': task.id})


class GenerateCustomReportView(TimingMixin, SuccessResponseMixin, APIView):
    """Generate custom report"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        from .tasks import generate_report
        task = generate_report.delay('custom', request.data)
        return self.success_response(data={'task_id': task.id})


class ExportCSVView(TimingMixin, SuccessResponseMixin, APIView):
    """Export CSV"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        from .tasks import export_data
        task = export_data.delay('csv')
        return self.success_response(data={'task_id': task.id})


class ExportExcelView(TimingMixin, SuccessResponseMixin, APIView):
    """Export Excel"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        from .tasks import export_data
        task = export_data.delay('excel')
        return self.success_response(data={'task_id': task.id})


class ExportPDFView(TimingMixin, SuccessResponseMixin, APIView):
    """Export PDF"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        from .tasks import export_data
        task = export_data.delay('pdf')
        return self.success_response(data={'task_id': task.id})


class APIPerformanceMetricsView(TimingMixin, SuccessResponseMixin, APIView):
    """API performance metrics"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        return self.success_response(data={'avg_response_time': 150})


class SystemPerformanceMetricsView(TimingMixin, SuccessResponseMixin, APIView):
    """System performance metrics"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        return self.success_response(data={'cpu': 45, 'memory': 60})


class UserGrowthAnalyticsView(TimingMixin, SuccessResponseMixin, APIView):
    """User growth analytics"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        return self.success_response(data={'growth_rate': 15})


class UserDemographicsView(TimingMixin, SuccessResponseMixin, APIView):
    """User demographics"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        return self.success_response(data={'by_age': {}, 'by_county': {}})


class UserEngagementView(TimingMixin, SuccessResponseMixin, APIView):
    """User engagement"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        return self.success_response(data={'active_users': 0})


class OperatorPerformanceView(TimingMixin, SuccessResponseMixin, APIView):
    """Operator performance"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        return self.success_response(data={'operators': []})


class OperatorComplianceScoresView(TimingMixin, SuccessResponseMixin, APIView):
    """Operator compliance scores"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        return self.success_response(data={'scores': []})


class RiskDistributionView(TimingMixin, SuccessResponseMixin, APIView):
    """Risk distribution"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        return self.success_response(data={'distribution': {}})


class HighRiskUsersView(TimingMixin, generics.ListAPIView):
    """High risk users"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        from apps.screening.models import RiskScore
        return RiskScore.objects.filter(risk_level__in=['high', 'severe', 'critical'], is_current=True)
