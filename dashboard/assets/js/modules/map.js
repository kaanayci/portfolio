function initMap() {
    // Sécurité: vérifier si le div existe
    if (!document.getElementById('map')) return;
    
    // Fallback: Si le CSS n'a pas chargé la hauteur
    if ($('#map').height() === 0) {
        $('#map').css('height', '500px');
    }

    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
    }

    // Coordonnées Suisse Centrale
    mapInstance = L.map('map').setView([46.8182, 8.2275], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance);
    
    // IMPORTANT: Forcer le redessin pour éviter le bug d'affichage gris/blanc
    setTimeout(() => {
        mapInstance.invalidateSize();
    }, 200);

    // ============================================================
    //  Système DYNAMIQUE de villes météo
    //  Utilise une grille de points sur la zone visible.
    //  Plus on zoome, plus la grille est dense → plus de villes.
    //  L'API weather retourne le nom de la ville la plus proche
    //  pour chaque point de la grille.
    // ============================================================

    // Cache global : clé = "lat,lon" arrondi → données météo
    const weatherCache = {};
    // Marqueurs actuellement affichés
    let currentMarkers = [];
    // Compteur de version pour ignorer les réponses obsolètes
    let updateVersion = 0;
    // File d'attente pour limiter les appels API simultanés
    let apiQueue = [];
    let activeRequests = 0;
    const MAX_CONCURRENT = 6;

    // Nombre de points par axe selon le zoom
    function getGridSize(zoom) {
        if (zoom <= 7)  return 3;   // ~6-9 villes
        if (zoom <= 8)  return 4;   // ~12-16 villes
        if (zoom <= 9)  return 5;   // ~20-25 villes
        if (zoom <= 10) return 6;   // ~25-36 villes
        if (zoom <= 11) return 7;   // ~36-49 villes
        if (zoom <= 12) return 8;   // ~49-64 villes
        return 9;                   // ~64-81 villes
    }

    // Arrondir les coordonnées pour le cache (évite les doublons proches)
    function roundCoord(val, precision) {
        return Math.round(val * precision) / precision;
    }

    // Distance minimale entre 2 marqueurs en degrés (évite les chevauchements)
    function getMinDistance(zoom) {
        if (zoom <= 7)  return 0.45;
        if (zoom <= 8)  return 0.25;
        if (zoom <= 9)  return 0.15;
        if (zoom <= 10) return 0.08;
        if (zoom <= 11) return 0.05;
        if (zoom <= 12) return 0.03;
        return 0.02;
    }

    // Créer un marqueur custom avec label de température
    function createWeatherMarker(cityData) {
        const temp = Math.round(cityData.main.temp);
        const desc = cityData.weather[0].description;
        const icon = cityData.weather[0].icon;
        const name = cityData.name;
        const lat = cityData.coord.lat;
        const lon = cityData.coord.lon;

        const markerIcon = L.divIcon({
            className: 'weather-map-marker',
            html: `<div class="wm-label">
                       <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}">
                       <span>${temp}°</span>
                   </div>
                   <div class="wm-name">${name}</div>`,
            iconSize: [70, 50],
            iconAnchor: [35, 45]
        });

        const popupContent = `
            <div style="text-align:center; min-width:120px;">
                <b>${name}</b><br>
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" style="width:50px;vertical-align:middle"><br>
                <span style="font-size:1.3rem;font-weight:bold;">${temp}°C</span><br>
                <i>${desc}</i><br>
                <small>💧 ${cityData.main.humidity}% &nbsp; 💨 ${Math.round(cityData.wind.speed * 3.6)} km/h</small>
            </div>
        `;

        return L.marker([lat, lon], { icon: markerIcon }).bindPopup(popupContent);
    }

    // Gestion de la file d'attente API (évite trop d'appels simultanés)
    function processQueue(version) {
        while (activeRequests < MAX_CONCURRENT && apiQueue.length > 0) {
            const task = apiQueue.shift();
            if (task.version !== version) continue;
            activeRequests++;
            task.execute().finally(() => {
                activeRequests--;
                processQueue(version);
            });
        }
    }

    // Vérifier si un nouveau point est trop proche d'un marqueur existant
    function isTooClose(lat, lon, existingPositions, minDist) {
        for (const pos of existingPositions) {
            const dLat = Math.abs(lat - pos.lat);
            const dLon = Math.abs(lon - pos.lon);
            if (dLat < minDist && dLon < minDist) return true;
        }
        return false;
    }

    // ── Mise à jour principale ──
    function updateVisibleCities() {
        const version = ++updateVersion;
        const zoom = mapInstance.getZoom();
        const bounds = mapInstance.getBounds();
        const gridSize = getGridSize(zoom);
        const minDist = getMinDistance(zoom);

        // Vider la file d'attente des anciens appels
        apiQueue = [];

        // Supprimer tous les marqueurs actuels
        currentMarkers.forEach(entry => mapInstance.removeLayer(entry.marker));
        currentMarkers = [];

        // Calculer les bornes de la grille
        const south = bounds.getSouth();
        const north = bounds.getNorth();
        const west = bounds.getWest();
        const east = bounds.getEast();
        const latStep = (north - south) / (gridSize + 1);
        const lonStep = (east - west) / (gridSize + 1);

        // Précision d'arrondi pour le cache (dépend du zoom)
        const precision = zoom <= 8 ? 100 : zoom <= 10 ? 1000 : 10000;

        // Générer les points de la grille
        const gridPoints = [];
        for (let i = 1; i <= gridSize; i++) {
            for (let j = 1; j <= gridSize; j++) {
                const lat = roundCoord(south + latStep * i, precision);
                const lon = roundCoord(west + lonStep * j, precision);
                gridPoints.push({ lat, lon });
            }
        }

        // Positions des villes déjà placées (pour éviter les chevauchements)
        const placedPositions = [];
        // Noms des villes déjà placées (pour éviter les doublons)
        const placedNames = new Set();

        // D'abord, placer les villes depuis le cache
        gridPoints.forEach(pt => {
            const cacheKey = `${pt.lat},${pt.lon}`;
            if (weatherCache[cacheKey]) {
                const data = weatherCache[cacheKey];
                const cityLat = data.coord.lat;
                const cityLon = data.coord.lon;

                // Vérifier doublons et chevauchements
                if (placedNames.has(data.name)) return;
                if (isTooClose(cityLat, cityLon, placedPositions, minDist)) return;

                const marker = createWeatherMarker(data);
                marker.addTo(mapInstance);
                currentMarkers.push({ marker, name: data.name });
                placedPositions.push({ lat: cityLat, lon: cityLon });
                placedNames.add(data.name);
            }
        });

        // Ensuite, charger les points manquants
        gridPoints.forEach(pt => {
            const cacheKey = `${pt.lat},${pt.lon}`;
            if (weatherCache[cacheKey]) return; // Déjà traité

            apiQueue.push({
                version,
                execute: () => {
                    return $.getJSON(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${pt.lat}&lon=${pt.lon}&units=${currentUnit}&lang=fr&appid=${WEATHER_API_KEY}`
                    ).then(data => {
                        // Sauvegarder dans le cache
                        weatherCache[cacheKey] = data;

                        // Vérifier que cette update est toujours la version courante
                        if (version !== updateVersion) return;

                        const cityLat = data.coord.lat;
                        const cityLon = data.coord.lon;

                        // Vérifier doublons et chevauchements
                        if (placedNames.has(data.name)) return;
                        if (isTooClose(cityLat, cityLon, placedPositions, minDist)) return;
                        // Vérifier que la ville est dans la vue actuelle
                        if (!mapInstance.getBounds().contains([cityLat, cityLon])) return;

                        const marker = createWeatherMarker(data);
                        marker.addTo(mapInstance);
                        currentMarkers.push({ marker, name: data.name });
                        placedPositions.push({ lat: cityLat, lon: cityLon });
                        placedNames.add(data.name);
                    }).catch(() => { /* silently ignore API errors */ });
                }
            });
        });

        // Lancer le traitement de la file
        processQueue(version);
    }

    // Écouteurs de zoom et de déplacement (debounce pour performance)
    let updateTimeout = null;
    function debouncedUpdate() {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(updateVisibleCities, 400);
    }

    mapInstance.on('zoomend', debouncedUpdate);
    mapInstance.on('moveend', debouncedUpdate);

    // Chargement initial
    updateVisibleCities();
}
