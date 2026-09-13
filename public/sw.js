/* Service Worker — Multi Convert (PWA) */
/*
 * ⚠️ RÈGLE D'OR : ne JAMAIS mettre en cache de HTML, de payload RSC
 * (requêtes Next.js `?_rsc=...` avec l'en-tête `RSC: 1`) ni de JSON.
 * Ces réponses contiennent le contenu traduit et le HTML rendu : les mettre
 * en cache sert d'anciennes pages (ex. une page restée en français après un
 * changement de langue) et provoque des incohérences d'hydratation.
 *
 * On ne met donc en cache QUE les vrais fichiers statiques (images, polices,
 * médias) reconnus par leur extension.
 */
const CACHE_NAME = 'multi-convert-v4';
const PRECACHE = ['/manifest.webmanifest', '/icon-192.png', '/icon-512.png'];

// Extensions considérées comme des assets statiques immuables
const STATIC_ASSET =
  /\.(?:png|jpe?g|gif|svg|webp|avif|ico|bmp|woff2?|ttf|otf|eot|mp4|webm|ogg|mp3|wav|webmanifest|txt|xml)$/i;

// Page affichée si la navigation échoue (hors-ligne)
const OFFLINE_HTML =
  '<!doctype html><html lang="fr"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<title>Hors ligne — Multi Convert</title></head>' +
  '<body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center">' +
  '<div><h1>Vous êtes hors ligne</h1><p>Reconnectez-vous à Internet puis rechargez la page.</p></div>' +
  '</body></html>';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Ne pas mettre en cache les API (authentification, conversions, etc.)
  if (url.pathname.startsWith('/api/')) return;

  // IMPORTANT : ne jamais intercepter/mettre en cache les assets Next.js
  // (chunks webpack, HMR, images optimisées). Next.js gère déjà leur cache via
  // des noms hashés ; les mettre en cache ici sert d'anciens chunks et provoque
  // l'erreur « Cannot read properties of undefined (reading 'call') ».
  if (url.pathname.startsWith('/_next/')) return;

  // Navigation : toujours le réseau (jamais de HTML périmé servi depuis le cache)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(OFFLINE_HTML, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          })
      )
    );
    return;
  }

  // Requêtes RSC / réponses dynamiques / tout ce qui n'est pas un fichier
  // statique : on laisse Next.js et le navigateur gérer, aucune mise en cache.
  if (!STATIC_ASSET.test(url.pathname)) return;

  // Assets statiques (icônes, polices, médias publics) : cache d'abord, puis réseau
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
    )
  );
});
