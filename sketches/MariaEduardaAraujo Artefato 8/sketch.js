/**
 * Artefato 8: Pintura Viva - Colinas e Céu
 * 
 * Este sketch carrega uma imagem de paisagem via internet (CORS).
 * Respeitando o p5.js v2, usamos 'async function setup()' e 'await'.
 * A imagem não é exibida diretamente; em vez disso, um sistema de agentes
 * (pincéis) flutua pela tela lendo as cores originais e pintando o canvas.
 */

let imgOriginal;
let pinceis = [];
let imagemCarregada = false;

// O setup assíncrono é obrigatório no p5.js 2.0 para carregar mídia
async function setup() {
  createCanvas(800, 600);
  background(20);
  noStroke();
  
  // Carrega uma imagem do Picsum via CORS. 
  // Usamos um seed específico para garantir uma paisagem constante.
  imgOriginal = await loadImage('https://picsum.photos/seed/bliss/800/600');
  
  // Carrega os píxeis para a memória, permitindo usar a função get()
  imgOriginal.loadPixels();
  imagemCarregada = true;
  
  // Cria 300 agentes (pincéis) espalhados pela tela
  for (let i = 0; i < 300; i++) {
    pinceis.push(new Pincel());
  }
}

function draw() {
  // Trava de segurança: aguarda a imagem baixar da internet
  if (!imagemCarregada) {
    fill(255);
    textAlign(CENTER, CENTER);
    text("Carregando as colinas...", width / 2, height / 2);
    return;
  }
  
  // Limpa o texto de carregamento no primeiro frame útil
  if (frameCount === 1) background(20);

  // Move e desenha cada pincel
  for (let p of pinceis) {
    p.mover();
    p.pintar();
  }
}

// Classe que define o comportamento dos pincéis autônomos
class Pincel {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.tamanho = random(3, 12);
  }
  
  mover() {
    // Ruído de Perlin para movimento fluido e orgânico.
    // Multiplicamos por um valor menor no eixo Y para simular o 
    // vento horizontal varrendo as colinas e as nuvens.
    let angulo = noise(this.x * 0.002, this.y * 0.005, frameCount * 0.001) * TWO_PI;
    
    this.x += cos(angulo) * 2;
    this.y += sin(angulo) * 1.5;
    
    // Se o pincel sair da tela, ele ressurge do outro lado
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
  }
  
  pintar() {
    // Garante que as coordenadas sejam números inteiros para ler o píxel
    let xInt = floor(this.x);
    let yInt = floor(this.y);
    
    // Captura a cor exata da imagem escondida naquela posição
    let cor = imgOriginal.get(xInt, yInt);
    
    // Pinta com a cor lida, aplicando transparência para misturar as tintas
    fill(cor[0], cor[1], cor[2], 80);
    
    // Formato alongado simulando uma pincelada impressionista
    push();
    translate(this.x, this.y);
    rotate(noise(this.x * 0.01) * PI);
    ellipse(0, 0, this.tamanho * 2, this.tamanho * 0.5);
    pop();
  }
}