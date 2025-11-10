# GRAK Admin Portal - NSER
**Gambling Regulatory Authority of Kenya - Admin Portal**

## 🌐 Deployment

**Production URL:** https://admin.bematore.com  
**Platform:** Netlify  
**Backend API:** https://api.bematore.com ✅ LIVE  
**Status:** ✅ Configured & Ready to Deploy

## 🚀 Quick Deploy

```bash
npm install
npm run build
netlify login
netlify deploy --prod
```

## 📝 Environment Variables

### Local Development (`.env.local`)
```env
NEXT_PUBLIC_API_URL=https://api.bematore.com/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3003
NEXT_PUBLIC_PORTAL_TYPE=grak
```

### Production (`.env.production`)
```env
NEXT_PUBLIC_API_URL=https://api.bematore.com/api/v1
NEXT_PUBLIC_SITE_URL=https://admin.bematore.com
NEXT_PUBLIC_PORTAL_TYPE=grak
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_2FA=true
```

## Features

### ✅ Complete Implementation
- **Dashboard** - Real-time statistics and system overview
- **Operators Management** - Approve, suspend, view all operators
- **Exclusions Management** - View and terminate self-exclusions
- **BST Token Management** - Bematore Screening Tokens for cross-operator tracking
- **Analytics** - System performance and insights
- **Role-Based Access** - GRAK admin/officer only

## BST (Bematore Screening Token)

Cryptographic token system for pseudonymized cross-operator user tracking:
- **Purpose**: Track users across operators without exposing PII
- **Performance**: <30ms generation, <20ms validation
- **Security**: SHA-512 hashing, zero collisions in 10M+ tokens
- **Format**: `BST-{VERSION}-{HASH}-{CHECKSUM}`

### BST Features in GRAK
- Real-time token validation
- Token rotation for security
- Compromise marking for fraud detection
- Cross-reference detection for duplicate accounts
- Fraud check capabilities

## 🔧 Local Development

```bash
npm install
npm run dev
# Open http://localhost:3003
```

## 🏗️ Build & Deploy

```bash
npm run build
npm start
```

### Deploy to Netlify
1. Install CLI: `npm install -g netlify-cli`
2. Login: `netlify login`
3. Deploy: `netlify deploy --prod`
4. Add environment variables in Netlify dashboard
5. Add custom domain: `admin.bematore.com`

## Login Credentials

```bash
# Create GRAK users first
python src/manage.py create_grak_admin
```

**GRAK Admin**
- Phone: `+254700000001`
- Password: `GRAKAdmin@2024`

**GRAK Officer**
- Phone: `+254700000002`
- Password: `GRAKOfficer@2024`

## API Integration

Uses comprehensive API client with:
- Token refresh on 401
- Request/response interceptors
- Performance tracking
- Error handling

## Pages

- `/` - Redirect to dashboard or login
- `/auth/login` - Login page
- `/dashboard` - Main dashboard with statistics
- `/dashboard/operators` - Operators management (approve/suspend)
- `/dashboard/exclusions` - Self-exclusions management
- `/dashboard/bst` - BST token management
- `/dashboard/analytics` - Analytics and reports

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios

## 🔐 Security

- Role-based access control (grak_admin, grak_officer, grak_auditor, super_admin)
- JWT authentication with auto-refresh
- 2FA required for production
- Protected routes
- Secure API communication
- Audit logging
- Session management

## 📦 Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Lucide React
- Axios
- Recharts (analytics)

## License

Proprietary - Bematore Technologies 2025
