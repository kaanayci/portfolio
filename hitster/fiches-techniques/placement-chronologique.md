# Logique de Placement Chronologique

## Définition
Le placement chronologique est une mécanique de jeu où le joueur doit insérer un élément à la bonne position dans une séquence ordonnée par date. C'est un problème d'**insertion ordonnée** : la carte doit être placée entre deux voisins dont les années encadrent la sienne. En algorithmique, c'est une variante simplifiée de l'insertion dans une liste triée.

## Contexte d'utilisation
Cette mécanique est utilisée dans :
- **Jeux éducatifs** : Frise chronologique, quiz d'histoire
- **Jeux de société** : Hitster, Timeline (Asmodee)
- **Applications pédagogiques** : Ordonner des événements, prioriser des tâches

Au-delà du jeu, l'insertion ordonnée est un concept fondamental en programmation : insertion dans un tableau trié, placement dans un arbre binaire de recherche, insertion dans une file de priorité.

## Implémentation dans le projet

### L'algorithme de validation

La validation est étonnamment simple : il suffit de vérifier que l'année de la carte est **entre** ses deux voisins (gauche et droite).

```javascript
function checkPlacement(position) {
  if (!gameActive || !currentCard) return;

  const left  = timeline[position - 1]; // Carte à gauche (ou undefined si début)
  const right = timeline[position];     // Carte à droite (ou undefined si fin)

  // Correct si : année >= voisin gauche ET année <= voisin droit
  // Si pas de voisin (début ou fin de timeline), la condition est ignorée
  const isCorrect = (!left  || currentCard.year >= left.year)
                 && (!right || currentCard.year <= right.year);

  totalAttempts++;

  if (isCorrect) {
    // Insertion à la bonne position (splice sans suppression)
    timeline.splice(position, 0, currentCard);
    // ... gestion du score, animations, prochaine carte
  } else {
    // ... gestion des vies, feedback d'erreur
  }
}
```

### Décomposition de la logique

Prenons un exemple concret avec une timeline existante :

```
Timeline : [Queen 1975] — [Nirvana 1991] — [Daft Punk 2001]
Carte à placer : Eminem (2000)
```

Le joueur a 4 positions possibles (avant, entre chaque paire, après) :

| Position | Voisin gauche | Voisin droit | Condition | Résultat |
|---|---|---|---|---|
| 0 | — | Queen (1975) | 2000 <= 1975 ? | ❌ Non |
| 1 | Queen (1975) | Nirvana (1991) | 2000 >= 1975 ET 2000 <= 1991 ? | ❌ Non |
| 2 | Nirvana (1991) | Daft Punk (2001) | 2000 >= 1991 ET 2000 <= 2001 ? | ✅ Oui |
| 3 | Daft Punk (2001) | — | 2000 >= 2001 ? | ❌ Non |

### Gestion des cas limites

```javascript
// Cas 1 : Placement au début (pas de voisin gauche)
// left = undefined → !left = true → condition gauche ignorée
const isCorrect = (!undefined || ...) && (!right || card.year <= right.year);
//                    true                    → seul le voisin droit compte

// Cas 2 : Placement à la fin (pas de voisin droit)
// right = undefined → seul le voisin gauche compte

// Cas 3 : Années égales (ex : deux chansons de 1991)
// 1991 >= 1991 ET 1991 <= 1991 → true (placement accepté)
```

> **L'opérateur `||` comme guard** : `!left || condition` est un **short-circuit** : si `!left` est `true` (pas de voisin gauche), JavaScript n'évalue pas la condition. C'est un pattern courant pour les valeurs optionnelles.

### Insertion dans le tableau avec `splice()`

```javascript
// Avant : timeline = [Queen, Nirvana, Daft Punk]
timeline.splice(2, 0, currentCard);
// splice(index, suppression, insertion)
// Après : timeline = [Queen, Nirvana, Eminem, Daft Punk]
```

`splice(position, 0, element)` insère `element` à `position` sans rien supprimer (le 2e argument `0` signifie « supprimer 0 éléments »). Les éléments suivants sont automatiquement décalés.

### Feedback visuel : highlight de la bonne position

En cas d'erreur, le jeu montre où la carte aurait dû être placée :

```javascript
export function highlightCorrectPosition(timeline, card) {
  // Trouver la bonne position en parcourant la timeline
  let correctPos = timeline.length; // Par défaut : à la fin
  for (let i = 0; i < timeline.length; i++) {
    if (card.year <= timeline[i].year) {
      correctPos = i;
      break;
    }
  }

  // Animer la drop-zone correspondante
  const zones = document.querySelectorAll(".drop-zone");
  if (zones[correctPos]) {
    zones[correctPos].classList.add("correct-hint");
    setTimeout(() => zones[correctPos].classList.remove("correct-hint"), 2000);
  }
}
```

## Pièges à éviter
- **Comparer des chaînes au lieu de nombres** : `"1991" > "2001"` donne `false` car la comparaison est lexicographique (caractère par caractère). Toujours s'assurer que `year` est un `number` dans le JSON.
- **Ne pas gérer les cas limites** : Début et fin de timeline doivent être testés explicitement. Sans le guard `!left`, accéder à `left.year` quand `left` est `undefined` lève une `TypeError`.
- **Mélanger validation et affichage** : `checkPlacement()` fait les deux (vérification + mise à jour du DOM). Idéalement, une fonction pure `isPlacementCorrect()` devrait uniquement retourner `true/false`, et une autre fonction gérerait l'affichage.
- **Mutation du tableau original** : `splice()` modifie le tableau en place. Si on avait besoin de l'état précédent (undo), il faudrait cloner le tableau avant insertion.

## Analyse personnelle
Cette mécanique m'a appris à **traduire une règle de jeu abstraite en conditions logiques**. La règle « la carte doit être à la bonne place dans l'ordre chronologique » semble simple en français, mais son implémentation nécessite de gérer les cas limites (début, fin, années égales) et de choisir la bonne structure de données.

J'ai aussi découvert que la complexité de cet algorithme est O(1) pour la validation (accès direct aux voisins par index) et O(n) pour l'insertion (`splice` décale les éléments). Pour un jeu avec ~50 cartes, c'est négligeable. Mais pour une application avec des milliers d'éléments triés, une structure comme un arbre binaire serait plus efficace.

La principale difficulté a été le **système de score avec multiplicateur** : le combo (streak) récompense les placements consécutifs corrects. Cela ajoute un état supplémentaire à gérer (`streak`, `bestStreak`) et une formule (`multiplier = Math.min(1 + Math.floor(streak / 3), 5)`) qui plafonne à ×5. Trouver un bon équilibre de difficulté a nécessité plusieurs tests empiriques.

## Sources
- [MDN – Array.prototype.splice()](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
- [MDN – Opérateurs logiques (short-circuit)](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/Logical_OR)
- [Wikipedia – Insertion Sort](https://en.wikipedia.org/wiki/Insertion_sort)
- [JavaScript.info – Array Methods](https://javascript.info/array-methods)
