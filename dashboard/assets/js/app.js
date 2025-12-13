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

            <div id="messages" class="chat__messages">
            <p class="chat__message">👋 Bienvenue dans le salon de discussion</p>
            </div>

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
    $(".content").html(channels[channelKey]);
  });
});

// Gestion du chat (délégation d'événement)
$(document).on("submit", "#chat-form", function (e) {
  e.preventDefault();

  const message = $("#chat-input").val().trim();

  if (message === "") return;

  $("#messages").append(
    `<p class="chat__message">🧑 ${message}</p>`
  );

  $("#chat-input").val("");
});

