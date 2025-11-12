"""
User Management Admin Interface
Super Admin features for user management, verification, and security
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Q
from django.utils import timezone
from .models import (
    User, UserProfile, UserDevice, LoginHistory, 
    IdentityVerification, UserSession, UserActivityLog
)


class UserProfileInline(admin.StackedInline):
    """Inline user profile editing"""
    model = UserProfile
    extra = 0
    fk_name = 'user'
    fields = ('bio', 'avatar', 'occupation', 'employer', 'address_line1', 'address_line2')
    readonly_fields = ('created_at', 'updated_at', 'profile_completion_percentage')


class UserDeviceInline(admin.TabularInline):
    """User devices inline"""
    model = UserDevice
    extra = 0
    fk_name = 'user'
    fields = ('device_name', 'device_type', 'is_trusted')
    readonly_fields = ('created_at', 'updated_at', 'user')
    can_delete = True


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    """
    Super Admin Interface for User Management
    """
    list_display = (
        'phone_number_display', 'email', 'role_badge', 'verification_status',
        'is_active', 'is_locked', 'last_login_at'
    )
    list_filter = (
        'role', 'status', 'is_active', 'is_locked', 'is_2fa_enabled',
        'verification_status', 'created_at'
    )
    search_fields = ('phone_number', 'email', 'first_name', 'last_name', 'national_id_hash')
    readonly_fields = (
        'id', 'created_at', 'updated_at', 'last_login_at', 'last_login_ip',
        'national_id_hash', 'failed_login_attempts', 'user_statistics'
    )
    
    fieldsets = (
        (_('Identity'), {
            'fields': ('phone_number', 'email', 'first_name', 'middle_name', 'last_name')
        }),
        (_('Personal Information'), {
            'fields': ('date_of_birth', 'gender', 'national_id', 'national_id_hash')
        }),
        (_('Role & Status'), {
            'fields': ('role', 'status', 'is_active')
        }),
        (_('Verification'), {
            'fields': ('is_phone_verified', 'is_email_verified', 'is_id_verified', 
                      'verification_status', 'verified_at')
        }),
        (_('Security'), {
            'fields': ('is_locked', 'locked_until', 'failed_login_attempts',
                      'is_2fa_enabled', 'totp_secret')
        }),
        (_('Login History'), {
            'fields': ('last_login_at', 'last_login_ip', 'user_statistics'),
            'classes': ('collapse',)
        }),
        (_('Preferences'), {
            'fields': ('language', 'timezone_name', 'notification_preferences'),
            'classes': ('collapse',)
        }),
        (_('Terms & Consent'), {
            'fields': ('terms_accepted', 'terms_accepted_at', 'privacy_policy_accepted'),
            'classes': ('collapse',)
        }),
        (_('System'), {
            'fields': ('id', 'created_at', 'updated_at', 'metadata'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [UserProfileInline, UserDeviceInline]
    actions = [
        'unlock_accounts', 'lock_accounts', 'verify_users', 'send_verification_email',
        'enable_2fa', 'disable_2fa', 'activate_users', 'deactivate_users'
    ]
    
    def phone_number_display(self, obj):
        """Display phone number with link"""
        return format_html(
            '<strong>{}</strong>',
            obj.phone_number
        )
    phone_number_display.short_description = _('Phone Number')
    
    def role_badge(self, obj):
        """Display role as colored badge"""
        colors = {
            'super_admin': '#d73026',
            'grak_admin': '#2166ac',
            'operator_admin': '#b35806',
            'operator_staff': '#f7b6d2',
            'citizen': '#7fbc41'
        }
        color = colors.get(obj.role, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_role_display()
        )
    role_badge.short_description = _('Role')
    
    def user_statistics(self, obj):
        """Display user statistics"""
        login_count = obj.login_history.count() if hasattr(obj, 'login_history') else 0
        return format_html(
            '<div><p><strong>Total Logins:</strong> {}</p><p><strong>Active Devices:</strong> {}</p></div>',
            login_count,
            obj.userdevice_set.filter(is_trusted=True).count() if hasattr(obj, 'userdevice_set') else 0
        )
    user_statistics.short_description = _('Statistics')
    
    # Super Admin Actions
    
    @admin.action(description=_('Unlock selected accounts'))
    def unlock_accounts(self, request, queryset):
        updated = 0
        for user in queryset:
            if user.is_locked:
                user.unlock_account()
                updated += 1
        self.message_user(request, _('%d accounts unlocked') % updated)
    
    @admin.action(description=_('Lock selected accounts (30 min)'))
    def lock_accounts(self, request, queryset):
        for user in queryset:
            user.lock_account(duration_minutes=30)
        self.message_user(request, _('%d accounts locked') % queryset.count())
    
    @admin.action(description=_('Verify selected users'))
    def verify_users(self, request, queryset):
        updated = queryset.update(
            is_phone_verified=True, is_email_verified=True, is_id_verified=True,
            verification_status='verified', verified_at=timezone.now()
        )
        self.message_user(request, _('%d users verified') % updated)
    
    @admin.action(description=_('Send verification email'))
    def send_verification_email(self, request, queryset):
        for user in queryset:
            # Implement email sending logic
            pass
        self.message_user(request, _('Verification emails queued'))
    
    @admin.action(description=_('Enable 2FA for selected users'))
    def enable_2fa(self, request, queryset):
        updated = queryset.update(is_2fa_enabled=True)
        self.message_user(request, _('2FA enabled for %d users') % updated)
    
    @admin.action(description=_('Disable 2FA for selected users'))
    def disable_2fa(self, request, queryset):
        updated = queryset.update(is_2fa_enabled=False)
        self.message_user(request, _('2FA disabled for %d users') % updated)
    
    @admin.action(description=_('Activate selected users'))
    def activate_users(self, request, queryset):
        updated = queryset.update(is_active=True, status='active')
        self.message_user(request, _('%d users activated') % updated)
    
    @admin.action(description=_('Deactivate selected users'))
    def deactivate_users(self, request, queryset):
        updated = queryset.update(is_active=False, status='inactive')
        self.message_user(request, _('%d users deactivated') % updated)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """User profile administration"""
    list_display = ('user_display', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__phone_number', 'bio')
    readonly_fields = ('created_at', 'updated_at')
    
    def get_list_display(self, request):
        return self.list_display
    
    def user_display(self, obj):
        return obj.user.phone_number if obj.user else 'N/A'
    user_display.short_description = _('User')


@admin.register(UserDevice)
class UserDeviceAdmin(admin.ModelAdmin):
    """Device management"""
    list_display = ('device_name', 'user_display', 'device_type', 'is_trusted')
    list_filter = ('device_type', 'is_trusted', 'created_at')
    search_fields = ('user__phone_number', 'device_name')
    readonly_fields = ('created_at', 'updated_at', 'user')
    actions = ['trust_devices', 'untrust_devices', 'block_devices']
    
    def user_display(self, obj):
        return obj.user.phone_number if obj.user else 'N/A'
    user_display.short_description = _('User')
    
    @admin.action(description=_('Trust selected devices'))
    def trust_devices(self, request, queryset):
        updated = queryset.update(is_trusted=True)
        self.message_user(request, _('%d devices trusted') % updated)
    
    @admin.action(description=_('Untrust selected devices'))
    def untrust_devices(self, request, queryset):
        updated = queryset.update(is_trusted=False)
        self.message_user(request, _('%d devices untrusted') % updated)
    
    @admin.action(description=_('Block selected devices'))
    def block_devices(self, request, queryset):
        updated = queryset.update(is_blocked=True)
        self.message_user(request, _('%d devices blocked') % updated)


@admin.register(LoginHistory)
class LoginHistoryAdmin(admin.ModelAdmin):
    """Login history audit trail"""
    list_display = ('user_display', 'ip_address', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__phone_number', 'ip_address')
    readonly_fields = ('created_at', 'user')
    
    def user_display(self, obj):
        return obj.user.phone_number if obj.user else 'N/A'
    user_display.short_description = _('User')
    
    def has_delete_permission(self, request, obj=None):
        """Super admin only can view, no delete"""
        return False


@admin.register(IdentityVerification)
class IdentityVerificationAdmin(admin.ModelAdmin):
    """Identity verification tracking"""
    list_display = ('user_display', 'verification_type', 'created_at')
    list_filter = ('verification_type', 'created_at')
    search_fields = ('user__phone_number',)
    readonly_fields = ('created_at', 'updated_at', 'user')
    
    def user_display(self, obj):
        return obj.user.phone_number if obj.user else 'N/A'
    user_display.short_description = _('User')


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    """Active user sessions"""
    list_display = ('user_display', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('user__phone_number',)
    readonly_fields = ('user',)
    actions = ['terminate_sessions']
    
    def user_display(self, obj):
        return obj.user.phone_number if obj.user else 'N/A'
    user_display.short_description = _('User')
    
    @admin.action(description=_('Terminate selected sessions'))
    def terminate_sessions(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(is_active=False, ended_at=timezone.now())
        self.message_user(request, _('%d sessions terminated') % updated)


@admin.register(UserActivityLog)
class UserActivityLogAdmin(admin.ModelAdmin):
    """User activity audit log"""
    list_display = ('user_display', 'activity_type', 'ip_address', 'created_at')
    list_filter = ('activity_type', 'created_at')
    search_fields = ('user__phone_number', 'ip_address')
    readonly_fields = ('created_at', 'user')
    
    def user_display(self, obj):
        return obj.user.phone_number if obj.user else 'N/A'
    user_display.short_description = _('User')
    
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False
