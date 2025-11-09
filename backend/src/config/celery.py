"""
Celery Configuration
Asynchronous task processing for NSER-RG
"""
import os
from celery import Celery
from celery.schedules import crontab

# Set default Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

# Create Celery app
app = Celery('nser_rg')

# Load settings from Django
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks in all apps
app.autodiscover_tasks()

# Celery Beat Schedule (Periodic Tasks)
app.conf.beat_schedule = {
    # Quarterly Screening - Daily check for due screenings at 2 AM
    'quarterly-screening': {
        'task': 'apps.screening.tasks.schedule_quarterly_screenings',
        'schedule': crontab(hour=2, minute=0),
        'options': {'priority': 9}
    },
    
    # Check Exclusion Expiry - Daily at 1 AM
    'check-exclusion-expiry': {
        'task': 'apps.nser.tasks.check_expiring_exclusions',
        'schedule': crontab(hour=1, minute=0),
        'options': {'priority': 8}
    },
    
    # Deactivate Expired Exclusions - Daily at 1:30 AM
    'deactivate-expired-exclusions': {
        'task': 'apps.nser.tasks.deactivate_expired_exclusions',
        'schedule': crontab(hour=1, minute=30),
        'options': {'priority': 8}
    },
    
    # Process Auto-Renewals - Daily at 2:30 AM
    'process-auto-renewals': {
        'task': 'apps.nser.tasks.process_auto_renewals',
        'schedule': crontab(hour=2, minute=30),
        'options': {'priority': 8}
    },
    
    # Send Assessment Reminders - Daily at 9 AM
    'send-assessment-reminders': {
        'task': 'apps.screening.tasks.send_screening_reminders',
        'schedule': crontab(hour=9, minute=0),
        'options': {'priority': 7}
    },
    
    # Calculate Daily Statistics - Daily at midnight
    'calculate-daily-statistics': {
        'task': 'apps.nser.tasks.generate_exclusion_statistics',
        'schedule': crontab(hour=0, minute=0),
        'options': {'priority': 6}
    },
    
    # Generate BST Statistics - Daily at 00:15 AM
    'generate-bst-statistics': {
        'task': 'apps.bst.tasks.generate_bst_statistics',
        'schedule': crontab(hour=0, minute=15),
        'options': {'priority': 6}
    },
    
    # Generate Compliance Reports - Monthly on 1st at 3 AM
    'generate-compliance-reports': {
        'task': 'apps.nser.tasks.generate_compliance_report',
        'schedule': crontab(hour=3, minute=0, day_of_month=1),
        'options': {'priority': 8}
    },
    
    # Clean Up Old Audit Logs - Daily at 4 AM
    'cleanup-old-audit-logs': {
        'task': 'apps.nser.tasks.cleanup_old_audit_logs',
        'schedule': crontab(hour=4, minute=0),
        'options': {'priority': 5}
    },
    
    # Cleanup Old Notifications - Daily at 4:30 AM
    'cleanup-old-notifications': {
        'task': 'apps.notifications.tasks.cleanup_old_notifications',
        'schedule': crontab(hour=4, minute=30),
        'options': {'priority': 5}
    },
    
    # Cleanup Abandoned Sessions - Daily at 5 AM
    'cleanup-abandoned-sessions': {
        'task': 'apps.screening.tasks.cleanup_abandoned_sessions',
        'schedule': crontab(hour=5, minute=0),
        'options': {'priority': 5}
    },
    
    # Retry Failed Notifications - Every 15 minutes
    'retry-failed-notifications': {
        'task': 'apps.notifications.tasks.retry_failed_notifications',
        'schedule': crontab(minute='*/15'),
        'options': {'priority': 7}
    },
    
    # Retry Failed Exclusion Propagations - Every 5 minutes
    'retry-failed-propagations': {
        'task': 'apps.nser.tasks.retry_failed_propagations',
        'schedule': crontab(minute='*/5'),
        'options': {'priority': 10}  # Highest priority
    },
    
    # Send Scheduled Notifications - Every 5 minutes
    'send-scheduled-notifications': {
        'task': 'apps.notifications.tasks.send_scheduled_notifications',
        'schedule': crontab(minute='*/5'),
        'options': {'priority': 7}
    },
    
    # Rotate Expiring BST Tokens - Daily at 3 AM
    'rotate-expiring-tokens': {
        'task': 'apps.bst.tasks.rotate_expiring_tokens',
        'schedule': crontab(hour=3, minute=0),
        'options': {'priority': 6}
    },
    
    # Detect Fraud Patterns - Hourly
    'detect-fraud-patterns': {
        'task': 'apps.bst.tasks.detect_fraud_patterns',
        'schedule': crontab(minute=0),
        'options': {'priority': 7}
    },
    
    # Cleanup Inactive BST Tokens - Weekly on Sunday at 2 AM
    'cleanup-inactive-tokens': {
        'task': 'apps.bst.tasks.cleanup_inactive_tokens',
        'schedule': crontab(hour=2, minute=0, day_of_week='sunday'),
        'options': {'priority': 4}
    },
    
    # Sync Operator Mappings - Every 30 minutes
    'sync-operator-mappings': {
        'task': 'apps.bst.tasks.sync_operator_mappings',
        'schedule': crontab(minute='*/30'),
        'options': {'priority': 6}
    },
    
    # ML Model Training - Weekly on Sunday at 1 AM
    'ml-model-training': {
        'task': 'apps.screening.tasks.train_ml_model',
        'schedule': crontab(hour=1, minute=0, day_of_week='sunday'),
        'options': {'priority': 4}
    },
    
    # Update Behavioral Profiles - Daily at 3:30 AM
    'update-behavioral-profiles': {
        'task': 'apps.screening.tasks.update_behavioral_profiles',
        'schedule': crontab(hour=3, minute=30),
        'options': {'priority': 5}
    },
}

# Task Routing
app.conf.task_routes = {
    'apps.nser.tasks.*': {'queue': 'nser'},
    'apps.screening.tasks.*': {'queue': 'screening'},
    'apps.notifications.tasks.*': {'queue': 'notifications'},
    'apps.analytics.tasks.*': {'queue': 'analytics'},
    'apps.monitoring.tasks.*': {'queue': 'monitoring'},
}

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Debug task for testing"""
    print(f'Request: {self.request!r}')
