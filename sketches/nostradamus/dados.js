const COMPOSTOS = [
  { id: 'co2',           nome: 'CO₂',           unidade: 'ppm',            pre: 280,  hoje: 425,  pior: 1100, casas: 0 },
  { id: 'microplastico', nome: 'Microplástico', unidade: 'tri. partículas', pre: 0,    hoje: 170,  pior: 600,  casas: 0 },
  { id: 'desmatamento',  nome: 'Desmatamento',  unidade: 'M ha/ano',       pre: 0,    hoje: 10,   pior: 25,   casas: 1 },
  { id: 'lixoEspacial',  nome: 'Lixo espacial', unidade: 'mil objetos',    pre: 0,    hoje: 36.5, pior: 150,  casas: 1 },
  { id: 'nh3',           nome: 'NH₃',           unidade: 'zonas mortas',   pre: 0,    hoje: 400,  pior: 1200, casas: 0 },
  { id: 'so2',           nome: 'SO₂',           unidade: 'Mt/ano',         pre: 0,    hoje: 75,   pior: 200,  casas: 0 },
  { id: 'pfas',          nome: 'PFAS',          unidade: '% pessoas',      pre: 0,    hoje: 98,   pior: 100,  casas: 0 },
];

function porcentagemDe(c, valor) {
  return Math.round(((valor - c.pre) / (c.pior - c.pre)) * 100);
}
function valorDe(c, pct) {
  return c.pre + (pct / 100) * (c.pior - c.pre);
}
function formatarValor(c, pct) {
  return `${valorDe(c, pct).toFixed(c.casas)} ${c.unidade}`;
}
