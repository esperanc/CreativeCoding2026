---
title: Trab5-ProgCriativa-HAlmico
collection: artefato da semana/5
---

title: Terra Rachada tags: [p5js, generative, claude, worley, ruido-celular]
Um solo ressecado e rachado, visto de cima, com um único broto verde nascendo bem no meio de uma das fendas. Toda a superfície — as placas de barro e as rachaduras entre elas — é construída com ruído de Worley (ruído celular): em vez de somar ondas suaves como o ruído de Perlin, o Worley espalha pontos pelo plano e, para cada posição, mede a distância até o ponto mais próximo. O resultado tem células e nervuras — o padrão característico de solo rachado, pele ou pedra lascada.
O canvas é quadrado e se adapta ao tamanho da janela disponível; não há semente fixa de aleatoriedade, então cada execução sorteia um novo arranjo de placas e um novo lugar para o broto nascer.
Técnicas usadas:
distribuição dos pontos-semente por "melhor candidato": cada novo ponto é escolhido entre vários candidatos, ficando com o mais distante dos pontos já colocados — dá placas de tamanho parecido, sem alinhar numa grade, em vez do resultado desigual de um sorteio livre;
ruído de Worley: para cada posição, calcula-se a distância ao ponto-semente mais próximo (F1) e ao segundo mais próximo (F2). A diferença F2 − F1 pequena marca a fronteira entre placas — é ali que a rachadura aparece. Cada placa recebe também uma leve variação de tom (sorteada uma vez por placa) e um sombreado radial a partir do próprio centro;
busca local para plantar o broto exatamente sobre uma fenda de verdade, em vez de uma posição solta;
haste construída por segmentos curtos cujo ângulo se desvia aos poucos do anterior (em vez de sortear o ângulo do zero a cada passo), para parecer uma haste crescendo e não um raio quebrado; folhas desenhadas com beginShape()/vertex() e quadraticVertex() para a curvatura;
vinheta por círculos concêntricos de alfa decrescente — um brilho quente num canto, sugerindo sol a pino, e uma sombra fria no canto oposto.
Autor: Henrique Almico Dias da Silva
