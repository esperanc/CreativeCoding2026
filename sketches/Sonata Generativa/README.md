---
collection: artefato da semana/5
---

# Arte Geométrica Gerativa: Série Partitura Musical (p5.js)

## 🎼 Conceito e Proposta Visual

Esta obra gerativa transforma a notação musical tradicional em uma peça de arte abstrata dinâmica. A cada carregamento da página ou redimensionamento da janela, o algoritmo atua como um "compositor visual", gerando uma partitura inédita composta por pentagramas, claves, fórmulas de compasso, figuras rítmicas, acidentes, feixes e ligaduras expressivas.

---

## 📐 Conceitos Geométricos e Algorítmicos Aplicados

1. **Posição (Estrutura de Grade e Manuscrito):**
   - Distribuição espacial adaptativa em sistemas horizontais de pentagramas.
   - Cálculo proporcional de coordenadas Y para notas alinhadas às linhas e espaços da pauta.

2. **Dimensões (Escala Dinâmica):**
   - Proporcionalidade total baseada nas dimensões da janela (`windowWidth` e `windowHeight`).
   - Abertura dos compassos e espacamento entre linhas (`espacoLinha`) ajustados automaticamente para perfeita legibilidade visual.

3. **Inclinação e Direção (Transformações Vetoriais):**
   - Inclinação angular das cabeças ovais das notas (`rotate(-0.35)`).
   - Orientação vertical dinâmica de hastes (para cima ou para baixo conforme a posição da nota na pauta).
   - Curvas Bézier expressivas para ligaduras de expressão e bandeirolas de colcheias.

4. **Variabilidade (Geração Procedural):**
   - **Métricas:** Sorteio de fórmulas de compasso ($4/4$, $3/4$, $6/8$, $2/4$).
   - **Ritmo e Melodia:** Combinações aleatórias de durações rítmicas (semínimas, colcheias, mínimas) e alturas melódicas.
   - **Estética de Manuscrito:** Textura orgânica de papel vintage, pequenas oscilações "feitas à mão" nas linhas e paletas de cor inspiradas em partituras antigas e modernas.

---

## 🚀 Como Executar

1. Abra o editor online do p5.js em: [editor.p5js.org](https://editor.p5js.org/)
2. Copie o código do arquivo `sketch.js` e cole no editor.
3. Clique em **Play** (▶) para ver a partitura gerada.
4. Recarregue a página ou redimensione a janela para criar uma nova partitura musical instantaneamente!

---

## 🛠️ Estrutura do Arquivo ZIP

O arquivo ZIP contém na raiz (sem subpastas):
- `sketch.js`: Código-fonte completo em p5.js.
- `index.html`: Página HTML pronta para execução no navegador.
- `README.md`: Documentação técnica e conceitos do projeto.
