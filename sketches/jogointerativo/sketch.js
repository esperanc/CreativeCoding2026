
let motor, mundo, personagem, canvasJogo, painel;
let plataformas = [];
let objetos = [];
let gestos = [];
let gestoAtual = [];
let particulas = [];
let teclas = new Set();
let checkpoints = [];

let pronto = false;
let falhou = false;
let estado = "carregando";
let faseAtual = 0;
let desenhando = false;
let ponteiroAtivo = null;
let inicioDesenho = 0;
let tintaUsada = 0;
let direcao = 1;
let puloAnterior = false;
let ultimoFrame = 0;
let acumulador = 0;
let escala = 1;
let origemX = 0;
let origemY = 0;
let aviso = "";
let avisoAte = 0;

const L = 960;
const A = 600;
const DURACAO = 10000;
const TINTA_MAX = 1100;
const ESPESSURA = 18;
const PASSO = 1000 / 60;
const VELOCIDADE = 6.2;
const ACELERACAO = 0.32;
const PULO = -8;

const fases = [
  {
    nome: "FASE 1 - A PONTE",
    instrucao: "Use um traço para atravessar o grande buraco.",
    inicio: [92, 497],
    meta: [900, 520],
    plataformas: [
      [0, 520, 260, 80],
      [700, 520, 260, 80]
    ],
    buracos: [
      [260, 700]
    ]
  },
  {
    nome: "FASE 2 - A ESCALADA",
    instrucao: "Use seus traços nos dois buracos.",
    inicio: [85, 497],
    meta: [910, 350],
    plataformas: [
      [0, 520, 290, 80],
      [500, 445, 140, 155],
      [780, 350, 180, 250]
    ],
    buracos: [
      [290, 500],
      [640, 780]
    ]
  },
  {
    nome: "FASE 3 - O ABISMO",
    instrucao: "Atravesse usando uma estrutura física desenhada.",
    inicio: [83, 457],
    meta: [900, 480],
    plataformas: [
      [0, 480, 285, 120],
      [675, 480, 285, 120]
    ],
    buracos: [
      [285, 675]
    ]
  }
];

function carregarBiblioteca(url) {
  return new Promise((resolve, reject) => {
    const arquivo = document.createElement("script");

    arquivo.src = url;
    arquivo.onload = resolve;
    arquivo.onerror = reject;

    document.head.appendChild(arquivo);
  });
}

function tamanhoDisponivel() {
  return {
    largura: Math.max(240, windowWidth - 12),
    altura: Math.max(220, windowHeight - 16)
  };
}

function ajustarTela() {
  escala = Math.min(
    width / L,
    height / A
  );

  origemX = (width - L * escala) / 2;
  origemY = (height - A * escala) / 2;

  ortho(
    -width / 2,
    width / 2,
    -height / 2,
    height / 2,
    0,
    3000
  );
}

async function setup() {
  const tamanho = tamanhoDisponivel();

  canvasJogo = createCanvas(
    tamanho.largura,
    tamanho.altura,
    WEBGL
  );

  pixelDensity(1);
  frameRate(60);

  canvasJogo.elt.tabIndex = 0;
  canvasJogo.elt.style.outline = "none";
  canvasJogo.elt.style.touchAction = "none";
  canvasJogo.elt.style.display = "block";

  ajustarTela();

  painel = createGraphics(L, A);
  painel.pixelDensity(1);
  painel.textFont("Arial");

  for (let indice = 0; indice < 65; indice++) {
    particulas.push({
      x: random(L),
      y: random(120, A),
      r: random(1, 3),
      ciclo: random(TWO_PI)
    });
  }

  configurarEventos();

  try {
    if (!window.decomp) {
      await carregarBiblioteca(
        "https://cdn.jsdelivr.net/npm/poly-decomp@0.3.0/build/decomp.min.js"
      );
    }

    if (!window.Matter) {
      await carregarBiblioteca(
        "https://cdn.jsdelivr.net/npm/matter-js@0.20.0/build/matter.min.js"
      );
    }

    Matter.Common.setDecomp(window.decomp);

    pronto = true;
    carregarFase(0);
  } catch (e) {
    falhou = true;
    estado = "erro";
  }
}

function windowResized() {
  const tamanho = tamanhoDisponivel();

  resizeCanvas(
    tamanho.largura,
    tamanho.altura
  );

  ajustarTela();
}

function posicaoPonteiro(evento) {
  const area = canvasJogo.elt.getBoundingClientRect();

  const xCanvas =
    (evento.clientX - area.left) *
    width / area.width;

  const yCanvas =
    (evento.clientY - area.top) *
    height / area.height;

  const x = (xCanvas - origemX) / escala;
  const y = (yCanvas - origemY) / escala;

  return {
    x,
    y,
    valido:
      x >= 0 &&
      x <= L &&
      y >= 0 &&
      y <= A
  };
}

function configurarEventos() {
  canvasJogo.elt.addEventListener(
    "pointerdown",
    evento => {
      if (!pronto || evento.button !== 0) return;

      const ponto = posicaoPonteiro(evento);

      if (!ponto.valido) return;

      canvasJogo.elt.focus();

      if (estado === "jogando") {
        iniciarDesenho();
      }

      if (estado !== "desenhando") return;

      desenhando = true;
      ponteiroAtivo = evento.pointerId;
      gestoAtual = [];

      adicionarPonto(ponto.x, ponto.y);

      try {
        canvasJogo.elt.setPointerCapture(
          evento.pointerId
        );
      } catch (e) {}

      evento.preventDefault();
    }
  );

  canvasJogo.elt.addEventListener(
    "pointermove",
    evento => {
      if (
        estado !== "desenhando" ||
        !desenhando ||
        evento.pointerId !== ponteiroAtivo
      ) {
        return;
      }

      const ponto = posicaoPonteiro(evento);

      adicionarPonto(ponto.x, ponto.y);
      evento.preventDefault();
    }
  );

  window.addEventListener(
    "pointerup",
    evento => {
      if (
        !desenhando ||
        evento.pointerId !== ponteiroAtivo
      ) {
        return;
      }

      const ponto = posicaoPonteiro(evento);

      if (ponto.valido) {
        adicionarPonto(ponto.x, ponto.y);
      }

      guardarGesto();

      desenhando = false;
      ponteiroAtivo = null;
    }
  );

  window.addEventListener(
    "pointercancel",
    evento => {
      if (evento.pointerId !== ponteiroAtivo) return;

      if (desenhando) {
        guardarGesto();
      }

      desenhando = false;
      ponteiroAtivo = null;
    }
  );

  window.addEventListener(
    "keydown",
    evento => {
      const tecla = evento.key.toLowerCase();

      if (
        [
          "arrowleft",
          "arrowright",
          "arrowup",
          "arrowdown",
          " "
        ].includes(tecla)
      ) {
        evento.preventDefault();
      }

      teclas.add(tecla);

      if (!pronto || evento.repeat) return;

      if (tecla === "r") {
        carregarFase(faseAtual);
        return;
      }

      if (estado === "desenhando") {
        if (tecla === "enter") {
          finalizarDesenho();
        }

        if (tecla === "c") {
          gestos = [];
          gestoAtual = [];
          tintaUsada = 0;
          desenhando = false;
          ponteiroAtivo = null;
        }
      } else if (
        estado === "vitoria" &&
        tecla === "enter"
      ) {
        carregarFase(
          (faseAtual + 1) % fases.length
        );
      }
    }
  );

  window.addEventListener(
    "keyup",
    evento => {
      teclas.delete(
        evento.key.toLowerCase()
      );
    }
  );

  window.addEventListener(
    "blur",
    () => {
      teclas.clear();
      puloAnterior = false;

      if (desenhando) {
        guardarGesto();
      }

      desenhando = false;
      ponteiroAtivo = null;
    }
  );
}

function carregarFase(indice) {
  faseAtual = indice;

  motor = Matter.Engine.create({
    enableSleeping: true,
    positionIterations: 12,
    velocityIterations: 12,
    constraintIterations: 4
  });

  mundo = motor.world;
  mundo.gravity.y = 1.1;

  plataformas = [];
  objetos = [];
  gestos = [];
  gestoAtual = [];

  checkpoints = fases[indice].buracos.map(
    () => false
  );

  tintaUsada = 0;
  desenhando = false;
  ponteiroAtivo = null;
  acumulador = 0;
  direcao = 1;
  puloAnterior = false;

  teclas.clear();

  for (const plataforma of fases[indice].plataformas) {
    const corpo = Matter.Bodies.rectangle(
      plataforma[0] + plataforma[2] / 2,
      plataforma[1] + plataforma[3] / 2,
      plataforma[2],
      plataforma[3],
      {
        isStatic: true,
        friction: 0.8,
        restitution: 0,
        slop: 0.04,
        label: "plataforma"
      }
    );

    Matter.Composite.add(mundo, corpo);

    plataformas.push({
      x: plataforma[0],
      y: plataforma[1],
      w: plataforma[2],
      h: plataforma[3]
    });
  }

  personagem = Matter.Bodies.rectangle(
    fases[indice].inicio[0],
    fases[indice].inicio[1],
    28,
    46,
    {
      label: "personagem",
      friction: 0.06,
      frictionAir: 0.008,
      restitution: 0,
      sleepThreshold: Infinity
    }
  );

  Matter.Body.setInertia(
    personagem,
    Infinity
  );

  Matter.Composite.add(
    mundo,
    personagem
  );

  Matter.Events.on(
    motor,
    "collisionStart",
    registrarContato
  );

  Matter.Events.on(
    motor,
    "collisionActive",
    registrarContato
  );

  estado = "jogando";
  ultimoFrame = millis();

  avisar(
    "O portal só libera depois de usar um desenho sobre cada buraco.",
    4700
  );
}

function registrarContato(evento) {
  if (estado !== "jogando") return;

  for (const par of evento.pairs) {
    const corpoA = par.bodyA.parent || par.bodyA;
    const corpoB = par.bodyB.parent || par.bodyB;

    let outro = null;

    if (corpoA === personagem) {
      outro = corpoB;
    }

    if (corpoB === personagem) {
      outro = corpoA;
    }

    if (!outro) continue;

    const contatoComDesenho = objetos.some(
      objeto => objeto.corpo === outro
    );

    if (!contatoComDesenho) continue;

    const x = personagem.position.x;

    for (
      let indice = 0;
      indice < fases[faseAtual].buracos.length;
      indice++
    ) {
      if (checkpoints[indice]) continue;

      const buraco =
        fases[faseAtual].buracos[indice];

      const margem = Math.min(
        45,
        (buraco[1] - buraco[0]) * 0.23
      );

      if (
        x > buraco[0] + margem &&
        x < buraco[1] - margem
      ) {
        checkpoints[indice] = true;

        avisar(
          "Travessia " +
          (indice + 1) +
          " validada com seu desenho!",
          2400
        );
      }
    }
  }
}

function draw() {
  background(13, 23, 41);

  if (pronto) {
    if (
      estado === "desenhando" &&
      millis() - inicioDesenho >= DURACAO
    ) {
      finalizarDesenho();
    }

    if (estado === "jogando") {
      moverPersonagem();
      atualizarFisica();
      verificarChegada();
    } else {
      ultimoFrame = millis();
      acumulador = 0;
    }
  }

  push();

  translate(
    -width / 2 + origemX,
    -height / 2 + origemY,
    0
  );

  scale(escala);

  desenharFundo();

  if (pronto) {
    desenharPlataformas();
    desenharTracos();
    desenharPersonagem();
    desenharPrevia();
  }

  pop();

  desenharPainel();

  push();

  resetMatrix();
  noStroke();

  image(
    painel,
    -width / 2 + origemX,
    -height / 2 + origemY,
    L * escala,
    A * escala
  );

  pop();
}

function desenharFundo() {
  noStroke();

  push();

  translate(L / 2, A / 2, -170);

  ambientMaterial(18, 32, 52);
  plane(L, A);

  pop();

  stroke(80, 120, 150, 30);
  strokeWeight(1);

  for (let x = 0; x <= L; x += 40) {
    line(
      x, 110, -120,
      x, A, -120
    );
  }

  for (let y = 120; y <= A; y += 40) {
    line(
      0, y, -120,
      L, y, -120
    );
  }

  noStroke();

  for (const particula of particulas) {
    push();

    translate(
      particula.x,
      particula.y,
      -100
    );

    fill(
      110,
      190,
      210,
      65 +
      35 * sin(
        frameCount * 0.018 +
        particula.ciclo
      )
    );

    circle(
      0,
      0,
      particula.r
    );

    pop();
  }
}

function desenharPlataformas() {
  ambientLight(120, 130, 150);

  directionalLight(
    255,
    245,
    220,
    -0.5,
    -0.8,
    -1
  );

  for (const plataforma of plataformas) {
    push();

    translate(
      plataforma.x + plataforma.w / 2,
      plataforma.y + plataforma.h / 2,
      0
    );

    ambientMaterial(43, 76, 100);

    box(
      plataforma.w,
      plataforma.h,
      55
    );

    pop();

    push();

    translate(
      plataforma.x + plataforma.w / 2,
      plataforma.y + 3,
      31
    );

    emissiveMaterial(86, 222, 191);

    box(
      plataforma.w,
      7,
      8
    );

    pop();
  }

  const portalLivre = checkpoints.every(Boolean);
  const meta = fases[faseAtual].meta;

  push();

  translate(
    meta[0],
    meta[1] - 40,
    45
  );

  rotateY(frameCount * 0.025);

  if (portalLivre) {
    emissiveMaterial(95, 255, 165);
  } else {
    emissiveMaterial(255, 93, 109);
  }

  torus(24, 6, 18, 12);

  pop();
}

function desenharPersonagem() {
  const posicao = personagem.position;

  const animando =
    abs(personagem.velocity.x) > 0.5 &&
    estado === "jogando";

  const passo = animando
    ? sin(frameCount * 0.3) * 6
    : 0;

  push();

  translate(
    posicao.x,
    posicao.y,
    55
  );

  rotateY(direcao * 0.18);

  ambientMaterial(255, 183, 95);
  box(27, 33, 24);

  ambientMaterial(255, 220, 170);

  push();

  translate(0, -24, 0);
  sphere(15, 12, 10);

  pop();

  ambientMaterial(20, 28, 45);

  for (const lado of [-1, 1]) {
    push();

    translate(
      lado * 6,
      -25,
      13
    );

    sphere(2.4, 7, 5);

    pop();
  }

  ambientMaterial(80, 210, 225);

  push();

  translate(-8, 26 + passo, 0);
  box(9, 14, 13);

  pop();

  push();

  translate(8, 26 - passo, 0);
  box(9, 14, 13);

  pop();
  pop();
}

function desenharTracos() {
  for (const objeto of objetos) {
    const corpo = objeto.corpo;

    push();

    translate(
      corpo.position.x,
      corpo.position.y,
      65
    );

    rotateZ(corpo.angle);

    noFill();
    strokeCap(ROUND);
    strokeJoin(ROUND);

    stroke(12, 34, 49);
    strokeWeight(ESPESSURA + 5);

    beginShape();

    for (const ponto of objeto.pontos) {
      vertex(ponto.x, ponto.y, 0);
    }

    endShape();

    stroke(
      objeto.cor[0],
      objeto.cor[1],
      objeto.cor[2]
    );

    strokeWeight(ESPESSURA);

    beginShape();

    for (const ponto of objeto.pontos) {
      vertex(ponto.x, ponto.y, 1);
    }

    endShape();

    noStroke();
    pop();
  }
}

function desenharPrevia() {
  if (estado !== "desenhando") return;

  const listas = gestoAtual.length > 0
    ? [...gestos, gestoAtual]
    : gestos;

  noFill();
  strokeWeight(ESPESSURA);
  strokeCap(ROUND);
  strokeJoin(ROUND);

  for (
    let indice = 0;
    indice < listas.length;
    indice++
  ) {
    const pontos = listas[indice];

    if (pontos.length < 2) continue;

    if (indice % 2 === 0) {
      stroke(255, 188, 105);
    } else {
      stroke(255, 218, 145);
    }

    beginShape();

    for (const ponto of pontos) {
      vertex(ponto.x, ponto.y, 75);
    }

    endShape();
  }

  noStroke();
}

function desenharPainel() {
  painel.clear();
  painel.noStroke();

  if (!pronto) {
    painel.fill("#edf7ff");
    painel.textAlign(CENTER, CENTER);
    painel.textSize(23);

    painel.text(
      falhou
        ? "Falha ao carregar as bibliotecas"
        : "Carregando jogo...",
      L / 2,
      A / 2
    );

    return;
  }

  painel.fill(10, 20, 37, 236);
  painel.rect(12, 12, 936, 94, 14);

  painel.textAlign(LEFT, TOP);
  painel.textStyle(BOLD);
  painel.fill("#e8f7ff");
  painel.textSize(24);

  painel.text("TRAÇO", 28, 24);

  painel.fill("#91dbea");
  painel.textSize(13);

  painel.text(
    fases[faseAtual].nome,
    28,
    66
  );

  painel.textStyle(NORMAL);
  painel.fill("#d4e3ef");
  painel.textSize(14);

  painel.text(
    fases[faseAtual].instrucao,
    234,
    24
  );

  painel.fill("#9bb7cc");
  painel.textSize(12);

  painel.text(
    "Setas / A D: andar    Espaço: pular    Mouse: desenhar    R: reiniciar",
    234,
    47
  );

  const concluidos = checkpoints.filter(Boolean).length;

  painel.fill(
    checkpoints.every(Boolean)
      ? "#a6f5c5"
      : "#ffd6a3"
  );

  painel.textSize(14);

  painel.text(
    "Travessias com desenho: " +
    concluidos +
    "/" +
    checkpoints.length,
    234,
    68
  );

  if (estado === "jogando") {
    painel.fill(9, 20, 37, 218);
    painel.rect(280, 117, 400, 43, 11);

    painel.textAlign(CENTER, CENTER);

    painel.fill(
      checkpoints.every(Boolean)
        ? "#a5ffd0"
        : "#ffd4a2"
    );

    painel.textSize(15);

    painel.text(
      checkpoints.every(Boolean)
        ? "Portal verde! Chegue até ele."
        : "Portal vermelho: use seu desenho no buraco.",
      480,
      138
    );
  }

  if (estado === "desenhando") {
    const restante = Math.max(
      0,
      DURACAO - (millis() - inicioDesenho)
    );

    painel.fill(9, 20, 39, 243);
    painel.rect(260, 115, 440, 118, 13);

    painel.textAlign(CENTER, CENTER);
    painel.textStyle(BOLD);
    painel.fill("#ffcf8c");
    painel.textSize(23);

    painel.text(
      "MODO DESENHO",
      480,
      138
    );

    painel.textStyle(NORMAL);
    painel.textSize(18);

    painel.text(
      (restante / 1000).toFixed(1) +
      " segundos",
      480,
      171
    );

    painel.fill("#31465b");
    painel.rect(290, 193, 380, 10, 6);

    painel.fill("#f7b86c");

    painel.rect(
      290,
      193,
      380 * restante / DURACAO,
      10,
      6
    );

    painel.fill("#c8dce8");
    painel.textSize(12);

    painel.text(
      "Traços: " +
      gestos.length +
      "    Tinta: " +
      Math.floor(TINTA_MAX - tintaUsada) +
      "    Enter: finalizar    C: limpar",
      480,
      221
    );

    painel.text(
      "Solte e clique novamente para desenhar mais um traço",
      480,
      255
    );
  }

  if (
    estado === "jogando" &&
    millis() < avisoAte
  ) {
    painel.fill(8, 19, 36, 225);
    painel.rect(215, 545, 530, 42, 10);

    painel.textAlign(CENTER, CENTER);
    painel.textSize(13);
    painel.fill("#d5edf7");

    painel.text(
      aviso,
      480,
      566
    );
  }

  if (estado === "vitoria") {
    painel.fill(8, 16, 29, 216);
    painel.rect(0, 0, L, A);

    painel.fill("#193448");
    painel.stroke("#78e9ca");
    painel.strokeWeight(2);

    painel.rect(
      190,
      210,
      580,
      178,
      18
    );

    painel.noStroke();
    painel.textAlign(CENTER, CENTER);
    painel.textStyle(BOLD);
    painel.fill("#b9ffe5");
    painel.textSize(33);

    painel.text(
      faseAtual === fases.length - 1
        ? "VOCÊ VENCEU!"
        : "FASE CONCLUÍDA!",
      480,
      273
    );

    painel.textStyle(NORMAL);
    painel.fill("#dcecf5");
    painel.textSize(17);

    painel.text(
      faseAtual === fases.length - 1
        ? "Enter para jogar novamente"
        : "Enter para a próxima fase",
      480,
      333
    );
  }
}

function moverPersonagem() {
  const esquerda =
    teclas.has("arrowleft") ||
    teclas.has("a");

  const direita =
    teclas.has("arrowright") ||
    teclas.has("d");

  const movimento =
    Number(direita) -
    Number(esquerda);

  if (movimento !== 0) {
    direcao = movimento;
  }

  const velocidadeX = lerp(
    personagem.velocity.x,
    movimento * VELOCIDADE,
    ACELERACAO
  );

  Matter.Body.setVelocity(
    personagem,
    {
      x: velocidadeX,
      y: personagem.velocity.y
    }
  );

  const pulando =
    teclas.has(" ") ||
    teclas.has("arrowup") ||
    teclas.has("w");

  if (
    pulando &&
    !puloAnterior &&
    personagemNoChao()
  ) {
    Matter.Body.setVelocity(
      personagem,
      {
        x: velocidadeX,
        y: PULO
      }
    );
  }

  puloAnterior = pulando;

  if (
    personagem.position.x < 15 ||
    personagem.position.x > L - 15
  ) {
    Matter.Body.setPosition(
      personagem,
      {
        x: constrain(
          personagem.position.x,
          15,
          L - 15
        ),
        y: personagem.position.y
      }
    );
  }

  if (personagem.position.y > A + 110) {
    reiniciarPersonagem();
  }
}

function atualizarFisica() {
  const agora = millis();

  acumulador += constrain(
    agora - ultimoFrame,
    0,
    50
  );

  ultimoFrame = agora;

  let passos = 0;

  while (
    acumulador >= PASSO &&
    passos < 3
  ) {
    Matter.Engine.update(
      motor,
      PASSO
    );

    acumulador -= PASSO;
    passos++;
  }

  for (const objeto of objetos) {
    const corpo = objeto.corpo;

    if (corpo.isSleeping) continue;

    if (
      corpo.speed < 0.16 &&
      Math.abs(corpo.angularVelocity) < 0.003
    ) {
      objeto.quadrosParado++;
    } else {
      objeto.quadrosParado = 0;
    }

    if (objeto.quadrosParado > 35) {
      const outros = Matter.Composite
        .allBodies(mundo)
        .filter(
          outro =>
            outro !== corpo &&
            outro !== personagem
        );

      const tocando = Matter.Query.collides(
        corpo,
        outros
      ).length > 0;

      if (tocando) {
        Matter.Body.setVelocity(
          corpo,
          {x: 0, y: 0}
        );

        Matter.Body.setAngularVelocity(
          corpo,
          0
        );

        Matter.Sleeping.set(
          corpo,
          true
        );

        objeto.quadrosParado = 0;
      }
    }
  }
}

function personagemNoChao() {
  const posicao = personagem.position;

  const sensor = Matter.Bodies.rectangle(
    posicao.x,
    posicao.y + 24,
    22,
    6,
    {isSensor: true}
  );

  const outros = Matter.Composite
    .allBodies(mundo)
    .filter(
      corpo => corpo !== personagem
    );

  const contatos = Matter.Query.collides(
    sensor,
    outros
  );

  return contatos.some(contato => {
    const corpo =
      contato.bodyA === sensor
        ? contato.bodyB
        : contato.bodyA;

    return (
      corpo.bounds.min.y >=
      posicao.y + 9
    );
  });
}

function reiniciarPersonagem() {
  const inicio = fases[faseAtual].inicio;

  Matter.Body.setPosition(
    personagem,
    {
      x: inicio[0],
      y: inicio[1]
    }
  );

  Matter.Body.setVelocity(
    personagem,
    {
      x: 0,
      y: 0
    }
  );

  puloAnterior = false;
}

function verificarChegada() {
  const meta = fases[faseAtual].meta;

  const pertoDoPortal =
    Math.abs(
      personagem.position.x - meta[0]
    ) < 32 &&
    Math.abs(
      personagem.position.y -
      (meta[1] - 23)
    ) < 65;

  if (!pertoDoPortal) return;

  if (checkpoints.every(Boolean)) {
    estado = "vitoria";
  } else if (millis() > avisoAte) {
    avisar(
      "Para liberar o portal, encoste no seu traço no meio de cada buraco.",
      2800
    );
  }
}

function iniciarDesenho() {
  gestos = [];
  gestoAtual = [];
  tintaUsada = 0;
  inicioDesenho = millis();
  estado = "desenhando";
}

function adicionarPonto(x, y) {
  if (
    estado !== "desenhando" ||
    !Number.isFinite(x) ||
    !Number.isFinite(y)
  ) {
    return;
  }

  x = constrain(x, 10, L - 10);
  y = constrain(y, 112, A - 12);

  const anterior =
    gestoAtual[gestoAtual.length - 1];

  if (!anterior) {
    gestoAtual.push({x, y});
    return;
  }

  const comprimento = Math.hypot(
    x - anterior.x,
    y - anterior.y
  );

  if (comprimento < 3) return;

  const permitido = Math.min(
    comprimento,
    TINTA_MAX - tintaUsada
  );

  if (permitido <= 0) return;

  const passos = Math.ceil(
    permitido / 8
  );

  for (
    let indice = 1;
    indice <= passos;
    indice++
  ) {
    const t =
      permitido *
      indice /
      passos /
      comprimento;

    gestoAtual.push({
      x:
        anterior.x +
        (x - anterior.x) * t,

      y:
        anterior.y +
        (y - anterior.y) * t
    });
  }

  tintaUsada += permitido;
}

function guardarGesto() {
  if (gestoAtual.length >= 2) {
    gestos.push(
      gestoAtual.map(ponto => ({
        x: ponto.x,
        y: ponto.y
      }))
    );
  }

  gestoAtual = [];
}

function simplificar(pontos) {
  if (pontos.length <= 2) {
    return pontos.slice();
  }

  const resultado = [pontos[0]];

  for (
    let indice = 1;
    indice < pontos.length - 1;
    indice++
  ) {
    const anterior =
      resultado[resultado.length - 1];

    const ponto = pontos[indice];

    if (
      Math.hypot(
        ponto.x - anterior.x,
        ponto.y - anterior.y
      ) >= 17
    ) {
      resultado.push(ponto);
    }
  }

  const fim = pontos[pontos.length - 1];

  const anterior =
    resultado[resultado.length - 1];

  if (
    Math.hypot(
      fim.x - anterior.x,
      fim.y - anterior.y
    ) > 3
  ) {
    resultado.push(fim);
  }

  return resultado;
}

function gerarContorno(pontos, espessura) {
  const esquerda = [];
  const direita = [];
  const raio = espessura / 2;

  for (
    let indice = 0;
    indice < pontos.length;
    indice++
  ) {
    const anterior = pontos[
      Math.max(0, indice - 1)
    ];

    const seguinte = pontos[
      Math.min(
        pontos.length - 1,
        indice + 1
      )
    ];

    let dx = seguinte.x - anterior.x;
    let dy = seguinte.y - anterior.y;
    let tamanho = Math.hypot(dx, dy);

    if (tamanho < 0.001) {
      dx = 1;
      dy = 0;
      tamanho = 1;
    }

    const nx = -dy / tamanho;
    const ny = dx / tamanho;

    esquerda.push({
      x: pontos[indice].x + nx * raio,
      y: pontos[indice].y + ny * raio
    });

    direita.push({
      x: pontos[indice].x - nx * raio,
      y: pontos[indice].y - ny * raio
    });
  }

  return [
    ...esquerda,
    ...direita.reverse()
  ];
}

function criarObjeto(pontos, cor) {
  const reduzidos = simplificar(pontos);

  if (reduzidos.length < 2) {
    return false;
  }

  const contorno = gerarContorno(
    reduzidos,
    ESPESSURA
  );

  const centro = Matter.Vertices.centre(
    contorno
  );

  if (
    !Number.isFinite(centro.x) ||
    !Number.isFinite(centro.y)
  ) {
    return false;
  }

  let corpo;

  try {
    corpo = Matter.Bodies.fromVertices(
      centro.x,
      centro.y,
      [contorno],
      {
        friction: 0.8,
        frictionStatic: 1,
        frictionAir: 0.02,
        restitution: 0,
        density: 0.001,
        slop: 0.04,
        sleepThreshold: 30,
        label: "traco"
      },
      true,
      0.01,
      8,
      0.01
    );
  } catch (e) {
    return false;
  }

  if (!corpo) return false;

  const pontosLocais = pontos.map(
    ponto => ({
      x:
        ponto.x -
        corpo.position.x,

      y:
        ponto.y -
        corpo.position.y
    })
  );

  Matter.Composite.add(
    mundo,
    corpo
  );

  objetos.push({
    corpo,
    pontos: pontosLocais,
    cor,
    quadrosParado: 0
  });

  return true;
}

function finalizarDesenho() {
  if (estado !== "desenhando") return;

  if (desenhando) {
    guardarGesto();
  }

  desenhando = false;
  ponteiroAtivo = null;
  estado = "jogando";
  ultimoFrame = millis();
  acumulador = 0;

  const cores = [
    [125, 225, 215],
    [245, 192, 115],
    [190, 155, 245],
    [145, 230, 160],
    [240, 145, 180]
  ];

  let quantidade = 0;

  for (const pontos of gestos) {
    const cor =
      cores[
        objetos.length % cores.length
      ];

    if (criarObjeto(pontos, cor)) {
      quantidade++;
    }
  }

  gestos = [];
  gestoAtual = [];

  avisar(
    quantidade
      ? quantidade +
        " desenho(s) criado(s). Atravesse usando os traços!"
      : "Nenhum traço criado.",
    3500
  );
}

function avisar(texto, duracao = 3000) {
  aviso = texto;
  avisoAte = millis() + duracao;
}
