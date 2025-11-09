"""
Compliance & Audit Models
Comprehensive audit logging, compliance tracking, and regulatory reporting
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone

from apps.core.models import (
    BaseModel, TimeStampedModel, UUIDModel,
    StatusChoices, PriorityChoices, BaseModelManager
)


class AuditLog(TimeStampedModel, UUIDModel):
    """
    Immutable audit log for all system actions (WORM - Write Once Read Many).
    Critical for compliance with DPA 2019, ISO 27001, SOC 2.
    """
    # Who
    user = models.ForeignKey('users.User', on_delete=models.PROTECT, null=True, blank=True, db_index=True)
    operator = models.ForeignKey('operators.Operator', on_delete=models.PROTECT, null=True, blank=True)
    
    # What
    action = models.CharField(_('action'), max_length=100, db_index=True)
    resource_type = models.CharField(_('resource type'), max_length=100, db_index=True)
    resource_id = models.CharField(_('resource ID'), max_length=255, blank=True, db_index=True)
    
    # When
    timestamp = models.DateTimeField(_('timestamp'), auto_now_add=True, db_index=True)
    
    # Where
    ip_address = models.GenericIPAddressField(_('IP address'), null=True, blank=True, db_index=True)
    user_agent = models.TextField(_('user agent'), blank=True)
    location_country = models.CharField(_('country'), max_length=2, blank=True)
    location_city = models.CharField(_('city'), max_length=100, blank=True)
    
    # How
    method = models.CharField(_('method'), max_length=10, blank=True)  # GET, POST, etc.
    endpoint = models.CharField(_('endpoint'), max_length=500, blank=True)
    request_id = models.UUIDField(_('request ID'), null=True, blank=True, db_index=True)
    
    # Why
    reason = models.TextField(_('reason'), blank=True)
    
    # Details
    old_values = models.JSONField(_('old values'), default=dict, blank=True)
    new_values = models.JSONField(_('new values'), default=dict, blank=True)
    metadata = models.JSONField(_('metadata'), default=dict, blank=True)
    
    # Result
    success = models.BooleanField(_('success'), default=True, db_index=True)
    error_message = models.TextField(_('error message'), blank=True)
    response_code = models.PositiveSmallIntegerField(_('response code'), null=True, blank=True)
    
    # Security
    session_id = models.CharField(_('session ID'), max_length=255, blank=True)
    is_suspicious = models.BooleanField(_('suspicious'), default=False, db_index=True)
    risk_score = models.DecimalField(_('risk score'), max_digits=5, decimal_places=2, default=0)
    
    class Meta:
        db_table = 'compliance_audit_logs'
        verbose_name = _('Audit Log')
        verbose_name_plural = _('Audit Logs')
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'timestamp'], name='audit_user_time_idx'),
            models.Index(fields=['action', 'resource_type'], name='audit_action_res_idx'),
            models.Index(fields=['is_suspicious', 'timestamp'], name='audit_suspicious_idx'),
            models.Index(fields=['ip_address', 'timestamp'], name='audit_ip_time_idx'),
        ]
    
    def __str__(self):
        return f"{self.action} - {self.resource_type} - {self.timestamp}"


class ComplianceCheck(BaseModel):
    """
    Automated and manual compliance checks for operators and system.
    """
    check_reference = models.CharField(_('check reference'), max_length=100, unique=True, db_index=True)
    operator = models.ForeignKey('operators.Operator', on_delete=models.CASCADE, null=True, blank=True, related_name='compliance_checks')
    
    # Check Details
    check_type = models.CharField(_('check type'), max_length=50, choices=[
        ('exclusion_enforcement', _('Exclusion Enforcement')),
        ('screening_compliance', _('Screening Compliance')),
        ('api_integration', _('API Integration')),
        ('data_protection', _('Data Protection')),
        ('response_time', _('Response Time')),
        ('webhook_delivery', _('Webhook Delivery')),
        ('manual_audit', _('Manual Audit'))
    ], db_index=True)
    
    # Timing
    scheduled_at = models.DateTimeField(_('scheduled at'), null=True, blank=True)
    started_at = models.DateTimeField(_('started at'), null=True, blank=True)
    completed_at = models.DateTimeField(_('completed at'), null=True, blank=True)
    
    # Status
    status = models.CharField(_('status'), max_length=20, choices=StatusChoices.choices, default=StatusChoices.PENDING, db_index=True)
    
    # Results
    passed = models.BooleanField(_('passed'), default=False, db_index=True)
    score = models.DecimalField(_('score'), max_digits=5, decimal_places=2, null=True, blank=True)
    findings = models.JSONField(_('findings'), default=list, blank=True)
    violations = models.JSONField(_('violations'), default=list, blank=True)
    recommendations = models.TextField(_('recommendations'), blank=True)
    
    # Review
    reviewed_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    reviewed_at = models.DateTimeField(_('reviewed at'), null=True, blank=True)
    
    class Meta:
        db_table = 'compliance_checks'
        ordering = ['-created_at']
        indexes = [models.Index(fields=['operator', 'check_type', 'status'], name='comp_check_op_idx')]


class DataRetentionPolicy(BaseModel):
    """
    Data retention policies for different data types.
    Ensures compliance with DPA 2019 and international standards.
    """
    policy_name = models.CharField(_('policy name'), max_length=255, unique=True)
    data_type = models.CharField(_('data type'), max_length=100, db_index=True)
    retention_period_days = models.PositiveIntegerField(_('retention period (days)'))
    
    # After Retention
    action_after_retention = models.CharField(_('action after retention'), max_length=50, choices=[
        ('archive', _('Archive')),
        ('anonymize', _('Anonymize')),
        ('delete', _('Delete'))
    ])
    
    # Legal Basis
    legal_basis = models.TextField(_('legal basis'))
    regulatory_requirement = ArrayField(models.CharField(max_length=100), default=list)
    
    # Settings
    is_active = models.BooleanField(_('is active'), default=True)
    applies_to_deleted_records = models.BooleanField(_('applies to deleted'), default=True)
    
    class Meta:
        db_table = 'compliance_data_retention_policies'


class IncidentReport(BaseModel):
    """
    Security and compliance incident reporting.
    """
    incident_reference = models.CharField(_('incident reference'), max_length=100, unique=True, db_index=True)
    
    # Classification
    incident_type = models.CharField(_('incident type'), max_length=50, choices=[
        ('data_breach', _('Data Breach')),
        ('unauthorized_access', _('Unauthorized Access')),
        ('system_failure', _('System Failure')),
        ('compliance_violation', _('Compliance Violation')),
        ('fraud_attempt', _('Fraud Attempt')),
        ('other', _('Other'))
    ], db_index=True)
    
    severity = models.CharField(_('severity'), max_length=20, choices=PriorityChoices.choices, default=PriorityChoices.MEDIUM, db_index=True)
    
    # Details
    title = models.CharField(_('title'), max_length=255)
    description = models.TextField(_('description'))
    affected_users_count = models.PositiveIntegerField(_('affected users'), default=0)
    affected_data_types = ArrayField(models.CharField(max_length=100), default=list)
    
    # Timeline
    discovered_at = models.DateTimeField(_('discovered at'), db_index=True)
    reported_at = models.DateTimeField(_('reported at'), auto_now_add=True)
    resolved_at = models.DateTimeField(_('resolved at'), null=True, blank=True)
    
    # Status
    status = models.CharField(_('status'), max_length=20, choices=[
        ('reported', _('Reported')),
        ('investigating', _('Investigating')),
        ('contained', _('Contained')),
        ('resolved', _('Resolved')),
        ('closed', _('Closed'))
    ], default='reported', db_index=True)
    
    # Response
    immediate_actions = models.TextField(_('immediate actions'), blank=True)
    root_cause = models.TextField(_('root cause'), blank=True)
    remediation_plan = models.TextField(_('remediation plan'), blank=True)
    
    # Notifications
    data_commissioner_notified = models.BooleanField(_('data commissioner notified'), default=False)
    users_notified = models.BooleanField(_('users notified'), default=False)
    
    # Assigned To
    assigned_to = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_incidents')
    reported_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='reported_incidents')
    
    class Meta:
        db_table = 'compliance_incident_reports'
        ordering = ['-discovered_at']
        indexes = [models.Index(fields=['incident_type', 'severity'], name='incident_type_sev_idx')]


class RegulatoryReport(BaseModel):
    """
    Regulatory reports submitted to GRAK, NACADA, etc.
    """
    report_reference = models.CharField(_('report reference'), max_length=100, unique=True, db_index=True)
    report_type = models.CharField(_('report type'), max_length=100)
    reporting_period_start = models.DateField(_('period start'))
    reporting_period_end = models.DateField(_('period end'))
    
    # Submission
    submitted_to = models.CharField(_('submitted to'), max_length=100)
    submitted_at = models.DateTimeField(_('submitted at'), null=True, blank=True)
    submitted_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Content
    report_data = models.JSONField(_('report data'), default=dict)
    file_url = models.URLField(_('file URL'), blank=True)
    
    # Status
    status = models.CharField(_('status'), max_length=20, default='draft')
    
    class Meta:
        db_table = 'compliance_regulatory_reports'
        ordering = ['-reporting_period_end']

