"""
Monitoring WebSocket Consumers
Real-time system monitoring via WebSockets
"""
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
import asyncio
import psutil
import logging

logger = logging.getLogger(__name__)


class MonitoringConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer for real-time system monitoring
    
    Provides:
    - System metrics (CPU, memory, disk)
    - API performance metrics
    - Active alerts
    - Health status
    - Error rates
    """
    
    async def connect(self):
        """Handle WebSocket connection"""
        self.user = self.scope['user']
        
        # Only allow staff users
        if not self.user.is_authenticated or self.user.role not in ['grak_admin', 'grak_officer']:
            await self.close()
            return
        
        # Monitoring channel
        self.monitoring_group = "monitoring_staff"
        
        # Add to monitoring group
        await self.channel_layer.group_add(self.monitoring_group, self.channel_name)
        
        # Accept connection
        await self.accept()
        
        # Start periodic metrics updates
        self.metrics_task = asyncio.create_task(self.send_periodic_metrics())
        
        logger.info(f"Monitoring connected: user={self.user.id}")
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        # Cancel periodic task
        if hasattr(self, 'metrics_task'):
            self.metrics_task.cancel()
        
        # Leave monitoring group
        await self.channel_layer.group_discard(self.monitoring_group, self.channel_name)
        
        logger.info(f"Monitoring disconnected: user={self.user.id}, code={close_code}")
    
    async def receive_json(self, content):
        """Handle incoming WebSocket messages"""
        message_type = content.get('type')
        
        if message_type == 'ping':
            await self.send_json({'type': 'pong', 'timestamp': timezone.now().isoformat()})
        
        elif message_type == 'get_metrics':
            # Send current metrics immediately
            metrics = await self.get_system_metrics()
            await self.send_json({
                'type': 'metrics',
                'data': metrics,
                'timestamp': timezone.now().isoformat()
            })
        
        elif message_type == 'get_alerts':
            # Get active alerts
            alerts = await self.get_active_alerts()
            await self.send_json({
                'type': 'alerts',
                'data': alerts,
                'timestamp': timezone.now().isoformat()
            })
        
        elif message_type == 'acknowledge_alert':
            # Acknowledge an alert
            alert_id = content.get('alert_id')
            if alert_id:
                await self.acknowledge_alert(alert_id)
                await self.send_json({
                    'type': 'alert_acknowledged',
                    'alert_id': alert_id,
                    'timestamp': timezone.now().isoformat()
                })
    
    async def send_periodic_metrics(self):
        """Send metrics updates every 5 seconds"""
        try:
            while True:
                metrics = await self.get_system_metrics()
                await self.send_json({
                    'type': 'metrics_update',
                    'data': metrics,
                    'timestamp': timezone.now().isoformat()
                })
                await asyncio.sleep(5)  # Update every 5 seconds
        except asyncio.CancelledError:
            pass
    
    async def get_system_metrics(self):
        """Get current system metrics"""
        # Get system metrics using psutil
        cpu_percent = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        network = psutil.net_io_counters()
        
        # Get database metrics
        db_stats = await self.get_database_stats()
        
        # Get Redis metrics
        redis_stats = await self.get_redis_stats()
        
        return {
            'system': {
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'memory_used_gb': round(memory.used / (1024**3), 2),
                'memory_total_gb': round(memory.total / (1024**3), 2),
                'disk_percent': disk.percent,
                'disk_used_gb': round(disk.used / (1024**3), 2),
                'disk_total_gb': round(disk.total / (1024**3), 2),
                'network_sent_mb': round(network.bytes_sent / (1024**2), 2),
                'network_recv_mb': round(network.bytes_recv / (1024**2), 2)
            },
            'database': db_stats,
            'redis': redis_stats,
            'timestamp': timezone.now().isoformat()
        }
    
    @database_sync_to_async
    def get_database_stats(self):
        """Get database statistics"""
        from django.db import connection
        
        with connection.cursor() as cursor:
            # Get active connections
            cursor.execute("""
                SELECT count(*) 
                FROM pg_stat_activity 
                WHERE state = 'active'
            """)
            active_connections = cursor.fetchone()[0]
            
            # Get total connections
            cursor.execute("SELECT count(*) FROM pg_stat_activity")
            total_connections = cursor.fetchone()[0]
            
            # Get database size
            cursor.execute("""
                SELECT pg_size_pretty(pg_database_size(current_database()))
            """)
            db_size = cursor.fetchone()[0]
        
        return {
            'active_connections': active_connections,
            'total_connections': total_connections,
            'database_size': db_size
        }
    
    @database_sync_to_async
    def get_redis_stats(self):
        """Get Redis statistics"""
        from django.core.cache import cache
        
        try:
            # Get Redis info
            redis_client = cache._cache.get_client()
            info = redis_client.info()
            
            return {
                'connected_clients': info.get('connected_clients', 0),
                'used_memory_mb': round(info.get('used_memory', 0) / (1024**2), 2),
                'keyspace_hits': info.get('keyspace_hits', 0),
                'keyspace_misses': info.get('keyspace_misses', 0),
                'hit_rate': round(
                    info.get('keyspace_hits', 0) / max(info.get('keyspace_hits', 0) + info.get('keyspace_misses', 0), 1) * 100, 
                    2
                )
            }
        except Exception as e:
            logger.error(f"Failed to get Redis stats: {str(e)}")
            return {}
    
    @database_sync_to_async
    def get_active_alerts(self):
        """Get active system alerts"""
        from apps.monitoring.models import Alert
        from apps.monitoring.serializers import AlertSerializer
        
        alerts = Alert.objects.filter(status='active').order_by('-created_at')[:20]
        return AlertSerializer(alerts, many=True).data
    
    @database_sync_to_async
    def acknowledge_alert(self, alert_id):
        """Acknowledge an alert"""
        from apps.monitoring.models import Alert
        
        try:
            alert = Alert.objects.get(id=alert_id)
            alert.status = 'acknowledged'
            alert.acknowledged_at = timezone.now()
            alert.acknowledged_by = self.user
            alert.save()
            return True
        except Alert.DoesNotExist:
            return False
    
    # Event handlers
    async def new_alert(self, event):
        """Handle new alert"""
        await self.send_json({
            'type': 'new_alert',
            'data': event['alert'],
            'timestamp': timezone.now().isoformat()
        })
    
    async def alert_resolved(self, event):
        """Handle alert resolution"""
        await self.send_json({
            'type': 'alert_resolved',
            'data': event['alert'],
            'timestamp': timezone.now().isoformat()
        })
    
    async def service_down(self, event):
        """Handle service down event"""
        await self.send_json({
            'type': 'service_down',
            'data': event['data'],
            'timestamp': timezone.now().isoformat()
        })
    
    async def service_up(self, event):
        """Handle service up event"""
        await self.send_json({
            'type': 'service_up',
            'data': event['data'],
            'timestamp': timezone.now().isoformat()
        })
    
    async def high_load(self, event):
        """Handle high system load"""
        await self.send_json({
            'type': 'high_load',
            'data': event['data'],
            'timestamp': timezone.now().isoformat()
        })
