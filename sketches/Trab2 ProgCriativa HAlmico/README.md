---
title: Composição neoconcreta com primitivas variadas
tags: [p5js, generative, neoconcreto, claude]
collection: artefato da semana/2
---

Extensão do trabalho da semana anterior (que usava apenas `quad()`).
Agora a composição combina várias primitivas vistas em aula —
`quad`, `triangle`, `circle`, `line`, `point`, `bezier` e `arc` —
mantendo o espírito neoconcreto: fundo escuro, paleta pastel com um
único ponto de cor vibrante, formas concentradas numa diagonal e
fragmentos menores dispersos nas bordas.

O canvas é quadrado e se adapta ao tamanho da janela (usa
`windowWidth`/`windowHeight` e se redesenha em `windowResized()`).
O sketch também não usa uma semente fixa de aleatoriedade, então
cada vez que a página é aberta (ou a janela é redimensionada) uma
composição nova é gerada, seguindo sempre as mesmas regras.

Autor: Henrique Almico Dias da Silva

Prompt usado: Estenda o sketch da semana passada (que usava apenas quad) podendo agora usar qualquer primitiva de desenho vista em aula. O sketch não deve gerar sempre a mesma imagem nem usar tamanho fixo: o canvas deve se adequar ao tamanho da janela disponível (usando windowWidth/windowHeight), encaixando o formato quadrado original no espaço disponível.
