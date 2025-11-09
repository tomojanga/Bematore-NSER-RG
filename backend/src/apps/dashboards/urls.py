"""
Dashboards API URLs & WebSocket Routing
Real-time dashboards via WebSockets
"""
from django.urls import path
from . import views

app_name = 'dashboards'

urlpatterns = [
    # Dashboard Widgets
    path('widgets/', views.DashboardWidgetListView.as_view(), name='widget_list'),
    path('widgets/create/', views.CreateWidgetView.as_view(), name='create_widget'),
    path('widgets/<uuid:pk>/', views.DashboardWidgetDetailView.as_view(), name='widget_detail'),
    path('widgets/<uuid:pk>/update/', views.UpdateWidgetView.as_view(), name='update_widget'),
    path('widgets/<uuid:pk>/delete/', views.DeleteWidgetView.as_view(), name='delete_widget'),
    path('widgets/reorder/', views.ReorderWidgetsView.as_view(), name='reorder_widgets'),
    
    # Dashboard Layouts
    path('my-dashboard/', views.MyDashboardView.as_view(), name='my_dashboard'),
    path('layouts/save/', views.SaveDashboardLayoutView.as_view(), name='save_layout'),
    path('layouts/reset/', views.ResetDashboardLayoutView.as_view(), name='reset_layout'),
]
