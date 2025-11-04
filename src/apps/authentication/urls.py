"""
Authentication API URLs
JWT token management, login, logout, password reset
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'authentication'

urlpatterns = [
    # Token Management
    path('token/', views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', views.TokenVerifyView.as_view(), name='token_verify'),
    path('token/revoke/', views.TokenRevokeView.as_view(), name='token_revoke'),
    
    # Authentication
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('register/', views.RegisterView.as_view(), name='register'),
    
    # Password Management
    path('password/change/', views.ChangePasswordView.as_view(), name='password_change'),
    path('password/reset/', views.PasswordResetRequestView.as_view(), name='password_reset'),
    path('password/reset/confirm/', views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # Two-Factor Authentication
    path('2fa/enable/', views.Enable2FAView.as_view(), name='enable_2fa'),
    path('2fa/disable/', views.Disable2FAView.as_view(), name='disable_2fa'),
    path('2fa/verify/', views.Verify2FAView.as_view(), name='verify_2fa'),
    
    # OAuth2
    path('oauth/applications/', views.OAuthApplicationListView.as_view(), name='oauth_applications'),
    path('oauth/authorize/', views.OAuthAuthorizeView.as_view(), name='oauth_authorize'),
]
