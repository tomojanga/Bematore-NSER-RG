"""
Compliance & Audit API URLs
Audit logs, compliance checks, incident reports, regulatory reports
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'compliance'

# Router for ViewSets
router = DefaultRouter()
router.register(r'audit-logs', views.AuditLogViewSet, basename='audit_log')
router.register(r'compliance-checks', views.ComplianceCheckViewSet, basename='compliance_check')
router.register(r'incidents', views.IncidentReportViewSet, basename='incident')
router.register(r'regulatory-reports', views.RegulatoryReportViewSet, basename='regulatory_report')
router.register(r'data-retention', views.DataRetentionPolicyViewSet, basename='data_retention')

urlpatterns = [
    # Audit Logs
    path('audit/search/', views.SearchAuditLogsView.as_view(), name='search_audit_logs'),
    path('audit/user/<uuid:user_id>/', views.UserAuditLogsView.as_view(), name='user_audit_logs'),
    path('audit/resource/<str:resource_type>/<str:resource_id>/', views.ResourceAuditLogsView.as_view(), name='resource_audit_logs'),
    path('audit/suspicious/', views.SuspiciousActivityView.as_view(), name='suspicious_activity'),
    path('audit/export/', views.ExportAuditLogsView.as_view(), name='export_audit_logs'),
    
    # Compliance Checks
    path('checks/run/', views.RunComplianceCheckView.as_view(), name='run_compliance_check'),
    path('checks/run-all/', views.RunAllComplianceChecksView.as_view(), name='run_all_checks'),
    path('checks/failed/', views.FailedComplianceChecksView.as_view(), name='failed_checks'),
    path('checks/<uuid:pk>/remediate/', views.RemediateCheckView.as_view(), name='remediate_check'),
    
    # Data Retention
    path('retention/apply/', views.ApplyRetentionPolicyView.as_view(), name='apply_retention'),
    path('retention/archive/', views.ArchiveDataView.as_view(), name='archive_data'),
    path('retention/anonymize/', views.AnonymizeDataView.as_view(), name='anonymize_data'),
    path('retention/delete/', views.DeleteExpiredDataView.as_view(), name='delete_expired'),
    
    # Incident Management
    path('incidents/report/', views.ReportIncidentView.as_view(), name='report_incident'),
    path('incidents/<uuid:pk>/investigate/', views.InvestigateIncidentView.as_view(), name='investigate_incident'),
    path('incidents/<uuid:pk>/contain/', views.ContainIncidentView.as_view(), name='contain_incident'),
    path('incidents/<uuid:pk>/resolve/', views.ResolveIncidentView.as_view(), name='resolve_incident'),
    path('incidents/<uuid:pk>/notify-authorities/', views.NotifyAuthoritiesView.as_view(), name='notify_authorities'),
    path('incidents/critical/', views.CriticalIncidentsView.as_view(), name='critical_incidents'),
    
    # Regulatory Reports
    path('reports/generate/grak/', views.GenerateGRAKReportView.as_view(), name='generate_grak_report'),
    path('reports/generate/nacada/', views.GenerateNACADAReportView.as_view(), name='generate_nacada_report'),
    path('reports/generate/dci/', views.GenerateDCIReportView.as_view(), name='generate_dci_report'),
    path('reports/<uuid:pk>/submit/', views.SubmitRegulatoryReportView.as_view(), name='submit_regulatory_report'),
    path('reports/pending/', views.PendingReportsView.as_view(), name='pending_reports'),
    
    # Data Subject Rights (GDPR/DPA 2019)
    path('dsr/access/', views.DataSubjectAccessView.as_view(), name='data_subject_access'),
    path('dsr/rectify/', views.RectifyDataView.as_view(), name='rectify_data'),
    path('dsr/erase/', views.EraseDataView.as_view(), name='erase_data'),
    path('dsr/export/', views.ExportUserDataView.as_view(), name='export_user_data'),
    
    # Compliance Dashboard
    path('dashboard/', views.ComplianceDashboardView.as_view(), name='compliance_dashboard'),
    path('dashboard/score/', views.OverallComplianceScoreView.as_view(), name='overall_compliance_score'),
    path('dashboard/violations/', views.ViolationsSummaryView.as_view(), name='violations_summary'),
    
    # Statistics
    path('statistics/', views.ComplianceStatisticsView.as_view(), name='statistics'),
    path('statistics/trends/', views.ComplianceTrendsView.as_view(), name='compliance_trends'),
    
    # Router URLs
    path('', include(router.urls)),
]
