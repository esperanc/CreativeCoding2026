const CANAIS = [
  { texto: "Singel", r: 150 },
  { texto: "Herengracht", r: 235 },
  { texto: "Keizersgracht", r: 320 },
  { texto: "Prinsengracht", r: 405 },
];

const FAIXAS = 3;
const ESPACO = 19;
const VMAX = 1.2;
const REDEMOINHO = 14;
const N_BARCOS = 4;
const ESTEIRA = 16;
const A0 = 0.12;
const A1 = Math.PI - 0.12;

const AGUA = [34, 48, 46];
let faixas = [];
let barcos = [];
let cx, cy;

function setup() {
  createCanvas(900, 640);
  cx = width / 2;
  cy = 70;
  textFont("Georgia");
  textAlign(LEFT, CENTER);
  noStroke();

  CANAIS.forEach((c, ci) => {
    for (let k = 0; k < FAIXAS; k++) {
      const u = FAIXAS === 1 ? 0 : map(k, 0, FAIXAS - 1, -1, 1);
      const meio = 1 - u * u;

      const f = {
        canal: ci,
        u,
        r: c.r + u * ESPACO * ((FAIXAS - 1) / 2),
        vel: 0.25 + VMAX * meio,
        tam: lerp(11, 15, meio),
        cor: [lerp(140, 230, meio), lerp(162, 238, meio), lerp(154, 232, meio)],
        letras: [],
      };
      f.comp = f.r * (A1 - A0);

      textSize(f.tam);
      const unidade = c.texto + "    ";
      let o = 0;
      while (o < f.comp + 100) {
        for (const ch of unidade) {
          f.letras.push({ ch, o, i: f.letras.length });
          o += textWidth(ch);
        }
      }
      f.total = o;
      f.s0 = random(f.total);
      faixas.push(f);
    }
  });

  const cascos = [[196, 160, 104], [62, 92, 120], [150, 58, 50], [0, 100, 0]];
  for (let i = 0; i < N_BARCOS; i++) {
    const canal = i % CANAIS.length;
    const vel = random([-1, 1]) * random(0.6, 1.8);
    barcos.push({
      canal,
      comp: CANAIS[canal].r * (A1 - A0),
      s: random(CANAIS[canal].r * (A1 - A0)),
      vel,
      tam: random(30, 42),
      larg: random(11, 14),
      casco: cascos[i % cascos.length],
    });
  }
  background(...AGUA);
}

function draw() {
  background(...AGUA, 150);
  const t = frameCount * 0.004;

  for (const b of barcos) {
    b.s = (b.s + b.vel + b.comp) % b.comp;
  }

  for (const f of faixas) {
    f.s0 += f.vel;
    textSize(f.tam);
    fill(...f.cor);

    for (const L of f.letras) {
      let s = (f.s0 + L.o) % f.total;
      s += REDEMOINHO * (noise(s * 0.003, f.r * 0.01, t) - 0.5);
      if (s < 0 || s > f.comp) continue;

      let dr = 0;
      const sCentro = s * (CANAIS[f.canal].r / f.r);
      for (const b of barcos) {
        if (b.canal !== f.canal) continue;
        const d = (sCentro - b.s) * Math.sign(b.vel);
        const largura = d > 0 ? 18 : 90;
        const forca = Math.exp(-(d * d) / (largura * largura));
        if (forca < 0.01) continue;
        const lado = f.u > 0 ? 1 : f.u < 0 ? -1 : (L.i % 2 ? 1 : -1);
        dr += lado * ESTEIRA * forca * (f.u === 0 ? 1 : 0.6);
      }

      const rr = f.r + dr + 2 * (noise(s * 0.01, f.r, t * 2) - 0.5);
      const a = A1 - s / f.r;
      push();
      translate(cx + rr * cos(a), cy + rr * sin(a));
      rotate(a - HALF_PI);
      text(L.ch, 0, 0);
      pop();
    }
  }

  for (const b of barcos) desenhaBarco(b);
}

function desenhaBarco(b) {
  const r = CANAIS[b.canal].r;
  const a = A1 - b.s / r;
  push();
  translate(cx + r * cos(a), cy + r * sin(a));
  rotate(a - HALF_PI + (b.vel < 0 ? PI : 0));

  const c = b.tam, l = b.larg;
  fill(15, 22, 21, 110);
  ellipse(2, 3, c, l);

  fill(...b.casco);
  beginShape();
  vertex(-c / 2, -l / 2);
  vertex(c * 0.22, -l / 2);
  vertex(c / 2, 0);
  vertex(c * 0.22, l / 2);
  vertex(-c / 2, l / 2);
  endShape(CLOSE);

  fill(240, 238, 230, 220);
  rect(-c * 0.32, -l * 0.27, c * 0.4, l * 0.54, 2);
  pop();
}