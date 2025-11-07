# NSER & RG Frontend - Complete Implementation Guide

## 🚀 Quick Start

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000`

## 📁 Complete File Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth group
│   │   │   ├── login/
│   │   │   │   └── page.tsx          # Login page
│   │   │   └── layout.tsx            # Auth layout
│   │   ├── (dashboard)/              # Dashboard group
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # Main dashboard
│   │   │   ├── users/
│   │   │   │   ├── page.tsx          # Users list
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx      # User detail
│   │   │   │   └── new/
│   │   │   │       └── page.tsx      # Create user
│   │   │   ├── exclusions/
│   │   │   │   ├── page.tsx          # Exclusions list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Exclusion detail
│   │   │   ├── operators/
│   │   │   │   ├── page.tsx          # Operators list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Operator detail
│   │   │   ├── assessments/
│   │   │   │   ├── page.tsx          # Assessments list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Assessment detail
│   │   │   ├── compliance/
│   │   │   │   ├── page.tsx          # Compliance dashboard
│   │   │   │   ├── audit-logs/
│   │   │   │   │   └── page.tsx      # Audit logs
│   │   │   │   └── reports/
│   │   │   │       └── page.tsx      # Reports
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx          # Analytics dashboard
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx          # Notifications center
│   │   │   ├── settings/
│   │   │   │   └── page.tsx          # System settings
│   │   │   └── layout.tsx            # Dashboard layout
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Home/redirect page
│   │
│   ├── components/                    # React components
│   │   ├── ui/                        # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ... (more UI components)
│   │   │
│   │   ├── layout/                    # Layout components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Breadcrumbs.tsx
│   │   │
│   │   ├── dashboard/                 # Dashboard components
│   │   │   ├── StatsCard.tsx
│   │   │   ├── RecentActivity.tsx
│   │   │   ├── ExclusionChart.tsx
│   │   │   └── QuickActions.tsx
│   │   │
│   │   ├── users/                     # User components
│   │   │   ├── UserTable.tsx
│   │   │   ├── UserForm.tsx
│   │   │   └── UserProfile.tsx
│   │   │
│   │   ├── exclusions/                # Exclusion components
│   │   │   ├── ExclusionTable.tsx
│   │   │   ├── ExclusionForm.tsx
│   │   │   ├── ExclusionTimeline.tsx
│   │   │   └── TerminateDialog.tsx
│   │   │
│   │   ├── operators/                 # Operator components
│   │   │   ├── OperatorTable.tsx
│   │   │   ├── OperatorForm.tsx
│   │   │   └── ComplianceScore.tsx
│   │   │
│   │   ├── assessments/               # Assessment components
│   │   │   ├── AssessmentForm.tsx
│   │   │   ├── PGSIForm.tsx
│   │   │   ├── LieBetForm.tsx
│   │   │   └── DSMForm.tsx
│   │   │
│   │   ├── charts/                    # Chart components
│   │   │   ├── LineChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   ├── PieChart.tsx
│   │   │   └── AreaChart.tsx
│   │   │
│   │   └── shared/                    # Shared components
│   │       ├── DataTable.tsx
│   │       ├── SearchBar.tsx
│   │       ├── Pagination.tsx
│   │       ├── StatusBadge.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── ErrorBoundary.tsx
│   │
│   ├── lib/                           # Utilities
│   │   ├── utils.ts                   # Helper functions
│   │   ├── api-client.ts              # Axios instance
│   │   ├── constants.ts               # App constants
│   │   └── validation.ts              # Zod schemas
│   │
│   ├── hooks/                         # Custom hooks
│   │   ├── useAuth.ts                 # Authentication hook
│   │   ├── useUsers.ts                # Users data hook
│   │   ├── useExclusions.ts           # Exclusions data hook
│   │   ├── useOperators.ts            # Operators data hook
│   │   ├── useAssessments.ts          # Assessments data hook
│   │   ├── useNotifications.ts        # Notifications hook
│   │   └── useWebSocket.ts            # WebSocket hook
│   │
│   ├── types/                         # TypeScript types
│   │   ├── index.ts                   # Export all types
│   │   ├── user.ts                    # User types
│   │   ├── exclusion.ts               # Exclusion types
│   │   ├── operator.ts                # Operator types
│   │   ├── assessment.ts              # Assessment types
│   │   ├── auth.ts                    # Auth types
│   │   └── api.ts                     # API response types
│   │
│   └── store/                         # Zustand stores
│       ├── authStore.ts               # Auth state
│       ├── userStore.ts               # User state
│       └── notificationStore.ts       # Notifications state
│
├── public/                            # Static files
│   ├── images/
│   ├── icons/
│   └── favicon.ico
│
└── Config files (already created)
```

## 🔑 Key Features to Implement

### 1. Authentication System
- JWT-based authentication
- Role-based access control (GRAK Admin, GRAK Officer, Operator, Citizen)
- Protected routes
- Token refresh logic
- Session management

### 2. Dashboard
- Real-time statistics cards
- Exclusion trends chart
- Recent activities feed
- Quick actions menu
- System health indicators

### 3. User Management
- CRUD operations
- Advanced filtering and search
- Role assignment
- Account status management
- Activity history

### 4. Self-Exclusion Management
- View all exclusions
- Create/approve/terminate exclusions
- Exclusion timeline visualization
- Propagation status tracking
- Extension requests handling

### 5. Operator Management
- License tracking
- Compliance scoring
- API key management
- Integration status
- Performance metrics

### 6. Risk Assessments
- PGSI questionnaire
- Lie/Bet assessment
- DSM-5 assessment
- Risk level calculation
- Historical tracking

### 7. Compliance & Audit
- Audit log viewer
- Regulatory reports
- Data export (CSV, Excel, PDF)
- Compliance dashboard
- Incident reporting

### 8. Analytics
- Advanced data visualization
- Custom date ranges
- Export capabilities
- Real-time updates
- Comparative analysis

### 9. Notifications
- Real-time notifications (WebSocket)
- Email/SMS/Push management
- Notification preferences
- Batch notifications
- Template management

### 10. System Monitoring
- API request logs
- Performance metrics
- Error tracking
- Health checks
- Alert management

## 🛠️ Implementation Steps

### Phase 1: Setup & Auth (Day 1-2)
1. Run `npm install`
2. Create API client with Axios
3. Implement authentication flow
4. Create login page
5. Setup protected routes
6. Implement auth store with Zustand

### Phase 2: Layout & Navigation (Day 2-3)
1. Create sidebar component
2. Create header with user menu
3. Implement breadcrumbs
4. Add footer
5. Setup responsive design

### Phase 3: Dashboard (Day 3-4)
1. Fetch dashboard statistics
2. Create stats cards
3. Implement charts with Recharts
4. Add recent activities
5. Create quick actions

### Phase 4: Core Features (Day 4-10)
1. Users module (CRUD + search/filter)
2. Exclusions module (full workflow)
3. Operators module (management + compliance)
4. Assessments module (forms + results)
5. Compliance module (logs + reports)

### Phase 5: Advanced Features (Day 10-14)
1. Analytics dashboard
2. Notifications system
3. System monitoring
4. Settings management
5. Profile management

### Phase 6: Polish & Testing (Day 14-15)
1. Error handling
2. Loading states
3. Form validation
4. Responsive design
5. Performance optimization

## 📝 Code Examples

### API Client Setup
```typescript
// src/lib/api-client.ts
import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 errors (token refresh)
    if (error.response?.status === 401) {
      // Implement token refresh logic
    }
    return Promise.reject(error)
  }
)

export default apiClient
```

### Auth Hook
```typescript
// src/hooks/useAuth.ts
import { useAuthStore } from '@/store/authStore'
import apiClient from '@/lib/api-client'

export function useAuth() {
  const { user, setUser, setTokens, logout } = useAuthStore()

  const login = async (phone: string, password: string) => {
    const { data } = await apiClient.post('/auth/login/', {
      phone_number: phone,
      password,
    })
    setUser(data.user)
    setTokens(data.access, data.refresh)
    return data
  }

  return { user, login, logout }
}
```

## 🎨 UI Component Examples

All UI components use shadcn/ui. Install components as needed:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
# ... etc
```

## 🔄 State Management

Use Zustand for global state:
- Auth state (user, tokens)
- Notification state
- Theme state

Use TanStack Query for server state:
- Users data
- Exclusions data
- Operators data
- All API calls

## 📊 Data Visualization

Use Recharts for all charts:
- Line charts for trends
- Bar charts for comparisons
- Pie charts for distributions
- Area charts for cumulative data

## 🚦 Next Steps

1. **Install dependencies**: `npm install`
2. **Start development**: `npm run dev`
3. **Access the app**: `http://localhost:3000`
4. **Check the backend**: Ensure Django is running on `http://127.0.0.1:8000`
5. **Test authentication**: Login with your credentials
6. **Start implementing**: Follow the phases above

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Recharts](https://recharts.org/en-US/)

## 🤝 Support

For issues or questions, refer to the main project documentation or contact the development team.

---

**Note**: The lint errors you're seeing are expected until you run `npm install`. Once dependencies are installed, TypeScript and CSS will work correctly.
