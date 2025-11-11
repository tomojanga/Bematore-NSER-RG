# NSER-RG System Documentation

## System Overview

The NSER-RG (National Self-Exclusion Register - Responsible Gaming) system is built as a microservices-ready monolith with a clear separation of concerns. The system uses a modern tech stack:

### Backend Stack:
- Django (Python) for the API server
- PostgreSQL for primary database
- Redis for caching
- Elasticsearch for search functionality
- RabbitMQ for message queuing
- Celery for background tasks

### Frontend Stack:
- Next.js (React) with TypeScript
- Zustand for state management
- TanStack Query (React Query) for data fetching
- Tailwind CSS for styling

## Authentication Flow

### 1. Registration Flow
1. User submits registration data to `/api/v1/auth/register/`
2. Backend validates data and creates user account
3. User gets JWT token pair (access + refresh)
4. Frontend stores tokens and user data in Zustand store
5. User is redirected based on role:
- Regulator Admin → /portals/regulator
- Operator Admin → /portals/operator
- Citizen → /portals/citizen

### 2. Login Flow
1. User submits credentials to `/api/v1/auth/token/`
2. Backend validates and returns JWT tokens
3. Frontend stores tokens in localStorage and Zustand
4. Device tracking ID is generated for security
5. Role-based redirect is performed

### 3. Token Management
- Access Token: Short-lived (15 minutes)
- Refresh Token: Long-lived (7 days)
- Automatic token refresh using interceptors
- Token blacklisting support
- Device tracking for security

### 4. Security Features
1. Two-Factor Authentication:
   - TOTP (Authenticator apps)
   - SMS verification
   - Email verification
   
2. Device Management:
   - Device tracking
   - Suspicious activity detection
   - Device blocking capability

3. Session Management:
   - Multiple device support
   - Session termination
   - Force logout capability

## API Security

### 1. Rate Limiting
- 10,000 requests per second per IP
- Configurable per endpoint
- Burst allowance with token bucket algorithm

### 2. Authentication Methods
- JWT (Primary)
- OAuth2 (For third-party integrations)
- API Keys (For operator systems)

### 3. Transport Security
- TLS 1.3 required
- HSTS enabled
- Perfect Forward Secrecy
- Strong cipher suites only

## Role-Based Access Control

1. Super Admin
   - Full system access
   - User management
   - System configuration

2. Regulator Admin
   - Exclusion management
   - Operator oversight
   - Compliance monitoring

3. Operator Admin
   - Operator portal access
   - Player verification
   - Compliance reporting

4. Citizen
   - Self-exclusion management
   - Personal profile
   - History access

## API Endpoints

### Authentication Endpoints
```
POST /api/v1/auth/token/          # Get tokens
POST /api/v1/auth/token/refresh/  # Refresh token
POST /api/v1/auth/token/verify/   # Verify token
POST /api/v1/auth/login/          # User login
POST /api/v1/auth/logout/         # User logout
POST /api/v1/auth/register/       # User registration
```

### User Management
```
GET    /api/v1/users/me/          # Current user
PUT    /api/v1/users/{id}/        # Update user
POST   /api/v1/users/verify/      # Verify user
```

### 2FA Management
```
POST /api/v1/auth/2fa/enable/    # Enable 2FA
POST /api/v1/auth/2fa/verify/    # Verify 2FA
POST /api/v1/auth/2fa/disable/   # Disable 2FA
```

## Frontend Implementation

### State Management
```typescript
interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  setTokens: (access: string, refresh: string) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}
```

### API Client
- Axios-based client
- Automatic token refresh
- Request/Response interceptors
- Error handling
- Device tracking
- Performance monitoring

### Protected Routes
- Role-based route protection
- Authentication state checking
- Redirect handling
- Loading states

## Database Schema

### User Model
- UUID primary key
- Email & phone verification
- Role-based permissions
- Profile information
- Account status tracking

### Authentication Models
1. OAuthApplication
   - Client credentials
   - Redirect URIs
   - Scope management

2. RefreshToken
   - User association
   - Token value
   - Expiration tracking
   - Device info

3. TwoFactorAuth
   - User association
   - TOTP/SMS/Email methods
   - Backup codes
   - Enable/disable status

## Security Considerations

1. Password Security
   - Argon2id hashing
   - Password strength validation
   - History tracking
   - Breach detection

2. Session Security
   - Token rotation
   - Concurrent session limits
   - IP tracking
   - Activity logging

3. API Security
   - Rate limiting
   - Request validation
   - CORS configuration
   - Input sanitization

## Integration Points

1. External Systems
   - Regulator API
   - National harm prevention systems
   - Casino management systems
   - Financial reporting systems

2. Authentication Providers
   - Built-in JWT
   - OAuth2 support
   - API key authentication
   - Custom token schemes

3. Monitoring Systems
   - Prometheus metrics
   - ELK logging
   - Error tracking
   - Performance monitoring

## Development Workflow

1. Local Setup
   - Python 3.11+
   - Node.js 18+
   - Docker for services
   - Virtual environment

2. Environment Configuration
   - .env files
   - Django settings
   - Next.js config
   - API endpoints

3. Testing
   - Unit tests
   - Integration tests
   - E2E testing
   - Security testing

## Deployment

1. Infrastructure
   - Kubernetes ready
   - Docker containers
   - Nginx configuration
   - SSL/TLS setup

2. Monitoring
   - Health checks
   - Error tracking
   - Performance metrics
   - Security alerts

3. Backup
   - Database backups
   - File storage
   - Configuration backup
   - Disaster recovery