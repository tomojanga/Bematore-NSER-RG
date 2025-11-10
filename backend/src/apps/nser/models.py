"""
NSER (National Self-Exclusion Register) Models
Core self-exclusion functionality with real-time multi-operator propagation
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone
from django.core.exceptions import ValidationError
from datetime import timedelta

from apps.core.models import (
    BaseModel, TimeStampedModel, UUIDModel, GeoLocationModel,
    StatusChoices, ExclusionPeriodChoices, VerificationStatusChoices,
    RiskLevelChoices, BaseModelManager, generate_reference_number
)


class SelfExclusionRecord(BaseModel, GeoLocationModel):
    """
    Core self-exclusion record - the heart of NSER system.
    Stores all self-exclusion details with encrypted PII.
    
    Performance: <50ms lookup, <200ms registration, <5s propagation to all operators
    """
    # User Information
    user = models.ForeignKey(
        'users.User',
        on_delete=models.PROTECT,  # Never delete exclusion records
        related_name='exclusions',
        db_index=True
    )
    bst_token = models.ForeignKey(
        'bst.BSTToken',
        on_delete=models.PROTECT,
        related_name='exclusions',
        db_index=True,
        help_text=_('Bematore Screening Token for cross-operator tracking')
    )
    
    # Exclusion Details
    exclusion_reference = models.CharField(
        _('exclusion reference'),
        max_length=50,
        unique=True,
        db_index=True,
        help_text=_('Unique exclusion reference number')
    )
    exclusion_period = models.CharField(
        _('exclusion period'),
        max_length=20,
        choices=ExclusionPeriodChoices.choices,
        db_index=True
    )
    custom_period_days = models.PositiveIntegerField(
        _('custom period days'),
        null=True,
        blank=True,
        help_text=_('Custom exclusion period in days')
    )
    
    # Dates
    effective_date = models.DateTimeField(
        _('effective date'),
        default=timezone.now,
        db_index=True,
        help_text=_('When exclusion becomes active')
    )
    expiry_date = models.DateTimeField(
        _('expiry date'),
        db_index=True,
        help_text=_('When exclusion ends')
    )
    actual_end_date = models.DateTimeField(
        _('actual end date'),
        null=True,
        blank=True,
        help_text=_('Actual date exclusion ended (for early termination)')
    )
    
    # Auto-Renewal
    is_auto_renewable = models.BooleanField(
        _('auto-renewable'),
        default=False,
        help_text=_('Automatically renew after expiry (permanent exclusions)')
    )
    renewal_count = models.PositiveIntegerField(
        _('renewal count'),
        default=0,
        help_text=_('Number of times auto-renewed')
    )
    last_renewed_at = models.DateTimeField(
        _('last renewed at'),
        null=True,
        blank=True
    )
    
    # Status
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=[
            ('pending', _('Pending')),
            ('active', _('Active')),
            ('expired', _('Expired')),
            ('terminated', _('Terminated Early')),
            ('suspended', _('Suspended')),
            ('revoked', _('Revoked'))
        ],
        default='pending',
        db_index=True
    )
    is_active = models.BooleanField(
        _('is active'),
        default=True,
        db_index=True,
        help_text=_('Quick lookup for active exclusions')
    )
    
    # Reason & Context
    reason = models.TextField(
        _('reason for exclusion'),
        blank=True,
        help_text=_('User-provided reason for self-exclusion')
    )
    motivation_type = models.CharField(
        _('motivation type'),
        max_length=50,
        choices=[
            ('financial_loss', _('Financial Loss')),
            ('relationship_issues', _('Relationship Issues')),
            ('mental_health', _('Mental Health')),
            ('addiction', _('Addiction Concerns')),
            ('precaution', _('Precautionary Measure')),
            ('other', _('Other'))
        ],
        blank=True
    )
    
    # Risk Assessment Link
    triggering_assessment = models.ForeignKey(
        'screening.AssessmentSession',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='triggered_exclusions',
        help_text=_('Assessment that triggered this exclusion')
    )
    risk_level_at_exclusion = models.CharField(
        _('risk level at exclusion'),
        max_length=20,
        choices=RiskLevelChoices.choices,
        blank=True,
        db_index=True
    )
    
    # Consent & Legal
    terms_accepted = models.BooleanField(
        _('terms accepted'),
        default=True
    )
    consent_recorded_at = models.DateTimeField(
        _('consent recorded at'),
        auto_now_add=True
    )
    consent_ip_address = models.GenericIPAddressField(
        _('consent IP address'),
        null=True,
        blank=True
    )
    digital_signature = models.TextField(
        _('digital signature'),
        blank=True,
        help_text=_('Cryptographic signature of consent')
    )
    
    # Propagation Status
    propagation_status = models.CharField(
        _('propagation status'),
        max_length=20,
        choices=[
            ('pending', _('Pending')),
            ('in_progress', _('In Progress')),
            ('completed', _('Completed')),
            ('partial', _('Partial')),
            ('failed', _('Failed'))
        ],
        default='pending',
        db_index=True
    )
    operators_notified = models.PositiveIntegerField(
        _('operators notified'),
        default=0
    )
    operators_acknowledged = models.PositiveIntegerField(
        _('operators acknowledged'),
        default=0
    )
    propagation_completed_at = models.DateTimeField(
        _('propagation completed at'),
        null=True,
        blank=True
    )
    
    # Early Termination
    can_terminate_early = models.BooleanField(
        _('can terminate early'),
        default=False,
        help_text=_('Whether user can request early termination')
    )
    early_termination_request_date = models.DateTimeField(
        _('early termination request date'),
        null=True,
        blank=True
    )
    early_termination_approved = models.BooleanField(
        _('early termination approved'),
        default=False
    )
    early_termination_approved_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='exclusion_terminations_approved'
    )
    termination_reason = models.TextField(
        _('termination reason'),
        blank=True
    )
    
    # Notification Preferences
    notification_sent = models.BooleanField(
        _('confirmation notification sent'),
        default=False
    )
    notification_sent_at = models.DateTimeField(
        _('notification sent at'),
        null=True,
        blank=True
    )
    reminder_notifications_enabled = models.BooleanField(
        _('reminder notifications enabled'),
        default=True,
        help_text=_('Send reminders before expiry')
    )
    
    # Metadata
    metadata = models.JSONField(
        _('metadata'),
        default=dict,
        blank=True
    )
    
    objects = BaseModelManager()
    
    class Meta:
        db_table = 'nser_exclusion_records'
        verbose_name = _('Self-Exclusion Record')
        verbose_name_plural = _('Self-Exclusion Records')
        ordering = ['-effective_date']
        indexes = [
            models.Index(fields=['user', 'is_active'], name='excl_user_active_idx'),
            models.Index(fields=['bst_token', 'is_active'], name='excl_bst_active_idx'),
            models.Index(fields=['exclusion_reference'], name='excl_reference_idx'),
            models.Index(fields=['status', 'effective_date'], name='excl_status_date_idx'),
            models.Index(fields=['expiry_date', 'is_active'], name='excl_expiry_active_idx'),
            models.Index(fields=['is_active', 'effective_date', 'expiry_date'], name='excl_active_dates_idx'),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(expiry_date__gt=models.F('effective_date')),
                name='excl_expiry_after_effective'
            )
        ]
    
    def __str__(self):
        return f"Exclusion {self.exclusion_reference} - {self.user}"
    
    def save(self, *args, **kwargs):
        # Generate reference number if not exists
        if not self.exclusion_reference:
            self.exclusion_reference = generate_reference_number(prefix='NSER', length=10)
        
        # Calculate expiry date if not set
        if not self.expiry_date:
            self.expiry_date = self.calculate_expiry_date()
        
        # Set auto-renewal for permanent exclusions
        if self.exclusion_period == ExclusionPeriodChoices.PERMANENT:
            self.is_auto_renewable = True
        
        # Update active status
        now = timezone.now()
        self.is_active = (
            self.status == 'active' and
            self.effective_date <= now and
            self.expiry_date > now
        )
        
        super().save(*args, **kwargs)
    
    def calculate_expiry_date(self):
        """Calculate expiry date based on exclusion period"""
        period_map = {
            ExclusionPeriodChoices.SIX_MONTHS: 180,
            ExclusionPeriodChoices.ONE_YEAR: 365,
            ExclusionPeriodChoices.FIVE_YEARS: 1825,
            ExclusionPeriodChoices.PERMANENT: 1825,  # 5 years with auto-renewal
        }
        
        if self.exclusion_period == ExclusionPeriodChoices.CUSTOM:
            days = self.custom_period_days or 365
        else:
            days = period_map.get(self.exclusion_period, 365)
        
        return self.effective_date + timedelta(days=days)
    
    @property
    def is_currently_active(self):
        """Check if exclusion is currently in effect"""
        now = timezone.now()
        return (
            self.is_active and
            self.status == 'active' and
            self.effective_date <= now < self.expiry_date
        )
    
    @property
    def days_remaining(self):
        """Calculate days remaining until expiry"""
        if not self.is_currently_active:
            return 0
        delta = self.expiry_date - timezone.now()
        return max(0, delta.days)
    
    @property
    def progress_percentage(self):
        """Calculate percentage of exclusion period completed"""
        if not self.is_currently_active:
            return 100 if self.status == 'expired' else 0
        
        total_duration = (self.expiry_date - self.effective_date).total_seconds()
        elapsed = (timezone.now() - self.effective_date).total_seconds()
        return min(100, max(0, (elapsed / total_duration) * 100))
    
    def renew(self):
        """Renew exclusion (for auto-renewable permanent exclusions)"""
        if not self.is_auto_renewable:
            raise ValidationError('This exclusion is not auto-renewable')
        
        self.effective_date = self.expiry_date
        self.expiry_date = self.calculate_expiry_date()
        self.renewal_count += 1
        self.last_renewed_at = timezone.now()
        self.save()
    
    def terminate_early(self, approved_by, reason=''):
        """Terminate exclusion before expiry date (admin only)"""
        if not self.is_currently_active:
            raise ValidationError('Can only terminate active exclusions')
        
        self.status = 'terminated'
        self.is_active = False
        self.actual_end_date = timezone.now()
        self.early_termination_approved = True
        self.early_termination_approved_by = approved_by
        self.termination_reason = reason
        self.save()
    
    def check_expiry(self):
        """Check and update expiry status"""
        if self.is_currently_active and timezone.now() >= self.expiry_date:
            if self.is_auto_renewable:
                self.renew()
            else:
                self.status = 'expired'
                self.is_active = False
                self.actual_end_date = timezone.now()
                self.save()


class OperatorExclusionMapping(TimeStampedModel, UUIDModel):
    """
    Track exclusion status with each individual operator.
    Essential for propagation monitoring and compliance.
    """
    exclusion = models.ForeignKey(
        'SelfExclusionRecord',
        on_delete=models.CASCADE,
        related_name='operator_mappings'
    )
    operator = models.ForeignKey(
        'operators.Operator',
        on_delete=models.CASCADE,
        related_name='exclusion_mappings'
    )
    
    # Propagation Status
    notified_at = models.DateTimeField(
        _('notified at'),
        null=True,
        blank=True,
        db_index=True
    )
    acknowledged_at = models.DateTimeField(
        _('acknowledged at'),
        null=True,
        blank=True,
        db_index=True
    )
    propagation_status = models.CharField(
        _('propagation status'),
        max_length=20,
        choices=[
            ('pending', _('Pending')),
            ('notified', _('Notified')),
            ('acknowledged', _('Acknowledged')),
            ('failed', _('Failed')),
            ('timeout', _('Timeout'))
        ],
        default='pending',
        db_index=True
    )
    
    # Retry Logic
    retry_count = models.PositiveSmallIntegerField(
        _('retry count'),
        default=0
    )
    max_retries = models.PositiveSmallIntegerField(
        _('max retries'),
        default=9
    )
    next_retry_at = models.DateTimeField(
        _('next retry at'),
        null=True,
        blank=True
    )
    
    # Webhook Details
    webhook_sent_at = models.DateTimeField(
        _('webhook sent at'),
        null=True,
        blank=True
    )
    webhook_response_code = models.PositiveSmallIntegerField(
        _('webhook response code'),
        null=True,
        blank=True
    )
    webhook_response_body = models.TextField(
        _('webhook response body'),
        blank=True
    )
    
    # Error Handling
    last_error_message = models.TextField(
        _('last error message'),
        blank=True
    )
    error_count = models.PositiveSmallIntegerField(
        _('error count'),
        default=0
    )
    
    # Compliance
    is_compliant = models.BooleanField(
        _('is compliant'),
        default=False,
        db_index=True,
        help_text=_('Whether operator has properly acknowledged and implemented exclusion')
    )
    compliance_checked_at = models.DateTimeField(
        _('compliance checked at'),
        null=True,
        blank=True
    )
    
    class Meta:
        db_table = 'nser_operator_exclusion_mappings'
        verbose_name = _('Operator Exclusion Mapping')
        verbose_name_plural = _('Operator Exclusion Mappings')
        unique_together = [['exclusion', 'operator']]
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['exclusion', 'operator'], name='opr_excl_map_idx'),
            models.Index(fields=['propagation_status', 'notified_at'], name='opr_excl_status_idx'),
            models.Index(fields=['is_compliant'], name='opr_excl_comply_idx'),
        ]
    
    def __str__(self):
        return f"{self.exclusion.exclusion_reference} - {self.operator.name}"
    
    def record_notification(self):
        """Record that notification was sent"""
        self.notified_at = timezone.now()
        self.propagation_status = 'notified'
        self.save()
    
    def record_acknowledgment(self, response_code=200, response_body=''):
        """Record operator acknowledgment"""
        self.acknowledged_at = timezone.now()
        self.propagation_status = 'acknowledged'
        self.webhook_response_code = response_code
        self.webhook_response_body = response_body
        self.is_compliant = True
        self.save()
    
    def record_failure(self, error_message):
        """Record propagation failure"""
        self.error_count += 1
        self.last_error_message = error_message
        self.retry_count += 1
        
        if self.retry_count >= self.max_retries:
            self.propagation_status = 'failed'
        else:
            # Exponential backoff: 1s, 2s, 4s, 8s, ..., 256s
            delay_seconds = min(2 ** self.retry_count, 256)
            self.next_retry_at = timezone.now() + timedelta(seconds=delay_seconds)
        
        self.save()


class ExclusionAuditLog(TimeStampedModel, UUIDModel):
    """
    Immutable audit trail for all exclusion-related actions.
    Critical for compliance and regulatory oversight.
    """
    exclusion = models.ForeignKey(
        'SelfExclusionRecord',
        on_delete=models.PROTECT,
        related_name='audit_logs'
    )
    
    # Action Details
    action = models.CharField(
        _('action'),
        max_length=50,
        db_index=True,
        choices=[
            ('created', _('Created')),
            ('updated', _('Updated')),
            ('activated', _('Activated')),
            ('expired', _('Expired')),
            ('renewed', _('Renewed')),
            ('terminated', _('Terminated Early')),
            ('suspended', _('Suspended')),
            ('revoked', _('Revoked')),
            ('viewed', _('Viewed')),
            ('propagated', _('Propagated to Operators'))
        ]
    )
    description = models.TextField(
        _('description'),
        blank=True
    )
    
    # Actor
    performed_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='exclusion_actions_performed'
    )
    ip_address = models.GenericIPAddressField(
        _('IP address'),
        null=True,
        blank=True
    )
    user_agent = models.TextField(
        _('user agent'),
        blank=True
    )
    
    # Change Tracking
    changes = models.JSONField(
        _('changes'),
        default=dict,
        blank=True,
        help_text=_('Before/after values for updates')
    )
    
    # Metadata
    metadata = models.JSONField(
        _('metadata'),
        default=dict,
        blank=True
    )
    
    class Meta:
        db_table = 'nser_exclusion_audit_logs'
        verbose_name = _('Exclusion Audit Log')
        verbose_name_plural = _('Exclusion Audit Logs')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['exclusion', 'action'], name='excl_audit_action_idx'),
            models.Index(fields=['performed_by', 'created_at'], name='excl_audit_user_idx'),
            models.Index(fields=['created_at'], name='excl_audit_time_idx'),
        ]
    
    def __str__(self):
        return f"{self.action} - {self.exclusion.exclusion_reference}"


class ExclusionExtensionRequest(BaseModel):
    """
    Requests to extend existing exclusions
    """
    exclusion = models.ForeignKey(
        'SelfExclusionRecord',
        on_delete=models.CASCADE,
        related_name='extension_requests'
    )
    
    # Request Details
    requested_new_period = models.CharField(
        _('requested new period'),
        max_length=20,
        choices=ExclusionPeriodChoices.choices
    )
    requested_expiry_date = models.DateTimeField(
        _('requested expiry date')
    )
    reason = models.TextField(
        _('reason for extension'),
        blank=True
    )
    
    # Status
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=[
            ('pending', _('Pending')),
            ('approved', _('Approved')),
            ('rejected', _('Rejected'))
        ],
        default='pending',
        db_index=True
    )
    reviewed_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='extension_reviews'
    )
    reviewed_at = models.DateTimeField(
        _('reviewed at'),
        null=True,
        blank=True
    )
    review_notes = models.TextField(
        _('review notes'),
        blank=True
    )
    
    class Meta:
        db_table = 'nser_exclusion_extension_requests'
        verbose_name = _('Exclusion Extension Request')
        verbose_name_plural = _('Exclusion Extension Requests')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Extension Request - {self.exclusion.exclusion_reference}"


class ExclusionStatistics(TimeStampedModel):
    """
    Aggregated statistics for reporting and analytics (denormalized for performance)
    """
    date = models.DateField(
        _('date'),
        unique=True,
        db_index=True
    )
    
    # Exclusion Counts
    total_exclusions = models.PositiveIntegerField(_('total exclusions'), default=0)
    active_exclusions = models.PositiveIntegerField(_('active exclusions'), default=0)
    new_exclusions_today = models.PositiveIntegerField(_('new exclusions today'), default=0)
    expired_exclusions_today = models.PositiveIntegerField(_('expired today'), default=0)
    
    # By Period
    six_month_exclusions = models.PositiveIntegerField(_('6 month'), default=0)
    one_year_exclusions = models.PositiveIntegerField(_('1 year'), default=0)
    five_year_exclusions = models.PositiveIntegerField(_('5 years'), default=0)
    permanent_exclusions = models.PositiveIntegerField(_('permanent'), default=0)
    
    # By Risk Level
    high_risk_exclusions = models.PositiveIntegerField(_('high risk'), default=0)
    moderate_risk_exclusions = models.PositiveIntegerField(_('moderate risk'), default=0)
    low_risk_exclusions = models.PositiveIntegerField(_('low risk'), default=0)
    
    # Geography
    exclusions_by_county = models.JSONField(_('by county'), default=dict, blank=True)
    
    # Propagation Stats
    avg_propagation_time_seconds = models.FloatField(_('avg propagation time'), default=0.0)
    successful_propagations = models.PositiveIntegerField(_('successful propagations'), default=0)
    failed_propagations = models.PositiveIntegerField(_('failed propagations'), default=0)
    
    class Meta:
        db_table = 'nser_exclusion_statistics'
        verbose_name = _('Exclusion Statistics')
        verbose_name_plural = _('Exclusion Statistics')
        ordering = ['-date']
    
    def __str__(self):
        return f"Statistics for {self.date}"

