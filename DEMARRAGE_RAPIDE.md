# ⚡ DÉMARRAGE RAPIDE - Solution Immédiate

## 🎯 Si npm install prend des heures

### Solution IMMÉDIATE : Installer seulement Next.js

Dans PowerShell :

```powershell
npm install next@14.2.0 react@18.3.0 react-dom@18.3.0 --legacy-peer-deps --save-exact --no-audit --no-fund
```

**Cette commande installe SEULEMENT Next.js et React** (pas toutes les dépendances).

**Temps : 1-2 minutes maximum**

### Puis démarrer :

```powershell
$env:NEXT_DISABLE_TURBO='1'
npx next dev --no-turbo
```

## ✅ Alternative : Yarn (PLUS RAPIDE)

Si npm est trop lent, utilisez Yarn :

```powershell
# 1. Installer Yarn (une seule fois)
npm install -g yarn

# 2. Installer les dépendances (beaucoup plus rapide que npm)
yarn install

# 3. Démarrer
yarn dev
```

**Yarn est généralement 2-3x plus rapide que npm.**

## 🚀 Solution ULTIME : pnpm

Si Yarn ne fonctionne pas non plus :

```powershell
# 1. Installer pnpm
npm install -g pnpm

# 2. Installer les dépendances
pnpm install

# 3. Démarrer
pnpm dev
```

---

**Essayez d'abord l'installation rapide de Next.js seulement, puis Yarn si ça ne fonctionne pas !** ⚡
