// Diamante Bruto — sketch.js
// Motor do filme: relógio sincronizado com a música, câmera, luz, céu,
// partículas, desenho de personagens e cavalos e pós-processamento.
// A história (planos e coreografia) fica em roteiro.js.

'use strict';

const PARAM = new URLSearchParams(location.search);
const G = {};          // geometrias
const TX = {};         // texturas
let SH = {};           // shaders
let cam, fb, larguraFilme, alturaFilme;
let pronto = false;
let T = 0;             // tempo da música, em segundos
let TA = 0;            // tempo da ação (igual a T, exceto em câmera lenta)
const DURACAO = 186;
// qualidade: densidade do quadro (2 = desenha em 2x e reduz, sem serrilhado nos rostos e nas linhas finas). Sem ?q no
// endereço, começa em 2 e baixa sozinha para 1,5 e 1 se o filme ficar lento (ajustaQualidade)
const QUALIDADE_AUTO = !PARAM.has('q');
let qualidade = QUALIDADE_AUTO ? 2 : parseFloat(PARAM.get('q'));
// filtro de película antiga (cor desbotada, grão, riscos, poeira, tremulação): desligado por padrão; tecla V ou ?filtro=velho
let FILTRO_VELHO = PARAM.get('filtro') === 'velho' || (PARAM.get('filtro') !== '0' && localStorageGet('db_filtro') === 'velho') ? 1 : 0; // guardado como as legendas
let mostrarHUD = PARAM.get('debug') === '1';

// ================================================================ SHADERS
const MAT_VS = `#version 300 es
precision highp float;
in vec3 aPosition; in vec4 aVertexColor; in vec2 aTexCoord;
uniform mat4 uModelViewMatrix; uniform mat4 uProjectionMatrix;
out vec4 vCor; out vec3 vPos; out vec2 vUV; out float vW;
void main(){ vec4 p = uModelViewMatrix*vec4(aPosition,1.0); vPos=p.xyz; vCor=aVertexColor; vUV=aTexCoord; gl_Position=uProjectionMatrix*p; vW = 1.0 + gl_Position.w; }`;

const MAT_FS = `#version 300 es
precision highp float;
in vec4 vCor; in vec3 vPos; in vec2 vUV; in float vW; out vec4 saida;
uniform float uLogF; // 1 / log2(1 + longe): profundidade logarítmica
uniform vec3 uSol; uniform vec3 uCorSol; uniform vec3 uCeu; uniform vec3 uChao; uniform vec3 uCima;
uniform vec3 uNevoa; uniform vec3 uNevoaP; // início, densidade, máximo
uniform vec3 uPL[4]; uniform vec3 uPLC[4]; uniform float uPLR[4];
uniform vec3 uBorda; uniform vec3 uTinta; uniform float uAlfa; uniform float uSolM; uniform float uAmbM;
uniform float uSemLuz; uniform float uUsaTex; uniform sampler2D uTex; uniform float uEmis; uniform float uBrilho; uniform float uBordaM; uniform float uAlfaCor;
uniform mat3 uMundoR; uniform vec3 uMundoT; uniform vec4 uTun[2]; // posição de mundo e caixas dos túneis (x0, x1, meia largura, teto)
float dentroTunel(vec3 w, vec4 b) {
  return smoothstep(b.x - 1.5, b.x + 7.0, w.x) * (1.0 - smoothstep(b.y - 7.0, b.y + 1.5, w.x)) * (1.0 - smoothstep(b.z - 0.2, b.z + 1.8, abs(w.z))) * (1.0 - smoothstep(b.w - 0.2, b.w + 1.6, w.y));
}
void main(){
  // profundidade logarítmica: a mesma precisão relativa a 1 m e a 1 km. Com o plano perto em 3 cm e o
  // buffer de 24 bits, a profundidade comum só separava faces a 2 cm umas das outras a 100 m, e os
  // frisos, molduras e chapas do trem cintilavam nos planos abertos
  gl_FragDepth = log2(vW) * uLogF;
  vec3 n = normalize(cross(dFdx(vPos), dFdy(vPos)));
  vec3 V = normalize(-vPos);
  if (dot(n, V) < 0.0) n = -n;
  vec3 base = vCor.rgb * uTinta;
  float e = 1.0 - vCor.a;
  float a = uAlfa;
  if (uUsaTex > 0.5) { vec4 t = texture(uTex, vUV); base *= t.rgb; a *= t.a; }
  float hemi = dot(n, uCima)*0.5 + 0.5;
  vec3 w = uMundoR * (vPos - uMundoT);
  float kt = max(dentroTunel(w, uTun[0]), dentroTunel(w, uTun[1]));
  float fora = 1.0 - 0.94 * kt; // dentro do túnel não chegam o luar nem o céu, só as luzes do próprio trem
  vec3 luz = mix(uChao, uCeu, hemi) * uAmbM * fora;
  float d = max(dot(n, uSol), 0.0);
  luz += uCorSol * d * uSolM * (1.0 - kt);
  for (int i = 0; i < 4; i++) {
    vec3 L = uPL[i] - vPos; float dist = length(L);
    float at = clamp(1.0 - dist / uPLR[i], 0.0, 1.0); at *= at;
    luz += uPLC[i] * at * (0.35 + 0.65*max(dot(n, L / max(dist, 1e-3)), 0.0));
  }
  float r = pow(1.0 - max(dot(n, V), 0.0), 3.0);
  luz += uBorda * r * uBordaM * fora;
  // brilho especular simples (metais e vidro)
  vec3 H = normalize(uSol + V);
  float spec = pow(max(dot(n, H), 0.0), 40.0) * uBrilho * uSolM;
  vec3 c = base * luz + uCorSol * spec;
  c = mix(c, base * uEmis, e);
  c = mix(c, base, uSemLuz);
  float dd = length(vPos);
  float f = (1.0 - exp(-max(dd - uNevoaP.x, 0.0) * uNevoaP.y)) * uNevoaP.z;
  c = mix(c, uNevoa, f);
  a *= mix(1.0, vCor.r, uAlfaCor);
  if (a < 0.01) discard;
  saida = vec4(c * a, a); // o p5 mistura com alfa pré-multiplicado
}`;

const CEU_VS = `#version 300 es
precision highp float;
in vec3 aPosition; uniform mat4 uModelViewMatrix; uniform mat4 uProjectionMatrix;
out vec3 vDir;
void main(){ vDir = aPosition; gl_Position = uProjectionMatrix*uModelViewMatrix*vec4(aPosition,1.0); }`;

const CEU_FS = `#version 300 es
precision highp float;
in vec3 vDir; out vec4 saida;
uniform vec3 uTopo; uniform vec3 uMeio; uniform vec3 uHoriz; uniform vec3 uBaixo;
uniform vec3 uSolW; uniform vec3 uCorSolC; uniform float uSolTam;
uniform vec3 uLuaW; uniform float uLua; uniform float uLuaTam; uniform float uLuaB; uniform float uCeuFim; uniform float uEstrelas; uniform float uTempo;
float hash(vec3 p){ p = fract(p*0.3183099 + 0.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float ruido(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  float a=fract(sin(dot(i,vec2(127.1,311.7)))*43758.5), b=fract(sin(dot(i+vec2(1,0),vec2(127.1,311.7)))*43758.5),
        c=fract(sin(dot(i+vec2(0,1),vec2(127.1,311.7)))*43758.5), d=fract(sin(dot(i+vec2(1,1),vec2(127.1,311.7)))*43758.5);
  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y); }
void main(){
  vec3 d = normalize(vDir);
  float e = d.y;
  vec3 c = mix(uHoriz, uMeio, smoothstep(0.0, 0.18, e));
  c = mix(c, uTopo, smoothstep(0.15, 0.75, e));
  c = mix(c, uBaixo, smoothstep(0.0, -0.2, e));
  // nuvens finas em faixas
  vec2 q = d.xz / max(e + 0.25, 0.08);
  float nv = ruido(q*1.7 + vec2(uTempo*0.004, 0.0))*0.6 + ruido(q*4.1)*0.4;
  float faixa = smoothstep(0.55, 0.85, nv) * smoothstep(0.02, 0.12, e) * smoothstep(0.6, 0.25, e);
  float s = max(dot(d, uSolW), 0.0);
  vec3 corNuvem = mix(uMeio*1.15, uCorSolC*0.9 + uHoriz*0.4, pow(s, 3.0));
  c = mix(c, corNuvem, faixa*0.55);
  // sol: brilho largo e disco
  c += uCorSolC * (pow(s, 6.0)*0.35 + pow(s, 60.0)*0.6);
  c += uCorSolC * smoothstep(1.0 - uSolTam, 1.0 - uSolTam*0.6, s) * 3.0;
  // lua com mares
  float m = dot(d, uLuaW);
  float disco = smoothstep(1.0 - uLuaTam, 1.0 - uLuaTam*0.85, m);
  vec3 t1 = normalize(cross(uLuaW, vec3(0.0,1.0,0.0))), t2 = cross(t1, uLuaW);
  vec2 lp = vec2(dot(d, t1), dot(d, t2)) / sqrt(uLuaTam);
  float mar = ruido(lp*9.0 + 3.0)*0.6 + ruido(lp*23.0)*0.4;
  vec3 corLua = mix(vec3(0.92,0.94,1.0), vec3(0.62,0.66,0.74), smoothstep(0.45, 0.75, mar));
  c = mix(c, corLua*uLuaB, disco*uLua);
  c += vec3(0.55,0.65,0.85) * pow(max(m,0.0), 120.0) * 0.5 * uLua;
  c += vec3(0.35,0.45,0.7) * pow(max(m,0.0), 12.0) * 0.12 * uLua;
  // estrelas
  vec3 g = floor(d*260.0);
  float h = hash(g);
  float est = step(0.9975, h) * smoothstep(0.02, 0.3, e) * (0.6 + 0.4*sin(uTempo*2.0 + h*80.0));
  if (uCeuFim > 0.5) { // o céu do fim: estrelas redondas e uma segunda camada, mais miúda
    est *= 1.6 * smoothstep(0.6, 0.25, length(fract(d*260.0) - 0.5));
    float h2 = hash(floor(d*640.0));
    est += step(0.996, h2) * smoothstep(0.6, 0.25, length(fract(d*640.0) - 0.5)) * smoothstep(0.02, 0.3, e) * (0.55 + 0.25*sin(uTempo*1.6 + h2*60.0));
  }
  c += vec3(est) * uEstrelas * (1.0 - disco);
  saida = vec4(c, 1.0);
}`;

const POS_FS = `#version 300 es
precision highp float;
in vec2 vTexCoord; out vec4 saida;
uniform sampler2D tex0;
uniform vec2 uRes; uniform vec4 uFaixa; // x0,y0,x1,y1 em uv do filme
uniform float uTempo, uExpo, uContraste, uSat, uVinheta, uGrao, uFade, uBloom, uFlash, uAberr, uLuneta, uVelho;
uniform vec3 uLift, uGanho, uCorFlash;
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
void main(){
  vec2 uv = vTexCoord;
  if (uv.x < uFaixa.x || uv.x > uFaixa.z || uv.y < uFaixa.y || uv.y > uFaixa.w) { saida = vec4(0,0,0,1); return; }
  vec2 fu = (uv - uFaixa.xy) / (uFaixa.zw - uFaixa.xy);
  float quadro = floor(uTempo * 24.0); // a película anda a 24 quadros por segundo
  if (uVelho > 0.0) { // o quadro balança de leve no projetor
    uv += vec2(sin(uTempo * 1.7) + 0.5 * sin(uTempo * 4.3) + (hash(vec2(quadro, 1.3)) - 0.5) * 0.6,
               sin(uTempo * 2.3 + 1.0) + 0.4 * sin(uTempo * 6.1) + (hash(vec2(quadro, 7.1)) - 0.5) * 0.8) * vec2(0.0005, 0.0008) * uVelho;
  }
  vec2 dc = fu - 0.5;
  vec3 c;
  c.r = texture(tex0, uv + dc*uAberr*0.004).r;
  c.g = texture(tex0, uv).g;
  c.b = texture(tex0, uv - dc*uAberr*0.004).b;
  if (uVelho > 0.0) { // lente antiga: um pouco mais macia
    vec2 px = 1.0 / uRes;
    vec3 m4 = (texture(tex0, uv + vec2(px.x, 0.0)).rgb + texture(tex0, uv - vec2(px.x, 0.0)).rgb + texture(tex0, uv + vec2(0.0, px.y)).rgb + texture(tex0, uv - vec2(0.0, px.y)).rgb) * 0.25;
    c = mix(c, m4, 0.45 * uVelho);
  }
  // brilho difuso: amostras em anel das partes claras
  vec3 b = vec3(0.0);
  float asp = uRes.y / uRes.x;
  for (int i = 0; i < 10; i++) {
    float a = float(i) * 0.6283;
    for (int k = 1; k <= 3; k++) {
      vec2 o = vec2(cos(a)*asp, sin(a)) * float(k) * 0.0085;
      vec3 s = texture(tex0, uv + o).rgb;
      b += max(s - 0.72, 0.0) / float(k);
    }
  }
  c += b * uBloom * 0.22;
  c *= uExpo;
  c = c * uGanho + uLift * (1.0 - c);
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(vec3(l), c, uSat);
  c = (c - 0.5) * uContraste + 0.5;
  c = mix(c, uCorFlash, uFlash);
  if (uVelho > 0.0) { // película de faroeste antigo: sépia com um resto de cor, halo quente nas luzes, pretos lavados, tremulação
    float lv = dot(c, vec3(0.299, 0.587, 0.114));
    vec3 sep = clamp(vec3(lv) * vec3(1.1, 0.93, 0.7) + vec3(0.03, 0.015, 0.0), 0.0, 1.0);
    sep = mix(sep, sep * sep * (3.0 - 2.0 * sep), 0.3);
    c = mix(c, sep, 0.38 * uVelho);
    c += b * vec3(0.9, 0.42, 0.18) * 0.12 * uVelho;
    c = mix(c, c * 0.88 + 0.06, 0.6 * uVelho);
    c *= 1.0 + (hash(vec2(quadro, 3.7)) - 0.5) * 0.07 * uVelho;
  }
  float v = smoothstep(0.95, 0.25, length(dc * vec2(1.0, 0.8)));
  c *= mix(1.0, v, min(1.0, uVinheta + 0.3 * uVelho));
  if (uLuneta > 0.0) { float rl = length(dc * vec2(uRes.x / uRes.y, 1.0)); c *= mix(1.0, smoothstep(0.43, 0.39, rl), uLuneta); c *= mix(1.0, 1.0 - 0.35*smoothstep(0.2, 0.42, rl), uLuneta); }
  if (uVelho > 0.0) {
    // riscos verticais claros (cada um dura uns 6 quadros e treme um pouco) e grãos de poeira escuros (um quadro só)
    float seg = floor(uTempo * 4.0);
    for (int i = 0; i < 2; i++) {
      float fi = float(i);
      if (hash(vec2(seg, fi * 3.1 + 1.0)) < 0.6) {
        float x = hash(vec2(seg, fi * 7.3)) + (hash(vec2(quadro, fi)) - 0.5) * 0.003;
        float d = abs(fu.x - x) * uRes.x;
        c += smoothstep(1.3, 0.0, d) * (0.4 + 0.6 * hash(vec2(floor(fu.y * uRes.y / 9.0), seg + fi))) * 0.13 * uVelho;
      }
    }
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      if (hash(vec2(quadro, fi + 5.0)) < 0.3) {
        vec2 pp = vec2(hash(vec2(quadro, fi + 11.0)), hash(vec2(quadro, fi + 23.0)));
        float r = 1.2 + 2.8 * hash(vec2(quadro, fi + 31.0)), dd = length((fu - pp) * uRes) / r;
        c = mix(c, vec3(0.06, 0.05, 0.04), smoothstep(1.0, 0.55, dd) * 0.65 * uVelho);
      }
    }
    // grão grosso, mais forte nos meios-tons
    float g = hash(floor(fu * uRes / 1.6) + quadro * 17.0) - 0.5, lg = dot(c, vec3(0.333));
    c += g * 0.09 * (0.5 + lg * (1.0 - lg) * 2.0) * uVelho;
  }
  c += (hash(fu * uRes + fract(uTempo*13.7)*91.0) - 0.5) * uGrao;
  c *= 1.0 - uFade;
  saida = vec4(clamp(c, 0.0, 1.0), 1.0);
}`;

// ================================================================ MATERIAL
// Mantém o estado dos uniformes para só mudar o que precisa.
const MAT = { atual: {} };
function mat(o = {}) {
  if (!o.__temp) MAT.ultimo = o;
  const s = SH.mat, a = MAT.atual;
  const v = {
    uTinta: o.tinta || [1, 1, 1], uAlfa: o.alfa ?? 1, uSemLuz: o.semLuz ?? 0, uUsaTex: o.tex ? 1 : 0,
    uEmis: o.emis ?? AMB.emis, uSolM: o.sol ?? AMB.solM, uAmbM: o.amb ?? 1, uBrilho: o.brilho ?? 0, uBordaM: o.borda ?? 1, uAlfaCor: o.alfaCor ?? 0,
  };
  for (const k in v) {
    const val = v[k], ant = a[k];
    if (Array.isArray(val) ? !(ant && ant[0] === val[0] && ant[1] === val[1] && ant[2] === val[2]) : ant !== val) { s.setUniform(k, val); a[k] = Array.isArray(val) ? val.slice() : val; }
  }
  if (o.tex && a.texRef !== o.tex) { s.setUniform('uTex', o.tex); a.texRef = o.tex; }
}
function md(geo, o) { mat(o); model(geo); }

// ================================================================ AMBIENTE
// Luz, céu, névoa e tratamento de cor. roteiro.js preenche AMB a cada quadro.
const AMB = {
  sol: [0.5, 0.3, -0.8], corSol: [1.4, 0.8, 0.45], ceu: [0.5, 0.45, 0.6], chao: [0.35, 0.22, 0.18],
  nevoa: [0.95, 0.6, 0.4], nevoaP: [60, 0.0012, 0.85], borda: [0.15, 0.1, 0.08], solM: 1, emis: 1.25,
  ceuTopo: [0.17, 0.11, 0.24], ceuMeio: [0.55, 0.3, 0.35], ceuHoriz: [0.98, 0.62, 0.32], ceuBaixo: [0.5, 0.3, 0.25],
  corSolCeu: [1.0, 0.65, 0.3], solTam: 0.0009, lua: 0, luaDir: [0.3, 0.5, -0.8], luaTam: 0.0006, estrelas: 0,
  luzes: [], // {p:[x,y,z], c:[r,g,b], r}
  expo: 1, contraste: 1.05, sat: 1.05, vinheta: 0.6, grao: 0.035, fade: 0, bloom: 1, flash: 0, corFlash: [1, 0.8, 0.5],
  lift: [0.02, 0.01, 0.03], ganho: [1, 1, 1], aberr: 0.4,
};

// ================================================================ CÂMERA
let CAM = { olho: [0, 2, 10], alvo: [0, 1, 0], fov: 45, rolo: 0, perto: 0.05, longe: 6000 };
let viewM = null;
function aplicaCamera() {
  const [ex, ey, ez] = CAM.olho, [tx, ty, tz] = CAM.alvo;
  const up = [Math.sin(CAM.rolo), Math.cos(CAM.rolo), 0];
  // rolo em torno do eixo de visão
  const fx = tx - ex, fy = ty - ey, fz = tz - ez, fl = Math.hypot(fx, fy, fz) || 1;
  const f = [fx / fl, fy / fl, fz / fl];
  let r = [f[1] * 0 - f[2] * 1, f[2] * 0 - f[0] * 0, f[0] * 1 - f[1] * 0]; // f x (0,1,0)
  const rl = Math.hypot(r[0], r[1], r[2]) || 1; r = [r[0] / rl, r[1] / rl, r[2] / rl];
  const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  const cr = Math.cos(CAM.rolo), sr = Math.sin(CAM.rolo);
  const upv = CAM.cima || [u[0] * cr + r[0] * sr, u[1] * cr + r[1] * sr, u[2] * cr + r[2] * sr]; // CAM.cima: o alto da câmera dado à mão, para as que olham a pique ou dão cambalhota
  cam.perspective(CAM.fov * Math.PI / 180, larguraFilme / alturaFilme, CAM.perto, CAM.longe);
  cam.camera(ex, -ey, ez, tx, -ty, tz, -upv[0], upv[1], -upv[2]);
  setCamera(cam);
  viewM = cam.cameraMatrix.mat4.slice ? cam.cameraMatrix.mat4.slice() : Array.from(cam.cameraMatrix.mat4);
}
// direção do mundo (y para cima) → espaço da câmera
function dirVista(d) { const m = viewM, x = d[0], y = -d[1], z = d[2]; const v = [m[0] * x + m[4] * y + m[8] * z, m[1] * x + m[5] * y + m[9] * z, m[2] * x + m[6] * y + m[10] * z]; const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
function ptoVista(p) { const m = viewM, x = p[0], y = -p[1], z = p[2]; return [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14]]; }
// o mesmo fator do shader, para a câmera e para as luzes
function fatorTunel(x, y, z) {
  const ss = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
  let k = 0; for (const T of [MUNDO.tunel1, MUNDO.tunel2]) k = Math.max(k, ss(T.x0 - 1.5, T.x0 + 7, x) * (1 - ss(T.x1 - 7, T.x1 + 1.5, x)) * (1 - ss(3.2, 5.2, Math.abs(z))) * (1 - ss(6.2, 8.0, y)));
  return k;
}
function normaliza(v) { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }

function uniformesLuz() {
  const s = SH.mat;
  s.setUniform('uLogF', 1 / Math.log2(1 + CAM.longe));
  s.setUniform('uSol', dirVista(AMB.sol)); s.setUniform('uCorSol', AMB.corSol);
  s.setUniform('uCeu', AMB.ceu); s.setUniform('uChao', AMB.chao); s.setUniform('uCima', dirVista([0, 1, 0]));
  s.setUniform('uNevoa', AMB.nevoa); s.setUniform('uNevoaP', AMB.nevoaP); s.setUniform('uBorda', AMB.borda);
  // até 4 luzes pontuais: as mais fortes perto da câmera
  const L = AMB.luzes.map(l => ({ l, d: Math.hypot(l.p[0] - CAM.olho[0], l.p[1] - CAM.olho[1], l.p[2] - CAM.olho[2]) - l.r }))
    .filter(o => o.d < 60).sort((a, b) => (b.l.pri || 0) - (a.l.pri || 0) || a.d - b.d).slice(0, 4).map(o => o.l); // pri: entra primeiro
  const P = [], C = [], R = [];
  for (let i = 0; i < 4; i++) { const l = L[i]; if (l) { P.push(...ptoVista(l.p)); C.push(...l.c); R.push(l.r); } else { P.push(0, 0, 0); C.push(0, 0, 0); R.push(1); } }
  s.setUniform('uPL', P); s.setUniform('uPLC', C); s.setUniform('uPLR', R);
  // inversa da câmera (vista → mundo, com o y invertido do p5) e caixas dos túneis
  const m = viewM; s.setUniform('uMundoR', [m[0], -m[4], m[8], m[1], -m[5], m[9], m[2], -m[6], m[10]]); s.setUniform('uMundoT', [m[12], m[13], m[14]]);
  s.setUniform('uTun', [MUNDO.tunel1.x0, MUNDO.tunel1.x1, 3.4, 6.4, MUNDO.tunel2.x0, MUNDO.tunel2.x1, 3.4, 6.4]);
  MAT.atual = {};
}

// ================================================================ UTILIDADES
const lerp1 = (a, b, t) => a + (b - a) * t;
const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const clamp01 = x => Math.max(0, Math.min(1, x));
const fase0g = (t, a, b) => clamp01((t - a) / (b - a));
const suave = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
const suave2 = x => { x = clamp01(x); return x * x * x * (x * (x * 6 - 15) + 10); };
const entra = x => { x = clamp01(x); return x * x * x; };
const sai = x => { x = clamp01(x); return 1 - Math.pow(1 - x, 3); };
const fase = (t, a, b) => clamp01((t - a) / (b - a));
function noise1(x) { return ruido(x, 0.37) * 2 - 1; }
function tremor(t, amp, freq = 1.3) { return [noise1(t * freq) * amp, noise1(t * freq + 40) * amp, noise1(t * freq + 80) * amp * 0.5]; }
function rgb(h, k = 1) { return corHex(h).map(v => v / 255 * k); }

// ================================================================ SETUP
async function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight, WEBGL);
  setAttributes && setAttributes('antialias', true);
  textureMode(NORMAL);
  noStroke();
  SH.mat = createShader(MAT_VS, MAT_FS);
  SH.ceu = createShader(CEU_VS, CEU_FS);
  SH.pos = createFilterShader(POS_FS);
  dimensionaFilme();
  avisoCarregando('preparando o deserto…');
  await esperaQuadro();
  try { await document.fonts.load('64px Rye'); await document.fonts.load('40px "Cormorant Garamond"'); } catch (e) {}
  construirModelos();
  avisoCarregando('montando o expresso…');
  await esperaQuadro();
  construirTexturas();
  if (typeof prepararRoteiro === 'function') prepararRoteiro();
  pronto = true;
  iniciarInterface();
  if (PARAM.get('still') === '1') noLoop();
  window.__pronto = true;
}
function esperaQuadro() { return new Promise(r => setTimeout(r, 0)); }
function dimensionaFilme() {
  const asp = 2.39;
  larguraFilme = width; alturaFilme = Math.round(width / asp);
  if (alturaFilme > height) { alturaFilme = height; larguraFilme = Math.round(height * asp); }
  if (fb) fb.remove();
  // MSAA com 4 amostras por pixel (o padrão do p5 é 2; o WebGL2 garante pelo menos 4); em 2x, 2 bastam (cada pixel já junta 4)
  fb = createFramebuffer({ width: larguraFilme, height: alturaFilme, density: qualidade, antialias: qualidade >= 2 ? 2 : 4, depthFormat: UNSIGNED_INT });
  fb.begin(); cam = fb.createCamera(); fb.end();
}
function windowResized() { resizeCanvas(windowWidth, windowHeight); dimensionaFilme(); }

// ================================================================ MODELOS
// tira da malha os trechos [início, fim) de vértices marcados, sem mudar o resto
function semItens(m, cortes) {
  if (!cortes.length) return m;
  const P = [], C = [], U = []; let k = 0;
  for (let i = 0; i < m.c.length; i++) {
    while (k < cortes.length && i >= cortes[k][1]) k++;
    if (k < cortes.length && i >= cortes[k][0]) continue;
    P.push(m.p[3 * i], m.p[3 * i + 1], m.p[3 * i + 2]); C.push(m.c[i]); U.push(m.uv[2 * i], m.uv[2 * i + 1]);
  }
  m.p = P; m.c = C; m.uv = U; return m;
}
function construirModelos() {
  const t0 = performance.now();
  // terreno em blocos com recorte por distância. O oeste vai até -2720 para a ferrovia do plano de
  // abertura seguir até a névoa; esses blocos são simples e entram mesmo de longe (senão abririam um
  // buraco no chão distante, que começa onde o terreno acaba).
  G.blocos = [];
  const tam = 160;
  for (let x = -2720; x < 1920; x += tam) for (let z = -1120; z < 640; z += tam) {
    const longe = Math.abs(z + tam / 2) > 500 || x < -800;
    const canion = x + tam > 860 && x < 1380 && z + tam > -300 && z < -10;
    const passo = canion ? 4 : (longe ? 20 : 8);
    G.blocos.push({ geo: blocoTerreno(x, z, tam, passo).geo(), cx: x + tam / 2, cz: z + tam / 2, r: tam * 0.75, maxD: x < -1120 ? 6000 : 0 });
  }
  for (const p of paredesCanion()) G.blocos.push(p); // paredes do cânion em fiadas (sem os "dentes" da grade)
  // chão distante
  const chao = new Malha(1); chao.jit = 0;
  // anel em volta da área do terreno (o miolo fica aberto para não tampar o cânion)
  const cc = mixc(PAL.areia2, PAL.rocha4, 0.3), X0 = -2720, X1 = 1920, Z0 = -1120, Z1 = 640, L = 7000, Y = -6;
  chao.f([[-L, Y, -L], [L, Y, -L], [L, Y, Z0], [-L, Y, Z0]], cc);
  chao.f([[-L, Y, Z1], [L, Y, Z1], [L, Y, L], [-L, Y, L]], cc);
  chao.f([[-L, Y, Z0], [X0, Y, Z0], [X0, Y, Z1], [-L, Y, Z1]], cc);
  chao.f([[X1, Y, Z0], [L, Y, Z0], [L, Y, Z1], [X1, Y, Z1]], cc);
  G.chaoLonge = chao.geo();
  // mesetas ao longe
  const ms = new Malha(42); ms.jit = 0.05;
  const posMesetas = [[-300, 520, 160, 70], [200, 760, 220, 95], [700, 600, 140, 60], [1100, 900, 260, 110], [1600, 640, 180, 80],
    [-700, -420, 200, 85], [-200, -700, 260, 120], [300, -560, 150, 65], [1500, -500, 200, 90], [2000, -900, 300, 130],
    [-900, 300, 180, 75], [2200, 300, 240, 100], [400, 1300, 400, 160], [1200, -1400, 380, 150]];
  posMesetas.forEach(([x, z, r, h], i) => meseta(ms, x, z, r, h, i * 7 + 3));
  G.mesetas = ms.geo();
  // ferrovia em trechos de 100 m: a versão detalhada perto da câmera e a leve no resto. A oeste de
  // -1100 nenhuma câmera chega perto, então só existe a leve.
  G.trilhos = [];
  for (let x = -2700; x < 1900; x += 100) G.trilhos.push({ geo: x >= -1100 ? trechoFerrovia(x, x + 100).geo() : null, longe: trechoFerroviaLonge(x, x + 100).geo(), cx: x + 50, cz: 0, r: 80 });
  // vegetação e pedras em blocos
  G.veg = [];
  for (let x = -700; x < 1900; x += 200) {
    const v = new Malha(x + 5000), cortes = []; v.jit = 0.07; // cortes: itens no caminho dos cavalos do Ato 3, tirados depois (a variação de cor dos outros não muda)
    for (let i = 0; i < 70; i++) {
      const px = x + hash2(x, i) * 200, pz = (hash2(i, x) - 0.5) * 520;
      if (Math.abs(pz) < 9) continue;
      const g = distGarganta(px, pz); if (g.d < g.hw * 1.3) continue;
      if (px > MUNDO.tunel1.x0 - 40 && px < MUNDO.tunel1.x1 + 40 && Math.abs(pz) < 120) continue;
      const k = hash2(i * 3, x), ini = v.c.length;
      if (k < 0.18) cacto(v, px, pz, 3 + hash2(i, 7) * 3.5, i);
      else if (k < 0.75) arbusto(v, px, pz, 0.4 + hash2(i, 8) * 0.6, i);
      else pedra(v, px, pz, 0.4 + hash2(i, 9) * 1.4, i);
      if (!livreDosCaminhos(px, pz, k < 0.18 ? 4.5 : 3)) cortes.push([ini, v.c.length]);
    }
    G.veg.push({ geo: semItens(v, cortes).geo(), cx: x + 100, cz: 0, r: 300 });
  }
  // platô do Ato 3: arbustos, pedras e cactos baixos, e pedregulhos marcando a borda do cânion
  {
    const v = new Malha(9191), cortes = []; v.jit = 0.07; let n = 0;
    for (let i = 0; i < 900 && n < 420; i++) {
      const px = 930 + hash2(i, 77) * 300, pz = -175 + hash2(77, i) * 172;
      if (Math.abs(pz) < 9) continue;
      const g = distGarganta(px, pz); if (g.d < g.hw * 1.04) continue;
      if (Math.hypot(px - DUELO.jack[0], pz - DUELO.jack[1]) < 5 || Math.hypot(px - DUELO.xerife[0], pz - DUELO.xerife[1]) < 5) continue;
      if (px > 994 && px < 1026 && pz > -136 && pz < -109) continue; // o cerco: o chão fica livre
      const k = hash2(i * 5, 13), borda = g.d < g.hw * 1.2, ini = v.c.length;
      if (borda && k < 0.55) pedra(v, px, pz, 0.6 + hash2(i, 4) * 1.8, i);
      else if (k < 0.08) cacto(v, px, pz, 2.2 + hash2(i, 6) * 2.4, i);
      else if (k < 0.7) arbusto(v, px, pz, 0.3 + hash2(i, 8) * 0.5, i);
      else pedra(v, px, pz, 0.25 + hash2(i, 9) * 0.8, i);
      if (!livreDosCaminhos(px, pz, k < 0.08 && !borda ? 4.5 : 3)) cortes.push([ini, v.c.length]);
      n++;
    }
    G.veg.push({ geo: semItens(v, cortes).geo(), cx: 1080, cz: -90, r: 200 });
  }
  // o deserto ao norte dos trilhos, por onde ela passa no Ato 3 (longe do cânion): saguaros, pedras e arbustos,
  // fora do caminho dos cavalos
  {
    const v = new Malha(7171), cortes = []; v.jit = 0.07;
    for (let i = 0; i < 170; i++) {
      const px = 1020 + hash2(i, 71) * 140, pz = 9 + hash2(71, i) * 70, k = hash2(i * 7, 17), ini = v.c.length;
      if (k < 0.3) cacto(v, px, pz, 2.6 + hash2(i, 6) * 3.6, i);
      else if (k < 0.62) pedra(v, px, pz, 0.35 + hash2(i, 9) * 1.3, i);
      else arbusto(v, px, pz, 0.3 + hash2(i, 8) * 0.6, i);
      if (!livreDosCaminhos(px, pz, k < 0.3 ? 4.5 : 3)) cortes.push([ini, v.c.length]);
    }
    G.veg.push({ geo: semItens(v, cortes).geo(), cx: 1090, cz: 40, r: 110 });
  }
  G.tunel1 = montanhaTunel(MUNDO.tunel1.x0 + 25, MUNDO.tunel1.x1 - 25, 46, 90, 11).geo();
  G.tunel2 = montanhaTunel(MUNDO.tunel2.x0 + 25, MUNDO.tunel2.x1 - 25, 18, 30, 23).geo();
  G.estacao = estacao().geo();
  G.ponte = ponte().geo();
  G.torre = torrePedra().geo();
  const pl = new Malha(3); placa(pl, MUNDO.placa, 4.8, 2.2, 1.8); G.placaPostes = pl.geo();
  // trem
  G.loco = locomotiva().geo();
  G.tender = tender().geo();
  G.vagaoD = carroceria(17, PAL.vinho, PAL.dourado, true, 9, 61).geo();
  G.vagaoP = carroceria(17, PAL.verdeVagao, PAL.dourado, false, 9, 62, [-1, 1]).geo(); // passageiros: portas fechadas nas duas pontas
  G.vidrosD = vidros(17, 9, [255, 255, 255], true, []).geo(); G.portaD = portaVagao(PAL.vinho).geo();
  G.vidrosP = vidros(17, 9, [255, 255, 255]).geo();
  G.vagaoS = vagaoCavalos().geo(); G.palhaChaoS = palhaVagao().geo();
  G.portaS = portaCavalos().geo();
  G.interiorD = interiorRestaurante().geo();
  G.rodaG = roda(0.85, 12, PAL.vermelhoLoco, PAL.ferro2).geo();
  G.rodaP = roda(0.45, 8, PAL.vermelhoLoco, PAL.ferro2).geo();
  G.rodaV = roda(0.42, 0, PAL.ferro2, PAL.ferro).geo();
  // elenco
  G.jack = pessoa(FIGURINOS.jackGarconete);
  G.jackFL = pessoa(FIGURINOS.jackForaDaLei);
  G.xerife = pessoa(FIGURINOS.xerife);
  G.barao = pessoa(FIGURINOS.barao);
  G.convidados = []; for (let i = 0; i < 10; i++) G.convidados.push(pessoa(figurinoConvidado(i)));
  G.ajudantes = []; for (let i = 0; i < 4; i++) G.ajudantes.push(pessoa(figurinoAjudante(i)));
  G.cavaloPreto = cavalo(corHex('#1E1A1C'), corHex('#0E0C0C'));
  G.cavalos = [cavalo(corHex('#6A3E22'), corHex('#2A1A10')), cavalo(corHex('#8A5A34'), corHex('#3A2414')), cavalo(corHex('#4A2C1A'), corHex('#1A100A')), cavalo(corHex('#9A7A5A'), corHex('#4A3A2A'))];
  // objetos
  G.suporteDiam = suporteDiamante().geo(); G.coroaDiam = coroaDiamante().geo(); G.pavDiam = pavilhaoDiamante().geo(); G.forroTampaDiam = forroTampaDiamante().geo(); G.forroOcoDiam = forroOcoDiamante().geo(); G.bomba = bombaEsfera().geo(); G.cacoBomba = cacoBomba().geo();
  G.bule = bule().geo(); G.xicara = xicara().geo(); G.bandeja = bandeja(false).geo(); G.bandejaCloche = bandeja(true).geo(); G.taca = taca().geo();
  G.revolver = revolver().geo(); G.ancinho = ancinho(ANC.L).geo(); G.luneta = luneta().geo(); G.avental = avental().geo(); G.aventalChao = avental(true).geo(); G.aventalErguido = avental('param').geo(); G.aventalErguido.__par = G.aventalErguido.vertices.map(v => [v.x, v.y, v.z]); G.vestidoChao = vestidoChao().geo();
  G.quadro = quadro(1, 1).geo(); G.discoSombra = discoSombra().geo(); G.bolha = bolha(10).geo(); G.bolhaFina = bolha(16).geo(); G.nuvem = bolha(24).geo(); G.chama = chamaGeo().geo(); G.anel = anelSuave(56).geo(); G.cubo = cuboUnit().geo(); G.disco = disco(18).geo(); // bolhas: as esferas da fumaça, da poeira e da explosão
  const ceu = new Malha(1); ceu.jit = 0; ceu.esfera(1, 32, 16, [255, 255, 255]); G.ceu = ceu.geo();
  let tris = 0; for (const k in G) { const g = G[k]; if (g && g.__tris) tris += g.__tris; }
  console.log('modelos prontos em', Math.round(performance.now() - t0), 'ms');
}

// ================================================================ TEXTURAS
function construirTexturas() {
  // cartaz de procurado: o homem barbudo que ninguém viu, em papel velho dobrado e retrato de xilogravura
  TX.cartaz = cartazProcurado();
  let g;
  // carta de valete de ouros (desenho próprio)
  g = createGraphics(256, 360);
  g.background('#F6F1E6'); g.noFill(); g.stroke('#C9B48A'); g.strokeWeight(3); g.rect(10, 10, 236, 340, 16); g.noStroke();
  g.fill('#C21E2A'); g.textFont('Rye'); g.textAlign(CENTER, CENTER); g.textSize(48); g.text('J', 36, 44); g.push(); g.translate(220, 316); g.rotate(PI); g.text('J', 0, 0); g.pop();
  const losango = (x, y, s) => g.quad(x, y - s, x + s * 0.7, y, x, y + s, x - s * 0.7, y);
  losango(36, 90, 14); losango(220, 270, 14);
  losango(128, 180, 64);
  g.fill('#F6F1E6'); losango(128, 180, 40); g.fill('#C21E2A'); losango(128, 180, 22);
  TX.carta = g;
  // placa da divisa
  g = createGraphics(512, 256);
  g.background('#8A5A34');
  for (let i = 0; i < 9; i++) { g.fill(70, 40, 20, 90); g.rect(0, i * 29, 512, 3); }
  g.fill('#F0E2C2'); g.textFont('Rye'); g.textAlign(CENTER, CENTER); g.textSize(54); g.text('DIVISA DO', 256, 90); g.text('TERRITÓRIO', 256, 165);
  TX.placa = g;
  // carimbo da mina do Barão
  g = createGraphics(256, 64);
  g.background('#E8D2A8'); g.fill('#7A1E1A'); g.textFont('Rye'); g.textAlign(CENTER, CENTER); g.textSize(22); g.text('MINA DO BARÃO', 128, 32);
  TX.carimbo = g;
}

// O cartaz de procurado (768 × 1080, mesma proporção do quadro na parede). Sorteio próprio, com
// semente fixa, para o cartaz sair igual em toda abertura sem mexer no random() do p5.
function cartazProcurado() {
  const W = 768, H = 1080, g = createGraphics(W, H);
  let sem = 91373; const rnd = (a = 1, b) => { sem = (sem * 16807) % 2147483647; const u = sem / 2147483647; return b === undefined ? u * a : a + u * (b - a); };
  const papel = [233, 214, 170], tinta = '#2E1C10', tintaRGB = [46, 28, 16];
  const poli = (pts) => { g.beginShape(); for (const [x, y] of pts) g.vertex(x, y); g.endShape(CLOSE); };
  const arco = (cx, cy, rx, ry, a0, a1, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  // papel: fundo, manchas, fibras, bordas queimadas pelo sol e as dobras
  g.background(...papel); g.noStroke();
  for (let i = 0; i < 70; i++) { const x = rnd(W), y = rnd(H), r = rnd(30, 140); for (let k = 0; k < 4; k++) { g.fill(140, 95, 45, rnd(3, 7)); g.circle(x + rnd(-8, 8), y + rnd(-8, 8), r * (1 - k * 0.2)); } }
  for (let i = 0; i < 2500; i++) { g.fill(120, 85, 45, rnd(8, 26)); g.rect(rnd(W), rnd(H), rnd(1, 4), 1); }
  for (let k = 0; k < 40; k++) { g.noFill(); g.stroke(110, 70, 30, 7); g.strokeWeight(3); g.rect(k * 1.5, k * 1.5, W - k * 3, H - k * 3); }
  g.stroke(110, 75, 35, 40); g.strokeWeight(2); g.line(W / 2, 0, W / 2, H); g.line(0, H * 0.52, W, H * 0.52);
  g.stroke(255, 248, 225, 60); g.strokeWeight(2); g.line(W / 2 + 2, 0, W / 2 + 2, H); g.line(0, H * 0.52 + 2, W, H * 0.52 + 2);
  // moldura impressa
  g.noFill(); g.stroke(tinta); g.strokeWeight(5); g.rect(26, 26, W - 52, H - 52); g.strokeWeight(1.5); g.rect(38, 38, W - 76, H - 76);
  // cabeçalho
  g.noStroke(); g.fill(tinta); g.textAlign(CENTER, CENTER);
  g.textFont('Rye'); g.textSize(96); g.text('PROCURADO', W / 2, 114);
  g.stroke(tinta); g.strokeWeight(3); g.line(90, 176, W - 90, 176); g.strokeWeight(1); g.line(90, 183, W - 90, 183);
  g.noStroke(); g.textFont('Cormorant Garamond'); g.textStyle(BOLD); g.textSize(38); g.text('V I V O   O U   M O R T O', W / 2, 210);
  g.stroke(tinta); g.strokeWeight(1); g.line(90, 236, W - 90, 236); g.strokeWeight(3); g.line(90, 243, W - 90, 243); g.noStroke();
  // retrato, como xilogravura: fundo hachurado, casaco, lenço, rosto, barba e chapéu
  const X0 = 170, Y0 = 266, X1 = W - 170, Y1 = 716, cx = W / 2;
  g.fill(218, 196, 148); g.rect(X0, Y0, X1 - X0, Y1 - Y0);
  g.push(); g.drawingContext.save(); g.drawingContext.beginPath(); g.drawingContext.rect(X0, Y0, X1 - X0, Y1 - Y0); g.drawingContext.clip();
  g.stroke(...tintaRGB, 70); g.strokeWeight(1.2); for (let k = 0; k < (X1 - X0) + (Y1 - Y0); k += 9) g.line(X0 + k, Y0, X0 + k - (Y1 - Y0), Y1);
  // casaco e ombros
  g.noStroke(); g.fill(tinta); poli([[X0 - 10, Y1 + 10], [X0 + 20, 640], [cx - 120, 598], [cx + 120, 598], [X1 - 20, 640], [X1 + 10, Y1 + 10]]);
  g.stroke(218, 196, 148); g.strokeWeight(3); g.line(cx - 70, 612, cx - 20, Y1); g.line(cx + 70, 612, cx + 20, Y1);
  g.strokeWeight(1.5); for (let y = 650; y < Y1; y += 8) { g.line(X0 + 30 + (y - 640) * 0.2, y, cx - 95, y); g.line(cx + 95, y, X1 - 30 - (y - 640) * 0.2, y); }
  // lenço no pescoço, com bolinhas
  g.noStroke(); g.fill(150, 120, 80); poli([[cx - 88, 592], [cx + 88, 592], [cx, 680]]);
  g.fill(218, 196, 148); for (let i = 0; i < 16; i++) { const v = rnd(0.05, 0.8), x = cx + rnd(-1, 1) * 70 * (1 - v), y = 594 + v * 86; g.circle(x, y, 7); }
  // rosto
  g.fill(222, 192, 140); g.ellipse(cx, 462, 158, 196);
  g.fill(...tintaRGB, 120); poli([[cx - 55, 392], [cx + 55, 392], [cx + 75, 436], [cx - 75, 436]]); // sombra da aba sobre os olhos
  g.stroke(...tintaRGB, 120); g.strokeWeight(1.3); for (let y = 440; y < 520; y += 6) { g.line(cx - 74, y, cx - 56, y + 8); g.line(cx + 74, y, cx + 56, y + 8); } // sombra nas faces
  // olhos: sobrancelhas franzidas, olhar fixo
  g.noStroke(); g.fill(tinta);
  poli([[cx - 62, 430], [cx - 14, 444], [cx - 16, 452], [cx - 64, 440]]); poli([[cx + 62, 430], [cx + 14, 444], [cx + 16, 452], [cx + 64, 440]]);
  g.ellipse(cx - 37, 462, 30, 12); g.ellipse(cx + 37, 462, 30, 12);
  g.fill(240, 225, 190); g.circle(cx - 33, 460, 5); g.circle(cx + 41, 460, 5);
  // nariz
  g.stroke(tinta); g.strokeWeight(3); g.noFill(); g.line(cx - 4, 455, cx - 12, 505); g.line(cx - 12, 505, cx + 8, 510);
  // barba cheia, com bigode, hachurada
  g.noStroke(); g.fill(tinta);
  const barba = [[cx - 82, 488], [cx - 86, 540], [cx - 60, 596], [cx - 30, 622], [cx, 632], [cx + 30, 622], [cx + 60, 596], [cx + 86, 540], [cx + 82, 488], [cx + 52, 512], [cx + 18, 520], [cx - 18, 520], [cx - 52, 512]];
  poli(barba);
  g.stroke(218, 196, 148, 170); g.strokeWeight(1.6); for (let i = 0; i < 70; i++) { const x = cx + rnd(-70, 70), y = rnd(525, 600), L = rnd(10, 26); if (Math.abs(x - cx) < 78 - (y - 525) * 0.5) g.line(x, y, x + (x - cx) * 0.08, y + L); }
  g.noStroke(); g.fill(tinta); poli([[cx - 64, 520], [cx - 30, 506], [cx, 512], [cx + 30, 506], [cx + 64, 520], [cx + 40, 530], [cx, 526], [cx - 40, 530]]); // bigode
  g.fill(150, 90, 70); g.ellipse(cx, 540, 34, 8); // boca
  // chapéu: aba larga, copa com vinco, fita com o losango
  g.fill(tinta); g.ellipse(cx, 404, 360, 56);
  poli([[cx - 96, 404], [cx - 108, 330], [cx - 92, 300], [cx - 40, 292], [cx, 312], [cx + 40, 292], [cx + 92, 300], [cx + 108, 330], [cx + 96, 404]]);
  g.fill(218, 196, 148); g.rect(cx - 102, 368, 204, 14);
  g.fill(tinta); poli([[cx, 362], [cx + 12, 375], [cx, 388], [cx - 12, 375]]);
  g.stroke(218, 196, 148, 150); g.strokeWeight(1.4); for (let x = cx - 90; x < cx + 90; x += 9) g.line(x, 312 + Math.abs(x - cx) * 0.12, x + 4, 362);
  g.drawingContext.restore(); g.pop();
  g.noFill(); g.stroke(tinta); g.strokeWeight(4); g.rect(X0, Y0, X1 - X0, Y1 - Y0); g.strokeWeight(1); g.rect(X0 - 8, Y0 - 8, X1 - X0 + 16, Y1 - Y0 + 16);
  // nome, crime e recompensa
  g.noStroke(); g.fill(tinta); g.textFont('Rye'); g.textStyle(NORMAL); g.textSize(68); g.text('DIAMOND JACK', W / 2, 786);
  for (const x of [74, W - 74]) poli([[x, 770], [x + 11, 786], [x, 802], [x - 11, 786]]);
  g.textFont('Cormorant Garamond'); g.textStyle(ITALIC); g.textSize(33); g.text('por roubo de joias, cofres e trens', W / 2, 836);
  g.stroke(tinta); g.strokeWeight(1.5); g.line(200, 864, W - 200, 864); g.noStroke();
  g.textFont('Rye'); g.textStyle(NORMAL); g.textSize(42); g.text('RECOMPENSA', W / 2, 896);
  g.textSize(80); g.text('$ 5.000', W / 2, 970);
  g.textFont('Cormorant Garamond'); g.textStyle(ITALIC); g.textSize(23); g.text('paga pela Ferrovia do Barão · tratar com o xerife', W / 2, 1026);
  // tinta gasta: falhas claras espalhadas
  g.noStroke(); for (let i = 0; i < 4200; i++) { g.fill(...papel, rnd(60, 160)); g.circle(rnd(W), rnd(H), rnd(0.8, 2.4)); }
  // furos de prego nos cantos de cima, com o papel puxado
  for (const x of [52, W - 52]) { g.fill(80, 50, 25, 60); g.circle(x, 54, 22); g.fill(30, 18, 10); g.circle(x, 52, 9); }
  return g;
}

// ================================================================ DESENHO: MUNDO
function visivel(cx, cz, r, maxD) {
  const dx = cx - CAM.olho[0], dz = cz - CAM.olho[2];
  const d = Math.hypot(dx, dz);
  if (d - r > maxD) return false;
  if (d < r * 1.5) return true;
  const fx = CAM.alvo[0] - CAM.olho[0], fz = CAM.alvo[2] - CAM.olho[2], fl = Math.hypot(fx, fz) || 1;
  return (dx * fx + dz * fz) / fl > -r * 1.2;
}
function desenhaCeu() {
  const gl = drawingContext;
  gl.depthMask(false); gl.disable(gl.DEPTH_TEST);
  shader(SH.ceu);
  const s = SH.ceu;
  s.setUniform('uTopo', AMB.ceuTopo); s.setUniform('uMeio', AMB.ceuMeio); s.setUniform('uHoriz', AMB.ceuHoriz); s.setUniform('uBaixo', AMB.ceuBaixo);
  s.setUniform('uSolW', normaliza(AMB.sol)); s.setUniform('uCorSolC', AMB.corSolCeu); s.setUniform('uSolTam', AMB.solTam);
  s.setUniform('uLuaW', normaliza(AMB.luaDir)); s.setUniform('uLua', AMB.lua); s.setUniform('uLuaTam', AMB.luaTam); s.setUniform('uLuaB', AMB.luaBrilho ?? 1.6); s.setUniform('uCeuFim', AMB.ceuFim || 0);
  s.setUniform('uEstrelas', AMB.estrelas); s.setUniform('uTempo', T);
  push(); scale(1, -1, 1); translate(CAM.olho[0], CAM.olho[1], CAM.olho[2]); scale(3000); model(G.ceu); pop();
  gl.enable(gl.DEPTH_TEST); gl.depthMask(true);
  shader(SH.mat); uniformesLuz();
}
function desenhaMundo(opt = {}) {
  const maxD = opt.maxD || 2600;
  md(G.chaoLonge, {});
  md(G.mesetas, {});
  for (const b of G.blocos) if (visivel(b.cx, b.cz, b.r, b.maxD || maxD)) model(b.geo);
  for (const b of G.trilhos) {
    if (b.geo && visivel(b.cx, b.cz, b.r, 700)) model(b.geo);
    else if (visivel(b.cx, b.cz, b.r, 6000)) model(b.longe);
  }
  for (const b of G.veg) if (visivel(b.cx, b.cz, b.r, 900)) model(b.geo);
  if (visivel(60, 0, 140, 3000)) model(G.tunel1);
  if (visivel(593, 0, 60, 2000)) model(G.tunel2);
  if (visivel(-30, 0, 80, 1600)) model(G.estacao);
  if (visivel(1328, 0, 160, 3000)) model(G.ponte);
  if (visivel(1030, -85, 70, 2500)) model(G.torre);
  if (visivel(MUNDO.placa, 5, 20, 400)) {
    model(G.placaPostes);
    push(); translate(MUNDO.placa, alturaTerreno(MUNDO.placa, 4.8) + 1.9, 4.8); rotateY(Math.PI); scale(2.2, 1.1, 1);
    md(G.quadro, { tex: TX.placa }); pop(); mat({});
  }
}

// ================================================================ DESENHO: PESSOAS
// pose: ângulos em radianos. Pessoa olha para +z no próprio referencial.
function poseBase() {
  return { x: 0, y: 0, z: 0, yaw: 0, pitch: 0, rolo: 0, bob: 0, inclina: 0, torce: 0, cabYaw: 0, cabPitch: 0,
    quadE: 0, quadD: 0, abreE: 0, abreD: 0, joelhoE: 0, joelhoD: 0, peE: 0, peD: 0,
    ombroE: 0, ombroD: 0, abracoE: 0.08, abracoD: 0.08, cotoveloE: 0.15, cotoveloD: 0.15, giroBE: 0, giroBD: 0,
    saia: 0, sentado: 0, maoD: null, maoE: null, escala: 1, semCabeca: false };
}
function misturaPose(a, b, t) {
  const r = {};
  for (const k in a) { const va = a[k], vb = b[k]; r[k] = (typeof va === 'number' && typeof vb === 'number') ? va + (vb - va) * t : (t < 0.5 ? va : vb); }
  return r;
}
// o tornozelo, no referencial da canela (unidades de 1,75 m): o pé gira em torno dele (p.peE e p.peD, positivo: a ponta desce)
const TORNOZELO = -0.43;
function peNaCanela(P, ang) { if (!P.P.pe) return; if (ang) { const y = TORNOZELO * P.D.s; translate(0, y, 0); rotateX(ang); translate(0, -y, 0); } model(P.P.pe); }
function desenhaPessoa(P, pose, opt = {}) {
  if (opt.cavalo) desenhaArreios(opt.cavalo, P, pose); // montado: rédeas nas mãos e estribos sob os pés
  const D = P.D, p = pose;
  if (!opt.pernasVisiveis && p.y > -50) sombra(p.x, p.y, p.z, 0.36 * D.s, 0.3 * D.s, p.yaw, 0.34 * (1 - Math.min(1, Math.abs(p.pitch))));
  push();
  translate(p.x, p.y, p.z); rotateY(p.yaw); rotateX(p.pitch); rotateZ(p.rolo);
  if (p.escala !== 1) scale(p.escala);
  translate(0, D.quadril + p.bob - p.sentado * (D.quadril - 0.47 * D.s), 0);
  rotateX(p.inclina * 0.4);
  model(P.P.pelve);
  // abas do fraque: penduradas na costura das costas (seguem o tronco); a perna que vai para trás as empurra e,
  // sentado ou agachado, elas se dobram sobre o assento em vez de entrar nele
  if (P.P.aba) { const st = Math.min(1, p.sentado || 0);
    for (const s of [-1, 1]) { const quad = s < 0 ? p.quadE : p.quadD;
      push(); rotateX(p.inclina * 0.6); translate(0, D.abaY, -D.abaZ); rotateX(Math.max(0, -quad) * 0.85 + 1.35 * st); scale(s, 1 - 0.82 * st, 1); model(P.P.aba); pop(); } }
  // saia: em pé, a barra balança por cisalhamento (continua horizontal, sem virar capa); sentada ou agachada, troca pela saia que cobre o colo
  const saiaSentada = P.P.saia && !opt.pernasVisiveis && !p.saiaCurta && (p.sentado > 0.5 || (p.quadE + p.quadD) / 2 > 0.95);
  if (P.P.saia) { if (saiaSentada) model(P.P.saiaSentada); else { const k = Math.tan(Math.max(-0.6, Math.min(0.6, p.saia || 0))); push(); applyMatrix(1, 0, 0, 0, 0, 1, k, 0, 0, 0, 1, 0, 0, 0, 0, 1); if (p.saiaCurta) scale(1 + 0.18 * p.saiaCurta, 1 - 0.48 * p.saiaCurta, 1 + 0.18 * p.saiaCurta); if (opt.pernasVisiveis) scale(1.32, 0.42, 1.12); model(P.P.saia); pop(); } } // saiaCurta: agachada, o vestido se abre no chão
  // pernas
  for (const s of [-1, 1]) {
    const quad = s < 0 ? p.quadE : p.quadD, abre = s < 0 ? p.abreE : p.abreD, joe = s < 0 ? p.joelhoE : p.joelhoD;
    if (P.P.saia && !opt.pernasVisiveis && !saiaSentada) { // sob a saia, só canelas aparecem
      if (P.f.saiaRasgada) { // saia rasgada: as coxas balançam um pouco menos (ficam sob o pano) e as canelas saem pela frente
        // agachada (saiaCurta), ajoelha: o joelho esquerdo no chão e o pé direito plantado à frente
        const kc = p.saiaCurta || 0, q = lerp1(quad, s < 0 ? 0.1 : 1.35, kc), j = lerp1(joe, s < 0 ? 1.55 : 1.5, kc), fq = lerp1(0.65, 1, kc);
        push(); translate(s * D.larg, 0, 0); rotateX(-q * fq); rotateZ(s * abre); model(P.P.coxa); translate(0, -D.coxa, 0); rotateX(j - q * (1 - fq)); model(P.P.canela); peNaCanela(P, s < 0 ? p.peE : p.peD); pop();
        continue;
      }
      if (p.saiaCurta > 0.5) continue; // agachada: as pernas ficam dentro do vestido
      const fi = canelaSobSaia(D, quad * 0.5, joe * 0.6, Math.tan(Math.max(-0.6, Math.min(0.6, p.saia || 0))));
      push(); translate(s * D.larg, 0, 0); rotateX(-quad * 0.5); rotateZ(s * abre); translate(0, -D.coxa, 0); rotateX(fi); model(P.P.canela); peNaCanela(P, s < 0 ? p.peE : p.peD); pop();
      continue;
    }
    push(); translate(s * D.larg, 0, 0); rotateX(-quad); rotateZ(s * abre); model(P.P.coxa); if (s > 0 && P.P.coldre) model(P.P.coldre); // o coldre acompanha a coxa
    translate(0, -D.coxa, 0); rotateX(joe); model(P.P.canela); peNaCanela(P, s < 0 ? p.peE : p.peD); pop();
  }
  // tronco, cabeça e braços
  push(); rotateX(p.inclina * 0.6); rotateY(p.torce);
  model(P.P.tronco);
  push(); translate(0, D.pescoco, 0); rotateY(p.cabYaw); rotateX(p.cabPitch);
  if (!p.semCabeca) {
    push(); translate(0, 0.1 * D.s, 0); model(P.P.cabeca);
    if (P.P.rosto) { // expressão desenhada em 2D na máscara do rosto
      const sem = P.semente || 0, ciclo = (T * 0.29 + sem) % 1;
      const pisca = ciclo < 0.032 && !p.semPiscar && !['tosse', 'esforco', 'surpresa', 'medo', 'piscar', 'piscadela'].includes(p.expr); // semPiscar: sem a piscada automática perto de uma piscadela
      const tex = texturaRosto(P, pisca ? 'piscar' : (p.expr || 'neutro'), p.olhar || 0);
      mat(Object.assign({}, MAT.ultimo || {}, { tex, __temp: true })); model(P.P.rosto); mat(MAT.ultimo || {});
    }
    if (P.P.chapeu && p.chapeuMao !== undefined) { // chapéu a caminho da cabeça: a aba presa na palma da mão direita, como ela está desenhada
      const c = poseChapeuMao(P, p);
      push(); translate(c.pos[0], c.pos[1], c.pos[2]); rotateX(c.rx); rotateZ(c.rz); model(P.P.chapeu); if (P.f.carta) cartaChapeu(P); pop();
    } else if (P.P.chapeu && !opt.semChapeu && !p.chapeuT) { // golpe: a bala empurra o chapéu, que balança na cabeça; depois dela, o da Jack tem os furos
      push(); if (p.chapeuGolpe) rotateX(p.chapeuGolpe);
      model(typeof chapeuDe === 'function' ? chapeuDe(P) : P.P.chapeu); if (P.f.carta) cartaChapeu(P); pop(); }
    pop();
  }
  pop();
  if (p.chapeuT && P.P.chapeu) { const c = p.chapeuT; push(); translate(c.pos[0], c.pos[1], c.pos[2]); rotateY(c.ry); rotateX(c.rx); rotateZ(c.rz); model(P.P.chapeu); pop(); } // o chapéu fora da cabeça, levado pela mão (o xerife, no fim)
  // objeto seguro com as duas mãos na frente do peito: ajusta o abraço para as mãos tocarem as laterais
  let peito = null;
  if (p.peito) {
    const hw = p.peito.meio || 0.15, M = [];
    for (const s of [-1, 1]) {
      const om = s < 0 ? p.ombroE : p.ombroD, co = s < 0 ? p.cotoveloE : p.cotoveloD, gi = s < 0 ? p.giroBE : p.giroBD;
      let lo = -1.2, hi = 0.6; // busca binária: abraço maior afasta a mão do centro
      for (let k = 0; k < 18; k++) { const m = (lo + hi) / 2; if (Math.abs(maoFK(D, s, om, m, co, gi)[0]) > hw) hi = m; else lo = m; }
      if (s < 0) p.abracoE = lo; else p.abracoD = lo;
      M.push(maoFK(D, s, om, lo, co, gi));
    }
    peito = [(M[0][0] + M[1][0]) / 2, (M[0][1] + M[1][1]) / 2, (M[0][2] + M[1][2]) / 2];
  }
  for (const s of [-1, 1]) {
    const om = s < 0 ? p.ombroE : p.ombroD, ab = s < 0 ? p.abracoE : p.abracoD, co = s < 0 ? p.cotoveloE : p.cotoveloD, gi = s < 0 ? p.giroBE : p.giroBD;
    push(); translate(s * D.ombro, D.tronco - 0.05 * D.s, 0);
    rotateX(-om); rotateZ(s * ab); rotateY(gi); model(P.P.braco);
    translate(0, -D.braco, 0); rotateX(-co);
    const obj = s > 0 ? p.maoD : p.maoE;
    // o antebraço gira no próprio eixo (a palma vira para dentro, o polegar para cima) quando a mão empunha o revólver;
    // a pose pode girá-lo antes, enquanto a mão vai ao coldre (rolaD e rolaE, de 0 a 1)
    const ro = Math.max((s > 0 ? p.rolaD : p.rolaE) || 0, obj === 'revolver' ? 1 : 0);
    if (ro) rotateY(-s * ro * Math.PI / 2);
    // o antebraço com a mão aberta ou fechada (maoFechada); o esquerdo é o direito espelhado
    push(); if (s < 0) scale(-1, 1, 1); model(P.P.antebraco[maoFechada(p, s, obj, opt) ? 1 : 0]); pop();
    if (obj) { push(); translate(0, -D.antebraco - 0.05 * D.s, 0.02); objetoNaMao(obj, om + co + p.inclina, s); pop(); }
    pop();
  }
  if (peito) { push(); translate(peito[0], peito[1] + (p.peito.dy ?? -0.06), peito[2] + (p.peito.dz ?? -0.01)); rotateX(p.peito.inclina || 0); if (p.peito.nome === 'relogio') desenhaRelogio(p.peito); pop(); mat({}); }
  pop();
  pop();
}
// a carta presa na fita do chapéu da Jack: a mesma carta deixada na vitrine (mesmo transform da geometria do chapéu)
function cartaChapeu(P) { const s = P.f.altura / 1.75 * 1.12; push(); scale(s); translate(0, 0.085, -0.005); translate(CARTA_CHAPEU[0], CARTA_CHAPEU[1], CARTA_CHAPEU[2]); rotateY(0.7); rotateZ(0.2); translate(0, 0, 0.0018); scale(0.058, 0.082, 1); md(G.quadro, { tex: TX.carta }); pop(); mat(MAT.ultimo || {}); }
// a carta de ouros (a assinatura do ladrão) dentro do bolso do avental pendurado: entre a frente do bolso e a saia, com só
// a ponta de cima (o índice e meio losango) para fora da boca do bolso
function cartaNoBolso() { const m0 = MAT.ultimo; push(); translate(0.1, -0.416, 0.0035); rotateZ(-0.15); scale(0.062, 0.088, 1); md(G.quadro, { tex: TX.carta }); pop(); mat(m0 || {}); } // volta ao material de antes da carta (antes voltava ao da própria carta, e o resto do quadro saía com a textura dela)
// posição da mão no referencial do tronco (mesma cadeia de transformações dos braços)
function maoFK(D, s, om, ab, co, gi) {
  let v = [0, -(D.antebraco + 0.05 * D.s), 0.02];
  const rx = (v, a) => [v[0], v[1] * Math.cos(a) - v[2] * Math.sin(a), v[1] * Math.sin(a) + v[2] * Math.cos(a)];
  const ry = (v, a) => [v[0] * Math.cos(a) + v[2] * Math.sin(a), v[1], -v[0] * Math.sin(a) + v[2] * Math.cos(a)];
  const rz = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a), v[2]];
  v = rx(v, -co); v = [v[0], v[1] - D.braco, v[2]]; v = ry(v, gi); v = rz(v, s * ab); v = rx(v, -om);
  return [v[0] + s * D.ombro, v[1] + D.tronco - 0.05 * D.s, v[2]];
}
// Chapéu na mão (o da Jack, antes da fuga). Referencial: o da cabeça em desenhaPessoa, já com a subida de 0,1·s onde o
// chapéu assenta (origem dele). pegaChapeu: onde fica a palma ao segurar a aba (lado 1 direita, -1 esquerda): 1,2 cm para
// fora da borda e 1,2 cm abaixo dela. Na subida (h até 0,55) o chapéu vai preso à mão direita; na descida as duas mãos
// o levam até a cabeça (ângulos dos braços por cinemática inversa, em roteiro.js) e, no fim, ele assenta exatamente.
function pegaChapeu(P, lado) { const s = P.f.altura / 1.75 * 1.12; return [lado * (0.212 * s + 0.012), 0.085 * s - 0.012, -0.005 * s]; }
function cabecaParaTronco(P, p, v) { const w = _ry(_rx([v[0], v[1] + 0.1 * P.D.s, v[2]], p.cabPitch || 0), p.cabYaw || 0); return [w[0], w[1] + P.D.pescoco, w[2]]; }
function troncoParaCabeca(P, p, w) { const v = _rx(_ry([w[0], w[1] - P.D.pescoco, w[2]], -(p.cabYaw || 0)), -(p.cabPitch || 0)); return [v[0], v[1] - 0.1 * P.D.s, v[2]]; }
function giroChapeu(c, v) { return _rx(_rz(v, c.rz), c.rx); }
// na subida o chapéu pende de lado, pela aba, com a copa para o corpo (de pé, de frente, ele tapava o rosto dela) e vai
// nivelando até ficar quase reto no alto; na descida, assenta reto
function angChapeu(h) { const A = suave(fase0g(h, 0, 0.55)), B = suave(fase0g(h, 0.55, 1)); return { A, B, rx: lerp1(lerp1(-0.35, -0.25, A), 0, B), rz: lerp1(1.35, 0.15, suave(fase0g(A, 0.1, 0.85))) * (1 - B) }; }
function poseChapeuMao(P, p) {
  const c = angChapeu(p.chapeuMao), mao = troncoParaCabeca(P, p, maoFK(P.D, 1, p.ombroD, p.abracoD || 0, p.cotoveloD, p.giroBD || 0)), g = giroChapeu(c, pegaChapeu(P, 1));
  c.pos = lerp3([mao[0] - g[0], mao[1] - g[1], mao[2] - g[2]], [0, 0, 0], suave(fase0g(p.chapeuMao, 0.92, 1)));
  return c;
}
// Referencial do tronco (o mesmo de desenhaPessoa, onde maoFK mede a mão): do tronco para o mundo e de volta.
function _rx(v, a) { const c = Math.cos(a), s = Math.sin(a); return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c]; }
function _ry(v, a) { const c = Math.cos(a), s = Math.sin(a); return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c]; }
function _rz(v, a) { const c = Math.cos(a), s = Math.sin(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]]; }
function alturaTronco(D, p) { return D.quadril + (p.bob || 0) - (p.sentado || 0) * (D.quadril - 0.47 * D.s); }
function doTronco(P, p, v) {
  let w = _rx(_ry(v, p.torce || 0), p.inclina || 0); w = [w[0], w[1] + alturaTronco(P.D, p), w[2]];
  const e = p.escala ?? 1; w = _ry(_rx(_rz([w[0] * e, w[1] * e, w[2] * e], p.rolo || 0), p.pitch || 0), p.yaw || 0);
  return [w[0] + p.x, w[1] + p.y, w[2] + p.z];
}
// referencial da cabeça (o mesmo de desenhaPessoa: pescoço, giro e inclinação da cabeça; origem no pescoço) para o mundo
function doCabeca(P, p, v) { const w = _ry(_rx(v, p.cabPitch || 0), p.cabYaw || 0); return doTronco(P, p, [w[0], w[1] + P.D.pescoco, w[2]]); }
function paraTronco(P, p, w) {
  let v = _rz(_rx(_ry([w[0] - p.x, w[1] - p.y, w[2] - p.z], -(p.yaw || 0)), -(p.pitch || 0)), -(p.rolo || 0));
  const e = p.escala ?? 1; v = [v[0] / e, v[1] / e - alturaTronco(P.D, p), v[2] / e];
  return _ry(_rx(v, -(p.inclina || 0)), -(p.torce || 0));
}
// cinemática inversa do braço: ombro, abraço e cotovelo que levam a mão (a ponta de maoFK) até o alvo, no
// referencial do tronco. Descida por coordenadas com passo que encolhe; o abraço tem um custo pequeno, para o
// cotovelo não abrir à toa. Devolve também o erro que sobrou (em metros).
function ikMao(D, s, alvo, ini = [0.8, 0.2, 0.9], gi = 0, abPref = 0) {
  const lim = [[-0.8, 3.1], [-0.3, 1.4], [0, 2.6]];
  const custo = q => { const h = maoFK(D, s, q[0], q[1], q[2], gi); return (h[0] - alvo[0]) ** 2 + (h[1] - alvo[1]) ** 2 + (h[2] - alvo[2]) ** 2 + 0.0004 * (q[1] - abPref) ** 2; };
  let q = ini.slice(), c = custo(q);
  for (let passo = 0.4; passo > 0.002; passo *= 0.5) {
    for (let volta = 0, melhorou = true; melhorou && volta < 40; volta++) {
      melhorou = false;
      for (let i = 0; i < 3; i++) for (const d of [passo, -passo]) {
        const r = q.slice(); r[i] = Math.max(lim[i][0], Math.min(lim[i][1], r[i] + d)); const cr = custo(r);
        if (cr < c - 1e-12) { q = r; c = cr; melhorou = true; }
      }
    }
  }
  const h = maoFK(D, s, q[0], q[1], q[2], gi);
  return { om: q[0], ab: q[1], co: q[2], erro: Math.hypot(h[0] - alvo[0], h[1] - alvo[1], h[2] - alvo[2]) };
}
// leva a mão (s = 1 direita/D, -1 esquerda/E) a um ponto do mundo e esvazia a mão (o objeto é desenhado no mundo)
function maoNoPonto(P, p, s, w, ini, gi = 0, abPref = 0) {
  const alvo = paraTronco(P, p, w); let r = null;
  // alguns pontos de partida e, se preciso, o braço girado (o cotovelo dobra para o lado): fica a melhor solução
  for (const g of [gi, gi - 0.9, gi + 0.9]) {
    for (const q of [ini, [0.3, 0.9, 0.6], [1.3, 0.4, 0.3], [0.6, 0.2, 1.6]]) {
      if (!q) continue; const t = ikMao(P.D, s, alvo, q, g, abPref); t.gi = g; if (!r || t.erro < r.erro - 0.002) r = t; if (r.erro < 0.004) break;
    }
    if (r.erro < 0.004) break;
  }
  gi = r.gi;
  if (s > 0) { p.ombroD = r.om; p.abracoD = r.ab; p.cotoveloD = r.co; p.giroBD = gi; p.maoD = null; }
  else { p.ombroE = r.om; p.abracoE = r.ab; p.cotoveloE = r.co; p.giroBE = gi; p.maoE = null; }
  return r.erro;
}

// direção da palma (o +z do antebraço) no referencial do tronco, para os ângulos dados (mesma cadeia de maoFK)
function palmaFK(s, om, ab, co, gi) { return _rx(_rz(_ry(_rx([0, 0, 1], -co), gi), s * ab), -om); }
// como maoNoPonto, mas com o giro do braço como quarto grau de liberdade e, se pedido, a palma virada para "cima"
// (uma direção do mundo): serve para apoiar a bandeja na palma. A posição vem primeiro; a palma desempata. Começa da
// pose dada (ini = [ombro, abraço, cotovelo, giro]) e tem um puxão leve para ela, para o braço não trocar de solução
// de um quadro para o outro. Sem "cima" (null), só a posição e a continuidade contam (a mão na alça do bule).
function maoPalma(P, p, s, w, cima, ini, abPref = 0.08) {
  const alvo = paraTronco(P, p, w), D = P.D;
  let up = null;
  if (cima) { const o = paraTronco(P, p, [p.x, p.y, p.z]), c1 = paraTronco(P, p, [p.x + cima[0], p.y + cima[1], p.z + cima[2]]); up = [c1[0] - o[0], c1[1] - o[1], c1[2] - o[2]]; }
  const lim = [[-0.8, 3.1], [-0.3, 1.4], [0, 2.6], [-1.8, 1.8]];
  const q0 = ini.map((v, i) => Math.max(lim[i][0], Math.min(lim[i][1], v || 0)));
  const custo = q => { const h = maoFK(D, s, q[0], q[1], q[2], q[3]);
    let r = 0; for (let i = 0; i < 4; i++) r += (q[i] - q0[i]) ** 2;
    let c = (h[0] - alvo[0]) ** 2 + (h[1] - alvo[1]) ** 2 + (h[2] - alvo[2]) ** 2 + 0.0004 * (q[1] - abPref) ** 2 + 0.000005 * r;
    if (up) { const n = palmaFK(s, q[0], q[1], q[2], q[3]); c += 0.001 * (1 - (n[0] * up[0] + n[1] * up[1] + n[2] * up[2])); }
    return c; };
  let q = q0.slice(), c = custo(q);
  for (let passo = 0.4; passo > 0.0005; passo *= 0.5) {
    for (let volta = 0, melhorou = true; melhorou && volta < 60; volta++) {
      melhorou = false;
      for (let i = 0; i < 4; i++) for (const d of [passo, -passo]) {
        const r = q.slice(); r[i] = Math.max(lim[i][0], Math.min(lim[i][1], r[i] + d)); const cr = custo(r);
        if (cr < c - 1e-13) { q = r; c = cr; melhorou = true; }
      }
    }
  }
  if (s > 0) { p.ombroD = q[0]; p.abracoD = q[1]; p.cotoveloD = q[2]; p.giroBD = q[3]; p.maoD = null; }
  else { p.ombroE = q[0]; p.abracoE = q[1]; p.cotoveloE = q[2]; p.giroBE = q[3]; p.maoE = null; }
  const h = maoFK(D, s, q[0], q[1], q[2], q[3]);
  return Math.hypot(h[0] - alvo[0], h[1] - alvo[1], h[2] - alvo[2]);
}

// A mão fica fechada quando segura alguma coisa pelo cabo (a bandeja vai na palma aberta), na aba do chapéu (a direita
// na subida, as duas na descida), no que vai com as duas mãos na frente do peito (a bomba) e nas rédeas, até
// largá-las de todo (assim não abre por um instante entre as rédeas e a bomba); a pose pode decidir com fechaD e fechaE
// (a garçonete com o bule e o xerife com o cartaz e o avental, que são desenhados à parte, sem passar por maoD)
const NA_PALMA = new Set(['bandeja', 'bandejaCloche']);
function maoFechada(p, s, obj, opt) {
  const f = s > 0 ? p.fechaD : p.fechaE;
  if (f !== undefined) return !!f;
  if (obj) return !NA_PALMA.has(typeof obj === 'string' ? obj : obj.nome);
  if (p.chapeuMao !== undefined && (s > 0 || p.chapeuMao >= 0.55)) return true;
  if (p.peito) return true;
  return !!(opt.cavalo && (p.soltaRedeas ?? 0) < 0.98);
}
// objetos que as pessoas seguram (orientados para a frente da mão)
function objetoNaMao(o, giroBraco = 0, lado = 1) {
  const nome = typeof o === 'string' ? o : o.nome;
  push();
  if (nome === 'bandeja' || nome === 'bandejaCloche') { rotateX(giroBraco); translate(0, 0.03, 0.13); model(G[nome]); } // desfaz o giro do braço: a bandeja fica nivelada, apoiada na mão
  else if (nome === 'bule') { rotateX(-Math.PI / 2 + (o.inclina || 0)); translate(0.1, -0.12, 0.03); rotateX(Math.PI / 2); model(G.bule); } // a mão segura a alça, não o meio do bule
  else if (nome === 'taca') { translate(0, -0.03, 0.03); model(G.taca); }
  else if (nome === 'revolver') { translate(0.063 * lado, 0.008, -0.005); rotateY(lado * Math.PI / 2); rotateX(Math.PI / 2); model(G.revolver); } // o cano segue o antebraço, o cabo atravessa o punho fechado e o cão fica do lado do polegar
  else if (nome === 'luneta') { rotateX(-Math.PI / 2); translate(0, 0.0, -0.05); model(G.luneta); }
  else if (nome === 'cartaz') { rotateX(-Math.PI / 2.2); translate(-0.15, 0.06, 0.2); scale(0.34, -0.48, 1); md(G.quadro, { tex: TX.cartaz }); mat({}); } // a mão segura a borda do cartaz
  else if (nome === 'leque') { // o leque de valetes de ouros abrindo na mão (abre: 0 fechado, 1 aberto), à frente da palma
    const m0 = MAT.ultimo, n = o.n || 16, ab = (o.abre || 0) * 1.85;
    for (let i = 0; i < n; i++) { push(); translate(0, 0.015, 0.02 + i * 0.0009); rotateZ((i / (n - 1) - 0.5) * ab); translate(0, -0.048, 0); scale(0.064, -0.09, 1); md(G.quadro, { tex: TX.carta, semLuz: 0.35 }); pop(); }
    mat(m0 || {}); }
  else if (nome === 'carta') { scale(0.06, 0.085, 1); translate(0, -0.5, 0.4); md(G.quadro, { tex: TX.carta }); mat({}); }
  else if (nome === 'relogio' || nome === 'bomba') { rotateX(-Math.PI / 2); translate(0, -0.05, 0.05); rotateX(Math.PI / 2); if (o.comp) { translate(0, -0.04, 0.02); rotateX(o.comp); } if (o.escala) scale(o.escala); desenhaRelogio(nome === 'bomba' ? Object.assign({ soBomba: true }, o) : o); } // comp: desfaz o giro do braço (relógio em pé)
  else if (nome === 'avental') { rotateX(giroBraco); translate(-0.12, 0.02, 0.05); model(G.avental); cartaNoBolso(); } // pende do canto do peitilho, na vertical
  else if (nome === 'chapeu') { translate(0, -0.05, 0.1); rotateX(-1.2); model(G.jackFL.P.chapeu); cartaChapeu(G.jackFL); }
  else if (nome === 'chapeuXerife') { translate(0, -0.02, 0.16); rotateX(-1.5); rotateZ(0.2); translate(0, -0.12, 0); model(G.xerife.P.chapeu);
    // semCarta: no vagão dos cavalos, antes de a carta estar na fita
    if (!o.semCarta) { push(); translate(0.09, 0.07, 0.07); rotateY(0.7); scale(0.055, 0.078, 1); md(G.quadro, { tex: TX.carta }); pop(); mat({}); } }
  else if (nome === 'relogioBolso') { rotateX(-Math.PI / 2); translate(0, 0.0, 0.03); scale(0.028, 0.028, 0.008); rotateX(Math.PI / 2); md(G.disco, { tinta: [0.9, 0.72, 0.3], brilho: 2 }); mat({}); }
  pop();
}

// Canela sob a saia: o joelho dobra menos quando a bota iria furar o pano. O perfil é o mesmo da saia
// (elenco.js); k é o cisalhamento da barra (a saia balança junto com o passo). Devolve o giro do joelho.
const PERFIL_SAIA = [[0.205, 0.08], [0.212, -0.04], [0.235, -0.22], [0.27, -0.45], [0.3, -0.66], [0.322, -0.86]];
function raioSaia(y) {
  const P = PERFIL_SAIA; if (y >= P[0][1]) return P[0][0];
  for (let i = 0; i < P.length - 1; i++) { const [r0, y0] = P[i], [r1, y1] = P[i + 1]; if (y <= y0 && y >= y1) return r0 + (r1 - r0) * (y0 - y) / (y0 - y1); }
  return P[P.length - 1][0];
}
function canelaSobSaia(D, qh, fi, k) {
  const c = D.canela, zk = D.coxa * Math.sin(qh), yk = -D.coxa * Math.cos(qh);
  for (let it = 0; it < 3; it++) {
    const phi = fi - qh, za = zk - c * Math.sin(phi), ya = yk - c * Math.cos(phi);
    const R = Math.sqrt(Math.max(0.0001, (raioSaia(ya / D.s) * D.s) ** 2 - D.larg ** 2)), zc = k * ya;
    const atras = zc - (R - 0.11), frente = zc + (R - 0.16); // folga da bota: o calcanhar atrás, o bico na frente
    if (za < atras) fi = Math.asin(Math.max(-1, Math.min(1, (zk - atras) / c))) + qh;
    else if (za > frente) fi = Math.asin(Math.max(-1, Math.min(1, (zk - frente) / c))) + qh;
    else break;
  }
  return fi;
}

// sombra de contato: disco escuro e suave no chão, sem mexer no material atual
function sombra(x, y, z, rx, rz, yaw, alfa) {
  if (alfa <= 0.01) return;
  push(); translate(x, y + 0.035, z); rotateY(yaw || 0); scale(rx, 1, rz);
  md(G.discoSombra, { tinta: [0, 0, 0], alfa, semLuz: 1, borda: 0, alfaCor: 1, __temp: true }); pop();
  mat(MAT.ultimo || {});
}

// ================================================================ DESENHO: OBJETOS
// A Estrela do Deserto, o diamante falso (o nome da função ficou da joia antiga, o relógio de mesa).
// o.suporte: no pedestal da vitrine; o.semDiamante: só o pedestal, depois do roubo.
// o.abre (0 a 1,5, como antes): a coroa desenrosca (meia volta, subindo pela rosca) e tomba para trás
// na dobradiça, mostrando a bomba esférica; o.seg: segundos no mostrador da bomba;
// o.tique: o diamante estremece a cada segundo (a bomba bate lá dentro). o.oco: sem a bomba dentro (o diamante devolvido).
// o.soBomba: só a bomba, com o fundo apoiado na origem (na mão dela e no arremesso).
function desenhaRelogio(o = {}) {
  const base = MAT.ultimo || {};
  if (o.soBomba) { push(); translate(0, DIAM.bombaR + 0.003, 0); bombaComPonteiros(o.seg ?? 0, base); pop(); mat(base); return; }
  push();
  if (o.suporte) { model(G.suporteDiam); translate(0, DIAM.yCinta, 0); }
  else translate(0, DIAM.cinta + DIAM.pav + 0.002, 0); // na mão: a ponta do pavilhão na palma
  if (!o.semDiamante) {
    const seg = o.seg ?? 0;
    if (o.tique) { const f = (seg % 1 + 1) % 1, k = Math.exp(-f * 14) * o.tique; rotateZ(0.05 * k); rotateX(0.03 * k); }
    const ab = Math.min(1, (o.abre || 0) / 1.5), gira = suave(ab / 0.45), tomba = suave((ab - 0.45) / 0.55);
    const brilhoD = { brilho: 3.2, emis: 1.45, sol: base.sol, amb: base.amb }, veludo = { brilho: 0.04, sol: base.sol, amb: base.amb };
    md(G.pavDiam, brilhoD); md(G.forroOcoDiam, veludo);
    // a bomba só existe à vista quando a tampa saiu do lugar
    if (ab > 0.02 && !o.oco) { push(); translate(0, DIAM.bombaY + 0.03 * tomba, 0); bombaComPonteiros(seg, base); pop(); } // uma mola ergue a bomba quando a tampa tomba
    // a coroa: sobe pela rosca girando e depois tomba na dobradiça de trás (tombaMax: quanto ela tomba, em radianos)
    push();
    translate(0, 0.008 * gira, -DIAM.R - 0.004); rotateX(-(o.tombaMax ?? 1.95) * tomba); translate(0, 0, DIAM.R + 0.004);
    rotateY(Math.PI / 2 * gira);
    md(G.coroaDiam, brilhoD); md(G.forroTampaDiam, veludo);
    pop();
    // cintilação: estrela de quatro pontas que pulsa na frente da pedra (fechada)
    const k = (o.estrela ?? 0.35) * (0.55 + 0.45 * Math.sin(T * 5.3) * Math.sin(T * 2.1 + 1)) * (1 - ab);
    if (k > 0.02) { push(); translate(0.025, 0.03, DIAM.R * 0.85); rotateZ(T * 0.4); const L = 0.05 + 0.13 * k;
      // cada raio fica 0,4 mm à frente do anterior: no mesmo plano, os quatro disputavam o miolo da estrela, que cintilava no close do P32
      for (const [i, [w, h, a]] of [[0.006, L, 0], [L, 0.006, 0], [0.004, L * 0.55, Math.PI / 4], [0.004, L * 0.55, -Math.PI / 4]].entries()) { push(); translate(0, 0, 0.0004 * i); rotateZ(a); scale(w, h, 1); md(G.quadro, { tinta: [1.6, 1.7, 1.9], semLuz: 1, alfa: Math.min(1, k * 1.4) }); pop(); }
      push(); scale(0.03 * (0.6 + k)); md(G.bolha, { tinta: [1.4, 1.55, 1.8], semLuz: 1, alfa: 0.45 * k }); pop(); pop(); }
  }
  pop();
  mat(base);
}

// a bomba esférica e os ponteiros no mostrador inclinado (o eixo z local passa a apontar para fora do mostrador)
function bombaComPonteiros(seg, base) {
  md(G.bomba, { brilho: 1.2, sol: base.sol, amb: base.amb });
  rotateX(-DIAL.incl); translate(0, 0, DIAL.topo + 0.0012);
  mat({ tinta: [0.12, 0.1, 0.08], sol: base.sol, amb: base.amb });
  push(); rotateZ(-(seg / 60) * Math.PI * 2); translate(0, 0.008, 0); scale(0.0018, 0.017, 0.0012); model(G.cubo); pop();
  push(); rotateZ(-(seg / 3600) * Math.PI * 2 - 0.4); translate(0, 0.005, 0); scale(0.0026, 0.011, 0.0012); model(G.cubo); pop();
}

// ================================================================ DESENHO: CAVALOS
// pose do cavalo: x,y,z,yaw; passo (fase do galope); pitch; empina; salto; pescoço
// ---------------------------------------------------------------- andaduras
// A perna (como no desenho): braço ou coxa 0,5, canela 0,38, quartela 0,12 e casco 0,08, do ombro ou do quadril (0,1
// abaixo do centro do corpo, a 0,72 para a frente e para trás) até o chão.
const PERNA_CAV = { L1: 0.5, L2: 0.38, Q: 0.12, C: 0.08, py: -0.1 };
const ALT_CAV = 1.25, BASE_CAV = -0.07; // o corpo mais baixo que antes: em pé, a perna esticada alcançava 7 cm acima do chão; agora alcança o chão
// Cada andadura, com as patas na ordem traseira E, traseira D, dianteira E, dianteira D:
//  off, quando cada pata pousa (fração da passada); apoio, a fração com a pata no chão; poeF e poeT, onde a pata pousa (fração
//  do trecho do apoio à frente do ombro ou do quadril); passada, o comprimento típico, se o estado não disser;
//  quartT0 e quartT1, a inclinação da quartela traseira no apoio (sem peso e com peso); no voo, a dobra do joelho (dianteira,
//  negativa) e do jarrete (traseira), da quartela e do casco, e quanto o braço ou a coxa sobe.
// Galope transverso (traseira E, traseira D, dianteira E, dianteira D) com uma fase no ar depois da dianteira que lidera;
// trote em pares diagonais com um instante no ar; passo em quatro tempos, sempre com duas ou três patas no chão.
const ANDADURAS = {
  passo:  { desce: 0.07, boletoF0: 0.22, boletoF1: 0.2, off: [0, 0.5, 0.25, 0.75], apoio: 0.58, poeF: 0.5, poeT: 0.45, passada: 1.5, quartT0: 0.36, quartT1: 0.1, dobraF: -1.0, dobraT: 0.7, quartF: -0.8, quartV: -0.65, cascoF: -0.35, cascoT: -0.3, sobeF: 0.2, sobeT: 0.1 },
  trote:  { desce: 0.12, boletoF0: 0.3, boletoF1: 0.45, off: [0, 0.5, 0.5, 0], apoio: 0.32, poeF: 0.48, poeT: 0.42, passada: 2.6, quartT0: 0.4, quartT1: 0.24, dobraF: -1.2, dobraT: 1.0, quartF: -0.9, quartV: -0.75, cascoF: -0.35, cascoT: -0.3, sobeF: 0.32, sobeT: 0.18 },
  galope: { desce: 0.1, boletoF0: 0.35, boletoF1: 0.55, off: [0, 0.12, 0.3, 0.44], apoio: 0.18, poeF: 0.55, poeT: 0.48, passada: 5.2, quartT0: 0.42, quartT1: 0.32, dobraF: -1.6, dobraT: 1.05, quartF: -1.0, quartV: -0.85, cascoF: -0.4, cascoT: -0.35, sobeF: 0.5, sobeT: 0.25 },
};
// a passada de cada andadura misturada pelo peso de cada uma (passo, trote, galope)
function andaduraDe(M) {
  const g = M.g, t = M.tr, p = Math.max(0, 1 - g - t), A = ANDADURAS, r = { off: [0, 1, 2, 3].map(n => A.passo.off[n] * p + A.trote.off[n] * t + A.galope.off[n] * g) };
  for (const k in A.passo) if (k !== 'off') r[k] = A.passo[k] * p + A.trote[k] * t + A.galope[k] * g;
  return r;
}
// movimento do corpo do cavalo (compartilhado com o cavaleiro e com as pernas): no galope, mais baixo quando as patas estão no
// chão e mais alto na fase no ar, a frente baixando no apoio das dianteiras; no trote, desce no meio de cada apoio diagonal e
// sobe no instante no ar; no passo, dois balanços pequenos
function corpoCavalo(c, k, g, tr, w, aT, desce = 0) {
  const T2 = Math.PI * 2;
  return { bob: BASE_CAV - desce + g * k * 0.045 * Math.cos(T2 * (c - 0.84)) + w * 0.014 * Math.sin(2 * T2 * c) + tr * aT * 0.03 * Math.cos(2 * T2 * (c - 0.45)),
    pitch: g * k * 0.05 * Math.sin(T2 * (c - 0.25)) + w * 0.012 * Math.sin(2 * T2 * c + 0.8) + tr * aT * 0.008 * Math.sin(2 * T2 * c + 0.6) };
}
// no campo (e.terreno), a inclinação do chão sob o cavalo, entre as patas de trás e as da frente (positivo: a frente mais baixa)
function rampaCavalo(e) {
  if (!e.terreno || typeof chaoCavalo !== 'function') return 0;
  if (e.__rampa === undefined) { const f = [Math.sin(e.yaw), Math.cos(e.yaw)], a = chaoCavalo(e.x + f[0] * 0.72, e.z + f[1] * 0.72), b = chaoCavalo(e.x - f[0] * 0.72, e.z - f[1] * 0.72); e.__rampa = Math.atan2(b - a, 1.44); }
  return e.__rampa;
}
function movCavalo(e) {
  // trote (e.trote, de 0 a 1): as patas em pares diagonais; amp: amplitude do passo (sem ela, a do galope)
  const c = e.passo || 0, k = e.galope ?? 1, tr = e.trote || 0, g = sstep(0.3, 0.75, k) * (1 - tr), w = (e.amp ?? k) * (1 - g) * (1 - tr), aT = e.amp ?? 1;
  const A = ANDADURAS, desce = (A.passo.desce * Math.max(0, 1 - g - tr) + A.trote.desce * tr + A.galope.desce * g) * (e.amp ?? Math.min(1, k * 1.5)); // em movimento, o corpo baixa: as juntas cedem no apoio
  const B = corpoCavalo(c, k, g, tr, w, aT, desce);
  return { c, k, g, tr, w, aT, desce, bob: B.bob, pitch: B.pitch + rampaCavalo(e) };
}
// ângulos do corpo, do pescoço e da cabeça do cavalo: os mesmos no desenho e nas contas das rédeas
function angCavalo(e) {
  const M = movCavalo(e), k = M.k, T2 = Math.PI * 2, bombeia = Math.sin(T2 * (M.c - 0.2)) * M.g * k;
  return { M, pitch: M.pitch + (e.pitch || 0) - (e.empina || 0) * 0.75,
    pesc: 0.05 + bombeia * 0.17 + (e.pescoco || 0) - (e.empina || 0) * 0.35 + Math.sin(T2 * 2 * M.c) * 0.04 * (e.amp ?? k) * (1 - M.g) * (1 - M.tr) + Math.sin(T2 * 2 * M.c + 1.2) * 0.025 * M.tr,
    cab: -0.05 - bombeia * 0.11 + (e.empina || 0) * 0.2 };
}
// um ponto do cavalo no mundo: v no corpo, no pescoço ou na cabeça (parte = 'corpo' | 'pescoco' | 'cabeca')
function cavaloMundo(e, v, parte = 'corpo') {
  const A = angCavalo(e), E = e.empina || 0; let w = v.slice();
  if (parte === 'cabeca') { w = _rx(w, A.cab); w = [w[0], w[1] + 0.36, w[2] + 0.5]; }
  if (parte !== 'corpo') { w = _rx(w, A.pesc); w = [w[0], w[1] + 0.18, w[2] + 0.8]; }
  w = [w[0], w[1] + 0.55 * E, w[2] + 0.7 * E]; w = _rx(w, A.pitch); w = [w[0], w[1] - 0.55 * E + ALT_CAV + A.M.bob, w[2] - 0.7 * E];
  w = _ry(w, e.yaw); return [w[0] + e.x, w[1] + e.y, w[2] + e.z];
}
// Cada pata no apoio: o casco plantado no chão (parado no mundo, enquanto o corpo passa por cima), plano; a perna alcança
// por cinemática inversa. Dianteira: a coluna (braço e canela) reta e a quartela cede com o peso (o boleto desce para trás);
// traseira: a quartela com a inclinação da andadura e o jarrete dobrado para trás. No fim do apoio, se a perna não alcança,
// o casco gira sobre a pinça (o talão sobe); no começo, pousa pelo talão. Devolve [coxa, canela, quartela, casco] e quanto
// o casco ficou acima do chão (só quando nem assim a perna alcança).
const _ikCav = { LC: Math.hypot(0.5 + 0.38 * Math.cos(0.03), 0.38 * Math.sin(0.03)), dC: Math.atan2(-0.38 * Math.sin(0.03), 0.5 + 0.38 * Math.cos(0.03)) };
function apoioCavalo(fr, pz, Zw, a, corpo, A, dy = 0) {
  const L = PERNA_CAV, h = ALT_CAV + corpo.bob, p = corpo.pitch, cp = Math.cos(p), sp = Math.sin(p);
  const paraCorpo = (zw, yw) => { const Y = yw - h; return [-Y * sp + zw * cp, Y * cp + zw * sp]; }; // (z, y) do mundo (em relação ao centro, chão em 0) para o corpo
  const P0 = [pz, L.py], qT = A.quartT0 + A.quartT1 * Math.sin(Math.PI * a); // inclinação da quartela traseira, no mundo
  // a junta da coroa (alto do casco) quando o casco gira beta sobre a borda (pinça no fim, talão no começo)
  const coroa = beta => { const borda = a > 0.5 ? 0.06 : -0.055, ez = Zw + borda, vz = -borda, vy = L.C; // do pé da borda até a coroa, com o casco plano
    const cb = Math.cos(beta), sb = Math.sin(beta); return paraCorpo(ez + vz * cb + vy * sb, dy + vy * cb - vz * sb); };
  let desceOmbro = 0;
  const resolve = (J, hoofAng) => {
    if (fr) { const LC = _ikCav.LC, th = A.boletoF0 + A.boletoF1 * Math.sin(Math.PI * a), dTh = Math.sqrt(LC * LC + L.Q * L.Q + 2 * LC * L.Q * Math.cos(th)), dz = J[0] - pz;
      desceOmbro = Math.min(0, Math.max(-0.14, (L.py - J[1]) - Math.sqrt(Math.max(0, dTh * dTh - dz * dz)))); // com o peso, o alto da perna sobe para dentro do peito (a escápula gira): o boleto cede só th
      const Q0 = [pz, L.py - desceOmbro], d = Math.hypot(J[0] - Q0[0], J[1] - Q0[1]), phi = Math.atan2(J[0] - Q0[0], -(J[1] - Q0[1]));
      let dirC, F; if (d >= LC + L.Q - 1e-6) { dirC = phi; } else { const al = Math.acos(Math.max(-1, Math.min(1, (LC * LC + d * d - L.Q * L.Q) / (2 * LC * d)))); dirC = phi - al; }
      F = [Q0[0] + LC * Math.sin(dirC), Q0[1] - LC * Math.cos(dirC)];
      const dirQ = d >= LC + L.Q - 1e-6 ? phi : Math.atan2(J[0] - F[0], -(J[1] - F[1])), sup = dirC - _ikCav.dC, inf = -0.03;
      return { ang: [sup, inf, dirQ - (sup + inf), hoofAng - dirQ], d, max: LC + L.Q };
    }
    const qb = qT + p, F = [J[0] - L.Q * Math.sin(qb), J[1] + L.Q * Math.cos(qb)], d = Math.hypot(F[0] - P0[0], F[1] - P0[1]), phi = Math.atan2(F[0] - P0[0], -(F[1] - P0[1]));
    let d1, d2; if (d >= L.L1 + L.L2 - 1e-6) { d1 = d2 = phi; } else { const al = Math.acos(Math.max(-1, Math.min(1, (L.L1 * L.L1 + d * d - L.L2 * L.L2) / (2 * L.L1 * d)))); d1 = phi - al;
      const H = [P0[0] + L.L1 * Math.sin(d1), P0[1] - L.L1 * Math.cos(d1)]; d2 = Math.atan2(F[0] - H[0], -(F[1] - H[1])); }
    return { ang: [d1, d2 - d1, qb - d2, hoofAng - qb], d, max: L.L1 + L.L2 };
  };
  const dist = beta => { const J = coroa(beta); if (fr) return Math.hypot(J[0] - P0[0], J[1] - P0[1]) - _ikCav.LC - L.Q; const qb = qT + p; return Math.hypot(J[0] - L.Q * Math.sin(qb) - P0[0], J[1] + L.Q * Math.cos(qb) - P0[1]) - L.L1 - L.L2; };
  let beta = 0; const bMax = a > 0.5 ? 0.55 : -0.4; // sobre a pinça, até 0,55 rad; sobre o talão, até 0,4
  if (dist(0) > 0) { if (dist(bMax) > 0) beta = bMax; else { let lo = 0, hi = bMax; for (let i = 0; i < 14; i++) { const m = (lo + hi) / 2; if (dist(m) > 0) lo = m; else hi = m; } beta = hi; } }
  const r = resolve(coroa(beta), p - beta);
  return { ang: [...r.ang, desceOmbro], sobra: Math.max(0, r.d - r.max) };
}
// ângulos das quatro pernas: [x e z do ombro ou do quadril, coxa (ou antebraço), canela, quartela, casco]
const PERNAS_CAV = [[-0.17, -0.72, false], [0.17, -0.72, false], [-0.17, 0.72, true], [0.17, 0.72, true]];
function lombada(w, pico, fim) { if (w <= 0 || w >= fim) return 0; if (w < pico) { const s = Math.sin(Math.PI / 2 * w / pico); return s * s; } const c = Math.cos(Math.PI / 2 * (w - pico) / (fim - pico)); return c * c; }
function pernasCavalo(e, M = movCavalo(e)) {
  const A = andaduraDe(M), passada = e.passada || A.passada, amp = e.amp ?? Math.min(1, M.k * 1.5), D = A.apoio * lerp1(1, Math.min(1, 5.2 / passada), M.g), Tr = D * passada; // a galope mais rápido, a passada cresce e cada pata fica menos tempo no chão
  const corpoEm = c => corpoCavalo(c, M.k, M.g, M.tr, M.w, M.aT, M.desce);
  const pitchE = (e.pitch || 0) + rampaCavalo(e);
  return PERNAS_CAV.map(([px, pz, fr], n) => {
    let ang;
    if (e.salto) { const s2 = e.salto; ang = fr ? [lerp1(0, 1.1, s2), lerp1(0, -1.9, s2), lerp1(0, -0.6, s2), lerp1(0, -0.2, s2), 0] : [lerp1(0, -0.9, s2), lerp1(0, 0.3, s2), lerp1(0, 0.2, s2), 0, 0]; } // dianteiras dobradas à frente, traseiras estendidas
    else if (e.empina && fr) ang = [0.9 * e.empina + Math.sin(T * 9 + px * 3) * 0.3 * e.empina, -1.6 * e.empina, -0.5 * e.empina, -0.3 * e.empina, 0];
    else if (e.empina && !fr) ang = [-0.6 * e.empina, 0.9 * e.empina, -0.2 * e.empina, 0.35 * e.empina, 0];
    else {
      const u = ((M.c - A.off[n]) % 1 + 1) % 1, zc = Tr * (fr ? A.poeF : A.poeT); // off: quando a pata pousa
      const corpoP = c => { const B = corpoEm(c); return { bob: B.bob, pitch: B.pitch + pitchE }; };
      const chaoAqui = (Zw, c) => { if (!e.terreno || typeof chaoCavalo !== 'function') return 0; const fz = Zw + (c - M.c) * passada, sy = Math.sin(e.yaw), cy = Math.cos(e.yaw); // onde o casco estará, no mundo (o corpo anda uma passada por ciclo)
        return chaoCavalo(e.x + px * cy + fz * sy, e.z - px * sy + fz * cy) - e.y; };
      const apoio = (a, c) => { const Zw = pz + zc - a * Tr; return apoioCavalo(fr, pz, Zw, a, corpoP(c), A, chaoAqui(Zw, c)); };
      if (u < D) ang = apoio(u / D, M.c).ang;
      else { // voo: dos ângulos em que a pata saiu do chão para os em que vai pousar (Hermite: sai e chega na mesma velocidade
        // do apoio, o casco andando para trás junto com o chão), com a dobra de cada junta
        const w = (u - D) / (1 - D), cS = M.c - (u - D), cP = M.c + (1 - u), h = 0.1, f = (1 - D) / D / h; // a velocidade das juntas nas pontas do apoio, medida em 10% dele (o giro do casco no talão e na pinça é rápido)
        const sai = apoio(1, cS).ang, sai0 = apoio(1 - h, cS - h * D).ang, poe = apoio(0, cP).ang, poe1 = apoio(h, cP + h * D).ang;
        const w2 = w * w, w3 = w2 * w, h00 = 2 * w3 - 3 * w2 + 1, h10 = w3 - 2 * w2 + w, h01 = -2 * w3 + 3 * w2, h11 = w3 - w2;
        const lim = m => Math.max(-2.5, Math.min(2.5, m)), base = [0, 1, 2, 3].map(i => h00 * sai[i] + h10 * lim((sai[i] - sai0[i]) * f) + h01 * poe[i] + h11 * lim((poe1[i] - poe[i]) * f));
        const dO = Math.min(0, Math.max(-0.14, lerp1(sai[4], poe[4], w * w * (3 - 2 * w)))); // o alto da perna volta ao lugar, sem passar
        const dobra = k => { const q = base.slice();
          if (fr) { q[0] += A.sobeF * lombada(w, 0.55, 1.0); q[1] += k * A.dobraF * lombada(w, 0.34, 0.86); q[2] += k * A.quartF * lombada(w, 0.26, 0.82); q[3] += k * A.cascoF * lombada(w, 0.24, 0.78); }
          else { q[0] += A.sobeT * lombada(w, 0.55, 1.0); q[1] += k * A.dobraT * lombada(w, 0.38, 0.9); q[2] += k * A.quartV * lombada(w, 0.28, 0.85); q[3] += k * A.cascoT * lombada(w, 0.24, 0.8); }
          return q; };
        // folga: no voo o casco não encosta no chão (rente na saída e na chegada, uns 8 cm no meio); se encostaria, dobra mais
        const cv = corpoP(M.c), hC = ALT_CAV + cv.bob, cp = Math.cos(cv.pitch), sp = Math.sin(cv.pitch), dyV = lerp1(chaoAqui(pz + zc - Tr, cS), chaoAqui(pz + zc, cP), w);
        const altura = q => { const L = PERNA_CAV; let y = L.py - dO, z = pz, t = 0, mn = 9; // o ponto mais baixo entre a coroa e o fundo do casco
          for (const [Lg, ai] of [[L.L1, 0], [L.L2, 1], [L.Q, 2], [L.C, 3]]) { t += q[ai]; y -= Lg * Math.cos(t); z += Lg * Math.sin(t); if (ai >= 2) mn = Math.min(mn, hC + y * cp - z * sp - dyV); } return mn; };
        const folga = 0.09 * Math.sin(Math.PI * w); // zero na saída e na chegada: sem salto
        let q = dobra(1); const h0 = altura(q);
        if (h0 < folga) { // dobra a mais o que falta, num passo contínuo (o braço sobe um pouco, o joelho ou o jarrete e o boleto dobram)
          const dir = fr ? [0.18, -1, -0.45, -0.1] : [0.1, 1, -0.5, -0.1], com = d => q.map((v, i) => v + dir[i] * d);
          const sens = Math.max(0.08, (altura(com(0.05)) - h0) / 0.05); q = com(Math.min(1.2, (folga - h0) / sens)); }
        ang = [...q, dO];
      }
      if (amp < 1) { const p0 = corpoEm(M.c).pitch + pitchE; ang = ang.map((v, i) => v * amp + (i === 3 ? p0 * (1 - amp) : 0)); } // parado: as pernas a prumo, o casco plano, o ombro no lugar
    }
    return [px, pz, ...ang];
  });
}
// o fundo de cada casco no mundo (e o boleto), pela mesma cadeia do desenho; n: 0 traseira E, 1 traseira D, 2 dianteira E, 3 dianteira D
function cascosCavalo(e) {
  const A = angCavalo(e), M = A.M, E = e.empina || 0, L = PERNA_CAV;
  return pernasCavalo(e, M).map(([px, pz, sup, inf, pas, cas, dO]) => {
    const seg = (Lg, a) => [-Lg * Math.cos(a), Lg * Math.sin(a)];
    const s1 = seg(L.L1, sup), s2 = seg(L.L2, sup + inf), s3 = seg(L.Q, sup + inf + pas), s4 = seg(L.C, sup + inf + pas + cas);
    const bol = [px, L.py - dO + s1[0] + s2[0], pz + s1[1] + s2[1]], cas2 = [px, bol[1] + s3[0] + s4[0], bol[2] + s3[1] + s4[1]];
    const mundo = v => { let w = [v[0], v[1] + 0.55 * E, v[2] + 0.7 * E]; w = _rx(w, A.pitch); w = [w[0], w[1] - 0.55 * E + ALT_CAV + M.bob, w[2] - 0.7 * E]; w = _ry(w, e.yaw); return [w[0] + e.x, w[1] + e.y, w[2] + e.z]; };
    return { casco: mundo(cas2), boleto: mundo(bol), angulo: sup + inf + pas + cas - A.pitch };
  });
}
function desenhaCavalo(C, e) {
  if (e.sombraY !== null) sombra(e.x, e.sombraY ?? e.y, e.z, 0.6, 1.25, e.yaw, 0.36);
  push();
  translate(e.x, e.y, e.z); rotateY(e.yaw);
  const A = angCavalo(e), M = A.M, ciclo = M.c, k = M.k, tr = M.tr, T2 = Math.PI * 2;
  translate(0, ALT_CAV + M.bob, 0);
  if (e.empina) { translate(0, -0.55 * e.empina, -0.7 * e.empina); }
  rotateX(A.pitch);
  if (e.empina) translate(0, 0.55 * e.empina, 0.7 * e.empina);
  model(C.corpo);
  // pescoço e cabeça: bombeiam ao contrário do corpo (equilíbrio); empinando, a cabeça sobe
  push(); translate(0, 0.18, 0.8); rotateX(A.pesc); model(C.pescoco);
  push(); translate(0, 0.36, 0.5); rotateX(A.cab); model(C.cabeca); pop();
  pop();
  // cauda: sobe no galope e ondula atrasada em relação ao corpo
  push(); translate(0, 0.25, -1.08); rotateX(-0.3 - k * 0.55 + Math.sin(T2 * (ciclo - 0.55)) * 0.14 * k); rotateZ(Math.sin(T2 * ciclo * 0.5 + 1) * 0.08 * k); model(C.cauda); pop();
  for (const [px, pz, sup, inf, pas, cas, dO] of pernasCavalo(e, M)) {
    push(); translate(px, PERNA_CAV.py - dO, pz); rotateX(-sup); model(pz > 0 ? C.pernaSup : C.pernaSupT); translate(0, -PERNA_CAV.L1, 0); rotateX(-inf); model(pz > 0 ? C.pernaInf : C.pernaInfT);
    translate(0, -PERNA_CAV.L2, 0); rotateX(-pas); model(C.quartela); translate(0, -PERNA_CAV.Q, 0); rotateX(-cas); model(C.casco); pop();
  }
  pop();
}
// uma chama: gota de base redonda e ponta fina, ao longo de y (de -1 a 1,05), para os furos do chapéu
function chamaGeo() { const m = new Malha(1); m.jit = 0; m.lathe(perfilLiso([[0, -1], [0.55, -0.86], [0.86, -0.52], [0.9, -0.15], [0.7, 0.3], [0.4, 0.68], [0.13, 0.94], [0, 1.05]], 2), 14, [255, 255, 255]); return m; }
// ---------------------------------------------------------------- arreios desenhados a cada quadro
// O pé de quem monta (a sola, no mundo), pela mesma cadeia do desenho das pernas
function peMundo(P, p, s) {
  const D = P.D, quad = s < 0 ? p.quadE : p.quadD, abre = s < 0 ? p.abreE : p.abreD, joe = s < 0 ? p.joelhoE : p.joelhoD;
  let v = [0, -D.canela - 0.035 * D.s, 0.03 * D.s]; v = _rx(v, joe); v = [v[0], v[1] - D.coxa, v[2]]; v = _rz(v, s * abre); v = _rx(v, -quad); v = [v[0] + s * D.larg, v[1], v[2]];
  v = _rx(v, (p.inclina || 0) * 0.4); v = [v[0], v[1] + alturaTronco(D, p), v[2]];
  const es = p.escala ?? 1; v = _ry(_rx(_rz([v[0] * es, v[1] * es, v[2] * es], p.rolo || 0), p.pitch || 0), p.yaw || 0);
  return [v[0] + p.x, v[1] + p.y, v[2] + p.z];
}
function maoMundo(P, p, s) { return doTronco(P, p, maoFK(P.D, s, s < 0 ? p.ombroE : p.ombroD, s < 0 ? p.abracoE : p.abracoD, s < 0 ? p.cotoveloE : p.cotoveloD, (s < 0 ? p.giroBE : p.giroBD) || 0)); }
// uma tira de couro reta entre dois pontos (largura w, espessura h)
function tira(a, b, w, h, cor) {
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(d[0], d[1], d[2]); if (L < 1e-4) return;
  push(); translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); rotateY(Math.atan2(d[0], d[2])); rotateX(-Math.asin(d[1] / L)); scale(w, h, L + h); md(G.cubo, { tinta: cor }); pop();
}
const COURO_REDEA = [0.25, 0.15, 0.09], LATAO_ESTRIBO = [0.62, 0.5, 0.3]; // tinta de 0 a 1
// Rédeas e estribos. P, p: quem monta (null: cavalo sem cavaleiro). As rédeas vão da argola do freio, pelo lado do
// pescoço, até as mãos; com o diamante nas duas mãos, as mãos longe do pescoço ou sem ninguém, ficam soltas sobre o
// pescoço, presas no pito da sela. Os estribos ficam sob os pés (ou pendurados, sem cavaleiro).
function desenhaArreios(e, P, p) {
  const lado = s => _ry([s, 0, 0], e.yaw);
  for (const s of [-1, 1]) {
    const L = lado(s), pe = P && p ? peMundo(P, p, s) : cavaloMundo(e, [s * 0.36, -0.3, 0.08]);
    const topo = cavaloMundo(e, [s * 0.27, 0.27, 0.04]), alto = [pe[0], pe[1] + 0.075, pe[2]];
    tira(topo, alto, 0.035, 0.008, COURO_REDEA); // o loro
    const a = [alto[0] - L[0] * 0.055, alto[1], alto[2] - L[2] * 0.055], b = [alto[0] + L[0] * 0.055, alto[1], alto[2] + L[2] * 0.055];
    const a2 = [a[0], pe[1] - 0.012, a[2]], b2 = [b[0], pe[1] - 0.012, b[2]];
    tira(a, a2, 0.016, 0.016, LATAO_ESTRIBO); tira(b, b2, 0.016, 0.016, LATAO_ESTRIBO); tira(a2, b2, 0.05, 0.012, COURO_REDEA); tira(a, b, 0.014, 0.014, LATAO_ESTRIBO);
  }
  // rédeas
  let maos = null; const solta = P && p ? (p.soltaRedeas ?? (p.peito ? 1 : 0)) : 1; // 0: nas mãos; 1: soltas sobre o pescoço
  if (P && p && solta < 1) {
    const mE = maoMundo(P, p, -1), mD = maoMundo(P, p, 1), cern = cavaloMundo(e, [0, 0.42, 0.5]);
    const perto = q => Math.hypot(q[0] - cern[0], q[1] - cern[1], q[2] - cern[2]) < 0.75;
    if (p.redeasMao) { const m = p.redeasMao < 0 ? mE : mD; maos = [m, m]; } // as duas rédeas numa mão só (a outra está ocupada)
    else if (p.maoD && !p.maoE) maos = perto(mE) ? [mE, mE] : null;
    else if (p.maoE && !p.maoD) maos = perto(mD) ? [mD, mD] : null;
    else if (!p.maoE && !p.maoD) maos = perto(mE) && perto(mD) ? [mE, mD] : perto(mE) ? [mE, mE] : perto(mD) ? [mD, mD] : null;
  }
  [-1, 1].forEach((s, n) => {
    const boca = cavaloMundo(e, _rx([s * (BOCA_CAVALO[0] + 0.008), BOCA_CAVALO[1], BOCA_CAVALO[2]], CAB_INCL), 'cabeca');
    const k = maos ? solta : 1, pito = cavaloMundo(e, [s * 0.035, 0.47, 0.22]), fim = maos ? [0, 1, 2].map(i => lerp1(maos[n][i], pito[i], k)) : pito;
    const meio = cavaloMundo(e, _rx([s * 0.17, lerp1(0.3, 0.18, k), lerp1(-0.08, 0.02, k)], 0.95), 'pescoco'); // o lado do pescoço (mais embaixo, soltas)
    const c = [2 * meio[0] - (boca[0] + fim[0]) / 2, 2 * meio[1] - (boca[1] + fim[1]) / 2 - 0.06 * k, 2 * meio[2] - (boca[2] + fim[2]) / 2];
    let ant = boca; const N = 10;
    for (let k = 1; k <= N; k++) { const t = k / N, q = [0, 1, 2].map(i => (1 - t) * (1 - t) * boca[i] + 2 * (1 - t) * t * c[i] + t * t * fim[i]); tira(ant, q, 0.016, 0.006, COURO_REDEA); ant = q; }
  });
  mat({});
}
// posição da sela no referencial do mundo (para montar o cavaleiro), com o mesmo balanço do cavalo
function poseCavaleiro(e, base) {
  const M = movCavalo(e), k = M.k, T2 = Math.PI * 2;
  const p = Object.assign(poseBase(), base || {});
  p.x = e.x; p.z = e.z; p.yaw = e.yaw;
  p.y = e.y + ALT_CAV + M.bob + 0.42 - 0.93 * 0.96;
  p.pitch = M.pitch * 0.8 + (e.pitch || 0) - (e.empina || 0) * 0.5;
  p.quadE = p.quadD = 1.05; p.abreE = p.abreD = 0.78; p.joelhoE = p.joelhoD = 1.35;
  p.inclina = 0.35 * k + Math.sin(T2 * (M.c - 0.45)) * 0.09 * M.g * k; p.bob = -(M.bob - BASE_CAV) * 0.35 + Math.sin(T2 * (M.c - 0.3)) * 0.03 * M.g * k; // o corpo do cavalo sobe e desce; quem monta, um pouco menos (sem contar a altura de base)
  p.ombroE = p.ombroD = 0.7 + Math.sin(T2 * (M.c - 0.2)) * 0.12 * M.g * k; p.cotoveloE = p.cotoveloD = 1.0; p.abracoE = p.abracoD = 0.15;
  p.cabPitch = -Math.sin(T2 * (M.c - 0.36)) * 0.06 * M.g * k; // a cabeça fica estável enquanto o corpo balança
  return p;
}

// ================================================================ PARTÍCULAS
// Sem estado: a posição de cada partícula é função do tempo, então avançar ou
// voltar o filme mostra sempre o mesmo resultado.
function particulas(spec) {
  const { taxa, vida, de, ate } = spec;
  const t0 = Math.max(spec.inicio ?? -1e9, (ate ?? T) - vida), t1 = Math.min(ate ?? T, spec.fim ?? 1e9);
  const i0 = Math.ceil(t0 * taxa), i1 = Math.floor(t1 * taxa);
  for (let i = i0; i <= i1; i++) {
    const te = i / taxa, idade = (ate ?? T) - te;
    if (idade < 0 || idade > vida) continue;
    spec.desenha(i, te, idade / vida, idade);
  }
}

// ================================================================ QUADRO
function draw() {
  if (!pronto) { background(0); return; }
  atualizaTempo();
  if (typeof roteiroQuadro === 'function') roteiroQuadro(T); // define CAM, AMB e cena
  renderiza();
  atualizaHUD();
  atualizaLegenda();
  ajustaQualidade();
}
// baixa a qualidade (2 → 1,5 → 1) se o filme passar uns 2,5 s tocando abaixo de 40 quadros por segundo; nunca sobe de novo
// (sem ir e voltar). A velocidade é medida no tempo (média de meio segundo), e um engasgo isolado (mais de 1 s num quadro,
// como na carga ou ao trocar de aba) não conta. Depois de cada troca, espera 2 s antes de medir outra vez
const AJUSTE_Q = { lento: 0, fps: 60 };
function ajustaQualidade() {
  if (!QUALIDADE_AUTO || qualidade <= 1 || !estaTocando() || !(deltaTime > 0) || deltaTime > 1000) return;
  const dt = deltaTime / 1000;
  AJUSTE_Q.fps += (1 / dt - AJUSTE_Q.fps) * (1 - Math.exp(-dt / 0.5));
  AJUSTE_Q.lento = AJUSTE_Q.fps < 40 ? AJUSTE_Q.lento + dt : Math.max(0, AJUSTE_Q.lento - dt * 0.5);
  if (AJUSTE_Q.lento > 2.5) { qualidade = qualidade > 1.5 ? 1.5 : 1; dimensionaFilme(); AJUSTE_Q.lento = -2; AJUSTE_Q.fps = 60; }
}
function renderiza() {
  fb.begin();
  const fc = AMB.ceuHoriz;
  background(fc[0] * 255, fc[1] * 255, fc[2] * 255);
  aplicaCamera();
  try { const r = p5.instance._renderer; window.__dbg = { cur: [r.states.curCamera.eyeX, r.states.curCamera.eyeY, r.states.curCamera.eyeZ].map(v => +v.toFixed(1)) }; } catch (e) { window.__dbg = String(e); }
  desenhaCeu();
  shader(SH.mat); uniformesLuz(); mat({});
  push(); scale(1, -1, 1);
  if (typeof desenhaCena === 'function') desenhaCena();
  pop();
  fb.end();
  // filme no meio, barras pretas em volta
  background(0);
  resetShader();
  push(); imageMode(CENTER); image(fb, 0, 0, larguraFilme, alturaFilme); pop();
  const s = SH.pos;
  const fx = (width - larguraFilme) / 2 / width, fy = (height - alturaFilme) / 2 / height;
  s.setUniform('uRes', [larguraFilme, alturaFilme]);
  s.setUniform('uFaixa', [fx, fy, 1 - fx, 1 - fy]);
  s.setUniform('uTempo', T); s.setUniform('uExpo', AMB.expo); s.setUniform('uContraste', AMB.contraste); s.setUniform('uSat', AMB.sat);
  s.setUniform('uVinheta', AMB.vinheta); s.setUniform('uGrao', AMB.grao); s.setUniform('uFade', AMB.fade); s.setUniform('uBloom', AMB.bloom);
  s.setUniform('uFlash', AMB.flash); s.setUniform('uCorFlash', AMB.corFlash); s.setUniform('uLift', AMB.lift); s.setUniform('uGanho', AMB.ganho); s.setUniform('uAberr', AMB.aberr); s.setUniform('uVelho', FILTRO_VELHO); s.setUniform('uLuneta', AMB.luneta || 0);
  filter(s);
}

// ================================================================ RELÓGIO E MÚSICA
const RELOGIO = { modo: PARAM.get('audio') || null, base: parseFloat(PARAM.get('t') || '0'), inicio: 0, tocando: false, vel: 1, offset: parseFloat(localStorageGet('db_offset') || '0') };
let audioEl = null;
function localStorageGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function localStorageSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
function agora() { return performance.now() / 1000; }
function atualizaTempo() {
  let t;
  if (RELOGIO.modo === 'arquivo' && audioEl) t = audioEl.currentTime;
  else t = RELOGIO.tocando ? RELOGIO.base + (agora() - RELOGIO.inicio) * (RELOGIO.vel || 1) : RELOGIO.base;
  T = Math.max(0, Math.min(DURACAO, t + RELOGIO.offset));
  if (RELOGIO.modo === 'none' && T >= DURACAO && RELOGIO.tocando) { RELOGIO.tocando = false; RELOGIO.base = DURACAO; }
}
function tocar() {
  if (RELOGIO.modo === 'arquivo' && audioEl) audioEl.play();
  else { RELOGIO.inicio = agora(); RELOGIO.tocando = true; }
}
function pausar() {
  if (RELOGIO.modo === 'arquivo' && audioEl) audioEl.pause();
  else { RELOGIO.base = T - RELOGIO.offset; RELOGIO.tocando = false; }
}
function estaTocando() {
  if (RELOGIO.modo === 'arquivo' && audioEl) return !audioEl.paused;
  return RELOGIO.tocando;
}
function irPara(t) {
  t = Math.max(0, Math.min(DURACAO, t - RELOGIO.offset));
  if (RELOGIO.modo === 'arquivo' && audioEl) audioEl.currentTime = t;
  else { RELOGIO.base = t; RELOGIO.inicio = agora(); }
}
// A música vem junto com o filme e é ela que dita o tempo: num computador lento caem quadros, mas o som não trava.
// Lê o arquivo inteiro antes, para o R recomeçar em qualquer lugar (no p5Front ele passa pelo service worker);
// abrindo o index.html direto do disco o navegador bloqueia o fetch, e aí o áudio usa o caminho do arquivo mesmo.
const MUSICA = 'diamond-jack.mp3';
async function preparaMusica() {
  if (location.protocol === 'file:') return MUSICA;
  try { const r = await fetch(MUSICA); if (!r.ok) throw new Error(r.status); return URL.createObjectURL(new Blob([await r.arrayBuffer()], { type: 'audio/mpeg' })); }
  catch (e) { return MUSICA; }
}
async function tocaMusica(pronta) {
  const semSom = () => { audioEl = null; RELOGIO.modo = 'none'; tocar(); }; // se o som falhar, o filme segue mudo em vez de parar
  audioEl = new Audio(await pronta); RELOGIO.modo = 'arquivo';
  audioEl.onended = mostraFim;
  audioEl.onerror = semSom;
  audioEl.play().catch(semSom);
}

// ================================================================ INTERFACE
function avisoCarregando(txt) { const el = document.getElementById('carregando'); if (el) el.textContent = txt; }
function iniciarInterface() {
  const abertura = document.getElementById('abertura');
  avisoCarregando('');
  document.body.classList.add('pronto');
  if (RELOGIO.modo === 'none' || PARAM.get('still') === '1') { abertura && abertura.remove(); if (PARAM.get('still') !== '1') tocar(); return; }
  const pronta = preparaMusica();
  document.getElementById('bt-musica').onclick = () => { abertura.remove(); tocaMusica(pronta); };
  document.getElementById('bt-mudo').onclick = () => { RELOGIO.modo = 'none'; abertura.remove(); tocar(); };
}
function mostraFim() {}
function keyPressed() {
  const foco = document.activeElement; if (foco && (foco.tagName === 'TEXTAREA' || foco.tagName === 'INPUT')) return;
  if (key === ' ') { estaTocando() ? pausar() : tocar(); return false; }
  if (key === 'r' || key === 'R') { irPara(0); tocar(); }
  if (key === 'f' || key === 'F') fullscreen(!fullscreen());
  if (key === 'd' || key === 'D') mostrarHUD = !mostrarHUD;
  if (key === 's' || key === 'S') { legendasLigadas = !legendasLigadas; localStorageSet('db_legendas', legendasLigadas ? '1' : '0'); }
  if (key === 'v' || key === 'V') { FILTRO_VELHO = FILTRO_VELHO ? 0 : 1; localStorageSet('db_filtro', FILTRO_VELHO ? 'velho' : ''); if (!estaTocando()) redraw(); }
  if (!mostrarHUD) return;
  const passo = keyIsDown(SHIFT) ? 5 : 1;
  if (keyCode === RIGHT_ARROW) irPara(T + passo);
  if (keyCode === LEFT_ARROW) irPara(T - passo);
  if (key === ']') { RELOGIO.offset += 0.05; localStorageSet('db_offset', RELOGIO.offset); }
  if (key === '[') { RELOGIO.offset -= 0.05; localStorageSet('db_offset', RELOGIO.offset); }
  if (key === 'e' || key === 'E') { const txt = JSON.stringify({ deslocamento: +RELOGIO.offset.toFixed(2), marcas: (window.AJUSTES || {}) }); console.log(txt); navigator.clipboard && navigator.clipboard.writeText(txt); }
  if (key === ',' || key === '.') { const p = planoAtual(); if (p) { window.AJUSTES = window.AJUSTES || {}; window.AJUSTES[p.id] = +(((window.AJUSTES[p.id] || 0) + (key === '.' ? 0.05 : -0.05)).toFixed(2)); } }
}
let fpsMedio = 60;
function atualizaHUD() {
  const el = document.getElementById('hud'); if (!el) return;
  fpsMedio = fpsMedio * 0.95 + frameRate() * 0.05;
  if (!mostrarHUD) { el.style.display = 'none'; return; }
  el.style.display = 'block';
  const p = typeof planoAtual === 'function' ? planoAtual() : null;
  const mm = Math.floor(T / 60), ss = (T % 60).toFixed(2).padStart(5, '0');
  el.innerHTML = `${mm}:${ss} · ${p ? p.id + ' — ' + p.nome : ''}<br>deslocamento ${RELOGIO.offset.toFixed(2)} s · ${Math.round(fpsMedio)} fps · ${RELOGIO.modo || ''}` +
    `<br><small>espaço pausa · ←/→ 1 s (shift 5 s) · [ ] desloca a música · , . desloca o plano · E exporta · D esconde</small>`;
}
// ================================================================ LEGENDAS DA MÚSICA
// Ficam na faixa preta de baixo do quadro de cinema, onde não cobrem a ação.
// Se a faixa for baixa demais (janela mais larga que o filme), sobem para a
// borda da imagem.
let legendasLigadas = PARAM.get('legendas') !== '0' && localStorageGet('db_legendas') !== '0';
const LEG = { el: null, txt: null, ultimo: '', geo: '' };
function legendaEm(t) { for (const l of (window.LEGENDAS || [])) if (l.texto && t >= l.a && t < l.b) return l; return null; }
function atualizaLegenda() {
  if (!LEG.el) { LEG.el = document.getElementById('letra'); if (!LEG.el) return; LEG.txt = LEG.el.firstElementChild; }
  const l = legendasLigadas && !document.getElementById('abertura') ? legendaEm(T) : null;
  const txt = l ? l.texto.replace(/\\n/g, '\n') : '';
  if (txt !== LEG.ultimo) {
    if (txt) { LEG.txt.textContent = txt; LEG.el.classList.remove('entra'); void LEG.el.offsetWidth; LEG.el.classList.add('entra'); }
    LEG.el.classList.toggle('visivel', !!txt); LEG.ultimo = txt;
  }
  const geo = [width, height, larguraFilme, alturaFilme].join();
  if (geo === LEG.geo) return; LEG.geo = geo;
  const barra = (height - alturaFilme) / 2, fs = Math.max(16, Math.min(34, larguraFilme * 0.0215)), duas = fs * 1.22 * 2 + 12;
  let base = barra >= duas ? barra / 2 - duas / 2 : barra + fs * 0.9; // distância da borda de baixo da janela
  base = Math.max(base, 10);
  const larg = larguraFilme * 0.8;
  Object.assign(LEG.el.style, { left: width / 2 + 'px', bottom: base + 'px', fontSize: fs + 'px', maxWidth: larg + 'px', minHeight: (barra >= duas ? duas : 0) + 'px' });
  LEG.el.classList.toggle('sobre', barra < duas);
}
// usado pelas capturas automáticas
window.__render = async function (t) { RELOGIO.modo = 'none'; RELOGIO.tocando = false; RELOGIO.base = t; RELOGIO.offset = 0; await redraw(); return T; };
