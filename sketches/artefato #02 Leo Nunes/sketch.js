let state;
let cellSize = 10;
let running = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  state = randomState(cellSize);
  frameRate(10);
}

function randomState(cellSize) {
  let cols = floor(width / cellSize);
  let rows = floor(height / cellSize);

  let newState = [];

  for (let y = 0; y < rows; y++) {
    newState[y] = [];

    for (let x = 0; x < cols; x++) {
      newState[y][x] = random([0, 1]);
    }
  }

  return newState;
}

function drawCell(x, y, state, cellSize) {
  if (state == 0) {
    fill(0);
  } else {
    randomSeed(hashStr(`${x}--${y}`))
    fill(random(255),random(255),random(255));
  }

  square(
    x * cellSize,
    y * cellSize,
    cellSize
  );
}

function updateState(currentState) {
  let rows = currentState.length;
  let cols = currentState[0].length;

  let nextState = [];

  for (let y = 0; y < rows; y++) {
    nextState[y] = [];

    for (let x = 0; x < cols; x++) {

      let neighbours = 0;

      // Check the 8 neighboring cells
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {

          if (dx == 0 && dy == 0) {
            continue;
          }

          let nx = x + dx;
          let ny = y + dy;

          if (
            nx >= 0 &&
            nx < cols &&
            ny >= 0 &&
            ny < rows
          ) {
            neighbours += currentState[ny][nx];
          }
        }
      }

      // Conway's rules
      if (currentState[y][x] == 1) {
        nextState[y][x] =
          (neighbours == 2 || neighbours == 3) ? 1 : 0;
      } else {
        nextState[y][x] =
          neighbours == 3 ? 1 : 0;
      }
    }
  }

  return nextState;
}

function draw() {
  background(220);

  for (let y = 0; y < state.length; y++) {
    for (let x = 0; x < state[y].length; x++) {
      drawCell(x, y, state[y][x], cellSize);
    }
  }

  if (running) {
    state = updateState(state);
  }
}

function mousePressed() {
  let x = floor(mouseX / cellSize);
  let y = floor(mouseY / cellSize);

  // Make sure the click is inside the grid
  if (
    x >= 0 &&
    x < state[0].length &&
    y >= 0 &&
    y < state.length
  ) {
    // Toggle the cell
    state[y][x] = 1 - state[y][x];
  }
}

function keyPressed() {
  if (key == ' ') {
    running = !running;
  }
}

function hashStr(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i); // hash * 33 + c
  }
  return hash >>> 0; // Force unsigned 32-bit integer
}
