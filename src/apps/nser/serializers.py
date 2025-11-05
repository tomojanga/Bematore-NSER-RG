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
            'id', 'exclusion', 'operator', 'operator_name',
            'notified_at', 'acknowledged_at', 'propagation_status',
            'retry_count', 'max_retries', 'next_retry_at',
            'webhook_sent_at', 'webhook_response_code', 'webhook_response_body',
            'last_error_message', 'error_count',
            'is_compliant', 'compliance_checked_at',
            'is_overdue', 'retry_in',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'notified_at', 'acknowledged_at', 'propagation_status',
            'webhook_sent_at', 'webhook_response_code', 'webhook_response_body',
            'retry_count', 'last_error_message', 'error_count',
            'is_compliant', 'compliance_checked_at',
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
    ip_address = serializers.CharField(required=False, allow_null=True)  # Override for DRF 3.14 compatibility
    
    class Meta:
        model = ExclusionAuditLog
        fields = [
            'id', 'exclusion', 'action', 'description',
            'performed_by', 'performed_by_name',
            'ip_address', 'user_agent', 'changes', 'metadata',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ExclusionExtensionRequestSerializer(serializers.ModelSerializer):
    """Exclusion extension request serializer"""
    user_name = serializers.CharField(source='exclusion.user.get_full_name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True, allow_null=True)
    can_approve = serializers.SerializerMethodField()
    current_expiry_date = serializers.DateTimeField(source='exclusion.expiry_date', read_only=True)
    
    class Meta:
        model = ExclusionExtensionRequest
        fields = [
            'id', 'exclusion', 'user_name', 'current_expiry_date',
            'requested_new_period', 'requested_expiry_date',
            'reason', 'status',
            'reviewed_by', 'reviewed_by_name', 'reviewed_at',
            'review_notes', 'can_approve',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'status', 'reviewed_by', 'reviewed_at',
            'created_at', 'updated_at'
        ]
    
    def get_can_approve(self, obj):
        request = self.context.get('request')
        if request and request.user:
            # Only GRAK staff can approve
            return request.user.role in ['grak_admin', 'grak_officer']
        return False
    
    def validate(self, attrs):
        # Validate extension period
        requested_expiry_date = attrs.get('requested_expiry_date')
        requested_new_period = attrs.get('requested_new_period')
        
        if requested_expiry_date and requested_new_period:
            # Both provided, check consistency
            exclusion = self.instance.exclusion if self.instance else attrs.get('exclusion')
            if exclusion and exclusion.expiry_date:
                # Validation logic can be added here
                pass
        
        # Validate reason
        reason = attrs.get('reason', '')
        if len(reason) < 20:
            raise serializers.ValidationError({
                "reason": "Please provide a detailed reason (at least 20 characters)."
            })
        
        return attrs


class ExclusionStatisticsSerializer(serializers.ModelSerializer):
    """Exclusion statistics serializer"""
    propagation_success_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = ExclusionStatistics
        fields = [
            'id', 'date',
            'total_exclusions', 'active_exclusions', 'new_exclusions_today', 'expired_exclusions_today',
            'six_month_exclusions', 'one_year_exclusions', 'five_year_exclusions', 'permanent_exclusions',
            'high_risk_exclusions', 'moderate_risk_exclusions', 'low_risk_exclusions',
            'exclusions_by_county',
            'avg_propagation_time_seconds', 'successful_propagations', 'failed_propagations',
            'propagation_success_rate',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_propagation_success_rate(self, obj):
        total = obj.successful_propagations + obj.failed_propagations
        if total > 0:
            return round((obj.successful_propagations / total) * 100, 2)
        return 0.0


class SelfExclusionListSerializer(serializers.ModelSerializer):
    """Lightweight self-exclusion serializer for lists"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    days_remaining = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()
    is_permanent = serializers.SerializerMethodField()
    
    class Meta:
        model = SelfExclusionRecord
        fields = [
            'id', 'exclusion_reference', 'user', 'user_name',
            'exclusion_period', 'effective_date', 'expiry_date',
            'is_active', 'is_permanent', 'status',
            'days_remaining', 'completion_percentage',
            'created_at'
        ]
        read_only_fields = ['id', 'exclusion_reference', 'created_at']
    
    def get_is_permanent(self, obj):
        return obj.exclusion_period == 'permanent'
    
    def get_days_remaining(self, obj):
        if self.get_is_permanent(obj):
            return None
        if obj.expiry_date and obj.is_active:
            delta = obj.expiry_date - timezone.now()
            return max(0, delta.days)
        return 0
    
    def get_completion_percentage(self, obj):
        if self.get_is_permanent(obj) or not obj.expiry_date:
            return 0
        
        total_duration = (obj.expiry_date - obj.effective_date).total_seconds()
        elapsed = (timezone.now() - obj.effective_date).total_seconds()
        
        if total_duration > 0:
            return min(100, int((elapsed / total_duration) * 100))
        return 0


class SelfExclusionDetailSerializer(serializers.ModelSerializer):
    """Comprehensive self-exclusion serializer with full details"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_phone = serializers.CharField(source='user.phone_number', read_only=True)
    operator_mappings = OperatorExclusionMappingSerializer(many=True, read_only=True)
    audit_logs = ExclusionAuditLogSerializer(many=True, read_only=True)
    days_remaining = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()
    propagation_summary = serializers.SerializerMethodField()
    can_terminate = serializers.SerializerMethodField()
    can_extend = serializers.SerializerMethodField()
    is_permanent = serializers.SerializerMethodField()
    
    class Meta:
        model = SelfExclusionRecord
        fields = [
            'id', 'exclusion_reference', 'user', 'user_name', 'user_phone',
            'exclusion_period', 'custom_period_days', 'effective_date', 'expiry_date', 'actual_end_date',
            'reason', 'motivation_type', 'triggering_assessment', 'risk_level_at_exclusion',
            'is_active', 'is_permanent', 'status',
            'is_auto_renewable', 'renewal_count', 'last_renewed_at',
            'termination_reason', 'early_termination_approved_by',
            'propagation_status', 'propagation_completed_at',
            'operator_mappings', 'audit_logs',
            'days_remaining', 'completion_percentage', 'propagation_summary',
            'can_terminate', 'can_extend',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'exclusion_reference', 'expiry_date', 'renewal_count',
            'last_renewed_at', 'early_termination_approved_by',
            'propagation_status', 'propagation_completed_at',
            'created_at', 'updated_at'
        ]
    
    def get_is_permanent(self, obj):
        return obj.exclusion_period == 'permanent'
    
    def get_days_remaining(self, obj):
        if self.get_is_permanent(obj):
            return None
        if obj.expiry_date and obj.is_active:
            delta = obj.expiry_date - timezone.now()
            return max(0, delta.days)
        return 0
    
    def get_completion_percentage(self, obj):
        if self.get_is_permanent(obj) or not obj.expiry_date:
            return 0
        
        total_duration = (obj.expiry_date - obj.effective_date).total_seconds()
        elapsed = (timezone.now() - obj.effective_date).total_seconds()
        
        if total_duration > 0:
            return min(100, int((elapsed / total_duration) * 100))
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
            'user', 'exclusion_period', 'reason', 'motivation_type',
            'supporting_documents', 'is_auto_renewable',
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
                "user": f"You already have an active self-exclusion until {active_exclusion.expiry_date}. "
                        f"Reference: {active_exclusion.exclusion_reference}"
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
        choices=[
            ('6_months', '6 Months'),
            ('1_year', '1 Year'),
            ('3_years', '3 Years'),
            ('5_years', '5 Years')
        ],
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
    exclusion_reference = serializers.CharField(allow_null=True)
    exclusion_period = serializers.CharField(allow_null=True)
    effective_date = serializers.DateTimeField(allow_null=True)
    expiry_date = serializers.DateTimeField(allow_null=True)
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
