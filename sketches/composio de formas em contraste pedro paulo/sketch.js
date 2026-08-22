let listaDistTopo = [];
let listaDistBase = [];
let coresAzuis = [];
let circulos = [];

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('display', 'block');
  gerarFormas();
}

function gerarFormas() {
  listaDistTopo = [];
  listaDistBase = [];
  coresAzuis = [];
  circulos = [];

  // --- Referência única de escala, baseada na menor dimensão da tela ---
  // Isso garante que os elementos guardem a MESMA proporção visual
  // tanto em telas largas (desktop) quanto estreitas (celular retrato).
  let escala = min(width, height);

  // --- PARTE 1: FAIXAS AZUIS ---
  let distMin = escala * 0.005;
  let distMax = escala * 0.08;
  let distMedMin = escala * 0.001;
  let distMedMax = escala * 0.005;

  let somaTopo = 0;
  let somaBase = 0;

  while (somaTopo < width || somaBase < width) {
    let dTopo = random(distMin, distMax);
    let dBase = random(distMin, distMax);
    let dMed1 = random(distMedMin, distMedMax);
    let dMed2 = random(distMedMin, distMedMax);

    listaDistTopo.push(dTopo);
    listaDistTopo.push(dMed1);

    listaDistBase.push(dBase);
    listaDistBase.push(dMed2);

    somaTopo += dTopo + dMed1;
    somaBase += dBase + dMed2;

    coresAzuis.push(color(random(0, 50), random(50, 150), random(150, 255), random(100, 200)));
  }

  // --- PARTE 2: CÍRCULOS GRANDES SEM SOBREPOSIÇÃO ---

  // Quantidade agora é calculada em cima da MESMA escala usada no raio,
  // em vez de um divisor fixo (360000) desconectado da proporção da tela.
  // area de referência = escala², assim a densidade fica consistente
  // independente de a tela ser larga, estreita, 2K ou 4K.
  let areaTela = width * height;
  let qtdDesejada = max(2, floor(areaTela / (escala * escala * 0.28)));

  let tentativas = 0;
  let limiteTentativas = 2000;

  while (circulos.length < qtdDesejada && tentativas < limiteTentativas) {
    let raio = random(escala * 0.075, escala * 0.175);

    let x = random(raio, width - raio);
    let y = random(raio, height - raio);

    let sobrepoe = false;

    for (let c of circulos) {
      let distanciaCentros = dist(x, y, c.x, c.y);
      let somaRaios = raio + (c.tamanho / 2);

      if (distanciaCentros < somaRaios + 5) {
        sobrepoe = true;
        break;
      }
    }

    if (!sobrepoe) {
      circulos.push({
        x: x,
        y: y,
        tamanho: raio * 2,
        transparencia: random(50, 230)
      });
    }

    tentativas++;
  }
}

function draw() {
  background(10);
  noStroke();

  // --- FAIXAS AZUIS ---
  let xTopoAtual = 0;
  let xBaseAtual = 0;
  for (let i = 0; i < listaDistTopo.length; i += 2) {
    fill(coresAzuis[i / 2]);
    let distTopo = listaDistTopo[i];
    let espacoTopo = listaDistTopo[i + 1];
    let distBase = listaDistBase[i];
    let espacoBase = listaDistBase[i + 1];

    quad(
      xTopoAtual, 0,
      xTopoAtual + distTopo, 0,
      xBaseAtual + distBase, height,
      xBaseAtual, height
    );

    xTopoAtual += distTopo + espacoTopo;
    xBaseAtual += distBase + espacoBase;
  }

  // --- CÍRCULOS ---
  for (let c of circulos) {
    fill(255, 220, 0, c.transparencia);
    circle(c.x, c.y, c.tamanho);
  }

  noLoop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  gerarFormas();
  loop();
}