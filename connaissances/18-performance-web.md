# Optimisation des Performances Web — Fiche Technique N°18

> **Thème** : Métriques, profiling et stratégies d'optimisation frontend | **Dernière mise à jour** : Mars 2026 | **Niveau** : Avancé

---

## 1. Introduction et contexte

La performance web n'est plus un luxe mais une nécessité commerciale. En 2026, les études montrent que :
- Chaque **100ms de délai** = -1% de conversion
- 50% des utilisateurs abandonnent après **3 secondes**
- La performance affecte directement le **classement SEO** (Core Web Vitals)
- Les utilisateurs mobiles sont 2x plus sensibles aux délais

Optimiser les performances web nécessite une approche multidisciplinaire : métriques pertinentes, profiling précis, et stratégies d'optimisation basées sur les données.

---

## 2. Concepts fondamentaux

### 2.1 Core Web Vitals (CWV) — Métriques essentielles

Google a défini trois métriques essentielles pour évaluer l'expérience utilisateur.

#### Largest Contentful Paint (LCP)

**Définition** : Temps d'affichage du plus grand élément visuel dans le viewport.

**Seuil** :
- ✅ Bon : < 2,5 secondes
- ⚠️ Acceptable : 2,5 - 4,0 secondes
- ❌ Mauvais : > 4,0 secondes

**Optimisations** :
```javascript
// observer-lcp.js
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('LCP:', entry.renderTime || entry.loadTime);
    console.log('LCP Element:', entry.element);

    // Signaler si LCP > 2.5s
    if (entry.renderTime > 2500) {
      reportMetric('lcp_slow', entry.renderTime);
    }
  }
});

observer.observe({entryTypes: ['largest-contentful-paint']});
```

#### Interaction to Next Paint (INP) / First Input Delay (FID)

**Définition** : Délai entre une interaction utilisateur et la réponse du navigateur.

**Seuil** :
- ✅ Bon : < 200 ms
- ⚠️ Acceptable : 200 - 500 ms
- ❌ Mauvais : > 500 ms

```javascript
// observe-inp.js
const observer = new PerformanceObserver((list) => {
  let maxDuration = 0;

  for (const entry of list.getEntries()) {
    if (entry.duration > maxDuration) {
      maxDuration = entry.duration;
      console.log('INP:', entry.duration, 'Type:', entry.name);
      console.log('Interaction:', {
        type: entry.interactionType,
        target: entry.target?.textContent || entry.target?.id,
      });
    }
  }
});

observer.observe({type: 'first-input'});
observer.observe({entryTypes: ['interaction']});
```

#### Cumulative Layout Shift (CLS)

**Définition** : Instabilité visuelle - mouvement non prévu d'éléments.

**Seuil** :
- ✅ Bon : < 0,1
- ⚠️ Acceptable : 0,1 - 0,25
- ❌ Mauvais : > 0,25

```javascript
// observe-cls.js
let clsValue = 0;

const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) { // Ignorer les shifts causés par input utilisateur
      clsValue += entry.value;
      console.log('CLS:', clsValue);

      console.log('Shifted element:', {
        element: entry.sources[0]?.node?.tagName,
        previousRect: entry.sources[0]?.previousRect,
        currentRect: entry.sources[0]?.currentRect,
      });
    }
  }
});

observer.observe({entryTypes: ['layout-shift']});
```

### 2.2 Profiling et benchmarking

#### Google Lighthouse (intégré Chrome DevTools)

```javascript
// lighthouse-ci.js - Automatiser les tests de performance
const chromeLauncher = require('chrome-launcher');
const lighthouse = require('lighthouse');
const reportGenerator = require('lighthouse/lighthouse-cli/report-generator');

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});

  const options = {
    logLevel: 'info',
    output: 'json',
    port: chrome.port,
  };

  const runnerResult = await lighthouse(url, options);

  const report = reportGenerator.generateReport(
    runnerResult.lhr,
    'html'
  );

  console.log('Lighthouse Results:', {
    performance: runnerResult.lhr.categories.performance.score * 100,
    accessibility: runnerResult.lhr.categories.accessibility.score * 100,
    bestPractices: runnerResult.lhr.categories['best-practices'].score * 100,
    seo: runnerResult.lhr.categories.seo.score * 100,
    pwa: runnerResult.lhr.categories.pwa?.score * 100,
  });

  // Analyse détaillée des opportunités
  runnerResult.lhr.opportunities.forEach((audit) => {
    if (audit.score < 1) {
      console.log(`⚠️ ${audit.title}: économies potentielles ${audit.numericValue}ms`);
    }
  });

  await chrome.kill();
  return runnerResult.lhr;
}

// Utilisation
runLighthouse('https://example.com');
```

#### WebPageTest.org (analyse détaillée)

```bash
# CLI WebPageTest
wpt test https://example.com \
  --location "US East" \
  --device "Mobile" \
  --runs 3 \
  --json

# Analyse de filmstrip (image par image)
wpt test https://example.com \
  --filmstrip \
  --video

# Tester connection throttling
wpt test https://example.com \
  --bandwidth="slow-4g" \
  --latency=400 \
  --packet_loss=5
```

---

## 3. Exemples pratiques

### 3.1 Stratégies de caching

#### HTTP Cache Headers

```javascript
// cache-headers.js - Configuration Express.js
const express = require('express');
const app = express();

// Middleware de caching personnalisé
app.use((req, res, next) => {
  // Ressources statiques (1 an avec hash dans le nom)
  if (/\.(js|css|woff2|png|jpg|webp)$/.test(req.path)) {
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.set('ETag', `"${crypto.createHash('md5').update(req.path).digest('hex')}"`);
  }
  // Documents HTML (validation à chaque requête)
  else if (/\.html$/.test(req.path) || req.path === '/') {
    res.set('Cache-Control', 'public, max-age=0, must-revalidate');
    res.set('ETag', `"${Date.now()}"`);
  }
  // API (pas de cache côté client)
  else if (req.path.startsWith('/api/')) {
    res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
  }
  // Contenus générés (révalidation quotidienne)
  else {
    res.set('Cache-Control', 'public, max-age=86400, s-maxage=604800');
  }

  next();
});

// Compression
const compression = require('compression');
app.use(compression());

// Conditionals (If-None-Match, If-Modified-Since)
app.use(require('conditional-get')());
app.use(require('etag')());

app.listen(3000);
```

#### Redis (cache applicatif)

```javascript
// redis-cache-strategy.js
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  db: process.env.REDIS_DB || 0,
});

class CacheManager {
  constructor() {
    this.ttlConfig = {
      'user:profile': 3600,        // 1h
      'product:details': 7200,      // 2h
      'search:results': 300,        // 5m
      'auth:session': 86400,        // 1 jour
    };
  }

  async get(key) {
    try {
      const cached = await client.get(key);
      if (cached) {
        console.log(`Cache hit: ${key}`);
        return JSON.parse(cached);
      }
    } catch (err) {
      console.error(`Cache error for ${key}:`, err);
    }
    return null;
  }

  async set(key, value, ttl = null) {
    try {
      const actualTtl = ttl || this.ttlConfig[key] || 3600;
      await client.setex(
        key,
        actualTtl,
        JSON.stringify(value)
      );
    } catch (err) {
      console.error(`Cache set error for ${key}:`, err);
    }
  }

  async invalidate(pattern) {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
      console.log(`Invalidated ${keys.length} cache entries: ${pattern}`);
    }
  }

  // Stratégie Cache-Aside
  async getOrFetch(key, fetchFn, ttl = null) {
    const cached = await this.get(key);
    if (cached) return cached;

    const data = await fetchFn();
    await this.set(key, data, ttl);
    return data;
  }

  // Stratégie Write-Through
  async setAndCache(key, value, saveFn, ttl = null) {
    await saveFn(value);
    await this.set(key, value, ttl);
  }
}

// Utilisation dans Express
const cache = new CacheManager();

app.get('/api/users/:id', async (req, res) => {
  const data = await cache.getOrFetch(
    `user:profile:${req.params.id}`,
    () => db.users.findById(req.params.id),
    3600
  );
  res.json(data);
});
```

#### Memcached (cache distribué)

```javascript
// memcached-setup.js
const Memcached = require('memcached');

const memcached = new Memcached(
  ['localhost:11211', 'localhost:11212', 'localhost:11213'],
  {
    poolSize: 10,
    timeout: 100,
    retries: 2,
    retry: 30000,
    keyPrefix: 'app:',
  }
);

// Wrapper avec fallback
async function getCachedOrFetch(key, fetchFn, ttl = 3600) {
  try {
    const cached = await memcached.get(key);
    if (cached) {
      console.log(`Memcached hit: ${key}`);
      return cached;
    }
  } catch (err) {
    console.warn(`Memcached error: ${err.message}`);
  }

  const data = await fetchFn();

  try {
    await memcached.set(key, data, ttl);
  } catch (err) {
    console.warn(`Failed to cache ${key}: ${err.message}`);
  }

  return data;
}
```

### 3.2 CDN et distribution de contenu

#### Cloudflare (configuration DNS et caching)

```bash
# Commandes Cloudflare API
ZONE_ID="your-zone-id"
API_TOKEN="your-api-token"

# Activer caching agressif
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/cache_level" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value":"cache_everything"}'

# Configurer TTL
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/browser_cache_ttl" \
  -H "Authorization: Bearer $API_TOKEN" \
  -d '{"value":14400}' # 4 heures

# Règles de cache personnalisées
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/cache_rules" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rules": [
      {
        "expression": "(cf.cache_status eq \"HIT\")",
        "action": "set_cache_settings",
        "settings": {
          "cache": true,
          "cache_ttl": 31536000
        }
      }
    ]
  }'

# Purger le cache
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $API_TOKEN" \
  -d '{"files":["https://example.com/style.css"]}'
```

#### AWS CloudFront (distribution globale)

```javascript
// cloudfront-distribution.js
const AWS = require('aws-sdk');
const cloudfront = new AWS.CloudFront();

const distributionConfig = {
  CallerReference: `dist-${Date.now()}`,
  DefaultCacheBehavior: {
    TargetOriginId: 'myOrigin',
    ViewerProtocolPolicy: 'redirect-to-https',
    AllowedMethods: ['GET', 'HEAD', 'OPTIONS'],
    CachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6', // Managed-CachingOptimized
    Compress: true,
    FunctionAssociations: {
      Items: [
        {
          FunctionARN: 'arn:aws:cloudfront::123456789012:function/url-rewrite',
          EventType: 'viewer-request',
          IncludeBody: false,
        },
      ],
    },
  },
  Origins: {
    Quantity: 1,
    Items: [
      {
        Id: 'myOrigin',
        DomainName: 'example.com',
        CustomOriginConfig: {
          HTTPPort: 80,
          OriginProtocolPolicy: 'https-only',
          OriginSSLProtocols: {
            Quantity: 1,
            Items: ['TLSv1.2'],
          },
        },
      },
    ],
  },
  Enabled: true,
  Comment: 'Production distribution',
};

// Créer la distribution
cloudfront.createDistribution({DistributionConfig: distributionConfig}, (err, data) => {
  if (err) console.error(err);
  else console.log('CloudFront Distribution ID:', data.Distribution.Id);
});
```

### 3.3 Optimisation des images

#### Lazy loading et formats modernes

```html
<!-- lazy-loading.html -->
<picture>
  <!-- WebP pour navigateurs modernes -->
  <source
    srcset="image-small.webp 480w, image-large.webp 1200w"
    sizes="(max-width: 600px) 100vw, 50vw"
    type="image/webp"
  >
  <!-- Fallback JPEG -->
  <source
    srcset="image-small.jpg 480w, image-large.jpg 1200w"
    sizes="(max-width: 600px) 100vw, 50vw"
    type="image/jpeg"
  >
  <!-- Fallback ultime -->
  <img
    src="image.jpg"
    alt="Descriptif"
    loading="lazy"
    decoding="async"
    width="800"
    height="600"
  >
</picture>

<script>
// Polyfill pour navigateurs anciens
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.add('fade-in');
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px',
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}
</script>
```

**ImageMagick - Conversion batch**:

```bash
#!/bin/bash
# convert-images.sh

for image in src/images/*.{jpg,png}; do
  [ -f "$image" ] || continue

  filename=$(basename "$image")
  base="${filename%.*}"

  # Convertir en WebP (80% compression)
  cwebp -q 80 "$image" -o "dist/images/${base}.webp"

  # Générer thumbnails responsive
  convert "$image" \
    -auto-orient \
    -strip \
    -interlace Plane \
    -quality 85 \
    -resize 480x480 \
    "dist/images/${base}-small.jpg"

  convert "$image" \
    -auto-orient \
    -strip \
    -interlace Plane \
    -quality 80 \
    -resize 1200x1200 \
    "dist/images/${base}-large.jpg"

  echo "✓ Processed $filename"
done
```

### 3.4 Code splitting et tree shaking

#### Dynamic imports avec Webpack

```javascript
// routes.js
export const routes = [
  {
    path: '/',
    component: () => import('./pages/Home.jsx'),
    exact: true,
  },
  {
    path: '/dashboard',
    component: () => import('./pages/Dashboard.jsx'),
    requiredAuth: true,
  },
  {
    path: '/admin',
    component: () => import('./pages/Admin.jsx'),
    requiredRole: 'admin',
  },
];

// LazyRoute wrapper
import React, { Suspense } from 'react';

function LazyRoute({ component: Component, ...props }) {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <Component {...props} />
    </Suspense>
  );
}

export default LazyRoute;
```

#### Tree shaking configuration

```javascript
// webpack.config.js
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true,
    sideEffects: false, // Activer tree shaking
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          enforce: true,
          chunks: 'all',
          // Utiliser les exports ES6 des vendors
          sideEffects: false,
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {modules: false}], // Garder ES6 modules
              '@babel/preset-react',
            ],
            plugins: [
              '@babel/plugin-syntax-dynamic-import',
            ],
          },
        },
      },
    ],
  },
};
```

### 3.5 Minification avec Gulp (du cours)

```javascript
// gulpfile.js - Pipeline minification complet
const gulp = require('gulp');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass')(require('sass'));
const terser = require('gulp-terser');
const htmlmin = require('gulp-htmlmin');

// Minifier et concaténer JavaScript
gulp.task('minify-js', () => {
  return gulp
    .src(['src/js/**/*.js', '!src/js/vendor/**'])
    .pipe(sourcemaps.init())
    .pipe(terser({
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      mangle: true,
      output: {
        comments: false,
      },
    }))
    .pipe(concat('app.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/js'));
});

// Minifier CSS
gulp.task('minify-css', () => {
  return gulp
    .src('src/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(cleanCSS({
      compatibility: 'ie8',
      level: {
        1: { specialComments: false },
      },
    }))
    .pipe(concat('style.min.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/css'));
});

// Optimiser images
gulp.task('minify-images', () => {
  return gulp
    .src('src/images/**/*')
    .pipe(imagemin([
      imagemin.mozjpeg({ quality: 85, progressive: true }),
      imagemin.optipng({ optimizationLevel: 3 }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: false },
          { cleanupIDs: false },
        ],
      }),
    ]))
    .pipe(gulp.dest('dist/images'));
});

// Minifier HTML
gulp.task('minify-html', () => {
  return gulp
    .src('src/**/*.html')
    .pipe(htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      conservativeCollapse: true,
      minifyCSS: true,
      minifyJS: true,
    }))
    .pipe(gulp.dest('dist'));
});

// Tâche globale
gulp.task('build', gulp.series(
  'minify-js',
  'minify-css',
  'minify-images',
  'minify-html'
));

gulp.task('watch', () => {
  gulp.watch('src/js/**/*.js', gulp.series('minify-js'));
  gulp.watch('src/scss/**/*.scss', gulp.series('minify-css'));
  gulp.watch('src/images/**/*', gulp.series('minify-images'));
  gulp.watch('src/**/*.html', gulp.series('minify-html'));
});

gulp.task('default', gulp.series('build', 'watch'));
```

---

## 4. Bonnes pratiques

### 4.1 Monitoring continu

```javascript
// monitoring-setup.js - Intégration monitoring
const axios = require('axios');

class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.thresholds = {
      lcp: 2500,
      inp: 200,
      cls: 0.1,
      ttfb: 600,
    };
  }

  // Envoyer les CWV à un service de monitoring
  reportMetrics() {
    if (!navigator.sendBeacon) return;

    const webVitals = {
      lcp: this.metrics.lcp,
      inp: this.metrics.inp,
      cls: this.metrics.cls,
      ttfb: this.metrics.ttfb,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    const endpoint = process.env.REACT_APP_ANALYTICS_URL;

    navigator.sendBeacon(
      endpoint,
      JSON.stringify(webVitals)
    );
  }

  // Alerter si dépassement
  checkThresholds() {
    Object.entries(this.metrics).forEach(([metric, value]) => {
      if (value > this.thresholds[metric]) {
        console.warn(`⚠️ ${metric.toUpperCase()} degraded: ${value}ms`);
        this.reportAnomaly(metric, value);
      }
    });
  }

  async reportAnomaly(metric, value) {
    try {
      await axios.post('/api/anomalies', {
        metric,
        value,
        url: window.location.href,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('Failed to report anomaly:', err);
    }
  }
}
```

### 4.2 Bundle analysis

```bash
# Analyser la taille du bundle
webpack-bundle-analyzer dist/stats.json

# Générer stats JSON
webpack --mode production --profile --json > dist/stats.json

# Résultats utiles
# - Modules les plus gros
# - Dépendances non utilisées
# - Opportunités de code splitting
```

### 4.3 Progressive Web App (PWA)

```javascript
// service-worker.js
const CACHE_NAME = 'app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.min.css',
  '/app.min.js',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Strategy: Cache First, Network Fallback
  if (event.request.destination === 'style' ||
      event.request.destination === 'script') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
  // Strategy: Network First, Cache Fallback (API)
  else if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200) return response;
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
```

---

## 5. Comparaison / Alternatives

### Outils de monitoring

```markdown
| Outil | Type | Coût | Cas d'usage |
|-------|------|------|-----------|
| **Google Analytics** | Web | Gratuit | Comportement utilisateurs |
| **Datadog** | APM | Payant | Monitoring infra complète |
| **New Relic** | APM | Payant | Performance synthétique |
| **Prometheus** | Métriques | Gratuit | Auto-hébergé |
| **Grafana** | Visualisation | Gratuit | Dashboards personnalisés |
| **Sentry** | Erreurs | Freemium | Stack traces et debugging |
```

---

## 6. Ressources externes (avec analyse critique)

1. **Web.dev Vitals** (https://web.dev/vitals/)
   - **Analyse critique** : Référence officielle Google sur les CWV. Excellentes explications, exemples pratiques. RECOMMANDÉ pour démarrer.

2. **MDN Web Performance** (https://developer.mozilla.org/en-US/docs/Web/Performance/)
   - **Analyse critique** : Couverture très complète des APIs et concepts. Profondeur académique. Indispensable pour l'approfondissement.

3. **High Performance Browser Networking** (O'Reilly)
   - **Analyse critique** : Livre classique mais partiellement datée (2013). Les principes restent valides, mais protocoles HTTP/2 et HTTP/3 ont changé.

4. **Web Vitals Library** (https://github.com/GoogleChromeLabs/web-vitals)
   - **Analyse critique** : Implémentation officielle des CWV. Code bien maintenu, excellente base pour monitoring personnalisé.

5. **Prometheus Documentation** (https://prometheus.io/)
   - **Analyse critique** : Excellent pour auto-hébergement. Steeper learning curve. À préférer à des solutions cloud si contrôle total requis.

---

## 7. Points clés à retenir

✓ **LCP < 2.5s, INP < 200ms, CLS < 0.1 = scores de base**
✓ **Lighthouse identifie rapidement les problèmes critiques**
✓ **Redis/Memcached réduisent latence de 50-80%**
✓ **CDN global (Cloudflare/CloudFront) essentiel pour contenu static**
✓ **Lazy loading images peut économiser 30-50% de la bande passante**
✓ **Code splitting réduit bundle initial de 40-60%**
✓ **Tree shaking élimine 15-30% de code mort**
✓ **Gulp minification (du cours) indispensable pour production**
✓ **Service Workers activent mode offline et performances**
✓ **Monitoring continu révèle dégradations en temps réel**

---

**Dernière révision** : Mars 2026 | **Validé par** : Équipe Web Avancée
