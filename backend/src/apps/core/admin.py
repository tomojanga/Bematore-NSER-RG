"""
Core Admin Interface
Base configuration models and system-wide settings accessible to super admins only

NOTE: Core models are abstract base classes only. System configuration models
should be created in their respective apps or a dedicated config app.
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _

# No concrete models to register in Core app
# Core only contains abstract base classes
