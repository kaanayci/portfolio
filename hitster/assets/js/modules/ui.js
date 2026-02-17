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
  timelineRecap: document.getElementById("timeline-recap"),
  // Progress tracker
  progressTracker: document.getElementById("progress-tracker"),
  songCounter: document.getElementById("song-counter"),
  songProgress: document.getElementById("song-progress"),
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

/** Update the song progress tracker */
export function updateProgress(current, total) {
  if (!UIElements.progressTracker) return;
  UIElements.progressTracker.classList.remove("hidden");
  if (UIElements.songCounter) UIElements.songCounter.textContent = `${current} / ${total}`;
  if (UIElements.songProgress) {
    const pct = total > 0 ? (current / total) * 100 : 0;
    UIElements.songProgress.style.width = pct + "%";
  }
}

export function renderTimeline(timeline, onDropCallback, newIndex = -1) {
  UIElements.timelineEl.innerHTML = "";

  addDropZone(0, onDropCallback);

  timeline.forEach((card, index) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "timeline-card";
    
    // Animate newly inserted card
    if (index === newIndex) {
      cardDiv.classList.add("slide-in", "correct-flash");
      setTimeout(() => {
        cardDiv.classList.remove("slide-in", "correct-flash");
      }, 900);
    }
    
    cardDiv.innerHTML = `
      <div class="year">${card.year}</div>
      <div class="title">${card.title}</div>
      <div class="artist">${card.artist}</div>
    `;

    UIElements.timelineEl.appendChild(cardDiv);
    addDropZone(index + 1, onDropCallback);
  });

  // Auto-scroll to newest card on mobile
  if (newIndex >= 0 && window.innerWidth <= 768) {
    const cards = UIElements.timelineEl.querySelectorAll(".timeline-card");
    if (cards[newIndex]) {
      setTimeout(() => {
        cards[newIndex].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }, 100);
    }
  }
}

function addDropZone(position, onDropCallback) {
  const zone = document.createElement("div");
  zone.className = "drop-zone";
  zone.textContent = "+";
  zone.onclick = () => onDropCallback(position);

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

/** Flash feedback on the timeline area */
export function flashTimeline(type) {
  const cls = type === "success" ? "success-pulse" : "error-shake";
  UIElements.timelineEl.classList.add(cls);
  setTimeout(() => UIElements.timelineEl.classList.remove(cls), 800);
}

export function showGameOverModal(isVictory, score, currentCard, currentPlaylistId, difficulty, onRestart, timeline = []) {
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

    // Build timeline recap
    if (UIElements.timelineRecap) {
      UIElements.timelineRecap.innerHTML = "";
      const sorted = [...timeline].sort((a, b) => a.year - b.year);
      sorted.forEach(card => {
        const chip = document.createElement("span");
        chip.className = "recap-chip";
        chip.innerHTML = `<span class="recap-year">${card.year}</span>${card.title}`;
        UIElements.timelineRecap.appendChild(chip);
      });
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

        onRestart(newDiff);
    }, { once: true });
}
