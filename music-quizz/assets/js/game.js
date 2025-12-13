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

function startGame() {
  timeline.push(songs.pop()); // première carte visible
  renderTimeline();
  nextCard();
  score = 0;
  scoreEl.textContent = "Score : 0";
}

function nextCard() {
  currentCard = songs.pop();
  titleEl.textContent = currentCard.title;
  artistEl.textContent = currentCard.artist;
  audioEl.src = currentCard.preview_url;
  audioEl.play();
}

function renderTimeline() {
  timelineEl.innerHTML = "";

  // zone AVANT la première carte
  addDropZone(0);

  timeline.forEach((card, index) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card year";
    cardDiv.textContent = card.year;
    timelineEl.appendChild(cardDiv);

    // zone APRÈS chaque carte
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

  if ((!left || year >= left.year) && (!right || year <= right.year)) {
    timeline.splice(position, 0, currentCard);
    messageEl.textContent = "✅ Bien placé !";
    renderTimeline();
    nextCard();
    score++;
    scoreEl.textContent = "Score : " + score;
  } else {
    messageEl.textContent = "❌ Mauvais placement – Fin de partie";
    audioEl.pause();
  }
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}
