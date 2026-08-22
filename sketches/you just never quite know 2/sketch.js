let cores = ['#D45A45','#7AB549','#EAE3D5','#F6D012','#323232'];

function setup() {
  let corCirc = random(cores);

  createCanvas(windowWidth, windowHeight);
  background("#F3F0E1");
  
  let tamanhoGrade = min(width, height);
  
  let colunas = int(random(8,10));
  let div = tamanhoGrade / colunas;
  let offsetX = (width - tamanhoGrade) / 2;
  let offsetY = (height - tamanhoGrade) / 2;
  
  stroke("#D6A789");
  strokeWeight(0.3);
  
  for (let y = 0; y < height; y = y + div/colunas) {
    line(0, y, width, y);
  }
  
  for (let x = 0; x < width; x = x + div/colunas) {
    line(x, 0, x, height);
  }
  
  for (let col = 0; col < colunas; col++) {
    for (let lin = 0; lin < colunas; lin++) {
      
      let x = offsetX + (col * div);
      let y = offsetY + (lin * div);
      
      noFill();
      stroke("#9F9281");
      strokeWeight(2);
      
      quad(x, y, x + div, y, x + div, y + div, x, y + div);
      
      let contador = random(15);
      
      if (contador < 3) {
        fill(corCirc);
        noStroke();
        circle(x + div/2, y + div/2, div - 10);
      }
    }
  }
}