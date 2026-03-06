# HTML5 : Structure et Sémantique — Fiche Technique N°01

> **Thème** : Langage de balisage et structuration du contenu | **Dernière mise à jour** : Mars 2026 | **Niveau** : Intermédiaire

---

## 1. Introduction et contexte

### Historique
HTML5 représente l'évolution majeure de l'HyperText Markup Language, marquant la transition d'une simple spécification vers une plateforme web complète. Ratifiée en 2014 par le W3C (World Wide Web Consortium), HTML5 introduit une philosophie nouvelle : privilégier la sémantique (le sens) sur la présentation.

### Enjeux contemporains
La sémantique HTML5 s'avère cruciale pour :
- **L'accessibilité** : permettre aux lecteurs d'écran de comprendre la structure
- **Le SEO** : faciliter l'indexation par les moteurs de recherche
- **La maintenabilité** : clarifier le rôle de chaque élément du document
- **L'interopérabilité** : garantir une expérience cohérente entre navigateurs

---

## 2. Concepts fondamentaux

### 2.1 Éléments sémantiques structurels

L'HTML5 introduit des éléments explicites pour structurer le contenu :

| Élément | Rôle | Exemple d'usage |
|---------|------|-----------------|
| `<header>` | En-tête de section/page | Logo, titre principal, navigation primaire |
| `<nav>` | Navigation principale ou secondaire | Menus, listes de liens |
| `<main>` | Contenu principal unique | Corps principal du document |
| `<article>` | Contenu autonome syndiquable | Article de blog, news, message |
| `<section>` | Regroupement thématique de contenu | Chapitre, groupe logique |
| `<aside>` | Contenu connexe périphérique | Barre latérale, encadré, publicités |
| `<footer>` | Pied de page de section/document | Métadonnées, liens, copyright |

### 2.2 APIs HTML5 essentielles

#### Storage API
L'API Web Storage offre deux mécanismes de persistance client-side :

```javascript
// localStorage : persistance permanente
localStorage.setItem('utilisateur', 'Jean Dupont');
const utilisateur = localStorage.getItem('utilisateur');
localStorage.removeItem('utilisateur');
localStorage.clear(); // Supprime tout

// sessionStorage : persistance temporaire (onglet)
sessionStorage.setItem('temp_token', 'abc123');
```

#### Geolocation API
Accès à la position géographique avec consentement utilisateur :

```javascript
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function(position) {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      console.log(`Position: ${lat}, ${lng}`);
    },
    function(error) {
      console.error(`Erreur: ${error.message}`);
    }
  );
}
```

#### Canvas API
Dessin 2D/3D en temps réel :

```javascript
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Dessiner un rectangle
ctx.fillStyle = 'rgb(200, 0, 0)';
ctx.fillRect(10, 10, 55, 50);

// Dessiner un texte
ctx.fillStyle = 'rgb(0, 0, 200)';
ctx.font = '20px Georgia';
ctx.fillText('Texte sur Canvas', 10, 100);

// Arc de cercle
ctx.beginPath();
ctx.arc(100, 100, 50, 0, 2 * Math.PI);
ctx.stroke();
```

#### Web Workers
Exécution asynchrone de scripts en arrière-plan :

```javascript
// main.js
const worker = new Worker('worker.js');
worker.postMessage({ data: [1, 2, 3, 4, 5] });
worker.onmessage = function(event) {
  console.log('Résultat du worker:', event.data);
};

// worker.js
self.onmessage = function(event) {
  const data = event.data.data;
  const somme = data.reduce((a, b) => a + b, 0);
  self.postMessage(somme);
};
```

### 2.3 Formulaires HTML5 avancés

#### Nouveaux types d'input
HTML5 offre des types d'input spécialisés avec validation native :

```html
<!-- Email avec validation -->
<input type="email" name="email" required>

<!-- URL -->
<input type="url" name="website" placeholder="https://exemple.com">

<!-- Nombre avec limites -->
<input type="number" name="age" min="0" max="120" step="1">

<!-- Date -->
<input type="date" name="birthdate">

<!-- Heure -->
<input type="time" name="reunion">

<!-- Couleur (sélecteur intégré) -->
<input type="color" name="couleur_preferee" value="#ff0000">

<!-- Plage (slider) -->
<input type="range" name="volume" min="0" max="100" value="50">

<!-- Recherche -->
<input type="search" name="query" placeholder="Chercher...">

<!-- Téléphone -->
<input type="tel" name="telephone" pattern="[0-9]{10}">
```

#### Attributs de validation
```html
<form>
  <input type="text" name="nom" required
         minlength="2" maxlength="50"
         pattern="[A-Za-zÀ-ÿ\s-]+">

  <textarea name="message" required
            minlength="10" maxlength="500"
            rows="5" cols="40"></textarea>

  <input type="submit" value="Envoyer">
</form>
```

---

## 3. Exemples pratiques : Bonne vs Mauvaise sémantique

### 3.1 Mauvaise pratique (avant HTML5)
```html
<div id="header">
  <div class="logo">Logo</div>
  <div id="nav">
    <div class="nav-item"><a href="/">Accueil</a></div>
    <div class="nav-item"><a href="/about">À propos</a></div>
    <div class="nav-item"><a href="/contact">Contact</a></div>
  </div>
</div>

<div id="content">
  <div class="post">
    <h2>Titre de l'article</h2>
    <div class="post-content">Contenu...</div>
  </div>
</div>

<div id="sidebar">
  <div class="widget">Publicité</div>
</div>

<div id="footer">
  <p>Copyright 2026</p>
</div>
```

### 3.2 Bonne pratique (HTML5 sémantique)
```html
<header>
  <img src="logo.png" alt="Logo entreprise">
  <nav>
    <ul>
      <li><a href="/">Accueil</a></li>
      <li><a href="/about">À propos</a></li>
      <li><a href="/contact">Contact</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>Titre de l'article</h1>
    <time datetime="2026-03-06">6 mars 2026</time>
    <p>Contenu...</p>
  </article>
</main>

<aside>
  <section>
    <h2>Ressources pertinentes</h2>
    <!-- Contenu connexe -->
  </section>
</aside>

<footer>
  <p>&copy; 2026 Tous droits réservés</p>
</footer>
```

### 3.3 Formulaire complet avec validation

```html
<form id="inscriptionForm" method="POST" action="/api/inscription">
  <fieldset>
    <legend>Informations personnelles</legend>

    <label for="nom">Nom complet <abbr title="requis">*</abbr></label>
    <input
      id="nom"
      type="text"
      name="nom"
      required
      pattern="[A-Za-zÀ-ÿ\s-]{2,50}"
      aria-describedby="nom-erreur">
    <small id="nom-erreur">Entre 2 et 50 caractères</small>

    <label for="email">Email <abbr title="requis">*</abbr></label>
    <input
      id="email"
      type="email"
      name="email"
      required
      aria-describedby="email-erreur">
    <small id="email-erreur">Format email valide requis</small>

    <label for="tel">Téléphone</label>
    <input
      id="tel"
      type="tel"
      name="telephone"
      pattern="[0-9+\-\s()]{10,}"
      aria-describedby="tel-info">
    <small id="tel-info">Format: +33 1 23 45 67 89</small>
  </fieldset>

  <fieldset>
    <legend>Préférences</legend>

    <label for="dateNaissance">Date de naissance</label>
    <input id="dateNaissance" type="date" name="dateNaissance">

    <label for="couleur">Couleur préférée</label>
    <input id="couleur" type="color" name="couleur" value="#3498db">

    <label for="newsletter">
      <input id="newsletter" type="checkbox" name="newsletter">
      S'abonner à la newsletter
    </label>
  </fieldset>

  <button type="submit">Soumettre</button>
  <button type="reset">Réinitialiser</button>
</form>

<script>
  document.getElementById('inscriptionForm').addEventListener('submit', function(e) {
    if (!this.checkValidity()) {
      e.preventDefault();
      alert('Veuillez corriger les erreurs du formulaire');
    }
  });
</script>
```

---

## 4. Bonnes pratiques

### 4.1 Accessibilité (WCAG 2.1)
- Utiliser les éléments sémantiques appropriés pour chaque section
- Fournir des attributs `alt` descriptifs pour les images
- Implémenter les attributs ARIA lorsque la sémantique native est insuffisante
- Assurer une hiérarchie cohérente des titres (h1 → h6)

### 4.2 Performance
- Minimiser l'utilisation de localStorage pour les grandes données
- Limiter la taille des données Web Workers pour éviter le gel de l'interface
- Valider les données côté client AVANT envoi au serveur
- Comprimer les images intégrées dans Canvas

### 4.3 Sécurité
- Valider et échapper les données utilisateur (prévention XSS)
- Utiliser HTTPS pour toute transmission de données sensibles
- Ne pas stocker d'informations sensibles dans localStorage
- Vérifier les permissions avant utiliser Geolocation

### 4.4 Compatibilité navigateurs
```javascript
// Vérifier la disponibilité des APIs
if (typeof(Storage) !== "undefined") {
  // localStorage est disponible
}

if ('serviceWorker' in navigator) {
  // Service Workers supportés
}

if (typeof(Worker) !== "undefined") {
  // Web Workers supportés
}
```

---

## 5. Comparaison et alternatives

### 5.1 HTML5 vs XHTML vs HTML 4
| Aspect | HTML4 | XHTML | HTML5 |
|--------|-------|-------|-------|
| Syntaxe | Permissive | Stricte XML | Flexible |
| Sémantique | Limitée | Identique à HTML4 | Enrichie |
| APIs intégrées | Aucune | Aucune | Nombreuses |
| Support moderne | Faible | Faible | Excellent |
| Évolution | Arrêtée | Arrêtée | Continue (Living Standard) |

### 5.2 Alternatives de structuration
- **XML/RSS** : pour la syndication de contenu
- **Markdown** : pour la rédaction simplifiée (convertible en HTML5)
- **YAML/JSON** : pour les données structurées (complémentaires)
- **WebComponents** : encapsulation avancée de structure HTML

---

## 6. Ressources externes — Analyse critique

### 6.1 MDN Web Docs (Mozilla Developer Network)
**URL** : https://developer.mozilla.org/fr/docs/Web/HTML/

**Qualités** :
- Autorité : documentation officielle approuvée par les navigateurs
- Exhaustivité : couverture complète de toutes les APIs HTML5
- Exemples : code à jour et fonctionnel
- Maintenance : régulièrement mise à jour
- Multilingue : versions françaises généralement à jour

**Limitations** :
- Densité technique peut être élevée pour débutants
- Parfois détails trop granulaires

**Recommandation** : Source primaire fiable, à consulter en priorité.

### 6.2 W3C Specification (https://html.spec.whatwg.org/)
**Qualités** :
- Autorité maximale : standard officiel international
- Complétude : couvre chaque détail de la spécification
- Référence légale : consulté par les développeurs de navigateurs

**Limitations** :
- Extrêmement technique et dense
- Langage très formel
- Peu d'exemples pratiques
- Pas accessible aux débutants

**Recommandation** : Consulter pour clarifications précises, pas pour apprentissage initial.

### 6.3 W3Schools (https://www.w3schools.com/html/)
**Qualités** :
- Accessibilité : explications simples et progressives
- Interactivité : éditeur intégré "Try it Yourself"
- Étendue : couvre HTML, CSS et JavaScript
- Popularité : très connu, nombreuses ressources externes
- Spécifications par niveau : "Basic", "Advanced"

**Limitations** :
- Parfois simplifié au point d'être inexact
- Exemples trop basiques pour niveau avancé
- Pas de notation de support navigateur systématique
- Maintenance : certains contenus datés
- Pas de discussion communautaire

**Recommandation** : Utile pour démarrer, à valider avec MDN pour cas complexes.

### 6.4 HTML.spec.whatwg.org (Living Standard)
**Qualités** :
- Current : mise à jour continue (pas de "versions")
- Détails : couvre le navigateur réel (pas seulement le W3C)
- Influence : de facto standard pour les navigateurs

**Limitations** :
- Présenté comme "Living Standard" : complexité accrue
- Format difficilement navigable
- Cas limites obscurs inclus

**Recommandation** : Reference pour clarifications, articles techniques.

### 6.5 Can I Use (https://caniuse.com/)
**Qualités** :
- Spécialisation : support exact par navigateur/version
- Visualisation : tableaux clairs et colorés
- Filtrabilité : recherche précise par fonctionnalité

**Limitations** :
- Ne documente pas "comment", seulement "si"
- Données basées sur déclarations navigateur
- Parfois retard sur les releases récentes

**Recommandation** : Toujours vérifier avant production pour compatibilité.

---

## 7. Points clés à retenir

### Fondamentaux
1. **La sémantique DOIT primer sur la présentation** : utiliser les balises appropriées en priorité
2. **Structure logique** : hiérarchie claire des éléments (header → main/article → footer)
3. **Accessibilité inclusive** : HTML5 sémantique améliore l'expérience pour tous

### APIs pratiques
- **Web Storage** pour persistance simple côté client
- **Geolocation** avec gestion stricte des permissions
- **Canvas** pour graphiques et animations
- **Web Workers** pour tâches intensives non-bloquantes

### Validation
- HTML5 native validation : premier niveau de contrôle
- Validation serveur obligatoire : sécurité
- ARIA & accessibility : vérification manuelle recommandée

### Maintenance
- Utiliser des validateurs (W3C Validator)
- Vérifier support navigateur sur Can I Use
- Documenter les choix sémantiques pour l'équipe
- Tester avec lecteurs d'écran (NVDA, JAWS)

### Production
- Minifier le HTML en production
- Implémenter CSP (Content Security Policy)
- Tester sur plusieurs navigateurs et versions
- Monitorer l'accessibilité continuellement

---

**Dernier révision** : Mars 2026
**Validé par** : Standards HTML5 W3C/WHATWG
