"""
Test cases for BST Token API
Critical tests for token generation and validation
"""
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
import time

from apps.users.models import User
from apps.bst.models import BSTToken


@pytest.mark.django_db
class TestBSTAPI:
    """Test BST Token API endpoints"""
    
    def setup_method(self):
        """Setup test data"""
        self.client = APIClient()
        
        # Create test user
        self.user = User.objects.create_user(
            phone_number='+254700000002',
            national_id='87654321',
            first_name='BST',
            last_name='User',
            email='bst@example.com',
            password='testpass123'
        )
        
        self.client.force_authenticate(user=self.user)
    
    def test_generate_bst_token(self):
        """Test BST token generation"""
        url = reverse('bst:token-generate')
        
        response = self.client.post(url, {}, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'token' in response.data['data']
        assert 'expires_at' in response.data['data']
        
        # Verify token created
        token = BSTToken.objects.get(user=self.user)
        assert token.is_active is True
    
    def test_validate_bst_token_success(self):
        """Test BST token validation"""
        # Create token
        token = BSTToken.objects.create(
            user=self.user,
            token='TEST123456789',
            is_active=True
        )
        
        url = reverse('bst:token-validate')
        data = {'token': 'TEST123456789'}
        
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['data']['is_valid'] is True
    
    def test_validate_bst_token_performance(self):
        """Test validation performance < 20ms requirement"""
        # Create token
        token = BSTToken.objects.create(
            user=self.user,
            token='PERF123456789',
            is_active=True
        )
        
        url = reverse('bst:token-validate')
        data = {'token': 'PERF123456789'}
        
        start_time = time.time()
        response = self.client.post(url, data, format='json')
        end_time = time.time()
        
        response_time_ms = (end_time - start_time) * 1000
        
        assert response.status_code == status.HTTP_200_OK
        assert response_time_ms < 20, f"Response time {response_time_ms}ms exceeds 20ms SLA"
    
    def test_validate_invalid_token(self):
        """Test validation of invalid token"""
        url = reverse('bst:token-validate')
        data = {'token': 'INVALID_TOKEN'}
        
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['data']['is_valid'] is False
    
    def test_deactivate_token(self):
        """Test token deactivation"""
        token = BSTToken.objects.create(
            user=self.user,
            token='DEACT123456789',
            is_active=True
        )
        
        url = reverse('bst:token-deactivate', kwargs={'pk': token.id})
        
        response = self.client.post(url, {}, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        
        token.refresh_from_db()
        assert token.is_active is False
    
    def test_bulk_token_generation(self):
        """Test bulk token generation"""
        url = reverse('bst:token-bulk-generate')
        data = {'count': 5}
        
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['data']['generated'] == 5
        
        # Verify tokens created
        tokens = BSTToken.objects.filter(user=self.user)
        assert tokens.count() == 5
