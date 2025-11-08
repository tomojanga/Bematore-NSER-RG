# Frontend Deployment Architecture - NSER-RG

## Overview
The NSER-RG system has 4 independent frontend applications that can be deployed separately.

## Project Structure

```
nser-rg/
├── frontend-public/          # Public website (nser.grak.ke)
├── frontend-citizen/         # Citizen portal (citizen.nser.grak.ke)
├── frontend-operator/        # Operator portal (operator.nser.grak.ke)
├── frontend-grak/           # GRAK portal (admin.nser.grak.ke)
└── frontend/                # Legacy (to be migrated)
```

## 1. Public Website (frontend-public/)

### Purpose
Public-facing website with information about NSER

### Domain
- Production: `https://nser.grak.ke`
- Staging: `https://staging.nser.grak.ke`

### Features
- Landing page
- About NSER
- Contact information
- Public resources
- Login/Register links

### Tech Stack
- Next.js 14 (App Router)
- Tailwind CSS
- No authentication required

### Deployment
```bash
cd frontend-public
npm install
npm run build
npm start
```

### Environment Variables
```env
NEXT_PUBLIC_API_URL=https://api.nser.grak.ke/api/v1
NEXT_PUBLIC_SITE_URL=https://nser.grak.ke
```

---

## 2. Citizen Portal (frontend-citizen/)

### Purpose
Self-exclusion registration and management for citizens

### Domain
- Production: `https://citizen.nser.grak.ke`
- Staging: `https://staging-citizen.nser.grak.ke`

### Features
- Self-exclusion registration
- Risk assessments (Lie/Bet, PGSI, DSM-5)
- Exclusion history
- Account settings
- Dashboard

### Tech Stack
- Next.js 14 (App Router)
- Tailwind CSS
- React Query
- Zustand (state management)

### Authentication
- Required: Role = `citizen`
- JWT tokens
- Session management

### Deployment
```bash
cd frontend-citizen
npm install
npm run build
npm start
```

### Environment Variables
```env
NEXT_PUBLIC_API_URL=https://api.nser.grak.ke/api/v1
NEXT_PUBLIC_SITE_URL=https://citizen.nser.grak.ke
NEXT_PUBLIC_PORTAL_TYPE=citizen
```

---

## 3. Operator Portal (frontend-operator/)

### Purpose
Licensed operator integration and compliance

### Domain
- Production: `https://operator.nser.grak.ke`
- Staging: `https://staging-operator.nser.grak.ke`

### Features
- User exclusion lookup
- API key management
- Compliance monitoring
- Integration testing
- Transaction logs
- Dashboard

### Tech Stack
- Next.js 14 (App Router)
- Tailwind CSS
- React Query
- Zustand (state management)

### Authentication
- Required: Roles = `operator_admin`, `operator_user`
- JWT tokens
- API key management

### Deployment
```bash
cd frontend-operator
npm install
npm run build
npm start
```

### Environment Variables
```env
NEXT_PUBLIC_API_URL=https://api.nser.grak.ke/api/v1
NEXT_PUBLIC_SITE_URL=https://operator.nser.grak.ke
NEXT_PUBLIC_PORTAL_TYPE=operator
```

---

## 4. GRAK Portal (frontend-grak/)

### Purpose
National regulatory oversight and administration

### Domain
- Production: `https://admin.nser.grak.ke`
- Staging: `https://staging-admin.nser.grak.ke`

### Features
- National statistics dashboard
- User management
- Operator oversight
- Exclusion management
- Risk assessment review
- Compliance monitoring
- System health monitoring
- Analytics & reporting

### Tech Stack
- Next.js 14 (App Router)
- Tailwind CSS
- React Query
- Zustand (state management)
- Recharts (analytics)

### Authentication
- Required: Roles = `grak_admin`, `grak_officer`, `grak_auditor`, `super_admin`
- JWT tokens
- 2FA required

### Deployment
```bash
cd frontend-grak
npm install
npm run build
npm start
```

### Environment Variables
```env
NEXT_PUBLIC_API_URL=https://api.nser.grak.ke/api/v1
NEXT_PUBLIC_SITE_URL=https://admin.nser.grak.ke
NEXT_PUBLIC_PORTAL_TYPE=grak
```

---

## Shared Components Library

### Location
Each frontend has its own copy of shared components in `src/components/`

### Components
- `ui/` - Button, Card, Input, Modal, etc.
- `forms/` - Form components
- `charts/` - Chart components
- `layouts/` - Layout components

### Synchronization
Use a shared npm package or copy components between projects

---

## Deployment Strategy

### Option 1: Separate Servers
Each frontend on its own server/container

```
Server 1: frontend-public (Port 3000)
Server 2: frontend-citizen (Port 3001)
Server 3: frontend-operator (Port 3002)
Server 4: frontend-grak (Port 3003)
```

### Option 2: Docker Compose
All frontends in one docker-compose.yml

```yaml
version: '3.8'
services:
  frontend-public:
    build: ./frontend-public
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://api.nser.grak.ke/api/v1

  frontend-citizen:
    build: ./frontend-citizen
    ports:
      - "3001:3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://api.nser.grak.ke/api/v1

  frontend-operator:
    build: ./frontend-operator
    ports:
      - "3002:3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://api.nser.grak.ke/api/v1

  frontend-grak:
    build: ./frontend-grak
    ports:
      - "3003:3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://api.nser.grak.ke/api/v1
```

### Option 3: Kubernetes
Each frontend as a separate deployment

```yaml
# frontend-public-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-public
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend-public
  template:
    metadata:
      labels:
        app: frontend-public
    spec:
      containers:
      - name: frontend-public
        image: nser-rg/frontend-public:latest
        ports:
        - containerPort: 3000
```

### Option 4: Vercel/Netlify
Each frontend as separate project

```
Project 1: nser-public (nser.grak.ke)
Project 2: nser-citizen (citizen.nser.grak.ke)
Project 3: nser-operator (operator.nser.grak.ke)
Project 4: nser-grak (admin.nser.grak.ke)
```

---

## DNS Configuration

```
nser.grak.ke              → frontend-public
citizen.nser.grak.ke      → frontend-citizen
operator.nser.grak.ke     → frontend-operator
admin.nser.grak.ke        → frontend-grak
api.nser.grak.ke          → backend API
```

---

## CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy Frontend Public

on:
  push:
    branches: [main]
    paths:
      - 'frontend-public/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd frontend-public && npm install
      - name: Build
        run: cd frontend-public && npm run build
      - name: Deploy
        run: |
          # Deploy to server
```

---

## Migration Plan

### Phase 1: Setup New Projects
1. Create 4 separate Next.js projects
2. Copy shared components to each
3. Configure environment variables
4. Test locally

### Phase 2: Migrate Code
1. Move public pages to frontend-public
2. Move citizen portal to frontend-citizen
3. Move operator portal to frontend-operator
4. Move GRAK portal to frontend-grak

### Phase 3: Deploy
1. Deploy frontend-public first
2. Deploy frontend-citizen
3. Deploy frontend-operator
4. Deploy frontend-grak
5. Update DNS records

### Phase 4: Cleanup
1. Archive old frontend/
2. Update documentation
3. Update CI/CD pipelines

---

## Benefits of Separation

1. **Independent Deployment**: Deploy each portal without affecting others
2. **Scalability**: Scale each portal based on traffic
3. **Security**: Isolate portals for better security
4. **Performance**: Optimize each portal independently
5. **Team Organization**: Different teams can work on different portals
6. **Maintenance**: Easier to maintain and update
7. **Cost Optimization**: Pay only for resources each portal needs

---

## Monitoring

Each frontend should have:
- Error tracking (Sentry)
- Performance monitoring (Vercel Analytics)
- User analytics (Google Analytics)
- Uptime monitoring (Pingdom)

---

## Backup Strategy

- Git repository for code
- Environment variables in secure vault
- Build artifacts in S3/Cloud Storage
- Database backups (if any local storage)
