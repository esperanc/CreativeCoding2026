// ============================================================
// SKETCH ANIMADO E EMERGENTE EM P5.JS — "RASTROS DE RELEVO"
// ============================================================
//
// ┌──────────────────────────────────────────────────────────┐
// │  REGRA DA EMERGÊNCIA — DECLARAÇÃO EXPLÍCITA              │
// └──────────────────────────────────────────────────────────┘
//
// DEFINIÇÃO ADOTADA NESTE PROGRAMA:
//   Um fenômeno é EMERGENTE quando ele não está escrito em
//   lugar nenhum do código como forma, e mesmo assim aparece
//   na tela — produzido apenas pela interação repetida de
//   regras locais simples, que não se conhecem entre si.
//
// IMPORTANTE: esta regra está documentada aqui DE PROPÓSITO,
// para quem lê o código. Quem INTERAGE com a tela é que não
// deve saber o que vai acontecer: por isso não há instruções,
// legendas nem indicadores visíveis na interface. A pessoa
// clica sem saber o que virá, e o comportamento se revela pelo
// próprio uso.
//
// ------------------------------------------------------------
// AS QUATRO REGRAS LOCAIS (é só isto que está programado)
// ------------------------------------------------------------
//   R1 — DEPÓSITO
//        Um agente invisível ("caminhante") anda em linha reta
//        e vai somando ALTURA num terreno invisível. Ele nunca
//        desenha nada na tela; só modifica números numa grade.
//
//   R2 — REFLEXÃO ALEATÓRIA
//        Ao encostar numa margem, o caminhante volta para
//        dentro com um ângulo SORTEADO (não o espelhamento
//        exato). Isso torna a trajetória imprevisível a longo
//        prazo, mesmo sendo determinística a cada passo.
//
//   R3 — REALIMENTAÇÃO POR CRUZAMENTO
//        Se o caminhante passa por cima de um rastro ANTIGO,
//        ele dobra a altura que deposita daí em diante. Quanto
//        mais o rastro se cruza, mais alto fica — e quanto mais
//        alto, mais visível ficam os cruzamentos seguintes.
//
//   R4 — LEITURA PASSIVA
//        As linhas brancas horizontais não sabem que existe um
//        caminhante. Elas só perguntam, ponto a ponto: "qual a
//        altura do terreno logo abaixo de mim?" — e se deslocam
//        de acordo.
//
// ------------------------------------------------------------
// O QUE EMERGE (nada disto foi desenhado nem previsto)
// ------------------------------------------------------------
//   • As ondas e dobras de "tecido": ninguém desenhou uma onda.
//     Ela é a soma de R1 com R4.
//   • O brilho / moiré nas encostas: nasce porque os pontinhos
//     se comprimem lateralmente onde o terreno é íngreme (ver
//     a variável "inclinacao" em desenharLinha). Efeito óptico
//     não programado.
//   • Os "nós" e cristas altas: nascem de R3, nos lugares onde
//     a trajetória por acaso se cruzou várias vezes.
//   • A composição final: imprevisível. Duas execuções idênticas
//     divergem para sempre já no primeiro quique (R2).
//
// ------------------------------------------------------------
// INTERAÇÃO (deliberadamente não anunciada na tela)
// ------------------------------------------------------------
//   • 1º clique em qualquer lugar: inicia o movimento.
//   • 2º clique: encerra (o rastro permanece).
//   • Encerra sozinho ao cobrir 75% da tela com relevo.
// ============================================================

// ------------------------------------------------------------
// PARÂMETROS DAS LINHAS (a "estética" do desenho)
// ------------------------------------------------------------
const ESPESSURA_MIN = 2;   // espessura mínima de uma linha (pt)
const ESPESSURA_MAX = 5;   // espessura máxima de uma linha (pt)
const ENTRELINHA_MIN = 5;  // espaço mínimo entre duas linhas (pt)
const ENTRELINHA_MAX = 8;  // espaço máximo entre duas linhas (pt)

// ------------------------------------------------------------
// PARÂMETROS DO TERRENO INVISÍVEL (o "campo de relevo")
// ------------------------------------------------------------
const TAMANHO_CELULA = 6;     // tamanho de cada célula da grade, em pixels
const ALTURA_MAXIMA = 55;     // altura máxima que o relevo pode atingir
const RAIO_DEPOSITO = 30;     // "largura do pincel" do caminhante
const ALTURA_VISIVEL = 3;     // a partir daqui consideramos a célula "ocupada"
const META_COBERTURA = 0.75;  // 75% da tela ocupada -> o movimento para

// ------------------------------------------------------------
// PARÂMETROS DO CAMINHANTE
// ------------------------------------------------------------
const VELOCIDADE = 5;             // pixels percorridos por quadro
const DEPOSITO_BASE = 0.55;         // altura depositada por quadro (antes de dobrar)
const DEPOSITO_MAXIMO = 8.8;        // teto para o efeito de "dobrar" não explodir
const IDADE_MINIMA_CRUZAMENTO = 70; // quadros: só conta como cruzamento se o
                                    // rastro encontrado for mais VELHO que isso
const ESPERA_ENTRE_DOBRAS = 45;     // quadros de descanso entre duas dobras

// ------------------------------------------------------------
// DEPURAÇÃO
// ------------------------------------------------------------
// Fica FALSE na obra: qualquer texto na tela entregaria ao
// interagente o que está acontecendo e mataria a surpresa.
// Mude para true apenas para inspecionar o sistema enquanto
// desenvolve.
const MOSTRAR_INDICADOR = false;

// ------------------------------------------------------------
// VARIÁVEIS GLOBAIS
// ------------------------------------------------------------
let linhas = [];      // descrição de cada linha horizontal
let campo;            // alturas do terreno (grade achatada num só array)
let idade;            // em que quadro cada célula foi tocada pela última vez
let colunas, fileiras;

let caminhante = null;        // o agente que cria o rastro (null = parado)
let emMovimento = false;      // o sistema está rodando?
let cobertura = 0;            // fração da tela já ocupada por relevo (0 a 1)
let precisaRedesenhar = true; // otimização: só redesenha quando algo muda

function setup() {
  createCanvas(560, 860);

  // --- Monta a grade invisível do terreno ---
  colunas = ceil(width / TAMANHO_CELULA) + 1;
  fileiras = ceil(height / TAMANHO_CELULA) + 1;
  campo = new Float32Array(colunas * fileiras);
  idade = new Float32Array(colunas * fileiras);

  // --- Cria as linhas horizontais, de cima para baixo ---
  // Cada linha sorteia sua própria espessura e o espaço até a
  // próxima: o padrão já nasce irregular, sem nenhuma forma
  // definida pelo programador.
  let y = ENTRELINHA_MAX;
  while (y < height + ESPESSURA_MAX) {
    let espessura = random(ESPESSURA_MIN, ESPESSURA_MAX);
    linhas.push({
      y: y,                               // POSIÇÃO vertical de repouso
      espessura: espessura,               // DIMENSÃO (grossura)
      passo: max(2.6, espessura * 1.25),  // distância entre os pontinhos
      fase: random(1000)                  // desalinha um pouco cada linha
    });
    y += espessura + random(ENTRELINHA_MIN, ENTRELINHA_MAX);
  }

  noStroke();
}

function draw() {
  // Enquanto o sistema está parado e nada mudou, não redesenhamos.
  if (!emMovimento && !precisaRedesenhar) return;

  background(0);

  // R1 + R2 + R3 acontecem aqui dentro.
  if (emMovimento && caminhante) {
    atualizarCaminhante(caminhante);
    verificarParada();
  }

  // R4: as linhas apenas leem o terreno.
  for (let linha of linhas) {
    desenharLinha(linha);
  }

  if (MOSTRAR_INDICADOR) desenharIndicador();

  precisaRedesenhar = false;
}

// ============================================================
// REGRAS R1, R2 e R3 — O CAMINHANTE
// ============================================================
function atualizarCaminhante(c) {
  // ---- R1: DEPÓSITO ----------------------------------------
  // Anda em linha reta. Não desenha nada: apenas soma altura
  // numa grade invisível.
  c.x += cos(c.angulo) * VELOCIDADE;
  c.y += sin(c.angulo) * VELOCIDADE;

  // ---- R3: REALIMENTAÇÃO POR CRUZAMENTO --------------------
  // Olhamos um pouco à frente. Se ali já existe relevo e esse
  // relevo é ANTIGO o bastante, dobramos o depósito.
  // A exigência de idade é essencial: sem ela o caminhante
  // dobraria ao pisar no próprio rastro recém-feito e o sistema
  // saturaria em segundos, em vez de evoluir.
  let xFrente = c.x + cos(c.angulo) * RAIO_DEPOSITO * 1.1;
  let yFrente = c.y + sin(c.angulo) * RAIO_DEPOSITO * 1.1;
  let indice = indiceDaCelula(xFrente, yFrente);

  if (indice >= 0 &&
      campo[indice] > ALTURA_VISIVEL * 1.6 &&
      frameCount - idade[indice] > IDADE_MINIMA_CRUZAMENTO &&
      frameCount - c.ultimaDobra > ESPERA_ENTRE_DOBRAS) {
    c.deposito = min(c.deposito * 2, DEPOSITO_MAXIMO);
    c.ultimaDobra = frameCount;
    c.dobras++;
  }

  depositarRelevo(c.x, c.y, c.deposito);

  // ---- R2: REFLEXÃO ALEATÓRIA ------------------------------
  // Ao encostar na margem, volta para dentro com ângulo
  // sorteado. É a principal fonte de imprevisibilidade.
  let margem = 4;

  if (c.x < margem) {
    c.x = margem;
    c.angulo = refletir(c.angulo, 0);        // normal aponta para a direita
  } else if (c.x > width - margem) {
    c.x = width - margem;
    c.angulo = refletir(c.angulo, PI);       // normal aponta para a esquerda
  }

  if (c.y < margem) {
    c.y = margem;
    c.angulo = refletir(c.angulo, HALF_PI);  // normal aponta para baixo
  } else if (c.y > height - margem) {
    c.y = height - margem;
    c.angulo = refletir(c.angulo, -HALF_PI); // normal aponta para cima
  }
}

// Devolve um ângulo que aponta para DENTRO da tela (a normal da
// borda), somado a um desvio aleatório de até ±60°.
function refletir(anguloAtual, anguloDaNormal) {
  return anguloDaNormal + random(-PI / 3, PI / 3);
}

// ============================================================
// O TERRENO INVISÍVEL
// ============================================================

// Converte uma posição em pixels no índice da célula da grade.
// Devolve -1 se estiver fora da tela.
function indiceDaCelula(x, y) {
  let cx = floor(x / TAMANHO_CELULA);
  let cy = floor(y / TAMANHO_CELULA);
  if (cx < 0 || cy < 0 || cx >= colunas || cy >= fileiras) return -1;
  return cy * colunas + cx;
}

// Soma altura ao terreno em volta de (x, y), com um "pincel"
// macio: mais alto no centro e sumindo nas bordas.
function depositarRelevo(x, y, quantidade) {
  let c0 = floor((x - RAIO_DEPOSITO) / TAMANHO_CELULA);
  let c1 = floor((x + RAIO_DEPOSITO) / TAMANHO_CELULA);
  let f0 = floor((y - RAIO_DEPOSITO) / TAMANHO_CELULA);
  let f1 = floor((y + RAIO_DEPOSITO) / TAMANHO_CELULA);

  for (let cy = max(0, f0); cy <= min(fileiras - 1, f1); cy++) {
    for (let cx = max(0, c0); cx <= min(colunas - 1, c1); cx++) {
      let px = cx * TAMANHO_CELULA;
      let py = cy * TAMANHO_CELULA;
      let d = dist(px, py, x, y);
      if (d > RAIO_DEPOSITO) continue;

      // Curva suave: 1 no centro, 0 na borda do pincel.
      let peso = pow(cos((d / RAIO_DEPOSITO) * HALF_PI), 2);
      let i = cy * colunas + cx;

      campo[i] = min(campo[i] + quantidade * peso, ALTURA_MAXIMA);
      idade[i] = frameCount; // marca quando esta célula foi tocada
    }
  }
}

// Lê a altura do terreno em qualquer ponto (x, y), misturando as
// 4 células vizinhas para que o relevo fique liso, sem degraus.
function alturaEm(x, y) {
  let fx = x / TAMANHO_CELULA;
  let fy = y / TAMANHO_CELULA;
  let cx = floor(fx);
  let cy = floor(fy);
  if (cx < 0 || cy < 0 || cx >= colunas - 1 || cy >= fileiras - 1) return 0;

  let tx = fx - cx;
  let ty = fy - cy;
  let i = cy * colunas + cx;

  let a = campo[i];
  let b = campo[i + 1];
  let c = campo[i + colunas];
  let d = campo[i + colunas + 1];

  return lerp(lerp(a, b, tx), lerp(c, d, tx), ty);
}

// ============================================================
// REGRA R4 — LEITURA PASSIVA
// ------------------------------------------------------------
// Cada linha é uma sequência de pontinhos. Para cada ponto
// perguntamos a altura do terreno ali e aplicamos três efeitos:
//   • a altura empurra o ponto para CIMA (a extrusão do relevo);
//   • a INCLINAÇÃO do terreno empurra o ponto para o lado — e é
//     daqui que EMERGE o brilho tipo tecido: os pontinhos se
//     comprimem nas encostas íngremes e se afastam nas rasas.
//     Esse efeito óptico não foi desenhado em lugar nenhum;
//   • quanto mais alto, mais claro e mais grosso fica o ponto.
// A linha não sabe que existe um caminhante.
// ============================================================
function desenharLinha(linha) {
  let y0 = linha.y;

  for (let x = -6; x < width + 6; x += linha.passo) {
    let h = alturaEm(x, y0);

    // Terreno plano: desenha o ponto direto, sem cálculo extra.
    if (h < 0.25) {
      fill(196);
      circle(x, y0, linha.espessura);
      continue;
    }

    // Inclinação horizontal do terreno (derivada aproximada).
    let inclinacao = (alturaEm(x + 5, y0) - alturaEm(x - 5, y0)) * 0.5;

    let px = x + inclinacao * 1.15;   // deslocamento lateral
    let py = y0 - h;                  // extrusão para cima

    let brilho = map(h, 0, ALTURA_MAXIMA, 196, 255, true);
    let grossura = linha.espessura * map(h, 0, ALTURA_MAXIMA, 1, 1.35, true);

    fill(brilho);
    circle(px, py, grossura);
  }
}

// ============================================================
// CONTROLE DO SISTEMA
// ------------------------------------------------------------
// Sem instruções na tela: a descoberta do comportamento faz
// parte da obra. O primeiro clique é um gesto às cegas.
// ============================================================
function mousePressed() {
  if (emMovimento) {
    // Segundo clique: encerra o movimento (o rastro permanece).
    pararMovimento();
  } else {
    // Primeiro clique: nasce um caminhante no ponto clicado,
    // com direção sorteada.
    caminhante = {
      x: mouseX,
      y: mouseY,
      angulo: random(TWO_PI),
      deposito: DEPOSITO_BASE,
      ultimaDobra: -999,
      dobras: 0
    };
    emMovimento = true;
    loop();
  }
  precisaRedesenhar = true;
}

function pararMovimento() {
  emMovimento = false;
  caminhante = null;
  precisaRedesenhar = true;
}

// Mede quanto da tela já tem relevo visível. Ao chegar em 75%,
// o sistema se encerra sozinho.
function verificarParada() {
  // Só recontamos de vez em quando: percorrer a grade inteira a
  // cada quadro seria desperdício.
  if (frameCount % 20 !== 0) return;

  let ocupadas = 0;
  for (let i = 0; i < campo.length; i++) {
    if (campo[i] > ALTURA_VISIVEL) ocupadas++;
  }
  cobertura = ocupadas / campo.length;

  if (cobertura >= META_COBERTURA) {
    pararMovimento();
  }
}

// Só roda se MOSTRAR_INDICADOR for true (modo de inspeção).
function desenharIndicador() {
  noStroke();
  fill(0, 190);
  rect(0, height - 26, 210, 26);
  fill(160);
  textSize(11);
  textAlign(LEFT, CENTER);

  let estado = emMovimento ? "em movimento" : "parado";
  let dobras = caminhante ? caminhante.dobras : 0;
  text(
    `${estado}  ·  cobertura ${nf(cobertura * 100, 2, 0)}%  ·  dobras ${dobras}`,
    10,
    height - 13
  );
}