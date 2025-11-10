"""
Core Abstract Base Models
Google/Amazon-level production-ready base classes for NSER-RG System
"""
import uuid
from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.contrib.postgres.indexes import GinIndex, BTreeIndex
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from django.utils import timezone


class TimeStampedModel(models.Model):
    """
    Abstract base class with timestamp fields for audit trail.
    All models inherit this for complete temporal tracking.
    """
    created_at = models.DateTimeField(
        _('created at'),
        auto_now_add=True,
        db_index=True,
        help_text=_('Timestamp when the record was created')
    )
    updated_at = models.DateTimeField(
        _('updated at'),
        auto_now=True,
        db_index=True,
        help_text=_('Timestamp when the record was last updated')
    )
    
    class Meta:
        abstract = True
        ordering = ['-created_at']
        get_latest_by = 'created_at'


class UUIDModel(models.Model):
    """
    Abstract base class with UUID primary key for globally unique identifiers.
    Essential for distributed systems and microservices architecture.
    """
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text=_('Globally unique identifier')
    )
    
    class Meta:
        abstract = True


class SoftDeleteModel(models.Model):
    """
    Abstract base class for soft deletion (never delete data).
    Critical for compliance, audit trails, and data recovery.
    """
    is_deleted = models.BooleanField(
        _('is deleted'),
        default=False,
        db_index=True,
        help_text=_('Soft delete flag - data never actually deleted')
    )
    deleted_at = models.DateTimeField(
        _('deleted at'),
        null=True,
        blank=True,
        db_index=True,
        help_text=_('Timestamp when the record was soft deleted')
    )
    deleted_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='%(app_label)s_%(class)s_deletions',
        help_text=_('User who soft deleted this record')
    )
    deletion_reason = models.TextField(
        _('deletion reason'),
        blank=True,
        help_text=_('Reason for soft deletion')
    )
    
    class Meta:
        abstract = True
    
    def soft_delete(self, user=None, reason=''):
        """Mark record as deleted with audit trail"""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.deleted_by = user
        self.deletion_reason = reason
        self.save(update_fields=['is_deleted', 'deleted_at', 'deleted_by', 'deletion_reason'])
    
    def restore(self, user=None):
        """Restore soft deleted record"""
        self.is_deleted = False
        self.deleted_at = None
        self.deleted_by = None
        self.deletion_reason = ''
        self.save(update_fields=['is_deleted', 'deleted_at', 'deleted_by', 'deletion_reason'])


class AuditModel(models.Model):
    """
    Abstract base class for comprehensive audit tracking.
    Tracks who created and last modified every record.
    """
    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='%(app_label)s_%(class)s_created',
        help_text=_('User who created this record')
    )
    updated_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='%(app_label)s_%(class)s_updated',
        help_text=_('User who last updated this record')
    )
    ip_address = models.GenericIPAddressField(
        _('IP address'),
        null=True,
        blank=True,
        help_text=_('IP address of the user who created/updated')
    )
    user_agent = models.TextField(
        _('user agent'),
        blank=True,
        help_text=_('Browser/client user agent string')
    )
    
    class Meta:
        abstract = True


class VersionedModel(models.Model):
    """
    Abstract base class for optimistic locking to prevent concurrent update conflicts.
    Critical for high-concurrency financial and regulatory systems.
    """
    version = models.PositiveIntegerField(
        _('version'),
        default=0,
        help_text=_('Version number for optimistic locking')
    )
    
    class Meta:
        abstract = True
    
    def save(self, *args, **kwargs):
        """Increment version on each save for conflict detection"""
        if self.pk:
            self.version = models.F('version') + 1
        super().save(*args, **kwargs)
        if self.pk:
            self.refresh_from_db(fields=['version'])


class EncryptedModel(models.Model):
    """
    Abstract base class for models with encrypted fields.
    Tracks encryption metadata for key rotation and compliance.
    """
    encryption_key_id = models.CharField(
        _('encryption key ID'),
        max_length=64,
        null=True,
        blank=True,
        db_index=True,
        help_text=_('ID of the encryption key used (for key rotation)')
    )
    encrypted_at = models.DateTimeField(
        _('encrypted at'),
        null=True,
        blank=True,
        help_text=_('Timestamp when data was encrypted')
    )
    encryption_algorithm = models.CharField(
        _('encryption algorithm'),
        max_length=50,
        default='AES-256-GCM',
        help_text=_('Encryption algorithm used')
    )
    
    class Meta:
        abstract = True


class GeoLocationModel(models.Model):
    """
    Abstract base class for geolocation tracking.
    Essential for compliance, fraud detection, and analytics.
    """
    latitude = models.DecimalField(
        _('latitude'),
        max_digits=10,
        decimal_places=8,
        null=True,
        blank=True,
        help_text=_('Latitude coordinate (-90 to 90)')
    )
    longitude = models.DecimalField(
        _('longitude'),
        max_digits=11,
        decimal_places=8,
        null=True,
        blank=True,
        help_text=_('Longitude coordinate (-180 to 180)')
    )
    location_accuracy = models.IntegerField(
        _('location accuracy'),
        null=True,
        blank=True,
        help_text=_('Accuracy in meters')
    )
    altitude = models.DecimalField(
        _('altitude'),
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        help_text=_('Altitude in meters')
    )
    country_code = models.CharField(
        _('country code'),
        max_length=2,
        db_index=True,
        default='KE',
        help_text=_('ISO 3166-1 alpha-2 country code')
    )
    county = models.CharField(
        _('county/state'),
        max_length=100,
        null=True,
        blank=True,
        db_index=True,
        help_text=_('County/State/Province')
    )
    city = models.CharField(
        _('city'),
        max_length=100,
        null=True,
        blank=True,
        db_index=True,
        help_text=_('City/Town')
    )
    postal_code = models.CharField(
        _('postal code'),
        max_length=20,
        null=True,
        blank=True,
        help_text=_('Postal/ZIP code')
    )
    
    class Meta:
        abstract = True
        indexes = [
            models.Index(fields=['latitude', 'longitude'], name='%(app_label)s_%(class)s_geo_idx'),
            models.Index(fields=['country_code', 'county'], name='%(app_label)s_%(class)s_loc_idx'),
        ]


class BaseModel(UUIDModel, TimeStampedModel, SoftDeleteModel, AuditModel):
    """
    Ultimate base model combining all common functionality.
    Use this for most models requiring full audit, soft delete, and UUID.
    """
    class Meta:
        abstract = True


# ============================================================================
# CHOICES - Standardized choices used across the system
# ============================================================================

class StatusChoices(models.TextChoices):
    """Common status choices used across multiple models"""
    PENDING = 'pending', _('Pending')
    ACTIVE = 'active', _('Active')
    INACTIVE = 'inactive', _('Inactive')
    SUSPENDED = 'suspended', _('Suspended')
    EXPIRED = 'expired', _('Expired')
    REVOKED = 'revoked', _('Revoked')
    COMPLETED = 'completed', _('Completed')
    FAILED = 'failed', _('Failed')
    CANCELLED = 'cancelled', _('Cancelled')
    PROCESSING = 'processing', _('Processing')


class RiskLevelChoices(models.TextChoices):
    """Risk level classifications for gambling behavior"""
    NONE = 'none', _('No Risk')
    LOW = 'low', _('Low Risk')
    MILD = 'mild', _('Mild Risk')
    MODERATE = 'moderate', _('Moderate Risk')
    HIGH = 'high', _('High Risk')
    SEVERE = 'severe', _('Severe Risk')
    CRITICAL = 'critical', _('Critical Risk')
    BLACKLISTED = 'blacklisted', _('Blacklisted')


class PriorityChoices(models.TextChoices):
    """Priority levels for tasks and alerts"""
    LOW = 'low', _('Low')
    MEDIUM = 'medium', _('Medium')
    HIGH = 'high', _('High')
    URGENT = 'urgent', _('Urgent')
    CRITICAL = 'critical', _('Critical')


class LanguageChoices(models.TextChoices):
    """Supported languages (multi-lingual system)"""
    ENGLISH = 'en', _('English')
    SWAHILI = 'sw', _('Swahili')
    FRENCH = 'fr', _('French')
    ARABIC = 'ar', _('Arabic')
    PORTUGUESE = 'pt', _('Portuguese')
    AMHARIC = 'am', _('Amharic')
    HAUSA = 'ha', _('Hausa')
    YORUBA = 'yo', _('Yoruba')
    IGBO = 'ig', _('Igbo')
    ZULU = 'zu', _('Zulu')
    AFRIKAANS = 'af', _('Afrikaans')
    PIDGIN = 'pcm', _('Nigerian Pidgin')


class CurrencyChoices(models.TextChoices):
    """Supported currencies"""
    KES = 'KES', _('Kenyan Shilling')
    USD = 'USD', _('US Dollar')
    EUR = 'EUR', _('Euro')
    GBP = 'GBP', _('British Pound')
    TZS = 'TZS', _('Tanzanian Shilling')
    UGX = 'UGX', _('Ugandan Shilling')
    RWF = 'RWF', _('Rwandan Franc')
    BIF = 'BIF', _('Burundian Franc')


class CountryChoices(models.TextChoices):
    """East African countries (primary focus)"""
    KENYA = 'KE', _('Kenya')
    TANZANIA = 'TZ', _('Tanzania')
    UGANDA = 'UG', _('Uganda')
    RWANDA = 'RW', _('Rwanda')
    BURUNDI = 'BI', _('Burundi')
    SOUTH_SUDAN = 'SS', _('South Sudan')
    ETHIOPIA = 'ET', _('Ethiopia')
    SOMALIA = 'SO', _('Somalia')
    DJIBOUTI = 'DJ', _('Djibouti')


class UserRoleChoices(models.TextChoices):
    """User roles in the system"""
    SUPER_ADMIN = 'super_admin', _('Super Administrator')
    GRAK_ADMIN = 'grak_admin', _('GRAK Administrator')
    GRAK_OFFICER = 'grak_officer', _('GRAK Officer')
    GRAK_AUDITOR = 'grak_auditor', _('GRAK Auditor')
    OPERATOR_ADMIN = 'operator_admin', _('Operator Administrator')
    OPERATOR_USER = 'operator_user', _('Operator User')
    BEMATORE_ADMIN = 'bematore_admin', _('Bematore Administrator')
    BEMATORE_ANALYST = 'bematore_analyst', _('Bematore Analyst')
    CITIZEN = 'citizen', _('Citizen/Player')
    API_USER = 'api_user', _('API User')


class ExclusionPeriodChoices(models.TextChoices):
    """Self-exclusion period options"""
    SIX_MONTHS = '6_months', _('6 Months')
    ONE_YEAR = '1_year', _('1 Year')
    FIVE_YEARS = '5_years', _('5 Years')
    PERMANENT = 'permanent', _('Permanent (5 years with auto-renewal)')
    CUSTOM = 'custom', _('Custom Period')


class VerificationStatusChoices(models.TextChoices):
    """Identity verification status"""
    UNVERIFIED = 'unverified', _('Unverified')
    PENDING = 'pending', _('Pending Verification')
    VERIFIED = 'verified', _('Verified')
    FAILED = 'failed', _('Verification Failed')
    EXPIRED = 'expired', _('Verification Expired')
    SUSPENDED = 'suspended', _('Suspended')


class AssessmentTypeChoices(models.TextChoices):
    """Types of gambling risk assessments"""
    LIEBET = 'liebet', _('Lie/Bet (2-Question Screen)')
    PGSI = 'pgsi', _('PGSI (Problem Gambling Severity Index)')
    DSM5 = 'dsm5', _('DSM-5 (Diagnostic and Statistical Manual)')
    BEHAVIORAL = 'behavioral', _('Behavioral Pattern Analysis')
    CUSTOM = 'custom', _('Custom Assessment')


# ============================================================================
# CUSTOM MANAGERS & QUERYSETS
# ============================================================================

class ActiveManager(models.Manager):
    """Manager that filters out soft-deleted records"""
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)


class DeletedManager(models.Manager):
    """Manager that returns only soft-deleted records"""
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=True)


class ActiveRecordsQuerySet(models.QuerySet):
    """Custom QuerySet with common filtering methods"""
    
    def active(self):
        """Get only active, non-deleted records"""
        return self.filter(is_deleted=False, status=StatusChoices.ACTIVE)
    
    def inactive(self):
        """Get inactive records"""
        return self.filter(is_deleted=False, status=StatusChoices.INACTIVE)
    
    def pending(self):
        """Get pending records"""
        return self.filter(is_deleted=False, status=StatusChoices.PENDING)
    
    def soft_delete(self, user=None, reason=''):
        """Bulk soft delete"""
        return self.update(
            is_deleted=True,
            deleted_at=timezone.now(),
            deleted_by=user,
            deletion_reason=reason
        )
    
    def restore(self):
        """Bulk restore"""
        return self.update(
            is_deleted=False,
            deleted_at=None,
            deleted_by=None,
            deletion_reason=''
        )
    
    def high_risk(self):
        """Get high risk records (if model has risk_level field)"""
        return self.filter(
            risk_level__in=[
                RiskLevelChoices.HIGH,
                RiskLevelChoices.SEVERE,
                RiskLevelChoices.CRITICAL,
                RiskLevelChoices.BLACKLISTED
            ]
        )
    
    def by_country(self, country_code):
        """Filter by country code"""
        return self.filter(country_code=country_code)
    
    def created_after(self, date):
        """Get records created after a specific date"""
        return self.filter(created_at__gte=date)
    
    def created_before(self, date):
        """Get records created before a specific date"""
        return self.filter(created_at__lte=date)
    
    def created_between(self, start_date, end_date):
        """Get records created between two dates"""
        return self.filter(created_at__gte=start_date, created_at__lte=end_date)


class BaseModelManager(models.Manager):
    """Enhanced manager for BaseModel with active filtering"""
    def get_queryset(self):
        return ActiveRecordsQuerySet(self.model, using=self._db)
    
    def active(self):
        return self.get_queryset().active()
    
    def inactive(self):
        return self.get_queryset().inactive()
    
    def pending(self):
        return self.get_queryset().pending()
    
    def high_risk(self):
        return self.get_queryset().high_risk()


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def generate_reference_number(prefix='REF', length=12):
    """Generate unique reference number with prefix"""
    import secrets
    import string
    characters = string.ascii_uppercase + string.digits
    random_part = ''.join(secrets.choice(characters) for _ in range(length))
    return f"{prefix}-{random_part}"


def calculate_checksum(value):
    """Calculate Luhn checksum for validation"""
    def digits_of(n):
        return [int(d) for d in str(n)]
    
    digits = digits_of(value)
    odd_digits = digits[-1::-2]
    even_digits = digits[-2::-2]
    checksum = sum(odd_digits)
    for d in even_digits:
        checksum += sum(digits_of(d * 2))
    return checksum % 10


def mask_sensitive_data(value, visible_chars=4, mask_char='*'):
    """Mask sensitive data showing only last N characters"""
    if not value or len(value) <= visible_chars:
        return value
    return mask_char * (len(value) - visible_chars) + value[-visible_chars:]


def hash_pii(value, algorithm='sha256'):
    """One-way hash for PII data"""
    import hashlib
    if not value:
        return None
    return hashlib.new(algorithm, value.encode()).hexdigest()

