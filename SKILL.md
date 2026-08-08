---
name: slidedown-gen
description: Use this skill whenever the user asks to create, write, draft, or expand a presentation, slide deck, "aula" (lecture), or "apresentação" in the SlideDown format (a markdown-based slide system with slides.md files, ::: layout blocks, and :: components). Trigger this any time the user mentions "slidedown", "slides.md", asks for a new presentation/lecture/deck from a topic or outline, asks to add a slide/module to an existing SlideDown course repo, or references an index.json listing presentations by folder — even if they don't say "slidedown" explicitly but the context (course repo with slides.md + index.json, ::: row/col syntax) makes it clear. Also use to review or fix existing slides.md files for correct SlideDown syntax.
---

# Gerador de apresentações SlideDown

Esta skill ensina a produzir apresentações no formato **SlideDown**
(https://github.com/esperanc/SlideDown), um sistema de slides baseado em
markdown com blocos de layout (`:::`) e componentes (`::`).

Consulte **`references/syntax.md`** sempre que precisar confirmar a sintaxe
exata (separadores de slide, `::: row/col/center/reveal`, `:: image`,
`:: youtube`, `:: iframe`, matemática KaTeX, formato do `index.json`). Não
tente adivinhar de memória — a gramática tem detalhes específicos (ex.:
`---` precisa ser exatamente três traços) que geram apresentações quebradas
se errados.

## Fluxo de trabalho

### 1. Entenda o pedido

O usuário normalmente fornece um **esboço/ementa** (lista de tópicos) e
espera que cada slide seja desenvolvido a partir disso — não conteúdo já
pronto, nem apenas um título solto. Se o pedido vier só com um tema muito
genérico ou, no outro extremo, com texto já pronto para cada slide, adapte-se,
mas o padrão esperado é: você recebe a ementa, você escreve o conteúdo de
cada slide.

Verifique se é:
- **Apresentação nova do zero** → siga os passos 2-6.
- **Adicionar/editar slides em um repo existente** → primeiro leia o
  `slides.md` (e o `index.json`) já existentes para casar o estilo (uso de
  `row`/`col`, tom, nível de detalhe, se usa "::: col" sem "row" etc.) antes
  de escrever conteúdo novo.
- **Revisão de sintaxe** → compare contra `references/syntax.md` e aponte/
  corrija erros (separador errado, `::`/`:::` trocados, atributos mal
  formatados).

### 2. Planeje os slides

A partir da ementa, decida a quebra em slides: normalmente um conceito por
slide, título curto (`#`) no topo, e uso de colunas (`::: row` + `::: col`)
quando há imagem + texto ou comparação lado a lado. Sugira um slide de
abertura (`::: center` com título e subtítulo) e um de encerramento
(ex.: "Obrigado!").

### 3. Escreva o `slides.md`

Siga a gramática de `references/syntax.md` à risca:
- Separador de slide: `---` sozinho na linha.
- Layout: `::: row`, `::: col` (prefira sempre envolver colunas em `row`,
  a menos que o usuário já tenha um estilo diferente estabelecido no
  arquivo existente), `::: center`, `::: reveal`.
- Componentes: `:: image src=... width=...`, `:: youtube id=...`,
  `:: iframe src=...`.
- Código com fences markdown normais; matemática com `$...$` / `$$...$$`.

### 4. Imagens e diagramas

O usuário quer que você **gere as imagens quando fizer sentido**:

- **Diagramas simples, esquemas, timelines, gráficos conceituais**: crie
  você mesmo um arquivo `.svg` (código SVG direto, sem depender de libs) e
  salve-o na pasta da apresentação, referenciando com
  `:: image src="nome.svg"`. Siga sempre estes padrões de qualidade:
  - **Fundo sempre explícito**, com um `<rect>` cobrindo todo o `viewBox`
    (ex.: `fill="#ffffff"`). Nunca deixe o fundo transparente/implícito —
    o SlideDown tem tema escuro por padrão, e um SVG sem fundo próprio
    herda o fundo da página, ficando ilegível.
  - **Nenhum texto pode ultrapassar os limites do `viewBox`.** Ao
    posicionar rótulos, estime a largura do texto (aprox. `0.6 × font-size
    × nº de caracteres`) e garanta que `x + largura` e `y` fiquem dentro
    dos limites; aumente o `viewBox` se necessário em vez de arriscar corte.
  - **Nenhum rótulo pode sobrepor linhas, setas ou outros elementos.**
    Posicione rótulos com folga (offset perpendicular à linha/seta mais
    próxima), nunca em cima do próprio traço. Ao terminar, percorra
    mentalmente cada texto e confirme que não cruza nenhuma linha.
  - **Notação matemática (vetores, subscritos, gregas)**: use apenas
    recursos que não dependem de *text shaping* avançado, porque motores
    de renderização de SVG frequentemente não posicionam corretamente
    caracteres combinantes (diacríticos Unicode, faixa U+0300–U+036F,
    incluindo a seta combinante U+20D7 para vetores) — o resultado é um
    retângulo vazado ("tofu"), e pior: isso pode contaminar a fonte usada
    no resto do mesmo elemento `<text>`, quebrando até glifos que
    funcionariam sozinhos (como subscritos). Portanto:
    - **Vetores**: use a convenção tipográfica de **negrito itálico**
      (`font-style="italic" font-weight="bold"`) em vez de seta
      combinante. É uma notação padrão e 100% segura (não depende de
      glifo especial).
    - **Subscritos** (P₁, P₂, x₀, etc.): os caracteres Unicode de
      subscrito (U+2080–U+2089) são seguros e podem ser usados
      normalmente — mas mantenha-os em elementos/`<tspan>`s que não
      contenham nenhum caractere combinante, para não arriscar a
      contaminação de fonte mencionada acima.
    - Se for indispensável desenhar uma seta sobre uma letra, desenhe-a
      como um `<path>`/`<line>` de verdade posicionado manualmente acima
      do texto (geometria, não glifo de fonte) — mais trabalho, mas
      garantidamente renderiza igual em qualquer visualizador.
    - Notação mais elaborada (frações, somatórios, integrais, matrizes
      com colchetes) não deve ser tentada em texto SVG de jeito nenhum —
      isso fica reservado para o texto do slide (KaTeX nativo do
      SlideDown) ou para uma ferramenta dedicada como o HopeDraw.
  - Estes SVGs feitos à mão servem para diagramas geométricos/esquemáticos
    simples. O usuário mantém uma ferramenta própria de desenho com
    suporte a KaTeX embutido, o **HopeDraw**
    (repo: https://github.com/esperanc/HopeDraw, app:
    https://esperanc.github.io/HopeDraw) — diagramas que dependem
    fortemente de notação matemática elaborada ficam melhor sendo
    refinados por ele nessa ferramenta; não tente competir em fidelidade
    matemática com um editor dedicado a isso.
- **Fotos reais / imagens de referência que você não pode desenhar**
  (ex.: foto histórica, screenshot de produto, retrato de pessoa): use a
  ferramenta de busca de imagens para encontrar candidatas e liste as
  opções para o usuário escolher e baixar manualmente — não invente um
  nome de arquivo que não existe. Deixe um comentário/placeholder claro no
  slides.md se for necessário (ex.: `<!-- TODO: adicionar foto de X -->`)
  até o usuário confirmar o arquivo.
- Nunca referencie um arquivo de imagem que não existe e que você não vai
  criar nem sinalizar como pendência.

### 5. Estrutura de pasta e `index.json`

Ao criar uma apresentação nova dentro de um curso existente:
1. Crie a pasta seguindo o padrão observado no repo (geralmente
   `"N - Título Curto"`, N = próximo número sequencial).
2. Salve `slides.md` (e quaisquer assets gerados) dentro dela.
3. Atualize o `index.json` da raiz do curso, adicionando
   `{"folder": "...", "title": "..."}` na posição correta do array
   `presentations` (mantendo a ordem lógica do curso).

Se não houver curso/repo existente (apresentação avulsa), gere só o
`slides.md` e os assets, sem se preocupar com `index.json`.

### 6. Controle de qualidade técnica do conteúdo

Isto é tão importante quanto a sintaxe correta — um slide sintaticamente
perfeito com conteúdo tecnicamente falho ou incompleto é uma falha da
skill. Antes de considerar o conteúdo pronto:

- **Respeite a ordem de dependência conceitual.** Não introduza um conceito
  que depende de outro ainda não apresentado (ex.: não fale de
  transformações afins ou coordenadas homogêneas antes de estabelecer a
  distinção entre ponto e vetor; não fale de translação sem deixar claro
  que ela só se aplica a pontos, não a vetores). Ao planejar a sequência de
  slides (passo 2), monte primeiro um grafo mental de pré-requisitos do
  tópico, não só uma lista de tópicos soltos.
- **Não simplifique listas de operações/conceitos por padrão.** Se o tópico
  tem um conjunto de operações ou casos canônicos (ex.: soma, subtração,
  multiplicação por escalar, produto escalar, produto vetorial,
  normalização), inclua o conjunto completo, não um subconjunto que "parece
  suficiente". Prefira listas completas mesmo que precise de um `reveal`
  para não sobrecarregar o slide visualmente.
- **Verifique cada afirmação tecnicamente**, frase por frase, como faria um
  revisor da área — não apenas se o slide "soa bem" ou "soa didático".
  Termos que parecem sinônimos mas não são (ponto vs. vetor, transformação
  linear vs. afim, etc.) merecem atenção redobrada.
- Se o tópico for de um domínio técnico/científico específico (matemática,
  física, ciência da computação, etc.) e você tiver alguma incerteza sobre
  precisão, é melhor pesquisar/conferir antes de escrever do que arriscar
  uma imprecisão — mesmo que isso signifique uma pausa a mais no processo.

### 7. Revise antes de entregar

Releia o `slides.md` gerado conferindo:
- Todo `---` está isolado numa linha própria.
- Todo `:::` aberto tem um `:::` de fechamento correspondente.
- Atributos com espaço estão entre aspas.
- Nomes de arquivo de imagem batem exatamente com os arquivos criados/
  esperados na pasta.

## Notas de comunicação

O usuário deste skill já conhece o formato e o repositório do curso — pode
usar termos como "slidedown", "slides.md", nomes de blocos (`row`, `col`,
`reveal`) diretamente, sem precisar reexplicar o básico a cada vez.
