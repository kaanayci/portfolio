# Service Worker et Cache PWA

## Description
Le projet utilise un Service Worker (`sw.js`) pour permettre le fonctionnement hors-ligne et améliorer les performances de chargement.

## Stratégie de Cache
La stratégie utilisée est **"Cache First"** pour les assets statiques, avec une liste prédéfinie (`ASSETS_TO_CACHE`).

### Fonctionnement
1.  **Installation (`install`)** : Le Service Worker met en cache immédiatement tous les fichiers critiques :
    *   Fichiers HTML, CSS, JS locaux.
    *   Librairies externes (jQuery, Leaflet, Chart.js) via leurs URLs CDN.
2.  **Activation (`activate`)** : Nettoyage des anciens caches si la version (`CACHE_NAME`) change.
3.  **Interception (`fetch`)** :
    *   Vérifie si la requête est dans le cache.
    *   Si OUI -> Retourne la version cachée (Rapide/Hors-ligne).
    *   Si NON -> Effectue la requête réseau classique.

## Code Clé
```javascript
const CACHE_NAME = 'weather-dashboard-v1';
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
```

## Exemple de code
![alt text](pwa-service-worker.png)

Cette approche garantit que l'interface utilisateur (Shell) se charge instantanément même en conditions de réseau dégradées.
