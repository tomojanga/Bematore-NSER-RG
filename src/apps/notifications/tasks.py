"""
Notifications Celery Tasks
Async tasks for sending SMS, email, push notifications
"""
from celery import shared_task
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def send_sms(self, phone_number, message):
    """
    Send SMS via Africa's Talking
    """
    try:
        from .models import SMSLog
        from django.conf import settings
        import africastalking
        
        # Initialize Africa's Talking
        africastalking.initialize(
            username=settings.AFRICASTALKING_USERNAME,
            api_key=settings.AFRICASTALKING_API_KEY
        )
        
        sms = africastalking.SMS
        
        # Ensure phone number is in correct format (+254...)
        if not phone_number.startswith('+'):
            if phone_number.startswith('0'):
                phone_number = '+254' + phone_number[1:]
            elif phone_number.startswith('254'):
                phone_number = '+' + phone_number
            else:
                phone_number = '+254' + phone_number
        
        # Send SMS
        response = sms.send(message, [phone_number], sender_id=settings.AFRICASTALKING_SENDER_ID)
        
        # Parse response
        recipients = response.get('SMSMessageData', {}).get('Recipients', [])
        if recipients:
            recipient = recipients[0]
            status_code = recipient.get('statusCode')
            
            # Log SMS
            SMSLog.objects.create(
                phone_number=phone_number,
                message=message,
                status='sent' if status_code == 101 else 'failed',
                status_code=status_code,
                message_id=recipient.get('messageId'),
                cost=recipient.get('cost'),
                sent_at=timezone.now()
            )
            
            if status_code == 101:  # Success code
                return {'sent': True, 'phone': phone_number, 'message_id': recipient.get('messageId')}
            else:
                raise Exception(f"SMS failed with status code: {status_code}")
        else:
            raise Exception("No recipients in response")
        
    except Exception as exc:
        logger.error(f"Failed to send SMS to {phone_number}: {str(exc)}")
        
        # Log failed SMS
        try:
            SMSLog.objects.create(
                phone_number=phone_number,
                message=message,
                status='failed',
                error_message=str(exc),
                sent_at=timezone.now()
            )
        except:
            pass
            
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_email(self, email, subject, message, html_content=None):
    """
    Send email via SendGrid
    """
    try:
        from .models import EmailLog
        from django.conf import settings
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail, Email, To, Content
        
        # Create SendGrid client
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        
        # Create message
        from_email = Email(settings.DEFAULT_FROM_EMAIL, "GRAK NSER")
        to_email = To(email)
        
        # Use HTML content if provided, otherwise plain text
        if html_content:
            content = Content("text/html", html_content)
        else:
            content = Content("text/plain", message)
        
        mail = Mail(from_email, to_email, subject, content)
        
        # Send email
        response = sg.client.mail.send.post(request_body=mail.get())
        
        # Log email
        EmailLog.objects.create(
            email=email,
            subject=subject,
            message=message,
            status='sent' if response.status_code == 202 else 'failed',
            status_code=response.status_code,
            message_id=response.headers.get('X-Message-Id'),
            sent_at=timezone.now()
        )
        
        if response.status_code in [200, 202]:
            return {'sent': True, 'email': email, 'message_id': response.headers.get('X-Message-Id')}
        else:
            raise Exception(f"SendGrid returned status {response.status_code}")
        
    except Exception as exc:
        logger.error(f"Failed to send email to {email}: {str(exc)}")
        
        # Log failed email
        try:
            EmailLog.objects.create(
                email=email,
                subject=subject,
                message=message,
                status='failed',
                error_message=str(exc),
                sent_at=timezone.now()
            )
        except:
            pass
            
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_push_notification(self, user_id, title, message, data=None):
    """
    Send push notification via Firebase Cloud Messaging
    """
    try:
        from .models import PushNotificationLog, Notification
        from apps.users.models import UserDevice
        from django.conf import settings
        from firebase_admin import messaging
        import firebase_admin
        from firebase_admin import credentials
        
        # Initialize Firebase if not already done
        if not firebase_admin._apps:
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            firebase_admin.initialize_app(cred)
        
        # Get user devices with FCM tokens
        devices = UserDevice.objects.filter(
            user_id=user_id,
            push_enabled=True,
            is_active=True,
            fcm_token__isnull=False
        ).exclude(fcm_token='')
        
        sent_count = 0
        failed_count = 0
        
        for device in devices:
            try:
                # Prepare FCM message
                fcm_message = messaging.Message(
                    notification=messaging.Notification(
                        title=title,
                        body=message
                    ),
                    data=data or {},
                    token=device.fcm_token,
                    android=messaging.AndroidConfig(
                        priority='high',
                        notification=messaging.AndroidNotification(
                            sound='default',
                            color='#FF6B35'
                        )
                    ),
                    apns=messaging.APNSConfig(
                        payload=messaging.APNSPayload(
                            aps=messaging.Aps(
                                sound='default',
                                badge=1
                            )
                        )
                    )
                )
                
                # Send via Firebase
                response = messaging.send(fcm_message)
                
                # Log success
                PushNotificationLog.objects.create(
                    user_id=user_id,
                    device_id=device.id,
                    title=title,
                    message=message,
                    status='sent',
                    message_id=response,
                    sent_at=timezone.now()
                )
                
                sent_count += 1
                logger.info(f"Push sent to device {device.id}, message_id: {response}")
                
            except messaging.UnregisteredError:
                logger.warning(f"FCM token invalid for device {device.id}, disabling")
                device.fcm_token = None
                device.push_enabled = False
                device.save()
                failed_count += 1
                
            except Exception as e:
                logger.error(f"Failed to send push to device {device.id}: {str(e)}")
                PushNotificationLog.objects.create(
                    user_id=user_id,
                    device_id=device.id,
                    title=title,
                    message=message,
                    status='failed',
                    error_message=str(e),
                    sent_at=timezone.now()
                )
                failed_count += 1
        
        # Create notification record
        Notification.objects.create(
            user_id=user_id,
            title=title,
            message=message,
            notification_type='push',
            status='delivered' if sent_count > 0 else 'failed'
        )
        
        return {'sent': sent_count, 'failed': failed_count}
        
    except Exception as exc:
        logger.error(f"Failed to send push notification: {str(exc)}")
        raise self.retry(exc=exc, countdown=30)


@shared_task
def send_bulk_notifications(notification_data):
    """Send bulk notifications"""
    from .models import NotificationBatch
    
    batch_id = notification_data.get('batch_id')
    notification_type = notification_data.get('type')
    recipients = notification_data.get('recipients', [])
    message = notification_data.get('message')
    
    sent_count = 0
    failed_count = 0
    
    for recipient in recipients:
        try:
            if notification_type == 'sms':
                send_sms.delay(recipient['phone'], message)
            elif notification_type == 'email':
                send_email.delay(recipient['email'], notification_data.get('subject'), message)
            elif notification_type == 'push':
                send_push_notification.delay(recipient['user_id'], notification_data.get('title'), message)
            
            sent_count += 1
        except Exception as e:
            logger.error(f"Failed to send to recipient: {str(e)}")
            failed_count += 1
    
    # Update batch status
    if batch_id:
        try:
            batch = NotificationBatch.objects.get(id=batch_id)
            batch.sent_count = sent_count
            batch.failed_count = failed_count
            batch.status = 'completed'
            batch.save()
        except NotificationBatch.DoesNotExist:
            pass
    
    return {'sent': sent_count, 'failed': failed_count}


@shared_task
def send_notification_batch(batch_id):
    """Process notification batch"""
    from .models import NotificationBatch
    
    try:
        batch = NotificationBatch.objects.get(id=batch_id)
        
        # Process batch recipients
        recipients = batch.recipients  # JSONField
        
        send_bulk_notifications.delay({
            'batch_id': str(batch.id),
            'type': batch.notification_type,
            'recipients': recipients,
            'message': batch.message,
            'title': batch.title,
            'subject': batch.subject
        })
        
        return {'batch_id': str(batch.id)}
        
    except NotificationBatch.DoesNotExist:
        logger.error(f"Batch {batch_id} not found")
        return {'error': 'Batch not found'}


@shared_task
def retry_failed_notifications():
    """Retry failed notifications"""
    from .models import Notification
    
    failed = Notification.objects.filter(
        status='failed',
        retry_count__lt=3
    )
    
    retried_count = 0
    
    for notification in failed:
        try:
            if notification.notification_type == 'sms':
                send_sms.delay(notification.recipient_phone, notification.message)
            elif notification.notification_type == 'email':
                send_email.delay(notification.recipient_email, notification.subject, notification.message)
            elif notification.notification_type == 'push':
                send_push_notification.delay(str(notification.user_id), notification.title, notification.message)
            
            notification.retry_count += 1
            notification.save()
            retried_count += 1
        except Exception as e:
            logger.error(f"Failed to retry notification {notification.id}: {str(e)}")
    
    return {'retried': retried_count}


@shared_task
def cleanup_old_notifications():
    """Cleanup old read notifications"""
    from .models import Notification
    
    cutoff_date = timezone.now() - timezone.timedelta(days=90)
    
    deleted_count = Notification.objects.filter(
        is_read=True,
        read_at__lt=cutoff_date
    ).delete()[0]
    
    logger.info(f"Deleted {deleted_count} old notifications")
    return {'deleted': deleted_count}


@shared_task
def send_scheduled_notifications():
    """Send scheduled notifications"""
    from .models import Notification
    
    now = timezone.now()
    
    scheduled = Notification.objects.filter(
        status='scheduled',
        scheduled_for__lte=now
    )
    
    sent_count = 0
    
    for notification in scheduled:
        try:
            if notification.notification_type == 'sms':
                send_sms.delay(notification.recipient_phone, notification.message)
            elif notification.notification_type == 'email':
                send_email.delay(notification.recipient_email, notification.subject, notification.message)
            elif notification.notification_type == 'push':
                send_push_notification.delay(str(notification.user_id), notification.title, notification.message)
            
            notification.status = 'sent'
            notification.save()
            sent_count += 1
        except Exception as e:
            logger.error(f"Failed to send scheduled notification {notification.id}: {str(e)}")
    
    return {'sent': sent_count}
