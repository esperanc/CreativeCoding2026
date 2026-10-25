
/*
 ARTEFATO 9 - CASTELO DA PEACH BASEADO EM MARIO 64
 Autor: Pedro Elias
 IA: ChatGPT
 p5.js 2.x - WEBGL - p5Front

 CONTROLES
 Mouse arrastado: girar camera
 Scroll: zoom
 R: restaurar camera
 A: rotacao automatica
*/

let camYaw = 0.32;
let camPitch = -0.20;
let camDist = 1200;
let dragging = false;
let autoRotate = false;
let clock = 0;

let trees = [];
let flowers = [];
let clouds = [];
let waterRipples = [];

const C = {
  white: [246, 242, 230],
  cream: [233, 224, 207],
  wall: [239, 232, 218],
  stone: [185, 177, 163],
  stoneDark: [139, 132, 124],
  red: [190, 38, 49],
  redLight: [225, 57, 65],
  redDark: [130, 27, 38],
  gold: [245, 194, 67],
  wood: [119, 72, 48],
  glass: [67, 137, 191],
  grass: [105, 177, 83],
  grassLight: [123, 190, 94],
  water: [75, 163, 213],
  green: [54, 143, 65],
  hedge: [48, 131, 60],
  soil: [115, 93, 70]
};

// =====================================
// SETUP
// =====================================

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);
  noStroke();
  randomSeed(64);

  for (let i = 0; i < 68; i++) {
    let a = random(TWO_PI);
    let r = random(760, 900);
    let x = cos(a) * r;
    let z = sin(a) * r;

    if (abs(x) < 155 && z > 450) continue;

    trees.push({
      x, z,
      s: random(0.65, 1.25),
      type: random() < 0.3 ? 1 : 0
    });
  }

  for (let side of [-1, 1]) {
    for (let i = 0; i < 110; i++) {
      flowers.push({
        x: side * random(205, 365),
        z: random(215, 355),
        c: random([
          [255, 222, 75],
          [245, 120, 165],
          [255, 255, 245],
          [188, 134, 229],
          [255, 157, 91]
        ])
      });
    }
  }

  for (let i = 0; i < 11; i++) {
    clouds.push({
      x: random(-1300, 1300),
      y: random(-620, -390),
      z: random(-1150, -500),
      s: random(0.8, 1.7)
    });
  }

  for (let i = 0; i < 130; i++) {
    let a = random(TWO_PI);
    let r = random(600, 695);

    waterRipples.push({
      x: cos(a) * r,
      z: sin(a) * r,
      phase: random(TWO_PI),
      size: random(12, 38)
    });
  }
}

// =====================================
// DRAW
// =====================================

function draw() {
  background(151, 197, 232);
  clock += min(deltaTime, 50) * 0.001;

  perspective(
    PI / 3,
    width / height,
    10,
    6000
  );

  if (autoRotate && !dragging) {
    camYaw += 0.0015;
  }

  let x = sin(camYaw) * cos(camPitch) * camDist;
  let y = sin(camPitch) * camDist - 160;
  let z = cos(camYaw) * cos(camPitch) * camDist;

  camera(
    x, y, z,
    0, -180, -50,
    0, 1, 0
  );

  ambientLight(155, 158, 168);

  directionalLight(
    255, 244, 223,
    -0.6, 0.8, -0.5
  );

  directionalLight(
    125, 158, 211,
    0.5, 0.2, 0.7
  );

  drawLandscape();
  drawClouds();
  drawCastle();
  drawBridge();
  drawGardens();
  drawForest();
}

// =====================================
// PRIMITIVAS
// =====================================

function material(c) {
  ambientMaterial(c[0], c[1], c[2]);
}

function block(x, y, z, w, h, d, c) {
  push();
  translate(x, y, z);
  material(c);
  box(w, h, d);
  pop();
}

function cylinderAt(x, y, z, r, h, c, n = 20) {
  push();
  translate(x, y, z);
  material(c);
  cylinder(r, h, n, 1);
  pop();
}

function sphereAt(x, y, z, r, c) {
  push();
  translate(x, y, z);
  material(c);
  sphere(r, 12, 9);
  pop();
}

function ovalAt(x, y, z, rx, ry, rz, c) {
  push();
  translate(x, y, z);
  material(c);
  ellipsoid(rx, ry, rz, 14, 10);
  pop();
}

function coneUp(x, baseY, z, r, h, c, n = 24) {
  push();
  translate(x, baseY - h / 2, z);
  rotateZ(PI);
  material(c);
  cone(r, h, n, 1);
  pop();
}

// =====================================
// ILHA RETANGULAR COM CANTOS ARREDONDADOS
// =====================================

function roundedPlatform(
  x, y, z, w, d, h, radius, c
) {
  block(
    x, y, z,
    w - 2 * radius,
    h,
    d,
    c
  );

  block(
    x, y, z,
    w,
    h,
    d - 2 * radius,
    c
  );

  for (let sx of [-1, 1]) {
    for (let sz of [-1, 1]) {
      cylinderAt(
        x + sx * (w / 2 - radius),
        y,
        z + sz * (d / 2 - radius),
        radius,
        h,
        c,
        20
      );
    }
  }
}

// =====================================
// TERRENO E LAGO
// =====================================

function drawLandscape() {
  cylinderAt(
    0, 32, 0,
    950, 65,
    [135, 113, 85],
    80
  );

  cylinderAt(
    0, -5, 0,
    948, 10,
    C.grass,
    80
  );

  cylinderAt(
    0, -9, 0,
    716, 3,
    C.stone,
    96
  );

  cylinderAt(
    0, -15, 0,
    706, 4,
    C.water,
    96
  );

  // Ilha central
  roundedPlatform(
    0, -24, -80,
    960, 960,
    30, 90,
    C.stone
  );

  roundedPlatform(
    0, -42, -80,
    950, 950,
    7, 86,
    C.grassLight
  );

  // Fundacao do castelo
  block(
    0, -55, -115,
    820, 32, 500,
    C.stone
  );

  /*
   V7:
   Removida a plataforma retangular
   adicional que ficava sob os jardins.

   Os canteiros agora ficam diretamente
   sobre a ilha principal.
  */

  // Caminho central
  block(
    0, -49, 300,
    160, 3, 250,
    [221, 210, 190]
  );

  for (let zz = 195; zz < 420; zz += 32) {
    block(
      0, -51, zz,
      158, 1, 2,
      [190, 179, 162]
    );
  }

  // Caminho na margem externa
  block(
    0, -13, 825,
    115, 5, 230,
    [220, 203, 170]
  );

  for (let zz = 725; zz < 930; zz += 35) {
    block(
      -28, -17, zz,
      48, 2, 3,
      [183, 166, 141]
    );

    block(
      28, -17, zz,
      48, 2, 3,
      [183, 166, 141]
    );
  }

  // Reflexos da agua
  for (let ripple of waterRipples) {
    let xx = ripple.x +
      sin(clock * 1.7 + ripple.phase) * 6;

    block(
      xx, -18, ripple.z,
      ripple.size, 1, 2,
      [166, 218, 243]
    );
  }

  for (let i = 0; i < 18; i++) {
    let a = i * TWO_PI / 18;
    let r = 620;

    let xx = cos(a) * r;
    let zz = sin(a) * r;
    let wave = sin(clock * 2 + i) * 7;

    block(
      xx + wave, -18, zz,
      35, 1, 3,
      [184, 229, 249]
    );
  }
}

// =====================================
// NUVENS
// =====================================

function drawClouds() {
  for (let c of clouds) {
    push();

    translate(
      c.x + sin(clock * 0.15 + c.x) * 25,
      c.y,
      c.z
    );

    scale(c.s);

    ovalAt(0, 0, 0, 42, 25, 29, [255, 253, 255]);
    ovalAt(-33, 12, 0, 30, 23, 25, [244, 248, 255]);
    ovalAt(33, 10, 0, 32, 25, 25, [250, 252, 255]);
    ovalAt(3, -20, 0, 30, 28, 27, [255, 255, 255]);

    pop();
  }
}

// =====================================
// TELHADOS
// =====================================

function gableRoof(x, baseY, z, w, d, h) {
  push();
  translate(x, baseY, z);

  let hw = w / 2;
  let hd = d / 2;

  material(C.red);

  beginShape(TRIANGLES);
  vertex(-hw, 0, -hd);
  vertex(-hw, 0, hd);
  vertex(0, -h, hd);

  vertex(-hw, 0, -hd);
  vertex(0, -h, hd);
  vertex(0, -h, -hd);
  endShape();

  material(C.redLight);

  beginShape(TRIANGLES);
  vertex(hw, 0, hd);
  vertex(hw, 0, -hd);
  vertex(0, -h, -hd);

  vertex(hw, 0, hd);
  vertex(0, -h, -hd);
  vertex(0, -h, hd);
  endShape();

  material(C.cream);

  beginShape(TRIANGLES);
  vertex(-hw, 0, hd + 1);
  vertex(hw, 0, hd + 1);
  vertex(0, -h, hd + 1);

  vertex(hw, 0, -hd - 1);
  vertex(-hw, 0, -hd - 1);
  vertex(0, -h, -hd - 1);
  endShape();

  pop();

  for (let s of [-1, 1]) {
    block(
      x + s * w / 2,
      baseY + 3,
      z,
      12, 8, d + 14,
      C.redDark
    );
  }

  block(
    x, baseY - h, z,
    10, 9, d + 10,
    C.redDark
  );

  for (let i = 1; i <= 6; i++) {
    let f = i / 7;

    for (let s of [-1, 1]) {
      block(
        x + s * (w / 2) * (1 - f),
        baseY - h * f - 2,
        z,
        4, 3, d + 5,
        C.redLight
      );
    }
  }
}

// =====================================
// TORRES
// =====================================

function drawTower(x, z, height, radius, roofHeight) {
  let top = -35 - height;
  let center = -35 - height / 2;

  cylinderAt(x, -42, z, radius + 7, 25, C.stone, 24);
  cylinderAt(x, center, z, radius, height, C.white, 24);
  cylinderAt(x, -85, z, radius + 3, 12, C.cream, 24);
  cylinderAt(x, center - 15, z, radius + 3, 10, C.stone, 24);
  cylinderAt(x, top + 24, z, radius + 5, 12, C.cream, 24);
  cylinderAt(x, top + 5, z, radius + 11, 16, C.white, 24);

  for (let i = 0; i < 16; i++) {
    let a = i * TWO_PI / 16;

    block(
      x + cos(a) * (radius + 5),
      top - 4,
      z + sin(a) * (radius + 5),
      10, 13, 10,
      C.cream
    );
  }

  cylinderAt(
    x, top - 16, z,
    radius + 14, 9,
    C.redDark, 24
  );

  coneUp(
    x, top - 20, z,
    radius + 15, roofHeight,
    C.red, 32
  );

  sphereAt(
    x,
    top - 20 - roofHeight,
    z,
    6,
    C.gold
  );

  drawWindow(
    x, center - 18,
    z + radius + 2,
    22, 45
  );

  push();
  translate(x, 0, z);
  rotateY(HALF_PI);
  drawWindow(0, center - 18, radius + 2, 19, 40);
  pop();
}

// =====================================
// TORRE CENTRAL
// =====================================

function centralTower() {
  let x = 0;
  let z = -250;

  block(x, -345, z, 195, 260, 190, C.white);
  cylinderAt(x, -505, z, 90, 185, C.white, 32);

  coneUp(x, -409, z, 105, 55, C.red, 32);
  cylinderAt(x, -428, z, 105, 10, C.redDark, 32);

  cylinderAt(x, -595, z, 102, 17, C.cream, 32);
  cylinderAt(x, -606, z, 109, 13, C.white, 32);

  for (let i = 0; i < 8; i++) {
    let a = i * TWO_PI / 8;

    push();
    translate(x, 0, z);
    rotateY(a);
    drawWindow(0, -520, 91, 19, 42);
    pop();
  }

  coneUp(x, -615, z, 117, 225, C.red, 40);
  cylinderAt(x, -617, z, 119, 9, C.redDark, 40);

  sphereAt(x, -845, z, 8, C.gold);
  drawFlag(x, -855, z, 1.1);
}

// =====================================
// CASTELO
// =====================================

function drawCastle() {
  block(0, -72, -115, 720, 115, 470, C.stone);
  block(0, -194, -125, 650, 220, 400, C.wall);

  for (let s of [-1, 1]) {
    block(
      s * 280, -186, -95,
      230, 210, 340,
      C.white
    );

    gableRoof(
      s * 280, -301, -95,
      248, 365, 88
    );
  }

  block(0, -280, -175, 320, 240, 315, C.white);
  gableRoof(0, -407, -175, 350, 330, 120);

  centralTower();

  drawTower(-395, 35, 315, 73, 165);
  drawTower(395, 35, 315, 73, 165);

  drawTower(-185, 100, 230, 46, 105);
  drawTower(185, 100, 230, 46, 105);

  drawTower(-325, -290, 345, 54, 125);
  drawTower(325, -290, 345, 54, 125);

  drawFlag(-325, -535, -290, 0.8);
  drawFlag(325, -535, -290, 0.8);

  block(0, -220, 126, 200, 300, 85, C.white);
  gableRoof(0, -376, 126, 225, 110, 100);

  peachWindow();
  entrance();

  for (let s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      drawWindow(
        s * (225 + i * 55),
        -205, 78,
        24, 51
      );
    }
  }

  block(0, -105, 174, 205, 12, 15, C.stone);
  block(0, -352, 174, 205, 12, 15, C.stone);

  drawBricks();

  drawFlag(-395, -535, 35, 0.8);
  drawFlag(395, -535, 35, 0.8);

  for (let s of [-1, 1]) {
    hangingFlowers(s * 105, -255, 174);
  }
}

// =====================================
// TIJOLOS
// =====================================

function drawBricks() {
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 15; i++) {
      let x = -345 + i * 49 + (row % 2) * 24;
      if (abs(x) < 120) continue;

      block(
        x, -65 - row * 25, 77,
        37, 2, 3,
        [159, 151, 139]
      );
    }
  }
}

// =====================================
// JANELAS
// =====================================

function drawWindow(x, y, z, w, h) {
  block(x, y, z, w + 12, h + 15, 8, C.stone);
  block(x, y, z + 5, w, h, 4, C.glass);
  block(x, y, z + 8, 3, h, 3, C.gold);
  block(x, y, z + 8, w, 3, 3, C.gold);

  push();
  translate(x, y - h / 2, z + 6);
  material(C.cream);
  rotateX(HALF_PI);
  torus(w / 2, 4, 12, 6);
  pop();

  block(
    x, y + h / 2 + 7, z + 8,
    w + 18, 8, 16,
    C.stone
  );
}

// =====================================
// VITRAL DA PEACH
// =====================================

function peachWindow() {
  push();
  translate(0, -316, 175);

  block(0, 0, 0, 105, 150, 14, C.stone);
  block(0, 0, 9, 88, 135, 5, [63, 119, 177]);

  ovalAt(0, -12, 15, 36, 47, 5, C.gold);
  ovalAt(0, -7, 22, 30, 39, 5, [240, 179, 62]);
  ovalAt(0, -3, 28, 22, 29, 5, [255, 211, 178]);

  ovalAt(-24, 5, 27, 10, 33, 5, [238, 174, 57]);
  ovalAt(24, 5, 27, 10, 33, 5, [238, 174, 57]);

  ovalAt(0, 48, 23, 34, 30, 6, [236, 101, 159]);

  block(0, -46, 29, 37, 10, 6, C.gold);

  for (let x of [-14, 0, 14]) {
    coneUp(x, -51, 29, 7, 18, C.gold, 8);
  }

  sphereAt(0, -50, 35, 5, [218, 51, 80]);

  for (let s of [-1, 1]) {
    block(s * 51, 0, 8, 13, 160, 18, C.white);
  }

  block(0, -79, 8, 116, 15, 20, C.white);
  block(0, 79, 8, 116, 15, 20, C.white);

  pop();
}

// =====================================
// ENTRADA
// =====================================

function entrance() {
  block(0, -112, 177, 133, 155, 20, C.stone);
  block(0, -112, 191, 112, 143, 5, [64, 57, 54]);

  for (let s of [-1, 1]) {
    block(s * 27, -108, 197, 52, 132, 6, C.wood);

    for (let i = 0; i < 4; i++) {
      block(
        s * 27 - 18 + i * 12,
        -108, 201,
        2, 125, 2,
        [91, 55, 39]
      );
    }

    sphereAt(s * 12, -106, 205, 5, C.gold);
  }

  push();
  translate(0, -185, 195);
  rotateX(HALF_PI);
  material(C.cream);
  torus(62, 11, 24, 8);
  pop();

  for (let s of [-1, 1]) {
    cylinderAt(s * 77, -117, 186, 12, 150, C.white, 12);
    cylinderAt(s * 77, -197, 186, 17, 15, C.stone, 12);
  }

  for (let i = 0; i < 4; i++) {
    block(
      0,
      -33 + i * 6,
      212 + i * 16,
      135 + i * 17,
      10, 33,
      C.stone
    );
  }

  for (let s of [-1, 1]) {
    block(s * 80, -201, 198, 10, 35, 8, C.red);
  }

  block(0, -211, 198, 170, 12, 10, C.redDark);
}

// =====================================
// BANDEIRAS
// =====================================

function drawFlag(x, y, z, scaleFactor) {
  push();
  translate(x, y, z);
  scale(scaleFactor);

  cylinderAt(0, -24, 0, 3, 80, C.stoneDark, 8);
  sphereAt(0, -67, 0, 6, C.gold);

  let wave = sin(clock * 3 + x * 0.01) * 9;

  push();
  translate(0, -58, 0);
  material([237, 65, 87]);

  beginShape(TRIANGLES);
  vertex(0, 0, 0);
  vertex(65 + wave, 12, 0);
  vertex(0, 31, 0);
  endShape();

  pop();
  pop();
}

// =====================================
// PONTE
// =====================================

function drawBridge() {
  let startZ = 430;
  let endZ = 730;

  for (let i = 0; i < 48; i++) {
    let f = i / 47;
    let z = lerp(startZ, endZ, f);
    let arch = sin(f * PI) * 35;
    let y = -37 - arch;

    block(0, y, z, 133, 10, 11, C.stone);

    block(
      0, y - 7, z,
      128, 3, 11,
      [221, 212, 195]
    );
  }

  for (let s of [-1, 1]) {
    for (let i = 0; i < 24; i++) {
      let f = i / 23;
      let z = lerp(startZ, endZ, f);
      let arch = sin(f * PI) * 35;
      let y = -37 - arch;

      block(
        s * 72,
        y - 27,
        z,
        9, 46, 10,
        C.white
      );
    }

    for (let i = 0; i < 47; i++) {
      let f = i / 46;
      let z = lerp(startZ, endZ, f);
      let arch = sin(f * PI) * 35;

      block(
        s * 72,
        -66 - arch,
        z,
        13, 9, 13,
        C.stone
      );
    }

    for (let z of [430, 730]) {
      block(
        s * 76,
        -65,
        z,
        23, 70, 23,
        C.white
      );

      sphereAt(
        s * 76,
        -107,
        z,
        13,
        C.gold
      );
    }
  }

  for (let s of [-1, 1]) {
    for (let i = 0; i < 13; i++) {
      let f = i / 12;
      let z = lerp(450, 710, f);
      let arch = sin(f * PI) * 35;

      block(
        s * 62,
        -25 - arch / 2,
        z,
        11,
        42 + arch,
        13,
        C.cream
      );
    }
  }
}

// =====================================
// FLORES SUSPENSAS
// =====================================

function hangingFlowers(x, y, z) {
  cylinderAt(x, y, z, 20, 17, C.stone, 12);

  for (let i = 0; i < 10; i++) {
    let a = i * TWO_PI / 10;
    let xx = x + cos(a) * 17;
    let zz = z + sin(a) * 12;

    sphereAt(xx, y - 14, zz, 10, C.green);
    sphereAt(xx, y - 22, zz + 5, 4, [242, 118, 168]);
  }
}

// =====================================
// JARDINS V7
// =====================================

function drawGardens() {
  for (let s of [-1, 1]) {
    let x = s * 285;

    /*
     V7:
     Jardins deslocados 60 unidades
     para tras, diretamente sobre a
     ilha principal.

     Nao existe mais a plataforma
     retangular adicional.
    */

    let gardenZ = 280;

    // Base de pedra do proprio canteiro
    block(
      x, -51, gardenZ,
      210, 8, 170,
      C.stone
    );

    // Terra
    block(
      x, -58, gardenZ,
      190, 5, 150,
      C.soil
    );

    // Grama
    block(
      x, -62, gardenZ,
      185, 3, 145,
      [86, 160, 72]
    );

    // Bordas do canteiro
    for (let dz of [-82, 82]) {
      block(
        x, -64, gardenZ + dz,
        218, 13, 12,
        C.cream
      );
    }

    for (let dx of [-103, 103]) {
      block(
        x + dx, -64, gardenZ,
        12, 13, 170,
        C.cream
      );
    }

    // Cercas vivas
    for (let i = 0; i < 6; i++) {
      sphereAt(
        x - 80 + i * 32,
        -81,
        gardenZ - 67,
        17,
        C.hedge
      );
    }

    for (let i = 0; i < 4; i++) {
      sphereAt(
        x + s * 84,
        -79,
        gardenZ - 40 + i * 28,
        15,
        [57, 151, 67]
      );
    }

    // Caminho interno
    block(
      x, -65, gardenZ,
      30, 3, 135,
      [212, 198, 169]
    );

    gardenFountain(x, gardenZ - 5);
  }

  // Flores acompanhando os canteiros
  for (let f of flowers) {
    block(
      f.x, -73, f.z,
      2, 13, 2,
      [49, 127, 51]
    );

    sphereAt(
      f.x, -82, f.z,
      4, f.c
    );
  }

  // Vasos proximos a entrada
  for (let s of [-1, 1]) {
    cylinderAt(
      s * 112, -63, 230,
      16, 25,
      C.stone, 12
    );

    sphereAt(
      s * 112, -85, 230,
      23, C.green
    );

    for (let i = 0; i < 7; i++) {
      let a = i * TWO_PI / 7;

      sphereAt(
        s * 112 + cos(a) * 16,
        -98,
        230 + sin(a) * 16,
        5,
        [244, 137, 177]
      );
    }
  }
}

// =====================================
// FONTES
// =====================================

function gardenFountain(x, z) {
  cylinderAt(x, -71, z, 28, 11, C.stone, 20);
  cylinderAt(x, -78, z, 23, 2, C.water, 20);
  cylinderAt(x, -94, z, 5, 30, C.cream, 12);
  cylinderAt(x, -111, z, 15, 5, C.stone, 16);

  sphereAt(
    x,
    -122 - sin(clock * 3 + x) * 3,
    z,
    6,
    [170, 225, 250]
  );
}

// =====================================
// FLORESTA
// =====================================

function drawForest() {
  for (let tr of trees) {
    push();
    translate(tr.x, 0, tr.z);
    scale(tr.s);

    cylinderAt(
      0, -42, 0,
      11, 72,
      [128, 85, 52], 9
    );

    if (tr.type === 0) {
      sphereAt(0, -104, 0, 43, [52, 145, 65]);
      sphereAt(-27, -82, 0, 29, [63, 158, 73]);
      sphereAt(27, -86, 0, 29, [70, 164, 76]);
      sphereAt(0, -133, 0, 29, [75, 170, 82]);
    } else {
      coneUp(0, -45, 0, 49, 100, [41, 126, 63], 10);
      coneUp(0, -87, 0, 37, 93, [48, 144, 68], 10);
      coneUp(0, -129, 0, 25, 75, [57, 159, 76], 10);
    }

    pop();
  }
}

// =====================================
// CONTROLES
// =====================================

function mousePressed() {
  if (
    mouseX >= 0 && mouseX <= width &&
    mouseY >= 0 && mouseY <= height
  ) {
    dragging = true;
  }
}

function mouseDragged() {
  if (!dragging) return;

  camYaw -= movedX * 0.006;

  camPitch = constrain(
    camPitch + movedY * 0.006,
    -1.25,
    0.25
  );

  return false;
}

function mouseReleased() {
  dragging = false;
}

function mouseWheel(e) {
  camDist = constrain(
    camDist + e.delta * 0.7,
    550,
    2200
  );

  return false;
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    camYaw = 0.32;
    camPitch = -0.20;
    camDist = 1200;
  }

  if (key === 'a' || key === 'A') {
    autoRotate = !autoRotate;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
