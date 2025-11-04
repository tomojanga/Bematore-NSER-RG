"""
Authentication Models
OAuth2, JWT tokens, API keys, and session management
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
import secrets

from apps.core.models import BaseModel, TimeStampedModel, UUIDModel


class OAuthApplication(BaseModel):
    """OAuth2 client applications"""
    name = models.CharField(max_length=255)
    client_id = models.CharField(max_length=100, unique=True, db_index=True)
    client_secret = models.CharField(max_length=255)
    redirect_uris = models.TextField(help_text=_('One per line'))
    allowed_scopes = models.TextField(help_text=_('Space separated'))
    is_confidential = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True, db_index=True)
    
    class Meta:
        db_table = 'auth_oauth_applications'
    
    def save(self, *args, **kwargs):
        if not self.client_id:
            self.client_id = secrets.token_urlsafe(32)
        if not self.client_secret:
            self.client_secret = secrets.token_urlsafe(48)
        super().save(*args, **kwargs)


class RefreshToken(BaseModel):
    """JWT Refresh tokens"""
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='refresh_tokens')
    token = models.CharField(max_length=500, unique=True, db_index=True)
    expires_at = models.DateTimeField(db_index=True)
    is_revoked = models.BooleanField(default=False, db_index=True)
    device_info = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'auth_refresh_tokens'
        ordering = ['-created_at']
        indexes = [models.Index(fields=['user', 'is_revoked'], name='refresh_user_revoked_idx')]


class PasswordResetToken(TimeStampedModel, UUIDModel):
    """Password reset tokens"""
    user = models.ForeignKey('users.User', on_delete=models.CASCADE)
    token = models.CharField(max_length=100, unique=True, db_index=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'auth_password_reset_tokens'


class TwoFactorAuth(BaseModel):
    """2FA settings per user"""
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, primary_key=True)
    method = models.CharField(max_length=20, choices=[
        ('totp', 'TOTP App'),
        ('sms', 'SMS'),
        ('email', 'Email')
    ])
    secret = models.CharField(max_length=255)
    is_enabled = models.BooleanField(default=False)
    backup_codes = models.JSONField(default=list)
    
    class Meta:
        db_table = 'auth_two_factor'

