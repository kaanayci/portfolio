# Accessibilité Web : Normes WCAG — Fiche Technique N°12

> **Thème** : Conception Inclusive et Standards Web | **Dernière mise à jour** : Mars 2026 | **Niveau** : Intermédiaire/Avancé

---

## 1. Introduction et contexte

L'accessibilité web est la pratique de concevoir et de développer des sites et applications web accessibles à **tous**, indépendamment de leurs capacités physiques, sensorielles ou cognitives. Selon l'Organisation Mondiale de la Santé (OMS), environ **15% de la population mondiale** vit avec une forme de handicap, soit plus d'un milliard de personnes.

Les directives WCAG (Web Content Accessibility Guidelines) ont été formalisées par le W3C (World Wide Web Consortium) pour établir des normes communes d'accessibilité. La version actuelle, WCAG 2.1 (2018), reste le standard de référence international.

**Importance :**
- Accès inclusif à l'information et aux services en ligne
- Conformité légale (ADA aux USA, Loi Handicap en France, etc.)
- Amélioration de l'expérience utilisateur globale
- SEO renforcé (moteurs de recherche valorisent l'accessibilité)
- Responsabilité sociale et éthique

**Statistiques :**
- 1 milliard de personnes en situation de handicap
- 253 millions ont une déficience visuelle
- 430 millions ont une perte auditive
- Nombreuses personnes ayant des handicaps moteurs ou cognitifs
- L'accessibilité aide aussi les personnes sans handicap (personnes âgées, utilisations sur mobile, environnements bruyants, etc.)

---

## 2. Concepts fondamentaux

### 2.1 Principes POUR (WCAG 2.1)

Les normes WCAG 2.1 reposent sur quatre principes fondamentaux, abrégés POUR :

#### 1. **P**erceptible
Le contenu doit être perceptible par tous les utilisateurs, quel que soit le senseur utilisé.

```html
<!-- ❌ Non perceptible : image sans alternative -->
<img src="graphique-ventes.png">

<!-- ✅ Perceptible : alternative textuelle -->
<img
  src="graphique-ventes.png"
  alt="Graphique des ventes 2024: augmentation de 25% au Q1">

<!-- ❌ Mauvais contraste : texte gris clair sur fond blanc -->
<p style="color: #cccccc; background: white;">
  Difficile à lire
</p>

<!-- ✅ Bon contraste : ratio 4.5:1 minimum (AA) -->
<p style="color: #333333; background: white;">
  Facile à lire
</p>

<!-- ❌ Contenu audio sans transcription -->
<audio src="interview.mp3" controls></audio>

<!-- ✅ Contenu audio avec transcription -->
<audio src="interview.mp3" controls></audio>
<details>
  <summary>Transcription</summary>
  <p>Interviewer: "Pouvez-vous présenter votre projet?"
     Expert: "Bien sûr, notre projet..."</p>
</details>
```

#### 2. **O**pérable
L'interface doit être opérable via clavier, pour les utilisateurs sans souris.

```html
<!-- ❌ Non opérable : pas d'accès au clavier -->
<div onclick="redirectTo('/profil')" style="cursor: pointer;">
  Profil
</div>

<!-- ✅ Opérable : lien sémantique avec focus visible -->
<a href="/profil">Profil</a>

<!-- Style focus visible -->
<style>
  a:focus {
    outline: 2px solid #4CAF50;
    outline-offset: 2px;
  }
</style>

<!-- ❌ Piège clavier : focus peut être emprisonné -->
<div tabindex="0">Contenu modal</div>
<!-- Si modal apparaît, le focus ne peut pas sortir -->

<!-- ✅ Gestion correcte du focus modal -->
<dialog id="modal">
  <h2>Confirmation</h2>
  <button>Annuler</button>
  <button>Confirmer</button>
</dialog>
<script>
  dialog.showModal(); // Emprisonne le focus dans la modal
</script>

<!-- ❌ Pas de contournement du contenu répétitif -->
<header><!-- Navigation longue --></header>
<main><!-- Contenu principal --></main>

<!-- ✅ Lien permettant de sauter le contenu répétitif -->
<a href="#contenu-principal" class="skip-link">
  Passer au contenu principal
</a>
<header><!-- Navigation --></header>
<main id="contenu-principal"><!-- Contenu --></main>

<style>
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: #4CAF50;
    color: white;
    padding: 8px;
    border-radius: 4px;
  }
  .skip-link:focus {
    top: 0;
  }
</style>
```

#### 3. **C**ompréhensible
Le contenu et l'interface doivent être faciles à comprendre.

```html
<!-- ❌ Contenu obscur et jargon -->
<p>Veuillez effectuer la synchronisation binaire de vos
   conteneurs de données via le protocole RPC.</p>

<!-- ✅ Contenu clair et accessible -->
<p>Pour mettre à jour vos fichiers, cliquez sur le bouton
   "Synchroniser" en haut à droite.</p>

<!-- ❌ Formulaire sans labels explicites -->
<input type="email" placeholder="Email">
<input type="password" placeholder="Mot de passe">

<!-- ✅ Formulaire bien structuré avec labels associés -->
<form>
  <label for="email">Adresse email:</label>
  <input
    type="email"
    id="email"
    name="email"
    required
    aria-describedby="email-help">
  <small id="email-help">Exemple: user@example.com</small>

  <label for="password">Mot de passe:</label>
  <input
    type="password"
    id="password"
    name="password"
    required>

  <button type="submit">Se connecter</button>
</form>

<!-- ❌ Comportement imprévisible -->
<select onchange="submitForm()">
  <option>Sélectionner une action...</option>
  <option>Supprimer</option>
  <option>Archiver</option>
</select>
<!-- Form se soumet automatiquement-->

<!-- ✅ Comportement prévisible -->
<form>
  <fieldset>
    <legend>Sélectionner une action:</legend>
    <select name="action">
      <option value="">-- Sélectionner --</option>
      <option value="delete">Supprimer</option>
      <option value="archive">Archiver</option>
    </select>
  </fieldset>
  <button type="submit">Appliquer</button>
</form>
```

#### 4. **R**obuste
Le contenu doit être compatible avec les assistances technologiques actuelles et futures.

```html
<!-- ❌ HTML non valide et pas d'ARIA -->
<div class="heading">
  <span style="font-size: 2em; font-weight: bold;">
    Bienvenue
  </span>
</div>

<!-- ✅ HTML sémantique avec structure claire -->
<h1>Bienvenue</h1>

<!-- ❌ Attributs ARIA mal utilisés -->
<div role="button" onclick="delete()">
  Supprimer
</div>

<!-- ✅ Bouton sémantique correct -->
<button onclick="delete()">Supprimer</button>

<!-- ❌ Liste non structurée -->
<div>Pommes</div>
<div>Oranges</div>
<div>Bananes</div>

<!-- ✅ Liste sémantique -->
<ul>
  <li>Pommes</li>
  <li>Oranges</li>
  <li>Bananes</li>
</ul>

<!-- ✅ HTML valide et bien formé pour interopérabilité -->
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width">
  <title>Page accessible</title>
</head>
<body>
  <header role="banner">
    <h1>Mon site</h1>
    <nav role="navigation"><!-- Navigation --></nav>
  </header>
  <main role="main"><!-- Contenu --></main>
  <footer role="contentinfo"><!-- Pied de page --></footer>
</body>
</html>
```

### 2.2 Niveaux de conformité WCAG 2.1

**Niveau A** (Niveau minimum)
- Environ 30 critères
- Couverture basique de l'accessibilité
- Exemple : alt text sur images

**Niveau AA** (Recommandé)
- Environ 50 critères supplémentaires
- Couvre la plupart des situations réelles
- Exemple : contraste 4.5:1 pour texte normal
- **Conforme légalement dans la plupart des juridictions**

**Niveau AAA** (Optimal)
- Environ 20 critères supplémentaires
- Très difficile à atteindre (demande parfois incompatibilité)
- Exemple : contraste 7:1 pour texte normal
- Rarement requis légalement

### 2.3 ARIA - Accessible Rich Internet Applications

ARIA ajoute de la sémantique accessible aux éléments HTML pour les assistances technologiques.

```html
<!-- Attributs ARIA courants -->

<!-- aria-label : label invisible pour lecteurs d'écran -->
<button aria-label="Fermer la boîte de dialogue">
  ✕
</button>

<!-- aria-labelledby : référence un élément existant comme label -->
<h2 id="dialog-title">Confirmer la suppression</h2>
<dialog aria-labelledby="dialog-title">
  <!-- Contenu -->
</dialog>

<!-- aria-describedby : description supplémentaire -->
<input
  type="password"
  aria-describedby="pwd-info">
<small id="pwd-info">Minimum 8 caractères, 1 majuscule, 1 chiffre</small>

<!-- aria-hidden : masquer pour lecteurs d'écran (éléments purement visuels) -->
<p>Téléchargement en cours <span aria-hidden="true">⏳</span></p>

<!-- aria-live : annoncer les mises à jour dynamiques -->
<div aria-live="polite" aria-atomic="true" id="status">
  <!-- Les mises à jour ici seront annoncées aux lecteurs d'écran -->
</div>
<script>
  document.getElementById('status').textContent = 'Fichier téléchargé avec succès';
</script>

<!-- aria-expanded : état des éléments extensibles -->
<button aria-expanded="false" aria-controls="menu">
  Afficher le menu
</button>
<nav id="menu" hidden>
  <!-- Contenu du menu -->
</nav>

<!-- aria-checked : état des contrôles personnalisés -->
<div role="checkbox" aria-checked="true">
  Accepter les conditions
</div>

<!-- Exemple complet : menu déroulant accessible -->
<button
  id="menu-btn"
  aria-haspopup="menu"
  aria-expanded="false"
  aria-controls="menu-list">
  Options ▼
</button>

<ul
  id="menu-list"
  role="menu"
  aria-labelledby="menu-btn"
  hidden>
  <li role="menuitem"><a href="/profil">Profil</a></li>
  <li role="menuitem"><a href="/settings">Paramètres</a></li>
  <li role="menuitem"><a href="/logout">Déconnexion</a></li>
</ul>

<script>
  const btn = document.getElementById('menu-btn');
  const menu = document.getElementById('menu-list');

  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', !isOpen);
    menu.hidden = isOpen;
  });
</script>
```

### 2.4 Contraste et couleurs

```css
/* Rapport de contraste = (L1 + 0.05) / (L2 + 0.05) */
/* Où L est la luminance relative */

/* ❌ Contraste insuffisant (ratio ~2.5:1, besoin 4.5:1 AA) */
.weak-contrast {
  color: #888;      /* Gris */
  background: #fff; /* Blanc */
}

/* ✅ Contraste suffisant (ratio ~8:1, dépasse 4.5:1 AA et 7:1 AAA) */
.good-contrast {
  color: #000;      /* Noir */
  background: #fff; /* Blanc */
}

/* ✅ Texte volumineux peut avoir contraste moins strict (3:1) */
.large-text {
  color: #666;
  background: #fff;
  font-size: 24px;
  font-weight: bold;
}

/* ❌ Informations véhiculées UNIQUEMENT par la couleur */
<div class="form-field error">
  <input type="email">
</div>

.form-field.error input {
  border-color: red; /* Seule indication : mauvaise */
}

/* ✅ Utiliser couleur ET texte/symbole */
<div class="form-field error">
  <input type="email" aria-invalid="true">
  <span class="error-icon">⚠</span>
  <span class="error-text">Email invalide</span>
</div>

.form-field.error {
  border-color: red;
  border-width: 2px;
}

.error-icon, .error-text {
  color: red;
}
```

### 2.5 Navigation au clavier

```html
<!-- ❌ Navigation au clavier inefficace -->
<div onclick="navigate()">Élément cliquable</div>

<!-- ✅ Navigation au clavier intuitive -->
<button onclick="navigate()">Élément cliquable</button>

<!-- Ordre de tabulation logique -->
<form>
  <label for="nom">Nom:</label>
  <input id="nom" type="text">

  <label for="email">Email:</label>
  <input id="email" type="email">

  <label for="message">Message:</label>
  <textarea id="message"></textarea>

  <button type="submit">Envoyer</button>
</form>

<!-- Ordre de tabulation préservé par ordre DOM, pas tabindex -->
<!-- ❌ Éviter tabindex positif (crée l'ordre) -->
<button tabindex="2">Ensuite</button>
<button tabindex="1">D'abord</button>

<!-- ✅ Laisser l'ordre DOM naturel, utiliser tabindex=-1 pour exclure -->
<button>D'abord</button>
<button>Ensuite</button>
<button tabindex="-1">Exclu de la navigation</button>

<!-- Focus visible obligatoire -->
<style>
  button:focus,
  a:focus,
  input:focus {
    outline: 3px solid #4CAF50;
    outline-offset: 2px;
  }
</style>
```

---

## 3. Exemples pratiques

### 3.1 Formulaire entièrement accessible

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width">
  <title>Formulaire Accessible</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 600px;
      margin: 50px auto;
      padding: 20px;
      background: #f5f5f5;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #333;
    }

    input[type="text"],
    input[type="email"],
    select,
    textarea {
      width: 100%;
      padding: 10px;
      border: 2px solid #ccc;
      border-radius: 4px;
      font-size: 16px;
      font-family: inherit;
    }

    input:focus,
    select:focus,
    textarea:focus {
      outline: none;
      border-color: #4CAF50;
      box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
    }

    input[aria-invalid="true"] {
      border-color: #d32f2f;
    }

    .error-message {
      color: #d32f2f;
      font-size: 14px;
      margin-top: 4px;
    }

    .help-text {
      color: #666;
      font-size: 14px;
      margin-top: 4px;
    }

    .required {
      color: #d32f2f;
    }

    button {
      background: #4CAF50;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
      font-weight: 600;
    }

    button:hover {
      background: #45a049;
    }

    button:focus {
      outline: 3px solid #4CAF50;
      outline-offset: 2px;
    }

    .fieldset {
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 15px;
      margin-bottom: 20px;
    }

    legend {
      font-weight: 600;
      padding: 0 5px;
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .checkbox-item {
      display: flex;
      align-items: center;
    }

    .checkbox-item input {
      width: auto;
      margin-right: 8px;
    }

    .success-message {
      background: #d4edda;
      color: #155724;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 20px;
      display: none;
    }

    .success-message.show {
      display: block;
    }

    .skip-link {
      position: absolute;
      top: -40px;
      left: 0;
      background: #4CAF50;
      color: white;
      padding: 8px;
      border-radius: 4px;
      text-decoration: none;
    }

    .skip-link:focus {
      top: 0;
    }
  </style>
</head>
<body>
  <a href="#form" class="skip-link">Passer au formulaire</a>

  <h1>Inscription Utilisateur</h1>

  <div id="success-message" class="success-message" role="status" aria-live="polite">
    Inscription réussie ! Bienvenue.
  </div>

  <form id="form" novalidate>
    <!-- Champ Prénom -->
    <div class="form-group">
      <label for="prenom">
        Prénom <span class="required" aria-label="requis">*</span>
      </label>
      <input
        type="text"
        id="prenom"
        name="prenom"
        required
        aria-required="true"
        aria-describedby="prenom-error">
      <div id="prenom-error" class="error-message" role="alert" aria-live="polite"></div>
    </div>

    <!-- Champ Nom -->
    <div class="form-group">
      <label for="nom">
        Nom <span class="required" aria-label="requis">*</span>
      </label>
      <input
        type="text"
        id="nom"
        name="nom"
        required
        aria-required="true"
        aria-describedby="nom-error">
      <div id="nom-error" class="error-message" role="alert"></div>
    </div>

    <!-- Champ Email -->
    <div class="form-group">
      <label for="email">
        Adresse email <span class="required" aria-label="requis">*</span>
      </label>
      <input
        type="email"
        id="email"
        name="email"
        required
        aria-required="true"
        aria-describedby="email-help email-error">
      <div class="help-text" id="email-help">
        Exemple: utilisateur@example.com
      </div>
      <div id="email-error" class="error-message" role="alert"></div>
    </div>

    <!-- Champ Pays -->
    <div class="form-group">
      <label for="pays">
        Pays <span class="required" aria-label="requis">*</span>
      </label>
      <select
        id="pays"
        name="pays"
        required
        aria-required="true">
        <option value="">-- Sélectionner un pays --</option>
        <option value="fr">France</option>
        <option value="be">Belgique</option>
        <option value="ch">Suisse</option>
        <option value="ca">Canada</option>
      </select>
    </div>

    <!-- Champ Intérêts -->
    <fieldset class="fieldset">
      <legend>
        Sujets d'intérêt <span class="required" aria-label="requis">*</span>
      </legend>
      <div class="checkbox-group">
        <div class="checkbox-item">
          <input
            type="checkbox"
            id="tech"
            name="interet"
            value="tech">
          <label for="tech">Technologie</label>
        </div>
        <div class="checkbox-item">
          <input
            type="checkbox"
            id="design"
            name="interet"
            value="design">
          <label for="design">Design</label>
        </div>
        <div class="checkbox-item">
          <input
            type="checkbox"
            id="business"
            name="interet"
            value="business">
          <label for="business">Business</label>
        </div>
      </div>
      <div id="interet-error" class="error-message" role="alert"></div>
    </fieldset>

    <!-- Champ Message -->
    <div class="form-group">
      <label for="message">
        Message
      </label>
      <textarea
        id="message"
        name="message"
        rows="5"
        aria-describedby="message-help"></textarea>
      <div class="help-text" id="message-help">
        Dites-nous ce que vous en pensez (optionnel)
      </div>
    </div>

    <!-- Conditions -->
    <div class="form-group checkbox-item">
      <input
        type="checkbox"
        id="conditions"
        name="conditions"
        required
        aria-required="true"
        aria-describedby="conditions-text conditions-error">
      <label for="conditions" id="conditions-text">
        J'accepte les <a href="/conditions">conditions d'utilisation</a>
      </label>
      <div id="conditions-error" class="error-message" role="alert"></div>
    </div>

    <!-- Bouton Submit -->
    <button type="submit">S'inscrire</button>
  </form>

  <script>
    const form = document.getElementById('form');
    const successMessage = document.getElementById('success-message');

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;
      clearErrors();

      // Validation Prénom
      const prenom = document.getElementById('prenom').value.trim();
      if (!prenom) {
        showError('prenom', 'Veuillez entrer votre prénom');
        isValid = false;
      }

      // Validation Nom
      const nom = document.getElementById('nom').value.trim();
      if (!nom) {
        showError('nom', 'Veuillez entrer votre nom');
        isValid = false;
      }

      // Validation Email
      const email = document.getElementById('email').value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) {
        showError('email', 'Veuillez entrer une adresse email');
        isValid = false;
      } else if (!emailRegex.test(email)) {
        showError('email', 'Veuillez entrer une adresse email valide');
        isValid = false;
      }

      // Validation Intérêts (au moins un)
      const interets = document.querySelectorAll('input[name="interet"]:checked');
      if (interets.length === 0) {
        showError('interet', 'Veuillez sélectionner au moins un sujet d\'intérêt');
        isValid = false;
      }

      // Validation Conditions
      const conditions = document.getElementById('conditions').checked;
      if (!conditions) {
        showError('conditions', 'Vous devez accepter les conditions d\'utilisation');
        isValid = false;
      }

      if (isValid) {
        // Simuler l'envoi
        console.log({
          prenom, nom, email,
          pays: document.getElementById('pays').value,
          interet: Array.from(interets).map(e => e.value),
          message: document.getElementById('message').value
        });

        // Afficher le message de succès
        form.style.display = 'none';
        successMessage.classList.add('show');

        // Annoncer au lecteur d'écran
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'assertive');
        announcement.textContent = 'Inscription réussie !';
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        document.body.appendChild(announcement);
      }
    });

    function showError(fieldName, message) {
      const errorEl = document.getElementById(fieldName + '-error');
      const input = document.querySelector(`#${fieldName}`);

      if (errorEl) {
        errorEl.textContent = message;
      }

      if (input) {
        input.setAttribute('aria-invalid', 'true');
        input.focus();
      }
    }

    function clearErrors() {
      document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
      });

      document.querySelectorAll('input, select, textarea').forEach(el => {
        el.setAttribute('aria-invalid', 'false');
      });
    }
  </script>
</body>
</html>
```

### 3.2 Composant de galerie accessible

```html
<div class="gallery">
  <h2 id="gallery-title">Galerie photo</h2>

  <!-- Image active -->
  <figure role="region" aria-labelledby="gallery-title">
    <img
      id="gallery-image"
      src="photo1.jpg"
      alt="Coucher de soleil sur la plage de Biarritz, octobre 2024"
      width="600"
      height="400">
    <figcaption id="image-caption">
      Coucher de soleil sur la plage de Biarritz, octobre 2024
    </figcaption>
  </figure>

  <!-- Contrôles -->
  <div class="gallery-controls" role="group" aria-labelledby="gallery-title">
    <button
      id="prev-btn"
      aria-label="Photo précédente">
      ← Précédente
    </button>

    <span id="counter" aria-live="polite">1 / 5</span>

    <button
      id="next-btn"
      aria-label="Photo suivante">
      Suivante →
    </button>
  </div>

  <!-- Galerie de vignettes -->
  <div class="thumbnails" role="listbox" aria-label="Sélectionner une photo">
    <button
      class="thumbnail selected"
      role="option"
      aria-selected="true"
      aria-label="Photo 1: Coucher de soleil"
      data-index="0">
      <img src="photo1-thumb.jpg" alt="">
    </button>
    <button
      class="thumbnail"
      role="option"
      aria-selected="false"
      aria-label="Photo 2: Plage de sable"
      data-index="1">
      <img src="photo2-thumb.jpg" alt="">
    </button>
    <!-- ... autres vignettes ... -->
  </div>
</div>

<style>
  .gallery {
    max-width: 600px;
    margin: 20px auto;
  }

  #gallery-image {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 0 auto 10px;
    border: 2px solid #ddd;
    border-radius: 4px;
  }

  #image-caption {
    text-align: center;
    color: #666;
    margin-bottom: 20px;
  }

  .gallery-controls {
    display: flex;
    justify-content: center;
    gap: 20px;
    align-items: center;
    margin-bottom: 20px;
  }

  .gallery-controls button {
    padding: 8px 16px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
  }

  .gallery-controls button:hover {
    background: #45a049;
  }

  .gallery-controls button:focus {
    outline: 3px solid #4CAF50;
    outline-offset: 2px;
  }

  #counter {
    min-width: 30px;
    text-align: center;
  }

  .thumbnails {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding: 10px 0;
  }

  .thumbnail {
    flex-shrink: 0;
    width: 80px;
    height: 80px;
    border: 3px solid #ddd;
    background: white;
    cursor: pointer;
    border-radius: 4px;
    overflow: hidden;
  }

  .thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumbnail.selected {
    border-color: #4CAF50;
    outline: none;
  }

  .thumbnail:focus {
    outline: 3px solid #4CAF50;
    outline-offset: -3px;
  }
</style>

<script>
  const images = [
    { src: 'photo1.jpg', alt: 'Coucher de soleil sur la plage de Biarritz' },
    { src: 'photo2.jpg', alt: 'Plage de sable blanc' },
    { src: 'photo3.jpg', alt: 'Promenade de la côte' },
    { src: 'photo4.jpg', alt: 'Rochers de Biarritz' },
    { src: 'photo5.jpg', alt: 'Piscine naturelle' }
  ];

  let currentIndex = 0;

  const imageEl = document.getElementById('gallery-image');
  const captionEl = document.getElementById('image-caption');
  const counterEl = document.getElementById('counter');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const thumbnails = document.querySelectorAll('.thumbnail');

  function updateGallery(index) {
    currentIndex = (index + images.length) % images.length;

    imageEl.src = images[currentIndex].src;
    imageEl.alt = images[currentIndex].alt;
    captionEl.textContent = images[currentIndex].alt;
    counterEl.textContent = `${currentIndex + 1} / ${images.length}`;

    // Mettre à jour les vignettes
    thumbnails.forEach((thumb, i) => {
      const isSelected = i === currentIndex;
      thumb.classList.toggle('selected', isSelected);
      thumb.setAttribute('aria-selected', isSelected);
    });

    // Annoncer le changement
    counterEl.setAttribute('aria-live', 'polite');
  }

  prevBtn.addEventListener('click', () => {
    updateGallery(currentIndex - 1);
  });

  nextBtn.addEventListener('click', () => {
    updateGallery(currentIndex + 1);
  });

  thumbnails.forEach((thumb, index) => {
    thumb.addEventListener('click', () => {
      updateGallery(index);
    });

    thumb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        updateGallery(index - 1);
      } else if (e.key === 'ArrowRight') {
        updateGallery(index + 1);
      }
    });
  });

  // Navigation au clavier pour les boutons
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') updateGallery(currentIndex - 1);
    if (e.key === 'ArrowRight') updateGallery(currentIndex + 1);
  });
</script>
```

---

## 4. Bonnes pratiques

### 4.1 Images et contenu visuel

```html
<!-- ❌ Images sans alternatives -->
<img src="chart.png">

<!-- ✅ Alternatives descriptives -->
<img
  src="chart.png"
  alt="Graphique en barres montrant les ventes trimestrielles 2024: Q1: 50K, Q2: 75K, Q3: 85K, Q4: 95K">

<!-- Pour images décoratives -->
<img src="decoration.png" alt="" aria-hidden="true">

<!-- Icônes comme contenu -->
<button title="Suivant" aria-label="Aller à la page suivante">
  →
</button>

<!-- Vidéos -->
<video controls width="400" height="300">
  <source src="video.mp4" type="video/mp4">
  <track kind="captions" src="video-fr.vtt" srclang="fr" label="Français">
  <track kind="descriptions" src="video-desc.vtt" srclang="fr">
  Votre navigateur ne supporte pas les vidéos HTML5.
</video>
```

### 4.2 Structure sémantique

```html
<!-- ✅ Structure semantic HTML -->
<header>
  <h1>Mon site</h1>
  <nav>
    <ul>
      <li><a href="/">Accueil</a></li>
      <li><a href="/blog">Blog</a></li>
      <li><a href="/contact">Contact</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h2>Titre de l'article</h2>
    <p>Contenu...</p>
  </article>

  <aside>
    <h3>Articles connexes</h3>
    <!-- Contenu latéral -->
  </aside>
</main>

<footer>
  <p>&copy; 2024 Mon site</p>
</footer>
```

### 4.3 Testage d'accessibilité

```bash
# Outils automatisés
- Lighthouse (intégré à Chrome DevTools)
- WAVE (extension navigateur, wave.webaim.org)
- axe DevTools (extension navigateur)
- Accessibility Inspector (Firefox)

# Tests manuels
- Navigation au clavier seule (Tab, Shift+Tab, Entrée, Espace)
- Lecteur d'écran (NVDA gratuit, JAWS payant)
- Zoom à 200% et voir si le layout casse
- Désactiver les CSS et vérifier la lisibilité
- Tester avec des lentilles de contraste faible (simulateurs)
```

---

## 5. Comparaison / Alternatives

| Aspect | WCAG 2.1 | En-US ADA | EU Web Directive | AODA (Canada) |
|--------|----------|----------|-----------------|---------------|
| **Standard** | International | USA | Europe | Canada |
| **Niveau requis** | AA recommandé | AA | AA | AA |
| **Domaines couverts** | Web + digital | Web + digital | Websites | Public sector |
| **Sanctions** | Procès civils | Procès fédéraux | Amendes gouvernementales | Amendes + procès |

WCAG 2.1 est le standard de facto international le plus complet et respecté.

---

## 6. Ressources externes (analyse critique)

### 6.1 Normes officielles
- **W3C WCAG 2.1** (w3.org/WAI/WCAG21) : Spécification officielle
  - **Forces** : Autorité normative, complète, méthodique
  - **Faiblesses** : Dense et technique
  - **Note** : Référence indispensable pour les professionnels

- **WAI-ARIA** (w3.org/WAI/ARIA) : Spécification ARIA officielle
  - **Forces** : Définitions précises, exemples d'implémentation
  - **Utilité** : Guide les développeurs pour ARIA

### 6.2 Outils de test
- **Lighthouse** (intégré Chrome) : Audit automatisé
  - **Forces** : Gratuit, intégré, suggestions concrètes
  - **Faiblesses** : Tests limités, ne remplace pas audit manuel

- **WAVE** (wave.webaim.org) : Extension visuelle
  - **Forces** : Identification visuelle des problèmes
  - **Utilité** : Excellent pédagogiquement

- **axe DevTools** : Tests automatisés avancés
  - **Forces** : Détection d'une centaine de problèmes
  - **Note** : Standard industriel

### 6.3 Apprentissage
- **WebAIM** (webaim.org) : Ressources pédagogiques gratuites
  - **Forces** : Articles clairs et pratiques
  - **Utilité** : Excellent point de départ

- **Deque University** : Cours payants mais professionnels
  - **Forces** : Formation certifiée
  - **Note** : Pour certification CPACC/WAS

---

## 7. Points clés à retenir

1. **Accessibilité = inclusivité** : Bénéficie à TOUS, pas seulement aux personnes handicapées

2. **Principes POUR** : Perceptible, Opérable, Compréhensible, Robuste

3. **HTML sémantique d'abord** : Utiliser h1-h6, nav, article, button plutôt que divs

4. **Clavier obligatoire** : Tous les éléments interactifs accessibles au clavier

5. **Contraste suffisant** : Ratio 4.5:1 minimum pour texte normal (WCAG AA)

6. **ARIA avec modération** : D'abord HTML sémantique, ARIA en supplément

7. **Testage régulier** : Automatisé + manuel + tests avec utilisateurs réels

8. **Conformité légale** : WCAG AA le standard légalement requis dans la plupart des juridictions

9. **Structure et ordre** : Content logique indépendamment du CSS

10. **Textes alternatifs** : Tous les images, vidéos, audio nécessitent des alternatives

---

**Dernière révision** : Mars 2026 | **Auteur** : Équipe Pédagogique | **License** : CC BY-NC-SA 4.0
