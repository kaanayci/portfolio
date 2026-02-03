const CACHE_NAME = 'weather-dashboard-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './assets/css/style.css',
    './assets/css/style-extensions.css',
    './assets/css/style-favs.css',
    './assets/css/components/base.css',
    './assets/css/components/sidebar.css',
    './assets/css/components/weather.css',
    './assets/css/components/favorites.css',
    './assets/css/components/panorama.css',
    './assets/css/components/map-compare.css',
    './assets/css/components/animations.css',
    './assets/js/app.js',
    './assets/js/app-favs.js',
    './assets/js/modules/config.js',
    './assets/js/modules/ui.js',
    './assets/js/modules/weather.js',
    './assets/js/modules/map.js',
    './assets/js/modules/favorites.js',
    './assets/js/modules/panorama.js',
    './assets/js/modules/compare.js',
    './assets/icons/icon-192.svg',
    './assets/icons/icon-512.svg',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://code.jquery.com/jquery-3.7.1.min.js',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching all assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[Service Worker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
    // API Caching Strategy (Stale While Revalidate)
    if (event.request.url.includes('api.openweathermap.org')) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((cachedResponse) => {
                    const fetchPromise = fetch(event.request).then((networkResponse) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                    return cachedResponse || fetchPromise;
                });
            })
        );
        return;
    }

    // Static Assets Strategy (Cache First, fall back to network)
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
