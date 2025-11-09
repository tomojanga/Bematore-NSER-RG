# NSER Citizen Portal

Self-Exclusion Registration Portal for Kenyan Citizens

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Access

- Development: http://localhost:3001
- Production: https://citizen.nser.grak.ke

## Features

- ✅ Self-exclusion registration (6mo, 1yr, 5yr, permanent)
- ✅ Risk assessments (Lie/Bet, PGSI, DSM-5)
- ✅ Exclusion history
- ✅ Account settings
- ✅ Dashboard

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3001
NEXT_PUBLIC_PORTAL_TYPE=citizen
```

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

## Deployment

### Docker

```bash
docker build -t nser-citizen .
docker run -p 3001:3000 nser-citizen
```

### Vercel

```bash
vercel --prod
```

## License

Proprietary - GRAK 2025
