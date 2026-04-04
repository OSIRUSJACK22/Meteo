# 🌡️ Météo Villes Africaines

Dashboard météo interactif pour les principales villes d'Afrique.

## 📋 Fonctionnalités

- **Dashboard** : Tableau de bord avec températures, vent, humidité en temps réel
- **Carte Interactive** : Carte de l'Afrique avec épingles des villes
- **Prévisions 7 jours** : Prévisions météo détaillées sur une semaine
- **Comparaison** : Comparez les conditions entre deux villes
- **Données en temps réel** : Utilisation de l'API OpenWeatherMap

## 🚀 Configuration de l'API

### Étape 1 : Obtenir une clé API gratuite

1. Rendez-vous sur [OpenWeatherMap](https://openweathermap.org/api)
2. Cliquez sur **"Sign Up"** et créez un compte gratuit
3. Après connexion, allez dans **"API keys"** dans votre profil
4. Copiez votre clé API (une chaîne de 32 caractères)

### Étape 2 : Configurer la clé dans le projet

1. Ouvrez le fichier `js/api-config.js`
2. Remplacez `VOTRE_CLE_API_ICI` par votre vraie clé API :

```javascript
const API_CONFIG = {
    apiKey: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', // Votre clé ici
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    units: 'metric',
    lang: 'fr'
};
```

### Étape 3 : Tester l'application

Ouvrez `index.html` dans votre navigateur et vérifiez que les données météo s'affichent correctement.

## 📁 Structure du projet

```
météo/
├── index.html              # Page d'accueil
├── dashboard.html          # Tableau de bord météo
├── map.html                # Carte interactive
├── forecast.html           # Prévisions 7 jours
├── compare.html            # Comparaison de villes
├── about.html              # Page À propos
├── css/
│   ├── style-accueil.css
│   ├── style-dashboard.css
│   ├── style-map.css
│   ├── style-forecast.css
│   ├── style-compare.css
│   └── style-about.css
├── js/
│   ├── api-config.js       # Configuration API
│   ├── api-service.js      # Fonctions API OpenWeatherMap
│   ├── main.js             # Fonctions partagées
│   ├── dashboard.js        # Logique du dashboard
│   ├── map.js              # Logique de la carte
│   ├── forecast.js         # Logique des prévisions
│   └── compare.js          # Logique de comparaison
└── images/                 # Images des villes
```

## 🎨 Charte Graphique

### Couleurs officielles

| Couleur | Code | Usage |
|---------|------|-------|
| Bleu nuit | `#0E1628` | Fond principal |
| Bleu foncé | `#1E3A5F` | Éléments secondaires |
| Cyan ciel | `#38BDF8` | Accentuation, icônes |
| Orange soleil | `#F97316` | Alertes, données chaudes |

### Typographie

- **Titres** : Space Grotesk 700
- **Corps** : DM Sans 400

## 🌍 Villes disponibles

- Dakar (Sénégal)
- Abidjan (Côte d'Ivoire)
- Casablanca (Maroc)
- Le Cap (Afrique du Sud)
- Lagos (Nigeria)
- Nairobi (Kenya)
- Le Caire (Égypte)
- Tunis (Tunisie)
- Porto-Novo (Bénin)
- Cotonou (Bénin)

## 🔧 Fallback (mode hors-ligne)

Si l'API n'est pas configurée, l'application utilise des données simulées pour fonctionner en mode démonstration.

## 📄 Licence

Projet éducatif - Météo Villes Africaines © 2026
