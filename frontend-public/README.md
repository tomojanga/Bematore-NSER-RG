# NSER Public Portal
**National Self-Exclusion Register - Public Website**

## 🌐 Deployment

**Production URL:** https://nser.bematore.com  
**Platform:** Netlify  
**Framework:** Next.js 14 (App Router)  
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
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_PORTAL_TYPE=public
NEXT_PUBLIC_CITIZEN_URL=http://localhost:3001
NEXT_PUBLIC_OPERATOR_URL=http://localhost:3002
NEXT_PUBLIC_GRAK_URL=http://localhost:3003
```

### Production (`.env.production`)
```env
NEXT_PUBLIC_API_URL=https://api.bematore.com/api/v1
NEXT_PUBLIC_SITE_URL=https://nser.bematore.com
NEXT_PUBLIC_PORTAL_TYPE=public
NEXT_PUBLIC_CITIZEN_URL=https://citizen.bematore.com
NEXT_PUBLIC_OPERATOR_URL=https://operator.bematore.com
NEXT_PUBLIC_GRAK_URL=https://admin.bematore.com
```

## 📁 Project Structure

```
frontend-public/
├── src/
│   ├── app/              # Next.js 14 app router
│   │   ├── page.tsx      # Homepage
│   │   ├── about/        # About NSER
│   │   ├── contact/      # Contact information
│   │   ├── faq/          # Frequently asked questions
│   │   ├── resources/    # Support resources
│   │   └── self-exclude/ # Self-exclusion info
│   ├── components/       # Reusable components
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── data/
│       └── content.ts    # Static content & portal links
├── .env.local            # Local development config
├── .env.production       # Production config
├── .env.example          # Environment template
├── netlify.toml          # Netlify configuration
├── next.config.js        # Next.js configuration
└── package.json          # Dependencies
```

## 🎨 Features

- **Public Information:** About NSER, how it works
- **Self-Exclusion Guide:** Step-by-step exclusion process
- **Resources:** Helplines, counseling centers, support
- **FAQ:** Common questions and answers
- **Contact:** GRAK offices and contact information
- **Portal Links:** Navigate to Citizen/Operator portals
- **Responsive Design:** Mobile-first, fully responsive
- **SEO Optimized:** Meta tags, Open Graph, structured data

## 🔗 Portal Navigation

The header includes buttons to navigate to other portals:
- **Citizen Portal** → Login/register for self-exclusion
- **Operator Portal** → Licensed operators access

Portal URLs are environment-driven:
- **Local:** Links to `localhost:3001`, `localhost:3002`
- **Production:** Links to `citizen.bematore.com`, `operator.bematore.com`

## 📦 Netlify Configuration

The `netlify.toml` file configures:
- Build command: `npm run build`
- Publish directory: `.next`
- Node.js version: 18
- Security headers
- Cache optimization
- Next.js plugin

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
http://localhost:3000
```

## 🏗️ Build & Deploy

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

4. **Configure Environment Variables in Netlify Dashboard:**
   - Go to Site settings → Environment variables
   - Add all `NEXT_PUBLIC_*` variables from `.env.production`

5. **Add Custom Domain (Optional):**
   - Domain settings → Add custom domain
   - Enter: `nser.bematore.com`
   - Add DNS CNAME record at your provider

## 📊 Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Deployment:** Netlify
- **Backend API:** https://api.bematore.com

## 📝 Content Management

All content is managed in `src/data/content.ts`:
- Portal links
- About section data
- Self-exclusion information
- Resources and helplines
- FAQ content
- Contact information

Update this file to modify site content without touching components.

## 🔐 Security

- HTTPS enforced (Netlify SSL)
- Security headers configured
- XSS protection enabled
- Frame options set
- Content type sniffing disabled

## 📱 Responsive Design

Tested and optimized for:
- Desktop (1920px+)
- Laptop (1024px-1919px)
- Tablet (768px-1023px)
- Mobile (320px-767px)

## 🐛 Troubleshooting

### Build Fails
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Loading
- Ensure `.env.local` exists for local development
- For Netlify, add variables in dashboard
- Trigger new deployment after adding variables

### Portal Links Not Working
- Check environment variables are set correctly
- Verify other portals are deployed
- Clear browser cache

## 📞 Support

For deployment issues, check:
- Build logs in Netlify dashboard
- Browser console for errors
- Network tab for API calls
- [DEPLOYMENT_PLAN.md](../DEPLOYMENT_PLAN.md)

---

**Maintained by:** Bematore Technologies  
**Last Updated:** November 2025  
**Status:** Production Ready ✅
