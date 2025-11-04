"""
BST Celery Tasks
Async tasks for token generation, rotation, fraud detection
"""
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


@shared_task
def bulk_generate_bst_tokens(user_ids):
    """Bulk generate BST tokens for multiple users"""
    from .models import BSTToken
    import secrets
    
    generated_count = 0
    
    for user_id in user_ids:
        try:
            token = BSTToken.objects.create(
                user_id=user_id,
                token=secrets.token_urlsafe(32),
                is_active=True
            )
            generated_count += 1
        except Exception as e:
            logger.error(f"Failed to generate token for user {user_id}: {str(e)}")
    
    return {'generated': generated_count}


@shared_task
def rotate_expiring_tokens():
    """Auto-rotate tokens approaching expiration"""
    from .models import BSTToken
    
    warning_date = timezone.now().date() + timedelta(days=30)
    
    expiring_tokens = BSTToken.objects.filter(
        expires_at__lte=warning_date,
        is_active=True
    ).select_related('user')
    
    rotated_count = 0
    
    for old_token in expiring_tokens:
        try:
            # Deactivate old token
            old_token.is_active = False
            old_token.save()
            
            # Generate new token
            import secrets
            new_token = BSTToken.objects.create(
                user=old_token.user,
                token=secrets.token_urlsafe(32),
                is_active=True,
                expires_at=timezone.now().date() + timedelta(days=365)
            )
            
            # Notify user
            from apps.notifications.tasks import send_sms
            send_sms.delay(
                old_token.user.phone_number,
                f"Your BST token has been rotated. New token: {new_token.token[:8]}..."
            )
            
            rotated_count += 1
        except Exception as e:
            logger.error(f"Failed to rotate token {old_token.id}: {str(e)}")
    
    return {'rotated': rotated_count}


@shared_task
def detect_fraud_patterns():
    """Detect fraud patterns in BST usage"""
    from .models import BSTToken, BSTCrossReference
    
    # Check for duplicate token usage
    duplicates = BSTCrossReference.objects.filter(
        is_duplicate=True,
        created_at__date=timezone.now().date()
    ).count()
    
    if duplicates > 0:
        logger.warning(f"Detected {duplicates} potential fraud cases")
        
        # Trigger alert
        from apps.monitoring.models import Alert
        Alert.objects.create(
            alert_type='fraud_detection',
            severity='high',
            message=f"Detected {duplicates} potential fraud cases",
            status='active'
        )
    
    return {'duplicates_found': duplicates}


@shared_task
def cleanup_inactive_tokens():
    """Cleanup inactive tokens older than retention period"""
    from .models import BSTToken
    
    cutoff_date = timezone.now() - timedelta(days=365)
    
    deleted_count = BSTToken.objects.filter(
        is_active=False,
        updated_at__lt=cutoff_date
    ).delete()[0]
    
    logger.info(f"Deleted {deleted_count} inactive tokens")
    return {'deleted': deleted_count}


@shared_task
def generate_bst_statistics():
    """Generate daily BST statistics"""
    from .models import BSTToken
    from apps.analytics.models import DailyStatistics
    
    today = timezone.now().date()
    
    stats = {
        'total_active': BSTToken.objects.filter(is_active=True).count(),
        'generated_today': BSTToken.objects.filter(created_at__date=today).count(),
        'compromised_today': BSTToken.objects.filter(
            is_compromised=True,
            compromised_at__date=today
        ).count()
    }
    
    logger.info(f"BST Stats: {stats}")
    return stats


@shared_task
def sync_operator_mappings():
    """Sync BST mappings with operator systems"""
    from .models import BSTOperatorMapping
    from apps.operators.models import Operator, IntegrationConfig
    import requests
    
    operators = Operator.objects.filter(is_active=True)
    synced_count = 0
    failed_count = 0
    
    for operator in operators:
        try:
            # Get operator integration config
            config = IntegrationConfig.objects.filter(
                operator=operator,
                is_active=True
            ).first()
            
            if not config or not config.api_endpoint:
                logger.warning(f"No integration config for operator {operator.name}")
                continue
            
            # Get BST mappings for this operator
            mappings = BSTOperatorMapping.objects.filter(
                operator=operator,
                is_active=True
            ).select_related('bst_token')
            
            if not mappings.exists():
                continue
            
            # Prepare payload
            payload = {
                'mappings': [
                    {
                        'bst_token': str(mapping.bst_token.token),
                        'operator_user_id': mapping.operator_user_id,
                        'operator_identifier': mapping.operator_identifier,
                        'is_active': mapping.is_active
                    }
                    for mapping in mappings
                ],
                'timestamp': timezone.now().isoformat()
            }
            
            # Get API key
            api_key = operator.api_keys.filter(is_active=True).first()
            if not api_key:
                logger.warning(f"No active API key for operator {operator.name}")
                continue
            
            headers = {
                'Content-Type': 'application/json',
                'X-API-Key': api_key.api_key,
                'X-API-Secret': api_key.api_secret,
                'User-Agent': 'GRAK-BST/1.0'
            }
            
            # Send to operator
            response = requests.post(
                f"{config.api_endpoint}/bst/sync",
                json=payload,
                headers=headers,
                timeout=10
            )
            
            response.raise_for_status()
            synced_count += mappings.count()
            logger.info(f"Synced {mappings.count()} BST mappings with {operator.name}")
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to sync with operator {operator.id}: {str(e)}")
            failed_count += 1
        except Exception as e:
            logger.error(f"Error syncing operator {operator.id}: {str(e)}")
            failed_count += 1
    
    return {'synced': synced_count, 'failed': failed_count}
