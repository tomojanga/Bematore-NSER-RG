# NSER Citizen Portal
**Self-Exclusion Registration Portal for Kenyan Citizens**

## 🌐 Deployment

**Production URL:** https://citizen.bematore.com  
**Platform:** Netlify  
**Backend API:** https://api.bematore.com ✅ LIVE  
**Status:** ✅ Configured & Ready to Deploy

## 🚀 Quick Deploy

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Netlify
netlify login
netlify deploy --prod
```

## 📝 Environment Variables

### Local Development (`.env.local`)
```env
NEXT_PUBLIC_API_URL=https://api.bematore.com/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3001
NEXT_PUBLIC_PORTAL_TYPE=citizen
```

### Production (`.env.production`)
```env
NEXT_PUBLIC_API_URL=https://api.bematore.com/api/v1
NEXT_PUBLIC_SITE_URL=https://citizen.bematore.com
NEXT_PUBLIC_PORTAL_TYPE=citizen
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## ✨ Features

- ✅ Self-exclusion registration (6mo, 1yr, 3yr, 5yr, permanent)
- ✅ Risk assessments (Lie/Bet, PGSI, DSM-5)
- ✅ Exclusion history and status
- ✅ Account settings and profile
- ✅ Real-time dashboard
- ✅ Phone and ID verification
- ✅ Support resources

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- React Query
- Zustand

## Project Structure

```
src/
├── app/
│   ├── auth/          # Authentication pages
│   ├── dashboard/     # Main dashboard
│   ├── self-exclude/  # Self-exclusion registration
│   ├── history/       # Exclusion history
│   └── settings/      # Account settings
├── components/        # Reusable components
├── hooks/            # React hooks
├── lib/              # Utilities
├── store/            # State management
└── types/            # TypeScript types
```

## 🏗️ Build & Deployment

### Build Locally
```bash
npm run build
npm start
```

### Deploy to Netlify

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

4. **Configure Environment:**
   - Add all variables from `.env.production` in Netlify dashboard
   - Site settings → Environment variables

5. **Add Custom Domain (Optional):**
   - Domain settings → Add `citizen.bematore.com`
   - Update DNS with CNAME record

## 📦 Netlify Configuration

The `netlify.toml` file configures:
- Build command: `npm run build`
- Publish directory: `.next`
- Node.js version: 18
- Security headers
- Next.js plugin

## 🔧 Local Development

```bash
npm install
npm run dev
# Open http://localhost:3001
```

## License

Proprietary - Bematore Technologies 2025
