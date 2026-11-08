/**
 * Artefato da Semana 10 - Serafim / Ophanim Cinético (Biblically Accurate Angel)
 * Combina cinemática de íris articulada (6 asas que blindam o núcleo)
 * com anéis giroscópicos cravados de olhos 3D e Santuário Empíreo via buildGeometry().
 */

let featherGeom;
let ophanimRingGeom;
let eyeSocketGeom;
let pupilSlitGeom;
let haloSpikeGeom;

// Geometrias do Fundo (Santuário Empíreo)
let skyDomeGeom;
let godRaysGeom;
let sanctuaryPillarsGeom;
let sacredDustGeom;

const NUM_WINGS = 6;
const FEATHERS_PER_WING = 7;
let manualMode = false;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  // 1. Pena/Lâmina facetada com crista afiada (usada nas 6 asas)
  featherGeom = buildGeometry(createFeatherBladeMesh);
  featherGeom.computeNormals();

  // 2. Anel de Ophanim chanfrado com engastes para os olhos
  ophanimRingGeom = buildGeometry(() => createOphanimWheelMesh(135, 162, 24, 14));
  ophanimRingGeom.computeNormals();

  // 3. Cápsula amendoada (pálpebras facetadas dos olhos)
  eyeSocketGeom = buildGeometry(createEyeSocketMesh);
  eyeSocketGeom.computeNormals();

  // 4. Pupila vertical em formato de losango abobadado
  pupilSlitGeom = buildGeometry(createPupilSlitMesh);
  pupilSlitGeom.computeNormals();

  // 5. Espinho geométrico da coroa/auréola traseira
  haloSpikeGeom = buildGeometry(createHaloSpikeMesh);
  haloSpikeGeom.computeNormals();

  // --- GEOMETRIAS DO FUNDO ---
  skyDomeGeom = buildGeometry(createSkyDomeMesh);
  godRaysGeom = buildGeometry(createGodRaysMesh);
  sanctuaryPillarsGeom = buildGeometry(createSanctuaryPillarsMesh);
  sanctuaryPillarsGeom.computeNormals();
  sacredDustGeom = buildGeometry(createSacredDustMesh);
}

function draw() {
  background(7, 6, 11);
  orbitControl(1.2, 1.2, 0.15);

  let t = millis() * 0.0016;

  // Estado de revelação: 0.0 = Asas fechadas cobrindo o rosto | 1.0 = Serafim desperto
  let revelation;
  if (manualMode) {
    revelation = constrain(map(mouseX, 0, width, 0, 1), 0, 1);
  } else {
    // Linha corrigida com o fechamento adequado de parênteses
    revelation = constrain(map(sin(t * 1.1), -0.65, 0.65, 0, 1), 0, 1);
  }

  // --- ILUMINAÇÃO SACRA / ABISSAL ---
  ambientLight(35 + revelation * 25, 24, 42);
  directionalLight(255, 225, 170, -0.5, 0.6, -0.7);
  directionalLight(90, 120, 220, 0.7, -0.5, 0.4);

  // Luz divina/incandescente que emana do Olho Central quando as asas se abrem
  let coreGlow = map(revelation, 0, 1, 30, 255);
  pointLight(255, 80, 40, 0, 0, 60);
  pointLight(coreGlow, coreGlow * 0.65, coreGlow * 0.2, 0, 0, 180);

  // --- 0. RENDERIZAÇÃO DO FUNDO (SANTUÁRIO EMPÍREO) ---
  drawEmpyreanBackground(t, revelation);

  // Flutuação etérea do Serafim inteiro
  push();
  translate(0, sin(t * 2.0) * 14, 0);
  rotateX(0.15 + cos(t * 0.7) * 0.08);
  rotateY(sin(t * 0.5) * 0.22);

  // --- 1. AURÉOLA / COROA RADIAL TRASEIRA ---
  push();
  translate(0, 0, -90);
  rotateZ(t * 0.25);
  noStroke();
  fill(215, 175, 85);
  specularMaterial(255);
  shininess(90);
  let numSpikes = 16;
  for (let i = 0; i < numSpikes; i++) {
    push();
    rotateZ((TWO_PI / numSpikes) * i);
    translate(220, 0, 0);
    if (i % 2 === 1) scale(0.7, 0.7, 0.7);
    model(haloSpikeGeom);
    pop();
  }
  pop();

  // --- 2. TRONO DE RODAS (3 ANÉIS DE OPHANIM COM OLHOS) ---
  drawOphanimWheel(1.0, t * 1.1, t * 0.7, 0, 8, revelation);
  drawOphanimWheel(0.76, -t * 1.4, 0, t * 1.2, 6, revelation);
  drawOphanimWheel(0.54, t * 0.9, -t * 1.8, -t * 0.8, 6, revelation);

  // --- 3. NÚCLEO: O OLHO CENTRAL DO SERAFIM ---
  drawCentralSeraphEye(t, revelation);

  // --- 4. AS 6 ASAS ARTICULADAS (Mecanismo de Íris Tridimensional) ---
  for (let w = 0; w < NUM_WINGS; w++) {
    push();
    let wingAngle = (TWO_PI / NUM_WINGS) * w + PI / 6;
    rotateZ(wingAngle);

    // Raiz da asa ancorada ao redor dos anéis
    translate(155, 0, 15);

    let foldInward = map(revelation, 0, 1, 1.18, -0.35);
    let wingFlap = sin(t * 2.4 + w * 0.8) * (0.06 + revelation * 0.12);
    rotateY(foldInward + wingFlap);
    rotateX(map(revelation, 0, 1, 0.35, -0.15));

    // Desenha o leque de lâminas/penas como uma escotilha em camadas
    for (let f = 0; f < FEATHERS_PER_WING; f++) {
      push();
      let u = f / (FEATHERS_PER_WING - 1);
      let fanSpread = map(u, 0, 1, -0.45, 0.65) * (0.45 + 0.55 * revelation);
      let zOffset = (f - 3) * 4.5;
      let featherScale = map(f, 0, FEATHERS_PER_WING - 1, 1.15, 0.65);

      translate(0, 0, zOffset);
      rotateZ(fanSpread);
      scale(featherScale);

      // Alterna entre penas de obsidiana negra e penas de ouro sacro
      if (f === 0 || f === 3) {
        fill(220, 175, 75);
        specularMaterial(255);
        shininess(100);
      } else {
        fill(35, 32, 44);
        specularMaterial(230);
        shininess(80);
      }
      model(featherGeom);
      pop();
    }

    // Olho vigilante cravado na junta/articulação de cada asa
    push();
    translate(0, 0, 18);
    rotateY(HALF_PI);
    scale(0.45);
    drawSingleEye(revelation);
    pop();

    pop();
  }
  pop();
}

/**
 * Renderiza o cenário 3D ao redor do Serafim
 */
function drawEmpyreanBackground(t, revelation) {
  noStroke();

  // 1. Cúpula celeste com gradiente nos vértices (gira lentamente)
  push();
  rotateY(t * 0.05);
  model(skyDomeGeom);
  pop();

  // 2. Feixes de luz divina (God Rays) atrás do Serafim, pulsando com 'revelation'
  push();
  translate(0, 0, -420);
  let rayScale = map(revelation, 0, 1, 0.65, 1.35);
  scale(rayScale);
  rotateZ(-t * 0.12);
  model(godRaysGeom);
  pop();

  // Segunda camada de raios em rotação oposta
  push();
  translate(0, 0, -460);
  scale(rayScale * 0.85);
  rotateZ(t * 0.08);
  model(godRaysGeom);
  pop();

  // 3. Colunata de Monólitos do Santuário (arquitetura sacra distante)
  push();
  rotateY(-t * 0.08);
  rotateX(sin(t * 0.2) * 0.05);
  fill(28, 22, 36);
  specularMaterial(200, 160, 90);
  shininess(60);
  model(sanctuaryPillarsGeom);
  pop();

  // 4. Poeira de ouro / brasas ascendentes no espaço 3D
  push();
  rotateY(t * 0.15);
  translate(0, -((t * 40) % 200), 0);
  emissiveMaterial(255, 190, 90);
  model(sacredDustGeom);
  pop();
}

/**
 * Constrói uma grande esfera envolvente com cores por vértice (gradiente abissal/celeste)
 */
function createSkyDomeMesh() {
  let r = 1800;
  let latSteps = 16;
  let lonSteps = 24;

  beginShape(TRIANGLES);
  for (let i = 0; i < latSteps; i++) {
    let lat1 = map(i, 0, latSteps, -HALF_PI, HALF_PI);
    let lat2 = map(i + 1, 0, latSteps, -HALF_PI, HALF_PI);

    let c1 = getSkyColor(i / latSteps);
    let c2 = getSkyColor((i + 1) / latSteps);

    for (let j = 0; j < lonSteps; j++) {
      let lon1 = map(j, 0, lonSteps, 0, TWO_PI);
      let lon2 = map(j + 1, 0, lonSteps, 0, TWO_PI);

      let p1 = createVector(r * cos(lat1) * cos(lon1), r * sin(lat1), r * cos(lat1) * sin(lon1));
      let p2 = createVector(r * cos(lat1) * cos(lon2), r * sin(lat1), r * cos(lat1) * sin(lon2));
      let p3 = createVector(r * cos(lat2) * cos(lon2), r * sin(lat2), r * cos(lat2) * sin(lon2));
      let p4 = createVector(r * cos(lat2) * cos(lon1), r * sin(lat2), r * cos(lat2) * sin(lon1));

      fill(c1); vertex(p1.x, p1.y, p1.z);
      fill(c1); vertex(p2.x, p2.y, p2.z);
      fill(c2); vertex(p3.x, p3.y, p3.z);

      fill(c1); vertex(p1.x, p1.y, p1.z);
      fill(c2); vertex(p3.x, p3.y, p3.z);
      fill(c2); vertex(p4.x, p4.y, p4.z);
    }
  }
  endShape();
}

function getSkyColor(v) {
  let horizonGlow = 1.0 - abs(v - 0.5) * 2.0;
  horizonGlow = pow(horizonGlow, 1.8);
  let r = lerp(6, 52, horizonGlow);
  let g = lerp(5, 18, horizonGlow);
  let b = lerp(14, 48, horizonGlow);
  return color(r, g, b);
}

/**
 * Constrói uma mandala de feixes de luz divina (God Rays) com transparência gradual
 */
function createGodRaysMesh() {
  let numRays = 24;
  let innerR = 40;
  let outerR = 950;

  beginShape(TRIANGLES);
  for (let i = 0; i < numRays; i++) {
    let a = (TWO_PI / numRays) * i;
    let spread = (i % 2 === 0) ? 0.065 : 0.03;
    let rayLen = (i % 2 === 0) ? outerR : outerR * 0.68;

    fill(255, 195, 95, 110);
    vertex(cos(a) * innerR, sin(a) * innerR, 0);

    fill(180, 50, 30, 0);
    vertex(cos(a - spread) * rayLen, sin(a - spread) * rayLen, 0);
    vertex(cos(a + spread) * rayLen, sin(a + spread) * rayLen, 0);
  }

  let rings = [280, 440, 620];
  let segs = 48;
  for (let r of rings) {
    let thick = 3.5;
    for (let i = 0; i < segs; i++) {
      let a1 = (TWO_PI / segs) * i;
      let a2 = (TWO_PI / segs) * (i + 1);
      fill(230, 175, 80, 55);
      let p1 = createVector(cos(a1) * r, sin(a1) * r, 2);
      let p2 = createVector(cos(a2) * r, sin(a2) * r, 2);
      let p3 = createVector(cos(a2) * (r + thick), sin(a2) * (r + thick), 2);
      let p4 = createVector(cos(a1) * (r + thick), sin(a1) * (r + thick), 2);
      addQuadTriangles(p1, p2, p3, p4);
    }
  }
  endShape();
}

/**
 * Constrói um anel de monólitos/pilares góticos flutuantes ao redor da arena
 */
function createSanctuaryPillarsMesh() {
  let numPillars = 16;
  let ringRadius = 920;

  beginShape(TRIANGLES);
  for (let i = 0; i < numPillars; i++) {
    let angle = (TWO_PI / numPillars) * i;
    let cx = cos(angle) * ringRadius;
    let cz = sin(angle) * ringRadius;

    let h = (i % 2 === 0) ? 420 : 260;
    let yOffset = sin(i * 1.7) * 90;
    let w = 26;

    let pFront = createVector(cos(angle) * (ringRadius - w * 1.4), yOffset, sin(angle) * (ringRadius - w * 1.4));
    let pBack  = createVector(cos(angle) * (ringRadius + w * 1.4), yOffset, sin(angle) * (ringRadius + w * 1.4));
    let pLeft  = createVector(cx - sin(angle) * w, yOffset, cz + cos(angle) * w);
    let pRight = createVector(cx + sin(angle) * w, yOffset, cz - cos(angle) * w);

    let topApex = createVector(cx, yOffset - h * 1.25, cz);
    let botApex = createVector(cx, yOffset + h * 1.25, cz);

    let tF = p5.Vector.add(pFront, createVector(0, -h, 0));
    let tB = p5.Vector.add(pBack,  createVector(0, -h, 0));
    let tL = p5.Vector.add(pLeft,  createVector(0, -h, 0));
    let tR = p5.Vector.add(pRight, createVector(0, -h, 0));

    let bF = p5.Vector.add(pFront, createVector(0, h, 0));
    let bB = p5.Vector.add(pBack,  createVector(0, h, 0));
    let bL = p5.Vector.add(pLeft,  createVector(0, h, 0));
    let bR = p5.Vector.add(pRight, createVector(0, h, 0));

    addQuadTriangles(tF, tR, bR, bF);
    addQuadTriangles(tR, tB, bB, bR);
    addQuadTriangles(tB, tL, bL, bB);
    addQuadTriangles(tL, tF, bF, bL);

    addTriangle(tF, tL, topApex);
    addTriangle(tR, tF, topApex);
    addTriangle(tB, tR, topApex);
    addTriangle(tL, tB, topApex);

    addTriangle(bL, bF, botApex);
    addTriangle(bF, bR, botApex);
    addTriangle(bR, bB, botApex);
    addTriangle(bB, bL, botApex);
  }
  endShape();
}

/**
 * Constrói partículas de brasas/poeira dourada espalhadas no espaço 3D
 */
function createSacredDustMesh() {
  let numMotes = 140;
  beginShape(TRIANGLES);
  for (let i = 0; i < numMotes; i++) {
    let a = (i * 137.5) * (PI / 180);
    let r = 260 + (i * 43) % 620;
    let x = cos(a) * r;
    let z = sin(a) * r;
    let y = ((i * 89) % 1000) - 500;
    let s = 3.5 + (i % 4) * 1.5;

    let top = createVector(x, y - s * 1.8, z);
    let bot = createVector(x, y + s * 1.8, z);
    let l   = createVector(x - s, y, z);
    let rgt = createVector(x + s, y, z);

    addTriangle(top, rgt, bot);
    addTriangle(bot, l, top);
  }
  endShape();
}

/**
 * Desenha uma Roda de Ophanim com múltiplos olhos cravados no aro
 */
function drawOphanimWheel(scaleFactor, rx, ry, rz, numEyes, revelation) {
  push();
  scale(scaleFactor);
  rotateX(rx);
  rotateY(ry);
  rotateZ(rz);

  noStroke();
  fill(205, 155, 65);
  specularMaterial(255);
  shininess(95);
  model(ophanimRingGeom);

  for (let i = 0; i < numEyes; i++) {
    push();
    let a = (TWO_PI / numEyes) * i;
    rotateZ(a);
    translate(160, 0, 0);
    rotateY(HALF_PI);
    rotateZ(HALF_PI);
    scale(0.42);
    drawSingleEye(revelation);
    pop();
  }
  pop();
}

/**
 * Desenha o Olho Principal no centro do Serafim, que segue o mouse
 */
function drawCentralSeraphEye(t, revelation) {
  push();
  let lookY = map(mouseX - width / 2, -width / 2, width / 2, -0.55, 0.55);
  let lookX = map(mouseY - height / 2, -height / 2, height / 2, 0.45, -0.45);
  rotateY(lookY);
  rotateX(lookX);

  scale(1.35);
  drawSingleEye(revelation);

  let innerBlades = 8;
  for (let i = 0; i < innerBlades; i++) {
    push();
    rotateZ((TWO_PI / innerBlades) * i - t * 1.5);
    translate(36 + revelation * 10, 0, 0);
    scale(0.22);
    emissiveMaterial(255, 120, 30);
    model(haloSpikeGeom);
    pop();
  }
  pop();
}

/**
 * Renderiza um olho 3D composto por pálpebras facetadas, esclera e pupila emissiva
 */
function drawSingleEye(revelation) {
  noStroke();
  let lidOpen = map(revelation, 0, 1, 0.08, 0.65);

  push();
  rotateX(-lidOpen);
  fill(190, 145, 65);
  specularMaterial(255);
  shininess(90);
  model(eyeSocketGeom);
  pop();

  push();
  rotateZ(PI);
  rotateX(-lidOpen);
  fill(190, 145, 65);
  specularMaterial(255);
  shininess(90);
  model(eyeSocketGeom);
  pop();

  fill(22, 18, 28);
  specularMaterial(255);
  shininess(120);
  sphere(24, 14, 10);

  push();
  translate(0, 0, 21);
  let pulse = 1.0 + sin(millis() * 0.008) * 0.12;
  scale(pulse, 1.0, 1.0);
  emissiveMaterial(255, 70 + revelation * 110, 20);
  model(pupilSlitGeom);
  pop();
}

/**
 * Malha 3D de uma Pena/Lâmina curva e facetada (evolução da lâmina da íris)
 */
function createFeatherBladeMesh() {
  let steps = 12;
  let length = 210;
  let thickness = 9;

  let topEdge = [];
  let bottomEdge = [];
  let spineRidge = [];

  for (let i = 0; i <= steps; i++) {
    let u = i / steps;
    let x = u * length;
    let curveY = -pow(u, 1.6) * 65;
    let w = sin(u * PI) * 34 + (1 - u) * 14;

    topEdge.push(createVector(x, curveY - w * 0.45, 0));
    bottomEdge.push(createVector(x, curveY + w * 0.65, 0));
    spineRidge.push(createVector(x, curveY, thickness * (1 - u * 0.7)));
  }

  beginShape(TRIANGLES);
  for (let i = 0; i < steps; i++) {
    let t1 = topEdge[i], t2 = topEdge[i + 1];
    let b1 = bottomEdge[i], b2 = bottomEdge[i + 1];
    let s1 = spineRidge[i], s2 = spineRidge[i + 1];
    let sBack1 = createVector(s1.x, s1.y, -s1.z);
    let sBack2 = createVector(s2.x, s2.y, -s2.z);

    addQuadTriangles(t1, t2, s2, s1);
    addQuadTriangles(s1, s2, b2, b1);

    addQuadTriangles(t2, t1, sBack1, sBack2);
    addQuadTriangles(sBack2, sBack1, b1, b2);
  }
  endShape();
}

/**
 * Malha 3D da Roda de Ophanim com chanfro duplo e cristas externas
 */
function createOphanimWheelMesh(innerR, outerR, segments, depth) {
  let midR = (innerR + outerR) * 0.5;
  beginShape(TRIANGLES);
  for (let i = 0; i < segments; i++) {
    let a1 = (TWO_PI / segments) * i;
    let a2 = (TWO_PI / segments) * (i + 1);

    let rOut1 = (i % 2 === 0) ? outerR : outerR - 7;
    let rOut2 = ((i + 1) % 2 === 0) ? outerR : outerR - 7;

    let in1 = createVector(cos(a1) * innerR, sin(a1) * innerR, 0);
    let in2 = createVector(cos(a2) * innerR, sin(a2) * innerR, 0);
    let out1 = createVector(cos(a1) * rOut1, sin(a1) * rOut1, 0);
    let out2 = createVector(cos(a2) * rOut2, sin(a2) * rOut2, 0);

    let ridgeF1 = createVector(cos(a1) * midR, sin(a1) * midR, depth);
    let ridgeF2 = createVector(cos(a2) * midR, sin(a2) * midR, depth);
    let ridgeB1 = createVector(cos(a1) * midR, sin(a1) * midR, -depth);
    let ridgeB2 = createVector(cos(a2) * midR, sin(a2) * midR, -depth);

    addQuadTriangles(in1, in2, ridgeF2, ridgeF1);
    addQuadTriangles(ridgeF1, ridgeF2, out2, out1);
    addQuadTriangles(out1, out2, ridgeB2, ridgeB1);
    addQuadTriangles(ridgeB1, ridgeB2, in2, in1);
  }
  endShape();
}

/**
 * Malha 3D de uma pálpebra amendoada facetada
 */
function createEyeSocketMesh() {
  let steps = 10;
  let r = 26;
  beginShape(TRIANGLES);
  for (let i = 0; i < steps; i++) {
    let a1 = map(i, 0, steps, 0, PI);
    let a2 = map(i + 1, 0, steps, 0, PI);

    let f1 = createVector(cos(a1) * r * 1.3, sin(a1) * r * 0.25, sin(a1) * r);
    let f2 = createVector(cos(a2) * r * 1.3, sin(a2) * r * 0.25, sin(a2) * r);
    let top1 = createVector(cos(a1) * r * 1.1, sin(a1) * r * 0.95, sin(a1) * r * 0.4);
    let top2 = createVector(cos(a2) * r * 1.1, sin(a2) * r * 0.95, sin(a2) * r * 0.4);
    let back1 = createVector(cos(a1) * r * 1.2, 0, -sin(a1) * r * 0.5);
    let back2 = createVector(cos(a2) * r * 1.2, 0, -sin(a2) * r * 0.5);

    addQuadTriangles(f1, f2, top2, top1);
    addQuadTriangles(top1, top2, back2, back1);
  }
  endShape();
}

/**
 * Malha 3D da pupila vertical em losango afiado
 */
function createPupilSlitMesh() {
  let top = createVector(0, -16, 2);
  let bottom = createVector(0, 16, 2);
  let left = createVector(-6, 0, 2);
  let right = createVector(6, 0, 2);
  let apex = createVector(0, 0, 7);

  beginShape(TRIANGLES);
  addTriangle(top, right, apex);
  addTriangle(right, bottom, apex);
  addTriangle(bottom, left, apex);
  addTriangle(left, top, apex);
  endShape();
}

/**
 * Malha 3D de um raio/espinho piramidal para a auréola
 */
function createHaloSpikeMesh() {
  let tip = createVector(85, 0, 0);
  let b1 = createVector(0, -14, 0);
  let b2 = createVector(0, 0, 10);
  let b3 = createVector(0, 14, 0);
  let b4 = createVector(0, 0, -10);

  beginShape(TRIANGLES);
  addTriangle(b1, b2, tip);
  addTriangle(b2, b3, tip);
  addTriangle(b3, b4, tip);
  addTriangle(b4, b1, tip);
  endShape();
}

function addTriangle(v1, v2, v3) {
  vertex(v1.x, v1.y, v1.z);
  vertex(v2.x, v2.y, v2.z);
  vertex(v3.x, v3.y, v3.z);
}

function addQuadTriangles(v1, v2, v3, v4) {
  vertex(v1.x, v1.y, v1.z);
  vertex(v2.x, v2.y, v2.z);
  vertex(v3.x, v3.y, v3.z);

  vertex(v1.x, v1.y, v1.z);
  vertex(v3.x, v3.y, v3.z);
  vertex(v4.x, v4.y, v4.z);
}

function doubleClicked() {
  manualMode = !manualMode;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}