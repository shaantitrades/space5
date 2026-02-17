# Configuration et Déploiement Firebase Hosting

## 📋 Prérequis

1. **Compte Google/Firebase** - Créer un compte sur [Firebase Console](https://console.firebase.google.com)
2. **Node.js et npm** - Déjà installés dans votre projet
3. **Firebase CLI** - À installer globalement

## 🚀 Étape 1: Installer Firebase CLI

Exécutez cette commande dans PowerShell (admin):

```powershell
npm install -g firebase-tools
```

Vérifiez l'installation:
```powershell
firebase --version
```

## 🔐 Étape 2: Authentifier Firebase

```powershell
firebase login
```

Cela ouvrira votre navigateur pour vous connecter à votre compte Google.

## 🎯 Étape 3: Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com)
2. Cliquez sur **+ Créer un projet**
3. Entrez le nom du projet (ex: `multi-convert`)
4. Acceptez les conditions et cliquez **Créer un projet**
5. Attendez 1-2 minutes que le projet soit créé

## ⚙️ Étape 4: Configurer le projet localement

Une fois le projet Firebase créé, vous aurez un **ID de projet** (ex: `multi-convert-abc123`).

### Option A: Initialisation manuelle

1. Copiez le fichier `.firebaserc.example` et renommez-le en `.firebaserc`:
```powershell
Copy-Item ".firebaserc.example" ".firebaserc"
```

2. Ouvrez `.firebaserc` et remplacez `VOTRE-PROJET-ID-FIREBASE` par votre ID réel

### Option B: Initialisation interactive (recommandée)

```powershell
firebase init hosting
```

Répondez aux questions:
- **Project**: Sélectionnez votre projet Firebase
- **Public directory**: Tapez `.next/standalone/public`
- **Configure as single-page app**: Tapez `n` (Non)
- **Overwrite firebase.json**: Tapez `n` (Non, car nous l'avons déjà configuré)

## 📦 Étape 5: Ajouter les scripts NPM

Votre `package.json` devrait avoir les scripts suivants (vérifiez):

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "firebase:deploy": "npm run build && firebase deploy --only hosting"
  }
}
```

Si ce n'est pas présent, ajoutez la ligne `firebase:deploy`.

## 🚀 Étape 6: Déployer l'application

### Option 1: Script PowerShell automatisé

```powershell
.\deploy-firebase.ps1
```

Ce script fait les étapes suivantes automatiquement:
- Compile votre application Next.js
- Déploie sur Firebase Hosting
- Affiche l'URL publique

### Option 2: Commandes manuelles

```powershell
# Construire l'application
npm run build

# Déployer
firebase deploy --only hosting
```

## ✅ Vérification du déploiement

Une fois le déploiement terminé, vous verrez:
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/YOUR-PROJECT-ID/overview
Hosting URL: https://your-project.web.app
```

Visitez l'URL donnée pour voir votre application en ligne!

## 🔧 Configuration avancée

### Variables d'environnement Firebase

Pour utiliser les variables d'environnement en production:

```powershell
firebase functions:config:set stripe.secret_key="sk_live_..."
firebase deploy --only functions
```

### Règles de sécurité

Firebase `.firebaserc` gère plusieurs projectsparallèlement:

```json
{
  "projects": {
    "default": "multi-convert-prod",
    "staging": "multi-convert-staging"
  }
}
```

Pour déployer sur un projet spécifique:
```powershell
firebase deploy --only hosting -P staging
```

## 🐛 Dépannage

### Erreur: "Invalid project name"
- Vérifiez le projectId dans `.firebaserc`
- S'assurer que le projet existe dans Firebase Console

### Erreur: "Permission denied"
- Réauthentifiez: `firebase logout` puis `firebase login`

### Erreur: "Public folder not found"
- Vérifiez que le dossier `.next/standalone/public` existe après `npm run build`

## 📋 Configuration fichiers

### firebase.json
Définit les règles d'hébergement, cache, redirections, etc.

### .firebaserc
Contient l'ID du projet Firebase (à remplir)

### deploy-firebase.ps1
Script automatisé pour builder et déployer

## 🎓 Prochaines étapes

1. **Domaine personnalisé**: Dans Firebase Console > Hosting > Connecter un domaine
2. **SSL/TLS**: Automatique avec Firebase Hosting
3. **Analytics**: Ajouter Google Analytics pour tracker les utilisateurs
4. **Performance Monitoring**: Monitorer les performances en production

---

📚 Documentation officielle: https://firebase.google.com/docs/hosting
