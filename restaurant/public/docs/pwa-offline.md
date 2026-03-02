# PWA & Mode Hors-Ligne (Vite PWA)

## Définition
Une **Progressive Web App (PWA)** est une application web qui peut être installée sur le téléphone ou l'ordinateur de l'utilisateur, comme une application native. Elle fonctionne via un **Service Worker** (script qui tourne en arrière-plan) et un **manifest** (fichier qui décrit l'application). Le Service Worker intercepte les requêtes réseau et peut servir des fichiers depuis le cache, permettant un fonctionnement hors-ligne.

## Contexte d'utilisation
Pour un restaurant, avoir une PWA est stratégique : le client installe l'app sur son téléphone, ce qui crée un raccourci sur l'écran d'accueil. Résultat : il commande plus facilement la prochaine fois, sans passer par un navigateur ou un App Store. Le mode hors-ligne permet aussi de consulter le menu même avec une connexion instable.

## Exemple de code : configuration Vite PWA

Le plugin `vite-plugin-pwa` automatise la génération du Service Worker et du manifest :

```javascript
// vite.config.js
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',  // Le SW se met à jour automatiquement

      workbox: {
        // Exclure le dossier /docs du cache SW
        // (les fiches techniques n'ont pas besoin d'être cachées)
        navigateFallbackDenylist: [/^\/docs/]
      },

      manifest: {
        name: 'Coin Régal',
        short_name: 'Coin Régal',
        description: 'Commandez vos plats préférés chez Coin Régal',
        theme_color: '#0A1E42',       // Couleur de la barre du navigateur
        background_color: '#F5F5F5',  // Fond au lancement
        display: 'standalone',        // Pas de barre d'URL = aspect natif
        orientation: 'portrait',
        icons: [{
          src: 'icon.svg',
          sizes: '192x192 512x512',
          type: 'image/svg+xml',
          purpose: 'any maskable'     // Utilisable comme icône adaptative
        }]
      }
    })
  ]
})
```

**Pourquoi `registerType: 'autoUpdate'` ?** Avec cette option, quand une nouvelle version de l'app est déployée, le Service Worker se met à jour automatiquement sans que l'utilisateur doive vider son cache. C'est essentiel pour un restaurant où le menu peut changer quotidiennement.

## Exemple de code : invite d'installation personnalisée

Le composant `InstallPrompt.vue` intercepte l'événement navigateur `beforeinstallprompt` pour afficher une UI personnalisée plutôt que la bannière par défaut du navigateur :

```javascript
// components/common/InstallPrompt.vue
import { ref, onMounted } from 'vue'

const showInstallPrompt = ref(false)
let deferredPrompt = null  // Stocké en dehors du state Vue (pas réactif)

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()           // Empêcher la mini-bannière par défaut
    deferredPrompt = e           // Stocker l'événement pour plus tard
    showInstallPrompt.value = true  // Afficher notre propre UI
  })
})

const installPWA = async () => {
  if (!deferredPrompt) return

  deferredPrompt.prompt()        // Déclencher le dialogue d'installation natif

  const { outcome } = await deferredPrompt.userChoice
  console.log(`Réponse: ${outcome}`)  // 'accepted' ou 'dismissed'

  deferredPrompt = null          // L'événement ne peut être utilisé qu'une fois
  showInstallPrompt.value = false
}
```

Le template affiche une pop-up animée en bas d'écran avec deux boutons (Installer / Plus tard) :

```html
<div v-if="showInstallPrompt"
     class="fixed bottom-4 left-4 right-4 animate-slide-up">
  <h3>Installer l'application</h3>
  <p>Commandez plus rapidement et hors-ligne !</p>
  <button @click="installPWA">Installer</button>
  <button @click="dismiss">Plus tard</button>
</div>
```

L'animation de slide-up est définie en CSS :

```css
@keyframes slide-up {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

## Fonctionnement technique

Le flux PWA complet est :

1. **Build** : `npm run build` → Vite génère le `manifest.webmanifest` et le `sw.js` (Service Worker) dans `dist/`
2. **Premier chargement** : Le navigateur détecte le manifest et le SW, pré-cache les fichiers de l'app
3. **Événement `beforeinstallprompt`** : Le navigateur signale que l'app est installable → notre composant intercepte et affiche la pop-up
4. **Installation** : L'utilisateur clique "Installer" → raccourci créé sur l'écran d'accueil
5. **Chargements suivants** : Le SW sert les fichiers depuis le cache → chargement quasi-instantané
6. **Mise à jour** : Si de nouveaux fichiers sont déployés, `autoUpdate` remplace le cache automatiquement

## Comparaison avec le Dashboard (Service Worker manuel)

| Aspect | Dashboard (SW manuel) | Restaurant (Vite PWA) |
|--------|----------------------|----------------------|
| Écriture du SW | Manuelle (`sw.js`) | Générée automatiquement |
| Stratégie de cache | Cache-First codé à la main | Workbox (précaching intelligent) |
| Mise à jour | Manuelle | autoUpdate |
| Complexité | Plus élevée mais plus de contrôle | Plus simple, moins flexible |
| Maintenance | Il faut mettre à jour la liste des fichiers à cacher | Automatique au build |

## Pièges à éviter
*   **`beforeinstallprompt` non supporté sur iOS** : Safari ne déclenche pas cet événement. Sur iPhone, l'utilisateur doit passer par "Ajouter à l'écran d'accueil" manuellement. Le composant `InstallPrompt` ne s'affiche donc que sur Android/Chrome.
*   **L'événement est à usage unique** : Après `deferredPrompt.prompt()`, l'événement est consommé. Si l'utilisateur refuse, il faut attendre un nouveau `beforeinstallprompt` (souvent après quelques jours).
*   **Cache agressif** : Si le SW cache tout, une mise à jour du menu ne sera pas visible immédiatement. Le `navigateFallbackDenylist: [/^\/docs/]` exclut les fiches techniques du cache pour cette raison.
*   **HTTPS obligatoire** : Les Service Workers ne fonctionnent qu'en HTTPS (ou localhost). En développement c'est transparent, mais en production il faut un certificat SSL.

## Analyse personnelle
C'est la deuxième PWA que je réalise (après le Dashboard), et la différence d'approche est marquante. Pour le Dashboard, j'avais écrit le Service Worker manuellement — c'était instructif mais laborieux, et chaque ajout de fichier nécessitait de mettre à jour la liste de cache. Avec `vite-plugin-pwa`, tout est automatisé au build. J'ai perdu un peu de contrôle fin mais gagné énormément en productivité et en fiabilité. Le composant `InstallPrompt` personnalisé m'a appris comment intercepter les événements navigateur pour offrir une meilleure UX que le comportement par défaut. C'est typiquement le genre de détail qui fait la différence entre un site web et une vraie application.

## Sources
*   Vite Plugin PWA : [https://vite-pwa-org.netlify.app/](https://vite-pwa-org.netlify.app/)
*   MDN - Progressive Web Apps : [https://developer.mozilla.org/fr/docs/Web/Progressive_web_apps](https://developer.mozilla.org/fr/docs/Web/Progressive_web_apps)
*   web.dev - What are PWAs : [https://web.dev/what-are-pwas/](https://web.dev/what-are-pwas/)
*   MDN - beforeinstallprompt : [https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event)
