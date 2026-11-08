---
title: Diamante Bruto
tags: [AI, Claude, 3d, webgl, modelagem, faroeste, filme, animação, música]
collection: artefato da semana/10
---

# Diamante Bruto

Autor: Angel Mansilla  
DRE: 123691897

Pra esse artefato eu tentei fazer algo bem grandioso. Me inspirei numa música que eu gosto muito, [Diamond Jack](https://www.youtube.com/watch?v=mRpiBvwKX6c), da Rachel Kim. Se você assistir o clipe, vai ver que ele trata de uma situação bem parecida com a que eu trouxe aqui, mas decidi reinterpretar em um cenário completamente diferente, no caso, o Velho Oeste. Com isso consegui criar cenas diferentes e clássicas também, como a do túnel.

Uma das cenas que eu mais gostei, e que foi bem difícil de fazer, foi a da bala pelo chapéu. Polir tudo isso também foi bem difícil, porque era bastante coisa pra polir até chegar em um resultado bom.

Eu ainda mudaria algumas coisas, principalmente no final, acho que tentaria deixar o último ato um pouco mais divertido. Mas senti que ficou bem legal e estou muito orgulhoso desse trabalho.

## Como usar

Abre o `index.html` no navegador, ou carrega o ZIP no p5Front e aperta Run, e clica em Assistir. O filme dura 3 minutos e 6 segundos, tem legendas em português e a música já vem junto no ZIP. Precisa de internet, porque o p5.js 2 (versão 2.3.4) vem do jsDelivr e as fontes vêm do Google Fonts.

Dá pra usar F pra tela cheia, Espaço pra pausar, R pra recomeçar, S pra ligar ou desligar as legendas e V pro filtro de película antiga. Em computador mais fraco a qualidade baixa sozinha, e como é a música que manda no tempo, o que cai são os quadros, o som não trava.

## Como fiz

Usei o modo WEBGL e o material da aula de modelagem 3D. Não importei nenhum modelo, todo objeto nasce de regras no código: o `modelos.js` tem uma classe `Malha` que junta os triângulos com caixas, extrusões e sólidos de revolução e transforma tudo em `p5.Geometry`, com vértices, faces, cores e coordenadas de textura, que depois são desenhados com `model()`. Assim saem o trem, os móveis do vagão, o terreno, o cânion e, no `elenco.js`, os personagens e os cavalos, que são várias malhas articuladas. São mais de 200 mil triângulos. As normais são calculadas no shader, a partir da posição de cada ponto da face, e o `roteiro.js` guarda a história: a coreografia, a luz e a câmera de cada plano.

## IA

Usei o Claude pra escrever o código e testar o filme. Eu dirigi: fui pedindo e aprovando as cenas, os ângulos de câmera e os tempos, e ajustei as legendas.

## Créditos

- Diamond Jack, de Rachel Kim: https://www.youtube.com/watch?v=mRpiBvwKX6c (a música é dela e vai no ZIP só para este trabalho da disciplina)
- Aula de Modelagem 3D: https://github.com/esperanc/CreativeCoding2026/blob/main/9%20-%20Modelagem%203D/slides.md
- p5.js: https://p5js.org/
- Fontes Rye e Cormorant Garamond: https://fonts.google.com/
