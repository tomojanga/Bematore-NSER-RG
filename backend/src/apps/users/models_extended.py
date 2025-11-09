"""
Extended User Models
Device tracking, login history, profiles, and verification
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone

from apps.core.models import (
    BaseModel, TimeStampedModel, UUIDModel,
    StatusChoices, VerificationStatusChoices
)


class UserProfile(BaseModel):
    """
    Extended user profile with additional information
    """
    user = models.OneToOneField(
        'users.User',
        on_delete=models.CASCADE,
        related_name='profile'
    )
    
    # Profile Picture
    avatar = models.ImageField(
        _('avatar'),
        upload_to='avatars/%Y/%m/%d/',
        null=True,
        blank=True
    )
    
    # Bio & Social
    bio = models.TextField(
        _('bio'),
        blank=True,
        max_length=500
    )
    occupation = models.CharField(
        _('occupation'),
        max_length=100,
        blank=True
    )
    employer = models.CharField(
        _('employer'),
        max_length=100,
        blank=True
    )
    
    # Contact
    secondary_phone = models.CharField(
        _('secondary phone'),
        max_length=20,
        blank=True
    )
    secondary_email = models.EmailField(
        _('secondary email'),
        blank=True
    )
    
    # Address
    address_line1 = models.CharField(
        _('address line 1'),
        max_length=255,
        blank=True
    )
    address_line2 = models.CharField(
        _('address line 2'),
        max_length=255,
        blank=True
    )
    
    # Emergency Contact
    emergency_contact_name = models.CharField(
        _('emergency contact name'),
        max_length=150,
        blank=True
    )
    emergency_contact_phone = models.CharField(
        _('emergency contact phone'),
        max_length=20,
        blank=True
    )
    emergency_contact_relationship = models.CharField(
        _('emergency contact relationship'),
        max_length=50,
        blank=True
    )
    
    # Profile Completion
    profile_completion_percentage = models.PositiveSmallIntegerField(
        _('profile completion'),
        default=0,
        help_text=_('Percentage of profile fields filled')
    )
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = _('User Profile')
        verbose_name_plural = _('User Profiles')
    
    def __str__(self):
        return f"Profile for {self.user}"
    
    def calculate_completion(self):
        """Calculate profile completion percentage"""
        fields = [
            'avatar', 'bio', 'occupation', 'address_line1',
            'emergency_contact_name', 'emergency_contact_phone'
        ]
        filled = sum(1 for field in fields if getattr(self, field))
        self.profile_completion_percentage = int((filled / len(fields)) * 100)
        return self.profile_completion_percentage


class UserDevice(BaseModel):
    """
    Track user devices for security and fraud detection
    """
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='devices'
    )
    
    # Device Information
    device_id = models.CharField(
        _('device ID'),
        max_length=255,
        unique=True,
        db_index=True,
        help_text=_('Unique device identifier')
    )
    device_name = models.CharField(
        _('device name'),
        max_length=100,
        blank=True
    )
    device_type = models.CharField(
        _('device type'),
        max_length=20,
        choices=[
            ('mobile', 'Mobile'),
            ('tablet', 'Tablet'),
            ('desktop', 'Desktop'),
            ('other', 'Other')
        ],
        default='mobile'
    )
    os_name = models.CharField(
        _('OS name'),
        max_length=50,
        blank=True
    )
    os_version = models.CharField(
        _('OS version'),
        max_length=50,
        blank=True
    )
    browser_name = models.CharField(
        _('browser name'),
        max_length=50,
        blank=True
    )
    browser_version = models.CharField(
        _('browser version'),
        max_length=50,
        blank=True
    )
    
    # Security
    is_trusted = models.BooleanField(
        _('trusted device'),
        default=False,
        db_index=True
    )
    trusted_at = models.DateTimeField(
        _('trusted at'),
        null=True,
        blank=True
    )
    is_blocked = models.BooleanField(
        _('blocked'),
        default=False,
        db_index=True
    )
    blocked_reason = models.TextField(
        _('blocked reason'),
        blank=True
    )
    
    # Usage
    first_seen_at = models.DateTimeField(
        _('first seen'),
        auto_now_add=True
    )
    last_seen_at = models.DateTimeField(
        _('last seen'),
        null=True,
        blank=True
    )
    login_count = models.PositiveIntegerField(
        _('login count'),
        default=0
    )
    
    # Location
    last_ip_address = models.GenericIPAddressField(
        _('last IP address'),
        null=True,
        blank=True
    )
    last_location_country = models.CharField(
        _('last location country'),
        max_length=2,
        blank=True
    )
    last_location_city = models.CharField(
        _('last location city'),
        max_length=100,
        blank=True
    )
    
    class Meta:
        db_table = 'user_devices'
        verbose_name = _('User Device')
        verbose_name_plural = _('User Devices')
        ordering = ['-last_seen_at']
        indexes = [
            models.Index(fields=['user', 'is_trusted'], name='device_user_trust_idx'),
            models.Index(fields=['device_id', 'is_blocked'], name='device_id_block_idx'),
        ]
    
    def __str__(self):
        return f"{self.device_name or self.device_id} - {self.user}"


class LoginHistory(TimeStampedModel, UUIDModel):
    """
    Comprehensive login history for audit and security
    """
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='login_history'
    )
    device = models.ForeignKey(
        'UserDevice',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='logins'
    )
    
    # Login Details
    login_at = models.DateTimeField(
        _('login at'),
        auto_now_add=True,
        db_index=True
    )
    logout_at = models.DateTimeField(
        _('logout at'),
        null=True,
        blank=True
    )
    session_duration = models.DurationField(
        _('session duration'),
        null=True,
        blank=True
    )
    
    # Status
    login_successful = models.BooleanField(
        _('login successful'),
        default=True,
        db_index=True
    )
    failure_reason = models.CharField(
        _('failure reason'),
        max_length=255,
        blank=True
    )
    
    # Authentication Method
    auth_method = models.CharField(
        _('authentication method'),
        max_length=20,
        choices=[
            ('password', 'Password'),
            ('otp', 'OTP'),
            ('2fa', 'Two-Factor Auth'),
            ('biometric', 'Biometric'),
            ('api_key', 'API Key')
        ],
        default='password'
    )
    
    # Location & Device
    ip_address = models.GenericIPAddressField(
        _('IP address'),
        db_index=True
    )
    user_agent = models.TextField(
        _('user agent'),
        blank=True
    )
    country_code = models.CharField(
        _('country code'),
        max_length=2,
        blank=True,
        db_index=True
    )
    city = models.CharField(
        _('city'),
        max_length=100,
        blank=True
    )
    latitude = models.DecimalField(
        _('latitude'),
        max_digits=10,
        decimal_places=8,
        null=True,
        blank=True
    )
    longitude = models.DecimalField(
        _('longitude'),
        max_digits=11,
        decimal_places=8,
        null=True,
        blank=True
    )
    
    # Risk Assessment
    risk_score = models.DecimalField(
        _('risk score'),
        max_digits=5,
        decimal_places=2,
        default=0.0,
        help_text=_('Calculated risk score (0-100)')
    )
    is_suspicious = models.BooleanField(
        _('suspicious'),
        default=False,
        db_index=True
    )
    suspicious_reasons = ArrayField(
        models.CharField(max_length=100),
        default=list,
        blank=True
    )
    
    class Meta:
        db_table = 'login_history'
        verbose_name = _('Login History')
        verbose_name_plural = _('Login Histories')
        ordering = ['-login_at']
        indexes = [
            models.Index(fields=['user', 'login_at'], name='login_user_time_idx'),
            models.Index(fields=['ip_address', 'login_at'], name='login_ip_time_idx'),
            models.Index(fields=['is_suspicious'], name='login_suspicious_idx'),
        ]
    
    def __str__(self):
        return f"Login - {self.user} at {self.login_at}"


class IdentityVerification(BaseModel):
    """
    Identity verification records for KYC compliance
    """
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='verifications'
    )
    
    # Verification Type
    verification_type = models.CharField(
        _('verification type'),
        max_length=20,
        choices=[
            ('phone', 'Phone Number'),
            ('email', 'Email Address'),
            ('national_id', 'National ID'),
            ('passport', 'Passport'),
            ('biometric', 'Biometric'),
            ('iprs', 'IPRS Integration')
        ],
        db_index=True
    )
    
    # Status
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=VerificationStatusChoices.choices,
        default=VerificationStatusChoices.PENDING,
        db_index=True
    )
    
    # Verification Data (Encrypted)
    verification_data = models.JSONField(
        _('verification data'),
        default=dict,
        blank=True,
        help_text=_('Encrypted verification data')
    )
    
    # OTP/Codes
    verification_code = models.CharField(
        _('verification code'),
        max_length=10,
        blank=True
    )
    code_expires_at = models.DateTimeField(
        _('code expires at'),
        null=True,
        blank=True
    )
    attempts = models.PositiveSmallIntegerField(
        _('attempts'),
        default=0
    )
    max_attempts = models.PositiveSmallIntegerField(
        _('max attempts'),
        default=3
    )
    
    # Results
    verified_at = models.DateTimeField(
        _('verified at'),
        null=True,
        blank=True
    )
    expires_at = models.DateTimeField(
        _('expires at'),
        null=True,
        blank=True,
        help_text=_('Verification expiry date')
    )
    verified_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verifications_performed'
    )
    failure_reason = models.TextField(
        _('failure reason'),
        blank=True
    )
    
    # External References
    external_reference = models.CharField(
        _('external reference'),
        max_length=255,
        blank=True,
        help_text=_('External system reference (e.g., IPRS reference)')
    )
    
    class Meta:
        db_table = 'identity_verifications'
        verbose_name = _('Identity Verification')
        verbose_name_plural = _('Identity Verifications')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'verification_type'], name='verif_user_type_idx'),
            models.Index(fields=['status', 'created_at'], name='verif_status_time_idx'),
        ]
    
    def __str__(self):
        return f"{self.verification_type} - {self.user} - {self.status}"
    
    def is_valid(self):
        """Check if verification is still valid"""
        if self.status != VerificationStatusChoices.VERIFIED:
            return False
        if self.expires_at and self.expires_at < timezone.now():
            return False
        return True
    
    def generate_code(self, length=6):
        """Generate verification code"""
        import random
        import string
        code = ''.join(random.choices(string.digits, k=length))
        self.verification_code = code
        self.code_expires_at = timezone.now() + timezone.timedelta(minutes=10)
        self.save()
        return code
    
    def verify_code(self, code):
        """Verify entered code"""
        if self.attempts >= self.max_attempts:
            self.status = VerificationStatusChoices.FAILED
            self.failure_reason = 'Maximum attempts exceeded'
            self.save()
            return False
        
        self.attempts += 1
        
        if self.code_expires_at and self.code_expires_at < timezone.now():
            self.status = VerificationStatusChoices.EXPIRED
            self.failure_reason = 'Code expired'
            self.save()
            return False
        
        if self.verification_code == code:
            self.status = VerificationStatusChoices.VERIFIED
            self.verified_at = timezone.now()
            self.save()
            return True
        
        self.save()
        return False


class UserSession(TimeStampedModel, UUIDModel):
    """
    Active user sessions for single sign-on and session management
    """
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    device = models.ForeignKey(
        'UserDevice',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # Session Data
    session_key = models.CharField(
        _('session key'),
        max_length=255,
        unique=True,
        db_index=True
    )
    session_data = models.JSONField(
        _('session data'),
        default=dict,
        blank=True
    )
    
    # Validity
    is_active = models.BooleanField(
        _('active'),
        default=True,
        db_index=True
    )
    expires_at = models.DateTimeField(
        _('expires at'),
        db_index=True
    )
    last_activity_at = models.DateTimeField(
        _('last activity'),
        auto_now=True
    )
    
    # Location
    ip_address = models.GenericIPAddressField(
        _('IP address')
    )
    user_agent = models.TextField(
        _('user agent'),
        blank=True
    )
    
    class Meta:
        db_table = 'user_sessions'
        verbose_name = _('User Session')
        verbose_name_plural = _('User Sessions')
        ordering = ['-last_activity_at']
        indexes = [
            models.Index(fields=['user', 'is_active'], name='session_user_active_idx'),
            models.Index(fields=['session_key'], name='session_key_idx'),
            models.Index(fields=['expires_at'], name='session_expires_idx'),
        ]
    
    def __str__(self):
        return f"Session - {self.user} - {self.session_key[:10]}"
    
    def is_valid(self):
        """Check if session is still valid"""
        return self.is_active and self.expires_at > timezone.now()
    
    def terminate(self):
        """Terminate session"""
        self.is_active = False
        self.save()


class UserActivityLog(TimeStampedModel, UUIDModel):
    """
    Comprehensive activity logging for audit trail
    """
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='activity_logs'
    )
    
    # Activity Details
    activity_type = models.CharField(
        _('activity type'),
        max_length=50,
        db_index=True,
        help_text=_('Type of activity performed')
    )
    action = models.CharField(
        _('action'),
        max_length=100,
        db_index=True
    )
    description = models.TextField(
        _('description'),
        blank=True
    )
    
    # Activity Data
    activity_data = models.JSONField(
        _('activity data'),
        default=dict,
        blank=True,
        help_text=_('Additional activity metadata')
    )
    
    # Context
    ip_address = models.GenericIPAddressField(
        _('IP address'),
        null=True,
        blank=True
    )
    user_agent = models.TextField(
        _('user agent'),
        blank=True
    )
    
    # Status
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=[
            ('success', 'Success'),
            ('failed', 'Failed'),
            ('pending', 'Pending')
        ],
        default='success',
        db_index=True
    )
    
    class Meta:
        db_table = 'user_activity_logs'
        verbose_name = _('User Activity Log')
        verbose_name_plural = _('User Activity Logs')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'activity_type'], name='activity_user_type_idx'),
            models.Index(fields=['activity_type', 'created_at'], name='activity_type_time_idx'),
        ]
    
    def __str__(self):
        return f"{self.user} - {self.activity_type} - {self.action}"
