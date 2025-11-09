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
        # Check if user already exists with this email
        user, user_created = User.objects.get_or_create(
            email=instance.email,
            defaults={
                'phone_number': instance.phone,
                'role': 'operator_admin',
                'is_active': True,
                'is_verified': False,
                'first_name': instance.name.split()[0] if instance.name else '',
                'last_name': ' '.join(instance.name.split()[1:]) if len(instance.name.split()) > 1 else '',
            }
        )
        
        if user_created:
            # Set a temporary password (operator should reset via email)
            import secrets
            temp_password = secrets.token_urlsafe(16)
            user.set_password(temp_password)
            user.save()
            
            # TODO: Send email with temporary password or password reset link
            print(f"Created operator user: {user.email} with role: {user.role}")
        else:
            # Update existing user to operator_admin role if not already set
            if user.role != 'operator_admin':
                user.role = 'operator_admin'
                user.save()
                print(f"Updated user {user.email} to operator_admin role")
