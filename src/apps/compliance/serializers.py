"""
Compliance & Audit Serializers
Audit logs, compliance checks, incident reports, data retention
"""
from rest_framework import serializers
from django.utils import timezone
from .models import (
    AuditLog, ComplianceCheck, DataRetentionPolicy,
    IncidentReport, RegulatoryReport
)


class AuditLogSerializer(serializers.ModelSerializer):
    """Audit log serializer"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True, allow_null=True)
    operator_name = serializers.CharField(source='operator.name', read_only=True, allow_null=True)
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'user', 'user_name', 'operator', 'operator_name',
            'action', 'resource_type', 'resource_id', 'timestamp', 'time_ago',
            'ip_address', 'user_agent', 'location_country', 'location_city',
            'method', 'endpoint', 'request_id', 'reason',
            'old_values', 'new_values', 'metadata',
            'success', 'error_message', 'response_code',
            'session_id', 'is_suspicious', 'risk_score',
            'created_at'
        ]
        read_only_fields = ['id', 'timestamp', 'created_at']
    
    def get_time_ago(self, obj):
        delta = timezone.now() - obj.timestamp
        
        if delta.days > 0:
            return f"{delta.days} day{'s' if delta.days != 1 else ''} ago"
        elif delta.seconds >= 3600:
            hours = delta.seconds // 3600
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        elif delta.seconds >= 60:
            minutes = delta.seconds // 60
            return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
        else:
            return "Just now"


class AuditLogSearchSerializer(serializers.Serializer):
    """Audit log search serializer"""
    user_id = serializers.UUIDField(required=False)
    operator_id = serializers.UUIDField(required=False)
    action = serializers.CharField(required=False)
    resource_type = serializers.CharField(required=False)
    resource_id = serializers.CharField(required=False)
    start_date = serializers.DateTimeField(required=False)
    end_date = serializers.DateTimeField(required=False)
    ip_address = serializers.CharField(required=False)  # Changed from IPAddressField for DRF 3.14 compatibility
    is_suspicious = serializers.BooleanField(required=False)
    success = serializers.BooleanField(required=False)


class ComplianceCheckSerializer(serializers.ModelSerializer):
    """Compliance check serializer"""
    operator_name = serializers.CharField(source='operator.name', read_only=True, allow_null=True)
    reviewed_by_name = serializers.CharField(
        source='reviewed_by.get_full_name',
        read_only=True,
        allow_null=True
    )
    duration_minutes = serializers.SerializerMethodField()
    violation_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ComplianceCheck
        fields = [
            'id', 'check_reference', 'operator', 'operator_name',
            'check_type', 'scheduled_at', 'started_at', 'completed_at',
            'duration_minutes', 'status', 'passed', 'score',
            'findings', 'violations', 'violation_count', 'recommendations',
            'reviewed_by', 'reviewed_by_name', 'reviewed_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'check_reference', 'started_at', 'completed_at',
            'reviewed_at', 'created_at', 'updated_at'
        ]
    
    def get_duration_minutes(self, obj):
        if obj.completed_at and obj.started_at:
            delta = obj.completed_at - obj.started_at
            return int(delta.total_seconds() / 60)
        return None
    
    def get_violation_count(self, obj):
        return len(obj.violations) if obj.violations else 0


class RunComplianceCheckSerializer(serializers.Serializer):
    """Run compliance check serializer"""
    check_type = serializers.ChoiceField(
        choices=[
            'exclusion_enforcement', 'screening_compliance',
            'api_integration', 'data_protection',
            'response_time', 'webhook_delivery', 'manual_audit'
        ],
        required=True
    )
    operator_id = serializers.UUIDField(required=False)
    scope = serializers.ChoiceField(
        choices=['single_operator', 'all_operators', 'system'],
        default='system'
    )
    include_recommendations = serializers.BooleanField(default=True)


class DataRetentionPolicySerializer(serializers.ModelSerializer):
    """Data retention policy serializer"""
    retention_period_years = serializers.SerializerMethodField()
    
    class Meta:
        model = DataRetentionPolicy
        fields = [
            'id', 'policy_name', 'data_type',
            'retention_period_days', 'retention_period_years',
            'action_after_retention', 'legal_basis',
            'regulatory_requirement', 'is_active',
            'applies_to_deleted_records',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_retention_period_years(self, obj):
        return round(obj.retention_period_days / 365.25, 1)


class ApplyRetentionPolicySerializer(serializers.Serializer):
    """Apply retention policy serializer"""
    policy_id = serializers.UUIDField(required=False)
    data_type = serializers.CharField(required=False)
    dry_run = serializers.BooleanField(default=True)
    
    def validate(self, attrs):
        if not attrs.get('policy_id') and not attrs.get('data_type'):
            raise serializers.ValidationError(
                "Either policy_id or data_type is required."
            )
        return attrs


class IncidentReportSerializer(serializers.ModelSerializer):
    """Incident report serializer"""
    assigned_to_name = serializers.CharField(
        source='assigned_to.get_full_name',
        read_only=True,
        allow_null=True
    )
    reported_by_name = serializers.CharField(
        source='reported_by.get_full_name',
        read_only=True,
        allow_null=True
    )
    days_open = serializers.SerializerMethodField()
    time_to_resolve = serializers.SerializerMethodField()
    
    class Meta:
        model = IncidentReport
        fields = [
            'id', 'incident_reference', 'incident_type', 'severity',
            'title', 'description', 'affected_users_count',
            'affected_data_types', 'discovered_at', 'reported_at',
            'resolved_at', 'days_open', 'time_to_resolve',
            'status', 'immediate_actions', 'root_cause',
            'remediation_plan', 'data_commissioner_notified',
            'users_notified', 'assigned_to', 'assigned_to_name',
            'reported_by', 'reported_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'incident_reference', 'reported_at',
            'resolved_at', 'created_at', 'updated_at'
        ]
    
    def get_days_open(self, obj):
        if obj.status in ['resolved', 'closed'] and obj.resolved_at:
            return None
        delta = timezone.now() - obj.discovered_at
        return delta.days
    
    def get_time_to_resolve(self, obj):
        if obj.resolved_at and obj.discovered_at:
            delta = obj.resolved_at - obj.discovered_at
            return {
                'days': delta.days,
                'hours': delta.seconds // 3600,
                'total_hours': int(delta.total_seconds() / 3600)
            }
        return None


class ReportIncidentSerializer(serializers.Serializer):
    """Report incident serializer"""
    incident_type = serializers.ChoiceField(
        choices=[
            'data_breach', 'unauthorized_access', 'system_failure',
            'compliance_violation', 'fraud_attempt', 'other'
        ],
        required=True
    )
    severity = serializers.ChoiceField(
        choices=['low', 'medium', 'high', 'critical'],
        required=True
    )
    title = serializers.CharField(max_length=255, required=True)
    description = serializers.CharField(required=True, min_length=50)
    affected_users_count = serializers.IntegerField(default=0, min_value=0)
    affected_data_types = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    discovered_at = serializers.DateTimeField(required=True)
    immediate_actions = serializers.CharField(required=False, allow_blank=True)
    
    def validate_description(self, value):
        if len(value) < 50:
            raise serializers.ValidationError(
                "Description must be at least 50 characters."
            )
        return value


class RegulatoryReportSerializer(serializers.ModelSerializer):
    """Regulatory report serializer"""
    submitted_by_name = serializers.CharField(
        source='submitted_by.get_full_name',
        read_only=True,
        allow_null=True
    )
    
    class Meta:
        model = RegulatoryReport
        fields = [
            'id', 'report_reference', 'report_type',
            'reporting_period_start', 'reporting_period_end',
            'submitted_to', 'submitted_at', 'submitted_by',
            'submitted_by_name', 'report_data', 'file_url',
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'report_reference', 'submitted_at',
            'file_url', 'created_at', 'updated_at'
        ]


class GenerateRegulatoryReportSerializer(serializers.Serializer):
    """Generate regulatory report serializer"""
    report_type = serializers.ChoiceField(
        choices=['grak_monthly', 'grak_quarterly', 'grak_annual', 'nacada', 'dci', 'custom'],
        required=True
    )
    reporting_period_start = serializers.DateField(required=True)
    reporting_period_end = serializers.DateField(required=True)
    submitted_to = serializers.CharField(required=True)
    include_sections = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    
    def validate(self, attrs):
        if attrs['reporting_period_end'] <= attrs['reporting_period_start']:
            raise serializers.ValidationError({
                "reporting_period_end": "End date must be after start date."
            })
        return attrs


class DataSubjectAccessSerializer(serializers.Serializer):
    """Data subject access request serializer"""
    user_id = serializers.UUIDField(required=False)
    phone_number = serializers.CharField(required=False)
    national_id = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    request_type = serializers.ChoiceField(
        choices=['access', 'rectify', 'erase', 'export'],
        required=True
    )
    reason = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, attrs):
        identifiers = [
            attrs.get('user_id'),
            attrs.get('phone_number'),
            attrs.get('national_id'),
            attrs.get('email')
        ]
        
        if not any(identifiers):
            raise serializers.ValidationError(
                "At least one identifier is required."
            )
        
        return attrs


class ComplianceDashboardSerializer(serializers.Serializer):
    """Compliance dashboard serializer"""
    overall_compliance_score = serializers.FloatField()
    total_checks_performed = serializers.IntegerField()
    passed_checks = serializers.IntegerField()
    failed_checks = serializers.IntegerField()
    pending_checks = serializers.IntegerField()
    open_incidents = serializers.IntegerField()
    critical_incidents = serializers.IntegerField()
    audit_logs_today = serializers.IntegerField()
    suspicious_activities = serializers.IntegerField()
    data_retention_applied = serializers.IntegerField()
    compliance_by_operator = serializers.DictField()
    recent_violations = serializers.ListField(child=serializers.DictField())


class ComplianceStatisticsSerializer(serializers.Serializer):
    """Compliance statistics serializer"""
    period = serializers.CharField()
    total_audits = serializers.IntegerField()
    compliance_checks = serializers.IntegerField()
    incidents_reported = serializers.IntegerField()
    incidents_resolved = serializers.IntegerField()
    average_resolution_time_hours = serializers.FloatField()
    regulatory_reports_submitted = serializers.IntegerField()
    data_subject_requests = serializers.IntegerField()
    by_incident_type = serializers.DictField()
    by_severity = serializers.DictField()
    trend_percentage = serializers.FloatField()
