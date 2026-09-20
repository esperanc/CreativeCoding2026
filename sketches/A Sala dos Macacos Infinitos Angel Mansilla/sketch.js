const ALFABETO = ' ABCDEFGHIJKLMNOPQRSTUVWXYZÃÇ';
const LETRAS_POR_LINHA = 42;
const LINHAS_POR_FOLHA = 22;
const CARACTERES_POR_FOLHA = LETRAS_POR_LINHA * LINHAS_POR_FOLHA;
const LIMITE_PILHA = 50;
const TEMPO_TROCA = 2;
const FILEIRAS = 40;
const COLUNAS = 12;
const PROFUNDIDADE_SALA = 2400;
let macacos = [], visiveis = [], gravuras = [], lampadas = [], poeira = [];
let sala, baseSala, atmosfera, camera, folhaAberta = null, sobMouse = null;
let semente, geracao = 0, ultimoTempo = 0;
let canvas, reduzirMovimento = false, papelAmpliado;
let avancoCamera = 0, destinoCamera = 0, primeiraFileira = 0, numeroMacaco = 0;

function setup() {
  pixelDensity(Math.min(window.devicePixelRatio || 1, 1.5));
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('scene');
  canvas.elt.setAttribute('aria-label', 'A Sala dos Macacos Infinitos. Toque nas folhas ou gire o scroll do mouse.');
  reduzirMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  novaSala();
  requestAnimationFrame(() => document.body.classList.add('pronto'));
}

function novaSala() {
  fecharFolha();
  geracao++;
  semente = floor(random(1000000000));
  randomSeed(semente);
  noiseSeed(semente);
  avancoCamera = 0; destinoCamera = 0; primeiraFileira = 0; numeroMacaco = 0;
  macacos = [];
  const duracoes = shuffle(Array.from({ length: FILEIRAS * COLUNAS }, (_, i) => 27 + 6 * i / (FILEIRAS * COLUNAS - 1)));
  for (let r = 0; r < FILEIRAS; r++) {
    for (let c = 0; c < COLUNAS; c++) {
      macacos.push(criarMacaco(r, c, duracoes[r * COLUNAS + c]));
    }
  }
  ultimoTempo = millis();
  recompor();
}

function profundidadeFileira(r) {
  const bloco = Math.floor(r / 27), indice = r - bloco * 27;
  return 4.7 + bloco * 126.333 + indice * 2.6 + indice * indice * .077;
}

function criarMacaco(r, c, duracao = random(27, 33)) {
  return {
    id: ++numeroMacaco, r, c,
    x: (c % 2 === 0 ? -1 : 1) * (1.44 + Math.floor(c / 2) * 2.14),
    z: profundidadeFileira(r), velocidade: CARACTERES_POR_FOLHA / duracao,
    total: 0, texto: '', tempoFolha: 0, duracaoFolha: duracao,
    entrega: null, paginas: [], folhasConcluidas: 0, tipo: floor(random(4)), fase: random(TWO_PI)
  };
}

function posicionarFileiras() {
  const retrato = width < height * .85;
  visiveis = macacos.map(m => ({ m, ...projetar(m.x - (retrato ? Math.sign(m.x) * .24 : 0), 0, m.z - avancoCamera) }))
    .filter(p => p.x + p.u * 1.15 > 0 && p.x - p.u * 1.15 < width && p.y > 0);
  visiveis.sort((a, b) => b.m.z - a.m.z);
}

function moverCamera() {
  if (Math.abs(destinoCamera - avancoCamera) < .0001) return;
  const fator = reduzirMovimento ? 1 : 1 - Math.exp(-Math.min(deltaTime, 50) / 1000 * 8);
  avancoCamera = lerp(avancoCamera, destinoCamera, fator);
  if (Math.abs(destinoCamera - avancoCamera) < .0001) avancoCamera = destinoCamera;
  let primeira = Math.floor((avancoCamera + .2 - 4.7) / 126.333) * 27;
  while (profundidadeFileira(primeira) < avancoCamera + .2) primeira++;
  if (primeira !== primeiraFileira) {
    const anteriores = new Map(macacos.map(m => [m.r * COLUNAS + m.c, m]));
    macacos = [];
    for (let r = primeira; r < primeira + FILEIRAS; r++) {
      for (let c = 0; c < COLUNAS; c++) macacos.push(anteriores.get(r * COLUNAS + c) || criarMacaco(r, c));
    }
    primeiraFileira = primeira;
  }
  posicionarFileiras();
  desenharArquitetura(sala);
}

function escrever(m) {
  m.texto += ALFABETO[floor(random(ALFABETO.length))];
  m.total++;
}

function atualizarEscrita(agora) {
  const dt = Math.min(.25, Math.max(0, (agora - ultimoTempo) / 1000));
  ultimoTempo = agora;
  for (const m of macacos) {
    let restante = dt;
    while (restante > .000001) {
      if (m.entrega !== null) {
        const passo = Math.min(restante, TEMPO_TROCA - m.entrega);
        m.entrega += passo;
        restante -= passo;
        if (m.entrega >= TEMPO_TROCA - .000001) {
          m.paginas.push(m.texto.split('').join(''));
          if (m.paginas.length > LIMITE_PILHA) m.paginas.shift();
          m.folhasConcluidas++;
          m.texto = '';
          m.tempoFolha = 0;
          m.entrega = null;
        }
      } else {
        const passo = Math.min(restante, m.duracaoFolha - m.tempoFolha);
        m.tempoFolha = Math.min(m.duracaoFolha, m.tempoFolha + passo);
        restante -= passo;
        if (m.duracaoFolha - m.tempoFolha < .000001) m.tempoFolha = m.duracaoFolha;
        const quantidade = Math.min(CARACTERES_POR_FOLHA, Math.floor(m.tempoFolha * m.velocidade + .000001));
        while (m.texto.length < quantidade) escrever(m);
        if (m.tempoFolha === m.duracaoFolha && m.texto.length === CARACTERES_POR_FOLHA) m.entrega = 0;
      }
    }
  }
}

function projetar(x, y, z) {
  const escala = camera.focal / z;
  return { x: camera.x + x * escala, y: camera.y + (camera.altura - y) * escala, u: escala };
}

function recompor() {
  const retrato = width < height * 0.85;
  camera = { x: width * 0.5, y: height * (retrato ? 0.37 : 0.33), focal: Math.min(height * 1.12, width * (retrato ? 1.7 : 1.23)), altura: retrato ? 2.8 : 2.23 };
  for (const g of gravuras) g.remove();
  gravuras = [];
  const resolucao = Math.min(380, Math.max(160, camera.focal / 4.7 * 1.35));
  for (let i = 0; i < 4; i++) gravuras.push(criarGravura(i, resolucao));
  posicionarFileiras();
  if (baseSala) baseSala.remove();
  baseSala = createGraphics(width, height);
  baseSala.pixelDensity(1);
  desenharBaseSala(baseSala);
  if (sala) sala.remove();
  sala = createGraphics(width, height);
  sala.pixelDensity(1);
  desenharArquitetura(sala);
  if (atmosfera) atmosfera.remove();
  atmosfera = createGraphics(width, height);
  atmosfera.pixelDensity(1);
  desenharAtmosfera(atmosfera);
  poeira = Array.from({ length: Math.min(130, Math.floor(width * height / 9000)) }, () => ({ x: random(), y: random(), fase: random(TWO_PI), v: random(0.003, 0.015), tamanho: random(0.5, 1.6) }));
  criarPapelAmpliado();
}

function forma(g, pontos, cor, borda, peso = 0.01) {
  if (typeof cor === 'object' && cor) { g.fill(0); g.drawingContext.fillStyle = cor; }
  else if (cor) g.fill(cor); else g.noFill();
  if (borda) { g.stroke(borda); g.strokeWeight(peso); } else g.noStroke();
  g.beginShape();
  for (const p of pontos) g.vertex(...p);
  g.endShape(CLOSE);
}

function curva(g, pontos, cor, peso) {
  g.noFill();
  g.stroke(cor);
  g.strokeWeight(peso);
  g.bezier(...pontos);
}

function elipse(g, x, y, w, h, cor) {
  g.noStroke(); g.fill(cor); g.ellipse(x, y, w, h);
}

function tinta(g, x1, y1, x2, y2, cores) {
  const grad = g.drawingContext.createLinearGradient(x1, y1, x2, y2);
  cores.forEach((cor, i) => grad.addColorStop(i / (cores.length - 1), cor));
  return grad;
}

function brilho(g, x, y, r, cor, intensidade) {
  const ctx = g.drawingContext;
  const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, `rgba(${cor},${intensidade})`);
  grad.addColorStop(0.23, `rgba(${cor},${intensidade * 0.48})`);
  grad.addColorStop(1, `rgba(${cor},0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

function linhaMundo(g, a, b, cor, peso) {
  const p = projetar(...a), q = projetar(...b);
  g.stroke(cor); g.strokeWeight(peso); g.line(p.x, p.y, q.x, q.y);
}

function desenharBaseSala(g) {
  const ctx = g.drawingContext;
  let grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#111916'); grad.addColorStop(0.38, '#303428'); grad.addColorStop(1, '#25241b');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, width, height);
  const y0 = camera.y;
  grad = ctx.createLinearGradient(0, y0, 0, height);
  grad.addColorStop(0, '#33382b'); grad.addColorStop(0.35, '#3b3524'); grad.addColorStop(1, '#191c17');
  ctx.fillStyle = grad; ctx.fillRect(0, y0, width, height - y0);
  for (let x = -22; x <= 22; x += 0.48) {
    linhaMundo(g, [x, 0, 1.2], [x, 0, PROFUNDIDADE_SALA], '#8577522d', 1);
    linhaMundo(g, [x + 0.018, 0, 1.2], [x + 0.018, 0, PROFUNDIDADE_SALA], '#080c0b72', 1);
  }
  for (let i = 0; i < 1100; i++) {
    const x = random(-15, 15), z = random(3, 80);
    linhaMundo(g, [x, 0, z], [x + random(-0.007, 0.007), 0, z + random(0.3, 3)], '#b09a6720', random(0.4, 1));
  }
  const bordaCorredor = width < height * .85 ? .26 : .53;
  for (const x of [-bordaCorredor, bordaCorredor]) {
    linhaMundo(g, [x, 0, 1.6], [x, 0, PROFUNDIDADE_SALA], '#b08e503f', 2);
    linhaMundo(g, [x * 1.08, 0, 1.6], [x * 1.08, 0, PROFUNDIDADE_SALA], '#090e0b88', 2);
  }
  brilho(g, camera.x, camera.y, Math.min(width, height) * .31, '166,158,100', .17);
  g.noStroke();
  for (let i = 0; i < width * height / 120; i++) {
    g.fill(random() > .5 ? '#edcf9311' : '#020a0719');
    g.rect(random(width), random(height), random(.5, 1.4), random(.5, 1.6));
  }
}

function desenharArquitetura(g) {
  g.clear(); g.image(baseSala, 0, 0);
  const ctx = g.drawingContext;
  ctx.strokeStyle = '#14171183'; ctx.lineWidth = .6; ctx.beginPath();
  for (let z = 2.5 - faseCorredor(1.15); z < 130; z += 1.15 + Math.max(0, z - 45) * .15) {
    for (let x = -16; x < 16; x += 0.96) {
      const offset = (Math.round(x / 0.96) % 3) * 0.39;
      const a = projetar(x, 0, z + offset), b = projetar(x + .46, 0, z + offset);
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
    }
  }
  ctx.stroke();
  for (let r = 62; r >= 0; r--) {
    const z = (r <= 26 ? 5.4 + r * 4.9 : 132.8 * Math.pow(1.085, r - 26)) - faseCorredor(4.9);
    const alpha = Math.max(.2, 1 - r / 31) * Math.exp(-Math.max(0, z - 132.8) / 330);
    g.push(); g.drawingContext.globalAlpha = alpha;
    const tl = projetar(-7.6, 5.25, z), tr = projetar(7.6, 5.25, z);
    const bl = projetar(-7.6, 0, z), br = projetar(7.6, 0, z);
    const u = tl.u;
    forma(g, [[tl.x - u * .16, tl.y], [tl.x + u * .18, tl.y], [bl.x + u * .2, bl.y], [bl.x - u * .2, bl.y]], '#292b22', '#121813', Math.max(1, u * .017));
    forma(g, [[tr.x - u * .18, tr.y], [tr.x + u * .16, tr.y], [br.x + u * .2, br.y], [br.x - u * .2, br.y]], '#272b22', '#121813', Math.max(1, u * .017));
    for (const x of [tl.x, tr.x]) {
      g.stroke('#8b80513b'); g.strokeWeight(Math.max(0.5, u * .023)); g.line(x - u * .09, tl.y, x - u * .09, bl.y);
      g.noStroke(); g.fill('#121914'); g.rect(x - u * .31, bl.y - u * .12, u * .62, u * .17);
      g.fill('#44422c'); g.rect(x - u * .27, tl.y + u * .21, u * .54, u * .11);
    }
    g.stroke('#1a211a'); g.strokeWeight(u * .17); g.line(tl.x, tl.y + u * .14, tr.x, tr.y + u * .14);
    g.stroke('#8a795230'); g.strokeWeight(Math.max(.6, u * .014)); g.line(tl.x, tl.y + u * .23, tr.x, tr.y + u * .23);
    for (const side of [-1, 1]) {
      const p = projetar(side * 7.6, 4.15, z), q = projetar(side * 6.4, 5.1, z);
      curva(g, [p.x, p.y, p.x, q.y + u * .07, q.x - side * u * .15, q.y, q.x, q.y], '#131d17', u * .075);
    }
    g.pop();
  }
  for (const x of [-7.6, -3.8, 0, 3.8, 7.6]) linhaMundo(g, [x, 5.25, 1.2], [x, 5.25, PROFUNDIDADE_SALA], '#6d704232', 1.3);
  lampadas = [];
  for (let r = 59; r >= 0; r--) {
    const z = (r <= 23 ? 4.8 + r * 5.5 : 131.3 * Math.pow(1.085, r - 23)) - faseCorredor(5.5);
    if (z <= .2) continue;
    for (const x of [-4.6, 0, 4.6]) {
      const p = projetar(x, 3.8, z), teto = projetar(x, 5.25, z);
      if (p.x < -width * .1 || p.x > width * 1.1 || p.y < -height * .2) continue;
      if (r <= 23) lampadas.push({ ...p, z, fase: (r + Math.floor(avancoCamera / 5.5)) * 1.7 + x * .83 });
      g.push(); g.drawingContext.globalAlpha = Math.exp(-Math.max(0, z - 131.3) / 550);
      g.stroke('#111812'); g.strokeWeight(Math.max(0.55, p.u * .016)); g.line(teto.x, teto.y, p.x, p.y - p.u * .1);
      brilho(g, p.x, p.y, p.u * 1.3, '244,189,83', 0.15 * Math.min(1, 18 / z));
      const chao = projetar(x, 0, z);
      const feixe = tinta(g, p.x, p.y, chao.x, chao.y, ['#efcb8112', '#efcb8100']);
      forma(g, [[p.x - p.u * .12, p.y], [p.x + p.u * .12, p.y], [chao.x + p.u * 1.15, chao.y], [chao.x - p.u * 1.15, chao.y]], feixe);
      g.push(); g.translate(chao.x, chao.y); g.scale(1, 0.18);
      brilho(g, 0, 0, p.u * 1.9, '207,157,67', 0.18);
      g.pop();
      if (r > 23) {
        forma(g, [[p.x - p.u * .24, p.y], [p.x - p.u * .06, p.y - p.u * .13], [p.x + p.u * .06, p.y - p.u * .13], [p.x + p.u * .24, p.y]], '#232b20');
        elipse(g, p.x, p.y + p.u * .025, p.u * .38, Math.max(.18, p.u * .055), '#ffdd92');
        brilho(g, p.x, p.y + p.u * .04, p.u * .5, '255,210,115', .2);
      }
      g.pop();
    }
  }
  desenharFileirasDistantes(g);
}

function faseCorredor(passo) {
  return ((avancoCamera % passo) + passo) % passo;
}

function desenharFileirasDistantes(g) {
  const inicio = profundidadeFileira(primeiraFileira + FILEIRAS) - avancoCamera;
  const retrato = width < height * .85;
  g.push();
  for (let r = 26; r >= 0; r--) {
    const z = inicio * Math.pow(1.12, r);
    g.drawingContext.globalAlpha = .12 * Math.exp(-Math.max(0, z - 156) / 500);
    for (let c = 0; c < COLUNAS; c++) {
      const lado = c % 2 === 0 ? -1 : 1;
      const x = lado * (1.44 + Math.floor(c / 2) * 2.14 - (retrato ? .24 : 0));
      const p = projetar(x, 0, z);
      g.image(gravuras[(r + c) % gravuras.length], p.x - p.u * 1.25, p.y - p.u * 2.12, p.u * 2.5, p.u * 2.5);
    }
  }
  g.pop();
}

function desenharPe(g, x, y, lado, cor) {
  g.push(); g.translate(x, y); g.scale(lado, 1);
  g.noStroke(); g.fill(cor);
  g.beginShape(); g.vertex(-.047, -.03);
  g.bezierVertex(-.052, -.005, -.09, .015, -.092, .055);
  g.bezierVertex(-.092, .08, -.04, .095, .01, .086);
  g.bezierVertex(.045, .08, .074, .063, .065, .03);
  g.bezierVertex(.04, .005, .046, -.012, .047, -.03);
  g.bezierVertex(.023, -.041, -.022, -.025, -.047, -.03); g.endShape(CLOSE);
  for (let i = 0; i < 4; i++) {
    const inicio = -.077 + i * .039, fim = -.096 + i * .042;
    const ponta = .099 + [0, .014, .02, .012][i];
    curva(g, [inicio, .05, inicio, .075, fim, .08, fim, ponta], cor, .032);
  }
  curva(g, [.052, .046, .073, .06, .105, .082, .098, .11], cor, .047);
  curva(g, [.057, .06, .07, .071, .074, .08, .078, .087], '#3b362766', .005);
  g.pop();
}

function desenharMao(g, x, y, lado, fase, cor) {
  g.push(); g.translate(x, y); g.scale(lado, 1);
  elipse(g, 0, .002, .104, .044, cor);
  for (let i = 0; i < 4; i++) {
    const inicio = -.039 + i * .024;
    const ponta = .028 + [.007, .019, .025, .016][i] + fase * (i % 2 ? .006 : .009);
    curva(g, [inicio, -.001, inicio + .015, -.004, inicio + .018, .025, inicio + .009, ponta], cor, .015);
  }
  curva(g, [.029, .005, .067, .008, .059, .025, .074, .034 + fase * .003], cor, .022);
  g.pop();
}

function criarGravura(tipo, u) {
  const g = createGraphics(Math.ceil(u * 2.5), Math.ceil(u * 2.5));
  g.pixelDensity(1);
  g.scale(u); g.translate(1.25, 2.12);
  g.strokeCap(ROUND); g.strokeJoin(ROUND);
  const pelos = ['#514331', '#403b2d', '#61513a', '#433929'];
  const pelo = pelos[tipo];
  elipse(g, .05, .04, 1.85, .2, '#05090780');
  curva(g, [-.43, -.47, -1.1, -.23, -.42, .11, -.92, .03], '#1b2118', .077);
  curva(g, [-.43, -.47, -1.1, -.23, -.42, .11, -.92, .03], '#756040', .036);
  curva(g, [-.78, .025, -1.11, .13, -1.13, -.21, -.95, -.17], '#665337', .03);
  forma(g, [[-.66, -1.28], [-.06, -1.29], [.03, -.45], [-.68, -.43]], '#3a281a', '#1e2117', .036);
  for (let x = -.57; x < -.06; x += .15) {
    g.stroke('#775736'); g.strokeWeight(.038); g.line(x, -1.24, x + .04, -.54);
    g.stroke('#b188483f'); g.strokeWeight(.009); g.line(x - .012, -1.23, x + .025, -.54);
  }
  forma(g, [[-.75, -.48], [.16, -.49], [.21, -.38], [-.74, -.36]], '#6d4c2c', '#1b1e13', .017);
  for (const x of [-.65, .05]) {
    forma(g, [[x, -.39], [x + .08, -.39], [x + .11, .04], [x + .02, .04]], '#372a1c', '#171b13', .012);
  }
  curva(g, [-.44, -.71, -.62, -.47, -.34, -.4, -.36, -.11], '#302b21', .2);
  curva(g, [-.05, -.72, .18, -.52, .02, -.28, .12, -.09], '#302b21', .19);
  curva(g, [-.43, -.67, -.54, -.45, -.36, -.39, -.36, -.14], '#68553b', .08);
  curva(g, [-.035, -.68, .17, -.5, .055, -.28, .12, -.14], '#5e5039', .075);
  desenharPe(g, -.365, -.105, 1, '#a58a5e');
  desenharPe(g, .125, -.105, -1, '#8e754f');
  g.noStroke(); g.fill(pelo);
  g.drawingContext.fillStyle = tinta(g, -.66, -1.48, .25, -.68, ['#8a7047', pelo, '#302c21']);
  g.beginShape();
  g.vertex(-.61, -.71); g.bezierVertex(-.67, -1.06, -.64, -1.42, -.43, -1.53);
  g.bezierVertex(-.18, -1.7, .16, -1.42, .2, -1.04); g.bezierVertex(.32, -.8, .17, -.64, -.06, -.61);
  g.bezierVertex(-.29, -.62, -.48, -.61, -.61, -.71); g.endShape(CLOSE);
  elipse(g, -.15, -1.06, .42, .7, '#756344');
  elipse(g, -.18, -1.15, .32, .55, '#a78a5940');
  curva(g, [-.5, -1.4, -.81, -1.35, -.7, -1.09, -.43, -1.11], '#25291e', .19);
  curva(g, [-.48, -1.41, -.76, -1.32, -.67, -1.10, -.43, -1.11], '#79603d', .12);
  curva(g, [.08, -1.39, .46, -1.3, .5, -1.14, .34, -1.11], '#25291e', .18);
  curva(g, [.09, -1.39, .42, -1.3, .46, -1.14, .34, -1.11], '#6b5739', .115);
  desenharCabeca(g, tipo);
  for (let i = 0; i < 135; i++) {
    const x = random(-.55, .06), y = random(-1.45, -.78);
    if (x > -.3 && x < .03) continue;
    g.stroke(random(['#b89a5432', '#c0a16c3b', '#161e142e'])); g.strokeWeight(.004);
    g.line(x, y, x + random(-.018, .013), y + random(.018, .041));
  }
  for (const x of [-.78, .77]) {
    forma(g, [[x, -.64], [x + .09, -.64], [x + .08, .075], [x + .015, .075]], '#3a2e1d', '#111812', .015);
    g.stroke('#c197453f'); g.strokeWeight(.012); g.line(x + .016, -.61, x + .025, .05);
  }
  forma(g, [[-.9, -.9], [.85, -.9], [1.02, -.63], [-1, -.63]], tinta(g, -.5, -.92, .2, -.61, ['#9d7440', '#70512f', '#5c4327']), '#171e15', .014);
  forma(g, [[-1, -.63], [1.02, -.63], [1.01, -.53], [-1, -.53]], '#47351f', '#202518', .018);
  g.stroke('#bf99554d'); g.strokeWeight(.012); g.line(-.99, -.625, 1, -.625);
  g.stroke('#1c21166b'); g.strokeWeight(.005);
  for (let i = 0; i < 18; i++) {
    const y = random(-.88, -.65);
    g.line(random(-.97, -.5), y, random(.5, .95), y + .005);
  }
  for (const x of [-.87, .87]) elipse(g, x, -.57, .025, .023, '#ae8d51');
  desenharMaquina(g);
  g.loadPixels();
  return g;
}

function desenharCabeca(g, tipo) {
  g.push(); g.translate(-.22, -1.61); g.rotate((tipo - 1.5) * .035);
  elipse(g, -.273, -.045, .205, .29, '#463b2b');
  elipse(g, .261, -.032, .18, .268, '#352e22');
  elipse(g, -.282, -.045, .13, .201, '#ac855b');
  elipse(g, .268, -.031, .108, .182, '#99734c');
  curva(g, [-.29, -.12, -.36, -.06, -.28, .07, -.245, .0], '#654c36', .022);
  curva(g, [.27, -.1, .33, -.04, .275, .06, .24, .01], '#614933', .022);
  g.fill(['#453a2a', '#34382b', '#51432e', '#373529'][tipo]); g.noStroke();
  g.drawingContext.fillStyle = tinta(g, -.21, -.3, .27, .22, ['#a58a50', '#52452d', '#292e23']);
  g.beginShape();
  g.vertex(-.255, .035); g.bezierVertex(-.305, -.16, -.2, -.31, -.13, -.325);
  g.bezierVertex(-.125, -.359, -.084, -.37, -.055, -.387);
  g.bezierVertex(-.068, -.35, -.035, -.348, .001, -.36);
  g.bezierVertex(.02, -.368, .04, -.381, .052, -.389);
  g.bezierVertex(.055, -.359, .094, -.323, .124, -.31);
  g.bezierVertex(.185, -.28, .222, -.203, .24, -.13); g.bezierVertex(.3, .08, .182, .23, .035, .255);
  g.bezierVertex(-.14, .265, -.22, .17, -.255, .035); g.endShape(CLOSE);
  g.fill('#b49460');
  g.drawingContext.fillStyle = tinta(g, -.18, -.2, .2, .25, ['#e0c18c', '#bb9c67', '#816340']);
  g.beginShape();
  g.vertex(-.193, -.107); g.bezierVertex(-.173, -.237, -.065, -.224, -.014, -.147);
  g.bezierVertex(.06, -.226, .173, -.205, .188, -.086); g.bezierVertex(.205, -.012, .132, .044, .15, .091);
  g.bezierVertex(.252, .19, .134, .284, .015, .258); g.bezierVertex(-.132, .258, -.227, .157, -.167, .073);
  g.bezierVertex(-.132, .023, -.232, -.01, -.193, -.107); g.endShape(CLOSE);
  elipse(g, -.081, -.067, .136, .108, '#68573d');
  elipse(g, .116, -.06, .111, .102, '#6b573d');
  curva(g, [-.18, -.101, -.135, -.135, -.065, -.141, -.017, -.098], '#342f25', .035);
  curva(g, [.049, -.102, .104, -.137, .16, -.126, .186, -.075], '#342f25', .034);
  elipse(g, -.079, -.068, .069, .038, '#d5b680');
  elipse(g, .115, -.061, .061, .034, '#cdb480');
  elipse(g, -.067, -.055, .027, .033, '#191e17');
  elipse(g, .125, -.049, .026, .029, '#141b15');
  elipse(g, -.073, -.064, .009, .009, '#fce5aa');
  elipse(g, .12, -.058, .008, .008, '#ffe8b1');
  elipse(g, .036, .127, .25, .182, '#c1a16f');
  elipse(g, .063, .097, .215, .113, '#c9aa7a');
  forma(g, [[.005, -.04], [.068, -.03], [.093, .065], [.052, .098], [-.009, .069]], '#927044');
  elipse(g, .011, .056, .035, .018, '#3b3929');
  elipse(g, .063, .059, .037, .019, '#3b3929');
  curva(g, [-.067, .157, .001, .189, .092, .172, .147, .134], '#705136', .011);
  curva(g, [-.044, .206, .018, .226, .082, .209, .111, .192], '#e1c18b66', .014);
  curva(g, [-.233, -.183, -.182, -.286, -.09, -.319, -.012, -.31], '#d0a95870', .012);
  for (let i = 0; i < 9; i++) {
    const y = -.19 + i * .043;
    g.stroke('#ae8b483f'); g.strokeWeight(.005);
    g.line(-.255, y, -.216 - Math.sin(i) * .018, y + .031);
    g.line(.23, y, .19, y + .02);
  }
  g.pop();
}

function desenharMaquina(g) {
  elipse(g, .11, -.74, 1.19, .13, '#0a100bbe');
  forma(g, [[-.36, -1.17], [.55, -1.17], [.66, -.96], [-.45, -.96]], '#1d291e', '#09120d', .018);
  g.stroke('#818363'); g.strokeWeight(.02); g.line(-.09, -1.15, .32, -1.15);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 10; c++) {
      const x = -.32 + c * .089 + (r % 2) * .013, y = -1.119 + r * .035;
      elipse(g, x, y + .007, .058, .032, '#04120a');
      elipse(g, x, y, .053, .025, '#95927a');
      elipse(g, x, y - .001, .036, .016, '#35422e');
    }
  }
  g.noStroke(); g.fill('#202d22');
  g.drawingContext.fillStyle = tinta(g, 0, -.99, 0, -.71, ['#57624a', '#26352a', '#121e17']);
  g.beginShape();
  g.vertex(-.45, -.73); g.bezierVertex(-.49, -.84, -.44, -.985, -.34, -.989);
  g.vertex(.54, -.989); g.bezierVertex(.63, -.989, .704, -.83, .66, -.73);
  g.vertex(-.45, -.73); g.endShape(CLOSE);
  curva(g, [-.4, -.82, -.25, -.849, .44, -.849, .6, -.82], '#8e997151', .01);
  curva(g, [-.36, -.962, -.21, -.973, .42, -.973, .55, -.962], '#c3c2974f', .008);
  forma(g, [[-.46, -.73], [.67, -.73], [.68, -.685], [-.45, -.685]], '#101c14', '#07120a', .015);
  g.stroke('#777d5859'); g.strokeWeight(.008); g.line(-.44, -.726, .65, -.726);
  for (const x of [-.31, .53]) {
    elipse(g, x, -.899, .016, .014, '#909778');
    elipse(g, x, -.77, .016, .014, '#727b59');
  }
  g.stroke('#899371'); g.strokeWeight(.023); g.line(-.47, -.969, .65, -.969);
  g.stroke('#111f16'); g.strokeWeight(.057); g.line(-.39, -.968, .57, -.968);
  for (const x of [-.43, .62]) {
    elipse(g, x, -.971, .076, .108, '#14251a');
    elipse(g, x - .012, -.979, .045, .07, '#737e5c');
  }
  curva(g, [.61, -.972, .72, -.986, .73, -1.06, .79, -1.046], '#9c9e78', .017);
  forma(g, [[-.105, -.822], [.298, -.822], [.29, -.764], [-.1, -.764]], '#17231a', '#79836066', .006);
  g.noStroke(); g.fill('#b7b17a'); g.textAlign(CENTER, CENTER); g.textFont('Georgia'); g.textSize(.037); g.text('ÆTERNUM', .09, -.79);
}

function papelDe(p) {
  const progresso = p.m.texto.length / CARACTERES_POR_FOLHA;
  const deslocamento = ((p.m.texto.length % LETRAS_POR_LINHA) / LETRAS_POR_LINHA - .5) * .12;
  const h = (.035 + progresso * .475) * p.u;
  return { x: p.x + (-.105 + deslocamento) * p.u, y: p.y - .973 * p.u - h, w: .425 * p.u, h };
}

function pontosPilha(p, quantidade = p.m.paginas.length) {
  const altura = Math.min(LIMITE_PILHA, quantidade) * .0018;
  const ajuste = Math.sin(quantidade * 1.7) * .006;
  return [[-.915, -.849], [-.545, -.849], [-.505, -.69], [-.959, -.69]]
    .map(([x, y]) => [p.x + (x + ajuste) * p.u, p.y + (y - altura) * p.u]);
}

function pontosFolha(p) {
  const f = papelDe(p);
  const pontos = [[f.x, f.y], [f.x + f.w, f.y], [f.x + f.w, f.y + f.h], [f.x, f.y + f.h]];
  if (p.m.entrega === null) return pontos;
  const t = reduzirMovimento ? 1 : Math.min(1, p.m.entrega / TEMPO_TROCA);
  const suave = t * t * (3 - 2 * t);
  const destino = pontosPilha(p, p.m.paginas.length + 1);
  return pontos.map(([x, y], i) => [lerp(x, destino[i][0], suave), lerp(y, destino[i][1], suave) - Math.sin(t * PI) * p.u * .14]);
}

function desenharPilha(p) {
  const quantidade = p.m.paginas.length;
  if (!quantidade) return;
  const topo = pontosPilha(p), base = pontosPilha(p, 0);
  forma(window, [topo[3], topo[2], base[2], base[3]], '#b6a47b', '#79694d', Math.max(.35, p.u * .002));
  if (p.u > 30) {
    for (let n = 1; n < quantidade; n += Math.max(1, Math.ceil(quantidade / 8))) {
      const borda = pontosPilha(p, n);
      stroke('#e2d3af'); strokeWeight(Math.max(.3, p.u * .0015));
      line(...borda[3], ...borda[2]);
    }
  }
  const destaque = sobMouse?.m === p.m && sobMouse.pilha;
  if (destaque) {
    drawingContext.shadowColor = '#f9d88d'; drawingContext.shadowBlur = Math.max(7, p.u * .06);
  }
  forma(window, topo, destaque ? '#fff0cc' : '#dfd0a9', destaque ? '#ffe9b4' : '#a8956e', Math.max(.4, p.u * .003));
  drawingContext.shadowBlur = 0;
  if (p.u > 60) {
    const texto = p.m.paginas[quantidade - 1];
    stroke('#796b5080'); strokeWeight(Math.max(.3, p.u * .0012));
    for (let i = 0; i < texto.length; i += 6) {
      const trecho = texto.slice(i, i + 6);
      if (!trecho.trim()) continue;
      const linha = Math.floor(i / LETRAS_POR_LINHA), coluna = (i % LETRAS_POR_LINHA) / 6;
      const v = .12 + linha * .76 / (LINHAS_POR_FOLHA - 1), a = .1 + coluna * .114;
      const esquerda = [lerp(topo[0][0], topo[3][0], v), lerp(topo[0][1], topo[3][1], v)];
      const direita = [lerp(topo[1][0], topo[2][0], v), lerp(topo[1][1], topo[2][1], v)];
      const b = a + .075 + (texto.charCodeAt(i) % 4) * .007;
      line(lerp(esquerda[0], direita[0], a), esquerda[1], lerp(esquerda[0], direita[0], b), direita[1]);
    }
  }
}

function desenharEstacao(p, tempo) {
  const { m, x, y, u } = p;
  const ctx = drawingContext;
  const distancia = m.z - avancoCamera;
  ctx.globalAlpha = Math.max(.12, Math.min(1, 1.16 - distancia / 150)) * Math.exp(-Math.max(0, distancia - 156) / 330);
  image(gravuras[m.tipo], x - u * 1.25, y - u * 2.12, u * 2.5, u * 2.5);
  desenharPilha(p);
  if (u > 44) {
    const fase = reduzirMovimento || m.entrega !== null ? 0 : Math.sin(tempo * m.velocidade * .2 + m.fase);
    push(); translate(x, y); scale(u);
    curva(window, [-.43, -1.112, -.36, -1.15, -.29, -1.13, -.275, -1.102], '#aa9063', .05);
    curva(window, [.34, -1.112, .375, -1.153, .43, -1.132, .424, -1.099], '#ac8e60', .048);
    desenharMao(window, -.277, -1.123, 1, fase, '#c5ad78');
    desenharMao(window, .414, -1.125, -1, -fase, '#b9a272');
    pop();
  }
  const f = papelDe(p), destaque = sobMouse === p;
  if (destaque) {
    ctx.shadowColor = '#f9d88d'; ctx.shadowBlur = Math.max(7, u * .08);
    stroke('#ffe9b4'); strokeWeight(Math.max(1.2, u * .012));
  } else {
    stroke('#b5a47b'); strokeWeight(Math.max(.35, u * .002));
  }
  ctx.fillStyle = tinta(window, f.x, f.y, f.x, f.y + f.h, [destaque ? '#fff5db' : '#f1e6c9', '#e5d6ad', '#cdbb8f']);
  const pontos = pontosFolha(p);
  ctx.beginPath(); ctx.moveTo(...pontos[0]);
  for (let i = 1; i < pontos.length; i++) ctx.lineTo(...pontos[i]);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;
  if (m.entrega === null) {
    stroke('#18271a'); strokeWeight(Math.max(1.1, u * .041));
    line(x - u * .38, y - u * .964, x + u * .57, y - u * .964);
  }
  if (u > 50) {
    noStroke(); fill('#bda36d'); textFont('Courier New'); textSize(u * .029); textAlign(CENTER, CENTER);
    text(String(m.id).padStart(3, '0'), x + u * .11, y - u * .574);
  }
  ctx.globalAlpha = 1;
}

function desenharLampadas(tempo) {
  for (const l of lampadas) {
    const u = l.u, oscilacao = reduzirMovimento ? 1 : .92 + .08 * Math.sin(tempo * 2.1 + l.fase) + .025 * Math.sin(tempo * 9 + l.fase);
    brilho(window, l.x, l.y + u * .04, u * .5, '255,210,115', .23 * oscilacao);
    noStroke(); fill('#232b20');
    beginShape(); vertex(l.x - u * .24, l.y); vertex(l.x - u * .06, l.y - u * .13); vertex(l.x + u * .06, l.y - u * .13); vertex(l.x + u * .24, l.y); endShape(CLOSE);
    fill('#8d885252'); ellipse(l.x, l.y - u * .005, u * .47, u * .027);
    fill(255, 219, 146, 235 * oscilacao); ellipse(l.x, l.y + u * .013, u * .38, u * .05);
    fill('#fff0b5'); ellipse(l.x, l.y + u * .037, u * .055, u * .043);
  }
}

function desenharAtmosfera(g) {
  const ctx = g.drawingContext;
  g.push(); g.translate(camera.x, camera.y); g.scale(1, .23);
  brilho(g, 0, 0, Math.min(width * .55, height * .75), '115,125,87', .23);
  g.pop();
  g.push(); g.translate(camera.x, camera.y); g.scale(1, .65);
  brilho(g, 0, 0, Math.min(width, height) * .035, '83,83,58', .18);
  g.pop();
  const r = Math.max(width, height) * .67;
  const grad = ctx.createRadialGradient(width * .5, height * .52, height * .11, width * .5, height * .48, r);
  grad.addColorStop(0, '#030c0600'); grad.addColorStop(.56, '#03100b0a'); grad.addColorStop(1, '#010805d1');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, width, height);
  for (let i = 0; i < width * height / 95; i++) {
    g.noStroke(); g.fill(random() > .5 ? '#f4d59a0c' : '#0012060c'); g.rect(random(width), random(height), 1, 1);
  }
}

function desenharPoeira(tempo) {
  noStroke();
  for (const p of poeira) {
    const t = reduzirMovimento ? 0 : tempo;
    const x = ((p.x + Math.sin(t * .12 + p.fase) * .017) % 1 + 1) % 1 * width;
    const y = ((p.y - t * p.v * .07) % 1 + 1) % 1 * height;
    const proximidade = 1 - Math.min(1, Math.abs(x / width - .5) * 1.5);
    fill(237, 211, 152, (22 + 53 * proximidade) * (.7 + .3 * Math.sin(t + p.fase)));
    ellipse(x, y, p.tamanho, p.tamanho);
  }
}

function dentroDaFolha(x, y, pontos) {
  let positivo = false, negativo = false;
  for (let i = 0; i < pontos.length; i++) {
    const a = pontos[i], b = pontos[(i + 1) % pontos.length];
    const lado = (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]);
    positivo ||= lado > 0;
    negativo ||= lado < 0;
    if (positivo && negativo) return false;
  }
  return true;
}

function encontrarPapel(x, y) {
  for (let i = visiveis.length - 1; i >= 0; i--) {
    const p = visiveis[i];
    if (dentroDaFolha(x, y, pontosFolha(p))) return p;
    if (p.m.paginas.length && dentroDaFolha(x, y, pontosPilha(p))) return { ...p, pilha: true };
    // O canal alfa do desenho distingue uma folha escondida de uma folha entre dois corpos.
    const g = gravuras[p.m.tipo];
    const px = Math.floor(((x - p.x) / p.u + 1.25) / 2.5 * g.width);
    const py = Math.floor(((y - p.y) / p.u + 2.12) / 2.5 * g.height);
    if (px >= 0 && px < g.width && py >= 0 && py < g.height && g.pixels[(py * g.width + px) * 4 + 3] > 180) return null;
  }
  return null;
}

function abrirFolha(m, pilha = false) {
  destinoCamera = avancoCamera;
  folhaAberta = pilha ? { id: m.id, texto: m.paginas[m.paginas.length - 1] } : m;
  document.body.classList.add('lendo');
}

function fecharFolha() {
  folhaAberta = null;
  document.body.classList.remove('lendo');
}

function tamanhoPapel() {
  const w = Math.min(width * .9, height * .64);
  const h = w * 1.414;
  return { x: (width - w) / 2, y: (height - h) / 2, w, h };
}

function criarPapelAmpliado() {
  if (papelAmpliado) papelAmpliado.remove();
  const f = tamanhoPapel();
  papelAmpliado = createGraphics(Math.ceil(f.w), Math.ceil(f.h));
  papelAmpliado.pixelDensity(1);
  const g = papelAmpliado;
  g.noStroke();
  for (let y = 0; y < g.height; y++) {
    g.fill(lerpColor(color('#f0e5c8'), color('#dcc99d'), y / g.height));
    g.rect(0, y, g.width, 1);
  }
  for (let i = 0; i < g.width * g.height / 25; i++) {
    g.fill(105, 79, 34, random(3, 15));
    g.ellipse(random(g.width), random(g.height), random(.4, 1.5));
  }
  for (let i = 0; i < 7; i++) {
    g.noFill(); g.stroke(105, 78, 38, (7 - i) * 1.5); g.strokeWeight(1);
    g.rect(i, i, g.width - i * 2, g.height - i * 2);
  }
}

function desenharFolha() {
  const f = tamanhoPapel();
  noStroke(); fill(3, 9, 6, 205); rect(0, 0, width, height);
  for (let i = 7; i > 0; i--) {
    fill(0, 0, 0, 6); rect(f.x - i * 2, f.y + i, f.w + i * 4, f.h + i * 2, 2);
  }
  image(papelAmpliado, f.x, f.y, f.w, f.h);
  const fonte = f.w * .75 / (LETRAS_POR_LINHA * .6);
  const entrelinhas = (f.h * .83 - fonte) / (LINHAS_POR_FOLHA - 1);
  textFont('Courier New'); textSize(fonte); textAlign(LEFT, TOP); noStroke();
  for (let i = 0; i < LINHAS_POR_FOLHA; i++) {
    const linha = folhaAberta.texto.slice(i * LETRAS_POR_LINHA, (i + 1) * LETRAS_POR_LINHA);
    fill(45, 40, 31, 210 + noise(i * .6, folhaAberta.id) * 25);
    text(linha, f.x + f.w * .125, f.y + f.h * .085 + i * entrelinhas);
  }
}

function draw() {
  const agora = millis(), tempo = agora / 1000;
  moverCamera();
  atualizarEscrita(agora);
  sobMouse = folhaAberta ? null : encontrarPapel(mouseX, mouseY);
  cursor(sobMouse ? HAND : ARROW);
  image(sala, 0, 0, width, height);
  for (const p of visiveis) desenharEstacao(p, tempo);
  desenharLampadas(tempo);
  image(atmosfera, 0, 0, width, height);
  desenharPoeira(tempo);
  if (folhaAberta) desenharFolha();
}

function tocarCena(x, y) {
  if (folhaAberta) {
    const f = tamanhoPapel();
    if (x < f.x || x > f.x + f.w || y < f.y || y > f.y + f.h) fecharFolha();
  } else {
    const p = encontrarPapel(x, y);
    if (p) abrirFolha(p.m, p.pilha);
  }
}

function mouseWheel(event) {
  if (!folhaAberta) destinoCamera += Math.max(-600, Math.min(600, event.delta)) * .01;
  return false;
}

function mousePressed() {
  if (mouseButton === LEFT) tocarCena(mouseX, mouseY);
}

function touchStarted() {
  if (touches.length) tocarCena(touches[0].x, touches[0].y);
  return false;
}

function keyPressed() {
  if (key === 'r' || key === 'R') novaSala();
  if (keyCode === ESCAPE) fecharFolha();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  recompor();
}
