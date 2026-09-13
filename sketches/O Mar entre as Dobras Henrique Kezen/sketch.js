/*
 * O Mar entre as Dobras — Henrique Kezen
 * Inspiração: Under Dark, https://www.reddit.com/r/generative/comments/w08ygj/
 * Curvas senoidais e ruído de Perlin aproximam ondas e tecido plissado.
 * Código elaborado com assistência de IA. Nenhuma imagem ou áudio externo.
 */
"use strict";

const W = 1200;
const H = 760;
const PLATE = { x: 30, y: 30, w: 1140, h: 654 };
const PALETTES = [
  {
    name: "01 — AZUL DE LINHO",
    sky: ["#aebfbd", "#d4d7cc", "#b1c6bf"],
    deep: [11, 40, 58], middle: [43, 101, 110], light: [179, 205, 190],
    glint: "#e5e8ce", ink: "#305459"
  },
  {
    name: "02 — ÚLTIMA LUZ",
    sky: ["#b1a3a1", "#e5c5a6", "#c1aaa0"],
    deep: [45, 54, 80], middle: [103, 111, 127], light: [226, 181, 147],
    glint: "#ffe6bf", ink: "#675b64"
  }
];

let artCanvas;
let texture;
let paletteIndex = 0;
let seed = 7319;
let time = 0;
let paused = false;
let phase = 0;
let pointer = { x: 0.5, y: 0.5, amount: 0 };

function setup() {
  const loading = document.getElementById("loading");
  if (loading) loading.remove();
  // A resolução interna constante mantém a mesma composição em qualquer tela.
  pixelDensity(1);
  artCanvas = createCanvas(W, H);
  const host = document.getElementById("sketch-container");
  if (host) artCanvas.parent(host);
  artCanvas.elt.setAttribute("role", "img");
  artCanvas.elt.setAttribute("aria-label", "Oceano abstrato em camadas de linhas, semelhantes a dobras de tecido, por Henrique Kezen.");
  frameRate(30);
  noiseDetail(3, 0.5);
  paused = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  prepareLandscape();
  bindControls();
  updateLabels();
  describe("Ondas de tecido azulado se movem lentamente; o cursor altera suavemente suas curvas. Há botões para pausar, mudar cores, gerar outra paisagem e salvar uma imagem.");
  if (paused) noLoop();
}

function prepareLandscape() {
  randomSeed(seed);
  noiseSeed(seed);
  phase = random(TWO_PI);
  if (texture) texture.remove();
  texture = createGraphics(W, H);
  texture.pixelDensity(1);
  texture.clear();
  // Textura fixa: não pisca e não precisa ser recalculada a cada quadro.
  texture.strokeWeight(1);
  for (let i = 0; i < 36000; i++) {
    const light = i % 3 === 0;
    texture.stroke(light ? 255 : 26, light ? 255 : 50, light ? 230 : 57, light ? 22 : 14);
    texture.point(random(W), random(H));
  }
  time = 0;
}

function draw() {
  if (!paused) time += Math.min(deltaTime, 50) / 1000;
  const p = PALETTES[paletteIndex];
  const ctx = drawingContext;
  background("#f7f4e9");
  updatePointer();

  ctx.save();
  ctx.beginPath();
  ctx.rect(PLATE.x, PLATE.y, PLATE.w, PLATE.h);
  ctx.clip();
  ctx.translate(PLATE.x, PLATE.y);

  const sky = ctx.createLinearGradient(0, 0, 0, 260);
  p.sky.forEach((color, i) => sky.addColorStop(i / 2, color));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PLATE.w, PLATE.h);

  // Um disco difuso dá escala à paisagem, como luz atravessando uma cortina.
  const glow = ctx.createRadialGradient(PLATE.w * 0.72, 95, 2, PLATE.w * 0.72, 95, 135);
  glow.addColorStop(0, paletteIndex === 0 ? "#f4f2d473" : "#ffdfb790");
  glow.addColorStop(1, "#ffffff00");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, PLATE.w, 240);
  ctx.beginPath();
  ctx.arc(PLATE.w * 0.72, 94, 23, 0, Math.PI * 2);
  ctx.fillStyle = paletteIndex === 0 ? "#f1eed767" : "#ffe1b589";
  ctx.fill();

  drawSea(ctx, p);

  // Filetes verticais quase imperceptíveis evocam a trama do tecido.
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = "#f7f6e70b";
  ctx.beginPath();
  for (let x = 1; x < PLATE.w; x += 4) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, PLATE.h);
  }
  ctx.stroke();
  ctx.restore();
  image(texture, 0, 0);

  noStroke();
  fill(p.ink);
  textFont("Georgia");
  textStyle(ITALIC);
  textSize(18);
  textAlign(LEFT, BASELINE);
  text("O Mar entre as Dobras", 32, 722);
  textStyle(NORMAL);
  textFont("Courier New");
  textSize(9);
  textAlign(RIGHT, BASELINE);
  text("HENRIQUE KEZEN   /   " + String(seed).padStart(5, "0"), W - 33, 720);
}

function updatePointer() {
  // Coordenadas calculadas a partir do tamanho exibido, inclusive no celular.
  const inside = mouseX >= PLATE.x && mouseX <= PLATE.x + PLATE.w && mouseY >= PLATE.y && mouseY <= PLATE.y + PLATE.h;
  const target = inside ? 1 : 0;
  pointer.amount += (target - pointer.amount) * 0.045;
  if (inside) {
    pointer.x += ((mouseX - PLATE.x) / PLATE.w - pointer.x) * 0.035;
    pointer.y += ((mouseY - PLATE.y) / PLATE.h - pointer.y) * 0.035;
  }
}

// Cada linha é uma seção da superfície. A fase muda com a profundidade:
// regiões comprimidas viram sombras; regiões abertas parecem cristas de cetim.
function surface(x, depth) {
  const swell = Math.pow(depth, 0.86);
  const drift = time * 0.16;
  const a = x * 0.0088 + depth * 12.6 - drift + phase;
  const b = x * 0.0044 - depth * 7.4 + drift * 0.55 + phase * 0.35;
  const folds = Math.sin(a + 0.62 * Math.sin(b)) + 0.25 * Math.sin(a * 2.02 + depth * 3.0);
  const organic = noise(x * 0.0028, depth * 2.8, 0.3 + time * 0.025) - 0.5;
  const base = 188 + Math.pow(depth, 1.24) * 542;
  const dx = x / PLATE.w - pointer.x;
  const dy = (base / PLATE.h) - pointer.y;
  const touch = Math.exp(-dx * dx * 38 - dy * dy * 14) * pointer.amount;
  const ripple = Math.sin(x * 0.012 - depth * 10 - time * 0.65) * touch * 14 * swell;
  return base + (5 + 56 * swell) * folds + organic * 31 * swell + ripple;
}

function mixRGB(a, b, t) {
  const clamped = Math.max(0, Math.min(1, t));
  return a.map((v, i) => Math.round(v + (b[i] - v) * clamped));
}

function seaColor(p, depth, light) {
  const dark = mixRGB(p.middle, p.deep, Math.min(1, depth * 1.18));
  return "rgb(" + mixRGB(dark, p.light, light).join(",") + ")";
}

function drawSea(ctx, p) {
  const rows = 148;
  const step = 7;
  for (let row = 0; row <= rows; row++) {
    const depth = row / rows;
    const points = [];
    for (let x = -step; x <= PLATE.w + step; x += step) points.push([x, surface(x, depth)]);

    // Gradiente lateral, calculado a partir da inclinação das dobras.
    const sheen = ctx.createLinearGradient(0, 0, PLATE.w, 0);
    for (let s = 0; s <= 18; s++) {
      const x = s / 18 * PLATE.w;
      const slope = (surface(x, depth + 0.009) - surface(x, depth)) / 8;
      const light = Math.max(0.035, Math.min(0.94, 0.09 + slope * 0.7));
      sheen.addColorStop(s / 18, seaColor(p, depth, light * (0.91 - 0.26 * depth)));
    }
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.lineTo(PLATE.w + step, PLATE.h + 160);
    ctx.lineTo(-step, PLATE.h + 160);
    ctx.closePath();
    ctx.fillStyle = sheen;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.strokeStyle = row % 5 === 0 ? p.glint + "91" : p.glint + "43";
    ctx.lineWidth = row % 5 === 0 ? 0.85 : 0.55;
    ctx.stroke();
  }
}

function bindControls() {
  const actions = { pause: togglePause, palette: changePalette, regenerate: regenerate, save: saveImage };
  Object.entries(actions).forEach(([id, action]) => {
    const button = document.getElementById(id);
    if (button) button.addEventListener("click", action);
  });
  document.addEventListener("keydown", event => {
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) || event.target.isContentEditable) return;
    // A barra de espaço em um botão preserva sua ação nativa acessível.
    if (event.code === "Space" && event.target.tagName === "BUTTON") return;
    const key = event.key.toLowerCase();
    if (event.code === "Space") { event.preventDefault(); togglePause(); }
    else if (key === "c") changePalette();
    else if (key === "r") regenerate();
    else if (key === "s") saveImage();
  });
}

function updateLabels() {
  const button = document.getElementById("pause");
  if (button) {
    button.innerHTML = (paused ? "Continuar" : "Pausar") + " <kbd>␣</kbd>";
    button.setAttribute("aria-pressed", String(paused));
  }
  const status = document.getElementById("motion-status");
  if (status) {
    status.textContent = paused ? "MARÉ EM REPOUSO" : "MARÉ EM MOVIMENTO";
    status.parentElement.classList.toggle("paused", paused);
  }
  const label = document.getElementById("palette-status");
  if (label) label.textContent = PALETTES[paletteIndex].name;
}

function togglePause() {
  paused = !paused;
  if (paused) noLoop(); else loop();
  updateLabels();
}

function changePalette() {
  paletteIndex = (paletteIndex + 1) % PALETTES.length;
  updateLabels();
  if (paused) redraw();
}

function regenerate() {
  seed = (seed * 16807) % 100000;
  if (seed === 0) seed = 7319;
  prepareLandscape();
  if (paused) redraw();
}

function saveImage() {
  saveCanvas(artCanvas.elt, "o-mar-entre-as-dobras-" + seed, "png");
}

// Se o CDN não carregar, a página explica como resolver em vez de ficar vazia.
window.addEventListener("load", () => {
  if (typeof window.p5 === "undefined") {
    const loading = document.getElementById("loading");
    if (loading) loading.textContent = "Não foi possível carregar o p5.js. Conecte-se à internet e recarregue a página.";
    document.querySelectorAll("button").forEach(button => { button.disabled = true; });
  }
});
