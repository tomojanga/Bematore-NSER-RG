"""
Dashboards Serializers
Dashboard widgets, layouts, real-time data formatting
"""
from rest_framework import serializers
from .models import DashboardWidget


class DashboardWidgetSerializer(serializers.ModelSerializer):
    """Dashboard widget serializer"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = DashboardWidget
        fields = [
            'id', 'user', 'user_name', 'widget_type',
            'position_x', 'position_y', 'width', 'height',
            'config', 'is_visible',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        # Validate position and size
        if attrs.get('position_x', 0) < 0 or attrs.get('position_y', 0) < 0:
            raise serializers.ValidationError(
                "Position coordinates must be non-negative."
            )
        
        if attrs.get('width', 1) < 1 or attrs.get('width', 1) > 12:
            raise serializers.ValidationError(
                "Width must be between 1 and 12."
            )
        
        if attrs.get('height', 1) < 1 or attrs.get('height', 1) > 12:
            raise serializers.ValidationError(
                "Height must be between 1 and 12."
            )
        
        return attrs


class CreateWidgetSerializer(serializers.Serializer):
    """Create widget serializer"""
    widget_type = serializers.ChoiceField(
        choices=[
            ('exclusion_stats', 'Exclusion Stats'),
            ('risk_distribution', 'Risk Distribution'),
            ('operator_compliance', 'Operator Compliance'),
            ('api_performance', 'API Performance'),
            ('recent_activities', 'Recent Activities')
        ],
        required=True
    )
    position_x = serializers.IntegerField(default=0, min_value=0)
    position_y = serializers.IntegerField(default=0, min_value=0)
    width = serializers.IntegerField(default=4, min_value=1, max_value=12)
    height = serializers.IntegerField(default=4, min_value=1, max_value=12)
    config = serializers.JSONField(required=False)


class UpdateWidgetSerializer(serializers.Serializer):
    """Update widget serializer"""
    position_x = serializers.IntegerField(required=False, min_value=0)
    position_y = serializers.IntegerField(required=False, min_value=0)
    width = serializers.IntegerField(required=False, min_value=1, max_value=12)
    height = serializers.IntegerField(required=False, min_value=1, max_value=12)
    config = serializers.JSONField(required=False)
    is_visible = serializers.BooleanField(required=False)


class ReorderWidgetsSerializer(serializers.Serializer):
    """Reorder widgets serializer"""
    widgets = serializers.ListField(
        child=serializers.DictField(),
        min_length=1,
        required=True
    )
    
    def validate_widgets(self, value):
        required_fields = ['id', 'position_x', 'position_y']
        
        for idx, widget in enumerate(value):
            for field in required_fields:
                if field not in widget:
                    raise serializers.ValidationError(
                        f"Widget {idx + 1} missing required field: {field}"
                    )
        
        return value


class DashboardLayoutSerializer(serializers.Serializer):
    """Dashboard layout serializer"""
    layout_name = serializers.CharField(max_length=100)
    widgets = DashboardWidgetSerializer(many=True, read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
