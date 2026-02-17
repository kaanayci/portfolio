import { formatTime } from './utils.js';

export class AudioPlayer {
  constructor(audioEl, ui) {
    this.audioEl = audioEl;
    this.ui = ui;
    this._fadeInterval = null;
    this._errorTimeout = null;
    this._onErrorCallback = null;
    this.init();
  }

  init() {
    if (!this.audioEl) return;

    this.ui.playPauseBtn?.addEventListener("click", () => this.togglePlay());

    this.audioEl.addEventListener("play", () => {
      if (this.ui.playPauseBtn) this.ui.playPauseBtn.textContent = "⏸";
      this.ui.audioLoader?.classList.remove("active");
    });
    this.audioEl.addEventListener("pause", () => {
      if (this.ui.playPauseBtn) this.ui.playPauseBtn.textContent = "▶";
    });
    this.audioEl.addEventListener("timeupdate", () => this._updateProgress());
    this.audioEl.addEventListener("ended", () => {
      if (this.ui.playPauseBtn) this.ui.playPauseBtn.textContent = "▶";
      if (this.ui.progressBar) this.ui.progressBar.style.width = "0%";
    });

    if (this.ui.audioLoader) {
      this.audioEl.addEventListener("loadstart", () => { this.ui.audioLoader.classList.add("active"); this._startErrorTimeout(); });
      this.audioEl.addEventListener("canplay", () => { this.ui.audioLoader.classList.remove("active"); this._clearErrorTimeout(); });
      this.audioEl.addEventListener("waiting", () => this.ui.audioLoader.classList.add("active"));
      this.audioEl.addEventListener("playing", () => { this.ui.audioLoader.classList.remove("active"); this._clearErrorTimeout(); });
    }

    this.audioEl.addEventListener("error", () => {
      this.ui.audioLoader?.classList.remove("active");
      this._clearErrorTimeout();
      this._onErrorCallback?.();
    });

    this.ui.progressContainer?.addEventListener("click", (e) => {
      const dur = this.audioEl.duration;
      if (dur) this.audioEl.currentTime = (e.offsetX / this.ui.progressContainer.clientWidth) * dur;
    });

    this._initVolume();
  }

  _initVolume() {
    const slider = document.getElementById("volume-slider");
    const btn = document.getElementById("volume-btn");
    if (slider) {
      this.audioEl.volume = parseFloat(slider.value);
      slider.addEventListener("input", (e) => {
        this.audioEl.volume = parseFloat(e.target.value);
        this._updateVolumeIcon(btn, this.audioEl.volume);
      });
    }
    if (btn) {
      btn.addEventListener("click", () => {
        this.audioEl.muted = !this.audioEl.muted;
        this._updateVolumeIcon(btn, this.audioEl.muted ? 0 : this.audioEl.volume);
      });
    }
  }

  _updateVolumeIcon(btn, vol) {
    if (!btn) return;
    btn.textContent = (vol === 0 || this.audioEl.muted) ? "🔇" : vol < 0.4 ? "🔉" : "🔊";
  }

  // Auto-skip si l'audio ne charge pas en 10 s
  _startErrorTimeout() {
    this._clearErrorTimeout();
    this._errorTimeout = setTimeout(() => {
      this.ui.audioLoader?.classList.remove("active");
      this._onErrorCallback?.();
    }, 10000);
  }

  _clearErrorTimeout() {
    if (this._errorTimeout) { clearTimeout(this._errorTimeout); this._errorTimeout = null; }
  }

  onError(cb) { this._onErrorCallback = cb; }

  play() { return this._fadeIn(); }

  // Fade-in progressif sur 500 ms pour éviter un « pop » audio
  _fadeIn() {
    this._clearFade();
    const target = parseFloat(document.getElementById("volume-slider")?.value || 0.7);
    this.audioEl.volume = 0;
    const promise = this.audioEl.play();
    let step = 0;
    this._fadeInterval = setInterval(() => {
      step++;
      this.audioEl.volume = Math.min(target, (step / 10) * target);
      if (step >= 10) this._clearFade();
    }, 50);
    return promise;
  }

  fadeOut() {
    return new Promise(resolve => {
      this._clearFade();
      const start = this.audioEl.volume;
      if (start === 0 || this.audioEl.paused) { resolve(); return; }
      let step = 0;
      this._fadeInterval = setInterval(() => {
        step++;
        this.audioEl.volume = Math.max(0, start * (1 - step / 8));
        if (step >= 8) { this._clearFade(); this.audioEl.pause(); resolve(); }
      }, 50);
    });
  }

  _clearFade() {
    if (this._fadeInterval) { clearInterval(this._fadeInterval); this._fadeInterval = null; }
  }

  togglePlay(onErr) {
    if (this.audioEl.paused) {
      this.audioEl.play().catch(() => { if (onErr) onErr("🔇 Interaction requise pour l'audio"); });
    } else {
      this.audioEl.pause();
    }
  }

  _updateProgress() {
    const { duration, currentTime } = this.audioEl;
    if (!this.ui.progressBar || !this.ui.timeDisplay) return;
    if (isNaN(duration)) {
      this.ui.progressBar.style.width = "0%";
      this.ui.timeDisplay.textContent = "0:00";
      return;
    }
    this.ui.progressBar.style.width = `${(currentTime / duration) * 100}%`;
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

  pause() { this._clearFade(); this.audioEl.pause(); }

  reset() {
    this._clearFade();
    this._clearErrorTimeout();
    this.audioEl.removeAttribute("src");
    this.audioEl.load();
  }
}
