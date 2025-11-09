"""
Notifications API URLs
SMS, Email, Push notifications, templates
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'notifications'

# Router for ViewSets
router = DefaultRouter()
router.register(r'', views.NotificationViewSet, basename='notification')
router.register(r'templates', views.NotificationTemplateViewSet, basename='template')
router.register(r'batches', views.NotificationBatchViewSet, basename='batch')

urlpatterns = [
    # Send Notifications
    path('send/sms/', views.SendSMSView.as_view(), name='send_sms'),
    path('send/email/', views.SendEmailView.as_view(), name='send_email'),
    path('send/push/', views.SendPushNotificationView.as_view(), name='send_push'),
    path('send/bulk/', views.SendBulkNotificationView.as_view(), name='send_bulk'),
    
    # User Notifications
    path('my-notifications/', views.MyNotificationsView.as_view(), name='my_notifications'),
    path('my-notifications/unread/', views.UnreadNotificationsView.as_view(), name='unread_notifications'),
    path('<uuid:pk>/mark-read/', views.MarkAsReadView.as_view(), name='mark_read'),
    path('mark-all-read/', views.MarkAllAsReadView.as_view(), name='mark_all_read'),
    path('<uuid:pk>/archive/', views.ArchiveNotificationView.as_view(), name='archive_notification'),
    
    # Notification Preferences
    path('preferences/', views.NotificationPreferencesView.as_view(), name='preferences'),
    path('preferences/update/', views.UpdatePreferencesView.as_view(), name='update_preferences'),
    path('preferences/opt-out/', views.OptOutView.as_view(), name='opt_out'),
    path('preferences/opt-in/', views.OptInView.as_view(), name='opt_in'),
    
    # Templates
    path('templates/<str:template_code>/render/', views.RenderTemplateView.as_view(), name='render_template'),
    path('templates/test/', views.TestTemplateView.as_view(), name='test_template'),
    
    # Batch Campaigns
    path('batches/create/', views.CreateBatchView.as_view(), name='create_batch'),
    path('batches/<uuid:pk>/send/', views.SendBatchView.as_view(), name='send_batch'),
    path('batches/<uuid:pk>/cancel/', views.CancelBatchView.as_view(), name='cancel_batch'),
    path('batches/<uuid:pk>/status/', views.BatchStatusView.as_view(), name='batch_status'),
    
    # Delivery Tracking
    path('<uuid:pk>/delivery-status/', views.DeliveryStatusView.as_view(), name='delivery_status'),
    path('logs/email/', views.EmailLogsView.as_view(), name='email_logs'),
    path('logs/sms/', views.SMSLogsView.as_view(), name='sms_logs'),
    path('logs/push/', views.PushLogsView.as_view(), name='push_logs'),
    
    # Failed Notifications
    path('failed/', views.FailedNotificationsView.as_view(), name='failed_notifications'),
    path('retry-failed/', views.RetryFailedNotificationsView.as_view(), name='retry_failed'),
    
    # Statistics
    path('statistics/', views.NotificationStatisticsView.as_view(), name='statistics'),
    path('statistics/delivery-rate/', views.DeliveryRateView.as_view(), name='delivery_rate'),
    path('statistics/open-rate/', views.OpenRateView.as_view(), name='open_rate'),
    
    # Router URLs
    path('', include(router.urls)),
]
