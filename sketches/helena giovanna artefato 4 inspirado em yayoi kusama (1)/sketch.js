/**
 * HOMENAGEM A YAYOI KUSAMA: A OBSESSÃO INFINITA
 * 
 * Um retrato construído exclusivamente através de repetição de bolinhas,
 * explorando tamanhos, densidades e a paleta clássica da artista.
 */

function setup() {
  // Cria o canvas ocupando a janela inteira
  createCanvas(windowWidth, windowHeight);
  // Garante que o desenho seja gerado apenas uma vez (estático)
  noLoop();
}

function draw() {
  background(255, 204, 0); // Amarelo vibrante clássico de Kusama

  // Fator de escala para manter as proporções em qualquer tela
  // Usamos 800px como nossa referência de base
  let esc = min(width, height) / 800;

  // Coordenadas centrais
  let cx = width / 2;
  let cy = height / 2 + 50 * esc;

  // 1. DESENHAR O FUNDO (Padrão de bolinhas pretas sobre amarelo)
  desenharFundo(esc);

  // 2. CONSTRUÇÃO DO RETRATO (Pontilhismo Procedural)
  // Vamos percorrer a tela em um grid e decidir o que desenhar em cada ponto
  let espacamento = 7 * esc; 

  for (let x = 0; x < width; x += espacamento) {
    for (let y = 0; y < height; y += espacamento) {
      
      // Adicionamos um pequeno deslocamento aleatório para um aspecto mais orgânico
      let nx = x + random(-1, 1) * esc;
      let ny = y + random(-1, 1) * esc;

      // Definição das formas matemáticas do rosto e cabelo
      let distRosto = checarElipse(nx, ny, cx, cy, 140 * esc, 180 * esc);
      let distCabelo = checarCabelo(nx, ny, cx, cy, esc);
      let distOlhos = checarOlhos(nx, ny, cx, cy, esc);
      let distBoca = dist(nx, ny * 1.8, cx, (cy + 75 * esc) * 1.8);
      let naRoupa = ny > cy + 160 * esc && abs(nx - cx) < 350 * esc;

      // --- LÓGICA DE PINTURA (ORDEM DE CAMADAS) ---

      // CAMADA: OLHOS E BOCA (Detalhes Escuros)
      if (distOlhos < 15 * esc || distBoca < 25 * esc) {
        fill(20);
        noStroke();
        circle(nx, ny, random(3, 5) * esc);
      }
      
      // CAMADA: CABELO (Vermelho e Laranja)
      else if (distCabelo) {
        // Variação de tons de vermelho e laranja
        if (random() > 0.3) {
          fill(random(180, 255), random(0, 50), 0);
        } else {
          fill(255, random(100, 150), 0);
        }
        noStroke();
        // Cabelo é mais denso, bolinhas levemente maiores
        circle(nx, ny, random(6, 10) * esc);
      }

      // CAMADA: ROSTO (Pele em tons claros/rosados)
      else if (distRosto < 1) {
        // Tons pálidos e rosados
        fill(255, random(230, 245), random(220, 235));
        noStroke();
        // Bolinhas menores no rosto para dar mais detalhamento
        circle(nx, ny, random(3, 6) * esc);
      }

      // CAMADA: ROUPA (Padrão de bolinhas brancas e vermelhas)
      else if (naRoupa) {
        if ((nx + ny) % (30 * esc) < 15 * esc) {
          fill(255); // Bolinha branca
        } else {
          fill(180, 0, 0); // Fundo vermelho
        }
        noStroke();
        circle(nx, ny, 8 * esc);
      }
    }
  }
  
  desenharAssinatura(esc);
}

// --- FUNÇÕES AUXILIARES DE GEOMETRIA ---

// Verifica se um ponto está dentro de uma elipse (usado para o rosto)
function checarElipse(x, y, cx, cy, w, h) {
  return (pow(x - cx, 2) / pow(w, 2)) + (pow(y - cy, 2) / pow(h, 2));
}

// Define o icônico corte de cabelo Bob com franja
function checarCabelo(x, y, cx, cy, esc) {
  // Franja reta
  let franja = (y > cy - 190 * esc && y < cy - 115 * esc && x > cx - 165 * esc && x < cx + 165 * esc);
  // Volume lateral do cabelo
  let lateralL = (x > cx - 190 * esc && x < cx - 130 * esc && y > cy - 150 * esc && y < cy + 130 * esc);
  let lateralR = (x < cx + 190 * esc && x > cx + 130 * esc && y > cy - 150 * esc && y < cy + 130 * esc);
  // Topo da cabeça arredondado
  let topo = dist(x, y, cx, cy - 120 * esc) < 175 * esc && y < cy - 110 * esc;
  
  return franja || lateralL || lateralR || topo;
}

// Define a posição dos olhos
function checarOlhos(x, y, cx, cy, esc) {
  let olhoL = dist(x, y, cx - 55 * esc, cy - 60 * esc);
  let olhoR = dist(x, y, cx + 55 * esc, cy - 60 * esc);
  return min(olhoL, olhoR);
}

// Desenha o fundo com bolinhas pretas (estilo Infinity Nets/Pumpkins)
function desenharFundo(esc) {
  let passoFundo = 30 * esc;
  for (let i = 0; i < width + passoFundo; i += passoFundo) {
    for (let j = 0; j < height + passoFundo; j += passoFundo) {
      fill(0);
      noStroke();
      // Tamanho das bolinhas do fundo varia levemente
      let tam = (10 + sin(i + j) * 5) * esc;
      circle(i, j, tam);
    }
  }
}

// Texto lateral
function desenharAssinatura(esc) {
  fill(0);
  textAlign(RIGHT);
  textSize(12 * esc);
  textFont('monospace');
  text("YAYOI KUSAMA // DOTS OBSESSION", width - 20, height - 20);
}

// Ajusta o canvas se a janela for redimensionada
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw(); // Redesenha uma vez após o ajuste
}