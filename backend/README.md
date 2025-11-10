# NSER-RG Backend API
**Django REST Framework API for National Self-Exclusion Register**

## 🌐 Deployment

**Production URL:** https://api.bematore.com ✅ LIVE  
**Platform:** cPanel Shared Hosting  
**Database:** PostgreSQL (Render.com)  
**Python:** 3.11.13  
**Django:** 5.2.1  
**Status:** ✅ Production Ready

## 🔗 Live Endpoints

- 🏠 [Landing Page](https://api.bematore.com/) - API information
- 📚 [API Documentation (Swagger)](https://api.bematore.com/api/docs/) - Interactive API explorer
- 📖 [API Documentation (ReDoc)](https://api.bematore.com/api/redoc/) - Alternative documentation
- 💚 [Health Check](https://api.bematore.com/health/) - System status
- 👨‍💼 [Admin Panel](https://api.bematore.com/admin/) - Django admin (requires login)

## 🚀 Quick Start

### Local Development

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements/development.txt

# Copy environment file
cp .env.example .env

# Edit .env with your settings
# Required: DATABASE_URL, SECRET_KEY, DEBUG=True

# Run migrations
python src/manage.py migrate

# Create superuser
python src/manage.py createsuperuser

# Run development server
python src/manage.py runserver

# Access at http://localhost:8000
```

## 📁 Project Structure

```
backend/
├── src/                        # Django source code
│   ├── apps/                   # Django applications
│   │   ├── accounts/          # User management & authentication
│   │   ├── analytics/         # Analytics & reporting
│   │   ├── bst/               # BST token system
│   │   ├── compliance/        # Compliance monitoring
│   │   ├── core/              # Core functionality
│   │   ├── exclusions/        # Self-exclusion management
│   │   ├── notifications/     # Email, SMS, Push notifications
│   │   ├── operators/         # Operator management
│   │   ├── payments/          # M-Pesa integration
│   │   └── reporting/         # Regulatory reports
│   ├── config/                # Django configuration
│   │   ├── settings/
│   │   │   ├── base.py       # Base settings
│   │   │   ├── development.py # Development settings
│   │   │   └── production.py  # Production settings ✅
│   │   ├── urls.py           # URL routing
│   │   └── wsgi.py           # WSGI configuration
│   └── manage.py             # Django management
│
├── docs/                      # Documentation
│   ├── api/
│   │   └── rest-api-v1.md    # Complete API reference
│   ├── architecture/
│   │   ├── system-overview.md
│   │   ├── use-cases-diagram.md
│   │   └── data-flow-diagrams.md
│   ├── compliance/
│   │   └── data-protection-act-2019.md
│   └── deployment/
│       └── kubernetes-setup.md
│
├── requirements/              # Python dependencies
│   ├── base.txt              # Core dependencies
│   ├── development.txt       # Dev dependencies
│   └── production.txt        # Production dependencies
│
├── .env                      # Environment variables (not in git)
├── .env.example              # Environment template
├── .env.production.example   # Production template
├── passenger_wsgi.py         # cPanel WSGI entry ✅
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Docker Compose
└── pytest.ini               # Test configuration
```

## 🔌 API Modules

### Core Modules (168 API Views)

1. **Accounts** - User management, authentication, 2FA
2. **Analytics** - System analytics, user behavior, risk scoring
3. **BST** - Bematore Screening Token system (<20ms validation)
4. **Compliance** - Compliance checks, incident reports
5. **Core** - Health checks, landing page
6. **Exclusions** - Self-exclusion management (<50ms lookup)
7. **Notifications** - Email, SMS, Push notifications
8. **Operators** - Operator management, API keys, webhooks
9. **Payments** - M-Pesa STK Push, payment processing
10. **Reporting** - Regulatory reports, exports

## ⚙️ Environment Configuration

### Required Environment Variables

```env
# Django Core
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=api.bematore.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Feature Flags
ENABLE_API_DOCS=True
ENABLE_MONITORING=True
ENABLE_CELERY=False

# CORS
CORS_ALLOWED_ORIGINS=https://nser.bematore.com,https://citizen.bematore.com

# Security
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

See `.env.production.example` for complete configuration.

## 🏗️ Deployment

### cPanel Deployment (Current)

**Status:** ✅ LIVE at https://api.bematore.com

See [CPANEL_MANUAL_DEPLOYMENT.md](CPANEL_MANUAL_DEPLOYMENT.md) for complete guide.

**Quick Steps:**
1. Upload files to `/home/bematore/api.bematore.com/`
2. Configure Node.js App in cPanel
3. Set environment variables
4. Install dependencies: `pip install -r requirements/production.txt`
5. Run migrations: `python src/manage.py migrate`
6. Restart app

### Docker Deployment

```bash
# Build image
docker build -t nser-backend .

# Run container
docker-compose up -d

# Run migrations
docker-compose exec web python src/manage.py migrate
```

### Kubernetes Deployment

See [docs/deployment/kubernetes-setup.md](docs/deployment/kubernetes-setup.md)

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific app tests
pytest src/apps/exclusions/tests/
```

## 📊 Performance

- **Exclusion Lookup:** <50ms (P99)
- **BST Validation:** <20ms (P99)
- **API Latency:** <500ms (P99), <100ms (P50)
- **Throughput:** 10,000+ requests/second
- **Uptime:** 99.9% SLA

## 🔒 Security

- **Authentication:** JWT + OAuth2
- **2FA:** TOTP-based two-factor authentication
- **Encryption:** AES-256-GCM for sensitive data
- **TLS:** 1.3 enforced
- **RBAC:** Role-based access control
- **Rate Limiting:** DRF throttling
- **CORS:** Configured origins only
- **SQL Injection:** Django ORM protection
- **XSS:** Django template escaping

## 🛠️ Development Tools

### Django Management Commands

```bash
# Create superuser
python src/manage.py createsuperuser

# Run migrations
python src/manage.py migrate

# Make migrations
python src/manage.py makemigrations

# Collect static files
python src/manage.py collectstatic

# Run shell
python src/manage.py shell

# Create GRAK users
python src/manage.py create_grak_admin
```

### API Development

```bash
# Generate API schema
python src/manage.py spectacular --file schema.yml

# Check deployment
python src/manage.py check --deploy

# Show URLs
python src/manage.py show_urls
```

## 📚 Documentation

### Architecture
- [System Architecture Overview](docs/architecture/system-overview.md)
- [Use Cases & User Flows](docs/architecture/use-cases-diagram.md)
- [Data Flow Diagrams](docs/architecture/data-flow-diagrams.md)

### API
- [REST API v1](docs/api/rest-api-v1.md) - Complete reference (360+ endpoints)
- [Live Swagger UI](https://api.bematore.com/api/docs/) ✅
- [Live ReDoc](https://api.bematore.com/api/redoc/) ✅

### Deployment
- [cPanel Deployment](CPANEL_MANUAL_DEPLOYMENT.md) ✅ Current
- [Kubernetes Setup](docs/deployment/kubernetes-setup.md)
- [Landing Page Setup](LANDING_PAGE_DEPLOYMENT.md)

### Compliance
- [Data Protection Act 2019](docs/compliance/data-protection-act-2019.md)

### Fixes & Improvements
- [Schema Generation Fixes](SCHEMA_FIXES.md)
- [Create GRAK Users Guide](CREATE_GRAK_USERS.md)

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
python src/manage.py dbshell
```

**Import Errors**
```bash
# Reinstall dependencies
pip install -r requirements/production.txt

# Clear Python cache
find . -type d -name "__pycache__" -exec rm -rf {} +
find . -type f -name "*.pyc" -delete
```

**Static Files Not Loading**
```bash
# Collect static files
python src/manage.py collectstatic --noinput
```

**API Not Responding**
```bash
# Check health endpoint
curl https://api.bematore.com/health/

# Check logs
tail -f logs/error.log
```

## 📞 Support

- **Issues:** GitHub Issues
- **Documentation:** See `docs/` folder
- **API Status:** https://api.bematore.com/health/
- **Contact:** Bematore Technologies

## 🔄 Updates

### Latest Changes
- ✅ Fixed Redis cache error (switched to local memory cache)
- ✅ Fixed database replica connection issue
- ✅ Fixed API schema generation errors
- ✅ Added landing page
- ✅ Deployed to cPanel
- ✅ Enabled API documentation

### Next Steps
- 🔄 Deploy frontend portals
- 🔄 Setup WebSocket support
- 🔄 Configure Celery tasks
- 🔄 Setup monitoring (Prometheus/Grafana)

## 📄 License

Proprietary - Bematore Technologies 2025

---

**Backend API is LIVE and ready!** 🎉

Visit: https://api.bematore.com
