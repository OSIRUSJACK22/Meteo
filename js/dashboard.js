/**
 * MÉTÉO VILLES AFRICAINES - DASHBOARD
 * Fonctionnalités spécifiques au tableau de bord avec API temps réel
 */

// --- ÉLÉMENTS DU DOM (initialisés dans DOMContentLoaded) ---
let dashboardElements = {};
let villeActuelle = "dakar";
let chargementEnCours = false;

// --- INITIALISATION DES ÉLÉMENTS ---
function initialiserElementsDashboard() {
    dashboardElements = {
        listeVilles: document.querySelectorAll(".dashboard-sidebar-city-item"),
        affichageNomVille: document.querySelector(".dashboard-city-name-display"),
        affichageTemperature: document.querySelector(".dashboard-weather-card-temperature-value"),
        affichageCondition: document.querySelector(".dashboard-weather-card-condition"),
        affichageIcone: document.querySelector(".dashboard-weather-card-icon"),
        detailHumidite: document.querySelectorAll(".dashboard-weather-detail-value")[0],
        detailVent: document.querySelectorAll(".dashboard-weather-detail-value")[1],
        detailMax: document.querySelectorAll(".dashboard-weather-detail-value")[2],
        detailMin: document.querySelectorAll(".dashboard-weather-detail-value")[3],
        widgetVitesseVent: document.querySelector(".dashboard-wind-widget-speed-value"),
        widgetDirectionVent: document.querySelector(".dashboard-wind-widget-direction"),
        widgetHumidite: document.querySelector(".dashboard-wind-widget-humidity-value")
    };
}

// --- FONCTIONS ---

/**
 * Affiche l'indicateur de chargement
 */
function afficherChargement() {
    if (chargementEnCours) return;
    
    chargementEnCours = true;
    
    let indicateur = document.querySelector(".dashboard-loading-indicator");
    if (!indicateur) {
        indicateur = document.createElement("div");
        indicateur.className = "dashboard-loading-indicator";
        indicateur.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(14, 22, 40, 0.95);
            padding: 2rem 3rem;
            border-radius: 15px;
            border: 2px solid #38BDF8;
            z-index: 9999;
            text-align: center;
        `;
        indicateur.innerHTML = `
            <div style="font-size: 3rem; animation: pulse 1s infinite;">🌡️</div>
            <p style="color: #38BDF8; font-family: 'Space Grotesk', sans-serif; margin-top: 1rem;">
                Chargement des données...
            </p>
        `;
        document.body.appendChild(indicateur);
    }
    indicateur.style.display = "block";
}

/**
 * Masque l'indicateur de chargement
 */
function masquerChargement() {
    chargementEnCours = false;
    const indicateur = document.querySelector(".dashboard-loading-indicator");
    if (indicateur) {
        indicateur.style.display = "none";
    }
}

/**
 * Met à jour l'affichage du dashboard avec les données d'une ville
 * @param {object} donneesVille - Les données de la ville depuis l'API
 */
function mettreAJourDashboardAvecDonnees(donneesVille) {
    if (!donneesVille) {
        console.error("Aucune donnée à afficher");
        afficherNotification("Données non disponibles", "error");
        return;
    }

    console.log("Mise à jour dashboard avec:", donneesVille);

    // Mise à jour des éléments du DOM
    if (dashboardElements.affichageNomVille) {
        dashboardElements.affichageNomVille.textContent = `${donneesVille.nom}, ${donneesVille.pays}`;
    }

    if (dashboardElements.affichageTemperature) {
        dashboardElements.affichageTemperature.textContent = `${donneesVille.temperature}°C`;
    }

    if (dashboardElements.affichageCondition) {
        dashboardElements.affichageCondition.textContent = donneesVille.condition;
    }

    if (dashboardElements.affichageIcone) {
        dashboardElements.affichageIcone.textContent = donneesVille.icone;
    }

    // Mise à jour des détails (humidité, vent, max, min)
    if (dashboardElements.detailHumidite) {
        dashboardElements.detailHumidite.textContent = `${donneesVille.humidite}%`;
    }
    if (dashboardElements.detailVent) {
        dashboardElements.detailVent.textContent = `${donneesVille.vent} km/h`;
    }
    if (dashboardElements.detailMax) {
        dashboardElements.detailMax.textContent = `${donneesVille.temperatureMax}°C`;
    }
    if (dashboardElements.detailMin) {
        dashboardElements.detailMin.textContent = `${donneesVille.temperatureMin}°C`;
    }

    // Mise à jour du widget vent
    if (dashboardElements.widgetVitesseVent) {
        dashboardElements.widgetVitesseVent.textContent = `${donneesVille.vent} km/h`;
    }
    if (dashboardElements.widgetDirectionVent) {
        const directions = ["Nord", "Nord-Est", "Est", "Sud-Est", "Sud", "Sud-Ouest", "Ouest", "Nord-Ouest"];
        dashboardElements.widgetDirectionVent.textContent = directions[Math.floor(Math.random() * directions.length)];
    }
    if (dashboardElements.widgetHumidite) {
        dashboardElements.widgetHumidite.textContent = `${donneesVille.humidite}%`;
    }

    afficherNotification(`Météo mise à jour pour ${donneesVille.nom}`);
}

/**
 * Charge et affiche les données météo d'une ville
 * @param {string} nomVille - Le nom de la ville (clé dans VILLES_COORDONNEES)
 */
async function chargerEtAfficherMeteo(nomVille) {
    console.log("Chargement météo pour:", nomVille);
    afficherChargement();

    try {
        let donneesVille;

        // Vérifier si l'API est configurée
        const apiConfiguree = typeof API_CONFIG !== 'undefined' && 
                              API_CONFIG.apiKey && 
                              API_CONFIG.apiKey !== 'VOTRE_CLE_API_ICI';

        if (apiConfiguree && typeof getWeatherByCity === "function") {
            console.log("Utilisation de l'API OpenWeatherMap");
            donneesVille = await getWeatherByCity(nomVille);
        } else {
            console.log("API non configurée, utilisation des données fallback");
            donneesVille = getWeatherByCitySync(nomVille);
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        if (!donneesVille) {
            console.log("Données non disponibles, fallback");
            donneesVille = getWeatherByCitySync(nomVille);
        }

        mettreAJourDashboardAvecDonnees(donneesVille);
        villeActuelle = nomVille;

    } catch (error) {
        console.error("Erreur lors du chargement:", error);
        afficherNotification("Erreur de chargement des données", "error");

        // Fallback
        const donneesFallback = getWeatherByCitySync(nomVille);
        if (donneesFallback) {
            mettreAJourDashboardAvecDonnees(donneesFallback);
        }
    } finally {
        masquerChargement();
    }
}

/**
 * Gère le clic sur un élément de la liste des villes
 * @param {Event} evenement - L'événement de clic
 */
function gererClicVille(evenement) {
    const elementClique = evenement.target;
    const nomVille = elementClique.textContent.toLowerCase().replace(/\s+/g, "-");

    console.log("Clic sur ville:", nomVille);

    // Retirer la classe active de tous les éléments
    dashboardElements.listeVilles.forEach(function(element) {
        element.classList.remove("dashboard-sidebar-city-item-active");
    });

    // Ajouter la classe active à l'élément cliqué
    elementClique.classList.add("dashboard-sidebar-city-item-active");

    // Charger les données
    chargerEtAfficherMeteo(nomVille);
}

// --- INITIALISATION ---
document.addEventListener("DOMContentLoaded", function() {
    console.log("=== Dashboard initialisé ===");
    
    // Initialiser les éléments du DOM
    initialiserElementsDashboard();
    
    console.log("Éléments trouvés:", {
        listeVilles: dashboardElements.listeVilles.length,
        affichageNomVille: !!dashboardElements.affichageNomVille,
        affichageTemperature: !!dashboardElements.affichageTemperature
    });

    // Ajouter les écouteurs d'événements sur la liste des villes
    if (dashboardElements.listeVilles && dashboardElements.listeVilles.length > 0) {
        dashboardElements.listeVilles.forEach(function(elementVille) {
            elementVille.addEventListener("click", gererClicVille);
            console.log("Écouteur ajouté sur:", elementVille.textContent);
        });
    } else {
        console.warn("Aucun élément de ville trouvé dans la sidebar!");
    }

    // Initialiser avec la première ville (Dakar)
    chargerEtAfficherMeteo("dakar");

    // Rafraîchir automatiquement toutes les 10 minutes
    setInterval(function() {
        console.log("Rafraîchissement automatique des données...");
        chargerEtAfficherMeteo(villeActuelle);
    }, 600000);
});
