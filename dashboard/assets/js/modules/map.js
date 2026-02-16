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
    //  Grille de points sur la zone visible de la carte.
    //  Plus on zoome → grille plus dense → plus de villes.
    //  L'API weather retourne la ville la plus proche de chaque point.
    // ============================================================

    // Cache global : clé = "lat,lon" arrondi → données météo
    const weatherCache = {};
    // Marqueurs actuellement affichés
    let currentMarkers = [];

    // Nombre de points par axe selon le zoom
    function getGridSize(zoom) {
        if (zoom <= 7)  return 3;
        if (zoom <= 8)  return 4;
        if (zoom <= 9)  return 5;
        if (zoom <= 10) return 6;
        if (zoom <= 11) return 7;
        if (zoom <= 12) return 8;
        return 9;
    }

    // Distance minimale entre 2 marqueurs en degrés (évite chevauchements)
    function getMinDistance(zoom) {
        if (zoom <= 7)  return 0.4;
        if (zoom <= 8)  return 0.22;
        if (zoom <= 9)  return 0.12;
        if (zoom <= 10) return 0.07;
        if (zoom <= 11) return 0.04;
        if (zoom <= 12) return 0.025;
        return 0.015;
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

    // Vérifier si un point est trop proche d'un marqueur existant
    function isTooClose(lat, lon, existingPositions, minDist) {
        for (const pos of existingPositions) {
            if (Math.abs(lat - pos.lat) < minDist && Math.abs(lon - pos.lon) < minDist) {
                return true;
            }
        }
        return false;
    }

    // Charger la météo pour un point de grille et ajouter le marqueur
    function loadWeatherForPoint(lat, lon, placedPositions, placedNames, minDist) {
        // Clé de cache arrondie à 2 décimales
        const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;

        // Si en cache, placer directement
        if (weatherCache[cacheKey]) {
            const data = weatherCache[cacheKey];
            placeMarker(data, placedPositions, placedNames, minDist);
            return;
        }

        // Sinon appeler l'API
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${currentUnit}&lang=fr&appid=${WEATHER_API_KEY}`;

        $.getJSON(url)
            .done(function(data) {
                weatherCache[cacheKey] = data;
                placeMarker(data, placedPositions, placedNames, minDist);
            })
            .fail(function(jqxhr, textStatus, error) {
                console.warn('Map weather API error:', textStatus, error, 'for', lat, lon);
            });
    }

    // Placer un marqueur si pas de doublon ni chevauchement
    function placeMarker(data, placedPositions, placedNames, minDist) {
        if (!data || !data.name || !data.coord) return;

        const cityLat = data.coord.lat;
        const cityLon = data.coord.lon;

        // Pas de doublon
        if (placedNames.has(data.name)) return;
        // Pas trop proche
        if (isTooClose(cityLat, cityLon, placedPositions, minDist)) return;
        // Toujours dans la vue ?
        if (mapInstance && !mapInstance.getBounds().contains([cityLat, cityLon])) return;

        const marker = createWeatherMarker(data);
        marker.addTo(mapInstance);
        currentMarkers.push({ marker, name: data.name });
        placedPositions.push({ lat: cityLat, lon: cityLon });
        placedNames.add(data.name);
    }

    // ── Mise à jour principale ──
    function updateVisibleCities() {
        const zoom = mapInstance.getZoom();
        const bounds = mapInstance.getBounds();
        const gridSize = getGridSize(zoom);
        const minDist = getMinDistance(zoom);

        // Supprimer tous les marqueurs actuels
        currentMarkers.forEach(entry => mapInstance.removeLayer(entry.marker));
        currentMarkers = [];

        // Bornes de la grille
        const south = bounds.getSouth();
        const north = bounds.getNorth();
        const west = bounds.getWest();
        const east = bounds.getEast();
        const latStep = (north - south) / (gridSize + 1);
        const lonStep = (east - west) / (gridSize + 1);

        // Suivi des positions/noms déjà placés (partagé entre tous les points)
        const placedPositions = [];
        const placedNames = new Set();

        // Générer et charger chaque point de la grille
        for (let i = 1; i <= gridSize; i++) {
            for (let j = 1; j <= gridSize; j++) {
                const lat = south + latStep * i;
                const lon = west + lonStep * j;
                loadWeatherForPoint(lat, lon, placedPositions, placedNames, minDist);
            }
        }
    }

    // Debounce pour éviter trop d'appels au zoom/déplacement
    let updateTimeout = null;
    function debouncedUpdate() {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(updateVisibleCities, 350);
    }

    mapInstance.on('zoomend', debouncedUpdate);
    mapInstance.on('moveend', debouncedUpdate);

    // Chargement initial (petit délai pour que la carte soit prête)
    setTimeout(updateVisibleCities, 500);
}
