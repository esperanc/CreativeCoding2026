let todosOsDelimitadores = [];
let linhasTerracota = [];

// paleta inspirada em plantação/campo: verdes de vegetação e amarelos de colheita
let paleta = [
  "#2d4a22",
  "#5a7d36",
  "#8b944b",
  "#d4a933",
  "#e8cd7b",
];

// cada Figura é um dos "retalhos" pequenos dentro de um bloco maior
class Figura {
  constructor(p1, p2, p3, p4) {
    this.pontos = [p1, p2, p3, p4]; 
    this.cor = random(paleta);
    
    let coresLisas = ["#d4a933", "#e8cd7b"];
    
    // amarelos ficam lisos (sem textura), o resto pode ganhar sulcos
    if (coresLisas.includes(this.cor)) {
      this.temTextura = false;
    } else {
      this.temTextura = random() > 0.1;
    }

    this.espacamentoTextura = random(1, 8);
    
    // mistura sulco escuro (tipo terra arada) com brilho claro (tipo palha), 60/40
    this.corTextura = random() > 0.4 ? color(0, 0, 0, 85) : color(255, 255, 255, 60);
  }

  desenhar() {
    fill(this.cor);
    stroke(15);
    strokeWeight(1.5); 
    
    beginShape();
    for (let p of this.pontos) {
      vertex(p.x, p.y);
    }
    endShape(CLOSE);

    if (this.temTextura) {
      // mede os quatro lados pra saber se o retalho é mais largo ou mais alto,
      // e assim decidir se as linhas de textura vão na horizontal ou vertical
      let topo = p5.Vector.dist(this.pontos[0], this.pontos[1]);
      let base = p5.Vector.dist(this.pontos[3], this.pontos[2]);
      let esquerda = p5.Vector.dist(this.pontos[0], this.pontos[3]);
      let direita = p5.Vector.dist(this.pontos[1], this.pontos[2]);
      
      let larguraMedia = (topo + base) / 2;
      let alturaMedia = (esquerda + direita) / 2;
      
      stroke(this.corTextura);
      strokeWeight(2);
      
      if (larguraMedia < alturaMedia) {
        // mais alto que largo -> linhas horizontais
        let qtdLinhas = int(alturaMedia / this.espacamentoTextura);
        for (let i = 1; i < qtdLinhas; i++) {
          let t = i / qtdLinhas;
          let pEsq = p5.Vector.lerp(this.pontos[0], this.pontos[3], t);
          let pDir = p5.Vector.lerp(this.pontos[1], this.pontos[2], t);
          line(pEsq.x, pEsq.y, pDir.x, pDir.y);
        }
      } else {
        // mais largo que alto -> linhas verticais
        let qtdLinhas = int(larguraMedia / this.espacamentoTextura);
        for (let i = 1; i < qtdLinhas; i++) {
          let t = i / qtdLinhas;
          let pTop = p5.Vector.lerp(this.pontos[0], this.pontos[1], t);
          let pBot = p5.Vector.lerp(this.pontos[3], this.pontos[2], t);
          line(pTop.x, pTop.y, pBot.x, pBot.y);
        }
      }
    }
  }
}

// Delimitador é o bloco "grande", que depois é recortado em várias Figuras menores
class Delimitador {
  constructor(p1, p2, p3, p4, cor) {
    this.p1 = p1; // topo-esquerda
    this.p2 = p2; // topo-direita
    this.p3 = p3; // baixo-direita
    this.p4 = p4; // baixo-esquerda
    this.cor = cor;
    
    this.figuras = [];
  }

  preencherDelimitador(granularidade) {
    if (granularidade <= 0) return; // sem granularidade, deixa o bloco vazio (só a cor de fundo)

    // acha um ponto qualquer dentro do bloco a partir de duas porcentagens (u = horizontal, v = vertical)
    let getPonto = (u, v) => {
      let topo = p5.Vector.lerp(this.p1, this.p2, u);
      let base = p5.Vector.lerp(this.p4, this.p3, u); 
      return p5.Vector.lerp(topo, base, v);
    };

    // vai cortando o bloco em dois, recursivamente, até bater no nível pedido
    let subdividirUV = (u1, v1, u2, v2, nivel) => {
      
      // acabou a recursão: cria a figura final nesse pedacinho
      if (nivel <= 0) {
        let pt1 = getPonto(u1, v1);
        let pt2 = getPonto(u2, v1);
        let pt3 = getPonto(u2, v2);
        let pt4 = getPonto(u1, v2);
        this.adicionarFigura(new Figura(pt1, pt2, pt3, pt4));
        return;
      }

      // corta entre 30% e 70% pra evitar fatias finas demais
      let proporcaoCorte = random(0.3, 0.7);

      if (random() > 0.5) {
        // corte vertical: divide em duas colunas
        let uCorte = lerp(u1, u2, proporcaoCorte);
        subdividirUV(u1, v1, uCorte, v2, nivel - 1);
        subdividirUV(uCorte, v1, u2, v2, nivel - 1);
      } else {
        // corte horizontal: divide em duas linhas empilhadas
        let vCorte = lerp(v1, v2, proporcaoCorte);
        subdividirUV(u1, v1, u2, vCorte, nivel - 1);
        subdividirUV(u1, vCorte, u2, v2, nivel - 1);
      }
    };

    // profundidade 1 = 2 figuras, 2 = 4, 3 = 8, e assim vai dobrando
    let profundidade = int(granularidade * random(1, 1.5));
    if (profundidade < 1) profundidade = 1;

    subdividirUV(0, 0, 1, 1, profundidade);
  }

  adicionarFigura(figura) {
    this.figuras.push(figura);
  }

  desenhar() {
    // desenha o fundo do bloco primeiro
    fill(this.cor);
    stroke(15);
    strokeWeight(3); // borda mais grossa pra marcar bem a divisão entre blocos grandes
    
    beginShape();
    vertex(this.p1.x, this.p1.y);
    vertex(this.p2.x, this.p2.y);
    vertex(this.p3.x, this.p3.y);
    vertex(this.p4.x, this.p4.y);
    endShape(CLOSE);

    // depois desenha as figuras menores por cima
    for (let f of this.figuras) {
      f.desenhar();
    }
  }
}

// Faixa é uma "coluna" vertical do canvas, que recebe cortes ondulados
// e é dividida em vários Delimitadores empilhados
class Faixa {
  constructor(tl, tr, br, bl) {
    this.tl = tl; 
    this.tr = tr; 
    this.br = br; 
    this.bl = bl; 
    this.blocos = []; 
  }

  subdividir() {
    // guarda as linhas de corte, começando pelo topo da faixa
    let cortes = [];
    cortes.push({ pL: this.tl.copy(), pR: this.tr.copy(), tL: 0, tR: 0 });

    let dirL = p5.Vector.sub(this.bl, this.tl);
    let dirR = p5.Vector.sub(this.br, this.tr);
    let normL = createVector(dirL.y, -dirL.x).normalize();
    let normR = createVector(-dirR.y, dirR.x).normalize();

    let tentativas = 0;
    let tL_atual = 0; 
    let tR_atual = 0; 

    // tenta ir descendo a faixa criando cortes, ora avançando pelo lado esquerdo,
    // ora pelo direito, e projetando o corte pro outro lado
    while (tentativas < 50) {
      tentativas++;
      let step = random(0.3, 0.6); 
      let lado = random([0, 1]); 

      let sucesso = false;
      let pL_novo, pR_novo, tL_novo, tR_novo;

      if (lado === 0) {
        tL_novo = tL_atual + step;
        if (tL_novo > 0.9) break; 
        
        pL_novo = p5.Vector.lerp(this.tl, this.bl, tL_novo);
        let inter = linhaIntersecta(pL_novo, normL, this.tr, dirR);
        
        if (inter && inter.u > tR_atual + 0.05 && inter.u < 0.95) {
          tR_novo = inter.u;
          pR_novo = inter.pt;
          sucesso = true;
        }
      } else {
        tR_novo = tR_atual + step;
        if (tR_novo > 0.9) break;
        
        pR_novo = p5.Vector.lerp(this.tr, this.br, tR_novo);
        let inter = linhaIntersecta(pR_novo, normR, this.tl, dirL);
        
        if (inter && inter.u > tL_atual + 0.05 && inter.u < 0.95) {
          tL_novo = inter.u;
          pL_novo = inter.pt;
          sucesso = true;
        }
      }

      if (sucesso) {
        cortes.push({ pL: pL_novo, pR: pR_novo, tL: tL_novo, tR: tR_novo });
        tL_atual = tL_novo;
        tR_atual = tR_novo;
      }
    }

    cortes.push({ pL: this.bl.copy(), pR: this.br.copy(), tL: 1, tR: 1 });

    // com os cortes definidos, cria um Delimitador entre cada par de cortes consecutivos
    for (let i = 0; i < cortes.length - 1; i++) {
      let cTop = cortes[i];
      let cBot = cortes[i + 1];
      let corSorteada = color(random(paleta));
      
      let novoBloco = new Delimitador(cTop.pL, cTop.pR, cBot.pR, cBot.pL, corSorteada);
      
      // calcula a área aproximada do bloco pra decidir quanto ele deve ser subdividido
      let larguraMedia = (cTop.pL.dist(cTop.pR) + cBot.pL.dist(cBot.pR)) / 2;
      let alturaMedia = (cTop.pL.dist(cBot.pL) + cTop.pR.dist(cBot.pR)) / 2;
      let areaDoBloco = larguraMedia * alturaMedia;

      let granularidadeFinal = 0;

      // 30% dos blocos ficam "vazios" (sem subdivisão interna), os outros 70%
      // recebem uma granularidade proporcional ao tamanho do bloco
      if (random() > 0.3) {
        granularidadeFinal = map(areaDoBloco, 2000, 150000, 0.5, 4);
        granularidadeFinal = constrain(granularidadeFinal, 0.5, 5); 
      }

      novoBloco.preencherDelimitador(granularidadeFinal); 
      
      this.blocos.push(novoBloco);
      todosOsDelimitadores.push(novoBloco); 
    }
  }
}

// acha onde duas retas (ponto + direção) se cruzam
function linhaIntersecta(p1, d1, p2, d2) {
  let det = d1.x * d2.y - d1.y * d2.x;
  if (abs(det) < 0.001) return null; // retas paralelas, não tem cruzamento
  let dx = p2.x - p1.x;
  let dy = p2.y - p1.y;
  let t = (dx * d2.y - dy * d2.x) / det;
  let u = (dx * d1.y - dy * d1.x) / det;
  return { pt: createVector(p1.x + t * d1.x, p1.y + t * d1.y), t: t, u: u };
}

// recebe um bloco retangular (ou trapezoidal) grande e o divide em várias Faixas verticais
function gerarFaixasParaBloco(pTL, pTR, pBR, pBL) {
  let larguraMedia = pTL.dist(pTR);
  let qtdFaixas = max(1, int(larguraMedia / random(150, 250)));

  let largurasTopo = [];
  let largurasBase = [];

  for (let i = 0; i < qtdFaixas; i++) largurasTopo.push(random(50, 200));
  for (let i = 0; i < qtdFaixas; i++) {
    // às vezes a faixa mantém a mesma largura de topo até a base (efeito "reto"),
    // na maioria das vezes ela varia (efeito mais orgânico)
    if (random() > 0.9) largurasBase.push(largurasTopo[i]); 
    else largurasBase.push(random(50, 250)); 
  }

  let somaTopo = largurasTopo.reduce((a, b) => a + b, 0);
  let somaBase = largurasBase.reduce((a, b) => a + b, 0);
  
  // transforma as larguras em posições acumuladas de 0 a 1
  let tTopo = [0];
  let tBase = [0];
  let accTopo = 0;
  let accBase = 0;

  for (let l of largurasTopo) { accTopo += l / somaTopo; tTopo.push(accTopo); }
  for (let l of largurasBase) { accBase += l / somaBase; tBase.push(accBase); }
  
  tTopo[tTopo.length - 1] = 1;
  tBase[tBase.length - 1] = 1;

  for (let i = 0; i < qtdFaixas; i++) {
    let tl = p5.Vector.lerp(pTL, pTR, tTopo[i]);
    let tr = p5.Vector.lerp(pTL, pTR, tTopo[i + 1]);
    let bl = p5.Vector.lerp(pBL, pBR, tBase[i]);
    let br = p5.Vector.lerp(pBL, pBR, tBase[i + 1]);

    let faixa = new Faixa(tl, tr, br, bl);
    faixa.subdividir();
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  gerarComposicao();
}

function gerarComposicao() {
  todosOsDelimitadores = []; 
  linhasTerracota = [];

  // define uma faixa central "especial" que atravessa a tela com um corte diagonal no meio
  let larguraEspecial = width * 0.6; 
  let startX = random(0, width * 0.4); 
  let endX = startX + larguraEspecial;

  let yCorteInicio = random(height * 0.3, height * 0.6);
  let tamanhoInclinacao = 80 * random([-1, 1]); 
  let yCorteFim = yCorteInicio + tamanhoInclinacao;

  // guarda as 3 linhas grossas de terracota que vão por cima de tudo no final
  linhasTerracota.push({ x1: startX, y1: 0, x2: startX, y2: height });
  linhasTerracota.push({ x1: endX, y1: 0, x2: endX, y2: height });
  linhasTerracota.push({ x1: startX, y1: yCorteInicio, x2: endX, y2: yCorteFim });

  // bloco padrão à esquerda da faixa especial (se existir espaço)
  if (startX > 0.01) {
    gerarFaixasParaBloco(
      createVector(0, 0), createVector(startX, 0),
      createVector(startX, height), createVector(0, height)
    );
  }

  // metade de cima da faixa especial, acima do corte diagonal
  gerarFaixasParaBloco(
    createVector(startX, 0), createVector(endX, 0),
    createVector(endX, yCorteFim), createVector(startX, yCorteInicio)
  );

  // metade de baixo da faixa especial, abaixo do corte diagonal
  gerarFaixasParaBloco(
    createVector(startX, yCorteInicio), createVector(endX, yCorteFim),
    createVector(endX, height), createVector(startX, height)
  );

  // bloco padrão à direita da faixa especial (se existir espaço)
  if (endX < width - 0.01) {
    gerarFaixasParaBloco(
      createVector(endX, 0), createVector(width, 0),
      createVector(width, height), createVector(endX, height)
    );
  }
}

function draw() {
  background(20);
  
  // desenha todos os blocos com suas subdivisões internas
  for (let bloco of todosOsDelimitadores) {
    bloco.desenhar();
  }
  
  // por cima de tudo, desenha as 3 linhas grossas que marcam a estrutura principal
  stroke("#e60000");
  strokeWeight(7);
  strokeCap(SQUARE);
  
  for (let l of linhasTerracota) {
    line(l.x1, l.y1, l.x2, l.y2);
  }
  
  noLoop(); 
}

// clicar gera uma composição nova
function mousePressed() {
  gerarComposicao();
  redraw();
}

// redimensionar a janela também gera tudo de novo, já que os cortes dependem do tamanho da tela
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  gerarComposicao();
  redraw();
}