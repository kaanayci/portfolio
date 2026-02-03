function getUnitLabel() {
    return currentUnit === 'metric' ? '°C' : '°F';
}

function getSpeedLabel() {
    return currentUnit === 'metric' ? 'km/h' : 'mph';
}

function updateUnitUI() {
    const $toggle = $('#unit-toggle');
    const $options = $toggle.find('.unit-option');
    
    // Update container attr
    $toggle.attr('data-unit', currentUnit);
    
    // Update text classes
    $options.removeClass('active');
    $toggle.find(`[data-val="${currentUnit}"]`).addClass('active');
}


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

// Functions removed: addToHistory, loadHistory


// Global Event Listeners for UI
$(document).ready(function() {
    $("#theme-toggle, #btn-theme-toggle").on("click", function () {
        const isDark = $("body").hasClass("dark");
        localStorage.setItem("theme", isDark ? "light" : "dark");
        applyTheme();
    });

    $(document).on('click', '#unit-toggle', function() {
        currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
        localStorage.setItem('weatherUnit', currentUnit);
        updateUnitUI();
        
        // Reload search if possible
        const lastCity = localStorage.getItem("lastCity");
        if(lastCity) fetchWeather(lastCity);
    });

    // Share
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
            alert("Copier le lien pour partager: " + url);
        }
    });

    // Reset
    $(document).on("click", "#btn-reset-app", function() {
        if(confirm("Effacer tout l'historique ?")) {
            localStorage.clear();
            location.reload();
        }
    });

    // Init Theme
    applyTheme();
});
