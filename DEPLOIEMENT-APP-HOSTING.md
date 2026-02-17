# 🚀 GUIDE DÉPLOIEMENT FIREBASE APP HOSTING

## ✅ Configuration terminée

Votre application est maintenant configurée pour **Firebase App Hosting** (Next.js fullstack).

## 📋 Fichiers de configuration

- ✅ `apphosting.yaml` - Configuration App Hosting avec **toutes vos variables d'environnement**
- ✅ `firebase.json` - Configuration Firebase
- ✅ `.firebaserc` - Projet Firebase (convert-multimedia)
- ✅ `SECRETS-CONFIGURATION.md` - Guide détaillé des secrets
- ✅ `configure-secrets.ps1` - Script automatique de configuration

## 🔐 **ÉTAPE CRITIQUE : Configuration des Secrets**

### ⚠️ IMPORTANT AVANT DE DÉPLOYER

Votre `apphosting.yaml` contient des références à des **secrets** qui doivent être configurés dans Firebase Console. **Ces secrets ne sont PAS dans le fichier** (pour la sécurité).

### Option A : Configuration Automatique (Recommandé)

```bash
# Exécutez le script qui lit votre .env.local et configure Firebase
.\configure-secrets.ps1
```

Le script :
1. ✅ Lit automatiquement `.env.local`
2. ✅ Détecte tous les secrets nécessaires
3. ✅ Les configure dans Firebase via CLI
4. ⚠️ Vous demande confirmation avant chaque action

### Option B : Configuration Manuelle

Consultez [SECRETS-CONFIGURATION.md](SECRETS-CONFIGURATION.md) pour la liste complète et les instructions détaillées.

**Résumé des secrets requis :**
- `DATABASE_URL` - Supabase pooler connection
- `DIRECT_URL` - Supabase direct connection (migrations)
- `SUPABASE_SERVICE_ROLE_KEY` - Clé admin
- `REDIS_URL` - Cache Redis (Upstash recommandé)
- `STRIPE_SECRET_KEY` - Paiements (clé LIVE)
- `ENCRYPTION_KEY`, `JWT_SECRET`, `NEXTAUTH_SECRET` - Sécurité
- Et autres...

📖 **Guide complet** : [SECRETS-CONFIGURATION.md](SECRETS-CONFIGURATION.md)

## 🔧 Prérequis

1. **Firebase CLI installé et authentifié**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Backend App Hosting créé dans Firebase Console**
   - Allez sur https://console.firebase.google.com/project/convert-multimedia
   - Section "App Hosting" dans le menu
   - Créez un backend si pas encore fait

## 🚀 Déploiement

### Option 1 : Via Firebase Console (Recommandé)
1. Connectez votre repo GitHub dans Firebase Console
2. Firebase déclenchera automatiquement le build à chaque push

### Option 2 : Via CLI
```bash
# Depuis la racine du projet
firebase apphosting:backends:create --project convert-multimedia

# Pour créer un rollout manuel
firebase apphosting:rollouts:create YOUR_BACKEND_ID --project convert-multimedia
```

## 🔐 Variables d'environnement

### ✅ Déjà configurées dans apphosting.yaml

**Variables publiques (safe) :**
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - URL Supabase
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Clé publique Supabase
- ✅ `NODE_ENV=production`
- ✅ `DEV_MODE=false`
- ✅ `SKIP_DB=false` (base de données activée)

**⚠️ Variables secrètes (à configurer) :**
- Toutes les autres variables marquées `secret:` dans `apphosting.yaml`
- Voir [SECRETS-CONFIGURATION.md](SECRETS-CONFIGURATION.md) pour la liste complète

### 🤖 Configuration Automatique

```bash
# Script PowerShell qui configure automatiquement depuis .env.local
.\configure-secrets.ps1
```

### 🖱️ Configuration Manuelle (Firebase Console)

1. Allez dans Firebase Console > App Hosting > Votre backend
2. Onglet "Environment variables"
3. Pour chaque secret dans [SECRETS-CONFIGURATION.md](SECRETS-CONFIGURATION.md) :
   - Cliquez "Add variable"
   - Type : **"Secret"**
   - Name : Le nom exact (ex: `DATABASE_URL`)
   - Value : La valeur de votre `.env.local`
   - Availability : `RUNTIME` et/ou `BUILD`
   - Save

### ⚠️ PRODUCTION : Générer de Nouvelles Clés

**Ne réutilisez PAS les clés de développement !**

```bash
# Générer une nouvelle clé sécurisée
openssl rand -base64 32

# Générez 3 clés différentes pour :
# - ENCRYPTION_KEY
# - JWT_SECRET  
# - NEXTAUTH_SECRET
```

## 📊 Monitoring

Une fois déployé, surveillez :
- **Logs** : Firebase Console > App Hosting > Logs
- **Monitoring** : Cloud Console > Cloud Run
- **Performance** : Firebase Console > Performance Monitoring

## ⚠️ Points importants

1. **Build Success** : Les 3 erreurs critiques ont été corrigées :
   - ✅ Syntaxe site.ts (double virgule)
   - ✅ Export manquant tools.ts
   - ✅ Import magic-bytes.js

2. **ESLint Warnings** : Ne bloquent plus le build (ignoreDuringBuilds: true)

3. **Ressources** :
   - CPU : 1 vCPU
   - RAM : 512 MB
   - Scaling : 0-4 instances (économique)

## 🔄 Prochains déploiements

Après le premier déploiement :
```bash
# Push sur GitHub déclenche automatiquement le build
git push origin main

# OU déploiement manuel
firebase apphosting:rollouts:create YOUR_BACKEND_ID
```

## 📚 Documentation

- [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)
- [Next.js sur App Hosting](https://firebase.google.com/docs/app-hosting/frameworks/nextjs)
- [Configuration apphosting.yaml](https://firebase.google.com/docs/app-hosting/configure)

## 🆘 En cas de problème

1. Vérifiez les logs dans Firebase Console
2. Testez le build localement : `npm run build`
3. Vérifiez les variables d'environnement requises
4. Consultez : https://firebase.google.com/support

---

**Note** : Le premier déploiement peut prendre 5-10 minutes. Les suivants sont plus rapides grâce au cache.
