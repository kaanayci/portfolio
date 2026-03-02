# Manipulation du DOM avec jQuery

## Définition
La manipulation du DOM (Document Object Model) consiste à modifier dynamiquement le contenu, la structure et le style d’une page HTML en utilisant JavaScript. jQuery simplifie cette manipulation avec une syntaxe concise pour sélectionner des éléments, attacher des événements, et injecter du contenu sans écrire des appels verbeux à `document.getElementById()` ou `addEventListener()`.

## Contexte d’utilisation
La manipulation du DOM est nécessaire pour :
- Réagir aux interactions utilisateur (clics, input, etc.)
- Injecter du contenu HTML dynamique (cartes météo, listes, etc.)
- Changer les styles CSS en fonction de l’état de l’application
- Créer des animations et des transitions fluides
- Gérer le contenu des formulaires et des inputs

## Exemples de code

### 1) Sélecteurs jQuery et événements
```javascript
// Sélection simple par classe et attachement d’événement
$(".sidebar li").on("click", function() {
    // Code du clic
});

// Attachement sur un ID
$("#theme-toggle").on("click", function() {
    const isDark = $("body").hasClass("dark");
    localStorage.setItem("theme", isDark ? "light" : "dark");
    applyTheme();
});

// Modification de classe
$("body").addClass("dark");
$("body").removeClass("dark");
```

### 2) Injection d’HTML avec template literals
```javascript
// Injection simple avec .html()
$("#weather-result").html(`
  <div class="weather-card animate-pop">
    <div class="weather-header">
        <div>
            <h3>${city} ${country === ‘CH’ ? ‘🇨🇭’ : country}</h3>
            <p class="weather-desc">${desc}</p>
        </div>
        <div class="weather-actions">
            <button class="icon-btn" id="btn-fav" data-city="${city}">⭐</button>
            <button class="icon-btn" id="btn-share">📤</button>
        </div>
    </div>

    <div class="weather-main">
        <div class="temp-big">
            ${temp}${unitLabel}
            <img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="${desc}">
        </div>
        <p class="feels-like">Ressenti ${feelsLike}${unitLabel}</p>

        <div class="weather-details-grid">
            <div class="detail-item">
                <span>💧 Humidité</span>
                <strong>${humidity}%</strong>
            </div>
            <div class="detail-item">
                <span>💨 Vent</span>
                <strong>${windSpeed} ${speedLabel}</strong>
            </div>
        </div>
    </div>
  </div>
`);
```

### 3) Appels API avec $.getJSON()
```javascript
// Fetch asynchrone simplifié
$.getJSON(urlCurrent)
  .done(function (data) {
    renderWeather(data);
    updateBackground(data.weather[0].main);

    // Deuxième appel API (forecast)
    $.getJSON(urlForecast).done(function(forecastData) {
        renderForecast(forecastData);
    });
  })
  .fail(function (jqXHR) {
      let msg = "Ville introuvable.";
      if(jqXHR.status === 0) msg = "Problème de connexion internet.";
      else if(jqXHR.status === 401) msg = "Erreur API (Clé invalide).";

      displayError(msg);
  });
```

### 4) Délégation d’événements pour les éléments dynamiques
```javascript
// Événement attaché au document (reste actif même pour éléments créés après)
$(document).on(‘click’, ‘#unit-toggle’, function() {
    currentUnit = currentUnit === ‘metric’ ? ‘imperial’ : ‘metric’;
    localStorage.setItem(‘weatherUnit’, currentUnit);
    updateUnitUI();

    const lastCity = localStorage.getItem("lastCity");
    if(lastCity) fetchWeather(lastCity);
});

// Exemple avec classe dynamique
$(document).on(‘click’, ‘#btn-fav’, function() {
    const city = $(this).data(‘city’);
    const favorites = JSON.parse(localStorage.getItem(‘weatherFavs’) || ‘[]’);

    if (favorites.includes(city)) {
        favorites.splice(favorites.indexOf(city), 1);
        $(this).removeClass(‘active’);
    } else {
        favorites.push(city);
        $(this).addClass(‘active’);
    }

    localStorage.setItem(‘weatherFavs’, JSON.stringify(favorites));
});
```

### 5) Skeleton loading pattern (contenu placeholder)
```javascript
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
                </div>
            </div>
        </div>
        <div class="chart-container animate-pop skeleton"></div>
    `;
    $("#weather-result").html(skeletonHTML);
}

// Appeler renderSkeleton() avant l’API call
renderSkeleton();
$.getJSON(url).done(function(data) {
    renderWeather(data); // Remplace le skeleton
});
```

### 6) Changement dynamique de classes CSS
```javascript
function updateBackground(condition) {
    const $card = $(‘.weather-card’);

    // Reset all classes
    const classes = ‘bg-clear bg-clouds bg-rain bg-snow bg-storm bg-mist bg-default’;
    $card.removeClass(classes);

    // Ajouter la classe selon la condition météo
    let themeClass = ‘bg-default’;
    const cond = condition.toLowerCase();

    if (cond === ‘clear’) {
        themeClass = ‘bg-clear’;
    } else if (cond.includes(‘clouds’)) {
        themeClass = ‘bg-clouds’;
    } else if (cond.includes(‘rain’)) {
        themeClass = ‘bg-rain’;
    } else if (cond.includes(‘snow’)) {
        themeClass = ‘bg-snow’;
    } else if (cond.includes(‘thunderstorm’)) {
        themeClass = ‘bg-storm’;
    }

    $card.addClass(themeClass);
}
```

### 7) Gestion des attributs data
```javascript
// Lire/écrire les attributs data- avec .data()
const city = $(this).data(‘city’);  // Lit data-city="${city}"

// Modifier un attribut data
$("#weather-result").attr("data-city", "Genève");

// Avec jQuery .data() (plus préféré)
$(this).data(‘city’, ‘Genève’);
const savedCity = $(this).data(‘city’);
```

## Cas d’usage dans mon projet
Dans le dashboard météo :
1. **Sélection des boutons** : `.on(‘click’)` sur les boutons de thème, partage, favoris
2. **Injection météo** : Après chaque appel API, `.html()` injecte la nouvelle carte météo
3. **Skeleton** : Affiche un placeholder en CSS pur pendant le chargement (meilleure UX que texte "Chargement...")
4. **Délégation** : Les boutons favoris/partage sont créés dynamiquement, donc utiliser `$(document).on()` est essentiel
5. **Thème dark/light** : Ajouter/retirer la classe `dark` sur `body` change les couleurs globales via CSS
6. **Changement d’unités** : Ajouter la classe `bg-rain`, `bg-clear` etc. selon la météo pour des backgrounds thématiques

## Pièges à éviter
1. **Événements sur éléments dynamiques SANS délégation** :
   ```javascript
   // ❌ MAUVAIS: Attaché au moment du DOM ready
   $("#btn-fav").on("click", ...);  // Ne fonctionne que pour le premier bouton

   // ✅ BON: Délégation vers le document
   $(document).on("click", "#btn-fav", ...);  // Fonctionne même si créé après
   ```

2. **Trop de sélections DOM répétées** :
   ```javascript
   // ❌ Inefficace
   $("body").addClass("dark");
   $("body").text("Hello");
   $("body").css("color", "white");

   // ✅ Mieux
   const $body = $("body");
   $body.addClass("dark").text("Hello").css("color", "white"); // Chaînage
   ```

3. **Oublier d’utiliser les données** :
   - Utiliser `.data()` ou `data-*` pour passer des valeurs aux éléments
   - Sinon, utiliser des variables globales (mauvaise pratique)

4. **Injection XSS** :
   ```javascript
   // ❌ DANGEREUX si userInput vient de l’utilisateur
   $("#result").html(`<b>${userInput}</b>`);

   // ✅ Sûr avec .text() ou échappement
   $("#result").text(userInput);
   ```

5. **Performance : $() à la boucle** :
   ```javascript
   // ❌ Mauvais
   for (let i = 0; i < 100; i++) {
       $(".item").append(`<div>${i}</div>`);  // 100 appels DOM
   }

   // ✅ Mieux
   let html = ‘’;
   for (let i = 0; i < 100; i++) {
       html += `<div>${i}</div>`;
   }
   $(".item").append(html);  // 1 appel DOM
   ```

## Analyse personnelle
La manipulation du DOM avec jQuery m’a fait comprendre les bases du JavaScript côté client. Au début, j’injectais du HTML en concaténant des strings (très lisible mais impossible à maintenir). Découvrir les template literals a changé mon approche.

J’ai aussi appris que jQuery cache beaucoup de complexité. En cherchant à optimiser, j’ai compris pourquoi les frameworks modernes (React, Vue) gèrent mieux les mises à jour du DOM. Passer à la Vanilla JS ou un framework après jQuery était naturel car je comprenais les problèmes qu’ils résolvent.

La délégation d’événements m’a pris du temps à maîtriser (beaucoup d’appels oubliés à `$(document).on()`), mais c’était une leçon précieuse sur comment les événements se propagent dans le DOM.

## Sources
- https://api.jquery.com/ (Documentation officielle)
- https://learn.jquery.com/using-jquery-core/ (Tutoriels jQuery)
- MDN Web Docs - Event delegation
- https://developer.mozilla.org/en-US/docs/Web/API/Event/bubbling_and_capturing
- jQuery Learning Center - Traversing

