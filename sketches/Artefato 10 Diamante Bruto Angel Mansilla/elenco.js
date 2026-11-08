// Diamante Bruto — elenco.js
// Personagens, cavalos e objetos de cena, todos originais e modelados no código.
// Cada pessoa é um esqueleto simples: as partes são malhas separadas que o
// sketch articula com push()/pop() a cada quadro.

'use strict';

// ---------------------------------------------------------------- figurinos
// a pinta da Jack, no rosto da garçonete e da Diamond Jack: abaixo do canto de fora de um olho, na maçã do rosto
// (posição na textura do rosto: deslocamento do centro e altura, em frações da largura)
const PINTA_JACK = [0.25, 0.465];
const FIGURINOS = {
  // a garçonete: gola branca e um broche de losango vermelho, a única pista do valete de ouros
  jackGarconete: { jack: true, altura: 1.68, mulher: true, pele: corHex('#C68B66'), cabelo: corHex('#3A2418'), coque: true,
    roupa: corHex('#1F3A3C'), saia: corHex('#1C3335'), avental: corHex('#F1EADC'), bota: corHex('#2A1E18'), olhos: corHex('#5B7A3A'),
    gola: corHex('#F1EADC'), broche: true, pinta: PINTA_JACK },
  // Diamond Jack, "valete de ouros": a roupa de garçonete era um disfarce por cima desta. Blusa quase preta (puxando para
  // o vinho) e calça de montaria marrom-escura, sem saia; botas de montaria, jaqueta curta vermelha com debrum e losangos
  // dourados, chapéu preto de aba reta com fita dourada e a carta, lenço vermelho, luvas e a bolsa do diamante no quadril
  jackForaDaLei: { jack: true, altura: 1.68, mulher: true, pele: corHex('#C68B66'), cabelo: corHex('#3A2418'), coque: true,
    roupa: corHex('#241418'), calca: corHex('#3A2A22'),
    bota: corHex('#24160E'), botaAlta: true, canoBota: corHex('#7A5434'), luvas: corHex('#4A3020'), olhos: corHex('#5B7A3A'),
    casaco: { cor: corHex('#7E1A24'), debrum: corHex('#D9AE4C') }, faixa: corHex('#1A1416'), broche: true,
    chapeu: 'plano', corChapeu: corHex('#16121A'), fitaChapeu: corHex('#D9AE4C'), carta: true, lenco: corHex('#A3242A'), bolsa: true, pinta: PINTA_JACK },
  xerife: { altura: 1.86, pele: corHex('#D2A07A'), cabelo: corHex('#8C8580'), roupa: corHex('#E6DCC8'), colete: corHex('#5A3A22'),
    calca: corHex('#5E4A36'), bota: corHex('#3A2416'), chapeu: 'cowboy', corChapeu: corHex('#BFA27A'), bigode: corHex('#9A938C'),
    estrela: true, barriga: 0.5, cinto: true, olhos: corHex('#3A3A44') },
  barao: { altura: 1.76, pele: corHex('#E0B08E'), cabelo: corHex('#B9B4AE'), roupa: corHex('#1B1B24'), colete: corHex('#4B2A5A'),
    calca: corHex('#1B1B24'), bota: corHex('#101012'), chapeu: 'cartola', corChapeu: corHex('#121216'), costeletas: corHex('#C9C4BE'),
    barriga: 1.0, gravata: corHex('#8E2424'), corrente: true, fraque: true, olhos: corHex('#3A3A44') },
};
// convidados e ajudantes: variações geradas
function figurinoConvidado(i) {
  const cores = ['#23335A', '#5A2330', '#2E2E36', '#3A4A2A', '#4A2E4E'].map(h => corHex(h));
  const vestidos = ['#2E6B4F', '#B5586E', '#C9A04A', '#3B5BA0', '#6B3A7A', '#8A3A2E'].map(h => corHex(h));
  const peles = [corHex('#E2B593'), corHex('#C68B66'), corHex('#A87250'), corHex('#EBC3A2'), corHex('#8E5B3E')];
  // rostoGrande: a textura do rosto com 512 px nos que aparecem de perto (a senhora do grito, 0, a do café, 6, e o do "por ali!", 7)
  const rostoGrande = [0, 6, 7].includes(i);
  if (i % 2 === 0) return { rostoGrande, altura: 1.62 + (i % 3) * 0.03, mulher: true, pele: peles[i % 5], cabelo: [corHex('#2A1A12'), corHex('#8A5A2A'), corHex('#C9A46A'), corHex('#1A1A1A')][i % 4], coque: true,
    roupa: vestidos[i % 6], saia: vestidos[i % 6], bota: corHex('#2A1E18'), chapeu: i % 4 === 0 ? 'pluma' : null, corChapeu: vestidos[(i + 2) % 6], olhos: corHex('#3A3A44') };
  return { rostoGrande, altura: 1.72 + (i % 4) * 0.03, pele: peles[(i + 2) % 5], cabelo: [corHex('#2A1A12'), corHex('#6A4A2A'), corHex('#999088')][i % 3], roupa: cores[i % 5], colete: cores[(i + 2) % 5],
    calca: corHex('#24242A'), bota: corHex('#101012'), chapeu: ['cartola', 'coco', null][i % 3], corChapeu: corHex('#18181C'), bigode: i % 3 === 1 ? corHex('#4A3A2A') : null,
    fraque: true, gravata: corHex('#E8E0D0'), olhos: corHex('#3A3A44') };
}
function figurinoAjudante(i) {
  const camisas = ['#7A2E2A', '#3A5A7A', '#8A7A4A', '#4A6A4A'].map(h => corHex(h));
  return { altura: 1.76 + (i % 3) * 0.04, pele: [corHex('#C68B66'), corHex('#E0B08E'), corHex('#9A6448')][i % 3], cabelo: corHex('#3A2A1E'),
    roupa: camisas[i % 4], colete: corHex('#4A3424'), calca: corHex('#3E3A34'), bota: corHex('#2A1C12'), chapeu: 'cowboy',
    corChapeu: [corHex('#4A3420'), corHex('#2A2420'), corHex('#7A6248')][i % 3], lenco: [corHex('#B88A3A'), corHex('#7A2A2A'), corHex('#2A4A6A')][i % 3],
    bigode: i % 2 ? corHex('#3A2A1E') : null, cinto: true, olhos: corHex('#3A3A44') };
}

// ---------------------------------------------------------------- cabeça
// Casca de cabelo sobre o crânio. O crânio é um sólido de revolução de LADOS_CABECA lados (achatado em x por 0,92), com
// uma aresta no meio do rosto; cada ponto da casca fica na superfície exata das facetas, empurrado para fora pela normal
// do perfil. linha: [ângulo a partir da frente (0) até a nuca (pi), altura da borda do cabelo]; acima da borda há
// cabelo. esp(psi, y): espessura. Perto da borda a espessura cai a zero, então o cabelo encosta na pele sem degrau nem
// fresta.
const LADOS_CABECA = 28; // múltiplo de 4: um vértice bem na frente (a aresta do meio do rosto) e um na nuca
function cabeloCasca(m, perfil, cor, linha, esp, sobre = 0.003, topo = Infinity) { // topo: altura acima da qual não há esta camada
  const NL = LADOS_CABECA, a0 = 0, NA = NL * 3, NP = 54; // três amostras por faceta, ao redor
  // amostras ao longo do perfil, proporcionais ao comprimento de cada trecho e passando pelas quinas; normal para fora
  let tot = 0; for (let i = 0; i < perfil.length - 1; i++) tot += Math.hypot(perfil[i + 1][0] - perfil[i][0], perfil[i + 1][1] - perfil[i][1]);
  const P = [];
  for (let i = 0; i < perfil.length - 1; i++) {
    const [r0, y0] = perfil[i], [r1, y1] = perfil[i + 1], L = Math.hypot(r1 - r0, y1 - y0), n = Math.max(1, Math.round(NP * L / tot));
    for (let k = 0; k < n; k++) { const u = k / n; P.push([r0 + (r1 - r0) * u, y0 + (y1 - y0) * u, (y1 - y0) / L, -(r1 - r0) / L]); }
    if (i === perfil.length - 2) P.push([r1, y1, 0, 1]);
  }
  const NPr = P.length - 1;
  const borda = psi => { for (let i = 0; i < linha.length - 1; i++) { const [p0, h0] = linha[i], [p1, h1] = linha[i + 1]; if (psi <= p1) return h0 + (h1 - h0) * (psi - p0) / (p1 - p0); } return linha[linha.length - 1][1]; };
  // ponto do perfil numa altura dada (o perfil sobe sempre): devolve [r, y, nr, ny]
  const naAltura = yb => { for (let j = 0; j < NPr; j++) { const A = P[j], B = P[j + 1]; if (yb <= B[1]) { const u = (yb - A[1]) / (B[1] - A[1] || 1); return [A[0] + (B[0] - A[0]) * u, yb, A[2], A[3]]; } } return P[NPr]; };
  const V = [], E = [];
  for (let i = 0; i <= NA; i++) {
    const a = a0 + (i / NA) * Math.PI * 2, fac = Math.cos(Math.PI / NL) / Math.cos(((a - a0) % (2 * Math.PI / NL)) - Math.PI / NL); // raio da faceta neste ângulo
    const x0 = Math.cos(a), z0 = Math.sin(a), psi = Math.abs(Math.atan2(0.92 * x0, z0)); // 0 na frente (+z), pi na nuca
    const yb = borda(psi), pb = naAltura(yb);
    V.push([]); E.push([]);
    for (let j = 0; j <= NPr; j++) {
      // abaixo da borda, o vértice fica na própria borda: a beirada do cabelo é uma linha contínua, sem degraus
      const abaixo = P[j][1] < yb, [r, y, nr, ny] = abaixo ? pb : P[j];
      const dentro = sstep(0, 0.022, y - yb), e = esp(psi, y) * dentro + sobre;
      const R = r * fac + e * nr, Y = y + e * ny;
      V[i].push([0.92 * R * x0, Y, R * z0]); E[i].push(abaixo);
    }
  }
  for (let i = 0; i < NA; i++) for (let j = 0; j < NPr; j++) {
    if (E[i][j + 1] && E[i + 1][j + 1]) continue; // os dois lados ainda abaixo da borda: nada a desenhar
    if (E[i][NPr] || E[i + 1][NPr] || P[j][1] >= topo) continue; // coluna sem esta camada, ou acima do topo
    const k = 0.97 + 0.035 * Math.sin(i * 0.9) * Math.cos(j * 0.6); // variação leve de tom, sem listras
    m.f([V[i][j], V[i + 1][j], V[i + 1][j + 1], V[i][j + 1]], [cor[0] * k, cor[1] * k, cor[2] * k]);
  }
  return m;
}
// perfil liso: Catmull-Rom pelos pontos de um perfil [raio, altura], com 'sub' trechos por segmento; passa por todos os
// pontos, não deixa o raio negativo e mantém a altura sempre subindo
function perfilLiso(p, sub) {
  const o = [];
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[Math.max(0, i - 1)], b = p[i], c = p[i + 1], d = p[Math.min(p.length - 1, i + 2)];
    for (let k = 0; k < sub; k++) { const u = k / sub, u2 = u * u, u3 = u2 * u;
      o.push([0, 1].map(j => 0.5 * (2 * b[j] + (-a[j] + c[j]) * u + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * u2 + (-a[j] + 3 * b[j] - 3 * c[j] + d[j]) * u3))); }
  }
  o.push(p[p.length - 1].slice());
  for (let i = 0; i < o.length; i++) { o[i][0] = Math.max(0, o[i][0]); if (i > 0) o[i][1] = Math.max(o[i][1], o[i - 1][1] + 1e-5); }
  o[0][0] = p[0][0]; o[o.length - 1][0] = p[p.length - 1][0];
  return o;
}
// perfil do crânio e do rosto (mulher e homem), liso: o mesmo da cabeça, do cabelo, do bigode e da máscara do rosto
const PERFIL_CABECA = {
  m: perfilLiso([[0, -0.112], [0.056, -0.105], [0.08, -0.066], [0.091, -0.01], [0.093, 0.04], [0.086, 0.085], [0.062, 0.118], [0, 0.13]], 3),
  h: perfilLiso([[0, -0.118], [0.068, -0.11], [0.09, -0.066], [0.097, -0.01], [0.098, 0.04], [0.091, 0.085], [0.064, 0.118], [0, 0.13]], 3) };
// O nariz, sobre a aresta do meio do rosto: ponte, ponta, asas e narinas (uns 40 triângulos). Os pontos se medem a partir
// da superfície do rosto (zF); a base fica um pouco por dentro dela, para não abrir fresta, e o resto por fora da
// máscara do rosto (3,5 mm acima do crânio). k: o tamanho (o dos homens, um pouco maior)
function nariz(m, perfil, pele, k = 1) {
  const zF = (x, y) => Math.sqrt(Math.max(0, raioEm(perfil, y) ** 2 - (x / 0.92) ** 2));
  const P = (x, y, h) => [x * k, y, zF(x * k, y) + h * k];
  const claro = mixc(pele, [255, 228, 208], 0.05), sombra = mixc(pele, [0, 0, 0], 0.1), narina = mixc(pele, [40, 14, 10], 0.3);
  // a ponte nasce num bico só, entre os olhos, é estreita ali e alarga até a ponta e as asas; as asas sobem um pouco dos lados da ponta, para a base
  // não virar uma prateleira reta. Tudo em triângulos bem abertos: um triângulo fino brilha como um fio quando a luz é rasante
  const R = P(0, 0.033, 0.0035), M = P(0, 0.002, 0.0095), T = P(0, -0.027, 0.022), U = P(0, -0.037, 0.015), S = P(0, -0.041, 0.004);
  for (const sx of [-1, 1]) {
    const A = P(sx * 0.0035, 0.022, 0.004), B = P(sx * 0.0055, -0.003, 0.008), C = P(sx * 0.007, -0.024, 0.017);
    const W = P(sx * 0.015, -0.028, 0.007), X = P(sx * 0.0145, -0.0355, 0.0055), N = P(sx * 0.006, -0.038, 0.011);
    const Ft = P(sx * 0.0045, 0.03, -0.0015), Fa = P(sx * 0.012, 0.006, -0.0015), Fw = P(sx * 0.019, -0.029, -0.0015), Fx = P(sx * 0.017, -0.038, -0.0015);
    m.f([R, A, M], claro); m.f([A, B, M], claro); m.f([M, B, T], claro); m.f([B, C, T], claro); // a ponte
    m.f([R, Ft, A], pele); m.f([Ft, Fa, A], pele); m.f([A, Fa, B], pele); m.f([B, Fa, Fw], pele); m.f([B, Fw, W], pele); m.f([B, W, C], pele); // o lado
    m.f([C, W, X], pele); m.f([W, Fw, Fx], sombra); m.f([W, Fx, X], sombra); m.f([C, X, N], pele); // a asa
    m.f([T, C, N], claro); m.f([T, N, U], pele); // a ponta
    m.f([U, N, S], sombra); m.f([N, X, Fx], sombra); m.f([N, Fx, S], narina); // por baixo, com a narina
  }
}
// A orelha (dos homens; a das mulheres fica sob o cabelo), com a borda (hélice) em volta e a concha funda no meio, de
// lado da cabeça, com a borda de trás um pouco afastada dela. sx: o lado (+1 ou -1)
function orelha(m, sx, pele) {
  const E0 = [sx * 0.086, 0.004, -0.008], fi = 0.3, Ud = [-sx * Math.sin(fi), 0, Math.cos(fi)], Nd = [sx * Math.cos(fi), 0, Math.sin(fi)];
  const P = (u, v, w) => [E0[0] + Ud[0] * u + Nd[0] * w, E0[1] + v, E0[2] + Ud[2] * u + Nd[2] * w];
  const c = [-0.006, 0.002], N = 12, O = [], B = [], I = [], K = [];
  for (let k = 0; k < N; k++) {
    const a = Math.PI / 2 + k / N * Math.PI * 2, sv = Math.sin(a), au = 0.0165 * (sv < 0 ? 0.8 : 1);
    const ou = c[0] + Math.cos(a) * au, ov = c[1] + sv * 0.029, tras = Math.max(0, -Math.cos(a)), w = 0.006 + 0.009 * tras;
    const em = (q, du = 0) => [c[0] + (ou - c[0]) * q + du, c[1] + (ov - c[1]) * q];
    O.push(P(ou, ov, w)); B.push(P(...em(0.75), -0.004)); I.push(P(...em(0.66), w + 0.001)); K.push(P(...em(0.5, 0.002), 0.0045));
  }
  const costas = mixc(pele, [0, 0, 0], 0.12), dentro = mixc(pele, [0, 0, 0], 0.2), fundo = mixc(pele, [40, 14, 10], 0.28);
  for (let k = 0; k < N; k++) { const j = (k + 1) % N;
    m.f([B[k], B[j], O[j], O[k]], costas); m.f([O[k], O[j], I[j], I[k]], pele); m.f([I[k], I[j], K[j], K[k]], dentro); }
  m.f(K, fundo);
}
// O coque enrolado: uma trança grossa em espiral (uma volta e três quartos), de fora para dentro, subindo em cúpula, com o
// miolo fechado. base: o centro da base, rente ao cabelo; eixo: para onde ele aponta (para trás)
function coque(m, cor, base, eixo) {
  const d = normaliza(eixo), e1 = [1, 0, 0], e2 = normaliza([d[1] * e1[2] - d[2] * e1[1], d[2] * e1[0] - d[0] * e1[2], d[0] * e1[1] - d[1] * e1[0]]).map(v => -v);
  const NS = 30, L = 8, voltas = 1.75, pt = t => { const th = -0.6 + t * Math.PI * 2 * voltas, rho = 0.034 * (1 - 0.62 * t) + 0.003, h = 0.008 + 0.038 * Math.pow(t, 0.7);
    return [0, 1, 2].map(i => base[i] + d[i] * h + (e1[i] * Math.cos(th) + e2[i] * Math.sin(th)) * rho); };
  const aneis = [];
  for (let k = 0; k <= NS; k++) {
    const t = k / NS, a = pt(Math.max(0, t - 0.01)), b = pt(Math.min(1, t + 0.01)), tg = normaliza([b[0] - a[0], b[1] - a[1], b[2] - a[2]]), c = pt(t), r = 0.017 - 0.006 * t;
    const n1 = normaliza([tg[1] * d[2] - tg[2] * d[1], tg[2] * d[0] - tg[0] * d[2], tg[0] * d[1] - tg[1] * d[0]]), n2 = [tg[1] * n1[2] - tg[2] * n1[1], tg[2] * n1[0] - tg[0] * n1[2], tg[0] * n1[1] - tg[1] * n1[0]];
    aneis.push(Array.from({ length: L }, (_, q) => { const g = q / L * Math.PI * 2; return [0, 1, 2].map(i => c[i] + (n1[i] * Math.cos(g) + n2[i] * Math.sin(g)) * r); }));
  }
  for (let k = 0; k < NS; k++) for (let q = 0; q < L; q++) m.f([aneis[k][q], aneis[k][(q + 1) % L], aneis[k + 1][(q + 1) % L], aneis[k + 1][q]], cor);
  m.f(aneis[NS], cor); m.f(aneis[0], cor);
  const hm = 0.008 + 0.038 - 0.006; m.push().t(base[0] + d[0] * hm, base[1] + d[1] * hm, base[2] + d[2] * hm).esfera(0.019, 10, 5, cor).pop(); // o miolo, no eixo: fecha o meio da espiral
}
function cabeca(f) {
  const m = new Malha(Math.round(f.altura * 1000)); m.jit = 0.03;
  const s = f.altura / 1.75 * 1.12;
  m.push().s3(s);
  // crânio e rosto (lathe achatado nos lados), com uma aresta no meio do rosto, onde fica o nariz
  const perfil = f.mulher ? PERFIL_CABECA.m : PERFIL_CABECA.h;
  m.push().s3(0.92, 1, 1.0).lathe(perfil, LADOS_CABECA, f.pele, 0).pop();
  nariz(m, perfil, f.pele, f.mulher ? 0.88 : 1.12);
  // olhos, sobrancelhas e boca agora são desenhados em 2D numa máscara (ver rostoMascara)
  if (!f.mulher) for (const sx of [-1, 1]) orelha(m, sx, f.pele); // as delas ficam sob o cabelo
  // cabelo: uma camada que acompanha o crânio (sem caixas coladas), mais grossa no alto e fina nas bordas,
  // onde encosta na pele sem fresta. Sob chapéu fica rente no alto, para não atravessar a copa.
  const plano = y => f.chapeu ? 1 - 0.92 * sstep(0.05, 0.085, y) : 1;
  const sobre = f.chapeu ? 0.0015 : 0.003; // sob o chapéu, rente ao crânio: o crânio liso é mais cheio no alto, e o cabelo não pode encostar na copa
  if (f.mulher) {
    // preso para trás: cobre o alto das orelhas, uma mecha desce na frente de cada orelha, volume atrás, na direção do coque
    cabeloCasca(m, perfil, f.cabelo, [[0, 0.071], [0.55, 0.066], [0.95, 0.03], [1.1, -0.05], [1.9, -0.05], [2.3, -0.074], [Math.PI, -0.088]],
      (psi, y) => (0.013 + 0.009 * sstep(0.0, 0.1, y) + 0.012 * sstep(1.9, 2.8, psi) * sstep(-0.06, 0.04, y) * (1 - sstep(0.09, 0.13, y))) * plano(y), sobre);
    // o coque, no alto da nuca; sob o chapéu de aba reta (a Jack fora da lei), mais baixo, junto da nuca, para a aba não o cortar
    if (f.coque) coque(m, f.cabelo, f.chapeu === 'plano' ? [0, 0.026, -0.108] : [0, 0.078, -0.112], f.chapeu === 'plano' ? [0, -0.1, -1] : [0, 0.25, -1]);
  } else {
    // curto: entradas discretas, costeleta curta na frente da orelha, contorna a orelha e desce até a nuca
    cabeloCasca(m, perfil, f.cabelo, [[0, 0.073], [0.6, 0.07], [1.0, 0.045], [1.17, -0.025], [1.3, -0.018], [1.42, 0.012], [1.57, 0.034], [1.72, 0.03], [1.86, 0.006], [2.15, -0.05], [Math.PI, -0.078]],
      (psi, y) => (0.007 + 0.009 * sstep(0.0, 0.1, y)) * plano(y), sobre);
  }
  if (f.bigode) for (const sx of [-1, 1]) { // segue a curva do rosto; grosso junto ao nariz, afinando até a ponta caída
    // um tubo afunilado contínuo (anéis ligados, sem tampas no meio), com cor única: nada de listras entre segmentos
    const N = 6, jit = m.jit; m.jit = 0;
    const pts = Array.from({ length: N + 1 }, (_, k) => { const u = k / N, x = sx * (0.004 + 0.05 * u), y = -0.04 - 0.004 * u - 0.016 * u * u * u, r = raioEm(perfil, y);
      return [x, y, Math.sqrt(Math.max(0, r * r - (x / 0.92) ** 2)) + 0.004 - 0.004 * u]; });
    const raio = u => 0.0095 * (1 - 0.72 * u) + 0.002, L = 6, aneis = [];
    for (let k = 0; k <= N; k++) {
      const a = pts[Math.max(0, k - 1)], b = pts[Math.min(N, k + 1)], t = normaliza([b[0] - a[0], b[1] - a[1], b[2] - a[2]]);
      const n1 = normaliza([t[1] * 1 - t[2] * 0, t[2] * 0 - t[0] * 1, 0]), n2 = [t[1] * n1[2] - t[2] * n1[1], t[2] * n1[0] - t[0] * n1[2], t[0] * n1[1] - t[1] * n1[0]], r = raio(k / N);
      aneis.push(Array.from({ length: L }, (_, q) => { const ang = q / L * Math.PI * 2, c = Math.cos(ang) * r, s2 = Math.sin(ang) * r * 0.8;
        return [pts[k][0] + n1[0] * c + n2[0] * s2, pts[k][1] + n1[1] * c + n2[1] * s2, pts[k][2] + n1[2] * c + n2[2] * s2]; }));
    }
    for (let k = 0; k < N; k++) for (let q = 0; q < L; q++) m.f([aneis[k][q], aneis[k][(q + 1) % L], aneis[k + 1][(q + 1) % L], aneis[k + 1][q]], f.bigode);
    m.f(aneis[0], f.bigode); m.f(aneis[N].slice().reverse(), f.bigode);
    m.jit = jit;
  }
  if (f.costeletas) cabeloCasca(m, perfil, f.costeletas, [[0, 1], [1.07, 1], [1.12, -0.078], [1.42, -0.078], [1.47, 1], [Math.PI, 1]], () => 0.016, 0.003, 0.012); // suíças, por baixo da borda do cabelo
  m.pop();
  return m;
}
// onde a carta fica presa na fita do chapéu de aba reta: rente à copa, por fora (a copa é reta e larga)
const CARTA_CHAPEU = [0.069, 0.056, 0.083];
const LADOS_CHAPEU = 28; // lados dos chapéus (copa e aba), também os da copa furada da Jack
function chapeu(f, furo) {
  if (!f.chapeu) return null;
  const m = new Malha(91); m.jit = 0.03; const s = f.altura / 1.75 * 1.12;
  m.push().s3(s).t(0, 0.085, -0.005);
  const c = f.corChapeu;
  if (f.chapeu === 'cowboy') {
    m.lathe([[0, -0.005], [0.2, -0.0], [0.22, 0.02], [0.2, 0.012], [0.1, 0.005], [0.098, 0.1], [0.07, 0.125], [0.02, 0.112], [0, 0.11]], LADOS_CHAPEU, (i) => i === 4 ? mixc(c, [0, 0, 0], 0.4) : c);
    m.push().t(0, 0.015, 0).cyl(0.101, 0.1, 0.03, LADOS_CHAPEU, mixc(c, [0, 0, 0], 0.5), false).pop();
    if (f.carta) m.push().t(0.075, 0.055, 0.065).ry(0.7).rz(0.2).box(0.058, 0.082, 0.003, corHex('#E8E0CE')).pop(); // verso da carta; a frente é desenhada com a textura da carta da vitrine
  } else if (f.chapeu === 'plano') { // aba reta e copa chata, com fita colorida: só a Jack usa
    const aba = [[0, -0.004], [0.2, -0.004], [0.209, -0.0015], [0.212, 0.004], [0.208, 0.0095], [0.2, 0.011], [0.102, 0.011]]; // borda da aba arredondada
    if (furo) { m.lathe(aba, LADOS_CHAPEU, c); copaFurada(m, furo, c); m.lathe([[0.1, 0.1], [0, 0.1]], LADOS_CHAPEU, c); }
    else m.lathe(aba.concat([[0.1, 0.1], [0, 0.1]]), LADOS_CHAPEU, c);
    m.push().t(0, 0.011, 0).cyl(0.1035, 0.1025, 0.034, LADOS_CHAPEU, f.fitaChapeu || mixc(c, [0, 0, 0], 0.5), false).pop();
    if (f.carta) m.push().t(CARTA_CHAPEU[0], CARTA_CHAPEU[1], CARTA_CHAPEU[2]).ry(0.7).rz(0.2).box(0.058, 0.082, 0.003, corHex('#E8E0CE')).pop();
  } else if (f.chapeu === 'cartola') {
    m.lathe([[0, 0], [0.15, 0.0], [0.15, 0.012], [0.095, 0.012], [0.09, 0.2], [0.1, 0.22], [0, 0.22]], LADOS_CHAPEU, c);
    m.push().t(0, 0.015, 0).cyl(0.093, 0.092, 0.03, LADOS_CHAPEU, corHex('#5A1A22'), false).pop();
  } else if (f.chapeu === 'coco') {
    m.lathe([[0, 0], [0.14, 0.0], [0.13, 0.015]].concat(perfilLiso([[0.095, 0.02], [0.098, 0.08], [0.07, 0.12], [0, 0.13]], 3)), LADOS_CHAPEU, c); // a copa redonda, lisa
  } else if (f.chapeu === 'pluma') { // chapeuzinho de dama, assentado e inclinado para a frente sobre a testa (a aba de trás passa por cima do coque)
    m.push().t(0, 0.015, 0.004).rx(0.15).rz(0.06);
    m.lathe([[0, 0], [0.14, 0.0], [0.13, 0.02], [0.08, 0.03], [0.06, 0.07], [0, 0.075]], 24, c);
    m.lathe([[0.088, 0.0], [0.087, -0.022]], 24, mixc(c, [0, 0, 0], 0.3)); // a copa desce da aba até o cabelo (uma fita mais escura): visto de baixo, o chapéu assenta na cabeça
    m.push().t(-0.06, 0.06, -0.03).rz(0.6).rx(-0.3).box(0.025, 0.2, 0.01, corHex('#F0E6D8')).pop();
    m.pop();
  }
  m.pop();
  return m;
}

// Copa do chapéu da Jack com os dois furos da bala (entrada atrás, saída na frente): o mesmo prisma de LADOS_CHAPEU faces do
// torno, subdividido numa grade; em volta de cada furo, um bloco da grade é trocado por anéis até a borda rasgada do
// furo (aberto de verdade: através dele se vê o outro lado), com a borda chamuscada e uma auréola de feltro queimado.
// furo: { r, furos: [{ a, y }] }, com a no ângulo do torno (x = r cos a, z = r sin a) e y na altura do torno.
function copaFurada(m, furo, c) {
  const N = LADOS_CHAPEU, SUB = 2, NI = N * SUB, NJ = 8, Y0 = 0.011, Y1 = 0.1, R0 = 0.101, ds = 2 * Math.PI * R0 / NI, dy = (Y1 - Y0) / NJ;
  const raio = y => 0.102 + (0.1 - 0.102) * (y - Y0) / (Y1 - Y0);
  const P = (s, y) => { // (comprimento ao redor, altura) → ponto na face plana do prisma (sem frestas com a aba e o topo)
    const a = ((s / R0) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI), u = a / (2 * Math.PI / N), k = Math.floor(u), t = u - k, r = raio(y);
    const a0 = k * 2 * Math.PI / N, a1 = (k + 1) * 2 * Math.PI / N;
    return [r * Math.cos(a0) * (1 - t) + r * Math.cos(a1) * t, y, r * Math.sin(a0) * (1 - t) + r * Math.sin(a1) * t];
  };
  const carvao = corHex('#0C0907'), queimado = mixc(c, corHex('#8A6444'), 0.5); // o feltro chamuscado em volta, mais claro que o chapéu
  const blocos = furo.furos.map((h, n) => {
    const sh = h.a * R0, B = 2.05 * furo.r;
    return { n, sh, yh: h.y, i0: Math.floor((sh - B) / ds), i1: Math.ceil((sh + B) / ds), j0: Math.max(0, Math.floor((h.y - Y0 - B) / dy)), j1: Math.min(NJ, Math.ceil((h.y - Y0 + B) / dy)) };
  });
  const noBloco = (i, j) => blocos.some(b => i >= b.i0 && i < b.i1 && j >= b.j0 && j < b.j1);
  for (let i = 0; i < NI; i++) for (let j = 0; j < NJ; j++) {
    if (noBloco(i, j) || noBloco(i + NI, j) || noBloco(i - NI, j)) continue;
    const s0 = i * ds, s1 = (i + 1) * ds, y0 = Y0 + j * dy, y1 = y0 + dy;
    m.f([P(s0, y0), P(s1, y0), P(s1, y1), P(s0, y1)], c);
  }
  // costura entre dois laços em volta do mesmo centro (ambos em ordem crescente de ângulo)
  const costura = (A, Bq, cor) => {
    const ang = q => q[2], nA = A.length, nB = Bq.length; let i = 0, j = 0;
    const w = (L, k) => L[k % L.length], dA = k => ang(w(A, k)) + (k >= nA ? 2 * Math.PI : 0), dB = k => ang(w(Bq, k)) + (k >= nB ? 2 * Math.PI : 0);
    while (i < nA || j < nB) {
      if (j >= nB || (i < nA && dA(i + 1) <= dB(j + 1))) { m.f([P(w(A, i)[0], w(A, i)[1]), P(w(A, i + 1)[0], w(A, i + 1)[1]), P(w(Bq, j)[0], w(Bq, j)[1])], cor); i++; }
      else { m.f([P(w(A, i)[0], w(A, i)[1]), P(w(Bq, j + 1)[0], w(Bq, j + 1)[1]), P(w(Bq, j)[0], w(Bq, j)[1])], cor); j++; }
    }
  };
  for (const b of blocos) {
    const ang = (s, y) => { const a = Math.atan2(y - b.yh, s - b.sh); return a < 0 ? a + 2 * Math.PI : a; };
    const laco = pts => { const L = pts.map(([s, y]) => [s, y, ang(s, y)]); let k0 = 0; L.forEach((q, k) => { if (q[2] < L[k0][2]) k0 = k; }); return L.slice(k0).concat(L.slice(0, k0)); };
    const circ = (r, rasgo) => { const L = []; for (let k = 0; k < 18; k++) { const a = k / 18 * 2 * Math.PI, rr = r * (1 + rasgo * (hash2(k * 7 + b.n, 3) - 0.5)); L.push([b.sh + Math.cos(a) * rr, b.yh + Math.sin(a) * rr]); } return laco(L); };
    const borda = []; const S = i => i * ds, Y = j => Y0 + j * dy;
    for (let i = b.i0; i < b.i1; i++) borda.push([S(i), Y(b.j0)]);
    for (let j = b.j0; j < b.j1; j++) borda.push([S(b.i1), Y(j)]);
    for (let i = b.i1; i > b.i0; i--) borda.push([S(i), Y(b.j1)]);
    for (let j = b.j1; j > b.j0; j--) borda.push([S(b.i0), Y(j)]);
    const c1 = circ(furo.r, 0.45), c2 = circ(furo.r * 1.4, 0.3), c3 = circ(furo.r * 1.85, 0.12);
    costura(c1, c2, carvao); costura(c2, c3, queimado); costura(c3, laco(borda), c);
  }
}

// ---------------------------------------------------------------- corpo
// devolve as partes e as medidas do esqueleto. Todos usam o acabamento abaixo (pessoaAcabada); a Jack, desde a etapa
// 5.3 do plano de modelagem, também, com as peças só dela (avental, broche, bolero, faixa, lenço e bolsa)
function pessoa(f) { return pessoaAcabada(f); }

// ================================================================ ACABAMENTO DAS ROUPAS
// Todos: Barão, convidados, xerife, ajudantes e a Jack (garçonete e fora da lei, com as peças só dela). O mesmo
// estilo de facetas chapadas, com mais polígonos e peças que se leem. O esqueleto, as medidas, as cores e a silhueta são
// os de antes: o tronco tem a mesma largura e profundidade em cada altura, agora com seção octogonal (cantos chanfrados
// e a frente plana, onde ficam colete, gravata e estrela). Fraque com lapelas, botões, gola e abas (as abas são uma
// peça à parte, desenhada por desenhaPessoa: a perna que vai para trás as empurra e, sentado, elas se recolhem); colete
// com botões, bolsos e corrente; camisa com gola e abotoamento; cinto com fivela; coldre preso à coxa (acompanha a
// perna); calça com vinco; botas com salto e alças; vestidos com corpete, mangas bufantes e saia pregueada com volume.
const LADOS_MEMBRO = 14; // pontos das seções redondas de braços, pernas e botas
function secOct(w, d, kx = 0.22, kz = 0.28) { const x = w / 2, z = d / 2, cx = w * kx, cz = d * kz;
  return [[-x + cx, z], [x - cx, z], [x, z - cz], [x, -z + cz], [x - cx, -z], [-x + cx, -z], [-x, -z + cz], [-x, z - cz]]; }
// A seção do tronco (etapa 5.6 do plano de modelagem): a frente é a do octógono (plana no meio, chanfrada nos cantos,
// onde ficam colete, gravata, estrela e alças), os lados são retos e os cantos de trás, arredondados (três pontos a mais
// em cada um, 14 no total). r de 0 a 1: de canto chanfrado (o octógono de antes, na cintura, rente à pelve) a redondo
function secTronco(w, d, r = 1) {
  const a = w / 2, b = d / 2, cx = w * 0.22, cz = d * 0.28, D = [];
  for (const t of [0.25, 0.5, 0.75]) { const g = t * Math.PI / 2, lx = a - cx * t, lz = -b + cz - cz * t;
    D.push([lx + (a - cx + cx * Math.cos(g) - lx) * r, lz + (-b + cz - cz * Math.sin(g) - lz) * r]); }
  return [[-a + cx, b], [a - cx, b], [a, b - cz], [a, -b + cz], ...D, [a - cx, -b], [-a + cx, -b], ...D.slice().reverse().map(([x, z]) => [-x, z]), [-a, -b + cz], [-a, b - cz]];
}
// a profundidade das costas (z > 0) da seção S na altura x, pelos lados do polígono (as peças das costas vão rente a ela)
function zVerso(S, x) {
  const ax = Math.min(Math.abs(x), Math.max(...S.map(p => p[0])) * 0.999); let z = null;
  for (let i = 0; i < S.length; i++) { const A = S[i], B = S[(i + 1) % S.length];
    if (A[1] > 0 || B[1] > 0 || Math.abs(B[0] - A[0]) < 1e-9 || ax < Math.min(A[0], B[0]) || ax > Math.max(A[0], B[0])) continue;
    const q = A[1] + (B[1] - A[1]) * (ax - A[0]) / (B[0] - A[0]); if (z === null || q < z) z = q; }
  return z === null ? 0 : -z;
}
function secRoda(r, n = LADOS_MEMBRO, vinco = 0) { const P = []; for (let k = 0; k < n; k++) { const a = Math.PI / 2 + k * Math.PI * 2 / n, rr = r * (k === 0 ? 1 + vinco : 1); P.push([Math.cos(a) * rr, Math.sin(a) * rr]); } return P; }
// liga seções [y, [[x, z], ...]] com quadriláteros; pula(i, j) deixa de desenhar a face i entre as seções j e j+1
function loft(m, secs, col, pula) {
  for (let j = 0; j < secs.length - 1; j++) { const [ya, A] = secs[j], [yb, B] = secs[j + 1], n = A.length;
    for (let i = 0; i < n; i++) { if (pula && pula(i, j)) continue; const k = (i + 1) % n;
      m.f([[A[i][0], ya, A[i][1]], [A[k][0], ya, A[k][1]], [B[k][0], yb, B[k][1]], [B[i][0], yb, B[i][1]]], typeof col === 'function' ? col(i, j) : col); } }
  return m;
}
// o mesmo, com as seções ao longo de z: [z, [[x, y], ...]] (o pé, do calcanhar ao bico)
function loftZ(m, secs, col, tampas = true) {
  for (let j = 0; j < secs.length - 1; j++) { const [za, A] = secs[j], [zb, B] = secs[j + 1], n = A.length;
    for (let i = 0; i < n; i++) { const k = (i + 1) % n; m.f([[A[i][0], A[i][1], za], [A[k][0], A[k][1], za], [B[k][0], B[k][1], zb], [B[i][0], B[i][1], zb]], col); } }
  if (tampas) for (const [z, A] of [secs[0], secs[secs.length - 1]]) m.f(A.map(([x, y]) => [x, y, z]), col);
  return m;
}
const tampaSec = (m, y, pts, col) => m.f(pts.map(([x, z]) => [x, y, z]), col);
const discoEm = (m, c, r, col, n = 8) => m.f(Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2; return [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, c[2]]; }), col);
// um segmento de dedo (ou de palma) de seção octogonal, de a até b, afinando de (w0, e0) para (w1, e1): w na largura da mão
// (x) e e na espessura; ponta: fecha com uma ponta arredondada além de b. O começo fica aberto, porque está sempre dentro
// da palma ou do segmento anterior
function falange(m, a, b, w0, e0, w1, e1, cor, ponta) {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dx, dy, dz);
  m.push().t(a[0], a[1], a[2]).ry(Math.atan2(dx, dz)).rx(Math.acos(Math.max(-1, Math.min(1, dy / L))));
  const S0 = secOct(w0, e0, 0.26, 0.32), S1 = secOct(w1, e1, 0.26, 0.32);
  loft(m, [[0, S0], [L, S1]], cor);
  if (ponta) { const S2 = secOct(w1 * 0.62, e1 * 0.6, 0.26, 0.32), Lp = L + e1 * 0.42; loft(m, [[L, S1], [Lp, S2]], cor); tampaSec(m, Lp, S2, cor); }
  else tampaSec(m, L, S1, cor);
  m.pop();
}
// A mão (vai na mesma malha do antebraço, que tem uma versão com cada forma), nas unidades e no referencial do antebraço
// de uma pessoa de 1,75 m: y desce do cotovelo, a palma olha para +z e o polegar fica em +x (é a mão direita; a esquerda
// é a mesma, espelhada em x). Ocupa o lugar da caixa de antes: do punho (y = -0,26) à ponta do dedo médio (-0,353), 6 cm
// de largura, com a frente da palma em z = 0,02 junto do ponto de pega (maoFK: y = -0,32), para nenhuma pega mudar.
// aberta: os dedos quase retos, um pouco abertos em leque (a bandeja apoia na palma); fechada: os dedos dobrados em volta
// do cabo do que ela segura, na frente da palma, e o polegar por cima deles
function maoModelo(m, cor, fechada) {
  const sec = (w, e, zc) => secOct(w, e, 0.26, 0.34).map(([x, z]) => [x, z + zc]);
  loft(m, [[-0.256, sec(0.05, 0.034, 0.006)], [-0.27, sec(0.052, 0.027, 0.007)], [-0.292, sec(0.06, 0.028, 0.007)], [-0.31, sec(0.062, 0.025, 0.006)],
    [-0.318, sec(0.058, 0.02, 0.005)]], cor);
  tampaSec(m, -0.256, sec(0.05, 0.034, 0.006), cor); tampaSec(m, -0.318, sec(0.058, 0.02, 0.005), cor);
  // dedos: indicador (do lado do polegar), médio, anelar e mínimo: [x na base, y na base, largura, espessura, comprimentos
  // das duas falanges (a do meio e a da ponta juntas na segunda), abertura em x da ponta]
  const D = [[0.0215, -0.313, 0.0138, 0.0135, 0.016, 0.015, 0.004], [0.0072, -0.315, 0.0142, 0.0138, 0.017, 0.016, 0.0005],
    [-0.0072, -0.314, 0.0136, 0.0132, 0.016, 0.015, -0.003], [-0.0215, -0.31, 0.0122, 0.012, 0.013, 0.012, -0.007]];
  for (const [x, y, w, e, L1, L2, ab] of D) {
    // ângulos de cada falange a partir do eixo do antebraço (-y), dobrando para o lado da palma (+z)
    const [t1, t2] = fechada ? [1.32, 2.85] : [0.1, 0.32], z0 = fechada ? 0.004 : 0.006;
    const a = [x, y, z0], b = [x + ab * 0.5, y - L1 * Math.cos(t1), z0 + L1 * Math.sin(t1)];
    const c = [b[0] + (fechada ? 0 : ab * 0.5), b[1] - L2 * Math.cos(t2), b[2] + L2 * Math.sin(t2)];
    falange(m, [a[0], a[1] + e * 0.35, a[2]], b, w, e, w * 0.95, e * 0.95, cor);
    // a falange de fora começa um pouco antes da junta (recuada ao longo da de dentro), para a dobra não abrir fresta
    falange(m, [b[0], b[1] + e * 0.3 * Math.cos(t1), b[2] - e * 0.3 * Math.sin(t1)], c, w * 0.95, e * 0.93, w * 0.88, e * 0.85, cor, true);
  }
  // polegar: sai da base da palma, do lado +x, e vai para a frente; fechado, cruza por cima dos dedos dobrados
  const P = fechada ? [[0.021, -0.268, 0.01], [0.031, -0.29, 0.027], [0.024, -0.306, 0.039], [0.009, -0.313, 0.042]]
    : [[0.021, -0.268, 0.01], [0.033, -0.288, 0.021], [0.038, -0.303, 0.027], [0.04, -0.316, 0.029]];
  falange(m, P[0], P[1], 0.019, 0.017, 0.016, 0.014, cor);
  falange(m, P[1], P[2], 0.0155, 0.0135, 0.014, 0.0125, cor);
  falange(m, P[2], P[3], 0.0135, 0.012, 0.0125, 0.011, cor, true);
  return m;
}
// pé e bota, nas unidades de uma pessoa de 1,75 m. A sola fica em y = -0,485, como antes (os pés não mudam de altura).
// alta: bota de cano até abaixo do joelho (xerife e ajudantes); senão, botina de cano curto sob a calça ou a saia.
// dobra: a cor do cano dobrado, largo e claro, da bota de montaria da Jack (no lugar da borda e das alças)
function botaAcabada(m, cor, alta, mPe = m, dobra = null) {
  const sola = mixc(cor, [0, 0, 0], 0.5), y0 = -0.47, mc = m; m = mPe; // o pé (gáspea, salto e sola) vai em mPe; o cano, em mc
  const sec = (z, w, y1, kc = 0.32) => { const c = Math.min(w * kc, (y1 - y0) * 0.45); return [z, [[-w / 2 + c, y1], [w / 2 - c, y1], [w / 2, y1 - c], [w / 2, y0], [-w / 2, y0], [-w / 2, y1 - c]]]; };
  // de perfil, o pé tem de se ler pela ponta: o calcanhar sai só 2,4 cm atrás do cano, baixo e arredondado, e o peito do pé
  // sobe até o cano na frente. Com o calcanhar alto e em bloco e a ponta rasa, na luz fraca o pé parecia virado para trás
  const calc = [sec(-0.074, 0.056, -0.436), sec(-0.06, 0.072, -0.425), sec(-0.02, 0.082, -0.405), sec(0.05, 0.088, -0.415), sec(0.1, 0.09, -0.434)];
  loftZ(m, calc.concat(alta ? [sec(0.14, 0.072, -0.448), sec(0.162, 0.04, -0.457), sec(0.172, 0.018, -0.462)] : [sec(0.145, 0.072, -0.448), sec(0.163, 0.04, -0.456)]), cor);
  const placa = (z, w, ya, yb) => [z, [[-w / 2, yb], [w / 2, yb], [w / 2, ya], [-w / 2, ya]]];
  loftZ(m, [placa(-0.072, 0.06, -0.485, -0.468), placa(-0.015, 0.078, -0.485, -0.468)], sola); // salto
  loftZ(m, [placa(-0.015, 0.08, -0.47, -0.465), placa(0.04, 0.088, -0.47, -0.465)], sola);  // o arco, sem tocar o chão
  loftZ(m, [placa(0.04, 0.09, -0.485, -0.468), placa(0.1, 0.095, -0.485, -0.468), placa(0.155, 0.06, -0.485, -0.468), placa(alta ? 0.172 : 0.166, alta ? 0.022 : 0.04, -0.485, -0.468)], sola);
  m.push().t(0, -0.425, 0).esfera(0.045, 10, 5, cor).pop(); // o tornozelo, sem fresta quando o pé dobra (dentro do cano)
  m = mc;
  if (alta && dobra) { // o cano sobe mais e dobra para fora, com 6 cm de couro claro
    loft(m, [[-0.44, secRoda(0.05)], [-0.36, secRoda(0.056)], [-0.2, secRoda(0.059)], [-0.09, secRoda(0.062)]], cor);
    loft(m, [[-0.108, secRoda(0.064)], [-0.1, secRoda(0.067)], [-0.046, secRoda(0.069)], [-0.042, secRoda(0.066)]], dobra);
  } else if (alta) { // cano com a boca alargada, a borda mais clara e as alças de puxar
    loft(m, [[-0.44, secRoda(0.05)], [-0.36, secRoda(0.056)], [-0.2, secRoda(0.059)], [-0.12, secRoda(0.063)]], cor);
    loft(m, [[-0.142, secRoda(0.065)], [-0.118, secRoda(0.066)]], mixc(cor, [255, 235, 210], 0.14));
    for (const sx of [-1, 1]) m.f([[sx * 0.066, -0.135, -0.012], [sx * 0.066, -0.135, 0.012], [sx * 0.066, -0.088, 0.008], [sx * 0.066, -0.088, -0.008]], mixc(cor, [0, 0, 0], 0.3));
  } else loft(m, [[-0.44, secRoda(0.05)], [-0.37, secRoda(0.053)]], cor);
}
// As peças do tronco só da Jack, no referencial do tronco de pessoaAcabada (unidades de 1,75 m; T traz as medidas dele):
// o broche de losango na gola; na garçonete, o avental (peitilho com debrum, alças que passam pelos ombros e cruzam nas
// costas, cós logo acima da saia e laço atrás); na fora da lei, o bolero aberto na frente (a blusa no V, debrum,
// losangos de ouro e barra), a faixa na cintura e a alça da bolsa, que sai da bolsa, sobe pela frente até o ombro
// esquerdo e desce pelas costas até ela de novo
function jackTronco(m, f, T) {
  const { wT, dT, zOct, zCostas, rT, ombroG, wo, peca } = T;
  const zL = (x, y, lado) => lado > 0 ? zOct(x, y) : zCostas(x, y); // a frente (lado 1) ou as costas (-1)
  const ouro = corHex('#D9AE4C'), rubi = corHex('#C21E2A');
  // pano sobre a frente (lado 1) ou as costas (lado -1), entre as bordas xl(y) e xr(y), nas alturas ys
  const pano = (xl, xr, ys, lado, dz, col, extra = () => 0) => {
    const P = (x, y) => [x, y, lado * (zL(x, y, lado) + extra(y) + dz)];
    for (let j = 0; j < ys.length - 1; j++) { const a = ys[j], b = ys[j + 1]; m.f([P(xl(a), a), P(xr(a), a), P(xr(b), b), P(xl(b), b)], col); }
  };
  // tira de largura 2·hw pela linha cs ([x, y] na frente ou nas costas); borda: a cor da espessura; devolve as bordas
  const tira = (cs, lado, hw, dz, col, extra = () => 0, borda = null) => {
    const P = (x, y) => [x, y, lado * (zL(x, Math.min(0.49, y), lado) + extra(y) + dz)], L = [], R = [];
    cs.forEach((c, k) => { const a = cs[Math.max(0, k - 1)], b = cs[Math.min(cs.length - 1, k + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      L.push(P(c[0] - dy / l * hw, c[1] + dx / l * hw)); R.push(P(c[0] + dy / l * hw, c[1] - dx / l * hw)); });
    for (let k = 0; k < cs.length - 1; k++) m.f([L[k], R[k], R[k + 1], L[k + 1]], col);
    if (borda) { const baixa = q => [q[0], q[1], q[2] - lado * dz * 0.9]; // a espessura do couro: as bordas pegam a luz
      for (const E of [L, R]) for (let k = 0; k < cs.length - 1; k++) m.f([E[k], E[k + 1], baixa(E[k + 1]), baixa(E[k])], borda); }
    return { L, R, c: cs };
  };
  // a passagem de uma tira por cima do ombro, em x, de y = 0,488 na frente até 0,488 nas costas (topo: a altura do ombro)
  const sobreOmbro = (x, hw, dz, topo, col, extra = 0) => {
    const zf = (xx, y, lado = 1) => zL(xx, y, lado) + extra + dz, A = [x - hw, x + hw];
    const F = A.map(xx => [xx, 0.488, zf(xx, 0.488)]), Ft = A.map(xx => [xx, topo + dz, zf(xx, 0.49) - 0.004]);
    const Bt = A.map(xx => [xx, topo + dz, -(zf(xx, 0.49, -1) - 0.004)]), B = A.map(xx => [xx, 0.488, -zf(xx, 0.488, -1)]);
    for (const [U, V] of [[F, Ft], [Ft, Bt], [Bt, B]]) m.f([U[0], U[1], V[1], V[0]], col);
  };
  const losango = (x, y, r, dz, col, extra) => peca([[x, y + r * 1.27], [x + r, y], [x, y - r * 1.27], [x - r, y]], dz, col, extra);
  const g = 0.016; // a espessura do bolero
  // o broche: losango vermelho com aro de ouro, na gola (na fora da lei, sobre a blusa, sob o lenço)
  const eB = f.casaco ? g + 0.004 : 0;
  losango(0, 0.404, 0.022, 0.003, ouro, eB); losango(0, 0.404, 0.0155, 0.006, rubi, eB);
  if (f.avental) {
    const av = f.avental, debrum = mixc(av, [0, 0, 0], 0.13), cos = mixc(av, [0, 0, 0], 0.07);
    // o cós, logo acima da saia, e o laço atrás
    loft(m, [0.082, 0.104, 0.124].map(y => [y, secTronco(wT(y) + 0.01, dT(y) + 0.01, rT(y))]), cos);
    const zl = -(dT(0.104) / 2 + 0.005);
    for (const sx of [-1, 1]) m.push().t(sx * 0.036, 0.11, zl - 0.012).rz(-sx * 0.32).box(0.062, 0.034, 0.012, av).pop(); // as alças do laço (as pontas caem sobre a saia)
    m.push().t(0, 0.106, zl - 0.014).box(0.022, 0.028, 0.016, cos).pop();
    // o peitilho (um trapézio dentro da frente plana) com debrum nos lados e em cima
    const xr = y => 0.08 + 0.008 * (y - 0.1) / 0.19, xl = y => -xr(y), ys = [0.1, 0.13, 0.19, 0.24, 0.29];
    pano(xl, xr, ys, 1, 0.003, av);
    pano(y => xr(y) - 0.006, xr, ys, 1, 0.0045, debrum); pano(xl, y => xl(y) + 0.006, ys, 1, 0.0045, debrum);
    pano(xl, xr, [0.283, 0.29], 1, 0.0045, debrum);
    // as alças: do peitilho aos ombros, por cima deles e, nas costas, cruzadas até o cós do outro lado
    for (const sx of [-1, 1]) {
      const dz = sx > 0 ? 0.004 : 0.0055, x = sx * 0.078;
      tira([[sx * 0.066, 0.285], [sx * 0.077, 0.36], [sx * 0.084, 0.42], [sx * 0.081, 0.455], [x, 0.478], [x, 0.488]], 1, 0.011, dz, av);
      sobreOmbro(x, 0.011, dz, 0.49, av);
      tira([[x, 0.488], [x, 0.478], [sx * 0.079, 0.45], [sx * 0.062, 0.4], [sx * 0.024, 0.32], [-sx * 0.022, 0.23], [-sx * 0.068, 0.124]], -1, 0.011, dz, av);
    }
  }
  if (f.casaco) { // o bolero: curto (de 0,15 aos ombros), aberto na frente; a blusa aparece no V
    const C = f.casaco, y0 = 0.15;
    const secB = y => { if (y <= 0.42) return secTronco(wT(y) + 2 * g, dT(y) + 2 * g, rT(y)); const q = ombroG(y); return secTronco(wo + (wo * 0.5 - wo) * q + 2 * g, 0.24 + (0.16 - 0.24) * q + 2 * g); };
    const yB = y => y + (y > 0.42 ? g * 0.8 * ombroG(y) : 0);
    loft(m, [y0, 0.24, 0.33, 0.42, 0.44, 0.456, 0.468, 0.477, 0.484, 0.49].map(y => [yB(y), secB(y)]), C.cor); tampaSec(m, yB(0.49), secB(0.49), C.cor);
    const vx = y => 0.03 + 0.04 * (y - (y0 - 0.005)) / (0.44 - (y0 - 0.005)), ysV = [y0 - 0.005, 0.24, 0.33, 0.42, 0.44], G = () => g;
    pano(y => -vx(y), vx, ysV, 1, 0.002, f.roupa, G); // a blusa no V
    for (const sx of [-1, 1]) {
      if (sx > 0) pano(vx, y => vx(y) + 0.014, ysV, 1, 0.004, C.debrum, G); else pano(y => -vx(y) - 0.014, y => -vx(y), ysV, 1, 0.004, C.debrum, G);
      for (const y of [0.22, 0.3, 0.38]) losango(sx * (vx(y) + 0.026), y, 0.0095, 0.006, C.debrum, g);
    }
    loft(m, [y0, y0 + 0.022].map(y => [y, secTronco(wT(y) + 2 * g + 0.006, dT(y) + 2 * g + 0.006, rT(y))]), C.debrum); // a barra
  }
  if (f.faixa) { // a faixa larga na cintura, logo acima da calça, com o nó e as pontas caindo do lado esquerdo
    const F = f.faixa, e = 0.02;
    loft(m, [0.07, 0.13, 0.156].map(y => [y, secTronco(wT(y) + e, dT(y) + e, rT(y))]), F);
    m.push().t(-(wT(0.11) / 2 + 0.024), 0.11, 0.03).box(0.03, 0.05, 0.06, mixc(F, [0, 0, 0], 0.2)).pop();
    for (const [dz, rz] of [[0.0, -0.1], [0.05, 0.08]]) m.push().t(-0.17, 0.005, 0.03 + dz).rz(rz).box(0.012, 0.16, 0.045, F).pop();
  }
  if (f.bolsa) { // a alça da bolsa, a tiracolo
    const couro = mixc(corHex('#5A3A22'), [255, 230, 190], 0.12), quina = mixc(couro, [255, 230, 190], 0.25), dz = 0.009, hw = 0.019; // um pouco mais clara que a bolsa: lê sobre o bolero, até à noite
    const ex = y => y >= 0.15 ? (f.casaco ? g : 0) : (y >= 0.07 && f.faixa ? 0.01 : 0);
    const fr = tira([[0.128, 0.1], [0.1, 0.15], [0.05, 0.22], [-0.01, 0.3], [-0.06, 0.37], [-0.088, 0.42], [-0.094, 0.455], [-0.094, 0.478], [-0.094, 0.488]], 1, hw, dz, couro, ex, quina);
    sobreOmbro(-0.094, hw, dz, 0.49 + (f.casaco ? g * 0.8 : 0), couro, f.casaco ? g : 0);
    const co = tira([[-0.094, 0.488], [-0.094, 0.478], [-0.095, 0.44], [-0.07, 0.38], [-0.02, 0.3], [0.04, 0.22], [0.09, 0.15], [0.128, 0.1]], -1, hw, dz, couro, ex, quina);
    // as duas pontas descem até a boca da bolsa, no quadril direito (a da frente e a de trás)
    for (const [t, k, alvo] of [[fr, fr.c.length - 1, [0.236, 0.047, 0.06]], [co, co.c.length - 1, [0.236, 0.047, -0.04]]]) {
      const Lk = t.L[k], Rk = t.R[k], c = [(Lk[0] + Rk[0]) / 2, (Lk[1] + Rk[1]) / 2, (Lk[2] + Rk[2]) / 2], d = [alvo[0] - c[0], alvo[1] - c[1], alvo[2] - c[2]];
      m.f([Lk, Rk, [Rk[0] + d[0], Rk[1] + d[1], Rk[2] + d[2]], [Lk[0] + d[0], Lk[1] + d[1], Lk[2] + d[2]]], couro);
    }
  }
}
function pessoaAcabada(f) {
  const s = f.altura / 1.75;
  const D = {
    s, quadril: 0.93 * s, coxa: 0.45 * s, canela: 0.45 * s, tronco: 0.5 * s, pescoco: 0.56 * s,
    ombro: (f.mulher ? 0.19 : 0.23) * s, braco: 0.29 * s, antebraco: 0.27 * s, larg: f.mulher ? 0.085 * s : 0.1 * s,
  };
  const P = {};
  const roupa = f.roupa, pele = f.pele, calca = f.calca || roupa, bota = f.bota;
  const barriga = (f.barriga || 0) * 0.05, escuro = (c, k = 0.35) => mixc(c, [0, 0, 0], k), claro = (c, k = 0.15) => mixc(c, [255, 245, 230], k);
  const coletePorFora = f.colete && !f.fraque, coleteNoFraque = f.colete && f.fraque, folga = 0.012;
  const branco = corHex('#E8E0D0'), couro = corHex('#3A2416');
  // ---------------- pelve
  let m = new Malha(11); m.jit = 0.03;
  m.push().s3(s);
  const sp0 = secOct(0.3, 0.2 + barriga), sp1 = secOct(0.32, 0.22 + barriga);
  loft(m, [[-0.06, sp0], [0.08, sp1]], f.saia ? f.saia : calca); tampaSec(m, -0.06, sp0, f.saia ? f.saia : calca); tampaSec(m, 0.08, sp1, f.saia ? f.saia : calca);
  if (f.cinto) { // cinto um pouco mais baixo que a cintura (sob a barriga do xerife), com passadores e fivela de latão
    const sc = secOct(0.334, 0.238 + barriga);
    loft(m, [[-0.036, sc], [0.02, sc]], couro);
    const zc = (0.238 + barriga) / 2;
    for (const x of [-0.085, 0.085]) m.f([[x - 0.006, -0.04, zc + 0.002], [x + 0.006, -0.04, zc + 0.002], [x + 0.006, 0.024, zc + 0.002], [x - 0.006, 0.024, zc + 0.002]], escuro(couro, 0.3));
    m.f([[-0.03, -0.03, zc + 0.003], [0.03, -0.03, zc + 0.003], [0.03, 0.014, zc + 0.003], [-0.03, 0.014, zc + 0.003]], PAL.latao);
    m.f([[-0.018, -0.02, zc + 0.005], [0.018, -0.02, zc + 0.005], [0.018, 0.004, zc + 0.005], [-0.018, 0.004, zc + 0.005]], escuro(couro, 0.2));
    m.f([[-0.004, -0.009, zc + 0.006], [0.012, -0.009, zc + 0.006], [0.012, -0.007, zc + 0.006], [-0.004, -0.007, zc + 0.006]], PAL.latao); // a lingueta
  }
  if (f.bolsa) { // a bolsa de couro do diamante, no quadril direito, por fora: cantos arredondados, aba em ponta, fecho de latão
    const cb = corHex('#5A3A22'), ca = corHex('#3A2416'), xb = 0.236, zb = 0.01;
    const sb = (w, d) => secOct(w, d, 0.3, 0.22).map(([x, z]) => [x + xb, z + zb]);
    const S = [[-0.105, sb(0.028, 0.142)], [-0.095, sb(0.045, 0.166)], [0.03, sb(0.045, 0.17)], [0.045, sb(0.04, 0.164)]];
    loft(m, S, cb); tampaSec(m, -0.105, S[0][1], cb); tampaSec(m, 0.045, S[3][1], ca);
    const xo = xb + 0.0236;
    m.f([[0.046, -0.082], [0.046, 0.082], [0.0, 0.082], [-0.03, 0.0], [0.0, -0.082]].map(([y, z]) => [xo, y, z + zb]), ca); // a aba, por fora, com a ponta para baixo
    m.f(Array.from({ length: 6 }, (_, k) => { const a = k / 6 * Math.PI * 2; return [xo + 0.003, -0.02 + Math.sin(a) * 0.011, zb + Math.cos(a) * 0.011]; }), PAL.latao); // o fecho
  }
  m.pop();
  P.pelve = m.geo();
  // ---------------- tronco (cintura → ombros)
  m = new Malha(12); m.jit = 0.03;
  m.push().s3(s);
  const wc = f.mulher ? 0.26 : 0.32, wo = f.mulher ? 0.36 : 0.48;
  // a Jack tem a cintura marcada logo acima da saia e da calça (1,6 cm mais estreita e 0,8 cm mais rasa em y = 0,13)
  const cint = y => f.jack ? Math.max(0, 1 - Math.abs(y - 0.13) / 0.11) : 0;
  const dT = y => (0.2 + barriga * 2) + (0.04 - barriga * 2) * y / 0.42 - 0.008 * cint(y), zT = y => dT(y) / 2, wT = y => wc + (wo - wc) * y / 0.42 - 0.016 * cint(y);
  // o ombro arredondado (de 0,42 a 0,49): sobe quase reto do braço e curva até a base do pescoço (antes, um declive reto)
  const ombroG = y => { const u = Math.min(1, Math.max(0, (y - 0.42) / 0.07)); return 1 - Math.sqrt(1 - u * u); };
  // as costas arredondam aos poucos acima da cintura (rT), para a junta com a pelve continuar a de antes
  const rT = y => Math.min(1, Math.max(0, y / 0.21));
  const secOmbro = y => { const g = ombroG(y); return secTronco(wo + (wo * 0.5 - wo) * g, 0.24 + (0.16 - 0.24) * g); };
  const secT = y => secTronco(wT(y), dT(y), rT(y)), capTopo = secOmbro(0.49);
  loft(m, (f.jack ? [0, 0.02, 0.13, 0.24, 0.42] : [0, 0.21, 0.42]).map(y => [y, secT(y)]).concat([0.44, 0.456, 0.468, 0.477, 0.484, 0.49].map(y => [y, secOmbro(y)])), roupa); tampaSec(m, 0.49, capTopo, roupa); tampaSec(m, 0, secT(0), roupa);
  // a frente do tronco em (x, y): plana no meio, chanfrada nos cantos; acima de 0,42, o ombro arredondado
  const zOct = (x, y) => { if (y > 0.42) { const g = ombroG(y), d = 0.24 - 0.08 * g, w = wo + (wo * 0.5 - wo) * g; return zChanf(x, w, d); } return zChanf(x, wT(y), dT(y)); };
  const zChanf = (x, w, d) => { const xf = w * 0.28, ax = Math.abs(x); return ax <= xf ? d / 2 : d / 2 - 0.28 * d * Math.min(1, (ax - xf) / (w * 0.22)); };
  const zCostas = (x, y) => zVerso(y > 0.42 ? secOmbro(y) : secT(y), x); // as costas, redondas nos cantos
  const bx = coleteNoFraque ? 0.66 : 1;
  const zBarriga = (x, y) => { if (!barriga) return -1; const q = 1 - (x / (0.15 * bx)) ** 2 - ((y - 0.12) / 0.12) ** 2; return q > 0 ? 0.06 + 0.15 * Math.sqrt(q) : -1; };
  const camada = coletePorFora ? folga : 0;
  const sobre = (x, y, dz, extra = camada) => [x, y, Math.max(zOct(x, y) + extra, zBarriga(x, y)) + dz];
  const peca = (pts, dz, col, extra) => m.f(pts.map(([x, y]) => sobre(x, y, dz, extra)), col);
  const gola = (x, y, dz) => [x, y, (y <= 0.49 ? zOct(x, y) : 0.064) + dz]; // pontos sobre o declive do ombro e o colarinho
  const botao = (x, y, r, col, dz = 0.006, extra) => { const c = sobre(x, y, dz, extra); discoEm(m, c, r, col); };
  if (barriga) m.push().t(0, 0.12, 0.06).s3(bx, 1, 1).esfera(0.15, 16, 8, f.colete || roupa, 0.8).pop();
  if (coleteNoFraque) {
    // ---- fraque: o tronco é o fraque; na abertura, o colete, a camisa e a gravata. O do Barão não fecha sobre a barriga.
    const yb = 0.1, aberto = barriga > 0;
    const e = y => aberto ? (y <= 0.24 ? 0.1 : 0.1 - 0.022 * (y - 0.24) / 0.18) : (y >= yb ? 0.086 * (y - yb) / (0.42 - yb) : 0.13 * Math.pow((yb - y) / (yb + 0.02), 0.8));
    const ys = [-0.02, 0.0, 0.025, 0.05, 0.075, yb, 0.16, 0.24, 0.3, 0.36, 0.42];
    for (let j = 0; j < ys.length - 1; j++) { const a = ys[j], b = ys[j + 1]; peca([[-e(a), a], [e(a), a], [e(b), b], [-e(b), b]], a < 0.02 ? 0.008 : 0.004, f.colete); }
    for (const sx of [-1, 1]) peca([[sx * 0.075, -0.02], [sx * 0.01, -0.02], [sx * 0.055, -0.046]], 0.009, f.colete); // as pontas do colete
    peca([[-0.056, 0.42], [0.056, 0.42], [0, 0.285]], 0.006, branco); // a camisa no decote do colete
    peca([[-0.05, 0.42], [0.05, 0.42], [0.034, 0.47], [-0.034, 0.47]], 0.005, branco);
    // a borda da frente do fraque, as lapelas (mais claras, como seda) com o entalhe, e os botões
    const cetim = claro(roupa, 0.16), borda = escuro(roupa, 0.25), yl = aberto ? 0.25 : 0.17;
    for (const sx of [-1, 1]) {
      for (let j = 0; j < ys.length - 1; j++) { const a = Math.max(0, ys[j]), b = ys[j + 1]; if (b <= 0) continue; peca([[sx * e(a), a], [sx * (e(a) + 0.009), a], [sx * (e(b) + 0.009), b], [sx * e(b), b]], 0.007, borda); }
      const A = [sx * (e(0.42) + 0.002), 0.43], B = [sx * (e(0.42) + 0.068), 0.42], C = [sx * (e(0.42) + 0.05), 0.392], Dl = [sx * (e(0.36) + 0.078), 0.368], E = [sx * (e(yl) + 0.006), yl];
      peca([A, B, C], 0.009, cetim); peca([A, C, Dl, E], 0.009, cetim);
      if (aberto) for (const y of [0.16, 0.07]) botao(sx * (e(y) + 0.03), y, 0.011, escuro(roupa, 0.55), 0.011);
    }
    if (!aberto) botao(0, yb, 0.012, escuro(roupa, 0.55), 0.011);
    // botões do colete
    const corBotao = aberto ? PAL.latao : escuro(f.colete, 0.45);
    for (const y of (aberto ? [0.33, 0.28, 0.22, 0.16, 0.1, 0.04] : [0.31, 0.26, 0.21, 0.16])) botao(0, y, aberto ? 0.008 : 0.0065, corBotao, 0.008);
    if (f.corrente) { // corrente de relógio dupla, de uma casa do colete aos dois bolsos, com o relógio num deles
      const yA = 0.17;
      for (const sx of [-1, 1]) {
        m.f([sobre(sx * 0.058, 0.082, 0.007), sobre(sx * 0.094, 0.086, 0.007), sobre(sx * 0.094, 0.078, 0.007), sobre(sx * 0.058, 0.074, 0.007)], escuro(f.colete, 0.45)); // bolso
        let prev = null;
        for (let k = 0; k <= 8; k++) { const t = k / 8, x = sx * 0.075 * t, y = yA - (yA - 0.085) * t - 0.03 * Math.sin(Math.PI * t), c = sobre(x, y, 0.011); if (prev) m.tubo(prev, c, 0.0032, 4, PAL.latao); prev = c; }
      }
      discoEm(m, sobre(0.075, 0.07, 0.013), 0.017, PAL.latao, 10); // o relógio, saindo do bolso
      m.tubo(sobre(-0.012, yA, 0.012), sobre(0.012, yA, 0.012), 0.004, 4, PAL.latao); // a barrinha na casa do botão
    }
    // gola da camisa (pontas viradas) e, sobre ela, plastrão com alfinete (Barão) ou gravata-borboleta (cavalheiros)
    for (const sx of [-1, 1]) m.f([gola(sx * 0.008, 0.505, 0.004), gola(sx * 0.05, 0.488, 0.005), gola(sx * 0.026, 0.462, 0.006)], branco);
    if (f.gravata && aberto) {
      const z = y => zOct(0, Math.min(0.49, y)) + 0.014;
      loft(m, [[0.475, secRoda(0.02, 8).map(([x, q]) => [x, z(0.475) + q * 0.5])], [0.44, secRoda(0.036, 8).map(([x, q]) => [x, z(0.44) + q * 0.45])],
               [0.39, secRoda(0.04, 8).map(([x, q]) => [x, z(0.39) + q * 0.4])], [0.345, secRoda(0.022, 8).map(([x, q]) => [x, z(0.345) + q * 0.35])], [0.325, secRoda(0.004, 8).map(([x, q]) => [x, z(0.33)])]], f.gravata);
      m.push().t(0, 0.41, z(0.41) + 0.016).esfera(0.008, 6, 3, PAL.latao).pop();
    } else if (f.gravata) {
      const z0 = zOct(0, 0.457) + 0.01;
      for (const sx of [-1, 1]) m.push().t(0, 0.457, z0).extrude([[0, 0], [sx * 0.048, 0.02], [sx * 0.044, -0.004], [sx * 0.048, -0.022]], 0.012, f.gravata).pop();
      m.push().t(0, 0.457, z0 + 0.002).box(0.016, 0.02, 0.016, escuro(f.gravata, 0.08)).pop();
    }
    // gola do fraque atrás do pescoço (veludo um pouco mais escuro)
    { const N = 7, gola = escuro(roupa, 0.2), anel = (r, y) => Array.from({ length: N + 1 }, (_, k) => { const a = Math.PI * (0.12 + 0.76 * k / N); return [Math.cos(a) * r, y, -Math.sin(a) * r]; });
      const A = anel(0.09, 0.465), B = anel(0.074, 0.522); for (let k = 0; k < N; k++) m.f([A[k], A[k + 1], B[k + 1], B[k]], gola); }
  }
  if (coletePorFora) {
    // ---- xerife e ajudantes: colete por cima da camisa (cavas mais estreitas), decote em V com a camisa abotoada
    const sv = y => { const u = (y - 0.012) / 0.348; return secTronco(wc + folga * 2 + (wo * 0.86 - wc - folga * 2) * u, dT(y) + folga * 2, rT(y)); };
    loft(m, [0.012, 0.21, 0.36].map(y => [y, sv(y)]), f.colete);
    peca([[-0.075, 0.36], [0.075, 0.36], [0, 0.235]], 0.002, roupa);
    peca([[-0.01, 0.36], [0.01, 0.36], [0.01, 0.245], [-0.01, 0.245]], 0.004, escuro(roupa, 0.12)); // a carcela da camisa
    for (const y of [0.265, 0.32]) botao(0, y, 0.005, claro(roupa, 0.4), 0.006);
    // a costura da frente do colete, os botões e os bolsos com lapela (um no peito, do lado sem estrela)
    for (let y = 0.02; y < 0.235; y += 0.03) peca([[-0.003, y], [0.003, y], [0.003, Math.min(0.235, y + 0.03)], [-0.003, Math.min(0.235, y + 0.03)]], 0.002, escuro(f.colete, 0.45));
    for (const y of [0.205, 0.155, 0.105, 0.055]) botao(0.012, y, 0.0075, PAL.lataoEsc, 0.005);
    for (const [x, y] of [[-0.1, 0.085], [0.1, 0.085], [0.1, 0.27]]) {
      peca([[x - 0.03, y + 0.012], [x + 0.03, y + 0.012], [x + 0.028, y - 0.012], [x - 0.028, y - 0.012]], 0.004, escuro(f.colete, 0.28));
      peca([[x - 0.028, y + 0.014], [x + 0.028, y + 0.014], [x + 0.028, y + 0.009], [x - 0.028, y + 0.009]], 0.006, escuro(f.colete, 0.5));
    }
    // a gola da camisa: pontas viradas sobre o colarinho
    for (const sx of [-1, 1]) m.f([gola(sx * 0.006, 0.505, 0.004), gola(sx * 0.068, 0.478, 0.005), gola(sx * 0.03, 0.425, 0.007)], roupa);
  }
  if (f.estrela) m.push().t(-0.1, 0.3, sobre(-0.1, 0.3, 0.008)[2]).extrude(estrela5(0.04, 0.018), 0.012, PAL.latao).pop();
  if (f.mulher && !f.jack) {
    // ---- vestido: corpete com botões de madrepérola e um V de renda, faixa na cintura, gola alta de renda com broche
    const renda = mixc(roupa, [242, 234, 218], 0.62), perola = mixc(roupa, [245, 238, 222], 0.8);
    for (let y = 0.11; y < 0.41; y += 0.055) botao(0, y, 0.0062, perola, 0.004);
    for (const sx of [-1, 1]) peca([[sx * 0.07, 0.42], [sx * 0.084, 0.42], [sx * 0.012, 0.165], [sx * 0.0, 0.165]], 0.003, renda);
    loft(m, [0.075, 0.115].map(y => [y, secTronco(wT(y) + 0.008, dT(y) + 0.008, rT(y))]), escuro(roupa, 0.32));
  }
  if (f.jack) jackTronco(m, f, { wT, dT, zOct, zCostas, rT, ombroG, wo, peca, roupa });
  if (f.lenco) m.push().t(0, 0.44, 0.04).extrude([[-0.1, 0.03], [0.1, 0.03], [0, -0.1]], f.casaco ? 0.2 : 0.16, f.lenco).pop();
  // pescoço e colarinho
  m.push().t(0, 0.47, 0).cyl(0.05, 0.047, 0.08, f.jack ? 12 : 8, pele).pop();
  if (f.mulher && !f.jack) { const renda = mixc(roupa, [242, 234, 218], 0.62); m.push().t(0, 0.468, 0).cyl(0.058, 0.054, 0.062, 10, renda, false).pop(); discoEm(m, [0, 0.5, 0.058], 0.011, PAL.latao); }
  else m.push().t(0, 0.47, 0).cyl(0.07, 0.06, 0.035, f.jack ? 14 : 8, f.gola || (f.colete ? branco : roupa), false).pop();
  m.pop();
  P.tronco = m.geo();
  P.cabeca = cabeca(f).geo();
  P.rosto = rostoMascara(f).geo();
  P.chaveRosto = [f.pele.join(','), f.cabelo.join(','), (f.olhos || [0, 0, 0]).join(','), f.mulher ? 'm' : 'h', f.bigode ? 'b' : '', f.pinta ? 'p' + f.pinta.join(',') : ''].join('|');
  { let h = 7; for (const ch of P.chaveRosto + f.altura) h = (h * 31 + ch.charCodeAt(0)) % 9973; P.semente = h / 9973; }
  const ch = chapeu(f); P.chapeu = ch ? ch.geo() : null;
  // ---------------- abas do fraque (uma; desenhaPessoa espelha para o outro lado). Origem no alto da aba, na costura das costas.
  if (f.fraque) {
    m = new Malha(19); m.jit = 0.03;
    m.push().s3(s);
    const rows = [[0, 0.012, 0.11, 0, 0.012], [-0.1, 0.012, 0.152, -0.026, 0.02], [-0.3, 0.014, 0.14, -0.044, 0.022], [-0.41, 0.022, 0.1, -0.05, 0.018]];
    const pt = (r, u) => { const [y, x0, x1, z, zw] = r; const x = x0 + (x1 - x0) * u; return [x, y, z + zw * u * u]; };
    for (let j = 0; j < rows.length - 1; j++) for (let k = 0; k < 3; k++) { const u0 = k / 3, u1 = (k + 1) / 3; m.f([pt(rows[j], u0), pt(rows[j], u1), pt(rows[j + 1], u1), pt(rows[j + 1], u0)], j % 2 ? escuro(roupa, 0.06) : roupa); }
    m.f([pt(rows[3], 0.55), pt(rows[3], 1), [0.07, -0.43, -0.052]], roupa); // a ponta arredondada
    for (let j = 0; j < rows.length - 1; j++) m.f([pt(rows[j], 0), pt(rows[j], 0.07), pt(rows[j + 1], 0.07), pt(rows[j + 1], 0)].map(([x, y, z]) => [x, y, z - 0.002]), claro(roupa, 0.12)); // debrum da fenda
    discoEm(m, [0.05, -0.012, 0.006], 0.011, escuro(roupa, 0.55)); // botão da cintura, nas costas
    m.pop();
    P.aba = m.geo();
    D.abaY = 0.06 * s; D.abaZ = (zT(0.06) + 0.004) * s;
  }
  // ---------------- braços
  m = new Malha(13); m.jit = 0.03;
  m.push().s3(s);
  const manga = f.casaco ? f.casaco.cor : roupa; // a Jack fora da lei: as mangas são as do bolero
  if (f.mulher && !f.jack) { // manga bufante no ombro (gigot), justa do cotovelo para baixo
    loft(m, [[0, secRoda(0.062)], [-0.05, secRoda(0.067)], [-0.12, secRoda(0.057)], [-0.2, secRoda(0.046)], [-0.29, secRoda(0.04)]], roupa);
    m.esfera(0.063, 14, 7, roupa);
  } else { // a da Jack, justa, com a cabeça do ombro marcada (como no figurino dela)
    loft(m, f.jack ? [[0, secRoda(0.05)], [-0.1, secRoda(0.048)], [-0.2, secRoda(0.044)], [-0.29, secRoda(0.04)]] : [[0, secRoda(0.05)], [-0.15, secRoda(0.047)], [-0.29, secRoda(0.04)]], manga);
    // a cabeça do ombro: mais lisa e um pouco achatada no alto, para não saltar como uma bola acima da linha do ombro
    m.push().s3(1, 0.78, 1).esfera(f.casaco ? 0.06 : 0.055, 18, 9, manga).pop(); }
  m.pop();
  P.braco = m.geo();
  // o antebraço com a mão aberta [0] e com a mão fechada [1], numa malha só (um desenho por braço); desenhaPessoa
  // escolhe pela coisa que a mão segura
  P.antebraco = [false, true].map(fechada => {
    m = new Malha(14); m.jit = 0.03;
    m.push().s3(s);
    m.esfera(0.043, 14, 7, manga); // o cotovelo: arredonda a dobra e fecha as pontas das mangas (sem ele, o braço dobrado mostra o tubo aberto)
    loft(m, [[0, secRoda(0.04)], [-0.2, secRoda(0.035)], [-0.27, secRoda(0.033)]], manga);
    if (f.mulher && !f.jack) loft(m, [[-0.215, secRoda(0.036)], [-0.25, secRoda(0.047)]], mixc(roupa, [242, 234, 218], 0.62)); // punho de renda
    else if (f.jack) { // o punho da Jack: do avental na garçonete, de ouro no bolero, o cano da luva na fora da lei
      const r = f.luvas ? 0.039 : 0.036, punho = f.casaco ? f.casaco.debrum : f.luvas ? mixc(f.luvas, [0, 0, 0], 0.15) : (f.avental || f.gola || roupa);
      loft(m, [[-0.205, secRoda(r)], [-0.245, secRoda(r)]], punho);
    } else {
      if (f.fraque) loft(m, [[-0.2, secRoda(0.042)], [-0.178, secRoda(0.042)]], escuro(roupa, 0.25)); // a boca da manga do fraque
      loft(m, [[-0.248, secRoda(0.037)], [-0.205, secRoda(0.037)]], f.fraque ? branco : escuro(roupa, 0.1)); // o punho da camisa
      if (f.fraque) discoEm(m, [0, -0.228, 0.039], 0.006, PAL.latao, 6); // abotoadura
    }
    maoModelo(m, f.luvas || pele, fechada);
    m.pop();
    return m.geo();
  });
  // ---------------- pernas: calça com vinco; botas (ou botinas sob a calça e a saia)
  const vinco = f.mulher ? 0 : 0.2, alta = !!f.cinto || !!f.botaAlta;
  m = new Malha(15); m.jit = 0.03;
  m.push().s3(s); loft(m, f.jack ? [[0, secRoda(0.075)], [-0.22, secRoda(0.066)], [-0.45, secRoda(0.055)]] : [[0, secRoda(0.075, LADOS_MEMBRO, vinco)], [-0.45, secRoda(0.055, LADOS_MEMBRO, vinco)]], calca); tampaSec(m, 0, secRoda(0.075, LADOS_MEMBRO, vinco), calca); m.pop();
  P.coxa = m.geo();
  m = new Malha(16); m.jit = 0.03;
  m.push().s3(s);
  if (alta) loft(m, [[0, secRoda(0.055, LADOS_MEMBRO, vinco)], [-0.3, secRoda(0.05, LADOS_MEMBRO, vinco)], [-0.42, secRoda(0.048, LADOS_MEMBRO, vinco)]], calca);
  else if (f.jack) loft(m, [[0, secRoda(0.055)], [-0.15, secRoda(0.057)], [-0.42, secRoda(0.047)]], calca); // a panturrilha
  else if (f.mulher) loft(m, [[0, secRoda(0.055)], [-0.42, secRoda(0.048)]], calca);
  else loft(m, [[0, secRoda(0.055, LADOS_MEMBRO, vinco)], [-0.3, secRoda(0.054, LADOS_MEMBRO, vinco)], [-0.405, secRoda(0.059, LADOS_MEMBRO, vinco * 0.6)]], calca); // a barra da calça cobre a botina
  const mPe = new Malha(19); mPe.jit = 0.03; mPe.push().s3(s);
  botaAcabada(m, bota, alta, mPe, f.canoBota || null);
  if (f.jack && !alta) { // a garçonete: botina de cano alto até o meio da canela, abotoada do lado de fora
    loft(m, [[-0.38, secRoda(0.0535)], [-0.24, secRoda(0.059)], [-0.12, secRoda(0.058)], [-0.1, secRoda(0.059)]], bota);
    for (let y = -0.36; y < -0.12; y += 0.04) discoEm(m, [0, y, 0], 0.0045, mixc(bota, [0, 0, 0], 0.4), 5);
  }
  m.pop(); mPe.pop();
  P.canela = m.geo(); P.pe = mPe.geo();
  // ---------------- coldre (preso à coxa direita, por fora; acompanha a perna e não a atravessa)
  if (f.cinto) {
    m = new Malha(20); m.jit = 0.03;
    m.push().s3(s);
    const cc = corHex('#4A2E18'), q = (y, z0, z1, x0 = 0.084, x1 = 0.12) => [y, [[x0, z1], [x1, z1], [x1, z0], [x0, z0]]];
    loft(m, [q(0.03, -0.036, 0.048), q(-0.07, -0.032, 0.042), q(-0.19, -0.018, 0.026, 0.088, 0.116), q(-0.215, -0.008, 0.012, 0.092, 0.112)], cc);
    tampaSec(m, -0.215, q(-0.215, -0.008, 0.012, 0.092, 0.112)[1], cc);
    m.f([[0.084, 0.03, 0.048], [0.084, 0.03, -0.036], [0.084, -0.02, -0.03], [0.084, -0.02, 0.044]], escuro(cc, 0.2));
    for (const [y, dz] of [[-0.01, 0], [-0.13, 0]]) m.f([[0.121, y, -0.03 + dz], [0.121, y, 0.04], [0.121, y - 0.008, 0.04], [0.121, y - 0.008, -0.03 + dz]], escuro(cc, 0.4)); // costuras
    loft(m, [[-0.16, secRoda(0.071, LADOS_MEMBRO, vinco)], [-0.175, secRoda(0.071, LADOS_MEMBRO, vinco)]], escuro(cc, 0.1)); // a tira que prende na coxa
    m.pop();
    P.coldre = m.geo();
  }
  // ---------------- saia (presa à pelve): pregas que se abrem para a barra, volume atrás (anquinha) e um babado na barra
  if (f.saia) {
    m = new Malha(17); m.jit = 0.025;
    const perfil = [[0.205, 0.08], [0.212, -0.04], [0.235, -0.22], [0.27, -0.45], [0.3, -0.66], [0.322, -0.86]];
    const raioP = y => { for (let i = 0; i < perfil.length - 1; i++) { const [r0, y0] = perfil[i], [r1, y1] = perfil[i + 1]; if (y <= y0 && y >= y1) return r0 + (r1 - r0) * (y0 - y) / (y0 - y1); } return perfil[perfil.length - 1][0]; };
    // a da Jack: a mesma silhueta, sem a anquinha e o babado das damas, com pregas mais rasas e o avental na frente
    const jack = !!f.jack, N = jack ? 22 : 28, ys = [0.08, -0.04, -0.13, -0.22, -0.34, -0.45, -0.56, -0.66, -0.76, -0.86], fundo = jack ? 0.032 : 0.045;
    const abre = y => Math.min(1, (0.06 - y) / 0.5);
    const R = (y, a, k) => { const prega = abre(y) * fundo * (k % 2 ? 1 : -1), anca = jack ? 0 : Math.max(0, -Math.sin(a)) ** 2 * 0.11 * Math.max(0, 1 - Math.abs(y + 0.16) / 0.42);
      return raioP(y) * (1 + prega + anca); };
    const pt = (y, k) => { const a = k / N * Math.PI * 2; const r = R(y, a, k); return [Math.cos(a) * r * s, y * s, Math.sin(a) * r * s]; };
    for (let j = 0; j < ys.length - 1; j++) for (let k = 0; k < N; k++) m.f([pt(ys[j], k), pt(ys[j], k + 1), pt(ys[j + 1], k + 1), pt(ys[j + 1], k)], k % 2 ? f.saia : escuro(f.saia, 0.1));
    // o quadril: fecha o alto da saia até dentro do corpete (sem a "prateleira" oca na cintura)
    for (let k = 0; k < N; k++) { const a = k / N * Math.PI * 2, b = (k + 1) / N * Math.PI * 2;
      m.f([pt(0.08, k), pt(0.08, k + 1), [Math.cos(b) * 0.12 * s, 0.1 * s, Math.sin(b) * 0.085 * s], [Math.cos(a) * 0.12 * s, 0.1 * s, Math.sin(a) * 0.085 * s]], f.saia); }
    // babado na barra
    const bab = (y, k, mais) => { const p = pt(y, k), l = Math.hypot(p[0], p[2]) || 1; return [p[0] * (1 + mais / l), p[1], p[2] * (1 + mais / l)]; };
    if (!jack) for (let k = 0; k < N; k++) m.f([bab(-0.74, k, 0.008 * s), bab(-0.74, k + 1, 0.008 * s), bab(-0.86, k + 1, 0.016 * s), bab(-0.86, k, 0.016 * s)], k % 2 ? escuro(f.saia, 0.22) : escuro(f.saia, 0.3));
    if (f.avental) { // o avental da garçonete: do cós até 26 cm da barra, por cima das pregas, com debrum nos lados e na barra
      const A = f.avental, deb = mixc(A, [0, 0, 0], 0.13), a0 = Math.PI / 2 - 0.62, a1 = Math.PI / 2 + 0.62, Na = 8, d = 0.03;
      const pa = (y, a) => { const r = raioP(y) * (1 + fundo * Math.max(0, abre(y))) + 0.004; return [Math.cos(a) * r * s, y * s, Math.sin(a) * r * s]; };
      const faixa = (ya, yb, b0, b1, n, col) => { for (let k = 0; k < n; k++) { const a = b0 + (b1 - b0) * k / n, b = b0 + (b1 - b0) * (k + 1) / n; m.f([pa(ya, a), pa(ya, b), pa(yb, b), pa(yb, a)], col); } };
      const yA = [0.08, -0.04, -0.15, -0.3, -0.45, -0.56];
      for (let j = 0; j < yA.length - 1; j++) faixa(yA[j], yA[j + 1], a0 + d, a1 - d, Na, A);
      faixa(-0.56, -0.6, a0, a1, Na, deb); faixa(0.08, -0.56, a0, a0 + d, 1, deb); faixa(0.08, -0.56, a1 - d, a1, 1, deb);
      // as pontas do laço das costas (o laço está no cós, no tronco): saem de baixo dele e caem sobre a saia, cortadas em diagonal
      const pb = (x, y) => { if (y >= 0.1) return [x * s, y * s, -(0.085 * Math.sqrt(Math.max(0, 1 - (x / 0.12) ** 2)) + 0.004) * s];
        const rr = raioP(y) * (1 + fundo * Math.max(0, abre(y))) + 0.005; return [x * s, y * s, -Math.sqrt(Math.max(0, rr * rr - x * x)) * s]; };
      for (const sx of [-1, 1]) {
        const xa = y => sx * (0.012 + 0.03 * (0.1 - y) / 0.3), xb = y => xa(y) + sx * 0.042, yy = [0.1, 0.08, -0.04, -0.16];
        for (let j = 0; j < yy.length - 1; j++) m.f([pb(xa(yy[j]), yy[j]), pb(xb(yy[j]), yy[j]), pb(xb(yy[j + 1]), yy[j + 1]), pb(xa(yy[j + 1]), yy[j + 1])], A);
        m.f([pb(xa(-0.16), -0.16), pb(xb(-0.16), -0.16), pb(xb(-0.18), -0.18), pb(xa(-0.215), -0.215)], A);
      }
    }
    P.saia = m.geo();
    // saia de quem está sentada: o colo arredondado sobre as coxas e a queda pregueada na frente dos joelhos até as canelas
    m = new Malha(18); m.jit = 0.025;
    m.push().s3(s);
    const colo = (z, w, y0, y1) => { const h = y1 - y0, c = Math.min(w * 0.25, h * 0.42); return [z, [[-w / 2 + c, y1], [w / 2 - c, y1], [w / 2, y1 - c], [w / 2, y0 + c * 0.5], [w / 2 - c * 0.5, y0], [-w / 2 + c * 0.5, y0], [-w / 2, y0 + c * 0.5], [-w / 2, y1 - c]]]; };
    loftZ(m, [colo(-0.16, 0.42, -0.13, 0.09), colo(0.0, 0.46, -0.11, 0.12), colo(0.28, 0.46, -0.1, 0.115), colo(0.5, 0.47, -0.1, 0.1)], f.saia);
    const Nq = 16, queda = (y, rx, rz) => Array.from({ length: Nq }, (_, k) => { const a = k / Nq * Math.PI * 2, pr = (Math.sin(a) > 0 ? 1 : 0.3) * (k % 2 ? 0.012 : -0.008); return [Math.cos(a) * (rx + pr), 0.47 + Math.sin(a) * (rz + pr)]; });
    loft(m, [[0.1, queda(0.1, 0.235, 0.085)], [-0.15, queda(-0.15, 0.245, 0.09)], [-0.4, queda(-0.4, 0.258, 0.095)]], (i) => i % 2 ? f.saia : escuro(f.saia, 0.1));
    if (!jack) loft(m, [[-0.33, queda(-0.33, 0.262, 0.099)], [-0.415, queda(-0.415, 0.268, 0.103)]], escuro(f.saia, 0.26)); // babado
    if (f.avental) { // o avental no colo e caindo na frente dos joelhos
      const A = f.avental, deb = mixc(A, [0, 0, 0], 0.13), xs = [-0.13, -0.065, 0, 0.065, 0.13];
      const yColo = z => z < 0 ? 0.12 : z < 0.28 ? 0.12 - 0.005 * z / 0.28 : 0.115 - 0.015 * (z - 0.28) / 0.22;
      const zs = [0.0, 0.14, 0.28, 0.4, 0.5];
      for (let j = 0; j < zs.length - 1; j++) m.f([[-0.13, yColo(zs[j]) + 0.004, zs[j]], [-0.13, yColo(zs[j + 1]) + 0.004, zs[j + 1]], [0.13, yColo(zs[j + 1]) + 0.004, zs[j + 1]], [0.13, yColo(zs[j]) + 0.004, zs[j]]], A);
      const rzq = y => 0.085 + (0.09 - 0.085) * (0.1 - y) / 0.25, zq = (x, y) => 0.47 + (rzq(y) + 0.018) * Math.sqrt(Math.max(0, 1 - (x / 0.253) ** 2));
      const yq = [0.104, 0.0, -0.12, -0.24, -0.31, -0.34];
      for (let j = 0; j < yq.length - 1; j++) for (let i = 0; i < xs.length - 1; i++)
        m.f([[xs[i], yq[j], zq(xs[i], yq[j])], [xs[i + 1], yq[j], zq(xs[i + 1], yq[j])], [xs[i + 1], yq[j + 1], zq(xs[i + 1], yq[j + 1])], [xs[i], yq[j + 1], zq(xs[i], yq[j + 1])]], j === yq.length - 2 ? deb : A);
      for (let i = 0; i < xs.length - 1; i++) m.f([[xs[i], yColo(0.5) + 0.004, 0.5], [xs[i + 1], yColo(0.5) + 0.004, 0.5], [xs[i + 1], 0.104, zq(xs[i + 1], 0.104)], [xs[i], 0.104, zq(xs[i], 0.104)]], A); // a quina do joelho
    }
    m.pop();
    P.saiaSentada = m.geo();
  }
  return { f, D, P, chaveRosto: P.chaveRosto, semente: P.semente };
}
function estrela5(R, r) { const p = []; for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R; p.push([Math.cos(a) * rr, Math.sin(a) * rr]); } return p; }

// ---------------------------------------------------------------- cavalo
// Cavalo (centro do corpo na origem, frente em +z). Os pivôs são os de antes (pescoço em (0, 0,18, 0,8) do corpo;
// cabeça em (0, 0,36, 0,5) do pescoço; pernas em (±0,17, -0,1, ±0,72)): o galope, o salto e os cavaleiros não mudam.
// A cabeça é modelada ao longo do próprio eixo (nuca → focinho) e inclinada CAB_INCL para baixo; BOCA_CAVALO é a
// argola do freio (de cada lado), onde prendem as rédeas, desenhadas a cada quadro com as mãos de quem monta.
const CAB_INCL = 0.38, BOCA_CAVALO = [0.074, -0.038, 0.5];
function secCabecaCavalo(w, h, yc, n = 14) { // seção arredondada (superelipse), mais estreita embaixo (a ganacha)
  const P = []; for (let k = 0; k < n; k++) { const a = Math.PI / 2 + k * Math.PI * 2 / n, c = Math.cos(a), sn = Math.sin(a);
    const x = w * Math.sign(c) * Math.pow(Math.abs(c), 0.7) * (sn < 0 ? 1 - 0.22 * Math.abs(sn) : 1), y = yc + h * Math.sign(sn) * Math.pow(Math.abs(sn), 0.8);
    P.push([x, y]); } return P; }
// O corpo do cavalo por seções. Os volumes (barril, garupa, quartos, pontas da anca, soldras, peito, peitorais, espáduas e
// cernelha) são elipsoides fundidos com junção suave (um campo de distância aproximado); cada seção ao longo de z é
// o contorno desse campo, medido em raios a partir do meio da seção. Entre a cernelha e o lombo (onde vão a manta, a
// sela e a barrigueira), a seção é exatamente a elipse do lombo: 0,2914 de meia largura e 0,372 de meia altura.
const LOMBO_CAV = [0.2914, 0.372];
function dElipsoide(p, c, r, gx = 0) { // aproximação de Quilez: k0 (k0 - 1) / k1; gx gira o elipsoide em torno de x
  let x = p[0] - c[0], y = p[1] - c[1], z = p[2] - c[2];
  if (gx) { const cs = Math.cos(gx), sn = Math.sin(gx); [y, z] = [y * cs + z * sn, -y * sn + z * cs]; }
  const k0 = Math.hypot(x / r[0], y / r[1], z / r[2]), k1 = Math.hypot(x / (r[0] * r[0]), y / (r[1] * r[1]), z / (r[2] * r[2]));
  return k1 < 1e-9 ? -Math.min(r[0], r[1], r[2]) : k0 * (k0 - 1) / k1;
}
function sminCav(a, b, k) { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k / 4; }
// [centro, raios, giro em x, dos dois lados]
const VOLUMES_CAV = [
  [[0, 0.13, -0.78], [0.27, 0.29, 0.335], 0, false],    // garupa
  [[0.12, -0.02, -0.84], [0.18, 0.34, 0.24], -0.25, true], // quartos (as nádegas e a coxa), descendo para a perna, com o sulco entre eles atrás
  [[0.232, 0.25, -0.56], [0.06, 0.075, 0.1], 0, true],  // pontas da anca
  [[0.17, -0.1, -0.68], [0.12, 0.17, 0.15], 0, true],   // soldras: o alto da perna de trás entra no corpo
  [[0, 0.08, 0.72], [0.25, 0.3, 0.29], 0, false],       // peito
  [[0.165, -0.05, 0.75], [0.11, 0.17, 0.15], 0.45, true], // braços: do ombro ao cotovelo, onde a perna da frente sai do corpo
  [[0.09, -0.06, 0.84], [0.12, 0.18, 0.16], 0, true],   // peitorais, com o sulco entre eles na frente
  [[0.15, 0.13, 0.74], [0.1, 0.29, 0.13], -0.73, true], // espáduas, da ponta do ombro até a cernelha
  [[0, 0.26, 0.6], [0.1, 0.13, 0.24], 0, false],        // cernelha
];
function campoCavalo(p) {
  const zz = p[2] - 0.015, u = Math.sign(zz) * Math.max(0, Math.abs(zz) - 0.43); // o barril: reto no meio, pontas elipsoidais
  let d = dElipsoide([p[0], p[1], u], [0, 0, 0], [LOMBO_CAV[0], LOMBO_CAV[1], 0.45]);
  for (const [c, r, g, par] of VOLUMES_CAV) { d = sminCav(d, dElipsoide(p, c, r, g), 0.1); if (par) d = sminCav(d, dElipsoide(p, [-c[0], c[1], c[2]], r, g), 0.1); }
  return d;
}
// seção de perna de cavalo, 14 pontos: a frente é meia elipse (w de meia largura, f para a frente); atrás, o tendão deixa a
// seção achatada (t para trás), e kb a estreita na direção do tendão
function secPernaCav(w, f, t, kb = 0.85, n = 14) {
  const P = []; for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2, s = Math.sin(a), c = Math.cos(a);
    if (c >= 0) P.push([w * s, f * c]);
    else { const e = 0.6, q = Math.pow(-c, 0.5); P.push([w * Math.sign(s) * Math.pow(Math.abs(s), e) * (1 + (kb - 1) * q), -t * Math.pow(-c, e)]); } }
  return P;
}
let _secCorpoCav = null;
function secoesCorpoCavalo() {
  if (_secCorpoCav) return _secCorpoCav;
  const N = 24, [ea, eb] = LOMBO_CAV, M0 = -0.38, M1 = 0.42; // de M0 a M1, a elipse do lombo
  const elipse = th => 1 / Math.hypot(Math.sin(th) / ea, Math.cos(th) / eb);
  const dentro = (x, y, z) => campoCavalo([x, y, z]) < 0;
  // as pontas: onde o campo acaba ao longo de z (na altura em que o corpo vai mais longe)
  const ponta = s => { let best = 0; for (let y = -0.2; y <= 0.35; y += 0.01) for (let z = 1.3; z > 0.5; z -= 0.004) if (dentro(0.06, y, s * z)) { best = Math.max(best, z); break; } return s * best; };
  const z0 = ponta(-1), z1 = ponta(1);
  const ZS = [z0 + 0.004, z0 + 0.015, z0 + 0.035, z0 + 0.065, -1.0, -0.94, -0.88, -0.82, -0.76, -0.7, -0.64, -0.58, -0.52, -0.46, M0, -0.1, 0.2, M1,
    0.49, 0.55, 0.61, 0.67, 0.73, 0.79, 0.85, 0.9, z1 - 0.1, z1 - 0.065, z1 - 0.035, z1 - 0.015, z1 - 0.004].filter((z, i, a) => i === 0 || z > a[i - 1] + 0.003);
  const peso = z => z < M0 ? Math.min(1, (M0 - z) / 0.08) : z > M1 ? Math.min(1, (z - M1) / 0.08) : 0;
  _secCorpoCav = ZS.map(z => {
    let lo = null, hi = null; for (let y = -0.7; y <= 0.7; y += 0.005) if (dentro(0, y, z)) { if (lo === null) lo = y; hi = y; }
    if (lo === null) { let best = 0; for (let y = -0.3; y <= 0.4; y += 0.005) if (campoCavalo([0, y, z]) < campoCavalo([0, best, z])) best = y; lo = hi = best; }
    const w = peso(z), yc = w * (lo + hi) / 2, pts = [];
    for (let i = 0; i < N; i++) { const th = i / N * Math.PI * 2, dx = Math.sin(th), dy = Math.cos(th);
      let r = 0.8; while (r > 0 && !dentro(dx * r, yc + dy * r, z)) r -= 0.01;
      if (r > 0) { let a = r, b = r + 0.01; for (let k = 0; k < 14; k++) { const m = (a + b) / 2; if (dentro(dx * m, yc + dy * m, z)) a = m; else b = m; } r = (a + b) / 2; } else r = 0.004;
      if (w < 1) { const re = elipse(th), xe = dx * re, ye = dy * re; pts.push([xe + (dx * r - xe) * w, ye + (yc + dy * r - ye) * w]); }
      else pts.push([dx * r, yc + dy * r]); }
    return [z, pts];
  });
  return _secCorpoCav;
}
function cavalo(cor, crina) {
  const P = {};
  const c2 = mixc(cor, [0, 0, 0], 0.25), casco = corHex('#2A2420'), couro = corHex('#3A2010'), couroC = corHex('#5A3418'), latao = PAL.latao;
  const escuroCrina = mixc(crina, [0, 0, 0], 0.3), claroCrina = mixc(crina, [255, 240, 220], 0.08);
  let m = new Malha(31); m.jit = 0.04;
  // tronco: as seções do peito à garupa (secoesCorpoCavalo)
  loftZ(m, secoesCorpoCavalo(), cor);
  // o lombo: no meio, a seção tem 0,29 de meia largura e 0,372 de meia altura (LOMBO_CAV);
  // lombo(phi, d) é o ponto da seção a um ângulo phi do alto, afastado d da superfície
  const lombo = (phi, d) => [Math.sin(phi) * (0.31 * 0.94 + d), Math.cos(phi) * (0.31 * 1.2 + d)];
  const manta = corHex('#8A2A2A'), debrum = corHex('#4A1416'), NM = 14, PH = 1.15;
  for (let i = 0; i < NM; i++) { const a = -PH + 2 * PH * i / NM, b = -PH + 2 * PH * (i + 1) / NM, A = lombo(a, 0.01), B = lombo(b, 0.01);
    for (const [z0, z1, cc] of [[-0.37, -0.34, debrum], [-0.34, 0.38, manta], [0.38, 0.41, debrum]]) m.f([[A[0], A[1], z0], [B[0], B[1], z0], [B[0], B[1], z1], [A[0], A[1], z1]], cc); }
  for (const sx of [-1, 1]) { const A = lombo(sx * PH, 0.01), B = lombo(sx * (PH + 0.06), 0.002); m.f([[A[0], A[1], -0.37], [A[0], A[1], 0.41], [B[0], B[1], 0.41], [B[0], B[1], -0.37]], debrum); } // a borda caída da manta
  // sela ao estilo do oeste: uma casca sobre o lombo, mais alta atrás (patilha) e na frente (cabeça, com o pito)
  const NS = 14, ANG = 1.3, zs = [-0.26, -0.22, -0.16, -0.08, 0, 0.08, 0.15, 0.21, 0.26];
  const alto = z => 0.024 + 0.08 * Math.pow(Math.max(0, -z - 0.05) / 0.21, 2) + 0.07 * Math.pow(Math.max(0, z - 0.06) / 0.2, 2);
  const sela = (u, z) => { const q = lombo(u * ANG, 0.022 + alto(z) * (1 - u * u)); return [q[0], q[1], z]; };
  for (let j = 0; j < zs.length - 1; j++) for (let k = 0; k < NS; k++) { const u0 = -1 + 2 * k / NS, u1 = -1 + 2 * (k + 1) / NS;
    m.f([sela(u0, zs[j]), sela(u1, zs[j]), sela(u1, zs[j + 1]), sela(u0, zs[j + 1])], j === 0 || j === zs.length - 2 || Math.abs(u0) > 0.85 ? couro : couroC); }
  for (const z of [zs[0], zs[zs.length - 1]]) { // as pontas fecham entre a casca e o lombo
    const cima = Array.from({ length: NS + 1 }, (_, k) => sela(-1 + 2 * k / NS, z)), baixo = cima.map((q, k) => { const r = lombo((-1 + 2 * k / NS) * ANG, 0.015); return [r[0], r[1], z]; }).reverse();
    m.f(cima.concat(baixo), couro); }
  { const yp = lombo(0, 0.022 + alto(0.215))[1]; m.push().t(0, yp - 0.01, 0.215).cyl(0.024, 0.029, 0.065, 10, couro).pop(); m.push().t(0, yp + 0.055, 0.215).cyl(0.044, 0.044, 0.016, 12, couroC).pop(); } // o pito
  for (const sx of [-1, 1]) {
    // abas de couro dos lados, descendo da borda da sela
    const ab = (v, z) => { const q = lombo(sx * (ANG + 0.62 * v), 0.024); return [q[0], q[1], z]; };
    for (let k = 0; k < 4; k++) { const v0 = k / 4, v1 = (k + 1) / 4, za = 0.21 - 0.03 * v0, zb = 0.21 - 0.03 * v1;
      m.f(sx > 0 ? [ab(v0, -za), ab(v0, za), ab(v1, zb), ab(v1, -zb)] : [ab(v0, za), ab(v0, -za), ab(v1, -zb), ab(v1, zb)], couroC); }
    // a barrigueira, da aba até debaixo da barriga, com a argola
    const bg = v => { const q = lombo(sx * (ANG + 0.55 + (Math.PI - ANG - 0.55) * v), 0.008); return [q[0], q[1]]; };
    for (let k = 0; k < 6; k++) { const p0 = bg(k / 6), p1 = bg((k + 1) / 6); m.f([[p0[0], p0[1], 0.09], [p0[0], p0[1], 0.15], [p1[0], p1[1], 0.15], [p1[0], p1[1], 0.09]], couro); }
    const ar = lombo(sx * (ANG + 0.56), 0.03); m.push().t(ar[0], ar[1], 0.12).rz(sx * (ANG + 0.56)).cyl(0.03, 0.03, 0.008, 10, latao, false).pop();
  }
  P.corpo = m.geo();
  // pescoço (pivô na cernelha, cresce para +y,+z), achatado dos lados, com a crina caindo para a direita
  m = new Malha(32); m.jit = 0.04;
  const perfP = perfilLiso([[0.21, 0], [0.19, 0.2], [0.15, 0.45], [0.12, 0.6], [0.0, 0.62]], 2), rP = y => raioEm(perfP.map(([r, yy]) => [r, yy]), y);
  m.push().rx(0.95).s3(0.8, 1, 1).lathe(perfP, 14, cor).pop();
  { const NC = 16, ponto = (y, ang, fora) => { const r = rP(y) + fora; return _rxM([Math.sin(ang) * r * 0.8, y, -Math.cos(ang) * r], 0.95); };
    for (let k = 0; k < NC; k++) { // a crista e a borda do outro lado, contínuas, cobrem a raiz das mechas
      const y0 = 0.02 + 0.58 * k / NC, y1 = 0.02 + 0.58 * (k + 1) / NC, fim = (k + 1) / NC > 0.95;
      const cc = k % 4 === 3 ? mixc(crina, escuroCrina, 0.5) : crina;
      m.f([ponto(y0, -0.35, 0.03), ponto(y1, -0.35, 0.03), ponto(y1, 0.15, 0.045), ponto(y0, 0.15, 0.045)], cc); // a crista
      m.f([ponto(y0, -0.35, 0.03), ponto(y0, -0.5, 0.012), ponto(y1, -0.5, 0.012), ponto(y1, -0.35, 0.03)], escuroCrina); // a borda do outro lado
      if (fim) break;
    }
    // as mechas caindo pelo lado direito: cada uma mais larga que o passo (cobrem-se umas às outras, em duas camadas), com a
    // ponta fina e de comprimento desigual, puxada um pouco para a cernelha
    const NL = 15, passo = 0.56 / NL;
    for (let k = 0; k < NL; k++) {
      const yc = 0.035 + passo * (k + 0.5), ya = yc - passo * 0.68, yb = Math.min(0.6, yc + passo * 0.68), dz = k % 2 ? 0.008 : 0;
      const fundo = 0.92 + 0.42 * hash2(k, 31), meio = 0.58 + 0.08 * hash2(k, 17), yp = yc - 0.012 - 0.01 * hash2(k, 5);
      const cc = k % 3 === 2 ? mixc(crina, escuroCrina, 0.6) : k % 3 === 1 ? mixc(crina, claroCrina, 0.5) : crina;
      m.f([ponto(ya, 0.12, 0.044 + dz), ponto(yb, 0.12, 0.044 + dz), ponto(yb - 0.004, meio, 0.028 + dz), ponto(ya - 0.004, meio, 0.028 + dz)], cc);
      m.f([ponto(ya - 0.004, meio, 0.028 + dz), ponto(yb - 0.004, meio, 0.028 + dz), ponto(yp, fundo, 0.02 + dz)], cc);
    } }
  P.pescoco = m.geo();
  // cabeça (pivô na nuca): seções ao longo do eixo, do crânio ao focinho, com ganacha, olhos, narinas, orelhas e topete;
  // cabeçada de couro com testeira e focinheira, e as argolas do freio
  m = new Malha(33); m.jit = 0.035;
  m.push().rx(CAB_INCL);
  const SEC = [[-0.05, 0.08, 0.1, -0.01], [0.0, 0.088, 0.112, -0.012], [0.06, 0.096, 0.122, -0.008], [0.14, 0.1, 0.132, -0.022], [0.24, 0.09, 0.118, -0.018], [0.34, 0.077, 0.095, -0.002], [0.44, 0.067, 0.082, 0.004], [0.52, 0.071, 0.078, 0.0], [0.58, 0.061, 0.066, -0.006], [0.61, 0.04, 0.046, -0.006]];
  loftZ(m, SEC.map(([z, w, h, yc]) => [z, secCabecaCavalo(w, h, yc)]), cor);
  const secEm = z => { for (let i = 0; i < SEC.length - 1; i++) if (z <= SEC[i + 1][0]) { const a = SEC[i], b = SEC[i + 1], u = (z - a[0]) / (b[0] - a[0]); return [lerp1(a[1], b[1], u), lerp1(a[2], b[2], u), lerp1(a[3], b[3], u)]; } return SEC[SEC.length - 1].slice(1); };
  const faixa = (z, larg, col, folga = 0.006) => { const [w, h, yc] = secEm(z), [w2, h2, yc2] = secEm(z + larg); loftZ(m, [[z, secCabecaCavalo(w + folga, h + folga, yc)], [z + larg, secCabecaCavalo(w2 + folga, h2 + folga, yc2)]], col, false); };
  for (const sx of [-1, 1]) {
    const [w0, h0, y0] = secEm(0.13);
    m.push().t(sx * (w0 * 0.96), y0 + h0 * 0.32, 0.13).s3(0.5, 0.75, 1).esfera(0.02, 8, 4, corHex('#0C0A0A')).pop(); // olho
    const [w1, h1, y1] = secEm(0.585);
    m.push().t(sx * w1 * 0.55, y1 + h1 * 0.12, 0.598).s3(0.7, 1, 0.35).esfera(0.014, 8, 4, corHex('#120C0A')).pop(); // narina
    // orelha: folha em cone achatado, voltada para a frente e um pouco para fora
    m.push().t(sx * 0.045, 0.085, 0.03).rz(-sx * 0.25).rx(-0.25).s3(1, 1, 0.55).cyl(0.03, 0.004, 0.15, 8, c2).pop();
    m.push().t(sx * 0.045, 0.087, 0.034).rz(-sx * 0.25).rx(-0.25).s3(0.6, 0.85, 0.3).cyl(0.03, 0.004, 0.15, 8, mixc(cor, [0, 0, 0], 0.55)).pop();
    // a face lateral da cabeçada: do topo, pela bochecha, até a argola do freio
    const [wb, hb, yb] = secEm(0.3);
    m.tubo([sx * (0.094 + 0.007), 0.04, 0.05], [sx * (wb + 0.006), yb - hb * 0.25, 0.3], 0.008, 4, couro);
    m.tubo([sx * (wb + 0.006), yb - hb * 0.25, 0.3], [sx * BOCA_CAVALO[0], BOCA_CAVALO[1], BOCA_CAVALO[2]], 0.008, 4, couro);
    m.push().t(sx * (BOCA_CAVALO[0] + 0.004), BOCA_CAVALO[1], BOCA_CAVALO[2]).rz(Math.PI / 2).cyl(0.019, 0.019, 0.006, 10, latao, false).pop(); // argola do freio
  }
  // a boca: um vinco escuro dos dois lados
  for (const sx of [-1, 1]) { const [w, h, yc] = secEm(0.54); m.tubo([sx * w * 0.9, yc - h * 0.45, 0.47], [sx * w * 0.5, yc - h * 0.7, 0.6], 0.004, 3, corHex('#140E0C')); }
  faixa(0.035, 0.022, couro); // nuca
  faixa(0.4, 0.026, couro);   // focinheira
  { const [w, h, yc] = secEm(0.07); m.f([[-w * 0.7, yc + h * 0.82, 0.062], [w * 0.7, yc + h * 0.82, 0.062], [w * 0.7, yc + h * 0.75, 0.084], [-w * 0.7, yc + h * 0.75, 0.084]].map(([x, y, z]) => [x, y + 0.012, z]), couroC); } // testeira
  // topete: mechas que caem da nuca sobre a testa
  for (let k = 0; k < 4; k++) { const x = (k - 1.5) * 0.018, L = 0.09 + 0.03 * hash2(k, 7);
    m.f([[x - 0.012, 0.1, 0.02], [x + 0.012, 0.1, 0.02], [x + 0.006 + 0.01 * (k - 1.5), 0.075, 0.02 + L], [x - 0.006 + 0.01 * (k - 1.5), 0.078, 0.02 + L]], k % 2 ? crina : escuroCrina); }
  m.pop();
  P.cabeca = m.geo();
  // pernas por seções (secPernaCav: a frente redonda, atrás achatada pelo tendão). Na da frente, o antebraço com a ponta
  // do cotovelo atrás, o joelho largo e chato na frente e a canela; na de trás, a perna com o músculo atrás e o tendão
  // descendo até a ponta do jarrete, que sobe atrás da junta. [y, meia largura, frente, trás, estreita atrás]
  const perna = (S, col, sem) => { m = new Malha(sem); m.jit = 0.04; const L = S.map(([y, w, f, t, kb]) => [y, secPernaCav(w, f, t, kb)]);
    loft(m, L, col); tampaSec(m, L[0][0], L[0][1], col); tampaSec(m, L[L.length - 1][0], L[L.length - 1][1], col); return m.geo(); };
  P.pernaSup = perna([[0.07, 0.04, 0.05, 0.05], [0.04, 0.08, 0.1, 0.105], [0, 0.093, 0.112, 0.122], [-0.05, 0.09, 0.11, 0.132], [-0.1, 0.085, 0.103, 0.11], [-0.17, 0.078, 0.092, 0.08],
    [-0.26, 0.068, 0.077, 0.062], [-0.35, 0.058, 0.063, 0.052], [-0.43, 0.051, 0.054, 0.047], [-0.5, 0.05, 0.051, 0.047], [-0.53, 0.04, 0.04, 0.038]], cor, 34);
  P.pernaSupT = perna([[0.07, 0.04, 0.05, 0.05], [0.04, 0.08, 0.1, 0.11], [0, 0.095, 0.11, 0.13], [-0.08, 0.09, 0.1, 0.13], [-0.17, 0.08, 0.085, 0.112], [-0.26, 0.068, 0.068, 0.096, 0.75],
    [-0.35, 0.058, 0.056, 0.085, 0.6], [-0.43, 0.05, 0.048, 0.078, 0.55], [-0.5, 0.048, 0.046, 0.07, 0.6], [-0.53, 0.04, 0.038, 0.05, 0.7]], cor, 38);
  P.pernaInf = perna([[0.07, 0.036, 0.035, 0.034], [0.04, 0.05, 0.05, 0.047], [0, 0.057, 0.06, 0.056, 1], [-0.045, 0.057, 0.059, 0.066, 0.9], [-0.085, 0.046, 0.048, 0.046],
    [-0.13, 0.037, 0.041, 0.039, 0.75], [-0.25, 0.035, 0.039, 0.041, 0.7], [-0.33, 0.038, 0.041, 0.045, 0.75], [-0.37, 0.044, 0.046, 0.051], [-0.4, 0.034, 0.036, 0.04]], c2, 35);
  P.pernaInfT = perna([[0.075, 0.028, 0.0, 0.07, 0.6], [0.05, 0.046, 0.03, 0.09, 0.65], [0.0, 0.056, 0.057, 0.088, 0.75], [-0.05, 0.053, 0.054, 0.062, 0.8], [-0.1, 0.043, 0.046, 0.046, 0.8],
    [-0.15, 0.038, 0.043, 0.042, 0.75], [-0.3, 0.037, 0.04, 0.045, 0.7], [-0.36, 0.042, 0.045, 0.051, 0.75], [-0.4, 0.034, 0.036, 0.04]], c2, 39);
  // a quartela (com o boleto) e o casco são peças à parte, com junta na coroa (0,12 abaixo do boleto): no apoio o casco
  // fica plano no chão enquanto a quartela se inclina com o peso
  m = new Malha(36); m.jit = 0.04;
  m.push().t(0, -0.12, 0.0).cyl(0.038, 0.045, 0.12, 10, c2).pop();                               // quartela
  m.push().t(0, 0.0, -0.006).s3(1, 1, 1.15).esfera(0.052, 10, 5, c2).pop();                      // boleto
  m.push().t(0, -0.118, 0.0).esfera(0.046, 10, 4, c2).pop();                                     // a junta da coroa (sem fresta quando dobra)
  P.quartela = m.geo();
  m = new Malha(37); m.jit = 0.04;
  m.push().t(0, -0.08, 0.012).lathe([[0.072, 0], [0.068, 0.03], [0.06, 0.07], [0.058, 0.085]], 12, casco).pop(); // casco
  m.push().t(0, -0.08 + 0.083, 0.012).cyl(0.06, 0.055, 0.016, 12, mixc(c2, [0, 0, 0], 0.3), false).pop(); // coroa do casco
  P.casco = m.geo();
  // cauda: o sabugo e as mechas, de comprimentos desiguais, mais cheias embaixo
  m = new Malha(36); m.jit = 0.05;
  m.push().rx(-2.6);
  { // o sabugo, curto, e as mechas: fitas dobradas ao meio que saem dele, abrem um pouco e terminam em ponta, de comprimentos desiguais
    const N = 12, aneis = [[0, 0.05], [0.1, 0.068], [0.24, 0.083], [0.4, 0.085], [0.52, 0.07]], V = aneis.map(([y, r], j) => Array.from({ length: N }, (_, i) => { const a = i / N * Math.PI * 2, rr = r * (j ? 1 + 0.12 * (hash2(i, j + 3) - 0.5) : 1); return [Math.cos(a) * rr, y, Math.sin(a) * rr * 0.75]; }));
    for (let j = 0; j < aneis.length - 1; j++) for (let i = 0; i < N; i++) { const k = (i + 1) % N; m.f([V[j][i], V[j][k], V[j + 1][k], V[j + 1][i]], (i + j) % 3 ? crina : escuroCrina); }
    m.f(V[0].slice().reverse(), crina); m.f(V[V.length - 1], escuroCrina);
    const NM = 13;
    for (let i = 0; i < NM; i++) {
      const a = (i + 0.3 * hash2(i, 41)) / NM * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a), L = 0.78 + 0.15 * hash2(i, 9), y0 = 0.14 + 0.16 * hash2(i, 23);
      const cc = i % 3 === 0 ? escuroCrina : i % 3 === 1 ? crina : mixc(crina, claroCrina, 0.6);
      // [altura, raio, meia largura, dobra]
      const T = [[y0, 0.088, 0.042, 0.012], [0.46, 0.102, 0.04, 0.012], [0.64, 0.09, 0.032, 0.01], [L - 0.07, 0.07, 0.018, 0.006]];
      const pt = (y, r, u) => [ca * r - sa * u, y, (sa * r + ca * u) * 0.75];
      const lin = T.map(([y, r, w, d]) => [pt(y, r, -w), pt(y, r + d, 0), pt(y, r, w)]);
      for (let j = 0; j < lin.length - 1; j++) for (let h = 0; h < 2; h++) m.f([lin[j][h], lin[j][h + 1], lin[j + 1][h + 1], lin[j + 1][h]], cc);
      const ponta = pt(L, 0.055 + 0.02 * hash2(i, 13), 0), U = lin[lin.length - 1];
      m.f([U[0], U[1], ponta], cc); m.f([U[1], U[2], ponta], cc);
    } }
  m.pop();
  P.cauda = m.geo();
  return P;
}
// rotação em x para os vértices montados à mão (a mesma convenção de rx da Malha)
function _rxM(v, a) { const c = Math.cos(a), s = Math.sin(a); return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c]; }

// ---------------------------------------------------------------- objetos
// A Estrela do Deserto é um diamante falso: um brilhante grande cuja coroa desenrosca e abre numa
// dobradiça. No oco do pavilhão vai a bomba-relógio esférica. Medidas em metros, com a cinta do
// diamante (o rondízio, a borda mais larga) centrada em y = 0.
const DIAM = { R: 0.12, coroa: 0.054, mesa: 0.6, pav: 0.115, cinta: 0.004, n: 16, yCinta: 0.3, bombaR: 0.055, bombaY: -0.006 };
const COR_DIAM = [corHex('#E8F4FF'), corHex('#9FC6EC'), corHex('#FFFFFF'), corHex('#BFD9F4'), corHex('#7FA8DA')];
// anéis do brilhante: a cinta (g), o anel do meio da coroa (m, meio passo adiantado), a mesa (t),
// o anel do meio do pavilhão (p, meio passo adiantado) e a ponta
function aneisDiamante() {
  const { R, coroa, mesa, pav, cinta, n } = DIAM, a = i => (i / n) * Math.PI * 2, h = Math.PI / n;
  const anel = (r, y, desl) => Array.from({ length: n }, (_, i) => [Math.cos(a(i) + desl) * r, y, Math.sin(a(i) + desl) * r]);
  return { n, gC: anel(R, cinta, 0), gB: anel(R, -cinta, 0), m: anel(R * 0.8, cinta + coroa * 0.55, h), t: anel(R * mesa, cinta + coroa, 0),
    p: anel(R * 0.55, -cinta - pav * 0.45, h), ponta: [0, -cinta - pav, 0], topo: [0, cinta + coroa, 0] };
}
// a coroa (a tampa que desenrosca): facetas da coroa, a mesa e, por baixo, o forro de veludo
function coroaDiamante() {
  const m = new Malha(7071); m.jit = 0.1;
  const { n, gC, m: mm, t, topo } = aneisDiamante(), c = i => COR_DIAM[i % COR_DIAM.length], j = i => (i + n) % n;
  for (let i = 0; i < n; i++) {
    m.f([gC[i], gC[j(i + 1)], mm[i]], c(i));                 // facetas da cinta
    m.f([gC[i], mm[i], t[i], mm[j(i - 1)]], c(i + 2));        // pipas
    m.f([mm[i], t[j(i + 1)], t[i]], c(i + 1));               // estrelas
    m.f([t[i], t[j(i + 1)], topo], c(i % 2 ? 2 : 3));         // a mesa
  }
  return m;
}
// os forros de veludo, à parte do vidro (sem o brilho das facetas, que acendia uma fatia inteira do oco): por baixo da tampa e no oco
function forroTampaDiamante() { const m = new Malha(7073); m.jit = 0; m.lathe([[0, DIAM.cinta], [DIAM.R * 0.985, DIAM.cinta]], DIAM.n, corHex('#6A1626')); return m; }
function forroOcoDiamante() { const m = new Malha(7074); m.jit = 0; const { R, cinta, pav, n } = DIAM; m.lathe([[R * 0.95, cinta - 0.0005], [R * 0.6, -cinta - pav * 0.36], [0, -cinta - pav * 0.9]], n, corHex('#62121F')); return m; }
// o pavilhão (a parte de baixo, que fica na mão ou nas garras): facetas, a cinta com a rosca de
// prata (o único sinal de que é falso, visto de perto), a boca e o forro do oco
function pavilhaoDiamante() {
  const m = new Malha(7072); m.jit = 0.1;
  const { R, cinta, pav, n } = DIAM, { gB, p, ponta } = aneisDiamante(), c = i => COR_DIAM[(i + 1) % COR_DIAM.length], j = i => (i + n) % n;
  for (let i = 0; i < n; i++) {
    m.f([p[i], gB[j(i + 1)], gB[i]], c(i));
    m.f([p[j(i - 1)], p[i], gB[i]], c(i + 3));
    m.f([ponta, p[i], p[j(i - 1)]], c(i + 1));
  }
  m.lathe([[R, -cinta], [R, cinta]], n, corHex('#C9CCD4'));                        // cinta: a rosca de prata
  m.lathe([[R, cinta], [R * 0.95, cinta]], n, corHex('#A9ACB4'));                  // a boca do oco
  // dobradiça pequena atrás (z negativo), onde a tampa gira
  m.push().t(0, cinta, -R - 0.004).rz(Math.PI / 2).t(0, -0.012, 0).cyl(0.004, 0.004, 0.024, 8, corHex('#C9CCD4')).pop();
  return m;
}
// a bomba-relógio esférica, de ferro, com cinta de latão rebitada, mostrador inclinado para cima
// (os ponteiros são desenhados à parte) e um detonador de latão no alto; centro em y = 0
const DIAL = { incl: 35 * Math.PI / 180, r: 0.026, base: 0.049, topo: 0.0595 };
function bombaEsfera() {
  const m = new Malha(8081); m.jit = 0.04;
  const r = DIAM.bombaR, ferro = corHex('#1E1E24'), latao = corHex('#C9A24A'), lataoE = corHex('#8C6A2A');
  m.esfera(r, 18, 10, ferro);
  m.push().t(0, -0.004, 0).cyl(r * 1.012, r * 1.012, 0.008, 18, latao, false).pop();          // cinta do equador
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; m.push().t(Math.cos(a) * r * 1.02, 0, Math.sin(a) * r * 1.02).esfera(0.0028, 5, 3, lataoE).pop(); }
  // detonador no alto
  m.push().t(0, r * 0.94, 0).cyl(0.014, 0.012, 0.012, 10, latao, true, lataoE).pop();
  m.push().t(0, r * 0.94 + 0.012, 0).cyl(0.004, 0.004, 0.008, 6, corHex('#B4261C')).pop();
  // mostrador: afundado na esfera para a borda encostar no ferro, sem fresta
  const d = DIAL, ux = 0, uy = Math.sin(d.incl), uz = Math.cos(d.incl), rot = Math.PI / 2 - d.incl;
  m.push().t(ux * d.base, uy * d.base, uz * d.base).rx(rot).cyl(d.r, d.r, d.topo - d.base, 16, latao, true, lataoE).pop();
  m.push().t(ux * d.topo, uy * d.topo, uz * d.topo).rx(rot).cyl(d.r * 0.84, d.r * 0.84, 0.0008, 16, corHex('#F2EAD6'), true, corHex('#F2EAD6')).pop();
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2;
    m.push().t(ux * d.topo, uy * d.topo, uz * d.topo).rx(rot).ry(a).t(0, 0.001, d.r * 0.68).box(0.002, 0.0012, 0.005, corHex('#2A2420')).pop(); }
  return m;
}
// o pedestal da vitrine: base de veludo com friso de ouro, coluna torneada e quatro garras que
// seguram o diamante pela cinta (a ponta do pavilhão descansa num copinho)
function suporteDiamante() {
  const m = new Malha(6061); m.jit = 0.02;
  const ouro = corHex('#D9AE4C'), ouro2 = corHex('#A97E2E'), veludo = corHex('#6E1220');
  const { R, cinta, pav, yCinta } = DIAM, yPonta = yCinta - cinta - pav, k = R / pav; // raio do pavilhão = k × altura acima da ponta
  m.bx(-0.14, 0, -0.14, 0.14, 0.035, 0.14, veludo);
  m.bx(-0.146, 0.03, -0.146, 0.146, 0.042, 0.146, ouro2);
  m.bx(-0.12, 0.042, -0.12, 0.12, 0.05, 0.12, veludo);
  const yc = yPonta + 0.02, rc = k * 0.02 + 0.0015;
  m.lathe([[0.075, 0.05], [0.075, 0.058], [0.045, 0.072], [0.02, 0.1], [0.016, yc - 0.05], [0.028, yc - 0.03], [rc, yc - 0.004], [rc + 0.003, yc], [rc - 0.002, yc], [0.0, yc - 0.012]], 16, ouro);
  for (let q = 0; q < 4; q++) {
    const a = q / 4 * Math.PI * 2 + Math.PI / 4, ca = Math.cos(a), sa = Math.sin(a);
    const P = (r, y) => [ca * r, y, sa * r];
    m.tubo(P(rc, yc), P(R + 0.006, yCinta - cinta), 0.0042, 5, ouro);
    m.tubo(P(R + 0.006, yCinta - cinta), P(R - 0.007, yCinta + 0.016), 0.0042, 5, ouro);
    m.push().t(...P(R - 0.007, yCinta + 0.016)).esfera(0.0045, 6, 3, ouro).pop();
  }
  m.ao(0, 0.06, 0.75);
  return m;
}
// o que sobra da bomba e cai do céu no fim: um caco curvo do ferro com a plaquinha da mina rebitada
function cacoBomba() {
  const m = new Malha(9093); m.jit = 0.05;
  const r = 0.12, ferro = corHex('#24242A'), ferro2 = corHex('#3A3A42');
  // calota rasgada: anéis com borda irregular
  const n = 11, borda = i => 0.62 + 0.22 * Math.sin(i * 2.7) * Math.cos(i * 1.3);
  for (let i = 0; i < n; i++) {
    const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2, b0 = borda(i), b1 = borda(i + 1);
    const ponto = (a, b) => [Math.cos(a) * Math.sin(b) * r, Math.cos(b) * r - r * 0.62, Math.sin(a) * Math.sin(b) * r];
    const meio0 = ponto(a0, b0 * 0.5), meio1 = ponto(a1, b1 * 0.5);
    m.f([[0, r - r * 0.62, 0], meio0, meio1], i % 2 ? ferro : ferro2);
    m.f([meio0, ponto(a0, b0), ponto(a1, b1), meio1], i % 2 ? ferro2 : ferro);
  }
  // base plana soldada no alto, para a plaquinha assentar sem fresta, e quatro rebites
  m.push().t(0, r * 0.3, 0).cyl(0.046, 0.046, r * 0.38 - r * 0.3 + 0.0012, 14, ferro2, true, ferro2).pop();
  for (const [x, z] of [[-0.034, -0.02], [0.034, -0.02], [-0.034, 0.02], [0.034, 0.02]]) m.push().t(x, r * 0.38 + 0.0025, z).esfera(0.003, 5, 3, corHex('#9C7430')).pop();
  return m;
}

// xícara de porcelana com pires e friso de ouro; a base do pires em y = 0
function xicara() {
  const m = new Malha(12); m.jit = 0.02; const porc = corHex('#F4F0E8'), ouro = corHex('#D9AE4C');
  m.lathe([[0, 0], [0.05, 0], [0.072, 0.008], [0.074, 0.012], [0.06, 0.008], [0, 0.008]], 14, porc);   // pires
  m.push().t(0, 0.0105, 0).cyl(0.0735, 0.0735, 0.0015, 14, ouro, false).pop();
  m.push().t(0, 0.008, 0).lathe([[0, 0], [0.024, 0], [0.03, 0.006], [0.041, 0.04], [0.044, 0.062], [0.04, 0.062], [0.037, 0.04], [0.026, 0.01], [0, 0.01]], 14, porc).pop(); // xícara (por fora e por dentro)
  m.push().t(0, 0.066, 0).cyl(0.0445, 0.0445, 0.003, 14, ouro, false).pop();
  const al = [[0.042, 0.055], [0.062, 0.055], [0.068, 0.04], [0.062, 0.024], [0.04, 0.022]];
  for (let k = 0; k < al.length - 1; k++) m.tubo([al[k][0], al[k][1], 0], [al[k + 1][0], al[k + 1][1], 0], 0.0045, 5, porc);  // asa
  return m;
}
// pontos de uma curva de Bézier cúbica de a até d (n trechos)
const bezier3 = (a, b, c, d, n) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [0, 1, 2].map(k => u * u * u * a[k] + 3 * u * u * t * b[k] + 3 * u * t * t * c[k] + t * t * t * d[k]); });
// varre uma seção ao longo de uma curva (pts): sec(t) dá a seção [[a, b], ...] em cada ponto (t de 0 a 1), com a na
// direção u, perpendicular à curva e a ref, e b na direção v, perpendicular às duas; ref é um eixo fora do plano da curva.
// cor pode ser uma função (face, trecho), como em loft. Devolve os anéis (para fechar as pontas com outra cor)
function varre(m, pts, sec, cor, ref = [0, 0, 1], tampas = true) {
  const nr = v => { const L = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / L, v[1] / L, v[2] / L]; };
  const cr = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const n = pts.length, an = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], T = nr([b[0] - a[0], b[1] - a[1], b[2] - a[2]]);
    const u = nr(cr(T, ref)), v = cr(T, u), p = pts[i], S = typeof sec === 'function' ? sec(i / (n - 1)) : sec;
    an.push(S.map(([x, y]) => [p[0] + u[0] * x + v[0] * y, p[1] + u[1] * x + v[1] * y, p[2] + u[2] * x + v[2] * y]));
  }
  for (let j = 0; j < n - 1; j++) for (let k = 0; k < an[j].length; k++) { const k1 = (k + 1) % an[j].length;
    m.f([an[j][k], an[j][k1], an[j + 1][k1], an[j + 1][k]], typeof cor === 'function' ? cor(k, j) : cor); }
  if (tampas) { const c = typeof cor === 'function' ? cor(-1, -1) : cor; m.f(an[0].slice().reverse(), c); m.f(an[n - 1], c); }
  return an;
}
// Bule de prata (20 lados): pé com friso, bojo, ombro, gargalo e tampa com borda e pegador de madeira; bico curvo que
// afina até a ponta (BULE.bico, em roteiro.js) e alça de madeira em C, com as buchas de prata, passando pelo ponto onde
// a mão segura (BULE.pega). A base fica em y = 0, o bico em +x e a alça em -x, como antes
function bule() {
  const m = new Malha(4); m.jit = 0.03; const prata = corHex('#C8CCD2'), friso = mixc(prata, [0, 0, 0], 0.22), madeira = corHex('#2A1A10');
  m.lathe([[0, 0.002], [0.058, 0], [0.068, 0.006], [0.071, 0.016], [0.078, 0.045], [0.08, 0.075], [0.077, 0.115], [0.07, 0.148], [0.058, 0.176], [0.047, 0.196], [0.045, 0.2]], 20,
    i => i === 2 ? friso : prata);
  m.lathe([[0.045, 0.2], [0.053, 0.203], [0.053, 0.211], [0.044, 0.222], [0.026, 0.234], [0.011, 0.238], [0.008, 0.243], [0.014, 0.25], [0.011, 0.258], [0, 0.26]], 20,
    i => i === 1 ? friso : i >= 5 ? madeira : prata);
  const bico = bezier3([0.064, 0.055, 0], [0.112, 0.07, 0], [0.108, 0.165, 0], [0.14, 0.2, 0], 7);
  const an = varre(m, bico, t => secRoda(0.0165 - 0.0088 * t, 8), prata, [0, 0, 1], false);
  m.f(an[an.length - 1], mixc(prata, [0, 0, 0], 0.7)); // a boca do bico, escura
  const alca = bezier3([-0.068, 0.168, 0], [-0.13, 0.17, 0], [-0.13, 0.052, 0], [-0.086, 0.06, 0], 9);
  varre(m, alca, secRoda(0.0085, 6), madeira);
  m.tubo([-0.056, 0.168, 0], [-0.075, 0.169, 0], 0.011, 8, prata); m.tubo([-0.074, 0.06, 0], [-0.092, 0.06, 0], 0.011, 8, prata); // as buchas, entrando no bojo
  return m;
}
// Bandeja de prata: fundo plano (a mão apoia em y = 0; o que vai em cima fica em y = 0,015), um friso gravado em volta do
// fundo e a borda levantada e virada para fora. A cloche, de 24 lados, com aba e pegador; sem ela, um copo de louça
function bandeja(comCloche) {
  const m = new Malha(5); m.jit = 0.03; const prata = corHex('#C8CCD2'), friso = mixc(prata, [0, 0, 0], 0.22);
  m.lathe([[0, 0], [0.175, 0], [0.198, 0.004], [0.207, 0.014], [0.212, 0.025], [0.209, 0.029], [0.203, 0.025], [0.196, 0.017], [0.186, 0.015], [0.176, 0.015], [0.17, 0.015], [0, 0.015]], 24,
    i => i === 9 ? friso : prata);
  if (comCloche) {
    const cl = corHex('#D8DCE2');
    m.push().t(0, 0.015, 0).lathe([[0.172, 0], [0.175, 0.005], [0.168, 0.011], [0.164, 0.04], [0.152, 0.08], [0.128, 0.118], [0.094, 0.148], [0.05, 0.171], [0, 0.18]], 24,
      i => i < 2 ? friso : cl).pop();
    m.push().t(0, 0.015, 0).lathe([[0, 0.179], [0.008, 0.18], [0.006, 0.188], [0.016, 0.196], [0.018, 0.203], [0.012, 0.21], [0, 0.212]], 10, prata).pop();
  } else {
    const louca = corHex('#F4F0E8');
    m.push().t(0.05, 0.015, 0.02).lathe([[0, 0], [0.028, 0], [0.03, 0.003], [0.04, 0.068], [0.041, 0.072], [0.037, 0.072], [0.029, 0.012], [0, 0.012]], 14,
      i => i >= 5 ? mixc(louca, [0, 0, 0], 0.45) : louca).pop();
    m.push().t(0.05, 0.015, 0.02).lathe([[0.0362, 0.0665], [0, 0.0665]], 14, corHex('#3B2416')).pop(); // o café, meio centímetro abaixo da borda
  }
  return m;
}
// Taça de cristal (12 lados): pé fino, haste delgada, bojo em tulipa e a bebida dourada vista pela boca
function taca() {
  const m = new Malha(6);
  m.lathe([[0, 0.001], [0.033, 0], [0.03, 0.004], [0.006, 0.012], [0.0035, 0.022], [0.0035, 0.096], [0.012, 0.106], [0.03, 0.118], [0.041, 0.135], [0.044, 0.158], [0.041, 0.19],
    [0.038, 0.19], [0.041, 0.158], [0.038, 0.138], [0.026, 0.123], [0, 0.117]], 12, corHex('#E8F0F4'));
  m.lathe([[0.04, 0.165], [0, 0.165]], 12, emis(corHex('#F2D27A'), 0.2));
  return m;
}
// Revólver de ação simples, de aço escuro: cano redondo com massa de mira e boca, tubo do extrator embaixo, tambor com
// seis caneluras e as câmaras à mostra na frente, armação, cão com espora, guarda-mato com gatilho e cabo curvo com
// placas de madeira (o aço na frente e atrás). Cano em +z; o cabo desce para -y e recua para -z, no mesmo lugar do de antes
function revolver() {
  const m = new Malha(8); m.jit = 0.03; const f = corHex('#3A3A42'), tambor = mixc(f, [255, 255, 255], 0.08), boca = corHex('#141418'), madeira = corHex('#5A3A22');
  m.bx(-0.0065, 0.016, 0.04, 0.0065, 0.021, 0.1, f); // alça de cima
  m.bx(-0.008, -0.033, 0.034, 0.008, -0.022, 0.1, f); // armação embaixo do tambor
  m.bx(-0.011, -0.033, 0.03, 0.011, 0.021, 0.043, f); // escudo atrás do tambor
  m.bx(-0.0085, -0.022, 0.099, 0.0085, 0.019, 0.112, f); // frente da armação
  m.bx(-0.008, -0.03, 0.012, 0.008, 0.016, 0.031, f); // atrás, onde fica o cão
  m.push().t(0, 0.007, 0.105).rx(Math.PI / 2).cyl(0.0075, 0.0075, 0.095, 8, f).pop(); // cano
  m.push().t(0, 0.007, 0.2006).rx(Math.PI / 2).cyl(0.0035, 0.0035, 0.0002, 6, boca).pop(); // boca do cano
  m.bx(-0.0013, 0.0135, 0.188, 0.0013, 0.019, 0.197, f); // massa de mira
  m.push().t(0.0035, -0.004, 0.108).rx(Math.PI / 2).cyl(0.0042, 0.0042, 0.072, 6, f).pop(); // tubo do extrator
  // tambor: seis caneluras e as câmaras na frente
  const sT = Array.from({ length: 12 }, (_, k) => { const a = k / 12 * Math.PI * 2, r = k % 2 ? 0.0165 : 0.0205; return [Math.cos(a) * r, Math.sin(a) * r]; });
  const sc = (S, k) => S.map(([x, z]) => [x * k, z * k]);
  m.push().t(0, -0.004, 0.044).rx(Math.PI / 2);
  loft(m, [[0, sc(sT, 0.86)], [0.004, sT], [0.05, sT], [0.054, sc(sT, 0.86)]], tambor);
  for (const y of [0, 0.054]) sc(sT, 0.86).forEach((P, k, S) => { const Q = S[(k + 1) % 12]; m.f([[0, y, 0], [P[0], y, P[1]], [Q[0], y, Q[1]]], tambor); }); // as faces, em leque a partir do centro (a seção não é convexa)
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; m.f(Array.from({ length: 6 }, (_, i) => { const b = i / 6 * Math.PI * 2; return [Math.cos(a) * 0.0115 + Math.cos(b) * 0.0038, 0.0546, Math.sin(a) * 0.0115 + Math.sin(b) * 0.0038]; }), boca); }
  m.pop();
  falange(m, [0, 0.01, 0.029], [0, 0.023, 0.021], 0.0075, 0.011, 0.0065, 0.008, f); // o cão
  falange(m, [0, 0.021, 0.023], [0, 0.025, 0.011], 0.0065, 0.007, 0.007, 0.005, f, true); // a espora
  varre(m, bezier3([0, -0.032, 0.068], [0, -0.053, 0.066], [0, -0.055, 0.028], [0, -0.032, 0.02], 6), secRoda(0.0022, 4), f, [1, 0, 0]); // guarda-mato
  falange(m, [0, -0.03, 0.05], [0, -0.045, 0.046], 0.003, 0.005, 0.0025, 0.004, f, true); // gatilho
  // cabo: seção octogonal que engrossa para baixo; as faces da frente e de trás de aço, os lados de madeira
  const cabo = bezier3([0, -0.022, 0.016], [0, -0.05, 0.006], [0, -0.078, -0.008], [0, -0.1, -0.028], 5);
  varre(m, cabo, t => secOct(0.03 + 0.008 * t, 0.021 + 0.003 * t, 0.22, 0.3), (k) => k === 2 || k === 6 || k < 0 ? f : madeira, [1, 0, 0]);
  return m;
}
function luneta() { const m = new Malha(9); m.push().rx(Math.PI / 2).t(0, -0.05, 0).cyl(0.022, 0.03, 0.42, 8, PAL.latao).pop(); for (const z of [0.05, 0.2]) m.push().t(0, 0, z).rx(Math.PI / 2).cyl(0.032, 0.032, 0.02, 8, PAL.lataoEsc, false).pop(); return m; }
// o vestido verde da garçonete, arrancado e largado no chão perto da porta: a saia desaba numa poça irregular com
// dobras (mais alta perto da cintura, escura na abertura), o corpete dobrado por cima com a gola branca e o broche,
// uma manga esticada no chão e a outra dobrada. Origem no chão, no meio da cintura; tudo acima de y = 0.
function vestidoChao() {
  const F = FIGURINOS.jackGarconete, m = new Malha(21); m.jit = 0.012;
  const saia = F.saia, blusa = F.roupa, gola = F.gola, sombra = mixc(saia, [0, 0, 0], 0.22), dentro = mixc(saia, [0, 0, 0], 0.55), barra = mixc(saia, [0, 0, 0], 0.32);
  const rw = 0.12, rh = a => 0.38 + 0.06 * Math.sin(2 * a + 0.7) + 0.03 * Math.sin(5 * a + 1.1);
  const hS = (rho, a) => 0.008 + Math.pow(1 - rho, 1.5) * (0.07 + 0.02 * Math.sin(3 * a)) + 0.013 * Math.abs(Math.sin(7 * a + rho * 2.2)) * (1 - 0.55 * rho);
  const pS = (rho, a) => { const r = rw + (rh(a) - rw) * rho; return [Math.cos(a) * r, hS(rho, a), Math.sin(a) * r]; };
  const NA = 36, NR = 6;
  for (let j = 0; j < NR; j++) for (let k = 0; k < NA; k++) {
    const r0 = j / NR, r1 = (j + 1) / NR, a0 = k / NA * Math.PI * 2, a1 = (k + 1) / NA * Math.PI * 2;
    m.f([pS(r0, a0), pS(r0, a1), pS(r1, a1), pS(r1, a0)], j === NR - 1 ? barra : (Math.floor(k / 2) % 2 ? saia : sombra));
  }
  // a abertura da cintura, por onde se vê o forro escuro
  for (let k = 0; k < NA; k++) { const a0 = k / NA * Math.PI * 2, a1 = (k + 1) / NA * Math.PI * 2; m.f([[0, 0.03, 0], pS(0, a1), pS(0, a0)], dentro); }
  // altura da saia num ponto qualquer do chão (para o corpete e as mangas pousarem sobre ela)
  const hNo = (x, z) => { const a = Math.atan2(z, x), r = Math.hypot(x, z); if (r < rw) return 0.03; const rho = (r - rw) / (rh(a) - rw); return rho > 1 ? 0 : hS(rho, a); };
  // o corpete, dobrado por cima da saia: uma placa com volume, do ombro (onde está a gola) até a cintura
  const c = [-0.06, 0.1], ang = 0.55, U = [Math.cos(ang), Math.sin(ang)], V = [-Math.sin(ang), Math.cos(ang)]; // U: largura; V: do ombro para a cintura
  const pc = (u, v, dz = 0) => { const x = c[0] + U[0] * u + V[0] * v, z = c[1] + U[1] * u + V[1] * v; return [x, hNo(x, z) + 0.022 + 0.018 * Math.cos(u / 0.15 * Math.PI / 2) * Math.sin((v + 0.16) / 0.34 * Math.PI) + dz, z]; };
  const larg = v => 0.13 - 0.03 * (v + 0.16) / 0.34;
  for (let j = 0; j < 5; j++) for (let i = 0; i < 4; i++) { const va = -0.16 + 0.34 * j / 5, vb = -0.16 + 0.34 * (j + 1) / 5, ua = -1 + 2 * i / 4, ub = -1 + 2 * (i + 1) / 4;
    m.f([pc(ua * larg(va), va), pc(ub * larg(va), va), pc(ub * larg(vb), vb), pc(ua * larg(vb), vb)], (i + j) % 2 ? blusa : mixc(blusa, [0, 0, 0], 0.12)); }
  // gola branca e o broche de losango vermelho com aro de ouro
  for (let i = 0; i < 4; i++) { const ua = -0.07 + 0.14 * i / 4, ub = -0.07 + 0.14 * (i + 1) / 4; m.f([pc(ua, -0.16, 0.004), pc(ub, -0.16, 0.004), pc(ub, -0.125, 0.006), pc(ua, -0.125, 0.006)], gola); }
  m.f([pc(0, -0.112, 0.009), pc(0.02, -0.092, 0.009), pc(0, -0.072, 0.009), pc(-0.02, -0.092, 0.009)], corHex('#D9AE4C'));
  m.f([pc(0, -0.104, 0.012), pc(0.013, -0.092, 0.012), pc(0, -0.08, 0.012), pc(-0.013, -0.092, 0.012)], corHex('#C21E2A'));
  // mangas: tubos achatados que seguem um caminho no chão; terminam no punho creme
  const manga = (pts, r) => {
    for (let k = 0; k < pts.length - 1; k++) {
      const [x0, z0] = pts[k], [x1, z1] = pts[k + 1], dx = x1 - x0, dz = z1 - z0, l = Math.hypot(dx, dz), nx = -dz / l, nz = dx / l;
      const anel = (x, z) => [0, 1, 2, 3, 4, 5].map(q => { const t = q / 6 * Math.PI * 2, w = Math.cos(t) * r, h = (Math.sin(t) * 0.5 + 0.55) * r; return [x + nx * w, hNo(x, z) + h + 0.004, z + nz * w]; });
      const A = anel(x0, z0), B = anel(x1, z1), cor = k === pts.length - 2 ? F.avental : (k % 2 ? blusa : mixc(blusa, [0, 0, 0], 0.15));
      for (let q = 0; q < 6; q++) m.f([A[q], A[(q + 1) % 6], B[(q + 1) % 6], B[q]], cor);
    }
  };
  const ombro = s => { const p = pc(s * 0.12, -0.13); return [p[0], p[2]]; };
  { const o = ombro(1); manga([o, [o[0] + 0.12, o[1] - 0.06], [o[0] + 0.26, o[1] - 0.05], [o[0] + 0.4, o[1] + 0.03], [o[0] + 0.45, o[1] + 0.05]], 0.034); }
  { const o = ombro(-1); manga([o, [o[0] - 0.06, o[1] + 0.12], [o[0] + 0.02, o[1] + 0.22], [o[0] + 0.06, o[1] + 0.24]], 0.032); }
  return m;
}
// avental da garçonete (o mesmo creme do figurino): peitilho arqueado com debrum, cós franzido, saia com pregas
// que se abrem para baixo, bolso debruado, barra de renda com ilhoses e festões, laços com ponta em V (atrás da saia).
// O pano é desenhado sobre coordenadas (x, y, dz): x na largura, y de 0 (borda de cima do peitilho) a -0,84 (barra) e
// dz, a espessura das camadas (bolso, debrum, renda). Pendurado (avPendurado): origem no meio da borda de cima do
// peitilho (onde as mãos seguram), pende para -y, frente em +z. No chão (avChao). Em 'param', os vértices guardam as
// próprias coordenadas do pano, e quem desenha o avental sendo erguido do chão (roteiro.js) os leva a cada quadro.
const AV = { Hb: 0.27, Wb0: 0.112, Wb1: 0.134, yC1: -0.312, yS1: -0.84, Ws0: 0.2, Ws1: 0.268, dobra: -0.6, fim: -0.87 };
// o bolso é costurado chato: as pregas e as rugas somem sob ele (a carta vai entre o bolso e a saia sem atravessar o pano)
function avLisoBolso(x, y) { return 1 - clamp01((x - 0.005) / 0.025) * clamp01((0.195 - x) / 0.025) * clamp01((y + 0.565) / 0.025) * clamp01((-0.345 - y) / 0.025); }
function avPrega(x, y) { const a = y < AV.yC1 ? Math.min(1, (AV.yC1 - y) / 0.32) : (y < -AV.Hb ? 0.35 : 0); return a * avLisoBolso(x, y) * (0.0105 * Math.sin(x * 37 + 0.6) + 0.0035 * Math.sin(x * 83 + y * 7)); }
// pendurado: o peitilho arqueia para fora e a borda de cima cede entre as mãos
function avPendurado(x, y, dz = 0) {
  let z = avPrega(x, y) + dz, yy = y;
  if (y > -AV.Hb) z += 0.02 * Math.cos(x / AV.Wb1 * Math.PI / 2) * Math.sin(-y / AV.Hb * Math.PI);
  if (y > -0.06) yy -= 0.016 * (1 - (x / AV.Wb0) * (x / AV.Wb0)) * (1 + y / 0.06);
  return [x, yy, z];
}
// no chão, largado de frente para cima: o peitilho estendido e a barra da saia dobrada por baixo dela mesma (de y =
// AV.dobra em diante a saia volta por cima, com o avesso para cima: os laços, que ficam atrás da saia, aparecem sobre a
// dobra, e a renda da barra fica por baixo, só com os festões para fora da beira); rugas suaves, menos no bolso.
// Origem no chão, no meio da borda de cima do peitilho; a largura em +x e o comprimento em +z, do peitilho para a dobra.
function avChao(x, y, dz = 0) {
  const s = -y, sd = -AV.dobra, dobra = s > sd, zz = dobra ? sd - (s - sd) * 0.9 : s;
  const ruga = (0.006 * Math.sin(x * 19 + zz * 6) + 0.005 * Math.sin(zz * 14 + 1.3) + 0.004 * Math.sin((x + zz) * 31)) * avLisoBolso(x, y);
  return [x * (1 + 0.05 * Math.sin(zz * 6)) + 0.01 * Math.sin(zz * 9), 0.006 + Math.abs(ruga) + (dobra ? 0.012 - dz : dz), zz + 0.012 * Math.sin(x * 9)];
}
function avental(modo = false) { // false: pendurado; true: no chão; 'param': as coordenadas do pano
  const m = new Malha(10); m.jit = 0.01;
  const creme = corHex('#F1EADC'), clara = corHex('#F8F3E8'), sombra = corHex('#DCD2BE'), costura = corHex('#C8BBA0'), renda = corHex('#FCFAF4'), furo = corHex('#B9AC92');
  const { Hb, Wb0, Wb1, yC1, yS1, Ws0, Ws1 } = AV, yC0 = -Hb;
  const P = modo === 'param' ? (x, y, dz = 0) => [x, y, dz] : modo ? avChao : avPendurado;
  // superfície em grade entre duas bordas laterais xl(y), xr(y)
  const pano = (xl, xr, y0, y1, nx, ny, cor, dz = 0) => {
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const ya = y0 + (y1 - y0) * j / ny, yb = y0 + (y1 - y0) * (j + 1) / ny;
      const xa0 = xl(ya) + (xr(ya) - xl(ya)) * i / nx, xb0 = xl(ya) + (xr(ya) - xl(ya)) * (i + 1) / nx;
      const xa1 = xl(yb) + (xr(yb) - xl(yb)) * i / nx, xb1 = xl(yb) + (xr(yb) - xl(yb)) * (i + 1) / nx;
      m.f([P(xa0, ya, dz), P(xb0, ya, dz), P(xb1, yb, dz), P(xa1, yb, dz)], typeof cor === 'function' ? cor(i, j) : cor);
    }
  };
  const bib = y => Wb0 + (Wb1 - Wb0) * (-y / Hb), saia = y => Ws0 + (Ws1 - Ws0) * ((yC1 - y) / (yC1 - yS1));
  // peitilho, cós e saia
  pano(y => -bib(y), bib, 0, yC0, 8, 6, (i, j) => j < 2 ? clara : creme);
  pano(y => -Wb1 - 0.03, y => Wb1 + 0.03, yC0, yC1, 12, 1, sombra, 0.002);
  pano(y => -saia(y), saia, yC1, yS1, 18, 10, (i, j) => (i % 2 ? creme : mixc(creme, clara, 0.5)));
  // debrum do peitilho (laterais e borda de cima) e costura do cós
  for (const sx of [-1, 1]) for (let j = 0; j < 5; j++) { const ya = -j * Hb / 5, yb = -(j + 1) * Hb / 5, xa = sx * bib(ya), xb = sx * bib(yb);
    m.f([P(xa, ya, 0.002), P(xa - sx * 0.008, ya, 0.002), P(xb - sx * 0.008, yb, 0.002), P(xb, yb, 0.002)], costura); }
  pano(y => -Wb0, y => Wb0, 0.0, -0.008, 6, 1, costura, 0.002);
  pano(y => -Wb1 - 0.03, y => Wb1 + 0.03, yC1 + 0.004, yC1, 12, 1, costura, 0.003);
  // babado franzido em cima do peitilho
  for (let k = 0; k < 9; k++) { const x0 = -Wb0 + 2 * Wb0 * k / 9, x1 = -Wb0 + 2 * Wb0 * (k + 1) / 9, xm = (x0 + x1) / 2;
    m.f([P(x0, 0, 0.001), P(x1, 0, 0.001), P(xm + (x1 - x0) * 0.25, 0.02, 0.004), P(xm - (x1 - x0) * 0.25, 0.02, 0.004)], renda); }
  // barra: faixa de renda com ilhoses e festões em leque
  const yR = yS1 + 0.055;
  pano(y => -saia(yS1), y => saia(yS1), yR, yS1, 18, 1, renda, 0.001);
  for (let k = 0; k < 14; k++) { const x = -saia(yS1) + 2 * saia(yS1) * (k + 0.5) / 14, r = 0.0055, yc = (yR + yS1) / 2;
    m.f([P(x - r, yc + r, 0.003), P(x + r, yc + r, 0.003), P(x + r, yc - r, 0.003), P(x - r, yc - r, 0.003)], furo); }
  const NF = 11, wF = 2 * saia(yS1) / NF;
  for (let k = 0; k < NF; k++) { const xc = -saia(yS1) + wF * (k + 0.5), R = wF / 2, pts = [P(xc, yS1, 0.001)];
    for (let a = 0; a <= 6; a++) { const t = Math.PI * a / 6; pts.push(P(xc + Math.cos(t) * R, yS1 - Math.sin(t) * R * 0.75, 0.001)); }
    for (let a = 1; a < pts.length - 1; a++) m.f([pts[0], pts[a + 1], pts[a]], renda); }
  // bolso debruado (a carta vai à parte, em cartaNoBolso)
  const bx0 = 0.03, bx1 = 0.17, by0 = -0.40, by1 = -0.54;
  pano(y => bx0, y => bx1, by0, by1, 4, 3, clara, 0.007);
  pano(y => bx0, y => bx1, by0 + 0.004, by0 - 0.01, 4, 1, costura, 0.009);
  for (const x of [bx0, bx1 - 0.005]) pano(y => x, y => x + 0.005, by0, by1, 1, 3, sombra, 0.008);
  // laços que saem do cós, terminando em ponta
  for (const sx of [-1, 1]) {
    const pts = [[sx * (Wb1 + 0.03), -0.29], [sx * 0.175, -0.42], [sx * 0.168, -0.56], [sx * 0.18, -0.68], [sx * 0.172, -0.79]];
    for (let k = 0; k < pts.length - 1; k++) { const [x0, y0] = pts[k], [x1, y1] = pts[k + 1], dx = y1 - y0, dy = -(x1 - x0), l = Math.hypot(dx, dy) || 1, w = 0.0135, nx_ = dx / l * w, ny_ = dy / l * w;
      const q = (x, y) => P(x, y, -0.006);
      if (k === pts.length - 2) m.f([q(x0 - nx_, y0 - ny_), q(x1 - nx_, y1 - ny_), q((x0 + x1) / 2 * 0.15 + x1 * 0.85, (y0 + y1) / 2 * 0.15 + y1 * 0.85), q(x1 + nx_, y1 + ny_), q(x0 + nx_, y0 + ny_)], k % 2 ? creme : clara);
      else m.f([q(x0 - nx_, y0 - ny_), q(x1 - nx_, y1 - ny_), q(x1 + nx_, y1 + ny_), q(x0 + nx_, y0 + ny_)], k % 2 ? creme : clara); }
  }
  return m;
}
// quadro plano com textura (cartaz, carta, placas)
function quadro(w, h) {
  const m = new Malha(1); m.jit = 0;
  m.f([[-w / 2, -h / 2, 0], [w / 2, -h / 2, 0], [w / 2, h / 2, 0], [-w / 2, h / 2, 0]], [255, 255, 255], [[0, 1], [1, 1], [1, 0], [0, 0]]);
  return m;
}
// esferas genéricas para partículas e brilhos
function bolha(lados = 6) { const m = new Malha(1); m.jit = 0.08; m.esfera(1, lados, Math.max(3, lados >> 1), [255, 255, 255]); return m; }
function cuboUnit() { const m = new Malha(1); m.jit = 0; m.box(1, 1, 1, [255, 255, 255]); return m; }
function disco(lados = 16) { const m = new Malha(1); m.jit = 0; m.lathe([[0, 0], [1, 0]], lados, [255, 255, 255]); return m; }

// anel achatado de bordas suaves (onda de choque): a cor por vértice vira a opacidade
function anelSuave(n = 48) {
  const m = new Malha(1); m.jit = 0; const R = [0.62, 0.9, 1.0];
  for (let k = 0; k < n; k++) {
    const a = k / n * Math.PI * 2, b = (k + 1) / n * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
    for (let j = 0; j < 2; j++) m.f([[ca * R[j], 0, sa * R[j]], [cb * R[j], 0, sb * R[j]], [cb * R[j + 1], 0, sb * R[j + 1]], [ca * R[j + 1], 0, sa * R[j + 1]]], [255, 255, 255]);
  }
  for (let i = 0; i < m.c.length; i++) { const r = Math.hypot(m.p[i * 3], m.p[i * 3 + 2]); const v = r > 0.89 && r < 0.91 ? 255 : 0; m.c[i] = [v, v, v, 255]; }
  return m;
}
// disco de sombra com borda que se desfaz (anel externo transparente pela cor por vértice)
function discoSombra() {
  const m = new Malha(1); m.jit = 0; const n = 20;
  for (let k = 0; k < n; k++) {
    const a = k / n * Math.PI * 2, b = (k + 1) / n * Math.PI * 2;
    const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
    m.f([[0, 0, 0], [cb * 0.6, 0, sb * 0.6], [ca * 0.6, 0, sa * 0.6]], [255, 255, 255]);
    m.f([[ca * 0.6, 0, sa * 0.6], [cb * 0.6, 0, sb * 0.6], [cb, 0, sb], [ca, 0, sa]], [150, 150, 150]);
  }
  // a cor de cada vértice vira a opacidade: cheia no meio, zero na borda
  for (let i = 0; i < m.c.length; i++) { const r = Math.hypot(m.p[i * 3], m.p[i * 3 + 2]); const v = 255 * Math.max(0, Math.min(1, (1 - r) / 0.45)); m.c[i] = [v, v, v, 255]; }
  return m;
}


// ================================================================ EXPRESSÕES EM 2D
// O rosto é uma máscara curva colada na frente da cabeça 3D, com textura
// desenhada em 2D. Ela gira com a cabeça, então continua coerente com a
// câmera, e permite expressões que a geometria low-poly não alcança.
const RAIO_ROSTO = PERFIL_CABECA; // o perfil liso da cabeça
const ROSTO_Y0 = 0.075, ROSTO_Y1 = -0.095, ROSTO_A0 = 40, ROSTO_A1 = 140; // faixa vertical e angular (graus)
function raioEm(perfil, y) {
  for (let i = 0; i < perfil.length - 1; i++) { const [r0, y0] = perfil[i], [r1, y1] = perfil[i + 1]; if (y >= y0 && y <= y1) return r0 + (r1 - r0) * (y - y0) / (y1 - y0); }
  return perfil[perfil.length - 1][0];
}
function rostoMascara(f) {
  const m = new Malha(1); m.jit = 0; const s = f.altura / 1.75 * 1.12, perfil = f.mulher ? RAIO_ROSTO.m : RAIO_ROSTO.h;
  const NA = 26, NY = 18; // acompanha o crânio de 28 lados
  const pt = (i, j) => {
    const a = (ROSTO_A0 + (ROSTO_A1 - ROSTO_A0) * i / NA) * Math.PI / 180, y = ROSTO_Y0 + (ROSTO_Y1 - ROSTO_Y0) * j / NY;
    const r = raioEm(perfil, y) + 0.0035;
    return [0.92 * r * Math.cos(a) * s, y * s, r * Math.sin(a) * s];
  };
  const uv = (i, j) => [1 - i / NA, j / NY];
  for (let i = 0; i < NA; i++) for (let j = 0; j < NY; j++) {
    m.f([pt(i, j), pt(i, j + 1), pt(i + 1, j + 1), pt(i + 1, j)], [255, 255, 255], [uv(i, j), uv(i, j + 1), uv(i + 1, j + 1), uv(i + 1, j)]);
  }
  return m;
}
// parâmetros de cada expressão
const EXPRESSOES = {
  neutro:      { sob: 0, sobI: 0, abre: 1, boca: 'reta', curva: 0.05, abreBoca: 0 },
  sorriso:     { sob: 0.12, sobI: 0.05, abre: 0.78, boca: 'sorriso', curva: 0.75, abreBoca: 0.25, bochecha: 1 },
  maroto:      { sob: 0.02, sobI: -0.1, sobAssim: 0.35, abre: 0.72, boca: 'meio', curva: 0.6, abreBoca: 0 },
  surpresa:    { sob: 0.7, sobI: 0.35, abre: 1.4, boca: 'o', curva: 0, abreBoca: 0.8, olhoMenor: 1 },
  medo:        { sob: 0.55, sobI: 0.9, abre: 1.35, boca: 'aberta', curva: -0.7, abreBoca: 0.75, rugas: 1, olhoMenor: 1 },
  raiva:       { sob: -0.45, sobI: -0.95, abre: 0.78, boca: 'reta', curva: -0.45, abreBoca: 0, rugas: 1 },
  determinado: { sob: -0.2, sobI: -0.45, abre: 0.86, boca: 'reta', curva: -0.08, abreBoca: 0 },
  esforco:     { sob: -0.35, sobI: -0.6, abre: 0.32, boca: 'dentes', curva: -0.2, abreBoca: 0.45, rugas: 1 },
  preocupado:  { sob: 0.3, sobI: 0.7, abre: 1.02, boca: 'reta', curva: -0.35, abreBoca: 0, rugas: 1 },
  tosse:       { sob: -0.25, sobI: 0.3, abre: 0.08, boca: 'o', curva: 0, abreBoca: 0.55 },
  aliviado:    { sob: 0.25, sobI: 0.35, abre: 0.62, boca: 'sorriso', curva: 0.35, abreBoca: 0 },
  piscar:      { sob: 0, sobI: 0, abre: 0.04, boca: 'reta', curva: 0.05, abreBoca: 0 },
  piscadela:   { sob: 0.05, sobI: -0.12, sobAssim: 0.45, abre: 0.8, pisca: 1, boca: 'meio', curva: 0.7, abreBoca: 0, bochecha: 1 },
  // sorriso leve de boca fechada, olhos um pouco apertados: a garçonete que sabe mais do que mostra
  sorrisoLeve: { sob: 0.06, sobI: -0.04, abre: 0.8, boca: 'reta', curva: 0.42, abreBoca: 0 },
  // confiante, mas preocupada: o meio das sobrancelhas sobe um pouco (a preocupação), o olhar fica firme e
  // levemente apertado, a boca fechada e firme (a confiança); nada de olhos arregalados nem boca aberta
  resoluta:    { sob: -0.14, sobI: 0.4, abre: 0.74, boca: 'reta', curva: -0.1, abreBoca: 0, rugas: 1 },
  // confiante: ela sabe o que está fazendo. Sobrancelhas firmes e um pouco baixas (sem o meio erguido da preocupação), uma
  // delas um pouco erguida, olhar firme e levemente apertado e meio sorriso de boca fechada: a mesma esperteza da
  // garçonete, sem a piscadela (P37c, a bomba)
  confiante:   { sob: -0.04, sobI: -0.18, sobAssim: 0.22, abre: 0.76, boca: 'meio', curva: 0.62, abreBoca: 0 },
  // a preocupação leve de quem serve com atenção: o meio das sobrancelhas um pouco erguido, sem o ar de choro (P15)
  atenciosa:   { sob: 0.16, sobI: 0.42, abre: 0.98, boca: 'reta', curva: -0.16, abreBoca: 0, rugas: 0.5 },
  // calma serena: pálpebras um pouco baixas e o resto de um sorriso na boca, nem vazia nem alegre (P15b, ao sair)
  serena:      { sob: 0.03, sobI: 0.02, abre: 0.82, boca: 'reta', curva: 0.16, abreBoca: 0 },
};
// mistura de duas expressões, para o rosto passar de uma a outra aos poucos: o nome 'a>b@k' (k de 0 a 1, em oitavos, para
// o cache de texturas ficar pequeno). Os números se misturam; o desenho da boca e a piscadela são os de quem pesa mais
function exprMistura(a, b, k) { const q = Math.round(Math.max(0, Math.min(1, k)) * 8) / 8; return q <= 0 ? a : q >= 1 ? b : a + '>' + b + '@' + q; }
function expressaoDe(expr) {
  const m = /^(\w+)>(\w+)@([\d.]+)$/.exec(expr); if (!m) return EXPRESSOES[expr] || EXPRESSOES.neutro;
  const A = EXPRESSOES[m[1]] || EXPRESSOES.neutro, B = EXPRESSOES[m[2]] || EXPRESSOES.neutro, k = +m[3], E = {};
  for (const c of new Set(Object.keys(A).concat(Object.keys(B)))) {
    const a = A[c], b = B[c];
    E[c] = (typeof a === 'string' || typeof b === 'string' || c === 'pisca') ? (k < 0.5 ? (a ?? b) : (b ?? a)) : (a || 0) + ((b || 0) - (a || 0)) * k;
  }
  return E;
}
const CACHE_ROSTO = new Map();
// desenha (uma vez) a textura do rosto para um personagem, expressão e direção do olhar
function texturaRosto(P, expr, olhar = 0) {
  const chave = P.chaveRosto + '|' + expr + '|' + olhar;
  let g = CACHE_ROSTO.get(chave); if (g) return g;
  const f = P.f, E = expressaoDe(expr);
  const S = (f.jack || f.rostoGrande || f === FIGURINOS.xerife) ? 512 : 256; // rostoGrande: os convidados que aparecem de perto
  g = createGraphics(S, S); g.pixelDensity(1); g.clear();
  const ctx = g.drawingContext, k = S / 256;
  const tinta = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const escuro = mixc(f.cabelo, [10, 6, 4], 0.45), linha = mixc(f.pele, [40, 18, 12], 0.75);
  const olhoY = 0.31 * S, bocaY = 0.795 * S, sobY = 0.205 * S;
  // bochechas coradas (suaves)
  if (f.mulher || E.bochecha) for (const sx of [-1, 1]) {
    const gr = ctx.createRadialGradient(S / 2 + sx * 0.25 * S, 0.55 * S, 1, S / 2 + sx * 0.25 * S, 0.55 * S, 0.11 * S);
    gr.addColorStop(0, `rgba(200,70,70,${0.12 + 0.1 * (E.bochecha || 0)})`); gr.addColorStop(1, 'rgba(200,70,70,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(S / 2 + sx * 0.25 * S, 0.55 * S, 0.11 * S, 0, Math.PI * 2); ctx.fill();
  }
  // olhos
  for (const sx of [-1, 1]) {
    const abre = E.pisca && sx > 0 ? 0.04 : E.abre; // piscadela: fecha só um olho
    const cx = S / 2 + sx * 0.236 * S, ew = 0.1 * S * (1 + 0.05 * (E.olhoMenor || 0)), eh = Math.max(0.004 * S, 0.06 * S * abre);
    if (abre > 0.15) {
      ctx.save(); ctx.beginPath(); ctx.ellipse(cx, olhoY, ew, eh, 0, 0, Math.PI * 2); ctx.fillStyle = '#F6F1E8'; ctx.fill(); ctx.clip();
      const ix = cx + olhar * 0.035 * S + (sx * -0.006 * S), ir = 0.047 * S * (1 - 0.18 * (E.olhoMenor || 0));
      ctx.fillStyle = tinta(f.olhos || [60, 60, 70]); ctx.beginPath(); ctx.arc(ix, olhoY + 0.004 * S, ir, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = tinta(mixc(f.olhos || [60, 60, 70], [0, 0, 0], 0.45)); ctx.lineWidth = 1.5 * k; ctx.strokeStyle = ctx.fillStyle; ctx.stroke();
      ctx.fillStyle = '#0B0908'; ctx.beginPath(); ctx.arc(ix, olhoY + 0.004 * S, ir * 0.48, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.beginPath(); ctx.arc(ix - ir * 0.35, olhoY - ir * 0.35, ir * 0.22, 0, Math.PI * 2); ctx.fill();
      // sombra da pálpebra superior
      ctx.fillStyle = 'rgba(60,30,20,0.25)'; ctx.fillRect(cx - ew, olhoY - eh, ew * 2, eh * 0.35);
      ctx.restore();
    }
    // linha dos cílios (pálpebra superior)
    ctx.strokeStyle = tinta(escuro); ctx.lineCap = 'round'; ctx.lineWidth = (f.mulher ? 5.2 : 4.2) * k;
    ctx.beginPath(); ctx.ellipse(cx, olhoY, ew * 1.02, Math.max(eh, 0.006 * S), 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
    if (abre > 0.15) { ctx.lineWidth = 1.4 * k; ctx.strokeStyle = tinta(linha, 0.55); ctx.beginPath(); ctx.ellipse(cx, olhoY, ew * 0.95, eh, 0, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke(); }
    if (f.mulher) { ctx.lineWidth = 3 * k; ctx.strokeStyle = tinta(escuro); const ox = cx + sx * ew * 0.95, oy = olhoY - eh * 0.6; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + sx * 0.03 * S, oy - 0.022 * S); ctx.stroke(); }
    // sobrancelha: interna (perto do nariz) e externa
    const assim = E.sobAssim ? (sx > 0 ? E.sobAssim : -E.sobAssim * 0.3) : 0;
    const yi = sobY - (E.sob * 0.035 + E.sobI * 0.045 + assim * 0.03) * S, yo = sobY - (E.sob * 0.05 - E.sobI * 0.012 + assim * 0.04) * S + 0.008 * S;
    ctx.strokeStyle = tinta(mixc(f.cabelo, [0, 0, 0], 0.35)); ctx.lineWidth = (f.mulher ? 7 : 9.5) * k;
    ctx.beginPath(); ctx.moveTo(cx - sx * 0.07 * S, yi); ctx.quadraticCurveTo(cx + sx * 0.02 * S, Math.min(yi, yo) - 0.022 * S, cx + sx * 0.115 * S, yo); ctx.stroke();
  }
  // rugas de preocupação ou raiva entre as sobrancelhas
  if (E.rugas) { ctx.strokeStyle = tinta(linha, 0.5 * E.rugas); ctx.lineWidth = 2 * k; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(S / 2 + sx * 0.03 * S, sobY - 0.03 * S); ctx.lineTo(S / 2 + sx * 0.022 * S, sobY + 0.03 * S); ctx.stroke(); } }
  // boca
  const mw = 0.105 * S, corBoca = mixc(f.pele, [110, 30, 30], f.mulher ? 0.6 : 0.42);
  ctx.lineCap = 'round'; ctx.strokeStyle = tinta(mixc(corBoca, [30, 8, 8], 0.35)); ctx.lineWidth = 3.6 * k;
  const cv = E.curva * 0.045 * S;
  if (E.boca === 'reta' || (E.boca === 'sorriso' && E.abreBoca < 0.1)) {
    ctx.beginPath(); ctx.moveTo(S / 2 - mw, bocaY - cv); ctx.quadraticCurveTo(S / 2, bocaY + cv * 1.3, S / 2 + mw, bocaY - cv); ctx.stroke();
  } else if (E.boca === 'sorriso') {
    ctx.fillStyle = '#4A1416'; ctx.beginPath(); ctx.moveTo(S / 2 - mw, bocaY - cv); ctx.quadraticCurveTo(S / 2, bocaY + cv * 2.2, S / 2 + mw, bocaY - cv); ctx.quadraticCurveTo(S / 2, bocaY + cv * 0.4, S / 2 - mw, bocaY - cv); ctx.fill();
    ctx.fillStyle = '#F4EEE4'; ctx.beginPath(); ctx.moveTo(S / 2 - mw * 0.8, bocaY - cv * 0.75); ctx.quadraticCurveTo(S / 2, bocaY + cv * 0.75, S / 2 + mw * 0.8, bocaY - cv * 0.75); ctx.quadraticCurveTo(S / 2, bocaY + cv * 0.2, S / 2 - mw * 0.8, bocaY - cv * 0.75); ctx.fill();
    ctx.stroke();
  } else if (E.boca === 'meio') {
    ctx.beginPath(); ctx.moveTo(S / 2 - mw * 0.9, bocaY + 0.004 * S); ctx.quadraticCurveTo(S / 2 + mw * 0.2, bocaY + 0.012 * S, S / 2 + mw, bocaY - cv * 1.4); ctx.stroke();
  } else if (E.boca === 'o') {
    ctx.fillStyle = '#3E1012'; ctx.beginPath(); ctx.ellipse(S / 2, bocaY + 0.01 * S, 0.042 * S, 0.05 * S * E.abreBoca + 0.01 * S, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  } else if (E.boca === 'aberta') {
    ctx.fillStyle = '#3E1012'; ctx.beginPath(); ctx.moveTo(S / 2 - mw * 0.95, bocaY + 0.02 * S); ctx.quadraticCurveTo(S / 2, bocaY - 0.04 * S, S / 2 + mw * 0.95, bocaY + 0.02 * S);
    ctx.quadraticCurveTo(S / 2, bocaY + 0.075 * S * E.abreBoca + 0.02 * S, S / 2 - mw * 0.95, bocaY + 0.02 * S); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#F4EEE4'; ctx.fillRect(S / 2 - mw * 0.5, bocaY - 0.022 * S, mw, 0.014 * S);
  } else if (E.boca === 'dentes') {
    ctx.fillStyle = '#F4EEE4'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(S / 2 - mw * 0.85, bocaY - 0.022 * S, mw * 1.7, 0.044 * S, 6 * k) : ctx.rect(S / 2 - mw * 0.85, bocaY - 0.022 * S, mw * 1.7, 0.044 * S); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 1.6 * k; ctx.beginPath(); ctx.moveTo(S / 2 - mw * 0.85, bocaY); ctx.lineTo(S / 2 + mw * 0.85, bocaY); ctx.stroke();
  }
  // vincos do sorriso
  if (E.bochecha) { ctx.strokeStyle = tinta(linha, 0.4 * E.bochecha); ctx.lineWidth = 2 * k; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(S / 2 + sx * (mw + 0.012 * S), bocaY - cv - 0.01 * S, 0.022 * S, sx > 0 ? -0.4 : Math.PI - 1.2, sx > 0 ? 1.2 : Math.PI + 0.4); ctx.stroke(); } }
  // pinta: o sinal que liga a garçonete à Diamond Jack (as duas usam o mesmo rosto)
  if (f.pinta) { const [px, py] = f.pinta; ctx.fillStyle = tinta(mixc(f.cabelo, [0, 0, 0], 0.55)); ctx.beginPath(); ctx.arc(S / 2 + px * S, py * S, 0.021 * S, 0, Math.PI * 2); ctx.fill(); }
  CACHE_ROSTO.set(chave, g);
  return g;
}
