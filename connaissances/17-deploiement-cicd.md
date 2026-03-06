# Déploiement et CI/CD — Fiche Technique N°17

> **Thème** : Architecture et orchestration du déploiement logiciel | **Dernière mise à jour** : Mars 2026 | **Niveau** : Avancé

---

## 1. Introduction et contexte

Le déploiement et l'intégration continue/livraison continue (CI/CD) constituent les piliers fondamentaux de la gestion du cycle de vie logiciel moderne. Dans un contexte académique, comprendre ces processus est essentiel pour tout développeur web contemporain.

Le cycle complet s'articule selon les phases : **développement local** → **tests automatisés** → **construction et minification** → **déploiement en production** → **maintenance et monitoring**.

### Importance stratégique

En 2026, les entreprises exigent des cycles de déploiement rapides et fiables. Les méthodes manuelles génèrent :
- Des erreurs humaines (50-70% des incidents de production)
- Des délais importants entre développement et utilisation
- Une fragmentation des environnements (dev ≠ prod)
- Une traçabilité insuffisante des modifications

Les solutions CI/CD automatisent ce processus, garantissant reproductibilité et qualité.

---

## 2. Concepts fondamentaux

### 2.1 Pipeline de déploiement

Un pipeline CI/CD structure le flux de travail en étapes discernables :

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Source Code    Build      Tests    Staging    Production   │
│  (Git Push)     (Webpack)  (Jest)   (Heroku)   (AWS)        │
│      ↓            ↓          ↓         ↓          ↓         │
│  Commit    →   Compile  →  Verify  → Stage   → Deploy      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Étapes de pré-déploiement

#### Minification et Bundling

La minification réduit la taille des ressources statiques (50-60% gain typique).

**Webpack** (configuration réelle utilisée en cours) :

```javascript
// webpack.config.js
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'bundle.[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            pure_funcs: ['console.log', 'console.warn'],
          },
        },
      }),
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: ['@babel/plugin-proposal-class-properties'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
};
```

**Rollup** (alternative plus légère) :

```javascript
// rollup.config.js
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.min.js',
    format: 'iife',
    sourcemap: true,
  },
  plugins: [
    resolve(),
    commonjs(),
    terser({
      compress: {
        drop_console: true,
      },
      output: {
        comments: false,
      },
    }),
  ],
};
```

#### Analyse des dépendances

```bash
# Vérifier les vulnérabilités
npm audit

# Générer un rapport
npm audit --json > audit-report.json

# Mettre à jour automatiquement
npm audit fix

# Vérifier les dépendances orphelines
npm prune
```

**Package.json critique** :

```json
{
  "name": "web-app",
  "version": "1.0.0",
  "main": "dist/bundle.js",
  "scripts": {
    "build": "webpack --mode production",
    "build:analyze": "webpack-bundle-analyzer dist/stats.json",
    "audit": "npm audit --json",
    "predeploy": "npm run build && npm audit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.0",
    "terser-webpack-plugin": "^5.3.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### 2.3 Plateformes de déploiement

| Plateforme | Caractéristiques | Cas d'usage |
|-----------|-----------------|-----------|
| **AWS** | Infrastructure complète, scaling auto, coûts variables | Grands projets, haute performance |
| **Google Cloud** | Services gérés, BigQuery, Firestore | Analytics, données massives |
| **Azure** | Intégration Microsoft, DevOps natives | Écosystème Microsoft |
| **Heroku** | PaaS simplifié, Git integration | Prototypes, petits projets |
| **Vercel** | Optimisée pour Next.js, edge functions | Applications frontend |

---

## 3. Exemples pratiques

### 3.1 Déploiement avec Vercel (CLI)

Vercel offre une intégration directe git et une CLI efficace.

```bash
# Installation
npm install -g vercel

# Connexion
vercel login

# Configuration du projet
vercel --prod

# Déploiement interactif
vercel --env REACT_APP_API_URL=https://api.prod.com --prod

# Historique des déploiements
vercel list

# Variables d'environnement
vercel env add REACT_APP_API_KEY
vercel env pull

# Preview
vercel --env REACT_APP_API_URL=https://api.staging.com
```

**vercel.json** (configuration persistante) :

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "REACT_APP_API_URL": "@api_url_prod",
    "REACT_APP_ENVIRONMENT": "production"
  },
  "regions": ["cdg1", "lhr1"],
  "functions": {
    "api/**/*.js": {
      "memory": 3008,
      "maxDuration": 60
    }
  },
  "redirects": [
    {
      "source": "/api/:path*",
      "destination": "https://api.example.com/:path*"
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 3.2 Pipeline CI/CD avec GitHub Actions

GitHub Actions automatise le déploiement sur chaque push.

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

env:
  NODE_ENV: production
  REGISTRY: ghcr.io

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint code
        run: npm run lint

      - name: Run tests
        run: npm run test:ci

      - name: Check code coverage
        run: npm run coverage

      - name: Build application
        run: npm run build

      - name: Security audit
        run: npm audit --production --exit-on-vuln-count=0

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  deploy-staging:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/staging' && github.event_name == 'push'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Vercel (Staging)
        uses: vercel/action@v3
        with:
          token: ${{ secrets.VERCEL_TOKEN }}
          projectId: ${{ secrets.VERCEL_PROJECT_ID }}
          orgId: ${{ secrets.VERCEL_ORG_ID }}
          scope: ${{ secrets.VERCEL_ORG_SLUG }}
        env:
          VERCEL_ENV: staging

  deploy-production:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Vercel (Production)
        uses: vercel/action@v3
        with:
          token: ${{ secrets.VERCEL_TOKEN }}
          projectId: ${{ secrets.VERCEL_PROJECT_ID }}
          orgId: ${{ secrets.VERCEL_ORG_ID }}
          scope: ${{ secrets.VERCEL_ORG_SLUG }}
          prod: true
        env:
          VERCEL_ENV: production

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Déploiement production réussi'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()

  health-check:
    needs: deploy-production
    runs-on: ubuntu-latest

    steps:
      - name: Health check endpoint
        run: |
          curl -f https://api.example.com/health || exit 1
        with:
          max_attempts: 5
          timeout_minutes: 5
          retry_wait_seconds: 30
```

### 3.3 Stratégies de migration de base de données

#### Flyway (approche SQL)

```sql
-- db/migration/V1__init.sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- db/migration/V2__add_auth_fields.sql
ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN last_login TIMESTAMP;

-- db/migration/V3__create_sessions.sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
```

**Configuration Flyway** :

```xml
<!-- pom.xml -->
<plugin>
  <groupId>org.flywaydb</groupId>
  <artifactId>flyway-maven-plugin</artifactId>
  <version>9.22.0</version>
  <configuration>
    <url>jdbc:postgresql://localhost:5432/mydb</url>
    <user>postgres</user>
    <password>${db.password}</password>
    <locations>filesystem:db/migration</locations>
    <outOfOrder>false</outOfOrder>
  </configuration>
</plugin>
```

#### Liquibase (approche declarative)

```xml
<!-- db/changelog/master.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

    <changeSet id="1" author="dev">
        <createTable tableName="users">
            <column name="id" type="BIGINT" autoIncrement="true">
                <constraints primaryKey="true"/>
            </column>
            <column name="email" type="VARCHAR(255)">
                <constraints nullable="false" unique="true"/>
            </column>
            <column name="created_at" type="TIMESTAMP" defaultValueDate="CURRENT_TIMESTAMP"/>
        </createTable>
        <createIndex tableName="users" indexName="idx_users_email">
            <column name="email"/>
        </createIndex>
    </changeSet>

    <changeSet id="2" author="dev">
        <addColumn tableName="users">
            <column name="password_hash" type="VARCHAR(255)"/>
            <column name="last_login" type="TIMESTAMP"/>
        </addColumn>
    </changeSet>
</databaseChangeLog>
```

### 3.4 Stratégies de sauvegarde

```bash
#!/bin/bash
# backup-strategy.sh

# Configuration
DB_NAME="production_db"
BACKUP_DIR="/backups/daily"
AWS_S3_BUCKET="backups-prod"
RETENTION_DAYS=30

# 1. Sauvegarde locale complète (quotidienne)
pg_dump \
  --host=prod-db.internal \
  --username=backup_user \
  --format=custom \
  --verbose \
  --compress=9 \
  --file="${BACKUP_DIR}/${DB_NAME}_$(date +%Y%m%d_%H%M%S).dump" \
  $DB_NAME

# 2. Sauvegarde incrémentale (horaire avec WAL)
pg_basebackup \
  --pgdata=/var/lib/postgresql/backup_incremental \
  --format=tar \
  --gzip \
  --wal-method=stream \
  --label="incremental_$(date +%Y%m%d_%H%M%S)"

# 3. Upload AWS S3 (versioning activé)
aws s3 cp "$BACKUP_DIR"/*.dump \
  s3://${AWS_S3_BUCKET}/daily/ \
  --sse=AES256 \
  --storage-class=GLACIER_IR

# 4. Nettoyage des anciennes sauvegardes
find "$BACKUP_DIR" -type f -mtime +${RETENTION_DAYS} -delete

# 5. Vérification d'intégrité
pg_verify_checksums \
  --pgdata=/var/lib/postgresql/data

# 6. Test de restauration (environnement de test)
pg_restore \
  --dbname=test_restore \
  "${BACKUP_DIR}"/latest_backup.dump

echo "Backup process completed at $(date)" >> /var/log/backup.log
```

---

## 4. Bonnes pratiques

### 4.1 Infrastructure as Code (IaC)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  web:
    image: app:${BUILD_TAG}
    container_name: app-web-prod
    restart: always
    environment:
      NODE_ENV: production
      LOG_LEVEL: info
      DB_URL: postgresql://${DB_USER}:${DB_PASS}@db:5432/prod
    ports:
      - "3000:3000"
    depends_on:
      - db
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - backend
    secrets:
      - api_key

  db:
    image: postgres:16-alpine
    container_name: app-db-prod
    restart: always
    environment:
      POSTGRES_DB: prod
      POSTGRES_USER_FILE: /run/secrets/db_user
      POSTGRES_PASSWORD_FILE: /run/secrets/db_pass
    volumes:
      - db_data:/var/lib/postgresql/data
      - ./migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    networks:
      - backend
    secrets:
      - db_user
      - db_pass

  redis:
    image: redis:7-alpine
    container_name: app-redis-prod
    restart: always
    command: redis-server --appendonly yes --appendfsync everysec
    volumes:
      - redis_data:/data
    networks:
      - backend

volumes:
  db_data:
    driver: local
  redis_data:
    driver: local

networks:
  backend:
    driver: bridge

secrets:
  db_user:
    file: ./secrets/db_user.txt
  db_pass:
    file: ./secrets/db_pass.txt
  api_key:
    file: ./secrets/api_key.txt
```

### 4.2 Monitorisation post-déploiement

```javascript
// monitoring-setup.js - Intégration Datadog/Prometheus

const StatsD = require('node-statsd').StatsD;
const prometheus = require('prom-client');

// Datadog
const dogstatsd = new StatsD({
  host: process.env.DD_AGENT_HOST || 'localhost',
  port: 8125,
  tags: ['env:prod', 'app:web'],
});

// Prometheus
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 5, 15, 50, 100, 500],
});

const dbConnectionPool = new prometheus.Gauge({
  name: 'db_connection_pool_size',
  help: 'Current size of database connection pool',
  labelNames: ['pool_name'],
});

// Middleware
express.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);

    dogstatsd.timing('http.request.duration', duration, {
      method: req.method,
      status: res.statusCode,
    });
  });

  next();
});
```

### 4.3 Rollback strategy

```bash
#!/bin/bash
# rollback.sh

CURRENT_VERSION=$(git describe --tags)
PREVIOUS_VERSION=$(git describe --tags --abbrev=0 $(git rev-list --tags --skip=1 --max-count=1))

echo "Rollback: $CURRENT_VERSION → $PREVIOUS_VERSION"

# Récupérer la version précédente
git checkout $PREVIOUS_VERSION

# Redéployer
vercel --prod

# Notification
curl -X POST https://slack.com/api/chat.postMessage \
  -H 'Content-Type: application/json' \
  -d "{
    \"channel\": \"#deployments\",
    \"text\": \"⚠️ Rollback executed: $CURRENT_VERSION → $PREVIOUS_VERSION\"
  }"
```

---

## 5. Comparaison / Alternatives

### Outils de déploiement

```markdown
| Critère | Vercel | Netlify | GitHub Pages | AWS Amplify |
|---------|--------|---------|--------------|-------------|
| Prix | Free + pay-as-you-go | Freemium | Gratuit | Freemium |
| Scaling | Auto | Auto | Statique | Manuelle |
| CI/CD | Natif Git | Natif Git | Actions | Natif |
| Serverless | Oui | Oui | Non | Oui |
| Région | Globale | Globale | US | Globale |
| Support | Premium | Premium | Community | Enterprise |
```

### Outils CI/CD

- **GitHub Actions** : Intégration GitHub, YAML simple, gratuit
- **GitLab CI** : YAML avancé, registre Docker intégré
- **Jenkins** : Auto-hébergé, très flexible, complexe
- **CircleCI** : Cloud, interface intuitive, payant
- **Travis CI** : Historique, maintenant lancé dans Kolide

---

## 6. Ressources externes (avec analyse critique)

### Ressources académiques et industrielles

1. **The Twelve-Factor App** (https://12factor.net/)
   - **Analyse critique** : Fondamental pour comprendre les principes de déploiement moderne. Méthodologie éprouvée depuis 2012, toujours pertinente. Recommandé pour tout projet sérieux.

2. **Google Cloud Architecture Framework** (https://cloud.google.com/architecture)
   - **Analyse critique** : Documentation technique de haut niveau, cas d'études réels. Bias vers Google Cloud mais principes applicables universellement.

3. **AWS Well-Architected Framework** (https://aws.amazon.com/well-architected/)
   - **Analyse critique** : Excellent pour les principes de fiabilité et sécurité. Très axé AWS, nécessite traduction pour autres clouds.

4. **CNCF CI/CD Whitepaper** (https://www.cncf.io/blog/2022/03/15/best-practices-and-tooling-for-ci-cd/)
   - **Analyse critique** : Très complet, couvre DevOps modernes. Parfois trop technique pour débutants, excellent pour projet universitaire avancé.

---

## 7. Points clés à retenir

✓ **Le pipeline CI/CD automatise l'ensemble du cycle déploiement**
✓ **Minification (Webpack/Rollup) réduit taille de 50-60%**
✓ **GitHub Actions permet CI/CD gratuit et intégré**
✓ **Vercel CLI simplifie déploiement frontend**
✓ **Flyway/Liquibase gèrent migrations DB de manière versionnable**
✓ **Stratégies de backup redondantes (local + cloud) sont essentielles**
✓ **IaC (Docker Compose) garantit reproductibilité d'environnement**
✓ **Monitoring post-déploiement (Datadog/Prometheus) est critique**
✓ **Stratégies rollback doivent être testées régulièrement**
✓ **Secrets (clés API, mots de passe) ne doivent JAMAIS être en source control**

---

**Dernière révision** : Mars 2026 | **Validé par** : Équipe Web Avancée
