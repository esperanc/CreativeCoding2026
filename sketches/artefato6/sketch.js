// ============================================================
// ARTEFATO 6 - ECOSSISTEMA SLITHER.IO
//
// Cada cobra é um agente autônomo que:
// - procura comida;
// - avalia diferentes caminhos;
// - evita corpos de outras cobras;
// - prevê o movimento de outras cabeças;
// - cresce ao comer;
// - morre ao atingir outra cobra;
// - transforma seu corpo em alimento ao morrer.
//
// Comportamentos maiores como competição, aglomerações,
// crescimento desigual, mortes em cadeia e oscilações
// populacionais emergem dessas regras locais.
// ============================================================


// ============================================================
// VARIÁVEIS GERAIS
// ============================================================

let snakes = [];
let foods = [];
let respawnQueue = [];


// ============================================================
// POPULAÇÃO
// ============================================================

const INITIAL_SNAKES = 14;
const NORMAL_SNAKE_POPULATION = 14;
const CRITICAL_SNAKE_POPULATION = 8;


// ============================================================
// COMIDA
// ============================================================

const INITIAL_FOOD = 170;

const SOFT_FOOD_LIMIT = 230;
const MAX_FOOD = 450;

const FOOD_SIZE_MIN = 3.5;
const FOOD_SIZE_MAX = 6.5;


// ============================================================
// AGLOMERADOS NATURAIS
// ============================================================

const FOOD_CLUSTER_CHANCE = 0.0035;

const CLUSTER_MIN = 2;
const CLUSTER_MAX = 5;


// ============================================================
// COBRAS
// ============================================================

const START_LENGTH = 20;


// ============================================================
// RESPAWN
// ============================================================

const RESPAWN_TIME_MIN = 360;
const RESPAWN_TIME_MAX = 720;


// ============================================================
// INTELIGÊNCIA
// ============================================================

// Número de direções avaliadas.
const NUM_DIRECTIONS = 7;

// Abertura total do cone de decisão.
const DECISION_ARC = 1.55;

// Distâncias de previsão.
const LOOK_AHEAD_NEAR = 30;
const LOOK_AHEAD_MID = 55;
const LOOK_AHEAD_FAR = 82;

// Distância de segurança dos corpos.
const BODY_DANGER_RADIUS = 22;

// Previsão de movimento das cabeças.
const HEAD_PREDICTION_DISTANCE = 75;


// ============================================================
// PALETA
// ============================================================

const SNAKE_COLORS = [

  [235, 75, 75],
  [70, 190, 245],
  [245, 190, 65],
  [120, 220, 110],
  [195, 100, 235],
  [245, 125, 60],
  [70, 220, 195],
  [235, 100, 170],
  [150, 190, 255],
  [200, 230, 90]

];


// ============================================================
// SETUP
// ============================================================

function setup() {

  createCanvas(800, 800);

  pixelDensity(1);


  // ----------------------------------------------------------
  // COMIDA INICIAL
  // ----------------------------------------------------------

  for (let i = 0; i < INITIAL_FOOD; i++) {

    spawnFood();
  }


  // ----------------------------------------------------------
  // COBRAS INICIAIS
  // ----------------------------------------------------------

  for (let i = 0; i < INITIAL_SNAKES; i++) {

    spawnSnake();
  }
}


// ============================================================
// DRAW
// ============================================================

function draw() {

  drawBackground();


  // ----------------------------------------------------------
  // ECOLOGIA
  // ----------------------------------------------------------

  updateNaturalFood();

  updateRespawns();

  updatePopulation();


  // ----------------------------------------------------------
  // ATUALIZA COBRAS
  // ----------------------------------------------------------

  for (let snake of snakes) {

    if (snake.alive) {

      snake.update();
    }
  }


  // ----------------------------------------------------------
  // DESENHA COMIDA
  // ----------------------------------------------------------

  for (let food of foods) {

    food.display();
  }


  // ----------------------------------------------------------
  // DESENHA COBRAS
  // ----------------------------------------------------------

  for (let snake of snakes) {

    if (snake.alive) {

      snake.display();
    }
  }


  // ----------------------------------------------------------
  // REMOVE COBRAS MORTAS
  // ----------------------------------------------------------

  snakes =
    snakes.filter(
      snake => snake.alive
    );


  drawVignette();
}


// ============================================================
// COMIDA NATURAL
// ============================================================

function updateNaturalFood() {

  if (foods.length >= MAX_FOOD) {

    return;
  }


  let spawnChance;


  // ----------------------------------------------------------
  // QUANTO MENOS COMIDA, MAIS RÁPIDO ELA NASCE
  // ----------------------------------------------------------

  if (foods.length < 100) {

    spawnChance = 0.25;

  }

  else if (foods.length < 140) {

    spawnChance = 0.18;

  }

  else if (foods.length < 180) {

    spawnChance = 0.11;

  }

  else if (foods.length < SOFT_FOOD_LIMIT) {

    spawnChance = 0.055;

  }

  else if (foods.length < 320) {

    spawnChance = 0.018;

  }

  else {

    spawnChance = 0.006;
  }


  // ----------------------------------------------------------
  // COMIDA INDIVIDUAL
  // ----------------------------------------------------------

  if (random() < spawnChance) {

    spawnFood();
  }


  // ----------------------------------------------------------
  // AGLOMERADO NATURAL
  // ----------------------------------------------------------

  if (
    foods.length < SOFT_FOOD_LIMIT &&
    random() < FOOD_CLUSTER_CHANCE
  ) {

    spawnFoodCluster();
  }
}


// ============================================================
// AGLOMERADO NATURAL
// ============================================================

function spawnFoodCluster() {

  let margin = 70;


  let centerX =
    random(
      margin,
      width - margin
    );


  let centerY =
    random(
      margin,
      height - margin
    );


  let amount =
    floor(
      random(
        CLUSTER_MIN,
        CLUSTER_MAX + 1
      )
    );


  for (let i = 0; i < amount; i++) {

    if (foods.length >= MAX_FOOD) {

      break;
    }


    let clusterAngle =
      random(TWO_PI);


    let clusterDistance =
      random(
        5,
        30
      );


    let foodX =
      centerX +
      cos(clusterAngle) *
      clusterDistance;


    let foodY =
      centerY +
      sin(clusterAngle) *
      clusterDistance;


    foods.push(

      new Food(

        foodX,
        foodY,

        random(
          0.85,
          1.35
        )

      )

    );
  }
}


// ============================================================
// POPULAÇÃO
// ============================================================

function updatePopulation() {

  let totalPopulation =
    snakes.length +
    respawnQueue.length;


  // ----------------------------------------------------------
  // POPULAÇÃO CRÍTICA
  // ----------------------------------------------------------

  if (
    totalPopulation <
    CRITICAL_SNAKE_POPULATION
  ) {

    if (
      frameCount % 120 === 0
    ) {

      scheduleRespawn(true);
    }


    return;
  }


  // ----------------------------------------------------------
  // POPULAÇÃO ABAIXO DO NORMAL
  // ----------------------------------------------------------

  if (
    totalPopulation <
    NORMAL_SNAKE_POPULATION
  ) {

    if (
      frameCount % 240 === 0 &&
      random() < 0.45
    ) {

      scheduleRespawn(false);
    }
  }
}


// ============================================================
// CLASSE FOOD
// ============================================================

class Food {

  constructor(
    x,
    y,
    value = 1,
    colorOverride = null
  ) {

    this.pos =
      createVector(
        x,
        y
      );


    this.value =
      value;


    this.size =
      map(
        value,
        0.7,
        2.5,
        FOOD_SIZE_MIN,
        FOOD_SIZE_MAX + 2,
        true
      );


    // --------------------------------------------------------
    // COR
    // --------------------------------------------------------

    if (colorOverride !== null) {

      this.col =
        colorOverride.slice();

    }

    else {

      const palette = [

        [245, 90, 100],
        [90, 210, 245],
        [245, 205, 80],
        [125, 235, 120],
        [210, 115, 245],
        [245, 140, 75]

      ];


      this.col =
        random(
          palette
        ).slice();
    }


    this.phase =
      random(TWO_PI);
  }


  // ==========================================================
  // DISPLAY
  // ==========================================================

  display() {

    let pulse =
      1 +
      sin(
        frameCount * 0.06 +
        this.phase
      ) *
      0.12;


    noStroke();


    // --------------------------------------------------------
    // HALO EXTERNO
    // --------------------------------------------------------

    fill(
      this.col[0],
      this.col[1],
      this.col[2],
      18
    );


    circle(
      this.pos.x,
      this.pos.y,
      this.size * 3.2 * pulse
    );


    // --------------------------------------------------------
    // HALO INTERNO
    // --------------------------------------------------------

    fill(
      this.col[0],
      this.col[1],
      this.col[2],
      55
    );


    circle(
      this.pos.x,
      this.pos.y,
      this.size * 1.8 * pulse
    );


    // --------------------------------------------------------
    // NÚCLEO
    // --------------------------------------------------------

    fill(
      this.col[0],
      this.col[1],
      this.col[2],
      240
    );


    circle(
      this.pos.x,
      this.pos.y,
      this.size * pulse
    );


    // --------------------------------------------------------
    // BRILHO
    // --------------------------------------------------------

    fill(
      255,
      255,
      255,
      150
    );


    circle(

      this.pos.x -
      this.size * 0.15,

      this.pos.y -
      this.size * 0.15,

      this.size * 0.25

    );
  }
}


// ============================================================
// CLASSE SNAKE
// ============================================================

class Snake {

  constructor(
    x,
    y,
    col
  ) {

    this.pos =
      createVector(
        x,
        y
      );


    this.angle =
      random(TWO_PI);


    this.col =
      col.slice();


    this.alive = true;


    this.body = [];


    this.targetLength =
      START_LENGTH;


    this.spacing = 4.3;


    this.radius = 6.3;


    // ========================================================
    // MOVIMENTO
    // ========================================================

    this.baseSpeed =
      random(
        1.10,
        1.30
      );


    this.turnSpeed =
      random(
        0.030,
        0.043
      );


    this.emergencyTurn =
      random(
        0.060,
        0.078
      );


    // ========================================================
    // PERSONALIDADE
    // ========================================================

    // Quanto valoriza comida.
    this.greed =
      random(
        0.80,
        1.30
      );


    // Quanto evita riscos.
    this.caution =
      random(
        0.85,
        1.35
      );


    // Quanto prefere trajetórias suaves.
    this.stability =
      random(
        0.80,
        1.20
      );


    this.foodVision =
      random(
        120,
        165
      );


    // ========================================================
    // EXPLORAÇÃO
    // ========================================================

    this.noiseOffset =
      random(10000);


    this.noiseTime =
      random(10000);


    this.curiosity =
      random(
        0.8,
        1.2
      );


    // ========================================================
    // MEMÓRIA
    // ========================================================

    this.preferredSide =
      random() < 0.5
      ? -1
      : 1;


    this.lastChosenOffset = 0;


    // ========================================================
    // CORPO INICIAL
    // ========================================================

    for (
      let i = 0;
      i < START_LENGTH;
      i++
    ) {

      this.body.push(

        createVector(

          x -
          cos(this.angle) *
          i *
          this.spacing,

          y -
          sin(this.angle) *
          i *
          this.spacing

        )

      );
    }
  }


  // ==========================================================
  // UPDATE
  // ==========================================================

  update() {

    // ========================================================
    // 1. ESCOLHE CAMINHO
    // ========================================================

    let decision =
      this.chooseDirection();


    // ========================================================
    // 2. VIRA
    // ========================================================

    let desiredAngle =
      this.angle +
      decision.offset;


    let dangerAhead =
      this.pathDanger(
        this.angle,
        LOOK_AHEAD_NEAR
      );


    let allowedTurn =
      dangerAhead > 0.45
      ? this.emergencyTurn
      : this.turnSpeed;


    this.angle =
      rotateToward(

        this.angle,
        desiredAngle,
        allowedTurn

      );


    // ========================================================
    // 3. BORDAS
    // ========================================================

    this.avoidEdges();


    // ========================================================
    // 4. VELOCIDADE
    // ========================================================

    let lengthPenalty =
      constrain(

        map(
          this.targetLength,
          START_LENGTH,
          150,
          1,
          0.74
        ),

        0.74,
        1

      );


    let speed =
      this.baseSpeed *
      lengthPenalty;


    // --------------------------------------------------------
    // Reduz um pouco a velocidade em perigo extremo.
    // --------------------------------------------------------

    if (
      dangerAhead > 0.75
    ) {

      speed *= 0.88;
    }


    // ========================================================
    // 5. MOVIMENTO
    // ========================================================

    let velocity =
      p5.Vector.fromAngle(
        this.angle
      );


    velocity.setMag(
      speed
    );


    this.pos.add(
      velocity
    );


    // ========================================================
    // 6. CORPO
    // ========================================================

    this.updateBody();


    // ========================================================
    // 7. COMIDA
    // ========================================================

    this.eatFood();


    // ========================================================
    // 8. COLISÃO
    // ========================================================

    this.checkCollision();
  }


  // ==========================================================
  // ESCOLHE DIREÇÃO
  // ==========================================================

  chooseDirection() {

    let bestOffset = 0;

    let bestScore =
      -Infinity;


    // --------------------------------------------------------
    // TESTA 7 DIREÇÕES
    // --------------------------------------------------------

    for (
      let i = 0;
      i < NUM_DIRECTIONS;
      i++
    ) {

      let normalized =
        map(
          i,
          0,
          NUM_DIRECTIONS - 1,
          -1,
          1
        );


      let offset =
        normalized *
        DECISION_ARC *
        0.5;


      let testAngle =
        this.angle +
        offset;


      let score =
        this.evaluateDirection(
          testAngle,
          offset
        );


      // ------------------------------------------------------
      // PEQUENA IMPERFEIÇÃO
      // ------------------------------------------------------

      score +=
        random(
          -0.8,
          0.8
        );


      if (
        score >
        bestScore
      ) {

        bestScore =
          score;


        bestOffset =
          offset;
      }
    }


    // --------------------------------------------------------
    // MEMÓRIA DO LADO ESCOLHIDO
    // --------------------------------------------------------

    if (
      abs(bestOffset) >
      0.05
    ) {

      this.preferredSide =
        bestOffset < 0
        ? -1
        : 1;


      this.lastChosenOffset =
        bestOffset;
    }


    return {

      offset:
        bestOffset,

      score:
        bestScore

    };
  }


  // ==========================================================
  // AVALIA UMA DIREÇÃO
  // ==========================================================

  evaluateDirection(
    testAngle,
    offset
  ) {

    let score = 0;


    // ========================================================
    // 1. PERIGO
    // ========================================================

    let dangerNear =
      this.pathDanger(
        testAngle,
        LOOK_AHEAD_NEAR
      );


    let dangerMid =
      this.pathDanger(
        testAngle,
        LOOK_AHEAD_MID
      );


    let dangerFar =
      this.pathDanger(
        testAngle,
        LOOK_AHEAD_FAR
      );


    // --------------------------------------------------------
    // PERIGO PRÓXIMO TEM PESO MAIOR
    // --------------------------------------------------------

    score -=
      dangerNear *
      90 *
      this.caution;


    score -=
      dangerMid *
      48 *
      this.caution;


    score -=
      dangerFar *
      20 *
      this.caution;


    // ========================================================
    // 2. ESPAÇO LIVRE
    // ========================================================

    let freedom =
      1 -
      constrain(

        dangerNear * 0.6 +
        dangerMid * 0.3 +
        dangerFar * 0.1,

        0,
        1

      );


    score +=
      freedom * 16;


    // ========================================================
    // 3. COMIDA
    // ========================================================

    let foodScore =
      this.foodScoreInDirection(
        testAngle
      );


    score +=
      foodScore *
      this.greed;


    // ========================================================
    // 4. PREVISÃO DE CABEÇAS
    // ========================================================

    let headRisk =
      this.predictHeadDanger(
        testAngle
      );


    score -=
      headRisk *
      65 *
      this.caution;


    // ========================================================
    // 5. PENALIDADE DE CURVA
    // ========================================================

    let turnPenalty =
      abs(offset) /
      (DECISION_ARC * 0.5);


    score -=
      turnPenalty *
      9 *
      this.stability;


    // ========================================================
    // 6. MEMÓRIA DE DIREÇÃO
    // ========================================================

    if (
      abs(offset) > 0.05
    ) {

      let side =
        offset < 0
        ? -1
        : 1;


      if (
        side ===
        this.preferredSide
      ) {

        score += 1.5;
      }
    }


    // ========================================================
    // 7. VARIAÇÃO ORGÂNICA
    // ========================================================

    let exploration =
      noise(

        this.noiseOffset,

        this.noiseTime +
        testAngle

      );


    score +=
      map(
        exploration,
        0,
        1,
        -2,
        2
      );


    return score;
  }


  // ==========================================================
  // PERIGO EM UMA DIREÇÃO
  // ==========================================================

  pathDanger(
    testAngle,
    distanceAhead
  ) {

    let sampleX =
      this.pos.x +
      cos(testAngle) *
      distanceAhead;


    let sampleY =
      this.pos.y +
      sin(testAngle) *
      distanceAhead;


    let danger = 0;


    // ========================================================
    // BORDA
    //
    // CORREÇÃO:
    // Math.min() aceita os quatro valores.
    // ========================================================

    let edgeDistance =
      Math.min(

        sampleX,

        width -
        sampleX,

        sampleY,

        height -
        sampleY

      );


    if (
      edgeDistance < 50
    ) {

      danger +=
        map(

          edgeDistance,

          0,
          50,

          1,
          0,

          true

        );
    }


    // ========================================================
    // CORPOS DAS OUTRAS COBRAS
    // ========================================================

    for (
      let other of snakes
    ) {

      if (
        other === this ||
        !other.alive
      ) {

        continue;
      }


      // ------------------------------------------------------
      // PULA SEGMENTOS PARA REDUZIR CUSTO
      // ------------------------------------------------------

      for (
        let i = 4;
        i < other.body.length;
        i += 5
      ) {

        let segment =
          other.body[i];


        let d =
          dist(

            sampleX,
            sampleY,

            segment.x,
            segment.y

          );


        if (
          d <
          BODY_DANGER_RADIUS
        ) {

          let localDanger =
            map(

              d,

              0,
              BODY_DANGER_RADIUS,

              1,
              0,

              true

            );


          danger =
            max(
              danger,
              localDanger
            );
        }
      }
    }


    return constrain(
      danger,
      0,
      1
    );
  }


  // ==========================================================
  // VALOR DA COMIDA EM UMA DIREÇÃO
  // ==========================================================

  foodScoreInDirection(
    testAngle
  ) {

    let score = 0;


    let forward =
      p5.Vector.fromAngle(
        testAngle
      );


    for (
      let food of foods
    ) {

      let toFood =
        p5.Vector.sub(
          food.pos,
          this.pos
        );


      let d =
        toFood.mag();


      if (
        d > this.foodVision ||
        d < 0.01
      ) {

        continue;
      }


      toFood.normalize();


      // ------------------------------------------------------
      // 1 = EXATAMENTE À FRENTE
      // ------------------------------------------------------

      let alignment =
        forward.dot(
          toFood
        );


      // ------------------------------------------------------
      // IGNORA COMIDA FORA DO CONE
      // ------------------------------------------------------

      if (
        alignment < 0.72
      ) {

        continue;
      }


      let distanceValue =
        map(

          d,

          0,
          this.foodVision,

          1,
          0,

          true

        );


      let alignmentValue =
        map(

          alignment,

          0.72,
          1,

          0,
          1,

          true

        );


      score +=

        distanceValue *
        alignmentValue *
        food.value *
        12;
    }


    return Math.min(
      score,
      35
    );
  }


  // ==========================================================
  // PREVISÃO DE CABEÇAS
  // ==========================================================

  predictHeadDanger(
    testAngle
  ) {

    let risk = 0;


    // --------------------------------------------------------
    // POSIÇÃO FUTURA DESTA COBRA
    // --------------------------------------------------------

    let futureSelf =
      createVector(

        this.pos.x +
        cos(testAngle) *
        HEAD_PREDICTION_DISTANCE,

        this.pos.y +
        sin(testAngle) *
        HEAD_PREDICTION_DISTANCE

      );


    for (
      let other of snakes
    ) {

      if (
        other === this ||
        !other.alive
      ) {

        continue;
      }


      let currentDistance =
        p5.Vector.dist(
          this.pos,
          other.pos
        );


      // ------------------------------------------------------
      // IGNORA CABEÇAS MUITO DISTANTES
      // ------------------------------------------------------

      if (
        currentDistance > 150
      ) {

        continue;
      }


      // ------------------------------------------------------
      // POSIÇÃO FUTURA DA OUTRA COBRA
      // ------------------------------------------------------

      let futureOther =
        createVector(

          other.pos.x +
          cos(other.angle) *
          HEAD_PREDICTION_DISTANCE,

          other.pos.y +
          sin(other.angle) *
          HEAD_PREDICTION_DISTANCE

        );


      let futureDistance =
        p5.Vector.dist(
          futureSelf,
          futureOther
        );


      if (
        futureDistance < 65
      ) {

        let localRisk =
          map(

            futureDistance,

            0,
            65,

            1,
            0,

            true

          );


        risk =
          max(
            risk,
            localRisk
          );
      }
    }


    return risk;
  }


  // ==========================================================
  // BORDAS
  // ==========================================================

  avoidEdges() {

    const margin = 65;


    let desiredAngle =
      null;


    let center =
      createVector(
        width / 2,
        height / 2
      );


    if (
      this.pos.x < margin ||
      this.pos.x > width - margin ||
      this.pos.y < margin ||
      this.pos.y > height - margin
    ) {

      let towardCenter =
        p5.Vector.sub(
          center,
          this.pos
        );


      desiredAngle =
        towardCenter.heading();
    }


    if (
      desiredAngle !== null
    ) {

      this.angle =
        rotateToward(

          this.angle,
          desiredAngle,
          this.emergencyTurn

        );
    }


    this.pos.x =
      constrain(
        this.pos.x,
        4,
        width - 4
      );


    this.pos.y =
      constrain(
        this.pos.y,
        4,
        height - 4
      );
  }


  // ==========================================================
  // CORPO
  // ==========================================================

  updateBody() {

    this.body.unshift(
      this.pos.copy()
    );


    let desiredPoints =
      floor(
        this.targetLength *
        this.spacing
      );


    while (
      this.body.length >
      desiredPoints
    ) {

      this.body.pop();
    }
  }


  // ==========================================================
  // COME
  // ==========================================================

  eatFood() {

    for (
      let i =
        foods.length - 1;
      i >= 0;
      i--
    ) {

      let food =
        foods[i];


      let d =
        p5.Vector.dist(
          this.pos,
          food.pos
        );


      if (
        d <
        this.radius +
        food.size * 0.6
      ) {

        this.targetLength +=
          food.value * 0.85;


        this.targetLength =
          Math.min(
            this.targetLength,
            150
          );


        foods.splice(
          i,
          1
        );


        break;
      }
    }
  }


  // ==========================================================
  // COLISÃO
  // ==========================================================

  checkCollision() {

    for (
      let other of snakes
    ) {

      // ------------------------------------------------------
      // NÃO COLIDE COM ELA MESMA
      // ------------------------------------------------------

      if (
        other === this ||
        !other.alive
      ) {

        continue;
      }


      // ------------------------------------------------------
      // CABEÇA CONTRA CORPO
      // ------------------------------------------------------

      for (
        let i = 5;
        i < other.body.length;
        i += 3
      ) {

        let segment =
          other.body[i];


        let d =
          p5.Vector.dist(
            this.pos,
            segment
          );


        if (
          d <
          this.radius * 1.55
        ) {

          this.die();

          return;
        }
      }
    }
  }


  // ==========================================================
  // MORTE
  // ==========================================================

  die() {

    if (!this.alive) {

      return;
    }


    this.alive = false;


    // ========================================================
    // CORPO VIRA COMIDA
    // ========================================================

    for (
      let i = 0;
      i < this.body.length;
      i += 7
    ) {

      if (
        foods.length >=
        MAX_FOOD
      ) {

        break;
      }


      let segment =
        this.body[i];


      let foodX =
        segment.x +
        random(
          -4,
          4
        );


      let foodY =
        segment.y +
        random(
          -4,
          4
        );


      foodX =
        constrain(
          foodX,
          5,
          width - 5
        );


      foodY =
        constrain(
          foodY,
          5,
          height - 5
        );


      foods.push(

        new Food(

          foodX,
          foodY,

          random(
            1.1,
            1.8
          ),

          this.col

        )

      );
    }


    // ========================================================
    // EXPLOSÃO NA CABEÇA
    // ========================================================

    for (
      let i = 0;
      i < 6;
      i++
    ) {

      if (
        foods.length >=
        MAX_FOOD
      ) {

        break;
      }


      let explosionAngle =
        random(TWO_PI);


      let explosionDistance =
        random(
          3,
          13
        );


      let foodX =
        this.pos.x +
        cos(explosionAngle) *
        explosionDistance;


      let foodY =
        this.pos.y +
        sin(explosionAngle) *
        explosionDistance;


      foodX =
        constrain(
          foodX,
          5,
          width - 5
        );


      foodY =
        constrain(
          foodY,
          5,
          height - 5
        );


      foods.push(

        new Food(

          foodX,
          foodY,

          random(
            1.2,
            2
          ),

          this.col

        )

      );
    }


    // ========================================================
    // RESPAWN LENTO
    // ========================================================

    if (
      snakes.length +
      respawnQueue.length <=
      NORMAL_SNAKE_POPULATION
    ) {

      scheduleRespawn(false);
    }
  }


  // ==========================================================
  // DISPLAY
  // ==========================================================

  display() {

    if (
      this.body.length < 2
    ) {

      return;
    }


    // ========================================================
    // CORPO
    // ========================================================

    for (
      let i =
        this.body.length - 1;
      i >= 0;
      i -= 3
    ) {

      let segment =
        this.body[i];


      let taper =
        map(
          i,
          0,
          this.body.length,
          1,
          0.72
        );


      let segmentSize =
        this.radius *
        2 *
        taper;


      noStroke();


      // ------------------------------------------------------
      // SOMBRA
      // ------------------------------------------------------

      fill(
        0,
        0,
        0,
        80
      );


      circle(

        segment.x + 2,
        segment.y + 2.5,

        segmentSize * 1.08

      );


      // ------------------------------------------------------
      // HALO
      // ------------------------------------------------------

      fill(
        this.col[0],
        this.col[1],
        this.col[2],
        20
      );


      circle(

        segment.x,
        segment.y,

        segmentSize * 1.65

      );


      // ------------------------------------------------------
      // CORPO
      // ------------------------------------------------------

      fill(
        this.col[0],
        this.col[1],
        this.col[2],
        235
      );


      circle(

        segment.x,
        segment.y,

        segmentSize

      );


      // ------------------------------------------------------
      // BRILHO
      // ------------------------------------------------------

      fill(
        255,
        255,
        255,
        24
      );


      circle(

        segment.x -
        segmentSize * 0.12,

        segment.y -
        segmentSize * 0.12,

        segmentSize * 0.44

      );
    }


    // ========================================================
    // CABEÇA
    // ========================================================

    push();


    translate(
      this.pos.x,
      this.pos.y
    );


    rotate(
      this.angle
    );


    noStroke();


    // --------------------------------------------------------
    // HALO
    // --------------------------------------------------------

    fill(
      this.col[0],
      this.col[1],
      this.col[2],
      28
    );


    circle(
      0,
      0,
      this.radius * 4
    );


    // --------------------------------------------------------
    // CABEÇA
    // --------------------------------------------------------

    fill(
      this.col[0],
      this.col[1],
      this.col[2],
      255
    );


    circle(
      0,
      0,
      this.radius * 2.35
    );


    // ========================================================
    // OLHOS
    // ========================================================

    let eyeX =
      this.radius * 0.55;


    let eyeY =
      this.radius * 0.52;


    // --------------------------------------------------------
    // BRANCO
    // --------------------------------------------------------

    fill(
      250,
      250,
      250
    );


    circle(
      eyeX,
      -eyeY,
      this.radius * 0.72
    );


    circle(
      eyeX,
      eyeY,
      this.radius * 0.72
    );


    // --------------------------------------------------------
    // PUPILAS
    // --------------------------------------------------------

    fill(
      20,
      22,
      25
    );


    circle(

      eyeX +
      this.radius * 0.14,

      -eyeY,

      this.radius * 0.31

    );


    circle(

      eyeX +
      this.radius * 0.14,

      eyeY,

      this.radius * 0.31

    );


    // --------------------------------------------------------
    // REFLEXOS
    // --------------------------------------------------------

    fill(
      255,
      255,
      255,
      220
    );


    circle(

      eyeX +
      this.radius * 0.20,

      -eyeY -
      this.radius * 0.07,

      this.radius * 0.09

    );


    circle(

      eyeX +
      this.radius * 0.20,

      eyeY -
      this.radius * 0.07,

      this.radius * 0.09

    );


    pop();
  }
}


// ============================================================
// SPAWN DE COMIDA
// ============================================================

function spawnFood() {

  if (
    foods.length >=
    MAX_FOOD
  ) {

    return;
  }


  const margin = 20;


  foods.push(

    new Food(

      random(
        margin,
        width - margin
      ),

      random(
        margin,
        height - margin
      ),

      random(
        0.75,
        1.25
      )

    )

  );
}


// ============================================================
// SPAWN DE COBRA
// ============================================================

function spawnSnake() {

  const margin = 100;


  let snakeX =
    random(
      margin,
      width - margin
    );


  let snakeY =
    random(
      margin,
      height - margin
    );


  // ==========================================================
  // PROCURA LOCAL SEGURO
  // ==========================================================

  for (
    let attempt = 0;
    attempt < 80;
    attempt++
  ) {

    let valid = true;


    for (
      let snake of snakes
    ) {

      if (!snake.alive) {

        continue;
      }


      // ------------------------------------------------------
      // DISTÂNCIA DA CABEÇA
      // ------------------------------------------------------

      let headDistance =
        dist(

          snakeX,
          snakeY,

          snake.pos.x,
          snake.pos.y

        );


      if (
        headDistance < 90
      ) {

        valid = false;

        break;
      }


      // ------------------------------------------------------
      // DISTÂNCIA DO CORPO
      // ------------------------------------------------------

      for (
        let i = 0;
        i < snake.body.length;
        i += 8
      ) {

        let bodyDistance =
          dist(

            snakeX,
            snakeY,

            snake.body[i].x,
            snake.body[i].y

          );


        if (
          bodyDistance < 45
        ) {

          valid = false;

          break;
        }
      }


      if (!valid) {

        break;
      }
    }


    if (valid) {

      break;
    }


    snakeX =
      random(
        margin,
        width - margin
      );


    snakeY =
      random(
        margin,
        height - margin
      );
  }


  let snakeColor =
    random(
      SNAKE_COLORS
    );


  snakes.push(

    new Snake(

      snakeX,
      snakeY,
      snakeColor

    )

  );
}


// ============================================================
// AGENDA RESPAWN
// ============================================================

function scheduleRespawn(
  critical = false
) {

  if (
    respawnQueue.length >= 5
  ) {

    return;
  }


  let timer;


  // ----------------------------------------------------------
  // RECUPERAÇÃO CRÍTICA
  // ----------------------------------------------------------

  if (critical) {

    timer =
      floor(
        random(
          240,
          420
        )
      );

  }

  // ----------------------------------------------------------
  // RESPAWN NORMAL
  // ----------------------------------------------------------

  else {

    timer =
      floor(
        random(
          RESPAWN_TIME_MIN,
          RESPAWN_TIME_MAX
        )
      );
  }


  respawnQueue.push({

    timer: timer

  });
}


// ============================================================
// ATUALIZA RESPAWNS
// ============================================================

function updateRespawns() {

  for (
    let i =
      respawnQueue.length - 1;
    i >= 0;
    i--
  ) {

    respawnQueue[i].timer--;


    if (
      respawnQueue[i].timer <= 0
    ) {

      if (
        snakes.length <
        NORMAL_SNAKE_POPULATION
      ) {

        spawnSnake();
      }


      respawnQueue.splice(
        i,
        1
      );
    }
  }
}


// ============================================================
// ROTAÇÃO SUAVE
// ============================================================

function rotateToward(
  current,
  target,
  maxTurn
) {

  let difference =
    atan2(

      sin(
        target - current
      ),

      cos(
        target - current
      )

    );


  difference =
    constrain(
      difference,
      -maxTurn,
      maxTurn
    );


  return (
    current +
    difference
  );
}


// ============================================================
// FUNDO
// ============================================================

function drawBackground() {

  background(
    15,
    18,
    25
  );


  // ==========================================================
  // GRADE
  // ==========================================================

  stroke(
    70,
    80,
    100,
    18
  );


  strokeWeight(1);


  const gridSize = 40;


  for (
    let x = 0;
    x <= width;
    x += gridSize
  ) {

    line(
      x,
      0,
      x,
      height
    );
  }


  for (
    let y = 0;
    y <= height;
    y += gridSize
  ) {

    line(
      0,
      y,
      width,
      y
    );
  }


  // ==========================================================
  // PONTOS DO FUNDO
  // ==========================================================

  noStroke();


  for (
    let x = 20;
    x < width;
    x += 40
  ) {

    for (
      let y = 20;
      y < height;
      y += 40
    ) {

      fill(
        100,
        115,
        140,
        15
      );


      circle(
        x,
        y,
        2
      );
    }
  }
}


// ============================================================
// VINHETA
// ============================================================

function drawVignette() {

  noFill();


  for (
    let i = 0;
    i < 30;
    i++
  ) {

    stroke(
      0,
      0,
      0,
      3
    );


    strokeWeight(2);


    rect(

      i,
      i,

      width -
      i * 2,

      height -
      i * 2

    );
  }


  stroke(
    100,
    115,
    140,
    35
  );


  strokeWeight(1);


  rect(
    5,
    5,
    width - 10,
    height - 10
  );
}


// ============================================================
// CLIQUE
//
// Cria concentração de comida.
// ============================================================

function mousePressed() {

  if (
    mouseX < 0 ||
    mouseX > width ||
    mouseY < 0 ||
    mouseY > height
  ) {

    return;
  }


  for (
    let i = 0;
    i < 10;
    i++
  ) {

    if (
      foods.length >=
      MAX_FOOD
    ) {

      break;
    }


    let spawnAngle =
      random(TWO_PI);


    let spawnDistance =
      random(
        5,
        28
      );


    let foodX =
      mouseX +
      cos(spawnAngle) *
      spawnDistance;


    let foodY =
      mouseY +
      sin(spawnAngle) *
      spawnDistance;


    foodX =
      constrain(
        foodX,
        10,
        width - 10
      );


    foodY =
      constrain(
        foodY,
        10,
        height - 10
      );


    foods.push(

      new Food(

        foodX,
        foodY,

        random(
          0.8,
          1.3
        )

      )

    );
  }
}


// ============================================================
// CONTROLES
//
// R = reinicia
// F = adiciona comida
// S = adiciona cobra
// ============================================================

function keyPressed() {

  // ==========================================================
  // RESET
  // ==========================================================

  if (
    key === "r" ||
    key === "R"
  ) {

    foods = [];
    snakes = [];
    respawnQueue = [];


    for (
      let i = 0;
      i < INITIAL_FOOD;
      i++
    ) {

      spawnFood();
    }


    for (
      let i = 0;
      i < INITIAL_SNAKES;
      i++
    ) {

      spawnSnake();
    }
  }


  // ==========================================================
  // + COMIDA
  // ==========================================================

  if (
    key === "f" ||
    key === "F"
  ) {

    for (
      let i = 0;
      i < 30;
      i++
    ) {

      spawnFood();
    }
  }


  // ==========================================================
  // + COBRA
  // ==========================================================

  if (
    key === "s" ||
    key === "S"
  ) {

    spawnSnake();
  }
}