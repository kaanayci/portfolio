# Analyse du site CFF.ch

## Pourquoi ce site ?

J'utilise le site des CFF quasiment tous les jours pour checker mes horaires de train. Du coup, quand il a fallu choisir un site à analyser, c'était un choix assez évident. C'est un site que je connais bien en tant qu'utilisateur, et je trouvais intéressant de regarder "sous le capot" pour voir comment un site de cette envergure est construit.

J'ai analysé la page d'accueil et le parcours d'achat de billet avec Chrome DevTools, Lighthouse et axe DevTools.

---

## Accessibilité

C'est clairement le point fort du site, et ça se comprend : en tant que service public, les CFF doivent être accessibles à tout le monde. Quand j'ai ouvert axe DevTools pour la première fois, j'ai été surpris du peu d'erreurs remontées.

**Ce qui fonctionne bien :**

Le contraste est nickel. Leur rouge (#EB0000) sur fond blanc donne un ratio de 4.6:1, pile au-dessus du minimum AA (4.5:1). J'imagine qu'ils ont dû calibrer cette couleur précisément pour ça, parce que 0.1 de marge c'est pas un hasard.

Le skip link ("Aller au contenu") apparaît dès le premier `Tab` — c'est un truc que je n'avais même pas dans mon Dashboard avant cette analyse. Les champs de recherche d'horaire ont un `aria-autocomplete="list"` pour les suggestions, les onglets utilisent `role="tablist"` avec `aria-selected`. En gros, ils ont fait le boulot sur les attributs ARIA.

Le focus est visible partout avec un contour bleu. Ça paraît basique dit comme ça, mais beaucoup de sites le masquent avec `outline: none` pour des raisons esthétiques.

**Les problèmes que j'ai trouvés :**

En inspectant les cartes promo en bas de page, j'ai trouvé des `alt="image"` sur plusieurs visuels. C'est le genre de truc qui arrive quand c'est un CMS et que la personne qui upload l'image ne remplit pas le champ alt correctement. Au passage, ça m'a fait réaliser que la distinction entre images décoratives (`alt=""`) et informatives est pas toujours facile à faire dans un contexte éditorial.

Les modales de promo ne capturent pas le focus. Concrètement, si tu navigues au clavier et qu'une pop-up s'ouvre, le focus reste derrière la modale. C'est un souci WCAG 2.4.3 que j'ai d'ailleurs eu dans mon projet Restaurant avec la modale produit — sauf que moi j'ai ajouté `aria-modal="true"` et `role="dialog"` après coup.

Les messages d'erreur du formulaire d'achat ne sont pas toujours liés au champ via `aria-describedby`. J'ai testé avec NVDA et l'erreur n'est parfois pas lue quand on revient sur le champ fautif.

---

## Performance

| Métrique | Valeur | Seuil "Bon" | |
|---|---|---|---|
| LCP | ~1.4s | < 2.5s | Bon |
| INP | ~90ms | < 200ms | Bon |
| CLS | ~0.02 | < 0.1 | Bon |
| Score global | 88/100 | > 90 | Presque |
| Score accessibilité | 91/100 | > 90 | Bon |

Le score de 88 en performance mobile est correct sans être exceptionnel. En regardant le waterfall dans DevTools, on voit que c'est surtout les scripts tiers (analytics, tracking) qui plombent le score. Le code CFF en lui-même est bien optimisé.

L'image hero est en WebP avec `srcset` — c'est le standard aujourd'hui mais c'est bien qu'ils le fassent. Ce qui m'a plus intéressé, c'est la gestion du CLS : les blocs de recherche ont un `min-height` fixe, donc quand les promos se chargent en asynchrone, la page ne "saute" pas. C'est exactement le genre de problème que j'ai dans mon Dashboard où le contenu météo se charge sans placeholder et peut décaler tout le layout. J'ai d'ailleurs commencé à corriger ça avec du skeleton loading.

Ils utilisent du code-splitting : seul le JS pour la recherche d'horaire est chargé au départ, le reste (carte interactive, promos) arrive en lazy. C'est malin pour un site où 90% des gens viennent juste chercher un horaire.

**SSR vs SPA — un choix réfléchi**

Le site est en rendu serveur (SSR), pas en SPA. Pour un service public comme les CFF, c'est le bon choix : le SEO est meilleur, le premier affichage est plus rapide, et le site reste fonctionnel même avec JavaScript désactivé. C'est un truc auquel je n'avais pas pensé au début pour mon Restaurant — j'ai fait une SPA avec Vue 3 et du hash routing, alors qu'un Nuxt en SSR aurait été plus propre pour un "vrai" site commercial. Bon, pour un projet d'école c'est pas critique, mais c'est une leçon à retenir.

---

## SEO

Le SEO est solide et bien travaillé.

La hiérarchie de titres est propre : un seul `<h1>` avec "Horaires et billets", c'est pertinent pour les recherches principales. Les URLs sont bien structurées (`/fr/acheter/billets.html`) avec des slugs en français, ce qui aide pour le référencement local.

Les balises meta sont complètes : description spécifique, Open Graph avec `og:image` pour le partage social. Ils utilisent aussi Schema.org (types `Organization` et `WebSite` avec `SearchAction`), ce qui leur permet d'avoir la barre de recherche directement dans les résultats Google — un truc que je ne connaissais pas avant cette analyse.

Le `hreflang` gère les 4 langues (fr/de/it/en), et il y a un sitemap XML référencé dans `robots.txt`.

Par contre, en creusant un peu, certaines pages profondes (CGV, détails de ligne) ont des meta descriptions copiées-collées. Et j'ai trouvé quelques pages non traduites qui créent des redirections 302 au lieu de servir un contenu dans la bonne langue.

---

## Ce que j'ai changé dans mes projets après cette analyse

| Constat sur CFF.ch | Action dans mes projets |
|---|---|
| Skip link présent dès le premier Tab | Ajouté un skip link dans mon projet Restaurant (`<a href="#main-content" class="sr-only">`) |
| Espace réservé pour le contenu async (CLS) | Mis en place du skeleton loading dans le Dashboard pour la zone météo |
| Focus trap dans les modales | Vérifié et ajouté `aria-modal` + `role="dialog"` dans la modale produit du Restaurant |
| Schema.org pour les rich snippets | Pas encore implémenté, mais noté comme amélioration possible pour le Restaurant |

Ce qui m'a le plus marqué, c'est à quel point un site aussi "simple" visuellement peut être complexe sous le capot en termes d'accessibilité. Les CFF font un vrai effort là-dessus, même si c'est pas parfait (les images promo et les modales). C'est un bon exemple pour montrer que l'accessibilité, c'est pas juste "ajouter des alt" — c'est un travail continu.

---

**Sources utilisées :**
*   [Google – Core Web Vitals](https://web.dev/vitals/) — référence officielle pour les métriques de performance
*   [W3C – WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/) — critères d'accessibilité que j'ai vérifiés un par un
*   [Chrome – Documentation Lighthouse](https://developer.chrome.com/docs/lighthouse/) — outil utilisé pour les audits automatiques
*   [Schema.org – Organization](https://schema.org/Organization) — pour comprendre les données structurées utilisées par CFF
*   [Deque – axe DevTools](https://www.deque.com/axe/devtools/) — extension utilisée pour l'audit d'accessibilité détaillé
