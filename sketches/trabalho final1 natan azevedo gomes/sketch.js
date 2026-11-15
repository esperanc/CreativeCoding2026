// Garçom Novato: um curta
// p5.js 2, modo WEBGL.
//
// Sexta-feira à noite num restaurante. Um garçom confiante leva um pedido
// da cozinha até a mesa 7: duas taças de vinho e dois pratos de macarrão,
// e de quebra dois copos d'água de outra mesa. No caminho, um cliente se levanta na frente dele. E na
// chegada, ele resolve fazer uma reverência.
//
// O filme roda sozinho. Os copos não são animados à mão: eles escorregam,
// tombam, derramam e quebram pela física da bandeja (a gravidade e a
// aceleração que eles sentem). O roteiro só decide o caminho do garçom,
// para onde ele inclina a bandeja, onde fica a câmera e quando o tempo
// passa devagar.
//
//   espaço   pausa e continua
//   R        recomeça o filme
//
// As unidades são centímetros e segundos. No p5 o y cresce para baixo, então
// "altura" h vira y = -h na hora de desenhar.

// o quanto o tronco curva na reverência (rad)
const CURVA_REVERENCIA = 0.75;
// a física anda em passos fixos de tempo, para o filme sair igual sempre
const PASSO_FISICA = 1 / 120;

// -----------------------------------------------------------------------
// O cenário: as mesas, quem está sentado onde e o caminho do garçom.
// As cadeiras ficam nas diagonais de cada mesa, deixando os corredores
// livres. Cada pessoa é indicada pela mesa e pela cadeira (0 a 3).
// -----------------------------------------------------------------------

const MESAS = [[-260, 420], [260, 420], [0, 170], [-290, -80], [280, -60], [20, -300], [300, -420], [-290, -540]];
const MESA_DO_PEDIDO = 7;
const OCUPADAS = [[0, 1], [0, 2], [1, 0], [1, 3], [2, 2], [2, 3], [3, 0], [3, 2], [4, 1], [4, 2],
                  [5, 0], [5, 3], [6, 1], [6, 2], [7, 1], [7, 2]];
// o cliente que se levanta: mesa 3, cadeira 0 (a da frente, do lado do corredor)
const CLIENTE_APRESSADO = [3, 0];

// O caminho: pontos por onde o garçom passa, com a velocidade em cada
// trecho. O último é onde ele para, ao lado da mesa do pedido.
const CAMINHO = [
  { x: 0, z: 420, vel: 140 },
  { x: -30, z: 330, vel: 110 },
  { x: -110, z: 275, vel: 110 },
  { x: -150, z: 200, vel: 120 },
  { x: -150, z: 60, vel: 125 },
  { x: -145, z: -150, vel: 115 },
  { x: -150, z: -380, vel: 110 },
  { x: -175, z: -520, vel: 70 }
];

let tempo = 0;            // tempo do filme, em segundos de filme
let escala = 1;           // velocidade do tempo (menor que 1 é câmera lenta)
let acumulado = 0;
let pausado = false;
let inclinacaoAlvo = { x: 0, z: 0 };
let diretor;
let titulo, legenda, conta, dica;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);
  // coordenadas de textura de 0 a 1 (e acima de 1 para repetir) nos
  // vertex() do chão e das paredes
  textureMode(NORMAL);

  texturas.piso = criarTexturaPiso();
  texturas.parede = criarTexturaParede();
  texturas.cortica = criarTexturaCortica();
  texturas.porta = criarTexturaPorta();

  montarModelos();
  modelos.emPe = [0, 1, 2].map(k => buildGeometry(() => pessoaEmPe(k)));
  modelos.pernaCliente = buildGeometry(() => {
    noStroke();
    fill(50, 54, 70);
    push(); translate(0, 44, 0); cylinder(6, 88, 8, 1); pop();
    fill(25);
    push(); translate(0, 87, 4); box(9, 4, 20); pop();
  });
  filtro = createFilterShader(FILTRO_CINEMA);

  criarTextos();
  comecarFilme();
}

function comecarFilme() {
  // o mesmo sorteio toda vez, para os cacos voarem igual em cada sessão
  randomSeed(7);
  tempo = 0;
  escala = 1;
  acumulado = 0;
  caindo = [];
  cacos = [];
  gotas = [];
  pocas = [];
  restos = [];
  inclinacaoAlvo = { x: 0, z: 0 };
  montarSalao();

  garcom = {
    x: 0, z: 720, angulo: PI,
    vel: 0, giro: 0, passo: 0,
    modo: 'parado',       // parado, anda ou freia
    ponto: 0,             // o próximo ponto do caminho
    chegou: false,
    reverencia: 0,        // de 0 (em pé) a 1 (curvado)
    puxao: 0,             // o reflexo do braço no susto, de 0 a 1
    expressao: 'confiante'
  };
  bandeja = {
    inclX: 0, inclZ: 0,
    pos: null, posAnt: null, vel: createVector(0, 0, 0),
    acel: createVector(0, 0, 0)
  };
  atualizarBandeja(0);

  // O pedido: os dois pratos de macarrão atrás, perto do corpo, e uma
  // fileira de copos e taças na frente. As posições são (u, v): u para a
  // direita e v para a frente, em cm, a partir do meio da bandeja.
  itens = [
    novoItem('prato', -12, -7), novoItem('prato', 12, -7),
    novoItem('copo', -18.5, 15), novoItem('taca', -6.2, 15),
    novoItem('taca', 6.2, 15), novoItem('copo', 18.5, 15)
  ];

  diretor = { cena: 0, t: 0, corte: true };
  esconderTextos();
  CENAS[0].entrar();
}

function montarSalao() {
  mesas = MESAS.map(([x, z]) => ({ x, z, raio: 50 }));
  cadeiras = [];
  pessoas = [];
  mesas.forEach((m, i) => {
    for (let k = 0; k < 4; k++) {
      const a = QUARTER_PI + k * HALF_PI;
      const c = { x: m.x + cos(a) * 76, z: m.z + sin(a) * 76, raio: 20 };
      c.angulo = atan2(m.x - c.x, m.z - c.z);
      cadeiras.push(c);
      if (OCUPADAS.some(([mi, ci]) => mi === i && ci === k)) {
        const p = { x: c.x, z: c.z, angulo: c.angulo, modelo: (i + k) % 3, emPe: false, fase: i * 1.7 + k };
        if (i === CLIENTE_APRESSADO[0] && k === CLIENTE_APRESSADO[1]) p.apressado = true;
        pessoas.push(p);
      }
    }
  });
}

function novoItem(tipo, u, v) {
  const T = TIPOS[tipo];
  return {
    tipo, T, u, v,
    du: 0, dv: 0,
    deslizando: false,
    tombado: false, tombo: 0, dirTombo: createVector(1, 0),
    cheio: T.liquido ? 1 : 0,
    onda: createVector(0, 0), ondaVel: createVector(0, 0)
  };
}

function draw() {
  const dtReal = min(deltaTime / 1000, 1 / 20);

  if (!pausado) {
    // O tempo do filme anda mais devagar na câmera lenta. A física roda em
    // passos fixos: quantos couberem no tempo de filme que passou.
    acumulado += dtReal * escala;
    let passos = 0;
    while (acumulado >= PASSO_FISICA && passos < 40) {
      passoDoFilme(PASSO_FISICA);
      acumulado -= PASSO_FISICA;
      passos++;
    }
  }

  filmar(dtReal);
  background(30, 22, 18);
  noStroke();
  luzes();
  desenharSala();
  desenharGarcom();
  desenharBandeja();
  desenharQuedas();

  filtro.setUniform('uTamanho', [width, height]);
  filtro.setUniform('uLento', constrain((1 - escala) / 0.75, 0, 1));
  filtro.setUniform('uEscuro', escurecer());
  filtro.setUniform('uT', millis() / 1000);
  filter(filtro);
}

function passoDoFilme(dt) {
  tempo += dt;
  dirigir(dt);
  conduzirGarcom(dt);
  moverCliente(dt);
  atualizarBandeja(dt);
  atualizarItens(dt);
  atualizarQuedas(dt);
}

function keyPressed() {
  if (key === ' ') {
    pausado = !pausado;
    dica.html(pausado ? 'pausado · espaço continua · R recomeça' : 'espaço pausa · R recomeça');
    return false;
  }
  if (key === 'r' || key === 'R') comecarFilme();
}

// -----------------------------------------------------------------------
// O roteiro
//
// Cada cena diz o que acontece quando ela começa (entrar), o que acontece a
// cada passo (agir, com o tempo t desde o começo da cena), qual câmera usa,
// e quando termina: depois de uma duração, ou quando uma condição vira
// verdadeira (acabou). Trocar de cena é um corte: a câmera pula para o
// lugar novo em vez de deslizar.
// -----------------------------------------------------------------------

const CENAS = [
  {
    nome: 'abertura', camera: 'geral', dura: 6,
    entrar() {
      mostrar(titulo, 'Garçom Novato', 0.6);
      mostrar(legenda, 'Sexta-feira, nove da noite.', 1.6);
    },
    agir(t) {
      if (t > 4.6) esconder(titulo);
    }
  },
  {
    nome: 'preparo', camera: 'frente', dura: 4.5,
    entrar() { esconder(legenda); },
    agir(t) {
      // ajeita a bandeja: uma balançadinha que vai diminuindo
      const k = constrain(1 - t / 2.2, 0, 1);
      inclinacaoAlvo = { x: 0.09 * sin(t * 7) * k, z: 0.06 * sin(t * 5 + 1) * k };
    }
  },
  {
    nome: 'saída', camera: 'ombro',
    entrar() { garcom.modo = 'anda'; },
    agir() { compensar(); },
    acabou() { return garcom.z < 300; }
  },
  {
    nome: 'travelling', camera: 'lateral',
    agir() {
      compensar();
      // o cliente se levanta um pouco antes da freada, ainda em tempo
      // normal: quando a cena do susto começa ele já está de pé
      if (garcom.z < 185 && !cliente().emPe) levantarCliente();
    },
    acabou() { return garcom.z < 112; }
  },
  {
    nome: 'susto', camera: 'bandeja', dura: 3.2,
    entrar() {
      if (!cliente().emPe) levantarCliente();
      garcom.modo = 'freia';
      garcom.expressao = 'susto';
    },
    agir(t) {
      // o tempo desacelera logo depois da freada
      escala = lerp(1, 0.25, constrain(t / 0.3, 0, 1));
      // O puxão do braço: logo depois da freada ele traz a bandeja para perto
      // do corpo, segura, e depois solta devagar. Ele começa quando a freada
      // termina e é suave: os dois trancos juntos derrubariam as taças.
      garcom.puxao = t < 0.4 ? 0 : t < 1.1 ? suaveCurva((t - 0.4) / 0.7) : t < 1.7 ? 1 : 1 - suaveCurva((t - 1.7) / 1.2);
      // primeiro ele é pego de surpresa (bandeja reta, os copos escorregam
      // para a frente); depois inclina para trás e traz tudo de volta
      if (t < 0.45) inclinacaoAlvo = { x: 0, z: 0 };
      else if (t < 1.3) inclinacaoAlvo = { x: 0, z: -0.24 };
      else compensar();
    }
  },
  {
    nome: 'alívio', camera: 'frente',
    agir(t) {
      garcom.puxao = 0;
      garcom.expressao = t < 1.4 ? 'susto' : 'confiante';
      escala = lerp(0.25, 1, constrain(t / 0.6, 0, 1));
      compensar();
      // espera o cliente sair do caminho
      if (t > 2.6 && cliente().x > -40 && garcom.modo !== 'anda') garcom.modo = 'anda';
    },
    acabou(t) { return garcom.modo === 'anda' && t > 3.4; }
  },
  {
    nome: 'chegada', camera: 'ombro',
    agir(t) {
      compensar();
      if (garcom.z < -230) trocarCamera('lateral');
    },
    acabou() { return garcom.chegou && this.esperou(); },
    esperou() {
      this.parado = (this.parado || 0) + PASSO_FISICA;
      return this.parado > 2.2;
    }
  },
  {
    nome: 'reverência', camera: 'mesa', dura: 4.6,
    entrar() { esconder(legenda); },
    agir(t) {
      // orgulhoso, de olhos fechados, até perceber o que está acontecendo
      garcom.expressao = t < 2.3 ? 'orgulho' : 'susto';
      // o corpo curva devagar e a bandeja vai junto; no meio do movimento
      // o tempo desacelera para ver tudo escorregar
      // começa e termina devagar: um início seco daria um tranco para trás
      // na bandeja e tombaria as taças na direção do garçom
      garcom.reverencia = suaveCurva(constrain((t - 0.3) / 1.4, 0, 1));
      inclinacaoAlvo = { x: 0, z: 0.62 * garcom.reverencia };
      escala = t < 0.9 ? 1 : lerp(1, 0.3, constrain((t - 0.9) / 0.4, 0, 1));
    }
  },
  {
    // a conta entra em 1,2 s e fica 6 s na tela
    nome: 'silêncio', camera: 'alto', dura: 7.2,
    entrar() { escala = 1; garcom.expressao = 'choque'; },
    agir(t) {
      if (t > 1.2 && !this.conta) {
        this.conta = true;
        mostrarConta();
      }
    }
  },
  {
    nome: 'fim', camera: 'geral',
    entrar() {
      tirarConta();
      mostrar(titulo, 'Garçom Novato', 0.8);
      mostrar(legenda, 'R para assistir de novo', 2.2);
    },
    agir() {},
    acabou() { return false; }
  }
];

function dirigir(dt) {
  const d = diretor;
  const cena = CENAS[d.cena];
  d.t += dt;
  cena.agir(d.t);
  const terminou = cena.dura !== undefined ? d.t >= cena.dura : cena.acabou(d.t);
  if (terminou && d.cena < CENAS.length - 1) {
    d.cena++;
    d.t = 0;
    d.corte = true;
    d.camera = null;
    const nova = CENAS[d.cena];
    // limpa as anotações que uma cena possa ter guardado numa sessão anterior
    delete nova.avisado; delete nova.parado; delete nova.conta;
    if (nova.entrar) nova.entrar();
  }
}

// Um garçom experiente inclina a bandeja na direção em que está acelerando,
// para a gravidade puxar os copos para o lado contrário da inércia. A
// aceleração vem da própria bandeja, separada em "para a frente" e "para a
// direita" do garçom.
function compensar() {
  const a = bandeja.acel;
  const f = frenteDe(garcom.angulo), d = direitaDe(garcom.angulo);
  inclinacaoAlvo = {
    x: constrain(a.dot(d) / GRAVIDADE, -0.35, 0.35),
    z: constrain(a.dot(f) / GRAVIDADE, -0.35, 0.35)
  };
}

// -----------------------------------------------------------------------
// O garçom segue o caminho
// -----------------------------------------------------------------------

function conduzirGarcom(dt) {
  const g = garcom;
  let velAlvo = 0, acel = ACELERACAO;
  if (g.modo === 'anda') {
    const p = CAMINHO[g.ponto];
    const dx = p.x - g.x, dz = p.z - g.z;
    const d = sqrt(dx * dx + dz * dz);
    const ultimo = g.ponto === CAMINHO.length - 1;
    velAlvo = p.vel;
    if (ultimo) {
      // chega devagar: a velocidade que ainda dá para frear até o ponto
      velAlvo = min(p.vel, sqrt(2 * ACELERACAO * 0.8 * d));
      if (d < 2) {
        g.modo = 'parado';
        g.chegou = true;
      }
    } else if (d < 40) {
      g.ponto++;
    }
    // Vira na direção do ponto. O giro também muda aos poucos (como a
    // velocidade), e nas curvas ele anda mais devagar: uma curva brusca
    // empurra os copos para fora tanto quanto uma freada.
    const dif = diferencaAngulo(g.angulo, atan2(dx, dz));
    g.giro = lerp(g.giro, constrain(dif * 3, -1.1, 1.1), min(1, dt * 4));
    velAlvo *= map(min(abs(dif), 1), 0, 1, 1, 0.45);
  } else if (g.modo === 'freia') {
    acel = 330;
    g.giro = lerp(g.giro, 0, min(1, dt * 8));
  } else if (g.chegou) {
    // parado no fim, ele se vira para a mesa do pedido, num giro calmo,
    // com a bandeja cheia na mão
    const m = mesas[MESA_DO_PEDIDO];
    const dif = diferencaAngulo(g.angulo, atan2(m.x - g.x, m.z - g.z));
    g.giro = lerp(g.giro, constrain(dif * 1.5, -0.5, 0.5), min(1, dt * 2));
  } else {
    g.giro = lerp(g.giro, 0, min(1, dt * 8));
  }
  const passo = acel * dt;
  g.vel += constrain(velAlvo - g.vel, -passo, passo);
  g.angulo += g.giro * dt;
  g.x += sin(g.angulo) * g.vel * dt;
  g.z += cos(g.angulo) * g.vel * dt;
  g.passo += abs(g.vel) * dt / 140;
}

// suaviza o começo e o fim de um movimento que vai de 0 a 1
function suaveCurva(t) {
  t = constrain(t, 0, 1);
  return t * t * (3 - 2 * t);
}

function diferencaAngulo(a, b) {
  let d = (b - a) % TWO_PI;
  if (d > PI) d -= TWO_PI;
  if (d < -PI) d += TWO_PI;
  return d;
}

// -----------------------------------------------------------------------
// O cliente que se levanta
// -----------------------------------------------------------------------

function cliente() {
  return pessoas.find(p => p.apressado);
}

// Ele se levanta, entra no corredor bem na frente do garçom e segue andando
// sem nem perceber, enquanto o garçom ainda está se reequilibrando.
function levantarCliente() {
  const c = cliente();
  c.emPe = true;
  c.subida = 0;          // de 0 (ainda sentado) a 1 (em pé)
  c.passo = 0;
  c.rota = [{ x: -178, z: -12 }, { x: -60, z: -14 }, { x: 115, z: 10 }];
  // só começa a andar depois de terminar de se levantar
  c.espera = [0.5, 0.05, 0];
  c.ritmo = 0;           // o quanto as pernas estão andando, de 0 a 1
  c.passoRota = 0;
  c.parado = 0;
}

function moverCliente(dt) {
  const c = cliente();
  if (!c || !c.rota) return;
  c.subida = min(1, c.subida + dt / 0.45);
  // As pernas só andam quando ele de fato se desloca; o ritmo sobe e desce
  // aos poucos, para o passo começar e terminar sem tranco.
  let andou = false;
  if (c.passoRota < c.rota.length) {
    if (c.parado < c.espera[c.passoRota]) {
      c.parado += dt;
    } else {
      const alvo = c.rota[c.passoRota];
      const dx = alvo.x - c.x, dz = alvo.z - c.z;
      const d = sqrt(dx * dx + dz * dz);
      const vel = c.passoRota === 0 ? 110 : 90;
      c.angulo += diferencaAngulo(c.angulo, atan2(dx, dz)) * min(1, dt * 8);
      if (d < 2) {
        c.passoRota++;
        c.parado = 0;
      } else {
        // o passo dele mede uns 75 cm: um ciclo (dois passos) a cada 150
        const anda = min(d, vel * dt) * c.ritmo;
        c.x += dx / d * anda;
        c.z += dz / d * anda;
        c.passo += anda / 150;
        andou = true;
      }
    }
  }
  c.ritmo = constrain(c.ritmo + (andou ? dt / 0.25 : -dt / 0.25), andou ? 0.15 : 0, 1);
}

// O cliente em pé: o corpo sobe da posição sentada, inclinado para a frente,
// até ficar reto; as pernas balançam enquanto ele anda.
function desenharEmPe(p) {
  const k = suaveCurva(p.subida);
  const fase = p.passo * TWO_PI;
  rotateY(p.angulo);
  translate(0, 34 * (1 - k), 0);
  rotateX(0.5 * (1 - k));
  for (const [x, atraso] of [[-8, 0], [8, PI]]) {
    push();
    translate(x, -88, 0);
    rotateX(0.45 * p.ritmo * sin(fase + atraso));
    model(modelos.pernaCliente);
    pop();
  }
  // o corpo sobe e desce a cada passo
  translate(0, -1.5 * p.ritmo * abs(cos(fase)), 0);
  model(modelos.emPe[p.modelo]);
}

// um cliente em pé, olhando para +z
function pessoaEmPe(k) {
  noStroke();
  const roupas = [[70, 110, 160], [160, 70, 80], [90, 130, 90]];
  const peles = [[232, 190, 160], [190, 140, 105], [120, 80, 60]];
  const cabelos = [[40, 30, 25], [150, 100, 50], [20, 20, 20]];
  // as pernas são desenhadas à parte (modelos.pernaCliente), para andar
  fill(roupas[k]);
  push(); translate(0, -118, 0); ellipsoid(17, 30, 11, 14, 10); pop();
  for (const x of [-20, 20]) {
    push(); translate(x, -118, 2); cylinder(4.5, 50, 8, 1); pop();
  }
  fill(peles[k]);
  push(); translate(0, -160, 0); sphere(11, 14, 10); pop();
  fill(cabelos[k]);
  push(); translate(0, -165, -4.5); ellipsoid(11.5, 8, 11, 12, 8); pop();
  rosto(0, -160, 0, 11, 'neutro', peles[k]);
}

// -----------------------------------------------------------------------
// A câmera
//
// Cada plano é uma função que diz onde fica o olho e para onde ele olha,
// quase sempre a partir da posição do garçom ou da bandeja. Dentro de um
// plano a câmera segue com um pouco de atraso; num corte ela pula direto.
// -----------------------------------------------------------------------

const PLANOS = {
  // o salão visto de cima, girando devagar
  geral() {
    const a = 0.55 + tempo * 0.05;
    return {
      olho: createVector(sin(a) * 430, -540, 150 + cos(a) * 600),
      alvo: createVector(0, -40, -40)
    };
  },
  // de frente para o garçom
  frente() {
    const { g, f, d } = eixos();
    return {
      olho: createVector(g.x, -150, g.z).add(f.copy().mult(175)).add(d.copy().mult(40)),
      alvo: createVector(g.x, -112, g.z).add(f.copy().mult(20))
    };
  },
  // por cima do ombro direito, como no jogo
  ombro() {
    const { g, f, d } = eixos();
    return {
      olho: createVector(g.x, -262, g.z).sub(f.copy().mult(175)).add(d.copy().mult(48)),
      alvo: createVector(g.x, -60, g.z).add(f.copy().mult(150)).add(d.copy().mult(22))
    };
  },
  // acompanhando de lado
  lateral() {
    const { g, f, d } = eixos();
    return {
      olho: createVector(g.x, -150, g.z).add(d.copy().mult(240)).add(f.copy().mult(70)),
      alvo: createVector(g.x, -100, g.z).add(f.copy().mult(35))
    };
  },
  // baixo, atrás do ombro direito: a bandeja e o braço em primeiro plano,
  // e o caminho à frente (com quem atravessar) ao fundo
  bandeja() {
    const { f, d } = eixos();
    const b = bandeja.pos;
    return {
      olho: p5.Vector.sub(b, f.copy().mult(62)).add(d.copy().mult(72)).add(createVector(0, -36, 0)),
      alvo: p5.Vector.add(b, f.copy().mult(70)).add(createVector(0, 4, 0))
    };
  },
  // baixo, de lado, na linha entre o garçom e a mesa: a bandeja aparece de
  // perfil e dá para ver tudo escorregar para cima da toalha
  mesa() {
    const m = mesas[MESA_DO_PEDIDO];
    return {
      olho: createVector(-240, -128, -398),
      alvo: createVector((m.x + bandeja.pos.x) / 2 + 8, -96, (m.z + bandeja.pos.z) / 2)
    };
  },
  // do alto, parado, olhando o estrago
  alto() {
    const m = mesas[MESA_DO_PEDIDO];
    return {
      olho: createVector(-60, -330, -330),
      alvo: createVector(m.x + 50, -70, m.z + 5)
    };
  }
};

function eixos() {
  const g = garcom;
  return { g, f: frenteDe(g.angulo), d: direitaDe(g.angulo) };
}

function trocarCamera(nome) {
  if (diretor.camera !== nome) {
    diretor.camera = nome;
    diretor.corte = true;
  }
}

function filmar(dtReal) {
  const nome = diretor.camera || CENAS[diretor.cena].camera;
  const plano = PLANOS[nome]();
  // a câmera nunca sai da sala (as paredes taparia a vista)
  plano.olho.x = constrain(plano.olho.x, -SALA_X + 20, SALA_X - 20);
  plano.olho.z = constrain(plano.olho.z, -SALA_Z + 20, SALA_Z - 20);
  if (diretor.corte || !cam.olho) {
    cam.olho = plano.olho;
    cam.alvo = plano.alvo;
    diretor.corte = false;
  } else {
    const k = min(1, dtReal * 5);
    cam.olho.lerp(plano.olho, k);
    cam.alvo.lerp(plano.alvo, k);
  }
  perspective(PI / 3, width / height, 5, 5000);
  camera(cam.olho.x, cam.olho.y, cam.olho.z, cam.alvo.x, cam.alvo.y, cam.alvo.z, 0, 1, 0);
}

// o filme começa saindo do preto
function escurecer() {
  return constrain(1 - tempo / 1.5, 0, 1);
}

// -----------------------------------------------------------------------
// Títulos, legendas e a conta
//
// Os textos são elementos da página por cima do canvas. Eles aparecem e
// somem trocando a opacidade, com uma transição de CSS.
// -----------------------------------------------------------------------

function criarTextos() {
  titulo = createDiv('');
  titulo.style('position', 'fixed');
  titulo.style('left', '0');
  titulo.style('width', '100%');
  titulo.style('top', '38%');
  titulo.style('text-align', 'center');
  titulo.style('font-family', 'Georgia, serif');
  titulo.style('font-size', 'min(9vw, 64px)');
  titulo.style('letter-spacing', '0.08em');
  estiloTexto(titulo);

  legenda = createDiv('');
  legenda.style('position', 'fixed');
  legenda.style('left', '0');
  legenda.style('width', '100%');
  legenda.style('bottom', '13%');
  legenda.style('text-align', 'center');
  legenda.style('font-family', 'Georgia, serif');
  legenda.style('font-size', 'min(4.5vw, 24px)');
  legenda.style('font-style', 'italic');
  estiloTexto(legenda);

  dica = createDiv('espaço pausa · R recomeça');
  dica.style('position', 'fixed');
  dica.style('left', '14px');
  dica.style('bottom', '10px');
  dica.style('font-family', 'sans-serif');
  dica.style('font-size', '12px');
  dica.style('color', 'rgba(255,255,255,0.45)');
  dica.style('pointer-events', 'none');
}

function linhaConta(nome, valor) {
  return '<div style="display:flex;justify-content:space-between"><span>' + nome +
    '</span><span>R$ ' + valor + '</span></div>';
}

function estiloTexto(div) {
  div.style('color', '#f6ecd8');
  div.style('text-shadow', '0 2px 8px #000');
  div.style('pointer-events', 'none');
  div.style('opacity', '0');
  div.style('transition', 'opacity 1s');
}

function mostrar(div, texto, atraso) {
  div.html(texto);
  div.style('transition-delay', atraso + 's');
  div.style('opacity', '1');
}

function esconder(div) {
  div.style('transition-delay', '0s');
  div.style('opacity', '0');
}

function esconderTextos() {
  for (const d of [titulo, legenda]) esconder(d);
  tirarConta();
}

// A conta só existe na página enquanto está na tela: ela é criada na cena
// do silêncio e removida depois. Os copos d'água não estão nela, porque
// eram de outra mesa. Primeiro ela entra transparente; a leitura de
// offsetWidth faz o navegador desenhá-la assim antes de a opacidade subir,
// senão a transição não acontece.
function mostrarConta() {
  tirarConta();
  conta = createDiv(
    '<div style="text-align:center;font-weight:bold;margin-bottom:8px">MESA 7</div>' +
    linhaConta('2 taças de vinho', '58,00') +
    linhaConta('2 espaguetes', '84,00') +
    '<div style="border-top:1px dashed #555;margin:8px 0"></div>' +
    '<div style="position:relative">' + linhaConta('Serviço (10%)', '14,20') +
    '<div id="risco" style="position:absolute;left:-4px;top:52%;height:3px;width:0;background:#1d3fa8;' +
    'border-radius:2px;transform:rotate(-3deg);transition:width 0.7s ease-in 1.6s"></div></div>' +
    '<div id="naoVou" style="font-family:\'Comic Sans MS\',\'Segoe Print\',cursive;color:#1d3fa8;font-size:22px;' +
    'text-align:right;margin-top:4px;opacity:0;transform:rotate(-6deg);transition:opacity 0.5s 2.6s">acho que não</div>'
  );
  conta.style('position', 'fixed');
  conta.style('right', '8%');
  conta.style('top', '18%');
  conta.style('width', 'min(70vw, 260px)');
  conta.style('padding', '16px 18px');
  conta.style('background', '#fbf8ef');
  conta.style('color', '#222');
  conta.style('font-family', '\'Courier New\', monospace');
  conta.style('font-size', '15px');
  conta.style('box-shadow', '0 6px 24px rgba(0,0,0,0.5)');
  conta.style('transform', 'rotate(2deg)');
  conta.style('pointer-events', 'none');
  conta.style('opacity', '0');
  conta.style('transition', 'opacity 0.8s');
  conta.elt.offsetWidth;
  conta.style('opacity', '1');
  document.getElementById('risco').style.width = '105%';
  document.getElementById('naoVou').style.opacity = '1';
}

function tirarConta() {
  if (conta) conta.remove();
  conta = null;
}

// -----------------------------------------------------------------------
// Daqui para baixo: a física da bandeja, os modelos e o desenho, que vêm
// da versão em jogo do Garçom equilibrista.
// -----------------------------------------------------------------------

const GRAVIDADE = 981;          // cm/s²

// a sala
const SALA_X = 500;             // a sala vai de -SALA_X a SALA_X
const SALA_Z = 800;
const PE_DIREITO = 320;

// o garçom
const RAIO_GARCOM = 26;
const VEL_MAX = 170;            // cm/s
const ACELERACAO = 220;         // cm/s²
const GIRO = 1.9;               // rad/s

// a bandeja
const RAIO_BANDEJA = 32;
const ALTURA_BANDEJA = 108;
const INCLINACAO_MAX = 0.42;    // rad, para cada eixo

let garcom, bandeja;
let itens = [];        // o que está em cima da bandeja
let caindo = [];       // o que caiu e ainda está no ar
let cacos = [];        // pedaços no chão (ou voando)
let gotas = [];        // líquido no ar
let pocas = [];        // líquido no chão
let restos = [];       // o macarrão que caiu junto com o prato
let mesas = [], cadeiras = [], pessoas = [];
let modelos = {}, texturas = {}, pedacos = {}, amostras = {};
let filtro, perigo = 0;
let cam = { olho: null, alvo: null };

// O que cada item é: tamanho da base (para colisão), altura do centro de
// massa (para saber quando tomba), atrito com a bandeja e o líquido.
const TIPOS = {
  copo:  { raio: 5.2, altura: 13, centro: 5.5, base: 4.6, atritoEst: 0.3, atritoDin: 0.27,
           liquido: { cor: [175, 214, 235, 170], nivel: 9.5, borda: 13, raioTopo: 5.2 }, gorjeta: 4 },
  taca:  { raio: 5.0, altura: 19, centro: 10.5, base: 4.2, atritoEst: 0.34, atritoDin: 0.3,
           liquido: { cor: [120, 14, 36, 235], nivel: 14.5, borda: 19, raioTopo: 5.0, fundo: 10 }, gorjeta: 7 },
  prato: { raio: 11.5, altura: 6, centro: 1.5, base: 11, atritoEst: 0.26, atritoDin: 0.23,
           liquido: null, gorjeta: 6 }
};

// direções do garçom no chão: para a frente e para a direita da tela
function frenteDe(a) { return createVector(sin(a), 0, cos(a)); }
function direitaDe(a) { return createVector(-cos(a), 0, sin(a)); }

// -----------------------------------------------------------------------
// A bandeja
//
// A bandeja é um referencial que se move: ela anda com o garçom, balança
// com os passos e inclina com o mouse. O que está em cima dela sente duas
// coisas: a gravidade, puxando para o lado que está mais baixo, e a
// aceleração da bandeja, ao contrário (quando o garçom acelera para a
// frente, o copo "vai" para trás). A soma é a gravidade efetiva.
// -----------------------------------------------------------------------

// As rotações do p5, aplicadas à mão num vetor. A ordem é a mesma do
// desenho: rotateY(angulo), depois rotateZ, depois rotateX. Aplicar a um
// vetor do referencial da bandeja dá a direção dele no mundo.
function girarX(v, t) { return createVector(v.x, v.y * cos(t) - v.z * sin(t), v.y * sin(t) + v.z * cos(t)); }
function girarY(v, t) { return createVector(v.x * cos(t) + v.z * sin(t), v.y, -v.x * sin(t) + v.z * cos(t)); }
function girarZ(v, t) { return createVector(v.x * cos(t) - v.y * sin(t), v.x * sin(t) + v.y * cos(t), v.z); }
function daBandeja(v) {
  return girarY(girarZ(girarX(v, bandeja.rotX), bandeja.rotZ), garcom.angulo);
}

function atualizarBandeja(dt) {
  const b = bandeja;
  // A inclinação que o roteiro pede (inclinacaoAlvo, definida pela cena)
  // é perseguida aos poucos, como a mão de alguém: lado direito mais baixo
  // com x positivo, frente mais baixa com z positivo.
  b.inclX = lerp(b.inclX, inclinacaoAlvo.x, min(1, dt * 7));
  b.inclZ = lerp(b.inclZ, inclinacaoAlvo.z, min(1, dt * 7));
  b.rotZ = -b.inclX;
  b.rotX = -b.inclZ;

  // a posição: na frente do garçom, um pouco à direita, na altura do peito,
  // subindo e descendo de leve a cada passo
  const g = garcom;
  const balanco = sin(g.passo * TWO_PI * 2) * 0.35 * min(1, abs(g.vel) / 60);
  // Na reverência, a bandeja desce e vai um pouco para a frente. No susto,
  // o braço dá um reflexo (g.puxao, de 0 a 1): traz a bandeja para perto do
  // corpo e um pouco para cima, protegendo o pedido.
  b.pos = createVector(g.x, -(ALTURA_BANDEJA + balanco - 8 * g.reverencia + 5 * g.puxao), g.z)
    .add(frenteDe(g.angulo).mult(44 + 12 * g.reverencia - 11 * g.puxao))
    .add(direitaDe(g.angulo).mult(17 + 3 * g.puxao));

  // os eixos da bandeja no mundo
  b.normal = daBandeja(createVector(0, -1, 0));     // para cima
  b.eDir = daBandeja(createVector(-1, 0, 0));       // para a direita
  b.eFrente = daBandeja(createVector(0, 0, 1));     // para a frente

  // velocidade e aceleração por diferença entre quadros, suavizadas para o
  // ruído do tempo entre quadros não virar tremedeira
  if (b.posAnt && dt > 0) {
    const vel = p5.Vector.sub(b.pos, b.posAnt).div(dt);
    const acel = p5.Vector.sub(vel, b.vel).div(dt);
    b.acel.lerp(acel, 0.35);
    b.vel = vel;
  }
  b.posAnt = b.pos.copy();
}

// A gravidade efetiva, separada em duas partes: a que aperta o item contra
// a bandeja (normal) e a que empurra ao longo dela (u para a direita,
// v para a frente).
function gravidadeEfetiva() {
  const b = bandeja;
  const gEf = createVector(0, GRAVIDADE, 0).sub(b.acel);
  const aperto = -gEf.dot(b.normal);
  return {
    normal: max(aperto, 1),
    u: gEf.dot(b.eDir),
    v: gEf.dot(b.eFrente)
  };
}

// -----------------------------------------------------------------------
// Os itens em cima da bandeja
// -----------------------------------------------------------------------

function atualizarItens(dt) {
  const G = gravidadeEfetiva();
  perigo = 0;

  for (const it of itens) {
    const T = it.T;
    const lado = createVector(G.u, G.v);
    const forca = lado.mag();

    // Tombar: um objeto alto e de base estreita tomba antes de escorregar.
    // Ele vira quando a força lateral passa da normal vezes a razão entre
    // o raio da base e a altura do centro de massa (é o mesmo motivo pelo
    // qual uma taça vira mais fácil que um copo baixo).
    const limiteTombo = G.normal * T.base / T.centro;
    if (!it.tombado && T.tipo !== 'prato' && forca > limiteTombo && it.tipo !== 'prato') {
      it.tombado = true;
      it.dirTombo = lado.copy().normalize();
      derramarTudo(it);
    }
    if (it.tombado) it.tombo = min(1, it.tombo + dt * 5);

    // Escorregar: atrito estático segura até um limite; passou dele, o item
    // anda, freado pelo atrito dinâmico. Tombado, ele rola, quase sem atrito.
    const atritoEst = it.tombado ? 0.02 : T.atritoEst;
    const atritoDin = it.tombado ? 0.015 : T.atritoDin;
    const vel = createVector(it.du, it.dv);
    if (!it.deslizando) {
      if (forca > atritoEst * G.normal) it.deslizando = true;
    }
    if (it.deslizando) {
      const freio = vel.mag() > 0.01 ? vel.copy().normalize().mult(-atritoDin * G.normal) : createVector(0, 0);
      vel.add(p5.Vector.add(lado, freio).mult(dt));
      // A cortiça da bandeja segura um pouco mais quanto mais rápido o item
      // anda (um amortecimento): assim ele escorrega devagar e dá tempo de
      // corrigir a inclinação antes de chegar na borda.
      vel.mult(Math.exp(-(it.tombado ? 1.2 : 3.5) * dt));
      // parou de vez se a velocidade é pequena e a força não vence o atrito
      if (vel.mag() < 1.5 && forca <= atritoEst * G.normal) {
        vel.set(0, 0);
        it.deslizando = false;
      }
    }
    it.du = vel.x;
    it.dv = vel.y;
    it.u += it.du * dt;
    it.v += it.dv * dt;

    // o líquido balança como uma mola amortecida, perseguindo a inclinação
    // que a gravidade efetiva pede para a superfície
    if (T.liquido && it.cheio > 0 && !it.tombado) atualizarLiquido(it, G, dt);

    // o perigo (para o filtro): perto da borda, perto de tombar, derramando
    const borda = sqrt(it.u * it.u + it.v * it.v) / RAIO_BANDEJA;
    perigo = max(perigo, constrain((borda - 0.6) / 0.4, 0, 1));
    if (!it.tombado && it.tipo !== 'prato') perigo = max(perigo, constrain((forca / limiteTombo - 0.55) / 0.45, 0, 1));
  }

  separarItens();

  // quem passou da borda cai
  for (let k = itens.length - 1; k >= 0; k--) {
    const it = itens[k];
    const r = sqrt(it.u * it.u + it.v * it.v);
    if (r > RAIO_BANDEJA) {
      itens.splice(k, 1);
      soltar(it);
    }
  }
}

// Os itens não se atravessam: se dois círculos se sobrepõem, cada um é
// empurrado metade da distância para fora, e a velocidade que um tinha
// em direção ao outro é dividida entre os dois.
function separarItens() {
  for (let i = 0; i < itens.length; i++) {
    for (let j = i + 1; j < itens.length; j++) {
      const a = itens[i], b = itens[j];
      const ra = raioNaBandeja(a), rb = raioNaBandeja(b);
      const dx = b.u - a.u, dv = b.v - a.v;
      const d = sqrt(dx * dx + dv * dv);
      const minimo = ra + rb;
      if (d < minimo && d > 0.0001) {
        const nx = dx / d, nv = dv / d;
        const empurra = (minimo - d) / 2;
        a.u -= nx * empurra; a.v -= nv * empurra;
        b.u += nx * empurra; b.v += nv * empurra;
        const relativa = (b.du - a.du) * nx + (b.dv - a.dv) * nv;
        if (relativa < 0) {
          const troca = relativa / 2;
          a.du += nx * troca; a.dv += nv * troca;
          b.du -= nx * troca; b.dv -= nv * troca;
          a.deslizando = b.deslizando = true;
        }
      }
    }
  }
}

function raioNaBandeja(it) {
  // deitado, o copo ocupa mais espaço: metade da altura
  return it.tombado ? max(it.T.raio, it.T.altura * 0.45) : it.T.raio;
}

function atualizarLiquido(it, G, dt) {
  const L = it.T.liquido;
  // a superfície quer ficar perpendicular à gravidade efetiva: a tangente
  // da inclinação dela é a força lateral dividida pela normal
  const alvo = createVector(G.u / G.normal, G.v / G.normal);
  const K = 90, C = 4;   // mola (frequência de ~1,5 Hz) e amortecimento
  const acel = p5.Vector.sub(alvo, it.onda).mult(K).sub(it.ondaVel.copy().mult(C));
  it.ondaVel.add(acel.mult(dt));
  it.onda.add(it.ondaVel.copy().mult(dt));

  // Derrama quando a superfície inclinada encosta na borda do copo:
  // a tangente máxima é a folga entre o nível e a borda dividida pelo raio.
  const nivel = nivelDe(it);
  const maximo = (L.borda - nivel) / L.raioTopo;
  const excesso = it.onda.mag() - maximo;
  if (excesso > 0) {
    const perde = min(it.cheio, excesso * dt * 0.9);
    it.cheio -= perde;
    if (random() < 0.7) pingar(it, it.onda.copy().normalize(), 1);
    if (it.cheio < 0.02) it.cheio = 0;
  }
  perigo = max(perigo, constrain((it.onda.mag() / max(maximo, 0.01) - 0.6) / 0.4, 0, 1));
}

// O raio de dentro do bojo da taça numa altura h: o perfil de fora do
// modelo (veja modelos.taca) menos a espessura do vidro.
const BOJO = [[10, 2.5], [13, 4.6], [16.5, 5.0], [19, 4.7]];
function raioDoBojo(h) {
  if (h <= BOJO[0][0]) return BOJO[0][1] - 0.4;
  for (let k = 1; k < BOJO.length; k++) {
    const [h0, r0] = BOJO[k - 1], [h1, r1] = BOJO[k];
    if (h <= h1) return lerp(r0, r1, (h - h0) / (h1 - h0)) - 0.4;
  }
  return BOJO[BOJO.length - 1][1] - 0.4;
}

// O vinho tem a forma do bojo, que afina embaixo: um cilindro reto
// sairia pelo fundo da taça. Como o nível muda quando derrama, há uma malha
// pronta para cada nível, de 0,25 em 0,25 cm a partir de 10,5 cm, montada pelo mesmo
// revolucao() dos copos, com o perfil de dentro do bojo até aquele nível.
function prepararVinho() {
  const malhas = [];
  for (let n = 0; n <= 34; n++) {
    const topo = 10.5 + n * 0.25;
    const perfil = [[0, 10.2]];
    for (let h = 10.4; h < topo; h += 0.6) perfil.push([raioDoBojo(h), h]);
    perfil.push([raioDoBojo(topo), topo]);
    malhas.push(revolucao(perfil, 24));
  }
  return malhas;
}

function nivelDe(it) {
  const L = it.T.liquido;
  const fundo = L.fundo || 1;
  return fundo + (L.nivel - fundo) * it.cheio;
}

function derramarTudo(it) {
  if (!it.T.liquido || it.cheio <= 0) return;
  for (let k = 0; k < 14 * it.cheio; k++) pingar(it, it.dirTombo.copy(), 1);
  it.cheio = 0;
}

function nomeDe(it) {
  return { copo: 'O copo', taca: 'A taça', prato: 'O prato' }[it.tipo];
}

// a posição no mundo de um ponto da bandeja (u, v), a uma altura acima dela
function pontoDaBandeja(u, v, altura) {
  return p5.Vector.add(bandeja.pos, daBandeja(createVector(-u, -altura - 1.2, v)));
}

// uma gota sai pela borda do copo, para o lado em que o líquido subiu
function pingar(it, lado, n) {
  const L = it.T.liquido;
  for (let k = 0; k < n; k++) {
    const u = it.u + lado.x * L.raioTopo, v = it.v + lado.y * L.raioTopo;
    const p = pontoDaBandeja(u, v, L.borda);
    const espirro = p5.Vector.add(
      bandeja.eDir.copy().mult(lado.x * random(20, 60)),
      bandeja.eFrente.copy().mult(lado.y * random(20, 60)));
    gotas.push({ p, vel: p5.Vector.add(bandeja.vel, espirro).add(createVector(random(-10, 10), -random(0, 40), random(-10, 10))), cor: L.cor });
  }
}

// -----------------------------------------------------------------------
// O que caiu: queda livre, quebra e cacos
// -----------------------------------------------------------------------

// A altura do que está embaixo de um ponto: em cima de uma mesa é o tampo,
// no resto é o chão. É ela que faz uma taça caída sobre uma mesa quebrar
// em cima da mesa, e não atravessá-la. Os números são os da toalha em
// mesaRedonda(): raio 48 e o topo a 79 cm do chão.
function alturaDoChao(x, z) {
  for (const m of mesas) {
    if (dist(x, z, m.x, m.z) < 47.5) return 79;
  }
  return 0;
}

// Soltar: o item sai da bandeja continuando exatamente na posição em que
// estava, com as mesmas rotações do desenho (o ângulo do garçom, a
// inclinação da bandeja e, se ele tinha tombado, o tombo). A partir daí ele
// vai virando para o lado em que escorregou, como quem cai pela borda.
function soltar(it) {
  const p = pontoDaBandeja(it.u, it.v, 0);
  const vel = p5.Vector.add(bandeja.vel,
    bandeja.eDir.copy().mult(it.du)).add(bandeja.eFrente.copy().mult(it.dv));
  // a direção em que ele saiu, na bandeja (se estava parado, a do raio)
  const saida = createVector(it.du, it.dv);
  if (saida.mag() < 0.5) saida.set(it.u, it.v);
  caindo.push({
    it, p, vel,
    angulo: garcom.angulo, rotZ: bandeja.rotZ, rotX: bandeja.rotX,
    anguloSaida: atan2(-saida.x, saida.y),
    virada: 0,
    giro: it.tombado ? 2.5 : 5
  });
}

// As rotações de um item caindo, na mesma ordem do desenho, aplicadas a um
// ponto do item: serve para saber onde fica o topo dele (para ver se já
// bateu) e onde nasce cada caco.
function orientar(c, v) {
  let r = v.copy();
  const it = c.it;
  if (it.tombado) {
    r = girarX(r, -it.tombo * HALF_PI);
    r = girarY(r, atan2(-it.dirTombo.x, it.dirTombo.y));
  }
  r = girarY(r, -c.anguloSaida);
  r = girarX(r, -c.virada);
  r = girarY(r, c.anguloSaida);
  r = girarX(r, c.rotX);
  r = girarZ(r, c.rotZ);
  return girarY(r, c.angulo);
}

function atualizarQuedas(dt) {
  for (let k = caindo.length - 1; k >= 0; k--) {
    const c = caindo[k];
    c.vel.y += GRAVIDADE * dt;
    c.p.add(p5.Vector.mult(c.vel, dt));
    // vira até ficar deitado (um quarto de volta além do que já estava)
    c.virada = min(c.virada + c.giro * dt, HALF_PI);
    // bate quando a parte mais baixa (a base ou o topo) chega na superfície
    let maisBaixo = -Infinity;
    for (const v of amostras[c.it.tipo]) {
      const y = c.p.y + orientar(c, v).y;
      if (y > maisBaixo) maisBaixo = y;
    }
    const chao = alturaDoChao(c.p.x, c.p.z);
    if (-maisBaixo <= chao) {
      c.p.y -= maisBaixo + chao;
      caindo.splice(k, 1);
      quebrar(c);
    }
  }

  for (const s of cacos) {
    if (s.parado) continue;
    s.vel.y += GRAVIDADE * dt;
    s.p.add(p5.Vector.mult(s.vel, dt));
    s.ang.add(p5.Vector.mult(s.giro, dt));
    // O ponto mais baixo do caco, já girado (no p5 o y cresce para baixo,
    // então o mais baixo é o de y maior). É ele que não pode passar da
    // superfície, e não o centro: um caco largo e inclinado atravessaria.
    let maisBaixo = -Infinity;
    for (const v of s.pontas) {
      const y = girarX(girarY(girarZ(v, s.ang.z), s.ang.y), s.ang.x).y;
      if (y > maisBaixo) maisBaixo = y;
    }
    const chao = alturaDoChao(s.p.x, s.p.z);
    if (-(s.p.y + maisBaixo) <= chao + 0.6) {
      s.p.y = -(chao + 0.6) - maisBaixo;
      if (chao > 0) {
        // Na toalha quase não quica: escorrega, freado por um atrito
        // constante (perde 450 cm/s a cada segundo), e para de girar.
        s.vel.y *= -0.1;
        const deLado = createVector(s.vel.x, 0, s.vel.z);
        const v = deLado.mag();
        if (v > 0) deLado.setMag(max(0, v - 450 * dt));
        s.vel.x = deLado.x;
        s.vel.z = deLado.z;
        s.giro.mult(0.8);
        if (abs(s.vel.y) < 15 && deLado.mag() < 2) s.parado = true;
      } else {
        // no piso quica perdendo energia e é freado pelo atrito
        s.vel.y *= -0.25;
        s.vel.x *= 0.6;
        s.vel.z *= 0.6;
        s.giro.mult(0.5);
        if (abs(s.vel.y) < 20 && s.vel.mag() < 15) s.parado = true;
      }
    }
  }
  // limita a quantidade de cacos, tirando os mais antigos
  if (cacos.length > 400) cacos.splice(0, cacos.length - 400);

  for (let k = gotas.length - 1; k >= 0; k--) {
    const g = gotas[k];
    g.vel.y += GRAVIDADE * dt;
    g.p.add(p5.Vector.mult(g.vel, dt));
    // A gota que cai em cima da bandeja não a atravessa: ela escorre pela
    // superfície para o lado mais baixo (o da gravidade efetiva) e só cai
    // de novo quando passa da borda. Parada por muito tempo, a cortiça
    // absorve.
    const rel = p5.Vector.sub(g.p, bandeja.pos);
    const h = rel.dot(bandeja.normal);
    if (!g.naBandeja && h < 1.2 && h > -6) {
      const u = rel.dot(bandeja.eDir), v = rel.dot(bandeja.eFrente);
      if (u * u + v * v < RAIO_BANDEJA * RAIO_BANDEJA) {
        g.naBandeja = true;
        g.u = u; g.v = v; g.vida = 0;
      }
    }
    if (g.naBandeja) {
      const G = gravidadeEfetiva();
      g.u += G.u * 0.1 * dt;
      g.v += G.v * 0.1 * dt;
      g.vida += dt;
      g.p = pontoDaBandeja(g.u, g.v, 0.3);
      if (g.u * g.u + g.v * g.v > RAIO_BANDEJA * RAIO_BANDEJA) {
        // passou da borda: cai, com a velocidade da bandeja e um pouco
        // para fora
        g.naBandeja = false;
        const fora = p5.Vector.add(bandeja.eDir.copy().mult(g.u), bandeja.eFrente.copy().mult(g.v)).setMag(25);
        g.vel = p5.Vector.add(bandeja.vel, fora);
        g.p.add(fora.copy().setMag(1.5));
      } else if (g.vida > 4) {
        gotas.splice(k, 1);
      }
      continue;
    }
    const chao = alturaDoChao(g.p.x, g.p.z);
    if (-g.p.y <= chao) {
      gotas.splice(k, 1);
      adicionarPoca(g.p.x, g.p.z, chao, g.cor);
    }
  }
}

function adicionarPoca(x, z, h, cor) {
  for (const p of pocas) {
    if (p.h === h && dist(p.x, p.z, x, z) < p.r) {
      p.r = min(p.r + 0.6, 28);
      return;
    }
  }
  if (pocas.length > 60) pocas.shift();
  pocas.push({ x, z, h, r: 3, cor });
}

// Quebrar: o item vira os pedaços que foram preparados no setup a partir
// da própria malha dele (veja prepararPedacos). Cada pedaço sai com a
// velocidade da queda, mais um empurrão para fora e para cima.
function quebrar(c) {
  const it = c.it;
  // o prato quebra, mas o macarrão fica onde caiu, espalhado
  if (it.tipo === 'prato') {
    restos.push({ x: c.p.x, z: c.p.z, h: alturaDoChao(c.p.x, c.p.z), ang: c.angulo + c.anguloSaida });
  }
  if (it.T.liquido && it.cheio > 0) {
    for (let k = 0; k < 12 * it.cheio; k++) {
      gotas.push({ p: c.p.copy().add(createVector(0, -2, 0)), vel: createVector(random(-90, 90), -random(40, 160), random(-90, 90)), cor: it.T.liquido.cor });
    }
  }
  // em cima da mesa a toalha amortece a batida, e os cacos espalham menos
  // e os cacos saem mais rentes, espalhando-se de lado e escorregando
  // pela toalha em vez de voar
  const naToalha = alturaDoChao(c.p.x, c.p.z) > 0;
  const forca = naToalha ? 0.3 : 1;
  for (const pedaco of pedacos[it.tipo]) {
    let fora = createVector(pedaco.centro.x, 0, pedaco.centro.z);
    if (fora.mag() < 0.01) fora.set(random(-1, 1), 0, random(-1, 1));
    // um desvio no ângulo, para os pedaços não saírem todos em raios
    fora = girarY(fora.normalize(), random(-0.5, 0.5));
    fora.mult(naToalha ? random(30, 100) : random(60, 180));
    cacos.push({
      malha: pedaco.malha,
      pontas: pedaco.pontas,
      tipo: it.tipo,
      // cada caco nasce onde aquele pedaço estava no item, já virado
      p: p5.Vector.add(c.p, orientar(c, pedaco.centro)),
      vel: p5.Vector.mult(c.vel, 0.25 * forca).add(fora).add(createVector(0, -random(80, 220) * forca, 0)),
      ang: createVector(random(TWO_PI), random(TWO_PI), random(TWO_PI)),
      giro: createVector(random(-12, 12), random(-12, 12), random(-12, 12)),
      parado: false
    });
  }
}

// -----------------------------------------------------------------------
// Modelos
// -----------------------------------------------------------------------

// Um sólido de revolução: um perfil (raio, altura) girado em volta do eixo
// y, como o vaso do slide. Um ponto do perfil com raio 0 vira um vértice só
// (o meio do fundo, por exemplo), ligado ao anel vizinho por um leque de
// triângulos, para não haver triângulos degenerados.
// A volta não repete o primeiro vértice: o último liga no primeiro pelo
// índice (i + 1) % n, e por isso não há emenda.
// escolhe até n vértices espalhados de uma lista (sempre os mesmos)
function amostrar(vertices, n) {
  const passo = max(1, floor(vertices.length / n));
  const lista = [];
  for (let i = 0; i < vertices.length; i += passo) lista.push(vertices[i].copy());
  return lista;
}

function revolucao(perfil, n) {
  const g = new p5.Geometry();
  const aneis = [];
  for (const [r, h] of perfil) {
    const anel = [];
    if (r === 0) {
      anel.push(g.vertices.length);
      g.vertices.push(createVector(0, -h, 0));
    } else {
      for (let i = 0; i < n; i++) {
        const a = TWO_PI * i / n;
        anel.push(g.vertices.length);
        g.vertices.push(createVector(r * cos(a), -h, r * sin(a)));
      }
    }
    aneis.push(anel);
  }
  for (let j = 0; j < aneis.length - 1; j++) {
    const A = aneis[j], B = aneis[j + 1];
    for (let i = 0; i < n; i++) {
      const i1 = (i + 1) % n;
      if (A.length === 1) g.faces.push([A[0], B[i1], B[i]]);
      else if (B.length === 1) g.faces.push([A[i], A[i1], B[0]]);
      else g.faces.push([A[i], A[i1], B[i1]], [A[i], B[i1], B[i]]);
    }
  }
  // Como o perfil pode ir para fora ou para dentro, a ordem das faces pode
  // sair do avesso. Conferimos com a normal da primeira face lateral: ela
  // deve apontar para longe do eixo; se não apontar, invertemos todas.
  const [a, b, c] = g.faces[n > 0 && aneis[0].length > 1 ? 0 : n];
  const nf_ = p5.Vector.sub(g.vertices[b], g.vertices[a]).cross(p5.Vector.sub(g.vertices[c], g.vertices[a]));
  const meio = p5.Vector.add(g.vertices[a], g.vertices[b]).add(g.vertices[c]).div(3);
  if (nf_.dot(createVector(meio.x, 0, meio.z)) < 0) {
    g.faces = g.faces.map(([x, y, z]) => [x, z, y]);
  }
  g.computeNormals();
  return g;
}

function montarModelos() {
  // copo: fundo grosso, paredes levemente abertas, sem tampa
  modelos.copo = revolucao([[0, 0], [4.5, 0], [4.6, 1.2], [5.2, 13]], 24);
  // taça: pé, haste fina e bojo
  modelos.taca = revolucao([[0, 0], [4.2, 0], [4.0, 0.5], [0.6, 1.2], [0.5, 8.5], [2.5, 10], [4.6, 13], [5.0, 16.5], [4.7, 19]], 24);
  // prato raso
  modelos.prato = revolucao([[0, 0], [8.5, 0], [11, 1.3], [11.5, 2.0], [10.8, 1.9], [8.2, 0.8], [0, 0.8]], 32);
  // o espaguete em cima do prato, montado com buildGeometry: um monte
  // achatado, fios enrolados por cima (toros deitados em ângulos
  // diferentes), o molho e duas folhas de manjericão. Os ângulos vêm de
  // contas fixas, e não de random(), para o prato ser sempre igual.
  modelos.macarrao = buildGeometry(() => {
    noStroke();
    fill(232, 200, 128);
    push(); translate(0, -1.2, 0); scale(1, 0.4, 1); sphere(6.4, 14, 8); pop();
    fill(240, 212, 140);
    for (let k = 0; k < 12; k++) {
      const a = k * 2.4;
      const d = 0.6 + (k % 4) * 1.25;
      push();
      translate(d * cos(a), -(3.3 - d * 0.42), d * sin(a));
      rotateY(a);
      rotateX(HALF_PI + 0.35 * sin(k * 1.7));
      rotateY(0.3 * cos(k * 2.3));
      torus(1.8 + (k % 3) * 0.55, 0.3, 14, 5);
      pop();
    }
    fill(172, 36, 22);
    push(); translate(0.4, -3.6, -0.3); scale(1, 0.38, 1); sphere(2.8, 12, 6); pop();
    push(); translate(-1.6, -3.2, 1.4); scale(1, 0.5, 1); sphere(1.1, 8, 5); pop();
    fill(58, 122, 42);
    push(); translate(0.9, -4.6, 0.6); rotateY(0.6); scale(1.4, 0.15, 0.7); sphere(1, 8, 5); pop();
    push(); translate(-0.4, -4.5, 1.1); rotateY(-0.9); scale(1.2, 0.15, 0.6); sphere(1, 8, 5); pop();
  });
  modelos.vinho = prepararVinho();
  // o líquido: um cilindro de altura 1, esticado com scale até o nível
  modelos.liquido = buildGeometry(() => {
    noStroke();
    push(); translate(0, -0.5, 0); cylinder(1, 1, 24, 1, true, false); pop();
  });
  // a superfície do líquido, um disco de raio 1 que inclina com a onda
  modelos.superficie = buildGeometry(() => {
    noStroke();
    cylinder(1, 0.05, 24, 1, true, true);
  });

  modelos.bandeja = buildGeometry(() => {
    noStroke();
    push(); translate(0, -0.6, 0); cylinder(RAIO_BANDEJA, 1.2, 40, 1); pop();
  });

  for (const tipo of ['copo', 'taca', 'prato']) pedacos[tipo] = prepararPedacos(modelos[tipo], tipo === 'prato' ? 6 : 7, 2);
  // alguns vértices de cada item, para saber qual é a parte mais baixa dele
  // quando estiver caindo girado (um prato inclinado encosta a borda antes
  // de encostar o meio)
  for (const tipo of ['copo', 'taca', 'prato']) amostras[tipo] = amostrar(modelos[tipo].vertices, 24);

  modelos.mesa = buildGeometry(() => mesaRedonda());
  modelos.cadeira = buildGeometry(() => cadeira());
  modelos.pessoas = [0, 1, 2].map(k => buildGeometry(() => pessoa(k)));
  modelos.corpoGarcom = buildGeometry(() => corpoGarcom());
  // A perna tem duas peças, coxa e canela, para o joelho dobrar no passo.
  // Cada peça é feita apontando para +y (para baixo), com o ponto de giro
  // (quadril ou joelho) na origem.
  modelos.coxa = buildGeometry(() => {
    noStroke();
    fill(30, 30, 34);
    push(); translate(0, 22, 0); cylinder(6.5, 44, 10, 1); pop();
    push(); translate(0, 44, 0); sphere(5.8, 10, 8); pop();
  });
  modelos.canela = buildGeometry(() => {
    noStroke();
    fill(30, 30, 34);
    push(); translate(0, 20, 0); cylinder(5.6, 40, 10, 1); pop();
    fill(15);
    push(); translate(0, 41, 4); box(10, 5, 22); pop();
  });
  // o braço esquerdo, solto do corpo para balançar ao andar
  modelos.bracoEsq = buildGeometry(() => {
    noStroke();
    fill(245, 245, 240);
    push(); translate(0, 13, 0); cylinder(4.6, 26, 10, 1); pop();
    push(); translate(0, 26, 0); sphere(4.4, 10, 8); pop();
    push(); translate(0, 37, 1); cylinder(4.2, 22, 10, 1); pop();
    fill(232, 190, 160);
    push(); translate(0, 51, 1.5); sphere(5, 10, 8); pop();
  });
  // as expressões do garçom, uma malha para cada, desenhadas por cima da
  // cabeça (que está no corpo, centro em y = -166, z = 1, raio 11)
  modelos.rostos = {};
  for (const e of ['confiante', 'susto', 'orgulho', 'choque']) {
    modelos.rostos[e] = buildGeometry(() => rosto(0, -166, 1, 11, e, [232, 190, 160]));
  }
  modelos.braco = buildGeometry(() => {
    noStroke();
    fill(245, 245, 240);
    push(); translate(0, 15, 0); cylinder(4.6, 30, 10, 1); pop();
  });
  modelos.mao = buildGeometry(() => {
    noStroke();
    fill(232, 190, 160);
    sphere(5, 10, 8);
  });
}

// Quebrar em pedaços usando as faces da própria malha: cada triângulo vai
// para um pedaço conforme o ângulo em volta do eixo e a altura em que está.
// Cada pedaço vira um p5.Geometry novo, com os vértices renumerados a
// partir de 0 (os índices das faces mudam, por isso o mapa "novo") e
// medidos a partir do centro do pedaço, para ele girar em torno de si.
// Isso é feito uma vez só, no setup; na quebra, só se copiam as posições.
function prepararPedacos(malha, setores, faixas) {
  let hMin = Infinity, hMax = -Infinity;
  for (const v of malha.vertices) {
    if (-v.y < hMin) hMin = -v.y;
    if (-v.y > hMax) hMax = -v.y;
  }
  const grupos = [];
  for (const f of malha.faces) {
    const c = p5.Vector.add(malha.vertices[f[0]], malha.vertices[f[1]]).add(malha.vertices[f[2]]).div(3);
    const s = floor(((atan2(c.z, c.x) + TWO_PI) % TWO_PI) / TWO_PI * setores) % setores;
    const t = constrain(floor((-c.y - hMin) / max(hMax - hMin, 0.001) * faixas), 0, faixas - 1);
    const k = s * faixas + t;
    if (!grupos[k]) grupos[k] = [];
    grupos[k].push(f);
  }
  const lista = [];
  for (const faces of grupos) {
    if (!faces) continue;
    const g = new p5.Geometry();
    const novo = new Map();
    const centro = createVector(0, 0, 0);
    let qtd = 0;
    for (const f of faces) for (const i of f) {
      if (!novo.has(i)) {
        novo.set(i, g.vertices.length);
        g.vertices.push(malha.vertices[i].copy());
        g.vertexNormals.push(malha.vertexNormals[i].copy());
        centro.add(malha.vertices[i]);
        qtd++;
      }
    }
    centro.div(qtd);
    for (const v of g.vertices) v.sub(centro);
    for (const f of faces) g.faces.push(f.map(i => novo.get(i)));
    lista.push({ malha: g, centro, pontas: amostrar(g.vertices, 30) });
  }
  return lista;
}

function mesaRedonda() {
  noStroke();
  // toalha branca caindo até a metade, por cima do tampo
  fill(246, 242, 232);
  push(); translate(0, -77.5, 0); cylinder(48, 3, 32, 1); pop();
  push(); translate(0, -63, 0); cylinder(48.5, 28, 32, 1, false, false); pop();
  fill(60, 44, 34);
  push(); translate(0, -38, 0); cylinder(4.5, 50, 10, 1); pop();
  push(); translate(0, -1.5, 0); cylinder(22, 3, 20, 1); pop();
  // uma vela no meio
  fill(240, 232, 210);
  push(); translate(0, -84, 0); cylinder(1.4, 10, 8, 1); pop();
  fill(255, 200, 90);
  push(); translate(0, -91, 0); sphere(1.2, 6, 4); pop();
}

function cadeira() {
  noStroke();
  fill(96, 62, 40);
  push(); translate(0, -45, 0); box(36, 4, 36); pop();
  push(); translate(0, -70, -16); box(36, 46, 4); pop();
  for (const [x, z] of [[-15, -15], [15, -15], [-15, 15], [15, 15]]) {
    push(); translate(x, -22, z); box(3, 44, 3); pop();
  }
}

// um cliente sentado, olhando para +z (para a mesa)
function pessoa(k) {
  noStroke();
  const roupas = [[70, 110, 160], [160, 70, 80], [90, 130, 90]];
  const peles = [[232, 190, 160], [190, 140, 105], [120, 80, 60]];
  const cabelos = [[40, 30, 25], [150, 100, 50], [20, 20, 20]];
  fill(roupas[k]);
  push(); translate(0, -78, -6); ellipsoid(17, 26, 11, 14, 10); pop();
  // pernas dobradas, coxas para a frente
  fill(50, 54, 70);
  for (const x of [-8, 8]) {
    push(); translate(x, -52, 10); rotateX(HALF_PI); cylinder(6, 30, 8, 1); pop();
    push(); translate(x, -26, 24); cylinder(5, 48, 8, 1); pop();
  }
  fill(roupas[k]);
  for (const x of [-20, 20]) {
    push(); translate(x, -82, 8); rotateX(1.2); cylinder(4.5, 30, 8, 1); pop();
  }
  fill(peles[k]);
  push(); translate(0, -116, -4); sphere(11, 14, 10); pop();
  fill(cabelos[k]);
  push(); translate(0, -121, -8.5); ellipsoid(11.5, 8, 11, 12, 8); pop();
  rosto(0, -116, -4, 11, 'neutro', peles[k]);
}

// Um rosto sobre uma cabeça esférica de centro (cx, cy, cz) e raio r,
// olhando para +z. Cada traço é posto na superfície da esfera: dado o x e
// o y do traço, a profundidade z sai da equação da esfera,
// z = cz + raiz(r² - x² - y²).
function naCabeca(cx, cy, cz, r, x, y, afunda = 0.3) {
  return createVector(cx + x, cy + y, cz + sqrt(max(0, r * r - x * x - y * y)) - afunda);
}

function rosto(cx, cy, cz, r, expressao, pele) {
  noStroke();
  const ponto = (x, y, afunda) => naCabeca(cx, cy, cz, r, x, y, afunda);
  const arregalado = expressao === 'susto' || expressao === 'choque';
  // nariz
  fill(pele[0] * 0.9, pele[1] * 0.85, pele[2] * 0.85);
  push(); translate(ponto(0, 1, 1.4)); sphere(1.7, 8, 6); pop();
  fill(28, 20, 18);
  for (const lado of [-1, 1]) {
    // olhos: fechados (um risco) no orgulho, maiores no susto
    push();
    translate(ponto(lado * 3.8, -2, 0.4));
    if (expressao === 'orgulho') box(2.8, 0.6, 0.8);
    else sphere(arregalado ? 1.75 : 1.25, 8, 6);
    pop();
    // sobrancelhas: sobem no susto, tortas para dentro no choque
    push();
    translate(ponto(lado * 3.8, arregalado ? -7.4 : -5.8, 0.2));
    rotateZ(lado * (expressao === 'choque' ? -0.35 : expressao === 'confiante' ? 0.12 : 0));
    box(3.4, 0.7, 0.8);
    pop();
  }
  if (arregalado) {
    // boca aberta em "o"
    push(); translate(ponto(0, 6, 0.3)); ellipsoid(1.8, expressao === 'choque' ? 2.6 : 2, 0.8, 8, 6); pop();
  } else {
    // sorriso: pontinhos numa curva que sobe nas pontas
    const curva = expressao === 'orgulho' ? 0.22 : expressao === 'confiante' ? 0.13 : 0.04;
    const largura = expressao === 'orgulho' ? 4 : 3;
    for (let i = -3; i <= 3; i++) {
      const x = i / 3 * largura;
      push(); translate(ponto(x, 5.6 - curva * x * x, 0.2)); sphere(0.55, 6, 4); pop();
    }
  }
}

// o garçom, olhando para +z, com os pés em y = 0; as pernas e o braço
// direito são desenhados à parte, porque se mexem
function corpoGarcom() {
  noStroke();
  fill(245, 245, 240);            // camisa
  push(); translate(0, -122, 0); ellipsoid(19, 30, 12, 16, 12); pop();
  fill(25, 25, 30);               // colete
  push(); translate(0, -116, 1); ellipsoid(19.5, 24, 12.5, 16, 12); pop();
  fill(30, 30, 34);               // quadril
  push(); translate(0, -90, 0); ellipsoid(17, 10, 11, 14, 8); pop();
  // braço esquerdo, caído. Visto de trás, a esquerda do garçom fica em +x
  // no referencial dele (no p5, olhando para +z, o +x fica à esquerda).
  // (ele é desenhado à parte, para balançar: modelos.bracoEsq)
  fill(245, 245, 240);
  push(); translate(22, -138, 0); sphere(5, 10, 8); pop();
  fill(232, 190, 160);            // pescoço e cabeça
  push(); translate(0, -152, 0); cylinder(5, 10, 10, 1); pop();
  push(); translate(0, -166, 1); sphere(11, 16, 12); pop();
  fill(40, 30, 25);               // cabelo
  // o cabelo fica um pouco para trás, para não cobrir a testa
  push(); translate(0, -171, -3.5); ellipsoid(11.6, 8.5, 11.4, 14, 10); pop();
  // A gravata borboleta encostada na gola: a camisa é um elipsoide de
  // centro y = -122 e raios 19, 30, 12; na altura y = -146 a frente dele
  // fica em z = 12 * raiz(1 - (24/30)²), que dá 7,2. A gravata vai logo ali.
  fill(150, 20, 30);
  push(); translate(0, -146, 7.6); box(8, 3, 1.4); pop();
  push(); translate(0, -146, 8.1); sphere(1.3, 6, 4); pop();
}

// -----------------------------------------------------------------------
// Luz
// -----------------------------------------------------------------------

function luzes() {
  ambientLight(62, 52, 46);
  directionalLight(110, 100, 92, 0.3, 1, -0.4);
  // duas luzes quentes de restaurante, uma de cada lado do salão
  pointLight(120, 84, 50, -200, -250, 150);
  pointLight(120, 84, 50, 200, -250, -350);
}

// -----------------------------------------------------------------------
// Desenho
// -----------------------------------------------------------------------

function desenharSala() {
  // chão e paredes: retângulos com textura que se repete (uv acima de 1)
  textureWrap(REPEAT);
  push();
  texture(texturas.piso);
  translate(0, 0, 0);
  rotateX(HALF_PI);
  plano(SALA_X * 2, SALA_Z * 2, SALA_X * 2 / 80, SALA_Z * 2 / 80);
  pop();
  const paredes = [
    [0, -SALA_Z, 0, SALA_X * 2], [0, SALA_Z, PI, SALA_X * 2],
    [-SALA_X, 0, HALF_PI, SALA_Z * 2], [SALA_X, 0, -HALF_PI, SALA_Z * 2]
  ];
  for (const [x, z, a, larg] of paredes) {
    push();
    translate(x, -PE_DIREITO / 2, z);
    rotateY(a);
    texture(texturas.parede);
    plano(larg, PE_DIREITO, larg / 160, 1);
    pop();
  }
  // a porta da cozinha, de onde o garçom sai
  push();
  translate(0, -110, SALA_Z - 1);
  rotateY(PI);
  texture(texturas.porta);
  emissiveMaterial(40, 30, 20);
  plane(120, 220);
  emissiveMaterial(0, 0, 0);
  pop();

  for (const m of mesas) {
    push();
    translate(m.x, 0, m.z);
    model(modelos.mesa);
    pop();
  }
  for (const c of cadeiras) {
    push();
    translate(c.x, 0, c.z);
    rotateY(c.angulo);
    model(modelos.cadeira);
    pop();
  }
  const agora = millis() / 1000;
  for (const p of pessoas) {
    push();
    translate(p.x, 0, p.z);
    if (p.emPe) {
      desenharEmPe(p);
    } else {
      // sentados, os clientes não ficam congelados: respiram e mexem um
      // pouco o corpo, cada um no seu ritmo
      rotateY(p.angulo + 0.06 * sin(agora * 0.6 + p.fase));
      scale(1, 1 + 0.008 * sin(agora * 1.7 + p.fase), 1);
      model(modelos.pessoas[p.modelo]);
    }
    pop();
  }
  for (const r of restos) {
    push();
    translate(r.x, -r.h, r.z);
    rotateY(r.ang);
    scale(1.25, 0.55, 1.25);
    model(modelos.macarrao);
    pop();
  }
  for (const p of pocas) {
    push();
    translate(p.x, -p.h - 0.4, p.z);
    rotateX(HALF_PI);
    fill(p.cor[0], p.cor[1], p.cor[2], 170);
    specularMaterial(200);
    shininess(60);
    ellipse(0, 0, p.r * 2, p.r * 1.6, 16);
    pop();
  }
}

// um plano com coordenadas de textura que vão de 0 a ru e 0 a rv, para a
// textura se repetir em vez de esticar
function plano(w, h, ru, rv) {
  beginShape(TRIANGLES);
  const pts = [[-1, -1, 0, 0], [1, -1, ru, 0], [1, 1, ru, rv], [-1, -1, 0, 0], [1, 1, ru, rv], [-1, 1, 0, rv]];
  normal(0, 0, 1);
  for (const [x, y, u, v] of pts) vertex(x * w / 2, y * h / 2, 0, u, v);
  endShape();
}

// a mesa do pedido tem um anel dourado pulsando no chão em volta
function desenharMarcador(m) {
  const pulso = 0.5 + 0.5 * sin(millis() / 300);
  push();
  translate(m.x, -1, m.z);
  rotateX(HALF_PI);
  fill(255, 200, 80);
  emissiveMaterial(180 * pulso + 60, 130 * pulso + 40, 20);
  torus(110, 2.5, 48, 6);
  emissiveMaterial(0, 0, 0);
  pop();
}

function desenharGarcom() {
  const g = garcom;
  // O passo: a fase vai de 0 a 2π a cada ciclo de dois passos, e o tamanho
  // do movimento cresce com a velocidade (parado, nada balança).
  const fase = g.passo * TWO_PI;
  const tam = min(1, abs(g.vel) / 60);
  // o corpo sobe quando a perna está esticada embaixo dele e desce entre um
  // passo e outro, e gira um pouco para os lados
  const sobe = -1.6 * tam * abs(cos(fase));
  const ginga = 0.035 * tam * sin(fase);

  push();
  translate(g.x, 0, g.z);
  rotateY(g.angulo);

  // pernas: a coxa vai para a frente e para trás, e o joelho dobra quando a
  // perna está voltando para a frente (no ar)
  for (const [x, atraso] of [[-8, 0], [8, PI]]) {
    const f = fase + atraso;
    push();
    translate(x, -86, 0);
    rotateX(0.38 * tam * sin(f));
    model(modelos.coxa);
    translate(0, 44, 0);
    rotateX(-0.8 * tam * max(0, sin(f + 1.4)));
    model(modelos.canela);
    pop();
  }

  // O tronco: sobe e desce com o passo, ginga, e na reverência curva em
  // volta do quadril (y = -90): leva o quadril para a origem, gira, e traz
  // de volta.
  push();
  translate(0, sobe, 0);
  translate(0, -90, 0);
  rotateX(-CURVA_REVERENCIA * g.reverencia);
  rotateZ(ginga);
  translate(0, 90, 0);
  model(modelos.corpoGarcom);
  model(modelos.rostos[g.expressao]);
  // o braço esquerdo balança ao contrário da perna esquerda
  push();
  translate(22, -138, 0);
  // no susto ele também sobe e abre, num reflexo de equilíbrio
  rotateZ(0.08 + 0.7 * g.puxao);
  // na reverência o tronco vai para a frente e o braço continua pendurado,
  // então ele gira para trás quase o mesmo tanto que o tronco girou
  rotateX(-0.3 * tam * sin(fase + PI) + 0.85 * CURVA_REVERENCIA * g.reverencia - 0.9 * g.puxao);
  model(modelos.bracoEsq);
  pop();
  pop();
  pop();

  const { ombro, cotovelo, mao } = bracoDireito(sobe);
  osso(ombro, cotovelo);
  osso(cotovelo, mao);
  push();
  translate(mao.x, mao.y, mao.z);
  model(modelos.mao);
  pop();
}

// O braço direito vai do ombro até a mão embaixo da bandeja. Em vez de
// ângulos fixos, ele é apontado: o cilindro, feito ao longo de +y, é
// girado para ficar na direção que liga os dois pontos (veja osso()).
// 'sobe' é o quanto o corpo subiu no passo.
function bracoDireito(sobe) {
  const g = garcom;
  // O ombro está no tronco, então acompanha a reverência: o ponto é girado
  // em volta do quadril pela mesma conta do desenho, e depois pelo ângulo
  // do garçom. (No referencial do garçom, a direita dele é -x.)
  const noCorpo = (x, y, z) => {
    const p = girarX(createVector(x, y + 90, z), -CURVA_REVERENCIA * g.reverencia);
    return girarY(createVector(p.x, p.y - 90 + sobe, p.z), g.angulo).add(createVector(g.x, 0, g.z));
  };
  const ombro = noCorpo(-21, -138, 0);
  // A mão fica presa embaixo do meio da bandeja, seguindo a inclinação dela
  // (6 cm abaixo, na direção contrária à normal). O cotovelo fica atrás da
  // borda da bandeja, do lado do garçom, e abaixo dela: como a mão e o
  // cotovelo estão os dois abaixo do plano da bandeja, o antebraço inteiro
  // fica embaixo dela; e como o cotovelo está fora da borda, o braço que vem
  // do ombro também não atravessa a bandeja, nem inclinada, nem na reverência.
  const b = bandeja;
  const mao = p5.Vector.sub(b.pos, b.normal.copy().mult(6));
  const cotovelo = p5.Vector.sub(b.pos, b.eFrente.copy().mult(RAIO_BANDEJA + 6 + 22 * g.reverencia + 16 * g.puxao))
    .sub(b.normal.copy().mult(16 + 12 * g.puxao))
    .add(b.eDir.copy().mult(5));
  return { ombro, cotovelo, mao };
}

function osso(a, b) {
  const d = p5.Vector.sub(b, a);
  const comp = d.mag();
  push();
  translate(a.x, a.y, a.z);
  // gira +y até a direção d: primeiro em volta de y, depois inclina
  rotateY(atan2(d.x, d.z));
  rotateX(Math.acos(constrain(d.y / comp, -1, 1)));
  scale(1, comp / 30, 1);
  model(modelos.braco);
  pop();
}

function desenharBandeja() {
  const b = bandeja;
  push();
  translate(b.pos.x, b.pos.y, b.pos.z);
  rotateY(garcom.angulo);
  rotateZ(b.rotZ);
  rotateX(b.rotX);
  texture(texturas.cortica);
  model(modelos.bandeja);
  // primeiro o que não é transparente, depois os vidros, para a mistura
  // de cores do vidro enxergar o que está atrás
  for (const it of itens) if (it.tipo === 'prato') desenharItem(it);
  for (const it of itens) if (it.tipo !== 'prato') desenharItem(it);
  pop();
}

// um item no referencial da bandeja: u para a direita é -x
function desenharItem(it) {
  push();
  translate(-it.u, -1.2, it.v);
  if (it.tombado) {
    // tomba em volta da borda da base, para o lado da força
    const d = it.dirTombo;
    const a = it.tombo * HALF_PI;
    translate(-d.x * it.T.base, 0, d.y * it.T.base);
    rotateY(atan2(-d.x, d.y));
    rotateX(-a);
    translate(0, 0, -it.T.base);
  }
  desenharObjeto(it.tipo, it);
  pop();
}

function desenharObjeto(tipo, it) {
  if (tipo === 'prato') {
    fill(250, 250, 246);
    specularMaterial(120);
    shininess(40);
    model(modelos.prato);
    model(modelos.macarrao);
    return;
  }
  const L = TIPOS[tipo].liquido;
  if (it && it.cheio > 0.01 && !it.tombado) {
    const nivel = nivelDe(it);
    const fundo = L.fundo || 1;
    const raio = tipo === 'taca' ? raioDoBojo(nivel) : L.raioTopo * 0.94;
    fill(L.cor);
    if (tipo === 'taca') {
      // abaixo de 10,5 cm sobra só um fundinho, que nem aparece
      if (nivel >= 10.5) model(modelos.vinho[constrain(round((nivel - 10.5) / 0.25), 0, 34)]);
    } else {
      push();
      translate(0, -fundo, 0);
      scale(raio * 0.92, nivel - fundo, raio * 0.92);
      model(modelos.liquido);
      pop();
    }
    // a superfície, inclinada pela onda
    push();
    translate(0, -nivel, 0);
    // Math.atan, e não o atan do p5: em algumas versões do p5 2 o atan
    // está reservado para os shaders escritos em JavaScript (p5.strands)
    rotateZ(Math.atan(it.onda.x));
    rotateX(-Math.atan(it.onda.y));
    scale(raio);
    model(modelos.superficie);
    pop();
  }
  fill(215, 236, 245, 95);
  specularMaterial(255);
  shininess(90);
  model(modelos[tipo]);
}

function desenharQuedas() {
  for (const c of caindo) {
    push();
    translate(c.p.x, c.p.y, c.p.z);
    // as mesmas rotações da bandeja, e depois a virada pela borda
    rotateY(c.angulo);
    rotateZ(c.rotZ);
    rotateX(c.rotX);
    rotateY(c.anguloSaida);
    rotateX(-c.virada);
    rotateY(-c.anguloSaida);
    if (c.it.tombado) {
      // o mesmo tombo do desenho na bandeja, em volta da borda da base
      const d = c.it.dirTombo, base = c.it.T.base;
      translate(-d.x * base, 0, d.y * base);
      rotateY(atan2(-d.x, d.y));
      rotateX(-c.it.tombo * HALF_PI);
      translate(0, 0, -base);
    }
    desenharObjeto(c.it.tipo, null);
    pop();
  }
  for (const s of cacos) {
    push();
    translate(s.p.x, s.p.y, s.p.z);
    rotateX(s.ang.x);
    rotateY(s.ang.y);
    rotateZ(s.ang.z);
    if (s.tipo === 'prato') {
      fill(250, 250, 246);
    } else {
      fill(215, 236, 245, 140);
    }
    specularMaterial(255);
    shininess(80);
    model(s.malha);
    pop();
  }
  if (gotas.length > 0) {
    push();
    strokeWeight(4);
    beginShape(POINTS);
    for (const g of gotas) {
      stroke(g.cor[0], g.cor[1], g.cor[2]);
      vertex(g.p.x, g.p.y, g.p.z);
    }
    endShape();
    pop();
  }
}

// -----------------------------------------------------------------------
// Interface
// -----------------------------------------------------------------------

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// -----------------------------------------------------------------------
// O filtro de cinema
//
// A porta mais barata da aula: um fragment shader que recebe a imagem
// pronta (tex0) e devolve a cor final de cada pixel. Ele faz o "jeito de
// filme" do curta:
//
// 1. Faixas pretas em cima e embaixo, deixando a imagem larga como no cinema.
// 2. Na câmera lenta (uLento), a cor perde saturação e esfria, e as bordas
//    escurecem mais: o momento fica suspenso.
// 3. Vinheta, um tom quente de restaurante e um grão leve de película.
// 4. A entrada saindo do preto (uEscuro).
//
// GLSL ES 1.00, vTexCoord de 0 a 1, saída em gl_FragColor.
// -----------------------------------------------------------------------

const FILTRO_CINEMA = `
precision highp float;
varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform vec2 uTamanho;
uniform float uLento;
uniform float uEscuro;
uniform float uT;

const float FAIXA = 0.1;                 // altura de cada faixa preta
const float VINHETA = 0.45;
const vec3 QUENTE = vec3(1.06, 1.0, 0.9);
const vec3 FRIO = vec3(0.85, 0.95, 1.12);
const float GRAO = 0.035;

float aleatorio(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = vTexCoord;
  vec3 cor = texture2D(tex0, uv).rgb;

  // tom: quente normalmente, frio e menos saturado na câmera lenta
  float cinza = dot(cor, vec3(0.299, 0.587, 0.114));
  cor = mix(cor * QUENTE, mix(cor, vec3(cinza), 0.55) * FRIO, uLento);

  // vinheta, com a proporção corrigida para ser redonda
  vec2 p = uv - 0.5;
  p.x *= uTamanho.x / uTamanho.y;
  float borda = smoothstep(0.3, 0.95, length(p));
  cor *= 1.0 - borda * (VINHETA + 0.3 * uLento);

  // grão de película, que muda a cada quadro
  float r = aleatorio(uv * uTamanho + fract(uT * 3.0) * 100.0) - 0.5;
  cor += r * GRAO;

  // saindo do preto
  cor *= 1.0 - uEscuro;

  // as faixas: step dá 1 dentro da faixa e 0 fora
  float faixa = step(uv.y, FAIXA) + step(1.0 - FAIXA, uv.y);
  cor *= 1.0 - faixa;

  gl_FragColor = vec4(cor, 1.0);
}`;

// -----------------------------------------------------------------------
// Texturas desenhadas no próprio código
// -----------------------------------------------------------------------

function criarTexturaPiso() {
  // ladrilho preto e branco, dois por dois, que se repete pelo salão
  const g = createGraphics(128, 128, P2D);
  g.noStroke();
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      g.fill((i + j) % 2 ? color(30, 28, 28) : color(232, 226, 214));
      g.rect(i * 64, j * 64, 64, 64);
    }
  }
  return g;
}

function criarTexturaParede() {
  const g = createGraphics(256, 256, P2D);
  g.noStroke();
  // papel de parede vinho em cima, lambri de madeira embaixo
  g.background(110, 36, 40);
  g.fill(126, 46, 48);
  for (let x = 0; x < 256; x += 32) g.rect(x, 0, 12, 160);
  g.fill(92, 60, 38);
  g.rect(0, 160, 256, 96);
  g.fill(70, 44, 28);
  for (let x = 0; x < 256; x += 64) g.rect(x + 6, 172, 52, 74);
  g.fill(200, 160, 90);
  g.rect(0, 156, 256, 5);
  return g;
}

function criarTexturaCortica() {
  const g = createGraphics(128, 128, P2D);
  g.background(170, 124, 80);
  g.noStroke();
  randomSeed(9);
  for (let i = 0; i < 900; i++) {
    g.fill(random([[140, 98, 60], [196, 150, 104], [120, 84, 52]]));
    g.circle(random(128), random(128), random(1, 3));
  }
  return g;
}

function criarTexturaPorta() {
  const g = createGraphics(120, 220, P2D);
  g.background(80, 52, 34);
  g.noStroke();
  g.fill(60, 38, 24);
  g.rect(8, 8, 50, 204);
  g.rect(62, 8, 50, 204);
  // janelinhas redondas com a luz da cozinha
  g.fill(255, 230, 170);
  g.circle(33, 60, 26);
  g.circle(87, 60, 26);
  return g;
}