import { shuffle } from './modules/utils.js';
import { AudioPlayer } from './modules/audio.js';
import { initBackgroundEffects, triggerConfetti, triggerStreakConfetti, triggerHeartLoss, triggerDamageEffect, playSuccessSound, playErrorSound, playComboSound } from './modules/effects.js';
import { initWaveform } from './modules/waveform.js';
import { UIElements, renderLives, renderTimeline, updateScoreUI, updateProgress, flashTimeline, updateStreakUI, showCoverArt, hideCoverArt, highlightCorrectPosition, moveFocusedDropZone, placeAtFocusedZone } from './modules/ui.js';
import { showGameOverModal } from './modules/modal.js';
import { startTimer, stopTimer } from './modules/timer.js';
import { startProgressiveHints, clearProgressiveHints } from './modules/hints.js';
import { initThemePicker } from './modules/theme.js';
import { saveGameState, clearGameState, tryRestoreState } from './modules/state.js';
import { setupDragAndDrop, setupKeyboard } from './modules/input.js';
import { showCountdown } from './modules/countdown.js';

let songs = [], timeline = [], currentCard = null;
let score = 0, highScore = parseInt(localStorage.getItem("hitster_high_score")) || 0;
let currentPlaylistId = localStorage.getItem("hitster_playlist_id");
let difficulty = "normal", lives = 3;
let totalSongs = 0, songsPlayed = 0;
let streak = 0, bestStreak = 0;
let correctPlacements = 0, totalAttempts = 0, cardStartTime = 0, totalCardTime = 0;
let gameActive = false;

const CHRONO_SECONDS = 15;
const player = new AudioPlayer(UIElements.audioEl, UIElements);
const dragInstruction = document.getElementById("drag-instruction");
const shortcutsHint = document.getElementById("shortcuts-hint");
const countdownOverlay = document.getElementById("countdown-overlay");
const countdownNumber = document.getElementById("countdown-number");
const gameArea = document.getElementById("game-area");

player.onError(() => {
  if (!gameActive) return;
  UIElements.messageEl.textContent = "⚠️ Audio indisponible, passage au suivant…";
  UIElements.messageEl.className = "error";
  setTimeout(() => nextCard(), 1500);
});

initWaveform(UIElements.audioEl);
initBackgroundEffects();
initThemePicker();

if (UIElements.startBtn) UIElements.startBtn.addEventListener("click", handleStartClick);
if (UIElements.btnNewPlaylist) UIElements.btnNewPlaylist.addEventListener("click", () => window.location.reload());

function setControlsEnabled(enabled) {
  const el = document.getElementById("playlist-select");
  if (!el) return;
  el.querySelectorAll("input, select, button").forEach(c => c.disabled = !enabled);
  el.style.opacity = enabled ? "1" : "0.4";
  if (UIElements.startBtn) UIElements.startBtn.textContent = enabled ? "Démarrer la partie" : "⏳ Partie en cours…";
}

setupDragAndDrop(UIElements.currentCardEl, dragInstruction);
setupKeyboard(player, moveFocusedDropZone, placeAtFocusedZone, () => gameActive);

async function loadSongs() {
  try {
    const res = await fetch(`assets/data/songs.json?v=${Date.now()}`);
    songs = shuffle(await res.json());
  } catch (e) {
    console.warn("Impossible de charger songs.json", e);
    songs = [];
  }
}

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
      try { result = JSON.parse(raw); }
      catch {
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
      if (!songs.length) {
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

  const diff = UIElements.difficultySelect?.value || "normal";
  await showCountdown(countdownOverlay, countdownNumber, gameArea, UIElements.timelineEl);
  startGame(diff);
}

function startGame(selectedDifficulty) {
  if (!songs.length) return;
  setControlsEnabled(false);
  shortcutsHint?.classList.add("visible");

  difficulty = selectedDifficulty;
  gameActive = true;
  streak = bestStreak = correctPlacements = totalAttempts = totalCardTime = 0;
  score = 0;
  updateStreakUI(0);

  if (difficulty === "hard") {
    lives = 1;
    if (UIElements.livesEl) UIElements.livesEl.style.display = "none";
  } else {
    lives = 3;
    if (UIElements.livesEl) { UIElements.livesEl.style.display = "block"; renderLives(lives); }
  }

  timeline = [];
  const first = songs.pop();
  if (first) timeline.push(first);

  totalSongs = songs.length + 1;
  songsPlayed = 1;

  updateScoreUI(score, highScore);
  updateProgress(songsPlayed, totalSongs);
  renderTimeline(timeline, (pos) => checkPlacement(pos));
  persist();
  nextCard();
}

function nextCard() {
  stopTimer();
  clearProgressiveHints();

  if (!songs.length) {
    player.pause();
    UIElements.currentCardEl?.setAttribute("draggable", "false");
    hideCoverArt();
    gameActive = false;
    setControlsEnabled(true);
    showGameOver(true);
    return;
  }

  currentCard = songs.pop();
  cardStartTime = Date.now();
  songsPlayed++;
  updateProgress(songsPlayed, totalSongs);

  if (UIElements.hintEl) UIElements.hintEl.textContent = "";
  if (difficulty === "easy") startProgressiveHints(currentCard);
  hideCoverArt();

  UIElements.currentCardEl?.setAttribute("draggable", "true");
  dragInstruction?.classList.add("visible");
  UIElements.messageEl.textContent = "❓ Place la carte dans la timeline";
  UIElements.messageEl.className = "";

  if (typeof currentCard.audio === "string" && currentCard.audio.startsWith("http")) {
    player.load(currentCard.audio);
    player.play().catch(() => {
      UIElements.messageEl.textContent = "🔇 Clique sur Démarrer pour autoriser l'audio";
    });
  } else {
    player.reset();
    UIElements.messageEl.textContent = "⚠️ Aucun extrait audio.";
  }

  if (difficulty === "chrono") {
    startTimer(CHRONO_SECONDS, () => {
      flashTimeline("error");
      playErrorSound();
      handleIncorrect();
    });
  }

  persist();
}

function checkPlacement(position) {
  if (!gameActive || !currentCard) return;

  const left = timeline[position - 1];
  const right = timeline[position];
  const isCorrect = (!left || currentCard.year >= left.year) && (!right || currentCard.year <= right.year);

  totalAttempts++;
  totalCardTime += (Date.now() - cardStartTime) / 1000;

  if (isCorrect) {
    correctPlacements++;
    streak++;
    if (streak > bestStreak) bestStreak = streak;

    // Score multiplié par le combo (cap ×5)
    const multiplier = Math.min(1 + Math.floor(streak / 3), 5);
    score += multiplier;
    if (score > highScore) { highScore = score; localStorage.setItem("hitster_high_score", highScore); }

    updateScoreUI(score, highScore);
    updateStreakUI(streak);
    UIElements.currentCardEl?.setAttribute("draggable", "false");
    dragInstruction?.classList.remove("visible");

    timeline.splice(position, 0, currentCard);

    UIElements.messageEl.textContent = streak >= 3 ? `✅ Bien placé ! 🔥 Combo ×${multiplier}` : "✅ Bien placé !";
    UIElements.messageEl.className = "success";

    playSuccessSound();
    if (streak >= 3) { triggerStreakConfetti(streak); playComboSound(streak); }
    else triggerConfetti();
    flashTimeline("success");

    stopTimer();
    clearProgressiveHints();
    showCoverArt(currentCard.image);
    renderTimeline(timeline, (pos) => checkPlacement(pos), position);
    setTimeout(() => { hideCoverArt(); nextCard(); }, 1200);
  } else {
    streak = 0;
    updateStreakUI(0);
    flashTimeline("error");
    playErrorSound();
    dragInstruction?.classList.remove("visible");
    document.body.classList.remove("is-dragging");
    highlightCorrectPosition(timeline, currentCard);
    showCoverArt(currentCard.image);
    stopTimer();
    clearProgressiveHints();
    handleIncorrect();
  }
}

function handleIncorrect() {
  if (difficulty === "hard") { endGame(); return; }

  lives--;
  triggerHeartLoss(UIElements.livesEl);
  triggerDamageEffect();

  if (lives <= 0) { endGame(); return; }

  UIElements.messageEl.textContent = `❌ Raté ! C'était en ${currentCard.year}. Restant : ${lives}`;
  UIElements.messageEl.className = "error";
  player.fadeOut().then(() => {
    setTimeout(() => {
      if (difficulty !== "hard") renderLives(lives);
      nextCard();
    }, 1500);
  });
}

function endGame() {
  gameActive = false;
  player.fadeOut();
  stopTimer();
  clearProgressiveHints();
  hideCoverArt();
  dragInstruction?.classList.remove("visible");
  shortcutsHint?.classList.remove("visible");
  document.body.classList.remove("is-dragging");
  document.querySelectorAll(".drop-zone").forEach(z => z.classList.add("disabled"));
  setControlsEnabled(true);
  clearGameState();
  showGameOver(false);
}

function showGameOver(isVictory) {
  const stats = {
    accuracy: totalAttempts > 0 ? Math.round((correctPlacements / totalAttempts) * 100) : 0,
    bestStreak,
    avgTime: totalAttempts > 0 ? totalCardTime / totalAttempts : 0
  };
  clearGameState();
  showGameOverModal(isVictory, score, currentCard, currentPlaylistId, difficulty, async (newDiff) => {
    if (UIElements.difficultySelect) UIElements.difficultySelect.value = newDiff;
    await loadSongs();
    await showCountdown(countdownOverlay, countdownNumber, gameArea, UIElements.timelineEl);
    startGame(newDiff);
  }, timeline, stats);
}

function persist() {
  saveGameState({
    songs, timeline, currentCard, score, highScore, difficulty, lives,
    totalSongs, songsPlayed, streak, bestStreak, correctPlacements,
    totalAttempts, totalCardTime, currentPlaylistId, gameActive
  });
}

// Restauration d'une partie sauvegardée au chargement
(function tryRestore() {
  const s = tryRestoreState();
  if (!s || !s.currentCard || !s.timeline?.length) {
    clearGameState();
    return;
  }

  try {
    songs = s.songs || [];
    timeline = s.timeline || [];
    currentCard = s.currentCard;
    score = s.score || 0;
    highScore = s.highScore || highScore;
    difficulty = s.difficulty || "normal";
    lives = s.lives || 3;
    totalSongs = s.totalSongs || 0;
    songsPlayed = s.songsPlayed || 0;
    streak = s.streak || 0;
    bestStreak = s.bestStreak || 0;
    correctPlacements = s.correctPlacements || 0;
    totalAttempts = s.totalAttempts || 0;
    totalCardTime = s.totalCardTime || 0;
    currentPlaylistId = s.currentPlaylistId || null;
    gameActive = true;

    setControlsEnabled(false);
    shortcutsHint?.classList.add("visible");

    updateScoreUI(score, highScore);
    updateStreakUI(streak);
    updateProgress(songsPlayed, totalSongs);

    if (difficulty === "hard") {
      if (UIElements.livesEl) UIElements.livesEl.style.display = "none";
    } else if (UIElements.livesEl) {
      UIElements.livesEl.style.display = "block";
      renderLives(lives);
    }

    renderTimeline(timeline, (pos) => checkPlacement(pos));
    gameArea?.classList.add("active");
    UIElements.timelineEl.classList.add("active");

    cardStartTime = Date.now();
    hideCoverArt();
    UIElements.currentCardEl?.setAttribute("draggable", "true");
    dragInstruction?.classList.add("visible");
    UIElements.messageEl.textContent = "🔄 Partie restaurée ! Place la carte dans la timeline";

    if (difficulty === "easy") startProgressiveHints(currentCard);
    if (typeof currentCard.audio === "string" && currentCard.audio.startsWith("http")) {
      player.load(currentCard.audio);
      player.play().catch(() => {});
    }
    if (difficulty === "chrono") {
      startTimer(CHRONO_SECONDS, () => { flashTimeline("error"); playErrorSound(); handleIncorrect(); });
    }
  } catch (e) {
    console.warn("Restauration échouée, reset", e);
    clearGameState();
    window.location.reload();
  }
})();
