# Stratégie B2B — Multi Convert

> Document de travail. Objectif : passer d'un site gratuit à des clients qui paient,
> sans jamais afficher une information invérifiable.

---

## 1. Règle de base : aucune affirmation non démontrable

Un acheteur B2B vérifie systématiquement les points suivants. Les inventer détruit la crédibilité
(et expose à des sanctions) :

| Ce qui est vérifié | Pourquoi c'est risqué de mentir |
|---|---|
| Logos clients | Contrefaçon de marque (art. L713-2 CPI) |
| « 500+ clients », « 50M+ conversions » | Pratiques commerciales trompeuses (art. L121-2 Code conso) |
| ISO 27001 / SOC 2 / HDS | Certifications non obtenues = tromperie sur la qualité |
| Témoignages et notes | Faux avis = violation des règles Google sur les données structurées |
| Adresse, téléphone, SIREN | Mentions obligatoires (LCEN art. 6-III) |

**Règle applicable** : ne publier un chiffre que s'il est mesurable dans nos propres logs.

---

## 2. Offre de démarrage : programme pilote

Paramètres dans `src/config/site.ts` (`siteConfig.pilot`) :

- Durée : 45 jours
- Places : 3 par secteur
- Prix : 0 € pendant le pilote
- Tarif post-pilote : **annoncé avant le début du pilote**, avec remise de fidélité

### Ce qui est inclus
Accès complet aux outils, 10 000 conversions/mois, prise en main d'une heure, canal de support direct,
démonstration sur les fichiers du client, bilan chiffré.

### Ce qui n'est PAS inclus (assumé)
SLA contractuel, hébergement dédié ou on-premise, SSO, certification ISO/SOC 2, hébergement HDS.

### Contrepartie demandée
Deux points de 30 min par mois, un témoignage chiffré en fin de pilote, l'autorisation de citer le nom
de l'entreprise, des retours d'usage priorisés.

> Sans contrepartie écrite, un pilote gratuit devient un service gratuit à vie.

---

## 3. Segments cibles (par ordre de priorité)

1. **Cabinets juridiques & notariaux** — fusion de dossiers, numérotation Bates, OCR de pièces
   scannées, caviardage, signature. Argument différenciant : les fichiers ne sont pas confiés à un
   service tiers.
2. **Expertise comptable & paie** — PDF vers Excel, OCR de factures, fusion de justificatifs.
3. **E-commerce & marketplaces** — conversion par lot en WebP/AVIF, redimensionnement, filigrane.
4. **Agences, imprimeurs, studios** — formats d'impression, vidéo/audio, lots de 100+ fichiers.

Segments à traiter plus tard : santé (HDS requis), secteur public (cycle d'achat long).

---

## 4. Prospection (les 30 premiers jours)

1. Choisir **deux** segments maximum.
2. Constituer une liste de 20 à 30 prospects nommés (dirigeant, associé, office manager).
3. Approche directe : email personnalisé, LinkedIn, téléphone. Pas de publicité.
4. Démonstration : demander 3 fichiers réels au prospect et les traiter en direct.
5. Onboarding : prise en main d'une heure, puis autonomie.
6. Mesurer : temps gagné, volume traité, incidents.

---

## 5. Prérequis techniques avant la première démarche

- [x] Capture des demandes fonctionnelle (`POST /api/leads`, modèle Prisma `Lead`)
- [x] Contact et mentions légales publiés (`/contact`, `/legal`)
- [ ] Renseigner `siteConfig.company` (SIREN, adresse, hébergeur)
- [ ] Clés API utilisables (`/dashboard/api-keys` est encore un écran d'attente)
- [ ] Multi-utilisateurs / rôles
- [ ] Registre RGPD + accord de sous-traitance (DPA)
- [ ] Facturation (Stripe non branché à ce jour)

---

## 6. Points forts à exploiter

- **Traitement côté serveur, sans sous-traitance à un tiers** — argument fort pour les métiers
  réglementés, à condition de rester exact (voir section 7).
- **Étendue fonctionnelle** : PDF (Bates, caviardage, signature, sécurité), images, médias.
- **Prix inférieur** aux suites propriétaires.

## 7. Traitement local : objectif à ne pas survendre

À ce jour, les fichiers **sont transmis au serveur** pour traitement, puis supprimés.
Un mode **100 % local dans le navigateur** (aucun envoi de fichier) est en cours de développement ;
il constituerait un différenciant majeur pour le juridique et la santé.

Tant qu'il n'est pas livré, la page `/privacy` décrit le fonctionnement réel.

---

## 8. Concurrents à étudier

| Concurrent | À observer |
|---|---|
| iLovePDF, PDF24 | Une page dédiée par outil (moteur du trafic SEO) |
| Smallpdf | Onboarding et dosage du freemium |
| CloudConvert | Modèle de référence pour une API : docs, sandbox, webhooks, page statut |
| Stirling PDF | Open source auto-hébergeable : menace directe sur l'argument souveraineté |
| Yousign | Acteur français sur la signature électronique |
| Squoosh, TinyPNG | Optimisation d'images, UX minimale et rapide |
