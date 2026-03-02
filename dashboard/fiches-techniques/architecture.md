# Architecture SPA multi-salons (sans framework)

## Définition
Une **SPA (Single Page Application)** est une application web qui ne recharge jamais la page complète. Toute la navigation se fait en JavaScript : on masque et affiche différentes "vues" en manipulant le DOM, ce qui donne une expérience fluide similaire à une application native. Le Dashboard SwissMétéo utilise ce principe avec une architecture "multi-salons" inspirée de Discord/Slack : une sidebar fixe à gauche et un contenu principal qui change dynamiquement.

## Contexte d’utilisation
Le Dashboard a 7 sections différentes (Accueil, Météo, Montagne, Favoris, Carte, Paramètres, Documentation). Recharger la page à chaque navigation serait lent et perdrait l’état de l’application (recherche en cours, carte affichée, etc.). L’architecture SPA permet de garder tout en mémoire et de naviguer instantanément.

## Organisation des modules

Le code JavaScript est découpé en modules spécialisés :

```
dashboard/assets/js/
├── app.js              # Orchestrateur principal (navigation, événements)
├── modules/
│   ├── config.js       # Clé API, variables globales
│   ├── weather.js      # Appels API météo + rendu
│   ├── map.js          # Carte Leaflet + comparaison
│   ├── panorama.js     # Webcams montagnes suisses
│   ├── favorites.js    # Gestion des villes favorites
│   └── ui.js           # Thème, skeleton, erreurs, backgrounds
```

Chaque module a une responsabilité unique. L’orchestrateur `app.js` coordonne le tout via la fonction `switchChannel()`.

## Exemple de code : la navigation par switchChannel()

Le cœur de l’architecture — cette fonction gère le passage d’un salon à l’autre :

```javascript
// app.js
function switchChannel(channelName) {
  // 1. Mettre à jour la sidebar (état actif)
  $(".sidebar li").removeClass("active");
  $(`.sidebar li[data-channel="${channelName}"]`).addClass("active");

  // 2. Masquer toutes les vues, afficher celle demandée
  $(".view-section").addClass("hidden");
  $(`#view-${channelName}`).removeClass("hidden");

  // 3. Réinitialiser le background si on quitte la météo
  if (channelName !== ‘meteo’) {
    $(‘body’).removeClass().addClass(‘bg-default’);
    if (localStorage.getItem(‘theme’) === ‘dark’) $(‘body’).addClass(‘dark’);
  }

  // 4. Initialisation lazy du module correspondant
  switch (channelName) {
    case "meteo":
      const lastCity = localStorage.getItem("lastCity");
      if (lastCity) fetchWeather(lastCity);
      break;
    case "map":
      // Leaflet a besoin de savoir qu’il est visible pour se redimensionner
      setTimeout(() => {
        if (mapInstance) mapInstance.invalidateSize();
        else initMap();
      }, 100);
      break;
    case "favorites":
      loadFavoritesPage();
      break;
    // ...
  }
}
```

## Exemple de code : initialisation lazy (chargement à la demande)

Les modules lourds (carte Leaflet, panoramas) ne sont initialisés que lorsque l’utilisateur navigue vers la section correspondante. C’est du **lazy loading** :

```javascript
// La carte n’est créée qu’au premier clic sur "Carte"
case "map":
  setTimeout(() => {
    if (mapInstance) mapInstance.invalidateSize();  // Déjà créée → rafraîchir
    else initMap();                                  // Première visite → créer
  }, 100);
  break;
```

Le `setTimeout` de 100ms est nécessaire car Leaflet calcule ses dimensions à partir du conteneur visible — si le conteneur vient juste d’être affiché (via `removeClass("hidden")`), ses dimensions sont encore à 0.

## Exemple de code : sidebar et navigation mobile

```javascript
// Clic sur un élément de la sidebar
$(".sidebar li").on("click", function() {
  const channel = $(this).data("channel");
  $("#channel-title").text($(this).text().substring(2));  // Retirer l’emoji
  switchChannel(channel);

  // Fermer la sidebar sur mobile
  $(‘#sidebar’).removeClass(‘open’);
  $(‘#sidebar-overlay’).removeClass(‘active’);
});

// Burger menu pour mobile
$(‘#burger-toggle’).on(‘click’, function() {
  $(‘#sidebar’).toggleClass(‘open’);
  $(‘#sidebar-overlay’).toggleClass(‘active’);
});
```

## Cas d’usage dans mon projet
La page d’accueil charge les panoramas de webcams suisses. Quand l’utilisateur clique sur "Météo", le contenu change sans rechargement et la dernière ville recherchée est automatiquement restaurée depuis localStorage. S’il va ensuite sur la carte, Leaflet est initialisé pour la première fois. Tout cet état (ville affichée, carte créée, favoris chargés) persiste en mémoire tant que la page est ouverte.

## Pièges à éviter
*   **Fuites mémoire** : Chaque `switchChannel` peut créer de nouvelles instances (Chart.js, Leaflet). Il faut détruire l’ancienne avant d’en créer une nouvelle (`if (weatherChart) weatherChart.destroy()`).
*   **Modules invisibles qui calculent** : Un graphique ou une carte dans un conteneur `hidden` ne peut pas calculer ses dimensions. D’où le `setTimeout` + `invalidateSize()` pour Leaflet.
*   **Gestion du back button** : Dans une SPA sans framework, le bouton retour du navigateur ne fonctionne pas comme attendu. Il faudrait utiliser l’API History (`pushState`) pour synchroniser l’URL avec la vue active — c’est quelque chose que je n’ai pas implémenté.
*   **Taille du fichier principal** : Sans framework, tout le HTML des vues est dans un seul `index.html`. Si l’application grandit encore, ça devient difficile à maintenir.

## Analyse personnelle
Construire une SPA sans framework (React, Vue) m’a forcé à comprendre ce que ces outils font "sous le capot" : manipulation du DOM, gestion d’état, routing, cycle de vie des composants. C’est laborieux mais extrêmement formateur. Quand je suis passé à Vue.js pour le Restaurant, j’ai immédiatement compris la valeur du `<RouterView>` et des composants — ça résout exactement les problèmes que j’ai rencontrés ici (HTML dupliqué, état dispersé, navigation manuelle). Cette progression de "faire à la main" vers "utiliser un framework" est au cœur de mon apprentissage dans ce cours.

## Sources
*   MDN - DOM Manipulation : [https://developer.mozilla.org/fr/docs/Web/API/Document_Object_Model](https://developer.mozilla.org/fr/docs/Web/API/Document_Object_Model)
*   MDN - History API : [https://developer.mozilla.org/fr/docs/Web/API/History_API](https://developer.mozilla.org/fr/docs/Web/API/History_API)
*   Patterns - Single Page Applications : [https://developer.mozilla.org/en-US/docs/Glossary/SPA](https://developer.mozilla.org/en-US/docs/Glossary/SPA)
