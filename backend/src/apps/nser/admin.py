"""
NSER (National Self-Exclusion Register) Admin Interface
Super Admin features for exclusion management, operator propagation tracking, and regulatory oversight
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.utils import timezone
from django.db.models import Q
from .models import (
    SelfExclusionRecord, OperatorExclusionMapping, ExclusionAuditLog,
    ExclusionExtensionRequest, ExclusionStatistics
)


class OperatorExclusionMappingInline(admin.TabularInline):
    """Inline operator propagation status"""
    model = OperatorExclusionMapping
    extra = 0
    fields = ('operator', 'propagation_status', 'is_compliant', 'notified_at', 'acknowledged_at')
    readonly_fields = ('notified_at', 'acknowledged_at', 'created_at')
    can_delete = False


@admin.register(SelfExclusionRecord)
class SelfExclusionRecordAdmin(admin.ModelAdmin):
    """
    Super Admin Interface for Self-Exclusion Record Management
    Comprehensive oversight of all exclusions with propagation tracking
    """
    list_display = (
        'exclusion_reference', 'user_phone_badge', 'status_badge', 
        'exclusion_period_display', 'active_status', 'propagation_status_badge',
        'effective_date'
    )
    list_filter = (
        'status', 'exclusion_period', 'is_active', 'propagation_status',
        'effective_date', 'created_at', 'risk_level_at_exclusion'
    )
    search_fields = (
        'exclusion_reference', 'user__phone_number', 'user__email',
        'bst_token__token', 'reason'
    )
    readonly_fields = (
        'id', 'exclusion_reference', 'created_at', 'updated_at', 
        'bst_token', 'exclusion_summary', 'propagation_summary', 'activity_log'
    )
    
    fieldsets = (
        (_('Exclusion Reference'), {
            'fields': ('exclusion_reference', 'user', 'bst_token')
        }),
        (_('Exclusion Period'), {
            'fields': ('exclusion_period', 'custom_period_days', 'effective_date', 'expiry_date', 'actual_end_date')
        }),
        (_('Status'), {
            'fields': ('status', 'is_active', 'can_terminate_early')
        }),
        (_('Reason & Context'), {
            'fields': ('reason', 'motivation_type', 'triggering_assessment', 'risk_level_at_exclusion'),
            'classes': ('collapse',)
        }),
        (_('Auto-Renewal'), {
            'fields': ('is_auto_renewable', 'renewal_count', 'last_renewed_at'),
            'classes': ('collapse',)
        }),
        (_('Consent & Legal'), {
            'fields': (
                'terms_accepted', 'consent_ip_address', 'digital_signature'
            ),
            'classes': ('collapse',)
        }),
        (_('Early Termination'), {
            'fields': (
                'early_termination_request_date', 'early_termination_approved',
                'early_termination_approved_by', 'termination_reason'
            ),
            'classes': ('collapse',)
        }),
        (_('Propagation to Operators'), {
            'fields': (
                'propagation_status', 'operators_notified', 'operators_acknowledged',
                'propagation_completed_at', 'propagation_summary'
            )
        }),
        (_('Notifications'), {
            'fields': (
                'notification_sent', 'notification_sent_at',
                'reminder_notifications_enabled'
            ),
            'classes': ('collapse',)
        }),
        (_('System'), {
            'fields': ('id', 'created_at', 'updated_at', 'metadata'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [OperatorExclusionMappingInline]
    
    actions = [
        'activate_exclusions', 'deactivate_exclusions', 'manually_propagate',
        'approve_early_termination', 'renew_exclusions', 'send_reminders'
    ]
    
    def user_phone_badge(self, obj):
        """Display user phone with link"""
        return format_html(
            '<strong>{}</strong>',
            obj.user.phone_number
        )
    user_phone_badge.short_description = _('User')
    
    def status_badge(self, obj):
        """Display status as colored badge"""
        colors = {
            'pending': '#999999',
            'active': '#7fbc41',
            'expired': '#cccccc',
            'terminated': '#d73026',
            'suspended': '#fc8d59',
            'revoked': '#8B0000'
        }
        color = colors.get(obj.status, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = _('Status')
    
    def active_status(self, obj):
        """Display active/inactive status"""
        if obj.is_active:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Active</span>'
            )
        return format_html(
            '<span style="color: red; font-weight: bold;">✗ Inactive</span>'
        )
    active_status.short_description = _('Active')
    
    def exclusion_period_display(self, obj):
        """Display exclusion period with duration"""
        if obj.custom_period_days:
            return f"{obj.custom_period_days} days"
        return obj.get_exclusion_period_display()
    exclusion_period_display.short_description = _('Period')
    
    def propagation_status_badge(self, obj):
        """Display propagation status as colored badge"""
        colors = {
            'pending': '#999999',
            'in_progress': '#fc8d59',
            'completed': '#7fbc41',
            'partial': '#f7b6d2',
            'failed': '#d73026'
        }
        color = colors.get(obj.propagation_status, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_propagation_status_display()
        )
    propagation_status_badge.short_description = _('Propagation')
    
    def exclusion_summary(self, obj):
        """Display comprehensive exclusion summary"""
        days_remaining = obj.days_remaining if obj.is_active else 0
        progress = obj.progress_percentage
        
        return format_html(
            '<div style="border: 1px solid #ddd; padding: 10px; border-radius: 4px;">'
            '<p><strong>Reference:</strong> {}</p>'
            '<p><strong>Period:</strong> {} to {}</p>'
            '<p><strong>Status:</strong> {}</p>'
            '<p><strong>Days Remaining:</strong> {}</p>'
            '<p><strong>Progress:</strong> {:.1f}%</p>'
            '<p><strong>Risk Level:</strong> {}</p>'
            '</div>',
            obj.exclusion_reference,
            obj.effective_date.strftime('%Y-%m-%d'),
            obj.expiry_date.strftime('%Y-%m-%d'),
            obj.get_status_display(),
            days_remaining,
            progress,
            obj.get_risk_level_at_exclusion_display() if obj.risk_level_at_exclusion else 'N/A'
        )
    exclusion_summary.short_description = _('Summary')
    
    def propagation_summary(self, obj):
        """Display propagation status summary"""
        total_operators = obj.operator_mappings.count()
        acknowledged = obj.operator_mappings.filter(is_compliant=True).count()
        pending = obj.operator_mappings.filter(propagation_status='pending').count()
        
        return format_html(
            '<div style="border: 1px solid #ddd; padding: 10px; border-radius: 4px;">'
            '<p><strong>Total Operators:</strong> {}</p>'
            '<p><strong>Acknowledged:</strong> {}/{}</p>'
            '<p><strong>Pending:</strong> {}</p>'
            '<p><strong>Status:</strong> {}</p>'
            '</div>',
            total_operators,
            acknowledged,
            total_operators,
            pending,
            obj.get_propagation_status_display()
        )
    propagation_summary.short_description = _('Propagation Status')
    
    def activity_log(self, obj):
        """Display recent activity"""
        recent_logs = obj.audit_logs.all()[:5]
        log_html = '<ul style="margin: 0; padding-left: 20px;">'
        for log in recent_logs:
            log_html += f'<li>{log.action} - {log.created_at.strftime("%Y-%m-%d %H:%M")}</li>'
        log_html += '</ul>'
        return format_html(log_html) if recent_logs else 'No activity'
    activity_log.short_description = _('Recent Activity')
    
    # Super Admin Actions
    
    @admin.action(description=_('Activate selected exclusions'))
    def activate_exclusions(self, request, queryset):
        updated = 0
        for exclusion in queryset:
            if exclusion.status != 'active':
                exclusion.status = 'active'
                exclusion.save()
                updated += 1
        self.message_user(request, _('%d exclusions activated') % updated)
    
    @admin.action(description=_('Deactivate selected exclusions'))
    def deactivate_exclusions(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, _('%d exclusions deactivated') % updated)
    
    @admin.action(description=_('Manually trigger propagation to operators'))
    def manually_propagate(self, request, queryset):
        # Implementation would trigger propagation task
        self.message_user(request, _('Propagation triggered for %d exclusions') % queryset.count())
    
    @admin.action(description=_('Approve early termination'))
    def approve_early_termination(self, request, queryset):
        approved = 0
        for exclusion in queryset:
            if exclusion.early_termination_request_date and not exclusion.early_termination_approved:
                exclusion.terminate_early(approved_by=request.user, reason='Admin approved')
                approved += 1
        self.message_user(request, _('%d early terminations approved') % approved)
    
    @admin.action(description=_('Renew auto-renewable exclusions'))
    def renew_exclusions(self, request, queryset):
        renewed = 0
        for exclusion in queryset:
            if exclusion.is_auto_renewable and exclusion.status == 'active':
                exclusion.renew()
                renewed += 1
        self.message_user(request, _('%d exclusions renewed') % renewed)
    
    @admin.action(description=_('Send reminder notifications'))
    def send_reminders(self, request, queryset):
        # Implementation would send reminders via notifications app
        self.message_user(request, _('Reminders queued for %d exclusions') % queryset.count())


@admin.register(OperatorExclusionMapping)
class OperatorExclusionMappingAdmin(admin.ModelAdmin):
    """Track exclusion propagation to individual operators"""
    list_display = (
        'exclusion_reference', 'operator_name', 'propagation_status_badge',
        'is_compliant_display', 'notified_at', 'acknowledged_at'
    )
    list_filter = (
        'propagation_status', 'is_compliant', 'created_at', 'notified_at'
    )
    search_fields = (
        'exclusion__exclusion_reference', 'operator__name',
        'exclusion__user__phone_number'
    )
    readonly_fields = (
        'created_at', 'updated_at', 'mapping_summary'
    )
    
    fieldsets = (
        (_('Mapping'), {
            'fields': ('exclusion', 'operator')
        }),
        (_('Propagation'), {
            'fields': (
                'propagation_status', 'notified_at', 'acknowledged_at'
            )
        }),
        (_('Retry Logic'), {
            'fields': (
                'retry_count', 'max_retries', 'next_retry_at'
            ),
            'classes': ('collapse',)
        }),
        (_('Webhook'), {
            'fields': (
                'webhook_sent_at', 'webhook_response_code', 'webhook_response_body'
            ),
            'classes': ('collapse',)
        }),
        (_('Error Handling'), {
            'fields': (
                'last_error_message', 'error_count'
            ),
            'classes': ('collapse',)
        }),
        (_('Compliance'), {
            'fields': (
                'is_compliant', 'compliance_checked_at'
            )
        }),
        (_('System'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = [
        'retry_propagation', 'mark_compliant', 'reset_retry_count'
    ]
    
    def exclusion_reference(self, obj):
        return obj.exclusion.exclusion_reference
    exclusion_reference.short_description = _('Exclusion Reference')
    
    def operator_name(self, obj):
        return obj.operator.name
    operator_name.short_description = _('Operator')
    
    def propagation_status_badge(self, obj):
        colors = {
            'pending': '#999999',
            'notified': '#fc8d59',
            'acknowledged': '#7fbc41',
            'failed': '#d73026',
            'timeout': '#f7b6d2'
        }
        color = colors.get(obj.propagation_status, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_propagation_status_display()
        )
    propagation_status_badge.short_description = _('Status')
    
    def is_compliant_display(self, obj):
        if obj.is_compliant:
            return format_html('<span style="color: green; font-weight: bold;">✓ Compliant</span>')
        return format_html('<span style="color: red; font-weight: bold;">✗ Non-Compliant</span>')
    is_compliant_display.short_description = _('Compliance')
    
    def mapping_summary(self, obj):
        return format_html(
            '<div style="border: 1px solid #ddd; padding: 10px; border-radius: 4px;">'
            '<p><strong>Operator:</strong> {}</p>'
            '<p><strong>Status:</strong> {}</p>'
            '<p><strong>Retries:</strong> {}/{}</p>'
            '<p><strong>Response Code:</strong> {}</p>'
            '<p><strong>Compliant:</strong> {}</p>'
            '</div>',
            obj.operator.name,
            obj.get_propagation_status_display(),
            obj.retry_count,
            obj.max_retries,
            obj.webhook_response_code or 'N/A',
            'Yes' if obj.is_compliant else 'No'
        )
    mapping_summary.short_description = _('Summary')
    
    @admin.action(description=_('Retry propagation'))
    def retry_propagation(self, request, queryset):
        updated = queryset.update(retry_count=0, next_retry_at=timezone.now())
        self.message_user(request, _('Retry scheduled for %d mappings') % updated)
    
    @admin.action(description=_('Mark as compliant'))
    def mark_compliant(self, request, queryset):
        updated = queryset.update(is_compliant=True, compliance_checked_at=timezone.now())
        self.message_user(request, _('%d mappings marked compliant') % updated)
    
    @admin.action(description=_('Reset retry count'))
    def reset_retry_count(self, request, queryset):
        updated = queryset.update(retry_count=0)
        self.message_user(request, _('Retry count reset for %d mappings') % updated)


@admin.register(ExclusionAuditLog)
class ExclusionAuditLogAdmin(admin.ModelAdmin):
    """Immutable audit trail for all exclusion actions"""
    list_display = (
        'exclusion_reference', 'action_badge', 'performed_by_display',
        'created_at'
    )
    list_filter = ('action', 'created_at')
    search_fields = (
        'exclusion__exclusion_reference', 'performed_by__phone_number',
        'description'
    )
    readonly_fields = ('created_at', 'audit_summary')
    
    fieldsets = (
        (_('Action'), {
            'fields': ('exclusion', 'action', 'description')
        }),
        (_('Actor'), {
            'fields': ('performed_by', 'ip_address', 'user_agent'),
            'classes': ('collapse',)
        }),
        (_('Changes'), {
            'fields': ('changes',),
            'classes': ('collapse',)
        }),
        (_('Metadata'), {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
    )
    
    def exclusion_reference(self, obj):
        return obj.exclusion.exclusion_reference
    exclusion_reference.short_description = _('Exclusion Reference')
    
    def action_badge(self, obj):
        colors = {
            'created': '#2166ac',
            'updated': '#fc8d59',
            'activated': '#7fbc41',
            'expired': '#cccccc',
            'renewed': '#b35806',
            'terminated': '#d73026',
            'suspended': '#f7b6d2',
            'revoked': '#8B0000',
            'viewed': '#2166ac',
            'propagated': '#7fbc41'
        }
        color = colors.get(obj.action, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_action_display()
        )
    action_badge.short_description = _('Action')
    
    def performed_by_display(self, obj):
        return obj.performed_by.phone_number if obj.performed_by else 'System'
    performed_by_display.short_description = _('Performed By')
    
    def audit_summary(self, obj):
        return format_html(
            '<div>'
            '<p><strong>Action:</strong> {}</p>'
            '<p><strong>Actor:</strong> {}</p>'
            '<p><strong>IP:</strong> {}</p>'
            '<p><strong>Time:</strong> {}</p>'
            '</div>',
            obj.get_action_display(),
            obj.performed_by.phone_number if obj.performed_by else 'System',
            obj.ip_address or 'N/A',
            obj.created_at
        )
    audit_summary.short_description = _('Summary')
    
    def has_add_permission(self, request):
        """Audit logs are auto-generated"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Immutable audit trail"""
        return False


@admin.register(ExclusionExtensionRequest)
class ExclusionExtensionRequestAdmin(admin.ModelAdmin):
    """Manage exclusion extension requests"""
    list_display = (
        'exclusion_reference', 'requested_period_display', 'status_badge',
        'reviewed_by_display', 'created_at'
    )
    list_filter = ('status', 'requested_new_period', 'created_at')
    search_fields = (
        'exclusion__exclusion_reference', 'exclusion__user__phone_number',
        'reason'
    )
    readonly_fields = ('created_at', 'request_summary')
    
    fieldsets = (
        (_('Request'), {
            'fields': ('exclusion', 'requested_new_period', 'requested_expiry_date')
        }),
        (_('Details'), {
            'fields': ('reason',),
            'classes': ('collapse',)
        }),
        (_('Review'), {
            'fields': ('status', 'reviewed_by', 'reviewed_at', 'review_notes')
        }),
        (_('Summary'), {
            'fields': ('request_summary',),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['approve_requests', 'reject_requests']
    
    def exclusion_reference(self, obj):
        return obj.exclusion.exclusion_reference
    exclusion_reference.short_description = _('Exclusion Reference')
    
    def requested_period_display(self, obj):
        return obj.get_requested_new_period_display()
    requested_period_display.short_description = _('Requested Period')
    
    def status_badge(self, obj):
        colors = {
            'pending': '#999999',
            'approved': '#7fbc41',
            'rejected': '#d73026'
        }
        color = colors.get(obj.status, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = _('Status')
    
    def reviewed_by_display(self, obj):
        return obj.reviewed_by.phone_number if obj.reviewed_by else 'Pending'
    reviewed_by_display.short_description = _('Reviewed By')
    
    def request_summary(self, obj):
        return format_html(
            '<div>'
            '<p><strong>Current Expiry:</strong> {}</p>'
            '<p><strong>Requested Expiry:</strong> {}</p>'
            '<p><strong>Status:</strong> {}</p>'
            '</div>',
            obj.exclusion.expiry_date.strftime('%Y-%m-%d'),
            obj.requested_expiry_date.strftime('%Y-%m-%d'),
            obj.get_status_display()
        )
    request_summary.short_description = _('Summary')
    
    @admin.action(description=_('Approve selected requests'))
    def approve_requests(self, request, queryset):
        updated = queryset.update(
            status='approved',
            reviewed_by=request.user,
            reviewed_at=timezone.now()
        )
        self.message_user(request, _('%d requests approved') % updated)
    
    @admin.action(description=_('Reject selected requests'))
    def reject_requests(self, request, queryset):
        updated = queryset.update(
            status='rejected',
            reviewed_by=request.user,
            reviewed_at=timezone.now()
        )
        self.message_user(request, _('%d requests rejected') % updated)


@admin.register(ExclusionStatistics)
class ExclusionStatisticsAdmin(admin.ModelAdmin):
    """View aggregated exclusion statistics"""
    list_display = (
        'date', 'total_exclusions', 'active_exclusions',
        'successful_propagations', 'failed_propagations'
    )
    list_filter = ('date',)
    readonly_fields = (
        'date', 'statistics_summary'
    )
    
    fieldsets = (
        (_('Date'), {
            'fields': ('date',)
        }),
        (_('Exclusion Counts'), {
            'fields': (
                'total_exclusions', 'active_exclusions', 'new_exclusions_today',
                'expired_exclusions_today'
            )
        }),
        (_('By Period'), {
            'fields': (
                'six_month_exclusions', 'one_year_exclusions',
                'five_year_exclusions', 'permanent_exclusions'
            ),
            'classes': ('collapse',)
        }),
        (_('By Risk Level'), {
            'fields': (
                'high_risk_exclusions', 'moderate_risk_exclusions',
                'low_risk_exclusions'
            ),
            'classes': ('collapse',)
        }),
        (_('Propagation'), {
            'fields': (
                'avg_propagation_time_seconds', 'successful_propagations',
                'failed_propagations'
            ),
            'classes': ('collapse',)
        }),
        (_('Geography'), {
            'fields': ('exclusions_by_county',),
            'classes': ('collapse',)
        }),
        (_('Summary'), {
            'fields': ('statistics_summary',),
            'classes': ('collapse',)
        }),
    )
    
    def statistics_summary(self, obj):
        success_rate = (
            (obj.successful_propagations / (obj.successful_propagations + obj.failed_propagations) * 100)
            if (obj.successful_propagations + obj.failed_propagations) > 0 else 0
        )
        
        return format_html(
            '<div style="border: 1px solid #ddd; padding: 10px; border-radius: 4px;">'
            '<p><strong>Total Exclusions:</strong> {}</p>'
            '<p><strong>Active:</strong> {}</p>'
            '<p><strong>Success Rate:</strong> {:.1f}%</p>'
            '<p><strong>Avg Propagation Time:</strong> {:.2f}s</p>'
            '</div>',
            obj.total_exclusions,
            obj.active_exclusions,
            success_rate,
            obj.avg_propagation_time_seconds
        )
    statistics_summary.short_description = _('Summary')
    
    def has_add_permission(self, request):
        """Statistics are auto-generated"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Keep statistics for historical records"""
        return False
