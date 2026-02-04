# Veille Technologique 2025-2026

## 1. PWA : Le déclin du "Natif" ?
La frontière entre sites web et applications mobiles s'efface.
*   **Tendance** : L'API "File System Access" et les "Push Notifications" (iOS 16.4+) permettent aux PWA de faire presqu'aussi bien que les apps natives.
*   **Dans mes projets** : J'ai utilisé `vite-plugin-pwa` pour rendre mon application Restaurant installable. Cela évite de payer 99$/an pour l'App Store Apple, tout en gardant une présence sur l'écran d'accueil.

## 2. Frameworks : La "Signal" Revolution
Après les Hooks (React) et la Composition API (Vue 3), la nouvelle tendance est aux "Signals" (SolidJS, Angular, et maintenant Vue 3.4+).
*   **Concept** : Une réactivité ultra-fine qui ne met à jour QUE le texte qui change, sans re-rendre tout le composant.
*   **Impact** : Des performances bien meilleures pour les dashboards complexes (comme mon SwissMétéo).

## 3. CSS "Natif" vs Tailwind
Tailwind CSS domine, mais CSS rattrape son retard.
*   **Nouveautés** : Le "Nesting" CSS est maintenant natif (plus besoin de Sass !), et les `Container Queries` permettent de faire du responsive par composant et non plus par page.
*   **Réflexion** : Pour mon projet Restaurant, j'ai utilisé Tailwind pour la vitesse, mais pour le Dashboard, j'ai utilisé du CSS standard pour bien comprendre les bases (Grid/Flexbox).

## 4. IA dans le développement (Copilot, ChatGPT)
L'intégration de l'IA dans l'IDE n'est plus un gadget mais un standard.
*   **Usage responsable** : L'enjeu n'est plus de "coder" mais "d'architecturer" et de "relire". Dans ce portfolio, l'IA m'a aidé à générer des données de test (JSON) et à débugger des REGEX complexes, me laissant me concentrer sur la logique métier.
