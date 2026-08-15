---
title: Composição no estilo cyberpunk com quads
tags: [quads, ai, gemini, generative, cyberpunk]
collection: artefato da semana/1
---

Um sketch feito pelo Gemini usando apenas quads, contendo algumas adições pessoais. 

Autor: Gabriel Rodrigues da Silva
DRE: 121044858

Para a construção desse trabalho, foram usados vários prompts, partindo de um código inicial gerado pelo Gemini 3.1 Pro.

1º prompt:

```plain
Crie um sketch estático (sem animação) em p5.js. Apresente o resultado sob a forma de um único script em javascript a ser colado num ambiente de desenvolvimento como o editor.p5js.org. O sketch deve usar como primitiva de desenho apenas o comando quad. É permitido usar comandos de estilização como stroke, fill, strokeWeight, etc. O programa fonte deve ser documentado para ser explicado para uma plateia de iniciantes em programação de computadores.

Tente criar uma arte com cores parecidas com um tema de cyberpunk (subgênero distópico de ficção científica), com contrastes e cores vibrantes. Se possível, crie uma seed aleatória antes de começar a desenhar a cena com os quadrados. 

Por fim, para deixar o trabalho diferente, reserve um pequeno espaço no canto inferior direito do canvas e desenhe um celular de botão, parecido com aqueles de antigamente com uma tela e 12 botões. Lembrando que esse "celular" precisa ser feito inteiramente de quadrados com o quad() ! Não precisa ficar tão bonito ou detalhado, visto que temos algumas limitações por ser o primeiro trabalho de uma disciplina que estou cursando.
```

1º código gerado:

```javascript
/*
  CENÁRIO CYBERPUNK COM CELULAR RETRÔ
  ----------------------------------------

  Este programa cria uma arte abstrata inspirada no gênero "Cyberpunk",
  caracterizado por cenários noturnos, distópicos e com muitas luzes neon 
  (cores vibrantes e de alto contraste como magenta, ciano e amarelo).

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
  // ou seja, não precisa ser atualizado continuamente como uma animação.
  noLoop();
  
  // randomSeed congela a aleatoriedade. O número "2077" (uma brincadeira 
  // com o jogo Cyberpunk 2077) funciona como uma "semente". Isso garante 
  // que toda vez que você der play, os quadrados aleatórios ficarão 
  // exatamente no mesmo lugar.
  randomSeed(2077);
  
  // background pinta o fundo do quadro. Usamos um azul escuro/cinza 
  // quase preto para simular a noite da cidade.
  background("#0a0b14");

  // 1. DESENHANDO O FUNDO CYBERPUNK (Prédios e luzes abstratas)
  desenharFundoNeon();

  // 2. DESENHANDO O CELULAR RETRÔ (No canto inferior direito)
  desenharCelularRetro();
}

/*
  FUNÇÃO: desenharFundoNeon()
  Cria uma série de quadriláteros aleatórios espalhados pela tela
  para simular luzes, hologramas e blocos de concreto de uma metrópole.
*/
function desenharFundoNeon() {
  // Paleta de cores neon para as luzes da cidade
  let coresNeon = [
    "#ff00ff", // Magenta
    "#00ffff", // Ciano
    "#ffff00", // Amarelo
    "#00ff66", // Verde Neon
    "#222233"  // Cinza escuro (para contraste de prédios no fundo)
  ];

  // Vamos usar um laço de repetição para desenhar 60 quadriláteros
  for (let i = 0; i < 60; i++) {
    // Escolhemos uma posição base X e Y de forma aleatória
    let x = random(0, width);
    let y = random(0, height);
    
    // Sorteamos a largura e a altura desse polígono
    let w = random(20, 200);
    let h = random(20, 200);
    
    // Para deixar as formas mais caóticas (Cyberpunk não é perfeitinho!),
    // adicionamos uma deformação (inclinação) para cada ponto.
    let deformacao = random(-40, 40);

    // Sorteamos uma cor da nossa paleta usando a função random() com a lista
    let corEscolhida = random(coresNeon);
    
    // fill() define a cor do preenchimento da forma
    fill(corEscolhida);
    
    // Dependendo da cor, mexemos na borda para criar um efeito de contorno brilhante
    if (corEscolhida === "#222233") {
      stroke("#000000"); // Bordas escuras para os blocos escuros
      strokeWeight(1);
    } else {
      stroke(255); // Bordas brancas brilhantes para o neon
      strokeWeight(2);
    }

    // Finalmente, desenhamos o quadrilátero com os 4 pontos calculados
    quad(
      x, y,                              // Ponto 1 (Superior Esquerdo)
      x + w, y + deformacao,             // Ponto 2 (Superior Direito)
      x + w - deformacao, y + h,         // Ponto 3 (Inferior Direito)
      x - deformacao, y + h + deformacao // Ponto 4 (Inferior Esquerdo)
    );
  }
}

/*
  FUNÇÃO: desenharCelularRetro()
  Desenha o celular "tijolão" usando apenas quad(), posicionando-o 
  no canto inferior direito da nossa tela (x a partir de 620, y a partir de 520).
*/
function desenharCelularRetro() {
  // Posições iniciais (base) do celular para facilitar a conta
  let baseX = 640;
  let baseY = 500;
  
  // --- CORPO DO CELULAR ---
  fill("#111111");     // Corpo preto de plástico
  stroke("#ff00ff");   // Borda magenta estilosa para combinar com o fundo
  strokeWeight(3);
  
  // Um retângulo convencional usando quad (ângulos retos)
  quad(
    baseX, baseY,               // Topo-esquerda
    baseX + 120, baseY,         // Topo-direita
    baseX + 120, baseY + 260,   // Embaixo-direita
    baseX, baseY + 260          // Embaixo-esquerda
  );

  // --- TELA DO CELULAR ---
  fill("#003300");     // Cor verde escura clássica das telas de cristal líquido (LCD) antigas
  stroke("#00ff66");   // Borda iluminada verde-neon
  strokeWeight(2);

  quad(
    baseX + 15, baseY + 20,     // Topo-esquerda da tela
    baseX + 105, baseY + 20,    // Topo-direita da tela
    baseX + 105, baseY + 100,   // Embaixo-direita da tela
    baseX + 15, baseY + 100     // Embaixo-esquerda da tela
  );

  // --- BOTÕES DO CELULAR (12 botões num teclado 3x4) ---
  // Vamos usar dois laços de repetição (um dentro do outro) para
  // criar uma pequena grade para o teclado sem escrever o quad() 12 vezes.
  
  fill("#333333");     // Cor de preenchimento dos botões
  stroke("#00ffff");   // Borda ciano neon para dar leitura no escuro
  strokeWeight(1.5);
  
  // Laço das Linhas (4 linhas no celular)
  for (let linha = 0; linha < 4; linha++) {
    // Laço das Colunas (3 colunas no celular)
    for (let coluna = 0; coluna < 3; coluna++) {
      
      // Calculamos a posição de cada botão com base na linha e na coluna atuais
      // baseX + 22 (margem esquerda) + espaçamento das colunas
      let botaoX = baseX + 22 + (coluna * 30);
      // baseY + 130 (espaço abaixo da tela) + espaçamento das linhas
      let botaoY = baseY + 130 + (linha * 25);
      
      let larguraBotao = 20;
      let alturaBotao = 12;
      
      // Desenha o botãozinho atual, formando um retângulo usando quad()
      quad(
        botaoX, botaoY,                               // Sup-Esq
        botaoX + larguraBotao, botaoY,                // Sup-Dir
        botaoX + larguraBotao, botaoY + alturaBotao,  // Inf-Dir
        botaoX, botaoY + alturaBotao                  // Inf-Esq
      );
    }
  }
}
```

2º prompt:

```plain
A arte ficou meio embolada, com quadrados se sobrepondo e com formas muito irregulares (quase triangulares). Tente suavizar um pouco essas variações no desenho dos quadrados.
```

2º código gerado:

Aqui está a versão ajustada do código!

Para resolver o problema das formas "emboladas" e quase triangulares, reduzi a quantidade de quadrados no fundo (de 60 para 35) para deixar a cena mais limpa. Além disso, mudei a forma como a "deformação" é calculada: em vez de um deslocamento muito drástico que cruzava as linhas e quebrava a forma, agora aplicamos apenas um leve "tremor" (uma pequena variação aleatória de no máximo 10 pixels) em cada ponta. Isso mantém a estética de blocos urbanos, mas garante que eles continuem parecendo quadriláteros.

```javascript
/*
  CENÁRIO CYBERPUNK COM CELULAR RETRÔ (Versão Suavizada)
  ------------------------------------------------------

  Este programa cria uma arte abstrata inspirada no gênero "Cyberpunk",
  caracterizado por cenários noturnos, distópicos e com muitas luzes neon 
  (cores vibrantes e de alto contraste como magenta, ciano e amarelo).

  Nesta versão, as deformações dos quadriláteros foram suavizadas para 
  evitar formas irreconhecíveis e a quantidade de elementos foi reduzida 
  para melhorar a clareza visual da composição.

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

  // 2. DESENHANDO O CELULAR RETRÔ (No canto inferior direito)
  desenharCelularRetro();
}

/*
  FUNÇÃO: desenharFundoNeon()
  Cria uma série de quadriláteros espalhados pela tela.
  As formas possuem pequenas variações para não serem retângulos perfeitos,
  mas mantêm sua estrutura básica para não virarem triângulos bagunçados.
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

  // Reduzimos o número de formas para 35, para a cena "respirar" mais
  for (let i = 0; i < 35; i++) {
    // Escolhemos uma posição base X e Y de forma aleatória
    let x = random(20, width - 150);
    let y = random(20, height - 150);
    
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
  FUNÇÃO: desenharCelularRetro()
  Desenha o celular "tijolão" usando apenas quad(), posicionando-o 
  no canto inferior direito da nossa tela.
*/
function desenharCelularRetro() {
  // Posições iniciais (base) do celular para facilitar a conta
  let baseX = 640;
  let baseY = 500;
  
  // --- CORPO DO CELULAR ---
  fill("#111111");     // Corpo preto de plástico
  stroke("#ff00ff");   // Borda magenta estilosa para combinar com o fundo
  strokeWeight(3);
  
  // Um retângulo convencional usando quad (ângulos retos)
  quad(
    baseX, baseY,               // Topo-esquerda
    baseX + 120, baseY,         // Topo-direita
    baseX + 120, baseY + 260,   // Embaixo-direita
    baseX, baseY + 260          // Embaixo-esquerda
  );

  // --- TELA DO CELULAR ---
  fill("#003300");     // Cor verde escura clássica das telas de LCD
  stroke("#00ff66");   // Borda iluminada verde-neon
  strokeWeight(2);

  quad(
    baseX + 15, baseY + 20,     // Topo-esquerda da tela
    baseX + 105, baseY + 20,    // Topo-direita da tela
    baseX + 105, baseY + 100,   // Embaixo-direita da tela
    baseX + 15, baseY + 100     // Embaixo-esquerda da tela
  );

  // --- BOTÕES DO CELULAR (12 botões num teclado 3x4) ---
  fill("#333333");     // Cor de preenchimento dos botões
  stroke("#00ffff");   // Borda ciano neon para dar leitura no escuro
  strokeWeight(1.5);
  
  // Laço das Linhas (4 linhas no celular)
  for (let linha = 0; linha < 4; linha++) {
    // Laço das Colunas (3 colunas no celular)
    for (let coluna = 0; coluna < 3; coluna++) {
      
      // Calculamos a posição de cada botão com base na linha e na coluna atuais
      let botaoX = baseX + 22 + (coluna * 30);
      let botaoY = baseY + 130 + (linha * 25);
      
      let larguraBotao = 20;
      let alturaBotao = 12;
      
      // Desenha o botãozinho atual, formando um retângulo estrito usando quad()
      quad(
        botaoX, botaoY,                               // Sup-Esq
        botaoX + larguraBotao, botaoY,                // Sup-Dir
        botaoX + larguraBotao, botaoY + alturaBotao,  // Inf-Dir
        botaoX, botaoY + alturaBotao                  // Inf-Esq
      );
    }
  }
}
```

3º prompt:

```plain
Ficou melhor, mas agora ficou muito concentrado no meio. Pode espalhar mais esses quadrados nas laterais. 
```

3º código gerado:

```javascript
/*
  CENÁRIO CYBERPUNK COM CELULAR RETRÔ (Laterais Preenchidas)
  ----------------------------------------------------------

  Este programa cria uma arte abstrata inspirada no gênero "Cyberpunk",
  caracterizado por cenários noturnos, distópicos e com muitas luzes neon.

  Nesta versão, ajustamos as coordenadas de geração dos quadrados do fundo
  para que eles se espalhem por toda a tela, inclusive ultrapassando as 
  bordas (sangria), evitando que fiquem concentrados apenas no meio.

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

  // 2. DESENHANDO O CELULAR RETRÔ (No canto inferior direito)
  desenharCelularRetro();
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

  // Aumentamos levemente a quantidade (para 45) para preencher a área maior
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
  FUNÇÃO: desenharCelularRetro()
  Desenha o celular "tijolão" usando apenas quad(), posicionando-o 
  no canto inferior direito da nossa tela.
*/
function desenharCelularRetro() {
  // Posições iniciais (base) do celular para facilitar a conta
  let baseX = 640;
  let baseY = 500;
  
  // --- CORPO DO CELULAR ---
  fill("#111111");     // Corpo preto de plástico
  stroke("#ff00ff");   // Borda magenta estilosa para combinar com o fundo
  strokeWeight(3);
  
  // Um retângulo convencional usando quad (ângulos retos)
  quad(
    baseX, baseY,               // Topo-esquerda
    baseX + 120, baseY,         // Topo-direita
    baseX + 120, baseY + 260,   // Embaixo-direita
    baseX, baseY + 260          // Embaixo-esquerda
  );

  // --- TELA DO CELULAR ---
  fill("#003300");     // Cor verde escura clássica das telas de LCD
  stroke("#00ff66");   // Borda iluminada verde-neon
  strokeWeight(2);

  quad(
    baseX + 15, baseY + 20,     // Topo-esquerda da tela
    baseX + 105, baseY + 20,    // Topo-direita da tela
    baseX + 105, baseY + 100,   // Embaixo-direita da tela
    baseX + 15, baseY + 100     // Embaixo-esquerda da tela
  );

  // --- BOTÕES DO CELULAR (12 botões num teclado 3x4) ---
  fill("#333333");     // Cor de preenchimento dos botões
  stroke("#00ffff");   // Borda ciano neon para dar leitura no escuro
  strokeWeight(1.5);
  
  // Laço das Linhas (4 linhas no celular)
  for (let linha = 0; linha < 4; linha++) {
    // Laço das Colunas (3 colunas no celular)
    for (let coluna = 0; coluna < 3; coluna++) {
      
      // Calculamos a posição de cada botão com base na linha e na coluna atuais
      let botaoX = baseX + 22 + (coluna * 30);
      let botaoY = baseY + 130 + (linha * 25);
      
      let larguraBotao = 20;
      let alturaBotao = 12;
      
      // Desenha o botãozinho atual, formando um retângulo estrito usando quad()
      quad(
        botaoX, botaoY,                               // Sup-Esq
        botaoX + larguraBotao, botaoY,                // Sup-Dir
        botaoX + larguraBotao, botaoY + alturaBotao,  // Inf-Dir
        botaoX, botaoY + alturaBotao                  // Inf-Esq
      );
    }
  }
}
```

4º prompt:

```plain
Ficou quase bom! Percebi que o canto superior esquerdo ficou com um buraco. Mude o celular de posição e coloque ele no canto superior esquerdo.
```

4º código gerado:

```javascript
/*
  CENÁRIO CYBERPUNK COM CELULAR RETRÔ (Celular no Canto Superior Esquerdo)
  ----------------------------------------------------------------------

  Este programa cria uma arte abstrata inspirada no gênero "Cyberpunk",
  caracterizado por cenários noturnos, distópicos e com muitas luzes neon.

  Nesta versão, os quadrados do fundo se espalham por toda a tela, inclusive 
  ultrapassando as bordas (sangria). O celular retrô foi movido para o canto 
  superior esquerdo para preencher aquela área e equilibrar a composição.

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

  // 2. DESENHANDO O CELULAR RETRÔ (Agora no canto superior esquerdo)
  desenharCelularRetro();
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
  FUNÇÃO: desenharCelularRetro()
  Desenha o celular "tijolão" usando apenas quad(), posicionando-o 
  no canto superior esquerdo da nossa tela.
*/
function desenharCelularRetro() {
  // Posições iniciais (base) do celular alteradas para o canto superior esquerdo.
  // Deixamos uma pequena margem de 20 pixels da borda.
  let baseX = 20;
  let baseY = 20;
  
  // --- CORPO DO CELULAR ---
  fill("#111111");     // Corpo preto de plástico
  stroke("#ff00ff");   // Borda magenta estilosa para combinar com o fundo
  strokeWeight(3);
  
  // Um retângulo convencional usando quad (ângulos retos)
  quad(
    baseX, baseY,               // Topo-esquerda
    baseX + 120, baseY,         // Topo-direita
    baseX + 120, baseY + 260,   // Embaixo-direita
    baseX, baseY + 260          // Embaixo-esquerda
  );

  // --- TELA DO CELULAR ---
  fill("#003300");     // Cor verde escura clássica das telas de LCD
  stroke("#00ff66");   // Borda iluminada verde-neon
  strokeWeight(2);

  quad(
    baseX + 15, baseY + 20,     // Topo-esquerda da tela
    baseX + 105, baseY + 20,    // Topo-direita da tela
    baseX + 105, baseY + 100,   // Embaixo-direita da tela
    baseX + 15, baseY + 100     // Embaixo-esquerda da tela
  );

  // --- BOTÕES DO CELULAR (12 botões num teclado 3x4) ---
  fill("#333333");     // Cor de preenchimento dos botões
  stroke("#00ffff");   // Borda ciano neon para dar leitura no escuro
  strokeWeight(1.5);
  
  // Laço das Linhas (4 linhas no celular)
  for (let linha = 0; linha < 4; linha++) {
    // Laço das Colunas (3 colunas no celular)
    for (let coluna = 0; coluna < 3; coluna++) {
      
      // Calculamos a posição de cada botão com base na linha e na coluna atuais
      let botaoX = baseX + 22 + (coluna * 30);
      let botaoY = baseY + 130 + (linha * 25);
      
      let larguraBotao = 20;
      let alturaBotao = 12;
      
      // Desenha o botãozinho atual, formando um retângulo estrito usando quad()
      quad(
        botaoX, botaoY,                               // Sup-Esq
        botaoX + larguraBotao, botaoY,                // Sup-Dir
        botaoX + larguraBotao, botaoY + alturaBotao,  // Inf-Dir
        botaoX, botaoY + alturaBotao                  // Inf-Esq
      );
    }
  }
}
```

5º prompt:

```plain
Acho que a ideia do celular antigo não ficou boa. Consegue transformar ele em um celular moderno, simulando uma tela inicial com ícones de aplicativos ou algum deles aberto? Pode manter a posição do celular.
```

5º código gerado:

```javascript
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
  let baseX = 20;
  let baseY = 20;
  
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
```

Por fim, na função desenharCelularModerno(), mudei os seguintes parâmetros: 

let baseX = 50;
let baseY = 70;

Curiosidade: a seed que o Gemini escolheu foi 2077, por causa do jogo Cyberpunk 2077. Como a ideia do prompt era criar uma estética baseada no gênero cyberpunk (com luzes de neon vibrantes, contrastes e fundos escuros), a IA achou que seria um easter egg divertido usar esse valor como seed da aleatoriedade.

Por fim, a arte foi finalizada.
