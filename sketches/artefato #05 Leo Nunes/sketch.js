//const vn = 8;
//const vv = 1;
//const en = 12;
//const fn = 6;

let running = true;
let defaultSize = 200;
let defaultN = 12;
let smallCubeSize = 100;
let generationRate = 50;
let frameCounter = 0;

function applyRules(sum, state) {
  let alive = 3;
  let keep = 2;

  if (sum == alive) {
    return true;
  }

  if (sum == keep) {
    return state;
  }

  return false;
}

function logic2euclidian(coord, size, n) {
  return size * (coord - n / 2);
}

function testPos(x, y, z, n) {
  if (x < 0 || y < 0 || z < 0 || x >= n || y >= n || z >= n) {
    return false;
  }

  if (x < 1 || y < 1 || z < 1 || x >= n - 1 || y >= n - 1 || z >= n - 1) {
    return true;
  }

  return false;
}

function keyPressed() {
  if (key === ' ') {
    running = !running;
  }
}

class Cube {
  constructor(
    posx = 0,
    posy = 0,
    posz = 0,
    initialState = true,
    nextState = null,
    superSize = 1,
    size = smallCubeSize,
    superCube = null
  ) {
    this.x = posx;
    this.y = posy;
    this.z = posz;

    this.state = initialState;
    this.nextState = nextState;

    this.maxCoord = superSize;
    this.size = size;

    this.superCube = superCube;

    this.realx = logic2euclidian(this.x, this.size, this.maxCoord);
    this.realy = logic2euclidian(this.y, this.size, this.maxCoord);
    this.realz = logic2euclidian(this.z, this.size, this.maxCoord);
  }

  solve() {
    if (this.nextState == null) {
      let totalNeigh = 0;

      for (let varz = -1; varz < 2; varz++) {
        for (let vary = -1; vary < 2; vary++) {
          for (let varx = -1; varx < 2; varx++) {
            if (varx == 0 && vary == 0 && varz == 0) {
              continue;
            }

            let tx = this.x + varx;
            let ty = this.y + vary;
            let tz = this.z + varz;

            if (testPos(tx, ty, tz, this.maxCoord)) {
              let neighbor = this.superCube.cubeCoords[tx][ty][tz];

              if (neighbor != null && neighbor.state) {
                totalNeigh++;
              }
            }
          }
        }
      }

      this.nextState = applyRules(totalNeigh, this.state);
    }
  }

  toggle() {
    this.state = this.nextState;
    this.nextState = null;
  }

  drawMe() {
    push();

    translate(this.realx, this.realy, this.realz);

    if (this.state) {
      fill(255);
    } else {
      fill(0);
    }

    box(this.size);

    pop();
  }
}

class SuperCube {
  constructor(n = defaultN, size = defaultSize) {
    this.sides = n;
    this.size = size;
    this.smallSize = floor(size/n)+1

    this.cubeCoords = [];

    for (let x = 0; x < this.sides; x++) {
      let fixedx = [];

      for (let y = 0; y < this.sides; y++) {
        let fixedxy = [];

        for (let z = 0; z < this.sides; z++) {
          if (testPos(x, y, z, this.sides)) {
            fixedxy.push(
              new Cube(
                x,
                y,
                z,
                random() < 0.5,
                null,
                this.sides,
                this.smallSize,
                this
              )
            );
          } else {
            fixedxy.push(null);
          }
        }

        fixedx.push(fixedxy);
      }

      this.cubeCoords.push(fixedx);
    }
  }

  solve() {
    for (let x = 0; x < this.sides; x++) {
      for (let y = 0; y < this.sides; y++) {
        for (let z = 0; z < this.sides; z++) {
          let cube = this.cubeCoords[x][y][z];

          if (cube != null) {
            cube.solve();
          }
        }
      }
    }

    for (let x = 0; x < this.sides; x++) {
      for (let y = 0; y < this.sides; y++) {
        for (let z = 0; z < this.sides; z++) {
          let cube = this.cubeCoords[x][y][z];

          if (cube != null) {
            cube.toggle();
          }
        }
      }
    }
  }

  drawMe() {
    for (let x = 0; x < this.sides; x++) {
      for (let y = 0; y < this.sides; y++) {
        for (let z = 0; z < this.sides; z++) {
          let cube = this.cubeCoords[x][y][z];

          if (cube != null) {
            cube.drawMe();
          }
        }
      }
    }
  }
}

let mainCube;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  frameRate(20);

  mainCube = new SuperCube();
}



function draw() {
  background(220);

  orbitControl();

  mainCube.drawMe();
  frameCounter++;

  if (frameCounter >= 60 / generationRate && running) {
    mainCube.solve();
    frameCounter = 0;
  }
}
