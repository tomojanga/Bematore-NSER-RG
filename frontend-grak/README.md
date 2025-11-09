# GRAK Admin Portal - NSER

Gambling Regulatory Authority of Kenya - Admin Portal for NSER System

## Features

### ✅ Implemented
- **Dashboard** - Overview with key metrics
- **Operators Management** - Approve, suspend, view operators
- **Exclusions Management** - View and terminate exclusions
- **Analytics** - System performance and insights
- **Role-Based Access** - GRAK admin/officer only

### 🔐 Authentication
- Login with phone number and password
- Role validation (grak_admin, grak_officer only)
- JWT token authentication

### 📊 Operator Management
- View all operators with filtering (all/pending/active)
- Approve pending operators
- Suspend active operators
- View operator details

### 🛡️ Exclusion Management
- View all self-exclusion records
- Terminate active exclusions
- View exclusion details and status

### 📈 Analytics
- Real-time statistics
- Operator distribution
- System performance metrics
- Compliance tracking

## Setup

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

## Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
```

## Access

- **URL**: http://localhost:3002
- **Login**: Use GRAK admin credentials
- **Roles**: grak_admin, grak_officer

## Pages

- `/` - Redirect to dashboard or login
- `/auth/login` - Login page
- `/dashboard` - Main dashboard
- `/dashboard/operators` - Operators management
- `/dashboard/exclusions` - Exclusions management
- `/dashboard/analytics` - Analytics and reports

## API Integration

All API calls use centralized axios instance with:
- Automatic JWT token injection
- 401 redirect to login
- Error handling

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Development

Port: 3002 (to avoid conflicts with operator portal on 3001)

## Security

- Role-based access control
- JWT authentication
- Protected routes
- Secure API communication
