// Bump CACHE when shipping new files so old caches are removed.
const CACHE = 'csj-shell-v4';
const SHELL = ['./', 'index.html', 'manifest.json', 'css/app.css',
  'js/main.js', 'js/core/storage.js', 'js/core/modules.js', 'js/ui/dom.js', 'js/ui/sidebar.js',
  'js/backup/backup.js', 'js/pwa/pwa.js', 'js/views/basic.js', 'js/views/settings.js', 'js/views/profile.js', 'js/modules/configs.js', 'js/modules/engine.js', 'js/core/demo.js', 'js/pwa/banner.js', 'js/core/records.js', 'js/views/dashboard.js', 'js/views/skills.js', 'js/views/sst.js', 'js/views/timeline.js', 'js/reports/data.js', 'js/reports/story.js', 'js/reports/gaps.js', 'js/reports/monthly.js', 'js/reports/printable.js', 'js/reports/index.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('csj-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Only app files are cached here. User data lives in localStorage and is never touched by the service worker.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => {
    const net = fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => null);
    if (hit) { net.catch(() => {}); return hit; }
    return net.then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()));
  }));
});
