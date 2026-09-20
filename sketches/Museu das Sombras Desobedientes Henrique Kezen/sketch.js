/* Museu das Sombras Desobedientes — Henrique Kezen
 * Todos os elementos visuais são desenhados por código.
 * p5.js cuida do ciclo de desenho; o contexto 2D desenha as formas e a luz.
 */
'use strict';

const W = 1200;
const H = 740;
const IDLE_DELAY = 2.8;
const ink = '#434338';
const light = { x: 600, y: 190, tx: 600, ty: 190 };
const items = [
  { kind: 'cup', x: 325, y: 422, sx: 325, sy: 422, dx: -93.5, dy: 112, bend: 0 },
  { kind: 'key', x: 596, y: 438, sx: 596, sy: 438, dx: -.22, dy: 13, bend: 0 },
  { kind: 'vase', x: 855, y: 416, sx: 855, sy: 416, dx: 86.7, dy: 143, bend: 0 }
];
let ctx, paper, canvasElement;
let seconds = 0, idle = 0, mischief = 0, paused = false;
let lastPointer = null, lastStatus = '';
let cupShape, vaseShape, keyShape;

function setup() {
  pixelDensity(1);
  const canvas = createCanvas(W, H);
  canvas.parent('sketch-container');
  canvasElement = canvas.elt;
  canvasElement.setAttribute('tabindex', '0');
  canvasElement.setAttribute('role', 'img');
  canvasElement.setAttribute('aria-label', 'Museu das Sombras Desobedientes. Mova o mouse ou use as setas para controlar a luminária. Pare por três segundos para ver as sombras brincarem.');
  frameRate(60);
  ctx = drawingContext;
  makeShapes();
  paper = makePaper();
  document.getElementById('loading').remove();
  canvasElement.addEventListener('pointermove', moveLight);
  canvasElement.addEventListener('pointerdown', event => {
    canvasElement.focus({ preventScroll: true });
    canvasElement.setPointerCapture(event.pointerId);
    moveLight(event);
  });
  canvasElement.addEventListener('pointerleave', () => { lastPointer = null; });
  document.getElementById('pause').addEventListener('click', togglePause);
  document.getElementById('restart').addEventListener('click', restart);
  document.getElementById('save').addEventListener('click', saveImage);
  document.addEventListener('keydown', onKeyboard);
  updateStatus();
}

function makeShapes() {
  cupShape = new Path2D('M -38 -74 C -40 -51 -36 -14 -23 -6 Q 0 6 25 -6 C 35 -19 39 -51 36 -74 Q 0 -88 -38 -74 Z M 36 -66 C 80 -77 79 -13 35 -17 L 36 -31 C 59 -27 66 -57 37 -53 Z');
  vaseShape = new Path2D('M -17 -129 Q 0 -134 17 -129 L 14 -97 C 15 -80 43 -66 44 -42 Q 46 -13 25 -3 Q 0 8 -25 -3 C -46 -13 -46 -39 -41 -54 C -37 -72 -15 -82 -14 -97 Z');
  keyShape = new Path2D('M -24 -21 A 19 19 0 1 0 -24 17 Q -9 16 -6 4 L 42 4 L 42 -7 L 33 -7 L 33 -14 L 24 -14 L 24 -6 L -6 -6 Q -9 -21 -24 -21 Z M -24 -12 A 10 10 0 1 1 -24 8 A 10 10 0 1 1 -24 -12 Z');
}

function makePaper() {
  const texture = document.createElement('canvas');
  texture.width = W;
  texture.height = H;
  const p = texture.getContext('2d');
  const ground = p.createLinearGradient(0, 0, W, H);
  ground.addColorStop(0, '#f3eee3');
  ground.addColorStop(.6, '#ece5d4');
  ground.addColorStop(1, '#e5dbc7');
  p.fillStyle = ground;
  p.fillRect(0, 0, W, H);
  // Uma semente fixa mantém o grão imóvel entre os quadros.
  let seed = 87321;
  const randomValue = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let n = 0; n < 21000; n++) {
    const alpha = .015 + randomValue() * .06;
    p.fillStyle = `rgba(94,75,42,${alpha})`;
    p.fillRect(randomValue() * W, randomValue() * H, .4 + randomValue() * 1.3, .4 + randomValue());
  }
  return texture;
}

function draw() {
  const dt = Math.min(deltaTime / 1000 || 1 / 60, .05);
  if (!paused) {
    seconds += dt;
    idle += dt;
    light.x = easeTo(light.x, light.tx, 7, dt);
    light.y = easeTo(light.y, light.ty, 7, dt);
    mischief = easeTo(mischief, idle > IDLE_DELAY ? 1 : 0, idle > IDLE_DELAY ? 1.65 : 9, dt);
    updateShadows(dt);
  }
  paintScene();
  updateStatus();
}

function easeTo(value, target, speed, dt) {
  return value + (target - value) * (1 - Math.exp(-speed * dt));
}

function updateShadows(dt) {
  const p = mischief;
  const t = seconds;
  for (const item of items) {
    const height = item.kind === 'vase' ? 143 : 112;
    let dx = Math.max(-135, Math.min(135, (item.x - light.x) * .34));
    let dy = height + (light.y - 190) * .12;
    let sx = item.x;
    let sy = item.y;
    let bend = 0;
    if (item.kind === 'cup') {
      sx += p * (18 * Math.sin(t * 1.7));
      sy += p * (-10 + 10 * Math.cos(t * 2.4));
      dx += p * (52 * Math.sin(t * 1.65));
      dy += p * (28 * Math.sin(t * 2.4));
      bend = p * 21 * Math.sin(t * 1.9);
    } else if (item.kind === 'key') {
      // A chave ganha distância de seu dono em pequenos saltos.
      sx += p * (83 + 50 * Math.sin(t * .85));
      sy += p * (76 - 13 * Math.abs(Math.sin(t * 2.8)));
      dx = (item.x - light.x) * .055 + p * 19 * Math.sin(t * 2);
      dy = 13 + p * 10 * Math.cos(t * 1.4);
      bend = p * Math.sin(t * 1.6) * .48;
    } else {
      // O vaso se estica em direção à sombra da chave, sua vizinha.
      sx -= p * (18 + 9 * Math.sin(t * .8));
      sy += p * 9 * Math.sin(t * 1.8);
      dx = dx * (1 - p) + p * (-143 + 20 * Math.sin(t * 1.05));
      dy += p * (13 + 16 * Math.sin(t * 1.8));
      bend = p * (25 + 14 * Math.sin(t));
    }
    const speed = item.kind === 'cup' ? (p > .3 ? 4 : 1.6) : 8;
    item.sx = easeTo(item.sx, sx, 10, dt);
    item.sy = easeTo(item.sy, sy, 10, dt);
    item.dx = easeTo(item.dx, dx, speed, dt);
    item.dy = easeTo(item.dy, dy, speed, dt);
    item.bend = easeTo(item.bend, bend, 7, dt);
  }
}

function paintScene() {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(paper, 0, 0);
  drawRoom();
  drawLampArm();
  drawTable();
  drawLight();
  drawContactShadows();
  // A superfície da mesa contém as travessuras.
  ctx.save();
  tableTop();
  ctx.clip();
  for (const item of items) drawShadow(item);
  drawWhispers();
  ctx.restore();
  drawCup(items[0].x, items[0].y);
  drawKey(items[1].x, items[1].y);
  drawVase(items[2].x, items[2].y);
  drawLabels();
  drawLampHead();
  drawMarginalia();
  ctx.restore();
}

function strokeLine(x1, y1, x2, y2, color = ink, width = 1) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function oval(x, y, rx, ry, fill, stroke, width = 1) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
}

function textLine(text, x, y, font, color = ink, align = 'left') {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}

function drawRoom() {
  strokeLine(43, 81, 1157, 81, '#b8ae974d');
  textLine('MUSEU DAS SOMBRAS DESOBEDIENTES', 55, 54, '11px Georgia', '#7c725d');
  textLine('SALA 05   /   ACERVO INQUIETO', 1145, 54, '10px Arial', '#8c826e', 'right');
  // Um halo de luz ambiente e uma linha discreta de parede.
  const glow = ctx.createRadialGradient(560, 265, 10, 560, 265, 420);
  glow.addColorStop(0, '#fffae157');
  glow.addColorStop(1, '#fff2c000');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 83, W, 480);
  strokeLine(54, 578, 1146, 578, '#b5aa9233');
}

function tableTop() {
  ctx.beginPath();
  ctx.moveTo(186, 314);
  ctx.bezierCurveTo(188, 301, 202, 296, 216, 296);
  ctx.lineTo(981, 296);
  ctx.quadraticCurveTo(1003, 296, 1011, 315);
  ctx.lineTo(1100, 590);
  ctx.quadraticCurveTo(1108, 613, 1077, 614);
  ctx.lineTo(121, 614);
  ctx.quadraticCurveTo(94, 614, 102, 590);
  ctx.closePath();
}

function drawTable() {
  ctx.save();
  ctx.filter = 'blur(14px)';
  oval(603, 659, 477, 24, '#62543c15');
  ctx.restore();
  // Pernas e espessura dão peso à natureza-morta.
  for (const x of [171, 1007]) {
    const side = x < 500 ? 1 : -1;
    const leg = new Path2D(`M ${x} 603 L ${x + 21} 603 L ${x + 13 + side * 9} 681 L ${x + side * 8} 681 Z`);
    ctx.fillStyle = '#c2b294'; ctx.fill(leg);
    ctx.strokeStyle = '#9d8e724f'; ctx.lineWidth = 1; ctx.stroke(leg);
  }
  ctx.save();
  ctx.translate(0, 9);
  tableTop();
  ctx.fillStyle = '#c7b799'; ctx.fill();
  ctx.strokeStyle = '#a391704d'; ctx.stroke();
  ctx.restore();
  tableTop();
  const surface = ctx.createLinearGradient(0, 290, 0, 620);
  surface.addColorStop(0, '#e3d9bf');
  surface.addColorStop(.5, '#eee4ca');
  surface.addColorStop(1, '#e5d8bc');
  ctx.fillStyle = surface; ctx.fill();
  ctx.lineWidth = 1.2; ctx.strokeStyle = '#b5a585aa'; ctx.stroke();
  ctx.save();
  tableTop(); ctx.clip();
  ctx.globalAlpha = .20;
  ctx.globalCompositeOperation = 'multiply';
  ctx.drawImage(paper, 0, 0);
  ctx.restore();
}

function drawLight() {
  ctx.save();
  const glow = ctx.createRadialGradient(light.x, light.y + 124, 22, light.x, light.y + 158, 425);
  glow.addColorStop(0, '#fff2b36b');
  glow.addColorStop(.55, '#fff1bd34');
  glow.addColorStop(1, '#fff3c000');
  ctx.fillStyle = glow;
  ctx.fillRect(50, 90, 1100, 550);
  const cone = ctx.createLinearGradient(0, light.y, 0, 602);
  cone.addColorStop(0, '#fff8c030');
  cone.addColorStop(1, '#fff6bd00');
  ctx.fillStyle = cone;
  ctx.beginPath();
  ctx.moveTo(light.x - 31, light.y + 5);
  ctx.lineTo(light.x - 290, 604);
  ctx.quadraticCurveTo(light.x, 671, light.x + 290, 604);
  ctx.lineTo(light.x + 31, light.y + 5);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawLampArm() {
  const ex = 908 + (light.x - 600) * .20;
  const ey = 145 + (light.y - 190) * .24;
  ctx.save();
  ctx.lineCap = 'round';
  // O pé fica atrás da mesa; a haste acompanha a cabeça da luminária.
  oval(1023, 296, 47, 10, '#666653', '#4e5145');
  oval(1023, 291, 42, 8, '#85856b', '#5a5e4d');
  strokeLine(1023, 287, 1023, 179, '#565a4c', 8);
  strokeLine(1023, 183, ex, ey, '#555b4d', 9);
  strokeLine(ex, ey, light.x, light.y - 31, '#555b4d', 8);
  strokeLine(1022, 181, ex, ey - 2, '#b4ad8b', 2);
  strokeLine(ex, ey - 2, light.x, light.y - 34, '#aaa688', 2);
  for (const [x, y] of [[1023, 181], [ex, ey], [light.x, light.y - 31]]) {
    oval(x, y, 8, 8, '#d0bb88', '#545b4b', 1.5);
    oval(x, y, 2, 2, '#676a54');
  }
  ctx.beginPath();
  ctx.moveTo(1045, 291);
  ctx.bezierCurveTo(1126, 271, 1069, 407, 1150, 397);
  ctx.strokeStyle = '#81795e'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();
}

function drawLampHead() {
  ctx.save();
  ctx.translate(light.x, light.y);
  const shade = new Path2D('M -19 -30 Q 0 -43 19 -30 L 43 4 Q 0 24 -43 4 Z');
  const enamel = ctx.createLinearGradient(-40, 0, 40, 0);
  enamel.addColorStop(0, '#6d7560');
  enamel.addColorStop(.35, '#879078');
  enamel.addColorStop(1, '#4a5648');
  ctx.fillStyle = enamel; ctx.fill(shade);
  ctx.strokeStyle = '#48513f'; ctx.lineWidth = 1.4; ctx.stroke(shade);
  oval(0, 5, 41, 10, '#d0b77c', '#565c48');
  oval(0, 6, 33, 6, '#fff0b0');
  ctx.shadowColor = '#ffed92'; ctx.shadowBlur = 18;
  oval(0, 8, 11, 6, '#fff7d3');
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawContactShadows() {
  ctx.save();
  ctx.filter = 'blur(4px)';
  oval(325, 423, 44, 9, '#4d493528');
  oval(855, 420, 38, 8, '#4d493528');
  oval(596, 440, 42, 6, '#4d49351c');
  ctx.restore();
}

function drawShadow(item) {
  ctx.save();
  ctx.translate(item.sx, item.sy);
  ctx.filter = 'blur(3.2px)';
  ctx.fillStyle = '#34382ee0';
  ctx.globalAlpha = .74;
  if (item.kind === 'key') {
    ctx.translate(item.dx, item.dy);
    ctx.rotate(-.28 + item.bend);
    ctx.scale(1.22 + mischief * .13, .67 + mischief * .18);
    ctx.fill(keyShape, 'evenodd');
  } else {
    const height = item.kind === 'cup' ? 82 : 132;
    const shape = item.kind === 'cup' ? cupShape : vaseShape;
    // Deformação afim: o topo da silhueta se projeta para longe da luz.
    ctx.transform(1 + mischief * .06, 0, -item.dx / height, -item.dy / height, 0, 0);
    ctx.rotate(item.bend / 380);
    ctx.fill(shape, 'evenodd');
  }
  ctx.restore();
}

function drawCup(x, y) {
  ctx.save();
  ctx.translate(x, y);
  // A alça é pintada antes do corpo para manter a leitura da cerâmica.
  ctx.beginPath();
  ctx.ellipse(43, -43, 23, 25, .20, 0, Math.PI * 2);
  ctx.strokeStyle = '#777760'; ctx.lineWidth = 13; ctx.stroke();
  ctx.strokeStyle = '#e2dec6'; ctx.lineWidth = 9; ctx.stroke();
  const body = new Path2D('M -38 -74 C -39 -50 -37 -15 -23 -6 Q 0 6 25 -6 C 35 -20 39 -53 36 -74 Z');
  const ceramic = ctx.createLinearGradient(-38, -30, 40, -30);
  ceramic.addColorStop(0, '#d1cfb5');
  ceramic.addColorStop(.25, '#f8f0d7');
  ceramic.addColorStop(.64, '#eae5c9');
  ceramic.addColorStop(1, '#b5b9a0');
  ctx.fillStyle = ceramic; ctx.fill(body);
  ctx.strokeStyle = '#777b66'; ctx.lineWidth = 1.3; ctx.stroke(body);
  oval(-1, -74, 37, 10, '#faf1d7', '#6f745f', 1.4);
  oval(-1, -73, 29, 6, '#77705a');
  oval(-1, -72, 25, 4, '#7f6445');
  ctx.beginPath(); ctx.moveTo(-26, -57); ctx.quadraticCurveTo(-28, -31, -20, -18);
  ctx.strokeStyle = '#fff9dfad'; ctx.lineWidth = 3; ctx.stroke();
  // Pequena marca de esmalte: o objeto continua imóvel durante toda a cena.
  strokeLine(-5, -29, 7, -29, '#929a7d', 2);
  ctx.restore();
}

function drawKey(x, y) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-.28);
  ctx.scale(1, .70);
  ctx.translate(0, 3);
  ctx.fillStyle = '#83734b'; ctx.fill(keyShape, 'evenodd');
  ctx.translate(0, -3);
  const brass = ctx.createLinearGradient(0, -22, 0, 18);
  brass.addColorStop(0, '#d7bc77');
  brass.addColorStop(.5, '#b69855');
  brass.addColorStop(1, '#887a50');
  ctx.fillStyle = brass; ctx.fill(keyShape, 'evenodd');
  ctx.strokeStyle = '#7e714e'; ctx.lineWidth = 1; ctx.stroke(keyShape);
  strokeLine(-4, -2, 37, -2, '#e4cf93', 1.5);
  ctx.restore();
}

function drawVase(x, y) {
  ctx.save(); ctx.translate(x, y);
  const glaze = ctx.createLinearGradient(-44, 0, 44, 0);
  glaze.addColorStop(0, '#777d67');
  glaze.addColorStop(.25, '#a5aa8b');
  glaze.addColorStop(.48, '#bfc1a0');
  glaze.addColorStop(1, '#737f69');
  ctx.fillStyle = glaze; ctx.fill(vaseShape);
  ctx.strokeStyle = '#69745e'; ctx.lineWidth = 1.3; ctx.stroke(vaseShape);
  oval(0, -129, 17, 4.5, '#899176', '#68715b');
  oval(0, -129, 11, 2.4, '#4e5e49');
  ctx.beginPath(); ctx.moveTo(-7, -111); ctx.bezierCurveTo(-5, -80, -28, -57, -26, -37);
  ctx.strokeStyle = '#e4e1b859'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, -26, 36, 11, 0, .22, Math.PI - .22);
  ctx.strokeStyle = '#78836b69'; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();
}

function drawLabels() {
  const labels = [
    [325, '01', 'A atrasada', 'xícara de cerâmica'],
    [596, '02', 'A fugitiva', 'chave sem fechadura'],
    [855, '03', 'A carente', 'vaso de companhia']
  ];
  for (const [x, number, title, subtitle] of labels) {
    ctx.save();
    ctx.translate(x, 649);
    textLine(number, -75, 0, '10px Arial', '#9b8b6b');
    strokeLine(-54, -9, -54, 25, '#b9ac904d');
    textLine(title, -40, 0, 'italic 18px Georgia', '#595847');
    textLine(subtitle, -40, 18, '10px Arial', '#8e8370');
    ctx.restore();
  }
}

function drawWhispers() {
  if (mischief < .15) return;
  ctx.save();
  ctx.globalAlpha = mischief * .66;
  const key = items[1];
  const vase = items[2];
  textLine('já vou…', items[0].sx - 51, items[0].sy + items[0].dy + 28, 'italic 14px Georgia', '#6d6754');
  textLine('por aqui!', key.sx - 4, key.sy + 41, 'italic 14px Georgia', '#6d6754');
  textLine('me espera.', vase.sx + vase.dx - 3, vase.sy + vase.dy + 27, 'italic 14px Georgia', '#6d6754');
  // Pequenos arcos indicam o salto sem acrescentar outros personagens.
  ctx.strokeStyle = '#81765a'; ctx.lineWidth = .8;
  for (let n = 0; n < 2; n++) {
    ctx.beginPath();
    ctx.arc(key.sx - 40 - n * 8, key.sy + 8, 7 + n * 3, Math.PI * .65, Math.PI * 1.25);
    ctx.stroke();
  }
  ctx.restore();
}

function drawMarginalia() {
  textLine('OBJETOS EM REPOUSO. SOMBRAS, NEM TANTO.', 55, 714, '9px Arial', '#948770');
  textLine('Henrique Kezen  ·  2026', 1145, 714, 'italic 11px Georgia', '#948770', 'right');
  if (!paused && idle < IDLE_DELAY) {
    const amount = Math.min(1, idle / IDLE_DELAY);
    ctx.beginPath(); ctx.arc(1139, 116, 12, -Math.PI / 2, -Math.PI / 2 + amount * Math.PI * 2);
    ctx.strokeStyle = '#a18b585c'; ctx.lineWidth = 1; ctx.stroke();
  }
}

function moveLight(event) {
  const bounds = canvasElement.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width * W;
  const y = (event.clientY - bounds.top) / bounds.height * H;
  if (lastPointer && Math.hypot(x - lastPointer.x, y - lastPointer.y) < .8) return;
  lastPointer = { x, y };
  // A luminária percorre o alto da cena, preservando a mesa livre.
  light.tx = Math.max(165, Math.min(1005, x));
  light.ty = 142 + Math.max(0, Math.min(H, y)) / H * 108;
  idle = 0;
}

function updateStatus() {
  const state = paused ? 'paused' : idle > IDLE_DELAY ? 'playing' : mischief > .06 ? 'returning' : 'watching';
  if (state === lastStatus) return;
  lastStatus = state;
  document.body.dataset.scene = state;
  const copy = {
    paused: ['TEMPO SUSPENSO', 'Até as sombras precisam de uma pausa.'],
    playing: ['NINGUÉM ESTÁ OLHANDO', 'Elas acham que você se distraiu.'],
    returning: ['NADA ACONTECEU…', 'Muito comportadas. Quase convincentes.'],
    watching: ['SOB OBSERVAÇÃO', 'Mova a luz. Depois, fique imóvel por um instante.']
  };
  document.getElementById('motion-status').textContent = copy[state][0];
  document.getElementById('scene-hint').textContent = copy[state][1];
}

function togglePause() {
  paused = !paused;
  const button = document.getElementById('pause');
  button.innerHTML = `${paused ? 'Continuar' : 'Pausar'} <kbd>␣</kbd>`;
  button.setAttribute('aria-pressed', String(paused));
  if (paused) noLoop(); else loop();
  updateStatus();
}

function restart() {
  seconds = 0; idle = 0; mischief = 0;
  light.x = light.tx = 600;
  light.y = light.ty = 190;
  lastPointer = null;
  for (const item of items) {
    item.sx = item.x; item.sy = item.y; item.bend = 0;
    item.dx = item.kind === 'key' ? 0 : (item.x - light.x) * .34;
    item.dy = item.kind === 'key' ? 13 : item.kind === 'cup' ? 112 : 143;
  }
  if (paused) togglePause();
  updateStatus();
}

function saveImage() {
  saveCanvas('Museu-das-Sombras-Desobedientes-Henrique-Kezen', 'png');
}

function onKeyboard(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const tag = event.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || event.target.isContentEditable) return;
  // Botões mantêm a ação nativa do Espaço/Enter, sem disparar duas vezes.
  if (tag === 'BUTTON' && (event.code === 'Space' || event.code === 'Enter')) return;
  if (event.code === 'Space') { event.preventDefault(); togglePause(); }
  if (event.key.toLowerCase() === 'r') restart();
  if (event.key.toLowerCase() === 's') saveImage();
  if (event.target !== canvasElement || !event.key.startsWith('Arrow')) return;
  event.preventDefault();
  if (event.key === 'ArrowLeft') light.tx = Math.max(165, light.tx - 24);
  if (event.key === 'ArrowRight') light.tx = Math.min(1005, light.tx + 24);
  if (event.key === 'ArrowUp') light.ty = Math.max(142, light.ty - 10);
  if (event.key === 'ArrowDown') light.ty = Math.min(250, light.ty + 10);
  idle = 0;
}
