"""
Comprehensive tests for account verification (email, phone) and login verification (2FA)
"""
import json
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from apps.users.models import IdentityVerification, UserDevice
from apps.authentication.models import TwoFactorAuth
from apps.users.tasks import send_verification_code
import pyotp

User = get_user_model()


class PhoneVerificationTestCase(APITestCase):
    """Test phone number verification during signup/account management"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            phone_number='+1234567890',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_send_phone_verification_code(self):
        """Test sending phone verification code"""
        response = self.client.post('/api/v1/users/send-verification-code/', {
            'type': 'phone'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        
        # Verify code was created
        verification = IdentityVerification.objects.filter(
            user=self.user,
            verification_type='phone'
        ).first()
        self.assertIsNotNone(verification)
        self.assertEqual(verification.status, 'pending')
        self.assertIsNotNone(verification.verification_code)
    
    def test_verify_phone_with_valid_code(self):
        """Test phone verification with valid code"""
        # Create verification record
        verification = IdentityVerification.objects.create(
            user=self.user,
            verification_type='phone',
            verification_code='123456',
            status='pending',
            code_expires_at=timezone.now() + timezone.timedelta(minutes=10),
            attempts=0
        )
        
        response = self.client.post('/api/v1/users/verify-phone/', {
            'verification_code': '123456'
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get('success'))
        
        # Verify user is marked as phone verified
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_phone_verified)
        
        # Verify record status updated
        verification.refresh_from_db()
        self.assertEqual(verification.status, 'verified')
        self.assertIsNotNone(verification.verified_at)
    
    def test_verify_phone_with_invalid_code(self):
        """Test phone verification with invalid code"""
        verification = IdentityVerification.objects.create(
            user=self.user,
            verification_type='phone',
            verification_code='123456',
            status='pending',
            code_expires_at=timezone.now() + timezone.timedelta(minutes=10),
            attempts=0,
            max_attempts=3
        )
        
        response = self.client.post('/api/v1/users/verify-phone/', {
            'verification_code': '999999'
        })
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Verify attempts incremented
        verification.refresh_from_db()
        self.assertEqual(verification.attempts, 1)
    
    def test_verify_phone_expired_code(self):
        """Test phone verification with expired code"""
        verification = IdentityVerification.objects.create(
            user=self.user,
            verification_type='phone',
            verification_code='123456',
            status='pending',
            code_expires_at=timezone.now() - timezone.timedelta(minutes=1),
            attempts=0
        )
        
        response = self.client.post('/api/v1/users/verify-phone/', {
            'verification_code': '123456'
        })
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('expired', response.data.get('error', {}).get('message', '').lower())
    
    def test_verify_phone_max_attempts(self):
        """Test phone verification max attempts exceeded"""
        verification = IdentityVerification.objects.create(
            user=self.user,
            verification_type='phone',
            verification_code='123456',
            status='pending',
            code_expires_at=timezone.now() + timezone.timedelta(minutes=10),
            attempts=3,
            max_attempts=3
        )
        
        response = self.client.post('/api/v1/users/verify-phone/', {
            'verification_code': '123456'
        })
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('attempt', response.data.get('error', {}).get('message', '').lower())


class EmailVerificationTestCase(APITestCase):
    """Test email verification during signup/account management"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            phone_number='+1234567890',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_send_email_verification_code(self):
        """Test sending email verification code"""
        response = self.client.post('/api/v1/users/send-verification-code/', {
            'type': 'email'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify code was created
        verification = IdentityVerification.objects.filter(
            user=self.user,
            verification_type='email'
        ).first()
        self.assertIsNotNone(verification)
        self.assertEqual(verification.status, 'pending')
    
    def test_verify_email_with_valid_code(self):
        """Test email verification with valid code"""
        verification = IdentityVerification.objects.create(
            user=self.user,
            verification_type='email',
            verification_code='654321',
            status='pending',
            code_expires_at=timezone.now() + timezone.timedelta(minutes=10),
            attempts=0
        )
        
        response = self.client.post('/api/v1/users/verify-email/', {
            'verification_code': '654321'
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get('success'))
        
        # Verify user is marked as email verified
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_email_verified)
    
    def test_verify_email_with_invalid_code(self):
        """Test email verification with invalid code"""
        verification = IdentityVerification.objects.create(
            user=self.user,
            verification_type='email',
            verification_code='654321',
            status='pending',
            code_expires_at=timezone.now() + timezone.timedelta(minutes=10),
            attempts=0,
            max_attempts=3
        )
        
        response = self.client.post('/api/v1/users/verify-email/', {
            'verification_code': '999999'
        })
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        verification.refresh_from_db()
        self.assertEqual(verification.attempts, 1)


class LoginWith2FATestCase(APITestCase):
    """Test login verification with 2FA (TOTP, SMS, Email)"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            phone_number='+1234567890',
            email='test@example.com',
            password='testpass123',
            is_phone_verified=True,
            is_email_verified=True
        )
    
    def test_login_without_2fa(self):
        """Test login without 2FA enabled"""
        response = self.client.post('/api/v1/auth/login/', {
            'phone_number': '+1234567890',
            'password': 'testpass123'
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data.get('data', {}))
        self.assertIn('refresh', response.data.get('data', {}))
    
    def test_enable_2fa_totp(self):
        """Test enabling 2FA with TOTP"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.post('/api/v1/auth/2fa/enable/', {
            'method': 'totp'
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('secret', response.data.get('data', {}))
        
        # Verify 2FA record created
        twofa = TwoFactorAuth.objects.filter(
            user=self.user,
            method='totp'
        ).first()
        self.assertIsNotNone(twofa)
        self.assertTrue(twofa.is_enabled)
        self.assertIsNotNone(twofa.secret)
    
    def test_enable_2fa_sms(self):
        """Test enabling 2FA with SMS"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.post('/api/v1/auth/2fa/enable/', {
            'method': 'sms'
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify 2FA record created
        twofa = TwoFactorAuth.objects.filter(
            user=self.user,
            method='sms'
        ).first()
        self.assertIsNotNone(twofa)
        self.assertTrue(twofa.is_enabled)
    
    def test_verify_2fa_totp(self):
        """Test verifying TOTP code during login"""
        # Create TOTP 2FA
        twofa = TwoFactorAuth.objects.create(
            user=self.user,
            method='totp',
            is_enabled=True,
            secret=pyotp.random_base32()
        )
        
        self.client.force_authenticate(user=self.user)
        
        # Generate valid TOTP code
        totp = pyotp.TOTP(twofa.secret)
        valid_code = totp.now()
        
        response = self.client.post('/api/v1/auth/2fa/verify/', {
            'verification_code': valid_code
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get('data', {}).get('verified'))
    
    def test_verify_2fa_invalid_code(self):
        """Test verifying invalid 2FA code"""
        twofa = TwoFactorAuth.objects.create(
            user=self.user,
            method='totp',
            is_enabled=True,
            secret=pyotp.random_base32()
        )
        
        self.client.force_authenticate(user=self.user)
        
        response = self.client.post('/api/v1/auth/2fa/verify/', {
            'verification_code': '000000'
        })
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data.get('success', True))
    
    def test_disable_2fa_with_password(self):
        """Test disabling 2FA"""
        twofa = TwoFactorAuth.objects.create(
            user=self.user,
            method='totp',
            is_enabled=True,
            secret=pyotp.random_base32()
        )
        
        self.client.force_authenticate(user=self.user)
        
        response = self.client.post('/api/v1/auth/2fa/disable/', {
            'password': 'testpass123'
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify 2FA disabled
        twofa.refresh_from_db()
        self.assertFalse(twofa.is_enabled)


class CompleteAccountVerificationFlowTestCase(APITestCase):
    """Test complete flow: register -> verify phone -> verify email -> login with 2FA"""
    
    def setUp(self):
        self.client = APIClient()
    
    def test_complete_verification_flow(self):
        """Test complete account verification and login flow"""
        
        # Step 1: Register user
        register_response = self.client.post('/api/v1/auth/register/', {
            'phone_number': '+1234567890',
            'email': 'newuser@example.com',
            'password': 'SecurePass123!'
        })
        
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
        user_id = register_response.data.get('data', {}).get('user', {}).get('id')
        self.assertIsNotNone(user_id)
        
        user = User.objects.get(id=user_id)
        self.client.force_authenticate(user=user)
        
        # Step 2: Send and verify phone code
        send_phone_response = self.client.post('/api/v1/users/send-verification-code/', {
            'type': 'phone'
        })
        self.assertEqual(send_phone_response.status_code, status.HTTP_200_OK)
        
        phone_verification = IdentityVerification.objects.get(
            user=user,
            verification_type='phone'
        )
        
        verify_phone_response = self.client.post('/api/v1/users/verify-phone/', {
            'verification_code': phone_verification.verification_code
        })
        self.assertEqual(verify_phone_response.status_code, status.HTTP_200_OK)
        
        # Step 3: Send and verify email code
        send_email_response = self.client.post('/api/v1/users/send-verification-code/', {
            'type': 'email'
        })
        self.assertEqual(send_email_response.status_code, status.HTTP_200_OK)
        
        email_verification = IdentityVerification.objects.get(
            user=user,
            verification_type='email'
        )
        
        verify_email_response = self.client.post('/api/v1/users/verify-email/', {
            'verification_code': email_verification.verification_code
        })
        self.assertEqual(verify_email_response.status_code, status.HTTP_200_OK)
        
        # Step 4: Enable 2FA
        enable_2fa_response = self.client.post('/api/v1/auth/2fa/enable/', {
            'method': 'totp'
        })
        self.assertEqual(enable_2fa_response.status_code, status.HTTP_200_OK)
        
        # Step 5: Logout and login again
        self.client.post('/api/v1/auth/logout/', {'refresh_token': ''})
        self.client.force_authenticate(user=None)
        
        login_response = self.client.post('/api/v1/auth/login/', {
            'phone_number': '+1234567890',
            'password': 'SecurePass123!'
        })
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        
        # Verify user is fully verified
        user.refresh_from_db()
        self.assertTrue(user.is_phone_verified)
        self.assertTrue(user.is_email_verified)


if __name__ == '__main__':
    import unittest
    unittest.main()
