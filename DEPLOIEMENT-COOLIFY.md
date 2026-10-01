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

### Google AdSense (monétisation — désactivée par défaut)

Le site **ne contacte jamais Google** tant que `NEXT_PUBLIC_ADSENSE_ENABLED` n'est pas à `true`.
Activation détaillée : [`docs/ADSENSE.md`](docs/ADSENSE.md). Variables :

| Variable | Valeur | Rôle |
|---|---|---|
| `NEXT_PUBLIC_ADSENSE_ENABLED` | `true` \| `false` | interrupteur maître |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | `ca-pub-5343389597650456` | identifiant éditeur (défaut déjà embarqué) |
| `NEXT_PUBLIC_ADSENSE_SLOT_HEADER` | ID numérique | bloc haut de page |
| `NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT` | ID numérique | bloc dans les articles de blog |
| `NEXT_PUBLIC_ADSENSE_SLOT_FOOTER` | ID numérique | bloc bas de page |
| `NEXT_PUBLIC_ADSENSE_CMP_ID` | `pub-5343389597650456` | CMP Google, **obligatoire pour servir l'EEE/UK/CH** |
| `NEXT_PUBLIC_ADSENSE_REQUIRE_CONSENT` | `true` (défaut) \| `false` | `false` seulement si la CMP Google gère le consentement |

⚠️ **`NEXT_PUBLIC_*` est inlinée AU BUILD** : la définir uniquement à l'exécution n'a aucun
effet. Renseignez-la dans l'onglet *build time* de Coolify (ou via `--build-arg`, les `ARG`
existent dans le `Dockerfile` et les workflows `.github/workflows/docker-publish*.yml`),
puis **redéployez**. Le fichier `public/ads.txt` doit rester accessible sur
`https://multi-convert.com/ads.txt` (AdSense → *Sites* → *ads.txt* = « Autorisé »).


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

### Le déploiement échoue sur « Collecting build traces » (`exit code 255`, aucun message)

Symptôme exact dans les logs Coolify : le build va jusqu'à
`✓ Generating static pages (339/339)`, puis affiche `Collecting build traces ...`
et s'arrête là — `Deployment failed: Command execution failed (exit code 255)`,
sans le moindre message d'erreur.

Cause : **la mémoire du VPS a manqué pendant la compilation**. `Collecting build
traces` est l'étape la plus gourmande de Next.js ; quand le noyau tue le process
(*OOM killer*), il n'y a **aucune exception JavaScript** — donc aucun message,
juste un code de sortie 255. Deux amplificateurs :

1. **Coolify recompile sur le VPS** à chaque déploiement, car le service `app`
   du `docker-compose.prod.yml` contient un bloc `build:` — alors que l'image est
   déjà construite par GitHub Actions (§8).
2. **4 workers de génération statique par défaut** : Next en crée 4 et **retire
   leur plafond de mémoire** (chaque worker est un process Node complet, non
   borné par `NODE_OPTIONS`). `buildWorkers()` dans `next.config.js` n'en crée
   plus qu'un seul quand la mémoire libre est faible.

À faire dans l'ordre (sur le VPS) :

```bash
# 1. Le noyau a-t-il tué le build ? (chercher « Killed process ... node »)
dmesg -T | grep -i -E 'oom|killed process'
free -h          # mémoire disponible
df -h            # disque : un disque plein casse aussi le build

# 2. Récupérer l'espace laissé par le build échoué
docker builder prune -af

# 3. Si le VPS n'a pas de swap : en ajouter 2 Go (absorbe le pic du build)
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Puis relancer le déploiement — **sans** « Force rebuild » (`--no-cache` allonge et
alourdit le build inutilement). Si le build est encore tué :

| Levier | Où | Valeur |
| --- | --- | --- |
| Ne plus compiler sur le VPS | Coolify → Configuration → type **Docker Image** + `IMAGE` / `PULL_POLICY=always` (§8) | — |
| Nombre de workers du build | Coolify → Environment Variables (**build time**) | `NEXT_BUILD_WORKERS=1` |
| Plafond du tas Node du build | idem | `NODE_MAX_OLD_SPACE_SIZE=2048` (VPS ≥ 6 Go) |
| Mémoire de la machine | hébergeur VPS | ≥ 8 Go pour compiler confortablement |

ℹ️ Un `exit code 137` au lieu de 255 désigne le même problème : process tué par
le noyau. Et rappel de la règle §8 : **l'image est construite sur les runners
GitHub, jamais sur le VPS.**

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

## 8. GitHub Actions — où l'image est construite

**Règle : l'image est construite sur les runners GitHub, jamais sur le VPS.**

| Workflow | Registre | Rôle |
| --- | --- | --- |
| `.github/workflows/docker-publish-dockerhub.yml` | Docker Hub (`space5:latest` + `space5:<sha>`) | **Celui utilisé en production** |
| `.github/workflows/docker-publish.yml` | GHCR | Secours (peut être désactivé : deux builds par push = minutes CI doublées) |

Pourquoi : le build Next.js consomme 2 à 4 Go de RAM. Sur un VPS qui fait déjà tourner
l'application, Postgres et Redis, ce pic déclenche l'OOM killer pendant le remplacement du
conteneur → le proxy n'a plus de backend → **504 Gateway Timeout** pour les visiteurs.

Mise en route (une seule fois) :

1. Coolify → application → **Configuration** → type **Docker Image** (et non « Build from Git »),
   image = `<utilisateur Docker Hub>/space5:latest`.
2. Coolify → **Environment Variables** du service `app` :
   - `IMAGE=<utilisateur Docker Hub>/space5:latest`
   - `PULL_POLICY=always` → Coolify télécharge l'image à chaque déploiement
3. GitHub → **Settings → Secrets and variables → Actions** (facultatif : déploiement automatique
   à la fin du build) :
   - `COOLIFY_WEBHOOK` = `https://<votre-coolify>/api/v1/deploy?uuid=<uuid-app>&force=false`
   - `COOLIFY_TOKEN` = jeton API Coolify

Avec `IMAGE` + `PULL_POLICY=always`, Coolify ne recompile plus jamais le projet : un déploiement
se résume à un `docker pull` (quelques secondes) puis au redémarrage du conteneur.

---

## 9. Zéro « 504 Gateway Timeout » au déploiement

### Les 6 causes, et ce qui les supprime

| Cause | Symptôme | Correctif (présent dans le dépôt) |
| --- | --- | --- |
| Build Next.js sur le VPS (2-4 Go) | OOM killer → proxy sans backend | Image construite par GitHub Actions + `IMAGE`/`PULL_POLICY=always` (§8) |
| Build tué sur « Collecting build traces » (exit 255, aucun message) | déploiement en échec, sans log d'erreur | 1 worker de build sur VPS (`NEXT_BUILD_WORKERS=1`, auto via `next.config.js`) + swap si possible (§6) |
| Le serveur attendait la base avant d'écouter | 504 pendant 1-2 min à chaque démarrage | `docker-entrypoint.sh` lance `server.js` **en premier**, la base est préparée en arrière-plan |
| `depends_on: service_healthy` sur Postgres | l'app ne démarre pas tant que PG n'est pas prêt | `condition: service_started` (le code tolère une base momentanément absente) |
| Aucun plafond mémoire | un pic du process Node tue le VPS entier | `NODE_OPTIONS=--max-old-space-size=768` + `mem_limit` |
| Logs Docker illimités (disque plein) | site injoignable, redémarrage impossible | rotation des logs (`max-size: 10m`, `max-file: 3`) |

### À vérifier dans l'interface Coolify

- **Zero-downtime deployment** activé : le trafic n'est basculé qu'une fois le nouveau conteneur
  *healthy*.
- **Health check path** = `/api/health` : route de **vivacité**, qui n'interroge pas la base (une
  base lente ne peut donc pas faire échouer la sonde). Diagnostic base : `/api/health?db=1`.
- **Resource limits** du service `app` ≈ 1,5 Go (au-dessus du plafond Node de 768 Mo).

### Réglages ajustables sans modifier les fichiers

| Variable (Coolify → Environment) | Défaut | Rôle |
| --- | --- | --- |
| `APP_MAX_OLD_SPACE` | `768` | plafond du tas Node (Mo) |
| `APP_MEM_LIMIT` | `1536m` | plafond mémoire du conteneur app |
| `PG_MEM_LIMIT` / `REDIS_MEM_LIMIT` | `768m` / `384m` | plafonds Postgres / Redis |
| `NEXT_BUILD_WORKERS` *(build time)* | auto (≈1 par Go libre, max 4) | workers du build Next.js — `1` sur un VPS |
| `NODE_MAX_OLD_SPACE_SIZE` *(build time)* | `1536` | plafond du tas Node pendant le build (Mo) |

### Si le site ne répond quand même pas

```bash
docker ps -a                  # le conteneur app tourne-t-il ? redémarre-t-il en boucle ?
docker logs --tail 100 <app>  # chercher « Killed », « OOM », « server.js introuvable »
free -h                       # mémoire disponible sur le VPS
docker stats --no-stream      # consommation par conteneur
df -h                         # disque : plein = site injoignable
```

Puis, depuis l'extérieur, la séquence qui distingue un problème de proxy d'un problème
d'application :

```bash
curl -s -o /dev/null -w 'http  : %{http_code}\n' http://multi-convert.com/            # 302 = proxy vivant
curl -s -o /dev/null -w 'https : %{http_code} tls=%{time_appconnect}s octet=%{time_starttransfer}s\n' https://multi-convert.com/api/health
```

- **TLS rapide + aucun octet de réponse** → l'application ne répond pas (processus figé ou OOM) :
  redémarrer le conteneur puis contrôler la mémoire.
- **502 / 503 immédiat** → conteneur non démarré ou non *healthy* : lire les logs.
- **`/api/health` en 200 mais pages lentes** → chercher côté base de données (`/api/health?db=1`).

### Cas réel (20/09/2026) — 504 alors que le TLS est instantané

Mesures prises depuis l'extérieur pendant l'incident :

| Test | Résultat | Lecture |
| --- | --- | --- |
| `curl -s -o /dev/null -w '%{http_code}' http://multi-convert.com/` | **302 en 0,10 s** | Traefik (proxy) est vivant et rapide |
| Handshake TLS sur `:443` | **TLS 1.3 en 0,14 s**, certificat valide | ni DNS, ni certificat, ni pare-feu en cause |
| `curl -w 'ttfb=%{time_starttransfer}' https://multi-convert.com/api/health` | **0 octet pendant 25 s** (puis 504) | le conteneur `app` accepte la connexion mais ne répond jamais |
| `https://multi-convert.com/robots.txt` | même symptôme | ce n'est pas la base : aucune requête SQL sur cette route |

Conclusion : Traefik va bien, **le conteneur `app` (Node) ne rend plus la main** — les requêtes
sont acceptées par le proxy puis restent sans réponse jusqu'au 504. Ordre d'intervention :

1. Coolify → **Deployments** : si un déploiement est en cours (build), **l'arrêter** — c'est lui
   qui sature la mémoire/le CPU (cause n°1 du §9).
2. Coolify → l'application → **Restart** (équivalent : `docker restart <conteneur app>`).
3. Depuis le VPS, vérifier que l'application répond en interne :
   `docker exec <app> wget -qO- http://127.0.0.1:3000/api/health`
   → **200** = le conteneur va bien (chercher alors côté proxy/Traefik) ;
   → **pas de réponse** = conteneur figé ou en boucle de redémarrage : lire les logs (étape 4).
4. `docker logs --tail 100 <app>` (`Killed`, `OOM`, `server.js introuvable`, « Base indisponible »),
   `docker stats --no-stream`, `free -h`, `df -h`, `dmesg | grep -i -E 'oom|killed process'`.
5. Si `docker stats` montre le conteneur collé à son plafond : augmenter **ensemble**
   `APP_MAX_OLD_SPACE` (plafond du tas Node) et `APP_MEM_LIMIT` — un tas de 768 Mo avec un
   `mem_limit` de 1,5 Go provoque du *swapping* et des réponses qui n'arrivent plus.
6. Vérifier enfin que Coolify **ne recompile pas sur le VPS** (type **Docker Image** +
   `IMAGE` + `PULL_POLICY=always`, §8). Sans ce réglage, le déploiement suivant reproduira
   exactement la même panne.
