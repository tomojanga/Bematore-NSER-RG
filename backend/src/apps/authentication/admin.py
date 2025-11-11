"""
Authentication Admin Interface
Super Admin features for authentication, tokens, and 2FA management
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.utils import timezone
from django.contrib.auth.models import Group
from .models import OAuthApplication, RefreshToken, TwoFactorAuth, DeviceTrust, TokenBlacklist


@admin.register(OAuthApplication)
class OAuthApplicationAdmin(admin.ModelAdmin):
    """OAuth application management"""
    list_display = ('client_id_display', 'user_phone', 'authorization_grant_type', 'is_active')
    list_filter = ('authorization_grant_type', 'created_at', 'updated_at')
    search_fields = ('client_id', 'user__phone_number')
    readonly_fields = (
        'client_id', 'created_at', 'updated_at', 'client_secret_display'
    )
    
    fieldsets = (
        (_('Application Details'), {
            'fields': ('user', 'name', 'client_type')
        }),
        (_('OAuth Configuration'), {
            'fields': (
                'authorization_grant_type', 'redirect_uris', 'client_id',
                'client_secret_display'
            )
        }),
        (_('Settings'), {
            'fields': ('skip_authorization', 'is_active')
        }),
        (_('Scopes'), {
            'fields': ('scopes',)
        }),
        (_('System'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['activate_applications', 'deactivate_applications']
    
    def client_id_display(self, obj):
        return format_html(
            '<code>{}</code>',
            obj.client_id[:20] + '...' if len(obj.client_id) > 20 else obj.client_id
        )
    client_id_display.short_description = _('Client ID')
    
    def user_phone(self, obj):
        return obj.user.phone_number if obj.user else 'N/A'
    user_phone.short_description = _('User')
    
    def client_secret_display(self, obj):
        return format_html(
            '<code style="color: red;">***HIDDEN*** (Never show in admin for security)</code>'
        )
    client_secret_display.short_description = _('Client Secret')
    
    @admin.action(description=_('Activate applications'))
    def activate_applications(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, _('%d applications activated') % updated)
    
    @admin.action(description=_('Deactivate applications'))
    def deactivate_applications(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, _('%d applications deactivated') % updated)


@admin.register(RefreshToken)
class RefreshTokenAdmin(admin.ModelAdmin):
    """Refresh token management"""
    list_display = (
        'user_phone', 'token_display', 'is_revoked', 'expires_at'
    )
    list_filter = ('is_revoked', 'expires_at', 'created_at')
    search_fields = ('user__phone_number',)
    readonly_fields = ('created_at', 'updated_at', 'token_summary')
    
    fieldsets = (
        (_('Token Details'), {
            'fields': ('user', 'token')
        }),
        (_('Status'), {
            'fields': ('is_revoked', 'expires_at')
        }),
        (_('Device Info'), {
            'fields': ('device_id', 'ip_address', 'user_agent'),
            'classes': ('collapse',)
        }),
        (_('Summary'), {
            'fields': ('token_summary',),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['revoke_tokens', 'activate_tokens']
    
    def user_phone(self, obj):
        return obj.user.phone_number
    user_phone.short_description = _('User')
    
    def token_display(self, obj):
        return format_html(
            '<code>...{}</code>',
            obj.token[-10:] if obj.token else 'N/A'
        )
    token_display.short_description = _('Token')
    
    def token_summary(self, obj):
        return format_html(
            '<div>'
            '<p><strong>Issued:</strong> {}</p>'
            '<p><strong>Expires:</strong> {}</p>'
            '<p><strong>Revoked:</strong> {}</p>'
            '</div>',
            obj.created_at,
            obj.expires_at,
            'Yes' if obj.is_revoked else 'No'
        )
    token_summary.short_description = _('Summary')
    
    @admin.action(description=_('Revoke selected tokens'))
    def revoke_tokens(self, request, queryset):
        updated = queryset.update(is_revoked=True)
        self.message_user(request, _('%d tokens revoked') % updated)
    
    @admin.action(description=_('Activate selected tokens'))
    def activate_tokens(self, request, queryset):
        updated = queryset.update(is_revoked=False)
        self.message_user(request, _('%d tokens activated') % updated)


@admin.register(TwoFactorAuth)
class TwoFactorAuthAdmin(admin.ModelAdmin):
    """2FA management"""
    list_display = ('user_phone', 'method_badge', 'is_enabled', 'created_at')
    list_filter = ('method', 'is_enabled', 'created_at')
    search_fields = ('user__phone_number',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (_('User'), {
            'fields': ('user',)
        }),
        (_('2FA Settings'), {
            'fields': ('method', 'is_enabled')
        }),
        (_('Configuration'), {
            'fields': ('secret_key', 'backup_codes', 'verified'),
            'classes': ('collapse',)
        }),
        (_('System'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['enable_2fa', 'disable_2fa']
    
    def user_phone(self, obj):
        return obj.user.phone_number
    user_phone.short_description = _('User')
    
    def method_badge(self, obj):
        colors = {
            'totp': '#2166ac',
            'sms': '#7fbc41',
            'email': '#b35806'
        }
        color = colors.get(obj.method, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_method_display()
        )
    method_badge.short_description = _('Method')
    
    @admin.action(description=_('Enable 2FA'))
    def enable_2fa(self, request, queryset):
        updated = queryset.update(is_enabled=True)
        self.message_user(request, _('2FA enabled for %d users') % updated)
    
    @admin.action(description=_('Disable 2FA'))
    def disable_2fa(self, request, queryset):
        updated = queryset.update(is_enabled=False)
        self.message_user(request, _('2FA disabled for %d users') % updated)


@admin.register(DeviceTrust)
class DeviceTrustAdmin(admin.ModelAdmin):
    """Trusted device management"""
    list_display = ('user_phone', 'device_name', 'is_trusted', 'last_seen')
    list_filter = ('is_trusted', 'created_at')
    search_fields = ('user__phone_number', 'device_name')
    readonly_fields = ('created_at', 'updated_at')
    
    actions = ['trust_devices', 'untrust_devices', 'revoke_trust']
    
    def user_phone(self, obj):
        return obj.user.phone_number
    user_phone.short_description = _('User')
    
    @admin.action(description=_('Trust devices'))
    def trust_devices(self, request, queryset):
        updated = queryset.update(is_trusted=True)
        self.message_user(request, _('%d devices trusted') % updated)
    
    @admin.action(description=_('Untrust devices'))
    def untrust_devices(self, request, queryset):
        updated = queryset.update(is_trusted=False)
        self.message_user(request, _('%d devices untrusted') % updated)
    
    @admin.action(description=_('Revoke trust'))
    def revoke_trust(self, request, queryset):
        updated = queryset.update(is_trusted=False, revoked_at=timezone.now())
        self.message_user(request, _('Trust revoked for %d devices') % updated)


@admin.register(TokenBlacklist)
class TokenBlacklistAdmin(admin.ModelAdmin):
    """Token blacklist (revoked tokens)"""
    list_display = ('user_phone', 'token_type', 'blacklisted_at')
    list_filter = ('token_type', 'blacklisted_at')
    search_fields = ('user__phone_number',)
    readonly_fields = ('blacklisted_at',)
    
    def user_phone(self, obj):
        return obj.user.phone_number
    user_phone.short_description = _('User')
    
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False
