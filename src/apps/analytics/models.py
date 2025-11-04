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
    
    class Meta:
        db_table = 'analytics_operator_statistics'
        unique_together = [['operator', 'date']]
        ordering = ['-date']


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

