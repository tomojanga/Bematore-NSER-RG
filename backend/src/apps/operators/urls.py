"""
Operators API URLs
Operator management, licensing, API keys, compliance
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import views_public

app_name = 'operators'

# Router for ViewSets
router = DefaultRouter()
router.register(r'', views.OperatorViewSet, basename='operator')
router.register(r'licenses', views.OperatorLicenseViewSet, basename='license')
router.register(r'api-keys', views.APIKeyViewSet, basename='api_key')
router.register(r'compliance-reports', views.ComplianceReportViewSet, basename='compliance_report')
router.register(r'audit-logs', views.OperatorAuditLogViewSet, basename='audit_log')

urlpatterns = [
    # Public Operator Registration
    path('public/register/', views_public.PublicRegisterOperatorView.as_view(), name='public_register_operator'),
    
    # Operator Onboarding (Admin)
    path('register/', views.RegisterOperatorView.as_view(), name='register_operator'),
    path('onboard/', views.OnboardOperatorView.as_view(), name='onboard_operator'),
    path('<uuid:pk>/activate/', views.ActivateOperatorView.as_view(), name='activate_operator'),
    path('<uuid:pk>/suspend/', views.SuspendOperatorView.as_view(), name='suspend_operator'),
    
    # License Management
    path('<uuid:pk>/licenses/issue/', views.IssueLicenseView.as_view(), name='issue_license'),
    path('<uuid:pk>/licenses/renew/', views.RenewLicenseView.as_view(), name='renew_license'),
    path('<uuid:pk>/licenses/revoke/', views.RevokeLicenseView.as_view(), name='revoke_license'),
    path('licenses/expiring/', views.ExpiringLicensesView.as_view(), name='expiring_licenses'),
    
    # API Key Management
    path('<uuid:pk>/api-keys/generate/', views.GenerateAPIKeyView.as_view(), name='generate_api_key'),
    path('api-keys/<uuid:key_id>/rotate/', views.RotateAPIKeyView.as_view(), name='rotate_api_key'),
    path('api-keys/<uuid:key_id>/revoke/', views.RevokeAPIKeyView.as_view(), name='revoke_api_key'),
    path('api-keys/validate/', views.ValidateAPIKeyView.as_view(), name='validate_api_key'),
    
    # Integration Configuration
    path('<uuid:pk>/integration/setup/', views.SetupIntegrationView.as_view(), name='setup_integration'),
    path('<uuid:pk>/integration/test/', views.TestIntegrationView.as_view(), name='test_integration'),
    path('<uuid:pk>/integration/webhooks/', views.ConfigureWebhooksView.as_view(), name='configure_webhooks'),
    
    # Webhook Testing
    path('<uuid:pk>/webhooks/test/', views.TestWebhookView.as_view(), name='test_webhook'),
    path('<uuid:pk>/webhooks/logs/', views.WebhookLogsView.as_view(), name='webhook_logs'),
    
    # Compliance Monitoring
    path('<uuid:pk>/compliance/check/', views.RunComplianceCheckView.as_view(), name='compliance_check'),
    path('<uuid:pk>/compliance/score/', views.ComplianceScoreView.as_view(), name='compliance_score'),
    path('<uuid:pk>/compliance/report/', views.GenerateComplianceReportView.as_view(), name='generate_compliance_report'),
    path('compliance/overview/', views.ComplianceOverviewView.as_view(), name='compliance_overview'),
    
    # Performance Metrics
    path('<uuid:pk>/metrics/', views.OperatorMetricsView.as_view(), name='operator_metrics'),
    path('<uuid:pk>/response-times/', views.ResponseTimeMetricsView.as_view(), name='response_times'),
    path('<uuid:pk>/api-usage/', views.APIUsageStatsView.as_view(), name='api_usage'),
    
    # Statistics
    path('statistics/', views.OperatorStatisticsView.as_view(), name='statistics'),
    path('statistics/active/', views.ActiveOperatorsStatsView.as_view(), name='active_operators'),
    path('statistics/integration-status/', views.IntegrationStatusStatsView.as_view(), name='integration_status'),
    
    # Search & Filter
    path('search/', views.SearchOperatorsView.as_view(), name='search_operators'),
    path('filter/compliant/', views.CompliantOperatorsView.as_view(), name='compliant_operators'),
    path('filter/non-compliant/', views.NonCompliantOperatorsView.as_view(), name='non_compliant_operators'),
    
    # Current Operator
    path('me/', views.MyOperatorView.as_view(), name='my_operator'),
    
    # Router URLs
    path('', include(router.urls)),
]
