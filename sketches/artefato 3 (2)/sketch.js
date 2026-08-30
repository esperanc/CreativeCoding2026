class ExponencialComplexa {
  constructor(modulo, frequencia, fase, componente) {
    this.modulo = modulo;
    this.frequencia = frequencia;
    this.fase = fase;
    this.componente = componente;
  }

  avaliar(x) {
    let theta = (this.frequencia * x) + this.fase;
    if (this.componente === 're') {
      return this.modulo * Math.cos(theta);
    } else if (this.componente === 'im') {
      return this.modulo * Math.sin(theta);
    }
  }
}

class FuncaoComposta {
  constructor(r, g, b) {
    this.componentes = [];
    this.r = r;
    this.g = g;
    this.b = b;
  }

  adicionar(exponencial) {
    this.componentes.push(exponencial);
  }

  avaliar(x) {
    let y = 0;
    for (let comp of this.componentes) {
      y += comp.avaliar(x);
    }
    return y;
  }
}

const LARGURA_REF = 2560;
const ALTURA_REF = 1440;
let escala = 1;

function desenharEstrelaPequena(x, y) {
  noStroke();
  blendMode(ADD);

  let tamanho = random(0.05, 1) * escala;
  let cor = random() > 0.85
    ? color(255, 190, 140)
    : color(255, 255, 255);

  for (let r = tamanho * 2.5; r > 0; r -= 0.3) {
    let op = map(r, 0, tamanho * 2.5, 220, 0);
    fill(red(cor), green(cor), blue(cor), op);
    circle(x, y, r * 2);
  }

  blendMode(BLEND);
}

function gerarCampoDeEstrelas(quantidade) {
  for (let i = 0; i < quantidade; i++) {
    desenharEstrelaPequena(random(width), random(height));
  }
}

function desenharEstrela(x, y, tamanho) {
  push();
  translate(x, y);
  blendMode(ADD); // luz se soma ao fundo em vez de cobri-lo
  noStroke();

  for (let r = tamanho * 2.5; r > tamanho * 0.8; r -= 1.5) {
    let op = map(r, tamanho * 0.8, tamanho * 2.5, 55, 0);
    fill(255, 200, 150, op);
    ellipse(0, 0, r * 2, r * 2);
  }

  push();
  rotate(radians(45));
  espicula(tamanho * 3, tamanho * 21, 1 * escala);
  pop();

  espicula(tamanho * 7, tamanho * 35, 1.4 * escala);

  // núcleo por cima para esconder o cruzamento das espículas no centro
  noStroke();
  for (let r = tamanho; r > 0; r -= 0.4) {
    let t = r / tamanho;
    let op = map(r, 0, tamanho, 255, 25);
    let c;
    if (t > 0.5) {
      c = lerpColor(color(255, 255, 255), color(255, 180, 110), (t - 0.5) * 2);
    } else {
      c = lerpColor(color(205, 225, 255), color(255, 255, 255), t * 2);
    }
    fill(red(c), green(c), blue(c), op);
    ellipse(0, 0, r * 1.5, r * 1.5);
  }

  blendMode(BLEND);
  pop();
}

function espicula(tamanhoBase, comprimento, larguraMax) {
  strokeCap(ROUND);
  let inicio = tamanhoBase * 0.3;

  for (let dir = 0; dir < 2; dir++) {
    for (let i = inicio; i < comprimento; i += 1.5) {
      let t = (i - inicio) / (comprimento - inicio);
      let op = 230 * pow(1 - t, 2.5);
      let peso = lerp(larguraMax, 0.2 * escala, t);

      stroke(255, 240, 220, op);
      strokeWeight(peso);

      if (dir === 0) {
        line(i, 0, i - 1.5, 0);
        line(-i, 0, -i + 1.5, 0);
      } else {
        line(0, i, 0, i - 1.5);
        line(0, -i, 0, -i + 1.5);
      }
    }
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  desenharCena();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  desenharCena();
}

function desenharCena() {
  // escala pela menor proporção (largura ou altura) para nunca estourar a tela
  escala = min(width / LARGURA_REF, height / ALTURA_REF);

  background(10);

  gerarCampoDeEstrelas(floor((width * height) / (LARGURA_REF * ALTURA_REF) * 1000));

  noFill();
  strokeWeight(3 * escala);

  let listaDeFuncoes = [];

  for (let i = 0; i < 250; i++) {
    let onda = new FuncaoComposta(i * 4, i * 3, i * 3);
    let n = random(20, 50);

    for (let w = 0; w < n; w++) {
      let modIm = 0.2;
      let freqIm = w * random(0.01, 0.02);
      let faseIm = 0.1;

      let modRe = 0.1;
      let freqRe = w * random(0.1, 1);
      let faseRe = 0;

      onda.adicionar(new ExponencialComplexa(modIm, freqIm, faseIm, 'im'));
      onda.adicionar(new ExponencialComplexa(modRe, freqRe, faseRe, 're'));
    }

    listaDeFuncoes.push(onda);
  }

  for (let funcao of listaDeFuncoes) {
    stroke(funcao.r, funcao.g, funcao.b, 20);

    beginShape();
    for (let px = 0; px <= width; px += 2) {
      let x = map(px, 0, width, -TWO_PI, TWO_PI);
      let y = funcao.avaliar(x);
      vertex(px, map(y, -5, 5, height, 0));
    }
    endShape();
  }

  let tamanhosEstrelas = [1 * escala, 2 * escala, 5 * escala];
  let regioesSorteada = shuffle([0, 1, random([0, 1])]);

  for (let i = 0; i < 3; i++) {
    let x, y;
    let regiao = regioesSorteada[i];

    if (regiao === 0) {
      x = random(20, width / 3);
      y = random(20, height / 3);
    } else {
      x = random(width * 2 / 3, width - 20);
      y = random(height * 2 / 3, height - 20);
    }

    let tamanho = tamanhosEstrelas[i];

    stroke(255);
    strokeWeight(4 * escala);
    point(x, y);

    desenharEstrela(x, y, tamanho);
  }
}