# 🚀 Guide de Démarrage Rapide - Multi Convert

## Installation en 5 minutes

### 1️⃣ Installer les dépendances

```bash
npm install
```

### 2️⃣ Configurer l'environnement

Le fichier `.env.local` a été créé automatiquement. Pour le développement local, vous pouvez utiliser les valeurs par défaut.

**⚠️ Important pour la production :**
- Changez `ENCRYPTION_KEY` et `JWT_SECRET` par des valeurs sécurisées
- Ajoutez vos clés Stripe, UploadThing, etc.

### 3️⃣ Démarrer PostgreSQL et Redis

**Option A : Avec Docker (Recommandé)**
```bash
docker-compose up -d postgres redis
```

**Option B : Installation locale**
- Installez PostgreSQL et Redis sur votre machine
- Configurez les URLs dans `.env.local`

### 4️⃣ Initialiser la base de données (Optionnel)

Si vous utilisez PostgreSQL :
```bash
# Créer la base de données
createdb Multi Convert

# Initialiser le schéma
npm run db:init
```

### 5️⃣ Vérifier la configuration

```bash
npm run setup
```

### 6️⃣ Lancer l'application

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🎯 Test Rapide

1. **Page d'accueil** : http://localhost:3000/en (ou /fr, /de)
2. **Conversion** : http://localhost:3000/en/convert
3. **Pricing** : http://localhost:3000/en/pricing
4. **Health Check** : http://localhost:3000/api/health

## 🔧 Commandes Utiles

```bash
# Développement
npm run dev              # Lancer le serveur de développement
npm run build            # Construire pour la production
npm run start            # Lancer en mode production

# Qualité de code
npm run lint             # Vérifier le code
npm run type-check       # Vérifier les types TypeScript
npm run format           # Formater le code

# Docker
npm run docker:up        # Démarrer les services Docker
npm run docker:down      # Arrêter les services Docker
npm run docker:logs      # Voir les logs Docker

# Configuration
npm run setup            # Vérifier la configuration
npm run db:init          # Initialiser la base de données
```

## 🐛 Dépannage

### Erreur "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erreur de connexion PostgreSQL
- Vérifiez que PostgreSQL est démarré : `docker ps`
- Vérifiez `DATABASE_URL` dans `.env.local`

### Erreur de connexion Redis
- Vérifiez que Redis est démarré : `docker ps`
- Vérifiez `REDIS_URL` dans `.env.local`

### Port 3000 déjà utilisé
```bash
# Changer le port dans package.json
"dev": "next dev -p 3001"
```

## 📚 Documentation Complète

- `README.md` - Documentation principale
- `DEPLOYMENT.md` - Guide de déploiement
- `PROJECT_STRUCTURE.md` - Structure du projet

## ✅ Checklist de Démarrage

- [ ] Node.js 20+ installé
- [ ] Dépendances installées (`npm install`)
- [ ] `.env.local` configuré
- [ ] PostgreSQL et Redis démarrés
- [ ] Base de données initialisée (optionnel)
- [ ] Application lancée (`npm run dev`)
- [ ] Site accessible sur http://localhost:3000

---

**Besoin d'aide ?** Consultez la documentation ou ouvrez une issue.
