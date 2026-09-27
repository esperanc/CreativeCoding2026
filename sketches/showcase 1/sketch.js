// Frequencia das letras: cada ocorrencia ligada a seguinte da mesma letra.
const URL_FONTE = "https://cdn.jsdelivr.net/npm/@fontsource/anton/files/anton-latin-400-normal.woff";
const ALF = "abcdefghijklmnopqrstuvwxyz";
const TEXTO =
  "a tipografia e a arte de dispor letras no espaco de modo que a leitura "
  + "aconteca sem esforco e sem que o leitor perceba o trabalho que houve ali "
  + "toda letra e uma forma antiga carregada de convencao e de significado "
  + "e toda linha de texto e tambem um desenho que ocupa uma area da pagina";

async function setup() {
  createCanvas(900, 500);
  background(246);
  const f = await loadFont(URL_FONTE);
  textFont(f);

  const conta = new Array(26).fill(0);
  for (const c of TEXTO) {
    const i = ALF.indexOf(c);
    if (i >= 0) conta[i]++;
  }
  const maxi = Math.max(...conta);

  // posicao de cada ocorrencia, ja no lugar ordenado
  const ultimo = new Array(26).fill(null);
  const ligacoes = [];
  const marcas = [];
  textSize(13);
  textAlign(LEFT, BASELINE);
  let x = 40;
  for (const c of TEXTO) {
    const i = ALF.indexOf(c);
    if (i < 0) { x += 5; continue; }
    const y = 34 + i * 17;
    if (ultimo[i]) ligacoes.push([ultimo[i], [x, y], i]);
    ultimo[i] = [x, y];
    marcas.push([c, x, y, conta[i] / maxi]);
    x += textWidth(c) + 2;
    if (x > width - 40) x = 40;
  }

  // as ligacoes, coloridas pela posicao no alfabeto
  noFill();
  strokeWeight(0.8);
  colorMode(HSB, 360, 100, 100, 100);
  for (const [a, b, i] of ligacoes) {
    stroke((i / 26) * 320, 62, 78, 26);
    const mx = (a[0] + b[0]) / 2;
    bezier(a[0], a[1], mx, a[1] - 22, mx, b[1] - 22, b[0], b[1]);
  }
  colorMode(RGB, 255);

  // as letras
  noStroke();
  for (const [c, mx, my, t] of marcas) {
    fill(lerpColor(color("#c9ccd2"), color("#20242c"), t));
    text(c, mx, my);
  }
}
