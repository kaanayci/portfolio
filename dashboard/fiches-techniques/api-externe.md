# Intégration d’une API externe avec JavaScript

## Définition
Une **API REST** (Application Programming Interface) est une interface qui permet à une application web de communiquer avec un serveur distant via des requêtes HTTP (GET, POST, etc.). Le serveur renvoie des données structurées (généralement en JSON) que l’application peut ensuite afficher. Dans le Dashboard, j’utilise jQuery `$.getJSON()` pour effectuer des requêtes AJAX vers l’API OpenWeatherMap.

## Contexte d’utilisation
Le Dashboard SwissMétéo affiche des données météorologiques en temps réel. Ces données ne peuvent pas être stockées localement car elles changent constamment — il faut interroger un serveur distant à chaque recherche de ville. L’API OpenWeatherMap fournit la météo actuelle, les prévisions 5 jours, la qualité de l’air et l’indice UV.

## Architecture des appels API

Une seule action utilisateur (rechercher une ville) déclenche **4 appels API chaînés** :

| Appel | Endpoint | Données récupérées |
|-------|----------|-------------------|
| 1. Météo actuelle | `/weather` | Température, vent, humidité, lever/coucher soleil |
| 2. Prévisions | `/forecast` | Températures + pluie sur 5 jours |
| 3. Qualité de l’air | `/air_pollution` | Indice AQI (1 à 5) |
| 4. Indice UV | `/onecall` | UV index (avec fallback si API payante) |

Les appels 2, 3 et 4 ne sont lancés que si l’appel 1 réussit — c’est un **chaînage conditionnel**.

## Exemple de code : requête principale

```javascript
// modules/weather.js
function fetchWeather(query, displayName = null) {
  let urlCurrent = "";

  // Construire l’URL selon le type de requête (ville ou coordonnées GPS)
  if (typeof query === "object" && query.lat) {
    urlCurrent = `https://api.openweathermap.org/data/2.5/weather?lat=${query.lat}&lon=${query.lon}&units=${currentUnit}&lang=fr&appid=${WEATHER_API_KEY}`;
  } else {
    urlCurrent = `https://api.openweathermap.org/data/2.5/weather?q=${query}&units=${currentUnit}&lang=fr&appid=${WEATHER_API_KEY}`;
  }

  // Afficher un skeleton loading pendant le chargement
  renderSkeleton();

  // Requête AJAX avec jQuery
  $.getJSON(urlCurrent)
    .done(function(data) {
      renderWeather(data, displayName);
      updateBackground(data.weather[0].main);

      // Sauvegarder la dernière ville recherchée
      if (typeof query === "string") {
        localStorage.setItem("lastCity", query);
      }

      // Chaîner les requêtes suivantes (prévisions, air, UV)
      // ...
    })
    .fail(function(jqXHR) {
      // Gestion d’erreur avec messages différenciés
      let msg = "Ville introuvable.";
      if (jqXHR.status === 0) msg = "Problème de connexion internet.";
      else if (jqXHR.status === 401) msg = "Erreur API (Clé invalide).";
      displayError(msg);
    });
}
```

## Exemple de code : fallback gracieux pour l’UV

L’endpoint OneCall (UV) est souvent payant. J’ai implémenté un **fallback** qui estime l’UV si la requête échoue :

```javascript
// Tentative de récupération UV via OneCall
$.getJSON(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&...`)
  .done(function(onecallData) {
    renderUV(onecallData.current.uvi);
  })
  .fail(function() {
    // Fallback : estimation basée sur l’heure et la météo
    const hour = new Date().getHours();
    const isSunny = data.weather[0].main.toLowerCase() === ‘clear’;
    let mockUV = 0;

    if (hour >= 10 && hour <= 16) {
      mockUV = isSunny ? Math.floor(Math.random() * 4) + 4 : Math.floor(Math.random() * 3) + 1;
    }

    renderUV(mockUV, true);  // true = marqué comme "estimé"
  });
```

L’utilisateur voit toujours un indice UV, mais avec un astérisque (*) quand c’est une estimation — c’est un exemple de **graceful degradation**.

## Exemple de code : construction d’URL flexible

La fonction accepte deux formats d’entrée (ville en texte ou coordonnées GPS) :

```javascript
// Recherche par nom de ville
fetchWeather("Neuchâtel");

// Recherche par géolocalisation
fetchWeather({ lat: 46.99, lon: 6.93 });
```

Ce **polymorphisme** (`typeof query === "object"`) permet d’utiliser la même fonction pour la recherche manuelle et la géolocalisation automatique.

## Cas d’usage dans mon projet
La fonction `fetchWeather` est le cœur du Dashboard. Elle est appelée à 3 moments : au chargement initial (avec la dernière ville sauvegardée en localStorage), lors d’une recherche manuelle, et lors d’un clic sur un favori. Les données récupérées alimentent l’affichage principal, le graphique Chart.js (température + pluie sur 24h), et les cartes de prévisions 5 jours.

## Pièges à éviter
*   **Ne pas gérer le `.fail()`** : Sans gestion d’erreur, l’interface reste bloquée sur le skeleton si la requête échoue. J’ai différencié les codes d’erreur (0 = réseau, 401 = clé invalide, 404 = ville introuvable).
*   **Clé API exposée** : Initialement, ma clé était en dur dans le code. Après le feedback de l’évaluation intermédiaire, j’ai créé un `config.js` séparé avec un `config.example.js` pour le partage. En production, la clé devrait être côté serveur (proxy API).
*   **Requêtes inutiles** : J’ai ajouté une vérification (`data-city`) pour ne pas recharger la météo si la ville affichée est déjà celle demandée.
*   **CORS** : L’API OpenWeatherMap autorise les requêtes cross-origin, mais d’autres API pourraient les bloquer. Il faudrait alors un proxy backend.
*   **Rate limiting** : Les APIs gratuites ont des limites (60 requêtes/minute pour OpenWeatherMap). Sans précaution, un utilisateur qui spamme la recherche pourrait atteindre cette limite.

## Analyse personnelle
L’intégration d’API est ce qui a rendu le Dashboard vivant — passer d’une page statique à une application qui affiche des données réelles en temps réel a été un moment marquant. Le chaînage de 4 requêtes m’a appris à gérer l’asynchrone et les dépendances entre appels. Le fallback UV est l’élément dont je suis le plus fier : plutôt que de cacher la fonctionnalité quand l’API payante échoue, j’offre une estimation honnête. Si c’était à refaire, j’utiliserais `fetch()` natif plutôt que `$.getJSON()` — jQuery était pratique pour commencer mais `async/await` avec Fetch est plus moderne et plus lisible, comme je l’ai fait dans le projet Restaurant.

## Sources
*   OpenWeatherMap API : [https://openweathermap.org/api](https://openweathermap.org/api)
*   MDN - Fetch API : [https://developer.mozilla.org/fr/docs/Web/API/Fetch_API](https://developer.mozilla.org/fr/docs/Web/API/Fetch_API)
*   jQuery - $.getJSON : [https://api.jquery.com/jquery.getjson/](https://api.jquery.com/jquery.getjson/)
