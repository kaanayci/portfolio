let songs = [];
let timeline = [];
let currentCard = null;

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

  timeline.forEach((card, index) => {
    const div = document.createElement("div");
    div.className = "card year";
    div.textContent = card.year;
    div.onclick = () => checkPlacement(index + 1);
    timelineEl.appendChild(div);
  });
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
  } else {
    messageEl.textContent = "❌ Mauvais placement – Fin de partie";
    audioEl.pause();
  }
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}
