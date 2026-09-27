let agents = [];
let branchLayer;
let occupied;

const MAX_AGENTS = 300;
const BRANCH_DISTANCE_MIN = 70;
const BRANCH_DISTANCE_MAX = 130;
const AGENT_SPEED = 1.5;
const WANDER_STRENGTH = 0.08;
const CELL_SIZE = 10;
const AGENT_SEPARATION = 20;
const AVOID_TURN = Math.PI / 2;
const AVOID_COOLDOWN = 30;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);
  
  branchLayer = createGraphics(width, height);
  branchLayer.colorMode(HSB, 360, 100, 100);
  branchLayer.background(15);
  branchLayer.strokeWeight(1);

  // Grade usada para detectar os ramos
  let cols = ceil(width / CELL_SIZE);
  let rows = ceil(height / CELL_SIZE);

  occupied = [];

  for (let x = 0; x < cols; x++) {
    occupied[x] = [];

    for (let y = 0; y < rows; y++) {
      occupied[x][y] = false;
    }
  }

  agents.push(
    new Agent(width / 2, height / 2)
  );
}

function draw() {
  // Desenha a camada já construída
  image(branchLayer, 0, 0);

  // Atualiza os agentes
  for (let agent of agents) {
    agent.update();
  }

  // Desenha apenas as pontas atuais
  for (let agent of agents) {
    agent.display();
  }
}

function markOccupied(x, y) {

  let col = floor(x / CELL_SIZE);
  let row = floor(y / CELL_SIZE);

  if (
    col >= 0 &&
    col < occupied.length &&
    row >= 0 &&
    row < occupied[0].length
  ) {
    occupied[col][row] = true;
  }
}

function markLineOccupied(x1, y1, x2, y2) {

  let segmentLength = dist(x1, y1, x2, y2);

  let steps = ceil(segmentLength / (CELL_SIZE / 2));

  for (let i = 0; i <= steps; i++) {

    let t = i / steps;

    let x = lerp(x1, x2, t);
    let y = lerp(y1, y2, t);

    markOccupied(x, y);
  }
}

// ==========================
// AGENTE
// ==========================

class Agent {

  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.speed = 1.5;
    this.distance = 0;
    this.avoidCooldown = 0;
    this.level = 0;
    this.branchDistance = random(
      BRANCH_DISTANCE_MIN,
      BRANCH_DISTANCE_MAX
    );
  }
    isOccupiedAhead() {
    let lookAhead = 35;
    let x = this.pos.x +
            this.vel.x * lookAhead;
  
    let y = this.pos.y +
            this.vel.y * lookAhead;
  
    return this.isOccupiedAt(x, y);
  }

  update() {
    let oldPos = this.pos.copy();
    this.vel.rotate(
      random(
        -WANDER_STRENGTH,
        WANDER_STRENGTH
      )
    );
    
    this.separateFromAgents();
    
    if (this.avoidCooldown > 0) {
      this.avoidCooldown--;
    }
    
    if (
      this.isOccupiedAhead() &&
      this.avoidCooldown === 0
    ) {
      this.chooseDirection();
      this.avoidCooldown = AVOID_COOLDOWN;
    }
    
    this.vel.setMag(AGENT_SPEED);
  
    // Move
    this.pos.add(this.vel);

    let hue = map(
      this.level,
      0,
      8,
      200,
      330
    );
    
    hue = constrain(hue, 200, 330);
    
    let brightness = map(
      this.level,
      0,
      8,
      100,
      70
    );
    
    let thickness = max(
      0.5,
      3 - this.level * 0.4
    );
    
    branchLayer.strokeWeight(thickness);
    branchLayer.stroke(hue, 80, brightness);
    
    branchLayer.line(
      oldPos.x,
      oldPos.y,
      this.pos.x,
      this.pos.y
    );
  
    // Registra o segmento
    markLineOccupied(
      oldPos.x,
      oldPos.y,
      this.pos.x,
      this.pos.y
    );
  
    // Distância percorrida
    this.distance += p5.Vector.dist(
      oldPos,
      this.pos
    );
  
    // Ramificação
    if (this.distance > this.branchDistance) {
  
      this.createBranch();
  
      this.distance = 0;
  
      this.branchDistance = random(
        BRANCH_DISTANCE_MIN,
        BRANCH_DISTANCE_MAX
      );
    }
  
    this.keepInside();
  }

  createBranch() {
  
    if (agents.length >= MAX_AGENTS) {
      return;
    }
  
    let branchDirection = this.vel.copy();
  
    // Ramificação para um dos lados
    let side = random() < 0.5 ? -1 : 1;
  
    branchDirection.rotate(
      side * random(
        PI / 4 - 0.2,
        PI / 4 + 0.2
      )
    );
  
    branchDirection.setMag(AGENT_SPEED);
  
    let newAgent = new Agent(
      this.pos.x,
      this.pos.y
    );
    
    newAgent.vel = branchDirection;
    newAgent.level = this.level + 1;
    
    agents.push(newAgent);
  }

  keepInside() {

    if (this.pos.x < 0 || this.pos.x > width) {
      this.vel.x *= -1;
      this.pos.x = constrain(
        this.pos.x,
        0,
        width
      );
    }

    if (this.pos.y < 0 || this.pos.y > height) {
      this.vel.y *= -1;
      this.pos.y = constrain(
        this.pos.y,
        0,
        height
      );
    }
  }

  isOccupiedAt(x, y) {
    let col = floor(x / CELL_SIZE);
    let row = floor(y / CELL_SIZE);
    if (
      col < 0 ||
      col >= occupied.length ||
      row < 0 ||
      row >= occupied[0].length
    ) {
      return true;
    }
  
    return occupied[col][row];
  }

  separateFromAgents() {
    let separation = createVector(0, 0);
    let count = 0;
  
    for (let other of agents) {
  
      if (other === this) {
        continue;
      }
  
      let agentDistance = p5.Vector.dist(
        this.pos,
        other.pos
      );
  
      if (
        agentDistance > 0 &&
        agentDistance < AGENT_SEPARATION
      ) {
  
        let away = p5.Vector.sub(
          this.pos,
          other.pos
        );
  
        away.normalize();
  
        // Quanto mais perto, maior a força
        away.mult(
          1 - agentDistance / AGENT_SEPARATION
        );
  
        separation.add(away);
        count++;
      }
    }
  
    if (count > 0) {
      separation.div(count);
      separation.setMag(0.08);
      this.vel.add(separation);
    }
  }
  
  chooseDirection() {
    let bestDirection = null;
    let bestSpace = -1;
  
    // Testa várias direções ao redor do agente
    for (let i = 0; i < 8; i++) {
  
      let angle = i * Math.PI / 4;
  
      let direction = this.vel.copy();
      direction.rotate(angle);
  
      let space = this.getSpace(direction);
  
      if (space > bestSpace) {
        bestSpace = space;
        bestDirection = direction;
      }
    }
  
    // Se encontrou algum espaço
    if (bestDirection !== null) {
      this.vel = bestDirection.copy();
    }
  
    // Mantém o agente afastado da região congestionada
    this.avoidCooldown = AVOID_COOLDOWN;
  }
  
  getSpace(direction) {
  
    let sampleDistance = 18;
    let free = 0;
  
    // Testa vários pontos ao longo da direção
    for (let i = 1; i <= 4; i++) {
  
      let x = this.pos.x +
              direction.x * sampleDistance * i;
  
      let y = this.pos.y +
              direction.y * sampleDistance * i;
  
      if (!this.isOccupiedAt(x, y)) {
        free++;
      }
    }
  
    return free;
  }

  display() {

    noStroke();
    fill(255);

    circle(
      this.pos.x,
      this.pos.y,
      4
    );
  }
}