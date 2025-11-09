"""
Users Views
User management, profiles, devices, verification
"""
from rest_framework import status, viewsets, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from django.utils import timezone
from django.db import transaction

from .models import (
    User, UserProfile, UserDevice, LoginHistory,
    IdentityVerification, UserSession, UserActivityLog
)
from .serializers import (
    UserListSerializer, UserDetailSerializer, UserProfileSerializer,
    UserDeviceSerializer, LoginHistorySerializer,
    IdentityVerificationSerializer, UserSessionSerializer,
    UserActivityLogSerializer, UpdateProfileSerializer,
    VerifyPhoneSerializer, VerifyEmailSerializer, VerifyNationalIDSerializer,
    TrustDeviceSerializer
)
from apps.api.permissions import IsGRAKStaff, IsOwnerOrGRAKStaff
from apps.api.mixins import TimingMixin, SuccessResponseMixin


class UserViewSet(TimingMixin, viewsets.ModelViewSet):
    """User CRUD ViewSet"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        return UserDetailSerializer
    
    def get_queryset(self):
        queryset = User.objects.select_related('profile').prefetch_related(
            'devices', 'login_history'
        )
        
        # Filter by role
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        
        # Filter by verification status
        is_verified = self.request.query_params.get('is_verified')
        if is_verified is not None:
            queryset = queryset.filter(is_verified=is_verified.lower() == 'true')
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def verify_user(self, request, pk=None):
        """Mark user as verified"""
        user = self.get_object()
        user.is_verified = True
        user.save()
        
        return Response({'message': 'User verified successfully'})
    
    @action(detail=True, methods=['post'])
    def lock_account(self, request, pk=None):
        """Lock user account"""
        user = self.get_object()
        user.is_locked = True
        user.locked_until = timezone.now() + timezone.timedelta(hours=24)
        user.save()
        
        return Response({'message': 'Account locked for 24 hours'})
    
    @action(detail=True, methods=['post'])
    def unlock_account(self, request, pk=None):
        """Unlock user account"""
        user = self.get_object()
        user.is_locked = False
        user.locked_until = None
        user.save()
        
        return Response({'message': 'Account unlocked'})


class ProfileView(TimingMixin, SuccessResponseMixin, APIView):
    """Get current user profile"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        profile, _ = UserProfile.objects.get_or_create(user=user)
        
        return self.success_response(
            data={
                'user': UserDetailSerializer(user).data,
                'profile': UserProfileSerializer(profile).data
            }
        )


class UpdateProfileView(TimingMixin, SuccessResponseMixin, APIView):
    """Update current user profile"""
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def put(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        
        serializer = UpdateProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return self.success_response(
            data=UserProfileSerializer(profile).data,
            message='Profile updated successfully'
        )


class VerifyPhoneView(TimingMixin, SuccessResponseMixin, APIView):
    """Verify phone number with code"""
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        serializer = VerifyPhoneSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        # Get verification record
        verification = IdentityVerification.objects.filter(
            user=request.user,
            verification_type='phone',
            status='pending'
        ).first()
        
        if not verification:
            return self.error_response(
                message='No pending verification found',
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if code expired
        if verification.code_expires_at < timezone.now():
            return self.error_response(
                message='Verification code expired',
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Check attempts
        if verification.attempts >= verification.max_attempts:
            return self.error_response(
                message='Maximum verification attempts exceeded',
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify code
        if verification.verification_code != serializer.validated_data['verification_code']:
            verification.attempts += 1
            verification.save()
            return self.error_response(
                message='Invalid verification code',
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark as verified
        verification.status = 'verified'
        verification.verified_at = timezone.now()
        verification.save()
        
        request.user.is_phone_verified = True
        request.user.save(update_fields=['is_phone_verified'])
        
        return self.success_response(message='Phone number verified successfully')


class VerifyEmailView(TimingMixin, SuccessResponseMixin, APIView):
    """Verify email with code"""
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        # Get verification record
        verification = IdentityVerification.objects.filter(
            user=request.user,
            verification_type='email',
            status='pending'
        ).first()
        
        if not verification:
            return self.error_response(
                message='No pending verification found',
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if code expired
        if verification.code_expires_at < timezone.now():
            return self.error_response(
                message='Verification code expired',
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify code
        if verification.verification_code != serializer.validated_data['verification_code']:
            verification.attempts += 1
            verification.save()
            return self.error_response(
                message='Invalid verification code',
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark as verified
        verification.status = 'verified'
        verification.verified_at = timezone.now()
        verification.save()
        
        request.user.is_email_verified = True
        request.user.save(update_fields=['is_email_verified'])
        
        return self.success_response(message='Email verified successfully')


class VerifyNationalIDView(TimingMixin, SuccessResponseMixin, APIView):
    """Verify national ID"""
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        serializer = VerifyNationalIDSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        # Create verification record
        verification = IdentityVerification.objects.create(
            user=request.user,
            verification_type='national_id',
            verification_data={'national_id': serializer.validated_data['national_id']},
            verified_at=timezone.now(),
            is_verified=True
        )
        
        request.user.is_verified = True
        request.user.save()
        
        return self.success_response(
            data=IdentityVerificationSerializer(verification).data,
            message='National ID verified successfully'
        )


class UserDevicesView(TimingMixin, generics.ListAPIView):
    """List user devices"""
    serializer_class = UserDeviceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserDevice.objects.filter(user=self.request.user).order_by('-last_used_at')


class TrustDeviceView(TimingMixin, SuccessResponseMixin, APIView):
    """Trust a device"""
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request, pk):
        device = UserDevice.objects.get(pk=pk, user=request.user)
        
        serializer = TrustDeviceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        device.is_trusted = serializer.validated_data['is_trusted']
        device.save()
        
        return self.success_response(
            data=UserDeviceSerializer(device).data,
            message='Device trust status updated'
        )


class LoginHistoryView(TimingMixin, generics.ListAPIView):
    """List user login history"""
    serializer_class = LoginHistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return LoginHistory.objects.filter(user=self.request.user).order_by('-login_at')[:50]


class ActiveSessionsView(TimingMixin, generics.ListAPIView):
    """List active user sessions"""
    serializer_class = UserSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserSession.objects.filter(
            user=self.request.user,
            is_active=True
        ).order_by('-created_at')


class TerminateSessionView(TimingMixin, SuccessResponseMixin, APIView):
    """Terminate a user session"""
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request, pk):
        session = UserSession.objects.get(pk=pk, user=request.user)
        session.is_active = False
        session.save()
        
        return self.success_response(message='Session terminated')


class TerminateAllSessionsView(TimingMixin, SuccessResponseMixin, APIView):
    """Terminate all user sessions"""
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        UserSession.objects.filter(user=request.user, is_active=True).update(is_active=False)
        
        return self.success_response(message='All sessions terminated')


class ActivityLogView(TimingMixin, generics.ListAPIView):
    """User activity log"""
    serializer_class = UserActivityLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserActivityLog.objects.filter(user=self.request.user).order_by('-created_at')[:100]


class UserStatisticsView(TimingMixin, SuccessResponseMixin, APIView):
    """User statistics"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        stats = {
            'total_users': User.objects.count(),
            'verified_users': User.objects.filter(is_verified=True).count(),
            'active_today': User.objects.filter(
                last_login_at__date=timezone.now().date()
            ).count(),
            'new_this_month': User.objects.filter(
                created_at__month=timezone.now().month
            ).count(),
            'by_role': {},
            'by_county': {}
        }
        
        return self.success_response(data=stats)


class UserProfileViewSet(TimingMixin, viewsets.ModelViewSet):
    """User profiles"""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role in ['grak_admin', 'grak_officer']:
            return UserProfile.objects.select_related('user').all()
        return UserProfile.objects.filter(user=self.request.user)


class UserDeviceViewSet(TimingMixin, viewsets.ReadOnlyModelViewSet):
    """User devices"""
    serializer_class = UserDeviceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role in ['grak_admin', 'grak_officer']:
            return UserDevice.objects.select_related('user').all()
        return UserDevice.objects.filter(user=self.request.user)


class LoginHistoryViewSet(TimingMixin, viewsets.ReadOnlyModelViewSet):
    """Login history"""
    serializer_class = LoginHistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role in ['grak_admin', 'grak_officer']:
            return LoginHistory.objects.select_related('user').order_by('-login_at')
        return LoginHistory.objects.filter(user=self.request.user).order_by('-login_at')


class UserActivityLogViewSet(TimingMixin, viewsets.ReadOnlyModelViewSet):
    """User activity logs"""
    serializer_class = UserActivityLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role in ['grak_admin', 'grak_officer']:
            return UserActivityLog.objects.select_related('user').order_by('-created_at')
        return UserActivityLog.objects.filter(user=self.request.user).order_by('-created_at')


# Missing views from URLs
class CurrentUserView(TimingMixin, SuccessResponseMixin, APIView):
    """Get current user"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return self.success_response(data=UserDetailSerializer(request.user).data)


class CurrentUserProfileView(TimingMixin, SuccessResponseMixin, APIView):
    """Get current user profile"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        return self.success_response(data=UserProfileSerializer(profile).data)


class CurrentUserDevicesView(TimingMixin, generics.ListAPIView):
    """Get current user devices"""
    serializer_class = UserDeviceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserDevice.objects.filter(user=self.request.user)


class CurrentUserSessionsView(TimingMixin, generics.ListAPIView):
    """Get current user sessions"""
    serializer_class = UserSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserSession.objects.filter(user=self.request.user, is_active=True)


class SendVerificationCodeView(TimingMixin, SuccessResponseMixin, APIView):
    """Send verification code"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        verification_type = request.data.get('type', 'phone')
        
        from apps.users.tasks import send_verification_code
        result = send_verification_code(str(request.user.id), verification_type)
        
        if result:
            return self.success_response(message=f'Verification code sent to your {verification_type}')
        else:
            return self.error_response(
                message='Failed to send verification code',
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BlockDeviceView(TimingMixin, SuccessResponseMixin, APIView):
    """Block device"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        device = UserDevice.objects.get(pk=pk, user=request.user)
        device.is_blocked = True
        device.save()
        
        return self.success_response(message='Device blocked')


class UserSearchView(TimingMixin, SuccessResponseMixin, APIView):
    """Search users"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        query = request.query_params.get('q', '')
        users = User.objects.filter(phone_number__icontains=query)[:50]
        
        return self.success_response(data=UserListSerializer(users, many=True).data)
