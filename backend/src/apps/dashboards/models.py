"""
Dashboards Models
Real-time dashboard configurations and widgets.
WebSocket consumers will be defined in consumers.py
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.core.models import BaseModel


class DashboardWidget(BaseModel):
    """Configurable dashboard widgets"""
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='dashboard_widgets')
    widget_type = models.CharField(max_length=50, choices=[
        ('exclusion_stats', 'Exclusion Statistics'),
        ('risk_distribution', 'Risk Distribution'),
        ('operator_compliance', 'Operator Compliance'),
        ('api_performance', 'API Performance'),
        ('recent_activities', 'Recent Activities')
    ])
    position_x = models.PositiveSmallIntegerField(default=0)
    position_y = models.PositiveSmallIntegerField(default=0)
    width = models.PositiveSmallIntegerField(default=4)
    height = models.PositiveSmallIntegerField(default=4)
    config = models.JSONField(default=dict, blank=True)
    is_visible = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'dashboards_widgets'
        ordering = ['position_y', 'position_x']

