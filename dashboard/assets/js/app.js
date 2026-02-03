// Variable globale pour stocker l'instance du graphique
let currentChart = null;

$(document).ready(function () {
  // Contenu des salons (simulé)
  const channels = {
    home: `
        <section class="home">
            <h2>Bienvenue dans le salon Météo 🌤</h2>

            <p>
            Ce dashboard est un espace d’échange et d’information
            autour de la météo.
            </p>

            <p>
            Vous pouvez :
            </p>

            <ul>
            <li>🌍 Consulter la météo en temps réel pour une localisation précise</li>
            <li>💬 Discuter des conditions météo chez vous</li>
            <li>📊 Explorer des statistiques liées à l’activité</li>
            </ul>

            <p>
            Pour commencer, rendez-vous dans le salon
            <strong>🌤 Météo</strong> et entrez une ville ou un code postal.
            </p>
        </section>
    `,
    meteo: `
        <section class="weather">
            <h2>Météo des territoires</h2>
            
            <div class="weather__controls">
                <button id="btn-geo" class="btn-secondary">📍 Ma position</button>
                <span class="separator">ou</span>
                <form id="weather-form" class="weather__form">
                    <input
                        type="text"
                        id="weather-input"
                        placeholder="Chercher une ville..."
                        required
                    >
                    <button type="submit">🔍</button>
                </form>
            </div>

            <div id="weather-result" class="weather__result">
                <div class="empty-state">
                    <span style="font-size: 3rem">🌍</span>
                    <p>Sélectionnez une zone pour voir les conditions.</p>
                </div>
            </div>
        </section>
    `,
    chat: `
        <section class="chat">
            <h2>Discussions</h2>

            <div id="messages" class="chat__messages"></div>

            <form id="chat-form" class="chat__form">
            <input
                type="text"
                id="chat-input"
                placeholder="Écrire un message..."
                required
            >
            <button type="submit">Envoyer</button>
            </form>
        </section>
    `,
    stats: `
        <section class="stats">
            <h2>Statistiques d'activité</h2>
            <div class="stats__container">
                <canvas id="activityChart"></canvas>
            </div>
            <div class="stats__info">
                <p><strong>Total Messages :</strong> <span id="total-messages">0</span></p>
                <p><strong>Utilisateurs actifs :</strong> 12</p>
            </div>
        </section>
    `,
    settings: `
        <section>
            <h2>Paramètres</h2>
            <p>Options de personnalisation à venir.</p>
        </section>
    `,
  };

  function loadMessages() {
    const storedMessages =
      JSON.parse(localStorage.getItem("chatMessages")) || [];
    $("#messages").empty();

    storedMessages.forEach((message) => {
      $("#messages").append(`<p class="chat__message">🧑 ${message}</p>`);
    });
  }

  // Clic sur un salon
  $(".sidebar li").on("click", function () {
    const channelKey = $(this).data("channel");
    const channelTitle = $(this).text();

    $(".sidebar li").removeClass("active");
    $(this).addClass("active");

    $("#channel-title").text(channelTitle);

    $(".content").fadeOut(150, function () {
      $(this)
        .html(channels[channelKey])
        .fadeIn(200, function () {
          if (channelKey === "chat") {
            loadMessages();
          }

          if (channelKey === "meteo") {
            const savedLocation = localStorage.getItem("weatherLocation");
            if (savedLocation) {

          if (channelKey === "stats") {
            initStatsChart();
          }
              fetchWeather(savedLocation);
            }
          }
        });
    });
  });

  // ----- Dark mode -----

  // Appliquer le thème au chargement
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    $("body").addClass("dark");
    $("#theme-toggle").text("☀️");
    // Update chart if exists when theme loads (rare case)
  }

  // Toggle thème
  $("#theme-toggle").on("click", function () {
    $("body").toggleClass("dark");
    const isDark = $("body").hasClass("dark");

    if (isDark) {
      localStorage.setItem("theme", "dark");
      $(this).text("☀️");
    } else {
      localStorage.setItem("theme", "light");
      $(this).text("🌙");
    }
    
    // Refresh chart to update colors if we are on stats page
    if (typeof currentChart !== 'undefined' && currentChart) {
         // Simple re-render logic if active
         if($('.sidebar li[data-channel="stats"]').hasClass('active')){
             initStatsChart();
         }
    }
  });

  // Chargement initial : salon Accueil
  $(".content").html(channels.home);
  $("#channel-title").text("Accueil");

  // État actif dans la sidebar
  $(".sidebar li").removeClass("active");
  $('.sidebar li[data-channel="home"]').addClass("active");
});

// Gestion de la météo
const WEATHER_API_KEY = "8bf9317dd25811ccc3ea56a0309ffc5a";

function fetchWeather(query) {
  // Query peut être une ville (string) ou des coords ({lat, lon})
  let url = "";
  if (typeof query === "object" && query.lat) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${query.lat}&lon=${query.lon}&units=metric&lang=fr&appid=${WEATHER_API_KEY}`;
  } else {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&units=metric&lang=fr&appid=${WEATHER_API_KEY}`;
  }

  $("#weather-result").html("<div class='loading'>⏳ Analyse des données atmosphériques...</div>");

  $.getJSON(url)
    .done(function (data) {
      renderWeather(data);
      // Sauvegarde simple : si c'est une string (ville), on gère simple, sinon on pourra gérer plus tard
      if (typeof query === "string") localStorage.setItem("weatherLocation", query);
    })
    .fail(function () {
      $("#weather-result").html("<div class='error'>❌ Zone non trouvée. Essayez une ville majeure.</div>");
    });
}

function renderWeather(data) {
    const city = data.name;
    const temp = Math.round(data.main.temp);
    const desc = data.weather[0].description;
    const icon = data.weather[0].icon;
    const humidity = data.main.humidity;
    const wind = Math.round(data.wind.speed * 3.6); // conversion m/s -> km/h

    $("#weather-result").html(`
      <div class="weather-card">
        <div class="weather-header">
            <h3>${city} <span class="country-badge">${data.sys.country}</span></h3>
            <p class="weather-desc">${desc}</p>
        </div>
        
        <div class="weather-main">
            <div class="temp-box">
                <span class="temp">${temp}°</span>
                <img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="${desc}">
            </div>
            
            <div class="weather-stats">
                <div class="stat-item">
                    <span class="label">💧 Humidité</span>
                    <span class="value">${humidity}%</span>
                </div>
                <div class="stat-item">
                    <span class="label">💨 Vent</span>
                    <span class="value">${wind} km/h</span>
                </div>
            </div>
        </div>
      </div>
    `);
}

// Click Geolocation
$(document).on("click", "#btn-geo", function() {
    if (!navigator.geolocation) {
        alert("Géolocalisation non supportée par votre navigateur.");
        return;
    }
    
    $("#weather-result").html("<div class='loading'>📡 Localisation de votre zone...</div>");
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            fetchWeather({
                lat: position.coords.latitude,
                lon: position.coords.longitude
            });
        },
        (error) => {
            $("#weather-result").html("<div class='error'>❌ Impossible de vous localiser. Vérifiez vos permissions.</div>");
        }
    );
});

// Gestion de la météo (délégation d'événement)
$(document).on("submit", "#weather-form", function (e) {
  e.preventDefault();

  const location = $("#weather-input").val().trim();
  if (!location) return;

  fetchWeather(location);
});

// Gestion du chat (délégation d'événement)
$(document).on("submit", "#chat-form", function (e) {
  e.preventDefault();

  const input = $("#chat-input");
  const message = input.val().trim();

  if (message === "") return;

  const storedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];

  storedMessages.push(message);
  localStorage.setItem("chatMessages", JSON.stringify(storedMessages));

  const newMessage = $(`<p class="chat__message">🧑 ${message}</p>`).hide();

  $("#messages").append(newMessage);
  newMessage.fadeIn(150);

  input.val("");
});

function initStatsChart() {
  const ctx = document.getElementById('activityChart');
  if (!ctx) return;

  // Récupérer le nombre de messages réel
  const storedMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
  $('#total-messages').text(storedMessages.length);

  // D�truire l'ancien graphique s'il existe pour �viter les conflits
  if (currentChart) {
    currentChart.destroy();
  }

  // Cr�ation du graphique Chart.js
  currentChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: [{
        label: 'Visiteurs par jour',
        data: [12, 19, 3, 5, 2, 3, 10],
        backgroundColor: 'rgba(37, 99, 235, 0.6)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Messages envoy�s',
        data: [2, 5, 1, 8, 4, 0, storedMessages.length], // Int�gre les vraies donn�es pour 'Dim'
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: document.body.classList.contains('dark') ? '#334155' : '#e5e7eb'
          }
        },
        x: {
            grid: {
                color: document.body.classList.contains('dark') ? '#334155' : '#e5e7eb'
            }
        }
      },
      plugins: {
        legend: {
            labels: {
                color: document.body.classList.contains('dark') ? '#e5e7eb' : '#333'
            }
        }
      }
    }
  });
}
