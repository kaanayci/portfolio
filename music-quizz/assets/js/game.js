let songs = [];
let timeline = [];
let currentCard = null;
let score = 0;

const scoreEl = document.getElementById("score");
const timelineEl = document.getElementById("timeline");
const titleEl = document.getElementById("song-title");
const artistEl = document.getElementById("song-artist");
const audioEl = document.getElementById("audio");
const messageEl = document.getElementById("message");

fetch("assets/data/songs.json")
  .then((res) => res.json())
  .then((data) => {
    console.log("SONGS LOADED:", data);
    songs = shuffle(data);
    startGame();
  });

document
  .getElementById("start-game")
  .addEventListener("click", startFromPlaylist);

function startFromPlaylist() {
  const url = document.getElementById("playlist-url").value;

  fetch(`/api/playlist${url ? `?url=${encodeURIComponent(url)}` : ""}`)
    .then((res) => res.json())
    .then((data) => {
      songs = shuffle(data);
      startGame();
    })
    .catch(() => {
      messageEl.textContent = "❌ Impossible de charger la playlist";
      messageEl.className = "error";
    });
}

function startGame() {
  timeline.push(songs.pop()); // première carte visible
  renderTimeline();
  nextCard();
  score = 0;
  scoreEl.textContent = "Score : 0";
}

function nextCard() {
  currentCard = songs.pop();

  messageEl.textContent = "❓ Place la carte dans la timeline";

  audioEl.src = currentCard.preview_url || "";
  audioEl.play();
}

function renderTimeline() {
  timelineEl.innerHTML = "";

  // zone avant la première carte
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

    // zone après chaque carte
    addDropZone(index + 1);
  });
}

function addDropZone(position) {
  const zone = document.createElement("div");
  zone.className = "drop-zone";
  zone.textContent = "+";
  zone.onclick = () => checkPlacement(position);
  timelineEl.appendChild(zone);
}

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

    // retourner la carte
    const cards = document.querySelectorAll(".card");
    cards[cards.length - 1]?.classList.add("flipped");

    renderTimeline();
    nextCard();
  } else {
    messageEl.textContent = "❌ Mauvais placement – Fin de partie";
    messageEl.className = "error";
    messageEl.textContent += ` (Année réelle : ${currentCard.year})`;

    audioEl.pause();

    // Désactiver toutes les zones
    document
      .querySelectorAll(".drop-zone")
      .forEach((zone) => zone.classList.add("disabled"));
  }
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}
