"""
Operators Signals
Auto-create user accounts for operators
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Operator

User = get_user_model()


@receiver(post_save, sender=Operator)
def create_operator_user(sender, instance, created, **kwargs):
    """
    Automatically create a user account for operator with operator_admin role
    """
    if created:
        # Get password from instance if available
        password = getattr(instance, '_temp_password', None)
        
        # Check if user already exists with this phone number
        user, user_created = User.objects.get_or_create(
            phone_number=instance.phone,
            defaults={
                'email': instance.email,
                'role': 'operator_admin',
                'is_active': True,
                'is_phone_verified': False,
                'is_email_verified': False,
                'is_id_verified': False,
                'first_name': instance.name.split()[0] if instance.name else '',
                'last_name': ' '.join(instance.name.split()[1:]) if len(instance.name.split()) > 1 else '',
            }
        )
        
        if user_created:
            # Set password from registration form if provided
            if password:
                user.set_password(password)
                user.save()
                print(f"Created operator user: {user.email} with password set (role: {user.role})")
            else:
                # Fallback: generate a temporary password if not provided
                import secrets
                temp_password = secrets.token_urlsafe(16)
                user.set_password(temp_password)
                user.save()
                print(f"Created operator user: {user.email} with temp password (role: {user.role})")
        else:
            # Update existing user to operator_admin role if not already set
            if user.role != 'operator_admin':
                user.role = 'operator_admin'
                user.save()
                print(f"Updated user {user.email} to operator_admin role")
            # If password is provided for existing user, update it
            elif password:
                user.set_password(password)
                user.save()
                print(f"Updated password for operator user: {user.email}")
