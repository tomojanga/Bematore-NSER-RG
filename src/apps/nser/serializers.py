"""
NSER (Self-Exclusion) Serializers
Comprehensive serializers for self-exclusion management
"""
from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import (
    SelfExclusionRecord, OperatorExclusionMapping,
    ExclusionAuditLog, ExclusionExtensionRequest, ExclusionStatistics
)


class OperatorExclusionMappingSerializer(serializers.ModelSerializer):
    """Operator exclusion mapping serializer with propagation tracking"""
    operator_name = serializers.CharField(source='operator.name', read_only=True)
    is_overdue = serializers.SerializerMethodField()
    retry_in = serializers.SerializerMethodField()
    
    class Meta:
        model = OperatorExclusionMapping
        fields = [
            'id', 'operator', 'operator_name',
            'propagation_status', 'propagated_at', 'acknowledged_at',
            'webhook_url', 'webhook_response', 'webhook_status_code',
            'retry_count', 'max_retries', 'next_retry_at',
            'last_error', 'is_compliant', 'compliance_checked_at',
            'is_overdue', 'retry_in',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'propagation_status', 'propagated_at', 'acknowledged_at',
            'webhook_response', 'webhook_status_code', 'retry_count',
            'last_error', 'is_compliant', 'compliance_checked_at',
            'created_at', 'updated_at'
        ]
    
    def get_is_overdue(self, obj):
        if obj.propagation_status == 'pending' and obj.created_at:
            # Consider overdue if not propagated within 30 seconds
            return timezone.now() - obj.created_at > timedelta(seconds=30)
        return False
    
    def get_retry_in(self, obj):
        if obj.next_retry_at and obj.next_retry_at > timezone.now():
            delta = obj.next_retry_at - timezone.now()
            return int(delta.total_seconds())
        return None


class ExclusionAuditLogSerializer(serializers.ModelSerializer):
    """Exclusion audit log serializer"""
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)
    
    class Meta:
        model = ExclusionAuditLog
        fields = [
            'id', 'action', 'performed_by', 'performed_by_name',
            'ip_address', 'user_agent', 'old_values', 'new_values',
            'reason', 'operator', 'success', 'error_message',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ExclusionExtensionRequestSerializer(serializers.ModelSerializer):
    """Exclusion extension request serializer"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)
    can_approve = serializers.SerializerMethodField()
    
    class Meta:
        model = ExclusionExtensionRequest
        fields = [
            'id', 'exclusion', 'user', 'user_name',
            'current_end_date', 'requested_end_date', 'extension_period',
            'reason', 'supporting_documents', 'status',
            'reviewed_by', 'reviewed_by_name', 'reviewed_at',
            'review_notes', 'can_approve',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'current_end_date', 'status',
            'reviewed_by', 'reviewed_at', 'created_at', 'updated_at'
        ]
    
    def get_can_approve(self, obj):
        request = self.context.get('request')
        if request and request.user:
            # Only GRAK staff can approve
            return request.user.role in ['grak_admin', 'grak_officer']
        return False
    
    def validate(self, attrs):
        # Validate extension period
        requested_end_date = attrs.get('requested_end_date')
        extension_period = attrs.get('extension_period')
        
        if requested_end_date and extension_period:
            # Both provided, check consistency
            exclusion = self.instance.exclusion if self.instance else None
            if exclusion and exclusion.end_date:
                expected_date = exclusion.end_date + timedelta(days=int(extension_period) * 30)
                if abs((requested_end_date - expected_date).days) > 7:
                    raise serializers.ValidationError({
                        "requested_end_date": "Requested date doesn't match extension period."
                    })
        
        # Validate reason
        reason = attrs.get('reason', '')
        if len(reason) < 20:
            raise serializers.ValidationError({
                "reason": "Please provide a detailed reason (at least 20 characters)."
            })
        
        return attrs


class ExclusionStatisticsSerializer(serializers.ModelSerializer):
    """Exclusion statistics serializer"""
    
    class Meta:
        model = ExclusionStatistics
        fields = [
            'id', 'date', 'total_active_exclusions', 'new_exclusions',
            'expired_exclusions', 'terminated_exclusions',
            'exclusions_by_period', 'exclusions_by_county',
            'average_age', 'gender_distribution',
            'propagation_success_rate', 'average_propagation_time',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SelfExclusionListSerializer(serializers.ModelSerializer):
    """Lightweight self-exclusion serializer for lists"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    days_remaining = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = SelfExclusionRecord
        fields = [
            'id', 'reference_number', 'user', 'user_name',
            'exclusion_period', 'start_date', 'end_date',
            'is_active', 'is_permanent', 'status',
            'days_remaining', 'completion_percentage',
            'created_at'
        ]
        read_only_fields = ['id', 'reference_number', 'created_at']
    
    def get_days_remaining(self, obj):
        if obj.is_permanent:
            return None
        if obj.end_date and obj.is_active:
            delta = obj.end_date - timezone.now().date()
            return max(0, delta.days)
        return 0
    
    def get_completion_percentage(self, obj):
        if obj.is_permanent or not obj.end_date:
            return 0
        
        total_days = (obj.end_date - obj.start_date).days
        elapsed_days = (timezone.now().date() - obj.start_date).days
        
        if total_days > 0:
            return min(100, int((elapsed_days / total_days) * 100))
        return 0


class SelfExclusionDetailSerializer(serializers.ModelSerializer):
    """Comprehensive self-exclusion serializer with full details"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_phone = serializers.CharField(source='user.phone_number', read_only=True)
    operator_mappings = OperatorExclusionMappingSerializer(many=True, read_only=True)
    audit_logs = ExclusionAuditLogSerializer(many=True, read_only=True, source='audit_logs')
    days_remaining = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()
    propagation_summary = serializers.SerializerMethodField()
    can_terminate = serializers.SerializerMethodField()
    can_extend = serializers.SerializerMethodField()
    
    class Meta:
        model = SelfExclusionRecord
        fields = [
            'id', 'reference_number', 'user', 'user_name', 'user_phone',
            'exclusion_period', 'start_date', 'end_date', 'actual_end_date',
            'reason', 'additional_notes', 'supporting_documents',
            'is_active', 'is_permanent', 'status',
            'auto_renew', 'renewal_count', 'last_renewed_at',
            'termination_reason', 'terminated_at', 'terminated_by',
            'propagated_to_operators', 'propagation_completed_at',
            'operator_mappings', 'audit_logs',
            'days_remaining', 'completion_percentage', 'propagation_summary',
            'can_terminate', 'can_extend',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'reference_number', 'actual_end_date', 'renewal_count',
            'last_renewed_at', 'terminated_at', 'terminated_by',
            'propagated_to_operators', 'propagation_completed_at',
            'created_at', 'updated_at'
        ]
    
    def get_days_remaining(self, obj):
        if obj.is_permanent:
            return None
        if obj.end_date and obj.is_active:
            delta = obj.end_date - timezone.now().date()
            return max(0, delta.days)
        return 0
    
    def get_completion_percentage(self, obj):
        if obj.is_permanent or not obj.end_date:
            return 0
        
        total_days = (obj.end_date - obj.start_date).days
        elapsed_days = (timezone.now().date() - obj.start_date).days
        
        if total_days > 0:
            return min(100, int((elapsed_days / total_days) * 100))
        return 0
    
    def get_propagation_summary(self, obj):
        mappings = obj.operator_mappings.all()
        total = mappings.count()
        
        if total == 0:
            return {'status': 'not_started', 'total': 0}
        
        completed = mappings.filter(propagation_status='completed').count()
        failed = mappings.filter(propagation_status='failed').count()
        pending = mappings.filter(propagation_status='pending').count()
        
        return {
            'status': 'completed' if completed == total else 'in_progress' if pending > 0 else 'failed',
            'total': total,
            'completed': completed,
            'failed': failed,
            'pending': pending,
            'success_rate': (completed / total * 100) if total > 0 else 0
        }
    
    def get_can_terminate(self, obj):
        # Can only terminate active exclusions
        return obj.is_active and obj.status == 'active'
    
    def get_can_extend(self, obj):
        # Can extend if active and not permanent
        return obj.is_active and not obj.is_permanent


class RegisterExclusionSerializer(serializers.ModelSerializer):
    """Register new self-exclusion serializer with validation"""
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    terms_acknowledged = serializers.BooleanField(write_only=True, required=True)
    consequences_understood = serializers.BooleanField(write_only=True, required=True)
    
    class Meta:
        model = SelfExclusionRecord
        fields = [
            'user', 'exclusion_period', 'reason', 'additional_notes',
            'supporting_documents', 'auto_renew',
            'terms_acknowledged', 'consequences_understood'
        ]
    
    def validate(self, attrs):
        # Check if user already has active exclusion
        user = attrs['user']
        active_exclusion = SelfExclusionRecord.objects.filter(
            user=user,
            is_active=True
        ).first()
        
        if active_exclusion:
            raise serializers.ValidationError({
                "user": f"You already have an active self-exclusion until {active_exclusion.end_date}. "
                        f"Reference: {active_exclusion.reference_number}"
            })
        
        # Check terms acknowledgment
        if not attrs.get('terms_acknowledged'):
            raise serializers.ValidationError({
                "terms_acknowledged": "You must acknowledge the terms and conditions."
            })
        
        if not attrs.get('consequences_understood'):
            raise serializers.ValidationError({
                "consequences_understood": "You must acknowledge that you understand the consequences."
            })
        
        # Validate reason
        reason = attrs.get('reason', '')
        if len(reason) < 10:
            raise serializers.ValidationError({
                "reason": "Please provide a brief reason (at least 10 characters)."
            })
        
        # Validate exclusion period
        exclusion_period = attrs.get('exclusion_period')
        if exclusion_period not in ['6_months', '1_year', '3_years', '5_years', 'permanent']:
            raise serializers.ValidationError({
                "exclusion_period": "Invalid exclusion period."
            })
        
        return attrs
    
    def create(self, validated_data):
        # Remove acknowledgment fields
        validated_data.pop('terms_acknowledged', None)
        validated_data.pop('consequences_understood', None)
        
        # Create exclusion
        exclusion = SelfExclusionRecord.objects.create(**validated_data)
        
        # Trigger async propagation (will be handled by signals/tasks)
        return exclusion


class TerminateExclusionSerializer(serializers.Serializer):
    """Terminate exclusion serializer"""
    termination_reason = serializers.CharField(required=True, min_length=20)
    confirmation_code = serializers.CharField(required=True, max_length=6)
    
    def validate_termination_reason(self, value):
        if len(value) < 20:
            raise serializers.ValidationError(
                "Please provide a detailed termination reason (at least 20 characters)."
            )
        return value
    
    def validate_confirmation_code(self, value):
        if not value.isdigit() or len(value) != 6:
            raise serializers.ValidationError("Invalid confirmation code format.")
        return value


class ExtendExclusionSerializer(serializers.Serializer):
    """Extend exclusion serializer"""
    extension_period = serializers.ChoiceField(
        choices=['6_months', '1_year', '3_years', '5_years'],
        required=True
    )
    reason = serializers.CharField(required=True, min_length=20)
    supporting_documents = serializers.JSONField(required=False)
    
    def validate_reason(self, value):
        if len(value) < 20:
            raise serializers.ValidationError(
                "Please provide a detailed reason (at least 20 characters)."
            )
        return value


class ExclusionLookupSerializer(serializers.Serializer):
    """Real-time exclusion lookup serializer (HIGH PERFORMANCE)"""
    phone_number = serializers.CharField(required=False)
    national_id = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    bst_token = serializers.CharField(required=False)
    operator_id = serializers.UUIDField(required=True)
    
    def validate(self, attrs):
        # At least one identifier required
        identifiers = [
            attrs.get('phone_number'),
            attrs.get('national_id'),
            attrs.get('email'),
            attrs.get('bst_token')
        ]
        
        if not any(identifiers):
            raise serializers.ValidationError(
                "At least one identifier (phone_number, national_id, email, or bst_token) is required."
            )
        
        return attrs


class ExclusionLookupResponseSerializer(serializers.Serializer):
    """Exclusion lookup response serializer"""
    is_excluded = serializers.BooleanField()
    exclusion_id = serializers.UUIDField(allow_null=True)
    reference_number = serializers.CharField(allow_null=True)
    exclusion_period = serializers.CharField(allow_null=True)
    start_date = serializers.DateField(allow_null=True)
    end_date = serializers.DateField(allow_null=True)
    is_permanent = serializers.BooleanField()
    days_remaining = serializers.IntegerField(allow_null=True)
    user_message = serializers.CharField()
    lookup_timestamp = serializers.DateTimeField()
    response_time_ms = serializers.IntegerField()


class BulkExclusionLookupSerializer(serializers.Serializer):
    """Bulk exclusion lookup serializer"""
    lookups = serializers.ListField(
        child=ExclusionLookupSerializer(),
        min_length=1,
        max_length=100
    )
    
    def validate_lookups(self, value):
        if len(value) > 100:
            raise serializers.ValidationError(
                "Maximum 100 lookups allowed per request."
            )
        return value


class PropagationStatusSerializer(serializers.Serializer):
    """Propagation status response serializer"""
    exclusion_id = serializers.UUIDField()
    total_operators = serializers.IntegerField()
    propagated_count = serializers.IntegerField()
    pending_count = serializers.IntegerField()
    failed_count = serializers.IntegerField()
    success_rate = serializers.FloatField()
    status = serializers.CharField()
    operators = OperatorExclusionMappingSerializer(many=True)


class ExclusionTrendsSerializer(serializers.Serializer):
    """Exclusion trends serializer"""
    period = serializers.CharField()
    total_exclusions = serializers.IntegerField()
    new_exclusions = serializers.IntegerField()
    expired_exclusions = serializers.IntegerField()
    by_period = serializers.DictField()
    by_gender = serializers.DictField()
    by_age_group = serializers.DictField()
    by_county = serializers.DictField()
    trend_percentage = serializers.FloatField()
