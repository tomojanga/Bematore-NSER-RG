"""
Authentication Views
Login, logout, token management, password reset, 2FA, OAuth2
"""
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView as BaseTokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, login, logout
from django.utils import timezone
from datetime import timedelta

from .serializers import (
    CustomTokenObtainPairSerializer, LoginSerializer, LogoutSerializer,
    TokenVerifySerializer, TokenRevokeSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    Enable2FASerializer, Disable2FASerializer, Verify2FASerializer,
    OAuthApplicationSerializer, OAuthAuthorizeSerializer
)
from .models import PasswordResetToken, TwoFactorAuth
from apps.users.models import User
from apps.api.mixins import TimingMixin, SuccessResponseMixin


class TokenObtainPairView(TimingMixin, BaseTokenObtainPairView):
    """
    JWT Token obtain pair view with custom claims
    
    POST /api/v1/auth/token/
    """
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]


class TokenVerifyView(TimingMixin, SuccessResponseMixin, APIView):
    """
    Verify JWT token validity
    
    POST /api/v1/auth/token/verify/
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = TokenVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            from rest_framework_simplejwt.tokens import AccessToken
            token = AccessToken(serializer.validated_data['token'])
            
            return self.success_response(
                data={'valid': True, 'user_id': str(token['user_id'])},
                message='Token is valid'
            )
        except Exception as e:
            return self.error_response(
                message='Invalid token',
                errors={'token': str(e)},
                status_code=status.HTTP_401_UNAUTHORIZED
            )


class TokenRevokeView(TimingMixin, SuccessResponseMixin, APIView):
    """
    Revoke refresh token
    
    POST /api/v1/auth/token/revoke/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = TokenRevokeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            token = RefreshToken(serializer.validated_data['refresh_token'])
            token.blacklist()
            
            return self.success_response(message='Token revoked successfully')
        except Exception as e:
            return self.error_response(
                message='Failed to revoke token',
                errors={'token': str(e)}
            )


class LoginView(TimingMixin, SuccessResponseMixin, APIView):
    """
    User login with device tracking
    
    POST /api/v1/auth/login/
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        # Update last login
        user.last_login_at = timezone.now()
        user.save(update_fields=['last_login_at'])
        
        # Track device (async)
        device_id = serializer.validated_data.get('device_id')
        device_name = serializer.validated_data.get('device_name')
        
        if device_id:
            from apps.users.tasks import track_user_device
            track_user_device.delay(
                user_id=str(user.id),
                device_id=device_id,
                device_name=device_name,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
        
        return self.success_response(
            data={
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': str(user.id),
                    'phone_number': str(user.phone_number),
                    'email': user.email,
                    'role': user.role,
                    'is_verified': user.is_verified,
                    'is_phone_verified': user.is_phone_verified,
                    'is_email_verified': user.is_email_verified,
                    'is_id_verified': user.is_id_verified,
                    'verification_status': user.verification_status
                }
            },
            message='Login successful'
        )
    
    @staticmethod
    def get_client_ip(request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')


class LogoutView(TimingMixin, SuccessResponseMixin, APIView):
    """
    User logout
    
    POST /api/v1/auth/logout/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            # Blacklist refresh token if provided
            if serializer.validated_data.get('refresh_token'):
                token = RefreshToken(serializer.validated_data['refresh_token'])
                token.blacklist()
            
            # Terminate sessions if requested
            if serializer.validated_data.get('all_devices'):
                from apps.users.models import UserSession
                UserSession.objects.filter(user=request.user, is_active=True).update(
                    is_active=False
                )
            
            return self.success_response(message='Logout successful')
        except Exception as e:
            return self.error_response(
                message='Logout failed',
                errors={'error': str(e)}
            )


class RegisterView(TimingMixin, SuccessResponseMixin, APIView):
    """
    User registration
    
    POST /api/v1/auth/register/
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        from apps.users.serializers import UserRegistrationSerializer
        
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create user
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        # Send verification code
        from apps.users.tasks import send_verification_code
        send_verification_code(str(user.id), 'phone')
        
        return self.success_response(
            data={
                'user': {
                    'id': str(user.id),
                    'phone_number': str(user.phone_number),
                    'email': user.email,
                    'role': user.role,
                    'is_active': user.is_active,
                    'is_verified': user.is_verified,
                    'created_at': user.created_at.isoformat(),
                    'updated_at': user.updated_at.isoformat(),
                    'has_2fa': user.is_2fa_enabled
                },
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            },
            message='Registration successful. Verification code sent to your phone.',
            status_code=status.HTTP_201_CREATED
        )


class ChangePasswordView(TimingMixin, SuccessResponseMixin, APIView):
    """
    Change user password
    
    POST /api/v1/auth/password/change/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        from apps.users.serializers import ChangePasswordSerializer
        
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        # Save new password
        serializer.save()
        
        return self.success_response(message='Password changed successfully')


class PasswordResetRequestView(TimingMixin, SuccessResponseMixin, APIView):
    """
    Request password reset
    
    POST /api/v1/auth/password/reset/
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Find user
        phone_number = serializer.validated_data.get('phone_number')
        email = serializer.validated_data.get('email')
        
        user = None
        if phone_number:
            user = User.objects.filter(phone_number=phone_number).first()
        elif email:
            user = User.objects.filter(email=email).first()
        
        if user:
            # Generate reset token
            import secrets
            token = secrets.token_urlsafe(32)
            
            PasswordResetToken.objects.create(
                user=user,
                token=token,
                expires_at=timezone.now() + timedelta(hours=1)
            )
            
            # Send reset code (async)
            from apps.notifications.tasks import send_password_reset
            send_password_reset.delay(
                user_id=str(user.id),
                token=token
            )
        
        # Always return success (security)
        return self.success_response(
            message='If the account exists, a password reset code has been sent.'
        )


class PasswordResetConfirmView(TimingMixin, SuccessResponseMixin, APIView):
    """
    Confirm password reset with token
    
    POST /api/v1/auth/password/reset/confirm/
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Find token
        token_obj = PasswordResetToken.objects.filter(
            token=serializer.validated_data['token'],
            is_used=False
        ).select_related('user').first()
        
        if not token_obj or token_obj.expires_at < timezone.now():
            return self.error_response(
                message='Invalid or expired reset token',
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Update password
        user = token_obj.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        # Mark token as used
        token_obj.is_used = True
        token_obj.save()
        
        return self.success_response(message='Password reset successful')


class Enable2FAView(TimingMixin, SuccessResponseMixin, APIView):
    """
    Enable two-factor authentication
    
    POST /api/v1/auth/2fa/enable/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = Enable2FASerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        method = serializer.validated_data['method']
        
        # Generate secret for TOTP
        if method == 'totp':
            import pyotp
            secret = pyotp.random_base32()
            
            # Create 2FA record
            twofa, created = TwoFactorAuth.objects.get_or_create(
                user=request.user,
                defaults={'method': method, 'secret': secret, 'is_enabled': False}
            )
            
            if not created:
                twofa.secret = secret
                twofa.save()
            
            # Generate QR code URI
            totp = pyotp.TOTP(secret)
            qr_uri = totp.provisioning_uri(
                name=str(request.user.phone_number),
                issuer_name='NSER-RG'
            )
            
            return self.success_response(
                data={
                    'secret': secret,
                    'qr_uri': qr_uri,
                    'message': 'Scan the QR code with your authenticator app'
                }
            )
        
        # SMS or Email 2FA
        else:
            twofa, created = TwoFactorAuth.objects.get_or_create(
                user=request.user,
                defaults={'method': method, 'is_enabled': False}
            )
            
            # Send verification code
            from apps.users.tasks import send_2fa_code
            try:
                send_2fa_code.delay(
                    user_id=str(request.user.id),
                    method=method
                )
            except AttributeError:
                # Celery not configured, call directly
                send_2fa_code(str(request.user.id), method)
            
            return self.success_response(
                message=f'Verification code sent via {method}'
            )


class Disable2FAView(TimingMixin, SuccessResponseMixin, APIView):
    """
    Disable two-factor authentication
    
    POST /api/v1/auth/2fa/disable/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = Disable2FASerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Verify password
        if not request.user.check_password(serializer.validated_data['password']):
            return self.error_response(
                message='Invalid password',
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify 2FA code
        twofa = TwoFactorAuth.objects.filter(user=request.user).first()
        
        if not twofa:
            return self.error_response(message='2FA not enabled')
        
        # Verify code based on method
        code = serializer.validated_data['verification_code']
        
        if twofa.method == 'totp':
            import pyotp
            totp = pyotp.TOTP(twofa.secret)
            if not totp.verify(code, valid_window=1):
                return self.error_response(message='Invalid verification code')
        
        # Disable 2FA
        twofa.is_enabled = False
        twofa.save()
        
        return self.success_response(message='2FA disabled successfully')


class Verify2FAView(TimingMixin, SuccessResponseMixin, APIView):
    """
    Verify 2FA code during login
    
    POST /api/v1/auth/2fa/verify/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = Verify2FASerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Check for existing 2FA (enabled or in setup process)
        twofa = TwoFactorAuth.objects.filter(user=request.user).first()
        
        if not twofa:
            return self.error_response(message='2FA not set up')
        
        code = serializer.validated_data['verification_code']
        
        # Verify code based on method
        if twofa.method == 'totp':
            import pyotp
            totp = pyotp.TOTP(twofa.secret)
            if not totp.verify(code, valid_window=1):
                return self.error_response(
                    message='Invalid verification code',
                    status_code=status.HTTP_400_BAD_REQUEST
                )
        elif twofa.method in ['sms', 'email']:
            # Verify against stored code in cache/session
            from django.core.cache import cache
            stored_code = cache.get(f'2fa_code_{request.user.id}')
            
            if not stored_code or stored_code != code:
                return self.error_response(
                    message='Invalid or expired verification code',
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            # Clear the stored code
            cache.delete(f'2fa_code_{request.user.id}')
        
        # Enable 2FA if not already enabled
        if not twofa.is_enabled:
            twofa.is_enabled = True
            twofa.save()
        
        return self.success_response(
            data={'verified': True},
            message='2FA verification successful'
        )


class OAuthApplicationListView(TimingMixin, generics.ListCreateAPIView):
    """
    List and create OAuth applications
    
    GET/POST /api/v1/auth/oauth/applications/
    """
    serializer_class = OAuthApplicationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return self.request.user.oauth_applications.all()


class OAuthAuthorizeView(TimingMixin, SuccessResponseMixin, APIView):
    """
    OAuth authorization endpoint
    
    POST /api/v1/auth/oauth/authorize/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = OAuthAuthorizeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Generate authorization code
        import secrets
        auth_code = secrets.token_urlsafe(32)
        
        # Store in cache temporarily (5 minutes)
        from django.core.cache import cache
        cache_key = f"oauth_code:{auth_code}"
        cache.set(cache_key, {
            'user_id': str(request.user.id),
            'client_id': serializer.validated_data['client_id'],
            'scope': serializer.validated_data.get('scope', '')
        }, 300)
        
        # Redirect with code
        redirect_uri = serializer.validated_data['redirect_uri']
        state = serializer.validated_data.get('state', '')
        
        return self.success_response(
            data={
                'authorization_code': auth_code,
                'redirect_uri': f"{redirect_uri}?code={auth_code}&state={state}"
            }
        )
