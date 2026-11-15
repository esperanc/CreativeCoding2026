/**
 * PROJETO FINAL - PARTE 1: O Livro Monstruoso dos Monstros
 * Curta de animação estilo Pixar/Disney controlado por linha do tempo (millis).
 * 
 * Todas as correções e parâmetros ajustáveis estão marcados com:
 * // [CORREÇÃO / AJUSTE #...]
 */

// =========================================================================
// PAINEL DE AJUSTES RÁPIDOS (Mude estes números se quiser ajustar algo!)
// =========================================================================

// [AJUSTE #6] Velocidade e força da tremida de raiva (Ato 4):
const VEL_TREMIDA = 48.0;       // Antes era 95 (rápido demais) e depois 24 (lento demais). 48 é o meio-termo!
const FORCA_TREMIDA_X = 4.8;    // Amplitude horizontal da tremida em pixels
const FORCA_TREMIDA_Y = 3.6;    // Amplitude vertical da tremida em pixels

// [AJUSTE #1] Comprimento, largura e velocidade da língua do monstro:
const COMP_MAX_LINGUA = 105;    // Comprimento máximo da língua para fora da boca lateral
const LARG_MAX_LINGUA = 22;     // Largura da língua na base
const VEL_ONDULACAO_LINGUA = 6.5; // Velocidade com que a língua serpenteia

// [AJUSTE #5] Movimento dos dentinhos quando o livro está aberto (Ato 5):
const VEL_DENTES_ABERTO = 6.0;  // Velocidade do movimento dos dentinhos nas bordas abertas
const AMP_DENTES_ABERTO = 3.2;  // O quanto cada dentinho mexe (em pixels) quando o livro está aberto

// [AJUSTE #7 - Anterior] Tamanho e posição recuada dos 8 olhos de aranha (longe das fivelas):
// Para aumentar ou diminuir todos os olhos de uma vez, mude FATOR_TAM_OLHOS (ex: 1.0, 1.15, 0.9)
const FATOR_TAM_OLHOS = 1.0;

// Dimensões base do livro
const LIVRO_W = 260;
const LIVRO_H = 340;
const ESPESSURA_LIVRO = 52;

// [AJUSTE #3 e #7] Posição das 2 fivelas na lateral (topo e base) e dos 8 olhos recuados para trás (bx <= 18)
const POS_Y_FIVELAS = [-122, 122];

const OLHOS_ARANHA = [
  // Fileira dianteira do domo ocular (Olhos principais grandes, virados para a lateral)
  { bx:  16, by: -36, r: 58 * FATOR_TAM_OLHOS, altDomo: 40, incl: -0.15 }, // 0: Principal Superior
  { bx:  16, by:  36, r: 58 * FATOR_TAM_OLHOS, altDomo: 40, incl:  0.15 }, // 1: Principal Inferior
  { bx:   8, by: -96, r: 42 * FATOR_TAM_OLHOS, altDomo: 30, incl: -0.25 }, // 2: Lateral Superior
  { bx:   8, by:  96, r: 42 * FATOR_TAM_OLHOS, altDomo: 30, incl:  0.25 }, // 3: Lateral Inferior
  // Fileira traseira do domo ocular (Mais para trás na capa)
  { bx: -36, by: -54, r: 36 * FATOR_TAM_OLHOS, altDomo: 42, incl: -0.12 }, // 4: Médio Superior
  { bx: -36, by:  54, r: 36 * FATOR_TAM_OLHOS, altDomo: 42, incl:  0.12 }, // 5: Médio Inferior
  { bx: -46, by: -104, r: 28 * FATOR_TAM_OLHOS, altDomo: 30, incl: -0.28 }, // 6: Externo Superior
  { bx: -46, by:  104, r: 28 * FATOR_TAM_OLHOS, altDomo: 30, incl:  0.28 }  // 7: Externo Inferior
];

let poeira = [];
let pelosBorda = [];
let pelosCapa = [];
let faiscas = [];
let tempoInicio = 0;

function setup() {
  createCanvas(960, 640);
  tempoInicio = millis();

  // 1. Partículas de poeira mágica flutuando na luz
  for (let i = 0; i < 55; i++) {
    poeira.push({
      x: random(width),
      y: random(height),
      r: random(1.5, 4.0),
      velY: random(-0.35, -0.12),
      fase: random(TWO_PI),
      brilho: random(90, 210)
    });
  }

  // 2. [AJUSTE ANTERIOR - Pelos da 2ª versão] Pelagem orgânica para o perímetro da capa fechada
  let qtdBorda = 84;
  for (let i = 0; i < qtdBorda; i++) {
    let ang = map(i, 0, qtdBorda, 0, TWO_PI);
    pelosBorda.push({
      ang: ang,
      comp: random(22, 35),
      larg: random(11, 18),
      curva: random(-0.28, 0.28),
      tom: random(-14, 18),
      fase: random(TWO_PI)
    });
  }

  // 3. [AJUSTE ANTERIOR - Pelos da 2ª versão] Cerdas preenchidas cobrindo toda a superfície da capa
  for (let by = -LIVRO_H * 0.46; by <= LIVRO_H * 0.46; by += 17) {
    for (let bx = -LIVRO_W * 0.45; bx <= LIVRO_W * 0.44; bx += 18) {
      let jx = bx + random(-6, 6);
      let jy = by + random(-6, 6);
      let angPelo = atan2(jy, jx + 10) + random(-0.22, 0.22);
      pelosCapa.push({
        bx: jx,
        by: jy,
        bz: alturaRelevoCapa(jx, jy),
        ang: angPelo,
        comp: random(22, 33),
        larg: random(9, 15),
        tom: random(-15, 20),
        fase: random(TWO_PI)
      });
    }
  }
}

function mousePressed() {
  // Clique na tela reinicia o curta do zero
  tempoInicio = millis();
  faiscas = [];
}

function draw() {
  let t = (millis() - tempoInicio) / 1000.0;

  // [AJUSTE ANTERIOR - Transição de Câmera]
  // camPitch = 0.0 -> Visão na altura da mesa olhando a BORDA LATERAL (0s a 4.2s)
  // camPitch = 1.0 -> Visão de Cima (sobe suavemente entre 4.2s e 7.8s)
  let camPitch = 0.0;
  if (t >= 4.2 && t < 7.8) {
    camPitch = easeInOutCubic(constrain((t - 4.2) / 3.6, 0, 1));
  } else if (t >= 7.8) {
    camPitch = 1.0;
  }

  // Zoom suave no final do Ato 5 em direção à página com a moldura mágica
  let camZoom = 1.0;
  let camOffX = 0;
  let camOffY = 0;
  if (t > 32.5) {
    let pZ = easeInOutCubic(constrain((t - 32.5) / 3.5, 0, 1));
    camZoom = lerp(1.0, 1.28, pZ);
    camOffX = lerp(0, -50, pZ);
    camOffY = lerp(0, -10, pZ);
  }

  push();
  translate(width / 2, height / 2);
  scale(camZoom);
  translate(-width / 2 + camOffX, -height / 2 + camOffY);

  // 1. Cenário: Mesa de mogno de Hogwarts
  desenharCenarioMesa(t, camPitch);

  // 2. Renderização por Atos (Atos 1 a 4 até 24.5s; Ato 5 abrindo a partir de 24.5s)
  if (t < 24.5) {
    cenaLivroMonstruoso3D(t, camPitch);
  } else {
    cenaLivroAbrindoDisney(t);
  }

  // 3. Faíscas das fivelas e poeira mágica
  atualizarDesenharFaiscas();
  desenharPoeiraMagica(t);

  pop();

  // 4. Vinheta cinematográfica e barra de progresso
  desenharVinhetaHUD(t);
}

// =========================================================================
// PROJEÇÃO 3D, RELEVO DO DOMO OCULAR E CURVAS MATEMÁTICAS
// =========================================================================

// [AJUSTE ANTERIOR] Elevação onde ficam os olhos acima do nível plano do resto do livro
function alturaRelevoCapa(bx, by) {
  let nivelPlano = ESPESSURA_LIVRO * 0.5; // +26
  let dx = (bx + 10) / 76;
  let dy = by / 128;
  let d2 = dx * dx + dy * dy;
  let elevacaoDomo = 0;
  if (d2 < 1.0) {
    elevacaoDomo = pow(1.0 - d2, 1.5) * 40;
  }
  return nivelPlano + elevacaoDomo;
}

function proj3D(bx, by, bz, camPitch) {
  let yaw = lerp(1.36, 0.0, camPitch);       // +78° (frente para a borda lateral) -> 0° (topo)
  let elev = lerp(0.17, HALF_PI, camPitch);  // 10° (altura da mesa) -> 90° (visão de cima)

  let rx = bx * cos(yaw) - by * sin(yaw);
  let ry = bx * sin(yaw) + by * cos(yaw);

  return {
    x: rx,
    y: ry * sin(elev) - bz * cos(elev)
  };
}

// Curva de Bézier matemática usando apenas vertex() para nunca dar erro no p5front
function curvaMat(x0, y0, cx1, cy1, cx2, cy2, x3, y3, passos = 10) {
  for (let i = 1; i <= passos; i++) {
    let u = i / passos;
    let inv = 1 - u;
    let x = inv * inv * inv * x0 +
            3 * inv * inv * u * cx1 +
            3 * inv * u * u * cx2 +
            u * u * u * x3;
    let y = inv * inv * inv * y0 +
            3 * inv * inv * u * cy1 +
            3 * inv * u * u * cy2 +
            u * u * u * y3;
    vertex(x, y);
  }
}

function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - pow(-2 * x + 2, 3) / 2;
}

function easeOutBack(x) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * pow(x - 1, 3) + c1 * pow(x - 1, 2);
}

// =========================================================================
// 1. CENÁRIO: MESA DE MADEIRA COM PERSPECTIVA LATERAL -> TOPO
// =========================================================================

function desenharCenarioMesa(t, camPitch) {
  background(14, 7, 6);
  let ctx = drawingContext;

  let horizonteY = lerp(height * 0.44, -120, camPitch);

  if (horizonteY > 0) {
    let gradParede = ctx.createLinearGradient(0, 0, 0, horizonteY);
    gradParede.addColorStop(0, "rgb(10, 5, 6)");
    gradParede.addColorStop(1, "rgb(34, 16, 12)");
    ctx.fillStyle = gradParede;
    noStroke();
    rect(0, 0, width, horizonteY + 10);

    stroke(18, 9, 7, 120);
    strokeWeight(2);
    for (let y = 0; y < horizonteY; y += 54) {
      line(0, y, width, y);
      let off = (floor(y / 54) % 2) * 65;
      for (let x = off; x < width; x += 130) {
        line(x, y, x, min(y + 54, horizonteY));
      }
    }
  }

  let topoMesa = max(0, horizonteY);
  let pulso = sin(t * 2.5) * 12;
  let luzY = lerp(height * 0.66, height * 0.5, camPitch);

  let gradMesa = ctx.createRadialGradient(
    width * 0.5, luzY, 20,
    width * 0.5, luzY, 540 + pulso
  );
  gradMesa.addColorStop(0, "rgb(88, 46, 26)");
  gradMesa.addColorStop(0.55, "rgb(45, 22, 13)");
  gradMesa.addColorStop(1, "rgb(16, 8, 5)");
  ctx.fillStyle = gradMesa;
  noStroke();
  rect(0, topoMesa, width, height - topoMesa);

  if (horizonteY > 0) {
    stroke(110, 62, 36, 150);
    strokeWeight(3);
    line(0, horizonteY, width, horizonteY);
  }

  let espTabua = lerp(55, 135, camPitch);
  stroke(20, 9, 5, 150);
  strokeWeight(2.5);
  for (let y = topoMesa + espTabua * 0.6; y < height; y += espTabua) {
    line(0, y, width, y);
    stroke(120, 68, 40, 32);
    line(0, y + 2, width, y + 2);
    stroke(20, 9, 5, 150);
  }
  noStroke();
}

// =========================================================================
// 2. ATOS 1 A 4: O LIVRO MONSTRUOSO (LINHA DO TEMPO E EXPRESSÕES)
// =========================================================================

function cenaLivroMonstruoso3D(t, camPitch) {
  let cx = width * 0.5;
  let cy = lerp(height * 0.65, height * 0.51, camPitch);

  let moveX = 0;
  let moveY = 0;
  let rotLivro = 0;
  let aberturaBoca = 0.0;
  let extensaoLingua = 0.0;
  let tensaoFivelas = 0.0;
  let fivelasSoltas = 0.0;
  let ericarPelos = 0.0;
  let aberturaOlhos = [0, 0, 0, 0, 0, 0, 0, 0];

  let olharFrente = 4.5;
  let olharLateral = 0.0;
  let raivaPalpebra = 0.0;
  let contracaoPupila = 1.0;

  // -----------------------------------------------------------------------
  // ATO 1 (0.0s - 4.2s): CÂMERA NA BORDA LATERAL - Dormindo e Amarrado
  // -----------------------------------------------------------------------
  if (t < 4.2) {
    let resp = sin(t * 2.2);
    aberturaBoca = map(resp, -1, 1, 0.0, 0.05);
    tensaoFivelas = map(resp, -1, 1, 0.0, 0.12);
    moveY = -resp * 2.0;
  }
  // -----------------------------------------------------------------------
  // ATO 2 (4.2s - 7.8s): SUBIDA DA CÂMERA PARA A VISÃO DE CIMA
  // -----------------------------------------------------------------------
  else if (t < 7.8) {
    let resp = sin(t * 2.4);
    aberturaBoca = map(resp, -1, 1, 0.0, 0.04);
  }
  // -----------------------------------------------------------------------
  // ATO 3 (7.8s - 16.0s): [AJUSTE ANTERIOR] ABRE PAR POR PAR -> OLHA LADOS -> ENCARA CÂMERA
  // -----------------------------------------------------------------------
  else if (t < 16.0) {
    let tAto3 = t - 7.8;

    // 1) 7.8s a 11.0s (3.2s): Abre os 8 olhos devagar, de par em par
    for (let i = 0; i < 8; i++) {
      let atraso = floor(i / 2) * 0.65;
      let u = constrain((tAto3 - atraso) / 0.75, 0, 1);
      aberturaOlhos[i] = constrain(easeOutBack(u), 0, 1);
    }

    if (tAto3 < 3.2) {
      olharFrente = 5.0;
      olharLateral = 0.0;
    }
    // 2) 11.0s a 13.8s (2.8s): Olha para um lado e depois para o outro
    else if (tAto3 < 6.0) {
      let tLados = tAto3 - 3.2; // 0 a 2.8s
      olharFrente = lerp(5.0, 2.5, tLados / 2.8);
      olharLateral = sin((tLados / 2.8) * TWO_PI) * 10.5;

      // Piscada natural no meio da olhada
      if (tAto3 > 4.45 && tAto3 < 4.65) {
        for (let i = 0; i < 8; i++) aberturaOlhos[i] = 0.08;
      }
    }
    // 3) 13.8s a 16.0s (2.2s): PARA E ENCARA DIRETAMENTE A CÂMERA (O ESPECTADOR)!
    else {
      let tEncara = tAto3 - 6.0; // 0 a 2.2s
      let pEncara = easeInOutCubic(constrain(tEncara / 0.55, 0, 1));

      olharFrente = lerp(2.5, 0.0, pEncara);
      olharLateral = 0.0;

      // Contrai a pupila e fecha parcialmente a pálpebra com expressão de raiva
      contracaoPupila = lerp(1.0, 0.65, pEncara);
      raivaPalpebra = easeInOutCubic(constrain((tEncara - 0.35) / 1.1, 0, 1));
      ericarPelos = raivaPalpebra * 0.65;

      // Começa a tremer de estresse por estarmos encarando ele
      if (tEncara > 1.3) {
        let pEstresse = (tEncara - 1.3) / 0.9;
        moveX = sin(t * VEL_TREMIDA) * (FORCA_TREMIDA_X * 0.6) * pEstresse;
        moveY = cos(t * (VEL_TREMIDA * 0.9)) * (FORCA_TREMIDA_Y * 0.6) * pEstresse;
        aberturaBoca = pEstresse * 0.22;
        extensaoLingua = pEstresse * 0.45;
      }
    }
  }
  // -----------------------------------------------------------------------
  // ATO 4 (16.0s - 24.5s): [CORREÇÃO #6] TREMIDA DE RAIVA AJUSTADA + LÍNGUA + ESTOURO DAS FIVELAS
  // -----------------------------------------------------------------------
  else {
    for (let i = 0; i < 8; i++) aberturaOlhos[i] = 1.0;
    raivaPalpebra = 1.0;
    ericarPelos = 1.0;

    if (t < 20.2) {
      // 16.0s a 20.2s (4.2s): Treme de raiva (na velocidade VEL_TREMIDA = 48)
      // tentando abrir a boca contra as fivelas e colocando a língua para fora!
      let tLuta = t - 16.0;
      let ondaEsforco = abs(sin((tLuta / 4.2) * PI * 3.0));

      // [CORREÇÃO #6] Combina o impulso do bote com a tremida mais viva e rápida!
      let tremeX = sin(t * VEL_TREMIDA) * (FORCA_TREMIDA_X * (0.7 + ondaEsforco * 0.6));
      let tremeY = cos(t * (VEL_TREMIDA * 0.92)) * (FORCA_TREMIDA_Y * (0.7 + ondaEsforco * 0.6));

      moveX = ondaEsforco * 14 + tremeX;
      moveY = -ondaEsforco * 10 + tremeY;
      rotLivro = sin(t * (VEL_TREMIDA * 0.55)) * 0.035;

      aberturaBoca = 0.34 + ondaEsforco * 0.38;
      extensaoLingua = 0.70 + ondaEsforco * 0.30; // Língua bem visível!
      tensaoFivelas = 0.6 + ondaEsforco * 0.8;

      olharFrente = ondaEsforco * 3.0;
      olharLateral = sin(t * 6.0) * 3.0;
      contracaoPupila = 0.70;
    } else if (t < 23.3) {
      // Em t = 20.2s: AS DUAS FIVELAS LATERAIS ARREBENTAM!
      fivelasSoltas = constrain((t - 20.2) / 0.45, 0, 1);
      if (faiscas.length === 0) {
        gerarExplosaoFivelas(cx + 132, cy + POS_Y_FIVELAS[0]);
        gerarExplosaoFivelas(cx + 132, cy + POS_Y_FIVELAS[1]);
      }

      // 20.2s a 23.3s (3.1s): Livre das fivelas, dá 2 botes ferozes mostrando a língua!
      let tLivre = t - 20.2;
      let bote = abs(sin((tLivre / 3.1) * PI * 2.0));
      let tremeLivre = sin(t * VEL_TREMIDA) * (FORCA_TREMIDA_X * 0.5);

      aberturaBoca = 0.35 + bote * 0.65;
      extensaoLingua = 0.75 + bote * 0.35;
      moveX = bote * 26 + tremeLivre;
      moveY = -bote * 16;
      rotLivro = sin((tLivre / 3.1) * TWO_PI) * 0.05;
      olharFrente = 4.5 * bote;
      olharLateral = 0;
    } else {
      // [AJUSTE ANTERIOR - Sem bug antes de abrir] 23.3s a 24.5s: Estabiliza suavemente no centro
      fivelasSoltas = 1.0;
      let pCalma = easeInOutCubic(constrain((t - 23.3) / 1.2, 0, 1));
      aberturaBoca = lerp(0.35, 0.0, pCalma);
      extensaoLingua = lerp(0.60, 0.0, constrain(pCalma * 1.5, 0, 1));
      ericarPelos = lerp(1.0, 0.2, pCalma);
      raivaPalpebra = lerp(1.0, 0.0, pCalma);
      moveX = 0;
      moveY = 0;
      rotLivro = 0;
      olharFrente = lerp(3.0, 0.0, pCalma);
      olharLateral = 0;
    }
  }

  push();
  translate(cx + moveX, cy + moveY);
  rotate(rotLivro);

  // 1. Sombra 3D na mesa
  desenharSombraLivro3D(camPitch);

  // 2. Maxilar Inferior (Capa traseira)
  desenharMaxilarInferior3D(t, camPitch, aberturaBoca);

  // 3. [CORREÇÃO #3] Se as fivelas já abriram, desenha as tiras abertas NA LATERAL INFERIOR
  //    (por baixo da capa superior, para nunca subirem por cima do livro!)
  if (fivelasSoltas > 0) {
    desenharDuasFivelasLaterais3D(t, camPitch, aberturaBoca, tensaoFivelas, fivelasSoltas);
  }

  // 4. [CORREÇÃO #1] Boca nas 3 Bordas com Dentes e UMA Língua Anatômica Perfeita
  desenharBocaTresBordas3D(t, camPitch, aberturaBoca, extensaoLingua);

  // 5. [CORREÇÃO #2] Maxilar Superior (Pelos da 2ª versão + Olhos grandes sem risco marrom)
  desenharMaxilarSuperior3D(
    t, camPitch, aberturaBoca, ericarPelos,
    aberturaOlhos, olharFrente, olharLateral, raivaPalpebra, contracaoPupila
  );

  // 6. [CORREÇÃO #3] Se as fivelas ainda estão fechadas, desenha o fecho na BORDA LATERAL
  if (fivelasSoltas <= 0) {
    desenharDuasFivelasLaterais3D(t, camPitch, aberturaBoca, tensaoFivelas, fivelasSoltas);
  }

  pop();
}

function desenharSombraLivro3D(camPitch) {
  let w2 = LIVRO_W / 2 + 12;
  let h2 = LIVRO_H / 2 + 12;
  let bzSombra = -ESPESSURA_LIVRO * 0.5 - 6;

  let p1 = proj3D(-w2, -h2, bzSombra, camPitch);
  let p2 = proj3D( w2, -h2, bzSombra, camPitch);
  let p3 = proj3D( w2,  h2, bzSombra, camPitch);
  let p4 = proj3D(-w2,  h2, bzSombra, camPitch);

  noStroke();
  fill(6, 2, 1, 200);
  drawingContext.shadowBlur = 38;
  drawingContext.shadowColor = "rgba(0, 0, 0, 0.9)";
  beginShape();
  vertex(p1.x, p1.y + 8);
  vertex(p2.x, p2.y + 8);
  vertex(p3.x, p3.y + 8);
  vertex(p4.x, p4.y + 8);
  endShape(CLOSE);
  drawingContext.shadowBlur = 0;
}

function desenharMaxilarInferior3D(t, camPitch, aberturaBoca) {
  let w2 = LIVRO_W / 2;
  let h2 = LIVRO_H / 2;
  let bzInf = -ESPESSURA_LIVRO * 0.5;

  let c1 = proj3D(-w2, -h2, bzInf, camPitch);
  let c2 = proj3D( w2, -h2, bzInf, camPitch);
  let c3 = proj3D( w2,  h2, bzInf, camPitch);
  let c4 = proj3D(-w2,  h2, bzInf, camPitch);

  fill(24, 14, 9);
  stroke(14, 8, 5);
  strokeWeight(3);
  beginShape();
  vertex(c1.x, c1.y);
  vertex(c2.x, c2.y);
  vertex(c3.x, c3.y);
  vertex(c4.x, c4.y);
  endShape(CLOSE);
  noStroke();
}

// =========================================================================
// [CORREÇÃO #1] BOCA NAS 3 BORDAS E LÍNGUA ÚNICA REMODELADA SEM BUGS
// =========================================================================

function desenharBocaTresBordas3D(t, camPitch, aberturaBoca, extensaoLingua) {
  let w2 = LIVRO_W / 2;
  let h2 = LIVRO_H / 2;
  let bzInf = -ESPESSURA_LIVRO * 0.5 + 4;
  let bzSupBase = ESPESSURA_LIVRO * 0.5 - 4 + aberturaBoca * 28;
  let projecaoFora = 12 + aberturaBoca * 28;

  // 1. Interior escuro da bocarra nas 3 bordas
  let g1 = proj3D(-w2 + 18, -h2 - projecaoFora * 0.4, 0, camPitch);
  let g2 = proj3D( w2 + projecaoFora * 0.5, -h2 - projecaoFora * 0.4, 0, camPitch);
  let g3 = proj3D( w2 + projecaoFora * 0.5,  h2 + projecaoFora * 0.4, 0, camPitch);
  let g4 = proj3D(-w2 + 18,  h2 + projecaoFora * 0.4, 0, camPitch);

  fill(42, 9, 13);
  noStroke();
  beginShape();
  vertex(g1.x, g1.y);
  vertex(g2.x, g2.y);
  vertex(g3.x, g3.y);
  vertex(g4.x, g4.y);
  endShape(CLOSE);

  // 2. Dentes Inferiores e Gengivas nas 3 bordas (Lateral, Superior e Inferior)
  function desenharDenteInferiorEGengiva(bx, by, nx, ny, idx) {
    let alcanceFora = projecaoFora * (0.78 + (idx % 2) * 0.22);

    let pGengInf = proj3D(bx + nx * 4, by + ny * 4, bzInf + 2, camPitch);
    let pGengSup = proj3D(bx + nx * 4, by + ny * 4, bzSupBase - 2, camPitch);
    fill(130, 30, 42);
    noStroke();
    ellipse(pGengInf.x, pGengInf.y, 15, 13);
    ellipse(pGengSup.x, pGengSup.y, 15, 13);

    let biEsq = proj3D(bx - ny * 6, by + nx * 6, bzInf + 2, camPitch);
    let biDir = proj3D(bx + ny * 6, by - nx * 6, bzInf + 2, camPitch);
    let pontaInf = proj3D(
      bx + nx * (alcanceFora * 0.85),
      by + ny * (alcanceFora * 0.85),
      lerp(bzInf, bzSupBase, 0.55),
      camPitch
    );
    fill(232, 220, 190);
    stroke(160, 140, 110, 160);
    strokeWeight(1);
    triangle(biEsq.x, biEsq.y, biDir.x, biDir.y, pontaInf.x, pontaInf.y);
    noStroke();
  }

  for (let i = 0; i < 7; i++) {
    let bx = map(i, 0, 6, -w2 + 38, w2 - 18);
    desenharDenteInferiorEGengiva(bx, -h2, 0.15, -1.0, i);
    desenharDenteInferiorEGengiva(bx,  h2, 0.15,  1.0, i + 20);
  }
  for (let i = 0; i < 10; i++) {
    let by = map(i, 0, 9, -h2 + 20, h2 - 20);
    desenharDenteInferiorEGengiva(w2, by, 1.0, 0.0, i + 40);
  }

  // 3. [CORREÇÃO #1] LÍNGUA ÚNICA ANATÔMICA (Construída por malha de espinha central)
  //    Garante que as bordas da língua nunca se cruzem nem fiquem bugadas!
  if (extensaoLingua > 0.04) {
    let comp = extensaoLingua * COMP_MAX_LINGUA;
    let passosLingua = 16;
    let bordaSup = [];
    let bordaInf = [];
    let centroLingua = [];

    for (let i = 0; i <= passosLingua; i++) {
      let s = i / passosLingua; // 0 = raiz dentro da boca -> 1 = ponta da língua
      let bx = lerp(w2 - 18, w2 + comp, s);
      // Onda suave que cresce da base até a ponta
      let ondaY = sin(s * PI * 1.35 - t * VEL_ONDULACAO_LINGUA) * (24 * pow(s, 1.1) * extensaoLingua);
      let bz = sin(s * PI) * 8 - s * 4;

      // Largura carnuda que afina suavemente até formar uma ponta arredondada em s = 1
      let meiaLargura = sin(pow(s, 0.45) * PI) * LARG_MAX_LINGUA;

      bordaSup.push(proj3D(bx, ondaY - meiaLargura, bz, camPitch));
      bordaInf.push(proj3D(bx, ondaY + meiaLargura, bz, camPitch));
      centroLingua.push(proj3D(bx, ondaY, bz + 2, camPitch));
    }

    // Sombra embaixo da língua
    noStroke();
    fill(35, 8, 12, 160);
    beginShape();
    for (let i = 0; i <= passosLingua; i++) vertex(bordaSup[i].x + 2, bordaSup[i].y + 5);
    for (let i = passosLingua; i >= 0; i--) vertex(bordaInf[i].x + 2, bordaInf[i].y + 5);
    endShape(CLOSE);

    // Corpo carnudo da língua
    fill(198, 48, 70);
    stroke(115, 18, 34);
    strokeWeight(2.2);
    beginShape();
    for (let i = 0; i <= passosLingua; i++) {
      vertex(bordaSup[i].x, bordaSup[i].y);
    }
    for (let i = passosLingua; i >= 0; i--) {
      vertex(bordaInf[i].x, bordaInf[i].y);
    }
    endShape(CLOSE);

    // Sulco central escuro da língua (para na metade da ponta)
    noFill();
    stroke(135, 22, 40, 210);
    strokeWeight(2.2);
    beginShape();
    for (let i = 1; i <= passosLingua - 3; i++) {
      vertex(centroLingua[i].x, centroLingua[i].y);
    }
    endShape();

    // Brilho úmido paralelo ao sulco
    stroke(252, 165, 180, 200);
    strokeWeight(2.0);
    beginShape();
    for (let i = 2; i <= passosLingua - 4; i++) {
      vertex(
        lerp(centroLingua[i].x, bordaSup[i].x, 0.35),
        lerp(centroLingua[i].y, bordaSup[i].y, 0.35)
      );
    }
    endShape();
    noStroke();
  }

  // 4. Dentes Superiores nas 3 bordas
  function desenharDenteSuperior(bx, by, nx, ny, idx) {
    let alcanceFora = projecaoFora * (0.78 + (idx % 2) * 0.22);
    let desl = 7;
    let bxS = bx + (-ny) * desl;
    let byS = by + (nx) * desl;
    let bsEsq = proj3D(bxS - ny * 6.5, byS + nx * 6.5, bzSupBase - 2, camPitch);
    let bsDir = proj3D(bxS + ny * 6.5, byS - nx * 6.5, bzSupBase - 2, camPitch);
    let pontaSup = proj3D(
      bxS + nx * (alcanceFora * 1.05),
      byS + ny * (alcanceFora * 1.05),
      lerp(bzSupBase, bzInf, 0.62),
      camPitch
    );
    fill(248, 240, 216);
    stroke(160, 140, 110, 160);
    strokeWeight(1);
    triangle(bsEsq.x, bsEsq.y, bsDir.x, bsDir.y, pontaSup.x, pontaSup.y);
    noStroke();
  }

  for (let i = 0; i < 7; i++) {
    let bx = map(i, 0, 6, -w2 + 38, w2 - 18);
    desenharDenteSuperior(bx, -h2, 0.15, -1.0, i);
    desenharDenteSuperior(bx,  h2, 0.15,  1.0, i + 20);
  }
  for (let i = 0; i < 10; i++) {
    let by = map(i, 0, 9, -h2 + 20, h2 - 20);
    desenharDenteSuperior(w2, by, 1.0, 0.0, i + 40);
  }
}

// =========================================================================
// [CORREÇÃO #2] PELOS DA 2ª VERSÃO + OLHOS GRANDES SEM MARCA MARROM
// =========================================================================

function desenharCerdaTarantula(x, y, comp, larg, curva) {
  let desvioY = comp * curva;
  beginShape();
  vertex(x, y - larg * 0.5);
  curvaMat(
    x, y - larg * 0.5,
    x + comp * 0.45, y - larg * 0.35 + desvioY * 0.4,
    x + comp * 0.8, y - larg * 0.12 + desvioY * 0.8,
    x + comp, y + desvioY, 7
  );
  curvaMat(
    x + comp, y + desvioY,
    x + comp * 0.8, y + larg * 0.18 + desvioY * 0.8,
    x + comp * 0.45, y + larg * 0.4 + desvioY * 0.4,
    x, y + larg * 0.5, 7
  );
  endShape(CLOSE);
}

function desenharCerdaCurta(x, y, comp, larg) {
  beginShape();
  vertex(x, y - larg * 0.45);
  vertex(x + comp * 0.6, y - larg * 0.2);
  vertex(x + comp, y);
  vertex(x + comp * 0.6, y + larg * 0.25);
  vertex(x, y + larg * 0.45);
  endShape(CLOSE);
}

function desenharMaxilarSuperior3D(
  t, camPitch, aberturaBoca, ericar,
  aberturaOlhos, olharFrente, olharLateral, raivaPalpebra, contracaoPupila
) {
  let w2 = LIVRO_W / 2;
  let h2 = LIVRO_H / 2;
  let elevBoca = aberturaBoca * 28;

  // 1. Lombada esquerda 3D
  let lSup1 = proj3D(-w2, -h2, ESPESSURA_LIVRO * 0.5, camPitch);
  let lSup2 = proj3D(-w2,  h2, ESPESSURA_LIVRO * 0.5, camPitch);
  let lInf2 = proj3D(-w2,  h2, -ESPESSURA_LIVRO * 0.5, camPitch);
  let lInf1 = proj3D(-w2, -h2, -ESPESSURA_LIVRO * 0.5, camPitch);
  fill(28, 16, 10);
  noStroke();
  beginShape();
  vertex(lSup1.x, lSup1.y);
  vertex(lSup2.x, lSup2.y);
  vertex(lInf2.x, lInf2.y);
  vertex(lInf1.x, lInf1.y);
  endShape(CLOSE);

  // 2. Tufos de Pelo ao redor da borda da capa fechada
  noStroke();
  for (let i = 0; i < pelosBorda.length; i++) {
    let pb = pelosBorda[i];
    let bx = constrain(cos(pb.ang) * (w2 * 1.03), -w2 + 4, w2 - 4);
    let by = constrain(sin(pb.ang) * (h2 * 1.03), -h2 + 4, h2 - 4);
    let fatorBoca = map(bx, -w2, w2, 0, elevBoca);
    let bz = ESPESSURA_LIVRO * 0.5 + fatorBoca;

    let pBase = proj3D(bx, by, bz, camPitch);
    let pDir = proj3D(bx + cos(pb.ang) * 20, by + sin(pb.ang) * 20, bz + 2, camPitch);
    let angTela = atan2(pDir.y - pBase.y, pDir.x - pBase.x);
    let balanco = sin(t * 5.0 + pb.fase) * (0.06 + ericar * 0.10);
    let compAtual = pb.comp * (1.0 + ericar * 0.15);

    push();
    translate(pBase.x, pBase.y);
    rotate(angTela + balanco);
    scale(1.0, lerp(0.55, 1.0, camPitch));

    fill(24 + pb.tom * 0.4, 16 + pb.tom * 0.3, 12);
    desenharCerdaTarantula(0, 2, compAtual, pb.larg, pb.curva);
    fill(54 + pb.tom, 32 + pb.tom * 0.6, 20);
    desenharCerdaTarantula(0, 0, compAtual * 0.92, pb.larg * 0.85, pb.curva);
    fill(125 + pb.tom * 1.3, 68 + pb.tom * 0.8, 32, 210);
    desenharCerdaTarantula(compAtual * 0.28, 0, compAtual * 0.65, pb.larg * 0.48, pb.curva);
    pop();
  }

  // 3. Base de Couro Escuro da Capa Superior
  let p1 = proj3D(-w2, -h2, ESPESSURA_LIVRO * 0.5, camPitch);
  let p2 = proj3D( w2, -h2, ESPESSURA_LIVRO * 0.5 + elevBoca, camPitch);
  let p3 = proj3D( w2,  h2, ESPESSURA_LIVRO * 0.5 + elevBoca, camPitch);
  let p4 = proj3D(-w2,  h2, ESPESSURA_LIVRO * 0.5, camPitch);

  fill(34, 20, 14);
  stroke(20, 12, 8);
  strokeWeight(2);
  beginShape();
  vertex(p1.x, p1.y);
  vertex(p2.x, p2.y);
  vertex(p3.x, p3.y);
  vertex(p4.x, p4.y);
  endShape(CLOSE);
  noStroke();

  // 4. ELEVAÇÃO VOLUMÉTRICA (DOMO OCULAR) ACIMA DO NÍVEL DO LIVRO
  let camadasDomo = 7;
  for (let c = 0; c < camadasDomo; c++) {
    let frac = c / (camadasDomo - 1);
    let zCamada = ESPESSURA_LIVRO * 0.5 + elevBoca * 0.5 + frac * 38;
    let raioX = lerp(76, 32, frac);
    let raioY = lerp(128, 84, frac);

    fill(
      lerp(28, 58, frac),
      lerp(16, 34, frac),
      lerp(11, 20, frac)
    );
    beginShape();
    for (let a = 0; a < TWO_PI; a += PI / 10) {
      let bx = -10 + cos(a) * raioX;
      let by = sin(a) * raioY;
      let pt = proj3D(bx, by, zCamada, camPitch);
      vertex(pt.x, pt.y);
    }
    endShape(CLOSE);
  }

  // 5. Pelagem densa da 2ª Versão sobre a capa e o domo
  for (let i = 0; i < pelosCapa.length; i++) {
    let pc = pelosCapa[i];
    let fatorBoca = map(pc.bx, -w2, w2, 0, elevBoca);
    let bz = pc.bz + fatorBoca;

    let pPos = proj3D(pc.bx, pc.by, bz, camPitch);
    let pFrente = proj3D(pc.bx + cos(pc.ang) * 15, pc.by + sin(pc.ang) * 15, bz + 3, camPitch);
    let angTela = atan2(pFrente.y - pPos.y, pFrente.x - pPos.x);
    let osc = sin(t * 4.5 + pc.fase) * (0.04 + ericar * 0.08);

    push();
    translate(pPos.x, pPos.y);
    rotate(angTela + osc);
    scale(1.0, lerp(0.55, 1.0, camPitch));

    fill(22 + pc.tom * 0.3, 14 + pc.tom * 0.2, 10, 235);
    desenharCerdaCurta(0, 0, pc.comp, pc.larg);
    fill(78 + pc.tom, 44 + pc.tom * 0.7, 25, 205);
    desenharCerdaCurta(3, -1, pc.comp * 0.78, pc.larg * 0.62);
    fill(145 + pc.tom * 1.2, 82 + pc.tom * 0.8, 38, 160);
    desenharCerdaCurta(pc.comp * 0.35, 0, pc.comp * 0.55, pc.larg * 0.34);
    pop();
  }

  // 6. [CORREÇÃO #2] OS 8 OLHOS GRANDES COM PÁLPEBRAS LIMPAS (SEM LINHA MARROM NO MEIO DO OLHO!)
  desenharOlhosGrandesComPalpebras(
    t, camPitch, elevBoca, aberturaOlhos,
    olharFrente, olharLateral, raivaPalpebra, contracaoPupila
  );
}

function desenharOlhosGrandesComPalpebras(
  t, camPitch, elevBoca, aberturaOlhos,
  olharFrente, olharLateral, raivaPalpebra, contracaoPupila
) {
  let indices = [0, 1, 2, 3, 4, 5, 6, 7];
  let yawAtual = lerp(1.36, 0.0, camPitch);
  indices.sort((a, b) => {
    let oa = OLHOS_ARANHA[a];
    let ob = OLHOS_ARANHA[b];
    let profA = oa.bx * sin(yawAtual) + oa.by * cos(yawAtual);
    let profB = ob.bx * sin(yawAtual) + ob.by * cos(yawAtual);
    return profA - profB;
  });

  for (let idx of indices) {
    let o = OLHOS_ARANHA[idx];
    let ab = constrain(aberturaOlhos[idx], 0, 1);

    let bzTopoOlho = ESPESSURA_LIVRO * 0.5 + elevBoca * 0.55 + o.altDomo;
    let bzRaizCapa = ESPESSURA_LIVRO * 0.5 + elevBoca * 0.55 + o.altDomo * 0.22;
    let posTela = proj3D(o.bx, o.by, bzTopoOlho, camPitch);
    let posRaiz = proj3D(o.bx, o.by, bzRaizCapa, camPitch);

    // 1. Base anatômica de couro escuro que conecta o olho ao domo do livro
    noStroke();
    fill(24, 14, 9, 240);
    beginShape();
    vertex(posRaiz.x - o.r * 0.68, posRaiz.y + 4);
    curvaMat(
      posRaiz.x - o.r * 0.68, posRaiz.y + 4,
      posTela.x - o.r * 0.62, posTela.y - o.r * 0.28,
      posTela.x + o.r * 0.62, posTela.y - o.r * 0.28,
      posRaiz.x + o.r * 0.68, posRaiz.y + 4, 8
    );
    curvaMat(
      posRaiz.x + o.r * 0.68, posRaiz.y + 4,
      posRaiz.x + o.r * 0.38, posRaiz.y + o.r * 0.42,
      posRaiz.x - o.r * 0.38, posRaiz.y + o.r * 0.42,
      posRaiz.x - o.r * 0.68, posRaiz.y + 4, 8
    );
    endShape(CLOSE);

    push();
    translate(posTela.x, posTela.y);
    let escalaX = lerp(0.88, 1.0, camPitch);
    let escalaY = lerp(0.82, 1.0, camPitch);
    scale(escalaX, escalaY);

    // Anel externo de couro da órbita ocular (sem pelos em cima do olho!)
    fill(32, 18, 12);
    ellipse(0, 2, o.r + 12, o.r + 12);
    fill(54, 32, 20);
    ellipse(0, 0, o.r + 6, o.r + 6);

    let pDirBoca = proj3D(o.bx + 20, o.by, bzTopoOlho, camPitch);
    let angParaBoca = atan2(pDirBoca.y - posTela.y, pDirBoca.x - posTela.x);

    // 2. Globo ocular e Pálpebras (Dentro do Clip)
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.arc(0, 0, o.r * 0.5, 0, TWO_PI);
    drawingContext.clip();

    let px = cos(angParaBoca) * olharFrente * (o.r / 42) - sin(angParaBoca) * olharLateral * (o.r / 42);
    let py = sin(angParaBoca) * olharFrente * (o.r / 42) + cos(angParaBoca) * olharLateral * (o.r / 42);

    let gradOlho = drawingContext.createRadialGradient(
      px, py, o.r * 0.04,
      px * 0.4, py * 0.4, o.r * 0.52
    );
    gradOlho.addColorStop(0, "rgb(255, 215, 70)");
    gradOlho.addColorStop(0.38, "rgb(195, 75, 14)");
    gradOlho.addColorStop(0.75, "rgb(45, 10, 8)");
    gradOlho.addColorStop(1, "rgb(8, 3, 4)");
    drawingContext.fillStyle = gradOlho;
    ellipse(0, 0, o.r, o.r);

    // Pupila aracnídea alinhada com a borda lateral
    push();
    translate(px, py);
    rotate(angParaBoca);
    fill(6, 3, 4, 245);
    ellipse(0, 0, o.r * 0.34 * contracaoPupila, o.r * 0.48 * contracaoPupila);
    noFill();
    stroke(255, 200, 60, 185);
    strokeWeight(1.8);
    ellipse(0, 0, o.r * 0.37 * contracaoPupila, o.r * 0.51 * contracaoPupila);
    pop();

    // Duplo reflexo especular estilo Pixar
    noStroke();
    fill(255, 252, 235, 245);
    ellipse(-o.r * 0.14 + px * 0.2, -o.r * 0.16 + py * 0.2, o.r * 0.22, o.r * 0.15);
    fill(255, 210, 140, 190);
    ellipse(o.r * 0.14 + px * 0.1, o.r * 0.14 + py * 0.1, o.r * 0.09, o.r * 0.09);

    // [CORREÇÃO #2] PÁLPEBRAS SEM MARCA MARROM QUANDO O OLHO ESTÁ ABERTO!
    // Quando ab == 1 (aberto) e raivaPalpebra == 0 (calmo), fechamentoSup e fechamentoInf são 0!
    // Assim NÃO fica nenhuma linha ou mancha marrom marcando onde a pálpebra vai fechar depois.
    let fechamentoBase = (1.0 - ab) * (o.r * 0.54);
    let fechamentoRaiva = raivaPalpebra * (o.r * 0.22);
    let fechamentoSup = max(fechamentoBase, fechamentoRaiva);
    let fechamentoInf = max(fechamentoBase, raivaPalpebra * (o.r * 0.08));

    if (fechamentoSup > 0.5 || fechamentoInf > 0.5) {
      push();
      let inclinacaoRaiva = (idx % 2 === 0 ? -1 : 1) * raivaPalpebra * 0.30;
      rotate(angParaBoca + HALF_PI + o.incl + inclinacaoRaiva);
      rectMode(CORNER);

      // Pálpebra superior (desce do topo -o.r*0.58 até -o.r*0.5 + fechamentoSup)
      if (fechamentoSup > 0.5) {
        noStroke();
        fill(54, 32, 20);
        rect(-o.r * 0.7, -o.r * 0.58, o.r * 1.4, fechamentoSup + o.r * 0.08);
        // Borda escura limpa na extremidade da pálpebra superior
        stroke(22, 11, 7);
        strokeWeight(2.0);
        line(-o.r * 0.7, -o.r * 0.5 + fechamentoSup, o.r * 0.7, -o.r * 0.5 + fechamentoSup);
      }

      // Pálpebra inferior (sobe da base +o.r*0.5 - fechamentoInf até +o.r*0.58)
      if (fechamentoInf > 0.5) {
        noStroke();
        fill(38, 22, 14);
        rect(-o.r * 0.7, o.r * 0.5 - fechamentoInf, o.r * 1.4, fechamentoInf + o.r * 0.08);
      }
      pop();
    }

    drawingContext.restore();
    pop();
  }
}

// =========================================================================
// [CORREÇÃO #3] DUAS FIVELAS ESTRITAMENTE NA BORDA LATERAL (E ABRINDO PELA LATERAL)
// =========================================================================

function desenharDuasFivelasLaterais3D(t, camPitch, aberturaBoca, tensao, fivelasSoltas) {
  let w2 = LIVRO_W / 2;

  for (let i = 0; i < POS_Y_FIVELAS.length; i++) {
    let byFivela = POS_Y_FIVELAS[i];
    let largTira = 22;
    let vibTensao = sin(t * 35 + i * 2) * tensao * 1.8;

    let bzTopo = ESPESSURA_LIVRO * 0.5 + aberturaBoca * 28;
    let bzBase = -ESPESSURA_LIVRO * 0.5;

    if (fivelasSoltas <= 0) {
      // [CORREÇÃO #3] O fecho fica na parede LATERAL DIREITA (bx = w2 + 3),
      // com apenas uma aba mínima de 8px segurando a borda, sem subir na capa!
      let tLat1 = proj3D(w2 - 8, byFivela - largTira * 0.5, bzTopo + 1, camPitch);
      let tLat2 = proj3D(w2 + 5 + vibTensao, byFivela - largTira * 0.5, bzTopo + 1, camPitch);
      let tLat3 = proj3D(w2 + 5 + vibTensao, byFivela + largTira * 0.5, bzTopo + 1, camPitch);
      let tLat4 = proj3D(w2 - 8, byFivela + largTira * 0.5, bzTopo + 1, camPitch);

      let tParede1 = tLat2;
      let tParede2 = tLat3;
      let tParede3 = proj3D(w2 + 5 + vibTensao, byFivela + largTira * 0.5, bzBase - 1, camPitch);
      let tParede4 = proj3D(w2 + 5 + vibTensao, byFivela - largTira * 0.5, bzBase - 1, camPitch);

      // Aba curta na quina lateral
      fill(34, 16, 10);
      stroke(16, 7, 4);
      strokeWeight(1.8);
      beginShape();
      vertex(tLat1.x, tLat1.y);
      vertex(tLat2.x, tLat2.y);
      vertex(tLat3.x, tLat3.y);
      vertex(tLat4.x, tLat4.y);
      endShape(CLOSE);

      // Tira vertical na parede da Borda Lateral
      fill(26, 12, 8);
      beginShape();
      vertex(tParede1.x, tParede1.y);
      vertex(tParede2.x, tParede2.y);
      vertex(tParede3.x, tParede3.y);
      vertex(tParede4.x, tParede4.y);
      endShape(CLOSE);

      // Fivela metálica de latão posicionada no meio da parede lateral (bx = w2 + 6)
      let pFivela = proj3D(w2 + 6 + vibTensao, byFivela, lerp(bzBase, bzTopo, 0.5), camPitch);
      push();
      translate(pFivela.x, pFivela.y);
      rotate(lerp(-0.20, 0, camPitch));
      rectMode(CENTER);

      stroke(90, 60, 20);
      strokeWeight(1.8);
      fill(210, 165, 68);
      rect(0, 0, lerp(24, 14, camPitch), 28, 4);

      noStroke();
      fill(30, 14, 9);
      rect(0, 0, lerp(14, 7, camPitch), 18, 2);

      fill(245, 210, 115);
      rect(0, 0, lerp(12, 8, camPitch), 4, 1);
      pop();
    } else {
      // [CORREÇÃO #3] Quando a fivela abre, ela se solta PELA LATERAL INFERIOR (bx > w2, bz = bzBase)
      // para a direita, nunca subindo por cima da capa do livro!
      let ext = easeOutBack(fivelasSoltas) * 32;
      let s1 = proj3D(w2 - 2, byFivela - largTira * 0.5, bzBase + 2, camPitch);
      let s2 = proj3D(w2 + ext, byFivela - largTira * 0.5 + 4, bzBase, camPitch);
      let s3 = proj3D(w2 + ext, byFivela + largTira * 0.5 + 4, bzBase, camPitch);
      let s4 = proj3D(w2 - 2, byFivela + largTira * 0.5, bzBase + 2, camPitch);

      fill(34, 16, 10);
      stroke(16, 7, 4);
      strokeWeight(1.8);
      beginShape();
      vertex(s1.x, s1.y);
      vertex(s2.x, s2.y);
      vertex(s3.x, s3.y);
      vertex(s4.x, s4.y);
      endShape(CLOSE);

      // Fivela na ponta externa da tira lateral aberta
      let pFivSolta = proj3D(w2 + ext + 4, byFivela + 4, bzBase, camPitch);
      push();
      translate(pFivSolta.x, pFivSolta.y);
      rectMode(CENTER);
      fill(210, 165, 68);
      rect(0, 0, 16, 26, 3);
      noStroke();
      fill(30, 14, 9);
      rect(0, 0, 8, 16, 2);
      pop();
    }
  }
}

// =========================================================================
// 3. ATO 5: [CORREÇÃO #4 e #5] ABERTURA DISNEY COM PÁGINAS PASSANDO E DENTES MEXENDO
// =========================================================================

function cenaLivroAbrindoDisney(t) {
  let tAto = t - 24.5;

  // Movimento suave da lombada até o centro da tela (leva 2.2 segundos)
  let pCentro = easeInOutCubic(constrain(tAto / 2.2, 0, 1));
  let spineX = lerp(width * 0.5 - LIVRO_W / 2, width * 0.5, pCentro);
  let spineY = height * 0.51;

  push();
  translate(spineX, spineY);

  // Giro 3D da capa frontal peluda (leva 2.2 segundos para abrir de 0 a PI)
  let pCapa = constrain(tAto / 2.2, 0, 1);
  let angCapa = easeInOutCubic(pCapa) * PI;
  let cosCapa = cos(angCapa);

  // 1. Sombra dupla do livro aberto na mesa
  noStroke();
  fill(6, 2, 1, 195);
  drawingContext.shadowBlur = 40;
  drawingContext.shadowColor = "rgba(0, 0, 0, 0.85)";
  rectMode(CORNER);
  rect(-8, -LIVRO_H / 2 + 12, LIVRO_W + 16, LIVRO_H, 14);
  if (cosCapa < 0) {
    let largEsq = abs(cosCapa) * LIVRO_W;
    rect(-largEsq - 8, -LIVRO_H / 2 + 12, largEsq + 12, LIVRO_H, 14);
  }
  drawingContext.shadowBlur = 0;

  // [CORREÇÃO #4] Cálculo das 10 páginas passando da direita para a esquerda:
  // As páginas começam a virar em tAto = 1.6s (quando a capa já abriu para a esquerda!)
  let totalPaginas = 10;
  let paginasViradasNaEsquerda = 0;
  let ultimaPaginaSubiuDaDireita = false;

  for (let i = 0; i < totalPaginas; i++) {
    let inicioPag = 1.65 + i * 0.42;
    let duracaoPag = 1.55 + (i / totalPaginas) * 0.35;
    let pPag = constrain((tAto - inicioPag) / duracaoPag, 0, 1);
    if (pPag >= 0.96) paginasViradasNaEsquerda++;
    if (i === totalPaginas - 1 && pPag > 0.15) ultimaPaginaSubiuDaDireita = true;
  }

  // 2. [CORREÇÃO #4] Lado Direito Aberto:
  //    Enquanto ainda há páginas virando por cima, mostra o bloco de folhas de texto;
  //    Quando a última página levanta, revela a página com a Fotografia Mágica de Hogwarts!
  desenharBaseDireitaDetalhada(t, ultimaPaginaSubiuDaDireita);

  // 3. [CORREÇÃO #4] Lado Esquerdo Aberto:
  //    Quando a capa abre (cosCapa < 0), mostra o couro interno da capa e os dentinhos mexendo.
  //    A página de pergaminho esquerda SÓ aparece quando a 1ª folha termina de virar e pousa lá!
  if (cosCapa < 0) {
    desenharCapaEsquerdaDetalhada(abs(cosCapa), t, paginasViradasNaEsquerda);
  }

  // 4. [CORREÇÃO #4] Desenha as 10 páginas em movimento curvando de forma fluida da direita para a esquerda!
  for (let i = totalPaginas - 1; i >= 0; i--) {
    let inicioPag = 1.65 + i * 0.42;
    let duracaoPag = 1.55 + (i / totalPaginas) * 0.35;
    let pPag = constrain((tAto - inicioPag) / duracaoPag, 0, 1);

    if (pPag > 0 && pPag < 1) {
      desenharPaginaVirandoCurva3D(pPag, i);
    }
  }

  // 5. Enquanto a capa está na primeira metade do giro (cosCapa >= 0), desenha a capa 3D fechada girando
  if (cosCapa >= 0) {
    push();
    translate((LIVRO_W / 2) * cosCapa, 0);
    scale(max(0.04, cosCapa), 1.0);
    let olhosAbertos = [1, 1, 1, 1, 1, 1, 1, 1];
    desenharBocaTresBordas3D(t, 1.0, 0.0, 0.0);
    desenharMaxilarSuperior3D(t, 1.0, 0.0, 0.2, olhosAbertos, 0.0, 0.0, 0.0, 1.0);
    pop();
  }

  // 6. Lombada Central Peluda Articulada
  fill(28, 16, 10);
  noStroke();
  rectMode(CENTER);
  rect(0, 0, 20, LIVRO_H + 8, 6);
  fill(175, 130, 55);
  rect(0, -LIVRO_H / 2 + 18, 22, 7, 2);
  rect(0,  LIVRO_H / 2 - 18, 22, 7, 2);

  pop();
}

function desenharCapaEsquerdaDetalhada(fatorLargura, t, paginasViradasNaEsquerda) {
  let w = LIVRO_W * fatorLargura;
  let h2 = LIVRO_H / 2;
  let pw = (LIVRO_W - 18) * fatorLargura;
  let ph = LIVRO_H - 24;

  push();
  noStroke();

  // Pelos curtinhos e discretos na borda da capa aberta
  for (let i = 0; i < 16; i++) {
    let py = map(i, 0, 15, -h2 + 14, h2 - 14);
    fill(48, 28, 18);
    desenharCerdaTarantula(-w + 2, py, -11 * fatorLargura, 10, 0.12);
  }
  for (let i = 0; i < 10; i++) {
    let px = map(i, 0, 9, -w + 16 * fatorLargura, -18 * fatorLargura);
    fill(48, 28, 18);
    ellipse(px, -h2 - 2, 12 * fatorLargura, 9);
    ellipse(px,  h2 + 2, 12 * fatorLargura, 9);
  }

  // [CORREÇÃO #5] DENTINHOS NAS 3 BORDAS ESQUERDAS SE MEXENDO LEVEMENTE!
  for (let i = 0; i < 12; i++) {
    let py = map(i, 0, 11, -h2 + 18, h2 - 18);
    let mexe = sin(t * VEL_DENTES_ABERTO + i * 0.8) * AMP_DENTES_ABERTO;
    let mexeY = cos(t * VEL_DENTES_ABERTO + i) * 1.5;
    fill(238, 228, 202);
    triangle(-w, py - 5, -w - (12 + mexe) * fatorLargura, py + mexeY, -w, py + 5);
  }
  for (let i = 0; i < 7; i++) {
    let px = map(i, 0, 6, -w + 20 * fatorLargura, -25 * fatorLargura);
    let mexe = sin(t * VEL_DENTES_ABERTO + i * 1.1) * AMP_DENTES_ABERTO;
    fill(238, 228, 202);
    triangle(px - 4, -h2, px + mexe * 0.4, -h2 - (11 + mexe), px + 4, -h2);
    triangle(px - 4,  h2, px - mexe * 0.4,  h2 + (11 + mexe), px + 4,  h2);
  }

  // Couro interno da capa esquerda aberta
  fill(32, 18, 12);
  stroke(20, 11, 7);
  strokeWeight(2);
  rectMode(CORNER);
  rect(-w, -h2, w, LIVRO_H, 14, 0, 0, 14);
  noStroke();

  // [CORREÇÃO #4] Só desenha a página de pergaminho esquerda DEPOIS que pelo menos 1 página virou!
  if (paginasViradasNaEsquerda > 0) {
    // Degraus das páginas que vão se acumulando na esquerda
    fill(195, 170, 125);
    rect(-pw - 4, -ph / 2 + 3, pw + 4, ph, 6, 0, 0, 6);

    // Folha de pergaminho esquerda (usando fill puro do p5.js para nunca travar o estado do canvas!)
    fill(238, 222, 185);
    rect(-pw, -ph / 2, pw, ph, 6, 0, 0, 6);
    // Sombra suave perto da dobra central
    fill(185, 155, 115, 110);
    rect(-22 * fatorLargura, -ph / 2, 22 * fatorLargura, ph);

    // Detalhes da página esquerda (Capitular Iluminada, Caligrafia e Runa Astral)
    if (fatorLargura > 0.35) {
      push();
      scale(fatorLargura, 1);

      noFill();
      stroke(165, 45, 38, 160);
      strokeWeight(1.5);
      rect(-LIVRO_W + 32, -ph / 2 + 14, LIVRO_W - 48, ph - 28, 4);

      // Se já está na página final (todas as 10 viraram), mostra a Capitular "H" e o Diagrama Astral;
      // caso contrário, mostra o texto e iluminuras da página que acabou de pousar!
      if (paginasViradasNaEsquerda >= 10) {
        noStroke();
        fill(155, 35, 32);
        rect(-LIVRO_W + 44, -ph / 2 + 28, 46, 48, 4);
        stroke(215, 175, 65);
        strokeWeight(2);
        noFill();
        rect(-LIVRO_W + 47, -ph / 2 + 31, 40, 42, 2);
        strokeWeight(3.5);
        line(-LIVRO_W + 58, -ph / 2 + 40, -LIVRO_W + 58, -ph / 2 + 64);
        line(-LIVRO_W + 76, -ph / 2 + 40, -LIVRO_W + 76, -ph / 2 + 64);
        line(-LIVRO_W + 58, -ph / 2 + 52, -LIVRO_W + 76, -ph / 2 + 52);

        stroke(75, 50, 32, 185);
        strokeWeight(2);
        for (let ly = -ph / 2 + 34; ly < ph / 2 - 95; ly += 14) {
          let xIni = (ly < -ph / 2 + 82) ? -LIVRO_W + 100 : -LIVRO_W + 44;
          beginShape();
          for (let lx = xIni; lx < -28; lx += 16) {
            vertex(lx, ly + sin(lx * 0.25 + ly) * 1.3);
          }
          endShape();
        }

        push();
        translate(-LIVRO_W * 0.52, ph / 2 - 52);
        rotate(t * 0.3);
        noFill();
        stroke(175, 130, 50, 200);
        strokeWeight(1.5);
        ellipse(0, 0, 52, 52);
        ellipse(0, 0, 38, 38);
        for (let a = 0; a < TWO_PI; a += PI / 3) {
          line(cos(a) * 19, sin(a) * 19, cos(a + PI) * 19, sin(a + PI) * 19);
        }
        pop();
      } else {
        // Texto das páginas intermediárias que pousaram na esquerda
        stroke(75, 50, 32, 165);
        strokeWeight(1.8);
        for (let ly = -ph / 2 + 34; ly < ph / 2 - 34; ly += 14) {
          beginShape();
          for (let lx = -LIVRO_W + 44; lx < -28; lx += 16) {
            vertex(lx, ly + sin(lx * 0.25 + ly + paginasViradasNaEsquerda) * 1.3);
          }
          endShape();
        }
      }

      pop();
    }
  }
  pop();
}

function desenharBaseDireitaDetalhada(t, mostrarFotoFinal) {
  let h2 = LIVRO_H / 2;
  let pw = LIVRO_W - 18;
  let ph = LIVRO_H - 24;

  noStroke();
  // Pelos curtinhos e discretos na borda da capa direita
  for (let i = 0; i < 16; i++) {
    let py = map(i, 0, 15, -h2 + 14, h2 - 14);
    fill(48, 28, 18);
    desenharCerdaTarantula(LIVRO_W - 2, py, 11, 10, -0.12);
  }
  for (let i = 0; i < 10; i++) {
    let px = map(i, 0, 9, 18, LIVRO_W - 16);
    fill(48, 28, 18);
    ellipse(px, -h2 - 2, 12, 9);
    ellipse(px,  h2 + 2, 12, 9);
  }

  // [CORREÇÃO #5] DENTINHOS NAS 3 BORDAS DIREITAS SE MEXENDO LEVEMENTE!
  for (let i = 0; i < 12; i++) {
    let py = map(i, 0, 11, -h2 + 18, h2 - 18);
    let mexe = sin(t * VEL_DENTES_ABERTO + i * 0.8 + 1.5) * AMP_DENTES_ABERTO;
    let mexeY = cos(t * VEL_DENTES_ABERTO + i) * 1.5;
    fill(238, 228, 202);
    triangle(LIVRO_W, py - 5, LIVRO_W + 12 + mexe, py + mexeY, LIVRO_W, py + 5);
  }
  for (let i = 0; i < 7; i++) {
    let px = map(i, 0, 6, 25, LIVRO_W - 20);
    let mexe = sin(t * VEL_DENTES_ABERTO + i * 1.1 + 2.0) * AMP_DENTES_ABERTO;
    fill(238, 228, 202);
    triangle(px - 4, -h2, px + mexe * 0.4, -h2 - (11 + mexe), px + 4, -h2);
    triangle(px - 4,  h2, px - mexe * 0.4,  h2 + (11 + mexe), px + 4,  h2);
  }

  // Pontas das duas fivelas abertas na borda lateral direita
  for (let byFiv of POS_Y_FIVELAS) {
    fill(34, 16, 10);
    rectMode(CORNER);
    rect(LIVRO_W - 2, byFiv - 11, 24, 22, 3);
    fill(210, 165, 68);
    rect(LIVRO_W + 14, byFiv - 13, 14, 26, 3);
  }

  // Contracapa direita
  fill(32, 18, 12);
  stroke(20, 11, 7);
  strokeWeight(2);
  rectMode(CORNER);
  rect(0, -h2, LIVRO_W, LIVRO_H, 0, 14, 14, 0);

  // Espessura do bloco de páginas empilhadas
  noStroke();
  fill(195, 170, 125);
  rect(4, -ph / 2 + 4, pw + 6, ph, 0, 6, 6, 0);
  stroke(150, 125, 85);
  strokeWeight(1);
  for (let s = 1; s <= 5; s++) {
    line(pw + s, -ph / 2 + 4, pw + s, ph / 2 + 2);
  }

  // Página Principal Direita (usando fill puro do p5.js)
  noStroke();
  fill(242, 226, 190);
  rect(0, -ph / 2, pw, ph, 0, 6, 6, 0);
  // Sombra suave da dobra central
  fill(185, 155, 115, 110);
  rect(0, -ph / 2, 22, ph);

  // Borda iluminada medieval na página direita
  noFill();
  stroke(165, 45, 38, 160);
  strokeWeight(1.5);
  rect(16, -ph / 2 + 14, pw - 32, ph - 28, 4);

  if (!mostrarFotoFinal) {
    // Enquanto as páginas ainda estão virando por cima, mostra texto bruxo na pilha direita
    stroke(75, 50, 32, 165);
    strokeWeight(1.8);
    for (let ly = -ph / 2 + 34; ly < ph / 2 - 34; ly += 14) {
      beginShape();
      for (let lx = 32; lx < pw - 32; lx += 16) {
        vertex(lx, ly + sin(lx * 0.25 + ly) * 1.3);
      }
      endShape();
    }
  } else {
    // Quando a última folha levanta, revela a Moldura e Fotografia Mágica na Página Direita!
    let fotoX = 30;
    let fotoY = -ph / 2 + 34;
    let fotoW = pw - 60;
    let fotoH = 185;

    noStroke();
    fill(90, 65, 40, 120);
    rect(fotoX - 4, fotoY - 2, fotoW + 8, fotoH + 8, 6);

    let ctx = drawingContext;
    ctx.save();
    ctx.beginPath();
    ctx.rect(fotoX, fotoY, fotoW, fotoH);
    ctx.clip();

    // Fundo do Salão Comunal dentro da foto
    fill(52, 20, 24);
    rect(fotoX, fotoY, fotoW, fotoH);
    fill(75, 25, 28);
    rect(fotoX, fotoY + fotoH * 0.55, fotoW, fotoH * 0.45);

    // Janela gótica estrelada no fundo do retrato bruxo
    fill(16, 24, 48);
    rect(fotoX + fotoW - 52, fotoY + 18, 34, 65, 17, 17, 0, 0);
    fill(245, 240, 200);
    ellipse(fotoX + fotoW - 32, fotoY + 38, 14, 14);

    // Aura mágica pulsante e centelhas vivas dentro da foto
    let pulsoAura = sin(t * 3.5) * 8;
    fill(255, 195, 70, 35);
    ellipse(fotoX + fotoW * 0.5, fotoY + fotoH * 0.62, 110 + pulsoAura, 110 + pulsoAura);
    fill(255, 220, 110, 55);
    ellipse(fotoX + fotoW * 0.5, fotoY + fotoH * 0.62, 70 - pulsoAura * 0.5, 70 - pulsoAura * 0.5);

    for (let c = 0; c < 14; c++) {
      let cxF = fotoX + 15 + ((c * 29 + frameCount * 0.4) % (fotoW - 30));
      let cyF = fotoY + fotoH - ((c * 23 + frameCount * 0.7) % fotoH);
      let tamC = 2 + sin(t * 5 + c) * 1.5;
      fill(255, 230, 120, 210);
      ellipse(cxF, cyF, tamC, tamC);
    }

    ctx.restore();

    // Moldura Renascentista Dourada
    noFill();
    stroke(195, 148, 52);
    strokeWeight(5);
    rect(fotoX, fotoY, fotoW, fotoH, 4);
    stroke(245, 215, 120);
    strokeWeight(1.5);
    rect(fotoX + 2, fotoY + 2, fotoW - 4, fotoH - 4, 3);

    noStroke();
    fill(220, 175, 68);
    ellipse(fotoX, fotoY, 10, 10);
    ellipse(fotoX + fotoW, fotoY, 10, 10);
    ellipse(fotoX, fotoY + fotoH, 10, 10);
    ellipse(fotoX + fotoW, fotoY + fotoH, 10, 10);

    // Caligrafia bruxa abaixo da fotografia mágica
    stroke(75, 50, 32, 185);
    strokeWeight(2);
    noFill();
    for (let ly = fotoY + fotoH + 22; ly < ph / 2 - 24; ly += 14) {
      beginShape();
      for (let lx = 32; lx < pw - 32; lx += 16) {
        vertex(lx, ly + sin(lx * 0.3 + ly) * 1.2);
      }
      endShape();
    }
  }
}

function desenharPaginaVirandoCurva3D(p, indice) {
  let u = easeInOutCubic(p);
  let angBase = u * PI;
  let pw = LIVRO_W - 18;
  let ph = LIVRO_H - 24;
  let h2 = ph / 2;

  let elevacao = sin(angBase);
  noStroke();
  fill(20, 10, 5, elevacao * 65);
  let sombraX = cos(angBase) * pw;
  beginShape();
  vertex(0, -h2);
  vertex(sombraX, -h2 + elevacao * 14);
  vertex(sombraX, h2 + elevacao * 14);
  vertex(0, h2);
  endShape(CLOSE);

  let passos = 22;
  let bordaSup = [];
  let bordaInf = [];

  for (let i = 0; i <= passos; i++) {
    let f = i / passos;
    let r = f * pw;
    let atraso = sin(p * PI) * pow(f, 1.35) * 0.52;
    let angLocal = constrain(angBase - atraso, 0, PI);

    let x = cos(angLocal) * r;
    let arcoZ = sin(angLocal) * r * 0.24 + sin(f * PI) * elevacao * 18;

    bordaSup.push({ x: x, y: -h2 - arcoZ });
    bordaInf.push({ x: x, y: h2 - arcoZ * 0.82 });
  }

  let lum = map(sin(angBase), 0, 1, 232, 252) - (indice % 2) * 5;
  fill(lum, lum - 16, lum - 48);
  stroke(165, 138, 98, 210);
  strokeWeight(1.4);

  beginShape();
  for (let i = 0; i <= passos; i++) {
    vertex(bordaSup[i].x, bordaSup[i].y);
  }
  for (let i = passos; i >= 0; i--) {
    vertex(bordaInf[i].x, bordaInf[i].y);
  }
  endShape(CLOSE);

  // [AJUSTE ANTERIOR] Detalhes das páginas durante a transição no ar:
  stroke(165, 45, 38, 120);
  strokeWeight(1.0);
  noFill();
  beginShape();
  for (let i = 2; i <= passos - 2; i++) {
    vertex(lerp(bordaSup[i].x, bordaInf[i].x, 0.08), lerp(bordaSup[i].y, bordaInf[i].y, 0.08));
  }
  for (let i = passos - 2; i >= 2; i--) {
    vertex(lerp(bordaSup[i].x, bordaInf[i].x, 0.92), lerp(bordaSup[i].y, bordaInf[i].y, 0.92));
  }
  endShape(CLOSE);

  fill(160, 40, 35, 145);
  noStroke();
  beginShape();
  for (let i = 3; i <= 7; i++) {
    vertex(lerp(bordaSup[i].x, bordaInf[i].x, 0.14), lerp(bordaSup[i].y, bordaInf[i].y, 0.14));
  }
  for (let i = 7; i >= 3; i--) {
    vertex(lerp(bordaSup[i].x, bordaInf[i].x, 0.28), lerp(bordaSup[i].y, bordaInf[i].y, 0.28));
  }
  endShape(CLOSE);

  stroke(85, 58, 36, 140);
  strokeWeight(1.3);
  noFill();
  for (let lin = 0.18; lin <= 0.84; lin += 0.08) {
    let ini = (lin < 0.30) ? 9 : 3;
    beginShape();
    for (let i = ini; i <= passos - 3; i++) {
      let bx = lerp(bordaSup[i].x, bordaInf[i].x, lin);
      let by = lerp(bordaSup[i].y, bordaInf[i].y, lin) + sin(i * 1.4 + lin * 20) * 1.1;
      vertex(bx, by);
    }
    endShape();
  }
}

// =========================================================================
// 4. FAÍSCAS DAS FIVELAS, POEIRA MÁGICA E VINHETA
// =========================================================================

function gerarExplosaoFivelas(x, y) {
  for (let i = 0; i < 24; i++) {
    let ang = random(TWO_PI);
    let vel = random(2.5, 8.5);
    faiscas.push({
      x: x,
      y: y,
      vx: cos(ang) * vel,
      vy: sin(ang) * vel - 1.5,
      vida: 255,
      tam: random(4, 8)
    });
  }
}

function atualizarDesenharFaiscas() {
  noStroke();
  for (let i = faiscas.length - 1; i >= 0; i--) {
    let f = faiscas[i];
    f.x += f.vx;
    f.y += f.vy;
    f.vy += 0.18;
    f.vida -= 7;

    if (f.vida <= 0) {
      faiscas.splice(i, 1);
    } else {
      fill(255, 220, 95, f.vida);
      ellipse(f.x, f.y, f.tam, f.tam);
      fill(255, 255, 220, f.vida);
      ellipse(f.x, f.y, f.tam * 0.45, f.tam * 0.45);
    }
  }
}

function desenharPoeiraMagica(t) {
  noStroke();
  for (let p of poeira) {
    let alfa = map(sin(t * 2.5 + p.fase), -1, 1, 30, p.brilho);
    fill(255, 205, 95, alfa * 0.35);
    ellipse(p.x, p.y, p.r * 3.0);
    fill(255, 242, 180, alfa);
    ellipse(p.x, p.y, p.r);

    p.y += p.velY;
    p.x += sin(t * 1.2 + p.fase) * 0.35;

    if (p.y < -10) {
      p.y = height + 10;
      p.x = random(width);
    }
  }
}

function desenharVinhetaHUD(t) {
  let ctx = drawingContext;
  let gradV = ctx.createRadialGradient(
    width / 2, height / 2, height * 0.38,
    width / 2, height / 2, width * 0.65
  );
  gradV.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradV.addColorStop(1, "rgba(6, 2, 1, 0.68)");
  ctx.fillStyle = gradV;
  noStroke();
  rectMode(CORNER);
  rect(0, 0, width, height);

  let progresso = constrain(t / 36.0, 0, 1);
  fill(255, 210, 110, 85);
  rect(0, height - 3, width * progresso, 3);
}