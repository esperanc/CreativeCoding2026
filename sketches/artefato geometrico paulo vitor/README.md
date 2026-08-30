---
collection: artefato da semana/3
---

# Entre Prédios: Geometria do Balanço

**Autor:** Paulo Vitor Couto

## Descrição

Este sketch é uma nova extensão do artefato **Entre Prédios**. A cena mostra um herói aracnídeo balançando entre prédios e segue uma especificação geométrica baseada em **posição, dimensões, inclinação e direção**.

## Especificação geométrica

1. A extremidade da teia é definida como o ponto de ancoragem **A**.
2. A posição do centro do herói **H** é calculada em coordenadas polares a partir de **A**, usando um raio `r` e um ângulo `theta`:

   `H = A + r * (cos(theta), sin(theta))`

3. A inclinação do corpo é tangente ao arco do balanço e vale `theta - 90 graus`.
4. Todas as dimensões do personagem são múltiplos de uma unidade `u`, calculada a partir da menor dimensão da janela. Por exemplo, o tronco mede `3,6u` por `5u`, enquanto a cabeça mede `2,5u` por `3u`.
5. Os prédios apresentam pequenas inclinações direcionadas para uma região central de fuga, reforçando a perspectiva.

A tecla **G** exibe a circunferência de raio `r`, os pontos **A** e **H** e o segmento usado na construção. Assim, a regra geométrica pode ser observada diretamente na imagem.

## Responsividade e variação

O canvas é criado com `windowWidth` e `windowHeight`. Posições e tamanhos dependem da largura, da altura ou de `min(width, height)`, evitando um tamanho fixo. A cada abertura, clique ou redimensionamento, mudam:

- a paleta do céu, as estrelas e a lua;
- as dimensões e janelas dos prédios;
- o lado da ancoragem, o raio e o ângulo da teia;
- a posição, a escala e a inclinação do personagem.

## Interação

- **Clique:** gera uma nova composição.
- **Tecla G:** mostra ou esconde a construção geométrica.
- **Tecla S:** salva a cena atual em PNG.
- **Redimensionar a janela:** adapta e recria a composição.

## Como executar

Abra `index.html` em um navegador com acesso à internet ou copie `sketch.js` para o editor online do p5.js.

## Arquivos

- `index.html`: carrega o p5.js e o sketch.
- `style.css`: faz o canvas ocupar toda a janela.
- `sketch.js`: contém o código comentado.
- `thumbnail.png`: imagem representativa do resultado.
