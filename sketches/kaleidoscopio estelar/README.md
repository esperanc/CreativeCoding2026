---
title: Kaleidoscópio Estelar
tags: [galaxy, ai, kaleidoscope]
collection: artefato da semana/2
---

Um sketch estático mas generativo. 

Autora: Rafaella Lenzi Romano

# Kaleidoscópio Estelar

Um kaleidoscópio generativo que imita uma galáxia feito com ajuda do Claude. Formado por um centro "brilhante" e braços em espiral cheios de estrelas, repetidos com simetria rotacional e de espelho. O resultado é estático, mas a cada clique gera uma imagem diferente.

## Técnicas utilizadas

- **Canvas responsivo**: `createCanvas(windowWidth, windowHeight)` + `windowResized()`, sem tamanho fixo.
- **Encaixe de proporção**: o desenho é criado num espaço de design fixo (`DESIGN_SIZE`) e reescalado com `translate()` + `scale()` para caber na janela disponível, mantendo aspecto quadrado.
- **Coordenadas polares**: cada estrela é posicionada por raio e ângulo (`r`, `θ`), convertidos para cartesiano com `cos()`/`sin()`.
- **Espiral logarítmica**: os braços seguem `r = a · e^(b·θ)`, com amostragem não-uniforme de `θ` para concentrar mais estrelas perto do centro.
- **Simetria via transformações afins**: um "gomo" é desenhado uma vez e replicado com `rotate()` em loop (simetria rotacional) e `scale(1, -1)` (simetria de espelho), aproveitando que as transformações se acumulam com `push()`/`pop()`.
- **`map()`**: usado para variar brilho e tamanho das estrelas em função da distância ao centro.
- **Geração estática controlada**: `noLoop()` + `randomSeed()`, garantindo que o padrão só muda quando o usuário clica (nova seed), não a cada frame.

## Como funciona

1. `drawGalaxyCore()` desenha o núcleo: camadas de círculos translúcidos sobrepostos, do maior/mais fraco ao menor/mais forte.
2. `drawArtwork()` repete um gomo `SEGMENTS` vezes, girando e espelhando alternadamente.
3. Dentro de cada gomo, `drawWedge()` posiciona estrelas ao longo de uma espiral com jitter (variação aleatória em `r` e `θ`) para parecer pó estelar, não uma linha.
4. `drawStar()` desenha cada estrela: a maioria pequena e fraca, ~6% maiores e com um flare de difração (duas linhas cruzadas).
