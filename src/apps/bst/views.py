"""
BST (Bematore Screening Token) Views
Token generation, validation (<20ms target), and fraud detection
"""
from rest_framework import status, viewsets, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.utils import timezone
from django.db import transaction
from django.core.cache import cache
import time
import secrets

from .models import BSTToken, BSTMapping, BSTCrossReference, BSTAuditLog
from .serializers import (
    BSTTokenListSerializer, BSTTokenDetailSerializer,
    GenerateBSTTokenSerializer, ValidateBSTTokenSerializer,
    BSTValidationResponseSerializer, BulkValidateBSTTokenSerializer,
    RotateBSTTokenSerializer, CompromiseBSTTokenSerializer,
    CreateBSTMappingSerializer, BSTMappingSerializer,
    BSTCrossReferenceSerializer, DetectDuplicatesSerializer,
    FraudCheckSerializer
)
from apps.api.permissions import IsGRAKStaff, CanLookupExclusion
from apps.api.mixins import TimingMixin, SuccessResponseMixin, CacheMixin


class BSTTokenViewSet(TimingMixin, viewsets.ModelViewSet):
    """BST Token CRUD ViewSet"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BSTTokenListSerializer
        return BSTTokenDetailSerializer
    
    def get_queryset(self):
        return BSTToken.objects.select_related('user').prefetch_related(
            'mappings__operator', 'cross_references'
        ).order_by('-created_at')


class GenerateBSTTokenView(TimingMixin, SuccessResponseMixin, APIView):
    """
    Generate BST token for user
    POST /api/v1/bst/generate/
    """
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    @transaction.atomic
    def post(self, request):
        serializer = GenerateBSTTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user_id = serializer.validated_data['user_id']
        force_regenerate = serializer.validated_data.get('force_regenerate', False)
        
        from apps.users.models import User
        user = User.objects.get(id=user_id)
        
        # Check existing token
        existing_token = BSTToken.objects.filter(user=user, is_active=True).first()
        
        if existing_token and not force_regenerate:
            return self.success_response(
                data=BSTTokenDetailSerializer(existing_token).data,
                message='Token already exists'
            )
        
        if existing_token and force_regenerate:
            existing_token.is_active = False
            existing_token.save()
        
        # Generate token
        token = BSTToken.generate_for_user(user)
        
        return self.success_response(
            data=BSTTokenDetailSerializer(token).data,
            message='BST token generated successfully',
            status_code=status.HTTP_201_CREATED
        )


class ValidateBSTTokenView(TimingMixin, CacheMixin, APIView):
    """
    Validate BST token (HIGH PERFORMANCE - Target <20ms)
    POST /api/v1/bst/validate/
    
    THE SECOND most critical endpoint (after exclusion lookup)
    """
    permission_classes = [CanLookupExclusion]
    cache_timeout = 120  # 2 minutes cache
    
    def post(self, request):
        start_time = time.time()
        
        serializer = ValidateBSTTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token_string = serializer.validated_data['token']
        
        # Try cache first
        cache_key = f"bst_validate:{token_string}"
        cached_result = cache.get(cache_key)
        
        if cached_result:
            cached_result['response_time_ms'] = int((time.time() - start_time) * 1000)
            cached_result['from_cache'] = True
            return Response(cached_result, status=status.HTTP_200_OK)
        
        # Database lookup with optimized query
        token = BSTToken.objects.filter(
            token_string=token_string
        ).select_related('user').only(
            'id', 'token_string', 'is_active', 'is_compromised',
            'expires_at', 'user_id'
        ).first()
        
        response_time_ms = int((time.time() - start_time) * 1000)
        
        if not token:
            response_data = {
                'is_valid': False,
                'token_id': None,
                'user_id': None,
                'is_active': False,
                'is_compromised': False,
                'expires_at': None,
                'is_expired': False,
                'validation_message': 'Token not found',
                'validation_timestamp': timezone.now().isoformat(),
                'response_time_ms': response_time_ms
            }
        else:
            is_expired = token.expires_at < timezone.now() if token.expires_at else False
            is_valid = token.is_active and not token.is_compromised and not is_expired
            
            response_data = {
                'is_valid': is_valid,
                'token_id': str(token.id),
                'user_id': str(token.user_id),
                'is_active': token.is_active,
                'is_compromised': token.is_compromised,
                'expires_at': token.expires_at.isoformat() if token.expires_at else None,
                'is_expired': is_expired,
                'validation_message': 'Valid' if is_valid else 'Invalid: ' + ('Expired' if is_expired else 'Compromised' if token.is_compromised else 'Inactive'),
                'validation_timestamp': timezone.now().isoformat(),
                'response_time_ms': response_time_ms
            }
        
        # Cache result
        cache.set(cache_key, response_data, self.cache_timeout)
        
        # Log validation (async)
        from .tasks import log_token_validation
        log_token_validation.delay(
            token_string=token_string,
            result=response_data,
            operator_id=str(serializer.validated_data.get('operator_id')) if serializer.validated_data.get('operator_id') else None
        )
        
        return Response(response_data, status=status.HTTP_200_OK)


class BulkValidateBSTTokenView(TimingMixin, SuccessResponseMixin, APIView):
    """Bulk token validation (max 100)"""
    permission_classes = [CanLookupExclusion]
    
    def post(self, request):
        serializer = BulkValidateBSTTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        tokens = serializer.validated_data['tokens']
        results = []
        
        for token_string in tokens:
            validate_view = ValidateBSTTokenView()
            validate_view.request = request
            response = validate_view.post(request)
            results.append(response.data)
        
        return self.success_response(
            data={'results': results, 'total': len(results)}
        )


class RotateBSTTokenView(TimingMixin, SuccessResponseMixin, APIView):
    """Rotate BST token"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    @transaction.atomic
    def post(self, request, pk):
        token = BSTToken.objects.select_related('user').get(pk=pk)
        
        serializer = RotateBSTTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Mark old token as inactive
        token.is_active = False
        token.save()
        
        # Generate new token
        new_token = BSTToken.generate_for_user(token.user)
        new_token.rotation_count = token.rotation_count + 1
        new_token.last_rotated_at = timezone.now()
        new_token.save()
        
        # Clear cache
        cache.delete(f"bst_validate:{token.token_string}")
        
        # Notify user if requested
        if serializer.validated_data.get('notify_user'):
            from apps.notifications.tasks import send_token_rotation_notification
            send_token_rotation_notification.delay(
                user_id=str(token.user.id),
                reason=serializer.validated_data['reason']
            )
        
        return self.success_response(
            data=BSTTokenDetailSerializer(new_token).data,
            message='Token rotated successfully'
        )


class CompromiseBSTTokenView(TimingMixin, SuccessResponseMixin, APIView):
    """Mark token as compromised"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    @transaction.atomic
    def post(self, request, pk):
        token = BSTToken.objects.select_related('user').get(pk=pk)
        
        serializer = CompromiseBSTTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token.is_compromised = True
        token.is_active = False
        token.compromised_reason = serializer.validated_data['reason']
        token.compromised_at = timezone.now()
        token.save()
        
        # Clear cache
        cache.delete(f"bst_validate:{token.token_string}")
        
        # Auto-rotate if requested
        if serializer.validated_data.get('auto_rotate'):
            new_token = BSTToken.generate_for_user(token.user)
            
            if serializer.validated_data.get('notify_user'):
                from apps.notifications.tasks import send_token_compromised_notification
                send_token_compromised_notification.delay(
                    user_id=str(token.user.id),
                    new_token=new_token.token_string
                )
        
        return self.success_response(message='Token marked as compromised')


class CreateBSTMappingView(TimingMixin, SuccessResponseMixin, APIView):
    """Create BST operator mapping"""
    permission_classes = [CanLookupExclusion]
    
    @transaction.atomic
    def post(self, request):
        serializer = CreateBSTMappingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        mapping = serializer.save()
        
        return self.success_response(
            data=BSTMappingSerializer(mapping).data,
            message='Mapping created',
            status_code=status.HTTP_201_CREATED
        )


class DetectDuplicatesView(TimingMixin, SuccessResponseMixin, APIView):
    """Detect duplicate accounts via BST cross-referencing"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        serializer = DetectDuplicatesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Find matching cross-references
        matched_tokens = set()
        
        for field, value in serializer.validated_data.items():
            if value and field != 'user_id':
                import hashlib
                hashed = hashlib.sha256(str(value).encode()).hexdigest()
                
                refs = BSTCrossReference.objects.filter(
                    identifier_hash=hashed,
                    match_confidence__gte=0.7
                ).select_related('token')
                
                for ref in refs:
                    matched_tokens.add(ref.token)
        
        matched_users = {token.user_id for token in matched_tokens}
        
        return self.success_response(
            data={
                'has_duplicates': len(matched_tokens) > 1,
                'duplicate_count': len(matched_tokens),
                'confidence_score': 0.85 if len(matched_tokens) > 1 else 0,
                'matched_tokens': [str(t.id) for t in matched_tokens],
                'matched_users': [str(u) for u in matched_users],
                'match_reasons': ['phone_match', 'email_match'],
                'risk_level': 'high' if len(matched_tokens) > 2 else 'medium' if len(matched_tokens) > 1 else 'low',
                'recommended_action': 'investigate' if len(matched_tokens) > 1 else 'none'
            }
        )


class FraudCheckView(TimingMixin, SuccessResponseMixin, APIView):
    """Comprehensive fraud check"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        serializer = FraudCheckSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token_id = serializer.validated_data.get('token_id')
        user_id = serializer.validated_data.get('user_id')
        
        # Perform fraud checks
        risk_score = 0
        fraud_indicators = []
        
        if token_id:
            token = BSTToken.objects.get(id=token_id)
            
            # Check for compromised token
            if token.is_compromised:
                risk_score += 40
                fraud_indicators.append('Token previously compromised')
            
            # Check duplicate accounts
            duplicates = BSTCrossReference.objects.filter(
                token=token,
                match_confidence__gte=0.8
            ).count()
            
            if duplicates > 3:
                risk_score += 30
                fraud_indicators.append(f'{duplicates} potential duplicate accounts')
        
        is_fraud_risk = risk_score >= 50
        risk_level = 'critical' if risk_score >= 80 else 'high' if risk_score >= 50 else 'medium' if risk_score >= 30 else 'low'
        
        return self.success_response(
            data={
                'is_fraud_risk': is_fraud_risk,
                'risk_score': risk_score,
                'risk_level': risk_level,
                'fraud_indicators': fraud_indicators,
                'duplicate_accounts': duplicates if token_id else 0,
                'compromised_tokens': 1 if token_id and token.is_compromised else 0,
                'suspicious_activities': 0,
                'recommended_action': 'block' if risk_score >= 80 else 'investigate' if risk_score >= 50 else 'monitor',
                'details': {}
            }
        )


class BSTMappingViewSet(TimingMixin, viewsets.ReadOnlyModelViewSet):
    """BST operator mappings"""
    serializer_class = BSTMappingSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return BSTMapping.objects.select_related('token__user', 'operator')


class BSTCrossReferenceViewSet(TimingMixin, viewsets.ReadOnlyModelViewSet):
    """BST cross-references"""
    serializer_class = BSTCrossReferenceSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return BSTCrossReference.objects.select_related('token__user')


class BSTAuditLogViewSet(TimingMixin, viewsets.ReadOnlyModelViewSet):
    """BST audit logs"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_serializer_class(self):
        from .serializers import BSTAuditLogSerializer
        return BSTAuditLogSerializer
    
    def get_queryset(self):
        return BSTAuditLog.objects.select_related('token', 'performed_by', 'operator')


class BulkGenerateBSTTokenView(TimingMixin, SuccessResponseMixin, APIView):
    """Bulk generate BST tokens"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    @transaction.atomic
    def post(self, request):
        from .serializers import BulkGenerateBSTTokenSerializer
        serializer = BulkGenerateBSTTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user_ids = serializer.validated_data['user_ids']
        force_regenerate = serializer.validated_data.get('force_regenerate', False)
        
        from apps.users.models import User
        users = User.objects.filter(id__in=user_ids)
        
        results = []
        for user in users:
            existing = BSTToken.objects.filter(user=user, is_active=True).first()
            
            if existing and not force_regenerate:
                results.append({'user_id': str(user.id), 'token_id': str(existing.id), 'status': 'existing'})
            else:
                if existing:
                    existing.is_active = False
                    existing.save()
                
                token = BSTToken.generate_for_user(user)
                results.append({'user_id': str(user.id), 'token_id': str(token.id), 'status': 'generated'})
        
        return self.success_response(data={'results': results, 'total': len(results)})


class LookupBSTTokenView(TimingMixin, SuccessResponseMixin, APIView):
    """Lookup BST token by user identifiers"""
    permission_classes = [CanLookupExclusion]
    
    def post(self, request):
        from .serializers import LookupBSTTokenSerializer
        serializer = LookupBSTTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        from apps.users.models import User
        user = None
        
        if serializer.validated_data.get('phone_number'):
            user = User.objects.filter(phone_number=serializer.validated_data['phone_number']).first()
        elif serializer.validated_data.get('national_id'):
            user = User.objects.filter(national_id=serializer.validated_data['national_id']).first()
        elif serializer.validated_data.get('email'):
            user = User.objects.filter(email=serializer.validated_data['email']).first()
        elif serializer.validated_data.get('user_id'):
            user = User.objects.filter(id=serializer.validated_data['user_id']).first()
        
        if not user:
            return self.error_response(message='User not found', status_code=status.HTTP_404_NOT_FOUND)
        
        token = BSTToken.objects.filter(user=user, is_active=True).first()
        
        if not token:
            return self.error_response(message='No active BST token found', status_code=status.HTTP_404_NOT_FOUND)
        
        return self.success_response(data=BSTTokenDetailSerializer(token).data)


class LookupUserByBSTView(TimingMixin, SuccessResponseMixin, APIView):
    """Lookup user by BST token"""
    permission_classes = [CanLookupExclusion]
    
    def post(self, request):
        token_string = request.data.get('token')
        
        if not token_string:
            return self.error_response(message='Token required')
        
        token = BSTToken.objects.filter(token_string=token_string, is_active=True).select_related('user').first()
        
        if not token:
            return self.error_response(message='Token not found', status_code=status.HTTP_404_NOT_FOUND)
        
        return self.success_response(
            data={
                'user_id': str(token.user.id),
                'phone_number': str(token.user.phone_number),
                'token_id': str(token.id)
            }
        )


class LookupOperatorMappingsView(TimingMixin, SuccessResponseMixin, APIView):
    """Lookup operator mappings for token"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        token_id = request.query_params.get('token_id')
        operator_id = request.query_params.get('operator_id')
        
        mappings = BSTMapping.objects.select_related('token__user', 'operator')
        
        if token_id:
            mappings = mappings.filter(token_id=token_id)
        if operator_id:
            mappings = mappings.filter(operator_id=operator_id)
        
        return self.success_response(
            data=BSTMappingSerializer(mappings, many=True).data
        )


class DeactivateBSTTokenView(TimingMixin, SuccessResponseMixin, APIView):
    """Deactivate BST token"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    @transaction.atomic
    def post(self, request, pk):
        token = BSTToken.objects.get(pk=pk)
        token.is_active = False
        token.save()
        
        cache.delete(f"bst_validate:{token.token_string}")
        
        return self.success_response(message='Token deactivated')


class LinkIdentifierView(TimingMixin, SuccessResponseMixin, APIView):
    """Link identifier to BST token for cross-referencing"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    @transaction.atomic
    def post(self, request):
        from .serializers import LinkIdentifierSerializer
        serializer = LinkIdentifierSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = BSTToken.objects.get(id=serializer.validated_data['token_id'])
        
        import hashlib
        identifier_hash = hashlib.sha256(
            str(serializer.validated_data['identifier_value']).encode()
        ).hexdigest()
        
        cross_ref, created = BSTCrossReference.objects.get_or_create(
            token=token,
            identifier_type=serializer.validated_data['identifier_type'],
            identifier_hash=identifier_hash,
            defaults={'match_confidence': 0.95}
        )
        
        return self.success_response(
            data=BSTCrossReferenceSerializer(cross_ref).data,
            message='Identifier linked' if created else 'Already linked'
        )


class RecordActivityView(TimingMixin, SuccessResponseMixin, APIView):
    """Record BST token activity"""
    permission_classes = [CanLookupExclusion]
    
    @transaction.atomic
    def post(self, request):
        from .serializers import RecordActivitySerializer
        serializer = RecordActivitySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = BSTToken.objects.get(id=serializer.validated_data['token_id'])
        operator_id = serializer.validated_data['operator_id']
        
        mapping, created = BSTMapping.objects.get_or_create(
            token=token,
            operator_id=operator_id,
            defaults={'first_activity_date': timezone.now().date()}
        )
        
        if not created:
            mapping.last_activity_date = timezone.now().date()
            mapping.total_bets += 1
            
            if serializer.validated_data.get('amount'):
                mapping.total_amount_wagered += serializer.validated_data['amount']
            
            mapping.save()
        
        return self.success_response(message='Activity recorded')


class BSTStatisticsView(TimingMixin, SuccessResponseMixin, CacheMixin, APIView):
    """BST token statistics"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    cache_timeout = 300
    
    def get(self, request):
        stats = {
            'total_tokens': BSTToken.objects.count(),
            'active_tokens': BSTToken.objects.filter(is_active=True).count(),
            'compromised_tokens': BSTToken.objects.filter(is_compromised=True).count(),
            'tokens_generated_today': BSTToken.objects.filter(
                generated_at__date=timezone.now().date()
            ).count(),
            'total_validations_today': 0,
            'average_validation_time_ms': 0
        }
        
        return self.success_response(data=stats)


class DailyBSTStatsView(TimingMixin, SuccessResponseMixin, APIView):
    """Daily BST statistics"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        from .models import BSTStatistics
        
        stats = BSTStatistics.objects.filter(
            date__gte=timezone.now().date() - timezone.timedelta(days=30)
        ).order_by('-date')
        
        from .serializers import BSTStatisticsSerializer
        return self.success_response(
            data=BSTStatisticsSerializer(stats, many=True).data
        )


class TokenUsageStatsView(TimingMixin, SuccessResponseMixin, APIView):
    """Token usage statistics"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        period = request.query_params.get('period', 'today')
        
        if period == 'today':
            start_date = timezone.now().date()
        elif period == 'week':
            start_date = timezone.now().date() - timezone.timedelta(days=7)
        else:
            start_date = timezone.now().date() - timezone.timedelta(days=30)
        
        stats = {
            'period': period,
            'total_tokens': BSTToken.objects.filter(generated_at__date__gte=start_date).count(),
            'active_tokens': BSTToken.objects.filter(is_active=True, generated_at__date__gte=start_date).count(),
            'validations_count': 0,
            'average_validation_time_ms': 0,
            'compromised_tokens': BSTToken.objects.filter(is_compromised=True, compromised_at__date__gte=start_date).count()
        }
        
        return self.success_response(data=stats)
