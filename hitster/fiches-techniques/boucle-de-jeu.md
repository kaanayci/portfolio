# Boucle de Jeu Principale

## Définition
Une boucle de jeu (*game loop*) est le mécanisme central qui orchestre le déroulement d'un jeu : elle gère les transitions d'état (menu → partie → game over), traite les entrées utilisateur et met à jour l'affichage à chaque étape. Dans Hitster, cette boucle n'est pas basée sur `requestAnimationFrame` (comme un jeu temps réel) mais sur un **cycle événementiel** : chaque action du joueur déclenche l'étape suivante.

## Contexte d'utilisation
Cette architecture est adaptée aux jeux tour par tour ou à interaction déclenchée (quiz, jeux de cartes, puzzles). Le joueur contrôle le rythme : rien ne se passe tant qu'il n'a pas placé sa carte. C'est l'opposé d'un jeu d'arcade où la boucle tourne en continu.

## Architecture du flux

```
[Chargement chansons] → [startGame] → [nextCard] → [Écoute audio]
                                           ↑              ↓
                                           |        [Joueur place la carte]
                                           |              ↓
                                      [1.2s pause]  [checkPlacement]
                                           ↑         ↙        ↘
                                      [Correct]          [Incorrect]
                                                          ↙        ↘
                                                   [Vies > 0]   [endGame → GameOver]
```

## Implémentation dans le projet

### Initialisation de la partie
La fonction `startGame()` configure l'état initial : score, vies (selon la difficulté), timeline avec une première carte, puis lance le cycle.

```javascript
function startGame(selectedDifficulty) {
  if (!songs.length) return;
  
  difficulty = selectedDifficulty;
  gameActive = true;
  streak = bestStreak = correctPlacements = totalAttempts = 0;
  score = 0;

  // Mode difficile = mort subite (1 vie), sinon 3 vies
  if (difficulty === "hard") {
    lives = 1;
  } else {
    lives = 3;
    renderLives(lives);
  }

  // La première carte est placée automatiquement sur la timeline
  timeline = [];
  const first = songs.pop();
  if (first) timeline.push(first);

  renderTimeline(timeline, (pos) => checkPlacement(pos));
  nextCard(); // Lance le cycle
}
```

> **Pourquoi `songs.pop()` ?** Le tableau de chansons est mélangé au chargement (Fisher-Yates). `pop()` retire la dernière chanson, ce qui est en O(1) contrairement à `shift()` qui est en O(n). C'est un choix de performance.

### Passage à la carte suivante
`nextCard()` est le cœur de la boucle. Elle prépare la carte, lance l'audio et réinitialise l'interface.

```javascript
function nextCard() {
  stopTimer();
  clearProgressiveHints();

  // Condition d'arrêt : plus de chansons = victoire
  if (!songs.length) {
    gameActive = false;
    showGameOver(true);
    return;
  }

  currentCard = songs.pop();
  songsPlayed++;
  updateProgress(songsPlayed, totalSongs);

  // Lancer l'audio si l'URL est valide
  if (typeof currentCard.audio === "string" && currentCard.audio.startsWith("http")) {
    player.load(currentCard.audio);
    player.play().catch(() => {
      UIElements.messageEl.textContent = "🔇 Clique pour autoriser l'audio";
    });
  }

  // Mode chrono : timer avec callback d'échec
  if (difficulty === "chrono") {
    startTimer(CHRONO_SECONDS, () => {
      handleIncorrect();
    });
  }
}
```

### Vérification du placement
Le joueur place la carte à une position donnée. La validation compare l'année avec les voisins gauche et droit.

```javascript
function checkPlacement(position) {
  if (!gameActive || !currentCard) return;

  const left  = timeline[position - 1]; // Carte à gauche
  const right = timeline[position];     // Carte à droite

  // La carte est correcte si son année est >= gauche ET <= droite
  const isCorrect = (!left  || currentCard.year >= left.year)
                 && (!right || currentCard.year <= right.year);

  if (isCorrect) {
    streak++;
    const multiplier = Math.min(1 + Math.floor(streak / 3), 5);
    score += multiplier; // Combo : x2 après 3, x3 après 6, etc.

    timeline.splice(position, 0, currentCard); // Insertion à la bonne position
    renderTimeline(timeline, (pos) => checkPlacement(pos), position);
    
    setTimeout(() => nextCard(), 1200); // Pause visuelle avant la prochaine carte
  } else {
    streak = 0;
    handleIncorrect();
  }
}
```

> **Point technique** : `timeline.splice(position, 0, currentCard)` insère sans supprimer. C'est la méthode standard pour insérer à un index précis dans un tableau JavaScript. Les éléments suivants sont automatiquement décalés.

## Pièges à éviter
- **Course condition audio** : `player.play()` retourne une Promise qui peut être rejetée si le navigateur bloque l'autoplay. Toujours gérer le `.catch()`.
- **État incohérent** : Si le joueur clique rapidement deux fois sur une drop-zone, `checkPlacement` peut être appelée avec une `currentCard` déjà traitée. Le guard `if (!gameActive || !currentCard)` empêche ce cas.
- **Condition d'arrêt** : Oublier de vérifier `songs.length` dans `nextCard()` causerait un `pop()` sur un tableau vide, retournant `undefined` et crashant le jeu.

## Analyse personnelle
Construire cette boucle de jeu m'a appris à penser en termes de **machine à états** : le jeu est toujours dans un état précis (attente, vérification, transition, game over), et chaque événement déclenche une transition d'état. C'est un concept fondamental qui s'applique aussi à la gestion de formulaires, de workflows e-commerce ou de processus métier.

La difficulté principale a été de gérer les **timings** : l'audio doit avoir le temps de se charger, l'animation de feedback doit être visible avant de passer à la carte suivante (d'où le `setTimeout` de 1200ms), et le timer chrono doit être stoppé au bon moment. J'ai appris que les jeux web sont essentiellement de la gestion asynchrone déguisée.

Si c'était à refaire, j'extrairais une **fonction pure** `isPlacementCorrect(timeline, currentCard, position)` séparée de `checkPlacement()` pour faciliter les tests unitaires.

## Sources
- [MDN – Array.prototype.splice()](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
- [MDN – Promise](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [Game Programming Patterns – Game Loop](https://gameprogrammingpatterns.com/game-loop.html)
- [MDN – HTMLMediaElement.play()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play)
