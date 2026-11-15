// ATA DAS COISAS QUE NÃO HOUVE — Entrega 1
// Paulo Vitor Couto Doederlein, 2026
// Um cartório algorítmico registra decisões e alternativas recusadas. O próprio
// sistema detecta seu hábito dominante, rasura atos e promove outros futuros.

const CELL = 34;
const INITIAL_WITNESSES = 32;
const MAX_WITNESSES = 120;
const MAX_RECORDS = 180;
const REVISION_INTERVAL = 540;
const DIRECTION_BINS = 8;

let witnesses = [];
let records = [];
let annotations = [];
let fieldX = null;
let fieldY = null;
let nextFieldX = null;
let nextFieldY = null;
let fieldCols = 0;
let fieldRows = 0;
let archiveLayer = null;
let archiveSeed = 0;
let nextRecordId = 1;
let epoch = 1;
let revisionClock = 0;
let activeRevision = null;
let paused = false;
let bgColor = null;
let runtimeError = '';
let renderTimer = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(60);
  bgColor = color(7, 14, 17);
  archiveSeed = floor(random(1000000));
  restartArchive();
  // O p5Front pode suspender requestAnimationFrame em previews embutidos.
  // Um relógio explícito mantém a obra ativa também nesse ambiente.
  noLoop();
  if (renderTimer !== null) {
    clearInterval(renderTimer);
  }
  renderTimer = setInterval(function requestArchiveFrame() {
    redraw();
  }, 1000 / 60);
}

function restartArchive() {
  randomSeed(archiveSeed);
  witnesses = [];
  records = [];
  annotations = [];
  nextRecordId = 1;
  epoch = 1;
  revisionClock = 0;
  activeRevision = null;
  initializeField();
  initializeArchiveLayer();

  for (let i = 0; i < INITIAL_WITNESSES; i += 1) {
    spawnEdgeWitness(false, i);
  }
  for (let i = 0; i < 7; i += 1) {
    spawnEdgeWitness(true, i + INITIAL_WITNESSES);
  }
}

function initializeField() {
  fieldCols = max(3, ceil(width / CELL));
  fieldRows = max(3, ceil(height / CELL));
  const count = fieldCols * fieldRows;
  fieldX = new Float32Array(count);
  fieldY = new Float32Array(count);
  nextFieldX = new Float32Array(count);
  nextFieldY = new Float32Array(count);

  // Tendência inicial determinística: complexidade sem recorrer a noise().
  for (let gy = 0; gy < fieldRows; gy += 1) {
    for (let gx = 0; gx < fieldCols; gx += 1) {
      const index = gx + gy * fieldCols;
      const phase = gx * 0.43 + gy * 0.67 + archiveSeed * 0.0007;
      fieldX[index] = cos(phase) * 0.018;
      fieldY[index] = sin(phase * 1.21) * 0.018;
    }
  }
}

function initializeArchiveLayer() {
  archiveLayer = createGraphics(width, height);
  archiveLayer.pixelDensity(1);
  archiveLayer.background(7, 14, 17);
  archiveLayer.strokeCap(SQUARE);
  archiveLayer.textFont('monospace');
}

function makeWitness(x, y, heading, rejected, originId) {
  return {
    x: x,
    y: y,
    px: x,
    py: y,
    vx: cos(heading) * random(1.0, 1.5),
    vy: sin(heading) * random(1.0, 1.5),
    rejected: rejected,
    originId: originId,
    age: 0,
    maxAge: rejected ? floor(random(850, 1450)) : floor(random(1000, 1800)),
    phase: random(TWO_PI),
    recordTimer: rejected ? floor(random(190, 320)) : floor(random(150, 270)),
    tickOffset: floor(random(18)),
    lineWidth: rejected ? random(0.65, 1.0) : random(0.8, 1.35)
  };
}

function spawnEdgeWitness(rejected, indexHint) {
  const side = indexHint % 4;
  let x = 0;
  let y = 0;
  const focusX = width * 0.5 + random(-width * 0.12, width * 0.12);
  const focusY = height * 0.5 + random(-height * 0.14, height * 0.14);

  if (side === 0) {
    x = -12;
    y = random(height * 0.08, height * 0.92);
  } else if (side === 1) {
    x = width + 12;
    y = random(height * 0.08, height * 0.92);
  } else if (side === 2) {
    x = random(width * 0.08, width * 0.92);
    y = -12;
  } else {
    x = random(width * 0.08, width * 0.92);
    y = height + 12;
  }

  let heading = atan2(focusY - y, focusX - x);
  if (rejected) {
    heading += random(-0.42, 0.42);
  }
  witnesses.push(makeWitness(x, y, heading, rejected, 0));
}

function draw() {
  background(bgColor);
  try {
    if (!paused) {
      fadeArchiveLayer();
      diffuseField();
      updateWitnesses();
      updateRecords();
      updateAnnotations();
      updateRevision();
      revisionClock += 1;
      if (revisionClock >= REVISION_INTERVAL) {
        reviseDominantHabit();
        revisionClock = 0;
      }
    }

    drawDocumentGrid();
    image(archiveLayer, 0, 0);
    drawRecords();
    drawAnnotations();
    drawRevisionPanel();
    drawInterface();
  } catch (error) {
    runtimeError = String(error && error.message ? error.message : error);
    console.error('Falha interna do arquivo:', error);
  }

  if (runtimeError !== '') {
    noStroke();
    fill(255, 91, 76);
    textFont('monospace');
    textSize(12);
    textAlign(LEFT, TOP);
    text('ERRO INTERNO: ' + runtimeError, 18, 118);
  }
}

function fadeArchiveLayer() {
  archiveLayer.noStroke();
  archiveLayer.fill(7, 14, 17, 1.25);
  archiveLayer.rect(0, 0, width, height);
}

function diffuseField() {
  for (let gy = 0; gy < fieldRows; gy += 1) {
    for (let gx = 0; gx < fieldCols; gx += 1) {
      const index = gx + gy * fieldCols;
      let totalX = fieldX[index] * 2;
      let totalY = fieldY[index] * 2;
      let weight = 2;
      if (gx > 0) {
        totalX += fieldX[index - 1];
        totalY += fieldY[index - 1];
        weight += 1;
      }
      if (gx < fieldCols - 1) {
        totalX += fieldX[index + 1];
        totalY += fieldY[index + 1];
        weight += 1;
      }
      if (gy > 0) {
        totalX += fieldX[index - fieldCols];
        totalY += fieldY[index - fieldCols];
        weight += 1;
      }
      if (gy < fieldRows - 1) {
        totalX += fieldX[index + fieldCols];
        totalY += fieldY[index + fieldCols];
        weight += 1;
      }
      nextFieldX[index] = totalX / weight * 0.994;
      nextFieldY[index] = totalY / weight * 0.994;
    }
  }
  const swapX = fieldX;
  const swapY = fieldY;
  fieldX = nextFieldX;
  fieldY = nextFieldY;
  nextFieldX = swapX;
  nextFieldY = swapY;
}

function updateWitnesses() {
  const newborns = [];
  for (let i = witnesses.length - 1; i >= 0; i -= 1) {
    const witness = witnesses[i];
    witness.px = witness.x;
    witness.py = witness.y;
    const memory = sampleField(witness.x, witness.y);
    witness.vx += memory.x * (witness.rejected ? 0.048 : 0.072);
    witness.vy += memory.y * (witness.rejected ? 0.048 : 0.072);

    const speed = sqrt(witness.vx * witness.vx + witness.vy * witness.vy) + 0.0001;
    const normalX = -witness.vy / speed;
    const normalY = witness.vx / speed;
    const hesitation = sin(witness.age * 0.031 + witness.phase) * 0.009;
    witness.vx += normalX * hesitation;
    witness.vy += normalY * hesitation;
    applyAuditorPresence(witness);
    limitWitnessSpeed(witness, witness.rejected ? 1.75 : 2.05);

    witness.x += witness.vx;
    witness.y += witness.vy;
    witness.age += 1;
    witness.recordTimer -= 1;
    drawWitnessTrace(witness);
    depositWitnessMemory(witness);

    if (!witness.rejected && witness.recordTimer <= 0 && records.length < MAX_RECORDS) {
      const record = registerDecision(witness);
      if (countRejectedWitnesses() + newborns.length < 28 && witnesses.length + newborns.length < MAX_WITNESSES && random() < 0.48) {
        newborns.push(makeWitness(record.x, record.y, record.rejectedAngle, true, record.id));
      }
      witness.recordTimer = floor(random(220, 380));
    }
    if (witnessFinished(witness)) {
      witnesses.splice(i, 1);
    }
  }

  for (let i = 0; i < newborns.length; i += 1) {
    witnesses.push(newborns[i]);
  }
  maintainArchivePopulation();
}

function applyAuditorPresence(witness) {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
    return;
  }
  const dx = witness.x - mouseX;
  const dy = witness.y - mouseY;
  const d2 = dx * dx + dy * dy;
  const radius = min(width, height) * 0.2;
  if (d2 > 16 && d2 < radius * radius) {
    const distance = sqrt(d2);
    const strength = (1 - distance / radius) * 0.045;
    witness.vx += -dy / distance * strength;
    witness.vy += dx / distance * strength;
  }
}

function drawWitnessTrace(witness) {
  const dx = witness.x - witness.px;
  const dy = witness.y - witness.py;
  const length = sqrt(dx * dx + dy * dy) + 0.0001;
  const nx = -dy / length;
  const ny = dx / length;
  if (witness.rejected) {
    if ((witness.age + witness.tickOffset) % 9 < 4) {
      archiveLayer.stroke(86, 220, 211, 150);
      archiveLayer.strokeWeight(witness.lineWidth);
      archiveLayer.line(witness.px, witness.py, witness.x, witness.y);
    }
    if ((witness.age + witness.tickOffset) % 23 === 0) {
      archiveLayer.noStroke();
      archiveLayer.fill(86, 220, 211, 175);
      archiveLayer.rect(witness.x - 1.5, witness.y - 1.5, 3, 3);
    }
  } else {
    const offset = 1.65;
    archiveLayer.stroke(245, 174, 93, 125);
    archiveLayer.strokeWeight(witness.lineWidth);
    archiveLayer.line(witness.px + nx * offset, witness.py + ny * offset, witness.x + nx * offset, witness.y + ny * offset);
    archiveLayer.stroke(255, 91, 76, 105);
    archiveLayer.line(witness.px - nx * offset, witness.py - ny * offset, witness.x - nx * offset, witness.y - ny * offset);
    if ((witness.age + witness.tickOffset) % 19 === 0) {
      archiveLayer.stroke(244, 235, 215, 135);
      archiveLayer.strokeWeight(0.7);
      archiveLayer.line(witness.x - nx * 4, witness.y - ny * 4, witness.x + nx * 4, witness.y + ny * 4);
    }
  }
}

function registerDecision(witness) {
  const livedAngle = atan2(witness.vy, witness.vx);
  const turn = random(0.48, 1.12) * (random() < 0.5 ? -1 : 1);
  const rejectedAngle = livedAngle + turn;
  const record = {
    id: nextRecordId,
    x: witness.x,
    y: witness.y,
    livedAngle: livedAngle,
    rejectedAngle: rejectedAngle,
    direction: angleToBin(livedAngle),
    status: 'vigente',
    epoch: epoch,
    age: 0,
    pulse: 78,
    revisedBy: '',
    labelSide: random() < 0.5 ? -1 : 1
  };
  records.push(record);
  nextRecordId += 1;
  witness.vx = cos(livedAngle - turn * 0.16) * 1.35;
  witness.vy = sin(livedAngle - turn * 0.16) * 1.35;
  depositDecision(record, 0.18);
  if (record.id % 5 === 0) {
    addAnnotation(record.x, record.y, 'ATO ' + formatRecordId(record.id) + ' REGISTRADO', 'warm', 85);
  }
  return record;
}

function angleToBin(angle) {
  let normalized = angle;
  while (normalized < 0) {
    normalized += TWO_PI;
  }
  while (normalized >= TWO_PI) {
    normalized -= TWO_PI;
  }
  return floor(normalized / TWO_PI * DIRECTION_BINS) % DIRECTION_BINS;
}

function sampleField(x, y) {
  const gx = constrain(floor(x / CELL), 0, fieldCols - 1);
  const gy = constrain(floor(y / CELL), 0, fieldRows - 1);
  const index = gx + gy * fieldCols;
  return { x: fieldX[index], y: fieldY[index] };
}

function depositWitnessMemory(witness) {
  const gx = constrain(floor(witness.x / CELL), 0, fieldCols - 1);
  const gy = constrain(floor(witness.y / CELL), 0, fieldRows - 1);
  const index = gx + gy * fieldCols;
  const speed = sqrt(witness.vx * witness.vx + witness.vy * witness.vy) + 0.0001;
  const amount = witness.rejected ? 0.038 : 0.023;
  if (witness.rejected) {
    fieldX[index] += -witness.vy / speed * amount;
    fieldY[index] += witness.vx / speed * amount;
  } else {
    fieldX[index] += witness.vx / speed * amount;
    fieldY[index] += witness.vy / speed * amount;
  }
}

function depositDecision(record, amount) {
  const gx = constrain(floor(record.x / CELL), 0, fieldCols - 1);
  const gy = constrain(floor(record.y / CELL), 0, fieldRows - 1);
  const index = gx + gy * fieldCols;
  fieldX[index] += cos(record.livedAngle) * amount;
  fieldY[index] += sin(record.livedAngle) * amount;
}

function reviseDominantHabit() {
  const histogram = new Array(DIRECTION_BINS).fill(0);
  for (let i = 0; i < records.length; i += 1) {
    if (records[i].status === 'vigente') {
      histogram[records[i].direction] += 1;
    }
  }
  let dominantBin = 0;
  for (let i = 1; i < histogram.length; i += 1) {
    if (histogram[i] > histogram[dominantBin]) {
      dominantBin = i;
    }
  }
  const candidates = [];
  for (let i = 0; i < records.length; i += 1) {
    if (records[i].status === 'vigente' && records[i].direction === dominantBin) {
      candidates.push(records[i]);
    }
  }
  const affected = min(6, max(2, ceil(candidates.length * 0.36)));
  let revisedCount = 0;
  for (let i = candidates.length - 1; i >= 0 && revisedCount < affected; i -= 2) {
    contestRecord(candidates[i], 'SISTEMA');
    revisedCount += 1;
  }
  activeRevision = { age: 0, maxAge: 360, direction: dominantBin, affected: revisedCount, reviewedEpoch: epoch };
  epoch += 1;
}

function contestRecord(record, author) {
  if (record.status !== 'vigente') {
    return false;
  }
  record.status = 'rasurada';
  record.revisedBy = author;
  record.pulse = 150;
  drawPermanentRedaction(record);
  if (countRejectedWitnesses() < 30 && witnesses.length < MAX_WITNESSES) {
    witnesses.push(makeWitness(record.x, record.y, record.rejectedAngle, true, record.id));
  }

  const gx = constrain(floor(record.x / CELL), 0, fieldCols - 1);
  const gy = constrain(floor(record.y / CELL), 0, fieldRows - 1);
  const radius = 3;
  for (let oy = -radius; oy <= radius; oy += 1) {
    for (let ox = -radius; ox <= radius; ox += 1) {
      const cellX = gx + ox;
      const cellY = gy + oy;
      const distance = sqrt(ox * ox + oy * oy) + 0.6;
      if (cellX >= 0 && cellX < fieldCols && cellY >= 0 && cellY < fieldRows && distance <= radius) {
        const index = cellX + cellY * fieldCols;
        fieldX[index] += cos(record.rejectedAngle) * 0.2 / distance;
        fieldY[index] += sin(record.rejectedAngle) * 0.2 / distance;
      }
    }
  }
  const label = author === 'OBSERVADOR' ? 'CONTESTAÇÃO ACEITA' : 'HÁBITO RASURADO';
  addAnnotation(record.x, record.y, label + ' · ATO ' + formatRecordId(record.id), 'violet', 150);
  return true;
}

function drawPermanentRedaction(record) {
  const slashAngle = record.livedAngle + HALF_PI * 0.65;
  const length = 23;
  archiveLayer.stroke(7, 14, 17, 230);
  archiveLayer.strokeWeight(8);
  archiveLayer.line(record.x - cos(slashAngle) * length, record.y - sin(slashAngle) * length, record.x + cos(slashAngle) * length, record.y + sin(slashAngle) * length);
  archiveLayer.stroke(144, 118, 255, 185);
  archiveLayer.strokeWeight(1.3);
  archiveLayer.line(record.x - cos(slashAngle) * length, record.y - sin(slashAngle) * length, record.x + cos(slashAngle) * length, record.y + sin(slashAngle) * length);
}

function updateRecords() {
  for (let i = 0; i < records.length; i += 1) {
    records[i].age += 1;
    records[i].pulse = max(0, records[i].pulse - 1);
  }
  if (records.length > MAX_RECORDS) {
    records.splice(0, records.length - MAX_RECORDS);
  }
}

function addAnnotation(x, y, textValue, tone, life) {
  annotations.push({ x: x, y: y, text: textValue, tone: tone, age: 0, maxAge: life, drift: random(-0.12, 0.12) });
}

function updateAnnotations() {
  for (let i = annotations.length - 1; i >= 0; i -= 1) {
    annotations[i].age += 1;
    annotations[i].y -= 0.04;
    annotations[i].x += annotations[i].drift;
    if (annotations[i].age > annotations[i].maxAge) {
      annotations.splice(i, 1);
    }
  }
}

function updateRevision() {
  if (activeRevision !== null) {
    activeRevision.age += 1;
    if (activeRevision.age > activeRevision.maxAge) {
      activeRevision = null;
    }
  }
}

function maintainArchivePopulation() {
  let officialCount = 0;
  let rejectedCount = 0;
  for (let i = 0; i < witnesses.length; i += 1) {
    if (witnesses[i].rejected) {
      rejectedCount += 1;
    } else {
      officialCount += 1;
    }
  }
  if (officialCount < 25 && frameCount % 12 === 0) {
    spawnEdgeWitness(false, frameCount);
  }
  if (rejectedCount < 7 && frameCount % 40 === 0) {
    const available = [];
    for (let i = 0; i < records.length; i += 1) {
      if (records[i].status === 'vigente') {
        available.push(records[i]);
      }
    }
    if (available.length > 0) {
      const source = available[floor(random(available.length))];
      witnesses.push(makeWitness(source.x, source.y, source.rejectedAngle, true, source.id));
    }
  }
}

function countRejectedWitnesses() {
  let total = 0;
  for (let i = 0; i < witnesses.length; i += 1) {
    if (witnesses[i].rejected) {
      total += 1;
    }
  }
  return total;
}

function limitWitnessSpeed(witness, maximum) {
  const speed = sqrt(witness.vx * witness.vx + witness.vy * witness.vy);
  if (speed > maximum) {
    witness.vx = witness.vx / speed * maximum;
    witness.vy = witness.vy / speed * maximum;
  }
}

function witnessFinished(witness) {
  const margin = 65;
  return witness.x < -margin || witness.x > width + margin || witness.y < -margin || witness.y > height + margin || witness.age > witness.maxAge;
}

function drawDocumentGrid() {
  strokeWeight(0.65);
  for (let x = 30; x < width; x += 72) {
    stroke(244, 235, 215, x % 144 === 30 ? 14 : 8);
    line(x, 0, x, height);
  }
  for (let y = 42; y < height; y += 42) {
    stroke(244, 235, 215, 7);
    line(0, y, width, y);
  }
  stroke(255, 91, 76, 26);
  line(104, 0, 104, height);
  line(width - 54, 0, width - 54, height);
}

function drawRecords() {
  textFont('monospace');
  const start = max(0, records.length - 110);
  for (let i = start; i < records.length; i += 1) {
    const record = records[i];
    const livedLength = record.pulse > 0 ? 17 : 10;
    const rejectedLength = record.pulse > 0 ? 15 : 8;
    if (record.status === 'vigente') {
      noFill();
      stroke(244, 235, 215, record.pulse > 0 ? 175 : 70);
      strokeWeight(0.8);
      rect(record.x - 3.5, record.y - 3.5, 7, 7);
      stroke(245, 174, 93, record.pulse > 0 ? 190 : 80);
      line(record.x, record.y, record.x + cos(record.livedAngle) * livedLength, record.y + sin(record.livedAngle) * livedLength);
      stroke(86, 220, 211, record.pulse > 0 ? 180 : 70);
      drawingContext.setLineDash([2, 3]);
      line(record.x, record.y, record.x + cos(record.rejectedAngle) * rejectedLength, record.y + sin(record.rejectedAngle) * rejectedLength);
      drawingContext.setLineDash([]);
    } else {
      noFill();
      stroke(144, 118, 255, record.pulse > 0 ? 210 : 90);
      strokeWeight(1);
      rect(record.x - 5, record.y - 5, 10, 10);
      line(record.x - 6, record.y + 6, record.x + 6, record.y - 6);
    }
    if (record.pulse > 45 && record.id % 3 === 0) {
      noStroke();
      const alpha = map(record.pulse, 45, 150, 0, 165, true);
      if (record.status === 'vigente') {
        fill(244, 235, 215, alpha);
      } else {
        fill(144, 118, 255, alpha);
      }
      textSize(8);
      textAlign(record.labelSide < 0 ? RIGHT : LEFT, CENTER);
      text('ATO ' + formatRecordId(record.id), record.x + record.labelSide * 10, record.y - 10);
    }
  }
}

function drawAnnotations() {
  textFont('monospace');
  textSize(9);
  textAlign(CENTER, BOTTOM);
  noStroke();
  for (let i = 0; i < annotations.length; i += 1) {
    const item = annotations[i];
    const alpha = map(item.age, 0, item.maxAge, 190, 0, true);
    if (item.tone === 'violet') {
      fill(144, 118, 255, alpha);
    } else {
      fill(244, 235, 215, alpha);
    }
    text(item.text, item.x, item.y - 11);
  }
}

function drawRevisionPanel() {
  if (activeRevision === null) {
    return;
  }
  const progress = activeRevision.age / activeRevision.maxAge;
  const alpha = 220 * sin(progress * PI);
  const panelWidth = min(285, width * 0.36);
  const x = width - panelWidth - 22;
  const y = 76;
  fill(7, 14, 17, alpha * 0.7);
  stroke(144, 118, 255, alpha);
  strokeWeight(1);
  rect(x, y, panelWidth, 88);
  noStroke();
  fill(144, 118, 255, alpha);
  textFont('monospace');
  textAlign(LEFT, TOP);
  textSize(10);
  text('REVISÃO AUTOMÁTICA ' + formatRecordId(activeRevision.reviewedEpoch), x + 12, y + 12);
  fill(244, 235, 215, alpha * 0.85);
  textSize(9);
  text('HÁBITO DOMINANTE: ' + directionName(activeRevision.direction), x + 12, y + 34);
  text(activeRevision.affected + ' ATOS RASURADOS', x + 12, y + 51);
  fill(86, 220, 211, alpha * 0.85);
  text('ALTERNATIVAS PROMOVIDAS AO PRESENTE', x + 12, y + 68);
}

function drawInterface() {
  let officialCount = 0;
  let rejectedCount = 0;
  let revisedCount = 0;
  for (let i = 0; i < witnesses.length; i += 1) {
    if (witnesses[i].rejected) rejectedCount += 1;
    else officialCount += 1;
  }
  for (let i = 0; i < records.length; i += 1) {
    if (records[i].status === 'rasurada') revisedCount += 1;
  }
  noStroke();
  textFont('monospace');
  textAlign(LEFT, TOP);
  fill(244, 235, 215, 185);
  textSize(12);
  text('ATA DAS COISAS QUE NÃO HOUVE', 18, 17);
  fill(144, 118, 255, 130);
  textSize(9);
  text('UMA MÁQUINA QUE SE ARREPENDE', 18, 36);
  fill(245, 174, 93, 145);
  text('═ CAMINHO OFICIAL  ' + officialCount, 18, 58);
  fill(86, 220, 211, 145);
  text('┄ ALTERNATIVA ARQUIVADA  ' + rejectedCount, 18, 73);
  fill(144, 118, 255, 145);
  text('╱ ATO RASURADO  ' + revisedCount, 18, 88);
  textAlign(RIGHT, TOP);
  fill(244, 235, 215, 85);
  text('ÉPOCA ' + formatRecordId(epoch) + ' · ' + records.length + ' ATOS', width - 18, 18);
  text('PRÓXIMA REVISÃO ' + ceil((REVISION_INTERVAL - revisionClock) / 60) + 's', width - 18, 34);
  textAlign(LEFT, BOTTOM);
  fill(244, 235, 215, 100);
  text('clique perto de um ato para contestá-lo · espaço pausa · R reinicia · S salva', 18, height - 16);
}

function directionName(index) {
  const names = ['LESTE', 'SUDESTE', 'SUL', 'SUDOESTE', 'OESTE', 'NOROESTE', 'NORTE', 'NORDESTE'];
  return names[index % names.length];
}

function formatRecordId(value) {
  return String(value).padStart(3, '0');
}

function mousePressed() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;
  let nearest = null;
  let nearestDistance = 115;
  for (let i = records.length - 1; i >= 0; i -= 1) {
    const dx = records[i].x - mouseX;
    const dy = records[i].y - mouseY;
    const distance = sqrt(dx * dx + dy * dy);
    if (distance < nearestDistance && records[i].status === 'vigente') {
      nearest = records[i];
      nearestDistance = distance;
    }
  }
  if (nearest !== null) {
    contestRecord(nearest, 'OBSERVADOR');
  } else {
    addAnnotation(mouseX, mouseY, 'SEM ATO PRÓXIMO · CONTESTAÇÃO ARQUIVADA', 'violet', 120);
    injectExternalObjection(mouseX, mouseY);
  }
}

function injectExternalObjection(x, y) {
  const centerX = floor(x / CELL);
  const centerY = floor(y / CELL);
  const radius = 4;
  for (let oy = -radius; oy <= radius; oy += 1) {
    for (let ox = -radius; ox <= radius; ox += 1) {
      const gx = centerX + ox;
      const gy = centerY + oy;
      const distance = sqrt(ox * ox + oy * oy) + 0.5;
      if (gx >= 0 && gx < fieldCols && gy >= 0 && gy < fieldRows && distance <= radius) {
        const index = gx + gy * fieldCols;
        fieldX[index] += -oy / distance * 0.16;
        fieldY[index] += ox / distance * 0.16;
      }
    }
  }
  archiveLayer.noFill();
  archiveLayer.stroke(144, 118, 255, 170);
  archiveLayer.strokeWeight(1.1);
  archiveLayer.rect(x - 13, y - 13, 26, 26);
  archiveLayer.line(x - 16, y + 16, x + 16, y - 16);
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('thumbnail', 'png');
  } else if (key === 'r' || key === 'R') {
    archiveSeed = floor(random(1000000));
    restartArchive();
  } else if (key === ' ') {
    paused = !paused;
    return false;
  }
  return true;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  restartArchive();
}
