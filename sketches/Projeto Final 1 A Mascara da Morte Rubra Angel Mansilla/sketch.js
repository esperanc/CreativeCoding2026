// A Máscara da Morte Rubra
// Filme de teatro de varetas em papel recortado, a partir do conto de Edgar Allan Poe.
// Angel Mansilla, DRE 123691897. Projeto final de Programação Criativa 2026, UFRJ, parte 1.
//
// sketch.js: o roteiro no tempo, a câmera, a montagem de cada quadro e o shader de filtro.
// Tudo é função do tempo "t" do filme, em segundos: nada se acumula de um quadro para o outro.

// ---------- roteiro ----------

const DUR = 176;
const T_DENTRO = 40;                          // fim da cena de fora da abadia (fora.js)
const PARADAS = [[75, 81.5], [85, 104.5]];    // o relógio toca e tudo para: às dez e à meia-noite
const MEIA_NOITE = PARADAS[1][0];
const BADALADA = 1.6;                         // à meia-noite, uma badalada a cada 1,6 s
const GOLPES = [75, 77].concat(Array.from({ length: 12 }, (_, k) => MEIA_NOITE + k * BADALADA));
const T_CORTE = MEIA_NOITE + 10 * BADALADA;   // 101: na 11ª badalada, a sala azul, e o mascarado já está lá
const T_MORTE = 113;                          // o mascarado começa a atravessar as salas, dançando
const COMPASSO_P = 0.84;                      // o compasso da valsa da perseguição (som.js)
const T_PRETA = 139;                          // ele chega à sala preta
// O final: o mascarado segura o golpe de Próspero e o tira para uma última valsa; as manchas
// aparecem e, quando ele o solta, Próspero cai. Os que vêm agarrá-lo viram bonecos dele:
// dançam todos iguais, no compasso dele, e caem um a um. Sozinho, ele faz a reverência
// e o manto cai vazio.
const T_PEGA = 141.9;                                    // ele segura o pulso de Próspero
const T_VALSA = 142.6, COMPASSO_V = 1.4;                 // a última valsa de Próspero, quatro compassos
const T_SOLTA = T_VALSA + 4 * COMPASSO_V;                // 148.2: ele o solta
const T_CORRE = 149, T_AGARRAM = 152.8, T_DOMINA = 153;  // os bravos correm, agarram e são dominados
const T_DANCA_M = 153.6, COMPASSO_M = 1.2;               // a dança macabra da corte, seis compassos
const T_FIM_DANCA = T_DANCA_M + 6 * COMPASSO_M;          // 160.8
const LINHA = [-610, -460, -310, -160, 165, 315];        // onde cada bravo dança, em volta do mascarado
const ORDEM_QUEDA = [0, 5, 1, 4, 2, 3];                  // de fora para dentro
const quedaDoBravo = ordem => T_DANCA_M + 2.4 + ORDEM_QUEDA.indexOf(ordem) * 0.8;
const T_QUEDAS = quedaDoBravo(0);                        // os das outras salas caem junto, fora de quadro
const T_REVERENCIA = 161.2, T_VAZIO = 162.9, T_APAGA = 166.5;
const X_MORTE0 = 760, X_MORTE1 = 7325, X_PROSPERO = 300, CX_RELOGIO = 6250;
// As doze badaladas: a cada duas, um corte seco para outra sala parada, do relógio
// de volta até a azul. Cada plano anda devagar para oeste, o caminho de volta pelas salas.
const PLANOS_MEIA_NOITE = [
  [CX_RELOGIO, CX_RELOGIO + 80],   // o relógio, na sala preta
  [5730, 5590],                    // violeta
  [4555, 4415],                    // branca
  [3380, 3240],                    // laranja
  [2205, 2065],                    // verde
];

// O título já está na cortina antes do clique (por isso começa em -1) e sobe para o céu quando ela abre.
const CARTELAS = [
  [-1, 5.2, 'A Máscara da Morte Rubra', 'de um conto de Edgar Allan Poe'],
  [6.5, 12, 'A Morte Rubra devastava o país havia muito tempo.'],
  [13, 18.5, 'Quem tinha as manchas escarlates no rosto morria em meia hora.'],
  [21, 27, 'O príncipe Próspero trancou-se na abadia com mil amigos.'],
  [31.5, 37, 'O mundo lá fora que cuidasse de si.'],
  [42, 47.5, 'Lá dentro, deu um baile de máscaras em sete salas.'],
  [65, 71, 'Na sétima, a preta, ninguém ousava entrar.'],
  [76.5, 81, 'A cada hora soava o relógio de ébano, e todos paravam.'],
  [85.5, 88.1, 'Meia-noite.'],
  [105.4, 111, 'Foi então que notaram um mascarado que ninguém tinha visto antes.'],
  [114, 118.5, '— Quem se atreve? — gritou o príncipe.'],
  [143.4, 147.9, 'O mascarado o tirou para dançar.', undefined, 50],
  [156.2, 160.6, 'E, um a um, os foliões foram caindo no salão da festa.', undefined, 50],
  [163.4, 167.8, 'Debaixo da mortalha não havia nada.', undefined, 50],
  [168.4, 174.6, 'E a Treva, a Ruína e a Morte Rubra estenderam seu domínio sobre tudo.', undefined, 50],
];
// o título fica no meio da cortina e depois no céu, acima do castelo; as legendas, na beira do palco
const Y_TITULO = 62, Y_LEGENDA = 674, Y_FECHADO = 330, Y_CONVITE = 505;
const TITULO = [
  { texto: 'A Máscara da Morte Rubra', tam: 46, italico: true },
  { texto: 'de um conto de Edgar Allan Poe', tam: 19, italico: true, dy: 40, palido: true },
];
const CONVITE = [{ texto: 'clique para assistir (com som)', tam: 19, palido: true }];

function tempoDanca(t) {
  let q = t;
  for (const [a, b] of PARADAS) q -= limita(t - a, 0, b - a);
  return q;
}
function paradaEm(t) {
  for (const [a, b] of PARADAS) if (t >= a && t < b) return [a, b];
  return null;
}
function xDaMorte(t) {
  const u = limita((t - T_MORTE) / (T_PRETA - T_MORTE), 0, 1);
  return mistura(X_MORTE0, X_MORTE1, mistura(u, u * u * (3 - 2 * u), 0.5));
}
function xDeProspero(t) {
  return mistura(X_PROSPERO, xDaMorte(t - 0.6) - 230, suave(115, 119.5, t));
}

// ---------- as danças ----------
// O 1, 2, 3 da valsa: desce no 1, sobe no 2 e no 3 e volta a descer no fim do 3.
function subida(u) { return suave(0.04, 0.42, u) * (1 - suave(0.78, 1, u)); }

// A perseguição é uma valsa de salão dançada pela Morte com uma dama que só existe na sombra
// (sombraDoPar), em frases de quatro compassos (COMPASSO_P, o da música):
//   1º  o passo básico: desce no 1, sobe no 2 e no 3, e o corpo balança para um lado
//   2º  um rodopio inteiro, subindo mais, com o manto abrindo
//   3º  nas frases pares ele ergue a dama no alto; nas ímpares avança inclinado, olhando para trás
//   4º  quem segura as varetas solta o boneco por um instante: ele desaba, a cabeça tomba, e no 2
//       é puxado de volta de estalo, ainda tremendo
// A mão da frente segura a dela e a outra passa na frente do peito até as costas dela; as duas
// são pontos no corpo dele (pontoDaMorte) e o cotovelo dobra sozinho até lá.
function valsaDaMorte(t) {
  const b = (t - T_MORTE) / COMPASSO_P, nb = Math.floor(b), u = b - nb, k = nb % 4, par = Math.floor(nb / 4) % 2 === 0;
  const resp = Math.sin(2 * Math.PI * b);
  const s = {
    vira: 1, abre: 0, ergue: 0, mole: 0,
    dy: 10 - 32 * subida(u),
    tomba: 0.07 * Math.sin(Math.PI * b),
    cabeca: -0.05 * Math.sin(Math.PI * b),
    manto: 0.06 * Math.sin(Math.PI * b - 1),
    frente: [126, -340 + 10 * resp],
    tras: [70, -322 + 4 * resp],
  };
  if (k === 1) {
    const r = suave(0.06, 0.94, u);
    s.vira = Math.cos(2 * Math.PI * r);
    s.abre = Math.sin(Math.PI * r);
    s.dy = 10 - 44 * subida(u);
  } else if (k === 2 && par) {
    const e = Math.sin(Math.PI * suave(0.02, 0.96, u));
    s.ergue = e;
    s.frente = [mistura(126, 104, e), mistura(-340, -478, e)];
    s.tras = [mistura(70, 92, e), mistura(-322, -436, e)];
    s.dy -= 18 * e;
  } else if (k === 2) {
    const e = Math.sin(Math.PI * u);
    s.tomba += 0.12 * e; s.cabeca -= 0.38 * e;
    s.frente = [mistura(126, 150, e), mistura(-340, -328, e)];
  } else if (k === 3) {
    const solta = suave(0, 0.05, u) * (1 - suave(0.36, 0.43, u));
    const tranco = u > 0.4 ? Math.exp(-(u - 0.4) * 9) * Math.sin((u - 0.4) * 32) : 0;
    s.mole = solta;
    s.tomba = mistura(s.tomba, 0.3, solta) - 0.06 * tranco;
    s.cabeca = mistura(s.cabeca, 0.8, solta) + 0.1 * tranco;
    s.dy = mistura(s.dy, 30, solta) - 16 * tranco;
    s.manto += 0.08 * solta;
  }
  return s;
}
// Ele avança mais no 1 de cada compasso, como quem dá o passo, e desliza no 2 e no 3.
function avancoDaValsa(t) {
  const b = (t - T_MORTE) / COMPASSO_P, u = b - Math.floor(b);
  return 1.1 * (xDaMorte(t + COMPASSO_P / 2) - xDaMorte(t - COMPASSO_P / 2)) * (suave(0, 0.7, u) - u);
}

// A última valsa, em quatro compassos (T_VALSA, COMPASSO_V), de mão dada pelo pulso que ele pegou:
//   1º  ele puxa Próspero para perto e os dois sobem e descem juntos
//   2º  ergue a mão dada e Próspero rodopia por baixo dela
//   3º  os dois giram um em volta do outro; Próspero já mole, tirado do chão, o braço solto voando.
//       Quando um passa pelo outro, os dois viram de estalo para continuar se olhando.
//   4º  o mergulho: Próspero tomba para trás, a coroa cai, e no fim do compasso ele é solto
function valsaFinal(t) {
  const xP0 = xDeProspero(T_VALSA) + 22, xD0 = X_MORTE1, c0 = (xP0 + xD0) / 2;
  const b = limita((t - T_VALSA) / COMPASSO_V, 0, 4), k = Math.min(Math.floor(b), 3), u = b - k;
  const dist = mistura(xD0 - xP0, 182, suave(0, 0.4, b)) - 22 * suave(3, 3.3, b);
  const c = c0 + 18 * Math.sin(Math.PI * b / 2);
  const th = 2 * Math.PI * suave(2.04, 2.96, b);
  return {
    b, k, u, th, prof: Math.sin(th),
    lado: Math.tanh(5 * Math.cos(th)),   // +1: Próspero à esquerda
    giroP: k === 1 ? Math.cos(2 * Math.PI * suave(1.08, 1.92, b)) : 1,
    orbita: Math.sin(Math.PI * suave(2, 3, b)),
    merg: suave(3, 3.4, b),
    dy: 8 - 22 * subida(u),
    xP: c - dist / 2 * Math.cos(th), xD: c + dist / 2 * Math.cos(th),
  };
}

// A dança macabra, em compassos de 1,2 s (o Dies irae virado valsa): no 1 todos pulam, com um
// chute para o lado em que a roda anda; no 2 caem e dão um passinho; no 3 outro, e a cabeça tomba
// de estalo para o lado, voltando no 1 seguinte. A roda anda para a direita num compasso e para a
// esquerda no outro.
function passoMacabro(t) {
  const b = Math.max(0, (t - T_DANCA_M) / COMPASSO_M), nb = Math.floor(b), u = b - nb;
  const v = u * 3, tempo = Math.min(Math.floor(v), 2), w = v - tempo, arco = 4 * w * (1 - w);
  const lado = nb % 2 ? -1 : 1, pula = tempo === 0 ? arco : 0;
  const cabeca = tempo === 2 ? 0.42 * lado * suave(0, 0.1, w) : tempo === 0 && nb > 0 ? -0.42 * lado * (1 - suave(0, 0.3, w)) : 0;
  return {
    b, nb, u, lado, pula, cabeca,
    x: -24 * Math.cos(Math.PI * b),
    dy: -44 * pula + (tempo === 1 ? 14 * Math.sin(Math.PI * Math.min(1, w * 2.5)) - 5 * arco : 0) - (tempo === 2 ? 8 * arco : 0),
    inclina: 0.09 * lado * Math.sin(Math.PI * u),
  };
}

function estadoDaMorte(t) {
  const em = { x: xDaMorte(t), vira: 1, vazio: suave(T_VAZIO, T_VAZIO + 2.2, t) };
  if (t < T_MORTE) return em;
  if (t < T_PEGA - 0.6) {
    // a perseguição; a dança congela um pouco antes da sala preta, e ele vira para Próspero
    const tt = Math.min(t, T_PRETA - 0.4), s = valsaDaMorte(tt);
    const a = suave(T_MORTE, T_MORTE + 1, t) * (1 - suave(T_PRETA - 0.5, T_PRETA + 0.2, t));
    const xEm = q => xDaMorte(q) + a * avancoDaValsa(Math.min(q, T_PRETA - 0.4));
    em.x = xEm(t);
    em.vira = mistura(s.vira, -1, suave(T_PRETA - 0.4, T_PRETA + 0.3, t));
    em.dy = s.dy * a; em.tomba = s.tomba * a; em.cabeca = s.cabeca * a; em.manto = s.manto * a;
    em.abre = s.abre * a; em.ergue = s.ergue * a;
    em.arrasto = limita(-(xEm(t + 0.02) - xEm(t - 0.02)) / 0.04 * 0.00045, -0.15, 0.15) * a;
    const w = a * (1 - s.mole);
    em.maos = [pontoDaMorte(t, em, s.tras, w), pontoDaMorte(t, em, s.frente, w)];
    return em;
  }
  em.vira = -1;
  if (t < T_VALSA) {
    // segura no ar o pulso que descia com o punhal
    const pega = suave(T_PEGA - 0.45, T_PEGA - 0.05, t);
    em.bracos = [0.1, mistura(0.1, 1.9, pega)];
    em.cotovelos = [0, 0.12 * pega];
    em.cabeca = -0.1 * pega;
    em.tomba = 0.04 * pega;
    return em;
  }
  if (t < T_SOLTA + 0.8) {
    // a última valsa: a mão da frente segura a de Próspero (daAsMaos) e a outra se abre no alto
    const w = valsaFinal(t), solta = suave(T_SOLTA, T_SOLTA + 0.5, t);
    const xW = q => valsaFinal(q).xD;
    em.x = mistura(w.xD, X_MORTE1, suave(T_SOLTA, T_SOLTA + 0.8, t));
    em.vira = -w.lado; em.chave = 664 - 20 * w.prof + 10 * w.merg;
    em.dy = w.dy * (1 - solta);
    em.tomba = (0.05 * Math.sin(Math.PI * w.b) + 0.22 * w.merg) * (1 - solta);
    em.cabeca = (-0.06 + 0.4 * w.merg) * (1 - solta);
    em.manto = 0.06 * Math.sin(Math.PI * w.b - 1);
    em.abre = 0.55 * w.orbita;
    em.arrasto = limita(-(xW(t + 0.02) - xW(t - 0.02)) / 0.04 * 0.00045, -0.15, 0.15) * (1 - solta);
    const alto = mistura(1.95 + 0.2 * Math.sin(2 * Math.PI * w.b), 2.75, Math.max(w.orbita, w.merg));
    em.bracos = [mistura(alto, 0.1, solta), mistura(1.9, 0.1, solta)];
    em.cotovelos = [mistura(0.55, 0, solta), mistura(0.12, 0, solta)];
    return em;
  }
  em.x = X_MORTE1;
  if (t < T_DOMINA) return em;
  // agarrado, ele abre os braços; a corte vira uma roda de mãos dadas e ele dança no meio dela,
  // puxando o passo (passoMacabro); a mão que fica livre quando um vizinho cai passa a reger
  const d = passoMacabro(t);
  const abre = suave(T_DOMINA, T_DOMINA + 0.3, t) * (1 - suave(T_FIM_DANCA, T_FIM_DANCA + 0.5, t));
  const rege = suave(T_DANCA_M - 0.2, T_DANCA_M + 0.4, t) * (1 - suave(T_FIM_DANCA - 0.3, T_FIM_DANCA + 0.2, t));
  const bate = Math.sin(6 * Math.PI * d.b);   // um balanço por tempo, como quem rege
  em.x += d.x * rege;
  em.dy = -26 * Math.sin(Math.PI * d.u) * rege;
  em.tomba = -0.06 * d.lado * Math.sin(Math.PI * d.u) * rege;
  em.cabeca = -d.cabeca * rege;
  em.manto = 0.05 * d.lado * Math.sin(Math.PI * d.u) * rege;
  em.pula = d.pula * 0.5 * rege;
  em.bracos = [0, 1].map(() => mistura(0.1, 2.3 + 0.28 * rege * bate, abre));
  em.cotovelos = [0, 1].map(() => mistura(0, 0.3 + 0.25 * rege * bate, abre));
  // sozinho, a reverência: inclina para a frente, um braço se abre e o outro passa na frente da cintura
  const rev = suave(T_REVERENCIA, T_REVERENCIA + 0.7, t) * (1 - suave(T_REVERENCIA + 1.1, T_REVERENCIA + 1.6, t));
  if (rev > 0) {
    em.tomba = mistura(em.tomba, 0.14, rev); em.cabeca += 0.55 * rev; em.dy = mistura(em.dy, 26, rev);
    em.bracos = [mistura(em.bracos[0], 1.5, rev), mistura(em.bracos[1], -0.7, rev)];
    em.cotovelos = [mistura(em.cotovelos[0], 0.45, rev), mistura(em.cotovelos[1], -0.95, rev)];
  }
  return em;
}

function cameraEm(t) {
  if (t < PARADAS[0][0]) return CX_RELOGIO * suave(T_DENTRO + 0.5, PARADAS[0][0] - 2, t);
  if (t < MEIA_NOITE) return CX_RELOGIO;
  if (t < T_CORTE) {
    const dur = 2 * BADALADA;
    const k = Math.min(Math.floor((t - MEIA_NOITE) / dur), PLANOS_MEIA_NOITE.length - 1);
    const [a, b] = PLANOS_MEIA_NOITE[k];
    return mistura(a, b, (t - MEIA_NOITE - k * dur) / dur);
  }
  if (t < T_MORTE) return 60 * suave(T_CORTE + 1, T_MORTE, t);
  return limita(xDaMorte(t) - 700, 60, CX_MAX);
}
// A hora no relógio de ébano: 10h na primeira parada e meia-noite na segunda.
// Entre as duas, os ponteiros correm duas horas em três segundos e meio: a festa passa depressa.
const HORAS = [[T_DENTRO, 9.62], [75, 10], [81.5, 10.01], [MEIA_NOITE, 12], [PARADAS[1][1], 12.02], [DUR, 12.3]];
function horaDoRelogio(t) {
  for (let i = 1; i < HORAS.length; i++) {
    const [t0, h0] = HORAS[i - 1], [t1, h1] = HORAS[i];
    if (t <= t1) return mistura(h0, h1, suave(t0, t1, t) * 0.25 + limita((t - t0) / (t1 - t0), 0, 1) * 0.75);
  }
  return HORAS[HORAS.length - 1][1];
}
// No começo não há fade: quem revela o filme é a cortina.
function escuro(t) {
  let f = 1;
  f = Math.min(f, 1 -suave(T_DENTRO - 1.6, T_DENTRO - 0.1, t) + suave(T_DENTRO, T_DENTRO + 1.5, t));
  return Math.min(f, 1 - suave(DUR - 3.5, DUR - 0.6, t));
}

// ---------- elenco e camadas ----------

let fundo, frente, sombraCv, sombraCtx, parCv, pendulo, fx;
// raios volumétricos: máscara do vidro aceso (2D) e o passe que espalha a luz (WEBGL), em meia resolução
const RW2 = W / 2, RH2 = H / 2;
let mascara, raiosG, fxRaios;
let figuras = [], bravos = [], cortejo = [], prospero, morte, dama, poeira = [];
let estado = 'espera', tFixo = null, mudo = false, pausado = false, tBase = 0, tPausa = 0, tFim = 0;

function setup() {
  createCanvas(W, H);
  pixelDensity(1);
  fibra = criaFibra();
  cortina = criaCortina();
  criaLegendas();
  fundo = criaFundo();
  frente = criaFrente();
  exterior = criaFora();
  pendulo = criaPendulo();
  sombraCv = document.createElement('canvas');
  sombraCv.width = W; sombraCv.height = H;
  sombraCtx = sombraCv.getContext('2d');
  parCv = document.createElement('canvas');
  parCv.width = W; parCv.height = H;

  // seis convidados por sala; na preta, ninguém
  const zonas = [[70, 900], [1162, 2042], [2337, 3217], [3512, 4392], [4687, 5567], [5862, 6742]];
  const fundos = [0.2, 0.9, 0.45, 1.0, 0.1, 0.75];
  let id = 1;
  zonas.forEach(([a, b], z) => {
    for (let k = 0; k < 6; k++) {
      let x = a + (k + 0.5) * (b - a) / 6;
      if (z === 0 && Math.abs(x - X_PROSPERO) < 90) x += 110;
      const f = criaFigura(id, x, fundos[(k + z) % 6], PALETAS[(id * 4 + z) % PALETAS.length]);
      f.sala = z; f.ordem = k;
      figuras.push(f);
      if (z === 5) bravos.push(f);
      id++;
    }
  });
  prospero = criaProspero(X_PROSPERO);
  criaPeste(prospero, 401);
  bravos.forEach((f, k) => criaPeste(f, 411 + k));
  morte = criaMorte();
  dama = criaFigura(300, 0, 0.55, PALETAS[6], { mulher: true });
  for (let k = 1; k <= 4; k++) cortejo.push(criaFigura(70 + k, 0, [0.6, 1.0, 0.5, 0.9][k - 1], PALETAS[(k * 2) % PALETAS.length]));

  const r = gerador(5);
  SALAS.forEach((s, i) => {
    for (let k = 0; k < 44; k++) poeira.push({ x: JANELAS[i] - 320 + r() * 460, y: r() * 430, v: 0.15 + r() * 0.5, f: r() * 100, t: 1 + r() * 1.6, rgb: s.feixe });
  });
  fx = createFilterShader(FRAG);
  mascara = createGraphics(RW2, RH2);
  mascara.pixelDensity(1);
  raiosG = createGraphics(RW2, RH2, WEBGL);
  raiosG.pixelDensity(1);
  fxRaios = raiosG.createFilterShader(FRAG_RAIOS);

  const par = new URLSearchParams(location.search);
  if (par.get('t') !== null) { tFixo = parseFloat(par.get('t')); estado = 'filme'; }
  else if (par.get('fim') !== null) { estado = 'fim'; tFim = -parseFloat(par.get('fim') || 0) * 1000; }   // para conferir a tela final
  else if (par.get('mudo') !== null) { mudo = true; comeca(); }
}

function comeca() {
  estado = 'filme'; pausado = false; tBase = millis();
  if (!mudo && tFixo === null) ligaSom();
}
function tempoAtual() {
  if (tFixo !== null) return tFixo;
  if (estado === 'espera') return 0;
  return ((pausado ? tPausa : millis()) - tBase) / 1000;
}

// ---------- cada quadro ----------

function draw() {
  let t = tempoAtual();
  if (estado === 'filme' && tFixo === null && t >= DUR) { estado = 'fim'; tFim = millis(); fechaCortinaSom(); }
  if (estado === 'fim') { telaFinal(); return; }
  if (estado === 'espera') { telaDeEspera(); return; }
  t = limita(t, 0, DUR - 0.01);
  if (estado === 'filme' && !pausado) tocaSom(t);

  const pose = Math.floor(t * 12);          // o grão e a poeira mudam 12 vezes por segundo
  let luz = t < T_DENTRO ? cenaDeFora(t, pose) : cenaDeDentro(t, pose);

  // a cortina abrindo, na frente do filme e atrás da tábua do palco
  const ab = suave(CORTINA.abre[0], CORTINA.abre[1], t);
  if (ab < 1) {
    desenhaCortina(ab, t);
    g.drawImage(exterior.tabua, 0, 0);
    luz = { ...luz, amb: luz.amb.map((v, i) => mistura(AMB_CORTINA[i], v, ab)), luzes: luz.luzes.map(l => ({ ...l, z: l.z * ab })) };
  }

  const par = paradaEm(t);
  let palidez = 0;
  if (par) palidez = suave(par[0], par[0] + 0.5, t);
  else for (const [, b] of PARADAS) if (t >= b && t < b + 1.5) palidez = 1 - suave(b, b + 1.5, t);
  if (t >= T_CORTE) palidez = Math.max(palidez, 0.22 + 0.4 * suave(T_PRETA, T_APAGA, t));
  let golpe = 0;
  for (const tg of GOLPES) if (t >= tg) golpe = Math.max(golpe, Math.exp(-(t - tg) * 3.2));
  aplicaFiltro(luz, pose, palidez, golpe, escuro(t));

  // legendas, por cima do filtro
  CARTELAS.forEach(([a, b, frase, sub, y], i) => {
    if (t <= a || t >= b) return;
    const titulo = sub !== undefined;
    const tau = t - a, dur = b - a;
    const alfa = suave(0, 0.18, tau) * (1 - suave(dur - 0.2, dur, tau)) * Math.min(1, escuro(t) * 1.4);
    if (titulo) legenda(TITULO, mistura(Y_FECHADO, Y_TITULO, suave(0.5, 2.6, t)), tau, dur, i + 1, alfa);
    else legenda([{ texto: frase, tam: 29 }], y ?? Y_LEGENDA, tau, dur, i + 1, alfa);
  });
  // o convite da cortina se quebra logo depois do clique
  if (t < 0.7) legenda(CONVITE, Y_CONVITE, 20 + t, 20.7, 99, 0.9 * (1 - suave(0.5, 0.7, t)));
}

function aplicaFiltro(luz, pose, palidez, golpe, fade) {
  fx.setUniform('uRes', [W, H]);
  fx.setUniform('uPose', pose % 997);
  fx.setUniform('uPalidez', palidez);
  fx.setUniform('uGolpe', golpe);
  fx.setUniform('uFade', fade);
  fx.setUniform('uAmb', luz.amb);
  fx.setUniform('uFoco', luz.foco || [0.6, 1]);
  for (let i = 0; i < 3; i++) {
    const l = luz.luzes[i] || { x: 0, y: 0, z: 0, cor: [0, 0, 0] };
    fx.setUniform('uL' + (i + 1), [l.x / W, l.y / H, l.z]);
    fx.setUniform('uC' + (i + 1), l.cor);
  }
  filter(fx);
  g = drawingContext;
  g.setTransform(1, 0, 0, 1, 0, 0);
}

// Antes do clique: a cortina fechada balançando, o título e o convite.
function telaDeEspera() {
  const s = millis() / 1000;
  g = drawingContext;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  desenhaCortina(0, s);
  g.drawImage(exterior.tabua, 0, 0);
  aplicaFiltro({ amb: AMB_CORTINA, luzes: [], foco: [0.5, 0.35] }, Math.floor(s * 12), 0, 0, 1);
  legenda(TITULO, Y_FECHADO, 1 + s, 0, 1);
  legenda(CONVITE, Y_CONVITE, 1 + s, 0, 99, 0.6 + 0.3 * Math.sin(s * 2.4));
}

// Depois do último quadro: a cortina fecha de novo e aparece o "Fim".
function telaFinal() {
  const s = (millis() - tFim) / 1000;
  g = drawingContext;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = '#050307'; g.fillRect(0, 0, W, H);
  desenhaCortina(1 - suave(0.2, 2.6, s), s);
  g.drawImage(exterior.tabua, 0, 0);
  aplicaFiltro({ amb: AMB_CORTINA, luzes: [], foco: [0.5, 0.35] }, Math.floor(s * 12), 0, 0, suave(0, 1.6, s));
  if (s > 2.4) legenda([{ texto: 'Fim', tam: 54, italico: true }], Y_FECHADO, s - 2.4, 0, 3, suave(2.4, 2.6, s));
  if (s > 3) legenda([{ texto: 'um teatro de varetas de Angel Mansilla, a partir do conto de Edgar Allan Poe', tam: 17, italico: true, palido: true }], Y_FECHADO + 64, s - 3, 0, 97, suave(3, 3.3, s) * 0.85);
  if (s > 3.4) legenda([{ texto: 'clique para ver de novo', tam: 19, palido: true }], Y_CONVITE, s - 3.4, 0, 98, suave(3.4, 3.6, s) * (0.6 + 0.3 * Math.sin(s * 2.4)));
}

function desenhaSombras(lista, cx, alfa) {
  g = sombraCtx;
  modoSombra = true;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, W, H);
  g.translate(-cx + 40, 24);
  for (const it of lista) it.des();
  modoSombra = false;
  g = drawingContext;
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.filter = 'blur(13px)';
  g.globalAlpha = alfa;
  g.drawImage(sombraCv, 0, 0);
  g.restore();
}

function estadoDoConvidado(f, t, c) {
  const est = { animo: c.animo, parado: c.parado, assenta: c.assenta };
  const bravo = f.sala === 5;
  if (t >= T_CORTE && !(bravo && t >= T_CORRE)) est.medoDe = t > 116 ? [c.xm, c.xp] : [c.xm];
  const tq = bravo ? quedaDoBravo(f.ordem) : T_QUEDAS + 0.4 + (f.id % 5) * 0.5;
  if (bravo && t >= T_CORRE) {
    // os que tomam coragem e entram na sala preta para agarrar o mascarado
    const alvo = X_MORTE1 + [-250, -185, -120, -72, 112, 178][f.ordem];
    const u = suave(T_CORRE + f.ordem * 0.3, T_CORRE + 2.3 + f.ordem * 0.2, t);
    est.x = mistura(f.x0, alvo, u);
    est.andando = u > 0 && u < 1;
    est.erguer = suave(T_AGARRAM - 1.4, T_AGARRAM, t);
    est.alvoBraco = [1.65, 0.1];
    est.animo = 0.1;
    if (t >= T_DOMINA) {
      // ele abre os braços e eles viram bonecos dele: são atirados em roda, dão as mãos
      // (daAsMaos) e dançam todos iguais, cada um um pouco depois do vizinho mais perto dele,
      // como uma onda que sai do mascarado pelas mãos, até caírem um a um
      const d = passoMacabro(Math.max(T_DANCA_M, Math.min(t, tq)) - 0.06 * DISTANCIA_NA_RODA[f.ordem]);
      const entra = suave(T_DOMINA + 0.15, T_DANCA_M + 0.3, t), chuta = d.nb % 2;
      est.x = mistura(alvo, X_MORTE1 + LINHA[f.ordem], suave(T_DOMINA, T_DOMINA + 0.5, t)) + d.x * entra;
      est.andando = false;
      est.animo = 0;
      est.vira = mistura(f.lado, 1, suave(T_DOMINA, T_DOMINA + 0.35, t));
      est.dy = d.dy * entra;
      est.pula = d.pula * entra;
      est.inclina = d.inclina * f.lado * entra;
      est.cabeca = d.cabeca * entra + 0.5 * suave(tq - 0.12, tq, t) * (f.ordem % 2 ? 1 : -1);
      est.pernas = [0, 1].map(i => (i === chuta ? -0.85 : 0.3) * d.lado * d.pula * entra);
      est.canelas = [0, 1].map(i => (i === chuta ? -0.1 : 1.0) * d.lado * d.pula * entra);
      est.saia = -0.16 * d.lado * d.pula * entra;
      est.erguer = 1;
      est.alvoBraco = [mistura(1.65, 2.5 + 0.15 * Math.sin(6 * Math.PI * d.b), entra), mistura(0.1, -0.35, entra)];
      est.outroBraco = [mistura(0.9, 2.3 + 0.15 * Math.sin(6 * Math.PI * d.b + 1), entra), mistura(0.3, -0.25, entra)];
      est.peste = suave(tq - 1.3, tq - 0.1, t);
    }
  }
  est.queda = suave(tq, tq + 1.3, t);
  est.dirQueda = f.id % 2 ? 1 : -1;
  return est;
}

function estadoDeProspero(t, c) {
  const est = { animo: 0.22, baixos: 0.5, parado: c.parado, assenta: c.assenta, punhal: t >= 112 };
  if (t >= T_CORTE) {
    est.baixos = 0;
    est.erguer = suave(105.5, 107.4, t);
    est.alvoBraco = [mistura(1.75, 2.7, suave(112, 114.5, t)), mistura(0, -0.3, suave(112, 114.5, t))];
    est.inclina = 0.05;
  }
  if (t >= 115) {
    // ele alcança o mascarado, dá o bote com o punhal no alto e desce o golpe, que é seguro no ar
    const bote = suave(140.4, 141.6, t), golpe = suave(T_PEGA - 0.6, T_PEGA, t);
    est.x = xDeProspero(t) + 22 * bote;
    est.andando = t < 139.8;
    est.inclina = est.andando ? 0.1 : 0.1 + 0.1 * bote - 0.14 * suave(T_PEGA, T_PEGA + 0.5, t);
    est.animo = 0.1;
    est.alvoBraco = [mistura(2.7, 2.05, golpe), mistura(-0.3, 0.15, golpe)];
    est.punhalCai = limita((t - (T_PEGA + 0.3)) / 0.9, 0, 1);
  }
  if (t >= T_VALSA) {
    // a última valsa: de mão presa (daAsMaos), vai amolecendo e as manchas aparecem; no rodopio
    // a capa abre, no giro ele sai do chão com o braço solto voando, no mergulho tomba para trás
    // e a coroa cai; quando o mascarado o solta, quem segura as varetas larga
    const w = valsaFinal(t), peste = suave(T_VALSA + 0.5, T_SOLTA - 0.7, t);
    const rodopio = w.k === 1 ? Math.sin(2 * Math.PI * suave(1.08, 1.92, w.b)) : 0;
    est.x = w.xP; est.vira = w.lado * w.giroP; est.chave = 668 + 20 * w.prof - 10 * w.merg;
    est.animo = 0.05;
    est.dy = w.dy - 34 * w.orbita + 34 * w.merg - 10 * peste * (1 - w.merg);
    est.erguer = 1; est.alvoBraco = [2.2, -0.1];
    est.outroBraco = [mistura(0.45 + 0.25 * Math.sin(Math.PI * w.b), 1.75, Math.max(w.orbita, Math.abs(rodopio))) + 0.5 * w.merg, 0.3 + 0.3 * peste];
    est.inclina = -0.04 - 0.08 * peste - 0.14 * w.orbita - 0.5 * w.merg;
    est.cabeca = (0.08 + 0.3 * peste) * Math.sin(Math.PI * w.b + 0.5) - 0.12 * w.orbita - 0.55 * w.merg;
    est.saia = 0.3 * rodopio + 0.22 * w.orbita * w.lado;
    est.peste = peste;
    est.chapeuCai = limita((t - (T_SOLTA - 0.5)) / 1.0, 0, 1);
    est.queda = suave(T_SOLTA + 0.1, T_SOLTA + 1.5, t);
    est.dirQueda = -1;
  }
  return est;
}

// As mãos que se dão: o pulso de Próspero preso na mão do mascarado e, na dança macabra, a roda.
// Cada par combina um ponto entre os dois ombros, ao alcance dos dois braços, e as duas mãos vão
// até ele (desenhaFigura e desenhaMorte dobram os cotovelos sozinhos).
const RODA = [0, 1, 2, 3, -1, 4, 5];            // da esquerda para a direita; -1 é o mascarado
const DISTANCIA_NA_RODA = [4, 3, 2, 1, 1, 2];   // de cada bravo até o mascarado, contando mãos
function daAsMaos(t, em, estP, ests) {
  if (!em) return;
  if (t >= T_PEGA - 0.05 && t < T_SOLTA + 0.4) {
    const solta = 1 - suave(T_SOLTA, T_SOLTA + 0.2, t);
    let M = maoDaMorte(morte, t, em.x, em, 1);
    if (t >= T_VALSA) {
      const w = valsaFinal(t);
      const sD = ombroDaMorte(morte, t, em.x, em, 1).transformPoint(new DOMPoint(0, 0));
      const sP = ombrosDaFigura(prospero, estP)[1], rP = alcanceDaFigura(prospero);
      const ergue = w.k === 1 ? 45 * Math.sin(Math.PI * suave(0, 0.9, w.u)) : 0;
      let V = { x: mistura(sD.x, sP.x, ALCANCE_MORTE / (ALCANCE_MORTE + rP)), y: mistura(sD.y, sP.y, 0.5) - 72 - ergue + 60 * w.merg };
      V = aoAlcance(aoAlcance(V, sP, rP), sD, ALCANCE_MORTE);
      const e = suave(T_VALSA, T_VALSA + 0.35, t);
      M = { x: mistura(M.x, V.x, e), y: mistura(M.y, V.y, e) };
      (em.maos ??= [])[1] = { x: M.x, y: M.y, w: solta };
    }
    (estP.maos ??= [])[1] = { x: M.x, y: M.y, w: suave(T_PEGA - 0.05, T_PEGA + 0.03, t) * solta };
  }
  const forma = suave(T_DANCA_M - 0.3, T_DANCA_M + 0.1, t);
  if (forma <= 0 || t > T_FIM_DANCA + 1) return;
  const elos = RODA.map(k => {
    if (k < 0) return { est: em, ombros: [0, 1].map(i => ombroDaMorte(morte, t, em.x, em, i).transformPoint(new DOMPoint(0, 0))), raio: ALCANCE_MORTE, tq: 1e9 };
    const est = ests.get(bravos[k]);
    return est && { est, ombros: ombrosDaFigura(bravos[k], est), raio: alcanceDaFigura(bravos[k]), tq: quedaDoBravo(k) };
  });
  for (let n = 0; n + 1 < elos.length; n++) {
    const A = elos[n], B = elos[n + 1];
    if (!A || !B) continue;
    const w = forma * (1 - suave(A.tq, A.tq + 0.12, t)) * (1 - suave(B.tq, B.tq + 0.12, t));
    if (w <= 0) continue;
    const iA = A.ombros[0].x > A.ombros[1].x ? 0 : 1, iB = B.ombros[0].x < B.ombros[1].x ? 0 : 1;
    const sA = A.ombros[iA], sB = B.ombros[iB];
    const sobe = (A.est.pula ?? 0) + (B.est.pula ?? 0);   // no pulo as mãos dadas sobem
    let M = { x: mistura(sA.x, sB.x, A.raio / (A.raio + B.raio)), y: mistura(sA.y, sB.y, 0.5) + 38 - 30 * sobe };
    M = aoAlcance(aoAlcance(M, sA, A.raio), sB, B.raio);
    (A.est.maos ??= [])[iA] = { x: M.x, y: M.y, w };
    (B.est.maos ??= [])[iB] = { x: M.x, y: M.y, w };
  }
}

// Cenas 2 a 6: dentro da abadia.
function cenaDeDentro(t, pose) {
  const cx = cameraEm(t), cf = cx * P_FUNDO;
  const par = paradaEm(t);
  const c = {
    animo: t < MEIA_NOITE ? 1 : 0.15,
    parado: !!par,
    assenta: par ? Math.exp(-(t - par[0]) * 1.7) * Math.sin((t - par[0]) * 7.5) : 0,
    xm: xDaMorte(t), xp: xDeProspero(t),
  };
  const tq = tempoDanca(t);
  const lista = [], ests = new Map();
  for (const f of figuras) {
    const perto = Math.abs(f.x0 - (cx + W / 2)) < 980 || (f.sala === 5 && t >= T_CORRE);
    if (!perto) continue;
    const est = estadoDoConvidado(f, t, c);
    ests.set(f, est);
    lista.push({ y: f.y, des: () => desenhaFigura(f, tq, t, est) });
  }
  const estP = estadoDeProspero(t, c);
  if (Math.abs((estP.x ?? X_PROSPERO) - (cx + W / 2)) < 980) lista.push({ y: estP.chave ?? prospero.y, des: () => desenhaFigura(prospero, tq, t, estP) });
  let em = null, sobe = 0;
  if (t >= T_CORTE) {
    em = estadoDaMorte(t);
    lista.push({ y: em.chave ?? morte.y, des: () => desenhaMorte(morte, t, em.x, em) });
    sobe = suave(T_MORTE + 0.2, T_MORTE + 1.6, t) * (1 - suave(T_PRETA - 0.8, T_PRETA + 0.3, t));
  }
  daAsMaos(t, em, estP, ests);
  lista.sort((a, b) => a.y - b.y);

  g = drawingContext;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  g.drawImage(fundo, cf, 0, W, H, 0, 0, W, H);

  // plano do telão: pêndulo, sombra dos bonecos, feixes e poeira
  g.save();
  g.translate(-cf, 0);
  g.translate(RELOGIO, CHAO + 16 - 312);
  g.rotate(Math.sin(Math.min(t, T_APAGA) * Math.PI) * 0.17 * (1 - suave(T_APAGA - 2.5, T_APAGA, t)));
  poe(pendulo.haste); poe(pendulo.disco); poe(pendulo.miolo, { semSombra: true });
  g.restore();
  {
    const h = horaDoRelogio(t);
    g.save();
    g.translate(RELOGIO - cf, CHAO + 16 - 418);
    g.save(); g.rotate(h / 12 * Math.PI * 2); poe(pendulo.hora, { semSombra: true }); g.restore();
    g.save(); g.rotate((h % 1) * Math.PI * 2); poe(pendulo.minuto, { semSombra: true }); g.restore();
    poe(pendulo.eixo, { semSombra: true });
    g.restore();
  }

  desenhaSombras(lista, cx, 0.62);
  if (sobe > 0) sombraDoPar(cx, em, sobe, tq, t);

  // as luzes: os três vitrais mais próximos da câmera; no fim, os braseiros se apagam
  const acesa = 1 - suave(T_APAGA, T_APAGA + 5, t);
  const luzes = JANELAS.map((jx, i) => ({ x: jx - cf, y: 300, cor: SALAS[i].luz, feixe: SALAS[i].feixe, jx, i }))
    .sort((a, b) => Math.abs(a.x - W / 2) - Math.abs(b.x - W / 2)).slice(0, 3);
  for (const l of luzes) l.z = (1 - suave(1000, 1400, Math.abs(l.x - W / 2))) * acesa;

  g.save();
  g.translate(-cf, 0);
  g.globalAlpha = acesa;
  for (const l of luzes) if (l.z > 0) feixes(l.jx - BRASEIRO[l.i] * 0.5, l.feixe, pose);   // onde o feixe toca o chão
  desenhaPoeiraPerto(pose, cf);
  g.restore();
  raiosDoQuadro(cx, cf, luzes, t);
  poeRaios(1);

  // plano dos bonecos, na frente
  g.save();
  g.translate(-cx, 0);
  for (const it of lista) it.des();
  g.restore();
  poeRaios(0.16);

  g.drawImage(frente, Math.round(cx * P_FRENTE), 0, W, H, 0, 0, W, H);
  const a = 0.25 + 0.75 * acesa;
  return { amb: [0.47 * a, 0.43 * a, 0.56 * a], luzes };
}

// Na perseguição, a luz baixa joga na parede uma sombra grande do mascarado valsando, e na
// sombra ele dança com uma dama que não está no palco. Ela sobe de baixo quando ele começa e
// afunda quando ele chega à sala preta; fica sempre na frente dele, de mão dada com a mão da
// frente dele, balança junto, gira junto no rodopio e é erguida quando ele a ergue.
function sombraDoPar(cx, em, sobe, tq, t) {
  const c = parCv.getContext("2d"), k = 1.15, X = em.x - cx, Y = morte.y;
  const est = {
    x: em.x + 130 * em.vira, vira: -em.vira, animo: 0.15,
    dy: (em.dy ?? 0) - 95 * (em.ergue ?? 0) + (1 - sobe) * 560,
    inclina: -(em.tomba ?? 0) * dama.lado * 0.8, saia: 0.35 * (em.abre ?? 0) * Math.sign(em.vira),
  };
  const H = em.maos && em.maos[1] ? em.maos[1] : maoDaMorte(morte, t, em.x, em, 1);
  const om = ombrosDaFigura(dama, est), i = Math.abs(om[0].x - em.x) < Math.abs(om[1].x - em.x) ? 0 : 1;
  est.maos = [];
  est.maos[i] = { x: H.x, y: H.y, w: 1 };
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, W, H);
  c.setTransform(k, 0, 0, k, X + 30 - k * em.x, Y - 150 - k * Y);
  const tela = g;
  g = c; modoSombra = true;
  desenhaFigura(dama, tq, t, est);
  desenhaMorte(morte, t, em.x, em);
  modoSombra = false; g = tela;
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.filter = 'blur(3px)';
  g.globalAlpha = 0.8;
  g.drawImage(parCv, 0, 0);
  g.restore();
}

// Deslocamento horizontal do braseiro de cada sala em relação ao vitral, em px.
const BRASEIRO = [-260, 230, -210, 250, -240, 220, 300];
// Força dos feixes por sala: o vidro branco é claro demais, e o vermelho da sala preta manda.
const FORCA_RAIO = [0.9, 0.85, 0.9, 0.85, 0.42, 0.85, 1.15];
// O braseiro atrás de cada vitral treme um pouco, como fogo.
function chama(t, i) {
  return 0.9 + 0.06 * Math.sin(t * 7.3 + i * 2.1) + 0.04 * Math.sin(t * 12.7 + i * 5.3);
}

// Raios volumétricos. A máscara é o vidro aceso de cada vitral, e tudo o que fica
// entre ele e a câmera (bonecos, varetas, colunas da frente) entra em preto. O shader
// FRAG_RAIOS espalha essa luz a partir do centro de cada vitral, então cada boneco
// que passa na frente da janela recorta um raio de sombra no ar.
function raiosDoQuadro(cx, cf, luzes, t) {
  const m = mascara.drawingContext;
  m.setTransform(1, 0, 0, 1, 0, 0);
  m.globalCompositeOperation = 'source-over';
  m.globalAlpha = 1;
  m.fillStyle = '#000'; m.fillRect(0, 0, RW2, RH2);
  m.setTransform(RW2 / W, 0, 0, RH2 / H, 0, 0);
  for (const l of luzes) if (l.z > 0) m.drawImage(VIDROS[l.i], l.jx - cf - 100, 138);
  m.drawImage(sombraCv, -40, -24);           // a silhueta dos bonecos, sem o deslocamento da sombra
  m.drawImage(frente, Math.round(cx * P_FRENTE), 0, W, H, 0, 0, W, H);

  raiosG.background(0);
  raiosG.image(mascara, -RW2 / 2, -RH2 / 2, RW2, RH2);
  fxRaios.setUniform('uRes', [RW2, RH2]);
  fxRaios.setUniform('uTempo', t);
  fxRaios.setUniform('uCam', cx / W);
  for (let k = 0; k < 3; k++) {
    const l = luzes[k];
    fxRaios.setUniform('uL' + (k + 1), l && l.z > 0 ? [l.x / W, l.y / H, l.z * chama(t, l.i) * FORCA_RAIO[l.i]] : [0, 0, 0]);
    // o braseiro fica alto, atrás da janela, ora à direita ora à esquerda: os feixes descem inclinados
    fxRaios.setUniform('uS' + (k + 1), l ? [(l.x + BRASEIRO[l.i]) / W, (l.y - 700) / H] : [0, 0]);
  }
  raiosG.filter(fxRaios);
}

// A luz no ar entra na imagem antes do filtro principal, que ainda põe foco, grão e palidez.
// (No p5 2.3.4, um filtro do canvas 2D não aceita uma segunda textura: setUniform quebra em getTexture.)
// Os feixes vão atrás dos bonecos, para não lavar as cores deles; na frente, só um véu.
function poeRaios(alfa) {
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'screen';
  g.globalAlpha = alfa;
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = 'high';
  g.drawImage(raiosG.elt, 0, 0, W, H);
  g.restore();
}

function desenhaPoeiraPerto(pose, cf) {
  g.save();
  g.globalCompositeOperation = 'screen';
  for (const d of poeira) {
    if (d.x < cf - 40 || d.x > cf + W + 40) continue;
    const x = d.x + Math.sin(pose * 0.03 + d.f) * 18;
    const y = 250 + ((d.y + pose * d.v) % 430);
    g.fillStyle = `rgba(${d.rgb}, ${0.2 + 0.3 * acaso(d.f, Math.floor(pose / 3))})`;
    g.fillRect(x, y, d.t, d.t);
  }
  g.restore();
}

// ---------- legendas: amarelas, sem fundo, corrompidas pela peste ----------
// Cada legenda entra se decifrando, sai se quebrando e, enquanto está na tela, de vez em
// quando falha por um instante: letras trocadas por símbolos (algumas em vermelho), a imagem
// partida em faixas que escorregam e um fantasma vermelho e outro ciano desencontrados.
// Tudo depende só do tempo da legenda (tau), então o ?t= mostra sempre o mesmo quadro.
const AMARELO = '#f6d43a', AMARELO_PALIDO = '#eee0a2', RUBRO = '#e0332b';
const GLIFOS = '#%&@$*+=<>/\\|{}[]~^§¶†‡ØæœßŁđŧ¥¤0127'.split('');
const LEG_H = 170, LEG_Y = 74;            // altura do canvas da legenda e onde fica a 1ª linha nele
let legCv, legCtx, tintaCv, tintaCtx;
const medidasLeg = new Map();

function criaLegendas() {
  legCv = document.createElement('canvas'); legCv.width = W; legCv.height = LEG_H;
  legCtx = legCv.getContext('2d');
  tintaCv = document.createElement('canvas'); tintaCv.width = W; tintaCv.height = LEG_H;
  tintaCtx = tintaCv.getContext('2d');
}
function medeLinha(l) {
  const f = `${l.italico ? 'italic ' : ''}${l.tam}px Georgia, "Times New Roman", serif`;
  const chave = f + '|' + l.texto;
  let m = medidasLeg.get(chave);
  if (!m) {
    legCtx.font = f;
    const xs = [];
    for (let i = 0; i <= l.texto.length; i++) xs.push(legCtx.measureText(l.texto.slice(0, i)).width);
    m = { f, xs, larg: xs[l.texto.length] };
    medidasLeg.set(chave, m);
  }
  return m;
}

function falhaDaLegenda(tau, dur, sem) {
  const entra = 1 - suave(0, 0.65, tau);
  const sai = dur > 0 ? suave(dur - 0.75, dur - 0.05, tau) : 0;
  // a cada 1,3 s, mais ou menos metade das vezes, uma falha curta num instante sorteado
  const j = Math.floor(tau / 1.3), fase = tau - j * 1.3;
  const ini = 0.15 + acaso(sem, j, 1) * 0.9, fim = ini + 0.1 + acaso(sem, j, 2) * 0.16;
  const rajada = acaso(sem, j, 3) < 0.55 && fase > ini && fase < fim ? 0.45 + 0.55 * acaso(sem, Math.floor(tau * 24), 4) : 0;
  return { entra, sai, rajada, forca: Math.max(entra, sai, rajada * 0.55) };
}

// linhas: [{texto, tam, italico, palido, dy}]; y: centro da 1ª linha na tela.
function legenda(linhas, y, tau, dur, sem, alfa = 1) {
  if (alfa <= 0.01) return;
  const fl = falhaDaLegenda(tau, dur, sem);
  const quadro = Math.floor(tau * 24);              // a falha muda 24 vezes por segundo
  const c = legCtx;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, W, LEG_H);
  c.textBaseline = 'middle';
  c.textAlign = 'center';
  c.lineJoin = 'round';
  const letras = [];
  linhas.forEach((l, li) => {
    const m = medeLinha(l), n = l.texto.length;
    const x0 = W / 2 - m.larg / 2, yl = LEG_Y + (l.dy || 0);
    for (let i = 0; i < n; i++) {
      const ch = l.texto[i];
      if (ch === ' ') continue;
      const ordem = 0.6 * i / n + 0.4 * acaso(sem, i, li + 5);
      let estrago = 0;                              // 0 inteira, 1 trocada, 2 sumida
      if (1 - fl.entra < ordem) estrago = acaso(sem + i, quadro, 6) < 0.35 ? 2 : 1;
      else if (fl.sai > 0.5 * acaso(sem, i, li + 9) + 0.5 * i / n) estrago = acaso(sem + i, quadro, 7) < fl.sai * 0.7 ? 2 : 1;
      else if (fl.rajada && acaso(sem * 3 + i, quadro, 8) < fl.rajada * 0.2) estrago = 1;
      if (estrago === 2) continue;
      const troca = estrago === 1;
      letras.push({
        f: m.f, lw: Math.max(3, l.tam * 0.15), x: x0 + (m.xs[i] + m.xs[i + 1]) / 2, y: yl,
        s: troca ? GLIFOS[Math.floor(acaso(sem + i * 1.7, quadro, 10) * GLIFOS.length)] : ch,
        cor: troca && acaso(sem + i, quadro, 11) < 0.5 ? RUBRO : (l.palido ? AMARELO_PALIDO : AMARELO),
      });
    }
  });
  // primeiro o contorno escuro de todas as letras, depois o amarelo, para um não comer o outro
  c.strokeStyle = 'rgba(14, 6, 8, 0.92)';
  c.shadowColor = 'rgba(0, 0, 0, 0.75)'; c.shadowBlur = 8; c.shadowOffsetY = 2;
  for (const L of letras) { c.font = L.f; c.lineWidth = L.lw; c.strokeText(L.s, L.x, L.y); }
  c.shadowColor = 'rgba(0, 0, 0, 0)'; c.shadowBlur = 0; c.shadowOffsetY = 0;
  for (const L of letras) { c.font = L.f; c.fillStyle = L.cor; c.fillText(L.s, L.x, L.y); }

  const gm = drawingContext;
  gm.save();
  gm.setTransform(1, 0, 0, 1, 0, 0);
  const topo = Math.round(y - LEG_Y), F = fl.forca;
  if (F > 0.03) {
    // fantasmas de cor desencontrados
    for (const [tinta, lado] of [['#ff2a1a', -1], ['#22e6ff', 1]]) {
      tintaCtx.globalCompositeOperation = 'copy';
      tintaCtx.drawImage(legCv, 0, 0);
      tintaCtx.globalCompositeOperation = 'source-in';
      tintaCtx.fillStyle = tinta; tintaCtx.fillRect(0, 0, W, LEG_H);
      gm.globalCompositeOperation = 'screen';
      gm.globalAlpha = alfa * Math.min(1, F * 1.2) * 0.75;
      gm.drawImage(tintaCv, Math.round(lado * (2 + 9 * F) + (acaso(sem, quadro, 12 + lado) - 0.5) * 6 * F), topo + Math.round((acaso(sem, quadro, 14 + lado) - 0.5) * 4 * F));
    }
    gm.globalCompositeOperation = 'source-over';
  }
  gm.globalAlpha = alfa;
  if (F <= 0.03) gm.drawImage(legCv, 0, topo);
  else {
    // a legenda se parte em faixas que escorregam para os lados, e algumas somem
    for (let yb = 0, k = 0; yb < LEG_H; k++) {
      const hb = 3 + Math.floor(acaso(sem + k, quadro, 16) * 12);
      if (acaso(sem * 5 + k, quadro, 17) > F * 0.12) {
        const dx = acaso(sem + k * 3, quadro, 18) < F * 0.75 ? (acaso(sem + k, quadro, 19) - 0.5) * 2 * (4 + 46 * F) : 0;
        gm.drawImage(legCv, 0, yb, W, hb, Math.round(dx), topo + yb, W, hb);
      }
      yb += hb;
    }
  }
  gm.restore();
}

function mousePressed() {
  if (tFixo !== null) return;
  if (estado !== 'filme') comeca();
}

// Atalhos de revisão: espaço pausa, as setas andam 5 segundos, R recomeça.
// No p5 2.x as constantes de tecla são textos ('ArrowRight'), então a comparação é com "key".
function keyPressed() {
  const dir = key === 'ArrowRight' ? 1 : key === 'ArrowLeft' ? -1 : 0;
  if (tFixo !== null) {
    tFixo = limita(tFixo + dir, 0, DUR - 0.1);
    return;
  }
  if (estado !== 'filme') { if (key === ' ' || key === 'Enter') comeca(); return false; }
  if (key === ' ') {
    if (pausado) tBase += millis() - tPausa; else tPausa = millis();
    pausado = !pausado;
    if (ac) pausado ? ac.suspend() : ac.resume();
  }
  if (dir) {
    tBase -= dir * 5000;
    if (tempoAtual() < 0) tBase = pausado ? tPausa : millis();
    buscaSom(tempoAtual());
  }
  if (key === 'r' || key === 'R') comeca();
}

// ---------- shader de filtro: luz dos vitrais, foco curto, brilho, grão ----------

const FRAG = `
precision highp float;
varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform vec2 uRes;
uniform float uPose;
uniform float uPalidez;
uniform float uGolpe;
uniform float uFade;
uniform vec3 uAmb;
uniform vec2 uFoco;       // altura da faixa nítida e força do desfoque
uniform vec3 uL1;
uniform vec3 uL2;
uniform vec3 uL3;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;

// acaso sem repetição: a versão antiga se repetia a cada ~5 linhas e riscava o céu escuro
float acaso(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  vec2 uv = vTexCoord;
  vec2 px = 1.0 / uRes;

  // foco curto: só a faixa dos bonecos fica nítida, como numa maquete fotografada de perto
  float desfoque = smoothstep(0.17, 0.55, abs(uv.y - uFoco.x)) * 7.0 * uFoco.y;
  vec3 cor = vec3(0.0);
  for (int i = 0; i < 12; i++) {
    float fi = float(i);
    float a = fi * 2.39996;
    float d = sqrt((fi + 0.5) / 12.0);
    cor += texture2D(tex0, uv + vec2(cos(a), sin(a)) * d * desfoque * px).rgb;
  }
  cor /= 12.0;

  // brilho que vaza do vidro aceso
  vec3 brilho = vec3(0.0);
  for (int i = 0; i < 16; i++) {
    float fi = float(i);
    float a = fi * 2.39996 + 1.0;
    float d = sqrt((fi + 0.5) / 16.0);
    vec3 s = texture2D(tex0, uv + vec2(cos(a), sin(a)) * d * 36.0 * px).rgb;
    brilho += max(s - 0.80, 0.0);
  }
  cor += brilho / 16.0 * 4.0;

  // cada sala é iluminada pelo seu vitral: a luz tem a cor do vidro e cai com a distância
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  float d1 = length((uv - uL1.xy) * asp);
  float d2 = length((uv - uL2.xy) * asp);
  float d3 = length((uv - uL3.xy) * asp);
  vec3 luz = uAmb
    + uC1 * uL1.z / (1.0 + d1 * d1 * 6.0)
    + uC2 * uL2.z / (1.0 + d2 * d2 * 6.0)
    + uC3 * uL3.z / (1.0 + d3 * d3 * 6.0);
  cor *= luz;
  // o vidro aceso irradia um halo da sua cor
  cor += uC1 * uL1.z * exp(-d1 * d1 * 26.0) * 0.26;
  cor += uC2 * uL2.z * exp(-d2 * d2 * 26.0) * 0.26;
  cor += uC3 * uL3.z * exp(-d3 * d3 * 26.0) * 0.26;

  // nas badaladas todos empalidecem
  float lum = dot(cor, vec3(0.299, 0.587, 0.114));
  cor = mix(cor, vec3(lum) * vec3(0.90, 0.97, 1.08), uPalidez * 0.62);
  cor *= 1.0 - uGolpe * 0.22;

  // variação de exposição e grão, 12 vezes por segundo
  cor *= 1.0 + (acaso(vec2(uPose, 7.0)) - 0.5) * 0.025;
  cor += (acaso(uv * uRes + uPose * 17.0) - 0.5) * 0.05;

  vec2 c = uv - 0.5;
  cor *= 1.0 - dot(c, c) * 1.2;
  gl_FragColor = vec4(clamp(cor, 0.0, 1.0) * uFade, 1.0);
}`;

// ---------- shader dos raios volumétricos (meia resolução) ----------
// Espalhamento de luz em espaço de tela: para cada pixel, anda do centro do vitral até ele,
// somando o vidro aceso que encontra na máscara. Onde um boneco tapa o vidro, a soma cai,
// e aparece um raio de sombra. A luz perde força com a distância, desce mais do que sobe
// (o braseiro está atrás e o chão está na frente) e atravessa uma névoa que se move devagar.
const FRAG_RAIOS = `
precision highp float;
varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform vec2 uRes;
uniform float uTempo;
uniform float uCam;
uniform vec3 uL1;
uniform vec3 uL2;
uniform vec3 uL3;

float acaso(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float ruido(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(acaso(i), acaso(i + vec2(1.0, 0.0)), u.x),
             mix(acaso(i + vec2(0.0, 1.0)), acaso(i + vec2(1.0, 1.0)), u.x), u.y);
}
float nevoa(vec2 p) {
  return 0.5 * ruido(p) + 0.3 * ruido(p * 2.03 + 3.7) + 0.2 * ruido(p * 4.11 + 1.3);
}

uniform vec2 uS1;
uniform vec2 uS2;
uniform vec2 uS3;

const int N = 56;
const float ALCANCE = 0.62;   // quanto do caminho até o braseiro o ar enxerga: o comprimento dos feixes

// L: centro do vitral (uv) e força; S: o braseiro, acima e atrás da janela.
// Um ponto do ar está aceso se, olhando na direção do braseiro, há vidro no caminho:
// a janela funciona como molde, e os feixes saem com a forma dos vidros e do chumbo.
vec3 raios(vec2 uv, vec3 L, vec2 S, float salto) {
  if (L.z <= 0.001) return vec3(0.0);
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  float dist = length((uv - L.xy) * asp);
  if (dist > 1.6) return vec3(0.0);
  vec2 passo = (S - uv) * (ALCANCE / float(N));
  vec2 p = uv + passo * salto;
  vec3 soma = vec3(0.0);
  for (int i = 0; i < N; i++) {
    // só o vidro desta janela acende o feixe
    float perto = 1.0 - smoothstep(0.24, 0.3, length((p - L.xy) * asp));
    soma += texture2D(tex0, p).rgb * perto;
    p += passo;
  }
  soma *= 2.6 / float(N);
  float cai = exp(-dist * 1.25);
  float dentro = mix(0.4, 1.0, smoothstep(0.06, 0.26, dist));
  // estrias: o vidro antigo é irregular, então a luz sai em fios que abrem a partir do braseiro
  vec2 rel = (uv - S) * asp;
  float ang = atan(rel.x, rel.y);
  float estria = 0.6 * ruido(vec2(ang * 95.0, uTempo * 0.16 + L.x * 7.0)) + 0.4 * ruido(vec2(ang * 240.0 + 3.1, uTempo * 0.23));
  estria = mix(0.45, 1.35, estria);
  return soma * cai * dentro * estria * L.z;
}

void main() {
  vec2 uv = vTexCoord;
  float salto = acaso(uv * uRes);
  vec3 luz = raios(uv, uL1, uS1, salto) + raios(uv, uL2, uS2, salto) + raios(uv, uL3, uS3, salto);
  // a névoa anda com a cena (uCam) e sobe devagar, como fumaça dos braseiros
  vec2 q = vec2((uv.x + uCam) * 2.6 * uRes.x / uRes.y, uv.y * 2.2) + vec2(uTempo * 0.035, uTempo * 0.05);
  float n = nevoa(q);
  luz *= mix(0.35, 1.45, n);
  // a luz satura devagar em vez de estourar no branco
  luz = 1.0 - exp(-luz * 2.0);
  gl_FragColor = vec4(luz * 0.92, 1.0);
}`;
