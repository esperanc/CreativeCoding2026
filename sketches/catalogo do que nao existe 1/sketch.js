// ─────────────────────────────────────────────────────────────
//  CATÁLOGO DO QUE NÃO EXISTE — Projeto final, parte 1
//
//  Um museu de objetos impossíveis. O visitante doa um objeto
//  dizendo para que ele serve (um verbo e um complemento), de que
//  é feito e de quando é. O sketch modela o objeto em 3D a partir
//  de uma gramática de peças (objeto.js), escolhe uma contradição
//  que o torna inutilizável e o cataloga com uma ficha (ficha.js).
// ─────────────────────────────────────────────────────────────

const PANEL_W = 400;     // largura da coluna da ficha
const CHAVE_LS = 'cne-acervo-v1';

let acervo = [];         // lista de doações (apenas os dados; o objeto é regenerado pela semente)
let atual = -1;          // índice do objeto em exibição
let obj = null, ficha = null;
let entrada = 0;         // 0→1: animação de entrada na vitrine
let giro = 0;

// acervo inicial: um objeto de cada verbo
const ACERVO_INICIAL = [
  { verbo: 'medir', complemento: 'a saudade', material: 'latão', epoca: 'início do séc. XX' },
  { verbo: 'abrir', complemento: 'as manhãs de segunda-feira', material: 'ferro fundido', epoca: 'séc. XIX' },
  { verbo: 'guardar', complemento: 'o eco de um nome', material: 'porcelana', epoca: 'década de 1950' },
  { verbo: 'chamar', complemento: 'quem já foi embora', material: 'cobre', epoca: 'data incerta' },
  { verbo: 'aquecer', complemento: 'as mãos de quem espera', material: 'cobre', epoca: 'década de 1980' },
  { verbo: 'esquecer', complemento: 'um rosto', material: 'vidro', epoca: 'futuro próximo' },
];

// ─────────────────────────────── setup / draw

function setup() {
  const c = createCanvas(canvasW(), canvasH(), WEBGL);
  c.parent('palco');
  pixelDensity(Math.min(2, displayDensity()));

  carregarAcervo();
  montarFormulario();
  mostrar(acervo.length - 1);
}

function draw() {
  background(22, 20, 24);
  entrada = Math.min(1, entrada + deltaTime / 900);
  giro += deltaTime * 0.00025;

  orbitControl(1, 1, 0.3);

  // luzes de museu: um foco de cima, um preenchimento frio e um contorno quente
  ambientLight(48, 46, 52);
  spotLight(255, 240, 215, 0, -520, 260, 0, 1, -0.45, Math.PI / 5, 18);
  directionalLight(70, 80, 105, 1, 0.3, -0.6);
  pointLight(140, 90, 60, -260, -120, -200);

  desenharSala();

  if (obj) {
    push();
    const e = easeOutBack(entrada);
    translate(0, -12, 0);
    rotateY(giro * Math.PI * 2);
    scale(e);
    desenharObjeto(obj, millis() / 1000);
    pop();
  }
}

function desenharSala() {
  noStroke();
  // chão
  push();
  translate(0, 186, 0);
  rotateX(Math.PI / 2);
  fill(34, 31, 34);
  specularMaterial(0);
  plane(3000, 3000);
  pop();
  // pedestal
  push();
  translate(0, 87, 0);
  fill(226, 222, 214);
  specularMaterial(20);
  shininess(4);
  box(150, 186, 150);
  pop();
  // tampo do pedestal levemente mais escuro
  push();
  translate(0, -9, 0);
  fill(200, 196, 188);
  box(156, 6, 156);
  pop();
}

function easeOutBack(x) {
  const c1 = 1.4, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

// ─────────────────────────────── acervo

function novaDoacao(d, numero) {
  const hoje = new Date();
  const base = {
    doador: '',
    ano: hoje.getFullYear(),
    data: hoje.toLocaleDateString('pt-BR'),
    ...d,
    numero,
  };
  base.seed = d.seed ?? hashStr([base.verbo, base.complemento, base.material, base.epoca, base.doador, numero].join('|'));
  return base;
}

function carregarAcervo() {
  acervo = ACERVO_INICIAL.map((d, i) =>
    novaDoacao({ ...d, doador: 'Acervo de fundação', data: '01/11/2026', ano: 2026 }, i + 1));
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE_LS) || '[]');
    for (const d of salvo) if (VERBOS[d.verbo]) acervo.push(d);
  } catch (e) { /* armazenamento indisponível: segue só com o acervo inicial */ }
}

function salvarAcervo() {
  try {
    localStorage.setItem(CHAVE_LS, JSON.stringify(acervo.slice(ACERVO_INICIAL.length)));
  } catch (e) { /* ignora */ }
}

function mostrar(i) {
  if (i < 0 || i >= acervo.length) return;
  atual = i;
  const d = acervo[i];
  obj = gerarObjeto(d);
  ficha = gerarFicha(d, obj);
  entrada = 0;

  // enquadra a câmera na altura do objeto
  const h = Math.max(110, obj.altura);
  const cy = -h * 0.42;
  camera(0, cy - h * 0.3, h * 1.55 + 130, 0, cy + 10, 0, 0, 1, 0);

  const el = document.getElementById('ficha');
  el.innerHTML = fichaHTML(ficha);
  el.classList.remove('nova');
  void el.offsetWidth;
  el.classList.add('nova');
  atualizarFichario();
}

function atualizarFichario() {
  const box = document.getElementById('fichario');
  box.innerHTML = '';
  acervo.forEach((d, i) => {
    const b = document.createElement('button');
    b.className = 'aba' + (i === atual ? ' ativa' : '');
    b.innerHTML = `<b>${String(d.numero).padStart(4, '0')}</b><span>${d.verbo}</span>`;
    b.title = `${d.verbo} ${d.complemento}`;
    b.onclick = () => mostrar(i);
    box.appendChild(b);
  });
  const ativa = box.querySelector('.ativa');
  if (ativa) ativa.scrollIntoView({ block: 'nearest', inline: 'center' });
}

// ─────────────────────────────── formulário de doação

function montarFormulario() {
  const selVerbo = document.getElementById('f-verbo');
  const inpComp = document.getElementById('f-comp');
  const selMat = document.getElementById('f-mat');
  const selEp = document.getElementById('f-ep');

  for (const v of Object.keys(VERBOS)) selVerbo.add(new Option(v, v));
  for (const m of MAT_PRINCIPAIS) selMat.add(new Option(m, m));
  for (const e of EPOCAS) selEp.add(new Option(e, e));

  const sugerir = () => {
    inpComp.placeholder = random(VERBOS[selVerbo.value].sugestoes);
  };
  selVerbo.onchange = sugerir;
  sugerir();

  document.getElementById('btn-doar').onclick = abrirModal;
  document.getElementById('btn-fechar').onclick = fecharModal;
  document.getElementById('btn-acaso').onclick = () => {
    selVerbo.value = random(Object.keys(VERBOS));
    inpComp.value = random(VERBOS[selVerbo.value].sugestoes);
    selMat.value = random(MAT_PRINCIPAIS);
    selEp.value = random(EPOCAS);
  };
  document.getElementById('form-doacao').onsubmit = (ev) => {
    ev.preventDefault();
    const d = novaDoacao({
      verbo: selVerbo.value,
      complemento: inpComp.value.trim() || inpComp.placeholder,
      material: selMat.value,
      epoca: selEp.value,
      doador: document.getElementById('f-doador').value,
    }, acervo.length + 1);
    // a hora da doação entra na semente: duas doações iguais geram objetos diferentes
    d.seed = hashStr(d.seed + '|' + Date.now());
    acervo.push(d);
    salvarAcervo();
    fecharModal();
    inpComp.value = '';
    mostrar(acervo.length - 1);
  };
}

function abrirModal() {
  document.getElementById('modal').classList.add('aberto');
  document.getElementById('f-comp').focus();
}
function fecharModal() {
  document.getElementById('modal').classList.remove('aberto');
}

function keyPressed() {
  const tag = document.activeElement && document.activeElement.tagName;
  if (tag === 'INPUT' || tag === 'SELECT') return;
  if (keyCode === LEFT_ARROW) mostrar(atual - 1);
  else if (keyCode === RIGHT_ARROW) mostrar(atual + 1);
  else if (key === 'd' || key === 'D') abrirModal();
  else if (keyCode === ESCAPE) fecharModal();
}

// ─────────────────────────────── layout

function canvasW() {
  return windowWidth > 760 ? windowWidth - PANEL_W : windowWidth;
}
function canvasH() {
  return windowWidth > 760 ? windowHeight : Math.round(windowHeight * 0.55);
}
function windowResized() {
  resizeCanvas(canvasW(), canvasH());
}
