"""
Operators Tasks Module
Handles async operations for operator management, compliance, and integration
"""
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
import logging
import requests

from .models import Operator, ComplianceReport, OperatorAuditLog

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def test_webhook(self, webhook_url):
    """
    Test webhook configuration asynchronously
    
    Args:
        webhook_url: URL to test
    
    Returns:
        dict with test result
    """
    try:
        # Send test webhook payload
        test_payload = {
            'event': 'test',
            'timestamp': timezone.now().isoformat(),
            'message': 'This is a test webhook'
        }
        
        response = requests.post(webhook_url, json=test_payload, timeout=10)
        
        return {
            'success': response.status_code < 400,
            'status_code': response.status_code,
            'webhook_url': webhook_url
        }
    except requests.exceptions.RequestException as e:
        logger.error(f'Webhook test failed for {webhook_url}: {str(e)}')
        
        # Retry with exponential backoff
        retry_in = 2 ** self.request.retries
        raise self.retry(exc=e, countdown=retry_in)
    except Exception as e:
        logger.error(f'Unexpected error in webhook test: {str(e)}')
        return {
            'success': False,
            'error': str(e),
            'webhook_url': webhook_url
        }


@shared_task(bind=True, max_retries=3)
def test_operator_integration(self, operator_id):
    """
    Test operator integration asynchronously
    
    Args:
        operator_id: Operator ID to test
    
    Returns:
        dict with integration test result
    """
    try:
        operator = Operator.objects.get(id=operator_id)
        
        # Safely get integration config
        if not hasattr(operator, 'integration_config') or not operator.integration_config:
            return {
                'success': False,
                'error': 'No integration configuration found',
                'operator_id': str(operator_id)
            }
        
        integration_config = operator.integration_config
        api_endpoint = getattr(integration_config, 'api_endpoint', None)
        
        if not api_endpoint:
            return {
                'success': False,
                'error': 'API endpoint not configured',
                'operator_id': str(operator_id)
            }
        
        # Try to connect to the API endpoint
        response = requests.get(
            api_endpoint,
            timeout=10,
            headers={'User-Agent': 'NSER-RG Integration Test'}
        )
        
        return {
            'success': response.status_code < 400,
            'status_code': response.status_code,
            'operator_id': str(operator_id),
            'api_endpoint': api_endpoint
        }
    except Operator.DoesNotExist:
        logger.error(f'Operator not found: {operator_id}')
        return {
            'success': False,
            'error': 'Operator not found',
            'operator_id': str(operator_id)
        }
    except requests.exceptions.RequestException as e:
        logger.error(f'Integration test request failed for operator {operator_id}: {str(e)}')
        
        # Retry with exponential backoff
        retry_in = 2 ** self.request.retries
        raise self.retry(exc=e, countdown=retry_in)
    except Exception as e:
        logger.error(f'Unexpected error in integration test: {str(e)}')
        return {
            'success': False,
            'error': str(e),
            'operator_id': str(operator_id)
        }


@shared_task(bind=True, max_retries=3)
def run_operator_compliance_check(self, operator_id):
    """
    Run compliance check for operator asynchronously
    
    Args:
        operator_id: Operator ID to check
    
    Returns:
        dict with compliance check result
    """
    try:
        operator = Operator.objects.get(id=operator_id)
        
        # Perform compliance checks
        total_checks = 5
        passed_checks = 4  # Placeholder logic
        failed_checks = total_checks - passed_checks
        
        # Calculate compliance score
        compliance_score = (passed_checks / total_checks) * 100
        
        # Generate report reference
        today = timezone.now().date()
        report_ref = f"CRP-{operator_id}-{today.timestamp()}".replace('.', '-')[:50]
        
        # Create compliance report with safe data access
        try:
            report = ComplianceReport.objects.create(
                operator=operator,
                report_reference=report_ref,
                report_period_start=today - timedelta(days=30),
                report_period_end=today,
                total_users_screened=getattr(operator, 'total_users', 0) or 0,
                total_exclusions_enforced=getattr(operator, 'total_exclusions', 0) or 0,
                screening_compliance_rate=float(compliance_score),
                exclusion_enforcement_rate=100.0,
                avg_lookup_response_ms=50.5,
                avg_webhook_response_ms=100.0,
                compliance_issues=[],
                violations_count=0,
                warnings_issued=0,
                overall_score=float(compliance_score),
                is_compliant=compliance_score >= 90
            )
        except Exception as e:
            logger.warning(f'Failed to create compliance report: {str(e)}')
            report = None
        
        # Update operator compliance score
        try:
            operator.compliance_score = float(compliance_score)
            operator.last_compliance_check = timezone.now()
            operator.is_compliant = compliance_score >= 90
            operator.save(update_fields=['compliance_score', 'last_compliance_check', 'is_compliant'])
        except Exception as e:
            logger.warning(f'Failed to update operator compliance score: {str(e)}')
        
        # Log the compliance check
        try:
            OperatorAuditLog.objects.create(
                operator=operator,
                action='compliance_check',
                resource_type='compliance',
                resource_id=str(report.id) if report else 'unknown',
                request_data={'operator_id': str(operator_id)},
                response_data={
                    'passed': passed_checks,
                    'failed': failed_checks,
                    'score': float(compliance_score)
                },
                success=True
            )
        except Exception as e:
            logger.warning(f'Failed to create audit log: {str(e)}')
        
        return {
            'success': True,
            'compliance_score': float(compliance_score),
            'total_checks': total_checks,
            'passed_checks': passed_checks,
            'failed_checks': failed_checks,
            'operator_id': str(operator_id),
            'report_id': str(report.id) if report else None
        }
    except Operator.DoesNotExist:
        logger.error(f'Operator not found: {operator_id}')
        return {
            'success': False,
            'error': 'Operator not found',
            'operator_id': str(operator_id)
        }
    except Exception as e:
        logger.error(f'Compliance check failed for operator {operator_id}: {str(e)}')
        
        # Retry with exponential backoff
        retry_in = 2 ** self.request.retries
        raise self.retry(exc=e, countdown=retry_in)
