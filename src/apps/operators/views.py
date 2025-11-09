"""
Operators Views
Operator onboarding, licensing, API key management, integration
"""
from rest_framework import status, viewsets, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.utils import timezone
from django.db import transaction
import secrets

from .models import Operator, OperatorLicense, APIKey, IntegrationConfig, ComplianceReport, OperatorAuditLog
from .serializers import (
    OperatorListSerializer, OperatorDetailSerializer,
    OperatorLicenseSerializer, APIKeySerializer, APIKeyDetailSerializer,
    IntegrationConfigSerializer, ComplianceReportSerializer,
    OperatorAuditLogSerializer, RegisterOperatorSerializer,
    GenerateAPIKeySerializer, UpdateIntegrationSerializer,
    TestWebhookSerializer
)
from apps.api.permissions import IsGRAKStaff, IsOperator
from apps.api.mixins import TimingMixin, SuccessResponseMixin


class OperatorViewSet(TimingMixin, viewsets.ModelViewSet):
    """Operator CRUD ViewSet"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return OperatorListSerializer
        return OperatorDetailSerializer
    
    def get_queryset(self):
        queryset = Operator.objects.prefetch_related('api_keys', 'licenses')
        
        # Filter by license_status
        license_status = self.request.query_params.get('license_status')
        if license_status:
            queryset = queryset.filter(license_status=license_status)
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve operator registration"""
        operator = self.get_object()
        operator.status = 'active'
        operator.is_approved = True
        operator.approved_by = request.user
        operator.approved_at = timezone.now()
        operator.save()
        
        return Response({'message': 'Operator approved successfully'})
    
    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        """Suspend operator"""
        operator = self.get_object()
        operator.status = 'suspended'
        operator.is_active = False
        operator.save()
        
        # Deactivate all API keys
        operator.api_keys.update(is_active=False)
        
        return Response({'message': 'Operator suspended'})
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate operator"""
        operator = self.get_object()
        operator.status = 'active'
        operator.is_active = True
        operator.save()
        
        return Response({'message': 'Operator activated'})


class RegisterOperatorView(TimingMixin, SuccessResponseMixin, APIView):
    """Register new operator"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    @transaction.atomic
    def post(self, request):
        serializer = RegisterOperatorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create operator
        operator = Operator.objects.create(
            company_name=serializer.validated_data['company_name'],
            trading_name=serializer.validated_data.get('trading_name'),
            business_registration_number=serializer.validated_data['business_registration_number'],
            tax_identification_number=serializer.validated_data.get('tax_identification_number'),
            contact_person_name=serializer.validated_data['contact_person_name'],
            contact_person_email=serializer.validated_data['contact_person_email'],
            contact_person_phone=serializer.validated_data['contact_person_phone'],
            physical_address=serializer.validated_data.get('physical_address'),
            postal_address=serializer.validated_data.get('postal_address'),
            website_url=serializer.validated_data.get('website_url'),
            status='pending_approval',
            is_active=False
        )
        
        # Create license if provided
        if serializer.validated_data.get('license_number'):
            OperatorLicense.objects.create(
                operator=operator,
                license_number=serializer.validated_data['license_number'],
                license_type=serializer.validated_data.get('license_type', 'online'),
                issue_date=serializer.validated_data.get('issue_date'),
                expiry_date=serializer.validated_data.get('expiry_date'),
                status='active'
            )
        
        return self.success_response(
            data=OperatorDetailSerializer(operator).data,
            message='Operator registered. Pending approval.',
            status_code=status.HTTP_201_CREATED
        )


class OperatorLicenseViewSet(TimingMixin, viewsets.ModelViewSet):
    """Operator license management"""
    serializer_class = OperatorLicenseSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return OperatorLicense.objects.select_related('operator').order_by('-issue_date')
    
    @action(detail=True, methods=['post'])
    def renew(self, request, pk=None):
        """Renew license"""
        license = self.get_object()
        
        from datetime import timedelta
        new_expiry = license.expiry_date + timedelta(days=365)
        
        license.expiry_date = new_expiry
        license.renewal_count += 1
        license.last_renewed_at = timezone.now()
        license.save()
        
        return Response({'message': 'License renewed', 'new_expiry_date': str(new_expiry)})


class APIKeyViewSet(TimingMixin, viewsets.ModelViewSet):
    """API key management"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return APIKeyDetailSerializer
        return APIKeySerializer
    
    def get_queryset(self):
        user = self.request.user
        
        # Allow access for GRAK staff and operators
        if not hasattr(user, 'role'):
            return APIKey.objects.none()
        
        if user.role in ['grak_admin', 'grak_officer']:
            return APIKey.objects.select_related('operator').order_by('-created_at')
        elif user.role == 'operator_admin':
            # Get operator for this user
            try:
                operator = Operator.objects.get(contact_person_email=user.email)
                return APIKey.objects.filter(operator=operator)
            except Operator.DoesNotExist:
                return APIKey.objects.none()
        
        return APIKey.objects.none()
    
    @action(detail=True, methods=['post'])
    def rotate(self, request, pk=None):
        """Rotate API key"""
        old_key = self.get_object()
        
        # Deactivate old key
        old_key.is_active = False
        old_key.save()
        
        # Generate new key
        new_key = APIKey.objects.create(
            operator=old_key.operator,
            key_name=f"{old_key.key_name} (Rotated)",
            api_key=secrets.token_urlsafe(32),
            can_lookup=old_key.can_lookup,
            can_register=old_key.can_register,
            can_screen=old_key.can_screen,
            rate_limit=old_key.rate_limit,
            expires_at=old_key.expires_at
        )
        
        return Response({
            'message': 'API key rotated',
            'new_key': APIKeyDetailSerializer(new_key).data
        })
    
    @action(detail=True, methods=['post'])
    def revoke(self, request, pk=None):
        """Revoke API key"""
        api_key = self.get_object()
        api_key.is_active = False
        api_key.revoked_at = timezone.now()
        api_key.save()
        
        return Response({'message': 'API key revoked'})


class GenerateAPIKeyView(TimingMixin, SuccessResponseMixin, APIView):
    """Generate new API key"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    @transaction.atomic
    def post(self, request):
        serializer = GenerateAPIKeySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        operator = Operator.objects.get(id=serializer.validated_data['operator_id'])
        
        # Generate API key
        api_key = APIKey.objects.create(
            operator=operator,
            key_name=serializer.validated_data['key_name'],
            api_key=secrets.token_urlsafe(32),
            can_lookup=serializer.validated_data.get('can_lookup', True),
            can_register=serializer.validated_data.get('can_register', True),
            can_screen=serializer.validated_data.get('can_screen', True),
            rate_limit=serializer.validated_data.get('rate_limit', 1000),
            ip_whitelist=serializer.validated_data.get('ip_whitelist'),
            expires_at=serializer.validated_data.get('expires_at')
        )
        
        return self.success_response(
            data=APIKeyDetailSerializer(api_key).data,
            message='API key generated successfully',
            status_code=status.HTTP_201_CREATED
        )


class IntegrationConfigViewSet(TimingMixin, viewsets.ModelViewSet):
    """Integration configuration management"""
    serializer_class = IntegrationConfigSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role in ['grak_admin', 'grak_officer']:
            return IntegrationConfig.objects.select_related('operator')
        elif user.role == 'operator_admin':
            try:
                operator = Operator.objects.get(contact_person_email=user.email)
                return IntegrationConfig.objects.filter(operator=operator)
            except Operator.DoesNotExist:
                return IntegrationConfig.objects.none()
        
        return IntegrationConfig.objects.none()


class UpdateIntegrationView(TimingMixin, SuccessResponseMixin, APIView):
    """Update integration configuration"""
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def put(self, request, pk):
        config = IntegrationConfig.objects.get(pk=pk)
        
        serializer = UpdateIntegrationSerializer(config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return self.success_response(
            data=IntegrationConfigSerializer(config).data,
            message='Integration updated'
        )


class TestWebhookView(TimingMixin, SuccessResponseMixin, APIView):
    """Test webhook configuration"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = TestWebhookSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        webhook_url = serializer.validated_data['webhook_url']
        
        # Send test webhook
        from .tasks import test_webhook
        task = test_webhook.delay(webhook_url)
        
        return self.success_response(
            data={'task_id': task.id},
            message='Webhook test initiated'
        )


class ComplianceReportViewSet(TimingMixin, viewsets.ReadOnlyModelViewSet):
    """Compliance report management"""
    serializer_class = ComplianceReportSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role in ['grak_admin', 'grak_officer']:
            return ComplianceReport.objects.select_related('operator').order_by('-report_date')
        elif user.role == 'operator_admin':
            try:
                operator = Operator.objects.get(contact_person_email=user.email)
                return ComplianceReport.objects.filter(operator=operator).order_by('-report_date')
            except Operator.DoesNotExist:
                return ComplianceReport.objects.none()
        
        return ComplianceReport.objects.none()


class OperatorAuditLogViewSet(TimingMixin, viewsets.ReadOnlyModelViewSet):
    """Operator audit logs"""
    serializer_class = OperatorAuditLogSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return OperatorAuditLog.objects.select_related('operator', 'performed_by').order_by('-created_at')


class OperatorStatisticsView(TimingMixin, SuccessResponseMixin, APIView):
    """Operator statistics"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        stats = {
            'total_operators': Operator.objects.count(),
            'active_operators': Operator.objects.filter(license_status='active').count(),
            'pending_approval': Operator.objects.filter(license_status='pending').count(),
            'suspended_operators': Operator.objects.filter(license_status='suspended').count(),
            'total_api_keys': APIKey.objects.count(),
            'active_api_keys': APIKey.objects.filter(is_active=True).count(),
            'expired_licenses': OperatorLicense.objects.filter(
                expiry_date__lt=timezone.now().date()
            ).count()
        }
        
        return self.success_response(data=stats)


class OperatorPerformanceView(TimingMixin, SuccessResponseMixin, APIView):
    """Operator performance metrics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        operator = Operator.objects.get(pk=pk)
        
        # Check permissions
        if request.user.role not in ['grak_admin', 'grak_officer']:
            if request.user.role == 'operator_admin':
                if operator.contact_person_email != request.user.email:
                    return self.error_response(
                        message='Not authorized',
                        status_code=status.HTTP_403_FORBIDDEN
                    )
            else:
                return self.error_response(
                    message='Not authorized',
                    status_code=status.HTTP_403_FORBIDDEN
                )
        
        metrics = {
            'operator_id': str(operator.id),
            'company_name': operator.company_name,
            'api_calls_today': 0,
            'average_response_time_ms': 0,
            'success_rate': 0,
            'compliance_score': operator.compliance_score,
            'last_activity': operator.last_activity_at.isoformat() if operator.last_activity_at else None
        }
        
        return self.success_response(data=metrics)


class MyOperatorView(TimingMixin, SuccessResponseMixin, APIView):
    """Get current operator details"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Check if user is operator or GRAK staff
        if not hasattr(request.user, 'role') or request.user.role not in ['operator_admin', 'grak_admin', 'grak_officer']:
            return self.error_response(
                message='Access denied. Operator or GRAK staff role required.',
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        try:
            # Try email first, then phone_number
            operator = Operator.objects.filter(email=request.user.email).first()
            if not operator:
                operator = Operator.objects.filter(phone=request.user.phone_number).first()
            
            if not operator:
                return self.error_response(
                    message='Operator not found. Please complete registration.',
                    status_code=status.HTTP_404_NOT_FOUND
                )
            
            return self.success_response(
                data=OperatorDetailSerializer(operator).data
            )
        except Exception as e:
            return self.error_response(
                message=f'Error: {str(e)}',
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class OnboardOperatorView(TimingMixin, SuccessResponseMixin, APIView):
    """Onboard operator"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    @transaction.atomic
    def post(self, request):
        operator_id = request.data.get('operator_id')
        operator = Operator.objects.get(id=operator_id)
        
        operator.status = 'onboarding'
        operator.save()
        
        return self.success_response(message='Operator onboarding started')


class ActivateOperatorView(TimingMixin, SuccessResponseMixin, APIView):
    """Activate operator"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request, pk):
        operator = Operator.objects.get(pk=pk)
        operator.license_status = 'active'
        operator.is_api_active = True
        operator.save()
        
        return self.success_response(message='Operator activated')


class SuspendOperatorView(TimingMixin, SuccessResponseMixin, APIView):
    """Suspend operator"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request, pk):
        operator = Operator.objects.get(pk=pk)
        operator.license_status = 'suspended'
        operator.is_api_active = False
        operator.save()
        
        # Deactivate API keys
        operator.api_keys.update(is_active=False)
        
        return self.success_response(message='Operator suspended')


class IssueLicenseView(TimingMixin, SuccessResponseMixin, APIView):
    """Issue license"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    @transaction.atomic
    def post(self, request, pk):
        operator = Operator.objects.get(pk=pk)
        
        license = OperatorLicense.objects.create(
            operator=operator,
            license_number=request.data['license_number'],
            license_type=request.data.get('license_type', 'online'),
            issue_date=request.data['issue_date'],
            expiry_date=request.data['expiry_date'],
            status='active'
        )
        
        return self.success_response(
            data=OperatorLicenseSerializer(license).data,
            message='License issued',
            status_code=status.HTTP_201_CREATED
        )


class RenewLicenseView(TimingMixin, SuccessResponseMixin, APIView):
    """Renew license"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    @transaction.atomic
    def post(self, request, pk):
        from datetime import timedelta
        
        operator = Operator.objects.get(pk=pk)
        license = operator.license
        
        license.expiry_date = license.expiry_date + timedelta(days=365)
        license.renewal_count += 1
        license.last_renewed_at = timezone.now()
        license.save()
        
        return self.success_response(message='License renewed')


class RevokeLicenseView(TimingMixin, SuccessResponseMixin, APIView):
    """Revoke license"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request, pk):
        operator = Operator.objects.get(pk=pk)
        license = operator.license
        
        license.status = 'revoked'
        license.revoked_at = timezone.now()
        license.save()
        
        # Suspend operator
        operator.status = 'suspended'
        operator.is_active = False
        operator.save()
        
        return self.success_response(message='License revoked')


class ExpiringLicensesView(TimingMixin, generics.ListAPIView):
    """Get expiring licenses"""
    serializer_class = OperatorLicenseSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        from datetime import timedelta
        today = timezone.now().date()
        warning_date = today + timedelta(days=30)
        
        return OperatorLicense.objects.filter(
            expiry_date__lte=warning_date,
            expiry_date__gte=today,
            status='active'
        ).select_related('operator')


class RotateAPIKeyView(TimingMixin, SuccessResponseMixin, APIView):
    """Rotate API key"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    @transaction.atomic
    def post(self, request, key_id):
        old_key = APIKey.objects.get(pk=key_id)
        old_key.is_active = False
        old_key.save()
        
        new_key = APIKey.objects.create(
            operator=old_key.operator,
            key_name=f"{old_key.key_name} (Rotated)",
            api_key=secrets.token_urlsafe(32),
            can_lookup=old_key.can_lookup,
            can_register=old_key.can_register,
            can_screen=old_key.can_screen,
            rate_limit=old_key.rate_limit
        )
        
        return self.success_response(
            data=APIKeyDetailSerializer(new_key).data,
            message='API key rotated'
        )


class RevokeAPIKeyView(TimingMixin, SuccessResponseMixin, APIView):
    """Revoke API key"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request, key_id):
        api_key = APIKey.objects.get(pk=key_id)
        api_key.is_active = False
        api_key.revoked_at = timezone.now()
        api_key.save()
        
        return self.success_response(message='API key revoked')


class ValidateAPIKeyView(TimingMixin, SuccessResponseMixin, APIView):
    """Validate API key"""
    permission_classes = []  # Public endpoint
    
    def post(self, request):
        api_key = request.data.get('api_key')
        
        key = APIKey.objects.filter(api_key=api_key, is_active=True).first()
        
        if key:
            return self.success_response(
                data={'valid': True, 'operator_id': str(key.operator_id)},
                message='Valid API key'
            )
        
        return self.error_response(message='Invalid API key', status_code=status.HTTP_401_UNAUTHORIZED)


class SetupIntegrationView(TimingMixin, SuccessResponseMixin, APIView):
    """Setup integration"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    @transaction.atomic
    def post(self, request, pk):
        operator = Operator.objects.get(pk=pk)
        
        config, created = IntegrationConfig.objects.get_or_create(
            operator=operator,
            defaults={
                'api_endpoint': request.data.get('api_endpoint'),
                'webhook_url': request.data.get('webhook_url'),
                'is_active': True
            }
        )
        
        return self.success_response(
            data=IntegrationConfigSerializer(config).data,
            message='Integration setup complete'
        )


class TestIntegrationView(TimingMixin, SuccessResponseMixin, APIView):
    """Test integration"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        operator = Operator.objects.get(pk=pk)
        
        # Test integration (async)
        from .tasks import test_operator_integration
        task = test_operator_integration.delay(str(operator.id))
        
        return self.success_response(
            data={'task_id': task.id},
            message='Integration test started'
        )


class ConfigureWebhooksView(TimingMixin, SuccessResponseMixin, APIView):
    """Configure webhooks"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    @transaction.atomic
    def post(self, request, pk):
        operator = Operator.objects.get(pk=pk)
        config = operator.integration_config
        
        config.webhook_url = request.data.get('webhook_url')
        config.webhook_events = request.data.get('webhook_events', [])
        config.save()
        
        return self.success_response(message='Webhooks configured')


class WebhookLogsView(TimingMixin, generics.ListAPIView):
    """Webhook logs"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        operator_id = self.kwargs['pk']
        # Placeholder - would query webhook logs
        return []


class RunComplianceCheckView(TimingMixin, SuccessResponseMixin, APIView):
    """Run compliance check"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request, pk):
        operator = Operator.objects.get(pk=pk)
        
        # Run compliance check (async)
        from .tasks import run_operator_compliance_check
        task = run_operator_compliance_check.delay(str(operator.id))
        
        return self.success_response(
            data={'task_id': task.id},
            message='Compliance check started'
        )


class ComplianceScoreView(TimingMixin, SuccessResponseMixin, APIView):
    """Get compliance score"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        operator = Operator.objects.get(pk=pk)
        
        score = {
            'operator_id': str(operator.id),
            'compliance_score': operator.compliance_score,
            'last_check': operator.last_compliance_check.isoformat() if operator.last_compliance_check else None
        }
        
        return self.success_response(data=score)


class GenerateComplianceReportView(TimingMixin, SuccessResponseMixin, APIView):
    """Generate compliance report"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    @transaction.atomic
    def post(self, request, pk):
        operator = Operator.objects.get(pk=pk)
        
        report = ComplianceReport.objects.create(
            operator=operator,
            report_date=timezone.now().date(),
            report_type='audit'
        )
        
        return self.success_response(
            data=ComplianceReportSerializer(report).data,
            status_code=status.HTTP_201_CREATED
        )


class ComplianceOverviewView(TimingMixin, SuccessResponseMixin, APIView):
    """Compliance overview"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        overview = {
            'total_operators': Operator.objects.count(),
            'compliant': Operator.objects.filter(compliance_score__gte=80).count(),
            'non_compliant': Operator.objects.filter(compliance_score__lt=80).count(),
            'pending_checks': 0
        }
        
        return self.success_response(data=overview)


class OperatorMetricsView(TimingMixin, SuccessResponseMixin, APIView):
    """Operator metrics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        operator = Operator.objects.get(pk=pk)
        
        metrics = {
            'api_calls_today': 0,
            'response_time_avg': 0,
            'uptime_percentage': 99.9
        }
        
        return self.success_response(data=metrics)


class ResponseTimeMetricsView(TimingMixin, SuccessResponseMixin, APIView):
    """Response time metrics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        metrics = {
            'average_ms': 150,
            'p50_ms': 100,
            'p95_ms': 250,
            'p99_ms': 400
        }
        
        return self.success_response(data=metrics)


class APIUsageStatsView(TimingMixin, SuccessResponseMixin, APIView):
    """API usage statistics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        stats = {
            'total_calls': 0,
            'calls_today': 0,
            'rate_limit_hits': 0,
            'errors': 0
        }
        
        return self.success_response(data=stats)


class ActiveOperatorsStatsView(TimingMixin, SuccessResponseMixin, APIView):
    """Active operators stats"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        stats = {
            'total_active': Operator.objects.filter(is_active=True, status='active').count(),
            'active_today': Operator.objects.filter(
                last_activity_at__date=timezone.now().date()
            ).count()
        }
        
        return self.success_response(data=stats)


class IntegrationStatusStatsView(TimingMixin, SuccessResponseMixin, APIView):
    """Integration status stats"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        stats = {
            'integrated': IntegrationConfig.objects.filter(is_active=True).count(),
            'pending': Operator.objects.filter(status='onboarding').count(),
            'failed': 0
        }
        
        return self.success_response(data=stats)


class SearchOperatorsView(TimingMixin, SuccessResponseMixin, APIView):
    """Search operators"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        query = request.query_params.get('q', '')
        
        operators = Operator.objects.filter(
            company_name__icontains=query
        )[:50]
        
        return self.success_response(
            data=OperatorListSerializer(operators, many=True).data
        )


class CompliantOperatorsView(TimingMixin, generics.ListAPIView):
    """Compliant operators"""
    serializer_class = OperatorListSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return Operator.objects.filter(compliance_score__gte=80)


class NonCompliantOperatorsView(TimingMixin, generics.ListAPIView):
    """Non-compliant operators"""
    serializer_class = OperatorListSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return Operator.objects.filter(compliance_score__lt=80)
