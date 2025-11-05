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
    recipient_name = serializers.SerializerMethodField()
    channel_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'recipient', 'recipient_name', 'channel', 'channel_display',
            'notification_type', 'subject', 'message', 'status',
            'sent_at', 'delivered_at', 'read_at', 'retry_count',
            'priority', 'metadata', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'sent_at', 'delivered_at', 'read_at', 'retry_count', 'created_at', 'updated_at']
    
    def get_recipient_name(self, obj):
        if obj.recipient:
            return obj.recipient.get_full_name() or str(obj.recipient.phone_number)
        return None
    
    def get_channel_display(self, obj):
        return obj.get_channel_display()


class NotificationTemplateSerializer(serializers.ModelSerializer):
    """Notification template serializer"""
    
    class Meta:
        model = NotificationTemplate
        fields = [
            'id', 'name', 'code', 'channel', 'language',
            'subject_template', 'body_template', 'variables',
            'is_active', 'description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class NotificationBatchSerializer(serializers.ModelSerializer):
    """Notification batch serializer"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    total_notifications = serializers.SerializerMethodField()
    sent_count = serializers.SerializerMethodField()
    delivered_count = serializers.SerializerMethodField()
    failed_count = serializers.SerializerMethodField()
    
    class Meta:
        model = NotificationBatch
        fields = [
            'id', 'name', 'channel', 'notification_type', 'status',
            'target_audience', 'total_recipients', 'total_notifications',
            'sent_count', 'delivered_count', 'failed_count',
            'scheduled_at', 'started_at', 'completed_at',
            'created_by', 'created_by_name', 'metadata',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'started_at', 'completed_at', 'created_at', 'updated_at']
    
    def get_total_notifications(self, obj):
        return obj.notifications.count()
    
    def get_sent_count(self, obj):
        return obj.notifications.filter(status='sent').count()
    
    def get_delivered_count(self, obj):
        return obj.notifications.filter(status='delivered').count()
    
    def get_failed_count(self, obj):
        return obj.notifications.filter(status='failed').count()


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """Notification preference serializer"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = NotificationPreference
        fields = [
            'id', 'user', 'user_name',
            'email_enabled', 'sms_enabled', 'push_enabled',
            'email_exclusion_alerts', 'email_screening_alerts',
            'email_compliance_alerts', 'email_marketing',
            'sms_exclusion_alerts', 'sms_screening_alerts',
            'sms_compliance_alerts', 'sms_marketing',
            'push_exclusion_alerts', 'push_screening_alerts',
            'push_compliance_alerts', 'push_marketing',
            'quiet_hours_start', 'quiet_hours_end',
            'timezone', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SendSMSSerializer(serializers.Serializer):
    """Send SMS serializer"""
    phone_number = serializers.CharField(required=True, max_length=20)
    message = serializers.CharField(required=True, max_length=500)
    notification_type = serializers.CharField(required=False, default='transactional')
    priority = serializers.ChoiceField(
        choices=['low', 'normal', 'high', 'critical'],
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
        choices=['low', 'normal', 'high', 'critical'],
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
        choices=['low', 'normal', 'high', 'critical'],
        default='normal'
    )


class EmailLogSerializer(serializers.ModelSerializer):
    """Email log serializer"""
    notification_id = serializers.UUIDField(source='notification.id', read_only=True)
    
    class Meta:
        model = EmailLog
        fields = [
            'id', 'notification', 'notification_id', 'to_email', 'from_email',
            'subject', 'body', 'status', 'sent_at', 'delivered_at',
            'opened_at', 'clicked_at', 'bounced_at', 'error_message',
            'provider_message_id', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class SMSLogSerializer(serializers.ModelSerializer):
    """SMS log serializer"""
    notification_id = serializers.UUIDField(source='notification.id', read_only=True)
    
    class Meta:
        model = SMSLog
        fields = [
            'id', 'notification', 'notification_id', 'to_phone', 'message',
            'status', 'sent_at', 'delivered_at', 'error_message',
            'provider_message_id', 'cost_amount', 'cost_currency',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class PushNotificationLogSerializer(serializers.ModelSerializer):
    """Push notification log serializer"""
    notification_id = serializers.UUIDField(source='notification.id', read_only=True)
    
    class Meta:
        model = PushNotificationLog
        fields = [
            'id', 'notification', 'notification_id', 'device_token',
            'title', 'body', 'data', 'status', 'sent_at', 'delivered_at',
            'error_message', 'provider_message_id', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
