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
            <li>📢 Participer aux discussions régionales</li>
            <li>📊 Explorer des statistiques liées à l’activité</li>
            </ul>

            <p>
            Pour commencer, rendez-vous dans le salon
            <strong>🌤 Météo</strong>.
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
        <section class="forum">
            <div class="forum-header">
                <h2>📢 Topics Régionaux</h2>
                <div class="forum-controls">
                    <select id="region-filter" class="form-select">
                        <option value="all">🌍 Toutes les régions</option>
                        <option value="idf">🗼 Île-de-France</option>
                        <option value="paca">☀️ PACA</option>
                        <option value="bretagne">🌧️ Bretagne</option>
                        <option value="nord">🍺 Hauts-de-France</option>
                    </select>
                    <button id="btn-new-topic" class="btn-primary">➕ Nouveau Sujet</button>
                </div>
            </div>

            <!-- Formulaire de création (masqué par défaut) -->
            <form id="topic-form" class="topic__form" style="display:none;">
                <h3>Nouveau sujet de discussion</h3>
                <div class="form-group">
                    <input type="text" id="topic-title" placeholder="Titre de votre sujet..." required>
                </div>
                <div class="form-group row">
                    <select id="topic-region" required>
                        <option value="" disabled selected>Choisir une région...</option>
                        <option value="idf">Île-de-France</option>
                        <option value="paca">PACA</option>
                        <option value="bretagne">Bretagne</option>
                        <option value="nord">Hauts-de-France</option>
                    </select>
                    <input type="text" id="topic-author" placeholder="Votre pseudo" required>
                </div>
                <textarea id="topic-content" placeholder="Racontez-nous ce qui se passe..." rows="3" required></textarea>
                <div class="form-actions">
                    <button type="button" id="btn-cancel-topic" class="btn-text">Annuler</button>
                    <button type="submit" class="btn-primary">Publier</button>
                </div>
            </form>

            <div id="topics-list" class="forum__list">
                <!-- Les topics s'afficheront ici -->
            </div>
        </section>
    `,
    stats: `
        <section class="stats">
            <h2>Statistiques d'activité</h2>
            <div class="stats__container">
                <canvas id="activityChart"></canvas>
            </div>
            <div class="stats__info">
                <p><strong>Total Topics :</strong> <span id="total-messages">0</span></p>
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

  // --- Gestion du Forum (Topics) ---

  const defaultTopics = [
    { title: "⚠️ Alerte Orages violents sur les Bouches-du-Rhône", region: "paca", author: "MétéoSud", content: "Vigilance orange déclarée pour ce soir. Grêle possible. Mettez vos voitures à l'abri !", upvotes: 156 },
    { title: "Grand soleil à Lille, c'est un miracle !", region: "nord", author: "ChtiDu59", content: "J'ai vu une boule jaune dans le ciel, quelqu'un sait ce que c'est ? Profitez-en pour les barbecues !", upvotes: 42 },
    { title: "Crue de la Seine : les voies sur berges fermées ?", region: "idf", author: "ParisienStressé", content: "Je dois rentrer en vélib ce soir, ça passe ou c'est mort au niveau des Tuileries ?", upvotes: 18 },
    { title: "Photos de la tempête sur la côte de Granit Rose 🌊", region: "bretagne", author: "BreizhPhoto", content: "Les vagues étaient impressionnantes ce matin à Ploumanac'h. Voir le lien en commentaire.", upvotes: 89 },
    { title: "Chaleur insupportable dans le RER B", region: "idf", author: "MetroBoulotDodo", content: "35 degrés dehors, 45 dedans. Courage à ceux qui rentrent du taf.", upvotes: 312 },
    { title: "Le Mistral souffle à 110km/h !", region: "paca", author: "VentDuSud", content: "Attention aux chutes de branches, ça décoiffe sévère aujourd'hui vers Avignon.", upvotes: 24 },
    { title: "Brouillard épais ce matin sur l'A1", region: "nord", author: "RouteInfo", content: "Visibilité réduite à 50m. Levez le pied.", upvotes: 15 },
    { title: "Quelqu'un a un bon spot pour voir le coucher de soleil ?", region: "bretagne", author: "TouristeCurieux", content: "Je suis vers Saint-Malo pour le week-end.", upvotes: 7 }
  ];

  function loadTopics(filter = "all") {
    let topics = JSON.parse(localStorage.getItem("forumTopics"));
    
    // Init with mock data if empty
    if (!topics || topics.length === 0) {
        topics = defaultTopics;
        localStorage.setItem("forumTopics", JSON.stringify(topics));
    }

    const container = $("#topics-list");
    container.empty();

    const filteredTopics = filter === "all" ? topics : topics.filter(t => t.region === filter);

    if (filteredTopics.length === 0) {
        container.html(`<div class="empty-state"><p>Aucun sujet pour cette région.</p></div>`);
        return;
    }

    filteredTopics.forEach((topic) => {
      const regionLabels = { idf: "Île-de-France", paca: "PACA", bretagne: "Bretagne", nord: "Hauts-de-France" };
      const regionName = regionLabels[topic.region] || topic.region;
      
      const html = `
        <div class="topic-card">
            <div class="topic-votes">
                <button class="vote-btn up">▲</button>
                <span class="vote-count">${topic.upvotes || 0}</span>
                <button class="vote-btn down">▼</button>
            </div>
            <div class="topic-content">
                <div class="topic-meta">
                    <span class="region-tag region-${topic.region}">${regionName}</span>
                    <span class="author">posté par u/${topic.author}</span>
                </div>
                <h3 class="topic-title">${topic.title}</h3>
                <p class="topic-text">${topic.content}</p>
                <div class="topic-footer">
                    <button class="btn-action">💬 Commenter</button>
                    <button class="btn-action">🔗 Partager</button>
                </div>
            </div>
        </div>
      `;
      container.prepend(html); // Newest first
    });
  }

  // Events Forum inside ready
  $(document).on('click', '#btn-new-topic', function() {
      $('#topic-form').slideDown();
      $(this).hide();
  });

  $(document).on('click', '#btn-cancel-topic', function() {
      $('#topic-form').slideUp();
      $('#btn-new-topic').fadeIn();
  });

  $(document).on('change', '#region-filter', function() {
      loadTopics($(this).val());
  });

  $(document).on('submit', '#topic-form', function(e) {
      e.preventDefault();
      
      const newTopic = {
          title: $('#topic-title').val().trim(),
          region: $('#topic-region').val(),
          author: $('#topic-author').val().trim(),
          content: $('#topic-content').val().trim(),
          upvotes: 0
      };

      if(!newTopic.title || !newTopic.region) return;

      const topics = JSON.parse(localStorage.getItem("forumTopics")) || [];
      topics.push(newTopic);
      localStorage.setItem("forumTopics", JSON.stringify(topics));

      loadTopics($('#region-filter').val()); // Refresh list
      
      // Reset & hide form
      this.reset();
      $('#topic-form').slideUp();
      $('#btn-new-topic').fadeIn();
  });

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
            loadTopics();
          }

          if (channelKey === "meteo") {
            const savedLocation = localStorage.getItem("weatherLocation");
            if (savedLocation) {
                fetchWeather(savedLocation);
            }
          }

          if (channelKey === "stats") {
            initStatsChart();
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

function initStatsChart() {
  const ctx = document.getElementById('activityChart');
  if (!ctx) return;

  // Récupérer le nombre de topics réel
  const topics = JSON.parse(localStorage.getItem('forumTopics')) || [];
  $('#total-messages').text(topics.length);

  // Détruire l'ancien graphique s'il existe pour éviter les conflits
  if (currentChart) {
    currentChart.destroy();
  }

  // Création du graphique Chart.js
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
        label: 'Topics créés',
        data: [2, 5, 1, 8, 4, 0, topics.length], 
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
