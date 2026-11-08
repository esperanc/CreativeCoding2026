---
title: Ambigrama sólido
tags: [AI, Claude, ambigrama]
collection: artefato da semana/10
---

# Ambigrama sólido

**Artefato 10 · Modelagem (modo WebGL)** · feito com auxílio de AI (Claude)

Você digita três letras e o sketch esculpe **um único objeto** que mostra a primeira letra de frente, a segunda de lado e a terceira de cima. Três lâmpadas coloridas (âmbar, ciano e magenta) projetam as três leituras como sombras nas paredes da cena.

A ideia vem da capa de *Gödel, Escher, Bach*, de Douglas Hofstadter, em que um bloco de madeira projeta as letras G, E e B.

## Como o objeto é modelado

1. Cada letra é rasterizada num `createGraphics` 2D e reamostrada numa máscara 40×40.
2. O bloco começa como uma grade cheia de 40×40×40 células.
3. Ele é esculpido em três cortes sucessivos. Cada corte é a **extrusão** de uma letra ao longo de um eixo (Z, X e Y), e o sólido final é a **interseção** dessas três extrusões.
4. A malha é montada à mão como `p5.Geometry`. Só as faces expostas de cada célula viram triângulos, com normais planas. As faces internas são descartadas.
5. As "sombras" são a projeção real do sólido em cada eixo, também construída como `p5.Geometry`. Elas não são a letra original: quando a interseção destrói um pedaço da letra, a parede marca em **vermelho** o que a luz não consegue mais mostrar. O painel também informa quanto de cada letra sobreviveu (ex.: *N 95%*).

Nem todo trio de letras é compatível. Explorar quais combinações "fecham" (e quais perdem pedaços) faz parte da obra.

## Interação

| ação | efeito |
|---|---|
| campo de texto + **esculpir** (ou Enter) | esculpe novas letras (até 3) |
| arrastar | gira a câmera |
| roda do mouse | zoom |
| **1 / 2 / 3** ou botões frente / lado / cima | vista ortográfica de cada leitura |
| **4** ou **livre** | vista em perspectiva |
| **T** ou **tour** | passeio automático pelas três leituras |
| **O** | alterna projeção ortográfica/perspectiva |
| **R** | reesculpe (repete a animação) |

## Técnica

- p5.js **2.x** carregado via CDN (jsDelivr). A biblioteca não está incluída no zip.
- `createCanvas(..., WEBGL)`, `p5.Geometry` construída vértice a vértice, `model()`, `freeGeometry()`.
- `directionalLight` (×3), `ambientLight`, `specularMaterial`, `emissiveMaterial`.
- `camera()` esférica com interpolação suave, `ortho()` / `perspective()`.

## Uso de IA

Este artefato foi feito com auxílio de AI (**Claude**, da Anthropic). A IA propôs o conceito a partir de um pedido para evitar temas batidos e escreveu o código.
