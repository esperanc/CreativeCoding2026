// =============================================================================
//  DELÍRIO
//  Uma rede de agentes que cresce, adoece no meio, demora a perceber, e então
//  se corta.
//
//  A cena que emerge (nada disso está programado): a rede cresce; quando fica
//  grande, um agente perto do centro começa a alucinar; o delírio se espalha
//  enquanto a rede ainda não percebeu; quando percebe, quem nunca delirou corta
//  os vizinhos doentes quase ao mesmo tempo; a rede se parte em continentes —
//  um saudável e ilhas onde o delírio circula — e as ilhas são empurradas para
//  longe. Com o tempo, os poucos curados que ficam lúcidos emigram, e as ilhas
//  se esvaziam devagar. Às vezes uma ponte deixa o delírio voltar.
// =============================================================================

// ------------------------------- a rede --------------------------------------

const MAX_NOS = 1400;
const NOS_INICIAIS = 20;
const NASCE_A_CADA = 2;        // quadros entre um nascimento e outro
const GATILHO = 900;           // com quantos nós o paciente zero adoece

// Como a rede cresce. O nó novo se liga a um alvo — na maioria das vezes um nó
// qualquer, às vezes um popular (PREF) — e a um VIZINHO desse alvo (LOCAL).
// Ligar-se ao vizinho do alvo dá à rede uma "geografia": a infecção precisa
// atravessá-la em vez de pular de um lado a outro por meia dúzia de hubs, e
// avança como uma mancha contínua a partir do meio.
const PREF = 0.3;
const LOCAL = true;

// A REGRA DO ECO: quem já delirou não estranha o delírio alheio. Só quem nunca
// alucinou percebe o vizinho doente e corta a ligação. Sem essa regra, quem se
// cura dentro da ilha corta tudo e foge, e a rede estilhaça em centenas de
// pedaços. Com ela, a ilha se mantém inteira: vira uma bolha de agentes que
// compartilham o mesmo delírio, e ninguém lá dentro corta ninguém.
const ECO = true;

// ------------------------------ a epidemia -----------------------------------

const CONTAGIO = 0.006;        // por quadro, por ligação doente–saudável
const CURA = 0.002;            // por quadro, para cada doente
const IMUNIDADE = [700, 1100]; // quadros de imunidade (ligada por padrão; tecla I)
const CHANCE_IMUNE = 0.1;      // fração dos curados que fica imune (e lúcida).
                               // Os outros se curam sem imunidade — seguem com a
                               // marca do eco e ficam onde estão. Quanto menor,
                               // mais devagar as ilhas se esvaziam.

// A JANELA DE LUCIDEZ (quando a imunidade está ligada). Quem se cura imune lembra da
// correção. Durante a imunidade:
//   • a regra do eco não vale para ele: reconhece o delírio e corta vizinhos
//     doentes, com a mesma vigilância (ligada ao alarme) dos que nunca deliraram;
//   • se está numa população doente, EMIGRA: corta todos os laços com ela e se
//     liga à população saudável. Cortar tudo antes é o que importa — quem se
//     religa sem romper com a ilha vira ponte e costura a ilha de volta.
// Quando a imunidade passa, ele volta a ser suscetível — mas como alguém que
// processou o episódio: perde a marca do eco e volta a perceber o delírio alheio.
const EMIGRAR = 0.004;         // por quadro: chance de o lúcido deixar a ilha
const LACOS_NOVOS = 2;         // ligações que ele faz ao chegar

// Quem ficou sem nenhuma ligação e não está doente procura, aos poucos, alguém
// na população saudável. Sem isso, os vizinhos de quem emigra (e de quem é
// cortado) ficam sozinhos para sempre, espalhados como poeira.
const PROCURAR = 0.005;        // por quadro, para cada nó isolado
const SURTO = 0.0002;          // alucinação espontânea, por quadro
const RELIGAR = 0.7;           // após cortar, chance de ligar-se a um saudável

// ------------------------------- o alarme ------------------------------------
// A vigilância não é fixa: depende do quanto cada agente PERCEBE que a SUA
// população está doente. Cada nó acompanha, com atraso, a fração de infectados
// dentro do componente em que ele está. Quando essa percepção passa do limiar,
// a vigilância dele salta — e como os vizinhos percebem mais ou menos a mesma
// coisa, quase todos cortam juntos.
//
// Por ser por população, e não global: depois da separação, os saudáveis
// passam a ver 0% de doentes à sua volta, e o alarme deles se apaga aos poucos.
// A população relaxa — e um surto novo dentro dela volta a se espalhar antes
// que o alarme suba de novo.

const VIG_BASE = 0.0003;       // vigilância sem alarme: quase nenhuma
const VIG_ALARME = 0.03;       // vigilância com alarme total
let LIMIAR = 0.18;             // fração percebida que dispara o alarme
const ATRASO = 0.008;          // quão devagar a percepção alcança a realidade

// ------------------------------- a física ------------------------------------
// Em unidades do mundo; a câmera cuida de encaixar tudo na tela.

const REPOUSO = 20;            // comprimento natural de uma ligação
const MOLA = 0.03;
const REPULSAO = 300;          // entre nós vizinhos: ~ REPULSAO / d²
const ALCANCE = 60;            // além disso, nós não se repelem individualmente
const REPULSAO_POP = 6;        // entre populações inteiras (ver abaixo)
const GRAVIDADE = 0.0009;
const ATRITO = 0.85;

const S = 0, I = 1, R = 2;

let nos, pontas, alarme, alarmeIlha, disparou, comImunidade = true;
let comp = [], pops = [];      // população de cada nó; resumo de cada população
let zoom = 3, camX = 0, camY = 0, esc;
let cortes = [], historico = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  reiniciar();
}
function windowResized() { resizeCanvas(windowWidth, windowHeight); }

function reiniciar() {
  esc = min(width, height) / 800;
  nos = []; pontas = []; cortes = []; historico = []; comp = []; pops = [];
  alarme = 0; alarmeIlha = 0; disparou = false;
  zoom = 3; camX = 0; camY = 0;
  for (let i = 0; i < NOS_INICIAIS; i++) {
    novoNo(random(-30, 30), random(-30, 30));
    if (i > 0) ligar(i, floor(random(i)));
  }
  atualizarPopulacoes();
}

// ------------------------------- estrutura -----------------------------------

function novoNo(x, y) {
  nos.push({ x, y, vx: 0, vy: 0, estado: S, relogio: 0, viz: new Set(), fase: random(TWO_PI), jaDelirou: false, percebido: 0 });
  comp.push(0);
  return nos.length - 1;
}
function ligar(a, b) {
  if (a === b || nos[a].viz.has(b)) return;
  nos[a].viz.add(b); nos[b].viz.add(a);
  pontas.push(a, b);          // lista de pontas: quem tem mais ligações aparece mais
}
function cortar(a, b) {
  nos[a].viz.delete(b); nos[b].viz.delete(a);
  cortes.push({ x1: nos[a].x, y1: nos[a].y, x2: nos[b].x, y2: nos[b].y, idade: 0 });
}
function preferencial() {
  return pontas.length ? pontas[floor(random(pontas.length))] : floor(random(nos.length));
}

// ============================== simulação ====================================

function draw() {
  crescer();
  epidemia();
  if (frameCount % 10 === 0) atualizarPopulacoes();
  fisica();
  enquadrar();
  desenhar();
}

function crescer() {
  if (nos.length < MAX_NOS && frameCount % NASCE_A_CADA === 0) {
    const alvo = random() < PREF ? preferencial() : floor(random(nos.length));
    const n = novoNo(nos[alvo].x + random(-8, 8), nos[alvo].y + random(-8, 8));
    nos[n].percebido = nos[alvo].percebido;
    comp[n] = comp[alvo];                     // até a próxima contagem de populações
    ligar(n, alvo);
    const vz = [...nos[alvo].viz].filter(v => v !== n);
    if (LOCAL && vz.length) ligar(n, vz[floor(random(vz.length))]);
    else ligar(n, preferencial());
  }
  // O paciente zero: quando a rede fica grande, adoece o nó mais perto do meio
  // — e os vizinhos dele, para o surto não morrer no berço.
  if (!disparou && nos.length >= GATILHO) {
    let mx = 0, my = 0;
    for (const p of nos) { mx += p.x; my += p.y; }
    mx /= nos.length; my /= nos.length;
    let z = 0, d = Infinity;
    for (let i = 0; i < nos.length; i++) {
      const dd = (nos[i].x - mx) ** 2 + (nos[i].y - my) ** 2;
      if (dd < d) { d = dd; z = i; }
    }
    nos[z].estado = I; nos[z].jaDelirou = true;
    for (const v of nos[z].viz) { nos[v].estado = I; nos[v].jaDelirou = true; }
    disparou = true;
  }
}

function epidemia() {
  // Fração de doentes dentro de cada população, e a percepção atrasada de cada
  // nó sobre a fração da SUA população.
  const total = new Map(), doentes = new Map();
  for (let i = 0; i < nos.length; i++) {
    const c = comp[i];
    total.set(c, (total.get(c) || 0) + 1);
    if (nos[i].estado === I) doentes.set(c, (doentes.get(c) || 0) + 1);
  }
  for (let i = 0; i < nos.length; i++) {
    const c = comp[i];
    const fracao = (doentes.get(c) || 0) / total.get(c);
    nos[i].percebido += (fracao - nos[i].percebido) * ATRASO;
  }


  const novos = [];
  for (let a = 0; a < nos.length; a++) {
    if (nos[a].estado !== I) continue;
    for (const b of [...nos[a].viz]) {
      if (nos[b].estado !== S) continue;
      const vig = VIG_BASE + VIG_ALARME * alarmeDe(nos[b].percebido);
      if (!(ECO && nos[b].jaDelirou) && random() < vig) {   // percebeu: corta
        cortar(a, b);
        if (random() < RELIGAR) {
          const c = floor(random(nos.length));
          if (nos[c].estado === S) ligar(b, c);
        }
        continue;
      }
      if (random() < CONTAGIO) novos.push(b);   // não percebeu: pode adoecer
    }
  }
  for (const b of novos) { nos[b].estado = I; nos[b].jaDelirou = true; }

  // A população que acolhe quem emigra: a maior em que os doentes são minoria.
  let acolhedora = -1, maiorSaudavel = 0;
  for (const [c, n] of total) {
    if ((doentes.get(c) || 0) < n / 2 && n > maiorSaudavel) { maiorSaudavel = n; acolhedora = c; }
  }
  let acolhida = null;   // seus membros não-doentes, montado só se alguém emigrar

  for (let a = 0; a < nos.length; a++) {
    const p = nos[a];
    if (p.estado === I && random() < CURA) {
      if (comImunidade && random() < CHANCE_IMUNE) {
        p.estado = R; p.relogio = floor(random(IMUNIDADE[0], IMUNIDADE[1]));
      } else p.estado = S;                      // sem imunidade: pode recair já
      continue;
    }
    if (p.estado !== R) continue;

    // --- a janela de lucidez ---
    // 1. reconhece o delírio: corta vizinhos doentes como um lúcido qualquer
    const vig = VIG_BASE + VIG_ALARME * alarmeDe(p.percebido);
    for (const b of [...p.viz]) if (nos[b].estado === I && random() < vig) cortar(a, b);

    // 2. se está numa população doente, emigra
    if (acolhedora >= 0 && comp[a] !== acolhedora && random() < EMIGRAR) {
      if (!acolhida) {
        acolhida = [];
        for (let k = 0; k < nos.length; k++) if (comp[k] === acolhedora && nos[k].estado !== I) acolhida.push(k);
      }
      if (acolhida.length) {
        for (const b of [...p.viz]) cortar(a, b);                 // rompe com a ilha inteira
        for (let k = 0; k < LACOS_NOVOS; k++) ligar(a, acolhida[floor(random(acolhida.length))]);
        comp[a] = acolhedora;                                       // até a próxima contagem
      }
    }

    if (--p.relogio <= 0) { p.estado = S; p.jaDelirou = false; }   // processou o episódio
  }

  // --- quem ficou sozinho procura alguém ---
  for (let a = 0; a < nos.length; a++) {
    const p = nos[a];
    if (p.viz.size > 0 || p.estado === I || acolhedora < 0 || random() >= PROCURAR) continue;
    if (!acolhida) {
      acolhida = [];
      for (let k = 0; k < nos.length; k++) if (comp[k] === acolhedora && nos[k].estado !== I) acolhida.push(k);
    }
    if (acolhida.length) { ligar(a, acolhida[floor(random(acolhida.length))]); comp[a] = acolhedora; }
  }

  if (disparou && random() < SURTO) {
    const k = floor(random(nos.length));
    if (nos[k].estado === S) { nos[k].estado = I; nos[k].jaDelirou = true; }
  }

  let soma = 0, cont = 0; alarmeIlha = 0;
  for (let k = 0; k < nos.length; k++) {
    const a = alarmeDe(nos[k].percebido);
    if (comp[k] === acolhedora) { soma += a; cont++; }
    else if (total.get(comp[k]) >= 10) alarmeIlha = max(alarmeIlha, a);
  }
  alarme = cont ? soma / cont : 0;

  let s = 0, i = 0, r = 0;
  for (const p of nos) { if (p.estado === S) s++; else if (p.estado === I) i++; else r++; }
  historico.push({ s, i, r, a: alarme });
  if (historico.length > 1500) historico.shift();
}

// Alarme suave em torno do limiar: 0 bem abaixo, 1 no limiar e acima.
function alarmeDe(percebido) {
  const t = constrain((percebido - LIMIAR * 0.6) / (LIMIAR * 0.4), 0, 1);
  return t * t * (3 - 2 * t);
}

// Populações = componentes conexos, por união-busca.
function atualizarPopulacoes() {
  const n = nos.length;
  const pai = new Int32Array(n);
  for (let i = 0; i < n; i++) pai[i] = i;
  const acha = (x) => { while (pai[x] !== x) { pai[x] = pai[pai[x]]; x = pai[x]; } return x; };
  for (let a = 0; a < n; a++) for (const b of nos[a].viz) if (a < b) {
    const ra = acha(a), rb = acha(b);
    if (ra !== rb) pai[ra] = rb;
  }
  const idx = new Map();
  for (let i = 0; i < n; i++) {
    const r = acha(i);
    if (!idx.has(r)) idx.set(r, idx.size);
    comp[i] = idx.get(r);
  }
  pops = Array.from({ length: idx.size }, () => ({ x: 0, y: 0, n: 0, doentes: 0 }));
}

function fisica() {
  const n = nos.length;

  // --- repulsão só entre nós próximos, por grade ---
  const grade = new Map();
  for (let i = 0; i < n; i++) {
    const k = floor(nos[i].x / ALCANCE) + ',' + floor(nos[i].y / ALCANCE);
    if (!grade.has(k)) grade.set(k, []);
    grade.get(k).push(i);
  }
  for (let i = 0; i < n; i++) {
    const p = nos[i];
    const gx = floor(p.x / ALCANCE), gy = floor(p.y / ALCANCE);
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      const lista = grade.get((gx + dx) + ',' + (gy + dy));
      if (!lista) continue;
      for (const j of lista) {
        if (j <= i) continue;
        const q = nos[j];
        let ex = p.x - q.x, ey = p.y - q.y;
        const d2 = ex * ex + ey * ey + 1;
        if (d2 > ALCANCE * ALCANCE) continue;
        const f = REPULSAO / d2, d = sqrt(d2);
        ex /= d; ey /= d;
        p.vx += ex * f; p.vy += ey * f;
        q.vx -= ex * f; q.vy -= ey * f;
      }
    }
  }

  // --- molas ---
  for (let a = 0; a < n; a++) {
    const p = nos[a];
    for (const b of p.viz) {
      if (b < a) continue;
      const q = nos[b];
      const dx = q.x - p.x, dy = q.y - p.y;
      const d = sqrt(dx * dx + dy * dy) + 0.01;
      const f = MOLA * (d - REPOUSO);
      p.vx += dx / d * f; p.vy += dy / d * f;
      q.vx -= dx / d * f; q.vy -= dy / d * f;
    }
  }

  // --- repulsão entre POPULAÇÕES ---
  // Cada população é tratada como um corpo só, no seu centro. A aceleração que
  // uma sente é proporcional ao TAMANHO da outra: uma ilha pequena perto da
  // população principal é empurrada com força; a principal quase não se move.
  for (const pp of pops) { pp.x = 0; pp.y = 0; pp.n = 0; pp.doentes = 0; }
  for (let i = 0; i < n; i++) {
    const pp = pops[comp[i]];
    if (!pp) continue;
    pp.x += nos[i].x; pp.y += nos[i].y; pp.n++;
    if (nos[i].estado === I) pp.doentes++;
  }
  for (const pp of pops) if (pp.n) { pp.x /= pp.n; pp.y /= pp.n; }
  const acc = pops.map(() => ({ x: 0, y: 0 }));
  for (let a = 0; a < pops.length; a++) {
    const A = pops[a]; if (!A.n) continue;
    for (let b = a + 1; b < pops.length; b++) {
      const B = pops[b]; if (!B.n) continue;
      let dx = A.x - B.x, dy = A.y - B.y;
      const d2 = dx * dx + dy * dy + 400, d = sqrt(d2);
      dx /= d; dy /= d;
      const fa = min(2, REPULSAO_POP * B.n / d2 * REPOUSO);
      const fb = min(2, REPULSAO_POP * A.n / d2 * REPOUSO);
      acc[a].x += dx * fa; acc[a].y += dy * fa;
      acc[b].x -= dx * fb; acc[b].y -= dy * fb;
    }
  }

  // --- gravidade, atrito e passo ---
  for (let i = 0; i < n; i++) {
    const p = nos[i], ac = acc[comp[i]];
    if (ac) { p.vx += ac.x; p.vy += ac.y; }
    p.vx -= p.x * GRAVIDADE; p.vy -= p.y * GRAVIDADE;
    p.vx *= ATRITO; p.vy *= ATRITO;
    const v = sqrt(p.vx * p.vx + p.vy * p.vy);
    if (v > 5) { p.vx *= 5 / v; p.vy *= 5 / v; }
    p.x += p.vx; p.y += p.vy;
  }
}

// A câmera encaixa a rede inteira na tela e vai se afastando conforme cresce.
// (O nome não pode ser camera: o p5 já tem uma função global com esse nome,
// só para WEBGL, e ela substituiria esta em silêncio.)
function enquadrar() {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const p of nos) { x0 = min(x0, p.x); x1 = max(x1, p.x); y0 = min(y0, p.y); y1 = max(y1, p.y); }
  const alvo = min(width / (x1 - x0 + 80), height / (y1 - y0 + 80), 3);
  zoom = lerp(zoom, alvo, 0.03);
  camX = lerp(camX, (x0 + x1) / 2, 0.03);
  camY = lerp(camY, (y0 + y1) / 2, 0.03);
}

// ================================ desenho ====================================

const COR_S = [110, 200, 215], COR_I = [255, 60, 190], COR_R = [230, 195, 110];

function desenhar() {
  background(7, 7, 14);
  push();
  translate(width / 2, height / 2);
  scale(zoom);
  translate(-camX, -camY);
  const px = 1 / zoom;                        // um pixel de tela, em unidades do mundo

  strokeWeight(0.8 * px);
  for (let a = 0; a < nos.length; a++) {
    const p = nos[a];
    for (const b of p.viz) {
      if (b < a) continue;
      const q = nos[b];
      if (p.estado === I || q.estado === I) stroke(255, 60, 190, 120);
      else stroke(110, 160, 200, 45);
      line(p.x, p.y, q.x, q.y);
    }
  }

  for (const c of cortes) {
    const t = c.idade / 40, mx = (c.x1 + c.x2) / 2, my = (c.y1 + c.y2) / 2;
    stroke(255, 130, 90, 230 * (1 - t));
    strokeWeight(1.4 * px);
    line(c.x1, c.y1, lerp(mx, c.x1, t), lerp(my, c.y1, t));
    line(c.x2, c.y2, lerp(mx, c.x2, t), lerp(my, c.y2, t));
    c.idade++;
  }
  cortes = cortes.filter(c => c.idade < 40);

  noStroke();
  for (const p of nos) {
    const r = (1.2 + sqrt(p.viz.size) * 0.7) * esc * px;
    if (p.estado === I) {
      const j = 1.6 * esc * px * sin(frameCount * 0.3 + p.fase);
      blendMode(ADD);
      fill(255, 40, 120, 170); circle(p.x - j, p.y, r * 2.2);
      fill(80, 60, 255, 170); circle(p.x + j, p.y, r * 2.2);
      blendMode(BLEND);
    } else {
      const c = p.estado === S ? COR_S : COR_R;
      fill(c[0], c[1], c[2], 225);
      circle(p.x, p.y, r * 2);
    }
  }
  pop();
  painel();
}

function painel() {
  const x = 20 * esc, y = height - 150 * esc, w = 320 * esc, h = 70 * esc;
  noStroke(); fill(7, 7, 14, 215);
  rect(x - 12 * esc, y - 60 * esc, w + 24 * esc, h + 88 * esc, 6 * esc);

  const u = historico[historico.length - 1] || { s: 0, i: 0, r: 0 };
  textFont('monospace'); textSize(12 * esc);
  fill(...COR_S); text(`saudáveis   ${u.s}`, x, y - 40 * esc);
  fill(...COR_I); text(`alucinando  ${u.i}`, x, y - 24 * esc);
  if (comImunidade) { fill(...COR_R); text(`imunes      ${u.r}`, x, y - 8 * esc); }
  fill(200, 210, 225);
  text(`nós ${nos.length}`, x + 165 * esc, y - 40 * esc);
  text(`populações ${pops.length}`, x + 165 * esc, y - 24 * esc);
  fill(140, 150, 165); textSize(10 * esc);
  text(`imunidade ${comImunidade ? 'ligada' : 'desligada'}`, x, y + 8 * esc);
  textSize(12 * esc); fill(200, 210, 225);

  // medidor do alarme
  const bx = x + 165 * esc, by = y - 16 * esc, bw = 130 * esc, bh = 8 * esc;
  fill(40, 40, 55); rect(bx, by, bw, bh, 2 * esc);
  fill(255, 90, 70); rect(bx, by, bw * alarme, bh, 2 * esc);
  fill(alarme > 0.5 ? color(255, 120, 100) : color(140, 150, 165));
  textSize(10 * esc); text(alarme > 0.5 ? 'ALARME' : 'alarme', bx + bw + 6 * esc, by + bh);
  fill(140, 150, 165); text('na maior população saudável', bx, by + bh + 12 * esc);

  const m = max(nos.length, 1);
  for (const [k, c] of [['s', COR_S], ['i', COR_I], ['r', COR_R]]) {
    if (k === 'r' && !comImunidade) continue;
    noFill(); stroke(c[0], c[1], c[2]); strokeWeight(1.3 * esc);
    beginShape();
    for (let t = 0; t < historico.length; t++) vertex(x + (t / 1499) * w, y + h - (historico[t][k] / m) * h);
    endShape();
  }
  noFill(); stroke(255, 90, 70, 150); strokeWeight(1 * esc);
  beginShape();
  for (let t = 0; t < historico.length; t++) vertex(x + (t / 1499) * w, y + h - historico[t].a * h);
  endShape();

  noStroke(); fill(110, 120, 140); textSize(10 * esc);
  text('clique infecta · ↑↓ limiar do alarme · I imunidade · R reinicia', x, y + h + 16 * esc);
}

// =============================== controles ===================================

function mousePressed() {
  const wx = (mouseX - width / 2) / zoom + camX;
  const wy = (mouseY - height / 2) / zoom + camY;
  let melhor = -1, d = Infinity;
  for (let i = 0; i < nos.length; i++) {
    const dd = (nos[i].x - wx) ** 2 + (nos[i].y - wy) ** 2;
    if (dd < d) { d = dd; melhor = i; }
  }
  if (melhor >= 0) { nos[melhor].estado = I; disparou = true; }
}

function keyPressed() {
  if (keyCode === UP_ARROW) LIMIAR = min(0.6, LIMIAR + 0.02);
  if (keyCode === DOWN_ARROW) LIMIAR = max(0.02, LIMIAR - 0.02);
  if (key === 'i' || key === 'I') comImunidade = !comImunidade;
  if (key === 'r' || key === 'R') reiniciar();
  if (key === 's' || key === 'S') saveCanvas('delirio', 'png');
  if (key === ' ') isLooping() ? noLoop() : loop();
}
