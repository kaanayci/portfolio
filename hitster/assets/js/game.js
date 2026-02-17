import { shuffle } from './modules/utils.js';
import { AudioPlayer } from './modules/audio.js';
import { initBackgroundEffects, triggerConfetti, triggerStreakConfetti, triggerHeartLoss, triggerDamageEffect, playSuccessSound, playErrorSound, playComboSound } from './modules/effects.js';
import { initWaveform } from './modules/waveform.js';
import {
  UIElements, renderLives, renderTimeline, updateScoreUI, updateProgress,
  flashTimeline, showGameOverModal, updateStreakUI, showCoverArt, hideCoverArt,
  highlightCorrectPosition, startTimer, stopTimer, startProgressiveHints,
  clearProgressiveHints, moveFocusedDropZone, placeAtFocusedZone, initThemePicker
} from './modules/ui.js';

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

// Streak / Combo
let streak = 0;
let bestStreak = 0;

// Stats
let correctPlacements = 0;
let totalAttempts = 0;
let cardStartTime = 0;
let totalCardTime = 0;

// Game state flag
let gameActive = false;

// Chrono mode
const CHRONO_SECONDS = 15;

// --- Init Player ---
const player = new AudioPlayer(UIElements.audioEl, UIElements);

// Audio error handler: skip to next card
player.onError(() => {
  if (!gameActive) return;
  UIElements.messageEl.textContent = "⚠️ Audio indisponible, passage au morceau suivant…";
  UIElements.messageEl.className = "error";
  setTimeout(() => nextCard(), 1500);
});

// --- Init Waveform (desktop only) ---
initWaveform(UIElements.audioEl);

// --- Init Effects ---
initBackgroundEffects();

// --- Init Theme Picker ---
initThemePicker();

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
        const touch = e.changedTouches[0];
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        document.querySelectorAll(".drop-zone.touch-hover").forEach(z => z.classList.remove("touch-hover"));
        if (el && el.classList.contains("drop-zone")) {
            el.click();
        }
    });
}

// --- Keyboard Shortcuts ---
document.addEventListener("keydown", (e) => {
  if (!gameActive) return;
  // Ignore if typing in input
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

// Show shortcuts hint during game
const shortcutsHint = document.getElementById("shortcuts-hint");

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

    if (gameArea) gameArea.classList.remove("active");
    UIElements.timelineEl.classList.remove("active");

    countdownOverlay.classList.remove("hidden");
    const steps = ["3", "2", "1", "🎵"];
    let i = 0;

    function showNext() {
      if (i >= steps.length) {
        countdownOverlay.style.opacity = "0";
        countdownOverlay.style.transition = "opacity 0.3s ease";
        setTimeout(() => {
          countdownOverlay.classList.add("hidden");
          countdownOverlay.style.opacity = "";
          countdownOverlay.style.transition = "";
          if (gameArea) gameArea.classList.add("active");
          setTimeout(() => UIElements.timelineEl.classList.add("active"), 100);
          resolve();
        }, 300);
        return;
      }
      countdownNumber.textContent = steps[i];
      countdownNumber.style.animation = "none";
      void countdownNumber.offsetHeight;
      countdownNumber.style.animation = "";
      i++;
      setTimeout(showNext, 650);
    }

    showNext();
  });
}

function startGame(selectedDifficulty) {
  if (songs.length === 0) return;

  const playlistSelect = document.getElementById("playlist-select");
  if (playlistSelect) playlistSelect.style.display = "none";

  // Show keyboard shortcuts hint
  if (shortcutsHint) shortcutsHint.classList.add("visible");

  difficulty = selectedDifficulty;
  gameActive = true;

  // Reset stats
  streak = 0;
  bestStreak = 0;
  correctPlacements = 0;
  totalAttempts = 0;
  totalCardTime = 0;
  updateStreakUI(0);

  if (difficulty === "hard") {
    lives = 1;
    if (UIElements.livesEl) UIElements.livesEl.style.display = "none";
  } else if (difficulty === "chrono") {
    lives = 3;
    if (UIElements.livesEl) {
      UIElements.livesEl.style.display = "block";
      renderLives(lives);
    }
  } else {
    lives = 3;
    if (UIElements.livesEl) {
      UIElements.livesEl.style.display = "block";
      renderLives(lives);
    }
  }

  timeline = [];
  const firstCard = songs.pop();
  if (firstCard) timeline.push(firstCard);

  totalSongs = songs.length + 1;
  songsPlayed = 1;

  score = 0;
  updateScoreUI(score, highScore);
  updateProgress(songsPlayed, totalSongs);
  renderTimeline(timeline, (pos) => checkPlacement(pos));
  
  // Save game state
  saveGameState();
  
  nextCard();
}

function nextCard() {
  stopTimer();
  clearProgressiveHints();
  
  if (songs.length === 0) {
    player.pause();
    if (UIElements.currentCardEl) UIElements.currentCardEl.setAttribute("draggable", "false");
    hideCoverArt();
    gameActive = false;
    showGameOver(true);
    return;
  }

  currentCard = songs.pop();
  cardStartTime = Date.now();

  songsPlayed++;
  updateProgress(songsPlayed, totalSongs);

  if (UIElements.hintEl) UIElements.hintEl.textContent = "";

  // Progressive hints in easy mode
  if (difficulty === "easy") {
    startProgressiveHints(currentCard);
  }

  // Hide cover art while guessing – it will be revealed once placed
  hideCoverArt();

  if (UIElements.currentCardEl) UIElements.currentCardEl.setAttribute("draggable", "true");
  if (dragInstruction) dragInstruction.classList.add("visible");

  UIElements.messageEl.textContent = "❓ Place la carte dans la timeline";
  UIElements.messageEl.className = "";
  
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

  // Start timer in chrono mode
  if (difficulty === "chrono") {
    startTimer(CHRONO_SECONDS, () => {
      // Time expired = wrong answer
      flashTimeline("error");
      playErrorSound();
      handleIncorrect();
    });
  }

  // Save state
  saveGameState();
}

function checkPlacement(position) {
  if (!gameActive || !currentCard) return;
  
  const left = timeline[position - 1];
  const right = timeline[position];
  const year = currentCard.year;

  const isCorrect = (!left || year >= left.year) && (!right || year <= right.year);
  
  totalAttempts++;
  const cardTime = (Date.now() - cardStartTime) / 1000;
  totalCardTime += cardTime;

  if (isCorrect) {
    correctPlacements++;
    streak++;
    if (streak > bestStreak) bestStreak = streak;
    
    // Score with streak multiplier
    const multiplier = Math.min(1 + Math.floor(streak / 3), 5);
    score += multiplier;
    
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("hitster_high_score", highScore);
    }
    updateScoreUI(score, highScore);
    updateStreakUI(streak);

    if (UIElements.currentCardEl) UIElements.currentCardEl.setAttribute("draggable", "false");
    if (dragInstruction) dragInstruction.classList.remove("visible");

    timeline.splice(position, 0, currentCard);

    if (streak >= 3) {
      UIElements.messageEl.textContent = `✅ Bien placé ! 🔥 Combo ×${multiplier}`;
    } else {
      UIElements.messageEl.textContent = "✅ Bien placé !";
    }
    UIElements.messageEl.className = "success";
    
    // Effects
    playSuccessSound();
    if (streak >= 3) {
      triggerStreakConfetti(streak);
      playComboSound(streak);
    } else {
      triggerConfetti();
    }
    flashTimeline("success");
    
    stopTimer();
    clearProgressiveHints();
    
    // Reveal the cover art now that the card is placed
    showCoverArt(currentCard.image);
    
    renderTimeline(timeline, (pos) => checkPlacement(pos), position);
    
    // Brief pause so the player can see the cover before next card
    setTimeout(() => {
      hideCoverArt();
      nextCard();
    }, 1200);
  } else {
    streak = 0;
    updateStreakUI(0);
    flashTimeline("error");
    playErrorSound();
    if (dragInstruction) dragInstruction.classList.remove("visible");
    document.body.classList.remove("is-dragging");
    
    // Show correct position
    highlightCorrectPosition(timeline, currentCard);
    
    // Reveal cover art as part of the answer
    showCoverArt(currentCard.image);
    
    stopTimer();
    clearProgressiveHints();
    
    handleIncorrect();
  }
}

function handleIncorrect() {
    if (difficulty === "hard") {
        endGame();
    } else if (difficulty === "chrono") {
        lives--;
        triggerHeartLoss(UIElements.livesEl);
        triggerDamageEffect();

        if (lives > 0) {
            UIElements.messageEl.textContent = `❌ Raté ! C'était en ${currentCard.year}. Restant : ${lives}`;
            UIElements.messageEl.className = "error";
            player.fadeOut().then(() => {
                setTimeout(() => {
                    renderLives(lives);
                    nextCard();
                }, 1500);
            });
        } else {
            endGame();
        }
    } else {
        lives--;
        triggerHeartLoss(UIElements.livesEl);
        triggerDamageEffect();

        if (lives > 0) {
            UIElements.messageEl.textContent = `❌ Raté ! C'était en ${currentCard.year}. Restant : ${lives}`;
            UIElements.messageEl.className = "error";
            player.fadeOut().then(() => {
                setTimeout(() => {
                    if (difficulty !== "hard") renderLives(lives);
                    nextCard();
                }, 1500);
            });
        } else {
            endGame();
        }
    }
}

function endGame() {
    gameActive = false;
    player.fadeOut();
    stopTimer();
    clearProgressiveHints();
    hideCoverArt();
    if (dragInstruction) dragInstruction.classList.remove("visible");
    if (shortcutsHint) shortcutsHint.classList.remove("visible");
    document.body.classList.remove("is-dragging");
    document.querySelectorAll(".drop-zone").forEach(z => z.classList.add("disabled"));
    clearGameState();
    showGameOver(false);
}

function showGameOver(isVictory) {
    const stats = {
      accuracy: totalAttempts > 0 ? Math.round((correctPlacements / totalAttempts) * 100) : 0,
      bestStreak: bestStreak,
      avgTime: totalAttempts > 0 ? totalCardTime / totalAttempts : 0
    };
    
    clearGameState();
    
    showGameOverModal(isVictory, score, currentCard, currentPlaylistId, difficulty, async (newDiff) => {
        if (UIElements.difficultySelect) UIElements.difficultySelect.value = newDiff;
        await loadSongs();
        await showCountdown();
        startGame(newDiff);
    }, timeline, stats);
}

/* ===== GAME STATE PERSISTENCE (localStorage) ===== */

function saveGameState() {
  const state = {
    songs: songs,
    timeline: timeline,
    currentCard: currentCard,
    score: score,
    highScore: highScore,
    difficulty: difficulty,
    lives: lives,
    totalSongs: totalSongs,
    songsPlayed: songsPlayed,
    streak: streak,
    bestStreak: bestStreak,
    correctPlacements: correctPlacements,
    totalAttempts: totalAttempts,
    totalCardTime: totalCardTime,
    currentPlaylistId: currentPlaylistId,
    gameActive: gameActive,
    timestamp: Date.now()
  };
  try {
    localStorage.setItem("hitster_game_state", JSON.stringify(state));
  } catch (e) { /* storage full, ignore */ }
}

function clearGameState() {
  localStorage.removeItem("hitster_game_state");
}

function tryRestoreGame() {
  try {
    const raw = localStorage.getItem("hitster_game_state");
    if (!raw) return false;
    const state = JSON.parse(raw);
    
    // Expire after 2 hours
    if (Date.now() - state.timestamp > 2 * 60 * 60 * 1000) {
      clearGameState();
      return false;
    }
    
    if (!state.gameActive || !state.currentCard) {
      clearGameState();
      return false;
    }
    
    // Restore state
    songs = state.songs || [];
    timeline = state.timeline || [];
    currentCard = state.currentCard;
    score = state.score || 0;
    highScore = state.highScore || highScore;
    difficulty = state.difficulty || "normal";
    lives = state.lives || 3;
    totalSongs = state.totalSongs || 0;
    songsPlayed = state.songsPlayed || 0;
    streak = state.streak || 0;
    bestStreak = state.bestStreak || 0;
    correctPlacements = state.correctPlacements || 0;
    totalAttempts = state.totalAttempts || 0;
    totalCardTime = state.totalCardTime || 0;
    currentPlaylistId = state.currentPlaylistId || null;
    gameActive = true;
    
    // Rebuild UI
    const playlistSelect = document.getElementById("playlist-select");
    if (playlistSelect) playlistSelect.style.display = "none";
    if (shortcutsHint) shortcutsHint.classList.add("visible");
    
    updateScoreUI(score, highScore);
    updateStreakUI(streak);
    updateProgress(songsPlayed, totalSongs);
    
    if (difficulty === "hard") {
      if (UIElements.livesEl) UIElements.livesEl.style.display = "none";
    } else {
      if (UIElements.livesEl) {
        UIElements.livesEl.style.display = "block";
        renderLives(lives);
      }
    }
    
    renderTimeline(timeline, (pos) => checkPlacement(pos));
    
    // Show game area immediately
    if (gameArea) gameArea.classList.add("active");
    UIElements.timelineEl.classList.add("active");
    
    // Show current card
    cardStartTime = Date.now();
    hideCoverArt();
    
    if (UIElements.currentCardEl) UIElements.currentCardEl.setAttribute("draggable", "true");
    if (dragInstruction) dragInstruction.classList.add("visible");
    
    UIElements.messageEl.textContent = "🔄 Partie restaurée ! Place la carte dans la timeline";
    
    if (difficulty === "easy") {
      startProgressiveHints(currentCard);
    }
    
    if (typeof currentCard.audio === "string" && currentCard.audio.startsWith("http")) {
      player.load(currentCard.audio);
      player.play().catch(() => {});
    }
    
    if (difficulty === "chrono") {
      startTimer(CHRONO_SECONDS, () => {
        flashTimeline("error");
        playErrorSound();
        handleIncorrect();
      });
    }
    
    return true;
  } catch (e) {
    console.warn("Could not restore game state:", e);
    clearGameState();
    return false;
  }
}

// Try to restore a saved game on load
tryRestoreGame();
