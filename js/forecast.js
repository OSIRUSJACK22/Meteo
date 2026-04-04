/**
 * MÉTÉO VILLES AFRICAINES - PRÉVISIONS
 * Fonctionnalités spécifiques à la page des prévisions avec API temps réel
 */

// --- ÉLÉMENTS DU DOM (initialisés dans DOMContentLoaded) ---
let forecastElements = {};
let villeActuelle = "dakar";
let chargementEnCours = false;

// --- INITIALISATION DES ÉLÉMENTS ---
function initialiserElementsPrevisions() {
    forecastElements = {
        selectVille: document.querySelector(".forecast-city-select-dropdown"),
        affichageNomVille: document.querySelector(".forecast-summary-city-name"),
        affichageDateRange: document.querySelector(".forecast-summary-date-range"),
        affichageTemperatureMoyenne: document.querySelectorAll(".forecast-summary-stat-value")[0],
        affichageJoursEnsoleilles: document.querySelectorAll(".forecast-summary-stat-value")[1],
        affichageJoursPluie: document.querySelectorAll(".forecast-summary-stat-value")[2],
        cartesJour: document.querySelectorAll(".forecast-day-card-container"),
        pageTitle: document.querySelector(".forecast-page-title"),
        chartColonnes: document.querySelectorAll(".forecast-chart-day-column")
    };
}

// --- FONCTIONS ---

/**
 * Affiche l'indicateur de chargement
 */
function afficherChargement() {
    if (chargementEnCours) return;
    
    chargementEnCours = true;
    
    let indicateur = document.querySelector(".forecast-loading-indicator");
    if (!indicateur) {
        indicateur = document.createElement("div");
        indicateur.className = "forecast-loading-indicator";
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
            <div style="font-size: 3rem; animation: pulse 1s infinite;">📅</div>
            <p style="color: #38BDF8; font-family: 'Space Grotesk', sans-serif; margin-top: 1rem;">
                Chargement des prévisions...
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
    const indicateur = document.querySelector(".forecast-loading-indicator");
    if (indicateur) {
        indicateur.style.display = "none";
    }
}

/**
 * Calcule la température moyenne sur 7 jours
 * @param {Array} previsions - Le tableau des prévisions
 * @returns {number} - La température moyenne arrondie
 */
function calculerTemperatureMoyenne(previsions) {
    if (!previsions || previsions.length === 0) return 0;
    
    const sommeTemperatures = previsions.reduce(function(acc, prev) {
        return acc + ((prev.tempMax + prev.tempMin) / 2);
    }, 0);
    
    return Math.round(sommeTemperatures / previsions.length);
}

/**
 * Compte le nombre de jours ensoleillés
 * @param {Array} previsions - Le tableau des prévisions
 * @returns {number} - Le nombre de jours ensoleillés
 */
function compterJoursEnsoleilles(previsions) {
    if (!previsions) return 0;
    
    return previsions.filter(function(prev) {
        return prev.icone === "☀️" || prev.icone === "⛅";
    }).length;
}

/**
 * Compte le nombre de jours de pluie
 * @param {Array} previsions - Le tableau des prévisions
 * @returns {number} - Le nombre de jours de pluie
 */
function compterJoursPluie(previsions) {
    if (!previsions) return 0;
    
    return previsions.filter(function(prev) {
        return prev.icone === "🌧️" || prev.icone === "⛈️";
    }).length;
}

/**
 * Met à jour la période affichée dans le résumé
 * @param {Array} previsions - Les prévisions
 */
function mettreAJourPeriode(previsions) {
    if (!forecastElements.affichageDateRange || !previsions || previsions.length === 0) return;

    const start = previsions[0].dateObj ? new Date(previsions[0].dateObj) : null;
    const end = previsions[previsions.length - 1].dateObj ? new Date(previsions[previsions.length - 1].dateObj) : null;
    if (!start || !end) return;

    const formatter = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
    const startStr = formatter.format(start);
    const endStr = formatter.format(end);

    forecastElements.affichageDateRange.textContent = `Du ${startStr} au ${endStr}`;
}

/**
 * Met à jour l'affichage des cartes de prévisions
 * @param {Array} previsions - Les prévisions à afficher
 */
function mettreAJourCartesPrevisions(previsions) {
    if (!previsions || previsions.length === 0) {
        console.warn("Aucune prévision à afficher");
        forecastElements.cartesJour.forEach(function(carte) {
            carte.style.display = "none";
        });
        return;
    }
    
    console.log("Mise à jour des prévisions:", previsions.length, "jours");
    
    forecastElements.cartesJour.forEach(function(carte, index) {
        const prevision = previsions[index];
        
        if (!prevision) {
            carte.style.display = "none";
            return;
        }
        carte.style.display = "";
        
        const jourElement = carte.querySelector(".forecast-day-card-weekday");
        const dateElement = carte.querySelector(".forecast-day-card-date");
        const iconeElement = carte.querySelector(".forecast-day-card-icon");
        const tempMaxElement = carte.querySelector(".forecast-day-card-temperature-max");
        const tempMinElement = carte.querySelector(".forecast-day-card-temperature-min");
        const badgeElement = carte.querySelector(".forecast-day-card-badge");
        const detailHumidite = carte.querySelectorAll(".forecast-day-card-detail-value")[0];
        const detailVent = carte.querySelectorAll(".forecast-day-card-detail-value")[1];
        
        if (jourElement) jourElement.textContent = prevision.jour;
        if (dateElement) dateElement.textContent = prevision.date;
        if (iconeElement) iconeElement.textContent = prevision.icone;
        if (tempMaxElement) tempMaxElement.textContent = `${prevision.tempMax}°C`;
        if (tempMinElement) tempMinElement.textContent = `${prevision.tempMin}°C`;
        
        // Badge "Aujourd'hui"
        if (badgeElement) {
            if (prevision.aujourdhui) {
                badgeElement.style.display = "inline-block";
            } else {
                badgeElement.style.display = "none";
            }
        }
        
        // Mettre à jour les détails humidité et vent
        if (detailHumidite) detailHumidite.textContent = `${prevision.humidite}%`;
        if (detailVent) detailVent.textContent = `${prevision.vent} km/h`;
        
        console.log(`Carte ${index} mise à jour: ${prevision.jour} ${prevision.icone} ${prevision.tempMax}°C/${prevision.tempMin}°C`);
    });
}

/**
 * Met à jour le graphique des tendances
 * @param {Array} previsions - Les prévisions
 */
function mettreAJourGraphique(previsions) {
    if (!forecastElements.chartColonnes || forecastElements.chartColonnes.length === 0) return;
    if (!previsions || previsions.length === 0) {
        forecastElements.chartColonnes.forEach(function(colonne) {
            colonne.style.display = "none";
        });
        return;
    }

    const maxTemp = Math.max.apply(null, previsions.map(function(p) { return p.tempMax; }));
    const minTemp = Math.min.apply(null, previsions.map(function(p) { return p.tempMin; }));
    const plage = Math.max(1, maxTemp - minTemp);

    forecastElements.chartColonnes.forEach(function(colonne, index) {
        const prevision = previsions[index];
        if (!prevision) {
            colonne.style.display = "none";
            return;
        }
        colonne.style.display = "";

        const barMax = colonne.querySelector(".forecast-chart-bar-max");
        const barMin = colonne.querySelector(".forecast-chart-bar-min");
        const label = colonne.querySelector(".forecast-chart-day-label");

        if (barMax) {
            const hauteur = 40 + Math.round(((prevision.tempMax - minTemp) / plage) * 80);
            barMax.style.height = `${hauteur}px`;
        }
        if (barMin) {
            const hauteur = 40 + Math.round(((prevision.tempMin - minTemp) / plage) * 80);
            barMin.style.height = `${hauteur}px`;
        }
        if (label) {
            label.textContent = prevision.jour.slice(0, 3);
        }
    });
}

/**
 * Met à jour l'affichage des prévisions pour une ville
 * @param {string} nomVille - Le nom de la ville (clé dans VILLES_COORDONNEES)
 */
async function mettreAJourPrevisions(nomVille) {
    console.log("Mise à jour prévisions pour:", nomVille);
    afficherChargement();
    
    try {
        let previsions;
        
        // Vérifier si l'API est configurée
        const apiConfiguree = typeof API_CONFIG !== 'undefined' && 
                              API_CONFIG.apiKey && 
                              API_CONFIG.apiKey !== 'VOTRE_CLE_API_ICI';
        
        if (apiConfiguree && typeof getPrevisionsByCity === "function") {
            console.log("Utilisation de l'API OpenWeatherMap pour les prévisions");
            previsions = await getPrevisionsByCity(nomVille);
        } else {
            console.log("API non configurée, utilisation des données fallback");
            previsions = obtenirPrevisionsSimulees();
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        if (!previsions || previsions.length === 0) {
            console.log("Pas de prévisions disponibles, fallback");
            previsions = obtenirPrevisionsSimulees();
        }
        
        const ville = typeof VILLES_COORDONNEES !== 'undefined' ? VILLES_COORDONNEES[nomVille] : null;
        
        // Mettre à jour le résumé
        if (forecastElements.affichageNomVille && ville) {
            forecastElements.affichageNomVille.textContent = `${ville.nom}, ${ville.pays}`;
        }

        if (forecastElements.pageTitle) {
            forecastElements.pageTitle.textContent = previsions.length > 0
                ? `Prévisions sur ${previsions.length} jours`
                : "Prévisions indisponibles";
        }
        
        if (forecastElements.affichageTemperatureMoyenne) {
            forecastElements.affichageTemperatureMoyenne.textContent = `${calculerTemperatureMoyenne(previsions)}°C`;
        }
        
        if (forecastElements.affichageJoursEnsoleilles) {
            forecastElements.affichageJoursEnsoleilles.textContent = `${compterJoursEnsoleilles(previsions)} jours`;
        }
        
        if (forecastElements.affichageJoursPluie) {
            forecastElements.affichageJoursPluie.textContent = `${compterJoursPluie(previsions)} jours`;
        }

        mettreAJourPeriode(previsions);
        
        // Mettre à jour les cartes
        mettreAJourCartesPrevisions(previsions);
        mettreAJourGraphique(previsions);
        
        villeActuelle = nomVille;
        afficherNotification(`Prévisions mises à jour pour ${ville ? ville.nom : nomVille}`);
        
    } catch (error) {
        console.error("Erreur lors du chargement des prévisions:", error);
        afficherNotification("Erreur de chargement des prévisions", "error");
        
        // Fallback
        const previsionsFallback = obtenirPrevisionsSimulees();
        mettreAJourCartesPrevisions(previsionsFallback);
    } finally {
        masquerChargement();
    }
}

/**
 * Gère le changement de ville dans le sélecteur
 * @param {Event} evenement - L'événement de changement
 */
function gererChangementVille(evenement) {
    const nomVille = evenement.target.value;
    console.log("Changement de ville vers:", nomVille);
    mettreAJourPrevisions(nomVille);
}

// --- DONNÉES SIMULÉES (fallback) ---
function obtenirPrevisionsSimulees() {
    const jours = [];
    const icones = ['☀️', '⛅', '🌧️', '⛈️', '⛅', '☀️', '☀️'];

    for (let i = 0; i < 7; i++) {
        const dateObj = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
        const jour = dateObj.toLocaleDateString("fr-FR", { weekday: "long" });
        const date = dateObj.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
        jours.push({ jour: jour.charAt(0).toUpperCase() + jour.slice(1), date: date, dateObj: dateObj.getTime() });
    }
    
    return jours.map(function(info, index) {
        return {
            jour: info.jour,
            date: info.date,
            icone: icones[index],
            tempMax: 28 + Math.floor(Math.random() * 8),
            tempMin: 20 + Math.floor(Math.random() * 8),
            humidite: 50 + Math.floor(Math.random() * 40),
            vent: 8 + Math.floor(Math.random() * 15),
            aujourdhui: index === 0,
            dateObj: info.dateObj
        };
    });
}

// --- INITIALISATION ---
document.addEventListener("DOMContentLoaded", function() {
    console.log("=== Page Prévisions initialisée ===");
    
    // Initialiser les éléments du DOM
    initialiserElementsPrevisions();
    
    console.log("Éléments trouvés:", {
        selectVille: !!forecastElements.selectVille,
        affichageNomVille: !!forecastElements.affichageNomVille,
        cartesJour: forecastElements.cartesJour.length
    });
    
    // Écouteur pour le changement de ville
    if (forecastElements.selectVille) {
        forecastElements.selectVille.addEventListener("change", gererChangementVille);
        console.log("Écouteur ajouté sur le selecteur de ville");
        
        // Initialiser avec la ville sélectionnée
        mettreAJourPrevisions(forecastElements.selectVille.value);
    } else {
        console.warn("Selecteur de ville non trouvé!");
    }
});
