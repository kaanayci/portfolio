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

    const mapCities = [
        {name: "Genève", coords: [46.2044, 6.1432]},
        {name: "Zurich", coords: [47.3769, 8.5417]},
        {name: "Bern", coords: [46.9480, 7.4474]},
        {name: "Lugano", coords: [46.0037, 8.9511]},
        {name: "Basel", coords: [47.5596, 7.5886]}
    ];

    mapCities.forEach(city => {
        $.getJSON(`https://api.openweathermap.org/data/2.5/weather?q=${city.name},CH&units=metric&lang=fr&appid=${WEATHER_API_KEY}`)
        .done(data => {
            const temp = Math.round(data.main.temp);
            const desc = data.weather[0].description;
            const icon = data.weather[0].icon;

            const popupContent = `
                <div style="text-align:center">
                    <b>${city.name}</b><br>
                    <img src="https://openweathermap.org/img/wn/${icon}.png" style="width:30px;vertical-align:middle"> ${temp}°C<br>
                    ${desc}
                </div>
            `;

            L.marker(city.coords)
                .addTo(mapInstance)
                .bindPopup(popupContent);
        });
    });
}
