---
title: Estrada Vetorial
tags: [p5js, geometria, vetores, perspectiva, arte-generativa]
collection: artefato da semana/3
---

# Estrada Vetorial

**Estrada Vetorial** é o artefato 3, decidi por seguir com a sequência do primeiro e segundo artefatod da estrada em perspectiva. Nesta versão, a composição é organizada a partir de uma especificação geométrica: um ponto de fuga controla a posição, o tamanho e a direção dos elementos da cena.

As bordas da pista são segmentos que ligam a parte inferior da tela ao ponto de fuga. As faixas centrais, os postes e os marcadores laterais são posicionados com `p5.Vector.lerp()`, sempre como uma proporção do caminho entre dois pontos. Quanto mais próximo um objeto está da parte inferior da tela, maior ele se torna. As setas laterais usam `heading()` para descobrir o ângulo do vetor que liga sua posição ao ponto de fuga e são giradas com `rotate()` para apontar nessa direção.

O sketch também usa coordenadas normalizadas entre 0 e 1. Por isso, todo o desenho se adapta ao tamanho da janela. A paleta, a posição do horizonte, o ponto de fuga e vários detalhes são sorteados a cada execução, mantendo o caráter generativo do artefato anterior.

**Autor:** Arthur Ramos

## Conceitos geométricos utilizados

- **Posição:** interpolação entre vetores com `p5.Vector.lerp()`.
- **Dimensão:** tamanhos calculados com `map()` a partir da profundidade.
- **Direção:** ângulo obtido com `heading()` e aplicado com `rotate()`.
- **Proporção:** coordenadas normalizadas e medidas relativas a `width` e `height`.
- **Transformações:** `translate()`, `rotate()`, `scale()`, `push()` e `pop()`.

## Como executar

Abra `index.html` em um navegador com acesso à internet ou copie `sketch.js` para o editor do p5.js.

## Interação

- **Clique do mouse:** cria uma nova estrada com outra configuração geométrica.
- **Redimensionar a janela:** recalcula a composição para o espaço disponível.
