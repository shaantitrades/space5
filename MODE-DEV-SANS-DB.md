# Mode Développement Sans Base de Données

## ✅ Configuration Active

Le mode dev est maintenant activé. Vous pouvez tester l'authentification sans PostgreSQL.

## 📋 Fichiers Créés

### 1. `.env.development`
```env
DEV_MODE=true
SKIP_DB=true
```

### 2. `src/lib/dev-auth.ts`
Système d'authentification en mémoire pour le développement.

### 3. Routes API modifiées
- `src/app/api/auth/signup/route.ts` ✅
- `src/app/api/auth/login/route.ts` ✅

## 🧪 Compte de Test Disponible

**Email:** test@multi-convert.com  
**Mot de passe:** Test1234!@#$

## 🎯 Comment Tester

### 1. Redémarrer le serveur
```powershell
# Arrêter le serveur actuel (Ctrl+C)
npm run dev
```

### 2. Créer un nouveau compte
- Aller sur http://localhost:3000/fr/signup
- Remplir le formulaire
- ✅ L'inscription fonctionne sans DB!

### 3. Se connecter
- Aller sur http://localhost:3000/fr/login
- Utiliser le compte test ou votre nouveau compte
- ✅ La connexion fonctionne!

## 🔍 Fonctionnalités du Mode Dev

### ✅ Ce qui fonctionne:
- Inscription (signup)
- Connexion (login)
- Token JWT simplifié
- Session en mémoire
- Validation des formulaires
- Vérification automatique des emails (pas besoin d'email en dev)

### ⚠️ Limitations:
- **Données perdues au redémarrage du serveur**
- **Mots de passe en clair** (uniquement en dev!)
- Pas d'historique des conversions
- Pas de crédits persistants
- Pas de reset mot de passe par email

## 🚀 Console Dev

Vous verrez ces logs dans le terminal:
```
🔧 [DEV MODE] Inscription sans base de données
👤 [DEV] Utilisateur créé: votre@email.com
✅ [DEV] Login réussi: votre@email.com
```

## 🔄 Passer en Mode Production

Quand vous installez PostgreSQL:

1. Créer `.env.local`:
```env
DEV_MODE=false
DATABASE_URL="postgresql://..."
```

2. Le système utilisera automatiquement la vraie DB

## 📊 Utilisateurs en Mémoire

Tous les comptes créés sont stockés dans `devUsers` (Map JavaScript).
Réinitialisés à chaque redémarrage du serveur.

## ⏭️ Prochaines Étapes

1. ✅ Redémarrer le serveur
2. ✅ Tester signup/login
3. ✅ Tester les formulaires
4. 📅 Plus tard: Installer PostgreSQL pour production
