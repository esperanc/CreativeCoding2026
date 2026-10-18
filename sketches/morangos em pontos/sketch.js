// Morangos em Pontos
// A imagem (picsum.photos, id 1080) é baixada em tempo de execução e
// "traduzida" em uma grade de pontos coloridos que reagem ao mouse.
//
// Mouse: afasta os pontos
// Clique (segurar): faz os pontos girarem em redemoinho
// Tecla S: salva um thumbnail.png do canvas

const TAMANHO = 480; // lado do canvas e da imagem
const PASSO = 6; // distância entre os pontos da grade
const RAIO_MOUSE = 70; // alcance da influência do mouse
const MOLA = 0.035; // força que puxa o ponto de volta pra casa
const ATRITO = 0.88; // amortecimento da velocidade

let img;
let pontos = [];
let erro = false;

async function setup() {
  createCanvas(TAMANHO, TAMANHO);
  noStroke();

  try {
    // O picsum.photos envia cabeçalhos CORS, então o canvas não fica "tainted"
    img = await loadImage(`https://picsum.photos/id/1080/${TAMANHO}/${TAMANHO}`);
  } catch (e) {
    console.error("Não foi possível carregar a imagem:", e);
    erro = true;
    return;
  }

  // Amostra a imagem em uma grade e cria um ponto para cada amostra.
  // A imagem em si nunca é desenhada: só as cores amostradas são usadas.
  for (let y = PASSO / 2; y < TAMANHO; y += PASSO) {
    for (let x = PASSO / 2; x < TAMANHO; x += PASSO) {
      const [r, g, b] = img.get(floor(x), floor(y));
      const brilho = (r + g + b) / 3;
      pontos.push({
        homeX: x,
        homeY: y,
        x: random(width), // começam espalhados e se organizam sozinhos
        y: random(height),
        vx: 0,
        vy: 0,
        r,
        g,
        b,
        raio: map(brilho, 0, 255, PASSO * 0.3, PASSO * 0.62),
        fase: random(TWO_PI),
      });
    }
  }
}

function draw() {
  background(26, 15, 20);

  if (erro) {
    fill(255);
    textAlign(CENTER, CENTER);
    text("Falha ao carregar a imagem do picsum.photos", width / 2, height / 2);
    return;
  }

  const mouseDentro = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
  const t = frameCount * 0.03;

  for (const p of pontos) {
    // Mola: volta para a posição de origem
    p.vx += (p.homeX - p.x) * MOLA;
    p.vy += (p.homeY - p.y) * MOLA;

    // Mouse: repele (ou gira, se o botão estiver pressionado)
    if (mouseDentro) {
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const d = sqrt(dx * dx + dy * dy);
      if (d < RAIO_MOUSE && d > 0.01) {
        const forca = 1 - d / RAIO_MOUSE;
        if (mouseIsPressed) {
          // componente tangencial = redemoinho
          p.vx += (-dy / d) * forca * 2.2 - (dx / d) * forca * 0.4;
          p.vy += (dx / d) * forca * 2.2 - (dy / d) * forca * 0.4;
        } else {
          p.vx += (dx / d) * forca * 3.2;
          p.vy += (dy / d) * forca * 3.2;
        }
      }
    }

    p.vx *= ATRITO;
    p.vy *= ATRITO;
    p.x += p.vx;
    p.y += p.vy;

    // Pequena "respiração" para a imagem nunca ficar totalmente parada
    const ox = sin(t + p.fase) * 0.8;
    const oy = cos(t + p.fase * 1.3) * 0.8;

    fill(p.r, p.g, p.b);
    circle(p.x + ox, p.y + oy, p.raio * 2);
  }
}

function keyPressed() {
  if (key === "s" || key === "S") {
    saveCanvas("thumbnail", "png");
  }
}
