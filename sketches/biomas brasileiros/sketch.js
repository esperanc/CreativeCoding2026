let canvasPrincipal;
let cenaAtual = "MAPA";
let controlador3D;
let cenasBiomas = {};

const REGIOES_BIOMAS = [
  {
    id: "amazonia",
    nome: "Amazônia",
    cor: "#2E7D32",
    corHover: "#43A047",
    centroLabel: [215, 175],
    vertices: [
      [60, 210], [80, 120], [160, 60], [250, 40], [330, 65], [370, 120],
      [350, 180], [290, 230], [230, 290], [190, 320], [140, 290], [80, 260]
    ]
  },
  {
    id: "caatinga",
    nome: "Caatinga",
    cor: "#E65100",
    corHover: "#FB8C00",
    centroLabel: [450, 180],
    vertices: [
      [370, 120], [450, 110], [530, 145], [545, 195],
      [505, 240], [440, 250], [380, 240], [350, 180]
    ]
  },
  {
    id: "cerrado",
    nome: "Cerrado",
    cor: "#F9A825",
    corHover: "#FDD835",
    centroLabel: [330, 305],
    vertices: [
      [350, 180], [380, 240], [440, 250], [420, 340],
      [360, 400], [280, 410], [235, 365], [230, 290], [290, 230]
    ]
  },
  {
    id: "pantanal",
    nome: "Pantanal",
    cor: "#0288D1",
    corHover: "#29B6F6",
    centroLabel: [210, 350],
    vertices: [
      [190, 320], [230, 290], [235, 365], [215, 405], [185, 385]
    ]
  },
  {
    id: "mata_atlantica",
    nome: "Mata Atlântica",
    cor: "#00897B",
    corHover: "#26A69A",
    centroLabel: [425, 390],
    vertices: [
      [505, 240], [525, 270], [495, 340], [465, 405], [405, 445],
      [355, 495], [315, 505], [285, 465], [235, 415], [215, 405],
      [235, 365], [280, 410], [360, 400], [420, 340], [440, 250]
    ]
  },
  {
    id: "pampa",
    nome: "Pampa",
    cor: "#7CB342",
    corHover: "#9CCC65",
    centroLabel: [295, 525],
    vertices: [
      [285, 465], [315, 505], [345, 520], [300, 575], [245, 545], [260, 495]
    ]
  }
];

function setup() {
  criarCanvasModo("2D");
  controlador3D = new ControladorPrimeiraPessoa();
  cenasBiomas = {
    amazonia: typeof CenaAmazonia !== "undefined" ? CenaAmazonia : null,
    cerrado: typeof CenaCerrado !== "undefined" ? CenaCerrado : null,
    caatinga: typeof CenaCaatinga !== "undefined" ? CenaCaatinga : null,
    mata_atlantica: typeof CenaMataAtlantica !== "undefined" ? CenaMataAtlantica : null,
    pantanal: typeof CenaPantanal !== "undefined" ? CenaPantanal : null,
    pampa: typeof CenaPampa !== "undefined" ? CenaPampa : null
  };
}

function criarCanvasModo(modo) {
  if (canvasPrincipal) {
    canvasPrincipal.remove();
  }

  if (modo === "WEBGL") {
    canvasPrincipal = createCanvas(windowWidth, windowHeight, WEBGL);
  } else {
    canvasPrincipal = createCanvas(windowWidth, windowHeight);
  }

  // Garante que o canvas receba foco imediato para teclas
  if (canvasPrincipal && canvasPrincipal.elt) {
    canvasPrincipal.elt.setAttribute("tabindex", "0");
    canvasPrincipal.elt.style.outline = "none";
    canvasPrincipal.elt.focus();
  }
}

function draw() {
  if (cenaAtual === "MAPA") {
    desenharMapa2D();
  } else {
    const bioma = cenasBiomas[cenaAtual];
    if (bioma && controlador3D) {
      controlador3D.atualizar();
      controlador3D.aplicarCamera();
      bioma.desenhar();
    }
  }
}

// ==========================================
// ETAPA 1: MAPA 2D INTERATIVO
// ==========================================

function obterTransformacaoMapa() {
  const escala = min(width, height) / 650;
  const offsetX = (width - 600 * escala) / 2;
  const offsetY = (height - 600 * escala) / 2;
  return { escala, offsetX, offsetY };
}

function desenharMapa2D() {
  background("#0f172a");

  const { escala, offsetX, offsetY } = obterTransformacaoMapa();
  const mx = (mouseX - offsetX) / escala;
  const my = (mouseY - offsetY) / escala;

  let biomaEmFoco = null;

  push();
  translate(offsetX, offsetY);
  scale(escala);

  for (const regiao of REGIOES_BIOMAS) {
    const sobre = pontoNoPoligono(mx, my, regiao.vertices);
    if (sobre) biomaEmFoco = regiao;

    fill(sobre ? regiao.corHover : regiao.cor);
    stroke("#0f172a");
    strokeWeight(2.5 / escala);

    beginShape();
    for (const [vx, vy] of regiao.vertices) {
      vertex(vx, vy);
    }
    endShape(CLOSE);

    noStroke();
    fill("#ffffff");
    textAlign(CENTER, CENTER);
    textSize(13 / escala);
    textStyle(BOLD);
    text(regiao.nome, regiao.centroLabel[0], regiao.centroLabel[1]);
  }

  pop();

  desenharLegenda2D(biomaEmFoco);
  cursor(biomaEmFoco ? HAND : ARROW);
}

function desenharLegenda2D(biomaEmFoco) {
  const larguraBox = 190;
  const alturaBox = 28 + REGIOES_BIOMAS.length * 24;
  const x = width - larguraBox - 20;
  const y = height - alturaBox - 20;

  push();
  fill(15, 23, 42, 220);
  stroke(148, 163, 184, 70);
  strokeWeight(1);
  rect(x, y, larguraBox, alturaBox, 10);

  noStroke();
  fill("#94a3b8");
  textAlign(LEFT, TOP);
  textSize(11);
  textStyle(BOLD);
  text("BIOMAS DO BRASIL", x + 14, y + 10);

  REGIOES_BIOMAS.forEach((regiao, i) => {
    const itemY = y + 32 + i * 24;
    const ativo = biomaEmFoco && biomaEmFoco.id === regiao.id;

    fill(ativo ? regiao.corHover : regiao.cor);
    rect(x + 14, itemY, 14, 14, 4);

    fill(ativo ? "#ffffff" : "#e2e8f0");
    textSize(12);
    textStyle(ativo ? BOLD : NORMAL);
    text(regiao.nome, x + 36, itemY + 1);
  });
  pop();
}

function mousePressed() {
  if (cenaAtual === "MAPA") {
    const { escala, offsetX, offsetY } = obterTransformacaoMapa();
    const mx = (mouseX - offsetX) / escala;
    const my = (mouseY - offsetY) / escala;

    for (const regiao of REGIOES_BIOMAS) {
      if (pontoNoPoligono(mx, my, regiao.vertices)) {
        entrarNoBioma(regiao);
        break;
      }
    }
  } else if (canvasPrincipal && canvasPrincipal.elt) {
    canvasPrincipal.elt.focus();
    if (canvasPrincipal.elt.requestPointerLock) {
      try {
        const promessa = canvasPrincipal.elt.requestPointerLock();
        if (promessa && typeof promessa.catch === "function") {
          promessa.catch(() => {});
        }
      } catch (e) {}
    }
  }
}

function entrarNoBioma(regiao) {
  const bioma = cenasBiomas[regiao.id];
  if (!bioma) {
    console.error(`Cena "${regiao.id}" não encontrada.`);
    return;
  }

  cenaAtual = regiao.id;
  criarCanvasModo("WEBGL");

  if (!controlador3D) {
    controlador3D = new ControladorPrimeiraPessoa();
  }
  controlador3D.resetar();

  if (bioma.iniciar) {
    bioma.iniciar();
  }

  document.getElementById("hud-titulo").innerText = `Bioma: ${regiao.nome}`;
  document.getElementById("hud-desc").innerText =
    "WASD / Setas: andar | Shift: correr | Espaço: pular | Clique ou arraste o Mouse: olhar | M: mapa";
  document.getElementById("btn-voltar").style.display = "inline-block";
  cursor(ARROW);
}

function voltarParaMapa() {
  cenaAtual = "MAPA";

  if (document.pointerLockElement) {
    document.exitPointerLock();
  }

  if (controlador3D) {
    controlador3D.limparTeclas();
  }

  criarCanvasModo("2D");

  document.getElementById("hud-titulo").innerText = "Mapa dos Biomas do Brasil";
  document.getElementById("hud-desc").innerText =
    "Clique em uma região colorida para explorar o bioma em 3D.";
  document.getElementById("btn-voltar").style.display = "none";
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function pontoNoPoligono(px, py, vertices) {
  let dentro = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i][0], yi = vertices[i][1];
    const xj = vertices[j][0], yj = vertices[j][1];
    const intersecta =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersecta) dentro = !dentro;
  }
  return dentro;
}

// ==========================================
// CONTROLADOR 3D EM PRIMEIRA PESSOA
// ==========================================

class ControladorPrimeiraPessoa {
  constructor() {
    this.velocidadeBase = 8;
    this.sensibilidade = 0.003;
    this.alturaOlhos = -70;
    this.gravidade = 0.6;
    this.teclas = new Set();
    this.ultimoMouseX = null;
    this.ultimoMouseY = null;

    this.resetar();
    this.registrarEventosNativos();
  }

  registrarEventosNativos() {
    window.addEventListener("keydown", (e) => {
      if (cenaAtual === "MAPA") return;

      if (e.code === "KeyM") {
        voltarParaMapa();
        return;
      }

      this.teclas.add(e.code);

      // Pulo com Espaço se estiver no chão
      if (e.code === "Space" && this.noChao) {
        this.velY = -11;
        this.noChao = false;
      }
    });

    window.addEventListener("keyup", (e) => {
      this.teclas.delete(e.code);
    });

    window.addEventListener("blur", () => {
      this.limparTeclas();
    });

    window.addEventListener("mousemove", (e) => {
      if (cenaAtual === "MAPA") return;

      const travaAtiva =
        canvasPrincipal && document.pointerLockElement === canvasPrincipal.elt;
      const arrastando = e.buttons === 1;

      if (travaAtiva || arrastando) {
        const dx =
          typeof e.movementX === "number"
            ? e.movementX
            : this.ultimoMouseX !== null
              ? e.clientX - this.ultimoMouseX
              : 0;
        const dy =
          typeof e.movementY === "number"
            ? e.movementY
            : this.ultimoMouseY !== null
              ? e.clientY - this.ultimoMouseY
              : 0;

        this.yaw += dx * this.sensibilidade;
        this.pitch -= dy * this.sensibilidade;
        this.pitch = constrain(this.pitch, -1.4, 1.4);
      }

      this.ultimoMouseX = e.clientX;
      this.ultimoMouseY = e.clientY;
    });
  }

  limparTeclas() {
    this.teclas.clear();
  }

  resetar() {
    this.pos = createVector(0, this.alturaOlhos, 380);
    this.yaw = -HALF_PI;
    this.pitch = 0;
    this.velY = 0;
    this.noChao = true;
    this.limparTeclas();
  }

  atualizar() {
    const correndo =
      this.teclas.has("ShiftLeft") || this.teclas.has("ShiftRight");
    const vel = correndo ? this.velocidadeBase * 1.8 : this.velocidadeBase;

    const frenteX = cos(this.yaw);
    const frenteZ = sin(this.yaw);
    const direitaX = -sin(this.yaw);
    const direitaZ = cos(this.yaw);

    let moveX = 0;
    let moveZ = 0;

    if (this.teclas.has("KeyW") || this.teclas.has("ArrowUp")) {
      moveX += frenteX;
      moveZ += frenteZ;
    }
    if (this.teclas.has("KeyS") || this.teclas.has("ArrowDown")) {
      moveX -= frenteX;
      moveZ -= frenteZ;
    }
    if (this.teclas.has("KeyD") || this.teclas.has("ArrowRight")) {
      moveX += direitaX;
      moveZ += direitaZ;
    }
    if (this.teclas.has("KeyA") || this.teclas.has("ArrowLeft")) {
      moveX -= direitaX;
      moveZ -= direitaZ;
    }

    // Normaliza movimento diagonal para manter velocidade constante
    const mag = hypot(moveX, moveZ);
    if (mag > 0) {
      this.pos.x += (moveX / mag) * vel;
      this.pos.z += (moveZ / mag) * vel;
    }

    // Limita a área caminhável dentro do terreno do bioma
    this.pos.x = constrain(this.pos.x, -1150, 1150);
    this.pos.z = constrain(this.pos.z, -1150, 1150);

    // Física vertical (pulo e gravidade)
    this.velY += this.gravidade;
    this.pos.y += this.velY;

    if (this.pos.y >= this.alturaOlhos) {
      this.pos.y = this.alturaOlhos;
      this.velY = 0;
      this.noChao = true;
    }
  }

  aplicarCamera() {
    const dirX = cos(this.yaw) * cos(this.pitch);
    const dirY = -sin(this.pitch);
    const dirZ = sin(this.yaw) * cos(this.pitch);

    camera(
      this.pos.x,
      this.pos.y,
      this.pos.z,
      this.pos.x + dirX,
      this.pos.y + dirY,
      this.pos.z + dirZ,
      0,
      1,
      0
    );
  }
}

function hypot(a, b) {
  return Math.sqrt(a * a + b * b);
}