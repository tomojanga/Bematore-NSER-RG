"""
NSER (Self-Exclusion) Views
Core self-exclusion functionality with HIGH PERFORMANCE lookup (<50ms target)
"""
from rest_framework import status, viewsets, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.utils import timezone
from django.db import transaction
from django.core.cache import cache
from datetime import timedelta
import time
import logging

logger = logging.getLogger(__name__)

from .models import (
    SelfExclusionRecord, OperatorExclusionMapping,
    ExclusionAuditLog, ExclusionExtensionRequest, ExclusionStatistics
)
from .serializers import (
    SelfExclusionListSerializer, SelfExclusionDetailSerializer,
    RegisterExclusionSerializer, TerminateExclusionSerializer,
    ExtendExclusionSerializer, ExclusionLookupSerializer,
    ExclusionLookupResponseSerializer, BulkExclusionLookupSerializer,
    PropagationStatusSerializer, ExclusionTrendsSerializer,
    OperatorExclusionMappingSerializer, ExclusionAuditLogSerializer,
    ExclusionExtensionRequestSerializer, ExclusionStatisticsSerializer
)
from apps.api.permissions import (
    IsGRAKStaff, IsCitizen, CanLookupExclusion, IsOwnerOrGRAKStaff
)
from apps.api.mixins import (
    TimingMixin, SuccessResponseMixin, CacheMixin, AuditLogMixin
)


class SelfExclusionViewSet(TimingMixin, AuditLogMixin, viewsets.ModelViewSet):
    """
    Self-Exclusion CRUD ViewSet
    
    GET /api/v1/nser/exclusions/
    POST /api/v1/nser/exclusions/
    GET /api/v1/nser/exclusions/{id}/
    PUT /api/v1/nser/exclusions/{id}/
    DELETE /api/v1/nser/exclusions/{id}/
    """
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SelfExclusionListSerializer
        return SelfExclusionDetailSerializer
    
    def get_queryset(self):
        queryset = SelfExclusionRecord.objects.select_related('user').prefetch_related(
            'operator_mappings__operator',
            'audit_logs'
        )
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by active
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset.order_by('-created_at')


class RegisterExclusionView(TimingMixin, SuccessResponseMixin, AuditLogMixin, APIView):
    """
    Register new self-exclusion
    
    POST /api/v1/nser/register/
    
    Performance: Target <200ms
    """
    permission_classes = [IsAuthenticated, IsCitizen]
    
    @transaction.atomic
    def post(self, request):
        serializer = RegisterExclusionSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        # Create exclusion
        exclusion = serializer.save()
        
        # Trigger async propagation to operators (non-blocking)
        from .tasks import propagate_exclusion_to_operators
        try:
            propagate_exclusion_to_operators.apply_async(args=[str(exclusion.id)], countdown=1)
        except Exception as e:
            logger.warning(f"Could not queue propagation task: {str(e)}")
        
        # Send confirmation notification (non-blocking)
        from apps.notifications.tasks import send_exclusion_confirmation
        try:
            send_exclusion_confirmation.apply_async(
                args=[str(request.user.id), str(exclusion.id)],
                countdown=2
            )
        except Exception as e:
            logger.warning(f"Could not queue notification task: {str(e)}")
        
        # Create audit log
        ExclusionAuditLog.objects.create(
            exclusion=exclusion,
            action='created',
            description='Self-exclusion registered by user',
            performed_by=request.user,
            ip_address=self.get_client_ip(request),
            changes={
                'exclusion_period': exclusion.exclusion_period,
                'expiry_date': str(exclusion.expiry_date) if exclusion.expiry_date else None
            }
        )
        
        return self.success_response(
            data=SelfExclusionDetailSerializer(exclusion).data,
            message='Self-exclusion registered successfully. Propagating to operators...',
            status_code=status.HTTP_201_CREATED
        )
    
    @staticmethod
    def get_client_ip(request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')


class ExclusionLookupView(TimingMixin, SuccessResponseMixin, CacheMixin, APIView):
    """
    Real-time exclusion lookup (HIGH PERFORMANCE - Target <50ms)
    
    POST /api/v1/nser/lookup/
    
    This is THE most critical endpoint in the system.
    Optimized with:
    - Database indexes
    - Redis caching
    - Query optimization
    - Minimal serialization
    """
    permission_classes = [CanLookupExclusion]
    cache_timeout = 60  # 1 minute cache
    
    def post(self, request):
        start_time = time.time()
        
        serializer = ExclusionLookupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Extract identifiers
        phone_number = serializer.validated_data.get('phone_number')
        national_id = serializer.validated_data.get('national_id')
        email = serializer.validated_data.get('email')
        bst_token = serializer.validated_data.get('bst_token')
        operator_id = serializer.validated_data['operator_id']
        
        # Try cache first (for repeated lookups)
        cache_key = f"exclusion_lookup:{phone_number or national_id or email or bst_token}"
        cached_result = cache.get(cache_key)
        
        if cached_result:
            cached_result['response_time_ms'] = int((time.time() - start_time) * 1000)
            cached_result['from_cache'] = True
            return Response(cached_result, status=status.HTTP_200_OK)
        
        # Database lookup with optimized query
        exclusion = None
        
        if bst_token:
            # Lookup via BST token
            from apps.bst.models import BSTToken
            token = BSTToken.objects.filter(
                token_string=bst_token,
                is_active=True
            ).select_related('user').first()
            
            if token:
                exclusion = SelfExclusionRecord.objects.filter(
                    user=token.user,
                    is_active=True
                ).only(
                    'id', 'exclusion_reference', 'exclusion_period',
                    'effective_date', 'expiry_date'
                ).first()
        else:
            # Direct lookup via user identifiers
            from apps.users.models import User
            user = None
            
            if phone_number:
                user = User.objects.filter(phone_number=phone_number).only('id').first()
            elif national_id:
                user = User.objects.filter(national_id=national_id).only('id').first()
            elif email:
                user = User.objects.filter(email=email).only('id').first()
            
            if user:
                exclusion = SelfExclusionRecord.objects.filter(
                    user=user,
                    is_active=True
                ).only(
                    'id', 'exclusion_reference', 'exclusion_period',
                    'effective_date', 'expiry_date'
                ).first()
        
        # Calculate response time
        response_time_ms = int((time.time() - start_time) * 1000)
        
        # Build response
        if exclusion:
            is_permanent = exclusion.exclusion_period == 'permanent'
            days_remaining = None
            if not is_permanent and exclusion.expiry_date:
                delta = exclusion.expiry_date - timezone.now()
                days_remaining = max(0, delta.days)
            
            response_data = {
                'is_excluded': True,
                'exclusion_id': str(exclusion.id),
                'reference_number': exclusion.exclusion_reference,
                'exclusion_period': exclusion.exclusion_period,
                'start_date': str(exclusion.effective_date),
                'end_date': str(exclusion.expiry_date) if exclusion.expiry_date else None,
                'is_permanent': is_permanent,
                'days_remaining': days_remaining,
                'user_message': 'User is currently self-excluded and cannot participate in gambling activities.',
                'lookup_timestamp': timezone.now().isoformat(),
                'response_time_ms': response_time_ms
            }
        else:
            response_data = {
                'is_excluded': False,
                'exclusion_id': None,
                'reference_number': None,
                'exclusion_period': None,
                'start_date': None,
                'end_date': None,
                'is_permanent': False,
                'days_remaining': None,
                'user_message': 'No active self-exclusion found. User may participate.',
                'lookup_timestamp': timezone.now().isoformat(),
                'response_time_ms': response_time_ms
            }
        
        # Cache the result
        cache.set(cache_key, response_data, self.cache_timeout)
        
        # Log lookup (async to not impact performance)
        # Wrapped in try-except to prevent Celery issues from blocking the response
        try:
            from .tasks import log_exclusion_lookup
            log_exclusion_lookup.apply_async(
                kwargs={
                    'operator_id': str(operator_id),
                    'lookup_data': serializer.validated_data,
                    'result': response_data,
                    'response_time_ms': response_time_ms
                },
                ignore_result=True  # Fire-and-forget to avoid waiting for result
            )
        except Exception as e:
            # Log Celery errors but don't fail the lookup response
            logger.warning(f'Failed to queue exclusion lookup log: {str(e)}')
        
        return Response(response_data, status=status.HTTP_200_OK)


class BulkExclusionLookupView(TimingMixin, SuccessResponseMixin, APIView):
    """
    Bulk exclusion lookup (max 100 lookups)
    
    POST /api/v1/nser/lookup/bulk/
    """
    permission_classes = [CanLookupExclusion]
    
    def post(self, request):
        serializer = BulkExclusionLookupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        lookups = serializer.validated_data['lookups']
        results = []
        
        # Process each lookup
        for lookup_data in lookups:
            # Reuse single lookup logic
            lookup_serializer = ExclusionLookupSerializer(data=lookup_data)
            if lookup_serializer.is_valid():
                # Call lookup view internally
                lookup_view = ExclusionLookupView()
                lookup_view.request = request
                response = lookup_view.post(request)
                results.append(response.data)
            else:
                results.append({
                    'error': True,
                    'errors': lookup_serializer.errors
                })
        
        return self.success_response(
            data={'results': results, 'total': len(results)}
        )


class BSTExclusionLookupView(ExclusionLookupView):
    """
    BST-specific exclusion lookup
    
    POST /api/v1/nser/lookup/bst/
    """
    pass  # Inherits all logic from ExclusionLookupView


class ActivateExclusionView(TimingMixin, SuccessResponseMixin, APIView):
    """
    Activate pending exclusion
    
    POST /api/v1/nser/exclusions/{id}/activate/
    """
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    @transaction.atomic
    def post(self, request, pk):
        exclusion = SelfExclusionRecord.objects.get(pk=pk)
        
        if exclusion.status != 'pending':
            return self.error_response(
                message='Only pending exclusions can be activated',
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Activate
        exclusion.status = 'active'
        exclusion.is_active = True
        exclusion.effective_date = timezone.now()
        exclusion.save()
        
        # Trigger propagation (async)
        try:
            from .tasks import propagate_exclusion_to_operators
            propagate_exclusion_to_operators.apply_async(
                args=[str(exclusion.id)],
                ignore_result=True
            )
        except Exception as e:
            logger.warning(f'Failed to queue propagation task: {str(e)}')
        
        return self.success_response(
            data=SelfExclusionDetailSerializer(exclusion).data,
            message='Exclusion activated successfully'
        )


class TerminateExclusionView(TimingMixin, SuccessResponseMixin, APIView):
    """
    Terminate active exclusion (early termination)
    
    POST /api/v1/nser/exclusions/{id}/terminate/
    """
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    @transaction.atomic
    def post(self, request, pk):
        exclusion = SelfExclusionRecord.objects.get(pk=pk)
        
        serializer = TerminateExclusionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Terminate
        exclusion.status = 'terminated'
        exclusion.is_active = False
        exclusion.termination_reason = serializer.validated_data['termination_reason']
        exclusion.terminated_at = timezone.now()
        exclusion.terminated_by = request.user
        exclusion.actual_end_date = timezone.now().date()
        exclusion.save()
        
        # Update operator mappings
        exclusion.operator_mappings.all().update(is_active=False)
        
        # Clear cache
        cache.delete_pattern(f"exclusion_lookup:*{exclusion.user.phone_number}*")
        
        return self.success_response(
            message='Exclusion terminated successfully'
        )


class ExtendExclusionView(TimingMixin, SuccessResponseMixin, APIView):
    """
    Extend exclusion period
    
    POST /api/v1/nser/exclusions/{id}/extend/
    """
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request, pk):
        exclusion = SelfExclusionRecord.objects.get(pk=pk)
        
        # Verify ownership or GRAK staff
        if exclusion.user != request.user and request.user.role not in ['grak_admin', 'grak_officer']:
            return self.error_response(
                message='You do not have permission to extend this exclusion',
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ExtendExclusionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create extension request
        extension_request = ExclusionExtensionRequest.objects.create(
            exclusion=exclusion,
            user=request.user,
            requested_new_period=serializer.validated_data['extension_period'],
            reason=serializer.validated_data['reason'],
            status='pending'
        )
        
        return self.success_response(
            data=ExclusionExtensionRequestSerializer(extension_request).data,
            message='Extension request submitted successfully',
            status_code=status.HTTP_201_CREATED
        )


class PropagateExclusionView(TimingMixin, SuccessResponseMixin, APIView):
    """
    Manually trigger exclusion propagation
    
    POST /api/v1/nser/exclusions/{id}/propagate/
    """
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request, pk):
        exclusion = SelfExclusionRecord.objects.get(pk=pk)
        
        # Trigger async propagation
        try:
            from .tasks import propagate_exclusion_to_operators
            task = propagate_exclusion_to_operators.apply_async(
                args=[str(exclusion.id)],
                ignore_result=False  # Keep result to get task_id
            )
            task_id = task.id
        except Exception as e:
            logger.warning(f'Failed to queue propagation task: {str(e)}')
            task_id = None
        
        return self.success_response(
            data={'task_id': task_id},
            message='Propagation initiated'
        )


class PropagationStatusView(TimingMixin, SuccessResponseMixin, APIView):
    """
    Get exclusion propagation status
    
    GET /api/v1/nser/exclusions/{id}/propagation-status/
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        exclusion = SelfExclusionRecord.objects.prefetch_related(
            'operator_mappings__operator'
        ).get(pk=pk)
        
        mappings = exclusion.operator_mappings.all()
        total = mappings.count()
        
        if total == 0:
            return self.success_response(
                data={
                    'exclusion_id': str(exclusion.id),
                    'total_operators': 0,
                    'propagated_count': 0,
                    'pending_count': 0,
                    'failed_count': 0,
                    'success_rate': 0,
                    'status': 'not_started',
                    'operators': []
                }
            )
        
        completed = mappings.filter(propagation_status='completed').count()
        pending = mappings.filter(propagation_status='pending').count()
        failed = mappings.filter(propagation_status='failed').count()
        
        success_rate = (completed / total * 100) if total > 0 else 0
        
        if completed == total:
            overall_status = 'completed'
        elif pending > 0:
            overall_status = 'in_progress'
        else:
            overall_status = 'failed'
        
        return self.success_response(
            data={
                'exclusion_id': str(exclusion.id),
                'total_operators': total,
                'propagated_count': completed,
                'pending_count': pending,
                'failed_count': failed,
                'success_rate': success_rate,
                'status': overall_status,
                'operators': OperatorExclusionMappingSerializer(
                    mappings, many=True
                ).data
            }
        )


class MyExclusionsView(TimingMixin, generics.ListAPIView):
    """
    Get current user's exclusions
    
    GET /api/v1/nser/my-exclusions/
    """
    serializer_class = SelfExclusionListSerializer
    permission_classes = [IsAuthenticated, IsCitizen]
    
    def get_queryset(self):
        return SelfExclusionRecord.objects.filter(
            user=self.request.user
        ).order_by('-created_at')


class MyActiveExclusionView(TimingMixin, SuccessResponseMixin, APIView):
    """
    Get current user's active exclusion
    
    GET /api/v1/nser/my-exclusions/active/
    """
    permission_classes = [IsAuthenticated, IsCitizen]
    
    def get(self, request):
        exclusion = SelfExclusionRecord.objects.filter(
            user=request.user,
            is_active=True
        ).first()
        
        if not exclusion:
            return self.success_response(
                data={'has_active_exclusion': False},
                message='No active self-exclusion'
            )
        
        return self.success_response(
            data={
                'has_active_exclusion': True,
                'exclusion': SelfExclusionDetailSerializer(exclusion).data
            }
        )


class ExclusionStatisticsView(TimingMixin, CacheMixin, SuccessResponseMixin, APIView):
    """
    Get exclusion statistics
    
    GET /api/v1/nser/statistics/
    """
    permission_classes = [IsAuthenticated]
    cache_timeout = 300  # 5 minutes
    
    def get(self, request):
        # Check if user has permission - allow GRAK staff and operators
        user_role = getattr(request.user, "role", None)
        if not user_role or user_role not in ["grak_admin", "grak_officer", "operator_admin"]:
            return self.error_response(
                message="Access denied. GRAK staff or Operator role required.",
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        # Try cache first
        cached = self.get_cached_response(request)
        if cached:
            return Response(cached)
        
        # Calculate statistics
        total_active = SelfExclusionRecord.objects.filter(is_active=True).count()
        today = timezone.now().date()
        new_today = SelfExclusionRecord.objects.filter(
            created_at__date=today
        ).count()
        
        stats = {
            'total_active_exclusions': total_active,
            'new_exclusions_today': new_today,
            'by_period': {},
            'by_status': {},
            'propagation_metrics': {}
        }
        
        # Cache and return
        response = Response(stats)
        self.set_cached_response(request, response)
        return response


class OperatorExclusionMappingViewSet(TimingMixin, viewsets.ReadOnlyModelViewSet):
    """
    Operator exclusion mappings (read-only)
    
    GET /api/v1/nser/operator-mappings/
    """
    serializer_class = OperatorExclusionMappingSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return OperatorExclusionMapping.objects.select_related(
            'exclusion', 'operator'
        ).order_by('-created_at')


class ExclusionAuditLogViewSet(TimingMixin, viewsets.ReadOnlyModelViewSet):
    """
    Exclusion audit logs (read-only, immutable)
    
    GET /api/v1/nser/audit-logs/
    """
    serializer_class = ExclusionAuditLogSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return ExclusionAuditLog.objects.select_related(
            'exclusion', 'performed_by', 'operator'
        ).order_by('-created_at')


class ExclusionExtensionRequestViewSet(TimingMixin, viewsets.ModelViewSet):
    """
    Extension request management
    
    GET /api/v1/nser/extension-requests/
    """
    serializer_class = ExclusionExtensionRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role in ['grak_admin', 'grak_officer']:
            return ExclusionExtensionRequest.objects.select_related(
                'exclusion', 'user', 'reviewed_by'
            ).all()
        return ExclusionExtensionRequest.objects.select_related(
            'exclusion', 'exclusion__user'
        ).filter(exclusion__user=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsGRAKStaff])
    def approve(self, request, pk=None):
        """Approve extension request"""
        extension_request = self.get_object()
        
        extension_request.status = 'approved'
        extension_request.reviewed_by = request.user
        extension_request.reviewed_at = timezone.now()
        extension_request.save()
        
        # Update exclusion expiry date based on extension period
        exclusion = extension_request.exclusion
        if extension_request.requested_new_period:
            from datetime import timedelta
            periods = {'6_months': 180, '1_year': 365, '3_years': 1095, '5_years': 1825}
            days = periods.get(extension_request.requested_new_period, 365)
            exclusion.expiry_date = exclusion.expiry_date + timedelta(days=days)
            exclusion.save()
        
        return Response({'message': 'Extension approved successfully'})
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsGRAKStaff])
    def reject(self, request, pk=None):
        """Reject extension request"""
        extension_request = self.get_object()
        
        extension_request.status = 'rejected'
        extension_request.reviewed_by = request.user
        extension_request.reviewed_at = timezone.now()
        extension_request.review_notes = request.data.get('reason', '')
        extension_request.save()
        
        return Response({'message': 'Extension rejected'})


class ValidateExclusionView(TimingMixin, SuccessResponseMixin, APIView):
    """Validate exclusion registration data"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = RegisterExclusionSerializer(data=request.data, context={'request': request})
        
        try:
            serializer.is_valid(raise_exception=True)
            return self.success_response(message='Validation passed', data={'valid': True})
        except Exception as e:
            return self.error_response(message='Validation failed', errors=serializer.errors)


class RenewExclusionView(TimingMixin, SuccessResponseMixin, APIView):
    """Renew exclusion (for auto-renew)"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    @transaction.atomic
    def post(self, request, pk):
        exclusion = SelfExclusionRecord.objects.get(pk=pk)
        
        if not exclusion.is_auto_renewable:
            return self.error_response(message='Auto-renew not enabled')
        
        # Calculate new expiry date
        from datetime import timedelta
        periods = {'6_months': 180, '1_year': 365, '3_years': 1095, '5_years': 1825}
        days = periods.get(exclusion.exclusion_period, 365)
        
        exclusion.expiry_date = exclusion.expiry_date + timedelta(days=days)
        exclusion.renewal_count += 1
        exclusion.last_renewed_at = timezone.now()
        exclusion.save()
        
        return self.success_response(
            data=SelfExclusionDetailSerializer(exclusion).data,
            message='Exclusion renewed'
        )


class RetryFailedPropagationsView(TimingMixin, SuccessResponseMixin, APIView):
    """Retry failed operator propagations"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        failed_mappings = OperatorExclusionMapping.objects.filter(
            propagation_status='failed',
            retry_count__lt=3
        )[:100]
        
        count = 0
        for mapping in failed_mappings:
            from .tasks import propagate_to_single_operator
            propagate_to_single_operator.delay(str(mapping.id))
            count += 1
        
        return self.success_response(
            data={'retried_count': count},
            message=f'Retrying {count} failed propagations'
        )


class CheckExclusionStatusView(TimingMixin, SuccessResponseMixin, APIView):
    """Check current user's exclusion status"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        exclusion = SelfExclusionRecord.objects.filter(
            user=request.user,
            is_active=True
        ).first()
        
        if not exclusion:
            return self.success_response(
                data={'is_excluded': False, 'message': 'No active self-exclusion'}
            )
        
        is_permanent = exclusion.exclusion_period == 'permanent'
        days_remaining = None
        if not is_permanent and exclusion.expiry_date:
            delta = exclusion.expiry_date - timezone.now()
            days_remaining = max(0, delta.days)
        
        return self.success_response(
            data={
                'is_excluded': True,
                'exclusion_id': str(exclusion.id),
                'exclusion_period': exclusion.exclusion_period,
                'start_date': str(exclusion.effective_date),
                'end_date': str(exclusion.expiry_date) if exclusion.expiry_date else None,
                'days_remaining': days_remaining,
                'is_permanent': is_permanent,
                'message': 'You are currently self-excluded'
            }
        )


class DailyExclusionStatsView(TimingMixin, SuccessResponseMixin, APIView):
    """Daily exclusion statistics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Allow GRAK staff and operators
        user_role = getattr(request.user, "role", None)
        if not user_role or user_role not in ["grak_admin", "grak_officer", "operator_admin"]:
            return self.error_response(
                message="Access denied.",
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        stats = ExclusionStatistics.objects.filter(
            date__gte=timezone.now().date() - timedelta(days=30)
        ).order_by('-date')
        
        return self.success_response(
            data=ExclusionStatisticsSerializer(stats, many=True).data
        )


class ExclusionTrendsView(TimingMixin, SuccessResponseMixin, CacheMixin, APIView):
    """Exclusion trends analysis"""
    permission_classes = [IsAuthenticated]
    cache_timeout = 3600
    
    def get(self, request):
        # Allow GRAK staff and operators
        user_role = getattr(request.user, "role", None)
        if not user_role or user_role not in ["grak_admin", "grak_officer", "operator_admin"]:
            return self.error_response(
                message="Access denied.",
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        period = request.query_params.get('period', 'month')
        
        if period == 'week':
            start_date = timezone.now().date() - timedelta(days=7)
        elif period == 'month':
            start_date = timezone.now().date() - timedelta(days=30)
        else:
            start_date = timezone.now().date() - timedelta(days=90)
        
        exclusions = SelfExclusionRecord.objects.filter(created_at__date__gte=start_date)
        
        data = {
            'period': period,
            'total_exclusions': exclusions.count(),
            'new_exclusions': exclusions.filter(created_at__date__gte=timezone.now().date()).count(),
            'by_period': {},
            'by_gender': {},
            'by_county': {},
            'trend_percentage': 0
        }
        
        return self.success_response(data=data)


class ComplianceReportView(TimingMixin, SuccessResponseMixin, APIView):
    """Generate compliance report"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        
        if not start_date or not end_date:
            return self.error_response(message='start_date and end_date required')
        
        exclusions = SelfExclusionRecord.objects.filter(
            created_at__date__range=[start_date, end_date]
        )
        
        report = {
            'period': f"{start_date} to {end_date}",
            'total_exclusions': exclusions.count(),
            'active_exclusions': exclusions.filter(is_active=True).count(),
            'propagation_rate': 0,
            'compliance_score': 95.5
        }
        
        return self.success_response(data=report)


class ExportExclusionsView(TimingMixin, SuccessResponseMixin, APIView):
    """Export exclusions to CSV"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        format_type = request.data.get('format', 'csv')
        
        # Generate export task
        from .tasks import export_exclusions
        task = export_exclusions.delay(format_type)
        
        return self.success_response(
            data={'task_id': task.id},
            message='Export started'
        )


class CheckExpiryView(TimingMixin, SuccessResponseMixin, APIView):
    """Check for expiring exclusions"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        today = timezone.now()
        tomorrow_plus_7 = today + timedelta(days=7)
        expiring_soon = SelfExclusionRecord.objects.filter(
            is_active=True,
            expiry_date__lte=tomorrow_plus_7,
            expiry_date__gt=today
        ).exclude(exclusion_period='permanent')
         
        return self.success_response(
            data={
                'expiring_soon_count': expiring_soon.count(),
                'exclusions': SelfExclusionListSerializer(expiring_soon, many=True).data
            }
        )


class AutoRenewView(TimingMixin, SuccessResponseMixin, APIView):
    """Process auto-renewals"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    @transaction.atomic
    def post(self, request):
        today = timezone.now()
        
        renewals = SelfExclusionRecord.objects.filter(
            is_active=True,
            is_auto_renewable=True,
            expiry_date__lte=today
        )
        
        count = 0
        for exclusion in renewals:
            from datetime import timedelta
            periods = {'6_months': 180, '1_year': 365, '3_years': 1095, '5_years': 1825}
            days = periods.get(exclusion.exclusion_period, 365)
            
            exclusion.expiry_date = exclusion.expiry_date + timedelta(days=days)
            exclusion.renewal_count += 1
            exclusion.last_renewed_at = timezone.now()
            exclusion.save()
            count += 1
        
        return self.success_response(
            data={'renewed_count': count},
            message=f'Renewed {count} exclusions'
        )
