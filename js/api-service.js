/**
 * MÉTÉO VILLES AFRICAINES - API OPENWEATHERMAP
 * Fonctions pour récupérer les données météo en temps réel
 */

// --- FONCTIONS API ---

/**
 * Récupère la météo actuelle d'une ville par ses coordonnées
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<object>} - Les données météo
 */
async function recupererMeteoActuelle(lat, lon) {
    try {
        const url = `${API_CONFIG.baseUrl}/weather?lat=${lat}&lon=${lon}&units=${API_CONFIG.units}&lang=${API_CONFIG.lang}&appid=${API_CONFIG.apiKey}`;
        console.log("Requête API:", url);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erreur API: ${response.status}`);
        }

        const data = await response.json();
        console.log("Réponse API:", data);
        return transformerDonneesMeteo(data);

    } catch (error) {
        console.error('Erreur lors de la récupération de la météo:', error);
        if (typeof afficherNotification === 'function') {
            afficherNotification(`Erreur API: ${error.message}`, 'error');
        }
        return obtenirDonneesSimulees();
    }
}

/**
 * Récupère les prévisions sur 5 jours (3 heures)
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Array>} - Les prévisions (jours)
 */
async function recupererPrevisions(lat, lon) {
    try {
        const url = `${API_CONFIG.baseUrl}/forecast?lat=${lat}&lon=${lon}&units=${API_CONFIG.units}&lang=${API_CONFIG.lang}&appid=${API_CONFIG.apiKey}`;
        console.log("Requête API prévisions:", url);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erreur API: ${response.status}`);
        }

        const data = await response.json();
        console.log("Réponse API prévisions:", data);
        return transformerPrevisions(data.list, data.city);

    } catch (error) {
        console.error('Erreur lors de la récupération des prévisions:', error);
        if (typeof afficherNotification === 'function') {
            afficherNotification(`Erreur API: ${error.message}`, 'error');
        }
        return obtenirPrevisionsSimulees();
    }
}

/**
 * Transforme les données brutes de l'API en format utilisable
 * @param {object} data - Données brutes de l'API
 * @returns {object} - Données transformées
 */
function transformerDonneesMeteo(data) {
    const condition = data.weather[0].main;
    const iconeCode = data.weather[0].icon;

    return {
        nom: data.name,
        pays: data.sys.country,
        temperature: Math.round(data.main.temp),
        temperatureMax: Math.round(data.main.temp_max),
        temperatureMin: Math.round(data.main.temp_min),
        humidite: data.main.humidity,
        vent: Math.round(data.wind.speed * 3.6), // Conversion m/s -> km/h
        condition: CONDITIONS_METEO[condition] || condition,
        icone: ICONES_METEO[iconeCode] || '🌡️',
        pression: data.main.pressure,
        visibilite: data.visibility / 1000,
        leverSoleil: new Date(data.sys.sunrise * 1000),
        coucherSoleil: new Date(data.sys.sunset * 1000)
    };
}

/**
 * Transforme les prévisions brutes en format utilisable
 * @param {Array} list - Liste des prévisions brutes
 * @param {object} city - Infos ville (timezone, etc.)
 * @returns {Array} - Prévisions transformées (jusqu'à 7 jours)
 */
function transformerPrevisions(list, city) {
    // Regrouper par jour local de la ville et calculer min/max sur la journée
    const previsionsParJour = {};
    const timezoneOffset = city && typeof city.timezone === "number" ? city.timezone : 0;
    const formatterJour = new Intl.DateTimeFormat("fr-FR", { weekday: "long", timeZone: "UTC" });
    const formatterDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });
    const aujourdHuiKey = new Date(Date.now() + timezoneOffset * 1000).toISOString().slice(0, 10);

    list.forEach(function(prevision) {
        const localMs = (prevision.dt + timezoneOffset) * 1000;
        const dateObj = new Date(localMs);
        const jourKey = dateObj.toISOString().slice(0, 10);
        const heureLocale = dateObj.getUTCHours();

        if (!previsionsParJour[jourKey]) {
            previsionsParJour[jourKey] = {
                dateObj: localMs,
                tempMax: -Infinity,
                tempMin: Infinity,
                humiditeSomme: 0,
                ventSomme: 0,
                points: 0,
                icone: "🌡️",
                condition: "",
                distanceMidi: Infinity
            };
        }

        const jour = previsionsParJour[jourKey];
        const tempMin = typeof prevision.main.temp_min === "number" ? prevision.main.temp_min : prevision.main.temp;
        const tempMax = typeof prevision.main.temp_max === "number" ? prevision.main.temp_max : prevision.main.temp;

        jour.tempMin = Math.min(jour.tempMin, tempMin);
        jour.tempMax = Math.max(jour.tempMax, tempMax);
        jour.humiditeSomme += prevision.main.humidity;
        jour.ventSomme += prevision.wind.speed * 3.6;
        jour.points += 1;

        const distanceMidi = Math.abs(heureLocale - 12);
        if (distanceMidi < jour.distanceMidi) {
            const iconeCode = prevision.weather[0].icon;
            const condition = prevision.weather[0].main;
            jour.icone = ICONES_METEO[iconeCode] || "🌡️";
            jour.condition = CONDITIONS_METEO[condition] || condition;
            jour.distanceMidi = distanceMidi;
        }
    });

    return Object.entries(previsionsParJour)
        .sort(function(a, b) {
            return a[1].dateObj - b[1].dateObj;
        })
        .slice(0, 7)
        .map(function(entry) {
            const jourKey = entry[0];
            const prev = entry[1];
            const dateObj = new Date(prev.dateObj);
            const jourTexte = formatterJour.format(dateObj);
            const dateTexte = formatterDate.format(dateObj);

            return {
                jour: jourTexte.charAt(0).toUpperCase() + jourTexte.slice(1),
                date: dateTexte,
                icone: prev.icone,
                condition: prev.condition,
                tempMax: Math.round(prev.tempMax),
                tempMin: Math.round(prev.tempMin),
                humidite: Math.round(prev.humiditeSomme / prev.points),
                vent: Math.round(prev.ventSomme / prev.points),
                aujourdhui: jourKey === aujourdHuiKey,
                dateObj: prev.dateObj
            };
        });
}

/**
 * Récupère les données météo d'une ville par son identifiant
 * @param {string} villeId - L'identifiant de la ville (ex: "dakar")
 * @returns {Promise<object>} - Les données météo
 */
async function getWeatherByCity(villeId) {
    const ville = VILLES_COORDONNEES[villeId];

    if (!ville) {
        console.error(`Ville "${villeId}" non trouvée dans les coordonnées`);
        return null;
    }

    return await recupererMeteoActuelle(ville.lat, ville.lon);
}

/**
 * Récupère les prévisions d'une ville
 * @param {string} villeId - L'identifiant de la ville
 * @returns {Promise<Array>} - Les prévisions
 */
async function getPrevisionsByCity(villeId) {
    const ville = VILLES_COORDONNEES[villeId];

    if (!ville) {
        console.error(`Ville "${villeId}" non trouvée dans les coordonnées`);
        return [];
    }

    return await recupererPrevisions(ville.lat, ville.lon);
}

// --- DONNÉES SIMULÉES (fallback si API non configurée) ---

function obtenirDonneesSimulees() {
    return {
        nom: "Dakar",
        pays: "Sénégal",
        temperature: 28,
        temperatureMax: 32,
        temperatureMin: 24,
        humidite: 65,
        vent: 15,
        condition: "Ensoleillé",
        icone: "☀️"
    };
}

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

// --- EXPORTS GLOBAUX ---
window.getWeatherByCity = getWeatherByCity;
window.getPrevisionsByCity = getPrevisionsByCity;
window.VILLES_COORDONNEES = VILLES_COORDONNEES;

console.log("API Service chargé - OpenWeatherMap prêt");
