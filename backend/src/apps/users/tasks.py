"""
User Tasks
Async tasks for user operations
"""
import random
import os
from datetime import datetime
from django.conf import settings


def generate_verification_code():
    """Generate 6-digit verification code"""
    return str(random.randint(100000, 999999))


def save_verification_code_to_file(user_id, phone_number, code, verification_type='phone'):
    """Save verification code to file for development"""
    codes_dir = os.path.join(settings.BASE_DIR.parent, 'verification_codes')
    os.makedirs(codes_dir, exist_ok=True)
    
    filename = os.path.join(codes_dir, f'{verification_type}_codes.txt')
    
    with open(filename, 'a') as f:
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        f.write(f"{timestamp} | User: {user_id} | Phone: {phone_number} | Code: {code}\n")
    
    return code


def send_verification_code(user_id, verification_type='phone'):
    """Send verification code (saves to file in development)"""
    from .models import User, IdentityVerification
    from django.utils import timezone
    from datetime import timedelta
    
    try:
        user = User.objects.get(id=user_id)
        code = generate_verification_code()
        
        # Create or update verification record
        verification, created = IdentityVerification.objects.get_or_create(
            user=user,
            verification_type=verification_type,
            status='pending',
            defaults={
                'verification_code': code,
                'code_expires_at': timezone.now() + timedelta(minutes=10),
                'attempts': 0,
                'max_attempts': 3
            }
        )
        
        if not created:
            verification.verification_code = code
            verification.code_expires_at = timezone.now() + timedelta(minutes=10)
            verification.attempts = 0
            verification.save()
        
        # Save to file for development
        save_verification_code_to_file(
            user_id=str(user.id),
            phone_number=str(user.phone_number),
            code=code,
            verification_type=verification_type
        )
        
        print(f"Verification code for {user.phone_number}: {code}")
        return True
        
    except Exception as e:
        print(f"Error sending verification code: {e}")
        return False


def send_2fa_code(user_id, method='sms'):
    """Send 2FA code"""
    return send_verification_code(user_id, verification_type=f'2fa_{method}')


def track_user_device(user_id, device_id, device_name, ip_address, user_agent):
    """Track user device"""
    from .models import User, UserDevice
    from django.utils import timezone
    
    try:
        user = User.objects.get(id=user_id)
        
        device, created = UserDevice.objects.get_or_create(
            user=user,
            device_id=device_id,
            defaults={
                'device_name': device_name,
                'last_ip_address': ip_address,
                'last_seen_at': timezone.now()
            }
        )
        
        if not created:
            device.last_seen_at = timezone.now()
            device.last_ip_address = ip_address
            device.login_count += 1
            device.save()
        
        return True
    except Exception as e:
        print(f"Error tracking device: {e}")
        return False
