# Analyse Critique : Qoqa.ch

## Contexte
Qoqa est un site e-commerce suisse communautaire basé sur des offres éphémères (« deal du jour »). Le modèle repose sur l'urgence et l'engagement communautaire. L'analyse porte sur la page d'accueil et le parcours d'achat, évalués en termes d'UX, performance, accessibilité et SEO. Observations réalisées en février 2026 avec Chrome DevTools et Lighthouse.

---

## 1. UX & Engagement (Gamification)

**Points Forts :**
*   **Urgence et FOMO** : Utilisation massive de barres de progression (« Plus que 12% ! »), comptes à rebours et indicateurs de stock limité qui créent un sentiment d'urgence (Fear Of Missing Out). Cette technique de gamification est très efficace pour le taux de conversion.
*   **Micro-interactions** : Les boutons réagissent au survol avec des transitions fluides (`transition: transform 0.15s ease`), les animations d'ajout au panier sont satisfaisantes (scale + fade). Cela rend l'expérience « fun », ce que j'ai essayé de reproduire dans mon projet Hitster avec les confettis et le screen shake.
*   **Communauté intégrée** : Section commentaires sous chaque produit, votes, partage — le site est autant un réseau social qu'un e-commerce.

**Lien avec mes projets :** La gamification de Qoqa m'a directement inspiré pour le « Game Juice » de Hitster (feedback visuel immédiat, animations de récompense). Cependant, Qoqa pousse parfois trop loin : l'urgence artificielle peut frustrer. Dans Hitster, j'ai essayé de garder le fun sans manipulation.

---

## 2. Performance (Core Web Vitals – Lighthouse)

**Résultats Lighthouse (mode mobile, février 2026) :**

| Métrique | Valeur observée | Seuil Google (Bon) | Verdict |
|---|---|---|---|
| **LCP** (Largest Contentful Paint) | ~3.8s | < 2.5s | ❌ Lent |
| **INP** (Interaction to Next Paint) | ~280ms | < 200ms | ⚠️ À améliorer |
| **CLS** (Cumulative Layout Shift) | ~0.15 | < 0.1 | ❌ Instable |
| **Score Performance** | 52/100 | > 90 | ❌ Mauvais |
| **Score Accessibilité** | 68/100 | > 90 | ❌ Insuffisant |

**Analyse des problèmes :**
*   **LCP élevé** : L'image produit principale (hero) est servie en JPEG haute résolution (~800 Ko) au lieu de WebP ou AVIF. Pas de `srcset` pour adapter la résolution à la taille d'écran.
*   **CLS instable** : Les bannières promotionnelles et les barres de progression se chargent dynamiquement sans dimensions réservées, causant des sauts de layout. Contrairement à CFF.ch qui réserve l'espace avec des `min-height` fixes.
*   **JavaScript lourd** : Le bundle JS principal pèse ~1.2 Mo (non compressé). Sur un smartphone de milieu de gamme, le thread principal est bloqué pendant ~2s au chargement, causant le saccadement du défilement.

**Solutions proposées :**
*   Convertir les images en WebP/AVIF avec `<picture>` et `srcset` pour le responsive → gain LCP estimé : -1.5s
*   Implémenter le code-splitting pour ne charger que le JS nécessaire à la vue actuelle (le module commentaires et le chat communautaire pourraient être lazy-loadés)
*   Réserver les dimensions des blocs dynamiques avec un skeleton loading (comme je l'ai fait partiellement dans mon Dashboard pour la météo)

**Comparaison avec CFF.ch :**
La différence de score (CFF : 88/100 vs Qoqa : 52/100) s'explique par les priorités : CFF optimise pour l'efficacité (trouver un train en < 2s), Qoqa privilégie l'engagement visuel (animations, images HD, effets). C'est un compromis assumé, mais pour un site e-commerce mobile-first, la performance impacte directement le taux de conversion (Google estime -1% de conversion par 100ms de latence supplémentaire).

---

## 3. Accessibilité (WCAG 2.1)

**Faiblesses identifiées :**

| Problème | Critère WCAG | Sévérité |
|---|---|---|
| Contrastes insuffisants (rose Qoqa #E84C8A sur gris #888) : ratio ~3.1:1 au lieu de 4.5:1 minimum | 1.4.3 – Contraste minimum (AA) | Haute |
| Navigation clavier quasi impossible : les modales pop-up (newsletter, cookies, offres flash) ne capturent pas le focus et ne sont pas fermables au clavier (`Escape`) | 2.1.1 – Clavier, 2.4.3 – Ordre du focus | Critique |
| Bouton « Ajouter au panier » sans libellé accessible : `<button>` contenant uniquement un SVG sans `aria-label` | 4.1.2 – Nom, rôle, valeur | Haute |
| Pas de skip link pour sauter la navigation | 2.4.1 – Contourner des blocs | Moyenne |
| Compte à rebours non annoncé aux lecteurs d'écran (pas d'`aria-live`) | 4.1.3 – Messages d'état | Moyenne |

**Solutions proposées :**
*   Changer le rose Qoqa pour un ton plus foncé (#D63384, ratio 4.6:1) ou augmenter le contraste du fond
*   Implémenter une focus trap dans les modales avec gestion de `Escape` pour fermer
*   Ajouter `aria-label="Ajouter [nom produit] au panier"` sur chaque bouton d'ajout
*   Ajouter un composant `<div aria-live="polite">` pour annoncer les changements de compte à rebours

---

## 4. SEO & Référencement

**Points Forts :**
*   **Contenu unique quotidien** : Chaque « deal » génère une page unique avec description, photos, avis — excellent pour le référencement naturel (contenu frais quotidien).
*   **URLs propres** : Structure `/fr/product/nom-du-produit-12345` lisible et SEO-friendly.
*   **Données structurées** : Utilisation de Schema.org `Product` avec `price`, `availability`, `review` — permet l'affichage de rich snippets (étoiles, prix) dans Google.

**Points à Améliorer :**
*   **Meta descriptions** : Certaines pages produits ont des meta descriptions identiques (« Découvrez l'offre Qoqa du jour ! »). Chaque page devrait avoir une description unique intégrant le nom du produit et le prix.
*   **Temps de chargement mobile** : Google utilise l'indexation mobile-first. Avec un score performance de 52/100, Qoqa est pénalisé dans le classement mobile.
*   **Pas de balise `<link rel="canonical">`** sur certaines variantes d'URL (avec/sans paramètres de tracking), ce qui peut créer du contenu dupliqué.

---

## 5. Comparaison des approches techniques

| Aspect | CFF.ch | Qoqa.ch | Mon projet Restaurant |
|---|---|---|---|
| **Rendu** | SSR (serveur) | SSR + hydratation JS lourde | SPA (Vue 3 + Vite) |
| **Framework** | Propriétaire/Angular | React (Next.js probable) | Vue 3 |
| **Images** | WebP + srcset | JPEG (ancien stock) | Pas d'images lourdes (icônes SVG) |
| **Accessibilité** | Bon (91/100) | Insuffisant (68/100) | Moyen (~75/100 estimé) |
| **SEO** | Excellent (SSR + Schema.org) | Correct (contenu riche mais perf faible) | Faible (SPA hash routing) |
| **Performance** | 88/100 | 52/100 | ~90/100 (app légère) |

**Enseignement clé :** Le choix de l'architecture (SSR vs SPA) a un impact majeur sur le SEO et la performance. Pour mon projet Restaurant, le hash routing (`/#/menu`) empêche l'indexation par les moteurs de recherche. Si c'était un vrai site commercial, j'aurais dû utiliser Nuxt.js (SSR) ou au minimum `createWebHistory` avec une configuration serveur pour le fallback.

---

## 6. Synthèse

Qoqa excelle dans le marketing et l'UX visuelle, mais sacrifie l'accessibilité et la performance au profit du « Waouh effect ». Pour un projet d'examen, il faut trouver un équilibre entre le fun de Qoqa (animations, feedback) et la rigueur technique de CFF.ch (accessibilité, performance, SEO).

**Ce que j'en retiens pour mes projets :**
*   La gamification fonctionne (Hitster le prouve), mais ne doit pas se faire au détriment de l'accessibilité
*   Les images doivent toujours être optimisées (WebP, srcset, lazy loading) — même pour un portfolio
*   Le SEO doit être pensé dès la conception (choix du routage, meta tags, données structurées), pas ajouté après coup

---

**Sources :**
*   [Google Core Web Vitals](https://web.dev/vitals/)
*   [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
*   [Google – Page Experience Update](https://developers.google.com/search/docs/appearance/page-experience)
*   [Schema.org – Product](https://schema.org/Product)
*   [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
