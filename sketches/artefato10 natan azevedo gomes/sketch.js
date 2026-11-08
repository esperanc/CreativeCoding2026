// Caixas para gatos
// p5.js 2, modo WEBGL.
//
// Arraste o mouse sobre o chão para desenhar a base de uma caixa de
// papelão e use a roda do mouse para deixá-la mais alta ou mais baixa.
// Ao soltar, a caixa fica pronta e o gato mais perto pula nela. Gatos não
// resistem a uma caixa nova. Depois de uns dois segundos parado, o gato
// deita. A cada cinco caixas desenhadas chega mais um gato.
// Dá para desenhar uma caixa em cima de outra: é só começar o arraste
// sobre a tampa de uma caixa que já existe.
//
// Também dá para trazer objetos de fora: arraste um arquivo .obj ou .stl
// para a janela e ele aparece onde foi solto, como mais um lugar para os
// gatos pularem. Pode ser um modelo baixado da internet ou a própria cena
// salva aqui com S ou O.
//
// A própria caixa de papelão é um modelo importado: um arquivo OBJ escrito
// à mão aqui no código, carregado com loadModel. Cada caixa desenhada é uma
// cópia dele, esticada até o tamanho do arraste.
//
//   setas ← →   giram a câmera em volta da cena
//   setas ↑ ↓   sobem e descem a câmera
//   backspace   remove a última caixa ou objeto
//   R           gira em 90° o último objeto importado (para modelos que
//               chegam deitados, como os do Blender, que usam z para cima)
//   S / O       salvam a cena como STL ou OBJ

const TAMANHO_CHAO = 1400;
// o gato é modelado em unidades pequenas e ampliado na hora de desenhar
const TAMANHO_GATO = 1.9;

let caixas = [];
let moldeCaixa;           // a caixa de 1 x 1 x 1 que vem do arquivo OBJ
let texturaCaixa, texturaChao;
let chao;
let gatos = [];
let caixasDesenhadas = 0;

// a câmera é controlada por nós e não pelo orbitControl, porque o
// arraste do mouse já está sendo usado para desenhar
let anguloCamera = 0.5;
let alturaCamera = 0.75;
let olho, alvoCamera;
const CAMPO_VISAO = Math.PI / 3;

// o desenho em andamento, enquanto o botão do mouse está apertado
let rascunho = null;
let ultimaCaixa = null;
let aviso;

// setup é async porque loadModel é assíncrono, como no slide do bule
async function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  texturaCaixa = criarTexturaCaixa();
  texturaChao = criarTexturaChao();
  chao = fazerChao();

  // A caixa é carregada do texto OBJ que está em CAIXA_OBJ, mais abaixo.
  // Como o endereço de um blob não tem extensão, o fileType é obrigatório.
  // Aqui o normalize fica desligado: a caixa foi escrita com 1 de lado e
  // queremos exatamente esse tamanho, e não a caixa de 200 do normalize.
  const url = URL.createObjectURL(new Blob([CAIXA_OBJ]));
  moldeCaixa = await loadModel(url, { normalize: false, fileType: '.obj' });
  URL.revokeObjectURL(url);
  medir(moldeCaixa);
  // o arquivo tem y para cima; meia volta em x para ficar como o p5 espera
  for (const v of moldeCaixa.vertices) {
    v.y = -v.y;
    v.z = -v.z;
  }
  for (const n of moldeCaixa.vertexNormals) {
    n.y = -n.y;
    n.z = -n.z;
  }

  // o primeiro gato já começa cochilando no chão, esperando uma caixa
  const g = novoGato(0, 200, 0.4, PELAGENS[0]);
  g.deitado = 1;
  g.tempoParado = 3;
  gatos.push(g);

  const ajuda = createDiv(
    'arraste no chão para desenhar uma caixa · roda do mouse muda a altura<br>' +
    'arraste um arquivo .obj ou .stl para a janela para trazer um objeto · R gira o objeto<br>' +
    'setas giram a câmera · backspace desfaz · S salva STL · O salva OBJ'
  );
  ajuda.position(16, 12);
  ajuda.style('color', '#6b5d50');
  ajuda.style('font-family', 'sans-serif');
  ajuda.style('font-size', '13px');
  ajuda.style('line-height', '1.5');
  ajuda.style('pointer-events', 'none');

  aviso = createDiv('');
  aviso.position(16, 76);
  aviso.style('color', '#a0522d');
  aviso.style('font-family', 'sans-serif');
  aviso.style('font-size', '13px');
  aviso.style('pointer-events', 'none');

  // Arrastar um arquivo para dentro da página. Sem o preventDefault o
  // navegador abriria o arquivo em vez de entregá-lo ao sketch.
  window.addEventListener('dragover', e => e.preventDefault());
  window.addEventListener('drop', e => {
    e.preventDefault();
    const arquivo = e.dataTransfer.files[0];
    if (arquivo) importarArquivo(arquivo, e.clientX, e.clientY);
  });
}

function draw() {
  background('#efe6d8');
  const dt = min(deltaTime / 1000, 0.05);

  if (keyIsDown(LEFT_ARROW)) anguloCamera -= 1.2 * dt;
  if (keyIsDown(RIGHT_ARROW)) anguloCamera += 1.2 * dt;
  if (keyIsDown(UP_ARROW)) alturaCamera = min(1.4, alturaCamera + 0.8 * dt);
  if (keyIsDown(DOWN_ARROW)) alturaCamera = max(0.25, alturaCamera - 0.8 * dt);
  posicionarCamera();

  ambientLight(120, 112, 105);
  directionalLight(255, 244, 225, -0.5, 0.9, -0.4);
  directionalLight(60, 70, 95, 0.6, 0.4, 0.7);
  noStroke();

  push();
  texture(texturaChao);
  model(chao);
  pop();

  for (const c of caixas) desenharCaixa(c);
  if (rascunho) desenharRascunho();

  for (const g of gatos) {
    atualizarGato(g, dt);
    desenharSombra(g);
    desenharPose(g);
  }
}

// -----------------------------------------------------------------------
// Câmera e raio do mouse
// -----------------------------------------------------------------------

function posicionarCamera() {
  // numa janela estreita (celular em pé) a câmera se afasta mais
  const distancia = 1150 * max(1, 1.3 / (width / height));
  olho = createVector(
    sin(anguloCamera) * distancia * cos(alturaCamera * 0.9),
    -distancia * sin(alturaCamera * 0.9),
    cos(anguloCamera) * distancia * cos(alturaCamera * 0.9)
  );
  alvoCamera = createVector(0, -60, 0);
  perspective(CAMPO_VISAO, width / height, 10, 10000);
  camera(olho.x, olho.y, olho.z, alvoCamera.x, alvoCamera.y, alvoCamera.z, 0, 1, 0);
}

// Para saber em que ponto do chão o mouse está, lançamos um raio que sai
// do olho da câmera e passa pelo pixel do mouse. Os três vetores abaixo
// são os eixos da câmera: para frente, para a direita da tela e para
// baixo da tela (no p5 o y cresce para baixo).
function raioDoMouse(px = mouseX, py = mouseY) {
  const frente = p5.Vector.sub(alvoCamera, olho).normalize();
  const cima = createVector(0, 1, 0);
  const direita = frente.copy().cross(cima).normalize();
  const baixo = direita.copy().cross(frente).normalize().mult(-1);

  // posição do mouse de -1 a 1 nos dois eixos
  const mx = (px / width) * 2 - 1;
  const my = (py / height) * 2 - 1;
  const t = tan(CAMPO_VISAO / 2);

  const direcao = frente.copy()
    .add(direita.copy().mult(mx * t * (width / height)))
    .add(baixo.copy().mult(-my * t))
    .normalize();
  return { origem: olho.copy(), direcao };
}

// Onde o raio cruza o plano horizontal de altura h (lembrando: y = -h).
function cruzarPlano(raio, h) {
  if (abs(raio.direcao.y) < 1e-6) return null;
  const t = (-h - raio.origem.y) / raio.direcao.y;
  if (t <= 0) return null;
  return p5.Vector.add(raio.origem, raio.direcao.copy().mult(t));
}

// Procura a superfície mais próxima embaixo do mouse: o chão ou a tampa
// de alguma caixa. Devolve o ponto e em que caixa ele está.
function superficieSobMouse(px, py) {
  const raio = raioDoMouse(px, py);
  let melhor = null;
  let menorDistancia = Infinity;

  const testar = (h, caixa) => {
    const p = cruzarPlano(raio, h);
    if (!p) return;
    const dentro = caixa
      ? p.x > caixa.x0 && p.x < caixa.x1 && p.z > caixa.z0 && p.z < caixa.z1
      : abs(p.x) < TAMANHO_CHAO / 2 && abs(p.z) < TAMANHO_CHAO / 2;
    if (!dentro) return;
    const d = p5.Vector.dist(raio.origem, p);
    if (d < menorDistancia) {
      menorDistancia = d;
      melhor = { ponto: p, caixa };
    }
  };

  testar(0, null);
  for (const c of caixas) testar(topo(c), c);
  return melhor;
}

// -----------------------------------------------------------------------
// Desenhar caixas com o mouse
// -----------------------------------------------------------------------

function mousePressed(evento) {
  // clique fora do canvas (na legenda, por exemplo) não começa caixa
  if (evento && evento.target && evento.target.tagName !== 'CANVAS') return;
  const s = superficieSobMouse();
  if (!s) return;
  rascunho = {
    inicio: s.ponto,
    fim: s.ponto.copy(),
    apoio: s.caixa,
    altura: 70
  };
}

function mouseDragged() {
  if (!rascunho) return;
  // durante o arraste o raio é sempre cruzado com o mesmo plano onde
  // o desenho começou, senão a caixa pularia de altura no meio do gesto
  const p = cruzarPlano(raioDoMouse(), alturaApoio(rascunho.apoio));
  if (p) rascunho.fim = p;
}

function mouseReleased() {
  if (!rascunho) return;
  const r = rascunho;
  rascunho = null;
  const largura = abs(r.fim.x - r.inicio.x);
  const profundidade = abs(r.fim.z - r.inicio.z);
  // um clique sem arraste não vira caixa
  if (largura < 10 || profundidade < 10) return;

  const c = {
    x0: min(r.inicio.x, r.fim.x), x1: max(r.inicio.x, r.fim.x),
    z0: min(r.inicio.z, r.fim.z), z1: max(r.inicio.z, r.fim.z),
    apoio: r.apoio,
    altura: r.altura,
    malha: null
  };
  c.malha = fazerCaixa(c.x1 - c.x0, c.altura, c.z1 - c.z0);
  caixas.push(c);
  ultimaCaixa = c;
  caixaNova(c);
}

// A roda do mouse ajusta a altura da caixa sendo desenhada ou, se não
// houver nenhuma, a da última que foi feita.
function mouseWheel(evento) {
  const mudanca = -evento.delta * 0.25;
  if (rascunho) {
    rascunho.altura = constrain(rascunho.altura + mudanca, 10, 600);
  } else if (ultimaCaixa && ultimaCaixa.tipo !== 'importado') {
    const c = ultimaCaixa;
    c.altura = constrain(c.altura + mudanca, 10, 600);
    // A malha tem a altura gravada nos vértices, então precisa ser feita
    // de novo. A antiga deixa de ser usada e liberamos a memória de vídeo
    // dela com freeGeometry, senão cada giro da roda deixaria uma malha
    // esquecida na placa de vídeo.
    freeGeometry(c.malha);
    c.malha = fazerCaixa(c.x1 - c.x0, c.altura, c.z1 - c.z0);
  }
  return false;
}

// altura da tampa de uma caixa, somando as caixas que estão embaixo dela
function topo(c) {
  return alturaApoio(c.apoio) + c.altura;
}

function alturaApoio(apoio) {
  return apoio ? topo(apoio) : 0;
}

function desenharCaixa(c) {
  push();
  translate((c.x0 + c.x1) / 2, -alturaApoio(c.apoio), (c.z0 + c.z1) / 2);
  if (c.tipo === 'importado') {
    // o arquivo não traz cor nem material: o fill é nosso
    fill(c.cor);
    specularMaterial(50);
    shininess(20);
  } else {
    texture(texturaCaixa);
  }
  model(c.malha);
  pop();
}

// Enquanto o mouse arrasta, a caixa aparece só como um contorno de arame.
// Ela ainda não existe como malha: só vira p5.Geometry quando o botão é solto.
function desenharRascunho() {
  const r = rascunho;
  const h0 = alturaApoio(r.apoio);
  push();
  translate((r.inicio.x + r.fim.x) / 2, -h0 - r.altura / 2, (r.inicio.z + r.fim.z) / 2);
  noFill();
  stroke('#a0522d');
  strokeWeight(2);
  box(abs(r.fim.x - r.inicio.x), r.altura, abs(r.fim.z - r.inicio.z));
  pop();
}

function keyPressed() {
  if (keyCode === BACKSPACE && caixas.length > 0) {
    const c = caixas.pop();
    freeGeometry(c.malha);
    ultimaCaixa = caixas[caixas.length - 1] || null;
    // quem estava nela, ou indo para ela, procura outro lugar
    for (const g of gatos) {
      if (g.proximo === c) g.proximo = null;
      const indo = g.pulo && g.pulo.destino === c && g.estado !== 'parado';
      if (indo) {
        g.pulo.destino = ultimaCaixa;
        g.pulo.para = lugarNaCaixa(ultimaCaixa, g);
      } else if (g.apoio === c) {
        g.apoio = null;
        g.deitado = 0;
        g.estado = 'parado';
        chamarGato(g, ultimaCaixa);
      }
    }
    return false;
  }
  if ((key === 'r' || key === 'R')) girarImportado();
  if (key === 's' || key === 'S') salvar('stl');
  if (key === 'o' || key === 'O') salvar('obj');
}

// -----------------------------------------------------------------------
// As malhas feitas à mão
// -----------------------------------------------------------------------

// Acrescenta um quadrilátero (dois triângulos) a uma malha.
// Cada face tem os seus próprios quatro vértices, sem dividir com as
// vizinhas, para as quinas da caixa ficarem vivas.
// A ordem dos índices decide para que lado a face olha. Em vez de confiar
// na ordem em que os cantos foram passados, a função confere: calcula a
// normal com o produto vetorial e compara com a direção que vai do centro
// do objeto até a face. Se estiverem opostas, inverte a ordem.
function quadrilatero(g, a, b, c, d, centro, uvs) {
  const i = g.vertices.length;
  g.vertices.push(a.copy(), b.copy(), c.copy(), d.copy());
  for (const [u, v] of uvs) g.uvs.push(u, v);

  const n = p5.Vector.sub(b, a).cross(p5.Vector.sub(c, a)).normalize();
  const meio = p5.Vector.add(a, c).mult(0.5);
  if (n.dot(p5.Vector.sub(meio, centro)) < 0) {
    n.mult(-1);
    g.faces.push([i, i + 2, i + 1], [i, i + 3, i + 2]);
  } else {
    g.faces.push([i, i + 1, i + 2], [i, i + 2, i + 3]);
  }
  for (let k = 0; k < 4; k++) g.vertexNormals.push(n.copy());
}

// A caixa de papelão em formato OBJ, escrita à mão. É texto puro, uma
// instrução por linha, exatamente o que estaria num arquivo .obj:
//
//   v  x y z     um vértice (canto)
//   vt u v       uma coordenada de textura, de 0 a 1, com v = 0 embaixo
//                da imagem (o p5 desvira na leitura)
//   vn x y z     uma normal, a direção para fora
//   f  a/b/c     uma face; cada canto diz qual v, qual vt e qual vn usa,
//                contando a partir de 1
//
// Os 8 cantos são compartilhados pelas 6 faces, mas cada face usa a sua
// própria normal. Como o p5 cria um vértice para cada combinação v/vt/vn
// diferente, cada face acaba com os seus quatro vértices e as quinas
// ficam vivas.
// A textura é um "atlas": a metade esquerda da imagem é a tampa, com a fita
// adesiva, e a metade direita é a lateral, com o carimbo. Os vt de cada
// face escolhem de qual metade ela tira a pintura.
// Os cantos de cada face estão em sentido anti-horário vistos de fora.
// O arquivo segue a convenção dos programas 3D: y para cima, fundo em y = 0.
// Um detalhe: com o y para cima, o que é esquerda num programa 3D vira
// direita no p5, que desenha com o y para baixo. Se a textura da lateral
// fosse escrita do jeito "natural", o carimbo apareceria espelhado na
// tela; por isso os vt da lateral vão de 1 para 0.5.
const CAIXA_OBJ = `
# caixa de papelão, 1 x 1 x 1
# cantos de baixo
v -0.5 0 -0.5
v  0.5 0 -0.5
v  0.5 0  0.5
v -0.5 0  0.5
# cantos de cima
v -0.5 1 -0.5
v  0.5 1 -0.5
v  0.5 1  0.5
v -0.5 1  0.5
# textura da tampa (metade esquerda da imagem)
vt 0   0
vt 0.5 0
vt 0.5 1
vt 0   1
# textura da lateral (metade direita da imagem, lida da direita para a
# esquerda, veja a explicação acima)
vt 1   0
vt 0.5 0
vt 0.5 1
vt 1   1
# normais: cima, baixo, frente, direita, trás, esquerda
vn  0  1  0
vn  0 -1  0
vn  0  0  1
vn  1  0  0
vn  0  0 -1
vn -1  0  0
# tampa e fundo
f 8/4/1 7/3/1 6/2/1 5/1/1
f 1/1/2 2/2/2 3/3/2 4/4/2
# laterais: embaixo à esquerda, embaixo à direita, em cima à direita,
# em cima à esquerda, sempre vistas de fora
f 4/5/3 3/6/3 7/7/3 8/8/3
f 3/5/4 2/6/4 6/7/4 7/8/4
f 2/5/5 1/6/5 5/7/5 6/8/5
f 1/5/6 4/6/6 8/7/6 5/8/6
`;

// Uma caixa do tamanho pedido é uma cópia do molde importado, com cada
// vértice multiplicado pelas medidas. O modelo que veio do arquivo vira
// matéria-prima, como no slide que mexe nos vértices do bule.
// As faces e as coordenadas de textura são copiadas como estão, e as
// normais também: esticar uma caixa não muda para onde as faces olham.
function fazerCaixa(largura, altura, profundidade) {
  const g = new p5.Geometry();
  for (const v of moldeCaixa.vertices) {
    g.vertices.push(createVector(v.x * largura, v.y * altura, v.z * profundidade));
  }
  for (const n of moldeCaixa.vertexNormals) g.vertexNormals.push(n.copy());
  // o leitor de OBJ guarda as uv como pares [u, v]; flat() deixa a lista
  // no formato simples, dois números seguidos por vértice
  g.uvs = moldeCaixa.uvs.flat();
  for (const f of moldeCaixa.faces) g.faces.push([...f]);
  return g;
}

// O chão é um só quadrado grande, com a textura de taco de madeira.
function fazerChao() {
  const g = new p5.Geometry();
  const s = TAMANHO_CHAO / 2;
  quadrilatero(g,
    createVector(-s, 0, -s), createVector(s, 0, -s),
    createVector(s, 0, s), createVector(-s, 0, s),
    createVector(0, 1, 0),
    [[0, 0], [1, 0], [1, 1], [0, 1]]);
  return g;
}

// -----------------------------------------------------------------------
// Os gatos
//
// Cada gato é montado em partes que se mexem umas em relação às outras:
// o tronco, a cabeça, os olhos, as patas (cada uma com coxa, canela e pé)
// e os gomos do rabo. É a hierarquia de transformações da aula passada,
// agora aplicada a malhas próprias.
//
// O tronco é uma malha feita à mão, anel por anel, como o sólido de
// revolução do slide, só que com anéis ovais de tamanhos diferentes ao
// longo da coluna. As outras partes são montadas com buildGeometry,
// juntando primitivas.
//
// O gato olha para +z, tem os pés em y = 0 e mede uns 60 de comprimento.
// -----------------------------------------------------------------------

// As pelagens. 'pelo' recebe a posição de um ponto no corpo do gato e a
// parte a que ele pertence, e devolve a cor do pelo ali (ou null para
// deixar a cor de base).
const PELAGENS = [
  {
    nome: 'laranja',
    base: [226, 146, 76], escuro: [176, 92, 40], claro: [248, 234, 214],
    iris: [205, 165, 40], pele: [222, 128, 128], testa: true,
    pelo: (q, parte) => listras(q, parte) ? [176, 92, 40] : null,
    rabo: i => (i % 2 ? [176, 92, 40] : [226, 146, 76])
  },
  {
    nome: 'cinza',
    base: [142, 144, 150], escuro: [80, 82, 88], claro: [236, 233, 228],
    iris: [130, 178, 80], pele: [205, 140, 150], testa: true,
    pelo: (q, parte) => listras(q, parte) ? [80, 82, 88] : null,
    rabo: i => (i % 2 ? [80, 82, 88] : [142, 144, 150])
  },
  {
    nome: 'frajola',
    base: [40, 37, 36], escuro: [40, 37, 36], claro: [245, 241, 234],
    iris: [222, 184, 62], pele: [70, 55, 55],
    pelo: () => null,
    // a ponta do rabo é branca
    rabo: i => (i >= 11 ? [245, 241, 234] : [40, 37, 36])
  },
  {
    nome: 'siamês',
    base: [238, 226, 204], escuro: [92, 64, 50], claro: [246, 240, 230],
    iris: [90, 150, 225], pele: [92, 64, 50], pontas: true,
    // as "pontas" escuras: rosto e patas
    pelo: (q, parte) => {
      let k = 0;
      if (parte === 'cabeca') k = constrain((q.z - 37) / 5, 0, 1);
      if (parte === 'canela') k = 1;
      if (parte === 'coxa') k = constrain((q.y + 22) / 8, 0, 1);
      return k > 0 ? misturar([238, 226, 204], [92, 64, 50], k) : null;
    },
    rabo: () => [92, 64, 50]
  },
  {
    nome: 'tricolor',
    base: [246, 241, 233], escuro: [40, 36, 34], claro: [246, 241, 233],
    iris: [195, 175, 60], pele: [225, 150, 150],
    // manchas laranja e pretas espalhadas com noise
    pelo: q => {
      const n = noise(q.x * 0.06 + 40, q.y * 0.06, q.z * 0.06);
      if (n > 0.57) return [214, 128, 62];
      if (n < 0.41) return [40, 36, 34];
      return null;
    },
    rabo: i => (noise(i * 0.4 + 7) > 0.5 ? [214, 128, 62] : [40, 36, 34])
  }
];

// listras de gato malhado: faixas atravessadas nas costas e anéis nas patas
function listras(q, parte) {
  if (parte === 'coxa' || parte === 'canela') return sin(q.y * 0.8) > 0.6;
  return sin(q.z * 0.62 + sin(q.x * 0.3) * 0.7) > 0.5;
}

function misturar(a, b, k) {
  return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
}

// onde cada parte se prende no corpo
const PESCOCO = [0, -40, 27];
const OMBROS = [[-5.5, -30, 16], [5.5, -30, 16]];
const QUADRIS = [[-6, -30, -14], [6, -30, -14]];
const RAIZ_RABO = [0, -33, -24];
const GOMOS_RABO = 13;
// comprimentos dos ossos das patas
const COXA_FRENTE = 13, CANELA_FRENTE = 13.5;
const COXA_TRAS = 12, CANELA_TRAS = 16;

// O perfil do tronco: em cada ponto t da coluna (0 é o traseiro, 1 é o
// pescoço), a meia largura, a meia altura e a altura do centro do anel.
// Daqui sai o formato do gato: quadril, cintura mais fina, peito mais
// fundo e o pescoço subindo para a cabeça.
const PERFIL = [
  [0.00, 5.0, 5.5, -32],
  [0.12, 9.0, 10.0, -32.5],
  [0.30, 9.5, 10.5, -32],
  [0.50, 8.2, 9.4, -32.5],
  [0.72, 9.6, 11.5, -31.5],
  [0.88, 7.8, 9.0, -35],
  [1.00, 5.5, 6.0, -41]
];

function perfilEm(t) {
  for (let k = 0; k < PERFIL.length - 1; k++) {
    const a = PERFIL[k], b = PERFIL[k + 1];
    if (t <= b[0]) {
      const s = suave((t - a[0]) / (b[0] - a[0]));
      return { rx: lerp(a[1], b[1], s), ry: lerp(a[2], b[2], s), cy: lerp(a[3], b[3], s) };
    }
  }
  const u = PERFIL[PERFIL.length - 1];
  return { rx: u[1], ry: u[2], cy: u[3] };
}

// O tronco como p5.Geometry. São 'nz' anéis de 'nu' vértices cada.
// Diferente da grade do slide, aqui a volta não repete o primeiro vértice:
// o último ponto do anel se liga de novo ao primeiro pelo índice
// (i + 1) % nu, então não existe emenda nenhuma.
function fazerTronco(P) {
  const g = new p5.Geometry();
  const nz = 40, nu = 28;
  const z0 = -25, z1 = 29;
  const ponto = (j, i) => {
    const t = j / (nz - 1);
    const p = perfilEm(t);
    const a = TWO_PI * i / nu;
    return createVector(p.rx * cos(a), p.cy + p.ry * sin(a), lerp(z0, z1, t));
  };

  for (let j = 0; j < nz; j++) {
    const t = j / (nz - 1);
    const p = perfilEm(t);
    for (let i = 0; i < nu; i++) {
      const a = TWO_PI * i / nu;
      const v = ponto(j, i);
      g.vertices.push(v);

      // A normal é calculada na mão: o produto vetorial de duas direções
      // que andam sobre a superfície, uma em volta do anel e outra ao
      // longo da coluna. O resultado é perpendicular às duas, ou seja, à
      // superfície. Se ele apontar para dentro, invertemos.
      const emVolta = createVector(-p.rx * sin(a), p.ry * cos(a), 0);
      const aoLongo = p5.Vector.sub(ponto(min(j + 1, nz - 1), i), ponto(max(j - 1, 0), i));
      const n = aoLongo.cross(emVolta).normalize();
      const paraFora = createVector(v.x, v.y - p.cy, 0);
      if (n.dot(paraFora) < 0) n.mult(-1);
      g.vertexNormals.push(n);

      // a cor: barriga clara embaixo, peitinho claro na frente, e a
      // estampa da pelagem no resto
      const baixo = sin(a);
      let cor = P.base;
      const padrao = P.pelo(v, 'tronco');
      if (padrao) cor = padrao;
      let claro = constrain((baixo - 0.35) / 0.3, 0, 1);
      if (t > 0.74) claro = max(claro, constrain((baixo + 0.1) / 0.3, 0, 1) * constrain((t - 0.74) / 0.06, 0, 1));
      cor = misturar(cor, P.claro, claro);
      g.vertexColors.push(cor[0] / 255, cor[1] / 255, cor[2] / 255, 1);
    }
  }

  // Faces: cada quadradinho entre dois anéis vira dois triângulos.
  // A ordem dos índices é conferida contra a normal, para a face olhar
  // para fora.
  for (let j = 0; j < nz - 1; j++) {
    for (let i = 0; i < nu; i++) {
      const k = j * nu + i;
      const k1 = j * nu + (i + 1) % nu;
      const d = k + nu;
      const d1 = k1 + nu;
      if (olhaParaFora(g, k, k1, d)) g.faces.push([k, k1, d], [k1, d1, d]);
      else g.faces.push([k, d, k1], [k1, d, d1]);
    }
  }

  // tampas nas duas pontas: um vértice no meio ligado ao anel inteiro
  for (const [j, dz] of [[0, -3], [nz - 1, 2]]) {
    const p = perfilEm(j / (nz - 1));
    const c = g.vertices.length;
    g.vertices.push(createVector(0, p.cy, lerp(z0, z1, j / (nz - 1)) + dz));
    g.vertexNormals.push(createVector(0, 0, Math.sign(dz)));
    const cor = j === 0 ? (P.rabo(0)) : P.claro;
    g.vertexColors.push(cor[0] / 255, cor[1] / 255, cor[2] / 255, 1);
    for (let i = 0; i < nu; i++) {
      const a = j * nu + i;
      const b = j * nu + (i + 1) % nu;
      if (olhaParaFora(g, c, a, b)) g.faces.push([c, a, b]);
      else g.faces.push([c, b, a]);
    }
  }
  return g;
}

// confere se o triângulo (a, b, c) olha para o mesmo lado que a normal
// guardada no vértice a
function olhaParaFora(g, a, b, c) {
  const va = g.vertices[a], vb = g.vertices[b], vc = g.vertices[c];
  const n = p5.Vector.sub(vb, va).cross(p5.Vector.sub(vc, va));
  return n.dot(g.vertexNormals[a]) > 0;
}

// Depois que uma parte é montada com buildGeometry, as cores dos vértices
// ficam numa lista comum, quatro números de 0 a 1 por vértice. Aqui ela é
// percorrida para pintar a estampa do pelo, do mesmo jeito que o slide
// percorre os vértices do bule para deformá-lo. Só os vértices pintados
// com a cor de base mudam; olhos, nariz e partes claras ficam como estão.
// 'origem' é onde a parte fica no corpo, para a estampa continuar certinha
// de uma parte para a outra.
function pintarPelo(malha, P, parte, origem) {
  const base = P.base.map(v => v / 255);
  const cores = malha.vertexColors;
  for (let i = 0; i < malha.vertices.length; i++) {
    const k = i * 4;
    const igualBase =
      abs(cores[k] - base[0]) < 0.01 &&
      abs(cores[k + 1] - base[1]) < 0.01 &&
      abs(cores[k + 2] - base[2]) < 0.01;
    if (!igualBase) continue;
    const c = P.pelo(p5.Vector.add(malha.vertices[i], origem), parte);
    if (c) {
      cores[k] = c[0] / 255;
      cores[k + 1] = c[1] / 255;
      cores[k + 2] = c[2] / 255;
    }
  }
  return malha;
}

function fazerModelosGato(P) {
  const m = {};
  m.tronco = fazerTronco(P);
  const corPonta = P.pontas ? P.escuro : P.claro;

  // A cabeça. O centro do crânio fica um pouco à frente e acima do pescoço.
  m.cabeca = pintarPelo(buildGeometry(() => {
    noStroke();
    fill(P.base);
    push(); translate(0, -5, 6); ellipsoid(11, 9.8, 10.2, 24, 18); pop();   // crânio
    for (const lado of [-1, 1]) {
      push(); translate(lado * 5.5, -1.5, 10); ellipsoid(5.6, 4.8, 5, 14, 10); pop(); // bochechas
    }
    // Orelhas. O cone do p5 nasce com a ponta para +y, que na tela é para
    // baixo; o rotateX(PI) desvira, e o rotateZ abre as orelhas para fora.
    for (const lado of [-1, 1]) {
      fill(P.pontas ? P.escuro : P.base);
      push();
      translate(lado * 6.2, -14.2, 4.5);
      rotateZ(lado * 0.38);
      rotateX(PI + 0.12);
      cone(4.6, 10, 12, 1);
      pop();
      fill(P.pele);
      push();
      translate(lado * 6.1, -13.6, 5.9);
      rotateZ(lado * 0.38);
      rotateX(PI + 0.12);
      cone(2.8, 7.5, 10, 1);
      pop();
    }
    // focinho: as duas almofadinhas dos bigodes e o queixo
    fill(corPonta);
    for (const lado of [-1, 1]) {
      push(); translate(lado * 2.3, -0.8, 14.6); ellipsoid(3.1, 2.5, 2.4, 12, 8); pop();
    }
    push(); translate(0, 1.6, 13.4); ellipsoid(3, 1.9, 2.6, 10, 6); pop();
    fill(P.pele);
    push(); translate(0, -2.9, 16.2); ellipsoid(1.7, 1.1, 1, 8, 6); pop();     // nariz
    // listras da testa, o "M" dos gatos malhados
    if (P.testa) {
      fill(P.escuro);
      for (const [x, ang] of [[-3.4, -0.25], [0, 0], [3.4, 0.25]]) {
        push();
        translate(0, -5, 6);
        rotateY(ang);
        rotateX(-0.62);
        translate(x * 0.7, 0, 10.2);
        ellipsoid(0.8, 3.6, 0.6, 6, 6);
        pop();
      }
    }
    // bigodes: cilindros bem finos, abertos em leque
    fill(225, 220, 210);
    for (const lado of [-1, 1]) {
      for (let k = 0; k < 3; k++) {
        push();
        translate(lado * 4, -0.6 + k * 1, 15.2);
        rotateY(lado * -0.3);
        rotateZ(lado * (HALF_PI + (k - 1) * 0.16));
        translate(0, -6.5, 0);
        cylinder(0.16, 13, 4, 1);
        pop();
      }
    }
  }), P, 'cabeca', createVector(...PESCOCO));

  // Os olhos são separados da cabeça para poderem piscar: a malha é
  // achatada no eixo y com scale, e o olho fecha.
  m.olhos = buildGeometry(() => {
    noStroke();
    for (const lado of [-1, 1]) {
      fill(P.iris);
      push(); translate(lado * 4.3, -6.2, 14.1); ellipsoid(2.3, 2.6, 1.4, 12, 8); pop();
      fill(15);
      push(); translate(lado * 4.3, -6.2, 14.9); ellipsoid(0.7, 2.1, 0.9, 8, 6); pop();
      fill(255);
      push(); translate(lado * 4.3 + 0.7, -7.2, 15.6); sphere(0.5, 6, 4); pop();
    }
  });

  // Patas. Cada uma tem três peças presas em sequência: a coxa gira no
  // ombro (ou no quadril), a canela gira no joelho, e o pé gira no
  // tornozelo. Todas são feitas apontando para +y (para baixo), com o
  // ponto de giro na origem.
  m.coxaFrente = pintarPelo(buildGeometry(() => {
    noStroke();
    fill(P.base);
    push(); translate(0, 3.5, 0); ellipsoid(4.4, 7, 5, 12, 10); pop();
    push(); translate(0, COXA_FRENTE / 2 + 2, 0); cylinder(3, COXA_FRENTE - 3, 12, 6); pop();
    push(); translate(0, COXA_FRENTE, 0); sphere(3, 10, 8); pop();
  }), P, 'coxa', createVector(...OMBROS[0]));

  m.canelaFrente = pintarPelo(buildGeometry(() => {
    noStroke();
    fill(P.base);
    push(); translate(0, CANELA_FRENTE / 2, 0); cylinder(2.6, CANELA_FRENTE, 12, 6); pop();
  }), P, 'canela', createVector(OMBROS[0][0], OMBROS[0][1] + COXA_FRENTE, OMBROS[0][2]));

  m.coxaTras = pintarPelo(buildGeometry(() => {
    noStroke();
    fill(P.base);
    push(); translate(0, 4, 0); ellipsoid(5.8, 9, 7, 14, 10); pop();          // a coxa grossa
    push(); translate(0, COXA_TRAS / 2 + 2, 0); cylinder(3.2, COXA_TRAS - 3, 12, 6); pop();
    push(); translate(0, COXA_TRAS, 0); sphere(3.1, 10, 8); pop();
  }), P, 'coxa', createVector(...QUADRIS[0]));

  m.canelaTras = pintarPelo(buildGeometry(() => {
    noStroke();
    fill(P.base);
    push(); translate(0, CANELA_TRAS / 2, 0); cylinder(2.6, CANELA_TRAS, 12, 6); pop();
  }), P, 'canela', createVector(QUADRIS[0][0], QUADRIS[0][1] + COXA_TRAS, QUADRIS[0][2]));

  // o pé, com três dedinhos na frente
  m.pe = buildGeometry(() => {
    noStroke();
    fill(corPonta);
    push(); translate(0, 1.6, 1.4); ellipsoid(3.2, 2, 4.2, 12, 8); pop();
    for (let k = -1; k <= 1; k++) {
      push(); translate(k * 1.7, 2.2, 5 - abs(k) * 0.5); sphere(1.3, 8, 6); pop();
    }
  });

  // Um gomo do rabo por cor, todos com o mesmo formato: uma esfera com um
  // cilindro saindo para trás, ao longo de -z.
  m.gomos = [];
  for (let i = 0; i < GOMOS_RABO; i++) {
    const cor = P.rabo(i);
    m.gomos.push(buildGeometry(() => {
      noStroke();
      fill(cor);
      sphere(2.5, 12, 8);
      push();
      translate(0, 0, -2);
      rotateX(HALF_PI);
      cylinder(2.5, 4, 12, 1);
      pop();
    }));
  }
  return m;
}

// -----------------------------------------------------------------------
// Poses
//
// Uma pose é um conjunto de números: quanto o corpo desce, quanto ele
// inclina para a frente ou para trás, o ângulo de cada articulação das
// patas, da cabeça e do rabo. As animações são feitas misturando duas
// poses com lerp, aos poucos. O pulo inteiro é uma sequência de poses:
// em pé, agachado, esticado no ar, chegando, agachado de novo, em pé.
// -----------------------------------------------------------------------

const POSES = {
  emPe: {
    desce: 0, inclina: 0,
    coxaF: 0, canelaF: 0, coxaT: 0.35, canelaT: -0.7,
    cabeca: 0, rabo0: -1.15, rabo: -0.05, enrola: 0
  },
  // deitado "de pãozinho" (loaf): as patas da frente dobradas embaixo do
  // peito, com o braço indo para trás e o antebraço voltando para a frente
  // rente ao chão, as de trás dobradas embaixo do corpo e o rabo enrolado
  // do lado
  deitado: {
    desce: 19, inclina: 0.03,
    coxaF: -0.9, canelaF: 2.47, coxaT: 1.3, canelaT: -2.6,
    cabeca: 0.25, rabo0: 0.9, rabo: -0.2, enrola: 0.27
  },
  // antes de pular: baixo, com as patas dobradas e o rabo baixo
  agachado: {
    desce: 8, inclina: -0.05,
    coxaF: 0.65, canelaF: -1.25, coxaT: 0.95, canelaT: -1.8,
    cabeca: 0.12, rabo0: -0.35, rabo: 0.02, enrola: 0
  },
  // logo depois do impulso: a frente sobe, as patas da frente vão para a
  // frente e as de trás ficam esticadas para trás
  esticado: {
    desce: 0, inclina: 0.32,
    coxaF: 1.25, canelaF: 0.35, coxaT: -1.0, canelaT: -0.25,
    cabeca: -0.2, rabo0: -0.2, rabo: 0.03, enrola: 0
  },
  // chegando: a frente desce, as patas da frente procuram a caixa e as de
  // trás se recolhem para baixo do corpo
  chegando: {
    desce: 0, inclina: -0.3,
    coxaF: 0.3, canelaF: 0.05, coxaT: 1.05, canelaT: -2.0,
    cabeca: 0.12, rabo0: -0.65, rabo: -0.02, enrola: 0
  }
};

function misturarPoses(a, b, k) {
  const r = {};
  for (const chave in a) r[chave] = lerp(a[chave], b[chave], k);
  return r;
}

// suaviza o começo e o fim de um movimento que vai de 0 a 1
function suave(t) {
  t = constrain(t, 0, 1);
  return t * t * (3 - 2 * t);
}

// tempos do pulo, em segundos: diminua para um gato mais ligeiro
const TEMPO_AGACHAR = 0.25;
const TEMPO_POUSAR = 0.2;

// Escolhe a pose do gato de acordo com o que ele está fazendo.
function poseAtual(g) {
  const parado = misturarPoses(POSES.emPe, POSES.deitado, suave(g.deitado));
  let pose = parado;
  let rebola = 0;

  if (g.estado === 'agachando') {
    const k = suave(g.tempo / (TEMPO_AGACHAR * 0.6));
    pose = misturarPoses(parado, POSES.agachado, k);
    // a rebolada do traseiro antes do bote
    rebola = sin(g.tempo * 45) * 0.07 * k;
  } else if (g.estado === 'voando') {
    const s = constrain(g.tempo / g.pulo.duracao, 0, 1);
    if (s < 0.15) {
      // o impulso: sai do agachado e estica de uma vez
      pose = misturarPoses(POSES.agachado, POSES.esticado, suave(s / 0.15));
    } else {
      // no ar: do esticado para a posição de chegada
      pose = misturarPoses(POSES.esticado, POSES.chegando, suave((s - 0.15) / 0.85));
    }
  } else if (g.estado === 'pousando') {
    const k = g.tempo / TEMPO_POUSAR;
    // primeiro amortece, agachando, depois levanta
    if (k < 0.4) pose = misturarPoses(POSES.chegando, POSES.agachado, suave(k / 0.4));
    else pose = misturarPoses(POSES.agachado, POSES.emPe, suave((k - 0.4) / 0.6));
  }
  pose.rebola = rebola;
  return pose;
}

// Desenha um gato na pose atual. A mesma função serve para a tela e para
// a exportação, por isso ela só usa transformações e model().
function desenharPose(g) {
  const m = g.modelos;
  const p = poseAtual(g);
  const t = millis() / 1000;
  const sono = suave(g.deitado);

  push();
  translate(g.x, -g.h, g.z);
  rotateY(g.angulo);
  scale(TAMANHO_GATO);

  // O corpo desce e inclina em torno do centro do tronco. Tudo o que
  // vem depois (patas, cabeça, rabo) está preso nele e acompanha.
  translate(0, p.desce, 0);
  translate(0, -31, 0);
  rotateX(p.inclina);
  rotateZ(p.rebola);
  translate(0, 31, 0);

  // a respiração é um scale bem pequeno no tronco, mais lenta com sono
  const ritmo = lerp(3, 1.6, sono);
  push();
  translate(0, -31, 0);
  scale(1 + 0.012 * sin(t * ritmo), 1 + 0.02 * sin(t * ritmo), 1);
  translate(0, 31, 0);
  model(m.tronco);
  pop();

  for (const ombro of OMBROS) {
    desenharPata(ombro, p.coxaF, p.canelaF, p.inclina, m.coxaFrente, m.canelaFrente, COXA_FRENTE, CANELA_FRENTE, m.pe);
  }
  for (const quadril of QUADRIS) {
    desenharPata(quadril, p.coxaT, p.canelaT, p.inclina, m.coxaTras, m.canelaTras, COXA_TRAS, CANELA_TRAS, m.pe);
  }

  // Cabeça: vira para os lados (olhar), abaixa conforme a pose, tomba de
  // leve quando o gato está com sono. Os olhos vão junto, porque estão
  // dentro do mesmo push.
  push();
  translate(...PESCOCO);
  rotateY(g.olhar * (1 - 0.6 * sono));
  rotateX(p.cabeca);
  rotateZ(0.12 * sono);
  model(m.cabeca);
  const piscando = g.proximaPiscada < 0 ? 0.1 : 1;
  const abertura = min(piscando, lerp(1, 0.15, sono));
  translate(0, -6.2, 0);
  scale(1, abertura, 1);
  translate(0, 6.2, 0);
  model(m.olhos);
  pop();

  // Rabo: uma corrente de gomos, cada um preso na ponta do anterior.
  // Cada rotateX e rotateY se soma a todos os anteriores, por isso um
  // ângulo pequeno em cada gomo vira uma curva no rabo inteiro.
  push();
  translate(...RAIZ_RABO);
  for (let i = 0; i < GOMOS_RABO; i++) {
    const onda = sin(t * 2.2 - i * 0.45) * 0.06 * (1 - sono);
    let rx = (i === 0 ? p.rabo0 : p.rabo) + onda;
    // a pontinha mexe sozinha, mesmo com o gato deitado
    if (i >= GOMOS_RABO - 3) rx += sin(t * 3.1 + i) * 0.12;
    rotateX(rx);
    rotateY(i === 0 ? 0 : p.enrola + sin(t * 1.3 - i * 0.4) * 0.05);
    const k = 1 - i * 0.04;
    push();
    scale(k);
    model(m.gomos[i]);
    pop();
    translate(0, 0, -4 * k);
  }
  pop();

  pop();
}

// Uma pata: coxa, canela e pé, cada um girando na ponta do anterior.
// O pé recebe o ângulo contrário da soma dos anteriores (e da inclinação
// do corpo) para ficar sempre reto, apoiado no chão.
function desenharPata(raiz, a1, a2, inclina, coxa, canela, compCoxa, compCanela, pe) {
  push();
  translate(...raiz);
  rotateX(a1);
  model(coxa);
  translate(0, compCoxa, 0);
  rotateX(a2);
  model(canela);
  translate(0, compCanela, 0);
  rotateX(-(a1 + a2 + inclina));
  model(pe);
  pop();
}

function novoGato(x, z, angulo, P) {
  const modelos = fazerModelosGato(P);
  return {
    x, z, h: 0,
    angulo,
    pelagem: P,
    modelos,
    apoio: null,         // a caixa em que ele está (null é o chão)
    estado: 'parado',
    tempo: 0,
    tempoParado: 0,
    pulo: null,
    proximo: null,       // caixa que apareceu enquanto ele estava ocupado
    deitado: 0,          // de 0 (em pé) a 1 (deitado), muda aos poucos
    olhar: 0,            // quanto a cabeça está virada para os lados
    proximaPiscada: random(2, 5),
    paciencia: random(9, 16)  // quanto tempo ele aguenta antes de ir explorar
  };
}

// Acha um lugar livre na tampa da caixa: sorteia alguns pontos e fica com
// o mais longe dos outros gatos, para eles não deitarem um em cima do outro.
function lugarNaCaixa(caixa, quem) {
  let melhor = null;
  let maiorFolga = -1;
  for (let k = 0; k < 12; k++) {
    let p;
    if (caixa) {
      const mx = (caixa.x1 - caixa.x0) * 0.25;
      const mz = (caixa.z1 - caixa.z0) * 0.25;
      p = createVector(random(caixa.x0 + mx, caixa.x1 - mx), 0, random(caixa.z0 + mz, caixa.z1 - mz));
    } else {
      p = createVector(random(-450, 450), 0, random(-450, 450));
    }
    let folga = Infinity;
    for (const g of gatos) {
      if (g === quem) continue;
      const alvo = g.pulo && g.estado !== 'parado' ? g.pulo.para : createVector(g.x, 0, g.z);
      // comparação direta em vez de min(): o min() do p5 reclama do
      // Infinity com que a folga começa
      const d = dist(p.x, p.z, alvo.x, alvo.z);
      if (d < folga) folga = d;
    }
    if (folga > maiorFolga) {
      maiorFolga = folga;
      melhor = p;
    }
  }
  return melhor;
}

// Manda um gato pular para uma caixa (ou para o chão, se caixa for null).
// Se ele estiver no meio de outro pulo, a caixa fica guardada para depois.
function chamarGato(g, caixa) {
  if (g.estado === 'agachando' || g.estado === 'voando' || g.estado === 'pousando') {
    g.proximo = caixa;
    return;
  }
  const destino = lugarNaCaixa(caixa, g);
  g.pulo = {
    de: createVector(g.x, 0, g.z),
    para: destino,
    h0: g.h,
    destino: caixa
  };
  g.anguloAlvo = atan2(destino.x - g.x, destino.z - g.z);
  // deitado, ele primeiro precisa se levantar
  g.estado = g.deitado > 0.05 ? 'levantando' : 'agachando';
  g.tempo = 0;
}

// Quando aparece uma caixa nova, quem vai é o gato mais perto dela.
function gatoMaisPerto(caixa) {
  const cx = (caixa.x0 + caixa.x1) / 2;
  const cz = (caixa.z0 + caixa.z1) / 2;
  let melhor = null;
  let menor = Infinity;
  for (const g of gatos) {
    // quem já está no ar conta como estando onde vai cair
    const p = g.estado === 'voando' ? g.pulo.para : createVector(g.x, 0, g.z);
    const d = dist(p.x, p.z, cx, cz) + (g.estado === 'voando' ? 300 : 0);
    if (d < menor) {
      menor = d;
      melhor = g;
    }
  }
  return melhor;
}

// A cada cinco caixas desenhadas chega um gato novo pela borda do chão,
// e a caixa nova é dele.
function caixaNova(c) {
  caixasDesenhadas++;
  if (caixasDesenhadas % 5 === 0 && gatos.length < 6) {
    const a = random(TWO_PI);
    const r = TAMANHO_CHAO * 0.47;
    const P = PELAGENS[gatos.length % PELAGENS.length];
    const g = novoGato(cos(a) * r, sin(a) * r, 0, P);
    gatos.push(g);
    chamarGato(g, c);
  } else {
    chamarGato(gatoMaisPerto(c), c);
  }
}

// Os estados de um gato: parado (em pé ou deitado), levantando, agachando,
// voando e pousando.
function atualizarGato(g, dt) {
  g.tempo += dt;

  // os olhos piscam de vez em quando
  g.proximaPiscada -= dt;
  if (g.proximaPiscada < -0.14) g.proximaPiscada = random(2, 5);

  // parado e em pé, a cabeça acompanha a câmera, como quem olha para você;
  // agachado, ele encara a caixa para onde vai pular
  let olharAlvo = 0;
  if (g.estado === 'parado') {
    const paraCamera = atan2(olho.x - g.x, olho.z - g.z);
    olharAlvo = constrain(diferencaAngulo(g.angulo, paraCamera), -0.9, 0.9);
  }
  g.olhar = lerp(g.olhar, olharAlvo, min(1, dt * 3));

  if (g.estado === 'parado') {
    g.h = alturaApoio(g.apoio);
    g.tempoParado += dt;
    // depois de uns 2 segundos parado ele deita
    if (g.tempoParado > 2) g.deitado = min(1, g.deitado + dt / 1.1);
    // e depois de um tempo deitado ele resolve explorar outra caixa
    if (g.tempoParado > g.paciencia && caixas.length > 1) {
      const outras = caixas.filter(c => c !== g.apoio);
      g.paciencia = random(9, 16);
      chamarGato(g, random(outras));
    }
    return;
  }
  g.tempoParado = 0;

  if (g.estado === 'levantando') {
    g.h = alturaApoio(g.apoio);
    g.deitado = max(0, g.deitado - dt / 0.3);
    if (g.deitado === 0) {
      g.estado = 'agachando';
      g.tempo = 0;
    }
    return;
  }

  if (g.estado === 'agachando') {
    // vira para a caixa enquanto agacha
    g.angulo += diferencaAngulo(g.angulo, g.anguloAlvo) * min(1, dt * 8);
    g.h = alturaApoio(g.apoio);
    if (g.tempo > TEMPO_AGACHAR) {
      g.estado = 'voando';
      g.tempo = 0;
      const p = g.pulo;
      p.distancia = p5.Vector.dist(p.de, p.para);
      p.duracao = 0.32 + p.distancia / 1800;
    }
    return;
  }

  if (g.estado === 'voando') {
    const p = g.pulo;
    const s = min(1, g.tempo / p.duracao);
    // a altura de chegada é lida a cada quadro, caso a caixa mude no meio do pulo
    const h1 = alturaApoio(p.destino);
    // o arco sobe mais quando a caixa é alta ou longe
    const arco = 45 + p.distancia * 0.12 + max(0, h1 - p.h0) * 0.35;
    g.x = lerp(p.de.x, p.para.x, s);
    g.z = lerp(p.de.z, p.para.z, s);
    g.h = lerp(p.h0, h1, s) + arco * 4 * s * (1 - s);
    if (s >= 1) {
      g.apoio = p.destino;
      g.estado = 'pousando';
      g.tempo = 0;
    }
    return;
  }

  if (g.estado === 'pousando') {
    g.h = alturaApoio(g.apoio);
    if (g.tempo > TEMPO_POUSAR) {
      g.estado = 'parado';
      g.tempo = 0;
      if (g.proximo !== null) {
        const c = g.proximo;
        g.proximo = null;
        if (c !== g.apoio) chamarGato(g, c);
      }
    }
  }
}

// Uma sombra falsa, só uma elipse escura embaixo do gato. No ar ela é o
// que mostra onde ele vai cair. Fica na superfície mais alta que está
// embaixo dele, seja o chão ou a tampa de uma caixa.
function desenharSombra(g) {
  let h = 0;
  for (const c of caixas) {
    if (g.x > c.x0 && g.x < c.x1 && g.z > c.z0 && g.z < c.z1) {
      const t = topo(c);
      if (t <= g.h + 1) h = max(h, t);
    }
  }
  const afastamento = constrain((g.h - h) / 300, 0, 1);
  push();
  translate(g.x, -h - 0.6, g.z);
  rotateY(g.angulo);
  rotateX(HALF_PI);
  fill(60, 40, 25, 70 * (1 - afastamento * 0.7));
  const tamanho = TAMANHO_GATO * (1 - afastamento * 0.4);
  ellipse(0, 0, (30 + 8 * g.deitado) * tamanho, 62 * tamanho, 24);
  pop();
}

// a menor diferença entre dois ângulos, entre -PI e PI
function diferencaAngulo(a, b) {
  let d = (b - a) % TWO_PI;
  if (d > PI) d -= TWO_PI;
  if (d < -PI) d += TWO_PI;
  return d;
}

// -----------------------------------------------------------------------
// Importar modelos
//
// loadModel lê arquivos OBJ e STL e devolve um p5.Geometry como qualquer
// outro: uma lista de vértices e uma lista de faces. O arquivo não traz
// cor nem material, e quase sempre vem com o y apontando para cima, ao
// contrário do p5. Por isso todo modelo importado passa por alguns
// ajustes antes de entrar na cena.
// -----------------------------------------------------------------------

// Lê um arquivo arrastado para a janela e o coloca onde ele foi solto.
async function importarArquivo(arquivo, px, py) {
  const nome = arquivo.name.toLowerCase();
  const tipo = nome.endsWith('.stl') ? '.stl' : nome.endsWith('.obj') ? '.obj' : null;
  if (!tipo) {
    aviso.html('só sei ler arquivos .obj e .stl');
    return;
  }
  aviso.html('carregando ' + arquivo.name + '…');

  try {
    // O arquivo vira um endereço temporário do navegador. Esse endereço não
    // tem extensão, então o tipo vai no fileType. Com um objeto de opções o
    // fileType precisa estar sempre lá, senão o loadModel quebra.
    const url = URL.createObjectURL(arquivo);
    const malha = await loadModel(url, { normalize: true, fileType: tipo });
    URL.revokeObjectURL(url);

    // solto em cima de uma caixa, ele fica em cima dela
    const s = superficieSobMouse(px, py);
    const x = s ? s.ponto.x : 0;
    const z = s ? s.ponto.z : 0;
    const cores = [[96, 132, 178], [190, 96, 96], [110, 160, 110], [200, 170, 90], [150, 110, 170]];
    const c = prepararImportado(malha, x, z, s ? s.caixa : null, random(cores));
    caixas.push(c);
    ultimaCaixa = c;
    aviso.html(arquivo.name + ': ' + malha.vertices.length + ' vértices, ' + malha.faces.length + ' faces');
    caixaNova(c);
  } catch (erro) {
    console.error(erro);
    aviso.html('não consegui ler ' + arquivo.name);
  }
}

// Prepara uma malha recém-carregada e devolve o objeto da cena.
function prepararImportado(malha, x, z, apoio, cor) {
  medir(malha);

  // Quase todo modelo pronto tem o y para cima, e o p5 tem o y para baixo.
  // A correção é meia volta em torno do eixo x, como no slide do bule.
  // Em vez de girar na hora de desenhar, giramos os próprios vértices:
  // girar (x, y, z) em 180° no eixo x dá (x, -y, -z).
  // É uma rotação, e não um espelho, então as faces continuam olhando
  // para fora.
  for (const v of malha.vertices) {
    v.y = -v.y;
    v.z = -v.z;
  }

  const c = {
    tipo: 'importado',
    malha,
    apoio,
    cor,
    cx: x,
    cz: z
  };
  encaixar(c);
  return c;
}

// Encosta o modelo no chão e centraliza: depois disso o fundo dele fica em
// y = 0 e o meio em x = 0 e z = 0, igual às caixas. Também calcula as
// normais de novo (STL chega com os vértices repetidos e parece facetado
// até o SMOOTH costurar tudo) e mede onde o gato pode pousar.
function encaixar(c) {
  const m = c.malha;
  const lim = limites(m);
  const meioX = (lim.x[0] + lim.x[1]) / 2;
  const meioZ = (lim.z[0] + lim.z[1]) / 2;
  for (const v of m.vertices) {
    v.x -= meioX;
    v.z -= meioZ;
    v.y -= lim.y[1];   // o y maior é o ponto mais baixo
  }
  // Faces degeneradas, que na prática são um risco e não um triângulo
  // (dois cantos no mesmo lugar, como nos polos de uma esfera), não têm
  // normal possível. Elas são tiradas antes do cálculo das normais.
  m.faces = m.faces.filter(([a, b, c]) => {
    const va = m.vertices[a], vb = m.vertices[b], vc = m.vertices[c];
    const minimo = 0.002;
    return p5.Vector.dist(va, vb) > minimo &&
      p5.Vector.dist(vb, vc) > minimo &&
      p5.Vector.dist(vc, va) > minimo &&
      p5.Vector.sub(vb, va).cross(p5.Vector.sub(vc, va)).mag() > 1e-6;
  });
  m.computeNormals(SMOOTH);
  // o SMOOTH junta vértices repetidos, e as coordenadas de textura que o
  // arquivo trouxesse deixariam de bater com eles; como aqui não usamos
  // textura nos modelos, simplesmente descartamos as uv
  m.uvs.length = 0;

  const largura = lim.x[1] - lim.x[0];
  const profundidade = lim.z[1] - lim.z[0];
  c.x0 = c.cx - largura / 2;
  c.x1 = c.cx + largura / 2;
  c.z0 = c.cz - profundidade / 2;
  c.z1 = c.cz + profundidade / 2;
  c.altura = alturaDePouso(m, largura, profundidade);
}

// A pergunta "onde o gato senta?" respondida olhando os vértices: o ponto
// mais alto da região do meio do objeto. Numa caminha é a almofada, num
// bule é a tampa. Se não houver vértice nenhum ali (um anel, por exemplo),
// vale a altura do objeto inteiro.
function alturaDePouso(m, largura, profundidade) {
  let maisAlto = null;
  for (const v of m.vertices) {
    if (abs(v.x) < largura * 0.25 && abs(v.z) < profundidade * 0.25) {
      maisAlto = maisAlto === null ? v.y : min(maisAlto, v.y);
    }
  }
  if (maisAlto === null) maisAlto = limites(m).y[0];
  return -maisAlto;
}

function limites(g) {
  // Um laço simples pelos vértices. O min() e o max() do p5 querem números
  // soltos, e não uma lista, e espalhar uma lista de milhares de vértices
  // com Math.min(...lista) estoura a memória da chamada em modelos grandes.
  const l = { x: [Infinity, -Infinity], y: [Infinity, -Infinity], z: [Infinity, -Infinity] };
  for (const p of g.vertices) {
    for (const k of ['x', 'y', 'z']) {
      if (p[k] < l[k][0]) l[k][0] = p[k];
      if (p[k] > l[k][1]) l[k][1] = p[k];
    }
  }
  return l;
}

// O medir() do slide: antes de posicionar um modelo desconhecido, vale
// olhar o que chegou. Aparece no console.
function medir(g) {
  const l = limites(g);
  const faixa = k => l[k][0].toFixed(1) + ' a ' + l[k][1].toFixed(1);
  print('vértices: ' + g.vertices.length);
  print('faces: ' + g.faces.length);
  print('x: ' + faixa('x'));
  print('y: ' + faixa('y'));
  print('z: ' + faixa('z'));
}

// Gira o último objeto importado em 90° no eixo x. Serve para modelos
// feitos com z para cima, que chegam deitados de lado.
function girarImportado() {
  const c = [...caixas].reverse().find(k => k.tipo === 'importado');
  if (!c) return;
  // a malha já foi enviada para a placa de vídeo; como os vértices vão
  // mudar, liberamos a versão antiga e o p5 manda a nova no próximo model()
  freeGeometry(c.malha);
  for (const v of c.malha.vertices) {
    const y = v.y;
    v.y = -v.z;
    v.z = y;
  }
  encaixar(c);
}

// -----------------------------------------------------------------------
// Texturas, desenhadas no próprio código
// -----------------------------------------------------------------------

function criarTexturaCaixa() {
  const g = createGraphics(512, 256, P2D);
  g.noStroke();
  g.background('#c89a64');
  // fibras do papelão
  for (let i = 0; i < 2500; i++) {
    g.fill(random() < 0.5 ? color(150, 110, 65, 40) : color(225, 190, 140, 40));
    g.rect(random(512), random(256), random(2, 8), 1);
  }
  // tampa (metade esquerda): a emenda das abas e a fita adesiva
  g.fill('#b3854f');
  g.rect(0, 126, 256, 4);
  g.fill(235, 215, 170, 200);
  g.rect(0, 108, 256, 40);
  // lateral (metade direita): bordas mais escuras e o carimbo
  g.fill('#a8794a');
  g.rect(256, 0, 256, 6);
  g.rect(256, 250, 256, 6);
  g.rect(256, 0, 6, 256);
  g.rect(506, 0, 6, 256);
  g.fill(90, 50, 30, 170);
  g.textAlign(CENTER, CENTER);
  g.textStyle(BOLD);
  g.textSize(30);
  g.text('FRÁGIL', 384, 170);
  // duas setas de "este lado para cima"
  for (const x of [350, 418]) {
    g.rect(x - 4, 60, 8, 40);
    g.triangle(x - 14, 64, x + 14, 64, x, 40);
  }
  return g;
}

function criarTexturaChao() {
  const g = createGraphics(1024, 1024, P2D);
  g.noStroke();
  const tacos = 16;
  const lado = g.width / tacos;
  for (let j = 0; j < tacos; j++) {
    for (let i = 0; i < tacos; i++) {
      const tom = random(-14, 14);
      g.fill(196 + tom, 160 + tom, 118 + tom);
      g.rect(i * lado, j * lado, lado, lado);
      // os veios alternam de direção, como num piso de taco
      g.stroke(160 + tom, 120 + tom, 85 + tom, 120);
      for (let k = 4; k < lado; k += 7) {
        if ((i + j) % 2 === 0) g.line(i * lado + k, j * lado, i * lado + k, (j + 1) * lado);
        else g.line(i * lado, j * lado + k, (i + 1) * lado, j * lado + k);
      }
      g.noStroke();
    }
  }
  return g;
}

// -----------------------------------------------------------------------
// Exportar
// -----------------------------------------------------------------------

// buildGeometry grava tudo o que é desenhado dentro dela numa malha só.
// Aqui desenhamos as caixas e os gatos, na pose em que estão, com as mesmas
// transformações do draw, e o resultado é a cena inteira num único p5.Geometry.
function salvar(formato) {
  const cena = buildGeometry(() => {
    // o p5 tem y para baixo e a maioria dos programas 3D tem y para cima;
    // meia volta em x deixa o arquivo de pé, como o slide faz na importação
    rotateX(PI);
    for (const c of caixas) {
      push();
      translate((c.x0 + c.x1) / 2, -alturaApoio(c.apoio), (c.z0 + c.z1) / 2);
      model(c.malha);
      pop();
    }
    for (const g of gatos) desenharPose(g);
  });

  if (formato === 'stl') cena.saveStl('caixas-e-gatos.stl', { binary: true });
  else cena.saveObj('caixas-e-gatos.obj');
  // essa malha existe só para ser salva
  freeGeometry(cena);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}