# Intégration Carte Interactive (Leaflet)

## Description
L'application intègre une carte interactive centrée sur la Suisse pour visualiser la géographie des villes supportées.

## Technologies
*   **Leaflet.js** : Librairie open-source de cartographie.
*   **OpenStreetMap** : Fournisseur de tuiles (Fonds de carte).

## Points Techniques

### Initialisation
La carte est initialisée via `L.map('map')`. Un point d'attention particulier a été porté au redimensionnement dynamique :
*   Utilisation de `mapInstance.invalidateSize()` dans un `setTimeout` pour forcer le redessin des tuiles si le conteneur change de taille ou devient visible après coup (problème fréquent dans les SPA/Tabs).

### Marqueurs
Les villes principales (Genève, Zurich, Bern, etc.) sont définies dans un tableau d'objets `mapCities` contenant leurs coordonnées lat/long.
Une boucle génère les marqueurs et y attache des popups :
```javascript
L.marker(city.coords).addTo(mapInstance)
    .bindPopup(`<b>${city.name}</b>`);
```

### Gestion de l'Instance
Pour éviter les fuites de mémoire ou les erreurs de ré-initialisation ("Map container is already initialized"), le code vérifie l'existence de `mapInstance` et appelle `.remove()` avant de recréer la carte si nécessaire.

## Exemple de code
![alt text](interactivite-carte.png)
