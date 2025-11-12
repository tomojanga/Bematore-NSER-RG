"""
NSER Celery Tasks
Async tasks for exclusion propagation, notifications, cleanup
"""
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def propagate_exclusion_to_operators(self, exclusion_id):
    """
    Propagate exclusion to all registered operators
    High priority - should complete within 5 seconds
    """
    from .models import SelfExclusionRecord, OperatorExclusionMapping
    from apps.operators.models import Operator, IntegrationConfig
    import requests
    import json
    
    try:
        exclusion = SelfExclusionRecord.objects.get(id=exclusion_id)
        operators = Operator.objects.filter(license_status='active')
        
        success_count = 0
        failed_count = 0
        
        for operator in operators:
            try:
                # Create or update mapping
                mapping, created = OperatorExclusionMapping.objects.update_or_create(
                    exclusion=exclusion,
                    operator=operator,
                    defaults={
                        'propagation_status': 'pending',
                        'propagated_at': timezone.now()
                    }
                )
                
                # Get operator integration config
                config = IntegrationConfig.objects.filter(
                    operator=operator,
                    is_active=True
                ).first()
                
                if not config or not config.api_endpoint:
                    raise ValueError("No active integration configured")
                
                # Prepare exclusion data
                payload = {
                    'exclusion_id': str(exclusion.id),
                    'user': {
                        'national_id': exclusion.user.national_id,
                        'phone_number': exclusion.user.phone_number,
                        'full_name': exclusion.user.get_full_name()
                    },
                    'start_date': exclusion.start_date.isoformat(),
                    'end_date': exclusion.end_date.isoformat(),
                    'exclusion_type': exclusion.exclusion_type,
                    'is_active': exclusion.is_active,
                    'timestamp': timezone.now().isoformat()
                }
                
                # Get operator API key
                api_key = operator.api_keys.filter(is_active=True).first()
                if not api_key:
                    raise ValueError("No active API key")
                
                headers = {
                    'Content-Type': 'application/json',
                    'X-API-Key': api_key.api_key,
                    'X-API-Secret': api_key.api_secret,
                    'User-Agent': 'GRAK-NSER/1.0'
                }
                
                # Send to operator API
                response = requests.post(
                    f"{config.api_endpoint}/exclusions",
                    json=payload,
                    headers=headers,
                    timeout=5  # 5 second timeout
                )
                
                response.raise_for_status()
                
                # Update mapping
                mapping.propagation_status = 'completed'
                mapping.response_code = response.status_code
                mapping.response_data = response.json() if response.text else {}
                mapping.save()
                
                success_count += 1
                logger.info(f"Successfully propagated to operator {operator.name}")
                
            except requests.exceptions.Timeout:
                logger.error(f"Timeout propagating to operator {operator.id}")
                failed_count += 1
                if hasattr(mapping, 'id'):
                    mapping.propagation_status = 'failed'
                    mapping.error_message = 'Request timeout'
                    mapping.save()
                    
            except requests.exceptions.RequestException as e:
                logger.error(f"HTTP error propagating to operator {operator.id}: {str(e)}")
                failed_count += 1
                if hasattr(mapping, 'id'):
                    mapping.propagation_status = 'failed'
                    mapping.error_message = str(e)
                    mapping.save()
                    
            except Exception as e:
                logger.error(f"Failed to propagate to operator {operator.id}: {str(e)}")
                failed_count += 1
                if hasattr(mapping, 'id'):
                    mapping.propagation_status = 'failed'
                    mapping.error_message = str(e)
                    mapping.save()
        
        logger.info(f"Propagation complete: {success_count} success, {failed_count} failed")
        return {'success': success_count, 'failed': failed_count}
        
    except Exception as exc:
        logger.error(f"Propagation task failed: {str(exc)}")
        raise self.retry(exc=exc, countdown=60)


@shared_task
def retry_failed_propagations():
    """Retry failed exclusion propagations"""
    from .models import OperatorExclusionMapping
    
    failed_mappings = OperatorExclusionMapping.objects.filter(
        propagation_status='failed'
    ).select_related('exclusion', 'operator')
    
    retried_count = 0
    
    for mapping in failed_mappings:
        try:
            # Retry propagation
            propagate_exclusion_to_operators.delay(str(mapping.exclusion.id))
            retried_count += 1
        except Exception as e:
            logger.error(f"Failed to retry mapping {mapping.id}: {str(e)}")
    
    return {'retried': retried_count}


@shared_task
def check_expiring_exclusions():
    """Check for expiring exclusions and send notifications"""
    from .models import SelfExclusionRecord
    
    today = timezone.now().date()
    warning_date = today + timedelta(days=7)
    
    expiring = SelfExclusionRecord.objects.filter(
        end_date__lte=warning_date,
        end_date__gte=today,
        is_active=True
    ).select_related('user')
    
    notified_count = 0
    
    for exclusion in expiring:
        try:
            # Send notification
            from apps.notifications.tasks import send_sms, send_email
            
            message = f"Your self-exclusion period ends on {exclusion.end_date}"
            send_sms.delay(exclusion.user.phone_number, message)
            send_email.delay(exclusion.user.email, "Exclusion Expiring", message)
            
            notified_count += 1
        except Exception as e:
            logger.error(f"Failed to notify user {exclusion.user.id}: {str(e)}")
    
    return {'notified': notified_count}


@shared_task
def process_auto_renewals():
    """Process automatic exclusion renewals"""
    from .models import SelfExclusionRecord
    
    today = timezone.now().date()
    
    # Get exclusions ending today that have auto-renew enabled
    auto_renew_exclusions = SelfExclusionRecord.objects.filter(
        end_date=today,
        auto_renew=True,
        is_active=True
    ).select_related('user')
    
    renewed_count = 0
    
    for exclusion in auto_renew_exclusions:
        try:
            # Create new exclusion period
            new_end_date = exclusion.end_date + timedelta(days=90)
            
            exclusion.end_date = new_end_date
            exclusion.renewal_count += 1
            exclusion.save()
            
            # Propagate update
            propagate_exclusion_to_operators.delay(str(exclusion.id))
            
            renewed_count += 1
        except Exception as e:
            logger.error(f"Failed to auto-renew exclusion {exclusion.id}: {str(e)}")
    
    return {'renewed': renewed_count}


@shared_task
def deactivate_expired_exclusions():
    """Deactivate expired exclusions"""
    from .models import SelfExclusionRecord
    
    today = timezone.now().date()
    
    expired = SelfExclusionRecord.objects.filter(
        end_date__lt=today,
        is_active=True
    )
    
    count = expired.update(is_active=False)
    
    logger.info(f"Deactivated {count} expired exclusions")
    return {'deactivated': count}


@shared_task
def generate_exclusion_statistics():
    """Generate daily exclusion statistics"""
    from .models import SelfExclusionRecord
    from apps.analytics.models import DailyStatistics
    
    today = timezone.now().date()
    
    stats = {
        'total_active': SelfExclusionRecord.objects.filter(is_active=True).count(),
        'new_today': SelfExclusionRecord.objects.filter(created_at__date=today).count(),
        'expired_today': SelfExclusionRecord.objects.filter(
            end_date=today,
            is_active=False
        ).count()
    }
    
    # Save to DailyStatistics
    DailyStatistics.objects.update_or_create(
        date=today,
        defaults={
            'total_exclusions': stats['total_active'],
            'new_exclusions': stats['new_today']
        }
    )
    
    return stats


@shared_task
def cleanup_old_audit_logs():
    """Cleanup old audit logs based on retention policy"""
    from .models import ExclusionAuditLog
    from apps.compliance.models import DataRetentionPolicy
    
    try:
        policy = DataRetentionPolicy.objects.get(
            data_type='audit_logs',
            is_active=True
        )
        
        cutoff_date = timezone.now() - timedelta(days=policy.retention_days)
        
        deleted_count = ExclusionAuditLog.objects.filter(
            created_at__lt=cutoff_date
        ).delete()[0]
        
        logger.info(f"Deleted {deleted_count} old audit logs")
        return {'deleted': deleted_count}
        
    except DataRetentionPolicy.DoesNotExist:
        logger.warning("No audit log retention policy found")
        return {'deleted': 0}


@shared_task(bind=True, max_retries=5)
def send_exclusion_notification(self, exclusion_id, notification_type):
    """
    Send notification about exclusion status
    """
    from .models import SelfExclusionRecord
    from apps.notifications.tasks import send_sms, send_email, send_push_notification
    
    try:
        exclusion = SelfExclusionRecord.objects.get(id=exclusion_id)
        user = exclusion.user
        
        messages = {
            'registered': f"Your self-exclusion has been registered until {exclusion.end_date}",
            'activated': f"Your self-exclusion is now active until {exclusion.end_date}",
            'terminated': "Your self-exclusion has been terminated",
            'extended': f"Your self-exclusion has been extended until {exclusion.end_date}",
            'expiring': f"Your self-exclusion expires on {exclusion.end_date}"
        }
        
        message = messages.get(notification_type, "Exclusion status updated")
        
        # Send via multiple channels
        send_sms.delay(user.phone_number, message)
        send_email.delay(user.email, f"Self-Exclusion {notification_type.title()}", message)
        send_push_notification.delay(str(user.id), "Self-Exclusion Update", message)
        
        return {'sent': True}
        
    except Exception as exc:
        logger.error(f"Failed to send notification: {str(exc)}")
        raise self.retry(exc=exc, countdown=30)


@shared_task
def generate_compliance_report():
    """Generate monthly compliance report for NSER"""
    from .models import SelfExclusionRecord
    from apps.compliance.models import RegulatoryReport
    
    today = timezone.now().date()
    first_of_month = today.replace(day=1)
    
    # Gather statistics
    stats = {
        'total_active': SelfExclusionRecord.objects.filter(is_active=True).count(),
        'new_this_month': SelfExclusionRecord.objects.filter(
            created_at__date__gte=first_of_month
        ).count(),
        'terminated_this_month': SelfExclusionRecord.objects.filter(
            terminated_at__date__gte=first_of_month
        ).count()
    }
    
    # Create report
    report = RegulatoryReport.objects.create(
        report_type='monthly_exclusions',
        report_date=today,
        data=stats,
        status='draft'
    )
    
    logger.info(f"Generated compliance report {report.id}")
    return {'report_id': str(report.id)}


@shared_task
def log_exclusion_lookup(operator_id, lookup_data, result, response_time_ms):
    """
    Log exclusion lookup for audit and analytics
    Non-blocking async task
    """
    from apps.compliance.models import AuditLog
    
    try:
        audit_log = AuditLog.objects.create(
            action='exclusion_lookup',
            operator_id=operator_id,
            details={
                'lookup_data': lookup_data,
                'result': result,
                'response_time_ms': response_time_ms,
                'timestamp': timezone.now().isoformat()
            },
            status='completed'
        )
        logger.info(f"Logged exclusion lookup for operator {operator_id}")
        return {'logged': True, 'log_id': str(audit_log.id)}
    except Exception as e:
        logger.error(f"Failed to log exclusion lookup: {str(e)}")
        return {'logged': False, 'error': str(e)}
