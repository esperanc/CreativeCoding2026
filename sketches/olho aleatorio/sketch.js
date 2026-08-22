function setup() {
  createCanvas(windowWidth, windowHeight);
  background(220)
  angleMode(RADIANS);
  translate(width / 2, height / 2);
  rotate(random(TWO_PI));
  
  //Contorno
  circle(0,0,windowHeight/2)
  
  
  
  //iris
  fill(random(255),random(255),random(255))
  circle(0,0,windowHeight/3)
  
  let cor = [random(255),random(255),random(255)]
  
  
  let aleatorio = random(["circulo","estrela"])
  
  //circulos
  if (aleatorio == "circulo"){
    
    for(let iter=1; iter<random(4,10); iter++){
  
      stroke(cor[0],cor[1],cor[2])
      strokeWeight(2)
      noFill()
    
    circle(0,0,windowHeight/(3+iter))
  }
  }
  

  
  //estrela
  if (aleatorio == "estrela"){
    stroke(cor[0],cor[1],cor[2])
    strokeWeight(2)
    noFill()
  
    let r = windowHeight/8;

    beginShape();
    for (let i = 0; i < 5; i++) {
      let angle = -HALF_PI + i *2* TWO_PI / 5;
      vertex(cos(angle) * r, sin(angle) * r);
    }
    endShape(CLOSE);
  }
  
  
  
  //pupila
  fill("black");
  circle(0,0,windowHeight/20)


}
