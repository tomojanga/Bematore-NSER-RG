"""
Operator Management Models
Licensed gambling operators integration, compliance tracking, and API management
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone
import secrets

from apps.core.models import (
    BaseModel, TimeStampedModel, UUIDModel, GeoLocationModel,
    StatusChoices, CountryChoices, BaseModelManager, generate_reference_number
)


class Operator(BaseModel, GeoLocationModel):
    """Licensed gambling operators"""
    name = models.CharField(max_length=255, unique=True, db_index=True)
    trading_name = models.CharField(max_length=255, blank=True)
    registration_number = models.CharField(max_length=100, unique=True, db_index=True)
    operator_code = models.CharField(max_length=50, unique=True, db_index=True)
    
    # Contact
    email = models.EmailField(db_index=True)
    phone = models.CharField(max_length=20)
    website = models.URLField(blank=True)
    
    # License
    license_number = models.CharField(max_length=100, unique=True, db_index=True)
    license_type = models.CharField(max_length=50, choices=[
        ('online_betting', 'Online Betting'),
        ('land_based_casino', 'Land-Based Casino'),
        ('lottery', 'Lottery'),
        ('sports_betting', 'Sports Betting'),
        ('online_casino', 'Online Casino')
    ])
    license_status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.ACTIVE, db_index=True)
    license_issued_date = models.DateField()
    license_expiry_date = models.DateField(db_index=True)
    
    # Integration
    integration_status = models.CharField(max_length=20, default='pending', db_index=True)
    integration_completed_at = models.DateTimeField(null=True, blank=True)
    is_api_active = models.BooleanField(default=False, db_index=True)
    is_webhook_active = models.BooleanField(default=False)
    
    # Compliance
    compliance_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    last_compliance_check = models.DateTimeField(null=True, blank=True)
    is_compliant = models.BooleanField(default=True, db_index=True)
    
    # Statistics
    total_users = models.PositiveIntegerField(default=0)
    total_screenings = models.PositiveIntegerField(default=0)
    total_exclusions = models.PositiveIntegerField(default=0)
    
    metadata = models.JSONField(default=dict, blank=True)
    objects = BaseModelManager()
    
    class Meta:
        db_table = 'operators'
        ordering = ['name']
        indexes = [
            models.Index(fields=['license_number', 'license_status'], name='op_license_idx'),
            models.Index(fields=['is_api_active', 'is_compliant'], name='op_active_comply_idx'),
        ]
    
    def __str__(self):
        return self.name


class OperatorLicense(BaseModel):
    """Detailed license tracking"""
    operator = models.ForeignKey('Operator', on_delete=models.CASCADE, related_name='licenses')
    license_number = models.CharField(max_length=100, unique=True, db_index=True)
    license_type = models.CharField(max_length=50)
    issued_date = models.DateField()
    expiry_date = models.DateField(db_index=True)
    status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.ACTIVE, db_index=True)
    issued_by = models.CharField(max_length=255, default='GRAK')
    conditions = models.JSONField(default=list, blank=True)
    renewal_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'operator_licenses'
        ordering = ['-issued_date']


class APIKey(BaseModel):
    """API keys for operator integration"""
    operator = models.ForeignKey('Operator', on_delete=models.CASCADE, related_name='api_keys')
    key_name = models.CharField(max_length=100)
    api_key = models.CharField(max_length=255, unique=True, db_index=True)
    api_secret = models.CharField(max_length=255)
    
    # Permissions
    scopes = ArrayField(models.CharField(max_length=50), default=list)
    can_lookup = models.BooleanField(default=True)
    can_register = models.BooleanField(default=True)
    can_screen = models.BooleanField(default=True)
    
    # Security
    is_active = models.BooleanField(default=True, db_index=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    usage_count = models.PositiveIntegerField(default=0)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    # Rate Limiting
    rate_limit_per_second = models.PositiveIntegerField(default=100)
    rate_limit_per_day = models.PositiveIntegerField(default=100000)
    
    # IP Whitelist
    ip_whitelist = ArrayField(models.GenericIPAddressField(), default=list, blank=True)
    
    class Meta:
        db_table = 'operator_api_keys'
        ordering = ['-created_at']
        indexes = [models.Index(fields=['api_key', 'is_active'], name='api_key_active_idx')]
    
    def save(self, *args, **kwargs):
        if not self.api_key:
            self.api_key = f"pk_{'live' if not kwargs.get('test_mode') else 'test'}_{secrets.token_urlsafe(32)}"
            self.api_secret = f"sk_{'live' if not kwargs.get('test_mode') else 'test'}_{secrets.token_urlsafe(48)}"
        super().save(*args, **kwargs)


class IntegrationConfig(BaseModel):
    """Operator integration configuration"""
    operator = models.OneToOneField('Operator', on_delete=models.CASCADE, related_name='integration_config')
    
    # Webhook URLs
    webhook_url_exclusion = models.URLField(blank=True)
    webhook_url_screening = models.URLField(blank=True)
    webhook_url_compliance = models.URLField(blank=True)
    webhook_secret = models.CharField(max_length=255, blank=True)
    
    # Callback URLs
    callback_success_url = models.URLField(blank=True)
    callback_failure_url = models.URLField(blank=True)
    
    # Settings
    auto_propagate_exclusions = models.BooleanField(default=True)
    require_screening_on_register = models.BooleanField(default=True)
    screening_frequency_days = models.PositiveIntegerField(default=90)
    
    # API Settings
    api_version = models.CharField(max_length=10, default='v1')
    timeout_seconds = models.PositiveIntegerField(default=30)
    retry_attempts = models.PositiveIntegerField(default=3)
    
    # Notifications
    notification_email = models.EmailField(blank=True)
    notification_phone = models.CharField(max_length=20, blank=True)
    
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'operator_integration_configs'


class ComplianceReport(BaseModel):
    """Operator compliance tracking"""
    operator = models.ForeignKey('Operator', on_delete=models.CASCADE, related_name='compliance_reports')
    report_reference = models.CharField(max_length=50, unique=True, db_index=True)
    report_period_start = models.DateField()
    report_period_end = models.DateField()
    
    # Metrics
    total_users_screened = models.PositiveIntegerField(default=0)
    total_exclusions_enforced = models.PositiveIntegerField(default=0)
    screening_compliance_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    exclusion_enforcement_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Response Times
    avg_lookup_response_ms = models.FloatField(default=0)
    avg_webhook_response_ms = models.FloatField(default=0)
    
    # Issues
    compliance_issues = models.JSONField(default=list, blank=True)
    violations_count = models.PositiveIntegerField(default=0)
    warnings_issued = models.PositiveIntegerField(default=0)
    
    # Status
    overall_score = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    is_compliant = models.BooleanField(default=True)
    reviewed_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'operator_compliance_reports'
        ordering = ['-report_period_end']


class OperatorAuditLog(TimeStampedModel, UUIDModel):
    """Audit trail for operator actions"""
    operator = models.ForeignKey('Operator', on_delete=models.CASCADE, related_name='audit_logs')
    action = models.CharField(max_length=50, db_index=True)
    resource_type = models.CharField(max_length=50)
    resource_id = models.CharField(max_length=100, blank=True)
    performed_by_user = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    request_data = models.JSONField(default=dict, blank=True)
    response_data = models.JSONField(default=dict, blank=True)
    success = models.BooleanField(default=True)
    error_message = models.TextField(blank=True)
    
    class Meta:
        db_table = 'operator_audit_logs'
        ordering = ['-created_at']
        indexes = [models.Index(fields=['operator', 'action', 'created_at'], name='op_audit_idx')]

