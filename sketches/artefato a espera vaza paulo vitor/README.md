---
title: A Espera Vaza
tags: [AI, ChatGPT, WebGL, p5.Geometry, custom mesh, negative space, typography]
collection: artefato da semana/10
---

# A Espera Vaza

**Autor:** Paulo Vitor

`A Espera Vaza` é uma escultura tipográfica construída como uma malha tridimensional. Uma folha dobrada parece ter perdido alguns de seus fragmentos; os vazios deixados por eles formam a palavra **ESPERA**. Os pedaços ausentes permanecem abaixo da folha, deslocados no espaço, como se a espera tivesse adquirido peso e caído para fora do documento.

A obra foi pensada para depender do ponto de vista. De frente, os vazios se organizam como texto. Ao mover a câmera, a palavra se desfaz e a espessura, as dobras e os fragmentos revelam que ela não foi desenhada sobre a superfície: ela é uma ausência na própria geometria.

## Relação com a aula 10

O sketch usa `WEBGL` e constrói duas malhas com `p5.Geometry`: a folha restante e os fragmentos retirados. O código preenche manualmente as listas `vertices` e `faces`, monta cada volume com triângulos e chama `computeNormals(FLAT)` para que a iluminação reconheça as faces. Quando a dobra é recalculada, `freeGeometry()` libera as malhas anteriores antes da criação das novas.

Não há modelo OBJ/STL importado, sólido de revolução nem conjunto aleatório de primitivas. A forma surge da regra que converte uma matriz tipográfica em matéria e espaço negativo.

## Interação

- **Mover o mouse:** altera o ponto de vista entre a leitura frontal e a visão lateral das dobras.
- **Clique ou tecla R:** recalcula as dobras e a queda dos fragmentos.
- **Tecla F:** fixa a câmera de frente para facilitar a leitura da palavra.
- **Tecla S:** salva uma imagem do canvas.

## Requisitos técnicos

O canvas é responsivo e utiliza `windowWidth` e `windowHeight`. A biblioteca p5.js **2.3.4** é carregada pelo CDN jsDelivr no `index.html`; nenhuma cópia do p5.js, p5.sound, fonte, imagem ou modelo 3D está incluída no ZIP.

## Uso de IA

O **ChatGPT** auxiliou na concepção, programação, documentação e testes do trabalho.
