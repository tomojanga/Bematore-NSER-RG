# Operator Registration & Approval Flow - Complete

## ✅ Changes Made

### Backend

1. **Fixed MyOperatorView** (`src/apps/operators/views.py`)
   - Changed lookup from `contact_person_email` to `email`
   - Returns operator data even if pending approval

2. **Created Operator Signals** (`src/apps/operators/signals.py`)
   - Auto-creates user account when operator registers
   - Assigns `operator_admin` role automatically

3. **Public Registration Endpoint** (`src/apps/operators/views_public.py`)
   - `/api/v1/operators/public/register/` - No auth required
   - Creates operator with `pending` status

### Frontend

1. **Updated Register Page** (`frontend-operator/src/app/auth/register/page.tsx`)
   - Uses `apiService.operator.publicRegister()`
   - Redirects to pending approval page after registration

2. **Created Pending Approval Page** (`frontend-operator/src/app/auth/pending-approval/page.tsx`)
   - Shows pending status with auto-refresh every 30 seconds
   - Redirects to dashboard when approved
   - Shows rejection message if rejected

3. **Updated Login Page** (`frontend-operator/src/app/auth/login/page.tsx`)
   - Checks operator approval status after login
   - Redirects to pending approval if not approved
   - Redirects to dashboard if approved

4. **Updated Dashboard Layout** (`frontend-operator/src/app/dashboard/layout.tsx`)
   - Checks approval status on mount
   - Redirects to pending approval if not approved
   - Shows loading state during check

## 🔄 Complete Flow

### 1. Registration
```
User fills form → POST /operators/public/register/ → Operator created (pending)
                                                    ↓
                                    POST /auth/register/ → User created (operator_admin)
                                                    ↓
                                    Redirect to /auth/pending-approval
```

### 2. Pending Approval
```
User sees pending page → Auto-checks status every 30s → GET /operators/me/
                                                       ↓
                                    If pending: Stay on page
                                    If approved: Redirect to dashboard
                                    If rejected: Show rejection message
```

### 3. Login (Existing User)
```
User logs in → POST /auth/login/ → Token saved
                                  ↓
                    GET /operators/me/ → Check status
                                       ↓
                    If pending: Redirect to /auth/pending-approval
                    If approved: Redirect to /dashboard
```

### 4. Dashboard Access
```
User accesses dashboard → Layout checks GET /operators/me/
                                        ↓
                        If pending: Redirect to /auth/pending-approval
                        If approved: Show dashboard
```

## 🔐 Approval Process (GRAK Admin)

GRAK admin needs to:

1. **Activate Operator**
   ```bash
   POST /api/v1/operators/{id}/activate/
   ```

2. **Update License Status**
   ```python
   operator.license_status = 'active'
   operator.is_api_active = True
   operator.save()
   ```

## 🧪 Testing

### Test Registration
```bash
# Frontend: Go to /auth/register
# Fill form and submit
# Should redirect to /auth/pending-approval
```

### Test Pending Page
```bash
# Should show "Pending Approval" message
# Should auto-refresh every 30 seconds
# Should redirect to dashboard when approved
```

### Test Login with Pending Account
```bash
# Login with pending operator credentials
# Should redirect to /auth/pending-approval
```

### Test Dashboard Access
```bash
# Try to access /dashboard with pending account
# Should redirect to /auth/pending-approval
```

## 📝 Operator Model Fields

Key fields for approval flow:
- `license_status`: 'pending' | 'active' | 'rejected' | 'suspended'
- `is_api_active`: Boolean
- `integration_status`: 'pending' | 'completed'

## 🚀 Next Steps

1. **Create GRAK Admin Panel** to approve operators
2. **Add Email Notifications** when status changes
3. **Add Rejection Reason** field and display
4. **Add Document Upload** for license verification

## 🐛 Troubleshooting

### Still Getting 403 Errors
- Check user has `operator_admin` role
- Verify operator exists with matching email
- Check JWT token is valid

### Operator Not Found
- Verify operator was created via `/operators/public/register/`
- Check email matches between user and operator
- Review Django logs for errors

### Not Redirecting to Pending Page
- Clear browser cache and localStorage
- Check console for errors
- Verify API responses in Network tab
