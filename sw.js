// Service worker de la carte : garde l'application elle-même disponible hors ligne.
// Les tuiles de carte et les tracés sont stockés à part (IndexedDB) par la page.
const CACHE = 'carte-relief-app';
const FILES = ['./', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// Vrai si la page affichée est plus ancienne que la version qu'on vient de télécharger
let updateReady = false;
// La page demande à l'ouverture s'il y a une mise à jour (le message spontané peut arriver avant qu'elle écoute)
self.addEventListener('message', e => { if (e.data === 'check' && updateReady && e.source) e.source.postMessage('nouvelle-version'); });

async function notify() {
  updateReady = true;
  (await self.clients.matchAll({ type: 'window', includeUncontrolled: true })).forEach(c => c.postMessage('nouvelle-version'));
}

// Stratégie : on sert tout de suite la version enregistrée (rapide, et marche sans réseau),
// puis on vérifie en arrière-plan s'il en existe une plus récente ; si oui, la page le signale.
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;   // tuiles et services externes : non concernés
  const isPage = req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
  const key = isPage ? './index.html' : req;
  if (isPage) updateReady = false;   // on sert la version la plus récente dont on dispose
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(key, { ignoreSearch: true });
    const cachedCopy = cached ? cached.clone() : null;
    // (une requête de navigation ne peut pas être réutilisée telle quelle : on refait la requête par son adresse)
    const target = isPage ? new URL('./index.html', self.registration.scope).href : req.url;
    const update = fetch(target, { cache: 'no-cache' }).then(async res => {
      if (!res.ok) return res;
      if (isPage && cachedCopy) {
        const [oldTxt, newTxt] = await Promise.all([cachedCopy.text(), res.clone().text()]);
        if (oldTxt !== newTxt) { await cache.put(key, res.clone()); await notify(); }
      } else {
        await cache.put(key, res.clone());
      }
      return res;
    }).catch(() => null);
    if (cached) { e.waitUntil(update); return cached; }
    return (await update) || new Response('Carte indisponible hors ligne pour le moment.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  })());
});
