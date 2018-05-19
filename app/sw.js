const staticCacheName = 'fend-restrev-1';

const staticCacheNameUrls = [
  '/scripts/dbhelper.js',
  '/scripts/home.js',
  '/scripts/restaurant.js',
  '/scripts/sw_register.js',
  '/index.html',
  '/restaurant.html',
  '/manifest.json',
  '/favicon.ico',
  '/data/restaurants.json',
  '/styles/home.css',
  '/styles/restaurant.css',
  '/images/1.jpg',
  '/images/2.jpg',
  '/images/3.jpg',
  '/images/4.jpg',
  '/images/5.jpg',
  '/images/6.jpg',
  '/images/7.jpg',
  '/images/8.jpg',
  '/images/9.jpg',
  '/images/10.jpg',
  '/images/restaurant_pin_map-48.png'
];

function servePhoto(request) {
  // Regex to store the assets images without type
  const storageUrl = request.url.replace(/-(s|m|l|xl)\.(jpg|webp|png|svg)$/, '');

  return caches.open(staticCacheName)
    .then(cache => cache.match(storageUrl)
      .then((response) => {
        if (response) return response;

        return fetch(request).then((networkResponse) => {
          cache.put(storageUrl, networkResponse.clone());
          return networkResponse;
        }).catch(() => console.log('Fetch Images fail', request.url));
      }));
}


self.addEventListener('install', (event) => {
  // Open a cache and add the static resources
  event.waitUntil(caches.open(staticCacheName)
    .then(cache => cache.addAll(staticCacheNameUrls))
    .catch(error => console.log('Error addingAll to cache, ', error)));
});

self.addEventListener('activate', (event) => {
  console.log('Activating new service worker...');
  const cacheWhitelist = [staticCacheName];

  // Remove old cache versions
  event.waitUntil(caches.keys().then((cacheNames) => {
    Promise.all(cacheNames.map((cacheName) => {
      if (cacheWhitelist.indexOf(cacheName) === -1) {
        caches.delete(cacheName);
      }
      return caches;
    }));
  }));
});

self.addEventListener('fetch', (event) => {
  console.log('Fetch event for ', event.request.url);

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname.startsWith('/images/')) {
      console.log('Adding a new image to cache, ', event.request);
      event.respondWith(servePhoto(event.request));
      return;
    }
  }

  event.respondWith(caches.match(event.request)
    .then(response => response || fetch(event.request))
    .catch(error => console.log('Error in cache.match, ', error)));
});

self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
