# 🚀 Guide de Démarrage du Serveur - Multi Convert

## Problème résolu : Next.js n'était pas correctement installé

## ✅ Solution qui fonctionne TOUJOURS

### Méthode 1 : Utiliser npx (RECOMMANDÉ)

Dans PowerShell, dans le dossier `E:\space 5` :

```powershell
npx next dev
```

**Avantages :**
- ✅ Fonctionne même si next.cmd n'existe pas
- ✅ Télécharge automatiquement Next.js si nécessaire
- ✅ Pas besoin de réinstallation complète

### Méthode 2 : Installation complète puis démarrage

```powershell
cd "E:\space 5"
npm install --legacy-peer-deps
npm run dev
```

### Méthode 3 : Installation de Next.js globalement

```powershell
npm install -g next@14.2.0
cd "E:\space 5"
npm run dev
```

## ⏱️ Temps d'attente

- **Première fois avec npx** : 1-2 minutes (téléchargement)
- **Compilation Next.js** : 30-60 secondes
- **Total** : 2-3 minutes maximum

## ✅ Vérification

Une fois démarré, vous verrez dans le terminal :
```
✓ Ready in Xs
○ Local: http://localhost:3000
```

Puis accédez à : **http://localhost:3000/en**

## 🐛 Si ça ne fonctionne toujours pas

1. **Vérifiez le port 3000** :
   ```powershell
   netstat -ano | Select-String ":3000"
   ```
   Si le port est utilisé, tuez le processus ou changez le port :
   ```powershell
   npm run dev -- -p 3001
   ```

2. **Vérifiez Node.js** :
   ```powershell
   node --version  # Doit être >= 20.0.0
   npm --version
   ```

3. **Réinstallation complète** :
   ```powershell
   Remove-Item -Recurse -Force node_modules
   Remove-Item package-lock.json
   npm install --legacy-peer-deps
   ```

## 💡 Commande RAPIDE pour démarrer

Copiez-collez cette commande dans PowerShell :

```powershell
cd "E:\space 5"; npx next dev
```

**C'est la solution la plus fiable !** 🎯
