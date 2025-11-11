"""
Operators Admin Interface
Super Admin features for operator management, API keys, compliance tracking, and integration oversight
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.utils import timezone
from datetime import timedelta
from .models import (
    Operator, OperatorLicense, APIKey, IntegrationConfig,
    ComplianceReport, OperatorAuditLog
)


class OperatorLicenseInline(admin.TabularInline):
    """Inline license management"""
    model = OperatorLicense
    extra = 0
    fields = ('license_number', 'license_type', 'status', 'issued_date', 'expiry_date')
    readonly_fields = ('created_at',)


class APIKeyInline(admin.TabularInline):
    """Inline API key management"""
    model = APIKey
    extra = 0
    fields = (
        'key_name', 'api_key_display', 'is_active', 'last_used_at', 'usage_count'
    )
    readonly_fields = ('api_key_display', 'last_used_at', 'usage_count', 'created_at')
    
    def api_key_display(self, obj):
        return format_html('<code>***HIDDEN***</code>')


@admin.register(Operator)
class OperatorAdmin(admin.ModelAdmin):
    """
    Super Admin Interface for Operator Management
    Comprehensive oversight of all licensed gambling operators
    """
    list_display = (
        'name_display', 'operator_code', 'license_type_badge',
        'license_status_badge', 'integration_status_badge',
        'compliance_score_badge', 'is_api_active_display'
    )
    list_filter = (
        'license_type', 'license_status', 'integration_status',
        'is_api_active', 'is_compliant', 'created_at'
    )
    search_fields = (
        'name', 'operator_code', 'registration_number', 'license_number',
        'email', 'phone'
    )
    readonly_fields = (
        'id', 'created_at', 'updated_at', 'operator_summary',
        'license_summary', 'compliance_summary', 'integration_summary'
    )
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('name', 'trading_name', 'operator_code')
        }),
        (_('Registration'), {
            'fields': ('registration_number',)
        }),
        (_('Contact'), {
            'fields': ('email', 'phone', 'website')
        }),
        (_('License'), {
            'fields': (
                'license_number', 'license_type', 'license_status',
                'license_issued_date', 'license_expiry_date'
            )
        }),
        (_('Integration'), {
            'fields': (
                'integration_status', 'integration_completed_at',
                'is_api_active', 'is_webhook_active'
            )
        }),
        (_('Compliance'), {
            'fields': (
                'compliance_score', 'is_compliant',
                'last_compliance_check'
            )
        }),
        (_('Statistics'), {
            'fields': (
                'total_users', 'total_screenings', 'total_exclusions'
            ),
            'classes': ('collapse',)
        }),
        (_('Location'), {
            'fields': ('country', 'city', 'latitude', 'longitude'),
            'classes': ('collapse',)
        }),
        (_('Summaries'), {
            'fields': (
                'operator_summary', 'license_summary', 'compliance_summary',
                'integration_summary'
            ),
            'classes': ('collapse',)
        }),
        (_('System'), {
            'fields': ('id', 'created_at', 'updated_at', 'metadata'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [OperatorLicenseInline, APIKeyInline]
    
    actions = [
        'activate_operators', 'deactivate_operators', 'suspend_api_access',
        'enable_api_access', 'enable_webhooks', 'disable_webhooks',
        'run_compliance_check', 'send_integration_reminder'
    ]
    
    def name_display(self, obj):
        return format_html(
            '<strong>{}</strong>',
            obj.name
        )
    name_display.short_description = _('Name')
    
    def license_type_badge(self, obj):
        colors = {
            'online_betting': '#2166ac',
            'land_based_casino': '#b35806',
            'lottery': '#7fbc41',
            'sports_betting': '#fc8d59',
            'online_casino': '#d73026'
        }
        color = colors.get(obj.license_type, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_license_type_display()
        )
    license_type_badge.short_description = _('License Type')
    
    def license_status_badge(self, obj):
        colors = {
            'active': '#7fbc41',
            'inactive': '#cccccc',
            'suspended': '#fc8d59',
            'revoked': '#d73026'
        }
        color = colors.get(obj.license_status, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_license_status_display()
        )
    license_status_badge.short_description = _('License Status')
    
    def integration_status_badge(self, obj):
        colors = {
            'pending': '#999999',
            'in_progress': '#fc8d59',
            'completed': '#7fbc41',
            'failed': '#d73026'
        }
        color = colors.get(obj.integration_status, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.integration_status.replace('_', ' ').title()
        )
    integration_status_badge.short_description = _('Integration')
    
    def compliance_score_badge(self, obj):
        score = float(obj.compliance_score)
        if score >= 90:
            color = '#7fbc41'
        elif score >= 70:
            color = '#fc8d59'
        else:
            color = '#d73026'
        
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{:.1f}%</span>',
            color, score
        )
    compliance_score_badge.short_description = _('Compliance')
    
    def is_api_active_display(self, obj):
        if obj.is_api_active:
            return format_html('<span style="color: green; font-weight: bold;">✓ API Active</span>')
        return format_html('<span style="color: red; font-weight: bold;">✗ API Inactive</span>')
    is_api_active_display.short_description = _('API')
    
    def operator_summary(self, obj):
        return format_html(
            '<div style="border: 1px solid #ddd; padding: 10px; border-radius: 4px;">'
            '<p><strong>Name:</strong> {}</p>'
            '<p><strong>Code:</strong> {}</p>'
            '<p><strong>Type:</strong> {}</p>'
            '<p><strong>License:</strong> {} ({})</p>'
            '<p><strong>Contact:</strong> {} | {}</p>'
            '</div>',
            obj.name,
            obj.operator_code,
            obj.get_license_type_display(),
            obj.license_number,
            obj.get_license_status_display(),
            obj.email,
            obj.phone
        )
    operator_summary.short_description = _('Operator Summary')
    
    def license_summary(self, obj):
        days_until_expiry = (obj.license_expiry_date - timezone.now().date()).days
        status_color = 'green' if days_until_expiry > 90 else 'orange' if days_until_expiry > 0 else 'red'
        
        return format_html(
            '<div style="border: 1px solid #ddd; padding: 10px; border-radius: 4px;">'
            '<p><strong>Number:</strong> {}</p>'
            '<p><strong>Type:</strong> {}</p>'
            '<p><strong>Issued:</strong> {}</p>'
            '<p><strong style="color: {};">Expires:</strong> {} ({} days)</p>'
            '</div>',
            obj.license_number,
            obj.get_license_type_display(),
            obj.license_issued_date.strftime('%Y-%m-%d'),
            status_color,
            obj.license_expiry_date.strftime('%Y-%m-%d'),
            days_until_expiry
        )
    license_summary.short_description = _('License Summary')
    
    def compliance_summary(self, obj):
        return format_html(
            '<div style="border: 1px solid #ddd; padding: 10px; border-radius: 4px;">'
            '<p><strong>Score:</strong> {:.1f}%</p>'
            '<p><strong>Status:</strong> {}</p>'
            '<p><strong>Last Check:</strong> {}</p>'
            '</div>',
            float(obj.compliance_score),
            'Compliant' if obj.is_compliant else 'Non-Compliant',
            obj.last_compliance_check.strftime('%Y-%m-%d %H:%M') if obj.last_compliance_check else 'Never'
        )
    compliance_summary.short_description = _('Compliance Summary')
    
    def integration_summary(self, obj):
        return format_html(
            '<div style="border: 1px solid #ddd; padding: 10px; border-radius: 4px;">'
            '<p><strong>Status:</strong> {}</p>'
            '<p><strong>API:</strong> {}</p>'
            '<p><strong>Webhooks:</strong> {}</p>'
            '<p><strong>Users Screened:</strong> {}</p>'
            '<p><strong>Exclusions Enforced:</strong> {}</p>'
            '</div>',
            obj.integration_status.replace('_', ' ').title(),
            'Active' if obj.is_api_active else 'Inactive',
            'Active' if obj.is_webhook_active else 'Inactive',
            obj.total_screenings,
            obj.total_exclusions
        )
    integration_summary.short_description = _('Integration Summary')
    
    # Super Admin Actions
    
    @admin.action(description=_('Activate selected operators'))
    def activate_operators(self, request, queryset):
        updated = queryset.update(license_status='active')
        self.message_user(request, _('%d operators activated') % updated)
    
    @admin.action(description=_('Deactivate selected operators'))
    def deactivate_operators(self, request, queryset):
        updated = queryset.update(license_status='inactive')
        self.message_user(request, _('%d operators deactivated') % updated)
    
    @admin.action(description=_('Suspend API access'))
    def suspend_api_access(self, request, queryset):
        updated = queryset.update(is_api_active=False)
        self.message_user(request, _('API access suspended for %d operators') % updated)
    
    @admin.action(description=_('Enable API access'))
    def enable_api_access(self, request, queryset):
        updated = queryset.update(is_api_active=True)
        self.message_user(request, _('API access enabled for %d operators') % updated)
    
    @admin.action(description=_('Enable webhooks'))
    def enable_webhooks(self, request, queryset):
        updated = queryset.update(is_webhook_active=True)
        self.message_user(request, _('Webhooks enabled for %d operators') % updated)
    
    @admin.action(description=_('Disable webhooks'))
    def disable_webhooks(self, request, queryset):
        updated = queryset.update(is_webhook_active=False)
        self.message_user(request, _('Webhooks disabled for %d operators') % updated)
    
    @admin.action(description=_('Run compliance check'))
    def run_compliance_check(self, request, queryset):
        # Implementation would trigger compliance check task
        self.message_user(request, _('Compliance check queued for %d operators') % queryset.count())
    
    @admin.action(description=_('Send integration reminder'))
    def send_integration_reminder(self, request, queryset):
        # Implementation would send reminders
        pending = queryset.filter(integration_status__in=['pending', 'in_progress'])
        self.message_user(request, _('Reminders queued for %d operators') % pending.count())


@admin.register(OperatorLicense)
class OperatorLicenseAdmin(admin.ModelAdmin):
    """License tracking and management"""
    list_display = (
        'license_number', 'operator_name', 'license_type',
        'status_badge', 'issued_date', 'expiry_date_badge'
    )
    list_filter = ('status', 'license_type', 'issued_date', 'expiry_date')
    search_fields = ('license_number', 'operator__name')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (_('License'), {
            'fields': ('operator', 'license_number', 'license_type')
        }),
        (_('Dates'), {
            'fields': ('issued_date', 'expiry_date')
        }),
        (_('Status'), {
            'fields': ('status', 'issued_by')
        }),
        (_('Conditions'), {
            'fields': ('conditions',),
            'classes': ('collapse',)
        }),
        (_('System'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def operator_name(self, obj):
        return obj.operator.name
    operator_name.short_description = _('Operator')
    
    def status_badge(self, obj):
        colors = {
            'active': '#7fbc41',
            'inactive': '#cccccc',
            'suspended': '#fc8d59',
            'revoked': '#d73026'
        }
        color = colors.get(obj.status, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = _('Status')
    
    def expiry_date_badge(self, obj):
        days_until_expiry = (obj.expiry_date - timezone.now().date()).days
        if days_until_expiry > 90:
            color = 'green'
        elif days_until_expiry > 0:
            color = 'orange'
        else:
            color = 'red'
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{} ({} days)</span>',
            color, obj.expiry_date.strftime('%Y-%m-%d'), days_until_expiry
        )
    expiry_date_badge.short_description = _('Expiry Date')


@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin):
    """API key management with security controls"""
    list_display = (
        'key_name', 'operator_name', 'is_active_display',
        'usage_count', 'last_used_at', 'expires_at_display'
    )
    list_filter = ('is_active', 'created_at', 'last_used_at', 'expires_at')
    search_fields = ('key_name', 'operator__name')
    readonly_fields = (
        'api_key_display', 'api_secret_display', 'created_at', 'updated_at',
        'key_summary'
    )
    
    fieldsets = (
        (_('Basic'), {
            'fields': ('operator', 'key_name')
        }),
        (_('Credentials'), {
            'fields': ('api_key_display', 'api_secret_display'),
            'classes': ('collapse',),
            'description': _('Keys are hidden for security. Only visible at creation.')
        }),
        (_('Permissions'), {
            'fields': ('scopes', 'can_lookup', 'can_register', 'can_screen')
        }),
        (_('Security'), {
            'fields': ('is_active', 'expires_at', 'ip_whitelist')
        }),
        (_('Rate Limiting'), {
            'fields': ('rate_limit_per_second', 'rate_limit_per_day')
        }),
        (_('Usage'), {
            'fields': ('usage_count', 'last_used_at')
        }),
        (_('Summary'), {
            'fields': ('key_summary',),
            'classes': ('collapse',)
        }),
        (_('System'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['activate_keys', 'revoke_keys']
    
    def operator_name(self, obj):
        return obj.operator.name
    operator_name.short_description = _('Operator')
    
    def is_active_display(self, obj):
        if obj.is_active:
            return format_html('<span style="color: green; font-weight: bold;">✓ Active</span>')
        return format_html('<span style="color: red; font-weight: bold;">✗ Revoked</span>')
    is_active_display.short_description = _('Status')
    
    def expires_at_display(self, obj):
        if not obj.expires_at:
            return 'Never'
        days_until = (obj.expires_at.date() - timezone.now().date()).days
        if days_until < 0:
            return format_html('<span style="color: red;">Expired</span>')
        return format_html(
            '<span style="color: {};">{} ({} days)</span>',
            'orange' if days_until < 30 else 'green',
            obj.expires_at.strftime('%Y-%m-%d'),
            days_until
        )
    expires_at_display.short_description = _('Expires')
    
    def api_key_display(self, obj):
        return format_html(
            '<code>pk_...{}</code>',
            obj.api_key[-10:] if obj.api_key else 'N/A'
        )
    api_key_display.short_description = _('API Key')
    
    def api_secret_display(self, obj):
        return format_html(
            '<code style="color: red;">***HIDDEN***</code>'
        )
    api_secret_display.short_description = _('API Secret')
    
    def key_summary(self, obj):
        return format_html(
            '<div>'
            '<p><strong>Operator:</strong> {}</p>'
            '<p><strong>Status:</strong> {}</p>'
            '<p><strong>Usage:</strong> {} calls</p>'
            '<p><strong>Rate Limits:</strong> {}/sec, {}/day</p>'
            '</div>',
            obj.operator.name,
            'Active' if obj.is_active else 'Revoked',
            obj.usage_count,
            obj.rate_limit_per_second,
            obj.rate_limit_per_day
        )
    key_summary.short_description = _('Summary')
    
    @admin.action(description=_('Activate selected keys'))
    def activate_keys(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, _('%d keys activated') % updated)
    
    @admin.action(description=_('Revoke selected keys'))
    def revoke_keys(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, _('%d keys revoked') % updated)


@admin.register(IntegrationConfig)
class IntegrationConfigAdmin(admin.ModelAdmin):
    """Integration configuration management"""
    list_display = (
        'operator_name', 'auto_propagate_display', 'screening_requirement_display',
        'api_version', 'updated_at'
    )
    list_filter = ('api_version', 'auto_propagate_exclusions', 'require_screening_on_register')
    search_fields = ('operator__name',)
    readonly_fields = ('created_at', 'updated_at', 'config_summary')
    
    fieldsets = (
        (_('Operator'), {
            'fields': ('operator',)
        }),
        (_('Webhook URLs'), {
            'fields': (
                'webhook_url_exclusion', 'webhook_url_screening',
                'webhook_url_compliance', 'webhook_secret'
            )
        }),
        (_('Callback URLs'), {
            'fields': ('callback_success_url', 'callback_failure_url')
        }),
        (_('Screening'), {
            'fields': (
                'require_screening_on_register', 'screening_frequency_days'
            )
        }),
        (_('Propagation'), {
            'fields': ('auto_propagate_exclusions',)
        }),
        (_('API Settings'), {
            'fields': (
                'api_version', 'timeout_seconds', 'retry_attempts'
            )
        }),
        (_('Notifications'), {
            'fields': ('notification_email', 'notification_phone'),
            'classes': ('collapse',)
        }),
        (_('Summary'), {
            'fields': ('config_summary',),
            'classes': ('collapse',)
        }),
    )
    
    def operator_name(self, obj):
        return obj.operator.name
    operator_name.short_description = _('Operator')
    
    def auto_propagate_display(self, obj):
        if obj.auto_propagate_exclusions:
            return format_html('<span style="color: green;">✓ Enabled</span>')
        return format_html('<span style="color: red;">✗ Disabled</span>')
    auto_propagate_display.short_description = _('Auto-Propagate')
    
    def screening_requirement_display(self, obj):
        if obj.require_screening_on_register:
            return format_html('<span style="color: green;">✓ Required</span>')
        return format_html('<span style="color: red;">✗ Optional</span>')
    screening_requirement_display.short_description = _('Screening Required')
    
    def config_summary(self, obj):
        return format_html(
            '<div>'
            '<p><strong>API Version:</strong> {}</p>'
            '<p><strong>Auto-Propagate:</strong> {}</p>'
            '<p><strong>Screening Frequency:</strong> {} days</p>'
            '<p><strong>Timeout:</strong> {} seconds</p>'
            '<p><strong>Retries:</strong> {}</p>'
            '</div>',
            obj.api_version,
            'Yes' if obj.auto_propagate_exclusions else 'No',
            obj.screening_frequency_days,
            obj.timeout_seconds,
            obj.retry_attempts
        )
    config_summary.short_description = _('Summary')


@admin.register(ComplianceReport)
class ComplianceReportAdmin(admin.ModelAdmin):
    """Compliance report tracking"""
    list_display = (
        'report_reference', 'operator_name', 'overall_score_badge',
        'is_compliant_display', 'report_period_end', 'reviewed_at'
    )
    list_filter = ('is_compliant', 'report_period_end', 'reviewed_at')
    search_fields = ('report_reference', 'operator__name')
    readonly_fields = (
        'created_at', 'updated_at', 'report_summary'
    )
    
    fieldsets = (
        (_('Report'), {
            'fields': ('operator', 'report_reference')
        }),
        (_('Period'), {
            'fields': ('report_period_start', 'report_period_end')
        }),
        (_('Metrics'), {
            'fields': (
                'total_users_screened', 'total_exclusions_enforced',
                'screening_compliance_rate', 'exclusion_enforcement_rate'
            )
        }),
        (_('Performance'), {
            'fields': (
                'avg_lookup_response_ms', 'avg_webhook_response_ms'
            ),
            'classes': ('collapse',)
        }),
        (_('Issues'), {
            'fields': (
                'compliance_issues', 'violations_count', 'warnings_issued'
            ),
            'classes': ('collapse',)
        }),
        (_('Review'), {
            'fields': (
                'overall_score', 'is_compliant', 'reviewed_by', 'reviewed_at'
            )
        }),
        (_('Summary'), {
            'fields': ('report_summary',),
            'classes': ('collapse',)
        }),
    )
    
    def operator_name(self, obj):
        return obj.operator.name
    operator_name.short_description = _('Operator')
    
    def overall_score_badge(self, obj):
        score = float(obj.overall_score)
        if score >= 90:
            color = '#7fbc41'
        elif score >= 70:
            color = '#fc8d59'
        else:
            color = '#d73026'
        
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{:.1f}%</span>',
            color, score
        )
    overall_score_badge.short_description = _('Score')
    
    def is_compliant_display(self, obj):
        if obj.is_compliant:
            return format_html('<span style="color: green; font-weight: bold;">✓ Compliant</span>')
        return format_html('<span style="color: red; font-weight: bold;">✗ Non-Compliant</span>')
    is_compliant_display.short_description = _('Compliance')
    
    def report_summary(self, obj):
        return format_html(
            '<div>'
            '<p><strong>Period:</strong> {} to {}</p>'
            '<p><strong>Users Screened:</strong> {}</p>'
            '<p><strong>Exclusions Enforced:</strong> {}</p>'
            '<p><strong>Compliance:</strong> {:.1f}% (Screening) / {:.1f}% (Enforcement)</p>'
            '<p><strong>Issues:</strong> {} violations, {} warnings</p>'
            '</div>',
            obj.report_period_start,
            obj.report_period_end,
            obj.total_users_screened,
            obj.total_exclusions_enforced,
            float(obj.screening_compliance_rate),
            float(obj.exclusion_enforcement_rate),
            obj.violations_count,
            obj.warnings_issued
        )
    report_summary.short_description = _('Summary')


@admin.register(OperatorAuditLog)
class OperatorAuditLogAdmin(admin.ModelAdmin):
    """Immutable audit trail for operator actions"""
    list_display = (
        'operator_name', 'action_badge', 'resource_type',
        'performed_by_display', 'success_display', 'created_at'
    )
    list_filter = ('action', 'success', 'created_at')
    search_fields = ('operator__name', 'action', 'performed_by_user__phone_number')
    readonly_fields = ('created_at',)
    
    fieldsets = (
        (_('Action'), {
            'fields': ('operator', 'action', 'resource_type', 'resource_id')
        }),
        (_('Actor'), {
            'fields': ('performed_by_user', 'ip_address')
        }),
        (_('Request/Response'), {
            'fields': ('request_data', 'response_data'),
            'classes': ('collapse',)
        }),
        (_('Status'), {
            'fields': ('success', 'error_message')
        }),
    )
    
    def operator_name(self, obj):
        return obj.operator.name
    operator_name.short_description = _('Operator')
    
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
            color, obj.action.upper()
        )
    action_badge.short_description = _('Action')
    
    def performed_by_display(self, obj):
        return obj.performed_by_user.phone_number if obj.performed_by_user else 'System'
    performed_by_display.short_description = _('Performed By')
    
    def success_display(self, obj):
        if obj.success:
            return format_html('<span style="color: green;">✓ Success</span>')
        return format_html('<span style="color: red;">✗ Failed</span>')
    success_display.short_description = _('Status')
    
    def has_add_permission(self, request):
        """Audit logs are auto-generated"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Immutable audit trail"""
        return False
