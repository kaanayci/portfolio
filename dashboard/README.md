# 🌦️ Météo Dashboard Suisse (MétéoCH)

Bienvenue sur le **Météo Dashboard Suisse**, une application web progressive (PWA) complète conçue pour visualiser la météo en temps réel, suivre l'état des stations de ski et comparer les climats de différentes villes.

Ce projet démontre des compétences avancées en intégration web (HTML/CSS/JS), manipulation d'APIs tierces et conception d'interfaces utilisateur modernes et réactives.

---

## 🛠️ Installation et Configuration

Pour faire fonctionner le tableau de bord météo, vous devez configurer votre clé API.

1.  Clonez le projet.
2.  Dans le dossier `assets/js/modules/`, dupliquez le fichier `config.example.js`.
3.  Renommez la copie en `config.js`.
4.  Ouvrez ce fichier et remplacez `VOTRE_CLE_API_ICI` par votre clé OpenWeatherMap valide.

```javascript
// config.js
export const WEATHER_API_KEY = "8bf9317dd25811ccc3ea56b...";
```

*Note : Le fichier `config.js` est ignoré par Git pour des raisons de sécurité.*

## ✨ Fonctionnalités Principales

### 1. 🌍 Météo Détaillée
- **Données en temps réel** : Température, ressenti, humidité, vent, pression, UV, qualité de l'air.
- **Prévisions** : Graphiques interactifs (Chart.js) sur 24h et prévisions sur 5 jours.
- **Géolocalisation** : Détection automatique de la position de l'utilisateur.
- **Recommandations** : Conseils vestimentaires basés sur les conditions actuelles.
- **Itinéraires** : Lien direct vers Google Maps pour la navigation.

### 2. 🏔️ Météo des Montagnes & Ski
- **Monitoring des Stations** : Suivi en direct des stations suisses (Grindelwald, Verbier, Zermatt...).
- **État des Pistes** : Simulation intelligente de l'ouverture/fermeture des pistes et de l'enneigement.
- **Mode "À Proximité"** : Affiche automatiquement les stations à moins de 50km de vous.
- **Visuels Immersifs** : Cartes riches avec photos des stations.

### 3. 🆚 Comparateur de Villes
- **Multi-comparaison** : Comparez jusqu'à **4 villes** simultanément côte à côte.
- **Analyse Visuelle** : Graphique comparatif des températures et ressentis.
- **Tableau de Données** : Comparaison ligne par ligne de toutes les métriques (Vent, Pression, Lever/Coucher soleil...).
- **Indicateurs** : Mise en évidence automatique de la ville la plus chaude ("Winner").

### 4. 🗺️ Carte Interactive
- Visualisation globale via **Leaflet.js**.
- Marqueurs dynamiques avec météo en temps réel pour les grandes villes suisses.

### 5. 📲 Progressive Web App (PWA)
- **Installable** : Fonctionne comme une application native sur Mobile et Desktop.
- **Offline First** : L'interface reste accessible sans connexion internet (Service Worker).
- **Notifications** : Support des notifications push pour les alertes.
- **Mise à jour (Cache)** : Le Service Worker met en cache les fichiers pour la performance. Si vous modifiez le code, le changement n'apparaîtra qu'après une mise à jour du numéro de version dans `sw.js` (ex: `v1` -> `v2`) ou un "Hard Refresh" (Ctrl+F5) pour forcer le nettoyage du cache.

### 6. ⚙️ Personnalisation
- **Thèmes** : Mode Clair / Mode Sombre (Dark Mode).
- **Unités** : Bascule facile entre Métrique (°C, km/h) et Impérial (°F, mph).
- **Favoris** : Gestion d'une liste de villes préférées avec accès rapide.

---

## 🛠️ Stack Technique

- **Frontend** : HTML5, CSS3 (Grid/Flexbox), JavaScript (ES6+).
- **Bibliothèques** :
  - **jQuery** : Manipulation DOM simplifiée.
  - **Chart.js** : Graphiques de données météo.
  - **Leaflet** : Cartographie interactive.
- **API** : [OpenWeatherMap API](https://openweathermap.org/api) (Météo, Pollution, Géocodage).
- **Architecture** : Modulaire (fichiers JS séparés par fonctionnalité).
- **PWA** : Service Worker (`sw.js`), Manifest (`manifest.json`).

---

## 🚀 Installation et Lancement

1. **Cloner le projet** (ou télécharger les fichiers).
2. **Configurer l'API Key** :
   - Ouvrez `assets/js/modules/config.js` (si présent) ou vérifiez la variable `WEATHER_API_KEY` dans le code.
3. **Lancer le serveur local** :
   ```bash
   node server.js
   ```
4. **Accéder à l'application** :
   - Ouvrez votre navigateur sur `http://localhost:3000`.

---

## 🧱 Structure du Projet

```text
dashboard/
├── index.html              # Point d'entrée PWA
├── manifest.json           # Manifeste PWA
├── sw.js                   # Service Worker (Cache & Offline)
├── server.js               # Serveur Node.js simple
├── assets/
│   ├── css/
│   │   ├── style.css       # Styles globaux
│   │   └── components/     # Styles modulaires (weather, mountain, compare...)
│   ├── js/
│   │   ├── app.js          # Contrôleur principal (Routing)
│   │   └── modules/        # Logique métier
│   │       ├── weather.js  # Gestion météo & API
│   │       ├── panorama.js # Logique Montagne/Ski
│   │       ├── compare.js  # Comparateur
│   │       ├── map.js      # Carte Leaflet
│   │       ├── ui.js       # Gestion thème & UI
│   │       └── favorites.js
│   └── icons/              # Icônes PWA
└── README.md
```

---

## 📸 Aperçu

L'application est entièrement **Responsive**, s'adaptant parfaitement des grands écrans de bureau aux smartphones. Le design met l'accent sur la lisibilité, l'esthétique "glassmorphism" et des animations fluides.
