"""
Analytics & Reporting API URLs
Statistics, reports, data analysis
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'analytics'

# Router for ViewSets
router = DefaultRouter()
router.register(r'daily-statistics', views.DailyStatisticsViewSet, basename='daily_statistics')
router.register(r'operator-statistics', views.OperatorStatisticsViewSet, basename='operator_statistics')
router.register(r'reports', views.ReportViewSet, basename='report')

urlpatterns = [
    # Dashboard Overview
    path('dashboard-overview/', views.DashboardOverviewView.as_view(), name='dashboard_overview'),
    path('dashboard/grak/', views.GRAKDashboardView.as_view(), name='grak_dashboard'),
    path('dashboard/operator/', views.OperatorDashboardView.as_view(), name='operator_dashboard'),
    
    # Real-Time Statistics
    path('real-time-stats/', views.RealTimeStatsView.as_view(), name='real_time_stats'),
    path('realtime/exclusions/', views.RealTimeExclusionsView.as_view(), name='realtime_exclusions'),
    path('realtime/screenings/', views.RealTimeScreeningsView.as_view(), name='realtime_screenings'),
    
    # Trends & Analysis
    path('trends/', views.TrendsView.as_view(), name='trends'),
    path('trends/exclusions/', views.ExclusionTrendsView.as_view(), name='exclusion_trends'),
    path('trends/risk/', views.RiskTrendsView.as_view(), name='risk_trends'),
    path('trends/compliance/', views.ComplianceTrendsView.as_view(), name='compliance_trends'),
    
    # Reports Generation
    path('reports/generate/', views.GenerateReportView.as_view(), name='generate_report'),
    path('reports/generate/monthly/', views.GenerateMonthlyReportView.as_view(), name='generate_monthly_report'),
    path('reports/generate/quarterly/', views.GenerateQuarterlyReportView.as_view(), name='generate_quarterly_report'),
    path('reports/generate/annual/', views.GenerateAnnualReportView.as_view(), name='generate_annual_report'),
    path('reports/generate/custom/', views.GenerateCustomReportView.as_view(), name='generate_custom_report'),
    
    # Data Export
    path('export/data/', views.ExportDataView.as_view(), name='export_data'),
    path('export/csv/', views.ExportCSVView.as_view(), name='export_csv'),
    path('export/excel/', views.ExportExcelView.as_view(), name='export_excel'),
    path('export/pdf/', views.ExportPDFView.as_view(), name='export_pdf'),
    
    # Performance Metrics
    path('performance/api/', views.APIPerformanceMetricsView.as_view(), name='api_performance'),
    path('performance/system/', views.SystemPerformanceMetricsView.as_view(), name='system_performance'),
    
    # User Analytics
    path('user-growth/', views.UserGrowthAnalyticsView.as_view(), name='user_growth'),
    path('user-demographics/', views.UserDemographicsView.as_view(), name='user_demographics'),
    path('users/engagement/', views.UserEngagementView.as_view(), name='user_engagement'),
    
    # Operator Analytics
    path('operator-performance/', views.OperatorPerformanceView.as_view(), name='operator_performance'),
    path('operators/compliance-scores/', views.OperatorComplianceScoresView.as_view(), name='operator_compliance_scores'),
    
    # Risk Analytics
    path('risk/distribution/', views.RiskDistributionView.as_view(), name='risk_distribution'),
    path('risk/high-risk-users/', views.HighRiskUsersView.as_view(), name='high_risk_users'),
    
    # Router URLs
    path('', include(router.urls)),
]
