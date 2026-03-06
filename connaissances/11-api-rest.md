# API REST : Conception et Bonnes Pratiques — Fiche Technique N°11

> **Thème** : Architecture Logicielle Web | **Dernière mise à jour** : Mars 2026 | **Niveau** : Intermédiaire/Avancé

---

## 1. Introduction et contexte

REST (Representational State Transfer) est un style architectural pour concevoir des services web distribués, formalisé par Roy Fielding en 2000. Une API REST (Application Programming Interface) est une interface permettant à deux applications de communiquer via le protocole HTTP en utilisant des principes REST.

Les APIs REST sont devenues le standard de facto pour les services web modernes, supplantant des approches antérieures comme SOAP et RPC. Leur popularité provient de leur simplicité, leur scalabilité et leur alignement avec les fondements du Web.

**Importance :**
- 95% des APIs publiques utilisent REST
- Standardisation simplifiée de la communication entre services
- Facilite l'intégration tierce et les microservices
- Support natif par tous les navigateurs et frameworks modernes

---

## 2. Concepts fondamentaux

### 2.1 Principes REST

#### Principes de Fielding :

1. **Architecture Client-Serveur**
   - Séparation des responsabilités
   - Client et serveur évoluent indépendamment
   - Permet scalabilité et interopérabilité

2. **Stateless (Sans état)**
   - Chaque requête contient toutes les informations nécessaires
   - Le serveur ne stocke pas le contexte client
   - Facilite la scalabilité horizontale

   ```
   // ❌ Stateful (anti-pattern REST)
   GET /utilisateurs/1
   // Le serveur retient: "dernier ID utilisateur = 1"
   GET /articles  // Filtre les articles pour l'utilisateur 1

   // ✅ Stateless (conforme REST)
   GET /utilisateurs/1/articles  // Contexte complet dans la requête
   ```

3. **Cacheable (Caché)**
   - Les réponses peuvent être cachées par les clients et proxies
   - Améliore performance et réduit charge serveur
   - Utilisation d'en-têtes HTTP: Cache-Control, ETag, Last-Modified

4. **Interface Uniforme**
   - Ressources identifiées par URIs
   - Manipulation via représentations
   - Messages auto-descriptifs
   - HATEOAS (Hypermedia As The Engine Of Application State)

5. **Système en Couches**
   - Intermédiaires (proxy, cache) transparents
   - Chaque couche ne connaît que ses voisines
   - Améliore scalabilité et sécurité

### 2.2 Ressources et représentations

**Ressource :** Entité abstraite du domaine (utilisateur, article, produit)
**Représentation :** Format concret de cette ressource (JSON, XML, HTML)

```javascript
// Même ressource, représentations différentes

// JSON
GET /api/utilisateurs/1
{
  "id": 1,
  "nom": "Alice",
  "email": "alice@example.com"
}

// XML
GET /api/utilisateurs/1.xml
<?xml version="1.0"?>
<utilisateur>
  <id>1</id>
  <nom>Alice</nom>
  <email>alice@example.com</email>
</utilisateur>

// HTML
GET /utilisateurs/1
<h1>Alice</h1>
<p>Email: alice@example.com</p>
```

### 2.3 Verbes HTTP et opérations CRUD

| Verbe | Opération | Idempotent | Sûr | CRUD |
|-------|-----------|-----------|-----|------|
| GET | Lecture | ✓ | ✓ | Read |
| POST | Création | ✗ | ✗ | Create |
| PUT | Remplacement | ✓ | ✗ | Update |
| PATCH | Modification partielle | ✗ | ✗ | Update |
| DELETE | Suppression | ✓ | ✗ | Delete |
| HEAD | Lecture (sans corps) | ✓ | ✓ | - |
| OPTIONS | Exploration | ✓ | ✓ | - |

**Idempotent** : Plusieurs exécutions = une seule exécution
**Sûr** : N'a pas d'effet de bord sur le serveur

```javascript
// Exemples d'opérations CRUD

// CREATE
POST /api/utilisateurs
{ "nom": "Bob", "email": "bob@example.com" }
→ 201 Created
→ { "id": 2, "nom": "Bob", ... }

// READ
GET /api/utilisateurs/1
→ 200 OK
→ { "id": 1, "nom": "Alice", ... }

// UPDATE (remplacement complet)
PUT /api/utilisateurs/1
{ "nom": "Alice Dupont", "email": "alice.dupont@example.com" }
→ 200 OK ou 204 No Content

// PARTIAL UPDATE
PATCH /api/utilisateurs/1
{ "email": "newemail@example.com" }
→ 200 OK

// DELETE
DELETE /api/utilisateurs/1
→ 204 No Content
```

### 2.4 Codes de statut HTTP

**Classe 2xx - Succès**
- 200 OK : Requête réussie, résultat dans le corps
- 201 Created : Ressource créée avec succès
- 202 Accepted : Requête acceptée, traitement asynchrone
- 204 No Content : Succès sans contenu à retourner

**Classe 3xx - Redirection**
- 301 Moved Permanently : Ressource déplacée définitivement
- 304 Not Modified : Ressource non modifiée (cache valide)

**Classe 4xx - Erreur client**
- 400 Bad Request : Requête mal formée
- 401 Unauthorized : Authentification requise
- 403 Forbidden : Accès refusé (authentifié mais sans permission)
- 404 Not Found : Ressource inexistante
- 409 Conflict : Conflit avec l'état actuel
- 422 Unprocessable Entity : Données invalides

**Classe 5xx - Erreur serveur**
- 500 Internal Server Error : Erreur serveur
- 503 Service Unavailable : Service temporairement indisponible

```javascript
// Exemples de réponses d'erreur

// 400 - Requête invalide
POST /api/utilisateurs
{ "nom": "" }  // Champ vide
→ 400 Bad Request
→ { "error": "validation_error", "details": [{ "field": "nom", "message": "Requis" }] }

// 404 - Non trouvé
GET /api/utilisateurs/999
→ 404 Not Found
→ { "error": "not_found", "message": "Utilisateur non trouvé" }

// 401 - Non authentifié
GET /api/donnees-privees
(sans token d'authentification)
→ 401 Unauthorized
→ { "error": "unauthorized", "message": "Token manquant" }

// 409 - Conflit
POST /api/utilisateurs
{ "email": "alice@example.com" }  // Email déjà existant
→ 409 Conflict
→ { "error": "conflict", "message": "Email déjà utilisé" }
```

### 2.5 JSON comme format standard

```javascript
// Structure cohérente pour les réponses

// Requête réussie avec données
{
  "success": true,
  "data": {
    "id": 1,
    "nom": "Alice",
    "email": "alice@example.com"
  }
}

// Liste avec pagination
{
  "success": true,
  "data": [
    { "id": 1, "nom": "Alice" },
    { "id": 2, "nom": "Bob" }
  ],
  "pagination": {
    "total": 100,
    "limit": 2,
    "offset": 0,
    "hasMore": true
  }
}

// Erreur structurée
{
  "success": false,
  "error": {
    "code": "validation_error",
    "message": "Les données fournies sont invalides",
    "details": [
      {
        "field": "email",
        "message": "Email invalide"
      },
      {
        "field": "age",
        "message": "Doit être >= 18"
      }
    ]
  }
}
```

---

## 3. Exemples pratiques

### 3.1 API REST complète avec Express.js

```javascript
const express = require('express');
const app = express();

app.use(express.json());

// Simulation d'une base de données
const db = {
  utilisateurs: [
    { id: 1, nom: 'Alice', email: 'alice@example.com', role: 'admin' },
    { id: 2, nom: 'Bob', email: 'bob@example.com', role: 'user' }
  ],
  nextId: 3
};

// Middleware de validation
const validateUser = (req, res, next) => {
  const { nom, email } = req.body;
  const errors = [];

  if (!nom || nom.trim().length < 2) {
    errors.push({ field: 'nom', message: 'Minimum 2 caractères requis' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push({ field: 'email', message: 'Email invalide' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'validation_error',
        message: 'Données invalides',
        details: errors
      }
    });
  }

  next();
};

// GET : Lister les utilisateurs avec pagination et filtrage
app.get('/api/utilisateurs', (req, res) => {
  const { role, limit = 10, offset = 0, search } = req.query;
  let users = [...db.utilisateurs];

  // Filtrage par rôle
  if (role) {
    users = users.filter(u => u.role === role);
  }

  // Recherche par nom/email
  if (search) {
    const s = search.toLowerCase();
    users = users.filter(u =>
      u.nom.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s)
    );
  }

  // Pagination
  const total = users.length;
  users = users.slice(offset, offset + parseInt(limit));

  res.json({
    success: true,
    data: users,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: offset + parseInt(limit) < total
    }
  });
});

// GET : Récupérer un utilisateur spécifique
app.get('/api/utilisateurs/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = db.utilisateurs.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'not_found',
        message: `Utilisateur ${id} non trouvé`
      }
    });
  }

  // En-têtes de cache
  res.set('Cache-Control', 'public, max-age=300'); // Cache 5 minutes
  res.json({
    success: true,
    data: user
  });
});

// POST : Créer un nouvel utilisateur
app.post('/api/utilisateurs', validateUser, (req, res) => {
  const { nom, email, role = 'user' } = req.body;

  // Vérifier email unique
  if (db.utilisateurs.some(u => u.email === email)) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'conflict',
        message: 'Cet email est déjà utilisé'
      }
    });
  }

  const newUser = {
    id: db.nextId++,
    nom,
    email,
    role
  };

  db.utilisateurs.push(newUser);

  res.status(201).json({
    success: true,
    data: newUser
  });
});

// PUT : Remplacer complètement un utilisateur
app.put('/api/utilisateurs/:id', validateUser, (req, res) => {
  const id = parseInt(req.params.id);
  const user = db.utilisateurs.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: { code: 'not_found', message: 'Utilisateur non trouvé' }
    });
  }

  // Vérifier unicité email (si changé)
  if (req.body.email !== user.email &&
      db.utilisateurs.some(u => u.email === req.body.email)) {
    return res.status(409).json({
      success: false,
      error: { code: 'conflict', message: 'Email déjà utilisé' }
    });
  }

  // Remplacement complet
  user.nom = req.body.nom;
  user.email = req.body.email;
  user.role = req.body.role || 'user';

  res.json({
    success: true,
    data: user
  });
});

// PATCH : Modification partielle
app.patch('/api/utilisateurs/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = db.utilisateurs.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: { code: 'not_found', message: 'Utilisateur non trouvé' }
    });
  }

  // Mise à jour sélective
  if (req.body.nom !== undefined) user.nom = req.body.nom;
  if (req.body.email !== undefined) user.email = req.body.email;
  if (req.body.role !== undefined) user.role = req.body.role;

  res.json({
    success: true,
    data: user
  });
});

// DELETE : Supprimer un utilisateur
app.delete('/api/utilisateurs/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.utilisateurs.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'not_found', message: 'Utilisateur non trouvé' }
    });
  }

  const deleted = db.utilisateurs.splice(index, 1);

  res.status(204).send(); // No Content
});

// Route 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'not_found', message: 'Route non trouvée' }
  });
});

// Middleware d'erreur global
app.use((err, req, res, next) => {
  console.error('[ERREUR]', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'internal_error',
      message: 'Erreur serveur interne'
    }
  });
});

app.listen(3000, () => {
  console.log('API REST démarrée sur http://localhost:3000');
});
```

### 3.2 Authentification JWT

```javascript
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';
const JWT_EXPIRY = '24h';

// Middleware d'authentification
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'unauthorized', message: 'Token manquant' }
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: { code: 'forbidden', message: 'Token invalide ou expiré' }
    });
  }
};

// Endpoint de connexion
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Vérification simplifiée (en production: hachage bcrypt)
  const user = db.utilisateurs.find(u => u.email === email);

  if (!user || password !== 'password123') {
    return res.status(401).json({
      success: false,
      error: { code: 'unauthorized', message: 'Identifiants invalides' }
    });
  }

  // Génération du token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );

  res.json({
    success: true,
    data: { token, user }
  });
});

// Endpoint protégé
app.get('/api/profil', authenticate, (req, res) => {
  res.json({
    success: true,
    data: { utilisateur: req.user }
  });
});

// Middleware d'autorisation par rôle
const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'forbidden', message: 'Accès refusé' }
      });
    }
    next();
  };
};

// Endpoint administrateur
app.delete('/api/utilisateurs/:id',
  authenticate,
  authorize(['admin']),
  (req, res) => {
    // Suppression logique
    res.status(204).send();
  }
);
```

### 3.3 CORS et configuration sécurisée

```javascript
const cors = require('cors');

// Configuration CORS stricte
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://example.com',
      'https://app.example.com',
      'http://localhost:3000' // Développement
    ];

    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('CORS non autorisé'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 3600
};

app.use(cors(corsOptions));

// Préflight request (automatiquement géré par cors)
// OPTIONS /api/utilisateurs → vérifie les permissions
```

---

## 4. Bonnes pratiques

### 4.1 Versioning des APIs

```javascript
// Versioning par URL
app.get('/api/v1/utilisateurs', ...);
app.get('/api/v2/utilisateurs', ...);

// Versioning par en-tête
app.get('/api/utilisateurs', (req, res) => {
  const version = req.headers['api-version'] || '1';
  if (version === '2') {
    // Nouveau format
  } else {
    // Format legacy
  }
});
```

### 4.2 Pagination

```javascript
app.get('/api/articles', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = (page - 1) * limit;

  const total = articles.length;
  const data = articles.slice(offset, offset + limit);

  res.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit)
    }
  });
});
```

### 4.3 Filtrage et tri

```javascript
app.get('/api/articles', (req, res) => {
  let articles = [...db.articles];

  // Filtrage
  if (req.query.categorie) {
    articles = articles.filter(a => a.categorie === req.query.categorie);
  }

  if (req.query.auteur) {
    articles = articles.filter(a => a.auteur.includes(req.query.auteur));
  }

  // Tri
  const sortBy = req.query.sortBy || 'date';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

  articles.sort((a, b) => {
    if (sortBy === 'date') {
      return (new Date(a.date) - new Date(b.date)) * sortOrder;
    } else if (sortBy === 'titre') {
      return a.titre.localeCompare(b.titre) * sortOrder;
    }
    return 0;
  });

  res.json({
    success: true,
    data: articles,
    filters: {
      categorie: req.query.categorie,
      auteur: req.query.auteur,
      sortBy,
      sortOrder
    }
  });
});

// Utilisation:
// GET /api/articles?categorie=tech&auteur=alice&sortBy=date&sortOrder=desc
```

### 4.4 Conventions de naming

```javascript
// ✓ Pluriel pour collections
GET /api/utilisateurs
GET /api/articles

// ✗ Singulier
GET /api/utilisateur  // Mauvais

// ✓ Kebab-case pour les chemins
GET /api/utilisateurs/123/articles-publiés

// ✗ camelCase ou snake_case
GET /api/utilisateurs/123/articlesPubies  // Mauvais

// ✓ Noms ressources, pas verbes
POST /api/utilisateurs  // Crée un utilisateur

// ✗ Verbes d'action
POST /api/creer-utilisateur  // Mauvais

// ✓ IDs numériques ou UUID
GET /api/utilisateurs/550e8400-e29b-41d4-a716-446655440000

// Relations imbriquées
GET /api/utilisateurs/1/articles  // Articles de l'utilisateur 1
POST /api/utilisateurs/1/articles  // Créer article pour utilisateur 1
GET /api/utilisateurs/1/articles/5  // Article 5 de l'utilisateur 1
```

### 4.5 Documentation avec OpenAPI/Swagger

```javascript
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Utilisateurs',
      version: '1.0.0',
      description: 'API REST pour la gestion des utilisateurs'
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Développement' },
      { url: 'https://api.example.com', description: 'Production' }
    ]
  },
  apis: ['./routes/*.js']
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

**Dans les routes :**
```javascript
/**
 * @swagger
 * /api/utilisateurs:
 *   get:
 *     summary: Lister les utilisateurs
 *     parameters:
 *       - name: role
 *         in: query
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: array }
 */
app.get('/api/utilisateurs', ...);
```

---

## 5. Comparaison / Alternatives

| Style | REST | GraphQL | gRPC | WebSocket |
|-------|------|---------|------|-----------|
| **Paradigme** | Resource-oriented | Query-oriented | RPC | Real-time |
| **Transport** | HTTP | HTTP | HTTP/2 | WebSocket |
| **Data format** | JSON/XML | JSON | Protocol Buffers | JSON/Binary |
| **Complexité** | Simple | Complexe | Complexe | Moyenne |
| **Cas d'usage** | APIs publiques | APIs flexibles | Microservices haute-perf | Real-time |
| **Caching** | Facile | Difficile | Difficile | Native |

**REST reste dominant pour :**
- APIs publiques et third-party
- Simplicité et standards
- Caching et proxy
- Équipes distribuées

---

## 6. Ressources externes (analyse critique)

### 6.1 Spécifications et standards
- **RFC 7231 (HTTP/1.1 Semantics)** : Spécification officielle HTTP
  - **Forces** : Autorité normative, complète
  - **Faiblesses** : Dense et technique
  - **Note** : Reference indispensable

- **OpenAPI/Swagger** (openapis.org) : Standard de documentation
  - **Forces** : Interopérabilité, outils variés
  - **Utilité** : Génération de clients, tests automatisés

### 6.2 Outils de test
- **Postman** (postman.com) : Client REST graphique
  - **Forces** : Interface intuitive, mock servers, tests
  - **Faiblesses** : Propriétaire, dépendance de cloud

- **Insomnia** (insomnia.rest) : Alternative open-source
  - **Forces** : UX moderne, import/export
  - **Note** : Excellent choix pour développement

### 6.3 Patterns et bonnes pratiques
- **REST API Best Practices** (Microsoft Learn) : Guide complet
  - **Forces** : Approche pragmatique, patterns éprouvés
  - **Note** : Excellent pour design d'APIs en production

---

## 7. Points clés à retenir

1. **Principes fondamentaux** : Stateless, client-serveur, cacheable, interface uniforme

2. **Ressources primaires** : Concevoir autour de ressources (noms), pas d'actions (verbes)

3. **Verbes HTTP sémantiques** : GET, POST, PUT, PATCH, DELETE ont des significations précises

4. **Codes de statut explicites** : 2xx (succès), 4xx (erreur client), 5xx (erreur serveur)

5. **JSON structuré** : Enveloppe cohérente avec succès/erreur standardisée

6. **Versioning** : Prévoir l'évolution (v1, v2) sans casser les clients existants

7. **Sécurité** : CORS stricte, HTTPS obligatoire, authentification/autorisation robustes

8. **Documentation** : OpenAPI/Swagger automatise la documentation et les tests

9. **Pagination** : Essentielle pour collections volumineuses

10. **Cache et headers** : Utiliser ETag, Last-Modified, Cache-Control pour performance

---

**Dernière révision** : Mars 2026 | **Auteur** : Équipe Pédagogique | **License** : CC BY-NC-SA 4.0
