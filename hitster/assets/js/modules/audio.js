import { formatTime } from './utils.js';

export class AudioPlayer {
  constructor(audioEl, ui) {
    this.audioEl = audioEl;
    this.ui = ui;
    this._fadeInterval = null;
    this._errorTimeout = null;
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
      this.audioEl.addEventListener("loadstart", () => {
        this.ui.audioLoader.classList.add("active");
        this._startErrorTimeout();
      });
      this.audioEl.addEventListener("canplay", () => {
        this.ui.audioLoader.classList.remove("active");
        this._clearErrorTimeout();
      });
      this.audioEl.addEventListener("waiting", () => this.ui.audioLoader.classList.add("active"));
      this.audioEl.addEventListener("playing", () => {
        this.ui.audioLoader.classList.remove("active");
        this._clearErrorTimeout();
      });
    }

    // Robust error handling: 404, expired previews, network errors
    this.audioEl.addEventListener("error", () => {
      if (this.ui.audioLoader) this.ui.audioLoader.classList.remove("active");
      this._clearErrorTimeout();
      if (this._onErrorCallback) this._onErrorCallback();
    });

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

    // Volume control
    const volumeSlider = document.getElementById("volume-slider");
    const volumeBtn = document.getElementById("volume-btn");
    if (volumeSlider) {
      this.audioEl.volume = parseFloat(volumeSlider.value);
      volumeSlider.addEventListener("input", (e) => {
        this.audioEl.volume = parseFloat(e.target.value);
        this._updateVolumeIcon(volumeBtn, this.audioEl.volume);
      });
    }
    if (volumeBtn) {
      volumeBtn.addEventListener("click", () => {
        this.audioEl.muted = !this.audioEl.muted;
        this._updateVolumeIcon(volumeBtn, this.audioEl.muted ? 0 : this.audioEl.volume);
      });
    }
  }

  _updateVolumeIcon(btn, vol) {
    if (!btn) return;
    if (vol === 0 || this.audioEl.muted) btn.textContent = "🔇";
    else if (vol < 0.4) btn.textContent = "🔉";
    else btn.textContent = "🔊";
  }

  // Timeout: if audio doesn't load in 10s, treat as error
  _startErrorTimeout() {
    this._clearErrorTimeout();
    this._errorTimeout = setTimeout(() => {
      if (this.ui.audioLoader) this.ui.audioLoader.classList.remove("active");
      if (this._onErrorCallback) this._onErrorCallback();
    }, 10000);
  }

  _clearErrorTimeout() {
    if (this._errorTimeout) {
      clearTimeout(this._errorTimeout);
      this._errorTimeout = null;
    }
  }

  /** Set a callback for when audio fails to load */
  onError(cb) {
    this._onErrorCallback = cb;
  }

  play() {
    return this._fadeIn();
  }

  /** Fade in audio over 500ms */
  _fadeIn() {
    this._clearFade();
    const targetVolume = parseFloat(document.getElementById("volume-slider")?.value || 0.7);
    this.audioEl.volume = 0;
    const promise = this.audioEl.play();
    const steps = 10;
    const stepTime = 50; // 500ms total
    let step = 0;
    this._fadeInterval = setInterval(() => {
      step++;
      this.audioEl.volume = Math.min(targetVolume, (step / steps) * targetVolume);
      if (step >= steps) this._clearFade();
    }, stepTime);
    return promise;
  }

  /** Fade out audio over 400ms, returns promise */
  fadeOut() {
    return new Promise(resolve => {
      this._clearFade();
      const startVol = this.audioEl.volume;
      if (startVol === 0 || this.audioEl.paused) { resolve(); return; }
      const steps = 8;
      const stepTime = 50;
      let step = 0;
      this._fadeInterval = setInterval(() => {
        step++;
        this.audioEl.volume = Math.max(0, startVol * (1 - step / steps));
        if (step >= steps) {
          this._clearFade();
          this.audioEl.pause();
          resolve();
        }
      }, stepTime);
    });
  }

  _clearFade() {
    if (this._fadeInterval) {
      clearInterval(this._fadeInterval);
      this._fadeInterval = null;
    }
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
    this._clearFade();
    this.audioEl.pause();
    this.audioEl.currentTime = 0;
    if (this.ui.progressBar) this.ui.progressBar.style.width = "0%";
    if (this.ui.timeDisplay) this.ui.timeDisplay.textContent = "0:00";

    this.audioEl.src = src;
    this.audioEl.load();
  }

  pause() {
    this._clearFade();
    this.audioEl.pause();
  }

  reset() {
    this._clearFade();
    this._clearErrorTimeout();
    this.audioEl.removeAttribute("src");
    this.audioEl.load();
  }
}
