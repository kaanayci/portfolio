# 🎵 Hitster – Timeline Musicale 

**Un jeu de quiz musical interactif codé en Vanilla JS, inspiré du célèbre jeu de société Hitster.**  
Le but : Écouter un extrait, deviner son année de sortie et le placer correctement dans votre timeline musicale personnelle.

---

## 🚀 Fonctionnalités Clés

### 🎮 Gameplay Riche
*   **3 Modes de Difficulté** :
    *   **Facile** : 3 Vies + Indices (nombre de mots dans le titre).
    *   **Normal** : 3 Vies, gameplay classique.
    *   **Difficile** : Mort subite (1 seule erreur fatale).
*   **Score & Record** : Sauvegarde automatique du *High Score* via `localStorage`.
*   **Game Juice** : Animations soignées (flip de carte, screen shake, cœurs brisés), pluie de confettis en cas de succès et particules d'ambiance musicale.

### 🎧 Expérience Audio & Spotify
*   **Lecteur Custom** : Interface audio moderne (style Neon) avec barre de progression interactive.
*   **Import de Playlist** : Scrapping automatique de playlists Spotify publiques (Métadonnées + Preview MP3 30s).
*   **Partage** : Génération d'un QR Code en fin de partie pour retrouver la playlist jouée sur Spotify.

### 📱 Interface Responsive
*   **Drag & Drop Mobile** : Système de glisser-déposer optimisé pour le tactile.
*   **Design Adaptatif** : Interface fluide du mobile au desktop.

---

## 🛠️ Stack Technique

*   **Frontend** : 
    *   **HTML5 / CSS3** (Flexbox, Grid, Keyframe Animations, Variables CSS).
    *   **JavaScript ES6+** (Modules, Async/Await, Web Audio API).
*   **Backend** : 
    *   **Node.js / Express** : Serveur léger pour contourner les CORS et gérer l'API d'import.
*   **Librairies** : 
    *   `qrcode.js` : Génération de QR Code client-side.
    *   `canvas-confetti` : Effets de particules.
*   **Performance** : Système de cache-buster pour le rechargement des JSON.

---

## 🏗️ Architecture du Code

Le projet a été refactorisé en **Modules ES6** pour garantir sa maintenabilité :

| Fichier / Module | Rôle |
|------------------|------|
| `assets/js/game.js` | **Contrôleur Principal** : Orchestre la boucle de jeu et la gestion d'état. |
| `assets/js/modules/audio.js` | **Gestion Audio** : Logique du lecteur, événements et contrôles UI. |
| `assets/js/modules/ui.js` | **Vue** : Manipulation du DOM, rendu de la timeline et des modales. |
| `assets/js/modules/effects.js` | **Game Juice** : Gestion des effets visuels (confettis, particules, feedback). |
| `assets/js/modules/utils.js` | **Utilitaires** : Fonctions pures (Shuffle Fisher-Yates, Formatage). |
| `server.js` | **Proxy API** : Point d'entrée serveur pour l'import de données externes. |

---

## 💡 Installation & Démarrage

1.  **Cloner le projet**
    ```bash
    git clone https://github.com/votre-user/hitster-clone.git
    cd hitster-clone
    ```

2.  **Installer les dépendances**
    ```bash
    npm install
    ```

3.  **Lancer le serveur**
    ```bash
    node server.js
    ```
    👉 Accédez au jeu via `http://localhost:3000`

---

## 📝 Contexte du Projet

Ce projet a été réalisé dans le cadre d'un Portfolio de Développeur Web. Il met en avant :
*   La manipulation avancée du DOM sans framework.
*   La gestion de la programmation asynchrone (Fetch API, Audio).
*   L'intégration d'API tierces (Spotify, Scraping).
*   Le souci du détail UX/UI (animations, feedback utilisateur).

### Challenges Techniques Résolus
*   **Synchronisation Audio** : Gestion des états de lecture à travers les changements de cartes.
*   **Logique de Placement** : Algorithme de validation pour l'insertion dans une timeline dynamique.
*   **Modularité** : Refactoring d'un fichier monolithique vers une architecture modulaire propre.
