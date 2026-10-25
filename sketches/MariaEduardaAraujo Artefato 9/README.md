---
title: Sistema Solar Geométrico 3D
tags: [AI, Gemini, 3D, WebGL, primitivas]
collection: artefato da semana/9
---

# Artefato 9: 3D

**Autora:** Maria Eduarda Araújo  
**DRE:** 119054059  

## Sobre o Projeto
Para explorar o ambiente tridimensional e o renderizador `WEBGL`, desenvolvi uma espécie de "Sistema Solar Geométrico". A cena utiliza as primitivas `sphere`, `box`, `torus` e `cone` manipuladas através de transformações afins (`translate`, `rotateX/Y/Z`) isoladas por `push` e `pop`, gerando sistemas de órbitas independentes.

A ideia do projeto era implementar uma oluminação espacial (luz ambiente, luz pontual irradiando do centro e luz direcional) atrelada a diferentes materiais (`emissiveMaterial`, `specularMaterial`, `ambientMaterial` e `normalMaterial`) para evidenciar o volume de cada primitiva. A função `orbitControl()` foi ativada, permitindo total interação com a câmera.
