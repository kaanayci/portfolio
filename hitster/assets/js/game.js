// Variables globales
let songs = [];
let timeline = [];
let currentCard = null;
let score = 0;
let highScore = parseInt(localStorage.getItem("hitster_high_score")) || 0;
let currentPlaylistId = localStorage.getItem("hitster_playlist_id");
let difficulty = "normal";
let lives = 3;

// Éléments DOM
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("high-score");
const livesEl = document.getElementById("lives");
const timelineEl = document.getElementById("timeline");
const titleEl = document.getElementById("song-title");
const artistEl = document.getElementById("song-artist");
const audioEl = document.getElementById("audio");
const messageEl = document.getElementById("message");
const hintEl = document.getElementById("card-hint");
const audioLoader = document.getElementById("audio-loading");
const currentCardEl = document.getElementById("current-card");
const startBtn = document.getElementById("start-game");
const playlistInput = document.getElementById("playlist-url");
const difficultySelect = document.getElementById("difficulty-select");
const modal = document.getElementById("game-over-modal");
const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");
const modalScore = document.getElementById("modal-score");
const modalDifficultySelect = document.getElementById("modal-difficulty");
const btnRestart = document.getElementById("btn-restart");
const btnNewPlaylist = document.getElementById("btn-new-playlist");

// Custom Player Elements
const playPauseBtn = document.getElementById("play-pause-btn");
const progressBar = document.getElementById("progress-bar");
const progressContainer = document.getElementById("progress-container");
const timeDisplay = document.getElementById("time-display");

// Logic Player
if (playPauseBtn && audioEl) {
  playPauseBtn.addEventListener("click", togglePlay);

  audioEl.addEventListener("play", () => {
    playPauseBtn.textContent = "⏸";
    if (audioLoader) audioLoader.classList.remove("active");
  });

  audioEl.addEventListener("pause", () => {
    playPauseBtn.textContent = "▶";
  });

  audioEl.addEventListener("timeupdate", updateProgress);

  audioEl.addEventListener("ended", () => {
    playPauseBtn.textContent = "▶";
    if (progressBar) progressBar.style.width = "0%";
  });
}

if (progressContainer && audioEl) {
  progressContainer.addEventListener("click", (e) => {
    const width = progressContainer.clientWidth;
    const clickX = e.offsetX;
    const duration = audioEl.duration;
    if (duration) {
      audioEl.currentTime = (clickX / width) * duration;
    }
  });
}

function togglePlay() {
  if (audioEl.paused) {
    audioEl.play().catch(() => {
        messageEl.textContent = "🔇 Interaction requise pour l'audio";
    });
  } else {
    audioEl.pause();
  }
}

function updateProgress() {
  const { duration, currentTime } = audioEl;
  if (!progressBar || !timeDisplay) return;
  
  if (isNaN(duration)) {
      progressBar.style.width = "0%";
      timeDisplay.textContent = "0:00";
      return;
  }
  
  const percent = (currentTime / duration) * 100;
  progressBar.style.width = `${percent}%`;
  timeDisplay.textContent = formatTime(currentTime);
}

function formatTime(s) {
  const min = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${min}:${sec < 10 ? "0" + sec : sec}`;
}

// Gestion du Loader Audio
if (audioEl && audioLoader) {
  audioEl.addEventListener("loadstart", () => {
    audioLoader.classList.add("active");
  });
  audioEl.addEventListener("canplay", () => {
    audioLoader.classList.remove("active");
  });
  audioEl.addEventListener("waiting", () => {
    audioLoader.classList.add("active");
  });
  audioEl.addEventListener("playing", () => {
    audioLoader.classList.remove("active");
  });
}

/**
 * Charge les chansons depuis le JSON
 * @async
 */
async function loadSongs() {
  const ts = Date.now(); // cache-buster
  const res = await fetch(`assets/data/songs.json?v=${ts}`);
  const data = await res.json();
  console.log("SONGS RELOADED:", data.length);
  songs = shuffle(data);
}

loadSongs();

startBtn.addEventListener("click", async () => {
  const url = playlistInput.value.trim();

  // Si une URL est fournie -> générer côté serveur
  if (url) {
    messageEl.textContent = "⏳ Import de la playlist...";

    const resp = await fetch("/api/playlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playlistUrl: url }),
    });

    const raw = await resp.text();
    console.log("API RAW RESPONSE:", raw);

    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      messageEl.textContent =
        "❌ Le serveur ne renvoie pas du JSON (voir console).";
      return;
    }

    console.log("API RESULT:", result);

    if (!result.ok) {
      messageEl.textContent = `❌ ${result.error || "Import échoué"}`;
      return;
    }

    if (result.playlistId) {
      currentPlaylistId = result.playlistId;
      localStorage.setItem("hitster_playlist_id", currentPlaylistId);
    }

    // Recharge songs.json APRES génération
    await loadSongs();

    if (songs.length === 0) {
      messageEl.textContent =
        "⚠️ Aucun extrait audio trouvé pour cette playlist.";
      return;
    }

    messageEl.textContent = `✅ Playlist importée (${songs.length} morceaux)`;
  }

  // Démarre avec ce qu'on a dans songs (nouveau ou ancien)
  startGame();
});

function renderLives(count) {
  if (!livesEl) return;
  livesEl.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const span = document.createElement("span");
    span.textContent = "❤️";
    span.className = "heart-icon";
    livesEl.appendChild(span);
  }
}

// Démarrer une nouvelle partie
function startGame() {
  if (songs.length === 0) return;

  // Initialisation Difficulté
  if (difficultySelect) {
    difficulty = difficultySelect.value;
  }

  if (difficulty === "hard") {
    lives = 1;
    if (livesEl) livesEl.style.display = "none";
  } else {
    lives = 3;
    if (livesEl) {
      livesEl.style.display = "block";
      renderLives(lives);
    }
  }

  timeline = [];
  timeline.push(songs.pop());

  score = 0;
  updateScoreUI();

  renderTimeline();
  nextCard();
}

/**
 * Passe à la carte suivante ou termine le jeu si plus de cartes.
 */

// Afficher la carte suivante
function nextCard() {
  if (songs.length === 0) {
    // VICTOIRE : Plus de cartes à piocher
    audioEl.pause();
    if (currentCardEl) currentCardEl.setAttribute("draggable", "false");
    showGameOver(true); // <--- On appelle la modale en mode victoire
    return;
  }

  currentCard = songs.pop();

  // Reset hint
  if (hintEl) hintEl.textContent = "";

  // Afficher l'indice si mode facile
  if (difficulty === "easy" && hintEl) {
    const wordCount = currentCard.title ? currentCard.title.split(" ").length : 0;
    // On peut aussi afficher la décennie pour aider encore plus
    // const decade = Math.floor(currentCard.year / 10) * 10;
    hintEl.textContent = `💡 ${wordCount} mot(s) dans le titre`;
  }

  // Setup draggable
  if (currentCardEl) {
    currentCardEl.setAttribute("draggable", "true");
    currentCardEl.ondragstart = (e) => {
      e.dataTransfer.setData("text/plain", "card");
      e.dataTransfer.effectAllowed = "move";
      currentCardEl.classList.add("dragging");
    };
    currentCardEl.ondragend = () => {
      currentCardEl.classList.remove("dragging");
    };
  }

  messageEl.textContent = "❓ Place la carte dans la timeline";

  audioEl.pause();
  audioEl.currentTime = 0;
  
  // Reset Player UI explicitly
  if (progressBar) progressBar.style.width = "0%";
  if (timeDisplay) timeDisplay.textContent = "0:00";

  if (
    typeof currentCard.audio === "string" &&
    currentCard.audio.startsWith("http")
  ) {
    audioEl.src = currentCard.audio;
    audioEl.load();
    audioEl.play().catch(() => {
      messageEl.textContent =
        "🔇 Clique sur Démarrer pour autoriser la lecture audio";
    });
  } else {
    // IMPORTANT: ne jamais laisser un src vide ou null
    audioEl.removeAttribute("src");
    audioEl.load();
    messageEl.textContent = "⚠️ Aucun extrait audio disponible pour ce titre";
  }
}

/**
 * Vérifie si la carte carte placement est correct.
 * @param {number} position - Position cliquée dans la timeline (0 à timeline.length)
 */

// Vérifier le placement de la carte
function checkPlacement(position) {
  const left = timeline[position - 1];
  const right = timeline[position];
  const year = currentCard.year;

  const isCorrect =
    (!left || year >= left.year) && (!right || year <= right.year);

  if (isCorrect) {
    timeline.splice(position, 0, currentCard);
    score++;
    scoreEl.textContent = "Score : " + score;
    
    // Update High Score
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("hitster_high_score", highScore);
    }
    updateScoreUI();

    // Reset draggable after success (optional since nextCard resets it)
    if (currentCardEl) currentCardEl.setAttribute("draggable", "false");

    messageEl.textContent = "✅ Bien placé !";
    messageEl.className = "success";
    
    // Confetti effect for correct placement
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00ff00', '#ffffff', '#ffeb3b']
    });

    renderTimeline(position); // Pass position for animation
    nextCard();
  } else {
    // Gestion des Vies
    if (difficulty === "hard") {
      endGame();
    } else {
      lives--;
      
      // Animation Heart Loss
      if (livesEl) {
          const hearts = livesEl.querySelectorAll(".heart-icon");
          // Si on a des cœurs affichés, on anime le dernier restant VISUELLEMENT avant suppression
          // Note : lives a déjà été décrémenté, donc hearts.length = lives + 1 (ceux affichés avant redraw)
          // MAIS ici on n'a pas encore redraw.
          // Le DOM a encore "lives + 1" coeurs.
          
          if (hearts.length > 0) {
              const lostHeart = hearts[hearts.length - 1];
              lostHeart.classList.add("heart-lost");
          }
          livesEl.classList.add("lives-shake");
          setTimeout(() => livesEl.classList.remove("lives-shake"), 500);
      }

      // Screen Damage Effect
      document.body.classList.add("damage-vignette", "body-shake");
      setTimeout(() => {
        document.body.classList.remove("damage-vignette", "body-shake");
      }, 800);

      if (lives > 0) {
        messageEl.textContent = `❌ Raté ! C'était en ${currentCard.year}. Il reste ${lives} vies.`;
        messageEl.className = "error";
        
        // Pause audio et attente
        audioEl.pause();

        // On passe à la suivante après un court délai
        setTimeout(() => {
            // Re-render clean lives count
            if (livesEl && difficulty !== "hard") renderLives(lives);
            nextCard(); 
        }, 1500); // Un peu plus rapide pour garder le rythme
      } else {
        endGame();
      }
    }
  }
}

// Fin du jeu en cas de mauvais placement
function endGame() {
  // DÉFAITE
  audioEl.pause();

  // On désactive le jeu en arrière-plan
  document
    .querySelectorAll(".drop-zone")
    .forEach((zone) => zone.classList.add("disabled"));

  showGameOver(false); // <--- On appelle la modale en mode défaite
}

// Afficher la timeline
function renderTimeline(newCardIndex = -1) {
  timelineEl.innerHTML = "";

  addDropZone(0);

  timeline.forEach((card, index) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "timeline-card";
    
    // Si c'est la carte qu'on vient de placer, on ajoute la classe d'animation
    if (index === newCardIndex) {
      cardDiv.classList.add("newly-placed");
    }

    cardDiv.innerHTML = `
      <div class="year">${card.year}</div>
      <div class="title">${card.title}</div>
      <div class="artist">${card.artist}</div>
    `;

    timelineEl.appendChild(cardDiv);
    addDropZone(index + 1);
  });
}

function updateScoreUI() {
  scoreEl.textContent = "Score : " + score;
  if (highScoreEl) highScoreEl.textContent = "Record : " + highScore;
}

// Ajouter une zone de dépôt
function addDropZone(position) {
  const zone = document.createElement("div");
  zone.className = "drop-zone";
  zone.textContent = "+";
  zone.onclick = () => checkPlacement(position);

  // Drag listeners
  zone.ondragover = (e) => {
    e.preventDefault(); // Necessary to allow dropping
    zone.classList.add("drag-over");
    e.dataTransfer.dropEffect = "move";
  };

  zone.ondragleave = () => {
    zone.classList.remove("drag-over");
  };

  zone.ondrop = (e) => {
    e.preventDefault();
    zone.classList.remove("drag-over");
    checkPlacement(position);
  };

  timelineEl.appendChild(zone);
}

/**
 * Algorithme de mélange de Fisher-Yates
 * @param {Array} array - Le tableau à mélanger
 * @returns {Array} Le tableau mélangé
 */
// Mélanger un tableau (Fisher-Yates Shuffle)
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
function showGameOver(isVictory) {
  // QR Code
  const qrDiv = document.getElementById("qrcode");
  const qrMess = document.getElementById("qrcode-mess");
  if (qrDiv) qrDiv.innerHTML = "";

  if (currentPlaylistId && typeof QRCode !== "undefined") {
    if (qrMess) qrMess.style.display = "block";
    new QRCode(qrDiv, {
      text: `https://open.spotify.com/playlist/${currentPlaylistId}`,
      width: 128,
      height: 128,
    });
  } else {
    if (qrMess) qrMess.style.display = "none";
  }

  modal.classList.remove("hidden"); // On affiche la modale

  // Synchro selecteur modale avec difficulté actuelle
  if (modalDifficultySelect) {
    modalDifficultySelect.value = difficulty;
  }

  // Mise à jour du score
  modalScore.textContent = `Score final : ${score}`;

  if (isVictory) {
    modalTitle.textContent = "🎉 Victoire !";
    modalMessage.textContent = "Incroyable ! Tu as placé toutes les musiques !";
    // Petit son de victoire optionnel ici
  } else {
    modalTitle.textContent = "💀 Perdu !";
    modalMessage.textContent = `C'était "${currentCard.title}" de ${currentCard.artist} (${currentCard.year})`;
  }

  btnRestart.addEventListener("click", async () => {
    // Appliquer la difficulté choisie dans la modale
    if (modalDifficultySelect && difficultySelect) {
      difficultySelect.value = modalDifficultySelect.value;
    }
    
    modal.classList.add("hidden"); // On cache la modale
    messageEl.className = ""; // On enlève les couleurs d'erreur/succès
    messageEl.textContent = "";

    // On recharge les chansons (important car on les a "pop" du tableau)
    await loadSongs();
    startGame();
  }, { once: true });

  btnNewPlaylist.addEventListener("click", () => {
    window.location.reload();
  });
}

/* === Background Ambience === */
function initBackgroundEffects() {
  const container = document.getElementById('bg-effects');
  if (!container) return;

  const symbols = ["♪", "♫", "♬", "♩", "𝄢"];

  function createNote() {
    const note = document.createElement('div');
    note.classList.add('floating-note');
    note.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    
    // Random position
    note.style.left = Math.random() * 100 + '%';
    
    // Random size
    const size = 1 + Math.random() * 2;
    note.style.fontSize = size + 'rem';
    
    // Random duration 10s - 20s
    const duration = 10 + Math.random() * 10;
    note.style.animation = `floatUp ${duration}s linear forwards`;
    
    container.appendChild(note);

    // Remove after animation
    setTimeout(() => {
      note.remove();
    }, duration * 1000);
  }

  // Create initial batch
  for(let i=0; i<5; i++) setTimeout(createNote, i * 500);

  // Spawn loop
  setInterval(createNote, 1500);
}

initBackgroundEffects();
