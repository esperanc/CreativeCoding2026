let simulation;


// ==============================
// CONFIGURAÇÃO
// ==============================

const CONFIG = {
  characterAmount: 50,

  minSize: 30,
  maxSize: 50,

  minSpeed: 0.1,
  maxSpeed: 0.5,

  attractionRadius: 150,
  attractionStrength: 0.015
};


// ==============================
// REGRAS DE REAÇÃO
// ==============================

const reactionRules = {
  "+": {
    "|": "┼",
    "-": "┼"
  },

  "<": {
    ">": "↔",
    "-": "←"
  },

  ">": {
    "-": "→"
  },

  "^": {
    "v": "↕"
  },

  "/": {
    "\\": "◇"
  }
};


// ==============================
// SETUP
// ==============================

function setup() {

  createCanvas(windowWidth, windowHeight);

  textFont("monospace");
  textAlign(CENTER, CENTER);

  simulation = new Simulation(CONFIG.characterAmount);
}


// ==============================
// DRAW
// ==============================

function draw() {

  background(10);

  simulation.update();
  simulation.draw();
}


// ==============================
// RESIZE
// ==============================

function windowResized() {

  resizeCanvas(windowWidth, windowHeight);
}

class Fusion {
  constructor(a, b, result) {
    this.a = a;
    this.b = b;
    this.result = result;

    this.timer = 0;

    this.approachDuration = 8;
    this.mergedDuration = 20;
    this.separationDuration = 8;

    this.state = "approach";
  }

  update() {
    this.timer++;

    if (this.state === "approach") {
      this.updateApproach();

      if (this.timer >= this.approachDuration) {
        this.state = "merged";
        this.timer = 0;
      }
    }
    else if (this.state === "merged") {
      this.updateMerged();

      if (this.timer >= this.mergedDuration) {
        this.state = "separation";
        this.timer = 0;
      }
    }
    else if (this.state === "separation") {
      this.updateSeparation();

      if (this.timer >= this.separationDuration) {
        this.finish();
      }
    }
  }

  updateApproach() {
    let dx = this.b.x - this.a.x;
    let dy = this.b.y - this.a.y;
    let d = sqrt(dx * dx + dy * dy);

    if (d > 1) {
      let nx = dx / d;
      let ny = dy / d;
      let force = 0.12;

      this.a.x += nx * force;
      this.a.y += ny * force;

      this.b.x -= nx * force;
      this.b.y -= ny * force;
    }

    this.a.rotation += 0.03;
    this.b.rotation -= 0.03;
  }

  updateMerged() {
    let centerX = (this.a.x + this.b.x) / 2;
    let centerY = (this.a.y + this.b.y) / 2;

    this.a.x = centerX;
    this.a.y = centerY;

    this.b.x = centerX;
    this.b.y = centerY;

    this.a.rotation += 0.02;
    this.b.rotation -= 0.02;
  }

  updateSeparation() {
    let progress = this.timer / this.separationDuration;

    let centerX = (this.a.x + this.b.x) / 2;
    let centerY = (this.a.y + this.b.y) / 2;

    let dx = this.b.x - this.a.x;
    let dy = this.b.y - this.a.y;
    let d = sqrt(dx * dx + dy * dy);

    if (d < 0.01) {
      let angle = random(TWO_PI);
      dx = cos(angle);
      dy = sin(angle);
    }
    else {
      dx /= d;
      dy /= d;
    }

    let separation = progress * 30;

    this.a.x = centerX - dx * separation;
    this.a.y = centerY - dy * separation;

    this.b.x = centerX + dx * separation;
    this.b.y = centerY + dy * separation;

    this.a.rotation += 0.04;
    this.b.rotation -= 0.04;
  }

  draw() {

    // Durante a aproximação,
    // os dois caracteres continuam visíveis.
    if (this.state === "approach") {
      this.a.draw();
      this.b.draw();
      return;
    }

    // Durante a fusão, mostramos apenas
    // o novo caractere.
    if (this.state === "merged") {
      let centerX = (this.a.x + this.b.x) / 2;
      let centerY = (this.a.y + this.b.y) / 2;

      push();

      translate(centerX, centerY);

      textAlign(CENTER, CENTER);
      textSize((this.a.size + this.b.size) / 2);
      fill(255, 220, 80);
      noStroke();

      text(this.result, 0, 0);

      pop();

      return;
    }

    // Durante a separação,
    // os caracteres originais voltam a aparecer.
    if (this.state === "separation") {
      this.a.draw();
      this.b.draw();
    }
  }

  finish() {
    this.a.fusing = false;
    this.b.fusing = false;

    this.a.fusionPartner = null;
    this.b.fusionPartner = null;

    let dx = this.b.x - this.a.x;
    let dy = this.b.y - this.a.y;
    let d = sqrt(dx * dx + dy * dy);

    if (d < 0.01) {
      let angle = random(TWO_PI);
      dx = cos(angle);
      dy = sin(angle);
    }
    else {
      dx /= d;
      dy /= d;
    }

    let force = 1.5;

    this.a.vx -= dx * force;
    this.a.vy -= dy * force;

    this.b.vx += dx * force;
    this.b.vy += dy * force;

    this.finished = true;
  }
}

// ==============================
// SIMULATION
// ==============================

class Simulation {

  constructor(amount) {

    this.characters = [];
    this.fusions = [];

    const symbols = [
      "+",
      "-",
      "|",
      "/",
      "\\",
      "<",
      ">",
      "^",
      "v"
    ];

    for (let i = 0; i < amount; i++) {

      let symbol = random(symbols);

      this.characters.push(
        new Character(
          symbol,
          random(width),
          random(height)
        )
      );
    }
  }

  update() {
    // 1. Atualiza personagens que não estão fundindo
    for (let character of this.characters) {
  
      if (!character.fusing) {
        character.update();
      }
    }
  
    // 2. Procura novos pares
    this.findAttractions();
  
    // 3. Atualiza as fusões existentes
    for (let fusion of this.fusions) {
      fusion.update();
    }
  
    // 4. Remove fusões terminadas
    for (let i = this.fusions.length - 1; i >= 0; i--) {
  
      if (this.fusions[i].finished) {
        this.fusions.splice(i, 1);
      }
    }
  }

  startFusion(a, b) {
    let result = getReactionResult(a.symbol, b.symbol);
    if (result === null) {
      return;
    }
  
    // Os personagens deixam de procurar outros parceiros
    a.target = null;
    b.target = null;
    a.attracted = false;
    b.attracted = false;
  
    // Marcam que estão ocupados em uma fusão
    a.fusing = true;
    b.fusing = true;
    a.fusionPartner = b;
    b.fusionPartner = a;
  
    let fusion = new Fusion(a, b, result);
    this.fusions.push(fusion);
  }

  findAttractions() {
    // Limpa os alvos dos personagens que
    // não estão participando de uma fusão.
    for (let character of this.characters) {
      if (!character.fusing) {
        character.target = null;
        character.attracted = false;
      }
    }
  
    // Compara cada personagem com os outros
    for (let i = 0; i < this.characters.length; i++) {
      let a = this.characters[i];
      // Se já está em uma fusão, não pode
      // participar de outra.
      if (a.fusing) {
        continue;
      }
  
      for (let j = i + 1; j < this.characters.length; j++) {
        let b = this.characters[j];
        // Também não pode usar um personagem
        // que já está em outra fusão.
        if (b.fusing) {
          continue;
        }
        // Verifica se existe uma reação entre os símbolos.
        if (!canReact(a.symbol, b.symbol)) {
          continue;
        }
  
        let d = dist(a.x, a.y, b.x, b.y);
  
        // Dentro do raio de atração
        if (d < CONFIG.attractionRadius) {
          a.target = b;
          b.target = a;
          a.attracted = true;
          b.attracted = true;
  
          // Quando ficam suficientemente próximos,
          // inicia a fusão temporária.
          if (d < 35) {
            this.startFusion(a, b);
          }
          else {
            a.attract(b);
            b.attract(a);
          }
          // Esse par já foi tratado.
          // Não queremos que "a" procure outro
          // personagem neste mesmo ciclo.
          break;
        }
      }
    }
  }

  isInFusion(character) {
    return character.fusing;
  }
  
  draw() {
    for (let character of this.characters) {
      if (!character.fusing) {
        character.draw();
      }
    }
    for (let fusion of this.fusions) {
      fusion.draw();
    }
  }
}

// ==============================
// CHARACTER
// ==============================

class Character {

  constructor(symbol, x, y) {

    this.symbol = symbol;

    this.x = x;
    this.y = y;

    this.vx = random(
      -CONFIG.maxSpeed,
      CONFIG.maxSpeed
    );

    this.vy = random(
      -CONFIG.maxSpeed,
      CONFIG.maxSpeed
    );

    this.rotation = random(TWO_PI);

    this.rotationSpeed = random(
      -0.01,
      0.01
    );

    this.size = random(
      CONFIG.minSize,
      CONFIG.maxSize
    );

    this.target = null;

    this.fusing = false;
    this.fusionPartner = null;

    this.attracted = false;
  }


  update() {

    if (this.fusing) {

      this.updateFusion();

    } else {

      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotationSpeed;
      this.vx *= 0.999;
      this.vy *= 0.999;
      this.checkBounds();
    }
  }


  attract(other) {
    let dx = other.x - this.x;
    let dy = other.y - this.y;
    let d = sqrt(dx * dx + dy * dy);
    
    if (d === 0) {
      return;
    }
    let nx = dx / d;
    let ny = dy / d;
    this.vx += nx * CONFIG.attractionStrength;
    this.vy += ny * CONFIG.attractionStrength;
    this.attracted = true;
  }

  updateFusion() {
    if (this.fusionPartner === null) {
      return;
    }
    let dx = this.fusionPartner.x - this.x;
    let dy = this.fusionPartner.y - this.y;
    let d = sqrt(dx * dx + dy * dy);
    
    if (d === 0) {
      return;
    }
    let nx = dx / d;
    let ny = dy / d;
    this.vx += nx * 0.15;
    this.vy += ny * 0.15;
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed * 3;
  }

  checkBounds() {
    if (this.x < 0) {
      this.x = 0;
      this.vx *= -1;
    }

    if (this.x > width) {
      this.x = width;
      this.vx *= -1;
    }

    if (this.y < 0) {
      this.y = 0;
      this.vy *= -1;
    }

    if (this.y > height) {
      this.y = height;
      this.vy *= -1;
    }
  }

  draw() {
    push();
    translate(
      this.x,
      this.y
    );
    rotate(
      this.rotation
    );
    
    let displaySize = this.size;
    
    if (this.attracted || this.fusing) {
      displaySize *= 1.15;
    }

    textSize(displaySize);
    noStroke();

    if (this.fusing) {
      fill(255, 180, 80);

    } else if (this.attracted) {
      fill(255, 220, 120);
      
    } else {

      fill(255);
    }

    text(
      this.symbol,
      0,
      0
    );

    pop();

    this.attracted = false;
  }
}

// ==============================
// VERIFICA COMPATIBILIDADE
// ==============================

function canReact(a, b) {

  return getReactionResult(a, b) !== null;
}

function getReactionResult(a, b) {

  if (
    reactionRules[a] &&
    reactionRules[a][b]
  ) {
    return reactionRules[a][b];
  }

  if (
    reactionRules[b] &&
    reactionRules[b][a]
  ) {
    return reactionRules[b][a];
  }

  return null;
}