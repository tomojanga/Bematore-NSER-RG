"""
Dashboard WebSocket Consumers
Real-time dashboard updates via WebSockets
"""
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
import json
import logging

logger = logging.getLogger(__name__)


class DashboardConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer for real-time dashboard updates
    
    Subscribes to:
    - System statistics
    - Exclusion events
    - Risk assessment updates
    - Operator status changes
    """
    
    async def connect(self):
        """Handle WebSocket connection"""
        self.user = self.scope['user']
        
        # Reject anonymous users
        if not self.user.is_authenticated:
            await self.close()
            return
        
        # User-specific dashboard channel
        self.dashboard_group = f"dashboard_{self.user.id}"
        
        # Role-based channel
        if self.user.role in ['grak_admin', 'grak_officer']:
            self.admin_group = "dashboard_admin"
            await self.channel_layer.group_add(self.admin_group, self.channel_name)
        elif self.user.role == 'operator_admin':
            self.operator_group = f"dashboard_operator_{self.user.operator_id}"
            await self.channel_layer.group_add(self.operator_group, self.channel_name)
        
        # Add to user's personal group
        await self.channel_layer.group_add(self.dashboard_group, self.channel_name)
        
        # Accept connection
        await self.accept()
        
        # Send initial data
        await self.send_initial_data()
        
        logger.info(f"Dashboard connected: user={self.user.id}, role={self.user.role}")
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        # Leave groups
        await self.channel_layer.group_discard(self.dashboard_group, self.channel_name)
        
        if hasattr(self, 'admin_group'):
            await self.channel_layer.group_discard(self.admin_group, self.channel_name)
        
        if hasattr(self, 'operator_group'):
            await self.channel_layer.group_discard(self.operator_group, self.channel_name)
        
        logger.info(f"Dashboard disconnected: user={self.user.id}, code={close_code}")
    
    async def receive_json(self, content):
        """Handle incoming WebSocket messages"""
        message_type = content.get('type')
        
        if message_type == 'ping':
            await self.send_json({'type': 'pong', 'timestamp': timezone.now().isoformat()})
        
        elif message_type == 'subscribe':
            # Subscribe to specific events
            events = content.get('events', [])
            for event in events:
                group_name = f"dashboard_event_{event}"
                await self.channel_layer.group_add(group_name, self.channel_name)
            
            await self.send_json({
                'type': 'subscribed',
                'events': events,
                'timestamp': timezone.now().isoformat()
            })
        
        elif message_type == 'unsubscribe':
            # Unsubscribe from specific events
            events = content.get('events', [])
            for event in events:
                group_name = f"dashboard_event_{event}"
                await self.channel_layer.group_discard(group_name, self.channel_name)
            
            await self.send_json({
                'type': 'unsubscribed',
                'events': events,
                'timestamp': timezone.now().isoformat()
            })
        
        elif message_type == 'request_update':
            # Client requests fresh data
            await self.send_initial_data()
    
    async def send_initial_data(self):
        """Send initial dashboard data to client"""
        stats = await self.get_dashboard_stats()
        
        await self.send_json({
            'type': 'initial_data',
            'data': stats,
            'timestamp': timezone.now().isoformat()
        })
    
    @database_sync_to_async
    def get_dashboard_stats(self):
        """Get dashboard statistics from database"""
        from apps.nser.models import SelfExclusionRecord
        from apps.screening.models import RiskScore
        from apps.users.models import User
        
        today = timezone.now().date()
        
        if self.user.role in ['grak_admin', 'grak_officer']:
            # Admin dashboard
            return {
                'total_users': User.objects.count(),
                'active_exclusions': SelfExclusionRecord.objects.filter(is_active=True).count(),
                'new_exclusions_today': SelfExclusionRecord.objects.filter(created_at__date=today).count(),
                'high_risk_users': RiskScore.objects.filter(
                    risk_level__in=['high', 'severe', 'critical'],
                    is_current=True
                ).count(),
                'total_operators': 0  # Would query operators
            }
        elif self.user.role == 'operator_admin':
            # Operator dashboard
            return {
                'total_lookups_today': 0,
                'active_exclusions': 0,
                'api_calls_today': 0
            }
        else:
            # User dashboard
            return {
                'has_active_exclusion': SelfExclusionRecord.objects.filter(
                    user=self.user,
                    is_active=True
                ).exists(),
                'last_assessment': None,
                'risk_level': None
            }
    
    # Event handlers
    async def exclusion_created(self, event):
        """Handle new exclusion creation"""
        await self.send_json({
            'type': 'exclusion_created',
            'data': event['data'],
            'timestamp': timezone.now().isoformat()
        })
    
    async def exclusion_updated(self, event):
        """Handle exclusion update"""
        await self.send_json({
            'type': 'exclusion_updated',
            'data': event['data'],
            'timestamp': timezone.now().isoformat()
        })
    
    async def risk_score_updated(self, event):
        """Handle risk score update"""
        await self.send_json({
            'type': 'risk_score_updated',
            'data': event['data'],
            'timestamp': timezone.now().isoformat()
        })
    
    async def statistics_updated(self, event):
        """Handle statistics update"""
        await self.send_json({
            'type': 'statistics_updated',
            'data': event['data'],
            'timestamp': timezone.now().isoformat()
        })
    
    async def operator_status_changed(self, event):
        """Handle operator status change"""
        await self.send_json({
            'type': 'operator_status_changed',
            'data': event['data'],
            'timestamp': timezone.now().isoformat()
        })
    
    async def alert_triggered(self, event):
        """Handle system alert"""
        await self.send_json({
            'type': 'alert',
            'data': event['data'],
            'timestamp': timezone.now().isoformat()
        })
