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
      <p>Comparez la météo de 2 à 4 villes simultanément.</p>
      
      <div class="comparison-inputs">
          <input type="text" class="comp-input" placeholder="Ville 1 (ex: Paris)">
          <input type="text" class="comp-input" placeholder="Ville 2 (ex: Londres)">
          <input type="text" class="comp-input" placeholder="Ville 3 (Optionnel)">
          <input type="text" class="comp-input" placeholder="Ville 4 (Optionnel)">
          <button onclick="compareCities()">Comparer</button>
      </div>

      <div id="compare-loader" style="display:none; text-align:center; padding:2rem;">
        <div class="loader-spinner"></div>
      </div>

      <div id="compare-result" class="comparison-container" style="display:none;">
         <div id="compare-cards" class="comparison-cards-grid"></div>
         
         <div class="comparison-charts-section animate-pop" style="animation-delay: 0.2s; margin-top:2rem;">
            <h3>📊 Analyse Comparée</h3>
            <div style="height:300px; margin-bottom: 2rem;">
                <canvas id="compareTempChart"></canvas>
            </div>
            
            <h3>📋 Tableau Détaillé</h3>
            <div class="table-container">
                <table id="compare-table" class="compare-table">
                    <thead>
                        <tr id="table-head">
                            <th>Donnée</th>
                            <!-- Cities headers injected here -->
                        </tr>
                    </thead>
                    <tbody id="table-body">
                        <!-- Rows injected here -->
                    </tbody>
                </table>
            </div>
         </div>
      </div>
    `, 
    settings: `
      <h2>Paramètres</h2>
      <div class="settings-panel topic__form">
          <div class="form-group">
              <label>Thème de l'application</label>
              <button id="btn-theme-toggle" style="margin-top:0.5rem; display:block;">Changer le thème (Clair/Sombre)</button>
          </div>
          
          <div class="form-group" style="margin-top:2rem;">
              <label>Notifications & PWA</label>
              <button id="btn-pwa-install" style="margin-top:0.5rem; display:none; background:#22c55e; border:none; color:white;">📲 Installer l'application</button>
              <button id="btn-notifications" style="margin-top:0.5rem; display:block; background:#3b82f6; border:none; color:white;">🔔 Activer les notifications</button>
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
        const lastCityName = localStorage.getItem("lastCityName");

        updateUnitUI(); // Restore toggle state
        
        if (lastCity) {
            $("#weather-input").val(lastCityName || lastCity); // Show nice name in input if available
            fetchWeather(lastCity, lastCityName); 
            // We keep lastCityName in localStorage until a new search overwrites context
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

    // 2. Search Event
    $(document).on('submit', '#weather-form', function(e) {
        e.preventDefault();
        let city = $('#weather-input').val();
        if(city.trim() !== "") {
            localStorage.removeItem("lastCityName");
            fetchWeather(city);
        }
    });

    // 3. Load Default Page
    loadChannel("home"); 

    // PWA & Notifications Logic
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('Service Worker Registered'))
            .catch(err => console.log('SW Registration Failed', err));
    }

    // Install Prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        // Show install button when available (checking periodically or when navigating to settings)
        // Since button is in dynamic HTML (settings page), we might need to check visibility often or just global event
    });

    // Delegation for dynamic settings button
    $(document).on('click', '#btn-pwa-install', async function() {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            deferredPrompt = null;
            $(this).hide();
        } else {
            alert('L\'installation n\'est pas disponible pour le moment (déjà installé ou non supporté).');
        }
    });

    // Handle button visibility when settings loaded
    // We hook into loadChannel to check if we are on settings page.
    // However, simplest is just: if deferredPrompt exists, show button when it appears.
    // For now, let's keep it simple: button is hidden by default in HTML template.
    // If user goes to settings, we might need to "show" it if deferredPrompt is != null.
    // Let's modify loadChannel globally or just use a small interval or MutationObserver? 
    // Easier: Add a check in the click handler for "settings" nav? No, "loadChannel" handles it.
    
    // We'll update the global click listener
    const originalLoadChannel = loadChannel;
    loadChannel = function(name) {
        originalLoadChannel(name); // Call original
        if(name === 'settings' && deferredPrompt) {
            setTimeout(() => $('#btn-pwa-install').show(), 100);
        }
    };

    // Notifications Request
    $(document).on('click', '#btn-notifications', function() {
        if (!("Notification" in window)) {
            alert("Ce navigateur ne supporte pas les notifications desktop");
        } else if (Notification.permission === "granted") {
            new Notification("Notifications déjà actives ! 🌤️");
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(function (permission) {
                if (permission === "granted") {
                    new Notification("Merci ! Vous recevrez des alertes météo majeures. ⚡");
                }
            });
        }
    });
});

