
// Vector Field
// Yasmine 
// Tópicos e Esp. Sistemas Digitais

let cellSize = 55; // taille d'une case de la grille, en pixels

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  angleMode(RADIANS);
  noLoop(); // dessin statique : toutes les valeurs sont déterministes
}

// Le canvas s'adapte toujours à la taille de la fenêtre disponible
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}

function draw() {
  background(230, 25, 10);

  let cx = width / 2;
  let cy = height / 2;

  // Nombre de colonnes / lignes déduit de la taille de la fenêtre
  let cols = ceil(width / cellSize);
  let rows = ceil(height / cellSize);

  // Distance maximale possible au centre (coin de la fenêtre),
  // utilisée pour normaliser la taille des flèches
  let distMax = dist(0, 0, cx, cy);

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {

      // Position : fonction directe des indices de la grille 
      let x = (i + 0.5) * cellSize;
      let y = (j + 0.5) * cellSize;

      // Direction : angle exact vers l'extérieur du centre 
      let dx = x - cx;
      let dy = y - cy;
      let angle = atan2(dy, dx); // fonction trigonométrique -> direction précise

      // Dimension : fonction de la distance au centre 
      let d = dist(x, y, cx, cy);
      let longueur = map(d, 0, distMax, 6, cellSize * 0.8);

      // Couleur elle aussi calculée à partir de l'angle (fonction)
      let teinte = (degrees(angle) + 360) % 360;

      push();
      translate(x, y);
      rotate(angle);

      // Dessine une petite flèche : une ligne + une tête triangulaire
      stroke(teinte, 70, 95, 90);
      strokeWeight(2);
      line(0, 0, longueur, 0);

      noStroke();
      fill(teinte, 70, 95, 90);
      triangle(longueur, -4, longueur, 4, longueur + 7, 0);

      pop();
    }
  }
}
