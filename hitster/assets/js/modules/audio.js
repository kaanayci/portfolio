import { formatTime } from './utils.js';

export class AudioPlayer {
  constructor(audioEl, ui) {
    this.audioEl = audioEl;
    this.ui = ui; // { playPauseBtn, progressBar, progressContainer, timeDisplay, audioLoader }
    
    this.init();
  }

  init() {
    if (!this.audioEl) return;

    if (this.ui.playPauseBtn) {
      this.ui.playPauseBtn.addEventListener("click", () => this.togglePlay());
    }

    this.audioEl.addEventListener("play", () => {
      if (this.ui.playPauseBtn) this.ui.playPauseBtn.textContent = "⏸";
      if (this.ui.audioLoader) this.ui.audioLoader.classList.remove("active");
    });

    this.audioEl.addEventListener("pause", () => {
      if (this.ui.playPauseBtn) this.ui.playPauseBtn.textContent = "▶";
    });

    this.audioEl.addEventListener("timeupdate", () => this.updateProgress());

    this.audioEl.addEventListener("ended", () => {
      if (this.ui.playPauseBtn) this.ui.playPauseBtn.textContent = "▶";
      if (this.ui.progressBar) this.ui.progressBar.style.width = "0%";
    });

    // Loader events
    if (this.ui.audioLoader) {
      this.audioEl.addEventListener("loadstart", () => this.ui.audioLoader.classList.add("active"));
      this.audioEl.addEventListener("canplay", () => this.ui.audioLoader.classList.remove("active"));
      this.audioEl.addEventListener("waiting", () => this.ui.audioLoader.classList.add("active"));
      this.audioEl.addEventListener("playing", () => this.ui.audioLoader.classList.remove("active"));
    }

    // Click on progress bar
    if (this.ui.progressContainer) {
      this.ui.progressContainer.addEventListener("click", (e) => {
        const width = this.ui.progressContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = this.audioEl.duration;
        if (duration) {
          this.audioEl.currentTime = (clickX / width) * duration;
        }
      });
    }
  }

  play() {
    return this.audioEl.play();
  }

  togglePlay(onErrorCallback) {
    if (this.audioEl.paused) {
      this.audioEl.play().catch(() => {
        if (onErrorCallback) onErrorCallback("🔇 Interaction requise pour l'audio");
      });
    } else {
      this.audioEl.pause();
    }
  }

  updateProgress() {
    const { duration, currentTime } = this.audioEl;
    if (!this.ui.progressBar || !this.ui.timeDisplay) return;
    
    if (isNaN(duration)) {
        this.ui.progressBar.style.width = "0%";
        this.ui.timeDisplay.textContent = "0:00";
        return;
    }
    
    const percent = (currentTime / duration) * 100;
    this.ui.progressBar.style.width = `${percent}%`;
    this.ui.timeDisplay.textContent = formatTime(currentTime);
  }

  load(src) {
    this.pause();
    this.audioEl.currentTime = 0;
    if (this.ui.progressBar) this.ui.progressBar.style.width = "0%";
    if (this.ui.timeDisplay) this.ui.timeDisplay.textContent = "0:00";

    this.audioEl.src = src;
    this.audioEl.load();
  }

  pause() {
    this.audioEl.pause();
  }

  reset() {
      this.audioEl.removeAttribute("src");
      this.audioEl.load();
  }
}
