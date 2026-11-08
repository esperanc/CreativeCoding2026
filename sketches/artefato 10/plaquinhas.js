const PLACA_LARGURA = 48;
const PLACA_ALTURA = 24;
const PLACA_INCLINACAO = 0.6;
const PLACA_TEXTURA_LARGURA = 720;
const PLACA_TEXTURA_ALTURA = 360;
const PLACA_FUNDO = [238, 233, 222];
const PLACA_TEXTO = [34, 30, 28];
const PLACA_TEXTO_SUAVE = [110, 102, 96];

function criarPlaquinhas() {
  for (const o of OBRAS) {
    const g = createGraphics(PLACA_TEXTURA_LARGURA, PLACA_TEXTURA_ALTURA);
    g.background(PLACA_FUNDO[0], PLACA_FUNDO[1], PLACA_FUNDO[2]);
    g.noStroke();
    g.textAlign(LEFT, TOP);

    const margem = 48;

    g.fill(PLACA_TEXTO[0], PLACA_TEXTO[1], PLACA_TEXTO[2]);
    g.textStyle(BOLD);
    g.textSize(64);
    g.text(o.titulo, margem, margem);

    g.textStyle(NORMAL);
    g.textSize(40);
    g.fill(PLACA_TEXTO_SUAVE[0], PLACA_TEXTO_SUAVE[1], PLACA_TEXTO_SUAVE[2]);
    g.text('Keith Haring', margem, margem + 96);

    if (o.ano) {
      g.text(o.ano, margem, margem + 148);
    }

    g.stroke(PLACA_TEXTO[0], PLACA_TEXTO[1], PLACA_TEXTO[2]);
    g.strokeWeight(3);
    g.line(margem, margem + 84, PLACA_TEXTURA_LARGURA - margem, margem + 84);

    o.plaquinha = g;
  }
}

function desenharPlaquinhas() {
  for (const o of OBRAS) {
    if (!o.plaquinha) continue;

    const meioPedestal = (130 * o.escala) / 2;
    const raio = o.raioPlaca || meioPedestal;
    const noChao = raio > meioPedestal;
    const altura = noChao ? CHAO : CHAO - o.pedestal;
    const paraCentro = Math.atan2(-o.x, -o.z) + (o.desvioPlaca || 0);

    push();
    translate(o.x, altura, o.z);
    rotateY(paraCentro);
    translate(0, 0, raio - PLACA_ALTURA * 0.45);
    rotateX(PLACA_INCLINACAO);

    noStroke();
    fill(40, 36, 33);
    translate(0, -PLACA_ALTURA / 2, 0);
    box(PLACA_LARGURA + 3, PLACA_ALTURA + 3, 2);

    translate(0, 0, 1.6);
    texture(o.plaquinha);
    plane(PLACA_LARGURA, PLACA_ALTURA);
    pop();
  }
}
