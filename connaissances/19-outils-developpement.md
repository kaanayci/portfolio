# Outils et Environnement de Développement Web — Fiche Technique N°19

> **Thème** : Écosystème de développement moderne | **Dernière mise à jour** : Mars 2026 | **Niveau** : Intermédiaire

---

## 1. Introduction et contexte

L'efficacité du développeur web moderne dépend directement de la qualité de son environnement. En 2026, les meilleures pratiques incluent :

- **Versioning** : Git avec flux collaboratifs
- **Édition avancée** : VS Code avec extensions intelligentes
- **Gestion des dépendances** : npm/yarn avec audits de sécurité
- **Build automation** : Webpack/Vite/Gulp pour compilation
- **Debugging** : Outils intégrés navigateur
- **Qualité du code** : Linters et formatters obligatoires
- **Tests automatisés** : Jest/Cypress pour couverture
- **Documentation** : README et conventions strictes

Ces outils transforment le développement artisanal en processus industriel, garantissant maintenabilité et collaboration.

---

## 2. Concepts fondamentaux

### 2.1 Architecture du projet moderne

```
projet-web/
├── .git/                    # Dépôt Git
├── .github/
│   └── workflows/           # Actions GitHub (CI/CD)
├── .gitignore              # Fichiers exclus
├── .env.example            # Template variables d'env
├── node_modules/           # Dépendances (à ignorer en versioning)
├── src/
│   ├── index.js            # Entrée application
│   ├── App.jsx
│   ├── components/         # Composants React
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── common/
│   ├── pages/              # Pages routées
│   ├── hooks/              # Hooks personnalisés
│   ├── services/           # API calls
│   ├── utils/              # Utilitaires
│   ├── styles/             # CSS/SCSS
│   └── __tests__/          # Tests unitaires
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── favicon.ico
├── dist/                   # Build production (généré)
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── CONTRIBUTING.md
├── package.json
├── package-lock.json
├── webpack.config.js       # Config build
├── jest.config.js          # Config tests
├── .eslintrc.json          # Config linter
├── .prettierrc              # Config formatter
├── README.md               # Documentation principale
└── CHANGELOG.md            # Historique versions
```

---

## 3. Exemples pratiques

### 3.1 Git et contrôle de version (du cours)

#### Configuration initiale

```bash
# Configuration globale
git config --global user.name "Prénom Nom"
git config --global user.email "email@example.com"
git config --global init.defaultBranch main

# Initialiser un dépôt
git init
git remote add origin https://github.com/username/repo.git

# Clone avec authentification SSH
git clone git@github.com:username/repo.git
```

#### .gitignore (du cours - à personnaliser)

```plaintext
# .gitignore - Node.js et React

# Dépendances
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
package-lock.json
yarn.lock

# Build outputs
dist/
build/
.next/
out/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Environnement
.env
.env.local
.env.*.local

# Logs
logs/
*.log

# Dépendances optionnelles
.optional/

# Cache
.cache/
.eslintcache

# Tests
coverage/
.nyc_output/

# Webpack
.webpack/

# Fichiers temporaires
*.tmp
tmp/
temp/
```

#### Flux de travail Git collaboratif

```bash
# Créer une branche feature
git checkout -b feature/authentification
# ou : git switch -c feature/authentification (syntaxe moderne)

# Modifications locales
git add src/components/LoginForm.jsx
git commit -m "feat: add login form component

- Formulaire validation React Hook Form
- Intégration avec context API
- Styles Tailwind CSS"

# Mettre à jour depuis main
git fetch origin
git rebase origin/main

# Pousser vers remote
git push origin feature/authentification

# Créer une Pull Request sur GitHub
# (via interface web)

# Après review et merge sur GitHub :
git checkout main
git pull origin main
git branch -d feature/authentification
git push origin --delete feature/authentification
```

#### Conventions de commits (Conventional Commits)

```bash
# Format : type(scope): message
# Exemples :

git commit -m "feat(auth): add login component"
git commit -m "fix(api): resolve timeout issue in user service"
git commit -m "docs(readme): update installation instructions"
git commit -m "style(css): format spacing in header component"
git commit -m "refactor(hooks): extract useFormValidation logic"
git commit -m "test(components): add tests for Button component"
git commit -m "perf(bundler): reduce bundle size by 15%"
git commit -m "chore(dependencies): upgrade React to 18.2.0"

# Types acceptés : feat, fix, docs, style, refactor, perf, test, chore
```

### 3.2 VS Code et extensions (du cours)

#### Essentielles pour web moderne

1. **ES7+ React/Redux/React-Native snippets**
   - Snippets rapides pour React
   - `rafce` → composant fonctionnel complet

2. **Tailwind CSS IntelliSense** (du cours)
   - Autocomplétion classes Tailwind
   - Preview des couleurs
   - Valide syntaxe

3. **Markdown Preview Enhanced** (du cours)
   - Preview markdown en temps réel
   - Exports PDF/HTML
   - Support UML/diagrammes

4. **Bootstrap Snippets** (du cours)
   - Composants Bootstrap rapides
   - Utile pour projets legacy

5. **ESLint**
   - Linting intégré éditeur
   - Correction auto avec `--fix`

6. **Prettier**
   - Formatage automatique
   - Cohérence de style

7. **Jest** (ou Vitest)
   - Exécution tests dans l'éditeur
   - Couverture visuelle

8. **Thunder Client** ou **REST Client**
   - Tester APIs directement

9. **GitLens**
   - Historique git visuel
   - Blame par ligne

10. **Docker**
    - Support Docker/docker-compose

#### Configuration VS Code (.vscode/settings.json)

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "editor.rulers": [80, 120],
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.trimAutoWhitespace": true,
  "files.exclude": {
    "node_modules": true,
    ".git": true,
    "dist": true
  },
  "search.exclude": {
    "node_modules": true,
    "dist": true,
    ".git": true
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "javascript.updateImportsOnFileMove.enabled": "always",
  "extensions.ignoreRecommendations": false,
  "workbench.colorTheme": "One Dark Pro",
  "workbench.iconTheme": "Material Icon Theme"
}
```

#### Extensions recommandées (.vscode/extensions.json)

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "PKief.material-icon-theme",
    "zhuangyi.dark-one-pro",
    "eamodio.gitlens",
    "ms-azuretools.vscode-docker",
    "orta.vscode-jest",
    "firsttris.vscode-jest-runner",
    "GitHub.copilot",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

### 3.3 Gestionnaires de paquets

#### npm (Node Package Manager)

```bash
# Initialiser un projet
npm init -y

# Installer dépendances
npm install react react-dom

# Installer comme dev dependency
npm install --save-dev webpack webpack-cli

# Installer version spécifique
npm install react@18.2.0

# Installer globalement
npm install -g vercel

# Mettre à jour dépendances
npm update

# Supprimer une dépendance
npm uninstall react

# Auditer vulnérabilités
npm audit
npm audit fix
npm audit fix --force # À éviter

# Voir dependency tree
npm ls

# Nettoyer cache
npm cache clean --force

# Publier un package (si maintenant package)
npm publish
```

#### yarn (alternative + rapide)

```bash
# Installation
npm install -g yarn

# Commandes principales
yarn init
yarn add react react-dom
yarn add --dev webpack
yarn upgrade
yarn remove react
yarn why react # Voir pourquoi inclus
yarn audit
yarn workspaces # Monorepos

# Performance
yarn install --frozen-lockfile # CI/CD
yarn cache clean
```

#### Package.json - Structure complète

```json
{
  "name": "@mycompany/web-app",
  "version": "1.2.0",
  "description": "Application web moderne avec React",
  "private": true,
  "license": "MIT",
  "author": {
    "name": "Prénom Nom",
    "email": "email@example.com",
    "url": "https://example.com"
  },
  "homepage": "https://github.com/mycompany/web-app",
  "repository": {
    "type": "git",
    "url": "https://github.com/mycompany/web-app"
  },
  "bugs": {
    "url": "https://github.com/mycompany/web-app/issues"
  },
  "main": "src/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist/", "src/", "README.md"],
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "scripts": {
    "start": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src/ --max-warnings 0",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,css,md}\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "type-check": "tsc --noEmit",
    "pre-commit": "lint-staged",
    "audit": "npm audit --production"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@babel/preset-env": "^7.23.0",
    "@babel/preset-react": "^7.23.0",
    "@types/react": "^18.2.0",
    "@types/jest": "^29.5.0",
    "eslint": "^8.54.0",
    "eslint-config-prettier": "^9.1.0",
    "prettier": "^3.1.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  },
  "optionalDependencies": {},
  "overrides": {
    "lodash": "^4.17.21"
  }
}
```

### 3.4 Outils de build

#### Webpack (configuration réelle)

```javascript
// webpack.config.js - Intégration complète

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require('compression-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  mode: isDevelopment ? 'development' : 'production',
  entry: './src/index.jsx',
  devtool: isDevelopment ? 'cheap-module-source-map' : 'source-map',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isDevelopment
      ? '[name].js'
      : '[name].[contenthash:8].js',
    chunkFilename: isDevelopment
      ? '[name].chunk.js'
      : '[name].[contenthash:8].chunk.js',
    assetModuleFilename: 'assets/[name].[hash:8][ext]',
    clean: true,
  },

  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        pathRewrite: {'^/api': ''},
        changeOrigin: true,
      },
    },
  },

  module: {
    rules: [
      // JavaScript/JSX
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {modules: false}],
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              ['@babel/plugin-proposal-decorators', {legacy: true}],
            ],
            cacheDirectory: true,
          },
        },
      },

      // CSS/SCSS
      {
        test: /\.s?css$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: true,
                localIdentName: isDevelopment
                  ? '[path][name]__[local]'
                  : '[hash:base64:8]',
              },
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [['autoprefixer']],
              },
            },
          },
          'sass-loader',
        ],
      },

      // Images
      {
        test: /\.(png|jpg|jpeg|gif|webp)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {maxSize: 8 * 1024},
        },
        generator: {
          filename: 'images/[name].[hash:8][ext]',
        },
      },

      // Fonts
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash:8][ext]',
        },
      },

      // SVG
      {
        test: /\.svg$/,
        oneOf: [
          {
            issuer: /\.[jt]sx?$/,
            resourceQuery: /react/,
            use: ['@svgr/webpack'],
          },
          {
            type: 'asset/resource',
            generator: {
              filename: 'svg/[name].[hash:8][ext]',
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      minify: !isDevelopment && {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),

    !isDevelopment && new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].chunk.css',
    }),

    !isDevelopment && new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,
      minRatio: 0.8,
    }),

    process.env.ANALYZE && new BundleAnalyzerPlugin(),
  ].filter(Boolean),

  optimization: {
    minimize: !isDevelopment,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {ecma: 8},
          compress: {
            drop_console: true,
            pure_funcs: ['console.log'],
          },
          mangle: true,
          output: {comments: false},
        },
        extractComments: false,
      }),
      new CssMinimizerPlugin(),
    ],

    runtimeChunk: {name: 'runtime'},

    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          enforce: true,
          reuseExistingChunk: true,
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
          name: 'common',
        },
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src/'),
      '@components': path.resolve(__dirname, 'src/components/'),
      '@hooks': path.resolve(__dirname, 'src/hooks/'),
      '@utils': path.resolve(__dirname, 'src/utils/'),
      '@services': path.resolve(__dirname, 'src/services/'),
    },
  },

  performance: {
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
    hints: !isDevelopment ? 'warning' : false,
  },

  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '.webpack_cache'),
  },
};
```

#### Vite (alternative moderne + rapide)

```javascript
// vite.config.js - Configuration Vite
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],

  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
        },
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
    },
  },

  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
```

### 3.5 Browser DevTools

#### React DevTools (du cours)

```javascript
// Inspection des composants
// 1. Ouvrir DevTools (F12)
// 2. Onglet "Components"
// 3. Inspecter hierarchie
// 4. Voir props/state en temps réel
// 5. Éditer props/state temporairement pour tester

// Exemple de debug avec profiler
import {Profiler} from 'react';

function onRenderCallback(
  id,      // Identifiant du composant
  phase,   // "mount" ou "update"
  duration // Temps rendu en ms
) {
  console.log(`${id} (${phase}) took ${duration}ms`);
}

export function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <MainComponent />
    </Profiler>
  );
}
```

### 3.6 Linters et formatters

#### ESLint (configuration)

```json
// .eslintrc.json
{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": [
    "react",
    "@typescript-eslint",
    "import",
    "jsx-a11y"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ]
      }
    ],
    "no-console": ["warn", {"allow": ["warn", "error"]}]
  }
}
```

#### Prettier (formatage automatique)

```json
// .prettierrc
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### 3.7 Tests automatisés

#### Jest (tests unitaires)

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|scss)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

// Exemple de test
// src/components/__tests__/Button.test.jsx
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../Button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', {name: /click me/i})).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

#### Cypress (tests E2E)

```javascript
// cypress/e2e/login.cy.js
describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/login');
  });

  it('logs in with valid credentials', () => {
    cy.get('input[name="email"]').type('user@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-greeting"]').should('be.visible');
  });

  it('shows error with invalid credentials', () => {
    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('wrong');
    cy.get('button[type="submit"]').click();

    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Invalid credentials');
  });
});
```

### 3.8 Documentation (README du cours)

```markdown
# Application Web Moderne

## Description
Application web construite avec React 18, Vite et Tailwind CSS.

## Installation

### Prérequis
- Node.js >= 18.0.0
- npm >= 9.0.0 (ou yarn 3.x)

### Étapes
\`\`\`bash
# Cloner le dépôt
git clone https://github.com/username/repo.git
cd repo

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm start

# Accéder à l'application
# http://localhost:3000
\`\`\`

## Build et déploiement

\`\`\`bash
# Build de production
npm run build

# Preview du build
npm run preview

# Déployer sur Vercel
vercel --prod
\`\`\`

## Scripts disponibles

| Commande | Description |
|----------|------------|
| `npm start` | Serveur dev avec HMR |
| `npm run build` | Build production optimisé |
| `npm run lint` | Vérifier code ESLint |
| `npm run lint:fix` | Corriger automatiquement |
| `npm run format` | Formater avec Prettier |
| `npm test` | Exécuter tests Jest |
| `npm run test:coverage` | Coverage report |

## Structure du projet

\`\`\`
src/
├── components/     # Composants réutilisables
├── pages/          # Pages routées
├── hooks/          # Hooks personnalisés
├── services/       # API calls
├── utils/          # Fonctions utilitaires
├── styles/         # CSS global/Tailwind
└── App.jsx         # Composant racine
\`\`\`

## Conventions de code

### Nommage
- Composants: PascalCase (Button.jsx)
- Fichiers utilitaires: camelCase (formatDate.js)
- Constantes: UPPER_SNAKE_CASE

### Imports
\`\`\`javascript
// Librairies
import React from 'react';
import {useNavigate} from 'react-router-dom';

// Composants
import Button from '@components/Button';

// Utils
import {formatDate} from '@utils/formatters';

// Styles
import styles from './Component.module.css';
\`\`\`

### Git Workflow
1. Créer branche : `git checkout -b feature/nom`
2. Commits atomiques avec messages clairs
3. Push et créer Pull Request
4. Code review avant merge

## Tests

\`\`\`bash
# Lancer tous les tests
npm test

# Mode watch
npm test -- --watch

# Coverage report
npm run test:coverage
\`\`\`

## Contribuer

1. Fork le projet
2. Créer feature branch
3. Commit les changements
4. Push vers branch
5. Ouvrir Pull Request

## Licence
MIT - Voir LICENSE pour détails

## Contact
Pour questions: email@example.com
```

### 3.9 Collaboration et partage (conventions du cours)

```bash
# Distribution du code en .zip (du cours)
zip -r projet-final.zip src/ public/ package.json \
  webpack.config.js .gitignore .eslintrc.json \
  -x "*/node_modules/*" "*/dist/*" "*/.git/*"

# Conventions d'archive
# - Inclure: source, config, documentation
# - Exclure: node_modules, dist, .git
# - Fichiers README et CONTRIBUTING obligatoires

# Alternative : Git tags pour versions
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0
```

### 3.10 Lint-Staged (pré-commit hooks)

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "src/**/*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --bail --findRelatedTests"
    ],
    "src/**/*.{css,scss}": ["stylelint --fix", "prettier --write"],
    "*.md": ["prettier --write"]
  }
}
```

---

## 4. Bonnes pratiques

### 4.1 Conventions de nommage

```javascript
// Composants React
function UserProfile() {} // PascalCase
const UserProfile = () => {}; // Fonction fléchée

// Fichiers
UserProfile.jsx // Composants
userService.js // Services
formatDate.js // Utilitaires
useForm.js // Hooks personnalisés

// Variables et fonctions
const userName = 'Alice'; // camelCase
function calculateTotal() {} // camelCase

// Constantes
const API_URL = 'https://api.example.com'; // UPPER_SNAKE_CASE
const MAX_RETRIES = 3;

// Classes privées
class _InternalHelper {} // Préfixe underscore

// Booléens
const isLoading = true; // Préfixe is/has
const hasError = false;
const canEdit = true;
```

### 4.2 Structure de fichiers robuste

```javascript
// Organiser par feature
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.jsx
│   │   │   └── RegisterForm.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── services/
│   │   │   └── authService.js
│   │   ├── store/
│   │   │   └── authStore.js
│   │   └── types.ts
│   ├── dashboard/
│   └── products/
├── shared/
│   ├── components/
│   │   ├── Button.jsx
│   │   └── Layout.jsx
│   ├── hooks/
│   ├── utils/
│   └── types/
```

### 4.3 Environment management

```bash
# .env.example (à commiter)
REACT_APP_API_URL=https://api.example.com
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0

# .env.local (à .gitignore)
REACT_APP_API_URL=http://localhost:5000
REACT_APP_DEBUG=true
```

### 4.4 Performance d'édition

```javascript
// Aliasing court pour imports
// alias '@' pour src/
import Button from '@/components/Button';
import {useAuth} from '@/hooks/useAuth';

// VS
import Button from '../../../components/Button';
```

---

## 5. Comparaison / Alternatives

### Éditeurs de code

| Éditeur | Type | Coût | Caractéristiques |
|---------|------|------|-----------------|
| **VS Code** | IDE léger | Gratuit | Extensions, debugging, Git |
| **WebStorm** | IDE complet | Payant | Très intelligent, features complètes |
| **Sublime** | Éditeur | Payant | Léger et rapide |
| **Vim/Neovim** | Éditeur | Gratuit | Expert-friendly, puissant |
| **Cursor** | AI IDE | Freemium | IA integréé, fork VS Code |

### Gestionnaires de paquets

| Outil | Vitesse | Sécurité | Monorepo |
|-------|---------|----------|----------|
| **npm** | Moyen | Bon | Workspaces |
| **yarn** | Rapide | Excellent | Workspaces |
| **pnpm** | Très rapide | Excellent | Excellent |
| **bun** | Ultra rapide | Bon | En progrès |

---

## 6. Ressources externes (avec analyse critique)

1. **VS Code Docs** (https://code.visualstudio.com/docs)
   - **Analyse critique** : Documentation officielle très complète. Excellente pour setup initial.

2. **Git Documentation** (https://git-scm.com/doc)
   - **Analyse critique** : Bible de Git. Peut être trop complet pour débutants, mais impeccable pour approfondissement.

3. **npm Documentation** (https://docs.npmjs.com/)
   - **Analyse critique** : Référence officielle. À jour et pratique.

4. **Webpack Documentation** (https://webpack.js.org/)
   - **Analyse critique** : Très complet mais complexe. Courbe d'apprentissage raide. Préférer Vite pour débuter.

5. **Jest Testing Library** (https://testing-library.com/)
   - **Analyse critique** : Excellente philosophie ("test user behavior, not implementation"). Standards industrie.

6. **MDN Web Docs** (https://developer.mozilla.org/)
   - **Analyse critique** : Référence web. Toujours fiable et à jour.

---

## 7. Points clés à retenir

✓ **Git est essentiel - maîtriser branches, commits, PR**
✓ **VS Code + extensions = productivité maximale**
✓ **npm/yarn gèrent dépendances - toujours auditer**
✓ **Webpack complexe mais puissant - Vite plus rapide**
✓ **Gulp minification (du cours) obligatoire production**
✓ **ESLint + Prettier = code uniforme**
✓ **Jest + Cypress = confiance déploiement**
✓ **Conventions strictes = maintenance facilitée**
✓ **DevTools React = debug efficace**
✓ **README robuste = onboarding rapide**
✓ **.gitignore node_modules TOUJOURS**
✓ **Secrets (.env) JAMAIS en git**

---

**Dernière révision** : Mars 2026 | **Validé par** : Équipe Web Avancée
