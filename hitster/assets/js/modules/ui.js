export const UIElements = {
  scoreEl: document.getElementById("score"),
  highScoreEl: document.getElementById("high-score"),
  livesEl: document.getElementById("lives"),
  timelineEl: document.getElementById("timeline"),
  messageEl: document.getElementById("message"),
  hintEl: document.getElementById("card-hint"),
  currentCardEl: document.getElementById("current-card"),
  startBtn: document.getElementById("start-game"),
  playlistInput: document.getElementById("playlist-url"),
  difficultySelect: document.getElementById("difficulty-select"),
  modal: document.getElementById("game-over-modal"),
  modalTitle: document.getElementById("modal-title"),
  modalMessage: document.getElementById("modal-message"),
  modalScore: document.getElementById("modal-score"),
  modalDifficultySelect: document.getElementById("modal-difficulty"),
  btnRestart: document.getElementById("btn-restart"),
  btnNewPlaylist: document.getElementById("btn-new-playlist"),
  qrDiv: document.getElementById("qrcode"),
  qrMess: document.getElementById("qrcode-mess"),
  // Audio UI
  playPauseBtn: document.getElementById("play-pause-btn"),
  progressBar: document.getElementById("progress-bar"),
  progressContainer: document.getElementById("progress-container"),
  timeDisplay: document.getElementById("time-display"),
  audioLoader: document.getElementById("audio-loading"),
  audioEl: document.getElementById("audio")
};

export function renderLives(count) {
  if (!UIElements.livesEl) return;
  UIElements.livesEl.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const span = document.createElement("span");
    span.textContent = "❤️";
    span.className = "heart-icon";
    UIElements.livesEl.appendChild(span);
  }
}

export function updateScoreUI(score, highScore) {
  UIElements.scoreEl.textContent = "Score : " + score;
  if (UIElements.highScoreEl) UIElements.highScoreEl.textContent = "Record : " + highScore;
}

export function renderTimeline(timeline, onDropCallback) {
  UIElements.timelineEl.innerHTML = "";

  addDropZone(0, onDropCallback);

  timeline.forEach((card, index) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "timeline-card";
    
    // Check if it's new (logic handled outside, but we can add class via arg if needed, 
    // for now we'll rely on the logic passing a flag or just assume simplistic rendering)
    // To support animation like before, we might need to know which index is new.
    // For simplicity, we'll omit the 'newly-placed' check here or add it if needed later.
    
    cardDiv.innerHTML = `
      <div class="year">${card.year}</div>
      <div class="title">${card.title}</div>
      <div class="artist">${card.artist}</div>
    `;

    UIElements.timelineEl.appendChild(cardDiv);
    addDropZone(index + 1, onDropCallback);
  });
}

function addDropZone(position, onDropCallback) {
  const zone = document.createElement("div");
  zone.className = "drop-zone";
  zone.textContent = "+";
  zone.onclick = () => onDropCallback(position);

  // Drag listeners
  zone.ondragover = (e) => {
    e.preventDefault();
    zone.classList.add("drag-over");
    e.dataTransfer.dropEffect = "move";
  };

  zone.ondragleave = () => {
    zone.classList.remove("drag-over");
  };

  zone.ondrop = (e) => {
    e.preventDefault();
    zone.classList.remove("drag-over");
    onDropCallback(position);
  };

  UIElements.timelineEl.appendChild(zone);
}

export function showGameOverModal(isVictory, score, currentCard, currentPlaylistId, difficulty, onRestart) {
    if (UIElements.qrDiv) UIElements.qrDiv.innerHTML = "";

    if (currentPlaylistId && typeof QRCode !== "undefined") {
      if (UIElements.qrMess) UIElements.qrMess.style.display = "block";
      new QRCode(UIElements.qrDiv, {
        text: `https://open.spotify.com/playlist/${currentPlaylistId}`,
        width: 128,
        height: 128,
      });
    } else {
      if (UIElements.qrMess) UIElements.qrMess.style.display = "none";
    }
  
    UIElements.modal.classList.remove("hidden");
  
    if (UIElements.modalDifficultySelect) {
        UIElements.modalDifficultySelect.value = difficulty;
    }
  
    UIElements.modalScore.textContent = `Score final : ${score}`;
  
    if (isVictory) {
        UIElements.modalTitle.textContent = "🎉 Victoire !";
        UIElements.modalMessage.textContent = "Incroyable ! Tu as placé toutes les musiques !";
    } else {
        UIElements.modalTitle.textContent = "💀 Perdu !";
        UIElements.modalMessage.textContent = `C'était "${currentCard.title}" de ${currentCard.artist} (${currentCard.year})`;
    }
  
    // Cleanup old listeners to prevent duplicates if any
    const newBtn = UIElements.btnRestart.cloneNode(true);
    UIElements.btnRestart.parentNode.replaceChild(newBtn, UIElements.btnRestart);
    UIElements.btnRestart = newBtn;

    UIElements.btnRestart.addEventListener("click", () => {
        let newDiff = difficulty;
        if (UIElements.modalDifficultySelect) {
            newDiff = UIElements.modalDifficultySelect.value;
        }
        
        UIElements.modal.classList.add("hidden");
        UIElements.messageEl.className = ""; 
        UIElements.messageEl.textContent = "";

        // Trigger restart callback
        onRestart(newDiff);
    }, { once: true });
}
