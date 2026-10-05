let palavras = [];
let chuva = [];

const vocabulario = [
  "evapore",
  "suba",
  "flutue",
  "junte",
  "espere",
  "esfrie"
];

function setup() {
  createCanvas(800, 600);
  textFont("Arial");
  textAlign(CENTER, CENTER);

  // Garante que TODAS as palavras apareçam várias vezes
  for (let i = 0; i < 10; i++) {
    for (let palavra of vocabulario) {
      palavras.push(
        new Palavra(
          random(100, width - 100),
          random(height - 120, height - 60),
          palavra
        )
      );
    }
  }
}

function draw() {
  background(235, 242, 245);

  desenharTitulo();
  desenharChao();

  for (let p of palavras) {
    p.atualizar();
    p.mostrar();
  }

  // Chuva
  for (let i = chuva.length - 1; i >= 0; i--) {
    chuva[i].atualizar();
    chuva[i].mostrar();

    if (chuva[i].y > height - 55) {

      palavras.push(
        new Palavra(
          chuva[i].x,
          height - 60,
          "evapore"
        )
      );

      chuva.splice(i, 1);
    }
  }

  // Cria chuva automaticamente
  if (frameCount % 45 === 0) {
    chuva.push(
      new Gota(
        random(180, width - 180),
        random(190, 250)
      )
    );
  }

  desenharInstrucao();
}


// ==================================================
// PALAVRAS
// ==================================================

class Palavra {

  constructor(x, y, texto) {

    this.x = x;
    this.y = y;

    this.texto = texto;

    this.velocidade = random(0.4, 1);
    this.offset = random(1000);

    // Tempo usado pela palavra "espere"
    this.tempoEspera = random(60, 180);
  }


  atualizar() {

    // -------------------------
    // EVAPORE
    // -------------------------

    if (this.texto === "evapore") {

      this.y -= 0.8;

      this.x +=
        sin(frameCount * 0.03 + this.offset) * 0.4;

      // Ao chegar na nuvem vira "suba"
      if (this.y < 270) {
        this.texto = "suba";
      }
    }


    // -------------------------
    // SUBA
    // -------------------------

    else if (this.texto === "suba") {

      this.y -= 0.5;

      if (this.y < 220) {
        this.texto = "flutue";
      }
    }


    // -------------------------
    // FLUTUE
    // -------------------------

    else if (this.texto === "flutue") {

      this.y +=
        sin(frameCount * 0.03 + this.offset) * 0.3;

      this.x +=
        cos(frameCount * 0.02 + this.offset) * 0.3;
    }


    // -------------------------
    // JUNTE
    // -------------------------

    else if (this.texto === "junte") {

      // Vai lentamente para o centro da nuvem

      this.x +=
        (width / 2 - this.x) * 0.003;

      this.y +=
        (220 - this.y) * 0.003;
    }


    // -------------------------
    // ESPERE
    // -------------------------

    else if (this.texto === "espere") {

      // Fica parada por um tempo

      this.tempoEspera--;

      if (this.tempoEspera < 0) {
        this.y -= 0.3;
      }
    }


    // -------------------------
    // ESFRIE
    // -------------------------

    else if (this.texto === "esfrie") {

      // Sobe lentamente até a nuvem

      if (this.y > 200) {
        this.y -= 0.4;
      }

      else {

        this.x +=
          sin(frameCount * 0.015 + this.offset) * 0.2;
      }
    }


    // -------------------------
    // VENTO DO MOUSE
    // -------------------------

    let d =
      dist(mouseX, mouseY, this.x, this.y);

    if (d < 100) {

      if (mouseX > this.x) {
        this.x -= 1;
      }

      else {
        this.x += 1;
      }
    }


    this.x =
      constrain(this.x, 40, width - 40);
  }


  mostrar() {

    noStroke();

    // Cada palavra ganha uma aparência levemente diferente

    if (this.texto === "evapore") {
      fill(90, 120, 140, 160);
      textSize(13);
    }

    else if (this.texto === "suba") {
      fill(70, 100, 130, 190);
      textSize(14);
    }

    else if (this.texto === "flutue") {
      fill(40, 80, 120, 220);
      textSize(16);
    }

    else if (this.texto === "junte") {
      fill(30, 70, 110, 220);
      textSize(15);
    }

    else if (this.texto === "espere") {
      fill(100, 100, 120, 180);
      textSize(13);
    }

    else if (this.texto === "esfrie") {
      fill(50, 100, 150, 210);
      textSize(15);
    }

    text(
      this.texto,
      this.x,
      this.y
    );
  }
}


// ==================================================
// CHUVA
// ==================================================

class Gota {

  constructor(x, y) {

    this.x = x;
    this.y = y;

    this.velocidade =
      random(2, 4);
  }


  atualizar() {

    this.y +=
      this.velocidade;
  }


  mostrar() {

    fill(40, 90, 150);

    noStroke();

    textSize(13);

    text(
      "caia",
      this.x,
      this.y
    );
  }
}


// ==================================================
// INTERAÇÃO
// ==================================================

function mousePressed() {

  // Clique = calor / evaporação

  for (let i = 0; i < 6; i++) {

    palavras.push(
      new Palavra(
        mouseX + random(-40, 40),
        height - 60,
        "evapore"
      )
    );
  }
}


// ==================================================
// VISUAL
// ==================================================

function desenharTitulo() {

  fill(30);

  noStroke();

  textStyle(BOLD);
  textSize(22);

  text(
    "MANUAL DE INSTRUÇÕES PARA UMA NUVEM",
    width / 2,
    40
  );

  textStyle(NORMAL);

  fill(80);

  textSize(12);

  text(
    "uma tentativa de fabricar chuva usando palavras",
    width / 2,
    65
  );
}


function desenharChao() {

  stroke(100, 80);

  line(
    40,
    height - 45,
    width - 40,
    height - 45
  );

  noStroke();

  fill(80, 130);

  textSize(11);

  text(
    "CHÃO",
    65,
    height - 28
  );
}


function desenharInstrucao() {

  noStroke();

  fill(60, 130);

  textSize(11);

  text(
    "mova o mouse para criar vento • clique para evaporar palavras",
    width / 2,
    height - 20
  );
}