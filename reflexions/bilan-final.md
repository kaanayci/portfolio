# Réflexion critique – Bilan final
*Démarche portfolio – Intégration Web*

---

## 1. Synthèse de mon évolution : du début à la fin du cours

En regardant en arrière, la progression entre mon premier commit (13 décembre 2025) et aujourd'hui est frappante. Au départ, mon Dashboard était un fichier `app.js` monolithique de plusieurs centaines de lignes, couplé à jQuery, où la navigation, la météo, le chat et le stockage cohabitaient sans séparation. Mon CSS utilisait des couleurs en dur et des classes dupliquées. Je « codais pour que ça marche », sans réfléchir à la maintenabilité.

Aujourd'hui, mon projet Restaurant repose sur **Vue 3 avec la Composition API**, **Pinia** pour la gestion d'état, **Vue Router** avec lazy-loading, **Tailwind CSS** et **Vite** comme outil de build. Je pense en termes de **composants réutilisables**, de **stores séparés par domaine** (panier, utilisateur, commande, menu) et de **single responsibility**. Ce n'est plus le même développeur.

### Les étapes clés de cette transformation

1. **Dashboard (décembre 2025)** — Mon point d'entrée. J'ai appris les bases : manipulation du DOM, gestion d'événements, appel d'API, localStorage. Le code fonctionnait, mais il était fragile et difficile à faire évoluer. C'est à ce stade que j'ai compris ce que signifie « dette technique ».

2. **Hitster (janvier 2026)** — Un saut qualitatif. J'ai découvert les **modules ES6** (`import`/`export`), ce qui a été un vrai tournant. La refactorisation d'un fichier monolithique vers 10+ modules m'a appris physiquement la valeur de la séparation des responsabilités. J'ai aussi intégré un backend Express pour le proxy API Spotify, ce qui m'a initié à l'architecture client-serveur.

3. **Restaurant (février-mars 2026)** — Le projet phare. Passer à Vue 3 m'a forcé à repenser mon approche. Au lieu de manipuler le DOM directement, je déclare ce que je veux afficher et le framework s'occupe du rendu. Cette inversion de paradigme a été déstabilisante au début, mais une fois comprise, elle a rendu mon code plus prévisible et plus testable.

---

## 2. Analyse du parcours : succès, échecs et stratégies d'adaptation

### Ce qui a bien fonctionné

- **La progression technologique par paliers** : jQuery → Vanilla JS modulaire → Vue 3. Chaque projet a introduit un niveau d'abstraction supplémentaire, ce qui m'a permis de comprendre *pourquoi* les frameworks existent, pas seulement *comment* les utiliser. Quand j'ai écrit `{{ product.name }}` en Vue, je savais exactement quel `document.createElement()` cela remplaçait.

- **L'approche PWA transversale** : J'ai implémenté des Service Workers manuellement dans le Dashboard (stratégie Stale-While-Revalidate pour l'API, Cache-First pour les assets), puis j'ai utilisé `vite-plugin-pwa` dans le Restaurant. Comprendre la couche basse avant d'utiliser l'abstraction m'a donné une compréhension solide du fonctionnement hors-ligne.

- **La documentation continue** : Rédiger les fiches techniques en parallèle du développement, plutôt qu'après coup, m'a obligé à formaliser ma compréhension. Par exemple, en documentant la fiche sur Pinia, j'ai réalisé que ma communication inter-stores pouvait être simplifiée, ce qui m'a conduit à refactorer du code.

### Ce qui a posé problème

- **La sécurisation des clés API** : Dans ma première version du Dashboard, la clé OpenWeatherMap était en dur dans le code source. C'est lors du feedback de mi-parcours que j'ai compris le problème. J'ai ensuite créé un fichier `config.js` ignoré par Git, avec un `config.example.js` versionné pour guider l'installation. Pour Hitster, j'ai directement opté pour un proxy backend Express avec `dotenv`. Cette évolution montre une prise de conscience progressive de la sécurité.

- **L'accessibilité ajoutée tardivement** : C'est la compétence que j'ai le plus sous-estimée. Dans aucun de mes projets je n'ai pensé à l'accessibilité dès la conception. Je l'ai ajoutée en fin de projet (`aria-label`, `aria-live`, `role="dialog"`, skip-nav dans le Restaurant), ce qui montre que j'ai compris les concepts, mais l'idéal aurait été de les intégrer dès le départ. Je n'ai pas non plus testé avec un lecteur d'écran.

- **La régularité du travail** : Mon historique Git montre des pics d'activité (13-15 décembre, 3-4 février, 2 mars) entrecoupés de longues pauses. Ce manque de régularité a parfois causé des pertes de contexte : en revenant sur le Dashboard après plusieurs semaines, j'ai dû relire mon propre code pour me souvenir de la logique. Cela m'a convaincu de l'importance des commentaires qui expliquent le **pourquoi**, pas juste le **quoi**.

- **Le SEO pris en compte tardivement** : J'ai ajouté les balises `<meta name="description">` et Open Graph en fin de projet, mais je n'ai pas de données structurées Schema.org. Pour le Restaurant (SPA avec hash routing `/#/menu`), c'est encore problématique car les moteurs de recherche n'indexent pas ces routes. J'aurais dû utiliser `createWebHistory` dès le départ.

### Comment j'ai surmonté les obstacles

Ma stratégie principale a été la **décomposition**. Face au refactoring massif de Hitster (passer d'un fichier unique à 10+ modules), j'ai procédé fichier par fichier : d'abord extraire `audio.js`, vérifier que tout fonctionne, puis `ui.js`, etc. Cette approche incrémentale, inspirée du principe « une fonctionnalité à la fois » identifié dans ma réflexion de mi-parcours, s'est révélée fiable.

Pour les concepts nouveaux (Composition API, Pinia, Vue Router), j'ai adopté une approche en trois temps : **lire la documentation officielle**, **reproduire un exemple minimal**, puis **adapter à mon projet**. Cette méthode m'a évité de copier du code sans le comprendre.

---

## 3. Auto-évaluation par compétences opérationnelles

| Compétence | Niveau estimé | Justification |
|---|---|---|
| **HTML5 sémantique** | Bon | Utilisation correcte de `<header>`, `<main>`, `<nav>`, `<section>`, `<footer>` sur les 3 projets. Formulaires avec attributs de validation natifs dans le Restaurant. |
| **CSS moderne (Flexbox, Grid)** | Bon | Dashboard : layout complet en Grid + Flexbox. Hitster : scroll-snap horizontal pour la timeline mobile. Restaurant : Tailwind avec classes responsive. |
| **JavaScript ES6+** | Bon | Modules ES6, async/await, destructuring, template literals, classes (AudioPlayer dans Hitster). Progression visible entre le jQuery du Dashboard et le Vanilla JS modulaire de Hitster. |
| **Framework front-end** | Satisfaisant | Vue 3 avec Composition API (`<script setup>`), mais je n'ai pas exploré les composables personnalisés ni les directives custom. Ma compréhension du cycle de vie reste basique. |
| **Gestion d'état** | Satisfaisant | Pinia avec stores séparés et communication inter-stores. Mais pas de tests unitaires sur les stores. |
| **APIs et données** | Bon | Intégration d'OpenWeatherMap (REST), proxy Spotify (backend Express), manipulation de JSON. Gestion d'erreurs améliorée (try/catch) mais pas systématique partout. |
| **Responsive design** | Bon | Media queries multiples (Dashboard), CSS scroll-snap (Hitster), classes responsive Tailwind (Restaurant). Testé sur mobile et desktop. |
| **PWA** | Bon | Service Worker manuel (Dashboard) + vite-plugin-pwa (Restaurant). Manifest, cache, install prompt. |
| **Accessibilité (WCAG)** | Satisfaisant | `aria-label`, `aria-live`, `role="dialog"`, `aria-pressed` et skip-nav ajoutés sur les 3 projets. Sémantique HTML correcte. Cependant, je n'ai pas testé avec un lecteur d'écran ni vérifié tous les contrastes systématiquement. |
| **SEO** | Satisfaisant | Meta descriptions et Open Graph ajoutés sur les 4 pages. Pas de données structurées Schema.org, et le Restaurant utilise `createWebHashHistory` (non indexable). SEO pris en compte tardivement. |
| **Sécurité web** | Satisfaisant | Clés API protégées (config.js + .gitignore, dotenv côté serveur), mais pas de Content Security Policy, pas de rate limiting. |
| **Versionning (Git)** | Satisfaisant | Commits réguliers avec messages descriptifs, mais pas de branches feature, pas de pull requests. Historique parfois irrégulier. |
| **Documentation** | Bon | 18 fiches techniques uniformes (définition, code, analyse, sources), README complets pour chaque projet, documentation d'architecture. |

---

## 4. Réflexion sur l'utilisation de l'IA

L'IA (GitHub Copilot, ChatGPT) a été un outil omniprésent dans ce cours, et j'estime important d'être transparent sur son utilisation.

### Où l'IA m'a aidé

- **Génération de données de test** : Le fichier `songs.json` pour Hitster a été partiellement généré par IA à partir de playlists Spotify. Écrire manuellement 50+ entrées avec artiste, titre, année et URL de preview aurait été un travail mécanique sans valeur pédagogique.
- **Débogage de regex** : Pour l'extraction d'identifiants de playlists Spotify dans différents formats d'URL, l'IA m'a aidé à construire et tester des expressions régulières complexes.
- **Compréhension de concepts** : Quand la documentation de Pinia ou du Service Worker était trop abstraite, j'ai demandé des explications avec des analogies simples, puis j'ai vérifié en lisant la doc officielle.
- **Documentation** : L'IA m'a aidé à structurer certaines fiches techniques, en proposant un plan que j'ai ensuite rempli avec mes propres exemples et analyses.

### Où l'IA m'a posé problème

- **Fausse confiance** : Au début, j'ai parfois accepté du code généré sans le comprendre. Le fichier `spotify-to-json.mjs` en est un exemple : du code fonctionnel mais opaque, sans commentaires expliquant la logique. J'ai appris qu'utiliser du code que je ne comprends pas est une dette technique déguisée.
- **Sur-dépendance pour le CSS** : J'ai eu tendance à demander des layouts CSS à l'IA plutôt que de les construire moi-même. Résultat : quand je devais modifier un détail, je ne comprenais pas toujours pourquoi une propriété était là. C'est pour cela que j'ai choisi d'utiliser du CSS « à la main » pour le Dashboard, afin de consolider mes bases.

### Ma position actuelle

L'IA est un **accélérateur**, pas un **remplaçant**. Elle est utile pour les tâches mécaniques (boilerplate, données, formatage) et pour débloquer des situations, mais elle ne remplace pas la compréhension. Mon critère personnel : si je ne peux pas expliquer chaque ligne d'un code à quelqu'un, je n'ai pas le droit de l'utiliser. Cette règle m'a poussé à toujours relire, tester et parfois réécrire ce que l'IA proposait.

Pour l'avenir, je veux utiliser l'IA davantage pour la **relecture de code** (code review) et les **tests**, plutôt que pour la génération. C'est dans l'analyse critique du code que l'IA apporte le plus de valeur à un développeur junior.

---

## 5. Plan de développement professionnel

### Objectifs court terme (3-6 mois)

| Objectif | Actions concrètes | Ressources |
|---|---|---|
| **Maîtriser l'accessibilité WCAG 2.1** | Continuer l'audit de mes 3 projets avec axe DevTools et NVDA. Tester la navigation clavier complète. Améliorer le focus management. Viser le niveau AA. | [WAI-ARIA Practices](https://www.w3.org/WAI/ARIA/apg/), [Cours Accessibilité Google/Udacity](https://web.dev/accessibility) |
| **Améliorer le SEO** | Ajouter des données structurées Schema.org. Migrer le Restaurant vers `createWebHistory`. Ajouter `og:image` pour les prévisualisations de lien. | [web.dev SEO](https://web.dev/learn/seo), [Schema.org](https://schema.org) |
| **Approfondir les tests** | Écrire des tests unitaires pour les stores Pinia (Vitest) et des tests d'intégration pour les composants Vue (Vue Test Utils). | [Vitest](https://vitest.dev/), [Vue Test Utils](https://test-utils.vuejs.org/) |

### Objectifs moyen terme (6-12 mois)

| Objectif | Actions concrètes | Ressources |
|---|---|---|
| **Backend et full-stack** | Créer une API REST avec Node.js/Express pour le Restaurant (remplacer les données JSON statiques par une base de données). | [Express.js Guide](https://expressjs.com/), [Prisma ORM](https://www.prisma.io/) |
| **CI/CD et déploiement** | Mettre en place un pipeline GitHub Actions pour le build et le déploiement automatique. Migrer vers HTTPS avec un nom de domaine propre. | [GitHub Actions Docs](https://docs.github.com/en/actions), [Let's Encrypt](https://letsencrypt.org/) |
| **TypeScript** | Migrer progressivement le projet Restaurant vers TypeScript pour bénéficier du typage statique et de la documentation intégrée. | [TypeScript Handbook](https://www.typescriptlang.org/docs/) |

### Vision à long terme

En tant que futur informaticien ES, je veux devenir un développeur qui ne se contente pas de livrer du code fonctionnel, mais du code **maintenable, accessible et sécurisé**. Ce cours m'a fait comprendre que la qualité ne se voit pas dans le résultat final (l'utilisateur ne sait pas si le code est propre), mais se ressent dans la capacité à faire évoluer le projet, à corriger les bugs rapidement et à intégrer de nouvelles fonctionnalités sans tout casser.

---

## 6. Conclusion : ce que ce portfolio représente pour moi

Ce portfolio n'est pas un simple exercice scolaire. C'est la trace tangible d'une transformation : d'un étudiant qui écrivait du jQuery spaghetti à quelqu'un qui structure des applications en composants, gère l'état global et documente ses choix techniques.

Les erreurs documentées dans ces réflexions (code monolithique, accessibilité négligée, SEO oublié, régularité insuffisante) ne sont pas des faiblesses à cacher : ce sont des preuves d'apprentissage. Chaque problème identifié m'a conduit à une solution et à une meilleure compréhension.

Si je devais retenir une seule leçon de ce cours, ce serait celle-ci : **le code qui fonctionne n'est que le début. Le code professionnel est celui qui est compréhensible, accessible, documenté et évolutif.**

---

*Bilan rédigé en mars 2026 – Kaan Kalayci*
