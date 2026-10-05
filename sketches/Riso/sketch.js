let frases = ["COM CALMA", "VOLTA CEDO", "DEIXA A LUZ", "SEU TEMPO", "DESCANSA", "CHEGUEI", "ATÉ LOGO", "ME LIGA"];
let iFrase = 0, passada = 0, tPassada = 0, tParado = 0;
let passos = [], redOff = 0, arrastando = false, xAnt = 0;
let papel = [236, 230, 218], tinta = [34, 29, 31], vermelho = [203, 44, 36];
let espera = 38, paradaMax = 500;

function novaImpressao() {
  passada = 0;
  tPassada = 0;
  tParado = 0;
  passos = [];
  const n = 6;
  for (let i = 0; i < n; i++) {
    passos.push({ tipo: "bloco" });
  }
  passos.push({ tipo: "imposto" });
  passos.push({ tipo: "frase" });
  redOff = 0;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  novaImpressao();
}

function montarBloco() {
  const str = frases[iFrase];
  const ch = str[int(random(str.length))];
  return {
    tipo: "bloco",
    ch: ch,
    x: random(-0.25, 1.25) * width,
    y: random(-0.15, 1.15) * height,
    tam: random(0.75, 1.6) * height,
    rot: random(-0.09, 0.09)
  };
}

function proximaPassada() {
  const p = passos[passada];
  if (!p) return;
  if (p.tipo === "bloco") {
    const novo = montarBloco();
    p.ch = novo.ch; p.x = novo.x; p.y = novo.y; p.tam = novo.tam; p.rot = novo.rot;
  }
  if (p.tipo === "imposto") {
    p.offs = [];
    for (let k = 0; k < 3; k++) {
      p.offs.push({ dx: random(-14, 14), dy: random(-10, 10), rot: random(-0.012, 0.012) });
    }
  }
  passada++;
  tPassada = 0;
}

function draw() {
  background(papel[0], papel[1], papel[2]);
  noStroke();

  for (const p of passos.slice(0, passada)) {
    if (p.tipo === "bloco") {
      push();
      translate(p.x, p.y);
      rotate(p.rot);
      scale(0.62, 1);
      fill(tinta[0], tinta[1], tinta[2]);
      textAlign(CENTER, CENTER);
      textStyle(BOLD);
      textFont("sans-serif");
      textSize(p.tam);
      text(p.ch, 0, 0);
      pop();
    }
    if (p.tipo === "imposto") {
      for (let k = 0; k < 3; k++) {
        const o = p.offs[k];
        push();
        translate(width * 0.5 + o.dx, height * 0.5 + o.dy);
        rotate(o.rot);
        scale(0.6, 1);
        fill(tinta[0], tinta[1], tinta[2], 230);
        textAlign(CENTER, CENTER);
        textStyle(BOLD);
        textFont("sans-serif");
        let ts = min((width * 1.05) / (0.52 * frases[iFrase].length), height * 0.34);
        textSize(ts);
        text(frases[iFrase], 0, 0);
        pop();
      }
    }
    if (p.tipo === "frase") {
      push();
      translate(width * 0.5 + redOff, height * 0.55);
      scale(0.6, 1);
      fill(vermelho[0], vermelho[1], vermelho[2]);
      textAlign(CENTER, CENTER);
      textStyle(BOLD);
      textFont("sans-serif");
      let ts = min((width * 1.12) / (0.52 * frases[iFrase].length), height * 0.46);
      textSize(ts);
      text(frases[iFrase], 0, 0);
      pop();
    }
  }

  grain();

  if (passada >= passos.length) {
    tParado++;
    if (tParado > paradaMax) {
      iFrase = (iFrase + 1) % frases.length;
      novaImpressao();
    }
  } else {
    tPassada++;
    if (tPassada >= espera) proximaPassada();
  }
}

function grain() {
  for (let i = 0; i < 1500; i++) {
    const x = noise(i * 0.37, 11.3) * width;
    const y = noise(7.7, i * 0.41) * height;
    const a = noise(i * 0.91, 3.2) * 46;
    fill(28, 24, 26, a);
    rect(x, y, 1.4, 1.4);
  }
  for (let i = 0; i < 240; i++) {
    const x = noise(i * 0.53, 21.1) * width;
    const y = noise(17.9, i * 0.29) * height;
    fill(255, 252, 244, 60);
    rect(x, y, 1.6, 1.6);
  }
}

function mousePressed() {
  arrastando = true;
  xAnt = mouseX;
}

function mouseDragged() {
  if (arrastando) {
    redOff += (mouseX - xAnt) * 0.8;
    xAnt = mouseX;
  }
}

function mouseReleased() {
  arrastando = false;
}

function keyPressed() {
  if (key === " ") {
    iFrase = (iFrase + 1) % frases.length;
    novaImpressao();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  novaImpressao();
}
