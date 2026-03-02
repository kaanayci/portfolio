# Interaction utilisateur : Drag & Drop, Click et Clavier

## Définition
Les zones d'interaction sont des éléments du DOM qui réagissent aux actions de l'utilisateur (clic, glisser-déposer, clavier) pour déclencher une logique métier. Dans Hitster, le joueur doit **placer une carte** à la bonne position dans la timeline via trois modes d'entrée : drag & drop (desktop), touch (mobile) et raccourcis clavier.

## Contexte d'utilisation
Cette triple approche (mouse + touch + keyboard) est essentielle pour :
- **L'accessibilité** : Les utilisateurs clavier doivent pouvoir jouer sans souris
- **Le mobile** : Le drag & drop natif HTML5 ne fonctionne pas sur mobile, il faut écouter les événements `touch*`
- **L'UX desktop** : Le drag & drop est plus intuitif qu'un simple clic pour placer une carte

## Implémentation dans le projet

### 1. Drop zones dynamiques

Les zones de dépôt sont générées **entre chaque carte** de la timeline. Elles sont créées par la fonction `addDropZone()` dans `ui.js` :

```javascript
function addDropZone(position, cb) {
  const zone = document.createElement("div");
  zone.className = "drop-zone";
  zone.textContent = "+";
  zone.setAttribute("data-position", position);

  // Clic simple : le plus fiable
  zone.onclick = () => cb(position);

  // Drag & Drop HTML5 (desktop)
  zone.ondragover = (e) => {
    e.preventDefault(); // Nécessaire pour autoriser le drop
    zone.classList.add("drag-over");
    e.dataTransfer.dropEffect = "move";
  };
  zone.ondragleave = () => zone.classList.remove("drag-over");
  zone.ondrop = (e) => {
    e.preventDefault();
    zone.classList.remove("drag-over");
    cb(position); // Appeler la même callback que le clic
  };

  UIElements.timelineEl.appendChild(zone);
}
```

> **Point clé** : `e.preventDefault()` dans `ondragover` est **obligatoire**. Sans cela, le navigateur refuse le drop par défaut (comportement standard du HTML5 Drag and Drop API).

### 2. Drag & Drop + Touch mobile

Le module `input.js` gère le démarrage du drag et l'émulation pour le tactile :

```javascript
export function setupDragAndDrop(cardEl, dragInstruction) {
  // --- Desktop : HTML5 Drag API ---
  cardEl.ondragstart = (e) => {
    e.dataTransfer.setData("text/plain", "card");
    e.dataTransfer.effectAllowed = "move";
    cardEl.classList.add("dragging");
    document.body.classList.add("is-dragging");
  };
  cardEl.ondragend = () => {
    cardEl.classList.remove("dragging");
    document.body.classList.remove("is-dragging");
  };

  // --- Mobile : Touch Events (le drag HTML5 ne fonctionne pas) ---
  let touchActive = false;

  cardEl.addEventListener("touchstart", () => {
    if (cardEl.getAttribute("draggable") !== "true") return;
    touchActive = true;
    cardEl.classList.add("dragging");
    document.body.classList.add("is-dragging");
  }, { passive: true });

  cardEl.addEventListener("touchmove", (e) => {
    if (!touchActive) return;
    e.preventDefault(); // Empêcher le scroll pendant le drag
    const touch = e.touches[0];
    // Identifier quelle drop-zone est sous le doigt
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    document.querySelectorAll(".drop-zone.touch-hover")
      .forEach(z => z.classList.remove("touch-hover"));
    if (el?.classList.contains("drop-zone")) el.classList.add("touch-hover");
  }, { passive: false });

  cardEl.addEventListener("touchend", (e) => {
    if (!touchActive) return;
    touchActive = false;
    cardEl.classList.remove("dragging");
    const touch = e.changedTouches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    // Simuler un clic sur la drop-zone sous le doigt
    if (el?.classList.contains("drop-zone")) el.click();
  });
}
```

> **`document.elementFromPoint()`** : Cette fonction retourne l'élément le plus au-dessus aux coordonnées données. C'est la clé pour savoir où le doigt se trouve sur mobile, car les `TouchEvent` ne ciblent pas l'élément sous le doigt comme le ferait un `mouseover`.

### 3. Navigation clavier

```javascript
export function setupKeyboard(player, moveFocusedDropZone, placeAtFocusedZone, isGameActive) {
  document.addEventListener("keydown", (e) => {
    if (!isGameActive()) return;
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;

    switch (e.code) {
      case "Space":      e.preventDefault(); player.togglePlay(); break;
      case "ArrowLeft":  e.preventDefault(); moveFocusedDropZone(-1); break;
      case "ArrowRight": e.preventDefault(); moveFocusedDropZone(1); break;
      case "Enter":      e.preventDefault(); placeAtFocusedZone(); break;
    }
  });
}
```

> **Guard clause `e.target.tagName`** : Si le focus est dans un `<input>` ou `<select>` (ex : sélecteur de difficulté), les raccourcis sont désactivés. Sinon, taper Espace dans un champ texte déclencherait le toggle play au lieu d'écrire un espace.

## Comparaison des trois approches

| Critère | Clic simple | Drag & Drop HTML5 | Touch Events |
|---|---|---|---|
| **Support navigateur** | Universel | Desktop uniquement | Mobile/tactile |
| **Feedback UX** | Basique | Intuitif (glisser) | Intuitif (tactile) |
| **Complexité** | Faible | Moyenne | Élevée |
| **Accessibilité** | Bon (clavier via Enter) | Mauvais (pas de clavier) | Mauvais |
| **Fallback** | — | Clic comme fallback | `el.click()` comme bridge |

## Pièges à éviter
- **Ne pas désactiver les zones après le game over** : Sans le guard `if (!gameActive)`, le joueur pourrait continuer à placer des cartes après la fin
- **`passive: false` obligatoire sur touchmove** : Sans cela, `e.preventDefault()` est ignoré et la page scroll pendant le drag tactile
- **Focus management** : Les drop-zones ne sont pas des `<button>` sémantiques — c'est un compromis d'accessibilité que je reconnais

## Analyse personnelle
Implémenter ces trois modes d'interaction m'a montré à quel point le web est fragmenté en termes d'événements. Le même geste — « placer une carte à un endroit » — nécessite trois implémentations différentes (drag, touch, clavier) qui convergent vers le même callback `cb(position)`.

C'est le concept de **convergence d'événements** : peu importe comment l'utilisateur interagit, le résultat passe par la même fonction `checkPlacement(position)`. Ce pattern est réutilisable dans tout projet interactif (éditeur visuel, kanban board, configurateur).

Si c'était à refaire, j'utiliserais `SortableJS` qui gère nativement le cross-platform. Mais implémenter à la main m'a donné une compréhension profonde du fonctionnement.

## Sources
- [MDN – HTML Drag and Drop API](https://developer.mozilla.org/fr/docs/Web/API/HTML_Drag_and_Drop_API)
- [MDN – Touch Events](https://developer.mozilla.org/fr/docs/Web/API/Touch_events)
- [MDN – document.elementFromPoint()](https://developer.mozilla.org/en-US/docs/Web/API/Document/elementFromPoint)
- [MDN – KeyboardEvent.code](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code)
