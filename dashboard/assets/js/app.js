$(document).ready(function () {
  // Contenu des salons (simulé)
  const channels = {
    meteo: `
      <section>
        <h2>Météo</h2>
        <p>Temps ensoleillé aujourd’hui ☀️</p>
        <p>Température : 18°C</p>
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

    // Gestion de l'état actif
    $(".sidebar li").removeClass("active");
    $(this).addClass("active");

    // Mise à jour du titre
    $("#channel-title").text(channelTitle);

    // Injection du contenu
    $(".content").fadeOut(150, function () {
      $(this)
        .html(channels[channelKey])
        .fadeIn(200, function () {
          // Charger les messages UNIQUEMENT après insertion du HTML
          if (channelKey === "chat") {
            loadMessages();
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
