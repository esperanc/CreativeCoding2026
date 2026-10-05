let palavra = "NO AI!";
let palavraArray;
let r = 150;
let angulo = 50;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  textSize(150);
  textFont("Georgia");

  palavraArray = palavra.split("");

  let x = r * cos(angulo);
  let y = r * sin(angulo);

  frameRate(100);
}

function draw() {
  background("#0D0C0C");

  translate(width / 2, height / 2);
  rotate(angulo);

  for (let i = 0; i < palavraArray.length; i++) {
    let angulo1 = (300 / palavraArray.length) * i;

    push();

    rotate(angulo1);

    if (angulo1 > 140) {
      fill("#A49B9C");
    } else {
      fill("#393636");
    }

    text(
      palavraArray[i],
      r * cos(30),
      r * sin(30)
    );

    pop();
  }

  angulo += 0.5;
}