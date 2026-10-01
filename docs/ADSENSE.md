# Google AdSense — intégration & activation

> État au dernier commit : **intégration complète, désactivée par défaut**.
> Le site ne contacte jamais Google tant que `NEXT_PUBLIC_ADSENSE_ENABLED` n'est
> pas à `true`. Activer la monétisation ne demande **aucune modification de code**.

## 1. Ce qui est en place

| Élément | Fichier | Rôle |
| --- | --- | --- |
| Configuration (IDs, slots, pages interdites) | `src/config/ads.ts` | source unique de vérité |
| Chargement de `adsbygoogle.js` (+ CMP Google) | `src/components/ads/ad-script.tsx` | injecté dans le `<head>` |
| Blocs publicitaires | `src/components/ads/ad-slot.tsx` | `<ins class="adsbygoogle">` |
| Bannière cookies + retrait du consentement | `src/components/consent/cookie-consent.tsx`, `cookie-settings.tsx` | RGPD |
| Hook de consentement réactif | `src/hooks/use-cookie-consent.ts` | événement `cookie-consent-changed` |
| Emplacements | `src/app/[locale]/layout.tsx` (header + footer), `src/app/[locale]/blog/[slug]/page.tsx` (in-content) | |
| Balise de vérification du compte | `src/app/layout.tsx` → `<meta name="google-adsense-account">` | |
| `ads.txt` | `public/ads.txt` | https://multi-convert.com/ads.txt |
| CSP autorisant Google | `next.config.js` | sinon les annonces sont bloquées par le navigateur |

## 2. Comportement par défaut (sans configuration)

* aucune requête vers `googlesyndication.com` / `doubleclick.net` ;
* `AdScript` et `AdSlot` retournent `null` : zéro impact sur le poids de page ;
* la page `/cookies` (section 4) reste le point de retrait du consentement.

## 3. Activer AdSense (ordre à respecter)

1. **Candidature** : https://adsense.google.com → *Sites* → ajouter
   `multi-convert.com`. Le site doit être en ligne, avec du contenu original,
   une politique de confidentialité et une page cookies (déjà présentes).
2. **Blocs d'annonces** : AdSense → *Annonces* → *Par bloc d'annonces* →
   créer 3 blocs et relever leurs IDs :
   * `header` → « Display responsive » horizontal ;
   * `in-content` → « Display responsive » rectangle ;
   * `footer` → « Display responsive » horizontal.
3. **Variables d'environnement** (Coolify → *Environment Variables* → onglet
   **build time**, ou `--build-arg` pour un build Docker manuel) :

   ```env
   NEXT_PUBLIC_ADSENSE_ENABLED=true
   NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-5343389597650456
   NEXT_PUBLIC_ADSENSE_SLOT_HEADER=1234567890
   NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT=1234567890
   NEXT_PUBLIC_ADSENSE_SLOT_FOOTER=1234567890
   ```

   ⚠️ `NEXT_PUBLIC_*` est **inlinée au build** : une variable définie uniquement
   à l'exécution (runtime) n'a **aucun effet** → rebuild obligatoire.
   Les `ARG` / build-args correspondants existent dans le `Dockerfile`, les
   fichiers `docker-compose*.yml` et les workflows
   `.github/workflows/docker-publish*.yml` : il suffit de définir les variables
   d'environnement (elles sont reprises telles quelles).
4. **CMP Google (obligatoire pour l'Europe)** : depuis le 16 janvier 2024,
   Google n'affiche **aucune annonce** aux visiteurs de l'EEE, du Royaume-Uni
   et de la Suisse si le site n'utilise pas une CMP certifiée (TCF v2.2).
   AdSense → *Confidentialité et messagerie* → *Règlement de l'UE pour les
   messages de consentement* → créer un message, puis :

   ```env
   NEXT_PUBLIC_ADSENSE_CMP_ID=pub-5343389597650456
   NEXT_PUBLIC_ADSENSE_REQUIRE_CONSENT=false
   ```

   Tant que `CMP_ID` est vide, garder `REQUIRE_CONSENT=true` : la bannière
   interne gouverne et les annonces ne sont pas servies en Europe (les
   visiteurs hors EEE sont servis normalement).
5. **Vérifier** : `https://multi-convert.com/ads.txt` doit contenir
   `google.com, pub-5343389597650456, DIRECT, f08c47fec0942fa0`
   (AdSense → *Sites* → *ads.txt* doit afficher « Autorisé »).

## 4. Variables reconnues

| Variable | Défaut | Effet |
| --- | --- | --- |
| `NEXT_PUBLIC_ADSENSE_ENABLED` | `false` | interrupteur maître |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | `ca-pub-5343389597650456` | identifiant éditeur |
| `NEXT_PUBLIC_ADSENSE_CMP_ID` | *(vide)* | CMP Google Funding Choices |
| `NEXT_PUBLIC_ADSENSE_REQUIRE_CONSENT` | `true` | exige `cookie-consent=accepted` |
| `NEXT_PUBLIC_ADSENSE_SLOT_HEADER` | *(vide)* | bloc haut de page (toutes pages autorisées) |
| `NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT` | *(vide)* | bloc dans les articles de blog |
| `NEXT_PUBLIC_ADSENSE_SLOT_FOOTER` | *(vide)* | bloc bas de page |

Un bloc dont l'ID est vide n'est **pas** rendu : on peut activer uniquement le
header dans un premier temps, puis compléter.

## 5. Conformité (règles appliquées par le code)

* **Aucune annonce avant consentement** : `AdScript` et `AdSlot` attendent
  `cookie-consent=accepted`. Refus ou absence de choix ⇒ rien n'est chargé.
* **Réactif** : si l'utilisateur accepte après le chargement, les scripts et les
  blocs sont injectés immédiatement (événement `cookie-consent-changed`), sans
  rechargement de page.
* **Retrait aussi simple que l'octroi** : `/cookies` → section 4 → boutons
  « Accepter / Refuser » ; le changement recharge la page pour purger les
  balises déjà posées par Google.
* **Pages sans contenu** : `adsConfig.blockedPathPrefixes` interdit les annonces
  sur `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify*`,
  `/403`, `/admin`, `/dashboard`, `/api` (toutes les langues).
* **Pas de CLS** : chaque `<ins>` réserve 90 px de hauteur et l'emplacement est
  replié si Google répond `unfilled` / `error`.
* **CSP** : `next.config.js` n'autorise que les domaines Google strictement
  nécessaires (aucun `*` sur `script-src`).

## 6. Diagnostic

| Symptôme | Cause probable |
| --- | --- |
| Rien ne s'affiche, aucune requête réseau | `NEXT_PUBLIC_ADSENSE_ENABLED` ≠ `true`, ID de bloc vide, ou image non rebuildée |
| `Refused to load the script 'https://pagead2.googlesyndication.com/...'` | CSP servie par un cache/proxy : contrôler l'en-tête `Content-Security-Policy` de la réponse |
| Bloc affiché mais vide | compte non approuvé, `ads.txt` absent, ou CMP manquante pour un visiteur européen |
| Annonces visibles sans consentement | `NEXT_PUBLIC_ADSENSE_REQUIRE_CONSENT=false` sans CMP configurée |
| « Fichier ads.txt introuvable » dans AdSense | `/ads.txt` non déployé (vérifier `public/ads.txt` dans l'image) |

Dans la console du navigateur, l'absence d'erreur `adsbygoogle.push()` et la
présence de requêtes vers `securepubads.g.doubleclick.net` /
`googleads.g.doubleclick.net` confirment que la chaîne fonctionne de bout en
bout.

## 7. Désactiver

Remettre `NEXT_PUBLIC_ADSENSE_ENABLED=false` et redéployer. Aucune autre
action : tout le HTML publicitaire disparaît des pages et le script n'est plus
chargé.

