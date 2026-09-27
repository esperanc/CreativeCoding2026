---
title: Homens derrubam painel de vidro
tags: [generative, ai, gemini, construction, glass, agent, fracture, emergence]
collection: artefato da semana/6
---

Tive bastante dificuldade em pensar em algo, perguntei para o Gemini sobre alguns algoritmos que usem o conceito de emergência e ele mencionou um sobre fractais. Tive, então, a ideia de fazer algo inspirado por aquelas cenas muito comuns em alguns filmes de dois homens carregando um painel de vidro que eles derrubam e quebram.

A animação consiste em dois homens em um canteiro de obras carregando um painel de vidro. Um deles derruba sua ponta, fazendo o outro soltar logo em seguida. O vidro cai no chão e estilhaça.

A cidade no background, o guindaste e os homens são desenhados com as primitivas simples de formas. Os detalhes no chão usam random() para serem mais naturais. A quebra do painel é feita usando agentes que atuam como as "pontas" das rachaduras. Quando o vidro bate no chão, esses agentes nascem no ponto de impacto e se propagam pela superfície seguindo regras locais. Eles avançam criando traços, ocasionalmente se bifurcam em ângulos secos para gerar novas ramificações, e param de crescer imediatamente se esbarrarem em uma linha que já existe. O padrão de rachaduras surge e de forma natural da interação entre essas diversas colisões locais, fazendo com que o vidro se quebre de um jeito único e imprevisível a cada execução.
