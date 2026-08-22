let controleGaia;
let rotuloGaia;
let nivelAtual = 1;
let velocidadeNivel = 0;
let aberturaAtual = 1;
let velocidadeAbertura = 0;
let ondaAtual = 0;
let sementeCena;

function setup() {
  createCanvas(windowWidth, windowHeight);
  sementeCena = floor(Math.random() * 99999999);
  controleGaia = createSlider(55, 155, 100, 1);
  controleGaia.position(20, 42);
  controleGaia.style("width", "220px");
  rotuloGaia = createP("Pulso da paisagem");
  rotuloGaia.position(20, 4);
  rotuloGaia.style("color", "#fff4c7");
  rotuloGaia.style("font-family", "Georgia, serif");
  rotuloGaia.style("font-size", "16px");
  rotuloGaia.style("margin", "0");
}

function draw() {
  randomSeed(sementeCena);
  atualiza();
  ceu();
  terra();
  let escalaTela = min(width, height);
  let baseGaiaY = height * 0.82;
  gaia(baseGaiaY, escalaTela);
  frente(escalaTela);
}

function atualiza() {
  velocidadeNivel =
    (velocidadeNivel +
      (controleGaia.value() / 100 - nivelAtual) * 0.032) *
    0.66;
  nivelAtual += velocidadeNivel;

  velocidadeAbertura =
    (velocidadeAbertura +
      (1 / sqrt(nivelAtual) - aberturaAtual) * 0.025) *
    0.68;
  aberturaAtual += velocidadeAbertura;

  ondaAtual +=
    (constrain(velocidadeNivel * 0.6, -0.018, 0.018) -
      ondaAtual) *
    0.14;
}

function ceu() {
  let corCeu1 = color(random(5, 20), random(20, 45), random(65, 105));
  let corCeu2 = color(random(45, 80), random(95, 145), random(145, 200));
  noStroke();
  let totalFaixas = 70;
  let alturaFaixa = height / totalFaixas;

  for (let faixaCeu = 0; faixaCeu < totalFaixas; faixaCeu++) {
    let misturaCeu = faixaCeu / (totalFaixas - 1);
    fill(lerpColor(corCeu1, corCeu2, misturaCeu));
    rect(0, faixaCeu * alturaFaixa, width, alturaFaixa + 2);
  }

  let quantidadeEstrelas = floor(random(35, 75));

  for (let estrelaId = 0; estrelaId < quantidadeEstrelas; estrelaId++) {
    let estrelaX = random(width);
    let estrelaY = random(height * 0.55);
    let tamanhoEstrela = random(1.5, 5.5);
    fill(255, random(205, 255), random(100, 190), random(130, 245));
    circle(estrelaX, estrelaY, tamanhoEstrela);
  }

  let luaX = random(width * 0.12, width * 0.88);
  let luaY = random(height * 0.08, height * 0.25);
  let tamanhoLua = min(width, height) * random(0.045, 0.075);
  fill(255, 235, 170, 45);
  circle(luaX, luaY, tamanhoLua * 1.8);
  fill(255, 239, 178, 220);
  circle(luaX, luaY, tamanhoLua);
}

function terra() {
  let inicioTerraY = height * 0.61;
  noStroke();
  fill(64, 98, 69);
  rect(0, inicioTerraY, width, height - inicioTerraY);

  fill(72, 108, 76);
  ellipse(width * 0.08, inicioTerraY, width * 0.62, height * 0.2);
  ellipse(width * 0.48, inicioTerraY, width * 0.58, height * 0.14);
  ellipse(width * 0.9, inicioTerraY, width * 0.55, height * 0.22);
}

function gaia(baseGaiaY, escalaTela) {
  let alturaGaia = escalaTela * 0.34 * nivelAtual;
  let centroGaiaX = width * 0.5;
  let distanciaMorros = escalaTela * 0.28 * aberturaAtual;
  let alturaEsquerda = alturaGaia * (0.68 + ondaAtual * 0.5);
  let alturaCentro = alturaGaia * (1 - ondaAtual * 0.25);
  let alturaDireita = alturaGaia * (0.59 - ondaAtual * 0.4);
  let larguraEsquerda = escalaTela * 0.48 * aberturaAtual;
  let larguraCentro = escalaTela * 0.55 * aberturaAtual;
  let larguraDireita = escalaTela * 0.44 * aberturaAtual;

  morro(
    centroGaiaX - distanciaMorros,
    baseGaiaY,
    larguraEsquerda,
    alturaEsquerda,
    0,
    escalaTela
  );

  morro(
    centroGaiaX + distanciaMorros,
    baseGaiaY,
    larguraDireita,
    alturaDireita,
    12,
    escalaTela
  );

  morro(
    centroGaiaX,
    baseGaiaY,
    larguraCentro,
    alturaCentro,
    6,
    escalaTela
  );

  noStroke();
  fill(27, 61, 47);
  rect(0, baseGaiaY, width, height - baseGaiaY);
}

function morro(centroMorroX, baseMorroY, larguraMorro, alturaMorro, tomMorro, escalaTela) {
  let centroMorroY = baseMorroY - alturaMorro * 0.38;
  let corpoMorroH = alturaMorro * 1.24;

  noStroke();
  fill(27 + tomMorro, 61 + tomMorro, 47 + tomMorro * 0.4);
  ellipse(centroMorroX, centroMorroY, larguraMorro, corpoMorroH);

  fill(106, 139, 75, 34);
  ellipse(
    centroMorroX - larguraMorro * 0.07,
    centroMorroY - corpoMorroH * 0.1,
    larguraMorro * 0.7,
    corpoMorroH * 0.62
  );

  noFill();
  strokeWeight(max(1, escalaTela * 0.0022));

  for (let arcoId = 1; arcoId <= 6; arcoId++) {
    let parteArco = arcoId / 7;
    stroke(166, 184, 101, 38 + arcoId * 8);
    arc(
      centroMorroX,
      centroMorroY + corpoMorroH * parteArco * 0.19,
      larguraMorro * (1 - parteArco * 0.18),
      corpoMorroH * (1 - parteArco * 0.2),
      PI,
      TWO_PI
    );
  }

  noStroke();

  for (let marcaId = 0; marcaId < 13; marcaId++) {
    let anguloMarca = random(PI, TWO_PI);
    let alcanceMarca = sqrt(random()) * 0.42;
    let marcaX =
      centroMorroX + cos(anguloMarca) * larguraMorro * alcanceMarca;
    let marcaY =
      centroMorroY + sin(anguloMarca) * corpoMorroH * alcanceMarca;
    let tamanhoMarca = escalaTela * random(0.003, 0.009);
    fill(137, 162, 84, random(45, 100));
    circle(marcaX, marcaY, tamanhoMarca);
  }
}

function frente(escalaTela) {
  noStroke();
  fill(48, 78, 53, 180);
  ellipse(width * 0.5, height * 1.01, width * 1.35, height * 0.28);
  rect(0, height * 0.95, width, height * 0.05);

  stroke(130, 154, 89, 58);
  strokeWeight(max(1, escalaTela * 0.002));

  for (let trilhaId = 0; trilhaId < 5; trilhaId++) {
    let afastamentoTrilha = escalaTela * (0.08 + trilhaId * 0.07);
    line(
      width * 0.5 - afastamentoTrilha,
      height,
      width * 0.5 - afastamentoTrilha * 1.7,
      height * 0.88
    );
    line(
      width * 0.5 + afastamentoTrilha,
      height,
      width * 0.5 + afastamentoTrilha * 1.7,
      height * 0.88
    );
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
