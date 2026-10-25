/**
 * * * * Artefato 9 - 3D: Sistema Solar Geométrico
 * * * * Utiliza o modo WEBGL e primitivas 3D básicas.
 * * * * Interação: Da pra arrastar o mouse para girar a câmera e use o scroll para zoom.
 * * * */

 function setup() {
   createCanvas(windowWidth, windowHeight, WEBGL);
   noStroke();
 }

 function draw() {
   background(15, 15, 25);

   orbitControl();

   ambientLight(40);
   pointLight(255, 220, 150, 0, 0, 0);
   directionalLight(50, 100, 200, 1, 1, -1);

   push();
   rotateY(frameCount * 0.01);
   emissiveMaterial(255, 150, 0);
   sphere(80);
   pop();

   push();
   rotateY(frameCount * 0.02); 
   translate(200, 0, 0);       
   rotateX(frameCount * 0.03); 
   specularMaterial(50, 150, 255);
   shininess(20);
   box(45);
   pop();

   push();
   rotateY(-frameCount * 0.015);
   translate(350, 0, 0);
   rotateZ(frameCount * 0.02);
   rotateX(HALF_PI);
   ambientMaterial(255, 100, 150);
   torus(40, 12);
   pop();

   push();
   rotateZ(PI / 6);
   rotateY(frameCount * 0.03);
   translate(280, 0, 0);
   rotateX(frameCount * 0.05);
   normalMaterial(); 
   cone(30, 60);
   pop();
 }

 function windowResized() {
   resizeCanvas(windowWidth, windowHeight);
 }
