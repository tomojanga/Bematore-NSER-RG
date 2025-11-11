"""
API Admin Interface
Super Admin features for API endpoint management and documentation
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from .models import APIEndpoint, APIDocumentation, APIVersion


@admin.register(APIEndpoint)
class APIEndpointAdmin(admin.ModelAdmin):
    """API endpoint management and documentation"""
    list_display = ('path_display', 'method_badge', 'version_badge', 'is_active', 'updated_at')
    list_filter = ('method', 'version', 'is_active', 'created_at')
    search_fields = ('path', 'description')
    readonly_fields = ('created_at', 'updated_at', 'endpoint_summary')
    
    fieldsets = (
        (_('Endpoint Details'), {
            'fields': ('path', 'method', 'version')
        }),
        (_('Description'), {
            'fields': ('description', 'tags'),
            'classes': ('collapse',)
        }),
        (_('Authentication'), {
            'fields': ('requires_auth', 'required_scopes'),
            'classes': ('collapse',)
        }),
        (_('Rate Limiting'), {
            'fields': ('rate_limit_per_minute', 'rate_limit_per_day'),
            'classes': ('collapse',)
        }),
        (_('Status'), {
            'fields': ('is_active', 'deprecated'),
            'classes': ('collapse',)
        }),
        (_('Summary'), {
            'fields': ('endpoint_summary',),
            'classes': ('collapse',)
        }),
        (_('System'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['activate_endpoints', 'deactivate_endpoints', 'mark_deprecated']
    
    def path_display(self, obj):
        return format_html('<code>{}</code>', obj.path)
    path_display.short_description = _('Path')
    
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
    
    def version_badge(self, obj):
        return format_html('<strong>v{}</strong>', obj.version)
    version_badge.short_description = _('Version')
    
    def endpoint_summary(self, obj):
        return format_html(
            '<div>'
            '<p><strong>Method:</strong> {}</p>'
            '<p><strong>Path:</strong> {}</p>'
            '<p><strong>Version:</strong> {}</p>'
            '<p><strong>Auth Required:</strong> {}</p>'
            '<p><strong>Deprecated:</strong> {}</p>'
            '</div>',
            obj.method,
            obj.path,
            obj.version,
            'Yes' if obj.requires_auth else 'No',
            'Yes' if obj.deprecated else 'No'
        )
    endpoint_summary.short_description = _('Summary')
    
    @admin.action(description=_('Activate selected endpoints'))
    def activate_endpoints(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, _('%d endpoints activated') % updated)
    
    @admin.action(description=_('Deactivate selected endpoints'))
    def deactivate_endpoints(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, _('%d endpoints deactivated') % updated)
    
    @admin.action(description=_('Mark as deprecated'))
    def mark_deprecated(self, request, queryset):
        updated = queryset.update(deprecated=True)
        self.message_user(request, _('%d endpoints marked deprecated') % updated)


@admin.register(APIDocumentation)
class APIDocumentationAdmin(admin.ModelAdmin):
    """API documentation and schema management"""
    list_display = ('title', 'endpoint', 'version_badge', 'updated_at')
    list_filter = ('version', 'created_at')
    search_fields = ('title', 'content', 'endpoint__path')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (_('Documentation'), {
            'fields': ('title', 'endpoint', 'version')
        }),
        (_('Content'), {
            'fields': ('description', 'parameters', 'response_schema'),
            'classes': ('collapse',)
        }),
        (_('Examples'), {
            'fields': ('request_example', 'response_example'),
            'classes': ('collapse',)
        }),
    )
    
    def version_badge(self, obj):
        return format_html('<strong>v{}</strong>', obj.version)
    version_badge.short_description = _('Version')


@admin.register(APIVersion)
class APIVersionAdmin(admin.ModelAdmin):
    """API version management"""
    list_display = ('version_number', 'status_badge', 'release_date', 'sunset_date')
    list_filter = ('status', 'release_date')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (_('Version'), {
            'fields': ('version_number', 'status')
        }),
        (_('Dates'), {
            'fields': ('release_date', 'sunset_date')
        }),
        (_('Description'), {
            'fields': ('changelog', 'migration_guide'),
            'classes': ('collapse',)
        }),
    )
    
    def status_badge(self, obj):
        colors = {
            'active': '#7fbc41',
            'deprecated': '#fc8d59',
            'sunset': '#d73026'
        }
        color = colors.get(obj.status, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = _('Status')
