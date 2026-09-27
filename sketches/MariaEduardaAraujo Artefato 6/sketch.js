// ==================================================
// ARTEFATO 6: Emergência (A Dança do Fogo e Poeira)
// ==================================================

// Configurações do sistema
let particulas = [];
const NUM_PARTICULAS = 1500; 

function setup() {
  createCanvas(900, 600);
  background(10, 5, 15);
  noStroke();

  // Inicializa o sistema de partículas. A emergência ocorrerá a partir
  // do comportamento coletivo e da interação indireta dessas partículas.
  for (let i = 0; i < NUM_PARTICULAS; i++) {
    particulas.push({
      x: random(width),
      y: random(height),
      vx: 0,
      vy: 0,
      tamanho: random(1, 4),
      idade: random(100),
      tipo: random() > 0.8 ? 'fogo' : 'poeira' // Proporção de tipos
    });
  }
}

function draw() {
  // Rastro suave para criar efeito de movimento contínuo (ghosting)
  fill(10, 5, 15, 30);
  rect(0, 0, width, height);

  // A MÁGICA DA EMERGÊNCIA: Ruído de Perlin (Perlin Noise)
  // O ruído de Perlin cria um "campo de fluxo" (flow field) invisível.
  // As partículas não sabem para onde estão indo, elas apenas reagem 
  // ao "vento" gerado pelas coordenadas do ruído no ponto exato onde estão.
  // O padrão complexo e orgânico que emerge não foi programado 
  // partícula por partícula; ele é resultado da soma de todas as reações.
  
  let tempo = frameCount * 0.005;

  for (let i = 0; i < particulas.length; i++) {
    let p = particulas[i];

    // O ângulo é calculado com base na posição da partícula usando noise()
    // Multiplicar x e y por um valor pequeno (0.003) "amplia" o ruído, 
    // criando curvas mais suaves e contínuas no campo de fluxo.
    let angulo = noise(p.x * 0.003, p.y * 0.003, tempo) * TWO_PI * 4;

    // Converte o ângulo em força de movimento (vetores vx e vy)
    // Usamos cos() para o eixo X e sin() para o eixo Y
    let forcaX = cos(angulo) * 0.5;
    let forcaY = sin(angulo) * 0.5;

    // Atualiza a velocidade da partícula com a força do "vento" local
    p.vx += forcaX;
    p.vy += forcaY;

    // Limita a velocidade máxima para não perder o controle do sistema
    let limiteVelocidade = p.tipo === 'fogo' ? 3 : 1.5;
    p.vx = constrain(p.vx, -limiteVelocidade, limiteVelocidade);
    p.vy = constrain(p.vy, -limiteVelocidade, limiteVelocidade);

    // Aplica um leve atrito (fricção) para suavizar o movimento
    p.vx *= 0.95;
    p.vy *= 0.95;

    // Atualiza a posição
    p.x += p.vx;
    p.y += p.vy;
    p.idade++;

    // Lógica visual baseada no tipo de partícula (Fogo ou Poeira)
    if (p.tipo === 'fogo') {
      // Fogo tende a subir lentamente, desafiando um pouco o campo de fluxo
      p.y -= 1;
      
      // Cor baseada na velocidade e idade
      let intensidade = map(abs(p.vx) + abs(p.vy), 0, 4, 150, 255);
      let alpha = map(p.idade, 0, 200, 255, 0);
      fill(intensidade, intensidade * 0.4, 0, alpha);
      
      // Partículas de fogo morrem mais rápido
      if (p.idade > 200) resetarParticula(p);
      
    } else {
      // Poeira Mágica (Cores das cinzas ao roxo, mantendo sua paleta anterior)
      let r = map(p.x, 0, width, 100, 255);
      let b = map(p.y, 0, height, 150, 255);
      let alpha = map(sin(p.idade * 0.05), -1, 1, 50, 150); // Efeito cintilante
      fill(r, 80, b, alpha);
      
      // Poeira dura mais tempo
      if (p.idade > 400) resetarParticula(p);
    }

    // Desenha a partícula
    ellipse(p.x, p.y, p.tamanho);

    // Se a partícula sair da tela, recria-a em outro lugar
    if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
      resetarParticula(p);
    }
  }
}

// Função auxiliar para "reciclar" partículas que saem da tela ou morrem
function resetarParticula(p) {
  p.x = random(width);
  p.y = random(height);
  p.vx = 0;
  p.vy = 0;
  p.idade = 0;
}