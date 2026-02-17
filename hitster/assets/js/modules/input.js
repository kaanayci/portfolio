export function setupDragAndDrop(cardEl, dragInstruction) {
  if (!cardEl) return;

  cardEl.ondragstart = (e) => {
    e.dataTransfer.setData("text/plain", "card");
    e.dataTransfer.effectAllowed = "move";
    cardEl.classList.add("dragging");
    document.body.classList.add("is-dragging");
    if (dragInstruction) dragInstruction.classList.remove("visible");
  };

  cardEl.ondragend = () => {
    cardEl.classList.remove("dragging");
    document.body.classList.remove("is-dragging");
  };

  // Touch : on simule un drag via touchmove + elementFromPoint
  let touchActive = false;

  cardEl.addEventListener("touchstart", () => {
    if (cardEl.getAttribute("draggable") !== "true") return;
    touchActive = true;
    cardEl.classList.add("dragging");
    document.body.classList.add("is-dragging");
    if (dragInstruction) dragInstruction.classList.remove("visible");
  }, { passive: true });

  cardEl.addEventListener("touchmove", (e) => {
    if (!touchActive) return;
    e.preventDefault();
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    document.querySelectorAll(".drop-zone.touch-hover").forEach(z => z.classList.remove("touch-hover"));
    if (el?.classList.contains("drop-zone")) el.classList.add("touch-hover");
  }, { passive: false });

  cardEl.addEventListener("touchend", (e) => {
    if (!touchActive) return;
    touchActive = false;
    cardEl.classList.remove("dragging");
    document.body.classList.remove("is-dragging");
    const touch = e.changedTouches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    document.querySelectorAll(".drop-zone.touch-hover").forEach(z => z.classList.remove("touch-hover"));
    if (el?.classList.contains("drop-zone")) el.click();
  });
}

export function setupKeyboard(player, moveFocusedDropZone, placeAtFocusedZone, isGameActive) {
  document.addEventListener("keydown", (e) => {
    if (!isGameActive()) return;
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
    switch (e.code) {
      case "Space":
        e.preventDefault();
        player.togglePlay();
        break;
      case "ArrowLeft":
        e.preventDefault();
        moveFocusedDropZone(-1);
        break;
      case "ArrowRight":
        e.preventDefault();
        moveFocusedDropZone(1);
        break;
      case "Enter":
        e.preventDefault();
        placeAtFocusedZone();
        break;
    }
  });
}
