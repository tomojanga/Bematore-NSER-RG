"""
Core Admin Interface
Base configuration models and system-wide settings accessible to super admins only
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.utils import timezone
from .models import SystemConfig, APIRateLimit, AuditLog, SystemLog, WebhookConfig


@admin.register(SystemConfig)
class SystemConfigAdmin(admin.ModelAdmin):
    """System-wide configuration management"""
    list_display = ('config_key', 'environment', 'is_active', 'updated_at')
    list_filter = ('environment', 'is_active', 'updated_at')
    search_fields = ('config_key', 'config_value')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (_('Configuration'), {
            'fields': ('config_key', 'config_value', 'description')
        }),
        (_('Environment'), {
            'fields': ('environment', 'is_active')
        }),
        (_('System'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['activate_configs', 'deactivate_configs']
    
    def activate_configs(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, _('%d configurations activated') % updated)
    activate_configs.short_description = _('Activate selected configurations')
    
    def deactivate_configs(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, _('%d configurations deactivated') % updated)
    deactivate_configs.short_description = _('Deactivate selected configurations')


@admin.register(APIRateLimit)
class APIRateLimitAdmin(admin.ModelAdmin):
    """API rate limiting configuration"""
    list_display = (
        'endpoint_display', 'method', 'requests_per_second', 
        'burst_limit', 'is_active'
    )
    list_filter = ('method', 'is_active', 'created_at')
    search_fields = ('endpoint_path',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (_('Endpoint'), {
            'fields': ('endpoint_path', 'method')
        }),
        (_('Rate Limits'), {
            'fields': ('requests_per_second', 'burst_limit')
        }),
        (_('Status'), {
            'fields': ('is_active',)
        }),
        (_('System'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def endpoint_display(self, obj):
        return format_html(
            '<code>{}</code>',
            obj.endpoint_path
        )
    endpoint_display.short_description = _('Endpoint')


@admin.register(SystemLog)
class SystemLogAdmin(admin.ModelAdmin):
    """System activity and error logs"""
    list_display = ('log_level_badge', 'component', 'message_preview', 'timestamp')
    list_filter = ('log_level', 'component', 'timestamp')
    search_fields = ('message', 'component')
    readonly_fields = ('timestamp',)
    
    fieldsets = (
        (_('Log Entry'), {
            'fields': ('log_level', 'component', 'message')
        }),
        (_('Details'), {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
    )
    
    def log_level_badge(self, obj):
        colors = {
            'debug': '#cccccc',
            'info': '#2166ac',
            'warning': '#fc8d59',
            'error': '#d73026',
            'critical': '#8B0000'
        }
        color = colors.get(obj.log_level, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_log_level_display()
        )
    log_level_badge.short_description = _('Level')
    
    def message_preview(self, obj):
        return obj.message[:100] + '...' if len(obj.message) > 100 else obj.message
    message_preview.short_description = _('Message')
    
    def has_add_permission(self, request):
        """Logs are auto-generated only"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Keep logs immutable for audit"""
        return False


@admin.register(WebhookConfig)
class WebhookConfigAdmin(admin.ModelAdmin):
    """System webhook configuration for event propagation"""
    list_display = (
        'webhook_name_display', 'event_type_badge', 
        'is_active', 'retry_count', 'updated_at'
    )
    list_filter = ('event_type', 'is_active', 'created_at')
    search_fields = ('webhook_name', 'webhook_url')
    readonly_fields = ('created_at', 'updated_at', 'webhook_summary')
    
    fieldsets = (
        (_('Webhook Details'), {
            'fields': ('webhook_name', 'event_type', 'webhook_url')
        }),
        (_('Authentication'), {
            'fields': ('auth_header', 'auth_token_display'),
            'classes': ('collapse',)
        }),
        (_('Retry Policy'), {
            'fields': ('max_retries', 'retry_count', 'retry_interval_seconds')
        }),
        (_('Status'), {
            'fields': ('is_active',)
        }),
        (_('Summary'), {
            'fields': ('webhook_summary',),
            'classes': ('collapse',)
        }),
        (_('System'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['activate_webhooks', 'deactivate_webhooks', 'reset_retry_count']
    
    def webhook_name_display(self, obj):
        return format_html(
            '<strong>{}</strong>',
            obj.webhook_name
        )
    webhook_name_display.short_description = _('Webhook Name')
    
    def event_type_badge(self, obj):
        colors = {
            'exclusion_registered': '#2166ac',
            'exclusion_lifted': '#7fbc41',
            'screening_completed': '#b35806',
            'user_verified': '#fc8d59'
        }
        color = colors.get(obj.event_type, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_event_type_display()
        )
    event_type_badge.short_description = _('Event Type')
    
    def auth_token_display(self, obj):
        if obj.auth_token:
            return format_html(
                '<code style="color: red;">***HIDDEN***</code>'
            )
        return 'Not configured'
    auth_token_display.short_description = _('Auth Token')
    
    def webhook_summary(self, obj):
        return format_html(
            '<div>'
            '<p><strong>Event Type:</strong> {}</p>'
            '<p><strong>Retry Count:</strong> {}/{}</p>'
            '<p><strong>Last Attempt:</strong> {}</p>'
            '</div>',
            obj.get_event_type_display(),
            obj.retry_count,
            obj.max_retries,
            obj.updated_at
        )
    webhook_summary.short_description = _('Summary')
    
    @admin.action(description=_('Activate webhooks'))
    def activate_webhooks(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, _('%d webhooks activated') % updated)
    
    @admin.action(description=_('Deactivate webhooks'))
    def deactivate_webhooks(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, _('%d webhooks deactivated') % updated)
    
    @admin.action(description=_('Reset retry count'))
    def reset_retry_count(self, request, queryset):
        updated = queryset.update(retry_count=0)
        self.message_user(request, _('Retry count reset for %d webhooks') % updated)
