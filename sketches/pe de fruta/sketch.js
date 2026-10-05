let font;
let fruits;
let currentFruit;
let settledLayer = null;

let fruitState = "showing";
let fruitStartTime = 0;

let letterMotion = [];

const FRUIT_TIME = 1000;
const LETTER_FALL_DELAY = 1000;
const COLOR_FADE_TIME = 1.8;

let fonts = [];
let currentFont;

let backgroundColor;

async function setup() {
  createCanvas(windowWidth, windowHeight);

  fonts = [
    await loadFont(
      "https://raw.githubusercontent.com/google/fonts/main/ofl/abrilfatface/AbrilFatface-Regular.ttf"
    ),

    await loadFont(
      "https://raw.githubusercontent.com/google/fonts/main/ofl/lobster/Lobster-Regular.ttf"
    ),

    await loadFont(
      "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Instrument+Serif:ital@0;1&display=swap"
    ),

    await loadFont(
      "https://raw.githubusercontent.com/google/fonts/main/ofl/anton/Anton-Regular.ttf"
    ),
    
    await loadFont(
      "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Changa+One:ital@0;1&family=Instrument+Serif:ital@0;1&display=swap"
    ),
    
    await loadFont(
      "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Changa+One:ital@0;1&family=Instrument+Serif:ital@0;1&family=Rationale&family=Titan+One&display=swap"  
    ),
    
    await loadFont(
      "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Changa+One:ital@0;1&family=Instrument+Serif:ital@0;1&family=Rationale&display=swap"  
    ),
  ];

  font = fonts[0];

  fruits = createFruits();

  for (const fruit of Object.values(fruits)) {
    fruit.texture = createFruitText(fruit);
  }


  backgroundColor = "#000000"
  spawnFruit();
}

function draw() {
  background(backgroundColor);

  if (settledLayer) {
    image(
      settledLayer,
      0,
      0,
      width,
      height
    );
  }

  if (!font || !currentFruit) {
    return;
  }

  if (fruitState === "showing") {
    currentFruit.draw();

    if (
      millis() - fruitStartTime >=
      FRUIT_TIME
    ) {
      startFalling();
    }
  }

  else if (
    fruitState === "falling"
  ) {
    updateLetterFall();

    currentFruit.draw();

    if (currentFruitFinished()) {
      settleCurrentFruit();
      spawnFruit();
    }
  }
}

function currentFruitFinished() {
  return letterMotion.every(
    letter =>
      letter.landed &&
      letter.colorT >= 0.999
  );
}

function ensureSettledLayer() {
  const matchesCanvas =
    settledLayer &&
    settledLayer.width === width &&
    settledLayer.height === height;

  if (matchesCanvas) {
    return settledLayer;
  }

  const previous = settledLayer;

  settledLayer = createGraphics(width, height);

  if (previous) {
    settledLayer.image(
      previous,
      0,
      0,
      width,
      height
    );
  }

  return settledLayer;
}

function settleCurrentFruit() {
  ensureSettledLayer();

  clear();

  currentFruit.draw();

  const wordSnapshot = get();

  settledLayer.image(
    wordSnapshot,
    0,
    0,
    settledLayer.width,
    settledLayer.height
  );

  background(backgroundColor);

  image(
    settledLayer,
    0,
    0,
    width,
    height
  );
}

function spawnFruit() {
  const fruitKeys = Object.keys(fruits);

  let randomKey;

  do {
    randomKey = random(fruitKeys);
  } while (
    fruits[randomKey] === currentFruit &&
    fruitKeys.length > 1
  );
  
  currentFruit = fruits[randomKey];
  
  backgroundColor = color(currentFruit.background);

  currentFont = random(fonts);

  letterMotion = [];

  const totalLetters =
    currentFruit.text.length;

  for (let i = 0; i < totalLetters; i++) {
    letterMotion.push({
      x: 0,
      y: 0,

      vx: 0,
      vy: 0,

      angle: 0,
      angularVelocity: 0,

      delay:
        (totalLetters - 1 - i) *
        LETTER_FALL_DELAY,

      falling: false,
      landed: false,

      colorT: 0
    });
  }

  fruitState = "showing";
  fruitStartTime = millis();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

