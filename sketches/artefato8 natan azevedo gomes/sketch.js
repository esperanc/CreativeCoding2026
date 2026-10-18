// Pixels Girando
// A foto id 84 do picsum.photos aparece em preto e branco.
// Ao passar o mouse, os "pixels" (blocos da imagem) perto do cursor
// recuperam a cor original, crescem, arredondam e giram.
// Pixels mais fortes (mais brilhantes) giram mais rápido.
// Quando o mouse se afasta, eles voltam devagar ao normal.
//
// Interação:
//   mouse   -> devolve a cor e gira os pixels próximos

let img;       // foto original (colorida)
let imgCinza;  // cópia em preto e branco, usada como fundo
let celulas = [];

const W = 600;
const H = 600;
const TAM = 12;        // tamanho de cada "pixel" (bloco) em px
const RAIO = 70;       // raio de alcance do mouse
const CRESCER = 0.8;   // quanto o bloco cresce (0.8 = até 80% maior)

async function setup() {
  createCanvas(W, H);
  rectMode(CENTER);
  noStroke();

  // picsum.photos envia cabeçalhos CORS, então podemos ler os pixels
  img = await loadImage(`https://picsum.photos/id/84/${W}/${H}`);
  img.loadPixels();

  // cria uma cópia em tons de cinza para o fundo
  imgCinza = img.get();
  imgCinza.filter(GRAY);

  criarCelulas();
}

// divide a imagem em blocos e guarda a cor do centro de cada um
function criarCelulas() {
  celulas = [];
  for (let y = 0; y < H; y += TAM) {
    for (let x = 0; x < W; x += TAM) {
      const cx = x + TAM / 2;
      const cy = y + TAM / 2;
      const [r, g, b] = corEm(cx, cy);
      const brilho = (r + g + b) / 3;
      celulas.push({
        x: cx,
        y: cy,
        r, g, b,
        // força do pixel: mais brilho = gira mais rápido
        vel: map(brilho, 0, 255, 0.02, 0.35),
        ang: 0,      // ângulo atual
        ativ: 0,     // 0 = normal, 1 = totalmente ativado
      });
    }
  }
}

// lê a cor de um pixel direto do array de pixels da imagem
function corEm(x, y) {
  const ix = constrain(floor(x), 0, img.width - 1);
  const iy = constrain(floor(y), 0, img.height - 1);
  const i = 4 * (iy * img.width + ix);
  return [img.pixels[i], img.pixels[i + 1], img.pixels[i + 2]];
}

function draw() {
  // a foto em preto e branco como fundo
  image(imgCinza, 0, 0);

  const ativas = [];

  for (const c of celulas) {
    const d = dist(mouseX, mouseY, c.x, c.y);

    if (d < RAIO) {
      // perto do mouse: ativa (mais perto = mais forte)
      c.ativ = lerp(c.ativ, 1 - d / RAIO * 0.5, 0.2);
    } else {
      // longe: volta devagar ao normal
      c.ativ = lerp(c.ativ, 0, 0.04);
    }

    if (c.ativ > 0.02) {
      // gira proporcional à força do pixel e à ativação
      c.ang += c.vel * c.ativ;
      ativas.push(c);
    } else {
      // assenta no múltiplo de 90° mais próximo (quadrado fica "reto")
      const alvo = round(c.ang / HALF_PI) * HALF_PI;
      c.ang = lerp(c.ang, alvo, 0.2);
    }
  }

  // os mais ativados são desenhados por último, ficando por cima
  ativas.sort((a, b) => a.ativ - b.ativ);

  for (const c of ativas) {
    push();
    translate(c.x, c.y);
    rotate(c.ang);

    // cresce conforme a ativação
    const lado = TAM * (1 + CRESCER * c.ativ);
    // cantos arredondados (até 40% do lado; círculo perfeito esconderia o giro)
    const canto = lado * 0.4 * c.ativ;

    // sombra leve para o bloco "saltar" da foto
    fill(0, 60 * c.ativ);
    rect(2, 2, lado, lado, canto);

    // o pixel com a cor original da foto
    fill(c.r, c.g, c.b);
    rect(0, 0, lado, lado, canto);
    pop();
  }
}