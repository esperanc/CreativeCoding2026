// bonecos.js: convidados, Próspero, camponeses e o mascarado

// ---------- convidados ----------

const OURO = [43, 62, 54], MARFIM = [42, 32, 86], PRETO = [270, 22, 9], PELE = [26, 34, 76];
const PALETAS = [
  [[352, 62, 36], [43, 70, 54], [34, 32, 86]],
  [[178, 46, 30], [40, 36, 82], [18, 66, 48]],
  [[44, 74, 50], [280, 22, 14], [2, 62, 42]],
  [[150, 46, 28], [45, 76, 56], [36, 40, 86]],
  [[40, 30, 85], [355, 66, 38], [45, 70, 52]],
  [[22, 76, 48], [215, 52, 30], [45, 40, 85]],
  [[335, 46, 56], [285, 36, 22], [45, 70, 58]],
  [[205, 48, 40], [42, 60, 58], [0, 0, 92]],
  [[0, 0, 90], [0, 0, 12], [352, 66, 40]],
];

function criaMascara(tipo, r, pal) {
  const ps = [];
  const olho = (x, y, rx = 4.6, ry = 3.2) => peca(elipse(x, y, rx, ry, 10), cor(PRETO), r, 0.25, 4);
  if (tipo === 5) {   // rosto descoberto, de camponês
    ps.push(olho(-6, -3, 3, 3.8), olho(6, -3, 3, 3.8), peca(elipse(0, 10, 4, 2.4, 8), cor(PRETO), r, 0.2, 4));
    return ps;
  }
  if (tipo === 6) {   // Próspero: meia máscara de ouro, que não esconde quem ele é, e barba
    ps.push(peca([[-15, 6], [15, 6], [12, 26], [0, 38], [-12, 26]], cor([24, 30, 16]), r, 0.5, 5));
    ps.push(peca(elipse(0, -4, 21, 9, 18), cor(OURO, 4), r, 0.5, 5), olho(-8, -4), olho(8, -4));
    ps.push(peca([[-11, 7], [0, 4], [11, 7], [0, 10]], cor([24, 30, 12]), r, 0.3, 5));
    return ps;
  }
  if (tipo === 0) {
    ps.push(peca(elipse(0, -4, 22, 10.5, 18), cor(pal[1]), r, 0.5, 5), olho(-8, -4), olho(8, -4));
  } else if (tipo === 1) {
    ps.push(peca(elipse(0, -2, 18, 22, 18), cor(MARFIM), r, 0.5, 5));
    ps.push(peca([[-7, 0], [7, 0], [3.5, 34], [0, 41], [-3.5, 34]], cor(MARFIM, -9), r, 0.5, 6));
    ps.push(peca(elipse(-8, -6, 6.2, 6.2, 12), cor(OURO), r, 0.25, 4), peca(elipse(8, -6, 6.2, 6.2, 12), cor(OURO), r, 0.25, 4));
    ps.push(olho(-8, -6, 3.6, 3.6), olho(8, -6, 3.6, 3.6));
  } else if (tipo === 2) {
    ps.push(peca(estrela(14, 41, 25), cor(OURO, -6), r, 0.5, 6));
    ps.push(peca(elipse(0, 0, 19, 24, 18), cor(OURO, 10), r, 0.5, 5), olho(-7, -4), olho(7, -4));
    ps.push(peca(elipse(0, 11, 6, 2.2, 8), cor(PRETO), r, 0.2, 4));
  } else if (tipo === 3) {
    const meia = [];
    for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i / 10 * Math.PI; meia.push([Math.cos(a) * 19, Math.sin(a) * 25]); }
    for (let i = 10; i >= 0; i--) { const a = -Math.PI / 2 + i / 10 * Math.PI; meia.push([Math.cos(a) * 5 - 2, Math.sin(a) * 25]); }
    ps.push(peca(meia, cor([212, 16, 82]), r, 0.5, 5), olho(9, -4), olho(-8, -4, 3.6, 2.6));
  } else {
    ps.push(peca([[-22, -2], [-21, -24], [-9, -13], [0, -15], [9, -13], [21, -24], [22, -2], [14, 8], [0, 4], [-14, 8]], cor(pal[2]), r, 0.5, 6));
    ps.push(olho(-8, -4, 5, 3), olho(8, -4, 5, 3));
  }
  return ps;
}

function criaChapeu(tipo, r, pal) {
  const tras = [], frente = [];
  if (tipo === 5) {   // capuz
    tras.push(peca([[-25, 16], [-27, -10], [-15, -30], [0, -37], [15, -30], [27, -10], [25, 16], [12, 26], [-12, 26]], cor(pal[1]), r, 0.7, 6));
    return { tras, frente };
  }
  if (tipo === 6) {   // coroa alta com faixa de arminho
    frente.push(peca([[-23, -14], [-27, -50], [-15, -34], [-8, -56], [0, -36], [8, -56], [15, -34], [27, -50], [23, -14]], cor(OURO, 2), r, 0.5, 6));
    frente.push(peca(ret(-24, -22, 48, 10), cor([0, 0, 93]), r, 0.4, 6));
    for (const dx of [-14, 0, 14]) frente.push(peca(elipse(dx, -17, 2.2, 2.2, 6), cor(PRETO), r, 0.15, 3));
    frente.push(peca(elipse(0, -34, 3.6, 3.6, 8), cor([355, 72, 42]), r, 0.2, 4));
    return { tras, frente };
  }
  if (tipo === 0) {
    for (let i = -2; i <= 2; i++) tras.push(peca(gira(pena(56 + r() * 22, 15), i * 0.34, i * 3, -16), cor(pal[Math.abs(i) % 2 ? 1 : 2], (r() - 0.5) * 8), r, 0.5, 6));
    frente.push(peca(elipse(0, -21, 5, 5, 10), cor(OURO), r, 0.25, 4));
  } else if (tipo === 1) {
    frente.push(peca(gira([[-15, 0], [15, 0], [3, -90], [-3, -90]], 0.2, 2, -17), cor(pal[1]), r, 0.5, 7));
    frente.push(peca(gira(ret(-16, -6, 32, 8), 0.2, 2, -17), cor(pal[2]), r, 0.4, 6));
  } else if (tipo === 2) {
    frente.push(peca([[-20, -15], [-23, -41], [-12, -28], [-6, -45], [0, -28], [6, -45], [12, -28], [23, -41], [20, -15]], cor(OURO), r, 0.5, 6));
    frente.push(peca(elipse(0, -22, 3.4, 3.4, 8), cor([355, 70, 42]), r, 0.2, 4));
  } else if (tipo === 3) {
    const chifre = [[-17, -13], [1, -23], [-9, -32], [-31, -54], [-41, -47], [-28, -30]];
    frente.push(peca(chifre, cor(pal[0], -4), r, 0.5, 6));
    frente.push(peca(chifre.map(([x, y]) => [-x, y]), cor(pal[1]), r, 0.5, 6));
    frente.push(peca(elipse(-39, -52, 4.6, 4.6, 10), cor(OURO), r, 0.25, 4), peca(elipse(39, -52, 4.6, 4.6, 10), cor(OURO), r, 0.25, 4));
  } else {
    tras.push(peca(gira(pena(64, 15), 0.7, 10, -34), cor(pal[2]), r, 0.5, 6));
    frente.push(peca([[-15, -17], [15, -17], [13, -47], [-13, -47]], cor(pal[1]), r, 0.5, 6));
    frente.push(peca(elipse(0, -17, 41, 7.5, 20), cor(pal[1], -7), r, 0.5, 6));
  }
  return { tras, frente };
}

function criaFigura(id, x0, fundura, pal, opc = {}) {
  const r = gerador(id * 977 + 13);
  const mulher = opc.mulher ?? (id % 2 === 0);
  const f = {
    id, x0, x: x0, mulher,
    y: CHAO + 4 + fundura * 40, s: (1.04 + fundura * 0.16) * (0.96 + r() * 0.1) * (opc.escala ?? 1),
    fase: r() * Math.PI * 2, vel: 0.85 + r() * 0.4, passeio: 20 + r() * 40,
    lado: r() < 0.5 ? -1 : 1, bracoAlto: r() < 0.5 ? -1 : 1, duasVaretas: id % 3 === 0, p: {},
  };
  const p = f.p;
  if (mulher) {
    const larg = 150 + r() * 54;
    p.saia = peca(saia(32, larg, 165, 8), cor(pal[0], -4), r);
    p.barra = peca(saia(larg * 0.88, larg, 16, 8).map(([x, y]) => [x, y + 149]), cor(pal[2], -6), r, 0.6, 7);
    p.painel = peca(saia(34, larg * 0.7, 96, 6), cor(pal[1], -6), r);
    p.laco = peca(saia(12, 30, 60, 2), cor(pal[2], -4), r, 0.5, 7);
  } else {
    p.saia = peca(saia(34, 86, 74, 5), cor(pal[0], -4), r);
    p.painel = peca(saia(12, 24, 74, 1), cor(pal[1], -4), r);
    p.coxa = [peca(membro(68, 19, 14), cor(pal[1], -6), r), peca(membro(68, 19, 14), cor(pal[2], -10), r)];
    p.canela = [peca(membro(64, 14, 10), cor(pal[1], -6), r), peca(membro(64, 14, 10), cor(pal[2], -10), r)];
    p.sapato = [0, 1].map(() => peca([[-6, -4], [6, -5], [28, 4], [34, 8], [-6, 8]], cor(PRETO, 6), r, 0.4, 6));
  }
  p.tronco = peca(tronco(58, 30, 78), cor(pal[0], -9), r);
  p.peito = peca([[-8, -4], [8, -4], [12, -74], [-12, -74]], cor(pal[1], -2), r, 0.5, 7);
  p.cinto = peca(ret(-18, -7, 36, 8), cor(pal[2], -8), r, 0.4, 6);
  p.braco = [0, 1].map(() => peca(membro(46, 15, 11), cor(pal[0], 0), r));
  p.ante = [0, 1].map(() => peca(membro(44, 11, 8), cor(mulher ? PELE : pal[0], mulher ? -4 : 4), r));
  p.manga = mulher ? [0, 1].map(() => peca([[-6, -2], [6, -2], [22, 40], [3, 50], [-15, 44]], cor(pal[1], -6), r)) : null;
  p.mao = [0, 1].map(() => peca(elipse(0, 3, 5, 7, 10), cor(PELE, -4), r, 0.3, 4));
  p.gola = peca(estrela(12, 25, 18).map(([x, y]) => [x, y * 0.5 + 15]), cor(MARFIM, -6), r, 0.4, 5);
  p.cabeca = peca(elipse(0, 0, 16.5, 22, 20), cor(PELE, -4 + (r() - 0.5) * 8), r, 0.4, 5);
  p.mascara = criaMascara(opc.mascara ?? (id * 3) % 5, r, pal);
  p.chapeu = criaChapeu(opc.chapeu ?? (id * 2 + 1) % 5, r, pal);
  p.tacha = peca(elipse(0, 0, 2.6, 2.6, 8), cor(OURO, 6), r, 0.15, 3);
  return f;
}

// As manchas escarlates da peste: aparecem uma a uma, crescendo, no rosto e no peito.
function criaPeste(f, semente) {
  const r = gerador(semente), sangue = [356, 76, 30];
  const manchas = (n, x, y0, y1, raio, largura) => Array.from({ length: n }, (_, i) => {
    const y = y0 + r() * (y1 - y0);
    return { x: (r() - 0.5) * largura(y) * x, y, limiar: i / n * 0.75 + r() * 0.08, pc: peca(mancha(0, 0, raio + r() * raio * 0.8, r), cor(sangue, (r() - 0.5) * 12), r, 0.5, 4) };
  });
  f.p.peste = {
    rosto: manchas(5, 0.8, -14, 14, 3.2, () => 28),
    corpo: manchas(6, 0.75, -70, -10, 4.5, y => 30 + 28 * (-y / 78)),
  };
}
function poePeste(lista, u) {
  for (const m of lista) {
    const k = limita((u - m.limiar) / 0.2, 0, 1);
    if (k <= 0) continue;
    g.save(); g.translate(m.x, m.y); g.scale(k, k); poe(m.pc, { semSombra: true }); g.restore();
  }
}
// Uma peça que solta do boneco e cai (o punhal, a coroa): desce em tela, girando.
function soltaECai(cai, dx = 0) {
  const m = g.getTransform();
  g.setTransform(m.a, m.b, m.c, m.d, m.e + cai * dx, m.f + cai * cai * 460);
  g.rotate(cai * 4);
}

function tacha(f, x, y) { g.save(); g.translate(x, y); poe(f.p.tacha, { liso: true }); g.restore(); }

// Vareta de madeira, em coordenadas de tela (a sombra usa o mesmo desvio da camada).
// As varetas das mãos descem até abaixo da tela; no zoom de fora, "ajusteVareta" desconta
// o deslocamento da câmera, para elas pararem sempre na beira do palco.
let ajusteVareta = 0;
function vareta(x0, y0, x1, y1, larg = 3.4, ebano = false) {
  const m = g.getTransform();
  larg *= escalaPapel;
  const dx = x1 - x0, dy = y1 - y0, n = Math.hypot(dx, dy) || 1;
  const px = -dy / n * larg / 2, py = dx / n * larg / 2;
  const caminho = (ox, oy) => { g.beginPath(); g.moveTo(x0 + px + ox, y0 + py + oy); g.lineTo(x1 + px + ox, y1 + py + oy); g.lineTo(x1 - px + ox, y1 - py + oy); g.lineTo(x0 - px + ox, y0 - py + oy); g.closePath(); };
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (modoSombra) { caminho(0, 0); g.fillStyle = '#000'; g.fill(); g.setTransform(m); return; }
  caminho(2 * escalaPapel, 3 * escalaPapel); g.fillStyle = 'rgba(6, 3, 12, 0.35)'; g.fill();
  caminho(0, 0);
  const gd = g.createLinearGradient(x0 + px, y0 + py, x0 - px, y0 - py);
  if (ebano) { gd.addColorStop(0, '#5a4a48'); gd.addColorStop(0.5, '#241a1a'); gd.addColorStop(1, '#0c0808'); }
  else { gd.addColorStop(0, '#e2c48c'); gd.addColorStop(0.55, '#b88f55'); gd.addColorStop(1, '#6f5230'); }
  g.fillStyle = gd; g.fill();
  // amarração de linha onde a vareta prende na peça
  g.fillStyle = ebano ? '#7a1418' : '#3a2418';
  g.beginPath(); g.arc(x0, y0, larg * 0.95, 0, Math.PI * 2); g.fill();
  g.setTransform(m);
}

// ---------- o mascarado ----------

function criaMorte() {
  const r = gerador(4242);
  const linho = [36, 14, 62], osso = [46, 24, 84], sangue = [356, 76, 29];
  const m = { y: CHAO + 64, p: {} };
  const p = m.p;
  p.manto = peca(saia(50, 156, 300, 11, 1, r), cor(linho), r, 1.2);
  p.dobras = [-34, 0, 30].map((dx, i) => peca(saia(8, 30 + i * 6, 292, 3, 1, r).map(([x, y]) => [x * 1 + dx * (0.3 + y / 400), y]), cor(linho, -9), r, 1));
  p.manchasManto = [];
  for (let i = 0; i < 13; i++) { const y = 20 + r() * 265; p.manchasManto.push(peca(mancha((r() - 0.5) * (40 + y * 0.3), y, 7 + r() * 17, r), cor(sangue, (r() - 0.5) * 10), r, 0.8, 5)); }
  p.tronco = peca(tronco(78, 48, 72), cor(linho, -4), r, 1);
  p.manga = [0, 1].map(() => peca(membro(128, 24, 36), cor(linho, 3), r, 1.1));
  p.mao = [0, 1].map(() => [peca(elipse(0, 6, 6, 9, 10), cor(osso, -6), r, 0.4, 4)].concat([-6, -2, 2, 6].map((dx, k) => peca(gira(ret(-1.4, 0, 2.8, 20 + (k % 2) * 5), dx * 0.03, dx, 10), cor(osso, -6), r, 0.3, 5))));
  p.capuz = peca([[-52, 52], [-44, 6], [-34, -34], [-12, -62], [4, -78], [14, -60], [34, -34], [44, 6], [52, 52], [26, 62], [0, 54], [-26, 62]], cor(linho, -20), r, 1.3);
  p.cranio = peca([[-22, -14], [-15, -31], [0, -36], [15, -31], [22, -14], [22, 4], [15, 16], [12, 33], [0, 39], [-12, 33], [-15, 16], [-22, 4]], cor(osso), r, 0.7, 6);
  p.olhos = [peca(gira(elipse(0, 0, 7.4, 8.6, 12), 0.2, -9.5, -5), cor(PRETO), r, 0.4, 4), peca(gira(elipse(0, 0, 7.4, 8.6, 12), -0.2, 9.5, -5), cor(PRETO), r, 0.4, 4)];
  p.nariz = peca([[0, 6], [4.5, 16], [0, 14], [-4.5, 16]], cor(PRETO), r, 0.3, 5);
  p.dentes = [-8, -4, 0, 4, 8].map(dx => peca(ret(dx - 0.9, 22, 1.8, 11), cor(PRETO, 8), r, 0.2, 6));
  p.boca = peca(ret(-11, 26, 22, 1.8), cor(PRETO, 8), r, 0.2, 6);
  p.manchasRosto = [peca(mancha(-9, -22, 7, r), cor(sangue), r, 0.5, 4), peca(mancha(12, 8, 5.5, r), cor(sangue, 6), r, 0.5, 4), peca(mancha(5, -26, 3.2, r), cor(sangue, -4), r, 0.4, 3)];
  // Para dançar, as mangas ganharam cotovelo: braço e antebraço do mesmo comprimento da manga
  // inteira, que continua sendo cortada só para o sorteio das outras peças não mudar.
  const rc = gerador(4343);
  p.mangaSup = [0, 1].map(() => peca(membro(70, 24, 30), cor(linho, 3), rc, 1.1));
  p.mangaInf = [0, 1].map(() => peca(membro(68, 27, 36), cor(linho, 1), rc, 1.1));
  return m;
}


// ---------- Próspero e os camponeses ----------

function criaProspero(x) {
  const pal = [[276, 54, 30], [43, 72, 52], [0, 0, 92]];   // púrpura real, ouro e arminho
  const f = criaFigura(99, x, 1.0, pal, { mulher: true, mascara: 6, chapeu: 6, escala: 1.15 });
  const r = gerador(991);
  f.lado = 1; f.bracoAlto = 1; f.duasVaretas = true; f.passeio = 6; f.vel = 0.8;
  f.p.capa = peca(saia(70, 196, 236, 9).map(([a, b]) => [a, b - 76]), cor([356, 64, 28]), r, 0.9);
  f.p.arminho = peca(saia(74, 92, 24, 6).map(([a, b]) => [a, b - 80]), cor([0, 0, 93]), r, 0.6, 6);
  f.p.pintas = [-24, -8, 8, 24].map(dx => peca(elipse(dx, -64, 2.2, 3, 6), cor(PRETO), r, 0.15, 3));
  f.p.punhal = [
    peca([[-2.6, 6], [2.6, 6], [1.6, 40], [0, 49], [-1.6, 40]], cor([210, 12, 82]), r, 0.25, 6),
    peca(ret(-8, 3, 16, 4), cor(OURO, 2), r, 0.2, 5),
    peca(ret(-2.2, -6, 4.4, 10), cor(PRETO, 10), r, 0.2, 5),
  ];
  return f;
}

function criaCampones(id, x, fundura) {
  const pal = [[28, 14, 28 + (id % 3) * 5], [24, 12, 19], [34, 16, 40]];
  const f = criaFigura(id, x, fundura, pal, { mascara: 5, chapeu: 5, escala: 0.94 });
  const r = gerador(id * 31 + 7);
  const sangue = [356, 76, 30];
  f.p.gola.cor = cor(pal[1], 5);
  f.p.manchasCorpo = [peca(mancha(-8, -52, 8, r), cor(sangue), r, 0.6, 4), peca(mancha(9, -24, 6, r), cor(sangue, 5), r, 0.6, 4)];
  f.p.manchasRosto = [peca(mancha(-6, -9, 5.5, r), cor(sangue), r, 0.5, 3), peca(mancha(8, 6, 4, r), cor(sangue, 4), r, 0.5, 3)];
  f.passeio = 0;
  return f;
}

// ---------- mãos que se dão ----------
// Para dois bonecos darem as mãos, cada braço é dobrado no cotovelo até a mão chegar a um ponto
// combinado (cinemática inversa de dois segmentos). As funções abaixo dizem onde ficam ombros e
// mãos sem desenhar nada, com as mesmas transformações do desenho.
const GRAU = 180 / Math.PI;
function difAng(a, b) { let d = (a - b) % (2 * Math.PI); if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; return d; }
// Ângulos (de rotate) do ombro e do cotovelo para a mão chegar a "alvo", com o ombro na origem do
// contexto atual. "alvo" está no espaço de "fora" (o de quem chamou o desenho). O cotovelo dobra
// para baixo; se o ponto estiver longe demais, o braço estica na direção dele.
function alcanca(fora, alvo, l1, l2) {
  const q = g.getTransform().inverse().multiply(fora).transformPoint(new DOMPoint(alvo.x, alvo.y));
  const d = Math.max(1, Math.min(Math.hypot(q.x, q.y), (l1 + l2) * 0.999)), fi = Math.atan2(-q.x, q.y);
  const A = Math.acos(limita((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const tx = -Math.sin(fi) * d, ty = Math.cos(fi) * d;
  let melhor = null;
  for (const lado of [1, -1]) {
    const t1 = fi + lado * A, ex = -Math.sin(t1) * l1, ey = Math.cos(t1) * l1;
    if (!melhor || ey > melhor[2]) melhor = [t1, Math.atan2(-(tx - ex), ty - ey) - t1, ey];
  }
  return [melhor[0], melhor[1]];
}
// Leva um ponto para perto de um ombro, até onde o braço alcança.
function aoAlcance(p, o, raio) {
  const dx = p.x - o.x, dy = p.y - o.y, d = Math.hypot(dx, dy);
  return d <= raio ? p : { x: o.x + dx * raio / d, y: o.y + dy * raio / d };
}
function giroDe(f, est) {
  if (est.vira === undefined) return 1;
  const v = est.vira * f.lado;
  return (v < 0 ? -1 : 1) * Math.max(Math.abs(v), 0.15);
}
// Os dois ombros de um convidado [esquerdo do boneco, direito]. Aproximado: vale para quem não
// está no passeio da dança (animo perto de 0) nem andando, que é o caso de quem dá as mãos.
function ombrosDaFigura(f, est) {
  const queda = est.queda ?? 0, vivo = 1 - queda;
  const m = new DOMMatrix().translateSelf(est.x, f.y - 8 * vivo + (est.dy ?? 0) + queda * queda * 340)
    .rotateSelf(queda * 1.35 * (est.dirQueda ?? f.lado) * GRAU)
    .scaleSelf(f.s * f.lado * giroDe(f, est), f.s)
    .translateSelf(0, -165).rotateSelf((est.inclina ?? 0) * f.lado * GRAU);
  return [-1, 1].map(l => m.transformPoint(new DOMPoint(l * 24, -70)));
}
const alcanceDaFigura = f => 90 * f.s * 0.96;
function viraDaMorte(est) { const v = est.vira ?? 1; return (v < 0 ? -1 : 1) * Math.max(Math.abs(v), 0.12); }
function corpoDaMorte(m, t, x, est) {
  const vazio = est.vazio ?? 0, vira = viraDaMorte(est);
  return new DOMMatrix().translateSelf(x, m.y + Math.sin(t * 1.1) * 4 * (1 - vazio) + (est.dy ?? 0))
    .rotateSelf((Math.sin(t * 0.8) * 0.014 * (1 - vazio) + (est.tomba ?? 0) * Math.sign(vira)) * GRAU)
    .scaleSelf(1.08 * vira, 1.08);
}
function ombroDaMorte(m, t, x, est, i) {
  const cai = (est.vazio ?? 0) ** 2;
  return corpoDaMorte(m, t, x, est).translateSelf((i ? 1 : -1) * (34 + cai * 30), -362 * (1 - cai * 0.93));
}
const ALCANCE_MORTE = 136 * 1.08 * 0.96;
// Ângulos do braço do mascarado quando ele não está segurando nada: "bracos" no ombro (0 é
// pendurado, positivo abre para fora) e "cotovelos" (positivo dobra o antebraço para cima).
function angulosDaMorte(t, est, i) {
  const vazio = est.vazio ?? 0, cai = vazio * vazio, lado = i ? 1 : -1;
  const b = est.bracos ? est.bracos[i] : 0.1 + Math.sin(t * 0.7 + i) * 0.035;
  const c = est.cotovelos ? est.cotovelos[i] : 0;
  return [-lado * (b * (1 - vazio) + cai * 1.25), -lado * c * (1 - vazio)];
}
// Onde fica a mão do mascarado pelos ângulos (sem alvo): serve para a outra mão vir pegar nela.
function maoDaMorte(m, t, x, est, i) {
  const [a1, a2] = angulosDaMorte(t, est, i);
  return ombroDaMorte(m, t, x, est, i).rotateSelf(a1 * GRAU).translateSelf(0, 68).rotateSelf(a2 * GRAU).transformPoint(new DOMPoint(0, 68));
}
// Um ponto no próprio corpo do mascarado (antes de virar e inclinar) levado para fora.
function pontoDaMorte(t, est, [px, py], w = 1) {
  const q = corpoDaMorte(morte, t, est.x, est).transformPoint(new DOMPoint(px, py));
  return { x: q.x, y: q.y, w };
}

// ---------- desenho dos bonecos ----------

// O convidado é um boneco de varetas: uma vareta central segura o corpo e outras
// conduzem as mãos. O que não tem vareta (pernas, o outro braço, a saia) fica solto
// e balança atrasado. "tq" é o tempo da dança, que para nas badaladas.
//
// "est" diz o que o boneco está fazendo neste instante:
//   animo      0 a 1, quanto ele dança
//   parado     as mãos de quem segura pararam (badalada)
//   assenta    resto de balanço das partes soltas logo depois da parada
//   medoDe     lista de posições x de quem ele quer distância
//   x          posição imposta pelo roteiro (em vez do passeio da dança)
//   andando    passo de quem caminha
//   baixos     0 a 1, braços conduzidos junto ao corpo
//   erguer     0 a 1, leva o braço alto até "alvoBraco" [ombro, cotovelo]
//   inclina    inclinação do tronco
//   queda      0 a 1, quem segura largou: o boneco tomba e some atrás do palco
//   punhalCai  0 a 1, o punhal solta da mão
//   vira       quando dado, -1 a 1: para onde o boneco olha (passa pelo perfil fino ao virar)
//   dy         sobe e desce imposto pelo roteiro (o passo da valsa)
//   outroBraco [ombro, cotovelo] do braço que não é o alto, se ele tiver vareta
//   cabeca     inclinação a mais da cabeça
//   peste      0 a 1, as manchas escarlates aparecendo
//   chapeuCai  0 a 1, o chapéu (ou a coroa) solta e cai
//   maos       [alvo, alvo]: {x, y, w} onde cada mão vai segurar (no espaço de quem desenha);
//              w mistura com o braço normal. O cotovelo dobra sozinho até a mão chegar lá.
//   pernas     [a, b] giro a mais de cada coxa (o chute); canelas: a mais de cada canela
//   saia       balanço a mais da saia e da capa
function desenhaFigura(f, tq, t, est = {}) {
  const p = f.p, w = f.vel, fora0 = g.getTransform();
  const animo = est.animo ?? 1, queda = est.queda ?? 0, erguer = est.erguer ?? 0, baixos = est.baixos ?? 0;
  const vivo = 1 - queda;
  const j = (k, amp) => Math.sin(t * (2.3 + k * 0.37) + f.id * 7.1 + k * 1.9) * amp * (est.parado ? 0.35 : 1) * vivo;
  const xBase = est.x ?? (f.x0 + Math.sin(tq * 0.45 * w + f.fase) * f.passeio * animo);
  // medo: o boneco se afasta de quem se aproxima e tomba o corpo para longe.
  // Tudo é contínuo em d, para ninguém saltar de lado quando o mascarado passa.
  let medo = 0, empurra = 0, recua = 0;
  if (est.medoDe) for (const xm of est.medoDe) {
    const d = xBase - xm, perto = Math.exp(-((d / 270) ** 2));
    medo = Math.max(medo, perto);
    empurra += d * Math.exp(-((d / 210) ** 2)) * 1.35;
    recua += Math.tanh(d / 80) * perto;
  }
  recua = limita(recua, -1, 1);
  f.x = xBase + empurra;
  const fz = tq * 2.1 * w + f.fase;
  const anda = est.andando ? Math.sin(t * 5.4 + f.fase) : 0;
  const compasso = Math.sin(fz) * animo;
  const atraso = Math.sin(fz - 1.1) * animo;
  const bal = (compasso * 0.05 + (est.inclina ?? 0)) * f.lado + recua * 0.16 + j(1, 0.01);
  const pulo = (-Math.abs(compasso) * 9 * (1 - medo) - Math.abs(anda) * 6 - 8) * vivo;
  // giro em torno da vareta central: o boneco é chato, então ele "fecha" e abre
  const ciclo = ((tq * w * 0.16 + f.fase) % 1 + 1) % 1;
  let giro = 1;
  if (ciclo < 0.1 && medo < 0.05 && animo > 0.9 && !est.andando) {
    const c = Math.cos(ciclo / 0.1 * Math.PI * 2);
    giro = (c < 0 ? -1 : 1) * Math.max(Math.abs(c), 0.18);
  }
  if (est.vira !== undefined) { const v = est.vira * f.lado; giro = (v < 0 ? -1 : 1) * Math.max(Math.abs(v), 0.15); }
  const solto = atraso * 0.2 * (1 - medo) + (est.assenta ?? 0) * 0.16 + anda * 0.2 + queda * 0.45;

  g.save();
  g.translate(f.x + j(2, 1.2), f.y + pulo + (est.dy ?? 0) + j(3, 0.9) + queda * queda * 340);
  g.rotate(Math.sin(tq * 1.3 * w + f.fase) * 0.035 * animo + recua * 0.08 + queda * 1.35 * (est.dirQueda ?? f.lado));
  g.scale(f.s * f.lado * giro, f.s);

  // vareta central, por trás do corpo, descendo até sumir atrás do palco
  {
    g.save(); g.translate(0, -200); const a = g.getTransform(); g.translate(0, 520); const c = g.getTransform(); g.restore();
    vareta(a.e, a.f, c.e, c.f, 4.6);
  }

  if (p.capa) {
    g.save();
    g.translate(0, -165); g.rotate(bal * 0.6 + solto * 0.25 * f.lado + (est.saia ?? 0) * 1.4);
    poe(p.capa);
    g.restore();
  }

  if (!f.mulher) {
    for (let i = 0; i < 2; i++) {
      const lado = i ? 1 : -1;
      g.save();
      g.translate(lado * 10, -140); g.rotate(solto * (1 + i * 0.3) + lado * 0.05 + anda * lado * 0.25 + (est.pernas ? est.pernas[i] : 0));
      poe(p.coxa[i]);
      g.translate(0, 68); g.rotate(Math.abs(atraso) * 0.25 * (1 - medo) + (est.assenta ?? 0) * 0.1 * lado + Math.max(0, anda * lado) * 0.4 + (est.canelas ? est.canelas[i] : 0));
      poe(p.canela[i]);
      g.translate(0, 64); g.rotate(0.1); g.scale(lado, 1);
      poe(p.sapato[i]);
      g.restore();
      tacha(f, lado * 10, -140);
    }
  }

  g.save();
  g.translate(0, -165);
  g.rotate(solto * 0.3 * f.lado + j(4, 0.008) + (est.saia ?? 0));
  poe(p.saia);
  if (p.barra) poe(p.barra);
  poe(p.painel);
  if (p.laco) poe(p.laco);
  g.restore();

  g.save();
  g.translate(0, -165);
  g.rotate(bal);
  poe(p.tronco); poe(p.peito); poe(p.cinto);
  if (p.arminho) { poe(p.arminho); for (const pc of p.pintas) poe(pc, { semSombra: true, liso: true }); }
  if (p.manchasCorpo) for (const pc of p.manchasCorpo) poe(pc);
  if (p.peste && est.peste) poePeste(p.peste.corpo, est.peste);

  const maos = [];
  for (let i = 0; i < 2; i++) {
    const lado = i ? 1 : -1;
    const alto = lado === f.bracoAlto;
    const conduzido = alto || f.duasVaretas;
    let a1, a2;
    if (alto) { a1 = mistura(1.0, 2.2, animo) + Math.sin(fz) * 0.3 * animo; a2 = mistura(0.2, -0.55, animo) + Math.sin(fz + 0.8) * 0.3 * animo; }
    else if (conduzido) { a1 = 0.9 + Math.sin(tq * 1.05 * w + f.fase + 1) * 0.4 * animo; a2 = 0.3 + Math.sin(fz) * 0.35 * animo; }
    else { a1 = 0.12 - solto * lado * 0.9; a2 = 0.15 - solto * lado * 0.7; }   // braço solto, pendurado
    if (conduzido) {
      a1 = mistura(a1, 0.3 + anda * lado * 0.15, baixos); a2 = mistura(a2, 0.35, baixos);
      a1 = mistura(a1, 1.15, medo); a2 = mistura(a2, -2.0, medo);
      if (alto && erguer > 0) { a1 = mistura(a1, est.alvoBraco[0], erguer); a2 = mistura(a2, est.alvoBraco[1], erguer); }
      if (!alto && est.outroBraco) { a1 = est.outroBraco[0]; a2 = est.outroBraco[1]; }
      a1 = mistura(a1, 0.2, queda); a2 = mistura(a2, 0.2, queda);
    }
    g.save();
    g.translate(lado * 24, -70);
    let r1 = -lado * a1 + j(20 + i, 0.02), r2 = -lado * a2 + j(22 + i, 0.02);
    const alvo = est.maos && est.maos[i];
    if (alvo && alvo.w > 0) {
      const [k1, k2] = alcanca(fora0, alvo, 46, 44);
      r1 += alvo.w * difAng(k1, r1); r2 += alvo.w * difAng(k2, r2);
    }
    g.rotate(r1);
    poe(p.braco[i]);
    g.translate(0, 46); g.rotate(r2);
    poe(p.ante[i]);
    if (p.manga) { g.save(); g.scale(lado, 1); poe(p.manga[i]); g.restore(); }
    g.translate(0, 44);
    if (alto && p.punhal && est.punhal) {
      const cai = est.punhalCai ?? 0;
      g.save();
      if (cai > 0) soltaECai(cai);
      if (cai < 1) for (const pc of p.punhal) poe(pc);
      g.restore();
    }
    poe(p.mao[i]);
    if (conduzido) { const m = g.getTransform(); maos.push([m.e, m.f, lado]); }
    g.translate(0, -44); tacha(f, 0, 0);
    g.restore();
    tacha(f, lado * 24, -70);
  }

  g.translate(0, -100);
  g.rotate(Math.sin(tq * 1.05 * w + f.fase) * 0.07 * (0.3 + 0.7 * animo) - bal * 0.5 + j(5, 0.012) + queda * 0.3 + (est.cabeca ?? 0));
  const chapeu = (pecas) => {
    const cai = est.chapeuCai ?? 0;
    if (cai >= 1) return;
    g.save(); if (cai > 0) soltaECai(cai, -40);
    for (const pc of pecas) poe(pc);
    g.restore();
  };
  chapeu(p.chapeu.tras);
  poe(p.gola); poe(p.cabeca);
  for (const pc of p.mascara) poe(pc);
  if (p.manchasRosto) for (const pc of p.manchasRosto) poe(pc);
  if (p.peste && est.peste) poePeste(p.peste.rosto, est.peste);
  chapeu(p.chapeu.frente);
  g.restore();

  // varetas das mãos, na frente do boneco, convergindo para quem segura lá embaixo
  const base = g.getTransform();
  g.restore();
  const fora = g.getTransform();
  for (const [hx, hy, lado] of maos) vareta(hx, hy, mistura(hx, base.e, 0.55) + lado * f.lado * 26 * escalaPapel, fora.f - ajusteVareta + H + 40);
}

// O mascarado desliza sem tremor nenhum, conduzido por varetas de ébano.
//   vira    1 de frente para um lado, -1 para o outro (o boneco fecha e abre ao virar)
//   vazio   0 a 1: no fim não há nada dentro, e o manto e a máscara caem no chão
//   dy      sobe e desce do passo de valsa
//   tomba   o boneco inteiro inclina para onde olha (o mergulho da valsa, a reverência)
//   bracos  [esquerdo, direito]: ângulo de cada manga no ombro, em vez do braço caído
//   cotovelos [esquerdo, direito]: dobra de cada antebraço
//   maos    [alvo, alvo]: {x, y, w} onde cada mão vai segurar, como em desenhaFigura
//   cabeca  inclinação a mais do crânio; manto: o balanço a mais do manto
//   abre    0 a 1: o manto abre no rodopio; arrasto: o manto fica para trás quando ele corre
function desenhaMorte(m, t, x, est = {}) {
  const p = m.p, fora0 = g.getTransform();
  const vazio = est.vazio ?? 0, cai = vazio * vazio, fica = 1 - cai * 0.93;
  const vira = viraDaMorte(est);
  g.save();
  g.setTransform(fora0.multiply(corpoDaMorte(m, t, x, est)));
  {
    g.save(); g.translate(0, -330 * fica); const a = g.getTransform(); g.translate(0, 330 * fica + 310); const c = g.getTransform(); g.restore();
    vareta(a.e, a.f, c.e, c.f, 5, true);
  }
  const maos = [];
  g.save();
  g.translate(0, -300 * fica); g.rotate(Math.sin(t * 0.8 - 0.9) * 0.022 * (1 - vazio) + (est.manto ?? 0));
  const arrasto = (est.arrasto ?? 0) * Math.sign(vira) * (1 - vazio);
  if (arrasto) g.transform(1, 0, arrasto, 1, 0, 0);
  g.scale((1 + cai * 0.3) * (1 + (est.abre ?? 0) * 0.3), fica);
  poe(p.manto);
  for (const pc of p.dobras) poe(pc);
  for (const pc of p.manchasManto) poe(pc);
  poe(p.tronco);
  g.restore();
  for (let i = 0; i < 2; i++) {
    const lado = i ? 1 : -1;
    g.save();
    g.setTransform(fora0.multiply(ombroDaMorte(m, t, x, est, i)));
    let [r1, r2] = angulosDaMorte(t, est, i);
    const alvo = est.maos && est.maos[i];
    if (alvo && alvo.w > 0) {
      const [k1, k2] = alcanca(fora0, alvo, 68, 68);
      r1 += alvo.w * difAng(k1, r1); r2 += alvo.w * difAng(k2, r2);
    }
    g.rotate(r1); poe(p.mangaSup[i]);
    g.translate(0, 68); g.rotate(r2); poe(p.mangaInf[i]);
    g.translate(0, 68);
    for (const pc of p.mao[i]) poe(pc);
    { const mm = g.getTransform(); maos.push([mm.e, mm.f + 6, lado]); }
    g.restore();
  }
  g.save();
  g.translate(cai * 46, -402 + cai * 376); g.rotate(Math.sin(t * 0.5) * 0.03 * (1 - vazio) + (est.cabeca ?? 0) * (1 - vazio) + cai * 1.1);
  poe(p.capuz); poe(p.cranio);
  for (const pc of p.olhos) poe(pc);
  poe(p.nariz); poe(p.boca);
  for (const pc of p.dentes) poe(pc);
  for (const pc of p.manchasRosto) poe(pc);
  g.restore();
  const base = g.getTransform();
  g.restore();
  const fora = g.getTransform();
  for (const [hx, hy, lado] of maos) vareta(hx, hy, mistura(hx, base.e, 0.4) + lado * 10, fora.f - ajusteVareta + H + 40, 3.8, true);
}
