// Geometric Motion — grafo progressivo com bolinhas que ricocheteiam
// Cole no editor.p5js.org (substitui o conteúdo de sketch.js)
//
// Teclas:  ESPAÇO = pausar/retomar   R = recomeçar   S = salvar PNG

const CONFIG = {
  ESTATICO: false,     // true = bolinhas paradas; o grafo se forma e o desenho para no fim
  numNos: 60,          // total de bolinhas
  intervalo: 18,       // quadros entre o nascimento de uma bolinha e a próxima
  distMax: 190,        // distância máxima para ligar duas bolinhas
  probVizinho: 0.75,   // chance de uma nova bolinha nascer perto de uma existente
  velocidade: 2.2,     // velocidade das bolinhas (pixels por quadro)
  colisoes: true,      // as bolinhas também batem umas nas outras
  velNascimento: 0.04, // rapidez com que uma bolinha aparece
  velLigacao: 0.03,    // rapidez com que uma linha cresce
  ciclo: true,         // recomeça sozinho depois de completo
  esperaFinal: 600,    // quadros de espera antes de recomeçar
  cor: [70, 230, 40],  // verde
  semente: null        // número fixo para repetir a mesma composição
};

let nos, ligacoes, contador, completoDesde, apagando;

function setup() {
  createCanvas(windowWidth, windowHeight);
  iniciar();
}

function iniciar() {
  randomSeed(CONFIG.semente ?? floor(random(1e6)));
  nos = [];
  ligacoes = new Map();
  contador = 0;
  completoDesde = null;
  apagando = 1;
  loop();
}

function draw() {
  background(0);

  if (nos.length < CONFIG.numNos && contador % CONFIG.intervalo === 0) adicionarNo();
  contador++;

  for (const n of nos) n.nasc = min(1, n.nasc + CONFIG.velNascimento);
  if (!CONFIG.ESTATICO) mover();

  atualizarLigacoes();
  desenharLigacoes();
  desenharNos();
  verificarFim();
}

// ---------- crescimento ----------

function adicionarNo() {
  const r = random(6, 12);
  let p;
  if (nos.length > 0 && random() < CONFIG.probVizinho) {
    const base = random(nos);
    const ang = random(TWO_PI);
    const d = random(0.3, 0.85) * CONFIG.distMax;
    p = createVector(base.pos.x + cos(ang) * d, base.pos.y + sin(ang) * d);
  } else {
    p = createVector(random(width), random(height));
  }
  p.x = constrain(p.x, r, width - r);
  p.y = constrain(p.y, r, height - r);

  nos.push({
    pos: p,
    vel: p5.Vector.random2D().mult(random(0.6, 1) * CONFIG.velocidade),
    r,
    nasc: 0,
    batida: 0 // clarão de impacto, de 1 a 0
  });
}

function atualizarLigacoes() {
  for (let i = 0; i < nos.length; i++) {
    for (let j = i + 1; j < nos.length; j++) {
      const a = nos[i], b = nos[j];
      const d = dist(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
      const chave = i * 10000 + j;
      const lig = ligacoes.get(chave);

      if (d < CONFIG.distMax && a.nasc > 0.4 && b.nasc > 0.4) {
        if (lig) lig.p = min(1, lig.p + CONFIG.velLigacao);
        else ligacoes.set(chave, { i, j, p: 0 });
      } else if (lig) {
        lig.p -= CONFIG.velLigacao * 2; // a linha se recolhe quando as bolinhas se afastam
        if (lig.p <= 0) ligacoes.delete(chave);
      }
    }
  }
}

// ---------- física das bolinhas ----------

function mover() {
  // linha reta + ricochete nas paredes
  for (const n of nos) {
    n.pos.add(n.vel);
    const raio = n.r / 2;
    if (n.pos.x < raio)          { n.pos.x = raio;          n.vel.x =  abs(n.vel.x); n.batida = 1; }
    if (n.pos.x > width - raio)  { n.pos.x = width - raio;  n.vel.x = -abs(n.vel.x); n.batida = 1; }
    if (n.pos.y < raio)          { n.pos.y = raio;          n.vel.y =  abs(n.vel.y); n.batida = 1; }
    if (n.pos.y > height - raio) { n.pos.y = height - raio; n.vel.y = -abs(n.vel.y); n.batida = 1; }
    n.batida = max(0, n.batida - 0.05);
  }
  if (CONFIG.colisoes) colidir();
}

function colidir() {
  // choque elástico entre bolinhas de mesma massa
  for (let i = 0; i < nos.length; i++) {
    for (let j = i + 1; j < nos.length; j++) {
      const a = nos[i], b = nos[j];
      if (a.nasc < 1 || b.nasc < 1) continue;
      const delta = p5.Vector.sub(b.pos, a.pos);
      const d = delta.mag();
      const minimo = (a.r + b.r) / 2;
      if (d === 0 || d >= minimo) continue;

      const normal = delta.div(d);
      const aproximacao = p5.Vector.sub(a.vel, b.vel).dot(normal);
      if (aproximacao > 0) {
        a.vel.sub(p5.Vector.mult(normal, aproximacao));
        b.vel.add(p5.Vector.mult(normal, aproximacao));
        a.batida = b.batida = 1;
      }
      const sobra = (minimo - d) / 2; // separa para não grudarem
      a.pos.sub(p5.Vector.mult(normal, sobra));
      b.pos.add(p5.Vector.mult(normal, sobra));
    }
  }
}

// ---------- desenho ----------

function desenharLigacoes() {
  const [r, g, b] = CONFIG.cor;
  for (const lig of ligacoes.values()) {
    const a = nos[lig.i].pos; // a bolinha mais antiga é a origem da linha
    const c = nos[lig.j].pos;
    const d = dist(a.x, a.y, c.x, c.y);
    const t = constrain(1 - d / CONFIG.distMax, 0, 1);
    const k = 1 - pow(1 - lig.p, 3);
    stroke(r, g, b, (40 + 215 * t) * apagando);
    strokeWeight(0.5 + 3 * t * t);
    line(a.x, a.y, lerp(a.x, c.x, k), lerp(a.y, c.y, k));
  }
}

function desenharNos() {
  const [r, g, b] = CONFIG.cor;
  for (const n of nos) {
    if (n.nasc < 1) { // anel de nascimento
      noFill();
      stroke(r, g, b, 200 * (1 - n.nasc) * apagando);
      strokeWeight(1);
      circle(n.pos.x, n.pos.y, n.r + 40 * n.nasc);
    }
    if (n.batida > 0) { // clarão de impacto
      noStroke();
      fill(r, g, b, 120 * n.batida * apagando);
      circle(n.pos.x, n.pos.y, n.r + 18 * n.batida);
    }
    stroke(r, g, b, 255 * apagando);
    strokeWeight(1.6);
    fill(0);
    circle(n.pos.x, n.pos.y, n.r * crescer(n.nasc));
  }
}

function crescer(x) {
  const c = 1.7; // leve "salto" ao aparecer
  return 1 + (c + 1) * pow(x - 1, 3) + c * pow(x - 1, 2);
}

// ---------- fim de ciclo ----------

function verificarFim() {
  const todosNasceram = nos.length === CONFIG.numNos && nos.every(n => n.nasc >= 1);
  if (!todosNasceram) return;

  if (CONFIG.ESTATICO) {
    if ([...ligacoes.values()].every(l => l.p >= 1)) noLoop();
    return;
  }
  if (!CONFIG.ciclo) return;

  if (completoDesde === null) completoDesde = frameCount;
  if (frameCount - completoDesde > CONFIG.esperaFinal) {
    apagando -= 0.012;
    if (apagando <= 0) iniciar();
  }
}

// ---------- controles ----------

function keyPressed() {
  if (key === ' ') {
    if (isLooping()) noLoop();
    else loop();
  } else if (key === 'r' || key === 'R') {
    iniciar();
  } else if (key === 's' || key === 'S') {
    saveCanvas('geometric-motion', 'png');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  iniciar();
}
