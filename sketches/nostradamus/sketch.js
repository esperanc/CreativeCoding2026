// Orquestra o setup e o draw. Cada camada do mundo vive no seu próprio arquivo.

// O site de entrega pode carregar os .js fora de ordem; o setup espera todos chegarem.
function modulosFaltando() {
  const presentes = {
    'config.js': typeof SEED !== 'undefined' && typeof NOISE !== 'undefined',
    'geometria.js': typeof criarIcosfera === 'function',
    'camera.js': typeof iniciarCamera === 'function',
    'espaco.js': typeof criarEstrelas === 'function',
    'luz.js': typeof acenderSol === 'function',
    'planeta.js': typeof criarPlaneta === 'function',
    'cidades.js': typeof criarCidades === 'function',
    'polos.js': typeof criarPolos === 'function',
    'vegetacao.js': typeof criarVegetacao === 'function',
    'fauna.js': typeof criarFauna === 'function',
    'atmosfera.js': typeof criarNuvens === 'function',
    'orbita.js': typeof criarOrbita === 'function',
    'interface.js': typeof iniciarInterface === 'function',
    'dados.js': typeof COMPOSTOS !== 'undefined',
    'icones.js': typeof ICONE_APP !== 'undefined',
    'telas.js': typeof iniciarTelas === 'function',
  };
  return Object.keys(presentes).filter((k) => !presentes[k]);
}

function esperarModulos(limiteMs = 10000) {
  return new Promise((resolve, reject) => {
    const inicio = Date.now();
    (function checar() {
      const faltando = modulosFaltando();
      if (faltando.length === 0) return resolve();
      if (Date.now() - inicio > limiteMs) {
        return reject(new Error(`Arquivos não carregados: ${faltando.join(', ')}`));
      }
      setTimeout(checar, 50);
    })();
  });
}

async function setup() {
  await esperarModulos();

  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
  randomSeed(SEED);
  noiseSeed(SEED);
  iniciarCamera();
  criarEstrelas();
  criarPlaneta();
  criarCidades();   // reserva as faces das cidades
  criarPolos();     // bases nos polos e fraturas no gelo
  criarFauna();     // reserva o cantinho de cada bicho
  criarBarcos();
  criarVegetacao(); // árvores só nas faces que sobraram
  criarRios();
  criarNuvens();
  criarOrbita();
  iniciarInterface();
  iniciarTelas();
}

function draw() {
  background(0);
  atualizarCamera();
  desenharEstrelas();
  desenharCometa();
  acenderSol();
  desenharPlaneta();
  desenharCidades();
  desenharPolos();
  desenharVegetacao();
  desenharFauna();
  desenharBarcos();
  desenharRios();
  desenharNuvens();
  desenharOrbita();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  ajustarPerspectiva();
}
