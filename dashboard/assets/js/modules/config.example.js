// IMPORTANT : Ceci est un exemple de configuration.
// Pour que l'application fonctionne, créez un fichier "config.js" dans ce même dossier
// et ajoutez votre clé API OpenWeatherMap.

const WEATHER_API_KEY = "VOTRE_CLE_API_ICI";
let weatherChart = null;
let currentUnit = localStorage.getItem('weatherUnit') || 'metric';
let mapInstance = null;
