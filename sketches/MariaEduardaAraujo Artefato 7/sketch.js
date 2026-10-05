/**
 * Artefato 7: Oceano Topográfico Tipográfico
 * 
 * Este sketch foge do cliché de "escrever palavras". Aqui, usamos caracteres 
 * de texto como "píxeis" baseados no seu peso visual (densidade).
 * Uma string vai dos caracteres mais vazios (' ') aos mais densos ('@').
 */

// String de caracteres ordenada do mais leve (espaço) ao mais pesado visualmente
const caracteresDensidade = " .:-=+*#%@";
let tamanhoFonte = 16;

function setup() {
  // Responsividade ativada
  createCanvas(windowWidth, windowHeight);
  
  // Usamos 'monospace' para que todas as letras ocupem a mesma largura,
  // mantendo a nossa grade perfeitamente alinhada sem precisar de ficheiros de fonte externos.
  textFont("monospace");
  textAlign(CENTER, CENTER);
}

function draw() {
  // Fundo num tom azul noturno muito escuro
  background(5, 10, 25);
  
  // Calcula quantas colunas e linhas cabem no ecrã com base no tamanho da fonte
  let colunas = floor(width / tamanhoFonte);
  let linhas = floor(height / tamanhoFonte);

  // Laços aninhados para criar a grade de texto
  for (let i = 0; i < colunas; i++) {
    for (let j = 0; j < linhas; j++) {
      
      // Encontra a posição X e Y (em píxeis) de cada célula de texto
      let x = i * tamanhoFonte + tamanhoFonte / 2;
      let y = j * tamanhoFonte + tamanhoFonte / 2;

      // --- A MATEMÁTICA DA EMERGÊNCIA E TOPOGRAFIA ---
      
      // 1. Calculamos a distância até ao centro para criar um efeito de propagação
      let distCentro = dist(x, y, width / 2, height / 2);
      
      // 2. Ruído de Perlin para movimento orgânico (deslizamento)
      let ruido = noise(i * 0.04, j * 0.04, frameCount * 0.02);
      
      // 3. Onda senoidal baseada na distância para fazer o texto "pulsar" do centro para fora
      let onda = sin(distCentro * 0.02 - frameCount * 0.05);
      
      // Misturamos o ruído orgânico com a onda estruturada e mapeamos para um valor entre 0 e 1
      let valorTopografico = map(ruido + onda, -1, 2, 0, 1);
      valorTopografico = constrain(valorTopografico, 0, 1);

      // --- A APLICAÇÃO TIPOGRÁFICA ---
      
      // Escolhemos qual letra/símbolo desenhar baseando-nos na "altura" topográfica
      let indiceChar = floor(map(valorTopografico, 0, 1, 0, caracteresDensidade.length - 1));
      let letraSorteada = caracteresDensidade.charAt(indiceChar);

      // A cor também acompanha a densidade do texto (do azul escuro ao ciano brilhante/branco)
      let r = map(valorTopografico, 0, 1, 10, 200);
      let g = map(valorTopografico, 0, 1, 50, 255);
      let b = map(valorTopografico, 0, 1, 150, 255);
      
      fill(r, g, b);
      
      // O tamanho de cada letra pulsa suavemente, dando um efeito 3D
      let tamanhoDinamico = map(valorTopografico, 0, 1, tamanhoFonte * 0.6, tamanhoFonte * 1.3);
      textSize(tamanhoDinamico);

      // Desenha o caractere
      text(letraSorteada, x, y);
    }
  }
}

// Garante que o oceano de texto se readapta se a janela mudar de tamanho
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}