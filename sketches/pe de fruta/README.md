---
title: Pé de Fruta
tags: [typography, fruits, fall, AI]
collection: artefato da semana/7
---

# pé de fruta

> Nome: Laura Daflon dos Santoa Santana Meira
>
> DRE: 120053993

Um experimento tipográfico.

Nomes de frutas aparecem na tela, uma de cada vez, e então se desfazem: cada letra cai sob gravidade, quica no chão, gira até perder a inércia e pousa. Ao mesmo tempo a cor da palavra amadurece. Porque a letra cai como a fruta cai do pé.

As letras pousadas não somem. Cada palavra que termina de cair é fixada numa camada acumulada, e a próxima fruta cai por cima do que sobrou das anteriores. O chão vai enchendo de frutas mortas.   
  
Todo nome de fruta tem o formato semelhante da fruta. Como *pera* decresce e cresce no formato da pera de verdade, a banana tem a concavidade de uma banana.

## Estrutura

- `sketch.js` : o loop principal e a máquina de estados (`showing` → `falling` →
`memory`), além da camada que acumula as letras pousadas.
- `fruits.js` : palavra, cores e qual função desenha cada fruta.
- `fall.js` : gravidade, colisão com o chão, restituição, atrito e atrito angular.
- `apple.js`, `banana.js`, `avocado.js`, `pear.js`, `orange.js`, `guava.js`: o desenho de cada fruta e das suas letras.
- `createFruit.js` — gera a textura de texto usada pelas frutas.
