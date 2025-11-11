"""
Notifications Admin Interface
Super Admin features for notification management, delivery tracking, and templates
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.utils import timezone
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Notification management and delivery tracking"""
    list_display = (
        'notification_type_badge', 'user_phone', 'category_badge',
        'priority_badge', 'delivery_status_badge', 'created_at'
    )
    list_filter = (
        'notification_type', 'category', 'priority',
        'created_at'
    )
    search_fields = (
        'user__phone_number', 'user__email', 'title', 'message'
    )
    readonly_fields = (
        'created_at', 'updated_at', 'sent_at', 'read_at',
        'notification_summary', 'delivery_tracking'
    )
    
    fieldsets = (
        (_('Recipient'), {
            'fields': ('user',)
        }),
        (_('Notification Details'), {
            'fields': (
                'notification_type', 'category', 'priority', 'language'
            )
        }),
        (_('Content'), {
            'fields': ('title', 'message', 'html_content', 'attachments'),
            'classes': ('collapse',)
        }),
        (_('Scheduling'), {
            'fields': ('scheduled_for', 'expires_at')
        }),
        (_('Delivery'), {
            'fields': (
                'delivery_status', 'delivery_channel', 'sent_at',
                'delivery_attempts', 'last_error'
            ),
            'classes': ('collapse',)
        }),
        (_('Engagement'), {
            'fields': (
                'is_read', 'read_at', 'is_archived', 'click_count'
            ),
            'classes': ('collapse',)
        }),
        (_('Tracking'), {
            'fields': (
                'delivery_tracking',
            ),
            'classes': ('collapse',)
        }),
        (_('System'), {
            'fields': ('created_at', 'updated_at', 'metadata'),
            'classes': ('collapse',)
        }),
    )
    
    actions = [
        'resend_notifications', 'mark_read', 'mark_unread',
        'archive_notifications', 'cancel_scheduled'
    ]
    
    def notification_type_badge(self, obj):
        colors = {
            'sms': '#2166ac',
            'email': '#7fbc41',
            'push': '#b35806',
            'system': '#fc8d59',
            'webhook': '#d73026'
        }
        color = colors.get(obj.notification_type, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_notification_type_display()
        )
    notification_type_badge.short_description = _('Type')
    
    def user_phone(self, obj):
        return obj.user.phone_number if obj.user else 'N/A'
    user_phone.short_description = _('User')
    
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
            color, obj.get_category_display()
        )
    category_badge.short_description = _('Category')
    
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
    
    def delivery_status_badge(self, obj):
        colors = {
            'pending': '#999999',
            'scheduled': '#fc8d59',
            'sent': '#7fbc41',
            'delivered': '#2166ac',
            'failed': '#d73026'
        }
        color = colors.get(obj.delivery_status, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_delivery_status_display()
        )
    delivery_status_badge.short_description = _('Delivery')
    
    def notification_summary(self, obj):
        is_read_status = '✓ Read' if obj.is_read else '✗ Unread'
        
        return format_html(
            '<div style="border: 1px solid #ddd; padding: 10px; border-radius: 4px;">'
            '<p><strong>Type:</strong> {}</p>'
            '<p><strong>Category:</strong> {}</p>'
            '<p><strong>Priority:</strong> {}</p>'
            '<p><strong>Status:</strong> {}</p>'
            '<p><strong>Title:</strong> {}</p>'
            '<p><strong>Read:</strong> {}</p>'
            '</div>',
            obj.get_notification_type_display(),
            obj.get_category_display(),
            obj.get_priority_display(),
            obj.get_delivery_status_display(),
            obj.title,
            is_read_status
        )
    notification_summary.short_description = _('Summary')
    
    def delivery_tracking(self, obj):
        return format_html(
            '<div style="border: 1px solid #ddd; padding: 10px; border-radius: 4px;">'
            '<p><strong>Delivery Channel:</strong> {}</p>'
            '<p><strong>Attempts:</strong> {}</p>'
            '<p><strong>Sent At:</strong> {}</p>'
            '<p><strong>Last Error:</strong> {}</p>'
            '<p><strong>Clicks:</strong> {}</p>'
            '</div>',
            obj.delivery_channel or 'N/A',
            obj.delivery_attempts,
            obj.sent_at.strftime('%Y-%m-%d %H:%M') if obj.sent_at else 'Pending',
            obj.last_error or 'None',
            obj.click_count
        )
    delivery_tracking.short_description = _('Delivery Tracking')
    
    @admin.action(description=_('Resend selected notifications'))
    def resend_notifications(self, request, queryset):
        failed_count = queryset.filter(delivery_status='failed').count()
        queryset.filter(delivery_status='failed').update(
            delivery_status='pending',
            delivery_attempts=0,
            last_error=''
        )
        self.message_user(request, _('%d notifications queued for resending') % failed_count)
    
    @admin.action(description=_('Mark as read'))
    def mark_read(self, request, queryset):
        updated = queryset.filter(is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
        self.message_user(request, _('%d notifications marked read') % updated)
    
    @admin.action(description=_('Mark as unread'))
    def mark_unread(self, request, queryset):
        updated = queryset.update(is_read=False, read_at=None)
        self.message_user(request, _('%d notifications marked unread') % updated)
    
    @admin.action(description=_('Archive selected notifications'))
    def archive_notifications(self, request, queryset):
        updated = queryset.update(is_archived=True)
        self.message_user(request, _('%d notifications archived') % updated)
    
    @admin.action(description=_('Cancel scheduled notifications'))
    def cancel_scheduled(self, request, queryset):
        cancelled = queryset.filter(delivery_status='scheduled').count()
        queryset.filter(delivery_status='scheduled').update(delivery_status='cancelled')
        self.message_user(request, _('%d scheduled notifications cancelled') % cancelled)
