import { shuffle } from './modules/utils.js';
import { AudioPlayer } from './modules/audio.js';
import { initBackgroundEffects, triggerConfetti, triggerHeartLoss, triggerDamageEffect } from './modules/effects.js';
import { UIElements, renderLives, renderTimeline, updateScoreUI, updateProgress, flashTimeline, showGameOverModal } from './modules/ui.js';

// --- State ---
let songs = [];
let timeline = [];
let currentCard = null;
let score = 0;
let highScore = parseInt(localStorage.getItem("hitster_high_score")) || 0;
let currentPlaylistId = localStorage.getItem("hitster_playlist_id");
let difficulty = "normal";
let lives = 3;
let totalSongs = 0;
let songsPlayed = 0;

// --- Init Player ---
const player = new AudioPlayer(UIElements.audioEl, UIElements);

// --- Init Effects ---
initBackgroundEffects();

// --- Event Listeners ---
if (UIElements.startBtn) {
    UIElements.startBtn.addEventListener("click", handleStartClick);
}

if (UIElements.btnNewPlaylist) {
    UIElements.btnNewPlaylist.addEventListener("click", () => window.location.reload());
}

const dragInstruction = document.getElementById("drag-instruction");

if (UIElements.currentCardEl) {
    // --- Desktop drag ---
    UIElements.currentCardEl.ondragstart = (e) => {
        e.dataTransfer.setData("text/plain", "card");
        e.dataTransfer.effectAllowed = "move";
        UIElements.currentCardEl.classList.add("dragging");
        document.body.classList.add("is-dragging");
        if (dragInstruction) dragInstruction.classList.remove("visible");
    };
    UIElements.currentCardEl.ondragend = () => {
        UIElements.currentCardEl.classList.remove("dragging");
        document.body.classList.remove("is-dragging");
    };

    // --- Mobile touch drag ---
    let touchActive = false;
    UIElements.currentCardEl.addEventListener("touchstart", (e) => {
        if (UIElements.currentCardEl.getAttribute("draggable") !== "true") return;
        touchActive = true;
        UIElements.currentCardEl.classList.add("dragging");
        document.body.classList.add("is-dragging");
        if (dragInstruction) dragInstruction.classList.remove("visible");
    }, { passive: true });

    UIElements.currentCardEl.addEventListener("touchmove", (e) => {
        if (!touchActive) return;
        e.preventDefault();
        const touch = e.touches[0];
        // Highlight the drop zone under the finger
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        document.querySelectorAll(".drop-zone.touch-hover").forEach(z => z.classList.remove("touch-hover"));
        if (el && el.classList.contains("drop-zone")) {
            el.classList.add("touch-hover");
        }
    }, { passive: false });

    UIElements.currentCardEl.addEventListener("touchend", (e) => {
        if (!touchActive) return;
        touchActive = false;
        UIElements.currentCardEl.classList.remove("dragging");
        document.body.classList.remove("is-dragging");
        // Find which drop zone we ended on
        const touch = e.changedTouches[0];
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        document.querySelectorAll(".drop-zone.touch-hover").forEach(z => z.classList.remove("touch-hover"));
        if (el && el.classList.contains("drop-zone")) {
            el.click(); // Trigger the placement
        }
    });
}

// --- Logic ---

async function loadSongs() {
  const ts = Date.now();
  const res = await fetch(`assets/data/songs.json?v=${ts}`);
  const data = await res.json();
  console.log("SONGS RELOADED:", data.length);
  songs = shuffle(data);
}

// Initial load
loadSongs();

async function handleStartClick() {
  UIElements.startBtn.disabled = true;
  UIElements.startBtn.textContent = "⏳ Préparation...";
  const url = UIElements.playlistInput.value.trim();

  if (url) {
    UIElements.messageEl.textContent = "⏳ Import de la playlist...";

    try {
        const resp = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistUrl: url }),
        });

        const raw = await resp.text();
        let result;
        try {
            result = JSON.parse(raw);
        } catch {
             UIElements.messageEl.textContent = "❌ Le serveur ne renvoie pas du JSON.";
             UIElements.startBtn.disabled = false;
             UIElements.startBtn.textContent = "Démarrer la partie";
             return;
        }

        if (!result.ok) {
        UIElements.messageEl.textContent = `❌ ${result.error || "Import échoué"}`;
        UIElements.startBtn.disabled = false;
        UIElements.startBtn.textContent = "Démarrer la partie";
        return;
        }

        if (result.playlistId) {
        currentPlaylistId = result.playlistId;
        localStorage.setItem("hitster_playlist_id", currentPlaylistId);
        }

        await loadSongs();

        if (songs.length === 0) {
        UIElements.messageEl.textContent = "⚠️ Aucun extrait audio trouvé.";
        UIElements.startBtn.disabled = false;
        UIElements.startBtn.textContent = "Démarrer la partie";
        return;
        }
        UIElements.messageEl.textContent = `✅ Playlist importée (${songs.length} morceaux)`;
    } catch (e) {
        console.error(e);
        UIElements.messageEl.textContent = "❌ Erreur import.";
        UIElements.startBtn.disabled = false;
        UIElements.startBtn.textContent = "Démarrer la partie";
        return;
    }
  }

  const diff = UIElements.difficultySelect ? UIElements.difficultySelect.value : "normal";
  await showCountdown();
  startGame(diff);
}

// --- Countdown animation ---
const countdownOverlay = document.getElementById("countdown-overlay");
const countdownNumber = document.getElementById("countdown-number");
const gameArea = document.getElementById("game-area");

function showCountdown() {
  return new Promise((resolve) => {
    if (!countdownOverlay || !countdownNumber) { resolve(); return; }

    // Hide game area during countdown
    if (gameArea) gameArea.classList.remove("active");
    UIElements.timelineEl.classList.remove("active");

    countdownOverlay.classList.remove("hidden");
    const steps = ["3", "2", "1", "🎵"];
    let i = 0;

    function showNext() {
      if (i >= steps.length) {
        // Fade out overlay
        countdownOverlay.style.opacity = "0";
        countdownOverlay.style.transition = "opacity 0.3s ease";
        setTimeout(() => {
          countdownOverlay.classList.add("hidden");
          countdownOverlay.style.opacity = "";
          countdownOverlay.style.transition = "";
          // Reveal game area with staggered animation
          if (gameArea) gameArea.classList.add("active");
          setTimeout(() => UIElements.timelineEl.classList.add("active"), 100);
          resolve();
        }, 300);
        return;
      }
      countdownNumber.textContent = steps[i];
      // Re-trigger pop animation
      countdownNumber.style.animation = "none";
      // eslint-disable-next-line no-unused-expressions
      countdownNumber.offsetHeight; // force reflow
      countdownNumber.style.animation = "";
      i++;
      setTimeout(showNext, 650);
    }

    showNext();
  });
}

function startGame(selectedDifficulty) {
  if (songs.length === 0) return;

  // Hide setup, show game
  const playlistSelect = document.getElementById("playlist-select");
  if (playlistSelect) playlistSelect.style.display = "none";

  difficulty = selectedDifficulty;

  if (difficulty === "hard") {
    lives = 1;
    if (UIElements.livesEl) UIElements.livesEl.style.display = "none";
  } else {
    lives = 3;
    if (UIElements.livesEl) {
      UIElements.livesEl.style.display = "block";
      renderLives(lives);
    }
  }

  timeline = [];
  const firstCard = songs.pop();
  if(firstCard) timeline.push(firstCard);

  totalSongs = songs.length + 1;
  songsPlayed = 1;

  score = 0;
  updateScoreUI(score, highScore);
  updateProgress(songsPlayed, totalSongs);
  renderTimeline(timeline, (pos) => checkPlacement(pos));
  
  nextCard();
}

function nextCard() {
  if (songs.length === 0) {
    player.pause();
    if (UIElements.currentCardEl) UIElements.currentCardEl.setAttribute("draggable", "false");
    showGameOver(true);
    return;
  }

  currentCard = songs.pop();

  songsPlayed++;
  updateProgress(songsPlayed, totalSongs);

  if (UIElements.hintEl) UIElements.hintEl.textContent = "";

  if (difficulty === "easy" && UIElements.hintEl) {
    const wordCount = currentCard.title ? currentCard.title.split(" ").length : 0;
    UIElements.hintEl.textContent = `💡 ${wordCount} mot(s) dans le titre`;
  }

  if (UIElements.currentCardEl) UIElements.currentCardEl.setAttribute("draggable", "true");
  if (dragInstruction) dragInstruction.classList.add("visible");

  UIElements.messageEl.textContent = "❓ Place la carte dans la timeline";
  
  // Audio Playback
  if (typeof currentCard.audio === "string" && currentCard.audio.startsWith("http")) {
      player.load(currentCard.audio);
      player.play().catch(() => {
          UIElements.messageEl.textContent = "🔇 Clique sur Démarrer pour autoriser la lecture audio";
      });
  } else {
      player.reset();
      UIElements.messageEl.textContent = "⚠️ Aucun extrait audio.";
  }
}

function checkPlacement(position) {
  const left = timeline[position - 1];
  const right = timeline[position];
  const year = currentCard.year;

  const isCorrect = (!left || year >= left.year) && (!right || year <= right.year);

  if (isCorrect) {
    timeline.splice(position, 0, currentCard);
    score++;
    
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("hitster_high_score", highScore);
    }
    updateScoreUI(score, highScore);

    if (UIElements.currentCardEl) UIElements.currentCardEl.setAttribute("draggable", "false");
    if (dragInstruction) dragInstruction.classList.remove("visible");

    UIElements.messageEl.textContent = "✅ Bien placé !";
    UIElements.messageEl.className = "success";
    
    triggerConfetti();
    flashTimeline("success");
    renderTimeline(timeline, (pos) => checkPlacement(pos), position);
    
    nextCard();
  } else {
     flashTimeline("error");
     if (dragInstruction) dragInstruction.classList.remove("visible");
     document.body.classList.remove("is-dragging");
     handleIncorrect();
  }
}

function handleIncorrect() {
    if (difficulty === "hard") {
        endGame();
    } else {
        lives--;
        triggerHeartLoss(UIElements.livesEl);
        triggerDamageEffect();

        if (lives > 0) {
            UIElements.messageEl.textContent = `❌ Raté ! C'était en ${currentCard.year}. Restant : ${lives}`;
            UIElements.messageEl.className = "error";
            player.pause();
            setTimeout(() => {
                if (difficulty !== "hard") renderLives(lives);
                nextCard();
            }, 1500);
        } else {
            endGame();
        }
    }
}

function endGame() {
    player.pause();
    if (dragInstruction) dragInstruction.classList.remove("visible");
    document.body.classList.remove("is-dragging");
    document.querySelectorAll(".drop-zone").forEach(z => z.classList.add("disabled"));
    showGameOver(false);
}

function showGameOver(isVictory) {
    showGameOverModal(isVictory, score, currentCard, currentPlaylistId, difficulty, async (newDiff) => {
        // Restart logic
        if (UIElements.difficultySelect) UIElements.difficultySelect.value = newDiff;
        await loadSongs();
        await showCountdown();
        startGame(newDiff);
    }, timeline);
}
