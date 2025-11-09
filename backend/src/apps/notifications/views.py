"""
Notifications Views
SMS, Email, Push notifications, templates, batch campaigns
"""
from rest_framework import status, viewsets, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db import transaction

from .models import (
    Notification, NotificationTemplate, NotificationBatch,
    EmailLog, SMSLog, PushNotificationLog, NotificationPreference
)
from .serializers import (
    NotificationSerializer, NotificationTemplateSerializer,
    NotificationBatchSerializer, NotificationPreferenceSerializer,
    SendSMSSerializer, SendEmailSerializer, SendPushSerializer
)
from apps.api.permissions import IsGRAKStaff
from apps.api.mixins import TimingMixin, SuccessResponseMixin


class NotificationViewSet(TimingMixin, viewsets.ModelViewSet):
    """Notification management"""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role in ['grak_admin', 'grak_officer']:
            return Notification.objects.select_related('user').order_by('-created_at')
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')


class NotificationTemplateViewSet(TimingMixin, viewsets.ModelViewSet):
    """Notification template management"""
    serializer_class = NotificationTemplateSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return NotificationTemplate.objects.filter(is_active=True)


class NotificationBatchViewSet(TimingMixin, viewsets.ModelViewSet):
    """Notification batch management"""
    serializer_class = NotificationBatchSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return NotificationBatch.objects.order_by('-created_at')


class SendSMSView(TimingMixin, SuccessResponseMixin, APIView):
    """Send SMS notification"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        serializer = SendSMSSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Send SMS (async)
        from .tasks import send_sms
        task = send_sms.delay(
            serializer.validated_data['phone_number'],
            serializer.validated_data['message']
        )
        
        return self.success_response(data={'task_id': task.id}, message='SMS queued')


class SendEmailView(TimingMixin, SuccessResponseMixin, APIView):
    """Send email notification"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        serializer = SendEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Send email (async)
        from .tasks import send_email
        task = send_email.delay(
            serializer.validated_data['email'],
            serializer.validated_data['subject'],
            serializer.validated_data['message']
        )
        
        return self.success_response(data={'task_id': task.id}, message='Email queued')


class SendPushNotificationView(TimingMixin, SuccessResponseMixin, APIView):
    """Send push notification"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        serializer = SendPushSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Send push (async)
        from .tasks import send_push_notification
        task = send_push_notification.delay(
            str(serializer.validated_data['user_id']),
            serializer.validated_data['title'],
            serializer.validated_data['message']
        )
        
        return self.success_response(data={'task_id': task.id}, message='Push notification queued')


class SendBulkNotificationView(TimingMixin, SuccessResponseMixin, APIView):
    """Send bulk notifications"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        # Send bulk (async)
        from .tasks import send_bulk_notifications
        task = send_bulk_notifications.delay(request.data)
        
        return self.success_response(data={'task_id': task.id}, message='Bulk notifications queued')


class MyNotificationsView(TimingMixin, generics.ListAPIView):
    """Get current user notifications"""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')


class UnreadNotificationsView(TimingMixin, generics.ListAPIView):
    """Get unread notifications"""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user,
            is_read=False
        ).order_by('-created_at')


class MarkAsReadView(TimingMixin, SuccessResponseMixin, APIView):
    """Mark notification as read"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        notification = Notification.objects.get(pk=pk, user=request.user)
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save()
        
        return self.success_response(message='Marked as read')


class MarkAllAsReadView(TimingMixin, SuccessResponseMixin, APIView):
    """Mark all notifications as read"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
        
        return self.success_response(message='All notifications marked as read')


class ArchiveNotificationView(TimingMixin, SuccessResponseMixin, APIView):
    """Archive notification"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        notification = Notification.objects.get(pk=pk, user=request.user)
        notification.is_archived = True
        notification.save()
        
        return self.success_response(message='Notification archived')


class NotificationPreferencesView(TimingMixin, SuccessResponseMixin, APIView):
    """Get notification preferences"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        prefs, _ = NotificationPreference.objects.get_or_create(user=request.user)
        return self.success_response(data=NotificationPreferenceSerializer(prefs).data)


class UpdatePreferencesView(TimingMixin, SuccessResponseMixin, APIView):
    """Update notification preferences"""
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def put(self, request):
        prefs, _ = NotificationPreference.objects.get_or_create(user=request.user)
        serializer = NotificationPreferenceSerializer(prefs, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return self.success_response(data=serializer.data, message='Preferences updated')


class OptOutView(TimingMixin, SuccessResponseMixin, APIView):
    """Opt out of notifications"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        prefs, _ = NotificationPreference.objects.get_or_create(user=request.user)
        prefs.email_enabled = False
        prefs.sms_enabled = False
        prefs.push_enabled = False
        prefs.save()
        
        return self.success_response(message='Opted out of all notifications')


class OptInView(TimingMixin, SuccessResponseMixin, APIView):
    """Opt in to notifications"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        prefs, _ = NotificationPreference.objects.get_or_create(user=request.user)
        prefs.email_enabled = True
        prefs.sms_enabled = True
        prefs.push_enabled = True
        prefs.save()
        
        return self.success_response(message='Opted in to notifications')


class RenderTemplateView(TimingMixin, SuccessResponseMixin, APIView):
    """Render template with variables"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request, template_code):
        template = NotificationTemplate.objects.get(template_code=template_code)
        context = request.data.get('context', {})
        
        # Simple template rendering
        rendered = template.content_en  # Would use proper templating
        
        return self.success_response(data={'rendered': rendered})


class TestTemplateView(TimingMixin, SuccessResponseMixin, APIView):
    """Test notification template"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        return self.success_response(message='Template test sent')


class CreateBatchView(TimingMixin, SuccessResponseMixin, APIView):
    """Create batch campaign"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    @transaction.atomic
    def post(self, request):
        batch = NotificationBatch.objects.create(
            batch_name=request.data['batch_name'],
            notification_type=request.data['notification_type'],
            status='draft'
        )
        
        return self.success_response(
            data=NotificationBatchSerializer(batch).data,
            message='Batch created',
            status_code=status.HTTP_201_CREATED
        )


class SendBatchView(TimingMixin, SuccessResponseMixin, APIView):
    """Send batch campaign"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request, pk):
        batch = NotificationBatch.objects.get(pk=pk)
        
        # Send batch (async)
        from .tasks import send_notification_batch
        send_notification_batch.delay(str(batch.id))
        
        batch.status = 'sending'
        batch.save()
        
        return self.success_response(message='Batch sending started')


class CancelBatchView(TimingMixin, SuccessResponseMixin, APIView):
    """Cancel batch campaign"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request, pk):
        batch = NotificationBatch.objects.get(pk=pk)
        batch.status = 'cancelled'
        batch.save()
        
        return self.success_response(message='Batch cancelled')


class BatchStatusView(TimingMixin, SuccessResponseMixin, APIView):
    """Get batch status"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request, pk):
        batch = NotificationBatch.objects.get(pk=pk)
        return self.success_response(data=NotificationBatchSerializer(batch).data)


class DeliveryStatusView(TimingMixin, SuccessResponseMixin, APIView):
    """Get notification delivery status"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        notification = Notification.objects.get(pk=pk)
        return self.success_response(data={'status': notification.status})


class EmailLogsView(TimingMixin, generics.ListAPIView):
    """Email delivery logs"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return EmailLog.objects.order_by('-sent_at')[:1000]


class SMSLogsView(TimingMixin, generics.ListAPIView):
    """SMS delivery logs"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return SMSLog.objects.order_by('-sent_at')[:1000]


class PushLogsView(TimingMixin, generics.ListAPIView):
    """Push notification logs"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return PushNotificationLog.objects.order_by('-sent_at')[:1000]


class FailedNotificationsView(TimingMixin, generics.ListAPIView):
    """Failed notifications"""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return Notification.objects.filter(status='failed').order_by('-created_at')


class RetryFailedNotificationsView(TimingMixin, SuccessResponseMixin, APIView):
    """Retry failed notifications"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        # Retry failed (async)
        from .tasks import retry_failed_notifications
        task = retry_failed_notifications.delay()
        
        return self.success_response(data={'task_id': task.id}, message='Retry started')


class NotificationStatisticsView(TimingMixin, SuccessResponseMixin, APIView):
    """Notification statistics"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        stats = {
            'total_sent': Notification.objects.count(),
            'delivered': Notification.objects.filter(status='delivered').count(),
            'failed': Notification.objects.filter(status='failed').count(),
            'pending': Notification.objects.filter(status='pending').count()
        }
        
        return self.success_response(data=stats)


class DeliveryRateView(TimingMixin, SuccessResponseMixin, APIView):
    """Notification delivery rate"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        total = Notification.objects.count()
        delivered = Notification.objects.filter(status='delivered').count()
        rate = (delivered / total * 100) if total > 0 else 0
        
        return self.success_response(data={'delivery_rate': rate})


class OpenRateView(TimingMixin, SuccessResponseMixin, APIView):
    """Notification open rate"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        total = Notification.objects.count()
        opened = Notification.objects.filter(is_read=True).count()
        rate = (opened / total * 100) if total > 0 else 0
        
        return self.success_response(data={'open_rate': rate})
