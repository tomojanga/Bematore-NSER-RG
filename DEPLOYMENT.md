# 🚀 NSER-RG Production Deployment Guide

## 📋 **Pre-Deployment Checklist**

### Infrastructure Requirements
- [ ] Ubuntu 20.04+ or similar Linux server
- [ ] 8GB RAM minimum (16GB recommended)
- [ ] 4 CPU cores minimum
- [ ] 100GB SSD storage
- [ ] Domain name configured
- [ ] SSL certificate obtained

### Services Required
- [ ] PostgreSQL 15+
- [ ] Redis 7+
- [ ] Docker & Docker Compose
- [ ] Nginx (or use Docker nginx)

---

## 🔧 **Server Setup**

### 1. Update System
```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### 2. Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

### 3. Install Git
```bash
sudo apt-get install git -y
```

---

## 📦 **Application Deployment**

### 1. Clone Repository
```bash
cd /opt
sudo git clone https://github.com/your-org/nser-rg.git
cd nser-rg
sudo chown -R $USER:$USER /opt/nser-rg
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit environment file
nano .env
```

**Required Environment Variables:**
```env
# Django Settings
DJANGO_SECRET_KEY=<generate-secure-random-key>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DJANGO_SETTINGS_MODULE=config.settings.production

# Database
DATABASE_NAME=nser_rg_prod
DATABASE_USER=nser_admin
DATABASE_PASSWORD=<secure-password>
DATABASE_HOST=postgres
DATABASE_PORT=5432

# Redis
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/1
CELERY_RESULT_BACKEND=redis://redis:6379/2
CHANNELS_REDIS_URL=redis://redis:6379/3

# API Keys
AFRICASTALKING_USERNAME=<your-username>
AFRICASTALKING_API_KEY=<your-api-key>
AFRICASTALKING_SENDER_ID=GRAK

SENDGRID_API_KEY=<your-sendgrid-key>
DEFAULT_FROM_EMAIL=noreply@yourdomain.com

FIREBASE_CREDENTIALS_PATH=/app/firebase-credentials.json

MPESA_CONSUMER_KEY=<your-mpesa-key>
MPESA_CONSUMER_SECRET=<your-mpesa-secret>
MPESA_SHORTCODE=<your-shortcode>
MPESA_PASSKEY=<your-passkey>

# Sentry
SENTRY_DSN=<your-sentry-dsn>

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 3. SSL Certificates
```bash
# Create SSL directory
mkdir -p nginx/ssl

# Option 1: Using Let's Encrypt (Recommended)
sudo apt-get install certbot -y
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem

# Option 2: Self-signed (Development only)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem
```

### 4. Firebase Credentials
```bash
# Copy Firebase service account JSON
cp /path/to/firebase-credentials.json src/firebase-credentials.json
```

---

## 🐳 **Docker Deployment**

### 1. Build and Start Services
```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### 2. Initialize Database
```bash
# Run migrations
docker-compose exec web python manage.py migrate

# Create superuser
docker-compose exec web python manage.py createsuperuser

# Collect static files
docker-compose exec web python manage.py collectstatic --noinput
```

### 3. Create Initial Data
```bash
# Load assessment questions
docker-compose exec web python manage.py loaddata fixtures/assessment_questions.json

# Create default permissions
docker-compose exec web python manage.py create_default_permissions
```

---

## 🔍 **Verification**

### 1. Check Services
```bash
# Check all containers
docker-compose ps

# View logs
docker-compose logs -f

# Check specific service
docker-compose logs web
docker-compose logs celery_worker
```

### 2. Test Endpoints
```bash
# Health check
curl https://yourdomain.com/health/

# API documentation
curl https://yourdomain.com/api/docs/

# Admin panel
# Visit: https://yourdomain.com/admin/
```

### 3. Monitor Celery
```bash
# Access Flower
# Visit: https://yourdomain.com:5555/
```

---

## 📊 **Monitoring & Maintenance**

### View Logs
```bash
# Application logs
docker-compose logs -f web

# Celery logs
docker-compose logs -f celery_worker

# Nginx logs
docker-compose logs -f nginx

# All logs
docker-compose logs -f
```

### Database Backup
```bash
# Backup
docker-compose exec postgres pg_dump -U nser_admin nser_rg_prod > backup_$(date +%Y%m%d).sql

# Restore
docker-compose exec -T postgres psql -U nser_admin nser_rg_prod < backup_20231104.sql
```

### Update Application
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Run migrations
docker-compose exec web python manage.py migrate
```

---

## 🔒 **Security**

### Firewall Configuration
```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

### SSL Auto-Renewal
```bash
# Add cron job for Let's Encrypt renewal
sudo crontab -e

# Add this line:
0 12 * * * certbot renew --quiet --post-hook "docker-compose restart nginx"
```

### Database Security
```bash
# Ensure PostgreSQL only listens on localhost
# Edit postgresql.conf:
listen_addresses = 'localhost'

# Use strong passwords
# Regularly update credentials
```

---

## 📈 **Performance Tuning**

### Database Optimization
```sql
-- Create indexes (if not exists)
CREATE INDEX CONCURRENTLY idx_exclusions_active ON self_exclusion_records(is_active, national_id);
CREATE INDEX CONCURRENTLY idx_bst_tokens_lookup ON bst_tokens(token, is_active);
```

### Redis Configuration
```bash
# Edit redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru
```

### Nginx Tuning
```nginx
# In nginx.conf
worker_processes auto;
worker_connections 4096;
keepalive_timeout 65;
```

---

## 🆘 **Troubleshooting**

### Common Issues

#### 1. Container Won't Start
```bash
# Check logs
docker-compose logs <service_name>

# Restart service
docker-compose restart <service_name>
```

#### 2. Database Connection Error
```bash
# Check PostgreSQL is running
docker-compose exec postgres pg_isready

# Verify credentials in .env
```

#### 3. Static Files Not Loading
```bash
# Recollect static files
docker-compose exec web python manage.py collectstatic --noinput --clear

# Check nginx volume mount
```

#### 4. Celery Tasks Not Running
```bash
# Check Celery worker
docker-compose logs celery_worker

# Restart worker
docker-compose restart celery_worker
```

---

## 📞 **Support**

For deployment issues:
- Check logs: `docker-compose logs -f`
- Review documentation: `/docs`
- Contact: support@grak.ke

---

## ✅ **Post-Deployment Checklist**

- [ ] All services running
- [ ] SSL certificate valid
- [ ] Database migrations complete
- [ ] Superuser account created
- [ ] API endpoints responding
- [ ] Celery tasks executing
- [ ] Monitoring configured
- [ ] Backups scheduled
- [ ] Firewall configured
- [ ] DNS records updated
- [ ] Health checks passing
- [ ] Performance tested

**🎉 Deployment Complete!**
