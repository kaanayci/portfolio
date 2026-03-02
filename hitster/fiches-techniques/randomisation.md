# Randomisation des données en JavaScript

## Définition
La randomisation (ou mélange aléatoire) consiste à réarranger les éléments d'un tableau dans un ordre imprévisible. C'est un problème classique en informatique avec des implications importantes : un mauvais algorithme de mélange produit des résultats **biaisés** (certains ordres sont plus probables que d'autres), ce qui affecte l'équité d'un jeu.

## Contexte d'utilisation
La randomisation est indispensable dans :
- **Les jeux** : Mélanger des cartes, générer des niveaux aléatoires, piocher des éléments
- **Les tests** : Randomiser l'ordre des questions dans un quiz pour éviter la triche
- **Les algorithmes** : Monte Carlo, échantillonnage aléatoire, A/B testing
- **L'UX** : Afficher des recommandations dans un ordre varié

## L'algorithme Fisher-Yates (Knuth Shuffle)

### Pourquoi pas `Array.sort(() => Math.random() - 0.5)` ?

L'approche naïve utilise `sort()` avec un comparateur aléatoire :

```javascript
// ❌ BIAISÉ — Ne pas utiliser en production
array.sort(() => Math.random() - 0.5);
```

**Problème** : Le résultat est biaisé car `sort()` s'attend à un comparateur **déterministe** (toujours le même résultat pour la même paire). Un comparateur aléatoire viole ce contrat, et l'algorithme de tri sous-jacent (TimSort dans V8) ne peut pas garantir un mélange uniforme. Les éléments proches de leur position initiale ont une probabilité plus élevée d'y rester.

### L'implémentation correcte : Fisher-Yates

```javascript
// ✅ Fisher-Yates : mélange un tableau en place en O(n)
export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    // Choisir un index aléatoire entre 0 et i (inclus)
    const j = Math.floor(Math.random() * (i + 1));
    // Échanger les éléments aux positions i et j
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
```

**Comment ça fonctionne :**

1. On part de la fin du tableau (`i = length - 1`)
2. On choisit un index aléatoire `j` entre `0` et `i`
3. On échange les éléments `array[i]` et `array[j]`
4. On décrémente `i` et on recommence

À chaque étape, l'élément placé à la position `i` ne sera plus jamais bougé. Après `n-1` échanges, le tableau est uniformément mélangé.

**Complexité** : O(n) en temps, O(1) en espace (in-place). C'est optimal — on ne peut pas faire mieux car il faut toucher chaque élément au moins une fois.

### Démonstration sur un exemple

```
Tableau initial : [A, B, C, D]

Étape 1 (i=3) : j = random(0..3) = 1
  Échanger [3] et [1] : [A, D, C, B]

Étape 2 (i=2) : j = random(0..2) = 0
  Échanger [2] et [0] : [C, D, A, B]

Étape 3 (i=1) : j = random(0..1) = 1
  Échanger [1] et [1] : [C, D, A, B]  (pas de changement = swap avec soi-même)

Résultat : [C, D, A, B]
```

### Syntaxe de déstructuration

```javascript
// Swap classique (3 lignes)
const temp = array[i];
array[i] = array[j];
array[j] = temp;

// Swap par déstructuration ES6 (1 ligne)
[array[i], array[j]] = [array[j], array[i]];
```

> La déstructuration crée un tableau temporaire `[array[j], array[i]]` puis l'assigne dans le bon ordre. C'est plus concis mais crée un objet temporaire (impact négligeable en performance).

## Utilisation dans le projet

### Au chargement des chansons

```javascript
async function loadSongs() {
  try {
    const res = await fetch(`assets/data/songs.json?v=${Date.now()}`);
    songs = shuffle(await res.json()); // Mélanger immédiatement
  } catch (e) {
    songs = [];
  }
}
```

### Pioche avec `pop()`

```javascript
function nextCard() {
  currentCard = songs.pop(); // Retire et retourne le dernier élément
  // ...
}
```

Puisque le tableau est déjà mélangé, `pop()` agit comme une **pioche aléatoire** en O(1). C'est plus efficace que de choisir un index aléatoire à chaque tour (ce qui nécessiterait de gérer les éléments déjà piochés avec un Set ou un filtre).

## Pièges à éviter
- **Mutation du tableau original** : `shuffle()` modifie le tableau en place. Si on a besoin de l'original (pour rejouer la même playlist), il faut cloner avant : `shuffle([...originalArray])`
- **`Math.random()` n'est pas cryptographiquement sûr** : Pour un jeu, c'est suffisant. Pour de la sécurité (tokens, mots de passe), il faut utiliser `crypto.getRandomValues()`.
- **Tableau vide** : Appeler `pop()` sur un tableau vide retourne `undefined`, pas une erreur. Le guard `if (!songs.length)` dans `nextCard()` empêche ce cas.
- **Biais statistique** : Avec `sort(() => Math.random() - 0.5)`, les tests montrent jusqu'à 30% de déviation par rapport à une distribution uniforme sur 10'000 itérations. Fisher-Yates dévie de moins de 1%.

## Analyse personnelle
La randomisation m'a fait découvrir qu'un problème apparemment trivial (« mélanger un tableau ») cache des subtilités mathématiques. Ma première version utilisait `sort(() => Math.random() - 0.5)`, et ça « semblait » fonctionner. C'est en lisant la fiche MDN que j'ai découvert le biais, et en recherchant l'algorithme correct que j'ai trouvé Fisher-Yates.

Cette expérience m'a enseigné deux choses :
1. **Tester avec des cas limites ne suffit pas** : Le biais de `sort` n'est pas visible à l'œil nu — il faut des tests statistiques pour le détecter.
2. **Les algorithmes classiques existent pour une raison** : Fisher-Yates a été publié en 1938 (version papier) et adapté par Knuth en 1969. Réinventer l'algorithme de mélange est contre-productif quand une solution prouvée mathématiquement existe.

C'est un principe que j'applique maintenant à d'autres domaines : avant d'écrire ma propre solution, je vérifie si un algorithme standard existe (tri, recherche, hachage).

## Sources
- [MDN – Math.random()](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Math/random)
- [Wikipedia – Fisher-Yates Shuffle](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
- [JavaScript.info – Destructuring Assignment](https://javascript.info/destructuring-assignment)
- [Blog – The Danger of Naive Shuffling](https://blog.codinghorror.com/the-danger-of-naivete/)
