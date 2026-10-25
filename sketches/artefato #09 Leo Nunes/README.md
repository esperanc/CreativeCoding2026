---
title: Jogo da Vida de Conway Em um Cubo V2
tags: [ChatGPT, 3D, Animation, Interactive, (almost)Complete]
collection: artefato da semana/9
---

Esta é uma versão melhorada do Artefato 5, gostaria de ter inserido mais coisas, mas procurei priorizar o que mais me incomodava, versão 1:

1. As regras implementadas, possibilitavam uma interação tridimencional entre as celulas pertencentes a diferentes faces, antes de tudo modifiquei o código para as células interagirem exatamente como como se estivessem sobre uma superfície.

2. Incluí uma imagem de John Conway(1937 - 2020) ao fundo, pois aquele fundo cinza era sem graça.

3. Coloquei uma movimentação de rotação no cubo quando não arrastado.

4. Adicionei um efeito temporal de células mortas há muito tempo ou vivas há muito tempo ficarem gradativamente mais pretas ou brancas respectivamente e também células "piscando" ficam cada vez mais vermelhas.

Paro por aqui, pois meu tempo acabou! E olha que usei o LLM, mas não trago nenhum prompt específico, só usei para refatorar trechos de código que fiz.

Se for desafiado a adicionar mais coisas no meu código eu faria:

1. Adicionaria mais controles. (atalhos no teclado para parar e recomençar a rotação automática e outras interações com a visualização do cubo)

2. Colocaria a opção de clicar em células para modificar seu estado.

3. Construiria um painel com controles em primeiro plano para reiniciar o "Jogo" com parâmetros controláveis(número de cubos, velocidade de transição, iniciar com padrões específicos já desenhados como gliders, xadrez, blinkers, tudo morto, tudo vivo...)

4. Adicionaria outras estruturas além de um cubo. 

O "[Jogo da Vida de Conway](https://pt.wikipedia.org/wiki/Jogo_da_vida)" é um conjunto de regras que atua sobre células que podem assumir 2 estados(vivo ou morto) e o próximo estado de uma célula depende do estado das células vizinhas e da própria célula:

* 3 vizinhos vivos = vive/nasce
* 2 vizinhos vivos = mantém o estado
* demais configurações = morre/não nasce

BROWSER: Apenas consegui rodar no FireFox.

BARRA DE ESPAÇO: Pausa ou despausa o "jogo".


Autor: Leonardo Nunes Guimarães Costa
