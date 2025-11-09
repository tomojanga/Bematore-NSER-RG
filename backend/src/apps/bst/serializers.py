"""
BST (Bematore Screening Token) Serializers
Token generation, validation, and fraud detection
"""
from rest_framework import serializers
from django.utils import timezone
from .models import (
    BSTToken, BSTMapping, BSTCrossReference,
    BSTAuditLog, BSTStatistics
)


class BSTMappingSerializer(serializers.ModelSerializer):
    """BST mapping serializer with operator details"""
    operator_name = serializers.CharField(source='operator.name', read_only=True)
    is_recent = serializers.SerializerMethodField()
    
    class Meta:
        model = BSTMapping
        fields = [
            'id', 'bst_token', 'operator', 'operator_name',
            'operator_user_id', 'operator_username', 'first_seen_at', 'last_seen_at',
            'interaction_count', 'last_activity_type', 'is_active', 
            'is_primary_operator', 'metadata',
            'is_recent', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'first_seen_at', 'last_seen_at',
            'interaction_count', 'created_at', 'updated_at'
        ]
    
    def get_is_recent(self, obj):
        if obj.last_seen_at:
            days_ago = (timezone.now() - obj.last_seen_at).days
            return days_ago <= 30
        return False


class BSTCrossReferenceSerializer(serializers.ModelSerializer):
    """BST cross-reference serializer for fraud detection"""
    confidence_display = serializers.SerializerMethodField()
    
    class Meta:
        model = BSTCrossReference
        fields = [
            'id', 'bst_token', 'identifier_type', 'identifier_hash',
            'first_detected_at', 'detection_source', 'confidence_score',
            'confidence_display', 'is_verified', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'identifier_hash', 'first_detected_at', 
            'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'identifier_type': {'required': True},
        }
    
    def get_confidence_display(self, obj):
        confidence = float(obj.confidence_score) / 100.0  # Convert to 0-1 range
        if confidence >= 0.95:
            return 'Very High'
        elif confidence >= 0.85:
            return 'High'
        elif confidence >= 0.70:
            return 'Medium'
        elif confidence >= 0.50:
            return 'Low'
        else:
            return 'Very Low'


class BSTAuditLogSerializer(serializers.ModelSerializer):
    """BST audit log serializer"""
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True, allow_null=True)
    operator_name = serializers.CharField(source='operator.name', read_only=True, allow_null=True)
    ip_address = serializers.CharField(required=False, allow_null=True)  # Override for DRF 3.14 compatibility
    
    class Meta:
        model = BSTAuditLog
        fields = [
            'id', 'bst_token', 'action', 'performed_by', 'performed_by_name',
            'operator', 'operator_name', 'ip_address', 'user_agent',
            'details', 'success', 'error_message', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class BSTStatisticsSerializer(serializers.ModelSerializer):
    """BST statistics serializer"""
    
    class Meta:
        model = BSTStatistics
        fields = [
            'id', 'date', 'total_tokens', 'active_tokens',
            'tokens_generated_today', 'tokens_validated_today',
            'validation_success_rate', 'average_validation_time_ms',
            'tokens_by_operator', 'cross_references_created',
            'fraud_flags_created', 'compromised_tokens',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BSTTokenListSerializer(serializers.ModelSerializer):
    """Lightweight BST token serializer for lists"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    age_days = serializers.SerializerMethodField()
    mapping_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BSTToken
        fields = [
            'id', 'token', 'token_version', 'user', 'user_name',
            'is_active', 'is_compromised', 'issued_at', 'expires_at',
            'age_days', 'mapping_count', 'created_at'
        ]
        read_only_fields = [
            'id', 'token', 'token_version',
            'issued_at', 'created_at'
        ]
    
    def get_age_days(self, obj):
        if obj.issued_at:
            delta = timezone.now() - obj.issued_at
            return delta.days
        return 0
    
    def get_mapping_count(self, obj):
        return obj.mappings.count()


class BSTTokenDetailSerializer(serializers.ModelSerializer):
    """Comprehensive BST token serializer with all relationships"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_phone = serializers.CharField(source='user.phone_number', read_only=True)
    mappings = BSTMappingSerializer(many=True, read_only=True)
    cross_references = BSTCrossReferenceSerializer(many=True, read_only=True)
    audit_logs = BSTAuditLogSerializer(many=True, read_only=True)
    age_days = serializers.SerializerMethodField()
    days_until_expiry = serializers.SerializerMethodField()
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = BSTToken
        fields = [
            'id', 'token', 'token_version', 'token_checksum',
            'user', 'user_name', 'user_phone',
            'phone_number_hash', 'national_id_hash', 'biometric_hash',
            'is_active', 'is_compromised', 'compromised_reason',
            'compromised_at', 'rotation_count', 'rotated_at',
            'issued_at', 'expires_at', 'last_used_at',
            'lookup_count', 'age_days', 'days_until_expiry',
            'is_valid', 'mappings', 'cross_references', 'audit_logs',
            'generation_metadata', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'token', 'token_version', 'token_checksum',
            'phone_number_hash', 'national_id_hash', 'biometric_hash',
            'compromised_at', 'rotation_count', 'rotated_at',
            'issued_at', 'last_used_at', 'lookup_count',
            'created_at', 'updated_at'
        ]
    
    def get_age_days(self, obj):
        if obj.issued_at:
            delta = timezone.now() - obj.issued_at
            return delta.days
        return 0
    
    def get_days_until_expiry(self, obj):
        if obj.expires_at:
            delta = obj.expires_at - timezone.now()
            return max(0, delta.days)
        return None
    
    def get_is_valid(self, obj):
        # Check if token is active and not compromised
        return obj.is_active and not obj.is_compromised


class GenerateBSTTokenSerializer(serializers.Serializer):
    """Generate BST token serializer"""
    user_id = serializers.UUIDField(required=True)
    force_regenerate = serializers.BooleanField(default=False)
    
    def validate_user_id(self, value):
        from apps.users.models import User
        if not User.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError("User not found or inactive.")
        return value


class BulkGenerateBSTTokenSerializer(serializers.Serializer):
    """Bulk BST token generation serializer"""
    user_ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=1,
        max_length=100
    )
    force_regenerate = serializers.BooleanField(default=False)
    
    def validate_user_ids(self, value):
        if len(value) > 100:
            raise serializers.ValidationError(
                "Maximum 100 users allowed per bulk generation."
            )
        
        # Remove duplicates
        return list(set(value))


class ValidateBSTTokenSerializer(serializers.Serializer):
    """Validate BST token serializer (HIGH PERFORMANCE - <20ms target)"""
    token = serializers.CharField(required=True, max_length=100)
    operator_id = serializers.UUIDField(required=False)
    
    def validate_token(self, value):
        # Basic format validation
        if not value.startswith('BST-'):
            raise serializers.ValidationError("Invalid BST token format.")
        
        parts = value.split('-')
        if len(parts) != 4:
            raise serializers.ValidationError("Invalid BST token structure.")
        
        return value


class BSTValidationResponseSerializer(serializers.Serializer):
    """BST validation response serializer"""
    is_valid = serializers.BooleanField()
    token_id = serializers.UUIDField(allow_null=True)
    user_id = serializers.UUIDField(allow_null=True)
    is_active = serializers.BooleanField()
    is_compromised = serializers.BooleanField()
    expires_at = serializers.DateTimeField(allow_null=True)
    is_expired = serializers.BooleanField()
    validation_message = serializers.CharField()
    validation_timestamp = serializers.DateTimeField()
    response_time_ms = serializers.IntegerField()


class BulkValidateBSTTokenSerializer(serializers.Serializer):
    """Bulk BST token validation serializer"""
    tokens = serializers.ListField(
        child=serializers.CharField(max_length=100),
        min_length=1,
        max_length=100
    )
    operator_id = serializers.UUIDField(required=False)
    
    def validate_tokens(self, value):
        if len(value) > 100:
            raise serializers.ValidationError(
                "Maximum 100 tokens allowed per bulk validation."
            )
        return value


class LookupBSTTokenSerializer(serializers.Serializer):
    """Lookup BST token by user identifiers"""
    phone_number = serializers.CharField(required=False)
    national_id = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    user_id = serializers.UUIDField(required=False)
    
    def validate(self, attrs):
        identifiers = [
            attrs.get('phone_number'),
            attrs.get('national_id'),
            attrs.get('email'),
            attrs.get('user_id')
        ]
        
        if not any(identifiers):
            raise serializers.ValidationError(
                "At least one identifier is required."
            )
        
        return attrs


class RotateBSTTokenSerializer(serializers.Serializer):
    """Rotate BST token serializer"""
    reason = serializers.CharField(required=True, min_length=10)
    notify_user = serializers.BooleanField(default=True)
    
    def validate_reason(self, value):
        if len(value) < 10:
            raise serializers.ValidationError(
                "Please provide a reason (at least 10 characters)."
            )
        return value


class CompromiseBSTTokenSerializer(serializers.Serializer):
    """Mark BST token as compromised serializer"""
    reason = serializers.CharField(required=True, min_length=20)
    incident_reference = serializers.CharField(required=False)
    notify_user = serializers.BooleanField(default=True)
    auto_rotate = serializers.BooleanField(default=True)
    
    def validate_reason(self, value):
        if len(value) < 20:
            raise serializers.ValidationError(
                "Please provide a detailed reason (at least 20 characters)."
            )
        return value


class CreateBSTMappingSerializer(serializers.ModelSerializer):
    """Create BST mapping serializer"""
    
    class Meta:
        model = BSTMapping
        fields = [
            'token', 'operator', 'operator_user_id',
            'first_activity_date', 'metadata'
        ]
    
    def validate(self, attrs):
        # Check if mapping already exists
        existing = BSTMapping.objects.filter(
            token=attrs['token'],
            operator=attrs['operator']
        ).first()
        
        if existing:
            raise serializers.ValidationError(
                f"Mapping already exists for this token and operator."
            )
        
        return attrs


class RecordActivitySerializer(serializers.Serializer):
    """Record BST activity serializer"""
    token_id = serializers.UUIDField(required=True)
    operator_id = serializers.UUIDField(required=True)
    activity_type = serializers.ChoiceField(
        choices=[
            ('bet', 'Bet'),
            ('deposit', 'Deposit'),
            ('withdrawal', 'Withdrawal'),
            ('login', 'Login'),
            ('registration', 'Registration')
        ]
    )
    amount = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
        required=False,
        allow_null=True
    )
    metadata = serializers.JSONField(required=False)


class LinkIdentifierSerializer(serializers.Serializer):
    """Link identifier to BST for cross-reference"""
    token_id = serializers.UUIDField(required=True)
    identifier_type = serializers.ChoiceField(
        choices=[
            ('phone', 'Phone Number'),
            ('email', 'Email Address'),
            ('national_id', 'National ID'),
            ('device_id', 'Device ID'),
            ('ip_address', 'IP Address')
        ]
    )
    identifier_value = serializers.CharField(required=True)


class DetectDuplicatesSerializer(serializers.Serializer):
    """Detect duplicate accounts serializer"""
    user_id = serializers.UUIDField(required=False)
    phone_number = serializers.CharField(required=False)
    national_id = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    device_id = serializers.CharField(required=False)
    
    def validate(self, attrs):
        identifiers = [
            attrs.get('user_id'),
            attrs.get('phone_number'),
            attrs.get('national_id'),
            attrs.get('email'),
            attrs.get('device_id')
        ]
        
        if not any(identifiers):
            raise serializers.ValidationError(
                "At least one identifier is required."
            )
        
        return attrs


class DuplicateDetectionResponseSerializer(serializers.Serializer):
    """Duplicate detection response serializer"""
    has_duplicates = serializers.BooleanField()
    duplicate_count = serializers.IntegerField()
    confidence_score = serializers.FloatField()
    matched_tokens = serializers.ListField(child=serializers.UUIDField())
    matched_users = serializers.ListField(child=serializers.UUIDField())
    match_reasons = serializers.ListField(child=serializers.CharField())
    risk_level = serializers.CharField()
    recommended_action = serializers.CharField()


class FraudCheckSerializer(serializers.Serializer):
    """Fraud check serializer"""
    token_id = serializers.UUIDField(required=False)
    user_id = serializers.UUIDField(required=False)
    check_type = serializers.ChoiceField(
        choices=[
            ('duplicate_accounts', 'Duplicate Accounts'),
            ('compromised_token', 'Compromised Token'),
            ('suspicious_activity', 'Suspicious Activity'),
            ('all', 'All Checks')
        ],
        default='all'
    )
    
    def validate(self, attrs):
        if not attrs.get('token_id') and not attrs.get('user_id'):
            raise serializers.ValidationError(
                "Either token_id or user_id is required."
            )
        return attrs


class FraudCheckResponseSerializer(serializers.Serializer):
    """Fraud check response serializer"""
    is_fraud_risk = serializers.BooleanField()
    risk_score = serializers.FloatField()
    risk_level = serializers.CharField()
    fraud_indicators = serializers.ListField(child=serializers.CharField())
    duplicate_accounts = serializers.IntegerField()
    compromised_tokens = serializers.IntegerField()
    suspicious_activities = serializers.IntegerField()
    recommended_action = serializers.CharField()
    details = serializers.JSONField()


class TokenUsageStatsSerializer(serializers.Serializer):
    """Token usage statistics serializer"""
    period = serializers.CharField()
    total_tokens = serializers.IntegerField()
    active_tokens = serializers.IntegerField()
    validations_count = serializers.IntegerField()
    average_validation_time_ms = serializers.FloatField()
    validation_success_rate = serializers.FloatField()
    compromised_tokens = serializers.IntegerField()
    rotated_tokens = serializers.IntegerField()
    tokens_by_operator = serializers.DictField()
    trend_percentage = serializers.FloatField()
