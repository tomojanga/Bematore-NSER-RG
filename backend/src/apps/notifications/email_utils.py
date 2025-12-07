"""
Email Utilities - Central email sending service
Provides helper functions to send emails from any view or task
"""
from typing import Dict, Optional, List
from django.conf import settings
from apps.notifications.tasks import send_email, send_sms
from apps.notifications.email_templates import (
    create_exclusion_confirmation_email,
    create_exclusion_expiry_reminder_email,
    create_assessment_reminder_email,
    create_password_reset_email,
    create_compliance_notice_email,
    create_system_alert_email
)
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """Central service for sending emails across the application"""
    
    # Default company settings (can be overridden per instance)
    DEFAULT_COMPANY_NAME = getattr(settings, 'COMPANY_NAME', 'NSER')
    DEFAULT_SUPPORT_EMAIL = getattr(settings, 'SUPPORT_EMAIL', 'support@example.com')
    DEFAULT_SUPPORT_PHONE = getattr(settings, 'SUPPORT_PHONE', '+1 XXX XXX XXXX')
    DEFAULT_PORTAL_URL = getattr(settings, 'PORTAL_URL', 'https://portal.example.com')
    
    @staticmethod
    def send_exclusion_confirmation(user_email: str, user_name: str, exclusion_data: Dict,
                                   company_name: str = None, async_task: bool = True) -> bool:
        """Send self-exclusion confirmation email"""
        try:
            company_name = company_name or EmailService.DEFAULT_COMPANY_NAME
            
            html = create_exclusion_confirmation_email(
                user_name=user_name,
                exclusion_ref=exclusion_data.get('exclusion_reference', 'N/A'),
                start_date=exclusion_data.get('start_date', ''),
                expiry_date=exclusion_data.get('expiry_date', ''),
                period=exclusion_data.get('period', ''),
                company_name=company_name
            )
            
            subject = f"Self-Exclusion Confirmation - {company_name}"
            
            if async_task:
                send_email.delay(user_email, subject, '', html_content=html)
            else:
                from django.core.mail import send_mail
                send_mail(
                    subject=subject,
                    message='See HTML version',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user_email],
                    html_message=html,
                    fail_silently=False
                )
            
            logger.info(f"Exclusion confirmation email queued for {user_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send exclusion confirmation email: {str(e)}")
            return False
    
    @staticmethod
    def send_exclusion_expiry_reminder(user_email: str, user_name: str, days_remaining: int,
                                      expiry_date: str, company_name: str = None,
                                      portal_url: str = None, async_task: bool = True) -> bool:
        """Send self-exclusion expiry reminder email"""
        try:
            company_name = company_name or EmailService.DEFAULT_COMPANY_NAME
            portal_url = portal_url or f"{EmailService.DEFAULT_PORTAL_URL}/dashboard/exclusion"
            
            html = create_exclusion_expiry_reminder_email(
                user_name=user_name,
                days_remaining=days_remaining,
                expiry_date=expiry_date,
                company_name=company_name,
                portal_url=portal_url
            )
            
            subject = f"Your Self-Exclusion Expires in {days_remaining} Days"
            
            if async_task:
                send_email.delay(user_email, subject, '', html_content=html)
            else:
                from django.core.mail import send_mail
                send_mail(
                    subject=subject,
                    message='See HTML version',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user_email],
                    html_message=html,
                    fail_silently=False
                )
            
            logger.info(f"Expiry reminder email queued for {user_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send expiry reminder email: {str(e)}")
            return False
    
    @staticmethod
    def send_assessment_reminder(user_email: str, user_name: str, due_date: str,
                                company_name: str = None, portal_url: str = None,
                                async_task: bool = True) -> bool:
        """Send risk assessment reminder email"""
        try:
            company_name = company_name or EmailService.DEFAULT_COMPANY_NAME
            portal_url = portal_url or f"{EmailService.DEFAULT_PORTAL_URL}/dashboard/assessment"
            
            html = create_assessment_reminder_email(
                user_name=user_name,
                assessment_due_date=due_date,
                company_name=company_name,
                portal_url=portal_url
            )
            
            subject = "Your Risk Assessment is Due"
            
            if async_task:
                send_email.delay(user_email, subject, '', html_content=html)
            else:
                from django.core.mail import send_mail
                send_mail(
                    subject=subject,
                    message='See HTML version',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user_email],
                    html_message=html,
                    fail_silently=False
                )
            
            logger.info(f"Assessment reminder email queued for {user_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send assessment reminder email: {str(e)}")
            return False
    
    @staticmethod
    def send_password_reset(user_email: str, user_name: str, reset_url: str,
                           expiry_hours: int = 24, company_name: str = None,
                           async_task: bool = True) -> bool:
        """Send password reset email"""
        try:
            company_name = company_name or EmailService.DEFAULT_COMPANY_NAME
            
            html = create_password_reset_email(
                user_name=user_name,
                reset_url=reset_url,
                expiry_hours=expiry_hours,
                company_name=company_name
            )
            
            subject = "Reset Your Password"
            
            if async_task:
                send_email.delay(user_email, subject, '', html_content=html)
            else:
                from django.core.mail import send_mail
                send_mail(
                    subject=subject,
                    message='See HTML version',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user_email],
                    html_message=html,
                    fail_silently=False
                )
            
            logger.info(f"Password reset email queued for {user_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send password reset email: {str(e)}")
            return False
    
    @staticmethod
    def send_compliance_notice(user_email: str, user_name: str, notice_title: str,
                              notice_content: str, action_url: str = None,
                              company_name: str = None, async_task: bool = True) -> bool:
        """Send compliance notice email"""
        try:
            company_name = company_name or EmailService.DEFAULT_COMPANY_NAME
            
            html = create_compliance_notice_email(
                user_name=user_name,
                notice_title=notice_title,
                notice_content=notice_content,
                action_url=action_url,
                company_name=company_name
            )
            
            subject = f"Important Compliance Notice: {notice_title}"
            
            if async_task:
                send_email.delay(user_email, subject, '', html_content=html)
            else:
                from django.core.mail import send_mail
                send_mail(
                    subject=subject,
                    message='See HTML version',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user_email],
                    html_message=html,
                    fail_silently=False
                )
            
            logger.info(f"Compliance notice email queued for {user_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send compliance notice email: {str(e)}")
            return False
    
    @staticmethod
    def send_system_alert(user_email: str, alert_title: str, alert_message: str,
                         severity: str = "info", company_name: str = None,
                         async_task: bool = True) -> bool:
        """Send system alert email"""
        try:
            company_name = company_name or EmailService.DEFAULT_COMPANY_NAME
            
            html = create_system_alert_email(
                alert_title=alert_title,
                alert_message=alert_message,
                severity=severity,
                company_name=company_name
            )
            
            subject = f"System Alert: {alert_title}"
            
            if async_task:
                send_email.delay(user_email, subject, '', html_content=html)
            else:
                from django.core.mail import send_mail
                send_mail(
                    subject=subject,
                    message='See HTML version',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user_email],
                    html_message=html,
                    fail_silently=False
                )
            
            logger.info(f"System alert email queued for {user_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send system alert email: {str(e)}")
            return False
    
    @staticmethod
    def send_generic_email(to_email: str, subject: str, html_content: str,
                          async_task: bool = True) -> bool:
        """Send generic email with custom HTML"""
        try:
            if async_task:
                send_email.delay(to_email, subject, '', html_content=html_content)
            else:
                from django.core.mail import send_mail
                send_mail(
                    subject=subject,
                    message='See HTML version',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[to_email],
                    html_message=html_content,
                    fail_silently=False
                )
            
            logger.info(f"Generic email queued for {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send generic email: {str(e)}")
            return False
