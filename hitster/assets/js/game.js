import { shuffle } from './modules/utils.js';
import { AudioPlayer } from './modules/audio.js';
import { initBackgroundEffects, triggerConfetti, triggerHeartLoss, triggerDamageEffect } from './modules/effects.js';
import { UIElements, renderLives, renderTimeline, updateScoreUI, showGameOverModal } from './modules/ui.js';

// --- State ---
let songs = [];
let timeline = [];
let currentCard = null;
let score = 0;
let highScore = parseInt(localStorage.getItem("hitster_high_score")) || 0;
let currentPlaylistId = localStorage.getItem("hitster_playlist_id");
let difficulty = "normal";
let lives = 3;

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

if (UIElements.currentCardEl) {
    UIElements.currentCardEl.ondragstart = (e) => {
        e.dataTransfer.setData("text/plain", "card");
        e.dataTransfer.effectAllowed = "move";
        UIElements.currentCardEl.classList.add("dragging");
    };
    UIElements.currentCardEl.ondragend = () => {
        UIElements.currentCardEl.classList.remove("dragging");
    };
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
             return;
        }

        if (!result.ok) {
        UIElements.messageEl.textContent = `❌ ${result.error || "Import échoué"}`;
        return;
        }

        if (result.playlistId) {
        currentPlaylistId = result.playlistId;
        localStorage.setItem("hitster_playlist_id", currentPlaylistId);
        }

        await loadSongs();

        if (songs.length === 0) {
        UIElements.messageEl.textContent = "⚠️ Aucun extrait audio trouvé.";
        return;
        }
        UIElements.messageEl.textContent = `✅ Playlist importée (${songs.length} morceaux)`;
    } catch (e) {
        console.error(e);
        UIElements.messageEl.textContent = "❌ Erreur import.";
        return;
    }
  }

  startGame(UIElements.difficultySelect ? UIElements.difficultySelect.value : "normal");
}

function startGame(selectedDifficulty) {
  if (songs.length === 0) return;

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

  score = 0;
  updateScoreUI(score, highScore);
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

  if (UIElements.hintEl) UIElements.hintEl.textContent = "";

  if (difficulty === "easy" && UIElements.hintEl) {
    const wordCount = currentCard.title ? currentCard.title.split(" ").length : 0;
    UIElements.hintEl.textContent = `💡 ${wordCount} mot(s) dans le titre`;
  }

  if (UIElements.currentCardEl) UIElements.currentCardEl.setAttribute("draggable", "true");

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

    UIElements.messageEl.textContent = "✅ Bien placé !";
    UIElements.messageEl.className = "success";
    
    triggerConfetti();
    renderTimeline(timeline, (pos) => checkPlacement(pos));
    
    nextCard();
  } else {
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
    document.querySelectorAll(".drop-zone").forEach(z => z.classList.add("disabled"));
    showGameOver(false);
}

function showGameOver(isVictory) {
    showGameOverModal(isVictory, score, currentCard, currentPlaylistId, difficulty, async (newDiff) => {
        // Restart logic
        if (UIElements.difficultySelect) UIElements.difficultySelect.value = newDiff;
        await loadSongs();
        startGame(newDiff);
    });
}
