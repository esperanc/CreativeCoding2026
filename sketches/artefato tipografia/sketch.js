// --- FLUIDEZ REOLÓGICA E DENSIDOMETRIA TIPOGRÁFICA ---

let customText = "TIPOGRAFIA EMERGENTE • FLUIDEZ E DENSIDADE • SEMÂNTICA • ";
let charArray = [];
let ripples = [];
let paletteMode = 0;

const PALETTES = [
  { bg: [10, 10, 14], text: [240, 240, 250], accent: [180, 210, 255] },
  { bg: [15, 12, 10], text: [245, 230, 210], accent: [220, 140, 70] },
  { bg: [5, 15, 20], text: [200, 245, 255], accent: [0, 220, 200] }
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Roboto Mono');
  textAlign(CENTER, CENTER);
  
  for (let i = 0; i < customText.length; i++) {
    charArray.push(customText.charAt(i));
  }
}

function draw() {
  let pal = PALETTES[paletteMode];
  background(pal.bg[0], pal.bg[1], pal.bg[2], 220);

  let time = millis() * 0.0008;
  
  // 1. CAMPO DENSIDOMÉTRICO (MATRIZ TIPOGRÁFICA DE BASE)
  let stepX = 24;
  let stepY = 24;
  
  for (let y = 12; y < height; y += stepY) {
    for (let x = 12; x < width; x += stepX) {
      let n = noise(x * 0.003, y * 0.003, time);
      let angle = n * TWO_PI * 2;
      
      let dMouse = dist(x, y, mouseX, mouseY);
      let mouseFactor = map(constrain(dMouse, 0, 300), 0, 300, 1.8, 0);
      
      let rippleForce = 0;
      for (let r of ripples) {
        let dr = dist(x, y, r.x, r.y);
        let wave = sin(dr * 0.05 - r.age * 0.2);
        if (abs(dr - r.age * 8) < 40) {
          rippleForce += wave * map(r.age, 0, 60, 1, 0);
        }
      }
      
      let density = sin(angle + time * 2) + mouseFactor + rippleForce;
      let alpha = map(density, -1, 3, 25, 240);
      let sz = map(density, -1, 3, 8, 22);
      let rot = angle * 0.2 + mouseFactor * 0.5;
      
      let glyphIndex = floor(map(density, -1, 3, 0, charArray.length - 1));
      glyphIndex = constrain(glyphIndex, 0, charArray.length - 1);
      let ch = charArray[glyphIndex];
      
      push();
      translate(x, y);
      rotate(rot);
      textSize(sz);
      
      let rCol = lerp(pal.text[0], pal.accent[0], constrain(mouseFactor, 0, 1));
      let gCol = lerp(pal.text[1], pal.accent[1], constrain(mouseFactor, 0, 1));
      let bCol = lerp(pal.text[2], pal.accent[2], constrain(mouseFactor, 0, 1));
      
      fill(rCol, gCol, bCol, constrain(alpha, 10, 255));
      text(ch, 0, 0);
      pop();
    }
  }

  // 2. CINTAS SEMÂNTICAS REOLÓGICAS (CURVAS FLUIDAS)
  drawFluidTextRibbon(time, pal);

  // Atualiza ondas de choque
  for (let i = ripples.length - 1; i >= 0; i--) {
    ripples[i].age++;
    if (ripples[i].age > 60) {
      ripples.splice(i, 1);
    }
  }

  drawOverlayInfo(pal);
}

function drawFluidTextRibbon(time, pal) {
  let numRibbons = 3;
  let pointsPerRibbon = 35;
  
  for (let r = 0; r < numRibbons; r++) {
    let ribbonOffset = r * 120;
    
    for (let i = 0; i < pointsPerRibbon; i++) {
      let t = i * 0.08 + time * 0.5;
      
      let posX = noise(t, ribbonOffset) * width;
      let posY = noise(ribbonOffset, t) * height;
      
      let d = dist(posX, posY, mouseX, mouseY);
      if (d < 200) {
        let pushAngle = atan2(posY - mouseY, posX - mouseX);
        let pushMag = map(d, 0, 200, 80, 0);
        posX += cos(pushAngle) * pushMag;
        posY += sin(pushAngle) * pushMag;
      }
      
      let charIdx = (i + floor(time * 10)) % charArray.length;
      let char = charArray[charIdx];
      
      let scaleFactor = map(sin(t * 3), -1, 1, 14, 28);
      
      push();
      translate(posX, posY);
      rotate(noise(t * 0.5) * TWO_PI);
      textSize(scaleFactor);
      textStyle(BOLD);
      fill(pal.accent[0], pal.accent[1], pal.accent[2], 210);
      text(char, 0, 0);
      pop();
    }
  }
}

function drawOverlayInfo(pal) {
  push();
  fill(pal.text[0], pal.text[1], pal.text[2], 180);
  textSize(11);
  textAlign(LEFT, BOTTOM);
  textStyle(NORMAL);
  text("Comandos: [Digite qualquer tecla para alterar a matriz] | [Clique] Criar onda | [1, 2, 3] Mudar Paleta", 20, height - 20);
  pop();
}

function mousePressed() {
  ripples.push({ x: mouseX, y: mouseY, age: 0 });
}

function keyPressed() {
  if (key === '1') paletteMode = 0;
  if (key === '2') paletteMode = 1;
  if (key === '3') paletteMode = 2;
  
  if (key.length === 1 && key !== ' ') {
    charArray.push(key.toUpperCase());
    if (charArray.length > 80) {
      charArray.shift();
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}