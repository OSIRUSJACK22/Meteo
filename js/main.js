/**
 * MÉTÉO VILLES AFRICAINES - FICHIER PRINCIPAL
 * Fonctionnalités partagées pour toutes les pages
 */

// --- DONNÉES DES VILLES (fallback si API non configurée) ---
const villesAfricainesDonnees = {
    dakar: {
        nom: "Dakar",
        pays: "Sénégal",
        temperature: 28,
        temperatureMax: 32,
        temperatureMin: 24,
        humidite: 65,
        vent: 15,
        condition: "Ensoleillé",
        icone: "☀️"
    },
    abidjan: {
        nom: "Abidjan",
        pays: "Côte d'Ivoire",
        temperature: 30,
        temperatureMax: 33,
        temperatureMin: 26,
        humidite: 75,
        vent: 10,
        condition: "Partiellement nuageux",
        icone: "⛅"
    },
    casablanca: {
        nom: "Casablanca",
        pays: "Maroc",
        temperature: 22,
        temperatureMax: 25,
        temperatureMin: 18,
        humidite: 60,
        vent: 20,
        condition: "Nuageux",
        icone: "☁️"
    },
    "le-cap": {
        nom: "Le Cap",
        pays: "Afrique du Sud",
        temperature: 24,
        temperatureMax: 27,
        temperatureMin: 20,
        humidite: 55,
        vent: 25,
        condition: "Ensoleillé",
        icone: "☀️"
    },
    lagos: {
        nom: "Lagos",
        pays: "Nigeria",
        temperature: 31,
        temperatureMax: 34,
        temperatureMin: 27,
        humidite: 80,
        vent: 8,
        condition: "Orageux",
        icone: "⛈️"
    },
    nairobi: {
        nom: "Nairobi",
        pays: "Kenya",
        temperature: 25,
        temperatureMax: 28,
        temperatureMin: 18,
        humidite: 50,
        vent: 12,
        condition: "Partiellement nuageux",
        icone: "⛅"
    },
    "le-caire": {
        nom: "Le Caire",
        pays: "Égypte",
        temperature: 35,
        temperatureMax: 38,
        temperatureMin: 28,
        humidite: 30,
        vent: 18,
        condition: "Ensoleillé",
        icone: "☀️"
    },
    tunis: {
        nom: "Tunis",
        pays: "Tunisie",
        temperature: 26,
        temperatureMax: 29,
        temperatureMin: 20,
        humidite: 55,
        vent: 14,
        condition: "Ensoleillé",
        icone: "☀️"
    },
    "porto-novo": {
        nom: "Porto-Novo",
        pays: "Bénin",
        temperature: 29,
        temperatureMax: 33,
        temperatureMin: 24,
        humidite: 78,
        vent: 11,
        condition: "Partiellement nuageux",
        icone: "⛅"
    },
    cotonou: {
        nom: "Cotonou",
        pays: "Bénin",
        temperature: 30,
        temperatureMax: 34,
        temperatureMin: 25,
        humidite: 80,
        vent: 13,
        condition: "Orageux",
        icone: "⛈️"
    }
};

// --- FONCTIONS UTILITAIRES ---

/**
 * Récupère les données météo d'une ville par son nom (version synchrone fallback)
 * @param {string} nomVille - Le nom de la ville (ex: "dakar")
 * @returns {object|null} - Les données de la ville ou null si non trouvée
 */
function getWeatherByCitySync(nomVille) {
    const villeNormalisee = nomVille.toLowerCase().replace(/\s+/g, "-");
    return villesAfricainesDonnees[villeNormalisee] || null;
}

/**
 * Formate la date actuelle
 * @returns {string} - La date formatée en français
 */
function formaterDateActuelle() {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    return new Date().toLocaleDateString("fr-FR", options);
}

/**
 * Affiche une notification
 * @param {string} message - Le message à afficher
 * @param {string} type - Le type de notification (success, error, warning)
 */
function afficherNotification(message, type = "success") {
    console.log(`[${type}] ${message}`);
    
    // Créer une notification visuelle si possible
    let notificationContainer = document.querySelector(".notification-container");
    
    if (!notificationContainer) {
        notificationContainer = document.createElement("div");
        notificationContainer.className = "notification-container";
        notificationContainer.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(notificationContainer);
    }
    
    const notification = document.createElement("div");
    notification.style.cssText = `
        padding: 1rem 1.5rem;
        border-radius: 10px;
        font-family: 'DM Sans', sans-serif;
        font-weight: 700;
        animation: slideIn 0.3s ease;
        max-width: 350px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    `;
    
    switch(type) {
        case "success":
            notification.style.backgroundColor = "#38BDF8";
            notification.style.color = "#0E1628";
            break;
        case "error":
            notification.style.backgroundColor = "#F97316";
            notification.style.color = "#FFFFFF";
            break;
        case "warning":
            notification.style.backgroundColor = "#F97316";
            notification.style.color = "#FFFFFF";
            break;
        default:
            notification.style.backgroundColor = "#1E3A5F";
            notification.style.color = "#FFFFFF";
    }
    
    notification.textContent = message;
    notificationContainer.appendChild(notification);
    
    // Supprimer après 3 secondes
    setTimeout(function() {
        notification.style.opacity = "0";
        notification.style.transition = "opacity 0.3s ease";
        setTimeout(function() {
            notification.remove();
        }, 300);
    }, 3000);
}

// --- EXPORTS GLOBAUX ---
window.getWeatherByCitySync = getWeatherByCitySync;
window.afficherNotification = afficherNotification;
window.formaterDateActuelle = formaterDateActuelle;

// --- INITIALISATION ---
document.addEventListener("DOMContentLoaded", function() {
    console.log("=== Application Météo Villes Africaines initialisée ===");
    
    // Mettre à jour la date si l'élément existe
    const elementDate = document.querySelector(".dashboard-current-date-display");
    if (elementDate) {
        elementDate.textContent = formaterDateActuelle();
    }
});
