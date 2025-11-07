# NSER & RG Admin Dashboard

Production-ready admin dashboard for the National Self-Exclusion Register & Responsible Gambling system.

## 🚀 Features

### GRAK Admin Dashboard
- **Dashboard Overview** - Real-time statistics, charts, and KPIs
- **User Management** - Complete CRUD for citizens, operators, and staff
- **Self-Exclusion Management** - View, approve, terminate exclusions
- **BST Token Management** - Generate, validate, and manage tokens
- **Operator Management** - License tracking, compliance monitoring
- **Risk Assessment** - PGSI, Lie/Bet, DSM-5 assessments
- **Compliance & Reporting** - Audit logs, regulatory reports
- **Analytics & Insights** - Advanced data visualization
- **Notifications** - Email, SMS, Push notifications
- **System Monitoring** - API logs, health checks, alerts

## 📋 Prerequisites

- Node.js 18+ and npm
- Django backend running on `http://127.0.0.1:8000`

## 🛠️ Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## 📦 Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## 🔧 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://127.0.0.1:8000/ws
```

## 🎨 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React + Heroicons

## 📱 Available Roles

1. **GRAK Admin** - Full system access
2. **GRAK Officer** - Compliance and monitoring
3. **Operator** - Operator-specific features
4. **Citizen** - Personal dashboard

## 🔐 Authentication

The app uses JWT authentication with role-based access control (RBAC).

## 📄 Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # Reusable components
│   ├── lib/              # Utilities and configs
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript types
│   └── api/              # API client and services
├── public/               # Static assets
└── config files
```

## 🧪 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 📚 Documentation

For detailed API documentation, visit: `http://127.0.0.1:8000/api/docs/`

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript strict mode
3. Follow the component patterns
4. Write meaningful commit messages

## 📝 License

Proprietary - BEMATORE Technologies
