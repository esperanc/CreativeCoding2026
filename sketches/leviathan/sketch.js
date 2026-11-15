/**
 * Projeto Final (Etapa 1/3) - Leviathan Abissal e Cinemática Procedural
 * Autor: Thalisson Braga
 * 
 * Implementa uma cadeia cinemática de 32 vértebras 3D com orientação por
 * matrizes de base ortonormal (Forward, Right, Up), malhas quitinosas
 * geradas via buildGeometry() e bioluminescência reativa no p5.js v2.
 */

let skullGeom;
let jawGeom;
let vertebraGeom;
let ribPairGeom;
let pectoralFinGeom;
let tailFlukeGeom;
let abyssDomeGeom;
let hydroVentsGeom;
let marineSnowGeom;

const NUM_SEGMENTS = 32;
const SEG_SPACING = 24;
let spineNodes = [];

let huntCursorMode = false;
let headPos;
let headVel;
let lurePos;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  // 1. Crânio Encouraçado do Leviathan (Com chifre frontal e cristas oculares)
  skullGeom = buildGeometry(createLeviathanSkullMesh);
  skullGeom.computeNormals();

  // 2. Mandíbula Inferior Articulada com Presas
  jawGeom = buildGeometry(createLeviathanJawMesh);
  jawGeom.computeNormals();

  // 3. Vértebra Blindada com Espinho Dorsal
  vertebraGeom = buildGeometry(createVertebraSegmentMesh);
  vertebraGeom.computeNormals();

  // 4. Par de Costelas Abissais Curvas
  ribPairGeom = buildGeometry(createRibPairMesh);
  ribPairGeom.computeNormals();

  // 5. Barbatana Peitoral / Asa Hidrodinâmica
  pectoralFinGeom = buildGeometry(createPectoralFinMesh);
  pectoralFinGeom.computeNormals();

  // 6. Leque Caudal Propulsor
  tailFlukeGeom = buildGeometry(createTailFlukeMesh);
  tailFlukeGeom.computeNormals();

  // 7. Cenário Abissal: Cúpula Oceânica, Fontes Hidrotermais e Plâncton
  abyssDomeGeom = buildGeometry(createAbyssDomeMesh);
  hydroVentsGeom = buildGeometry(createHydrothermalVentsMesh);
  hydroVentsGeom.computeNormals();
  marineSnowGeom = buildGeometry(createMarineSnowMesh);

  // Inicializa a cadeia cinemática da coluna vertebral
  headPos = createVector(0, 0, 0);
  headVel = createVector(0, 0, 4.5);
  lurePos = createVector(0, 0, 150);

  for (let i = 0; i < NUM_SEGMENTS; i++) {
    spineNodes.push({
      pos: createVector(0, 0, -i * SEG_SPACING),
      forward: createVector(0, 0, 1),
      up: createVector(0, 1, 0),
      right: createVector(1, 0, 0)
    });
  }
}

function draw() {
  background(2, 5, 10);
  orbitControl(1.2, 1.2, 0.15);

  let t = millis() * 0.002;

  // Atualiza a cinemática da cabeça e resolve a cadeia de vértebras
  updateLeviathanKinematics(t);

  // --- ILUMINAÇÃO ABISSAL E BIOLUMINESCENTE ---
  ambientLight(12, 24, 38);
  // Luz solar residual filtrada vinda da superfície muito distante
  directionalLight(35, 95, 145, -0.2, 1.0, -0.3);
  // Contraluz vulcânica quente vinda das fontes hidrotermais no fundo
  directionalLight(160, 55, 25, 0.3, -1.0, 0.2);

  // Luz bioluminescente que viaja como um pulso neural pela espinha do Leviathan
  let pulseIdx = floor(((t * 8.0) % NUM_SEGMENTS));
  let pulseNode = spineNodes[pulseIdx];
  pointLight(0, 245, 255, pulseNode.pos.x, pulseNode.pos.y, pulseNode.pos.z);

  // Luz da isca / presa
  pointLight(255, 80, 160, lurePos.x, lurePos.y, lurePos.z);

  // --- 1. AMBIENTE DA FOSSA ABISSAL ---
  drawAbyssEnvironment(t);

  // --- 2. ISCA BIOLUMINESCENTE (Visível e mais intensa no modo de caça) ---
  drawBioluminescentLure(t);

  // --- 3. RENDERIZAÇÃO DO LEVIATHAN ARTICULADO ---
  drawLeviathanBody(t);
}

/**
 * Atualiza a trajetória da cabeça e resolve as restrições de distância (IK/Follow-the-leader)
 */
function updateLeviathanKinematics(t) {
  let targetPos;

  if (huntCursorMode) {
    // Mapeia o mouse para uma coordenada 3D de caça na fossa
    let mx = map(mouseX, 0, width, -420, 420);
    let my = map(mouseY, 0, height, -260, 260);
    let mz = sin(t * 0.9) * 220;
    lurePos.lerp(createVector(mx, my, mz), 0.12);
    targetPos = lurePos.copy();
  } else {
    // Patrulha autônoma em curva de Lissajous 3D (nado majestoso em oito inclinado)
    targetPos = createVector(
      sin(t * 0.55) * 370,
      sin(t * 1.1) * 115 + cos(t * 0.35) * 45,
      cos(t * 0.55) * 340
    );
    lurePos.lerp(targetPos, 0.08);
  }

  // Direção desejada + ondulação muscular da cabeça (S-curve de nado)
  let desired = p5.Vector.sub(targetPos, headPos);
  let distToTarget = desired.mag();
  let speed = huntCursorMode ? constrain(map(distToTarget, 0, 350, 2.5, 7.5), 2.5, 7.5) : 4.8;

  if (distToTarget > 1.0) {
    desired.normalize();
  } else {
    desired = headVel.copy().normalize();
  }

  // Adiciona oscilação lateral de nado ao vetor de direção
  let swimWave = sin(t * 3.8) * 0.26;
  let sideDir = createVector(-desired.z, 0, desired.x).normalize();
  desired.add(p5.Vector.mult(sideDir, swimWave));
  desired.normalize();
  desired.mult(speed);

  // Inércia suave de virada da cabeça
  headVel.lerp(desired, 0.08);
  headPos.add(headVel);

  // Nó 0 (Cabeça)
  spineNodes[0].pos.set(headPos);
  spineNodes[0].forward = headVel.copy().normalize();

  // Resolve a cadeia cinemática para as 31 vértebras seguintes
  for (let i = 1; i < NUM_SEGMENTS; i++) {
    let prev = spineNodes[i - 1];
    let curr = spineNodes[i];

    // Deslocamento lateral progressivo (onda propulsora que cresce em direção à cauda)
    let waveAmp = map(i, 0, NUM_SEGMENTS, 0.4, 3.2);
    let wavePhase = t * 5.2 - i * 0.38;
    let lateralOffset = p5.Vector.mult(prev.right, sin(wavePhase) * waveAmp);

    let dir = p5.Vector.sub(prev.pos, curr.pos);
    dir.add(lateralOffset);

    if (dir.magSq() > 0.0001) {
      dir.normalize();
    } else {
      dir.set(0, 0, 1);
    }

    // Restrição de comprimento rígido entre vértebras
    curr.pos = p5.Vector.sub(prev.pos, p5.Vector.mult(dir, SEG_SPACING));
    curr.forward.set(dir);
  }

  // Constrói a base ortonormal (Forward, Right, Up) livre de torção brusca para cada vértebra
  let worldUp = createVector(0, -1, 0);
  for (let i = 0; i < NUM_SEGMENTS; i++) {
    let node = spineNodes[i];
    let r = p5.Vector.cross(node.forward, worldUp);
    if (r.magSq() < 0.001) {
      r = createVector(1, 0, 0);
    } else {
      r.normalize();
    }
    let u = p5.Vector.cross(r, node.forward).normalize();
    node.right = r;
    node.up = u;
  }
}

/**
 * Desenha o crânio, mandíbulas, vértebras, costelas, barbatanas e órgãos bioluminescentes
 */
function drawLeviathanBody(t) {
  noStroke();
  let distToLure = p5.Vector.dist(headPos, lurePos);

  for (let i = 0; i < NUM_SEGMENTS; i++) {
    let node = spineNodes[i];
    let u = i / (NUM_SEGMENTS - 1);

    push();
    translate(node.pos.x, node.pos.y, node.pos.z);
    // Aplica a matriz de rotação 3D alinhada ao vetor tangente da vértebra
    applyOrientationMatrix(node.right, node.up, node.forward);

    if (i === 0) {
      // --- CRÂNIO ENCOURAÇADO E MANDÍBULA ARTICULADA ---
      applyChitinMaterial("carapace");
      model(skullGeom);

      // Olhos abissais múltiplos (3 pares de olhos incandescentes nas laterais do crânio)
      emissiveMaterial(0, 255, 230);
      for (let e = 0; e < 3; e++) {
        let ex = 19 + e * 3.5;
        let ey = -6 - e * 2.5;
        let ez = 18 - e * 10;
        push(); translate(ex, ey, ez); sphere(3.6 - e * 0.5, 8, 6); pop();
        push(); translate(-ex, ey, ez); sphere(3.6 - e * 0.5, 8, 6); pop();
      }

      // Mandíbula inferior: abre agressivamente quando está perto da isca ou rugindo
      let biteOpen = map(constrain(distToLure, 40, 240), 40, 240, 0.68, 0.14);
      biteOpen += sin(t * 3.2) * 0.08;
      push();
      translate(0, 8, -5);
      rotateX(biteOpen);
      applyChitinMaterial("jaw");
      model(jawGeom);
      pop();

    } else {
      // Perfil afilado do corpo (mais robusto no tórax, esguio na cauda)
      let bodyScale = sin(pow(1.0 - u, 0.75) * PI * 0.85) * 1.15 + 0.18;
      scale(bodyScale);

      // Vértebra quitinosa blindada
      applyChitinMaterial("carapace");
      model(vertebraGeom);

      // Par de costelas arqueadas nos segmentos torácicos e abdominais
      if (i >= 2 && i <= 24) {
        applyChitinMaterial("ribs");
        model(ribPairGeom);
      }

      // Grandes Barbatanas Peitorais (Asas Abissais no segmento 3) e Pélvicas (segmento 14)
      if (i === 3 || i === 14) {
        let finScale = (i === 3) ? 1.35 : 0.78;
        let finFlap = sin(t * 3.8 - i * 0.4) * 0.38;

        for (let side = -1; side <= 1; side += 2) {
          push();
          scale(side * finScale, finScale, finScale);
          rotateZ(finFlap);
          applyChitinMaterial("fin");
          model(pectoralFinGeom);
          pop();
        }
      }

      // Leque Caudal no último segmento
      if (i === NUM_SEGMENTS - 1) {
        push();
        scale(2.4);
        applyChitinMaterial("fin");
        model(tailFlukeGeom);
        pop();
      }

      // --- NÚCLEO BIOLUMINESCENTE PULSANTE DENTRO DA CAIXA TORÁCICA ---
      let waveGlow = pow(max(0, sin(t * 7.5 - i * 0.45)), 3.0);
      let rCol = lerp(0, 160, waveGlow);
      let gCol = lerp(110, 255, waveGlow);
      let bCol = lerp(165, 255, waveGlow);

      push();
      translate(0, 4, 0);
      emissiveMaterial(rCol, gCol, bCol);
      sphere(7.5 + waveGlow * 4.5, 8, 6);
      pop();
    }

    pop();
  }
}

/**
 * Aplica uma matriz 4x4 a partir dos vetores ortonormais (Right, Up, Forward)
 */
function applyOrientationMatrix(r, u, f) {
  applyMatrix(
    r.x, r.y, r.z, 0,
    u.x, u.y, u.z, 0,
    f.x, f.y, f.z, 0,
    0,   0,   0,   1
  );
}

/**
 * Materiais da carapaça abissal (quitina azul-petróleo escura com reflexo especular úmido)
 */
function applyChitinMaterial(part) {
  noStroke();
  if (part === "carapace") {
    fill(18, 34, 48);
    specularMaterial(130, 220, 245);
    shininess(85);
  } else if (part === "jaw") {
    fill(28, 44, 58);
    specularMaterial(180, 235, 255);
    shininess(95);
  } else if (part === "ribs") {
    fill(32, 56, 72);
    specularMaterial(110, 210, 235);
    shininess(70);
  } else if (part === "fin") {
    fill(14, 72, 96);
    specularMaterial(90, 255, 240);
    shininess(50);
  }
}

/**
 * Renderiza o cenário submarino (Cúpula Abissal, Chaminés Hidrotermais e Neve Marinha)
 */
function drawAbyssEnvironment(t) {
  noStroke();

  // 1. Cúpula de profundidade oceânica
  push();
  model(abyssDomeGeom);
  pop();

  // 2. Chaminés Hidrotermais Vulcânicas no leito da fossa
  push();
  translate(0, 340, 0);
  fill(16, 20, 26);
  specularMaterial(60, 80, 100);
  shininess(30);
  model(hydroVentsGeom);
  pop();

  // 3. Plâncton bioluminescente e neve marinha subindo pelas correntes térmicas
  push();
  rotateY(t * 0.06);
  translate(0, -((t * 28) % 300), 0);
  emissiveMaterial(60, 210, 230);
  model(marineSnowGeom);
  pop();
}

/**
 * Desenha a isca luminosa que atrai o predador no modo de caça
 */
function drawBioluminescentLure(t) {
  push();
  translate(lurePos.x, lurePos.y, lurePos.z);
  rotateY(t * 3.0);
  rotateZ(t * 2.0);
  noStroke();
  emissiveMaterial(255, 70, 175);
  let s = huntCursorMode ? 10 + sin(t * 10) * 3 : 5;
  sphere(s, 10, 8);
  pop();
}

/**
 * Malha 3D do Crânio Encouraçado do Leviathan com Chifre de Aríete e Crista Craniana
 */
function createLeviathanSkullMesh() {
  let hornTip = createVector(0, -4, 68);
  let snoutL  = createVector(-18, 2, 32);
  let snoutR  = createVector(18, 2, 32);
  let browTop = createVector(0, -18, 16);
  let cheekL  = createVector(-28, 6, -4);
  let cheekR  = createVector(28, 6, -4);
  let crestL  = createVector(-34, -24, -26);
  let crestR  = createVector(34, -24, -26);
  let crestM  = createVector(0, -32, -32);
  let baseB   = createVector(0, 10, -18);

  beginShape(TRIANGLES);
  // Topo do rostro e chifre frontal
  addTriangle(snoutL, hornTip, browTop);
  addTriangle(hornTip, snoutR, browTop);

  // Placas laterais do crânio
  addTriangle(cheekL, snoutL, browTop);
  addTriangle(snoutR, cheekR, browTop);

  // Coroa craniana traseira (escudo estilo Leviathan)
  addTriangle(crestL, cheekL, browTop);
  addTriangle(cheekR, crestR, browTop);
  addTriangle(crestL, browTop, crestM);
  addTriangle(browTop, crestR, crestM);

  // Fechamento inferior do crânio superior
  addTriangle(snoutR, hornTip, snoutL);
  addTriangle(cheekL, baseB, snoutL);
  addTriangle(snoutR, baseB, cheekR);
  addTriangle(snoutL, baseB, snoutR);
  addTriangle(crestL, baseB, cheekL);
  addTriangle(cheekR, baseB, crestR);
  addTriangle(crestM, baseB, crestL);
  addTriangle(crestR, baseB, crestM);
  endShape();
}

/**
 * Malha 3D da Mandíbula Inferior com Presas Afiadas
 */
function createLeviathanJawMesh() {
  let chinTip = createVector(0, 4, 48);
  let jawL    = createVector(-16, 0, 20);
  let jawR    = createVector(16, 0, 20);
  let hingeL  = createVector(-22, -2, -6);
  let hingeR  = createVector(22, -2, -6);
  let throat  = createVector(0, 12, 8);

  beginShape(TRIANGLES);
  addTriangle(jawL, chinTip, throat);
  addTriangle(chinTip, jawR, throat);
  addTriangle(hingeL, jawL, throat);
  addTriangle(jawR, hingeR, throat);
  addTriangle(jawL, hingeL, jawR);
  addTriangle(hingeL, hingeR, jawR);
  addTriangle(jawL, jawR, chinTip);

  // 4 Presas inferiores projetadas para cima
  let fangCoords = [
    createVector(-10, 0, 32),
    createVector(10, 0, 32),
    createVector(-15, -1, 14),
    createVector(15, -1, 14)
  ];
  for (let fc of fangCoords) {
    let tip = createVector(fc.x * 1.05, fc.y - 12, fc.z + 4);
    let b1 = createVector(fc.x - 2.5, fc.y, fc.z - 2.5);
    let b2 = createVector(fc.x + 2.5, fc.y, fc.z - 2.5);
    let b3 = createVector(fc.x, fc.y, fc.z + 3.5);
    addTriangle(b1, b2, tip);
    addTriangle(b2, b3, tip);
    addTriangle(b3, b1, tip);
  }
  endShape();
}

/**
 * Malha 3D de uma Vértebra Quitinosa com Espinho Dorsal Alto
 */
function createVertebraSegmentMesh() {
  let r = 14;
  let len = 14;

  let fTop = createVector(0, -r, len);
  let fBot = createVector(0, r * 0.8, len);
  let fL   = createVector(-r * 1.2, 0, len);
  let fR   = createVector(r * 1.2, 0, len);

  let bTop = createVector(0, -r * 0.85, -len);
  let bBot = createVector(0, r * 0.7, -len);
  let bL   = createVector(-r, 0, -len);
  let bR   = createVector(r, 0, -len);

  // Quilha / Espinho Dorsal curvado para trás
  let spineTip = createVector(0, -r * 2.7, -len * 0.6);

  beginShape(TRIANGLES);
  // Corpo prismático da vértebra
  addQuadTriangles(fTop, fR, bR, bTop);
  addQuadTriangles(fR, fBot, bBot, bR);
  addQuadTriangles(fBot, fL, bL, bBot);
  addQuadTriangles(fL, fTop, bTop, bL);

  // Espinho dorsal piramidal
  addTriangle(fTop, fR, spineTip);
  addTriangle(fL, fTop, spineTip);
  addTriangle(bR, bTop, spineTip);
  addTriangle(bTop, bL, spineTip);
  endShape();
}

/**
 * Malha 3D de um Par de Costelas Abissais Envolventes
 */
function createRibPairMesh() {
  let steps = 7;
  beginShape(TRIANGLES);
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < steps; i++) {
      let t1 = i / steps;
      let t2 = (i + 1) / steps;

      let a1 = map(t1, 0, 1, -0.2, PI * 0.78);
      let a2 = map(t2, 0, 1, -0.2, PI * 0.78);

      let rad1 = 26 * sin(t1 * PI * 0.85) + 10;
      let rad2 = 26 * sin(t2 * PI * 0.85) + 10;
      let thick1 = (1.0 - t1 * 0.75) * 3.8;
      let thick2 = (1.0 - t2 * 0.75) * 3.8;

      let c1 = createVector(side * sin(a1) * rad1, -cos(a1) * rad1 + 6, -t1 * 10);
      let c2 = createVector(side * sin(a2) * rad2, -cos(a2) * rad2 + 6, -t2 * 10);

      let p1 = createVector(c1.x, c1.y, c1.z + thick1);
      let p2 = createVector(c2.x, c2.y, c2.z + thick2);
      let p3 = createVector(c2.x, c2.y, c2.z - thick2);
      let p4 = createVector(c1.x, c1.y, c1.z - thick1);

      if (side === 1) {
        addQuadTriangles(p1, p2, p3, p4);
        addQuadTriangles(p4, p3, p2, p1);
      } else {
        addQuadTriangles(p2, p1, p4, p3);
        addQuadTriangles(p3, p4, p1, p2);
      }
    }
  }
  endShape();
}

/**
 * Malha 3D da Barbatana Peitoral em Formato de Asa Serrilhada
 */
function createPectoralFinMesh() {
  let rootF = createVector(10, 2, 10);
  let rootB = createVector(10, 2, -14);
  let midRidge = createVector(58, 6, -12);
  let wingTip = createVector(115, 16, -42);
  let trailing1 = createVector(72, 12, -38);
  let trailing2 = createVector(38, 8, -28);

  beginShape(TRIANGLES);
  // Face superior e inferior da membrana
  addTriangle(rootF, wingTip, midRidge);
  addTriangle(midRidge, rootF, wingTip);

  addTriangle(midRidge, wingTip, trailing1);
  addTriangle(trailing1, wingTip, midRidge);

  addTriangle(rootB, midRidge, trailing2);
  addTriangle(trailing2, midRidge, rootB);

  addTriangle(midRidge, trailing1, trailing2);
  addTriangle(trailing2, trailing1, midRidge);
  endShape();
}

/**
 * Malha 3D do Leque Caudal Propulsor
 */
function createTailFlukeMesh() {
  let base = createVector(0, 0, 8);
  let centerNotch = createVector(0, 0, -32);
  let tipL = createVector(-34, 0, -46);
  let tipR = createVector(34, 0, -46);
  let ridgeTop = createVector(0, -5, -12);
  let ridgeBot = createVector(0, 5, -12);

  beginShape(TRIANGLES);
  addTriangle(base, tipL, ridgeTop);
  addTriangle(tipL, centerNotch, ridgeTop);
  addTriangle(centerNotch, tipR, ridgeTop);
  addTriangle(tipR, base, ridgeTop);

  addTriangle(tipL, base, ridgeBot);
  addTriangle(centerNotch, tipL, ridgeBot);
  addTriangle(tipR, centerNotch, ridgeBot);
  addTriangle(base, tipR, ridgeBot);
  endShape();
}

/**
 * Cúpula Abissal com Gradiente de Profundidade Oceânica
 */
function createAbyssDomeMesh() {
  let r = 1700;
  let latSteps = 14;
  let lonSteps = 24;

  beginShape(TRIANGLES);
  for (let i = 0; i < latSteps; i++) {
    let lat1 = map(i, 0, latSteps, -HALF_PI, HALF_PI);
    let lat2 = map(i + 1, 0, latSteps, -HALF_PI, HALF_PI);

    // No topo (-HALF_PI) há um leve azul oceânico; no fundo (+HALF_PI) escuridão abissal
    let u1 = 1.0 - (i / latSteps);
    let u2 = 1.0 - ((i + 1) / latSteps);
    let c1 = color(lerp(2, 10, u1), lerp(4, 38, pow(u1, 2)), lerp(9, 68, pow(u1, 1.6)));
    let c2 = color(lerp(2, 10, u2), lerp(4, 38, pow(u2, 2)), lerp(9, 68, pow(u2, 1.6)));

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

/**
 * Chaminés Hidrotermais Abissais Dispostas em Anel no Fundo da Fossa
 */
function createHydrothermalVentsMesh() {
  let numVents = 14;
  let ringR = 680;
  beginShape(TRIANGLES);
  for (let i = 0; i < numVents; i++) {
    let a = (TWO_PI / numVents) * i;
    let cx = cos(a) * ringR;
    let cz = sin(a) * ringR;
    let h = 180 + (i % 3) * 95;
    let rBase = 55;
    let rTop = 18;
    let sides = 6;

    for (let s = 0; s < sides; s++) {
      let sa1 = (TWO_PI / sides) * s;
      let sa2 = (TWO_PI / sides) * (s + 1);

      let b1 = createVector(cx + cos(sa1) * rBase, 120, cz + sin(sa1) * rBase);
      let b2 = createVector(cx + cos(sa2) * rBase, 120, cz + sin(sa2) * rBase);
      let t1 = createVector(cx + cos(sa1) * rTop, 120 - h, cz + sin(sa1) * rTop);
      let t2 = createVector(cx + cos(sa2) * rTop, 120 - h, cz + sin(sa2) * rTop);

      addQuadTriangles(t1, t2, b2, b1);
    }
  }
  endShape();
}

/**
 * Partículas de Neve Marinha e Plâncton Bioluminescente
 */
function createMarineSnowMesh() {
  let count = 160;
  beginShape(TRIANGLES);
  for (let i = 0; i < count; i++) {
    let a = (i * 137.5) * (PI / 180);
    let r = 140 + (i * 37) % 680;
    let x = cos(a) * r;
    let z = sin(a) * r;
    let y = ((i * 73) % 900) - 450;
    let s = 2.5 + (i % 3) * 1.2;

    let p1 = createVector(x, y - s, z);
    let p2 = createVector(x + s, y + s, z);
    let p3 = createVector(x - s, y + s, z);
    addTriangle(p1, p2, p3);
  }
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
  huntCursorMode = !huntCursorMode;
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('thumbnail', 'png');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}