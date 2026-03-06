export function initBackgroundEffects() {
  const container = document.getElementById('bg-effects');
  if (!container) return;
  const symbols = ["♪", "♫", "♬", "♩", "𝄢"];

  function createNote() {
    const note = document.createElement('div');
    note.classList.add('floating-note');
    note.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    note.style.setProperty('--left', Math.random() * 100 + '%');
    note.style.setProperty('--size', (1 + Math.random() * 2) + 'rem');
    const dur = 10 + Math.random() * 10;
    note.style.setProperty('--duration', dur + 's');
    note.style.setProperty('--delay', '0s');
    container.appendChild(note);
    setTimeout(() => note.remove(), dur * 1000);
  }

  for (let i = 0; i < 5; i++) setTimeout(createNote, i * 500);
  setInterval(createNote, 1500);
}

export function triggerConfetti() {
  if (typeof confetti !== 'undefined') {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#00ff00', '#ffffff', '#ffeb3b'] });
  }
}

export function triggerStreakConfetti(streak) {
  if (typeof confetti === 'undefined') return;
  confetti({
    particleCount: Math.min(50 + streak * 30, 300),
    spread: Math.min(60 + streak * 10, 160),
    origin: { y: 0.6 },
    colors: ['#00ff00', '#ffffff', '#ffeb3b', '#ff2f92', '#00d4ff']
  });
}

export function triggerHeartLoss(livesEl) {
  if (!livesEl) return;
  const hearts = livesEl.querySelectorAll(".heart-icon");
  if (hearts.length) hearts[hearts.length - 1].classList.add("heart-lost");
  livesEl.classList.add("lives-shake");
  setTimeout(() => livesEl.classList.remove("lives-shake"), 500);
}

export function triggerDamageEffect() {
  document.body.classList.add("damage-vignette", "body-shake");
  setTimeout(() => document.body.classList.remove("damage-vignette", "body-shake"), 800);
}

// Sons de feedback générés via Web Audio API (oscillateurs)
let feedbackCtx = null;
function ctx() {
  if (!feedbackCtx) feedbackCtx = new (window.AudioContext || window.webkitAudioContext)();
  return feedbackCtx;
}

// Crée un oscillateur connecté à un gain, joue pendant `dur` secondes
function tone(type, freqSteps, vol, dur) {
  try {
    const c = ctx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    freqSteps.forEach(([freq, time]) => osc.frequency.setValueAtTime(freq, c.currentTime + time));
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + dur);
  } catch (_) {}
}

export function playSuccessSound() {
  tone("sine", [[523.25, 0], [659.25, 0.1], [783.99, 0.2]], 0.15, 0.4);
}

export function playErrorSound() {
  tone("sawtooth", [[150, 0], [100, 0.15]], 0.1, 0.3);
}

export function playComboSound(streak) {
  const base = 600 + streak * 50;
  tone("sine", [[base, 0], [base * 1.5, 0.08]], 0.12, 0.25);
}
