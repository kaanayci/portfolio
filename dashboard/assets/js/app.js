
$(document).ready(function () {
  // --- Contenu des pages ---
  const pages = {
    home: `
        <section class="home">
            <h2>Bienvenue sur SwissMétéo 🇨🇭</h2>

            <p>
            Une application simple et directe pour consulter la météo de vos régions préférées.
            </p>

            <div class="quick-actions">
                <p>Commencez dès maintenant :</p>
                <button class="btn-primary" onclick="$('.sidebar li[data-channel=\\'meteo\\']').click()">
                    🔎 Rechercher une ville
                </button>
            </div>
            
            <div style="margin-top: 2rem; opacity: 0.7; font-size: 0.9rem;">
                <p><em>"Il n'y a pas de mauvais temps, que des mauvais vêtements."</em></p>
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
            if (pageKey === "meteo") {
                loadHistory(); 
                const lastCity = localStorage.getItem("lastCity");
                if(lastCity) fetchWeather(lastCity);
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

function fetchWeather(query) {
  let url = "";
  if (typeof query === "object" && query.lat) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${query.lat}&lon=${query.lon}&units=metric&lang=fr&appid=${WEATHER_API_KEY}`;
  } else {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&units=metric&lang=fr&appid=${WEATHER_API_KEY}`;
  }

  $("#weather-result").html("<div class='loading'>⏳ Chargement...</div>");

  $.getJSON(url)
    .done(function (data) {
      renderWeather(data);
      if (typeof query === "string") {
          localStorage.setItem("lastCity", query);
          addToHistory(query);
      }
    })
    .fail(function () {
      $("#weather-result").html("<div class='error'>❌ Ville introuvable.</div>");
    });
}

function renderWeather(data) {
    const city = data.name;
    const country = data.sys.country;
    const temp = Math.round(data.main.temp);
    const desc = data.weather[0].description;
    const icon = data.weather[0].icon;
    const humidity = data.main.humidity;
    const wind = Math.round(data.wind.speed * 3.6);

    // Simplifié et élégant
    $("#weather-result").html(`
      <div class="weather-card animate-pop">
        <div class="weather-header">
            <h3>${city} ${country === 'CH' ? '🇨🇭' : country}</h3>
            <p class="weather-desc">${desc.charAt(0).toUpperCase() + desc.slice(1)}</p>
        </div>
        
        <div class="weather-main">
            <div class="temp-big">
                ${temp}°
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}">
            </div>
            
            <div class="weather-details">
                <div class="detail-pill">💧 ${humidity}%</div>
                <div class="detail-pill">💨 ${wind} km/h</div>
            </div>
        </div>
      </div>
    `);
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
