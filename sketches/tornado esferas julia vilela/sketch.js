function setup() {
  createCanvas(800, 800, WEBGL);   // WEBGL: necessário para sólidos 3D
  noLoop();                        // sketch estático: renderiza uma vez
  angleMode(RADIANS);
  //randomSeed(42);                  // jitter reprodutível (continua estático)
}

function draw() {
  background(38, 40, 50);

  // Iluminação fixa (a cena não anima).
  ambientLight(80);
  directionalLight(255, 255, 255, 0.3, 0.7, -0.6);
  pointLight(160, 185, 225, 0, -400, 400);

  // Câmera estática levemente inclinada.
  rotateX(-0.12);

  // --- ESPECIFICAÇÃO GEOMÉTRICA DO FUNIL ---
  const H = 580;             // altura total do tornado
  const yTop = -H / 2;       // topo (largo)
  const yBot = H / 2;        // base / ponta (estreita)
  const rBot = 10;           // raio do funil na ponta
  const rTop = 235;          // raio do funil no topo
  const funnelPow = 2.3;     // curvatura do perfil do funil (>1 = côncavo)
  const nSpheres = 260;      // esferas ao longo da hélice única
  const turns = 9;           // voltas completas da hélice

  noStroke();
  colorMode(HSB, 360, 100, 100);

  for (let i = 0; i < nSpheres; i++) {
    const t = i / (nSpheres - 1);    // 0 = base, 1 = topo

    // Raio do funil cresce com a altura (perfil côncavo via pow).
    const rFunnel = lerp(rBot, rTop, pow(t, funnelPow));

    // Pequeno ruído radial para dar aspecto orgânico de nuvem.
    const r = rFunnel + random(-rFunnel * 0.13, rFunnel * 0.13);

    // Posição sobre a hélice única: equações paramétricas.
    const ang = t * turns * TWO_PI;
    const x = r * cos(ang);
    const z = r * sin(ang);
    const y = lerp(yBot, yTop, t);

    // *** REGRA PRINCIPAL ***
    // Tamanho da esfera cresce com a distância ao eixo (o "olho").
    // Perto do olho -> pequena; longe do olho -> grande.
    const size = map(r, rBot, rTop, 3.5, 36);

    // Cor: mais clara e azulada quanto mais afastada do eixo.
    const hue = (t * 35 + 205) % 360;
    const bri = map(r, rBot, rTop, 55, 100);
    const col = color(hue, 28, bri);

    push();
    translate(x, y, z);
    ambientMaterial(col);
    sphere(size);
    pop();
  }

  // Ponta central de referência descendo até a base.
  push();
  ambientMaterial(210, 20, 60);
  translate(0, yBot - 20, 0);
  sphere(6);
  pop();
}