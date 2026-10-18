---
title: Morangos em Pontos
tags: [AI, Claude, imagem, partículas, interação]
collection: artefato da semana/8
---

Sketch em p5.js 2 que baixa uma foto de morangos do [picsum.photos](https://picsum.photos/id/1080/480/480) (id 1080) e a transforma em uma grade de pontos coloridos. O tamanho de cada ponto depende do brilho do pixel amostrado, como em uma retícula de meio-tom. A imagem em si nunca é desenhada na tela: o sketch só usa as cores lidas dela.

Os pontos funcionam como pequenas molas ligadas à posição original. O mouse empurra os pontos para longe, e segurar o clique cria um redemoinho. Quando o mouse sai, a imagem se reconstrói sozinha.

## Controles

- **Mover o mouse**: afasta os pontos
- **Segurar o clique**: redemoinho
- **Tecla S**: salva o `thumbnail.png`

## Créditos

- Imagem: foto id 1080 do [Lorem Picsum](https://picsum.photos/), carregada via CORS em tempo de execução (não está incluída no projeto).
- Código desenvolvido com o auxílio da IA Claude (Anthropic).
