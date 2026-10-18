
let foto;

const quantidade = 1800;
const passos = 85;
const escalaRuido = 0.004;
const intensidade = 0.65;

async function setup() {
  createCanvas(900, 600);
  pixelDensity(1);
  background(7, 8, 20);
  noStroke();

  foto = await loadImage(
    "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&h=800&fit=crop"
  );

  foto.loadPixels();

  noiseSeed(12);
  randomSeed(12);

  criarArte();
}

function criarArte() {
  background(7, 8, 20);

  for (let p = 0; p < quantidade; p++) {
    // Distribui as partículas pelo espaço
    let x = random(width);
    let y = random(height);

    // Cada partícula percorre uma corrente curva
    for (let i = 0; i < passos; i++) {
      const anguloRuido =
        noise(x * escalaRuido, y * escalaRuido) * TWO_PI * 2;

      // Torção ao redor do centro, como um redemoinho
      const anguloCentro = atan2(
        y - height / 2,
        x - width / 2
      );

      const angulo =
        anguloRuido + anguloCentro * intensidade;

      const proximoX = x + cos(angulo) * 2.2;
      const proximoY = y + sin(angulo) * 2.2;

      if (
        proximoX < 0 || proximoX >= width ||
        proximoY < 0 || proximoY >= height
      ) {
        break;
      }

      // Consulta a cor da fotografia nessa posição
      const px = floor(map(x, 0, width, 0, foto.width));
      const py = floor(map(y, 0, height, 0, foto.height));

      const indice = 4 * (
        constrain(py, 0, foto.height - 1) * foto.width +
        constrain(px, 0, foto.width - 1)
      );

      const r = foto.pixels[indice];
      const g = foto.pixels[indice + 1];
      const b = foto.pixels[indice + 2];

      // Linhas finas e translúcidas criam camadas de cor
      stroke(r, g, b, 105);
      strokeWeight(random(0.7, 1.5));

      line(x, y, proximoX, proximoY);

      x = proximoX;
      y = proximoY;
    }
  }
}

