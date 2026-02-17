# 🔐 CONFIGURATION DES SECRETS FIREBASE APP HOSTING

## ⚠️ IMPORTANT : SECRETS À CONFIGURER

Les variables marquées avec `secret:` dans `apphosting.yaml` doivent être configurées dans **Firebase Console** pour la sécurité. **NE JAMAIS** commiter les vraies valeurs dans Git.

## 📋 Liste des Secrets à Configurer

### 1. 🗄️ Base de Données Supabase

```bash
# DATABASE_URL - Connexion poolée pour l'app (Supabase Transaction pooling port 6543)
DATABASE_URL="postgresql://postgres.poilochddyciosejieyy:Hababaumri11@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# DIRECT_URL - Connexion directe pour les migrations Prisma (port 5432)
DIRECT_URL="postgresql://postgres:Hababaumri11@db.poilochddyciosejieyy.supabase.co:5432/postgres"

# SUPABASE_SERVICE_ROLE_KEY - Clé admin Supabase (NE PAS EXPOSER)
SUPABASE_SERVICE_ROLE_KEY="sb_secret_0HZWpwOmvkBRUeOiRWHcXw_yM6EBTgz"
```

### 2. 🔴 Redis (Cache & Rate Limiting)

```bash
# REDIS_URL - Upstash Redis ou autre provider
# Pour production, utilisez Upstash Redis (gratuit jusqu'à 10k requêtes/jour)
# https://console.upstash.com/ → Create Database → Copy REST URL
REDIS_URL="rediss://default:YOUR_PASSWORD@YOUR_HOST.upstash.io:6379"
```

**Alternative locale** : Si vous n'utilisez pas Redis en prod, commentez dans `apphosting.yaml`

### 3. 💳 Stripe (Paiements)

```bash
# Clés de PRODUCTION Stripe (pas les clés test)
# https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY="sk_live_VOTRE_CLE_LIVE"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_VOTRE_CLE_PUBLIQUE_LIVE"
```

### 4. 📤 UploadThing (Upload de fichiers)

```bash
# https://uploadthing.com/dashboard
UPLOADTHING_SECRET="sk_live_VOTRE_CLE"
UPLOADTHING_APP_ID="VOTRE_APP_ID"
```

### 5. 🔐 Clés de Sécurité (GÉNÉRER DES NOUVELLES EN PRODUCTION)

```bash
# Générer avec : openssl rand -base64 32

ENCRYPTION_KEY="GENERER_UNE_CLE_ALEATOIRE_32_CHARS_MINIMUM"
JWT_SECRET="GENERER_UNE_CLE_ALEATOIRE_32_CHARS_MINIMUM"
NEXTAUTH_SECRET="GENERER_UNE_CLE_ALEATOIRE_32_CHARS_MINIMUM"
```

**⚠️ NE PAS RÉUTILISER LES CLÉS DE DEV EN PRODUCTION**

### 6. 🔑 Google OAuth (si authentification Google utilisée)

```bash
# Créer un projet OAuth : https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID="VOTRE_CLIENT_ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="VOTRE_CLIENT_SECRET"
```

### 7. ☁️ AWS S3 (si utilisé - optionnel)

```bash
AWS_ACCESS_KEY_ID="VOTRE_ACCESS_KEY"
AWS_SECRET_ACCESS_KEY="VOTRE_SECRET_KEY"
AWS_S3_BUCKET="votre-bucket-name"
```

### 8. 📧 SMTP Email (si utilisé - optionnel)

```bash
SMTP_HOST="smtp.example.com"
SMTP_USER="votre@email.com"
SMTP_PASSWORD="votre_mot_de_passe"
```

---

## 🚀 COMMENT CONFIGURER DANS FIREBASE CONSOLE

### Méthode 1 : Via Firebase Console (Recommandé)

1. **Accédez à Firebase Console**
   ```
   https://console.firebase.google.com/project/convert-multimedia/apphosting
   ```

2. **Sélectionnez votre backend** (ex: `space5`)

3. **Allez dans l'onglet "Environment variables"**

4. **Ajoutez chaque secret :**
   - Cliquez sur **"Add variable"**
   - Type : **"Secret"** (pas "Environment variable")
   - Name : Le nom exact (ex: `DATABASE_URL`)
   - Value : La vraie valeur de votre `.env.local`
   - Availability : 
     - **RUNTIME** : Variable disponible quand l'app tourne
     - **BUILD** : Variable disponible pendant `npm run build`
   - Cliquez **"Save"**

5. **Redéployez** après avoir ajouté tous les secrets

### Méthode 2 : Via Firebase CLI

```bash
# Format : firebase apphosting:secrets:set <SECRET_NAME> --data-file <file> --project convert-multimedia

# Exemple pour DATABASE_URL
echo "postgresql://postgres.poilochddyciosejieyy:Hababaumri11@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true" > /tmp/db_url.txt
firebase apphosting:secrets:set DATABASE_URL --data-file /tmp/db_url.txt --project convert-multimedia
rm /tmp/db_url.txt
```

---

## ✅ CHECKLIST AVANT DÉPLOIEMENT

- [ ] DATABASE_URL configuré
- [ ] DIRECT_URL configuré (pour migrations Prisma)
- [ ] SUPABASE_SERVICE_ROLE_KEY configuré
- [ ] REDIS_URL configuré (ou commenté si non utilisé)
- [ ] STRIPE_SECRET_KEY configuré (clé LIVE)
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY configuré
- [ ] UPLOADTHING_SECRET configuré
- [ ] UPLOADTHING_APP_ID configuré
- [ ] ENCRYPTION_KEY généré et configuré (nouvelle clé !)
- [ ] JWT_SECRET généré et configuré (nouvelle clé !)
- [ ] NEXTAUTH_SECRET généré et configuré (nouvelle clé !)
- [ ] GOOGLE_CLIENT_ID configuré (si OAuth Google utilisé)
- [ ] GOOGLE_CLIENT_SECRET configuré (si OAuth Google utilisé)
- [ ] NEXT_PUBLIC_APP_URL mis à jour avec l'URL Firebase réelle

---

## 🔄 Après Configuration

1. **Vérifiez** que tous les secrets sont bien enregistrés dans Firebase Console

2. **Mettez à jour NEXT_PUBLIC_APP_URL** dans `apphosting.yaml` :
   ```yaml
   - variable: NEXT_PUBLIC_APP_URL
     value: "https://space5-VOTRE_ID_REEL.web.app"
   ```

3. **Commitez et pushez** pour déclencher un nouveau build :
   ```bash
   git add apphosting.yaml
   git commit -m "Configure environment variables"
   git push origin main
   ```

4. **Surveillez le build** dans Firebase Console

---

## 🛡️ SÉCURITÉ

### ✅ BONNES PRATIQUES

- ✅ Utilisez des **secrets Firebase** pour toutes les valeurs sensibles
- ✅ Générez de **nouvelles clés de sécurité** pour la production (pas les clés dev)
- ✅ Utilisez les **clés LIVE Stripe** (pas test)
- ✅ Activez **2FA** sur tous vos comptes de services (Stripe, Supabase, etc.)
- ✅ Auditez régulièrement les accès aux secrets

### ❌ À NE JAMAIS FAIRE

- ❌ Commiter les secrets dans Git
- ❌ Réutiliser les clés de développement en production
- ❌ Partager les secrets par email/Slack
- ❌ Mettre les secrets en clair dans `apphosting.yaml`

---

## 🆘 PROBLÈMES COURANTS

### Erreur : "Missing environment variable DATABASE_URL"
→ Le secret n'est pas configuré dans Firebase Console ou mal nommé

### Erreur : "Cannot connect to database"
→ Vérifiez l'URL de connexion (pooler vs direct)
→ Vérifiez les credentials Supabase

### Erreur : "Invalid publishable key"
→ Vérifiez que vous utilisez la bonne clé Stripe (live vs test)

### Build réussit mais app crash au runtime
→ Une variable marquée `RUNTIME` n'est pas configurée

---

## 📚 Ressources

- [Firebase App Hosting - Environment Variables](https://firebase.google.com/docs/app-hosting/configure)
- [Supabase - Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Stripe - API Keys](https://stripe.com/docs/keys)
- [Upstash Redis](https://upstash.com/)

---

**Note** : Conservez une copie sécurisée de tous vos secrets (gestionnaire de mots de passe, coffre-fort Cloud, etc.)
