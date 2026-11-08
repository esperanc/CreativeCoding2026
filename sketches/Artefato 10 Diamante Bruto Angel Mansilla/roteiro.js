// Diamante Bruto — roteiro.js
// A história: movimento do trem, coreografia de cada personagem, luz de cada
// momento e a lista de planos com as câmeras. Tudo é função do tempo da
// música, então o filme pode ser avançado ou voltado sem perder a continuidade.

'use strict';

// ================================================================ TREM NO TEMPO
// Cruzeiro a 14 m/s, parada na caixa-d'água (33,8–38,2 s), arrancada,
// cruzeiro até o salto do cavalo e frenagem até a ponte.
const VT = 14, ACEL = 14 / 9.8;
const S_PARADA = 420 + 14 * 3.8 / 2;               // 446,6 m
const S_A = S_PARADA + 0.5 * ACEL * 9.8 * 9.8;      // fim da arrancada
const S_B = S_A + VT * (126 - 48);                  // início da frenagem
function sTrem(t) {
  if (t <= 30) return VT * t;
  if (t <= 33.8) { const d = t - 30; return 420 + VT * d - VT * d * d / (2 * 3.8); }
  if (t <= 38.2) return S_PARADA;
  if (t <= 48) { const d = t - 38.2; return S_PARADA + 0.5 * ACEL * d * d; }
  if (t <= 126) return S_A + VT * (t - 48);
  if (t <= 140) { const d = t - 126; return S_B + VT * d - 0.5 * d * d; }
  return S_B + 98;
}
function vTrem(t) { const h = 0.02; return (sTrem(t + h) - sTrem(t - h)) / (2 * h); }
function xLoco(t) { return sTrem(t) - S_PARADA; }
const Y_TRILHO = 0.62;
// ponto no referencial do trem → mundo
function tremP(t, lx, ly, lz) { return [xLoco(t) + lx, Y_TRILHO + ly, lz]; }

// ================================================================ AMBIENTES
const AMBIENTES = {
  tarde: { sol: [-0.72, 0.13, -0.68], corSol: [1.55, 0.88, 0.48], ceu: [0.46, 0.38, 0.56], chao: [0.42, 0.26, 0.18],
    nevoa: [0.96, 0.6, 0.36], nevoaP: [90, 0.0008, 0.92], borda: [0.22, 0.12, 0.06], solM: 1, emis: 1.3,
    ceuTopo: [0.16, 0.12, 0.3], ceuMeio: [0.64, 0.36, 0.42], ceuHoriz: [1.0, 0.62, 0.3], ceuBaixo: [0.55, 0.33, 0.24],
    corSolCeu: [1.0, 0.62, 0.28], solTam: 0.0016, lua: 0, luaDir: [0.4, 0.45, 0.8], luaTam: 0.0007, estrelas: 0,
    expo: 1.0, contraste: 1.06, sat: 1.08, vinheta: 0.55, grao: 0.03, bloom: 1.0, lift: [0.025, 0.012, 0.035], ganho: [1.02, 0.98, 0.94] },
  crepusculo: { sol: [-0.75, -0.02, -0.66], corSol: [0.62, 0.32, 0.3], ceu: [0.3, 0.26, 0.46], chao: [0.2, 0.13, 0.13],
    nevoa: [0.55, 0.32, 0.36], nevoaP: [80, 0.001, 0.9], borda: [0.2, 0.12, 0.16], solM: 1, emis: 1.35,
    ceuTopo: [0.07, 0.07, 0.2], ceuMeio: [0.32, 0.2, 0.38], ceuHoriz: [0.86, 0.42, 0.28], ceuBaixo: [0.3, 0.18, 0.18],
    corSolCeu: [0.9, 0.4, 0.22], solTam: 0.0, lua: 0.35, luaDir: [0.45, 0.25, 0.85], luaTam: 0.0016, estrelas: 0.2,
    expo: 1.05, contraste: 1.05, sat: 1.0, vinheta: 0.6, grao: 0.035, bloom: 1.1, lift: [0.02, 0.015, 0.045], ganho: [1.0, 0.96, 1.0] },
  noite: { sol: [0.42, 0.52, 0.74], corSol: [0.46, 0.56, 0.86], ceu: [0.13, 0.16, 0.3], chao: [0.06, 0.06, 0.1],
    nevoa: [0.07, 0.1, 0.19], nevoaP: [40, 0.0016, 0.9], borda: [0.16, 0.22, 0.38], solM: 1, emis: 1.4,
    ceuTopo: [0.01, 0.015, 0.05], ceuMeio: [0.035, 0.06, 0.14], ceuHoriz: [0.09, 0.13, 0.25], ceuBaixo: [0.03, 0.04, 0.08],
    corSolCeu: [0.0, 0.0, 0.0], solTam: 0.0, lua: 1, luaDir: [0.42, 0.52, 0.74], luaTam: 0.0016, estrelas: 1,
    expo: 1.12, contraste: 1.12, sat: 0.98, vinheta: 0.68, grao: 0.04, bloom: 1.3, lift: [0.008, 0.016, 0.048], ganho: [0.9, 0.98, 1.1] },
};
function misturaAmb(a, b, t) {
  const r = {};
  for (const k in a) {
    const va = a[k], vb = b[k] !== undefined ? b[k] : va;
    r[k] = Array.isArray(va) ? va.map((x, i) => x + (vb[i] - x) * t) : (typeof va === 'number' ? va + (vb - va) * t : va);
  }
  return r;
}
function aplicaAmb(o) { for (const k in o) AMB[k] = Array.isArray(o[k]) ? o[k].slice() : o[k]; AMB.luzes = []; AMB.fade = 0; AMB.flash = 0; AMB.aberr = 0.4; ESTADO.relogioSolto = false; }

// ================================================================ DESENHO DO TREM
const ESTADO = { dentroD: false, vidrosAcesos: 1, luzD: 1, portaS: 0, interiorS: false };
function desenhaTrem(t) {
  const x = xLoco(t), s = sTrem(t);
  push(); translate(x, Y_TRILHO, 0);
  mat({});
  model(G.loco);
  // rodas da locomotiva e bielas
  const angG = -s / 0.85, angP = -s / 0.45, angV = -s / 0.42;
  for (const z of [-0.79, 0.79]) {
    for (const wx of [-2.2, -3.4]) { push(); translate(wx, 0.45, z); rotateZ(angP); model(G.rodaP); pop(); }
    for (const wx of [-6.0, -8.0]) { push(); translate(wx, 0.85, z); rotateZ(angG); model(G.rodaG); pop(); }
    const zz = z * 1.18;
    const p1 = [-6.0 + 0.35 * Math.cos(angG), 0.85 + 0.35 * Math.sin(angG)], p2 = [-8.0 + 0.35 * Math.cos(angG), 0.85 + 0.35 * Math.sin(angG)];
    barra(p1[0], p1[1], zz, p2[0], p2[1], zz, 0.07, [0.75, 0.72, 0.68]);
    // biela de comprimento fixo: a cruzeta corre entre as guias (y 1,04 a 1,26) e a haste do pistão vai até a tampa de trás do cilindro
    const cruz = [p1[0] + Math.sqrt(1.75 * 1.75 - (1.15 - p1[1]) * (1.15 - p1[1])), 1.15];
    barra(cruz[0], cruz[1], zz * 1.02, p1[0], p1[1], zz * 1.02, 0.08, [0.7, 0.68, 0.64]);
    barra(cruz[0], 1.15, zz, -3.55, 1.15, zz, 0.045, [0.78, 0.76, 0.72]);
    push(); translate(cruz[0], 1.15, zz); scale(0.3, 0.15, 0.1); md(G.cubo, { tinta: [0.32, 0.32, 0.36] }); pop();
    push(); translate(cruz[0], 1.15, zz * 1.02 + Math.sign(z) * 0.05); scale(0.1, 0.1, 0.03); md(G.cubo, { tinta: [0.8, 0.62, 0.3] }); pop(); mat({}); // pino da cruzeta
  }
  // tênder e vagões
  const cTender = carro('tender');
  push(); translate((cTender.x0 + cTender.x1) / 2, 0, 0); model(G.tender);
  for (const z of [-0.79, 0.79]) for (const wx of [-2.8, -1.0, 1.0, 2.8]) { push(); translate(wx, 0.42, z); rotateZ(angV); model(G.rodaV); pop(); }
  pop();
  for (const id of ['D', 'P1', 'P2']) {
    const c = carro(id), cx = (c.x0 + c.x1) / 2;
    push(); translate(cx, 0, 0);
    model(id === 'D' ? G.vagaoD : G.vagaoP);
    if (id === 'D') { // folhas das portas de trás e da frente do restaurante (abrem para fora, para as plataformas), sempre desenhadas como os vidros delas
      const dd = ESTADO.dentroD, kD = ESTADO.luzD;
      for (const [lx, ang] of [[-7.5, portaD(t)], [7.5, -portaDFrente(t)]]) { push(); translate(lx, PISO - 0.04, 0.45); rotateY(ang); md(G.portaD, { sol: dd ? 0.15 : 1, amb: dd ? 0.55 * (0.25 + 0.75 * kD) : 1 }); pop(); }
      mat({});
    }
    for (const z of [-0.79, 0.79]) for (const wx of rodasCarro(17)) { push(); translate(wx, 0.42, z); rotateZ(angV); model(G.rodaV); pop(); }
    pop();
  }
  const cS = carro('S');
  push(); translate((cS.x0 + cS.x1) / 2, 0, 0); model(G.vagaoS);
  // a palha do chão, só com a câmera perto do vagão (por dentro, ela não aparece de longe)
  if (Math.hypot(CAM.olho[0] - x - (cS.x0 + cS.x1) / 2, CAM.olho[2]) < 45) model(G.palhaChaoS);
  for (const z of [-0.79, 0.79]) for (const wx of [-6.3, -4.5, 4.5, 6.3]) { push(); translate(wx, 0.42, z); rotateZ(angV); model(G.rodaV); pop(); }
  push(); translate(-ESTADO.portaS * 2.3, ALT.piso, -1.53); model(G.portaS); pop();
  pop();
  pop();
}
function desenhaVidrosTrem(t) {
  const x = xLoco(t);
  push(); translate(x, Y_TRILHO, 0);
  const aceso = ESTADO.vidrosAcesos;
  for (const id of ['D', 'P1', 'P2']) {
    const c = carro(id), cx = (c.x0 + c.x1) / 2;
    push(); translate(cx, 0, 0);
    if (id === 'D' && ESTADO.dentroD) md(G.vidrosD, { tinta: [0.55, 0.62, 0.7], alfa: 0.14, semLuz: 1 });
    else if (id === 'D' && ESTADO.vidroClaroD) md(G.vidrosD, { tinta: [0.85, 0.7, 0.55], alfa: 0.12, semLuz: 1 }); // de fora, mas vendo dentro (P11): um vidro claro, levemente quente
    else md(id === 'D' ? G.vidrosD : G.vidrosP, { tinta: lerp3([0.25, 0.22, 0.2], [1.0, 0.72, 0.38], aceso * (id === 'D' ? ESTADO.luzD : 1)), alfa: 0.94, semLuz: 1 });
    if (id === 'D') for (const [lx, ang] of [[-7.5, portaD(t)], [7.5, -portaDFrente(t)]]) { // vidros das duas folhas, que abrem: as bordas entram nos montantes e nas travessas
      push(); translate(lx, PISO - 0.04, 0.45); rotateY(ang); translate(0, 1.55, -0.45); scale(0.012, 0.94, 0.68);
      md(G.cubo, ESTADO.dentroD ? { tinta: [0.55, 0.62, 0.7], alfa: 0.16, semLuz: 1 } : { tinta: lerp3([0.25, 0.22, 0.2], [1.0, 0.72, 0.38], aceso * ESTADO.luzD), alfa: 0.94, semLuz: 1 }); pop(); }
    pop();
  }
  pop();
  mat({});
}
function barra(x0, y0, z0, x1, y1, z1, esp, cor) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy);
  push(); translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); rotateZ(Math.atan2(dy, dx)); scale(L, esp, esp * 0.6);
  md(G.cubo, { tinta: cor }); pop(); mat({});
}

// fumaça da chaminé: puffs emitidos ao longo do tempo, sem estado
function desenhaFumaca(t, intensidade = 1, cor = [0.6, 0.55, 0.55]) {
  particulas({ taxa: 7, vida: 7, ate: t, desenha: (i, te, u, idade) => {
    const x0 = xLoco(te) - 2.3, v = vTrem(te);
    const sobe = 2 + idade * 2.4 - idade * idade * 0.12;
    const px = x0 + idade * 1.2 - (v > 1 ? 0 : 0), pz = idade * 0.9 + noise1(i * 0.37) * idade * 0.6;
    const r = (0.6 + idade * 0.85) * (0.8 + 0.4 * hash2(i, 3));
    push(); translate(px, Y_TRILHO + 4.8 + sobe, pz); scale(r, r * 0.8, r);
    md(G.bolhaFina, { tinta: cor, alfa: (1 - u) * 0.55 * intensidade * Math.min(1, idade * 3), amb: 1.2 });
    pop();
  } });
  mat({});
}

// faíscas das rodas na frenagem (126 a 140 s): riscos curtos que saltam do trilho, só com a câmera perto do trem
function desenhaFaiscas(ta) {
  if (ta < 126.3 || ta > 140) return;
  const xl = xLoco(ta), k = Math.min(1, (ta - 126.3) / 0.6) * Math.min(1, (140 - ta) / 2.0), v = vTrem(ta);
  if (Math.hypot(CAM.olho[0] - (xl - 45), CAM.olho[2]) > 220 || k <= 0) return;
  const rodas = [];
  for (const wx of [-6.0, -8.0]) rodas.push(wx);
  const ct = carro('tender'); for (const wx of [-2.8, -1.0, 1.0, 2.8]) rodas.push((ct.x0 + ct.x1) / 2 + wx);
  for (const id of ['D', 'P1', 'P2']) { const c = carro(id); for (const wx of rodasCarro(17)) rodas.push((c.x0 + c.x1) / 2 + wx); }
  for (const wx of [-6.3, -4.5, 4.5, 6.3]) rodas.push(CX_S + wx);
  rodas.forEach((rx, n) => { for (const z of [-0.72, 0.72]) for (let i = 0; i < 2; i++) {
    const f = (ta * 7 + hash2(n * 2 + (z > 0 ? 1 : 0), i)) % 1, age = f * 0.28, sx = (hash2(n, i + 5) - 0.3) * 2.5;
    const q = [xl + rx + 0.42 + (v * 0.25 + sx) * age, Y_TRILHO + 0.05 + 1.6 * age - 4.9 * age * age, z * (1 + 1.5 * age)];
    push(); translate(q[0], q[1], q[2]); rotateZ(-0.5); scale(0.07, 0.008, 0.008); md(G.cubo, { tinta: [2.0, 1.2, 0.45], semLuz: 1, alfa: k * (1 - f) }); pop();
  } });
  mat({});
}

// ================================================================ VISTORIA DOS MODELOS
// ?ver=mundo | trem | elenco | cavalo | interior — usado para conferir os modelos
function vistoria(modo, t) {
  const giro = t * 0.25;
  if (modo === 'mundo') { aplicaAmb(AMBIENTES.tarde); CAM = { olho: [xLoco(5) - 140, 60, 120], alvo: [xLoco(5) - 20, 2, 0], fov: 40, rolo: 0, perto: 0.3, longe: 6000 }; }
  if (modo === 'trem') { aplicaAmb(AMBIENTES.tarde); const x = xLoco(36); CAM = { olho: [x - 20 + Math.cos(giro) * 30, 6, Math.sin(giro) * 30 + 12], alvo: [x - 30, 2, 0], fov: 38, rolo: 0, perto: 0.2, longe: 6000 }; }
  if (modo === 'loco') { aplicaAmb(AMBIENTES.tarde); const x = xLoco(36); CAM = { olho: [x + 4, 3.0, 9], alvo: [x - 5, 2.0, 0], fov: 40, rolo: 0, perto: 0.1, longe: 6000 }; }
  if (modo === 'interior') { aplicaAmb(AMBIENTES.tarde); ESTADO.dentroD = true; const x = xLoco(36); CAM = { olho: [x - 37, Y_TRILHO + 2.9, -0.4], alvo: [x - 24, Y_TRILHO + 2.1, 0.3], fov: 62, rolo: 0, perto: 0.05, longe: 6000 }; }
  if (modo === 'elenco') { aplicaAmb(AMBIENTES.tarde); CAM = { olho: [-31.5, 1.6, 15.5], alvo: [-31.5, 1.05, 9], fov: 40, rolo: 0, perto: 0.1, longe: 6000 }; }
  if (modo === 'rosto') { aplicaAmb(AMBIENTES.tarde); CAM = { olho: [-35.3, 1.62, 10.4], alvo: [-36, 1.55, 9], fov: 24, rolo: 0, perto: 0.05, longe: 6000 }; }
  if (modo === 'cavalo') { aplicaAmb(AMBIENTES.tarde); CAM = { olho: [-20 + 9, 2.2, 14.3], alvo: [-20, 1.0, 14.3], fov: 30, rolo: 0, perto: 0.1, longe: 6000 }; }
  if (modo === 'noite') { aplicaAmb(AMBIENTES.noite); CAM = { olho: [xLoco(100) - 60, 12, 30], alvo: [xLoco(100) - 40, 3, 0], fov: 45, rolo: 0, perto: 0.2, longe: 6000 }; }
  if (modo === 'canion') { aplicaAmb(AMBIENTES.noite); CAM = { olho: [1120, 40, -60], alvo: [1250, -40, -120], fov: 50, rolo: 0, perto: 0.3, longe: 6000 }; }
}
function desenhaVistoria(modo, t) {
  desenhaMundo();
  const tt = (modo === 'noite' || modo === 'canion') ? 100 : 36;
  desenhaTrem(tt);
  if (modo === 'interior') { const x = xLoco(tt); push(); translate(x - 30, Y_TRILHO, 0); model(G.interiorD); pop();
    AMB.luzes = []; }
  if (modo === 'elenco' || modo === 'rosto') {
    const lista = [G.jack, G.jackFL, G.xerife, G.barao, G.convidados[0], G.convidados[1], G.ajudantes[0], G.convidados[4]];
    lista.forEach((P, i) => { const p = poseBase(); p.x = -36 + i * 1.0; p.z = 9; p.yaw = 0.35; p.ombroD = 0.3; p.cotoveloD = 0.6; desenhaPessoa(P, p); });
    // relógio-joia e bomba
    push(); translate(-27.6, 1.0, 9.5); scale(1.6); desenhaRelogio({ seg: T * 10, abre: 1.2 }); pop();
    push(); translate(-27.0, 1.0, 9.5); scale(1.6); desenhaRelogio({ seg: T * 10 }); pop();
  }
  if (modo === 'cavalo') {
    const e = { x: -20, y: alturaTerreno(-20, 14), z: 14, yaw: 0, passo: T * 2.3, galope: 1 };
    desenhaCavalo(G.cavaloPreto, e);
    desenhaPessoa(G.jackFL, poseCavaleiro(e), { pernasVisiveis: true, cavalo: e });
  }
  desenhaVidrosTrem(tt);
  desenhaFumaca(tt);
}

// ================================================================ GANCHOS DO MOTOR
let PLANOS = [];
function prepararRoteiro() { if (typeof montaPlanos === 'function') PLANOS = montaPlanos(); }
function planoAtual() { for (const p of PLANOS) if (T >= p.a && T < p.b) return p; return PLANOS[PLANOS.length - 1] || null; }
let PLANO = null;
// Máscara do título, em diagonal pela largura dele (u vai de 0, à esquerda, a 1, à direita).
// Uma frente suave revela o título da esquerda para a direita; no meio, uma onda transparente
// atravessa as letras e deixa ver o trem por trás; no fim, outra frente o apaga no mesmo sentido.
function mascaraTitulo(t) {
  const fEntra = lerp1(-0.35, 1.35, suave(fase0(t, 0.7, 2.3)));
  const fSai = lerp1(-0.35, 1.35, suave(fase0(t, 4.7, 6.4)));
  const onda = lerp1(-0.4, 1.4, fase0(t, 2.1, 4.8));
  const paradas = [];
  for (let i = 0; i <= 20; i++) {
    const u = i / 20;
    const a = (1 - sstep(fEntra - 0.15, fEntra + 0.15, u)) * sstep(fSai - 0.15, fSai + 0.15, u)
      * (1 - 0.72 * Math.exp(-Math.pow((u - onda) / 0.16, 2)));
    paradas.push(`rgba(0,0,0,${a.toFixed(3)}) ${(u * 100).toFixed(0)}%`);
  }
  return `linear-gradient(105deg, ${paradas.join(', ')})`;
}
function roteiroQuadro(t) {
  const modo = PARAM.get('ver');
  ESTADO.dentroD = false;
  if (modo) { vistoria(modo, t); return; }
  PLANO = planoAtual();
  if (PLANO) PLANO.prepara(t);
  // título de abertura, à moda dos filmes antigos: entra com o trem, treme como projeção e sai antes do fim do plano
  const tit = document.getElementById('titulo');
  if (tit) {
    if (t > 0.6 && t < 6.5) {
      const e = 1.06 - 0.06 * suave(fase0(t, 0.7, 2.6)) + 0.03 * suave(fase0(t, 4.7, 6.4)), w = (Math.random() - 0.5) * 1.2;
      tit.style.opacity = (0.93 + Math.random() * 0.07).toFixed(3);
      tit.style.transform = `translate(calc(-50% + ${w.toFixed(2)}px), calc(-50% + ${(w * 0.6).toFixed(2)}px)) scale(${e.toFixed(4)})`;
      tit.style.display = 'block';
      const m = mascaraTitulo(t);
      tit.style.maskImage = m; tit.style.webkitMaskImage = m;
      const borra = 3 * (1 - suave(fase0(t, 0.7, 2.3))) + 4 * suave(fase0(t, 4.7, 6.4));
      tit.style.filter = borra > 0.05 ? `blur(${borra.toFixed(2)}px)` : 'none';
    } else if (tit.style.display !== 'none') { tit.style.opacity = 0; tit.style.display = 'none'; }
  }
  const leg = document.getElementById('legenda');
  if (leg) { leg.classList.toggle('visivel', t > 183.1 && t < 185.6); leg.style.top = (height / 2 - 60) + 'px'; }
}
function desenhaCena() {
  const modo = PARAM.get('ver');
  if (modo) { desenhaVistoria(modo, T); return; }
  if (PLANO) PLANO.desenha(T);
}

// ================================================================ TEMPO DA AÇÃO
// Câmera lenta: dentro destes trechos a ação desacelera no meio e acelera nas
// pontas, mas começa e termina no tempo exato da música.
// Com "volta", a lentidão fica só em [a, b] (a mais lenta no meio) e o tempo perdido é recuperado
// depois, em [volta0, volta1], com a ação um pouco mais rápida: a música não para e, no fim, ação e música voltam a coincidir.
// bumps: [início, fim, k]: a velocidade da ação cai para 1 - k no meio de cada trecho (k negativo: acelera); a soma de
// k·(fim - início) de cada grupo é zero, para a ação voltar ao tempo da música no fim do grupo
// Um quarto valor em bumps põe o ponto mais lento (ou mais rápido) nesse instante, e não no meio do trecho.
// A bala no chapéu (2:23,40 da música, a pedido do Angel): a ação adianta aos poucos do P38 ao tique (até 1,39x), fica lenta
// na bala (0,34x no impacto) e na entrada da câmera no furo (0,22x logo depois, de volta a 1x em 2:26,5, quando já vemos o
// grupo) e se acerta no P42a e no P42, quando ela já dispara a galope (até 1,31x). O P41b não tem pressa nenhuma.
const LENTAS = [{ a: 121.35, b: 127.13, k: 0.74 },
  { bumps: [[136.8, 142.43, -2 * 1.09 / 5.63], [142.58, 142.58 + 2 * (1.09 + 0.438) / 0.78, 0.78, 143.68], [146.9, 149.7, -0.438 / 1.4]] },
  { bumps: [[156.0, 158.4, -0.3], [160.45, 161.85, 0.3 * 2.4 / 1.4]] }];      // adianta um pouco no impasse e devolve no voo do diamante (até 0,49x); o lance da bomba é em tempo real
function _intBump(t, a, b, m) { // integral de (1 - cos)/2
  if (m === undefined) { const L = b - a, u = Math.max(0, Math.min(1, (t - a) / L)); return L * (u / 2 - Math.sin(2 * Math.PI * u) / (4 * Math.PI)); }
  if (t <= m) { const L = m - a, x = Math.max(0, (t - a) / L); return L * (x / 2 - Math.sin(Math.PI * x) / (2 * Math.PI)); }
  const L = b - m, y = Math.min(1, (t - m) / L); return (m - a) / 2 + L * (y / 2 + Math.sin(Math.PI * y) / (2 * Math.PI));
}
function tempoAcao(t) {
  for (const s of LENTAS) {
    if (s.bumps) { const a = s.bumps[0][0], b = s.bumps[s.bumps.length - 1][1]; if (t > a && t < b) { let r = t; for (const [a0, b0, k, m0] of s.bumps) r -= k * _intBump(t, a0, b0, m0); return r; } continue; }
    if (s.volta) { const [c, d] = s.volta; if (t > s.a && t < d) return t - s.k * _intBump(t, s.a, s.b) + s.k * (s.b - s.a) / (d - c) * _intBump(t, c, d); continue; }
    if (t > s.a && t < s.b) { const L = s.b - s.a, u = (t - s.a) / L; return t + s.k * Math.sin(2 * Math.PI * u) * L / (2 * Math.PI); }
  }
  return t;
}

// ================================================================ TRAJETOS
function trilha(keys, t) { // interpolação suave entre quadros-chave [t, ...valores]
  if (t <= keys[0][0]) return keys[0].slice(1);
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t <= b[0]) { const u = suave((t - a[0]) / (b[0] - a[0])); return a.slice(1).map((v, j) => v + (b[j + 1] - v) * u); }
  }
  return keys[keys.length - 1].slice(1);
}
function trilhaLin(keys, t) {
  if (t <= keys[0][0]) return keys[0].slice(1);
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t <= b[0]) { const u = (t - a[0]) / (b[0] - a[0]); return a.slice(1).map((v, j) => v + (b[j + 1] - v) * u); }
  }
  return keys[keys.length - 1].slice(1);
}
// Catmull-Rom em x,z (trajetos de cavalos)
function curva(keys, t) {
  const n = keys.length;
  if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
  if (t >= keys[n - 1][0]) return [keys[n - 1][1], keys[n - 1][2]];
  let i = 0; while (i < n - 2 && t > keys[i + 1][0]) i++;
  const p0 = keys[Math.max(0, i - 1)], p1 = keys[i], p2 = keys[i + 1], p3 = keys[Math.min(n - 1, i + 2)];
  const u = (t - p1[0]) / (p2[0] - p1[0]), u2 = u * u, u3 = u2 * u;
  const cr = (a, b, c, d) => 0.5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
  return [cr(p0[1], p1[1], p2[1], p3[1]), cr(p0[2], p1[2], p2[2], p3[2])];
}
function rumo(f, t, h = 0.05) { const a = f(t - h), b = f(t + h); const dx = b[0] - a[0], dz = b[1] - a[1]; return { yaw: Math.atan2(dx, dz), v: Math.hypot(dx, dz) / (2 * h) }; }
// distância percorrida (para a fase dos passos), integrando a velocidade
function percorrido(f, t, t0) { let s = 0, prev = f(t0); for (let x = t0 + 0.1; x <= t; x += 0.1) { const c = f(x); s += Math.hypot(c[0] - prev[0], c[1] - prev[1]); prev = c; } return s; }

// ================================================================ POSES
function andar(p, fase, amp = 1) {
  const a = fase * Math.PI * 2, s = Math.sin(a), c = Math.cos(a);
  p.quadE = 0.42 * s * amp; p.quadD = -0.42 * s * amp;
  p.joelhoE = (Math.max(0, -c) * 0.75 + 0.06) * amp; p.joelhoD = (Math.max(0, c) * 0.75 + 0.06) * amp;
  p.ombroE = -0.32 * s * amp; p.ombroD = 0.32 * s * amp; p.cotoveloE = p.cotoveloD = 0.3 + 0.1 * amp;
  p.bob = (Math.abs(c) * 0.035 - 0.02) * amp; p.saia = 0.05 * s * amp; p.torce = 0.06 * s * amp;
  return p;
}
// ---------------------------------------------------------------- corrida
// A corrida com o pé plantado: cada perna fica no chão uma fração da passada (menos quanto mais rápido), o quadril passa
// por cima do pé e o pé rola do calcanhar para a ponta; no voo, o calcanhar sobe para trás, o joelho vem alto à frente e a
// perna se estende antes de pousar. A passada (metros por ciclo, dois passos) cresce com a velocidade: a cadência fica
// perto da real (de 2,6 passos por segundo trotando a 4 por segundo em disparada).
function passadaCorrida(v) { return Math.max(1.7, Math.min(3.9, 1.25 + 0.34 * v)); }
const _faseCorr = new Map();
function faseCorrida(keys, t, ix = 0, iz = 1) {
  let tab = _faseCorr.get(keys);
  if (!tab) { tab = { t0: keys[0][0], dt: 0.02, f: [0] }; let prev = trilhaH(keys, tab.t0); const t1 = Math.min(keys[keys.length - 1][0], tab.t0 + 120);
    for (let x = tab.t0 + tab.dt; x <= t1 + 1e-6; x += tab.dt) { const c = trilhaH(keys, x), d = Math.hypot(c[ix] - prev[ix], c[iz] - prev[iz]); tab.f.push(tab.f[tab.f.length - 1] + d / passadaCorrida(d / tab.dt)); prev = c; }
    _faseCorr.set(keys, tab); }
  const f = (t - tab.t0) / tab.dt; if (f <= 0) return 0; const i = Math.min(tab.f.length - 2, Math.floor(f));
  return tab.f[i] + (tab.f[i + 1] - tab.f[i]) * Math.min(1, f - i);
}
// Medidas do pé (unidades de 1,75 m, a partir do tornozelo, em -0,43 na canela): o calcanhar 0,1 atrás e a ponta 0,17 à frente,
// a sola 0,055 abaixo. O tornozelo (p.peE, p.peD; positivo, a ponta desce) deixa o pé plano no chão com a canela inclinada.
const PE_H = { cal: -0.1, pon: 0.17, sola: 0.055, tor: 0.43 };
// gira (z, y) por f (positivo: a frente sobe)
const giraZY = (z, y, f) => [z * Math.cos(f) - y * Math.sin(f), z * Math.sin(f) + y * Math.cos(f)];
// coxa e canela (ângulos no mundo, para a frente a partir da vertical) para levar o tornozelo de (zq, yq) até (zA, yA); o joelho dobra para a frente
function pernaAte(D, zq, yq, zA, yA) {
  const Lt = D.coxa, La = PE_H.tor * D.s, dz = zA - zq, dy = yA - yq, d = Math.min(Math.hypot(dz, dy), Lt + La - 1e-5);
  const ang = Math.atan2(dz, -dy), a = ang + Math.acos(Math.max(-1, Math.min(1, (Lt * Lt + d * d - La * La) / (2 * Lt * d))));
  const K = [zq + Lt * Math.sin(a), yq - Lt * Math.cos(a)];
  return { a, b: Math.atan2(zA - K[0], -(yA - K[1])), sobra: Math.max(0, Math.hypot(dz, dy) - Lt - La) };
}
// o tornozelo no apoio: na fração a, com o calcanhar plantado em 0 (e a ponta em sola): pousa pelo calcanhar com a ponta
// erguida (f0), assenta o pé, e sai pela ponta, o calcanhar subindo (f1). Devolve o tornozelo e a inclinação do pé.
function tornozeloNoApoio(s, a, f0, f1) {
  const P = PE_H, aF = 0.16, aT = 0.5;
  if (a < aF) { const f = f0 * (1 - suave(a / aF)), v = giraZY(-P.cal * s, P.sola * s, f); return [v[0], v[1], f]; } // do calcanhar ao tornozelo
  if (a < aT) return [-P.cal * s, P.sola * s, 0];
  const f = -f1 * Math.pow((a - aT) / (1 - aT), 1.25), v = giraZY(-P.pon * s, P.sola * s, f); return [(P.pon - P.cal) * s + v[0], v[1], f]; // da ponta ao tornozelo
}
function correr(p, fase, amp = 1, v = 4.5, P = G.jackFL) {
  const D = P.D, s = D.s, S = passadaCorrida(v), duty = Math.max(0.22, Math.min(0.4, 0.44 - 0.03 * v)), Lst = duty * S, sola = (PE_H.pon - PE_H.cal) * s, T2 = Math.PI * 2;
  const rapido = clamp01((v - 2.5) / 5), f0 = lerp1(0.26, 0.12, rapido), f1 = lerp1(0.55, 0.75, rapido); // devagar, pousa mais pelo calcanhar; rápido, mais pela planta, e empurra mais com a ponta
  const zc = lerp1(0.22, 0.235, rapido) * s, zt = Math.max(0.1 * s, Lst - zc - sola); // o calcanhar pousa à frente do quadril; a ponta sai atrás dele
  const R = (D.coxa + PE_H.tor * s) * 0.995;
  const alcance = (zh, A) => A[1] + Math.sqrt(Math.max(0, R * R - (A[0] - zh) ** 2)); // a altura máxima do quadril em zh com o tornozelo em A
  const A0 = tornozeloNoApoio(s, 0, f0, f1), A1 = tornozeloNoApoio(s, 1, f0, f1);
  const H0 = Math.min(D.quadril * 0.965, alcance(-zc, A0), alcance(sola + zt, A1)) - (0.014 + 0.016 * rapido) * s; // o quadril no pouso e na saída (uma folga: o joelho chega um pouco dobrado)
  const desce = lerp1(0.03, 0.022, rapido) * s, sobe = lerp1(0.03, 0.022, rapido) * s; // no meio do apoio o quadril desce (o joelho cede); no voo, sobe
  const altQ = c => { const h = ((2 * c) % 1 + 1) % 1, st = 2 * duty; return h < st ? H0 - desce * Math.sin(Math.PI * h / st) : H0 + sobe * Math.sin(Math.PI * (h - st) / (1 - st)); };
  const inc = (0.06 + 0.02 * v) * Math.min(1, amp * 1.2), incP = inc * 0.4;
  // uma perna no apoio, na fração a: [coxa, canela, tornozelo]
  const noApoio = (a, c) => { const A = tornozeloNoApoio(s, a, f0, f1), r = pernaAte(D, -zc + a * Lst, altQ(c), A[0], A[1]); return [r.a, r.b, r.b - A[2]]; };
  const kMax = lerp1(1.45, 2.25, rapido), avanco = lerp1(0.06, 0.16, rapido); // a dobra do joelho no voo e quanto a coxa passa à frente antes de pousar
  const her = (p0, m0, p1, m1, x, L) => { const x2 = x * x, x3 = x2 * x; return (2 * x3 - 3 * x2 + 1) * p0 + (x3 - 2 * x2 + x) * m0 * L + (-2 * x3 + 3 * x2) * p1 + (x3 - x2) * m1 * L; };
  // (A0: o tornozelo no pouso, em relação ao calcanhar, calculado acima)
  const perna = u => {
    if (u < duty) return noApoio(u / duty, fase);
    const w = (u - duty) / (1 - duty), cS = fase - (u - duty), h = 0.08, cP = fase + (1 - u);
    const sai = noApoio(1, cS), sai0 = noApoio(1 - h, cS - h * duty), poe = noApoio(0, cP);
    const f = (1 - duty) / duty / h, m = (x, y) => Math.max(-6, Math.min(6, (x - y) * f));
    const jS = sai[0] - sai[1], wJ = 0.4, wE = 0.62, aMax = poe[0] + avanco;
    // começo do voo, por ângulos: a coxa vem à frente; o calcanhar sobe para trás (joelho até kMax) e fica dobrado
    const angulos = ww => { const a = her(sai[0], m(sai[0], sai0[0]), aMax, 0, Math.min(1, ww / 0.72), 0.72);
      const jk = ww < wJ ? her(jS, m(jS, sai0[0] - sai0[1]), kMax, 0, ww / wJ, wJ) : her(kMax, 0, kMax - 0.3, 0, (ww - wJ) / (wE - wJ), wE - wJ); return [a, jk]; };
    // tornozelo: a ponta desce depois de empurrar, relaxa no voo e sobe antes de pousar
    const pm = lerp1(0.3, 0.45, rapido), wP = 0.4, pe = w < wP ? her(sai[2], 0, pm, 0, w / wP, wP) : her(pm, 0, poe[2], 0, (w - wP) / (1 - wP), 1 - wP);
    const Lt = D.coxa, La = PE_H.tor * s;
    const peEm = ww => ww < wP ? her(sai[2], 0, pm, 0, ww / wP, wP) : her(pm, 0, poe[2], 0, (ww - wP) / (1 - wP), 1 - wP);
    // começo do voo com a folga: o pé não encosta no chão; se encostaria, o joelho dobra mais (num passo contínuo)
    const comFolga = (ww, hq) => { let [aa, jj] = angulos(ww); const folga = 0.07 * s * Math.sin(Math.PI * ww), pp = peEm(ww);
      const baixo = j2 => { const b = aa - j2, K = [Lt * Math.sin(aa), hq - Lt * Math.cos(aa)], An = [K[0] + La * Math.sin(b), K[1] - La * Math.cos(b)], ft = b - pp;
        const c1 = giraZY(PE_H.cal * s, -PE_H.sola * s, ft), c2 = giraZY(PE_H.pon * s, -PE_H.sola * s, ft); return Math.min(An[1] + c1[1], An[1] + c2[1]); };
      const h0 = baixo(jj); if (h0 < folga) { const sens = Math.max(0.05, (baixo(jj + 0.05) - h0) / 0.05); jj += Math.min(1.0, (folga - h0) / sens); }
      return [aa, jj]; };
    const yq = altQ(fase);
    let a, jk;
    if (w <= wE) [a, jk] = comFolga(w, yq);
    else { // fim do voo: o tornozelo desce por uma curva até o ponto do pouso e chega com a velocidade do chão (o pé pousa parado)
      const tor = (aa, jj, hq) => { const b = aa - jj; return [Lt * Math.sin(aa) + La * Math.sin(b), hq - Lt * Math.cos(aa) - La * Math.cos(b)]; };
      const dw = 0.02, cE = fase - (w - wE) * (1 - duty), hE = altQ(cE), hE2 = altQ(cE - dw * (1 - duty)), [aE, jE] = comFolga(wE, hE), [aE2, jE2] = comFolga(wE - dw, hE2);
      const PE = tor(aE, jE, hE), PE2 = tor(aE2, jE2, hE2), VE = [(PE[0] - PE2[0]) / dw, (PE[1] - PE2[1]) / dw];
      const Ptd = [A0[0] + zc, A0[1]], Vtd = [-0.75 * S * (1 - duty), -0.02 * s], x = (w - wE) / (1 - wE), L = 1 - wE; // chega quase com a velocidade do chão
      const r = pernaAte(D, 0, yq, her(PE[0], VE[0], Ptd[0], Vtd[0], x, L), her(PE[1], VE[1], Ptd[1], Vtd[1], x, L)); a = r.a; jk = r.a - r.b;
    }
    return [a, a - jk, pe];
  };
  const uE = ((fase % 1) + 1) % 1, uD = (((fase + 0.5) % 1) + 1) % 1, E = perna(uE), Dd = perna(uD);
  const mix = (x, y) => lerp1(x, y, amp);
  // coxa e joelho no referencial da pelve (a pelve inclina 0,4 da inclinação do corpo)
  p.quadE = mix(0, E[0] + incP); p.joelhoE = mix(0.05, E[0] - E[1]); p.quadD = mix(0, Dd[0] + incP); p.joelhoD = mix(0.05, Dd[0] - Dd[1]);
  p.peE = mix(0, E[2]); p.peD = mix(0, Dd[2]);
  p.bob = mix(0, altQ(fase) - D.quadril); p.inclina = inc;
  // braços: o de cada lado vai à frente quando a perna do mesmo lado vai para trás; cotovelo em ângulo, mais fechado à frente
  const bE = Math.cos(T2 * (uE - 0.42)), bD = Math.cos(T2 * (uD - 0.42)), aB = lerp1(0.55, 0.95, rapido);
  p.ombroE = mix(p.ombroE || 0, 0.12 + aB * bE); p.ombroD = mix(p.ombroD || 0, 0.12 + aB * bD);
  p.cotoveloE = mix(p.cotoveloE || 0.15, 1.5 + 0.32 * bE); p.cotoveloD = mix(p.cotoveloD || 0.15, 1.5 + 0.32 * bD);
  p.abracoE = mix(p.abracoE || 0.08, 0.12 + 0.07 * Math.max(0, bE)); p.abracoD = mix(p.abracoD || 0.08, 0.12 + 0.07 * Math.max(0, bD));
  // o tronco gira ao contrário das pernas; a cabeça fica firme, olhando à frente
  p.torce = mix(0, lerp1(0.1, 0.17, rapido) * Math.cos(T2 * (uD - 0.9)));
  p.cabPitch = (p.cabPitch || 0) - 0.75 * inc; p.cabYaw = (p.cabYaw || 0) - 0.5 * p.torce;
  p.saia = 0.15 * Math.sin(T2 * fase);
  return p;
}
function respira(p, t, k = 1) { p.bob += Math.sin(t * 1.7) * 0.004 * k; p.cabYaw += Math.sin(t * 0.37) * 0.06 * k; p.ombroE += Math.sin(t * 1.7) * 0.02; p.ombroD += Math.sin(t * 1.7 + 0.4) * 0.02; return p; }
function sentar(p) { p.sentado = 1; p.quadE = p.quadD = 1.5; p.joelhoE = p.joelhoD = 1.45; p.saia = 0.95; p.ombroE = p.ombroD = 0.35; p.cotoveloE = p.cotoveloD = 1.0; return p; }
function bracosCruzados(p) { p.ombroE = 0.52; p.ombroD = 0.74; p.cotoveloE = 2.3; p.cotoveloD = 2.18; p.abracoE = p.abracoD = 0.32; p.giroBE = 1.05; p.giroBD = -1.05; return p; } // o antebraço direito passa por fora do esquerdo (antes os dois se atravessavam)
function subir(p, u) { // escalada: u cresce com a altura
  const a = u * Math.PI * 6;
  p.ombroE = 2.6 + Math.sin(a) * 0.35; p.ombroD = 2.6 - Math.sin(a) * 0.35; p.cotoveloE = 0.6 - Math.sin(a) * 0.4; p.cotoveloD = 0.6 + Math.sin(a) * 0.4;
  p.quadE = 0.9 + Math.sin(a) * 0.5; p.quadD = 0.9 - Math.sin(a) * 0.5; p.joelhoE = 1.3 + Math.sin(a) * 0.4; p.joelhoD = 1.3 - Math.sin(a) * 0.4;
  p.inclina = 0.1; return p;
}
function pendurada(p, t) { p.ombroE = p.ombroD = 3.0; p.cotoveloE = p.cotoveloD = 0.3 + Math.sin(t * 9) * 0.1; p.quadE = 0.3 + Math.sin(t * 7) * 0.3; p.quadD = 0.2 - Math.sin(t * 7) * 0.3; p.joelhoE = p.joelhoD = 0.6; p.saia = 0.1; return p; }
function deitada(p) { p.pitch = 1.45; p.quadE = p.quadD = 0.1; p.joelhoE = p.joelhoD = 0.3; p.ombroE = p.ombroD = 2.4; p.cotoveloE = p.cotoveloD = 1.6; p.cabPitch = -0.9; return p; }
function deitadaCostas(p) { p.pitch = -1.42; p.quadE = p.quadD = 0.05; p.joelhoE = p.joelhoD = 0.25; p.ombroE = p.ombroD = 0.35; p.abracoE = p.abracoD = 0.35; p.cotoveloE = p.cotoveloD = 0.4; p.cabPitch = 0.55; p.saia = 0; return p; }
function noAr(p, u) { p.quadE = 0.9; p.quadD = -0.7; p.joelhoE = 1.2; p.joelhoD = 0.4; p.ombroE = 1.8; p.ombroD = -0.6; p.cotoveloE = 0.4; p.cotoveloD = 0.8; p.inclina = 0.4; p.saia = 0.4; return p; }
function poseDe(P, x, y, z, yaw) { const p = poseBase(); p.x = x; p.y = y; p.z = z; p.yaw = yaw; return p; }

// ================================================================ VAGÃO-RESTAURANTE
const CX_D = -30, PISO = ALT.piso + 0.04;
const MESAS = [-4.4, -1.8, 0.8, 3.4];
// convidados: [índice, x local, lado, olha para +x?]
const ASSENTOS = [[0, 2.72, 1, true], [1, 4.08, 1, false], [2, 0.12, 1, true], [3, 1.48, 1, false], [4, -2.48, 1, true], [5, -1.12, 1, false],
  [6, -5.08, 1, true], [7, -3.72, 1, false], [8, 0.12, -1, true], [9, 1.48, -1, false]];
const YAW_MAISX = Math.PI / 2, YAW_MENOSX = -Math.PI / 2;
const YAW_VITRINE = Math.atan2(6.05 - 5.3, 0.82 - 0.4); // o xerife na vitrine, de frente para o pedestal (de costas para o vagão)
function dLocal(x, y, z) { return [CX_D + x, y, z]; }

// poses dos convidados, conforme o momento
function poseConvidado(i, x, lado, olhaMais, ta) {
  const p = poseBase(); const [lx, ly, lz] = dLocal(x + (olhaMais ? -0.04 : 0.04), PISO, lado * 0.92);
  p.x = lx; p.y = ly; p.z = lz; p.yaw = olhaMais ? YAW_MAISX : YAW_MENOSX; sentar(p);
  const fase = ta * 0.5 + i * 1.7, mulher = i % 2 === 0;
  // conversa e brindes
  p.cabYaw = Math.sin(fase * 0.8) * 0.35; p.cabPitch = Math.sin(fase * 0.5) * 0.08;
  const gole = Math.max(0, Math.sin(fase * 0.9)) ** 6;
  p.ombroD = 0.4 + gole * 1.0; p.cotoveloD = 1.0 + gole * 1.2; if (i % 3 !== 2) p.maoD = 'taca';
  p.ombroE = 0.45 + Math.sin(fase * 1.3) * 0.15; p.cotoveloE = 1.1;
  p.expr = Math.sin(fase * 0.7 + i) > 0.05 ? 'sorriso' : 'neutro';
  // o Barão brinda: todos olham para ele, sorrindo
  if (ta > 24 && ta < 27.5) { p.cabYaw = (lado > 0 ? 0.5 : -0.5) * (olhaMais ? -1 : 1) * 0.6; p.expr = 'sorriso'; }
  // o convidado 7 (mesa -4,4) ergue a taça para a garçonete, quando ela passa no P07
  if (i === 7 && ta > 19.8 && ta < 21.4) { const k = rampa(ta, 19.85, 20.2, 20.9, 21.3); p.maoD = 'taca'; p.ombroD = lerp1(p.ombroD, 2.25, k); p.cotoveloD = lerp1(p.cotoveloD, 0.45, k); p.abracoD = lerp1(p.abracoD || 0, 0.25, k); p.cabYaw = lerp1(p.cabYaw, -0.45, k); p.expr = 'sorriso'; } // a taça bem alta: aparece por cima do chapéu, de costas para a câmera
  // o convidado 1 estala os dedos para a garçonete
  if (i === 1 && ta > 28.2 && ta < 29.6) { p.ombroE = 1.9; p.cotoveloE = 0.5; p.abracoE = 0.3; p.cabYaw = 0.9; p.expr = 'neutro'; }
  // a vitrine vazia: espanto e desespero
  if (ta > 52.5 && ta < 62.5) {
    const k = rampa(ta, 52.55, 53.15, 59.0, 62.0), olhaVitrine = olhaMais ? 0.0 : (lado > 0 ? -1.1 : 1.1);
    p.cabYaw = lerp1(p.cabYaw, olhaVitrine, k); p.cabPitch = lerp1(p.cabPitch, 0.05, k);
    p.expr = ta < 58.5 ? (mulher ? 'medo' : 'surpresa') : 'preocupado';
    if (mulher) { // mãos no rosto, corpo para trás
      p.ombroE = lerp1(p.ombroE, 1.75, k); p.ombroD = lerp1(p.ombroD, 1.75, k); p.cotoveloE = lerp1(p.cotoveloE, 2.6, k); p.cotoveloD = lerp1(p.cotoveloD, 2.6, k);
      p.abracoE = p.abracoD = lerp1(0.08, 0.05, k); p.giroBE = 0.45 * k; p.giroBD = -0.45 * k; p.inclina = -0.2 * k; p.cabPitch -= 0.12 * k; p.maoD = k > 0.3 ? null : p.maoD;
    } else if (i === 1 || i === 3) { // vira o tronco e aponta para a vitrine por cima do ombro
      p.torce = (lado > 0 ? 0.5 : -0.5) * k; p.ombroD = lerp1(p.ombroD, 2.55, k); p.abracoD = lerp1(0.08, 0.5, k); p.cotoveloD = lerp1(p.cotoveloD, 0.2, k); p.maoD = k > 0.3 ? null : p.maoD;
      p.ombroE = lerp1(p.ombroE, 0.9, k); p.cotoveloE = lerp1(p.cotoveloE, 1.6, k);
    } else { // recua com as mãos erguidas
      p.ombroE = lerp1(p.ombroE, 1.3, k); p.ombroD = lerp1(p.ombroD, 1.3, k); p.cotoveloE = lerp1(p.cotoveloE, 1.7, k); p.cotoveloD = lerp1(p.cotoveloD, 1.7, k); p.inclina = -0.3 * k;
    }
  }
  // a senhora da mesa ao lado do balcão (convidada 6): quando a garçonete lhe serve o café, baixa as mãos e olha para ela;
  // depois, ainda assustada, acompanha o xerife
  if (i === 6 && ta > 56.9 && ta < 62.5) {
    const f = 1 - suave(fase0(ta, 61.8, 62.4)), m = suave(fase0(ta, 56.2, 56.7)) * f, vJ = suave(fase0(ta, 56.3, 56.7)) * (1 - suave(fase0(ta, 58.7, 59.1))), vX = suave(fase0(ta, 58.9, 59.4)) * f;
    p.ombroE = lerp1(p.ombroE, 0.5, m); p.ombroD = lerp1(p.ombroD, 0.55, m); p.cotoveloE = lerp1(p.cotoveloE, 1.3, m); p.cotoveloD = lerp1(p.cotoveloD, 1.35, m);
    p.giroBE = lerp1(p.giroBE || 0, 0, m); p.giroBD = lerp1(p.giroBD || 0, 0, m); p.abracoE = p.abracoD = lerp1(p.abracoE || 0, 0.12, m); p.inclina = lerp1(p.inclina || 0, 0.05, m); p.maoD = null;
    const olhaJ = olharPara(p, [CX_D - 4.2, PISO + 1.55, 0.1], 1.3), olhaX = olharPara(p, [CX_D + 5.3, PISO + 1.6, 0.4], 1.3);
    p.cabYaw = lerp1(lerp1(p.cabYaw, olhaJ, vJ), olhaX, vX * (1 - vJ)); p.cabPitch = lerp1(lerp1(p.cabPitch, -0.28, vJ), -0.05, vX);
    p.expr = ta < 57.7 ? 'medo' : 'preocupado';
  }
  // a busca: todos acompanham o xerife, preocupados; o convidado 7 aponta a porta do fundo
  if (ta > 61.6 && ta < 72) {
    const k2 = rampa(ta, 61.6, 62.3, 70.5, 72);
    p.cabYaw = lerp1(p.cabYaw, 0.7 * (olhaMais ? 1 : -1) * (lado > 0 ? 1 : -1), k2 * 0.8); p.expr = 'preocupado';
    if (i === 7) { const a = rampa(ta, 64.15, 64.45, 65.5, 65.9); p.ombroD = lerp1(p.ombroD, 1.55, a); p.cotoveloD = lerp1(p.cotoveloD, 0.08, a); p.abracoD = lerp1(p.abracoD, -0.05, a); p.maoD = a > 0.2 ? null : p.maoD; p.torce = -0.25 * a; p.cabYaw = lerp1(p.cabYaw, -0.1, a); p.inclina = 0.15 * a; if (a > 0.3) p.expr = 'surpresa'; }
  }
  // a senhora da pluma deixa cair a taça e leva as mãos ao rosto
  if (i === 0 && ta > 52.5 && ta < 62.5) {
    if (ta < 53.05) { p.ombroD = 1.3; p.cotoveloD = 1.4; p.maoD = 'taca'; p.ombroE = 0.6; p.cotoveloE = 1.1; }
    else { const k = suave(fase0(ta, 53.05, 53.6)); p.maoD = null; p.ombroE = lerp1(0.6, 1.8, k); p.ombroD = lerp1(1.3, 1.8, k); p.cotoveloE = p.cotoveloD = lerp1(1.2, 2.65, k); p.abracoE = p.abracoD = 0.05; p.giroBE = 0.45 * k; p.giroBD = -0.45 * k; p.inclina = -0.3 * k; p.cabPitch = -0.1 * k; p.expr = 'medo'; }
  }
  return p;
}
function fase0(t, a, b) { return clamp01((t - a) / (b - a)); }

// ---------------------------------------------------------------- suavidade
// Hermite com paradas: a velocidade é contínua e o personagem para de verdade
// onde a posição se repete entre dois quadros-chave.
function trilhaH(keys, t) {
  const n = keys.length;
  if (t <= keys[0][0]) return keys[0].slice(1);
  if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
  let i = 0; while (i < n - 2 && t > keys[i + 1][0]) i++;
  const a = keys[i], b = keys[i + 1], h = b[0] - a[0], u = (t - a[0]) / h, dim = a.length - 1;
  const igual = (x, y) => { for (let j = 1; j <= dim; j++) if (Math.abs(x[j] - y[j]) > 1e-6) return false; return true; };
  const tang = k => {
    const m = new Array(dim).fill(0);
    if (k <= 0 || k >= n - 1) return m;
    const q = keys[k - 1], p = keys[k], r = keys[k + 1];
    if (igual(p, q) || igual(p, r)) return m;
    for (let j = 0; j < dim; j++) {
      const d0 = (p[j + 1] - q[j + 1]) / (p[0] - q[0]), d1 = (r[j + 1] - p[j + 1]) / (r[0] - p[0]);
      m[j] = d0 * d1 <= 0 ? 0 : (d0 + d1) / 2; // sem ultrapassar em inversões
    }
    return m;
  };
  const m0 = tang(i), m1 = tang(i + 1), u2 = u * u, u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
  return a.slice(1).map((v, j) => h00 * v + h10 * h * m0[j] + h01 * b[j + 1] + h11 * h * m1[j]);
}
// distância acumulada no plano (para a fase dos passos), com tabela em cache
const CACHE_DIST = new WeakMap();
function distCaminho(keys, t, ix = 0, iz = 1) {
  let tab = CACHE_DIST.get(keys);
  if (!tab) {
    tab = { t0: keys[0][0], dt: 0.04, d: [0] };
    let prev = trilhaH(keys, tab.t0); const t1 = keys[keys.length - 1][0];
    for (let x = tab.t0 + tab.dt; x <= t1 + 1e-6; x += tab.dt) { const c = trilhaH(keys, x); tab.d.push(tab.d[tab.d.length - 1] + Math.hypot(c[ix] - prev[ix], c[iz] - prev[iz])); prev = c; }
    CACHE_DIST.set(keys, tab);
  }
  const f = (t - tab.t0) / tab.dt; if (f <= 0) return 0;
  const i = Math.floor(f); if (i >= tab.d.length - 1) return tab.d[tab.d.length - 1];
  return tab.d[i] + (tab.d[i + 1] - tab.d[i]) * (f - i);
}
// fase dos passos integrada no tempo, com passada que cresce com a velocidade
const CACHE_FASE = new Map();
function faseCaminho(keys, t, base = 0.95, ix = 0, iz = 1) {
  let tab = CACHE_FASE.get(keys);
  if (!tab) {
    tab = { t0: keys[0][0], dt: 0.02, f: [0] };
    let prev = trilhaH(keys, tab.t0); const t1 = keys[keys.length - 1][0];
    for (let x = tab.t0 + tab.dt; x <= t1 + 1e-6; x += tab.dt) {
      const c = trilhaH(keys, x), d = Math.hypot(c[ix] - prev[ix], c[iz] - prev[iz]), v = d / tab.dt;
      const passada = Math.min(2.1, base + 0.3 * v);
      tab.f.push(tab.f[tab.f.length - 1] + d / passada); prev = c;
    }
    CACHE_FASE.set(keys, tab);
  }
  const f = (t - tab.t0) / tab.dt; if (f <= 0) return 0;
  const i = Math.floor(f); if (i >= tab.f.length - 1) return tab.f[tab.f.length - 1];
  return tab.f[i] + (tab.f[i + 1] - tab.f[i]) * (f - i);
}
function velCaminho(keys, t, ix = 0, iz = 1) { const a = trilhaH(keys, t - 0.03), b = trilhaH(keys, t + 0.03); return [(b[ix] - a[ix]) / 0.06, (b[iz] - a[iz]) / 0.06]; }
function lerpAng(a, b, t) { let d = ((b - a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; return a + d * t; }
// filtro no tempo para os gestos: elimina saltos de pose entre trechos
const GESTO_CABECA = ['cabYaw', 'cabPitch', 'pitch', 'rolo', 'sentado'];
const GESTO_CORPO = ['inclina', 'torce', 'ombroE', 'ombroD', 'abracoE', 'abracoD', 'cotoveloE', 'cotoveloD', 'giroBE', 'giroBD', 'quadE', 'quadD', 'joelhoE', 'joelhoD', 'abreE', 'abreD', 'peE', 'peD'];
function suavizaPose(fn, ta) {
  const base = fn(ta); if (!base || !base.p) return base;
  const amostras = [[-0.26, 1], [-0.13, 2], [0.13, 2], [0.26, 1]];
  const campos = GESTO_CABECA.concat(GESTO_CORPO), acc = {};
  for (const c of campos) acc[c] = base.p[c] * 3;
  let ws = 3;
  for (const [dt, w] of amostras) {
    const e = fn(ta + dt), q = (e && e.p && e.P === base.P && e.onde === base.onde) ? e.p : base.p;
    for (const c of campos) acc[c] += q[c] * w; ws += w;
  }
  // giro: média de direções numa janela de ±0,45 s
  let sx = 0, sz = 0;
  for (const [dt, w] of [[-0.45, 1], [-0.3, 2], [-0.15, 3], [0, 4], [0.15, 3], [0.3, 2], [0.45, 1]]) {
    const e = dt === 0 ? base : fn(ta + dt), q = (e && e.p && e.P === base.P && e.onde === base.onde) ? e.p : base.p;
    sx += Math.sin(q.yaw) * w; sz += Math.cos(q.yaw) * w;
  }
  if (sx * sx + sz * sz > 1e-6) base.p.yaw = Math.atan2(sx, sz);
  const kCorpo = 1 - suave(((base.p.__vel || 0) - 0.35) / 1.0);
  const cru = base.p.cru || 0; // cru: quanto a pose vale sem a média no tempo (contato preciso com o cenário)
  for (const c of GESTO_CABECA) base.p[c] = lerp1(acc[c] / ws, base.p[c], cru);
  for (const c of GESTO_CORPO) base.p[c] = lerp1(base.p[c], acc[c] / ws, kCorpo * (1 - cru));
  return base;
}

// ---------------------------------------------------------------- Jack
// o lugar dela, junto da mesa -1,8, de frente para a janela do lado da plataforma, enquanto o trem para e parte (P11). As
// janelas de fora do vagão (17 m, 9 vãos) e as de dentro (15 m, 9 vãos) só coincidem perto do meio; esta é a que se abre de
// fora até dentro (de -2,06 a -1,50). Antes ela ficava em -6,2, onde de fora só se via parede
const JANELA_P11 = [-1.78, 0.25];
// trajeto no vagão-restaurante [t, x local, z]. As mesas ficam dos dois lados do corredor (toalhas de |z| = 0,48 a 1,36):
// na volta entre as mesas (P09c) ela sai da mesa para o meio do corredor, segue por ele e só vira para o fundo depois da
// última cadeira (antes ia em linha reta e atravessava três mesas e algumas cadeiras), no passo de uma garçonete (até uns
// 2 m/s; chega ao lugar da janela em 36,2 s, durante o P10, fora de quadro)
const J_D = [
  [0, -5.9, -0.35], [19.0, -5.9, -0.35], [19.6, -5.5, -0.08], [23.4, -1.0, 0.18], [24.3, -0.5, 0.2], [26.9, -0.42, 0.21], [27.6, 0.55, 0.24], // para no corredor durante o brinde (P08)
  [29.4, 3.2, 0.25], [30.6, 3.2, 0.25],
  [31.0, 3.04, 0.22], [31.5, 2.28, 0.0], [32.0, 1.41, 0.0], [32.5, 0.54, 0.0], [33.0, -0.34, 0.0], [33.5, -1.2, 0.07], [33.9, -1.67, 0.24],
  [34.3, -1.78, 0.25], [43.0, -1.78, 0.25], [43.6, -1.2, 0.0], [46.0, 2.6, 0.15], [47.2, 5.55, 0.42], [48.9, 5.55, 0.42],
  // depois do roubo ela não sai do fundo: serve a mesa ao lado do balcão, de frente para o vagão (o xerife lá na frente, de
  // costas, na vitrine) e, enquanto ele encara a vitrine, deixa a bandeja no balcão e sai pela porta
  [52.2, -5.6, -0.08], [55.0, -5.45, 0.0], [56.1, -4.2, 0.1], [58.55, -4.2, 0.1], [59.0, -5.0, -0.12], [59.3, -5.75, -0.15], [59.6, -6.6, -0.02], [59.95, -7.3, 0.0], [60.3, -7.85, 0.03],
];
const TETO_P = ALT.teto + 0.1, TETO_S = ALT.parede + 0.18;
// trajeto nos tetos [t, x do trem, y, z]
const J_TETO = [
  [77.5, -40.1, 1.25, 1.15], [79.4, -40.1, TETO_P, 1.15], [79.9, -41.0, TETO_P, 0.3], [81.8, -48.0, TETO_P, 0.0], [83.0, -51.6, TETO_P, 0.0], [84.8, -55.7, TETO_P, 0.0],
  [85.3, -58.3, TETO_P + 0.25, 0.0], [86.2, -61.0, TETO_P, 0.0], [87.0, -63.8, TETO_P, 0.0], [88.25, -63.95, TETO_P, 0.0], [90.7, -64.15, TETO_P, 0.0], [92.8, -73.4, TETO_P, 0.0], [95.1, -73.55, TETO_P, 0.0], // salta do fim da passarela (antes, da cobertura curva, com os pés 26 cm no ar)
  // o vão largo: agarra a borda do vagão dos cavalos, faz a barra, apoia os braços, põe o joelho e levanta
  // pendurada a 15 cm da beirada do teto (-76,95; a parede da ponta fica em -77,06): o corpo só passa para cima do vagão
  // depois que o quadril chega à altura do teto
  [95.45, -75.6, TETO_P + 0.3, 0.0], [95.75, -76.72, TETO_S - 1.76, 0.0], [96.15, -76.72, TETO_S - 1.82, 0.0], // pendurada: os braços esticados alcançam a quina [96.6, -76.72, TETO_S - 1.35, 0.0],
  [96.95, -76.74, TETO_S - 0.88, 0.0], [97.1, -76.76, TETO_S - 0.5, 0.0], [97.3, -77.15, TETO_S - 0.25, 0.0], [97.5, -77.45, TETO_S - 0.06, 0.0], [97.75, -77.75, TETO_S, 0.0], [98.6, -79.6, TETO_S, 0.0],
  // a emboscada: desce de costas pela beirada, avança mão a mão, abre a porta de correr com o pé e entra balançando
  [99.15, -79.6, TETO_S, 0.0], [99.8, -80.1, TETO_S, -1.12], [100.2, -80.3, TETO_S - 0.55, -1.6], [100.6, -80.4, TETO_S - 2.05, -1.74], [102.7, -83.0, TETO_S - 2.05, -1.74],
  [103.15, -83.1, TETO_S - 2.05, -1.78], [103.45, -83.35, TETO_S - 2.15, -1.3], [103.75, -83.45, ALT.piso + PALHA_S, -0.95], [104.6, -83.4, ALT.piso + PALHA_S, -1.0],
];
// as duas mãos na aba do chapéu, na descida até a cabeça (h de 0,55 a 1): o chapéu sai de onde a subida o deixou (a mão direita
// no alto, ombro 2,7 e cotovelo 1,15, com a cabeça inclinada 0,12) e assenta; os ângulos de cada braço saem de ikMao (guardados
// por tempo: estadoJack é chamado várias vezes por quadro)
const CACHE_MAOS_CHAPEU = new Map();
function maosNoChapeu(p, h, en) {
  const chave = h.toFixed(5) + '|' + en.toFixed(4) + '|' + (p.cabYaw || 0).toFixed(4); let r = CACHE_MAOS_CHAPEU.get(chave); if (r) return r;
  const P = G.jackFL, B = suave(fase0(h, 0.55, 1));
  const c0 = poseChapeuMao(P, Object.assign({}, p, { ombroD: 2.7, cotoveloD: 1.15, chapeuMao: 0.55, cabPitch: 0.12 * en })), c = angChapeu(h);
  const cab = { cabYaw: p.cabYaw, cabPitch: 0.12 * en * (1 - B) }, pos = lerp3(c0.pos, [0, 0, 0], B);
  const alvo = s => { const g = giroChapeu(c, pegaChapeu(P, s)); return cabecaParaTronco(P, cab, [pos[0] + g[0], pos[1] + g[1], pos[2] + g[2]]); };
  const rD = ikMao(P.D, 1, alvo(1), [lerp1(2.7, 2.4, B), p.abracoD, lerp1(1.15, 2.05, B)], p.giroBD || 0, p.abracoD);
  const rE = ikMao(P.D, -1, alvo(-1), [2.4, p.abracoE, 2.05], p.giroBE || 0, p.abracoE);
  r = { oD: rD.om, cD: rD.co, aD: rD.ab, oE: rE.om, cE: rE.co, aE: rE.ab, erroD: rD.erro, erroE: rE.erro };
  if (CACHE_MAOS_CHAPEU.size > 200) CACHE_MAOS_CHAPEU.clear(); CACHE_MAOS_CHAPEU.set(chave, r); return r;
}
// escalada da borda do vão largo (95,75 a 97,7)
function escalaBorda(q, ta) {
  // pendurada na beirada, de frente para a parede da ponta: faz a barra, apoia as mãos e estica os braços até o quadril chegar
  // à altura do teto, com as pernas penduradas fora do vagão; só então põe o joelho direito no teto e passa o peso para ele,
  // a perna esquerda dobrada atrás, acima da beirada; e se levanta
  const pu = suave(fase0(ta, 96.15, 96.6)), ap = suave(fase0(ta, 96.6, 96.95)), jo = suave(fase0(ta, 96.95, 97.3)), lev = suave(fase0(ta, 97.4, 97.75));
  const bal = Math.sin((ta - 95.75) * 6.5) * Math.exp(-(ta - 95.75) * 2.2), qH = 0.04 + (bal > 0 ? 0.1 : 0.3) * bal; // o balanço do agarrão: quase só para trás (na frente fica a parede)
  q.ombroE = q.ombroD = lerp1(lerp1(lerp1(3.0, 2.45, pu), 0.35, ap), 0.6, lev); q.cotoveloE = q.cotoveloD = lerp1(lerp1(lerp1(0.2, 2.1, pu), 0.25, ap), 0.4, lev);
  q.quadE = lerp1(lerp1(lerp1(qH, 0.22, pu), 0.0, ap), -0.12, jo) * (1 - lev); q.joelhoE = lerp1(lerp1(lerp1(0.35, 0.95, pu), 0.4, ap), 1.45, jo) * (1 - lev); // a esquerda dobrada atrás, a canela deitada, acima da beirada
  q.quadD = lerp1(lerp1(lerp1(qH * 0.85, 0.22, pu), 0.05, ap), 1.75, jo) * (1 - lev); q.joelhoD = lerp1(lerp1(lerp1(0.45, 0.95, pu), 0.4, ap), 2.75, suave(fase0(ta, 96.95, 97.18))) * (1 - lev); // a canela dobra cedo: o pé vem junto, sobre a beirada
  q.inclina = lerp1(lerp1(lerp1(0.05, 0.22, pu), 0.75, ap * ap), 0.45, jo) * (1 - lev); q.abreD = 0.3 * jo * (1 - lev); // inclina-se sobre o teto só no fim do empurrão; o joelho sobe um pouco para o lado q.cabPitch = lerp1(-0.35, 0.1, ap);
  q.saia = 0.15 + 0.3 * ap * (1 - lev); q.expr = lev > 0.5 ? 'determinado' : 'esforco'; q.yaw = YAW_MENOSX;
  // as mãos presas à beirada (cinemática inversa): agarradas na quina na barra; espalmadas no teto no empurrão e enquanto o
  // joelho sobe; soltam quando ela se levanta (antes ficavam ora dentro da parede, ora no ar, na frente da beirada)
  const g = rampa(ta, 95.72, 95.8, 97.42, 97.6);
  if (g > 0) { const ch = ta.toFixed(4); let r = _ikBorda.get(ch);
    if (!r) { if (_ikBorda.size > 300) _ikBorda.clear(); r = [];
      for (const sd of [-1, 1]) { const w = [lerp1(-77.0, -77.14, ap), lerp1(3.86, 3.95, ap), sd * lerp1(0.24, 0.27, ap)];
        const k = ikMao(G.jackFL.D, sd, paraTronco(G.jackFL, q, w), [sd < 0 ? q.ombroE : q.ombroD, 0.15, sd < 0 ? q.cotoveloE : q.cotoveloD], 0, 0.1); r.push(k); }
      _ikBorda.set(ch, r); }
    q.ombroE = lerp1(q.ombroE, r[0].om, g); q.abracoE = lerp1(q.abracoE || 0, r[0].ab, g); q.cotoveloE = lerp1(q.cotoveloE, r[0].co, g);
    q.ombroD = lerp1(q.ombroD, r[1].om, g); q.abracoD = lerp1(q.abracoD || 0, r[1].ab, g); q.cotoveloD = lerp1(q.cotoveloD, r[1].co, g); }
  return q;
}
const _ikBorda = new Map();
// fuga pela lateral do vagão dos cavalos (99,3 a 104,6)
// a emboscada: de frente para os três, ela se rende devagar com as mãos para o alto (por isso eles não atiram),
// aparece uma carta entre os dedos da direita e ela a joga com um peteleco ao vento do trem
function truqueCarta(q, ta) {
  const rende = suave(fase0(ta, 98.6, 98.88)), joga = suave(fase0(ta, LEQUE.solta - 0.1, LEQUE.solta + 0.04));
  q.yaw = YAW_MENOSX;
  q.ombroE = lerp1(0.2, 2.45, rende); q.cotoveloE = lerp1(0.3, 1.45, rende); q.abracoE = 0.38 * rende;
  q.ombroD = lerp1(lerp1(0.2, 2.45, rende), 1.35, joga); q.cotoveloD = lerp1(lerp1(0.3, 1.45, rende), 0.12, joga); q.abracoD = lerp1(0.38 * rende, 0.08, joga);
  q.maoD = ta > 98.82 && ta < LEQUE.solta ? { nome: 'leque', n: LEQUE.n, abre: suave(fase0(ta, LEQUE.abre0, LEQUE.abre1)) } : null; // o leque abre na mão erguida
  q.cabPitch = -0.05; q.expr = ta < 98.85 ? 'neutro' : 'maroto';
  return q;
}
// ================================================================ O LEQUE DE CARTAS (a emboscada, 97,49 a 101,56)
// Rendida, de mãos para o alto, ela abre na mão direita um leque de valetes de ouros (a assinatura dela) e o atira na
// cara dos três ajudantes; o vento do trem leva as cartas até eles. Elas explodem nos rostos: nove grudam (no chapéu, no
// colete e na cara de cada um, presas à cabeça e ao tronco, e acompanham quem se mexe), seis rodopiam e pousam no teto
// do vagão dos cavalos, e nove rodopiam em volta deles e vão ficando para trás com o vento, sem sumir. Tudo é função do
// tempo; as coordenadas são as do trem (as mesmas de estadoJack e estadoAjudantes).
const LEQUE = { n: 24, abre0: 98.88, abre1: 99.12, solta: 99.22, tam: [0.075, 0.105] };
const AJUD_TETO = [[-86.2, -0.78, 0.18], [-87.5, 0.62, -0.14], [-88.9, -0.12, 0.06]]; // [x, z, giro] dos três no teto
const POUSO_CARTAS = [[-85.3, -1.25], [-86.8, 1.25], [-89.8, -0.7], [-85.1, -0.1], [-88.4, 1.2], [-89.6, 0.6]]; // perto de quem as espantou, sem cair sob os pés
const _memoLeque = new Map();
function memoLeque(chave, f) { if (!_memoLeque.has(chave)) _memoLeque.set(chave, f()); return _memoLeque.get(chave); }
let _ajudQuadro = { t: NaN, R: null }; // o mesmo instante pedido várias vezes no quadro: calcula os ajudantes uma vez só
function ajudNoTeto(ta, k) { if (_ajudQuadro.t !== ta) _ajudQuadro = { t: ta, R: estadoAjudantes(ta) }; return _ajudQuadro.R.find(a => a.P === G.ajudantes[k + 1] && a.onde === 'trem'); }
function cabecaAjud(ta, k) { return memoLeque('cab' + k + '@' + ta.toFixed(3), () => { const a = ajudNoTeto(ta, k); return doCabeca(a.P, a.p, [0, 0.1 * a.P.D.s, 0]); }); }
function tImpacto(k) { return LEQUE.solta + 0.27 + 0.045 * k; } // as cartas chegam primeiro ao da frente
// onde a carta grudada fica, no corpo do ajudante k: centro e eixos (já com o tamanho da carta), no referencial do trem
const COLA = [ // [lugar, k, parâmetros]
  ['chapeu', 0, 0.45, 1.25], ['cara', 0, 0.75, 0.25], ['colete', 0, -0.07, 0.4],
  ['chapeu', 1, -0.6, -1.35], ['cara', 1, -0.8, -0.3], ['colete', 1, 0.06, -0.35],
  ['chapeu', 2, 0.1, 1.45], ['cara', 2, 0.55, -0.15], ['colete', 2, -0.05, 0.2]]; // no chapéu, quase deitadas: a quina não chega à aba
function ancoraCarta(c, a) {
  const [lugar, k, u, giro] = c, P = a.P, p = a.p, D = P.D, sh = P.f.altura / 1.75 * 1.12, [w, h] = LEQUE.tam;
  let o, nx, nz, local; // centro e normal no referencial local (cabeça ou tronco)
  if (lugar === 'chapeu') { const r = 0.104; o = [Math.sin(u) * r * sh, 0.1 * D.s + (0.074 + 0.085) * sh, (Math.cos(u) * r - 0.005) * sh]; nx = Math.sin(u); nz = Math.cos(u); local = 'cab'; }
  else if (lugar === 'cara') { const r = 0.097 + 0.013; o = [Math.sin(u) * r * 0.92 * sh, 0.1 * D.s + 0.005 * sh, Math.cos(u) * r * sh]; const l = Math.hypot(Math.sin(u) / 0.92, Math.cos(u)); nx = Math.sin(u) / 0.92 / l; nz = Math.cos(u) / l; local = 'cab'; }
  else { const y = 0.24, zf = (0.2 + 0.04 * y / 0.42) / 2 + 0.012 + 0.012; o = [u * D.s, y * D.s, zf * D.s]; nx = 0; nz = 1; local = 'tronco'; }
  const tg = [nz, 0, -nx], up = [0, 1, 0], cg = Math.cos(giro), sg = Math.sin(giro); // eixos da carta no plano tangente, girados
  const ex = [tg[0] * cg + up[0] * sg, tg[1] * cg + up[1] * sg, tg[2] * cg + up[2] * sg], ey = [-tg[0] * sg + up[0] * cg, -tg[1] * sg + up[1] * cg, -tg[2] * sg + up[2] * cg];
  const T = v => local === 'cab' ? doCabeca(P, p, v) : doTronco(P, p, v), O = T(o);
  const E = (v, l) => { const q = T([o[0] + v[0] * l, o[1] + v[1] * l, o[2] + v[2] * l]); return [q[0] - O[0], q[1] - O[1], q[2] - O[2]]; };
  return { o: O, ex: E(ex, w), ey: E(ey, h), ez: E([nx, 0, nz], 1) };
}
// trajetória de cada carta: { o, giro } (voando, girando) ou { o, ex, ey, ez } (grudada ou pousada)
function cartaLeque(i, ta) {
  const S = LEQUE.solta; if (ta < S) return null;
  const hs = (a) => hash2(i * 7.13 + a, 3.7), k = i < 9 ? COLA[i][1] : i % 3, tI = tImpacto(k) + 0.03 * hs(1);
  const R0 = memoLeque('mao', () => { const e = estadoJack(S), p = e.p, D = e.P.D; return doTronco(e.P, p, maoFK(D, 1, p.ombroD, p.abracoD, p.cotoveloD, p.giroBD)); });
  const ini = [R0[0] - 0.05 * hs(2), R0[1] + 0.08 * (hs(3) - 0.5), R0[2] + 0.12 * (hs(4) - 0.5)];
  const bez = (a, c, b, u) => [0, 1, 2].map(j => (1 - u) * (1 - u) * a[j] + 2 * u * (1 - u) * c[j] + u * u * b[j]);
  const giroVoo = (ta - S) * (14 + 6 * hs(5)) + i;
  let fim;
  if (i < 9) { // gruda
    const a = memoLeque('ajud' + k + '@' + tI.toFixed(3), () => ajudNoTeto(tI, k));
    if (ta >= tI) { const aa = ajudNoTeto(ta, k); return aa ? ancoraCarta(COLA[i], aa) : null; }
    fim = ancoraCarta(COLA[i], a).o;
  } else { const hc = cabecaAjud(tI, k); fim = [hc[0] + 0.34, hc[1] + 0.12 * (hs(7) - 0.5), hc[2] + 0.36 * (hs(8) - 0.5)]; } // o impacto, à frente do rosto
  if (ta < tI) { const u = (ta - S) / (tI - S), meio = [(ini[0] + fim[0]) / 2, Math.max(ini[1], fim[1]) + 0.45 + 0.25 * hs(9), (ini[2] + fim[2]) / 2 + 0.5 * (hs(10) - 0.5)];
    return { o: bez(ini, meio, fim, u), giro: giroVoo }; }
  // depois do impacto: rodopia em volta da cabeça
  // a carta rodopia em volta da cabeça, sempre fora do chapéu (raio de 0,36 m para cima), e sai pelo lado certo: as
  // que pousam, na direção do lugar onde caem; as que o vento leva, por trás da cabeça (sem voltar através de ninguém)
  const hc = cabecaAjud(tI, k), r = 0.4 + 0.22 * hs(11), w = (9 + 4 * hs(12)) * (hs(13) > 0.5 ? 1 : -1), r0 = Math.max(0.36, Math.hypot(fim[0] - hc[0], fim[2] - hc[2])), a0 = Math.atan2(fim[2] - hc[2], fim[0] - hc[0]);
  const alvoA = i < 15 ? Math.atan2(POUSO_CARTAS[i - 9][1] - hc[2], POUSO_CARTAS[i - 9][0] - hc[0]) : Math.PI + 0.4 * (hs(14) - 0.5), base = 0.22 + 0.15 * hs(17);
  const resto = x => ((x % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI), aB = a0 + w * base;
  const dur = base + (w > 0 ? resto(alvoA - aB) / w : resto(aB - alvoA) / -w), tS = tI + dur;
  const roda = t => { const u = t - tI, a = a0 + w * u, rr = lerp1(r0, r, Math.min(1, u * 5)); return [hc[0] + Math.cos(a) * rr, hc[1] + 0.12 * Math.sin(u * 7 + i) + 0.22 * u, hc[2] + Math.sin(a) * rr]; };
  if (ta < tS) return { o: roda(ta), giro: giroVoo };
  const P1 = roda(tS);
  if (i < 15) { // pousa no teto do vagão dos cavalos e fica
    const [lx, lz] = POUSO_CARTAS[i - 9], ly = ALT.parede + (Math.abs(lz) <= 0.28 ? 0.18 : 0.12) + 0.003, tP = tS + 0.45 + 0.2 * hs(15);
    if (ta < tP) { const u = suave((ta - tS) / (tP - tS)), dir = [P1[0] - hc[0], P1[2] - hc[2]], l = Math.hypot(...dir) || 1, ctrl = [P1[0] + dir[0] / l * 0.35, P1[1] + 0.15, P1[2] + dir[1] / l * 0.35];
      return { o: bez(P1, ctrl, [lx, ly, lz], u), giro: giroVoo * (1 - u) + (i * 1.7) * u }; }
    const g = i * 1.37, [w2, h2] = LEQUE.tam;
    return { o: [lx, ly, lz], ex: [Math.cos(g) * w2, 0, -Math.sin(g) * w2], ey: [Math.sin(g) * h2, 0, Math.cos(g) * h2], ez: [0, 1, 0] };
  }
  // vai ficando para trás com o vento do trem (continua visível enquanto estiver no quadro)
  const u = ta - tS;
  return { o: [P1[0] - 2.5 * u - 4.5 * u * u, Math.max(0.4, P1[1] + 0.9 * u - 0.35 * u * u + 0.12 * Math.sin(u * 9 + i)), P1[2] + (hs(16) - 0.5) * 2.4 * u + 0.15 * Math.sin(u * 5 + i)], giro: giroVoo };
}
function desenhaLeque(ta) {
  if (ta < LEQUE.solta || ta > 130) return;
  const W = v => [v[0] + xLoco(ta), v[1] + Y_TRILHO, v[2]], [w, h] = LEQUE.tam, base = { tex: TX.carta, semLuz: 0.4 };
  for (let i = 0; i < LEQUE.n; i++) {
    if (i < 9 && ta > 106) continue; // as grudadas ficam até eles saírem do teto
    const c = cartaLeque(i, ta); if (!c) continue;
    if (c.o[0] < CX_S - 260) continue; // muito para trás do trem
    const o = W(c.o);
    if (c.ex) { push(); applyMatrix(c.ex[0], c.ex[1], c.ex[2], 0, c.ey[0], c.ey[1], c.ey[2], 0, c.ez[0], c.ez[1], c.ez[2], 0, o[0], o[1], o[2], 1); md(G.quadro, base); pop(); continue; }
    push(); translate(o[0], o[1], o[2]); rotateY(c.giro * 0.55); rotateX(c.giro); rotateZ(c.giro * 0.3); scale(w, h, 1); md(G.quadro, base); pop();
    const brilho = Math.pow(Math.abs(Math.sin(c.giro)), 10); // reflexo quando a face vira para a luz
    if (brilho > 0.1) { push(); translate(o[0], o[1], o[2]); scale(0.022 * (0.5 + brilho)); md(G.bolha, { tinta: [1.5, 1.4, 1.2], semLuz: 1, alfa: 0.45 * brilho }); pop(); }
  }
  mat({});
}
function fugaLateral(q, ta) {
  const vira = suave(fase0(ta, 99.5, 99.85)), agacha = rampa(ta, 99.65, 99.85, 100.1, 100.35), desce = suave(fase0(ta, 99.95, 100.6));
  q.yaw = lerpAng(YAW_MENOSX, 0, vira); // de costas para a beirada, de frente para o vagão
  if (ta < 100.6) {
    q.quadE = q.quadD = 1.3 * agacha + 0.2 * desce; q.joelhoE = q.joelhoD = 2.0 * agacha + 0.3 * desce; q.inclina = 0.6 * agacha;
    q.ombroE = q.ombroD = lerp1(0.9 * agacha, 3.0, desce); q.cotoveloE = q.cotoveloD = lerp1(0.5, 0.25, desce); q.expr = 'determinado';
    return q;
  }
  q.expr = 'esforco';
  if (ta < 102.7) { // mão a mão
    const f = (ta - 100.6) * Math.PI * 2 * 0.95, sE = Math.max(0, Math.sin(f)), sD = Math.max(0, -Math.sin(f));
    q.ombroE = 3.0 - 0.3 * sE; q.ombroD = 3.0 - 0.3 * sD; q.abracoE = 0.05 + 0.22 * sE; q.abracoD = 0.05 + 0.22 * sD; q.cotoveloE = 0.2 + 0.35 * sE; q.cotoveloD = 0.2 + 0.35 * sD;
    q.quadE = 0.12 + Math.sin(f + 0.8) * 0.16; q.quadD = 0.12 - Math.sin(f + 0.8) * 0.16; q.joelhoE = q.joelhoD = 0.55; q.rolo = Math.sin(f) * 0.06; q.saia = 0.1; // sem saia: os joelhos dobram mais, para as botas não tocarem a parede
    return q;
  }
  const chute = rampa(ta, 102.7, 102.85, 103.0, 103.15), entra = suave(fase0(ta, 103.15, 103.5)), pousa = suave(fase0(ta, 103.5, 103.8)), ergue = suave(fase0(ta, 104.0, 104.55));
  q.ombroE = q.ombroD = lerp1(lerp1(3.0, 2.6, entra), lerp1(0.9, 0.35, ergue), pousa); q.cotoveloE = q.cotoveloD = lerp1(0.25, lerp1(0.6, 0.3, ergue), pousa);
  q.quadE = lerp1(0.3 + 0.55 * chute + 1.2 * entra, lerp1(1.3, 0, ergue), pousa); q.quadD = lerp1(0.2 + 1.1 * entra, lerp1(1.2, 0, ergue), pousa);
  q.joelhoE = lerp1(0.3 - 0.2 * chute + 0.3 * entra, lerp1(2.0, 0, ergue), pousa); q.joelhoD = lerp1(0.4 + 0.3 * entra, lerp1(1.9, 0, ergue), pousa);
  q.abreE = 0.35 * chute; q.inclina = lerp1(-0.2 * entra, lerp1(0.55, 0, ergue), pousa); q.saia = 0.3 * entra * (1 - ergue);
  q.yaw = lerpAng(0, YAW_MENOSX, suave(fase0(ta, 103.9, 104.6))); q.expr = pousa > 0.5 ? 'determinado' : 'esforco';
  return q;
}
function rampa(t, a, b, c, d) { return suave(fase0(t, a, b)) * (1 - suave(fase0(t, c, d))); }
// onde fica o vestido verde no chão do vagão-restaurante: [x, z, giro]. Um pouco mais à direita na vista do P18a (6 cm para o
// lado do avental, 4 cm para longe da porta) e girado, sem ficar no caminho do xerife: os pés passam a pelo menos 4,5 cm do pano
// quando ele se ajoelha e quando sai pela porta, e o pano fica a 5 cm da porta
const VESTIDO_CHAO = [-7.01, 0.66, 2.55];
// ajoelhada (atrás da pedra, encostada nela): sentada sobre o calcanhar esquerdo, com o joelho esquerdo no chão e a canela
// voltando para baixo do quadril (o bico da bota apoiado, sem entrar na pedra atrás), e o pé direito plantado à frente, com
// o joelho perto do peito. A altura do quadril sai das pernas: o ponto mais baixo (joelho, calcanhar ou bico) toca o chão.
function ajoelha(p, k, P = G.jackFL) {
  if (k <= 0) return p;
  p.quadE = lerp1(p.quadE, 0.8, k); p.joelhoE = lerp1(p.joelhoE, 2.6, k); p.quadD = lerp1(p.quadD, 1.85, k); p.joelhoD = lerp1(p.joelhoD, 1.9, k);
  p.abreE = lerp1(p.abreE, 0.04, k); p.abreD = lerp1(p.abreD, 0.1, k);
  p.y += (alturaQuadrilApoiado(P, p) - P.D.quadril - (p.bob || 0)) * Math.min(1, k * 3);
  return p;
}
// altura do quadril acima do chão para que o ponto mais baixo das pernas (joelho, calcanhar ou bico) encoste nele
function alturaQuadrilApoiado(P, p) {
  const D = P.D, inc = (p.inclina || 0) * 0.4; let baixo = Infinity;
  for (const [q, j, ab] of [[p.quadE, p.joelhoE, p.abreE || 0], [p.quadD, p.joelhoD, p.abreD || 0]]) {
    const a = q - inc, b = a - j, ca = Math.cos(ab); // coxa e canela, a partir da vertical (positivo: para a frente)
    const joelho = -D.coxa * Math.cos(a) * ca;
    const pe = (ly, lz) => joelho + (ly * Math.cos(b) + lz * Math.sin(b)) * D.s * ca;
    baixo = Math.min(baixo, joelho - 0.05 * D.s, pe(-0.485, -0.1), pe(-0.485, 0.17));
  }
  return -baixo;
}
function estadoJackBruto(ta) {
  if (ta < 61.8) {
    const P = ta < 59.8 ? G.jack : G.jackFL; // na porta, fora de quadro, ela arranca o vestido e o avental: por baixo, já é a Diamond Jack
    const [x, z] = trilhaH(J_D, ta), [vx, vz] = velCaminho(J_D, ta), v = Math.hypot(vx, vz), w = suave(v / 1.6);
    const p = poseBase(); const wp = dLocal(x, PISO, z); p.x = wp[0]; p.y = wp[1]; p.z = wp[2];
    andar(p, faseCaminho(J_D, ta, 0.95), suave(v / 1.1) * (1 - 0.25 * suave((v - 2) / 1.5)));
    let yaw0 = 0;
    const bandeja = (nome) => { p.maoE = nome; p.ombroE = 0.3; p.cotoveloE = 1.45; }; // bandeja na altura do peito
    if (ta < 19.3) { yaw0 = Math.PI; respira(p, ta); p.ombroE = p.ombroD = 0.6; p.cotoveloE = p.cotoveloD = 1.3; p.cabYaw = -1.25 * rampa(ta, 16.8, 17.6, 18.9, 19.5); }
    else if (ta < 23.4) { const k = suave(fase0(ta, 19.3, 19.9)); bandeja('bandeja'); p.ombroE = lerp1(0.6, 0.6, k); p.cotoveloE = lerp1(1.3, 1.5, k); p.maoD = { nome: 'bule' }; p.ombroD = lerp1(0.6, 0.2, k); p.cotoveloD = lerp1(1.3, 0.5, k);
      // P07: o convidado da mesa -4,4 ergue a taça para ela, que vira o rosto e sorri; depois de passar, o olhar baixa
      p.cabYaw = -0.5 * rampa(ta, 20.0, 20.35, 20.9, 21.3); p.cabPitch = 0.13 * rampa(ta, 21.35, 21.7, 22.25, 22.6); }
    else if (ta < 27.6) { bandeja('bandeja'); p.maoD = { nome: 'bule' }; p.ombroD = 0.2; p.cotoveloD = 0.5; // P08: para para ouvir o brinde, com a bandeja e o bule
      // assiste ao brinde, como todos: olha o Barão e a joia que ele mostra (o perfil dela aparece um pouco para a câmera)
      p.cabYaw = 0.08 * rampa(ta, 23.9, 24.4, 25.6, 25.9) - 0.3 * rampa(ta, 25.75, 26.2, 26.6, 27.0); p.cabPitch = -0.04 * rampa(ta, 24.0, 24.4, 26.7, 27.1); }
    else if (ta < 30.6) { bandeja('bandeja'); const k = rampa(ta, 29.3, 29.7, 30.3, 30.6); p.maoD = { nome: 'bule', inclina: 0.8 * k }; p.ombroD = lerp1(0.2, 0.9, k); p.cotoveloD = 0.6; p.cabYaw = 0.6 * rampa(ta, 28.2, 28.6, 29.2, 29.5); }
    else if (ta < 43.0) { respira(p, ta); p.cabPitch = -0.05; p.ombroE = p.ombroD = 0.1 + 0.3 * w;
      // na janela (P11), os olhos nele: a cabeça (e um pouco o tronco) seguem o Barão na plataforma enquanto o trem sai; depois
      // que ele fica para trás, ela volta o rosto para a frente (para a câmera), desconfiada
      const sb = rampa(ta, 35.95, 36.55, 40.6, 41.5); if (sb > 0) { const b = estadoBaraoBruto(ta).p, hx = xLoco(ta) + CX_D + JANELA_P11[0], a = Math.atan2(b.x - hx, b.z - JANELA_P11[1]);
        p.cabYaw = Math.max(-1.15, Math.min(1.15, a * 0.85)) * sb; p.torce = Math.max(-0.3, Math.min(0.3, a * 0.22)) * sb; p.cabPitch = -0.02; }
 }
    else if (ta < 46.0) bandeja('bandejaCloche');
    else if (ta < 52.2) {
      bandeja('bandejaCloche');
      if (ta > 46.6) { yaw0 = lerpAng(YAW_MAISX, YAW_MENOSX, suave(fase0(ta, 48.9, 49.6))); }
      if (ta > 47.0 && ta < 49.1) { const k = rampa(ta, 47.2, 47.5, 48.6, 48.9); p.ombroD = lerp1(0.3, 1.3, k); p.cotoveloD = lerp1(0.3, 0.4, k); p.maoD = ta > 48.1 && ta < 48.9 ? 'carta' : null; p.inclina = 0.2 * k; }
    }
    else if (ta < 55.33) { yaw0 = Math.PI; bandeja('bandejaCloche'); respira(p, ta); p.cabYaw = 0.7 * rampa(ta, 52.6, 53.2, 54.7, 55.3); }
    else if (ta < 58.5) { yaw0 = CAFE.yawJack; bandeja('bandeja'); const k = rampa(ta, 56.4, 56.8, 58.2, 58.5); p.maoD = { nome: 'bule', inclina: 0.85 * k }; p.ombroD = lerp1(0.25, 0.9, k); p.cotoveloD = 0.65; } // o olhar fica em cafeJack
    else { // enquanto o xerife encara a vitrine (fora de quadro): deixa a bandeja no balcão, empurra a porta e sai. Ela só se
      // vira para a porta depois do corte do P15b (o giro, com a média no tempo, começa em 58,65 s): virando antes, passaria o
      // rosto pela lente da câmera do P15b, que fica do lado do corredor
      yaw0 = ta < 59.1 ? CAFE.yawJack : YAW_MENOSX; if (ta < 59.33) bandeja('bandeja');
      const pousa = rampa(ta, 59.0, 59.12, 59.25, 59.4), empurra = rampa(ta, 59.45, 59.55, 59.75, 59.95);
      p.ombroE = lerp1(p.ombroE, 0.95, pousa); p.cotoveloE = lerp1(p.cotoveloE, 0.6, pousa); p.abracoE = lerp1(p.abracoE, 0.35, pousa);
      p.ombroD = lerp1(p.ombroD, 1.45, empurra); p.cotoveloD = lerp1(p.cotoveloD, 0.25, empurra);
    }
    p.yaw = (ta > 46.6 && ta < 51.8) ? yaw0 : lerpAng(yaw0, Math.atan2(vx, vz), w); p.__vel = v;
    // P07: o sorriso educado para o convidado, que cai quando ela passa e volta na mesa seguinte; P08: educada no brinde. Até
    // a revelação (P19) ela é só a garçonete: nenhum sorriso de quem sabe das coisas, nenhuma piscadela (a pista é a câmera)
    p.expr = ta < 16.8 ? 'neutro' : ta < 20.05 ? 'sorrisoLeve' : ta < 21.3 ? 'sorriso' : ta < 22.55 ? 'neutro' : ta < 27.5 ? 'sorrisoLeve' : ta < 30.6 ? 'sorriso' : ta < 31.45 ? 'sorrisoLeve' : ta < 36.7 ? 'neutro' : ta < 43 ? 'determinado' : ta < 52.55 ? 'determinado' : ta < 54.3 ? 'surpresa' : ta < 58.5 ? 'preocupado' : 'neutro'; // as luzes voltam: o mesmo susto de todos; depois, preocupada
    if (ta > 16.8 && ta < 19.3) p.olhar = 1;
    return { P, p, onde: 'D', semChapeu: P === G.jackFL };
  }
  // na plataforma traseira do vagão-restaurante: põe o chapéu
  if (ta < 77.5) {
    const p = poseDe(G.jackFL, 0, 0, 0, 0); const [x, y, z] = dLocal(-8.0, PISO - 0.04, 0.05); p.x = x; p.y = y; p.z = z;
    p.yaw = lerpAng(-0.4, YAW_MAISX, suave(fase0(ta, 75.4, 76.2))); respira(p, ta, 1.5);
    let semChapeu = true;
    if (ta > 69.5 && ta < 76.3) { // sobe o chapéu na frente do peito, segura nivelado acima da cabeça e encaixa com as duas mãos
      const h = fase0(ta, 69.6, 75.4), A = suave(fase0(h, 0, 0.55)), B = suave(fase0(h, 0.55, 1)), B2 = suave(fase0(h, 0.55, 0.75));
      const sai = 1 - suave(fase0(ta, 75.4, 76.2)), en = suave(fase0(ta, 69.5, 70.4));
      if (ta < 75.4) p.chapeuMao = h;
      p.cabPitch = 0.12 * en * sai * (1 - B);
      // na subida a mão direita leva o chapéu, que vai preso à palma dela (poseChapeuMao, em sketch.js); na descida ele vai
      // do alto, onde a subida o deixou, até a cabeça, e as duas mãos seguram a aba por cinemática inversa (antes o chapéu
      // seguia um caminho próprio e, na subida, passava até meio metro acima da mão)
      const r = h > 0.55 ? maosNoChapeu(p, h, en) : { oD: lerp1(0.75, 2.7, A), cD: lerp1(1.75, 1.15, A), aD: p.abracoD, oE: p.ombroE, cE: p.cotoveloE, aE: p.abracoE };
      const k = en * sai, kE = B2 * sai;
      p.ombroD = lerp1(p.ombroD, r.oD, k); p.cotoveloD = lerp1(p.cotoveloD, r.cD, k); p.abracoD = lerp1(p.abracoD, r.aD, k);
      p.ombroE = lerp1(p.ombroE, r.oE, kE); p.cotoveloE = lerp1(p.cotoveloE, r.cE, kE); p.abracoE = lerp1(p.abracoE, r.aE, kE); }
    if (ta >= 75.4) semChapeu = false;
    if (ta > 76.3) p.cabYaw = 0;
    p.expr = ta < 75.4 ? 'determinado' : ta < 76.95 ? 'maroto' : 'determinado';
    if (ta > 76.32 && ta < 76.66) p.expr = 'piscadela'; // de chapéu, antes de correr: pisca um olho para o xerife (P20)
    if (ta > 75.9 && ta < 77.2) p.semPiscar = true; // sem a piscada automática dos dois olhos colada nela
    if (ta > 76.9) { const u = fase0(ta, 76.9, 77.5), q = dLocal(-8.0, PISO - 0.04, 0.05); p.x = lerp1(q[0], -40.1, suave(u)); p.z = lerp1(0.05, 1.15, suave(fase0(u, 0.6, 1))); p.yaw = lerpAng(YAW_MAISX, YAW_MENOSX, suave(u)); correr(p, u * 1.2, 0.8 * Math.sin(u * Math.PI), 3, G.jackFL); p.__vel = 3 * Math.sin(u * Math.PI); } // passa pelo vão do meio das grades das duas testas e só depois vai para o canto da escada
    return { P: G.jackFL, p, onde: 'trem', semChapeu };
  }
  if (ta < 104.6) {
    const v3 = trilhaH(J_TETO, ta), [vx, vz] = velCaminho(J_TETO, ta, 0, 2), v = Math.hypot(vx, vz);
    const base = () => poseDe(G.jackFL, v3[0], v3[1], v3[2], YAW_MENOSX);
    let p = base(); p.expr = 'determinado'; correr(p, faseCorrida(J_TETO, ta, 0, 2), Math.min(1, suave(v / 2.5) * Math.min(1.1, v / 5 + 0.3)), v, G.jackFL);
    if (v < 1.5) { respira(p, ta, 2); p.cabYaw = (ta > 97.2 && ta < 99.6 ? -0.2 : 0.5) * (1 - v / 1.5); }
    // camadas de ação, cada uma entra e sai com rampa
    const camadas = [
      [77.5, 77.7, 79.4, 79.9, q => { subir(q, (v3[1] - 1.25) / 3); }],
      [84.65, 84.85, 85.25, 85.5, q => { noAr(q, fase0(ta, 84.8, 85.3)); q.expr = 'esforco'; }],
      [86.95, 87.3, 90.95, 91.35, q => { q.yaw = YAW_MAISX; respira(q, ta, 2); q.ombroE = 0.45; q.abracoE = 0.55; q.cotoveloE = 1.7; q.ombroD = 0.25; q.abreE = q.abreD = 0.12; // vira e encara o xerife
        q.expr = ta < 87.8 ? 'maroto' : ta < 88.08 ? 'surpresa' : 'medo'; q.cabPitch = ta > 87.8 ? -0.12 : 0; }],
      [88.2, 88.58, 90.4, 90.95, q => { q.yaw = YAW_MAISX; deitadaCostas(q); q.expr = ta < 89.6 ? 'medo' : 'determinado'; }], // vê o túnel atrás dele e se joga de costas
      [94.95, 95.15, 95.65, 95.8, q => { noAr(q, fase0(ta, 95.1, 95.75)); q.expr = 'esforco'; }],
      [95.65, 95.8, 97.7, 97.95, q => escalaBorda(q, ta)],
      [98.55, 98.75, 99.3, 99.55, q => truqueCarta(q, ta)],
      [99.45, 99.65, 104.55, 104.62, q => fugaLateral(q, ta)],
    ];
    for (const [a, b, c, d, f] of camadas) if (ta > a && ta < d) { const q = base(); f(q); p = misturaPose(p, q, rampa(ta, a, b, c, d)); }
    p.__vel = v; p.cru = rampa(ta, 95.7, 95.85, 97.75, 97.95); // na escalada da borda, a pose vale como está (a média no tempo adiantava o joelho para dentro do teto)
    return { P: G.jackFL, p, onde: 'trem' };
  }
  return { P: G.jackFL, p: null, onde: 'cavalo' };
}
function estadoJack(ta) { return cafeJack(cargaJack(suavizaPose(estadoJackBruto, ta), ta), ta); }

// ---------------------------------------------------------------- xerife
const X_D = [
  // depois do roubo ele não atravessa o vagão: fica na vitrine, de costas para o vagão, e só depois do alarme corre para o fundo
  [0, 5.3, -0.42], [55.3, 5.3, -0.42], [56.3, 5.3, 0.4], [62.0, 5.3, 0.4], [62.7, 4.4, 0.05], // sai à frente dos ajudantes, que entram pela porta da frente
  [66.9, -6.2, 0.25], [73.1, -6.2, 0.25], [74.7, -6.5, -0.05], [76.6, -6.7, -0.05], [77.4, -7.4, 0.05], [78.0, -8.2, 0.3],
];
// a revelação, numa tomada só (P19): de pé, com o avental aberto, ele ainda olha a carta; ergue os olhos devagar (a surpresa
// vira raiva); solta o canto da mão D e baixa o avental ao lado do corpo com a E; vira para a porta, primeiro os olhos,
// depois a cabeça, depois o corpo (pelo lado -z, longe da câmera), e dá dois passos para o vidro. A mão E leva o avental
// até ele sacar o revólver
const X_REV = { ergue0: 71.35, ergue1: 71.85, raiva: 71.7, solta0: 72.0, solta1: 72.35, fecha0: 72.05, fecha1: 72.55,
  olhos0: 72.0, olhos1: 72.15, cab0: 72.15, cab1: 72.75, corpo0: 72.4, corpo1: 73.35, saca: 76.6 };
const X_TETO = [
  [78.0, -38.2, PISO - 0.04, 0.3], [80.4, -40.1, 1.25, 1.15], [82.4, -40.1, TETO_P, 1.15], [82.9, -41.0, TETO_P, 0.3], [84.8, -49.0, TETO_P, 0.0], [85.9, -55.7, TETO_P, 0.0],
  [86.4, -58.3, TETO_P + 0.25, 0.0], [88.4, -60.4, TETO_P, 0.0], [90.7, -60.6, TETO_P, 0.0], [92.0, -61.2, TETO_P, 0.0], [94.9, -71.0, TETO_P, 0.0], [95.7, -72.6, TETO_P, 0.0], [96.3, -73.05, TETO_P, 0.0], [96.8, -73.15, TETO_P, 0.0], [99.0, -73.2, TETO_P, 0.0], // para meio metro antes do fim da passarela (antes passava dela e ficava no ar sobre a cobertura curva)
];
// vagão dos cavalos (x, z locais ao centro do vagão)
// a altura da palha sob os pés em x local: nada na plataforma da ponta, toda ela depois de passar a soleira
function palhaS(lx) { return PALHA_S * suave(clamp01((6.95 - Math.abs(lx)) / 0.25)); }
// O ANCINHO (109,6 a 121,7). Ela vira para o xerife, tira o diamante da bolsa e anda até ele com o diamante na palma, como
// quem o oferece, sem tirar os olhos dele. Entre os dois, caído na palha de dentes para cima, um ancinho de feno: a
// travessa dos dentes a um passo dela e o cabo para ele, entre os pés dele. Com um sorriso, ela ergue bem o joelho e
// pisa de propósito nos dentes; o cabo sobe e o acerta no meio das pernas. Ele se dobra, o tiro escapa para o teto, cai de
// joelhos e o chapéu cai. O cavalo só recua um passo com o tiro. Com a mão na cintura, ela volta gingando, guarda o
// diamante, o cavalo sai da baia até ela, ela monta e o vira para a porta. O xerife pega o chapéu ainda de joelhos, vai
// agachado até a porta e, ajoelhado nela, atira no salto (P34) sem conseguir se levantar.
// Lugares em x e z do vagão (como X_S). O cabo mede do eixo da travessa até o meio das pernas dele (1,5 m: 1,2 m no chão e
// 0,9 m de altura) e mais 7 cm, que passam por trás dele quando bate.
const ANC = { cab: [0.45, -0.56], xerife: [1.65, -0.58], jack: [0.09, -0.55], monta: [-1.2, 0.29], L: 1.57, altura: 0.898, giroDiam: 0.95,
  vira0: 109.85, vira1: 110.65, bolsa0: 110.15, bolsa1: 110.5, oferece0: 110.62, oferece1: 111.3, anda0: 110.75, anda1: 112.7,
  sorri0: 117.17, sorri1: 117.32, joelho0: 117.5, joelho1: 117.86, pisa0: 117.94, pisa1: 118.05, bate: 118.28, solta0: 118.45, solta1: 118.75,
  recolhe0: 118.6, recolhe1: 118.95, volta0: 118.85, volta1: 120.05, guarda0: 119.35, guarda1: 119.95, monta0: 120.05,
  cai0: 118.5, cai1: 118.95, chapeu0: 118.95, chapeu1: 119.3, arma0: 118.31, arma1: 118.56, pega0: 121.1, pega1: 121.55, poe0: 121.6, poe1: 121.95,
  agacha0: 121.95, agacha1: 122.3, ajoelha0: 122.95, ajoelha1: 123.25, mira0: 123.6, mira1: 123.95 };
ANC.cavalo = [[118.4, -3.0, 0.82], [118.78, -3.28, 0.82], [118.95, -3.28, 0.82], [120.05, -1.25, 0.74], [120.6, -1.25, 0.74], [121.12, -0.45, 0.58], [121.65, 0.0, 0.1], [122.85, 0.0, 0.1], [123.55, 0.0, -0.6], [124.0, 0.0, -3.0]];
// o giro do cabo, da travessa para ele
ANC.yaw = Math.atan2(ANC.xerife[0] - ANC.cab[0], ANC.xerife[1] - ANC.cab[1]);
// o ângulo em que o cabo encontra o meio das pernas dele
ANC.th = Math.atan2(ANC.altura, Math.hypot(ANC.xerife[0] - ANC.cab[0], ANC.xerife[1] - ANC.cab[1]));
// o ângulo do cabo acima do chão: o pé empurra os dentes e o cabo sobe acelerando; bate, dá um tranco e fica (o pé dela
// segura os dentes); ela tira o pé e ele cai de volta e quica uma vez na palha
function anguloAncinho(ta) {
  const A = ANC, th = A.th;
  if (ta < A.pisa1) return 0;
  if (ta < A.bate) { const u = (ta - A.pisa1) / (A.bate - A.pisa1); return th * u * (0.45 + 0.55 * u); }
  if (ta < A.solta0) return th * (1 - 0.05 * Math.sin(fase0(ta, A.bate, A.bate + 0.12) * Math.PI));
  if (ta < A.solta1) { const u = fase0(ta, A.solta0, A.solta1); return th * (1 - u * u); }
  return 0.06 * th * Math.sin(fase0(ta, A.solta1, A.solta1 + 0.16) * Math.PI);
}
// um ponto do ancinho (v no referencial do modelo: x ao longo da travessa, y para cima, z ao longo do cabo) no referencial do trem
function pontoAncinho(ta, v) { const w = _ry(_rx(v, -anguloAncinho(ta)), ANC.yaw); return [CX_S + ANC.cab[0] + w[0], ALT.piso + palhaS(ANC.cab[0]) + w[1], ANC.cab[1] + w[2]]; }
// as pontas dos dentes sob o pé esquerdo dela (x do modelo: o lado do pé; o esquerdo fica do lado das baias, de frente para a câmera do P33a)
const DENTES_PE = [-0.07, 0.036 + 0.11 * Math.cos(0.3) + 0.004, -0.11 * Math.sin(0.3)];
function desenhaAncinho(ta) {
  const q = tremP(ta, CX_S + ANC.cab[0], ALT.piso + palhaS(ANC.cab[0]) - 0.004, ANC.cab[1]), a = anguloAncinho(ta);
  const f = [Math.sin(ANC.yaw), Math.cos(ANC.yaw)], m = ANC.L * 0.5 * Math.cos(a);
  // (a sombra sobe 3,5 cm sozinha)
  sombra(q[0] + f[0] * m, q[1] - 0.03, q[2] + f[1] * m, 0.13, ANC.L * 0.56 * Math.cos(a), ANC.yaw, 0.13 * (1 - 0.6 * a / ANC.th));
  push(); translate(q[0], q[1], q[2]); rotateY(ANC.yaw); rotateX(-a); model(G.ancinho); pop();
}
const X_S = [[101, 7.35, 0.0], [108.0, 7.35, 0.0], [108.7, 6.7, -0.45], [112.6, ANC.xerife[0], ANC.xerife[1]], [122.25, ANC.xerife[0], ANC.xerife[1]], [122.95, 0.95, -1.05], [127.5, 0.95, -1.05]];
function estadoXerifeBruto(ta) {
  if (ta < 78.0) {
    const [x, z] = trilhaH(X_D, ta), [vx, vz] = velCaminho(X_D, ta), v = Math.hypot(vx, vz), w = suave(v / 1.6);
    const p = poseDe(G.xerife, 0, 0, 0, 0); const wp = dLocal(x, PISO, z); p.x = wp[0]; p.y = wp[1]; p.z = wp[2];
    if (ta > 62.0 && ta < 66.9 && v > 0.3) correr(p, faseCorrida(X_D, ta), Math.min(1, v / 3.2), v, G.xerife); // do alarme à porta do fundo, correndo
    else andar(p, faseCaminho(X_D, ta, 1.05), suave(v / 1.2) * (1 - 0.25 * suave((v - 2) / 1.5)));
    respira(p, ta, 1 - w);
    let yaw0 = YAW_MENOSX;
    if (ta < 52.5) { bracosCruzados(p); p.cabYaw = 0.5 * rampa(ta, 24, 24.6, 27, 27.6); }
    else if (ta < 55.3) { // vira para a vitrine vazia; no fim puxa o cartaz de procurado
      p.cabYaw = 1.2 * suave(fase0(ta, 52.6, 53.4)) * (1 - 0.6 * suave(fase0(ta, 54.9, 55.3))); yaw0 = YAW_MENOSX + 0.5 * suave(fase0(ta, 53.2, 54.5));
      const c = suave(fase0(ta, 54.85, 55.3)); if (c > 0.05) { p.maoD = 'cartaz'; p.ombroD = lerp1(0.1, 0.9, c); p.cotoveloD = lerp1(0.2, 0.9, c); }
      p.cabPitch = -0.08 * rampa(ta, 53.3, 53.7, 54.5, 54.9); }
    else if (ta < 60.5) { // vai até a vitrine e fica de costas para o vagão, encarando o pedestal vazio com a carta de valete
      p.maoD = 'cartaz'; yaw0 = lerpAng(YAW_MENOSX + 0.5, YAW_VITRINE, suave(fase0(ta, 55.35, 56.3))); p.inclina = 0.1 * suave(fase0(ta, 58.8, 59.4)); } // continua o giro do P14c, para o lado da vitrine
    else if (ta < 61.6) { // vira-se uma vez só (pelo lado da vitrine, o giro mais curto) e procura a garçonete lá no fundo; o olhar fica em cafeXerife
      p.maoD = 'cartaz'; yaw0 = YAW_VITRINE + (YAW_MENOSX - YAW_VITRINE) * suave(fase0(ta, 60.5, 61.2)); p.inclina = 0.1 * (1 - suave(fase0(ta, 60.5, 60.8))); }
    else if (ta < 63.3) { // grita o alarme dali mesmo e sai correndo pelo corredor, para o fundo
      p.maoD = 'cartaz'; p.ombroD = 0.45; p.cotoveloD = 0.6;
      const grita = rampa(ta, 61.8, 62.05, 62.5, 62.75);
      p.ombroE = lerp1(p.ombroE, 2.6, grita); p.cotoveloE = lerp1(p.cotoveloE, 0.35 + 0.3 * Math.sin(ta * 14), grita); p.abracoE = lerp1(p.abracoE, 0.3, grita); p.cabPitch = -0.12 * grita; } // acena com o braço erguido ao lado do corpo
    else if (ta < 66.9) { p.maoD = 'cartaz'; p.ombroD = 0.25; p.cotoveloD = 0.45;
      p.cabYaw = 0.55 * rampa(ta, 64.6, 64.85, 65.2, 65.5); } // olha o convidado que aponta
    else if (ta < X_REV.saca) {
      // ajoelha junto do avental e o apanha do chão com a mão E (aventalXerife); levanta, vira para a luz do corredor e o
      // abre com as duas mãos. Para a mão chegar ao chão, 40 cm à frente, ele inclina e gira o tronco para o lado E; o braço
      // D pende solto, junto do joelho erguido. Depois, a revelação (X_REV): a cabeça vai à frente do corpo, até 1,1 rad
      const R = X_REV, u = rampa(ta, 66.9, 67.5, 67.95, 68.45); p.inclina = 0.4 * u; p.sentado = 1.0 * u; p.quadE = lerp1(p.quadE, 0.31, u); p.quadD = lerp1(p.quadD, 1.41, u); p.joelhoE = lerp1(p.joelhoE, 1.6, u); p.joelhoD = lerp1(p.joelhoD, 1.35, u);
      const alcanca = rampa(ta, 67.02, 67.42, 67.6, 67.95); p.inclina += 0.85 * alcanca; p.torce = (p.torce || 0) + 0.6 * alcanca;
      const vira = suave(fase0(ta, 67.95, 68.28)), corpo = suave(fase0(ta, R.corpo0, R.corpo1)), cab = suave(fase0(ta, R.cab0, R.cab1)); yaw0 = YAW_MENOSX + Math.PI * (vira + corpo);
      p.ombroD = lerp1(p.ombroD, 0.2 + 0.8 * p.inclina, u); p.cotoveloD = lerp1(p.cotoveloD, 0.55, u);
      const abre = suave(fase0(ta, 68.12, 68.4)), ergue = suave(fase0(ta, R.ergue0, R.ergue1));
      p.cabPitch = lerp1(lerp1(0.35 * u + 0.2 * alcanca, 0.38 + 0.12 * suave(fase0(ta, 69.4, 70.2)), abre), -0.1, ergue) + 0.05 * corpo; p.cabYaw = (p.cabYaw || 0) + Math.min(Math.PI * (cab - corpo), 1.1);
      p.olhar = Math.round(3 * rampa(ta, R.olhos0, R.olhos1, R.corpo0 + 0.4, R.corpo1)) / 4; }
    else { p.cabPitch = -0.05; p.maoD = 'revolver'; p.ombroD = 1.4; p.cotoveloD = 0.2; }
    p.yaw = lerpAng(yaw0, Math.atan2(vx, vz), w); p.__vel = v;
    p.expr = ta < 52.55 ? 'neutro' : ta < 54.75 ? 'surpresa' : ta < 58.4 ? 'raiva' : ta < 60.4 ? 'determinado' : ta < 61.45 ? 'surpresa' : ta < 64.4 ? 'raiva' : ta < 67.6 ? 'determinado' : ta < X_REV.raiva ? 'surpresa' : ta < 76.3 ? 'raiva' : 'surpresa';
    return { P: G.xerife, p, onde: 'D' };
  }
  if (ta < 101) {
    const v3 = trilhaH(X_TETO, ta), [vx, vz] = velCaminho(X_TETO, ta, 0, 2), v = Math.hypot(vx, vz);
    const base = () => poseDe(G.xerife, v3[0], v3[1], v3[2], YAW_MENOSX);
    let p = base(); p.expr = 'determinado'; correr(p, faseCorrida(X_TETO, ta, 0, 2), suave(v / 2.5) * Math.min(1, v / 5 + 0.3), v, G.xerife); p.maoD = 'revolver';
    if (v < 1.5) { respira(p, ta, 2); p.ombroD = lerp1(p.ombroD, 0.7, 1 - v / 1.5); p.cotoveloD = lerp1(p.cotoveloD, 0.4, 1 - v / 1.5); }
    if (ta < 78.6) p.maoD = null;
    const camadas = [
      [78.0, 78.2, 80.0, 80.4, q => { andar(q, (ta - 78) * 1.6, 0.8); q.yaw = lerpAng(YAW_MENOSX, 0.6, 0.5); }],
      [80.2, 80.4, 82.4, 82.9, q => { subir(q, (v3[1] - 1.25) / 3); q.maoD = null; }],
      [85.75, 85.95, 86.35, 86.55, q => noAr(q, 0.5)],
      [88.4, 88.56, 88.84, 88.92, q => { q.torce = 0.8; q.cabYaw = 1.25; q.expr = ta > 88.62 ? 'surpresa' : 'determinado'; respira(q, ta, 2); }], // estranha, olha para trás: o túnel
      [88.84, 89.02, 90.4, 90.9, q => { deitada(q); q.y -= 0.15; q.maoD = null; q.expr = 'surpresa'; }],
      [90.6, 90.9, 91.8, 92.2, q => { q.expr = 'tosse'; respira(q, ta, 3); q.inclina = 0.6 + Math.sin(ta * 14) * 0.15; q.ombroD = 1.3; q.cotoveloD = 1.9; }],
    ];
    for (const [a, b, c, d, f] of camadas) if (ta > a && ta < d) { const q = base(); q.maoD = 'revolver'; f(q); p = misturaPose(p, q, rampa(ta, a, b, c, d)); }
    p.__vel = v;
    return { P: G.xerife, p, onde: 'trem' };
  }
  // vagão dos cavalos: entra com as duas armas e para diante dela, com o cabo do ancinho entre os pés (ANC)
  if (ta < 127.5) {
    const [lx, lz] = trilhaH(X_S, ta), [vx, vz] = velCaminho(X_S, ta), v = Math.hypot(vx, vz);
    const p = poseDe(G.xerife, CX_S + lx, PISO - 0.04 + palhaS(lx), lz, YAW_MENOSX);
    if (v > 0.15) andar(p, faseCaminho(X_S, ta, 1.05), Math.min(1, v / 1.2) * 0.75); else respira(p, ta, 1.5);
    const mira = suave(fase0(ta, 106.75, 107.25)); // engatilha: as duas armas
    p.maoD = mira > 0.3 ? 'revolver' : null; p.maoE = mira > 0.3 ? 'revolver' : null; p.rolaD = p.rolaE = Math.min(1, mira / 0.3);
    p.ombroD = lerp1(p.ombroD, 1.45, mira); p.cotoveloD = lerp1(p.cotoveloD, 0.1, mira); p.ombroE = lerp1(p.ombroE, 1.42, mira); p.cotoveloE = lerp1(p.cotoveloE, 0.1, mira); p.abracoE = lerp1(p.abracoE, 0.05, mira);
    golpeXerife(p, ta);
    p.__vel = v;
    return { P: G.xerife, p, onde: 'trem', semChapeu: ta > ANC.chapeu0 && ta < ANC.poe1 };
  }
  return { P: G.xerife, p: null, onde: 'fora' };
}
function estadoXerife(ta) { return aventalXerife(cartazXerife(cafeXerife(suavizaPose(estadoXerifeBruto, ta), ta), ta), ta); }
// O golpe do ancinho no xerife (ANC). Parado diante dela, as pernas um pouco abertas, ele baixa os olhos para o diamante na
// palma dela. O cabo o acerta no meio das pernas: os joelhos se fecham, o quadril recua, a arma direita salta e dispara no
// teto, a esquerda cai da mão, que vai para o meio das pernas. Ele se dobra e cai de joelhos, sentado nos calcanhares, ofegante.
// No P34, ainda dobrado de dor: pega o chapéu do chão com a mão esquerda e o põe, de joelhos; ergue-se só até ficar
// agachado e vai assim até a porta; lá, apoia o joelho direito no chão e, com a mão esquerda de volta no meio das pernas,
// tenta acertá-la com a direita, acompanhando o cavalo no salto (dois tiros).
// As poses já vêm suaves das rampas; sem a média no tempo (cru), o golpe não começaria antes de o cabo chegar.
// do lado E dele (-z), longe do cabo
const CHAPEU_CHAO = [ANC.xerife[0] - 0.55, ANC.xerife[1] - 0.37], ARMA_CHAO = [ANC.xerife[0] - 0.9, ANC.xerife[1] - 0.14];
function golpeXerife(p, ta) {
  const A = ANC, P = G.xerife, D = P.D, mix = (k, o) => { if (k > 0) for (const c in o) p[c] = lerp1(p[c] || 0, o[c], k); };
  if (ta < 112.3) return;
  p.cru = rampa(ta, 117.7, 117.9, 127.0, 127.5);
  // o cabo passa entre os pés
  mix(rampa(ta, 112.35, 112.85, A.cai0, A.cai1), { abreE: 0.07, abreD: 0.07 });
  // de olho na joia
  const joia = rampa(ta, 112.9, 113.6, A.bate - 0.02, A.bate + 0.08);
  p.cabPitch = lerp1(p.cabPitch || 0, 0.36, joia); p.inclina += 0.05 * joia;
  // as armas baixam um pouco, atraídas pela pedra
  p.ombroD -= 0.2 * joia; p.ombroE -= 0.2 * joia;
  // o tranco: os joelhos se fecham e dobram um pouco, o quadril recua (os pés ficam), a cabeça vai para trás
  const tranco = rampa(ta, A.bate, A.bate + 0.05, A.bate + 0.14, A.cai0 + 0.12), f = frente(p.yaw);
  p.inclina += 0.24 * tranco; p.cabPitch -= 0.3 * tranco;
  mix(tranco, { abreE: -0.03, abreD: -0.03, quadE: 0.4 * p.inclina + 0.08, quadD: 0.4 * p.inclina + 0.08, joelhoE: 0.22, joelhoD: 0.22 });
  p.x -= f[0] * 0.07 * tranco; p.z -= f[1] * 0.07 * tranco;
  // a arma direita salta para cima e dispara no teto (TIROS_S); depois desce, de cano para o chão, sobre a coxa
  const salta = rampa(ta, A.bate + 0.01, A.bate + 0.1, 118.44, 118.78);
  p.ombroD += 1.05 * salta; p.cotoveloD += 0.12 * salta;
  // a esquerda larga a arma (desenhaArmaXerifeS)
  if (ta > A.arma0) p.maoE = null;
  // dobra-se e cai de joelhos, sentado nos calcanhares; ofegante
  const agacha = suave(fase0(ta, A.agacha0, A.agacha1)), ajoelha = suave(fase0(ta, A.ajoelha0, A.ajoelha1)), k = suave(fase0(ta, A.cai0, A.cai1)) * (1 - agacha);
  const pega = rampa(ta, A.pega0, A.pega1, A.pega1 + 0.05, A.poe0 + 0.15);
  if (k > 0) {
    const inc = lerp1(0.88, 1.15, pega) + 0.035 * Math.sin((ta - A.cai1) * 6.5) * suave(fase0(ta, A.cai1, A.cai1 + 0.4)) * (1 - pega);
    p.inclina = lerp1(p.inclina, inc, k);
    const a = 0.42, q = a + 0.4 * p.inclina, j = a + Math.PI / 2 - 0.12;
    mix(k, { quadE: q, quadD: q, joelhoE: j, joelhoD: j, abreE: 0.08, abreD: 0.08, peE: 0.35, peD: 0.35, torce: 0 });
    mix(k, { ombroD: 0.3, abracoD: 0.3, cotoveloD: 0.55 });
    p.cabPitch = lerp1(p.cabPitch, 0.12, k);
  }
  // agachado: ergue-se só até aqui, curvado para a frente, os joelhos bem dobrados, e anda assim até a porta
  const ag = agacha * (1 - ajoelha);
  if (ag > 0) {
    p.inclina = lerp1(p.inclina, 0.62, ag); p.quadE += 1.1 * ag; p.quadD += 1.1 * ag; p.joelhoE += 1.3 * ag; p.joelhoD += 1.3 * ag;
    mix(ag, { abreE: 0.1, abreD: 0.1, torce: 0, ombroD: 0.45, abracoD: 0.2, cotoveloD: 0.55 }); p.cabPitch = lerp1(p.cabPitch, -0.3, ag);
  }
  // na porta, o joelho direito no chão e o pé esquerdo à frente, ainda curvado
  if (ajoelha > 0) { mix(ajoelha, { inclina: 0.38, quadE: 1.5, joelhoE: 1.45, abreE: 0.14, peE: 0, quadD: 0.1, joelhoD: 1.6, abreD: 0.05, peD: 0.55, torce: 0, ombroD: 0.45, abracoD: 0.2, cotoveloD: 0.55 });
    p.cabPitch = lerp1(p.cabPitch, -0.15, ajoelha); }
  // vira para a porta enquanto chega a ela; na mira, o corpo e a arma direita acompanham o cavalo dela, e cada tiro dá um tranco
  if (ta > 122.6) p.yaw = lerpAng(p.yaw, Math.PI, suave(fase0(ta, 122.6, 123.1)));
  const mira = suave(fase0(ta, A.mira0, A.mira1));
  if (mira > 0) {
    const c = estadoCavaloJack(ta).e, alvo = [c.x - xLoco(ta), c.y - Y_TRILHO + 1.5, c.z], dx = alvo[0] - p.x, dz = alvo[2] - p.z;
    const el = Math.atan2(alvo[1] - (p.y + 1.2), Math.hypot(dx, dz));
    p.yaw = lerpAng(p.yaw, Math.atan2(dx, dz), mira);
    mix(mira, { ombroD: Math.min(2.4, Math.PI / 2 + el - 0.25), abracoD: 0.02, cotoveloD: 0.06, cabPitch: -0.25 - el * 0.5 });
    for (const tt of TIROS_S) if (tt.t > 120 && ta > tt.t) { const e = Math.exp(-(ta - tt.t) * 12); p.ombroD += 0.35 * e; p.cotoveloD += 0.3 * e; p.inclina -= 0.05 * e; }
  }
  // pernas: o ponto mais baixo (bota ou joelho) sempre no chão
  const apoio = Math.max(tranco, k, agacha); if (apoio > 0) p.y += (alturaQuadrilApoiado(P, p) - D.quadril - (p.bob || 0)) * Math.min(1, apoio * 3);
  // a mão esquerda no meio das pernas, depois no chapéu do chão, e o chapéu de volta à cabeça
  const virilha = rampa(ta, A.arma0, A.arma0 + 0.22, A.pega0, A.pega0 + 0.3) + rampa(ta, A.poe1 + 0.05, A.poe1 + 0.45, 130, 131);
  if (virilha > 0) { const v = _ry(_rx([0, -0.1 * D.s, 0.13 * D.s], -0.6 * p.inclina), -(p.torce || 0)), r = ikJack('xerVirilha' + p.inclina.toFixed(2), p, () => ikMao(D, -1, v, [0.4, 0.2, 1.2], 0, 0.15));
    mix(virilha, { ombroE: r.om, abracoE: r.ab, cotoveloE: r.co }); }
  if (pega > 0) { const w = paraTronco(P, p, [CX_S + CHAPEU_CHAO[0] + 0.22, PISO - 0.04 + PALHA_S + 0.04, CHAPEU_CHAO[1] + 0.15]), r = ikMao(D, -1, w, [1.0, 0.2, 0.4], 0, 0.2);
    mix(pega, { ombroE: r.om, abracoE: r.ab, cotoveloE: r.co }); }
  const naMao = ta >= A.pega1 && ta < A.poe1;
  if (naMao) p.maoE = { nome: 'chapeuXerife', semCarta: true };
  // põe o chapéu
  mix(rampa(ta, A.poe0, A.poe1 - 0.05, A.poe1, A.poe1 + 0.4), { ombroE: 2.7, abracoE: 0.3, cotoveloE: 2.1, cabPitch: 0.1 });
  // a expressão: de olho na joia, um sorriso de cobiça; o susto; a dor; a raiva
  p.expr = ta < 113.2 ? 'raiva' : ta < 115.0 ? 'determinado' : ta < A.bate ? 'sorrisoLeve' : ta < A.bate + 0.24 ? 'surpresa' : ta < A.mira0 ? 'esforco' : 'esforco>raiva@0.5';
}

// ================================================================ O CAFÉ DA SENHORA (55,33 a 61,81)
// Encenada por objetos no mundo: o cartaz, o bule e a bandeja têm posição e orientação próprias, e as mãos vão até
// eles por cinemática inversa (maoNoPonto). O xerife mostra o cartaz aos convidados do lado +z, comparando rostos,
// com a outra mão na cintura, e para junto da mesa -4,4 examinando o bigodudo. A garçonete, que não saiu do fundo,
// serve café à senhora assustada dessa mesa (é só a garçonete: nenhuma pista até o P19), deixa o bule na mesa e,
// enquanto o xerife está de costas encarando a vitrine, larga a bandeja no balcão e sai pela porta do fundo.
// Coordenadas: x e z do vagão (como J_D e X_D); alturas a partir do piso.
const CAFE = { t0: 55.33, t1x: 61.81, t1j: 59.45,
  xicara: [-4.64, 0.6],     // a xícara da senhora assustada (convidada 6, na mesa -4,4 ao lado do balcão), na beira da mesa
  buleMesa: [-4.34, 0.62],  // onde ela deixa o bule, na mesma mesa
  topoMesa: 0.73,           // altura do tampo (com a toalha), a partir do piso
  balcao: [-6.05, 1.02, -0.58], // onde ela larga a bandeja na saída, na beira do balcão, ao passar
  yawJack: -0.75, guest4: [-2.44, 1.2, 0.92], senhora: [-5.04, 1.2, 0.92] };
CAFE.fundo = [CX_D - 6.2, PISO + 1.78, 0.62]; // a câmera do P15a e do P16b, no fundo do vagão: ela e a senhora perto, o xerife lá na frente
// a câmera do P15b, do lado do corredor, a 20 graus do olhar da garçonete para a senhora (sem coincidir: ela não olha para a
// lente) e do mesmo lado do eixo entre as duas que a câmera do P15a (nos dois planos a senhora fica à direita dela); uns 10 cm
// abaixo dos olhos dela, avança de 1,35 a 1,2 m da cabeça dela (cab, de pé junto da mesa), na direção de giro -1,15
CAFE.cab = [CX_D - 4.2, PISO + 1.546, 0.1];
CAFE.ladoCorredor = d => [CAFE.cab[0] - 0.9128 * d, CAFE.cab[1] - 0.1, CAFE.cab[2] + 0.4085 * d];
const cafeP = (x, h, z) => [CX_D + x, PISO + h, z]; // ponto do vagão para o referencial do trem
function noCorpo(p, l) { const c = Math.cos(p.yaw), s = Math.sin(p.yaw); return [p.x + l[0] * c + l[2] * s, p.y + l[1], p.z - l[0] * s + l[2] * c]; } // l: [lado D, altura, frente]
function olharPara(p, w, lim = 1.15) { const a = Math.atan2(w[0] - p.x, w[2] - p.z) - p.yaw; return Math.max(-lim, Math.min(lim, Math.atan2(Math.sin(a), Math.cos(a)))); }
// o cartaz na mão do xerife: estendido do lado D (+z), virado para os convidados e um pouco para a frente
function cartazCafe(p, ta = 0) {
  const baixa = suave(fase0(ta, 55.33, 55.9)); // a caminho da vitrine, abaixa o cartaz ao lado do corpo
  const pega = noCorpo(p, lerp3([0.42, 1.4, 0.47], [0.4, 1.04, 0.15], baixa)), yawN = p.yaw + lerp1(Math.PI / 2 - 0.55, 0.3, baixa), n = [Math.sin(yawN), 0, Math.cos(yawN)];
  return { pega, yaw: yawN, c: [pega[0] + n[0] * 0.05, pega[1] - 0.12, pega[2] + n[2] * 0.05] }; // a mão segura por trás, no alto (o papel fica à frente dela)
}
function cafeXerife(e, ta) {
  if (!e || !e.p || ta < CAFE.t0 || ta >= CAFE.t1x) return e;
  const p = e.p, P = e.P;
  const c = cartazCafe(p, ta); e.cartaz = c;
  maoNoPonto(P, p, 1, c.pega, [1.2, 0.6, 0.5]);
  // a outra mão na cintura, cotovelo para fora (pose de xerife)
  // cotovelo para o lado: o braço gira (giroB) para o antebraço voltar até o quadril; fica o giro que encaixa melhor
  const cintura = paraTronco(P, p, doTronco(P, p, [-0.2 * P.D.s, 0.03, 0.05]));
  let melhor = null;
  for (const gi of [-1.5, -1.1, 1.1, 1.5]) { const r = ikMao(P.D, -1, cintura, [0.35, 0.95, 1.7], gi, 0.9); if (!melhor || r.erro < melhor.r.erro - 0.005 || (r.erro < 0.02 && r.ab > melhor.r.ab)) melhor = { r, gi }; }
  p.ombroE = melhor.r.om; p.abracoE = melhor.r.ab; p.cotoveloE = melhor.r.co; p.giroBE = melhor.gi; p.maoE = null; e.cinturaErro = melhor.r.erro;
  // o olhar: na carta de valete, no pedestal vazio; ao se virar, os olhos vão na frente do corpo, para o mesmo lado do giro
  // (ângulos do mundo, sem dar a volta), até onde ela estava, lá no fundo; no fim do P16b devolve a cabeça ao alarme
  const carta = cafeP(6.05, 1.06, 0.82), ondeEla = cafeP(-4.2, 1.5, 0.1);
  const ang = w => Math.atan2(w[0] - p.x, w[2] - p.z), rel = (g, lim) => { const a = g - p.yaw; return Math.max(-lim, Math.min(lim, Math.atan2(Math.sin(a), Math.cos(a)))); };
  let cy, cp;
  if (ta < 60.45) { cy = olharPara(p, carta); cp = lerp1(0.3, 0.45, suave(fase0(ta, 58.8, 59.4))); }
  else { const k = suave(fase0(ta, 60.45, 60.95)), gC = ang(carta); let gE = ang(ondeEla); while (gE > gC) gE -= 2 * Math.PI; // gira para o lado da vitrine (o ângulo diminui), como o corpo
    cy = rel(lerp1(gC, gE, k), 1.2); cp = lerp1(0.45, 0.05, k); }
  const solta = suave(fase0(ta, 61.45, 61.8));
  p.cabYaw = lerp1(cy, p.cabYaw || 0, solta); p.cabPitch = lerp1(cp, p.cabPitch || 0, solta);
  if (ta < 61.6) p.expr = 'determinado';
  return e;
}
// o bule: grip na alça; tip, a ponta do bico (geometria de bule() em elenco.js)
const BULE = { pega: [-0.115, 0.11, 0], bico: [0.14, 0.2, 0] };
function buleMundo(pega, yaw, incl) { // posição de um ponto do bule no mundo, dado onde está a alça
  return v => { const r = _ry(_rz([v[0] - BULE.pega[0], v[1] - BULE.pega[1], v[2]], -incl), yaw); return [pega[0] + r[0], pega[1] + r[1], pega[2] + r[2]]; };
}
function cafeJack(e, ta) {
  if (!e || !e.p || e.P !== G.jack || ta < CAFE.t0 || ta >= CAFE.t1j) return e;
  const p = e.p, P = e.P;
  const xic = cafeP(CAFE.xicara[0], CAFE.topoMesa, CAFE.xicara[1]);
  // o bule: carregado do lado D, de pé; ergue-se sobre a xícara, inclina e serve; depois vai para a mesa
  const sobe = suave(fase0(ta, 56.3, 56.65)), incl = 0.98 * suave(fase0(ta, 56.65, 56.85)) * (1 - suave(fase0(ta, 57.55, 57.75))); // serve devagar
  const vaiMesa = suave(fase0(ta, 58.2, 58.48));
  const carga = noCorpo(p, [0.3, 0.86, 0.12]);
  const dirServe = Math.atan2(xic[0] - (p.x + 0.0), xic[2] - p.z) - Math.PI / 2; // o bico aponta da mão para a xícara
  const yawB = lerpAng(p.yaw - Math.PI / 2, dirServe, sobe);
  const ponta = [xic[0], xic[1] + 0.012 + 0.062 + 0.07, xic[2]];
  const g0 = buleMundo([0, 0, 0], dirServe, 0.98)(BULE.bico); // bico relativo à alça, inclinado
  const sobreXic = [ponta[0] - g0[0], ponta[1] - g0[1], ponta[2] - g0[2]];
  const mesa = cafeP(CAFE.buleMesa[0], CAFE.topoMesa + BULE.pega[1], CAFE.buleMesa[1]);
  let pega = lerp3(carga, sobreXic, sobe); pega = lerp3(pega, [mesa[0], mesa[1] + 0.06 * (1 - vaiMesa), mesa[2]], vaiMesa);
  const solto = ta >= 58.5;
  const curva = 0.32 * rampa(ta, 58.18, 58.36, 58.5, 58.72); p.inclina = (p.inclina || 0) + curva; // inclina o corpo para pousar o bule na mesa
  e.bule = solto ? null : { pega, yaw: yawB, incl, serve: incl > 0.8 ? ponta : null };
  if (!solto) { maoNoPonto(P, p, 1, pega, [0.6, 0.15, 0.9]); p.fechaD = true; }
  // a bandeja: no peito enquanto anda; do lado E, mais baixa, enquanto serve; volta ao peito na saída; larga no balcão
  const lado = suave(fase0(ta, 55.95, 56.3)) * (1 - suave(fase0(ta, 58.45, 58.8)));
  const bPeito = noCorpo(p, [-0.1, 1.08, 0.3]), bLado = noCorpo(p, [-0.3, 0.88, -0.06]); // servindo: baixa, do lado e um pouco atrás, longe do cartaz
  let bandeja = lerp3(bPeito, bLado, lado);
  const larga = suave(fase0(ta, 59.12, 59.3)); bandeja = lerp3(bandeja, cafeP(CAFE.balcao[0], CAFE.balcao[1] + 0.008, CAFE.balcao[2]), larga);
  e.bandeja = ta < 59.33 ? bandeja : null;
  if (ta < 59.33) maoNoPonto(P, p, -1, [bandeja[0], bandeja[1] - 0.025, bandeja[2]], [0.4, 0.2, 1.4]);
  // o rosto (é só a garçonete): ao chegar à mesa, a preocupação vira atenção de quem serve, com os olhos na xícara; quando
  // a xícara enche, ela pisca e ergue os olhos para a senhora, e o sorriso leve nasce devagar; pousa o bule sem tirar os
  // olhos dela (a cabeça compensa a inclinação do corpo, para o rosto não sumir) e o sorriso se desfaz numa calma serena,
  // os olhos baixando um pouco para a mesa (de três quartos para a câmera do P15b, longe da lente). As expressões se
  // misturam aos poucos (exprMistura), em vez de trocar de um quadro para o outro. Depois do corte, fora de quadro, a
  // cabeça volta para a frente e ela se vira para a porta
  const vS = suave(fase0(ta, 57.5, 57.8)), sorri = suave(fase0(ta, 57.6, 57.92)), desfaz = suave(fase0(ta, 58.25, 58.58));
  if (ta > 55.9) p.expr = ta < 57.48 ? exprMistura('preocupado', 'atenciosa', suave(fase0(ta, 55.9, 56.3))) : ta < 57.59 ? 'piscar'
    : desfaz > 0 ? exprMistura('sorrisoLeve', 'serena', desfaz) : exprMistura('atenciosa', 'sorrisoLeve', sorri);
  if (ta > 56.2) {
    const sen = cafeP(CAFE.senhora[0], CAFE.senhora[1], CAFE.senhora[2]), bule = cafeP(CAFE.buleMesa[0], CAFE.topoMesa + 0.1, CAFE.buleMesa[1]);
    const solta = suave(fase0(ta, 58.9, 59.3)), baixa = suave(fase0(ta, 58.28, 58.6));
    p.cabYaw = lerp1(olharPara(p, lerp3(lerp3(xic, sen, vS), bule, 0.45 * baixa)), 0, solta);
    p.cabPitch = lerp1(lerp1(lerp1(0.42, 0.05, vS), 0.22, baixa) - 0.45 * curva, 0, solta);
    // as íris vão um pouco mais para o lado da senhora (em quartos, para o cache de texturas)
    p.olhar = Math.round(0.6 * vS * (1 - baixa) * 4) / 4;
  }
  return e;
}
// Depois do café, o cartaz vai na mão D, pendurado ao lado da perna: o punho fechado segura o meio da borda de cima e ele
// fica em pé, paralelo à perna, com a frente para ela, a 25 cm do meio do corpo (passa a 2 cm das toalhas das mesas, em vez
// de abrir para o lado delas). O braço balança pouco com o passo e o cartaz, no próprio plano, um pouco atrasado. Na
// virada do P17a ele passa da pose do fim do café para esta. Junto do avental no chão, o xerife o solta (precisa das mãos):
// o cartaz cai planando, deita de frente para cima e fica no chão, ao lado do caminho, longe do avental e do vestido.
const CARTAZ_X = { solta: 66.62, pousa: 67.3, lado: 0.21, chao: [CX_D - 6.24, PISO + 0.004, 0.6], giroChao: 0.45 };
function cartazNaMao(P, p, ta) {
  const vira = suave(fase0(ta, CAFE.t1x, CAFE.t1x + 0.7)), f = frente(p.yaw);
  const [vx, vz] = velCaminho(X_D, ta), v = Math.hypot(vx, vz), k = Math.min(1, v / 1.5);
  const fase = 2 * Math.PI * (ta > 62.0 && ta < 66.9 && v > 0.3 ? faseCorrida(X_D, ta) : faseCaminho(X_D, ta, 1.05));
  // a pose do fim do café: a mão aberta para o lado e o cartaz quase de frente, 12 cm abaixo dela
  const bal0 = 0.12 * Math.min(1, v / 1.2) * Math.sin(fase), n0 = frente(p.yaw + 0.3), pega0 = noCorpo(p, [0.4, 1.04, 0.15]);
  const c0 = [pega0[0] + n0[0] * 0.05 + f[0] * Math.sin(bal0) * 0.12, pega0[1] - Math.cos(bal0) * 0.12, pega0[2] + n0[1] * 0.05 + f[1] * Math.sin(bal0) * 0.12];
  // ao lado da perna: a mão no referencial do tronco (segue a inclinação da corrida), o cartaz pendurado 3 cm abaixo do punho
  const bal1 = -0.1 * k * Math.cos(fase), pega1 = doTronco(P, p, [CARTAZ_X.lado, -0.1, 0.07 + 0.05 * k * Math.sin(fase)]);
  const c1 = [pega1[0] + f[0] * Math.sin(bal1) * 0.24, pega1[1] - 0.03 - Math.cos(bal1) * 0.24, pega1[2] + f[1] * Math.sin(bal1) * 0.24];
  return { pega: lerp3(pega0, pega1, vira), c: lerp3(c0, c1, vira), yaw: lerpAng(p.yaw + 0.3, p.yaw - Math.PI / 2, vira), bal: lerp1(-bal0, bal1, vira), vira };
}
function cartazXerife(e, ta) {
  if (!e || !e.p || ta < CAFE.t1x || ta > 78) return e;
  const p = e.p, P = e.P;
  if (p.maoD === 'cartaz') p.maoD = null;
  const m = cartazNaMao(P, p, Math.min(ta, CARTAZ_X.solta));
  if (ta < CARTAZ_X.solta) e.cartazX = { c: m.c, yaw: m.yaw, bal: m.bal, deita: 0 };
  else {
    // cai planando: desce devagar no começo, escorrega um pouco para fora e para a frente e deita de frente para cima
    const u = fase0(ta, CARTAZ_X.solta, CARTAZ_X.pousa), M = CARTAZ_X.chao, h = sai(u), oscila = 0.18 * Math.sin(u * Math.PI * 2.2) * (1 - u);
    e.cartazX = { c: [lerp1(m.c[0], M[0], h), lerp1(m.c[1], M[1], Math.pow(u, 1.6)) + 0.03 * Math.sin(u * Math.PI) * (1 - u), lerp1(m.c[2], M[2], h)],
      yaw: lerpAng(m.yaw, m.yaw + CARTAZ_X.giroChao, suave(u)), bal: m.bal * (1 - u) + oscila, deita: suave(fase0(u, 0.05, 0.92)) };
  }
  // a mão: fechada e presa ao cartaz até soltá-lo; depois volta aos poucos à pose
  const w = 1 - suave(fase0(ta, CARTAZ_X.solta, CARTAZ_X.solta + 0.3));
  if (w > 0) { const q = Object.assign({}, p); maoNoPonto(P, q, 1, m.pega, m.vira > 0.5 ? [0.15, 0.1, 0.35] : [1.2, 0.6, 0.5]);
    for (const c of ['ombroD', 'abracoD', 'cotoveloD', 'giroBD']) p[c] = lerp1(p[c] || 0, q[c] || 0, w);
    if (ta < CARTAZ_X.solta) p.fechaD = 1; }
  return e;
}
// o material de quem está no vagão-restaurante (o mesmo dos convidados), para o que o xerife leva e larga
function matGenteD() { return ESTADO.dentroD ? { sol: 0.15, amb: 0.5 * (0.25 + 0.75 * ESTADO.luzD) } : { sol: 1, amb: 1 }; }
// desenha o cartaz do xerife depois do café: na mão, caindo e deitado no chão (referencial do trem)
function desenhaCartazXerife(ta) {
  if (ta < CAFE.t1x || ta > 78) return;
  const ex = estadoXerife(ta); if (!ex || !ex.cartazX) return;
  const base = matGenteD(), X = ex.cartazX, w = [X.c[0] + xLoco(ta), X.c[1] + Y_TRILHO, X.c[2]];
  push(); translate(w[0], w[1], w[2]); rotateY(X.yaw); rotateX(-Math.PI / 2 * X.deita); rotateZ(X.bal || 0);
  push(); scale(0.34, 0.48, 1); md(G.quadro, Object.assign({}, base, { tex: TX.cartaz })); pop();
  // o verso
  push(); translate(0, 0, -0.004); scale(0.34, 0.48, 1); md(G.quadro, Object.assign({}, base, { tinta: [0.82, 0.74, 0.58] })); pop();
  pop(); mat(base);
}
// ---------------------------------------------------------------- o avental da garçonete, no chão e nas mãos do xerife
// No chão do vagão-restaurante, junto da porta do fundo, onde ela o largou (fora de quadro, no P16a): de frente para cima,
// a borda de cima do peitilho para quem chega pelo corredor e o comprimento virado 17 graus para o lado do balcão, sem
// encostar no vestido nem no balcão. o: o meio da borda de cima, no chão; d: do peitilho para a dobra da saia; W: a
// largura (+x do pano). Coordenadas do trem.
const AV_CHAO = { o: [CX_D - 6.634, 0.107], d: [-0.954, -0.3], W: [-0.3, 0.954] };
function avNoChao(x, y, dz) { const q = avChao(x, y, dz), A = AV_CHAO; return [A.o[0] + q[0] * A.W[0] + q[2] * A.d[0], PISO + 0.003 + q[1], A.o[1] + q[0] * A.W[1] + q[2] * A.d[1]]; }
const AV_T = { pega: 67.47, segura: 67.6, abre0: 68.12, abre1: 68.4 };
// abre: o avental se abre de frente para longe dele; baixa: depois da revelação, vai pendurado ao lado do corpo, na mão E
const avAbre = ta => suave(fase0(ta, AV_T.abre0, AV_T.abre1)), avBaixa = ta => suave(fase0(ta, X_REV.fecha0, X_REV.fecha1));
const _n3 = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const _x3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
// Erguido pela mão E (o canto -x da borda de cima do peitilho), o pano vai esticado, em linha reta, do meio da borda de
// cima até onde ainda encosta no chão (yc: o ponto do pano em que o comprimento já erguido iguala a distância até o lugar
// dele no chão); dali em diante continua deitado como estava. Erguido de todo, pende para o ponto da barra no chão e,
// conforme sobe, vai ficando a prumo (solto). O canto livre (+x) cede um pouco (cai), menos perto do chão; o pano gira
// com o corpo dele na borda de cima e acompanha o que ficou no chão embaixo. Aberto (abre), pende reto, de frente para
// longe dele, com as duas mãos nos cantos.
function avContato(Gc) {
  let gA = null;
  for (let i = 0; i <= 87; i++) {
    const y = -i * 0.01, F = avNoChao(0, y, 0), g = -y - Math.hypot(Gc[0] - F[0], Gc[1] - F[1], Gc[2] - F[2]);
    if (g >= 0) { if (i === 0) return { yc: 0, C: F }; const k = gA / (gA - g), yc = y + 0.01 * (1 - k); return { yc, C: avNoChao(0, yc, 0) }; }
    gA = g;
  }
  return null;
}
function estadoAvental(P, p, ta, mE) {
  const kA = avAbre(ta), kL = avBaixa(ta), k = kA * (1 - kL), baixo = [0, -1, 0];
  const Wf = [AV_CHAO.W[0], 0, AV_CHAO.W[1]], Wcima = _n3(lerp3(lerp3(_ry(Wf, p.yaw - YAW_MENOSX), _ry([1, 0, 0], p.yaw), kA), _ry([0, 0, -1], p.yaw), kL));
  const preso = suave(fase0(ta, AV_T.pega, AV_T.segura)), canto = avNoChao(-AV.Wb0, 0, 0);
  const Gp0 = lerp3(canto, [mE[0], mE[1] - 0.03, mE[2]], preso), phi = 0.32 * clamp01((Gp0[1] - PISO) / 0.8) * (1 - k) * (1 - 0.7 * kL);
  const Gc0 = [Gp0[0] + AV.Wb0 * Wcima[0], Gp0[1] - AV.Wb0 * Math.sin(phi), Gp0[2] + AV.Wb0 * Wcima[2]];
  let c = avContato(Gc0), Dn, solto = 0, yc, C;
  if (c && c.yc > -0.005) return null;
  if (c) { Dn = _n3([c.C[0] - Gc0[0], c.C[1] - Gc0[1], c.C[2] - Gc0[2]]); yc = c.yc; }
  else { const Fb = avNoChao(0, AV.fim, 0), dF = [Fb[0] - Gc0[0], Fb[1] - Gc0[1], Fb[2] - Gc0[2]]; solto = suave((Math.hypot(dF[0], dF[1], dF[2]) + AV.fim) / 0.3); Dn = _n3(lerp3(_n3(dF), baixo, solto)); yc = AV.fim; }
  if (kA > 0) { Dn = _n3(lerp3(Dn, baixo, kA)); solto = Math.max(solto, kA); }
  const Wt = _n3([Wcima[0] - Dn[0] * (Wcima[0] * Dn[0] + Wcima[2] * Dn[2]), -Dn[1] * (Wcima[0] * Dn[0] + Wcima[2] * Dn[2]), Wcima[2] - Dn[2] * (Wcima[0] * Dn[0] + Wcima[2] * Dn[2])]);
  const Wtopo = [Wt[0] * Math.cos(phi) + Dn[0] * Math.sin(phi), Wt[1] * Math.cos(phi) + Dn[1] * Math.sin(phi), Wt[2] * Math.cos(phi) + Dn[2] * Math.sin(phi)];
  const N = _n3(_x3(Dn, Wtopo)), Gp = [Gp0[0] + N[0] * 0.015 * k, Gp0[1], Gp0[2] + N[2] * 0.015 * k];
  const Gc = [Gp[0] + AV.Wb0 * Wtopo[0], Gp[1] + AV.Wb0 * Wtopo[1], Gp[2] + AV.Wb0 * Wtopo[2]];
  if (!c) C = [Gc[0] - AV.fim * Dn[0], Gc[1] - AV.fim * Dn[1], Gc[2] - AV.fim * Dn[2]]; else C = c.C;
  return { Gc, Gp, C, yc, Dn, Wf, Wt, phi, solto, N, cantoD: [Gc[0] + AV.Wb0 * Wtopo[0], Gc[1] + AV.Wb0 * Wtopo[1], Gc[2] + AV.Wb0 * Wtopo[2]] };
}
// um ponto do pano (x, y, dz) no referencial do trem, no chão (S nulo) ou erguido
function avPonto(S, x, y, dz) {
  if (!S || y < S.yc) return avNoChao(x, y, dz);
  const q = avPendurado(x, y, dz), t = Math.max(-0.1, Math.min(1, q[1] / S.yc)), a = 1 - Math.max(0, t) * (1 - S.solto), ph = S.phi * a;
  const Wr = _n3(lerp3(S.Wf, S.Wt, a)), W = [Wr[0] * Math.cos(ph) + S.Dn[0] * Math.sin(ph), Wr[1] * Math.cos(ph) + S.Dn[1] * Math.sin(ph), Wr[2] * Math.cos(ph) + S.Dn[2] * Math.sin(ph)], N = _n3(_x3(S.Dn, W));
  return [S.Gc[0] + t * (S.C[0] - S.Gc[0]) + q[0] * W[0] + q[2] * N[0], S.Gc[1] + t * (S.C[1] - S.Gc[1]) + q[0] * W[1] + q[2] * N[1], S.Gc[2] + t * (S.C[2] - S.Gc[2]) + q[0] * W[2] + q[2] * N[2]];
}
// as mãos no avental, depois do cartaz: a E vai ao canto do peitilho no chão, o ergue e o leva ao lado do corpo enquanto ele
// levanta e vira; ao abrir, sobe para a frente do peito, e a D vem buscar o outro canto. Os braços vão por cinemática
// inversa; o pano segue a mão E (estadoAvental), e a D, o canto dele. Na revelação (X_REV), a D solta o canto e a E baixa o
// pano ao lado do corpo, pendurado para trás da mão, e o leva assim até ele sacar o revólver.
// leva a mão ao ponto sempre com o mesmo giro do braço (gi) e a mesma pose de partida: a solução não troca de um quadro para
// o outro (com maoNoPonto, o cotovelo saltava quando o alvo ficava no limite do alcance). Com "alcance" (uma fração do
// braço), um alvo mais longe do ombro é trazido para a reta entre os dois: o braço não estica de todo, e a mão segue
// o corpo até o alvo ficar ao alcance
function maoContinua(P, p, s, w, ini, alcance = 0, gi = 0) {
  let a = paraTronco(P, p, w);
  if (alcance > 0) { const D = P.D, o = [s * D.ombro, D.tronco - 0.05 * D.s, 0], d = [a[0] - o[0], a[1] - o[1], a[2] - o[2]], L = Math.hypot(d[0], d[1], d[2]), M = alcance * (D.braco + D.antebraco + 0.05 * D.s);
    if (L > M) a = [o[0] + d[0] * M / L, o[1] + d[1] * M / L, o[2] + d[2] * M / L]; }
  const r = ikMao(P.D, s, a, ini, gi);
  if (s > 0) { p.ombroD = r.om; p.abracoD = r.ab; p.cotoveloD = r.co; p.giroBD = gi; p.maoD = null; }
  else { p.ombroE = r.om; p.abracoE = r.ab; p.cotoveloE = r.co; p.giroBE = gi; p.maoE = null; }
  return r.erro;
}
function aventalXerife(e, ta) {
  if (!e || !e.p || ta < 67.0 || ta >= X_REV.saca) return e;
  const p = e.p, P = e.P, kA = avAbre(ta), kL = avBaixa(ta);
  const canto = avNoChao(-AV.Wb0, 0, 0), H0 = [canto[0], canto[1] + 0.045, canto[2]], lev = suave(fase0(ta, 67.55, 67.95));
  const leva = noCorpo(p, [-0.27, lerp1(0.72, 1.12, suave(fase0(ta, 67.95, 68.4))), 0.32]), aberto = noCorpo(p, [-AV.Wb0 - 0.06, 1.33, 0.55]), aoLado = noCorpo(p, [-0.27, 1.0, 0.18]);
  const m0 = doTronco(P, p, maoFK(P.D, -1, p.ombroE, p.abracoE || 0, p.cotoveloE, p.giroBE || 0)), H = lerp3(m0, H0, suave(fase0(ta, 67.02, 67.5)));
  const alvo = ta < 67.95 ? lerp3(H, noCorpo(p, [-0.27, 0.72, 0.32]), lev) : lerp3(lerp3(leva, aberto, kA), aoLado, kL);
  const wE = suave(fase0(ta, 67.02, 67.42)), q = Object.assign({}, p);
  maoContinua(P, q, -1, alvo, [0.9, 0.2, 0.5], 0.97);
  for (const c of ['ombroE', 'abracoE', 'cotoveloE', 'giroBE']) p[c] = lerp1(p[c] || 0, q[c] || 0, wE);
  if (ta > 67.4) p.fechaE = 1;
  if (ta < AV_T.pega) return e;
  const mE = doTronco(P, p, maoFK(P.D, -1, p.ombroE, p.abracoE || 0, p.cotoveloE, p.giroBE || 0)), S = estadoAvental(P, p, ta, mE);
  e.avental = S;
  const wD = suave(fase0(ta, 68.0, 68.28)) * (1 - suave(fase0(ta, X_REV.solta0, X_REV.solta1)));
  if (S && wD > 0) { const r = Object.assign({}, p), cD = S.cantoD, eD = maoContinua(P, r, 1, [cD[0] - S.N[0] * 0.015, cD[1] + 0.03, cD[2] - S.N[2] * 0.015], [0.9, 0.0, 0.7], 0, -0.3);
    for (const c of ['ombroD', 'abracoD', 'cotoveloD', 'giroBD']) p[c] = lerp1(p[c] || 0, r[c] || 0, wD);
    if (wD > 0.6 && eD < 0.03) p.fechaD = 1; }
  return e;
}
// desenha o avental do chão até o xerife abri-lo (no referencial do vagão, como os outros objetos dele): a geometria do
// pano em coordenadas próprias (G.aventalErguido) é levada a cada quadro, só quando muda; a carta vai no bolso, com o
// referencial do pano no ponto dela
function desenhaAventalXerife(ta) {
  if (ta <= 59.8 || ta >= X_REV.saca) return;
  const S = ta >= AV_T.pega ? (estadoXerife(ta).avental || null) : null, g = G.aventalErguido, chave = S ? ta : 'chao';
  if (g.__chave !== chave) { const par = g.__par, V = g.vertices; for (let i = 0; i < V.length; i++) { const r = avPonto(S, par[i][0], par[i][1], par[i][2]); V[i].x = r[0]; V[i].y = r[1]; V[i].z = r[2]; } g.dirtyFlags = {}; g.__chave = chave; }
  const base = matGenteD(); push(); translate(-CX_D, 0, 0); md(g, base);
  const c = [0.1, -0.416], P0 = avPonto(S, c[0], c[1], 0.0035), Px = avPonto(S, c[0] + 0.02, c[1], 0.0035), Py = avPonto(S, c[0], c[1] + 0.02, 0.0035);
  const X = _n3([Px[0] - P0[0], Px[1] - P0[1], Px[2] - P0[2]]), Y0 = [Py[0] - P0[0], Py[1] - P0[1], Py[2] - P0[2]], d = Y0[0] * X[0] + Y0[1] * X[1] + Y0[2] * X[2];
  const Y = _n3([Y0[0] - d * X[0], Y0[1] - d * X[1], Y0[2] - d * X[2]]), Z = _x3(X, Y);
  applyMatrix(X[0], X[1], X[2], 0, Y[0], Y[1], Y[2], 0, Z[0], Z[1], Z[2], 0, P0[0], P0[1], P0[2], 1);
  rotateZ(-0.15); scale(0.062, 0.088, 1); md(G.quadro, Object.assign({}, base, { tex: TX.carta })); pop(); mat(base);
}
// desenha o cartaz, o bule, o café caindo e a bandeja (no mundo)
function desenhaCafe(ta) {
  if (ta < CAFE.t0 || ta > Math.max(CAFE.t1j, CAFE.t1x)) return;
  const base = MAT.ultimo || {}, W = v => [v[0] + xLoco(ta), v[1] + Y_TRILHO, v[2]];
  const ex = estadoXerife(ta), ej = estadoJack(ta);
  if (ex && ex.cartaz) { const w = W(ex.cartaz.c);
    push(); translate(w[0], w[1], w[2]); rotateY(ex.cartaz.yaw);
    push(); scale(0.34, 0.48, 1); md(G.quadro, Object.assign({}, base, { tex: TX.cartaz })); pop();
    push(); translate(0, 0, -0.004); scale(0.34, 0.48, 1); md(G.quadro, Object.assign({}, base, { tinta: [0.82, 0.74, 0.58] })); pop(); // o verso, sem impressão
    pop(); }
  if (ej && ej.bule) { const b = ej.bule, w = W(b.pega);
    push(); translate(w[0], w[1], w[2]); rotateY(b.yaw); rotateZ(-b.incl); translate(-BULE.pega[0], -BULE.pega[1], 0); md(G.bule, Object.assign({}, base, { brilho: 1 })); pop();
    if (b.serve) { const a = W(buleMundo(b.pega, b.yaw, b.incl)(BULE.bico)), z = W(b.serve), d = [z[0] - a[0], z[1] - 0.06 - a[1], z[2] - a[2]], L = Math.hypot(...d);
      push(); translate((a[0] + z[0]) / 2, (a[1] + z[1] - 0.06) / 2, (a[2] + z[2]) / 2); rotateY(Math.atan2(d[0], d[2])); rotateX(Math.acos(Math.max(-1, Math.min(1, -d[1] / L)))); scale(0.006, L, 0.006); md(G.cubo, Object.assign({}, base, { tinta: [0.24, 0.13, 0.07] })); pop(); } }
  if (ej && ej.bandeja) { const w = W(ej.bandeja); push(); translate(w[0], w[1], w[2]); rotateY(ej.p.yaw); md(G.bandeja, base); pop(); }
  mat(base);
}

// ================================================================ O BULE E A BANDEJA DA GARÇONETE (Ato 1, antes do café)
// Antes, o bule e a bandeja eram desenhados presos ao antebraço (objetoNaMao): o bule não compensava o ângulo do braço,
// tombava com ele e a alça ficava a 18 cm da mão. Agora, como no café, os dois têm posição própria, presa ao tronco dela
// enquanto anda (acompanham o balanço e a inclinação do corpo), e as mãos vão até eles por cinemática inversa. O bule fica
// de pé, com a alça na mão D, e só inclina quando ela serve o convidado 1 (P09b); a bandeja fica nivelada, com o centro
// sobre a palma da mão E. Quando ela pega os objetos (19,3 e 43,0 s), eles saem de onde a mão estava, sem salto no braço.
const CARGA = {
  bule: [0.3, 0.86, 0.12],      // alça do bule [lado D, altura a partir dos pés, frente] (a mesma posição do café)
  bandeja: [-0.2, 1.17, 0.46],  // centro do fundo da bandeja: onde ela já ficava, do lado E, sem esconder o corpo
  bandejaP07: 1.29,             // no P07 ela leva a bandeja mais alta, na altura do ombro (como antes); desce até 23,9 s
  bracoVitrine: [-0.1, 0.05, 1.5708, -1.62], // na vitrine (P13, no escuro) ela afasta a bandeja para o lado, longe do vidro e do
                                // pedestal: [ombro, abraço, cotovelo, giro] com o braço junto ao corpo e o antebraço para fora
  folga: 0.015,                 // da palma ao fundo da bandeja: o polegar fica dentro da espessura (1,5 cm) da bandeja
  pega: [[19.3, 19.8], [43.0, 43.35]], // quando ela pega a carga: os objetos vão da mão até a posição de carregar
  xicara: [3.58, 0.62],         // a xícara do convidado 1, na beira da mesa 3,4 do lado +z, ao alcance do corredor
  alcance: 0.46,                // do ombro à mão, enquanto serve
  // serve numa altura normal, com o bico 22 cm acima da borda. Antes eram 38 cm, para o bule aparecer no P09b, mas a xícara e
  // o café ficavam abaixo do quadro: via-se só o bule inclinado no ar, na altura do ombro. Agora, enquanto ela serve, o bule
  // fica abaixo do quadro e só o braço estendido entra nele
  altoServe: 0.22,
  serve: { a: 29.3, b: 29.65, c: 30.3, d: 30.6, inclA: 29.6, inclB: 29.78, inclC: 30.14, inclD: 30.3 },
};
function noTronco(P, p, l) { return doTronco(P, p, [l[0], l[1] - P.D.quadril, l[2]]); } // l como em noCorpo, mas presa ao tronco
function maoRoteiro(P, p, s) { // onde a pose do roteiro (antes da cinemática inversa) põe a mão
  return doTronco(P, p, s > 0 ? maoFK(P.D, 1, p.ombroD, p.abracoD, p.cotoveloD, p.giroBD) : maoFK(P.D, -1, p.ombroE, p.abracoE, p.cotoveloE, p.giroBE));
}
function cargaJack(e, ta) {
  if (!e || !e.p || e.P !== G.jack || ta >= CAFE.t0) return e;
  const p = e.p, P = e.P;
  const nomeBandeja = p.maoE === 'bandeja' || p.maoE === 'bandejaCloche' ? p.maoE : null;
  const temBule = !!(p.maoD && p.maoD.nome === 'bule');
  if (!nomeBandeja && !temBule) return e;
  let pegou = 1; for (const [a, b] of CARGA.pega) if (ta >= a && ta < b + 0.5) pegou = suave(fase0(ta, a, b));
  const yawT = p.yaw + (p.torce || 0);
  if (temBule) {
    const S = CARGA.serve, xic = cafeP(CARGA.xicara[0], CAFE.topoMesa, CARGA.xicara[1]);
    const sobe = rampa(ta, S.a, S.b, S.c, S.d), incl = 0.98 * rampa(ta, S.inclA, S.inclB, S.inclC, S.inclD);
    // onde fica a alça para servir: o bico sobre a xícara e a mão a um braço confortável do ombro (CARGA.alcance).
    // A alça está num círculo em volta da xícara (raio = distância horizontal da alça ao bico, com o bule inclinado);
    // fica o ponto desse círculo àquela distância do ombro que está mais à frente dela (o bico aponta para fora, para a xícara)
    const ponta = [xic[0], xic[1] + 0.012 + 0.062 + CARGA.altoServe, xic[2]];
    const g1 = buleMundo([0, 0, 0], 0, 0.98)(BULE.bico), r = Math.hypot(g1[0], g1[2]), hy = ponta[1] - g1[1];
    const ombroW = doTronco(P, p, [P.D.ombro, P.D.tronco - 0.05 * P.D.s, 0]); // o ombro D, no referencial do trem
    const dh = Math.sqrt(Math.max(0.01, CARGA.alcance ** 2 - (hy - ombroW[1]) ** 2)), ux = xic[0] - ombroW[0], uz = xic[2] - ombroW[2], L = Math.hypot(ux, uz);
    const a = Math.max(L - r, Math.min(L + r, (dh * dh - r * r + L * L) / (2 * L))), hp = Math.sqrt(Math.max(0, dh * dh - a * a));
    let px = -uz / L, pz = ux / L; if (px * Math.sin(p.yaw) + pz * Math.cos(p.yaw) < 0) { px = -px; pz = -pz; }
    const alca = [ombroW[0] + ux / L * a + px * hp, hy, ombroW[2] + uz / L * a + pz * hp];
    const dirServe = Math.atan2(xic[0] - alca[0], xic[2] - alca[2]) - Math.PI / 2; // o bico aponta da alça para a xícara
    const g0 = buleMundo([0, 0, 0], dirServe, 0.98)(BULE.bico);
    const sobreXic = [ponta[0] - g0[0], ponta[1] - g0[1], ponta[2] - g0[2]];
    // na ida o bule sobe antes de avançar sobre a mesa e, na volta, recua antes de descer (em linha reta, com o bule mais
    // baixo, ele voltava rente à xícara, a 4 mm dela; assim passa a 2,4 cm)
    const c0 = lerp3(maoRoteiro(P, p, 1), noTronco(P, p, CARGA.bule), pegou), kH = sobe * sobe, kV = 1 - (1 - sobe) * (1 - sobe);
    const pega = [lerp1(c0[0], sobreXic[0], kH), lerp1(c0[1], sobreXic[1], kV), lerp1(c0[2], sobreXic[2], kH)];
    e.bule = { pega, yaw: lerpAng(yawT - Math.PI / 2, dirServe, sobe), incl, serve: incl > 0.8 ? [xic[0], xic[1] + 0.05, xic[2]] : null }; // o café cai até dentro da xícara
    // a mão D na alça: ombro, abraço e cotovelo com o braço sem giro (solução única, contínua de um quadro para o outro)
    const rb = ikMao(P.D, 1, paraTronco(P, p, pega), [0.6, 0.15, 0.9], 0);
    p.ombroD = rb.om; p.abracoD = rb.ab; p.cotoveloD = rb.co; p.giroBD = 0; p.maoD = null; p.fechaD = true;
  }
  if (nomeBandeja) {
    const h = maoRoteiro(P, p, -1); let ini = [p.ombroE, p.abracoE, p.cotoveloE, p.giroBE];
    const lb = CARGA.bandeja.slice(); lb[1] = lerp1(CARGA.bandejaP07, lb[1], suave(fase0(ta, 23.3, 23.9)));
    let b = lerp3([h[0], h[1] + CARGA.folga, h[2]], noTronco(P, p, lb), pegou);
    const kV = rampa(ta, 46.45, 47.0, 48.9, 49.45); // na vitrine: a bandeja vai para onde a pose de CARGA.bracoVitrine põe a mão
    if (kV > 0) { const V = CARGA.bracoVitrine, hv = doTronco(P, p, maoFK(P.D, -1, V[0], V[1], V[2], V[3]));
      b = lerp3(b, [hv[0], hv[1] + CARGA.folga, hv[2]], kV); ini = ini.map((v, i) => lerp1(v || 0, V[i], kV)); }
    e.bandeja = b; e.bandejaNome = nomeBandeja; e.bandejaYaw = yawT;
    maoPalma(P, p, -1, [b[0], b[1] - CARGA.folga, b[2]], [0, 1, 0], ini); // a palma para cima, sob o centro
  }
  return e;
}
// desenha a carga (no mundo) e a xícara do convidado 1, que se enche quando ela serve
function desenhaCargaJack(ta) {
  if (ta >= 77.5) return;
  const base = MAT.ultimo || {}, W = v => [v[0] + xLoco(ta), v[1] + Y_TRILHO, v[2]], S = CARGA.serve;
  { const x = W(cafeP(CARGA.xicara[0], CAFE.topoMesa, CARGA.xicara[1])); push(); translate(x[0], x[1], x[2]); rotateY(-0.5); md(G.xicara, Object.assign({}, base, { brilho: 1 }));
    const nivel = clamp01((ta - S.inclB) / (S.inclC - S.inclB)); if (nivel > 0) { translate(0, 0.019 + 0.034 * nivel, 0); scale(0.027 + 0.011 * nivel, 1, 0.027 + 0.011 * nivel); md(G.disco, Object.assign({}, base, { tinta: [0.22, 0.12, 0.06] })); } pop(); }
  if (ta >= CAFE.t0) { mat(base); return; }
  const ej = estadoJack(ta);
  if (ej && ej.bule) { const b = ej.bule, w = W(b.pega);
    push(); translate(w[0], w[1], w[2]); rotateY(b.yaw); rotateZ(-b.incl); translate(-BULE.pega[0], -BULE.pega[1], 0); md(G.bule, Object.assign({}, base, { brilho: 1 })); pop();
    if (b.serve) { const a = W(buleMundo(b.pega, b.yaw, b.incl)(BULE.bico)), z = W(b.serve), d = [z[0] - a[0], z[1] - a[1], z[2] - a[2]], L = Math.hypot(...d);
      push(); translate((a[0] + z[0]) / 2, (a[1] + z[1]) / 2, (a[2] + z[2]) / 2); rotateY(Math.atan2(d[0], d[2])); rotateX(Math.acos(Math.max(-1, Math.min(1, -d[1] / L)))); scale(0.006, L, 0.006); md(G.cubo, Object.assign({}, base, { tinta: [0.24, 0.13, 0.07] })); pop(); } }
  if (ej && ej.bandeja) { const w = W(ej.bandeja); push(); translate(w[0], w[1], w[2]); rotateY(ej.bandejaYaw); md(G[ej.bandejaNome], base); pop(); }
  mat(base);
}

// ---------------------------------------------------------------- Barão
// no P09c ele sai pela porta da frente: para diante dela (30,65 s) e a empurra com a mão direita na maçaneta; passa para a
// plataforma da ponta, para fora do giro da folha, vira e a puxa pela maçaneta de fora, com a mão direita, até quase fechar
// (o resto ela fecha sozinha, no embalo); então passa por trás do vidro dela para o lado da estação, onde espera o trem
// parar (antes ele sumia em 31 s, ao chegar à porta). O ponto em 30,65 segue a direção de antes (a tangente em 29,2 não
// muda). B_SAI é o corte para o P10: até ali ele fica no referencial do trem; depois, na plataforma da estação (B_PLAT)
const B_SAI = 33.84;
const B_D = [[0, 4.08, -0.92], [23.7, 4.08, -0.92], [24.3, 4.6, -0.35], [27.5, 4.6, -0.35], [29.2, 6.4, -0.1], [30.65, 7.125, -0.0194], [30.75, 7.125, -0.0194],
  [31.85, 8.05, -0.5], [32.45, 8.05, -0.5], [34.25, 8.0, 1.3]];
// uma maçaneta da porta da frente do restaurante (sx = 1 a de fora, -1 a de dentro), no referencial do trem
function macanetaDFrente(ta, sx) { const v = _ry([sx * 0.06, 0.98, -0.8], -portaDFrente(ta)); return dLocal(7.5 + v[0], PISO - 0.04 + v[1], 0.45 + v[2]); }
// leva o braço (s = 1 direito, -1 esquerdo) até o ponto w, na medida k (0 deixa o braço da caminhada)
function bracoAte(P, p, s, w, k) {
  if (k <= 0) return; const r = ikMao(P.D, s, paraTronco(P, p, w), [0.7, 0.2, 0.5], 0), L = s > 0 ? 'D' : 'E';
  p['ombro' + L] = lerp1(p['ombro' + L], r.om, k); p['abraco' + L] = lerp1(p['abraco' + L], r.ab, k); p['cotovelo' + L] = lerp1(p['cotovelo' + L], r.co, k); p['giroB' + L] = lerp1(p['giroB' + L] || 0, 0, k);
}
// na plataforma: desce na porta da frente do restaurante e vai até a janela dela (de fora, ela só é vista quase de frente),
// onde para, de frente para o trem, e confere o relógio de bolso (P11)
const B_PLAT = [[31.0, -22.3, 2.8], [32.2, -22.9, 3.6], [35.6, -29.6, 4.45], [36.6, -30.85, 4.55], [60, -30.85, 4.55]];
function estadoBaraoBruto(ta) {
  if (ta < B_SAI) {
    const [x, z] = trilhaH(B_D, ta), [vx, vz] = velCaminho(B_D, ta), v = Math.hypot(vx, vz), w = suave(v / 0.5);
    const p = poseDe(G.barao, 0, 0, 0, YAW_MENOSX); const wp = dLocal(x, PISO, z); p.x = wp[0]; p.y = wp[1]; p.z = wp[2];
    andar(p, faseCaminho(B_D, ta, 0.9), suave(v / 1.0));
    if (ta < 23.75) { sentar(p); p.x -= 0.04; p.maoD = 'taca'; p.ombroD = 0.4; p.cotoveloD = 1.0; p.cabYaw = Math.sin(ta * 0.4) * 0.3; }
    else if (ta < 27.6) { respira(p, ta, 1 - w); p.maoD = 'taca'; p.ombroD = 2.3 * suave(fase0(ta, 24.4, 25.0)) * (1 - suave(fase0(ta, 27.0, 27.6))) + 0.4; p.cotoveloD = 0.4; p.ombroE = 0.6; p.cotoveloE = 0.9; p.abracoE = 0.5; p.cabYaw = Math.sin(ta * 1.1) * 0.4; }
    // parado, olha para -x (para o vagão) até sair da mesa; depois, para a porta e, na plataforma da ponta, para a folha que ele puxa
    const yawParado = ta < 29.0 ? YAW_MENOSX : lerpAng(YAW_MAISX, -0.75, suave(fase0(ta, 31.35, 31.95)));
    p.yaw = lerpAng(yawParado, Math.atan2(vx, vz), w); p.__vel = v; p.expr = ta < 27.6 ? 'sorriso' : 'neutro';
    // já na plataforma da ponta, vira de volta para a porta enquanto chega (o giro leva 0,6 s, não só o fim da freada)
    if (ta > 31.3 && ta < 32.75) p.yaw = lerpAng(p.yaw, -0.75, suave(fase0(ta, 31.35, 31.95)) * (1 - suave(fase0(ta, 32.4, 32.75))));
    return { P: G.barao, p, onde: 'D' };
  }
  const [x, z] = trilhaH(B_PLAT, ta), [vx, vz] = velCaminho(B_PLAT, ta), v = Math.hypot(vx, vz), w = suave(v / 0.5);
  const p = poseDe(G.barao, x, 0.8, z, 0);
  andar(p, faseCaminho(B_PLAT, ta, 0.9), suave(v / 1.0)); respira(p, ta, 1 - w);
  p.cabYaw = 0.3 * (1 - w);
  // confere o relógio de bolso (no P11, visto por trás, com ela na janela)
  if (ta > 36.6 && ta < 39.2) { const k = rampa(ta, 36.6, 37.0, 38.7, 39.2); p.ombroD = lerp1(p.ombroD, 1.1, k); p.cotoveloD = lerp1(p.cotoveloD, 1.6, k); p.maoD = k > 0.4 ? 'relogioBolso' : null; p.cabPitch = 0.35 * k; p.cabYaw *= 1 - k; }
  // parado, fica de frente para o trem, para a janela dela (antes ficava de costas para o trem)
  const jw = xLoco(ta) + CX_D + JANELA_P11[0], vira = suave(fase0(ta, 35.4, 36.5)), yawPara = lerpAng(-0.4, Math.atan2(jw - x, JANELA_P11[1] - z), vira);
  p.yaw = lerpAng(yawPara, Math.atan2(vx, vz), w); p.__vel = v; p.expr = (ta > 36.7 && ta < 39.4) ? 'maroto' : 'neutro';
  return { P: G.barao, p, onde: 'mundo' };
}
// a mão direita na maçaneta da porta da frente, por dentro (ele empurra) e por fora (ele puxa): depois da média no tempo da pose,
// para a mão ficar nela
function estadoBarao(ta) {
  const e = suavizaPose(estadoBaraoBruto, ta);
  if (e.onde === 'D' && ta > 30.3 && ta < 32.6) { bracoAte(G.barao, e.p, 1, macanetaDFrente(ta, -1), rampa(ta, 30.4, 30.62, 30.9, 31.1)); bracoAte(G.barao, e.p, 1, macanetaDFrente(ta, 1), rampa(ta, 31.7, 31.95, 32.3, 32.5)); }
  return e;
}

// ajudantes: dois procuram no vagão, três esperam no teto do vagão dos cavalos
// O primeiro para no corredor, junto da mesa vazia (3,4 do lado -z); o segundo passa pela vitrine longe do canto (antes o braço
// direito raspava nela) e para um passo mais atrás, para a aba do chapéu não entrar no vidro
const A_D0 = [[62.2, 7.4, 0.0], [62.5, 7.2, 0.0], [63.35, 4.05, 0.27], [77.45, 4.05, 0.27]], A_D1 = [[62.5, 7.4, 0.0], [62.8, 7.2, 0.0], [63.3, 6.0, 0.03], [63.7, 5.2, 0.22], [77.45, 5.2, 0.22]];
// o leque, do lado deles: relaxam quando ela se rende; as cartas explodem nos rostos e eles se encolhem, viram o rosto,
// cobrem-no com a mão esquerda e espantam as cartas com a direita (a da arma); o da frente tenta pegar uma e erra.
// Quando as cartas passam, baixam os braços, cobertos de cartas, e o telhado está vazio.
function reagemCartas(p, ta, k, x, z, dy) {
  const P = G.ajudantes[k + 1], tI = tImpacto(k), rende = suave(fase0(ta, 98.7, 99.0));
  p.ombroD = lerp1(p.ombroD, 0.5, 0.6 * rende); p.cotoveloD = lerp1(p.cotoveloD, 0.6, 0.6 * rende); // a arma baixa
  if (ta < 100.8) p.expr = ta < LEQUE.solta ? (rende > 0.5 ? 'sorriso' : 'determinado') : ta < tI ? 'surpresa' : 'esforco';
  const vem = rampa(ta, LEQUE.solta, tI - 0.06, tI - 0.02, tI + 0.06); p.cabPitch = lerp1(p.cabPitch, -0.22, vem); // veem as cartas chegando
  const sai = 100.5 + 0.07 * k, cobre = rampa(ta, tI - 0.03, tI + 0.09, sai, sai + 0.35);
  if (cobre > 0) {
    p.inclina = (p.inclina || 0) - 0.16 * cobre; p.cabPitch = lerp1(p.cabPitch, 0.28, cobre); p.cabYaw = lerp1(p.cabYaw, k === 1 ? 0.5 : -0.45, cobre);
    const alvo = doCabeca(P, p, [k === 1 ? 0.035 : -0.035, 0.1 * P.D.s, 0.19]), ik = ikMao(P.D, -1, paraTronco(P, p, alvo), [1.9, 0.25, 2.0], 0);
    p.ombroE = lerp1(p.ombroE, ik.om, cobre); p.abracoE = lerp1(p.abracoE, ik.ab, cobre); p.cotoveloE = lerp1(p.cotoveloE, ik.co, cobre); p.giroBE = lerp1(p.giroBE || 0, 0, cobre);
    const fq = 15 + 2.5 * k, sw = Math.sin((ta - tI) * fq + k);
    p.ombroD = lerp1(p.ombroD, 1.75 + 0.5 * sw, cobre); p.cotoveloD = lerp1(p.cotoveloD, 1.2 + 0.4 * Math.sin((ta - tI) * fq + k + 1.2), cobre); p.abracoD = lerp1(p.abracoD, 0.28 + 0.18 * sw, cobre);
  }
  if (k === 0) { // o da frente tenta agarrar uma carta no ar, para cima e à frente, e fecha a mão no vazio
    const pega = rampa(ta, 99.7, 99.8, 99.95, 100.1);
    p.ombroE = lerp1(p.ombroE, 2.75, pega); p.cotoveloE = lerp1(p.cotoveloE, 0.25, pega); p.abracoE = lerp1(p.abracoE, 0.05, pega); p.cabPitch = lerp1(p.cabPitch, -0.35, pega); p.cabYaw = lerp1(p.cabYaw, -0.2, pega);
  }
  const confusa = suave(fase0(ta, 101.0 + k * 0.08, 101.3 + k * 0.08)); // de volta: o telhado vazio
  if (confusa > 0) {
    if (k === 0) { p.ombroE = lerp1(p.ombroE, 2.75, confusa); p.cotoveloE = lerp1(p.cotoveloE, 2.45, confusa); p.abracoE = lerp1(p.abracoE, 0.45, confusa); p.expr = 'preocupado'; } // coça a cabeça
    else if (k === 1) { for (const s of ['E', 'D']) { p['ombro' + s] = lerp1(p['ombro' + s], 0.5, confusa); p['cotovelo' + s] = lerp1(p['cotovelo' + s], 1.75, confusa); p['abraco' + s] = lerp1(p['abraco' + s] || 0, 0.62, confusa); }
      p.cabYaw = 0.35 * confusa; p.expr = 'surpresa'; } // dá de ombros
    else { p.cabYaw = 0.85 * Math.sin((ta - 101.0) * 4.5) * confusa; p.expr = 'surpresa'; } // olha em volta
  }
}
function estadoAjudantes(ta) {
  const R = [];
  if (ta > 62.2 && ta < 77.45) {
    for (const [k, K] of [[0, A_D0], [1, A_D1]]) {
      if (ta < K[0][0]) continue; // cada um entra na hora do próprio caminho (antes, o segundo esperava parado em cima do primeiro)
      const [x, z] = trilhaH(K, ta), [vx, vz] = velCaminho(K, ta), v = Math.hypot(vx, vz), w = dLocal(x, PISO, z);
      // ao frear, o corpo gira aos poucos para onde ele fica (antes virava de uma vez, no quadro em que a velocidade caía abaixo de 0,3)
      const p = poseDe(G.ajudantes[k], w[0], w[1], w[2], lerpAng(k === 0 ? Math.PI + 0.8 : 0.96, Math.atan2(vx, vz), suave(Math.min(1, v / 1.5))));
      if (v > 0.3) correr(p, faseCorrida(K, ta), Math.min(1, v / 3.5), v, G.ajudantes[k]); else respira(p, ta + k, 1.2);
      p.maoD = 'revolver'; p.ombroD = lerp1(p.ombroD, 0.9, 0.6); p.cotoveloD = lerp1(p.cotoveloD, 0.6, 0.6); p.expr = 'determinado';
      if (k === 0) {
        // ajoelha no corredor, meio de lado para a mesa vazia, e espia por baixo dela: o joelho esquerdo no chão, o pé direito
        // plantado, a mão esquerda apoiada no piso e o revólver pendendo diante do joelho direito. A cabeça e a aba do chapéu ficam
        // fora da toalha (antes ele se agachava de frente para a mesa, a cabeça entrava na toalha e o pé direito afundava no piso)
        const a = rampa(ta, 63.35, 63.8, 66.6, 67.2), inc = 1.25 * a, q = 0.4 * inc;
        p.sentado = a; p.bob = lerp1(p.bob, 0.03, a); p.inclina = inc;
        p.quadD = lerp1(p.quadD, 1.54 + q, a); p.joelhoD = lerp1(p.joelhoD, 1.54, a); p.quadE = lerp1(p.quadE, 0.1 + q, a); p.joelhoE = lerp1(p.joelhoE, 0.1 + Math.PI / 2, a);
        p.cabPitch = -0.35 * a; p.cabYaw = (-0.6 + 0.25 * Math.sin(ta * 1.6)) * a;
        if (a > 0) {
          const Pa = G.ajudantes[0], Da = Pa.D, f = frente(p.yaw), dx = f[1], dz = -f[0];
          // na descida e na subida, a mistura dos ângulos afundava o pé direito até 13 cm no piso: o quadril sobe o que faltar
          const pe = Math.min(peMundo(Pa, p, -1)[1], peMundo(Pa, p, 1)[1]) - p.y;
          if (pe < 0) p.bob -= pe;
          // [lado, distância para o lado direito, para a frente, altura, chute inicial]: a mão esquerda no piso, à frente; a direita, com
          // o revólver, pende diante do joelho, o antebraço apoiado nele
          for (const [s, ld, fr, y, ini] of [[-1, -0.18, 0.5, 0.03, [1.2, 0.1, 0.3]], [1, 0.24, 0.55, 0.3, [0.8, 0.1, 1.5]]]) {
            const ik = ikMao(Da, s, paraTronco(Pa, p, [p.x + dx * ld + f[0] * fr, p.y + y, p.z + dz * ld + f[1] * fr]), ini), S = s < 0 ? 'E' : 'D';
            p['ombro' + S] = lerp1(p['ombro' + S], ik.om, a); p['abraco' + S] = lerp1(p['abraco' + S] || 0, ik.ab, a); p['cotovelo' + S] = lerp1(p['cotovelo' + S], ik.co, a); p['giroB' + S] = lerp1(p['giroB' + S] || 0, 0, a);
          }
        }
      } else { // examina a vitrine arrombada
        const a = rampa(ta, 63.7, 64.1, 76.8, 77.2); p.inclina = 0.28 * a; p.ombroE = lerp1(p.ombroE, 1.65, a); p.cotoveloE = lerp1(p.cotoveloE, 2.3, a); p.cabYaw = Math.sin(ta * 0.9) * 0.3 * a; p.cabPitch = 0.2 * a;
      }
      R.push({ P: G.ajudantes[k], p, onde: 'D' });
    }
  }
  if (ta > 96 && ta < 106) {
    const tetoS = ALT.parede + 0.18;
    // espalhados pelo teto, cada um numa pose de pistoleiro: em pé com a mão na cintura, agachado com as duas mãos, ajoelhado
    [[-86.2, -0.78, 0.18], [-87.5, 0.62, -0.14], [-88.9, -0.12, 0.06]].forEach(([x, z, dy], k) => {
      const p = poseDe(G.ajudantes[k + 1], x, tetoS, z, YAW_MAISX + dy);
      respira(p, ta + k * 1.3); p.maoD = 'revolver'; p.ombroD = 1.45; p.cotoveloD = 0.08; p.cabYaw = Math.sin(ta * 0.7 + k) * 0.08;
      if (k === 0) { p.abreE = 0.24; p.abreD = 0.24; p.ombroE = 0.3; p.abracoE = 0.85; p.cotoveloE = 2.0; p.giroBE = 0.6; p.expr = 'raiva'; }
      else if (k === 1) { p.quadE = p.quadD = 0.75; p.joelhoE = p.joelhoD = 1.15; p.abreE = p.abreD = 0.18; p.inclina = 0.3; p.bob = -0.22; p.ombroE = 1.35; p.cotoveloE = 0.3; p.abracoE = -0.32; p.ombroD = 1.38; p.abracoD = -0.08; p.expr = 'determinado'; }
      else { p.sentado = 1; p.inclina = 0.25; p.quadE = 0.31; p.quadD = 1.41; p.joelhoE = 1.6; p.joelhoD = 1.35; p.ombroD = 1.35; p.ombroE = 0.6; p.cotoveloE = 1.4; p.expr = 'determinado'; }
      if (ta > 98.6 && ta < 103.9) reagemCartas(p, ta, k, x, z, dy);
      if (ta > 103.9) { const u = suave(fase0(ta, 103.9 + k * 0.12, 104.6 + k * 0.12)); p.yaw = YAW_MAISX + dy + Math.PI * u; p.expr = 'surpresa'; }
      R.push({ P: G.ajudantes[k + 1], p, onde: 'trem' });
    });
  }
  return R;
}

// ================================================================ CAVALOS E ATO 3
// Os cavalos do vagão S (coordenadas locais do vagão: centro em x = -84,1): o preto, dela, e os três do grupo do xerife.
const CX_S = (carro('S').x0 + carro('S').x1) / 2;
// trajeto de Jack a cavalo no mundo, depois do salto (tempo da ação)
const SALTO = { sai: 123.55, cai: 124.95 };
function portaMundo(t) { return [xLoco(t) + CX_S, Y_TRILHO + ALT.piso, -1.5]; }
// Do pouso à beira da garganta, sem voltas: ela pousa ao sul dos trilhos ainda com o embalo do trem, faz uma curva
// suave para o sul enquanto desacelera e segue reto para o cânion, num trote leve (uns 3,7 m/s), abrindo o diamante e estudando
// a bomba, a leste do muro baixo de pedras. O grupo do xerife sai do trem e vem atrás dela; a bala atravessa o chapéu
// enquanto ela ainda olha a bomba. Ela guarda o diamante, se abaixa, acelera e vira para oeste, entre o muro e a beira,
// até o ponto de antes. Do 148,6 em diante os pontos são os de antes: o P43 começa igual.
const TRAJ_JACK = [];
// distância acumulada de cada trajeto antigo em 149,4 s: a fase do galope chega ao P43 igual à de antes
const DIST_P43 = { jack: 220.07 };
const FASE_J = { d: 0 };
// a fase da passada de cada um do grupo: a correção desde o pouso (a de antes, quando cada trajeto antigo chegava ao P43)
// e [t, número de passadas de antes em t], com t a partir de onde o trajeto é o de antes (o que os trajetos novos mudam é
// acertado do P40 até t): do P43 em diante as pernas são as de antes
const FASE_G = { xerife: -9.0573, ajud: -0.29056, ajud2: 0 };
const PASSO_P43 = { xerife: [149.4, 28.20271], ajud: [149.4, 28.83739], ajud2: [151.5, 28.90364] };
// O grupo do xerife (ele e dois ajudantes, que desceram do teto) monta no vagão S enquanto o trem freia, e cada cavalo
// sai da baia e salta pela porta, como ela fez. Depois do pouso, cada um vira para sudoeste e vem atrás dela; os do
// xerife e do primeiro ajudante, a partir de 147,5, são os de antes. O terceiro cavalo fica na baia do fundo desde o Ato 2.
const SALTO_G = 0.6; // o salto pela porta (rápido: saem atrás dela)
const TRAJ_XERIFE = [[139.8, 1158, -11], [140.8, 1139, -17], [141.8, 1120, -24.5], [142.6, 1105.5, -31.5], [143.2, 1096, -37.5], [144.2, 1087.5, -49.5], [145.3, 1086, -63], // no tiro, quase atrás dela
  [146.4, 1080.5, -81], [147.5, 1064, -94], [148.6, 1038, -106], [149.4, 1020, -114], [150.4, 1004, -100], [151.6, 992, -110], [152.6, 990, -119], [153.4, 989, -121]];
const TRAJ_AJUD = [[140.3, 1162, -10], [141.3, 1148.5, -16.5], [142.3, 1135, -24], [143.2, 1123.5, -32], [144.3, 1110, -44], [145.4, 1098, -58], [146.5, 1088, -80],
  [147.6, 1068, -101], [148.6, 1044, -112], [149.4, 1026, -118], [150.4, 1012, -111.5], [151.3, 1004.6, -108.8], [152.2, 1001.6, -110.5], [152.9, 1001.7, -112.0], [153.4, 1001.8, -112.4], [200, 1001.8, -112.4]]; // para ao norte dela
const TRAJ_AJUD2 = [[140.85, 1164, -12], [141.9, 1151, -19], [142.9, 1138.5, -27], [143.8, 1127, -35], [144.9, 1113, -47], [146.0, 1100, -63], [147.1, 1088, -84],
  [148.2, 1065, -100], [149.3, 1046, -104], [150.6, 1034, -104], [151.5, 1027.5, -106.5], [152.3, 1022.4, -110.2], [153.0, 1019.3, -112.6], [153.5, 1018.4, -113.3], [200, 1018.4, -113.3]]; // para a nordeste dela
// o V do grupo pelo furo do chapéu: o xerife à frente e um ajudante de cada lado, meio corpo atrás ([t, atrás, lado], em
// metros; lado + à direita dele). O da direita, depois, perde terreno e volta ao caminho de antes (ajud2Depois: [t, x, z])
const V_GRUPO = { ajud: [[144.6, 3.4, -3.3], [145.3, 3.4, -3.3], [146.0, 3.4, -3.3], [146.7, 3.3, -3.4], [147.3, 3.0, -4.8], [147.9, 2.8, -6.6]], // o da esquerda abre aos poucos na virada, até o lugar de antes
  ajud2: [[145.4, 4.2, 3.4], [146.0, 3.6, 3.3], [146.7, 3.5, 3.3], [147.3, 4.8, 3.0]],
  ajud2Depois: [[148.3, 1058.0, -96.5], [149.0, 1049.5, -102.5], [149.6, 1042.5, -104.2]] }; // o da direita desacelera (no P42a, fora de quadro) e volta ao caminho de antes
const GRUPO = [
  { id: 'xerife', P: () => G.xerife, C: () => G.cavalos[0], baia: 2.9, pesc: [0.7, 1], sai: 137.45, salta: 138.15, dx: -0.4, traj: TRAJ_XERIFE },
  { id: 'ajud', P: () => G.ajudantes[1], C: () => G.cavalos[1], baia: 5.4, pesc: [0.9, 2], sai: 137.95, salta: 138.7, dx: -0.8, traj: TRAJ_AJUD },
  { id: 'ajud2', P: () => G.ajudantes[2], C: () => G.cavalos[2], baia: -5.3, pesc: [0.8, 3], sai: 138.35, salta: 139.25, dx: -1.2, traj: TRAJ_AJUD2 },
];
function preparaTrajetos() {
  if (TRAJ_JACK.length) return;
  const x0 = portaMundo(SALTO.sai)[0] + 14 * (SALTO.cai - SALTO.sai) * 0.9; // continua exatamente de onde o voo termina
  TRAJ_JACK.push([SALTO.cai, x0, -9.5], [125.6, x0 + 7.5, -14.5],
    [126.1, 1072.0, -19.2], [126.6, 1075.7, -24.4], [127.1, 1078.1, -29.4], [127.6, 1079.5, -33.9], [128.1, 1080.1, -37.7], [128.6, 1080.4, -40.7], // a curva, freando
    [129.1, 1080.6, -43.0], [129.6, 1080.7, -44.9], [130.1, 1080.8, -46.8], [130.6, 1080.9, -48.6], [131.1, 1080.9, -50.4], [131.6, 1081.0, -52.3], // a trote, para o sul
    [132.1, 1081.0, -54.1], [132.6, 1081.0, -56.0], [133.1, 1081.0, -57.8], [133.6, 1081.0, -59.6], [134.1, 1081.0, -61.5], [134.6, 1081.0, -63.3], // o diamante e a bomba
    [135.1, 1081.0, -65.2], [135.6, 1081.0, -67.0], [136.1, 1081.0, -68.8], [136.6, 1081.0, -70.7], [137.1, 1081.0, -72.5], [137.6, 1081.0, -74.4],
    [138.1, 1081.0, -76.2], [138.6, 1081.0, -78.0], [139.1, 1081.0, -79.9], [139.6, 1081.0, -81.7], [140.1, 1081.1, -83.6], [140.6, 1081.1, -85.4],
    [141.1, 1081.1, -87.3], [141.6, 1081.1, -89.1], [142.1, 1081.0, -90.9], [142.6, 1080.9, -92.8], [143.1, 1080.8, -94.6], [143.6, 1080.6, -96.5], // a bala
    [144.1, 1080.3, -98.3], [144.6, 1079.8, -100.1], [145.1, 1078.5, -102.6], [145.6, 1075.1, -105.9], [146.1, 1068.5, -108.3], [146.6, 1059.8, -109.6], // ela acelera e vira para oeste, entre o muro de pedras e a beira
    [147.1, 1050.4, -110.0], [147.6, 1040.9, -109.9], [148.1, 1031.4, -109.3],
    [148.6, 1022, -108], [149.4, 1006, -106], [149.9, 1002, -96], [151.0, 999, -108], [152.6, 1005, -123.4], [153.2, 1006.0, -125.0]);
  FASE_J.d = DIST_P43.jack - distCurva(TRAJ_JACK, 149.4);
  // o V: do pouso até o P40 os ajudantes seguem os pontos de antes (o P39 não muda); depois apertam o galope e chegam
  // aos lados do xerife a tempo de aparecerem pelo furo do chapéu. O da esquerda segue com ele até a beira (os pontos de
  // antes, de 147,6 em diante); o da direita fica para trás depois da virada e chega por último, como antes
  poeEmV(TRAJ_AJUD, 141.3, V_GRUPO.ajud, 148.6);
  poeEmV(TRAJ_AJUD2, 141.9, V_GRUPO.ajud2, 150.6, V_GRUPO.ajud2Depois);
  for (const g of GRUPO) { // o pouso de cada salto pela porta abre o trajeto
    g.traj.unshift([g.salta + SALTO_G, xLoco(g.salta) + CX_S + g.dx + vTrem(g.salta) * SALTO_G * 0.9, -6.5]);
    g.fase = FASE_G[g.id]; // a fase da passada acertada desde o pouso (a de antes: o P39 não muda)
    const [tp, np] = PASSO_P43[g.id]; g.tAjuste = tp; g.ajuste = (np - passoGrupo(g.traj, tp, g.fase, g.salta + SALTO_G)) * 5.2; // e o que os trajetos novos mudaram, acertado do P40 em diante: o P43 começa igual
  }
}
// um ponto do V, sobre o trajeto do xerife: atrás dele e ao lado (+ à direita), em metros
function emV(t, atras, lado) {
  const s = curva(TRAJ_XERIFE, t), d = frente(rumo(u => curva(TRAJ_XERIFE, u), t, 0.3).yaw);
  return [s[0] - d[0] * atras + d[1] * lado, s[1] - d[1] * atras - d[0] * lado];
}
// troca os pontos de um ajudante entre ate0 e depois: três pontos de passagem (do trajeto antigo para o V, aos poucos e
// quase por igual, para a velocidade não dar pico), os do V ([t, atrás, lado]) e, se houver, pontos soltos até voltar ao
// trajeto antigo
function poeEmV(traj, ate0, vk, depois, soltos = []) {
  const velho = traj.slice(), f = t => curva(velho, t), t1 = vk[0][0], meio = [];
  for (const k of [1, 2, 3]) { const t = ate0 + (t1 - ate0) * k / 4, w = 0.6 * k / 4 + 0.4 * suave(k / 4), a = f(t), b = emV(t, vk[0][1], vk[0][2]); meio.push([t, lerp1(a[0], b[0], w), lerp1(a[1], b[1], w)]); }
  const novo = [...velho.filter(k => k[0] <= ate0), ...meio, ...vk.map(([t, at, la]) => [t, ...emV(t, at, la)]), ...soltos, ...velho.filter(k => k[0] >= depois)];
  traj.length = 0; traj.push(...novo);
}
// chão para os cascos: o terreno e, na ferrovia, o lastro (talude de 3,4 a 1,9 m do eixo, topo a 0,35) e os dormentes
// (topo a 0,49): ao cruzar os trilhos, o cavalo sobe o talude em vez de afundar no cascalho
function chaoCavalo(x, z) {
  const a = Math.abs(z), h = alturaTerreno(x, z); if (a >= 3.4) return h;
  const leito = a < 1.3 ? 0.49 : a < 1.9 ? 0.35 : lerp1(0.35, -0.6, (a - 1.9) / 1.5);
  return Math.max(h, leito);
}
// câmeras do Ato 3 que andam com ela, rente ao chão (x e z): a vegetação sai do caminho delas também. d é a frente dela
// e r, a direita (no chão)
function rumoJack(ta, h) { const d = frente(rumo(t => curva(TRAJ_JACK, t), ta, h).yaw); return { d, r: [d[1], -d[0]] }; }
function olhoP35(ta) { const j = estadoCavaloJack(ta).e, { d, r } = rumoJack(ta, 0.45); return [j.x + d[0] * 6.2 - r[0] * 2.8, j.z + d[1] * 6.2 - r[1] * 2.8]; } // à frente e à esquerda
function olhoP36(ta) { const j = estadoCavaloJack(ta).e, { d, r } = rumoJack(ta, 0.45); return [j.x - r[0] * 5.6 + d[0] * 1.3, j.z - r[1] * 5.6 + d[1] * 1.3]; } // pela esquerda
function olhoP40(ta) { // à frente dela, perto da linha que vem do grupo (para o grupo aparecer ao lado dela, lá atrás)
  const g = estadoCavaloGrupo(GRUPO[0], 141.4).e, m = estadoCavaloJack(141.4).e, a = Math.atan2(m.x - g.x, m.z - g.z) - 0.42, j = estadoCavaloJack(ta).e; // girada para o sul, longe do muro de pedras
  return [j.x + Math.sin(a) * 7.2, j.z + Math.cos(a) * 7.2]; }
function olhoP42a(ta) { const j = estadoCavaloJack(ta).e, { d, r } = rumoJack(ta, 0.3); return [j.x + r[0] * 5.2 + d[0] * 2.2, j.z + r[1] * 5.2 + d[1] * 2.2]; } // pela direita, um pouco à frente
function olhoP40b(ta) { const g = estadoCavaloGrupo(GRUPO[0], ta).e, d = frente(rumo(t => curva(GRUPO[0].traj, t), ta, 0.3).yaw), r = [d[1], -d[0]]; return [g.x + d[0] * 4.2 - r[0] * 2.6, g.z + d[1] * 4.2 - r[1] * 2.6]; }
// em tempo da ação. O P36 (a caminhada) saiu e o olhoP40b não é mais câmera (o P40b virou o insert da bomba): ficam aqui,
// com os trechos de antes, para a vegetação não mudar nos outros planos; o P40 e o P42a cobrem os trechos de antes e os novos
const CAMS_ATO3 = [[olhoP35, 127.13, 129.6], [olhoP36, 129.6, 133.35], [olhoP40, 140.3, 141.8], [olhoP40b, 141.5, 142.55], [olhoP42a, 145.2, 148.32]];
// a vegetação do Ato 3 fica fora do caminho dos cavalos (os trechos novos, de 127,1 a 148 s: o P34 e o P43 em diante não
// mudam) e das câmeras que andam rente ao chão ao lado dela
let _amostras = null;
function livreDosCaminhos(x, z, r) {
  if (!_amostras) { preparaTrajetos(); _amostras = [];
    for (let t = 127.1; t < 148; t += 0.08) _amostras.push(curva(TRAJ_JACK, t)); // até 127,1 o caminho é o de antes (o P34 não muda)
    for (const [f, a, b] of CAMS_ATO3) for (let t = a - 0.1; t < b + 0.1; t += 0.04) _amostras.push(f(t));
    const x34 = portaMundo(SALTO.sai)[0] + 8; _amostras.push([x34, -26], [x34 + 0.6, -23.5]); // o chão logo à frente da câmera do salto (P34) fica livre, como era
    for (const g of GRUPO) { const tl = g.traj[0][0]; for (let t = g.salta; t < 148; t += 0.08) _amostras.push(t < tl ? [xLoco(g.salta) + CX_S + g.dx, lerp1(-1.5, -6.5, fase0(t, g.salta, tl))] : curva(g.traj, t)); } }
  for (const a of _amostras) if (Math.abs(a[0] - x) < r && Math.abs(a[1] - z) < r && Math.hypot(a[0] - x, a[1] - z) < r) return false;
  return true;
}
// a fase acertada aos poucos, para não mudar o galope do P34 nem dar salto
function passoCurva(traj, ta, d, t0) { return (distCurva(traj, ta) + d * suave(fase0(ta, t0, 148.6))) / 5.2; }
// A fase da passada dela: integra a velocidade dividida pelo comprimento da passada (5,2 m a galope; no passo, bem mais
// curta, para os cascos não escorregarem). A diferença para a conta antiga em 148,6 s (menos um número par de passadas:
// a cauda balança a cada duas) é acertada aos poucos; dali em diante vale a conta antiga, e o P43 começa igual.
function passada(v) { return v <= 4 ? lerp1(1.5, 2.6, clamp01((v - 1.6) / 2.4)) : v <= 8 ? lerp1(2.6, 5.2, (v - 4) / 4) : Math.min(7, 5.2 + 0.15 * (v - 8)); } // passo 1,5 m a 1,6 m/s (uma passada por segundo), trote 2,6 m a 4 m/s, galope de 5,2 m (8 m/s) a 7 m (20 m/s)
let _passoJ = null;
function passoJack(ta) {
  if (!_passoJ) {
    const f = t => curva(TRAJ_JACK, t), t0 = SALTO.cai, dt = 0.02, tab = [0], fim = TRAJ_JACK[TRAJ_JACK.length - 1][0]; let prev = f(t0);
    for (let t = t0 + dt; t <= fim + 1e-6; t += dt) { const c = f(t), d = Math.hypot(c[0] - prev[0], c[1] - prev[1]); tab.push(tab[tab.length - 1] + d / passada(d / dt)); prev = c; }
    _passoJ = { t0, dt, tab };
  }
  const J = _passoJ, x = Math.max(0, (ta - J.t0) / J.dt), i = Math.min(J.tab.length - 2, Math.floor(x));
  return J.tab[i] + (J.tab[i + 1] - J.tab[i]) * Math.min(1, x - i);
}
// Do P37a ao P37c (130,5 a 136,8 s), o trote dela um pouco mais rápido: cerca de 11% mais passadas por segundo, com a
// passada mais curta na mesma proporção (o caminho e a velocidade não mudam, e os cascos não escorregam). O trecho soma
// exatamente uma passada inteira, então a fase das pernas depois dele é a de antes. Devolve [passadas a mais até ta,
// passadas a mais por segundo em ta]; as bordas sobem e descem em meio segundo.
const TROTE_P37 = { a: 130.5, b: 136.8, borda: 0.5, n: 1 };
function troteP37(ta) {
  const { a, b, borda: L, n } = TROTE_P37, I = b - a - L;
  if (ta <= a) return [0, 0];
  if (ta >= b) return [n, 0];
  // a integral de suave de 0 a u
  const S = u => u * u * u - u * u * u * u / 2;
  let acum, taxa;
  if (ta < a + L) { const u = (ta - a) / L; acum = L * S(u); taxa = suave(u); }
  else if (ta < b - L) { acum = L / 2 + (ta - a - L); taxa = 1; }
  else { const u = (b - ta) / L; acum = I - L * S(u); taxa = suave(u); }
  return [n * acum / I, n * taxa / I];
}
// a fase da passada de um cavalo num caminho (x, z no tempo), com a passada pela velocidade; com cache
const _faseCav = new Map();
function faseCavalo(keys, ta) {
  let tab = _faseCav.get(keys);
  if (!tab) { const t0 = keys[0][0], t1 = Math.min(keys[keys.length - 1][0], t0 + 60), dt = 0.02, f = [0]; let prev = trilhaH(keys, t0);
    for (let t = t0 + dt; t <= t1 + 1e-6; t += dt) { const c = trilhaH(keys, t), d = Math.hypot(c[0] - prev[0], c[1] - prev[1]); f.push(f[f.length - 1] + d / passada(d / dt)); prev = c; }
    tab = { t0, dt, f }; _faseCav.set(keys, tab); }
  const x = Math.max(0, (ta - tab.t0) / tab.dt), i = Math.min(tab.f.length - 2, Math.floor(x));
  return tab.f[i] + (tab.f[i + 1] - tab.f[i]) * Math.min(1, x - i);
}
// a fase da passada do cavalo dela no vagão: a distância andada ao longo do corpo (com sinal) sobre a passada
let _passoS = null;
function passoCavaloS(ta) {
  if (!_passoS) { const K = ANC.cavalo, t0 = K[0][0], dt = 0.02, f = [0]; let prev = trilhaH(K, t0);
    for (let t = t0 + dt; t <= 123.6 + 1e-6; t += dt) { const c = trilhaH(K, t), dx = c[0] - prev[0], dz = c[1] - prev[1], d = Math.hypot(dx, dz), y = lerpAng(Math.PI / 2, Math.PI, suave(fase0(t, 120.7, 121.65)));
      f.push(f[f.length - 1] + Math.sign(dx * Math.sin(y) + dz * Math.cos(y)) * d / passada(d / dt)); prev = c; }
    _passoS = { t0, dt, f }; }
  const T = _passoS, x = Math.max(0, (ta - T.t0) / T.dt), i = Math.min(T.f.length - 2, Math.floor(x));
  return T.f[i] + (T.f[i + 1] - T.f[i]) * Math.min(1, x - i);
}
function estadoCavaloJack(ta) {
  const piso = Y_TRILHO + ALT.piso;
  // na baia
  if (ta < ANC.cavalo[0][0]) {
    const w = [xLoco(ta) + CX_S - 3.0, piso, 0.82];
    return { e: { x: w[0], y: w[1], z: w[2], yaw: Math.PI / 2, passo: 0, galope: 0, pescoco: Math.sin(ta * 0.8) * 0.15 }, montada: false };
  }
  // o tiro: recua um passo, de cabeça erguida; sai da baia até ela, para enquanto ela monta e vira para a porta
  if (ta < SALTO.sai) {
    const K = ANC.cavalo, [lx, lz] = trilhaH(K, ta), [vx, vz] = velCaminho(K, ta), v = Math.hypot(vx, vz);
    const yaw = lerpAng(lerpAng(Math.PI / 2, Math.PI, suave(fase0(ta, 120.7, 121.65))), Math.PI - 0.35, suave(fase0(ta, 123.15, 123.55))), gal = suave((v - 0.4) / 7);
    const susto = rampa(ta, 118.4, 118.5, 118.95, 119.6);
    return { e: { x: xLoco(ta) + CX_S + lx, y: piso, z: lz, yaw, passo: passoCavaloS(ta), passada: passada(v), galope: gal, amp: Math.min(1, Math.max(gal * 1.5, v / 2)),
      pescoco: Math.sin(ta * 0.8) * 0.15 * (1 - susto) - 0.42 * susto }, montada: ta > ANC.monta0 };
  }
  if (ta < SALTO.cai) { // voo: sai com a velocidade do trem + lateral
    const u = fase0(ta, SALTO.sai, SALTO.cai);
    const p0 = portaMundo(SALTO.sai), xg = p0[0] + 14 * (ta - SALTO.sai) * 0.9;
    const zg = lerp1(-0.6, -9.5, u), y0 = piso, y1 = alturaTerreno(xg, -9.5);
    const y = lerp1(y0, y1, u) + Math.sin(u * Math.PI) * 2.2;
    return { e: { x: xg, y: y - 0.1, z: zg, yaw: Math.PI - 0.35, salto: Math.sin(u * Math.PI) * 0.9 + 0.1, galope: 0, pitch: lerp1(-0.25, 0.3, u), sombraY: u > 0.2 ? alturaTerreno(xg, zg) : null }, montada: true };
  }
  if (ta > CAV_FOGE[0][0]) { // a explosão assusta o cavalo dela: ele dispara para longe
    const [x, z] = trilhaH(CAV_FOGE, ta), [vx, vz] = velCaminho(CAV_FOGE, ta), v = Math.hypot(vx, vz);
    return { e: { x, y: alturaTerreno(x, z), z, yaw: lerpAng(0.8, Math.atan2(vx, vz), suave(fase0(ta, CAV_FOGE[1][0], CAV_FOGE[1][0] + 0.4))), passo: faseCavalo(CAV_FOGE, ta), passada: passada(v), terreno: true, galope: suave(v / 7), trote: sstep(2.0, 3.0, v) * (1 - sstep(6.5, 8.5, v)), empina: 0.8 * Math.sin(fase0(ta, 157.36, 157.95) * Math.PI), pescoco: 0 }, montada: false };
  }
  const f = t => curva(TRAJ_JACK, t), [x, z] = f(ta), r = rumo(f, ta);
  const gal = suave((r.v - 0.4) / 7), yawRepouso = ta > 150 ? 0.8 : 2.2, passo = ta < 148.6; // antes da beira, a passo: segue o caminho e mexe as pernas por inteiro
  const yawTraj = lerpAng(Math.PI - 0.35, lerpAng(yawRepouso, r.yaw, suave((r.v - 0.3) / (passo ? 1 : 2.5))), suave((ta - SALTO.cai) / 0.5));
  const trote = sstep(2.0, 3.0, r.v) * (1 - sstep(6.5, 8.5, r.v)); // entre o passo e o galope, ela vai a trote (também ao parar na beira)
  // no P37a ao P37c, as passadas a mais (troteP37): a passada encurta para o casco no chão não escorregar
  const [maisP, maisT] = troteP37(ta), pass = maisT > 0 ? r.v / (r.v / passada(r.v) + maisT) : passada(r.v);
  return { e: { x, y: chaoCavalo(x, z), z, yaw: yawTraj, passo: passoJack(ta) + maisP, passada: pass, terreno: true, galope: gal, trote, amp: Math.min(1, Math.max(gal * 1.5, r.v / 2)), pescoco: (1 - gal) * Math.sin(ta) * 0.1 * (1 - trote) }, montada: ta < 153.0 };
}

// ================================================================ GRUPO DO XERIFE (ATO 3)
const DUELO = { jack: [1003.2, -128.5], xerife: [990.6, -118.6] };
function cavaloDe(traj, ta, fase = 0, t0 = traj[0][0]) {
  const f = t => curva(traj, t), [x, z] = f(ta), r = rumo(f, ta);
  const yawRepouso = Math.atan2(DUELO.jack[0] - x, DUELO.jack[1] - z);
  const gal = suave((r.v - 0.4) / 7), trote = sstep(1.6, 2.6, r.v) * (1 - sstep(6.5, 8.5, r.v));
  return { x, y: chaoCavalo(x, z), z, yaw: lerpAng(yawRepouso, r.yaw, suave((r.v - 0.3) / 2.5)), passo: passoGrupo(traj, ta, fase, t0), passada: passada(r.v), terreno: true, galope: gal, trote, amp: Math.min(1, Math.max(gal * 1.5, r.v / 2)) };
}
// fase da passada dos cavalos do grupo: a galope é a conta antiga (distância / 5,2 m); quando desaceleram para parar, a
// passada encurta com a velocidade (sem isso, as patas escorregavam no chão na chegada à beira)
const _passoG = new Map();
function passoGrupo(traj, ta, d, t0) { // a passada pela velocidade em todo o caminho (antes, até 149 s, 5,2 m fixos, que a 20 m/s davam pernas rápidas demais)
  let tab = _passoG.get(traj);
  if (!tab) { const f = t => curva(traj, t), a = traj[0][0], dt = 0.02, b = [0]; let prev = f(a);
    for (let t = a + dt; t <= Math.min(traj[traj.length - 1][0], 190) + 1e-6; t += dt) { const c = f(t), s = Math.hypot(c[0] - prev[0], c[1] - prev[1]); b.push(b[b.length - 1] + s / passada(s / dt)); prev = c; }
    tab = { a, dt, b }; _passoG.set(traj, tab); }
  const x = Math.max(0, (ta - tab.a) / tab.dt), i = Math.min(tab.b.length - 2, Math.floor(x)), u = Math.min(1, x - i);
  return tab.b[i] + (tab.b[i + 1] - tab.b[i]) * u + d * suave(fase0(ta, t0, 148.6)) / 5.2;
}
// Cada cavalo do grupo: na baia (de frente para +x, como os outros), a passo até a porta (vira para fora), o salto
// e o galope. O da baia do fundo (-5,3) fica de cabeça erguida: o focinho passa por cima da garupa do cavalo preto, sem tocá-la.
function estadoCavaloGrupo(g, ta) {
  const piso = Y_TRILHO + ALT.piso, xl = xLoco(ta) + CX_S, pesc = g.baia < 0 ? -0.6 + Math.sin(ta * g.pesc[0] + g.pesc[1]) * 0.04 : Math.sin(ta * g.pesc[0] + g.pesc[1]) * 0.15;
  if (ta < g.sai) return { e: { x: xl + g.baia, y: piso, z: 0.82, yaw: Math.PI / 2, passo: 0, galope: 0, pescoco: pesc }, onde: 'baia' };
  if (ta < g.salta) { // pela fileira até o vão da cerca, depois vira para a porta
    const u = fase0(ta, g.sai, g.salta), s = Math.sign(g.baia), a = suave(clamp01(u / 0.55)), b = suave(clamp01((u - 0.45) / 0.55));
    const lx = lerp1(lerp1(g.baia, s * 0.9, a), g.dx, b), lz = lerp1(0.82, -0.55, b);
    const yaw = lerpAng(Math.PI / 2, Math.PI, b); // os da frente recuam até o vão; o do fundo anda até ele
    return { e: { x: xl + lx, y: piso, z: lz, yaw, passo: ta * 2.6, galope: 0.75, pescoco: -0.2 }, onde: 'vagao' }; // já saem a meio galope
  }
  const tl = g.salta + SALTO_G;
  if (ta < tl) { // o salto pela porta: sai com a velocidade do trem e cai no cascalho
    const u = fase0(ta, g.salta, tl), xg = xLoco(g.salta) + CX_S + g.dx + vTrem(g.salta) * (ta - g.salta) * 0.9;
    const zg = lerp1(-0.55, -6.5, u), y = lerp1(piso, alturaTerreno(xg, -6.5), u) + Math.sin(u * Math.PI) * 0.9;
    return { e: { x: xg, y: y - 0.1, z: zg, yaw: Math.PI - 0.15, salto: Math.sin(u * Math.PI) * 0.9 + 0.1, galope: 0, pitch: lerp1(-0.25, 0.3, u), sombraY: u > 0.2 ? alturaTerreno(xg, zg) : null }, onde: 'salto' };
  }
  const e = cavaloDe(g.traj, ta, g.fase, tl);
  if (g.ajuste) e.passo += g.ajuste * suave(fase0(ta, 141.9, g.tAjuste)) / 5.2; // os trajetos novos do V: a fase chega ao P43 como antes
  e.yaw = lerpAng(Math.PI - 0.15, e.yaw, suave((ta - tl) / 0.5)); // do pouso, vira para o rumo do trajeto
  return { e, onde: 'campo' };
}
// pose de cada um do grupo: abaixados sob o teto do vagão e na porta; a galope, o xerife saca e atira nela
function poseGrupo(g, ta, c) {
  const p = poseCavaleiro(c.e); p.expr = 'determinado';
  const tl = g.salta + SALTO_G;
  if (c.onde === 'baia' || c.onde === 'vagao') { p.inclina = 1.08; p.cabPitch = -0.75; p.ombroE = p.ombroD = 0.85; p.cotoveloE = p.cotoveloD = 1.25; }
  else if (c.onde === 'salto') { const u = fase0(ta, g.salta, tl); p.inclina = lerp1(1.08, 0.6, u); p.cabPitch = lerp1(-0.75, -0.3, u); p.ombroE = p.ombroD = 1.2; }
  else if (ta < tl + 0.6) { const k = suave(fase0(ta, tl, tl + 0.6)); p.inclina = lerp1(0.6, p.inclina, k); p.cabPitch = lerp1(-0.3, p.cabPitch, k); }
  if (c.onde === 'campo') miraGrupo(p, ta, GRUPO.indexOf(g));
  return p;
}
// ================================================================ A BALA NO CHAPÉU (2:23,40 na música)
// O xerife atira de trás, a galope, e a bala atravessa a copa do chapéu dela acima da cabeça, em câmera lenta.
const BALA = { t: tempoAcao(143.40), voo: 0.12, alvo: [0, 0.068, 0] }; // impacto (tempo da ação), voo desde o disparo, mira no eixo da copa (no torno do chapéu)
// Os tiros da perseguição (tempo da ação): o do xerife é só a bala do chapéu (BALA); depois, só os ajudantes atiram, um
// de cada vez e sem pressa, e erram, passando por ela, enquanto a câmera do P41b sai pelo furo e vai até os três (o
// último passa por ela no P42a). erro: [para o lado, para cima] do alvo, em metros.
const TIROS_C = [{ t: 145.55, g: 1, erro: [-1.6, 0.4] }, { t: 145.95, g: 2, erro: [1.1, 0.9] }, { t: 146.35, g: 1, erro: [1.8, 0.5] },
  { t: 146.72, g: 2, erro: [-1.2, 1.0] }, { t: 147.15, g: 1, erro: [-1.4, 0.7] }];
const MIRA_C = [[BALA.t - BALA.voo - 1.3, 147.4], [144.9, 147.5], [145.3, 147.4]]; // quando cada um mira (xerife, ajudante, ajudante 2): o xerife segue de arma apontada
function miraGrupo(p, ta, n) {
  const [a0, a1] = MIRA_C[n], k = rampa(ta, a0, a0 + 0.5, a1 - 0.6, a1); if (k <= 0) return;
  const j = estadoCavaloJack(ta).e, a = Math.atan2(j.x - p.x, j.z - p.z) - p.yaw, giro = Math.max(-0.8, Math.min(0.8, Math.atan2(Math.sin(a), Math.cos(a))));
  let r = 0; const disparos = (n === 0 ? [BALA.t - BALA.voo] : []).concat(TIROS_C.filter(q => q.g === n).map(q => q.t));
  for (const t of disparos) if (ta > t && ta < t + 0.3) r = Math.max(r, 1 - (ta - t) / 0.3); // recuo
  p.maoD = k > 0.3 ? 'revolver' : null; p.rolaD = Math.min(1, k / 0.3); p.torce = lerp1(p.torce || 0, giro, k); p.cabYaw = lerp1(p.cabYaw || 0, 0, k);
  p.inclina = lerp1(p.inclina, 0.12, k); p.ombroD = lerp1(p.ombroD, 1.5 + 0.35 * r, k); p.cotoveloD = lerp1(p.cotoveloD, 0.06, k); p.abracoD = lerp1(p.abracoD, 0.06, k);
  p.cabPitch = lerp1(p.cabPitch, -0.05 - 0.1 * r, k); p.expr = 'raiva';
}
function miraXerife(p, ta) { miraGrupo(p, ta, 0); }
// ponta do cano do revólver de qualquer um do grupo
function canoGrupo(n, ta) {
  const g = GRUPO[n], P = g.P(), D = P.D, p = poseGrupo(g, ta, estadoCavaloGrupo(g, ta));
  const ombro = doTronco(P, p, [D.ombro, D.tronco - 0.05 * D.s, 0]), m = doTronco(P, p, maoFK(D, 1, p.ombroD, p.abracoD, p.cotoveloD, p.giroBD || 0));
  const d = normaliza([m[0] - ombro[0], m[1] - ombro[1], m[2] - ombro[2]]);
  return [m[0] + d[0] * 0.24, m[1] + d[1] * 0.24 + 0.05, m[2] + d[2] * 0.24];
}
// cada tiro que erra: do cano, no disparo, para um ponto ao lado dela (onde ela estará quando a bala chegar); a 140 m/s
const _tirosC = new Map();
function linhaTiroC(q) {
  if (_tirosC.has(q)) return _tirosC.get(q);
  const M = canoGrupo(q.g, q.t), j = estadoCavaloJack(q.t + 0.3).e, d0 = frente(j.yaw), lado = [d0[1], -d0[0]];
  const alvo = [j.x + lado[0] * q.erro[0], j.y + 2.0 + q.erro[1], j.z + lado[1] * q.erro[0]], d = normaliza([alvo[0] - M[0], alvo[1] - M[1], alvo[2] - M[2]]);
  const L = { M, d, dist: Math.hypot(alvo[0] - M[0], alvo[1] - M[1], alvo[2] - M[2]) + 40 }; _tirosC.set(q, L); return L;
}
function desenhaTirosC(ta) {
  for (const q of TIROS_C) {
    const e = ta - q.t; if (e < 0 || e > 1.2) continue;
    if (e < 0.07) { const c = canoGrupo(q.g, ta); push(); translate(c[0], c[1], c[2]); scale(0.1); md(G.bolha, { tinta: [1.7, 1.35, 0.7], semLuz: 1, alfa: 0.95 }); pop(); }
    const L = linhaTiroC(q), a = Math.min(L.dist, 140 * e); if (a >= L.dist) continue;
    const f = [L.M[0] + L.d[0] * a, L.M[1] + L.d[1] * a, L.M[2] + L.d[2] * a], yaw = Math.atan2(L.d[0], L.d[2]), pit = Math.asin(L.d[1]), cauda = Math.min(a, 2.2);
    push(); translate(f[0], f[1], f[2]); rotateY(yaw); rotateX(-pit); translate(0, 0, -cauda / 2); scale(0.012, 0.012, cauda); md(G.cubo, { tinta: [1.9, 1.5, 0.9], semLuz: 1, alfa: 0.85 }); pop();
  }
  mat({});
}
function luzesTirosC(ta) { const L = []; for (const q of TIROS_C) if (ta >= q.t && ta < q.t + 0.07) L.push({ p: canoGrupo(q.g, ta), c: [0.9, 0.66, 0.34], r: 4 }); return L; }
// ponta do cano do revólver do xerife montado (pela mão e pela direção do ombro até ela)
function canoXerife(ta) {
  const g = GRUPO[0], P = G.xerife, D = P.D, p = poseGrupo(g, ta, estadoCavaloGrupo(g, ta));
  const ombro = doTronco(P, p, [D.ombro, D.tronco - 0.05 * D.s, 0]), m = doTronco(P, p, maoFK(D, 1, p.ombroD, p.abracoD, p.cotoveloD, p.giroBD || 0));
  const d = normaliza([m[0] - ombro[0], m[1] - ombro[1], m[2] - ombro[2]]);
  return [m[0] + d[0] * 0.24, m[1] + d[1] * 0.24 + 0.05, m[2] + d[2] * 0.24];
}
// do torno do chapéu da Jack (as coordenadas de chapeu()) para a cabeça e para o mundo, e de volta
function chapeuParaCabeca(P, l) { const s = P.f.altura / 1.75 * 1.12; return [s * l[0], P.D.s * 0.1 + s * (l[1] + 0.085), s * (l[2] - 0.005)]; }
function chapeuNoMundo(P, p, l) { return doCabeca(P, p, chapeuParaCabeca(P, l)); }
function mundoParaChapeu(P, p, w) {
  const s = P.f.altura / 1.75 * 1.12, v = paraTronco(P, p, w), h = _rx(_ry([v[0], v[1] - P.D.pescoco, v[2]], -(p.cabYaw || 0)), -(p.cabPitch || 0));
  return [h[0] / s, (h[1] - P.D.s * 0.1) / s - 0.085, h[2] / s + 0.005];
}
// a linha da bala: do cano, no disparo, até o eixo da copa, no impacto; e os furos onde ela corta a copa
let _bala = null;
function linhaBala() {
  if (_bala) return _bala;
  const p = poseJackMontada(BALA.t), M = canoXerife(BALA.t - BALA.voo), Q = chapeuNoMundo(G.jackFL, p, BALA.alvo);
  const d = normaliza([Q[0] - M[0], Q[1] - M[1], Q[2] - M[2]]);
  const Ml = mundoParaChapeu(G.jackFL, p, M), dl = normaliza([BALA.alvo[0] - Ml[0], BALA.alvo[1] - Ml[1], BALA.alvo[2] - Ml[2]]), h = Math.hypot(dl[0], dl[2]), R = 0.101 / h;
  const furo = k => { const q = [BALA.alvo[0] + dl[0] * R * k, BALA.alvo[1] + dl[1] * R * k, BALA.alvo[2] + dl[2] * R * k]; return { a: Math.atan2(q[2], q[0]), y: Math.max(0.058, Math.min(0.073, q[1])), l: q }; };
  _bala = { M, Q, d, dist: Math.hypot(Q[0] - M[0], Q[1] - M[1], Q[2] - M[2]), entra: furo(-1), sai: furo(1), dl };
  return _bala;
}
// Fogo leve nos furos do chapéu (tempo da ação): um clarão no impacto; chamas pequenas que lambem a borda de cima de cada
// furo, sobem e o vento da corrida dela leva para trás, rente à copa (o fundo do furo fica livre: o P41b olha por ele);
// brasas na borda chamuscada, algumas faíscas e um fio de fumaça. As chamas baixam e se apagam em uns 4 s; as brasas,
// pouco depois.
function intensFogo(e) { return { chama: sstep(0, 0.05, e) * (0.35 + 0.65 * Math.exp(-e / 1.8)) * (1 - sstep(3.2, 4.4, e)), brasa: 1 - sstep(4, 5.5, e), clarao: e >= 0 ? Math.exp(-e / 0.07) : 0 }; }
function luzesFogoChapeu(ta) {
  const e = ta - BALA.t; if (e < 0 || e > 4.6) return [];
  const I = intensFogo(e), P = G.jackFL, p = poseJackMontada(ta), L = linhaBala(), q = L.sai.l, a = L.sai.a;
  const c = chapeuNoMundo(P, p, [q[0] + Math.cos(a) * 0.16, q[1] + 0.03, q[2] + Math.sin(a) * 0.16]), f = 0.75 + 0.25 * Math.sin(ta * 31) * Math.sin(ta * 13);
  const k = (0.2 * I.chama * f + 1.2 * I.clarao); return k > 0.02 ? [{ p: c, c: [1.5 * k, 0.62 * k, 0.2 * k], r: 0.7, pri: 1 }] : []; // um pouco afastada da copa: aquece o chapéu e o rosto sem estourar
}
// uma barra fina e acesa entre dois pontos (sem luz da cena: brilha)
function luzTira(a, b, w, cor, alfa) {
  if (alfa <= 0.01) return; const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(d[0], d[1], d[2]); if (L < 1e-5) return;
  push(); translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); rotateY(Math.atan2(d[0], d[2])); rotateX(-Math.asin(d[1] / L)); scale(w, w, L + w * 0.5);
  md(G.cubo, { tinta: cor, semLuz: 1, alfa }); pop();
}
function fogoChapeu(ta) {
  const e = ta - BALA.t; if (e < 0 || e > 5.5) return;
  const gl = drawingContext; gl.depthMask(false); // translúcido: não esconde o que vem depois (o pó do impacto) nem uma chama a outra
  const P = G.jackFL, p = poseJackMontada(ta), L = linhaBala(), s = P.f.altura / 1.75 * 1.12, I = intensFogo(e), rF = 0.0135 * s;
  const j0 = estadoCavaloJack(ta - 0.05).e, j1 = estadoCavaloJack(ta + 0.05).e, vx = (j1.x - j0.x) * 10, vz = (j1.z - j0.z) * 10, vv = Math.hypot(vx, vz);
  const vento = vv > 0.1 ? [-vx / vv, 0, -vz / vv] : [0, 0, 0], forte = Math.min(1, vv / 8);
  const elip = (c, d, comp, larg, cor, alfa, luz = true) => { // um elipsoide com o eixo maior na direção d
    if (alfa <= 0.01) return; push(); translate(c[0], c[1], c[2]); rotateY(Math.atan2(d[0], d[2])); rotateX(-Math.asin(Math.max(-1, Math.min(1, d[1])))); scale(larg, larg, comp);
    md(G.bolhaFina, luz ? { tinta: cor, semLuz: 1, alfa } : { tinta: cor, alfa, amb: 0.9, sol: 0.6 }); pop(); };
  const bola = (c, r, cor, alfa, luz = true) => elip(c, [0, 1, 0], r, r, cor, alfa, luz);
  [L.sai, L.entra].forEach((h, n) => {
    const W = l => chapeuNoMundo(P, p, l), c = h.l, a = h.a, C = W(c);
    const dif = l => { const q = W(l); return normaliza([q[0] - C[0], q[1] - C[1], q[2] - C[2]]); };
    const Nw = dif([c[0] + Math.cos(a) * 0.01, c[1], c[2] + Math.sin(a) * 0.01]), Uw = dif([c[0], c[1] + 0.01, c[2]]), Tw = dif([c[0] - Math.sin(a) * 0.01, c[1], c[2] + Math.cos(a) * 0.01]);
    const borda = (th, rr, fora = 0.0012) => [0, 1, 2].map(i => C[i] + (Tw[i] * Math.cos(th) + Uw[i] * Math.sin(th)) * rr + Nw[i] * fora);
    const vn = vento[0] * Nw[0] + vento[2] * Nw[2], wp = [vento[0] - Nw[0] * vn, -Nw[1] * vn, vento[2] - Nw[2] * vn]; // o vento rente à copa
    const dirF = normaliza([Nw[0] * 0.35 + wp[0] * (0.35 + 0.9 * forte), 1 + Nw[1] * 0.35 + wp[1], Nw[2] * 0.35 + wp[2] * (0.35 + 0.9 * forte)]);
    // o clarão do impacto
    const kc = I.clarao * (1 - sstep(0.06, 0.12, e)); // só o estalo (em câmera lenta, o resto do clarão virava um disco cinza na frente do furo)
    if (kc > 0.02) { bola(borda(0, 0, 0.004), rF * (1.2 + 1.6 * (1 - I.clarao)), [2.2, 1.7, 0.9], 0.85 * kc); }
    // brasas: a borda chamuscada acesa, uma linha contínua e irregular em volta do furo, cintilando, com um halo mais fraco
    const NB = 22, ptB = (i, k) => { const th = i / NB * Math.PI * 2; return borda(th, rF * (k + 0.12 * (hash2(i % NB, n + 5) - 0.5)), 0.0015); };
    for (let i = 0; i < NB; i++) { const fl = 0.6 + 0.4 * Math.sin(ta * (11 + 6 * hash2(i, 3)) + i * 2.3), al = I.brasa * (0.45 + 0.55 * I.chama);
      luzTira(ptB(i, 1.1), ptB(i + 1, 1.1), 0.0024 * s, [2.0 * fl, 0.62 * fl, 0.14 * fl], 0.9 * al);
      luzTira(ptB(i, 1.32), ptB(i + 1, 1.32), 0.005 * s, [1.5 * fl, 0.4 * fl, 0.08 * fl], 0.3 * al); }
    // chamas: gotas finas que nascem na borda de cima (entre 15° e 165°), sobem, tremem e somem; o núcleo é mais claro.
    // Com a câmera a menos de uns 25 cm (ela chega ao furo no P41b), somem: de perto, o fogo é a borda acesa
    const perto = q => clamp01((Math.hypot(q[0] - CAM.olho[0], q[1] - CAM.olho[1], q[2] - CAM.olho[2]) - 0.06) / 0.2);
    const gota = (c, d, comp, larg, cor, alfa) => { if (alfa <= 0.01) return; push(); translate(c[0], c[1], c[2]); rotateY(Math.atan2(d[0], d[2])); rotateX(Math.acos(Math.max(-1, Math.min(1, d[1]))));
      scale(larg, comp, larg); md(G.chama, { tinta: cor, semLuz: 1, alfa }); pop(); };
    for (let k = 0; k < 12; k++) {
      const fase = ta * 2.9 + k * 0.61803 + n * 0.29, u = fase - Math.floor(fase), ciclo = Math.floor(fase);
      const th = Math.PI * (0.08 + 0.84 * hash2(k + n * 7, ciclo)), H = (0.014 + 0.016 * hash2(ciclo, k + 3)) * s * (0.4 + 0.6 * I.chama) * (0.85 + 0.15 * Math.sin(ta * 37 + k));
      const b = borda(th, rF * 1.04, 0.0025), sw = 0.003 * s * Math.sin(ta * 23 + k * 1.7) * u;
      const cpos = [0, 1, 2].map(i => b[i] + dirF[i] * H * (0.35 + 0.9 * u) + Tw[i] * sw), larg = 0.0042 * s * Math.pow(1 - u, 0.5) * (0.6 + 0.4 * I.chama);
      const alfa = Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.3)), 0.7) * I.chama * perto(cpos);
      const cor = [lerp1(2.0, 1.3, u), lerp1(0.85, 0.28, u), lerp1(0.22, 0.06, u)];
      gota(cpos, dirF, H * (0.5 - 0.2 * u), larg, cor, 0.42 * alfa);
      if (u < 0.55) gota([0, 1, 2].map(i => cpos[i] - dirF[i] * H * 0.12), dirF, H * 0.28, larg * 0.45, [2.4, 1.85, 0.95], 0.65 * alfa * (1 - u / 0.55));
    }
    // faíscas levadas pelo vento
    for (let k = 0; k < 4; k++) { const fase = ta * 0.85 + k * 0.37 + n * 0.5, u = fase - Math.floor(fase), ciclo = Math.floor(fase), b = borda(Math.PI * (0.3 + 0.4 * hash2(k, ciclo)), rF);
      const q = [0, 1, 2].map(i => b[i] + wp[i] * 0.3 * u * (0.4 + forte) + (i === 1 ? 0.07 * u - 0.05 * u * u : 0) + Tw[i] * 0.02 * (hash2(ciclo, k) - 0.5) * u);
      bola(q, 0.0014 * s, [2.2, 1.4, 0.5], (1 - u) * I.chama * perto(q)); }
    // um fio de fumaça
    for (let k = 0; k < 4; k++) { const fase = ta * 0.6 + k * 0.25 + n * 0.13, u = fase - Math.floor(fase);
      const q = [0, 1, 2].map(i => C[i] + Nw[i] * 0.01 + (i === 1 ? 0.03 + 0.13 * u : 0) + wp[i] * 0.22 * u * (0.4 + forte));
      bola(q, 0.005 * s + 0.028 * u, [0.38, 0.36, 0.4], 0.16 * (1 - u) * Math.min(1, I.chama * 1.5) * perto(q), false); }
  });
  mat({}); gl.depthMask(true);
}
function furoChapeu() { const L = linhaBala(); return { r: 0.0135, furos: [{ a: L.entra.a, y: L.entra.y }, { a: L.sai.a, y: L.sai.y }] }; }
// o chapéu de cada um; o da Jack, do impacto em diante, com os furos
function chapeuDe(P) {
  if (P !== G.jackFL || !(TA >= BALA.t)) return P.P.chapeu;
  if (!P.P.chapeuFurado) P.P.chapeuFurado = chapeu(P.f, furoChapeu()).geo();
  return P.P.chapeuFurado;
}
// a bala (um risco de luz), os fiapos de feltro e o pó que saem dos furos, o clarão e a fumaça do disparo
function desenhaBala(ta) {
  const e = ta - BALA.t; if (e < -1 || e > 3) return;
  const L = linhaBala(), d = L.d, t0 = BALA.t - BALA.voo;
  if (e > -0.08 && e < 0.08) { // a bala, vista só perto do chapéu: 25 m/s em relação a ela (ela também galopa), em câmera lenta
    const h = chapeuNoMundo(G.jackFL, poseJackMontada(ta), BALA.alvo), q = [h[0] + d[0] * e * 25, h[1] + d[1] * e * 25, h[2] + d[2] * e * 25], yaw = Math.atan2(d[0], d[2]), pit = Math.asin(d[1]);
    push(); translate(q[0], q[1], q[2]); rotateY(yaw); rotateX(-pit); translate(0, 0, -0.16); scale(0.009, 0.009, 0.32); md(G.cubo, { tinta: [1.9, 1.5, 0.9], semLuz: 1, alfa: 0.9 }); pop();
    push(); translate(q[0], q[1], q[2]); scale(0.03); md(G.bolha, { tinta: [1.8, 1.4, 0.8], semLuz: 1, alfa: 0.7 }); pop();
  }
  const cj = estadoCavaloJack(BALA.t).e, cj2 = estadoCavaloJack(BALA.t + 0.05).e, vj = [(cj2.x - cj.x) / 0.05, 0, (cj2.z - cj.z) / 0.05];
  if (e > 0 && e < 0.9) { // fiapos de feltro e pó, que saem com a velocidade dela e da bala e caem
    const pj = poseJackMontada(BALA.t), X = chapeuNoMundo(G.jackFL, pj, L.sai.l), E = chapeuNoMundo(G.jackFL, pj, L.entra.l);
    for (let i = 0; i < 9; i++) { const sp = [hash2(i, 1) - 0.5, hash2(i, 2) - 0.3, hash2(i, 3) - 0.5], v = 2.2 + hash2(i, 4) * 2.5;
      const q = [X[0] + (vj[0] + d[0] * v + sp[0] * 1.5) * e, X[1] + (d[1] * v + sp[1] * 1.5) * e - 4.9 * e * e, X[2] + (vj[2] + d[2] * v + sp[2] * 1.5) * e];
      push(); translate(q[0], q[1], q[2]); rotateX(e * 14 + i); rotateY(e * 9 + i * 2); scale(0.006 + hash2(i, 5) * 0.006, 0.002, 0.008 + hash2(i, 6) * 0.008); md(G.cubo, { tinta: [0.12, 0.09, 0.08] }); pop(); }
    // o pó: some quando a câmera chega perto (no P41b ela vai até o furo, e o pó tapava o fogo bem na chegada)
    if (e < 0.5) for (const [O, k] of [[X, 1], [E, 0.6]]) for (let i = 0; i < 3; i++) { const r = (0.02 + e * 0.22) * (0.7 + hash2(i, 7) * 0.6);
      const q = [O[0] + vj[0] * e * 0.9 + d[0] * e * 0.4 * k, O[1] + e * 0.1, O[2] + vj[2] * e * 0.9 + d[2] * e * 0.4 * k], afasta = clamp01((Math.hypot(q[0] - CAM.olho[0], q[1] - CAM.olho[1], q[2] - CAM.olho[2]) - r - 0.25) / 0.35);
      push(); translate(q[0], q[1], q[2]); scale(r); md(G.bolhaFina, { tinta: [0.5, 0.48, 0.52], alfa: 0.4 * k * (1 - e / 0.5) * afasta, amb: 1, sol: 0.6 }); pop(); }
  }
  const s = ta - t0; // o disparo: clarão no cano e a fumaça que fica para trás no ar
  if (s > 0 && s < 0.06) { push(); translate(L.M[0], L.M[1], L.M[2]); scale(0.16); md(G.bolha, { tinta: [1.8, 1.4, 0.75], semLuz: 1, alfa: 0.95 }); pop(); }
  if (s > 0 && s < 3) for (let i = 0; i < 5; i++) { const r = (0.08 + s * 0.35) * (0.7 + hash2(i, 9) * 0.6);
    push(); translate(L.M[0] + d[0] * (0.3 + i * 0.25) * Math.min(1, s * 3), L.M[1] + s * 0.25, L.M[2] + d[2] * (0.3 + i * 0.25) * Math.min(1, s * 3)); scale(r); md(G.bolhaFina, { tinta: [0.62, 0.62, 0.66], alfa: 0.32 * (1 - s / 3), amb: 1, sol: 0.7 }); pop(); }
  mat({});
}
function luzesBala(ta) { const s = ta - (BALA.t - BALA.voo); return s > 0 && s < 0.08 ? [{ p: linhaBala().M, c: [2.2, 1.6, 0.8], r: 7 }] : []; }
// ================================================================ ELA A CAVALO NO ATO 3
// Mal freia até o passo, tira o diamante da bolsa, abre a coroa e vê a bomba: primeiro a preocupação (o ponteiro já
// anda); traz o diamante para perto e estuda o mostrador, séria; então entende que é a hora do plano: meio sorriso, um
// aceno, e ergue os olhos, decidida. Segue a passo com a bomba nas mãos; ergue a bomba à altura dos olhos para ler o
// ponteiro quando a bala atravessa o chapéu; baixa a bomba, fecha a coroa e guarda o diamante na bolsa enquanto o cavalo
// dispara (a câmera já está no furo e no grupo); no P42a se abaixa no pescoço do cavalo. Senta-se de novo antes da beira
// (o P43 começa com a pose de antes).
// (ve, estuda, pisca, sabe, olha0: vê a bomba, estuda o mostrador, a preocupação passa, entende, ergue os olhos)
const CONF = { pega: 129.5, mao: 129.88, abre0: 130.3, abre1: 131.0, ve: 130.75, estuda0: 132.6, estuda1: 134.05, pisca: 134.45, sabe: 135.3, olha0: 135.85,
  ergue0: 142.35, ergue1: 143.15, baixa0: 144.275, baixa1: 144.395, fecha0: 144.775, fecha1: 145.175, guarda0: 145.125, guarda1: 145.625, // (a bala em 144,27 da ação)
  abaixa0: 147.17, abaixa1: 147.72, sobe0: 148.35, sobe1: 148.95 }; // abaixa no começo do P42a
let _poseJM = { t: NaN, p: null };
function poseJackMontada(ta) {
  if (_poseJM.t === ta) return Object.assign({}, _poseJM.p);
  const p = poseCavaleiro(estadoCavaloJack(ta).e); p.expr = 'determinado';
  if (ta > CONF.pega && ta < CONF.sobe1) confereBomba(p, ta);
  furoNoGrupo(p, ta);
  _poseJM = { t: ta, p: Object.assign({}, p) };
  return p;
}
// O "jogo" do P41b: logo depois da bala, e até ela se abaixar no P42a, a cabeça gira um pouco (de lado, até uns 30°, e para
// cima ou para baixo, uns 5°) para a linha dos dois furos do chapéu apontar sempre para o meio dos três. Sem isso, ela solta o
// giro do corpo ao baixar a bomba e o cavalo vira para oeste, e a câmera que entra pelo furo tinha de fazer uma curva para
// achar o grupo; com isso, ela entra e segue reto, e eles já estão lá. Enquanto a câmera está no chapéu, quem vê não percebe
// (a câmera anda com a cabeça); na bala, o giro é zero (os furos são os da bala).
function furoNoGrupo(p, ta) {
  const w = rampa(ta, BALA.t + 0.005, BALA.t + 0.14, CONF.abaixa0, CONF.abaixa1 + 0.1); if (w <= 0) return;
  const P = G.jackFL, L = linhaBala(), m = centroV(ta), alvo = [m[0], m[1] - 0.4, m[2]], q = Object.assign({}, p);
  const erro = () => { const F = chapeuNoMundo(P, q, L.sai.l), B = chapeuNoMundo(P, q, L.entra.l), ax = normaliza([B[0] - F[0], B[1] - F[1], B[2] - F[2]]), g = normaliza([alvo[0] - B[0], alvo[1] - B[1], alvo[2] - B[2]]);
    const dy = Math.atan2(g[0], g[2]) - Math.atan2(ax[0], ax[2]); return [Math.atan2(Math.sin(dy), Math.cos(dy)), Math.asin(g[1]) - Math.asin(ax[1])]; };
  for (let it = 0; it < 3; it++) { // Newton, de lado e para cima, com as derivadas medidas
    const [ey, ep] = erro(), y0 = q.cabYaw || 0, p0 = q.cabPitch || 0;
    q.cabYaw = y0 + 0.01; const jy = (erro()[0] - ey) / 0.01; q.cabYaw = y0;
    q.cabPitch = p0 + 0.01; const jp = (erro()[1] - ep) / 0.01; q.cabPitch = p0;
    if (Math.abs(jy) > 0.2) q.cabYaw = y0 - ey / jy; if (Math.abs(jp) > 0.2) q.cabPitch = p0 - ep / jp;
  }
  p.cabYaw = lerp1(p.cabYaw || 0, q.cabYaw, w); p.cabPitch = lerp1(p.cabPitch || 0, q.cabPitch, w);
}
function confereBomba(p, ta) {
  const C = CONF, R = Object.assign({}, p), mix = (k, o) => { for (const c in o) p[c] = lerp1(p[c], o[c], k); };
  // a mão direita vai à bolsa, no lado do quadril (para tirar e, depois, para guardar o diamante): por cinemática inversa,
  // a mão no alto da bolsa (a mesma conta do modelo: pelve, (0,236, -0,03 + 0,08, 0,01) × s)
  const naBolsa = rampa(ta, C.pega, C.pega + 0.22, C.mao - 0.04, C.mao + 0.24) + rampa(ta, C.guarda0, C.guarda0 + 0.2, C.guarda1 - 0.05, C.guarda1 + 0.15);
  if (naBolsa > 0) { const q = ikBolsa(p); mix(naBolsa, { ombroD: q[0], abracoD: q[1], cotoveloD: q[2] }); if (naBolsa > 0.05) p.redeasMao = -1; } // as rédeas ficam na outra mão
  // as duas mãos seguram o diamante na frente do peito; erguido, na altura dos olhos
  const segura = rampa(ta, C.mao, C.mao + 0.3, C.fecha1, C.guarda0 + 0.15);
  mix(segura, { ombroE: 0.62, ombroD: 0.62, cotoveloE: 0.95, cotoveloD: 0.95, abracoE: 0.15, abracoD: 0.15 });
  mix(rampa(ta, C.ve, C.ve + 0.45, C.olha0, C.olha0 + 0.45), { ombroE: 0.8, ombroD: 0.8, cotoveloE: 1.0, cotoveloD: 1.0 }); // vê a bomba: traz o diamante um pouco para cima
  const estuda = rampa(ta, C.estuda0, C.estuda0 + 0.6, C.estuda1 - 0.45, C.estuda1); // estuda o mostrador (no P37b): traz o diamante um pouco mais perto e se inclina sobre ele; no P37c já se endireitou (inclinada, a aba e a tampa escondem o rosto)
  mix(estuda, { ombroE: 0.84, ombroD: 0.84, cotoveloE: 1.06, cotoveloD: 1.06 }); p.inclina += 0.07 * estuda;
  const ergue = rampa(ta, C.ergue0, C.ergue1, C.baixa0, C.baixa1);
  mix(ergue, { ombroE: 1.3, ombroD: 1.3, cotoveloE: 1.15, cotoveloD: 1.15 }); // na altura do queixo, uns 40 cm à frente do rosto
  p.torce = (p.torce || 0) + 0.3 * ergue; // gira um pouco o corpo com a bomba erguida, para ler o ponteiro (e a bala sai pela frente da copa, longe da carta)
  const abre = 1.5 * suave(fase0(ta, C.abre0, C.abre1)) * (1 - suave(fase0(ta, C.fecha0, C.fecha1)));
  p.soltaRedeas = rampa(ta, C.mao + 0.05, C.mao + 0.35, C.guarda0 + 0.1, C.guarda1 + 0.25); // larga as rédeas no pescoço enquanto segura o diamante
  if (ta >= C.mao + 0.32 && ta < C.guarda0 + 0.2) p.peito = { nome: 'relogio', meio: 0.15, seg: segBomba(ta), abre, tombaMax: 2.5, inclina: lerp1(-0.05, 0.35, ergue), dy: lerp1(-0.08, -0.05, ergue) }; // erguida, o mostrador vira para ela
  // o olhar: na bomba, à frente (depois do aceno e uma vez no meio), nivelado quando a ergue
  const ve = suave(fase0(ta, C.ve, C.ve + 0.45)), naBomba = segura * (1 - ergue);
  const frente = rampa(ta, C.olha0, C.olha0 + 0.4, 136.9, 137.3) + rampa(ta, 139.0, 139.25, 139.75, 140.0);
  p.cabPitch = lerp1(p.cabPitch, lerp1(lerp1(0.5, 0.2, ve) + 0.1 * estuda, -0.1, frente), naBomba);
  p.cabYaw = (p.cabYaw || 0) - 0.09 * estuda; // a cabeça um pouco de lado, estudando
  p.olhar = naBomba * (1 - frente) > 0.5 ? 0.35 : 0;
  p.cabPitch = lerp1(p.cabPitch, -p.inclina - 0.02, ergue); // nivelada: os olhos no mostrador erguido
  p.cabPitch += 0.12 * rampa(ta, C.sabe, C.sabe + 0.15, C.sabe + 0.25, C.sabe + 0.45); // o aceno: era isso mesmo
  // o tranco da bala: a cabeça encolhe e o chapéu é empurrado para a frente e balança
  const e = ta - BALA.t;
  if (e > 0 && e < 0.9) { const k = rampa(ta, BALA.t, BALA.t + 0.05, BALA.t + 0.12, BALA.t + 0.4); p.cabPitch += 0.14 * k; p.inclina += 0.06 * k;
    p.chapeuGolpe = 0.2 * Math.sin(Math.min(1, e / 0.75) * Math.PI * 2.5) * Math.exp(-e * 4.5); }
  // depois: olha à frente, decidida (é aqui que a câmera chega pela frente ao furo)
  const olha = rampa(ta, C.baixa0, C.baixa1, C.abaixa0, C.abaixa1);
  p.cabPitch = lerp1(p.cabPitch, -p.inclina * 0.85, olha); p.cabYaw = lerp1(p.cabYaw, 0, olha);
  // abaixada no pescoço do cavalo, as mãos nas rédeas lá na frente; senta-se de novo antes da beira
  const abaixa = rampa(ta, C.abaixa0, C.abaixa1, C.sobe0, C.sobe1);
  if (abaixa > 0) { mix(abaixa, { inclina: 0.95, ombroE: 1.05, ombroD: 1.05, cotoveloE: 1.4, cotoveloD: 1.4, abracoE: 0.12, abracoD: 0.12 }); p.cabPitch = lerp1(p.cabPitch, -0.78, abaixa); p.bob = lerp1(p.bob, R.bob - 0.05, abaixa); }
  // a expressão: focada ao abrir; preocupada ao ver a bomba; séria e firme ao estudar o mostrador (uma piscada na troca);
  // meio sorriso no aceno, ao entender que é a hora do plano; de novo séria e firme enquanto confere o ponteiro
  p.expr = ta < C.ve + 0.15 ? 'determinado' : ta < C.pisca ? 'preocupado' : ta < C.pisca + 0.1 ? 'piscar' : ta < C.sabe ? 'resoluta' : ta < 138.6 ? 'confiante'
    : ta < BALA.t + 0.02 ? 'resoluta' : ta < BALA.t + 0.3 ? 'esforco' : 'determinado';
}
// a mão direita no alto da bolsa do quadril: ângulos do braço (ombro, abraço, cotovelo), no referencial do tronco
function ikBolsa(p) {
  const P = G.jackFL, D = P.D, s = D.s, v = [0.236 * s + 0.03, -0.03 * s + 0.085, 0.03]; // na pelve, um pouco por fora e no alto da bolsa
  const w = _ry(_rx(v, -(p.inclina || 0) * 0.6), -(p.torce || 0)); // da pelve para o tronco (a pelve inclina 0,4 da inclinação; o tronco, toda)
  const r = ikMao(D, 1, w, [0.2, 0.25, 0.4], 0, 0.25); return [r.om, r.ab, r.co];
}
// Ela tira o diamante da bolsa: a mão direita vai à bolsa no quadril (mao), sai com ele e o leva até o meio, onde as duas
// mãos o seguram (dali em diante, p.peito, em desenhaPessoa). O diamante na mão é desenhado aqui, no mundo, e termina
// exatamente onde p.peito começa; sai um pouco menor da bolsa e cresce até o tamanho de sempre.
function diamanteTirado(ta) {
  const C = CONF, t0 = C.mao - 0.06, t1 = C.mao + 0.32; if (ta < t0 || ta >= t1) return;
  const P = G.jackFL, p = poseJackMontada(ta), D = P.D, w = suave(fase0(ta, C.mao + 0.04, t1)), mao = maoMundo(P, p, 1);
  const M = [-1, 1].map(sx => { const om = sx < 0 ? p.ombroE : p.ombroD, co = sx < 0 ? p.cotoveloE : p.cotoveloD, gi = (sx < 0 ? p.giroBE : p.giroBD) || 0;
    let lo = -1.2, hi = 0.6; for (let k = 0; k < 18; k++) { const m2 = (lo + hi) / 2; if (Math.abs(maoFK(D, sx, om, m2, co, gi)[0]) > 0.15) hi = m2; else lo = m2; } return maoFK(D, sx, om, lo, co, gi); });
  const alvo = doTronco(P, p, [0, (M[0][1] + M[1][1]) / 2 - 0.08, (M[0][2] + M[1][2]) / 2 - 0.01]); // onde p.peito o põe
  const q = [lerp1(mao[0], alvo[0], w), lerp1(mao[1] - 0.07, alvo[1], w), lerp1(mao[2], alvo[2], w)];
  push(); translate(q[0], q[1], q[2]); rotateY(p.yaw || 0); rotateX(p.pitch || 0); rotateZ(p.rolo || 0); rotateX(p.inclina || 0); rotateY(p.torce || 0); rotateX(-0.05 * w);
  scale(lerp1(0.72, 1, w)); desenhaRelogio({ seg: segBomba(ta) }); pop(); mat({});
}
// distância acumulada ao longo de um trajeto em curva (com cache)
const CACHE_CURVA = new WeakMap();
function distCurva(keys, t) {
  let tab = CACHE_CURVA.get(keys);
  if (!tab) { tab = { t0: keys[0][0], dt: 0.04, d: [0] }; let prev = curva(keys, tab.t0); const t1 = keys[keys.length - 1][0];
    for (let x = tab.t0 + tab.dt; x <= t1 + 1e-6; x += tab.dt) { const c = curva(keys, x); tab.d.push(tab.d[tab.d.length - 1] + Math.hypot(c[0] - prev[0], c[1] - prev[1])); prev = c; }
    CACHE_CURVA.set(keys, tab); }
  const f = (t - tab.t0) / tab.dt; if (f <= 0) return 0; const i = Math.floor(f); if (i >= tab.d.length - 1) return tab.d[tab.d.length - 1];
  return tab.d[i] + (tab.d[i + 1] - tab.d[i]) * (f - i);
}

// ================================================================ CENAS
function luzesVagaoD(ta, k) {
  const L = [];
  if (k <= 0.01) return L;
  for (const lx of [-2.6, 2.6]) L.push({ p: tremP(ta, CX_D + lx, 3.9, 0), c: [0.95 * k, 0.66 * k, 0.38 * k], r: 7 });
  for (const tx of MESAS) for (const s of [-1, 1]) L.push({ p: tremP(ta, CX_D + tx, PISO + 1.15, s * 1.15), c: [0.5 * k, 0.32 * k, 0.16 * k], r: 2.4 });
  L.push({ p: tremP(ta, CX_D - 6.3, 3.0, -0.6), c: [0.9 * k, 0.6 * k, 0.3 * k], r: 4 });
  return L;
}
function luzVagaoD(ta) { // apagão no túnel, com tremulações
  if (ta < 46.1 || ta > 52.9) return 1;
  if (ta < 46.6) return 0.5 + 0.5 * Math.sin(ta * 80) * (1 - fase0(ta, 46.1, 46.6));
  if (ta > 52.48) return 0.6 + 0.4 * Math.sin(ta * 60) * (1 - fase0(ta, 52.48, 52.9));
  // dois clarões rápidos revelam a silhueta
  const pulso = (c) => Math.max(0, 1 - Math.abs(ta - c) / 0.09) * 0.55;
  return pulso(47.75) + pulso(48.35) + pulso(50.4);
}
function desenhaPessoaRef(est, ta, opt = {}) {
  if (!est || !est.p) return;
  const p = Object.assign({}, est.p);
  if (est.onde === 'D' || est.onde === 'trem') { p.x += xLoco(ta); p.y += Y_TRILHO; }
  desenhaPessoa(est.P, p, Object.assign({ semChapeu: est.semChapeu }, opt));
}
function cenaTrem(ta, o = {}) {
  const dentro = !!o.dentroD;
  const kD = luzVagaoD(ta);
  ESTADO.dentroD = dentro; ESTADO.luzD = kD; ESTADO.vidroClaroD = !!o.vidroClaroD;
  ESTADO.vidrosAcesos = ta < 30 ? 0.75 : 1;
  ESTADO.portaS = aberturaPortaS(ta);
  AMB.luzes = AMB.luzes.concat(luzesVagaoD(ta, kD));
  if (AMB.lua > 0.5) AMB.luzes.push({ p: tremP(ta, 0.6, 3.4, 0), c: [1.6, 1.25, 0.7], r: 34 });
  AMB.luzes.push({ p: tremP(ta, CX_S, 3.3, 0.6), c: [1.1, 0.72, 0.36], r: 6.5 }); if (Math.hypot(CAM.olho[0] - (xLoco(ta) + CX_S), CAM.olho[2]) < 40) AMB.luzes.push(...luzesS(ta));
  if (uniformesLuz) uniformesLuz();
  if (o.mundo !== false) desenhaMundo();
  mat({});
  desenhaTrem(ta);
  // interior do vagão-restaurante
  const perto = Math.abs(CAM.olho[0] - tremP(ta, CX_D, 0, 0)[0]) < 22 && Math.abs(CAM.olho[2]) < 14;
  if (perto || dentro) {
    push(); translate(xLoco(ta) + CX_D, Y_TRILHO, 0);
    md(G.interiorD, { sol: dentro ? 0.12 : 0.3, amb: (dentro ? 0.42 : 0.6) * (0.25 + 0.75 * kD), emis: 1.35 * kD + 0.05 });
    // cartaz na parede da frente
    push(); translate(7.43, 2.78, 0.98); rotateY(-Math.PI / 2); scale(0.4, 0.56, 1); md(G.quadro, { tex: TX.cartaz, sol: 0.1, amb: 0.6 * (0.3 + 0.7 * kD) }); pop();
    // o diamante no pedestal da vitrine (até o roubo); depois, o pedestal vazio com a carta entre as garras
    push(); translate(6.05, PISO + 1.0, 0.82); rotateY(-Math.PI / 2 + 0.3);
    mat({ sol: 0.1, amb: 0.7, emis: 1.2 });
    if (ta < 48.6) desenhaRelogio({ seg: ta * 4, estrela: ta < 15.4 ? 1 : 0.45, suporte: true });
    else { desenhaRelogio({ suporte: true, semDiamante: true });
      // a carta virada para quem fica diante da vitrine (o P14a e o xerife)
      translate(0, DIAM.yCinta - 0.015, 0.006); rotateY(-0.86); rotateX(-0.12); scale(0.11, 0.155, 1); md(G.quadro, { tex: TX.carta, sol: 0.1, amb: 0.85 * (0.3 + 0.7 * kD) }); }
    pop(); mat({});
    // bule balançando na mesa, depois que ela some
    // pousado às pressas, o bule ainda balança quando o xerife se volta
    if (ta >= 58.5 && ta < 70) { push(); translate(CAFE.buleMesa[0], PISO + CAFE.topoMesa, CAFE.buleMesa[1]); rotateZ(Math.sin((ta - 58.5) * 9) * 0.35 * Math.exp(-(ta - 58.5) * 0.42)); md(G.bule, { sol: 0.1, amb: 0.6, brilho: 1 }); pop(); }
    if (ta > CAFE.t0 && ta < 77.5) { push(); translate(CAFE.xicara[0], PISO + CAFE.topoMesa, CAFE.xicara[1]); rotateY(0.6); md(G.xicara, { sol: 0.1, amb: 0.65, brilho: 1 });
      const nivel = clamp01((ta - 57.6) / 0.5); if (ta > 57.6) { translate(0, 0.019 + 0.034 * nivel, 0); scale(0.027 + 0.011 * nivel, 1, 0.027 + 0.011 * nivel); md(G.disco, { tinta: [0.22, 0.12, 0.06], sol: 0.1, amb: 0.6 }); } pop(); }
    // o avental: no chão e, do P18a em diante, nas mãos do xerife
    desenhaAventalXerife(ta);
    // o vestido verde que ela arrancou na porta, junto do avental, fora do caminho do xerife; fica até o fim das cenas no vagão
    if (ta > 59.8 && ta < 77.5) { const m0 = MAT.ultimo; push(); translate(VESTIDO_CHAO[0], PISO + 0.004, VESTIDO_CHAO[1]); rotateY(VESTIDO_CHAO[2]); md(G.vestidoChao, { sol: 0.2, amb: 1.05 * (0.3 + 0.7 * kD) }); pop(); mat(m0 || {}); }
    // a bandeja que ela deixou no balcão, com o material de quando estava na mão dela (antes herdava o do café da xícara,
    // que vazava, e ficava marrom-escura)
    if (ta >= 59.33 && ta < 77.5) { push(); translate(CAFE.balcao[0], PISO + CAFE.balcao[1] + 0.008, CAFE.balcao[2]); rotateY(-Math.PI / 2); md(G.bandeja, matGenteD()); pop(); }
    // a taça que cai em câmera lenta e se espatifa
    if (ta > 53.05 && ta < 57) {
      const u = fase0(ta, 53.05, 54.9);
      if (u < 1) { push(); translate(2.95, lerp1(PISO + 1.05, PISO + 0.06, u * u), 0.72); rotateZ(u * 2.2); rotateX(u * 1.1); md(G.taca, { sol: 0.1, amb: 0.8, brilho: 2 }); pop(); }
      else { const s = ta - 54.9; for (let i = 0; i < 14; i++) { const a = i * 2.39, v = 0.4 + hash2(i, 3) * 0.9; push(); translate(2.95 + Math.cos(a) * v * Math.min(s, 0.5), PISO + 0.03 + Math.max(0, Math.sin(Math.min(s * 4, 3.1)) * 0.12 * hash2(i, 5)), 0.72 + Math.sin(a) * v * Math.min(s, 0.5)); rotateY(a); scale(0.02 + hash2(i, 7) * 0.02, 0.004, 0.015); md(G.cubo, { tinta: [0.85, 0.92, 0.98], brilho: 3, sol: 0.2, amb: 0.9 }); pop(); }
        push(); translate(2.95, PISO + 0.006, 0.72); rotateX(Math.PI / 2); scale(0.22 * Math.min(1, (ta - 54.9) * 2)); md(G.disco, { tinta: [0.85, 0.7, 0.3], alfa: 0.6, sol: 0.1, amb: 0.8 }); pop(); }
    }
    pop();
    mat({ sol: dentro ? 0.15 : 1, amb: dentro ? 0.5 * (0.25 + 0.75 * kD) : 1 });
    // convidados (o Barão sai pela porta da frente no P09c e, a partir do P10, é desenhado na plataforma da estação)
    for (const [i, x, lado, olha] of ASSENTOS) desenhaPessoa(G.convidados[i], deslocaTrem(poseConvidado(i, x, lado, olha, ta), ta));
    if (ta < B_SAI) desenhaPessoaRef(estadoBarao(ta), ta);
    { const ex = estadoXerife(ta); if (ex.onde !== 'trem') desenhaPessoaRef(ex, ta); } // no teto ele é desenhado lá embaixo, com os outros de fora
    const ej = estadoJack(ta); if (ej.onde === 'D' || (ej.onde === 'trem' && ta < 77.5)) desenhaPessoaRef(ej, ta);
    for (const a of estadoAjudantes(ta)) if (a.onde === 'D') desenhaPessoaRef(a, ta);
    desenhaCafe(ta);
    desenhaCartazXerife(ta);
    desenhaCargaJack(ta);
    mat({});
    // vidro da vitrine
    if (ta < 70) { push(); translate(xLoco(ta) + CX_D + 6.05, Y_TRILHO + PISO + 1.33, 0.82); scale(0.58, 0.58, 0.58); md(G.cubo, { tinta: [0.8, 0.9, 1.0], alfa: 0.12, semLuz: 0.6 }); pop(); mat({}); }
  }
  // gente fora: Barão na plataforma, perseguição nos tetos, ajudantes
  if (ta >= B_SAI && ta < 60) desenhaPessoaRef(estadoBarao(ta), ta);
  const ej = estadoJack(ta); if (ej.onde === 'trem' && ta >= 77.5) desenhaPessoaRef(ej, ta);
  const pertoS = Math.hypot(CAM.olho[0] - (xLoco(ta) + CX_S), CAM.olho[2]) < 40;
  // o que fica no chão do vagão dos cavalos vem antes das pessoas: a sombra de contato delas (translúcida, mas gravando a
  // profundidade) escondia o cabo do ancinho entre os pés do xerife
  if (pertoS && ta > 100 && ta < 141) { desenhaAncinho(ta); desenhaChapeuXerifeS(ta); desenhaArmaXerifeS(ta); mat({}); }
  const ex = estadoXerife(ta); if (ex.onde === 'trem') desenhaPessoaRef(ex, ta);
  for (const a of estadoAjudantes(ta)) if (a.onde === 'trem') desenhaPessoaRef(a, ta);
  if (ta > LEQUE.solta && ta < 130) desenhaLeque(ta);
  // cavalos no vagão S
  if (pertoS && ta < 138.5) desenhaLampiaoS(ta);
  if (pertoS) for (const tt of TIROS_S) if (ta > tt.t && ta < tt.t + 0.07) { const q = tremP(ta, CX_S + tt.x, tt.y, tt.z); push(); translate(q[0], q[1], q[2]); scale(tt.t > 120 ? 0.32 : 0.13); md(G.bolha, { tinta: [1.6, 1.3, 0.7], semLuz: 1, alfa: 0.95 }); pop(); mat({}); }
  if (pertoS && ta < 138.5) for (const g of GRUPO) { const c = estadoCavaloGrupo(g, ta); if (c.onde === 'baia' || c.onde === 'vagao') { desenhaCavalo(g.C(), c.e); desenhaArreios(c.e, null, null); } } // os três do grupo do xerife, nas baias
  if (ta < 140 && ta > 100) {
    const cj = estadoCavaloJack(ta);
    desenhaCavalo(G.cavaloPreto, cj.e);
    if (ta >= 104.6) desenhaJackMontada(ta, cj);
  }
  desenhaFumaca(ta, 1, AMB.lua > 0.5 ? [0.42, 0.44, 0.52] : [0.85, 0.72, 0.66]);
  desenhaVidrosTrem(ta);
}
// porta de correr do vagão dos cavalos: Jack abre um vão com o pé; depois sai a cavalo. Função do tempo (o plano P29
// usa a abertura para a luz que escapa antes de a cena ser desenhada: lida do ESTADO, vinha do quadro anterior)
// abre enquanto ela vira o cavalo para ela
function aberturaPortaS(ta) { return 0.45 * suave(fase0(ta, 102.75, 103.1)) + 0.55 * fase0(ta, 120.55, 121.4); }
// a porta da frente do restaurante: o Barão a abre para sair (30,6 s) e a fecha atrás de si, já na plataforma da ponta (32,55 s);
// ela abre de novo quando os ajudantes chegam do tênder (62,2 s) e fica aberta
function portaDFrente(ta) { return 0.95 * (suave(fase0(ta, 30.62, 31.15)) - suave(fase0(ta, 32.0, 32.55))) + 1.6 * suave(fase0(ta, 61.95, 62.3)); }
// ângulo da porta de trás do restaurante: Jack sai (61,0) e fecha; o xerife a escancara para persegui-la (77,1)
function portaD(ta) { return 1.55 * (suave(fase0(ta, 59.5, 59.75)) * (1 - suave(fase0(ta, 60.15, 60.45))) + suave(fase0(ta, 77.05, 77.3))); } // ela sai durante o P16a, fora de quadro
// lampião pendurado sobre a porta da frente do vagão dos cavalos; balança depois do tiro
const TIROS_S = [{ t: 118.4, x: 1.02, y: 3.49, z: -0.27, luz: 0.45 }, { t: 124.1, x: 0.26, y: 2.23, z: -1.83 }, { t: 124.55, x: 0.36, y: 1.98, z: -1.8 }];
function balancoLampiao(ta) { return ta > 118.4 ? 0.35 * Math.sin((ta - 118.4) * 5.5) * Math.exp(-(ta - 118.4) * 0.45) : 0.03 * Math.sin(ta * 1.9); }
function desenhaLampiaoS(ta) {
  const q = tremP(ta, CX_S + 6.55, ALT.parede - 0.02, -0.3);
  push(); translate(q[0], q[1], q[2]); rotateX(balancoLampiao(ta));
  push(); translate(0, -0.2, 0); scale(0.012, 0.4, 0.012); md(G.cubo, { tinta: [0.15, 0.13, 0.12] }); pop();
  push(); translate(0, -0.44, 0); scale(0.17, 0.05, 0.17); md(G.cubo, { tinta: [0.22, 0.17, 0.12] }); pop();
  push(); translate(0, -0.58, 0); scale(0.075, 0.1, 0.075); md(G.bolha, { tinta: [1.6, 1.05, 0.5], semLuz: 1 }); pop();
  push(); translate(0, -0.7, 0); scale(0.15, 0.03, 0.15); md(G.cubo, { tinta: [0.22, 0.17, 0.12] }); pop();
  pop(); mat({});
}
function luzesS(ta) {
  const L = [], a = balancoLampiao(ta), q = tremP(ta, CX_S + 6.55, ALT.parede - 0.6, -0.3 - Math.sin(a) * 0.58);
  L.push({ p: q, c: [2.1, 1.35, 0.62], r: 6.5 });
  for (const tt of TIROS_S) if (ta > tt.t && ta < tt.t + 0.09) { const k = tt.luz ?? 1; L.push({ p: tremP(ta, CX_S + tt.x, tt.y, tt.z), c: [2.8 * k, 2.0 * k, 1.0 * k], r: 6 }); }
  return L;
}
// O chapéu do xerife cai da cabeça quando ele acaba de cair de joelhos (ANC.chapeu0), tomba e para na palha ao lado dos joelhos dele, um
// pouco inclinado sobre a aba, e balança até assentar; fica lá até ele o pegar (ANC.pega1). A arma esquerda cai da mão aberta
// (ANC.arma0), quica na palha e fica deitada de lado, um pouco à frente. As poses de partida vêm do xerife naquele instante (calculadas uma vez, no referencial do trem).
let _quedaS = null;
function quedaS() {
  if (_quedaS) return _quedaS;
  const e = estadoXerife(ANC.chapeu0), P = e.P, p = e.p, o = doCabeca(P, p, [0, 0.1 * P.D.s, 0]);
  const ea = estadoXerife(ANC.arma0), m = maoMundo(ea.P, ea.p, -1);
  return (_quedaS = { o, rx: (p.inclina || 0) + (p.cabPitch || 0), ry: p.yaw + (p.torce || 0) + (p.cabYaw || 0), m, mry: ea.p.yaw });
}
function desenhaChapeuXerifeS(ta) {
  if (ta < ANC.chapeu0 || ta >= ANC.pega1) return;
  // a aba (0,095 m abaixo da origem) na palha
  const Q = quedaS(), u = fase0(ta, ANC.chapeu0, ANC.chapeu1), base = ALT.piso + PALHA_S - 0.095 * 1.19 + 0.03;
  const fim = [CX_S + CHAPEU_CHAO[0], base, CHAPEU_CHAO[1]];
  const x = lerp1(Q.o[0], fim[0], u), z = lerp1(Q.o[2], fim[2], suave(u)), y = lerp1(Q.o[1], fim[1], u * u) + 0.03 * Math.sin(u * Math.PI) * (1 - u);
  const balanco = ta > ANC.chapeu1 ? 0.12 * Math.sin((ta - ANC.chapeu1) * 16) * Math.exp(-(ta - ANC.chapeu1) * 7) : 0;
  const rx = lerp1(Q.rx, 0.1, suave(u)) + balanco, ry = Q.ry + 1.1 * suave(u), w = tremP(ta, x, y, z);
  push(); translate(w[0], w[1], w[2]); rotateY(ry); rotateX(rx); model(G.xerife.P.chapeu); pop();
}
function desenhaArmaXerifeS(ta) {
  if (ta < ANC.arma0) return;
  const Q = quedaS(), u = fase0(ta, ANC.arma0, ANC.arma1), chao = ALT.piso + PALHA_S + 0.011, fim = [CX_S + ARMA_CHAO[0], chao, ARMA_CHAO[1]];
  const quica = ta > ANC.arma1 ? 0.05 * Math.sin(fase0(ta, ANC.arma1, ANC.arma1 + 0.18) * Math.PI) : 0;
  const ql = Q.m, y = lerp1(ql[1], fim[1], u * u) + quica;
  const w = tremP(ta, lerp1(ql[0], fim[0], u), y, lerp1(ql[2], fim[2], u));
  push(); translate(w[0], w[1], w[2]); rotateY(Q.mry + 0.9 * suave(u)); rotateZ(Math.PI / 2 * suave(fase0(u, 0.2, 1))); rotateX(-0.5 * Math.sin(u * Math.PI)); model(G.revolver); pop();
}
function deslocaTrem(p, ta) { p.x += xLoco(ta); p.y += Y_TRILHO; return p; }
function desenhaJackMontada(ta, cj) {
  // salta para a sela, do lado esquerdo do cavalo
  if (cj.montada && ta < ANC.monta0 + 0.6) {
    const k = suave((ta - ANC.monta0) / 0.6), a = poseJackNoVagao(ta), b = poseCavaleiro(cj.e); b.expr = 'determinado';
    desenhaPessoa(G.jackFL, misturaPose(a, b, k), { cavalo: k > 0.3 ? cj.e : null, pernasVisiveis: k > 0.3 }); return;
  }
  // a pé, dentro do vagão
  if (!cj.montada) { desenhaPessoa(G.jackFL, poseJackNoVagao(ta)); desenhaDiamanteS(ta); return; }
  const base = {};
  const p = poseCavaleiro(cj.e, base); p.expr = 'determinado';
  if (cj.e.salto) { p.inclina = 0.7; p.ombroE = p.ombroD = 1.2; }
  desenhaPessoa(G.jackFL, p, { pernasVisiveis: true, cavalo: cj.e });
}

// cena do cânion: trem parado, cavaleiros, carroça, poeira e explosão
function cenaCanion(ta, o = {}) {
  // o mesmo estado do trem que a cenaTrem calcula (sem isso, vinha do último quadro desenhado no trem: indo direto
  // do Ato 1 para cá, a porta do vagão dos cavalos ficava fechada enquanto o grupo saía por ela)
  ESTADO.dentroD = false; ESTADO.luzD = luzVagaoD(ta); ESTADO.vidrosAcesos = 1; ESTADO.portaS = aberturaPortaS(ta);
  const pertoS = Math.hypot(CAM.olho[0] - (xLoco(ta) + CX_S), CAM.olho[2]) < 60;
  if (pertoS && ta < 141) AMB.luzes.push({ p: tremP(ta, CX_S, 3.3, 0.6), c: [1.1, 0.72, 0.36], r: 6.5 }, ...luzesS(ta)); // o lampião do vagão dos cavalos, enquanto o grupo sai
  if (AMB.lua > 0.5) AMB.luzes.push({ p: tremP(ta, 0.6, 3.4, 0), c: [1.6, 1.25, 0.7], r: 34 });
  if (ta > 142 && ta < 144) AMB.luzes.push(...luzesBala(ta));
  if (ta > 144.5 && ta < 146) AMB.luzes.push(...luzesTirosC(ta)); // os tiros da perseguição
  if (ta > BALA.t && ta < BALA.t + 4.6) AMB.luzes.push(...luzesFogoChapeu(ta)); // o fogo nos furos do chapéu
  const ex = explosao(ta); if (ex.k > 0.02) { const cg = cogumelo(ex.u), kl = 0.12 * ex.k + ex.kL; AMB.luzes.push({ p: [EXPL.x, Math.min(cg.H, 30), EXPL.z], c: [5 * kl, 2.8 * kl, 1.1 * kl], r: 420 }); }
  uniformesLuz();
  desenhaMundo();
  desenhaTrem(ta);
  desenhaVidrosTrem(ta);
  if (ta < 140.2) desenhaFaiscas(ta);
  desenhaFumaca(ta, ta > 140 ? 0.5 : 1, [0.42, 0.44, 0.52]);
  // Jack
  if (ta > SALTO.cai - 0.01) {
    const cj = estadoCavaloJack(ta);
    if (ta < 176.6) desenhaCavalo(G.cavaloPreto, cj.e);
    if (!cj.montada && ta < 176.6) desenhaArreios(cj.e, null, null); // sem ela, as rédeas ficam soltas sobre o pescoço
    if (cj.montada) { desenhaPessoa(G.jackFL, poseJackMontada(ta), { pernasVisiveis: true, cavalo: cj.e }); diamanteTirado(ta); }
    else if (ta < 154.0) desenhaPessoa(G.jackFL, misturaPose(poseCavaleiro(cj.e), poseDueloJack(ta), suave(ta - 153.0)), { pernasVisiveis: true });
    else desenhaPessoa(G.jackFL, poseDueloJack(ta));
  }
  // o grupo do xerife: montados nas baias do vagão (só vistos de perto), a saída pela porta, o salto e o galope
  if (pertoS && ta < 141) desenhaLampiaoS(ta);
  for (const g of GRUPO) {
    const c = estadoCavaloGrupo(g, ta); if ((c.onde === 'baia' || c.onde === 'vagao') && !pertoS) continue;
    desenhaCavalo(g.C(), c.e);
    const n = AJ_PE.findIndex(a => a.g === GRUPO.indexOf(g)), desce = n < 0 ? 153.6 : AJ_PE[n].desce; // os três apeiam e a cercam
    if (ta < desce) { desenhaPessoa(g.P(), poseGrupo(g, ta, c), { pernasVisiveis: true, cavalo: c.e }); continue; }
    const pe = n < 0 ? poseDueloXerife(ta) : poseDueloAjud(n, ta);
    if (ta < desce + 1.0) desenhaPessoa(g.P(), misturaPose(poseGrupo(g, ta, c), pe, suave(ta - desce)), { pernasVisiveis: true });
    else desenhaPessoa(g.P(), pe);
    desenhaArreios(c.e, null, null); // apeou: as rédeas ficam soltas
  }
  // poeira dos cascos e a bala
  poeira(TRAJ_JACK, ta, SALTO.cai, 153.0, te => te > 148.6 ? 1 : 0.12 + 0.88 * clamp01((rumo(t => curva(TRAJ_JACK, t), te, 0.1).v - 2.5) / 6));
  for (const g of GRUPO) poeira(g.traj, ta, g.traj[0][0], g.id === 'xerife' ? 153.0 : 153.4);
  if (ta > BALA.t && ta < BALA.t + 5.5) fogoChapeu(ta); // antes do pó do impacto, que passa por cima
  desenhaBala(ta); if (ta > 144.5 && ta < 147.2) desenhaTirosC(ta);
  // ela vai embora: passou pelo xerife enquanto ele olhava o caco e segue a galope, em linha reta, na direção da lua
  if (ta >= 180) {
    const [x, z] = trilhaH(CAV_SAIDA, ta), [vx, vz] = velCaminho(CAV_SAIDA, ta), v = Math.hypot(vx, vz);
    const e = { x, y: alturaTerreno(x, z), z, yaw: Math.atan2(vx, vz), passo: faseCavalo(CAV_SAIDA, ta), passada: passada(v), terreno: true, galope: suave(v / 7), trote: sstep(2.0, 3.0, v) * (1 - sstep(6.5, 8.5, v)), pescoco: 0 };
    desenhaCavalo(G.cavaloPreto, e); const pj = poseCavaleiro(e); pj.expr = 'determinado'; desenhaPessoa(G.jackFL, pj, { pernasVisiveis: true, cavalo: e });
  }
  // o diamante devolvido, a bomba arremessada e a explosão
  desenhaDiamanteDevolvido(ta);
  desenhaBombaNaMao(ta);
  desenhaArremesso(ta);
  desenhaExplosao(ta);
  desenhaFinal(ta);
}
function poeira(traj, ta, t0, t1, forca) { // forca(te): quanto pó levanta (a passo, pouco)
  particulas({ taxa: 14, vida: 2.4, ate: ta, inicio: t0, fim: t1, desenha: (i, te, u, idade) => {
    const [x, z] = curva(traj, te); const y = alturaTerreno(x, z), k = forca ? forca(te) : 1; if (k <= 0.01) return;
    const r = 0.25 + idade * 0.85;
    const px = x + noise1(i * 0.7) * 1.2, py = y + 0.3 + idade * 0.7, pz = z + noise1(i * 0.9 + 3) * 1.2;
    const dc = Math.hypot(px - CAM.olho[0], py - CAM.olho[1], pz - CAM.olho[2]), fade = clamp01((dc - 2.5) / 8);
    if (fade <= 0) return;
    const gl = drawingContext, some = fade < 1; if (some) gl.depthMask(false); // o pó que some perto da câmera não tapa o que está atrás (antes, o pó do cavalo dela, quase invisível, escondia o do grupo no P41b)
    push(); translate(px, py, pz); scale(r, r * 0.55, r);
    md(G.bolhaFina, { tinta: AMB.lua > 0.5 ? [0.42, 0.42, 0.5] : [0.8, 0.62, 0.48], alfa: (1 - u) * 0.3 * fade * k, amb: 0.9, sol: 0.7, borda: 0.4 }); pop();
    if (some) gl.depthMask(true);
  } });
  mat({});
}
// duelo e arremesso (a pé, na borda da garganta)
const D_DIR = (() => { const dx = DUELO.xerife[0] - DUELO.jack[0], dz = DUELO.xerife[1] - DUELO.jack[1], l = Math.hypot(dx, dz); return [dx / l, dz / l]; })();
const lerp2 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
// O cerco, sem tiros: o xerife e os dois ajudantes apeiam, sacam e avançam devagar com as armas apontadas; ela recua de
// frente para eles até perto da beira, a garganta atrás, as mãos um pouco abertas. O xerife para e estende a mão: ela tira
// o diamante da bolsa, mostra-o e o joga para ele num arco por baixo, como quem devolve (em câmera lenta, na linha 44 da
// música); o diamante cai aos pés dele, quica, para e, na linha 45, a coroa se abre: está oco (não se vê quando ela tirou a
// bomba). Ele olha o diamante vazio e depois ergue os olhos para ela. Na linha 46 ela mostra a bomba na mão, confiante, e,
// sem olhar, joga-a para trás por cima do ombro, na garganta (câmera lenta na soltura).
const J1 = [1003.4, -131.6];                                                                  // onde ela para, de frente para eles; a beira fica uns 3,5 m atrás
const COB = J1;                                                                               // de onde ela joga o diamante e a bomba
const XERIFE_DEPOIS = (() => { const dx = DUELO.xerife[0] - J1[0], dz = DUELO.xerife[1] - J1[1], l = Math.hypot(dx, dz); return [J1[0] + dx / l * 10.5, J1[1] + dz / l * 10.5]; })(); // onde o xerife para, a 10,5 m dela (e fica até o fim)
const J_RECUA = [[154.6, DUELO.jack[0], DUELO.jack[1]], [157.0, J1[0], J1[1]], [200, J1[0], J1[1]]];
const X_AVANCO = [[154.2, DUELO.xerife[0], DUELO.xerife[1]], [154.6, DUELO.xerife[0], DUELO.xerife[1]], [158.5, XERIFE_DEPOIS[0], XERIFE_DEPOIS[1]], [200, XERIFE_DEPOIS[0], XERIFE_DEPOIS[1]]];
// os dois ajudantes: apeiam ao lado dos cavalos, ao norte (o primeiro) e a nordeste (o segundo) dela, sacam e chegam mais perto
const AJ_PE = [
  { g: 1, desce: 153.45, saca: 154.45, caminho: [[153.45, 1002.6, -112.6], [154.6, 1002.6, -112.6], [157.9, 1003.6, -117.4], [200, 1003.6, -117.4]] },
  { g: 2, desce: 153.55, saca: 154.5, caminho: [[153.55, 1018.75, -114.0], [154.7, 1018.75, -114.0], [158.1, 1014.4, -120.2], [200, 1014.4, -120.2]] }];
// a saída dela: uma reta à esquerda dos três, rumo ao horizonte livre entre a garganta e a mesa, onde fica a lua do fim (AMB.luaDir nos planos P53a e P54)
const SAIDA = { d: [0.9877, 0.1564], lado: -1.8, v: 9 };
function pontoSaida(s) { const [dx, dz] = SAIDA.d; return [XERIFE_DEPOIS[0] + dx * s - dz * SAIDA.lado, XERIFE_DEPOIS[1] + dz * s + dx * SAIDA.lado]; }
const CAV_SAIDA = [176, 178, 180, 186, 192].map(t => [t, ...pontoSaida(3 + SAIDA.v * (t - 180))]);
const CAV_FOGE = [[170.95, 1006.0, -125.0], [171.6, 1006.0, -125.0], [172.55, 1009.3, -119.6], [173.85, 1012.6, -110.0], [175.65, 1018.5, -97.0], [177.65, 1026, -80], [200, 1026, -80]]; // o cavalo dela, assustado pela explosão, dispara entre os dois ajudantes
// o diamante devolvido: sai da mão dela num arco, toca o chão perto do xerife, quica, rola, para deitado e, um instante
// depois, a coroa se abre de estalo (com um pequeno rebote): está oco. chao: onde ele para, a 1,15 m do xerife
const DEVOLVE = (() => { const dx = J1[0] - XERIFE_DEPOIS[0], dz = J1[1] - XERIFE_DEPOIS[1], l = Math.hypot(dx, dz);
  return { solta: 160.78, cai: 162.08, quica: 162.36, para: 162.58, abre0: 163.25, abre1: 163.75, chao: [XERIFE_DEPOIS[0] + dx / l * 1.15, XERIFE_DEPOIS[1] + dz / l * 1.15] }; })();
function posXerife(ta) { return trilhaH(X_AVANCO, ta); }
function posJack(ta) { return trilhaH(J_RECUA, ta); }
function posAjud(i, ta) { return trilhaH(AJ_PE[i].caminho, ta); }
// o centro dos três, para onde ela se vira quando os encara
function centroCaca(ta) { const a = posXerife(ta), b = posAjud(0, ta), c = posAjud(1, ta); return [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3]; }
// vira a cabeça (e, se preciso, o tronco) para olhar um ponto no mundo, com peso k
function virarCabecaPara(p, P, alvo, k) { // (outro nome: olharPara, do Ato 1, devolve só o giro da cabeça)
  if (k <= 0) return; const y = cabecaY(P, p), dx = alvo[0] - p.x, dz = alvo[2] - p.z, d = Math.hypot(dx, dz);
  let a = Math.atan2(dx, dz) - p.yaw - (p.torce || 0); a = Math.atan2(Math.sin(a), Math.cos(a));
  const pit = Math.atan2(y - alvo[1], d) - (p.inclina || 0);
  p.cabYaw = lerp1(p.cabYaw || 0, Math.max(-1.1, Math.min(1.1, a)), k); p.cabPitch = lerp1(p.cabPitch || 0, Math.max(-0.6, Math.min(0.85, pit)), k);
  if (Math.abs(a) > 1.1) p.torce = lerp1(p.torce || 0, Math.sign(a) * Math.min(0.5, Math.abs(a) - 1.1), k);
}
const _ikJ = new Map(); // as contas de cinemática inversa dela, por quadro (a pose é pedida várias vezes por quadro)
function ikJack(nome, p, f) { const ch = nome + '|' + p.inclina.toFixed(3) + '|' + (p.torce || 0).toFixed(3); let r = _ikJ.get(ch); if (!r) { if (_ikJ.size > 400) _ikJ.clear(); r = f(p); _ikJ.set(ch, r); } return r; }
function poseDueloJack(ta) {
  const P = G.jackFL, D = P.D, [x, z] = posJack(ta), [vx, vz] = velCaminho(J_RECUA, ta), v = Math.hypot(vx, vz);
  const xs = posXerife(ta), aX = Math.atan2(xs[0] - x, xs[1] - z), cc = centroCaca(ta), aC = Math.atan2(cc[0] - x, cc[1] - z);
  const p = poseDe(P, x, alturaTerreno(x, z), z, lerpAng(aX, aC, 0.3)); // de frente para eles, um pouco mais para o xerife
  const mix = (k, o) => { if (k > 0) for (const c in o) p[c] = lerp1(p[c], o[c], k); };
  respira(p, ta, 2);
  if (ta < 154.2) { const u = fase0(ta, 153.4, 154.2); p.quadE = lerp1(1.2, 0, u); p.joelhoE = lerp1(1.5, 0.1, u); }
  // recua até perto da beira sem dar as costas: o ciclo do andar com a fase correndo ao contrário (passos para trás)
  if (ta > 154.5 && ta < 157.2) { const q = Object.assign({}, p); andar(q, -faseCaminho(J_RECUA, ta, 0.75), 0.8); const k = clamp01(v / 0.4);
    for (const c of ['quadE', 'quadD', 'joelhoE', 'joelhoD', 'bob']) p[c] = lerp1(p[c], q[c], k); }
  // os olhos correm do xerife para os ajudantes, à direita dela, e voltam
  if (ta >= 155.3 && ta < 157.6) {
    p.olhar = ta > 155.6 && ta < 155.95 ? -0.6 : ta > 155.95 && ta < 156.3 ? -1 : 0;
    p.cabYaw += 0.12 * rampa(ta, 155.55, 155.65, 155.95, 156.05) + 0.22 * rampa(ta, 155.95, 156.05, 156.25, 156.35);
  }
  // as mãos um pouco abertas, longe da bolsa: calma (a direita até ir à bolsa; a esquerda até a bomba)
  mix(rampa(ta, 154.8, 155.5, 158.75, 159.0), { ombroD: 0.3, abracoD: 0.28, cotoveloD: 0.72 });
  mix(rampa(ta, 154.8, 155.5, 164.9, 165.3), { ombroE: 0.3, abracoE: 0.28, cotoveloE: 0.72 });
  // o diamante: a mão direita vai à bolsa, tira o diamante e o mostra a eles; depois o joga num arco por baixo, para o xerife
  const b = ikJack('bolsa', p, ikBolsa);
  mix(rampa(ta, 158.75, 159.05, 159.1, 159.35), { ombroD: b[0], abracoD: b[1], cotoveloD: b[2] });
  const ms = ikJack('mostra', p, q => { const r = ikMao(D, 1, [0.17, D.tronco + 0.02 * D.s, 0.4], [1.2, 0.2, 0.9]); return [r.om, r.ab, r.co]; });
  mix(rampa(ta, 159.2, 159.7, 160.42, 160.56), { ombroD: ms[0], abracoD: ms[1], cotoveloD: ms[2] });
  mix(rampa(ta, 160.42, 160.58, 160.6, 160.72), { ombroD: -0.3, abracoD: 0.12, cotoveloD: 0.3, torce: -0.1 });                 // o braço vai para trás
  mix(rampa(ta, 160.6, 160.8, 160.88, 161.5), { ombroD: 1.4, abracoD: 0.06, cotoveloD: 0.12, torce: 0.08, inclina: 0.03 });    // e vem por baixo, soltando-o para o alto
  if (ta >= 159.1 && ta < DEVOLVE.solta) p.maoD = { nome: 'relogio', seg: segBomba(ta), comp: p.ombroD + p.cotoveloD, estrela: 0.8 };
  p.cabPitch += 0.06 * rampa(ta, 159.6, 159.8, 160.3, 160.45); // o queixo um pouco erguido, mostrando
  // a bomba: fora de quadro, a mão direita volta à bolsa e sai com ela; mostra-a a eles na palma, à frente do peito, a outra
  // mão na cintura; joga-a para o alto na palma e a apanha (provocação); recolhe o braço, abaixando-se um pouco, e, sem olhar,
  // joga-a de estalo para trás por cima do ombro direito (a soltura em TRAJ_BOMBA.t0, em tempo real); o braço segue o lance
  mix(rampa(ta, 164.0, 164.35, 164.45, 164.8), { ombroD: b[0], abracoD: b[1], cotoveloD: b[2] });
  const dyB = 0.035 * rampa(ta, 166.44, 166.5, 166.52, 166.6) - 0.03 * rampa(ta, 166.8, 166.86, 166.9, 167.0); // a mão dá o impulso e cede ao apanhar
  const sb = ikJack('mostraBomba' + dyB.toFixed(3), p, q => { const r = ikMao(D, 1, [0.2, D.tronco - 0.32 * D.s + dyB, 0.46], [1.0, 0.25, 1.1]); return [r.om, r.ab, r.co]; });
  const ci = ikJack('cintura', p, q => { const r = ikMao(D, -1, [-0.25 * D.s, 0.03, 0.04], [0.3, 0.6, 1.6], 0, 0.7); return [r.om, r.ab, r.co]; });
  mix(rampa(ta, 164.6, 165.3, 167.0, 167.12), { ombroD: sb[0], abracoD: sb[1], cotoveloD: sb[2] });
  mix(rampa(ta, 164.95, 165.4, 167.9, 168.5), { ombroE: ci[0], abracoE: ci[1], cotoveloE: ci[2] });
  p.bob = p.bob || 0; const recolhe = rampa(ta, 166.98, 167.16, 167.2, 167.3), estala = rampa(ta, 167.2, 167.42, 167.48, 167.95);
  mix(recolhe, { ombroD: 0.3, abracoD: 0.22, cotoveloD: 1.05, inclina: 0.1, torce: 0.16, bob: p.bob - 0.035 });   // recolhe: a mão desce para o quadril, o ombro vai para trás
  mix(estala, { ombroD: 3.4, abracoD: 0.14, cotoveloD: 0.18, inclina: -0.07, torce: -0.14 });                              // e estala: o braço sobe esticado e passa por cima do ombro
  p.cabYaw += 0.1 * rampa(ta, 165.4, 165.8, 167.0, 167.3) - 0.12 * rampa(ta, 167.25, 167.4, 167.7, 168.2); p.cabPitch -= 0.05 * rampa(ta, 165.4, 165.8, 167.6, 168.2); // a cabeça um pouco de lado, o queixo erguido; no lance, um meneio para o outro lado
  if (ta >= EXPL.t) { const e = ta - EXPL.t, k = suave(fase0(e, 0.04, 0.3)) * (1 - suave(fase0(e, 2.3, 3.3)));
    p.ombroD = lerp1(p.ombroD, 2.3, k); p.cotoveloD = lerp1(p.cotoveloD, 2.0, k); p.cabYaw = (p.cabYaw || 0) + 0.4 * k; p.cabPitch = lerp1(p.cabPitch || 0, -0.35, suave(fase0(e, 2.4, 3.6))); }
  p.expr = ta < 159.2 ? 'determinado' : ta < 160.95 ? 'confiante' : ta < 165.2 ? 'determinado' : ta < 166.4 ? 'confiante' : ta < 168.1 ? 'maroto' : ta < EXPL.t + 0.25 ? 'confiante' : 'determinado'; // maroto: da provocação ao lance
  if (ta > 176.6) p.y = -100; // o caco ocupa a tela; quando ele sai dela, ela já está a cavalo, indo embora (CAV_SAIDA)
  return p;
}
function poseDueloXerife(ta) {
  const [x, z] = posXerife(ta), pj = posJack(ta), [vx, vz] = velCaminho(X_AVANCO, ta), v = Math.hypot(vx, vz);
  const p = poseDe(G.xerife, x, alturaTerreno(x, z), z, Math.atan2(pj[0] - x, pj[1] - z));
  respira(p, ta, 2);
  if (ta < 154.2) { const u = fase0(ta, 153.6, 154.4); p.quadD = lerp1(1.2, 0, u); p.joelhoD = lerp1(1.5, 0.1, u); }
  p.ombroD = 0.25; p.cotoveloD = 0.5; p.abracoD = 0.25;
  if (v > 0.2 && ta < 159) andar(p, faseCaminho(X_AVANCO, ta, 0.95), Math.min(1, v / 1.6) * 0.75); // avança devagar, de arma apontada
  p.cabYaw += 0.3 * rampa(ta, 156.55, 156.7, 156.9, 157.05); // olha de relance para os ajudantes
  // saca e aponta, só com a mão direita na arma
  if (ta >= 154.25 && ta < 170.2) { const k = suave(fase0(ta, 154.25, 154.45));
    p.maoD = k > 0.3 ? 'revolver' : null; p.rolaD = Math.min(1, k / 0.3); p.ombroD = lerp1(0.25, 1.45, k); p.cotoveloD = lerp1(0.5, 0.1, k); p.abracoD = lerp1(0.25, 0.06, k); }
  // para e estende a mão esquerda aberta, com um aceno curto: que ela devolva o diamante; recolhe quando ela o joga
  const pede = rampa(ta, 158.55, 158.95, 160.75, 161.15);
  const chama = 0.32 * (rampa(ta, 158.95, 159.05, 159.1, 159.22) + rampa(ta, 159.25, 159.35, 159.4, 159.52)); // dois acenos curtos: "me dá"
  p.ombroE = lerp1(p.ombroE, 1.05, pede); p.cotoveloE = lerp1(p.cotoveloE, 0.55 + chama, pede); p.abracoE = lerp1(p.abracoE, 0.34, pede); // a mão aberta, um pouco para o lado
  p.cabPitch += 0.09 * rampa(ta, 158.75, 158.88, 159.0, 159.18);
  // o diamante: segue-o no ar até os pés; inclina-se para vê-lo se abrir, oco; depois ergue os olhos para ela
  const dv = voDiamante(ta);
  if (dv) virarCabecaPara(p, G.xerife, dv.c, suave(fase0(ta, DEVOLVE.solta + 0.1, DEVOLVE.solta + 0.4)) * (1 - suave(fase0(ta, 164.55, 165.1))));
  p.inclina += 0.1 * rampa(ta, 163.35, 163.7, 164.5, 164.95);
  if (ta > 163.5 && ta < 169.5) { const k = suave(fase0(ta, 163.6, 164.3)); p.ombroD = lerp1(p.ombroD, 1.05, k); } // a arma baixa um pouco
  // a bomba: recua meio passo e baixa a arma; segue-a com os olhos quando ela a joga
  if (ta >= 165.75 && ta < 169.5) { const k = suave(fase0(ta, 165.85, 166.3)); p.ombroD = lerp1(p.ombroD, 0.5, k); p.inclina -= 0.12 * rampa(ta, 165.85, 166.15, 166.9, 167.4); }
  const rb = trajetoRelogio(ta); if (rb && ta < 169.5) virarCabecaPara(p, G.xerife, [rb[0], rb[1], rb[2]], 0.8 * suave(fase0(ta, TRAJ_BOMBA.t0 + 0.05, TRAJ_BOMBA.t0 + 0.4)) * (1 - suave(fase0(ta, 169.2, 169.5))));
  if (ta >= 169.5 && ta < 176) { const u = fase0(ta, 169.6, 170.6); p.ombroD = lerp1(0.5, 0.3, u); p.ombroE = lerp1(p.ombroE, 0.3, u); p.cabPitch = 0.3 * u; }
  if (ta >= EXPL.t && ta < 176) { const e = ta - EXPL.t, k = suave(fase0(e, 0.04, 0.28)) * (1 - suave(fase0(e, 2.0, 3.0)));
    p.ombroE = lerp1(p.ombroE, 2.35, k); p.cotoveloE = lerp1(p.cotoveloE, 2.05, k); p.cabYaw = (p.cabYaw || 0) - 0.45 * k; p.cabPitch = lerp1(p.cabPitch, -0.4, suave(fase0(e, 2.2, 3.4))); }
  if (ta >= 176) { const alvo = Math.atan2(SAIDA.d[0], SAIDA.d[1]); p.yaw = lerpAng(p.yaw, alvo, suave(fase0(ta, 179.4, 180.4))); p.cabPitch = 0.45 * (1 - fase0(ta, 179.5, 180.5)); p.cabYaw *= 1 - suave(fase0(ta, 180.4, 181.6)); }
  p.expr = ta < 163.35 ? 'raiva' : ta < 164.6 ? 'surpresa' : ta < 165.8 ? 'preocupado' : ta < 169.5 ? 'medo' : ta < 171 ? 'surpresa' : ta < 180.2 ? 'preocupado' : ta < TIRA.peito + 0.22 ? 'serena' : 'piscar';
  if (ta >= 180) { p.ombroD = 0.12; p.abracoD = 0.1; p.cotoveloD = 0.3; } // os braços soltos: acabou
  if (ta >= TIRA.vai) tiraChapeu(p, ta);
  return p;
}
// o xerife tira o chapéu, só por respeito: a mão direita vai à aba da frente, tira-o sem pressa, desce-o pelo lado do rosto, sem
// tapá-lo, até a frente do cinto, onde a outra mão o segura também, e ele baixa a cabeça. O chapéu anda no referencial do tronco
// (p.chapeuT) e as mãos o seguem; como ele é redondo, a mão pode correr pela aba até o lado, sem que se note
const TIRA = { vai: 182.0, pega: 182.42, peito: 183.42, cabeca: 0.1, baixa: 0.36 };
let _chapeuX = null; const _ikChapeu = new Map();
function chavesChapeuX() {
  if (_chapeuX) return _chapeuX;
  const P = G.xerife, D = P.D, T = TIRA, sH = P.f.altura / 1.75 * 1.12, aba = [0, 0.085 * sH, -0.005 * sH];
  const chave = (t, b, rx, ry, a) => { const o = _ry(_rx(aba, rx), ry); return [t, b[0] - o[0], b[1] - o[1], b[2] - o[2], rx, ry, a]; };
  const b0 = cabecaParaTronco(P, { cabPitch: T.cabeca, cabYaw: 0 }, aba), d = T.peito - T.pega;
  return _chapeuX = [ // [t, origem do chapéu, inclinação, giro, onde a mão fica na aba]
    chave(T.pega, b0, T.cabeca, 0, 0.55),
    chave(T.pega + 0.22 * d, [b0[0] - 0.02, b0[1] + 0.055, b0[2] + 0.09], T.cabeca - 0.12, 0, 0.6),
    chave(T.pega + 0.5 * d, [-0.26, 0.64, 0.27], 0.25, 0.2, 0.75),
    chave(T.pega + 0.76 * d, [-0.2, 0.33, 0.29], 0.8, 0.12, 1.0),
    chave(T.peito, [0, 0.06, 0.27], 1.0, 0, 1.35),
  ];
}
function chapeuXNoTempo(ta) { const [x, y, z, rx, ry, a] = trilhaH(chavesChapeuX(), Math.min(ta, TIRA.peito)); return { pos: [x, y, z], rx, ry, rz: 0, a }; }
function pegaChapeuX(c, s, a) { const P = G.xerife, sH = P.f.altura / 1.75 * 1.12, R = 0.212 * sH + 0.012, g = _ry(_rx([s * Math.sin(a) * R, 0.085 * sH - 0.012, Math.cos(a) * R - 0.005 * sH], c.rx), c.ry); return [c.pos[0] + g[0], c.pos[1] + g[1], c.pos[2] + g[2]]; }
function maoNoChapeuX(ta) { // a mão direita dele; o cotovelo para a frente, sem abrir para o lado (senão vira continência)
  const t = Math.max(TIRA.pega, Math.min(ta, TIRA.peito)), ch = t.toFixed(3); let r = _ikChapeu.get(ch); if (r) return r;
  const c = chapeuXNoTempo(t), f = fase0(t, TIRA.pega, TIRA.peito), gi = lerp1(0.5, 0, f);
  r = ikMao(G.xerife.D, -1, pegaChapeuX(c, -1, c.a), [1.6, 0.2, 1.7], gi, lerp1(0.15, 0.1, f)); r.gi = gi;
  if (_ikChapeu.size > 500) _ikChapeu.clear(); _ikChapeu.set(ch, r); return r;
}
function tiraChapeu(p, ta) {
  const T = TIRA, k = suave(fase0(ta, T.vai, T.pega)), r = maoNoChapeuX(ta), fim = suave(fase0(ta, T.peito - 0.2, T.peito + 0.4));
  p.ombroE = lerp1(p.ombroE, r.om, k); p.abracoE = lerp1(p.abracoE, r.ab, k); p.cotoveloE = lerp1(p.cotoveloE, r.co, k); p.giroBE = lerp1(p.giroBE || 0, r.gi, k); p.maoE = null;
  if (ta >= T.pega - 0.08) p.fechaE = 1;
  if (ta >= T.pega) p.chapeuT = chapeuXNoTempo(ta);
  const kD = suave(fase0(ta, T.peito - 0.32, T.peito + 0.06));
  if (kD > 0) { let rD = _ikChapeu.get('D'); if (!rD) { const c = chapeuXNoTempo(T.peito); rD = ikMao(G.xerife.D, 1, pegaChapeuX(c, 1, c.a), [0.6, 0.1, 0.6], 0, 0.1); _ikChapeu.set('D', rD); } p.ombroD = lerp1(p.ombroD, rD.om, kD); p.abracoD = lerp1(p.abracoD, rD.ab, kD); p.cotoveloD = lerp1(p.cotoveloD, rD.co, kD); if (kD > 0.85) p.fechaD = 1; }
  p.cabPitch = T.cabeca * rampa(ta, T.vai + 0.05, T.pega, T.pega, T.pega + 0.35) + T.baixa * fim; p.inclina = (p.inclina || 0) + 0.05 * fim;
}
// cada ajudante a pé: apeia, saca com uma mão e chega mais perto; olha o diamante cair e se abrir; quando ela mostra a
// bomba, recua e baixa a arma
function poseDueloAjud(i, ta) {
  const A = AJ_PE[i], P = GRUPO[A.g].P(), [x, z] = posAjud(i, ta), pj = posJack(ta), [vx, vz] = velCaminho(A.caminho, ta), v = Math.hypot(vx, vz);
  const p = poseDe(P, x, alturaTerreno(x, z), z, Math.atan2(pj[0] - x, pj[1] - z));
  respira(p, ta + i * 2.3, 1.6);
  const u = fase0(ta, A.desce, A.desce + 0.8); if (u < 1) { p.quadD = lerp1(1.2, 0, u); p.joelhoD = lerp1(1.5, 0.1, u); }
  if (v > 0.2 && ta < 159) { andar(p, faseCaminho(A.caminho, ta, 1.0), Math.min(1, v / 1.5) * 0.75); p.yaw = lerpAng(p.yaw, Math.atan2(vx, vz), 0.3 * clamp01(v / 1.2)); }
  p.ombroD = 0.18; p.cotoveloD = 0.42; p.abracoD = 0.2;
  p.cabYaw += (i ? -0.25 : 0.25) * rampa(ta, 156.9 + i * 0.3, 157.05 + i * 0.3, 157.3 + i * 0.3, 157.45 + i * 0.3); // olha para o xerife
  if (ta >= A.saca && ta < 170.2) {
    const k = suave(fase0(ta, A.saca, A.saca + 0.2));
    p.maoD = k > 0.3 ? 'revolver' : null; p.rolaD = Math.min(1, k / 0.3); p.ombroD = lerp1(0.18, 1.5, k); p.cotoveloD = lerp1(0.42, 0.06, k); p.abracoD = lerp1(0.2, 0.05, k);
    p.ombroE = lerp1(p.ombroE, 0.35, k); p.abracoE = lerp1(p.abracoE, 0.3, k); p.cotoveloE = lerp1(p.cotoveloE, 0.6, k);
  }
  const dv = voDiamante(ta);
  if (dv) virarCabecaPara(p, P, dv.c, suave(fase0(ta, DEVOLVE.solta + 0.2 + i * 0.1, DEVOLVE.solta + 0.5 + i * 0.1)) * (1 - suave(fase0(ta, 164.7, 165.25))));
  if (ta >= 163.6 && ta < 169.5) { const k = suave(fase0(ta, 163.8 + i * 0.08, 164.4 + i * 0.08)); p.ombroD = lerp1(p.ombroD, 1.1, k); }
  if (ta >= 165.8 && ta < 176) { const k = suave(fase0(ta, 165.9 + i * 0.08, 166.3 + i * 0.08)); p.ombroD = lerp1(p.ombroD, 0.3, k); p.cotoveloD = lerp1(p.cotoveloD, 0.35, k); p.inclina -= 0.14 * rampa(ta, 165.9, 166.2, 166.9, 167.4); }
  const rb = trajetoRelogio(ta); if (rb && ta < 169.5) virarCabecaPara(p, P, [rb[0], rb[1], rb[2]], 0.8 * suave(fase0(ta, TRAJ_BOMBA.t0 + 0.1 + i * 0.05, TRAJ_BOMBA.t0 + 0.45 + i * 0.05)));
  if (ta >= EXPL.t && ta < 176) { const e = ta - EXPL.t, k = suave(fase0(e, 0.05 + i * 0.04, 0.3 + i * 0.04)) * (1 - suave(fase0(e, 2.0, 3.0)));
    p.ombroE = lerp1(p.ombroE, 2.35, k); p.cotoveloE = lerp1(p.cotoveloE, 2.05, k); p.cabYaw = (p.cabYaw || 0) + (i ? 0.4 : -0.4) * k; p.cabPitch = lerp1(p.cabPitch, -0.35, suave(fase0(e, 2.2, 3.4))); }
  if (ta >= 176) { p.maoD = null; p.ombroD = 0.2; p.cotoveloD = 0.3; const alvo = Math.atan2(SAIDA.d[0], SAIDA.d[1]); p.yaw = lerpAng(p.yaw, alvo, suave(fase0(ta, 179.6, 180.6))); }
  p.expr = ta < 163.4 ? 'raiva' : ta < 165.85 ? 'surpresa' : ta < EXPL.t ? 'preocupado' : ta < 172 ? 'medo' : 'preocupado';
  return p;
}
// a bomba jogada por cima do ombro: sai da mão dela (t0) para trás e para o alto, na direção do fundo da garganta, e cai
// (gravidade de verdade) até a explosão; passa a beira no alto e cai no vão sem tocar a parede
const TRAJ_BOMBA = { t0: 167.39, vh: 5.2, vy: 5.6, v: 5.6, mao0: 164.45, esc: 1.25 }; // v: a velocidade constante do voo, em m/s
// a bomba na mão dela: o centro fica sobre a palma, um pouco para a ponta dos dedos, pela direção do antebraço (antes ia
// por objetoNaMao, cujo giro para mantê-la em pé a deixava uns 30 cm solta da mão); 'pulo': quando ela a joga na palma
function bombaNaMao(ta) {
  const P = G.jackFL, D = P.D, p = poseDueloJack(ta), m = maoMundo(P, p, 1), R = DIAM.bombaR * TRAJ_BOMBA.esc;
  let v = [0, -D.braco, 0]; v = _ry(v, p.giroBD || 0); v = _rz(v, p.abracoD || 0); v = _rx(v, -p.ombroD); // o cotovelo, como em maoFK
  const co = doTronco(P, p, [v[0] + D.ombro, v[1] + D.tronco - 0.05 * D.s, v[2]]), d = normaliza([m[0] - co[0], m[1] - co[1], m[2] - co[2]]);
  const u = fase0(ta, 166.52, 166.86), pulo = u > 0 && u < 1 ? 0.15 * 4 * u * (1 - u) : 0;
  return { c: [m[0] + d[0] * R * 0.5, m[1] + d[1] * R * 0.5 + R * 0.72 + pulo, m[2] + d[2] * R * 0.5], yaw: p.yaw, giro: 2.4 * suave(fase0(ta, 166.52, 166.86)) };
}
function desenhaBombaNaMao(ta) {
  if (ta < TRAJ_BOMBA.mao0 || ta >= TRAJ_BOMBA.t0) return;
  const b = bombaNaMao(ta); mat({});
  push(); translate(b.c[0], b.c[1], b.c[2]); rotateY(b.yaw); rotateX(-b.giro * 0.15); rotateY(b.giro); scale(TRAJ_BOMBA.esc); translate(0, -DIAM.bombaR, 0); // o mostrador para eles; no pulo, ela gira uma volta
  desenhaRelogio({ soBomba: true, seg: segBomba(ta) }); pop(); mat({});
}
// o voo da bomba em ritmo constante: o arco do lance (a parábola de vh e vy) percorrido sempre a TRAJ_BOMBA.v m/s, sem o
// estalo rápido na saída da mão nem a lentidão no alto; _arcoBomba guarda o comprimento do arco a cada 2 cm de avanço
let _bombaMao = null, _arcoBomba = null;
function trajetoRelogio(ta) {
  const t0 = TRAJ_BOMBA.t0; if (ta < t0) return null;
  const a = TRAJ_BOMBA.vy / TRAJ_BOMBA.vh, b = 4.9 / (TRAJ_BOMBA.vh * TRAJ_BOMBA.vh), ds = 0.02;
  if (!_arcoBomba) { _arcoBomba = [0]; for (let i = 1; i <= 2500; i++) { const k = a - 2 * b * (i - 0.5) * ds; _arcoBomba.push(_arcoBomba[i - 1] + ds * Math.sqrt(1 + k * k)); } }
  if (!_bombaMao) { const b = bombaNaMao(t0 - 0.005), f = frente(b.yaw), d = normaliza([-f[0] + f[1] * 0.3, 0, -f[1] - f[0] * 0.3]); _bombaMao = [b.c[0], b.c[1], b.c[2], d[0], d[2]]; } // para trás e um pouco para a direita, por cima do ombro direito: a beira fica a uns 5 m e ela passa a mais de 2 m dela
  const u = ta - t0, [x0, y0, z0, dx, dz] = _bombaMao, A = _arcoBomba, L = TRAJ_BOMBA.v * u;
  let lo = 0, hi = A.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (A[m] <= L) lo = m; else hi = m; }
  const sx = (lo + clamp01((L - A[lo]) / (A[hi] - A[lo]))) * ds;
  return [x0 + dx * sx, y0 + a * sx - b * sx * sx, z0 + dz * sx, u];
}
function desenhaArremesso(ta) {
  const r = trajetoRelogio(ta); if (!r || ta > EXPL.t) return;
  const dc = Math.hypot(r[0] - CAM.olho[0], r[1] - CAM.olho[1], r[2] - CAM.olho[2]);
  const es = lerp1(1.25, lerp1(1.25, 2.6, suave(clamp01((dc - 2) / 8))), suave(clamp01(r[3] / 0.15))), y = Math.max(r[1], EXPL.y + 1); // de longe, maior, para se ler (cresce aos poucos depois de sair da mão)
  push(); translate(r[0], y, r[2]);
  if (CAM.bombaNaLente) { // as câmeras que andam com a bomba: o mostrador olha para a lente, com um balanço miúdo
    const n = normaliza([CAM.olho[0] - r[0], CAM.olho[1] - y, CAM.olho[2] - r[2]]), c0 = CAM.cima || [0, 1, 0], pc = c0[0] * n[0] + c0[1] * n[1] + c0[2] * n[2], u = normaliza([c0[0] - n[0] * pc, c0[1] - n[1] * pc, c0[2] - n[2] * pc]);
    const si = Math.sin(DIAL.incl), co = Math.cos(DIAL.incl), ey = [si * n[0] + co * u[0], si * n[1] + co * u[1], si * n[2] + co * u[2]], ez = [co * n[0] - si * u[0], co * n[1] - si * u[1], co * n[2] - si * u[2]];
    const ex = [ey[1] * ez[2] - ey[2] * ez[1], ey[2] * ez[0] - ey[0] * ez[2], ey[0] * ez[1] - ey[1] * ez[0]];
    applyMatrix(ex[0], ex[1], ex[2], 0, ey[0], ey[1], ey[2], 0, ez[0], ez[1], ez[2], 0, 0, 0, 0, 1); rotateZ(0.05 * Math.sin(T * 17)); rotateX(0.04 * Math.sin(T * 13));
  } else { rotateX(r[3] * 5); rotateZ(r[3] * 3.3); }
  scale(es); translate(0, -DIAM.bombaR, 0);
  mat(CAM.bombaNaLente ? { amb: 1.5, sol: 0.1 } : { amb: 2.4, sol: 1.3 }); desenhaRelogio({ soBomba: true, seg: segBomba(ta) }); pop(); // o ferro um pouco mais claro no voo, para a bola se ler à noite (de perto, na lente, sem o reflexo da lua, que virava uma bola branca)
  const kb = 0.55 + 0.45 * Math.sin(T * 9.1) * Math.sin(T * 3.7 + 1), w = normaliza([CAM.olho[0] - r[0], CAM.olho[1] - y, CAM.olho[2] - r[2]]), v = normaliza([w[0] * 0.75, w[1] * 0.75 + 0.66, w[2] * 0.75]), rg = DIAM.bombaR * es * 1.02; // brilho da lua no latão, na borda de cima do lado da câmera: ela se lê no escuro
  const sombra = (CAM.bombaBrilho ?? 1) * (1 - suave(fase0(ta, 170.62, 170.84))); // no fim do P50, o brilho se apaga e ela some no escuro do fundo; nas câmeras coladas nela, ele não entra (de perto, viraria uma bola branca)
  if (sombra > 0.01) { push(); translate(r[0] + v[0] * rg, y + v[1] * rg, r[2] + v[2] * rg); scale((0.018 + 0.022 * kb) * es / 1.25 * sombra); md(G.bolha, { tinta: [1.6, 1.45, 1.2], semLuz: 1, alfa: 0.85 }); pop(); }
  mat({});
}
// o voo do diamante devolvido: da mão dela num arco até perto do xerife; quica, rola e para deitado de lado, com a mesa
// virada para ele. c: o centro (a cinta); ry, rx: giros; abre: a coroa (0 a 1,5)
let _devMao = null;
function voDiamante(ta) {
  const V = DEVOLVE; if (ta < V.solta) return null; // depois de aberto, fica no chão até o fim
  if (!_devMao) { const p = poseDueloJack(V.solta - 0.005), m = maoMundo(G.jackFL, p, 1); _devMao = [m[0], m[1] + 0.1, m[2]]; }
  const M = _devMao, [cx, cz] = V.chao, d = normaliza([cx - M[0], 0, cz - M[2]]);
  const psi = Math.atan2(XERIFE_DEPOIS[0] - cx, XERIFE_DEPOIS[1] - cz), th = Math.atan2(DIAM.pav, DIAM.R); // deitado: a geratriz do pavilhão no chão, a mesa para o xerife
  const rC = DIAM.cinta + DIAM.pav + 0.002, fim = [cx + Math.sin(psi) * rC * Math.sin(th), alturaTerreno(cx, cz) + rC * Math.cos(th), cz + Math.cos(psi) * rC * Math.sin(th)];
  const L1 = [cx - d[0] * 0.75, cz - d[2] * 0.75], L2 = [cx - d[0] * 0.22, cz - d[2] * 0.22], y1 = alturaTerreno(L1[0], L1[1]) + 0.1, y2 = alturaTerreno(L2[0], L2[1]) + 0.1;
  let c;
  if (ta < V.cai) { const T = V.cai - V.solta, t = ta - V.solta, u = t / T, vy = (y1 - M[1] + 4.9 * T * T) / T;
    c = [lerp1(M[0], L1[0], u), M[1] + vy * t - 4.9 * t * t, lerp1(M[2], L1[1], u)]; }
  else if (ta < V.quica) { const u = fase0(ta, V.cai, V.quica); c = [lerp1(L1[0], L2[0], u), lerp1(y1, y2, u) + 0.85 * u * (1 - u), lerp1(L1[1], L2[1], u)]; }
  else { const u = 1 - (1 - fase0(ta, V.quica, V.para)) ** 2; c = [lerp1(L2[0], fim[0], u), lerp1(y2, fim[1], u), lerp1(L2[1], fim[2], u)]; }
  const s = 1 - (1 - fase0(ta, V.solta, V.para)) ** 2; // o giro desacelera até parar
  const ua = fase0(ta, V.abre0, V.abre1), abre = 1.5 * (ua <= 0 ? 0 : ua >= 1 ? 1 : 1 - Math.cos(ua * Math.PI * 1.5) * Math.exp(-ua * 4)); // de estalo, passa 7% e volta
  return { c, ry: psi - 1.6 * (1 - s), rx: th - 5 * Math.PI * (1 - s), abre, parado: ta >= V.para };
}
function desenhaDiamanteDevolvido(ta) {
  const dv = voDiamante(ta); if (!dv) return;
  push(); translate(dv.c[0], dv.c[1], dv.c[2]); rotateY(dv.ry); rotateX(dv.rx); translate(0, -(DIAM.cinta + DIAM.pav + 0.002), 0);
  desenhaRelogio({ abre: dv.abre, oco: true, tombaMax: 2.3, estrela: dv.parado ? 0.5 : 0.9 }); pop(); mat({});
  // a poeira de cada toque no chão
  for (const [t0, k] of [[DEVOLVE.cai, 1], [DEVOLVE.quica, 0.6]]) { const e = ta - t0; if (e < 0 || e > 0.8) continue; const q = voDiamante(t0).c;
    drawingContext.depthMask(false);
    for (let i = 0; i < 7; i++) { const a = i * 1.7 + t0, r = (0.025 + e * 0.1) * k; push(); translate(q[0] + Math.cos(a) * e * 0.35, q[1] - 0.07 + e * 0.12, q[2] + Math.sin(a) * e * 0.35); scale(r, r * 0.6, r);
      md(G.bolhaFina, { tinta: [0.6, 0.55, 0.6], alfa: 0.22 * (1 - e / 0.8), amb: 1, sol: 0.6, borda: 0 }); pop(); }
    drawingContext.depthMask(true); }
  mat({});
}
const EXPL = { x: 1004, y: -140, z: -164, t: 170.84 };
function segBomba(ta) { return 3590 + Math.floor(ta - 158); } // o ponteiro anda aos saltos, um por segundo
function explosao(ta) { const u = ta - EXPL.t; if (u < 0) return { k: 0, kL: 0, u }; return { k: u < 0.1 ? u / 0.1 : Math.exp(-(u - 0.1) * 0.3), kL: u < 0.08 ? u / 0.08 : Math.exp(-(u - 0.08) * 0.85), u }; }
// altura do centro e raio do chapéu do cogumelo, u segundos depois da explosão
function cogumelo(u) { return { H: EXPL.y + 50 + 210 * (1 - Math.exp(-u / 1.4)) + 3 * u, R: 14 + 50 * (1 - Math.exp(-u / 1.8)) + 1.2 * u }; }
function corFogo(q) { // q: calor, de 0 (fumaça) a 1 (branco)
  if (q > 0.7) return lerp3([1.0, 0.66, 0.22], [1.0, 0.96, 0.84], Math.min(1, (q - 0.7) / 0.3));
  if (q > 0.38) return lerp3([0.92, 0.3, 0.08], [1.0, 0.66, 0.22], (q - 0.38) / 0.32);
  if (q > 0.12) return lerp3([0.34, 0.25, 0.22], [0.92, 0.3, 0.08], (q - 0.12) / 0.26);
  return [0.34, 0.25, 0.22];
}
function desenhaExplosao(ta) {
  const u = ta - EXPL.t; if (u < 0) return;
  const C = CAM.olho, B = [];
  const add = (x, y, z, r, q, alfa) => { if (r > 0.05 && alfa > 0.01) B.push({ x, y, z, r, q, alfa, d: Math.hypot(x - C[0], y - C[1], z - C[2]) }); };
  const { H, R } = cogumelo(u);
  const sumir = u > 7 ? Math.max(0.42, 1 - (u - 7) / 10) : 1;   // a nuvem se desfaz devagar e fica no céu até o fim
  const forma = suave(fase0(u, 0.8, 3.2));                       // bola de fogo → chapéu em anel
  const vento = Math.max(0, u - 3) * 1.4;                          // o alto da nuvem deriva com o vento
  // 1. jato de fogo que sai da garganta no primeiro segundo
  if (u < 1.1) for (let i = 0; i < 12; i++) {
    const f = i / 11, y = lerp1(EXPL.y + 5, EXPL.y + 30 + 380 * u, f);
    add(EXPL.x + (hash2(i, 20) - 0.5) * 8, y, EXPL.z + (hash2(i, 21) - 0.5) * 8, (9 + f * 9) * Math.min(1, u * 6), 1.15 - f * 0.25, 1 - fase0(u, 0.7, 1.1));
  }
  // 2. bola de fogo que vira o chapéu: um anel de fumaça que rola sobre si mesmo, com a barriga em brasa
  for (let i = 0; i < 96; i++) {
    const a = i / 96 * Math.PI * 2 + hash2(i, 1) * 0.5 + u * 0.035, fi = hash2(i, 2) * Math.PI * 2 + u * 0.7;
    const rb = R * 0.58 * Math.cbrt(hash2(i, 3)), eb = (hash2(i, 4) - 0.5) * Math.PI;
    const tubo = R * 0.34 * (0.85 + hash2(i, 16) * 0.3), anel = R * 0.62 + Math.cos(fi) * tubo;
    const x = EXPL.x + lerp1(Math.cos(a) * Math.cos(eb) * rb, Math.cos(a) * anel, forma) + vento;
    const y = H + lerp1(Math.sin(eb) * rb, Math.sin(fi) * tubo * 0.75, forma);
    const z = EXPL.z + lerp1(Math.sin(a) * Math.cos(eb) * rb, Math.sin(a) * anel, forma);
    const alto = clamp01((y - H) / R * 0.5 + 0.5), baixo = forma * Math.max(0, -Math.sin(fi));
    const q = Math.min(1.1, Math.exp(-u * (0.45 + 0.55 * alto)) * (1.3 + hash2(i, 6) * 0.3) + baixo * 0.5 * Math.exp(-u * 0.16));
    add(x, y, z, R * lerp1(0.34, 0.24, forma) * (0.65 + hash2(i, 5) * 0.7), q * (0.85 + hash2(i, 18) * 0.3), sumir);
  }
  for (let i = 0; i < 18; i++) { // domo no alto do chapéu
    const a = i * 2.4 + 0.4, rr = R * 0.42 * Math.sqrt(hash2(i, 19));
    add(EXPL.x + Math.cos(a) * rr + vento * 1.2, H + R * (0.22 + 0.14 * (1 - rr / (R * 0.42))) * forma + hash2(i, 7) * 4, EXPL.z + Math.sin(a) * rr, R * (0.22 + hash2(i, 17) * 0.1), Math.exp(-u * 0.9) * 1.2 * (0.8 + hash2(i, 22) * 0.4), sumir * forma);
  }
  // 3. caule: da garganta até o chapéu, crescendo de baixo para cima
  const topo = H - R * 0.35 * forma;
  for (let i = 0; i < 34; i++) {
    const f = i / 33, nasce = fase0(u, 0.15 + f * 1.1, 0.5 + f * 1.1); if (nasce <= 0) continue;
    const y = lerp1(EXPL.y + 6, topo, f);
    const larg = (7 + 8 * Math.pow(1 - f, 3) + 6 * f * f) * Math.min(1, 0.45 + u * 0.4) * (1 + Math.max(0, u - 6) * 0.05);
    const g = u * 0.6 + i * 2.3, x = EXPL.x + Math.sin(g) * larg * 0.45 + vento * f, z = EXPL.z + Math.cos(g * 1.3) * larg * 0.35;
    const q = Math.min(1.1, Math.exp(-u * 0.5) * (1.7 - f * 0.8)) * (0.8 + hash2(i, 23) * 0.4);
    add(x, y, z, larg * nasce * (0.75 + hash2(i, 24) * 0.4), q, sumir * nasce * (q > 0.4 ? 1 : 0.72));
    if (i % 2 === 0) add(x - Math.sin(g) * larg * 0.8, y + 2, z - Math.cos(g * 1.3) * larg * 0.6, larg * 0.55 * nasce, q * 0.7, sumir * nasce * 0.6);
  }
  // 4. poeira e fogo que correm pela garganta e transbordam pelas bordas
  for (let i = 0; i < 36; i++) {
    const cr = fase0(u, 0.2, 1.0); if (cr <= 0) break;
    const lado = i % 2 ? 1 : -1, borda = (i >> 1) % 3 - 1, f = ((i >> 1) / 18), k = 1 - Math.exp(-Math.max(0, u - 0.2) / 1.3);
    const x = EXPL.x + lado * (8 + 62 * k * (0.2 + f)), z = EXPL.z + borda * (20 + 4 * k);
    const hT = borda === 0 ? EXPL.y + 30 + u * 8 : Math.max(alturaTerreno(x, z), -40) + 4;
    add(x, hT + cr * 5, z, (7 + hash2(i, 11) * 7) * cr * (1 + u * 0.05), Math.exp(-u * 0.8) * (borda === 0 ? 1.3 : 0.7), Math.max(0, 1 - Math.max(0, u - 5) / 6) * 0.85);
  }

  // desenha de trás para a frente, sem gravar profundidade (as bolhas se misturam)
  B.sort((a, b) => b.d - a.d);
  const gl = drawingContext; gl.depthMask(false);
  const cinza = lerp3([0.55, 0.47, 0.47], [0.3, 0.32, 0.4], suave(fase0(ta, 176, 184))); // fumaça que esfria e fica cinza de luar
  for (const b of B) {
    const perto = clamp01((b.d - b.r * 1.1) / (b.r * 2.5)); // some se a câmera estiver dentro ou rente
    const al = b.alfa * perto * (b.q > 0.5 ? 1 : 0.9) * (u > 6 && b.q < 0.15 ? lerp1(1, 0.75, fase0(u, 6, 12)) : 1); if (al < 0.01) continue;
    let cor = corFogo(b.q); if (b.q < 0.15) cor = lerp3(cor, cinza, fase0(u, 4, 11) * (1 - b.q / 0.15));
    const brilho = b.q > 0.12 ? 1 + Math.min(1, b.q) * 0.7 : 1;
    push(); translate(b.x, b.y, b.z); scale(b.r);
    md(G.nuvem, { tinta: [cor[0] * brilho, cor[1] * brilho, cor[2] * brilho], semLuz: Math.max(0.25, sstep(0.1, 0.42, b.q)), alfa: al, amb: 1.25, sol: 0.7, borda: 0.6 });
    pop();
  }
  // onda de choque: anel de poeira que corre rente ao chão
  if (u < 1.9) { push(); translate(EXPL.x, 0.8, EXPL.z); scale(30 + u * 170, 1, 30 + u * 170); md(G.anel, { tinta: [0.95, 0.72, 0.52], semLuz: 0.45, alfa: 0.6 * (1 - u / 1.9), alfaCor: 1, borda: 0 }); pop(); }
  gl.depthMask(true);
  // brasas e pedras lançadas
  for (let i = 0; i < 70; i++) {
    const a = i * 2.17, v = 30 + hash2(i, 12) * 55, el = 0.5 + hash2(i, 13) * 0.95, w = u * (0.85 + hash2(i, 14) * 0.3);
    const x = EXPL.x + Math.cos(a) * Math.cos(el) * v * w, z = EXPL.z + Math.sin(a) * Math.cos(el) * v * w * 0.55;
    const y = EXPL.y + 10 + Math.sin(el) * v * w - 9.8 * w * w; if (y < EXPL.y - 2 || (w > 1 && y < alturaTerreno(x, z))) continue;
    const pedra = i % 3 === 0, viva = Math.max(0, 1 - u / (pedra ? 6 : 3.2)); if (viva <= 0) continue;
    push(); translate(x, y, z); rotateX(w * 3 + i); rotateY(w * 2); scale(pedra ? 0.9 + hash2(i, 15) : 0.32);
    md(G.cubo, pedra ? { tinta: [0.3, 0.22, 0.18], alfa: 1 } : { tinta: [1.0, 0.75, 0.35], semLuz: 1, alfa: viva }); pop();
  }
  mat({});
}
// final: o caco da bomba com a plaquinha da mina
const QUARTO_PLACA = 0.0; // giro da plaquinha no plano, para o texto ficar de frente para a câmera do P52
function desenhaFinal(ta) {
  if (ta > 176 && ta < 186) {
    const [x, z] = XERIFE_DEPOIS; const y0 = alturaTerreno(x, z);
    const u = fase0(ta, 176.3, 177.6);
    push(); translate(x + 0.9, lerp1(y0 + 7, y0 - 0.008, u * u), z + 0.6); rotateY(0.6); rotateZ((1 - u) * 4); rotateX((1 - u) * 6);
    scale(1.7); md(G.cacoBomba, { sol: 1, brilho: 0.8 }); translate(0, 0.12 * 0.38 + 0.0018, 0); rotateX(-Math.PI / 2); rotateZ(QUARTO_PLACA); scale(0.075, 0.045, 1); md(G.quadro, { tex: TX.carimbo }); pop(); mat({});
  }
}

// ================================================================ LUZ AO LONGO DO FILME
function ambFilme(t) {
  let a;
  if (t < 31) { a = misturaAmb(AMBIENTES.tarde, AMBIENTES.tarde, 0); const k = fase0(t, 0, 31); a.sol = [-0.72, lerp1(0.14, 0.075, k), -0.68]; }
  else if (t < 40) a = misturaAmb(AMBIENTES.tarde, AMBIENTES.crepusculo, suave(fase0(t, 31, 40)));
  else if (t < 47) a = misturaAmb(AMBIENTES.crepusculo, AMBIENTES.noite, suave(fase0(t, 40, 47)));
  else a = misturaAmb(AMBIENTES.noite, AMBIENTES.noite, 0); // daqui até o fim é noite: a explosão clareia o céu e ele volta a escurecer
  aplicaAmb(a);
  AMB.luneta = 0; AMB.luaBrilho = 1.6; AMB.ceuFim = 0;
  const ex = explosao(t);
  if (ex.k > 0.01) {
    const u = ex.u, k = ex.k;
    AMB.flash = u < 0.08 ? 1 : 0.92 * Math.exp(-(u - 0.08) * 2.6); AMB.corFlash = lerp3([1, 0.62, 0.32], [1, 0.95, 0.86], Math.exp(-u * 3));
    AMB.bloom += k * 1.2 + ex.kL * 1.6; AMB.expo *= 1 + 0.3 * ex.kL; AMB.aberr = 0.4 + 2.2 * Math.exp(-u * 2.5);
    AMB.ceuHoriz = lerp3(AMB.ceuHoriz, [1.0, 0.45, 0.16], k * 0.85); AMB.ceuMeio = lerp3(AMB.ceuMeio, [0.75, 0.3, 0.14], k * 0.7); AMB.ceuTopo = lerp3(AMB.ceuTopo, [0.3, 0.12, 0.1], k * 0.5);
    AMB.nevoa = lerp3(AMB.nevoa, [0.6, 0.28, 0.12], k * 0.7); AMB.nevoaP = [AMB.nevoaP[0], AMB.nevoaP[1] * (1 - 0.6 * k), AMB.nevoaP[2]];
    AMB.chao = lerp3(AMB.chao, [0.7, 0.32, 0.12], ex.kL * 0.6);
  }
  if (t > 185) AMB.fade = fase0(t, 185, 186);
  // abertura: a imagem começa preta, só o título aparece; o trem surge do escuro enquanto a onda atravessa o título
  if (t < 3.9) AMB.fade = Math.max(AMB.fade, 1 - suave(fase0(t, 1.4, 3.9)));
}
// escuridão dentro dos túneis (sem sombras, o túnel apaga a luz da lua)
function noTunel(x, z) { return Math.abs(z) < 4 && ((x > MUNDO.tunel1.x0 && x < MUNDO.tunel1.x1) || (x > MUNDO.tunel2.x0 && x < MUNDO.tunel2.x1)); }
// túnel: o escuro de cada ponto vem do shader (pela posição); aqui só o que depende da câmera, em rampa suave
// (névoa de fumaça, olho que se acostuma ao escuro) e as luzes do próprio trem lá dentro
function escureceTunel() {
  const kc = fatorTunel(CAM.olho[0], CAM.olho[1], CAM.olho[2]);
  if (kc > 0.001) {
    AMB.nevoa = lerp3(AMB.nevoa, [0.03, 0.024, 0.022], kc); AMB.nevoaP = [lerp1(AMB.nevoaP[0], 4, kc), lerp1(AMB.nevoaP[1], 0.045, kc), lerp1(AMB.nevoaP[2], 0.9, kc)];
    if (TA < 45.5 || TA > 53.5) { AMB.expo *= lerp1(1, 1.9, kc); AMB.bloom *= lerp1(1, 1.35, kc); } // no apagão do roubo o escuro é proposital
  }
  // janelas acesas dos vagões batendo nas paredes do túnel, farol e fornalha da locomotiva
  const t = TA, xl = xLoco(t), luzes = [];
  for (const id of ['D', 'P1', 'P2']) { const c = carro(id), cx = xl + (c.x0 + c.x1) / 2, kd = id === 'D' ? luzVagaoD(t) : 1; for (const z of [-2.5, 2.5]) luzes.push({ p: [cx, Y_TRILHO + 2.9, z], c: [0.95 * kd, 0.6 * kd, 0.28 * kd], r: 10 }); }
  luzes.push({ p: [xl + 7, Y_TRILHO + 2.6, 0], c: [1.3, 1.1, 0.7], r: 16 }, { p: [xl - 10.5, Y_TRILHO + 3.2, 0], c: [1.1, 0.5, 0.18], r: 7 });
  for (const l of luzes) { const k = fatorTunel(l.p[0], l.p[1], l.p[2]); if (k > 0.02) AMB.luzes.push({ p: l.p, c: l.c.map(v => v * k), r: l.r }); }
}

// ================================================================ CÂMERAS
function camT(ta, ol, al, fov, rolo = 0) { CAM = { olho: tremP(ta, ol[0], ol[1], ol[2]), alvo: tremP(ta, al[0], al[1], al[2]), fov, rolo, perto: 0.03, longe: 6000 }; }
function camW(ol, al, fov, rolo = 0) { CAM = { olho: ol.slice(), alvo: al.slice(), fov, rolo, perto: 0.08, longe: 6000 }; }
function mao(ol, t, amp = 0.03, freq = 1.6) { const s = tremor(t, amp, freq); return [ol[0] + s[0], ol[1] + s[1], ol[2] + s[2]]; }
// close no rosto: câmera na frente da cabeça (direção do corpo + torção + giro da cabeça), um pouco de lado
function closeRosto(ta, est, dist, lado, fov, dy = 0, alvoDy = 0, av = 0) {
  const p = est.p, y = cabecaY(est.P, p), f = frente(p.yaw + (p.torce || 0) + (p.cabYaw || 0)), sx = f[1], sz = -f[0];
  camT(ta, [p.x + f[0] * (dist + av) + sx * lado, y + dy, p.z + f[1] * (dist + av) + sz * lado], [p.x + f[0] * (0.04 + av), y + alvoDy, p.z + f[1] * (0.04 + av)], fov);
}
// close no rosto, versão no mundo (cânion); semCab: a câmera não acompanha o giro da cabeça
function closeRostoW(est, dist, lado, fov, dy = 0, alvoDy = 0, av = 0, semCab = false) {
  const p = est.p, y = cabecaY(est.P, p), f = frente(p.yaw + (p.torce || 0) + (semCab ? 0 : (p.cabYaw || 0))), sx = f[1], sz = -f[0];
  camW([p.x + f[0] * (dist + av) + sx * lado, y + dy, p.z + f[1] * (dist + av) + sz * lado], [p.x + f[0] * (0.04 + av), y + alvoDy, p.z + f[1] * (0.04 + av)], fov);
}
// onde fica o relógio erguido por Jack no P46 (inserto desenhado à parte)
function cabecaY(P, p) { return p.y + P.D.quadril + P.D.pescoco + 0.12 * P.D.s - p.sentado * (P.D.quadril - 0.47 * P.D.s); }
function frente(yaw) { return [Math.sin(yaw), Math.cos(yaw)]; }

// P41b (2,8 s, sem pressa, um movimento só): na frente do rosto dela, a câmera sobe até o furo da frente e chega devagar,
// sem parar; atravessa a copa, sai pelo furo de trás (por onde já se veem os três, em V) e segue reto, acelerando aos poucos,
// até a frente do grupo, onde para, recuando com eles, enquanto os ajudantes atiram. A linha dos furos aponta para os três o
// tempo todo (a cabeça dela gira um pouco para isso: furoNoGrupo), e a câmera não faz curva nem gira. A distância anda numa
// curva exponencial (devagar no chapéu, depressa no meio do caminho, devagar no fim), para o ritmo ser um só. O alcance da
// lente e as luzes são os mesmos do começo ao fim (antes, o fundo de mesetas e o pó do grupo só apareciam depois do furo).
// a parte do rosto ao furo (o P41b começa 0,3 s depois da bala e chega ao furo da frente em 145,78 s da música); a curva
// da distância; a velocidade com que chega ao furo (a mesma com que a outra parte começa)
const FURO_PARTE = (145.78 - 143.70) / (147.55 - 143.70), FURO_K = 7.6, FURO_VFIM = 0.5;
// a direção do voo, do furo de trás para o meio dos três, quando a câmera sai do chapéu (2:26,03 da música)
let _voo = null;
function linhaDoVoo() {
  if (_voo) return _voo;
  const ta = tempoAcao(146.03), P = G.jackFL, p = poseJackMontada(ta), B = chapeuNoMundo(P, p, linhaBala().entra.l), m = centroV(ta);
  return (_voo = normaliza([m[0] - B[0], m[1] - 0.4 - B[1], m[2] - B[2]]));
}
// o meio do V (os três), na altura dos rostos
function centroV(ta) {
  let x = 0, y = 0, z = 0;
  for (const g of GRUPO) { const c = estadoCavaloGrupo(g, ta), p = poseGrupo(g, ta, c); x += c.e.x; z += c.e.z; y += cabecaY(g.P(), p); }
  return [x / 3, y / 3, z / 3];
}
function camFuroLongo(ta, u) {
  const P = G.jackFL, p = poseJackMontada(ta), L = linhaBala(), dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const F = chapeuNoMundo(P, p, L.sai.l), B = chapeuNoMundo(P, p, L.entra.l), ax = normaliza([B[0] - F[0], B[1] - F[1], B[2] - F[2]]);
  const at = (q, k) => [q[0] + ax[0] * k, q[1] + ax[1] * k, q[2] + ax[2] * k];
  const rosto = doCabeca(P, p, [0, 0.03, 0.05]), ini = [F[0] - ax[0] * 0.66, F[1] - 0.04, F[2] - ax[2] * 0.66], meio = at(F, -0.25), F1 = at(F, -0.012), B1 = at(B, 0.03), fundo = at(B, 30);
  const m = centroV(ta), xe = estadoCavaloGrupo(GRUPO[0], ta).e, d = frente(rumo(t => curva(GRUPO[0].traj, t), ta, 0.3).yaw), grupo = [m[0], m[1] - 0.4, m[2]];
  AMB.luzes.push({ p: [ini[0], ini[1] + 0.25, ini[2]], c: [0.45, 0.5, 0.75], r: 2.2 }, { p: [xe.x + d[0] * 3, m[1] + 1.2, xe.z + d[1] * 3], c: [0.45, 0.5, 0.75], r: 7 }); // o luar no rosto dela e nos três
  let o, alvo, fov, perto = 0.004;
  if (u < FURO_PARTE) { // do rosto ao furo da frente
    const x = u / FURO_PARTE, a = suave(fase0(x, 0, 0.6)), xb = fase0(x, 0.32, 1), b = xb * xb * (3 - 2 * xb) + (xb * xb * xb - xb * xb) * FURO_VFIM;
    const sobreF = [F[0], F[1] + 0.025, F[2]]; // um pouco acima do furo: as chamas sobem dele e ficam sempre no quadro
    o = lerp3(lerp3(ini, meio, a), F1, b); alvo = lerp3(lerp3(lerp3(rosto, sobreF, 0.45), sobreF, a), fundo, b); fov = lerp1(lerp1(34, 22, a), 13, b); // o rosto e, em cima, o chapéu queimando
  } else { // pela copa e pelo furo de trás; dali, reto, na linha dos furos, até a frente dos três (só no fim sobe um pouco, para o V se ler)
    // o fim fica a 11,5 m do meio dos três e 1 m acima da linha (o V se lê de cima, mesmo quando eles viram), numa direção parada no mundo (a da linha dos furos quando a câmera sai do chapéu):
    // a câmera chega e segue com eles sem girar, mesmo quando ela vira para oeste
    // (no fim do voo, longe do chapéu, a direção vai aos poucos para 60% do rumo do xerife: quando eles viram para oeste,
    // o V continua aberto, sem o xerife passar na frente do ajudante da direita)
    const v = (u - FURO_PARTE) / (1 - FURO_PARTE), g0 = linhaDoVoo(), wH = 0.6 * suave(fase0(v, 0.3, 1)), hd = normaliza([lerp1(g0[0], -d[0], wH), 0, lerp1(g0[2], -d[1], wH)]);
    const gd = [hd[0] * Math.sqrt(1 - g0[1] * g0[1]), g0[1], hd[2] * Math.sqrt(1 - g0[1] * g0[1])], T = [grupo[0] - gd[0] * 11.5, grupo[1] - gd[1] * 11.5 + 1.0, grupo[2] - gd[2] * 11.5];
    const dB = dist(F1, B1), Lb = dist(B1, T), C1 = [T[0] - gd[0] * 0.45 * Lb, T[1] - gd[1] * 0.45 * Lb, T[2] - gd[2] * 0.45 * Lb], s = 1 - (1 - v) ** 3, dd = (Math.exp(FURO_K * s) - 1) / (Math.exp(FURO_K) - 1) * (dB + Lb);
    if (dd <= dB) o = at(F1, dd);
    else { const q = (dd - dB) / Lb, w0 = (1 - q) * (1 - q), w1 = 2 * (1 - q) * q, w2 = q * q; o = [0, 1, 2].map(i => w0 * B1[i] + w1 * C1[i] + w2 * T[i]); o[1] = Math.max(o[1], alturaTerreno(o[0], o[2]) + 0.6); }
    alvo = lerp3(fundo, grupo, suave(fase0(v, 0, 0.3))); fov = lerp1(13, 38, suave(fase0(v, 0.4, 0.92))); // a linha dos furos já aponta para eles: o olhar quase não muda
    perto = lerp1(0.004, 0.05, clamp01((dd - dB - 0.5) / 3));
  }
  CAM = { olho: o, alvo, fov, rolo: 0, perto, longe: 6000 };
}
// no plano do avental largado (P18a), a luz da arandela da parede +z junto à porta cai no chão: uma luz baixa e curta perto
// do chão (não na altura da arandela), para clarear o avental e o vestido sem estourar quem está em pé; entra entre as 4 do
// quadro (pri)
// luzes do vagão-restaurante (as mesmas de luzesVagaoD) marcadas para entrar sempre entre as 4 do quadro (pri): o lustre em
// x, o abajur da mesa em x do lado s, e a luz do balcão
function luzesFixasD(ta, quais) {
  const k = luzVagaoD(ta);
  return quais.map(([o, x, s]) => o === 'lustre' ? { p: tremP(ta, CX_D + x, 3.9, 0), c: [0.95 * k, 0.66 * k, 0.38 * k], r: 7, pri: 1 }
    : o === 'mesa' ? { p: tremP(ta, CX_D + x, PISO + 1.15, s * 1.15), c: [0.5 * k, 0.32 * k, 0.16 * k], r: 2.4, pri: 1 }
    : { p: tremP(ta, CX_D - 6.3, 3.0, -0.6), c: [0.9 * k, 0.6 * k, 0.3 * k], r: 4, pri: 1 });
}
function luzArandelaPorta(ta) { const k = luzVagaoD(ta); return { p: tremP(ta, CX_D - 7.0, PISO + 0.5, 0.85), c: [1.2 * k, 0.88 * k, 0.52 * k], r: 2.0, pri: 1 }; }
// P11: a câmera fica fora da plataforma, logo atrás do Barão, de frente para a janela dela (de fora, quem está a 1,2 m do
// vidro só é visto quase de frente): ele de costas, à direita, conferindo o relógio; ela no meio da janela, encarando-o.
// Quando o trem parte, a câmera acompanha a janela dela (num carrinho, ao lado do trem): o Barão fica para trás, passa pela
// frente da câmera como uma silhueta e sai pela esquerda, e a cabeça dela o segue
function camP11(ta, u) {
  const j = estadoJack(ta).p, h = [j.x + xLoco(ta), Y_TRILHO + cabecaY(G.jack, j) - 0.03, j.z], xj = xLoco(ta) + CX_D + JANELA_P11[0];
  CAM = { olho: [xj + 0.25, 2.5, 7.1], alvo: [h[0] + 0.12, h[1] - 0.05, h[2]], fov: lerp1(20, 10.5, suave(fase0(u, 0.42, 0.88))), rolo: 0, perto: 0.05, longe: 6000 }; // depois que ele fica para trás, a lente fecha devagar no rosto dela
  const k = luzVagaoD(ta); AMB.luzes.push({ p: tremP(ta, CX_D + JANELA_P11[0] + 0.1, 2.92, 0.95), c: [1.35 * k, 1.02 * k, 0.7 * k], r: 1.3, pri: 1 }, ...luzesFixasD(ta, [['mesa', -1.8, 1], ['lustre', -2.6], ['lustre', 2.6]])); // a luz do rosto, entre ela e o vidro
}
// ================================================================ PLANOS
function montaPlanos() {
  preparaTrajetos();
  const P = [];
  const add = (id, a, b, nome, cam, cena) => P.push({ id, a, b, nome,
    prepara(t) { ambFilme(t); const ta = tempoAcao(t); TA = ta; cam(ta, fase0(t, a, b), t); escureceTunel(); },
    desenha(t) { cena(TA, t); } });
  const trem = (o) => (ta) => cenaTrem(ta, o), dentro = trem({ dentroD: true }), fora = trem({}), canion = (ta) => cenaCanion(ta);
  const jackP = ta => estadoJack(ta).p, xerP = ta => estadoXerife(ta).p;

  // ---------------- ATO 1 — O LUXO
  add('P01', 0, 7, 'plano aéreo ao pôr do sol', (ta, u) => { const x = xLoco(ta); camW([x + 150 - 12 * u, lerp1(70, 22, suave(u)), lerp1(58, 36, u)], [x - 14, 3, 0], 32); }, fora);
  add('P02', 7, 14.34, 'travelling até a janela', (ta, u, t) => {
    const u1 = suave(fase0(t, 7, 12.6)), u2 = suave(fase0(t, 12.6, 14.34)), u2y = suave(fase0(t, 13.3, 14.34));
    // entra pela janela ao lado do convidado sentado junto dela e só desce depois de passar a cartola dele; passa
    // 24 cm à esquerda da borda do vão (antes eram 9 cm, e a câmera atravessava a cortina em 13,86 a 13,88 s)
    const x = lerp1(3, -28.18, u1), z = lerp1(6.6, 0.3, u2), y = lerp1(3.2, 2.68, Math.max(u2y, u1 * 0.3));
    camT(ta, [x, y, z], [x - lerp1(4, 0.6, u2), lerp1(2.4, 2.45, u2), lerp1(0, -1.5, u2)], lerp1(40, 52, u2));
    ESTADO.camDentro = z < 1.6;
  }, (ta) => cenaTrem(ta, { dentroD: ESTADO.camDentro }));
  add('P03', 14.34, 15.22, 'o diamante na vitrine', (ta, u) => { camT(ta, [CX_D + 4.4 + 0.18 * u, 2.78, 0.25], [CX_D + 6.05, 2.55, 0.82], lerp1(18, 15, u)); AMB.bloom += 0.15; }, dentro);
  add('P04', 15.22, 15.99, 'a estrela do xerife', (ta, u) => { const p = xerP(ta), y = p.y + 1.45; camT(ta, [p.x - 1.75 + 0.1 * u, y + 0.1, p.z - 0.35], [p.x - 0.1, y + 0.05, p.z - 0.05], 30); }, dentro);
  add('P05', 15.99, 17.3, 'o cartaz de procurado', (ta, u) => camT(ta, [CX_D + 6.25 + 0.2 * u, 2.76, 0.92], [CX_D + 7.43, 2.78, 0.98], 30), dentro);
  add('P06', 17.3, 18.96, 'os olhos da garçonete', (ta, u) => { const p = jackP(ta), y = cabecaY(G.jack, p) - 0.01, d = frente(p.yaw + p.cabYaw), k = suave(fase0(u, 0.12, 0.95));
    const dist = lerp1(1.1, 0.42, k), ya = lerp1(y - 0.07, y + 0.02, k); // começa no rosto inteiro (a pinta, o broche) e aproxima até os olhos
    camT(ta, [p.x + d[0] * dist, lerp1(y - 0.02, y + 0.03, k), p.z + d[1] * dist], [p.x, ya, p.z], lerp1(26, 15, k)); }, dentro);
  // o luxo do vagão, sem seguir a garçonete: a câmera fica de pé entre as mesas da frente, do lado dos convidados (+z), e
  // tem um movimento próprio, que não depende de onde ela está: avança devagar e gira um pouco para o lado dos convidados.
  // Ela vem do balcão pelo corredor, pequena no meio do luxo, cresce e termina no terço direito do quadro, sempre de rosto
  // para a câmera (de frente ou de três quartos). Luzes fixas: os dois lustres (o da frente ilumina o primeiro plano) e os
  // abajures das mesas -4,4 e -1,8 do lado dos convidados (o rosto dela, quando passa por eles). O plano todo fica um pouco
  // mais à direita (o olho 10 cm mais para o meio do corredor e a mira 25 cm mais à direita, do começo ao fim), para a parede
  // da esquerda não tomar o quadro
  add('P07', 18.96, 23.7, 'o luxo do vagão', (ta, u) => { const s = suave(u), o = lerp3([CX_D + 2.58, 3.13, 0.46], [CX_D + 2.2, 3.07, 0.64], s);
    camT(ta, o, [o[0] - 8, o[1] - 0.5, o[2] + lerp1(-0.5, 0.8, s)], 36);
    AMB.luzes.push(...luzesFixasD(ta, [['lustre', -2.6], ['lustre', 2.6], ['mesa', -4.4, 1], ['mesa', -1.8, 1]])); }, dentro);
  // por cima do ombro esquerdo dela: ela em primeiro plano, parada com a bandeja; ao fundo, o Barão ergue a taça junto da
  // vitrine, reconhecível, mas menor que antes; os olhos dela vão para o diamante. Luzes fixas
  add('P08', 23.7, 27.48, 'o brinde do Barão', (ta, u) => { const p = jackP(ta), y = cabecaY(G.jack, p);
    camT(ta, [p.x - 0.95, y + 0.1, p.z + 0.5], [CX_D + 4.6, y - 0.02, -0.25], lerp1(34, 30, suave(u)));
    AMB.luzes.push(...luzesFixasD(ta, [['lustre', 2.6], ['lustre', -2.6], ['mesa', 0.8, 1], ['mesa', 3.4, -1]])); }, dentro);
  const camP09 = (ta) => { const p = jackP(ta); camT(ta, [p.x + 2.6, 2.95, -0.18], [p.x + 0.2, 2.55, p.z], 44); };
  add('P09', 27.48, 29.25, 'a garçonete entre os ricos', camP09, dentro);
  // do outro lado da mesa, por cima do ombro da convidada em frente: o rosto dela servindo o convidado que estalou os dedos
  // (a câmera fica à esquerda dela, para o bule, na mão direita, não tapar o rosto)
  add('P09b', 29.25, 30.6, 'ela serve o convidado', (ta, u) => { const p = jackP(ta), y = cabecaY(G.jack, p);
    camT(ta, [p.x - lerp1(0.5, 0.4, suave(u)), PISO + 1.34, 1.3], [p.x + 0.08, y - 0.08, p.z], 33); }, dentro);
  // de frente, recuando pelo corredor à frente dela: atrás dela, a ponta da frente do vagão e a vitrine do diamante (a pista é
  // só o enquadramento). Luzes fixas (os dois lustres e os abajures da mesa 0,8)
  add('P09c', 30.6, 33.84, 'ela volta entre as mesas', (ta, u) => { const p = jackP(ta), y = cabecaY(G.jack, p), D = lerp1(2.9, 2.4, suave(u));
    camT(ta, [p.x - D, y + 0.34, 0.04], [p.x + 0.5, y - 0.2, p.z * 0.4], lerp1(33, 29, suave(u))); // um pouco acima dela: as cabeças dos convidados sentados descem para a beira de baixo
    AMB.luzes.push(...luzesFixasD(ta, [['lustre', 2.6], ['lustre', -2.6], ['mesa', 0.8, -1], ['mesa', 0.8, 1]])); }, dentro);
  add('P10', 33.84, 36.4, 'o Barão desce na estação', (ta, u) => camW([-4 - 3 * u, 2.5, 15], [-26, 2.3, 3.6], lerp1(42, 33, u)), fora);
  // na plataforma, atrás do ombro direito do Barão (escuro, em primeiro plano): a lente longa na janela acesa do restaurante,
  // onde ela o encara, desconfiada, enquanto ele confere o relógio; o trem parte (38,2 s), a janela dela vem chegando e passa
  // por ele (42,2 s), e a cabeça dela o segue. O vidro do restaurante fica claro visto de fora só neste plano; as luzes são
  // fixas: uma no rosto dela (do lado da janela), o abajur da mesa ao lado dela e os dois lustres
  add('P11', 36.4, 43.32, 'ela observa o Barão ficar', (ta, u) => camP11(ta, u), (ta) => cenaTrem(ta, { vidroClaroD: true }));
  add('P12', 43.32, 46.06, 'o túnel engole o trem', (ta, u) => camW([5, 1.1, 7.5], [19, 3.6, 0], 46), fora);
  add('P13', 46.06, 52.48, 'no escuro', (ta, u) => camT(ta, [CX_D - 3.2, 2.9, -0.62], [CX_D + 6.05, 2.45, 0.7], 46), dentro);
  // depois do roubo: decupagem com closes nas reações (52,48 a 70)
  const conv = i => { const [, x, lado, olha] = ASSENTOS.find(a => a[0] === i); return { P: G.convidados[i], p: poseConvidado(i, x, lado, olha, ta0) }; };
  let ta0 = 0;
  add('P14a', 52.48, 53.9, 'a vitrine vazia', (ta, u) => { camT(ta, [CX_D + 4.75 + 0.4 * suave(u), 2.85, 0.42], [CX_D + 6.05, 2.5, 0.82], lerp1(26, 19, suave(u))); AMB.luzes.push({ p: tremP(ta, CX_D + 5.6, 3.3, 0.5), c: [0.9, 0.75, 0.55], r: 2.5 }); }, dentro);
  add('P14b', 53.9, 54.62, 'o grito da senhora', (ta, u) => { ta0 = ta; closeRosto(ta, conv(0), 0.72, -0.16, 30, 0.02); }, dentro);
  add('P14c', 54.62, 55.33, 'o xerife entende', (ta, u) => closeRosto(ta, estadoXerife(ta), 0.9 - 0.1 * u, 0.14, 28, 0.0, -0.06), dentro);
  // depois do roubo, uma cena simples, com tempo para respirar: ela fica no fundo e age como garçonete (até o P19, nenhuma
  // pista além da câmera, que fica nela); o xerife fica lá na frente, na vitrine, de costas para o vagão, e só vira uma vez
  const luzVitrine = ta => ({ p: tremP(ta, CX_D + 5.6, 3.3, 0.5), c: [0.9, 0.75, 0.55].map(c => c * luzVagaoD(ta)), r: 2.5, pri: 1 });
  const luzesFundo = ta => AMB.luzes.push(...luzesFixasD(ta, [['lustre', -2.6], ['mesa', -4.4, 1], ['lustre', 2.6]]), luzVitrine(ta));
  // do fundo do vagão: ela serve o café da senhora assustada (de costas para nós, em primeiro plano) e, lá na frente,
  // pequeno, o xerife de costas na vitrine; sem corte, dá para ver que ele não a vê
  add('P15a', 55.33, 57.2, 'o café para a senhora', (ta, u) => { camT(ta, CAFE.fundo, [CX_D - 3.6, PISO + 1.1, 0.45], lerp1(42, 39, suave(u))); luzesFundo(ta); }, dentro);
  // do lado do corredor, cabeça e ombros: ela ainda serve, com atenção; ergue os olhos para a senhora e o sorriso leve nasce;
  // ao pousar o bule, o sorriso se desfaz numa calma serena e os olhos baixam um pouco (de três quartos, longe da lente); ela
  // só se vira para a porta depois do corte. Ao fundo, pelo corredor, o xerife de costas na vitrine. A câmera não a segue:
  // avança devagar 15 cm e não acompanha a inclinação do corpo; fechada o bastante (26 graus) para o convidado de bigode,
  // atrás dela, ficar fora do quadro, em vez de cortado na borda. Ao avançar, gira 3 graus para o lado da senhora: o espaço
  // para onde ela olha cresce, e os dois convidados ao fundo, à direita, ficam inteiros dentro ou fora do quadro
  add('P15b', 57.2, 58.6, 'ela acalma a senhora', (ta, u) => { const s = suave(fase0(ta, 57.3, 58.5));
    camT(ta, CAFE.ladoCorredor(lerp1(1.35, 1.2, s)), [CAFE.cab[0] + 0.027 * s, CAFE.cab[1] - 0.09, CAFE.cab[2] + 0.059 * s], 26);
    AMB.luzes.push(...luzesFixasD(ta, [['lustre', -2.6], ['balcao'], ['mesa', -4.4, -1], ['mesa', -4.4, 1]])); }, dentro);
  // de perfil, do lado do corredor: o xerife encara a carta de valete no pedestal vazio; enquanto isso ela sai, fora de quadro
  add('P16a', 58.6, 60.4, 'o xerife na vitrine', (ta, u) => { camT(ta, [CX_D + 5.84, PISO + 1.5, -0.56], [CX_D + 5.64, PISO + 1.45, 0.6], lerp1(46, 40, suave(u)));
    const k = luzVagaoD(ta); // o brilho da vitrine no rosto dele
    AMB.luzes.push(...luzesFixasD(ta, [['lustre', 2.6], ['lustre', -2.6]]), luzVitrine(ta), { p: tremP(ta, CX_D + 5.8, PISO + 1.55, 0.35), c: [0.85 * k, 0.68 * k, 0.48 * k], r: 1.3, pri: 1 }); }, dentro);
  // o mesmo plano do P15a, agora sem ela: só a senhora e o bule ainda balançando; lá na frente, o xerife se vira
  add('P16b', 60.4, 61.81, 'só o bule balança', (ta, u) => { camT(ta, CAFE.fundo, [CX_D - 3.6, PISO + 1.1, 0.45], lerp1(39, 35, suave(u))); luzesFundo(ta); }, dentro);
  add('P17a', 61.81, 62.9, 'o alarme', (ta, u) => closeRosto(ta, estadoXerife(ta), 0.95, -0.14, 30), dentro);
  add('P17b', 62.9, 64.4, 'os ajudantes entram', (ta, u) => camT(ta, [CX_D + 1.8, PISO + 1.55, -0.8], [CX_D + 6.5, PISO + 1.1, 0.0], 46), dentro); // do lado do corredor: o xerife passa correndo por nós
  add('P17c', 64.4, 65.2, 'por ali!', (ta, u) => { ta0 = ta; closeRosto(ta, conv(7), 1.0, -0.32, 38, -0.02, -0.14); }, dentro);
  add('P17d', 65.2, 66.0, 'o xerife vai até a porta', (ta, u) => camT(ta, [CX_D - 6.95, 2.55, -0.22], [CX_D - 3.8, 2.62, 0.08], 40), dentro);
  // atrás dele: o avental na porta. As 4 luzes do quadro são as mesmas o plano inteiro (antes eram as 4 mais perto da câmera,
  // e com ela recuando o abajur de uma mesa trocava pelo de outra em 1:07,15 e o lustre do meio pela luz do balcão em 1:07,45:
  // o começo ficava escuro e o fim claro); são as do fim, como no P17d e no P18b
  add('P18a', 66.0, 68.3, 'o avental largado', (ta, u) => { camT(ta, [CX_D - 2.6 - 1.0 * suave(u), 2.35, -0.3], [CX_D - 6.85, 1.85, 0.18], 40);
    AMB.luzes.push(luzArandelaPorta(ta), ...luzesFixasD(ta, [['lustre', -2.6], ['mesa', -4.4, -1], ['balcao']])); }, dentro);
  // de frente e de baixo, do lado do balcão (sem a convidada na frente): o avental aberto, a carta no bolso, o rosto dele
  // acima. Um segundo inteiro (antes eram 0,75 s), com o mesmo avanço lento
  add('P18b', 68.3, 69.3, 'o avental da garçonete', (ta, u) => { const e = estadoXerife(ta), p = e.p, f = frente(p.yaw), sx = f[1], sz = -f[0];
    const hy = cabecaY(G.xerife, p), c = [p.x + f[0] * 0.45, hy - 0.95, p.z + f[1] * 0.45];
    camT(ta, [c[0] + f[0] * (1.5 - 0.12 * u) + sx * 0.75, hy - 0.52, c[2] + f[1] * (1.5 - 0.12 * u) + sz * 0.75], [c[0], hy - 0.45, c[2]], 40);
    AMB.luzes.push({ p: tremP(ta, c[0] + f[0] * 1.4, hy + 0.6, c[2] + f[1] * 1.4), c: [0.45, 0.38, 0.3], r: 3 }); }, dentro);
  // o inserto: começa com o avental inteiro no quadro (o peitilho, o cós, a saia e o bolso) e aproxima até a boca do bolso,
  // com a ponta da carta; uma luz quente de cima e do lado da carta, entre as 4 do quadro (antes era fraca e ficava de
  // fora, e o avental saía quase preto). 1,6 s: o avanço acaba em 2/3 do plano e a câmera fica quase parada na carta (só
  // 1 cm a mais), para ela ser lida
  add('P18c', 69.3, 70.9, 'a carta no bolso', (ta, u) => { const S = estadoXerife(ta).avental, B = avPonto(S, 0.1, -0.41, 0.007), k = suave(fase0(u, 0, 0.68));
    const d = lerp1(0.75, 0.42, k) - 0.01 * u, o = lerp1(0.1, 0.06, k), a = lerp1(0.02, -0.005, k);
    camT(ta, [B[0] + S.N[0] * d + S.Wt[0] * o, B[1] + 0.06, B[2] + S.N[2] * d + S.Wt[2] * o], [B[0], B[1] + a, B[2]], 30);
    AMB.luzes.push({ p: tremP(ta, B[0] + S.N[0] * 0.3 + S.Wt[0] * 0.5, B[1] + 0.3, B[2] + S.N[2] * 0.3 + S.Wt[2] * 0.5), c: [0.6, 0.52, 0.4], r: 1.4, pri: 1 }); AMB.bloom *= 0.7; }, dentro);
  // a revelação, numa tomada só (antes eram o P18d, de 0,4 s, e este): começa no rosto dele, de frente e um pouco do lado +z
  // (o mesmo lado do P20), ainda olhando a carta, com a porta atrás e ela no vidro, erguendo o chapéu; ele ergue os olhos e
  // vira para a porta (X_REV), a câmera passa do rosto dele para o vidro e avança até ficar por cima do ombro dele, como
  // no fim de antes. A luz de dentro, pelo vidro da porta, no rosto dela (alta e de alcance curto, para não esquentar o
  // xerife); as outras três são as de sempre deste plano, fixas
  const CAM_REV = { olho: [CX_D - 6.2 + 0.82, 2.93, 0.25 + 0.57], olhoFim: [CX_D - 5.9, 2.84, 0.4], vidro: [CX_D - 7.8, 2.8, 0.0], fov: 32, fovFim: 24,
    pan0: 72.25, pan1: 73.4, avanca0: 72.9, avanca1: 76.2 };
  add('P19', 70.9, 76.29, 'a revelação no vidro', (ta, u) => { const C = CAM_REV, p = estadoXerife(ta).p, a = suave(fase0(ta, C.avanca0, C.avanca1));
    const rosto = [p.x, cabecaY(G.xerife, p) - 0.04, p.z];
    camT(ta, lerp3(C.olho, C.olhoFim, a), lerp3(rosto, C.vidro, suave(fase0(ta, C.pan0, C.pan1))), lerp1(C.fov, C.fovFim, a));
    AMB.luzes.push(...luzesFixasD(ta, [['lustre', -2.6], ['mesa', -4.4, 1], ['balcao']]), { p: tremP(ta, CX_D - 7.55, 3.15, 0.0), c: [0.87, 0.76, 0.62].map(x => x * luzVagaoD(ta)), r: 1.8, pri: 1 }); }, dentro);
  add('P20', 76.29, 77.51, 'os olhares se cruzam', (ta, u) => camT(ta, [CX_D - 6.9, 2.85, 0.28], [CX_D - 8.0, 2.84, 0.05], 24), dentro);
  add('P21', 77.51, 79.86, 'ela sobe para o teto', (ta, u, t) => camT(ta, mao([-41.5, 0.62, 2.7], t, 0.04, 3), [-40.4, 2.7, 1.15], 52), fora);
  add('P22', 79.86, 81.82, 'corrida ao luar', (ta, u) => camT(ta, [-49 - u, 9.5, 17], [-46.5, 4.3, 0], 38), fora);
  add('P23', 81.82, 84.36, 'a placa da divisa', (ta, u) => camT(ta, [-49.6, 5.7, 7.3], [-54.5, 4.7, 0], 44), fora);
  add('P24', 84.36, 86.85, 'de vagão em vagão', (ta, u, t) => { const s = xerP(ta), j = jackP(ta); camT(ta, mao([s.x + 3.4, ALT.teto + 2.1, 1.5], t, 0.05, 2), [j.x - 1.5, ALT.teto + 1.1, 0], 52); }, fora);
  add('P24b', 86.85, 87.85, 'ela encara o xerife; a montanha atrás dele', (ta, u) => { const s = xerP(ta), j = jackP(ta); camT(ta, [j.x - 1.75, TETO_P + 1.5, 0.62], [s.x + 7, TETO_P + 1.75, -0.15], 44); }, fora);
  add('P24c', 87.85, 88.4, 'ela vê o túnel', (ta, u) => closeRosto(ta, estadoJack(ta), 0.74, 0.14, 28, 0.02, 0.0), fora);
  add('P24d', 88.4, 89.25, 'o xerife se vira', (ta, u) => { const s = xerP(ta), j = jackP(ta); camT(ta, [j.x - 0.5, TETO_P + 0.42, -0.95], [s.x + 3.5, TETO_P + 1.45, 0.1], 50); }, fora);
  add('P25', 89.25, 90.41, 'túnel à frente', (ta, u) => camT(ta, [-69.6, ALT.teto + 0.7, 0.7], [-61, ALT.teto + 1.0, 0], 50), fora);
  add('P26', 90.41, 94.9, 'saída do túnel na fumaça', (ta, u) => { const s = suave(fase0(ta, 91.7, 92.7)); camT(ta, [-75.1, ALT.teto + lerp1(0.8, 2.0, s), lerp1(1.2, 2.4, s)], [-64, ALT.teto + 0.9, 0], 46); }, fora); // rente ao teto dentro do túnel (cabe sob o arco), sobe depois da saída
  add('P27', 94.9, 97.49, 'o vão largo', (ta, u) => camT(ta, [-76.2, 4.9, 5.8], [-76.6, 3.7, 0], 50), fora); // por dentro da linha dos postes
  const camP28 = (ta) => camT(ta, [-77.3, ALT.parede + 1.95, 0.0], [-88, ALT.parede + 1.1, 0], 44);
  add('P28', 97.49, 98.85, 'a emboscada em fila', camP28, fora); // ela se rende
  // close: por cima do ombro dela, a mão erguida abre o leque de valetes de ouros; ao fundo, os três; o leque sai voando
  add('P28a', 98.85, 99.3, 'o leque de cartas', (ta, u) => { const c = memoLeque('camP28a', () => { const e = estadoJack(99.0), p = e.p, D = e.P.D;
      const h = doTronco(e.P, p, maoFK(D, 1, p.ombroD, p.abracoD, p.cotoveloD, p.giroBD)), f = frente(p.yaw), r = [Math.cos(p.yaw), -Math.sin(p.yaw)];
      return [[h[0] - f[0] * 0.55 + r[0] * 0.3, h[1] + 0.03, h[2] - f[1] * 0.55 + r[1] * 0.3], [h[0] + f[0] * 1.2 + r[0] * 0.08, h[1] - 0.12, h[2] + f[1] * 1.2 + r[1] * 0.08]]; });
    camT(ta, c[0], c[1], lerp1(36, 33, suave(u))); }, fora);
  // de frente para os três, em teleobjetiva: as três cabeças seguem a carta juntas
  add('P28b', 99.3, 100.4, 'as cartas na cara deles', (ta, u) => camT(ta, [-82.9, TETO_S + 1.3, 0.25], [-87.6, TETO_S + lerp1(1.9, 1.6, suave(u)), -0.05], 30), fora);
  // de onde ela estava: ela some pela beirada enquanto eles estão de costas; eles voltam e o telhado está vazio
  add('P28c', 100.4, 101.56, 'ela sumiu', (ta, u) => camT(ta, [-80.8, TETO_S + 1.55, 0.5], [-87.6, TETO_S + 1.25, -0.15], 30), fora);
  add('P29', 101.56, 104.2, 'por fora do vagão', (ta, u, t) => { camT(ta, mao([-86.0 + 0.4 * u, 1.85, -4.1], t, 0.05, 4), [lerp1(-81.9, -83.1, suave(u)), 2.8, -1.6], 44);
    const ab = aberturaPortaS(ta), q = tremP(ta, -83.4, 2.4, -0.9), f = tremP(ta, -82.2, 3.4, -3.2); // luz do lampião de dentro escapa pela porta
    AMB.luzes.push({ p: q, c: [0.5 + 2.6 * ab, 0.3 + 1.5 * ab, 0.12 + 0.5 * ab], r: 6 }, { p: f, c: [0.25, 0.3, 0.45], r: 6 }); }, fora);
  add('P30a', 104.2, 106.75, 'no vagão dos cavalos', (ta, u) => camT(ta, [CX_S + 2.6, 2.65, -0.95], [CX_S - 3.6, 2.1, 0.5], 50), fora);
  add('P30b', 106.75, 107.75, 'o clique', (ta, u) => { const p = poseJackNoVagao(ta), y = cabecaY(G.jackFL, p), s = xerW(ta);
    const aS = Math.atan2(s.x - p.x, s.z - p.z), a = aS + LADO_CLOSE, f = [Math.sin(a), Math.cos(a)]; // câmera um pouco ao lado da linha do olhar: ela vira o rosto para fora de quadro, à esquerda
    camW([p.x + f[0] * 0.8, y + 0.03, p.z + f[1] * 0.8], [p.x + f[0] * 0.05, y, p.z + f[1] * 0.05], 28); }, fora);
  add('P30c', 107.75, 109.63, 'o xerife sob o lampião', (ta, u) => { const s = xerW(ta), j = poseJackNoVagao(ta), d = normaliza([s.x - j.x, 0, s.z - j.z]), sx = d[2], sz = -d[0];
    camW([j.x - d[0] * 0.75 + sx * 0.38, j.y + 1.62, j.z - d[2] * 0.75 + sz * 0.38], [s.x, s.y + 1.6, s.z], lerp1(22, 17, u)); }, fora);
  // do alto, junto do teto, do lado da porta: ela, junto do cavalo, vira para ele, tira o diamante da bolsa e anda até ele com
  // o diamante na palma. Ele entra por baixo e pela esquerda, de costas, e para em primeiro plano; o cabo do ancinho aparece
  // entre os dois, na palha (sem destaque). Do lado da porta os dois não se cobrem (estão na linha do cabo)
  add('P31', 109.63, 113.15, 'ela oferece o diamante', (ta, u) => { const j = poseJackNoVagao(ta), jx = j.x - xLoco(ta), k = suave(fase0(ta, 111.2, 112.7));
    camT(ta, [CX_S + 3.0, 3.45, -1.32], [lerp1(jx, CX_S + ANC.cab[0], 0.3 - 0.15 * k), lerp1(2.2, 2.3, k), j.z + 0.25 * k], lerp1(38, 44, k)); }, fora);
  // o inserto: o diamante na palma dela, de perto, pelo lado dela; atrás, o xerife de olho na joia
  add('P32', 113.15, 117.17, 'o tique dentro do diamante', (ta, u) => { const d = diamanteS(ta), n = d.base[1], c = [d.pos[0] + n[0] * 0.1, d.pos[1] + n[1] * 0.1, d.pos[2] + n[2] * 0.1];
    const ex = estadoXerife(ta), h = [ex.p.x + xLoco(ta), cabecaY(ex.P, ex.p) + Y_TRILHO, ex.p.z], j = poseJackNoVagao(ta), f = frente(j.yaw), dir = [Math.cos(j.yaw), -Math.sin(j.yaw)];
    // do lado direito dela, fora do braço, um pouco acima da pedra (a estrela da cintilação vira para esse lado: ANC.giroDiam);
    // a mira fica entre o diamante e o rosto dele
    const a = ANC.giroDiam, r = 0.8 - 0.08 * suave(u), o = [c[0] + r * (-Math.cos(a) * f[0] + Math.sin(a) * dir[0]), c[1] + 0.1, c[2] + r * (-Math.cos(a) * f[1] + Math.sin(a) * dir[1])];
    const v1 = normaliza([c[0] - o[0], c[1] - 0.08 - o[1], c[2] - o[2]]), v2 = normaliza([h[0] - o[0], h[1] - o[1], h[2] - o[2]]), m = normaliza([1.25 * v1[0] + v2[0], 1.25 * v1[1] + v2[1], 1.25 * v1[2] + v2[2]]);
    CAM = { olho: o, alvo: [o[0] + m[0], o[1] + m[1], o[2] + m[2]], fov: 36, rolo: 0, perto: 0.02, longe: 6000 }; }, fora);
  // começa quase de frente para ela, um pouco abaixo dos olhos e ao lado do braço dele, para o sorriso dela aparecer
  // inteiro (a três quartos, o nariz cobria a boca); quando ela ergue o joelho, a câmera recua pelo vão da cerca até o
  // fundo da baia vazia e abre, mostrando os dois de corpo inteiro, a palha e o ancinho: o pisão, o cabo subindo entre as
  // pernas dele, o tiro no teto e a queda. (Do lado da porta, o corredor é estreito: o xerife, de costas e perto da lente,
  // cobria tudo; e do fundo da baia ela fica de perfil.)
  add('P33a', 117.17, 119.35, 'o ancinho', (ta, u, t) => { const j = poseJackNoVagao(ta), k = suave(fase0(ta, 117.58, 118.02));
    const rosto = [j.x - xLoco(ta), cabecaY(G.jackFL, j) - Y_TRILHO, j.z];
    camT(ta, mao(lerp3([CX_S + 1.0, 2.72, -0.2], [CX_S + 1.0, 2.5, 1.34], k), t, ta > 118.4 ? 0.035 : 0.006, 5), lerp3(rosto, [CX_S + 0.86, 2.2, -0.57], k), lerp1(24, 60, k));
    if (ta > 118.4 && ta < 118.47) AMB.flash = 0.12; }, fora);
  // do fundo do vagão, do lado da porta: o xerife de joelhos lá na frente, com o chapéu e o ancinho no chão; ela volta guardando
  // o diamante, o cavalo sai da baia, ela monta e o vira para a porta, que se abre (a câmera sobe com ela)
  add('P33b', 119.35, 121.35, 'a porta se abre', (ta, u) => { const k = suave(fase0(ta, 119.8, 120.55)); camT(ta, [CX_S - 3.1, 2.6, -0.95], lerp3([CX_S - 0.4, 2.15, -0.1], [CX_S - 0.25, 2.78, -0.5], k), 52); }, fora);
  add('P34', 121.35, 127.13, 'o salto contra a lua', (ta, u) => {
    const x0 = portaMundo(SALTO.sai)[0], c = [x0 + 8, alturaTerreno(x0 + 8, -26) + 0.2, -26]; // rente ao chão, sem afundar nele
    const e = estadoCavaloJack(ta).e, ea = estadoCavaloJack((SALTO.sai + SALTO.cai) / 2).e, apice = [ea.x, ea.y + 1.55, ea.z];
    camW(c, [lerp1(apice[0], e.x, 0.6), lerp1(apice[1], e.y + 1.4, 0.5), lerp1(apice[2], e.z, 0.5)], 30);
    AMB.luaDir = normaliza([apice[0] - c[0], apice[1] - c[1], apice[2] - c[2]]); AMB.luaTam = 0.0062; AMB.estrelas = 0.6;
  }, fora);

  // ---------------- ATO 3 — O CÂNION
  // do pouso à beira da garganta, quase em linha reta: ela freia até o passo e logo abre o diamante; a bomba, a
  // preocupação, o mostrador e o meio sorriso; segue para o cânion; o grupo do xerife sai do trem e vem atrás dela; a bala
  // atravessa o chapéu; pelo furo, os três em V; ela se abaixa e acelera até a beira
  const jE = ta => estadoCavaloJack(ta).e, jP = ta => poseJackMontada(ta), hT = (x, z) => alturaTerreno(x, z);
  add('P35', 127.13, 129.45, 'ela freia', (ta, u) => { const j = jE(ta), c = olhoP35(ta); // à frente e à esquerda dela, recuando: ela faz a curva e freia até o passo; atrás, o trem freando
    camW([c[0], hT(c[0], c[1]) + 1.0, c[1]], [j.x, j.y + 1.3, j.z], 33); }, canion);
  // a bomba (129,45 a 136,8), em quatro planos. De frente, ela tira o diamante da bolsa e desenrosca a coroa. Depois, um
  // só movimento: perto do diamante, pela frente e de cima (na direção do mostrador), a coroa tomba para trás e a mola
  // ergue a bomba, com o ponteiro andando; a câmera recua e sobe até o rosto dela, preocupado. (De frente e de cima do
  // rosto, a coroa tombada esconderia a bomba; e cortar da bomba para o rosto, com dois quadros parecidos, pularia.) O que
  // ela vê: o mostrador, de perto (ela traz o diamante para perto e o estuda). Por fim, o rosto de perto: a preocupação
  // passa, fica séria e firme, entende que é a hora do plano: meio sorriso, um aceno, e ergue os olhos, decidida.
  const luzBomba = (p, d, y) => AMB.luzes.push({ p: [p.x + d[0] * 0.9, y + 0.4, p.z + d[1] * 0.9], c: [0.6, 0.62, 0.85], r: 3.2 });
  const naMaoJack = (p) => { const P = G.jackFL, D = P.D, e = doTronco(P, p, maoFK(D, -1, p.ombroE, p.abracoE, p.cotoveloE, p.giroBE || 0)), dd = doTronco(P, p, maoFK(D, 1, p.ombroD, p.abracoD, p.cotoveloD, p.giroBD || 0));
    return [(e[0] + dd[0]) / 2, (e[1] + dd[1]) / 2 + 0.06, (e[2] + dd[2]) / 2]; }; // o diamante entre as mãos
  // direção que sai de um ponto dela para a frente, girada para o lado (lado) e erguida (el), em radianos
  const naFrente = (d, lado, el) => { const h = [d[0] * Math.cos(lado) + d[1] * Math.sin(lado), d[1] * Math.cos(lado) - d[0] * Math.sin(lado)]; return [h[0] * Math.cos(el), Math.sin(el), h[1] * Math.cos(el)]; };
  add('P37', 129.45, 130.5, 'ela abre o diamante', (ta, u) => { const e = jE(ta), d = frente(e.yaw), p = jP(ta), y = cabecaY(G.jackFL, p), k = lerp1(1.7, 1.4, suave(u));
    CAM = { olho: [p.x + d[0] * k + d[1] * 0.5, y - 0.1, p.z + d[1] * k - d[0] * 0.5], alvo: [p.x + d[0] * 0.3, y - 0.3, p.z + d[1] * 0.3], fov: 40, rolo: 0, perto: 0.03, longe: 6000 }; luzBomba(p, d, y); }, canion);
  add('P37a', 130.5, 132.6, 'a bomba e ela', (ta, u) => { const e = jE(ta), d = frente(e.yaw), p = jP(ta), P = G.jackFL, c = naMaoJack(p), h = doCabeca(P, p, [0, 0.1 * P.D.s, 0]), y = cabecaY(P, p);
    const s1 = suave(fase0(ta, 130.5, 131.5)), s2 = suave(fase0(ta, 131.5, 132.6)), w = suave(fase0(ta, 131.45, 132.05)); // perto da bomba; o rosto; a passagem
    const va = naFrente(d, 0.35, lerp1(0.27, 0.4, s1)), ka = lerp1(0.72, 0.52, s1), vb = naFrente(d, 0.3, -0.08), kb = lerp1(0.82, 0.66, s2);
    const A = [c[0] + va[0] * ka, c[1] + va[1] * ka, c[2] + va[2] * ka], B = [h[0] + vb[0] * kb, h[1] - 0.1 + vb[1] * kb, h[2] + vb[2] * kb];
    const a = [c[0], c[1] - 0.005, c[2]], b = [h[0] + d[0] * 0.04, h[1] - 0.07, h[2] + d[1] * 0.04];
    CAM = { olho: [0, 1, 2].map(i => lerp1(A[i], B[i], w)), alvo: [0, 1, 2].map(i => lerp1(a[i], b[i], w)), fov: 30, rolo: 0, perto: 0.02, longe: 6000 }; luzBomba(p, d, y); }, canion);
  add('P37b', 132.6, 133.9, 'o que ela vê', (ta, u) => { const e = jE(ta), d = frente(e.yaw), p = jP(ta), c = naMaoJack(p), y = cabecaY(G.jackFL, p); // o mostrador, de perto, de cima e de frente (por cima da tampa, de frente o rosto dela fica atrás dela): o ponteiro anda; a câmera chega mais perto
    const v = naFrente(d, 0.15, 0.5), k = lerp1(0.42, 0.33, suave(u)), a = [c[0] + d[0] * 0.035, c[1] + 0.035, c[2] + d[1] * 0.035];
    CAM = { olho: [a[0] + v[0] * k, a[1] + v[1] * k, a[2] + v[2] * k], alvo: a, fov: 30, rolo: 0, perto: 0.02, longe: 6000 }; luzBomba(p, d, y); }, canion);
  add('P37c', 133.9, 136.8, 'o meio sorriso', (ta, u) => { const e = jE(ta), d = frente(e.yaw), p = jP(ta), P = G.jackFL, h = doCabeca(P, p, [0, 0.1 * P.D.s, 0]), y = cabecaY(P, p);
    // de perto, à frente e à esquerda, na altura dos olhos: ainda preocupada; uma piscada e fica séria, firme; entende: meio
    // sorriso e o aceno; ergue os olhos, decidida
    const v = naFrente(d, -0.38, 0.03), k = lerp1(0.9, 0.7, suave(u));
    CAM = { olho: [h[0] + v[0] * k, h[1] - 0.08 + v[1] * k, h[2] + v[2] * k], alvo: [h[0] + d[0] * 0.04, h[1] - 0.06, h[2] + d[1] * 0.04], fov: 30, rolo: 0, perto: 0.02, longe: 6000 }; luzBomba(p, d, y); }, canion);
  add('P38', 136.8, 138.0, 'ela segue com a bomba', (ta, u) => { const m = jE(137.4), { d, r } = rumoJack(137.4, 0.45), j = jE(ta); // fixa, à frente e à direita dela: segue a passo com o diamante aberto; atrás, o trem parado
    const c = [m.x + r[0] * 3.6 + d[0] * 6.2, 0, m.z + r[1] * 3.6 + d[1] * 6.2]; camW([c[0], hT(c[0], c[2]) + 1.4, c[2]], [lerp1(m.x, j.x, 0.6), j.y + 1.55, lerp1(m.z, j.z, 0.6)], 30);
    AMB.luzes.push({ p: [j.x + r[0] * 1.5 + d[0] * 1.6, j.y + 2.4, j.z + r[1] * 1.5 + d[1] * 1.6], c: [0.55, 0.6, 0.85], r: 4 }); }, canion); // um pouco de luar nela e no diamante
  add('P39', 138.0, 139.72, 'o grupo do xerife sai', (ta, u) => { const x = xLoco(ta) + CX_S; camW([x + 8, hT(x + 8, -12) + 0.8, -12], [x - 2 - 2.5 * u, 2.0, -3.5], 42); }, canion);
  add('P40', 139.72, 140.85, 'ela ainda olha a bomba', (ta, u) => { // à frente dela, na linha do grupo, em teleobjetiva: ela a passo, estudando a bomba; lá atrás, o grupo vem a galope
    const j = jE(ta), c = olhoP40(ta), v = normaliza([c[0] - j.x, 0, c[1] - j.z]), g = estadoCavaloGrupo(GRUPO[0], ta).e;
    const dj = normaliza([j.x - c[0], 0, j.z - c[1]]), dg = normaliza([g.x - c[0], 0, g.z - c[1]]), w = normaliza([lerp1(dj[0], dg[0], 0.45), 0, lerp1(dj[2], dg[2], 0.45)]); // olha entre ela e o grupo
    camW([c[0], hT(c[0], c[1]) + 1.9, c[1]], [c[0] + w[0] * 7, j.y + 1.5, c[1] + w[2] * 7], 27);
    AMB.luzes.push({ p: [j.x + v[0] * 1.2, j.y + 2.3, j.z + v[2] * 1.2], c: [0.55, 0.6, 0.85], r: 3.5 }); }, canion);
  add('P40b', 140.85, 142.33, 'o tique, de perto', (ta, u) => { const e = jE(ta), d = frente(e.yaw), r = [d[1], -d[0]], p = jP(ta), c = naMaoJack(p), y = cabecaY(G.jackFL, p), k = 1 - 0.1 * suave(u); // de cima, à frente e à direita, perto: o diamante aberto nas mãos dela, a bomba e o mostrador; o fundo é o chão. O grupo vem atrás, fora de quadro: depois do P40 ele só volta a aparecer pelo furo do chapéu (antes aqui se via o xerife a galope, mirando nela)
    CAM = { olho: [c[0] + (d[0] * 0.25 + r[0] * 0.36) * k, c[1] + 0.42 * k, c[2] + (d[1] * 0.25 + r[1] * 0.36) * k], alvo: [c[0], c[1] - 0.01, c[2]], fov: 34, rolo: 0, perto: 0.02, longe: 6000 }; luzBomba(p, d, y); }, canion);
  add('P41a', 142.33, 143.70, 'a bala', (ta, u) => { const P = G.jackFL, p = jP(ta), f = frente(p.yaw), sx = f[1], sz = -f[0], c = chapeuNoMundo(P, p, [0, 0.03, 0]); // de lado, pela direita dela: a bala vem de trás, da esquerda, e sai pela frente da copa, do lado da câmera
    camW([c[0] + sx * 1.45 + f[0] * 0.2, c[1] - 0.05, c[2] + sz * 1.45 + f[1] * 0.2], [c[0] + f[0] * 0.08, c[1] - 0.1, c[2] + f[1] * 0.08], 24);
    AMB.luzes.push({ p: [c[0] + sx * 0.9 + f[0] * 0.5, c[1] + 0.3, c[2] + sz * 0.9 + f[1] * 0.5], c: [0.55, 0.6, 0.85], r: 3.5 }); }, canion);
  add('P41b', 143.70, 147.55, 'pelo furo', (ta, u) => camFuroLongo(ta, u), canion); // do rosto ao furo; por ele, os três em V; até eles, e os ajudantes atiram
  add('P42a', 147.55, 148.4, 'ela se abaixa e acelera', (ta, u) => { const j = jE(ta), d = frente(rumo(t => curva(TRAJ_JACK, t), ta, 0.3).yaw), c = olhoP42a(ta); // de lado, pela direita e um pouco à frente, baixo: ela se abaixa no pescoço do cavalo e acelera; atrás dela, o cânion
    camW([c[0], hT(c[0], c[1]) + 0.9, c[1]], [j.x + d[0] * 0.3, j.y + 1.25, j.z + d[1] * 0.3], 38); }, canion);
  add('P42', 148.4, 149.86, 'a chegada à beira', (ta, u) => { const j = jE(ta); camW([1015, hT(1015, -128) + 8.5, -153], [lerp1(j.x, 1020, 0.3), j.y + 0.2, lerp1(j.z, -102, 0.3)], 34); }, canion); // pairando sobre a garganta: a borda embaixo, ela desce entre a torre e as pedras, o grupo atrás
  add('P43', 149.86, 153.0, 'a beira da garganta', (ta, u) => { const h = alturaTerreno(985, -105); camW([985, h + 9, -105], [1000, h + 1, -135], 46); }, canion);
  // o cerco, sem tiros: eles apeiam, sacam e avançam; ela recua de frente para eles até perto da beira. Depois, o diamante
  // (mostrado, jogado em câmera lenta, aberto: oco) e a reação do xerife; por fim, a bomba na mão e o lance por cima do ombro
  const J0 = DUELO.jack, hJ = alturaTerreno(J0[0], J0[1]);
  const dirXZ = (a, b) => { const d = normaliza([b[0] - a[0], 0, b[1] - a[1]]); return [d[0], d[2]]; };
  const luz = (p, c, r, pri) => AMB.luzes.push(pri ? { p, c, r, pri } : { p, c, r });
  const LUAR = [0.5, 0.55, 0.8];
  add('P44a', 153.0, 155.4, 'o cerco', (ta, u) => camW([1003.9, hJ + lerp1(5.2, 4.1, suave(u)), -138.6 + 0.9 * u], [1003.8, hJ + 0.35, -120.5], 46), canion); // do alto, por cima do vão, atrás dela: ela apeia; à frente, os três apeiam, sacam e avançam
  add('P44b', 155.4, 156.4, 'olhos dela', (ta, u) => { const p = poseDueloJack(ta), y = cabecaY(G.jackFL, p), f = frente(p.yaw); camW([p.x + f[0] * 0.55, y + 0.02, p.z + f[1] * 0.55], [p.x, y + 0.02, p.z], 13); }, canion);
  add('P44c', 156.4, 157.4, 'olhos dele', (ta, u) => { const p = poseDueloXerife(ta), y = cabecaY(G.xerife, p), f = frente(p.yaw); camW([p.x + f[0] * 0.6, y + 0.03, p.z + f[1] * 0.6], [p.x, y + 0.03, p.z], 13); }, canion);
  add('P44d', 157.4, 158.95, 'a mão estendida', (ta, u, t) => { const j = poseDueloJack(ta), s = poseDueloXerife(ta), f = frente(j.yaw), r = [f[1], -f[0]], d = dirXZ([s.x, s.z], [j.x, j.z]); // por cima do ombro direito dela: o xerife para, de arma apontada, e estende a mão
    camW(mao([j.x - f[0] * 1.7 + r[0] * 1.0, j.y + 1.6, j.z - f[1] * 1.7 + r[1] * 1.0], t, 0.012, 2), [s.x, s.y + 1.2, s.z], 17);
    luz([s.x + d[0] * 2.0, s.y + 2.2, s.z + d[1] * 2.0], LUAR, 4); }, canion);
  add('P45a', 158.95, 160.25, 'o diamante na mão', (ta, u, t) => { const j = poseDueloJack(ta), f = frente(j.yaw), r = [f[1], -f[0]], y = cabecaY(G.jackFL, j), m = maoMundo(G.jackFL, j, 1); // à frente dela, baixo: ela tira o diamante da bolsa e o mostra
    const al = [lerp1(j.x, m[0], 0.45), lerp1(y - 0.12, m[1], 0.45), lerp1(j.z, m[2], 0.45)];
    camW(mao([j.x + f[0] * (2.15 - 0.25 * u) + r[0] * 0.3, y - 0.3, j.z + f[1] * (2.15 - 0.25 * u) + r[1] * 0.3], t, 0.01, 2), al, 32);
    luz([j.x + f[0] * 1.3, y + 0.5, j.z + f[1] * 1.3], [0.55, 0.6, 0.85], 3.2); }, canion);
  add('P45b', 160.25, 162.6, 'ela joga o diamante', (ta, u, t) => { const j = poseDueloJack(ta), f = frente(j.yaw), r = [f[1], -f[0]], h = alturaTerreno(j.x, j.z), [cx, cz] = DEVOLVE.chao, hc = alturaTerreno(cx, cz); // por trás do ombro direito dela, no eixo do P44d, baixo: o diamante sobe da mão dela num arco e cai aos pés do xerife (câmera lenta)
    camW(mao([j.x - f[0] * 1.5 + r[0] * 0.9, h + 1.25, j.z - f[1] * 1.5 + r[1] * 0.9], t, 0.006, 2), [lerp1(cx, j.x, 0.12), hc + 1.15, lerp1(cz, j.z, 0.12)], 38);
    luz([lerp1(cx, j.x, 0.2), hc + 2.4, lerp1(cz, j.z, 0.2)], LUAR, 5); }, canion);
  add('P45c', 162.6, 164.4, 'o diamante se abre', (ta, u, t) => { const [cx, cz] = DEVOLVE.chao, h = alturaTerreno(cx, cz), d = dirXZ(DEVOLVE.chao, XERIFE_DEPOIS), r = [d[1], -d[0]], k = suave(u); // de cima e de lado, rente: o diamante parado, azul; a coroa se abre de estalo e o oco está vazio
    camW(mao([cx + d[0] * (0.34 - 0.04 * k) + r[0] * (0.78 - 0.1 * k), h + 0.74 - 0.08 * k, cz + d[1] * (0.34 - 0.04 * k) + r[1] * (0.78 - 0.1 * k)], t, 0.005, 2), [cx, h + 0.12, cz], 30);
    luz([cx + d[0] * 0.4 + r[0] * 0.5, h + 0.75, cz + d[1] * 0.4 + r[1] * 0.5], [0.75, 0.72, 0.8], 1.7, 1); }, canion); // luar de preenchimento: o forro de veludo do oco se lê
  add('P45d', 164.4, 165.74, 'o xerife percebe', (ta, u) => { const s = poseDueloXerife(ta), y = cabecaY(G.xerife, s), [cx, cz] = DEVOLVE.chao, h = alturaTerreno(cx, cz), d = dirXZ([s.x, s.z], COB), r = [d[1], -d[0]]; // baixo, ao lado do diamante vazio: ele olha para o diamante e depois ergue os olhos para ela
    camW([cx + d[0] * 0.2 + r[0] * 0.5, h + 0.95, cz + d[1] * 0.2 + r[1] * 0.5], [s.x, y - 0.04, s.z], 30);
    luz([cx + d[0] * 0.2, h + 0.9, cz + d[1] * 0.2], LUAR, 2.6, 1); luz([s.x + d[0] * 1.4, y + 0.25, s.z + d[1] * 1.4], LUAR, 3.2); }, canion); // de baixo e do lado dela: o rosto se lê ao erguer os olhos
  // o lance da bomba (165,74 a 170,84): poucos planos, centrados e sem pressa, para dar tempo de ler. De frente, ela mostra a
  // bomba e a joga para trás sem olhar; de lado e de longe, o duelo inteiro num quadro só, com a bomba passando a beira; o rosto
  // do xerife ("Eu", "Tive"); e a queda, vista de cima ("Que")
  add('P46a', 165.74, 167.75, 'sem olhar', (ta, u, t) => { const j = poseDueloJack(ta), f = frente(j.yaw), h = alturaTerreno(j.x, j.z), k = lerp1(3.1, 2.35, suave(u)); // de frente, ela no meio do quadro, e a câmera só chega um pouco mais perto: ela encara a lente e não olha para trás; a bomba sai pelo alto
    camW([j.x + f[0] * k, h + 1.2, j.z + f[1] * k], [j.x, h + 1.35, j.z], 30);
    CAM.bombaBrilho = 0.35; luz([j.x + f[0] * 1.6, h + 2.0, j.z + f[1] * 1.6], [0.72, 0.75, 0.98], 3.4); }, canion);
  add('P46b', 167.75, 169.2, 'o arco da bomba', (ta, u, t) => { const j = poseDueloJack(ta), h = alturaTerreno(j.x, j.z), rb = trajetoRelogio(ta), s = poseDueloXerife(ta), c = [j.x + 14.2, h + 2.2, j.z - 2.1]; // parada, de lado e de longe: o xerife à esquerda, ela no meio, a beira e a garganta à direita. A bomba atravessa o céu e cai pela beira
    camW(c, [j.x + 0.3, h + 1.5, j.z], 31);
    CAM.bombaBrilho = 0.6; luz([lerp1(rb[0], c[0], 0.35), rb[1] + 0.5, lerp1(rb[2], c[2], 0.35)], LUAR, 4, 1); luz([j.x + 2.2, h + 2.4, j.z - 0.3], [0.72, 0.75, 0.98], 4.5, 1); luz([s.x + 1.6, s.y + 2.6, s.z - 1.0], LUAR, 5); }, canion);
  add('P49', 169.2, 170.15, 'o xerife entende', (ta, u, t) => { const p = poseDueloXerife(ta), f = frente(p.yaw), h = alturaTerreno(p.x, p.z), k = lerp1(1.42, 1.22, suave(u)); // de frente, o rosto no meio do quadro, a câmera chegando devagar: ele baixa os olhos e entende
    camW([p.x + f[0] * k, h + 1.62, p.z + f[1] * k], [p.x, h + 1.66, p.z], 18);
    luz([p.x + f[0] * 1.4, h + 2.05, p.z + f[1] * 1.4], LUAR, 2.2); }, canion);
  add('P50', 170.15, 170.84, 'lá embaixo', (ta, u, t) => { const r0 = trajetoRelogio(170.15), rb = trajetoRelogio(ta), [, , , dx, dz] = _bombaMao, cs = Math.cos(0.66), sn = Math.sin(0.66), c = [rb[0], r0[1] + 0.85 - 0.65 * (r0[1] - rb[1]), rb[2]]; // a pique, logo acima dela e descendo mais devagar que ela: a bomba no centro do quadro, com o mostrador para cima, vai ficando menor; a faixa de pedra atravessa o quadro na horizontal
    camW(c, [c[0], c[1] - 10, c[2]], 52); CAM.cima = normaliza([-dx * cs - dz * sn, 0, dx * sn - dz * cs]); CAM.perto = 0.03; CAM.bombaNaLente = true; CAM.bombaBrilho = 0; AMB.expo = AMB.expo * 1.5; luz([c[0], c[1] - 3, c[2]], [0.8, 0.82, 0.95], 7, 1); luz([rb[0], rb[1] + 0.9, rb[2]], [0.75, 0.78, 0.95], 2.4, 1); }, canion);
  add('P51a', 170.84, 172.6, 'a explosão', (ta, u, t) => { const e = t - EXPL.t, amp = e < 0.48 ? 0.04 : 0.9 * Math.exp(-(e - 0.48) * 1.3);
    camW(mao([930, 3.2, -118], t, amp, 7), [1004, 22 + 30 * e, -164], 60); }, canion);
  add('P51b', 172.6, 176.0, 'o cogumelo', (ta, u, t) => { const e = t - EXPL.t, M2 = [(COB[0] + XERIFE_DEPOIS[0]) / 2, (COB[1] + XERIFE_DEPOIS[1]) / 2];
    const n = normaliza([M2[0] - EXPL.x, 0, M2[1] - EXPL.z]), d = lerp1(11, 19, suave(u)), h = alturaTerreno(M2[0] + n[0] * d, M2[1] + n[2] * d);
    camW(mao([M2[0] + n[0] * d, h + 1.0, M2[1] + n[2] * d], t, 0.1 * Math.exp(-e * 0.4), 3), [EXPL.x, lerp1(30, 40, suave(u)), EXPL.z], 66); }, canion);
  add('P52', 176.0, 180.0, 'o carimbo da mina do Barão', (ta, u) => { const [x, z] = XERIFE_DEPOIS, y = alturaTerreno(x, z); camW([x + 1.9, y + 0.75, z + 1.7], [x + 0.9, y + 0.05, z + 0.6], 25); }, canion);
  // o fim sob a lua: uma lua grande na direção em que ela vai embora, como a do salto (P34), e o céu cheio de estrelas
  const luaSaida = el => { const c = Math.cos(el); AMB.luaDir = [SAIDA.d[0] * c, Math.sin(el), SAIDA.d[1] * c]; AMB.luaTam = 0.005; AMB.luaBrilho = 0.8; AMB.lua = 1; AMB.estrelas = 1; AMB.ceuFim = 1; };
  add('P53a', 180.0, 181.8, 'ela vai embora', (ta, u) => { const [x, z] = pontoSaida(-6.5), h = alturaTerreno(x, z), d = SAIDA.d; // parada, atrás do xerife e na linha da saída dela: ela fica no meio do quadro, contra a lua, e só encolhe, com o xerife à direita
    camW([x, h + 1.0, z], [x + d[0] * 30, h + 3.7, z + d[1] * 30], 24); luaSaida(0.12);
    const [rx, rz] = trilhaH(CAV_SAIDA, ta); luz([rx - d[0] * 1.5 + d[1], alturaTerreno(rx, rz) + 2.5, rz - d[1] * 1.5 - d[0]], [0.85, 0.85, 1.0], 3.4, 1); }, canion); // uma luz nas costas dela, longe do xerife, para o casaco vermelho aparecer
  add('P53b', 181.8, 184.0, 'o chapéu', (ta, u) => { const [x, z] = XERIFE_DEPOIS, h = alturaTerreno(x, z), d = SAIDA.d, k = lerp1(3.5, 3.2, suave(u)); // de frente, centrado, chegando devagar: ele olha para onde ela foi
    camW([x + d[0] * k - d[1] * 0.5, h + 1.3, z + d[1] * k + d[0] * 0.5], [x, h + 1.36, z], 30);
    luz([x + d[0] * 1.6, h + 2.2, z + d[1] * 1.6], LUAR, 1.2, 1); AMB.ceuFim = 1; }, canion);
  add('P54', 184.0, 186.0, 'a lua e as estrelas', (ta, u) => { const [x, z] = pontoSaida(-lerp1(11, 13.5, u)), h = alturaTerreno(x, z), alt = lerp1(2.8, 4.6, suave(u)), d = SAIDA.d; // de trás dos três e um pouco acima, subindo devagar: a lua no alto e ela lá embaixo, na mesma vertical, um ponto na areia clara
    camW([x, h + alt, z], [x + d[0] * 30, h + alt - 0.3, z + d[1] * 30], 34); luaSaida(0.17); }, canion);
  P.sort((a, b) => a.a - b.a);
  return P;
}
window.__planos = () => PLANOS.map(p => ({ id: p.id, a: p.a, b: p.b, nome: p.nome }));


const OLHAR_XERIFE = 1, LADO_CLOSE = 0.55;
function xerW(ta) { const p = estadoXerife(ta).p; return { x: p.x + xLoco(ta), y: p.y + Y_TRILHO, z: p.z }; } // posição do xerife no mundo (no trem ela é local)
function distJV(u) { return 2.7 * suave(u); } // metros andados da porta até o cavalo
function poseJackNoVagao(ta) {
  const u = fase0(ta, 104.6, 106.2);
  const lx = lerp1(-83.4 - CX_S, -1.9, suave(u)), lz = lerp1(-1.0, -0.25, suave(u));
  const p = poseDe(G.jackFL, xLoco(ta) + CX_S + lx, Y_TRILHO + ALT.piso + PALHA_S, lz, u < 1 ? YAW_MENOSX : 0.4);
  if (u < 1) { andar(p, distJV(u) / 0.95, Math.min(1, Math.sin(u * Math.PI) * 1.6)); p.yaw = lerpAng(YAW_MENOSX, Math.atan2(-0.26, 0.075), suave(fase0(u, 0, 0.25))); if (u > 0.85) p.yaw = lerpAng(p.yaw, 0.4, suave(fase0(u, 0.85, 1))); } else { respira(p, ta, 1.5); const k = suave(fase0(ta, 106.2, 106.55)); p.ombroD = lerp1(p.ombroD, 1.3, k); p.cotoveloD = lerp1(p.cotoveloD, 0.6, k); p.cabYaw = lerp1(p.cabYaw || 0, 0.3, k); }
  // o clique das armas: primeiro os olhos, depois o rosto vira para o xerife
  const olha = rampa(ta, 107.0, 107.4, ANC.vira0, ANC.vira1);
  if (ta > 106.85 && ta < ANC.vira0 + 0.3) p.olhar = OLHAR_XERIFE;
  if (olha > 0) { p.cabYaw = lerp1(p.cabYaw, 0.85, olha); p.torce = (p.torce || 0) + 0.35 * olha; p.ombroD = lerp1(p.ombroD, 0.45, olha); }
  p.expr = u < 1 ? 'determinado' : ta < 106.75 ? 'aliviado' : ta < 107.6 ? 'surpresa' : 'determinado';
  if (ta > ANC.vira0) ancinhoJack(p, ta);
  return p;
}
// Jack depois do clique (ANC): vira de frente para o xerife, tira o diamante da bolsa e anda até ele com o diamante na
// palma, como quem o oferece, sem tirar os olhos dele; o sorriso se abre, ela ergue o joelho alto e pisa com vontade nos
// dentes, e segura o pé lá enquanto o cabo sobe; tira o pé e vê o xerife cair, com a mão na cintura; recolhe o diamante e
// volta até o cavalo com ginga, guardando-o na bolsa; ergue as mãos para a sela e o pé esquerdo para o estribo (o salto:
// desenhaJackMontada)
const J_S = [[ANC.anda0, -1.9, -0.25], [ANC.anda1, ANC.jack[0], ANC.jack[1]], [ANC.volta0, ANC.jack[0], ANC.jack[1]], [ANC.volta1, ANC.monta[0], ANC.monta[1]], [130, ANC.monta[0], ANC.monta[1]]];
let _palmaS = null;
// os ângulos do braço direito com a palma para cima: à frente, oferecendo, e perto da cintura (referencial do tronco)
function palmaS() {
  if (_palmaS) return _palmaS;
  const P = G.jackFL, D = P.D, sol = alvo => { let m = null;
    for (const gi of [-1.5, -0.8, 0, 0.8, 1.5]) { const q = poseBase(), e = maoPalma(P, q, 1, [alvo[0], D.quadril + alvo[1], alvo[2]], [0, 1, 0], [0.9, 0.1, 0.8, gi]);
      const n = palmaFK(1, q.ombroD, q.abracoD, q.cotoveloD, q.giroBD), c = e + 0.05 * (1 - n[1]); if (!m || c < m.c) m = { c, o: { ombroD: q.ombroD, abracoD: q.abracoD, cotoveloD: q.cotoveloD, giroBD: q.giroBD } }; }
    return m.o; };
  return (_palmaS = { oferece: sol([0.1, 0.2, 0.42]), recolhe: sol([0.12, 0.06, 0.27]) });
}
// leva a sola de um pé (peMundo) a um ponto do mundo, pela coxa e pelo joelho
function ikPe(P, p, s, alvo) {
  const K = s < 0 ? ['quadE', 'joelhoE'] : ['quadD', 'joelhoD'], lim = [[-0.6, 1.8], [0, 2.4]];
  const custo = () => { const w = peMundo(P, p, s); return (w[0] - alvo[0]) ** 2 + (w[1] - alvo[1]) ** 2 + (w[2] - alvo[2]) ** 2; };
  let c = custo();
  for (let passo = 0.3; passo > 0.002; passo *= 0.5) for (let volta = 0, melhorou = true; melhorou && volta < 30; volta++) { melhorou = false;
    for (let i = 0; i < 2; i++) for (const d of [passo, -passo]) { const v0 = p[K[i]]; p[K[i]] = Math.max(lim[i][0], Math.min(lim[i][1], v0 + d)); const cn = custo(); if (cn < c - 1e-12) { c = cn; melhorou = true; } else p[K[i]] = v0; } }
  return Math.sqrt(c);
}
function ancinhoJack(p, ta) {
  const P = G.jackFL, A = ANC, xl = xLoco(ta) + CX_S, mix = (k, o) => { if (k > 0) for (const c in o) p[c] = lerp1(p[c] || 0, o[c], k); };
  // do referencial do trem para o mundo
  const W = v => [v[0] + xLoco(ta), v[1] + Y_TRILHO, v[2]];
  const [lx, lz] = trilhaH(J_S, ta), [vx, vz] = velCaminho(J_S, ta), v = Math.hypot(vx, vz);
  p.x = xl + lx; p.z = lz; p.y = Y_TRILHO + ALT.piso + palhaS(lx);
  // o giro: para o xerife; no caminho de volta; e para a sela
  const [sx, sz] = trilhaH(X_S, ta), xer = [xl + sx, Y_TRILHO + ALT.piso + PALHA_S + 1.72, sz];
  const vira = suave(fase0(ta, A.vira0, A.vira1)), volta = suave(fase0(ta, A.volta0 - 0.05, A.volta0 + 0.4)), prepara = suave(fase0(ta, A.volta1 - 0.5, A.volta1 + 0.02));
  p.yaw = lerpAng(lerpAng(lerpAng(0.4, Math.atan2(xer[0] - p.x, xer[2] - p.z), vira), Math.atan2(A.monta[0] - A.jack[0], A.monta[1] - A.jack[1]), volta), 0.35, prepara);
  // os braços relaxados; as pernas: um passo curto na virada, os passos até ele e de volta (o braço esquerdo balança)
  mix(vira, { ombroD: 0.12, abracoD: 0.14, cotoveloD: 0.3, giroBD: 0, ombroE: 0.1, abracoE: 0.14, cotoveloE: 0.28 });
  const q = Object.assign({}, p), uv = fase0(ta, A.vira0, A.vira1);
  if (ta < A.anda0) andar(q, 0.5 * uv, 0.3 * Math.sin(Math.PI * uv)); else andar(q, faseCaminho(J_S, ta, 0.95), Math.min(1, v / 1.0) * 0.8);
  for (const c of ['quadE', 'quadD', 'joelhoE', 'joelhoD', 'saia']) p[c] = q[c];
  p.bob = q.bob; p.ombroE += q.ombroE * 0.8; respira(p, ta, 1);
  mix(1 - clamp01(v / 0.3), { abreE: 0.04, abreD: 0.04 });
  // o braço direito: a mão na bolsa; o diamante na palma, à frente; recolhido perto da cintura; de volta à bolsa
  const b = ikJack('bolsa', p, ikBolsa), S = palmaS(), naBolsa = { ombroD: b[0], abracoD: b[1], cotoveloD: b[2], giroBD: 0 };
  mix(rampa(ta, A.bolsa0, A.bolsa1, A.oferece1, A.oferece1 + 0.01), naBolsa);
  mix(rampa(ta, A.oferece0, A.oferece1, A.recolhe1, A.recolhe1 + 0.01), S.oferece);
  mix(rampa(ta, A.recolhe0, A.recolhe1, A.guarda0 + 0.25, A.guarda0 + 0.26), S.recolhe);
  mix(rampa(ta, A.guarda0, A.guarda0 + 0.25, A.guarda1 - 0.25, A.guarda1), naBolsa);
  p.fechaD = (ta > A.bolsa0 + 0.2 && ta < A.oferece0 + 0.2) || (ta > A.guarda0 + 0.15 && ta < A.guarda1 - 0.1);
  // o pisão, com vontade: o peso vai para trás, o joelho sobe alto e o braço esquerdo abre para equilibrar; o pé desce seco
  // nos dentes, o corpo vem junto para a frente, o braço acompanha e a perna de apoio dobra; o pé segue as pontas enquanto
  // o cabo sobe, e sai quando ele cai
  const ergue = rampa(ta, A.joelho0, A.joelho1, A.pisa0, A.pisa1), desce = rampa(ta, A.pisa0, A.pisa1, A.solta0, A.solta1);
  mix(rampa(ta, A.joelho0, A.joelho1, A.solta0, A.solta0 + 0.3), { quadE: 1.3, joelhoE: 1.65, abreE: 0.06 });
  p.inclina += 0.1 * desce - 0.12 * ergue;
  mix(ergue, { ombroE: -0.35, abracoE: 0.55, cotoveloE: 0.5 });
  mix(desce, { ombroE: 0.35, abracoE: 0.3, cotoveloE: 0.6, quadD: 0.32, joelhoD: 0.42 });
  if (desce > 0) p.y += (alturaQuadrilApoiado(P, p) - P.D.quadril - (p.bob || 0)) * Math.min(1, desce * 3);
  const pisa = rampa(ta, A.pisa0, A.pisa1, A.solta0, A.solta0 + 0.3);
  if (pisa > 0) { const r = Object.assign({}, p); ikPe(P, r, -1, W(pontoAncinho(ta, DENTES_PE))); mix(pisa, { quadE: r.quadE, joelhoE: r.joelhoE }); }
  // enquanto ele cai, a mão esquerda na cintura
  mix(rampa(ta, A.solta0, A.solta0 + 0.3, A.volta0 + 0.1, A.volta0 + 0.4), { ombroE: 0.25, abracoE: 0.75, cotoveloE: 1.95 });
  // pronta para saltar na sela: as mãos no alto, o pé esquerdo erguido para o estribo
  mix(prepara, { ombroD: 1.45, abracoD: 0.1, cotoveloD: 0.7, ombroE: 1.45, abracoE: 0.1, cotoveloE: 0.7, quadE: 0.8, joelhoE: 1.2 });
  // a volta até o cavalo, com ginga: o quadril balança, o tronco gira com o passo, o braço esquerdo balança mais
  const ginga = rampa(ta, A.volta0, A.volta0 + 0.3, A.volta1 - 0.35, A.volta1 - 0.05), fz = faseCaminho(J_S, ta, 0.95) * Math.PI * 2;
  p.rolo = (p.rolo || 0) + 0.04 * Math.sin(fz) * ginga; p.torce = (p.torce || 0) + 0.1 * Math.sin(fz) * ginga;
  p.ombroE -= 0.25 * Math.sin(fz) * ginga; p.bob += 0.012 * Math.abs(Math.cos(fz)) * ginga;
  // a cabeça: no xerife o tempo todo (ela sabe do ancinho, não precisa olhar); vê o xerife cair; depois, o cavalo
  virarCabecaPara(p, P, xer, rampa(ta, A.vira0, A.vira0 + 0.35, A.volta0, A.volta0 + 0.3));
  virarCabecaPara(p, P, [xl + A.xerife[0], Y_TRILHO + ALT.piso + 0.95, A.xerife[1]], rampa(ta, A.bate + 0.12, A.bate + 0.4, A.volta0, A.volta0 + 0.3));
  const cav = estadoCavaloJack(ta).e; virarCabecaPara(p, P, [cav.x, cav.y + 1.5, cav.z], rampa(ta, A.volta0 + 0.15, A.volta0 + 0.5, 125, 126));
  if (ta > A.vira0 + 0.3) p.olhar = 0;
  // de queixo erguido na volta
  p.cabPitch -= 0.08 * ginga;
  // o rosto: confiante ao oferecer; o sorriso se abre antes de pisar; maroto quando o cabo acerta; sorrindo na volta;
  // determinado ao montar (cada troca leva de 0,15 a 0,28 s)
  let ex = 'determinado';
  for (const [t0, e, d = 0.15] of [[A.oferece0, 'confiante'], [A.sorri0, 'sorriso', A.sorri1 - A.sorri0], [A.bate + 0.02, 'maroto'], [A.volta0 + 0.05, 'sorriso', 0.2], [A.volta1 - 0.45, 'determinado', 0.25]])
    if (ta >= t0) ex = ta < t0 + d ? exprMistura(ex, e, (ta - t0) / d) : e;
  p.expr = ex;
}
// o diamante na mão dela: sai da bolsa um pouco menor, cresce até o tamanho de sempre e fica deitado na palma aberta (a
// ponta do pavilhão na palma, a frente da pedra virada para ela); na volta, encolhe para dentro da bolsa. Devolve a posição (no mundo), a base (x, y, z do
// diamante) e a escala, ou null
function diamanteS(ta) {
  const A = ANC; if (ta < A.bolsa1 || ta > A.guarda1 - 0.22) return null;
  const P = G.jackFL, p = poseJackNoVagao(ta), m = maoMundo(P, p, 1), o = doTronco(P, p, [0, 0, 0]);
  const nT = palmaFK(1, p.ombroD, p.abracoD, p.cotoveloD, p.giroBD || 0), nw = doTronco(P, p, nT), n = normaliza([nw[0] - o[0], nw[1] - o[1], nw[2] - o[2]]);
  const fr = frente(p.yaw), g = ANC.giroDiam, f = [-Math.cos(g) * fr[0] + Math.sin(g) * Math.cos(p.yaw), -Math.cos(g) * fr[1] - Math.sin(g) * Math.sin(p.yaw)], fz = normaliza([f[0] - n[0] * (f[0] * n[0] + f[1] * n[2]), -n[1] * (f[0] * n[0] + f[1] * n[2]), f[1] - n[2] * (f[0] * n[0] + f[1] * n[2])]);
  const x = [n[1] * fz[2] - n[2] * fz[1], n[2] * fz[0] - n[0] * fz[2], n[0] * fz[1] - n[1] * fz[0]];
  const k = lerp1(0.72, 1, suave(fase0(ta, A.bolsa1, A.oferece0 + 0.35))) * lerp1(1, 0.72, suave(fase0(ta, A.guarda0 + 0.05, A.guarda1 - 0.3)));
  return { pos: [m[0] + n[0] * 0.012, m[1] + n[1] * 0.012, m[2] + n[2] * 0.012], base: [x, n, fz], k };
}
function desenhaDiamanteS(ta) {
  const d = diamanteS(ta); if (!d) return; const [x, y, z] = d.base;
  push(); translate(d.pos[0], d.pos[1], d.pos[2]); applyMatrix(x[0], x[1], x[2], 0, y[0], y[1], y[2], 0, z[0], z[1], z[2], 0, 0, 0, 0, 1); scale(d.k);
  desenhaRelogio({ seg: 3540 + (ta - 113) * 2, tique: 1 }); pop(); mat({});
}
