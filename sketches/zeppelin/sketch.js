// =====================================================================
//  ZEPELIM PSICODÉLICO  —  releitura da capa de "Led Zeppelin" (1969)
//  Sketch estático em p5.js (colar no editor.p5js.org)
//
//  A mesma composição da capa (dirigível inclinado, fumaça no topo-
//  direita, torre, título, selo) reconstruída por regras, mas numa
//  chave onírica: tudo é DISTORCIDO por um campo de deformação (domain
//  warp), o preto vira prisma, a fumaça é grão arco-íris, e há aura-
//  mandala, aberração cromática e rastros. Determinístico (semente fixa).
// =====================================================================

const W = 1000, H = 1000;
const cx = 470, cy = 440, a = 445, b = 84, ang = 0.28;
const SMOKE = [
  [720,175,140],[815,140,120],[890,235,130],[650,250,120],[930,330,120],
  [770,300,120],[600,175,95],[860,95,95],[860,430,95],[815,345,95]
];

let _s = 424242 >>> 0;
function rng() {
  _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function setup() {
  createCanvas(W, H);
  noLoop();
  angleMode(RADIANS);
  colorMode(HSB, 360, 100, 100, 100);
}

function draw() {
  _s = 424242 >>> 0;
  bg();
  halo();
  rays();
  stipple(180000);
  sparkles(50);
  blimp();
  tower();
  ground();
  title();
  roundel();
}

// --- transformações e deformação ---
function toWorld(u, v) { return [cx + u*cos(ang) - v*sin(ang), cy + u*sin(ang) + v*cos(ang)]; }
function toFrame(x, y) { const dx=x-cx, dy=y-cy; return [dx*cos(ang)+dy*sin(ang), -dx*sin(ang)+dy*cos(ang)]; }
function warp(x, y) {
  const wx = x + 16*sin(y*0.012+1.3) + 9*sin(y*0.031+2.1);
  const wy = y + 16*sin(x*0.012+0.7) + 9*sin(x*0.031+4.2);
  return [wx, wy];
}

// --- campos de densidade (probabilidade de grão) ---
function past(x) { return 958 + 10*sin(x*0.02) + 6*sin(x*0.005); }
function smokeProb(x, y) { let g=0; for (const s of SMOKE){const dx=x-s[0],dy=y-s[1];g+=s[2]*s[2]/(dx*dx+dy*dy+1);} return Math.min(0.95,g*0.9); }
function zeppEdgeProb(x, y) { const f=toFrame(x,y); const e=(f[0]/a)**2+(f[1]/b)**2; if(e<=1.0||e>=1.55)return 0; return (1.55-e)/0.55*0.7; }
function groundProb(x, y) { const base=past(x)-40; if(y<base)return 0; return Math.max(0,Math.min(0.8,(y-base)/120*0.8)); }
function cornerProb(x, y) { return 0.5*Math.exp(-Math.hypot(x,y)/210) + 0.16*Math.exp(-Math.hypot(x-W,y-H)/230); }
function D(x, y) { return Math.max(smokeProb(x,y), zeppEdgeProb(x,y), groundProb(x,y), cornerProb(x,y), 0.02); }

// --- fundo: gradiente escuro que desliza no matiz ---
function bg() {
  noFill();
  for (let y = 0; y < H; y++) {
    const t = y / H;
    stroke(272 - 42*t, 68, 16 - 6*t);
    line(0, y, W, y);
  }
}

// --- halos concêntricos atrás do dirigível ---
function halo() {
  push(); translate(cx, cy); blendMode(ADD); noFill();
  for (let r = 470; r > 60; r -= 10) { const h=(r*1.6+20)%360; strokeWeight(2.4); stroke(h,85,60,10); ellipse(0,0,2*r,2*r); }
  pop(); blendMode(BLEND);
}

// --- coroa de raios (aura-mandala) ---
function rays() {
  push(); translate(cx, cy); blendMode(ADD);
  const n = 200;
  for (let i = 0; i < n; i++) {
    const th = i/n*TWO_PI;
    const L = 360 + 90*sin(6*th) + 26*sin(13*th);
    const h = degrees(th) % 360;
    strokeWeight(1.4); stroke(h,90,80,14);
    line(150*cos(th), 150*sin(th), L*cos(th), L*sin(th));
  }
  pop(); blendMode(BLEND);
}

// --- pontilhado arco-íris deformado ---
function stipple(n) {
  blendMode(ADD); noStroke();
  for (let i = 0; i < n; i++) {
    const sx = rng()*W, sy = rng()*H, t = rng();
    const pd = D(sx, sy);
    if (t < pd) {
      const p = warp(sx, sy);
      const h = (sx*0.32 + sy*0.28 + t*60) % 360;
      const sz = 0.8 + pd*2.2 + rng()*0.7;
      fill(h, 80, 100, 26);
      rect(p[0], p[1], sz, sz);
    }
  }
  blendMode(BLEND);
}

// --- faíscas flutuando ---
function sparkles(n) {
  push(); blendMode(ADD); noStroke();
  for (let i = 0; i < n; i++) {
    const x = rng()*W, y = rng()*H, h = rng()*360, s = 1.5 + rng()*4;
    for (let r = s; r > 0; r -= 1) { fill(h,50,100,35); circle(x,y,2*r); }
  }
  pop(); blendMode(BLEND);
}

// --- dirigível: contorno deformado, aro prismático, crista, rastros ---
function blimpOutline() {
  const pts = [];
  for (let d = 0; d < 360; d += 3) { const th=d*PI/180; const w=toWorld(a*cos(th),b*sin(th)); pts.push(warp(w[0],w[1])); }
  return pts;
}
function polyShape(pts) { beginShape(); for (const P of pts) vertex(P[0],P[1]); endShape(CLOSE); }
function blimp() {
  const pts = blimpOutline();

  // rastros (tracers)
  blendMode(ADD); noFill();
  for (let e = 1; e <= 3; e++) {
    push(); translate(e*6, -e*4); strokeWeight(2); stroke((e*80)%360, 85, 90, 14);
    polyShape(pts); pop();
  }
  blendMode(BLEND);

  // corpo escuro translúcido
  noStroke(); fill(268, 45, 10, 72); polyShape(pts);

  // aro prismático
  blendMode(ADD); noFill(); strokeWeight(3.2);
  for (let i = 0; i < pts.length; i++) {
    const P = pts[i], Q = pts[(i+1)%pts.length];
    stroke((i/pts.length*360)%360, 90, 100, 80);
    line(P[0], P[1], Q[0], Q[1]);
  }

  // crista iluminada derretida
  noStroke(); fill(200, 22, 100, 66);
  beginShape();
  for (let d = -160; d <= -20; d += 3) { const th=d*PI/180; const w=toWorld(a*cos(th),b*sin(th)); const P=warp(w[0],w[1]); vertex(P[0],P[1]); }
  for (let d = -20; d >= -160; d -= 3) { const th=d*PI/180; const w=toWorld(0.8*a*cos(th),0.6*b*sin(th)); const P=warp(w[0],w[1]); vertex(P[0],P[1]); }
  endShape(CLOSE);
  blendMode(BLEND);
}

// --- torre em treliça neon deformada ---
function lerpP(p, q, t) { return [p[0]+(q[0]-p[0])*t, p[1]+(q[1]-p[1])*t]; }
function tower() {
  blendMode(ADD); noFill();
  const baseL=[795,1000], baseR=[985,1000], topL=[905,600], topR=[950,600];
  const seg = (p, q, h, w) => { const P=warp(p[0],p[1]), Q=warp(q[0],q[1]); strokeWeight(w); stroke(h,85,95,70); line(P[0],P[1],Q[0],Q[1]); };
  seg(baseL, topL, 190, 5); seg(baseR, topR, 210, 5);
  const N = 9; let pL = baseL, pR = baseR;
  for (let i = 1; i <= N; i++) {
    const t = i/N; const l = lerpP(baseL,topL,t), r = lerpP(baseR,topR,t); const h = (t*300+180)%360;
    seg(l, r, h, 2.5); seg(pL, r, (h+40)%360, 2); seg(pR, l, (h+80)%360, 2); pL = l; pR = r;
  }
  seg(lerpP(topL,topR,0.5), [935,540], 60, 4);
  blendMode(BLEND);
}

// --- solo deformado com crista neon ---
function ground() {
  noStroke(); fill(255, 60, 6);
  beginShape(); vertex(0, H);
  for (let x = 0; x <= W; x += 6) { const P = warp(x, past(x)); vertex(P[0], P[1]); }
  vertex(W, H); endShape(CLOSE);

  blendMode(ADD); noFill(); strokeWeight(2.5); stroke(240, 80, 95, 60);
  beginShape();
  for (let x = 0; x <= W; x += 6) { const P = warp(x, past(x)); vertex(P[0], P[1]); }
  endShape();
  blendMode(BLEND);
}

// --- título com aberração cromática ---
function title() {
  blendMode(ADD); noStroke();
  textFont('sans-serif'); textStyle(BOLD); textSize(82); textAlign(LEFT, BASELINE);
  const off = [[-4, 0], [4, 240], [0, 120]];
  for (const o of off) { fill(o[1], 90, 100, 80); text('LED ZEPPELIN', 52 + o[0], 104); }
  blendMode(BLEND);
}

// --- selo circular autoral em arco-íris ---
function roundel() {
  const R = 58;
  push(); translate(905, 915); blendMode(ADD);
  noFill(); strokeWeight(6);
  for (let k = 0; k < 40; k++) { const h=(k/40*360)%360; stroke(h,90,100,70); arc(0,0,2*R,2*R, k/40*TWO_PI, (k+1)/40*TWO_PI); }
  noStroke();
  for (let k = 0; k < 2; k++) {
    push(); rotate(k*PI); fill((k*180+40)%360, 85, 100, 70);
    beginShape();
    for (let t = 0; t <= 1; t += 0.05) { const aa=t*PI*1.1, r=8+t*34; vertex(r*cos(aa), r*sin(aa)); }
    for (let t = 1; t >= 0; t -= 0.05) { const aa=t*PI*1.1, r=8+t*34+6*(1-t); vertex(r*cos(aa), r*sin(aa)); }
    endShape(CLOSE); pop();
  }
  pop(); blendMode(BLEND);
}
