

// ============================================================
// ÁGUA-VIVA
// ============================================================
// A água-viva fica PARADA enquanto o sketch está aberto.
//
// Cada vez que a página é ATUALIZADA, ela dá um novo "passo"
// e aparece em uma nova posição.
//
// A posição é guardada no localStorage para que o próximo
// carregamento continue de onde o anterior parou.
// ============================================================

let x;
let y;
let passo;

// ------------------------------------------------------------
// CONFIGURAÇÃO
// ------------------------------------------------------------
function setup() {

  createCanvas(windowWidth, windowHeight);

  // Verifica se já existe uma posição salva
  let memoria = localStorage.getItem("aguaViva");

  if (memoria != null) {

    let dados = JSON.parse(memoria);

    x = dados.x;
    y = dados.y;
    passo = dados.passo + 1;

  } else {

    // Primeira vez: começa no centro
    x = width / 2;
    y = height / 2;

    passo = 0;
  }

  // ----------------------------------------------------------
  // CADA EXECUÇÃO DO SKETCH = UM MOVIMENTO
  // ----------------------------------------------------------

  x = x + 35;

  // Movimento vertical suave e diferente a cada atualização
  y = y + sin(passo * 0.7) * 15;

  // Se sair pela direita, volta para a esquerda
  if (x > width + 80) {
    x = -80;
  }

  // Mantém dentro da tela
  if (y < 100) {
    y = 100;
  }

  if (y > height - 100) {
    y = height - 100;
  }

  // Salva a nova posição
  localStorage.setItem(
    "aguaViva",
    JSON.stringify({
      x: x,
      y: y,
      passo: passo
    })
  );
}

// ------------------------------------------------------------
// DESENHO
// ------------------------------------------------------------
function draw() {

  background(8, 25, 55);

  desenharAguaViva(x, y);
}

// ------------------------------------------------------------
// DESENHA A ÁGUA-VIVA
// ------------------------------------------------------------
function desenharAguaViva(px, py) {

  push();

  translate(px, py);

  // ----------------------------------------------------------
  // TENTÁCULOS
  // ----------------------------------------------------------

  stroke(210, 190, 255, 190);
  strokeWeight(3);
  noFill();

  for (let i = -3; i <= 3; i++) {

    let inicioX = i * 13;

    beginShape();

    // Tentáculo formado por segmentos
    for (let j = 0; j < 7; j++) {

      let altura = j * 10;

      let onda =
        sin(passo * 0.8 + i * 0.8 + j) * 5;

      vertex(
        inicioX + onda,
        altura
      );
    }

    endShape();
  }

  // ----------------------------------------------------------
  // CORPO
  // ----------------------------------------------------------

  noStroke();

  fill(180, 120, 255, 190);

  ellipse(0, -25, 110, 75);

  // Parte inferior
  fill(145, 85, 220, 190);

  ellipse(0, -8, 85, 32);

  // ----------------------------------------------------------
  // BRILHO
  // ----------------------------------------------------------

  fill(245, 225, 255, 110);

  ellipse(-20, -42, 30, 18);

  // ----------------------------------------------------------
  // DETALHES
  // ----------------------------------------------------------

  stroke(245, 220, 255, 180);
  strokeWeight(2);

  line(-28, -15, -15, 2);
  line(-10, -18, -5, 5);
  line(10, -18, 5, 5);
  line(28, -15, 15, 2);

  pop();
}

// ------------------------------------------------------------
// REDIMENSIONAMENTO
// ------------------------------------------------------------
function windowResized() {

  resizeCanvas(windowWidth, windowHeight);
}

