function drawPerson() {
  fill(190, 220, 240);
  drawHead();
  strokeWeight(1)
  drawNeck();
  drawChest();
  noStroke();
  drawArm(-1, 0);
  drawArm(1, PI);
  strokeWeight(1)
  drawWaist();
  drawHip();
  noStroke();
  drawLeg(-0.4, PI);
  drawLeg(0.4, 0);
  cumulativeHeight += 120;
  bodyHeight = cumulativeHeight + 200;
}

function roundedBox(w, h, d, r) {
  let iw = w - 2*r;
  let ih = h - 2*r;
  let id = d - 2*r;

  box(iw, ih, d);
  box(iw, h, id);
  box(w, ih, id);

  for (let x of [-1, 1]) for (let z of [-1, 1]) {
    push(); translate(x*iw/2, 0, z*id/2); cylinder(r, ih); pop();              
    push(); translate(x*iw/2, z*ih/2, 0); rotateX(HALF_PI); cylinder(r, id); pop();  
    push(); translate(0, x*ih/2, z*id/2); rotateZ(HALF_PI); cylinder(r, iw); pop();  
  }

  for (let x of [-1, 1]) for (let y of [-1, 1]) for (let z of [-1, 1]) {
    push(); translate(x*iw/2, y*ih/2, z*id/2); sphere(r); pop();
  }
}


function drawCumulative(x, y, z) {
  cumulativeHeight += y/2;
  push();
  translate(0, cumulativeHeight, 0);
  scale(x, y, z);
  model(roundedCube);
  pop();
  cumulativeHeight += y/2;
}

function drawHead() {
  let head = u * 0.13;
  cumulativeHeight = -200;
  push();
  translate(0, cumulativeHeight + head/2, 0);
  rotateY(sin(t * 0.5) * 0.6);
  translate(0, -head/2, 0);  
  scale(head);
  model(roundedCube);
  pop();
  cumulativeHeight += head/2;
}

function drawNeck() {
  let neck = u * 0.04
  drawCumulative(neck, neck, neck);
}

function drawChest() {
  let chest = u * 0.13;
  shoulderHeight = cumulativeHeight;
  drawCumulative(chest, chest, chest);
}

function drawArm(k, phase) {
  let armW = u * 0.03;
  let upper = u * 0.1;
  let lower = u * 0.07;
  let chestW = u * 0.13;
  push();

  translate(k * (chestW/2 + armW/2), shoulderHeight, 0);
  rotateZ(k * -0.4);                      
  rotateX(sin(t + phase) * 0.2);          

  // braço
  translate(0, upper/2, 0);
  box(armW, upper, armW);

  // cotovelo (articulação)
  translate(0, upper/2, 0);               
  let elbowAngle = -max(0, -sin(t + phase)) * 0.5;
  rotateX(elbowAngle);

  // antebraço
  translate(0, lower/2, 0);
  box(armW, lower, armW);

  // mão
  translate(0, lower/2 + armW/2, 0);
  scale(armW, armW, armW);
  model(roundedCube);
  pop();
}

function drawWaist() {
  let waist = u * 0.07
  drawCumulative(waist, waist, waist)
}

function drawHip() {
  let hip = u * 0.07
  drawCumulative(hip*2, hip, u * 0.13)
}


function drawLeg(k, phase) {
  var cumulative = cumulativeHeight;
  let tights = u*0.15;
  let knee = u*0.04;
  let leg = u*0.1;

  push();
  //coxa
  translate(k*40, cumulativeHeight + tights*0.35, 0);
  rotateX(sin(t + phase) * 0.2)
  box(u*0.04, tights, u*0.04);
  
  //joelho
  translate(0, tights/2, 0);
  let kneeAngle = max(0, sin(t + phase)) * 0.6
  rotateX(kneeAngle)
  translate(0, knee/2, 0);
  box(knee);
  
  //perna
  translate(0, knee/2 + leg/2, 0);
  rotateX(sin(kneeAngle) * 0.2)
  box(u*0.04, leg, u*0.04);
  
  //pé
  translate(0, leg/2 + 10, -10);
  rotateX(sin(kneeAngle) * 0.6);
  scale(u*0.05, u*0.04, u*0.09);
  model(roundedCube);
  pop();
  cumulativeHeight = cumulative;
}