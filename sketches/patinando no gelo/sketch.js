// Patinação no Gelo: um casal numa noite de Natal
// Mouse: mova para guiar o casal (mouseX também controla o vento na neve).
// Clique: a dama gira por baixo do braço do par.
// p5.js 2.x (p5front)

// ---------- medidas do corpo ----------
const COXA = 36, CANELA = 34, TRONCO = 52;
const BRACO = 28, ANTEBRACO = 26;
const ALTURA_PATIM = 10;   // do tornozelo até o fio da lâmina
const DIST_CASAL = 48;     // distância entre os quadris dos dois

// ---------- estado global ----------
let flocos = [];
let raspas = [];     // partículas de gelo levantadas pelos patins
let rastros = [];    // marcas das lâminas no gelo
let predios = [];
let estrelas = [];
let fios = [];       // cordões de luzinhas
let lampadas = [];   // todas as luzinhas (cordões + árvore)
let arvore;

let chaoY, baseY;
let fundo, brilho, vinheta;
let luz;
let vento = 0;
let mouseMexeu = false;

const PALETA = [
  [255, 220, 150],  // branco quente
  [255, 80, 80],    // vermelho
  [90, 225, 130],   // verde
  [255, 190, 60],   // dourado
  [120, 175, 255]   // azul
];

// estado compartilhado do casal
let casal = {
  x: 0, vx: 0, veloc: 0, impulso: 0, freando: false,
  tDanca: 0, estado: 'dancando', giro: 0
};
let par, dama;

// =====================================================
function setup() {
  createCanvas(800, 500);
  chaoY = height * 0.66;   // onde a pista começa (atrás da mureta)
  baseY = height * 0.82;   // linha onde o casal patina
  casal.x = width / 2;

  par = criaDancarino({
    estilo: 'par', dir: 1, tam: 1, fase: 0,
    capa: [200, 45, 55], mangaFrente: [190, 40, 50], mangaTras: [150, 30, 42],
    calca: [45, 55, 90], calcaTras: [30, 36, 62]
  });
  dama = criaDancarino({
    estilo: 'dama', dir: -1, tam: 0.93, fase: PI,
    capa: [235, 235, 245], mangaFrente: [225, 225, 238], mangaTras: [185, 185, 205],
    calca: [230, 200, 190], calcaTras: [190, 160, 155]
  });

  preparaCenario();
  criaCamadas();

  for (let i = 0; i < 450; i++) flocos.push(novoFloco(true));
}

function draw() {
  let alvoVento = mouseMexeu ? map(mouseX, 0, width, -2, 2) : 0;
  vento = lerp(vento, alvoVento, 0.03);

  image(fundo, 0, 0);
  desenhaLuzinhas();
  atualizaCasal();
  atualizaNeve();
  desenhaRastros();
  desenhaNeve(false);        // flocos distantes, atrás do casal

  desenhaReflexoCasal();
  desenhaCasal();
  atualizaRaspas();

  desenhaNeve(true);         // flocos próximos, na frente do casal

  blendMode(ADD);
  image(brilho, 0, 0);
  blendMode(BLEND);
  image(vinheta, 0, 0);
}

// =====================================================
// DANÇARINOS
// =====================================================

function criaDancarino(opcoes) {
  return Object.assign({
    x: 0, sx: opcoes.dir, tP: 0, giro: 0,
    quadrilY: -70, peAnterior: 'E', pose: null, cin: null
  }, opcoes);
}

// Mesma convenção do rotate(): o vetor (0, L) girado por 'ang'
function ponta(origem, ang, L) {
  return createVector(origem.x - sin(ang) * L, origem.y + cos(ang) * L);
}

// Ajusta um ângulo somando/subtraindo voltas para ficar perto de 'ref'
function perto(a, ref) {
  while (a - ref > PI) a -= TWO_PI;
  while (a - ref < -PI) a += TWO_PI;
  return a;
}

// Local (relativo ao quadril, sem escala) -> tela
function paraTela(dz, v) {
  return createVector(dz.x + v.x * dz.sx * dz.tam, baseY + (dz.quadrilY + v.y) * dz.tam);
}

// Tela -> local. Durante o giro sx passa por zero, então limitamos o valor.
function paraLocal(dz, w) {
  let sx = dz.sx;
  if (abs(sx) < 0.15) sx = sx < 0 ? -0.15 : 0.15;
  return createVector((w.x - dz.x) / (sx * dz.tam), (w.y - baseY) / dz.tam - dz.quadrilY);
}

// Uma perna na remada: empurra para trás esticada e depois recolhe
function pernaRemada(fase) {
  let empurra = max(0, sin(fase));              // 0 = perna de apoio, 1 = esticada atrás
  let recolhe = max(0, -cos(fase)) * empurra;   // na volta, o joelho dobra e o pé sobe
  return {
    coxa: lerp(-0.3, 0.55, empurra) - recolhe * 0.4,
    joelho: lerp(0.6, 0.05, empurra) + recolhe * 1.1
  };
}

// veloc: quão rápido estão deslizando (0 a 1)
// impulso: quanto estão fazendo força para acelerar (0 a 1)
function calculaPose(tD, tP, veloc, impulso) {
  // parado: balanço e um pé marcando o ritmo
  let parado = {
    tronco: sin(tD) * 0.08,
    coxaE: 0.08,
    joelhoE: 0.12,
    coxaD: -0.15 + sin(tD) * 0.25,
    joelhoD: 0.2 + max(0, sin(tD)) * 0.45,
    ombroL: 0, cotoveloL: 0,   // os braços são decididos pela IK
    ombroG: 0, cotoveloG: 0
  };

  // deslizando sem força: as duas lâminas no gelo, joelhos dobrados,
  // um pé um pouco à frente do outro
  let deslizando = {
    tronco: 0.12,
    coxaE: -0.4,
    joelhoE: 0.65,
    coxaD: -0.1,
    joelhoD: 0.35,
    ombroL: 0, cotoveloL: 0,
    ombroG: 0, cotoveloG: 0
  };

  // remando: pernas alternam o empurrão, com meia volta de diferença
  let e = pernaRemada(tP);
  let d = pernaRemada(tP + PI);
  let remando = {
    tronco: 0.2,
    coxaE: e.coxa,
    joelhoE: e.joelho,
    coxaD: d.coxa,
    joelhoD: d.joelho,
    ombroL: 0, cotoveloL: 0,
    ombroG: 0, cotoveloG: 0
  };

  // duas misturas em sequência: parado -> deslizando -> remando
  let p = {};
  for (let k in parado) {
    let base = lerp(parado[k], deslizando[k], veloc);
    p[k] = lerp(base, remando[k], impulso);
  }
  return p;
}

// Cinemática direta: pés e ombro, relativos ao quadril
function cinematica(p) {
  let q = createVector(0, 0);
  let joelhoE = ponta(q, p.coxaE, COXA);
  let peE = ponta(joelhoE, p.coxaE + p.joelhoE, CANELA);
  let joelhoD = ponta(q, p.coxaD, COXA);
  let peD = ponta(joelhoD, p.coxaD + p.joelhoD, CANELA);
  let ombro = ponta(q, p.tronco, -TRONCO);

  return {
    ombro,
    // a lâmina fica ALTURA_PATIM abaixo do tornozelo
    peE: createVector(peE.x, peE.y + ALTURA_PATIM),
    peD: createVector(peD.x, peD.y + ALTURA_PATIM),
    alturaQuadril: max(peE.y, peD.y) + ALTURA_PATIM,
    plantado: peE.y >= peD.y ? 'E' : 'D',
    // uma lâmina conta como apoiada se está a até 3px do pé mais baixo
    noGeloE: peE.y >= max(peE.y, peD.y) - 3,
    noGeloD: peD.y >= max(peE.y, peD.y) - 3
  };
}

// Cinemática inversa de dois ossos (lei dos cossenos).
// Devolve os ângulos absolutos do braço e do antebraço para a mão chegar em T.
function ik(S, T, L1, L2) {
  let v = p5.Vector.sub(T, S);
  let D = constrain(v.mag(), abs(L1 - L2) + 0.5, L1 + L2 - 0.5);
  let a = atan2(-v.x, v.y);   // direção do ombro até o alvo, na nossa convenção
  let alfa = acos(constrain((L1 * L1 + D * D - L2 * L2) / (2 * L1 * D), -1, 1));
  let gama = acos(constrain((L1 * L1 + L2 * L2 - D * D) / (2 * L1 * L2), -1, 1));
  let a1 = a + alfa;           // + alfa deixa o cotovelo para baixo
  let a2 = a1 - (PI - gama);
  return { a1, a2 };
}

// Faz o braço 'L' ou 'G' do dançarino alcançar um ponto da tela
function alcanca(dz, qual, alvoTela) {
  let alvo = paraLocal(dz, alvoTela);
  let r = ik(dz.cin.ombro, alvo, BRACO, ANTEBRACO);
  let chaveO = 'ombro' + qual;
  let chaveC = 'cotovelo' + qual;
  // o ombro é desenhado dentro do referencial do tronco
  dz.pose[chaveO] = perto(r.a1 - dz.pose.tronco, dz.pose[chaveO]);
  dz.pose[chaveC] = perto(r.a2 - r.a1, 0);
}

function atualizaCasal() {
  // o casal desliza em direção ao mouse
  // o alvo fica longe das bordas para sobrar espaço de frenagem
  let alvoX = mouseMexeu ? constrain(mouseX, 120, width - 120) : width / 2;

  // Deslize com inércia: uma "mola" puxa para o mouse e o atrito freia.
  // A aceleração é limitada, então eles ganham velocidade aos poucos
  // e continuam deslizando um pouco depois de chegar.
  let acc = constrain((alvoX - casal.x) * 0.0015 - casal.vx * 0.045, -0.06, 0.06);
  casal.vx = constrain(casal.vx + acc, -3.5, 3.5);
  casal.x += casal.vx;
  if (casal.x < 70 || casal.x > width - 70) {
    casal.x = constrain(casal.x, 70, width - 70);
    casal.vx = 0;
  }

  // força a favor do movimento = impulso; contra o movimento = freada
  let aFavor = acc * casal.vx >= 0;
  let alvoImpulso = aFavor ? constrain(abs(acc) / 0.05, 0, 1) : 0;
  casal.impulso = lerp(casal.impulso, alvoImpulso, 0.06);
  casal.veloc = lerp(casal.veloc, constrain(abs(casal.vx) / 2, 0, 1), 0.1);
  casal.freando = !aFavor && abs(casal.vx) > 1.2;
  casal.tDanca += 0.04;

  // máquina de estados do giro
  if (casal.estado === 'girando') {
    casal.giro += 0.12;
    if (casal.giro >= TWO_PI) {
      casal.giro = 0;
      casal.estado = 'dancando';
    }
  }
  let k = sin(casal.giro / 2);          // 0 -> 1 -> 0 ao longo do giro
  let kBraco = constrain(k * 2, 0, 1);  // braços abrem antes de ela ficar "de lado"

  par.x = casal.x - DIST_CASAL / 2;
  dama.x = casal.x + DIST_CASAL / 2 - 8 * k;
  dama.giro = casal.giro;

  // 1) pernas e tronco
  for (let dz of [par, dama]) {
    // o ciclo da remada só anda enquanto há impulso
    dz.tP += 0.09 * casal.impulso;
    dz.sx = dz.dir * cos(dz.giro);
    dz.pose = calculaPose(casal.tDanca + dz.fase, dz.tP, casal.veloc, casal.impulso);

    let lado = dz.sx >= 0 ? 1 : -1;
    dz.pose.tronco += constrain(-vento * 0.06, -0.15, 0.15) * lado;

    if (dz === dama) {
      dz.pose.coxaD = lerp(dz.pose.coxaD, -0.9, k);
      dz.pose.joelhoD = lerp(dz.pose.joelhoD, 1.6, k);
    }

    dz.cin = cinematica(dz.pose);
    dz.quadrilY = -dz.cin.alturaQuadril;
  }

  // 2) braços com IK
  let ombroPar = paraTela(par, par.cin.ombro);
  let ombroDama = paraTela(dama, dama.cin.ombro);

  // mãos dadas entre os dois; no giro, sobem acima da cabeça dela
  let maosDadas = p5.Vector.lerp(ombroPar, ombroDama, 0.5).add(0, 22);
  let acima = createVector(dama.x, baseY + (dama.quadrilY - TRONCO - 34) * dama.tam);
  maosDadas.lerp(acima, kBraco);
  alcanca(par, 'L', maosDadas);
  alcanca(dama, 'L', maosDadas);

  // mão dela no ombro dele, mão dele na cintura dela
  alcanca(dama, 'G', p5.Vector.add(ombroPar, createVector(12, 4)));
  let cinturaLocal = ponta(createVector(0, 0), dama.pose.tronco, -30).add(6, 0);
  alcanca(par, 'G', paraTela(dama, cinturaLocal));

  // no giro, os dois soltam e abrem esse braço
  for (let dz of [par, dama]) {
    let aberto = perto(PI * 0.6, dz.pose.ombroG);
    dz.pose.ombroG = lerp(dz.pose.ombroG, aberto, kBraco);
    dz.pose.cotoveloG = lerp(dz.pose.cotoveloG, 0.3, kBraco);
  }

  // 3) patins: raspas de gelo e marcas das lâminas
  for (let dz of [par, dama]) {
    let pl = dz.cin.plantado;

    // a perna de apoio trocou durante a remada: a anterior acabou de empurrar
    if (pl !== dz.peAnterior && casal.impulso > 0.3) {
      let empurrou = paraTela(dz, dz.peAnterior === 'E' ? dz.cin.peE : dz.cin.peD);
      criaRaspas(empurrou.x, empurrou.y, 6, 2, -Math.sign(casal.vx));
    }
    dz.peAnterior = pl;

    // freada: o gelo espirra para a frente
    if (casal.freando && frameCount % 3 === 0) {
      let pe = paraTela(dz, pl === 'E' ? dz.cin.peE : dz.cin.peD);
      criaRaspas(pe.x, pe.y, 3, 2.5, Math.sign(casal.vx));
    }

    // cada lâmina apoiada risca o gelo desde a posição do frame anterior
    // (só quando estão deslizando ou girando, não no balanço parado)
    let riscando = casal.veloc > 0.15 || casal.estado === 'girando';
    for (let lado of ['E', 'D']) {
      let apoiada = riscando && dz.cin['noGelo' + lado];
      let pe = paraTela(dz, dz.cin['pe' + lado]);
      let ant = dz['rastro' + lado];
      if (apoiada && ant) {
        let dd = p5.Vector.dist(ant, pe);
        if (dd > 0.3 && dd < 12) {
          rastros.push({ x1: ant.x, y1: ant.y, x2: pe.x, y2: pe.y, vida: 180 });
        }
      }
      dz['rastro' + lado] = apoiada ? pe : null;
    }
  }
}

// ---------- desenho ----------

function desenhaCasal() {
  desenhaDancarino(dama, false);   // dama sem o braço da frente
  desenhaDancarino(par, true);
  desenhaBracoFrente(dama);        // mão dela por cima do ombro dele
}

// Reflexo no gelo: o mesmo desenho espelhado em torno da linha dos patins.
// globalAlpha é a transparência do canvas inteiro, então vale para tudo.
function desenhaReflexoCasal() {
  drawingContext.globalAlpha = 0.16;
  push();
  translate(0, 2 * baseY);
  scale(1, -1);
  desenhaCasal();
  pop();
  drawingContext.globalAlpha = 1;
}

function aplicaCorpo(dz) {
  translate(dz.x, baseY + dz.quadrilY * dz.tam);   // origem no quadril
  scale(dz.sx * dz.tam, dz.tam);                    // virar, girar e tamanho
}

function desenhaDancarino(dz, comBracoFrente) {
  let p = dz.pose;
  strokeCap(ROUND);

  push();
  aplicaCorpo(dz);

  desenhaPerna(p.coxaE, p.joelhoE, dz.calcaTras);
  desenhaPerna(p.coxaD, p.joelhoD, dz.calca);

  push();
  rotate(p.tronco);

  // braço de trás (mãos dadas)
  push();
  translate(0, -TRONCO);
  desenhaBraco(p.ombroL, p.cotoveloL, dz.mangaTras);
  pop();

  noStroke();
  fill(...dz.capa);
  if (dz.estilo === 'dama') {
    let roda = 26 + 12 * sin(dz.giro / 2);   // a saia abre no giro
    quad(-10, -TRONCO, 10, -TRONCO, roda, 26, -roda, 26);
  } else {
    quad(-11, -TRONCO, 11, -TRONCO, 17, 10, -17, 10);
  }

  translate(0, -TRONCO);   // origem no ombro
  if (dz.estilo === 'dama') desenhaCabecaDama();
  else desenhaCabecaPar(dz.capa);

  if (comBracoFrente) desenhaBraco(p.ombroG, p.cotoveloG, dz.mangaFrente);
  pop();

  pop();
}

// só o braço da frente, com as mesmas transformações do corpo
function desenhaBracoFrente(dz) {
  push();
  aplicaCorpo(dz);
  rotate(dz.pose.tronco);
  translate(0, -TRONCO);
  desenhaBraco(dz.pose.ombroG, dz.pose.cotoveloG, dz.mangaFrente);
  pop();
}

function desenhaCabecaPar(cor) {
  noStroke();
  fill(240, 200, 170);
  circle(0, -16, 24);   // rosto: vai de y = -28 a y = -4
  fill(20);
  circle(6, -15, 3);    // olho abaixo da barra do gorro

  // gorro: cúpula de y = -34 a -21, barra de -23 a -19
  fill(...cor);
  arc(0, -21, 26, 26, PI, TWO_PI, CHORD);
  fill(235, 238, 245);
  rect(-13, -23, 26, 4, 2);
  circle(-1, -36, 9);   // pompom
}

function desenhaCabecaDama() {
  noStroke();
  fill(70, 40, 35);
  circle(-3, -17, 27);    // cabelo: centro (-3, -17), topo em y = -30.5
  circle(-13, -26, 11);   // coque
  fill(235, 195, 165);
  circle(1, -15, 22);
  fill(70, 40, 35);
  arc(1, -18, 23, 18, PI, TWO_PI, CHORD);   // franja
  fill(20);
  circle(7, -15, 3);

  // protetor de orelha: de perfil, a haste é vista de lado,
  // então vira uma faixa vertical que sobe da orelha até o topo do cabelo
  stroke(235, 238, 245);
  strokeWeight(3);
  line(-3, -14, -3, -30);
  noStroke();
  fill(245, 245, 250);
  circle(-3, -14, 10);
}

function desenhaPerna(coxa, joelho, cor) {
  push();
  stroke(...cor);
  strokeWeight(9);
  rotate(coxa);
  line(0, 0, 0, COXA);
  translate(0, COXA);
  rotate(joelho);
  line(0, 0, 0, CANELA);
  translate(0, CANELA);

  // desfaz as rotações para o patim ficar na horizontal
  rotate(-(coxa + joelho));
  desenhaPatim();
  pop();
}

// patim de gelo preto: bota de cano alto, suportes e lâmina
function desenhaPatim() {
  stroke(15);
  strokeWeight(10);
  line(0, -12, 0, 0);    // cano
  line(-2, 0, 9, 0);     // pé

  stroke(120, 125, 135);
  strokeWeight(1.5);
  line(-2, 5, -2, ALTURA_PATIM - 1);   // suporte de trás
  line(8, 5, 8, ALTURA_PATIM - 1);     // suporte da frente

  stroke(215, 225, 235);
  strokeWeight(2);
  line(-6, ALTURA_PATIM - 1, 12, ALTURA_PATIM - 1);   // lâmina
  noFill();
  arc(12, ALTURA_PATIM - 4, 6, 6, -HALF_PI, HALF_PI);  // curva da ponta
}

function desenhaBraco(ombro, cotovelo, cor) {
  push();
  stroke(...cor);
  strokeWeight(8);
  rotate(ombro);
  line(0, 0, 0, BRACO);
  translate(0, BRACO);
  rotate(cotovelo);
  line(0, 0, 0, ANTEBRACO);
  translate(0, ANTEBRACO);
  noStroke();
  fill(240, 200, 170);
  circle(0, 0, 9);
  pop();
}

// =====================================================
// NEVE, RASPAS E RASTROS
// =====================================================

// z = profundidade: flocos próximos são maiores, mais rápidos e ficam na frente
function novoFloco(espalhar) {
  let z = random();
  return {
    pos: createVector(random(-50, width + 50), espalhar ? random(-20, height) : random(-30, -5)),
    z,
    vy: lerp(0.35, 1.3, z),
    tam: lerp(1, 3.2, z),
    fase: random(TWO_PI),
    chao: lerp(chaoY - 40, height + 10, z)   // os distantes somem mais cedo
  };
}

function atualizaNeve() {
  for (let i = 0; i < flocos.length; i++) {
    let f = flocos[i];
    // balanço lateral com seno + vento (mais forte nos flocos próximos)
    f.pos.x += sin(frameCount * 0.02 + f.fase) * 0.35 + vento * lerp(0.3, 1, f.z);
    f.pos.y += f.vy;

    if (f.pos.y > f.chao) flocos[i] = novoFloco(false);
    if (f.pos.x < -50) f.pos.x += width + 100;
    if (f.pos.x > width + 50) f.pos.x -= width + 100;
  }
}

function desenhaNeve(frente) {
  noStroke();
  for (let f of flocos) {
    if ((f.z > 0.6) !== frente) continue;
    let k = brilhoLuz(f.pos.x, f.pos.y);
    fill(lerp(210, 255, k), lerp(225, 225, k), lerp(245, 180, k), lerp(120, 240, f.z));
    circle(f.pos.x, f.pos.y, f.tam);
  }
}

// sentido: 1 = espirra pra direita, -1 = pra esquerda, 0 = pra todo lado
function criaRaspas(x, y, n, forca, sentido) {
  for (let i = 0; i < n; i++) {
    let ang;
    if (sentido > 0) ang = random(-0.7, -0.1);
    else if (sentido < 0) ang = random(PI + 0.1, PI + 0.7);
    else ang = random(PI + 0.1, TWO_PI - 0.1);
    let vel = p5.Vector.fromAngle(ang, random(0.4, 1) * forca);
    raspas.push({ pos: createVector(x, y), vel, vida: 255, y0: y });
  }
}

function atualizaRaspas() {
  strokeWeight(2);
  for (let i = raspas.length - 1; i >= 0; i--) {
    let r = raspas[i];
    r.vel.y += 0.12;
    r.pos.add(r.vel);
    r.vida -= 6;
    if (r.vida <= 0 || r.pos.y > r.y0 + 2) {
      raspas.splice(i, 1);
      continue;
    }
    stroke(225, 240, 255, r.vida);
    point(r.pos.x, r.pos.y);
  }
}

function desenhaRastros() {
  strokeWeight(1.2);
  for (let i = rastros.length - 1; i >= 0; i--) {
    let r = rastros[i];
    r.vida -= 1;
    if (r.vida <= 0) {
      rastros.splice(i, 1);
      continue;
    }
    stroke(215, 235, 250, r.vida * 0.4);
    line(r.x1, r.y1, r.x2, r.y2);
  }
}

// =====================================================
// CENÁRIO
// =====================================================

// Quanto a luz da árvore alcança um ponto (0 = escuro, 1 = no centro)
function brilhoLuz(x, y) {
  let k = 1 - constrain(norm(dist(x, y, luz.x, luz.y), 0, luz.r), 0, 1);
  return k * k;
}

// ponto de um fio pendurado: reta entre as pontas + barriga em parábola
function pontoFio(f, u) {
  return createVector(lerp(f.x0, f.x1, u), lerp(f.y0, f.y1, u) + f.barriga * 4 * u * (1 - u));
}

function preparaCenario() {
  // prédios com janelas acesas
  let x = 0;
  while (x < width) {
    let w = random(60, 120), h = random(90, 200);
    let janelas = [];
    for (let jy = chaoY - h + 15; jy < chaoY - 40; jy += 25) {
      for (let jx = x + 10; jx < x + w - 15; jx += 20) {
        if (random() < 0.3) janelas.push(createVector(jx, jy));
      }
    }
    predios.push({ x, w, h, janelas });
    x += w + random(2, 10);
  }

  for (let i = 0; i < 90; i++) {
    estrelas.push({ x: random(width), y: random(chaoY - 120), b: random(60, 180) });
  }

  // cordões de luzinhas cruzando o céu
  fios = [
    { x0: -10, y0: 30, x1: width + 10, y1: 55, barriga: 45 },
    { x0: -10, y0: 105, x1: width * 0.58, y1: 80, barriga: 30 },
    { x0: width * 0.42, y0: 95, x1: width + 10, y1: 115, barriga: 35 }
  ];
  for (let f of fios) {
    let n = floor(dist(f.x0, f.y0, f.x1, f.y1) / 22);
    for (let i = 1; i < n; i++) {
      let p = pontoFio(f, i / n);
      lampadas.push({ x: p.x, y: p.y + 4, cor: random(PALETA), fase: random(TWO_PI), vel: random(0.03, 0.08), tam: 5 });
    }
  }

  // árvore de Natal: três camadas triangulares
  arvore = { x: 120, base: chaoY - 12, h: 230, w: 160 };
  arvore.camadas = [
    { topo: arvore.base - arvore.h, fundo: arvore.base - arvore.h * 0.55, meia: arvore.w * 0.28 },
    { topo: arvore.base - arvore.h * 0.8, fundo: arvore.base - arvore.h * 0.25, meia: arvore.w * 0.4 },
    { topo: arvore.base - arvore.h * 0.55, fundo: arvore.base, meia: arvore.w * 0.5 }
  ];
  // luzinhas dentro de cada camada (posição proporcional à largura naquela altura)
  for (let c of arvore.camadas) {
    for (let i = 0; i < 16; i++) {
      let u = random(0.2, 1);
      let y = lerp(c.topo, c.fundo, u);
      let xx = arvore.x + random(-1, 1) * c.meia * u * 0.85;
      lampadas.push({ x: xx, y, cor: random(PALETA), fase: random(TWO_PI), vel: random(0.03, 0.08), tam: 4 });
    }
  }

  luz = { x: arvore.x, y: arvore.base - arvore.h * 0.45, r: 300 };
}

function criaCamadas() {
  fundo = createGraphics(width, height);
  let ctx = fundo.drawingContext;

  // céu noturno
  let ceu = ctx.createLinearGradient(0, 0, 0, chaoY);
  ceu.addColorStop(0, '#050a1a');
  ceu.addColorStop(1, '#1a2748');
  ctx.fillStyle = ceu;
  ctx.fillRect(0, 0, width, chaoY);

  fundo.noStroke();
  for (let e of estrelas) {
    fundo.fill(255, 255, 255, e.b);
    fundo.circle(e.x, e.y, 1.5);
  }

  // lua com halo
  let lua = ctx.createRadialGradient(690, 150, 10, 690, 150, 70);
  lua.addColorStop(0, 'rgba(220, 230, 255, 0.35)');
  lua.addColorStop(1, 'rgba(220, 230, 255, 0)');
  ctx.fillStyle = lua;
  ctx.fillRect(600, 60, 180, 180);
  fundo.fill(235, 238, 250);
  fundo.circle(690, 150, 34);

  // prédios com neve no telhado e janelas quentes
  for (let p of predios) {
    fundo.fill(16, 22, 42);
    fundo.rect(p.x, chaoY - p.h, p.w, p.h);
    fundo.fill(225, 232, 245);
    fundo.rect(p.x - 2, chaoY - p.h - 3, p.w + 4, 5, 3);
    fundo.fill(255, 200, 120, 150);
    for (let j of p.janelas) fundo.rect(j.x, j.y, 8, 12);
  }

  // árvore (as luzinhas dela são animadas no draw)
  fundo.fill(18, 60, 45);
  for (let c of arvore.camadas) {
    fundo.triangle(arvore.x, c.topo, arvore.x - c.meia, c.fundo, arvore.x + c.meia, c.fundo);
  }
  // neve nas pontas dos galhos
  fundo.fill(225, 235, 245, 200);
  for (let c of arvore.camadas) {
    fundo.ellipse(arvore.x - c.meia * 0.85, c.fundo - 2, 18, 5);
    fundo.ellipse(arvore.x + c.meia * 0.85, c.fundo - 2, 18, 5);
  }

  // fios das luzinhas
  fundo.noFill();
  fundo.stroke(25, 28, 35);
  fundo.strokeWeight(1.2);
  for (let f of fios) {
    fundo.beginShape();
    for (let u = 0; u <= 1.0001; u += 0.02) {
      let p = pontoFio(f, u);
      fundo.vertex(p.x, p.y);
    }
    fundo.endShape();
  }
  fundo.noStroke();

  // ---- pista de gelo ----
  let gelo = ctx.createLinearGradient(0, chaoY, 0, height);
  gelo.addColorStop(0, '#3d5d78');
  gelo.addColorStop(0.35, '#2a4760');
  gelo.addColorStop(1, '#101f30');
  ctx.fillStyle = gelo;
  ctx.fillRect(0, chaoY, width, height - chaoY);

  // faixa de brilho do gelo
  let faixa = ctx.createLinearGradient(0, chaoY + 25, 0, chaoY + 70);
  faixa.addColorStop(0, 'rgba(255, 255, 255, 0)');
  faixa.addColorStop(0.5, 'rgba(200, 225, 245, 0.12)');
  faixa.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = faixa;
  ctx.fillRect(0, chaoY + 25, width, 45);

  // arranhões antigos no gelo
  fundo.noFill();
  fundo.strokeWeight(1);
  for (let i = 0; i < 60; i++) {
    fundo.stroke(220, 235, 250, random(10, 30));
    let a = random(TWO_PI);
    fundo.arc(random(width), random(chaoY + 20, height), random(60, 220), random(8, 25), a, a + random(0.5, 2));
  }
  fundo.noStroke();

  // reflexo da mureta
  fundo.fill(170, 185, 200, 30);
  fundo.rect(0, chaoY, width, 12);

  // mureta da pista
  fundo.fill(150, 165, 182);
  fundo.rect(0, chaoY - 26, width, 26);
  fundo.fill(125, 140, 158);
  for (let px = 40; px < width; px += 100) fundo.rect(px, chaoY - 26, 4, 26);
  fundo.fill(165, 35, 45);
  fundo.rect(0, chaoY - 30, width, 5);
  fundo.fill(230, 238, 248);
  fundo.rect(0, chaoY - 32, width, 2);

  // brilho quente somado por cima de tudo (árvore)
  brilho = createGraphics(width, height);
  let b = brilho.drawingContext;
  let gb = b.createRadialGradient(luz.x, luz.y, 10, luz.x, luz.y, luz.r);
  gb.addColorStop(0, 'rgba(90, 60, 25, 0.55)');
  gb.addColorStop(1, 'rgba(0, 0, 0, 0)');
  b.fillStyle = gb;
  b.fillRect(0, 0, width, height);

  // vinheta
  vinheta = createGraphics(width, height);
  let v = vinheta.drawingContext;
  let gv = v.createRadialGradient(width / 2, height / 2, height * 0.35, width / 2, height / 2, width * 0.7);
  gv.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gv.addColorStop(1, 'rgba(0, 3, 12, 0.75)');
  v.fillStyle = gv;
  v.fillRect(0, 0, width, height);
}

// Luzinhas piscando, a estrela da árvore e os reflexos no gelo
function desenhaLuzinhas() {
  noStroke();
  blendMode(ADD);
  for (let l of lampadas) {
    let b = 0.55 + 0.45 * sin(frameCount * l.vel + l.fase);
    let [r, g, bl] = l.cor;

    fill(r, g, bl, 35 * b);
    circle(l.x, l.y, l.tam * 4);

    // reflexo esticado no gelo: quanto mais alta a luz, mais longe da mureta
    let ry = chaoY + (chaoY - l.y) * 0.3;
    fill(r, g, bl, 30 * b);
    ellipse(l.x, ry, l.tam, l.tam * 3);
  }
  blendMode(BLEND);

  for (let l of lampadas) {
    let b = 0.55 + 0.45 * sin(frameCount * l.vel + l.fase);
    let [r, g, bl] = l.cor;
    fill(r, g, bl, 130 + 125 * b);
    circle(l.x, l.y, l.tam);
  }

  // estrela no topo, pulsando
  let pulso = 1 + 0.08 * sin(frameCount * 0.05);
  push();
  translate(arvore.x, arvore.base - arvore.h - 4);
  scale(pulso);
  blendMode(ADD);
  fill(255, 210, 100, 50);
  circle(0, 0, 40);
  blendMode(BLEND);
  fill(255, 215, 90);
  beginShape();
  for (let i = 0; i < 10; i++) {
    let r = i % 2 === 0 ? 12 : 5;
    let a = -HALF_PI + i * PI / 5;
    vertex(cos(a) * r, sin(a) * r);
  }
  endShape(CLOSE);
  pop();
}

// =====================================================
// INTERAÇÃO
// =====================================================

function mouseMoved() {
  mouseMexeu = true;
}

function mouseDragged() {
  mouseMexeu = true;
}

function mousePressed() {
  mouseMexeu = true;
  if (casal.estado === 'dancando') {
    casal.estado = 'girando';
    casal.giro = 0;
    // o giro levanta gelo em volta dos patins dela
    criaRaspas(dama.x, baseY, 22, 3, 0);
  }
}