# Admin Import Errors - Issue Report

## Critical Issue: Missing Models in Admin Files

### 1. **CORE APP ADMIN** ❌
**File:** `apps/core/admin.py` (Line 9)

**Error:** Trying to import models that don't exist in `apps/core/models.py`

```python
from .models import SystemConfig, APIRateLimit, AuditLog, SystemLog, WebhookConfig
```

**Missing Models:**
- `SystemConfig` ❌
- `APIRateLimit` ❌
- `AuditLog` ❌ (Actually defined in `compliance.models`)
- `SystemLog` ❌
- `WebhookConfig` ❌

**Current core/models.py contains:**
- Abstract base classes (TimeStampedModel, UUIDModel, etc.)
- Choice definitions only
- No concrete models

**Admin Registrations expecting these models:**
- `@admin.register(SystemConfig)` - Line 12
- `@admin.register(APIRateLimit)` - Line 46
- `@admin.register(SystemLog)` - Line 81
- `@admin.register(WebhookConfig)` - Line 127

---

### 2. **COMPLIANCE APP ADMIN** ❌
**File:** `apps/compliance/admin.py` (Line 11)

**Error:** Trying to register `ComplianceCheck` without importing it

```python
@admin.register(ComplianceCheck)  # Not imported!
class ComplianceCheckAdmin(admin.ModelAdmin):
```

**Status:** ✓ Model exists in `compliance.models.py` but not imported

**Additional Issues:**
- `AuditLog` is registered (line 93) but exists in `compliance.models.py` ✓
- `DataRetentionPolicy` is registered (line 142) and exists ✓
- `IncidentReport` is registered (line 176) and exists ✓
- `RegulatoryReport` is registered (line 275) and exists ✓

---

### 3. **AUTHENTICATION APP ADMIN** ⚠️
**File:** `apps/authentication/admin.py`

**Status:** All imports present - NO ERRORS FOUND

**Imported models:**
- `OAuthApplication` ✓
- `RefreshToken` ✓
- `TwoFactorAuth` ✓
- `DeviceTrust` ❌ (Not in models.py - only TwoFactorAuth exists)
- `TokenBlacklist` ❌ (Not in models.py)

**Missing from models.py:**
- Line 194: `@admin.register(DeviceTrust)` - class doesn't exist
- Line 224: `@admin.register(TokenBlacklist)` - class doesn't exist

---

## Summary of Issues

| App | Issue | Severity | Fix |
|-----|-------|----------|-----|
| **core** | 5 missing models | 🔴 Critical | Create models or remove admin.py |
| **compliance** | ComplianceCheck not imported | 🟡 High | Add to imports |
| **authentication** | DeviceTrust, TokenBlacklist missing | 🔴 Critical | Create models or remove registrations |

## Recommended Actions

### Option A: Create Missing Models
1. Add `SystemConfig`, `APIRateLimit`, `SystemLog`, `WebhookConfig` to `core/models.py` or new file
2. Add `DeviceTrust`, `TokenBlacklist` to `authentication/models.py`

### Option B: Fix Imports
1. Remove missing models from admin registrations
2. Move `AuditLog` admin registration from core to compliance (already in compliance.py)

### Option C: Reorganize
1. Move system configuration models to dedicated app
2. Consolidate auth models properly

---

## Files Needing Fixes

1. **backend/src/apps/core/admin.py** - Lines 9, 12, 46, 81, 127
2. **backend/src/apps/compliance/admin.py** - Line 11 (add import)
3. **backend/src/apps/authentication/admin.py** - Lines 194, 224 (remove or add models)
4. **backend/src/apps/authentication/models.py** - Add missing models
5. **backend/src/apps/core/models.py** - Add system config models OR create new app
