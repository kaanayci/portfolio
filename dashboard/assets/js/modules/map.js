function initMap() {
    if (!document.getElementById('map')) return;
    if ($('#map').height() === 0) $('#map').css('height', '500px');

    if (mapInstance) { mapInstance.remove(); mapInstance = null; }

    mapInstance = L.map('map').setView([46.8182, 8.2275], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance);

    setTimeout(() => { mapInstance.invalidateSize(); }, 200);

    // ============================================================
    //  Base de données des villes suisses classées par population
    //  Source: OFS (Office fédéral de la statistique)
    //  pop = population approximative (utilisée pour le tri)
    //  Plus on zoome → seuil de population plus bas → plus de villes
    // ============================================================
    const swissCities = [
        // ── 100 000+ ──
        {n:"Zürich",        lat:47.3769, lon:8.5417,  pop:430000},
        {n:"Genève",        lat:46.2044, lon:6.1432,  pop:205000},
        {n:"Basel",         lat:47.5596, lon:7.5886,  pop:175000},
        {n:"Lausanne",      lat:46.5197, lon:6.6323,  pop:140000},
        {n:"Bern",          lat:46.9480, lon:7.4474,  pop:135000},
        // ── 50 000 – 100 000 ──
        {n:"Winterthur",    lat:47.5001, lon:8.7240,  pop:115000},
        {n:"Luzern",        lat:47.0502, lon:8.3093,  pop:82000},
        {n:"St. Gallen",    lat:47.4245, lon:9.3767,  pop:76000},
        {n:"Lugano",        lat:46.0037, lon:8.9511,  pop:63000},
        {n:"Biel/Bienne",   lat:47.1368, lon:7.2467,  pop:55000},
        // ── 30 000 – 50 000 ──
        {n:"Thun",          lat:46.7580, lon:7.6280,  pop:45000},
        {n:"Köniz",         lat:46.9215, lon:7.4145,  pop:43000},
        {n:"La Chaux-de-Fonds", lat:47.1035, lon:6.8322, pop:40000},
        {n:"Fribourg",      lat:46.8065, lon:7.1620,  pop:38000},
        {n:"Schaffhausen",  lat:47.6960, lon:8.6340,  pop:37000},
        {n:"Chur",          lat:46.8499, lon:9.5329,  pop:37000},
        {n:"Neuchâtel",     lat:46.9900, lon:6.9293,  pop:34000},
        {n:"Sion",          lat:46.2328, lon:7.3607,  pop:35000},
        {n:"Vernier",       lat:46.2170, lon:6.0850,  pop:35000},
        {n:"Uster",         lat:47.3477, lon:8.7217,  pop:35000},
        // ── 20 000 – 30 000 ──
        {n:"Lancy",         lat:46.1833, lon:6.1167,  pop:33000},
        {n:"Emmen",         lat:47.0833, lon:8.3050,  pop:31000},
        {n:"Yverdon",       lat:46.7785, lon:6.6410,  pop:30000},
        {n:"Kriens",        lat:47.0350, lon:8.2800,  pop:28000},
        {n:"Rapperswil-Jona",lat:47.2266, lon:8.8184, pop:27000},
        {n:"Zug",           lat:47.1724, lon:8.5174,  pop:30000},
        {n:"Dübendorf",     lat:47.3975, lon:8.6190,  pop:28000},
        {n:"Dietikon",      lat:47.4044, lon:8.4003,  pop:28000},
        {n:"Montreux",      lat:46.4312, lon:6.9107,  pop:26000},
        {n:"Frauenfeld",    lat:47.5535, lon:8.8988,  pop:26000},
        {n:"Aarau",         lat:47.3925, lon:8.0443,  pop:22000},
        {n:"Wetzikon",      lat:47.3267, lon:8.7983,  pop:25000},
        {n:"Carouge",       lat:46.1833, lon:6.1397,  pop:22000},
        {n:"Wädenswil",     lat:47.2317, lon:8.6717,  pop:24000},
        {n:"Meyrin",        lat:46.2340, lon:6.0800,  pop:25000},
        {n:"Nyon",          lat:46.3833, lon:6.2348,  pop:22000},
        {n:"Olten",         lat:47.3500, lon:7.9039,  pop:19000},
        {n:"Renens",        lat:46.5399, lon:6.5887,  pop:22000},
        {n:"Baden",         lat:47.4734, lon:8.3064,  pop:19000},
        {n:"Vevey",         lat:46.4628, lon:6.8432,  pop:20000},
        {n:"Solothurn",     lat:47.2088, lon:7.5372,  pop:17000},
        // ── 10 000 – 20 000 ──
        {n:"Morges",        lat:46.5114, lon:6.4988,  pop:16000},
        {n:"Sierre",        lat:46.2920, lon:7.5348,  pop:17000},
        {n:"Bellinzona",    lat:46.1955, lon:9.0234,  pop:19000},
        {n:"Locarno",       lat:46.1709, lon:8.7994,  pop:16000},
        {n:"Liestal",       lat:47.4842, lon:7.7305,  pop:14000},
        {n:"Interlaken",    lat:46.6863, lon:7.8632,  pop:14000},
        {n:"Langenthal",    lat:47.2145, lon:7.7874,  pop:16000},
        {n:"Burgdorf",      lat:47.0590, lon:7.6280,  pop:16000},
        {n:"Brig",          lat:46.3141, lon:7.9870,  pop:13000},
        {n:"Martigny",      lat:46.0986, lon:7.0736,  pop:18000},
        {n:"Delémont",      lat:47.3651, lon:7.3430,  pop:12000},
        {n:"Davos",         lat:46.8027, lon:9.8360,  pop:11000},
        {n:"Bulle",         lat:46.6198, lon:7.0580,  pop:13000},
        {n:"Lyss",          lat:47.0745, lon:7.3061,  pop:15000},
        {n:"Grenchen",      lat:47.1920, lon:7.3953,  pop:17000},
        {n:"Lenzburg",      lat:47.3884, lon:8.1748,  pop:11000},
        {n:"Aigle",         lat:46.3183, lon:6.9706,  pop:10000},
        {n:"Le Locle",      lat:47.0594, lon:6.7490,  pop:10000},
        {n:"Herisau",       lat:47.3864, lon:9.2791,  pop:16000},
        {n:"Appenzell",     lat:47.3305, lon:9.4098,  pop:10000},
        {n:"Arbon",         lat:47.5166, lon:9.4333,  pop:15000},
        {n:"Gossau",        lat:47.4167, lon:9.2500,  pop:19000},
        {n:"Kreuzlingen",   lat:47.6500, lon:9.1750,  pop:22000},
        {n:"Romanshorn",    lat:47.5650, lon:9.3750,  pop:11000},
        {n:"Weinfelden",    lat:47.5667, lon:9.1083,  pop:12000},
        // ── 5 000 – 10 000 ──
        {n:"Glarus",        lat:47.0404, lon:9.0683,  pop:7000},
        {n:"Schwyz",        lat:47.0207, lon:8.6530,  pop:8000},
        {n:"Stans",         lat:46.9582, lon:8.3660,  pop:8000},
        {n:"Sarnen",        lat:46.8964, lon:8.2456,  pop:8000},
        {n:"Altdorf",       lat:46.8804, lon:8.6441,  pop:9000},
        {n:"Moutier",       lat:47.2790, lon:7.3690,  pop:7000},
        {n:"Porrentruy",    lat:47.4152, lon:7.0754,  pop:7000},
        {n:"Saignelégier",  lat:47.2560, lon:7.0860,  pop:5000},
        {n:"Zermatt",       lat:46.0207, lon:7.7491,  pop:6000},
        {n:"Grindelwald",   lat:46.6244, lon:8.0413,  pop:5000},
        {n:"Adelboden",     lat:46.4927, lon:7.5604,  pop:5000},
        {n:"Saas-Fee",      lat:46.1081, lon:7.9270,  pop:5000},
        {n:"Crans-Montana", lat:46.3117, lon:7.4789,  pop:6000},
        {n:"Engelberg",     lat:46.8203, lon:8.4074,  pop:5000},
        {n:"Verbier",       lat:46.0968, lon:7.2286,  pop:5000},
        {n:"Arosa",         lat:46.7833, lon:9.6810,  pop:5000},
        {n:"Flims",         lat:46.8372, lon:9.2830,  pop:5000},
        {n:"Lenzerheide",   lat:46.7251, lon:9.5580,  pop:5000},
        {n:"Leukerbad",     lat:46.3826, lon:7.6268,  pop:5000},
        {n:"Kandersteg",    lat:46.4968, lon:7.6745,  pop:5000},
        {n:"Mürren",        lat:46.5593, lon:7.8926,  pop:5000},
        {n:"Gstaad",        lat:46.4750, lon:7.2861,  pop:5000},
        {n:"Wengen",        lat:46.6078, lon:7.9224,  pop:5000},
        // ── 2 000 – 5 000 (apparaissent très zoomé) ──
        {n:"Saint-Imier",   lat:47.1528, lon:6.9983,  pop:4500},
        {n:"Courtelary",    lat:47.1770, lon:7.0720,  pop:2500},
        {n:"Tramelan",      lat:47.2236, lon:7.1024,  pop:4500},
        {n:"Tavannes",      lat:47.2205, lon:7.1969,  pop:3500},
        {n:"Reconvilier",   lat:47.2331, lon:7.2219,  pop:2500},
        {n:"Malleray",      lat:47.2370, lon:7.2730,  pop:2000},
        {n:"Sonceboz",      lat:47.1936, lon:7.1764,  pop:2500},
        {n:"Villeret",      lat:47.1650, lon:7.0200,  pop:2000},
        {n:"Cormoret",      lat:47.1650, lon:6.9850,  pop:2000},
        {n:"Bettlach",      lat:47.2050, lon:7.4250,  pop:3000},
        {n:"Zweisimmen",    lat:46.5541, lon:7.3735,  pop:3000},
        {n:"Château-d'Oex", lat:46.4830, lon:7.1360,  pop:3500},
        {n:"Leysin",        lat:46.3442, lon:7.0085,  pop:3500},
        {n:"Champéry",      lat:46.1800, lon:6.8700,  pop:2500},
        {n:"Les Diablerets", lat:46.3530, lon:7.2100, pop:2000},
        {n:"Andermatt",     lat:46.6370, lon:8.5940,  pop:2000},
        {n:"Scuol",         lat:46.7960, lon:10.2990, pop:2500},
        {n:"Pontresina",    lat:46.4950, lon:9.9000,  pop:2000},
        {n:"St. Moritz",    lat:46.4983, lon:9.8383,  pop:5000},
        {n:"Samedan",       lat:46.5300, lon:9.8700,  pop:3000},
        {n:"Poschiavo",     lat:46.3230, lon:10.0600, pop:3500},
        {n:"Ilanz",         lat:46.7730, lon:9.2050,  pop:3500},
        {n:"Thusis",        lat:46.6970, lon:9.4400,  pop:3000},
        {n:"Splügen",       lat:46.5510, lon:9.3220,  pop:2000},
        {n:"Disentis",      lat:46.7060, lon:8.8530,  pop:2500},
        {n:"Sedrun",        lat:46.6810, lon:8.7730,  pop:2000},
        {n:"Airolo",        lat:46.5280, lon:8.6110,  pop:2000},
        {n:"Biasca",        lat:46.3590, lon:8.9700,  pop:6000},
        {n:"Mendrisio",     lat:45.8700, lon:8.9800,  pop:15000},
        {n:"Chiasso",       lat:45.8330, lon:9.0300,  pop:8000},
        {n:"Ascona",        lat:46.1570, lon:8.7700,  pop:5500},
        {n:"Brig-Glis",     lat:46.3200, lon:7.9900,  pop:13000},
        {n:"Visp",          lat:46.2940, lon:7.8830,  pop:8000},
        {n:"Naters",        lat:46.3260, lon:7.9880,  pop:10000},
        {n:"Monthey",       lat:46.2550, lon:6.9540,  pop:18000},
        {n:"Saint-Maurice",  lat:46.2190, lon:7.0030, pop:5000},
        {n:"Fully",         lat:46.1640, lon:7.1110,  pop:9000},
        {n:"Saxon",         lat:46.1490, lon:7.1760,  pop:6000},
        {n:"Conthey",       lat:46.2260, lon:7.3070,  pop:9000},
        {n:"Savièse",       lat:46.2540, lon:7.3470,  pop:8000},
        {n:"Evolène",       lat:46.1130, lon:7.4940,  pop:2000},
        {n:"Hérémence",     lat:46.1780, lon:7.4050,  pop:2000},
        {n:"Münchenbuchsee", lat:47.0220, lon:7.4470, pop:10000},
        {n:"Münsingen",     lat:46.8750, lon:7.5600,  pop:12000},
        {n:"Spiez",         lat:46.6860, lon:7.6770,  pop:13000},
        {n:"Meiringen",     lat:46.7280, lon:8.1880,  pop:5000},
        {n:"Brienz",        lat:46.7540, lon:8.0440,  pop:3000},
        {n:"Lauterbrunnen", lat:46.5936, lon:7.9088,  pop:3000},
        {n:"Steffisburg",   lat:46.7770, lon:7.6330,  pop:16000},
        {n:"Langnau i.E.",  lat:46.9410, lon:7.7870,  pop:9000},
        {n:"Worb",          lat:46.9300, lon:7.5620,  pop:12000},
        {n:"Herzogenbuchsee",lat:47.1900, lon:7.7080, pop:7000},
        {n:"Huttwil",       lat:47.1150, lon:7.8530,  pop:5000},
        {n:"Wangen a.d.A.", lat:47.2340, lon:7.6530,  pop:3000},
        {n:"Moudon",        lat:46.6690, lon:6.7980,  pop:6000},
        {n:"Payerne",       lat:46.8200, lon:6.9370,  pop:10000},
        {n:"Avenches",      lat:46.8810, lon:7.0400,  pop:4500},
        {n:"Romont",        lat:46.6930, lon:6.9180,  pop:5000},
        {n:"Estavayer",     lat:46.8490, lon:6.8460,  pop:6000},
        {n:"Orbe",          lat:46.7250, lon:6.5310,  pop:7000},
        {n:"Sainte-Croix",  lat:46.8220, lon:6.5020,  pop:5000},
        {n:"Vallorbe",      lat:46.7130, lon:6.3780,  pop:3500},
        {n:"Le Sentier",    lat:46.6050, lon:6.2320,  pop:3000},
        {n:"Fleurier",      lat:46.9030, lon:6.5830,  pop:4000},
        {n:"Couvet",        lat:46.9230, lon:6.6300,  pop:3000},
        {n:"Peseux",        lat:46.9860, lon:6.8870,  pop:3000},
        {n:"Cortaillod",    lat:46.9460, lon:6.8400,  pop:5000},
        {n:"Boudry",        lat:46.9530, lon:6.8380,  pop:6000},
    ];

    // Cache météo par nom de ville
    const weatherCache = {};
    // Marqueurs actuellement affichés
    let currentMarkers = [];

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

    // Distance minimale entre marqueurs (degrés) pour éviter chevauchements
    function getMinDistance(zoom) {
        if (zoom <= 7)  return 0.5;
        if (zoom <= 8)  return 0.3;
        if (zoom <= 9)  return 0.15;
        if (zoom <= 10) return 0.09;
        if (zoom <= 11) return 0.05;
        if (zoom <= 12) return 0.03;
        return 0.015;
    }

    function isTooClose(lat, lon, placed, minDist) {
        for (const p of placed) {
            if (Math.abs(lat - p.lat) < minDist && Math.abs(lon - p.lon) < minDist) return true;
        }
        return false;
    }

    // Créer un marqueur météo
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
                   <div class="wm-name">${city.n}</div>`,
            iconSize: [70, 50],
            iconAnchor: [35, 45]
        });

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

    // ── Mise à jour principale ──
    function updateVisibleCities() {
        const zoom = mapInstance.getZoom();
        const bounds = mapInstance.getBounds();
        const minPop = getMinPopulation(zoom);
        const minDist = getMinDistance(zoom);

        // Supprimer tous les marqueurs
        currentMarkers.forEach(m => mapInstance.removeLayer(m));
        currentMarkers = [];

        // Filtrer les villes : dans la vue + assez grande pour ce zoom
        const visible = swissCities.filter(c =>
            c.pop >= minPop && bounds.contains([c.lat, c.lon])
        );

        // Déjà trié par population (le tableau est en ordre décroissant)
        const placed = [];

        visible.forEach(city => {
            // Éviter chevauchements (les plus grandes ont priorité)
            if (isTooClose(city.lat, city.lon, placed, minDist)) return;
            placed.push({ lat: city.lat, lon: city.lon });

            // Vérifier le cache
            if (weatherCache[city.n]) {
                const marker = createWeatherMarker(city, weatherCache[city.n]);
                marker.addTo(mapInstance);
                currentMarkers.push(marker);
            } else {
                // Appel API
                $.getJSON(`https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&units=${currentUnit}&lang=fr&appid=${WEATHER_API_KEY}`)
                .done(function(data) {
                    weatherCache[city.n] = data;
                    // Revérifier que la carte n'a pas bougé
                    if (mapInstance.getBounds().contains([city.lat, city.lon])) {
                        const marker = createWeatherMarker(city, data);
                        marker.addTo(mapInstance);
                        currentMarkers.push(marker);
                    }
                });
            }
        });
    }

    // Debounce
    let updateTimeout = null;
    function debouncedUpdate() {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(updateVisibleCities, 300);
    }

    mapInstance.on('zoomend', debouncedUpdate);
    mapInstance.on('moveend', debouncedUpdate);

    // Chargement initial
    setTimeout(updateVisibleCities, 400);
}
