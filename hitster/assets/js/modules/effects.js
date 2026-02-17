/* === Background Ambience === */
export function initBackgroundEffects() {
  const container = document.getElementById('bg-effects');
  if (!container) return;

  const symbols = ["♪", "♫", "♬", "♩", "𝄢"];

  function createNote() {
    const note = document.createElement('div');
    note.classList.add('floating-note');
    note.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    note.style.left = Math.random() * 100 + '%';
    const size = 1 + Math.random() * 2;
    note.style.fontSize = size + 'rem';
    const duration = 10 + Math.random() * 10;
    note.style.animation = `floatUp ${duration}s linear forwards`;
    container.appendChild(note);
    setTimeout(() => note.remove(), duration * 1000);
  }

  for (let i = 0; i < 5; i++) setTimeout(createNote, i * 500);
  setInterval(createNote, 1500);
}

export function triggerConfetti() {
  if (typeof confetti !== 'undefined') {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00ff00', '#ffffff', '#ffeb3b']
    });
  }
}

/** Streak-aware confetti — bigger bursts on higher combos */
export function triggerStreakConfetti(streak) {
  if (typeof confetti === 'undefined') return;
  const count = Math.min(50 + streak * 30, 300);
  const spread = Math.min(60 + streak * 10, 160);
  confetti({
    particleCount: count,
    spread: spread,
    origin: { y: 0.6 },
    colors: ['#00ff00', '#ffffff', '#ffeb3b', '#ff2f92', '#00d4ff']
  });
}

// Animation Heart Loss
export function triggerHeartLoss(livesEl) {
  if (!livesEl) return;
  const hearts = livesEl.querySelectorAll(".heart-icon");
  if (hearts.length > 0) {
    const lostHeart = hearts[hearts.length - 1];
    lostHeart.classList.add("heart-lost");
  }
  livesEl.classList.add("lives-shake");
  setTimeout(() => livesEl.classList.remove("lives-shake"), 500);
}

export function triggerDamageEffect() {
  document.body.classList.add("damage-vignette", "body-shake");
  setTimeout(() => {
    document.body.classList.remove("damage-vignette", "body-shake");
  }, 800);
}

/* === Feedback Sounds (Web Audio API generated tones) === */
let feedbackCtx = null;

function getFeedbackCtx() {
  if (!feedbackCtx) {
    feedbackCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return feedbackCtx;
}

/** Play a short success chime */
export function playSuccessSound() {
  try {
    const ctx = getFeedbackCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);      // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) { /* silent fail */ }
}

/** Play a short error buzz */
export function playErrorSound() {
  try {
    const ctx = getFeedbackCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.setValueAtTime(100, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) { /* silent fail */ }
}

/** Play a short combo sound (higher pitch for higher streak) */
export function playComboSound(streak) {
  try {
    const ctx = getFeedbackCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    const baseFreq = 600 + streak * 50;
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) { /* silent fail */ }
}
