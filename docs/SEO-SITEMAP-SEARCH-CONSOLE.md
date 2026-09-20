# Sitemap & Search Console — « Impossible de lire le sitemap »

Document de diagnostic et de résolution. Dernière vérification : **20/09/2026**.

---

## 1. Le fichier sitemap est valide (vérifié en production)

| Contrôle | Résultat réel |
|---|---|
| `GET https://multi-convert.com/sitemap.xml` | **200** |
| `Content-Type` | **`application/xml`** |
| Taille | **193 023 octets** (compressé : 7 116 octets, gzip valide et décompressable) |
| 1ʳᵉ ligne | `<?xml version="1.0" encoding="UTF-8"?>` |
| Racine | `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">` |
| Nombre d'entrées | **170 `<url>`** (10 langues × 17 pages) |
| hreflang | 11 `xhtml:link` par URL (10 langues + `x-default`) — identiques à ceux du HTML |
| Parseur XML (.NET `XmlDocument`) | **well-formed (OK)** |
| UA `Googlebot/2.1` | **200**, même corps XML (pas de blocage, pas de redirection) |
| `HEAD` | **200** |
| `robots.txt` | `Allow: /` + `Sitemap: https://multi-convert.com/sitemap.xml` |
| URLs échantillonnées (85) | **toutes 200** — aucun 404 dans le sitemap |
| `/sitemap.xml/` (barre finale) | 308 → `/sitemap.xml` |

➡️ Le message de Search Console ne vient donc **pas** du contenu du sitemap.
Les causes possibles restantes sont listées ci-dessous, avec le correctif appliqué.

---

## 2. Causes identifiées

### 2.1 URL alias en 404 HTML (cause principale possible)

Les noms de sitemap générés par la plupart des CMS (et donc souvent saisis
dans Search Console) répondaient une **page 404 en HTML** : Search Console ne
peut pas lire un HTML comme un XML et affiche « Impossible de lire le sitemap ».

| URL testée | Avant | Après correctif |
|---|---|---|
| `/sitemap_index.xml` | 404 HTML (16,5 Ko) | **308 → `/sitemap.xml`** |
| `/sitemap-index.xml` | 404 HTML | **308 → `/sitemap.xml`** |
| `/sitemap.xml.gz` | 404 HTML | **308 → `/sitemap.xml`** |
| `/sitemap` , `/sitemap/` | 307 → `/en/sitemap` → 404 | **308 → `/sitemap.xml`** |

Correctif : `redirects()` dans `next.config.js` (évalué **avant** le middleware,
donc `/sitemap` sans extension est bien intercepté).

### 2.2 Le sous-domaine `www` est cassé

`www.multi-convert.com` résout (même IP que l'apex) mais Traefik ne connaît pas
ce nom d'hôte :

| URL | Réponse |
|---|---|
| `http://www.multi-convert.com/sitemap.xml` | **404 `page not found`** (Traefik) |
| `https://www.multi-convert.com/sitemap.xml` | **503 `no available server`** + erreur TLS (certificat émis pour l'apex seul) |

Si l'entrée Search Console pointe vers `www.…`, l'échec est certain.
⚠️ À corriger côté hébergement (voir §4) : le HSTS est en `includeSubDomains; preload`,
donc un `www` cassé bloque aussi les visiteurs.

### 2.3 hreflang `x-default` contradictoire

L'en-tête `Link` produit par next-intl annonçait `x-default` → `https://multi-convert.com/`
(une **redirection 307**) alors que le HTML **et** le sitemap annoncent
`x-default` → `https://multi-convert.com/en`. Deux signaux opposés pour la même URL.
Correctif : `alternateLinks: false` dans `src/i18n/routing.ts` (le HTML fournit déjà
les 10 langues + `x-default`, strictement alignés sur le sitemap).

### 2.4 Blocage géographique / anti-bot et robots d'indexation

Le middleware renvoyait un **403** aux pays « niveau 1 » (IN, CN, RU, BR, …) et une
**redirection 307 vers `/verify`** aux scores de menace Cloudflare élevés, sans
exempter les robots d'indexation. Un 403/307 servi à Googlebot fait échouer
l'exploration des pages (et donc la validation du sitemap qui les référence).
Correctif : les UA listés dans `LEGITIMATE_CRAWLERS` (`src/middleware.ts`) ne sont
plus ni bloqués ni redirigés. Le sitemap XML, lui, ne passe jamais par le middleware
(`TECHNICAL_ROUTES` + `matcher` qui exclut tout chemin contenant un point).

### 2.5 Statut mis en cache par Search Console

Google mémorise le dernier état connu d'un sitemap. Un sitemap cassé (ex. l'ancien
fichier texte « URL lastmod changefreq priority » sans balises) laisse le message
« Impossible de lire le sitemap » affiché **plusieurs jours** après le correctif,
tant que l'entrée n'est pas re-testée. Procédure de re-test : voir §5.

### 2.6 `Location` relatif dans le middleware → 500 « Invalid URL » (corrigé)

Next.js exige une URL **absolue** dans l'en-tête `Location` d'une réponse de
middleware : `new NextURL(redirect, …)` (`next/dist/server/web/adapter.js`) lève
`TypeError: Invalid URL` sur un chemin relatif, et la requête répond **500**.

Concrètement, les deux redirections « sécurité » du middleware étaient donc
cassées (reproduit en local avec `cf-ipcountry: US` + `cf-threat-score: 50`, puis
avec un UA `sqlmap`) :

| Requête | Avant | Après |
|---|---|---|
| UA `sqlmap` (comportement suspect) | **500** | **302** → `/verify?reason=suspicious_behavior` |
| `cf-threat-score: 50`, visiteur normal | **500** | **302** → `/verify?reason=threat_score` |
| `cf-threat-score: 50`, Googlebot | 500 | **200** (exempté) |
| Route Handler `api/auth/verify` | 302 (relatif, valide) | inchangé |

Correctif : `src/lib/relative-redirect.ts` construit l'URL absolue à partir de
l'hôte **public** (`x-forwarded-host` / `x-forwarded-proto` posés par Traefik),
sans jamais utiliser `request.nextUrl.origin` (qui vaut `http://0.0.0.0:3000`
dans le conteneur). Sans requête transmise (Route Handlers), le `Location` reste
relatif, comportement accepté par Next.js.

---

## 3. Correctifs appliqués au code

| Fichier | Changement |
|---|---|
| `next.config.js` | `redirects()` : 7 alias de sitemap → `/sitemap.xml` (308) |
| `src/i18n/routing.ts` | `alternateLinks: false` (fin du hreflang `x-default` contradictoire) |
| `src/middleware.ts` | Robots d'indexation exemptés du blocage pays (403) et du redirect anti-bot (307) + `request` transmis à `relativeRedirect` |
| `src/lib/relative-redirect.ts` | `Location` absolu (hôte public) pour les redirections du middleware : plus de 500 « Invalid URL » |
| `docs/SEO-SITEMAP-SEARCH-CONSOLE.md` | Ce document |

> Les `redirects()` de `next.config.js` sont compilés dans le build : **un nouveau
> déploiement est nécessaire** pour que les alias `/sitemap_index.xml` etc. répondent 308.

---

## 4. À faire côté hébergement (hors dépôt)

1. **`www` → apex** : dans Coolify, ajouter `www.multi-convert.com` sur la ressource
   de l'application (ou créer un service de redirection Traefik) pour renvoyer
   `301/308` vers `https://multi-convert.com$request_uri`.
   Alternative : supprimer l'enregistrement DNS `A www` s'il n'est pas utilisé —
   mais le `www` resterait alors en `NXDOMAIN`, ce qui est préférable à un 503.
2. Vérifier que l'entrée Search Console est bien une propriété **`https://multi-convert.com/`**
   (ou une propriété de domaine `multi-convert.com` vérifiée par TXT — le TXT
   `google-site-verification=…` est bien présent).

### 4.1 Jetons de vérification servis par l'application

`src/app/layout.tsx` publie **une balise par jeton** (méthode « Balise HTML ») :

| Jeton (valeur de `content`) | Propriété visée | Autre méthode active |
| --- | --- | --- |
| `E3zpWu3IJ57W2iYGxsvNiN-CSjJGYftVcpYpGq6y85o` | `multi-convert.com` | TXT DNS du domaine + fichier `public/google7719902836c7e64b.html` |
| `svdh6WOrdjKjKZwVz9yXgnYbQOGsmjnebvDoHxTUVbQ` | `imaparami.com` | — |

Pour vérifier une propriété avec la méthode « Balise HTML », Google doit lire la balise
**sur le domaine concerné** : `imaparami.com` doit donc résoudre vers le même serveur et être
déclaré dans Coolify/Traefik (sinon Search Console répond « Vérification impossible »).
Méthode DNS (sans toucher au code) : ajouter sur `imaparami.com` un TXT
`google-site-verification=svdh6WOrdjKjKZwVz9yXgnYbQOGsmjnebvDoHxTUVbQ`.

---

## 5. Procédure Search Console (une seule URL à soumettre)

1. Search Console → **Sitemaps** : notez l'URL exacte affichée et la colonne
   **Dernière lecture**. Supprimez **toutes** les entrées qui ne sont pas
   exactement `https://multi-convert.com/sitemap.xml`
   (`sitemap_index.xml`, `www.…`, `http://…`, `/fr/sitemap.xml`, …).
2. **Ajouter un nouveau sitemap** : saisissez `sitemap.xml` (sans domaine).
   L'état doit passer à « Réussite » avec **170 pages découvertes**.
3. **Inspection de l'URL** sur `https://multi-convert.com/sitemap.xml` : doit
   afficher « Sitemap : Réussite » et l'exploration HTTP 200.
4. Si le message persiste alors que les tests du §1 renvoient 200 + XML :
   c'est le cache de statut (§2.5). Re-tester 24 à 48 h plus tard.

---

## 6. Commandes de vérification (à relancer après chaque déploiement)

```powershell
# Statut + type MIME (doit renvoyer 200 et application/xml)
curl.exe -s -o NUL -D - -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" "https://multi-convert.com/sitemap.xml"

# XML bien formé + nombre d'URL
$tmp = "$env:TEMP\mc-sitemap.xml"
curl.exe -s -o $tmp "https://multi-convert.com/sitemap.xml"
$x = New-Object System.Xml.XmlDocument; $x.Load($tmp)
$ns = New-Object System.Xml.XmlNamespaceManager($x.NameTable)
$ns.AddNamespace('sm','http://www.sitemaps.org/schemas/sitemap/0.9')
"root=$($x.DocumentElement.Name) urls=$($x.DocumentElement.SelectNodes('sm:url',$ns).Count)"

# Alias (doivent renvoyer 308 vers /sitemap.xml)
foreach ($u in '/sitemap_index.xml','/sitemap-index.xml','/sitemap','/sitemap.xml.gz') {
  curl.exe -s -o NUL -w "$u => %{http_code} -> %{redirect_url}`n" "https://multi-convert.com$u"
}

# www (doit renvoyer 301/308 vers l'apex, jamais 404/503)
curl.exe -s -o NUL -D - "https://www.multi-convert.com/sitemap.xml"
```

---

## 7. « La page n'est pas indexée : Bloquée par le fichier robots.txt »

Traité le **20/09/2026**. Rapport de Search Console observé :

| Champ | Valeur observée |
| --- | --- |
| Explorée avec | **Googlebot pour smartphone**, le **15/09/2026 à 06:47:30** |
| Exploration autorisée ? | **Non — bloquée par le fichier robots.txt** |
| Récupération de page | **Échec** (aucune requête HTTP envoyée) |
| Indexation autorisée ? | *Sans objet* |
| Sitemaps | **Aucun sitemap référent détecté** |
| URL canonique déclarée / sélectionnée | *Sans objet* (vides) |
| Page d'origine | `listoffreeware.com/…/feed/`, `listoffreeware.com/…excel-to-pdf-converter/`, `http://multi-convert.com/to-rtf-format`, `iwebhot.com/rip/66.197.149.228.html` |

### 7.1 Ce que signifie ce message

Deux mécanismes distincts produisent ce texte :

1. **Une règle `Disallow` matche l'URL** (préfixe ou joker) ;
2. **Le `robots.txt` est injoignable** : réponse **5xx / timeout / 403**, ou
   contenu non texte (HTML, redirection). Google applique alors un
   « disallow all » **temporaire** et rapporte « Bloquée par le fichier
   robots.txt » **même si les règles du fichier étaient permissives**.

C'est le mécanisme **2** qui a produit ce rapport (contrôle du 20/09/2026 :
`https://multi-convert.com/robots.txt` → **200**, `text/plain`, `Allow: /`,
`Sitemap: …` → le fichier est sain aujourd'hui).

### 7.2 Cause racine (datée)

```text
5e122ff  2026-09-14  fix(confiance+seo) : SEO 10 langues, mode local
                       → état en ligne au moment du crawl du 15/09 06:47
b74c4ff  2026-09-16  fix(seo) : « sitemap XML valide et Googlebot débloqué »
                       → suppression du motif /bot/i qui redirigeait Googlebot
                         vers /verify (307) et empêchait tout crawl
                       → /sitemap.xml et /robots.txt sortis du middleware
27b43a8  2026-09-18  fix(déploiement) : fin des « 504 Gateway Timeout »
```

Le crawl (**15/09 06:47**) est **antérieur** au correctif `b74c4ff` (**16/09**).
Pendant cet intervalle, `robots.txt` n'était pas servi comme un fichier texte
valide à Googlebot (motif `/bot/i` → 307 vers `/verify`, middleware i18n et
sécurité appliqués à une route technique). Search Console a donc enregistré un
« disallow all » : **le rapport affiché est un instantané périmé**, il ne se
rafraîchit qu'au prochain crawl de la page.

### 7.3 Les « pages d'origine » sont normales

`listoffreeware.com` (annuaire) et `iwebhot.com/rip/…` (aspirateur de pages)
sont des **liens entrants tiers** : l'URL a été découverte **par lien**, pas par
le sitemap — « Aucun sitemap référent détecté » est donc la conséquence
attendue. `http://multi-convert.com/to-rtf-format` est une **URL historique** :
`https://multi-convert.com/en/to-rtf-format` répond aujourd'hui **404**.

### 7.4 Correctifs appliqués (dépôt)

| Fichier | Correctif |
| --- | --- |
| `src/app/robots.ts` | Règles **doublées** : URL brute + version localisée (joker + `/dashboard`…). Avant, `Disallow: /dashboard` ne bloquait pas `/fr/dashboard` (200 + `index, follow` en production). |
| `src/lib/seo.ts` | `buildPrivatePageMetadata()` : `noindex, nofollow` + canonical localisé. |
| `src/app/[locale]/{dashboard,verify,verify-email,forgot-password,reset-password,credits,403}/layout.tsx` | `layout.tsx` de segment : balise `noindex` sur les pages privées qui répondaient **200** au crawl. |
| `src/app/[locale]/dashboard/api-keys/page.tsx`, `dashboard/history/page.tsx` | `robots: { index: false, follow: false }` (leur `metadata` locale écrasait celle du layout parent). |
| `src/app/[locale]/pricing/page.tsx` | `redirect({ href: '/', locale })` : `redirect('/')` produisait `307 Location: /undefinedundefined` puis **404** (next-intl v3 attend un objet `{ href, locale }`). |

⚠️ **Le correctif middleware (`!isCrawler`) et les alias de sitemap de
`next.config.js` ne sont pas encore déployés** : au 20/09/2026,
`curl -H "cf-ipcountry: IN" -A "Googlebot/2.1" https://multi-convert.com/fr`
répond encore **403**, et `/sitemap_index.xml` encore **404**. Un déploiement
est nécessaire pour que ces deux points soient effectifs.

### 7.5 Commandes de vérification (après déploiement)

```powershell
# robots.txt : 200 + Allow: / + Sitemap, même depuis un pays « niveau 1 »
curl.exe -s -o NUL -w "%{http_code} %{content_type}`n" -H "cf-ipcountry: IN" `
  -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" `
  "https://multi-convert.com/robots.txt"

# Aucun 403 pour Googlebot, quel que soit le pays
foreach ($c in 'IN','CN','RU','BR') {
  curl.exe -s -o NUL -w "$c => %{http_code}`n" -H "cf-ipcountry: $c" `
    -A "Googlebot/2.1" "https://multi-convert.com/fr"
}

# Pages privées : redirection ou noindex, jamais 200 indexable
foreach ($u in '/fr/pricing','/fr/dashboard','/fr/verify') {
  curl.exe -s -o NUL -w "$u => %{http_code} -> %{redirect_url}`n" "https://multi-convert.com$u"
}

# Alias de sitemap : 308 vers /sitemap.xml
foreach ($u in '/sitemap_index.xml','/sitemap-index.xml','/sitemap','/sitemap.xml.gz') {
  curl.exe -s -o NUL -w "$u => %{http_code} -> %{redirect_url}`n" "https://multi-convert.com$u"
}
```

### 7.6 Côté Search Console

1. **Inspection d'URL** sur la page concernée → *Tester l'URL en direct* : doit
   afficher **Exploration autorisée : Oui**. (Ce test affiche aussi la **ligne
   exacte** du `robots.txt` responsable lorsqu'il y en a une : mécanisme 1.)
2. **Demander une indexation** : le statut « Bloquée » ne disparaît qu'après un
   nouveau crawl (24 à 72 h selon la charge de crawl).
3. **Sitemaps** : ne conserver que `https://multi-convert.com/sitemap.xml`.

