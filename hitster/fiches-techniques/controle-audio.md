# Gestionnaire Audio (HTML5 Audio API)

## Définition
L'API HTML5 Audio (`<audio>` element + `HTMLMediaElement` interface) permet de lire, contrôler et manipuler des fichiers audio dans le navigateur sans plugin. La classe `AudioPlayer` du projet Hitster encapsule cette API dans un **pattern Wrapper** qui abstrait la complexité du DOM audio et synchronise l'état sonore avec l'interface visuelle.

## Contexte d'utilisation
Un gestionnaire audio custom est nécessaire quand :
- Le lecteur natif du navigateur (`<audio controls>`) ne suffit pas pour l'UX souhaitée (design personnalisé, barre de progression stylisée)
- Il faut synchroniser l'état audio avec la logique métier (jeu, quiz, podcast player)
- On a besoin de fonctionnalités avancées : fade in/out, gestion d'erreurs réseau, loading states

## Implémentation dans le projet

### Architecture : le pattern Wrapper

```javascript
export class AudioPlayer {
  constructor(audioEl, ui) {
    this.audioEl = audioEl;     // L'élément <audio> du DOM
    this.ui = ui;               // Références aux éléments UI (boutons, barre, etc.)
    this._fadeInterval = null;  // ID de l'intervalle pour le fade
    this._onErrorCallback = null;
    this.init();
  }
}
```

> **Pourquoi un Wrapper plutôt que manipuler l'`<audio>` directement ?** La séparation permet de changer l'implémentation audio (ex : passer à Web Audio API pour des effets) sans modifier le code du jeu. Le jeu n'appelle que `player.play()`, `player.load(src)`, `player.pause()` — il ne connaît pas l'élément `<audio>`.

### Synchronisation UI via les événements natifs

Le principe clé est le **single source of truth** : c'est l'élément `<audio>` qui détermine l'état réel (en lecture, en pause, en chargement). L'UI ne fait que *réagir* à ses événements :

```javascript
init() {
  // L'UI réagit à l'état réel de l'audio (pas l'inverse)
  this.audioEl.addEventListener("play", () => {
    this.ui.playPauseBtn.textContent = "⏸";
    this.ui.audioLoader?.classList.remove("active");
  });

  this.audioEl.addEventListener("pause", () => {
    this.ui.playPauseBtn.textContent = "▶";
  });

  this.audioEl.addEventListener("timeupdate", () => this._updateProgress());

  this.audioEl.addEventListener("ended", () => {
    this.ui.playPauseBtn.textContent = "▶";
    this.ui.progressBar.style.width = "0%";
  });

  // Gestion du loading (latence réseau)
  this.audioEl.addEventListener("loadstart", () => {
    this.ui.audioLoader.classList.add("active");
  });
  this.audioEl.addEventListener("canplay", () => {
    this.ui.audioLoader.classList.remove("active");
  });
}
```

| Événement natif | Signification | Action UI |
|---|---|---|
| `play` | L'audio commence la lecture | Bouton → "⏸", masquer le loader |
| `pause` | L'audio est en pause | Bouton → "▶" |
| `timeupdate` | Position de lecture change (~4x/s) | Mise à jour de la barre de progression |
| `ended` | L'audio a fini de jouer | Réinitialiser le bouton et la barre |
| `loadstart` | Début de chargement réseau | Afficher le spinner de chargement |
| `canplay` | Assez de données pour lire | Masquer le spinner |
| `error` | Erreur réseau ou format | Appeler le callback d'erreur |

### Fade In / Fade Out

Pour éviter les coupures audio brutales entre les cartes, le lecteur utilise un fondu progressif :

```javascript
// Fondu d'entrée : volume 0 → volume cible en 500ms
_fadeIn() {
  const target = parseFloat(document.getElementById("volume-slider")?.value || 0.7);
  this.audioEl.volume = 0;
  const promise = this.audioEl.play();
  let step = 0;
  this._fadeInterval = setInterval(() => {
    step++;
    this.audioEl.volume = Math.min(target, (step / 10) * target);
    if (step >= 10) this._clearFade(); // Arrêter après 10 étapes (10 × 50ms = 500ms)
  }, 50);
  return promise;
}

// Fondu de sortie : volume actuel → 0 en 400ms, puis pause
fadeOut() {
  return new Promise(resolve => {
    const start = this.audioEl.volume;
    if (start === 0 || this.audioEl.paused) { resolve(); return; }
    let step = 0;
    this._fadeInterval = setInterval(() => {
      step++;
      this.audioEl.volume = Math.max(0, start * (1 - step / 8));
      if (step >= 8) {
        this._clearFade();
        this.audioEl.pause();
        resolve(); // Signaler que le fade est terminé
      }
    }, 50);
  });
}
```

> **Pourquoi retourner une Promise dans `fadeOut()` ?** Cela permet au code appelant d'attendre la fin du fondu avant de passer à la carte suivante : `await player.fadeOut(); nextCard();`. Sans cela, la transition serait saccadée.

### Barre de progression cliquable

```javascript
// L'utilisateur peut cliquer sur la barre pour sauter à un moment précis
this.ui.progressContainer?.addEventListener("click", (e) => {
  const duration = this.audioEl.duration;
  if (duration) {
    // Calcul : position du clic / largeur totale × durée
    this.audioEl.currentTime = (e.offsetX / this.ui.progressContainer.clientWidth) * duration;
  }
});
```

## Pièges à éviter
- **Autoplay bloqué** : Les navigateurs modernes bloquent l'autoplay sans interaction utilisateur. `audioEl.play()` retourne une Promise qui sera rejetée → toujours utiliser `.catch()`.
- **Fuite mémoire** : Ne pas oublier de `clearInterval()` les fades en cours avant d'en démarrer un nouveau (`_clearFade()`). Sinon, les intervalles s'accumulent et le volume oscille.
- **Codecs audio** : Les previews Spotify sont en MP3, supporté par tous les navigateurs. Mais si on utilisait OGG ou WAV, il faudrait prévoir un fallback avec `<source>` multiples.
- **CORS** : Les fichiers audio hébergés sur un autre domaine nécessitent les headers CORS côté serveur, sinon le navigateur bloque le chargement.

## Analyse personnelle
Implémenter un lecteur audio custom m'a montré la puissance du système d'événements du DOM. Plutôt que de « polling » l'état du lecteur (vérifier toutes les 100ms si l'audio joue), on écoute les événements natifs — c'est le pattern **Observer** en pratique.

Le fade in/out avec `setInterval` fonctionne mais n'est pas idéal : la Web Audio API offre `linearRampToValueAtTime()` pour un contrôle plus précis. C'est une piste d'amélioration si je voulais ajouter des effets (équaliseur, spatialisation).

La principale difficulté a été la gestion des états intermédiaires : que se passe-t-il si l'utilisateur change de carte pendant un fade ? Si le réseau coupe pendant le chargement ? Chaque cas edge nécessite un guard (`if (this.audioEl.paused) return`), ce qui m'a appris l'importance de la **programmation défensive**.

## Sources
- [MDN – HTMLMediaElement](https://developer.mozilla.org/fr/docs/Web/API/HTMLMediaElement)
- [MDN – Web Audio API](https://developer.mozilla.org/fr/docs/Web/API/Web_Audio_API)
- [MDN – HTMLMediaElement Events](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement#events)
- [Chrome Developers – Autoplay Policy](https://developer.chrome.com/blog/autoplay/)
