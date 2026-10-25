// ============================================================
// REBANHO PARAMÉTRICO 3D — "A PORTA DAS OVELHAS"
// p5.js 2 · modo WEBGL
// ============================================================
//
// O QUE ESTE SKETCH FAZ
// ------------------------------------------------------------
// Cinco ovelhas de brinquedo, uma para cada faixa etária enfileiradas e saltando em direção a uma
// porta entreaberta de onde sai luz.
//
// As cinco NÃO são cinco modelos diferentes. Existe UMA ovelha
// só, construída a partir de parâmetros — tamanho, gordura,
// quantidade de lã, número de patas no chão, acessório. Mudando
// os números, muda a personagem. É o mesmo princípio de um
// molde de brinquedo: a matriz é uma, as variações são muitas.
//
// OS CONCEITOS DOS TUTORIAIS, E ONDE ELES APARECEM
// ------------------------------------------------------------
// De "Coordinates and Transformations":
//   • WEBGL põe a origem (0,0,0) no MEIO da tela, e o eixo Y
//     aponta para BAIXO. Por isso, neste código, subir é ir para
//     y NEGATIVO. Os pés de cada ovelha ficam em y = 0.
//   • translate/rotate/scale posicionam cada peça do corpo em
//     relação à peça anterior, como um esqueleto.
//   • push() e pop() são o que torna isso possível: cada parte
//     é desenhada dentro de um push/pop próprio, então as
//     transformações de uma perna não vazam para a outra.
//   • A ORDEM IMPORTA: transladar e depois girar é diferente de
//     girar e depois transladar. As orelhas e os braços dependem
//     disso.
//
// De "Lights, Camera, Materials":
//   • A luz é dividida em três: uma ambiente fraca que preenche
//     as sombras, uma direcional que dá o volume, e uma pontual
//     dentro da porta, que é o que faz o rebanho ser iluminado
//     por trás ao se aproximar.
//   • O aspecto de PLÁSTICO vem da combinação de ambientMaterial
//     (a cor própria) com specularMaterial e shininess alto —
//     é o brilho concentrado que faz uma superfície parecer
//     moldada, e não pintada.
//   • A porta usa emissiveMaterial: ela não reflete luz, ela
//     É luz.
//
// 
//
// TECLAS
// ------------------------------------------------------------
//   G ....... gira a cena com o mouse (para inspecionar o modelo)
//   ESPAÇO .. pausa
// ============================================================

// ------------------------------------------------------------
// OS CINCO PERFIS
// ------------------------------------------------------------
// Cada linha é uma personagem. Mudar um número aqui muda a
// ovelha inteira — não há nenhum modelo desenhado à mão.
//
//   escala    tamanho geral
//   gordura   o quanto o corpo infla (1 = padrão)
//   la        quantidade e tamanho dos tufos de lã
//   pernas    4 = quadrúpede, 2 = bípede (fica em pé)
//   agito     altura e frequência do salto
//   acessorio o que a ovelha carrega
//   cor       cor da faixa do suéter
const PERFIS = [
  {
    nome: "3-4 anos",
    escala: 0.70, gordura: 0.80, la: 0.50,
    pernas: 4, agito: 0.75, acessorio: "nenhum",
    cor: [232, 112, 104]
  },
  {
    nome: "5-6 anos",
    escala: 0.88, gordura: 1.40, la: 1.25,
    pernas: 4, agito: 0.85, acessorio: "nenhum",
    cor: [104, 176, 156]
  },
  {
    nome: "7-8 anos",
    escala: 0.95, gordura: 0.62, la: 0.55,
    pernas: 4, agito: 1.55, acessorio: "nenhum",
    cor: [240, 186, 84]
  },
  {
    nome: "9-10 anos",
    escala: 1.02, gordura: 0.95, la: 0.75,
    pernas: 4, agito: 1.15, acessorio: "nenhum",
    cor: [86, 146, 214]
  },
  {
    nome: "11-12 anos",
    escala: 1.08, gordura: 0.88, la: 0.90,
    pernas: 4, agito: 1.00, acessorio: "nenhum",
    cor: [196, 64, 76]
  }
];

// ------------------------------------------------------------
// CENÁRIO
// ------------------------------------------------------------
const PORTA_X = -330;      // a porta fica à esquerda
const INICIO_X = 420;      // onde a fila começa, à direita
const ESPACO_FILA = 170;   // distância entre uma ovelha e outra
const VELOCIDADE = 0.50;   // avanço da fila por quadro

// ------------------------------------------------------------
// CORES (material plástico de brinquedo)
// ------------------------------------------------------------
const LA_CLARA = [248, 244, 236];   // a lã, branco-creme
const PELE = [242, 236, 226];       // focinho e orelhas
const CASCO = [38, 34, 32];         // cascos e olhos
const CHAO = [196, 186, 172];

// ------------------------------------------------------------
// VARIÁVEIS GLOBAIS
// ------------------------------------------------------------
let ovelhas = [];
let pausado = false;
let girarComMouse = false;

function setup() {
  createCanvas(960, 560, WEBGL);

  // Cada ovelha ganha seus tufos de lã sorteados UMA vez, no
  // início. Se sorteássemos a cada quadro, a lã ficaria fervendo.
  for (let i = 0; i < PERFIS.length; i++) {
    let p = PERFIS[i];
    ovelhas.push({
      perfil: p,
      tufos: sortearTufos(p, i),   // posições fixas da lã
      percurso: i * ESPACO_FILA,   // posição na fila
      fase: random(TWO_PI)         // desencontra os saltos
    });
  }
}

// ============================================================
// A LÃ
// ------------------------------------------------------------
// Os tufos são esferas distribuídas sobre a superfície de um
// elipsoide imaginário — o corpo. Para cada tufo sorteamos dois
// ângulos (como latitude e longitude num globo) e convertemos
// em coordenadas x, y, z.
//
// randomSeed() com um número fixo por ovelha faz o sorteio ser
// sempre o mesmo: assim a ovelha 3 é idêntica em toda execução,
// o que importa se ela vai virar um molde de brinquedo.
// ============================================================
function sortearTufos(perfil, semente) {
  randomSeed(1000 + semente * 37);

  let lista = [];
  let quantidade = floor(26 + perfil.la * 34);

  for (let i = 0; i < quantidade; i++) {
    // Dois ângulos definem um ponto na superfície de uma esfera.
    let u = random(TWO_PI);
    let v = random(-1, 1);
    let r = sqrt(1 - v * v);

    lista.push({
      x: r * cos(u),
      y: v,
      z: r * sin(u),
      tam: random(0.7, 1.25)
    });
  }

  randomSeed();   // devolve a aleatoriedade ao normal
  return lista;
}

function draw() {
  background(26, 24, 30);

  // --- CÂMERA ---
  // Levemente acima e à direita, olhando para o centro. A cena é
  // vista quase de perfil, para que a fila se leia como fila.
  if (girarComMouse) {
    orbitControl();   // arrastar para inspecionar o modelo
  } else {
    camera(80, -150, 620, -40, -40, 0, 0, 1, 0);
  }

  acenderLuzes();
  desenharChao();
  desenharPorta();

  // --- O REBANHO ---
  if (!pausado) avancarFila();

  for (let ov of ovelhas) {
    desenharNaFila(ov);
  }
}

// ============================================================
// AS LUZES
// ------------------------------------------------------------
// Três camadas, cada uma com um papel:
//
//   1. ambientLight — luz sem direção, que preenche as sombras.
//      Sozinha, deixa tudo chapado. Serve para que as partes não
//      iluminadas não fiquem pretas.
//
//   2. directionalLight — vem de uma direção e não tem posição,
//      como o sol. É ela que cria o volume: o lado voltado para
//      a luz clareia, o oposto escurece.
//
//   3. pointLight — tem posição e espalha em todas as direções,
//      como uma lâmpada. Está DENTRO da porta, e é o que faz as
//      ovelhas ganharem um contorno luminoso ao se aproximarem.
//
// Todas precisam ser chamadas dentro de draw(), a cada quadro.
// ============================================================
function acenderLuzes() {
  ambientLight(52, 50, 58);

  // O sol, vindo de cima e da direita.
  directionalLight(205, 200, 195, -0.45, 0.6, -0.5);

  // A lâmpada dentro da porta, levemente quente.
  pointLight(255, 246, 220, PORTA_X - 30, -120, 0);

  // Um realce frio no lado oposto, para separar as ovelhas do
  // fundo escuro. Luz de recorte, no vocabulário do cinema.
  directionalLight(70, 80, 110, 0.7, -0.2, 0.6);
}

// ============================================================
// O CHÃO
// ------------------------------------------------------------
// Um plano é criado em pé (no plano XY). Para deitá-lo, giramos
// 90 graus em torno do eixo X. Esse rotateX(HALF_PI) é o jeito
// padrão de fazer piso em WEBGL.
// ============================================================
function desenharChao() {
  push();
  translate(0, 10, 0);
  rotateX(HALF_PI);
  noStroke();
  ambientMaterial(CHAO);
  specularMaterial(70);
  shininess(6);
  plane(2600, 1200);
  pop();
}

// ============================================================
// A PORTA
// ------------------------------------------------------------
// Um retângulo vertical de luz. emissiveMaterial faz a cor ser
// emitida, não refletida: a superfície aparece acesa mesmo sem
// nenhuma luz apontada para ela.
//
// São três planos sobrepostos, do maior e mais fraco ao menor e
// mais forte, criando um halo — o brilho se adensa no centro, e
// a borda se dissolve no escuro.
// ============================================================
function desenharPorta() {
  push();
  translate(PORTA_X, -150, 0);

  noStroke();

  // Halo externo, bem suave.
  push();
  emissiveMaterial(120, 112, 92);
  plane(160, 300);
  pop();

  // Faixa média.
  push();
  translate(0, 0, 0.6);
  emissiveMaterial(226, 214, 176);
  plane(60, 360);
  pop();

  // Núcleo: a fresta propriamente dita, quase branca.
  push();
  translate(0, 0, 1.2);
  emissiveMaterial(255, 252, 240);
  plane(36, 330);
  pop();

  pop();
}

// ============================================================
// O MOVIMENTO DA FILA
// ------------------------------------------------------------
// Cada ovelha guarda só um número: o quanto já percorreu. Quando
// passa da porta, volta para o fim da fila — a fila é um ciclo,
// então o rebanho nunca acaba.
// ============================================================
function avancarFila() {
  let total = ovelhas.length * ESPACO_FILA;

  for (let ov of ovelhas) {
    ov.percurso -= VELOCIDADE;
    if (ov.percurso < -ESPACO_FILA) ov.percurso += total;
  }
}

// ============================================================
// POSICIONAR UMA OVELHA NA CENA
// ------------------------------------------------------------
// Aqui acontecem as transformações que movem a ovelha inteira:
// a posição na fila, o salto, a inclinação do pulo e o
// encolhimento ao atravessar a porta.
//
// Tudo isso fica DENTRO de um push/pop, então a ovelha seguinte
// começa do zero, sem herdar nada desta.
// ============================================================
function desenharNaFila(ov) {
  let p = ov.perfil;

  // Posição ao longo do caminho, da direita para a porta.
  let x = INICIO_X - (INICIO_X - PORTA_X) * 0 + ov.percurso + PORTA_X;

  // --- O SALTO ---
  // Um seno retificado: a ovelha sobe e desce, mas nunca afunda
  // no chão. O valor absoluto transforma a onda em pulinhos.
  let t = frameCount * 0.045 * p.agito + ov.fase;
  let salto = abs(sin(t)) * 46 * p.agito;

  // No ar a ovelha se inclina um pouco para a frente, como
  // qualquer bicho que pula.
  let inclinacao = cos(t) * 0.14 * p.agito;

  // --- A ENTRADA NA PORTA ---
  // Nos últimos 120 pixels antes da porta, a ovelha encolhe até
  // sumir: é a travessia para dentro da luz. Usamos scale() com
  // um valor que vai de 1 a 0.
  let proximidade = constrain(map(x, PORTA_X + 50, PORTA_X + 10, 1, 0), 0, 1);
  if (proximidade <= 0.02) return;   // já entrou; nada a desenhar

  push();
  translate(x, -salto, 0);
  rotateZ(inclinacao);
  scale(proximidade);
  desenharOvelha(ov);
  pop();
}

// ============================================================
// A OVELHA PARAMÉTRICA
// ------------------------------------------------------------
// Esta é a única função que desenha um animal, e ela serve às
// cinco. Tudo o que distingue uma ovelha da outra entra por
// ov.perfil.
//
// O corpo é montado de baixo para cima, cada peça posicionada em
// relação ao centro do corpo. A estrutura de push/pop aninhados
// funciona como uma hierarquia: a cabeça carrega as orelhas, os
// olhos e o focinho, então mover a cabeça move tudo junto.
// ============================================================
function desenharOvelha(ov) {
  let p = ov.perfil;

  push();
  scale(p.escala);

  // --- Dimensões derivadas dos parâmetros ---
  let corpoL = 58 * p.gordura;        // meia-largura do tronco
  let corpoA = 44 * (0.7 + p.gordura * 0.35);
  let corpoP = 40 * p.gordura;
  let alturaPerna = p.pernas === 4 ? 46 : 58;

  // Quadrúpede fica deitado na horizontal; bípede, em pé.
  let ehBipede = p.pernas === 2;

  // O centro do tronco fica acima do chão, a altura das pernas.
  // Lembre: y negativo é PARA CIMA em WEBGL.
  let centroY = -(alturaPerna + corpoA * 0.8);

  // ---------- PERNAS ----------
  desenharPernas(p, alturaPerna, corpoL, corpoP, ehBipede);

  // ---------- TRONCO ----------
  push();
  translate(0, centroY, 0);
  if (ehBipede) rotateZ(0.06);        // leve empinada

  // A lã cobre o tronco: muitas esferinhas sobre a superfície do
  // elipsoide. Esta é a única parte "cara" do desenho, e é o que
  // dá a textura de brinquedo moldado.
  desenharLa(ov, corpoL, corpoA, corpoP);

  // O corpo sólido por baixo, para que não haja frestas entre
  // os tufos.
  push();
  plastico(LA_CLARA);
  if (ehBipede) {
    ellipsoid(corpoL * 0.72, corpoA * 1.15, corpoP * 0.78);
  } else {
    ellipsoid(corpoL, corpoA, corpoP);
  }
  pop();


  // ---------- CABEÇA ----------
  // Posicionada em relação ao tronco: à frente no quadrúpede,
  // acima no bípede.
  push();
  if (ehBipede) {
    translate(-corpoL * 0.15, -corpoA * 1.5, 0);
  } else {
    translate(-corpoL * 1.05, -corpoA * 0.85, 0);
  }
  desenharCabeca(p);
  pop();

  // ---------- RABINHO ----------
  push();
  translate(corpoL * 0.95, -corpoA * 0.2, 0);
  plastico(LA_CLARA);
  sphere(11 * (0.8 + p.la * 0.4), 10, 8);
  pop();

  pop();   // fim do tronco

  // ---------- ACESSÓRIO ----------
  desenharAcessorio(p, centroY, corpoL, alturaPerna);

  pop();   // fim da escala geral
}

// ============================================================
// PERNAS
// ------------------------------------------------------------
// Quatro cilindros (ou dois), cada um com um casco escuro na
// ponta. Repare no padrão: cada perna é desenhada dentro do seu
// próprio push/pop, com um translate que a leva para o seu canto
// do corpo. Sem o push/pop, a segunda perna sairia deslocada
// pela transformação da primeira.
// ============================================================
function desenharPernas(p, altura, corpoL, corpoP, ehBipede) {
  let raio = 7.5 * (0.8 + p.gordura * 0.3);

  // Posições das patas no plano do chão.
  let posicoes = ehBipede
    ? [[-corpoP * 0.42, 0], [corpoP * 0.42, 0]]
    : [
        [-corpoP * 0.55, -corpoL * 0.62],
        [ corpoP * 0.55, -corpoL * 0.62],
        [-corpoP * 0.55,  corpoL * 0.62],
        [ corpoP * 0.55,  corpoL * 0.62]
      ];

  for (let i = 0; i < posicoes.length; i++) {
    let z = posicoes[i][0];
    let x = posicoes[i][1];

    push();
    translate(x, -altura / 2, z);

    // A perna
    plastico(PELE);
    cylinder(raio, altura, 10, 1);

    // O casco: um cilindro curto e escuro na base
    push();
    translate(0, altura / 2 - 5, 0);
    plastico(CASCO);
    cylinder(raio * 1.18, 12, 10, 1);
    pop();

    pop();
  }
}

// ============================================================
// LÃ
// ------------------------------------------------------------
// Cada tufo foi sorteado como um ponto na superfície de uma
// esfera de raio 1. Aqui multiplicamos esse ponto pelas medidas
// reais do corpo, o que o estica para a forma do elipsoide.
// ============================================================
function desenharLa(ov, corpoL, corpoA, corpoP) {
  let p = ov.perfil;
  let tamBase = 15 * (0.7 + p.la * 0.65);

  plastico(LA_CLARA);

  for (let tufo of ov.tufos) {
    push();
    translate(
      tufo.x * corpoL * 0.92,
      tufo.y * corpoA * 0.92,
      tufo.z * corpoP * 0.92
    );
    // detailX e detailY baixos: esferas facetadas pesam menos e
    // combinam com o aspecto de peça moldada.
    sphere(tamBase * tufo.tam, 8, 6);
    pop();
  }
}


// ============================================================
// CABEÇA
// ------------------------------------------------------------
// A hierarquia aparece aqui com clareza: tudo é posicionado em
// relação ao centro da cabeça, e um único translate lá em cima
// move o conjunto inteiro.
// ============================================================
function desenharCabeca(p) {
  let r = 26 * (0.85 + p.escala * 0.2);

  // Topete de lã
  push();
  plastico(LA_CLARA);
  translate(0, -r * 0.55, 0);
  for (let i = 0; i < 5; i++) {
    push();
    rotateY((TWO_PI / 5) * i);
    translate(r * 0.42, 0, 0);
    sphere(r * 0.46 * (0.8 + p.la * 0.35), 8, 6);
    pop();
  }
  sphere(r * 0.52, 8, 6);
  pop();

  // Crânio
  push();
  plastico(PELE);
  ellipsoid(r * 0.78, r * 0.82, r * 0.70);
  pop();

  // Focinho, projetado para a frente
  push();
  translate(-r * 0.52, r * 0.22, 0);
  plastico(PELE);
  ellipsoid(r * 0.46, r * 0.34, r * 0.38);

  // Narina / ponta escura
  push();
  translate(-r * 0.34, -r * 0.04, 0);
  plastico(CASCO);
  ellipsoid(r * 0.14, r * 0.11, r * 0.16);
  pop();
  pop();

  // Orelhas: a ordem das transformações decide tudo aqui.
  // Primeiro vamos para a lateral da cabeça (translate), depois
  // giramos a orelha no lugar (rotate) e só então a desenhamos
  // esticada (scale dentro do ellipsoid).
  for (let lado of [-1, 1]) {
    push();
    translate(r * 0.1, -r * 0.18, lado * r * 0.66);
    rotateX(lado * 0.5);
    rotateZ(0.35);
    plastico(PELE);
    ellipsoid(r * 0.16, r * 0.1, r * 0.42);
    pop();
  }

  // Olhos
  for (let lado of [-1, 1]) {
    push();
    translate(-r * 0.42, -r * 0.05, lado * r * 0.36);
    plastico(CASCO);
    sphere(r * 0.13, 10, 8);
    pop();
  }
}

// ============================================================
// ACESSÓRIOS
// ------------------------------------------------------------
// O que distingue a esportista da roqueira. São peças separadas,
// o que para impressão 3D é conveniente: dá para imprimir o
// corpo uma vez e trocar o acessório.
// ============================================================
function desenharAcessorio(p, centroY, corpoL, alturaPerna) {
  if (p.acessorio === "bola") {
    // Bola de futebol equilibrada ao lado, no alto da pata.
    push();
    translate(-corpoL * 1.1, centroY + 10, 46);
    rotateY(frameCount * 0.03);
    plastico([246, 246, 244]);
    sphere(21, 12, 10);

    // Os gomos escuros: pequenos blocos distribuídos pela esfera
    for (let i = 0; i < 6; i++) {
      push();
      rotateY((TWO_PI / 6) * i);
      rotateX(0.7);
      translate(0, -20, 0);
      plastico(CASCO);
      box(9, 3, 9);
      pop();
    }
    pop();
  }

  if (p.acessorio === "guitarra") {
    // Guitarra cruzada no corpo.
    push();
    translate(-corpoL * 0.3, centroY + 26, 44);
    rotateZ(-0.55);
    rotateY(0.25);

    // Corpo da guitarra
    push();
    plastico([188, 48, 58]);
    ellipsoid(26, 32, 7);
    pop();

    // Braço
    push();
    translate(0, -58, 0);
    plastico([84, 58, 42]);
    box(11, 72, 6);
    pop();

    // Cabeça do braço
    push();
    translate(0, -100, 0);
    plastico(CASCO);
    box(16, 16, 6);
    pop();
    pop();

    // Crista de roqueira, em cima da cabeça
    push();
    translate(-corpoL * 0.15, centroY - 86, 0);
    for (let i = 0; i < 5; i++) {
      push();
      translate(i * 7 - 14, -i * 1.5 + abs(i - 2) * 3, 0);
      plastico([192, 60, 72]);
      box(5, 22 - abs(i - 2) * 4, 13);
      pop();
    }
    pop();
  }
}

// ============================================================
// O MATERIAL PLÁSTICO
// ------------------------------------------------------------
// É a combinação que produz a aparência de brinquedo moldado:
//
//   ambientMaterial — a cor própria do objeto, que responde à
//                     luz ambiente. É o "pigmento".
//   specularMaterial — a cor do BRILHO refletido. Plástico
//                      reflete branco, qualquer que seja a cor
//                      da peça; metal reflete a própria cor.
//   shininess — o quanto esse brilho se concentra. Valor baixo
//               espalha (fosco); valor alto concentra num ponto
//               pequeno e duro, que é o que o olho lê como
//               superfície plástica lisa.
// ============================================================
function plastico(cor) {
  noStroke();
  ambientMaterial(cor[0], cor[1], cor[2]);
  specularMaterial(252);
  shininess(48);
}
