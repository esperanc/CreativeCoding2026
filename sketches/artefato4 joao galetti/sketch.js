// =============================================================================
//  TERRA FICTA — carta de levantamento de uma ilha que nunca existiu
//  João Galetti · Programação Criativa · Artefato 4
//
//  O sketch não desenha um relevo: ele o *fabrica* e depois o *levanta*.
//    1. ruído de Perlin com oitavas  -> matéria-prima bruta
//    2. erosão hidráulica por gotas  -> vales, cristas, esporões
//    3. enchimento de depressões     -> lagos
//    4. acumulação de fluxo          -> a rede de rios, que EMERGE
//    5. gravura                      -> costa, curvas de nível, pontilhado
//                                       (blue noise), topônimos, cartucho
//
//  Cada semente produz uma ilha diferente — e sempre a mesma para a mesma
//  semente. Clique para levantar outra ilha; "s" salva a carta.
// =============================================================================

// ------------------------------- parâmetros ---------------------------------

const GRID = 360;          // resolução do modelo digital de terreno
const S = 1500;            // lado da carta em pixels (renderizada offscreen)
const OUT = 54;            // margem até a moldura externa
const TICK = 24;           // largura da faixa de graduação da moldura

const NIVEL_MAR = 0.300;   // altitude que separa terra e água
const MEANDRO = 11;        // amplitude do meandro dado aos rios, em pixels
const PASSOS = 85;         // passos de erosão fluvial
const K_INCISAO = 0.0055;  // quanto o rio corta a cada passo
const K_CREEP = 0.13;           // quanto a encosta desmorona a cada passo
// A razão entre os dois decide a densidade de drenagem: muito desmoronamento
// e a ilha vira uma duna lisa; pouco, e vira uma serra de facas.

// paleta: papel envelhecido, tinta sépia, água em índigo apagado
const PAPEL      = [236, 226, 205];
const PAPEL_MAR  = [225, 222, 206];
const TINTA      = [58, 44, 33];
const TINTA_MAR  = [72, 92, 106];
const VERMELHO   = [150, 60, 44];

// ------------------------------- estado -------------------------------------

let semente;
let alt;        // Float32Array — altitude após erosão
let cheio;      // Float32Array — superfície de água (depressões enchidas)
let pai;        // Int32Array   — célula jusante (árvore de drenagem)
let ordem;      // Int32Array   — ordem de visita do priority-flood
let fluxo;      // Float32Array — acumulação de fluxo
let jusante;    // Int32Array   — para onde a água de cada célula escorre
let sombra;     // Float32Array — sombreamento (0 claro .. 1 escuro)
let copia;      // Float32Array — rascunho da difusão
let visitado;   // Uint8Array  — marcação do priority-flood
let monte;      // MinHeap     — fila de prioridade reaproveitada
let areaTerra = 0;   // nº de células emersas — calibra o limiar dos rios

let carta;      // p5.Graphics com a carta pronta
let fase = 'terreno';
let passosFeitos = 0;
let nomeIlha = '';
let tituloIlha = null;
let progresso = 0;

// ============================================================================
//                                   p5
// ============================================================================

function setup() {
  const c = createCanvas(windowWidth, windowHeight);
  const holder = document.getElementById('sketch-holder');
  if (holder) c.parent(holder);
  pixelDensity(1);
  carta = createGraphics(S, S);
  carta.pixelDensity(1);
  novaIlha(floor(Math.random() * 99999));
}

function novaIlha(s) {
  semente = s;
  randomSeed(semente);
  noiseSeed(semente);
  fase = 'terreno';
  passosFeitos = 0;
  progresso = 0;
}

function draw() {
  if (fase !== 'pronto') {
    telaDeEspera();
    avancar();
    return;
  }
  mostrarCarta();
}

// Uma etapa por quadro: a simulação é pesada e a página precisa respirar.
function avancar() {
  if (fase === 'terreno') {
    construirTerreno();
    fase = 'erosao';
  } else if (fase === 'erosao') {
    for (let k = 0; k < 3 && passosFeitos < PASSOS; k++) {
      passoErosao();
      passosFeitos++;
    }
    progresso = passosFeitos / PASSOS;
    if (passosFeitos >= PASSOS) fase = 'hidrologia';
  } else if (fase === 'hidrologia') {
    encherDepressoes();
    acumularFluxo();
    calcularSombra();
    fase = 'desenho';
  } else if (fase === 'desenho') {
    gravarCarta();
    fase = 'pronto';
  }
}

function mostrarCarta() {
  background(26, 24, 22);
  const lado = min(width, height) * 0.94;
  image(carta, (width - lado) / 2, (height - lado) / 2, lado, lado);
}

function telaDeEspera() {
  background(26, 24, 22);
  const legenda = {
    terreno: 'levantando o relevo bruto',
    erosao: 'deixando a chuva cair',
    hidrologia: 'seguindo as águas até o mar',
    desenho: 'gravando a carta'
  }[fase];

  push();
  translate(width / 2, height / 2);
  noStroke();
  fill(PAPEL[0], PAPEL[1], PAPEL[2], 190);
  textAlign(CENTER, CENTER);
  textFont('Georgia, serif');
  textSize(min(width, height) * 0.028);
  text('TERRA FICTA', 0, -34);
  textSize(min(width, height) * 0.017);
  fill(PAPEL[0], PAPEL[1], PAPEL[2], 120);
  text(legenda + '…', 0, 4);

  const w = min(width * 0.4, 320);
  const p = fase === 'erosao' ? progresso : (fase === 'terreno' ? 0.04 : 0.92);
  noFill();
  stroke(PAPEL[0], PAPEL[1], PAPEL[2], 70);
  strokeWeight(1);
  rect(-w / 2, 30, w, 3);
  noStroke();
  fill(VERMELHO[0] + 60, VERMELHO[1] + 40, VERMELHO[2] + 30, 220);
  rect(-w / 2, 30, w * p, 3);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  if (mouseX < 0 || mouseY < 0 || mouseX > width || mouseY > height) return;
  if (fase === 'pronto') novaIlha(floor(Math.random() * 99999));
}

function keyPressed() {
  if ((key === 's' || key === 'S') && fase === 'pronto') {
    saveCanvas(carta, 'terra-ficta-' + semente, 'png');
  }
}

// ============================================================================
//  1. TERRENO — ruído de Perlin em oitavas, deformado e mascarado por ilhas
// ============================================================================

function construirTerreno() {
  const nc = GRID * GRID;
  alt = new Float32Array(nc);
  copia = new Float32Array(nc);
  cheio = new Float32Array(nc);
  pai = new Int32Array(nc);
  ordem = new Int32Array(nc);
  jusante = new Int32Array(nc);
  fluxo = new Float32Array(nc);
  visitado = new Uint8Array(nc);
  monte = new MinHeap(nc);
  noiseDetail(6, 0.55);

  // As "ilhas" são lóbulos sobrepostos: um principal e alguns satélites.
  const lobos = [];
  const nLobos = floor(random(3, 7));
  lobos.push({ x: random(0.45, 0.55), y: random(0.45, 0.55), r: random(0.34, 0.41) });
  for (let k = 1; k < nLobos; k++) {
    const a = random(TWO_PI);
    const d = random(0.16, 0.32);
    lobos.push({
      x: lobos[0].x + cos(a) * d,
      y: lobos[0].y + sin(a) * d * 0.85,
      r: random(0.10, 0.24)
    });
  }

  const desloc = random(0.7, 1.1);   // intensidade da deformação do domínio
  const esc = random(4.2, 5.6);      // escala do relevo

  let minE = 1e9, maxE = -1e9;
  const bruto = new Float32Array(GRID * GRID);

  for (let j = 0; j < GRID; j++) {
    for (let i = 0; i < GRID; i++) {
      const u = i / (GRID - 1);
      const v = j / (GRID - 1);

      // deformação do domínio: consultar o ruído num ponto que também é ruído
      const wx = noise(u * 2.1 + 11.3, v * 2.1 + 31.7) - 0.5;
      const wy = noise(u * 2.1 + 71.9, v * 2.1 + 53.1) - 0.5;
      let e = noise(u * esc + wx * desloc + 5, v * esc + wy * desloc + 5);

      bruto[j * GRID + i] = e;
      if (e < minE) minE = e;
      if (e > maxE) maxE = e;
    }
  }

  for (let j = 0; j < GRID; j++) {
    for (let i = 0; i < GRID; i++) {
      const idx = j * GRID + i;
      const u = i / (GRID - 1);
      const v = j / (GRID - 1);

      // máscara: 1 no núcleo dos lóbulos, 0 no mar aberto — com a borda rasgada
      let m = 0;
      for (const L of lobos) {
        const d = dist(u, v, L.x, L.y) / L.r;
        m = max(m, 1 - d);
      }
      m += (noise(u * 4.4 + 91, v * 4.4 + 17) - 0.5) * 0.62;
      // garante uma faixa de mar até a moldura: uma ilha cortada pela borda
      // não é uma ilha levantada, é uma ilha mal enquadrada
      const borda = Math.min(u, 1 - u, v, 1 - v);
      m *= constrain(borda / 0.075, 0, 1);
      m = constrain(m, 0, 1);
      m = m * m * (3 - 2 * m);                    // suavização

      const e = (bruto[idx] - minE) / (maxE - minE + 1e-9);
      // acima da máscara: relevo emerso. Abaixo: um fundo de mar que também
      // varia, para que as sondagens tenham o que medir.
      alt[idx] = m * (0.30 + 0.72 * e) + (1 - m) * (0.02 + 0.09 * e);
    }
  }

}

// ============================================================================
//  2. EROSÃO FLUVIAL — o relevo e seus rios são calculados juntos
//
//  A cada passo: descobre-se por onde a água escorre, quanta água passa em
//  cada ponto, e o terreno é rebaixado onde passa muita água em declive forte
//  (lei de potência de fluxo: incisão ∝ √área · declive). Entre um passo e
//  outro, uma difusão suave arredonda as encostas, como faz o intemperismo.
//
//  Não há nenhuma regra dizendo "faça um rio ramificado". A ramificação é a
//  única forma estável desse jogo entre cavar e desmoronar — ela emerge.
// ============================================================================

function passoErosao() {
  encherDepressoes();
  acumularFluxo();

  for (let j = 1; j < GRID - 1; j++) {
    for (let i = 1; i < GRID - 1; i++) {
      const c = j * GRID + i;
      if (alt[c] <= NIVEL_MAR) continue;
      const d = jusante[c];
      if (d < 0) continue;

      const dz = cheio[c] - cheio[d];
      if (dz <= 0) continue;
      const diag = (Math.abs((d % GRID) - i) + Math.abs(((d / GRID) | 0) - j)) === 2;
      const decl = dz / (diag ? 1.4142 : 1);

      let corte = K_INCISAO * Math.sqrt(fluxo[c]) * decl;
      if (corte > dz * 0.4) corte = dz * 0.4;      // estabilidade: nunca abrir poço
      alt[c] -= corte;
      if (alt[c] < NIVEL_MAR * 0.985) alt[c] = NIVEL_MAR * 0.985;
    }
  }

  difundirEncostas();
}

// Intemperismo: material desce a encosta lentamente e as cristas arredondam.
// É o contrapeso da incisão — sem ele o terreno vira uma serra de facas.
function difundirEncostas() {
  copia.set(alt);
  for (let j = 1; j < GRID - 1; j++) {
    for (let i = 1; i < GRID - 1; i++) {
      const c = j * GRID + i;
      if (copia[c] <= NIVEL_MAR) continue;
      const a = copia[c - 1], b = copia[c + 1];
      const e = copia[c - GRID], f = copia[c + GRID];
      if (a <= NIVEL_MAR || b <= NIVEL_MAR || e <= NIVEL_MAR || f <= NIVEL_MAR) continue;
      alt[c] += K_CREEP * ((a + b + e + f) * 0.25 - copia[c]);
    }
  }
}

// ============================================================================
//  3. HIDROLOGIA — priority-flood: enche depressões e, de quebra, devolve
//     a árvore de drenagem (cada célula sabe para onde sua água escorre)
// ============================================================================

function encherDepressoes() {
  const n = GRID * GRID;
  pai.fill(-1);
  visitado.fill(0);
  const heap = monte;
  heap.tamanho = 0;
  for (let i = 0; i < GRID; i++) {
    for (const idx of [i, (GRID - 1) * GRID + i, i * GRID, i * GRID + GRID - 1]) {
      if (!visitado[idx]) {
        visitado[idx] = 1;
        cheio[idx] = alt[idx];
        heap.push(idx, alt[idx]);
      }
    }
  }

  let contador = 0;
  const viz = [-1, 1, -GRID, GRID, -GRID - 1, -GRID + 1, GRID - 1, GRID + 1];

  while (heap.tamanho > 0) {
    const c = heap.pop();
    ordem[contador++] = c;
    const cx = c % GRID, cy = (c / GRID) | 0;

    for (let d = 0; d < 8; d++) {
      const v = c + viz[d];
      if (v < 0 || v >= n) continue;
      const vx = v % GRID, vy = (v / GRID) | 0;
      if (Math.abs(vx - cx) > 1 || Math.abs(vy - cy) > 1) continue;
      if (visitado[v]) continue;
      visitado[v] = 1;
      cheio[v] = Math.max(alt[v], cheio[c]);
      pai[v] = c;                       // descoberto a partir de c => jusante
      heap.push(v, cheio[v]);
    }
  }
}

function acumularFluxo() {
  const n = GRID * GRID;
  const viz = [-1, 1, -GRID, GRID, -GRID - 1, -GRID + 1, GRID - 1, GRID + 1];
  const passo = [1, 1, 1, 1, 1.4142, 1.4142, 1.4142, 1.4142];

  // Para onde escorre cada célula: o vizinho de maior declive sobre a
  // superfície já preenchida. Em terreno plano (dentro de um lago), usa-se
  // a árvore do priority-flood como desempate.
  jusante.fill(-1);
  for (let j = 1; j < GRID - 1; j++) {
    for (let i = 1; i < GRID - 1; i++) {
      const c = j * GRID + i;
      let melhor = -1, maiorDecl = 0;
      for (let d = 0; d < 8; d++) {
        const v = c + viz[d];
        const decl = (cheio[c] - cheio[v]) / passo[d];
        if (decl > maiorDecl) { maiorDecl = decl; melhor = v; }
      }
      jusante[c] = melhor >= 0 ? melhor : pai[c];
    }
  }

  // Acumulação por fluxo multidirecional: cada célula reparte sua água entre
  // TODOS os vizinhos mais baixos, na proporção do declive. Mandar tudo para
  // um único vizinho (D8) faz surgirem raios retos em encostas lisas; repartir
  // deixa a água convergir sozinha e a rede sai ramificada.
  fluxo.fill(0);
  areaTerra = 0;
  for (let i = 0; i < n; i++) {
    fluxo[i] = alt[i] > NIVEL_MAR ? 1 : 0;
    areaTerra += fluxo[i];
  }

  const peso = new Float64Array(8);
  // A ordem inversa do priority-flood é topológica: como toda a água desce
  // para células de cota menor (desempilhadas antes), todo montante já foi
  // somado quando chega a vez da célula.
  for (let k = n - 1; k >= 0; k--) {
    const c = ordem[k];
    const cx = c % GRID, cy = (c / GRID) | 0;
    if (cx === 0 || cy === 0 || cx === GRID - 1 || cy === GRID - 1) continue;

    let soma = 0;
    for (let d = 0; d < 8; d++) {
      const decl = (cheio[c] - cheio[c + viz[d]]) / passo[d];
      // expoente alto (4) = fluxo convergente: a água quase toda desce pelo
      // vizinho mais íngreme, mas nunca só por ele — é o que dissolve o
      // artefato de raios retos do D8 sem espalhar o rio numa toalha
      const d2 = decl * decl;
      peso[d] = decl > 0 ? d2 * d2 : 0;
      soma += peso[d];
    }
    if (soma <= 0) {
      if (pai[c] >= 0) fluxo[pai[c]] += fluxo[c];
      continue;
    }
    const f = fluxo[c];
    for (let d = 0; d < 8; d++) {
      if (peso[d] > 0) fluxo[c + viz[d]] += f * (peso[d] / soma);
    }
  }
}

// Fila de prioridade mínima sobre um heap binário em arrays tipados.
class MinHeap {
  constructor(cap) {
    this.idx = new Int32Array(cap + 1);
    this.chave = new Float32Array(cap + 1);
    this.tamanho = 0;
  }
  push(i, k) {
    let p = ++this.tamanho;
    this.idx[p] = i; this.chave[p] = k;
    while (p > 1) {
      const q = p >> 1;
      if (this.chave[q] <= this.chave[p]) break;
      this.trocar(p, q); p = q;
    }
  }
  pop() {
    const topo = this.idx[1];
    this.idx[1] = this.idx[this.tamanho];
    this.chave[1] = this.chave[this.tamanho];
    this.tamanho--;
    let p = 1;
    for (;;) {
      const e = p << 1, d = e + 1;
      let m = p;
      if (e <= this.tamanho && this.chave[e] < this.chave[m]) m = e;
      if (d <= this.tamanho && this.chave[d] < this.chave[m]) m = d;
      if (m === p) break;
      this.trocar(p, m); p = m;
    }
    return topo;
  }
  trocar(a, b) {
    const i = this.idx[a], k = this.chave[a];
    this.idx[a] = this.idx[b]; this.chave[a] = this.chave[b];
    this.idx[b] = i; this.chave[b] = k;
  }
}

// ============================================================================
//  4. SOMBREAMENTO — luz do noroeste, como manda a tradição cartográfica
// ============================================================================

function calcularSombra() {
  sombra = new Float32Array(GRID * GRID);
  const lx = -0.62, ly = -0.62, lz = 0.48;   // vetor de luz (NO, baixo)
  const escalaZ = 88;

  for (let j = 1; j < GRID - 1; j++) {
    for (let i = 1; i < GRID - 1; i++) {
      const k = j * GRID + i;
      if (alt[k] <= NIVEL_MAR) continue;
      const dzx = (alt[k + 1] - alt[k - 1]) * escalaZ;
      const dzy = (alt[k + GRID] - alt[k - GRID]) * escalaZ;
      const nlen = Math.sqrt(dzx * dzx + dzy * dzy + 1);
      const lamb = (-dzx * lx - dzy * ly + lz) / (nlen * Math.sqrt(lx * lx + ly * ly + lz * lz));
      const decl = Math.sqrt(dzx * dzx + dzy * dzy);
      const s = constrain((0.60 - lamb) * 1.45, 0, 1) *
                constrain(0.02 + decl * 0.58, 0, 1);
      sombra[k] = s;
    }
  }
}

// ============================================================================
//  5. GRAVURA — a carta propriamente dita
// ============================================================================

const CX = OUT + TICK;          // origem da área cartografada
const CW = S - 2 * CX;          // lado da área cartografada

function px(i) { return CX + (i / (GRID - 1)) * CW; }
function ig(p) { return ((p - CX) / CW) * (GRID - 1); }

function gravarCarta() {
  const g = carta;
  g.push();
  g.textFont('Georgia, "Times New Roman", serif');

  nomeIlha = gerarNome();
  const cantoCartucho = melhorCanto(CW * 0.415, CW * 0.175, -1);
  const cantoRosa = melhorCanto(CW * 0.145, CW * 0.145, cantoCartucho);

  desenharLavagem(g);
  desenharGraticula(g);
  desenharRumos(g, cantoRosa);
  desenharBatimetria(g);
  desenharCurvasDeNivel(g);
  desenharPontilhado(g);
  desenharRios(g);
  desenharCosta(g);
  desenharToponimos(g);
  desenharRosaDosVentos(g, cantoRosa);
  desenharCartucho(g, cantoCartucho);
  desenharSondagens(g);
  desenharMoldura(g);
  envelhecerPapel(g);

  g.pop();
}

// ---------------------------------------------------------------- lavagem ---
// A base aquarelada: mar por profundidade, terra por sombreamento.
// Desenhada em baixa resolução e ampliada — fica com o ar de tinta diluída.

function desenharLavagem(g) {
  const R = 1000;
  const img = createImage(R, R);
  img.loadPixels();

  for (let y = 0; y < R; y++) {
    for (let x = 0; x < R; x++) {
      const gi = (x / (R - 1)) * (GRID - 1);
      const gj = (y / (R - 1)) * (GRID - 1);
      const h = amostra(alt, gi, gj);
      const s = amostra(sombra, gi, gj);
      const lago = amostra(cheio, gi, gj) - h;

      // mancha do papel: ruído de baixa frequência, quase imperceptível
      const grao = (noise(x * 0.012 + 300, y * 0.012 + 300) - 0.5) * 16;

      let r, vg, b;
      if (h < NIVEL_MAR) {
        const t = constrain((NIVEL_MAR - h) / NIVEL_MAR, 0, 1);
        const p = Math.pow(t, 0.85);
        r = lerp(PAPEL_MAR[0], 191, p);
        vg = lerp(PAPEL_MAR[1], 204, p);
        b = lerp(PAPEL_MAR[2], 209, p);
      } else if (lago > 0.0022) {
        r = 158; vg = 178; b = 188;
      } else {
        const alto = constrain((h - NIVEL_MAR) / 0.55, 0, 1);
        r = lerp(PAPEL[0], 231, alto);
        vg = lerp(PAPEL[1], 214, alto);
        b = lerp(PAPEL[2], 180, alto);
        const k = s * 78;
        r -= k * 1.0; vg -= k * 0.94; b -= k * 0.78;
      }

      const o = 4 * (y * R + x);
      img.pixels[o]     = r + grao;
      img.pixels[o + 1] = vg + grao;
      img.pixels[o + 2] = b + grao;
      img.pixels[o + 3] = 255;
    }
  }
  img.updatePixels();

  g.noStroke();
  g.fill(PAPEL[0], PAPEL[1], PAPEL[2]);
  g.rect(0, 0, S, S);
  g.image(img, CX, CX, CW, CW);
}

function amostra(campo, gi, gj) {
  const i = Math.min(GRID - 2, Math.floor(gi));
  const j = Math.min(GRID - 2, Math.floor(gj));
  const fx = gi - i, fy = gj - j;
  const k = j * GRID + i;
  return campo[k] * (1 - fx) * (1 - fy) + campo[k + 1] * fx * (1 - fy) +
         campo[k + GRID] * (1 - fx) * fy + campo[k + GRID + 1] * fx * fy;
}

// ------------------------------------------------------- marching squares ---
// Extrai a linha de nível `nivel` do campo. Devolve segmentos em pixels.

function isolinha(campo, nivel) {
  const segs = [];
  for (let j = 0; j < GRID - 1; j++) {
    for (let i = 0; i < GRID - 1; i++) {
      const A = campo[j * GRID + i];
      const B = campo[j * GRID + i + 1];
      const C = campo[(j + 1) * GRID + i + 1];
      const D = campo[(j + 1) * GRID + i];
      let c = 0;
      if (A > nivel) c |= 1;
      if (B > nivel) c |= 2;
      if (C > nivel) c |= 4;
      if (D > nivel) c |= 8;
      if (c === 0 || c === 15) continue;

      const T = () => [i + (nivel - A) / (B - A), j];
      const R = () => [i + 1, j + (nivel - B) / (C - B)];
      const Bo = () => [i + (nivel - D) / (C - D), j + 1];
      const L = () => [i, j + (nivel - A) / (D - A)];

      switch (c) {
        case 1: case 14: segs.push([L(), T()]); break;
        case 2: case 13: segs.push([T(), R()]); break;
        case 3: case 12: segs.push([L(), R()]); break;
        case 4: case 11: segs.push([R(), Bo()]); break;
        case 6: case 9:  segs.push([T(), Bo()]); break;
        case 7: case 8:  segs.push([L(), Bo()]); break;
        case 5: case 10: {
          const centro = (A + B + C + D) / 4;
          if ((c === 5) === (centro > nivel)) {
            segs.push([L(), T()]); segs.push([R(), Bo()]);
          } else {
            segs.push([L(), Bo()]); segs.push([T(), R()]);
          }
          break;
        }
      }
    }
  }
  return segs;
}

function tracarIsolinha(g, campo, nivel) {
  const segs = isolinha(campo, nivel);
  g.beginShape(LINES);
  for (const [a, b] of segs) {
    g.vertex(px(a[0]), px(a[1]));
    g.vertex(px(b[0]), px(b[1]));
  }
  g.endShape();
}

// ------------------------------------------------------------ batimetria ---
// A auréola de linhas paralelas à costa, marca registrada das cartas antigas.

function desenharBatimetria(g) {
  g.noFill();
  g.strokeCap(ROUND);
  const niveis = [0.975, 0.945, 0.908, 0.862, 0.806, 0.738, 0.655];
  for (let k = 0; k < niveis.length; k++) {
    const a = map(k, 0, niveis.length - 1, 145, 34);
    g.stroke(TINTA_MAR[0], TINTA_MAR[1], TINTA_MAR[2], a);
    g.strokeWeight(map(k, 0, niveis.length - 1, 1.1, 0.6));
    tracarIsolinha(g, alt, NIVEL_MAR * niveis[k]);
  }
}

// ------------------------------------------------------- curvas de nível ---

function desenharCurvasDeNivel(g) {
  let maxAlt = 0;
  for (let i = 0; i < alt.length; i++) if (alt[i] > maxAlt) maxAlt = alt[i];

  g.noFill();
  const passo = 0.030;
  let n = 0;
  for (let h = NIVEL_MAR + passo; h < maxAlt; h += passo, n++) {
    const mestra = n % 4 === 3;               // curva mestra a cada quatro
    g.stroke(TINTA[0], TINTA[1], TINTA[2], mestra ? 96 : 52);
    g.strokeWeight(mestra ? 1.0 : 0.62);
    tracarIsolinha(g, alt, h);
  }
}

// ----------------------------------------------------- pontilhado (relevo) --
// Sombreado a ponto, como numa gravura em metal. Os pontos vêm de um
// blue noise (melhor candidato de Mitchell): espalhados, nunca alinhados.

function desenharPontilhado(g) {
  const pts = blueNoise(96000, CW, CW, 8);
  g.noStroke();
  for (const [x, y] of pts) {
    const gi = ig(x + CX), gj = ig(y + CX);
    if (gi < 1 || gj < 1 || gi > GRID - 2 || gj > GRID - 2) continue;
    const h = amostra(alt, gi, gj);
    if (h <= NIVEL_MAR) continue;
    const s = amostra(sombra, gi, gj);
    if (random() > Math.pow(s, 1.55)) continue;
    const r = 0.42 + s * 0.62;
    g.fill(TINTA[0] + 18, TINTA[1] + 16, TINTA[2] + 14, 42 + s * 78);
    g.circle(CX + x, CX + y, r * 2);
  }
}

// Melhor candidato de Mitchell, acelerado por uma grade de baldes.
function blueNoise(n, w, h, k) {
  const pts = [];
  const cell = Math.sqrt((w * h) / n) * 2.0;
  const cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
  const baldes = new Array(cols * rows);
  for (let i = 0; i < baldes.length; i++) baldes[i] = [];

  for (let i = 0; i < n; i++) {
    let melhor = null, melhorD = -1;
    for (let c = 0; c < k; c++) {
      const cx = random(w), cy = random(h);
      const bx = Math.min(cols - 1, Math.floor(cx / cell));
      const by = Math.min(rows - 1, Math.floor(cy / cell));
      let d2 = 1e18;
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          const jx = bx + ox, jy = by + oy;
          if (jx < 0 || jy < 0 || jx >= cols || jy >= rows) continue;
          for (const p of baldes[jy * cols + jx]) {
            const dx = p[0] - cx, dy = p[1] - cy;
            const d = dx * dx + dy * dy;
            if (d < d2) d2 = d;
          }
        }
      }
      if (d2 > melhorD) { melhorD = d2; melhor = [cx, cy]; }
    }
    pts.push(melhor);
    const bx = Math.min(cols - 1, Math.floor(melhor[0] / cell));
    const by = Math.min(rows - 1, Math.floor(melhor[1] / cell));
    baldes[by * cols + bx].push(melhor);
  }
  return pts;
}

// ------------------------------------------------------------------ rios ---
//  Um rio não é um conjunto de células: é um caminho. Cada cabeceira é
//  seguida célula a célula, descendo pelo escoamento até o mar, e o traço
//  engrossa conforme a vazão acumulada — que é justamente o que faz a rede
//  aparecer ramificada sem que ninguém tenha desenhado uma ramificação.

function desenharRios(g) {
  const n = GRID * GRID;
  const limiar = max(22, areaTerra * 0.0016);

  const eRio = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if (alt[i] > NIVEL_MAR && fluxo[i] >= limiar) eRio[i] = 1;
  }
  // cabeceira: célula-rio que não recebe nenhuma outra célula-rio
  const temMontante = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if (eRio[i] && jusante[i] >= 0 && eRio[jusante[i]]) temMontante[jusante[i]] = 1;
  }

  g.noFill();
  g.strokeCap(ROUND);
  g.strokeJoin(ROUND);

  for (let c0 = 0; c0 < n; c0++) {
    if (!eRio[c0] || temMontante[c0]) continue;

    // segue o curso até o mar
    const caminho = [];
    let c = c0;
    for (let passos = 0; passos < GRID * 3; passos++) {
      caminho.push(c);
      const p = jusante[c];
      if (p < 0) break;
      c = p;
      if (alt[c] <= NIVEL_MAR) { caminho.push(c); break; }   // desaguou
    }
    if (caminho.length < 16) continue;   // arranhão de encosta, não é rio

    // Tira o rio da grade: um campo de deslocamento de ruído, aplicado em
    // função da posição, dá o meandro sem desmanchar as confluências —
    // dois cursos que se encontram são deslocados pelo mesmo valor.
    const xs = [], ys = [];
    for (const k of caminho) {
      const x = px(k % GRID), y = px((k / GRID) | 0);
      xs.push(x + (noise(x * 0.0075, y * 0.0075, 11.7) - 0.5) * MEANDRO);
      ys.push(y + (noise(x * 0.0075, y * 0.0075, 47.3) - 0.5) * MEANDRO);
    }
    for (let it = 0; it < 2; it++) {
      const nx = xs.slice(), ny = ys.slice();
      for (let k = 1; k < xs.length - 1; k++) {
        nx[k] = xs[k - 1] * 0.25 + xs[k] * 0.5 + xs[k + 1] * 0.25;
        ny[k] = ys[k - 1] * 0.25 + ys[k] * 0.5 + ys[k + 1] * 0.25;
      }
      for (let k = 0; k < xs.length; k++) { xs[k] = nx[k]; ys[k] = ny[k]; }
    }

    let pico = 0;
    for (const k of caminho) if (fluxo[k] > pico) pico = fluxo[k];
    if (pico < limiar * 2.2) continue;      // fio d'água, não entra na carta

    for (let k = 0; k < caminho.length - 1; k++) {
      const f = fluxo[caminho[k]];
      const t = Math.pow(Math.max(f, limiar) / limiar, 0.30);
      g.strokeWeight(constrain(t * 0.80, 0.75, 4.4));
      g.stroke(TINTA_MAR[0] - 10, TINTA_MAR[1] - 6, TINTA_MAR[2] + 4,
               constrain(130 + t * 34, 130, 232));
      g.line(xs[k], ys[k], xs[k + 1], ys[k + 1]);
    }
  }

  // contorno dos lagos
  const lago = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    lago[i] = alt[i] > NIVEL_MAR ? (cheio[i] - alt[i]) : 0;
  }
  g.noFill();
  g.stroke(TINTA_MAR[0], TINTA_MAR[1], TINTA_MAR[2], 200);
  g.strokeWeight(1.2);
  tracarIsolinha(g, lago, 0.0022);
}

// ----------------------------------------------------------------- costa ---

function desenharCosta(g) {
  g.noFill();
  g.strokeCap(ROUND);
  g.stroke(TINTA[0], TINTA[1], TINTA[2], 245);
  g.strokeWeight(2.6);
  tracarIsolinha(g, alt, NIVEL_MAR);
}

// ------------------------------------------------------------ topônimos ---
//  Os rótulos são colocados um a um e cada um reserva o retângulo que ocupa;
//  quem não couber sem encostar em outro simplesmente não é escrito. É o que
//  um cartógrafo faz à mão, e é o que impede a carta de virar um amontoado.

let rotulos = [];

function livre(x, y, w, h) {
  for (const r of rotulos) {
    if (x < r[0] + r[2] && x + w > r[0] && y < r[1] + r[3] && y + h > r[1]) return false;
  }
  return true;
}

function reservar(x, y, w, h) { rotulos.push([x, y, w, h]); }

// Escreve com um halo da cor do papel, para o texto não sumir no pontilhado.
function escrever(g, txt, x, y, alinhaX, cor, alpha) {
  g.textAlign(alinhaX, CENTER);
  g.noStroke();
  g.fill(PAPEL[0], PAPEL[1], PAPEL[2], 185);
  for (const [ox, oy] of [[-1.5, 0], [1.5, 0], [0, -1.5], [0, 1.5], [-1, -1], [1, 1]]) {
    g.text(txt, x + ox, y + oy);
  }
  g.fill(cor[0], cor[1], cor[2], alpha);
  g.text(txt, x, y);
}

function desenharToponimos(g) {
  rotulos = [];
  tituloIlha = null;

  // -- nome da ilha, em capitulares espaçadas sobre a massa de terra --------
  //    Vai primeiro e reserva o espaço: os demais rótulos desviam dele.
  let sx = 0, sy = 0, nTerra = 0;
  for (let j = 0; j < GRID; j++) {
    for (let i = 0; i < GRID; i++) {
      if (alt[j * GRID + i] > NIVEL_MAR) { sx += i; sy += j; nTerra++; }
    }
  }
  if (nTerra > 0) {
    g.push();
    g.textStyle(NORMAL);
    g.textSize(28);
    g.noStroke();
    const nome = nomeIlha.toUpperCase();
    let larg = 0;
    for (const ch of nome) larg += g.textWidth(ch) + 9;
    const cxn = px(sx / nTerra), cyn = px(sy / nTerra);
    reservar(cxn - larg / 2 - 10, cyn - 22, larg + 20, 44);
    tituloIlha = { nome, x: cxn, y: cyn };
    g.pop();
  }

  // -- povoados: terra baixa, junto ao mar ou a um rio de vazão razoável ----
  const cand = [];
  for (let j = 3; j < GRID - 3; j += 2) {
    for (let i = 3; i < GRID - 3; i += 2) {
      const c = j * GRID + i;
      const h = alt[c];
      if (h <= NIVEL_MAR || h > NIVEL_MAR + 0.10) continue;
      let costa = false;
      for (let d = -3; d <= 3; d += 3) {
        if (alt[c + d] <= NIVEL_MAR || alt[c + d * GRID] <= NIVEL_MAR) costa = true;
      }
      const rio = fluxo[c] > 400;
      if (!costa && !rio) continue;
      cand.push({ i, j, peso: (costa ? 1 : 0) + (rio ? 1.5 : 0) + random(0.9) });
    }
  }
  cand.sort((a, b) => b.peso - a.peso);

  g.textStyle(NORMAL);
  g.textSize(17);
  let postos = 0;
  for (const c of cand) {
    if (postos >= 8) break;
    const x = px(c.i), y = px(c.j);
    const nome = random(VILA) + palavra();
    const w = g.textWidth(nome);
    const paraDireita = x < CX + CW * 0.60;
    const rx = paraDireita ? x + 8 : x - 12 - w;
    if (!livre(rx - 4, y - 12, w + 8, 24)) continue;
    if (!livre(x - 9, y - 9, 18, 18)) continue;
    reservar(rx - 6, y - 13, w + 12, 26);
    reservar(x - 10, y - 10, 20, 20);
    postos++;

    g.noStroke();
    g.fill(PAPEL[0], PAPEL[1], PAPEL[2], 235);
    g.circle(x, y, 10);
    g.fill(TINTA[0], TINTA[1], TINTA[2], 240);
    g.circle(x, y, 5.5);
    escrever(g, nome, paraDireita ? x + 9 : x - 9, y, paraDireita ? LEFT : RIGHT, TINTA, 242);
  }

  // -- picos: máximos locais, com a cota em metros -------------------------
  const picos = [];
  for (let j = 6; j < GRID - 6; j += 3) {
    for (let i = 6; i < GRID - 6; i += 3) {
      const c = j * GRID + i;
      const h = alt[c];
      if (h < NIVEL_MAR + 0.20) continue;
      let ehMax = true;
      for (let dy = -6; dy <= 6 && ehMax; dy += 3) {
        for (let dx = -6; dx <= 6; dx += 3) {
          if (alt[c + dy * GRID + dx] > h) { ehMax = false; break; }
        }
      }
      if (ehMax) picos.push({ x: px(i), y: px(j), h });
    }
  }
  picos.sort((a, b) => b.h - a.h);

  g.textStyle(ITALIC);
  g.textSize(15);
  let feitos = 0;
  for (const p of picos) {
    if (feitos >= 3) break;
    const rotulo = random(RELEVO) + palavra() + '  ' + Math.round((p.h - NIVEL_MAR) * 2350);
    const w = g.textWidth(rotulo);
    if (!livre(p.x - w / 2 - 4, p.y - 10, w + 8, 36)) continue;
    reservar(p.x - w / 2 - 6, p.y - 12, w + 12, 40);
    feitos++;

    g.push();
    g.stroke(PAPEL[0], PAPEL[1], PAPEL[2], 200);
    g.strokeWeight(3.2);
    g.noFill();
    g.beginShape();
    g.vertex(p.x - 6, p.y + 4); g.vertex(p.x, p.y - 6); g.vertex(p.x + 6, p.y + 4);
    g.endShape(CLOSE);
    g.stroke(TINTA[0], TINTA[1], TINTA[2], 235);
    g.strokeWeight(1.5);
    g.beginShape();
    g.vertex(p.x - 6, p.y + 4); g.vertex(p.x, p.y - 6); g.vertex(p.x + 6, p.y + 4);
    g.endShape(CLOSE);
    g.pop();

    escrever(g, rotulo, p.x, p.y + 17, CENTER, TINTA, 228);
  }

  // -- acidentes do litoral, escritos no mar em itálico --------------------
  const litoral = [];
  for (let j = 4; j < GRID - 4; j += 2) {
    for (let i = 4; i < GRID - 4; i += 2) {
      const c = j * GRID + i;
      if (alt[c] > NIVEL_MAR) continue;
      if (alt[c] < NIVEL_MAR * 0.90) continue;
      let terra = 0;
      for (let d = -4; d <= 4; d += 4) {
        if (alt[c + d] > NIVEL_MAR) terra++;
        if (alt[c + d * GRID] > NIVEL_MAR) terra++;
      }
      if (terra >= 2) litoral.push({ x: px(i), y: px(j) });
    }
  }
  g.textSize(15);
  g.textStyle(ITALIC);
  let costeiros = 0;
  for (let k = 0; k < litoral.length && costeiros < 4; k++) {
    const p = random(litoral);
    const nome = random(COSTA) + palavra();
    const w = g.textWidth(nome);
    const dir = p.x < CX + CW * 0.5 ? -1 : 1;
    const tx = p.x + dir * 10;
    const rx = dir > 0 ? tx : tx - w;
    if (!livre(rx - 5, p.y - 12, w + 10, 24)) continue;
    reservar(rx - 8, p.y - 14, w + 16, 28);
    costeiros++;
    escrever(g, nome, tx, p.y, dir > 0 ? LEFT : RIGHT, TINTA_MAR, 225);
  }
  g.textStyle(NORMAL);

  // por último, o nome da ilha — com halo, sobre tudo o que já foi gravado
  if (tituloIlha) {
    g.textSize(28);
    g.noStroke();
    let cx = tituloIlha.x;
    let larg = 0;
    for (const ch of tituloIlha.nome) larg += g.textWidth(ch) + 9;
    larg -= 9;
    cx -= larg / 2;
    for (const ch of tituloIlha.nome) {
      g.fill(PAPEL[0], PAPEL[1], PAPEL[2], 130);
      for (const [ox, oy] of [[-2, 0], [2, 0], [0, -2], [0, 2]]) {
        g.textAlign(LEFT, CENTER);
        g.text(ch, cx + ox, tituloIlha.y + oy);
      }
      g.fill(TINTA[0], TINTA[1], TINTA[2], 108);
      g.textAlign(LEFT, CENTER);
      g.text(ch, cx, tituloIlha.y);
      cx += g.textWidth(ch) + 9;
    }
  }
}

// ------------------------------------------------------------- sondagens ---
// Números de profundidade espalhados pelo mar — mais cerrados junto à costa,
// como numa carta de verdade. O gesto que faz uma imagem virar carta náutica.

function desenharSondagens(g) {
  const pts = blueNoise(420, CW, CW, 6);
  g.noStroke();
  g.textStyle(NORMAL);
  g.textAlign(CENTER, CENTER);
  g.textSize(12);
  for (const [x, y] of pts) {
    const gi = ig(x + CX), gj = ig(y + CX);
    if (gi < 3 || gj < 3 || gi > GRID - 4 || gj > GRID - 4) continue;
    const h = amostra(alt, gi, gj);
    if (h > NIVEL_MAR * 0.985) continue;
    // perto da costa quase todas passam; em mar aberto, uma em cada quatro
    const raso = constrain(h / (NIVEL_MAR * 0.75), 0, 1);
    if (random() > 0.20 + 0.80 * raso) continue;
    if (!livre(x + CX - 12, y + CX - 9, 24, 18)) continue;
    const prof = Math.round((NIVEL_MAR - h) / NIVEL_MAR * 74 + random(-1.5, 1.5));
    if (prof < 1) continue;
    g.fill(TINTA_MAR[0], TINTA_MAR[1], TINTA_MAR[2], 150);
    g.text(prof, CX + x, CX + y);
  }
}

function textoEspacado(g, s, x, y, esp) {
  let larg = 0;
  for (const ch of s) larg += g.textWidth(ch) + esp;
  larg -= esp;
  let cx = x - larg / 2;
  g.textAlign(LEFT, CENTER);
  for (const ch of s) {
    g.text(ch, cx, y);
    cx += g.textWidth(ch) + esp;
  }
}

// ------------------------------------------------------------ linhas de rumo
//  As dezesseis direções da agulha, riscadas de ponta a ponta como nas cartas
//  portulanas — mas interrompidas em terra: rumo é coisa de quem navega.

function desenharRumos(g, canto) {
  const d = CW * 0.145;
  const [cx0, cy0] = pontoNoCanto(canto, d, d);
  const ox = cx0 + d / 2, oy = cy0 + d / 2;
  const alcance = CW * 1.6;

  g.strokeWeight(0.7);
  g.stroke(TINTA[0], TINTA[1], TINTA[2], 54);
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * TWO_PI;
    const dx = cos(a), dy = sin(a);
    let dentro = false, ax = 0, ay = 0;
    for (let t = d * 0.5; t < alcance; t += 5) {
      const x = ox + dx * t, y = oy + dy * t;
      const foraDaCarta = x < CX || y < CX || x > CX + CW || y > CX + CW;
      const gi = ig(x), gj = ig(y);
      const emTerra = !foraDaCarta &&
        amostra(alt, constrain(gi, 0, GRID - 2), constrain(gj, 0, GRID - 2)) > NIVEL_MAR * 0.97;
      const visivel = !foraDaCarta && !emTerra;
      if (visivel && !dentro) { dentro = true; ax = x; ay = y; }
      else if (!visivel && dentro) { dentro = false; g.line(ax, ay, x, y); }
    }
    if (dentro) g.line(ax, ay, ox + dx * alcance, oy + dy * alcance);
  }
}

// -------------------------------------------------------- rosa dos ventos --

function desenharRosaDosVentos(g, canto) {
  const d = CW * 0.145;
  const [cx, cy] = pontoNoCanto(canto, d, d);
  const x = cx + d / 2, y = cy + d / 2;
  const R = d * 0.42;
  reservar(cx - 6, cy - 22, d + 12, d + 28);

  g.push();
  g.translate(x, y);

  g.noFill();
  g.stroke(TINTA[0], TINTA[1], TINTA[2], 110);
  g.strokeWeight(0.9);
  g.circle(0, 0, R * 2);
  g.circle(0, 0, R * 1.62);

  // 16 rumos curtos
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * TWO_PI - HALF_PI;
    g.line(cos(a) * R * 0.81, sin(a) * R * 0.81, cos(a) * R, sin(a) * R);
  }

  // estrela de oito pontas, meia face clara e meia escura
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * TWO_PI - HALF_PI;
    const r = (k % 2 === 0) ? R * 0.80 : R * 0.46;
    const l = (a - PI / 8), n2 = (a + PI / 8);
    const rl = (k % 2 === 0) ? R * 0.46 : R * 0.80;
    g.noStroke();
    g.fill(TINTA[0], TINTA[1], TINTA[2], 215);
    g.triangle(0, 0, cos(a) * r, sin(a) * r, cos(l) * rl * 0.30, sin(l) * rl * 0.30);
    g.fill(TINTA[0], TINTA[1], TINTA[2], 90);
    g.triangle(0, 0, cos(a) * r, sin(a) * r, cos(n2) * rl * 0.30, sin(n2) * rl * 0.30);
  }

  // agulha do norte, em vermelho
  g.noStroke();
  g.fill(VERMELHO[0], VERMELHO[1], VERMELHO[2], 235);
  g.triangle(0, 0, 0, -R * 1.06, -R * 0.11, -R * 0.30);
  g.fill(VERMELHO[0] - 30, VERMELHO[1] - 20, VERMELHO[2] - 14, 235);
  g.triangle(0, 0, 0, -R * 1.06, R * 0.11, -R * 0.30);

  g.fill(TINTA[0], TINTA[1], TINTA[2], 230);
  g.textAlign(CENTER, CENTER);
  g.textSize(15);
  g.text('N', 0, -R * 1.28);
  g.pop();
}

// -------------------------------------------------------------- cartucho ---

function desenharCartucho(g, canto) {
  const w = CW * 0.415, h = CW * 0.175;
  const [x, y] = pontoNoCanto(canto, w, h);
  reservar(x - 6, y - 6, w + 12, h + 12);

  g.push();
  g.noStroke();
  g.fill(PAPEL[0], PAPEL[1], PAPEL[2], 216);
  g.rect(x, y, w, h);
  g.noFill();
  g.stroke(TINTA[0], TINTA[1], TINTA[2], 215);
  g.strokeWeight(1.7);
  g.rect(x, y, w, h);
  g.strokeWeight(0.7);
  g.rect(x + 6, y + 6, w - 12, h - 12);

  g.noStroke();
  g.textAlign(CENTER, TOP);
  g.fill(TINTA[0], TINTA[1], TINTA[2], 240);
  g.textSize(27);
  textoEspacado(g, nomeIlha.toUpperCase(), x + w / 2, y + 30, 5);

  g.textSize(13);
  g.textStyle(ITALIC);
  g.fill(TINTA[0], TINTA[1], TINTA[2], 185);
  g.textAlign(CENTER, TOP);
  g.text('levantada e gravada por João Galetti', x + w / 2, y + 50);
  g.textStyle(NORMAL);

  g.stroke(TINTA[0], TINTA[1], TINTA[2], 90);
  g.strokeWeight(0.8);
  g.line(x + w * 0.26, y + 76, x + w * 0.74, y + 76);
  g.noStroke();

  g.textSize(12);
  g.fill(TINTA[0], TINTA[1], TINTA[2], 168);
  g.textAlign(CENTER, TOP);
  const linhas = [
    'Relevo formado por ' + PASSOS + ' passos de erosão fluvial',
    'sobre ruído de Perlin de seis oitavas.',
    'Sondagens em braças.  Curvas de nível de 70 em 70 pés.',
    'Os rios não foram desenhados: foram encontrados.'
  ];
  for (let k = 0; k < linhas.length; k++) {
    g.text(linhas[k], x + w / 2, y + 88 + k * 17);
  }

  // escala gráfica
  const ex = x + w / 2 - w * 0.30, ey = y + h - 40, ew = w * 0.60, eh = 8;
  const seg = 6;
  for (let k = 0; k < seg; k++) {
    g.fill(k % 2 === 0 ? color(TINTA[0], TINTA[1], TINTA[2], 225)
                       : color(PAPEL[0], PAPEL[1], PAPEL[2], 225));
    g.noStroke();
    g.rect(ex + (ew / seg) * k, ey, ew / seg, eh);
  }
  g.noFill();
  g.stroke(TINTA[0], TINTA[1], TINTA[2], 225);
  g.strokeWeight(0.9);
  g.rect(ex, ey, ew, eh);
  g.noStroke();
  g.fill(TINTA[0], TINTA[1], TINTA[2], 200);
  g.textSize(11);
  g.textAlign(LEFT, TOP);
  g.text('0', ex - 2, ey + 12);
  g.textAlign(RIGHT, TOP);
  g.text('30 léguas', ex + ew + 2, ey + 12);

  g.textAlign(CENTER, BOTTOM);
  g.fill(VERMELHO[0], VERMELHO[1], VERMELHO[2], 200);
  g.textSize(11);
  g.text('semente ' + semente + '  ·  ' + PASSOS + ' passos de erosão',
         x + w / 2, y + h - 9);
  g.pop();
}

// Devolve o canto (0=SE,1=SO,2=NE,3=NO) com menos terra por baixo.
function pontoNoCanto(canto, w, h) {
  const m = CW * 0.028;
  const dir = [
    [CX + CW - w - m, CX + CW - h - m],   // 0 inferior direito
    [CX + m,          CX + CW - h - m],   // 1 inferior esquerdo
    [CX + CW - w - m, CX + m],            // 2 superior direito
    [CX + m,          CX + m]             // 3 superior esquerdo
  ];
  return dir[canto];
}

function melhorCanto(w, h, excluir) {
  let melhor = 0, melhorTerra = 1e9;
  for (let c = 0; c < 4; c++) {
    if (c === excluir) continue;
    const [x, y] = pontoNoCanto(c, w, h);
    let terra = 0, total = 0;
    for (let py = y; py < y + h; py += 9) {
      for (let pxx = x; pxx < x + w; pxx += 9) {
        const gi = ig(pxx), gj = ig(py);
        if (gi < 0 || gj < 0 || gi > GRID - 1 || gj > GRID - 1) continue;
        total++;
        if (amostra(alt, constrain(gi, 0, GRID - 2), constrain(gj, 0, GRID - 2)) > NIVEL_MAR) terra++;
      }
    }
    const f = total ? terra / total : 1;
    if (f < melhorTerra) { melhorTerra = f; melhor = c; }
  }
  return melhor;
}

// -------------------------------------------------------------- gratícula --

function desenharGraticula(g) {
  g.stroke(TINTA[0], TINTA[1], TINTA[2], 34);
  g.strokeWeight(0.7);
  g.drawingContext.setLineDash([2, 5]);
  for (let k = 1; k < 8; k++) {
    const p = CX + (CW / 8) * k;
    g.line(p, CX, p, CX + CW);
    g.line(CX, p, CX + CW, p);
  }
  g.drawingContext.setLineDash([]);
}

// ---------------------------------------------------------------- moldura --

function desenharMoldura(g) {
  // limpa a faixa entre a área cartografada e a borda
  g.noStroke();
  g.fill(PAPEL[0], PAPEL[1], PAPEL[2]);
  g.rect(0, 0, S, CX);
  g.rect(0, CX + CW, S, S - CX - CW);
  g.rect(0, 0, CX, S);
  g.rect(CX + CW, 0, S - CX - CW, S);

  // graduação: 32 divisões alternadas
  const div = 32;
  for (let k = 0; k < div; k++) {
    const a = CX + (CW / div) * k;
    const b = CW / div;
    g.fill(k % 2 === 0 ? color(TINTA[0], TINTA[1], TINTA[2], 235)
                       : color(PAPEL[0], PAPEL[1], PAPEL[2]));
    g.rect(a, CX - TICK + 6, b, TICK - 6);
    g.rect(a, CX + CW, b, TICK - 6);
    g.rect(CX - TICK + 6, a, TICK - 6, b);
    g.rect(CX + CW, a, TICK - 6, b);
  }

  g.noFill();
  g.stroke(TINTA[0], TINTA[1], TINTA[2], 235);
  g.strokeWeight(2.2);
  g.rect(OUT, OUT, S - 2 * OUT, S - 2 * OUT);
  g.strokeWeight(1.0);
  g.rect(CX - TICK + 6, CX - TICK + 6, CW + 2 * (TICK - 6), CW + 2 * (TICK - 6));
  g.strokeWeight(1.4);
  g.rect(CX, CX, CW, CW);

  // graus nas quatro margens
  g.noStroke();
  g.fill(TINTA[0], TINTA[1], TINTA[2], 190);
  g.textSize(12);
  g.textStyle(NORMAL);
  for (let k = 1; k < 8; k++) {
    const p = CX + (CW / 8) * k;
    const lat = (14 - k) + '°';
    const lon = (38 + k) + '°';
    g.textAlign(CENTER, BOTTOM);
    g.text(lon, p, CX - TICK + 3);
    g.textAlign(CENTER, TOP);
    g.text(lon, p, CX + CW + TICK - 3);
    g.push();
    g.translate(CX - TICK + 3, p); g.rotate(-HALF_PI);
    g.textAlign(CENTER, BOTTOM); g.text(lat, 0, 0);
    g.pop();
    g.push();
    g.translate(CX + CW + TICK - 3, p); g.rotate(HALF_PI);
    g.textAlign(CENTER, BOTTOM); g.text(lat, 0, 0);
    g.pop();
  }
}

// ------------------------------------------------------------ papel velho --

function envelhecerPapel(g) {
  const ctx = g.drawingContext;

  // manchas de umidade
  for (let k = 0; k < 5; k++) {
    const x = random(S), y = random(S), r = random(S * 0.10, S * 0.30);
    const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(150,116,70,0.10)');
    gr.addColorStop(0.7, 'rgba(150,116,70,0.045)');
    gr.addColorStop(1, 'rgba(150,116,70,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // vinheta: as bordas de uma folha antiga são sempre mais escuras
  const gv = ctx.createRadialGradient(S / 2, S / 2, S * 0.30, S / 2, S / 2, S * 0.78);
  gv.addColorStop(0, 'rgba(96,72,44,0)');
  gv.addColorStop(1, 'rgba(96,72,44,0.26)');
  ctx.fillStyle = gv;
  ctx.fillRect(0, 0, S, S);
}

// ------------------------------------------------------------- toponímia ---
// Sílabas portuguesas recombinadas: nomes que soam plausíveis sem existir.

const PRE = ['Al', 'Ar', 'Ba', 'Be', 'Bra', 'Ca', 'Ce', 'Co', 'Cor', 'Es', 'Fa',
             'Gua', 'La', 'Lo', 'Ma', 'Me', 'Mi', 'Mon', 'Na', 'Ne', 'Or', 'Pa',
             'Pe', 'Por', 'Que', 'Ra', 'Sa', 'Se', 'Si', 'Ta', 'Te', 'Tor', 'Va', 'Ve'];
const MEIO = ['bra', 'cal', 'cor', 'dei', 'gra', 'lha', 'lho', 'man', 'mar', 'men',
              'nha', 'ran', 'rim', 'ron', 'ser', 'tan', 'tim', 'tor', 'val', 'ven',
              'vir', 'zar', 'guei', 'lim', 'mes', 'pei', 'sil', 'tra', 'cei'];
const FIM = ['a', 'o', 'im', 'ana', 'ora', 'inha', 'oso', 'ela', 'ilha', 'onte',
             'arte', 'este', 'ordo', 'ida', 'uz', 'ez', 'ais', 'ões', 'edo', 'ura'];
const GENERO = ['Ilha de', 'Ilha do', 'Ilhas de', 'Terra de', 'Costa de'];
const VILA = ['', '', '', '', 'Porto ', 'Vila ', 'São ', 'Santa '];
const COSTA = ['Enseada de ', 'Angra de ', 'Ponta de ', 'Baía de ', 'Praia de ', 'Cabo '];
const RELEVO = ['Pico ', 'Monte ', 'Serra de ', 'Alto de '];

function palavra() {
  let s = random(PRE);
  const n = random() < 0.55 ? 1 : 2;
  for (let k = 0; k < n; k++) s += random(MEIO);
  s += random(FIM);
  return s;
}

function gerarNome() {
  return random(GENERO) + ' ' + palavra();
}



// Gancho de inspeção: usado apenas para gerar o thumbnail fora do navegador.
window.estado = () => ({ fase, semente, carta });
