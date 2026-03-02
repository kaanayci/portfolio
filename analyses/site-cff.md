# Analyse Critique : CFF.ch (SBB)

## Contexte
Le site des Chemins de fer fédéraux suisses (CFF) est une plateforme critique utilisée quotidiennement par des millions d'usagers pour consulter les horaires et acheter des billets. L'analyse porte sur la page d'accueil (`sbb.ch/fr`) et le processus d'achat de billet, évalués selon trois axes : accessibilité, performance et SEO. Les observations ont été réalisées en février 2026 avec Chrome DevTools, Lighthouse et l'extension axe DevTools.

---

## 1. Accessibilité (WCAG 2.1)

**Points Forts :**
*   **Contraste (WCAG 1.4.3 – Niveau AA)** : Excellent respect des ratios de contraste. Le rouge CFF (#EB0000) sur fond blanc offre un ratio de 4.6:1, conforme au minimum AA (4.5:1). Le texte noir sur fond blanc atteint un ratio de 21:1.
*   **Navigation Clavier (WCAG 2.1.1)** : Le site est entièrement navigable via `Tab`. Le "Skip Link" (« Aller au contenu ») est présent dès la première tabulation, ce qui permet aux utilisateurs de clavier et de lecteur d'écran de sauter la navigation.
*   **ARIA (WCAG 4.1.2)** : Les champs de recherche d'horaire utilisent correctement `aria-autocomplete="list"` pour annoncer les suggestions aux lecteurs d'écran. Les onglets de navigation utilisent `role="tablist"` avec `aria-selected`.
*   **Focus visible (WCAG 2.4.7)** : Le focus est toujours visible avec un contour bleu sur les éléments interactifs.

**Points à Améliorer :**
*   Certaines cartes promotionnelles utilisent des textes alternatifs (`alt`) génériques (ex: « image ») au lieu de descriptions pertinentes. Il faudrait distinguer les images décoratives (`alt=""`) des images informatives avec un `alt` descriptif (WCAG 1.1.1).
*   Les modales de promotion ne capturent pas systématiquement le focus (focus trap), ce qui peut désorienter les utilisateurs de lecteur d'écran (WCAG 2.4.3).
*   Les messages d'erreur du formulaire d'achat ne sont pas toujours liés au champ via `aria-describedby`, rendant leur lecture par NVDA incertaine.

---

## 2. Performance (Core Web Vitals – Lighthouse)

**Résultats Lighthouse (mode mobile, février 2026) :**

| Métrique | Valeur observée | Seuil Google (Bon) | Verdict |
|---|---|---|---|
| **LCP** (Largest Contentful Paint) | ~1.4s | < 2.5s | ✅ Bon |
| **INP** (Interaction to Next Paint) | ~90ms | < 200ms | ✅ Bon |
| **CLS** (Cumulative Layout Shift) | ~0.02 | < 0.1 | ✅ Bon |
| **Score Performance** | 88/100 | > 90 | ⚠️ Correct |
| **Score Accessibilité** | 91/100 | > 90 | ✅ Bon |

**Analyse :**
*   **LCP optimisé** : L'image hero est servie en format WebP avec `srcset` pour les différentes résolutions. Le CSS critique est probablement inliné dans le `<head>`, évitant le rendu bloquant.
*   **CLS maîtrisé** : Les blocs de recherche ont des dimensions réservées (`min-height` fixe), empêchant les sauts de layout lors du chargement asynchrone des promotions.
*   **JavaScript optimisé** : Le site utilise le code-splitting et le lazy loading pour les modules non critiques (promotions, carte interactive). Seul le JS nécessaire à la recherche d'horaire est chargé immédiatement.

**Comparaison avec une approche SPA :**
Un site comme CFF.ch aurait pu être construit en SPA (React/Vue) pour une navigation sans rechargement. Cependant, le choix du rendu côté serveur (SSR) est judicieux pour un service public : meilleur SEO, temps de chargement initial plus rapide, et fonctionnement sans JavaScript pour les cas dégradés. C'est un compromis que j'aurais dû considérer pour mon Dashboard, où le SSR n'est pas nécessaire mais où le lazy loading aurait amélioré les performances.

---

## 3. SEO & Sémantique

**Points Forts :**
*   **Hiérarchie de titres** : Structure `<h1>` → `<h6>` respectée. Le `<h1>` contient « Horaires et billets », pertinent pour le référencement sur la requête principale.
*   **URLs propres** : Architecture claire (`/fr/acheter/billets.html`) avec des slugs en français, ce qui favorise le référencement local.
*   **Balises meta** : `<meta name="description">` présente et spécifique, Open Graph complet (`og:title`, `og:description`, `og:image`) pour le partage sur les réseaux sociaux.
*   **Données structurées** : Utilisation de Schema.org (`Organization`, `WebSite` avec `SearchAction`) permettant aux moteurs de recherche d'afficher la barre de recherche directement dans les résultats Google (sitelinks search box).
*   **Sitemap XML** : Présent et référencé dans `robots.txt`.

**Points à Améliorer :**
*   Certaines pages profondes (conditions générales, détails de lignes) ont des meta descriptions génériques ou dupliquées.
*   Le `hreflang` pour le multilingue (fr/de/it/en) est correctement implémenté, mais certaines pages mineures ne sont pas traduites, ce qui crée des redirections.

---

## 4. Propositions d'amélioration concrètes

| Problème identifié | Solution proposée | Impact estimé |
|---|---|---|
| Alt génériques sur les promos | Implémenter un processus éditorial : `alt` descriptif pour les images informatives, `alt=""` + `role="presentation"` pour les décoratives | Accessibilité +5% (Lighthouse) |
| Focus trap absent dans les modales | Ajouter une bibliothèque type `focus-trap` ou implémenter manuellement avec `MutationObserver` | Conformité WCAG 2.4.3 |
| Score performance 88 (mobile) | Différer le chargement des scripts tiers (analytics, A/B testing) avec `defer` ou `loading="lazy"` sur les images below-the-fold | Performance +5-8 points |
| Meta descriptions dupliquées | Générer des descriptions uniques par page via le CMS, basées sur le contenu réel | SEO : meilleur CTR dans les résultats |

---

## 5. Ce que j'en retiens pour mes projets

CFF.ch est un modèle de « service public numérique » où l'efficacité prime sur le design superflu. Plusieurs enseignements pour mon portfolio :

*   **Skip links et focus management** : Mon Dashboard n'a aucun skip link. C'est une amélioration simple et très visible pour l'accessibilité.
*   **Dimensions réservées pour le CLS** : Dans mon Dashboard, le contenu météo se charge de manière asynchrone sans placeholder, ce qui peut causer des sauts de layout. Je devrais réserver l'espace avec un skeleton loading (ce que j'ai commencé à faire dans la fiche technique sur la manipulation du DOM).
*   **Le choix SSR vs SPA** : Pour un site à fort trafic et besoin SEO, le SSR est clairement supérieur. Pour mes projets de portfolio (Dashboard, Hitster), la SPA est acceptable car le SEO n'est pas critique. Mais pour le Restaurant, une approche SSR avec Nuxt (au lieu de Vite SPA) aurait été plus professionnelle.

---

**Sources :**
*   [Google Core Web Vitals](https://web.dev/vitals/)
*   [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
*   [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
*   [Schema.org – Organization](https://schema.org/Organization)
*   [axe DevTools](https://www.deque.com/axe/devtools/)
