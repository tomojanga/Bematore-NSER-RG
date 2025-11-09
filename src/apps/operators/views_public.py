"""
Public Operator Views
Self-registration and public endpoints
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db import transaction
from django.contrib.auth import get_user_model

from .models import Operator
from .serializers import RegisterOperatorSerializer, OperatorDetailSerializer
from apps.api.mixins import TimingMixin, SuccessResponseMixin

User = get_user_model()


class PublicRegisterOperatorView(TimingMixin, SuccessResponseMixin, APIView):
    """
    Public operator self-registration endpoint
    POST /api/v1/operators/register/
    """
    permission_classes = [AllowAny]
    
    @transaction.atomic
    def post(self, request):
        serializer = RegisterOperatorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Check if operator already exists
        email = serializer.validated_data['email']
        if Operator.objects.filter(email=email).exists():
            return self.error_response(
                message='An operator with this email already exists.',
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Create operator with pending status
        operator = serializer.save()
        operator.integration_status = 'pending'
        operator.license_status = 'pending'
        operator.is_api_active = False
        operator.save()
        
        # User account will be created automatically by signal
        
        return self.success_response(
            data=OperatorDetailSerializer(operator).data,
            message='Operator registration submitted successfully. Your account is pending approval.',
            status_code=status.HTTP_201_CREATED
        )
