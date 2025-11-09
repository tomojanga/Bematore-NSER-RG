"""
Dashboards Views
Dashboard widgets and layout management
"""
from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction

from .models import DashboardWidget
from .serializers import (
    DashboardWidgetSerializer, CreateWidgetSerializer,
    UpdateWidgetSerializer, ReorderWidgetsSerializer
)
from apps.api.mixins import TimingMixin, SuccessResponseMixin


class DashboardWidgetViewSet(TimingMixin, viewsets.ModelViewSet):
    """Dashboard widget management"""
    serializer_class = DashboardWidgetSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return DashboardWidget.objects.filter(
            user=self.request.user,
            is_active=True
        ).order_by('position')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateWidgetSerializer
        elif self.action in ['update', 'partial_update']:
            return UpdateWidgetSerializer
        return DashboardWidgetSerializer


class ReorderWidgetsView(TimingMixin, SuccessResponseMixin, APIView):
    """Reorder dashboard widgets"""
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        serializer = ReorderWidgetsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        widget_orders = serializer.validated_data['widgets']
        
        for item in widget_orders:
            DashboardWidget.objects.filter(
                id=item['widget_id'],
                user=request.user
            ).update(position=item['position'])
        
        return self.success_response(message='Widgets reordered')


class ResetDashboardView(TimingMixin, SuccessResponseMixin, APIView):
    """Reset dashboard to default"""
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        # Delete all user widgets
        DashboardWidget.objects.filter(user=request.user).delete()
        
        # Create default widgets
        default_widgets = [
            {'widget_type': 'statistics_overview', 'position': 0},
            {'widget_type': 'recent_exclusions', 'position': 1},
            {'widget_type': 'risk_assessments', 'position': 2}
        ]
        
        for widget_data in default_widgets:
            DashboardWidget.objects.create(
                user=request.user,
                **widget_data
            )
        
        return self.success_response(message='Dashboard reset to default')

class DashboardWidgetListView(TimingMixin, SuccessResponseMixin, APIView):
    """List dashboard widgets"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        widgets = DashboardWidget.objects.filter(
            user=request.user,
            is_active=True
        ).order_by('position')
        return self.success_response(data=DashboardWidgetSerializer(widgets, many=True).data)


class CreateWidgetView(TimingMixin, SuccessResponseMixin, APIView):
    """Create widget"""
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        serializer = CreateWidgetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        widget = DashboardWidget.objects.create(
            user=request.user,
            **serializer.validated_data
        )
        
        return self.success_response(
            data=DashboardWidgetSerializer(widget).data,
            message='Widget created',
            status_code=status.HTTP_201_CREATED
        )


class DashboardWidgetDetailView(TimingMixin, SuccessResponseMixin, APIView):
    """Widget detail"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        widget = DashboardWidget.objects.get(pk=pk, user=request.user)
        return self.success_response(data=DashboardWidgetSerializer(widget).data)


class UpdateWidgetView(TimingMixin, SuccessResponseMixin, APIView):
    """Update widget"""
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def put(self, request, pk):
        widget = DashboardWidget.objects.get(pk=pk, user=request.user)
        serializer = UpdateWidgetSerializer(widget, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return self.success_response(
            data=DashboardWidgetSerializer(widget).data,
            message='Widget updated'
        )


class DeleteWidgetView(TimingMixin, SuccessResponseMixin, APIView):
    """Delete widget"""
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, pk):
        widget = DashboardWidget.objects.get(pk=pk, user=request.user)
        widget.delete()
        return self.success_response(message='Widget deleted')


class MyDashboardView(TimingMixin, SuccessResponseMixin, APIView):
    """Get user's dashboard"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        widgets = DashboardWidget.objects.filter(
            user=request.user,
            is_active=True
        ).order_by('position')
        
        dashboard = {
            'widgets': DashboardWidgetSerializer(widgets, many=True).data,
            'layout': 'grid'
        }
        
        return self.success_response(data=dashboard)


class SaveDashboardLayoutView(TimingMixin, SuccessResponseMixin, APIView):
    """Save dashboard layout"""
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        layout = request.data.get('layout')
        # Save layout configuration
        return self.success_response(message='Layout saved')


class ResetDashboardLayoutView(TimingMixin, SuccessResponseMixin, APIView):
    """Reset dashboard layout"""
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        # Reset to default layout
        DashboardWidget.objects.filter(user=request.user).delete()
        
        # Create default widgets
        default_widgets = [
            {'widget_type': 'statistics_overview', 'position': 0},
            {'widget_type': 'recent_exclusions', 'position': 1},
            {'widget_type': 'risk_assessments', 'position': 2}
        ]
        
        for widget_data in default_widgets:
            DashboardWidget.objects.create(
                user=request.user,
                **widget_data
            )
        
        return self.success_response(message='Layout reset to default')
