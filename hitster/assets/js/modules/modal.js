import { UIElements } from './ui.js';

export function showGameOverModal(isVictory, score, currentCard, currentPlaylistId, difficulty, onRestart, timeline = [], stats = {}) {
  if (UIElements.qrDiv) UIElements.qrDiv.innerHTML = "";

  if (currentPlaylistId && typeof QRCode !== "undefined") {
    if (UIElements.qrMess) UIElements.qrMess.style.display = "block";
    new QRCode(UIElements.qrDiv, {
      text: `https://open.spotify.com/playlist/${currentPlaylistId}`,
      width: 128, height: 128,
    });
  } else {
    if (UIElements.qrMess) UIElements.qrMess.style.display = "none";
  }

  if (UIElements.statAccuracy) UIElements.statAccuracy.textContent = (stats.accuracy || 0) + "%";
  if (UIElements.statBestStreak) UIElements.statBestStreak.textContent = stats.bestStreak || 0;
  if (UIElements.statAvgTime) UIElements.statAvgTime.textContent = (stats.avgTime || 0).toFixed(1) + "s";

  buildRecap(timeline);

  UIElements.modal.classList.remove("hidden");
  if (UIElements.modalDifficultySelect) UIElements.modalDifficultySelect.value = difficulty;
  UIElements.modalScore.textContent = `Score final : ${score}`;

  if (isVictory) {
    UIElements.modalTitle.textContent = "🎉 Victoire !";
    UIElements.modalMessage.textContent = "Incroyable ! Tu as placé toutes les musiques !";
  } else {
    UIElements.modalTitle.textContent = "💀 Perdu !";
    UIElements.modalMessage.textContent = `C'était "${currentCard.title}" de ${currentCard.artist} (${currentCard.year})`;
  }

  // Remplace le bouton pour éviter les listeners dupliqués
  const newBtn = UIElements.btnRestart.cloneNode(true);
  UIElements.btnRestart.parentNode.replaceChild(newBtn, UIElements.btnRestart);
  UIElements.btnRestart = newBtn;

  UIElements.btnRestart.addEventListener("click", () => {
    let newDiff = difficulty;
    if (UIElements.modalDifficultySelect) newDiff = UIElements.modalDifficultySelect.value;
    UIElements.modal.classList.add("hidden");
    UIElements.messageEl.className = "";
    UIElements.messageEl.textContent = "";
    onRestart(newDiff);
  }, { once: true });
}

function buildRecap(timeline) {
  if (!UIElements.timelineRecap) return;
  UIElements.timelineRecap.innerHTML = "";
  [...timeline].sort((a, b) => a.year - b.year).forEach(card => {
    const chip = document.createElement("span");
    chip.className = "recap-chip";
    const cover = card.image ? `<img class="recap-cover" src="${card.image}" alt="" />` : "";
    chip.innerHTML = `${cover}<span class="recap-year">${card.year}</span>${card.title}`;
    UIElements.timelineRecap.appendChild(chip);
  });
}
