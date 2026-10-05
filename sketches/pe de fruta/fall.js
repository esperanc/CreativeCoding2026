function updateLetterFall() {
  const base = min(width, height);
  const dt = deltaTime / 1000;

  const gravity = base * 1.8;

  const floorOffset =
    height*0.45;
    
  const restitution = 0.38;
  const friction = 0.9;
  const angularFriction = 0.68;

  const elapsed =
    millis() - fruitStartTime;

  for (const letter of letterMotion) {

    const hasStarted =
      elapsed >= letter.delay;

    if (hasStarted && letter.colorT < 1) {
      letter.colorT +=
        dt / COLOR_FADE_TIME;

      letter.colorT =
        constrain(
          letter.colorT,
          0,
          1
        );
    }

    if (letter.landed) {
      continue;
    }

    if (!letter.falling) {
      if (hasStarted) {
        letter.falling = true;
      } else {
        continue;
      }
    }

    letter.vy +=
      gravity * dt;

    // posição
    letter.x +=
      letter.vx * dt;

    letter.y +=
      letter.vy * dt;

    // rotação
    letter.angle +=
      letter.angularVelocity * dt;

    // colisão
    if (letter.y >= floorOffset) {
      letter.y = floorOffset;

      letter.vy =
        -letter.vy * restitution;

      letter.vx *= friction;

      letter.angularVelocity *=
        angularFriction;

      if (
        abs(letter.vy) < base * 0.08 &&
        abs(letter.angularVelocity) < 0.15
      ) {
        letter.vy = 0;
        letter.vx = 0;
        letter.angularVelocity = 0;

        letter.falling = false;
        letter.landed = true;

      }
    }
  }
}

function startFalling() {
  fruitState = "falling";

  const base = min(width, height);

  for (const letter of letterMotion) {
    letter.vx = random(
      -base * 0.3,
      base * 0.3
    );

    letter.vy = 0;

    // direção aleatória
    const direction =
      random() < 0.5 ? -1 : 1;

    letter.angularVelocity =
      direction * random(1.0, 4.5);
    
    letter.angle =
      random(-0.1, 0.1);
    letter.falling = false;
    letter.landed = false;
  }

  fruitStartTime = millis();
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