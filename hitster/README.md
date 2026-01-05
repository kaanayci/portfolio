# 🎵 Music Quiz – Jeu Web Interactif

Ce projet est un **jeu de quiz musical interactif** développé en HTML, CSS et
JavaScript dans le cadre de mon portfolio d’intégration web 


Inspiré du jeu Hitster, le joueur écoute des extraits musicaux et doit placer correctement la carte sur une timeline. Le jeu repose sur une logique dynamique, une gestion
des données via JSON et une interaction en temps réel avec l’interface.

---

## 🎯 Objectifs du projet

- Créer un jeu web interactif sans framework
- Manipuler des données externes (JSON)
- Gérer de l’audio en JavaScript
- Implémenter une logique de jeu (questions, score, progression)
- Structurer un projet plus complexe avec séparation des responsabilités
- Fournir une documentation utilisateur et technique

---

## 🧱 Architecture du projet

```txt
music-quizz/
├── index.html              # Structure principale du jeu
├── server.js               # Serveur Node.js (développement local)
├── README.md               # Documentation du projet
├── assets/
│   ├── audio/              # Fichiers audio des extraits musicaux
│   ├── css/
│   │   └── style.css       # Styles et responsive design
│   ├── data/
│   │   └── songs.json      # Données du quiz (questions, réponses, audio)
│   └── js/
│       └── game.js         # Logique du jeu
└── docs/
    └── regle-du-jeu.md     # Règles du jeu (documentation utilisateur)

```

--- 
## 🛠️ Technologies utilisées

### HTML5

- Structure sémantique de l’interface
- Organisation claire des éléments du jeu

### CSS3

- Mise en page avec Flexbox
- Responsive design
- Styles adaptés à une interface ludique

### JavaScript (Vanilla)

- Manipulation du DOM
- Gestion des événements utilisateur
- Logique de jeu (score, questions, progression)
- Gestion de l’audio

### JSON

- Stockage des données du quiz (titres, réponses, chemins audio)

---
## ⚙️ Fonctionnement général

Le Music Quiz fonctionne selon les étapes suivantes :
1. Le serveur Node.js sert les fichiers du projet
2. La page index.html affiche l’interface du jeu
3. Le fichier game.js initialise la partie
4. Les données sont chargées depuis songs.json
5. Un extrait audio est joué
6. Le joueur place sa carte
7. Le score et l’état du jeu sont mis à jour dynamiquement

---
## 📄 Rôle des fichiers principaux
### index.html
- Structure du jeu
- Zones d’affichage (Carte actuelle, cartes placées, score)
- Boutons et éléments interactifs

### style.css
- Mise en forme de l'interface
- Responsive design
- cohérence visuelle du jeu

### songs.json
Contient les données issues d'une playlist

Chaque chanson est décrite par :
- le titre de la chanson
- le nom de l'artiste
- l'année de sortie

Exemple de structure :

```json
{
    "title": "One More Time",
    "artist": "Daft Punk",
    "year": 1990
}
```
L’utilisation d’un fichier JSON permet de :
- modifier ou changer la playlist facilement
- ajouter de nouvelles chansons sans modifier le code JavaScript
- séparer les données de la logique du jeu

### game.js

Le fichier game.js centralise toute la logique du jeu de timeline.

Il gère notamment :
- le chargement des données depuis songs.json
- la sélection et la randomisation des chansons
- l’affichage des cartes
- le placement des cartes sur la timeline
- la validation du placement chronologique
- la mise à jour dynamique de l’interface

Cette organisation rend le code plus lisible et plus facilement maintenable.

### server.js

Le fichier server.js met en place un serveur Node.js simple permettant :
- de servir les fichiers du projet localement
- de charger correctement les données JSON
- d’éviter les limitations liées au chargement via file://

---
## 🚀 Lancement du projet
### Prérequis

Node.js installé

### Installation et démarrage
```bash
npm install
node server.js
```

Puis ouvrir le jeu dans un navigateur via l’URL indiquée dans la console

### 📘 Règles du jeu

Les règles détaillées du jeu sont disponibles dans le fichier :

```bash
docs/regle-du-jeu.md
```

---
## ⚠️ Difficultés rencontrées

- Mise en place de la logique de placement chronologique
- Gestion de la timeline dynamique
- Organisation des données issues d’une playlist
- Synchronisation entre les cartes et la timeline
- Installation API

---
## ✅ Solutions apportées

- Centralisation de la logique dans game.js
- Structuration du projet en modules clairs
- Approche progressive de la complexité du jeu
- Installation API grâce à ChatGPT

---
## TO-DO
- Ajout du drag & drop
- Gestion du conflit entre même année
- Ajout de playlists différentes
- Ajout d'un système d'équipe contre équipe
