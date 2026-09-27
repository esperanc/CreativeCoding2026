let systemParams = {
  seed: 0,
  color1: '#000000',
  color2: '#ffffff',
  layers: 100,
  driftAngle: 0,
  driftStep: 3
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(displayDensity());
  noLoop();
  generateSystem();
}

function generateSystem() {

  let seed = floor(random(1000000));
  randomSeed(seed);
  noiseSeed(seed);

  colorMode(HSB, 360, 100, 100, 1);
  let h1 = random(360);
  let s1 = random(65, 95);
  let b1 = random(70, 95);
  let col1 = color(h1, s1, b1);

  let hueSeparation = random() > 0.5 ? random(70, 150) : random(210, 290);
  let h2 = (h1 + hueSeparation) % 360;
  let s2 = random(75, 100);
  let b2 = random(45, 90);
  let col2 = color(h2, s2, b2);


  let bgCol = color((h1 + 180) % 360, 40, 7);
  background(bgCol);


  colorMode(RGB, 255);


  let minDim = min(width, height);
  let baseRadius = minDim * random(0.38, 0.46);
  let distortionAmp = baseRadius * random(0.22, 0.45);
  

  let noiseFreq = random(0.85, 1.75);
  let noiseOffsetX = random(1000);
  let noiseOffsetY = random(1000);


  let numPoints = 540;
  let baseProfile = [];

  for (let i = 0; i < numPoints; i++) {
    let angle = map(i, 0, numPoints, 0, TWO_PI);
    
    let nx = map(cos(angle), -1, 1, 0, noiseFreq) + noiseOffsetX;
    let ny = map(sin(angle), -1, 1, 0, noiseFreq) + noiseOffsetY;
    let nVal = noise(nx, ny);
    
    
    let r = baseRadius + map(nVal, 0, 1, -distortionAmp, distortionAmp);
    baseProfile.push({ angle: angle, r: r });
  }

  
  let totalLayers = floor(random(95, 150));
  let startX = width / 2;
  let startY = height / 2;

  
  let driftAngle = random(TWO_PI);
  let driftStep = random(1.8, 4.8); 
  let driftCurl = random(-0.018, 0.018);

  let currentX = startX;
  let currentY = startY;

  
  for (let k = 0; k < totalLayers; k++) {
    let t = k / (totalLayers - 1);

    
    let scaleFactor = map(pow(1 - t, 1.15), 1, 0, 1.0, 0.025);

    
    let currentFill = lerpColor(col1, col2, t);

    
    let currentStroke = lerpColor(col1, col2, constrain(t + 0.06, 0, 1));
    stroke(red(currentStroke) * 0.75, green(currentStroke) * 0.75, blue(currentStroke) * 0.75, 140);
    strokeWeight(1.2);
    fill(currentFill);

    
    beginShape();
    for (let pt of baseProfile) {
      let vx = currentX + cos(pt.angle) * (pt.r * scaleFactor);
      let vy = currentY + sin(pt.angle) * (pt.r * scaleFactor);
      vertex(vx, vy);
    }
    endShape(CLOSE);

    
    currentX += cos(driftAngle) * driftStep;
    currentY += sin(driftAngle) * driftStep;
    driftAngle += driftCurl;
  }

  
  systemParams = {
    seed: seed,
    color1: colorToHex(col1),
    color2: colorToHex(col2),
    layers: totalLayers,
    driftStep: driftStep.toFixed(1)
  };

  updateHUD();
}

function colorToHex(c) {
  let r = hex(floor(red(c)), 2);
  let g = hex(floor(green(c)), 2);
  let b = hex(floor(blue(c)), 2);
  return '#' + r + g + b;
}

function updateHUD() {
  let seedEl = document.getElementById('meta-seed');
  let layersEl = document.getElementById('meta-layers');
  let swatch1 = document.getElementById('swatch-1');
  let swatch2 = document.getElementById('swatch-2');
  let hex1 = document.getElementById('hex-1');
  let hex2 = document.getElementById('hex-2');

  if (seedEl) seedEl.innerText = systemParams.seed;
  if (layersEl) layersEl.innerText = systemParams.layers;
  if (swatch1) swatch1.style.backgroundColor = systemParams.color1;
  if (swatch2) swatch2.style.backgroundColor = systemParams.color2;
  if (hex1) hex1.innerText = systemParams.color1.toUpperCase();
  if (hex2) hex2.innerText = systemParams.color2.toUpperCase();
}
