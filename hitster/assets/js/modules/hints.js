import { UIElements } from './ui.js';

let hintTimers = [];

export function startProgressiveHints(card) {
  clearProgressiveHints();
  if (!UIElements.hintEl) return;

  const wordCount = card.title ? card.title.split(" ").length : 0;
  UIElements.hintEl.textContent = `💡 ${wordCount} mot(s) dans le titre`;

  hintTimers.push(setTimeout(() => {
    UIElements.hintEl.textContent = `💡 Artiste : ${card.artist}`;
    UIElements.hintEl.classList.add("hint-reveal");
    setTimeout(() => UIElements.hintEl.classList.remove("hint-reveal"), 500);
  }, 5000));

  // Révèle la décennie après 10s
  hintTimers.push(setTimeout(() => {
    const decade = Math.floor(card.year / 10) * 10;
    UIElements.hintEl.textContent = `💡 Décennie : ${decade}s`;
    UIElements.hintEl.classList.add("hint-reveal");
    setTimeout(() => UIElements.hintEl.classList.remove("hint-reveal"), 500);
  }, 10000));
}

export function clearProgressiveHints() {
  hintTimers.forEach(t => clearTimeout(t));
  hintTimers = [];
}
