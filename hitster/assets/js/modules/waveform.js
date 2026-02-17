/**
 * Audio Waveform Visualizer – Smooth Central Wave
 * Draws a smooth, organic waveform curve on two side canvases (left & right).
 * The wave is vertically centered with maximum amplitude at the middle of the
 * screen, tapering off toward top and bottom — like a classic audio waveform
 * rotated 90°. Uses cubic Bézier curves for a fluid, continuous look.
 * Only visible on desktop (>1024px).
 */

let audioCtx = null;
let analyser = null;
let source = null;
let animFrame = null;
let leftCanvas, rightCanvas, leftCtx, rightCtx;
let isConnected = false;

const FFT_SIZE = 256;
const SMOOTHING = 0.82;
const MIN_DECIBELS = -90;
const MAX_DECIBELS = -10;

// How many sample points along the vertical axis
const POINTS = 64;

// Color palette matching the Hitster theme
const COLOR_PRIMARY = { r: 255, g: 47, b: 146 };   // #ff2f92
const COLOR_SECONDARY = { r: 0, g: 212, b: 255 };  // #00d4ff

export function initWaveform(audioEl) {
  if (!audioEl) return;

  // Create canvas elements
  leftCanvas = document.createElement("canvas");
  rightCanvas = document.createElement("canvas");
  leftCanvas.className = "waveform-canvas waveform-left";
  rightCanvas.className = "waveform-canvas waveform-right";
  document.body.appendChild(leftCanvas);
  document.body.appendChild(rightCanvas);

  function resize() {
    const h = window.innerHeight;
    const w = 120;
    const dpr = window.devicePixelRatio || 1;
    [leftCanvas, rightCanvas].forEach(c => {
      c.width = w * dpr;
      c.height = h * dpr;
      c.style.width = w + "px";
      c.style.height = h + "px";
    });
  }
  resize();
  window.addEventListener("resize", resize);

  // Connect audio on first play
  audioEl.addEventListener("play", () => {
    if (!isConnected) connectAudio(audioEl);
    leftCanvas.classList.add("visible");
    rightCanvas.classList.add("visible");
    startDraw();
  });

  audioEl.addEventListener("pause", () => {
    setTimeout(() => {
      if (audioEl.paused) {
        leftCanvas.classList.remove("visible");
        rightCanvas.classList.remove("visible");
      }
    }, 1500);
  });

  audioEl.addEventListener("ended", () => {
    leftCanvas.classList.remove("visible");
    rightCanvas.classList.remove("visible");
  });
}

function connectAudio(audioEl) {
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    analyser.smoothingTimeConstant = SMOOTHING;
    analyser.minDecibels = MIN_DECIBELS;
    analyser.maxDecibels = MAX_DECIBELS;

    source = audioCtx.createMediaElementSource(audioEl);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    isConnected = true;
    console.log("Waveform: connected successfully");
  } catch (e) {
    console.warn("Waveform: Could not connect audio", e);
  }
}

function startDraw() {
  if (animFrame) return;
  draw();
}

/* ---- Envelope: bell-shaped curve that peaks at center ---- */
function envelope(t) {
  // t goes from 0 (top) to 1 (bottom)
  // Gaussian bell centered at 0.5
  const d = (t - 0.5) * 2;         // range -1..1
  return Math.exp(-3.5 * d * d);    // smooth bell
}

/* ---- Smooth interpolation of frequency data into N points ---- */
function sampleFrequencyData(dataArray, bufferLength, numPoints) {
  const values = new Float32Array(numPoints);
  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    const freqT = Math.pow(t, 1.3);            // Emphasize lower freqs
    const idx = freqT * (bufferLength - 1);
    const lo = Math.floor(idx);
    const hi = Math.min(lo + 1, bufferLength - 1);
    const frac = idx - lo;
    const raw = (dataArray[lo] * (1 - frac) + dataArray[hi] * frac) / 255;
    values[i] = raw;
  }
  return values;
}

/* ---- Color at a given vertical position (0=top, 1=bottom) ---- */
function colorAt(t, alpha) {
  const r = Math.round(COLOR_SECONDARY.r + (COLOR_PRIMARY.r - COLOR_SECONDARY.r) * t);
  const g = Math.round(COLOR_SECONDARY.g + (COLOR_PRIMARY.g - COLOR_SECONDARY.g) * t);
  const b = Math.round(COLOR_SECONDARY.b + (COLOR_PRIMARY.b - COLOR_SECONDARY.b) * t);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ---- Main draw loop ---- */
function draw() {
  animFrame = requestAnimationFrame(draw);

  if (!analyser || !leftCanvas || !rightCanvas) return;
  if (window.innerWidth < 1024) return;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  leftCtx = leftCanvas.getContext("2d");
  rightCtx = rightCanvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const cw = leftCanvas.width;
  const ch = leftCanvas.height;
  leftCtx.clearRect(0, 0, cw, ch);
  rightCtx.clearRect(0, 0, cw, ch);

  // Sample frequency data into smooth points
  const values = sampleFrequencyData(dataArray, bufferLength, POINTS);

  // Maximum horizontal displacement for the wave
  const maxAmp = cw * 0.75;

  // Build array of {y, x} points for the wave shape
  const pts = [];
  for (let i = 0; i < POINTS; i++) {
    const t = i / (POINTS - 1);                 // 0..1 vertical
    const y = t * ch;
    const amp = values[i] * envelope(t);         // Apply bell envelope
    const x = amp * maxAmp;
    pts.push({ x, y });
  }

  // Draw on LEFT canvas (wave grows from right edge toward left)
  drawWave(leftCtx, pts, cw, ch, dpr, "left");

  // Draw on RIGHT canvas (wave grows from left edge toward right)
  drawWave(rightCtx, pts, cw, ch, dpr, "right");
}

function drawWave(ctx, pts, cw, ch, dpr, side) {
  // Baseline: the edge of the canvas where the wave starts
  const baseX = side === "left" ? cw : 0;
  const dir = side === "left" ? -1 : 1;

  // ---- Filled glow layer (wider, very transparent) ----
  ctx.beginPath();
  ctx.moveTo(baseX, 0);

  for (let i = 0; i < pts.length; i++) {
    const px = baseX + dir * pts[i].x * 1.15;
    const py = pts[i].y;

    if (i === 0) {
      ctx.lineTo(px, py);
    } else {
      const prev = pts[i - 1];
      const prevPx = baseX + dir * prev.x * 1.15;
      const midY = (prev.y + py) / 2;
      ctx.bezierCurveTo(prevPx, midY, px, midY, px, py);
    }
  }

  ctx.lineTo(baseX, ch);
  ctx.closePath();

  // Gradient fill for glow
  const glowGrad = ctx.createLinearGradient(0, 0, 0, ch);
  glowGrad.addColorStop(0, colorAt(0, 0.02));
  glowGrad.addColorStop(0.3, colorAt(0.3, 0.08));
  glowGrad.addColorStop(0.5, colorAt(0.5, 0.12));
  glowGrad.addColorStop(0.7, colorAt(0.7, 0.08));
  glowGrad.addColorStop(1, colorAt(1, 0.02));
  ctx.fillStyle = glowGrad;
  ctx.fill();

  // ---- Main filled shape (the solid wave) ----
  ctx.beginPath();
  ctx.moveTo(baseX, 0);

  for (let i = 0; i < pts.length; i++) {
    const px = baseX + dir * pts[i].x;
    const py = pts[i].y;

    if (i === 0) {
      ctx.lineTo(px, py);
    } else {
      const prev = pts[i - 1];
      const prevPx = baseX + dir * prev.x;
      const midY = (prev.y + py) / 2;
      ctx.bezierCurveTo(prevPx, midY, px, midY, px, py);
    }
  }

  ctx.lineTo(baseX, ch);
  ctx.closePath();

  // Gradient fill
  const fillGrad = ctx.createLinearGradient(0, 0, 0, ch);
  fillGrad.addColorStop(0, colorAt(0, 0.03));
  fillGrad.addColorStop(0.35, colorAt(0.35, 0.18));
  fillGrad.addColorStop(0.5, colorAt(0.5, 0.25));
  fillGrad.addColorStop(0.65, colorAt(0.65, 0.18));
  fillGrad.addColorStop(1, colorAt(1, 0.03));
  ctx.fillStyle = fillGrad;
  ctx.fill();

  // ---- Bright edge line (the crisp wave contour) ----
  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const px = baseX + dir * pts[i].x;
    const py = pts[i].y;

    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      const prev = pts[i - 1];
      const prevPx = baseX + dir * prev.x;
      const midY = (prev.y + py) / 2;
      ctx.bezierCurveTo(prevPx, midY, px, midY, px, py);
    }
  }

  // Stroke gradient
  const strokeGrad = ctx.createLinearGradient(0, 0, 0, ch);
  strokeGrad.addColorStop(0, colorAt(0, 0.05));
  strokeGrad.addColorStop(0.3, colorAt(0.3, 0.5));
  strokeGrad.addColorStop(0.5, colorAt(0.5, 0.9));
  strokeGrad.addColorStop(0.7, colorAt(0.7, 0.5));
  strokeGrad.addColorStop(1, colorAt(1, 0.05));
  ctx.strokeStyle = strokeGrad;
  ctx.lineWidth = 2 * dpr;
  ctx.shadowColor = colorAt(0.5, 0.4);
  ctx.shadowBlur = 12 * dpr;
  ctx.stroke();
  ctx.shadowBlur = 0;
}
