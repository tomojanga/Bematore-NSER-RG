"""
Notifications WebSocket Consumers
Real-time notification delivery via WebSockets
"""
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer for real-time notifications
    
    Delivers:
    - SMS notifications
    - Email notifications
    - Push notifications
    - System alerts
    - In-app messages
    """
    
    async def connect(self):
        """Handle WebSocket connection"""
        self.user = self.scope['user']
        
        # Reject anonymous users
        if not self.user.is_authenticated:
            await self.close()
            return
        
        # User-specific notification channel
        self.notification_group = f"notifications_{self.user.id}"
        
        # Add to user's notification group
        await self.channel_layer.group_add(self.notification_group, self.channel_name)
        
        # Accept connection
        await self.accept()
        
        # Send unread notifications count
        unread_count = await self.get_unread_count()
        await self.send_json({
            'type': 'connected',
            'unread_count': unread_count,
            'timestamp': timezone.now().isoformat()
        })
        
        # Mark user as online
        await self.set_user_online(True)
        
        logger.info(f"Notifications connected: user={self.user.id}")
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        # Leave notification group
        await self.channel_layer.group_discard(self.notification_group, self.channel_name)
        
        # Mark user as offline
        await self.set_user_online(False)
        
        logger.info(f"Notifications disconnected: user={self.user.id}, code={close_code}")
    
    async def receive_json(self, content):
        """Handle incoming WebSocket messages"""
        message_type = content.get('type')
        
        if message_type == 'ping':
            await self.send_json({'type': 'pong', 'timestamp': timezone.now().isoformat()})
        
        elif message_type == 'mark_read':
            # Mark notification as read
            notification_id = content.get('notification_id')
            if notification_id:
                await self.mark_notification_read(notification_id)
                await self.send_json({
                    'type': 'marked_read',
                    'notification_id': notification_id,
                    'timestamp': timezone.now().isoformat()
                })
        
        elif message_type == 'mark_all_read':
            # Mark all notifications as read
            count = await self.mark_all_notifications_read()
            await self.send_json({
                'type': 'all_marked_read',
                'count': count,
                'timestamp': timezone.now().isoformat()
            })
        
        elif message_type == 'get_recent':
            # Get recent notifications
            limit = content.get('limit', 10)
            notifications = await self.get_recent_notifications(limit)
            await self.send_json({
                'type': 'recent_notifications',
                'notifications': notifications,
                'timestamp': timezone.now().isoformat()
            })
    
    @database_sync_to_async
    def get_unread_count(self):
        """Get count of unread notifications"""
        from apps.notifications.models import Notification
        return Notification.objects.filter(user=self.user, is_read=False).count()
    
    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        """Mark notification as read"""
        from apps.notifications.models import Notification
        try:
            notification = Notification.objects.get(id=notification_id, user=self.user)
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save()
            return True
        except Notification.DoesNotExist:
            return False
    
    @database_sync_to_async
    def mark_all_notifications_read(self):
        """Mark all notifications as read"""
        from apps.notifications.models import Notification
        count = Notification.objects.filter(user=self.user, is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
        return count
    
    @database_sync_to_async
    def get_recent_notifications(self, limit=10):
        """Get recent notifications"""
        from apps.notifications.models import Notification
        from apps.notifications.serializers import NotificationSerializer
        
        notifications = Notification.objects.filter(user=self.user).order_by('-created_at')[:limit]
        return NotificationSerializer(notifications, many=True).data
    
    @database_sync_to_async
    def set_user_online(self, online):
        """Update user online status"""
        from apps.users.models import User
        try:
            user = User.objects.get(id=self.user.id)
            user.is_online = online
            user.last_seen_at = timezone.now()
            user.save(update_fields=['is_online', 'last_seen_at'])
        except User.DoesNotExist:
            pass
    
    # Event handlers
    async def send_notification(self, event):
        """Send notification to user"""
        notification_data = event['notification']
        
        await self.send_json({
            'type': 'notification',
            'data': notification_data,
            'timestamp': timezone.now().isoformat()
        })
    
    async def notification_sms(self, event):
        """SMS notification sent"""
        await self.send_json({
            'type': 'sms_sent',
            'data': event['data'],
            'timestamp': timezone.now().isoformat()
        })
    
    async def notification_email(self, event):
        """Email notification sent"""
        await self.send_json({
            'type': 'email_sent',
            'data': event['data'],
            'timestamp': timezone.now().isoformat()
        })
    
    async def notification_push(self, event):
        """Push notification sent"""
        await self.send_json({
            'type': 'push_sent',
            'data': event['data'],
            'timestamp': timezone.now().isoformat()
        })
    
    async def system_alert(self, event):
        """System alert"""
        await self.send_json({
            'type': 'system_alert',
            'data': event['data'],
            'level': event.get('level', 'info'),
            'timestamp': timezone.now().isoformat()
        })
    
    async def broadcast_message(self, event):
        """Broadcast message to all users"""
        await self.send_json({
            'type': 'broadcast',
            'data': event['data'],
            'timestamp': timezone.now().isoformat()
        })
