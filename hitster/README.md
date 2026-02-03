# 🎵 Hitster – Timeline Musicale 

**Un jeu de quiz musical interactif codé en Vanilla JS, inspiré du célèbre jeu de société Hitster.**  
Le but : Écouter un extrait, deviner son année de sortie et le placer correctement dans votre timeline musicale personnelle.

---

## 🚀 Fonctionnalités Clés

### 🎮 Gameplay Riche
*   **3 Modes de Difficulté** :
    *   **Facile** : 3 Vies + Indices (nombre de mots dans le titre).
    *   **Normal** : 3 Vies, gameplay "vanilla".
    *   **Difficile** : Mort subite (1 seule erreur fatale).
*   **Score & Record** : Sauvegarde automatique du *High Score* via `localStorage`.
*   **Animations Immersives** : Retournement des cartes, tremblement d'écran en cas de dégâts, cœurs qui se brisent, **pluie de confettis** et ambiance de fond (particules notes de musique).

### 🎧 Expérience Audio & Spotify
*   **Lecteur Custom** : Interface de lecteur audio stylisée (Neon) avec barre de progression interactive.
*   **Import de Playlist** : Récupération automatique des morceaux (titre, artiste, preview MP3, année) depuis n'importe quelle playlist publique Spotify.
*   **QR Code de fin** : Partage de la playlist jouée via un QR Code généré dynamiquement.
*   **Feedback Audio** : Loader visuel pendant le chargement des extraits.

### 📱 Interface Responsive
*   **Drag & Drop** : Glisser la carte active directement sur la timeline.
*   **Mobile Friendly** : Zones de clic élargies pour le placement tactile sur smartphone.

---

## 🛠️ Stack Technique

*   **Frontend** : HTML5, CSS3 (Animations, Flexbox/Grid), JavaScript ES6+ (Modules, Async/Await).
*   **Backend** : Node.js (Express) pour le scraping des métadonnées Spotify (via Puppeteer/Cheerio simulé ou API).
*   **Librairies** : `qrcode.js` (génération QR), `canvas-confetti` (effets visuels).
*   **Outils** : Système de *cache-buster* pour le JSON, gestionnaire de playlist personnalisé.

---

## 📷 Aperçu

### Menu Principal
*Importez votre playlist ou jouez avec la sélection par défaut.*

### En Jeu
*Écoutez l'extrait, observez l'indice (mode facile) et glissez la carte.*

### Game Over
*Visualisez votre score, scannez le QR Code pour retrouver les titres sur Spotify.*

---

## 💡 Installation Locale

1.  **Cloner le projet**
    ```bash
    git clone https://github.com/votre-repo/portfolio.git
    cd portfolio/hitster
    ```

2.  **Installer les dépendances Server (pour l'import Spotify)**
    ```bash
    npm install
    ```

3.  **Lancer le projet**
    ```bash
    node server.js
    ```
    Accédez à `http://localhost:3000`

---

## 🏗️ Architecture du Code

Le projet a été refactorisé en **Modules ES6** pour garantir maintenabilité et évolutivité :

*   `assets/js/game.js` : Point d'entrée et Orchestrateur (Game Loop, State Management).
*   `assets/js/modules/` :
    *   `audio.js` : Gestion du lecteur audio custom (Play, Pause, Progress Bar).
    *   `ui.js` : Gestion du DOM, des affichages de score et des modales.
    *   `effects.js` : Moteur de "Game Juice" (Confettis, Shake, Particules).
    *   `utils.js` : Fonctions utilitaires pures (Shuffle, Time Format).
*   `server.js` : Proxy API pour contourner les CORS et récupérer les données Spotify.

---

*Projet réalisé dans le cadre d'un Portfolio Développeur Web.*

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
