// Artefato 2 - Cidade Cyberpunk Generativa
// Autor: Pedro Elias
//
// Sketch estático e generativo.
// A estrutura da cidade segue regras de perspectiva,
// enquanto os detalhes variam a cada execução.

let neonCiano;
let neonRosa;
let neonRoxo;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();

  neonCiano = color(0, 220, 245);
  neonRosa = color(245, 25, 165);
  neonRoxo = color(155, 35, 235);
}

function draw() {
  background(7, 7, 18);
  noStroke();

  let cx = width / 2;
  let horizonte = height * 0.48;

  desenharCeu(cx, horizonte);
  desenharSkyline(cx, horizonte);

  desenharPrediosEsquerda(cx, horizonte);
  desenharPrediosDireita(cx, horizonte);

  desenharRua(cx, horizonte);
  desenharReflexos(cx, horizonte);
  desenharFaixas(cx, horizonte);

  desenharChuva();
}


// ============================================================
// CÉU
// ============================================================

function desenharCeu(cx, horizonte) {

  fill(10, 7, 27);
  rect(0, 0, width, horizonte);

  fill(35, 10, 55);
  quad(
    width * 0.28, horizonte * 0.58,
    width * 0.72, horizonte * 0.58,
    width * 0.62, horizonte,
    width * 0.38, horizonte
  );

  fill(70, 15, 90, 65);
  quad(
    width * 0.38, horizonte * 0.70,
    width * 0.62, horizonte * 0.70,
    width * 0.56, horizonte,
    width * 0.44, horizonte
  );
}


// ============================================================
// SKYLINE DISTANTE
// ============================================================

function desenharSkyline(cx, horizonte) {

  let quantidade = floor(random(9, 15));

  let areaInicio = width * 0.32;
  let areaFim = width * 0.68;

  let larguraArea = areaFim - areaInicio;
  let larguraPredio = larguraArea / quantidade;

  for (let i = 0; i < quantidade; i++) {

    let x = areaInicio + i * larguraPredio;

    let altura = random(
      height * 0.10,
      height * 0.27
    );

    let topo = horizonte - altura;

    fill(
      random(14, 27),
      random(11, 20),
      random(30, 48)
    );

    rect(
      x,
      topo,
      larguraPredio + 2,
      altura
    );

    if (random() < 0.30) {

      fill(45, 25, 60);

      rect(
        x + larguraPredio / 2,
        topo - random(15, 40),
        2,
        random(15, 40)
      );
    }

    for (let y = topo + 15; y < horizonte - 10; y += 18) {

      if (random() < 0.65) {

        escolherNeon();

        rect(
          x + larguraPredio * 0.23,
          y,
          larguraPredio * 0.18,
          6
        );
      }

      if (random() < 0.60) {

        escolherNeon();

        rect(
          x + larguraPredio * 0.60,
          y,
          larguraPredio * 0.18,
          6
        );
      }
    }
  }
}


// ============================================================
// PRÉDIOS ESQUERDOS
// ============================================================

function desenharPrediosEsquerda(cx, horizonte) {

  let camadas = [0.20, 0.36, 0.55, 0.78, 1.0];

  for (let i = 0; i < camadas.length; i++) {

    let d = camadas[i];

    let direita = lerp(cx - width * 0.04, 0, d);
    let esquerda = lerp(cx - width * 0.11, 0, d);

    let baseDireita = lerp(
      horizonte,
      height * 0.90,
      d
    );

    let baseEsquerda = lerp(
      horizonte,
      height,
      d
    );

    let alturaBase = lerp(
      height * 0.13,
      height * 0.68,
      d
    );

    let variacao = random(
      -height * 0.04,
      height * 0.05
    );

    let topoDireita =
      horizonte - alturaBase + variacao;

    let topoEsquerda =
      topoDireita - random(5, 30);

    // Corpo principal
    fill(
      random(11, 20),
      random(12, 21),
      random(26, 40)
    );

    quad(
      esquerda, topoEsquerda,
      direita, topoDireita,
      direita, baseDireita,
      esquerda, baseEsquerda
    );

    // Face lateral mais clara
    fill(
      random(18, 28),
      random(16, 25),
      random(35, 50)
    );

    let faixa = lerp(5, 24, d);

    quad(
      direita - faixa, topoDireita,
      direita, topoDireita,
      direita, baseDireita,
      direita - faixa * 0.65, baseDireita - 8
    );

    desenharJanelasEsquerda(
      esquerda,
      direita,
      topoEsquerda,
      topoDireita,
      baseDireita,
      d
    );

    if (random() < 0.55 && d > 0.30) {
      desenharPlacaEsquerda(
        esquerda,
        direita,
        topoEsquerda,
        baseDireita,
        d
      );
    }

    if (random() < 0.28 && d > 0.45) {
      desenharPlacaHorizontalEsquerda(
        esquerda,
        direita,
        topoEsquerda,
        baseDireita,
        d
      );
    }
  }
}


// ============================================================
// PRÉDIOS DIREITOS
// ============================================================

function desenharPrediosDireita(cx, horizonte) {

  let camadas = [0.20, 0.36, 0.55, 0.78, 1.0];

  for (let i = 0; i < camadas.length; i++) {

    let d = camadas[i];

    let esquerda = lerp(
      cx + width * 0.04,
      width,
      d
    );

    let direita = lerp(
      cx + width * 0.11,
      width,
      d
    );

    let baseEsquerda = lerp(
      horizonte,
      height * 0.90,
      d
    );

    let baseDireita = lerp(
      horizonte,
      height,
      d
    );

    let alturaBase = lerp(
      height * 0.13,
      height * 0.68,
      d
    );

    let variacao = random(
      -height * 0.04,
      height * 0.05
    );

    let topoEsquerda =
      horizonte - alturaBase + variacao;

    let topoDireita =
      topoEsquerda - random(5, 30);

    // Corpo principal
    fill(
      random(11, 20),
      random(12, 21),
      random(26, 40)
    );

    quad(
      esquerda, topoEsquerda,
      direita, topoDireita,
      direita, baseDireita,
      esquerda, baseEsquerda
    );

    // Face lateral
    fill(
      random(18, 28),
      random(16, 25),
      random(35, 50)
    );

    let faixa = lerp(5, 24, d);

    quad(
      esquerda, topoEsquerda,
      esquerda + faixa, topoEsquerda,
      esquerda + faixa * 0.65, baseEsquerda - 8,
      esquerda, baseEsquerda
    );

    desenharJanelasDireita(
      esquerda,
      direita,
      topoEsquerda,
      topoDireita,
      baseEsquerda,
      d
    );

    if (random() < 0.55 && d > 0.30) {
      desenharPlacaDireita(
        esquerda,
        direita,
        topoDireita,
        baseEsquerda,
        d
      );
    }

    if (random() < 0.28 && d > 0.45) {
      desenharPlacaHorizontalDireita(
        esquerda,
        direita,
        topoDireita,
        baseEsquerda,
        d
      );
    }
  }
}


// ============================================================
// JANELAS ESQUERDAS
// ============================================================

function desenharJanelasEsquerda(
  esquerda,
  direita,
  topoE,
  topoD,
  base,
  d
) {

  let margem = (direita - esquerda) * 0.12;

  let inicioX = esquerda + margem;
  let fimX = direita - margem;

  let larguraDisponivel = fimX - inicioX;

  if (larguraDisponivel < 15) {
    return;
  }

  let colunas = d > 0.65 ? 4 : 2;
  let linhas = floor(lerp(2, 7, d));

  for (let linha = 0; linha < linhas; linha++) {

    let tY = (linha + 1) / (linhas + 2);

    let y = lerp(
      (topoE + topoD) / 2,
      base,
      tY
    );

    for (let coluna = 0; coluna < colunas; coluna++) {

      if (random() < 0.18) {
        continue;
      }

      let tamanhoCelula =
        larguraDisponivel / colunas;

      let x =
        inicioX +
        coluna * tamanhoCelula +
        tamanhoCelula * 0.16;

      let w =
        tamanhoCelula * 0.50;

      let h =
        lerp(5, 20, d);

      escolherNeon();

      quad(
        x, y,
        x + w, y + 2,
        x + w + 2, y + h,
        x + 1, y + h - 1
      );
    }
  }
}


// ============================================================
// JANELAS DIREITAS
// ============================================================

function desenharJanelasDireita(
  esquerda,
  direita,
  topoE,
  topoD,
  base,
  d
) {

  let margem = (direita - esquerda) * 0.12;

  let inicioX = esquerda + margem;
  let fimX = direita - margem;

  let larguraDisponivel = fimX - inicioX;

  if (larguraDisponivel < 15) {
    return;
  }

  let colunas = d > 0.65 ? 4 : 2;
  let linhas = floor(lerp(2, 7, d));

  for (let linha = 0; linha < linhas; linha++) {

    let tY = (linha + 1) / (linhas + 2);

    let y = lerp(
      (topoE + topoD) / 2,
      base,
      tY
    );

    for (let coluna = 0; coluna < colunas; coluna++) {

      if (random() < 0.18) {
        continue;
      }

      let tamanhoCelula =
        larguraDisponivel / colunas;

      let x =
        inicioX +
        coluna * tamanhoCelula +
        tamanhoCelula * 0.16;

      let w =
        tamanhoCelula * 0.50;

      let h =
        lerp(5, 20, d);

      escolherNeon();

      quad(
        x, y + 2,
        x + w, y,
        x + w - 1, y + h - 1,
        x - 2, y + h
      );
    }
  }
}


// ============================================================
// PLACAS VERTICAIS
// ============================================================

function desenharPlacaEsquerda(
  esquerda,
  direita,
  topo,
  base,
  d
) {

  let larguraPredio = direita - esquerda;

  if (larguraPredio < 30) {
    return;
  }

  let x =
    lerp(esquerda, direita, random(0.25, 0.55));

  let y =
    lerp(topo, base, random(0.20, 0.45));

  let w =
    lerp(15, 45, d);

  let h =
    lerp(30, 90, d);

  escolherNeon();

  quad(
    x, y,
    x + w, y + 4,
    x + w + 3, y + h,
    x + 2, y + h - 3
  );

  fill(220, 180, 245, 150);

  quad(
    x + w * 0.25,
    y + h * 0.15,

    x + w * 0.70,
    y + h * 0.18,

    x + w * 0.72,
    y + h * 0.80,

    x + w * 0.28,
    y + h * 0.77
  );
}


function desenharPlacaDireita(
  esquerda,
  direita,
  topo,
  base,
  d
) {

  let larguraPredio = direita - esquerda;

  if (larguraPredio < 30) {
    return;
  }

  let x =
    lerp(esquerda, direita, random(0.25, 0.55));

  let y =
    lerp(topo, base, random(0.20, 0.45));

  let w =
    lerp(15, 45, d);

  let h =
    lerp(30, 90, d);

  escolherNeon();

  quad(
    x, y + 4,
    x + w, y,
    x + w - 2, y + h - 3,
    x - 3, y + h
  );

  fill(220, 180, 245, 150);

  quad(
    x + w * 0.30,
    y + h * 0.18,

    x + w * 0.75,
    y + h * 0.15,

    x + w * 0.72,
    y + h * 0.77,

    x + w * 0.27,
    y + h * 0.80
  );
}


// ============================================================
// PLACAS HORIZONTAIS
// ============================================================

function desenharPlacaHorizontalEsquerda(
  esquerda,
  direita,
  topo,
  base,
  d
) {

  let larguraPredio = direita - esquerda;

  if (larguraPredio < 45) {
    return;
  }

  let y = lerp(topo, base, random(0.50, 0.72));

  let x = esquerda + larguraPredio * 0.15;
  let w = larguraPredio * random(0.50, 0.72);
  let h = lerp(10, 26, d);

  escolherNeon();

  quad(
    x, y,
    x + w, y + 2,
    x + w + 2, y + h,
    x + 1, y + h
  );
}


function desenharPlacaHorizontalDireita(
  esquerda,
  direita,
  topo,
  base,
  d
) {

  let larguraPredio = direita - esquerda;

  if (larguraPredio < 45) {
    return;
  }

  let y = lerp(topo, base, random(0.50, 0.72));

  let x = esquerda + larguraPredio * 0.15;
  let w = larguraPredio * random(0.50, 0.72);
  let h = lerp(10, 26, d);

  escolherNeon();

  quad(
    x, y + 2,
    x + w, y,
    x + w - 1, y + h,
    x - 2, y + h
  );
}


// ============================================================
// RUA
// ============================================================

function desenharRua(cx, horizonte) {

  fill(6, 7, 13);

  quad(
    cx - width * 0.055, horizonte,
    cx + width * 0.055, horizonte,
    width * 0.80, height,
    width * 0.20, height
  );

  fill(19, 18, 29);

  quad(
    0, height,
    cx - width * 0.055, horizonte,
    cx - width * 0.10, horizonte,
    width * 0.15, height
  );

  quad(
    cx + width * 0.055, horizonte,
    width, height,
    width * 0.85, height,
    cx + width * 0.10, horizonte
  );
}


// ============================================================
// FAIXAS DA RUA
// ============================================================

function desenharFaixas(cx, horizonte) {

  fill(205, 205, 225);

  let segmentos = 4;

  for (let i = 0; i < segmentos; i++) {

    let t1 = 0.08 + i * 0.23;
    let t2 = t1 + 0.10;

    let y1 = lerp(horizonte, height, t1);
    let y2 = lerp(horizonte, height, t2);

    let distancia1 =
      lerp(width * 0.008, width * 0.10, t1);

    let distancia2 =
      lerp(width * 0.008, width * 0.10, t2);

    let largura1 =
      lerp(3, width * 0.015, t1);

    let largura2 =
      lerp(4, width * 0.022, t2);

    quad(
      cx - distancia1 - largura1, y1,
      cx - distancia1, y1,
      cx - distancia2, y2,
      cx - distancia2 - largura2, y2
    );

    quad(
      cx + distancia1, y1,
      cx + distancia1 + largura1, y1,
      cx + distancia2 + largura2, y2,
      cx + distancia2, y2
    );
  }
}


// ============================================================
// REFLEXOS
// ============================================================

function desenharReflexos(cx, horizonte) {

  let quantidade = floor(random(7, 12));

  for (let i = 0; i < quantidade; i++) {

    let lado = random() < 0.5 ? -1 : 1;

    let y1 =
      random(
        horizonte + height * 0.05,
        height * 0.78
      );

    let y2 =
      min(
        y1 + random(height * 0.025, height * 0.09),
        height
      );

    let progresso1 =
      map(y1, horizonte, height, 0, 1);

    let progresso2 =
      map(y2, horizonte, height, 0, 1);

    let xCentro1 =
      cx +
      lado *
      lerp(
        width * 0.035,
        width * 0.25,
        progresso1
      );

    let xCentro2 =
      cx +
      lado *
      lerp(
        width * 0.04,
        width * 0.28,
        progresso2
      );

    escolherNeonTransparente();

    let w1 = random(3, 12);
    let w2 = random(8, 28);

    quad(
      xCentro1 - w1, y1,
      xCentro1 + w1, y1,
      xCentro2 + w2, y2,
      xCentro2 - w2, y2
    );
  }
}


// ============================================================
// CHUVA
// ============================================================

function desenharChuva() {

  fill(120, 170, 215, 100);

  let quantidade =
    floor(
      map(
        width,
        500,
        1920,
        25,
        65,
        true
      )
    );

  for (let i = 0; i < quantidade; i++) {

    let x = random(width);
    let y = random(height);

    let tamanho =
      random(
        height * 0.025,
        height * 0.07
      );

    let espessura =
      random(1.5, 3);

    quad(
      x, y,
      x + espessura, y,
      x - tamanho * 0.20 + espessura,
      y + tamanho,
      x - tamanho * 0.20,
      y + tamanho
    );
  }
}


// ============================================================
// CORES NEON
// ============================================================

function escolherNeon() {

  let escolha = floor(random(3));

  if (escolha === 0) {
    fill(neonCiano);
  }

  else if (escolha === 1) {
    fill(neonRosa);
  }

  else {
    fill(neonRoxo);
  }
}


function escolherNeonTransparente() {

  let escolha = floor(random(3));

  if (escolha === 0) {
    fill(0, 220, 245, random(30, 60));
  }

  else if (escolha === 1) {
    fill(245, 25, 165, random(30, 60));
  }

  else {
    fill(155, 35, 235, random(30, 60));
  }
}


// ============================================================
// REDIMENSIONAMENTO
// ============================================================

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}