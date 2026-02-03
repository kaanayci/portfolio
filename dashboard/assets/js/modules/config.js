const WEATHER_API_KEY = "8bf9317dd25811ccc3ea56a0309ffc5a";
let weatherChart = null; // Instance globale du graphique
let currentUnit = localStorage.getItem('weatherUnit') || 'metric'; // 'metric' (C) or 'imperial' (F)
let mapInstance = null; // Instance Leaflet
