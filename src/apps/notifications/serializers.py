"""
Notifications Serializers
Serializers for notifications, templates, preferences, and logs
"""
from rest_framework import serializers
from .models import (
    Notification, NotificationTemplate, NotificationBatch,
    EmailLog, SMSLog, PushNotificationLog, NotificationPreference
)


class NotificationSerializer(serializers.ModelSerializer):
    """Notification serializer"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'user_name', 'notification_type', 'notification_type_display',
            'category', 'title', 'message', 'status',
            'sent_at', 'delivered_at', 'read_at', 'retry_count',
            'priority', 'metadata', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'sent_at', 'delivered_at', 'read_at', 'retry_count', 'created_at', 'updated_at']


class NotificationTemplateSerializer(serializers.ModelSerializer):
    """Notification template serializer"""
    
    class Meta:
        model = NotificationTemplate
        fields = [
            'id', 'template_name', 'template_code', 'template_type', 'category',
            'subject_en', 'subject_sw', 'subject_fr', 'subject_ar',
            'body_en', 'body_sw', 'body_fr', 'body_ar',
            'html_body_en', 'html_body_sw',
            'variables', 'default_values', 'is_active', 'priority',
            'requires_approval', 'usage_count', 'last_used_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'usage_count', 'last_used_at', 'created_at', 'updated_at']


class NotificationBatchSerializer(serializers.ModelSerializer):
    """Notification batch serializer"""
    created_by_name = serializers.CharField(source='created_by_user.get_full_name', read_only=True, allow_null=True)
    
    class Meta:
        model = NotificationBatch
        fields = [
            'id', 'batch_name', 'batch_type', 'status',
            'target_user_ids', 'target_criteria', 'total_recipients',
            'template', 'scheduled_at', 'started_at', 'completed_at',
            'sent_count', 'delivered_count', 'failed_count', 'opened_count',
            'created_by_user', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'status', 'started_at', 'completed_at',
            'sent_count', 'delivered_count', 'failed_count', 'opened_count',
            'created_at', 'updated_at'
        ]


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """Notification preference serializer"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = NotificationPreference
        fields = [
            'id', 'user', 'user_name',
            'email_enabled', 'sms_enabled', 'push_enabled',
            'assessment_reminders', 'exclusion_alerts', 'risk_warnings',
            'compliance_notices', 'marketing',
            'quiet_hours_enabled', 'quiet_hours_start', 'quiet_hours_end',
            'max_sms_per_day', 'max_emails_per_day',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SendSMSSerializer(serializers.Serializer):
    """Send SMS serializer"""
    phone_number = serializers.CharField(required=True, max_length=20)
    message = serializers.CharField(required=True, max_length=500)
    notification_type = serializers.CharField(required=False, default='transactional')
    priority = serializers.ChoiceField(
        choices=[
            ('low', 'Low'),
            ('normal', 'Normal'),
            ('high', 'High'),
            ('critical', 'Critical')
        ],
        default='normal'
    )
    
    def validate_phone_number(self, value):
        # Basic phone validation
        cleaned = value.replace(' ', '').replace('+', '').replace('-', '')
        if not cleaned.isdigit():
            raise serializers.ValidationError("Phone number must contain only digits.")
        if len(cleaned) < 10 or len(cleaned) > 15:
            raise serializers.ValidationError("Invalid phone number length.")
        return value


class SendEmailSerializer(serializers.Serializer):
    """Send email serializer"""
    email = serializers.EmailField(required=True)
    subject = serializers.CharField(required=True, max_length=255)
    message = serializers.CharField(required=True)
    html_message = serializers.CharField(required=False, allow_blank=True)
    notification_type = serializers.CharField(required=False, default='transactional')
    priority = serializers.ChoiceField(
        choices=[
            ('low', 'Low'),
            ('normal', 'Normal'),
            ('high', 'High'),
            ('critical', 'Critical')
        ],
        default='normal'
    )


class SendPushSerializer(serializers.Serializer):
    """Send push notification serializer"""
    user_id = serializers.UUIDField(required=True)
    title = serializers.CharField(required=True, max_length=100)
    body = serializers.CharField(required=True, max_length=500)
    data = serializers.JSONField(required=False)
    notification_type = serializers.CharField(required=False, default='transactional')
    priority = serializers.ChoiceField(
        choices=[
            ('low', 'Low'),
            ('normal', 'Normal'),
            ('high', 'High'),
            ('critical', 'Critical')
        ],
        default='normal'
    )


class EmailLogSerializer(serializers.ModelSerializer):
    """Email log serializer"""
    notification_id = serializers.UUIDField(source='notification.id', read_only=True, allow_null=True)
    
    class Meta:
        model = EmailLog
        fields = [
            'id', 'notification', 'notification_id', 'from_email', 'to_email',
            'cc_emails', 'bcc_emails', 'subject', 'body_text', 'body_html',
            'attachments', 'provider', 'message_id', 'sent_at',
            'opened_at', 'opened_count', 'clicked_at', 'clicked_count',
            'bounced', 'bounce_reason', 'marked_as_spam',
            'status', 'error_message', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class SMSLogSerializer(serializers.ModelSerializer):
    """SMS log serializer"""
    notification_id = serializers.UUIDField(source='notification.id', read_only=True, allow_null=True)
    
    class Meta:
        model = SMSLog
        fields = [
            'id', 'notification', 'notification_id', 'phone_number', 'message',
            'sender_id', 'provider', 'message_id', 'sms_count',
            'cost_per_sms', 'total_cost', 'currency',
            'status', 'sent_at', 'delivered_at',
            'delivery_status', 'delivery_error', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class PushNotificationLogSerializer(serializers.ModelSerializer):
    """Push notification log serializer"""
    notification_id = serializers.UUIDField(source='notification.id', read_only=True, allow_null=True)
    
    class Meta:
        model = PushNotificationLog
        fields = [
            'id', 'notification', 'notification_id', 'device_token', 'device_type',
            'title', 'body', 'image_url', 'action_url', 'custom_data',
            'provider', 'message_id', 'status', 'sent_at', 'delivered_at',
            'opened_at', 'dismissed_at', 'error_message', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
