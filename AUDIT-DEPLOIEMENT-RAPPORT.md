# 🔴 AUDIT COMPLET MULTI CONVERT — ÉCHEC DE DÉPLOIEMENT

Date: 14 Juin 2026
Projet: shaantitrades/space5 (multi-convert)
Déploiement: Coolify → localhost
Statut: **FAILED — exit code 1 at `RUN npm run build` (Dockerfile line 53)**

---

## 🔍 RÉSUMÉ EXÉCUTIF

Le déploiement échoue pendant la phase de build (`npm run build`). Plusieurs problèmes critiques et de gravité moyenne ont été identifiés. Le problème **#1 est la cause racine la plus probable**.

---

## 🚨 PROBLÈME #1 (CRITIQUE) — `package-lock.json` ABSENT

**Fichier:** Racine du projet  
**Sévérité:** 🔴 CRITIQUE  
**Impact:** Build Docker non-déterministe, échec aléatoire

### Constat
Le fichier `package-lock.json` n'existe pas dans le projet. Le Dockerfile ligne 13 utilise:
```dockerfile
COPY package.json package-lock.json* ./
```
Le glob `*` rend le lockfile optionnel, donc `npm install` génère un nouveau `node_modules` à chaque build sans garantir la reproductibilité.

### Conséquence
- `npm install --legacy-peer-deps` résout les dépendances **différemment** à chaque exécution
- Le `next` package peut être résolu à une version incompatible avec les autres dépendances
- Les sous-dépendances natives (`sharp`, `prisma`, `tesseract.js`) peuvent télécharger des binaires incompatibles avec Alpine Linux
- **Le build fonctionne parfois, échoue d'autres fois** — comportement typique d'absence de lockfile

### Preuve locale
Sur la machine locale (Windows, Node v24.15.0):
- `npm list next` affiche: `next@ invalid: "^14.2.0"` 
- Le répertoire `node_modules/next/dist/bin` **n'existe pas** → le CLI Next.js est cassé
- `node node_modules/next/dist/bin/next build` → `MODULE_NOT_FOUND`

### ✅ Solution
```bash
# Utiliser Node.js v20 (dans la plage autorisée)
nvm install 20
nvm use 20
# Supprimer node_modules et réinstaller
rm -rf node_modules
npm install --legacy-peer-deps
# Vérifier que le lockfile est créé
ls -la package-lock.json
```

---

## 🚨 PROBLÈME #2 (CRITIQUE) — Version Node.js incompatible

**Fichier:** `package.json` (ligne 110-112)  
**Sévérité:** 🔴 CRITIQUE  
**Impact:** Installation corrompue des dépendances

### Constat
```json
"engines": {
  "node": ">=20.0.0 <23"
}
```
- La machine locale utilise **Node.js v24.15.0** (hors plage)
- Le Dockerfile utilise `node:20-alpine` (dans la plage) ✅
- MAIS: le lockfile est généré localement avec Node v24, puis le Dockerfile utilise Node v20 → **incompatibilité potentielle des binaires natifs**

### Conséquence
Les packages avec binaires natifs (`sharp`, `prisma`, `@ffmpeg-installer/ffmpeg`) sont compilés pour la plateforme locale. Quand Docker (Alpine Linux) essaie d'utiliser ces binaires, ils peuvent être incompatibles.

### ✅ Solution
1. Installer Node.js v20 localement
2. Ou mettre à jour les engines: `"node": ">=20.0.0 <25"` pour supporter Node 24
3. Régénérer le lockfile avec Node v20

---

## 🚨 PROBLÈME #3 (CRITIQUE) — `docker-compose.coolify.yml` sans PostgreSQL

**Fichier:** `docker-compose.coolify.yml`  
**Sévérité:** 🔴 CRITIQUE  
**Impact:** L'application ne peut pas démarrer après le build (même si le build réussit)

### Constat
- `docker-compose.yml` (complet): 3 services → `app` + `postgres` + `redis` ✅
- `docker-compose.coolify.yml` (Coolify): 2 services → `app` + `redis` ❌ (pas de postgres!)

### Conséquence
Le `docker-entrypoint.sh` tente:
```bash
until npx prisma db push --skip-generate 2>/dev/null; do
  echo "La base de données n'est pas encore prête..."
  sleep 5
done
```
→ Boucle infinie car aucune base de données n'est disponible.

### ✅ Solution
Ajouter le service PostgreSQL dans `docker-compose.coolify.yml`:
```yaml
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-multi_convert}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - internal
```
Et ajouter `postgres_data` aux volumes et la dépendance dans le service `app`.

---

## 🟡 PROBLÈME #4 (GRAVITÉ MOYENNE) — Prisma Client mocké en `any` casté en `PrismaClient`

**Fichier:** `src/lib/prisma.ts` (ligne 57)  
**Sévérité:** 🟡 MOYENNE  
**Impact:** TypeScript compile mais runtime imprévisible

### Constat
```typescript
export const prisma = prismaInstance as PrismaClient;
```
- `prismaInstance` est de type `any` (mock ou vrai client)
- Le cast `as PrismaClient` ment au compilateur TypeScript
- Le mock ne satisfait pas l'interface `PrismaClient` (manque `prisma.user`, `prisma.blogPost`, etc.)

### Conséquence
Si le mock est utilisé en DEV_MODE, les appels comme `prisma.user.findUnique()` retournent un proxy vide. L'application peut casser silencieusement.

### ✅ Solution
```typescript
// Utiliser un type conditionnel propre
import type { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (isDevMode) {
  prisma = createMockPrisma() as unknown as PrismaClient;
} else {
  prisma = new PrismaClient({ ... });
}
export { prisma };
```

---

## 🟡 PROBLÈME #5 (GRAVITÉ MOYENNE) — Fichier `.backup` dans `src/`

**Fichier:** `src/components/sections/hero.tsx.backup`  
**Sévérité:** 🟡 MOYENNE  
**Impact:** Code mort, confusion maintenance

### Constat
Un fichier `.backup` avec des imports vers `@/components/editors/pdf-editor` et `@/lib/tools-mapping` traîne dans `src/components/sections/`.

### Conséquence
- Le pattern d'inclusion TypeScript `**/*.tsx` ne match pas `.backup` → pas compilé
- MAIS: source de confusion, pourrait être accidentellement renommé/importé

### ✅ Solution
Supprimer ou déplacer hors de `src/`:
```bash
rm src/components/sections/hero.tsx.backup
```

---

## 🟡 PROBLÈME #6 (GRAVITÉ MOYENNE) — `import type { Plan } from '@prisma/client'`

**Fichier:** `src/lib/types/auth.ts` (ligne 9)  
**Sévérité:** 🟡 MOYENNE  
**Impact:** Build échoue si `prisma generate` n'a pas été exécuté

### Constat
```typescript
import type { Plan } from '@prisma/client';
```
Le type `Plan` est généré par `npx prisma generate`. Si cette commande échoue ou n'est pas exécutée avant le build Next.js, l'import casse.

### ✅ Solution
Vérifier que `RUN npx prisma generate` (Dockerfile ligne 18) s'exécute correctement. Ajouter `RUN npx prisma generate` **aussi** dans le stage builder (après le COPY) pour garantir la présence des types.

---

## 🟡 PROBLÈME #7 (GRAVITÉ MOYENNE) — `swcMinify: false` déprécié

**Fichier:** `next.config.js` (ligne 8)  
**Sévérité:** 🟡 MOYENNE  
**Impact:** Warning au build, sera retiré dans Next.js 15

### Constat
```javascript
swcMinify: false,
```
Le build local montre le warning:
> ⚠ Disabling SWC Minifer will not be an option in the next major version.

### ✅ Solution
Supprimer `swcMinify: false` ou le remplacer par la configuration Terser si nécessaire.

---

## 🔵 PROBLÈME #8 (GRAVITÉ FAIBLE) — Trop de fichiers parasites

**Sévérité:** 🔵 FAIBLE  
**Impact:** Docker build context trop lourd

### Constat
Le projet contient ~90 fichiers `.md`, `.ps1`, `.bat`, `.sh`, `.js` dans la racine. Le `.dockerignore` en filtre beaucoup, mais certains passent encore:
- `*.md` → filtré ✅
- `*.ps1` → filtré ✅  
- `scripts/` → filtré ✅
- Mais `_check-iam.js`, `_create-secrets.js`, etc. → **PASSENT dans le contexte Docker** (pas filtrés par `.dockerignore`)

### ✅ Solution
Ajouter au `.dockerignore`:
```
_*.js
causing*
```

---

## 🟢 PROBLÈME #9 (GRAVITÉ FAIBLE) — `ignoreBuildErrors: true` masque les problèmes

**Fichier:** `next.config.js` (lignes 12-16)  
**Sévérité:** 🟢 FAIBLE  
**Impact:** Les erreurs TypeScript et ESLint sont ignorées

### Constat
```javascript
typescript: { ignoreBuildErrors: true },
eslint: { ignoreDuringBuilds: true },
```
Ces options empêchent de voir les vraies erreurs de compilation.

### ✅ Solution
Temporairement désactiver ces options, corriger toutes les erreurs, puis les réactiver si nécessaire.

---

## 📊 MATRICE DE CORRECTION

| # | Problème | Sévérité | Priorité | Effort |
|---|----------|----------|----------|--------|
| 1 | `package-lock.json` absent | 🔴 CRITIQUE | P0 | 5 min |
| 2 | Node.js v24 hors plage | 🔴 CRITIQUE | P0 | 5 min |
| 3 | `docker-compose.coolify.yml` sans DB | 🔴 CRITIQUE | P0 | 30 min |
| 4 | Mock Prisma cast `as PrismaClient` | 🟡 MOYENNE | P1 | 15 min |
| 5 | Fichier `.backup` dans `src/` | 🟡 MOYENNE | P1 | 1 min |
| 6 | `import type { Plan }` fragile | 🟡 MOYENNE | P1 | 5 min |
| 7 | `swcMinify: false` déprécié | 🟡 MOYENNE | P2 | 1 min |
| 8 | Fichiers parasites Docker | 🔵 FAIBLE | P2 | 5 min |
| 9 | `ignoreBuildErrors: true` | 🟢 FAIBLE | P3 | 30 min+ |

---

## 🎯 PLAN D'ACTION (ORDRE D'EXÉCUTION)

### Phase 1 — Débloquer le build (P0)

1. **Générer `package-lock.json`**
   ```bash
   # Avec Node.js v20
   rm -rf node_modules
   npm install --legacy-peer-deps
   # Vérifier: ls package-lock.json
   ```

2. **Tester le build localement**
   ```bash
   npm run build
   # Doit réussir sans erreur
   ```

3. **Tester le build Docker localement**
   ```bash
   docker build -t multi-convert:test .
   # Doit réussir
   ```

### Phase 2 — Corriger la configuration Coolify (P0)

4. **Ajouter PostgreSQL dans `docker-compose.coolify.yml`**
5. **Vérifier les variables d'environnement DATABASE_URL dans Coolify**

### Phase 3 — Nettoyer le code (P1)

6. **Supprimer `hero.tsx.backup`**
7. **Corriger le cast Prisma mock**
8. **Ajouter `prisma generate` dans le stage builder**

### Phase 4 — Optimisations (P2-P3)

9. **Supprimer `swcMinify: false`**
10. **Nettoyer `.dockerignore`**
11. **Corriger les erreurs TypeScript masquées**

---

## 🔮 CAUSE RACINE LA PLUS PROBABLE DE L'ÉCHEC ACTUEL

**L'absence de `package-lock.json`** est la cause racine #1. Sans lockfile:
1. `npm install --legacy-peer-deps` dans le Dockerfile résout les dépendances de façon non-déterministe
2. La version exacte de `next`, `sharp`, `prisma` et leurs sous-dépendances varie
3. Sur Alpine Linux (`node:20-alpine`), certaines résolutions peuvent télécharger des binaires incompatibles
4. Le build Next.js échoue avec `exit code 1` sans message d'erreur clair car le processus `next build` lui-même crashe

**Action immédiate:** Générer `package-lock.json` avec Node.js v20, commit, et redéployer.