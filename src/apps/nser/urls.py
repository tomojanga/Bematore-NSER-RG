"""
NSER (Self-Exclusion) API URLs
Core self-exclusion functionality
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'nser'

# Router for ViewSets
router = DefaultRouter()
router.register(r'exclusions', views.SelfExclusionViewSet, basename='exclusion')
router.register(r'operator-mappings', views.OperatorExclusionMappingViewSet, basename='operator_mapping')
router.register(r'audit-logs', views.ExclusionAuditLogViewSet, basename='audit_log')
router.register(r'extension-requests', views.ExclusionExtensionRequestViewSet, basename='extension_request')

urlpatterns = [
    # Self-Exclusion Registration
    path('register/', views.RegisterExclusionView.as_view(), name='register_exclusion'),
    path('register/validate/', views.ValidateExclusionView.as_view(), name='validate_exclusion'),
    
    # Real-Time Lookup (Operator API - HIGH PERFORMANCE)
    path('lookup/', views.ExclusionLookupView.as_view(), name='exclusion_lookup'),
    path('lookup/bulk/', views.BulkExclusionLookupView.as_view(), name='bulk_exclusion_lookup'),
    path('lookup/bst/', views.BSTExclusionLookupView.as_view(), name='bst_exclusion_lookup'),
    
    # Exclusion Management
    path('exclusions/<uuid:pk>/activate/', views.ActivateExclusionView.as_view(), name='activate_exclusion'),
    path('exclusions/<uuid:pk>/renew/', views.RenewExclusionView.as_view(), name='renew_exclusion'),
    path('exclusions/<uuid:pk>/terminate/', views.TerminateExclusionView.as_view(), name='terminate_exclusion'),
    path('exclusions/<uuid:pk>/extend/', views.ExtendExclusionView.as_view(), name='extend_exclusion'),
    
    # Propagation
    path('exclusions/<uuid:pk>/propagate/', views.PropagateExclusionView.as_view(), name='propagate_exclusion'),
    path('exclusions/<uuid:pk>/propagation-status/', views.PropagationStatusView.as_view(), name='propagation_status'),
    path('propagation/retry/', views.RetryFailedPropagationsView.as_view(), name='retry_propagations'),
    
    # User-Facing
    path('my-exclusions/', views.MyExclusionsView.as_view(), name='my_exclusions'),
    path('my-exclusions/active/', views.MyActiveExclusionView.as_view(), name='my_active_exclusion'),
    path('check-status/', views.CheckExclusionStatusView.as_view(), name='check_status'),
    
    # Statistics & Analytics
    path('statistics/', views.ExclusionStatisticsView.as_view(), name='statistics'),
    path('statistics/daily/', views.DailyExclusionStatsView.as_view(), name='daily_stats'),
    path('statistics/trends/', views.ExclusionTrendsView.as_view(), name='trends'),
    
    # Compliance & Reporting
    path('reports/compliance/', views.ComplianceReportView.as_view(), name='compliance_report'),
    path('reports/export/', views.ExportExclusionsView.as_view(), name='export_exclusions'),
    
    # Admin Functions
    path('check-expiry/', views.CheckExpiryView.as_view(), name='check_expiry'),
    path('auto-renew/', views.AutoRenewView.as_view(), name='auto_renew'),
    
    # Router URLs
    path('', include(router.urls)),
]
