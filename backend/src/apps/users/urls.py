"""
Users API URLs
User management, profiles, verification, devices
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'users'

# Router for ViewSets
router = DefaultRouter()
router.register(r'', views.UserViewSet, basename='user')
router.register(r'profiles', views.UserProfileViewSet, basename='profile')
router.register(r'devices', views.UserDeviceViewSet, basename='device')
router.register(r'login-history', views.LoginHistoryViewSet, basename='login_history')
router.register(r'activity-logs', views.UserActivityLogViewSet, basename='activity_log')

urlpatterns = [
    # User Management
    path('me/', views.CurrentUserView.as_view(), name='current_user'),
    path('me/profile/', views.CurrentUserProfileView.as_view(), name='current_user_profile'),
    path('me/devices/', views.CurrentUserDevicesView.as_view(), name='current_user_devices'),
    path('me/sessions/', views.CurrentUserSessionsView.as_view(), name='current_user_sessions'),
    
    # Verification
    path('verify/phone/', views.VerifyPhoneView.as_view(), name='verify_phone'),
    path('verify/email/', views.VerifyEmailView.as_view(), name='verify_email'),
    path('verify/id/', views.VerifyNationalIDView.as_view(), name='verify_id'),
    path('verify/send-code/', views.SendVerificationCodeView.as_view(), name='send_verification_code'),
    
    # Device Management
    path('devices/<uuid:pk>/trust/', views.TrustDeviceView.as_view(), name='trust_device'),
    path('devices/<uuid:pk>/block/', views.BlockDeviceView.as_view(), name='block_device'),
    
    # Session Management
    path('sessions/<uuid:pk>/terminate/', views.TerminateSessionView.as_view(), name='terminate_session'),
    path('sessions/terminate-all/', views.TerminateAllSessionsView.as_view(), name='terminate_all_sessions'),
    
    # User Search (Admin)
    path('search/', views.UserSearchView.as_view(), name='user_search'),
    path('statistics/', views.UserStatisticsView.as_view(), name='user_statistics'),
    
    # Router URLs
    path('', include(router.urls)),
]
