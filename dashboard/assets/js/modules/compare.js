function compareCities() {
    const city1 = $('#city1').val();
    const city2 = $('#city2').val();

    if(!city1 || !city2) return alert("Veuillez entrer deux villes.");

    const p1 = $.getJSON(`https://api.openweathermap.org/data/2.5/weather?q=${city1}&units=metric&lang=fr&appid=${WEATHER_API_KEY}`);
    const p2 = $.getJSON(`https://api.openweathermap.org/data/2.5/weather?q=${city2}&units=metric&lang=fr&appid=${WEATHER_API_KEY}`);

    $.when(p1, p2).done(function(r1, r2) {
        const data1 = r1[0];
        const data2 = r2[0];

        renderComparison(data1, data2);
    }).fail(function() {
        alert("Erreur lors de la récupération des données. Vérifiez les noms des villes.");
    });
}

function renderComparison(d1, d2) {
    const tempwinner = d1.main.temp > d2.main.temp ? 1 : 2;

    const html = `
        ${createCompareCard(d1, tempwinner === 1)}
        ${createCompareCard(d2, tempwinner === 2)}
    `;

    $('#compare-result').html(html);
}

function createCompareCard(data, isWarmer) {
    const temp = Math.round(data.main.temp);
    
    return `
        <div class="compare-card animate-pop">
            <h3>${data.name}</h3>
            <div class="compare-temp">${temp}°</div>
            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="icon">
            
            <div class="compare-details">
                <div class="compare-stat">
                    <span>Ressenti</span>
                    <span>${Math.round(data.main.feels_like)}°</span>
                </div>
                <div class="compare-stat">
                    <span>Humidité</span>
                    <span>${data.main.humidity}%</span>
                </div>
                <div class="compare-stat">
                    <span>Vent</span>
                    <span>${Math.round(data.wind.speed * 3.6)} km/h</span>
                </div>
            </div>
            ${isWarmer ? '<p class="winner" style="margin-top:1rem">🔥 Le plus chaud</p>' : ''}
        </div>
    `;
}
