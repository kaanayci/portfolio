# Bootstrap : Framework CSS Complet — Fiche Technique N°03

> **Thème** : Framework CSS responsive et composants UI | **Dernière mise à jour** : Mars 2026 | **Niveau** : Intermédiaire

---

## 1. Introduction et contexte

### Historique et évolution
Bootstrap est né en 2011 chez Twitter, initialement nommé "Twitter Bootstrap". Créé par Mark Otto et Jacob Thornton, c'était un projet interne visant à standardiser les développements Frontend au sein de l'entreprise. Le framework a été libéré en tant que logiciel open-source et est devenu l'une des frameworks CSS les plus populaires au monde.

### Versions majeures (2011-2026)
- **v1** (2011) : Sortie initiale, CSS de base
- **v2** (2012) : Responsive design, Sass support
- **v3** (2013) : Mobile-first, Flat design
- **v4** (2018) : Flexbox, Sass uniquement, CSS variables
- **v5** (2021) : Abandon jQuery, CSS modernes, ES modules
- **v5.3+** (2024-2026) : Améliorations CSS, composants affinés

### Positionnement (2026)
Bootstrap reste le choix par défaut pour :
- **Prototypage rapide** : commencer vite avec design professionnel
- **Équipes réduites** : peu de designers, flexibilité CSS
- **Compatibilité** : support large des navigateurs
- **Écosystème** : nombreuses ressources et extensions

Cependant, Tailwind CSS gagne du terrain pour **customisation avancée** (voir fiche 4).

---

## 2. Concepts fondamentaux

### 2.1 Système de grille Bootstrap

#### Philosophie
Bootstrap utilise un système de **grille à 12 colonnes** responsive, hérité de cadres de mise en page traditionnels.

#### Points de rupture (Breakpoints)
```scss
/* Définis dans _variables.scss */
$breakpoints: (
  xs: 0,           /* Mobile : -∞ → 575px */
  sm: 576px,       /* Petit mobile : 576px → 767px */
  md: 768px,       /* Tablette : 768px → 991px */
  lg: 992px,       /* Desktop : 992px → 1199px */
  xl: 1200px,      /* Grand desktop : 1200px → 1399px */
  xxl: 1400px      /* Ultra-large : 1400px+ */
);
```

#### Structure HTML
```html
<!-- Conteneur fluide (100% largeur avec padding) -->
<div class="container-fluid">
  <!-- Ligne = flexbox avec 12 colonnes -->
  <div class="row">
    <!-- Colonnes : définir largeur avec col-{breakpoint}-{nombre} -->
    <div class="col-12 col-md-6 col-lg-4">
      Contenu
    </div>
  </div>
</div>

<!-- Conteneur fixe (largeur max selon breakpoint) -->
<div class="container">
  <div class="row">
    <!-- Auto-layout : colonnes égales -->
    <div class="col">Colonne auto</div>
    <div class="col">Colonne auto</div>
    <div class="col">Colonne auto</div>
  </div>
</div>
```

#### Exemples de grilles
```html
<!-- 3 colonnes sur desktop, 2 sur tablette, 1 sur mobile -->
<div class="container">
  <div class="row">
    <div class="col-12 col-md-6 col-lg-4">Colonne 1</div>
    <div class="col-12 col-md-6 col-lg-4">Colonne 2</div>
    <div class="col-12 col-md-6 col-lg-4">Colonne 3</div>
  </div>
</div>

<!-- Colonne large + barre latérale -->
<div class="container">
  <div class="row">
    <main class="col-12 col-lg-8">Contenu principal (8/12)</main>
    <aside class="col-12 col-lg-4">Barre latérale (4/12)</aside>
  </div>
</div>

<!-- Alignement vertical -->
<div class="container">
  <div class="row align-items-center" style="height: 300px;">
    <div class="col">Centré verticalement</div>
  </div>
</div>

<!-- Alignement horizontal -->
<div class="container">
  <div class="row justify-content-center">
    <div class="col-6">Centré horizontalement (6/12 = 50%)</div>
  </div>
</div>

<!-- Décalage (offset) -->
<div class="container">
  <div class="row">
    <div class="col-4 offset-4">Colonne décalée (4/12 + offset)</div>
  </div>
</div>
```

#### Utilitaires Flexbox
```html
<!-- Justification sur l'axe principal -->
<div class="row justify-content-between">
  <div class="col">Item 1</div>
  <div class="col">Item 2</div>
</div>

<!-- Alignement sur l'axe croisé -->
<div class="row align-items-start">  <!-- flex-start -->
<div class="row align-items-center"> <!-- center -->
<div class="row align-items-end">    <!-- flex-end -->

<!-- Espacement entre items -->
<div class="row g-3">  <!-- gap: 1rem -->
<div class="row g-5">  <!-- gap: 3rem -->

<!-- Colonnes avec espacement horizontal/vertical différent -->
<div class="row gx-2 gy-4">
</div>
```

### 2.2 Composants UI Bootstrap

#### Boutons
```html
<!-- Styles de boutons -->
<button class="btn btn-primary">Primaire</button>
<button class="btn btn-secondary">Secondaire</button>
<button class="btn btn-success">Succès</button>
<button class="btn btn-danger">Danger</button>
<button class="btn btn-warning">Avertissement</button>
<button class="btn btn-info">Information</button>
<button class="btn btn-light">Clair</button>
<button class="btn btn-dark">Foncé</button>

<!-- Variantes outline -->
<button class="btn btn-outline-primary">Outline</button>

<!-- Tailles -->
<button class="btn btn-primary btn-lg">Grand</button>
<button class="btn btn-primary">Défaut</button>
<button class="btn btn-primary btn-sm">Petit</button>

<!-- État désactivé -->
<button class="btn btn-primary" disabled>Désactivé</button>

<!-- Groupe de boutons -->
<div class="btn-group" role="group">
  <button class="btn btn-outline-primary">Gauche</button>
  <button class="btn btn-outline-primary">Milieu</button>
  <button class="btn btn-outline-primary">Droite</button>
</div>

<!-- Toggle button -->
<button class="btn btn-primary" data-bs-toggle="button">
  Bouton toggle
</button>
```

#### Formulaires
```html
<form>
  <!-- Groupe de formulaire -->
  <div class="mb-3">
    <label for="email" class="form-label">Adresse email</label>
    <input
      type="email"
      class="form-control"
      id="email"
      placeholder="exemple@test.com">
    <div class="form-text">Nous ne partagerons jamais votre email.</div>
  </div>

  <!-- Groupe avec feedback -->
  <div class="mb-3">
    <label for="username" class="form-label">Utilisateur</label>
    <input
      type="text"
      class="form-control is-valid"
      id="username"
      value="Valide">
    <div class="valid-feedback">
      Cet utilisateur existe et est disponible.
    </div>
  </div>

  <!-- Textarea -->
  <div class="mb-3">
    <label for="message" class="form-label">Message</label>
    <textarea
      class="form-control"
      id="message"
      rows="3"></textarea>
  </div>

  <!-- Select -->
  <div class="mb-3">
    <label for="category" class="form-label">Catégorie</label>
    <select class="form-select" id="category">
      <option selected>Sélectionner...</option>
      <option value="1">Générale</option>
      <option value="2">Technique</option>
      <option value="3">Support</option>
    </select>
  </div>

  <!-- Checkbox -->
  <div class="form-check mb-3">
    <input class="form-check-input" type="checkbox" id="accepter">
    <label class="form-check-label" for="accepter">
      J'accepte les conditions
    </label>
  </div>

  <!-- Radio buttons -->
  <div class="mb-3">
    <div class="form-check">
      <input class="form-check-input" type="radio" name="genre" id="homme">
      <label class="form-check-label" for="homme">Homme</label>
    </div>
    <div class="form-check">
      <input class="form-check-input" type="radio" name="genre" id="femme">
      <label class="form-check-label" for="femme">Femme</label>
    </div>
  </div>

  <button type="submit" class="btn btn-primary">Envoyer</button>
</form>
```

#### Navbar (Navigation responsive)
```html
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <div class="container-fluid">
    <!-- Marque/Logo -->
    <a class="navbar-brand" href="#">MaSociété</a>

    <!-- Bouton hamburger mobile -->
    <button
      class="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarNav"
      aria-controls="navbarNav"
      aria-expanded="false"
      aria-label="Basculer navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <!-- Éléments de navigation (effondrables) -->
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item">
          <a class="nav-link active" href="#">Accueil</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">À propos</a>
        </li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="dropdownMenu">
            Services
          </a>
          <ul class="dropdown-menu" aria-labelledby="dropdownMenu">
            <li><a class="dropdown-item" href="#">Design</a></li>
            <li><a class="dropdown-item" href="#">Développement</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#">Autre</a></li>
          </ul>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">Contact</a>
        </li>
      </ul>
    </div>
  </div>
</nav>
```

#### Modales (Dialogues)
```html
<!-- Bouton pour déclencher la modale -->
<button
  type="button"
  class="btn btn-primary"
  data-bs-toggle="modal"
  data-bs-target="#modale">
  Ouvrir modale
</button>

<!-- Modale HTML -->
<div class="modal fade" id="modale" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <!-- En-tête -->
      <div class="modal-header">
        <h5 class="modal-title">Titre de la modale</h5>
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="modal"
          aria-label="Fermer"></button>
      </div>

      <!-- Corps -->
      <div class="modal-body">
        Contenu de la modale ici.
      </div>

      <!-- Pied de page -->
      <div class="modal-footer">
        <button
          type="button"
          class="btn btn-secondary"
          data-bs-dismiss="modal">
          Fermer
        </button>
        <button type="button" class="btn btn-primary">
          Enregistrer
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Ouverture par JavaScript -->
<script>
  const modale = new bootstrap.Modal(
    document.getElementById('modale')
  );
  modale.show();
</script>
```

#### Carousel (Diaporama)
```html
<div id="carousel" class="carousel slide" data-bs-ride="carousel">
  <!-- Indicateurs -->
  <div class="carousel-indicators">
    <button
      type="button"
      data-bs-target="#carousel"
      data-bs-slide-to="0"
      class="active"></button>
    <button type="button" data-bs-target="#carousel" data-bs-slide-to="1"></button>
    <button type="button" data-bs-target="#carousel" data-bs-slide-to="2"></button>
  </div>

  <!-- Images -->
  <div class="carousel-inner">
    <div class="carousel-item active">
      <img src="image1.jpg" class="d-block w-100" alt="...">
    </div>
    <div class="carousel-item">
      <img src="image2.jpg" class="d-block w-100" alt="...">
    </div>
    <div class="carousel-item">
      <img src="image3.jpg" class="d-block w-100" alt="...">
    </div>
  </div>

  <!-- Contrôles -->
  <button
    class="carousel-control-prev"
    type="button"
    data-bs-target="#carousel"
    data-bs-slide="prev">
    <span class="carousel-control-prev-icon"></span>
  </button>
  <button
    class="carousel-control-next"
    type="button"
    data-bs-target="#carousel"
    data-bs-slide="next">
    <span class="carousel-control-next-icon"></span>
  </button>
</div>
```

### 2.3 Installation et intégration

#### Via CDN
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ma page Bootstrap</title>
  <!-- CSS Bootstrap -->
  <link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
    rel="stylesheet">
</head>
<body>
  <h1>Bonjour le monde!</h1>

  <!-- JavaScript Bootstrap (Bundle avec Popper) -->
  <script
    src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js">
  </script>
</body>
</html>
```

#### Via NPM
```bash
# Installation
npm install bootstrap

# Ou avec yarn
yarn add bootstrap
```

```javascript
// main.js ou index.js
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
```

#### Via Composer (PHP)
```bash
composer require twbs/bootstrap
```

### 2.4 Customisation via SCSS

#### Surcharger les variables par défaut
```scss
// custom.scss
// Importer d'abord les variables par défaut
@import '../node_modules/bootstrap/scss/variables';

// Surcharger les variables
$primary: #ff6b6b;
$secondary: #4ecdc4;
$success: #95e77d;
$danger: #ff6b6b;
$font-family-base: 'Segoe UI', Roboto, sans-serif;
$font-size-base: 1rem;
$border-radius: 0.5rem;

// Puis importer le reste de Bootstrap
@import '../node_modules/bootstrap/scss/mixins';
@import '../node_modules/bootstrap/scss/root';
@import '../node_modules/bootstrap/scss/reboot';
// ... (importer sélectivement les composants nécessaires)
@import '../node_modules/bootstrap/scss/containers';
@import '../node_modules/bootstrap/scss/grid';
@import '../node_modules/bootstrap/scss/buttons';
@import '../node_modules/bootstrap/scss/forms';
```

#### Créer des composants personnalisés
```scss
// Ajouter après Bootstrap
.card-custom {
  @extend .card;
  border-radius: $border-radius;
  border: 2px solid $primary;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
  }
}

.button-large {
  @extend .btn;
  @extend .btn-primary;
  padding: 1rem 2rem;
  font-size: 1.25rem;
  font-weight: bold;
}
```

---

## 3. Exemple complet : Mise en page avec Bootstrap

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Site Bootstrap moderne</title>
  <link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
    rel="stylesheet">
  <style>
    body {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    main {
      flex: 1;
    }

    .hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 6rem 2rem;
      text-align: center;
    }

    .card-custom {
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .card-custom:hover {
      transform: translateY(-10px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
    }
  </style>
</head>
<body>
  <!-- Navbar -->
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
    <div class="container">
      <a class="navbar-brand fw-bold" href="#">BootstrapSite</a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <a class="nav-link" href="#features">Fonctionnalités</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#contact">Contact</a>
          </li>
          <li class="nav-item">
            <a class="btn btn-primary ms-2" href="#signup">S'inscrire</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <!-- Section héro -->
  <section class="hero">
    <div class="container">
      <h1 class="display-4 fw-bold mb-4">Bienvenue sur Bootstrap</h1>
      <p class="lead mb-4">
        Créez des sites responsive rapidement avec Bootstrap
      </p>
      <a href="#features" class="btn btn-light btn-lg">
        Découvrir →
      </a>
    </div>
  </section>

  <!-- Contenu principal -->
  <main class="py-5">
    <div class="container">
      <!-- Section caractéristiques -->
      <section id="features" class="mb-5">
        <h2 class="text-center mb-5">Nos fonctionnalités</h2>
        <div class="row g-4">
          <div class="col-12 col-md-6 col-lg-4">
            <div class="card card-custom h-100 shadow-sm">
              <div class="card-body">
                <h5 class="card-title">Responsive</h5>
                <p class="card-text">
                  S'adapte à tous les appareils et tailles d'écran.
                </p>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6 col-lg-4">
            <div class="card card-custom h-100 shadow-sm">
              <div class="card-body">
                <h5 class="card-title">Accessible</h5>
                <p class="card-text">
                  Conforme aux normes WCAG pour l'accessibilité.
                </p>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6 col-lg-4">
            <div class="card card-custom h-100 shadow-sm">
              <div class="card-body">
                <h5 class="card-title">Customizable</h5>
                <p class="card-text">
                  Personnalisable via SCSS et variables CSS.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section contact / formulaire -->
      <section id="contact" class="bg-light py-5 rounded">
        <div class="container">
          <h2 class="mb-4">Nous contacter</h2>
          <div class="row">
            <div class="col-12 col-lg-6">
              <form>
                <div class="mb-3">
                  <label for="nom" class="form-label">Nom</label>
                  <input type="text" class="form-control" id="nom" required>
                </div>
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input type="email" class="form-control" id="email" required>
                </div>
                <div class="mb-3">
                  <label for="message" class="form-label">Message</label>
                  <textarea
                    class="form-control"
                    id="message"
                    rows="4"
                    required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">
                  Envoyer
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>

  <!-- Footer -->
  <footer class="bg-dark text-white text-center py-4 mt-5">
    <p>&copy; 2026 BootstrapSite. Tous droits réservés.</p>
  </footer>

  <script
    src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js">
  </script>
</body>
</html>
```

---

## 4. Bonnes pratiques

### 4.1 Structure et organisation
- Utiliser `container` ou `container-fluid` comme wrapper
- Respecter la hiérarchie grid (container → row → col)
- Ajouter des classes utilitaires Bootstrap plutôt que CSS personnalisé
- Documenter les customisations SCSS

### 4.2 Performance
- Utiliser CDN pour Bootstrap (meilleur caching)
- Ne charger que les composants nécessaires si customisation SCSS
- Minifier CSS/JavaScript en production
- Utiliser `defer` sur scripts externes

### 4.3 Accessibilité
- Utiliser attributs `aria-*` pour composants complexes
- Tester avec lecteurs d'écran (NVDA, JAWS)
- Vérifier contrastes de couleurs (WCAG AA)
- Ne pas cacher informations essentielles au survol

### 4.4 Compatibilité
- Bootstrap v5 ne supporte pas IE11
- Vérifier Can I Use pour polyfills si support antérieur
- Tester sur Chrome, Firefox, Safari, Edge

---

## 5. Comparaison et alternatives

### 5.1 Bootstrap vs CSS from scratch
| Aspect | Bootstrap | CSS pur |
|--------|-----------|---------|
| Temps de démarrage | Immédiat | Lent |
| Cohérence design | Garantie | À gérer |
| Customisation | Modérée | Totale |
| Taille fichier | 150-180 KB | Minimal |
| Apprentissage | Courbe douce | Courbe adaptée |

### 5.2 Bootstrap vs alternatives
| Framework | Forces | Faiblesses |
|-----------|--------|-----------|
| **Tailwind CSS** | Personnalisation extrême | Courbe d'apprentissage |
| **Foundation** | Composants avancés | Complexité |
| **Bulma** | Syntaxe simple | Moins populaire |
| **Materialize** | Material Design | Peu maintenu |

---

## 6. Ressources externes — Analyse critique

### 6.1 Bootstrap Official Documentation (https://getbootstrap.com/)
**Qualités** :
- Source primaire officielle
- Exemples interactifs directs
- Couverture complète des composants
- Bien entretenu et à jour
- Sections API précises

**Limitations** :
- Parfois trop technique pour débutants
- Manque d'explications conceptuelles approfondies

**Recommandation** : Référence obligatoire pour détails exacts.

### 6.2 Bootstrap Studios / PlayCode Interactive
**Qualités** :
- Éditeurs visuels en ligne
- Tests instantanés de composants
- Pas d'installation requise
- Parfait pour expérimentation

**Limitations** :
- Dépendance à internet
- Export limité

**Recommandation** : Excellente pour apprentissage et prototypage.

### 6.3 W3Schools Bootstrap (https://www.w3schools.com/bootstrap5/)
**Qualités** :
- Progressif du basique à l'avancé
- Éditeur intégré "Try it Yourself"
- Explications simples
- Nombreuses variantes d'exemples

**Limitations** :
- Parfois superficiel
- Exemples trop simples pour avancé
- Pas de cas d'usage réels

**Recommandation** : Bon pour débuter, consolider avec docs officielles.

### 6.4 Bootstrap Themes (ThemeForest, Themezilla)
**Qualités** :
- Thèmes prêts à l'emploi
- Designs professionnels
- Économie de temps
- Support fournisseur souvent inclus

**Limitations** :
- Coûts (pas gratuit)
- Dépendance aux fournisseurs
- Customisation souvent difficile
- Qualité variable

**Recommandation** : Utile pour projets commerciaux rapidement, vérifier personnalisation possible.

---

## 7. Points clés à retenir

### Système de grille
- **12 colonnes** : structure standard
- **6 breakpoints** : xs, sm, md, lg, xl, xxl
- **Mobile-first** : classes sans suffixe = mobile
- **Responsive** : ajouter suffixes pour plus grandes résolutions

### Composants essentiels
- **Navbar** : navigation sticky/responsif
- **Buttons** : styles multiples préfaits
- **Forms** : styling cohérent et accessible
- **Cards** : conteneurs polyvalents
- **Modals** : dialogues accessibles
- **Carousel** : diaporamas

### Installation
- **CDN** : plus simple, pour petits projets
- **NPM** : recommandé pour production, customisation
- **Composer** : si écosystème PHP

### Customisation
- SCSS variables pour changements globaux
- Classes utilitaires pour fine-tuning
- Éviter surcharger styles Bootstrap

### Quand utiliser Bootstrap
- Prototypage rapide
- Équipes sans designer
- Projets avec support navigateur large
- MVP/POC

### Quand préférer alternative
- Customisation extrême → Tailwind CSS
- Composants très spécifiques → Framework composants
- Performance maximale → CSS pur

---

**Dernier révision** : Mars 2026
**Version référencée** : Bootstrap 5.3+
