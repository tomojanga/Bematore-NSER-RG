"""
BST (Bematore Screening Token) Admin Interface
Super Admin features for BST token management and cross-operator tracking
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.utils import timezone
from .models import BSTToken, BSTAuditLog


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


@admin.register(BSTAuditLog)
class BSTAuditLogAdmin(admin.ModelAdmin):
    """BST token audit logs for all operations"""
    list_display = (
        'token_short', 'action_badge', 'operator_name',
        'ip_address', 'success_display', 'created_at'
    )
    list_filter = ('action', 'success', 'created_at')
    search_fields = ('bst_token__token', 'operator__name', 'ip_address')
    readonly_fields = ('created_at',)
    
    fieldsets = (
        (_('Action'), {
            'fields': ('bst_token', 'action', 'success')
        }),
        (_('Actor'), {
            'fields': ('performed_by', 'operator')
        }),
        (_('Context'), {
            'fields': ('ip_address', 'user_agent'),
            'classes': ('collapse',)
        }),
        (_('Details'), {
            'fields': ('details', 'error_message'),
            'classes': ('collapse',)
        }),
    )
    
    def token_short(self, obj):
        return format_html('<code>...{}</code>', obj.bst_token.token[-8:])
    token_short.short_description = _('Token')
    
    def operator_name(self, obj):
        return obj.operator.name if obj.operator else 'System'
    operator_name.short_description = _('Operator')
    
    def action_badge(self, obj):
        colors = {
            'generated': '#2166ac',
            'validated': '#7fbc41',
            'used': '#b35806',
            'rotated': '#fc8d59',
            'compromised': '#d73026',
            'deactivated': '#cccccc',
            'lookup': '#f7b6d2',
            'cross_referenced': '#b35806'
        }
        color = colors.get(obj.action, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_action_display()
        )
    action_badge.short_description = _('Action')
    
    def success_display(self, obj):
        if obj.success:
            return format_html('<span style="color: green;">✓ Success</span>')
        return format_html('<span style="color: red;">✗ Failed</span>')
    success_display.short_description = _('Status')
    
    def has_add_permission(self, request):
        """Audit logs are auto-generated"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Keep audit logs immutable"""
        return False
