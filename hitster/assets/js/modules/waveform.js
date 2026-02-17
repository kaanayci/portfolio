let audioCtx = null, analyser = null, source = null, animFrame = null;
let leftCanvas, rightCanvas, leftCtx, rightCtx;
let isConnected = false;

const FFT_SIZE = 256;
const SMOOTHING = 0.82;
const POINTS = 64;
const COLOR_1 = { r: 255, g: 47, b: 146 };
const COLOR_2 = { r: 0, g: 212, b: 255 };

export function initWaveform(audioEl) {
  if (!audioEl) return;

  leftCanvas = document.createElement("canvas");
  rightCanvas = document.createElement("canvas");
  leftCanvas.className = "waveform-canvas waveform-left";
  rightCanvas.className = "waveform-canvas waveform-right";
  document.body.appendChild(leftCanvas);
  document.body.appendChild(rightCanvas);

  function resize() {
    const h = window.innerHeight, w = 120, dpr = window.devicePixelRatio || 1;
    [leftCanvas, rightCanvas].forEach(c => {
      c.width = w * dpr; c.height = h * dpr;
      c.style.width = w + "px"; c.style.height = h + "px";
    });
  }
  resize();
  window.addEventListener("resize", resize);

  audioEl.addEventListener("play", () => {
    if (!isConnected) connectAudio(audioEl);
    leftCanvas.classList.add("visible");
    rightCanvas.classList.add("visible");
    if (!animFrame) draw();
  });

  audioEl.addEventListener("pause", () => {
    setTimeout(() => {
      if (audioEl.paused) { leftCanvas.classList.remove("visible"); rightCanvas.classList.remove("visible"); }
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
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;
    source = audioCtx.createMediaElementSource(audioEl);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    isConnected = true;
  } catch (e) {
    console.warn("Waveform: impossible de connecter l'audio", e);
  }
}

// Enveloppe gaussienne centrée à 50 % de la hauteur
function envelope(t) {
  const d = (t - 0.5) * 2;
  return Math.exp(-3.5 * d * d);
}

// Rééchantillonne les données FFT en N points avec emphase sur les basses fréquences
function sampleData(data, len, n) {
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const idx = Math.pow(t, 1.3) * (len - 1);
    const lo = Math.floor(idx), hi = Math.min(lo + 1, len - 1);
    out[i] = (data[lo] * (1 - (idx - lo)) + data[hi] * (idx - lo)) / 255;
  }
  return out;
}

// Interpolation linéaire de couleur cyan → rose selon la position verticale
function colorAt(t, a) {
  const r = Math.round(COLOR_2.r + (COLOR_1.r - COLOR_2.r) * t);
  const g = Math.round(COLOR_2.g + (COLOR_1.g - COLOR_2.g) * t);
  const b = Math.round(COLOR_2.b + (COLOR_1.b - COLOR_2.b) * t);
  return `rgba(${r},${g},${b},${a})`;
}

function draw() {
  animFrame = requestAnimationFrame(draw);
  if (!analyser || !leftCanvas || !rightCanvas || window.innerWidth < 1024) return;

  const buf = analyser.frequencyBinCount;
  const data = new Uint8Array(buf);
  analyser.getByteFrequencyData(data);

  leftCtx = leftCanvas.getContext("2d");
  rightCtx = rightCanvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const cw = leftCanvas.width, ch = leftCanvas.height;
  leftCtx.clearRect(0, 0, cw, ch);
  rightCtx.clearRect(0, 0, cw, ch);

  const values = sampleData(data, buf, POINTS);
  const maxAmp = cw * 0.75;

  const pts = [];
  for (let i = 0; i < POINTS; i++) {
    const t = i / (POINTS - 1);
    pts.push({ x: values[i] * envelope(t) * maxAmp, y: t * ch });
  }

  drawWave(leftCtx, pts, cw, ch, dpr, "left");
  drawWave(rightCtx, pts, cw, ch, dpr, "right");
}

// Dessine 3 couches : glow diffus → remplissage solide → contour lumineux (Bézier cubiques)
function drawWave(ctx, pts, cw, ch, dpr, side) {
  const baseX = side === "left" ? cw : 0;
  const dir = side === "left" ? -1 : 1;

  drawLayer(ctx, pts, baseX, dir, ch, 1.15, [
    [0, 0.02], [0.3, 0.08], [0.5, 0.12], [0.7, 0.08], [1, 0.02]
  ], "fill");

  drawLayer(ctx, pts, baseX, dir, ch, 1, [
    [0, 0.03], [0.35, 0.18], [0.5, 0.25], [0.65, 0.18], [1, 0.03]
  ], "fill");

  // Contour avec glow
  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const px = baseX + dir * pts[i].x, py = pts[i].y;
    if (i === 0) { ctx.moveTo(px, py); continue; }
    const prev = pts[i - 1];
    const midY = (prev.y + py) / 2;
    ctx.bezierCurveTo(baseX + dir * prev.x, midY, px, midY, px, py);
  }
  const sg = ctx.createLinearGradient(0, 0, 0, ch);
  [[0, 0.05], [0.3, 0.5], [0.5, 0.9], [0.7, 0.5], [1, 0.05]].forEach(([s, a]) => sg.addColorStop(s, colorAt(s, a)));
  ctx.strokeStyle = sg;
  ctx.lineWidth = 2 * dpr;
  ctx.shadowColor = colorAt(0.5, 0.4);
  ctx.shadowBlur = 12 * dpr;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawLayer(ctx, pts, baseX, dir, ch, scale, stops, mode) {
  ctx.beginPath();
  ctx.moveTo(baseX, 0);
  for (let i = 0; i < pts.length; i++) {
    const px = baseX + dir * pts[i].x * scale, py = pts[i].y;
    if (i === 0) { ctx.lineTo(px, py); continue; }
    const prev = pts[i - 1];
    const midY = (prev.y + py) / 2;
    ctx.bezierCurveTo(baseX + dir * prev.x * scale, midY, px, midY, px, py);
  }
  ctx.lineTo(baseX, ch);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, 0, 0, ch);
  stops.forEach(([s, a]) => grad.addColorStop(s, colorAt(s, a)));
  ctx.fillStyle = grad;
  ctx.fill();
}
