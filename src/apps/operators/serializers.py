"""
Operators Serializers
Operator management, licensing, API keys, compliance
"""
from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import (
    Operator, OperatorLicense, APIKey,
    IntegrationConfig, ComplianceReport, OperatorAuditLog
)


class OperatorLicenseSerializer(serializers.ModelSerializer):
    """Operator license serializer"""
    days_until_expiry = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    is_expiring_soon = serializers.SerializerMethodField()
    
    class Meta:
        model = OperatorLicense
        fields = [
            'id', 'operator', 'license_number', 'license_type',
            'issued_date', 'expiry_date', 'status',
            'issued_by', 'conditions', 'renewal_count',
            'days_until_expiry', 'is_expired', 'is_expiring_soon',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'renewal_count', 'created_at', 'updated_at'
        ]
    
    def get_days_until_expiry(self, obj):
        if obj.expiry_date:
            delta = obj.expiry_date - timezone.now().date()
            return delta.days
        return None
    
    def get_is_expired(self, obj):
        return obj.expiry_date < timezone.now().date() if obj.expiry_date else False
    
    def get_is_expiring_soon(self, obj):
        if obj.expiry_date:
            days_until = (obj.expiry_date - timezone.now().date()).days
            return 0 < days_until <= 30
        return False


class APIKeySerializer(serializers.ModelSerializer):
    """API key serializer with masked secrets"""
    api_secret_masked = serializers.SerializerMethodField()
    days_until_expiry = serializers.SerializerMethodField()
    usage_today = serializers.SerializerMethodField()
    
    class Meta:
        model = APIKey
        fields = [
            'id', 'operator', 'key_name', 'api_key', 'api_secret_masked',
            'scopes', 'can_lookup', 'can_register', 'can_screen',
            'is_active', 'last_used_at', 'usage_count', 'expires_at',
            'rate_limit_per_second', 'rate_limit_per_day',
            'ip_whitelist', 'days_until_expiry', 'usage_today',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'api_key', 'last_used_at', 'usage_count',
            'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'api_secret': {'write_only': True}
        }
    
    def get_api_secret_masked(self, obj):
        if obj.api_secret and len(obj.api_secret) > 8:
            return f"{obj.api_secret[:8]}...{obj.api_secret[-4:]}"
        return "********"
    
    def get_days_until_expiry(self, obj):
        if obj.expires_at:
            delta = obj.expires_at - timezone.now()
            return delta.days
        return None
    
    def get_usage_today(self, obj):
        # This would be calculated from audit logs
        return 0  # Placeholder


class IntegrationConfigSerializer(serializers.ModelSerializer):
    """Integration configuration serializer"""
    webhook_secret_masked = serializers.SerializerMethodField()
    
    class Meta:
        model = IntegrationConfig
        fields = [
            'id', 'operator',
            'webhook_url_exclusion', 'webhook_url_screening',
            'webhook_url_compliance', 'webhook_secret_masked',
            'callback_success_url', 'callback_failure_url',
            'auto_propagate_exclusions', 'require_screening_on_register',
            'screening_frequency_days', 'api_version',
            'timeout_seconds', 'retry_attempts',
            'notification_email', 'notification_phone',
            'metadata', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'webhook_secret': {'write_only': True}
        }
    
    def get_webhook_secret_masked(self, obj):
        if obj.webhook_secret and len(obj.webhook_secret) > 8:
            return f"{obj.webhook_secret[:4]}...{obj.webhook_secret[-4:]}"
        return "****"


class ComplianceReportSerializer(serializers.ModelSerializer):
    """Compliance report serializer"""
    operator_name = serializers.CharField(source='operator.name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True, allow_null=True)
    compliance_status = serializers.SerializerMethodField()
    
    class Meta:
        model = ComplianceReport
        fields = [
            'id', 'operator', 'operator_name', 'report_reference',
            'report_period_start', 'report_period_end',
            'total_users_screened', 'total_exclusions_enforced',
            'screening_compliance_rate', 'exclusion_enforcement_rate',
            'avg_lookup_response_ms', 'avg_webhook_response_ms',
            'compliance_issues', 'violations_count', 'warnings_issued',
            'overall_score', 'is_compliant', 'compliance_status',
            'reviewed_by', 'reviewed_by_name', 'reviewed_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'report_reference', 'reviewed_at',
            'created_at', 'updated_at'
        ]
    
    def get_compliance_status(self, obj):
        if obj.overall_score >= 90:
            return 'excellent'
        elif obj.overall_score >= 75:
            return 'good'
        elif obj.overall_score >= 60:
            return 'adequate'
        elif obj.overall_score >= 50:
            return 'poor'
        else:
            return 'critical'


class OperatorAuditLogSerializer(serializers.ModelSerializer):
    """Operator audit log serializer"""
    operator_name = serializers.CharField(source='operator.name', read_only=True)
    user_name = serializers.CharField(source='performed_by_user.get_full_name', read_only=True, allow_null=True)
    
    class Meta:
        model = OperatorAuditLog
        fields = [
            'id', 'operator', 'operator_name', 'action',
            'resource_type', 'resource_id',
            'performed_by_user', 'user_name',
            'ip_address', 'request_data', 'response_data',
            'success', 'error_message', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class OperatorListSerializer(serializers.ModelSerializer):
    """Lightweight operator serializer for lists"""
    license_status_display = serializers.SerializerMethodField()
    integration_status_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Operator
        fields = [
            'id', 'name', 'trading_name', 'operator_code',
            'email', 'phone', 'license_number', 'license_type',
            'license_status', 'license_status_display',
            'integration_status', 'integration_status_display',
            'is_api_active', 'is_compliant', 'compliance_score',
            'created_at'
        ]
        read_only_fields = ['id', 'operator_code', 'created_at']
    
    def get_license_status_display(self, obj):
        if obj.license_expiry_date < timezone.now().date():
            return 'Expired'
        return obj.license_status.title()
    
    def get_integration_status_display(self, obj):
        return obj.integration_status.replace('_', ' ').title()


class OperatorDetailSerializer(serializers.ModelSerializer):
    """Comprehensive operator serializer"""
    licenses = OperatorLicenseSerializer(many=True, read_only=True)
    api_keys = APIKeySerializer(many=True, read_only=True)
    integration_config = IntegrationConfigSerializer(read_only=True)
    recent_audit_logs = OperatorAuditLogSerializer(many=True, read_only=True, source='audit_logs')
    days_until_license_expiry = serializers.SerializerMethodField()
    is_license_expired = serializers.SerializerMethodField()
    active_api_keys_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Operator
        fields = [
            'id', 'name', 'trading_name', 'registration_number', 'operator_code',
            'email', 'phone', 'website',
            'license_number', 'license_type', 'license_status',
            'license_issued_date', 'license_expiry_date',
            'days_until_license_expiry', 'is_license_expired',
            'integration_status', 'integration_completed_at',
            'is_api_active', 'is_webhook_active',
            'compliance_score', 'last_compliance_check', 'is_compliant',
            'total_users', 'total_screenings', 'total_exclusions',
            'licenses', 'api_keys', 'integration_config', 'recent_audit_logs',
            'active_api_keys_count', 'metadata',
            'address_line1', 'address_line2', 'city', 'county',
            'country', 'latitude', 'longitude',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'operator_code', 'integration_completed_at',
            'compliance_score', 'last_compliance_check',
            'total_users', 'total_screenings', 'total_exclusions',
            'created_at', 'updated_at'
        ]
    
    def get_days_until_license_expiry(self, obj):
        if obj.license_expiry_date:
            delta = obj.license_expiry_date - timezone.now().date()
            return delta.days
        return None
    
    def get_is_license_expired(self, obj):
        return obj.license_expiry_date < timezone.now().date() if obj.license_expiry_date else False
    
    def get_active_api_keys_count(self, obj):
        return obj.api_keys.filter(is_active=True).count()


class RegisterOperatorSerializer(serializers.ModelSerializer):
    """Register new operator serializer"""
    terms_accepted = serializers.BooleanField(write_only=True, required=True)
    
    class Meta:
        model = Operator
        fields = [
            'name', 'trading_name', 'registration_number',
            'email', 'phone', 'website',
            'license_number', 'license_type',
            'license_issued_date', 'license_expiry_date',
            'address_line1', 'address_line2', 'city', 'county',
            'country', 'terms_accepted'
        ]
    
    def validate(self, attrs):
        if not attrs.get('terms_accepted'):
            raise serializers.ValidationError({
                "terms_accepted": "You must accept the terms and conditions."
            })
        
        # Validate license expiry
        if attrs.get('license_expiry_date') and attrs.get('license_issued_date'):
            if attrs['license_expiry_date'] <= attrs['license_issued_date']:
                raise serializers.ValidationError({
                    "license_expiry_date": "License expiry date must be after issued date."
                })
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('terms_accepted', None)
        
        # Generate operator code
        import uuid
        operator_code = f"OP-{str(uuid.uuid4())[:8].upper()}"
        validated_data['operator_code'] = operator_code
        
        return super().create(validated_data)


class GenerateAPIKeySerializer(serializers.Serializer):
    """Generate API key serializer"""
    key_name = serializers.CharField(required=True, max_length=100)
    scopes = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list
    )
    can_lookup = serializers.BooleanField(default=True)
    can_register = serializers.BooleanField(default=True)
    can_screen = serializers.BooleanField(default=True)
    expires_in_days = serializers.IntegerField(default=365, min_value=1, max_value=3650)
    rate_limit_per_second = serializers.IntegerField(default=100, min_value=1)
    rate_limit_per_day = serializers.IntegerField(default=100000, min_value=1)


class ValidateAPIKeySerializer(serializers.Serializer):
    """Validate API key serializer"""
    api_key = serializers.CharField(required=True)
    
    def validate_api_key(self, value):
        if not value.startswith('pk_'):
            raise serializers.ValidationError("Invalid API key format.")
        return value


class SetupIntegrationSerializer(serializers.ModelSerializer):
    """Setup integration configuration serializer"""
    
    class Meta:
        model = IntegrationConfig
        fields = [
            'webhook_url_exclusion', 'webhook_url_screening',
            'webhook_url_compliance', 'webhook_secret',
            'callback_success_url', 'callback_failure_url',
            'auto_propagate_exclusions', 'require_screening_on_register',
            'screening_frequency_days', 'timeout_seconds',
            'retry_attempts', 'notification_email', 'notification_phone'
        ]
    
    def validate(self, attrs):
        # Validate webhook URLs
        webhook_urls = [
            attrs.get('webhook_url_exclusion'),
            attrs.get('webhook_url_screening'),
            attrs.get('webhook_url_compliance')
        ]
        
        if not any(webhook_urls):
            raise serializers.ValidationError(
                "At least one webhook URL must be provided."
            )
        
        return attrs


class TestWebhookSerializer(serializers.Serializer):
    """Test webhook serializer"""
    webhook_type = serializers.ChoiceField(
        choices=['exclusion', 'screening', 'compliance'],
        required=True
    )
    test_data = serializers.JSONField(required=False)


class WebhookTestResponseSerializer(serializers.Serializer):
    """Webhook test response"""
    success = serializers.BooleanField()
    status_code = serializers.IntegerField()
    response_time_ms = serializers.FloatField()
    response_body = serializers.JSONField()
    error_message = serializers.CharField(allow_null=True)


class OperatorMetricsSerializer(serializers.Serializer):
    """Operator performance metrics"""
    period = serializers.CharField()
    total_api_calls = serializers.IntegerField()
    successful_calls = serializers.IntegerField()
    failed_calls = serializers.IntegerField()
    success_rate = serializers.FloatField()
    average_response_time_ms = serializers.FloatField()
    p95_response_time_ms = serializers.FloatField()
    p99_response_time_ms = serializers.FloatField()
    total_exclusions_propagated = serializers.IntegerField()
    propagation_success_rate = serializers.FloatField()
    webhooks_delivered = serializers.IntegerField()
    webhook_delivery_rate = serializers.FloatField()


class OperatorStatisticsSerializer(serializers.Serializer):
    """Operator statistics"""
    total_operators = serializers.IntegerField()
    active_operators = serializers.IntegerField()
    integrated_operators = serializers.IntegerField()
    compliant_operators = serializers.IntegerField()
    operators_with_expired_licenses = serializers.IntegerField()
    operators_by_type = serializers.DictField()
    operators_by_compliance_score = serializers.DictField()
    average_compliance_score = serializers.FloatField()
