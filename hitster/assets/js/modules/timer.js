import { UIElements } from './ui.js';

let timerInterval = null;
let timerRemaining = 0;

export function startTimer(seconds, onExpired) {
  stopTimer();
  if (!UIElements.timerBarContainer) return;
  UIElements.timerBarContainer.classList.remove("hidden");
  timerRemaining = seconds;
  updateDisplay(seconds, seconds);

  timerInterval = setInterval(() => {
    timerRemaining -= 0.1;
    if (timerRemaining <= 0) {
      timerRemaining = 0;
      stopTimer();
      onExpired();
    }
    updateDisplay(timerRemaining, seconds);
  }, 100);
}

function updateDisplay(remaining, total) {
  if (UIElements.timerBar) {
    const pct = (remaining / total) * 100;
    UIElements.timerBar.style.width = pct + "%";
    // Couleur progressive : vert → jaune → rouge
    if (pct > 50) UIElements.timerBar.className = "timer-bar timer-green";
    else if (pct > 25) UIElements.timerBar.className = "timer-bar timer-yellow";
    else UIElements.timerBar.className = "timer-bar timer-red";
  }
  if (UIElements.timerText) {
    UIElements.timerText.textContent = Math.ceil(remaining) + "s";
  }
}

export function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  if (UIElements.timerBarContainer) UIElements.timerBarContainer.classList.add("hidden");
}
