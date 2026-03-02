# Intégration Carte Interactive (Leaflet)

## Définition
Leaflet est une librairie JavaScript open-source pour créer des cartes interactives et réactives. Elle permet de visualiser des données géographiques, placer des marqueurs personnalisés, gérer les interactions de zoom/pan et intégrer différents fournisseurs de tuiles (OpenStreetMap, Google Maps, Mapbox, etc.). Dans ce projet, elle affiche 180+ villes suisses avec données météorologiques.

## Contexte d'utilisation
Les cartes interactives sont essentielles pour :
- Visualiser des données géolocalisées (magasins, événements, weather stations)
- Permettre aux utilisateurs d'explorer une région à différents niveaux de zoom
- Améliorer l'UX en montrant des informations contextuelles sur des marqueurs
- Intégrer des API externes (météo, géocodage) basées sur les coordonnées

## Exemples de code

### 1) Initialisation de la carte avec Leaflet
```javascript
function initMap() {
    if (!document.getElementById('map')) return;
    if ($('#map').height() === 0) $('#map').css('height', '500px');

    // Nettoyer l'instance précédente
    if (mapInstance) { mapInstance.remove(); mapInstance = null; }

    // Créer une nouvelle carte centrée sur la Suisse
    mapInstance = L.map('map').setView([46.8182, 8.2275], 8);

    // Ajouter le fonds de carte (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance);

    // IMPORTANT: Redessiner la carte après chargement (problème SPA)
    setTimeout(() => { mapInstance.invalidateSize(); }, 200);

    // Mise à jour initiale
    setTimeout(updateVisibleCities, 400);
}
```

### 2) Filtre adaptatif basé sur le niveau de zoom
```javascript
// Seuil de population selon le zoom → plus on zoome, plus de villes
function getMinPopulation(zoom) {
    if (zoom <= 7)  return 80000;   // ~8 grandes villes
    if (zoom <= 8)  return 30000;   // ~20 villes
    if (zoom <= 9)  return 15000;   // ~40 villes
    if (zoom <= 10) return 8000;    // ~65 villes
    if (zoom <= 11) return 5000;    // ~90 villes
    if (zoom <= 12) return 3000;    // ~130 villes
    return 1000;                    // toutes les villes
}

// Distance minimale entre marqueurs (en degrés) pour éviter chevauchements
function getMinDistance(zoom) {
    if (zoom <= 7)  return 0.5;
    if (zoom <= 8)  return 0.3;
    if (zoom <= 9)  return 0.15;
    return 0.015;
}
```

### 3) Fonction de mise à jour avec anti-chevauchement
```javascript
function updateVisibleCities() {
    const zoom = mapInstance.getZoom();
    const bounds = mapInstance.getBounds();
    const minPop = getMinPopulation(zoom);
    const minDist = getMinDistance(zoom);

    // Supprimer tous les marqueurs existants
    currentMarkers.forEach(m => mapInstance.removeLayer(m));
    currentMarkers = [];

    // Filtrer les villes par population et viewport
    const visible = swissCities.filter(c =>
        c.pop >= minPop && bounds.contains([c.lat, c.lon])
    );

    const placed = [];

    visible.forEach(city => {
        // Éviter chevauchements (les plus grandes ont priorité)
        if (isTooClose(city.lat, city.lon, placed, minDist)) return;
        placed.push({ lat: city.lat, lon: city.lon });

        // Utiliser le cache météo si disponible
        if (weatherCache[city.n]) {
            const marker = createWeatherMarker(city, weatherCache[city.n]);
            marker.addTo(mapInstance);
            currentMarkers.push(marker);
        } else {
            // Appel API asynchrone
            $.getJSON(`https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&units=${currentUnit}&lang=fr&appid=${WEATHER_API_KEY}`)
            .done(function(data) {
                weatherCache[city.n] = data;
                // Vérifier que la carte n'a pas bougé
                if (mapInstance.getBounds().contains([city.lat, city.lon])) {
                    const marker = createWeatherMarker(city, data);
                    marker.addTo(mapInstance);
                    currentMarkers.push(marker);
                }
            });
        }
    });
}
```

### 4) Marqueurs météo personnalisés avec icônes
```javascript
function createWeatherMarker(city, data) {
    const temp = Math.round(data.main.temp);
    const desc = data.weather[0].description;
    const icon = data.weather[0].icon;

    // Créer une icône personnalisée (div + image)
    const markerIcon = L.divIcon({
        className: 'weather-map-marker',
        html: `<div class="wm-label">
                   <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}">
                   <span>${temp}°</span>
               </div>
               <div class="wm-name">${city.n}</div>`,
        iconSize: [70, 50],
        iconAnchor: [35, 45]
    });

    // Popup au clic
    const popupContent = `
        <div style="text-align:center;min-width:120px">
            <b>${city.n}</b><br>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" style="width:50px"><br>
            <span style="font-size:1.3rem;font-weight:bold">${temp}°C</span><br>
            <i>${desc}</i><br>
            <small>💧 ${data.main.humidity}% &nbsp; 💨 ${Math.round(data.wind.speed * 3.6)} km/h</small>
        </div>`;

    return L.marker([city.lat, city.lon], { icon: markerIcon }).bindPopup(popupContent);
}
```

### 5) Pattern Debounce pour les événements zoom/pan
```javascript
let updateTimeout = null;

function debouncedUpdate() {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(updateVisibleCities, 300);
}

// Écouter les changements de zoom et pan
mapInstance.on('zoomend', debouncedUpdate);
mapInstance.on('moveend', debouncedUpdate);
```

## Cas d'usage dans mon projet
Le dashboard affiche une carte de la Suisse avec 180+ villes. À chaque zoom/pan, le système :
1. Filtre les villes par population minimale (moins de villes affichées quand dézoomé)
2. Récupère ou utilise les données météo cachées
3. Évite les chevauchements visuels avec une distance minimale
4. Utilise le debounce pour ne pas surcharger l'API avec trop d'appels

La base de données contient des villes de toutes tailles (de 430 000 habitants pour Zurich à 2 000 pour de petits villages).

## Pièges à éviter
1. **invalidateSize() oublié** : Après changement de tab ou affichage d'un modal, la carte ne se redessine pas correctement. Solution: utiliser `setTimeout()` pour laisser le DOM se stabiliser.
2. **Initialisation multiple** : Si `initMap()` est appelée 2x, Leaflet lève une erreur. Toujours vérifier et nettoyer l'instance précédente avec `.remove()`.
3. **Trop de marqueurs à la fois** : Afficher 180+ marqueurs cause des freezes. Solution: adapter le filtre au zoom niveau, utiliser le cache et debouncer.
4. **API calls non limités** : Sans cache, chaque mouvement de carte retélécharge les mêmes données. Utiliser `weatherCache` pour stocker en mémoire.
5. **Popups non fermées** : Les clics sur marqueurs ouvrent des popups. Vérifier que le clic sur un nouveau marqueur ferme l'ancienne popup automatiquement (Leaflet le fait par défaut).

## Analyse personnelle
Ce projet m'a montré l'importance de la performance en travaillant avec des données géographiques. J'ai appris que :
- Les maps interactives avec 100+ marqueurs nécessitent une réflexion sur le filtering et le caching
- Le zoom-based filtering est plus efficace que simplement cacher les éléments CSS
- Les debounce patterns sont essentiels pour limiter les appels API coûteux
- Les SPA créent des pièges subtils (reinitialisation, invalidateSize) qu'il faut connaître

Initialement, j'affichais toutes les villes à la fois (très lent). En implémentant les seuils adaptatifs, les performances se sont nettement améliorées. C'est une bonne leçon en optimisation progressive.

## Sources
- https://leafletjs.com/
- https://leafletjs.com/reference.html (API Leaflet)
- https://openstreetmap.org/
- MDN Web Docs - Debounce patterns
- https://api.openweathermap.org/
