# 🌍 GUIDE DÉPLOIEMENT MONDE - Multi Convert
**Date:** 25 janvier 2026  
**Objectif:** Déployer en production MONDE sans bugs ni failles

---

## 📋 PRÉ-REQUIS AVANT LANCEMENT

### Variables d'Environnement Production

**Fichier:** `.env.production` (JAMAIS en Git)

```bash
# ======== AUTHENTIFICATION ========
NEXTAUTH_SECRET=your-secure-256bit-secret-here  # Générer: openssl rand -base64 32
JWT_SECRET=your-jwt-secret-256bit-here
GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx

# ======== BASE DE DONNÉES ========
DATABASE_URL=postgresql://user:password@db.prod.aws.com:5432/Multi Convert
DIRECT_URL=postgresql://user:password@db.prod.direct.aws.com:5432/Multi Convert

# ======== CACHE & QUEUES ========
REDIS_URL=redis://Multi Convert:password@redis.prod.aws.com:6379

# ======== CHIFFREMENT ========
ENCRYPTION_KEY=your-256bit-encryption-key  # Générer: openssl rand -hex 32

# ======== SERVICES EXTERNES ========
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENTRY_DSN=https://xxx@sentry.io/xxx
STRIPE_SECRET_KEY=sk_live_xxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxx

# ======== AWS/STORAGE ========
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=eu-west-1
S3_BUCKET=Multi Convert-prod-files

# ======== ADMIN & SÉCURITÉ ========
ADMIN_EMAILS=admin@Multi Convert.com,security@Multi Convert.com
ALLOWED_ORIGINS=https://Multi Convert.com,https://www.Multi Convert.com,https://api.Multi Convert.com

# ======== APPLICATION ========
NEXT_PUBLIC_APP_URL=https://Multi Convert.com
NEXT_PUBLIC_API_URL=https://api.Multi Convert.com
NODE_ENV=production
NEXT_PUBLIC_VERSION=1.0.0
```

### Générer les Secrets Sécurisés

```bash
# NEXTAUTH_SECRET (256-bit)
openssl rand -base64 32

# JWT_SECRET (256-bit)
openssl rand -base64 32

# ENCRYPTION_KEY (256-bit hex)
openssl rand -hex 32

# Exemple:
# NEXTAUTH_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz1234567890ABCD==
# JWT_SECRET=XyZaBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890AB==
# ENCRYPTION_KEY=0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a
```

---

## 🏗️ ARCHITECTURE PRODUCTION RECOMMANDÉE

### Infrastructure AWS

```
┌─────────────────────────────────────────────────────────┐
│                     Cloudflare CDN                       │
│              (DDoS Protection + Caching)                 │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                    Route 53 (DNS)                        │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│          Application Load Balancer (ALB)                 │
│              (SSL Termination - A+ Rating)               │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
    ┌───▼───┐      ┌───▼───┐      ┌──▼────┐
    │ ECS   │      │ ECS   │      │ ECS   │
    │Pod 1  │      │Pod 2  │      │Pod 3  │
    └───┬───┘      └───┬───┘      └──┬────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
    ┌──────────────────┼─────────────────────┐
    │                  │                     │
┌───▼────────┐  ┌──────▼─────┐  ┌──────────▼──┐
│  RDS Prod  │  │   Redis    │  │ S3 (Files)  │
│(Multi-AZ)  │  │ (ElastiCache)
│   Backups  │  │   (3 nodes)│  │ (Encrypted) │
└────────────┘  └────────────┘  └─────────────┘
```

### Configuration ECS/ECR

**Fichier:** docker-compose.prod.yml

```yaml
version: '3.8'

services:
  app:
    image: Multi Convert:latest
    container_name: Multi Convert-app
    restart: always
    
    # Ressources limitées
    resources:
      limits:
        cpus: '1'
        memory: 2G
      reservations:
        cpus: '0.5'
        memory: 1G
    
    # Health check
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    
    environment:
      # Charger depuis AWS Secrets Manager (recommandé)
      NODE_ENV: production
      
    # Ne PAS exposer les ports directement
    # Utiliser ALB à la place
    ports:
      - "3000"
    
    # Logs vers CloudWatch
    logging:
      driver: awslogs
      options:
        awslogs-group: /ecs/Multi Convert
        awslogs-region: eu-west-1
        awslogs-stream-prefix: ecs

volumes:
  postgres_data:
    driver: local
```

---

## 🔐 Configuration Sécurité

### 1. SSL/TLS Certificate

**Provider:** AWS Certificate Manager (gratuit)

```bash
# Créer un certificat ACM
aws acm request-certificate \
  --domain-name Multi Convert.com \
  --subject-alternative-names www.Multi Convert.com api.Multi Convert.com \
  --region eu-west-1

# Attacher à ALB
# ALB > Listeners > Add listener
# Protocol: HTTPS, Port: 443, Certificate: ACM cert
# Redirect HTTP 80 -> HTTPS 443
```

### 2. Security Groups

```bash
# Application Security Group
aws ec2 create-security-group \
  --group-name Multi Convert-app \
  --description "Multi Convert Application" \
  --region eu-west-1

# Inbound Rules
aws ec2 authorize-security-group-ingress \
  --group-name Multi Convert-app \
  --protocol tcp --port 3000 \
  --source-security-group-name Multi Convert-alb

# Database Security Group
aws ec2 create-security-group \
  --group-name Multi Convert-db \
  --description "Multi Convert Database"

# Allow from app only
aws ec2 authorize-security-group-ingress \
  --group-name Multi Convert-db \
  --protocol tcp --port 5432 \
  --source-security-group-name Multi Convert-app
```

### 3. WAF (Web Application Firewall)

**AWS WAF Rules:**

```python
# Bloquer les payloads SQL injection
{
  "Name": "SQLiProtection",
  "Priority": 1,
  "Statement": {
    "ManagedRuleGroupStatement": {
      "Name": "AWSManagedRulesSQLiRuleSet",
      "VendorName": "AWS"
    }
  }
}

# Bloquer XSS
{
  "Name": "XSSProtection",
  "Priority": 2,
  "Statement": {
    "ManagedRuleGroupStatement": {
      "Name": "AWSManagedRulesKnownBadInputsRuleSet",
      "VendorName": "AWS"
    }
  }
}

# Rate limiting - 2000 requests per 5 minutes par IP
{
  "Name": "RateLimitProtection",
  "Priority": 3,
  "Statement": {
    "RateBasedStatement": {
      "Limit": 2000,
      "AggregateKeyType": "IP"
    }
  }
}

# Geo-blocking (optionnel, selon votre modèle)
{
  "Name": "GeoBlocking",
  "Priority": 4,
  "Statement": {
    "GeoMatchStatement": {
      "CountryCodes": ["IN", "CN", "RU"]  # À adapter
    }
  }
}
```

### 4. Secrets Manager

```bash
# Stocker les secrets sécurisés
aws secretsmanager create-secret \
  --name Multi Convert/prod/db-password \
  --secret-string "your-secure-password" \
  --region eu-west-1

# Rotation automatique
aws secretsmanager rotate-secret \
  --secret-id Multi Convert/prod/db-password \
  --rotation-rules AutomaticallyAfterDays=30
```

### 5. VPC Endpoint pour les Services AWS

```bash
# S3 Endpoint (éviter les sorties Internet)
aws ec2 create-vpc-endpoint \
  --vpc-id vpc-xxxxxxxx \
  --service-name com.amazonaws.eu-west-1.s3 \
  --route-table-ids rtb-xxxxxxxx

# Secrets Manager Endpoint
aws ec2 create-vpc-endpoint \
  --vpc-id vpc-xxxxxxxx \
  --vpc-endpoint-type Interface \
  --service-name com.amazonaws.eu-west-1.secretsmanager
```

---

## 📊 Monitoring & Alertes

### CloudWatch Dashboards

```json
{
  "DashboardName": "Multi Convert-Prod",
  "DashboardBody": {
    "widgets": [
      {
        "type": "metric",
        "properties": {
          "metrics": [
            ["AWS/ApplicationELB", "TargetResponseTime"],
            ["AWS/ApplicationELB", "HTTPCode_Target_5XX"],
            ["AWS/RDS", "DatabaseConnections"],
            ["AWS/RDS", "CPU Utilization"],
            ["AWS/ElastiCache", "CPUUtilization"],
            ["AWS/ElastiCache", "Evictions"]
          ],
          "period": 300,
          "stat": "Average",
          "region": "eu-west-1"
        }
      }
    ]
  }
}
```

### CloudWatch Alarms

```bash
# Erreurs 5XX élevées
aws cloudwatch put-metric-alarm \
  --alarm-name Multi Convert-5xx-high \
  --alarm-description "Alert if 5XX errors > 1% of requests" \
  --metric-name HTTPCode_Target_5XX \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 300 \
  --threshold 100 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:eu-west-1:ACCOUNT:Multi Convert-alerts

# CPU RDS élevée
aws cloudwatch put-metric-alarm \
  --alarm-name Multi Convert-rds-cpu \
  --metric-name CPUUtilization \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold

# Connexions DB élevées
aws cloudwatch put-metric-alarm \
  --alarm-name Multi Convert-db-connections \
  --metric-name DatabaseConnections \
  --namespace AWS/RDS \
  --threshold 40 \
  --comparison-operator GreaterThanThreshold
```

### Sentry Monitoring

```typescript
// src/lib/sentry-alerts.ts
import * as Sentry from "@sentry/nextjs";

// Alerter si taux d'erreur > 5%
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,
});
```

---

## 🗄️ Base de Données Backup & Restore

### Configuration RDS

```bash
# Backup automatique quotidien
aws rds modify-db-instance \
  --db-instance-identifier Multi Convert-prod \
  --backup-retention-period 30 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "sun:04:00-sun:05:00" \
  --enable-cloudwatch-logs-exports postgresql

# Snapshot quotidien supplémentaire
aws events put-rule \
  --name daily-db-snapshot \
  --schedule-expression "cron(0 5 * * ? *)"

# Test de restore tous les mois
# IMPORTANT: Tester réellement la restauration!
```

### Point-in-Time Recovery

```bash
# Restaurer à un moment précis
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier Multi Convert-restored \
  --db-snapshot-identifier Multi Convert-prod-2026-01-25 \
  --restore-time 2026-01-25T12:00:00Z
```

---

## 🚀 Processus de Déploiement

### CI/CD Pipeline (GitHub Actions)

**Fichier:** .github/workflows/deploy.yml

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm audit --audit-level=moderate
      - uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'

  deploy:
    needs: [tests, security-scan]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-west-1
      
      - run: |
          aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin $REGISTRY
          docker build -t $REGISTRY/$IMAGE_NAME:${{ github.sha }} .
          docker push $REGISTRY/$IMAGE_NAME:${{ github.sha }}
      
      - run: |
          aws ecs update-service \
            --cluster Multi Convert-prod \
            --service Multi Convert-app \
            --force-new-deployment
      
      - run: |
          aws ecs wait services-stable \
            --cluster Multi Convert-prod \
            --services Multi Convert-app
```

### Checklist de Déploiement

```bash
PRE-DEPLOYMENT CHECKS
□ Tous les tests passent
□ Lint passe sans erreurs
□ Build prod réussie
□ Aucun secret en dur
□ Variables d'env prod correctes
□ Migrations DB testées
□ Rollback plan documenté
□ On-call engineer alert
□ Slack notification en place

POST-DEPLOYMENT (dans les 10 minutes)
□ Health checks verts
□ Pas d'erreurs 5XX
□ Metrics normales (latency, CPU, DB)
□ Sentry pas d'alertes nouvelles
□ Un utilisateur test peut signup/login
□ Conversion de test réussie
□ Email de vérification reçu

MONITORING (Premier jour)
□ Error rate stable
□ Performance metrics OK
□ User feedback positif
□ Database connections stable
□ Aucune anomalie de sécurité
□ Logs collectés correctement
```

---

## 🔍 Post-Déploiement Monitoring

### Daily Health Checks

```bash
# Vérifier manuellement
curl -X GET https://api.Multi Convert.com/api/health

# Réponse attendue:
# {"status": "ok", "timestamp": "2026-01-25T12:00:00Z", "uptime": 3600}

# Tester signup
curl -X POST https://api.Multi Convert.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123!",
    "acceptTerms": true
  }'

# Tester conversion
curl -X POST https://api.Multi Convert.com/api/convert \
  -F "file=@test.pdf" \
  -F "outputFormat=docx"
```

### Incident Response

**Fichier:** docs/INCIDENT_RESPONSE.md

```markdown
## 🚨 INCIDENT RESPONSE PLAN

### Erreur 5XX - Trop d'erreurs
1. Vérifier CloudWatch logs
2. Vérifier RDS CPU/Connections
3. Vérifier les requêtes Sentry
4. Si DB: Aumenter connexions max
5. Si App: Redéployer dernière version stable
6. Si critique: Basculer sur standby (failover)

### Lenteur générale (Response time > 5s)
1. Vérifier cache Redis (free memory)
2. Vérifier requêtes N+1 en DB
3. Vérifier connexions database
4. Redémarrer ECS services
5. Augmenter instance RDS si nécessaire

### Attaque/Brute force
1. Vérifier CloudWatch metrics (5XX spikes)
2. Vérifier CloudFront/WAF logs
3. Augmenter WAF rate limiting
4. Bloquer IP suspects via WAF
5. Alerter l'équipe sécurité

### Base de données down
1. Vérifier multi-AZ failover (automate)
2. Si échec: Restaurer du snapshot
3. Notifier les utilisateurs
4. Vérifier logs de crash PostgreSQL
5. Post-mortem après restauration
```

---

## 📈 Scaling & Performance

### Auto-Scaling ECS

```bash
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name Multi Convert-asg \
  --desired-capacity 3 \
  --max-size 10 \
  --min-size 3 \
  --health-check-type ELB \
  --health-check-grace-period 300 \
  --launch-template LaunchTemplateName=Multi Convert-lt

# Scale up si CPU > 70%
aws autoscaling put-scaling-policy \
  --auto-scaling-group-name Multi Convert-asg \
  --policy-name scale-up \
  --policy-type TargetTrackingScaling \
  --target-tracking-configuration file://scale-up.json
```

### RDS Read Replicas

```bash
aws rds create-db-instance-read-replica \
  --db-instance-identifier Multi Convert-prod-replica \
  --source-db-instance-identifier Multi Convert-prod \
  --availability-zone eu-west-1b
```

---

## 💰 Coûts Estimés Mensuels

| Service | Config | Coût/mois |
|---------|--------|-----------|
| **RDS PostgreSQL** | db.t3.large, Multi-AZ, 100GB | $300 |
| **ElastiCache Redis** | cache.t3.medium, 3 nodes | $150 |
| **ECS/EC2** | 3x t3.large, auto-scaling | $500 |
| **ALB** | 1x ALB, 1GB processed | $50 |
| **S3** | 500GB storage, 1TB transfer | $150 |
| **CloudFront CDN** | 5TB/month distributed | $400 |
| **CloudWatch** | Logs, metrics, alarms | $100 |
| **Route 53** | 1 hosted zone | $0.50 |
| **Certificate Manager** | SSL (gratuit) | $0 |
| **Secrets Manager** | 1 secret, rotation | $10 |
| **Backup** | 30 days retention | $50 |
| **Miscellaneous** | Data transfer, misc | $100 |
| **TOTAL** | | **~$1,800/month** |

---

## ✅ Checklist Finale Avant Prod

- [ ] Tous les secrets générés et stockés dans Secrets Manager
- [ ] SSL/TLS A+ rating vérifié
- [ ] Cloudflare DDoS protection activée
- [ ] WAF rules configurées et testées
- [ ] RDS Multi-AZ activé
- [ ] Backups automatiques configurés (30j)
- [ ] CloudWatch dashboards créés
- [ ] Sentry project configuré
- [ ] CI/CD pipeline testée
- [ ] On-call rotation établie
- [ ] Runbook et playbooks documentés
- [ ] Incident response plan prêt
- [ ] Load test réussi (5000 req/s)
- [ ] Audit sécurité externe complété
- [ ] Compliance checks validés (RGPD, WCAG)
- [ ] Communication lanceurs prête
- [ ] Team training complété

---

**Vous êtes prêt pour un lancement MONDE en production! 🚀**
