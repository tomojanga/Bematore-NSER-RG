"""
BST (Bematore Screening Token) Admin Interface
Super Admin features for BST token management and cross-operator tracking
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.utils import timezone
from .models import BSTToken, BSTTokenUsageLog


@admin.register(BSTToken)
class BSTTokenAdmin(admin.ModelAdmin):
    """BST token management for cross-operator player tracking"""
    list_display = (
        'token_value_display', 'user_phone', 'status_badge',
        'created_at', 'is_active_display'
    )
    list_filter = ('status', 'is_active', 'created_at')
    search_fields = ('token_value', 'user__phone_number', 'user__email')
    readonly_fields = (
        'created_at', 'updated_at', 'token_summary'
    )
    
    fieldsets = (
        (_('Token'), {
            'fields': ('token_value', 'user')
        }),
        (_('Status'), {
            'fields': ('status', 'is_active')
        }),
        (_('Statistics'), {
            'fields': ('total_operators_tracked', 'total_screenings'),
            'classes': ('collapse',)
        }),
        (_('Summary'), {
            'fields': ('token_summary',),
            'classes': ('collapse',)
        }),
        (_('System'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def token_value_display(self, obj):
        return format_html('<code>...{}</code>', obj.token_value[-8:])
    token_value_display.short_description = _('Token')
    
    def user_phone(self, obj):
        return obj.user.phone_number if obj.user else 'N/A'
    user_phone.short_description = _('User')
    
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
    
    def is_active_display(self, obj):
        if obj.is_active:
            return format_html('<span style="color: green;">✓ Active</span>')
        return format_html('<span style="color: red;">✗ Inactive</span>')
    is_active_display.short_description = _('Active')
    
    def token_summary(self, obj):
        return format_html(
            '<div>'
            '<p><strong>User:</strong> {}</p>'
            '<p><strong>Status:</strong> {}</p>'
            '<p><strong>Operators Tracked:</strong> {}</p>'
            '<p><strong>Screenings:</strong> {}</p>'
            '</div>',
            obj.user.phone_number if obj.user else 'N/A',
            obj.get_status_display(),
            obj.total_operators_tracked,
            obj.total_screenings
        )
    token_summary.short_description = _('Summary')


@admin.register(BSTTokenUsageLog)
class BSTTokenUsageLogAdmin(admin.ModelAdmin):
    """BST token usage and access logs"""
    list_display = (
        'token_value_short', 'operator_name', 'action_badge',
        'ip_address', 'created_at'
    )
    list_filter = ('action', 'created_at')
    search_fields = ('bst_token__token_value', 'operator__name', 'ip_address')
    readonly_fields = ('created_at',)
    
    fieldsets = (
        (_('Access'), {
            'fields': ('bst_token', 'operator', 'action')
        }),
        (_('IP'), {
            'fields': ('ip_address',),
            'classes': ('collapse',)
        }),
    )
    
    def token_value_short(self, obj):
        return format_html('<code>...{}</code>', obj.bst_token.token_value[-8:])
    token_value_short.short_description = _('Token')
    
    def operator_name(self, obj):
        return obj.operator.name if obj.operator else 'System'
    operator_name.short_description = _('Operator')
    
    def action_badge(self, obj):
        colors = {
            'token_created': '#2166ac',
            'token_used': '#7fbc41',
            'lookup': '#b35806',
            'registration': '#fc8d59'
        }
        color = colors.get(obj.action, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.action.replace('_', ' ').title()
        )
    action_badge.short_description = _('Action')
    
    def has_add_permission(self, request):
        """Usage logs are auto-generated"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Keep usage logs for audit"""
        return False
