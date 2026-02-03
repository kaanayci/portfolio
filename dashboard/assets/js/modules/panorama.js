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
        {name: "Zermatt", q: "Zermatt", region: "Valais", alt: 1620, img: "https://images.unsplash.com/photo-1551524164-687a55dd1126?w=400&q=80"},
        {name: "Verbier", q: "Bagnes", region: "Valais", alt: 1500, img: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&q=80"},
        {name: "Crans-Montana", q: "Crans-Montana", region: "Valais", alt: 1495, img: "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=400&q=80"},
        {name: "Davos", q: "Davos", region: "Grisons", alt: 1560, img: "https://images.unsplash.com/photo-1565538059049-76082989b142?w=400&q=80"},
        {name: "St. Moritz", q: "Saint-Moritz", region: "Grisons", alt: 1822, img: "https://images.unsplash.com/photo-1519965042835-f0e7eb2de176?w=400&q=80"},
        {name: "Gstaad", q: "Gstaad", region: "Bern", alt: 1050, img: "https://images.unsplash.com/photo-1520636830509-54d9c4902120?w=400&q=80"},
        {name: "Jungfrau", q: "Lauterbrunnen", region: "Bern", alt: 796, img: "https://images.unsplash.com/photo-1465220183275-1faa863377e3?w=400&q=80"},
        {name: "Leysin", q: "Leysin", region: "Vaud", alt: 1260, img: "https://images.unsplash.com/photo-1456360699049-c1249b5ae489?w=400&q=80"},
    ];

    // Inject Filter UI
    const filterHTML = `
        <div class="mountain-filters-container">
            <div class="mountain-filters">
                <button class="filter-btn active" data-filter="all">Toutes</button>
                <button class="filter-btn" data-filter="Valais">Valais</button>
                <button class="filter-btn" data-filter="Grisons">Grisons</button>
                <button class="filter-btn" data-filter="Bern">Bern</button>
                <button class="filter-btn" data-filter="Vaud">Vaud</button>
                <button class="filter-btn" data-filter="fresh">❄️ Poudreuse</button>
            </div>
        </div>
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
                if (data.main.temp > 5) snowDepth -= 20;
                if (data.main.temp < -2) snowDepth += 15;
                if (data.weather[0].main === 'Snow') snowDepth += 5;
                
                const openPistes = Math.floor(Math.random() * 41) + 60; // 60-100%

                return {
                    ...st,
                    temp: Math.round(data.main.temp),
                    desc: data.weather[0].description,
                    icon: data.weather[0].icon,
                    snowDepth: snowDepth,
                    openPistes: openPistes,
                    isSnowing: data.weather[0].main === 'Snow',
                    details: data
                };
            })
            .catch(() => null); // Ignore errors
    });

    Promise.all(requests).then(results => {
        allStationsData = results.filter(r => r !== null);
        renderMountains(allStationsData);
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
        renderMountains(filtered);
    });
}

function renderMountains(list) {
    const $grid = $('#mountain-grid');
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

        const card = `
            <div class="mt-card animate-pop" style="animation-delay: ${i*0.05}s" onclick="localStorage.setItem('lastCity', '${st.q}'); $('.sidebar li[data-channel=meteo]').click();">
                <div class="mt-card-header" style="background-image: linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.5)), url('${st.img}');">
                    <div class="mt-badges">
                        <span class="mt-badge-region">${st.region}</span>
                        ${st.isSnowing ? '<span class="mt-badge-snow">❄️ Neige</span>' : ''}
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
