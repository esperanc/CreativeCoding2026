/*
  ARTEFATO 2: CENÁRIO CYBERPUNK GENERATIVO (Área de Segurança + Cores Complementares)
  ----------------------------------------------------------------------

  Este sketch é "Estático mas generativo". Toda vez que for executado,
  uma nova composição será gerada, adaptando-se ao tamanho da janela.

  Novidades desta versão:
  1. Uso de windowWidth e windowHeight para tela cheia.
  2. Remoção do randomSeed() para ser 100% generativo a cada execução.
  3. Uso de múltiplas primitivas (rect, ellipse, triangle).
  4. Algoritmo de "Circle Packing" para não sobrepor as formas do fundo.
  5. Celular no centro com área de segurança (sem colisão com o fundo).
  6. Efeito de brilho (glow) neon adicionado.
  7. Ícones do celular (quadrados) usam uma paleta de cores complementares 
     e de alto contraste para se destacarem completamente do fundo.
*/

let formasFundo = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();
  background("#0a0b14");

  // 1. GERA E DESENHA O FUNDO NEON
  desenharFundoInteligente();

  // 2. DESENHA O CELULAR MODERNO
  desenharCelularModerno();
}

function desenharFundoInteligente() {
  // O fundo continua com suas 6 cores originais
  let coresNeon = [
    "#ff00ff", // Magenta
    "#00ffff", // Ciano
    "#ffff00", // Amarelo
    "#00ff66", // Verde Neon
    "#ff4500", // Laranja Elétrico
    "#8a2be2"  // Roxo Profundo
  ];
  let tiposForma = ["ellipse", "rect", "triangle"];
  
  let totalTentativas = 0;
  let maxTentativas = 4000; 
  let formasDesejadas = 200; 
  
  while (formasFundo.length < formasDesejadas && totalTentativas < maxTentativas) {
    
    let raio = random(10, 25); 
    let x = random(raio, width - raio);
    let y = random(raio, height - raio);
    
    let sobrepoe = false;
    
    // --- LÓGICA DE ÁREA DE SEGURANÇA ---
    let distCentro = dist(x, y, width / 2, height / 2);
    if (distCentro < 175 + raio) { // Esse inteiro serve para modificar a área de segurança
      sobrepoe = true;
    }
    
    if (!sobrepoe) {
      for (let f of formasFundo) {
        let distancia = dist(x, y, f.x, f.y);
        if (distancia < (raio + f.raio + 12)) { 
          sobrepoe = true;
          break; 
        }
      }
    }
    
    if (!sobrepoe) {
      let tipo = random(tiposForma);
      let cor = random(coresNeon);
      formasFundo.push({ x: x, y: y, raio: raio, tipo: tipo, cor: cor });
      
      drawingContext.shadowBlur = 15; 
      drawingContext.shadowColor = cor;
      
      fill(cor);
      stroke(255); 
      strokeWeight(1.5);
      
      if (tipo === "ellipse") {
        ellipse(x, y, raio * 2, raio * 2);
      } 
      else if (tipo === "rect") {
        rect(x - raio, y - raio, raio * 2, raio * 2);
      } 
      else if (tipo === "triangle") {
        triangle(x, y - raio, x - raio, y + raio, x + raio, y + raio);
      }
    }
    
    totalTentativas++;
  }
}

function desenharCelularModerno() {
  let celLargura = 160;
  let celAltura = 320;
  
  let baseX = (width - celLargura) / 2;
  let baseY = (height - celAltura) / 2;
  
  // --- CORPO DO SMARTPHONE ---
  drawingContext.shadowBlur = 25;
  drawingContext.shadowColor = "#00ffff"; 
  fill("#111111");     
  stroke("#00ffff");   
  strokeWeight(3);
  rect(baseX, baseY, celLargura, celAltura, 15);

  // --- TELA DO SMARTPHONE ---
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = "#ff00ff"; 
  fill("#1a1c29");     
  stroke("#ff00ff");   
  strokeWeight(1.5);
  rect(baseX + 5, baseY + 5, celLargura - 10, celAltura - 10, 10);

  // --- NOTCH / CÂMERA FRONTAL ---
  drawingContext.shadowBlur = 0; 
  fill("#000000");
  noStroke(); 
  rect(baseX + 50, baseY + 5, 60, 15, 0, 0, 10, 10);

  // --- ÍCONES DE APLICATIVOS (Tela Inicial) ---
  let appSize = 28;
  let espacoX = 17;
  let espacoY = 22;
  let inicioX = baseX + 20;
  let inicioY = baseY + 50;

  // Paleta de aplicativos: Cores complementares e de alto contraste
  let coresApps = [
    "#ff0000", // Vermelho Puro (Oposto ao Ciano/Verde)
    "#00ff00", // Verde Limão Puro (Oposto ao Magenta)
    "#0000ff", // Azul Profundo (Oposto ao Amarelo)
    "#ffaa00", // Âmbar Vibrante (Oposto ao Azul/Roxo)
    "#00ffcc", // Verde Água / Aqua
    "#ffffff"  // Branco Brilhante (Contraste máximo)
  ];
  
  strokeWeight(1.5);
  stroke("#ffffff");

  for (let linha = 0; linha < 4; linha++) {
    for (let coluna = 0; coluna < 3; coluna++) {
      let appX = inicioX + (coluna * (appSize + espacoX));
      let appY = inicioY + (linha * (appSize + espacoY));
      
      // Sorteia aleatoriamente entre as cores complementares
      let corApp = random(coresApps);
      
      drawingContext.shadowBlur = 15;
      drawingContext.shadowColor = corApp;
      fill(corApp);
      
      rect(appX, appY, appSize, appSize, 6);
    }
  }

  // --- DOCK INFERIOR ---
  drawingContext.shadowBlur = 5;
  drawingContext.shadowColor = "#222233";
  fill("#2b2d42");
  stroke("#222233");
  rect(baseX + 10, baseY + 245, celLargura - 20, 60, 15);

  // Aplicativos na Dock
  stroke("#ffffff");
  for (let i = 0; i < 3; i++) {
    let appX = inicioX + (i * (appSize + espacoX));
    let appY = baseY + 260;
    
    let corApp = random(coresApps);
    
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = corApp;
    fill(corApp);
    
    rect(appX, appY, appSize, appSize, 6);
  }
  
  drawingContext.shadowBlur = 0;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  formasFundo = []; 
  background("#0a0b14");
  desenharFundoInteligente();
  desenharCelularModerno();
}