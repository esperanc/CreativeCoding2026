function setup() {
  createCanvas(500, 500);

  background(230);  
  
  let navy_blue = color(0, 50, 100);
  let bright_red = color(225, 30, 30);
  let dark_green = color(40, 110, 60);

  // quad(x1, y1, x2, y2, x3, y3, x4, y4);
  noStroke();
  for (let j = -500; j < 500; j+=160) {
    for (let i = -100; i < 500; i+=30) {
      k = i + j
      fill(dark_green);
      quad(k, i, k+100, i, k+100, i+100, k, i+100);
      
      fill(navy_blue);
      quad(k+10, i+10, k+110, i+10, k+110, i+110, k+10, i+110);
      
      fill(bright_red);
      quad(k+20, i+20, k+120, i+20, k+120, i+120, k+20, i+120);
    }
  }

}

