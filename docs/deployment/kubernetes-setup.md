# Kubernetes Deployment Guide - NSER-RG

## Overview

This guide covers deploying the NSER-RG platform on Kubernetes for production environments, ensuring high availability, scalability, and security.

---

## Prerequisites

### Infrastructure
- Kubernetes cluster (v1.24+)
- kubectl configured
- Helm 3.x installed
- Container registry (Docker Hub, AWS ECR, GCP Artifact Registry)
- Persistent storage provisioner (AWS EBS, GCP Persistent Disk, etc.)

### Resources per Environment
**Development**:
- 3 nodes (t3.medium or equivalent)
- 8GB RAM, 4 vCPU per node
- 100GB storage

**Production**:
- 5+ nodes (t3.xlarge or equivalent)
- 16GB RAM, 8 vCPU per node
- 500GB+ storage
- Multi-AZ deployment

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Load Balancer (ELB/NLB)                │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                   Ingress Controller                     │
│                  (NGINX/Traefik)                        │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┴───────────────────┐
        │                                       │
┌───────────────┐                    ┌──────────────────┐
│  Django Pods  │                    │   Celery Pods    │
│  (3+ replicas)│                    │  (5+ replicas)   │
└───────────────┘                    └──────────────────┘
        │                                       │
        └──────────────────┬───────────────────┘
                           │
        ┌──────────────────┴───────────────────┐
        │                                       │
┌───────────────┐                    ┌──────────────────┐
│  PostgreSQL   │                    │     Redis        │
│  StatefulSet  │                    │   StatefulSet    │
└───────────────┘                    └──────────────────┘
```

---

## Deployment Steps

### 1. Create Namespace

```bash
kubectl create namespace nser-rg-prod
kubectl config set-context --current --namespace=nser-rg-prod
```

### 2. Setup Secrets

```bash
# Create database credentials
kubectl create secret generic db-credentials \
  --from-literal=POSTGRES_DB=nser_rg_prod \
  --from-literal=POSTGRES_USER=nser_admin \
  --from-literal=POSTGRES_PASSWORD=$(openssl rand -base64 32)

# Create Django secret
kubectl create secret generic django-secrets \
  --from-literal=SECRET_KEY=$(openssl rand -base64 64) \
  --from-literal=DEBUG=False

# Create API keys
kubectl create secret generic api-keys \
  --from-literal=AFRICASTALKING_USERNAME=your_username \
  --from-literal=AFRICASTALKING_API_KEY=your_key \
  --from-literal=SENDGRID_API_KEY=your_sendgrid_key \
  --from-literal=MPESA_CONSUMER_KEY=your_mpesa_key \
  --from-literal=MPESA_CONSUMER_SECRET=your_mpesa_secret
```

### 3. Deploy PostgreSQL

**postgresql-statefulset.yaml**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  selector:
    app: postgres
  ports:
    - port: 5432
  clusterIP: None
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: POSTGRES_DB
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: POSTGRES_USER
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: POSTGRES_PASSWORD
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 100Gi
```

Deploy:
```bash
kubectl apply -f postgresql-statefulset.yaml
```

### 4. Deploy Redis

**redis-statefulset.yaml**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: redis
spec:
  selector:
    app: redis
  ports:
    - port: 6379
  clusterIP: None
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis
spec:
  serviceName: redis
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        command: ["redis-server"]
        args: ["--appendonly", "yes"]
        volumeMounts:
        - name: redis-storage
          mountPath: /data
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
  volumeClaimTemplates:
  - metadata:
      name: redis-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 20Gi
```

Deploy:
```bash
kubectl apply -f redis-statefulset.yaml
```

### 5. Build & Push Docker Image

```bash
# Build image
docker build -t your-registry/nser-rg:v1.0.0 .

# Push to registry
docker push your-registry/nser-rg:v1.0.0
```

### 6. Deploy Django Application

**django-deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: django
spec:
  replicas: 3
  selector:
    matchLabels:
      app: django
  template:
    metadata:
      labels:
        app: django
    spec:
      initContainers:
      - name: migrate
        image: your-registry/nser-rg:v1.0.0
        command: ["python", "src/manage.py", "migrate"]
        envFrom:
        - configMapRef:
            name: django-config
        - secretRef:
            name: django-secrets
        - secretRef:
            name: db-credentials
        - secretRef:
            name: api-keys
      containers:
      - name: django
        image: your-registry/nser-rg:v1.0.0
        ports:
        - containerPort: 8000
        envFrom:
        - configMapRef:
            name: django-config
        - secretRef:
            name: django-secrets
        - secretRef:
            name: db-credentials
        - secretRef:
            name: api-keys
        livenessProbe:
          httpGet:
            path: /health/
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready/
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
---
apiVersion: v1
kind: Service
metadata:
  name: django
spec:
  selector:
    app: django
  ports:
    - port: 8000
      targetPort: 8000
  type: ClusterIP
```

**django-configmap.yaml**:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: django-config
data:
  DJANGO_SETTINGS_MODULE: "config.settings.production"
  ALLOWED_HOSTS: "yourdomain.com,www.yourdomain.com"
  DATABASE_HOST: "postgres"
  DATABASE_PORT: "5432"
  REDIS_URL: "redis://redis:6379/0"
  CELERY_BROKER_URL: "redis://redis:6379/1"
  CELERY_RESULT_BACKEND: "redis://redis:6379/2"
  CHANNELS_REDIS_URL: "redis://redis:6379/3"
```

Deploy:
```bash
kubectl apply -f django-configmap.yaml
kubectl apply -f django-deployment.yaml
```

### 7. Deploy Celery Workers

**celery-deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: celery-worker
spec:
  replicas: 5
  selector:
    matchLabels:
      app: celery-worker
  template:
    metadata:
      labels:
        app: celery-worker
    spec:
      containers:
      - name: celery
        image: your-registry/nser-rg:v1.0.0
        command: ["celery", "-A", "config", "worker", "-l", "info", "-Q", "default,high_priority,low_priority"]
        envFrom:
        - configMapRef:
            name: django-config
        - secretRef:
            name: django-secrets
        - secretRef:
            name: db-credentials
        - secretRef:
            name: api-keys
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: celery-beat
spec:
  replicas: 1
  selector:
    matchLabels:
      app: celery-beat
  template:
    metadata:
      labels:
        app: celery-beat
    spec:
      containers:
      - name: celery-beat
        image: your-registry/nser-rg:v1.0.0
        command: ["celery", "-A", "config", "beat", "-l", "info", "--scheduler", "django_celery_beat.schedulers:DatabaseScheduler"]
        envFrom:
        - configMapRef:
            name: django-config
        - secretRef:
            name: django-secrets
        - secretRef:
            name: db-credentials
        - secretRef:
            name: api-keys
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

Deploy:
```bash
kubectl apply -f celery-deployment.yaml
```

### 8. Setup Ingress

**ingress.yaml**:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nser-rg-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
spec:
  tls:
  - hosts:
    - yourdomain.com
    secretName: nser-rg-tls
  rules:
  - host: yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: django
            port:
              number: 8000
```

Deploy:
```bash
kubectl apply -f ingress.yaml
```

---

## Monitoring & Observability

### Prometheus & Grafana

```bash
# Add Helm repos
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace

# Access Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
```

### Application Metrics

Add Django Prometheus exporter:
```python
# requirements.txt
django-prometheus==2.3.1

# settings.py
INSTALLED_APPS += ['django_prometheus']
MIDDLEWARE = ['django_prometheus.middleware.PrometheusBeforeMiddleware'] + MIDDLEWARE + ['django_prometheus.middleware.PrometheusAfterMiddleware']
```

---

## Scaling

### Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: django-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: django
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

Deploy:
```bash
kubectl apply -f django-hpa.yaml
```

---

## Backup & Disaster Recovery

### Database Backups

```bash
# Create CronJob for automated backups
apiVersion: batch/v1
kind: CronJob
metadata:
  name: postgres-backup
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:15-alpine
            command:
            - /bin/sh
            - -c
            - pg_dump -h postgres -U $POSTGRES_USER $POSTGRES_DB | gzip > /backup/backup-$(date +%Y%m%d-%H%M%S).sql.gz
            env:
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: POSTGRES_USER
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: POSTGRES_PASSWORD
            - name: POSTGRES_DB
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: POSTGRES_DB
            volumeMounts:
            - name: backup-storage
              mountPath: /backup
          restartPolicy: OnFailure
          volumes:
          - name: backup-storage
            persistentVolumeClaim:
              claimName: backup-pvc
```

---

## Security Best Practices

1. **Network Policies**: Restrict pod-to-pod communication
2. **Pod Security Standards**: Enforce baseline/restricted policies
3. **Secrets Management**: Use external secrets manager (AWS Secrets Manager, Vault)
4. **Image Scanning**: Scan images for vulnerabilities
5. **RBAC**: Implement least-privilege access
6. **TLS Everywhere**: Encrypt all internal communication

---

## Troubleshooting

### View Logs
```bash
# Django logs
kubectl logs -l app=django -f

# Celery logs
kubectl logs -l app=celery-worker -f

# Database logs
kubectl logs postgres-0 -f
```

### Shell Access
```bash
# Django shell
kubectl exec -it deployment/django -- python src/manage.py shell

# Database shell
kubectl exec -it postgres-0 -- psql -U nser_admin -d nser_rg_prod
```

### Common Issues

**Pods not starting**:
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

**Database connection issues**:
```bash
kubectl exec -it deployment/django -- env | grep DATABASE
kubectl get svc postgres
```

---

## Production Checklist

- [ ] All secrets created and secured
- [ ] Database backups configured
- [ ] Monitoring and alerting setup
- [ ] SSL certificates configured
- [ ] HPA configured for auto-scaling
- [ ] Resource limits set on all pods
- [ ] Network policies applied
- [ ] Log aggregation configured
- [ ] Disaster recovery plan tested
- [ ] Load testing completed
- [ ] Security scan passed
- [ ] Documentation updated

---

## Support

For deployment issues, contact:
- DevOps Team: devops@bematore.com
- Infrastructure: infrastructure@bematore.com
