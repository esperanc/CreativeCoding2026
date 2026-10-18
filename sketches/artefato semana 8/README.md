---
title: Fluxo de Pixels em Movimento
tags: [AI, Gemini, imagem, animação, flow-field, pixel-sorting]
collection: artefato da semana/8
---

# Fluxo de Pixels em Movimento

Artefato generativo desenvolvido em **p5.js v2** que carrega imagens públicas remotamente via CORS (`picsum.photos`) e recria a composição em tempo real através da manipulação direta da matriz de pixels (`img.pixels`).

## Modos Visuais e Controles
* **Modo 1 — Flow Field Pictórico (Padrão):** Milhares de partículas percorrem a tela guiadas por um campo de força baseado em *Perlin Noise* combinado com o ângulo de luminância de cada pixel da imagem original. O mouse cria um vórtice de repulsão local.
* **Modo 2 — Mosaico Cinético:** Converte a imagem em uma grade reativa onde o diâmetro e o deslocamento de cada elemento respondem ao brilho do pixel e à distância do cursor.
* **Modo 3 — Pixel Sorting Glitch:** Ordena verticalmente intervalos de pixels por luminância em tempo real. A posição horizontal do mouse (**Mouse X**) controla o limiar (*threshold*) de brilho para iniciar a ordenação, enquanto a posição vertical (**Mouse Y**) define a extensão máxima dos rastros ordenados, criando um feixe de *glitch* interativo sob o cursor.

### Atalhos de Teclado
* **[Espaço]:** Sorteia e carrega uma nova imagem do `picsum.photos` de forma assíncrona.
* **[M]:** Alterna entre os 3 modos visuais (*Flow Field Pictórico*, *Mosaico Cinético* e *Pixel Sorting Glitch*).
* **[C]:** Limpa a tela / reinicia o estado atual.
* **[I] (segurar):** Exibe a imagem original sem efeitos para comparação.
