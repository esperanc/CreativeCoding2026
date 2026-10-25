// Sistema solar em 3D
// Feito com p5.js 2 no modo WEBGL.
//
// Controles:
//   arrastar o mouse gira a câmera e a roda do mouse aproxima (na câmera livre)
//   1  câmera livre
//   2  vista de cima
//   3  câmera acompanhando a Terra
//   P  troca entre projeção em perspectiva e ortográfica
//   L  liga e desliga um refletor apontado para a Terra
//   + e -  aceleram ou desaceleram o tempo
//   barra de espaço pausa o movimento

let planetas = [];
let asteroides = [];
let estrelas = [];
let anelSaturno;

// O tempo do sketch é contado em dias terrestres.
// diasPorSegundo diz quantos dias da simulação passam a cada segundo real.
let tempo = 0;
let diasPorSegundo = 8;
let pausado = false;
let modoCamera = 1;
let usarOrtho = false;
let refletorLigado = false;
let escala = 1;
let legenda;

// cada textura usa um trecho diferente do noise, senão todas sairiam iguais
let deslocamentoRuido = 0;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
  randomSeed(12);
  noiseSeed(12);

  // As texturas são desenhadas aqui mesmo, em imagens 2D criadas com
  // createGraphics. Assim o sketch não depende de nenhum arquivo externo.
  const texMercurio = texturaRochosa(color(150, 140, 130), color(90, 85, 80), 50);
  const texVenus = texturaFaixas([color(200, 160, 100), color(230, 200, 140), color(180, 130, 80)], null);
  const texTerra = texturaTerra();
  const texLua = texturaRochosa(color(175, 175, 170), color(105, 105, 100), 40);
  const texMarte = texturaRochosa(color(190, 90, 50), color(120, 50, 30), 25);
  const texLuaPequena = texturaRochosa(color(140, 125, 110), color(80, 70, 60), 20);
  const texJupiter = texturaFaixas([color(220, 190, 150), color(170, 120, 80), color(240, 225, 200), color(150, 100, 70)], color(190, 90, 60));
  const texSaturno = texturaFaixas([color(230, 210, 160), color(200, 175, 120), color(245, 230, 190)], null);
  const texUrano = texturaFaixas([color(170, 225, 230), color(150, 210, 220), color(190, 235, 235)], null);
  const texNetuno = texturaFaixas([color(50, 90, 200), color(70, 120, 220), color(40, 70, 170)], color(25, 40, 110));

  // Os dados de cada corpo celeste. As luas ficam dentro dos planetas,
  // e é essa estrutura em árvore que vira a hierarquia de transformações
  // lá na função desenharCorpo.
  // As distâncias e tamanhos não estão em proporção real, senão os planetas
  // internos ficariam minúsculos perto de Júpiter.
  // Os tempos, por outro lado, são os reais, em dias terrestres:
  // periodoOrbita é quanto leva uma volta em torno do pai (o "ano")
  // e periodoRotacao quanto leva uma volta em torno do próprio eixo (o "dia").
  // Valor negativo quer dizer que gira no sentido contrário.
  planetas = [
    { nome: 'Mercúrio', raio: 6, distancia: 85, periodoOrbita: 87.97, periodoRotacao: 58.65, inclinacao: 0.03, textura: texMercurio, luas: [] },
    { nome: 'Vênus', raio: 11, distancia: 125, periodoOrbita: 224.7, periodoRotacao: -243.0, inclinacao: 0.05, textura: texVenus, brilho: 120, luas: [] },
    {
      nome: 'Terra', raio: 13, distancia: 175, periodoOrbita: 365.26, periodoRotacao: 0.997, inclinacao: 0.41, textura: texTerra, brilho: 200,
      luas: [
        { nome: 'Lua', raio: 3.5, distancia: 24, periodoOrbita: 27.32, periodoRotacao: 0, inclinacao: 0, textura: texLua, luas: [] }
      ]
    },
    {
      nome: 'Marte', raio: 9, distancia: 220, periodoOrbita: 686.98, periodoRotacao: 1.026, inclinacao: 0.44, textura: texMarte,
      luas: [
        { nome: 'Fobos', raio: 1.8, distancia: 14, periodoOrbita: 0.319, periodoRotacao: 0, inclinacao: 0, textura: texLuaPequena, luas: [] },
        { nome: 'Deimos', raio: 1.4, distancia: 19, periodoOrbita: 1.263, periodoRotacao: 0, inclinacao: 0, textura: texLuaPequena, luas: [] }
      ]
    },
    {
      nome: 'Júpiter', raio: 30, distancia: 340, periodoOrbita: 4332.6, periodoRotacao: 0.414, inclinacao: 0.05, textura: texJupiter,
      luas: [
        { nome: 'Io', raio: 3, distancia: 42, periodoOrbita: 1.769, periodoRotacao: 0, inclinacao: 0, textura: texLua, luas: [] },
        { nome: 'Ganimedes', raio: 4, distancia: 52, periodoOrbita: 7.155, periodoRotacao: 0, inclinacao: 0, textura: texLuaPequena, luas: [] }
      ]
    },
    {
      nome: 'Saturno', raio: 24, distancia: 450, periodoOrbita: 10759, periodoRotacao: 0.444, inclinacao: 0.47, textura: texSaturno,
      anel: { tamanho: 1, cor: [205, 185, 145] }, luas: []
    },
    // Urano é o planeta "deitado": o eixo é inclinado quase 98 graus,
    // por isso o anel fino dele aparece na vertical. Ele também gira ao contrário.
    {
      nome: 'Urano', raio: 17, distancia: 555, periodoOrbita: 30687, periodoRotacao: -0.718, inclinacao: 1.71, textura: texUrano, brilho: 60,
      anel: { tamanho: 0.62, cor: [120, 140, 150] }, luas: []
    },
    // Netuno tem Tritão, uma lua que orbita no sentido contrário ao do planeta,
    // daí o período de órbita negativo.
    {
      nome: 'Netuno', raio: 16, distancia: 650, periodoOrbita: 60190, periodoRotacao: 0.671, inclinacao: 0.49, textura: texNetuno, brilho: 80,
      luas: [
        { nome: 'Tritão', raio: 3, distancia: 27, periodoOrbita: -5.877, periodoRotacao: 0, inclinacao: 0, textura: texLua, luas: [] }
      ]
    }
  ];

  // O anel de Saturno é uma malha feita à mão. Com TRIANGLE_STRIP basta
  // alternar um ponto da borda de dentro e um da borda de fora; o p5 liga
  // cada três pontos seguidos num triângulo.
  // O buildGeometry guarda o resultado, então a malha é montada uma vez só
  // e depois é desenhada com model().
  anelSaturno = buildGeometry(() => {
    noStroke();
    beginShape(TRIANGLE_STRIP);
    const passos = 90;
    for (let i = 0; i <= passos; i++) {
      const a = TWO_PI * i / passos;
      normal(0, -1, 0);
      vertex(cos(a) * 34, 0, sin(a) * 34);
      normal(0, -1, 0);
      vertex(cos(a) * 52, 0, sin(a) * 52);
    }
    endShape();
  });

  // Cinturão de asteroides entre Marte e Júpiter. Cada pedra sorteia
  // posição, tamanho e se vai ser uma caixa ou um elipsoide de baixa resolução,
  // que fica com cara de rocha por causa das faces chapadas.
  for (let i = 0; i < 140; i++) {
    asteroides.push({
      angulo: random(TWO_PI),
      distancia: random(252, 285),
      altura: random(-5, 5),
      tamanho: random(1.5, 4),
      forma: floor(random(2)),
      // período de rotação em dias; asteroides costumam girar em
      // algumas horas, então sorteamos entre meio dia e um dia e meio
      giro: random(0.5, 1.5),
      fase: random(TWO_PI)
    });
  }

  // Estrelas espalhadas numa casca esférica bem longe de tudo.
  for (let i = 0; i < 900; i++) {
    estrelas.push(p5.Vector.random3D().mult(random(2500, 3500)));
  }

  legenda = createDiv('');
  legenda.position(16, 12);
  legenda.style('color', '#c8c8d8');
  legenda.style('font-family', 'sans-serif');
  legenda.style('font-size', '13px');
  legenda.style('line-height', '1.5');
  legenda.style('pointer-events', 'none');
  atualizarLegenda();

  cameraInicial();
}

function draw() {
  background(5, 5, 15);
  noStroke();

  // O sistema foi pensado num espaço de mais ou menos 1400 unidades.
  // Essa escala faz ele caber em qualquer tamanho de janela.
  escala = min(width, height) / 1450;

  // deltaTime é quanto tempo real passou desde o último quadro, em milissegundos
  if (!pausado) {
    tempo += deltaTime / 1000 * diasPorSegundo;
  }

  // a contagem de dias na legenda não precisa mudar a cada quadro
  if (frameCount % 10 === 0) {
    atualizarLegenda();
  }

  // Projeção: na perspectiva o que está longe fica menor, como no olho humano.
  // Na ortográfica não existe essa diferença, tudo mantém o mesmo tamanho
  // independente da distância, como num desenho técnico.
  if (usarOrtho) {
    ortho(-width / 2, width / 2, -height / 2, height / 2, 0, 20000);
  } else {
    perspective(PI / 3, width / height, 1, 20000);
  }

  // Câmera. Lembrando que no p5 o eixo Y aponta para baixo,
  // então "em cima" é Y negativo.
  if (modoCamera === 1) {
    orbitControl();
  } else if (modoCamera === 2) {
    camera(0, -1450 * escala, 0.01, 0, 0, 0, 0, 0, -1);
  } else if (modoCamera === 3) {
    // a câmera fica um pouco atrás e acima da Terra, olhando para o Sol
    const p = posicaoTerra();
    const atras = p.copy().normalize().mult(70 * escala);
    camera(p.x + atras.x, p.y - 25 * escala, p.z + atras.z, 0, 0, 0, 0, 1, 0);
  }

  desenharEstrelas();

  // Luzes. Elas precisam ser chamadas a cada quadro, depois da câmera.
  // A ambiente é bem fraca, só para o lado escuro dos planetas não ficar preto puro.
  ambientLight(30, 30, 40);
  // Uma luz direcional azulada e fraca, vinda de cima, dá um contorno nos planetas.
  directionalLight(35, 45, 80, 0.2, 1, -0.3);
  // A luz principal é pontual e fica no centro do Sol, iluminando para todos os lados.
  pointLight(255, 235, 200, 0, 0, 0);

  if (refletorLigado) {
    desenharRefletor();
  }

  // Daqui para baixo tudo é desenhado nas unidades do sistema e
  // o scale converte para o tamanho da tela.
  scale(escala);

  desenharSol();

  for (const planeta of planetas) {
    desenharOrbita(planeta.distancia);
    desenharCorpo(planeta);
  }

  desenharCinturao();
}

// Esta função é o coração da hierarquia. Cada push guarda o sistema de
// coordenadas atual e cada pop volta para ele. Como as luas são desenhadas
// antes do pop do planeta, elas herdam a posição dele e só precisam
// se preocupar com a própria órbita em volta do planeta.
function desenharCorpo(corpo) {
  push();

  // primeiro gira em volta do "pai" (o Sol, ou o planeta no caso das luas)...
  rotateY(angulo(corpo.periodoOrbita));
  // ...e depois se afasta até a distância da órbita.
  // A ordem importa: se fosse translate antes do rotate, o corpo
  // giraria em torno de si mesmo em vez de orbitar.
  translate(corpo.distancia, 0, 0);

  push();
  // inclinação do eixo, como os 23 graus da Terra
  rotateZ(corpo.inclinacao);

  push();
  // Rotação em torno do próprio eixo (o dia do planeta).
  // As luas têm período 0 aqui, ou seja, nenhuma rotação extra. Como elas já
  // estão dentro do rotateY da órbita, isso faz mostrarem sempre a mesma face
  // para o planeta, que é o que acontece de verdade com a nossa Lua.
  rotateY(angulo(corpo.periodoRotacao));
  texture(corpo.textura);
  if (corpo.brilho) {
    // o material especular cria aquele ponto de reflexo da luz do Sol
    specularMaterial(corpo.brilho);
    shininess(25);
  }
  sphere(corpo.raio, 32, 24);
  pop();

  // O anel fica fora do push da rotação, mas dentro da inclinação,
  // por isso acompanha o eixo inclinado do planeta.
  // Saturno e Urano usam a mesma malha; o scale só muda o tamanho dela.
  if (corpo.anel) {
    push();
    scale(corpo.anel.tamanho);
    const [r, g, b] = corpo.anel.cor;
    fill(r, g, b);
    // um pouco de emissão para o anel não sumir quando a luz bate de lado
    emissiveMaterial(r * 0.2, g * 0.2, b * 0.2);
    model(anelSaturno);
    pop();
  }
  pop();

  for (const lua of corpo.luas) {
    desenharOrbita(lua.distancia);
    desenharCorpo(lua);
  }

  pop();
}

function desenharSol() {
  push();
  // o Sol também gira, uma volta a cada 25 dias mais ou menos (no equador)
  rotateY(angulo(25.4));
  fill(255, 180, 50);
  // A emissão faz o Sol parecer aceso por conta própria.
  // Sem ela ele ficaria escuro, porque a luz pontual está dentro dele
  // e ilumina a parte de dentro da esfera, não a de fora.
  emissiveMaterial(255, 150, 30);
  sphere(45, 48, 32);
  pop();
}

function desenharCinturao() {
  push();
  // O cinturão gira como um bloco só, com o período típico de um asteroide
  // dessa região, uns 4 anos e meio. Na realidade os de dentro são mais
  // rápidos que os de fora, mas a diferença aqui seria pequena.
  rotateY(angulo(1680));
  fill(130, 120, 110);
  for (const a of asteroides) {
    push();
    rotateY(a.angulo);
    translate(a.distancia, a.altura, 0);
    rotateX(angulo(a.giro) + a.fase);
    rotateZ(angulo(a.giro * 1.4));
    if (a.forma === 0) {
      box(a.tamanho, a.tamanho * 0.7, a.tamanho * 0.8);
    } else {
      ellipsoid(a.tamanho * 0.6, a.tamanho * 0.45, a.tamanho * 0.5, 5, 4);
    }
    pop();
  }
  pop();
}

// As órbitas são só linhas. Linhas não recebem luz, então ficam
// sempre com a mesma cor, o que é bom para um guia visual.
function desenharOrbita(raio) {
  push();
  noFill();
  stroke(255, 35);
  strokeWeight(1);
  beginShape();
  for (let i = 0; i < 100; i++) {
    const a = TWO_PI * i / 100;
    vertex(cos(a) * raio, 0, sin(a) * raio);
  }
  endShape(CLOSE);
  pop();
}

function desenharEstrelas() {
  push();
  stroke(255, 220);
  strokeWeight(2);
  beginShape(POINTS);
  for (const e of estrelas) {
    vertex(e.x, e.y, e.z);
  }
  endShape();
  pop();
}

// O refletor (spotLight) é uma luz que sai de um ponto numa direção,
// formando um cone. Aqui ele fica acima da Terra apontando para baixo,
// como um holofote seguindo o planeta.
function desenharRefletor() {
  const p = posicaoTerra();
  const fonte = createVector(p.x, p.y - 160 * escala, p.z);

  spotLight(150, 210, 255, fonte.x, fonte.y, fonte.z, 0, 1, 0, PI / 14, 20);

  // uma caixinha brilhante e uma linha só para a gente ver de onde vem a luz
  push();
  stroke(150, 210, 255, 70);
  line(fonte.x, fonte.y, fonte.z, p.x, p.y, p.z);
  translate(fonte.x, fonte.y, fonte.z);
  noStroke();
  fill(150, 210, 255);
  emissiveMaterial(150, 210, 255);
  box(8 * escala);
  pop();
}

// Calcula onde a Terra está no mundo, repetindo a mesma conta que o
// rotateY + translate fazem em desenharCorpo. Girar o ponto (d, 0, 0)
// pelo ângulo a em torno do eixo Y dá (d·cos a, 0, −d·sin a).
function posicaoTerra() {
  const terra = planetas[2];
  const a = angulo(terra.periodoOrbita);
  return createVector(cos(a) * terra.distancia, 0, -sin(a) * terra.distancia).mult(escala);
}

// Converte um período em dias no ângulo atual: se passaram tempo dias e uma
// volta completa (TWO_PI) leva periodo dias, o ângulo é a fração de voltas
// vezes TWO_PI. Período zero quer dizer "não gira".
function angulo(periodo) {
  if (periodo === 0) return 0;
  return TWO_PI * tempo / periodo;
}

function cameraInicial() {
  // uma visão inclinada, de cima e de frente, para as órbitas não
  // aparecerem só como uma linha reta
  camera(0, -height * 0.55, height * 0.85, 0, 0, 0, 0, 1, 0);
}

// Texturas
//
// Todas são imagens de 256 por 128 pixels, a proporção que se encaixa
// bem em volta de uma esfera. O noise é lido em volta de um cilindro
// para que a borda esquerda da imagem combine com a direita, e
// assim não aparece uma emenda no planeta.

function ruidoCilindrico(x, y, largura, frequencia) {
  const a = x / largura * TWO_PI;
  return noise(
    deslocamentoRuido + cos(a) * frequencia,
    deslocamentoRuido + sin(a) * frequencia,
    y / largura * TWO_PI * frequencia
  );
}

function texturaRochosa(base, escura, crateras) {
  deslocamentoRuido += 50;
  const g = createGraphics(256, 128);
  g.noStroke();
  for (let y = 0; y < 128; y += 2) {
    for (let x = 0; x < 256; x += 2) {
      const n = ruidoCilindrico(x, y, 256, 2.5);
      g.fill(lerpColor(base, escura, n));
      g.rect(x, y, 2, 2);
    }
  }
  for (let i = 0; i < crateras; i++) {
    const cx = random(256);
    const cy = random(15, 113);
    const r = random(3, 10);
    g.fill(escura);
    g.circle(cx, cy, r);
    g.fill(lerpColor(base, escura, 0.4));
    g.circle(cx - 1, cy - 1, r * 0.7);
  }
  return g;
}

// corMancha é opcional: Júpiter tem a grande mancha vermelha e Netuno
// a grande mancha escura. Para os outros passamos null.
function texturaFaixas(cores, corMancha) {
  deslocamentoRuido += 50;
  const g = createGraphics(256, 128);
  g.noStroke();
  for (let y = 0; y < 128; y += 2) {
    for (let x = 0; x < 256; x += 2) {
      // a faixa depende principalmente da altura (y), e um pouco de
      // ruído em x deixa as bordas onduladas, como nuvens de gás
      const ondulacao = ruidoCilindrico(x, y, 256, 3) * 0.4;
      const t = noise(deslocamentoRuido, y * 0.05 + ondulacao);
      g.fill(corDaPaleta(cores, t));
      g.rect(x, y, 2, 2);
    }
  }
  if (corMancha) {
    g.fill(corMancha);
    g.ellipse(170, 82, 28, 14);
    g.fill(lerpColor(corMancha, color(255), 0.2));
    g.ellipse(170, 82, 18, 8);
  }
  return g;
}

function texturaTerra() {
  deslocamentoRuido += 50;
  const g = createGraphics(256, 128);
  g.noStroke();
  const oceano = color(25, 70, 160);
  const verde = color(60, 130, 60);
  const deserto = color(170, 150, 90);
  for (let y = 0; y < 128; y += 2) {
    for (let x = 0; x < 256; x += 2) {
      const n = ruidoCilindrico(x, y, 256, 2);
      if (n > 0.52) {
        // perto do equador (meio da imagem) a terra fica mais seca
        const equador = 1 - abs(y - 64) / 64;
        g.fill(lerpColor(verde, deserto, equador * 0.7));
      } else {
        g.fill(oceano);
      }
      g.rect(x, y, 2, 2);
    }
  }
  // calotas polares
  g.fill(240);
  g.rect(0, 0, 256, 8);
  g.rect(0, 120, 256, 8);
  // nuvens: outra camada de noise, branca e meio transparente
  deslocamentoRuido += 50;
  for (let y = 0; y < 128; y += 2) {
    for (let x = 0; x < 256; x += 2) {
      if (ruidoCilindrico(x, y, 256, 4) > 0.62) {
        g.fill(255, 140);
        g.rect(x, y, 2, 2);
      }
    }
  }
  return g;
}

// recebe um valor entre 0 e 1 e devolve uma cor misturada da lista
function corDaPaleta(cores, t) {
  const pos = constrain(t, 0, 0.999) * (cores.length - 1);
  const i = floor(pos);
  return lerpColor(cores[i], cores[i + 1], pos - i);
}

function atualizarLegenda() {
  const nomes = ['', 'livre (arraste e use a roda)', 'vista de cima', 'acompanhando a Terra'];
  const anos = floor(tempo / 365.26);
  const dias = floor(tempo % 365.26);
  const velocidade = String(diasPorSegundo).replace('.', ',');
  legenda.html(
    'tempo decorrido: ' + anos + ' anos e ' + dias + ' dias terrestres<br>' +
    'velocidade: ' + velocidade + ' dias terrestres por segundo' + (pausado ? ' (pausado)' : '') + '<br>' +
    'câmera: ' + nomes[modoCamera] + '<br>' +
    'projeção: ' + (usarOrtho ? 'ortográfica' : 'perspectiva') + '<br>' +
    'refletor: ' + (refletorLigado ? 'ligado' : 'desligado') +
    '<br><br>1 2 3 câmeras · P projeção · L refletor · + − velocidade · espaço pausa'
  );
}

function keyPressed() {
  if (key === '1') {
    modoCamera = 1;
    cameraInicial();
  } else if (key === '2') {
    modoCamera = 2;
  } else if (key === '3') {
    modoCamera = 3;
  } else if (key === 'p' || key === 'P') {
    usarOrtho = !usarOrtho;
  } else if (key === 'l' || key === 'L') {
    refletorLigado = !refletorLigado;
  } else if (key === '+' || key === '=') {
    // o = está na mesma tecla do + e funciona sem apertar shift
    diasPorSegundo = min(diasPorSegundo * 2, 256);
  } else if (key === '-' || key === '_') {
    diasPorSegundo = max(diasPorSegundo / 2, 0.125);
  } else if (key === ' ') {
    pausado = !pausado;
  }
  atualizarLegenda();
  // evita que a barra de espaço role a página
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (modoCamera === 1) {
    cameraInicial();
  }
}