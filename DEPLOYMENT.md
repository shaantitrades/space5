# 🚀 Guide de Déploiement - Multi Convert

## Prérequis

- Node.js 20+ (recommandé: v24.12.0)
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optionnel)

## Installation Locale

### 1. Cloner et installer les dépendances

```bash
npm install
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Éditer `.env.local` avec vos clés :
- `DATABASE_URL` : URL de connexion PostgreSQL
- `REDIS_URL` : URL de connexion Redis
- `STRIPE_SECRET_KEY` : Clé secrète Stripe
- `UPLOADTHING_SECRET` : Clé secrète UploadThing
- `ENCRYPTION_KEY` : Clé de chiffrement (32 caractères)
- `JWT_SECRET` : Secret JWT

### 3. Initialiser la base de données

```bash
# Créer la base de données
createdb Multi Convert

# Exécuter les migrations (à créer)
npm run migrate
```

### 4. Lancer Redis

```bash
# Avec Docker
docker run -d -p 6379:6379 redis:7-alpine

# Ou installer Redis localement
redis-server
```

### 5. Lancer l'application

```bash
# Mode développement
npm run dev

# Mode production
npm run build
npm start
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## Déploiement avec Docker

### 1. Construire et lancer avec Docker Compose

```bash
docker-compose up -d
```

### 2. Vérifier les logs

```bash
docker-compose logs -f app
```

### 3. Arrêter les services

```bash
docker-compose down
```

## Déploiement Production

### Vercel (Recommandé pour Next.js)

1. Connecter votre repository GitHub à Vercel
2. Configurer les variables d'environnement dans Vercel
3. Déployer automatiquement

### AWS / GCP / Azure

1. Construire l'image Docker
2. Déployer sur Kubernetes ou ECS
3. Configurer les variables d'environnement
4. Configurer le load balancer et CDN (Cloudflare)

## Configuration Sécurité

### Cloudflare (Recommandé)

1. Ajouter votre domaine à Cloudflare
2. Configurer les règles WAF
3. Activer DDoS Protection
4. Configurer les headers de sécurité

### Variables d'environnement critiques

- `ENCRYPTION_KEY` : Générer avec `openssl rand -base64 32`
- `JWT_SECRET` : Générer avec `openssl rand -base64 32`
- `DATABASE_URL` : Utiliser SSL en production
- `REDIS_URL` : Utiliser Redis avec authentification

## Monitoring

### Health Check

L'endpoint `/api/health` permet de vérifier l'état de l'application.

### Logs

Les logs de sécurité sont envoyés à la console. En production, configurer :
- Sentry pour les erreurs
- ELK Stack pour les logs
- Grafana pour les métriques

## Support

Pour toute question, consulter la documentation ou contacter l'équipe.
