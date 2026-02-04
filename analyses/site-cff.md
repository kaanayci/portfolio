# Analyse Critique : CFF.ch (SBB)

## Contexte
Le site des Chemins de fer fédéraux suisses (CFF) est une plateforme critique utilisée par des millions d'usagers. L'analyse porte sur la page d'accueil et le processus d'achat de billet.

## 1. Accessibilité (WCAG)
**Points Forts :**
*   **Contraste** : Excellent respect des ratios de contraste (Blanc sur Rouge / Noir sur Blanc), lisible même en plein soleil sur mobile.
*   **Navigation Clavier** : Le site est entièrement navigable via `Tab`. Le "Skip Link" (Aller au contenu) est présent dès la première tabulation.
*   **ARIA** : Les champs de recherche d'horaire utilisent correctement `aria-autocomplete` pour annoncer les suggestions aux lecteurs d'écran.

**Points à Améliorer :**
*   Certaines cartes promotionnelles manque de texte alternatif (`alt`) pertinent pour les images décoratives vs informatives.

## 2. Performance (Core Web Vitals)
**Observation :** Le site charge très vite malgré la complexité.
*   **LCP (Largest Contentful Paint)** : < 1.5s. L'image de fond (Hero) est bien optimisée.
*   **CLS (Layout Shift)** : Très stable. Les blocs de recherche ont des dimensions fixes réservées, évitant les sauts lors du chargement des pubs ou images.

## 3. SEO & Sémantique
*   Structure `<h1>` à `<h6>` respectée. Le `<h1>` est souvent "Horaires, billets..." ce qui est pertinent.
*   Les URLs sont propres (`/fr/acheter/billets.html`), bien que l'architecture soit parfois profonde.

## Conclusion
CFF.ch est un modèle de "Service Public" numérique. La priorité est donnée à l'efficacité (trouver un train) plutôt qu'au design superflu. C'est un exemple à suivre pour les projets de Dashboard comme le mien.
