---
title: Artefato semana 9 - Cobogós
tags: [AI, Claude]
collection: artefato da semana/9
---

Uma parede de **cobogós**, os blocos vazados da arquitetura moderna brasileira, montada em 3D com p5.js 2 no modo `WEBGL`. Cada módulo é feito com primitivas (`box` e `cylinder`) dentro de `buildGeometry()` e repetido na parede com `model()`.

## Parâmetros

- **Padrão**: Ondas, Círculo, Diamante, Folha, Meia-lua, Cata-vento, Xis.
- **Composição**: como os blocos giram na parede (repetir, alternar, espelhar, girar, aleatório).
- **Colunas / Linhas**: tamanho da parede.
- **Espessura do traço / Profundidade**: a massa do bloco.
- **Junta**: espaço entre os blocos.
- **Abertura**: gira cada bloco em Y, como uma veneziana; com **ondular**, vira uma onda animada.
- **Cor**: concreto, terracota, branco, azul piscina, verde, amarelo ou mosaico.
- **Acabamento**: fosco ou esmaltado (`specularMaterial` + `shininess`).
- **Hora do dia**: move o sol (`directionalLight`) e muda a cor da luz e do céu.

## Interação

Arraste para girar, use a roda para aproximar e o botão direito para deslocar. A tecla **S** salva uma imagem.

Feito com auxílio de AI (Claude).
