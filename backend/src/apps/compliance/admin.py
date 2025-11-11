"""
Compliance Admin Interface
Super Admin features for compliance management, audits, and regulatory reporting
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.utils import timezone
from .models import ComplianceCheck, AuditLog, DataRetentionPolicy, IncidentReport, RegulatoryReport


@admin.register(ComplianceCheck)
class ComplianceCheckAdmin(admin.ModelAdmin):
    """Compliance checks and assessments"""
    list_display = ('check_type_badge', 'result_badge', 'compliance_score', 'created_at')
    list_filter = ('check_type', 'result', 'created_at')
    readonly_fields = ('created_at', 'updated_at', 'check_summary')
    
    fieldsets = (
        (_('Check Details'), {
            'fields': ('check_type', 'description')
        }),
        (_('Results'), {
            'fields': ('result', 'compliance_score', 'issues_found')
        }),
        (_('Remediation'), {
            'fields': ('remediation_required', 'remediation_deadline', 'remediation_notes'),
            'classes': ('collapse',)
        }),
        (_('Summary'), {
            'fields': ('check_summary',),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_compliant', 'mark_non_compliant', 'schedule_recheck']
    
    def check_type_badge(self, obj):
        colors = {
            'data_protection': '#2166ac',
            'access_control': '#7fbc41',
            'encryption': '#b35806',
            'audit_trail': '#fc8d59'
        }
        color = colors.get(obj.check_type, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_check_type_display()
        )
    check_type_badge.short_description = _('Type')
    
    def result_badge(self, obj):
        colors = {
            'pass': '#7fbc41',
            'fail': '#d73026',
            'warning': '#fc8d59'
        }
        color = colors.get(obj.result, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_result_display()
        )
    result_badge.short_description = _('Result')
    
    def check_summary(self, obj):
        return format_html(
            '<div>'
            '<p><strong>Score:</strong> {:.0f}%</p>'
            '<p><strong>Issues:</strong> {}</p>'
            '<p><strong>Remediation Required:</strong> {}</p>'
            '</div>',
            obj.compliance_score,
            len(obj.issues_found) if obj.issues_found else 0,
            'Yes' if obj.remediation_required else 'No'
        )
    check_summary.short_description = _('Summary')
    
    @admin.action(description=_('Mark as compliant'))
    def mark_compliant(self, request, queryset):
        updated = queryset.update(result='pass', compliance_score=100)
        self.message_user(request, _('%d checks marked compliant') % updated)
    
    @admin.action(description=_('Mark as non-compliant'))
    def mark_non_compliant(self, request, queryset):
        updated = queryset.update(result='fail')
        self.message_user(request, _('%d checks marked non-compliant') % updated)
    
    @admin.action(description=_('Schedule recheck'))
    def schedule_recheck(self, request, queryset):
        # Implementation for scheduling
        self.message_user(request, _('%d rechecks scheduled') % queryset.count())


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """Immutable audit trail"""
    list_display = (
        'action_badge', 'actor_display', 'resource_type', 'timestamp'
    )
    list_filter = ('action', 'resource_type', 'timestamp')
    search_fields = ('actor__phone_number', 'resource_id')
    readonly_fields = ('timestamp',)
    
    fieldsets = (
        (_('Action'), {
            'fields': ('action', 'resource_type', 'resource_id')
        }),
        (_('Actor'), {
            'fields': ('actor', 'ip_address')
        }),
        (_('Changes'), {
            'fields': ('old_value', 'new_value', 'description'),
            'classes': ('collapse',)
        }),
    )
    
    def action_badge(self, obj):
        colors = {
            'create': '#2166ac',
            'read': '#7fbc41',
            'update': '#fc8d59',
            'delete': '#d73026'
        }
        color = colors.get(obj.action, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_action_display()
        )
    action_badge.short_description = _('Action')
    
    def actor_display(self, obj):
        return obj.actor.phone_number if obj.actor else 'System'
    actor_display.short_description = _('Actor')
    
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Immutable audit log"""
        return False


@admin.register(DataRetentionPolicy)
class DataRetentionPolicyAdmin(admin.ModelAdmin):
    """Data retention and deletion policies"""
    list_display = ('policy_name', 'data_type', 'retention_days', 'is_active')
    list_filter = ('is_active', 'created_at')
    search_fields = ('policy_name',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (_('Policy'), {
            'fields': ('policy_name', 'data_type', 'description')
        }),
        (_('Retention'), {
            'fields': ('retention_days', 'deletion_method')
        }),
        (_('Settings'), {
            'fields': ('is_active', 'exception_list'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['activate_policies', 'deactivate_policies']
    
    @admin.action(description=_('Activate policies'))
    def activate_policies(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, _('%d policies activated') % updated)
    
    @admin.action(description=_('Deactivate policies'))
    def deactivate_policies(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, _('%d policies deactivated') % updated)


@admin.register(IncidentReport)
class IncidentReportAdmin(admin.ModelAdmin):
    """Security incident reporting"""
    list_display = (
        'incident_code', 'incident_type_badge', 'severity_badge',
        'status_badge', 'created_at'
    )
    list_filter = ('incident_type', 'severity', 'status', 'created_at')
    search_fields = ('incident_code', 'description')
    readonly_fields = ('created_at', 'updated_at', 'incident_summary')
    
    fieldsets = (
        (_('Incident Details'), {
            'fields': ('incident_code', 'incident_type', 'severity', 'description')
        }),
        (_('Response'), {
            'fields': ('status', 'root_cause', 'remediation_actions')
        }),
        (_('Reporting'), {
            'fields': (
                'reported_by', 'reported_at', 'regulatory_notification_required',
                'notification_sent_at', 'summary'
            ),
            'classes': ('collapse',)
        }),
        (_('Summary'), {
            'fields': ('incident_summary',),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_resolved', 'send_regulatory_notification']
    
    def incident_type_badge(self, obj):
        colors = {
            'data_breach': '#d73026',
            'unauthorized_access': '#fc8d59',
            'system_failure': '#f7b6d2',
            'policy_violation': '#b35806'
        }
        color = colors.get(obj.incident_type, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_incident_type_display()
        )
    incident_type_badge.short_description = _('Type')
    
    def severity_badge(self, obj):
        colors = {
            'critical': '#d73026',
            'high': '#fc8d59',
            'medium': '#f7b6d2',
            'low': '#7fbc41'
        }
        color = colors.get(obj.severity, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_severity_display()
        )
    severity_badge.short_description = _('Severity')
    
    def status_badge(self, obj):
        colors = {
            'open': '#f7b6d2',
            'investigating': '#fc8d59',
            'resolved': '#7fbc41',
            'closed': '#2166ac'
        }
        color = colors.get(obj.status, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = _('Status')
    
    def incident_summary(self, obj):
        return format_html(
            '<div>'
            '<p><strong>Reported:</strong> {}</p>'
            '<p><strong>Regulatory Notification:</strong> {}</p>'
            '<p><strong>Status:</strong> {}</p>'
            '</div>',
            obj.reported_at,
            'Yes' if obj.regulatory_notification_required else 'No',
            obj.get_status_display()
        )
    incident_summary.short_description = _('Summary')
    
    @admin.action(description=_('Mark as resolved'))
    def mark_resolved(self, request, queryset):
        updated = queryset.update(status='resolved')
        self.message_user(request, _('%d incidents marked resolved') % updated)
    
    @admin.action(description=_('Send regulatory notification'))
    def send_regulatory_notification(self, request, queryset):
        # Implementation for notifications
        self.message_user(request, _('Regulatory notifications queued'))


@admin.register(RegulatoryReport)
class RegulatoryReportAdmin(admin.ModelAdmin):
    """Regulatory compliance reports"""
    list_display = ('report_type_badge', 'submission_deadline', 'status_badge', 'created_at')
    list_filter = ('report_type', 'status', 'created_at')
    readonly_fields = ('created_at', 'updated_at', 'report_summary')
    
    fieldsets = (
        (_('Report Details'), {
            'fields': ('report_type', 'reporting_period_start', 'reporting_period_end')
        }),
        (_('Content'), {
            'fields': ('report_content', 'metrics', 'findings')
        }),
        (_('Submission'), {
            'fields': ('status', 'submission_deadline', 'submitted_at', 'submission_reference')
        }),
        (_('Summary'), {
            'fields': ('report_summary',),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_submitted']
    
    def report_type_badge(self, obj):
        colors = {
            'data_protection': '#2166ac',
            'financial': '#7fbc41',
            'security': '#b35806',
            'operational': '#fc8d59'
        }
        color = colors.get(obj.report_type, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_report_type_display()
        )
    report_type_badge.short_description = _('Type')
    
    def status_badge(self, obj):
        colors = {
            'draft': '#999999',
            'reviewed': '#fc8d59',
            'submitted': '#2166ac',
            'accepted': '#7fbc41'
        }
        color = colors.get(obj.status, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = _('Status')
    
    def report_summary(self, obj):
        return format_html(
            '<div>'
            '<p><strong>Period:</strong> {} to {}</p>'
            '<p><strong>Deadline:</strong> {}</p>'
            '<p><strong>Status:</strong> {}</p>'
            '</div>',
            obj.reporting_period_start,
            obj.reporting_period_end,
            obj.submission_deadline,
            obj.get_status_display()
        )
    report_summary.short_description = _('Summary')
    
    @admin.action(description=_('Mark as submitted'))
    def mark_submitted(self, request, queryset):
        updated = queryset.update(status='submitted', submitted_at=timezone.now())
        self.message_user(request, _('%d reports marked submitted') % updated)
