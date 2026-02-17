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
  progressTracker: document.getElementById("progress-tracker"),
  songCounter: document.getElementById("song-counter"),
  songProgress: document.getElementById("song-progress"),
  playPauseBtn: document.getElementById("play-pause-btn"),
  progressBar: document.getElementById("progress-bar"),
  progressContainer: document.getElementById("progress-container"),
  timeDisplay: document.getElementById("time-display"),
  audioLoader: document.getElementById("audio-loading"),
  audioEl: document.getElementById("audio"),
  cardCover: document.getElementById("card-cover"),
  cardCoverImg: document.getElementById("card-cover-img"),
  streakDisplay: document.getElementById("streak-display"),
  streakCount: document.getElementById("streak-count"),
  streakMultiplier: document.getElementById("streak-multiplier"),
  timerBarContainer: document.getElementById("timer-bar-container"),
  timerBar: document.getElementById("timer-bar"),
  timerText: document.getElementById("timer-text"),
  statAccuracy: document.getElementById("stat-accuracy"),
  statBestStreak: document.getElementById("stat-best-streak"),
  statAvgTime: document.getElementById("stat-avg-time"),
  modalStats: document.getElementById("modal-stats")
};

let focusedDropIndex = -1;
let _currentDropCallback = null;

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

export function updateStreakUI(streak) {
  if (!UIElements.streakDisplay) return;
  if (streak >= 2) {
    UIElements.streakDisplay.classList.remove("hidden");
    UIElements.streakCount.textContent = `🔥 ${streak}`;
    const mult = Math.min(1 + Math.floor(streak / 3), 5);
    UIElements.streakMultiplier.textContent = `×${mult}`;
    UIElements.streakMultiplier.className = `streak-multiplier streak-x${Math.min(mult, 5)}`;
    // Force reflow pour relancer l'animation CSS
    UIElements.streakDisplay.classList.remove("streak-pop");
    void UIElements.streakDisplay.offsetHeight;
    UIElements.streakDisplay.classList.add("streak-pop");
  } else {
    UIElements.streakDisplay.classList.add("hidden");
  }
}

export function showCoverArt(url) {
  if (!UIElements.cardCover || !UIElements.cardCoverImg) return;
  if (url) {
    UIElements.cardCoverImg.src = url;
    UIElements.cardCover.classList.remove("hidden");
  } else {
    UIElements.cardCover.classList.add("hidden");
  }
}

export function hideCoverArt() {
  if (UIElements.cardCover) UIElements.cardCover.classList.add("hidden");
}

export function updateProgress(current, total) {
  if (!UIElements.progressTracker) return;
  UIElements.progressTracker.classList.remove("hidden");
  if (UIElements.songCounter) UIElements.songCounter.textContent = `${current} / ${total}`;
  if (UIElements.songProgress) {
    UIElements.songProgress.style.width = (total > 0 ? (current / total) * 100 : 0) + "%";
  }
}

export function renderTimeline(timeline, onDropCallback, newIndex = -1) {
  UIElements.timelineEl.innerHTML = "";
  _currentDropCallback = onDropCallback;
  focusedDropIndex = -1;

  addDropZone(0, onDropCallback);

  timeline.forEach((card, index) => {
    const div = document.createElement("div");
    div.className = "timeline-card";

    if (index === newIndex) {
      div.classList.add("slide-in", "correct-flash");
      setTimeout(() => div.classList.remove("slide-in", "correct-flash"), 900);
    }

    const cover = card.image
      ? `<img class="timeline-card-cover" src="${card.image}" alt="" loading="lazy" />`
      : "";

    div.innerHTML = `
      ${cover}
      <div class="year">${card.year}</div>
      <div class="title">${card.title}</div>
      <div class="artist">${card.artist}</div>
    `;

    UIElements.timelineEl.appendChild(div);
    addDropZone(index + 1, onDropCallback);
  });

  if (newIndex >= 0 && window.innerWidth <= 768) {
    const cards = UIElements.timelineEl.querySelectorAll(".timeline-card");
    if (cards[newIndex]) {
      setTimeout(() => cards[newIndex].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }), 100);
    }
  }
}

export function highlightCorrectPosition(timeline, currentCard) {
  let correctPos = 0;
  for (let i = 0; i < timeline.length; i++) {
    if (currentCard.year >= timeline[i].year) correctPos = i + 1;
  }
  const zones = UIElements.timelineEl.querySelectorAll(".drop-zone");
  if (zones[correctPos]) {
    zones[correctPos].classList.add("correct-position-hint");
    setTimeout(() => zones[correctPos].classList.remove("correct-position-hint"), 2000);
  }
}

function addDropZone(position, cb) {
  const zone = document.createElement("div");
  zone.className = "drop-zone";
  zone.textContent = "+";
  zone.setAttribute("data-position", position);
  zone.onclick = () => cb(position);
  zone.ondragover = (e) => { e.preventDefault(); zone.classList.add("drag-over"); e.dataTransfer.dropEffect = "move"; };
  zone.ondragleave = () => zone.classList.remove("drag-over");
  zone.ondrop = (e) => { e.preventDefault(); zone.classList.remove("drag-over"); cb(position); };
  UIElements.timelineEl.appendChild(zone);
}

export function flashTimeline(type) {
  const cls = type === "success" ? "success-pulse" : "error-shake";
  UIElements.timelineEl.classList.add(cls);
  setTimeout(() => UIElements.timelineEl.classList.remove(cls), 800);
}

// Navigation clavier entre les drop zones (wrap-around)
export function moveFocusedDropZone(direction) {
  const zones = UIElements.timelineEl.querySelectorAll(".drop-zone");
  if (!zones.length) return;
  zones.forEach(z => z.classList.remove("keyboard-focus"));
  focusedDropIndex += direction;
  if (focusedDropIndex < 0) focusedDropIndex = zones.length - 1;
  if (focusedDropIndex >= zones.length) focusedDropIndex = 0;
  zones[focusedDropIndex].classList.add("keyboard-focus");
  zones[focusedDropIndex].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
}

export function placeAtFocusedZone() {
  if (focusedDropIndex < 0 || !_currentDropCallback) return false;
  const zones = UIElements.timelineEl.querySelectorAll(".drop-zone");
  if (zones[focusedDropIndex]) { zones[focusedDropIndex].click(); return true; }
  return false;
}
