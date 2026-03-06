# Express.js : Framework Web pour Node.js — Fiche Technique N°10

> **Thème** : Framework Web Léger | **Dernière mise à jour** : Mars 2026 | **Niveau** : Intermédiaire/Avancé

---

## 1. Introduction et contexte

Express.js est un framework web minimal et flexible construit sur Node.js, lancé en 2010 par TJ Holowaychuk. Depuis sa création, Express.js est devenu le framework serveur JavaScript le plus populaire et le plus utilisé en production. Son approche « sans opinion » (unopinionated) permet aux développeurs de construire des architectures adaptées à leurs besoins spécifiques.

Express.js se distingue par sa **légèreté**, ses **performances** et son **extensibilité** via un système de middleware puissant. Contrairement à des frameworks opiniâtres comme Django ou Rails, Express.js laisse au développeur le contrôle total de l'architecture applicative.

**Caractéristiques principales :**
- Routing flexible et intuitif
- Système de middleware composable
- Gestion native des requêtes/réponses HTTP
- Support des templates (EJS, Pug, Handlebars, etc.)
- Intégration facile avec bases de données et bibliothèques tierces
- Performance optimisée pour les APIs REST et applications web

---

## 2. Concepts fondamentaux

### 2.1 Architecture de base et cycle de vie

```
Requête HTTP
     │
     ▼
┌──────────────────┐
│  Middleware 1    │
└──────────────────┘
     │
     ▼
┌──────────────────┐
│  Middleware 2    │
└──────────────────┘
     │
     ▼
┌──────────────────┐
│  Route Handler   │
└──────────────────┘
     │
     ▼
  Réponse HTTP
```

Chaque requête traversant Express.js traverse une chaîne de middleware avant d'atteindre le handler de route.

### 2.2 Routing

Express.js supporte tous les verbes HTTP et des patterns de routes sophistiqués :

```javascript
const express = require('express');
const app = express();

// Routes basiques
app.get('/', (req, res) => {
  res.send('Accueil');
});

app.post('/users', (req, res) => {
  res.json({ message: 'Utilisateur créé' });
});

app.put('/users/:id', (req, res) => {
  res.json({ id: req.params.id, updated: true });
});

app.delete('/users/:id', (req, res) => {
  res.json({ deleted: true });
});

// Routes avec patterns
app.get('/files/:filename+', (req, res) => {
  // Accepte /files/doc ou /files/folder/doc
  res.send(`Fichier: ${req.params.filename}`);
});

// Routes avec regex
app.get(/^\/admin/i, (req, res) => {
  res.send('Panneau administrateur');
});

// Routes paramétrées
app.get('/utilisateurs/:userId/articles/:articleId', (req, res) => {
  const { userId, articleId } = req.params;
  res.json({ userId, articleId });
});

// Route avec query parameters
app.get('/search', (req, res) => {
  const { q, limit = 10 } = req.query;
  res.json({ search: q, limit: parseInt(limit) });
});
```

### 2.3 Middleware

Le middleware est le cœur du système de traitement de requête Express.js. Chaque middleware est une fonction ayant accès aux objets `req`, `res` et `next`.

**Anatomie d'un middleware :**
```javascript
const monMiddleware = (req, res, next) => {
  // Traitement avant le handler
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);

  // Modifier la requête
  req.userId = 123;

  // Passer au middleware suivant
  next();

  // Code exécuté APRÈS que la réponse soit envoyée
  console.log('Réponse envoyée');
};

app.use(monMiddleware);
```

**Types de middleware :**

1. **Middleware global** (pour toutes les routes)
```javascript
app.use((req, res, next) => {
  console.log('Middleware global');
  next();
});
```

2. **Middleware de route spécifique**
```javascript
const authenticateUser = (req, res, next) => {
  if (req.headers.authorization) {
    next();
  } else {
    res.status(401).json({ error: 'Non autorisé' });
  }
};

app.get('/profil', authenticateUser, (req, res) => {
  res.json({ profil: '...' });
});
```

3. **Middleware de gestion d'erreur**
```javascript
app.get('/users/:id', (req, res, next) => {
  if (!req.params.id) {
    // Passer à l'erreur handler
    next(new Error('ID utilisateur manquant'));
  }
});

// Middleware d'erreur (4 paramètres!)
app.use((err, req, res, next) => {
  console.error('[ERREUR]', err.message);
  res.status(500).json({
    error: err.message,
    status: 500
  });
});
```

### 2.4 Middleware populaires

#### body-parser (intégré depuis Express 4.16)
```javascript
// Parse les données JSON
app.use(express.json());

// Parse les données de formulaires
app.use(express.urlencoded({ extended: true }));

app.post('/utilisateurs', (req, res) => {
  console.log(req.body); // { nom: 'Alice', email: 'alice@example.com' }
  res.json({ created: true });
});
```

#### morgan (Logging des requêtes)
```javascript
const morgan = require('morgan');

// Logger les requêtes HTTP
app.use(morgan('combined'));
// Format: 127.0.0.1 - - [06/Mar/2026:14:30:45 +0000] "GET / HTTP/1.1" 200 234 "-" "Mozilla/5.0"

// Format personnalisé
app.use(morgan(':remote-addr :method :url :status :res[content-length] - :response-time ms'));
```

#### cors (Cross-Origin Resource Sharing)
```javascript
const cors = require('cors');

// Autoriser les requêtes CORS de tous les domaines
app.use(cors());

// Configuration restrictive
app.use(cors({
  origin: ['https://example.com', 'https://app.example.com'],
  methods: ['GET', 'POST'],
  credentials: true
}));
```

#### Middleware personnalisé complet
```javascript
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  try {
    // Vérification du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Token invalide' });
  }
};

app.get('/donnees-privees', authMiddleware, (req, res) => {
  res.json({ utilisateur: req.user });
});
```

### 2.5 Gestion des réponses

Express.js fournit plusieurs méthodes pour envoyer des réponses :

```javascript
// Réponses texte simples
res.send('Bonjour le monde');
res.sendStatus(204); // Envoyer juste un code de statut

// Réponses JSON
res.json({ id: 1, nom: 'Alice' });
res.jsonp({ data: 'jsonp' }); // Support JSONP

// Réponses HTML
res.type('html').send('<h1>HTML</h1>');

// Réponses fichiers
res.download('/path/to/file.pdf');
res.sendFile('/path/to/file.html');

// Redirections
res.redirect('/nouvelle-url');
res.redirect(301, '/url-deplacee-permanente');

// En-têtes personnalisés
res.header('X-Custom-Header', 'valeur');
res.set({
  'Content-Type': 'application/json',
  'X-API-Version': '2.0'
});

// Code de statut
res.status(201).json({ created: true });
res.status(404).send('Non trouvé');
```

---

## 3. Exemples pratiques

### 3.1 API REST complète avec Express.js

```javascript
const express = require('express');
const app = express();

app.use(express.json());

// Base de données simulée
let users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' }
];

let nextUserId = 3;

// GET : Lister tous les utilisateurs
app.get('/api/users', (req, res) => {
  const { limit = 10, offset = 0 } = req.query;
  const slicedUsers = users.slice(offset, offset + parseInt(limit));

  res.json({
    data: slicedUsers,
    total: users.length,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
});

// GET : Récupérer un utilisateur
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));

  if (!user) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' });
  }

  res.json(user);
});

// POST : Créer un utilisateur
app.post('/api/users', (req, res) => {
  const { name, email } = req.body;

  // Validation
  if (!name || !email) {
    return res.status(400).json({
      error: 'Les champs name et email sont requis'
    });
  }

  const newUser = {
    id: nextUserId++,
    name,
    email
  };

  users.push(newUser);
  res.status(201).json(newUser);
});

// PUT : Mettre à jour un utilisateur
app.put('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));

  if (!user) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' });
  }

  // Mettre à jour les champs fournis
  if (req.body.name) user.name = req.body.name;
  if (req.body.email) user.email = req.body.email;

  res.json(user);
});

// DELETE : Supprimer un utilisateur
app.delete('/api/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' });
  }

  const [deleted] = users.splice(index, 1);
  res.json({ message: 'Utilisateur supprimé', deleted });
});

// Middleware d'erreur global
app.use((err, req, res, next) => {
  console.error('[ERREUR]', err);
  res.status(500).json({
    error: 'Erreur serveur interne',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Route 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

app.listen(3000, () => {
  console.log('Serveur API démarré sur port 3000');
});
```

### 3.2 Serveur avec fichiers statiques et templates

```javascript
const express = require('express');
const path = require('path');
const app = express();

// Configuration du moteur de template
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Middleware pour les données globales
app.use((req, res, next) => {
  res.locals.siteName = 'Mon Application';
  res.locals.currentYear = new Date().getFullYear();
  next();
});

// Route avec template
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Accueil',
    users: ['Alice', 'Bob', 'Charlie']
  });
});

app.get('/utilisateur/:id', (req, res) => {
  const user = {
    id: req.params.id,
    name: 'Alice Dupont',
    email: 'alice@example.com',
    joinedDate: new Date('2024-01-15')
  };

  res.render('utilisateur', { user });
});

app.listen(3000);
```

**Fichier views/index.ejs :**
```ejs
<!DOCTYPE html>
<html>
<head>
  <title><%= title %> - <%= siteName %></title>
</head>
<body>
  <h1><%= title %></h1>
  <ul>
    <% users.forEach(user => { %>
      <li><%= user %></li>
    <% }); %>
  </ul>
  <footer>&copy; <%= currentYear %></footer>
</body>
</html>
```

### 3.3 Chaîne de middleware avancée

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());

// Middleware de logging
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
    );
  });

  next();
};

// Middleware d'authentification
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  try {
    req.user = jwt.verify(token, 'secret-key');
    next();
  } catch (err) {
    res.status(403).json({ error: 'Token invalide' });
  }
};

// Middleware de validation de rôle
const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    next();
  };
};

app.use(requestLogger);

// Routes publiques
app.post('/login', (req, res) => {
  const token = jwt.sign(
    { id: 1, username: 'alice', role: 'user' },
    'secret-key',
    { expiresIn: '1h' }
  );
  res.json({ token });
});

// Routes protégées
app.get('/profil', authenticate, (req, res) => {
  res.json({ profil: req.user });
});

// Routes avec rôles
app.delete('/users/:id',
  authenticate,
  authorize(['admin']),
  (req, res) => {
    res.json({ deleted: true, id: req.params.id });
  }
);

// Gestion d'erreur
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erreur serveur' });
});

app.listen(3000);
```

---

## 4. Bonnes pratiques

### 4.1 Structure de projet recommandée
```
mon-app-express/
├── src/
│   ├── index.js              # Fichier d'entrée
│   ├── app.js                # Configuration Express
│   ├── routes/               # Définition des routes
│   │   ├── users.js
│   │   ├── products.js
│   │   └── index.js
│   ├── controllers/          # Logique métier
│   │   ├── userController.js
│   │   └── productController.js
│   ├── middleware/           # Middleware personnalisé
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/               # Modèles (si applicable)
│   ├── utils/                # Utilitaires
│   └── config/               # Configuration
├── tests/
├── public/                   # Fichiers statiques
├── views/                    # Templates
├── .env
├── .env.example
├── package.json
└── README.md
```

### 4.2 Séparation des responsabilités

```javascript
// routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, validateEmail } = require('../middleware/validators');

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', validateEmail, userController.createUser);
router.put('/:id', authenticate, userController.updateUser);
router.delete('/:id', authenticate, userController.deleteUser);

module.exports = router;

// controllers/userController.js
const User = require('../models/User');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Non trouvé' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// app.js
const express = require('express');
const usersRouter = require('./routes/users');

const app = express();
app.use(express.json());
app.use('/api/users', usersRouter);

module.exports = app;
```

### 4.3 Gestion d'erreurs centralisée

```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError('Utilisateur non trouvé', 404);
  }
  res.json(user);
}));

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

### 4.4 Validation des données

```javascript
const validateEmail = (req, res, next) => {
  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Email invalide' });
  }

  next();
};

const validateUserData = (req, res, next) => {
  const { name, email, age } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Le nom doit avoir au moins 2 caractères');
  }

  if (!email) {
    errors.push('Email requis');
  }

  if (age && (age < 0 || age > 150)) {
    errors.push('Âge invalide');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

app.post('/users', validateUserData, (req, res) => {
  // Traitement
});
```

---

## 5. Comparaison / Alternatives

| Aspect | Express.js | Fastify | Hapi | Koa |
|--------|-----------|---------|------|-----|
| **Performance** | Très bonne | Excellente | Bonne | Très bonne |
| **Minimalisme** | Maximal | Maximal | Moyen | Maximal |
| **Middleware** | Pipeline | Plugin système | Plugins | Async/await natif |
| **Écosystème** | Énorme | Grandissant | Bon | Moyen |
| **Courbe d'apprentissage** | Facile | Moyen | Moyen | Moyen |
| **Production** | Excellente | Excellente | Bonne | Bonne |

**Pourquoi Express.js reste dominant :**
- Communauté massive et support largement documenté
- Millions d'applications existantes utilisant Express
- Écosystème de middleware très développé
- Performances suffisantes pour la plupart des cas
- Syntaxe familière et accessible

---

## 6. Ressources externes (analyse critique)

### 6.1 Documentation et apprentissage
- **Express.js Official Guide** (expressjs.com) : Référence officielle
  - **Forces** : Documentation complète et bien structurée
  - **Faiblesses** : Parfois superficielle sur les patterns avancés
  - **Utilité** : Consulter pour l'API officielle

- **MDN Web Docs - Express/Node.js** : Tutoriels de haute qualité
  - **Forces** : Explications pédagogiques, exemples pratiques
  - **Note** : Excellent pour débuter

### 6.2 Packages recommandés
- **cors** : Gestion du CORS
- **helmet** : Sécurité HTTP (en-têtes)
- **express-validator** : Validation de données
- **passport** : Authentification
- **joi** : Schémas de validation avancés

### 6.3 Outils et monitoring
- **Postman** ou **Insomnia** : Test d'APIs
- **New Relic** : Monitoring de performance
- **ESLint + Prettier** : Qualité du code

---

## 7. Points clés à retenir

1. **Routing intuitif** : Express.js propose une API simple et expressive pour définir des routes

2. **Middleware composable** : Le système de middleware permet de créer des chaînes de traitement flexibles

3. **Sans opinions** : Express.js laisse les choix architecturaux au développeur (base de données, authentification, etc.)

4. **Asynchrone par nature** : Support natif des Promises et async/await pour un code non-bloquant

5. **Performance** : Express.js offre une performance très suffisante pour la plupart des applications web

6. **Extensibilité** : Intégration facile avec des bibliothèques tierces et des modules npm

7. **Gestion d'erreurs** : Implémenter un middleware d'erreur centralisé pour une robustesse optimale

8. **Sécurité** : Utiliser helmet.js, valider les entrées, implémenter une authentification solide

---

**Dernière révision** : Mars 2026 | **Auteur** : Équipe Pédagogique | **License** : CC BY-NC-SA 4.0
