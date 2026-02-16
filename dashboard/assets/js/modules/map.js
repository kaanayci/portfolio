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
    //  Système de villes multi-niveaux (zoom adaptatif)
    //  minZoom = zoom minimum pour que la ville apparaisse
    //    - Tier 1 (zoom 0+)  : Grandes villes / capitales cantonales majeures
    //    - Tier 2 (zoom 9+)  : Villes moyennes / capitales cantonales secondaires
    //    - Tier 3 (zoom 10+) : Petites villes / localités importantes
    //    - Tier 4 (zoom 11+) : Villages notables
    // ============================================================
    const mapCities = [
        // ── Tier 1 : Grandes villes (toujours visibles) ──
        {name: "Genève",     coords: [46.2044, 6.1432],  minZoom: 0},
        {name: "Zürich",     coords: [47.3769, 8.5417],  minZoom: 0},
        {name: "Bern",       coords: [46.9480, 7.4474],  minZoom: 0},
        {name: "Basel",      coords: [47.5596, 7.5886],  minZoom: 0},
        {name: "Lausanne",   coords: [46.5197, 6.6323],  minZoom: 0},
        {name: "Lucerne",    coords: [47.0502, 8.3093],  minZoom: 0},

        // ── Tier 2 : Villes moyennes (zoom 9+) ──
        {name: "Lugano",     coords: [46.0037, 8.9511],  minZoom: 9},
        {name: "St. Gallen", coords: [47.4245, 9.3767],  minZoom: 9},
        {name: "Biel/Bienne",coords: [47.1368, 7.2467],  minZoom: 9},
        {name: "Thun",       coords: [46.7580, 7.6280],  minZoom: 9},
        {name: "Winterthur", coords: [47.5001, 8.7240],  minZoom: 9},
        {name: "Fribourg",   coords: [46.8065, 7.1620],  minZoom: 9},
        {name: "Sion",       coords: [46.2328, 7.3607],  minZoom: 9},
        {name: "Neuchâtel",  coords: [46.9900, 6.9293],  minZoom: 9},
        {name: "Chur",       coords: [46.8499, 9.5329],  minZoom: 9},
        {name: "Schaffhausen",coords:[47.6960, 8.6340],  minZoom: 9},

        // ── Tier 3 : Petites villes (zoom 10+) ──
        {name: "Delémont",   coords: [47.3651, 7.3430],  minZoom: 10},
        {name: "Montreux",   coords: [46.4312, 6.9107],  minZoom: 10},
        {name: "Yverdon",    coords: [46.7785, 6.6410],  minZoom: 10},
        {name: "Aarau",      coords: [47.3925, 8.0443],  minZoom: 10},
        {name: "Interlaken", coords: [46.6863, 7.8632],  minZoom: 10},
        {name: "Davos",      coords: [46.8027, 9.8360],  minZoom: 10},
        {name: "Bellinzona", coords: [46.1955, 9.0234],  minZoom: 10},
        {name: "Locarno",    coords: [46.1709, 8.7994],  minZoom: 10},
        {name: "Solothurn",  coords: [47.2088, 7.5372],  minZoom: 10},
        {name: "Zug",        coords: [47.1724, 8.5174],  minZoom: 10},
        {name: "Martigny",   coords: [46.0986, 7.0736],  minZoom: 10},
        {name: "Nyon",       coords: [46.3833, 6.2348],  minZoom: 10},
        {name: "Sierre",     coords: [46.2920, 7.5348],  minZoom: 10},
        {name: "Frauenfeld", coords: [47.5535, 8.8988],  minZoom: 10},
        {name: "Liestal",    coords: [47.4842, 7.7305],  minZoom: 10},
        {name: "Olten",      coords: [47.3500, 7.9039],  minZoom: 10},
        {name: "Baden",      coords: [47.4734, 8.3064],  minZoom: 10},
        {name: "Rapperswil", coords: [47.2266, 8.8184],  minZoom: 10},
        {name: "Brig",       coords: [46.3141, 7.9870],  minZoom: 10},
        {name: "Verbier",    coords: [46.0968, 7.2286],  minZoom: 10},
        {name: "Vevey",      coords: [46.4628, 6.8432],  minZoom: 10},

        // ── Tier 4 : Villages / localités (zoom 11+) ──
        {name: "Moutier",    coords: [47.2790, 7.3690],  minZoom: 11},
        {name: "Porrentruy", coords: [47.4152, 7.0754],  minZoom: 11},
        {name: "Saignelégier",coords:[47.2560, 7.0860],  minZoom: 11},
        {name: "La Chaux-de-Fonds", coords: [47.1035, 6.8322], minZoom: 11},
        {name: "Le Locle",   coords: [47.0594, 6.7490],  minZoom: 11},
        {name: "Bulle",      coords: [46.6198, 7.0580],  minZoom: 11},
        {name: "Aigle",      coords: [46.3183, 6.9706],  minZoom: 11},
        {name: "Zermatt",    coords: [46.0207, 7.7491],  minZoom: 11},
        {name: "Grindelwald",coords: [46.6244, 8.0413],  minZoom: 11},
        {name: "Adelboden",  coords: [46.4927, 7.5604],  minZoom: 11},
        {name: "Saas-Fee",   coords: [46.1081, 7.9270],  minZoom: 11},
        {name: "Crans-Montana",coords:[46.3117,7.4789],  minZoom: 11},
        {name: "Engelberg",  coords: [46.8203, 8.4074],  minZoom: 11},
        {name: "Appenzell",  coords: [47.3305, 9.4098],  minZoom: 11},
        {name: "Stans",      coords: [46.9582, 8.3660],  minZoom: 11},
        {name: "Sarnen",     coords: [46.8964, 8.2456],  minZoom: 11},
        {name: "Altdorf",    coords: [46.8804, 8.6441],  minZoom: 11},
        {name: "Glarus",     coords: [47.0404, 9.0683],  minZoom: 11},
        {name: "Schwyz",     coords: [47.0207, 8.6530],  minZoom: 11},
        {name: "Herisau",    coords: [47.3864, 9.2791],  minZoom: 11},
        {name: "Arosa",      coords: [46.7833, 9.6810],  minZoom: 11},
        {name: "Lenzburg",   coords: [47.3884, 8.1748],  minZoom: 11},
        {name: "Lyss",       coords: [47.0745, 7.3061],  minZoom: 11},
        {name: "Burgdorf",   coords: [47.0590, 7.6280],  minZoom: 11},
        {name: "Langenthal", coords: [47.2145, 7.7874],  minZoom: 11},
        {name: "Grenchen",   coords: [47.1920, 7.3953],  minZoom: 11},
        {name: "Morges",     coords: [46.5114, 6.4988],  minZoom: 11},
        {name: "Renens",     coords: [46.5399, 6.5887],  minZoom: 11},
    ];

    // Cache des données météo récupérées
    const weatherCache = {};
    // Marqueurs actuellement affichés sur la carte
    let currentMarkers = [];

    // Créer un marqueur custom avec label de température
    function createWeatherMarker(city, data) {
        const temp = Math.round(data.main.temp);
        const desc = data.weather[0].description;
        const icon = data.weather[0].icon;

        const markerIcon = L.divIcon({
            className: 'weather-map-marker',
            html: `<div class="wm-label">
                       <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}">
                       <span>${temp}°</span>
                   </div>
                   <div class="wm-name">${city.name}</div>`,
            iconSize: [70, 50],
            iconAnchor: [35, 45]
        });

        const popupContent = `
            <div style="text-align:center; min-width:120px;">
                <b>${city.name}</b><br>
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" style="width:50px;vertical-align:middle"><br>
                <span style="font-size:1.3rem;font-weight:bold;">${temp}°C</span><br>
                <i>${desc}</i><br>
                <small>💧 ${data.main.humidity}% &nbsp; 💨 ${Math.round(data.wind.speed * 3.6)} km/h</small>
            </div>
        `;

        const marker = L.marker(city.coords, { icon: markerIcon })
            .bindPopup(popupContent);

        return marker;
    }

    // Mettre à jour les villes affichées selon le zoom et la vue
    function updateVisibleCities() {
        const zoom = mapInstance.getZoom();
        const bounds = mapInstance.getBounds();

        // Supprimer les marqueurs hors-champ ou hors-zoom
        currentMarkers = currentMarkers.filter(entry => {
            const inBounds = bounds.contains(entry.city.coords);
            const inZoom = zoom >= entry.city.minZoom;
            if (!inBounds || !inZoom) {
                mapInstance.removeLayer(entry.marker);
                return false;
            }
            return true;
        });

        // Villes déjà affichées (éviter les doublons)
        const displayedNames = new Set(currentMarkers.map(e => e.city.name));

        // Trouver les nouvelles villes à afficher
        const toShow = mapCities.filter(city => {
            if (displayedNames.has(city.name)) return false;
            if (zoom < city.minZoom) return false;
            if (!bounds.contains(city.coords)) return false;
            return true;
        });

        // Charger la météo et afficher les marqueurs
        toShow.forEach(city => {
            // Vérifier le cache d'abord
            if (weatherCache[city.name]) {
                const marker = createWeatherMarker(city, weatherCache[city.name]);
                marker.addTo(mapInstance);
                currentMarkers.push({ city, marker });
            } else {
                $.getJSON(`https://api.openweathermap.org/data/2.5/weather?lat=${city.coords[0]}&lon=${city.coords[1]}&units=metric&lang=fr&appid=${WEATHER_API_KEY}`)
                .done(data => {
                    weatherCache[city.name] = data;
                    // Revérifier que la ville est toujours pertinente
                    const currentZoom = mapInstance.getZoom();
                    const currentBounds = mapInstance.getBounds();
                    if (currentZoom >= city.minZoom && currentBounds.contains(city.coords)) {
                        const marker = createWeatherMarker(city, data);
                        marker.addTo(mapInstance);
                        currentMarkers.push({ city, marker });
                    }
                });
            }
        });
    }

    // Écouteurs de zoom et de déplacement (debounce pour performance)
    let updateTimeout = null;
    function debouncedUpdate() {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(updateVisibleCities, 300);
    }

    mapInstance.on('zoomend', debouncedUpdate);
    mapInstance.on('moveend', debouncedUpdate);

    // Chargement initial
    updateVisibleCities();
}
