"""
Compliance Views
Audit logs, compliance checks, incidents, regulatory reports
"""
from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from .models import AuditLog, ComplianceCheck, DataRetentionPolicy, IncidentReport, RegulatoryReport
from .serializers import (
    AuditLogSerializer, ComplianceCheckSerializer, DataRetentionPolicySerializer,
    IncidentReportSerializer, RegulatoryReportSerializer
)
from apps.api.permissions import IsGRAKStaff
from apps.api.mixins import TimingMixin, SuccessResponseMixin


class AuditLogViewSet(TimingMixin, viewsets.ReadOnlyModelViewSet):
    """Audit logs (read-only, immutable)"""
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return AuditLog.objects.select_related('user').order_by('-created_at')


class ComplianceCheckViewSet(TimingMixin, viewsets.ModelViewSet):
    """Compliance checks"""
    serializer_class = ComplianceCheckSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return ComplianceCheck.objects.order_by('-check_date')


class DataRetentionPolicyViewSet(TimingMixin, viewsets.ModelViewSet):
    """Data retention policies"""
    serializer_class = DataRetentionPolicySerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return DataRetentionPolicy.objects.filter(is_active=True)


class IncidentReportViewSet(TimingMixin, viewsets.ModelViewSet):
    """Incident reports"""
    serializer_class = IncidentReportSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return IncidentReport.objects.select_related('reported_by').order_by('-incident_date')


class RegulatoryReportViewSet(TimingMixin, viewsets.ModelViewSet):
    """Regulatory reports"""
    serializer_class = RegulatoryReportSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return RegulatoryReport.objects.order_by('-report_date')


class ComplianceDashboardView(TimingMixin, SuccessResponseMixin, APIView):
    """Compliance dashboard"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        dashboard = {
            'total_audit_logs': AuditLog.objects.count(),
            'compliance_checks_pending': ComplianceCheck.objects.filter(status='pending').count(),
            'open_incidents': IncidentReport.objects.filter(status__in=['open', 'investigating']).count(),
            'compliance_score': 95.5
        }
        
        return self.success_response(data=dashboard)

class SearchAuditLogsView(TimingMixin, SuccessResponseMixin, APIView):
    """Search audit logs"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        query = request.query_params.get('q', '')
        logs = AuditLog.objects.filter(action__icontains=query).order_by('-created_at')[:100]
        return self.success_response(data=AuditLogSerializer(logs, many=True).data)


class UserAuditLogsView(TimingMixin, SuccessResponseMixin, APIView):
    """User audit logs"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request, user_id):
        logs = AuditLog.objects.filter(user_id=user_id).order_by('-created_at')
        return self.success_response(data=AuditLogSerializer(logs, many=True).data)


class ResourceAuditLogsView(TimingMixin, SuccessResponseMixin, APIView):
    """Resource audit logs"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request, resource_type, resource_id):
        logs = AuditLog.objects.filter(
            resource_type=resource_type,
            resource_id=resource_id
        ).order_by('-created_at')
        return self.success_response(data=AuditLogSerializer(logs, many=True).data)


class SuspiciousActivityView(TimingMixin, SuccessResponseMixin, APIView):
    """Suspicious activity"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        logs = AuditLog.objects.filter(is_suspicious=True).order_by('-created_at')[:100]
        return self.success_response(data=AuditLogSerializer(logs, many=True).data)


class ExportAuditLogsView(TimingMixin, SuccessResponseMixin, APIView):
    """Export audit logs"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        from .tasks import export_audit_logs
        task = export_audit_logs.delay(request.data)
        return self.success_response(data={'task_id': task.id}, message='Export started')


class RunComplianceCheckView(TimingMixin, SuccessResponseMixin, APIView):
    """Run compliance check"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        from .tasks import run_compliance_check
        task = run_compliance_check.delay(request.data.get('check_type'))
        return self.success_response(data={'task_id': task.id}, message='Check started')


class RunAllComplianceChecksView(TimingMixin, SuccessResponseMixin, APIView):
    """Run all compliance checks"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        from .tasks import run_all_compliance_checks
        task = run_all_compliance_checks.delay()
        return self.success_response(data={'task_id': task.id}, message='All checks started')


class FailedComplianceChecksView(TimingMixin, SuccessResponseMixin, APIView):
    """Failed compliance checks"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        checks = ComplianceCheck.objects.filter(status='failed').order_by('-check_date')
        return self.success_response(data=ComplianceCheckSerializer(checks, many=True).data)


class RemediateCheckView(TimingMixin, SuccessResponseMixin, APIView):
    """Remediate compliance check"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request, pk):
        check = ComplianceCheck.objects.get(pk=pk)
        check.status = 'remediated'
        check.remediated_at = timezone.now()
        check.save()
        return self.success_response(message='Check remediated')


class ApplyRetentionPolicyView(TimingMixin, SuccessResponseMixin, APIView):
    """Apply retention policy"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        from .tasks import apply_retention_policy
        task = apply_retention_policy.delay()
        return self.success_response(data={'task_id': task.id}, message='Policy application started')


class ArchiveDataView(TimingMixin, SuccessResponseMixin, APIView):
    """Archive data"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        from .tasks import archive_old_data
        task = archive_old_data.delay()
        return self.success_response(data={'task_id': task.id}, message='Archiving started')


class AnonymizeDataView(TimingMixin, SuccessResponseMixin, APIView):
    """Anonymize data"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        from .tasks import anonymize_data
        task = anonymize_data.delay(request.data.get('resource_type'))
        return self.success_response(data={'task_id': task.id}, message='Anonymization started')


class DeleteExpiredDataView(TimingMixin, SuccessResponseMixin, APIView):
    """Delete expired data"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        from .tasks import delete_expired_data
        task = delete_expired_data.delay()
        return self.success_response(data={'task_id': task.id}, message='Deletion started')


class ReportIncidentView(TimingMixin, SuccessResponseMixin, APIView):
    """Report incident"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        incident = IncidentReport.objects.create(
            incident_type=request.data['incident_type'],
            severity=request.data['severity'],
            description=request.data['description'],
            reported_by=request.user,
            incident_date=timezone.now(),
            status='open'
        )
        return self.success_response(
            data=IncidentReportSerializer(incident).data,
            message='Incident reported',
            status_code=status.HTTP_201_CREATED
        )


class InvestigateIncidentView(TimingMixin, SuccessResponseMixin, APIView):
    """Investigate incident"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request, pk):
        incident = IncidentReport.objects.get(pk=pk)
        incident.status = 'investigating'
        incident.investigated_at = timezone.now()
        incident.save()
        return self.success_response(message='Investigation started')


class ContainIncidentView(TimingMixin, SuccessResponseMixin, APIView):
    """Contain incident"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request, pk):
        incident = IncidentReport.objects.get(pk=pk)
        incident.status = 'contained'
        incident.contained_at = timezone.now()
        incident.save()
        return self.success_response(message='Incident contained')


class ResolveIncidentView(TimingMixin, SuccessResponseMixin, APIView):
    """Resolve incident"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request, pk):
        incident = IncidentReport.objects.get(pk=pk)
        incident.status = 'resolved'
        incident.resolved_at = timezone.now()
        incident.save()
        return self.success_response(message='Incident resolved')


class NotifyAuthoritiesView(TimingMixin, SuccessResponseMixin, APIView):
    """Notify authorities"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request, pk):
        incident = IncidentReport.objects.get(pk=pk)
        
        from .tasks import notify_authorities
        task = notify_authorities.delay(str(incident.id))
        
        incident.authorities_notified = True
        incident.authorities_notified_at = timezone.now()
        incident.save()
        
        return self.success_response(data={'task_id': task.id}, message='Authorities notification sent')


class CriticalIncidentsView(TimingMixin, SuccessResponseMixin, APIView):
    """Critical incidents"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        incidents = IncidentReport.objects.filter(
            severity='critical',
            status__in=['open', 'investigating']
        ).order_by('-incident_date')
        return self.success_response(data=IncidentReportSerializer(incidents, many=True).data)


class GenerateGRAKReportView(TimingMixin, SuccessResponseMixin, APIView):
    """Generate GRAK report"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        report = RegulatoryReport.objects.create(
            report_type='grak',
            report_date=timezone.now().date(),
            status='draft'
        )
        
        from .tasks import generate_regulatory_report
        generate_regulatory_report.delay(str(report.id))
        
        return self.success_response(
            data=RegulatoryReportSerializer(report).data,
            message='GRAK report generation started',
            status_code=status.HTTP_201_CREATED
        )


class GenerateNACADAReportView(TimingMixin, SuccessResponseMixin, APIView):
    """Generate NACADA report"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        report = RegulatoryReport.objects.create(
            report_type='nacada',
            report_date=timezone.now().date(),
            status='draft'
        )
        
        from .tasks import generate_regulatory_report
        generate_regulatory_report.delay(str(report.id))
        
        return self.success_response(
            data=RegulatoryReportSerializer(report).data,
            message='NACADA report generation started',
            status_code=status.HTTP_201_CREATED
        )


class GenerateDCIReportView(TimingMixin, SuccessResponseMixin, APIView):
    """Generate DCI report"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        report = RegulatoryReport.objects.create(
            report_type='dci',
            report_date=timezone.now().date(),
            status='draft'
        )
        
        from .tasks import generate_regulatory_report
        generate_regulatory_report.delay(str(report.id))
        
        return self.success_response(
            data=RegulatoryReportSerializer(report).data,
            message='DCI report generation started',
            status_code=status.HTTP_201_CREATED
        )


class SubmitRegulatoryReportView(TimingMixin, SuccessResponseMixin, APIView):
    """Submit regulatory report"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request, pk):
        report = RegulatoryReport.objects.get(pk=pk)
        report.status = 'submitted'
        report.submitted_at = timezone.now()
        report.save()
        
        return self.success_response(message='Report submitted')


class PendingReportsView(TimingMixin, SuccessResponseMixin, APIView):
    """Pending reports"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        reports = RegulatoryReport.objects.filter(status__in=['draft', 'pending']).order_by('-report_date')
        return self.success_response(data=RegulatoryReportSerializer(reports, many=True).data)
