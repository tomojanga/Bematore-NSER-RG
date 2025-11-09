# NSER-RG Deployment Guide

## Quick Start

### Backend (Django API)
```bash
# Navigate to project root
cd nser-rg

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements/development.txt

# Setup environment
copy .env.example .env
# Edit .env with your settings

# Run migrations
python src/manage.py migrate

# Create superuser
python src/manage.py createsuperuser

# Run development server
python src/manage.py runserver
```

### Frontend - Citizen Portal
```bash
cd frontend-citizen

# Install dependencies
npm install

# Setup environment
copy .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1

# Run development server
npm run dev
# Access at http://localhost:3001
```

### Frontend - Operator Portal
```bash
cd frontend-operator

# Install dependencies
npm install

# Setup environment
copy .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1

# Run development server
npm run dev
# Access at http://localhost:3002
```

## Environment Variables

### Backend (.env)
```
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=postgresql://user:password@localhost:5432/nser_db
REDIS_URL=redis://localhost:6379/0
CORS_ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3002

# Optional: SMS/Email providers
AFRICASTALKING_USERNAME=
AFRICASTALKING_API_KEY=
SENDGRID_API_KEY=
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
```

## API Endpoints

### Authentication
- POST `/api/v1/auth/register/` - Register user
- POST `/api/v1/auth/login/` - Login
- POST `/api/v1/auth/token/refresh/` - Refresh token
- POST `/api/v1/auth/logout/` - Logout

### Users
- GET `/api/v1/users/me/` - Get current user
- POST `/api/v1/users/verify/phone/` - Verify phone
- POST `/api/v1/users/verify/email/` - Verify email

### NSER (Self-Exclusion)
- POST `/api/v1/nser/register/` - Register exclusion
- GET `/api/v1/nser/my-exclusions/` - Get user exclusions
- POST `/api/v1/nser/lookup/` - Lookup exclusion (operators)

### Screening
- POST `/api/v1/screening/lie-bet/start/` - Start Lie/Bet assessment
- POST `/api/v1/screening/pgsi/start/` - Start PGSI assessment
- POST `/api/v1/screening/dsm5/start/` - Start DSM-5 assessment
- POST `/api/v1/screening/respond/` - Submit assessment response

## Default Credentials

### Superuser (Django Admin)
- Access: http://127.0.0.1:8000/admin/
- Create via: `python src/manage.py createsuperuser`

### Test Citizen
- Register via: http://localhost:3001/auth/register
- Phone: +254712345678
- Password: Test@1234

### Test Operator
- Register via: http://localhost:3002/auth/register
- Email: operator@example.com
- Password: Test@1234

## Ports
- Backend API: 8000
- Citizen Portal: 3001
- Operator Portal: 3002
- PostgreSQL: 5432
- Redis: 6379

## Production Deployment

### Backend
1. Set `DEBUG=False` in .env
2. Configure production database
3. Set up Gunicorn/uWSGI
4. Configure Nginx reverse proxy
5. Set up SSL certificates
6. Configure Celery workers
7. Set up Redis for caching

### Frontend
1. Build production bundles: `npm run build`
2. Deploy to Vercel/Netlify or serve with Nginx
3. Configure environment variables
4. Set up CDN for static assets

## Troubleshooting

### Backend won't start
- Check DATABASE_URL is correct
- Ensure PostgreSQL is running
- Run migrations: `python src/manage.py migrate`

### Frontend won't connect to API
- Check NEXT_PUBLIC_API_URL in .env.local
- Ensure backend is running on port 8000
- Check CORS settings in backend

### Token refresh fails
- Clear localStorage in browser
- Re-login to get new tokens
- Check token lifetime settings

## Support
For issues, contact: support@bematore.com
