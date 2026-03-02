# Veille Technologique 2025-2026

## 1. PWA : Le déclin du "Natif" ?
La frontière entre sites web et applications mobiles s'efface.
*   **Tendance** : L'API "File System Access" et les "Push Notifications" (iOS 16.4+) permettent aux PWA de faire presqu'aussi bien que les apps natives. En 2025, Microsoft a ajouté les PWA dans le Microsoft Store, et Google continue de pousser l'installation depuis Chrome.
*   **Avantages** : Un seul code pour web + mobile + desktop. Pas besoin de passer par les stores (ni de payer les 99$/an Apple). Mises à jour instantanées (pas de validation store).
*   **Limites** : Les PWA n'ont toujours pas accès au Bluetooth, NFC ou aux capteurs avancés sur iOS. Safari reste en retard par rapport à Chrome pour le support des fonctionnalités PWA.
*   **Dans mes projets** : J'ai utilisé `vite-plugin-pwa` pour rendre mon application Restaurant installable, et un Service Worker manuel dans le Dashboard (cache Stale-While-Revalidate). La comparaison entre les deux approches est documentée dans ma fiche [pwa-offline.md](../restaurant/public/docs/pwa-offline.md).

**Sources :** [web.dev – What are PWAs](https://web.dev/explore/progressive-web-apps), [MDN – Progressive Web Apps](https://developer.mozilla.org/fr/docs/Web/Progressive_web_apps)

---

## 2. Frameworks : La "Signal" Revolution
Après les Hooks (React) et la Composition API (Vue 3), la nouvelle tendance est aux "Signals" (SolidJS, Angular 17+, Preact, et bientôt Vue via `alien-signals`).
*   **Concept** : Une réactivité ultra-fine qui ne met à jour QUE le nœud DOM qui change, sans re-rendre tout le composant. Contrairement à React qui utilise un Virtual DOM pour diff-er l'arbre entier, les Signals ciblent directement l'élément modifié.
*   **Impact** : Des performances significativement meilleures pour les interfaces à forte mise à jour (dashboards, données temps réel). Le JS Framework Benchmark 2025 montre SolidJS 2x plus rapide que React sur les opérations de mise à jour partielle.
*   **Risques** : Fragmentation de l'écosystème. Chaque framework implémente sa propre version des Signals, ce qui complique la portabilité du code et des compétences.
*   **Lien avec mes projets** : Mon Dashboard SwissMétéo met à jour la météo en temps réel. Avec des Signals, je pourrais mettre à jour uniquement la température affichée sans re-rendre toute la carte météo. C'est un gain potentiel pour les applications de monitoring.

**Sources :** [Angular Signals RFC](https://github.com/angular/angular/discussions/49685), [SolidJS](https://www.solidjs.com/), [JS Framework Benchmark](https://krausest.github.io/js-framework-benchmark/)

---

## 3. CSS "Natif" vs Tailwind
Tailwind CSS domine le marché (State of CSS 2024 : 78% de satisfaction), mais CSS standard rattrape rapidement son retard.
*   **Nouveautés CSS natives** :
    *   **Nesting** : Écrire des sélecteurs imbriqués directement en CSS, sans Sass ni PostCSS. Supporté par tous les navigateurs modernes depuis 2024.
    *   **Container Queries** (`@container`) : Rendre un composant responsive par rapport à son conteneur parent, pas la fenêtre. Idéal pour les design systems et les composants réutilisables.
    *   **`:has()` selector** : Le « sélecteur parent » tant attendu. Permet de styler un parent en fonction de ses enfants (`form:has(input:invalid) { border: red }`).
*   **Avantages de Tailwind** : Rapidité de prototypage, cohérence d'équipe, purge automatique du CSS inutilisé. Mais crée une dépendance à un outil et des classes HTML parfois illisibles.
*   **Réflexion** : Pour mon projet Restaurant, j'ai utilisé Tailwind pour la vitesse de développement. Pour le Dashboard, j'ai choisi du CSS standard (Grid/Flexbox/Variables) pour comprendre les fondamentaux. Cette double approche m'a permis de juger par moi-même : Tailwind est excellent pour les projets rapides, mais le CSS natif offre plus de contrôle et de compréhension.

**Sources :** [State of CSS 2024](https://2024.stateofcss.com/), [MDN – CSS Nesting](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting), [MDN – Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)

---

## 4. IA dans le développement (Copilot, ChatGPT)
L'intégration de l'IA dans l'IDE n'est plus un gadget mais un standard. GitHub Copilot est utilisé par 1.8 million de développeurs en 2025.
*   **Usage responsable** : L'enjeu n'est plus de « coder » mais « d'architecturer » et de « relire ». L'IA excelle pour le boilerplate, les tests unitaires et le débogage. Elle est plus faible pour les décisions d'architecture et le code métier complexe.
*   **Risques identifiés** :
    *   **Hallucinations** : L'IA peut générer du code qui semble correct mais contient des bugs subtils (ex : mauvaise gestion de cas limites).
    *   **Dépendance** : Si on ne comprend pas le code généré, on accumule de la dette technique invisible.
    *   **Droit d'auteur** : Les modèles sont entraînés sur du code open source, ce qui pose des questions juridiques pour le code propriétaire.
*   **Dans ce portfolio** : L'IA m'a aidé à générer des données de test (JSON pour Hitster), à débugger des REGEX complexes (extraction d'URL Spotify) et à structurer la documentation. J'ai détaillé cette réflexion dans mon [bilan final](../reflexions/bilan-final.md).

**Sources :** [GitHub Copilot Blog](https://github.blog/ai-and-ml/github-copilot/), [Stack Overflow Developer Survey 2024 – AI](https://survey.stackoverflow.co/2024/ai)

---

## 5. View Transitions API : des transitions de page natives
*   **Concept** : Une API web native qui permet de créer des transitions animées entre deux états du DOM (ou deux pages), sans librairie tierce. Similaire aux transitions de pages d'une app mobile, mais en standard web.
*   **Support** : Chrome 111+ et Edge (mars 2023). Safari et Firefox en cours d'implémentation.
*   **Impact potentiel** : Rend les SPA et MPA (Multi-Page Apps) visuellement comparables aux apps natives. Les frameworks comme Astro et Nuxt intègrent déjà le support.
*   **Lien avec mes projets** : Mon Restaurant utilise Vue Router pour la navigation. L'ajout de View Transitions permettrait des animations fluides entre les pages Menu → Panier → Checkout, améliorant significativement l'UX sur mobile.

**Sources :** [MDN – View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API), [Chrome Developers – View Transitions](https://developer.chrome.com/docs/web-platform/view-transitions)
