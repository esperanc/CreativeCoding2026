const ASSINATURA_COR = [243, 170, 120];
const ASSINATURA_POR_PAREDE = 480;
const ASSINATURA_SEMENTE = 7;
const ASSINATURA_ESCALA_MIN = 0.16;
const ASSINATURA_ESCALA_MAX = 0.62;
const ASSINATURA_GIRO = 0.7;
const ASSINATURA_SUBIDA = 0.07;

const TEXTURA_LARGURA = 1600;
const TEXTURA_ALTURA = 576;
const PIXEIS_POR_UNIDADE = TEXTURA_LARGURA / SALA;

const CORES_PAREDE = [
  [212, 96, 34],
  [198, 88, 30],
  [186, 82, 28],
];

const TRACOS_ASSINATURA = [
  [[6,2],[4.5,9],[3,16],[2,22]],
  [[14,4],[10,8],[6,11],[3,13]],
  [[5,12],[9,16],[12,19],[15,23]],
  [[18.5,21],[19,21]],

  [[28,1],[26,9],[24.5,17],[23,24]],
  [[42,3],[40,11],[38.5,19],[37,26]],
  [[24.5,14],[30,12.8],[35,12],[40,11.2]],

  [[54,11],[51,9.6],[48,11],[47,14],[47.3,18],[49.5,21],[52.5,20.5],[54.3,18]],
  [[54,10],[53.6,15],[53.4,21.5]],

  [[59,22],[59.8,16],[60.7,11.5],[62,10.2],[64,10.6],[65.5,12]],

  [[70.2,21],[70.8,15],[71.2,11.5]],
  [[72,6],[72.4,6]],

  [[76,21],[77,15],[78,11],[80.5,10],[83,11.5],[83.8,15],[83.4,21]],

  [[96,11],[93,9.6],[90,11],[89,14],[89.3,18],[91.5,21],[94.5,20.5],[96.3,18]],
  [[96.5,10],[95.6,17],[94.6,24],[92.5,28],[89,28.4],[87,27]],
];

let texturasParede = [];

function criarTexturasParede() {
  randomSeed(ASSINATURA_SEMENTE);
  texturasParede = [];

  for (let i = 0; i < 3; i++) {
    const g = createGraphics(TEXTURA_LARGURA, TEXTURA_ALTURA);
    g.background(CORES_PAREDE[i][0], CORES_PAREDE[i][1], CORES_PAREDE[i][2]);
    g.noFill();
    g.strokeCap(ROUND);
    g.strokeJoin(ROUND);

    for (let n = 0; n < ASSINATURA_POR_PAREDE; n++) {
      const escala = random(ASSINATURA_ESCALA_MIN, ASSINATURA_ESCALA_MAX) * PIXEIS_POR_UNIDADE;

      g.push();
      g.translate(random(-60, TEXTURA_LARGURA + 60), random(-40, TEXTURA_ALTURA + 40));
      g.rotate(random(-ASSINATURA_GIRO, ASSINATURA_GIRO));
      g.stroke(
        ASSINATURA_COR[0], ASSINATURA_COR[1], ASSINATURA_COR[2],
        random(55, 180)
      );
      g.strokeWeight(max(1.2, escala * 2.6));

      for (const traco of TRACOS_ASSINATURA) {
        g.beginShape();
        for (const [x, y] of traco) {
          g.vertex(
            (x - 50) * escala,
            (y - x * ASSINATURA_SUBIDA - 14) * escala
          );
        }
        g.endShape();
      }
      g.pop();
    }

    texturasParede.push(g);
  }
}
