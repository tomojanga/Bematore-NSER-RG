"""
Dashboards Admin Interface
Super Admin configuration for dashboard layouts and widget management
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from .models import DashboardLayout, DashboardWidget, UserDashboardPreference


@admin.register(DashboardLayout)
class DashboardLayoutAdmin(admin.ModelAdmin):
    """Dashboard layout configuration"""
    list_display = ('layout_name', 'role_badge', 'is_default', 'widget_count', 'updated_at')
    list_filter = ('role', 'is_default', 'updated_at')
    search_fields = ('layout_name', 'role')
    readonly_fields = ('created_at', 'updated_at', 'layout_summary')
    
    fieldsets = (
        (_('Layout Details'), {
            'fields': ('layout_name', 'role', 'description')
        }),
        (_('Configuration'), {
            'fields': ('layout_grid', 'color_scheme', 'is_default')
        }),
        (_('Summary'), {
            'fields': ('layout_summary',),
            'classes': ('collapse',)
        }),
        (_('System'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['set_as_default', 'unset_default']
    
    def role_badge(self, obj):
        colors = {
            'super_admin': '#d73026',
            'grak_admin': '#2166ac',
            'operator_admin': '#b35806',
            'citizen': '#7fbc41'
        }
        color = colors.get(obj.role, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_role_display()
        )
    role_badge.short_description = _('Role')
    
    def widget_count(self, obj):
        return obj.widgets.count()
    widget_count.short_description = _('Widgets')
    
    def layout_summary(self, obj):
        return format_html(
            '<div>'
            '<p><strong>Layout:</strong> {}</p>'
            '<p><strong>Role:</strong> {}</p>'
            '<p><strong>Widgets:</strong> {}</p>'
            '<p><strong>Default:</strong> {}</p>'
            '</div>',
            obj.layout_name,
            obj.get_role_display(),
            obj.widgets.count(),
            'Yes' if obj.is_default else 'No'
        )
    layout_summary.short_description = _('Summary')
    
    @admin.action(description=_('Set as default layout'))
    def set_as_default(self, request, queryset):
        role = queryset.first().role if queryset.exists() else None
        if role:
            DashboardLayout.objects.filter(role=role).update(is_default=False)
            updated = queryset.update(is_default=True)
            self.message_user(request, _('%d layouts set as default') % updated)
    
    @admin.action(description=_('Unset default layout'))
    def unset_default(self, request, queryset):
        updated = queryset.update(is_default=False)
        self.message_user(request, _('%d layouts unset as default') % updated)


@admin.register(DashboardWidget)
class DashboardWidgetAdmin(admin.ModelAdmin):
    """Dashboard widget configuration"""
    list_display = ('widget_name', 'widget_type_badge', 'layout_name', 'position', 'is_active')
    list_filter = ('widget_type', 'is_active', 'layout__role')
    search_fields = ('widget_name', 'layout__layout_name')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (_('Widget Details'), {
            'fields': ('widget_name', 'layout', 'widget_type')
        }),
        (_('Position'), {
            'fields': ('position', 'width', 'height')
        }),
        (_('Configuration'), {
            'fields': ('config', 'data_source'),
            'classes': ('collapse',)
        }),
        (_('Status'), {
            'fields': ('is_active',)
        }),
    )
    
    def widget_type_badge(self, obj):
        colors = {
            'chart': '#2166ac',
            'table': '#7fbc41',
            'metric': '#b35806',
            'list': '#fc8d59'
        }
        color = colors.get(obj.widget_type, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_widget_type_display()
        )
    widget_type_badge.short_description = _('Type')
    
    def layout_name(self, obj):
        return obj.layout.layout_name
    layout_name.short_description = _('Layout')


@admin.register(UserDashboardPreference)
class UserDashboardPreferenceAdmin(admin.ModelAdmin):
    """User dashboard customization preferences"""
    list_display = ('user_phone', 'layout_name', 'theme_badge', 'last_updated')
    list_filter = ('layout__role', 'theme', 'last_updated')
    search_fields = ('user__phone_number', 'layout__layout_name')
    readonly_fields = ('last_updated',)
    
    fieldsets = (
        (_('User'), {
            'fields': ('user',)
        }),
        (_('Preference'), {
            'fields': ('layout', 'theme')
        }),
        (_('Customization'), {
            'fields': ('widget_visibility', 'custom_layout'),
            'classes': ('collapse',)
        }),
    )
    
    def user_phone(self, obj):
        return obj.user.phone_number
    user_phone.short_description = _('User')
    
    def layout_name(self, obj):
        return obj.layout.layout_name if obj.layout else 'Default'
    layout_name.short_description = _('Layout')
    
    def theme_badge(self, obj):
        colors = {
            'light': '#ffffff',
            'dark': '#2c3e50',
            'blue': '#2166ac',
            'green': '#7fbc41'
        }
        color = colors.get(obj.theme, '#cccccc')
        text_color = 'white' if obj.theme == 'dark' else 'black'
        return format_html(
            '<span style="background-color: {}; color: {}; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, text_color, obj.get_theme_display()
        )
    theme_badge.short_description = _('Theme')
