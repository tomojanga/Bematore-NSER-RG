"""
WebSocket Broadcasting Utilities
Helper functions to broadcast events to WebSocket clients
"""
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import logging

logger = logging.getLogger(__name__)


class WebSocketBroadcaster:
    """Utility class for broadcasting WebSocket messages"""
    
    def __init__(self):
        self.channel_layer = get_channel_layer()
    
    def broadcast_to_user(self, user_id, event_type, data):
        """
        Broadcast message to a specific user
        
        Args:
            user_id: User ID
            event_type: Type of event (e.g., 'notification', 'alert')
            data: Event data dictionary
        """
        try:
            group_name = f"notifications_{user_id}"
            async_to_sync(self.channel_layer.group_send)(
                group_name,
                {
                    'type': 'send_notification',
                    'notification': data
                }
            )
            logger.debug(f"Broadcast {event_type} to user {user_id}")
        except Exception as e:
            logger.error(f"Failed to broadcast to user {user_id}: {str(e)}")
    
    def broadcast_to_dashboard(self, user_id, event_type, data):
        """
        Broadcast dashboard update to specific user
        
        Args:
            user_id: User ID
            event_type: Event type (e.g., 'exclusion_created', 'statistics_updated')
            data: Event data
        """
        try:
            group_name = f"dashboard_{user_id}"
            async_to_sync(self.channel_layer.group_send)(
                group_name,
                {
                    'type': event_type,
                    'data': data
                }
            )
            logger.debug(f"Broadcast dashboard {event_type} to user {user_id}")
        except Exception as e:
            logger.error(f"Failed to broadcast dashboard to user {user_id}: {str(e)}")
    
    def broadcast_to_admins(self, event_type, data):
        """
        Broadcast message to all admin users
        
        Args:
            event_type: Event type
            data: Event data
        """
        try:
            async_to_sync(self.channel_layer.group_send)(
                "dashboard_admin",
                {
                    'type': event_type,
                    'data': data
                }
            )
            logger.debug(f"Broadcast {event_type} to admins")
        except Exception as e:
            logger.error(f"Failed to broadcast to admins: {str(e)}")
    
    def broadcast_alert(self, alert_data):
        """
        Broadcast system alert to monitoring console
        
        Args:
            alert_data: Alert information
        """
        try:
            async_to_sync(self.channel_layer.group_send)(
                "monitoring_staff",
                {
                    'type': 'new_alert',
                    'alert': alert_data
                }
            )
            logger.info(f"Broadcast alert: {alert_data.get('alert_type')}")
        except Exception as e:
            logger.error(f"Failed to broadcast alert: {str(e)}")
    
    def broadcast_to_operator(self, operator_id, event_type, data):
        """
        Broadcast message to operator dashboard
        
        Args:
            operator_id: Operator ID
            event_type: Event type
            data: Event data
        """
        try:
            group_name = f"dashboard_operator_{operator_id}"
            async_to_sync(self.channel_layer.group_send)(
                group_name,
                {
                    'type': event_type,
                    'data': data
                }
            )
            logger.debug(f"Broadcast {event_type} to operator {operator_id}")
        except Exception as e:
            logger.error(f"Failed to broadcast to operator {operator_id}: {str(e)}")
    
    def broadcast_to_all_users(self, event_type, data):
        """
        Broadcast message to all connected users
        
        Args:
            event_type: Event type
            data: Event data
        """
        try:
            # This would require maintaining a list of all connected users
            # For now, broadcast to specific groups
            pass
        except Exception as e:
            logger.error(f"Failed to broadcast to all users: {str(e)}")


# Singleton instance
broadcaster = WebSocketBroadcaster()


# Convenience functions
def notify_user(user_id, title, message, notification_type='info'):
    """Send notification to user"""
    broadcaster.broadcast_to_user(
        user_id,
        'notification',
        {
            'title': title,
            'message': message,
            'type': notification_type
        }
    )


def notify_exclusion_created(user_id, exclusion_data):
    """Notify about new exclusion"""
    broadcaster.broadcast_to_dashboard(
        user_id,
        'exclusion_created',
        exclusion_data
    )
    broadcaster.broadcast_to_admins('exclusion_created', exclusion_data)


def notify_risk_score_updated(user_id, risk_data):
    """Notify about risk score update"""
    broadcaster.broadcast_to_dashboard(
        user_id,
        'risk_score_updated',
        risk_data
    )


def trigger_system_alert(alert_type, severity, message):
    """Trigger system alert"""
    broadcaster.broadcast_alert({
        'alert_type': alert_type,
        'severity': severity,
        'message': message
    })


def update_statistics():
    """Broadcast statistics update to all admins"""
    # Get current statistics
    from apps.nser.models import SelfExclusionRecord
    from django.utils import timezone
    
    today = timezone.now().date()
    
    stats = {
        'total_active': SelfExclusionRecord.objects.filter(is_active=True).count(),
        'new_today': SelfExclusionRecord.objects.filter(created_at__date=today).count()
    }
    
    broadcaster.broadcast_to_admins('statistics_updated', stats)
