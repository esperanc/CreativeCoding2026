let telaAtual = 'boot';

function iniciarTelas() {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligarTelas);
  else ligarTelas();
}

function ligarTelas() {
  const relogios = document.querySelectorAll('.relogio');
  if (relogios.length) {
    const tic = () => {
      const agora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      relogios.forEach((r) => { r.textContent = agora; });
    };
    tic(); setInterval(tic, 1000);
  }

  const mapa = { 'mac-feliz': ICONE_MAC_FELIZ, disco: ICONE_DISCO, lixeira: ICONE_LIXEIRA, app: ICONE_APP, pasta: ICONE_PASTA, doc: ICONE_DOC };
  document.querySelectorAll('[data-icone]').forEach((el) => { el.innerHTML = mapa[el.dataset.icone] || ''; });

  iniciarBoot();

  document.querySelectorAll('.icone-desktop').forEach((ic) => {
    ic.addEventListener('click', () => {
      document.querySelectorAll('.icone-desktop').forEach((o) => o.classList.remove('selecionado'));
      ic.classList.add('selecionado');
    });
    ic.addEventListener('dblclick', () => { if (ic.dataset.abre === 'app') abrirApp(); });
  });
  const desktop = document.getElementById('desktop');
  if (desktop) desktop.addEventListener('click', (e) => {
    if (e.target === desktop) document.querySelectorAll('.icone-desktop').forEach((o) => o.classList.remove('selecionado'));
  });
}

function iniciarBoot() {
  const boot = document.getElementById('tela-boot');
  if (!boot) return mostrarTela('desktop');
  const etapas = [
    [800, () => boot.classList.add('ligado')],
    [3000, () => boot.classList.add('bemvindo')],
    [4800, () => mostrarTela('desktop')],
  ];
  const timers = etapas.map(([ms, fn]) => setTimeout(fn, ms));
  boot.addEventListener('click', () => { timers.forEach(clearTimeout); mostrarTela('desktop'); }, { once: true });
}

function mostrarTela(nome) {
  telaAtual = nome;
  document.body.dataset.tela = nome;
  if (nome === 'app') loop(); else noLoop();
}

function abrirApp() {
  mostrarTela('app');
  abrirJanela('janela-ajuda');
}

function voltarAoDesktop() {
  mostrarTela('desktop');
}
