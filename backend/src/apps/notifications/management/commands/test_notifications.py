"""
Management command to test notification system
Usage: python manage.py test_notifications
"""
from django.core.management.base import BaseCommand, CommandError
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
import logging
from apps.notifications.models import Notification, EmailLog, SMSLog
from apps.notifications.tasks import send_email, send_sms
from apps.notifications.email_templates import (
    create_exclusion_confirmation_email,
    create_exclusion_expiry_reminder_email,
    create_assessment_reminder_email,
    create_password_reset_email
)

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Test notification system (email, SMS, push)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--type',
            type=str,
            choices=['email', 'sms', 'all'],
            default='all',
            help='Type of notification to test'
        )
        parser.add_argument(
            '--email',
            type=str,
            default=None,
            help='Email address to send test email to'
        )
        parser.add_argument(
            '--phone',
            type=str,
            default=None,
            help='Phone number to send test SMS to'
        )
        parser.add_argument(
            '--template',
            type=str,
            choices=['exclusion', 'expiry', 'assessment', 'password'],
            default='exclusion',
            help='Email template type to test'
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('\n🚀 Testing Notification System'))
        self.stdout.write('=' * 60)

        notification_type = options['type']
        test_email = options['email'] or getattr(settings, 'DEFAULT_FROM_EMAIL', 'test@example.com')
        test_phone = options['phone'] or '+254700000000'
        template_type = options['template']

        # Check configuration
        self.stdout.write('\n📋 Checking Configuration...')
        self._check_config()

        # Test Email
        if notification_type in ['email', 'all']:
            self.stdout.write('\n📧 Testing Email System')
            self.stdout.write('-' * 60)
            self._test_email(test_email, template_type)

        # Test SMS
        if notification_type in ['sms', 'all']:
            self.stdout.write('\n📱 Testing SMS System')
            self.stdout.write('-' * 60)
            self._test_sms(test_phone)

        # Show summary
        self.stdout.write('\n📊 Database Summary')
        self.stdout.write('-' * 60)
        self._show_summary()

        self.stdout.write(self.style.SUCCESS('\n✓ Testing Complete!\n'))

    def _check_config(self):
        """Check if notification services are configured"""
        
        # Email configuration
        if hasattr(settings, 'SENDGRID_API_KEY') and settings.SENDGRID_API_KEY:
            self.stdout.write(self.style.SUCCESS('✓ SendGrid configured'))
        else:
            self.stdout.write(self.style.WARNING('⚠ SendGrid not configured'))

        # SMS configuration
        if hasattr(settings, 'AFRICASTALKING_USERNAME') and settings.AFRICASTALKING_USERNAME:
            self.stdout.write(self.style.SUCCESS('✓ Africa\'s Talking configured'))
        else:
            self.stdout.write(self.style.WARNING('⚠ Africa\'s Talking not configured'))

        # Email backend
        email_backend = getattr(settings, 'EMAIL_BACKEND', '')
        self.stdout.write(f"  Email Backend: {email_backend}")

    def _test_email(self, test_email, template_type='exclusion'):
        """Test email sending"""
        self.stdout.write(f'\nTarget Email: {test_email}')

        # Generate HTML from template
        if template_type == 'exclusion':
            html = create_exclusion_confirmation_email(
                user_name='Test User',
                exclusion_ref='TEST-2024-001',
                start_date='2024-01-15',
                expiry_date='2025-01-15',
                period='1 Year'
            )
            subject = 'Test: Self-Exclusion Confirmation'

        elif template_type == 'expiry':
            html = create_exclusion_expiry_reminder_email(
                user_name='Test User',
                days_remaining=30,
                expiry_date='2025-02-15'
            )
            subject = 'Test: Exclusion Expiry Reminder'

        elif template_type == 'assessment':
            html = create_assessment_reminder_email(
                user_name='Test User',
                assessment_due_date='2024-02-15'
            )
            subject = 'Test: Assessment Reminder'

        elif template_type == 'password':
            html = create_password_reset_email(
                user_name='Test User',
                reset_url='https://citizen.bematore.com/reset?token=test123'
            )
            subject = 'Test: Password Reset'

        else:
            raise CommandError(f'Unknown template type: {template_type}')

        # Test with Django email backend
        try:
            self.stdout.write(f'Subject: {subject}')
            self.stdout.write('Attempting to send test email...')

            send_mail(
                subject=subject,
                message='See HTML version',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[test_email],
                html_message=html,
                fail_silently=False
            )

            self.stdout.write(self.style.SUCCESS('✓ Email sent successfully (via Django backend)'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Email failed: {str(e)}'))

        # Test with Celery task
        if hasattr(settings, 'SENDGRID_API_KEY') and settings.SENDGRID_API_KEY:
            try:
                self.stdout.write('Queuing email via Celery (SendGrid)...')
                task = send_email.delay(
                    test_email,
                    subject,
                    'See HTML version',
                    html_content=html
                )
                self.stdout.write(self.style.SUCCESS(f'✓ Queued (Task ID: {task.id})'))

            except Exception as e:
                self.stdout.write(self.style.WARNING(f'⚠ Celery queue failed: {str(e)}'))

    def _test_sms(self, test_phone):
        """Test SMS sending"""
        self.stdout.write(f'\nTarget Phone: {test_phone}')

        message = 'GRAK TEST: This is a test SMS from the notification system. No action needed.'

        # Test with Celery task
        try:
            self.stdout.write('Queuing SMS via Celery (Africa\'s Talking)...')
            task = send_sms.delay(test_phone, message)
            self.stdout.write(self.style.SUCCESS(f'✓ Queued (Task ID: {task.id})'))
            self.stdout.write('  Note: SMS will be sent asynchronously. Check SMS logs in admin.')

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ SMS queue failed: {str(e)}'))

    def _show_summary(self):
        """Show notification statistics"""
        
        total_notifications = Notification.objects.count()
        sent = Notification.objects.filter(status='sent').count()
        delivered = Notification.objects.filter(status='delivered').count()
        failed = Notification.objects.filter(status='failed').count()
        pending = Notification.objects.filter(status='pending').count()

        self.stdout.write(f'Total Notifications: {total_notifications}')
        self.stdout.write(f'  ✓ Sent: {sent}')
        self.stdout.write(f'  ✓ Delivered: {delivered}')
        self.stdout.write(f'  ✗ Failed: {failed}')
        self.stdout.write(f'  ⏳ Pending: {pending}')

        email_logs = EmailLog.objects.count()
        sms_logs = SMSLog.objects.count()

        self.stdout.write(f'\nEmail Logs: {email_logs}')
        self.stdout.write(f'SMS Logs: {sms_logs}')

        # Show latest
        latest_notif = Notification.objects.order_by('-created_at').first()
        if latest_notif:
            self.stdout.write(f'\nLatest Notification:')
            self.stdout.write(f'  ID: {latest_notif.id}')
            self.stdout.write(f'  Type: {latest_notif.notification_type}')
            self.stdout.write(f'  Status: {latest_notif.status}')
            self.stdout.write(f'  Created: {latest_notif.created_at}')
