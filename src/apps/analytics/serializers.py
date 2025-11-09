"""
Analytics & Reporting Serializers
Statistics, reports, dashboards, data analysis
"""
from rest_framework import serializers
from .models import (
    DailyStatistics, OperatorStatistics, Report, RealTimeMetrics,
    UserDemographics, RiskAnalytics, ComplianceMetrics, GeographicAnalytics, APIUsageMetrics
)


class DailyStatisticsSerializer(serializers.ModelSerializer):
    """Daily statistics serializer"""
    day_name = serializers.SerializerMethodField()
    
    class Meta:
        model = DailyStatistics
        fields = [
            'id', 'date', 'day_name',
            'total_users', 'new_users', 'active_exclusions',
            'new_exclusions', 'total_assessments', 'high_risk_users',
            'api_calls_total', 'avg_response_time_ms',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_day_name(self, obj):
        return obj.date.strftime('%A')


class OperatorStatisticsSerializer(serializers.ModelSerializer):
    """Operator statistics serializer"""
    operator_name = serializers.CharField(source='operator.name', read_only=True)
    
    class Meta:
        model = OperatorStatistics
        fields = [
            'id', 'operator', 'operator_name', 'date',
            'total_users', 'screenings_conducted',
            'exclusions_enforced', 'api_calls',
            'compliance_score',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ReportSerializer(serializers.ModelSerializer):
    """Report serializer"""
    generated_by_name = serializers.CharField(
        source='generated_by.get_full_name',
        read_only=True,
        allow_null=True
    )
    
    class Meta:
        model = Report
        fields = [
            'id', 'report_name', 'report_type',
            'period_start', 'period_end',
            'generated_by', 'generated_by_name',
            'file_url', 'report_data',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'file_url', 'created_at', 'updated_at']


class DashboardOverviewSerializer(serializers.Serializer):
    """Dashboard overview serializer"""
    total_users = serializers.IntegerField()
    active_users_today = serializers.IntegerField()
    total_exclusions = serializers.IntegerField()
    active_exclusions = serializers.IntegerField()
    new_exclusions_today = serializers.IntegerField()
    total_assessments = serializers.IntegerField()
    assessments_today = serializers.IntegerField()
    high_risk_users = serializers.IntegerField()
    operators_count = serializers.IntegerField()
    compliant_operators = serializers.IntegerField()
    api_calls_today = serializers.IntegerField()
    avg_response_time_ms = serializers.FloatField()
    system_health = serializers.CharField()
    last_updated = serializers.DateTimeField()


class RealTimeStatsSerializer(serializers.Serializer):
    """Real-time statistics serializer"""
    timestamp = serializers.DateTimeField()
    active_users = serializers.IntegerField()
    active_sessions = serializers.IntegerField()
    api_requests_per_second = serializers.FloatField()
    active_exclusions = serializers.IntegerField()
    screenings_in_progress = serializers.IntegerField()
    pending_notifications = serializers.IntegerField()
    system_load = serializers.DictField()


class TrendsAnalysisSerializer(serializers.Serializer):
    """Trends analysis serializer"""
    metric_name = serializers.CharField()
    period = serializers.CharField()
    data_points = serializers.ListField(child=serializers.DictField())
    trend_direction = serializers.CharField()
    trend_percentage = serializers.FloatField()
    average_value = serializers.FloatField()
    peak_value = serializers.FloatField()
    low_value = serializers.FloatField()


class GenerateReportSerializer(serializers.Serializer):
    """Generate report serializer"""
    report_type = serializers.ChoiceField(
        choices=[
            ('monthly_summary', 'Monthly Summary'),
            ('quarterly_summary', 'Quarterly Summary'),
            ('annual_summary', 'Annual Summary'),
            ('operator_performance', 'Operator Performance'),
            ('user_activity', 'User Activity'),
            ('compliance', 'Compliance'),
            ('financial', 'Financial'),
            ('risk_assessment', 'Risk Assessment'),
            ('custom', 'Custom')
        ],
        required=True
    )
    period_start = serializers.DateField(required=True)
    period_end = serializers.DateField(required=True)
    include_sections = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    format = serializers.ChoiceField(
        choices=[
            ('pdf', 'PDF'),
            ('excel', 'Excel'),
            ('csv', 'CSV'),
            ('json', 'JSON')
        ],
        default='pdf'
    )
    operator_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False
    )
    
    def validate(self, attrs):
        if attrs['period_end'] <= attrs['period_start']:
            raise serializers.ValidationError({
                "period_end": "End date must be after start date."
            })
        return attrs


class DataExportSerializer(serializers.Serializer):
    """Data export serializer"""
    data_type = serializers.ChoiceField(
        choices=[
            ('users', 'Users'),
            ('exclusions', 'Exclusions'),
            ('assessments', 'Assessments'),
            ('transactions', 'Transactions'),
            ('operators', 'Operators')
        ],
        required=True
    )
    format = serializers.ChoiceField(
        choices=[
            ('csv', 'CSV'),
            ('excel', 'Excel'),
            ('json', 'JSON')
        ],
        required=True
    )
    period_start = serializers.DateField(required=False)
    period_end = serializers.DateField(required=False)
    filters = serializers.JSONField(required=False)
    include_fields = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )


class UserGrowthAnalyticsSerializer(serializers.Serializer):
    """User growth analytics serializer"""
    period = serializers.CharField()
    total_users = serializers.IntegerField()
    new_users = serializers.IntegerField()
    growth_rate = serializers.FloatField()
    by_month = serializers.DictField()
    by_county = serializers.DictField()
    by_age_group = serializers.DictField()
    by_gender = serializers.DictField()
    retention_rate = serializers.FloatField()


class UserDemographicsSerializer(serializers.Serializer):
    """User demographics serializer"""
    total_users = serializers.IntegerField()
    by_age_group = serializers.DictField()
    by_gender = serializers.DictField()
    by_county = serializers.DictField()
    by_registration_source = serializers.DictField()
    average_age = serializers.FloatField()
    median_age = serializers.FloatField()


class OperatorPerformanceSerializer(serializers.Serializer):
    """Operator performance serializer"""
    operator_id = serializers.UUIDField()
    operator_name = serializers.CharField()
    total_users = serializers.IntegerField()
    screenings_conducted = serializers.IntegerField()
    exclusions_enforced = serializers.IntegerField()
    compliance_score = serializers.FloatField()
    api_calls = serializers.IntegerField()
    avg_response_time_ms = serializers.FloatField()
    success_rate = serializers.FloatField()
    ranking = serializers.IntegerField()


class HighRiskUsersSerializer(serializers.Serializer):
    """High risk users serializer"""
    total_count = serializers.IntegerField()
    by_risk_level = serializers.DictField()
    self_excluded = serializers.IntegerField()
    not_self_excluded = serializers.IntegerField()
    recent_assessments = serializers.IntegerField()
    overdue_assessments = serializers.IntegerField()
    users = serializers.ListField(child=serializers.DictField())


class RealTimeMetricsSerializer(serializers.ModelSerializer):
    """Real-time metrics serializer"""
    class Meta:
        model = RealTimeMetrics
        fields = '__all__'


class RiskAnalyticsSerializer(serializers.ModelSerializer):
    """Risk analytics serializer"""
    class Meta:
        model = RiskAnalytics
        fields = '__all__'


class ComplianceMetricsSerializer(serializers.ModelSerializer):
    """Compliance metrics serializer"""
    operator_name = serializers.CharField(source='operator.name', read_only=True)
    
    class Meta:
        model = ComplianceMetrics
        fields = '__all__'


class GeographicAnalyticsSerializer(serializers.ModelSerializer):
    """Geographic analytics serializer"""
    class Meta:
        model = GeographicAnalytics
        fields = '__all__'


class APIUsageMetricsSerializer(serializers.ModelSerializer):
    """API usage metrics serializer"""
    operator_name = serializers.CharField(source='operator.name', read_only=True)
    
    class Meta:
        model = APIUsageMetrics
        fields = '__all__'
