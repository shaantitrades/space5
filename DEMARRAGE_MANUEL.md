# 🚀 DÉMARRAGE MANUEL - Sans installation complète

## Situation Actuelle

- Next.js est déjà installé dans `node_modules`
- Yarn/npm bloquent lors de l'installation complète
- Solution : démarrer directement avec Next.js

## ✅ Commande pour Démarrer

Dans PowerShell, dans `E:\space 5` :

```powershell
node node_modules\next\dist\bin\next dev
```

Cette commande démarre Next.js directement sans passer par npm ou yarn.

## Alternative

Si la commande ci-dessus ne fonctionne pas :

```powershell
# Créer un fichier de démarrage simple
$content = @"
const { spawn } = require('child_process');
const path = require('path');

const nextPath = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');
const proc = spawn('node', [nextPath, 'dev'], {
  stdio: 'inherit',
  cwd: __dirname
});

proc.on('exit', code => process.exit(code));
"@

Set-Content -Path "start-server.js" -Value $content

# Puis démarrer avec :
node start-server.js
```

## Si des dépendances manquent

Si le serveur démarre mais affiche des erreurs de modules manquants, installez-les un par un :

```powershell
# Exemple pour installer une dépendance spécifique
npm install nom-du-module --legacy-peer-deps --no-audit --no-fund
```

## Vérification

Une fois démarré, vous devriez voir :
```
✓ Ready on http://localhost:3000
```

Ouvrez : http://localhost:3000/en

---

**Essayez d'abord : `node node_modules\next\dist\bin\next dev`** 🚀
