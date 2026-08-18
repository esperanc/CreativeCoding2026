function setup() {
  createCanvas(500, 500);
}

function draw() {
  background(255, 0, 50);
  strokeWeight(5)
      line (250,0, 250,500)
      line (80,0, 350,500)
      line (420,0, 150,500)
      line (0,210, 500,420)
      line (0,420, 500,210)
      strokeWeight(10)
       quad (150,400, 25,100, 350,400, 475,100,)
}
