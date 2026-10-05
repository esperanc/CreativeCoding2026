---
title: Typography of the Obra Dinn
tags: [generative, tipografia, AI, Claude, Obra Dinn]
collection: artefato da semana/7
---

Um sketch em que uma cena inteira é construída apenas com palavras. A estética vem de *Return of the Obra Dinn*: duas cores, contraste forte, luz que revela o espaço e sombras feitas de pontilhado.

## Como interagir

- **Mova o mouse:** a câmera se desloca um pouco (paralaxe) e uma lanterna ilumina a região sob o cursor.
- **Clique:** inverte a paleta, entre escuro com letras claras e claro com letras escuras.

## Processo criativo

### 1. A ideia

O ponto de partida foi a tipografia como matéria de construção. Em vez de desenhar uma sala e depois pôr texto em cima, a ideia era que o texto fosse a sala. Cada objeto é feito da palavra que o nomeia, então o que se lê e o que se vê são a mesma coisa.

O *Obra Dinn* serviu de referência por três razões:

- A paleta é de 1 bit. Cada ponto está ligado ou desligado, o que combina bem com letras, que também são formas de contraste puro.
- As superfícies são sugeridas por linhas e por pontilhado, e não por sombreamento suave. As palavras podem fazer o papel dessas linhas.
- A luz decide o que se vê. Uma cena escura que só aparece aos poucos dá o clima de investigação e memento mori do jogo.

### 2. Primeira versão: 2D

Comecei com uma sala desenhada em duas dimensões. As palavras eram posicionadas ao longo de linhas e preenchiam quadriláteros para sugerir os objetos. O resultado ficou abstrato demais. As palavras se sobrepunham, a perspectiva era só aproximada e os objetos viravam manchas de texto.

### 3. Segunda versão: objetos mais claros

Reduzi o ruído. Cada objeto passou a ter uma palavra e uma família de fontes próprias, o fundo ficou discreto e os móveis ganharam silhuetas reconhecíveis. A luz ficou mais suave e o dither passou a atuar sobretudo no fundo. Ainda assim, a perspectiva continuava forçada, desenhada à mão.

### 4. Versão atual: perspectiva real

A foto de referência do jogo, o convés do navio, mostrou o que faltava. O que dá a sensação de espaço ali é a perspectiva com um ponto de fuga: tábuas que convergem, cordas que fogem, elementos que diminuem com a distância. Por isso mudei a abordagem. Em vez de posicionar palavras em 2D, passei a construí-las no espaço 3D e deixar uma câmera projetá-las.

## Como funciona

**Palavras no espaço.** Cada palavra tem uma posição 3D em metros, uma direção de leitura, um vetor de "cima" (para onde apontam as hastes das letras) e uma altura. O chão, por exemplo, é uma superfície com fileiras de "tábua" e "convés" empilhadas a intervalos constantes. A perspectiva vem de graça: as fileiras convergem para o fundo e as letras encolhem com a distância.

**Projeção.** A cada frame, cada palavra é projetada com uma câmera de pinhole simples (`x' = f·x / z`). Para que o texto acompanhe o plano onde está, calculo como a direção de leitura e a direção "para cima" aparecem na tela e aplico isso como uma matriz de transformação (`applyMatrix`). É isso que deforma as letras e as faz parecer coladas nas superfícies.

**Oclusão.** Superfícies são desenhadas de trás para frente (algoritmo do pintor). Antes das palavras de cada face, o polígono dela é preenchido com a cor do fundo, o que esconde o que está atrás.

**Luz e dither.** Cada palavra tem um limiar aleatório fixo. Se o brilho no ponto em que ela está passar do limiar, ela aparece, e senão some. Isso é um dither estocástico feito com palavras no lugar de pixels. O brilho depende de:
- a distância ao cursor (a lanterna);
- fontes de luz no espaço 3D: a lanterna e a lua;
- um leve desvanecimento com a distância, para dar profundidade.

**Níveis de visibilidade.** Objetos (`obj`) ficam quase sempre visíveis. Estruturas (`struct`) como cantos, vigas e rodapés também. O fundo (`bg`) fica esparso e só aparece sob a luz. A lua (`moon`) está sempre acesa.

**A lua.** A lua é feita de anéis concêntricos da palavra "lua". O céu em volta é pontilhado, mais denso perto da lua, como o céu da imagem de referência.

**Paleta.** Verde-escuro quase preto e branco-esverdeado, no tom das imagens do jogo (`#1e2218` e `#e3f5ee`).

## Para modificar

Tudo está na função `build()` do `sketch.js`, com algumas ferramentas:

- `surf(palavra, origem, vetorA, vetorB, altura, cima, fontes, nível, opções)` preenche uma superfície com fileiras de palavras.
- `rail(...)` faz uma faixa fina, como moldura, perna ou aresta.
- `circ(...)` coloca palavras em anel ou arco.
- `boxy(...)` monta uma caixa com as faces visíveis.
- `LIGHTS` define as fontes de luz (posição, alcance, força, se oscila).
- `FONTS`, ou melhor `SER`, `MONO`, `SANS`, `IMP` e `SCR`, definem as famílias tipográficas usadas.

## Referências

- *Return of the Obra Dinn*, de Lucas Pope: paleta de 1 bit, dither e linhas.
