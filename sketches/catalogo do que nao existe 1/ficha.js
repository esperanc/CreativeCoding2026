// ─────────────────────────────────────────────────────────────
//  ficha.js — a ficha catalográfica de cada objeto
//
//  Os campos imitam a catalogação de acervos museológicos:
//  número de tombo, denominação, classificação, procedência,
//  dimensões, estado de conservação, assuntos e notas.
//  A classificação usa a CDI — Classificação Decimal do Inexistente.
// ─────────────────────────────────────────────────────────────

const VERBOS = {
  abrir:    { nomes: ['Chave', 'Chave-mestra', 'Gazua'], classe: '621.4', area: 'Aberturas do intangível',
              sugestoes: ['as manhãs de segunda-feira', 'uma conversa encerrada', 'o cheiro da chuva', 'a porta de um sonho'] },
  medir:    { nomes: ['Aferidor', 'Instrumento de precisão', 'Sextante doméstico'], classe: '530.9', area: 'Grandezas sem unidade',
              sugestoes: ['a saudade', 'o silêncio entre duas pessoas', 'a distância até a infância', 'o peso de uma promessa'] },
  guardar:  { nomes: ['Relicário', 'Recipiente', 'Urna doméstica'], classe: '739.2', area: 'Contenção do imaterial',
              sugestoes: ['o eco de um nome', 'a luz de agosto', 'o que não foi dito', 'o último dia de férias'] },
  chamar:   { nomes: ['Corneta', 'Buzina de mão', 'Trombeta de chamada'], classe: '789.1', area: 'Convocações improváveis',
              sugestoes: ['quem já foi embora', 'o sono', 'os gatos do vizinho', 'a sorte'] },
  aquecer:  { nomes: ['Serpentina', 'Braseiro portátil', 'Escalfeta'], classe: '697.0', area: 'Calor para o que não esfria',
              sugestoes: ['as mãos de quem espera', 'uma lembrança fria', 'a água do mar', 'um nome esquecido'] },
  esquecer: { nomes: ['Prensa', 'Moldura de vazio', 'Pinça de memória'], classe: '153.12', area: 'Técnicas de esquecimento',
              sugestoes: ['um rosto', 'o próprio endereço', 'uma data importante', 'a letra de uma música'] },
};

const VERBO_SUBST = { abrir: 'Abertura', medir: 'Medição', guardar: 'Guarda', chamar: 'Chamamento', aquecer: 'Aquecimento', esquecer: 'Esquecimento' };

const EPOCAS = ['séc. XIX', 'início do séc. XX', 'década de 1950', 'década de 1980', 'data incerta', 'futuro próximo'];

const LUGARES = [
  'numa gaveta trancada em Petrópolis',
  'no fundo de um armário de cozinha, em Niterói',
  'num leilão de espólio no Centro do Rio de Janeiro',
  'entre as páginas de um dicionário',
  'numa estação de trem desativada',
  'na bagagem esquecida de um voo noturno',
  'num sótão em Ouro Preto',
  'enterrado no quintal de uma casa em Paquetá',
  'dentro de outro objeto, maior, que se perdeu',
];

const ESTADOS = [
  'Bom.',
  'Regular. Oxidação nas bordas.',
  'Frágil. Manusear com luvas e sem pressa.',
  'Incompleto. Faltam peças que talvez nunca tenham existido.',
  'Bom, embora pareça cansado.',
];

const MODOS_DE_USO = {
  abrir:    (c) => `Supõe-se que seja girada no ar, à altura do peito, ${contrair('de', c).replace(/^de /, 'diante de ').replace(/^(d[oa]s?) /, 'diante $1 ')}. Nenhum registro indica para que lado.`,
  medir:    (c) => `O ponteiro se move sozinho. Acredita-se que a leitura de ${c} só seja válida quando ninguém está olhando.`,
  guardar:  (c) => `Deve ser aberto apenas uma vez. Os herdeiros afirmam que ${c} continua lá dentro.`,
  chamar:   (c) => `Sopra-se pelo bocal pensando ${contrair('em', c)}. Não emite som audível; o efeito, se houver, é tardio.`,
  aquecer:  (c) => `A serpentina esquenta sem fonte de calor. Recomenda-se aproximar ${c} por no máximo três minutos.`,
  esquecer: (c) => `As garras se fecham sobre ${c} até que não reste nada entre elas. O que fica à deriva são sobras.`,
};

// contrai preposição + artigo: de + as → das, em + o → no
function contrair(prep, s) {
  const m = s.match(/^(o|a|os|as|um|uma|uns|umas)\s+(.*)$/i);
  if (!m) return `${prep} ${s}`;
  const art = m[1].toLowerCase(), resto = m[2];
  const tab = {
    de: { o: 'do', a: 'da', os: 'dos', as: 'das', um: 'de um', uma: 'de uma', uns: 'de uns', umas: 'de umas' },
    em: { o: 'no', a: 'na', os: 'nos', as: 'nas', um: 'num', uma: 'numa', uns: 'nuns', umas: 'numas' },
  };
  return `${tab[prep][art]} ${resto}`;
}
const NOMES_FEMININOS = new Set(['Chave', 'Chave-mestra', 'Gazua', 'Urna doméstica', 'Corneta', 'Buzina de mão',
  'Trombeta de chamada', 'Serpentina', 'Escalfeta', 'Prensa', 'Moldura de vazio', 'Pinça de memória']);

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function semArtigo(s) { return s.replace(/^(o|a|os|as|um|uma|uns|umas)\s+/i, ''); }

function gerarFicha(doacao, obj) {
  const R = makeRng(doacao.seed ^ 0x9e3779b9);
  const V = VERBOS[doacao.verbo];
  const comp = doacao.complemento.trim() || V.sugestoes[0];
  const nome = R.pick(V.nomes);
  const sub = R.int(1, 9);

  return {
    tombo: `CNE ${doacao.ano}/${String(doacao.numero).padStart(4, '0')}`,
    classe: `${V.classe}${sub > 5 ? '.' + sub : ''}`,
    area: V.area,
    denominacao: `${nome} para ${doacao.verbo} ${comp}`,
    material: [cap(obj.materiais.main), obj.materiais.sec, obj.materiais.accent]
      .filter((m, i, a) => a.indexOf(m) === i).join(', ') + '.',
    dimensoes: `${obj.dims.a} × ${obj.dims.l} × ${obj.dims.p} cm (A × L × P)`,
    epoca: doacao.epoca,
    procedencia: `Encontrad${NOMES_FEMININOS.has(nome) ? 'a' : 'o'} ${R.pick(LUGARES)}.`,
    estado: R.pick(ESTADOS),
    doador: doacao.doador.trim() || 'Anônimo',
    entrada: doacao.data,
    assuntos: [
      `${cap(semArtigo(comp))} — ${VERBO_SUBST[doacao.verbo]}`,
      'Objetos impossíveis',
      `${cap(obj.materiais.main)} — Artefatos`,
    ],
    notas: obj.notas.map((n) => cap(n) + '.'),
    uso: MODOS_DE_USO[doacao.verbo](comp),
  };
}

function fichaHTML(f) {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  return `
    <div class="f-top"><span>${esc(f.tombo)}</span><span class="f-cdi" title="Classificação Decimal do Inexistente">CDI ${esc(f.classe)}</span></div>
    <div class="f-title">${esc(f.denominacao)}</div>
    <div class="f-area">${esc(f.area)}</div>
    <dl>
      <dt>Material</dt><dd>${esc(f.material)}</dd>
      <dt>Dimensões</dt><dd>${esc(f.dimensoes)}</dd>
      <dt>Época</dt><dd>${esc(f.epoca)}</dd>
      <dt>Procedência</dt><dd>${esc(f.procedencia)}</dd>
      <dt>Conservação</dt><dd>${esc(f.estado)}</dd>
      <dt>Modo de uso</dt><dd>${esc(f.uso)}</dd>
      <dt>Notas</dt><dd>${f.notas.map(esc).join('<br>')}</dd>
      <dt>Assuntos</dt><dd>${f.assuntos.map((a, i) => `${i + 1}. ${esc(a)}`).join('<br>')}</dd>
      <dt>Doação</dt><dd>${esc(f.doador)}, ${esc(f.entrada)}</dd>
    </dl>
    <div class="f-hole"></div>`;
}
