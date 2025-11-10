# NSER Operator Portal
**Real-time Exclusion Lookup Portal for Licensed Gambling Operators**

## 🌐 Deployment

**Production URL:** https://operator.bematore.com  
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
NEXT_PUBLIC_SITE_URL=http://localhost:3002
NEXT_PUBLIC_PORTAL_TYPE=operator
NEXT_PUBLIC_APP_NAME=NSER Operator Portal
```

### Production (`.env.production`)
```env
NEXT_PUBLIC_API_URL=https://api.bematore.com/api/v1
NEXT_PUBLIC_SITE_URL=https://operator.bematore.com
NEXT_PUBLIC_PORTAL_TYPE=operator
NEXT_PUBLIC_APP_NAME=NSER Operator Portal
```

## ✨ Features

- ✅ **Real-time Exclusion Lookup** (<50ms response time)
- ✅ **BST Token Validation** (<20ms response time)
- ✅ **API Key Management** - Secure key generation and rotation
- ✅ **Integration Simulator** - Test before going live
- ✅ **Compliance Dashboard** - Track compliance metrics
- ✅ **Statistics & Analytics** - Real-time operator statistics
- ✅ **Webhook Configuration** - Exclusion notifications
- ✅ **Transaction Logs** - Complete audit trail

## 🔧 Local Development

```bash
npm install
npm run dev
# Open http://localhost:3002
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
5. Add custom domain: `operator.bematore.com`

## Operator Registration

1. Register your gambling operator license
2. Get API keys for integration
3. Test integration using simulator
4. Go live with real-time exclusion checks

## API Integration

See `/docs/integration` for complete API integration guide.

## 📦 Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Query
- Zustand

## 🔐 Security

- API key authentication
- Rate limiting
- Audit logging
- HTTPS enforcement

## 📞 Support

Contact GRAK support for operator onboarding assistance.

## License

Proprietary - Bematore Technologies 2025
