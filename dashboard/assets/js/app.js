// HTML Templates for Pages
const pages = {
    home: `
      <h2>Vue d'ensemble</h2>
      <p>Aperçu rapide de la météo dans les grandes villes suisses.</p>
      <div id="panorama-container" class="panorama-grid"></div>
    `,
    meteo: `
      <h2>Météo Détaillée</h2>
      <div class="weather__controls">
          <form id="weather-form" class="weather__form">
              <input type="text" id="weather-input" placeholder="Entrez une ville..." required />
              <button type="submit">Rechercher</button>
          </form>
          <button id="btn-geo" class="btn-secondary" title="Ma position">📍</button>
          
          <div class="unit-toggle-container" id="unit-toggle" data-unit="metric" title="Changer d'unité">
              <div class="toggle-pill"></div>
              <div class="unit-option active" data-val="metric">°C</div>
              <div class="unit-option" data-val="imperial">°F</div>
          </div>
      </div>
      
      <div id="weather-result" class="weather__result">
          <p>Recherchez une ville pour afficher la météo.</p>
      </div>
    `,
    favorites: `
      <h2>Mes Villes Favorites</h2>
      <div id="fav-empty-state" style="text-align:center; padding: 3rem; color: #64748b;">
          <span style="font-size: 3rem;">⭐</span>
          <p>Aucun favori pour le moment.<br>Ajoutez des villes depuis l'onglet recherche !</p>
      </div>
      <div id="favorites-grid" class="favorites-grid"></div>
    `,
    mountain: `
      <h2>Météo des Montagnes / Ski 🎿</h2>
      <p>Conditions actuelles dans les stations les plus populaires.</p>
      <div id="mountain-container"></div>
    `,
    map: `
      <h2>Carte Météo Interactive</h2>
      <p>Températures en direct.</p>
      <div id="map"></div>
    `,
    compare: `
      <h2>Comparateur de Villes</h2>
      <div class="comparison-inputs">
          <input type="text" id="city1" placeholder="Ville 1 (ex: Paris)">
          <input type="text" id="city2" placeholder="Ville 2 (ex: Londres)">
          <button onclick="compareCities()">Comparer</button>
      </div>
      <div id="compare-result" class="comparison-grid"></div>
    `, 
    settings: `
      <h2>Paramètres</h2>
      <div class="settings-panel topic__form">
          <div class="form-group">
              <label>Thème de l'application</label>
              <button id="btn-theme-toggle" style="margin-top:0.5rem; display:block;">Changer le thème (Clair/Sombre)</button>
          </div>
          <div class="form-group" style="margin-top:2rem; border-top:1px solid #e2e8f0; padding-top:1rem;">
              <label style="color:#ef4444;">Zone de danger</label>
              <button id="btn-reset-app" style="background:#fee2e2; color:#ef4444; border:1px solid #ef4444; margin-top:0.5rem; display:block;">Réinitialiser l'application</button>
              <small style="color:#ef4444;">Efface les favoris, l'historique et les préférences (sauf le thème).</small>
          </div>
      </div>
    `
};

// Route Handler
function loadChannel(channelName) {
    $(".sidebar li").removeClass("active");
    $(`.sidebar li[data-channel="${channelName}"]`).addClass("active");

    const content = pages[channelName] || "<h2>Page non trouvée</h2>";
    $(".content").html(content);
    
    // Reset background to default if not strict meteo page logic (which handles it itself)
    if(channelName !== 'meteo') {
        $('body').removeClass().addClass('bg-default');
        if(localStorage.getItem('theme') === 'dark') $('body').addClass('dark');
    }

    // Module Initialization
    if (channelName === "home") loadPanorama();
    if (channelName === "mountain") loadMountains();
    if (channelName === "meteo") {
        const lastCity = localStorage.getItem("lastCity");
        updateUnitUI(); // Restore toggle state
        
        if (lastCity) {
            $("#weather-input").val(lastCity);
            fetchWeather(lastCity);
        }
    }
    if (channelName === "favorites") loadFavoritesPage();
    if (channelName === "map") setTimeout(initMap, 100); 
}

// Initialization
$(document).ready(function () {
    // 1. Navigation Click
    $(".sidebar li").on("click", function () {
        const channel = $(this).data("channel");
        $("#channel-title").text($(this).text().substring(2)); // Remove emoji
        loadChannel(channel);
    });

    // 2. Load Default Page
    loadChannel("home"); 
});

