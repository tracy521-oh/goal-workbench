/* 植物生长日记 Service Worker：离线缓存应用全部资源 */
const CACHE_NAME = 'plant-diary-v5';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './js/utils.js',
  './js/store.js',
  './js/ui.js',
  './js/home.js',
  './js/study.js',
  './js/finance.js',
  './js/life.js',
  './js/review.js',
  './js/settings.js',
  './js/politics.js',
  './js/reading.js',
  './js/wrongq.js',
  './js/writer.js',
  './js/reader.js',
  './js/app.js',
  './icons/icon.svg'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    }).catch(function (e) {
      console.warn('SW cache install failed', e);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; })
          .map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (resp) {
        // 不缓存动态资源，仅缓存已知静态资源
        return resp;
      }).catch(function () {
        return caches.match('./index.html');
      });
    })
  );
});
