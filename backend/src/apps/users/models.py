"""
User Management Models
Comprehensive user system with multi-role support, device tracking, and security features
"""
import hashlib
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.contrib.postgres.fields import ArrayField
from django.utils.translation import gettext_lazy as _
from django.core.validators import RegexValidator
from django.utils import timezone
from phonenumber_field.modelfields import PhoneNumberField

from apps.core.models import (
    BaseModel, TimeStampedModel, UUIDModel, GeoLocationModel,
    StatusChoices, UserRoleChoices, CountryChoices, LanguageChoices,
    VerificationStatusChoices, BaseModelManager
)


class UserManager(BaseUserManager):
    """Custom user manager for email and phone authentication"""
    
    def create_user(self, phone_number, password=None, **extra_fields):
        """Create and save a regular user"""
        if not phone_number:
            raise ValueError('Phone number is required')
        
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        
        user = self.model(phone_number=phone_number, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, phone_number, password=None, **extra_fields):
        """Create and save a superuser"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', UserRoleChoices.SUPER_ADMIN)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True')
        
        return self.create_user(phone_number, password, **extra_fields)
    
    def active_users(self):
        """Get all active users"""
        return self.filter(is_active=True, is_deleted=False)
    
    def by_role(self, role):
        """Get users by role"""
        return self.filter(role=role, is_active=True, is_deleted=False)


class User(AbstractBaseUser, PermissionsMixin, BaseModel, GeoLocationModel):
    """
    Custom User model with phone-based authentication and comprehensive tracking.
    Supports multiple roles: GRAK staff, Operators, Citizens, Bematore admin.
    """
    
    # Phone validator
    phone_regex = RegexValidator(
        regex=r'^\+?254?[17]\d{8}$',
        message="Phone number must be entered in format: '+254712345678'"
    )
    
    # Core Identity
    phone_number = PhoneNumberField(
        _('phone number'),
        unique=True,
        db_index=True,
        help_text=_('Primary phone number (login credential)')
    )
    email = models.EmailField(
        _('email address'),
        unique=True,
        null=True,
        blank=True,
        db_index=True,
        help_text=_('Email address (optional)')
    )
    
    # Personal Information
    first_name = models.CharField(
        _('first name'),
        max_length=150,
        blank=True
    )
    last_name = models.CharField(
        _('last name'),
        max_length=150,
        blank=True
    )
    middle_name = models.CharField(
        _('middle name'),
        max_length=150,
        blank=True
    )
    date_of_birth = models.DateField(
        _('date of birth'),
        null=True,
        blank=True,
        db_index=True,
        help_text=_('Date of birth for age verification')
    )
    gender = models.CharField(
        _('gender'),
        max_length=1,
        choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other'), ('N', 'Prefer not to say')],
        blank=True
    )
    
    # National ID Information (Encrypted)
    national_id = models.CharField(
        _('national ID number'),
        max_length=255,  # Encrypted, will be longer
        unique=True,
        null=True,
        blank=True,
        db_index=True,
        help_text=_('National ID number (encrypted)')
    )
    national_id_hash = models.CharField(
        _('national ID hash'),
        max_length=64,
        unique=True,
        null=True,
        blank=True,
        db_index=True,
        help_text=_('SHA-256 hash of national ID for duplicate detection')
    )
    
    # Role & Status
    role = models.CharField(
        _('role'),
        max_length=50,
        choices=UserRoleChoices.choices,
        default=UserRoleChoices.CITIZEN,
        db_index=True,
        help_text=_('User role in the system')
    )
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.ACTIVE,
        db_index=True
    )
    
    # Verification
    is_phone_verified = models.BooleanField(
        _('phone verified'),
        default=False,
        db_index=True
    )
    is_email_verified = models.BooleanField(
        _('email verified'),
        default=False
    )
    is_id_verified = models.BooleanField(
        _('ID verified'),
        default=False,
        db_index=True
    )
    verification_status = models.CharField(
        _('verification status'),
        max_length=20,
        choices=VerificationStatusChoices.choices,
        default=VerificationStatusChoices.UNVERIFIED,
        db_index=True
    )
    verified_at = models.DateTimeField(
        _('verified at'),
        null=True,
        blank=True
    )
    
    # Preferences
    language = models.CharField(
        _('preferred language'),
        max_length=10,
        choices=LanguageChoices.choices,
        default=LanguageChoices.ENGLISH
    )
    timezone_name = models.CharField(
        _('timezone'),
        max_length=50,
        default='Africa/Nairobi'
    )
    notification_preferences = models.JSONField(
        _('notification preferences'),
        default=dict,
        blank=True,
        help_text=_('SMS, email, push notification preferences')
    )
    
    # Security
    is_active = models.BooleanField(
        _('active'),
        default=True,
        help_text=_('Designates whether this user should be treated as active')
    )
    is_staff = models.BooleanField(
        _('staff status'),
        default=False,
        help_text=_('Designates whether the user can log into admin site')
    )
    is_locked = models.BooleanField(
        _('account locked'),
        default=False,
        db_index=True,
        help_text=_('Account locked due to failed login attempts')
    )
    locked_until = models.DateTimeField(
        _('locked until'),
        null=True,
        blank=True
    )
    failed_login_attempts = models.PositiveIntegerField(
        _('failed login attempts'),
        default=0
    )
    last_login_at = models.DateTimeField(
        _('last login'),
        null=True,
        blank=True
    )
    last_login_ip = models.GenericIPAddressField(
        _('last login IP'),
        null=True,
        blank=True
    )
    
    # 2FA
    is_2fa_enabled = models.BooleanField(
        _('2FA enabled'),
        default=False
    )
    totp_secret = models.CharField(
        _('TOTP secret'),
        max_length=255,
        blank=True,
        help_text=_('Encrypted TOTP secret for 2FA')
    )
    backup_codes = ArrayField(
        models.CharField(max_length=20),
        default=list,
        blank=True,
        help_text=_('Backup codes for 2FA recovery')
    )
    
    # Terms & Consent
    terms_accepted = models.BooleanField(
        _('terms accepted'),
        default=False
    )
    terms_accepted_at = models.DateTimeField(
        _('terms accepted at'),
        null=True,
        blank=True
    )
    privacy_policy_accepted = models.BooleanField(
        _('privacy policy accepted'),
        default=False
    )
    
    # Metadata
    metadata = models.JSONField(
        _('metadata'),
        default=dict,
        blank=True,
        help_text=_('Additional metadata for flexibility')
    )
    
    objects = UserManager()
    
    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = []  # phone_number is already USERNAME_FIELD
    
    class Meta:
        db_table = 'users'
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['phone_number', 'is_active'], name='user_phone_active_idx'),
            models.Index(fields=['email', 'is_active'], name='user_email_active_idx'),
            models.Index(fields=['role', 'status'], name='user_role_status_idx'),
            models.Index(fields=['verification_status'], name='user_verification_idx'),
            models.Index(fields=['is_locked', 'locked_until'], name='user_locked_idx'),
        ]
    
    def __str__(self):
        return f"{self.get_full_name() or self.phone_number}"
    
    def get_full_name(self):
        """Return full name"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.middle_name} {self.last_name}".strip()
        return ''
    
    def get_short_name(self):
        """Return short name"""
        return self.first_name or str(self.phone_number)
    
    @property
    def age(self):
        """Calculate age from date of birth"""
        if not self.date_of_birth:
            return None
        today = timezone.now().date()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )
    
    @property
    def is_adult(self):
        """Check if user is 18 or older"""
        age = self.age
        return age >= 18 if age else False
    
    @property
    def is_verified(self):
        """Check if user is fully verified"""
        return all([
            self.is_phone_verified,
            self.is_id_verified,
            self.verification_status == VerificationStatusChoices.VERIFIED
        ])
    
    def set_national_id(self, national_id_plain):
        """Set national ID with encryption and hashing"""
        from apps.core.utils.encryption import encrypt_data
        from apps.core.utils.hashing import hash_data
        
        self.national_id = encrypt_data(national_id_plain)
        self.national_id_hash = hash_data(national_id_plain, algorithm='sha256')
    
    def get_national_id(self):
        """Decrypt and return national ID"""
        from apps.core.utils.encryption import decrypt_data
        return decrypt_data(self.national_id) if self.national_id else None
    
    def lock_account(self, duration_minutes=30):
        """Lock user account for specified duration"""
        self.is_locked = True
        self.locked_until = timezone.now() + timezone.timedelta(minutes=duration_minutes)
        self.save(update_fields=['is_locked', 'locked_until'])
    
    def unlock_account(self):
        """Unlock user account"""
        self.is_locked = False
        self.locked_until = None
        self.failed_login_attempts = 0
        self.save(update_fields=['is_locked', 'locked_until', 'failed_login_attempts'])
    
    def record_login(self, ip_address=None):
        """Record successful login"""
        self.last_login_at = timezone.now()
        self.last_login_ip = ip_address
        self.failed_login_attempts = 0
        self.save(update_fields=['last_login_at', 'last_login_ip', 'failed_login_attempts'])
    
    def record_failed_login(self):
        """Record failed login attempt"""
        self.failed_login_attempts += 1
        if self.failed_login_attempts >= 5:
            self.lock_account(duration_minutes=30)
        self.save(update_fields=['failed_login_attempts'])


# Import extended models to make them available from this module
from .models_extended import (
    UserProfile,
    UserDevice,
    LoginHistory,
    IdentityVerification,
    UserSession,
    UserActivityLog
)

__all__ = [
    'User',
    'UserManager',
    'UserProfile',
    'UserDevice',
    'LoginHistory',
    'IdentityVerification',
    'UserSession',
    'UserActivityLog'
]
