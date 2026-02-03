function fetchWeather(query) {
    let urlCurrent = "";
    let urlForecast = "";
    
    // Save/Update unit UI
    if(typeof updateUnitUI === 'function') updateUnitUI();
  
    if (typeof query === "object" && query.lat) {
        urlCurrent = `https://api.openweathermap.org/data/2.5/weather?lat=${query.lat}&lon=${query.lon}&units=${currentUnit}&lang=fr&appid=${WEATHER_API_KEY}`;
        urlForecast = `https://api.openweathermap.org/data/2.5/forecast?lat=${query.lat}&lon=${query.lon}&units=${currentUnit}&lang=fr&appid=${WEATHER_API_KEY}`;
    } else {
        urlCurrent = `https://api.openweathermap.org/data/2.5/weather?q=${query}&units=${currentUnit}&lang=fr&appid=${WEATHER_API_KEY}`;
        urlForecast = `https://api.openweathermap.org/data/2.5/forecast?q=${query}&units=${currentUnit}&lang=fr&appid=${WEATHER_API_KEY}`;
    }
  
    // Show Skeleton instead of simple loader
    renderSkeleton();
  
    // 1. Current Weather
    $.getJSON(urlCurrent)
      .done(function (data) {
        renderWeather(data);
        updateBackground(data.weather[0].main); // Clear, Rain, Clouds, Snow
        
        if (typeof query === "string") {
            localStorage.setItem("lastCity", query);
            addToHistory(query);
        }
  
        // 2. Forecast (only if current succeeded)
        $.getJSON(urlForecast).done(function(forecastData) {
            renderForecast(forecastData);
        });
  
        // 3. Air Pollution (NEW)
        const lat = data.coord.lat;
        const lon = data.coord.lon;
        $.getJSON(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`)
            .done(function(airData) {
                const aqi = airData.list[0].main.aqi; 
                renderAirQuality(aqi);
            });
      })
      .fail(function (jqXHR) {
          let msg = "Ville introuvable.";
          if(jqXHR.status === 0) msg = "Problème de connexion internet.";
          else if(jqXHR.status === 401) msg = "Erreur API (Clé invalide).";
          
          displayError(msg);
      });
}
  
function renderAirQuality(aqi) {
    const labels = {
        1: { text: "Excellente", color: "#22c55e" },
        2: { text: "Bonne", color: "#84cc16" },
        3: { text: "Modérée", color: "#eab308" },
        4: { text: "Mauvaise", color: "#f97316" },
        5: { text: "Très Mauvaise", color: "#ef4444" }
    };
    
    const info = labels[aqi] || { text: "Inconnue", color: "#94a3b8" };
    
    const airHtml = `
        <div class="detail-item">
            <span>🍃 Qualité Air</span>
            <strong style="color:${info.color}">${info.text}</strong>
        </div>
    `;
    
    $(".weather-details-grid").append(airHtml);
}

function renderWeather(data) {
    const city = data.name;
    const country = data.sys.country;
    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const desc = data.weather[0].description;
    const icon = data.weather[0].icon;
    const humidity = data.main.humidity;
    const windSpeed = Math.round(data.wind.speed * 3.6);
    const windDeg = data.wind.deg; // Direction du vent
    const pressure = data.main.pressure;
    const visibility = (data.visibility / 1000).toFixed(1); // mètres -> km

    // Horaires Soleil & Auto Dark Mode
    const now = Date.now() / 1000;
    const isNight = now < data.sys.sunrise || now > data.sys.sunset;
    
    // Auto Theme Logic
    if (localStorage.getItem("theme") !== "light" && localStorage.getItem("theme") !== "dark") {
        if(isNight) $("body").addClass("dark"); 
        else $("body").removeClass("dark");
    }
    
    $("#theme-toggle").text($("body").hasClass("dark") ? "☀️" : "🌙");

    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});

    // Recommandation Vestimentaire
    let advice = "Profitez de votre journée !";
    const mainCond = data.weather[0].main.toLowerCase();
    
    if (mainCond.includes("rain") || mainCond.includes("drizzle") || mainCond.includes("thunderstorm")) {
        advice = "🌧️ Prenez un parapluie, ça mouille !";
    } else if (mainCond.includes("snow")) {
        advice = "🧥 Sortez couverts, il neige !";
    } else if (temp < 0) {
        advice = "🥶 Glacial ! Doudoune et gants obligatoires.";
    } else if (temp < 10) {
        advice = "🧣 Il fait frais, n'oubliez pas votre écharpe.";
    } else if (temp > 30) {
        advice = "🥵 Hydratez-vous et restez au frais !";
    } else if (temp > 20 && mainCond.includes("clear")) {
        advice = "😎 T-shirt et lunettes de soleil conseillés.";
    }
    
    // Unit Labels
    const unitLabel = getUnitLabel();
    const speedLabel = getSpeedLabel();

    // Favorites Check
    const favorites = JSON.parse(localStorage.getItem('weatherFavs') || '[]');
    const isFav = favorites.includes(city);
    const favClass = isFav ? 'active' : '';

    $("#weather-result").html(`
      <div class="weather-card animate-pop">
        <div class="weather-header">
            <div>
                <h3>${city} ${country === 'CH' ? '🇨🇭' : country}</h3>
                <p class="weather-desc">${desc.charAt(0).toUpperCase() + desc.slice(1)}</p>
            </div>
            <div class="weather-actions">
                <button class="icon-btn ${favClass}" id="btn-fav" data-city="${city}" title="Ajouter aux favoris">⭐</button>
                <button class="icon-btn" id="btn-share" title="Partager">📤</button>
            </div>
        </div>
        
        <div class="weather-main">
            <div class="temp-big">
                ${temp}${unitLabel}
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}" class="floating-icon">
            </div>
            <p class="feels-like">Ressenti ${feelsLike}${unitLabel}</p>
            
            <div class="weather-details-grid">
                <div class="detail-item">
                    <span>💧 Humidité</span>
                    <strong>${humidity}%</strong>
                </div>
                <div class="detail-item">
                    <span>💨 Vent</span>
                    <div class="wind-compass">
                        <span style="transform: rotate(${windDeg}deg); display:inline-block; font-size: 1.2rem;">➤</span>
                        <strong>${windSpeed} ${speedLabel}</strong>
                    </div>
                </div>
                <div class="detail-item">
                    <span>👁️ Visibilité</span>
                    <strong>${visibility} km</strong>
                </div>
                <div class="detail-item">
                    <span>⏲️ Pression</span>
                    <strong>${pressure} hPa</strong>
                </div>
                <div class="detail-item">
                    <span>🌅 Lever</span>
                    <strong>${sunrise}</strong>
                </div>
                <div class="detail-item">
                    <span>🌇 Coucher</span>
                    <strong>${sunset}</strong>
                </div>
            </div>

            <div class="clothing-tip">
                ${advice}
            </div>
        </div>
      </div>
      
      <div class="chart-container animate-pop">
        <canvas id="tempChart"></canvas>
      </div>

      <div id="forecast-container" class="forecast-container"></div>
    `);
}

function renderForecast(data) {
    const chartSlice = data.list.slice(0, 9); // Next 24h approx
    const labels = chartSlice.map(item => new Date(item.dt * 1000).getHours() + 'h');
    const temps = chartSlice.map(item => Math.round(item.main.temp));
    const rains = chartSlice.map(item => item.rain ? (item.rain['3h'] || 0) : 0);

    const ctx = document.getElementById('tempChart');
    if (ctx) {
        if (weatherChart) weatherChart.destroy();
        
        weatherChart = new Chart(ctx, {
            type: 'bar', // Base type
            data: {
                labels: labels,
                datasets: [
                    {
                        type: 'line',
                        label: 'Température (°C)',
                        data: temps,
                        borderColor: '#fbbf24', // Jaune soleil
                        backgroundColor: 'rgba(251, 191, 36, 0.2)',
                        borderWidth: 3,
                        tension: 0.4,
                        yAxisID: 'y',
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#fbbf24',
                        pointRadius: 4
                    },
                    {
                        type: 'bar',
                        label: 'Pluie (mm)',
                        data: rains,
                        backgroundColor: 'rgba(59, 130, 246, 0.5)', // Bleu pluie
                        yAxisID: 'y1',
                        barPercentage: 0.5,
                        categoryPercentage: 1.0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: { display: true, labels: { color: document.body.classList.contains('dark') ? '#cbd5e1' : '#334155' } },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#0f172a',
                        bodyColor: '#334155',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        padding: 10
                    }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { color: document.body.classList.contains('dark') ? '#cbd5e1' : '#334155' } },
                    y: { 
                        display: false, 
                        position: 'left',
                        suggestedMin: Math.min(...temps) - 5,
                        suggestedMax: Math.max(...temps) + 5
                    },
                    y1: {
                        display: false,
                        position: 'right',
                        suggestedMax: 10,
                        grid: { display: false }
                    }
                }
            }
        });
    }

    const dailyGroups = {};
    data.list.forEach(item => {
        const day = new Date(item.dt * 1000).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
        if (!dailyGroups[day]) {
            dailyGroups[day] = { temps: [], icons: [], descs: [] };
        }
        dailyGroups[day].temps.push(item.main.temp);
        if (item.dt_txt.includes("12:00:00") || dailyGroups[day].icons.length === 0) {
            dailyGroups[day].icon = item.weather[0].icon;
            dailyGroups[day].desc = item.weather[0].description;
        }
    });

    const days = Object.keys(dailyGroups).slice(0, 5); // Take 5 days
    
    let html = '<h3>📅 Prévisions 5 Jours (Min / Max)</h3><div class="forecast-grid">';
    
    days.forEach(dayName => {
        const dayData = dailyGroups[dayName];
        const minTemp = Math.round(Math.min(...dayData.temps));
        const maxTemp = Math.round(Math.max(...dayData.temps));
        const icon = dayData.icon;
        
        html += `
            <div class="forecast-card animate-pop">
                <div class="fc-day">${dayName}</div>
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="icon" class="fc-icon">
                <div class="fc-temp-range">
                    <span class="max">${maxTemp}°</span>
                    <span class="min">${minTemp}°</span>
                </div>
                <div class="fc-desc">${dayData.desc}</div>
            </div>
        `;
    });
    
    html += '</div>';
    $('#forecast-container').html(html);
}

// Events
$(document).on("click", "#btn-geo", function() {
    if (!navigator.geolocation) return alert("Géolocalisation non supportée");
    $("#weather-result").html("<div class='loading'>📡 Localisation...</div>");
    navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => $("#weather-result").html("<div class='error'>❌ Erreur GPS</div>")
    );
});

$(document).on("submit", "#weather-form", function (e) {
  e.preventDefault();
  const val = $("#weather-input").val().trim();
  if (val) fetchWeather(val);
});
