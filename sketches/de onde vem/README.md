---
title: Mosaico
tags: [mosaic]
collection: artefato da semana/8
---

**Classificação:** AI, Gemini
**Coleção:** artefato da semana/8

# Mosaico Dinâmico em Pontilhismo

Este artefato recria uma imagem fotográfica externa utilizando primitivas 2D no p5.js. A imagem de origem é consumida de forma aleatória do servidor público `picsum.photos`, garantindo que não haja arquivos de imagem locais e respeitando as regras de CORS.

O algoritmo não desenha a imagem diretamente. Em vez disso, a função `draw` lê os pixels da imagem em tempo real e desenha círculos semi-transparentes em posições aleatórias. O raio de cada círculo é calculado de forma inversamente proporcional ao brilho do pixel: tons escuros geram formas maiores, enquanto tons claros geram pontos menores, criando uma composição visual gradativa no estilo pontilhismo.
