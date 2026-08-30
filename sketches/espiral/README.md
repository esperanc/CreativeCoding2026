---
collection: artefato da semana/3
---

# Túnel Espiral Monocromático

**Autor:** Thalisson Braga - 123671198

## Sobre o Projeto
Este sketch foi desenvolvido para o Artefato da Semana 3 da disciplina de Programação Criativa. O objetivo do projeto é abandonar o uso de "números mágicos" e posicionamentos manuais, utilizando matemática, proporções e transformações afins para gerar uma ilusão de ótica procedural. 

A cada execução, o algoritmo gera um túnel geométrico único em tons monocromáticos, variando a quantidade de camadas, o grau de rotação da espiral e a direção da iluminação (do centro para as bordas ou vice-versa).

Como sugerido em aula, utilizei Inteligência Artificial generativa para auxiliar na estruturação matemática do laço de repetição e para iterar sobre os parâmetros visuais de contraste e espessura das linhas, garantindo um efeito de profundidade fluido.

## Conceitos Geométricos Aplicados

Para atender à especificação geométrica desta semana, o código foi construído em cima dos seguintes pilares:

* **Sistemas de Coordenadas e Transformações Afins:**
  * Em vez de calcular posições `X` e `Y` complexas, utilizei `translate(width / 2, height / 2)` para mover a origem `(0,0)` para o centro do canvas. 
  * A ilusão da espiral é criada girando o sistema de coordenadas com `rotate()` progressivamente a cada nova camada.
  * O uso de `push()` e `pop()` foi fundamental para isolar o sistema de coordenadas a cada iteração do laço, garantindo que o quadrado seja desenhado exatamente no centro girado, sem que a rotação afete o eixo do canvas de forma descontrolada.
  * O `rectMode(CENTER)` foi aplicado para que a rotação da forma geométrica (quadrado) ocorresse em seu próprio eixo central.

* **Proporções (`lerp` e `map`):**
  * **`lerp()`:** Utilizado para interpolar o tamanho dos quadrados. Em vez de diminuir o tamanho subtraindo um valor fixo, o `lerp()` calcula o tamanho exato da forma baseada na fração `t` (que vai de 0 a 1, do início ao fim do laço), garantindo uma escala perfeita do maior quadrado até o menor no centro.
  * **`map()`:** Aplicado intensamente no design monocromático. A função converte a posição da camada atual (fração `t`) em tons de cinza (indo de 10 a 255 ou vice-versa). Também foi usado para afinar a espessura da linha (`strokeWeight`) à medida que a forma se aproxima do centro.

* **Responsividade e Aleatoriedade:**
  * O desenho é completamente adaptável ao tamanho da tela graças ao uso de `windowWidth`, `windowHeight` e ao cálculo do tamanho máximo da forma geométrica baseado nas dimensões do canvas.
  * O `noLoop()` garante que a imagem gerada seja estática.

## Como visualizar
Para executar o projeto, abra o arquivo fonte em um ambiente como o [Editor Web do p5.js](https://editor.p5js.org/) ou abra o arquivo `index.html` gerado no navegador. Aperte "Play" ou recarregue a página múltiplas vezes para visualizar as diferentes configurações generativas geradas pelo algoritmo!
