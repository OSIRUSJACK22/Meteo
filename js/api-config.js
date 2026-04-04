/**
 * MÉTÉO VILLES AFRICAINES - CONFIGURATION API
 * Configuration de l'API OpenWeatherMap
 */

// --- CONFIGURATION ---
const API_CONFIG = {
    // ⚠️ IMPORTANT: Inscrivez-vous sur https://openweathermap.org/api pour obtenir votre clé API gratuite
    // Remplacez 'VOTRE_CLE_API_ICI' par votre vraie clé API OpenWeatherMap
    apiKey: '8495325fa1b9ff7a973a7828c6ee4b03',
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    units: 'metric', // Celsius
    lang: 'fr' // Français
};

// --- COORDONNÉES DES VILLES AFRICAINES ---
const VILLES_COORDONNEES = {
    dakar: { nom: "Dakar", pays: "Sénégal", lat: 14.6928, lon: -17.4467 },
    abidjan: { nom: "Abidjan", pays: "Côte d'Ivoire", lat: 5.3600, lon: -4.0083 },
    casablanca: { nom: "Casablanca", pays: "Maroc", lat: 33.5731, lon: -7.5898 },
    "le-cap": { nom: "Le Cap", pays: "Afrique du Sud", lat: -33.9249, lon: 18.4241 },
    lagos: { nom: "Lagos", pays: "Nigeria", lat: 6.5244, lon: 3.3792 },
    nairobi: { nom: "Nairobi", pays: "Kenya", lat: -1.2921, lon: 36.8219 },
    "le-caire": { nom: "Le Caire", pays: "Égypte", lat: 30.0444, lon: 31.2357 },
    tunis: { nom: "Tunis", pays: "Tunisie", lat: 36.8065, lon: 10.1815 },
    "porto-novo": { nom: "Porto-Novo", pays: "Bénin", lat: 6.49646, lon: 2.60359 },
    cotonou: { nom: "Cotonou", pays: "Bénin", lat: 6.36536, lon: 2.41833 }
};

// --- MAPPING DES ICÔNES ---
const ICONES_METEO = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️'
};

// --- CONDITIONS EN FRANÇAIS ---
const CONDITIONS_METEO = {
    'Clear': 'Ensoleillé',
    'Clouds': 'Nuageux',
    'Rain': 'Pluie',
    'Drizzle': 'Bruine',
    'Thunderstorm': 'Orage',
    'Snow': 'Neige',
    'Mist': 'Brume',
    'Fog': 'Brouillard',
    'Haze': 'Brume sèche',
    'Dust': 'Poussière',
    'Sand': 'Sable',
    'Squall': 'Grain',
    'Smoke': 'Fumée'
};

/**
 * Vérifie si la clé API est configurée
 * @returns {boolean} - True si la clé est configurée
 */
function estApiConfiguree() {
    return API_CONFIG.apiKey !== 'VOTRE_CLE_API_ICI' && API_CONFIG.apiKey.length > 0;
}

/**
 * Affiche un message si l'API n'est pas configurée
 */
function verifierConfigurationApi() {
    if (!estApiConfiguree()) {
        console.warn('⚠️ API OpenWeatherMap non configurée!');
        console.warn('📝 Inscrivez-vous sur https://openweathermap.org/api pour obtenir votre clé gratuite');
        console.warn('🔧 Ajoutez votre clé dans js/api-config.js');
        
        // Afficher un message dans l'interface si possible
        const messageElement = document.createElement('div');
        messageElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #F97316;
            color: white;
            padding: 1rem;
            text-align: center;
            z-index: 9999;
            font-family: sans-serif;
        `;
        messageElement.innerHTML = `
            ⚠️ <strong>Configuration requise:</strong> Ajoutez votre clé API OpenWeatherMap dans 
            <code>js/api-config.js</code>. 
            <a href="https://openweathermap.org/api" target="_blank" style="color: white; text-decoration: underline;">
                Obtenir une clé gratuite
            </a>
        `;
        document.body.insertBefore(messageElement, document.body.firstChild);
        
        return false;
    }
    return true;
}

// --- EXPORTS ---
// Les fonctions sont disponibles globalement pour les autres fichiers JS
