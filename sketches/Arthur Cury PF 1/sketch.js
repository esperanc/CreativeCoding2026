/**
 * Projeto Final - Parte 1: Autômato Celular Orgânico
 * Simulação de colônias bioluminescentes com envelhecimento celular e rastro de energia.
 */

let cols;
let rows;
let resolution = 10; // Tamanho de cada célula em pixels
let grid;
let nextGrid;

function setup() {
  createCanvas(600, 600);
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();
  frameRate(20); // Velocidade controlada para melhor observação da evolução

  cols = floor(width / resolution);
  rows = floor(height / resolution);

  grid = create2DArray(cols, rows);
  nextGrid = create2DArray(cols, rows);

  initGrid();
}

function draw() {
  background(240, 60, 8, 100); // Fundo escuro azul-noturno

  // Permite ao usuário desenhar novas células clicando/arrastando o mouse
  handleMouseInput();

  // Renderiza o estado atual e calcula a próxima geração
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let cell = grid[i][j];

      // Desenha a célula se estiver viva ou se ainda tiver energia residual (rastro)
      if (cell.state === 1 || cell.energy > 0.05) {
        drawCell(i, j, cell);
      }

      // Aplica as regras de transição para a próxima geração
      computeNextGeneration(i, j);
    }
  }

  // Atualiza a grade principal com os valores calculados
  swapGrids();
}

// Cria uma matriz 2D inicializada com objetos de célula
function create2DArray(c, r) {
  let arr = new Array(c);
  for (let i = 0; i < c; i++) {
    arr[i] = new Array(r);
    for (let j = 0; j < r; j++) {
      arr[i][j] = {
        state: 0,   // 0 = morta, 1 = viva
        age: 0,     // Tempo de vida contínuo da célula
        energy: 0   // Energia residual para suavização visual (rastro)
      };
    }
  }
  return arr;
}

// Inicializa a grade usando Perlin Noise para criar aglomerados mais naturais
function initGrid() {
  noiseSeed(millis());
  let noiseScale = 0.15;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let n = noise(i * noiseScale, j * noiseScale);
      if (n > 0.52 && random(1) < 0.6) {
        grid[i][j].state = 1;
        grid[i][j].age = 1;
        grid[i][j].energy = 1.0;
      } else {
        grid[i][j].state = 0;
        grid[i][j].age = 0;
        grid[i][j].energy = 0;
      }
    }
  }
}

// Desenha cada célula com base na sua idade e energia
function drawCell(i, j, cell) {
  let x = i * resolution;
  let y = j * resolution;

  // Mapeia a idade da célula para o matiz (Hue): nasce ciano (170) e envelhece até magenta/roxo (310)
  let hueVal = map(constrain(cell.age, 1, 50), 1, 50, 170, 310);
  let satVal = cell.state === 1 ? 85 : 60;
  let briVal = map(cell.energy, 0, 1, 10, 100);

  fill(hueVal, satVal, briVal);

  // Células vivas são ligeiramente maiores e arredondadas; rastros são menores
  let sizeMod = map(cell.energy, 0, 1, resolution * 0.3, resolution * 0.9);
  let offset = (resolution - sizeMod) * 0.5;
  
  rect(x + offset, y + offset, sizeMod, sizeMod, 3);
}

// Calcula o próximo estado da célula (i, j)
function computeNextGeneration(i, j) {
  let current = grid[i][j];
  let neighbors = countAliveNeighbors(i, j);

  let nextState = current.state;
  let nextAge = current.age;
  let nextEnergy = current.energy;

  if (current.state === 0 && neighbors === 3) {
    // Reprodução: célula nasce
    nextState = 1;
    nextAge = 1;
    nextEnergy = 1.0;
  } else if (current.state === 1 && (neighbors < 2 || neighbors > 3)) {
    // Solidão ou Superpopulação: célula morre, mas mantém energia que decai aos poucos
    nextState = 0;
    nextEnergy = current.energy * 0.82;
  } else if (current.state === 1) {
    // Sobrevivência: célula envelhece e mantém energia máxima
    nextState = 1;
    nextAge = current.age + 1;
    nextEnergy = 1.0;
  } else {
    // Continua morta: decaimento gradual do rastro energético e da idade residual
    nextState = 0;
    nextEnergy = current.energy * 0.82;
    if (nextEnergy < 0.05) {
      nextEnergy = 0;
      nextAge = 0;
    }
  }

  // Decaimento espontâneo por velhice extrema (evita estruturas eternamente estáticas)
  if (nextAge > 120 && random(1) < 0.05) {
    nextState = 0;
  }

  nextGrid[i][j].state = nextState;
  nextGrid[i][j].age = nextAge;
  nextGrid[i][j].energy = nextEnergy;
}

// Conta vizinhos vivos usando bordas toroidais (wrap-around)
function countAliveNeighbors(x, y) {
  let sum = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      let col = (x + i + cols) % cols;
      let row = (y + j + rows) % rows;
      sum += grid[col][row].state;
    }
  }
  return sum;
}

// Transfere os dados de nextGrid para grid sem realocar memória desnecessariamente
function swapGrids() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].state = nextGrid[i][j].state;
      grid[i][j].age = nextGrid[i][j].age;
      grid[i][j].energy = nextGrid[i][j].energy;
    }
  }
}

// Interação com o mouse: permite "pintar" vida na grade
function handleMouseInput() {
  if (mouseIsPressed && mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
    let mx = floor(mouseX / resolution);
    let my = floor(mouseY / resolution);

    // Ativa uma pequena vizinhança 3x3 ao redor do cursor
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        let col = (mx + i + cols) % cols;
        let row = (my + j + rows) % rows;
        if (random(1) < 0.75) {
          grid[col][row].state = 1;
          grid[col][row].age = 1;
          grid[col][row].energy = 1.0;
        }
      }
    }
  }
}

// Reinicia a simulação ao pressionar a tecla 'R' ou 'r'
function keyPressed() {
  if (key === 'r' || key === 'R') {
    initGrid();
  }
}