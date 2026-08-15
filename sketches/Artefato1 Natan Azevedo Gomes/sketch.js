/**
 * Arte Gerativa Estática com Quadriláteros
 * -----------------------------------------
 * Este programa desenha uma composição abstrata usando APENAS 
 * a primitiva de desenho `quad()` do p5.js.
 * 
 * Conceitos explicados neste código:
 * 1. setup(): Função principal executada apenas uma vez ao iniciar.
 * 2. colorMode(): Mudar do padrão RGB para HSB para facilitar a criação de tons pastel.
 * 3. quad(): Desenho de quadriláteros definidos por 4 pontos (x, y).
 * 4. Laços de repetição (for): Usados para gerar múltiplos elementos automaticamente.
 * 5. Números aleatórios (random): Usados para dar variedade de posições, tamanhos e cores.
 */

function setup() {
  // Criamos uma tela quadrada de 600 por 600 pixels.
  createCanvas(600, 600);
  
  // Como o sketch é ESTÁTICO (sem animação), usamos noLoop().
  // Isso diz ao p5.js para executar o desenho apenas uma única vez.
  noLoop();
  
  // Alteramos o modo de cor para HSB (Matiz, Saturação, Brilho).
  // HSB facilita a criação de cores pastel: mantemos a Saturação BAIXA e o Brilho ALTO.
  // Escalas: Matiz (0-360°), Saturação (0-100%), Brilho (0-100%), Transparência (0-1).
  colorMode(HSB, 360, 100, 100, 1);
  
  // Definimos a cor do fundo (um bege/areia suave e bem claro).
  background(40, 10, 96);
  
  // ------------------------------------------------------------
  // CAMADA 1: Quadriláteros Grandes de Fundo (Estrutura)
  // ------------------------------------------------------------
  
  // Vamos desenhar 15 quadriláteros grandes.
  for (let i = 0; i < 15; i++) {
    // Escolhemos uma matiz aleatória (qualquer cor do círculo cromático)
    let h = random(0, 360);
    // Saturação baixa (15% a 35%) gera o tom Pastel.
    let s = random(15, 35);
    // Brilho alto (80% a 95%) garante que a cor seja clara.
    let b = random(80, 95);
    // Transparência (0.4) permite ver as formas que estão por baixo.
    fill(h, s, b, 0.4);
    
    // Configurações da linha de contorno
    stroke(h, s + 10, b - 20, 0.6); // Contorno ligeiramente mais escuro
    strokeWeight(2); // Espessura da linha
    
    // Escolhemos um ponto central aleatório na tela
    let cx = random(100, width - 100);
    let cy = random(100, height - 100);
    let tam = random(100, 220); // Tamanho base da forma
    
    // O comando `quad(x1, y1, x2, y2, x3, y3, x4, y4)` precisa de 4 vértices.
    // Criamos variações a partir do centro para gerar formas irregulares e distorcidas.
    quad(
      cx - tam + random(-30, 30), cy - tam + random(-30, 30), // Vértice 1: Superior Esquerdo
      cx + tam + random(-30, 30), cy - tam + random(-30, 30), // Vértice 2: Superior Direito
      cx + tam + random(-30, 30), cy + tam + random(-30, 30), // Vértice 3: Inferior Direito
      cx - tam + random(-30, 30), cy + tam + random(-30, 30)  // Vértice 4: Inferior Esquerdo
    );
  }

  // ------------------------------------------------------------
  // CAMADA 2: Quadriláteros Médios e Dispersos (Detalhes)
  // ------------------------------------------------------------
  
  // Desenhamos 40 quadriláteros menores sobrepostos aos maiores.
  for (let i = 0; i < 40; i++) {
    let h = random(0, 360);
    let s = random(20, 40); // Saturação continua baixa para manter a paleta pastel
    let b = random(85, 98);
    fill(h, s, b, 0.6); // Um pouco mais opacos que a camada de fundo
    
    stroke(h, s + 15, b - 30, 0.8);
    strokeWeight(1.5);
    
    let cx = random(50, width - 50);
    let cy = random(50, height - 50);
    let tam = random(30, 80);
    
    quad(
      cx - tam + random(-15, 15), cy - tam + random(-15, 15),
      cx + tam + random(-15, 15), cy - tam + random(-15, 15),
      cx + tam + random(-15, 15), cy + tam + random(-15, 15),
      cx - tam + random(-15, 15), cy + tam + random(-15, 15)
    );
  }

  // ------------------------------------------------------------
  // CAMADA 3: Micro-Quadriláteros Accent (Textura Visual)
  // ------------------------------------------------------------
  
  // Desenhamos 60 formas bem pequenas espalhadas para dar ritmo e dinamismo.
  for (let i = 0; i < 60; i++) {
    let h = random(0, 360);
    let s = random(25, 45);
    let b = random(70, 95);
    fill(h, s, b, 0.8);
    
    // Algumas formas pequenas não terão contorno para diversificar o estilo
    if (random() > 0.5) {
      noStroke();
    } else {
      stroke(h, s, b - 20, 0.9);
      strokeWeight(1);
    }
    
    let cx = random(20, width - 20);
    let cy = random(20, height - 20);
    let tam = random(5, 20);
    
    quad(
      cx - tam + random(-5, 5), cy - tam + random(-5, 5),
      cx + tam + random(-5, 5), cy - tam + random(-5, 5),
      cx + tam + random(-5, 5), cy + tam + random(-5, 5),
      cx - tam + random(-5, 5), cy + tam + random(-5, 5)
    );
  }
}