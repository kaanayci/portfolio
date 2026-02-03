function loadFavoritesPage() {
    const favorites = JSON.parse(localStorage.getItem('weatherFavs') || '[]');
    const $grid = $('#favorites-grid');
    const $empty = $('#fav-empty-state');
    
    if (favorites.length === 0) {
        $grid.hide();
        $empty.fadeIn();
        return;
    }
    
    $grid.html('<div class="loading">Chargement des favoris...</div>').show();
    $empty.hide();
    
    // Create an array of promises to fetch all weather data
    const promises = favorites.map(city => {
        return $.getJSON(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${currentUnit}&lang=fr&appid=${WEATHER_API_KEY}`)
            .catch(err => null); // Return null on error to not break Promise.all
    });
    
    Promise.all(promises).then(results => {
        $grid.empty();
        
        results.forEach((data, index) => {
            if (!data) return; // Skip failed requests
            
            // Important: Use the stored name for deletion to ensure it matches localStorage exactly
            const storedName = favorites[index];
            const displayCity = data.name;
            const temp = Math.round(data.main.temp);
            const icon = data.weather[0].icon;
            const desc = data.weather[0].description;
            const unit = getUnitLabel();
            
            // Safe encoding for data attribute using the STORED name
            const safeCity = storedName.replace(/"/g, '&quot;');

            const cardHtml = `
                <div class="fav-card animate-pop">
                    <div class="fav-card-header">
                        <h3>${displayCity}</h3>
                        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="icon" width="50">
                    </div>
                    
                    <div class="fav-temp">
                        ${temp}${unit}
                    </div>
                    <p class="fav-desc">${desc.charAt(0).toUpperCase() + desc.slice(1)}</p>
                    
                    <div class="fav-footer">
                        <button class="fav-btn fav-btn-view action-view-fav" data-city="${safeCity}">Voir détails</button>
                        <button class="fav-btn fav-btn-remove action-remove-fav" data-city="${safeCity}">Supprimer</button>
                    </div>
                </div>
            `;
            $grid.append(cardHtml);
        });
    });
}

function viewFavorite(city) {
    // Switch to meteo tab
    $(".sidebar li[data-channel='meteo']").click();
    // wait for fadeOut/in
    setTimeout(() => {
        $("#weather-input").val(city);
        fetchWeather(city);
    }, 400); 
}

function removeFavorite(city) {
    console.log('Executing removeFavorite for:', city);
    if(!confirm(`Retirer ${city} des favoris ?`)) return;
    
    let favorites = JSON.parse(localStorage.getItem('weatherFavs') || '[]');
    console.log('Current favorites before delete:', favorites);
    
    favorites = favorites.filter(c => c !== city);
    console.log('New favorites list:', favorites);
    
    localStorage.setItem('weatherFavs', JSON.stringify(favorites));
    
    loadFavoritesPage(); // Reload current page
}

// Global Event Listeners for Favorites Page Actions
$(document).ready(function() {
    $(document).on('click', '.action-view-fav', function() {
        const city = $(this).data('city');
        viewFavorite(city);
    });

    $(document).on('click', '.action-remove-fav', function() {
        const city = $(this).attr('data-city'); // Use .attr() to ensure string format if .data() does magic type conversion
        console.log('🗑️ Delete requested for:', city);
        removeFavorite(city);
    });

    // Event Delegation for Favorites Toggle logic (The star button in weather view)
    $(document).on('click', '#btn-fav', function() {
        const city = $(this).data('city');
        let favorites = JSON.parse(localStorage.getItem('weatherFavs') || '[]');
        
        if(favorites.includes(city)) {
            favorites = favorites.filter(c => c !== city);
            $(this).removeClass('active');
            alert(`${city} retiré des favoris.`);
        } else {
            favorites.push(city);
            $(this).addClass('active');
            alert(`${city} ajouté aux favoris !`);
        }
        
        localStorage.setItem('weatherFavs', JSON.stringify(favorites));
    });
});
