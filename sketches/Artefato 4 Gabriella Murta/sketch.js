
/*
  A DIFERENÇA EM RELAÇÃO AO SKETCH DO CÍRCULO
  ---------------------------------------------
  No sketch anterior, todas as cópias giravam em torno do MESMO ponto
  fixo -> por isso o resultado fechava um arco/círculo.

  Aqui, a forma (a letra K) tem dois pontos especiais:
    - EIXO DE ENTRADA = canto superior-esquerdo do K (é em torno dele
      que a forma gira dentro de uma "revolução").
    - EIXO DE SAÍDA    = canto inferior-direito do K.

  Fazemos uma "revolução" (um bloco de cópias giradas, igual antes) em
  torno do eixo de entrada atual. Quando a revolução termina, calculamos
  para onde o EIXO DE SAÍDA foi parar (já rodado) e usamos essa posição
  como o novo eixo de entrada da revolução seguinte.

  Como o eixo pula de lugar a cada revolução, o desenho não fecha um
  círculo: ele "caminha" pelo canvas — sempre em linha reta, na direção
  definida pelo ângulo inicial e pelo sentido de giro daquele braço.

  NOVIDADE DESTA VERSÃO: em vez de UMA cadeia só, disparamos VÁRIOS
  "braços" ao mesmo tempo, todos a partir do mesmo ponto central, cada
  um apontando para um ângulo inicial diferente e girando em um sentido
  diferente. Como todos nascem no mesmo lugar, eles se sobrepõem bem no
  meio do canvas e depois se espalham em direções distintas — daí o
  efeito de "várias direções de giro sobrepostas".
*/

// ---------------------------------------------------------------
// PARÂMETROS AJUSTÁVEIS
// ---------------------------------------------------------------

let copiasPorRevolucao = 60;   // quantas cópias do K em cada "bloco"
let passoDoAngulo      = 9;    // graus a mais de giro a cada cópia
let espessuraLinha     = 1;
let transparencia      = 15;   // 0 = invisível, 100 = opaco
let margem             = 30;   // até onde um braço pode andar antes de parar
let numeroDeBracos     = 12;    // quantas direções diferentes vamos sobrepor

// A letra K desenhada como um único traço contínuo (uma "caneta" que
// não levanta do papel): desce a haste, volta ao meio, sai na diagonal
// de cima, volta ao meio de novo, sai na diagonal de baixo.
// Cada par [x, y] é relativo ao EIXO DE ENTRADA, que é o ponto (0,0).
let letraK = [
  [0,   0],   // 0: topo-esquerda      -> EIXO DE ENTRADA desta cópia
  [0,  70],   // 1: base-esquerda       (desce a haste vertical)
  [0,  35],   // 2: meio-esquerda       (volta para o meio)
  [50,  0],   // 3: topo-direita        (perna de cima, na diagonal)
  [0,  35],   // 4: meio-esquerda       (volta para o meio outra vez)
  [50, 70]    // 5: base-direita        -> EIXO DE SAÍDA (vira o próximo eixo)
];
let indiceEixoSaida = 5; // qual ponto da lista acima é o "eixo de saída"

// A cor é uma variável GLOBAL (fora de qualquer função) porque queremos
// que TODOS os braços continuem o mesmo ciclo de cores uns dos outros,
// em vez de cada um recomeçar do zero.
let matizGlobal = 0;

/*
  FUNÇÃO desenharCadeia
  ----------------------
  Desenha UM braço: uma sequência de revoluções encadeadas, começando
  em (eixoXInicial, eixoYInicial) e seguindo sempre em frente, na
  direção definida pelos dois parâmetros abaixo, até sair da área útil
  do canvas.

  - anguloInicial: para que ângulo (em graus) este braço "aponta" —
    é isso que faz cada braço sair do centro numa direção diferente.

  - sentidoGiro:  1  = as cópias giram para um lado dentro da revolução
                 -1  = as cópias giram para o lado oposto
    (é essa inversão que faz o braço curvar/sair na direção contrária)
*/
function desenharCadeia(eixoXInicial, eixoYInicial, sentidoGiro, anguloInicial) {
  let eixoX = eixoXInicial;
  let eixoY = eixoYInicial;
  let trava = 0; // contador de segurança, evita loop infinito por engano

  // Continua enquanto o eixo atual ainda estiver dentro da área útil.
  while (trava < 500 &&
         eixoX > margem && eixoX < width - margem &&
         eixoY > margem && eixoY < height - margem) {
    trava++;

    // ---- Uma revolução: gira o K várias vezes em torno do eixo atual ----
    for (let j = 0; j < copiasPorRevolucao; j++) {
      // Somamos anguloInicial para "apontar" o braço inteiro para o
      // ângulo desejado, e sentidoGiro inverte o sentido do giro.
      let anguloAtual = anguloInicial + sentidoGiro * j * passoDoAngulo;

      matizGlobal = (matizGlobal + 1.5) % 360;
      stroke(matizGlobal, 90, 100, transparencia);
      strokeWeight(espessuraLinha);

      push();
        translate(eixoX, eixoY);          // move a origem para o eixo atual
        rotate(radians(anguloAtual));     // gira em torno dessa origem

        beginShape();
        for (let p = 0; p < letraK.length; p++) {
          vertex(letraK[p][0], letraK[p][1]);
        }
        endShape();
      pop();
    }

    // ---- Fim da revolução: onde parou o EIXO DE SAÍDA do último K? ----
    let anguloFinalRad = radians(anguloInicial + sentidoGiro * (copiasPorRevolucao - 1) * passoDoAngulo);
    let pontaX = letraK[indiceEixoSaida][0];
    let pontaY = letraK[indiceEixoSaida][1];

    // Fórmula de rotação de um ponto (px, py) em torno da origem:
    let pontaGiradaX = pontaX * cos(anguloFinalRad) - pontaY * sin(anguloFinalRad);
    let pontaGiradaY = pontaX * sin(anguloFinalRad) + pontaY * cos(anguloFinalRad);

    // A próxima revolução deste braço começa exatamente onde esta terminou.
    eixoX = eixoX + pontaGiradaX;
    eixoY = eixoY + pontaGiradaY;
  }
}

function setup() {
  createCanvas(640, 640);
  colorMode(HSB, 360, 100, 100, 100);
  background(0);
  blendMode(ADD); // cores se somam onde as linhas se cruzam (efeito de brilho)
  noFill();

  let centroX = width / 2;
  let centroY = height / 2;

  // -----------------------------------------------------------
  // Disparamos vários braços a partir do mesmo ponto central.
  // Cada braço i aponta para um ângulo diferente, espalhados
  // igualmente ao redor do círculo (360 / numeroDeBracos graus
  // de diferença entre um braço e o próximo).
  // O sentido de giro alterna entre +1 e -1 usando o resto da
  // divisão por 2 (i % 2) — braços pares giram de um jeito,
  // braços ímpares giram do jeito oposto.
  // -----------------------------------------------------------
  for (let i = 0; i < numeroDeBracos; i++) {
    let anguloDoBraco = i * (360 / numeroDeBracos);
    let sentidoDoBraco = (i % 2 === 0) ? 1 : -1;
    desenharCadeia(centroX, centroY, sentidoDoBraco, anguloDoBraco);
  }
}