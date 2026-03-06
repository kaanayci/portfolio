# Authentification et Gestion des Tokens — Fiche Technique N°15

> **Thème** : Mécanismes d'authentification modernes et gestion des tokens | **Dernière mise à jour** : Mars 2026 | **Niveau** : Intermédiaire/Avancé

---

## 1. Introduction et contexte

L'authentification est le processus de vérification de l'identité d'un utilisateur, tandis que l'autorisation détermine les ressources accessibles. Ces deux éléments forment le socle de la sécurité des applications web modernes.

Les défis contemporains incluent:

- **Distribution d'applications** : Besoin d'authentification sans session centralisée
- **APIs et microservices** : Authentification stateless, scalable
- **Accès tiers** : Délégation de permissions sans partager passwords
- **Authentification multi-facteur** : Sécurité renforcée contre phishing

### 1.1 Évolution des mécanismes

1. **HTTP Basic Auth (années 1990)** : Username:password en Base64 (obsolète, peu sécurisé)
2. **Session-based (années 2000)** : Cookies et sessions serveur (persistant)
3. **Token-based (années 2010)** : JWT et OAuth (moderne, stateless)
4. **Passwordless (années 2020)** : WebAuthn, TOTP, push notifications (tendance)

---

## 2. Concepts fondamentaux

### 2.1 Session-based vs Token-based authentication

#### **Session-based (Traditional)**

```
Client                              Server
  |                                   |
  |--1. POST /login (user/password)-->|
  |                                   |
  |                 2. Valide credentials
  |                 3. Crée session ID
  |<------Response: Set-Cookie: sid---|
  |                                   |
  |--4. GET /protected (Cookie: sid)->|
  |                                   |
  |           5. Cherche session en mémoire/BD
  |           6. Valide actif & non expiré
  |<----------Response: Protected data-|
```

**Avantages:**
- Révocation immédiate possible
- Contrôle serveur total sur session
- Logout simple (suppression session)

**Inconvénients:**
- Stockage côté serveur requis (scaling difficile)
- État global (pas de vrai stateless)
- Problème CSRF à gérer

#### **Token-based (Moderne)**

```
Client                              Server
  |                                   |
  |--1. POST /login (user/password)-->|
  |                                   |
  |                 2. Valide credentials
  |                 3. Crée token signé
  |<------Response: {"token": "jwt.."}-|
  |                                   |
  |--4. GET /protected (Header: Token)-|
  |                                   |
  |           5. Valide signature du token
  |           6. Extrait claims du payload
  |<----------Response: Protected data-|
```

**Avantages:**
- Stateless, pas de stockage serveur
- Scalable horizontalement
- Idéal pour APIs et microservices
- Peut traverser domaines (CORS friendly)

**Inconvénients:**
- Révocation complexe (token valide jusqu'expiration)
- Plus grand payload que session ID
- Signature obligatoire (ajout complexité)

### 2.2 Structure JWT (JSON Web Token)

Un JWT se compose de trois parties séparées par des points:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

[  HEADER  ] . [  PAYLOAD  ] . [  SIGNATURE  ]
```

#### **1. Header (Base64URL encodé)**

```json
{
  "alg": "HS256",    // Algorithme signature (HMAC SHA-256)
  "typ": "JWT"       // Type de token
}

// Peut aussi inclure:
"kid": "2024-key-1" // Key ID pour rotation clés
```

#### **2. Payload (Base64URL encodé)**

```json
{
  "sub": "user_12345",           // Subject (user ID standard)
  "name": "Jean Dupont",         // Claims personnalisées
  "email": "jean@example.com",
  "role": "admin",
  "permissions": ["read", "write"],
  "iat": 1516239022,             // Issued At (timestamp)
  "exp": 1516242622,             // Expiration (1 heure après iat)
  "nbf": 1516239022,             // Not Before (usage antidaté)
  "jti": "unique-token-id"       // JWT ID (révocation possible)
}
```

**Claims standards (RFC 7519):**
- `sub` : Sujet/utilisateur
- `aud` : Audience (pour qui ce token?)
- `iss` : Issuer (qui l'a créé?)
- `iat` : Émis à (timestamp)
- `exp` : Expiration (timestamp)
- `nbf` : Pas avant (timestamp)

#### **3. Signature (Base64URL encodé)**

Garantit l'intégrité du token (n'a pas été modifié).

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  SECRET_KEY
)
```

**Important**: La signature utilise une clé secrète connue SEULEMENT du serveur. Le client ne peut pas créer/modifier la signature sans cette clé.

### 2.3 OAuth 2.0 Flow (Standard délégation)

OAuth permet qu'un utilisateur autorise une application tierce à accéder à ses ressources sans partager son password.

```
User                 Client App              Authorization Server (Google)
 |                       |                              |
 |--1. Login via Google-->|                              |
 |                       |                              |
 |                  2. Redir to Google OAuth endpoint  |
 |<--Redir to Google login-|                              |
 |                       |                              |
 |--3. Login à Google----|---Credentials---->|          |
 |                       |                   | Valide   |
 |                       |<--Auth Code--------|          |
 |<--Redirect to app-----|                              |
 |                       |                              |
 |                  4. Backend: Échange code pour token
 |                       |----Auth Code + Secret------->|
 |                       |<------Access Token-----------|
 |                       |                              |
 |<--Response: Logged in-|                              |
```

**Avantages:**
- User ne partage jamais password avec application tierce
- Révocation possible côté provider
- Permissions granulaires (scopes)
- Standard industriel

### 2.4 Comparaison des approches

| Critère | Session | JWT | OAuth 2.0 |
|---------|---------|-----|-----------|
| **État serveur** | Avec état | Stateless | Stateless (délégué) |
| **Sécurité** | Bonne | Excellente avec HTTPS | Excellente |
| **Scalabilité** | Difficile | Excellente | Excellente |
| **Révocation** | Immédiate | Complexe | Possible (tokens courts) |
| **Use case** | Web monolithique | APIs, microservices | SSO, intégration tierce |

---

## 3. Exemples pratiques

### 3.1 JWT complet : Création et validation

```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SECRET_KEY = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// ============ CRÉATION DE TOKENS ============

async function generateTokens(userId, email, role) {
  // Access Token: courte durée, permissif
  const accessToken = jwt.sign(
    {
      sub: userId,          // Subject (user)
      email: email,
      role: role,
      type: 'access'
    },
    SECRET_KEY,
    {
      expiresIn: '15m',     // 15 minutes
      algorithm: 'HS256',
      issuer: 'myapp',
      audience: 'myapp-users'
    }
  );

  // Refresh Token: longue durée, pour renouvellement
  const refreshToken = jwt.sign(
    {
      sub: userId,
      type: 'refresh',
      jti: generateUniqueId()  // JWT ID pour révocation
    },
    REFRESH_SECRET,
    {
      expiresIn: '7d',      // 7 jours
      algorithm: 'HS256'
    }
  );

  // Sauvegarder refresh token en DB (permet révocation)
  await db.saveRefreshToken({
    userId: userId,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isRevoked: false
  });

  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
    expiresIn: 900  // 15 min en secondes
  };
}

// ============ UTILISATION DES TOKENS ============

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Authentifier utilisateur
  const user = await db.findUserByEmail(email);
  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Email ou password invalide' });
  }

  // Générer tokens
  const { accessToken, refreshToken, expiresIn } = await generateTokens(
    user.id,
    user.email,
    user.role
  );

  // Retourner tokens (access token en response, refresh en cookie)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,      // Pas accessible JavaScript (XSS protection)
    secure: true,        // HTTPS uniquement
    sameSite: 'strict',  // Protection CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 jours
  });

  res.json({
    accessToken: accessToken,
    expiresIn: expiresIn
  });
});

// ============ VALIDATION DE TOKENS ============

// Middleware de vérification
function verifyToken(req, res, next) {
  // Token doit venir de header Authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, SECRET_KEY, {
      algorithms: ['HS256'],
      audience: 'myapp-users'
    });

    // Token valide, ajouter user info à request
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré' });
    }
    return res.status(401).json({ error: 'Token invalide' });
  }
}

// Route protégée
app.get('/protected', verifyToken, (req, res) => {
  res.json({
    message: `Bienvenue ${req.user.email}`,
    role: req.user.role
  });
});

// ============ RENOUVELLEMENT DES TOKENS ============

app.post('/refresh', async (req, res) => {
  // Refresh token vient du cookie
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token manquant' });
  }

  try {
    // Vérifier signature
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

    // Vérifier qu'il n'a pas été révoqué en DB
    const storedToken = await db.findRefreshToken(decoded.jti);
    if (!storedToken || storedToken.isRevoked) {
      return res.status(401).json({ error: 'Refresh token révoqué' });
    }

    // Récupérer infos utilisateur
    const user = await db.findUser(decoded.sub);

    // Générer nouveau access token
    const newAccessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        type: 'access'
      },
      SECRET_KEY,
      { expiresIn: '15m' }
    );

    res.json({
      accessToken: newAccessToken,
      expiresIn: 900
    });
  } catch (err) {
    return res.status(401).json({ error: 'Refresh token invalide' });
  }
});

// ============ LOGOUT (RÉVOCATION) ============

app.post('/logout', verifyToken, async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    // Décoder sans vérifier (il peut être expiré)
    const decoded = jwt.decode(refreshToken);

    // Marquer comme révoqué en BD
    await db.revokeRefreshToken(decoded.jti);
  }

  // Supprimer cookie côté client
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  });

  res.json({ message: 'Déconnexion effectuée' });
});
```

### 3.2 OAuth 2.0 avec Google

```javascript
const { OAuth2Client } = require('google-auth-library');
const express = require('express');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URL = 'https://myapp.com/auth/callback';

const client = new OAuth2Client({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: REDIRECT_URL
});

// ============ LANCER FLUX OAUTH ============

app.get('/auth/google', (req, res) => {
  // URL où rediriger l'utilisateur pour login Google
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',        // Récupérer refresh token
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  });

  res.redirect(authUrl);
});

// ============ CALLBACK OAUTH ============

app.get('/auth/callback', async (req, res) => {
  const code = req.query.code;

  try {
    // Échanger le code pour les tokens
    const { tokens } = await client.getToken(code);

    // Vérifier la validité du token ID
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: CLIENT_ID
    });

    const payload = ticket.getPayload();

    // Extraire infos utilisateur
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    // Chercher ou créer utilisateur en DB
    let user = await db.findUserByEmail(email);
    if (!user) {
      user = await db.createUser({
        googleId: googleId,
        email: email,
        name: name,
        picture: picture,
        provider: 'google'
      });
    }

    // Générer nos propres tokens
    const { accessToken, refreshToken } = await generateTokens(
      user.id,
      user.email,
      user.role
    );

    // Sauvegarder token Google pour accès ultérieur (optional)
    await db.updateUser(user.id, {
      googleAccessToken: tokens.access_token,
      googleRefreshToken: tokens.refresh_token,
      googleTokenExpiry: new Date(tokens.expiry_date)
    });

    // Authentifier l'utilisateur (définir session/cookie)
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Rediriger vers dashboard
    res.redirect('/dashboard');
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.status(400).json({ error: 'Erreur authentification OAuth' });
  }
});

// ============ UTILISER TOKEN GOOGLE POUR APPELS API ============

app.get('/google-calendar-events', verifyToken, async (req, res) => {
  const user = await db.findUser(req.user.sub);

  // Vérifier si token Google a expiré
  if (new Date() > user.googleTokenExpiry) {
    // Renouveler le token
    const { credentials } = await client.refreshToken(
      user.googleRefreshToken
    );

    await db.updateUser(user.id, {
      googleAccessToken: credentials.access_token,
      googleTokenExpiry: new Date(credentials.expiry_date)
    });
  }

  // Faire appel à Google Calendar API
  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      headers: {
        'Authorization': `Bearer ${user.googleAccessToken}`
      }
    }
  );

  const events = await response.json();
  res.json(events);
});
```

### 3.3 Sécurisation avancée des cookies

```javascript
const session = require('express-session');
const RedisStore = require('connect-redis').default;

// ============ CONFIGURATION STRICTE COOKIES ============

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  name: 'sessionId',  // Pas 'connect.sid' (révèle tech stack)
  cookie: {
    // ===== SÉCURITÉ =====
    secure: true,                    // HTTPS uniquement (TLS 1.2+)
    httpOnly: true,                  // Pas accessible JavaScript (XSS protection)
    sameSite: 'strict',              // Pas envoyé cross-site (CSRF protection)
                                     // 'strict' = jamais
                                     // 'lax' = seulement navigation top-level
                                     // 'none' = toujours (nécessite Secure)

    // ===== EXPIRATION =====
    maxAge: 15 * 60 * 1000,          // 15 minutes
    expires: null,                   // null = session cookie (expire fermeture)

    // ===== DOMAINE =====
    domain: 'example.com',           // Seulement ce domaine
    path: '/',                       // Tous les chemins

    // ===== OPTIONS SUPPLÉMENTAIRES =====
    priority: 'high'                 // Priorité haute (persistance)
  },
  resave: false,                     // Pas re-sauvegarder non modifiée
  saveUninitialized: false,          // Pas créer session vide
  proxy: true                        // Si derrière reverse proxy
}));

// ============ ROTATION COOKIE APRÈS LOGIN ============

app.post('/login', async (req, res) => {
  // Authentifier utilisateur...

  // Régénérer session ID (anti-session fixation)
  req.session.regenerate((err) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur session' });
    }

    req.session.userId = user.id;

    // Resauvegarder et envoyer cookie mis à jour
    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur session' });
      }

      res.json({ message: 'Connexion réussie' });
    });
  });
});

// ============ GESTION SÉCURISÉE TOKENS STOCKAGE ============

// NE JAMAIS faire:
// localStorage.setItem('token', jwtToken)  // ⚠️ Vulnérable au XSS!

// FAIRE:
// 1. Stocker dans httpOnly cookie (inaccessible JavaScript)
// 2. Ou stocker temporairement en mémoire (perd au refresh)
// 3. Ou utiliser session storage avec refresh périodique

// Pattern recommandé:
app.post('/login', async (req, res) => {
  const tokens = await generateTokens(user.id, user.email, user.role);

  // Retourner access token court dans response body
  // (application stocke en mémoire JS)
  // Refresh token dans httpOnly cookie sécurisé

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/api/refresh'  // Limiter accès au endpoint refresh
  });

  res.json({
    accessToken: tokens.accessToken,
    expiresIn: 900
  });
});
```

### 3.4 Authentification multi-facteur (MFA)

```javascript
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// ============ ACTIVATION MFA ============

app.post('/mfa/setup', verifyToken, async (req, res) => {
  const user = await db.findUser(req.user.sub);

  // Générer secret TOTP (Time-based One-Time Password)
  const secret = speakeasy.generateSecret({
    name: `MyApp (${user.email})`,
    issuer: 'MyApp',
    length: 32
  });

  // Générer QR code
  const qrCode = await qrcode.toDataURL(secret.otpauth_url);

  // Sauvegarder secret temporairement (non confirmé)
  await db.saveTemporaryMFASecret(user.id, secret.base32);

  res.json({
    qrCode: qrCode,
    secret: secret.base32,  // Backup codes si QR fail
    message: 'Scanner QR avec Google Authenticator/Authy'
  });
});

// ============ CONFIRMER MFA ============

app.post('/mfa/confirm', verifyToken, async (req, res) => {
  const { code } = req.body;
  const user = await db.findUser(req.user.sub);

  // Récupérer secret temporaire
  const secret = await db.getTemporaryMFASecret(user.id);
  if (!secret) {
    return res.status(400).json({ error: 'MFA setup pas commencé' });
  }

  // Valider code (window: 30 secondes avant/après pour horloge désynchronisée)
  const isValid = speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: code,
    window: 2  // 2 * 30 secondes = ±1 minute tolérance
  });

  if (!isValid) {
    return res.status(400).json({ error: 'Code invalide' });
  }

  // Confirmer MFA en DB
  await db.enableMFAForUser(user.id, secret);

  // Générer codes de secours
  const backupCodes = Array.from({ length: 10 }, () =>
    Math.random().toString(36).substring(2, 10).toUpperCase()
  );

  // Sauvegarder codes hashés (jamais en clair!)
  await db.saveBackupCodes(
    user.id,
    backupCodes.map(code => bcrypt.hashSync(code))
  );

  res.json({
    success: true,
    backupCodes: backupCodes,  // Retourner UNE FOIS seulement
    message: 'Sauvegardez les codes de secours dans lieu sûr'
  });
});

// ============ LOGIN AVEC MFA ============

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await db.findUserByEmail(email);
  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Email ou password invalide' });
  }

  // Vérifier si MFA activé
  if (user.mfaEnabled) {
    // Créer token temporaire (valide 5 minutes)
    const mfaToken = jwt.sign(
      { sub: user.id, type: 'mfa' },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    return res.json({
      mfaRequired: true,
      mfaToken: mfaToken,
      message: 'Entrez le code de votre authenticator'
    });
  }

  // Pas MFA, login normal
  const { accessToken, refreshToken } = await generateTokens(
    user.id,
    user.email,
    user.role
  );

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  });

  res.json({ accessToken, expiresIn: 900 });
});

// ============ VALIDER CODE MFA ============

app.post('/mfa/verify', async (req, res) => {
  const { mfaToken, code } = req.body;

  // Vérifier token temporaire MFA
  let decoded;
  try {
    decoded = jwt.verify(mfaToken, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Token MFA expiré' });
  }

  if (decoded.type !== 'mfa') {
    return res.status(400).json({ error: 'Token invalide' });
  }

  const user = await db.findUser(decoded.sub);

  // Valider code TOTP
  const secret = await db.getMFASecret(user.id);
  const isValid = speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: code,
    window: 2
  });

  if (!isValid) {
    // Vérifier codes de secours
    const backupCodes = await db.getBackupCodes(user.id);
    const hashedCode = bcrypt.hashSync(code);

    const foundBackup = backupCodes.find(stored =>
      bcrypt.compareSync(code, stored.hash)
    );

    if (!foundBackup) {
      return res.status(401).json({ error: 'Code invalide' });
    }

    // Supprimer code de secours utilisé
    await db.deleteBackupCode(foundBackup.id);
  }

  // MFA validé, générer tokens finaux
  const { accessToken, refreshToken } = await generateTokens(
    user.id,
    user.email,
    user.role
  );

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  });

  res.json({ accessToken, expiresIn: 900 });
});
```

---

## 4. Bonnes pratiques

### 4.1 Meilleures pratiques recommandées du cours

1. **HTTPS obligatoire** : Pas d'exception, tous les transferts doivent être chiffrés
2. **Tokens/Passwords jamais en logs** : Filtrer les données sensibles
3. **Pas d'expiration infinie** : Access tokens: 15-30 min, Refresh tokens: 7-30 jours
4. **Éviter connexions multiples simultanées** : Déconnecter session précédente
5. **Sauvegarder refresh tokens en DB** : Permet révocation granulaire

### 4.2 Sécurité des mots de passe

```javascript
// ============ VALIDATION PASSWORD ============

function validatePassword(password) {
  // Exemple strict du cours: P@sw0rd|_34$
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&|_\-^()=+\\[\]{};:'",<>./])[a-zA-Z\d@$!%*?&|_\-^()=+\\[\]{};:'",<>./]{12,}$/;

  if (!regex.test(password)) {
    return {
      valid: false,
      message: 'Password doit: 12+ caractères, majuscule, minuscule, chiffre, caractère spécial'
    };
  }

  // Vérifier blacklist mots-clés communs
  const blacklist = ['password', 'admin', 'example', 'user'];
  if (blacklist.some(word => password.toLowerCase().includes(word))) {
    return {
      valid: false,
      message: 'Password trop prévisible'
    };
  }

  return { valid: true };
}

// ============ HACHAGE PASSWORD SECURE ============

const argon2 = require('argon2');

async function hashPassword(password) {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,    // 64 MB
    timeCost: 3,          // 3 itérations
    parallelism: 4        // 4 threads parallèles
  });
}

app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  // Valider password force
  const validation = validatePassword(password);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.message });
  }

  // Hacher password
  const hash = await hashPassword(password);

  // Sauvegarder hash (JAMAIS password)
  await db.createUser({
    email: email,
    passwordHash: hash
  });

  res.status(201).json({ message: 'Utilisateur créé' });
});
```

### 4.3 Protection contre timing attacks

```javascript
// ============ TIMING SAFE COMPARISON ============

const crypto = require('crypto');

// Mauvais: Révèle longueur et position d'erreur
function insecureCompare(password, hash) {
  return password === hash;  // Sortie rapide si différent
}

// Bon: Constant-time comparison
function secureCompare(password, hash) {
  // crypto.timingSafeEqual: toujours même temps
  // qu'importe où diffère les strings
  return crypto.timingSafeEqual(
    Buffer.from(password),
    Buffer.from(hash)
  );
}

// Meilleur: Utiliser bcrypt/argon2 (gèrent déjà timing-safety)
const argon2 = require('argon2');

async function validatePassword(password, hash) {
  try {
    // argon2.verify() est timing-safe
    return await argon2.verify(hash, password);
  } catch (err) {
    return false;
  }
}

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await db.findUserByEmail(email);

  // Timing safe: même si user n'existe pas
  const isValid = user
    ? await argon2.verify(user.passwordHash, password)
    : await argon2.verify(
        // Hash factice si user n'existe pas
        // (prend même temps, trompe attaquant)
        await hashPassword('dummy_' + email),
        password
      );

  if (!isValid) {
    // Message générique (ne révèle pas si email existe)
    return res.status(401).json({
      error: 'Email ou password invalide'
    });
  }

  // Login réussi...
});
```

---

## 5. Comparaison / Alternatives

### 5.1 Solutions d'authentification gérées

| Solution | Avantages | Inconvénients | Coût |
|----------|-----------|---------------|------|
| **Auth0** | Complet, SSO, MFA, logs audit | Dépendance externe | $$$-$$$$ |
| **Okta** | Enterprise, SAML, SCIM | Complexe, coûteux | $$$$$  |
| **Firebase** | Simple, scalable, cheap | Moins flexible | $-$$ |
| **Cognito** | AWS natif, economique | Lock-in AWS | $$ |
| **Custom (in-house)** | Contrôle total | Maintenance complexe | Temps/expertise |

### 5.2 Passwordless alternatives

| Méthode | Sécurité | Usabilité | Adoption |
|---------|----------|-----------|----------|
| **TOTP (Authenticator)** | Très haute | Bonne | Haute |
| **WebAuthn/FIDO2** | Exceptionnel | Excellente | Croissante |
| **Email magic link** | Bonne | Excellente | Moyenne |
| **SMS OTP** | Moyenne (SIM swapping) | Bonne | Haute (legacy) |
| **Biometrique** | Très haute | Excellente | Croissante |

---

## 6. Ressources externes (analyse critique)

### 6.1 Ressources officielles

**JWT.io** (https://jwt.io/)
- **Qualité** : Excellente pour décoder/encoder JWT
- **Fiabilité** : Légitime, très utilisé
- **Limitation** : Décodage client seulement (pas signature)
- **Conseil** : Excellent pour vérifier structure JWT

**Auth0 Blog** (https://auth0.com/blog)
- **Qualité** : Très bonne, experts reconnus
- **Limite** : Certains articles promeuvent services Auth0
- **Utilité** : Excellents patterns et best practices

**OAuth 2.0 Specification** (https://tools.ietf.org/html/rfc6749)
- **Qualité** : Exceptionnel, standard officiel
- **Complexité** : Très technique
- **Usage** : Référence pour implémentation OAuth

### 6.2 Outils pratiques

**OWASP Cheat Sheet: Authentication** (https://cheatsheetseries.owasp.org/)
- **Qualité** : Très bonne, patterns éprouvés
- **Fiabilité** : Communauté OWASP réputée
- **Conseil** : Consulter régulièrement

---

## 7. Points clés à retenir

1. **JWT: Stateless, ideal pour APIs** — Pas d'état serveur, scalable
2. **Access tokens courts + Refresh tokens longs** — Compromis sécurité/usabilité
3. **HTTPS obligatoire** — Tokens inutiles sans chiffrement transport
4. **httpOnly cookies pour tokens** — Protection XSS intégrée
5. **SameSite cookies** — Protection CSRF sans tokens CSRF séparés
6. **OAuth 2.0 pour tiers** — Ne jamais partager passwords
7. **Hachage secure obligatoire** — Argon2 ou Bcrypt, jamais MD5/SHA1
8. **MFA recommandé** — TOTP/WebAuthn bien meilleur que SMS
9. **Timing-safe comparisons** — Éviter timing attacks sur hashes
10. **Logging/audit trail** — Tracer connexions, changements sensibles

---

**Date de publication** : Mars 2026
**Prochaine révision** : Septembre 2026
**Mots-clés** : JWT, OAuth, tokens, authentification, sessions, TOTP, MFA
