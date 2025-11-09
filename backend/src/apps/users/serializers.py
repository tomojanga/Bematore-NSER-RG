"""
User Serializers
Comprehensive serializers for user management with validation
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from phonenumber_field.serializerfields import PhoneNumberField
from .models import (
    User, UserProfile, UserDevice, LoginHistory, 
    IdentityVerification, UserSession, UserActivityLog
)


class UserProfileSerializer(serializers.ModelSerializer):
    """User profile serializer with completion tracking"""
    profile_completion_percentage = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'avatar', 'bio', 'occupation', 'employer',
            'secondary_phone', 'secondary_email',
            'address_line1', 'address_line2',
            'emergency_contact_name', 'emergency_contact_phone', 
            'emergency_contact_relationship',
            'profile_completion_percentage',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserDeviceSerializer(serializers.ModelSerializer):
    """User device tracking serializer"""
    is_current_device = serializers.SerializerMethodField()
    last_ip_address = serializers.CharField(required=False, allow_null=True)  # Override for DRF 3.14 compatibility
    
    class Meta:
        model = UserDevice
        fields = [
            'id', 'device_id', 'device_name', 'device_type',
            'os_name', 'os_version', 'browser_name', 'browser_version',
            'is_trusted', 'trusted_at', 'is_blocked', 'blocked_reason',
            'first_seen_at', 'last_seen_at', 'login_count',
            'last_ip_address', 'last_location_country', 'last_location_city',
            'is_current_device', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'first_seen_at', 'last_seen_at', 'login_count',
            'created_at', 'updated_at'
        ]
    
    def get_is_current_device(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'device_id'):
            return obj.device_id == request.device_id
        return False


class LoginHistorySerializer(serializers.ModelSerializer):
    """Login history serializer"""
    session_duration_display = serializers.SerializerMethodField()
    ip_address = serializers.CharField(required=False, allow_null=True)  # Override for DRF 3.14 compatibility
    
    class Meta:
        model = LoginHistory
        fields = [
            'id', 'login_at', 'logout_at', 'session_duration',
            'session_duration_display', 'login_successful', 'failure_reason',
            'auth_method', 'ip_address', 'user_agent',
            'country_code', 'city', 'latitude', 'longitude',
            'risk_score', 'is_suspicious', 'suspicious_reasons',
            'device', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_session_duration_display(self, obj):
        if obj.session_duration:
            total_seconds = int(obj.session_duration.total_seconds())
            hours, remainder = divmod(total_seconds, 3600)
            minutes, seconds = divmod(remainder, 60)
            return f"{hours}h {minutes}m {seconds}s"
        return None


class IdentityVerificationSerializer(serializers.ModelSerializer):
    """Identity verification serializer"""
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = IdentityVerification
        fields = [
            'id', 'verification_type', 'status', 'verification_code',
            'code_expires_at', 'attempts', 'max_attempts',
            'verified_at', 'expires_at', 'verified_by',
            'failure_reason', 'external_reference',
            'is_valid', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'verification_code', 'verified_at', 'verified_by',
            'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'verification_code': {'write_only': True}
        }
    
    def get_is_valid(self, obj):
        return obj.is_valid()


class UserSessionSerializer(serializers.ModelSerializer):
    """User session serializer"""
    is_valid = serializers.SerializerMethodField()
    ip_address = serializers.CharField(required=False, allow_null=True)  # Override for DRF 3.14 compatibility
    
    class Meta:
        model = UserSession
        fields = [
            'id', 'session_key', 'is_active', 'expires_at',
            'last_activity_at', 'ip_address', 'user_agent',
            'device', 'is_valid', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'session_key', 'created_at', 'updated_at']
    
    def get_is_valid(self, obj):
        return obj.is_valid()


class UserActivityLogSerializer(serializers.ModelSerializer):
    """User activity log serializer"""
    ip_address = serializers.CharField(required=False, allow_null=True)  # Override for DRF 3.14 compatibility
    
    class Meta:
        model = UserActivityLog
        fields = [
            'id', 'activity_type', 'action', 'description',
            'activity_data', 'ip_address', 'user_agent',
            'status', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class UserListSerializer(serializers.ModelSerializer):
    """Lightweight user serializer for lists"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    age = serializers.IntegerField(read_only=True)
    is_verified = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'phone_number', 'email', 'first_name', 'last_name',
            'full_name', 'role', 'status', 'is_active',
            'is_verified', 'verification_status', 'age',
            'created_at', 'last_login_at'
        ]
        read_only_fields = ['id', 'created_at']


class UserDetailSerializer(serializers.ModelSerializer):
    """Comprehensive user serializer with nested relationships"""
    profile = UserProfileSerializer(read_only=True)
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    age = serializers.IntegerField(read_only=True)
    is_adult = serializers.BooleanField(read_only=True)
    is_verified = serializers.BooleanField(read_only=True)
    device_count = serializers.SerializerMethodField()
    active_exclusions_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'phone_number', 'email',
            'first_name', 'last_name', 'middle_name', 'full_name',
            'date_of_birth', 'age', 'is_adult', 'gender',
            'role', 'status',
            'is_phone_verified', 'is_email_verified', 'is_id_verified',
            'is_verified', 'verification_status', 'verified_at',
            'language', 'timezone_name', 'notification_preferences',
            'is_active', 'is_locked', 'locked_until',
            'is_2fa_enabled', 'terms_accepted', 'privacy_policy_accepted',
            'profile', 'device_count', 'active_exclusions_count',
            'country_code', 'county', 'city', 'postal_code',
            'latitude', 'longitude',
            'created_at', 'updated_at', 'last_login_at'
        ]
        read_only_fields = [
            'id', 'is_verified', 'verified_at', 'is_locked', 'locked_until',
            'created_at', 'updated_at', 'last_login_at'
        ]
        extra_kwargs = {
            'national_id': {'write_only': True},
            'email': {'required': False},
            'date_of_birth': {'required': True}
        }
    
    def get_device_count(self, obj):
        return obj.devices.count()
    
    def get_active_exclusions_count(self, obj):
        return obj.exclusions.filter(is_active=True).count()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """User registration serializer with validation"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    phone_number = PhoneNumberField(required=True)
    terms_accepted = serializers.BooleanField(required=True)
    privacy_policy_accepted = serializers.BooleanField(required=True)
    
    class Meta:
        model = User
        fields = [
            'phone_number', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'middle_name',
            'date_of_birth', 'gender', 'national_id',
            'language', 'terms_accepted', 'privacy_policy_accepted'
        ]
    
    def validate(self, attrs):
        # Password confirmation
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password_confirm": "Password fields didn't match."
            })
        
        # Terms acceptance
        if not attrs.get('terms_accepted'):
            raise serializers.ValidationError({
                "terms_accepted": "You must accept the terms and conditions."
            })
        
        if not attrs.get('privacy_policy_accepted'):
            raise serializers.ValidationError({
                "privacy_policy_accepted": "You must accept the privacy policy."
            })
        
        # Age validation (must be 18+)
        from datetime import date
        if attrs.get('date_of_birth'):
            today = date.today()
            age = today.year - attrs['date_of_birth'].year
            if age < 18:
                raise serializers.ValidationError({
                    "date_of_birth": "You must be at least 18 years old to register."
                })
        
        # National ID validation (Kenyan format)
        national_id = attrs.get('national_id')
        if national_id:
            if not national_id.isdigit() or len(national_id) < 7:
                raise serializers.ValidationError({
                    "national_id": "Invalid national ID format."
                })
        
        return attrs
    
    def create(self, validated_data):
        # Remove password confirmation
        validated_data.pop('password_confirm')
        
        # Extract password
        password = validated_data.pop('password')
        
        # Create user
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create profile
        UserProfile.objects.create(user=user)
        
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """Change password serializer"""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True, write_only=True)
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password_confirm": "Password fields didn't match."
            })
        return attrs
    
    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class VerifyPhoneSerializer(serializers.Serializer):
    """Phone verification serializer"""
    phone_number = PhoneNumberField(required=True)
    verification_code = serializers.CharField(max_length=6, required=True)
    
    def validate_verification_code(self, value):
        if not value.isdigit() or len(value) != 6:
            raise serializers.ValidationError("Verification code must be 6 digits.")
        return value


class VerifyEmailSerializer(serializers.Serializer):
    """Email verification serializer"""
    email = serializers.EmailField(required=True)
    verification_code = serializers.CharField(max_length=6, required=True)


class VerifyNationalIDSerializer(serializers.Serializer):
    """National ID verification serializer"""
    national_id = serializers.CharField(required=True)
    full_name = serializers.CharField(required=True)
    date_of_birth = serializers.DateField(required=True)
    
    def validate_national_id(self, value):
        if not value.isdigit() or len(value) < 7:
            raise serializers.ValidationError("Invalid national ID format.")
        return value


class UpdateProfileSerializer(serializers.ModelSerializer):
    """Update user profile serializer"""
    
    class Meta:
        model = UserProfile
        fields = [
            'avatar', 'bio', 'occupation', 'employer',
            'secondary_phone', 'secondary_email',
            'address_line1', 'address_line2',
            'emergency_contact_name', 'emergency_contact_phone',
            'emergency_contact_relationship'
        ]
    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Recalculate completion
        instance.calculate_completion()
        instance.save()
        
        return instance


class TrustDeviceSerializer(serializers.Serializer):
    """Trust device serializer"""
    device_id = serializers.CharField(required=True)
    trust = serializers.BooleanField(default=True)


class UserStatisticsSerializer(serializers.Serializer):
    """User statistics serializer"""
    total_users = serializers.IntegerField()
    active_users = serializers.IntegerField()
    verified_users = serializers.IntegerField()
    new_users_today = serializers.IntegerField()
    new_users_this_week = serializers.IntegerField()
    new_users_this_month = serializers.IntegerField()
    users_by_role = serializers.DictField()
    users_by_status = serializers.DictField()
    users_by_verification_status = serializers.DictField()
