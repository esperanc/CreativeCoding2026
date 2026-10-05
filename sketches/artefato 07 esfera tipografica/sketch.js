// Esfera Tipográfica RGB
// Homenagem a "rgb halftone sphere", de Adam Fuhrer.
// Em vez de pontos de meio-tom, cada "ponto" é uma LETRA: o canal vermelho é
// feito só de "R", o verde só de "G" e o azul só de "B". O tamanho da letra
// diz o quanto de luz aquele canal recebe naquele ponto da esfera.

// Fonte hospedada em CDN (nada de arquivo de fonte no zip)
const URL_FONTE =
  "https://cdn.jsdelivr.net/fontsource/fonts/space-mono@latest/latin-700-normal.woff";

let fonte;

// Cada canal tem a sua tela de meio-tom: ângulo da grade, letra e cor.
// Os ângulos diferentes entre si são o que cria o efeito moiré da gráfica.
const canais = [
  { letra: "R", cor: [255, 0, 0], angulo: 15, fase: 0.0 },
  { letra: "G", cor: [0, 255, 0], angulo: 75, fase: 2.1 },
  { letra: "B", cor: [0, 0, 255], angulo: 45, fase: 4.2 },
];

// Conjuntos de letras que o usuário pode alternar com a tecla ESPAÇO / clique
const conjuntos = [
  ["R", "G", "B"],
  ["T", "I", "P"],
  ["A", "N", "O"],
  ["0", "1", "#"],
];
let conjunto = 0;

// Tudo o que é "sorteado" depende desta semente; clicar sorteia outra.
let semente = 0;
let velLuz = [], ruido = 0, jitter = 0, trocaLetra = 0, falha = 0;

// hash determinístico (c, i, j) -> [0,1): o acaso de cada letra fica estável
// entre os quadros, senão a esfera tremeria feito estática de TV.
function acaso(c, i, j, k) {
  let h = (i * 374761393 + j * 668265263 + c * 2147483 + k * 1274126177 + semente * 97) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function sorteia() {
  semente = floor(random(1e6));
  conjunto = floor(random(conjuntos.length));
  for (const canal of canais) {
    canal.angulo = random(0, 90);       // ângulo da grade
    canal.fase = random(TWO_PI);        // fase da luz
  }
  velLuz = canais.map(() => [random(0.2, 1.1), random(0.2, 1.1)]);
  ruido = random(0.15, 0.6);   // quão "amassada" é a superfície da esfera
  jitter = random(0.1, 0.6);   // tremida de posição de cada letra (em passos)
  trocaLetra = random(0.03, 0.18); // chance de uma letra "errada" aparecer
  falha = random(0.02, 0.12);  // chance de uma letra faltar
}

// pool de intrusas que podem aparecer no lugar da letra do canal
const intrusas = "RGBabg0123456789#@%&?!*+<>/\\";

let raio, passo;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  fonte = await loadFont(URL_FONTE);
  textFont(fonte);
  textAlign(CENTER, CENTER);
  noStroke();
  sorteia();
  ajustaTamanho();
}

function ajustaTamanho() {
  raio = min(width, height) * 0.4;
  passo = raio / 20; // espaçamento da grade de letras
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  ajustaTamanho();
}

function mousePressed() {
  sorteia();
}
function keyPressed() {
  if (key === " ") sorteia();
  if (key === "s") saveCanvas("esfera-tipografica", "png");
}

function draw() {
  if (!fonte) return;
  background(0);

  // "lighter" soma as cores: R + G + B = branco, como luz de verdade
  drawingContext.globalCompositeOperation = "lighter";

  const t = millis() / 1000;
  const letras = conjuntos[conjunto];

  for (let c = 0; c < canais.length; c++) {
    const canal = canais[c];
    // cada canal é iluminado por uma luz que gira em outro ritmo,
    // por isso as cores se separam nas bordas do brilho
    let lx = cos(t * velLuz[c][0] + canal.fase) * 0.8;
    let ly = sin(t * velLuz[c][1] + canal.fase) * 0.8;
    if (mouseX > 0 || mouseY > 0) {
      // o mouse puxa as três luzes para onde ele está
      lx = lerp(lx, (mouseX - width / 2) / raio, 0.5);
      ly = lerp(ly, (mouseY - height / 2) / raio, 0.5);
    }
    const lz = 0.7;
    const norma = sqrt(lx * lx + ly * ly + lz * lz);
    lx /= norma; ly /= norma; const lzn = lz / norma;

    const a = radians(canal.angulo + t * 4); // a grade gira devagar
    const ca = cos(a), sa = sin(a);
    const n = ceil(raio / passo) + 2;

    fill(canal.cor[0], canal.cor[1], canal.cor[2]);
    const ch = letras[c];

    for (let i = -n; i <= n; i++) {
      for (let j = -n; j <= n; j++) {
        // posição da letra: grade girada pelo ângulo do canal
        const gx = i * passo, gy = j * passo;
        const x = gx * ca - gy * sa;
        const y = gx * sa + gy * ca;
        const d2 = (x * x + y * y) / (raio * raio);
        if (d2 >= 1) continue;

        // normal da esfera nesse ponto
        let nx = x / raio, ny = y / raio, nz = sqrt(1 - d2);
        // superfície amassada: ruído de Perlin desvia a normal e muda com o tempo
        nx += (noise(x * 0.012, y * 0.012, t * 0.15 + semente) - 0.5) * ruido;
        ny += (noise(y * 0.012 + 50, x * 0.012, t * 0.15 + semente) - 0.5) * ruido;
        // luz difusa + um brilho especular suave
        const lamb = max(0, nx * lx + ny * ly + nz * lzn);
        const luz = pow(lamb, 1.6) * 0.95 + pow(lamb, 24) * 0.4;
        if (luz < 0.04) continue;

        // acaso por letra: some, vira intrusa, treme e varia de tamanho
        if (acaso(c, i, j, 1) < falha) continue;
        let letra = ch;
        if (acaso(c, i, j, 2) < trocaLetra) {
          letra = intrusas[floor(acaso(c, i, j, 3) * intrusas.length)];
        }
        const dx = (acaso(c, i, j, 4) - 0.5) * jitter * passo * 2;
        const dy = (acaso(c, i, j, 5) - 0.5) * jitter * passo * 2;
        const vari = 0.7 + acaso(c, i, j, 6) * 0.6;
        textSize(passo * 1.5 * vari * sqrt(constrain(luz, 0, 1.2)));
        text(letra, width / 2 + x + dx, height / 2 + y + dy);
      }
    }
  }
  drawingContext.globalCompositeOperation = "source-over";

  // legenda discreta
  fill(255, 90);
  textSize(12);
  textAlign(LEFT, BOTTOM);
  text("clique/espaço: sortear de novo · mouse: luz · s: salvar", 14, height - 12);
  textAlign(CENTER, CENTER);
}
