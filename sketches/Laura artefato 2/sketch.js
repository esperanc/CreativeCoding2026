function setup() {
  createCanvas(windowWidth, windowHeight);
  background(getSeaColor())
  createSea()
}


function createSea() {
  strokeWeight(5);

  let colors = [
    "#1E2E5F",
    "#A39FD0",
    "#59BB4E",
    "#EE5E22",
    "#7A215B",
    "#F27BB1",
    "#9B7CB8"
  ]
  
  let maxWaves = random(100,120);
  
  for (let i = 0; i < maxWaves; i++) {
    let randomX = random(0, 1);
    let randomY = random(-1, 1);
    let opacity = random([10,30,50,100,150,200])
    
    getWaveColor(opacity);
    fill(random(colors))
  
    createWave(randomX, randomY);
  }
  
  for (let i = 0; i < maxWaves/4; i++) {
    strokeWeight(8);
    fill(random(colors))
    let randomX = random(0, 1);
    let randomY = random(0, 1);
    let randomSize = random(5,15);
    
    createFish(width*randomX, height*randomY, randomSize);
  }

}

function createFish(x, y, size) {
  stroke(222, 243, 246, 30)
  
  ellipse(x, y, size, size * 0.6);

  triangle(
    x - size * 0.5, y,
    x - size * 0.9, y - size * 0.3,
    x - size * 0.9, y + size * 0.3
  );
}

function createWave(offsetX, offsetY) {
  let x = offsetX * width
  let y = offsetY * height
  return bezier(
          x, height * 0.5 + y,
          x + width * 0.05, height * 0.4 + y,
          x + width * 0.15, height * 0.6 + y,
          x + width * 0.20, height * 0.5 + y
        );
}

function getWaveColor(opacity) {
  let options = [
    stroke(222, 243, 246, opacity),
    stroke(213, 229, 213, opacity),
    stroke(186, 219, 214, opacity)
  ];
  return 
}

function getSeaColor() {
  let options = [
    color('#064373'),
    color('#2facc2'),
    color('#6bb8c1'),
  ];
  
  return random(options)  
}