/**
 * The "getting started" demo for p5.brush.
 * See https://github.com/acamposuribe/p5.brush
 */

function setup() {
  createCanvas(700, 410, WEBGL);
  background("#f6f1e8");
  brush.scaleBrushes(3);
  
  brush.set("HB", "#2f2a26", 1.4);
  brush.line(-220, -80, 180, 40);
  
  brush.fill("#07c3a3", 120);
  brush.noStroke();
  brush.circle(120, 20, 70);
  
  brush.set("rotring", "#1f4b99", 0.8);
  brush.noFill();
  brush.hatch(7, 35);
  brush.rect(-140, 40, 120, 90, "center");
}