function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);

  let colors = [
    "#FF00A8",
    "#8A2BE2",
    "#5D2EFF",
    "#00D9FF",
    "#00FFB3",
    "#B7FF00",
    "#FFD600",
    "#FF6B00",
    "#FF1744",
    "#FF4FD8"
  ];
  
  let subColors1 = [
    "#B7FF00", 
    "#FFD600",
    "#FF6B00",
    "#FF1744",
    "#FF4FD8"
  ];
  
  let subColors2 = [
    "#FF00A8",
    "#8A2BE2",
    "#5D2EFF",
    "#00D9FF",
    "#00FFB3"
  ];
  
  let scaleFactor = (width + height) / 2000;

  createSpiral(1, 0, 5 * scaleFactor, 0.05 * width, 0.5 * scaleFactor, colors);
  createSpiral(3, 0, 10 * scaleFactor, 0.1 * width, 0.75 * scaleFactor, colors);
  createSpiral(5, 0, 20 * scaleFactor, 0.06 * width, 1 * scaleFactor, colors);
  createSpiral(5, 0, 50 * scaleFactor, 0.1 * width, 1 * scaleFactor, colors);
  
  createSpiral(8, 0, 50 * scaleFactor, 7 * scaleFactor, 1.25 * scaleFactor, subColors1);
  createSpiral(11, 0, 60 * scaleFactor, 8 * scaleFactor, 1.5 * scaleFactor, subColors2);
}

function createSpiral(radius, angle, size, angleSum, radiusSum, palete) {
  for (let i = 0; i < width; i++) {
    let x = width / 2 + cos(angle) * radius;
    let y = height / 2 + sin(angle) * radius;

    push();

    translate(x, y);
    rotate(random(TWO_PI));
    noStroke();

    let c = color(random(palete));
    c.setAlpha(random([30, 60, 100, 150]));
    fill(c);

    rectMode(CENTER);
    rect(0, 0, size, size);

    pop();
    
    radius += radiusSum;
    angle += angleSum / radius;
  }
}