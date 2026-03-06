# Veille Technologique 2025-2026

Je me suis intéressé à 5 sujets qui ont un lien direct avec ce que j'ai fait dans mes projets ou qui changent la manière de développer en ce moment. L'idée c'est pas de faire un catalogue de buzzwords, mais de comprendre ce qui est vraiment utile et ce qui est du hype.

---

## PWA : est-ce que ça remplace le natif ?

C'est un sujet qui me parle directement parce que j'ai implémenté des PWA dans deux projets (Restaurant et Dashboard), avec deux approches différentes.

Depuis qu'Apple a enfin ajouté le support des Push Notifications sur iOS (16.4+), les PWA commencent à devenir une vraie alternative aux apps natives. Microsoft les a même ajoutées dans le Microsoft Store en 2025, et Google pousse l'installation directe depuis Chrome depuis un moment.

L'avantage principal, c'est qu'on écrit UN seul code et ça tourne partout : web, mobile, desktop. Pas besoin de passer par les stores, pas besoin de payer les 99$/an d'Apple, et les mises à jour sont instantanées (pas de validation à attendre 3 jours).

Par contre, il y a des vrais manques, surtout côté Apple. Toujours pas de Bluetooth, pas de NFC, les capteurs avancés ne sont pas accessibles sur iOS. Safari traîne des pieds par rapport à Chrome sur le support PWA, et j'ai l'impression que c'est volontaire — Apple a tout intérêt à garder les gens sur l'App Store.

Dans mes projets, j'ai testé les deux approches : `vite-plugin-pwa` dans le Restaurant (auto-généré, pratique mais moins de contrôle) et un Service Worker écrit à la main dans le Dashboard (plus de boulot mais je comprends exactement ce qui se passe avec le cache Stale-While-Revalidate). La comparaison entre les deux est dans ma fiche [pwa-offline.md](../restaurant/public/docs/pwa-offline.md).

Mon avis : pour un projet solo ou une petite équipe, la PWA est largement suffisante. Mais si tu as besoin du Bluetooth ou du NFC, y a pas le choix, faut passer par le natif (ou React Native/Flutter).

**Sources :** [web.dev – What are PWAs](https://web.dev/explore/progressive-web-apps), [MDN – Progressive Web Apps](https://developer.mozilla.org/fr/docs/Web/Progressive_web_apps)

---

## Signals : la suite logique de la réactivité

Après les Hooks de React et la Composition API de Vue 3, tout le monde parle des "Signals" (SolidJS, Angular 17+, Preact, et bientôt Vue via `alien-signals`).

Le principe est simple à comprendre : au lieu de re-rendre tout un composant quand une donnée change (ce que fait React avec son Virtual DOM), les Signals mettent à jour uniquement le nœud DOM concerné. Genre, si la température change dans mon Dashboard, au lieu de recalculer toute la carte météo, seul le `<span>` avec la valeur est mis à jour.

Sur le papier c'est génial, et les benchmarks le confirment : SolidJS est environ 2x plus rapide que React sur les updates partielles dans le JS Framework Benchmark. Pour un dashboard temps réel comme le mien, ça pourrait faire une vraie différence.

Le problème, c'est que chaque framework implémente les Signals à sa sauce. Angular a ses `signal()`, SolidJS a `createSignal()`, Vue prépare `alien-signals`... Du coup si tu apprends les Signals dans un framework, c'est pas forcément transposable dans un autre. Ça fragmente l'écosystème et ça complique le choix de techno.

Pour l'instant, j'ai pas utilisé les Signals dans mes projets (Vue 3 avec `ref()` et `computed()` fait très bien le job pour mes cas d'usage). Mais c'est clairement un truc à suivre, surtout si je bosse un jour sur des interfaces avec beaucoup de données temps réel.

**Sources :** [Angular Signals RFC](https://github.com/angular/angular/discussions/49685), [SolidJS](https://www.solidjs.com/), [JS Framework Benchmark](https://krausest.github.io/js-framework-benchmark/)

---

## CSS natif vs Tailwind : le débat qui n'en finit pas

Tailwind domine les sondages (78% de satisfaction dans le State of CSS 2024), mais entre-temps le CSS standard a rattrapé une bonne partie de son retard.

Les trois trucs qui changent la donne en CSS natif :

Le **nesting** d'abord — on peut imbriquer des sélecteurs directement en CSS, sans avoir besoin de Sass ou PostCSS. Tous les navigateurs modernes le supportent depuis 2024. Ça paraît bête mais ça rend le CSS tellement plus lisible.

Les **Container Queries** (`@container`) ensuite — au lieu de rendre un composant responsive par rapport à la fenêtre (`@media`), on le rend responsive par rapport à son conteneur parent. Pour un design system avec des composants réutilisables dans des contextes différents (sidebar vs pleine page), c'est exactement ce qu'il fallait.

Et le sélecteur **`:has()`** — enfin un "sélecteur parent" en CSS. Tu peux écrire `form:has(input:invalid) { border-color: red }` pour styler un formulaire quand un de ses champs est invalide. Avant, fallait du JavaScript pour ça.

J'ai un point de vue assez tranché sur le débat Tailwind vs CSS natif parce que j'ai testé les deux dans mes projets. Tailwind dans le Restaurant, CSS pur dans le Dashboard. Tailwind c'est super pour aller vite et garder de la cohérence, mais les classes à rallonge dans le HTML (`class="flex items-center justify-between px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"`) c'est franchement pas agréable à relire. Et surtout, ça crée une dépendance : si Tailwind disparaît ou change de version majeure, t'es coincé.

Le CSS natif demande plus de temps au départ mais j'ai appris beaucoup plus en l'écrivant moi-même. Aujourd'hui, avec le nesting et les custom properties, la différence de productivité avec Tailwind est plus si grande qu'avant.

**Sources :** [State of CSS 2024](https://2024.stateofcss.com/), [MDN – CSS Nesting](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting), [MDN – Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)

---

## L'IA dans le dev : entre gain de temps et piège

GitHub Copilot compte 1.8 million d'utilisateurs en 2025. C'est plus un gadget, c'est un outil du quotidien. Mais faut être lucide sur ce que ça fait bien et ce que ça fait mal.

Ce que l'IA fait bien : le boilerplate (écrire un store Pinia, un composant Vue de base, un fichier de config), les tests unitaires, le débogage de trucs chiants (regex, parsing). C'est un gain de temps réel sur les tâches répétitives.

Ce que l'IA fait mal : les décisions d'architecture. Quand je lui ai demandé comment structurer les stores de mon Restaurant, elle m'a proposé un seul store monolithique. C'est moi qui ai décidé de séparer en 5 stores spécialisés (cart, menu, order, user, toast), et c'était le bon choix. L'IA ne comprend pas le "pourquoi" d'un projet.

Les risques que j'ai constatés concrètement :
- Les **hallucinations** : sur Hitster, Copilot m'a généré un appel à une méthode de l'API Spotify qui n'existe plus depuis 2023. Le code compilait, mais crashait au runtime. J'ai perdu 2 heures à debugger avant de vérifier la doc officielle
- La **dépendance** : au début je copiais-collais sans trop relire. Puis j'ai eu un bug dans la gestion du localStorage de Hitster qui venait d'un code généré que je n'avais pas compris. Depuis, je relis tout et je m'assure de comprendre chaque ligne
- Le **droit d'auteur** : les modèles sont entraînés sur du code open source. Pour un projet d'école c'est pas un problème, mais en entreprise ça peut poser question

Dans ce portfolio, l'IA m'a aidé pour générer les données de test (le JSON des chansons pour Hitster), débugger des regex complexes (l'extraction d'URL Spotify dans `spotify-to-json.mjs`) et structurer la documentation. Mais l'architecture, les choix techniques et le code métier, c'est moi. J'en parle plus en détail dans mon [bilan final](../reflexions/bilan-final.md).

**Sources :** [GitHub Copilot Blog](https://github.blog/ai-and-ml/github-copilot/), [Stack Overflow Developer Survey 2024 – AI](https://survey.stackoverflow.co/2024/ai)

---

## View Transitions API : les transitions de page sans librairie

C'est une API web native qui permet de faire des transitions animées entre deux pages (ou deux états du DOM), directement dans le navigateur. En gros, le genre de transition qu'on voit dans les apps mobiles (slide, fade, morph), mais en standard web, sans installer de librairie.

C'est supporté dans Chrome et Edge depuis mars 2023. Safari et Firefox traînent encore, mais vu que Chrome représente ~65% du marché, c'est déjà utilisable pour pas mal de projets.

Ce qui m'intéresse, c'est que des frameworks comme Astro et Nuxt l'intègrent déjà nativement. Mon Restaurant utilise Vue Router pour la navigation entre les pages, et ajouter des View Transitions permettrait d'avoir un slide fluide entre Menu → Panier → Checkout au lieu d'un changement de page brut. Sur mobile, ça ferait vraiment la différence en termes de ressenti "app native".

J'ai pas encore eu le temps de l'implémenter dans mes projets, mais c'est dans ma liste d'améliorations. Le fait que ce soit une API native (et pas une librairie de plus à maintenir) est un gros argument en sa faveur.

**Sources :** [MDN – View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API), [Chrome Developers – View Transitions](https://developer.chrome.com/docs/web-platform/view-transitions)
