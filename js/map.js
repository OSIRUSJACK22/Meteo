/**
 * MÉTÉO VILLES AFRICAINES - CARTE LEAFLET
 * Fonctionnalités spécifiques à la carte interactive avec API temps réel
 */

// --- ÉLÉMENTS DU DOM ---
let mapElements = {};
let carteLeaflet = null;
let marqueursVilles = {};

// --- INITIALISATION DES ÉLÉMENTS ---
function initialiserElementsCarte() {
    mapElements = {
        conteneurCarte: document.getElementById("map-africa-main-container"),
        popupInfos: document.querySelector(".map-popup-info-container"),
        popupNomVille: document.querySelector(".map-popup-city-name"),
        popupTemperature: document.querySelector(".map-popup-temperature-value"),
        popupIcone: document.querySelector(".map-popup-weather-icon"),
        popupHumidite: document.querySelectorAll(".map-popup-detail-value")[0],
        popupVent: document.querySelectorAll(".map-popup-detail-value")[1],
        popupBoutonFermer: document.querySelector(".map-popup-close-button"),
        boutonsFiltre: document.querySelectorAll(".map-filter-button"),
        barreRecherche: document.querySelector(".map-search-input"),
        boutonRecherche: document.querySelector(".map-search-button")
    };
}

// --- INITIALISATION DE LA CARTE ---
function initialiserCarteLeaflet() {
    if (!mapElements.conteneurCarte) {
        console.error("Conteneur de carte non trouvé");
        return;
    }
    
    // Créer la carte centrée sur l'Afrique
    carteLeaflet = L.map('map-africa-main-container', {
        center: [5, 20], // Centre de l'Afrique
        zoom: 4,
        minZoom: 3,
        maxZoom: 8,
        zoomControl: true
    });
    
    // Ajouter le fond de carte (style clair/white)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(carteLeaflet);
    
    console.log("Carte Leaflet initialisée");
    
    // Ajouter les marqueurs des villes
    ajouterMarqueursVilles();
}

// --- AJOUT DES MARQUEURS ---
async function ajouterMarqueursVilles() {
    if (!VILLES_COORDONNEES) {
        console.error("VILLES_COORDONNEES non disponible");
        return;
    }
    
    for (const [cle, ville] of Object.entries(VILLES_COORDONNEES)) {
        try {
            // Créer une icône personnalisée
            const iconePersonnalisee = L.divIcon({
                className: 'custom-marker-container',
                html: `<div class="custom-marker" style="
                    background: #38BDF8;
                    border: 3px solid #F97316;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    box-shadow: 0 0 20px rgba(56, 189, 248, 0.6);
                    animation: map-city-pin-pulse-animation 2s infinite;
                "></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            
            // Créer le marqueur
            const marqueur = L.marker([ville.lat, ville.lon], { icon: iconePersonnalisee })
                .addTo(carteLeaflet);
            
            // Ajouter un popup temporaire avec le nom de la ville
            marqueur.bindPopup(`<strong>${ville.nom}</strong><br>${ville.pays}`);
            
            // Ajouter l'événement de clic
            marqueur.on('click', function() {
                console.log("Clic sur marqueur:", cle);
                chargerEtAfficherPopup(cle, marqueur);
            });
            
            // Stocker le marqueur
            marqueursVilles[cle] = marqueur;
            
        } catch (error) {
            console.error("Erreur lors de l'ajout du marqueur pour", ville.nom, error);
        }
    }
    
    console.log("Marqueurs ajoutés:", Object.keys(marqueursVilles).length);
}

// --- AFFICHAGE DU POPUP ---
function afficherPopupVille(donneesVille, marqueur) {
    if (!donneesVille) {
        afficherNotification("Données non disponibles", "error");
        return;
    }
    
    console.log("Affichage popup pour:", donneesVille);
    
    // Mettre à jour le popup Leaflet du marqueur
    if (marqueur) {
        const contenuPopup = `
            <div style="text-align: center;">
                <h3 style="color: #38BDF8; margin-bottom: 10px; font-family: 'Space Grotesk', sans-serif;">
                    ${donneesVille.nom}, ${donneesVille.pays}
                </h3>
                <div style="font-size: 3rem; margin: 10px 0;">${donneesVille.icone}</div>
                <div style="font-size: 2.5rem; color: #38BDF8; font-weight: bold; font-family: 'Space Grotesk', sans-serif;">
                    ${donneesVille.temperature}°C
                </div>
                <p style="color: #B0D4E8; margin: 5px 0;">${donneesVille.condition}</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
                    <div style="background: rgba(56, 189, 248, 0.1); padding: 8px; border-radius: 5px;">
                        <span style="color: #B0D4E8; font-size: 0.8rem;">💧 Humidité</span><br>
                        <span style="color: #38BDF8; font-weight: bold;">${donneesVille.humidite}%</span>
                    </div>
                    <div style="background: rgba(56, 189, 248, 0.1); padding: 8px; border-radius: 5px;">
                        <span style="color: #B0D4E8; font-size: 0.8rem;">💨 Vent</span><br>
                        <span style="color: #38BDF8; font-weight: bold;">${donneesVille.vent} km/h</span>
                    </div>
                </div>
                <div style="margin-top: 15px;">
                    <span style="color: #F97316; font-size: 0.9rem;">
                        Max: ${donneesVille.temperatureMax}°C | Min: ${donneesVille.temperatureMin}°C
                    </span>
                </div>
                <a href="dashboard.html" style="
                    display: block;
                    background: #38BDF8;
                    color: #0E1628;
                    text-align: center;
                    padding: 8px;
                    border-radius: 5px;
                    margin-top: 15px;
                    font-weight: bold;
                    text-decoration: none;
                ">Voir le dashboard</a>
            </div>
        `;
        
        marqueur.setPopupContent(contenuPopup);
        marqueur.openPopup();
    }
    
    // Mettre à jour aussi le popup HTML personnalisé si nécessaire
    if (mapElements.popupNomVille) {
        mapElements.popupNomVille.textContent = donneesVille.nom;
    }
    if (mapElements.popupTemperature) {
        mapElements.popupTemperature.textContent = `${donneesVille.temperature}°C`;
    }
    if (mapElements.popupIcone) {
        mapElements.popupIcone.textContent = donneesVille.icone;
    }
    if (mapElements.popupHumidite) {
        mapElements.popupHumidite.textContent = `${donneesVille.humidite}%`;
    }
    if (mapElements.popupVent) {
        mapElements.popupVent.textContent = `${donneesVille.vent} km/h`;
    }
    
    afficherNotification(`Météo affichée pour ${donneesVille.nom}`);
}

// --- CHARGEMENT DES DONNÉES ---
async function chargerEtAfficherPopup(nomVille, marqueur) {
    try {
        let donneesVille;
        
        const apiConfiguree = typeof API_CONFIG !== 'undefined' && 
                              API_CONFIG.apiKey && 
                              API_CONFIG.apiKey !== 'VOTRE_CLE_API_ICI';
        
        if (apiConfiguree && typeof getWeatherByCity === "function") {
            donneesVille = await getWeatherByCity(nomVille);
        } else {
            donneesVille = getWeatherByCitySync(nomVille);
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        if (!donneesVille) {
            donneesVille = getWeatherByCitySync(nomVille);
        }
        
        afficherPopupVille(donneesVille, marqueur);
        
    } catch (error) {
        console.error("Erreur lors du chargement:", error);
        const donneesFallback = getWeatherByCitySync(nomVille);
        if (donneesFallback) {
            afficherPopupVille(donneesFallback, marqueur);
        }
    }
}

// --- RECHERCHE ---
function rechercherVille() {
    const villeRecherchee = mapElements.barreRecherche ? mapElements.barreRecherche.value.trim().toLowerCase() : "";
    
    if (!villeRecherchee) {
        afficherNotification("Veuillez entrer un nom de ville", "warning");
        return;
    }
    
    // Chercher dans les marqueurs
    for (const [cle, ville] of Object.entries(VILLES_COORDONNEES || {})) {
        if (ville.nom.toLowerCase().includes(villeRecherchee) || cle.includes(villeRecherchee)) {
            const marqueur = marqueursVilles[cle];
            if (marqueur) {
                // Centrer la carte sur la ville
                carteLeaflet.flyTo([ville.lat, ville.lon], 6, {
                    animate: true,
                    duration: 1.5
                });
                
                // Charger et afficher les données
                chargerEtAfficherPopup(cle, marqueur);
                afficherNotification(`Ville "${ville.nom}" trouvée`);
            }
            return;
        }
    }
    
    afficherNotification(`Ville "${villeRecherchee}" non trouvée`, "error");
}

// --- FILTRAGE ---
function filtrerVillesParRegion(region) {
    console.log("Filtrage par région:", region);
    
    // Régions définies par des plages de latitude/longitude
    const regions = {
        'toutes': () => true,
        'afrique de l\'ouest': (v) => v.lon < 10 && v.lat > 4 && v.lat < 20,
        'afrique du nord': (v) => v.lat > 20,
        'afrique centrale': (v) => v.lon >= 10 && v.lon < 25 && v.lat > -10 && v.lat < 10,
        'afrique de l\'est': (v) => v.lon >= 25,
        'afrique australe': (v) => v.lat < -10
    };
    
    const filtre = regions[region] || regions['toutes'];
    
    for (const [cle, ville] of Object.entries(VILLES_COORDONNEES || {})) {
        const marqueur = marqueursVilles[cle];
        if (marqueur) {
            if (filtre(ville)) {
                marqueur.setOpacity(1);
            } else {
                marqueur.setOpacity(0.3);
            }
        }
    }
}

// --- INITIALISATION ---
document.addEventListener("DOMContentLoaded", function() {
    console.log("=== Carte Leaflet initialisée ===");
    
    // Initialiser les éléments du DOM
    initialiserElementsCarte();
    
    // Initialiser la carte Leaflet
    initialiserCarteLeaflet();
    
    // Écouteur pour le bouton de fermeture du popup HTML
    if (mapElements.popupBoutonFermer) {
        mapElements.popupBoutonFermer.addEventListener("click", function() {
            if (mapElements.popupInfos) {
                mapElements.popupInfos.style.display = "none";
            }
        });
    }
    
    // Écouteurs pour les boutons de filtre
    mapElements.boutonsFiltre.forEach(function(bouton) {
        bouton.addEventListener("click", function() {
            mapElements.boutonsFiltre.forEach(function(b) {
                b.classList.remove("map-filter-button-active");
            });
            bouton.classList.add("map-filter-button-active");
            
            const region = bouton.textContent.toLowerCase();
            filtrerVillesParRegion(region);
        });
    });
    
    // Écouteur pour la recherche
    if (mapElements.boutonRecherche) {
        mapElements.boutonRecherche.addEventListener("click", rechercherVille);
    }
    
    // Touche Entrée pour la recherche
    if (mapElements.barreRecherche) {
        mapElements.barreRecherche.addEventListener("keypress", function(e) {
            if (e.key === "Enter") {
                rechercherVille();
            }
        });
    }
});
