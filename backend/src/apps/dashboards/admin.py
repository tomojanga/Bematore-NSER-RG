"""
Dashboards Admin Interface
Super Admin configuration for dashboard widgets
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from .models import DashboardWidget


@admin.register(DashboardWidget)
class DashboardWidgetAdmin(admin.ModelAdmin):
    """Dashboard widget configuration"""
    list_display = ('widget_type_badge', 'user', 'position_x', 'position_y', 'width', 'height', 'is_visible')
    list_filter = ('widget_type', 'is_visible', 'created_at')
    search_fields = ('user__phone_number', 'widget_type')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (_('Widget Details'), {
            'fields': ('user', 'widget_type')
        }),
        (_('Position'), {
            'fields': ('position_x', 'position_y', 'width', 'height')
        }),
        (_('Configuration'), {
            'fields': ('config',),
            'classes': ('collapse',)
        }),
        (_('Status'), {
            'fields': ('is_visible',)
        }),
        (_('System'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def widget_type_badge(self, obj):
        colors = {
            'exclusion_stats': '#2166ac',
            'risk_distribution': '#7fbc41',
            'operator_compliance': '#b35806',
            'api_performance': '#fc8d59',
            'recent_activities': '#d73026'
        }
        color = colors.get(obj.widget_type, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_widget_type_display()
        )
    widget_type_badge.short_description = _('Type')
