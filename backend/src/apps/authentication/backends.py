"""
Custom Authentication Backend
Support for phone number and email authentication
"""
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from phonenumber_field.phonenumber import to_python

User = get_user_model()


class PhoneNumberBackend(ModelBackend):
    """
    Custom authentication backend that supports authentication with phone number.
    Falls back to email if phone authentication fails.
    """
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        """
        Authenticate using phone number or email as username
        """
        if not username or not password:
            return None
        
        # Try authenticating with phone number first
        try:
            # Normalize phone number
            phone = to_python(username)
            if phone:
                try:
                    user = User.objects.get(phone_number=phone)
                    if user.check_password(password) and self.user_can_authenticate(user):
                        return user
                except User.DoesNotExist:
                    pass
        except Exception:
            # If phone parsing fails, continue to email check
            pass
        
        # Fall back to email
        try:
            user = User.objects.get(email=username)
            if user.check_password(password) and self.user_can_authenticate(user):
                return user
        except User.DoesNotExist:
            pass
        
        # Finally, try the parent class method (in case USERNAME_FIELD is being used)
        return super().authenticate(request, username=username, password=password, **kwargs)
    
    def get_user(self, user_id):
        """Get user by ID"""
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
