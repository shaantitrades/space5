# Configurer Supabase (Space 5)

Projet Supabase : **poilochddyciosejieyy**  
URL : https://poilochddyciosejieyy.supabase.co

---

## 1. Récupérer les infos de connexion

1. Ouvre **Supabase** → ton projet **Space 5**
2. Va dans **Project Settings** (engrenage) → **Database**
3. Repère :
   - **Database password** (mot de passe choisi à la création, ou « Reset » pour en générer un)
   - **Connection string** → **URI** (connexion directe)
   - **Connection pooling** → **URI** en mode **Transaction** (port **6543**)

---

## 2. Variables dans `.env` ou `.env.local`

À la racine du projet, crée ou complète `.env` / `.env.local` avec :

```env
# --- Supabase PostgreSQL ---

# Connexion poolée pour l'app (recommandé pour Next.js / serverless)
# Remplacer [MOT_DE_PASSE] par le Database password Supabase
# Remplacer [REGION] par ta région (ex: eu-central-1, us-east-1) visible dans l’URL du pooler
DATABASE_URL="postgresql://postgres.poilochddyciosejieyy:[MOT_DE_PASSE]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Connexion directe pour les migrations (prisma migrate, db push)
DIRECT_URL="postgresql://postgres:[MOT_DE_PASSE]@db.poilochddyciosejieyy.supabase.co:5432/postgres"
```

### Où prendre les valeurs dans Supabase

- **Database** → onglet **Connection string** :
  - **URI** : c’est la base de `DIRECT_URL` (tu remplaces le mot de passe si besoin).
- **Connection pooling** → **Transaction** (port **6543**) :
  - **URI** : c’est la base de `DATABASE_URL` ; **ajoute** `?pgbouncer=true` à la fin.

Exemple si ton URI pooler est :
`postgresql://postgres.poilochddyciosejieyy:xxx@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`

Alors :

```env
DATABASE_URL="postgresql://postgres.poilochddyciosejieyy:xxx@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

(avec ton vrai mot de passe à la place de `xxx`).

---

## 3. Appliquer le schéma Prisma

```powershell
cd "E:\space 5"

# Générer le client Prisma
npm run db:generate

# Créer les tables dans Supabase
npm run db:push
```

Pour des **migrations** versionnées plus tard :

```powershell
npx prisma migrate dev --name init
```

---

## 4. Vérifier la connexion

```powershell
npm run db:studio
```

Ouvre http://localhost:5555 : tu dois voir les tables (users, conversions, etc.) sur Supabase.

---

## 5. Déploiement (Firebase App Hosting)

Sur **App Hosting**, configure les **variables d’environnement** avec les mêmes noms :

- `DATABASE_URL` (valeur pooler avec `?pgbouncer=true`)
- `DIRECT_URL` (valeur connexion directe)

Tu peux les définir dans la console Firebase / App Hosting pour l’environnement de production.

---

## Récap : Supabase + App Hosting

| Composant        | Rôle |
|------------------|------|
| **Supabase**     | PostgreSQL (base Prisma) |
| **App Hosting**  | Hébergement de l’app Next.js (SSR, API, etc.) |

Pas besoin de Hostinger pour cette architecture.

---

## Dépannage

- **"Can't reach database"** : vérifier `DATABASE_URL` / `DIRECT_URL`, mot de passe, région.
- **"Too many connections"** : bien utiliser l’URL **pooler** avec `?pgbouncer=true` pour `DATABASE_URL`.
- **Migrations qui échouent** : `DIRECT_URL` doit être la connexion **directe** (db.xxx.supabase.co:5432). Le `schema.prisma` utilise `directUrl = env("DIRECT_URL")` pour les migrations.
- **Pas Supabase / autre Postgres** : mets `DIRECT_URL` égal à `DATABASE_URL` (connexion directe sans pooler).
