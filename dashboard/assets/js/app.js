
$(document).ready(function () {
  // --- Contenu des pages ---
  const pages = {
    home: `
        <section class="home">
            <h2>🇨🇭 Panorama Suisse</h2>
            <p>Aperçu en direct des grandes régions.</p>

            <div class="panorama-grid" id="panorama-container">
                <div class="loading">📡 Chargement du panorama...</div>
            </div>
        </section>
    `,
    meteo: `
        <section class="weather">
            <h2>Météo Locale</h2>
            
            <div class="weather__controls">
                <button id="btn-geo" class="btn-secondary">📍 Ma position</button>
                <span class="separator">ou</span>
                <form id="weather-form" class="weather__form">
                    <input
                        type="text"
                        id="weather-input"
                        placeholder="Ex: Lausanne, Genève, Sion..."
                        required
                    >
                    <button type="submit">Rechercher</button>
                </form>
                
                <!-- Unit Toggle -->
                <div class="unit-toggle-container" id="unit-toggle" data-unit="metric">
                    <div class="toggle-pill"></div>
                    <span class="unit-option active" data-val="metric">°C</span>
                    <span class="unit-option" data-val="imperial">°F</span>
                </div>
            </div>

            <div id="weather-result" class="weather__result">
                <div class="empty-state">
                    <span style="font-size: 3rem">🏔️</span>
                    <p>Entrez une ville suisse pour voir les prévisions.</p>
                </div>
            </div>

            <!-- Historique récent (Bonus simple) -->
            <div id="weather-history" class="weather-history" style="display:none; margin-top: 2rem;">
                <h3>Dernières recherches</h3>
                <div class="tags-container" id="history-tags"></div>
            </div>
        </section>
    `,
    mountain: `
        <section class="mountain">
            <h2>🏔️ Stations de Ski & Alpes</h2>
            <p>Conditions dans les stations populaires.</p>

            <div class="mountain-grid" id="mountain-container">
                 <div class="loading">❄️ Chargement des stations...</div>
            </div>
        </section>
    `,
    map: `
        <section class="map-section">
            <h2>🗺️ Carte Interactive</h2>
            <p>Météo en direct sur la Suisse.</p>
            <div id="map"></div>
        </section>
    `,
    favorites: `
        <section class="favorites-section">
            <h2>🌟 Mes Villes Favorites</h2>
            <p>Vos lieux préférés en un coup d'œil.</p>
            
            <div id="favorites-grid" class="favorites-grid">
                <div class="loading">Chargement des favoris...</div>
            </div>
            <div id="fav-empty-state" class="empty-state" style="display:none">
                <span style="font-size: 3rem">⭐</span>
                <p>Aucun favori pour le moment.</p>
                <p style="font-size:0.9rem; opacity:0.7">Ajoutez des villes depuis la recherche avec le bouton étoile.</p>
            </div>
        </section>
    `,
    compare: `
        <section class="compare-section">
            <h2>🆚 Comparateur de Villes</h2>
            <p>Comparez la météo de deux villes en temps réel.</p>
            
            <div class="comparison-inputs">
                <input type="text" id="city1" placeholder="Ville 1 (ex: Genève)" value="Genève">
                <input type="text" id="city2" placeholder="Ville 2 (ex: Zurich)" value="Zurich">
                <button onclick="compareCities()">Comparer</button>
            </div>
            
            <div id="compare-result" class="comparison-grid">
                <div class="empty-state" style="grid-column: span 2">
                    Appuyez sur "Comparer" pour lancer le match !
                </div>
            </div>
        </section>
    `,
    settings: `
        <section class="settings">
            <h2>Paramètres</h2>
            
            <div class="settings-group">
                <h3>Thème</h3>
                <p>Personnalisez l'apparence de l'application.</p>
                <button id="btn-theme-toggle" class="btn-secondary">Basculer Mode Sombre/Clair</button>
            </div>

            <div class="settings-group" style="margin-top: 2rem;">
                <h3>Données</h3>
                <button id="btn-reset-app" class="btn-secondary" style="color: #ef4444; border-color: #ef4444;">
                    🗑️ Effacer l'historique
                </button>
            </div>
        </section>
    `,
  };

  // --- Navigation ---
  $(".sidebar li").on("click", function () {
    const pageKey = $(this).data("channel");
    const pageTitle = $(this).text();

    $(".sidebar li").removeClass("active");
    $(this).addClass("active");

    $("#channel-title").text(pageTitle);

    $(".content").fadeOut(150, function () {
      $(this)
        .html(pages[pageKey])
        .fadeIn(200, function () {
            // Après chargement de la vue :
            if (pageKey === "home") {
                loadPanorama();
            }
            if (pageKey === "meteo") {
                loadHistory(); 
                const lastCity = localStorage.getItem("lastCity");
                if(lastCity) fetchWeather(lastCity);
            }
            if (pageKey === "favorites") {
                loadFavoritesPage();
            }
            if (pageKey === "mountain") {
                loadMountains();
            }
            if (pageKey === "map") {
                setTimeout(initMap, 100); // Slight delay for Leaflet to detect container size
            }
        });
    });
  });

  // --- Theme Management ---
  function applyTheme() {
      const theme = localStorage.getItem("theme");
      if (theme === "dark") {
          $("body").addClass("dark");
          $("#theme-toggle").text("☀️");
      } else {
          $("body").removeClass("dark");
          $("#theme-toggle").text("🌙");
      }
  }

  $("#theme-toggle, #btn-theme-toggle").on("click", function () {
    const isDark = $("body").hasClass("dark");
    localStorage.setItem("theme", isDark ? "light" : "dark");
    applyTheme();
  });
  
  // Appliquer le thème au démarrage
  applyTheme();

  // --- Reset App ---
  $(document).on("click", "#btn-reset-app", function() {
      if(confirm("Effacer tout l'historique ?")) {
          localStorage.clear();
          location.reload();
      }
  });

  // Init
  $(".content").html(pages.home);
});

// --- Logic Météo ---
const WEATHER_API_KEY = "8bf9317dd25811ccc3ea56a0309ffc5a";
let weatherChart = null; // Instance globale du graphique
let currentUnit = localStorage.getItem('weatherUnit') || 'metric'; // 'metric' (C) or 'imperial' (F)

function getUnitLabel() {
    return currentUnit === 'metric' ? '°C' : '°F';
}

function getSpeedLabel() {
    return currentUnit === 'metric' ? 'km/h' : 'mph';
}

function renderSkeleton() {
    const skeletonHTML = `
        <div class="weather-card animate-pop skeleton">
            <div class="weather-header">
                <div class="skeleton-title" style="width: 50%"></div>
            </div>
            <div class="weather-main">
                <div class="skeleton-circle"></div>
                <div class="skeleton-title" style="width: 30%; margin-top: 1rem;"></div>
                <div class="weather-details-grid" style="margin-top: 2rem; width: 100%;">
                    <div class="skeleton-text"></div><div class="skeleton-text"></div>
                    <div class="skeleton-text"></div><div class="skeleton-text"></div>
                    <div class="skeleton-text"></div><div class="skeleton-text"></div>
                </div>
            </div>
        </div>
        <div class="chart-container animate-pop skeleton"></div>
    `;
    $("#weather-result").html(skeletonHTML);
}

function displayError(message) {
    const errorHTML = `
        <div class="error-state animate-pop">
            <span style="font-size: 3rem; display: block; margin-bottom: 1rem;">😕</span>
            <h3>Oups !</h3>
            <p>${message}</p>
            <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; cursor: pointer;">Réessayer</button>
        </div>
    `;
    $("#weather-result").html(errorHTML);
    $('body').removeClass().addClass('bg-default'); // Reset bg
}

function fetchWeather(query) {
  let urlCurrent = "";
  let urlForecast = "";
  
  // Save/Update unit UI
  updateUnitUI();

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
    
    // On injecte le bloc Qualité de l'Air dans la carte principale (ou juste après)
    // Ici, on va l'ajouter dynamiquement dans la grille de détails existante
    const airHtml = `
        <div class="detail-item">
            <span>🍃 Qualité Air</span>
            <strong style="color:${info.color}">${info.text}</strong>
        </div>
    `;
    
    $(".weather-details-grid").append(airHtml);
}

function updateBackground(condition) {
    const $card = $('.weather-card');
    
    // Reset classes
    const classes = 'bg-clear bg-clouds bg-rain bg-snow bg-storm bg-mist bg-default';
    $card.removeClass(classes);
    
    let themeClass = 'bg-default';
    const cond = condition.toLowerCase();

    if (cond === 'clear') {
        themeClass = 'bg-clear';
    } else if (cond.includes('clouds')) {
        themeClass = 'bg-clouds';
    } else if (cond.includes('rain') || cond.includes('drizzle')) {
        themeClass = 'bg-rain';
    } else if (cond.includes('thunderstorm')) {
        themeClass = 'bg-storm';
    } else if (cond.includes('snow')) {
        themeClass = 'bg-snow';
    } else if (['mist', 'fog', 'haze', 'smoke'].includes(cond)) {
        themeClass = 'bg-mist';
    }

    $card.addClass(themeClass);
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
    
    // Auto Theme Logic (if overrides manual control desire, but request said "adapte à l'heure")
    if (localStorage.getItem("theme") !== "light" && localStorage.getItem("theme") !== "dark") {
        // Only if user hasn't manually set a preference? Or force it?
        // Let's force update body class but not overwrite localStorage to respect manual toggle if used later
        if(isNight) $("body").addClass("dark"); 
        else $("body").removeClass("dark");
    } else {
        // Respect manual - but maybe add visual indicator?
        // For now, let's implement the prompt strict requirement: "Mode sombre qui s'adapte à l'heure"
        // We will make it so that if it's night, we enable dark mode unless user forced light.
        // Actually, best UX is: when weather loads, if user hasn't interacted with theme toggle yet (default), adapt.
    }
    
    // Simplification for the task: Update Theme Icon based on current state (caused by manual or auto)
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
    // 1. Chart Data (Mixed: Line Temp + Bar Rain)
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
                        suggestedMax: 10, // Scale rain bars reasonably
                        grid: { display: false }
                    }
                }
            }
        });
    }

    // 2. Daily Forecast (Processing Min/Max)
    // Group by Day
    const dailyGroups = {};
    data.list.forEach(item => {
        const day = new Date(item.dt * 1000).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
        if (!dailyGroups[day]) {
            dailyGroups[day] = { temps: [], icons: [], descs: [] };
        }
        dailyGroups[day].temps.push(item.main.temp);
        // Prefer midday icon/desc if available, else take first
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

// --- Historique ---
function addToHistory(city) {
    let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
    // Eviter doublons et garder max 5
    history = history.filter(c => c.toLowerCase() !== city.toLowerCase());
    history.unshift(city);
    if(history.length > 5) history.pop();
    
    localStorage.setItem("weatherHistory", JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
    if(history.length === 0) {
        $('#weather-history').hide();
        return;
    }
    
    let html = '';
    history.forEach(city => {
        html += `<span class="history-tag" onclick="fetchWeather('${city}')">${city}</span>`;
    });
    
    $('#history-tags').html(html);
    $('#weather-history').fadeIn();
}

// --- Events Météo ---
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

// --- Panorama ---
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

// --- Montagne & Ski ---
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

// --- Carte Interactive (Leaflet) ---
let mapInstance = null;

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

// --- Comparateur ---
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
    // const humwinner = d1.main.humidity < d2.main.humidity ? 1 : 2; // Less humidity is "better"? Subjective.

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

/* --- UI Helpers (Favorites, Share, Toggles) --- */
function updateUnitUI() {
    const $toggle = $('#unit-toggle');
    const $options = $toggle.find('.unit-option');
    
    // Update container attr
    $toggle.attr('data-unit', currentUnit);
    
    // Update text classes
    $options.removeClass('active');
    $toggle.find(`[data-val="${currentUnit}"]`).addClass('active');
}

// Event Delegation for Unit Toggle
$(document).on('click', '#unit-toggle', function() {
    currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
    localStorage.setItem('weatherUnit', currentUnit);
    updateUnitUI();
    
    // Reload search if possible
    const lastCity = localStorage.getItem("lastCity");
    if(lastCity) fetchWeather(lastCity);
});

// Event Delegation for Favorites
$(document).on('click', '#btn-fav', function() {
    const city = $(this).data('city');
    let favorites = JSON.parse(localStorage.getItem('weatherFavs') || '[]');
    
    if(favorites.includes(city)) {
        favorites = favorites.filter(c => c !== city);
        $(this).removeClass('active');
        alert(`${city} retiré des favoris.`);
    } else {
        favorites.push(city);
        $(this).addClass('active');
        alert(`${city} ajouté aux favoris !`);
    }
    
    // Save
    localStorage.setItem('weatherFavs', JSON.stringify(favorites));
    // If we have a history loader function (loadHistory), we could call it here to refresh tags if favorites are shown there
    if(typeof loadHistory === 'function') loadHistory();
});

// Event Delegation for Share
$(document).on('click', '#btn-share', function() {
    const title = document.title;
    const city = localStorage.getItem('lastCity') || "ma ville";
    const text = `Regarde la météo à ${city} !`;
    const url = window.location.href;

    if (navigator.share) {
        navigator.share({
            title: title,
            text: text,
            url: url,
        }).catch(err => console.log('Share failed', err));
    } else {
        // Fallback
        alert("Copier le lien pour partager: " + url);
    }
});

/* --- Favorites Page Logic --- */
function loadFavoritesPage() {
    const favorites = JSON.parse(localStorage.getItem('weatherFavs') || '[]');
    const $grid = $('#favorites-grid');
    const $empty = $('#fav-empty-state');
    
    if (favorites.length === 0) {
        $grid.hide();
        $empty.fadeIn();
        return;
    }
    
    $grid.html('<div class="loading">Chargement des favoris...</div>').show();
    $empty.hide();
    
    // Create an array of promises to fetch all weather data
    const promises = favorites.map(city => {
        return $.getJSON(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${currentUnit}&lang=fr&appid=${WEATHER_API_KEY}`)
            .catch(err => null); // Return null on error to not break Promise.all
    });
    
    Promise.all(promises).then(results => {
        $grid.empty();
        
        results.forEach((data, index) => {
            if (!data) return; // Skip failed requests
            
            const city = data.name;
            const temp = Math.round(data.main.temp);
            const icon = data.weather[0].icon;
            const desc = data.weather[0].description;
            const unit = getUnitLabel();
            
            const cardHtml = `
                <div class="fav-card animate-pop">
                    <div class="fav-card-header">
                        <h3>${city}</h3>
                        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="icon" width="50">
                    </div>
                    
                    <div class="fav-temp">
                        ${temp}${unit}
                    </div>
                    <p class="fav-desc">${desc.charAt(0).toUpperCase() + desc.slice(1)}</p>
                    
                    <div class="fav-footer">
                        <button class="fav-btn fav-btn-view" onclick="viewFavorite('${city.replace(/'/g, "\\'")}')">Voir détails</button>
                        <button class="fav-btn fav-btn-remove" onclick="removeFavorite('${city.replace(/'/g, "\\'")}')">Supprimer</button>
                    </div>
                </div>
            `;
            $grid.append(cardHtml);
        });
    });
}

function viewFavorite(city) {
    // Switch to meteo tab
    $(".sidebar li[data-channel='meteo']").click();
    // wait for fadeOut/in
    setTimeout(() => {
        $("#weather-input").val(city);
        fetchWeather(city);
    }, 400); 
}

function removeFavorite(city) {
    if(!confirm(`Retirer ${city} des favoris ?`)) return;
    
    let favorites = JSON.parse(localStorage.getItem('weatherFavs') || '[]');
    favorites = favorites.filter(c => c !== city);
    localStorage.setItem('weatherFavs', JSON.stringify(favorites));
    
    loadFavoritesPage(); // Reload current page
}

