// =====================================================================
//  COLETIVA DESORGANIZADA  —  projeto final, parte 1
//  Victor Hugo Figueiredo Pereira da Silva — Programação Criativa 2026
// ---------------------------------------------------------------------
//  Uma exposição coletiva que não coube nas paredes. Sete artistas
//  digitais de hoje dividem a MESMA folha de papel; cada um recebe um
//  território rasgado e pinta nele com a sua marca registrada:
//
//    Tyler Hobbs ........ fitas que seguem um CAMPO DE FLUXO sem se tocar
//    Dmitri Cherniak .... um barbante esticado em volta de PINOS
//    Manolo Gamboa Naon . excesso de CÍRCULOS concêntricos saturados
//    Zach Lieberman ..... ONDAS de luz em degradê sobre o escuro
//    Jared Tarbell ...... RACHADURAS que crescem e pintam com areia
//    Casey Reas ......... linhas que nascem do ENCONTRO de agentes
//    Ryoji Ikeda ........ CÓDIGO DE BARRAS, o dado puro em preto e branco
//
//  O que é HARMONIA aqui: uma única semente, uma única paleta e um único
//  campo de ruído (noise) que orienta todo mundo.
//  O que é DESORGANIZAÇÃO: as fronteiras rasgadas e as INVASÕES — depois
//  de pintar o seu território, cada artista vaza para o dos vizinhos.
//
//  Teclas: clique ou N = nova obra | R = refazer | D = nível de desordem
//          H = etiquetas | ESPAÇO = terminar já | S = salvar PNG
// =====================================================================

let semente;          // número que define a obra inteira
let nivel = 1;        // desordem: 0 = arrumado, 1 = normal, 2 = caos
let etiquetas = true; // mostra as etiquetas de museu
let u;                // unidade de medida: o menor lado da janela
let ctx;              // contexto 2D do canvas (desenho direto)
let pal;              // paleta sorteada
let giro;             // rotação geral do campo de fluxo
let celulas = [];     // os sete territórios
let fase = 0;         // 0 = territórios, 1 = invasões, 2 = pronto
let invasor = null;   // gerador que desenha as invasões
let pressa = false;   // ESPAÇO: termina sem animar
let copia = null;     // cópia da obra pronta (para ligar/desligar etiquetas)

const PALETAS = [
  { nome: "Risografia", papel: "#f1e9d6", tinta: "#1d1d1b",
    cores: ["#e2452d", "#f2b233", "#2b5fd9", "#1f7a63", "#f08fa8", "#20242c"] },
  { nome: "Itacoatiara", papel: "#efe6d2", tinta: "#1c2a30",
    cores: ["#0f6e8c", "#f25c3b", "#f7c548", "#2a3d45", "#9fd3c7", "#d94f70"] },
  { nome: "Madrugada", papel: "#eae4d8", tinta: "#17172b",
    cores: ["#3d2c8d", "#e84a5f", "#ffb400", "#16a085", "#1b1b3a", "#ff8fb1"] },
  { nome: "Feira", papel: "#f3ead3", tinta: "#231a14",
    cores: ["#d7263d", "#f49d37", "#3f88c5", "#2e933c", "#140f2d", "#f2d0a4"] },
];

// Cada artista: nome, a marca dele, o conceito da disciplina que eu uso
// para imitá-la, a função que pinta o território e a que faz a invasão.
const ARTISTAS = [
  { nome: "Tyler Hobbs", marca: "fitas no campo de fluxo",
    aula: "noise() + grade de ocupação", pinta: hobbs, invade: hobbsInvade },
  { nome: "Dmitri Cherniak", marca: "barbante em volta de pinos",
    aula: "vetores, atan2 e tangentes", pinta: cherniak, invade: cherniakInvade },
  { nome: "Manolo Gamboa Naon", marca: "excesso de círculos",
    aula: "acaso moldado: pow(random())", pinta: gamboa, invade: gamboaInvade },
  { nome: "Zach Lieberman", marca: "ondas de luz em degradê",
    aula: "seno, cor e mistura aditiva", pinta: lieberman, invade: liebermanInvade },
  { nome: "Jared Tarbell", marca: "rachaduras com areia",
    aula: "agente que lê o próprio rastro", pinta: tarbell, invade: tarbellInvade },
  { nome: "Casey Reas", marca: "linhas do encontro",
    aula: "emergência: regra local", pinta: reas, invade: reasInvade },
  { nome: "Ryoji Ikeda", marca: "código de barras",
    aula: "dado vira imagem e tipo", pinta: ikeda, invade: ikedaInvade },
];

// ---------------------------------------------------------------- setup

function setup() {
  pixelDensity(min(2, displayDensity()));
  createCanvas(windowWidth, windowHeight);
  ctx = drawingContext;
  // ?semente=123 na URL repete uma obra específica
  const pedido = new URLSearchParams(window.location.search).get("semente");
  semente = pedido !== null && !isNaN(parseInt(pedido))
    ? parseInt(pedido) : floor(Math.random() * 100000);
  iniciar();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  ctx = drawingContext;
  iniciar(); // mesma semente: a mesma obra, no tamanho novo
}

// Monta a obra do zero a partir da semente.
function iniciar() {
  randomSeed(semente);
  noiseSeed(semente);
  u = min(width, height);
  pal = random(PALETAS);
  pal = { ...pal, cores: shuffle(pal.cores.slice()) };
  giro = random(TWO_PI);
  fase = 0; invasor = null; pressa = false; copia = null;

  ctx.fillStyle = pal.papel;
  ctx.fillRect(0, 0, width, height);

  // 1) Sete pontos bem espalhados: "melhor candidato" de Mitchell.
  //    Sorteio vários candidatos e fico com o mais longe dos já postos.
  const pontos = [];
  for (let i = 0; i < ARTISTAS.length; i++) {
    let melhor = null, melhorD = -1;
    for (let k = 0; k < 40; k++) {
      const c = { x: random(0.08, 0.92) * width, y: random(0.1, 0.9) * height };
      let d = Infinity;
      for (const p of pontos) d = min(d, dist(c.x, c.y, p.x, p.y));
      if (pontos.length === 0) d = random();
      if (d > melhorD) { melhorD = d; melhor = c; }
    }
    pontos.push(melhor);
  }

  // 2) Cada ponto ganha o território de quem está mais perto dele
  //    (diagrama de Voronoi), e um artista sorteado.
  const ordem = shuffle(ARTISTAS.slice());
  celulas = pontos.map((p, i) => {
    const conv = territorio(p, pontos);
    const xs = conv.map(q => q.x), ys = conv.map(q => q.y);
    const x0 = max(0, min(...xs)), y0 = max(0, min(...ys));
    const x1 = min(width, max(...xs)), y1 = min(height, max(...ys));
    const cel = {
      p, conv, artista: ordem[i], fim: false,
      borda: rasgar(conv),
      cx: x0, cy: y0, cw: x1 - x0, ch: y1 - y0,
    };
    cel.gen = cel.artista.pinta(cel);
    return cel;
  });
  loop();
}

// Território de Voronoi do ponto p: começa com a folha inteira (com folga)
// e corta fora, vizinho por vizinho, a metade que fica mais perto do vizinho.
function territorio(p, pontos) {
  const f = u * 0.08;
  let pol = [{ x: -f, y: -f }, { x: width + f, y: -f },
             { x: width + f, y: height + f }, { x: -f, y: height + f }];
  for (const q of pontos) {
    if (q === p) continue;
    const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
    const nx = q.x - p.x, ny = q.y - p.y;
    const lado = v => (v.x - mx) * nx + (v.y - my) * ny; // <= 0: lado de p
    const novo = [];
    for (let i = 0; i < pol.length; i++) {
      const a = pol[i], b = pol[(i + 1) % pol.length];
      const la = lado(a), lb = lado(b);
      if (la <= 0) novo.push(a);
      if ((la < 0 && lb > 0) || (la > 0 && lb < 0)) {
        const t = la / (la - lb);
        novo.push({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
      }
    }
    pol = novo;
  }
  return pol;
}

// Rasga a borda: divide cada lado em pedacinhos e empurra cada ponto por
// um ruído que só depende da POSIÇÃO. Como vizinhos compartilham o lado,
// os dois rasgam igual e as bordas continuam encaixando.
function rasgar(pol) {
  const amp = u * 0.022 * nivel, passo = u * 0.012, r = [];
  for (let i = 0; i < pol.length; i++) {
    const a = pol[i], b = pol[(i + 1) % pol.length];
    const n = max(1, ceil(dist(a.x, a.y, b.x, b.y) / passo));
    for (let k = 0; k < n; k++) {
      const x = lerp(a.x, b.x, k / n), y = lerp(a.y, b.y, k / n);
      const dx = noise(x * 0.006, y * 0.006, 31.7) - 0.5 +
                 0.35 * (noise(x * 0.05, y * 0.05, 5.1) - 0.5);
      const dy = noise(x * 0.006, y * 0.006, 77.3) - 0.5 +
                 0.35 * (noise(x * 0.05, y * 0.05, 9.4) - 0.5);
      r.push({ x: x + 2 * amp * dx, y: y + 2 * amp * dy });
    }
  }
  return r;
}

// ----------------------------------------------------------------- draw

function draw() {
  const orc = pressa ? 300 : 5; // milissegundos por artista por quadro
  if (fase === 0) {
    // Todos pintam ao mesmo tempo, cada um preso (clip) ao seu território.
    let vivos = 0;
    for (const c of celulas) {
      if (c.fim) continue;
      vivos++;
      ctx.save();
      ctx.beginPath();
      c.borda.forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y));
      ctx.closePath();
      ctx.clip();
      const t0 = performance.now();
      while (performance.now() - t0 < orc) {
        if (c.gen.next().done) { c.fim = true; break; }
      }
      ctx.restore();
    }
    if (vivos === 0) { fase = 1; invasor = invasoes(); }
  } else if (fase === 1) {
    // Agora sem clip: cada artista vaza para o território dos outros.
    const t0 = performance.now();
    while (performance.now() - t0 < orc * 3) {
      if (invasor.next().done) { fase = 2; break; }
    }
  }
  if (fase === 2) {
    grao();
    // guarda a obra pronta para poder ligar e desligar as etiquetas
    copia = document.createElement("canvas");
    copia.width = ctx.canvas.width; copia.height = ctx.canvas.height;
    copia.getContext("2d").drawImage(ctx.canvas, 0, 0);
    mostrar();
    noLoop();
  }
}

function* invasoes() {
  if (nivel === 0) return;
  for (const c of shuffle(celulas.slice())) yield* c.artista.invade(c);
}

// Redesenha a obra pronta, com ou sem etiquetas.
function mostrar() {
  if (!copia) return;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(copia, 0, 0);
  ctx.restore();
  if (!etiquetas) return;
  const t = max(9, u * 0.0135);
  ctx.textBaseline = "top";
  for (const c of celulas) {
    const l1 = "à maneira de " + c.artista.nome.toUpperCase();
    const l2 = c.artista.marca + " · " + c.artista.aula;
    ctx.font = `bold ${t}px ui-monospace, Menlo, Consolas, monospace`;
    const w1 = ctx.measureText(l1).width;
    ctx.font = `${t * 0.86}px ui-monospace, Menlo, Consolas, monospace`;
    const w = max(w1, ctx.measureText(l2).width) + t * 1.4;
    const h = t * 3.1;
    const x = constrain(c.p.x - w / 2, t, width - w - t);
    const y = constrain(c.p.y - h / 2, t, height - h - t * 3);
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.fillRect(x + t * 0.25, y + t * 0.25, w, h);
    ctx.fillStyle = "#fbf8f0";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#1a1a1a";
    ctx.font = `bold ${t}px ui-monospace, Menlo, Consolas, monospace`;
    ctx.fillText(l1, x + t * 0.7, y + t * 0.55);
    ctx.font = `${t * 0.86}px ui-monospace, Menlo, Consolas, monospace`;
    ctx.fillStyle = "#555";
    ctx.fillText(l2, x + t * 0.7, y + t * 1.8);
  }
  // legenda da obra
  const nomes = ["arrumado", "desorganizado", "caos"];
  const s = `COLETIVA DESORGANIZADA · semente ${semente} · paleta ${pal.nome}` +
            ` · desordem: ${nomes[nivel]}`;
  ctx.font = `${t}px ui-monospace, Menlo, Consolas, monospace`;
  const w = ctx.measureText(s).width + t * 1.4;
  ctx.fillStyle = "#fbf8f0";
  ctx.fillRect(t, height - t * 2.6, w, t * 1.9);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillText(s, t * 1.7, height - t * 2.15);
}

// Grão de papel: milhares de pontinhos quase invisíveis por cima de tudo.
function grao() {
  const n = floor((width * height) / 45);
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = random() < 0.5 ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.06)";
    ctx.fillRect(random(width), random(height), 1.2, 1.2);
  }
}

// ------------------------------------------------------------ utilidades

// O campo de fluxo que TODOS compartilham: um ângulo para cada ponto.
function campo(x, y) {
  return noise(x * 1.25 / u, y * 1.25 / u) * TWO_PI * 2 + giro;
}

// O ponto (x, y) está dentro do polígono? (regra do raio)
function dentro(pol, x, y) {
  let d = false;
  for (let i = 0, j = pol.length - 1; i < pol.length; j = i++) {
    const a = pol[i], b = pol[j];
    if ((a.y > y) !== (b.y > y) &&
        x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) d = !d;
  }
  return d;
}

// Sorteia um ponto dentro do território.
function pontoEm(c) {
  for (let k = 0; k < 60; k++) {
    const x = c.cx + random(c.cw), y = c.cy + random(c.ch);
    if (dentro(c.conv, x, y)) return { x, y };
  }
  return { x: c.p.x, y: c.p.y };
}

// Cor da paleta com peso: as primeiras aparecem mais (pow puxa para 0).
function corPeso() {
  return pal.cores[floor(pow(random(), 1.8) * pal.cores.length)];
}

// "#rrggbb" + transparência -> "rgba(...)"
function rgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}

function pintaFundo(c, cor) {
  ctx.fillStyle = cor;
  ctx.fillRect(c.cx - 2, c.cy - 2, c.cw + 4, c.ch + 4);
}

// ============================================================ TYLER HOBBS
// Fitas que seguem o campo de fluxo e NUNCA se sobrepõem. Cada fita pronta
// registra seus pontos numa grade de ocupação; a próxima para ao encostar.

function* fitas(area, quantas, larguras, preso) {
  const g = u * 0.02, ocup = new Map();
  const chave = (x, y) => floor(x / g) + "," + floor(y / g);
  const livre = (x, y, r) => {
    const gx = floor(x / g), gy = floor(y / g), al = ceil((r + u * 0.03) / g);
    for (let i = -al; i <= al; i++) for (let j = -al; j <= al; j++) {
      const lista = ocup.get((gx + i) + "," + (gy + j));
      if (!lista) continue;
      for (const o of lista)
        if (dist(x, y, o.x, o.y) < r + o.r + u * 0.003) return false;
    }
    return true;
  };
  const passo = u * 0.006;
  for (let t = 0; t < quantas; t++) {
    let x = area.cx + random(area.cw), y = area.cy + random(area.ch);
    if (preso && !dentro(area.conv, x, y)) continue;
    const larg = u * random(larguras), r = larg / 2;
    const pts = [], maximo = floor(random(25, 130));
    for (let k = 0; k < maximo; k++) {
      if (x < area.cx - larg || x > area.cx + area.cw + larg ||
          y < area.cy - larg || y > area.cy + area.ch + larg) break;
      if (!livre(x, y, r)) break;
      pts.push({ x, y });
      const a = campo(x, y);
      x += cos(a) * passo; y += sin(a) * passo;
    }
    if (pts.length < 8) continue;
    for (const q of pts) {
      const k = chave(q.x, q.y);
      if (!ocup.has(k)) ocup.set(k, []);
      ocup.get(k).push({ x: q.x, y: q.y, r });
    }
    // contorno escuro por baixo e, por cima, a fita em trechos coloridos
    const traco = (i0, i1, cor, w) => {
      ctx.strokeStyle = cor; ctx.lineWidth = w;
      ctx.lineCap = "butt"; ctx.lineJoin = "round";
      ctx.beginPath();
      for (let i = i0; i <= i1; i++)
        i === i0 ? ctx.moveTo(pts[i].x, pts[i].y) : ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
    };
    traco(0, pts.length - 1, pal.tinta, larg + u * 0.0028);
    let i = 0;
    while (i < pts.length - 1) {
      const f = min(pts.length - 1, i + floor(random(3, 26)));
      traco(i, f, corPeso(), larg);
      i = f;
    }
    yield;
  }
}

function* hobbs(c) {
  pintaFundo(c, pal.papel);
  yield* fitas(c, 1500, [0.006, 0.006, 0.011, 0.011, 0.02, 0.034], true);
}

function* hobbsInvade(c) {
  // poucas fitas finas atravessam a folha inteira e costuram os territórios
  const folha = { cx: 0, cy: 0, cw: width, ch: height };
  yield* fitas(folha, 12 * nivel, [0.004, 0.006, 0.009], false);
}

// ======================================================== DMITRI CHERNIAK
// Um barbante fechado esticado em volta de pinos. Entre dois pinos o
// barbante é uma reta TANGENTE aos dois círculos; em cada pino, um arco.

function* barbante(pinos, r, preencher) {
  const k = pinos.length;
  const lado = pinos.map(() => (random() < 0.5 ? 1 : -1)); // por onde passa
  const sai = [], entra = []; // ângulos de saída e de chegada em cada pino
  for (let i = 0; i < k; i++) {
    const j = (i + 1) % k, a = pinos[i], b = pinos[j];
    const ang = atan2(b.y - a.y, b.x - a.x), d = dist(a.x, a.y, b.x, b.y);
    if (lado[i] === lado[j]) {            // tangente externa: mesmo lado
      sai[i] = ang + lado[i] * HALF_PI;
      entra[j] = sai[i];
    } else {                              // tangente interna: cruza
      sai[i] = ang + lado[i] * acos(min(1, (2 * r) / d));
      entra[j] = sai[i] + PI;
    }
  }
  const pt = (p, a) => ({ x: p.x + r * cos(a), y: p.y + r * sin(a) });
  if (preencher) {
    const p0 = pt(pinos[0], sai[0]);
    ctx.beginPath(); ctx.moveTo(p0.x, p0.y);
    for (let i = 0; i < k; i++) {
      const j = (i + 1) % k, q = pt(pinos[j], entra[j]);
      ctx.lineTo(q.x, q.y);
      ctx.arc(pinos[j].x, pinos[j].y, r, entra[j], sai[j], lado[j] > 0);
    }
    ctx.closePath();
    ctx.fillStyle = corPeso();
    ctx.fill("evenodd");
    yield;
  }
  for (let i = 0; i < k; i++) {  // estica o barbante trecho a trecho
    const j = (i + 1) % k, p = pt(pinos[i], sai[i]), q = pt(pinos[j], entra[j]);
    ctx.strokeStyle = pal.tinta; ctx.lineWidth = u * 0.0042;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
    ctx.arc(pinos[j].x, pinos[j].y, r, entra[j], sai[j], lado[j] > 0);
    ctx.stroke();
    yield; yield; yield;
  }
}

function desenhaPino(p, r, cor) {
  ctx.beginPath(); ctx.arc(p.x, p.y, r * 0.62, 0, TWO_PI);
  ctx.fillStyle = cor; ctx.fill();
  ctx.strokeStyle = pal.tinta; ctx.lineWidth = u * 0.0022; ctx.stroke();
}

function* cherniak(c) {
  pintaFundo(c, "#f6f2e9");
  // grade de pinos alinhada com o campo de fluxo no centro do território
  const n = floor(random(5, 8)), s = min(c.cw, c.ch) / (n + 0.6), r = s * 0.2;
  const a = campo(c.p.x, c.p.y) * 0.15, grade = [];
  for (let i = -8; i <= 8; i++) for (let j = -8; j <= 8; j++) {
    const x = c.p.x + (i * cos(a) - j * sin(a)) * s;
    const y = c.p.y + (i * sin(a) + j * cos(a)) * s;
    const naFolha = x > r * 2 && x < width - r * 2 && y > r * 2 && y < height - r * 2;
    if (naFolha && dentro(c.conv, x, y)) grade.push({ x, y });
  }
  for (const p of grade) desenhaPino(p, r, "#f6f2e9");
  yield;
  const usados = shuffle(grade.slice()).slice(0, min(grade.length, floor(random(6, 13))));
  if (usados.length >= 3) {
    yield* barbante(usados, r, true);
    for (const p of usados) desenhaPino(p, r, "#fffdf6");
    desenhaPino(random(usados), r, pal.cores[1]); // o pino colorido
  }
}

function* cherniakInvade(c) {
  // um barbante menor escapa: três ou quatro pinos espetados na vizinhança
  for (let v = 0; v < nivel; v++) {
    const a0 = random(TWO_PI), d = max(c.cw, c.ch) * random(0.35, 0.6);
    const ox = c.p.x + cos(a0) * d, oy = c.p.y + sin(a0) * d;
    const r = u * 0.018, pinos = [];
    const k = floor(random(3, 5));
    for (let i = 0; i < k; i++) {
      const a = a0 + (i / k) * TWO_PI + random(-0.3, 0.3);
      const raio = u * random(0.07, 0.12);
      pinos.push({ x: ox + cos(a) * raio, y: oy + sin(a) * raio });
    }
    yield* barbante(pinos, r, false);
    for (const p of pinos) desenhaPino(p, r, "#fffdf6");
  }
}

// ===================================================== MANOLO GAMBOA NAON
// Excesso organizado: círculos concêntricos, raiados e pontilhados, muitos
// e saturados, dos maiores para os menores (o tamanho vem de pow(random)).

function circulo(x, y, r) {
  const tipo = random();
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = r * 0.25;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TWO_PI);
  ctx.fillStyle = corPeso(); ctx.fill();
  ctx.restore();
  if (tipo < 0.5) {              // anéis concêntricos
    const aneis = floor(random(3, 8));
    for (let i = 1; i < aneis; i++) {
      ctx.beginPath(); ctx.arc(x, y, r * (1 - i / aneis), 0, TWO_PI);
      ctx.fillStyle = corPeso(); ctx.fill();
    }
  } else if (tipo < 0.75) {      // raios, como uma roda
    const n = floor(random(10, 40));
    ctx.strokeStyle = corPeso(); ctx.lineWidth = max(1, r * 0.035);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TWO_PI;
      ctx.beginPath();
      ctx.moveTo(x + cos(a) * r * 0.3, y + sin(a) * r * 0.3);
      ctx.lineTo(x + cos(a) * r * 0.92, y + sin(a) * r * 0.92);
      ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(x, y, r * 0.24, 0, TWO_PI);
    ctx.fillStyle = corPeso(); ctx.fill();
  } else {                       // colar de pontos
    const n = floor(random(8, 22));
    ctx.fillStyle = corPeso();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TWO_PI;
      ctx.beginPath();
      ctx.arc(x + cos(a) * r * 0.72, y + sin(a) * r * 0.72, r * 0.09, 0, TWO_PI);
      ctx.fill();
    }
    ctx.beginPath(); ctx.arc(x, y, r * 0.42, 0, TWO_PI);
    ctx.fillStyle = corPeso(); ctx.fill();
  }
}

function* gamboa(c) {
  pintaFundo(c, pal.cores[pal.cores.length - 1]);
  const n = 170, esc = min(c.cw, c.ch);
  for (let i = 0; i < n; i++) {
    const p = pontoEm(c), t = i / n;
    const r = esc * lerp(0.2, 0.012, pow(t, 0.45)) * random(0.6, 1.1);
    circulo(p.x, p.y, r);
    yield;
  }
}

function* gamboaInvade(c) {
  // confete: círculos pequenos espirram para fora, seguindo o campo
  for (let i = 0; i < 14 * nivel; i++) {
    const a = campo(c.p.x, c.p.y) + random(-1.2, 1.2);
    const d = max(c.cw, c.ch) * random(0.4, 0.85);
    circulo(c.p.x + cos(a) * d, c.p.y + sin(a) * d, u * random(0.008, 0.03));
    yield;
  }
}

// ========================================================= ZACH LIEBERMAN
// Luz sobre o escuro: faixas em onda (seno) com degradê, somadas em modo
// "screen" (mistura aditiva: luz + luz = mais luz), e alguns halos.

function* lieberman(c) {
  pintaFundo(c, "#0a0a12");
  const m = 64, h0 = random(360), f = TWO_PI / (c.cw * random(0.5, 1.1));
  const fase0 = random(TWO_PI), amp = c.ch * 0.07;
  for (let j = 0; j < m; j++) {
    const y0 = c.cy + (c.ch * (j + 0.5)) / m;
    const grad = ctx.createLinearGradient(c.cx, 0, c.cx + c.cw, 0);
    for (let k = 0; k <= 6; k++) {
      const mat = h0 + 50 * sin(k * 0.9 + j * 0.13);
      const luz = 38 + 30 * sin(k * 1.7 + j * 0.31);
      grad.addColorStop(k / 6, `hsl(${mat},92%,${luz}%)`);
    }
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = grad; ctx.lineWidth = (c.ch / m) * 1.7;
    ctx.beginPath();
    for (let x = c.cx - 4; x <= c.cx + c.cw + 4; x += 6) {
      const onda = sin(x * f + j * 0.16 + fase0) *
                   amp * (0.3 + noise(x * 0.004, j * 0.08, 3));
      x === c.cx - 4 ? ctx.moveTo(x, y0 + onda) : ctx.lineTo(x, y0 + onda);
    }
    ctx.stroke();
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    yield; yield;
  }
  for (let i = 0; i < 5; i++) {
    const p = pontoEm(c);
    halo(p.x, p.y, min(c.cw, c.ch) * random(0.15, 0.35), random(pal.cores), 0.55, "lighter");
    yield;
  }
}

function halo(x, y, r, cor, forca, modo) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(cor, forca)); g.addColorStop(1, rgba(cor, 0));
  ctx.globalCompositeOperation = modo;
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  ctx.globalCompositeOperation = "source-over";
}

function* liebermanInvade(c) {
  // a luz vaza pela fresta: halos coloridos em cima da fronteira
  for (let i = 0; i < 3 * nivel; i++) {
    const q = random(c.borda);
    if (q.x < 0 || q.x > width || q.y < 0 || q.y > height) continue;
    halo(q.x, q.y, u * random(0.08, 0.16), random(pal.cores), 0.4, "source-over");
    yield;
  }
}

// ========================================================== JARED TARBELL
// "Substrate": rachaduras andam em linha reta e anotam, numa grade, o
// ângulo por onde passaram. Quem bate numa rachadura antiga para e renasce
// perpendicular a outra. Ao lado de cada uma, um pintor de areia.

function* tarbell(c) {
  pintaFundo(c, "#f7f1e3");
  const gw = ceil(c.cw) + 2, gh = ceil(c.ch) + 2, VAZIO = 9999;
  const grade = new Float32Array(gw * gh).fill(VAZIO);
  const le = (x, y) => {
    const i = floor(x - c.cx), j = floor(y - c.cy);
    return i < 0 || j < 0 || i >= gw || j >= gh ? null : j * gw + i;
  };
  const rach = [], maximo = floor(constrain((c.cw * c.ch) / (u * u) * 260, 25, 120));
  const nasce = (r) => {
    // procura um ponto já rachado e sai dele em ângulo reto
    for (let k = 0; k < 300; k++) {
      const p = pontoEm(c), id = le(p.x, p.y);
      if (id !== null && grade[id] !== VAZIO) {
        r.a = grade[id] + (random() < 0.5 ? -1 : 1) * (HALF_PI + random(-0.035, 0.035));
        r.x = p.x + 0.9 * cos(r.a); r.y = p.y + 0.9 * sin(r.a);
        return;
      }
    }
    r.morta = true;
  };
  for (let i = 0; i < 3; i++) {   // as três primeiras seguem o campo de fluxo
    const p = pontoEm(c);
    rach.push({ x: p.x, y: p.y, a: campo(p.x, p.y), cor: corPeso(), g: random(0.05, 0.3) });
  }
  const passos = floor(constrain(c.cw * c.ch * 0.22, 6000, 90000));
  for (let s = 0; s < passos; s++) {
    const r = rach[s % rach.length];
    if (r.morta) continue;
    r.x += 0.8 * cos(r.a); r.y += 0.8 * sin(r.a);
    const id = le(r.x, r.y);
    const ocupado = id !== null && grade[id] !== VAZIO && abs(grade[id] - r.a) > 0.09;
    if (id === null || ocupado || !dentro(c.conv, r.x, r.y)) {
      nasce(r);
      if (rach.length < maximo) {
        const novo = { cor: corPeso(), g: random(0.05, 0.3) };
        nasce(novo); rach.push(novo);
      }
      continue;
    }
    grade[id] = r.a;
    // pintor de areia: um raio perpendicular até a próxima rachadura
    const pa = r.a + HALF_PI;
    let L = 0;
    for (; L < u * 0.16; L += 2) {
      const k = le(r.x + cos(pa) * (L + 2), r.y + sin(pa) * (L + 2));
      if (k === null || (grade[k] !== VAZIO && L > 2)) break;
    }
    r.g = constrain(r.g + random(-0.04, 0.04), 0.05, 0.9);
    ctx.strokeStyle = rgba(r.cor, 0.09); ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(r.x, r.y);
    ctx.lineTo(r.x + cos(pa) * L * r.g, r.y + sin(pa) * L * r.g);
    ctx.stroke();
    ctx.fillStyle = rgba(pal.tinta, 0.85);
    ctx.fillRect(r.x - 0.6, r.y - 0.6, 1.2, 1.2);
    if (s % 40 === 0) yield;
  }
}

function* tarbellInvade(c) {
  // a rachadura não respeita a moldura: fendas retas cortam a folha
  for (let i = 0; i < 3 * nivel; i++) {
    const p = pontoEm(c), a = campo(p.x, p.y) + (i % 2) * HALF_PI;
    const L = u * random(0.5, 1.1), cor = corPeso();
    for (let t = 0; t < L; t += 1) {
      const x = p.x + cos(a) * t, y = p.y + sin(a) * t;
      ctx.fillStyle = rgba(pal.tinta, 0.8);
      ctx.fillRect(x - 0.6, y - 0.6, 1.2, 1.2);
      const pa = a + HALF_PI, g = u * 0.03 * noise(t * 0.01, i * 7);
      ctx.strokeStyle = rgba(cor, 0.07); ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.lineTo(x + cos(pa) * g, y + sin(pa) * g); ctx.stroke();
      if (t % 30 === 0) yield;
    }
  }
}

// ============================================================= CASEY REAS
// "Process": ninguém desenha a forma. Círculos invisíveis andam; sempre que
// dois se tocam, uma linha liga os centros. O desenho é o rastro do encontro.

function* reas(c) {
  pintaFundo(c, "#ece8df");
  const n = floor(constrain((c.cw * c.ch) / (u * u) * 260, 22, 60));
  const ag = [];
  for (let i = 0; i < n; i++) {
    const p = pontoEm(c);
    ag.push({ x: p.x, y: p.y, r: u * random(0.02, 0.06), a: random(TWO_PI) });
  }
  for (let it = 0; it < 420; it++) {
    for (const g of ag) {
      g.a += random(-0.08, 0.08);
      g.x += cos(g.a) * 1.3; g.y += sin(g.a) * 1.3;
      if (!dentro(c.conv, g.x, g.y))   // saiu: volta-se para o centro
        g.a = atan2(c.p.y - g.y, c.p.x - g.x) + random(-0.6, 0.6);
    }
    ctx.lineWidth = 0.7;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const a = ag[i], b = ag[j], d = dist(a.x, a.y, b.x, b.y);
      if (d < a.r + b.r) {
        // quanto mais sobrepostos, mais escura a linha
        const t = 1 - d / (a.r + b.r);
        ctx.strokeStyle = t > 0.82 ? "rgba(255,255,255,0.12)"
                                   : rgba(pal.tinta, 0.03 + 0.07 * t);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
    yield;
  }
}

function* reasInvade(c) {
  // os círculos que eram invisíveis aparecem do lado de fora
  for (let i = 0; i < 5 * nivel; i++) {
    const q = random(c.borda);
    ctx.strokeStyle = rgba(pal.tinta, 0.55); ctx.lineWidth = u * 0.0014;
    ctx.beginPath();
    ctx.arc(q.x + random(-1, 1) * u * 0.03, q.y + random(-1, 1) * u * 0.03,
            u * random(0.015, 0.06), 0, TWO_PI);
    ctx.stroke();
    yield;
  }
}

// ============================================================ RYOJI IKEDA
// O dado sem enfeite: fileiras de barras pretas e brancas de larguras
// sorteadas, fileiras de números miúdos e uma única linha vermelha.

function fileira(x0, x1, y, h, fino) {
  let x = x0, branco = random() < 0.5;
  while (x < x1) {
    const w = max(1, u * 0.03 * pow(random(), fino));
    if (branco) { ctx.fillStyle = "#f4f4f0"; ctx.fillRect(x, y, w, h); }
    x += w; branco = !branco;
  }
}

function* ikeda(c) {
  pintaFundo(c, "#060606");
  let y = c.cy;
  const vermelha = c.cy + c.ch * random(0.2, 0.8);
  while (y < c.cy + c.ch) {
    const h = u * random([0.006, 0.012, 0.012, 0.03, 0.06]);
    if (random() < 0.22) {        // fileira de números
      const t = max(6, u * 0.0095);
      ctx.fillStyle = "#cfcfca";
      ctx.font = `${t}px ui-monospace, Menlo, Consolas, monospace`;
      ctx.textBaseline = "top";
      let s = "";
      for (let i = 0; i < 260; i++) s += floor(random(10)) + (i % 4 === 3 ? " " : "");
      ctx.fillText(s, c.cx, y + 1);
      y += t * 1.5;
    } else {
      fileira(c.cx, c.cx + c.cw, y, h * 0.86, random([2, 3, 5]));
      y += h;
    }
    yield; yield;
  }
  ctx.fillStyle = "#e0261c";
  ctx.fillRect(c.cx, vermelha, c.cw, max(1.5, u * 0.002));
}

function* ikedaInvade(c) {
  // uma tira de código de barras atravessa a folha de lado a lado
  for (let i = 0; i < nivel; i++) {
    const h = u * random(0.006, 0.014);
    const y = constrain(c.p.y + random(-0.4, 0.4) * c.ch, h, height - 2 * h);
    ctx.fillStyle = "#060606"; ctx.fillRect(0, y, width, h);
    fileira(0, width, y, h, 4);
    yield;
  }
}

// --------------------------------------------------------------- controles

function novaObra() {
  semente = floor(Math.random() * 100000);
  iniciar();
}

function mousePressed() { novaObra(); }

function keyPressed() {
  const k = key.toLowerCase();
  if (k === "n") novaObra();
  else if (k === "r") iniciar();
  else if (k === "d") { nivel = (nivel + 1) % 3; iniciar(); }
  else if (k === "h") { etiquetas = !etiquetas; mostrar(); }
  else if (k === " ") pressa = true;
  else if (k === "s") saveCanvas(`coletiva-desorganizada-${semente}`, "png");
}
