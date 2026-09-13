// =============================================================================
//  Author: Yasmine
//  Course: Topics and Special Topics in Digital Systems — Project 4
// =============================================================================
//
//  INSPIRATION:
//  “Movement in Squares” (1961), Bridget Riley. In the original painting,
//  a grid of black and white squares maintains a constant height, but
//  their width gradually decreases toward the center of the canvas, creating
//  the optical illusion of a “fold” or a pinching of the image plane.
//  (See README.md for links to the artwork and a full explanation
//  of the connection between this sketch and the original work)
//
//  DIFFERENCE FROM THE ORIGINAL (what this sketch adds):
//  Riley’s painting is static: the pinch is in a fixed location,
//  painted once and for all. Here, the pinch is a dynamic PARAMETER:
//    - the mouse’s horizontal position (mouseX) moves the crease
//    - the mouse’s vertical position (mouseY) controls its intensity
//  We can therefore “grab” the optical illusion and move it around
//  the canvas in real time—a manipulable version of Riley’s effect.
//
// =============================================================================

let foldX;            // current position of the fold in x
let cellH = 34;        // fixed height of each row of squares

function setup() {
  createCanvas(windowWidth, windowHeight);
  foldX = width / 2;   // the fold starts from the center
  noStroke();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(255);

  // The fold follows the mouse
  // lerp(a, b, t) moves from a to b by a fraction of t each frame
  // With a small value of t (0.08), the crease gradually “catches up” to the mouse
  // instead of jumping abruptly to its position: this gives the optical illusion
  // a fluid, almost elastic motion

  foldX = lerp(foldX, mouseX, 0.08);

  // The intensity of the pinch depends on the mouse's vertical position :
  // at the top of the screen, a subtle effect, at the bottom, a very pronounced effect
  // map() converts mouseY (0..height) to a range of factors (0.85..0.10)

  let largeurMin = map(mouseY, 0, height, 0.85, 0.10);
  largeurMin = constrain(largeurMin, 0.10, 0.85);

  let nbRangees = ceil(height / cellH);

  for (let r = 0; r < nbRangees; r++) {
    let y = r * cellH;
    let x = 0;
    let col = 0;

    // Each row is filled from left to right with squares whose
    // width depends on the distance from the fold (foldX)

    while (x < width) {

      // Normalized distance between 0 (on the fold) and 1 (opposite the fold)
      let d = abs(x - foldX) / (width * 0.5);
      d = constrain(d, 0, 1);

      // Near the fold, the width approaches widthMin * cellH (thin square)
      // Far from the fold, the width approaches cellH (normal square, true square)
      let w = map(d, 0, 1, largeurMin * cellH, cellH);

      // Checkered pattern, as in the original table
      let pair = (r + col) % 2 === 0;
      fill(pair ? 20 : 245);
      rect(x, y, w, cellH);

      x += w;
      col++;
    }
  }
}
