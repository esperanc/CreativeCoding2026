let estrelas = [];

function criarEstrelas() {
  estrelas = [];
  const raioCeu = RAIO * 20;
  for (let i = 0; i < QTD.estrelas; i++) {
    const theta = random(TWO_PI);
    const phi = Math.acos(random(-1, 1));
    const sorte = random();
    let cor = [255, 255, 255];
    if (sorte < 0.08) cor = [190, 210, 255];      
    else if (sorte < 0.15) cor = [255, 200, 215]; 
    estrelas.push({
      pos: pontoNaEsfera(theta, phi, raioCeu),
      tamanho: random() < 0.15 ? random(3, 5) : random(1.5, 3.2), 
      cor,
      fase: random(TWO_PI),
    });
  }
}

function desenharEstrelas() {
  push();
  noLights();
  rotateY(frameCount * 0.0002);
  for (const e of estrelas) {
    const brilho = 200 + 55 * Math.sin(frameCount * 0.02 + e.fase);
    stroke(e.cor[0], e.cor[1], e.cor[2], brilho);
    strokeWeight(e.tamanho);
    point(e.pos[0], e.pos[1], e.pos[2]);
  }
  pop();
}


const COMETA = {
  intervaloMin: 6 * 60,  
  intervaloMax: 10 * 60,
  distancia: 18,         
  velocidade: 0.035,     
  duracao: 160,          
  rastro: 28,            
};
let cometa = null;
let proximoCometa = 180;

function lancarCometa() {
  const eixo = normalizar([random(-1, 1), random(-1, 1), random(-1, 1)]);
  const { u, v } = baseDaNormal(eixo);
  const ang = random(TWO_PI);
  const dir = [u[0] * Math.cos(ang) + v[0] * Math.sin(ang), u[1] * Math.cos(ang) + v[1] * Math.sin(ang), u[2] * Math.cos(ang) + v[2] * Math.sin(ang)];
  const meio = RAIO * COMETA.distancia;
  const comp = COMETA.velocidade * RAIO * COMETA.duracao;
  cometa = {
    pos: [eixo[0] * meio - dir[0] * comp / 2, eixo[1] * meio - dir[1] * comp / 2, eixo[2] * meio - dir[2] * comp / 2],
    dir,
    vida: 0,
  };
}

function desenharCometa() {
  if (!cometa) {
    if (--proximoCometa <= 0) lancarCometa();
    return;
  }
  const c = cometa;
  const passo = COMETA.velocidade * RAIO;
  c.pos = [c.pos[0] + c.dir[0] * passo, c.pos[1] + c.dir[1] * passo, c.pos[2] + c.dir[2] * passo];
  c.vida++;

  const t = c.vida / COMETA.duracao;
  const fade = Math.min(1, Math.min(t, 1 - t) * 6);

  push();
  noLights();
  for (let k = 0; k < COMETA.rastro; k++) {
    const atras = k * passo * 0.9;
    const alfa = 255 * fade * (1 - k / COMETA.rastro);
    stroke(220, 235, 255, alfa);
    strokeWeight(k === 0 ? 5 : 3.5 - 2.5 * (k / COMETA.rastro));
    point(c.pos[0] - c.dir[0] * atras, c.pos[1] - c.dir[1] * atras, c.pos[2] - c.dir[2] * atras);
  }
  pop();

  if (c.vida >= COMETA.duracao) {
    cometa = null;
    proximoCometa = Math.floor(random(COMETA.intervaloMin, COMETA.intervaloMax));
  }
}
