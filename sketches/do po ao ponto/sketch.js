/* DO PÓ AO PONTO — Henrique Kezen V. H. Leite
 * p5.js 2.2.3. A fotografia é apenas uma fonte de cores: nunca é
 * desenhada no canvas visível. Cada grão tem posição, velocidade e destino.
 */
const URL_FOTO = 'https://upload.wikimedia.org/wikipedia/commons/9/90/Rafael_Nadal_Forehand.jpg';
const W = 1100, H = 760;
const particulas = [];
let pronto = false, inicio = 0, tela, poeira = [], emToque = false;
let ponteiro = { x: -9999, y: -9999, ativo: false };

// Coordenadas na foto reduzida a 960 × 600. Esta máscara manual é específica
// desta fotografia. Preserva jogador e raquete e exclui gandula e anúncios.
const silhueta = [
 [294,201],[301,184],[321,175],[338,179],[347,194],[350,219],
 [341,233],[359,241],[373,250],[374,230],[368,214],[366,198],
 [379,182],[391,187],[398,201],[395,219],[408,244],[428,266],
 [426,280],[411,286],[396,281],[397,308],[406,335],[409,361],
 [409,390],[398,421],[409,450],[427,478],[447,506],[456,529],
 [477,544],[481,554],[468,568],[451,582],[434,584],[431,575],
 [439,553],[435,538],[413,515],[391,492],[370,472],[356,449],
 [346,431],[325,451],[302,472],[283,495],[280,523],[277,536],
 [281,547],[268,559],[246,567],[231,566],[229,557],[240,543],
 [251,528],[254,511],[253,484],[252,465],[264,439],[282,412],
 [292,386],[283,371],[273,390],[256,408],[245,416],[239,430],
 [231,426],[235,412],[222,420],[217,418],[231,403],[226,400],
 [240,391],[250,389],[262,365],[278,337],[286,305],[290,272],
 [300,250],[314,236],[302,224]
];
const raquete = [[378,192],[384,184],[424,155],[458,129],[479,115],
 [491,116],[495,124],[481,144],[455,162],[431,173],[411,180],[391,199]];

async function setup() {
  tela = createCanvas(W, H);
  tela.parent('quadro');
  pixelDensity(1);
  frameRate(60);
  randomSeed(12);
  desenharCenario();
  desenharTexto();
  configurarPonteiro();
  document.getElementById('recomecar').onclick = dispersar;
  try {
    // No p5 2, o carregamento assíncrono acontece com await em setup().
    // loadImage faz o pedido CORS; loadPixels falharia se o servidor bloqueasse.
    const foto = await loadImage(URL_FOTO);
    foto.resize(960, 600);
    foto.loadPixels();
    if (foto.pixels.length !== 960 * 600 * 4) throw new Error('Pixels indisponíveis');
    construirParticulas(foto);
    for (let i = 0; i < 800; i++) {
      poeira.push({x: random(415, 1040), y: randomGaussian(652, 21),
        r: random(.5, 1.8), a: random(12, 70), fase: random(TWO_PI)});
    }
    pronto = true;
    dispersar();
    document.getElementById('estado').textContent = 'Passe o mouse ou arraste o dedo. O saibro guarda a forma.';
    document.getElementById('recomecar').disabled = false;
  } catch (erro) {
    console.error('Não foi possível carregar a imagem:', erro);
    document.getElementById('estado').textContent = 'Falha ao carregar a foto. Verifique a conexão e tente novamente.';
    const botao = document.getElementById('recomecar');
    botao.textContent = 'Tentar novamente';
    botao.disabled = false;
    botao.onclick = () => location.reload();
  }
}

// Teste ponto-em-polígono: uma linha horizontal cruza o contorno um número
// ímpar de vezes quando o ponto está dentro dele.
function dentro(x, y, poligono) {
  let resultado = false;
  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    const [ax, ay] = poligono[i], [bx, by] = poligono[j];
    if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) resultado = !resultado;
  }
  return resultado;
}

function construirParticulas(foto) {
  // Amostragem densa, com pequena variação para evitar aparência de grade.
  // O recorte é ampliado e posicionado à direita, sem deformar as proporções.
  const passo = 1.8, escala = 1.13;
  for (let y = 113; y < 587; y += passo) {
    for (let x = 214; x < 499; x += passo) {
      const sx = x + random(-.65, .65), sy = y + random(-.65, .65);
      if (!dentro(sx, sy, silhueta) && !dentro(sx, sy, raquete)) continue;
      const indice = 4 * (floor(sy) * foto.width + floor(sx));
      const r = foto.pixels[indice], g = foto.pixels[indice + 1], b = foto.pixels[indice + 2];
      particulas.push({
        tx: 623 + (sx - 350) * escala, ty: 92 + (sy - 110) * escala,
        x: 0, y: 0, vx: 0, vy: 0,
        cor: `rgb(${r},${g},${b})`, tamanho: random(1.35, 2.35),
        atraso: random(0, 1500), fase: random(TWO_PI)
      });
    }
  }
}

function dispersar() {
  inicio = null;
  for (const p of particulas) {
    p.x = random(390, W + 120);
    p.y = random(-130, H + 140);
    p.vx = random(-1.5, 1.5); p.vy = random(-.6, .6);
  }
}

function draw() {
  desenharCenario();
  if (pronto) {
    // O relógio do p5 é reiniciado após setup assíncrono.
    // Ancoramos a abertura no primeiro draw, após o carregamento.
    if (inicio === null) inicio = millis();
    const tempo = millis() - inicio;
    // Passo limitado impede saltos enormes ao retornar a uma aba inativa.
    const dt = min(deltaTime / 16.667, 2);
    const ctx = drawingContext;
    ctx.save();
    for (const p of particulas) {
      const formando = tempo > p.atraso;
      const mola = formando ? .018 : .00008;
      p.vx += (p.tx - p.x) * mola * dt;
      p.vy += (p.ty - p.y) * mola * dt;
      if (ponteiro.ativo) {
        const dx = p.x - ponteiro.x, dy = p.y - ponteiro.y;
        const distancia = sqrt(dx * dx + dy * dy);
        if (distancia < 85) {
          const forca = (1 - distancia / 85) * 3.6 * dt;
          const divisor = max(distancia, 1);
          p.vx += dx / divisor * forca + .22 * dt;
          p.vy += dy / divisor * forca - .30 * dt;
        }
      }
      const amortecimento = pow(.85, dt);
      p.vx *= amortecimento; p.vy *= amortecimento;
      p.x += p.vx * dt; p.y += p.vy * dt;
      // Desenho direto no contexto 2D do canvas p5: evita milhares de
      // mudanças de estado de fill(), mantendo a animação mais leve.
      ctx.fillStyle = p.cor;
      ctx.fillRect(p.x, p.y, p.tamanho, p.tamanho);
    }
    ctx.restore();
    noStroke();
    for (const p of poeira) {
      fill(192, 105, 61, p.a);
      circle(p.x + sin(millis() * .0003 + p.fase) * 8, p.y, p.r);
    }
    if (ponteiro.ativo) {
      noFill(); stroke(202, 151, 110, 65); strokeWeight(.7);
      circle(ponteiro.x, ponteiro.y, 170);
    }
  }
  desenharTexto();
}

function desenharCenario() {
  background('#100e0d');
  const ctx = drawingContext;
  ctx.save();
  const luz = ctx.createRadialGradient(700, 422, 15, 700, 422, 420);
  luz.addColorStop(0, '#251911'); luz.addColorStop(1, '#100e0d');
  ctx.fillStyle = luz; ctx.fillRect(0, 0, W, H);
  ctx.restore();
  // Um vestígio de quadra, desenhado com linhas, ancora a figura no espaço.
  stroke(111, 65, 42, 100); strokeWeight(1);
  line(435, 682, 1030, 640);
  stroke(160, 112, 80, 45); line(600, 670, 776, 614);
}

function desenharTexto() {
  // Tipografia no mesmo contexto 2D; save/restore isola seu estado do p5.
  const ctx = drawingContext;
  ctx.save();
  ctx.textBaseline = 'alphabetic';
  function legenda(conteudo, x, y, tamanho, cor, fonte = 'Arial, sans-serif', alinhamento = 'left') {
    ctx.font = `${tamanho}px ${fonte}`;
    ctx.fillStyle = cor;
    ctx.textAlign = alinhamento;
    ctx.fillText(conteudo, x, y);
  }
  legenda('ESTUDO 08     /     IMAGEM & MOVIMENTO', 52, 57, 11, '#c27c52');
  legenda('ROLAND GARROS, 2012', 1048, 57, 11, '#827065', 'Arial, sans-serif', 'right');
  legenda('Do pó', 52, 249, 80, '#eadfd1', 'Georgia, serif');
  legenda('ao ponto', 52, 332, 80, '#eadfd1', 'Georgia, serif');
  ctx.font = 'italic 22px Georgia, serif';
  ctx.fillStyle = '#c77c50'; ctx.fillText('A forma é passageira.', 56, 382);
  legenda('Um corpo. Milhares de grãos.', 56, 429, 14, '#b7a492');
  legenda('O gesto permanece.', 56, 452, 14, '#b7a492');
  ctx.strokeStyle = '#6c402c'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(56, 489); ctx.lineTo(104, 489); ctx.stroke();
  legenda('TOQUE A IMAGEM', 56, 525, 11, '#8b7768');
  legenda('Disperse a matéria. Deixe-a voltar.', 56, 547, 11, '#8b7768');
  ctx.strokeStyle = '#37271e';
  ctx.beginPath(); ctx.moveTo(52, 703); ctx.lineTo(1048, 703); ctx.stroke();
  legenda('HENRIQUE KEZEN V. H. LEITE', 52, 729, 10, '#847265');
  legenda('FOTO: YANN CARADEC  /  CC BY-SA 2.0', 1048, 729, 10, '#847265', 'Arial, sans-serif', 'right');
  ctx.restore();
}

function configurarPonteiro() {
  // Pointer Events unifica mouse e toque e respeita a escala CSS do canvas.
  const atualizar = (e) => {
    const area = tela.elt.getBoundingClientRect();
    ponteiro.x = (e.clientX - area.left) * W / area.width;
    ponteiro.y = (e.clientY - area.top) * H / area.height;
    ponteiro.ativo = e.pointerType !== 'touch' || emToque;
  };
  tela.elt.addEventListener('pointermove', atualizar);
  tela.elt.addEventListener('pointerdown', e => {
    emToque = true; atualizar(e); tela.elt.setPointerCapture(e.pointerId);
  });
  tela.elt.addEventListener('pointerup', e => {
    emToque = false;
    if (e.pointerType === 'touch') ponteiro.ativo = false;
  });
  tela.elt.addEventListener('pointerleave', () => { ponteiro.ativo = false; });
  tela.elt.addEventListener('pointercancel', () => { emToque = false; ponteiro.ativo = false; });
}
