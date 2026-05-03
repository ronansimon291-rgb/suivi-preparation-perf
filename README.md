# Suivi Préparation Ironman 2027

Application web de suivi d'entraînement vélo pour Ironman 2027 - **No Pain, No Gain** : Repoussez vos limites !

## 🚀 Démarrage rapide

1. Ouvrez `plan_entrainement_ironman.html` dans votre navigateur
2. Connectez-vous avec votre compte

## 👥 Comptes utilisateurs

### Administrateur (Entraîneur)
- **Identifiant** : `coach`
- **Mot de passe** : `trainadmin`
- **Rôle** : Gestion des athlètes et des séances

### Athlètes par défaut
- **Camille** : `camille` / `velo2027`
- **Julien** : `julien` / `force37`

### Création de compte athlète
1. Cliquez sur `Créer un compte` dans l'écran de connexion
2. Remplissez le formulaire
3. Connectez-vous avec vos identifiants

## 📊 Fonctionnalités

### Pour l'administrateur
- **Déposer des séances** : Importez des programmes d'entraînement en JSON ou CSV
- **Voir les comptes athlètes** : Liste des athlètes enregistrés
- **Suivre les performances** : Tableau de bord global avec toutes les données
- **Assigner des séances** : Attribuez des programmes personnalisés

### Pour les athlètes
- **Voir mes séances** : Programme hebdomadaire assigné
- **Déposer une performance** : Saisie manuelle ou via photo Strava
- **Suivre ma progression** : Graphiques personnels

## 📁 Formats d'import de séances

### JSON
```json
{
  "athlete": "camille",
  "sessions": [
    {
      "day": "Lundi",
      "title": "Repos et Mobilité",
      "duration": "30 min",
      "intensity": "Z0",
      "workout": "Étirements légers",
      "description": "Focus sur la récupération"
    }
  ]
}
```

### CSV
```csv
athlete,day,title,duration,intensity,workout,description
camille,Lundi,Repos et Mobilité,30 min,Z0,"Étirements légers","Focus sur la récupération"
```

## 🎯 Programme hebdomadaire par défaut

| Jour | Séance | Durée | Intensité |
|------|--------|-------|-----------|
| Lundi | Repos et Mobilité | 30 min | Z0 |
| Mardi | Intervalles Haute Intensité | 1h15 | Z4/Z5 |
| Mercredi | Repos Complet | 0 min | - |
| Jeudi | Travail au Seuil | 1h30 | Z3/Z4 |
| Vendredi | Repos ou Stretching | 20 min | Z0 |
| Samedi | Sortie Longue Spécifique | 3h30-4h00 | Z2/Z3 |
| Dimanche | Récupération Active | 1h00 | Z1 |

## 📸 Import de performances via photo Strava

1. Prenez une photo de votre écran Strava
2. Nommez le fichier avec : `distance_km_temps_min.jpg`
   - Exemple : `25km_120min.jpg`
3. Importez dans le formulaire "Photo Strava"
4. L'application calcule automatiquement la vitesse moyenne

## 📈 Tableaux de bord

### Administrateur
- Charge d'entraînement hebdomadaire
- Progression globale des athlètes
- Statistiques : nombre d'athlètes, meilleures vitesses

### Athlète
- Mes performances personnelles
- Progression individuelle
- Séances assignées

## 🔧 Technologies

- **HTML5** : Structure
- **CSS3** : Design sportif et responsive
- **JavaScript** : Logique client, graphiques Canvas, stockage local

## 📱 Responsive

Compatible iPad et iPhone avec design adaptatif.

## 💾 Stockage

Toutes les données sont sauvegardées localement dans votre navigateur :
- Comptes utilisateurs
- Performances
- Programmes assignés

## 🏁 Objectif Ironman 2027

**No Pain, No Gain** - Chaque entraînement vous rapproche de votre meilleur niveau. Préparez-vous à repousser vos limites !</content>
<parameter name="filePath">/Users/macderonan/Desktop/README.md