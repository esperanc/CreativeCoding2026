let caracteres = [];

const frase = `Have you heard of the critically acclaimed MMORPG FFXIV? With an expanded free trial which you can play through the entirety of A Realm Reborn, Heavensward, Stormblood, and the award-winning Shadowbringers expansion up to level 80 for free with no restrictions on playtime?`;

const TAMANHO = 8;

const ESPACO_X = 8;
const ESPACO_Y = 10;

const VELOCIDADE_FORMACAO = 0.06;

const CARACTERES_POR_FRAME = 4;

let pontos = [];

let indiceCaractere = 0;
let ultimoPonto = 0;

let mascara;
let mascarasLetras = [];

let letraHover = -1;

let tempoCor = 0;


// =====================================================
// SETUP
// =====================================================

function setup() {

  createCanvas(windowWidth, windowHeight);

  textFont("sans-serif");
  textAlign(CENTER, CENTER);
  textSize(TAMANHO);

  criarPontos();
}


// =====================================================
// DRAW
// =====================================================

function draw() {

  if (letraHover >= 0) {
    background(255);
  } else {
    background(8);
  }

  tempoCor += 1.5;

  formarFrase();

  for (let c of caracteres) {
    c.update();
    c.draw();
  }
}


// =====================================================
// CRIA AS MÁSCARAS DO FFXIV
// =====================================================

function criarPontos() {

  pontos = [];
  mascarasLetras = [];

  mascara = createGraphics(width, height);

  mascara.pixelDensity(1);

  mascara.background(0);

  mascara.fill(255);
  mascara.noStroke();

  mascara.textFont("sans-serif");
  mascara.textAlign(LEFT, CENTER);


  let tamanhoFFXIV = min(
    width * 0.75,
    height * 0.60
  );


  mascara.textSize(tamanhoFFXIV);


  // ---------------------------------------------------
  // Calcula a largura total
  // ---------------------------------------------------

  let larguras = [];

  let larguraTotal = 0;

  for (let i = 0; i < 5; i++) {

    let largura =
      mascara.textWidth("FFXIV"[i]);

    larguras.push(largura);

    larguraTotal += largura;
  }


  // ---------------------------------------------------
  // Posição inicial
  // ---------------------------------------------------

  let inicioX =
    width / 2 -
    larguraTotal / 2;

  let centroY =
    height / 2;


  // ---------------------------------------------------
  // Cria uma máscara individual para cada letra
  // ---------------------------------------------------

  for (let i = 0; i < 5; i++) {

    let m = createGraphics(width, height);

    m.pixelDensity(1);

    m.background(0);

    m.fill(255);
    m.noStroke();

    m.textFont("sans-serif");
    m.textAlign(LEFT, CENTER);
    m.textSize(tamanhoFFXIV);

    m.text(
      "FFXIV"[i],
      inicioX,
      centroY
    );

    m.loadPixels();

    mascarasLetras.push(m);

    inicioX += larguras[i];
  }


  // ---------------------------------------------------
  // Cria a máscara geral
  // ---------------------------------------------------

  mascara.background(0);

  inicioX =
    width / 2 -
    larguraTotal / 2;


  for (let i = 0; i < 5; i++) {

    mascara.text(
      "FFXIV"[i],
      inicioX,
      centroY
    );

    inicioX += larguras[i];
  }


  mascara.loadPixels();


  // ---------------------------------------------------
  // Percorre a máscara
  // ---------------------------------------------------

  for (
    let y = 20;
    y < height - 20;
    y += ESPACO_Y
  ) {

    for (
      let x = 20;
      x < width - 20;
      x += ESPACO_X
    ) {

      let index =
        4 * (x + y * width);


      if (
        mascara.pixels[index] > 128
      ) {

        let letra =
          descobrirLetra(x, y);


        if (letra >= 0) {

          pontos.push({
            x: x,
            y: y,
            letra: letra
          });

        }
      }
    }
  }
}


// =====================================================
// DESCOBRE A QUAL LETRA O PONTO PERTENCE
// =====================================================

function descobrirLetra(x, y) {

  for (let i = 0; i < 5; i++) {

    let m =
      mascarasLetras[i];


    let index =
      4 * (x + y * width);


    if (
      m.pixels[index] > 128
    ) {

      return i;
    }
  }


  return -1;
}


// =====================================================
// FORMA A FRASE
// =====================================================

function formarFrase() {

  for (
    let n = 0;
    n < CARACTERES_POR_FRAME;
    n++
  ) {

    // -----------------------------------------------
    // Chegou ao final da frase
    // -----------------------------------------------

    if (
      indiceCaractere >= frase.length
    ) {

      indiceCaractere = 0;
    }


    // -----------------------------------------------
    // Não existem mais pontos
    // -----------------------------------------------

    if (
      ultimoPonto >= pontos.length
    ) {

      return;
    }


    let caractere =
      frase[indiceCaractere];


    // -----------------------------------------------
    // Espaço
    // -----------------------------------------------

    if (
      caractere === " "
    ) {

      indiceCaractere++;

      continue;
    }


    // -----------------------------------------------
    // Procura um ponto
    // -----------------------------------------------

    let ponto =
      encontrarPontoParaCaractere();


    if (
      ponto === null
    ) {

      return;
    }


    // -----------------------------------------------
    // Cria o caractere
    // -----------------------------------------------

    caracteres.push(

      new CaractereFormado(
        caractere,
        ponto.x,
        ponto.y,
        ponto.letra
      )

    );


    indiceCaractere++;
  }
}


// =====================================================
// ENCONTRA O PRÓXIMO PONTO
// =====================================================

function encontrarPontoParaCaractere() {

  for (
    let i = ultimoPonto;
    i < pontos.length;
    i++
  ) {

    let ponto =
      pontos[i];


    if (
      pontoDisponivel(ponto)
    ) {

      ultimoPonto =
        i + 1;

      return ponto;
    }
  }


  return null;
}


// =====================================================
// VERIFICA SE O PONTO ESTÁ LIVRE
// =====================================================

function pontoDisponivel(ponto) {

  let distanciaMinima =
    TAMANHO * 0.75;


  for (
    let outro of caracteres
  ) {

    if (
      outro.alvoX === null
    ) {

      continue;
    }


    let dx =
      ponto.x -
      outro.alvoX;

    let dy =
      ponto.y -
      outro.alvoY;


    let distancia =
      sqrt(
        dx * dx +
        dy * dy
      );


    if (
      distancia <
      distanciaMinima
    ) {

      return false;
    }
  }


  return true;
}


// =====================================================
// CARACTERE FORMADO
// =====================================================

class CaractereFormado {

  constructor(
    valor,
    alvoX,
    alvoY,
    letra
  ) {

    this.valor = valor;

    this.alvoX = alvoX;
    this.alvoY = alvoY;

    // 0 = F
    // 1 = F
    // 2 = X
    // 3 = I
    // 4 = V

    this.letra = letra;

    // Começa em posição aleatória

    this.x = random(width);
    this.y = random(height);

    this.vx = 0;
    this.vy = 0;

    this.alpha = 0;
  }


  // ===================================================
  // MOVIMENTO
  // ===================================================

  update() {

    let dx =
      this.alvoX -
      this.x;

    let dy =
      this.alvoY -
      this.y;


    this.vx +=
      dx *
      VELOCIDADE_FORMACAO;

    this.vy +=
      dy *
      VELOCIDADE_FORMACAO;


    this.vx *= 0.80;
    this.vy *= 0.80;


    this.x += this.vx;
    this.y += this.vy;


    this.alpha =
      lerp(
        this.alpha,
        255,
        0.1
      );
  }


  // ===================================================
  // DESENHO
  // ===================================================

  draw() {
  
    push();
  
    textFont("sans-serif");
    textSize(TAMANHO);
  
    textAlign(
      CENTER,
      CENTER
    );
  
    noStroke();
  
  
    // =================================================
    // MOUSE SOBRE UMA LETRA
    // =================================================
  
    if (letraHover >= 0) {
  
      colorMode(
        HSB,
        360,
        100,
        100,
        255
      );
  
  
      // Gradiente de arco-íris
      let hue =
        (
          this.alvoX * 0.35 +
          this.alvoY * 0.15 +
          tempoCor
        ) % 360;
  
  
      // Pulsação
      let pulso =
        sin(
          frameCount * 0.08 +
          this.alvoX * 0.02 +
          this.alvoY * 0.02
        );
  
  
      let brilho =
        map(
          pulso,
          -1,
          1,
          65,
          100
        );
  
  
      fill(
        hue,
        85,
        brilho,
        this.alpha
      );
  
  
      text(
        this.valor,
        this.x,
        this.y
      );
  
  
      colorMode(
        RGB,
        255,
        255,
        255,
        255
      );
  
    }
  
  
    // =================================================
    // ESTADO NORMAL
    // =================================================
  
    else {
  
      fill(
        245,
        this.alpha
      );
  
  
      text(
        this.valor,
        this.x,
        this.y
      );
    }
  
  
    pop();
  }
}


// =====================================================
// MOUSE
// =====================================================

function mouseMoved() {

  letraHover = -1;


  for (let i = 0; i < 5; i++) {

    if (
      mouseSobreLetra(i)
    ) {

      letraHover = i;

      break;
    }
  }
}


// =====================================================
// DETECTA SE O MOUSE ESTÁ SOBRE A LETRA
// =====================================================

function mouseSobreLetra(numero) {

  if (
    mouseX < 0 ||
    mouseX >= width ||
    mouseY < 0 ||
    mouseY >= height
  ) {

    return false;
  }


  let m =
    mascarasLetras[numero];


  let x =
    floor(mouseX);

  let y =
    floor(mouseY);


  let index =
    4 * (x + y * width);


  return (
    m.pixels[index] > 128
  );
}


// =====================================================
// RESIZE
// =====================================================

function windowResized() {

  resizeCanvas(
    windowWidth,
    windowHeight
  );


  caracteres = [];

  pontos = [];

  indiceCaractere = 0;

  ultimoPonto = 0;

  criarPontos();
}