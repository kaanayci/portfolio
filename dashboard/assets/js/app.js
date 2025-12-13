$(document).ready(function () {
  // Contenu des salons (simulé)
  const channels = {
    meteo: `
        <section class="weather">
            <h2>Météo en temps réel</h2>

            <form id="weather-form" class="weather__form">
            <input
                type="text"
                id="weather-input"
                placeholder="Ville ou code postal"
                required
            >
            <button type="submit">Rechercher</button>
            </form>

            <div id="weather-result" class="weather__result">
            <p>Entrez une localisation pour afficher la météo.</p>
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
        <section>
            <h2>Statistiques</h2>
            <ul>
            <li>Utilisateurs actifs : 12</li>
            <li>Messages envoyés : 48</li>
            <li>Salons disponibles : 4</li>
            </ul>
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
  }

  // Toggle thème
  $("#theme-toggle").on("click", function () {
    $("body").toggleClass("dark");

    if ($("body").hasClass("dark")) {
      localStorage.setItem("theme", "dark");
      $(this).text("☀️");
    } else {
      localStorage.setItem("theme", "light");
      $(this).text("🌙");
    }
  });
});

// Gestion de la météo
const WEATHER_API_KEY = "8bf9317dd25811ccc3ea56a0309ffc5a";

function fetchWeather(location) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&lang=fr&appid=${WEATHER_API_KEY}`;

  $("#weather-result").html("<p>⏳ Chargement...</p>");

  $.getJSON(url)
    .done(function (data) {
      const city = data.name;
      const temp = Math.round(data.main.temp);
      const desc = data.weather[0].description;
      const icon = data.weather[0].icon;

      $("#weather-result").html(`
        <h3>${city}</h3>
        <p>${desc}</p>
        <p>
          <strong>${temp}°C</strong>
          <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="">
        </p>
      `);

      localStorage.setItem("weatherLocation", location);
    })
    .fail(function () {
      $("#weather-result").html("<p>❌ Localisation invalide</p>");
    });
}
// Gestion de la météo (délégation d'événement)
$(document).on("submit", "#weather-form", function (e) {
  e.preventDefault();

  const location = $("#weather-input").val().trim();
  if (!location) return;

  fetchWeather(location);
  localStorage.setItem("weatherLocation", location);
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
