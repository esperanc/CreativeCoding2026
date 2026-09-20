/*
  ================================================================
  TERRA RACHADA
  ================================================================
  Um solo ressecado e rachado, em vista de cima, com um único broto
  verde nascendo bem no meio de uma das fendas. A superfície inteira
  — as placas de barro, as rachaduras entre elas — é construída com
  ruído de Worley (também chamado de ruído celular): em vez de somar
  ondas suaves como o ruído de Perlin, o Worley espalha alguns pontos
  pelo plano e, para cada posição, mede a distância até o ponto mais
  próximo. O resultado tem células e nervuras — o padrão clássico de
  solo rachado, pele ou pedra lascada.

  O canvas é quadrado e se adapta ao tamanho da janela disponível.
  Não há semente fixa de aleatoriedade: cada execução — e cada
  redimensionamento — sorteia um novo arranjo de placas e um novo
  lugar para o broto nascer.

  ----------------------------------------------------------------
  PRINCIPAIS TÉCNICAS
  ----------------------------------------------------------------
  - Distribuição dos pontos-semente (sortearPontosAfastados): em vez
    de sortear os pontos de forma totalmente livre — o que deixaria
    algumas placas enormes e outras minúsculas, grudadas demais —,
    cada novo ponto é escolhido entre vários candidatos, ficando
    sempre com o mais distante dos pontos já colocados. O resultado
    são placas de tamanho parecido, sem alinhar numa grade, muito
    mais perto de como o barro real racha.
  - Ruído de Worley (duasMenoresDistancias / desenharTerraRachada):
    para cada célula da grade de amostragem, calculamos a distância
    até o ponto-semente mais próximo (F1) e até o segundo mais
    próximo (F2). Onde F2 − F1 é pequeno, estamos exatamente na
    fronteira entre duas placas — é ali que a rachadura aparece. Fora
    dessas fronteiras, a cor de cada placa varia suavemente a partir
    do seu próprio centro (usando F1) e ganha um tom levemente
    diferente das vizinhas (um deslocamento fixo sorteado uma vez por
    placa), para que a superfície não pareça uniforme demais.
  - O broto (desenharBroto): a haste é uma curva levemente irregular,
    cada segmento apontando numa direção que se afasta aos poucos da
    vertical; as folhas são polígonos simples desenhados com
    beginShape()/vertex() e uma leve curvatura. É a única cor viva da
    composição, plantada exatamente sobre uma rachadura encontrada
    por busca local (encontrarFendaProxima), para reforçar a ideia de
    vida abrindo caminho por uma fresta.
  - Textura de poeira e vinheta de sol: uma leve pontilhagem
    (point()) espalhada pela superfície, e um brilho quente
    concentrado num dos cantos, sugerindo luz forte de sol a pino.
  ================================================================
*/

// ---------------------------------------------------------------
// PALETA
// ---------------------------------------------------------------
const TERRA_CLARA = [212, 176, 128]; // barro seco, sob luz direta
const TERRA_ESCURA = [150, 110, 72]; // barro seco, nas partes mais fundas de cada placa
const RACHADURA    = [46, 32, 22];   // o interior das fendas
const VERDE_BROTO  = [92, 150, 60];
const VERDE_SOMBRA = [58, 96, 42];
const BROTO_BROTINHO = [226, 196, 92]; // o pequeno broto/flor na ponta

function setup() {
  let lado = min(windowWidth, windowHeight);
  createCanvas(lado, lado);
  angleMode(DEGREES);
  noLoop();
  gerarComposicao();
}

function windowResized() {
  let lado = min(windowWidth, windowHeight);
  resizeCanvas(lado, lado);
  gerarComposicao();
}

function draw() {}

// ================================================================
// DISTRIBUIÇÃO DAS PLACAS
// ================================================================
// Para cada novo ponto, sorteiam-se "tentativas" candidatos e fica-se
// com o mais distante de todos os pontos já escolhidos. Poucas
// tentativas dão uma distribuição quase tão irregular quanto o
// sorteio livre; muitas tentativas aproximam de uma distribuição bem
// regular. O valor usado aqui fica no meio do caminho, de propósito:
// placas parecidas em tamanho, mas nunca perfeitamente uniformes.
function sortearPontosAfastados(n, tentativas) {
  let pontos = [];
  for (let i = 0; i < n; i++) {
    let melhor = null;
    let melhorDistancia = -1;
    for (let k = 0; k < tentativas; k++) {
      let candidato = createVector(random(width), random(height));
      let distanciaMinima = 99999;
      for (let p of pontos) {
        distanciaMinima = min(distanciaMinima, candidato.dist(p));
      }
      if (pontos.length === 0) distanciaMinima = 99999;
      if (distanciaMinima > melhorDistancia) {
        melhorDistancia = distanciaMinima;
        melhor = candidato;
      }
    }
    pontos.push(melhor);
  }
  return pontos;
}

// Distância ao ponto-semente mais próximo (F1) e ao segundo mais
// próximo (F2), além do índice de qual ponto é o mais próximo — é
// esse índice que decide a qual placa cada posição pertence.
function duasMenoresDistancias(x, y, pontos) {
  let d1 = Infinity, d2 = Infinity, indice1 = -1;
  for (let i = 0; i < pontos.length; i++) {
    let d = dist(x, y, pontos[i].x, pontos[i].y);
    if (d < d1) {
      d2 = d1;
      d1 = d;
      indice1 = i;
    } else if (d < d2) {
      d2 = d;
    }
  }
  return { d1, d2, indice1 };
}

// ================================================================
// TERRA RACHADA
// ================================================================
// A grade de amostragem não percorre pixel a pixel (ficaria pesado);
// cada bloco de "passo" pixels recebe uma única consulta ao Worley.
function desenharTerraRachada(pontos, tonsPorPlaca, espacamentoMedio) {
  let passo = 4;
  let limiarFenda = espacamentoMedio * 0.05;
  let raioSombra = espacamentoMedio * 0.8;

  noStroke();
  for (let x = 0; x < width; x += passo) {
    for (let y = 0; y < height; y += passo) {
      let { d1, d2, indice1 } = duasMenoresDistancias(x, y, pontos);
      let paredeDaCelula = d2 - d1;

      if (paredeDaCelula < limiarFenda) {
        fill(RACHADURA[0], RACHADURA[1], RACHADURA[2]);
      } else {
        let sombreado = map(d1, 0, raioSombra, 0, 1, true);
        let tom = tonsPorPlaca[indice1];
        let r = lerp(TERRA_CLARA[0], TERRA_ESCURA[0], sombreado) + tom;
        let g = lerp(TERRA_CLARA[1], TERRA_ESCURA[1], sombreado) + tom;
        let b = lerp(TERRA_CLARA[2], TERRA_ESCURA[2], sombreado) + tom;
        fill(r, g, b);
      }
      rect(x, y, passo, passo);
    }
  }
}

// Varre uma pequena região ao redor de um ponto-alvo e devolve a
// posição, dentro dela, mais perto do centro de uma fenda — usada
// para plantar o broto exatamente sobre uma rachadura de verdade,
// em vez de escolher uma posição solta.
function encontrarFendaProxima(alvo, pontos, raioBusca) {
  let melhor = alvo.copy();
  let melhorParede = Infinity;
  let passo = 3;
  for (let dx = -raioBusca; dx <= raioBusca; dx += passo) {
    for (let dy = -raioBusca; dy <= raioBusca; dy += passo) {
      let px = alvo.x + dx, py = alvo.y + dy;
      if (px < 0 || py < 0 || px > width || py > height) continue;
      let { d1, d2 } = duasMenoresDistancias(px, py, pontos);
      let parede = d2 - d1;
      if (parede < melhorParede) {
        melhorParede = parede;
        melhor = createVector(px, py);
      }
    }
  }
  return melhor;
}

// ================================================================
// TEXTURA E LUZ
// ================================================================
function desenharPoeira() {
  for (let i = 0; i < 700; i++) {
    let x = random(width), y = random(height);
    let tom = random(-10, 18);
    stroke(TERRA_CLARA[0] + tom, TERRA_CLARA[1] + tom, TERRA_CLARA[2] + tom, random(15, 45));
    strokeWeight(random(0.6, 1.8));
    point(x, y);
  }
}

function desenharVinheta() {
  noStroke();
  // brilho quente concentrado num canto, sugerindo sol a pino
  for (let raio = width * 0.75; raio > 0; raio -= width * 0.05) {
    let alfa = map(raio, 0, width * 0.75, 30, 0);
    fill(255, 235, 200, alfa);
    circle(width * 0.08, height * 0.06, raio);
  }
  // sombra fria no canto oposto, com a mesma técnica de círculos
  // concêntricos — evita a emenda visível que um retângulo de
  // borda dura deixaria
  for (let raio = width * 0.85; raio > 0; raio -= width * 0.05) {
    let alfa = map(raio, 0, width * 0.85, 40, 0);
    fill(25, 18, 12, alfa);
    circle(width * 1.0, height * 1.0, raio);
  }
}

// ================================================================
// O BROTO
// ================================================================
// A haste é uma sequência de segmentos curtos que vai se inclinando
// aos poucos — cada passo soma um pequeno desvio ao ângulo do passo
// anterior, em vez de sortear o ângulo do zero a cada vez, para que
// a curva pareça uma haste crescendo e não um raio quebrado.
function desenharBroto(base, altura) {
  let pos = base.copy();
  let angulo = -90 + random(-8, 8); // sobe (em p5, -90° aponta para cima)
  let pontosHaste = [pos.copy()];

  let nSegmentos = 9;
  let comprimentoSegmento = altura / nSegmentos;
  for (let i = 0; i < nSegmentos; i++) {
    angulo += random(-7, 7);
    pos = createVector(
      pos.x + comprimentoSegmento * cos(angulo),
      pos.y + comprimentoSegmento * sin(angulo)
    );
    pontosHaste.push(pos.copy());
  }

  stroke(VERDE_SOMBRA[0], VERDE_SOMBRA[1], VERDE_SOMBRA[2]);
  strokeWeight(max(2, altura * 0.035));
  noFill();
  beginShape();
  for (let p of pontosHaste) vertex(p.x, p.y);
  endShape();

  // folhas: pares nascendo em pontos alternados ao longo da haste
  for (let i = 2; i < pontosHaste.length - 1; i += 2) {
    let ladoEsquerdo = i % 4 === 0;
    desenharFolha(pontosHaste[i], altura * 0.32, ladoEsquerdo ? -1 : 1);
  }

  // brotinho na ponta
  let ponta = pontosHaste[pontosHaste.length - 1];
  noStroke();
  fill(BROTO_BROTINHO[0], BROTO_BROTINHO[1], BROTO_BROTINHO[2]);
  circle(ponta.x, ponta.y, altura * 0.12);
  fill(VERDE_BROTO[0], VERDE_BROTO[1], VERDE_BROTO[2]);
  circle(ponta.x, ponta.y, altura * 0.07);
}

// Calcula um ponto sobre uma curva quadrática de Bézier (p0 -> p1 é o
// controle -> p2), para t entre 0 e 1. Usada para desenhar a folha
// com pontos amostrados manualmente por vertex() — em vez de
// depender de quadraticVertex(), que não é usada em nenhum outro
// lugar deste sketch.
function pontoNaQuadratica(p0, p1, p2, t) {
  let umMenosT = 1 - t;
  return createVector(
    umMenosT * umMenosT * p0.x + 2 * umMenosT * t * p1.x + t * t * p2.x,
    umMenosT * umMenosT * p0.y + 2 * umMenosT * t * p1.y + t * t * p2.y
  );
}

function desenharFolha(origem, comprimento, direcao) {
  let angulo = -90 + direcao * random(35, 55);
  let ponta = createVector(
    origem.x + comprimento * cos(angulo),
    origem.y + comprimento * sin(angulo)
  );
  let meio = p5.Vector.lerp(origem, ponta, 0.5);
  let perpendicular = createVector(-(ponta.y - origem.y), ponta.x - origem.x).normalize();
  let controleA = p5.Vector.add(meio, p5.Vector.mult(perpendicular, comprimento * 0.22));
  let controleB = p5.Vector.sub(meio, p5.Vector.mult(perpendicular, comprimento * 0.12));

  noStroke();
  fill(VERDE_BROTO[0], VERDE_BROTO[1], VERDE_BROTO[2]);
  beginShape();
  let nPassos = 10;
  for (let i = 0; i <= nPassos; i++) {
    let p = pontoNaQuadratica(origem, controleA, ponta, i / nPassos);
    vertex(p.x, p.y);
  }
  for (let i = 0; i <= nPassos; i++) {
    let p = pontoNaQuadratica(ponta, controleB, origem, i / nPassos);
    vertex(p.x, p.y);
  }
  endShape(CLOSE);
}

// ================================================================
// COMPOSIÇÃO GERAL
// ================================================================
function gerarComposicao() {
  let nPlacas = 40;
  let pontos = sortearPontosAfastados(nPlacas, 12);
  let tonsPorPlaca = pontos.map(() => random(-14, 14));
  let espacamentoMedio = width / sqrt(nPlacas);

  background(TERRA_CLARA[0], TERRA_CLARA[1], TERRA_CLARA[2]);
  desenharTerraRachada(pontos, tonsPorPlaca, espacamentoMedio);
  desenharPoeira();

  let alvo = createVector(random(width * 0.3, width * 0.7), random(height * 0.5, height * 0.82));
  let baseDoBroto = encontrarFendaProxima(alvo, pontos, espacamentoMedio * 1.3);
  desenharBroto(baseDoBroto, height * 0.24);

  desenharVinheta();
}
