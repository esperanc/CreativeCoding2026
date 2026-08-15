/*
  CENÁRIO CYBERPUNK COM CELULAR MODERNO (Canto Superior Esquerdo)
  ----------------------------------------------------------------------

  Este programa cria uma arte abstrata inspirada no gênero "Cyberpunk",
  caracterizado por cenários noturnos, distópicos e com muitas luzes neon.

  Nesta versão, os quadrados do fundo se espalham por toda a tela, inclusive 
  ultrapassando as bordas (sangria). O antigo celular retrô foi substituído por 
  um smartphone moderno no canto superior esquerdo, simulando uma tela 
  inicial com ícones de aplicativos e uma "dock" inferior.

  REGRA PRINCIPAL: A única função geométrica permitida para desenhar 
  as formas é o quad() - um polígono de quatro lados. 

  Para iniciantes em programação:
  - Variáveis (let): Guardam valores que podemos usar várias vezes.
  - Arrays ([]): Guardam listas de valores, como nossa paleta de cores.
  - Laço de repetição (for): Executa um bloco de código repetidas vezes,
    poupando a necessidade de escrever dezenas de linhas de código.
  - quad(x1,y1, x2,y2, x3,y3, x4,y4): Cada par de (x,y) representa a 
    posição de uma "ponta" do quadrilátero na nossa tela.
*/

function setup() {
  // createCanvas define o tamanho do nosso quadro (largura, altura).
  createCanvas(800, 800);
  
  // noLoop avisa o p5.js que este é um desenho estático, 
  // ou seja, não precisa ser atualizado continuamente.
  noLoop();
  
  // randomSeed congela a aleatoriedade. O número "2077" garante que
  // toda vez que você der play, o desenho gerado será exatamente o mesmo.
  randomSeed(2077);
  
  // background pinta o fundo do quadro com um azul escuro/cinza.
  background("#0a0b14");

  // 1. DESENHANDO O FUNDO CYBERPUNK (Prédios e luzes abstratas)
  desenharFundoNeon();

  // 2. DESENHANDO O CELULAR MODERNO (No canto superior esquerdo)
  desenharCelularModerno();
}

/*
  FUNÇÃO: desenharFundoNeon()
  Cria uma série de quadriláteros espalhados pela tela.
  Os limites de posição foram expandidos para além das bordas (valores negativos 
  e maiores que width/height) para garantir que as laterais também sejam preenchidas.
*/
function desenharFundoNeon() {
  // Paleta de cores neon para as luzes da cidade
  let coresNeon = [
    "#ff00ff", // Magenta
    "#00ffff", // Ciano
    "#ffff00", // Amarelo
    "#00ff66", // Verde Neon
    "#222233"  // Cinza escuro (para contraste e profundidade)
  ];

  // Mantemos a quantidade (45) para preencher a área
  for (let i = 0; i < 45; i++) {
    // Expandimos a área de sorteio para -50 até width+50 / height+50
    // Isso faz com que os quadrados se espalhem por toda a extensão do canvas
    let x = random(-50, width + 50);
    let y = random(-50, height + 50);
    
    // Sorteamos a largura e a altura desse bloco
    let w = random(40, 160);
    let h = random(40, 160);
    
    // Em vez de uma grande deformação estrutural, usamos um "tremor" leve.
    // Cada vértice do quadrado vai sair do lugar no máximo 10 pixels.
    let tremor = 10;

    // Sorteamos uma cor da nossa paleta
    let corEscolhida = random(coresNeon);
    fill(corEscolhida);
    
    // Dependendo da cor, ajustamos o contorno
    if (corEscolhida === "#222233") {
      stroke("#000000"); // Bordas escuras para os blocos escuros
      strokeWeight(2);
    } else {
      stroke(255); // Bordas brancas brilhantes para o neon
      strokeWeight(1.5);
    }

    // Desenhamos o quadrilátero adicionando o leve "tremor" em cada ponto
    quad(
      x + random(-tremor, tremor), y + random(-tremor, tremor),                         // Ponto 1 (Superior Esquerdo)
      x + w + random(-tremor, tremor), y + random(-tremor, tremor),                     // Ponto 2 (Superior Direito)
      x + w + random(-tremor, tremor), y + h + random(-tremor, tremor),                 // Ponto 3 (Inferior Direito)
      x + random(-tremor, tremor), y + h + random(-tremor, tremor)                      // Ponto 4 (Inferior Esquerdo)
    );
  }
}

/*
  FUNÇÃO: desenharCelularModerno()
  Desenha um smartphone simulando uma tela inicial de aplicativos
  usando apenas a função quad(), no canto superior esquerdo da tela.
*/
function desenharCelularModerno() {
  // Margem de 20 pixels da borda (mantendo a posição).
  let baseX = 50;
  let baseY = 70;
  
  // --- CORPO DO SMARTPHONE ---
  // Celulares modernos são mais finos e altos, quase sem bordas (bezels)
  fill("#111111");     // Corpo escuro
  stroke("#00ffff");   // Borda ciano para destacar na arte
  strokeWeight(3);
  
  quad(
    baseX, baseY,               // Topo-esquerda
    baseX + 140, baseY,         // Topo-direita
    baseX + 140, baseY + 280,   // Embaixo-direita
    baseX, baseY + 280          // Embaixo-esquerda
  );

  // --- TELA DO SMARTPHONE ---
  fill("#1a1c29");     // Fundo da tela imitando um "dark mode"
  stroke("#ff00ff");   // Borda interna magenta
  strokeWeight(1.5);

  quad(
    baseX + 5, baseY + 5,       // Topo-esquerda da tela
    baseX + 135, baseY + 5,     // Topo-direita da tela
    baseX + 135, baseY + 275,   // Embaixo-direita da tela
    baseX + 5, baseY + 275      // Embaixo-esquerda da tela
  );

  // --- NOTCH / CÂMERA FRONTAL ---
  // O detalhe preto no topo da tela do celular
  fill("#000000");
  stroke("#000000");
  
  quad(
    baseX + 40, baseY + 5,
    baseX + 100, baseY + 5,
    baseX + 100, baseY + 20,
    baseX + 40, baseY + 20
  );

  // --- ÍCONES DE APLICATIVOS (Tela Inicial) ---
  // Vamos desenhar uma grade de 4 linhas e 3 colunas para os apps
  let appSize = 25;
  let espacoX = 15;
  let espacoY = 20;
  
  // Ponto de partida para o primeiro aplicativo
  let inicioX = baseX + 18;
  let inicioY = baseY + 45;

  let coresApps = ["#ff00ff", "#00ffff", "#ffff00", "#00ff66"];
  strokeWeight(1.5);

  for (let linha = 0; linha < 4; linha++) {
    for (let coluna = 0; coluna < 3; coluna++) {
      
      let appX = inicioX + (coluna * (appSize + espacoX));
      let appY = inicioY + (linha * (appSize + espacoY));
      
      // Escolhemos as cores de forma alternada para os ícones
      let corIndex = (linha + coluna) % 4;
      fill(coresApps[corIndex]);
      stroke("#ffffff"); // Contorno branco nos apps
      
      quad(
        appX, appY,
        appX + appSize, appY,
        appX + appSize, appY + appSize,
        appX, appY + appSize
      );
    }
  }

  // --- DOCK INFERIOR ---
  // Aquela barrinha no rodapé do celular onde ficam os apps principais
  fill("#2b2d42");
  stroke("#222233");
  quad(
    baseX + 10, baseY + 215,
    baseX + 130, baseY + 215,
    baseX + 130, baseY + 265,
    baseX + 10, baseY + 265
  );

  // Desenhando 3 aplicativos na Dock
  for (let i = 0; i < 3; i++) {
    let appX = inicioX + (i * (appSize + espacoX));
    let appY = baseY + 228;
    
    // Usamos cores em ordem diferente
    fill(coresApps[(i + 2) % 4]);
    stroke("#ffffff");
    
    quad(
      appX, appY,
      appX + appSize, appY,
      appX + appSize, appY + appSize,
      appX, appY + appSize
    );
  }
}