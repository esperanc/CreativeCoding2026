/* ===========================================================================
   OCEANO DE TRAÇÃO
   Uma estrutura que se monta sozinha e fica de pé por um paradoxo.

   Numa TENSEGRIDADE as barras rígidas não se tocam. Nenhuma delas encosta em
   outra: cada uma flutua, presa apenas por cabos, que não empurram nada — só
   puxam. O conjunto se sustenta porque a compressão das barras e a tração dos
   cabos se cancelam exatamente. Buckminster Fuller chamou isso de "ilhas de
   compressão num oceano de tração"; Kenneth Snelson passou a vida fazendo
   esculturas assim.

   A forma desta estrutura não foi desenhada. O programa recebe a TOPOLOGIA —
   quem se liga a quem, e se o elo é barra ou cabo — e três comprimentos. Mais
   nada: nenhuma coordenada, nenhum ângulo. A geometria é descoberta por
   RELAXAÇÃO DINÂMICA, o mesmo método com que se projetam estruturas de cabos.
   Parte-se de um palpite errado de propósito, cada peça puxa ou empurra as
   suas pontas, e deixa-se o conjunto perder energia até parar. Onde ele para
   é a resposta.

   O cabo é a peça que torna isso possível, porque é a única que tem opinião
   sobre um só sentido: esticado, puxa; frouxo, não faz força nenhuma. A barra
   responde nos dois. Dessa assimetria — e apenas dela — nasce uma forma
   rígida feita de peças que não se encostam.

   Para um prisma de três barras a teoria prevê que os triângulos das pontas se
   fechem a 150° um do outro. Esse número não é dado ao programa em lugar
   nenhum; ele sai da conta, e pode ser medido no resultado.

   Nada aqui fica parado. A protensão respira devagar, e a estrutura responde
   mudando de forma. A cor dos cabos mostra quanto cada um está puxando, de
   modo que o campo de forças, que é invisível, fica à vista — é o verdadeiro
   assunto da peça.

   Girar em volta não é enfeite. Numa imagem plana a estrutura é um emaranhado
   de riscos cruzados; só orbitando é que se vê que as barras passam perto umas
   das outras sem jamais se tocarem.

   CONTROLES
     arrastar ...... gira em volta da estrutura
     roda do mouse . aproxima e afasta
     espaço ........ desmonta tudo e deixa se montar de novo
     1 a 5 ......... número de módulos do mastro
     C ............. mostra ou esconde os cabos

   Autor: Artur Taboada Dios Carvalho
   =========================================================================== */

/*  Math.PI, e não PI: as constantes do p5 só passam a existir quando a
    biblioteca cria a instância do sketch, e isso acontece depois que este
    arquivo é lido. Uma constante de módulo que use PI quebra tudo antes de o
    setup() chegar a ser definido.                                           */
const TORCAO = (5 * Math.PI) / 6;      // 150°, só para deduzir os comprimentos
const TORCAO_INICIAL = Math.PI / 2;    // o palpite de partida, errado de propósito
const H_SOBRE_R = 1.2;                 // altura do módulo em relação ao raio

/*  A protensão: a barra pede para ser 6% mais longa do que cabe, o cabo 15%
    mais curto. Essa briga é o que enrijece a estrutura, e os valores não são
    decorativos. Com folga pequena demais — cabo a 0,95 — todos os cabos
    afrouxam e o conjunto vira um amontoado em repouso, que é um equilíbrio
    legítimo e inútil. Só a partir de 0,90 a estrutura fecha com todos os cabos
    puxando ao mesmo tempo.                                                   */
const PRE_BARRA = 1.06;
const PRE_CABO  = 0.85;

const K_BARRA = 0.55;
const K_CABO  = 0.35;
const K_TOQUE = 1.6;               // o quanto duas barras se recusam a encostar
const FOLGA   = 2.6;               // em raios de barra: a distância que exigem
const AMORTECIMENTO = 0.86;

const PASSOS_POR_QUADRO = 14;      // durante a respiração
const PASSOS_MONTAGEM = 45;        // durante a montagem, para ser rápida de ver
const PASSOS_ATE_CONFERIR = 2600;  // quando vale a pena conferir o resultado
const TORCAO_MAXIMA = 160;         // acima disso o módulo virou: não serve

const R_BARRA = 0.055;             // raios das peças, em frações do raio do mastro
const R_JUNTA = 0.042;
const R_CABO_MIN = 0.0075;
const R_CABO_MAX = 0.016;

const FUNDO   = [14, 15, 19];
const BARRA   = [226, 230, 238];
const FROUXO  = [38, 110, 225];    // cabo pouco tracionado
const TENSO   = [255, 132, 28];    // cabo muito tracionado

// ------------------------------------------------------------------- estado
let modulos = 3;
let nos = [];
let pecas = [];
let raio, altura;
let verCabos = true;
let montando = true;
let passos = 0;
let tentativas = 1;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  dimensionar();
  construir();
  recomecar();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  dimensionar();
  construir();
  recomecar();
}

function recomecar() {
  embaralhar();
  montando = true;
  passos = 0;
  tentativas = 1;
}

/*  O mastro é alto e magro por natureza, e fica mais alto a cada módulo. O
    raio é escolhido para que o conjunto caiba na janela: a altura total sai em
    torno de 1,63 raio por módulo — número medido no resultado da relaxação,
    não arbitrado.                                                            */
function dimensionar() {
  raio = min(width * 0.3, (height * 0.86) / (modulos * 1.63));
  altura = raio * H_SOBRE_R;
}

// ===========================================================================
//  TOPOLOGIA
//  Um mastro de módulos empilhados. Cada nível é um triângulo de três nós. O
//  que o programa declara é só isto: quem se liga a quem, e com que
//  comprimento. Onde cada nó vai parar é problema da relaxação.
// ===========================================================================

function construir() {
  const niveis = modulos + 1;
  nos = [];
  for (let k = 0; k < niveis; k++)
    for (let j = 0; j < 3; j++)
      nos.push({
        p: createVector(0, 0, 0),
        v: createVector(0, 0, 0),
        f: createVector(0, 0, 0)
      });

  const id = (k, j) => k * 3 + (((j % 3) + 3) % 3);
  pecas = [];

  // barras: atravessam o módulo de um nível ao seguinte
  for (let k = 0; k < modulos; k++)
    for (let j = 0; j < 3; j++)
      pecas.push({ a: id(k, j), b: id(k + 1, j), barra: true, tipo: 'barra' });

  // cabos de contorno: fecham o triângulo de cada nível
  for (let k = 0; k < niveis; k++)
    for (let j = 0; j < 3; j++)
      pecas.push({ a: id(k, j), b: id(k, j + 1), barra: false, tipo: 'contorno' });

  // cabos laterais: amarram um nível ao seguinte, sem repetir o caminho da barra
  for (let k = 0; k < modulos; k++)
    for (let j = 0; j < 3; j++)
      pecas.push({ a: id(k, j), b: id(k + 1, j + 1), barra: false, tipo: 'lateral' });

  /*  Os comprimentos de repouso vêm da trigonometria do prisma, como NÚMEROS,
      e não de medir as posições de partida — o que seria circular. São três
      valores para dezenas de peças. Tudo o mais, inclusive a torção com que o
      mastro se fecha, é o que a relaxação tem de descobrir.                  */
  const H = raio * H_SOBRE_R;
  const Lcontorno = raio * sqrt(3);
  const Lbarra = sqrt(2 * raio * raio * (1 - cos(TORCAO)) + H * H);
  const Llateral = sqrt(2 * raio * raio * (1 - cos(TORCAO + TWO_PI / 3)) + H * H);

  for (const m of pecas) {
    const L = m.tipo === 'barra' ? Lbarra
            : m.tipo === 'contorno' ? Lcontorno : Llateral;
    m.L0 = L * (m.barra ? PRE_BARRA : PRE_CABO);
    m.L = L;
    m.carga = 0;
  }
}

/*  O ponto de partida é um palpite deliberadamente errado: um cilindro com
    metade da torção de que a estrutura precisa, mais ruído. Se a forma final
    dependesse de onde se começa, não seria descoberta — seria copiada.       */
function embaralhar() {
  const H = raio * H_SOBRE_R;
  const ruido = raio * 0.35;
  for (let k = 0; k <= modulos; k++)
    for (let j = 0; j < 3; j++) {
      const a = k * TORCAO_INICIAL + (j * TWO_PI) / 3;
      const n = nos[k * 3 + j];
      n.p.set(raio * cos(a) + random(-ruido, ruido),
              -(k - modulos / 2) * H + random(-ruido, ruido),
              raio * sin(a) + random(-ruido, ruido));
      n.v.set(0, 0, 0);
    }
}

// ===========================================================================
//  RELAXAÇÃO DINÂMICA
//  Cada peça puxa ou empurra as suas duas pontas; o sistema perde energia a
//  cada passo e para onde as forças se cancelam. A diferença entre as duas
//  peças está em uma linha só: o cabo desiste quando está frouxo.
// ===========================================================================

function relaxar(protensao) {
  for (const n of nos) n.f.set(0, 0, 0);

  repelirBarras();

  for (const m of pecas) {
    const A = nos[m.a], B = nos[m.b];
    const dx = B.p.x - A.p.x, dy = B.p.y - A.p.y, dz = B.p.z - A.p.z;
    const L = sqrt(dx * dx + dy * dy + dz * dz);
    if (L < 1e-6) continue;

    const L0 = m.barra ? m.L0 : m.L0 * protensao;
    let f = (m.barra ? K_BARRA : K_CABO) * (L - L0);

    // o cabo só sabe puxar: frouxo, não faz força nenhuma
    if (!m.barra && f < 0) f = 0;

    const ux = dx / L, uy = dy / L, uz = dz / L;
    A.f.x += f * ux; A.f.y += f * uy; A.f.z += f * uz;
    B.f.x -= f * ux; B.f.y -= f * uy; B.f.z -= f * uz;

    m.L = L;
    m.carga = f;
  }

  for (const n of nos) {
    n.v.add(n.f);
    n.v.mult(AMORTECIMENTO);
    n.p.add(n.v);
  }

  // a estrutura flutua: sem apoios, o centro é trazido de volta à origem para
  // que ela não saia passeando pela cena
  let cx = 0, cy = 0, cz = 0;
  for (const n of nos) { cx += n.p.x; cy += n.p.y; cz += n.p.z; }
  cx /= nos.length; cy /= nos.length; cz /= nos.length;
  for (const n of nos) { n.p.x -= cx; n.p.y -= cy; n.p.z -= cz; }
}

/*  As barras são sólidas: não podem se atravessar. Esta é a peça de física que
    falta para que a estrutura exista. Sem ela o sistema encontra na hora uma
    saída preguiçosa — encolher até todos os cabos ficarem frouxos, o que é uma
    configuração de força zero e portanto um equilíbrio legítimo da relaxação,
    ainda que um amontoado inútil.

    Com a recusa ao toque esse colapso fica proibido, e o conjunto infla até os
    cabos segurarem. Vale reparar no que acontece depois: na estrutura pronta
    as barras ficam muito mais afastadas do que o limiar da repulsão, e ela
    deixa de agir. A folga entre as barras não é imposta aqui — é obra dos
    cabos.                                                                     */
function repelirBarras() {
  const alvo = raio * R_BARRA * FOLGA;
  const barras = [];
  for (const m of pecas) if (m.barra) barras.push(m);

  for (let i = 0; i < barras.length; i++) {
    for (let j = i + 1; j < barras.length; j++) {
      const A = barras[i], B = barras[j];
      // barras que compartilham uma junta têm de se tocar ali: não contam
      if (A.a === B.a || A.a === B.b || A.b === B.a || A.b === B.b) continue;

      const r = maisProximos(nos[A.a].p, nos[A.b].p, nos[B.a].p, nos[B.b].p);
      if (r.d >= alvo || r.d < 1e-9) continue;

      // empurra ao longo da linha que une os dois pontos mais próximos,
      // repartindo a força entre as pontas conforme onde o encontro acontece
      const f = (K_TOQUE * (alvo - r.d)) / r.d;
      const fx = r.x * f, fy = r.y * f, fz = r.z * f;
      aplicar(nos[A.a], fx, fy, fz, 1 - r.s);
      aplicar(nos[A.b], fx, fy, fz, r.s);
      aplicar(nos[B.a], -fx, -fy, -fz, 1 - r.t);
      aplicar(nos[B.b], -fx, -fy, -fz, r.t);
    }
  }
}

function aplicar(n, fx, fy, fz, peso) {
  n.f.x += fx * peso;
  n.f.y += fy * peso;
  n.f.z += fz * peso;
}

/*  O par de pontos mais próximos entre dois segmentos no espaço. Devolve a
    distância, o vetor que os separa e onde cada ponto cai no seu segmento —
    essas duas frações são o que permite repartir a força entre as pontas.    */
function maisProximos(p1, q1, p2, q2) {
  const d1x = q1.x - p1.x, d1y = q1.y - p1.y, d1z = q1.z - p1.z;
  const d2x = q2.x - p2.x, d2y = q2.y - p2.y, d2z = q2.z - p2.z;
  const rx = p1.x - p2.x, ry = p1.y - p2.y, rz = p1.z - p2.z;

  const a = d1x * d1x + d1y * d1y + d1z * d1z;
  const e = d2x * d2x + d2y * d2y + d2z * d2z;
  const f = d2x * rx + d2y * ry + d2z * rz;
  const c = d1x * rx + d1y * ry + d1z * rz;
  const b = d1x * d2x + d1y * d2y + d1z * d2z;

  const den = a * e - b * b;
  let s = den > 1e-9 ? constrain((b * f - c * e) / den, 0, 1) : 0;
  let t = e > 1e-9 ? (b * s + f) / e : 0;
  if (t < 0) { t = 0; s = a > 1e-9 ? constrain(-c / a, 0, 1) : 0; }
  else if (t > 1) { t = 1; s = a > 1e-9 ? constrain((b - c) / a, 0, 1) : 0; }

  const x = p1.x + d1x * s - (p2.x + d2x * t);
  const y = p1.y + d1y * s - (p2.y + d2y * t);
  const z = p1.z + d1z * s - (p2.z + d2z * t);
  return { d: sqrt(x * x + y * y + z * z), x, y, z, s, t };
}

// ===========================================================================
//  CONFERÊNCIA
// ===========================================================================

/*  A relaxação nem sempre acerta. Existe um segundo equilíbrio, em que um dos
    módulos vira ao contrário e as barras ficam quase encostadas: também é um
    ponto de força zero, mas não é uma tensegridade. Em vez de aceitar o que
    vier, o programa confere o que encontrou — todo cabo puxando, toda barra
    comprimida, nenhum módulo virado — e, se não presta, desmonta e recomeça. */
function valida() {
  for (const m of pecas) {
    if (m.barra && m.L >= m.L0) return false;    // barra tem de estar comprimida
    if (!m.barra && m.carga <= 0) return false;  // cabo tem de estar puxando
  }
  for (const t of torcoes()) if (t > TORCAO_MAXIMA) return false;
  return true;
}

/*  O ângulo com que cada módulo se fecha, medido no resultado. Esse número não
    entra em lugar nenhum do solucionador: ele recebe comprimentos e ligações,
    e tem de achar as coordenadas no espaço que os realizem. Para o prisma de
    três barras a teoria prevê 150°.                                          */
function torcoes() {
  const eixo = p5.Vector.sub(nos[modulos * 3].p, nos[0].p).normalize();
  const fora = (v) => p5.Vector.sub(v, p5.Vector.mult(eixo, v.dot(eixo)));
  const centro = (k) => {
    const c = createVector(0, 0, 0);
    for (let j = 0; j < 3; j++) c.add(nos[k * 3 + j].p);
    return c.div(3);
  };

  const out = [];
  for (let k = 0; k < modulos; k++) {
    const a = fora(p5.Vector.sub(nos[k * 3].p, centro(k))).normalize();
    const b = fora(p5.Vector.sub(nos[(k + 1) * 3].p, centro(k + 1))).normalize();
    out.push(degrees(acos(constrain(a.dot(b), -1, 1))));
  }
  return out;
}

// ===========================================================================
//  DESENHO
// ===========================================================================

function draw() {
  background(FUNDO[0], FUNDO[1], FUNDO[2]);
  orbitControl(1.5, 1.5, 0.2);
  rotateY(millis() * 0.00012);       // um giro de reconhecimento, lento

  if (montando) {
    for (let i = 0; i < PASSOS_MONTAGEM; i++) relaxar(1);
    passos += PASSOS_MONTAGEM;
    if (passos > PASSOS_ATE_CONFERIR) {
      if (valida()) montando = false;
      else { embaralhar(); passos = 0; tentativas++; }
    }
  } else {
    // a protensão respira: os cabos apertam e afrouxam, e a forma responde
    const protensao = 1 + 0.05 * sin(millis() * 0.00035);
    for (let i = 0; i < PASSOS_POR_QUADRO; i++) relaxar(protensao);
  }

  // luz fria e neutra: as barras ficam metálicas, e a única cor da cena passa
  // a ser a dos cabos, que é a informação que importa
  ambientLight(46, 48, 56);
  directionalLight(238, 242, 252, -0.4, 0.8, -0.45);
  directionalLight(70, 90, 130, 0.75, -0.35, 0.5);
  pointLight(200, 215, 245, raio * 2.5, -altura * modulos * 0.4, raio * 2.5);

  noStroke();
  if (verCabos) desenharCabos();
  desenharBarras();
  desenharJuntas();
}

function desenharCabos() {
  /*  A faixa de tração do momento. Normalizar entre o menor e o maior valor, e
      não entre zero e o maior, é o que faz as diferenças aparecerem: num
      equilíbrio todos os cabos puxam, e o que interessa é quanto cada um puxa
      a mais que os outros.                                                   */
  let minCarga = Infinity, maxCarga = 0;
  for (const m of pecas) if (!m.barra) {
    if (m.carga < minCarga) minCarga = m.carga;
    if (m.carga > maxCarga) maxCarga = m.carga;
  }
  const faixa = max(maxCarga - minCarga, 1e-6);

  for (const m of pecas) {
    if (m.barra) continue;
    const t = constrain((m.carga - minCarga) / faixa, 0, 1);
    // o cabo brilha por conta própria: é fino demais para depender da luz
    emissiveMaterial(lerp(FROUXO[0], TENSO[0], t),
                     lerp(FROUXO[1], TENSO[1], t),
                     lerp(FROUXO[2], TENSO[2], t));
    haste(nos[m.a].p, nos[m.b].p, raio * lerp(R_CABO_MIN, R_CABO_MAX, t), 6);
  }
}

// as barras vêm depois dos cabos, para ficarem por cima dos que as atravessam
function desenharBarras() {
  for (const m of pecas) {
    if (!m.barra) continue;
    ambientMaterial(BARRA[0] * 0.5, BARRA[1] * 0.5, BARRA[2] * 0.5);
    specularMaterial(BARRA[0], BARRA[1], BARRA[2]);
    shininess(55);
    haste(nos[m.a].p, nos[m.b].p, raio * R_BARRA, 14);
  }
}

// as juntas: é nelas que cabo e barra se encontram
function desenharJuntas() {
  for (const n of nos) {
    push();
    translate(n.p.x, n.p.y, n.p.z);
    ambientMaterial(60, 62, 70);
    specularMaterial(220);
    shininess(80);
    sphere(raio * R_JUNTA, 10, 8);
    pop();
  }
}

/*  Uma haste entre dois pontos quaisquer. O cilindro do p5 nasce em pé, com o
    eixo em y; para deitá-lo na direção certa gira-se em torno do eixo
    perpendicular aos dois — o produto vetorial entre o "para cima" e a direção
    desejada — pelo ângulo entre eles.                                        */
function haste(a, b, r, lados) {
  const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
  const L = sqrt(dx * dx + dy * dy + dz * dz);
  if (L < 1e-6) return;

  push();
  translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);

  const uy = dy / L;
  if (abs(uy) > 0.999999) {
    if (uy < 0) rotateX(PI);                 // já alinhada: só pode estar invertida
  } else {
    const ex = -dz / L, ez = dx / L;         // eixo = (0,1,0) x direção
    const n = sqrt(ex * ex + ez * ez);
    rotate(acos(constrain(uy, -1, 1)), [ex / n, 0, ez / n]);
  }
  cylinder(r, L, lados, 1);
  pop();
}

// ===========================================================================
//  INTERAÇÃO
// ===========================================================================

function keyPressed() {
  if (key === ' ') recomecar();
  else if (key === 'c' || key === 'C') verCabos = !verCabos;
  else if (key >= '1' && key <= '5') {
    modulos = int(key);
    dimensionar();
    construir();
    recomecar();
  }
}