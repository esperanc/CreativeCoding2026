// Arqueologia do Cursor
// Arthur Ramos - Artefato da Semana 10
//
// Um gesto 2D é transformado em uma malha 3D fechada. O código cria
// diretamente os vértices, as faces triangulares, as coordenadas UV e
// as normais de um p5.Geometry. Nenhum modelo externo é carregado.

let escultura;
let pontosDoGesto = [];
let pontosDaTela = [];
let desenhando = false;
let modo = "visualizar";
let mostrarMalha = false;
let giroAutomatico = true;
let pausado = false;
let tempo = 0;
let semente = 1001;
let indicePaleta = 0;

const PROFUNDIDADE = 24;
const MAX_PONTOS = 150;
const COR_LARANJA = [255, 100, 0];

const PALETAS = [
  { corpo: [205, 91, 54], brilho: [255, 183, 126], fundo: [9, 11, 13] },
  { corpo: [68, 126, 146], brilho: [150, 221, 224], fundo: [7, 12, 15] },
  { corpo: [139, 103, 166], brilho: [222, 172, 232], fundo: [11, 9, 14] },
  { corpo: [153, 132, 60], brilho: [238, 214, 126], fundo: [12, 12, 8] }
];

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  canvas.parent("sketch-holder");
  pixelDensity(min(2, window.devicePixelRatio || 1));
  frameRate(60);
  configurarCamera();

  pontosDoGesto = gerarGestoSintetico(semente);
  construirEscultura(pontosDoGesto);

  const botao = document.getElementById("draw-button");
  botao.addEventListener("click", () => {
    if (modo === "desenhar") cancelarDesenho();
    else iniciarDesenho();
  });
}

function draw() {
  const paleta = PALETAS[indicePaleta];
  background(paleta.fundo[0], paleta.fundo[1], paleta.fundo[2]);

  if (!pausado) tempo += min(deltaTime, 40) / 1000;

  if (modo === "visualizar") {
    orbitControl(1.05, 1.05, 0.75);
  }

  // Uma luz ambiente forte garante que a malha nunca desapareça no fundo.
  ambientLight(125, 118, 108);
  directionalLight(255, 232, 210, -0.25, 0.35, -1);

  // Esta luz funciona como um refletor próximo à câmera.
  pointLight(255, 244, 226, 0, -40, 480);
  pointLight(paleta.brilho[0], paleta.brilho[1], paleta.brilho[2], 230, -170, 260);
  pointLight(90, 116, 153, -280, 130, 180);

  const escalaCena = constrain(min(width, height) / 760, 0.58, 1.25);
  scale(escalaCena);

  desenharSalaDeExame();

  push();
  rotateX(-0.12);
  if (giroAutomatico && !pausado) rotateY(tempo * 0.085);
  else rotateY(0.42);

  if (escultura) {
    desenharEsculturaLaranja(escultura);
  }
  pop();
}

function configurarCamera() {
  perspective(PI / 3.2, width / height, 0.1, 5000);
  camera(0, 0, 690, 0, 0, 0, 0, 1, 0);
}

// Cria um gesto inicial que lembra uma assinatura, sem formar uma letra específica.
function gerarGestoSintetico(valorSemente) {
  randomSeed(valorSemente);

  const controles = [
    createVector(-235, 72),
    createVector(-218, 20),
    createVector(-170, -72),
    createVector(-105, 38),
    createVector(-35, 92),
    createVector(18, -88),
    createVector(84, -35),
    createVector(72, 67),
    createVector(151, 43),
    createVector(226, -55),
    createVector(252, -14)
  ];

  for (let i = 1; i < controles.length - 1; i++) {
    controles[i].x += random(-22, 22);
    controles[i].y += random(-26, 26);
  }

  const resultado = [];
  const amostrasPorTrecho = 16;

  for (let trecho = 0; trecho < controles.length - 3; trecho++) {
    for (let j = 0; j < amostrasPorTrecho; j++) {
      const t = j / amostrasPorTrecho;
      const x = splinePoint(
        controles[trecho].x,
        controles[trecho + 1].x,
        controles[trecho + 2].x,
        controles[trecho + 3].x,
        t
      );
      const y = splinePoint(
        controles[trecho].y,
        controles[trecho + 1].y,
        controles[trecho + 2].y,
        controles[trecho + 3].y,
        t
      );
      const progresso = resultado.length / ((controles.length - 3) * amostrasPorTrecho);
      const largura = 12 + 7 * pow(sin(progresso * PI), 2) + 2.5 * sin(progresso * PI * 7);
      const z = map(largura, 7, 22, -30, 25) + 5 * sin(progresso * PI * 5);
      resultado.push({ x, y, z, largura: constrain(largura, 8, 22) });
    }
  }

  return resultado;
}

// Constrói uma fita extrudada: quatro vértices por ponto do gesto.
// Cada trecho recebe frente, verso e duas paredes laterais trianguladas.
function construirEscultura(pontos) {
  if (!pontos || pontos.length < 2) return;

  if (escultura) {
    try {
      freeGeometry(escultura);
    } catch (erro) {
      console.warn("A geometria anterior ainda não estava na memória da GPU.", erro);
    }
  }

  const g = new p5.Geometry();

  for (let i = 0; i < pontos.length; i++) {
    const anterior = pontos[max(0, i - 1)];
    const seguinte = pontos[min(pontos.length - 1, i + 1)];
    const tangente = createVector(seguinte.x - anterior.x, seguinte.y - anterior.y, 0);

    if (tangente.magSq() < 0.0001) tangente.set(1, 0, 0);
    tangente.normalize();

    const normal2D = createVector(-tangente.y, tangente.x, 0);
    const metade = pontos[i].largura / 2;
    const esquerdaX = pontos[i].x + normal2D.x * metade;
    const esquerdaY = pontos[i].y + normal2D.y * metade;
    const direitaX = pontos[i].x - normal2D.x * metade;
    const direitaY = pontos[i].y - normal2D.y * metade;
    const frenteZ = pontos[i].z + PROFUNDIDADE / 2;
    const trasZ = pontos[i].z - PROFUNDIDADE / 2;

    // Ordem por ponto: esquerda frente, direita frente, esquerda trás, direita trás.
    g.vertices.push(
      createVector(esquerdaX, esquerdaY, frenteZ),
      createVector(direitaX, direitaY, frenteZ),
      createVector(esquerdaX, esquerdaY, trasZ),
      createVector(direitaX, direitaY, trasZ)
    );

    const u = i / (pontos.length - 1);
    g.uvs.push(u, 0, u, 1, u, 0, u, 1);
  }

  for (let i = 0; i < pontos.length - 1; i++) {
    const k = i * 4;
    const n = (i + 1) * 4;

    // Frente, normal apontando para +z.
    g.faces.push([k, k + 1, n], [k + 1, n + 1, n]);

    // Verso, com a ordem invertida.
    g.faces.push([k + 2, n + 2, k + 3], [k + 3, n + 2, n + 3]);

    // Parede esquerda.
    g.faces.push([k, n, k + 2], [k + 2, n, n + 2]);

    // Parede direita.
    g.faces.push([k + 1, k + 3, n + 1], [k + 3, n + 3, n + 1]);
  }

  // Tampas que fecham o começo e o fim do gesto.
  const ultimo = (pontos.length - 1) * 4;
  g.faces.push([0, 2, 1], [1, 2, 3]);
  g.faces.push([ultimo, ultimo + 1, ultimo + 2], [ultimo + 1, ultimo + 3, ultimo + 2]);

  // FLAT mantém as quinas da extrusão visíveis, como num fragmento arqueológico.
  g.computeNormals(FLAT);
  escultura = g;
  pontosDoGesto = pontos;
  atualizarDados();
}

// Desenha os triângulos da própria p5.Geometry em modo imediato.
// Isso evita depender do cache de model() para mostrar a malha. As luzes são
// desligadas apenas neste momento, então o laranja não pode virar preto por
// causa do ângulo das normais. A geometria continua sendo usada para exportar.
function desenharEsculturaLaranja(g) {
  noLights();
  noStroke();
  fill(COR_LARANJA[0], COR_LARANJA[1], COR_LARANJA[2]);
  emissiveMaterial(COR_LARANJA[0], COR_LARANJA[1], COR_LARANJA[2]);

  beginShape(TRIANGLES);
  for (const face of g.faces) {
    for (const indice of face) {
      const n = g.vertexNormals[indice];
      const v = g.vertices[indice];
      if (n) normal(n.x, n.y, n.z);
      vertex(v.x, v.y, v.z);
    }
  }
  endShape();

  // Linha central mais clara: mesmo durante a rotação, o gesto permanece
  // imediatamente reconhecível sobre o fundo escuro.
  noFill();
  stroke(255, 185, 70, 235);
  strokeWeight(2.4);
  beginShape();
  for (const p of pontosDoGesto) {
    vertex(p.x, p.y, p.z + PROFUNDIDADE / 2 + 1.2);
  }
  endShape();

  // A tecla M revela todos os triângulos que formam o objeto.
  if (mostrarMalha) {
    stroke(255, 225, 170, 180);
    strokeWeight(0.7);
    beginShape(LINES);
    for (const face of g.faces) {
      for (let i = 0; i < 3; i++) {
        const a = g.vertices[face[i]];
        const b = g.vertices[face[(i + 1) % 3]];
        vertex(a.x, a.y, a.z + 0.8);
        vertex(b.x, b.y, b.z + 0.8);
      }
    }
    endShape();
  }

  noStroke();
}

function desenharSalaDeExame() {
  push();
  noFill();
  stroke(194, 158, 117, 34);
  strokeWeight(1);

  // Uma caixa de medição enquadra o objeto sem virar parte da escultura.
  const x = 285;
  const y = 190;
  const z = 95;
  line(-x, -y, -z, x, -y, -z);
  line(-x, y, -z, x, y, -z);
  line(-x, -y, z, x, -y, z);
  line(-x, y, z, x, y, z);
  line(-x, -y, -z, -x, y, -z);
  line(x, -y, -z, x, y, -z);
  line(-x, -y, z, -x, y, z);
  line(x, -y, z, x, y, z);
  line(-x, -y, -z, -x, -y, z);
  line(x, -y, -z, x, -y, z);
  line(-x, y, -z, -x, y, z);
  line(x, y, -z, x, y, z);

  // Marcas de escala, como numa mesa de catalogação.
  for (let i = -240; i <= 240; i += 40) {
    line(i, y + 9, -z, i, y - 9, -z);
  }
  noStroke();
  pop();

  push();
  translate(0, 242, -45);
  specularMaterial(25, 28, 29);
  shininess(22);
  box(610, 18, 190);
  pop();
}

function iniciarDesenho() {
  modo = "desenhar";
  desenhando = false;
  pontosDaTela = [];
  document.body.classList.add("drawing");
  document.getElementById("gesture-line").setAttribute("points", "");
  document.getElementById("draw-button").textContent = "CANCELAR DESENHO";
  document.getElementById("mode-label").textContent = "ARRASTE PARA REGISTRAR UM GESTO";
}

function cancelarDesenho() {
  modo = "visualizar";
  desenhando = false;
  pontosDaTela = [];
  document.body.classList.remove("drawing");
  document.getElementById("gesture-line").setAttribute("points", "");
  document.getElementById("draw-button").textContent = "DESENHAR NOVO GESTO";
  document.getElementById("mode-label").textContent = "OBJETO EM EXAME";
}

function mousePressed() {
  if (modo !== "desenhar" || !mouseDentroDoCanvas()) return;
  desenhando = true;
  pontosDaTela = [{ x: mouseX, y: mouseY }];
  atualizarLinhaDoGesto();
}

function mouseDragged() {
  if (modo !== "desenhar" || !desenhando || !mouseDentroDoCanvas()) return;
  const ultimo = pontosDaTela[pontosDaTela.length - 1];
  if (dist(mouseX, mouseY, ultimo.x, ultimo.y) >= 4) {
    pontosDaTela.push({ x: mouseX, y: mouseY });
    atualizarLinhaDoGesto();
  }
  return false;
}

function mouseReleased() {
  if (modo !== "desenhar" || !desenhando) return;
  desenhando = false;

  if (pontosDaTela.length >= 8) {
    const novoGesto = converterGestoDaTela(pontosDaTela);
    semente++;
    indicePaleta = (indicePaleta + 1) % PALETAS.length;
    construirEscultura(novoGesto);
    cancelarDesenho();
  } else {
    pontosDaTela = [];
    atualizarLinhaDoGesto();
    document.getElementById("mode-label").textContent = "GESTO CURTO: TENTE NOVAMENTE";
  }
}

function atualizarLinhaDoGesto() {
  const texto = pontosDaTela.map((p) => `${p.x},${p.y}`).join(" ");
  document.getElementById("gesture-line").setAttribute("points", texto);
}

function converterGestoDaTela(entrada) {
  let filtrados = entrada.slice();

  if (filtrados.length > MAX_PONTOS) {
    const reduzidos = [];
    for (let i = 0; i < MAX_PONTOS; i++) {
      const indice = floor(map(i, 0, MAX_PONTOS - 1, 0, filtrados.length - 1));
      reduzidos.push(filtrados[indice]);
    }
    filtrados = reduzidos;
  }

  // Duas passagens de média móvel retiram pequenos tremores do mouse.
  for (let passagem = 0; passagem < 2; passagem++) {
    filtrados = filtrados.map((p, i, lista) => {
      if (i === 0 || i === lista.length - 1) return { ...p };
      return {
        x: (lista[i - 1].x + p.x * 2 + lista[i + 1].x) / 4,
        y: (lista[i - 1].y + p.y * 2 + lista[i + 1].y) / 4
      };
    });
  }

  const xs = filtrados.map((p) => p.x);
  const ys = filtrados.map((p) => p.y);
  const minX = min(xs);
  const maxX = max(xs);
  const minY = min(ys);
  const maxY = max(ys);
  const centroX = (minX + maxX) / 2;
  const centroY = (minY + maxY) / 2;
  const escala = min(470 / max(1, maxX - minX), 310 / max(1, maxY - minY));

  return filtrados.map((p, i) => {
    const anterior = filtrados[max(0, i - 1)];
    const velocidade = dist(p.x, p.y, anterior.x, anterior.y);
    const largura = constrain(map(velocidade, 2, 28, 20, 8), 8, 21);
    const progresso = i / max(1, filtrados.length - 1);
    const z = map(largura, 8, 21, -29, 27) + 4 * sin(progresso * PI * 6);

    return {
      x: (p.x - centroX) * escala,
      y: (p.y - centroY) * escala,
      z,
      largura
    };
  });
}

function gerarOutroGesto() {
  semente++;
  indicePaleta = (indicePaleta + 1) % PALETAS.length;
  pontosDoGesto = gerarGestoSintetico(semente);
  construirEscultura(pontosDoGesto);
}

function atualizarDados() {
  document.getElementById("seed-number").textContent = String(semente).padStart(4, "0");
  document.getElementById("vertex-count").textContent = escultura.vertices.length;
  document.getElementById("face-count").textContent = escultura.faces.length;
}

function mouseDentroDoCanvas() {
  return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
}

function keyPressed() {
  if (key === "d" || key === "D") {
    if (modo === "desenhar") cancelarDesenho();
    else iniciarDesenho();
  }

  if ((key === "r" || key === "R") && modo === "visualizar") gerarOutroGesto();
  if (key === "m" || key === "M") mostrarMalha = !mostrarMalha;
  if (key === "a" || key === "A") giroAutomatico = !giroAutomatico;
  if (key === " ") pausado = !pausado;

  if ((key === "o" || key === "O") && escultura) {
    escultura.saveObj("arqueologia-do-cursor.obj");
  }

  if ((key === "t" || key === "T") && escultura) {
    escultura.saveStl("arqueologia-do-cursor.stl");
  }

  if (key === "s" || key === "S") {
    saveCanvas("arqueologia-do-cursor", "png");
  }

  if (keyCode === ESCAPE && modo === "desenhar") cancelarDesenho();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  configurarCamera();
}
