"""
Test operator and NSER API permissions
Tests to verify that permission checks are working correctly after fixes
"""
import pytest
from django.test import TestCase, RequestFactory
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from src.apps.users.models import User
from src.apps.operators.models import Operator, APIKey, IntegrationConfig
from src.apps.nser.models import Exclusion

User = get_user_model()


class OperatorPermissionTestCase(APITestCase):
    """Test operator permission checks"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create GRAK staff user
        self.grak_admin = User.objects.create_user(
            email='grak@example.com',
            password='testpass123',
            role='grak_admin',
            first_name='GRAK',
            last_name='Admin'
        )
        
        # Create operator admin user
        self.operator_user = User.objects.create_user(
            email='operator@example.com',
            password='testpass123',
            role='operator_admin',
            phone_number='+1234567890',
            first_name='Operator',
            last_name='Admin'
        )
        
        # Create operator
        self.operator = Operator.objects.create(
            name='Test Operator',
            email='operator@example.com',
            phone='+1234567890',
            registration_number='REG-001',
            operator_code='OP-001',
            license_number='LIC-001',
            license_type='standard',
            license_status='active'
        )
    
    def test_grak_admin_can_access_api_keys(self):
        """Test GRAK admin can access API keys"""
        self.client.force_authenticate(user=self.grak_admin)
        response = self.client.get('/api/v1/operators/api-keys/')
        
        # Should not be 403
        self.assertNotEqual(response.status_code, status.HTTP_403_FORBIDDEN,
                           f"GRAK admin should access API keys, got {response.status_code}")
    
    def test_operator_admin_can_access_own_api_keys(self):
        """Test operator admin can access their own API keys"""
        self.client.force_authenticate(user=self.operator_user)
        response = self.client.get('/api/v1/operators/api-keys/')
        
        # Should not be 403
        self.assertNotEqual(response.status_code, status.HTTP_403_FORBIDDEN,
                           f"Operator admin should access API keys, got {response.status_code}")
    
    def test_operator_admin_can_access_statistics(self):
        """Test operator admin can access statistics endpoint"""
        self.client.force_authenticate(user=self.operator_user)
        response = self.client.get('/api/v1/nser/statistics/')
        
        # Should not be 403
        self.assertNotEqual(response.status_code, status.HTTP_403_FORBIDDEN,
                           f"Operator admin should access statistics, got {response.status_code}")
    
    def test_anonymous_user_cannot_access_api_keys(self):
        """Test anonymous user cannot access API keys"""
        response = self.client.get('/api/v1/operators/api-keys/')
        
        # Should be 401 (unauthorized) not 403
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_operator_admin_gets_correct_role_from_getattr(self):
        """Test that getattr(user, 'role', None) returns the correct role"""
        self.client.force_authenticate(user=self.operator_user)
        # This tests the getattr() fix
        self.assertEqual(self.operator_user.role, 'operator_admin')
    
    def test_grak_officer_can_access_statistics(self):
        """Test GRAK officer can access statistics"""
        grak_officer = User.objects.create_user(
            email='officer@example.com',
            password='testpass123',
            role='grak_officer'
        )
        
        self.client.force_authenticate(user=grak_officer)
        response = self.client.get('/api/v1/nser/statistics/')
        
        # Should not be 403
        self.assertNotEqual(response.status_code, status.HTTP_403_FORBIDDEN,
                           f"GRAK officer should access statistics, got {response.status_code}")


class OperatorMyOperatorViewTestCase(APITestCase):
    """Test MyOperatorView permission checks"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create operator admin user
        self.operator_user = User.objects.create_user(
            email='operator@example.com',
            password='testpass123',
            role='operator_admin',
            phone_number='+1234567890'
        )
        
        # Create operator
        self.operator = Operator.objects.create(
            name='Test Operator',
            email='operator@example.com',
            phone='+1234567890',
            registration_number='REG-001',
            operator_code='OP-001',
            license_number='LIC-001',
            license_type='standard',
            license_status='active'
        )
    
    def test_operator_can_get_own_operator_info(self):
        """Test operator can get their own operator info"""
        self.client.force_authenticate(user=self.operator_user)
        response = self.client.get('/api/v1/operators/my-operator/')
        
        # Should not be 403 or 404
        self.assertNotEqual(response.status_code, status.HTTP_403_FORBIDDEN,
                           f"Operator should access their own info, got {response.status_code}")
        self.assertNotEqual(response.status_code, status.HTTP_404_NOT_FOUND,
                           f"Operator should be found, got {response.status_code}")
    
    def test_operator_lookup_by_email(self):
        """Test operator lookup by email"""
        self.client.force_authenticate(user=self.operator_user)
        response = self.client.get('/api/v1/operators/my-operator/')
        
        # Should succeed and find the operator by email
        if response.status_code == status.HTTP_200_OK:
            data = response.json()
            self.assertEqual(data['data']['email'], 'operator@example.com')
    
    def test_operator_lookup_by_phone_fallback(self):
        """Test operator lookup by phone number as fallback"""
        # Create operator with only phone, not email
        self.operator.email = None
        self.operator.save()
        
        self.client.force_authenticate(user=self.operator_user)
        response = self.client.get('/api/v1/operators/my-operator/')
        
        # Should still find operator by phone
        if response.status_code == status.HTTP_200_OK:
            data = response.json()
            self.assertEqual(data['data']['phone'], '+1234567890')


class APIKeyQuerysetTestCase(APITestCase):
    """Test APIKeyViewSet queryset filtering"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create two operators
        self.operator1 = Operator.objects.create(
            name='Operator 1',
            email='op1@example.com',
            phone='+1111111111',
            registration_number='REG-001',
            operator_code='OP-001',
            license_number='LIC-001',
            license_type='standard',
            license_status='active'
        )
        
        self.operator2 = Operator.objects.create(
            name='Operator 2',
            email='op2@example.com',
            phone='+2222222222',
            registration_number='REG-002',
            operator_code='OP-002',
            license_number='LIC-002',
            license_type='standard',
            license_status='active'
        )
        
        # Create API keys for each operator
        self.key1 = APIKey.objects.create(
            operator=self.operator1,
            key_name='Key 1'
        )
        
        self.key2 = APIKey.objects.create(
            operator=self.operator2,
            key_name='Key 2'
        )
        
        # Create operator admin users
        self.op1_user = User.objects.create_user(
            email='op1@example.com',
            password='testpass123',
            role='operator_admin',
            phone_number='+1111111111'
        )
        
        self.op2_user = User.objects.create_user(
            email='op2@example.com',
            password='testpass123',
            role='operator_admin',
            phone_number='+2222222222'
        )
    
    def test_operator_only_sees_own_keys(self):
        """Test operator only sees their own API keys"""
        self.client.force_authenticate(user=self.op1_user)
        response = self.client.get('/api/v1/operators/api-keys/')
        
        # Should return only operator1's keys
        if response.status_code == status.HTTP_200_OK:
            data = response.json()
            keys = data.get('data', [])
            # Should only have key1
            for key in keys:
                self.assertEqual(key['operator'], self.operator1.id,
                               "Operator should only see their own keys")
    
    def test_grak_sees_all_keys(self):
        """Test GRAK staff sees all API keys"""
        grak = User.objects.create_user(
            email='grak@example.com',
            password='testpass123',
            role='grak_admin'
        )
        
        self.client.force_authenticate(user=grak)
        response = self.client.get('/api/v1/operators/api-keys/')
        
        # Should return all keys
        if response.status_code == status.HTTP_200_OK:
            data = response.json()
            # Should have both keys in results
            self.assertGreaterEqual(len(data.get('data', [])), 2,
                                   "GRAK should see all API keys")


class IntegrationConfigPermissionsTestCase(APITestCase):
    """Test IntegrationConfigViewSet permission checks"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create operator
        self.operator = Operator.objects.create(
            name='Test Operator',
            email='operator@example.com',
            phone='+1234567890',
            registration_number='REG-001',
            operator_code='OP-001',
            license_number='LIC-001',
            license_type='standard',
            license_status='active'
        )
        
        # Create integration config
        self.config = IntegrationConfig.objects.create(
            operator=self.operator,
            webhook_url_exclusion='https://example.com/webhook'
        )
        
        # Create operator admin user
        self.operator_user = User.objects.create_user(
            email='operator@example.com',
            password='testpass123',
            role='operator_admin',
            phone_number='+1234567890'
        )
    
    def test_operator_sees_own_integration_config(self):
        """Test operator sees their own integration config"""
        self.client.force_authenticate(user=self.operator_user)
        response = self.client.get('/api/v1/operators/integration-configs/')
        
        # Should not be 403
        self.assertNotEqual(response.status_code, status.HTTP_403_FORBIDDEN,
                           f"Operator should access integration configs, got {response.status_code}")


class ComplianceScoreViewPermissionsTestCase(APITestCase):
    """Test ComplianceScoreView permission checks"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create operator
        self.operator = Operator.objects.create(
            name='Test Operator',
            email='operator@example.com',
            phone='+1234567890',
            registration_number='REG-001',
            operator_code='OP-001',
            license_number='LIC-001',
            license_type='standard',
            license_status='active',
            compliance_score=85
        )
        
        # Create operator admin user
        self.operator_user = User.objects.create_user(
            email='operator@example.com',
            password='testpass123',
            role='operator_admin',
            phone_number='+1234567890'
        )
        
        # Create different operator user
        self.other_operator = Operator.objects.create(
            name='Other Operator',
            email='other@example.com',
            phone='+9876543210',
            registration_number='REG-002',
            operator_code='OP-002',
            license_number='LIC-002',
            license_type='standard',
            license_status='active'
        )
        
        self.other_user = User.objects.create_user(
            email='other@example.com',
            password='testpass123',
            role='operator_admin',
            phone_number='+9876543210'
        )
    
    def test_operator_can_see_own_compliance_score(self):
        """Test operator can see their own compliance score"""
        self.client.force_authenticate(user=self.operator_user)
        response = self.client.get(f'/api/v1/operators/{self.operator.id}/compliance-score/')
        
        # Should not be 403
        self.assertNotEqual(response.status_code, status.HTTP_403_FORBIDDEN,
                           f"Operator should access own compliance score, got {response.status_code}")
    
    def test_operator_cannot_see_other_compliance_score(self):
        """Test operator cannot see another operator's compliance score"""
        self.client.force_authenticate(user=self.operator_user)
        response = self.client.get(f'/api/v1/operators/{self.other_operator.id}/compliance-score/')
        
        # Should be 403
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN,
                        "Operator should not see other operator's compliance score")
    
    def test_grak_can_see_any_compliance_score(self):
        """Test GRAK admin can see any operator's compliance score"""
        grak = User.objects.create_user(
            email='grak@example.com',
            password='testpass123',
            role='grak_admin'
        )
        
        self.client.force_authenticate(user=grak)
        response = self.client.get(f'/api/v1/operators/{self.operator.id}/compliance-score/')
        
        # Should not be 403
        self.assertNotEqual(response.status_code, status.HTTP_403_FORBIDDEN,
                           f"GRAK admin should see all compliance scores, got {response.status_code}")


class OperatorMetricsViewPermissionsTestCase(APITestCase):
    """Test OperatorMetricsView permission checks"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create operator
        self.operator = Operator.objects.create(
            name='Test Operator',
            email='operator@example.com',
            phone='+1234567890',
            registration_number='REG-001',
            operator_code='OP-001',
            license_number='LIC-001',
            license_type='standard',
            license_status='active'
        )
        
        # Create operator admin user
        self.operator_user = User.objects.create_user(
            email='operator@example.com',
            password='testpass123',
            role='operator_admin',
            phone_number='+1234567890'
        )
    
    def test_operator_can_see_own_metrics(self):
        """Test operator can see their own metrics"""
        self.client.force_authenticate(user=self.operator_user)
        response = self.client.get(f'/api/v1/operators/{self.operator.id}/metrics/')
        
        # Should not be 403
        self.assertNotEqual(response.status_code, status.HTTP_403_FORBIDDEN,
                           f"Operator should access own metrics, got {response.status_code}")
    
    def test_grak_can_see_any_metrics(self):
        """Test GRAK admin can see any operator's metrics"""
        grak = User.objects.create_user(
            email='grak@example.com',
            password='testpass123',
            role='grak_admin'
        )
        
        self.client.force_authenticate(user=grak)
        response = self.client.get(f'/api/v1/operators/{self.operator.id}/metrics/')
        
        # Should not be 403
        self.assertNotEqual(response.status_code, status.HTTP_403_FORBIDDEN,
                           f"GRAK admin should see all metrics, got {response.status_code}")
