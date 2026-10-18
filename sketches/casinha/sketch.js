const URL_FOTO = "https://upload.wikimedia.org/wikipedia/commons/1/11/Laika_ac_Swakopmund_%288411072785%29.jpg";
let foto;
const agentes = [];
const NUM_AGENTES = 1200;

async function setup() {
  createCanvas(600, 600);
  background("#1a1a1a");
  
  // Carregamento assíncrono da imagem (CORS permitido pelo picsum)
  foto = await loadImage(URL_FOTO);
  
  // Redimensiona para o canvas e carrega os pixels na memória
  foto.resize(width, height);
  foto.loadPixels();
  
  // Instancia os agentes
  for (let i = 0; i < NUM_AGENTES; i++) {
    agentes.push(new Agente());
  }
}

function draw() {
  // Trava de segurança caso os pixels ainda não estejam prontos
  if (!foto || !foto.pixels || foto.pixels.length === 0) return;

  for (let agente of agentes) {
    agente.atualizar();
    agente.desenhar();
  }
}

// Arquitetura baseada em classes para gerenciar o estado independente de cada agente
class Agente {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.vx = random(-1.5, 1.5);
    this.vy = random(-1.5, 1.5);
  }

  atualizar() {
    // Movimentação orgânica adicionando ruído de Perlin às velocidades
    this.x += this.vx + (noise(this.x * 0.01, this.y * 0.01) - 0.5);
    this.y += this.vy + (noise(this.x * 0.01, this.y * 0.01, 100) - 0.5);

    // Toroid topology: o agente que sai por um lado volta pelo outro
    if (this.x < 0) this.x = width - 1;
    if (this.x >= width) this.x = 0;
    if (this.y < 0) this.y = height - 1;
    if (this.y >= height) this.y = 0;
  }

  desenhar() {
    // Garante que o índice no array não extrapole os limites da imagem
    const px = constrain(floor(this.x), 0, foto.width - 1);
    const py = constrain(floor(this.y), 0, foto.height - 1);
    
    // Fórmula de acesso direto ao buffer unidimensional (Aula 7)
    const i = 4 * (py * foto.width + px);
    
    const r = foto.pixels[i];
    const g = foto.pixels[i + 1];
    const b = foto.pixels[i + 2];
    
    // Cálculo de brilho ponderado para percepção humana
    const cinza = 0.222 * r + 0.707 * g + 0.071 * b;
    
    // Mapeia o brilho do pixel para definir a espessura do traço do agente
    // Áreas mais escuras recebem traços mais grossos (como em gravuras)
    const espessura = map(cinza, 0, 255, 4, 0.5);
    const opacidade = map(cinza, 0, 255, 200, 50);

    stroke(r, g, b, opacidade);
    strokeWeight(espessura);
    
    // Desenha o passo atual
    point(this.x, this.y);
  }
}