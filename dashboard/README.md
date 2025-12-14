# Dashboard – Application Web

Ce projet est un **dashboard web interactif** développé en HTML, CSS et
JavaScript dans le cadre de mon portfolio d’intégration web.

Il a pour objectif de présenter des données de manière claire et dynamique
au sein d’une interface responsive, tout en respectant une architecture
simple et maintenable.

---

## 🎯 Objectifs du projet

- Créer un tableau de bord dynamique sans framework
- Séparer clairement la structure, le style et la logique
- Charger et afficher des données de manière dynamique
- Mettre en place une architecture proche d’un projet professionnel
- Utiliser un serveur Node.js pour le développement local

---

## 🧱 Architecture du projet

```txt
dashboard/
├── index.html              # Structure du dashboard
├── server.js               # Serveur Node.js (développement local)
├── README.md               # Documentation du projet
└── assets/
    ├── css/
    │   └── style.css       # Styles et responsive design
    └── js/
        └── app.js          # Logique applicative du dashboard

````
---

## 🛠️ Technologie sutilisées

HTML5

  - Structure sémantique du contenu
  - Organisation claire de l’interface$
  
CSS3

  - Mise en page avec Flexbox
  
  - Responsive design
  
  - Styles organisés et lisibles

JavaScript

  - Manipulation du DOM
  - Gestion des événements
  - Traitement et affichage dynamique des données

---

## ⚙️ Fonctionnement général

Le fonctionnement du dashboard repose sur les étapes suivantes :

 1.  Le serveur Node.js sert les fichiers du projet
 2.  La page index.html fournit la structure de l’interface
 3.  Le fichier app.js initialise l’application au chargement
 4.  Les données sont traitées et affichées dynamiquement
 5.  L’interface se met à jour en fonction des interactions utilisateur

---

## 📄 Rôle des fichiers principaux
### index.html

Contient la structure du dashboard :
- zones d’affichage des données
- éléments interactifs (boutons, filtres, etc.)

### style.css

Gère : 
- la mise en page
- le responsive design
- la cohérence visuelle de l’interface

### app.js

Le fichier app.js est le point d’entrée JavaScript du projet.
Il centralise la logique applicative du dashboard.

Ses responsabilités principales sont :
- l’initialisation du dashboard au chargement de la page
- la récupération et le traitement des données
- la mise à jour dynamique de l’interface (DOM)
- la gestion des interactions utilisateur

Ce choix permet une meilleure lisibilité du code et respecte les bonnes
pratiques du développement web.

### server.js

Le fichier server.js met en place un serveur Node.js simple permettant :
- de servir les fichiers du projet localement
- d’éviter les limitations liées au chargement via file://
- de simuler un environnement proche de la production


---
## 🚀 Lancement du projet
### Prérequis

- Node.js installé sur la machine

### Installation et démarrage

```txt
npm install
node server.js

```
Puis ouvrir le projet dans un navigateur via l’URL indiquée dans la console
