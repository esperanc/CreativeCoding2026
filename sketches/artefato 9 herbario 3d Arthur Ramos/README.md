---
title: Herbário de Plantas Impossíveis
tags: [AI, ChatGPT, 3D, WEBGL, arte generativa, botânica]
collection: artefato da semana/9
---

# Herbário de Plantas Impossíveis

**Autor:** Arthur Ramos  
**Tecnologia:** p5.js 2.2.3 em modo WEBGL  
**Auxílio de IA:** ChatGPT

## Descrição

Este sketch apresenta um jardim tridimensional de espécies que não existem na natureza. Cada planta é montada pelo programa a partir de primitivas 3D do p5.js: cilindros formam caules e galhos, esferas achatadas formam folhas, cones e toros formam flores, e caixas aparecem como fragmentos do pedestal flutuante.

O herbário é generativo. Cada semente altera a altura, a anatomia, a quantidade de folhas, as cores e o tipo de flor das cinco plantas. Pequenos esporos luminosos circulam pela coleção, enquanto os caules se movimentam lentamente como se estivessem respirando.

## Conceitos 3D explorados

- Canvas criado com `createCanvas(windowWidth, windowHeight, WEBGL)`.
- Primitivas `box()`, `sphere()`, `cone()`, `cylinder()`, `torus()` e `plane()`.
- Transformações com `translate()`, `rotateX()`, `rotateY()`, `rotateZ()` e `scale()`.
- Iluminação ambiente, direcional e pontual.
- Materiais especulares e emissivos.
- Câmera em perspectiva e navegação com `orbitControl()`.
- Profundidade, oclusão e animação em três eixos.

## Como interagir

- Arraste o mouse para orbitar a câmera.
- Use a roda do mouse para aproximar ou afastar.
- Clique no canvas ou pressione `R` para cultivar novas espécies.
- Pressione `Espaço` para pausar ou continuar a animação.
- Pressione `S` para salvar a visão atual.

## Requisitos técnicos

- O projeto usa p5.js **versão 2.2.3**, hospedada no CDN jsDelivr.
- A biblioteca p5.js não está incluída no ZIP.
- Não há modelos 3D, imagens, fontes ou outras bibliotecas dentro do projeto.
- O canvas é responsivo e usa `windowWidth` e `windowHeight`.
- Todos os arquivos estão diretamente na raiz do ZIP.

## Processo com IA

O ChatGPT foi usado para desenvolver, comentar e revisar o código. A ideia solicitada foi criar um herbário generativo em WEBGL no qual plantas impossíveis fossem construídas somente com primitivas 3D do p5.js, incluindo iluminação, perspectiva, animação e interação com a câmera.
