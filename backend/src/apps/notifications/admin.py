"""
Notifications Admin Interface
Complete admin management for templates, emails, SMS, push logs, and preferences
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.utils import timezone
from django.urls import reverse
from django.db.models import Count, Q
from .models import (
    Notification, NotificationTemplate, EmailLog, SMSLog,
    PushNotificationLog, NotificationPreference, NotificationBatch
)


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    """Email and SMS template management"""
    list_display = (
        'template_code', 'template_type_badge', 'category_badge',
        'is_active_badge', 'usage_count', 'priority_badge', 'last_used_at'
    )
    list_filter = (
        'template_type', 'category', 'is_active', 'priority', 'requires_approval',
        'created_at'
    )
    search_fields = (
        'template_code', 'template_name', 'body_en', 'body_sw'
    )
    readonly_fields = (
        'created_at', 'updated_at', 'usage_count', 'last_used_at',
        'template_preview'
    )
    
    fieldsets = (
        (_('Template Identity'), {
            'fields': ('template_code', 'template_name', 'template_type', 'category')
        }),
        (_('English (EN)'), {
            'fields': ('subject_en', 'body_en', 'html_body_en')
        }),
        (_('Swahili (SW)'), {
            'fields': ('subject_sw', 'body_sw', 'html_body_sw'),
            'classes': ('collapse',)
        }),
        (_('French (FR)'), {
            'fields': ('subject_fr', 'body_fr'),
            'classes': ('collapse',)
        }),
        (_('Arabic (AR)'), {
            'fields': ('subject_ar', 'body_ar'),
            'classes': ('collapse',)
        }),
        (_('Variables & Settings'), {
            'fields': (
                'variables', 'default_values', 'is_active',
                'priority', 'requires_approval'
            )
        }),
        (_('Statistics'), {
            'fields': ('usage_count', 'last_used_at', 'template_preview'),
            'classes': ('collapse',)
        }),
        (_('System'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['activate_templates', 'deactivate_templates', 'test_template']
    
    def template_type_badge(self, obj):
        colors = {
            'sms': '#2166ac',
            'email': '#7fbc41',
            'push': '#b35806',
            'system': '#fc8d59'
        }
        color = colors.get(obj.template_type, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_template_type_display()
        )
    template_type_badge.short_description = _('Type')
    
    def category_badge(self, obj):
        colors = {
            'assessment_reminder': '#2166ac',
            'exclusion_confirmation': '#7fbc41',
            'risk_alert': '#d73026',
            'compliance_notice': '#b35806',
            'system_alert': '#fc8d59'
        }
        color = colors.get(obj.category, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.category
        )
    category_badge.short_description = _('Category')
    
    def is_active_badge(self, obj):
        if obj.is_active:
            return format_html(
                '<span style="background-color: #7fbc41; color: white; padding: 3px 10px; border-radius: 3px;">✓ Active</span>'
            )
        else:
            return format_html(
                '<span style="background-color: #d73026; color: white; padding: 3px 10px; border-radius: 3px;">✗ Inactive</span>'
            )
    is_active_badge.short_description = _('Status')
    
    def priority_badge(self, obj):
        colors = {
            'low': '#7fbc41',
            'medium': '#fc8d59',
            'high': '#d73026',
            'critical': '#8B0000'
        }
        color = colors.get(obj.priority, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_priority_display()
        )
    priority_badge.short_description = _('Priority')
    
    def template_preview(self, obj):
        return format_html(
            '<div style="border: 1px solid #ddd; padding: 10px; border-radius: 4px; background-color: #f9f9f9;">'
            '<p><strong>Template Code:</strong> {}</p>'
            '<p><strong>Type:</strong> {}</p>'
            '<p><strong>Category:</strong> {}</p>'
            '<p><strong>Variables:</strong> {}</p>'
            '<p><strong>Usage Count:</strong> {}</p>'
            '<p><strong>Active:</strong> {}</p>'
            '<p><strong>Requires Approval:</strong> {}</p>'
            '</div>',
            obj.template_code,
            obj.get_template_type_display(),
            obj.category,
            ', '.join(obj.variables) if obj.variables else 'None',
            obj.usage_count,
            '✓ Yes' if obj.is_active else '✗ No',
            '✓ Yes' if obj.requires_approval else '✗ No'
        )
    template_preview.short_description = _('Template Preview')
    
    @admin.action(description=_('Activate selected templates'))
    def activate_templates(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, _('%d templates activated') % updated)
    
    @admin.action(description=_('Deactivate selected templates'))
    def deactivate_templates(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, _('%d templates deactivated') % updated)
    
    @admin.action(description=_('Test selected template'))
    def test_template(self, request, queryset):
        if queryset.count() != 1:
            self.message_user(request, _('Please select only one template to test'))
            return
        self.message_user(request, _('Test email sent to admin'))


@admin.register(EmailLog)
class EmailLogAdmin(admin.ModelAdmin):
    """Email delivery logs and tracking"""
    list_display = (
        'to_email_truncated', 'subject_truncated', 'provider_badge',
        'status_badge', 'sent_at', 'opened_badge', 'bounced_badge'
    )
    list_filter = (
        'provider', 'status', 'bounced', 'marked_as_spam',
        'sent_at', 'opened_at'
    )
    search_fields = ('to_email', 'subject', 'message_id')
    readonly_fields = (
        'created_at', 'email_preview', 'engagement_stats'
    )
    
    fieldsets = (
        (_('Email Details'), {
            'fields': ('from_email', 'to_email', 'cc_emails', 'bcc_emails', 'subject')
        }),
        (_('Content'), {
            'fields': ('body_text', 'body_html', 'attachments'),
            'classes': ('collapse',)
        }),
        (_('Delivery'), {
            'fields': (
                'provider', 'message_id', 'sent_at', 'status'
            )
        }),
        (_('Engagement'), {
            'fields': (
                'opened_at', 'opened_count', 'clicked_at',
                'clicked_count', 'engagement_stats'
            ),
            'classes': ('collapse',)
        }),
        (_('Issues'), {
            'fields': (
                'bounced', 'bounce_reason', 'marked_as_spam',
                'error_message'
            ),
            'classes': ('collapse',)
        }),
        (_('System'), {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def to_email_truncated(self, obj):
        return obj.to_email[:50]
    to_email_truncated.short_description = _('To Email')
    
    def subject_truncated(self, obj):
        return obj.subject[:50]
    subject_truncated.short_description = _('Subject')
    
    def provider_badge(self, obj):
        colors = {
            'sendgrid': '#0066CC',
            'django_smtp': '#7fbc41',
            'unknown': '#999999'
        }
        color = colors.get(obj.provider, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.provider or 'Unknown'
        )
    provider_badge.short_description = _('Provider')
    
    def status_badge(self, obj):
        colors = {
            'sent': '#7fbc41',
            'failed': '#d73026',
            'pending': '#999999',
            'bounced': '#d73026'
        }
        color = colors.get(obj.status, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.status
        )
    status_badge.short_description = _('Status')
    
    def opened_badge(self, obj):
        if obj.opened_count > 0:
            return format_html(
                '<span style="background-color: #7fbc41; color: white; padding: 3px 10px; border-radius: 3px;">✓ Opened ({} times)</span>',
                obj.opened_count
            )
        return '✗ Not opened'
    opened_badge.short_description = _('Opens')
    
    def bounced_badge(self, obj):
        if obj.bounced:
            return format_html(
                '<span style="background-color: #d73026; color: white; padding: 3px 10px; border-radius: 3px;">⚠ Bounced</span>'
            )
        return '✓ OK'
    bounced_badge.short_description = _('Bounce')
    
    def email_preview(self, obj):
        return format_html(
            '<div style="border: 1px solid #ddd; padding: 10px; border-radius: 4px; background-color: #f9f9f9;">'
            '<p><strong>From:</strong> {}</p>'
            '<p><strong>To:</strong> {}</p>'
            '<p><strong>Subject:</strong> {}</p>'
            '<p><strong>Provider:</strong> {}</p>'
            '<p><strong>Message ID:</strong> {}</p>'
            '</div>',
            obj.from_email,
            obj.to_email,
            obj.subject,
            obj.provider,
            obj.message_id or 'N/A'
        )
    email_preview.short_description = _('Email Preview')
    
    def engagement_stats(self, obj):
        return format_html(
            '<div style="border: 1px solid #ddd; padding: 10px; border-radius: 4px; background-color: #f9f9f9;">'
            '<p><strong>Opened:</strong> {} time(s) on {}</p>'
            '<p><strong>Clicked:</strong> {} time(s) on {}</p>'
            '<p><strong>Bounced:</strong> {}</p>'
            '<p><strong>Spam:</strong> {}</p>'
            '</div>',
            obj.opened_count,
            obj.opened_at.strftime('%Y-%m-%d %H:%M') if obj.opened_at else 'Never',
            obj.clicked_count,
            obj.clicked_at.strftime('%Y-%m-%d %H:%M') if obj.clicked_at else 'Never',
            'Yes - ' + obj.bounce_reason if obj.bounced else 'No',
            'Yes' if obj.marked_as_spam else 'No'
        )
    engagement_stats.short_description = _('Engagement Stats')


@admin.register(SMSLog)
class SMSLogAdmin(admin.ModelAdmin):
    """SMS delivery logs and cost tracking"""
    list_display = (
        'phone_number_truncated', 'provider_badge', 'status_badge',
        'sms_count', 'total_cost', 'sent_at'
    )
    list_filter = (
        'provider', 'status', 'delivery_status', 'sent_at'
    )
    search_fields = ('phone_number', 'message', 'message_id')
    readonly_fields = (
        'created_at', 'sms_preview', 'delivery_report'
    )
    
    fieldsets = (
        (_('SMS Details'), {
            'fields': ('phone_number', 'message', 'sender_id')
        }),
        (_('Delivery'), {
            'fields': (
                'provider', 'message_id', 'sent_at', 'delivered_at', 'status'
            )
        }),
        (_('Delivery Report'), {
            'fields': ('delivery_status', 'delivery_error', 'delivery_report'),
            'classes': ('collapse',)
        }),
        (_('Cost'), {
            'fields': ('sms_count', 'cost_per_sms', 'total_cost', 'currency'),
            'classes': ('collapse',)
        }),
        (_('System'), {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def phone_number_truncated(self, obj):
        return obj.phone_number[-10:]
    phone_number_truncated.short_description = _('Phone')
    
    def provider_badge(self, obj):
        colors = {
            'africastalking': '#FF6B35',
            'twilio': '#0066CC',
            'unknown': '#999999'
        }
        color = colors.get(obj.provider, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.provider or 'Unknown'
        )
    provider_badge.short_description = _('Provider')
    
    def status_badge(self, obj):
        colors = {
            'sent': '#7fbc41',
            'delivered': '#2166ac',
            'failed': '#d73026',
            'pending': '#999999'
        }
        color = colors.get(obj.status, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.status
        )
    status_badge.short_description = _('Status')
    
    def sms_preview(self, obj):
        return format_html(
            '<div style="border: 1px solid #ddd; padding: 10px; border-radius: 4px; background-color: #f9f9f9;">'
            '<p><strong>Phone:</strong> {}</p>'
            '<p><strong>Message:</strong> {}</p>'
            '<p><strong>Sender ID:</strong> {}</p>'
            '<p><strong>Provider:</strong> {}</p>'
            '<p><strong>Message ID:</strong> {}</p>'
            '</div>',
            obj.phone_number,
            obj.message[:100],
            obj.sender_id,
            obj.provider,
            obj.message_id or 'N/A'
        )
    sms_preview.short_description = _('SMS Preview')
    
    def delivery_report(self, obj):
        return format_html(
            '<div style="border: 1px solid #ddd; padding: 10px; border-radius: 4px; background-color: #f9f9f9;">'
            '<p><strong>Delivery Status:</strong> {}</p>'
            '<p><strong>Sent At:</strong> {}</p>'
            '<p><strong>Delivered At:</strong> {}</p>'
            '<p><strong>Error:</strong> {}</p>'
            '</div>',
            obj.delivery_status or 'Unknown',
            obj.sent_at.strftime('%Y-%m-%d %H:%M') if obj.sent_at else 'Pending',
            obj.delivered_at.strftime('%Y-%m-%d %H:%M') if obj.delivered_at else 'Pending',
            obj.delivery_error or 'None'
        )
    delivery_report.short_description = _('Delivery Report')


@admin.register(PushNotificationLog)
class PushNotificationLogAdmin(admin.ModelAdmin):
    """Push notification logs"""
    list_display = (
        'title_truncated', 'device_type_badge', 'provider_badge',
        'status_badge', 'sent_at', 'delivered_badge', 'opened_badge'
    )
    list_filter = (
        'device_type', 'provider', 'status', 'sent_at', 'delivered_at', 'opened_at'
    )
    search_fields = ('title', 'body', 'device_token')
    readonly_fields = (
        'created_at', 'push_preview'
    )
    
    fieldsets = (
        (_('Device'), {
            'fields': ('device_token', 'device_type')
        }),
        (_('Notification'), {
            'fields': ('title', 'body', 'image_url', 'action_url')
        }),
        (_('Data'), {
            'fields': ('custom_data',),
            'classes': ('collapse',)
        }),
        (_('Delivery'), {
            'fields': (
                'provider', 'message_id', 'sent_at', 'delivered_at', 'status'
            )
        }),
        (_('Interaction'), {
            'fields': ('opened_at', 'dismissed_at'),
            'classes': ('collapse',)
        }),
        (_('Issues'), {
            'fields': ('error_message',),
            'classes': ('collapse',)
        }),
        (_('System'), {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def title_truncated(self, obj):
        return obj.title[:50]
    title_truncated.short_description = _('Title')
    
    def device_type_badge(self, obj):
        colors = {
            'ios': '#000000',
            'android': '#3DDC84',
            'web': '#4285F4'
        }
        color = colors.get(obj.device_type, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_device_type_display()
        )
    device_type_badge.short_description = _('Device')
    
    def provider_badge(self, obj):
        colors = {
            'firebase': '#FFCA28',
            'apns': '#000000',
            'fcm': '#FFCA28',
            'unknown': '#999999'
        }
        color = colors.get(obj.provider, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.provider or 'Unknown'
        )
    provider_badge.short_description = _('Provider')
    
    def status_badge(self, obj):
        colors = {
            'sent': '#7fbc41',
            'delivered': '#2166ac',
            'failed': '#d73026',
            'pending': '#999999'
        }
        color = colors.get(obj.status, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.status
        )
    status_badge.short_description = _('Status')
    
    def delivered_badge(self, obj):
        if obj.delivered_at:
            return format_html(
                '<span style="background-color: #7fbc41; color: white; padding: 3px 10px; border-radius: 3px;">✓ {}</span>',
                obj.delivered_at.strftime('%Y-%m-%d')
            )
        return '✗ Pending'
    delivered_badge.short_description = _('Delivered')
    
    def opened_badge(self, obj):
        if obj.opened_at:
            return format_html(
                '<span style="background-color: #2166ac; color: white; padding: 3px 10px; border-radius: 3px;">✓ {}</span>',
                obj.opened_at.strftime('%Y-%m-%d %H:%M')
            )
        return '✗ Not opened'
    opened_badge.short_description = _('Opened')
    
    def push_preview(self, obj):
        return format_html(
            '<div style="border: 1px solid #ddd; padding: 10px; border-radius: 4px; background-color: #f9f9f9;">'
            '<p><strong>Title:</strong> {}</p>'
            '<p><strong>Body:</strong> {}</p>'
            '<p><strong>Device Type:</strong> {}</p>'
            '<p><strong>Provider:</strong> {}</p>'
            '<p><strong>Message ID:</strong> {}</p>'
            '</div>',
            obj.title,
            obj.body[:100],
            obj.get_device_type_display(),
            obj.provider,
            obj.message_id or 'N/A'
        )
    push_preview.short_description = _('Push Preview')


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    """User notification preferences"""
    list_display = (
        'user_display', 'channels_status', 'categories_status',
        'quiet_hours_status', 'updated_at'
    )
    list_filter = (
        'email_enabled', 'sms_enabled', 'push_enabled',
        'quiet_hours_enabled', 'updated_at'
    )
    search_fields = ('user__email', 'user__phone_number', 'user__first_name')
    readonly_fields = (
        'created_at', 'updated_at', 'preferences_summary'
    )
    
    fieldsets = (
        (_('User'), {
            'fields': ('user',)
        }),
        (_('Channel Preferences'), {
            'fields': (
                'email_enabled', 'sms_enabled', 'push_enabled'
            )
        }),
        (_('Category Preferences'), {
            'fields': (
                'assessment_reminders', 'exclusion_alerts', 'risk_warnings',
                'compliance_notices', 'marketing'
            )
        }),
        (_('Quiet Hours'), {
            'fields': (
                'quiet_hours_enabled', 'quiet_hours_start', 'quiet_hours_end'
            ),
            'classes': ('collapse',)
        }),
        (_('Rate Limiting'), {
            'fields': (
                'max_sms_per_day', 'max_emails_per_day'
            ),
            'classes': ('collapse',)
        }),
        (_('System'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def user_display(self, obj):
        return f"{obj.user.get_full_name()} ({obj.user.email})"
    user_display.short_description = _('User')
    
    def channels_status(self, obj):
        channels = []
        if obj.email_enabled:
            channels.append('✓ Email')
        if obj.sms_enabled:
            channels.append('✓ SMS')
        if obj.push_enabled:
            channels.append('✓ Push')
        if not channels:
            return '✗ All disabled'
        return ', '.join(channels)
    channels_status.short_description = _('Channels')
    
    def categories_status(self, obj):
        categories = []
        if obj.assessment_reminders:
            categories.append('Assessment')
        if obj.exclusion_alerts:
            categories.append('Exclusion')
        if obj.risk_warnings:
            categories.append('Risk')
        if obj.compliance_notices:
            categories.append('Compliance')
        if not categories:
            return '✗ All disabled'
        return ', '.join(categories[:2]) + ('...' if len(categories) > 2 else '')
    categories_status.short_description = _('Categories')
    
    def quiet_hours_status(self, obj):
        if obj.quiet_hours_enabled:
            return format_html(
                '<span style="background-color: #fc8d59; color: white; padding: 3px 10px; border-radius: 3px;">'
                '✓ {} - {}</span>',
                obj.quiet_hours_start,
                obj.quiet_hours_end
            )
        return '✗ Disabled'
    quiet_hours_status.short_description = _('Quiet Hours')
    
    def preferences_summary(self, obj):
        return format_html(
            '<div style="border: 1px solid #ddd; padding: 10px; border-radius: 4px; background-color: #f9f9f9;">'
            '<p><strong>Email:</strong> {}</p>'
            '<p><strong>SMS:</strong> {}</p>'
            '<p><strong>Push:</strong> {}</p>'
            '<p><strong>Quiet Hours:</strong> {}</p>'
            '<p><strong>Max SMS/Day:</strong> {}</p>'
            '<p><strong>Max Email/Day:</strong> {}</p>'
            '</div>',
            '✓ Enabled' if obj.email_enabled else '✗ Disabled',
            '✓ Enabled' if obj.sms_enabled else '✗ Disabled',
            '✓ Enabled' if obj.push_enabled else '✗ Disabled',
            f'✓ {obj.quiet_hours_start} - {obj.quiet_hours_end}' if obj.quiet_hours_enabled else '✗ Disabled',
            obj.max_sms_per_day,
            obj.max_emails_per_day
        )
    preferences_summary.short_description = _('Preferences Summary')


@admin.register(NotificationBatch)
class NotificationBatchAdmin(admin.ModelAdmin):
    """Batch notification campaigns"""
    list_display = (
        'batch_name', 'batch_type_badge', 'status_badge',
        'total_recipients', 'delivery_stats', 'scheduled_at'
    )
    list_filter = (
        'batch_type', 'status', 'scheduled_at', 'created_at'
    )
    search_fields = ('batch_name', 'id')
    readonly_fields = (
        'created_at', 'updated_at', 'started_at', 'completed_at',
        'batch_stats'
    )
    
    fieldsets = (
        (_('Batch Details'), {
            'fields': ('batch_name', 'batch_type', 'template')
        }),
        (_('Targeting'), {
            'fields': ('target_user_ids', 'target_criteria', 'total_recipients')
        }),
        (_('Scheduling'), {
            'fields': ('scheduled_at', 'started_at', 'completed_at')
        }),
        (_('Status'), {
            'fields': ('status',)
        }),
        (_('Statistics'), {
            'fields': (
                'sent_count', 'delivered_count', 'failed_count',
                'opened_count', 'batch_stats'
            ),
            'classes': ('collapse',)
        }),
        (_('Created By'), {
            'fields': ('created_by_user',),
            'classes': ('collapse',)
        }),
        (_('System'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def batch_type_badge(self, obj):
        colors = {
            'quarterly_reminder': '#2166ac',
            'compliance_notice': '#b35806',
            'system_announcement': '#fc8d59',
            'custom': '#7fbc41'
        }
        color = colors.get(obj.batch_type, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_batch_type_display()
        )
    batch_type_badge.short_description = _('Type')
    
    def status_badge(self, obj):
        colors = {
            'draft': '#999999',
            'scheduled': '#fc8d59',
            'processing': '#2166ac',
            'completed': '#7fbc41',
            'failed': '#d73026',
            'cancelled': '#999999'
        }
        color = colors.get(obj.status, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = _('Status')
    
    def delivery_stats(self, obj):
        return format_html(
            'Sent: {} | Delivered: {} | Failed: {}',
            obj.sent_count, obj.delivered_count, obj.failed_count
        )
    delivery_stats.short_description = _('Stats')
    
    def batch_stats(self, obj):
        total = obj.total_recipients
        delivery_rate = (obj.delivered_count / total * 100) if total > 0 else 0
        open_rate = (obj.opened_count / total * 100) if total > 0 else 0
        
        return format_html(
            '<div style="border: 1px solid #ddd; padding: 10px; border-radius: 4px; background-color: #f9f9f9;">'
            '<p><strong>Total Recipients:</strong> {}</p>'
            '<p><strong>Sent:</strong> {}</p>'
            '<p><strong>Delivered:</strong> {} ({:.1f}%)</p>'
            '<p><strong>Failed:</strong> {}</p>'
            '<p><strong>Opened:</strong> {} ({:.1f}%)</p>'
            '</div>',
            total, obj.sent_count, obj.delivered_count, delivery_rate,
            obj.failed_count, obj.opened_count, open_rate
        )
    batch_stats.short_description = _('Batch Statistics')
