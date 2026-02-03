// Variables globales
let songs = [];
let timeline = [];
let currentCard = null;
let score = 0;
let currentPlaylistId = localStorage.getItem("hitster_playlist_id");

// Éléments DOM
const scoreEl = document.getElementById("score");
const timelineEl = document.getElementById("timeline");
const titleEl = document.getElementById("song-title");
const artistEl = document.getElementById("song-artist");
const audioEl = document.getElementById("audio");
const messageEl = document.getElementById("message");
const currentCardEl = document.getElementById("current-card");
const startBtn = document.getElementById("start-game");
const playlistInput = document.getElementById("playlist-url");
const modal = document.getElementById("game-over-modal");
const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");
const modalScore = document.getElementById("modal-score");
const btnRestart = document.getElementById("btn-restart");
const btnNewPlaylist = document.getElementById("btn-new-playlist");

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

// Démarrer une nouvelle partie
function startGame() {
  if (songs.length === 0) return;

  timeline = [];
  timeline.push(songs.pop());

  score = 0;
  scoreEl.textContent = "Score : 0";

  renderTimeline();
  nextCard();
}

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

    messageEl.textContent = "✅ Bien placé !";
  if (currentCardEl) currentCardEl.setAttribute("draggable", "false");

    messageEl.className = "success";

    renderTimeline();
    nextCard();
  } else {
    endGame();
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
function renderTimeline() {
  timelineEl.innerHTML = "";

  addDropZone(0);

  timeline.forEach((card, index) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "timeline-card";

    cardDiv.innerHTML = `
      <div class="year">${card.year}</div>
      <div class="title">${card.title}</div>
      <div class="artist">${card.artist}</div>
    `;

    timelineEl.appendChild(cardDiv);
    addDropZone(index + 1);
  });
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

// Mélanger un tableau
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
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
    modal.classList.add("hidden"); // On cache la modale
    messageEl.className = ""; // On enlève les couleurs d'erreur/succès
    messageEl.textContent = "";

    // On recharge les chansons (important car on les a "pop" du tableau)
    await loadSongs();
    startGame();
  });

  btnNewPlaylist.addEventListener("click", () => {
    window.location.reload();
  });
}
