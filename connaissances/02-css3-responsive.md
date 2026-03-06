# CSS3 : Mise en Forme et Responsive Design — Fiche Technique N°02

> **Thème** : Formatage, mise en page et adaptation responsive | **Dernière mise à jour** : Mars 2026 | **Niveau** : Avancé

---

## 1. Introduction et contexte

### Évolution de CSS3
CSS3 (Cascading Style Sheets Level 3), officiellement CSS 2022, représente une révolution dans la présentation web. Contrairement à CSS2, CSS3 adopte une architecture modulaire où chaque fonctionnalité évolue indépendamment, permettant une adoption progressive par les navigateurs.

### Enjeux contemporains (2026)
- **Multi-dispositif** : 70% du trafic web provient de mobiles
- **Performance** : CSS3 permet des animations GPU-accélérées
- **Accessibilité** : préférences utilisateur (`prefers-reduced-motion`, `prefers-color-scheme`)
- **Maintenabilité** : custom properties réduit duplication et facilite refactoring

### Paradigme responsif
Le responsive design n'est plus optionnel : c'est un standard fondamental. Les approches modernes privilégient le **mobile-first** : commencer par les mobiles, ajouter progressivement les règles pour desktop.

---

## 2. Concepts fondamentaux

### 2.1 Flexbox — Mise en page unidimensionnelle

Flexbox offre un contrôle granulaire sur l'alignement, distribution et ordre des éléments enfants.

#### Propriétés du conteneur flex

```css
.container {
  /* Activer flexbox */
  display: flex;

  /* Direction des éléments */
  flex-direction: row;        /* par défaut */
  /* flex-direction: column; */
  /* flex-direction: row-reverse; */
  /* flex-direction: column-reverse; */

  /* Retour à la ligne */
  flex-wrap: wrap;            /* retour automatique */
  /* flex-wrap: nowrap; */     /* une seule ligne */

  /* Abréviation */
  flex-flow: row wrap;

  /* Distribution sur l'axe principal */
  justify-content: space-around;
  /* flex-start | flex-end | center | space-between | space-around | space-evenly */

  /* Alignement sur l'axe croisé */
  align-items: center;
  /* flex-start | flex-end | center | stretch | baseline */

  /* Distribution de plusieurs lignes */
  align-content: space-between;
  /* flex-start | flex-end | center | stretch | space-between | space-around */

  /* Espacement */
  gap: 20px 10px;             /* vertical horizontal */
}
```

#### Propriétés des éléments flex

```css
.item {
  /* Contrôle de croissance */
  flex-grow: 1;               /* part de l'espace restant */

  /* Contraction */
  flex-shrink: 1;             /* réduction proportionnelle */

  /* Taille de base */
  flex-basis: 200px;          /* taille initiale */

  /* Abréviation complète */
  flex: 1 1 200px;            /* grow shrink basis */

  /* Alignement individuel */
  align-self: flex-end;

  /* Ordre d'affichage (sans modifier HTML) */
  order: 2;
}
```

#### Exemple : Navigation responsive avec Flexbox

```css
nav {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #333;
}

nav ul {
  display: flex;
  list-style: none;
  gap: 2rem;
}

nav a {
  color: white;
  text-decoration: none;
  transition: color 0.3s ease;
}

nav a:hover {
  color: #3498db;
}

/* Mobile: stack vertical */
@media (max-width: 768px) {
  nav {
    flex-direction: column;
    gap: 1rem;
  }

  nav ul {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }
}
```

### 2.2 CSS Grid — Mise en page bidimensionnelle

Grid permet de contrôler lignes ET colonnes simultanément.

#### Propriétés du conteneur grid

```css
.grid-container {
  display: grid;

  /* Définir colonnes */
  grid-template-columns: 200px 1fr 200px;
  /* grid-template-columns: repeat(3, 1fr); */
  /* grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); */

  /* Définir lignes */
  grid-template-rows: auto 1fr auto;

  /* Abréviation (colonnes / lignes) */
  grid-template: repeat(3, 1fr) / repeat(3, 1fr);

  /* Espacement */
  gap: 20px;                  /* row-gap column-gap */
  /* row-gap: 20px; column-gap: 30px; */

  /* Alignement global */
  justify-items: center;      /* horizontal */
  align-items: center;        /* vertical */

  /* Justifier conteneur */
  justify-content: space-between;
  align-content: space-around;
}
```

#### Layout CSS Grid complet (3 colonnes + 2 lignes)

```css
/* Définition du layout */
.grid-layout {
  display: grid;
  grid-template-columns: 250px 1fr 250px;
  grid-template-rows: auto 1fr auto;
  grid-gap: 20px;
  min-height: 100vh;
}

/* Placement nommé (named grid areas) */
.grid-layout {
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.aside   { grid-area: aside; }
.footer  { grid-area: footer; }

/* Responsive : 1 colonne sur mobile */
@media (max-width: 768px) {
  .grid-layout {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "aside"
      "footer";
  }
}
```

#### Placement explicite avec numérotation

```css
.grid-item-1 {
  grid-column: 1 / 2;         /* colonne 1 */
  grid-row: 1 / 3;            /* s'étend sur 2 lignes */
}

.grid-item-2 {
  grid-column: 2 / 4;         /* colonnes 2-3 */
  grid-row: 1 / 2;
}

/* Utiliser 'span' pour délimiter en nombre de cases */
.grid-item-3 {
  grid-column: 1 / span 2;    /* occupe 2 colonnes */
  grid-row: span 2;           /* occupe 2 lignes */
}
```

### 2.3 Media Queries et Responsive Design

#### Syntaxe moderne (2026)

```css
/* Mobile-first : styles de base pour mobile */
.container {
  width: 100%;
  padding: 1rem;
}

/* Tablettes (768px+) */
@media (min-width: 768px) {
  .container {
    max-width: 750px;
    margin: 0 auto;
  }
}

/* Desktop petit (1024px+) */
@media (min-width: 1024px) {
  .container {
    max-width: 960px;
  }
}

/* Desktop grand (1440px+) */
@media (min-width: 1440px) {
  .container {
    max-width: 1320px;
  }
}

/* Écrans ultra-larges (2560px+) */
@media (min-width: 2560px) {
  .container {
    max-width: 1600px;
  }
}
```

#### Préférences utilisateur (Accessibility)

```css
/* Mode sombre : respecter les préférences système */
@media (prefers-color-scheme: dark) {
  body {
    background: #1a1a1a;
    color: #e0e0e0;
  }

  a {
    color: #64b5f6;
  }
}

/* Respecter les préférences d'animation */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Écrans tactiles */
@media (hover: none) and (pointer: coarse) {
  button {
    min-height: 48px;         /* Google Material: 48x48px minimum */
    min-width: 48px;
  }
}

/* Orientation */
@media (orientation: portrait) {
  .landscape-only {
    display: none;
  }
}
```

### 2.4 CSS Custom Properties (Variables CSS)

```css
:root {
  /* Couleurs */
  --color-primary: #3498db;
  --color-secondary: #2c3e50;
  --color-success: #27ae60;
  --color-danger: #e74c3c;
  --color-warning: #f39c12;

  /* Typographie */
  --font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-mono: 'Courier New', monospace;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-sm: 14px;

  /* Espacements */
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;

  /* Ombres */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.16);
  --shadow-lg: 0 15px 35px rgba(0, 0, 0, 0.2);

  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-standard: 0.3s ease;
  --transition-slow: 0.5s ease;
}

/* Utilisation */
body {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  color: var(--color-secondary);
}

.button {
  background: var(--color-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 4px;
  transition: background var(--transition-standard);
}

.button:hover {
  background: var(--color-secondary);
}

/* Variables dynamiques (thème sombre) */
@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: #64b5f6;
    --color-secondary: #ffffff;
  }
}

/* Utiliser calc() avec variables */
.container {
  max-width: calc(100% - var(--spacing-lg) * 2);
  margin: 0 auto;
  padding: var(--spacing-md);
}
```

### 2.5 Animations et Transitions

#### Transitions CSS

```css
/* Propriété seule */
.button {
  background: #3498db;
  transition: background 0.3s ease;
}

.button:hover {
  background: #2980b9;
}

/* Propriétés multiples */
.card {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.3s ease, transform 0.3s ease-out;
}

.card:hover {
  opacity: 0.8;
  transform: translateY(-10px);
}

/* Tous les changements */
.element {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
```

#### Animations CSS keyframes

```css
/* Définir l'animation */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-100px);
  }

  50% {
    opacity: 0.5;
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Appliquer l'animation */
.element {
  animation: slideIn 0.6s ease-out forwards;
  /* animation: nom durée timing fill-mode */
}

/* Animation infinie avec délai */
.spinner {
  animation: rotate 2s linear infinite;
  animation-delay: 0.5s;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

#### Transform 2D/3D

```css
/* Translations */
.box {
  transform: translateX(50px);          /* axe X */
  transform: translateY(-30px);         /* axe Y */
  transform: translate(50px, -30px);    /* X et Y */
  transform: translateZ(100px);         /* 3D : Z */
}

/* Rotations */
.rotate {
  transform: rotate(45deg);             /* 2D */
  transform: rotateX(45deg);            /* autour axe X */
  transform: rotateY(45deg);            /* autour axe Y */
  transform: rotate3d(1, 1, 1, 45deg);  /* 3D arbitraire */
}

/* Échelle */
.scale {
  transform: scale(1.5);                /* tous axes */
  transform: scaleX(2);                 /* horizontal */
  transform: scaleY(0.5);               /* vertical */
}

/* Skew (inclinaison) */
.skew {
  transform: skewX(10deg);
  transform: skewY(20deg);
}

/* Combinaisons */
.complex {
  transform: translateX(50px) rotate(45deg) scale(1.2);
  transform-origin: center center;      /* point de rotation */
}

/* Perspective 3D */
.perspective {
  perspective: 1000px;
}

.card {
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.card:hover {
  transform: rotateY(180deg);
}
```

---

## 3. Exemples pratiques : Mise en page complète

### 3.1 Layout responsive avec Grid et Flexbox

```css
/* Structure HTML :
<body>
  <header>Logo + Nav</header>
  <main>
    <article>Contenu principal</article>
    <aside>Barre latérale</aside>
  </main>
  <footer>Pied de page</footer>
</body>
*/

body {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header"
    "main"
    "footer";
  min-height: 100vh;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

header {
  grid-area: header;
  background: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

header nav {
  display: flex;
  gap: 2rem;
}

header nav a {
  color: white;
  text-decoration: none;
  transition: color 0.3s ease;
}

header nav a:hover {
  color: #3498db;
}

main {
  grid-area: main;
  display: grid;
  grid-template-columns: 1fr 250px;
  gap: 2rem;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

article {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

aside {
  background: #ecf0f1;
  padding: 1.5rem;
  border-radius: 8px;
}

footer {
  grid-area: footer;
  background: #2c3e50;
  color: white;
  text-align: center;
  padding: 2rem;
  margin-top: auto;
}

/* Responsive : tablette */
@media (max-width: 1024px) {
  main {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
}

/* Responsive : mobile */
@media (max-width: 768px) {
  body {
    grid-template-areas:
      "header"
      "main"
      "footer";
  }

  header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  header nav {
    flex-direction: column;
    gap: 1rem;
  }

  main {
    padding: 1rem;
    gap: 1rem;
  }

  article,
  aside {
    padding: 1rem;
  }

  footer {
    padding: 1rem;
  }
}
```

### 3.2 Galerie responsive avec Grid auto

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px;
}

.gallery-item {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  aspect-ratio: 1;                       /* carré */
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.gallery-item:hover img {
  transform: scale(1.1);
}

.gallery-item-overlay {
  position: absolute;
  inset: 0;                              /* top right bottom left */
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.gallery-item:hover .gallery-item-overlay {
  opacity: 1;
}

.gallery-item-overlay h3 {
  color: white;
  text-align: center;
}
```

### 3.3 Formulaire responsive avec Flexbox

```css
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

/* Mobile : une colonne */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }

  .form-row .form-group {
    flex: 1 1 100%;
  }
}

.button-group {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.button-primary {
  background: #3498db;
  color: white;
}

.button-primary:hover {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.button-secondary {
  background: #ecf0f1;
  color: #2c3e50;
  border: 1px solid #bdc3c7;
}

.button-secondary:hover {
  background: #bdc3c7;
}
```

---

## 4. Bonnes pratiques

### 4.1 Performance CSS
- Minifier le CSS en production
- Utiliser des media queries efficaces (desktop-first → mobile-first)
- Éviter les animations sur de nombreux éléments simultanément
- Préférer `transform` et `opacity` pour les animations (GPU-accélérées)
- Éviter les `box-shadow` complexes et les gradients coûteux

### 4.2 Accessibilité
- Implémenter `prefers-reduced-motion` pour les utilisateurs sensibles
- Contraste suffisant des couleurs (WCAG AA minimum 4.5:1 pour texte)
- Ne pas cacher d'informations essentielles au survol uniquement
- Tester les media queries avec des outils d'inspection

### 4.3 Maintenabilité
- Utiliser une architecture CSS (BEM, SMACSS, ou autre)
- Custom properties pour valeurs réutilisables
- Commenter les sections complexes (grids, animations)
- Valider le CSS avec W3C Validator

### 4.4 Compatibilité navigateurs
- Vérifier sur Can I Use avant utilisation
- Fournir des dégradés (fallback) pour Grid/Flexbox
- Tester sur Chrome, Firefox, Safari, Edge
- Utiliser des préfixes uniquement si nécessaire (autoprefixer)

---

## 5. Comparaison et alternatives

### 5.1 Flexbox vs Grid
| Aspect | Flexbox | Grid |
|--------|---------|------|
| Dimensions | 1D (une direction) | 2D (lignes + colonnes) |
| Cas d'usage | Navigation, alignement | Layout global |
| Complexité | Simple | Moyenne |
| Imbrication | Souvent profonde | Plates structures |

### 5.2 Alternatives à CSS moderne
- **Bootstrap Grid** : CSS prédéfini (moins flexible)
- **Tailwind CSS** : Utility-first (voir fiche 4)
- **CSS-in-JS** : Styled-components, Emotion (dynamique)
- **SASS/LESS** : Préprocesseurs (variables, mixins)

---

## 6. Ressources externes — Analyse critique

### 6.1 CSS-Tricks (https://css-tricks.com/)
**Qualités** :
- Spécialisation : fokus exclusif sur CSS
- Pédagogie : explications progressives et visuelles
- Autheurs : développeurs expérimentés (Chris Coyier)
- Illustrations : diagrammes animés très efficaces
- Cas réels : articles basés sur problèmes pratiques

**Limitations** :
- Biais vers les solutions "creatives" plutôt que standards
- Parfois manque de couverture exhaustive

**Recommandation** : Excellente source pour comprendre concepts, compléter avec MDN pour référence.

### 6.2 MDN Web Docs — CSS (https://developer.mozilla.org/docs/Web/CSS/)
**Qualités** :
- Référence officielle navigateurs
- Couverture complète et exhaustive
- Support navigateur précis par propriété
- Exemples interactifs
- Maintenance continue

**Limitations** :
- Formulation parfois technique
- Moins d'explications pédagogiques que CSS-Tricks

**Recommandation** : Source primaire obligatoire pour vérifications.

### 6.3 Can I Use (https://caniuse.com/)
**Qualités** :
- Exactitude : données directes des navigateurs
- Visualisation : tableaux de support clairs
- Granularité : versions de navigateurs
- Filtres : recherche par catégorie

**Limitations** :
- Ne fournit pas "comment" utiliser une feature
- Lag possible sur nouvelles sorties

**Recommandation** : Toujours vérifier avant déploiement en production.

### 6.4 W3C CSS Specifications (https://www.w3.org/Style/CSS/)
**Qualités** :
- Autorité : standard officiel
- Complétude : chaque détail

**Limitations** :
- Extrêmement technique
- Pas recommandé pour apprentissage

**Recommandation** : Consultation ponctuelle pour clarifications.

---

## 7. Points clés à retenir

### Fondamentaux
1. **Mobile-first** : styles de base pour mobiles, améliorations progressives
2. **Flexbox pour 1D**, **Grid pour 2D** : choisir l'outil adapté
3. **Custom properties** : DRY (Don't Repeat Yourself) en CSS

### Layout moderne
- Utiliser Grid pour layouts principaux
- Utiliser Flexbox pour composants internes
- Combiner pour maximum flexibilité

### Responsive
- Media queries pour adaptation logique
- Respecter préférences utilisateur (couleurs, motion)
- Tester sur vrais appareils, pas juste navigateur resizé

### Performance
- `transform` et `opacity` uniquement pour animations
- Minifier + compresser CSS
- Éviter les calculs complexes dans styles

### Accessibilité
- Contraste couleurs vérifiables
- Pas de dépendance exclusive au survol
- Respecter `prefers-reduced-motion`

### Maintenance
- Structure cohérente (BEM, conventions)
- Variables pour valeurs répétées
- Documenter choix de layout complexes

---

**Dernier révision** : Mars 2026
**Validé par** : W3C CSS Working Group
