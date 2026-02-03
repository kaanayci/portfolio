# Gestionnaire Audio (Audio API)

## Description
Le jeu musical repose sur une lecture audio fluide et contrôlable. La classe `AudioPlayer` encapsule l'élément HTML5 `<audio>` pour fournir une interface de contrôle unifiée.

## Architecture
Le module suit le pattern "Wrapper" :
*   Il prend en entrée l'élément DOM audio et un objet `ui` contenant les références aux boutons (Play/Pause, Loader).
*   Il expose des méthodes simples (`togglePlay`, `loadSong`) abstraites du DOM.

## Synchronisation UI
La classe écoute les événements natifs de l'élément audio pour mettre à jour l'interface, garantissant que l'état visuel correspond toujours à l'état sonore (single source of truth).

| Événement | Action UI |
|-----------|-----------|
| `play` | Change bouton en "Pause", cache le loader. |
| `pause` | Change bouton en "Play". |
| `timeupdate` | Met à jour la barre de progression. |
| `ended` | Réinitialise le bouton Play. |

## Exemple d'utilisation
```javascript
// ui reference passed to constructor
this.ui = { playPauseBtn: document.getElementById('btn') };

// Native event listener
this.audioEl.addEventListener("play", () => {
    this.ui.playPauseBtn.textContent = "⏸";
});
```

## Exemple de code
![alt text](controle-audio.png)
