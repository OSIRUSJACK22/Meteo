/**
 * MÉTÉO VILLES AFRICAINES - COMPARAISON
 * Fonctionnalités spécifiques à la page de comparaison avec API temps réel
 */

// --- ÉLÉMENTS DU DOM (initialisés dans DOMContentLoaded) ---
let compareElements = {};
let chargementEnCours = false;

// --- INITIALISATION DES ÉLÉMENTS ---
function initialiserElementsComparaison() {
    compareElements = {
        selectVille1: document.querySelector("#compare-city-one-select"),
        selectVille2: document.querySelector("#compare-city-two-select"),
        boutonComparer: document.querySelector(".compare-button-action"),
        cartesVilles: document.querySelectorAll(".compare-city-card-main")
    };
}

// --- FONCTIONS ---

/**
 * Affiche l'indicateur de chargement
 */
function afficherChargement() {
    if (chargementEnCours) return;
    
    chargementEnCours = true;
    
    let indicateur = document.querySelector(".compare-loading-indicator");
    if (!indicateur) {
        indicateur = document.createElement("div");
        indicateur.className = "compare-loading-indicator";
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
            <div style="font-size: 3rem; animation: pulse 1s infinite;">⚖️</div>
            <p style="color: #38BDF8; font-family: 'Space Grotesk', sans-serif; margin-top: 1rem;">
                Comparaison en cours...
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
    const indicateur = document.querySelector(".compare-loading-indicator");
    if (indicateur) {
        indicateur.style.display = "none";
    }
}

/**
 * Compare deux villes et met à jour l'affichage
 * @param {string} ville1 - La première ville (clé dans VILLES_COORDONNEES)
 * @param {string} ville2 - La deuxième ville (clé dans VILLES_COORDONNEES)
 */
async function comparerVilles(ville1, ville2) {
    console.log("Comparaison:", ville1, "vs", ville2);
    afficherChargement();
    
    try {
        let donneesVille1, donneesVille2;
        
        // Vérifier si l'API est configurée
        const apiConfiguree = typeof API_CONFIG !== 'undefined' && 
                              API_CONFIG.apiKey && 
                              API_CONFIG.apiKey !== 'VOTRE_CLE_API_ICI';
        
        if (apiConfiguree && typeof getWeatherByCity === "function") {
            console.log("Utilisation de l'API OpenWeatherMap");
            const resultats = await Promise.all([
                getWeatherByCity(ville1),
                getWeatherByCity(ville2)
            ]);
            donneesVille1 = resultats[0];
            donneesVille2 = resultats[1];
        } else {
            console.log("API non configurée, utilisation des données fallback");
            await new Promise(resolve => setTimeout(resolve, 300));
            donneesVille1 = getWeatherByCitySync(ville1);
            donneesVille2 = getWeatherByCitySync(ville2);
        }
        
        if (!donneesVille1 || !donneesVille2) {
            afficherNotification("Une ou deux villes non trouvées", "error");
            return;
        }
        
        console.log("Données récupérées:", donneesVille1.nom, donneesVille2.nom);
        
        // Mettre à jour les cartes de ville
        mettreAJourCarteVille(0, donneesVille1);
        mettreAJourCarteVille(1, donneesVille2);
        
        // Mettre à jour les barres de différence
        mettreAJourBarresDifference(donneesVille1, donneesVille2);
        
        // Mettre à jour la recommandation
        mettreAJourRecommandation(donneesVille1, donneesVille2);
        
        afficherNotification(`Comparaison: ${donneesVille1.nom} vs ${donneesVille2.nom}`);
        
    } catch (error) {
        console.error("Erreur lors de la comparaison:", error);
        afficherNotification("Erreur de chargement des données", "error");
        
        // Fallback
        const fallback1 = getWeatherByCitySync(ville1);
        const fallback2 = getWeatherByCitySync(ville2);
        if (fallback1 && fallback2) {
            mettreAJourCarteVille(0, fallback1);
            mettreAJourCarteVille(1, fallback2);
            mettreAJourBarresDifference(fallback1, fallback2);
            mettreAJourRecommandation(fallback1, fallback2);
        }
    } finally {
        masquerChargement();
    }
}

/**
 * Met à jour une carte de ville avec les données
 * @param {number} index - L'index de la carte (0 ou 1)
 * @param {object} donnees - Les données de la ville
 */
function mettreAJourCarteVille(index, donnees) {
    const carte = compareElements.cartesVilles[index];
    
    if (!carte) {
        console.warn("Carte", index, "non trouvée");
        return;
    }
    
    const nomElement = carte.querySelector(".compare-city-card-name");
    const paysElement = carte.querySelector(".compare-city-card-country");
    const temperatureElement = carte.querySelector(".compare-city-card-temperature-value");
    const conditionElement = carte.querySelector(".compare-city-card-condition");
    const iconeElement = carte.querySelector(".compare-city-card-weather-icon");
    
    if (nomElement) nomElement.textContent = donnees.nom;
    if (paysElement) paysElement.textContent = donnees.pays;
    if (temperatureElement) temperatureElement.textContent = `${donnees.temperature}°C`;
    if (conditionElement) conditionElement.textContent = donnees.condition;
    if (iconeElement) iconeElement.textContent = donnees.icone;
    
    // Mettre à jour les statistiques
    const statValues = carte.querySelectorAll(".compare-city-card-stat-value");
    if (statValues[0]) statValues[0].textContent = `${donnees.temperatureMax}°C`;
    if (statValues[1]) statValues[1].textContent = `${donnees.temperatureMin}°C`;
    if (statValues[2]) statValues[2].textContent = `${donnees.humidite}%`;
    if (statValues[3]) statValues[3].textContent = `${donnees.vent} km/h`;
    
    console.log(`Carte ${index} mise à jour: ${donnees.nom} ${donnees.temperature}°C`);
}

/**
 * Met à jour les barres de différence entre les villes
 * @param {object} ville1 - Les données de la première ville
 * @param {object} ville2 - Les données de la deuxième ville
 */
function mettreAJourBarresDifference(ville1, ville2) {
    // Différence de température
    const totalTemp = ville1.temperature + ville2.temperature;
    const pourcentTemp1 = Math.round((ville1.temperature / totalTemp) * 100);
    const pourcentTemp2 = 100 - pourcentTemp1;
    
    const barresTemp = document.querySelectorAll(".compare-difference-bar-segment");
    if (barresTemp[0]) {
        barresTemp[0].style.width = `${pourcentTemp1}%`;
        barresTemp[0].querySelector(".compare-difference-bar-label").textContent = `${ville1.nom} ${ville1.temperature}°C`;
    }
    if (barresTemp[1]) {
        barresTemp[1].style.width = `${pourcentTemp2}%`;
        barresTemp[1].querySelector(".compare-difference-bar-label").textContent = `${ville2.nom} ${ville2.temperature}°C`;
    }
    
    // Mettre à jour les textes de résultat
    const resultats = document.querySelectorAll(".compare-difference-card-result");
    
    if (resultats[0]) {
        const diffTemp = ville2.temperature - ville1.temperature;
        const villePlusChaude = diffTemp > 0 ? ville2.nom : ville1.nom;
        resultats[0].textContent = `${villePlusChaude} est ${Math.abs(diffTemp)}°C plus ${diffTemp >= 0 ? "chaud" : "fraîche"}`;
    }
    
    if (resultats[1]) {
        const diffHumidite = ville2.humidite - ville1.humidite;
        const villePlusHumide = diffHumidite > 0 ? ville2.nom : ville1.nom;
        resultats[1].textContent = `${villePlusHumide} est ${Math.abs(diffHumidite)}% plus ${diffHumidite >= 0 ? "humide" : "sec"}`;
    }
    
    if (resultats[2]) {
        const diffVent = ville1.vent - ville2.vent;
        const villePlusVentee = diffVent > 0 ? ville1.nom : ville2.nom;
        resultats[2].textContent = `${villePlusVentee} a ${Math.abs(diffVent)} km/h de vent en plus`;
    }
}

/**
 * Met à jour la recommandation basée sur les données des villes
 * @param {object} ville1 - Les données de la première ville
 * @param {object} ville2 - Les données de la deuxième ville
 */
function mettreAJourRecommandation(ville1, ville2) {
    // Calculer un score de confort
    const scoreVille1 = calculateConfortScore(ville1);
    const scoreVille2 = calculateConfortScore(ville2);
    
    const meilleureVille = scoreVille1 > scoreVille2 ? ville1 : ville2;
    const elementRecommandation = document.querySelector(".compare-recommendation-text");
    const elementMeilleurChoix = document.querySelector(".compare-recommendation-best-choice");
    
    if (elementRecommandation) {
        elementRecommandation.innerHTML = `
            Pour des conditions optimales, <strong>${meilleureVille.nom}</strong> est recommandée aujourd'hui.
            La température y est ${meilleureVille.temperature}°C avec ${meilleureVille.humidite}% d'humidité.
        `;
    }
    
    if (elementMeilleurChoix) {
        elementMeilleurChoix.textContent = `Meilleur choix : ${meilleureVille.nom}`;
    }
}

/**
 * Calcule un score de confort pour une ville
 * @param {object} ville - Les données de la ville
 * @returns {number} - Le score de confort
 */
function calculateConfortScore(ville) {
    const scoreTemp = 100 - Math.abs(25 - ville.temperature) * 3;
    const scoreHumidite = 100 - Math.abs(50 - ville.humidite);
    const scoreVent = 100 - Math.abs(10 - ville.vent) * 2;
    
    return (scoreTemp + scoreHumidite + scoreVent) / 3;
}

/**
 * Gère le clic sur le bouton comparer
 */
function gererClicComparer() {
    const ville1 = compareElements.selectVille1 ? compareElements.selectVille1.value : "";
    const ville2 = compareElements.selectVille2 ? compareElements.selectVille2.value : "";
    
    if (ville1 === ville2) {
        afficherNotification("Veuillez sélectionner deux villes différentes", "warning");
        return;
    }
    
    comparerVilles(ville1, ville2);
}

// --- INITIALISATION ---
document.addEventListener("DOMContentLoaded", function() {
    console.log("=== Page Comparaison initialisée ===");
    
    // Initialiser les éléments du DOM
    initialiserElementsComparaison();
    
    console.log("Éléments trouvés:", {
        selectVille1: !!compareElements.selectVille1,
        selectVille2: !!compareElements.selectVille2,
        boutonComparer: !!compareElements.boutonComparer,
        cartesVilles: compareElements.cartesVilles.length
    });
    
    // Écouteur pour le bouton comparer
    if (compareElements.boutonComparer) {
        compareElements.boutonComparer.addEventListener("click", gererClicComparer);
        console.log("Écouteur ajouté sur le bouton comparer");
    }
    
    // Comparaison initiale avec les valeurs par défaut
    if (compareElements.selectVille1 && compareElements.selectVille2) {
        const ville1 = compareElements.selectVille1.value;
        const ville2 = compareElements.selectVille2.value;
        comparerVilles(ville1, ville2);
    }
});
