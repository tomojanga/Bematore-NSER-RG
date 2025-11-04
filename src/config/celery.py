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
    # Quarterly Screening - Run every 90 days at 2 AM
    'quarterly-screening': {
        'task': 'apps.screening.tasks.run_quarterly_screening',
        'schedule': crontab(hour=2, minute=0, day_of_month='*/90'),
        'options': {'priority': 9}
    },
    
    # Check Exclusion Expiry - Daily at 1 AM
    'check-exclusion-expiry': {
        'task': 'apps.nser.tasks.check_and_update_expired_exclusions',
        'schedule': crontab(hour=1, minute=0),
        'options': {'priority': 8}
    },
    
    # Send Assessment Reminders - Daily at 9 AM
    'send-assessment-reminders': {
        'task': 'apps.notifications.tasks.send_daily_assessment_reminders',
        'schedule': crontab(hour=9, minute=0),
        'options': {'priority': 7}
    },
    
    # Calculate Daily Statistics - Daily at midnight
    'calculate-daily-statistics': {
        'task': 'apps.analytics.tasks.calculate_daily_statistics',
        'schedule': crontab(hour=0, minute=0),
        'options': {'priority': 6}
    },
    
    # Generate Operator Compliance Reports - Weekly on Monday at 3 AM
    'generate-compliance-reports': {
        'task': 'apps.operators.tasks.generate_weekly_compliance_reports',
        'schedule': crontab(hour=3, minute=0, day_of_week='monday'),
        'options': {'priority': 8}
    },
    
    # Clean Up Old Sessions - Daily at 4 AM
    'cleanup-old-sessions': {
        'task': 'apps.users.tasks.cleanup_expired_sessions',
        'schedule': crontab(hour=4, minute=0),
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
    
    # Update BST Statistics - Hourly
    'update-bst-statistics': {
        'task': 'apps.bst.tasks.update_bst_statistics',
        'schedule': crontab(minute=0),
        'options': {'priority': 5}
    },
    
    # ML Model Training - Weekly on Sunday at 1 AM
    'ml-model-training': {
        'task': 'apps.screening.tasks.train_ml_risk_model',
        'schedule': crontab(hour=1, minute=0, day_of_week='sunday'),
        'options': {'priority': 4}
    },
    
    # Archive Old Audit Logs - Monthly on 1st at 2 AM
    'archive-old-audit-logs': {
        'task': 'apps.compliance.tasks.archive_old_audit_logs',
        'schedule': crontab(hour=2, minute=0, day_of_month=1),
        'options': {'priority': 3}
    },
    
    # Health Check - Every 5 minutes
    'system-health-check': {
        'task': 'apps.monitoring.tasks.perform_system_health_check',
        'schedule': crontab(minute='*/5'),
        'options': {'priority': 9}
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
