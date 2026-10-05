let letters = [];

let gravity = 0.5;
let input;
let isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

function setup() {
  createCanvas(windowWidth, windowHeight);

  textAlign(CENTER, CENTER);
  textSize(100);

  // Mobile keyboard input
  if (isMobile) {
    input = createInput();

    // Hide the input
    input.position(-100, -100);
    input.size(1, 1);

    input.input(() => {
      let value = input.value();

      if (value.length > 0) {
        let pressedKey = value.slice(-1);

        addLetter(pressedKey);

        input.value("");
      }
    });
  }
}

function draw() {
  background(255);

  fill(0);

  for (let i = 0; i < letters.length; i++) {

    let state = letters[i];

    let l = state.l;
    let t = state.t;
    let s = state.s;
    let v = state.v;
    let r = state.r;

    push();

    translate(s[0], s[1]);
    rotate(r*t)
    text(l, 0, 0);

    pop();

    // update state
    state.t += 1;

    state.s = [
      s[0] + v.x,
      s[1] + v.y
    ];

    state.v.y += gravity;

    // remove old letters
    if (state.t > 80) {
      letters.splice(i, 1);
      i--;
    }
  }
}

// Desktop keyboard
function keyPressed() {
  if (!isMobile) {
    addLetter(key);
  }
}

// Add a letter to the simulation
function addLetter(letter) {
  letters.push({
    l: letter,
    t: 0,
    s: [width / 2, height / 2],
    v: p5.Vector.random2D().mult(15),
    r: random(-0.1,0.1)
  });
}

// Open the native mobile keyboard
function mousePressed() {
  if (isMobile) {
    input.elt.focus();
  }
}

