---
collection: artefato da semana/2
---

# Trabalho 2 - Arte Generativa com Primitivas Geométricas

**Nome:** Arthur Cury Sampaio

## Descrição do Trabalho
Este projeto é uma composição visual gerativa abstrata desenvolvida utilizando a biblioteca **p5.js**. O trabalho utiliza diversas primitivas geométricas 2D (`circle`, `rect`, `triangle`, `arc`, `quad`, `line`) para construir uma tapeçaria visual modular dinâmica e interativa.

## Aspectos Técnicos e Requisitos Atendidos
* **Responsividade e Aspect Ratio:** O canvas é instanciado com `windowWidth` e `windowHeight`, adaptando a área quadrada da obra proporcionalmente ao menor eixo da janela (`min(windowWidth, windowHeight) * 0.9`) e centralizando-a na tela. Em caso de redimensionamento da janela, a função `windowResized()` atualiza a escala sem deformações.
* **Variabilidade e Generatividade:** O sketch não gera imagens estáticas fixas. A cada execução ou clique do mouse (`mousePressed()`), novas paletas de cores, divisões de grade (3x3 até 5x5) e combinações de formas geométricas são sorteadas.
* **Primitivas Utilizadas:**
  * `circle()`: Círculos concêntricos e pontos focais.
  * `rect()`: Fundos modulares e molduras.
  * `triangle()`: Triângulos opostos com rotação angular.
  * `arc()`: Setores circulares (estilo leque/pizza) e arcos concêntricos de sobreposição.
  * `quad()`: Polígonos de quatro vértices assimétricos.
  * `line()`: Tramas lineares paralelas e cruzamentos em X.

## Como Executar
Basta abrir o arquivo `index.html` em qualquer navegador web ou carregar os arquivos na ferramenta [p5Front](https://speranc.github.io/p5front/). Clique na tela para gerar uma nova composição a qualquer momento.
