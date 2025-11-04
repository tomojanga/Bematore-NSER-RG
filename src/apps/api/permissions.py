"""
Custom API Permissions
Role-based access control for NSER-RG system
"""
from rest_framework import permissions


class IsGRAKAdmin(permissions.BasePermission):
    """Permission for GRAK administrators only"""
    message = "You must be a GRAK administrator to perform this action."
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'grak_admin'
        )


class IsGRAKStaff(permissions.BasePermission):
    """Permission for GRAK staff (admin or officer)"""
    message = "You must be GRAK staff to perform this action."
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ['grak_admin', 'grak_officer']
        )


class IsOperator(permissions.BasePermission):
    """Permission for operators only"""
    message = "You must be an operator to perform this action."
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'operator_admin'
        )


class IsCitizen(permissions.BasePermission):
    """Permission for citizens only"""
    message = "This action is only available to citizens."
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'citizen'
        )


class IsOwnerOrGRAKStaff(permissions.BasePermission):
    """Permission for resource owner or GRAK staff"""
    message = "You must be the owner of this resource or GRAK staff."
    
    def has_object_permission(self, request, view, obj):
        # GRAK staff can access all
        if request.user.role in ['grak_admin', 'grak_officer']:
            return True
        
        # Check if user is the owner
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False


class HasValidAPIKey(permissions.BasePermission):
    """Permission for valid operator API key"""
    message = "Valid API key required."
    
    def has_permission(self, request, view):
        api_key = request.headers.get('X-API-Key')
        
        if not api_key:
            return False
        
        # Validate API key (will be implemented in view)
        from apps.operators.models import APIKey
        
        try:
            key = APIKey.objects.select_related('operator').get(
                api_key=api_key,
                is_active=True
            )
            
            # Check expiry
            if key.expires_at and key.expires_at < timezone.now():
                return False
            
            # Attach to request
            request.api_key = key
            request.operator = key.operator
            
            return True
            
        except APIKey.DoesNotExist:
            return False


class CanLookupExclusion(permissions.BasePermission):
    """Permission to lookup exclusions"""
    message = "You don't have permission to lookup exclusions."
    
    def has_permission(self, request, view):
        # Operators with API key and lookup scope
        if hasattr(request, 'api_key'):
            return request.api_key.can_lookup
        
        # GRAK staff
        if request.user and request.user.is_authenticated:
            return request.user.role in ['grak_admin', 'grak_officer']
        
        return False


class CanRegisterUser(permissions.BasePermission):
    """Permission to register users"""
    message = "You don't have permission to register users."
    
    def has_permission(self, request, view):
        # Operators with API key and register scope
        if hasattr(request, 'api_key'):
            return request.api_key.can_register
        
        # GRAK staff
        if request.user and request.user.is_authenticated:
            return request.user.role in ['grak_admin', 'grak_officer']
        
        return False


class CanScreenUser(permissions.BasePermission):
    """Permission to screen users"""
    message = "You don't have permission to screen users."
    
    def has_permission(self, request, view):
        # Operators with API key and screen scope
        if hasattr(request, 'api_key'):
            return request.api_key.can_screen
        
        # GRAK staff
        if request.user and request.user.is_authenticated:
            return request.user.role in ['grak_admin', 'grak_officer']
        
        # Users can screen themselves
        if request.user and request.user.is_authenticated and request.user.role == 'citizen':
            return True
        
        return False


class IsVerified(permissions.BasePermission):
    """Permission for verified users only"""
    message = "You must verify your account to perform this action."
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_verified
        )


class ReadOnly(permissions.BasePermission):
    """Read-only permission"""
    
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS
