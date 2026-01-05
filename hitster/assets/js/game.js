// Variables globales
let songs = [];
let timeline = [];
let currentCard = null;
let score = 0;

// Éléments DOM
const scoreEl = document.getElementById("score");
const timelineEl = document.getElementById("timeline");
const titleEl = document.getElementById("song-title");
const artistEl = document.getElementById("song-artist");
const audioEl = document.getElementById("audio");
const messageEl = document.getElementById("message");
const startBtn = document.getElementById("start-game");
const playlistInput = document.getElementById("playlist-url");

// Charger les chansons depuis le fichier JSON
fetch("assets/data/songs.json?v=1")
  .then((res) => res.json())
  .then((data) => {
    console.log("SONGS LOADED:", data);
    songs = shuffle(data);
  });

startBtn.addEventListener("click", startGame);

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
    messageEl.textContent = "🎉 Partie terminée !";
    audioEl.pause();
    audioEl.currentTime = 0;
    console.log("AUDIO URL:", currentCard.audio);
    audioEl.src = currentCard?.audio || "";
    audioEl.load();
    return;
  }

  currentCard = songs.pop();

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
    messageEl.className = "success";

    renderTimeline();
    nextCard();
  } else {
    endGame();
  }
}

// Fin du jeu en cas de mauvais placement
function endGame() {
  messageEl.textContent = `❌ Mauvais placement – Année réelle : ${currentCard.year}`;
  messageEl.className = "error";
  audioEl.pause();

  document
    .querySelectorAll(".drop-zone")
    .forEach((zone) => zone.classList.add("disabled"));
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
  timelineEl.appendChild(zone);
}

// Mélanger un tableau
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}
