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
  audioEl: document.getElementById("audio"),
  // Cover art
  cardCover: document.getElementById("card-cover"),
  cardCoverImg: document.getElementById("card-cover-img"),
  // Streak
  streakDisplay: document.getElementById("streak-display"),
  streakCount: document.getElementById("streak-count"),
  streakMultiplier: document.getElementById("streak-multiplier"),
  // Timer
  timerBarContainer: document.getElementById("timer-bar-container"),
  timerBar: document.getElementById("timer-bar"),
  timerText: document.getElementById("timer-text"),
  // Stats
  statAccuracy: document.getElementById("stat-accuracy"),
  statBestStreak: document.getElementById("stat-best-streak"),
  statAvgTime: document.getElementById("stat-avg-time"),
  modalStats: document.getElementById("modal-stats")
};

// Track the currently focused drop zone for keyboard nav
let focusedDropIndex = -1;

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

/** Update streak display */
export function updateStreakUI(streak) {
  if (!UIElements.streakDisplay) return;
  if (streak >= 2) {
    UIElements.streakDisplay.classList.remove("hidden");
    UIElements.streakCount.textContent = `🔥 ${streak}`;
    const multiplier = Math.min(1 + Math.floor(streak / 3), 5);
    UIElements.streakMultiplier.textContent = `×${multiplier}`;
    UIElements.streakMultiplier.className = `streak-multiplier streak-x${Math.min(multiplier, 5)}`;
    // Pulse animation
    UIElements.streakDisplay.classList.remove("streak-pop");
    void UIElements.streakDisplay.offsetHeight;
    UIElements.streakDisplay.classList.add("streak-pop");
  } else {
    UIElements.streakDisplay.classList.add("hidden");
  }
}

/** Show cover art on current card */
export function showCoverArt(imageUrl) {
  if (!UIElements.cardCover || !UIElements.cardCoverImg) return;
  if (imageUrl) {
    UIElements.cardCoverImg.src = imageUrl;
    UIElements.cardCover.classList.remove("hidden");
  } else {
    UIElements.cardCover.classList.add("hidden");
  }
}

/** Hide cover art */
export function hideCoverArt() {
  if (UIElements.cardCover) UIElements.cardCover.classList.add("hidden");
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

/* ===== TIMER BAR (chrono mode) ===== */
let timerInterval = null;
let timerRemaining = 0;

export function startTimer(seconds, onExpired) {
  stopTimer();
  if (!UIElements.timerBarContainer) return;
  UIElements.timerBarContainer.classList.remove("hidden");
  timerRemaining = seconds;
  const total = seconds;
  updateTimerDisplay(total, total);
  
  timerInterval = setInterval(() => {
    timerRemaining -= 0.1;
    if (timerRemaining <= 0) {
      timerRemaining = 0;
      stopTimer();
      onExpired();
    }
    updateTimerDisplay(timerRemaining, total);
  }, 100);
}

function updateTimerDisplay(remaining, total) {
  if (UIElements.timerBar) {
    const pct = (remaining / total) * 100;
    UIElements.timerBar.style.width = pct + "%";
    // Color change: green > yellow > red
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

/* ===== TIMELINE RENDERING ===== */

// Store onDropCallback for keyboard access
let _currentDropCallback = null;

export function renderTimeline(timeline, onDropCallback, newIndex = -1) {
  UIElements.timelineEl.innerHTML = "";
  _currentDropCallback = onDropCallback;
  focusedDropIndex = -1;

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
    
    // Build card with cover art
    let coverHtml = "";
    if (card.image) {
      coverHtml = `<img class="timeline-card-cover" src="${card.image}" alt="" loading="lazy" />`;
    }
    
    cardDiv.innerHTML = `
      ${coverHtml}
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

/** Highlight the correct position in the timeline when wrong */
export function highlightCorrectPosition(timeline, currentCard) {
  const year = currentCard.year;
  let correctPos = 0;
  for (let i = 0; i < timeline.length; i++) {
    if (year >= timeline[i].year) correctPos = i + 1;
  }
  
  const dropZones = UIElements.timelineEl.querySelectorAll(".drop-zone");
  if (dropZones[correctPos]) {
    dropZones[correctPos].classList.add("correct-position-hint");
    setTimeout(() => {
      dropZones[correctPos].classList.remove("correct-position-hint");
    }, 2000);
  }
}

function addDropZone(position, onDropCallback) {
  const zone = document.createElement("div");
  zone.className = "drop-zone";
  zone.textContent = "+";
  zone.setAttribute("data-position", position);
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

/* ===== KEYBOARD NAVIGATION ===== */

/** Move focus between drop zones */
export function moveFocusedDropZone(direction) {
  const zones = UIElements.timelineEl.querySelectorAll(".drop-zone");
  if (zones.length === 0) return;
  
  // Clear previous highlight
  zones.forEach(z => z.classList.remove("keyboard-focus"));
  
  focusedDropIndex += direction;
  if (focusedDropIndex < 0) focusedDropIndex = zones.length - 1;
  if (focusedDropIndex >= zones.length) focusedDropIndex = 0;
  
  zones[focusedDropIndex].classList.add("keyboard-focus");
  zones[focusedDropIndex].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
}

/** Trigger placement at focused drop zone */
export function placeAtFocusedZone() {
  if (focusedDropIndex < 0 || !_currentDropCallback) return false;
  const zones = UIElements.timelineEl.querySelectorAll(".drop-zone");
  if (zones[focusedDropIndex]) {
    zones[focusedDropIndex].click();
    return true;
  }
  return false;
}

/* ===== GAME OVER MODAL ===== */

export function showGameOverModal(isVictory, score, currentCard, currentPlaylistId, difficulty, onRestart, timeline = [], stats = {}) {
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

    // Stats
    if (UIElements.statAccuracy) {
      UIElements.statAccuracy.textContent = (stats.accuracy || 0) + "%";
    }
    if (UIElements.statBestStreak) {
      UIElements.statBestStreak.textContent = stats.bestStreak || 0;
    }
    if (UIElements.statAvgTime) {
      UIElements.statAvgTime.textContent = (stats.avgTime || 0).toFixed(1) + "s";
    }

    // Build timeline recap with covers
    if (UIElements.timelineRecap) {
      UIElements.timelineRecap.innerHTML = "";
      const sorted = [...timeline].sort((a, b) => a.year - b.year);
      sorted.forEach(card => {
        const chip = document.createElement("span");
        chip.className = "recap-chip";
        let coverHtml = "";
        if (card.image) {
          coverHtml = `<img class="recap-cover" src="${card.image}" alt="" />`;
        }
        chip.innerHTML = `${coverHtml}<span class="recap-year">${card.year}</span>${card.title}`;
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

/* ===== PROGRESSIVE HINTS (easy mode) ===== */

let hintTimers = [];

export function startProgressiveHints(card) {
  clearProgressiveHints();
  if (!UIElements.hintEl) return;
  
  // Immediate: word count
  const wordCount = card.title ? card.title.split(" ").length : 0;
  UIElements.hintEl.textContent = `💡 ${wordCount} mot(s) dans le titre`;
  
  // After 5s: reveal artist
  hintTimers.push(setTimeout(() => {
    UIElements.hintEl.textContent = `💡 Artiste : ${card.artist}`;
    UIElements.hintEl.classList.add("hint-reveal");
    setTimeout(() => UIElements.hintEl.classList.remove("hint-reveal"), 500);
  }, 5000));
  
  // After 10s: reveal decade
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

/* ===== THEME PICKER ===== */

export function initThemePicker() {
  const picker = document.getElementById("theme-picker");
  if (!picker) return;
  
  // Restore saved theme
  const saved = localStorage.getItem("hitster_theme") || "synthwave";
  document.documentElement.setAttribute("data-theme", saved);
  picker.querySelectorAll(".theme-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.theme === saved);
  });
  
  picker.addEventListener("click", (e) => {
    const btn = e.target.closest(".theme-btn");
    if (!btn) return;
    const theme = btn.dataset.theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("hitster_theme", theme);
    picker.querySelectorAll(".theme-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
}
