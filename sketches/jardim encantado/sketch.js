let flores = [];
let particulas = [];
let paleta = [12, 38, 335, 275, 24];
let ultimoToque = -500;
let jardimCriado = false;

// Áudio generativo
let audioCtx = null;
let trilhaIniciada = false;
let notas = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];

function setup() {
  let w = windowWidth > 0 ? windowWidth : 360;
  let h = windowHeight > 0 ? windowHeight : 640;
  createCanvas(w, h);
  colorMode(HSB, 360, 100, 100, 100);
  if (width > 100) {
    iniciarJardim();
  }
}

function iniciarJardim() {
  flores = [];
  particulas = [];

  for (let i = 0; i < 25; i++) {
    particulas.push({
      x: random(width),
      y: random(height),
      r: random(2, 4.5),
      velY: random(0.2, 0.6),
      fase: random(TWO_PI)
    });
  }

  for (let i = 0; i < 14; i++) {
    let px = map(i, 0, 13, 30, width - 30) + random(-15, 15);
    let py = random(height * 0.35, height * 0.78);
    criarFlor(px, py, true);
  }

  jardimCriado = true;
}

function draw() {
  if (windowWidth > 100 && abs(width - windowWidth) > 20) {
    resizeCanvas(windowWidth, windowHeight);
    if (flores.length <= 14) {
      iniciarJardim();
    }
  }

  if (!jardimCriado && width > 100) {
    iniciarJardim();
  }

  background(210, 48, 22, 100);

  // Luz suave no horizonte
  noStroke();
  fill(195, 42, 32, 40);
  ellipse(width * 0.5, height * 0.85, width * 1.4, height * 0.65);

  // Colina do fundo
  desenharColina(height * 0.83, 25, 0.008, color(175, 45, 26, 100));

  // Partículas de luz flutuando
  for (let i = 0; i < particulas.length; i++) {
    let p = particulas[i];
    p.y -= p.velY;
    p.x += sin(frameCount * 0.02 + p.fase) * 0.35;
    if (p.y < -10) {
      p.y = height + 10;
      p.x = random(width);
    }
    fill(45, 45, 100, 55);
    circle(p.x, p.y, p.r);
  }

  // Ordena por altura para profundidade
  flores.sort(function(a, b) {
    return a.y - b.y;
  });

  for (let i = 0; i < flores.length; i++) {
    let f = flores[i];
    f.escala = lerp(f.escala, 1, 0.08);
    desenharFlor(f);
  }

  // Colina da frente
  desenharColina(height * 0.89, 18, 0.012, color(160, 52, 18, 100));

  // Instrução
  fill(45, 15, 95, 80);
  textAlign(CENTER);
  textSize(12);
  text("TOQUE PARA FAZER FLORESCER E OUVIR", width / 2, 32);
}

function desenharColina(alturaBase, amplitude, freq, cor) {
  fill(cor);
  noStroke();
  beginShape();
  vertex(0, height);
  for (let x = 0; x <= width + 20; x += 20) {
    let y = alturaBase + sin(x * freq + alturaBase) * amplitude;
    vertex(x, y);
  }
  vertex(width, height);
  endShape(CLOSE);
}

function desenharFlor(f) {
  let baseX = f.x;
  let baseY = height;
  let vento = sin(frameCount * 0.025 + f.fase) * f.balanco;
  let topoX = f.x + f.curva + vento;
  let topoY = f.y;

  let cx1 = baseX + f.curva * 0.15;
  let cy1 = lerp(baseY, topoY, 0.35);
  let cx2 = topoX - f.curva * 0.25;
  let cy2 = lerp(baseY, topoY, 0.7);

  // Caule curvo
  noFill();
  stroke(145, 48, 58, 90);
  strokeWeight(f.espessura);
  bezier(baseX, baseY, cx1, cy1, cx2, cy2, topoX, topoY);

  // Folhas na curva do caule
  let lx1 = bezierPoint(baseX, cx1, cx2, topoX, 0.45);
  let ly1 = bezierPoint(baseY, cy1, cy2, topoY, 0.45);
  desenharFolha(lx1, ly1, f.lado, vento, f.escala);

  let lx2 = bezierPoint(baseX, cx1, cx2, topoX, 0.68);
  let ly2 = bezierPoint(baseY, cy1, cy2, topoY, 0.68);
  desenharFolha(lx2, ly2, -f.lado, vento, f.escala * 0.85);

  // Flor
  push();
  translate(topoX, topoY);
  rotate(vento * 0.015);
  scale(f.escala);
  noStroke();

  // Brilho suave
  fill(f.cor, 65, 95, 18);
  circle(0, 0, f.tamanho * 2.5);

  if (f.tipo === 0) {
    fill(f.cor, 68, 95, 72);
    for (let i = 0; i < 8; i++) {
      ellipse(0, -f.tamanho * 0.52, f.tamanho * 0.55, f.tamanho * 1.05);
      rotate(TWO_PI / 8);
    }
    rotate(PI / 8);
    fill(f.cor, 42, 100, 85);
    for (let i = 0; i < 8; i++) {
      ellipse(0, -f.tamanho * 0.36, f.tamanho * 0.38, f.tamanho * 0.72);
      rotate(TWO_PI / 8);
    }
  } else if (f.tipo === 1) {
    fill(f.cor, 55, 100, 82);
    for (let i = 0; i < 12; i++) {
      ellipse(0, -f.tamanho * 0.58, f.tamanho * 0.24, f.tamanho * 1.15);
      rotate(TWO_PI / 12);
    }
  } else {
    fill(f.cor, 72, 98, 78);
    for (let i = 0; i < 5; i++) {
      ellipse(0, -f.tamanho * 0.48, f.tamanho * 0.72, f.tamanho * 0.95);
      rotate(TWO_PI / 5);
    }
  }

  // Miolo
  fill(25, 75, 25, 95);
  circle(0, 0, f.tamanho * 0.36);
  fill(44, 85, 100, 100);
  circle(0, 0, f.tamanho * 0.2);
  pop();
}

function desenharFolha(x, y, lado, vento, escala) {
  push();
  translate(x, y);
  scale(lado * escala, escala);
  rotate(-0.45 + vento * 0.01);
  noStroke();
  fill(142, 52, 55, 90);
  ellipse(12, 0, 24, 9);
  fill(142, 40, 72, 50);
  ellipse(11, -1, 17, 3);
  pop();
}

function criarFlor(x, y, imediata) {
  flores.push({
    x: constrain(x, 25, width - 25),
    y: constrain(y, 65, height * 0.82),
    tamanho: random(18, 34),
    cor: random(paleta),
    tipo: floor(random(3)),
    curva: random(-28, 28),
    balanco: random(6, 14),
    fase: random(TWO_PI),
    espessura: random(1.8, 2.8),
    lado: random() > 0.5 ? 1 : -1,
    escala: imediata ? 1 : 0.05
  });
}

function iniciarAudio() {
  try {
    if (!audioCtx) {
      let AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    if (!trilhaIniciada) {
      trilhaIniciada = true;
      let acorde = [130.81, 196.00, 246.94];
      for (let i = 0; i < acorde.length; i++) {
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = acorde[i];
        gain.gain.value = 0.025;
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
      }
    }
  } catch (e) {}
}

function tocarNotaFlor(y) {
  try {
    iniciarAudio();
    if (!audioCtx) return;

    let idx = floor(map(y, height * 0.85, 60, 0, notas.length - 0.01));
    idx = constrain(idx, 0, notas.length - 1);
    let freq = notas[idx];

    let agora = audioCtx.currentTime;
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, agora);

    gain.gain.setValueAtTime(0.001, agora);
    gain.gain.exponentialRampToValueAtTime(0.14, agora + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, agora + 1.8);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(agora);
    osc.stop(agora + 1.85);
  } catch (e) {}
}

function registrarToque() {
  if (millis() - ultimoToque > 150) {
    criarFlor(mouseX, mouseY, false);
    tocarNotaFlor(mouseY);
    ultimoToque = millis();
  }
}

function mousePressed() {
  registrarToque();
}

function touchStarted() {
  registrarToque();
  return false;
}

function windowResized() {
  if (windowWidth > 0 && windowHeight > 0) {
    resizeCanvas(windowWidth, windowHeight);
  }
}
