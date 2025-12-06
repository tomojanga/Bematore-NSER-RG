# API Flow Analysis & Fixes

## Issue Found
Frontend-citizen is calling APIs before authentication is complete, causing unnecessary API calls and errors.

## Current Flow (frontend-citizen)
1. Page loads → useAuth() hook runs
2. useAuth triggers useQuery for `/users/me/` immediately
3. useQuery for `/users/me/devices/` and `/users/me/sessions/` also trigger
4. API calls fail with 401 because no token yet
5. User checks localStorage for token and redirects

## Better Flow (like frontend-regulator)
1. Page loads → Check localStorage for `access_token` synchronously
2. Only initialize useQuery if `isAuthenticated === true`
3. Skip all protected API calls until token exists
4. Once authenticated, then fetch profile and related data

## Fixes Applied

### 1. Update useAuth Hook (frontend-citizen)
- Add `enabled` flag to useQuery for profile/devices/sessions
- Only enable queries when `isAuthenticated` is true
- Move token check to early effect

### 2. Update api-client.ts
- Already has proper request/response interceptors
- Token fetching works correctly
- No changes needed here

### 3. Update Dashboard Layout
- Already checks `isLoadingProfile && !isAuthenticated`
- Properly redirects to login
- No changes needed

## Implementation Checklist
- [x] frontend-citizen: Add `enabled: isAuthenticated` to profile query
- [x] frontend-citizen: Add `enabled: isAuthenticated` to devices query  
- [x] frontend-citizen: Add `enabled: isAuthenticated` to sessions query
- [ ] Test that no 401 errors appear on initial load
- [ ] Verify API calls only after authentication
- [ ] Apply same pattern to frontend-grak if needed

## API Call Order
1. POST /auth/login/ (credentials)
2. Wait for tokens
3. GET /users/me/ (fetch profile)
4. GET /users/me/devices/ (optional)
5. GET /users/me/sessions/ (optional)
6. Other authenticated endpoints

## Storage Keys
- `access_token` - JWT token for auth
- `refresh_token` - Token refresh
- Custom per-role:
  - frontend-citizen: `access_token`, `refresh_token`
  - frontend-regulator: `grak_token`, `grak_refresh`
  - frontend-grak: Similar pattern
