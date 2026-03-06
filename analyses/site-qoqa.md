# Analyse du site Qoqa.ch

## Pourquoi ce site ?

J'ai choisi Qoqa parce que c'est l'inverse total de CFF.ch. Là où les CFF misent sur l'efficacité sobre, Qoqa mise tout sur le fun, l'urgence et le visuel. C'est aussi un site suisse que je connais en tant qu'utilisateur — j'ai déjà acheté des trucs dessus et je voulais comprendre comment leur système de "deal du jour" influence les choix techniques.

L'analyse porte sur la page d'accueil et le parcours d'achat, avec les mêmes outils que pour CFF (Lighthouse, DevTools, axe).

---

## UX et gamification

Le premier truc qui frappe quand on regarde le code de Qoqa, c'est à quel point tout est pensé pour te pousser à acheter. La barre de progression ("Plus que 12% !"), le compte à rebours, les indicateurs de stock limité — c'est du FOMO (Fear Of Missing Out) pur et dur.

Les micro-interactions sont bien faites : les boutons réagissent au survol avec un petit scale, l'animation d'ajout au panier est satisfaisante. C'est le genre de "game juice" que j'ai essayé de reproduire dans Hitster avec les confettis et les sons de feedback. La différence, c'est que chez Qoqa ça sert à vendre, dans Hitster ça sert à récompenser.

Il y a aussi toute une dimension communautaire (commentaires, votes, partage) qui fait que le site est à mi-chemin entre un e-commerce et un réseau social. C'est malin, mais ça a un coût technique — on va le voir avec la performance.

Honnêtement, l'urgence artificielle me dérange un peu en tant qu'utilisateur. Quand tu vois "PLUS QUE 3 EN STOCK" et que le lendemain le même produit revient... ça casse la confiance. Dans Hitster, j'ai essayé de garder le côté fun sans cette manipulation.

---

## Performance

Là, c'est beaucoup moins glorieux que les CFF.

| Métrique | Valeur | Seuil "Bon" | |
|---|---|---|---|
| LCP | ~3.8s | < 2.5s | Mauvais |
| INP | ~280ms | < 200ms | Moyen |
| CLS | ~0.15 | < 0.1 | Mauvais |
| Score global | 52/100 | > 90 | Mauvais |
| Score accessibilité | 68/100 | > 90 | Insuffisant |

52 en performance mobile, c'est franchement pas terrible pour un site e-commerce où chaque seconde de chargement = des ventes en moins. Google estime d'ailleurs que chaque 100ms de latence supplémentaire coûte environ 1% de conversion.

En regardant dans le détail :

Le **LCP à 3.8s** vient en grande partie de l'image produit principale. Elle est servie en JPEG haute résolution (~800 Ko) au lieu de WebP. Pas de `srcset` non plus, donc un téléphone charge la même image qu'un écran 4K. C'est surprenant pour un site de cette taille.

Le **CLS à 0.15** s'explique facilement : les bannières promo et les barres de progression se chargent dynamiquement sans espace réservé. Résultat, la page "saute" pendant le chargement. CFF résout ça avec des `min-height` fixes — c'est basique mais ça marche.

Le **bundle JS pèse ~1.2 Mo** (non compressé). Sur un smartphone moyen, le thread principal est bloqué ~2 secondes au chargement. Le module commentaires et le chat communautaire pourraient largement être lazy-loadés — tu n'en as pas besoin tant que tu n'as pas scrollé jusqu'en bas.

La comparaison avec CFF (88 vs 52) est parlante : CFF optimise pour l'efficacité, Qoqa pour l'engagement visuel. C'est un compromis, mais pour un site mobile-first comme Qoqa, je pense qu'ils y perdent plus qu'ils n'y gagnent.

---

## Accessibilité

C'est le gros point noir du site, et ça m'a un peu choqué pour une boîte suisse de cette taille.

| Problème | Critère WCAG | Sévérité |
|---|---|---|
| Contraste du rose Qoqa (#E84C8A) sur gris (#888) : ratio ~3.1:1 au lieu de 4.5:1 | 1.4.3 – Contraste | Haute |
| Modales (newsletter, cookies, offres flash) pas fermables au clavier, pas de focus trap | 2.1.1 / 2.4.3 – Clavier et focus | Critique |
| Bouton "Ajouter au panier" = SVG sans `aria-label` | 4.1.2 – Nom, rôle, valeur | Haute |
| Pas de skip link | 2.4.1 – Contourner des blocs | Moyenne |
| Compte à rebours non annoncé aux lecteurs d'écran | 4.1.3 – Messages d'état | Moyenne |

Le problème de contraste est visible à l'oeil nu : le rose Qoqa sur fond gris, c'est dur à lire même pour quelqu'un sans déficience visuelle. Un rose plus foncé (#D63384) donnerait un ratio de 4.6:1 sans changer l'identité de la marque.

Le plus grave à mon avis, c'est les modales. Quand une pop-up newsletter s'ouvre, tu ne peux pas la fermer avec `Escape` si tu navigues au clavier. Le focus ne bouge même pas vers la modale — il reste "derrière". Pour un utilisateur de lecteur d'écran, c'est comme si la modale n'existait pas, sauf qu'elle bloque visuellement tout le reste. C'est exactement le problème inverse de ce que j'ai trouvé chez CFF (où les modales ne capturent pas le focus mais restent fermables).

Le bouton d'ajout au panier contient juste un SVG sans aucun label. Un lecteur d'écran va lire "bouton" sans rien d'autre. Un simple `aria-label="Ajouter [nom du produit] au panier"` réglerait le problème.

---

## SEO

Malgré les problèmes de performance, le SEO a des points intéressants.

Le modèle "deal du jour" génère du contenu unique quotidien avec descriptions, photos et avis — Google adore ça. Les URLs sont propres (`/fr/product/nom-du-produit-12345`), et ils utilisent Schema.org `Product` avec prix, disponibilité et avis, ce qui permet d'afficher les étoiles et le prix directement dans les résultats Google.

Par contre, j'ai trouvé des meta descriptions identiques sur plusieurs pages produits ("Découvrez l'offre Qoqa du jour !"). C'est le genre de truc qui arrive quand le template par défaut n'est pas personnalisé. Et il manque des `<link rel="canonical">` sur certaines variantes d'URL (avec/sans paramètres de tracking), ce qui peut créer du contenu dupliqué.

Le vrai problème SEO de Qoqa, c'est indirect : avec un score performance de 52/100 en mobile, Google les pénalise dans le classement mobile-first. Toute l'optimisation de contenu est un peu annulée par la lenteur du site.

---

## Comparaison CFF vs Qoqa vs mon Restaurant

| | CFF.ch | Qoqa.ch | Mon Restaurant |
|---|---|---|---|
| Rendu | SSR (serveur) | SSR + JS lourd | SPA (Vue 3 + Vite) |
| Framework | Propriétaire | React (probablement Next.js) | Vue 3 |
| Images | WebP + srcset | JPEG sans srcset | SVG / pas d'images lourdes |
| Accessibilité | 91/100 | 68/100 | ~80/100 (estimé) |
| SEO | Excellent (SSR + Schema.org) | Correct (bon contenu, mauvaise perf) | Limité (SPA hash routing) |
| Performance | 88/100 | 52/100 | ~90/100 (app légère) |

Ce tableau résume bien les compromis. CFF, c'est la rigueur. Qoqa, c'est l'engagement au détriment de la qualité technique. Mon Restaurant est quelque part entre les deux : bon en performance (parce que c'est léger), correct en accessibilité (j'ai fait l'effort des ARIA), mais faible en SEO à cause du hash routing. Si c'était un vrai site commercial, j'aurais dû partir sur Nuxt.js pour avoir du SSR.

---

## Ce que j'en tire

Qoqa m'a surtout appris ce qu'il ne faut PAS faire :
- Sacrifier l'accessibilité pour le design, c'est pas acceptable en 2026, même pour un site privé
- Les images non optimisées sur un site à fort trafic, c'est du gaspillage de bande passante
- Un bundle JS de 1.2 Mo sans code-splitting, c'est le genre de dette technique qui s'accumule

Mais aussi ce qu'ils font bien :
- La gamification et les micro-interactions rendent l'expérience mémorable (j'ai appliqué ça dans Hitster)
- Schema.org `Product` avec les rich snippets, c'est malin et pas si compliqué à mettre en place
- Le contenu communautaire (avis, commentaires) est un vrai atout SEO

La comparaison avec CFF montre qu'il n'y a pas de solution universelle : le choix technique dépend du contexte métier. Mais certains fondamentaux (contraste, navigation clavier, images optimisées) devraient être non négociables quel que soit le type de site.

---

**Sources utilisées :**
*   [Google – Core Web Vitals](https://web.dev/vitals/) — métriques de performance web
*   [W3C – WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/) — les critères d'accessibilité vérifiés
*   [Google – Page Experience Update](https://developers.google.com/search/docs/appearance/page-experience) — impact de la performance sur le SEO
*   [Schema.org – Product](https://schema.org/Product) — données structurées utilisées par Qoqa
*   [WebAIM – Contrast Checker](https://webaim.org/resources/contrastchecker/) — outil utilisé pour vérifier les ratios de contraste
