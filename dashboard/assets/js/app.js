// Initialization
$(document).ready(function () {
    // 1. Navigation Logic (Switch Logic)
    function switchChannel(channelName) {
        // UI Tabs
        $(".sidebar li").removeClass("active");
        $(`.sidebar li[data-channel="${channelName}"]`).addClass("active");

        // View Visibility
        $(".view-section").addClass("hidden");
        $(`#view-${channelName}`).removeClass("hidden");

        // Background Logic
        if(channelName !== 'meteo') {
            $('body').removeClass().addClass('bg-default');
            if(localStorage.getItem('theme') === 'dark') $('body').addClass('dark');
        }

        // Module Lazy Initialization / Refreshes
        switch (channelName) {
            case "home":
                loadPanorama();
                break;
            case "mountain":
                loadMountains();
                break;
            case "meteo":
                // Restore search context or focus
                const lastCity = localStorage.getItem("lastCity");
                const lastCityName = localStorage.getItem("lastCityName");
                updateUnitUI();
                // If the user already searched, the DOM is still there, no need to refetch unless empty
                // We check if result is empty ("Recherchez une ville...")
                if (lastCity && $("#weather-result p").text().includes("Recherchez")) {
                   $("#weather-input").val(lastCityName || lastCity);
                   fetchWeather(lastCity, lastCityName);
                }
                break;
            case "favorites":
                loadFavoritesPage();
                break;
            case "map":
                // Leaflet needs to know it has become visible to resize tiles
                setTimeout(() => {
                    if(mapInstance) mapInstance.invalidateSize();
                    else initMap();
                }, 100);
                break;
            case "settings":
                if(window.deferredPrompt) {
                     $('#btn-pwa-install').show();
                }
                break;
            case "docs":
                loadDashboardDocs();
                break;
        }
    }

    function loadDashboardDocs() {
        const docs = [
            { title: "Service Worker (PWA)", path: "fiches-techniques/pwa-service-worker.md" },
            { title: "Architecture SPA", path: "fiches-techniques/architecture.md" },
            { title: "Intégration Leaflet", path: "fiches-techniques/interactivite-carte.md" },
            { title: "API Météo & Clés", path: "fiches-techniques/api-externe.md" },
            { title: "Persistance Données", path: "fiches-techniques/persistance-donnee.md" },
            { title: "Manipulation DOM (Refactor)", path: "fiches-techniques/manipulation-DOM.md" }
        ];

        const list = $('#docs-list');
        if(list.children().length === 0) {
            docs.forEach(doc => {
                const btn = $(`<button class="doc-btn" style="
                    display:block; 
                    width:100%; 
                    text-align:left; 
                    padding:10px; 
                    margin-bottom:5px; 
                    border:1px solid #ddd; 
                    background:#f8fafc;
                    cursor:pointer;
                    border-radius:4px;
                ">${doc.title}</button>`);
                
                btn.on('click', async () => {
                    try {
                        const response = await fetch(doc.path);
                        if(!response.ok) throw new Error("Fiche introuvable");
                        const text = await response.text();
                        $('#markdown-viewer').html(marked.parse(text));
                        // Highlight active
                        $('.doc-btn').css('background', '#f8fafc').css('font-weight', 'normal');
                        btn.css('background', '#e0f2fe').css('font-weight', 'bold');
                    } catch(e) {
                         $('#markdown-viewer').html(`<p style="color:red">Erreur : ${e.message}</p>`);
                    }
                });
                
                list.append(btn);
            });
            // Click first one
            $('.doc-btn').first().click();
        }
    }

    $(".sidebar li").on("click", function () {
        const channel = $(this).data("channel");
        $("#channel-title").text($(this).text().substring(2));
        switchChannel(channel);

        // Close mobile sidebar on navigation
        $('#sidebar').removeClass('open');
        $('#sidebar-overlay').removeClass('active');
    });

    // Burger menu toggle
    $('#burger-toggle').on('click', function () {
        $('#sidebar').toggleClass('open');
        $('#sidebar-overlay').toggleClass('active');
    });

    // Close sidebar when clicking overlay
    $('#sidebar-overlay').on('click', function () {
        $('#sidebar').removeClass('open');
        $(this).removeClass('active');
    });

    // 2. Search Event (Delegated because why not, though DOM is static now so direct ID works too)
    $('#weather-form').on('submit', function(e) {
        e.preventDefault();
        let city = $('#weather-input').val();
        if(city.trim() !== "") {
            localStorage.removeItem("lastCityName");
            fetchWeather(city);
        }
    });

    // 3. Load Default Page
    switchChannel("home"); 

    // PWA & Notifications Logic
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('Service Worker Registered'))
            .catch(err => console.log('SW Registration Failed', err));
    }

    // Install Prompt
    window.deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        window.deferredPrompt = e;
    });

    // Settings Buttons Handlers
    // Since elements are now static in index.html, we can attach directly.
    
    // Install App
    $('#btn-pwa-install').on('click', async function() {
        if (window.deferredPrompt) {
            window.deferredPrompt.prompt();
            const { outcome } = await window.deferredPrompt.userChoice;
            console.log(`User response: ${outcome}`);
            window.deferredPrompt = null;
            $(this).hide();
        } else {
            alert('L\'installation n\'est pas disponible.');
        }
    });

    // Notifications
    $('#btn-notifications').on('click', function() {
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

    // Reset App
    $('#btn-reset-app').on('click', function() {
        if(confirm("Voulez-vous vraiment tout réinitialiser ?")) {
            localStorage.clear();
            location.reload();
        }
    });
    
    // Theme Toggle (Settings Panel)
    $('#btn-theme-toggle').on('click', function() {
        // This button in settings panel just triggers the same logic as the header button
        const isDark = $('body').hasClass('dark');
        if(isDark) {
            $('body').removeClass('dark');
            localStorage.setItem('theme', 'light');
            $('#theme-toggle').text('🌙');
        } else {
            $('body').addClass('dark');
            localStorage.setItem('theme', 'dark');
            $('#theme-toggle').text('☀️');
        }
    });
});

