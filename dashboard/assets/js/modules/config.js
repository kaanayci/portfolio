const WEATHER_API_KEY = "8bf9317dd25811ccc3ea56a0309ffc5a";
let weatherChart = null; 
let currentUnit = localStorage.getItem('weatherUnit') || 'metric';
let mapInstance = null;

