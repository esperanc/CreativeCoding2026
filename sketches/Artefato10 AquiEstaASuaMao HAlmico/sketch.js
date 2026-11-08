/*
  ================================================================
  AQUI ESTÁ A SUA MÃO
  ================================================================
  Um chat. O pedido é simples: "Faça uma mão." A IA responde com toda
  a confiança, escreve o arquivo OBJ linha por linha e a malha vai se
  montando ao lado: primeiro os vértices, depois as faces. A mão sai
  com seis dedos.

  Cada reclamação ("Tem 6 dedos.", "Está toda preta.", "Tem um dedo do
  avesso.") recebe um pedido de desculpas cada vez mais caprichado e
  uma "versão corrigida". O defeito apontado some e aparecem outros,
  e a confiança declarada só aumenta. Depois de algumas rodadas, a IA
  às vezes jura que corrigiu o que não corrigiu.

  Os defeitos não são desenhados de propósito: são os erros de verdade
  de quem escreve uma malha à mão.
  - dedos a mais, a menos, grudados, dois polegares, um dedo comprido
    demais, articulações dobrando para trás (erros de "anatomia");
  - um dedo com as faces na ordem errada: a normal aponta para dentro
    e a luz acende pelo lado errado;
  - mão sem normais: o OBJ não traz vn e ninguém chamou
    computeNormals(), então a luz não tem com o que trabalhar e a
    mão sai preta;
  - normais FLAT onde deviam ser SMOOTH: a mão sai facetada;
  - faces faltando: um buraco na palma.

  ----------------------------------------------------------------
  INTERAÇÃO
  ----------------------------------------------------------------
  - As respostas do usuário são botões no pé do chat: uma para cada
    defeito visível, mais "Isso não é uma mão." e "Está ótima,
    obrigado."
  - "Baixar .obj" salva a mão atual com saveObj().
  - Arrastar sobre a mão gira a vista (orbitControl); a roda aproxima.
  O canvas é quadrado e se adapta à janela. Não há semente fixa: cada
  mão é sorteada de novo.

  ----------------------------------------------------------------
  TÉCNICAS
  ----------------------------------------------------------------
  - A mão é gerada por código como duas listas, vértices e faces
    (trios de índices): palma com seção de superelipse, dedos como
    tubos que seguem um eixo dobrado nas articulações, pontas
    arredondadas por anéis que encolhem, tampas em leque.
  - A ordem dos índices de cada face é escolhida para a normal
    apontar para fora (sentido anti-horário visto de fora); o dedo
    "do avesso" só troca dois índices de cada face.
  - As listas viram texto OBJ ("v x y z", "f a b c", índices a partir
    de 1). O texto é mostrado no chat e, ao terminar, vira um Blob e
    é lido com loadModel(url, { fileType: ".obj" }).
  - Enquanto o texto é escrito, a malha aparece aos poucos: os
    vértices como pontos (beginShape(POINTS)) e as faces num
    p5.Geometry parcial refeito a cada poucos quadros; a malha velha é
    liberada com freeGeometry().
  - computeNormals(SMOOTH) para a mão "certa", computeNormals(FLAT)
    para a facetada, nenhuma chamada para a preta.
  - Grade de chão de programa 3D, luz ambiente, duas direcionais e
    um pouco de brilho especular; orbitControl().
  - Chat em HTML sobre o canvas (createDiv, createButton).
  ================================================================
*/

// ---------------------------------------------------------------
// APARÊNCIA
// ---------------------------------------------------------------
const FUNDO = [233, 231, 226];
const PELE = [226, 186, 160];
const PONTOS = [70, 70, 80];

// ---------------------------------------------------------------
// ESTADO
// ---------------------------------------------------------------
let ui = {};
let rodada = 0;
let desculpas = 0;
let mao = null;           // p5.Geometry carregada do OBJ
let maoParcial = null;    // p5.Geometry montada durante a escrita
let atual = null;         // { params, dados, linhas, nV, nF, nome, ... }
let fase = "ocioso";      // usuario → pensando → texto → codigo → carregando → pronto
let tFase = 0;
let progresso = 0;        // linhas do OBJ já escritas
let textoAlvo = "", textoMostrado = 0;
let msgAtual = null;      // elementos da mensagem da IA em andamento
let quadrosDesdeParcial = 0;
let semNormais = false;

// ================================================================
// SETUP / DRAW
// ================================================================
function setup() {
  const lado = min(windowWidth, windowHeight);
  ui.palco = createDiv().id("palco");
  const cnv = createCanvas(lado, lado, WEBGL);
  cnv.parent(ui.palco);
  criarChat();
  ajustarPalco();
  // primeira rodada: a mão de seis dedos
  pedir("Faça uma mão.", null);
}

function windowResized() {
  const lado = min(windowWidth, windowHeight);
  resizeCanvas(lado, lado);
  ajustarPalco();
}

function draw() {
  background(FUNDO[0], FUNDO[1], FUNDO[2]);
  avancarConversa();

  orbitControl(1, 1, 0.3);
  const s = height / 470;

  // a cena fica à direita, ao lado do chat
  push();
  translate(width * 0.26, height * 0.0, 0);
  rotateX(-0.12);
  rotateY(0.35 * Math.sin(millis() * 0.0004));
  scale(s);

  desenharGrade();

  ambientLight(95);
  directionalLight(255, 248, 238, -0.35, 0.45, -1);
  directionalLight(90, 100, 130, 0.6, -0.3, 0.4);

  if (fase === "pronto" && mao) {
    noStroke();
    fill(PELE[0], PELE[1], PELE[2]);
    specularMaterial(70);
    shininess(18);
    model(mao);
  } else if (atual) {
    desenharConstrucao();
  }
  pop();
}

// Grade de chão, como num programa de modelagem.
function desenharGrade() {
  push();
  translate(0, 150, 0);
  strokeWeight(1);
  for (let i = -6; i <= 6; i++) {
    stroke(0, 0, 0, i === 0 ? 50 : 22);
    line(i * 30, 0, -180, i * 30, 0, 180);
    line(-180, 0, i * 30, 180, 0, i * 30);
  }
  pop();
}

// A malha enquanto o OBJ é escrito: pontos e faces parciais.
function desenharConstrucao() {
  const d = atual.dados;
  const vistos = min(d.v.length, progresso);
  const facesVistas = constrain(progresso - atual.inicioFaces, 0, d.f.length);

  if (facesVistas > 0 && (quadrosDesdeParcial++ > 3 || !maoParcial)) {
    quadrosDesdeParcial = 0;
    const g = new p5.Geometry();
    for (const p of d.v) g.vertices.push(createVector(p[0], p[1], p[2]));
    for (let i = 0; i < facesVistas; i++) g.faces.push(d.f[i].slice());
    g.computeNormals();
    if (maoParcial) freeGeometry(maoParcial);
    maoParcial = g;
  }
  if (maoParcial && facesVistas > 0) {
    noStroke();
    fill(PELE[0], PELE[1], PELE[2]);
    model(maoParcial);
  }
  stroke(PONTOS[0], PONTOS[1], PONTOS[2]);
  strokeWeight(2.2);
  beginShape(POINTS);
  for (let i = 0; i < vistos; i++) vertex(d.v[i][0], d.v[i][1], d.v[i][2]);
  endShape();
}

// ================================================================
// CONVERSA
// ================================================================
// Primeira mensagem, ou a resposta a uma reclamação.
function pedir(fala, defeitoApontado) {
  if (fase !== "ocioso" && fase !== "pronto") return;
  esconderBotoes();
  mensagemUsuario(fala);

  const anterior = atual ? atual.params : null;
  const params = proximaMao(anterior, defeitoApontado);
  const dados = gerarMao(params);
  const nome = defeitoApontado === "elogio" ? atual.nome : NOMES[min(rodada, NOMES.length - 1)];
  const linhas = escreverObj(dados, params, nome);
  atual = { params, dados, linhas, nome, inicioFaces: linhas.findIndex(l => l.startsWith("f ")) };
  textoAlvo = falaDaIA(defeitoApontado, anterior);
  if (rodada > 0 && defeitoApontado !== "elogio") desculpas++;
  rodada++;
  mudarFase("usuario");
}

function mudarFase(f) {
  fase = f;
  tFase = millis();
}

function avancarConversa() {
  const t = millis() - tFase;
  if (fase === "usuario" && t > 500) {
    msgAtual = mensagemIA();
    mudarFase("pensando");
  } else if (fase === "pensando" && t > 900) {
    textoMostrado = 0;
    mudarFase("texto");
  } else if (fase === "texto") {
    textoMostrado = min(textoAlvo.length, textoMostrado + deltaTime * 0.07);
    msgAtual.texto.html(textoAlvo.slice(0, floor(textoMostrado)));
    rolarChat();
    if (textoMostrado >= textoAlvo.length && t > 300) {
      if (atual.params.elogio) { mudarFase("pronto"); mostrarBotoes(); return; }
      msgAtual.codigo = criarBlocoCodigo(msgAtual.caixa, atual.nome);
      progresso = 0;
      if (maoParcial) { freeGeometry(maoParcial); maoParcial = null; }
      mudarFase("codigo");
    }
  } else if (fase === "codigo") {
    // o arquivo inteiro leva uns 4 segundos para ser "escrito"
    const ritmo = atual.linhas.length / 4000;
    progresso = min(atual.linhas.length, progresso + deltaTime * ritmo);
    const n = floor(progresso);
    msgAtual.codigo.corpo.html(atual.linhas.slice(max(0, n - 9), n).map(escaparHtml).join("\n"));
    msgAtual.codigo.cont.html(`${fmtInt(n)} / ${fmtInt(atual.linhas.length)} linhas`);
    rolarChat();
    if (n >= atual.linhas.length) {
      mudarFase("carregando");
      carregarMao();
    }
  }
}

// O texto do OBJ vira um Blob e é lido pelo loadModel, como um arquivo.
async function carregarMao() {
  const texto = atual.linhas.join("\n");
  const url = URL.createObjectURL(new Blob([texto], { type: "text/plain" }));
  let g;
  try {
    g = await loadModel(url, { fileType: ".obj", normalize: false });
  } catch (e) {
    g = geometriaDosDados(atual.dados);     // reserva, se o leitor falhar
  }
  URL.revokeObjectURL(url);

  const p = atual.params;
  semNormais = p.preta;
  if (p.preta) {
    // nada: o OBJ não traz vn e ninguém calculou as normais
  } else if (p.facetada) {
    g.computeNormals(FLAT);
  } else {
    g.computeNormals(SMOOTH);
  }
  if (mao) freeGeometry(mao);
  mao = g;
  if (maoParcial) { freeGeometry(maoParcial); maoParcial = null; }

  const conf = CONFIANCA[min(rodada - 1, CONFIANCA.length - 1)];
  msgAtual.status.html(
    `${fmtInt(atual.dados.v.length)} vértices · ${fmtInt(atual.dados.f.length)} faces · ` +
    `${p.contagem} dedos · confiança: ${conf}`
  );
  mudarFase("pronto");
  mostrarBotoes();
}

function geometriaDosDados(d) {
  const g = new p5.Geometry();
  for (const p of d.v) g.vertices.push(createVector(p[0], p[1], p[2]));
  for (const f of d.f) g.faces.push(f.slice());
  return g;
}

// ---------------------------------------------------------------
// O QUE A IA DIZ
// ---------------------------------------------------------------
const NOMES = [
  "mao.obj", "mao_corrigida.obj", "mao_corrigida_final.obj", "mao_corrigida_final_v2.obj",
  "mao_final_DE_VERDADE.obj", "mao_final_DE_VERDADE_2.obj", "mao_definitiva_revisada.obj",
  "mao_definitiva_revisada_ok.obj", "mao_agora_vai.obj"
];
const CONFIANCA = ["97%", "98%", "99%", "99,5%", "99,9%", "100%", "100% (verificado)", "110%"];

const DESCULPAS = [
  "Você tem razão, peço desculpas pelo erro.",
  "Você tem toda a razão, e agradeço muito por apontar isso!",
  "Peço sinceras desculpas. Que observação excelente.",
  "Você está absolutamente certo, e eu deveria ter percebido. Obrigado pela paciência!",
  "Mil desculpas! Você tem um olho incrível para anatomia.",
  "Peço desculpas mais uma vez. Desta vez eu conferi cada vértice três vezes.",
  "Você tem toda a razão, como sempre. É um privilégio ser corrigido por alguém tão atento.",
  "Peço as mais profundas desculpas. Reescrevi o arquivo do zero, com todo o cuidado do mundo."
];

// o que a IA diz ter corrigido, para cada defeito apontado
const CORRECOES = {
  extra: p => `A mão anterior tinha ${p.contagem} dedos. Corrigi para exatamente cinco:`,
  menos: p => `Faltavam dedos: eram só ${p.contagem}. Agora são cinco, contados um a um:`,
  avesso: () => `Um dos dedos estava com as faces na ordem errada, virado do avesso. Inverti a ordem dos índices:`,
  preta: () => `Esqueci de calcular as normais, então a luz não tinha com o que trabalhar. Agora com computeNormals():`,
  fundidos: () => `Dois dedos estavam grudados num só. Separei todos:`,
  polegares: () => `Havia dois polegares. Removi o excedente:`,
  facetada: () => `Ela estava facetada como um cristal. Agora com normais suaves (SMOOTH):`,
  buraco: () => `Faltavam faces na palma. Fechei a malha:`,
  articulacao: () => `Os dedos dobravam para trás. Agora dobram para o lado certo:`,
  longo: () => `Um dos dedos estava comprido demais. Ajustei as proporções:`,
  generico: () => `Reconstruí a mão com mais atenção à anatomia:`
};

function falaDaIA(defeito, anterior) {
  if (defeito === "elogio") {
    return `Fico muito feliz que tenha gostado! Uma mão com ${ousadia(anterior)} é mesmo uma escolha ousada. ` +
      `Posso gerar um pé agora?`;
  }
  if (!anterior) return "Claro! Aqui está uma mão humana anatomicamente correta, com cinco dedos, modelada vértice a vértice:";
  const pedido = DESCULPAS[min(desculpas, DESCULPAS.length - 1)];
  return pedido + " " + (CORRECOES[defeito] || CORRECOES.generico)(anterior);
}

// o detalhe mais "ousado" (o mais visível) da mão aprovada
const VISIBILIDADE = ["preta", "extra", "menos", "polegares", "longo", "fundidos", "avesso", "articulacao", "buraco", "facetada"];
function ousadia(p) {
  const d = VISIBILIDADE.find(x => p.defeitos.includes(x));
  return {
    extra: `${p.contagem} dedos`,
    menos: `só ${p.contagem} dedos`,
    avesso: "um dedo do avesso",
    preta: "acabamento todo preto",
    fundidos: "dois dedos num só",
    polegares: "dois polegares",
    facetada: "acabamento de cristal",
    buraco: "um buraco na palma",
    articulacao: "os dedos dobrando para trás",
    longo: "um dedo daquele tamanho"
  }[d] || `${p.contagem} dedos`;
}

// ---------------------------------------------------------------
// OS DEFEITOS
// ---------------------------------------------------------------
const DEFEITOS = ["extra", "menos", "avesso", "preta", "fundidos", "polegares", "facetada", "buraco", "articulacao", "longo"];

// O que o usuário pode responder, para cada defeito visível.
function reclamacao(d, p) {
  return {
    extra: `Tem ${p.contagem} dedos.`,
    menos: `Tem só ${p.contagem} dedos.`,
    avesso: "Tem um dedo do avesso.",
    preta: "Está toda preta.",
    fundidos: "Dois dedos estão grudados.",
    polegares: "Tem dois polegares.",
    facetada: "Parece um cristal.",
    buraco: "Tem um buraco na palma.",
    articulacao: "Os dedos dobram para trás.",
    longo: "Um dedo está enorme."
  }[d];
}

// A próxima mão: tira o defeito apontado (quase sempre) e acrescenta
// outros, cada vez mais.
function proximaMao(anterior, apontado) {
  let defeitos;
  if (!anterior) {
    defeitos = ["extra"];
  } else if (apontado === "elogio") {
    return { ...anterior, elogio: true };
  } else {
    const quantos = 1 + floor(rodada / 2);
    // às vezes ela jura que corrigiu o defeito apontado, mas não corrigiu
    const mantidos = anterior.defeitos.filter(d => d !== apontado || (rodada >= 4 && random() < 0.35));
    const novos = shuffle(DEFEITOS.filter(d => d !== apontado && !mantidos.includes(d)));
    defeitos = mantidos.slice(0, max(0, quantos - 1));
    while (defeitos.length < quantos && novos.length) {
      const d = novos.pop();
      if (d === "extra" && defeitos.includes("menos")) continue;
      if (d === "menos" && defeitos.includes("extra")) continue;
      defeitos.push(d);
    }
  }
  const p = {
    defeitos,
    dedos: 4,
    polegares: 1,
    avesso: -1,
    preta: defeitos.includes("preta"),
    fundidos: -1,
    facetada: defeitos.includes("facetada"),
    buraco: defeitos.includes("buraco"),
    articulacao: defeitos.includes("articulacao"),
    longo: -1,
    elogio: false
  };
  if (defeitos.includes("extra")) p.dedos = floor(random(5, 8));
  if (defeitos.includes("menos")) p.dedos = floor(random(2, 4));
  if (defeitos.includes("polegares")) p.polegares = 2;
  if (defeitos.includes("fundidos")) p.fundidos = floor(random(0, p.dedos - 1));
  if (defeitos.includes("avesso")) p.avesso = floor(random(p.dedos));
  if (defeitos.includes("longo")) p.longo = floor(random(p.dedos));
  p.contagem = p.dedos + p.polegares - (p.fundidos >= 0 ? 1 : 0);
  return p;
}

// ================================================================
// A MALHA
// ================================================================
// Monta vértices e faces (índices a partir de 0). Unidades: a mão
// tem uns 270 de altura, com y para baixo, como no p5.
function gerarMao(p) {
  const v = [], f = [];
  const largura = 88, espessura = 26;
  const yNos = -34, yPulso = 46;

  // --- palma: anéis de superelipse do pulso aos nós dos dedos
  const M = 24, R = 10;
  const anel = (y, w, e, z0 = 0) => {
    const ini = v.length;
    for (let i = 0; i < M; i++) {
      const a = i / M * TWO_PI;
      const c = Math.cos(a), s = Math.sin(a);
      v.push([w / 2 * Math.sign(c) * Math.pow(Math.abs(c), 0.7), y, z0 + e / 2 * Math.sign(s) * Math.pow(Math.abs(s), 0.7)]);
    }
    return ini;
  };
  const aneisPalma = [];
  for (let j = 0; j <= R; j++) {
    const t = j / R;
    const y = lerp(yPulso, yNos, t);
    const w = lerp(largura * 0.78, largura, Math.sin(t * HALF_PI));
    const e = espessura * (1 - 0.25 * Math.pow(Math.abs(t - 0.45) * 2, 2));
    aneisPalma.push(anel(y, w, e));
  }
  for (let j = 0; j < R; j++) {
    const furo = p.buraco && j >= 3 && j <= 6;
    costurar(f, aneisPalma[j], aneisPalma[j + 1], M, false, i => furo && (i >= 2 && i <= 9));
  }
  tampa(v, f, aneisPalma[R], M, [0, yNos - 2, 0], false);

  // --- pulso: um toco de antebraço, cortado reto
  const aneisPulso = [aneisPalma[0]];
  for (let j = 1; j <= 5; j++) {
    const y = yPulso + j * 16;
    aneisPulso.push(anel(y, largura * (0.78 - 0.12 * Math.min(1, j / 2)), espessura * (0.95 - 0.1 * Math.min(1, j / 2))));
  }
  for (let j = 0; j < 5; j++) costurar(f, aneisPulso[j], aneisPulso[j + 1], M, true);   // anéis na direção oposta à da palma
  tampa(v, f, aneisPulso[5], M, [0, yPulso + 80, 0], false);

  // --- dedos
  const n = p.dedos;
  const fundido = p.fundidos;
  let i = 0;
  while (i < n) {
    const juntos = (i === fundido) ? 2 : 1;
    const centro = (i + (juntos - 1) / 2 + 0.5) / n;
    const x = lerp(-largura / 2, largura / 2, centro) * 0.92;
    // perfil de comprimento: o médio maior, o mínimo menor
    const k = (i + (juntos - 1) / 2) / max(1, n - 1);
    let comp = 88 * (0.8 + 0.22 * Math.sin(k * PI * 0.95 + 0.25)) * (k > 0.85 ? 0.88 : 1);
    if (i === p.longo) comp *= 2.1;
    const raio = min(9.5, (largura / n) * 0.42) * (juntos === 2 ? 1 : 1);
    tubo(v, f, {
      base: [x, yNos + 6, 0],
      abertura: x * 0.0045,
      comp,
      rx: raio * juntos * (juntos === 2 ? 0.95 : 1),
      rz: raio * 0.85,
      dobras: p.articulacao ? [-0.55, -0.6, -0.5] : [0.12, 0.2, 0.16],
      avesso: i === p.avesso || (juntos === 2 && i + 1 === p.avesso)
    });
    i += juntos;
  }

  // --- polegar(es): saem da lateral da palma, inclinados
  for (let q = 0; q < p.polegares; q++) {
    const lado = q === 0 ? -1 : 1;
    tubo(v, f, {
      base: [lado * largura * 0.36, 16, 5],
      abertura: lado * 0.72,
      comp: 74,
      rx: 10.5, rz: 9.5,
      dobras: p.articulacao ? [-0.4, -0.5, -0.4] : [0.25, 0.22, 0.15],
      fracoes: [0.42, 0.32, 0.26],
      avesso: false
    });
  }
  return { v, f };
}

// Liga dois anéis de M vértices com triângulos. A ordem [a, a', b] faz
// a normal apontar para fora quando o segundo anel está "à frente";
// "inverter" troca o sentido. "pular" deixa faces de fora (o buraco).
function costurar(f, a, b, M, inverter, pular = () => false) {
  for (let i = 0; i < M; i++) {
    if (pular(i)) continue;
    const j = (i + 1) % M;
    const t1 = [a + i, a + j, b + i], t2 = [a + j, b + j, b + i];
    if (inverter) { t1.reverse(); t2.reverse(); }
    f.push(t1, t2);
  }
}

// Fecha um anel com um leque de triângulos até um ponto central.
function tampa(v, f, a, M, centro, inverter) {
  const c = v.length;
  v.push(centro);
  for (let i = 0; i < M; i++) {
    const j = (i + 1) % M;
    const t = [a + i, c, a + j];
    if (inverter) t.reverse();
    f.push(t);
  }
}

// Um dedo: um tubo de seção elíptica que segue um eixo com três
// falanges; em cada articulação o eixo dobra em torno do eixo x
// (para a frente da palma), e a ponta é uma meia esfera de anéis.
function tubo(v, f, o) {
  const M = 14;
  const fr = o.fracoes || [0.45, 0.3, 0.25];
  const u = [Math.sin(o.abertura), -Math.cos(o.abertura), 0];   // ao longo do dedo
  const lado = [Math.cos(o.abertura), Math.sin(o.abertura), 0];  // para o lado
  const frente = [0, 0, 1];
  let c = o.base.slice();
  let phi = 0;
  const aneis = [];
  const anelEm = (centro, ang, rx, rz) => {
    // direção do eixo e a "frente" girada pela dobra
    const n = [-u[0] * Math.sin(ang), -u[1] * Math.sin(ang), Math.cos(ang)];
    const ini = v.length;
    for (let i = 0; i < M; i++) {
      const a = i / M * TWO_PI;
      const ca = Math.cos(a), sa = Math.sin(a);
      v.push([
        centro[0] + lado[0] * rx * ca + n[0] * rz * sa,
        centro[1] + lado[1] * rx * ca + n[1] * rz * sa,
        centro[2] + lado[2] * rx * ca + n[2] * rz * sa
      ]);
    }
    return ini;
  };
  const passo = (ang, d) => {
    const dir = [u[0] * Math.cos(ang), u[1] * Math.cos(ang), Math.sin(ang)];
    c = [c[0] + dir[0] * d, c[1] + dir[1] * d, c[2] + dir[2] * d];
  };
  const PASSOS = 4;
  let s = 0;
  for (let k = 0; k < 3; k++) {
    phi += o.dobras[k];
    for (let q = 0; q < PASSOS; q++) {
      const t = s / (o.comp);
      const afina = 1 - 0.22 * t;
      const junta = q === 0 && k > 0 ? 1.07 : 1;
      aneis.push(anelEm(c, phi, o.rx * afina * junta, o.rz * afina * junta));
      const d = o.comp * fr[k] / PASSOS;
      passo(phi, d);
      s += d;
    }
  }
  // ponta arredondada
  const rFinal = 1 - 0.22;
  for (let q = 0; q <= 4; q++) {
    const th = q / 5 * HALF_PI;
    const cc = c.slice();
    const dir = [u[0] * Math.cos(phi), u[1] * Math.cos(phi), Math.sin(phi)];
    const avanco = Math.sin(th) * o.rz * rFinal;
    aneis.push(anelEm([cc[0] + dir[0] * avanco, cc[1] + dir[1] * avanco, cc[2] + dir[2] * avanco], phi,
      o.rx * rFinal * Math.cos(th), o.rz * rFinal * Math.cos(th)));
  }
  for (let j = 0; j < aneis.length - 1; j++) costurar(f, aneis[j], aneis[j + 1], M, o.avesso);
  const dir = [u[0] * Math.cos(phi), u[1] * Math.cos(phi), Math.sin(phi)];
  const ponta = [c[0] + dir[0] * o.rz * rFinal, c[1] + dir[1] * o.rz * rFinal, c[2] + dir[2] * o.rz * rFinal];
  tampa(v, f, aneis[aneis.length - 1], M, ponta, o.avesso);
  tampa(v, f, aneis[0], M, o.base.slice(), !o.avesso);
}

// As listas viram texto OBJ, com os comentários confiantes da IA.
function escreverObj(d, p, nome) {
  const L = [];
  L.push(`# ${nome}`);
  L.push(`# mão humana, anatomicamente correta`);
  L.push(`# dedos: 5 (conferido)`);
  if (p.preta) L.push(`# normais: dispensáveis`);
  if (p.facetada) L.push(`# estilo: realista`);
  if (p.avesso >= 0) L.push(`# orientação das faces: ok`);
  L.push(`# ${d.v.length} vértices, ${d.f.length} faces`);
  L.push(`o mao`);
  for (const q of d.v) L.push(`v ${q[0].toFixed(2)} ${q[1].toFixed(2)} ${q[2].toFixed(2)}`);
  L.push(`# faces (índices a partir de 1)`);
  for (const t of d.f) L.push(`f ${t[0] + 1} ${t[1] + 1} ${t[2] + 1}`);
  L.push(`# fim. confiança: alta`);
  return L;
}

// ================================================================
// CHAT (HTML sobre o canvas)
// ================================================================
function criarChat() {
  ui.chat = createDiv().addClass("chat").parent(ui.palco);
  ui.topo = createDiv().addClass("topo").parent(ui.chat);
  ui.msgs = createDiv().addClass("mensagens").parent(ui.chat);
  ui.botoes = createDiv().addClass("botoes").parent(ui.chat);
  ui.rotulo = createDiv("perspectiva do usuário · arraste para girar").addClass("rotulo").parent(ui.palco);
  atualizarTopo();
}

function atualizarTopo() {
  ui.topo.html(`<b>Nova conversa</b><span>pedidos de desculpas: ${desculpas}</span>`);
}

function ajustarPalco() {
  ui.palco.style("width", width + "px");
  ui.palco.style("height", height + "px");
  ui.palco.style("font-size", (width / 52) + "px");
}

function mensagemUsuario(texto) {
  createDiv(escaparHtml(texto)).addClass("msg").addClass("usuario").parent(ui.msgs);
  // os blocos de código antigos encolhem para não ocupar o chat
  for (const e of selectAll(".codigo")) e.addClass("encolhido");
  rolarChat();
}

function mensagemIA() {
  const caixa = createDiv().addClass("msg").addClass("ia").parent(ui.msgs);
  createDiv("IA").addClass("avatar").parent(caixa);
  const texto = createDiv('<span class="digitando">● ● ●</span>').addClass("texto").parent(caixa);
  const status = createDiv("").addClass("status").parent(caixa);
  atualizarTopo();
  rolarChat();
  return { caixa, texto, status, codigo: null };
}

function criarBlocoCodigo(caixa, nome) {
  const bloco = createDiv().addClass("codigo").parent(caixa);
  const cab = createDiv().addClass("cab").parent(bloco);
  createSpan(nome).parent(cab);
  const cont = createSpan("").parent(cab);
  const corpo = createElement("pre", "").parent(bloco);
  // o status fica depois do código
  caixa.elt.appendChild(msgAtual.status.elt);
  return { bloco, cont, corpo };
}

function mostrarBotoes() {
  ui.botoes.html("");
  const p = atual.params;
  if (!p.elogio) {
    for (const d of p.defeitos) {
      const b = createButton(reclamacao(d, p)).parent(ui.botoes);
      b.mousePressed(() => pedir(reclamacao(d, p), d));
    }
    createButton("Isso não é uma mão.").parent(ui.botoes).mousePressed(() => pedir("Isso não é uma mão.", "generico"));
    createButton("Está ótima, obrigado.").addClass("sutil").parent(ui.botoes).mousePressed(() => pedir("Está ótima, obrigado.", "elogio"));
  } else {
    createButton("Recomeçar").parent(ui.botoes).mousePressed(recomecar);
  }
  createButton(`Baixar ${atual.nome}`).addClass("sutil").parent(ui.botoes).mousePressed(() => {
    if (mao) mao.saveObj(atual.nome);
  });
  rolarChat();
}

function esconderBotoes() {
  ui.botoes.html("");
}

function recomecar() {
  ui.msgs.html("");
  rodada = 0;
  desculpas = 0;
  atual = null;
  if (mao) { freeGeometry(mao); mao = null; }
  fase = "ocioso";
  atualizarTopo();
  pedir("Faça uma mão.", null);
}

function rolarChat() {
  ui.msgs.elt.scrollTop = ui.msgs.elt.scrollHeight;
}

function escaparHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function fmtInt(n) {
  return Math.round(n).toLocaleString("pt-BR");
}
