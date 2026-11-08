// noprotect
/**
 * Cidade 3D otimizada
 * Requer p5.js >= 1.9 (usa buildGeometry com cores por vértice)
 *
 * Mouse: arrastar = girar | scroll = zoom | botão direito = mover
 * Duplo clique = gera uma nova cidade
 *
 * COMO FICOU LEVE: o draw() não desenha mais "peça por peça". A cidade inteira é
 * montada UMA vez (gerarCidade) e "assada" em poucos modelos estáticos, então o
 * custo por frame é de ~6 chamadas de desenho, não importa quantos prédios existam.
 */

// ================================================================ TAMANHO DA CIDADE

const CIDADE = {
  quarteiroesPorLado: 20,  // original: 4 (grade 4x4). Aumente aqui!
  espacamento: 280,       // distância entre os centros dos quarteirões
  chancePraca: 0.010,      // chance de um quarteirão ficar vazio
  densidadeFios: 0.7,     // 0 a 1: menos cabos e lâmpadas internas = cidade mais leve
};

// ================================================================ APARÊNCIA

const Y_CHAO = 300;
const PE_DIREITO = 65;
const SEGMENTOS_BEZIER = 6;  // suavidade dos fios das lâmpadas
const QUADS_POR_FORMA = 400; // o p5 copia cada forma com push(...dados): formas gigantes
                             // estouram o limite de argumentos do JavaScript (tela escura)

const COR_CABO = [55, 62, 75];
const COR_FIO_LAMPADA = [45, 52, 65];
const COR_MOLDURA = [40, 55, 75, 65];
const COR_VIDRO = [130, 180, 230, 35];
const COR_LAMPADA = [255, 250, 220, 255];
const COR_HALO_LAMPADA = [255, 190, 60, 95];
const COR_SINALIZADOR = [255, 45, 45, 255];
const COR_HALO_SINALIZADOR = [255, 20, 20, 125];

// ================================================================ ESTADO

let predios = [];
let geo = {};        // modelos prontos: cabos, fiosLampada, molduras, nucleos, halos, vidros
let escala = 1;      // quanto a cidade cresceu em relação à original (4x4)
let avisoErro = null; // mensagem na tela se a geração falhar

// ---------------------------------------------------------------- setup / eventos

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(min(2, displayDensity())); // telas 3x não precisam renderizar 3x
  configurarCamera();
  gerarCidadeSegura();
}

function doubleClicked() {
  gerarCidadeSegura();
}

// Se algo falhar ao gerar, mostra o motivo na tela em vez de deixá-la só escura
function gerarCidadeSegura() {
  try {
    gerarCidade();
    if (avisoErro) { avisoErro.remove(); avisoErro = null; }
  } catch (e) {
    console.error(e);
    if (avisoErro) avisoErro.remove();
    avisoErro = createP('Erro ao gerar a cidade: ' + e.message + ' (veja o console)');
    avisoErro.position(12, 8);
    avisoErro.style('color', '#ff6b6b');
    avisoErro.style('font-family', 'monospace');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  perspective(PI / 3, width / height, 20, distanciaMaxima());
}

function distanciaMaxima() {
  return 8000 + 6000 * escala;
}

// A câmera acompanha o tamanho da cidade (com 4 quarteirões fica igual ao original)
function configurarCamera() {
  const extensao = ((CIDADE.quarteiroesPorLado - 1) / 2) * CIDADE.espacamento;
  escala = extensao / 540;

  perspective(PI / 3, width / height, 20, distanciaMaxima());
  camera(0, -340 * escala, 1300 * escala, 0, -140, 0, 0, 1, 0);
}

// ---------------------------------------------------------------- geração

function gerarCidade() {
  const n = CIDADE.quarteiroesPorLado;
  const quarteiroes = Array.from(
    { length: n },
    (_, i) => (i - (n - 1) / 2) * CIDADE.espacamento
  );

  // Offsets relativos para agrupar módulos colados uns aos outros
  const vizinhancaOffsets = [
    [1, 0], [0, 1], [-1, 0], [0, -1],
    [1, 1], [-1, 1], [1, -1], [-1, -1],
  ];

  // Tudo o que é aleatório é coletado aqui e transformado em modelo no final
  const lote = {
    cabos: [],        // polilinhas: [x,y,z, x,y,z, ...]
    fiosLampada: [],
    nucleos: [],      // quads opacos: [12 coords, r,g,b,a]
    halos: [],        // quads translúcidos
    esferasNucleo: [],// [x,y,z, raio, r,g,b,a]
    esferasHalo: [],
  };

  predios = [];

  for (const qx of quarteiroes) {
    for (const qz of quarteiroes) {
      if (random() < CIDADE.chancePraca) continue; // praça / lote vazio

      // Porte da edificação (quantos módulos serão agrupados)
      const sorteioPorte = random();
      let qtdModulos, andaresPrincipal, eArranhaCeu;

      if (sorteioPorte < 0.30) {
        qtdModulos = 1;
        andaresPrincipal = int(random(6, 13));
        eArranhaCeu = false;
      } else if (sorteioPorte < 0.70) {
        qtdModulos = int(random(2, 4));
        andaresPrincipal = int(random(12, 18));
        eArranhaCeu = false;
      } else {
        qtdModulos = int(random(4, 7));
        andaresPrincipal = int(random(22, 30));
        eArranhaCeu = true;
      }

      const larguraModulo = random(65, 92);
      const passoEncaixe = larguraModulo * 0.96;
      const direcoes = shuffle(vizinhancaOffsets.slice());

      for (let m = 0; m < qtdModulos; m++) {
        let dx = 0;
        let dz = 0;
        let andaresModulo = andaresPrincipal;
        let recebeLuzVermelha = false;

        if (m === 0) {
          // Torre principal: só o topo dos arranha-céus leva sinalizador
          recebeLuzVermelha = eArranhaCeu;
        } else {
          // Módulos anexos, iguais ou mais baixos que a torre
          dx = direcoes[m - 1][0] * passoEncaixe;
          dz = direcoes[m - 1][1] * passoEncaixe;
          andaresModulo = max(5, andaresPrincipal - int(random(2, 9)));
        }

        const p = new Predio(qx + dx, qz + dz, larguraModulo, andaresModulo, recebeLuzVermelha);
        p.gerarDetalhes(lote);
        predios.push(p);
      }
    }
  }

  construirGeometrias(lote);
}

// =========================================================
// PRÉDIO (unidade modular). Só guarda dados; não desenha nada.
// =========================================================
class Predio {
  constructor(x, z, largura, numAndares, temSinalizador) {
    this.x = x;
    this.z = z;
    this.largura = largura;
    this.numAndares = numAndares;
    this.alturaTotal = numAndares * PE_DIREITO;
    this.temSinalizador = temSinalizador;
    this.alturaCaboTopo = temSinalizador ? random(45, 75) : 0;
  }

  // Sorteia cabos, lâmpadas e TVs e os joga direto nas listas do lote
  gerarDetalhes(lote) {
    const { x, z, numAndares, alturaTotal } = this;
    const metade = this.largura / 2;
    const dens = CIDADE.densidadeFios;

    // 1. CONDUÍTE CENTRAL: cabos torcidos do chão ao teto
    //    (1 vértice por andar; a torção é compensada para manter o mesmo aspecto)
    const qtdCabos = round(int(random(4, 8)) * dens);
    const semente = random(1000);

    for (let c = 0; c < qtdCabos; c++) {
      const pts = [];
      const anguloInicial = random(TWO_PI);
      const raioTorcao = random(3, 9);
      const velTorcao = random(0.30, 0.70);

      for (let i = 0; i <= numAndares; i++) {
        const t = i / numAndares;
        const angulo = anguloInicial + i * velTorcao;
        const ruidoX = (noise(semente + c, i * 0.2) - 0.5) * 10;
        const ruidoZ = (noise(semente + c + 50, i * 0.2) - 0.5) * 10;

        let lx = cos(angulo) * raioTorcao + ruidoX;
        let lz = sin(angulo) * raioTorcao + ruidoZ;
        if (i === numAndares) { lx = 0; lz = 0; } // todos convergem no topo

        pts.push(x + lx, Y_CHAO - t * alturaTotal, z + lz);
      }
      lote.cabos.push(pts);
    }

    // 2. ANDARES: lâmpadas (fios horizontais) e TVs
    for (let andar = 1; andar <= numAndares; andar++) {
      const yPlano = Y_CHAO - andar * PE_DIREITO;

      if (random() > 0.20 && random() < dens) {
        const qtdLuzes = int(random(1, 4));
        for (let l = 0; l < qtdLuzes; l++) {
          const ox = x + random(-3, 3);
          const oz = z + random(-3, 3);
          const dx = x + random(-metade * 0.8, metade * 0.8);
          const dz = z + random(-metade * 0.8, metade * 0.8);

          const desvio = random(14, 30);
          const c1x = lerp(ox, dx, 0.33) + random(-desvio, desvio);
          const c1z = lerp(oz, dz, 0.33) + random(-desvio, desvio);
          const c2x = lerp(ox, dx, 0.66) + random(-desvio, desvio);
          const c2z = lerp(oz, dz, 0.66) + random(-desvio, desvio);

          // Curva de Bézier (só no plano horizontal) amostrada em segmentos
          const pts = [];
          for (let s = 0; s <= SEGMENTOS_BEZIER; s++) {
            const t = s / SEGMENTOS_BEZIER;
            pts.push(bezier3(ox, c1x, c2x, dx, t), yPlano, bezier3(oz, c1z, c2z, dz, t));
          }
          lote.fiosLampada.push(pts);

          lote.nucleos.push(quadHorizontal(dx, yPlano, dz, 3.75, COR_LAMPADA));
          lote.halos.push(quadHorizontal(dx, yPlano + 0.5, dz, 8, COR_HALO_LAMPADA));
        }
      }

      if (random() > 0.35) {
        const qtdTVs = int(random(1, 3));
        for (let t = 0; t < qtdTVs; t++) {
          const tvW = random(8, 22);
          const tvH = tvW * random(0.55, 0.68);
          const recuo = metade * 0.92;

          let px, pz, aoLongoDeZ;
          if (random() < 0.5) {
            px = x + random([-recuo, recuo]);
            pz = z + random(-metade * 0.7, metade * 0.7);
            aoLongoDeZ = true;
          } else {
            pz = z + random([-recuo, recuo]);
            px = x + random(-metade * 0.7, metade * 0.7);
            aoLongoDeZ = false;
          }
          const py = yPlano + PE_DIREITO * 0.45 + random(-3, 3);

          const brilho = random(160, 255);
          const opacidadeHalo = random(55, 110);

          lote.nucleos.push(quadTV(px, py, pz, tvW, tvH, aoLongoDeZ, [brilho * 0.6, brilho * 0.95, 255, 255]));
          lote.halos.push(quadTV(px, py, pz, tvW * 1.45, tvH * 1.45, aoLongoDeZ, [0, 210, 255, opacidadeHalo]));
        }
      }
    }

    // 3. SINALIZADOR VERMELHO (só na torre principal dos arranha-céus)
    if (this.temSinalizador) {
      const yTopo = Y_CHAO - alturaTotal;
      const yPonta = yTopo - this.alturaCaboTopo;

      lote.cabos.push([
        x, yTopo, z,
        x + 1.2, yTopo - this.alturaCaboTopo * 0.5, z - 1.2,
        x, yPonta, z,
      ]);
      lote.esferasNucleo.push([x, yPonta, z, 5.2, ...COR_SINALIZADOR]);
      lote.esferasHalo.push([x, yPonta, z, 14, ...COR_HALO_SINALIZADOR]);
    }
  }
}

// ---------------------------------------------------------------- helpers de geometria

function bezier3(a, b, c, d, t) {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
}

// Quadrado deitado (plano XZ) centrado em (cx, cy, cz)
function quadHorizontal(cx, cy, cz, semi, cor) {
  return [
    cx - semi, cy, cz - semi,
    cx + semi, cy, cz - semi,
    cx + semi, cy, cz + semi,
    cx - semi, cy, cz + semi,
    ...cor,
  ];
}

// Retângulo em pé: no plano ZY (aoLongoDeZ) ou no plano XY
function quadTV(px, py, pz, w, h, aoLongoDeZ, cor) {
  const a = w / 2;
  const b = h / 2;
  return aoLongoDeZ
    ? [px, py - b, pz - a, px, py - b, pz + a, px, py + b, pz + a, px, py + b, pz - a, ...cor]
    : [px - a, py - b, pz, px + a, py - b, pz, px + a, py + b, pz, px - a, py + b, pz, ...cor];
}

// ---------------------------------------------------------------- construção dos modelos

function construirGeometrias(lote) {
  for (const g of Object.values(geo)) if (g) freeGeometry(g);

  geo = {
    cabos: construirLinhas(lote.cabos, COR_CABO),
    fiosLampada: construirLinhas(lote.fiosLampada, COR_FIO_LAMPADA),
    molduras: construirMolduras(),
    nucleos: construirSuperficies(lote.nucleos, lote.esferasNucleo),
    halos: construirSuperficies(lote.halos, lote.esferasHalo),
    vidros: construirVidros(),
  };
}

// Várias polilinhas -> um único modelo de linhas
function construirLinhas(polilinhas, cor) {
  if (polilinhas.length === 0) return null;

  return buildGeometry(() => {
    noFill();
    stroke(...cor);
    for (const pts of polilinhas) {
      beginShape();
      for (let i = 0; i < pts.length; i += 3) vertex(pts[i], pts[i + 1], pts[i + 2]);
      endShape();
    }
  });
}

// Um anel por andar (substitui o contorno de cada vidraça)
function construirMolduras() {
  if (predios.length === 0) return null;

  return buildGeometry(() => {
    noFill();
    stroke(...COR_MOLDURA);
    for (const p of predios) {
      const m = p.largura / 2;
      for (let andar = 1; andar <= p.numAndares; andar++) {
        const y = Y_CHAO - andar * PE_DIREITO;
        beginShape();
        vertex(p.x - m, y, p.z - m);
        vertex(p.x + m, y, p.z - m);
        vertex(p.x + m, y, p.z + m);
        vertex(p.x - m, y, p.z + m);
        vertex(p.x - m, y, p.z - m);
        endShape();
      }
    }
  });
}

// Quads e esferas coloridos (cada um com a sua cor) -> um único modelo
function construirSuperficies(quads, esferas) {
  if (quads.length === 0 && esferas.length === 0) return null;

  return buildGeometry(() => {
    noStroke();

    // Em lotes de QUADS_POR_FORMA quads: uma forma única com dezenas de milhares
    // de vértices faz o p5 estourar o limite de argumentos do JavaScript
    for (let i = 0; i < quads.length; i += QUADS_POR_FORMA) {
      const fim = min(i + QUADS_POR_FORMA, quads.length);
      beginShape(TRIANGLES);
      for (let k = i; k < fim; k++) {
        const q = quads[k];
        fill(q[12], q[13], q[14], q[15]);
        vertex(q[0], q[1], q[2]);
        vertex(q[3], q[4], q[5]);
        vertex(q[6], q[7], q[8]);
        vertex(q[0], q[1], q[2]);
        vertex(q[6], q[7], q[8]);
        vertex(q[9], q[10], q[11]);
      }
      endShape();
    }

    for (const [x, y, z, raio, r, g, b, a] of esferas) {
      push();
      translate(x, y, z);
      fill(r, g, b, a);
      sphere(raio, 12, 12);
      pop();
    }
  });
}

// Todas as vidraças de todos os prédios em um só modelo (com normais para a luz)
function construirVidros() {
  if (predios.length === 0) return null;

  return buildGeometry(() => {
    noStroke();
    fill(...COR_VIDRO);

    const meiaAlt = (PE_DIREITO * 0.82) / 2;

    for (const p of predios) {
      const m = p.largura / 2;
      const meiaLarg = p.largura * 0.48;

      beginShape(TRIANGLES); // uma forma por prédio (pequena e segura)
      for (let andar = 1; andar <= p.numAndares; andar++) {
        const yc = Y_CHAO - andar * PE_DIREITO + PE_DIREITO / 2;
        const y0 = yc - meiaAlt;
        const y1 = yc + meiaAlt;

        vidracaZ(p.x, p.z + m, meiaLarg, y0, y1, 1);
        vidracaZ(p.x, p.z - m, meiaLarg, y0, y1, -1);
        vidracaX(p.x + m, p.z, meiaLarg, y0, y1, 1);
        vidracaX(p.x - m, p.z, meiaLarg, y0, y1, -1);
      }
      endShape();
    }
  });
}

// Vidraça em z fixo (parede frontal/traseira)
function vidracaZ(cx, z, meiaLarg, y0, y1, nz) {
  normal(0, 0, nz);
  vertex(cx - meiaLarg, y0, z);
  vertex(cx + meiaLarg, y0, z);
  vertex(cx + meiaLarg, y1, z);
  vertex(cx - meiaLarg, y0, z);
  vertex(cx + meiaLarg, y1, z);
  vertex(cx - meiaLarg, y1, z);
}

// Vidraça em x fixo (paredes laterais)
function vidracaX(x, cz, meiaLarg, y0, y1, nx) {
  normal(nx, 0, 0);
  vertex(x, y0, cz - meiaLarg);
  vertex(x, y0, cz + meiaLarg);
  vertex(x, y1, cz + meiaLarg);
  vertex(x, y0, cz - meiaLarg);
  vertex(x, y1, cz + meiaLarg);
  vertex(x, y1, cz - meiaLarg);
}

// ---------------------------------------------------------------- desenho

function draw() {
  background(5, 5, 8);
  orbitControl();

  try {
    desenharCidade();
  } finally {
    drawingContext.depthMask(true); // sem isso, uma falha deixaria a tela sem limpar a profundidade
  }
}

function desenharCidade() {
  // PASSO 1: opacos. Sem luzes: fios e núcleos já têm cor própria (emissivos)
  noFill();
  stroke(...COR_CABO);
  strokeWeight(1.8);
  desenhar(geo.cabos);

  stroke(...COR_FIO_LAMPADA);
  strokeWeight(1.3);
  desenhar(geo.fiosLampada);

  fill(255);
  noStroke();
  desenhar(geo.nucleos);

  // PASSO 2: translúcidos (halos e vidraças), sem escrever profundidade
  iniciarPassoTranslucido();

  fill(255, 255, 255, 200);
  desenhar(geo.halos);

  // Só as vidraças recebem iluminação
  ambientLight(35, 40, 55);
  pointLight(255, 210, 140, 0, -350 * escala, 0);
  pointLight(80, 180, 255, 450 * escala, -550 * escala, 450 * escala);

  fill(...COR_VIDRO);
  specularMaterial(180, 220, 255);
  shininess(120);
  desenhar(geo.vidros);

  noFill();
  stroke(...COR_MOLDURA);
  strokeWeight(0.8);
  desenhar(geo.molduras);
}

function desenhar(modelo) {
  if (modelo) model(modelo);
}

// O p5 pode religar a escrita de profundidade ao trocar para o modo translúcido.
// Este desenho invisível (fora da tela) força essa troca ANTES de a desligarmos.
function iniciarPassoTranslucido() {
  push();
  noStroke();
  fill(0, 0, 0, 1);
  translate(0, 1e5, 0);
  plane(1);
  pop();
  drawingContext.depthMask(false);
}