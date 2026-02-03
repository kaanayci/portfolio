function loadPanorama() {
    const cities = ["Genève", "Lausanne", "Zürich", "Bern", "Lugano", "Lucerne", "Basel"];
    $('#panorama-container').html('');
    
    cities.forEach(city => {
        $.getJSON(`https://api.openweathermap.org/data/2.5/weather?q=${city},CH&units=metric&lang=fr&appid=${WEATHER_API_KEY}`)
        .done(data => {
            const temp = Math.round(data.main.temp);
            const icon = data.weather[0].icon;
            
            const card = `
                <div class="city-card animate-pop" onclick="fetchWeather('${city}'); $('.sidebar li[data-channel=meteo]').click();">
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

function loadMountains() {
    // Stations de ski suisses populaires
    const stations = [
        {name: "Zermatt", q: "Zermatt"},
        {name: "Verbier", q: "Bagnes"}, // Weather station for Verbier
        {name: "Crans-Montana", q: "Crans-Montana"},
        {name: "Davos", q: "Davos"},
        {name: "St. Moritz", q: "Saint-Moritz"},
        {name: "Gstaad", q: "Gstaad"},
        {name: "Jungfrau", q: "Lauterbrunnen"},
        {name: "Leysin", q: "Leysin"},
    ];
    
    $('#mountain-container').html('');
    
    stations.forEach(st => {
        $.getJSON(`https://api.openweathermap.org/data/2.5/weather?q=${st.q},CH&units=metric&lang=fr&appid=${WEATHER_API_KEY}`)
        .done(data => {
            const temp = Math.round(data.main.temp);
            // Déterminer si "ça caille" (gel) pour le style visuel
            const isFrozen = temp <= 0 ? 'frozen' : '';
            const desc = data.weather[0].description;
            
            const card = `
                <div class="mountain-card ${isFrozen} animate-pop" onclick="fetchWeather('${st.q}'); $('.sidebar li[data-channel=meteo]').click();">
                    <h3>${st.name}</h3>
                    <span class="mt-temp">${temp}°C</span>
                    <span class="mt-desc">${desc}</span>
                </div>
            `;
            $('#mountain-container').append(card);
        });
    });
}
