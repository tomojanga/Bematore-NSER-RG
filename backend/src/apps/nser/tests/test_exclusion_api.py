"""
Test cases for NSER Exclusion API
Critical tests for self-exclusion registration and lookup
"""
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.utils import timezone
from datetime import timedelta

from apps.users.models import User
from apps.nser.models import SelfExclusionRecord


@pytest.mark.django_db
class TestExclusionAPI:
    """Test Self-Exclusion API endpoints"""
    
    def setup_method(self):
        """Setup test data"""
        self.client = APIClient()
        
        # Create test user
        self.user = User.objects.create_user(
            phone_number='+254700000001',
            national_id='12345678',
            first_name='Test',
            last_name='User',
            email='test@example.com',
            password='testpass123'
        )
        
        # Authenticate
        self.client.force_authenticate(user=self.user)
    
    def test_register_exclusion_success(self):
        """Test successful exclusion registration"""
        url = reverse('nser:exclusion-register')
        data = {
            'exclusion_type': 'self',
            'duration_months': 6,
            'reason': 'Personal decision'
        }
        
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'exclusion_id' in response.data['data']
        
        # Verify exclusion created
        exclusion = SelfExclusionRecord.objects.get(user=self.user)
        assert exclusion.is_active is True
        assert exclusion.exclusion_type == 'self'
    
    def test_exclusion_lookup_active(self):
        """Test lookup returns active exclusion"""
        # Create active exclusion
        exclusion = SelfExclusionRecord.objects.create(
            user=self.user,
            exclusion_type='self',
            start_date=timezone.now().date(),
            end_date=timezone.now().date() + timedelta(days=180),
            is_active=True
        )
        
        url = reverse('nser:exclusion-lookup')
        data = {'national_id': '12345678'}
        
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['data']['is_excluded'] is True
        assert response.data['data']['exclusion_id'] == str(exclusion.id)
    
    def test_exclusion_lookup_not_found(self):
        """Test lookup with no exclusion"""
        url = reverse('nser:exclusion-lookup')
        data = {'national_id': '99999999'}
        
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['data']['is_excluded'] is False
    
    def test_exclusion_lookup_performance(self):
        """Test lookup performance < 50ms requirement"""
        import time
        
        # Create exclusion
        SelfExclusionRecord.objects.create(
            user=self.user,
            exclusion_type='self',
            start_date=timezone.now().date(),
            end_date=timezone.now().date() + timedelta(days=180),
            is_active=True
        )
        
        url = reverse('nser:exclusion-lookup')
        data = {'national_id': '12345678'}
        
        start_time = time.time()
        response = self.client.post(url, data, format='json')
        end_time = time.time()
        
        response_time_ms = (end_time - start_time) * 1000
        
        assert response.status_code == status.HTTP_200_OK
        assert response_time_ms < 50, f"Response time {response_time_ms}ms exceeds 50ms SLA"
    
    def test_cannot_register_duplicate_exclusion(self):
        """Test cannot register exclusion when one is active"""
        # Create existing exclusion
        SelfExclusionRecord.objects.create(
            user=self.user,
            exclusion_type='self',
            start_date=timezone.now().date(),
            end_date=timezone.now().date() + timedelta(days=180),
            is_active=True
        )
        
        url = reverse('nser:exclusion-register')
        data = {
            'exclusion_type': 'self',
            'duration_months': 6
        }
        
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_terminate_exclusion(self):
        """Test exclusion termination"""
        exclusion = SelfExclusionRecord.objects.create(
            user=self.user,
            exclusion_type='self',
            start_date=timezone.now().date(),
            end_date=timezone.now().date() + timedelta(days=180),
            is_active=True
        )
        
        url = reverse('nser:exclusion-terminate', kwargs={'pk': exclusion.id})
        data = {'reason': 'Personal request'}
        
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        
        exclusion.refresh_from_db()
        assert exclusion.is_active is False
        assert exclusion.terminated_at is not None
