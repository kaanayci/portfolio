# PWA & Mode Hors-Ligne (Vite PWA)

## Description
L'application est configurée comme une **Progressive Web App** complète, pouvant être installée sur l'écran d'accueil d'un smartphone Android ou iOS.

## Plugin Vite PWA
Nous utilisons `vite-plugin-pwa` pour automatiser la génération des assets PWA :
*   **Manifest** : `manifest.webmanifest` généré automatiquement (Nom, Icônes, Couleurs).
*   **Service Worker** : Stratégie `generateSW` pour pré-cacher l'application shell.

## Expérience Utilisateur
Un composant personnalisé `InstallPrompt.vue` détecte l'événement navigateur `beforeinstallprompt`.
*   Si l'app n'est pas installée : Une pop-up "Installer l'application" apparaît en bas d'écran.
*   Si l'utilisateur accepte : L'installation native est déclenchée.

Cela permet de fidéliser les clients en occupant une place permanente sur leur appareil, sans passer par les App Stores (Apple/Google).

## Exemple de code
![alt text](pwa-offline.png)
