"""
Monitoring & Performance Admin Interface
Super Admin features for system health, metrics, and performance tracking
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.utils import timezone
from .models import SystemMetric, HealthCheck, Alert, APIRequestLog


@admin.register(SystemMetric)
class SystemMetricAdmin(admin.ModelAdmin):
    """System performance metrics tracking"""
    list_display = (
        'metric_name', 'metric_type_badge', 'value_display',
        'timestamp'
    )
    list_filter = ('metric_type', 'metric_name', 'timestamp')
    search_fields = ('metric_name',)
    readonly_fields = ('timestamp', 'metric_summary')
    
    fieldsets = (
        (_('Metric'), {
            'fields': ('metric_name', 'metric_type', 'value')
        }),
        (_('Tags'), {
            'fields': ('tags',),
            'classes': ('collapse',)
        }),
        (_('Summary'), {
            'fields': ('metric_summary',),
            'classes': ('collapse',)
        }),
    )
    
    def metric_type_badge(self, obj):
        colors = {
            'counter': '#2166ac',
            'gauge': '#7fbc41',
            'histogram': '#b35806'
        }
        color = colors.get(obj.metric_type, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_metric_type_display()
        )
    metric_type_badge.short_description = _('Type')
    
    def value_display(self, obj):
        return format_html('<strong>{:.2f}</strong>', obj.value)
    value_display.short_description = _('Value')
    
    def metric_summary(self, obj):
        return format_html(
            '<div>'
            '<p><strong>Metric:</strong> {}</p>'
            '<p><strong>Value:</strong> {:.2f}</p>'
            '<p><strong>Type:</strong> {}</p>'
            '</div>',
            obj.metric_name,
            obj.value,
            obj.get_metric_type_display()
        )
    metric_summary.short_description = _('Summary')
    
    def has_add_permission(self, request):
        """Metrics are auto-generated"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Keep metrics for historical analysis"""
        return False


@admin.register(HealthCheck)
class HealthCheckAdmin(admin.ModelAdmin):
    """System health check monitoring"""
    list_display = (
        'service_name', 'status_badge', 'response_time_display', 'created_at'
    )
    list_filter = ('status', 'created_at')
    search_fields = ('service_name',)
    readonly_fields = ('created_at', 'health_summary')
    
    fieldsets = (
        (_('Service'), {
            'fields': ('service_name', 'status')
        }),
        (_('Performance'), {
            'fields': ('response_time_ms',)
        }),
        (_('Health Checks'), {
            'fields': ('checks',),
            'classes': ('collapse',)
        }),
        (_('Summary'), {
            'fields': ('health_summary',),
            'classes': ('collapse',)
        }),
    )
    
    def status_badge(self, obj):
        colors = {
            'healthy': '#7fbc41',
            'degraded': '#fc8d59',
            'unhealthy': '#d73026'
        }
        color = colors.get(obj.status, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = _('Status')
    
    def response_time_display(self, obj):
        if obj.response_time_ms < 500:
            color = 'green'
        elif obj.response_time_ms < 1000:
            color = 'orange'
        else:
            color = 'red'
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:.0f}ms</span>',
            color, obj.response_time_ms
        )
    response_time_display.short_description = _('Response Time')
    
    def health_summary(self, obj):
        return format_html(
            '<div>'
            '<p><strong>Service:</strong> {}</p>'
            '<p><strong>Status:</strong> {}</p>'
            '<p><strong>Response Time:</strong> {:.0f}ms</p>'
            '</div>',
            obj.service_name,
            obj.get_status_display(),
            obj.response_time_ms
        )
    health_summary.short_description = _('Summary')
    
    def has_add_permission(self, request):
        """Health checks are auto-generated"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Keep health history"""
        return False


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    """System alerts and incident management"""
    list_display = (
        'alert_name', 'severity_badge', 'alert_type_display',
        'is_resolved_display', 'triggered_at'
    )
    list_filter = ('severity', 'alert_type', 'is_resolved', 'triggered_at')
    search_fields = ('alert_name', 'message')
    readonly_fields = ('triggered_at', 'alert_summary')
    
    fieldsets = (
        (_('Alert'), {
            'fields': ('alert_name', 'alert_type', 'severity')
        }),
        (_('Message'), {
            'fields': ('message',)
        }),
        (_('Status'), {
            'fields': ('is_resolved', 'resolved_at')
        }),
        (_('Metadata'), {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        (_('Summary'), {
            'fields': ('alert_summary',),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_resolved', 'mark_unresolved']
    
    def severity_badge(self, obj):
        colors = {
            'low': '#7fbc41',
            'medium': '#fc8d59',
            'high': '#d73026',
            'critical': '#8B0000'
        }
        color = colors.get(obj.severity, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_severity_display()
        )
    severity_badge.short_description = _('Severity')
    
    def alert_type_display(self, obj):
        return obj.alert_type
    alert_type_display.short_description = _('Type')
    
    def is_resolved_display(self, obj):
        if obj.is_resolved:
            return format_html('<span style="color: green;">✓ Resolved</span>')
        return format_html('<span style="color: red;">✗ Open</span>')
    is_resolved_display.short_description = _('Status')
    
    def alert_summary(self, obj):
        return format_html(
            '<div>'
            '<p><strong>Alert:</strong> {}</p>'
            '<p><strong>Severity:</strong> {}</p>'
            '<p><strong>Type:</strong> {}</p>'
            '<p><strong>Status:</strong> {}</p>'
            '<p><strong>Triggered:</strong> {}</p>'
            '</div>',
            obj.alert_name,
            obj.get_severity_display(),
            obj.alert_type,
            'Resolved' if obj.is_resolved else 'Open',
            obj.triggered_at
        )
    alert_summary.short_description = _('Summary')
    
    @admin.action(description=_('Mark as resolved'))
    def mark_resolved(self, request, queryset):
        updated = queryset.filter(is_resolved=False).update(
            is_resolved=True,
            resolved_at=timezone.now()
        )
        self.message_user(request, _('%d alerts resolved') % updated)
    
    @admin.action(description=_('Mark as unresolved'))
    def mark_unresolved(self, request, queryset):
        updated = queryset.update(is_resolved=False, resolved_at=None)
        self.message_user(request, _('%d alerts reopened') % updated)


@admin.register(APIRequestLog)
class APIRequestLogAdmin(admin.ModelAdmin):
    """API request logging and performance analysis"""
    list_display = (
        'request_id_short', 'method_badge', 'path', 'status_code_badge',
        'response_time_display', 'created_at'
    )
    list_filter = ('method', 'status_code', 'created_at')
    search_fields = ('path', 'ip_address', 'request_id', 'user_id')
    readonly_fields = ('created_at', 'request_summary')
    
    fieldsets = (
        (_('Request'), {
            'fields': ('request_id', 'method', 'path')
        }),
        (_('Response'), {
            'fields': ('status_code', 'response_time_ms')
        }),
        (_('Client'), {
            'fields': ('user_id', 'operator_id', 'ip_address'),
            'classes': ('collapse',)
        }),
        (_('User Agent'), {
            'fields': ('user_agent',),
            'classes': ('collapse',)
        }),
        (_('Error'), {
            'fields': ('error_message',),
            'classes': ('collapse',)
        }),
        (_('Summary'), {
            'fields': ('request_summary',),
            'classes': ('collapse',)
        }),
    )
    
    def request_id_short(self, obj):
        return format_html('<code>{}</code>', str(obj.request_id)[:12] + '...')
    request_id_short.short_description = _('Request ID')
    
    def method_badge(self, obj):
        colors = {
            'GET': '#2166ac',
            'POST': '#7fbc41',
            'PUT': '#b35806',
            'DELETE': '#d73026',
            'PATCH': '#fc8d59'
        }
        color = colors.get(obj.method, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.method
        )
    method_badge.short_description = _('Method')
    
    def status_code_badge(self, obj):
        if 200 <= obj.status_code < 300:
            color = '#7fbc41'
        elif 300 <= obj.status_code < 400:
            color = '#fc8d59'
        elif 400 <= obj.status_code < 500:
            color = '#d73026'
        else:
            color = '#8B0000'
        
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.status_code
        )
    status_code_badge.short_description = _('Status')
    
    def response_time_display(self, obj):
        if obj.response_time_ms < 500:
            color = 'green'
        elif obj.response_time_ms < 1000:
            color = 'orange'
        else:
            color = 'red'
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:.0f}ms</span>',
            color, obj.response_time_ms
        )
    response_time_display.short_description = _('Response Time')
    
    def request_summary(self, obj):
        return format_html(
            '<div>'
            '<p><strong>Method:</strong> {}</p>'
            '<p><strong>Path:</strong> {}</p>'
            '<p><strong>Status:</strong> {}</p>'
            '<p><strong>Response Time:</strong> {:.0f}ms</p>'
            '<p><strong>IP:</strong> {}</p>'
            '</div>',
            obj.method,
            obj.path,
            obj.status_code,
            obj.response_time_ms,
            obj.ip_address
        )
    request_summary.short_description = _('Summary')
    
    def has_add_permission(self, request):
        """Logs are auto-generated"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Keep logs for audit trail"""
        return False
