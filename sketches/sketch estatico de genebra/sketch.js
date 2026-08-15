// =====================================================================
// SKETCH ESTÁTICO EM p5.js — "GENEBRA (versão colorida)" — SÓ quad()
// =====================================================================
//
// Esta versão se inspira numa foto real do Jet d'Eau: jato de água bem
// fino e alto, um leque de espuma soprado para o lado pelo vento, um
// arco-íris dentro da espuma, colinas arredondadas ao fundo, uma
// marina cheia de mastros e um barco de passeio vermelho/amarelo.
//
// A ÚNICA primitiva de desenho é quad().
// A grande novidade aqui é uma TÉCNICA para desenhar CURVAS (a colina
// arredondada e o arco-íris) usando só quadriláteros:
//
//   -> Em vez de um único quad, usamos MUITOS quads bem fininhos,
//      lado a lado, cada um com uma altura (ou posição) ligeiramente
//      diferente do vizinho. De longe, essa "escada" de retângulos
//      finos parece uma curva suave. É a mesma ideia por trás de
//      gráficos de barras que parecem uma linha contínua quando as
//      barras são finas o suficiente.
// =====================================================================

function setup() {

  createCanvas(700, 460);
  noStroke();

  // -------------------------------------------------------------
  // 1) CÉU — azul vivo, mais claro perto do horizonte
  // -------------------------------------------------------------
  fill(60, 150, 225);
  quad(0, 0, 700, 0, 700, 300, 0, 300);
  fill(150, 205, 235);
  quad(0, 300, 700, 300, 700, 335, 0, 335);

  // -------------------------------------------------------------
  // 2) COLINAS AO FUNDO — curva feita de muitos quads finos
  // -------------------------------------------------------------
  // desenharColinaCurva() varre o eixo x da esquerda para a direita
  // e, para cada fatia bem fina, desenha um quad (retângulo) cuja
  // altura segue uma curva senoidal. Muitos retângulos finos e
  // vizinhos = silhueta arredondada, como uma colina de verdade.
  desenharColinaCurva(0, 700, 335, 150, 30, color(120, 70, 50));

  // -------------------------------------------------------------
  // 3) FAIXA DE ÁRVORES NA MARGEM (entre as colinas e a água)
  // -------------------------------------------------------------
  // Cada "árvore" é um triângulo (quad com vértice repetido). Para
  // ficar bem visível (e não só uma franjinha fina), desenhamos DUAS
  // camadas de copas, uma atrás da outra:
  //   - uma camada de fundo, mais escura e um pouco mais alta —
  //     dá profundidade, como árvores um pouco mais distantes;
  //   - uma camada da frente, mais clara/variada e mais baixa —
  //     como se estivesse mais perto de quem olha.
  // A altura de cada árvore varia com seno (mistura de duas
  // frequências) só para não ficar tudo perfeitamente igual.
  let baseArvores = 344;

  // Camada de trás (mais escura, mais alta)
  for (let x = -5; x < 700; x += 9) {
    let h = 30 + 16 * abs(sin(x * 0.09) + 0.4 * sin(x * 0.21));
    fill(30 + (x % 15), 70 + (x % 25), 40);
    quad(x, baseArvores, x + 11, baseArvores,
         x + 5.5, baseArvores - h, x + 5.5, baseArvores - h);
  }

  // Camada da frente (mais clara, mais baixa, ligeiramente deslocada)
  for (let x = -2; x < 700; x += 9) {
    let h = 16 + 12 * abs(sin(x * 0.17 + 1.5));
    // Alterna entre alguns tons de verde (e um toque de amarelo-outono,
    // como na foto de referência) usando o resto da divisão por 27.
    let r = x % 27;
    if (r < 9)       fill(60, 120, 55);
    else if (r < 18) fill(90, 140, 60);
    else             fill(150, 130, 50); // toque de outono
    quad(x, baseArvores + 4, x + 10, baseArvores + 4,
         x + 5, baseArvores + 4 - h, x + 5, baseArvores + 4 - h);
  }

  // -------------------------------------------------------------
  // 4) PRÉDIOS DISTANTES DO LADO DIREITO (margem oposta)
  // -------------------------------------------------------------
  let px = 470;
  let largurasP = [30, 45, 25, 50, 35, 40, 28];
  let alturasP  = [30, 45, 22, 55, 32, 40, 26];
  for (let i = 0; i < largurasP.length; i++) {
    let w = largurasP[i], h = alturasP[i];
    let topo = 340 - h;
 
    // Corpo do prédio (retângulo)
    fill(225 - i * 4, 212 - i * 4, 190 - i * 3);
    quad(px, 340, px + w, 340, px + w, topo, px, topo);
 
    // Telhado, desenhado logo acima do corpo do prédio.
    let corTelhado = color(90 + i * 6, 55, 50);
    fill(corTelhado);
    if (i % 2 === 0) {
      // Telhado em ponta: sobe até um único vértice central. Os
      // dois últimos pares de coordenadas são iguais de propósito —
      // é o truque de "colapsar" um lado do quad num só ponto.
      let alturaTelhado = 14;
      quad(px, topo, px + w, topo,
           px + w / 2, topo - alturaTelhado, px + w / 2, topo - alturaTelhado);
    } else {
      // Telhado raso (trapézio): mais largo na base, um pouco mais
      // estreito no topo — como um telhado "cortado" (mansarda).
      let alturaTelhado = 9;
      let recuo = w * 0.18; // quanto o topo do telhado "encolhe" para dentro
      quad(px, topo, px + w, topo,
           px + w - recuo, topo - alturaTelhado, px + recuo, topo - alturaTelhado);
    }
 
    px += w + 3;
  }

  // -------------------------------------------------------------
  // 5) LAGO — gradiente feito de faixas horizontais finas
  // -------------------------------------------------------------
  // Mesmo truque das colinas, só que aqui variamos a COR (não a
  // altura) de cada faixa fina, criando um degradê suave do azul
  // escuro (longe) para o azul mais claro (perto de nós).
  let yTopoLago = 340;
  let yBaseLago = 460;
  let faixas = 40;
  for (let i = 0; i < faixas; i++) {
    let t = i / (faixas - 1);
    let y0 = lerp(yTopoLago, yBaseLago, t);
    let y1 = lerp(yTopoLago, yBaseLago, (i + 1) / (faixas - 1));
    let corFaixa = lerpColor(color(25, 90, 140), color(90, 165, 195), t);
    fill(corFaixa);
    quad(0, y0, 700, y0, 700, y1, 0, y1);
  }

  // -------------------------------------------------------------
  // 6) MARINA — vários mastros finos perto das duas margens
  // -------------------------------------------------------------
  // Cada mastro é só um quad bem estreito e alto (um "risco"),
  // igual ao mastro do barco no sketch anterior.
  fill(40);
  for (let x = 20; x < 260; x += 14) {
    let h = 18 + 12 * abs(sin(x * 0.3));
    quad(x, 340, x + 1.5, 340, x + 1.5, 340 - h, x, 340 - h);
  }

  // -------------------------------------------------------------
  // 7) JET D'EAU — jato fino, alto, com leque de espuma ao vento
  // -------------------------------------------------------------
  let jetX = 380;       // base do jato (x)
  let jetBaseY = 345;   // base do jato (y), na linha da água
  let jetTopY = 70;     // topo do jato — bem alto, como na foto

  // Píer de pedra, pequeno, entrando na água.
  fill(160, 155, 145);
  quad(jetX - 45, 345, jetX + 40, 345, jetX + 32, 356, jetX - 35, 356);

  // Coluna de água: fininha embaixo, e a foto mostra que ela sobe
  // quase reta — por isso o quad é bem estreito em toda a altura.
  fill(255, 255, 255, 235);
  quad(jetX - 3, jetBaseY, jetX + 3, jetBaseY, jetX + 2, jetTopY, jetX - 2, jetTopY);

  // Leque de espuma no topo: muitos triângulos bem finos (quads com
  // vértice repetido), todos partindo do topo da coluna, mas
  // inclinados majoritariamente para a DIREITA — imitando o vento
  // soprando a névoa de água, como na foto de referência.
  let raios = 26;
  for (let i = 0; i < raios; i++) {
    // Ângulos concentrados entre -15° (quase reto) e 55° (bem
    // jogado para o lado) — por isso o mapeamento não é simétrico.
    let anguloGraus = map(i, 0, raios - 1, -15, 90);
    let angulo = radians(anguloGraus);
    let comprimento = random(50, 130);

    let pontaX = jetX + sin(angulo) * comprimento;
    let pontaY = jetTopY - cos(angulo) * comprimento * 0.55 + random(-6, 6);

    fill(255, 255, 255, random(90, 170));
    quad(jetX - 2, jetTopY, jetX + 2, jetTopY, pontaX, pontaY, pontaX, pontaY);
  }

  // -------------------------------------------------------------
  // 8) ARCO-ÍRIS — sete faixas curvas, cada uma feita de vários
  //    quads em forma de "fatia de pizza" (a mesma técnica do sol
  //    do primeiro sketch, mas usada em pedaços de anel, não num
  //    círculo inteiro).
  // -------------------------------------------------------------
  let coresArcoIris = [
    color(230, 30, 30),   // vermelho
    color(255, 140, 0),   // laranja
    color(255, 215, 0),   // amarelo
    color(40, 170, 90),   // verde
    color(30, 110, 210),  // azul
    color(70, 50, 160),   // anil
    color(150, 60, 170)   // violeta
  ];

  // Para ALINHAR o arco com o jato, escolhemos o centro do "círculo
  // imaginário" do arco-íris bem perto da BASE do jato (jetX,
  // jetBaseY) — quase como se o arco-íris fosse visto "de lado",
  // saindo de perto da base da água. Assim, o arco nasce logo acima
  // do topo do jato (onde a névoa é mais densa) e desce suavemente
  // até encostar na linha da água, do lado direito — igual à foto.
  let centroArcoX = jetX - 10;
  let centroArcoY = jetBaseY + 5;
  let anguloInicial = radians(-87);  // aponta quase pra cima (perto do topo do jato)
  let anguloFinal   = radians(-2);   // aponta quase pra direita (perto da água)
  let raioInterno = 232;             // raio do primeiro (menor) anel

  for (let banda = 0; banda < coresArcoIris.length; banda++) {
    let rIn  = raioInterno + banda * 6;
    let rOut = rIn + 6;
    fill(coresArcoIris[banda]);

    // Divide o arco em vários segmentos pequenos — quanto mais
    // segmentos, mais suave (mais "curva") o arco parece.
    let segmentos = 24;
    for (let s = 0; s < segmentos; s++) {
      let a0 = lerp(anguloInicial, anguloFinal, s / segmentos);
      let a1 = lerp(anguloInicial, anguloFinal, (s + 1) / segmentos);

      // 4 vértices do "trapézio" que forma este pedacinho do anel:
      // dois pontos no raio interno e dois no raio externo.
      let x1 = centroArcoX + cos(a0) * rIn,  y1 = centroArcoY + sin(a0) * rIn;
      let x2 = centroArcoX + cos(a1) * rIn,  y2 = centroArcoY + sin(a1) * rIn;
      let x3 = centroArcoX + cos(a1) * rOut, y3 = centroArcoY + sin(a1) * rOut;
      let x4 = centroArcoX + cos(a0) * rOut, y4 = centroArcoY + sin(a0) * rOut;

      quad(x1, y1, x2, y2, x3, y3, x4, y4);
    }
  }

  // -------------------------------------------------------------
  // 9) BARCO DE PASSEIO (vermelho e amarelo, como na foto)
  // -------------------------------------------------------------
  let bx = 330, by = 400;   // posição de referência do barco

  // Casco (trapézio vermelho)
  fill(190, 40, 35);
  quad(bx, by, bx + 130, by, bx + 118, by + 22, bx + 12, by + 22);

  // Faixa amarela no casco
  fill(235, 190, 40);
  quad(bx + 6, by + 10, bx + 124, by + 10, bx + 118, by + 22, bx + 12, by + 22);

  // Cabine (retângulo creme)
  fill(230, 222, 205);
  quad(bx + 15, by - 26, bx + 115, by - 26, bx + 115, by, bx + 15, by);

  // Janelinhas da cabine (vários quads pequenos e claros, em fileira)
  fill(120, 190, 225);
  for (let jx = bx + 24; jx < bx + 108; jx += 16) {
    quad(jx, by - 19, jx + 10, by - 19, jx + 10, by - 8, jx, by - 8);
  }

  // Teto do barco (fininho, levemente saindo da cabine)
  fill(160, 30, 30);
  quad(bx + 10, by - 30, bx + 120, by - 30, bx + 120, by - 26, bx + 10, by - 26);

  // Bandeira suíça na popa do barco — pequena, no mastro de trás.
  fill(40);
  quad(bx + 122, by - 30, bx + 124, by - 30, bx + 124, by - 44, bx + 122, by - 44);
  fill(200, 30, 30);
  quad(bx + 124, by - 44, bx + 136, by - 44, bx + 136, by - 34, bx + 124, by - 34);
  fill(255);
  quad(bx + 128.5, by - 42, bx + 131.5, by - 42, bx + 131.5, by - 36, bx + 128.5, by - 36);
  quad(bx + 126, by - 40.5, bx + 134, by - 40.5, bx + 134, by - 37.5, bx + 126, by - 37.5);

  // -------------------------------------------------------------
  // 10) VELEIRO PEQUENO AO FUNDO, perto do jato
  // -------------------------------------------------------------
  fill(30);
  quad(268, 340, 271, 340, 271, 300, 268, 300);   // mastro
  fill(255);
  quad(271, 302, 271, 338, 292, 326, 271, 302);   // vela (triângulo)
  fill(60, 50, 45);
  quad(258, 340, 282, 340, 278, 346, 262, 346);   // casco pequeno
}

// =====================================================================
// FUNÇÃO AUXILIAR: desenha uma "colina" arredondada usando muitos
// quads finos e verticais, cada um com uma altura diferente, seguindo
// uma curva senoidal. Quanto mais fina cada fatia, mais suave a curva.
//
// Parâmetros:
//   xIni, xFim   -> intervalo horizontal ocupado pela colina
//   yBase        -> altura (y) onde a colina "encosta" no chão
//   altMedia     -> altura média do topo da colina
//   variacao     -> o quanto o topo sobe/desce (ondulação)
//   corColina    -> cor de preenchimento
// =====================================================================
function desenharColinaCurva(xIni, xFim, yBase, altMedia, variacao, corColina) {
  fill(corColina);
  let passo = 4; // largura de cada fatia — quanto menor, mais suave
  for (let x = xIni; x < xFim; x += passo) {
    // A curva é a soma de duas ondas senoidais com frequências
    // diferentes, só para o contorno não parecer perfeitamente
    // regular (fica mais parecido com uma cordilheira real).
    let topo = yBase - altMedia
      - variacao * sin(x * 0.012)
      - variacao * 0.4 * sin(x * 0.035 + 2);

    quad(x, yBase, x + passo, yBase, x + passo, topo, x, topo);
  }
}