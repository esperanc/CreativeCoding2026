// Interface Macintosh: barra de menu, janelas, barra de ano e botão de som.
// Tudo em HTML/CSS; aqui só ligamos os eventos. Espera o DOM e tolera elementos ausentes.

function iniciarInterface() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ligarInterface);
  } else {
    ligarInterface();
  }
}

function ligarInterface() {
  const musica = document.getElementById('musica');
  const botaoSom = document.getElementById('botao-som');

  // Música: play() devolve uma Promise que pode falhar se o navegador bloquear.
  window.alternarSom = function () {
    if (!musica) return;
    if (musica.paused) {
      musica.play()
        .then(() => { if (botaoSom) botaoSom.textContent = '♪ som on'; })
        .catch(() => { if (botaoSom) botaoSom.textContent = '♪ som off'; });
    } else {
      musica.pause();
      if (botaoSom) botaoSom.textContent = '♪ som off';
    }
  };
  if (botaoSom) botaoSom.addEventListener('click', alternarSom);

  montarJanelaCompostos();

  // Itens do menu: Ajuda e Compostos abrem janelas; os outros registram o clique.
  document.querySelectorAll('.item-menu').forEach((item) => {
    item.addEventListener('click', () => {
      const menu = item.dataset.menu;
      if (menu === 'ajuda') abrirJanela('janela-ajuda');
      else if (menu === 'compostos') abrirJanela('janela-compostos');
      else if (menu === 'sair') voltarAoDesktop();
      else console.log(`menu "${menu}" ainda não implementado (próximas entregas)`);
    });
  });

  // Fechar janelas pelo quadradinho.
  document.querySelectorAll('.janela-mac .fechar').forEach((botao) => {
    botao.addEventListener('click', () => { botao.closest('.janela-mac').hidden = true; });
  });

  // Barra de ano: só mostra o valor nesta entrega.
  const ano = document.getElementById('ano');
  const anoValor = document.getElementById('ano-valor');
  if (ano && anoValor) {
    ano.addEventListener('input', () => { anoValor.textContent = ano.value; });
  }
}

function abrirJanela(id) {
  const janela = document.getElementById(id);
  if (janela) janela.hidden = false;
}

// Níveis escolhidos (0–100 por composto). Começam em "hoje". Quem lê isso é a entrega 2.
window.niveisEscolhidos = {};

function montarJanelaCompostos() {
  const lista = document.getElementById('lista-compostos');
  if (!lista || typeof COMPOSTOS === 'undefined') return;

  for (const c of COMPOSTOS) {
    const hojePct = porcentagemDe(c, c.hoje);
    niveisEscolhidos[c.id] = hojePct;
    const linha = document.createElement('div');
    linha.className = 'composto';
    linha.innerHTML = `
      <span class="nome">${c.nome}</span>
      <div class="trilho">
        <span class="marca-hoje" style="left:${hojePct}%"><i></i>hoje</span>
        <input type="range" min="0" max="100" value="${hojePct}" data-id="${c.id}" />
      </div>
      <span class="valor"></span>`;
    const barra = linha.querySelector('input');
    const valor = linha.querySelector('.valor');
    const mostrar = () => { valor.textContent = `${barra.value}%`; valor.title = formatarValor(c, Number(barra.value)); };
    barra.addEventListener('input', mostrar);
    barra.dataset.hoje = hojePct;
    mostrar();
    lista.appendChild(linha);
  }

  const resetar = document.getElementById('botao-resetar');
  if (resetar) {
    resetar.addEventListener('click', () => {
      lista.querySelectorAll('input').forEach((b) => {
        b.value = b.dataset.hoje;
        b.dispatchEvent(new Event('input'));
      });
    });
  }

  const aplicar = document.getElementById('botao-aplicar');
  if (aplicar) {
    aplicar.addEventListener('click', () => {
      lista.querySelectorAll('input').forEach((b) => { niveisEscolhidos[b.dataset.id] = Number(b.value); });
      document.getElementById('janela-compostos').hidden = true;
      console.log('níveis aplicados (sem efeito ainda):', niveisEscolhidos);
    });
  }
}
