/*
  ARTEFATO 10 - CHAVEIRO DE PALAVRAS
  p5.js 2.3.4 | WEBGL
  Uma fechadura de pinos (tipo Yale) desenhada em corte, como uma planta tecnica.
  A chave e modelada a mao: cada letra da palavra define a profundidade de um
  corte, e o perfil resultante e extrudado em uma p5.Geometry com buildGeometry().
*/

const L = 900;
const A = 570;

// ---- Medidas da fechadura (coordenadas do mundo, y para baixo) ----
const PLUG_R = 40;          // raio do cilindro (plug); a linha de corte fica em y = -PLUG_R
const PLUG_X0 = -120;       // face frontal do plug
const PLUG_X1 = 80;         // fundo do plug
const TETO = -124;          // teto das camaras dos pinos
const PISO_CHAVE = 12;      // fundo do canal da chave
const DRIVER = 24;          // comprimento do pino superior (driver)
const PIN_R = 6;

// ---- Medidas da chave (coordenadas locais; x = 0 e o ombro da chave) ----
const LAMINA = 195;
const ESPESSURA = 3.5;
const CORTES_X = [30, 65, 100, 135, 170];   // posicao dos pinos ao longo da lamina
const H_MAX = 38;

const SEGREDOS = ['PORTA', 'SENHA', 'TRAVA', 'ABRIR', 'BURRO', 'MOLAS', 'FECHO', 'CHAVE'];

let segredo = 'PORTA';
let palavra = 'CHAVE';
let niveis = [];
let geoChave;

let ox = -360;              // posicao x do ombro da chave no mundo
let estado = 'fora';        // fora | entrando | dentro | girando | aberta | saindo
let anguloPlug = 0;
let tremor = 0;
let pinoY = [12, 12, 12, 12, 12];   // y da base de cada pino inferior
let tempo = 0;

function nivelDaLetra(c) {
  const k = c.toUpperCase().charCodeAt(0) - 65;
  return (k >= 0 && k < 26) ? k % 6 : 0;
}

function niveisDe(p) {
  const s = (p.toUpperCase().replace(/[^A-Z]/g, '') + 'AAAAA').slice(0, 5);
  return [...s].map(nivelDaLetra);
}

function alturaDoNivel(n) { return 14 + n * 4; }  // altura da lamina no corte

// Perfil superior da lamina: altura h(x) medida a partir do fundo da chave.
function perfil(x, nv) {
  const pts = [[0, H_MAX], [14, H_MAX]];
  for (let k = 0; k < 5; k++) {
    const h = alturaDoNivel(nv[k]);
    if (k > 0) {
      const meio = (CORTES_X[k - 1] + CORTES_X[k]) / 2;
      const hAnt = alturaDoNivel(nv[k - 1]);
      pts.push([meio, min(H_MAX, max(h, hAnt) + 5)]);   // crista entre dois cortes
    }
    pts.push([CORTES_X[k] - 4, h], [CORTES_X[k] + 4, h]);
  }
  pts.push([LAMINA - 8, alturaDoNivel(nv[4]) * 0.6 + 4], [LAMINA, 6]);
  if (x <= 0) return H_MAX;
  if (x >= LAMINA) return 6;
  for (let i = 1; i < pts.length; i++) {
    if (x <= pts[i][0]) {
      const [x0, h0] = pts[i - 1];
      const [x1, h1] = pts[i];
      return x1 === x0 ? h1 : lerp(h0, h1, (x - x0) / (x1 - x0));
    }
  }
  return 6;
}

// ---- Modelagem: helpers que emitem quads como dois triangulos com normal ----
function quad3(a, b, c, d, n) {
  normal(n[0], n[1], n[2]);
  for (const p of [a, b, c, a, c, d]) vertex(p[0], p[1], p[2]);
}

function caixa(x0, x1, y0, y1, z0, z1) {
  quad3([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1]);
  quad3([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1]);
  quad3([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0]);
  quad3([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 0]);
  quad3([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0]);
  quad3([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0]);
}

function construirChave(nv) {
  return buildGeometry(() => {
    beginShape(TRIANGLES);
    const T = ESPESSURA;
    const yb = PISO_CHAVE;

    // Lamina: extrusao do perfil em faixas verticais
    const N = 130;
    for (let i = 0; i < N; i++) {
      const x0 = (LAMINA * i) / N;
      const x1 = (LAMINA * (i + 1)) / N;
      const t0 = yb - perfil(x0 + 0.001, nv);
      const t1 = yb - perfil(x1 - 0.001, nv);
      quad3([x0, t0, T], [x1, t1, T], [x1, yb, T], [x0, yb, T], [0, 0, 1]);
      quad3([x1, t1, -T], [x0, t0, -T], [x0, yb, -T], [x1, yb, -T], [0, 0, -1]);
      const dx = x1 - x0, dy = t1 - t0, len = sqrt(dx * dx + dy * dy);
      quad3([x0, t0, -T], [x1, t1, -T], [x1, t1, T], [x0, t0, T], [dy / len, -dx / len, 0]);
      quad3([x0, yb, T], [x1, yb, T], [x1, yb, -T], [x0, yb, -T], [0, 1, 0]);
    }
    const tp = yb - perfil(LAMINA, nv);
    quad3([LAMINA, tp, T], [LAMINA, tp, -T], [LAMINA, yb, -T], [LAMINA, yb, T], [1, 0, 0]);

    // Sulco longitudinal (o "canal" que impede chaves erradas de entrar)
    caixa(4, LAMINA - 12, yb - 9, yb - 5, T, T + 0.8);

    // Ombro
    caixa(-14, 0, yb - 52, yb + 8, -T - 1.5, T + 1.5);

    // Cabeca (anel) com furo para o chaveiro
    const cx = -52, cy = yb - 22, R = 40, r = 13, S = 48, Z = T + 1.5;
    for (let i = 0; i < S; i++) {
      const a0 = (TWO_PI * i) / S, a1 = (TWO_PI * (i + 1)) / S;
      const c0 = cos(a0), s0 = sin(a0), c1 = cos(a1), s1 = sin(a1);
      const o0 = [cx + R * c0, cy + R * s0], o1 = [cx + R * c1, cy + R * s1];
      const i0 = [cx + r * c0, cy + r * s0], i1 = [cx + r * c1, cy + r * s1];
      quad3([i0[0], i0[1], Z], [o0[0], o0[1], Z], [o1[0], o1[1], Z], [i1[0], i1[1], Z], [0, 0, 1]);
      quad3([o0[0], o0[1], -Z], [i0[0], i0[1], -Z], [i1[0], i1[1], -Z], [o1[0], o1[1], -Z], [0, 0, -1]);
      const cm = cos((a0 + a1) / 2), sm = sin((a0 + a1) / 2);
      quad3([o0[0], o0[1], Z], [o0[0], o0[1], -Z], [o1[0], o1[1], -Z], [o1[0], o1[1], Z], [cm, sm, 0]);
      quad3([i0[0], i0[1], -Z], [i0[0], i0[1], Z], [i1[0], i1[1], Z], [i1[0], i1[1], -Z], [-cm, -sm, 0]);
    }
    endShape();
  });
}

// ---- Estado / interface ----
function cortarChave(p) {
  palavra = (p.toUpperCase().replace(/[^A-Z]/g, '') + 'AAAAA').slice(0, 5);
  niveis = niveisDe(palavra);
  if (geoChave) freeGeometry(geoChave);
  geoChave = construirChave(niveis);
  if (estado !== 'fora') estado = 'saindo';
  anguloPlug = 0;
  atualizarStatus();
}

function alternarChave() {
  if (estado === 'fora' || estado === 'saindo') estado = 'entrando';
  else estado = 'saindo';
  atualizarStatus();
}

function atualizarStatus(msg) {
  const el = document.getElementById('status');
  if (!el) return;
  if (msg) { el.innerHTML = msg; return; }
  const segredoTxt = estado === 'aberta' ? segredo : '?????';
  let txt = `Chave cortada: <b>${palavra}</b> → cortes [${niveis.join(' ')}] · segredo da fechadura: <b>${segredoTxt}</b>`;
  if (estado === 'dentro' || estado === 'girando' || estado === 'aberta') {
    const alvo = niveisDe(segredo);
    const leitura = niveis.map((n, k) => {
      if (n === alvo[k]) return `<span class="ok">${k + 1}✓</span>`;
      return n > alvo[k] ? `<span class="alto">${k + 1}▲</span>` : `<span class="baixo">${k + 1}▼</span>`;
    }).join(' ');
    txt += `<br>Pinos: ${leitura}` + (estado === 'aberta' ? ' — <span class="ok">ABRIU!</span>' : '');
  }
  el.innerHTML = txt;
}

function setup() {
  const tela = createCanvas(L, A, WEBGL);
  tela.parent('sketch-container');
  pixelDensity(1);
  camera(170, -230, 470, -40, -30, 0, 0, 1, 0);
  segredo = random(SEGREDOS.filter(s => s !== 'CHAVE'));
  cortarChave('CHAVE');

  const campo = document.getElementById('palavra');
  campo.addEventListener('input', () => cortarChave(campo.value || 'A'));
  campo.addEventListener('keydown', e => { if (e.key === 'Enter') alternarChave(); });
  document.getElementById('btInserir').onclick = alternarChave;
  document.getElementById('btSegredo').onclick = () => {
    segredo = random(SEGREDOS.filter(s => s !== segredo));
    estado = 'saindo';
    anguloPlug = 0;
    atualizarStatus();
  };
  document.getElementById('btObj').onclick = () => geoChave.saveObj('chave-' + palavra.toLowerCase() + '.obj');

  describe('Fechadura de pinos em corte, estilo planta tecnica azul. Uma chave dourada, gerada a partir de uma palavra de cinco letras, entra no cilindro; os pinos sobem e, se a palavra bater com o segredo, o cilindro gira.');
}

function atualizarAnimacao() {
  tempo += deltaTime / 1000;
  const alvoX = (estado === 'entrando' || estado === 'dentro' || estado === 'girando' || estado === 'aberta') ? PLUG_X0 : -360;
  if (estado === 'entrando' || estado === 'saindo') {
    const passo = 170 * min(deltaTime, 50) / 1000;   // ~1,4 s para entrar, independente do fps
    ox += constrain(alvoX - ox, -passo, passo);
    if (abs(ox - alvoX) < 0.01) {
      ox = alvoX;
      if (estado === 'entrando') {
        const ok = niveis.every((n, k) => n === niveisDe(segredo)[k]);
        estado = ok ? 'girando' : 'dentro';
        if (!ok) tremor = 1;
      } else estado = 'fora';
      atualizarStatus();
    }
  }
  if (estado === 'girando') {
    anguloPlug = lerp(anguloPlug, -HALF_PI, 0.06);
    if (abs(anguloPlug + HALF_PI) < 0.01) { anguloPlug = -HALF_PI; estado = 'aberta'; atualizarStatus(); }
  } else if (estado !== 'aberta') {
    anguloPlug = lerp(anguloPlug, 0, 0.2);
  }
  tremor = max(0, tremor - deltaTime / 900);

  // Cada pino inferior pousa sobre o perfil da chave (ou no fundo do canal)
  for (let k = 0; k < 5; k++) {
    const px = PLUG_X0 + CORTES_X[k];
    const kx = px - ox;
    const alvo = (kx >= 0 && kx <= LAMINA) ? PISO_CHAVE - perfil(kx, niveis) : PISO_CHAVE;
    pinoY[k] = lerp(pinoY[k], alvo, 0.45);
  }
}

function comprimentoPino(k) {
  return (PISO_CHAVE + PLUG_R) - alturaDoNivel(niveisDe(segredo)[k]);
}

function mola(x, y0, y1) {
  noFill();
  stroke(150, 200, 255);
  strokeWeight(1.3);
  beginShape();
  const voltas = 9, passos = voltas * 16;
  for (let i = 0; i <= passos; i++) {
    const t = i / passos;
    const a = t * voltas * TWO_PI;
    vertex(x + 5 * cos(a), lerp(y0, y1, t), 5 * sin(a));
  }
  endShape();
}

function grade() {
  stroke(60, 95, 150, 90);
  strokeWeight(1);
  for (let i = -400; i <= 400; i += 40) {
    line(i, 90, -300, i, 90, 300);
    if (abs(i) <= 300) line(-400, 90, i, 400, 90, i);
  }
}

function draw() {
  atualizarAnimacao();
  background(11, 20, 36);
  orbitControl(1, 1, 0.2);

  ambientLight(70, 80, 105);
  directionalLight(255, 245, 225, -0.4, 0.8, -0.6);
  pointLight(140, 190, 255, -250, -200, 250);

  grade();

  const alvo = niveisDe(segredo);
  const conferido = estado === 'dentro' || estado === 'girando' || estado === 'aberta';
  const jiggle = sin(tempo * 60) * 0.06 * tremor;

  // ---- Parte que gira junto com o plug: chave e pinos inferiores ----
  push();
  rotateX(anguloPlug + jiggle);

  push();
  translate(ox, 0, 0);
  noStroke();
  specularMaterial(240, 200, 110);
  shininess(40);
  fill(214, 170, 78);
  model(geoChave);
  pop();

  for (let k = 0; k < 5; k++) {
    const x = PLUG_X0 + CORTES_X[k];
    const len = comprimentoPino(k);
    push();
    translate(x, pinoY[k] - len / 2, 0);
    noStroke();
    if (conferido) fill(niveis[k] === alvo[k] ? color(110, 240, 160) : color(255, 120, 105));
    else fill(222, 176, 88);
    specularMaterial(255);
    shininess(30);
    cylinder(PIN_R, len, 16, 1);
    translate(0, len / 2, 0);
    cone(PIN_R, 5, 16, 1);   // ponta do pino que encosta na chave
    pop();
  }
  pop();

  // ---- Parte fixa: pinos superiores e molas ----
  for (let k = 0; k < 5; k++) {
    const x = PLUG_X0 + CORTES_X[k];
    const topoPinoInf = pinoY[k] - comprimentoPino(k);
    const base = (estado === 'girando' || estado === 'aberta') ? -PLUG_R : topoPinoInf;
    push();
    translate(x, base - DRIVER / 2, 0);
    noStroke();
    fill(170, 185, 210);
    specularMaterial(255);
    shininess(60);
    cylinder(PIN_R, DRIVER, 16, 1);
    pop();
    mola(x, TETO, base - DRIVER);
  }

  // ---- Linha de corte (shear line) ----
  stroke(255, 220, 120, 160);
  strokeWeight(1);
  line(PLUG_X0 - 10, -PLUG_R, 0, PLUG_X1 + 10, -PLUG_R, 0);

  // ---- Plug e carcaca transparentes, desenhados por ultimo ----
  push();
  rotateX(anguloPlug + jiggle);
  translate((PLUG_X0 + PLUG_X1) / 2, 0, 0);
  rotateZ(HALF_PI);
  fill(120, 170, 255, 34);
  stroke(120, 180, 255, 110);
  strokeWeight(0.6);
  cylinder(PLUG_R, PLUG_X1 - PLUG_X0, 28, 6);
  pop();

  push();
  translate((PLUG_X0 + PLUG_X1) / 2, 0, 0);
  noFill();
  stroke(90, 140, 220, 120);
  strokeWeight(0.8);
  push();
  rotateZ(HALF_PI);
  cylinder(PLUG_R + 18, PLUG_X1 - PLUG_X0, 24, 1);
  pop();
  translate(0, (TETO - PLUG_R) / 2 - 8, 0);
  box(PLUG_X1 - PLUG_X0, -TETO - PLUG_R + 16, 40);
  pop();

  // Camaras dos pinos
  for (let k = 0; k < 5; k++) {
    push();
    translate(PLUG_X0 + CORTES_X[k], (TETO - PLUG_R) / 2, 0);
    noFill();
    stroke(90, 140, 220, 70);
    strokeWeight(0.6);
    cylinder(PIN_R + 1.5, -TETO - PLUG_R, 10, 1, false, false);
    pop();
  }
}

function keyPressed() {
  if (document.activeElement && document.activeElement.id === 'palavra') return;
  if (keyCode === ENTER) alternarChave();
}
