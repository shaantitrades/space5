# 🚀 Déploiement — Contabo VPS + Coolify

> **Cible unique de déploiement.** Toute la configuration Firebase / App Hosting a été supprimée
> (voir la section « Historique » en bas de page).

---

## 1. Vue d'ensemble

| Élément | Valeur |
|---|---|
| Hébergeur | **Contabo VPS** |
| IP du serveur | `95.111.230.185` |
| Domaine | `https://multi-convert.com` (enregistrement A → `95.111.230.185`) |
| Orchestrateur | **Coolify** |
| Fichier d'orchestration | **`docker-compose.prod.yml`** (c'est ce fichier que Coolify utilise — vérifié dans les logs de déploiement) |
| Image applicative | construite par Coolify depuis le `Dockerfile` |
| Base de données | conteneur **PostgreSQL 16** (`mc_postgres`) |
| Cache / files | conteneur **Redis 7** (`mc_redis`) |
| Déclenchement | **`git push` sur `main` → Coolify déploie automatiquement** |
| Healthcheck | `GET /api/health` → `{"status":"ok","service":"Multi Convert"}` |

> ℹ️ `docker-compose.coolify.yml` **n'est pas utilisé** par Coolify (il pointe vers `docker-compose.prod.yml`).
> Ce fichier est conservé à titre indicatif ; ne pas s'y fier pour le déploiement.

### Services du `docker-compose.prod.yml`
- `app` — l'application Next.js (build depuis `Dockerfile`, tag local `${IMAGE:-multi-convert:latest}`)
- `mc_postgres` — base de données PostgreSQL 16
- `mc_redis` — cache et rate limiting

---

## 2. Déployer

### Méthode normale (recommandée)

```bash
git add .
git commit -m "description du changement"
git push origin main
```

**Coolify détecte le push et redéploie automatiquement.** Suivre la progression dans l'interface
Coolify (onglet *Deployments*) : build → migration → démarrage.

### Vérifier que le conteneur a bien démarré

```bash
# Sur le VPS
docker ps
docker logs -f <nom_du_conteneur_app>
```

---

## 3. Variables d'environnement (à définir dans Coolify)

Le conteneur **ne lit aucun fichier `.env`** : tout est injecté par Coolify à l'exécution
(voir `.dockerignore`). Ces variables doivent donc être renseignées dans
**Coolify → Environment Variables**.

### Obligatoires

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | Connexion PostgreSQL (conteneur `postgres`) |
| `DIRECT_URL` | Connexion directe pour les migrations Prisma |
| `NEXTAUTH_URL` | URL publique : `https://multi-convert.com` |
| `NEXTAUTH_SECRET` | ≥ 32 caractères, **généré pour la production** |
| `JWT_SECRET` | ≥ 32 caractères, **généré pour la production** |
| `ENCRYPTION_KEY` | ≥ 32 caractères, **générée pour la production** |
| `NEXT_PUBLIC_APP_URL` | `https://multi-convert.com` |
| `NEXT_PUBLIC_API_URL` | `https://multi-convert.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://multi-convert.com` |
| `ALLOWED_ORIGINS` | `https://multi-convert.com,https://www.multi-convert.com` |
| `REDIS_URL` | `redis://redis:6379` |

### Nécessaires au bon fonctionnement du site

| Variable | Rôle | Si absente |
|---|---|---|
| `EMAIL_FROM` | Expéditeur des emails | repli sur `noreply@multi-convert.com` |
| `CONTACT_EMAIL` | Adresse publique affichée sur le site | repli sur `contact@multi-convert.com` |
| `LEADS_NOTIFICATION_EMAIL` | Destinataire des **demandes entreprise** | aucun email envoyé (le lead est tout de même enregistré) |
| `RESEND_API_KEY` **(recommandé)** ou `SENDGRID_API_KEY` ou SMTP (`SMTP_HOST`/`SMTP_USER`/`SMTP_PASSWORD`) | Envoi réel des emails | ⚠️ **aucun email ne part** : ni confirmation d'inscription, ni réinitialisation de mot de passe, ni notification de lead |
| `ADMIN_EMAILS` | Accès à l'administration | administration inaccessible |

### Optionnelles (fonctionnalités désactivées si vides)

`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (connexion Google), `STRIPE_SECRET_KEY` /
`STRIPE_PUBLISHABLE_KEY` (paiement — **non branché dans le code**), `AWS_*` (stockage S3),
`SENTRY_DSN` (monitoring).

### Générer les secrets

```bash
openssl rand -base64 32   # ENCRYPTION_KEY
openssl rand -base64 32   # JWT_SECRET
openssl rand -base64 32   # NEXTAUTH_SECRET
```

> ⚠️ **Ne jamais réutiliser les valeurs de développement en production**, et ne jamais commettre
> ces valeurs dans Git.

---

## 4. Base de données (une seule fois, puis à chaque changement de schéma)

Le schéma Prisma doit être appliqué à la base **avant** que l'application ne l'utilise.
Depuis le conteneur applicatif :

```bash
# Sur le VPS
docker exec -it <conteneur_app> npx prisma migrate deploy

# Ou, pour une première mise en place sans historique de migration :
docker exec -it <conteneur_app> npx prisma db push
```

Puis vérifier que les tables existent :

```bash
docker exec -it <conteneur_postgres> psql -U <POSTGRES_USER> -d <POSTGRES_DB> -c '\dt'
# doit lister : users, conversions, api_keys, blog_posts, leads, ...
```

---

## 5. Vérifications après déploiement

### ✅ Statut vérifié le 14/09/2026 (déploiement `main` → commit `573d3fb`)

| Contrôle | Résultat constaté |
|---|---|
| `https://multi-convert.com/` | **200** — titre EN localisé |
| `https://multi-convert.com/fr` | **200** — titre FR localisé |
| `https://multi-convert.com/fr/entreprise` | **200** — « Solutions entreprise », 0 affirmation interdite |
| `https://multi-convert.com/fr/contact` | **200** |
| `https://multi-convert.com/api/health` | **200** — `{"status":"ok","service":"Multi Convert"}` |
| `https://multi-convert.com/sitemap.xml` | **200** — 193 Ko, 170 URLs, 10 langues + `x-default` |
| `https://multi-convert.com/robots.txt` | **200** |
| `POST https://multi-convert.com/api/leads` | **201** avec un `leadId` UUID → **table `leads` créée, capture fonctionnelle** |
| `hreflang` sur `/fr` | **11 balises** (10 langues + `x-default`) |
| `canonical` sur `/fr` | `https://multi-convert.com/fr` |
| Mots-clés sur `/fr` | **45** |
| Mode local | présent sur `/fr/convert` |
| Lien « Entreprise » dans le menu | présent (`/fr/entreprise`) |

### Contrôles à refaire à chaque déploiement

| Contrôle | Attendu |
|---|---|
| Le site répond | `https://multi-convert.com` → 200, page d'accueil Multi Convert |
| HTTPS valide | certificat émis pour `multi-convert.com` et `www` |
| Formulaire de contact | envoyer un vrai message → **vérifier la réception de l'email** de notification |
| Base de données | le lead apparaît dans la table `leads` |
| Sitemap | `https://multi-convert.com/sitemap.xml` → 170 URLs |
| Robots | `https://multi-convert.com/robots.txt` → pages privées exclues |
| Conversion simple | envoyer une image sur `/convert` → fichier téléchargé |
| Migration Prisma | aucune erreur au démarrage (`docker logs`) |
| Healthcheck | `GET /api/health` → `status: ok` |

Puis : **Google Search Console** → ajouter la propriété et soumettre `sitemap.xml`.

---

## 6. Dépannage

### Le conteneur redémarre en boucle
→ Une variable obligatoire manque. Les logs indiquent laquelle : `docker logs <conteneur_app>`.

### `Can't reach database server` (Prisma `P1001`)
→ `DATABASE_URL` doit pointer vers le **nom du service** (`mc_postgres`), pas vers `localhost`.

### `password authentication failed for user "postgres"` (Prisma `P1000`)
→ Le mot de passe de `DATABASE_URL` ne correspond pas à celui du **volume** Postgres.
`POSTGRES_PASSWORD` n'est appliqué qu'à la **première** initialisation du volume : le
changer dans Coolify ensuite n'a **aucun effet** sur une base déjà créée
(log : `PostgreSQL Database directory appears to contain a database; Skipping initialization`).
Deux solutions, puis **redémarrer le conteneur app** (le `prisma db push` du démarrage
recréera les tables manquantes) :

```bash
# A) Reprendre le mot de passe initial dans DATABASE_URL et DIRECT_URL
#    (si POSTGRES_PASSWORD n'avait jamais été défini au premier démarrage : MultiConvert2026)

# B) Ou aligner la base sur ce que Coolify envoie
docker exec -it <conteneur_postgres> psql -U postgres -c \
  "ALTER USER postgres WITH PASSWORD 'LE_MOT_DE_PASSE';"
```

⚠️ Ne supprimez **pas** le volume Postgres pour « repartir de zéro » : perte des comptes
et des leads. Si le mot de passe contient des caractères spéciaux, encodez-les dans
l'URL (`@` → `%40`, `:` → `%3A`, `/` → `%2F`, `#` → `%23`).

### Le site répond mais renvoie une erreur 500
→ Base injoignable (`P1001`), identifiants refusés (`P1000`) ou schéma en retard (`P2022`).
→ Diagnostic immédiat : `GET /api/health` (champ `database` avec le code et, le cas
échéant, la liste `missingColumns`).

### Le formulaire enregistre mais aucun email n'arrive
→ Aucun fournisseur configuré : `RESEND_API_KEY` (recommandé), `SENDGRID_API_KEY` ou SMTP.
→ Vérifier aussi que `DEV_MODE` / `SKIP_DB` ne sont **pas** définis en production
(ils remplacent la base par un mock et n'envoient aucun email).
→ Le contrôle est tracé dans les logs : `✅ Email envoyé via resend à …` ou
`❌ Resend a refusé l'email (HTTP 422) : …`.

### Le domaine ne répond pas du tout
→ Vérifier que l'enregistrement A pointe vers `95.111.230.185`, que le proxy Coolify est actif
et que le certificat TLS est émis.

---

## 7. Historique — pourquoi Firebase a été retiré

Toutes les configurations Firebase ont été supprimées du dépôt :

`firebase.json`, `.firebaserc(.example)`, `apphosting.yaml`, `.firebase/`, `FIREBASE-SETUP.md`,
`DEPLOIEMENT-APP-HOSTING.md`, `DEPLOIEMENT-RAPIDE.md`, `SECRETS-CONFIGURATION.md`, `SUPABASE_SETUP.md`,
`public/index.html` (la page par défaut « Welcome to Firebase Hosting » qui s'affichait à la place du
site), `deploy-apphosting.ps1`, `deploy-firebase.ps1`, `deploy-firebase.sh`, `init-firebase.ps1`,
`init-firebase.sh`, `setup-firebase-secrets.ps1`, `setup-secrets-firebase.ps1`, `configure-secrets.ps1`,
`configure-secrets-manual.ps1`, `configure-supabase-secrets.ps1`, `setup-secrets-simple.ps1`,
`.env.yaml.example`, `_check-iam.js`, `_create-secrets.js`, `_grant-all-sa.js`, `_grant-final.js`,
`.github/workflows/firebase-hosting-pull-request.yml`, ainsi que les scripts `firebase:*` de `package.json`.

### ⚠️ Action de sécurité requise

L'ancien fichier `SECRETS-CONFIGURATION.md` contenait **de vrais identifiants Supabase en clair**
(mot de passe de base de données et clé `service_role`). Le fichier est supprimé, mais il **reste
présent dans l'historique Git**. Ces identifiants doivent être considérés comme compromis :

1. **Révoquer** la clé `service_role` du projet Supabase concerné.
2. **Changer le mot de passe** de la base Supabase correspondante.
3. Vérifier qu'aucun service ne les utilise encore (le code ne référence plus Supabase : 0 occurrence).

---

## 8. GitHub Actions

`.github/workflows/docker-publish.yml` construit et publie une image sur **GHCR** à chaque push sur
`main` (`ghcr.io/<owner>/space5:latest`). **Ce workflow n'est pas nécessaire à Coolify**, qui construit
lui-même l'image depuis le `Dockerfile`. Il peut être conservé (build de secours) ou désactivé pour
accélérer les pushs.
