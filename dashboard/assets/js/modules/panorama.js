function loadPanorama() {
    const cities = ["Genève", "Lausanne", "Zürich", "Bern", "Lugano", "Lucerne", "Basel"];
    $('#panorama-container').html('');
    
    cities.forEach(city => {
        $.getJSON(`https://api.openweathermap.org/data/2.5/weather?q=${city},CH&units=metric&lang=fr&appid=${WEATHER_API_KEY}`)
        .done(data => {
            const temp = Math.round(data.main.temp);
            const icon = data.weather[0].icon;
            
            const card = `
                <div class="city-card animate-pop" onclick="localStorage.setItem('lastCity', '${city}'); $('.sidebar li[data-channel=meteo]').click();">
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

function loadMountains() {
    const stations = [
        {name: "Zermatt", q: "Zermatt", region: "Valais", alt: 1620, lat: 46.0207, lon: 7.7491, img: "https://images.unsplash.com/photo-1551524164-687a55dd1126?w=400&q=80"},
        {name: "Verbier", q: "Bagnes", region: "Valais", alt: 1500, lat: 46.0968, lon: 7.2266, img: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&q=80"},
        {name: "Crans-Montana", q: "Crans-Montana", region: "Valais", alt: 1495, lat: 46.3117, lon: 7.4789, img: "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=400&q=80"},
        {name: "Davos", q: "Davos", region: "Grisons", alt: 1560, lat: 46.8027, lon: 9.8297, img: "https://images.unsplash.com/photo-1565538059049-76082989b142?w=400&q=80"},
        {name: "St. Moritz", q: "Saint-Moritz", region: "Grisons", alt: 1822, lat: 46.4908, lon: 9.8355, img: "https://images.unsplash.com/photo-1519965042835-f0e7eb2de176?w=400&q=80"},
        {name: "Gstaad", q: "Gstaad", region: "Bern", alt: 1050, lat: 46.4746, lon: 7.2863, img: "https://images.unsplash.com/photo-1520636830509-54d9c4902120?w=400&q=80"},
        {name: "Jungfrau", q: "Lauterbrunnen", region: "Bern", alt: 796, lat: 46.598, lon: 7.907, img: "https://images.unsplash.com/photo-1465220183275-1faa863377e3?w=400&q=80"},
        {name: "Leysin", q: "Leysin", region: "Vaud", alt: 1260, lat: 46.3358, lon: 7.009, img: "https://images.unsplash.com/photo-1456360699049-c1249b5ae489?w=400&q=80"},
        {name: "Villars", q: "Villars-sur-Ollon", region: "Vaud", alt: 1300, lat: 46.298, lon: 7.057, img: "https://images.unsplash.com/photo-1530752490138-0ed4b2cd33c1?w=400&q=80"},
        {name: "Engelberg", q: "Engelberg", region: "Obwald", alt: 1000, lat: 46.820, lon: 8.407, img: "https://images.unsplash.com/photo-1617196016335-5b8d23d8c21f?w=400&q=80"},
        {name: "Adelboden", q: "Adelboden", region: "Bern", alt: 1350, lat: 46.491, lon: 7.558, img: "https://images.unsplash.com/photo-1516942111000-0925fb3568c4?w=400&q=80"},
        {name: "Arosa", q: "Arosa", region: "Grisons", alt: 1775, lat: 46.779, lon: 9.678, img: "https://images.unsplash.com/photo-1548777123-e216912df7d8?w=400&q=80"},
        {name: "Bugnenets-Sav.", q: "Saint-Imier", region: "Jura", alt: 1090, lat: 47.135, lon: 6.967, img: "https://images.unsplash.com/photo-1482867996988-29bfffe79584?w=400&q=80"},
        {name: "Les Paccots", q: "Châtel-Saint-Denis", region: "Fribourg", alt: 1061, lat: 46.527, lon: 6.969, img: "https://images.unsplash.com/photo-1518182170546-0766ce6fabe4?w=400&q=80"}
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
                <button class="filter-btn" data-filter="Jura">Jura</button>
                <button class="filter-btn" data-filter="fresh">❄️ Poudreuse</button>
            </div>
        </div>

        <div id="nearby-section" style="display:none; margin-bottom: 2.5rem;">
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:1rem;">
                <h3 style="margin:0;">📍 Stations à proximité (< 50km)</h3>
                <span style="background:#dbeafe; color:#1e40af; padding:2px 8px; border-radius:10px; font-size:0.8rem; font-weight:bold;">Nouveau</span>
            </div>
            <div id="nearby-grid" class="mountain-grid"></div>
            <hr style="border:0; border-top:1px solid #e2e8f0; margin-top:2rem;">
        </div>

        <h3 id="all-title" style="margin-bottom:1rem;">⛷️ Top Stations Suisses</h3>
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
    $('#mountain-container').off('click', '.filter-btn').on('click', '.filter-btn', function() {
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
        if(filter === 'all') $('#nearby-section').show(); // Re-show if compatible? actually keep it simple:
        else $('#nearby-section').hide(); // Hide nearby when filtering
        
        renderMountains(filtered, '#mountain-grid');
    });
}


function checkUserLocationForMountains(stations) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLon = position.coords.longitude;
                
                // Calculate distances
                const nearby = stations.map(st => {
                    const dist = getDistanceFromLatLonInKm(userLat, userLon, st.lat, st.lon);
                    return { ...st, distance: dist };
                })
                .filter(st => st.distance <= 50) // 50km radius (Swiss scale)
                .sort((a,b) => a.distance - b.distance)
                .slice(0, 3); // Top 3

                if(nearby.length > 0) {
                    $('#nearby-section').fadeIn();
                    renderMountains(nearby, '#nearby-grid', true);
                }
            },
            (err) => {
                console.log("Geo denied or error for mountains:", err);
            }
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
            <div class="mt-card animate-pop" style="animation-delay: ${i*0.05}s" onclick="localStorage.setItem('lastCity', '${st.q}'); $('.sidebar li[data-channel=meteo]').click();">
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
