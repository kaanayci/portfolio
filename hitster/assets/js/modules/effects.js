/* === Background Ambience === */
export function initBackgroundEffects() {
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

export function triggerConfetti() {
  if (typeof confetti !== 'undefined') {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00ff00', '#ffffff', '#ffeb3b']
    });
  }
} // Animation Heart Loss
export function triggerHeartLoss(livesEl) {
    if (!livesEl) return;
    const hearts = livesEl.querySelectorAll(".heart-icon");
    if (hearts.length > 0) {
        // Le dernier coeur affiché "casse"
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
