export function showCountdown(overlayEl, numberEl, gameAreaEl, timelineEl) {
  return new Promise((resolve) => {
    if (!overlayEl || !numberEl) { resolve(); return; }

    if (gameAreaEl) gameAreaEl.classList.remove("active");
    timelineEl?.classList.remove("active");

    overlayEl.classList.remove("hidden");
    const steps = ["3", "2", "1", "🎵"];
    let i = 0;

    function tick() {
      if (i >= steps.length) {
        overlayEl.style.opacity = "0";
        overlayEl.style.transition = "opacity 0.3s ease";
        setTimeout(() => {
          overlayEl.classList.add("hidden");
          overlayEl.style.opacity = "";
          overlayEl.style.transition = "";
          if (gameAreaEl) gameAreaEl.classList.add("active");
          setTimeout(() => timelineEl?.classList.add("active"), 100);
          resolve();
        }, 300);
        return;
      }
      // Force re-trigger CSS animation
      numberEl.textContent = steps[i];
      numberEl.style.animation = "none";
      void numberEl.offsetHeight;
      numberEl.style.animation = "";
      i++;
      setTimeout(tick, 650);
    }

    tick();
  });
}
