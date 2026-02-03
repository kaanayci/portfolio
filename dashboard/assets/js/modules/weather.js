// Helper to get Moon Phase Icon and Name
function getMoonPhase(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    if (month < 3) {
        year--;
        month += 12;
    }
    ++month;
    let c = 365.25 * year;
    let e = 30.6 * month;
    let jd = c + e + day - 694039.09; // jd is total days elapsed
    jd /= 29.5305882; // divide by the moon cycle
    let b = parseInt(jd); // int(jd) -> b, take integer part of jd
    jd -= b; // subtract integer part to leave fractional part of original jd
    b = Math.round(jd * 8); // scale fraction from 0-8 and round
    if (b >= 8) b = 0; // 0 and 8 are the same so turn 8 into 0

    const phases = {
        0: { name: "Nouvelle Lune", icon: "🌑" },
        1: { name: "Premier Croissant", icon: "🌒" },
        2: { name: "Premier Quartier", icon: "🌓" },
        3: { name: "Lune Gibbeuse", icon: "🌔" },
        4: { name: "Pleine Lune", icon: "🌕" },
        5: { name: "Lune Gibbeuse", icon: "🌖" },
        6: { name: "Dernier Quartier", icon: "🌗" },
        7: { name: "Dernier Croissant", icon: "🌘" }
    };

    return phases[b];
}

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
            
        // 4. UV Index (NEW) - Trying to mock gracefully because OneCall is paid usually
        // Note: Using standard OWM UV endpoint which sometimes works with standard keys or checking One Call if available.
        // For standard keys on 2.5, there is a dedicated endpoint "http://api.openweathermap.org/data/2.5/uvi" but it is often deprecated.
        // We will try One Call 2.5 or just use a fallback mock if it fails to avoid breaking the UI for free users without subscription.
        
        // Trying to fetch UV from OneCall (excluding everything else to save bandwidth)
        // If this fails (401), we fall back to estimation.
        $.getJSON(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&appid=${WEATHER_API_KEY}`)
            .done(function(onecallData) {
               if(onecallData && onecallData.current) {
                   renderUV(onecallData.current.uvi);
               }
            })
            .fail(function() {
                // Determine UV from clear sky and time of day (Mock fallback for strict free tier keys)
                const hour = new Date().getHours();
                const isSunny = data.weather[0].main.toLowerCase() === 'clear';
                let mockUV = 0;
                
                // Simple logic: UV is highest at noon (12-14) if sunny
                if(hour >= 10 && hour <= 16) {
                    if (isSunny) mockUV = Math.floor(Math.random() * 4) + 4; // 4-7
                    else mockUV = Math.floor(Math.random() * 3) + 1; // 1-3
                } else if (hour > 8 && hour < 18) {
                    mockUV = Math.floor(Math.random() * 2) + 1; // 1-2
                }
                
                renderUV(mockUV, true); // true = estimated
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
        <div class="detail-item animate-pop" style="animation-delay: 0.1s">
            <span>🍃 Qualité Air</span>
            <strong style="color:${info.color}">${info.text}</strong>
        </div>
    `;
    
    $(".weather-details-grid").append(airHtml);
}

function renderUV(uvIndex, isEstimated = false) {
    let color = "#22c55e"; // Green
    let text = "Faible";
    
    if(uvIndex >= 3) { color = "#eab308"; text = "Modéré"; } // Yellow
    if(uvIndex >= 6) { color = "#f97316"; text = "Élevé"; } // Orange
    if(uvIndex >= 8) { color = "#ef4444"; text = "Très Élevé"; } // Red
    if(uvIndex >= 11) { color = "#7f1d1d"; text = "Extrême"; } // Violet (Dark Red here)
    
    const uvHtml = `
         <div class="detail-item animate-pop" style="animation-delay: 0.2s">
            <span>☀️ Indice UV${isEstimated ? '*' : ''}</span>
            <strong style="color:${color}">${Math.round(uvIndex)} (${text})</strong>
        </div>
    `;
     $(".weather-details-grid").append(uvHtml);
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
    
    // Moon Phase
    const moon = getMoonPhase(new Date());

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
        advice = "🌧️ Prenez un parapluie !";
    } else if (mainCond.includes("snow")) {
        advice = "🧥 Sortez couverts !";
    } else if (temp < 0) {
        advice = "🥶 Glacial ! Doudoune obligatoire.";
    } else if (temp < 10) {
        advice = "🧣 N'oubliez pas votre écharpe.";
    } else if (temp > 30) {
        advice = "🥵 Hydratez-vous !";
    } else if (temp > 20 && mainCond.includes("clear")) {
        advice = "😎 Lunettes de soleil conseillées.";
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
                <img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="${desc}" class="floating-icon" style="filter: drop-shadow(0 0 8px rgba(255,255,255,0.5));">
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
                <div class="detail-item animate-pop" style="animation-delay: 0.3s">
                    <span>${moon.icon} Lune</span>
                    <strong>${moon.name}</strong>
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
        
        // Dynamic Chart Color based on Theme
        const isDark = document.body.classList.contains('dark');
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
        const textColor = isDark ? '#cbd5e1' : '#334155';
        
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
                        pointBackgroundColor: isDark ? '#1e293b' : '#fff',
                        pointBorderColor: '#fbbf24',
                        pointRadius: 5,
                        pointHoverRadius: 8,
                        fill: true
                    },
                    {
                        type: 'bar',
                        label: 'Pluie (mm)',
                        data: rains,
                        backgroundColor: 'rgba(59, 130, 246, 0.5)', // Bleu pluie
                        yAxisID: 'y1',
                        borderRadius: 4,
                        barPercentage: 0.6
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
                    legend: { display: true, labels: { color: textColor } },
                    tooltip: {
                        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        titleColor: isDark ? '#f1f5f9' : '#0f172a',
                        bodyColor: textColor,
                        borderColor: isDark ? '#334155' : '#e2e8f0',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += context.parsed.y;
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: { 
                        grid: { display: false }, 
                        ticks: { color: textColor } 
                    },
                    y: { 
                        display: false, 
                        position: 'left',
                        suggestedMin: Math.min(...temps) - 2,
                        suggestedMax: Math.max(...temps) + 2
                    },
                    y1: {
                        display: false,
                        position: 'right',
                        suggestedMax: 5,
                        grid: { display: false }
                    }
                }
            }
        });
    }

    const dailyGroups = {};
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
        
        if (!dailyGroups[day]) {
            dailyGroups[day] = { temps: [], icons: [], descs: [] };
        }
        dailyGroups[day].temps.push(item.main.temp);
        
        // Prioritize noon forecast for icon/desc, else take first
        if (item.dt_txt.includes("12:00:00") || dailyGroups[day].icons.length === 0) {
            dailyGroups[day].icon = item.weather[0].icon;
            dailyGroups[day].desc = item.weather[0].description;
        }
    });

    const days = Object.keys(dailyGroups).slice(0, 5); // Take 5 days
    
    let html = '<h3>📅 Prévisions 5 Jours</h3><div class="forecast-grid">';
    
    days.forEach((dayName, index) => {
        const dayData = dailyGroups[dayName];
        const minTemp = Math.round(Math.min(...dayData.temps));
        const maxTemp = Math.round(Math.max(...dayData.temps));
        const icon = dayData.icon;
        
        // Staggered animation delay
        const delay = index * 0.1;
        
        html += `
            <div class="forecast-card animate-pop" style="animation-delay: ${delay}s">
                <div class="fc-day">${dayName}</div>
                <div class="fc-icon-wrapper">
                    <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="icon" class="fc-icon floating-icon" style="animation-delay: ${delay}s">
                </div>
                <div class="fc-temp-range">
                    <span class="max">↑ ${maxTemp}°</span>
                    <span class="min">↓ ${minTemp}°</span>
                </div>
                <div class="fc-desc">${dayData.desc}</div>
            </div>
        `;
    });
    
    html += '</div>';
    $('#forecast-container').html(html);
}
