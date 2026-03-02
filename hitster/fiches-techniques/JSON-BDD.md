# Utilisation d'un fichier JSON comme base de données locale

## Définition
JSON (JavaScript Object Notation) est un format d'échange de données léger, lisible par l'humain et nativement supporté par JavaScript. Dans un contexte front-end sans backend, un fichier JSON statique peut servir de **base de données locale** : les données sont séparées du code, structurées de manière standardisée et chargées à la demande via `fetch()`.

## Contexte d'utilisation
Le JSON comme « base de données » est pertinent quand :
- **Pas de backend** : Projets front-end uniquement (portfolio, prototypes, jeux)
- **Données semi-statiques** : Contenu qui change rarement (catalogue, playlist, FAQ)
- **Séparation données/logique** : Permettre à un non-développeur de modifier les données
- **Prototypage** : Simuler une API REST avant que le backend soit prêt

### Alternatives et limites

| Solution | Lecture | Écriture | Persistance | Complexité |
|---|---|---|---|---|
| **JSON statique** | `fetch()` | Impossible (fichier statique) | Aucune | Très faible |
| **localStorage** | `getItem()` | `setItem()` | Navigateur uniquement | Faible |
| **IndexedDB** | API async | API async | Navigateur (volumineuse) | Moyenne |
| **API REST + BDD** | `fetch()` | `fetch(POST)` | Serveur (permanente) | Élevée |

Dans Hitster, le JSON statique suffit car les données (chansons) ne sont pas modifiées par l'utilisateur. Le `localStorage` est utilisé en complément pour les données mutables (score, état de la partie).

## Implémentation dans le projet

### Structure du fichier `songs.json`

```json
[
  {
    "title": "Bohemian Rhapsody",
    "artist": "Queen",
    "year": 1975,
    "audio": "https://p.scdn.co/mp3-preview/abc123...",
    "image": "https://i.scdn.co/image/xyz789..."
  },
  {
    "title": "Smells Like Teen Spirit",
    "artist": "Nirvana",
    "year": 1991,
    "audio": "https://p.scdn.co/mp3-preview/def456...",
    "image": "https://i.scdn.co/image/uvw321..."
  }
]
```

> **Convention** : Chaque objet a exactement les mêmes propriétés (title, artist, year, audio, image). C'est l'équivalent d'un schéma de table dans une base de données relationnelle.

### Chargement asynchrone avec `fetch()`

```javascript
async function loadSongs() {
  try {
    // Le cache-buster ?v=Date.now() force le navigateur à recharger le fichier
    // au lieu d'utiliser la version en cache (utile pendant le développement)
    const res = await fetch(`assets/data/songs.json?v=${Date.now()}`);
    songs = shuffle(await res.json());
  } catch (e) {
    console.warn("Impossible de charger songs.json", e);
    songs = []; // Fallback : tableau vide plutôt que crash
  }
}
```

**Décomposition du flux :**
1. `fetch()` envoie une requête HTTP GET vers le fichier JSON
2. `await` attend que la réponse arrive (opération asynchrone)
3. `res.json()` parse le corps de la réponse en objet JavaScript (aussi asynchrone)
4. `shuffle()` mélange le tableau pour chaque nouvelle partie
5. Le `try/catch` gère les erreurs réseau (fichier introuvable, offline, JSON malformé)

> **Pourquoi `async/await` plutôt que `.then()` ?** Les deux fonctionnent, mais `async/await` rend le flux linéaire et plus lisible. `.then().then().catch()` crée une « chaîne de promesses » qui devient vite difficile à suivre avec des conditions.

### Validation implicite

Le code fait confiance à la structure du JSON. Si une propriété est absente, cela peut causer des bugs silencieux :

```javascript
// Dans checkPlacement : si card.year est undefined, la comparaison échoue
const isCorrect = (!left || currentCard.year >= left.year)
               && (!right || currentCard.year <= right.year);
```

Une amélioration serait de valider les données au chargement :

```javascript
function validateSongs(data) {
  return data.filter(song =>
    song.title && song.artist && typeof song.year === "number" && song.audio
  );
}
```

## Pièges à éviter
- **Modifier la structure du JSON sans adapter le code** : Si on renomme `year` en `release_year`, tout le code qui accède à `.year` casse silencieusement (pas d'erreur, juste `undefined`)
- **Ne pas gérer les erreurs de chargement** : Sans `try/catch`, un fichier manquant crash l'application entière. Toujours prévoir un fallback
- **Fichiers trop volumineux** : Un JSON de 10 Mo bloque le thread principal pendant le parsing. Au-delà de ~1 Mo, envisager le streaming (`ReadableStream`) ou la pagination
- **Sécurité XSS** : Si les données JSON contiennent du HTML (ex : `"title": "<script>alert('xss')</script>"`), l'injection dans le DOM via `innerHTML` crée une faille. Toujours utiliser `textContent` ou échapper le HTML

## Analyse personnelle
L'utilisation de JSON m'a appris la valeur de la **séparation des données et du code**. Au début, j'avais les chansons codées en dur dans `game.js`. Le passage à un fichier JSON externe a apporté trois avantages :

1. **Flexibilité** : Changer de playlist sans toucher au JavaScript
2. **Maintenabilité** : Le fichier JSON peut être généré par un outil (`spotify-to-json.mjs`)
3. **Testabilité** : On peut créer un `songs-test.json` avec 3 chansons pour les tests

En revanche, le JSON statique a une limite fondamentale : pas d'écriture. Pour le score et l'état de la partie, j'ai dû utiliser `localStorage` en complément (voir la fiche [persistance-donnee.md](../../dashboard/fiches-techniques/persistance-donnee.md)). Pour un vrai système de classement multi-joueurs, il faudrait un backend avec une base de données.

Ce choix d'architecture (JSON pour les données statiques + localStorage pour l'état) est un pattern courant dans les applications web légères. C'est un compromis pragmatique que j'ai retrouvé dans mon projet Restaurant, où `menu.json` joue le même rôle que `songs.json`.

## Sources
- [MDN – JSON](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/JSON)
- [MDN – Fetch API](https://developer.mozilla.org/fr/docs/Web/API/Fetch_API)
- [MDN – async/await](https://developer.mozilla.org/fr/docs/Learn/JavaScript/Asynchronous/Promises)
- [JavaScript.info – JSON methods](https://javascript.info/json)
