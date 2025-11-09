# Frontend Migration Guide

## Quick Start - Setup All Frontends

### 1. Copy Existing Code

```bash
# From project root
cd d:\DEVELOPMENT PROJECT\BEMATORE TECHNOLOGIES\nser-rg

# Copy shared components and utilities to each frontend
xcopy /E /I frontend\src\components frontend-public\src\components
xcopy /E /I frontend\src\components frontend-citizen\src\components
xcopy /E /I frontend\src\components frontend-operator\src\components
xcopy /E /I frontend\src\components frontend-grak\src\components

xcopy /E /I frontend\src\lib frontend-public\src\lib
xcopy /E /I frontend\src\lib frontend-citizen\src\lib
xcopy /E /I frontend\src\lib frontend-operator\src\lib
xcopy /E /I frontend\src\lib frontend-grak\src\lib

xcopy /E /I frontend\src\hooks frontend-citizen\src\hooks
xcopy /E /I frontend\src\hooks frontend-operator\src\hooks
xcopy /E /I frontend\src\hooks frontend-grak\src\hooks

xcopy /E /I frontend\src\store frontend-citizen\src\store
xcopy /E /I frontend\src\store frontend-operator\src\store
xcopy /E /I frontend\src\store frontend-grak\src\store

xcopy /E /I frontend\src\types frontend-citizen\src\types
xcopy /E /I frontend\src\types frontend-operator\src\types
xcopy /E /I frontend\src\types frontend-grak\src\types
```

### 2. Copy Portal-Specific Pages

```bash
# Citizen Portal
xcopy /E /I frontend\src\app\portals\citizen frontend-citizen\src\app
xcopy /E /I frontend\src\app\auth frontend-citizen\src\app\auth

# Operator Portal
xcopy /E /I frontend\src\app\portals\operator frontend-operator\src\app
xcopy /E /I frontend\src\app\auth frontend-operator\src\app\auth

# GRAK Portal
xcopy /E /I frontend\src\app\portals\grak frontend-grak\src\app
xcopy /E /I frontend\src\app\auth frontend-grak\src\app\auth
```

### 3. Install Dependencies

```bash
# Public
cd frontend-public
npm install

# Citizen
cd ../frontend-citizen
npm install

# Operator
cd ../frontend-operator
npm install

# GRAK
cd ../frontend-grak
npm install
```

### 4. Create Configuration Files

Each frontend needs:
- `next.config.js`
- `tailwind.config.ts`
- `tsconfig.json`
- `.env.local`

### 5. Run All Frontends

```bash
# Terminal 1 - Public
cd frontend-public && npm run dev

# Terminal 2 - Citizen
cd frontend-citizen && npm run dev

# Terminal 3 - Operator
cd frontend-operator && npm run dev

# Terminal 4 - GRAK
cd frontend-grak && npm run dev
```

## Access URLs

- Public: http://localhost:3000
- Citizen: http://localhost:3001
- Operator: http://localhost:3002
- GRAK: http://localhost:3003
- Backend API: http://localhost:8000

## Environment Variables

### frontend-public/.env.local
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### frontend-citizen/.env.local
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3001
NEXT_PUBLIC_PORTAL_TYPE=citizen
```

### frontend-operator/.env.local
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3002
NEXT_PUBLIC_PORTAL_TYPE=operator
```

### frontend-grak/.env.local
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3003
NEXT_PUBLIC_PORTAL_TYPE=grak
```

## Production Deployment

### Docker Compose

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

  backend:
    build: ./src
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/nser
```

### Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/nser

server {
    listen 80;
    server_name nser.grak.ke;
    location / {
        proxy_pass http://localhost:3000;
    }
}

server {
    listen 80;
    server_name citizen.nser.grak.ke;
    location / {
        proxy_pass http://localhost:3001;
    }
}

server {
    listen 80;
    server_name operator.nser.grak.ke;
    location / {
        proxy_pass http://localhost:3002;
    }
}

server {
    listen 80;
    server_name admin.nser.grak.ke;
    location / {
        proxy_pass http://localhost:3003;
    }
}

server {
    listen 80;
    server_name api.nser.grak.ke;
    location / {
        proxy_pass http://localhost:8000;
    }
}
```

## Benefits

✅ **Independent Deployment** - Deploy each portal separately
✅ **Better Security** - Isolate portals
✅ **Scalability** - Scale based on traffic
✅ **Team Organization** - Different teams per portal
✅ **Performance** - Optimize independently
✅ **Maintenance** - Easier updates

## Next Steps

1. Complete the migration
2. Test each portal independently
3. Setup CI/CD pipelines
4. Configure production domains
5. Deploy to production
