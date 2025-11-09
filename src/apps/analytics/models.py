"""
Analytics Models
Data warehouse and reporting models
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.core.models import TimeStampedModel


class DailyStatistics(TimeStampedModel):
    """Daily aggregated statistics"""
    date = models.DateField(unique=True, db_index=True)
    total_users = models.PositiveIntegerField(default=0)
    new_users = models.PositiveIntegerField(default=0)
    active_exclusions = models.PositiveIntegerField(default=0)
    new_exclusions = models.PositiveIntegerField(default=0)
    total_assessments = models.PositiveIntegerField(default=0)
    high_risk_users = models.PositiveIntegerField(default=0)
    api_calls_total = models.PositiveIntegerField(default=0)
    avg_response_time_ms = models.FloatField(default=0)
    revenue_ksh = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    transactions_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'analytics_daily_statistics'
        ordering = ['-date']


class OperatorStatistics(TimeStampedModel):
    """Per-operator statistics"""
    operator = models.ForeignKey('operators.Operator', on_delete=models.CASCADE)
    date = models.DateField(db_index=True)
    total_users = models.PositiveIntegerField(default=0)
    screenings_conducted = models.PositiveIntegerField(default=0)
    exclusions_enforced = models.PositiveIntegerField(default=0)
    api_calls = models.PositiveIntegerField(default=0)
    compliance_score = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    revenue_ksh = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    avg_response_time_ms = models.FloatField(default=0)
    
    class Meta:
        db_table = 'analytics_operator_statistics'
        unique_together = [['operator', 'date']]
        ordering = ['-date']


class RealTimeMetrics(TimeStampedModel):
    """Real-time system metrics"""
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    active_sessions = models.PositiveIntegerField(default=0)
    api_calls_per_minute = models.PositiveIntegerField(default=0)
    avg_response_time_ms = models.FloatField(default=0)
    cpu_usage_percent = models.FloatField(default=0)
    memory_usage_percent = models.FloatField(default=0)
    database_connections = models.PositiveIntegerField(default=0)
    queue_size = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'analytics_realtime_metrics'
        ordering = ['-timestamp']


class UserDemographics(TimeStampedModel):
    """User demographics data"""
    date = models.DateField(db_index=True)
    age_group = models.CharField(max_length=20, choices=[
        ('18-25', '18-25'),
        ('26-35', '26-35'),
        ('36-45', '36-45'),
        ('46-55', '46-55'),
        ('56+', '56+')
    ])
    county = models.CharField(max_length=100)
    gender = models.CharField(max_length=10, choices=[
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other')
    ])
    user_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'analytics_user_demographics'
        unique_together = [['date', 'age_group', 'county', 'gender']]


class RiskAnalytics(TimeStampedModel):
    """Risk assessment analytics"""
    date = models.DateField(db_index=True)
    risk_level = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('severe', 'Severe'),
        ('critical', 'Critical')
    ])
    user_count = models.PositiveIntegerField(default=0)
    avg_score = models.FloatField(default=0)
    
    class Meta:
        db_table = 'analytics_risk_analytics'
        unique_together = [['date', 'risk_level']]


class ComplianceMetrics(TimeStampedModel):
    """Compliance tracking metrics"""
    operator = models.ForeignKey('operators.Operator', on_delete=models.CASCADE)
    date = models.DateField(db_index=True)
    exclusion_checks_performed = models.PositiveIntegerField(default=0)
    exclusion_checks_missed = models.PositiveIntegerField(default=0)
    response_time_compliance = models.FloatField(default=100)
    data_accuracy_score = models.FloatField(default=100)
    audit_score = models.FloatField(default=100)
    
    class Meta:
        db_table = 'analytics_compliance_metrics'
        unique_together = [['operator', 'date']]


class GeographicAnalytics(TimeStampedModel):
    """Geographic distribution analytics"""
    date = models.DateField(db_index=True)
    county = models.CharField(max_length=100)
    total_users = models.PositiveIntegerField(default=0)
    active_exclusions = models.PositiveIntegerField(default=0)
    high_risk_users = models.PositiveIntegerField(default=0)
    operator_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'analytics_geographic'
        unique_together = [['date', 'county']]


class APIUsageMetrics(TimeStampedModel):
    """API usage tracking"""
    operator = models.ForeignKey('operators.Operator', on_delete=models.CASCADE)
    endpoint = models.CharField(max_length=200)
    date = models.DateField(db_index=True)
    hour = models.PositiveSmallIntegerField()
    request_count = models.PositiveIntegerField(default=0)
    avg_response_time_ms = models.FloatField(default=0)
    error_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'analytics_api_usage'
        unique_together = [['operator', 'endpoint', 'date', 'hour']]


class Report(TimeStampedModel):
    """Generated reports"""
    report_name = models.CharField(max_length=255)
    report_type = models.CharField(max_length=50, db_index=True)
    period_start = models.DateField()
    period_end = models.DateField()
    generated_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    file_url = models.URLField(blank=True)
    report_data = models.JSONField(default=dict)
    
    class Meta:
        db_table = 'analytics_reports'
        ordering = ['-created_at']

