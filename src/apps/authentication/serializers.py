"""
Authentication Serializers
Login, logout, token management, password reset, 2FA, OAuth2
"""
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import OAuthApplication, RefreshToken, PasswordResetToken, TwoFactorAuth


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer with additional claims"""
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add custom claims
        data['user_id'] = str(self.user.id)
        data['phone_number'] = str(self.user.phone_number)
        data['role'] = self.user.role
        data['is_verified'] = self.user.is_verified
        
        return data


class LoginSerializer(serializers.Serializer):
    """Login serializer"""
    phone_number = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    device_id = serializers.CharField(required=False)
    device_name = serializers.CharField(required=False)
    
    def validate(self, attrs):
        phone_number = attrs.get('phone_number')
        password = attrs.get('password')
        
        # Authenticate user
        user = authenticate(username=phone_number, password=password)
        
        if not user:
            raise serializers.ValidationError("Invalid credentials.")
        
        if not user.is_active:
            raise serializers.ValidationError("Account is inactive.")
        
        if user.is_locked:
            raise serializers.ValidationError(
                f"Account is locked until {user.locked_until}."
            )
        
        attrs['user'] = user
        return attrs


class LogoutSerializer(serializers.Serializer):
    """Logout serializer"""
    refresh_token = serializers.CharField(required=False)
    all_devices = serializers.BooleanField(default=False)


class TokenVerifySerializer(serializers.Serializer):
    """Token verification serializer"""
    token = serializers.CharField(required=True)


class TokenRevokeSerializer(serializers.Serializer):
    """Token revocation serializer"""
    refresh_token = serializers.CharField(required=True)


class PasswordResetRequestSerializer(serializers.Serializer):
    """Password reset request serializer"""
    phone_number = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    
    def validate(self, attrs):
        if not attrs.get('phone_number') and not attrs.get('email'):
            raise serializers.ValidationError(
                "Either phone_number or email is required."
            )
        return attrs


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Password reset confirmation serializer"""
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password_confirm": "Password fields didn't match."
            })
        return attrs


class Enable2FASerializer(serializers.Serializer):
    """Enable 2FA serializer"""
    method = serializers.ChoiceField(
        choices=['totp', 'sms', 'email'],
        required=True
    )
    phone_number = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    
    def validate(self, attrs):
        method = attrs.get('method')
        
        if method == 'sms' and not attrs.get('phone_number'):
            raise serializers.ValidationError({
                "phone_number": "Phone number is required for SMS 2FA."
            })
        
        if method == 'email' and not attrs.get('email'):
            raise serializers.ValidationError({
                "email": "Email is required for email 2FA."
            })
        
        return attrs


class Disable2FASerializer(serializers.Serializer):
    """Disable 2FA serializer"""
    password = serializers.CharField(required=True, write_only=True)
    verification_code = serializers.CharField(required=True)
    
    def validate_verification_code(self, value):
        if not value.isdigit() or len(value) != 6:
            raise serializers.ValidationError("Invalid verification code format.")
        return value


class Verify2FASerializer(serializers.Serializer):
    """Verify 2FA code serializer"""
    verification_code = serializers.CharField(required=True)
    
    def validate_verification_code(self, value):
        if not value.isdigit() or len(value) != 6:
            raise serializers.ValidationError("Invalid verification code format.")
        return value


class TwoFactorAuthSerializer(serializers.ModelSerializer):
    """2FA configuration serializer"""
    
    class Meta:
        model = TwoFactorAuth
        fields = [
            'user', 'method', 'is_enabled', 'backup_codes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'backup_codes', 'created_at', 'updated_at']
        extra_kwargs = {
            'secret': {'write_only': True}
        }


class OAuthApplicationSerializer(serializers.ModelSerializer):
    """OAuth application serializer"""
    client_secret_masked = serializers.SerializerMethodField()
    
    class Meta:
        model = OAuthApplication
        fields = [
            'id', 'name', 'client_id', 'client_secret_masked',
            'redirect_uris', 'allowed_scopes',
            'is_confidential', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'client_id', 'created_at', 'updated_at']
        extra_kwargs = {
            'client_secret': {'write_only': True}
        }
    
    def get_client_secret_masked(self, obj):
        if obj.client_secret and len(obj.client_secret) > 8:
            return f"{obj.client_secret[:8]}...{obj.client_secret[-4:]}"
        return "********"


class OAuthAuthorizeSerializer(serializers.Serializer):
    """OAuth authorization serializer"""
    client_id = serializers.CharField(required=True)
    redirect_uri = serializers.URLField(required=True)
    response_type = serializers.ChoiceField(
        choices=['code', 'token'],
        default='code'
    )
    scope = serializers.CharField(required=False)
    state = serializers.CharField(required=False)
    
    def validate_client_id(self, value):
        if not OAuthApplication.objects.filter(
            client_id=value,
            is_active=True
        ).exists():
            raise serializers.ValidationError("Invalid client_id.")
        return value


class RefreshTokenSerializer(serializers.ModelSerializer):
    """Refresh token serializer"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    is_expired = serializers.SerializerMethodField()
    days_until_expiry = serializers.SerializerMethodField()
    
    class Meta:
        model = RefreshToken
        fields = [
            'id', 'user', 'user_name', 'token',
            'expires_at', 'is_expired', 'days_until_expiry',
            'is_revoked', 'device_info',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'token': {'write_only': True}
        }
    
    def get_is_expired(self, obj):
        from django.utils import timezone
        return obj.expires_at < timezone.now()
    
    def get_days_until_expiry(self, obj):
        from django.utils import timezone
        if obj.expires_at > timezone.now():
            delta = obj.expires_at - timezone.now()
            return delta.days
        return 0


class PasswordResetTokenSerializer(serializers.ModelSerializer):
    """Password reset token serializer"""
    is_expired = serializers.SerializerMethodField()
    
    class Meta:
        model = PasswordResetToken
        fields = [
            'id', 'user', 'token', 'expires_at',
            'is_expired', 'is_used', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'token', 'created_at', 'updated_at']
        extra_kwargs = {
            'token': {'write_only': True}
        }
    
    def get_is_expired(self, obj):
        from django.utils import timezone
        return obj.expires_at < timezone.now()
