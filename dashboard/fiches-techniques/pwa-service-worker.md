# Service Worker et Stratégies de Cache PWA

## Définition
Un Service Worker est un script JavaScript qui s'exécute indépendamment du thread principal du navigateur. Il agit comme un proxy entre l'application et le réseau, permettant :
- L'interception des requêtes réseau (`fetch`)
- La mise en cache intelligent des ressources
- Le fonctionnement hors-ligne
- Les notifications push
- La synchronisation en arrière-plan

Une Progressive Web App (PWA) utilise le Service Worker pour offrir une expérience "app-like" avec installation possible, mode hors-ligne, et chargement rapide.

## Contexte d'utilisation
Les Service Workers sont essentiels pour :
- Améliorer les performances en servant le contenu depuis le cache
- Permettre l'accès offline aux pages déjà visitées
- Réduire la consommation de bande passante
- Créer une interface réactive même sur connexions lentes
- Synchroniser les données en arrière-plan quand la connexion revient

## Exemples de code

### 1) Installation: Mise en cache des assets statiques
```javascript
const CACHE_NAME = 'weather-dashboard-v2';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    // Styles locaux
    './assets/css/style.css',
    './assets/css/style-extensions.css',
    './assets/css/components/base.css',
    './assets/css/components/weather.css',
    // Scripts locaux
    './assets/js/app.js',
    './assets/js/modules/ui.js',
    './assets/js/modules/weather.js',
    './assets/js/modules/map.js',
    // Icons
    './assets/icons/icon-192.svg',
    './assets/icons/icon-512.svg',
    // ⚠️ Librairies CDN (aussi en cache !)
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://code.jquery.com/jquery-3.7.1.min.js',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Event: Installation du Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching all assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});
```

### 2) Activation: Nettoyage des anciens caches
```javascript
// Event: Activation du Service Worker (anciennes versions supprimées)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                // Supprimer les anciens caches si version change
                if (key !== CACHE_NAME) {
                    console.log('[Service Worker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    // Reprendre le contrôle immédiatement sans attendre les anciens clients
    return self.clients.claim();
});
```

### 3) Stratégie "Stale-While-Revalidate" pour les API calls
```javascript
// Pour les appels à l'API météo: Servir le cache MAIS aussi mettre à jour
self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('api.openweathermap.org')) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((cachedResponse) => {
                    // Créer une requête réseau en parallèle
                    const fetchPromise = fetch(event.request).then((networkResponse) => {
                        // Mettre à jour le cache avec la nouvelle réponse
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });

                    // Retourner le cache s'il existe, sinon attendre le réseau
                    return cachedResponse || fetchPromise;
                });
            })
        );
        return;  // ⚠️ Important: sortir avant la stratégie Cache-First
    }
    // ... Continuer avec Cache-First pour static assets
});
```

### 4) Stratégie "Cache First" pour les assets statiques
```javascript
// Pour tout le reste (CSS, JS, images): Cache en priorité
self.addEventListener('fetch', (event) => {
    // Cette partie s'exécute si on n'a pas retourné plus tôt
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Si trouvé en cache: retourner immédiatement
            if (response) {
                return response;
            }

            // Sinon: chercher sur le réseau
            return fetch(event.request).catch(() => {
                // Si offline et pas en cache: on ne peut rien faire
                // (optionnel: retourner une page offline)
                return new Response('Offline - Resource not available');
            });
        })
    );
});
```

### 5) Cycle de vie complet du Service Worker
```javascript
const CACHE_NAME = 'weather-dashboard-v2';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    // ... assets list
];

// ========== 1. INSTALL ==========
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE))
            .then(() => {
                console.log('[SW] All assets cached');
                // Optionnel: self.skipWaiting() pour activer immédiatement
            })
    );
});

// ========== 2. ACTIVATE ==========
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (key !== CACHE_NAME) {
                    console.log('[SW] Deleting old cache:', key);
                    return caches.delete(key);
                }
            }));
        }).then(() => self.clients.claim())
    );
});

// ========== 3. FETCH ==========
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // API calls: Stale-While-Revalidate
    if (request.url.includes('api.openweathermap.org')) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(request).then(cachedResponse => {
                    const fetchPromise = fetch(request)
                        .then(networkResponse => {
                            cache.put(request, networkResponse.clone());
                            return networkResponse;
                        });

                    return cachedResponse || fetchPromise;
                });
            })
        );
        return;
    }

    // Static assets: Cache-First
    event.respondWith(
        caches.match(request)
            .then(response => response || fetch(request))
            .catch(() => new Response('Offline'))
    );
});
```

### 6) Versioning: Comment updater le cache
```javascript
// v1 -> v2 (Mettre en cache une nouvelle librairie)
// Avant:
// const CACHE_NAME = 'weather-dashboard-v1';

// Après:
const CACHE_NAME = 'weather-dashboard-v2';  // Nouveau nom = nouvelle activation
const ASSETS_TO_CACHE = [
    // ... assets existants
    'https://cdn.jsdelivr.net/npm/chart.js@4.0.0',  // Nouvelle version
];

// L'event 'activate' supprimera automatiquement 'weather-dashboard-v1'
// Les clients rechargeront et téléchargeront la v2
```

### 7) Pourquoi cacher les URLs CDN ?
```javascript
// Sans cache des CDN:
// - Premier chargement: dépend de OpenWeatherMap + jQuery + Leaflet + ChartJS
// - Offline après premier chargement: app cassée (pas de jQuery)

// Avec cache des CDN:
// - Offline: jQuery/Leaflet/ChartJS viennent du cache
// - App fonctionne partiellement (UI statique, pas d'API météo en live)
// - Meilleure UX même sans réseau

ASSETS_TO_CACHE = [
    // Scripts critiques pour l'UI
    'https://code.jquery.com/jquery-3.7.1.min.js',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://cdn.jsdelivr.net/npm/chart.js',
    // Styles
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
];
```

## Cas d'usage dans mon projet

**Dashboard météo (sw.js) :**
1. **Première visite**: Install event télécharge tous les assets (HTML, CSS, JS, CDN)
2. **Rechargement**: Cache-First → images/CSS du cache (instantané)
3. **Appel API météo**: Stale-While-Revalidate → retour du cache + mise à jour en bg
4. **Mode offline**: API calls échouent mais app reste navigable avec données en cache
5. **Update app**: Changer `CACHE_NAME = 'v3'` → activate supprime v2, clients recharient la v3

**Avantage par rapport au Restaurant (Vite PWA) :**
- Ce dashboard utilise un SW manuel écrit à la main
- Le restaurant utilise Vite PWA plugin qui génère tout automatiquement
- Le SW manuel offre plus de contrôle (deux stratégies différentes selon l'URL)
- Le plugin Vite simplifie mais moins flexible

## Pièges à éviter

1. **Oublier le `cache.put()` lors de l'update** :
   ```javascript
   // ❌ Cache jamais mis à jour
   const fetchPromise = fetch(request).then(response => response);
   return cachedResponse || fetchPromise;

   // ✅ Cache mis à jour en arrière-plan
   const fetchPromise = fetch(request).then(response => {
       cache.put(request, response.clone());  // Mettre en cache la nouvelle réponse
       return response;
   });
   ```

2. **Ne pas versioner le cache** :
   ```javascript
   // ❌ Si assets changent, clients gardent les vieilles versions
   const CACHE_NAME = 'weather-dashboard';

   // ✅ Changer la version = force le re-cache
   const CACHE_NAME = 'weather-dashboard-v2';
   ```

3. **Cacher les URLs API directes** :
   ```javascript
   // ❌ Cacher les réponses API brutes (données stables uniquement)
   cache.addAll(['https://api.openweathermap.org/...']).catch(...);

   // ✅ Stale-While-Revalidate avec fetch event
   // (Automatique mise à jour, pas de stale data)
   ```

4. **Ne pas gérer les fetch en erreur** :
   ```javascript
   // ❌ Crash si offline sans cache
   event.respondWith(fetch(request));

   // ✅ Fallback gracieux
   event.respondWith(
       fetch(request)
           .catch(() => new Response('Offline - try when online'))
   );
   ```

5. **Registered mais pas en usage** :
   ```javascript
   // ❌ SW enregistré mais première visite ne l'utilise pas encore
   // (Les clients existants continuent à utiliser l'ancien)

   // ✅ Utiliser skipWaiting pour activation immédiate (à utiliser avec prudence)
   self.addEventListener('install', e => {
       e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))
           .then(() => self.skipWaiting())
       );
   });
   ```

## Analyse personnelle
Le Service Worker a été l'une de mes plus grandes découvertes en développement web. Avant, je pensais que les apps offline étaient l'apanage des apps natives.

Comprendre le cycle de vie (install → activate → fetch) m'a pris du temps. J'ai d'abord crashé l'app en oubliant le fallback offline, puis en ne mettant pas en cache les CDN (l'app était inutilisable hors ligne).

La différence entre "Cache-First" et "Stale-While-Revalidate" était cruciale :
- Cache-First: Rapide, mais données stales jusqu'au prochain reload
- Stale-While-Revalidate: Meilleures données, mais utilise plus de bande passante

J'ai choisi les deux selon le type de requête, ce qui reflète une compréhension nuancée des trade-offs.

Découvrir que les CDN (jQuery, Leaflet, ChartJS) pouvaient aussi être en cache a changé mon approche de la fiabilité offline. Avant, je pensais que sans backend, c'était impossible. Maintenant, je sais que l'app peut fonctionner partiellement hors ligne.

## Sources
- https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- https://web.dev/service-workers/
- https://web.dev/offline-cookbook/ (Offline patterns)
- https://web.dev/workbox/ (Librairie pour SW simplifiée)
- MDN - Caching strategies
- https://www.w3.org/TR/service-workers/ (Spécification officielle)
