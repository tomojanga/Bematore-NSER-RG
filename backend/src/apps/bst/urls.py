"""
BST (Bematore Screening Token) API URLs
Token generation, validation, and cross-operator tracking
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'bst'

# Router for ViewSets
router = DefaultRouter()
router.register(r'tokens', views.BSTTokenViewSet, basename='token')
router.register(r'mappings', views.BSTMappingViewSet, basename='mapping')
router.register(r'cross-references', views.BSTCrossReferenceViewSet, basename='cross_reference')
router.register(r'audit-logs', views.BSTAuditLogViewSet, basename='audit_log')

urlpatterns = [
    # Token Generation
    path('generate/', views.GenerateBSTTokenView.as_view(), name='generate_token'),
    path('generate/bulk/', views.BulkGenerateBSTTokenView.as_view(), name='bulk_generate_token'),
    
    # Token Validation (HIGH PERFORMANCE - <20ms)
    path('validate/', views.ValidateBSTTokenView.as_view(), name='validate_token'),
    path('validate/bulk/', views.BulkValidateBSTTokenView.as_view(), name='bulk_validate_token'),
    
    # Token Lookup
    path('lookup/', views.LookupBSTTokenView.as_view(), name='lookup_token'),
    path('lookup/user/', views.LookupUserByBSTView.as_view(), name='lookup_user_by_bst'),
    path('lookup/operator/', views.LookupOperatorMappingsView.as_view(), name='lookup_operator_mappings'),
    
    # Token Management
    path('tokens/<uuid:pk>/rotate/', views.RotateBSTTokenView.as_view(), name='rotate_token'),
    path('tokens/<uuid:pk>/compromise/', views.CompromiseBSTTokenView.as_view(), name='compromise_token'),
    path('tokens/<uuid:pk>/deactivate/', views.DeactivateBSTTokenView.as_view(), name='deactivate_token'),
    
    # Cross-Reference & Fraud Detection
    path('cross-reference/detect/', views.DetectDuplicatesView.as_view(), name='detect_duplicates'),
    path('cross-reference/link/', views.LinkIdentifierView.as_view(), name='link_identifier'),
    path('fraud/check/', views.FraudCheckView.as_view(), name='fraud_check'),
    
    # Operator Integration
    path('mappings/create/', views.CreateBSTMappingView.as_view(), name='create_mapping'),
    path('mappings/activity/', views.RecordActivityView.as_view(), name='record_activity'),
    
    # Statistics
    path('statistics/', views.BSTStatisticsView.as_view(), name='statistics'),
    path('statistics/daily/', views.DailyBSTStatsView.as_view(), name='daily_stats'),
    path('statistics/usage/', views.TokenUsageStatsView.as_view(), name='usage_stats'),
    
    # Router URLs
    path('', include(router.urls)),
]
