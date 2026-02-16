function loadPanorama() {
    const cities = ["Genève", "Lausanne", "Zürich", "Bern", "Lugano", "Lucerne", "Basel"];
    $('#panorama-container').html('');
    
    cities.forEach(city => {
        $.getJSON(`https://api.openweathermap.org/data/2.5/weather?q=${city},CH&units=metric&lang=fr&appid=${WEATHER_API_KEY}`)
        .done(data => {
            const temp = Math.round(data.main.temp);
            const icon = data.weather[0].icon;
            
            const card = `
                <div class="city-card animate-pop" onclick="localStorage.setItem('lastCity', '${city}'); localStorage.setItem('forceWeather','1'); $('.sidebar li[data-channel=meteo]').click();">
                    <h3>${city}</h3>
                    <div class="city-temp">
                        ${temp}° 
                        <img src="https://openweathermap.org/img/wn/${icon}.png">
                    </div>
                </div>
            `;
            $('#panorama-container').append(card);
        });
    });
}

let allStationsData = [];

// Images de fallback pour les stations sans image
const fallbackImages = [
    "https://images.unsplash.com/photo-1486496166122-a37f6dc2b8b9?w=600&q=80", // Neige + Soleil
    "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&q=80", // Skier
    "https://images.unsplash.com/photo-1565538059049-76082989b142?w=600&q=80", // Montagne mystique
    "https://images.unsplash.com/photo-1520448100688-34860d5b6a7a?w=600&q=80", // Village enneigé
    "https://images.unsplash.com/photo-1482867996988-29bfffe79584?w=600&q=80", // Chalet
    "https://images.unsplash.com/photo-1518182170546-0766ce6fabe4?w=600&q=80"  // Piste
];

function getFallbackImage(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return fallbackImages[Math.abs(hash) % fallbackImages.length];
}

function loadMountains() {
    const stations = [
        {name: "Grindelwald-Wengen", q: "Grindelwald", region: "Bern", alt: 1034, lat: 46.624, lon: 8.041, img: "https://media.jungfrau.ch/image/upload/ar_16:9,c_crop,f_auto,q_auto/c_scale,w_1213/v1728053574/Kleine-Scheidegg-Skifahren-eine-Person-vor-Eiger-Moench-Jungfrau-2.jpg"},
        {name: "Les Diablerets", q: "Les Diablerets", region: "Vaud", alt: 1200, lat: 46.350, lon: 7.157, img: "https://ik.imagekit.io/spotlio/fetch/tr:w-1920,h-840,c-at_max/https://public-assets.spotliodata.com/8b90b259-bca9-4d2d-96c5-faadb71aa3cd.webp"},
        {name: "Andermatt", q: "Andermatt", region: "Uri", alt: 1444, lat: 46.635, lon: 8.594, img: "https://images.contenthub.dev/u5sjtnkypgsp/9340b3f9fca92d8416c9c7bc98f9cf1c/Skiday_N%C3%A4tschen_2019_Valentin_Luthiger_08.jpg?fm=jpg&fl=progressive&f=center&fit=fill&q=80&h=1080&w=1920"},
        {name: "Leysin", q: "Leysin", region: "Vaud", alt: 1260, lat: 46.3358, lon: 7.009, img: "https://cdn.loisirs.ch/media/cache/default_landscape/default/0001/13/12947_default_landscape.jpg"},
        {name: "Champéry", q: "Champéry", region: "Valais", alt: 1050, lat: 46.176, lon: 6.871, img: "https://www.regiondentsdumidi.ch/files/1013737.jpg"},
        {name: "Crans-Montana", q: "Crans-Montana", region: "Valais", alt: 1495, lat: 46.3117, lon: 7.4789},
        {name: "Saas-Fee", q: "Saas-Fee", region: "Valais", alt: 1800, lat: 46.109, lon: 7.929, img: "https://web3.cdn-magicpass.ch/media/image/0/medium_16_9/saas-fee-hiver-9.jpg"},
        {name: "Gstaad", q: "Gstaad", region: "Bern", alt: 1050, lat: 46.4746, lon: 7.2863, img: "https://cdn.indebergen.nl/media/0dnbyrom/chbeob004-gstaad.jpg"},
        {name: "St. Moritz", q: "Saint-Moritz", region: "Grisons", alt: 1822, lat: 46.4908, lon: 9.8355, img: "https://www.stmoritzswitzerland.travel/assets/web_stmoritz/welcome/bg-hotel.jpg"},
        {name: "Verbier", q: "Bagnes", region: "Valais", alt: 1500, lat: 46.0968, lon: 7.2266, img: "https://verbier4vallees.ch/V4V-Website/Ski-sectors/image-thumb__998__lightbox/DOMAINESKIABLE_HUB_VERBIER_TEXTE_2.webp"},
        {name: "Davos", q: "Davos", region: "Grisons", alt: 1560, lat: 46.8027, lon: 9.8297, img: "https://cdn.indebergen.nl/media/lfbim4at/davos-by-night.jpg?anchor=center&mode=crop&width=1160&height=870&format=webp&quality=80"},
        {name: "Adelboden-Lenk", q: "Adelboden", region: "Bern", alt: 1350, lat: 46.491, lon: 7.558, img: "https://www.adelboden-lenk.ch/Bilder_Winter/Gebiete/Hauptgebiet/Landschaft/840/image-thumb__840__lightbox/Landschaft_Adelboden-Lenk%20%281%29.jpg"},
        {name: "Laax", q: "Laax", region: "Grisons", alt: 1016, lat: 46.806, lon: 9.261, img: "https://media.lematin.ch/4/image/2023/11/08/0fbe47e8-1b04-4dd5-a4d8-ffff01ab748c.jpeg?auto=format%2Ccompress%2Cenhance&fit=max&w=1200&h=1200&rect=0%2C0%2C1920%2C1279&fp-x=0.40677083333333336&fp-y=0.31821735731039874&s=cc3ad6772b68b4e11429954df8f592d5"},
        {name: "Engelberg", q: "Engelberg", region: "Obwald", alt: 1000, lat: 46.820, lon: 8.407, img: "https://vcdn.bergfex.at/images/resized/cc/57314d78759f11cc_e28b7d54cef43495@2x.jpg"},
        {name: "Bugnenets-Savagnières", q: "Saint-Imier", region: "Jura", alt: 1090, lat: 47.135, lon: 6.967, img: "https://static.mycity.travel/manage/uploads/8/58/302109/1/dji-26830-mp4-00-00-09-01-still001-ret_800.jpg"},
        {name: "Les Paccots", q: "Châtel-Saint-Denis", region: "Fribourg", alt: 1061, lat: 46.527, lon: 6.969, img: "https://fribourg.ch/wp-content/uploads/2021/11/paccots-102459-lespaccots2019-hiver-drone-ccreationphoto-5_3000.jpg"}
    ];

    // Inject Filter UI + Sections
    const filterHTML = `
        <div class="mountain-filters-container">
            <div class="mountain-filters">
                <button class="filter-btn active" data-filter="all">Toutes</button>
                <button class="filter-btn" data-filter="Valais">Valais</button>
                <button class="filter-btn" data-filter="Grisons">Grisons</button>
                <button class="filter-btn" data-filter="Bern">Bern</button>
                <button class="filter-btn" data-filter="Vaud">Vaud</button>
                <button class="filter-btn" data-filter="Uri">Uri</button>
                <button class="filter-btn" data-filter="fresh">❄️ Poudreuse</button>
            </div>
        </div>

        <div id="nearby-section" class="nearby-section">
            <div class="nearby-header">
                <h3>📍 Stations à proximité (< 50km)</h3>
                <span class="badge-new">Nouveau</span>
            </div>
            <div id="nearby-grid" class="mountain-grid"></div>
            <hr class="section-divider">
        </div>

        <h3 id="all-title" class="section-title">⛷️ Top Stations Suisses</h3>
        <div id="mountain-grid" class="mountain-grid">
            <div class="loader-spinner"></div>
        </div>
    `;
    $('#mountain-container').html(filterHTML);

    allStationsData = [];
    let requests = stations.map(st => {
        return $.getJSON(`https://api.openweathermap.org/data/2.5/weather?q=${st.q},CH&units=metric&lang=fr&appid=${WEATHER_API_KEY}`)
            .then(data => {
                // Simulation Données Ski
                let snowDepth = st.alt > 1500 ? 120 : 40; 
                // Ajustement basique selon météo actuelle
                if (data.main.temp > 5) snowDepth -= 30;
                if (data.main.temp < -2) snowDepth += 15;
                if (data.weather[0].main === 'Snow') snowDepth += 10;
                if (snowDepth < 0) snowDepth = 0;
                
                let openPistes = Math.floor(Math.random() * 41) + 60; // 60-100%
                let isOpen = true;

                // Simple logic for Open/Closed
                if (snowDepth < 10) {
                    isOpen = false;
                    openPistes = 0;
                }

                return {
                    ...st,
                    // Si pas d'image, on en met une aléatoire cohérente
                    img: st.img || getFallbackImage(st.name),
                    temp: Math.round(data.main.temp),
                    desc: data.weather[0].description,
                    icon: data.weather[0].icon,
                    snowDepth: snowDepth,
                    openPistes: openPistes,
                    isOpen: isOpen,
                    isSnowing: data.weather[0].main === 'Snow',
                    details: data
                };
            })
            .catch(() => null); // Ignore errors
    });

    Promise.all(requests).then(results => {
        allStationsData = results.filter(r => r !== null);
        renderMountains(allStationsData, '#mountain-grid');
        checkUserLocationForMountains(allStationsData);
    });

    // Event Listener delegation (only once)
    $('#mountain-container')
        .off('click', '.filter-btn').on('click', '.filter-btn', function() {
            $('.filter-btn').removeClass('active');
            $(this).addClass('active');
            const filter = $(this).data('filter');
            
            let filtered = allStationsData;
            if (filter === 'fresh') {
                filtered = allStationsData.filter(s => s.isSnowing || s.temp < 0);
            } else if (filter !== 'all') {
                filtered = allStationsData.filter(s => s.region === filter);
            }
            
            // Hide/Show nearby section based on filter
            if(filter === 'all') $('#nearby-section').show(); 
            else $('#nearby-section').hide(); 
            
            renderMountains(filtered, '#mountain-grid');
        })
        .off('click', '.mt-card').on('click', '.mt-card', function() {
            const city = $(this).data('city');
            const name = $(this).find('h3').text(); // Retrieve the station name from the card
            if(city) {
                localStorage.setItem('lastCity', city);
                if(name) localStorage.setItem('lastCityName', name); // Override display name
                $('.sidebar li[data-channel="meteo"]').click();
            }
        });
}


function checkUserLocationForMountains(stations) {
    if (navigator.geolocation) {
        // Options pour récupérer la position plus rapidement
        const options = {
            enableHighAccuracy: false, // Plus rapide, moins précis (suffisant pour <50km)
            timeout: 5000,
            maximumAge: 300000 // Cache 5 min
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLon = position.coords.longitude;
                
                // Calculate distances
                const nearby = stations.map(st => {
                    const dist = getDistanceFromLatLonInKm(userLat, userLon, st.lat, st.lon);
                    return { ...st, distance: dist };
                })
                .filter(st => st.distance <= 50) // 50km radius
                .sort((a,b) => a.distance - b.distance)
                .slice(0, 4); // Top 4 max pour garder un affichage propre

                if(nearby.length > 0) {
                    $('#nearby-section').fadeIn();
                    // On force le mode "nearby" pour ajuster l'affichage si besoin côté JS
                    renderMountains(nearby, '#nearby-grid', true);
                }
            },
            (err) => {
                console.log("Geo denied or error for mountains:", err);
            },
            options
        );
    }
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function renderMountains(list, containerId, isNearby = false) {
    const $grid = $(containerId);
    $grid.html('');
    
    if(list.length === 0) {
        $grid.html('<div class="empty-state">Aucune station ne correspond à ce filtre 🏔️</div>');
        return;
    }

    list.forEach((st, i) => {
        // État pistes
        let statusColor = '#22c55e'; // Green
        if(st.openPistes < 50) statusColor = '#ef4444';
        else if(st.openPistes < 80) statusColor = '#eab308';
        
        // Distance badge if nearby
        let distBadge = '';
        if(isNearby && st.distance) {
            distBadge = `<span class="mt-badge-dist">📍 ${Math.round(st.distance)}km</span>`;
        }

        const openBadge = st.isOpen 
            ? '<span class="mt-badge-open">✅ Ouvert</span>' 
            : '<span class="mt-badge-closed">❌ Fermé</span>';

        const card = `
            <div class="mt-card animate-pop" style="animation-delay: ${i*0.05}s" data-city="${st.q}">
                <div class="mt-card-header" style="background-image: linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.5)), url('${st.img}');">
                    <div class="mt-badges">
                        <span class="mt-badge-region">${st.region}</span>
                        ${openBadge}
                        ${st.isSnowing ? '<span class="mt-badge-snow">❄️ Neige</span>' : ''}
                        ${distBadge}
                    </div>
                    <div class="mt-temp-overlay">
                        ${st.temp}°
                        <img src="https://openweathermap.org/img/wn/${st.icon}.png" alt="icon">
                    </div>
                </div>
                <div class="mt-card-body">
                    <h3>${st.name}</h3>
                    <p class="mt-desc">${st.desc.charAt(0).toUpperCase() + st.desc.slice(1)}</p>
                    
                    <div class="mt-details">
                        <div class="mt-detail">
                            <span class="mt-label">Neige</span>
                            <span class="mt-val">${st.snowDepth} cm</span>
                        </div>
                        <div class="mt-detail">
                            <span class="mt-label">Pistes</span>
                            <span class="mt-val" style="color:${statusColor}">${st.openPistes}%</span>
                        </div>
                        <div class="mt-detail">
                            <span class="mt-label">Altitude</span>
                            <span class="mt-val">${st.alt}m</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        $grid.append(card);
    });
}
