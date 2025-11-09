"""
Notifications Models  
Comprehensive multi-channel notification system (SMS, Email, Push, Webhooks)
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone

from apps.core.models import (
    BaseModel, TimeStampedModel, UUIDModel,
    StatusChoices, LanguageChoices, PriorityChoices, BaseModelManager
)


class Notification(BaseModel):
    """
    Core notification model supporting multi-channel delivery.
    Handles SMS, Email, Push notifications with retry logic and tracking.
    """
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='notifications',
        db_index=True
    )
    
    # Notification Details
    notification_type = models.CharField(
        _('notification type'),
        max_length=50,
        choices=[
            ('sms', _('SMS')),
            ('email', _('Email')),
            ('push', _('Push Notification')),
            ('system', _('System Notification')),
            ('webhook', _('Webhook'))
        ],
        db_index=True
    )
    category = models.CharField(
        _('category'),
        max_length=50,
        choices=[
            ('assessment_reminder', _('Assessment Reminder')),
            ('exclusion_confirmation', _('Exclusion Confirmation')),
            ('risk_alert', _('Risk Alert')),
            ('compliance_notice', _('Compliance Notice')),
            ('system_alert', _('System Alert'))
        ],
        db_index=True
    )
    
    # Priority
    priority = models.CharField(
        _('priority'),
        max_length=20,
        choices=PriorityChoices.choices,
        default=PriorityChoices.MEDIUM,
        db_index=True
    )
    
    # Content
    title = models.CharField(_('title'), max_length=255, blank=True)
    message = models.TextField(_('message'))
    language = models.CharField(
        _('language'),
        max_length=10,
        choices=LanguageChoices.choices,
        default=LanguageChoices.ENGLISH
    )
    
    # Rich Content
    html_content = models.TextField(_('HTML content'), blank=True)
    attachments = ArrayField(
        models.CharField(max_length=500),
        default=list,
        blank=True,
        help_text=_('File URLs for attachments')
    )
    action_url = models.URLField(_('action URL'), blank=True)
    action_label = models.CharField(_('action label'), max_length=100, blank=True)
    
    # Recipient Info
    recipient_phone = models.CharField(_('recipient phone'), max_length=20, blank=True)
    recipient_email = models.EmailField(_('recipient email'), blank=True)
    device_token = models.CharField(_('device token'), max_length=500, blank=True)
    
    # Status & Delivery
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=[
            ('pending', _('Pending')),
            ('queued', _('Queued')),
            ('sending', _('Sending')),
            ('sent', _('Sent')),
            ('delivered', _('Delivered')),
            ('failed', _('Failed')),
            ('read', _('Read')),
            ('cancelled', _('Cancelled'))
        ],
        default='pending',
        db_index=True
    )
    
    # Timestamps
    scheduled_at = models.DateTimeField(
        _('scheduled at'),
        null=True,
        blank=True,
        db_index=True,
        help_text=_('When to send notification')
    )
    sent_at = models.DateTimeField(_('sent at'), null=True, blank=True)
    delivered_at = models.DateTimeField(_('delivered at'), null=True, blank=True)
    read_at = models.DateTimeField(_('read at'), null=True, blank=True)
    expired_at = models.DateTimeField(_('expired at'), null=True, blank=True)
    
    # Retry Logic
    retry_count = models.PositiveSmallIntegerField(_('retry count'), default=0)
    max_retries = models.PositiveSmallIntegerField(_('max retries'), default=3)
    next_retry_at = models.DateTimeField(_('next retry at'), null=True, blank=True)
    
    # External Provider
    provider = models.CharField(
        _('provider'),
        max_length=50,
        blank=True,
        help_text=_('SMS/Email provider used')
    )
    external_id = models.CharField(
        _('external ID'),
        max_length=255,
        blank=True,
        db_index=True,
        help_text=_('Provider reference ID')
    )
    provider_response = models.JSONField(
        _('provider response'),
        default=dict,
        blank=True
    )
    
    # Error Handling
    error_message = models.TextField(_('error message'), blank=True)
    error_code = models.CharField(_('error code'), max_length=50, blank=True)
    
    # User Interaction
    is_read = models.BooleanField(_('is read'), default=False, db_index=True)
    is_archived = models.BooleanField(_('is archived'), default=False)
    dismissed_at = models.DateTimeField(_('dismissed at'), null=True, blank=True)
    
    # Metadata
    metadata = models.JSONField(_('metadata'), default=dict, blank=True)
    
    objects = BaseModelManager()
    
    class Meta:
        db_table = 'notifications'
        verbose_name = _('Notification')
        verbose_name_plural = _('Notifications')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status'], name='notif_user_status_idx'),
            models.Index(fields=['status', 'scheduled_at'], name='notif_status_sched_idx'),
            models.Index(fields=['notification_type', 'priority'], name='notif_type_priority_idx'),
            models.Index(fields=['is_read', 'created_at'], name='notif_read_time_idx'),
        ]
    
    def __str__(self):
        return f"{self.notification_type} - {self.user} - {self.title}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        self.is_read = True
        self.read_at = timezone.now()
        self.status = 'read'
        self.save(update_fields=['is_read', 'read_at', 'status'])
    
    def mark_as_sent(self, external_id='', provider=''):
        """Mark as sent"""
        self.status = 'sent'
        self.sent_at = timezone.now()
        self.external_id = external_id
        self.provider = provider
        self.save(update_fields=['status', 'sent_at', 'external_id', 'provider'])
    
    def record_failure(self, error_msg='', error_code=''):
        """Record send failure and schedule retry"""
        self.retry_count += 1
        self.error_message = error_msg
        self.error_code = error_code
        
        if self.retry_count >= self.max_retries:
            self.status = 'failed'
        else:
            # Exponential backoff
            delay_minutes = 2 ** self.retry_count
            self.next_retry_at = timezone.now() + timezone.timedelta(minutes=delay_minutes)
            self.status = 'pending'
        
        self.save()


class NotificationTemplate(TimeStampedModel, UUIDModel):
    """
    Multi-language notification templates with variable substitution.
    Supports SMS, Email, and Push notification formatting.
    """
    template_code = models.CharField(
        _('template code'),
        max_length=100,
        unique=True,
        db_index=True,
        help_text=_('Unique template identifier (e.g., EXCLUSION_CONFIRM)')
    )
    template_name = models.CharField(_('template name'), max_length=255)
    template_type = models.CharField(
        _('template type'),
        max_length=50,
        choices=[
            ('sms', _('SMS')),
            ('email', _('Email')),
            ('push', _('Push Notification')),
            ('system', _('System Notification'))
        ]
    )
    category = models.CharField(_('category'), max_length=50, db_index=True)
    
    # Multi-language Subject
    subject_en = models.CharField(_('subject (English)'), max_length=255, blank=True)
    subject_sw = models.CharField(_('subject (Swahili)'), max_length=255, blank=True)
    subject_fr = models.CharField(_('subject (French)'), max_length=255, blank=True)
    subject_ar = models.CharField(_('subject (Arabic)'), max_length=255, blank=True)
    
    # Multi-language Body
    body_en = models.TextField(_('body (English)'))
    body_sw = models.TextField(_('body (Swahili)'), blank=True)
    body_fr = models.TextField(_('body (French)'), blank=True)
    body_ar = models.TextField(_('body (Arabic)'), blank=True)
    
    # HTML Email Version
    html_body_en = models.TextField(_('HTML body (English)'), blank=True)
    html_body_sw = models.TextField(_('HTML body (Swahili)'), blank=True)
    
    # Template Variables
    variables = models.JSONField(
        _('variables'),
        default=list,
        help_text=_('Available variables: ["user_name", "exclusion_period", etc.]')
    )
    default_values = models.JSONField(
        _('default values'),
        default=dict,
        blank=True
    )
    
    # Settings
    is_active = models.BooleanField(_('is active'), default=True, db_index=True)
    priority = models.CharField(
        _('default priority'),
        max_length=20,
        choices=PriorityChoices.choices,
        default=PriorityChoices.MEDIUM
    )
    requires_approval = models.BooleanField(_('requires approval'), default=False)
    
    # Statistics
    usage_count = models.PositiveIntegerField(_('usage count'), default=0)
    last_used_at = models.DateTimeField(_('last used at'), null=True, blank=True)
    
    class Meta:
        db_table = 'notification_templates'
        verbose_name = _('Notification Template')
        verbose_name_plural = _('Notification Templates')
        ordering = ['template_name']
    
    def __str__(self):
        return f"{self.template_code} - {self.template_name}"
    
    def render(self, language='en', **variables):
        """Render template with variables"""
        subject_attr = f'subject_{language}'
        body_attr = f'body_{language}'
        
        subject = getattr(self, subject_attr, self.subject_en)
        body = getattr(self, body_attr, self.body_en)
        
        # Replace variables
        for key, value in variables.items():
            placeholder = f"{{{{{key}}}}}"
            subject = subject.replace(placeholder, str(value))
            body = body.replace(placeholder, str(value))
        
        return subject, body


class EmailLog(TimeStampedModel, UUIDModel):
    """
    Detailed email sending logs for compliance and debugging.
    """
    notification = models.OneToOneField(
        'Notification',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='email_log'
    )
    
    # Email Details
    from_email = models.EmailField(_('from email'))
    to_email = models.EmailField(_('to email'), db_index=True)
    cc_emails = ArrayField(
        models.EmailField(),
        default=list,
        blank=True
    )
    bcc_emails = ArrayField(
        models.EmailField(),
        default=list,
        blank=True
    )
    
    # Content
    subject = models.CharField(_('subject'), max_length=255)
    body_text = models.TextField(_('text body'))
    body_html = models.TextField(_('HTML body'), blank=True)
    
    # Attachments
    attachments = models.JSONField(
        _('attachments'),
        default=list,
        blank=True,
        help_text=_('List of attachment metadata')
    )
    
    # Sending
    provider = models.CharField(_('email provider'), max_length=50)
    message_id = models.CharField(_('message ID'), max_length=255, blank=True, db_index=True)
    sent_at = models.DateTimeField(_('sent at'), null=True, blank=True)
    
    # Tracking
    opened_at = models.DateTimeField(_('opened at'), null=True, blank=True)
    opened_count = models.PositiveIntegerField(_('opened count'), default=0)
    clicked_at = models.DateTimeField(_('clicked at'), null=True, blank=True)
    clicked_count = models.PositiveIntegerField(_('clicked count'), default=0)
    
    # Bounce/Spam
    bounced = models.BooleanField(_('bounced'), default=False)
    bounce_reason = models.TextField(_('bounce reason'), blank=True)
    marked_as_spam = models.BooleanField(_('marked as spam'), default=False)
    
    # Status
    status = models.CharField(_('status'), max_length=20, default='pending')
    error_message = models.TextField(_('error message'), blank=True)
    
    class Meta:
        db_table = 'notification_email_logs'
        verbose_name = _('Email Log')
        verbose_name_plural = _('Email Logs')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['to_email', 'sent_at'], name='email_to_sent_idx'),
            models.Index(fields=['message_id'], name='email_msg_id_idx'),
        ]


class SMSLog(TimeStampedModel, UUIDModel):
    """
    SMS sending logs for compliance and cost tracking.
    """
    notification = models.OneToOneField(
        'Notification',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='sms_log'
    )
    
    # SMS Details
    phone_number = models.CharField(_('phone number'), max_length=20, db_index=True)
    message = models.TextField(_('message'))
    sender_id = models.CharField(_('sender ID'), max_length=20)
    
    # Provider
    provider = models.CharField(_('SMS provider'), max_length=50)
    message_id = models.CharField(_('message ID'), max_length=255, blank=True, db_index=True)
    
    # Cost
    sms_count = models.PositiveSmallIntegerField(_('SMS count'), default=1)
    cost_per_sms = models.DecimalField(_('cost per SMS'), max_digits=10, decimal_places=4, null=True, blank=True)
    total_cost = models.DecimalField(_('total cost'), max_digits=10, decimal_places=2, null=True, blank=True)
    currency = models.CharField(_('currency'), max_length=3, default='KES')
    
    # Status & Delivery
    status = models.CharField(_('status'), max_length=20, default='pending')
    sent_at = models.DateTimeField(_('sent at'), null=True, blank=True)
    delivered_at = models.DateTimeField(_('delivered at'), null=True, blank=True)
    
    # Delivery Report
    delivery_status = models.CharField(_('delivery status'), max_length=50, blank=True)
    delivery_error = models.TextField(_('delivery error'), blank=True)
    
    class Meta:
        db_table = 'notification_sms_logs'
        verbose_name = _('SMS Log')
        verbose_name_plural = _('SMS Logs')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['phone_number', 'sent_at'], name='sms_phone_sent_idx'),
        ]


class PushNotificationLog(TimeStampedModel, UUIDModel):
    """
    Push notification logs for mobile apps.
    """
    notification = models.OneToOneField(
        'Notification',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='push_log'
    )
    
    # Device Details
    device_token = models.CharField(_('device token'), max_length=500, db_index=True)
    device_type = models.CharField(
        _('device type'),
        max_length=20,
        choices=[('ios', 'iOS'), ('android', 'Android'), ('web', 'Web')]
    )
    
    # Notification Content
    title = models.CharField(_('title'), max_length=255)
    body = models.TextField(_('body'))
    image_url = models.URLField(_('image URL'), blank=True)
    action_url = models.URLField(_('action URL'), blank=True)
    
    # Custom Data
    custom_data = models.JSONField(_('custom data'), default=dict, blank=True)
    
    # Sending
    provider = models.CharField(_('push provider'), max_length=50)
    message_id = models.CharField(_('message ID'), max_length=255, blank=True)
    sent_at = models.DateTimeField(_('sent at'), null=True, blank=True)
    
    # Interaction
    delivered_at = models.DateTimeField(_('delivered at'), null=True, blank=True)
    opened_at = models.DateTimeField(_('opened at'), null=True, blank=True)
    dismissed_at = models.DateTimeField(_('dismissed at'), null=True, blank=True)
    
    # Status
    status = models.CharField(_('status'), max_length=20, default='pending')
    error_message = models.TextField(_('error message'), blank=True)
    
    class Meta:
        db_table = 'notification_push_logs'
        verbose_name = _('Push Notification Log')
        verbose_name_plural = _('Push Notification Logs')
        ordering = ['-created_at']


class NotificationPreference(BaseModel):
    """
    User notification preferences and opt-in/opt-out settings.
    """
    user = models.OneToOneField(
        'users.User',
        on_delete=models.CASCADE,
        related_name='notification_preference'
    )
    
    # Channel Preferences
    email_enabled = models.BooleanField(_('email enabled'), default=True)
    sms_enabled = models.BooleanField(_('SMS enabled'), default=True)
    push_enabled = models.BooleanField(_('push enabled'), default=True)
    
    # Category Preferences
    assessment_reminders = models.BooleanField(_('assessment reminders'), default=True)
    exclusion_alerts = models.BooleanField(_('exclusion alerts'), default=True)
    risk_warnings = models.BooleanField(_('risk warnings'), default=True)
    compliance_notices = models.BooleanField(_('compliance notices'), default=True)
    marketing = models.BooleanField(_('marketing'), default=False)
    
    # Quiet Hours
    quiet_hours_enabled = models.BooleanField(_('quiet hours enabled'), default=False)
    quiet_hours_start = models.TimeField(_('quiet hours start'), null=True, blank=True)
    quiet_hours_end = models.TimeField(_('quiet hours end'), null=True, blank=True)
    
    # Frequency Limits
    max_sms_per_day = models.PositiveSmallIntegerField(_('max SMS per day'), default=5)
    max_emails_per_day = models.PositiveSmallIntegerField(_('max emails per day'), default=10)
    
    class Meta:
        db_table = 'notification_preferences'
        verbose_name = _('Notification Preference')
        verbose_name_plural = _('Notification Preferences')


class NotificationBatch(BaseModel):
    """
    Batch notification campaigns for bulk sending.
    """
    batch_name = models.CharField(_('batch name'), max_length=255)
    batch_type = models.CharField(
        _('batch type'),
        max_length=50,
        choices=[
            ('quarterly_reminder', _('Quarterly Reminder')),
            ('compliance_notice', _('Compliance Notice')),
            ('system_announcement', _('System Announcement')),
            ('custom', _('Custom Campaign'))
        ]
    )
    
    # Target Audience
    target_user_ids = ArrayField(
        models.UUIDField(),
        default=list,
        blank=True
    )
    target_criteria = models.JSONField(
        _('target criteria'),
        default=dict,
        blank=True,
        help_text=_('Filter criteria for recipients')
    )
    total_recipients = models.PositiveIntegerField(_('total recipients'), default=0)
    
    # Template
    template = models.ForeignKey(
        'NotificationTemplate',
        on_delete=models.PROTECT,
        null=True,
        blank=True
    )
    
    # Scheduling
    scheduled_at = models.DateTimeField(_('scheduled at'), db_index=True)
    started_at = models.DateTimeField(_('started at'), null=True, blank=True)
    completed_at = models.DateTimeField(_('completed at'), null=True, blank=True)
    
    # Status
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=[
            ('draft', _('Draft')),
            ('scheduled', _('Scheduled')),
            ('processing', _('Processing')),
            ('completed', _('Completed')),
            ('failed', _('Failed')),
            ('cancelled', _('Cancelled'))
        ],
        default='draft',
        db_index=True
    )
    
    # Statistics
    sent_count = models.PositiveIntegerField(_('sent count'), default=0)
    delivered_count = models.PositiveIntegerField(_('delivered count'), default=0)
    failed_count = models.PositiveIntegerField(_('failed count'), default=0)
    opened_count = models.PositiveIntegerField(_('opened count'), default=0)
    
    # Created By
    created_by_user = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notification_batches_created'
    )
    
    class Meta:
        db_table = 'notification_batches'
        verbose_name = _('Notification Batch')
        verbose_name_plural = _('Notification Batches')
        ordering = ['-created_at']

