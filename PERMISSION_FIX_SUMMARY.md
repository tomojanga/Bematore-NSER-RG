# Permission Fix & API Integration Summary

## Issues Fixed

### 1. **403 Forbidden Errors**
- **Problem**: Endpoints returning 403 due to strict permission classes
- **Solution**: 
  - Updated `MyOperatorView` to use `IsAuthenticated` only with role check in method
  - Updated `ExclusionStatisticsView` to use `IsAuthenticated` only with role check in method
  - Updated `APIKeyViewSet` to handle missing role attribute gracefully

### 2. **Operator Registration Flow**
- **Problem**: No automatic user account creation for operators
- **Solution**:
  - Created `signals.py` to auto-create user accounts with `operator_admin` role
  - Created `views_public.py` with public registration endpoint
  - Updated `apps.py` to register signals
  - Added `/operators/public/register/` endpoint for self-registration

### 3. **Permission Classes Enhanced**
- **File**: `src/apps/api/permissions.py`
- **Changes**:
  - Added timezone import
  - Enhanced `CanLookupExclusion` to check API key in headers directly

## New Files Created

### Backend

1. **`src/apps/operators/signals.py`**
   - Auto-creates user account when operator registers
   - Assigns `operator_admin` role automatically
   - Generates temporary password

2. **`src/apps/operators/views_public.py`**
   - Public operator self-registration endpoint
   - No authentication required
   - Creates operator with pending status

3. **`fix_permissions.py`** (root)
   - Script to fix permission issues in views
   - Can be run again if needed

### Frontend

1. **`frontend-operator/src/lib/api-service.ts`**
   - Centralized API service with all endpoints
   - Organized by module (auth, operator, nser, etc.)
   - Type-safe with TypeScript

2. **`frontend-operator/src/types/api.ts`**
   - Complete TypeScript type definitions
   - Covers all API responses and requests
   - Form data types included

## API Endpoints Summary

### Operator Endpoints
```
POST   /api/v1/operators/public/register/  - Public registration
GET    /api/v1/operators/me/               - Get current operator
GET    /api/v1/operators/                  - List all operators
GET    /api/v1/operators/{id}/             - Get operator details
GET    /api/v1/operators/statistics/       - Get statistics
```

### API Key Endpoints
```
GET    /api/v1/operators/api-keys/                    - List API keys
POST   /api/v1/operators/{id}/api-keys/generate/      - Generate new key
POST   /api/v1/operators/api-keys/{id}/rotate/        - Rotate key
POST   /api/v1/operators/api-keys/{id}/revoke/        - Revoke key
```

### NSER Endpoints
```
GET    /api/v1/nser/statistics/           - Get exclusion statistics
POST   /api/v1/nser/lookup/               - Lookup exclusion
POST   /api/v1/nser/register/             - Register exclusion
GET    /api/v1/nser/exclusions/           - List exclusions
```

## Usage in Frontend

### Import API Service
```typescript
import apiService from '@/lib/api-service'
import type { Operator, APIKey } from '@/types/api'
```

### Example Usage
```typescript
// Get current operator
const response = await apiService.operator.getMe()
const operator: Operator = response.data.data

// Generate API key
await apiService.apiKey.generate(operatorId, {
  key_name: 'Production Key',
  can_lookup: true,
  expires_in_days: 365
})

// Lookup exclusion
const result = await apiService.nser.lookup({
  phone_number: '+254712345678',
  operator_id: operatorId
})
```

## Testing

### Test Operator Registration
```bash
curl -X POST http://localhost:8000/api/v1/operators/public/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Operator",
    "email": "test@operator.com",
    "phone": "+254712345678",
    "registration_number": "REG123",
    "terms_accepted": true
  }'
```

### Test Get Current Operator
```bash
curl -X GET http://localhost:8000/api/v1/operators/me/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Get Statistics
```bash
curl -X GET http://localhost:8000/api/v1/nser/statistics/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Next Steps

1. **Run Migrations** (if needed)
   ```bash
   python src/manage.py makemigrations
   python src/manage.py migrate
   ```

2. **Test Registration Flow**
   - Register operator via frontend
   - Check user account created with operator_admin role
   - Login with operator credentials

3. **Test API Integration**
   - Generate API keys
   - Test exclusion lookups
   - Verify statistics display

4. **Frontend Updates**
   - Update all pages to use `apiService`
   - Replace direct `api.get/post` calls
   - Add proper TypeScript types

## Files Modified

### Backend
- `src/apps/operators/views.py` - Fixed MyOperatorView permissions
- `src/apps/operators/apps.py` - Added signal registration
- `src/apps/operators/urls.py` - Added public registration endpoint
- `src/apps/nser/views.py` - Fixed ExclusionStatisticsView permissions
- `src/apps/api/permissions.py` - Enhanced CanLookupExclusion

### Frontend
- `frontend-operator/src/app/dashboard/page.tsx` - Updated to use apiService
- `frontend-operator/src/app/dashboard/api-keys/page.tsx` - Updated to use apiService

## Environment Variables

Ensure these are set in `.env`:
```
DJANGO_SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:pass@localhost:5432/nser_rg
REDIS_URL=redis://localhost:6379/0
```

Frontend `.env.local`:
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
```

## Troubleshooting

### 403 Forbidden
- Check user has correct role (operator_admin, grak_admin, grak_officer)
- Verify JWT token is valid
- Check permission classes in view

### User Not Created
- Verify signals are registered in apps.py
- Check operator email is unique
- Review Django logs for errors

### API Service Not Working
- Verify API base URL in environment
- Check token is stored in localStorage
- Verify CORS settings in Django
