---
title: Agentes Pixels Procedurais
author: Thalisson Braga
tags: [AI, Gemini, imagem, procedural, agentes]
collection: artefato da semana/8
---

# Agentes Pixels Procedurais
**Autor:** Thalisson Braga

Este sketch consome uma imagem gerada remotamente via `https://commons.wikimedia.org/` utilizando CORS. A imagem nunca é renderizada diretamente na tela usando a função `image()`. 

Em vez disso, um sistema de agentes autônomos navega pelo espaço bidimensional do canvas. A cada quadro de animação (frame), eles calculam sua posição no buffer de pixels lógicos (fórmula unidimensional) e coletam o valor RGB sob sua coordenada atual.

O cálculo de luminância ponderada determina a espessura e a opacidade do traço: áreas escuras da imagem geram traços densos, e as claras, traços finos. O movimento fluido é ditado por um algoritmo simples de ruído de Perlin, compondo gradualmente a figura na tela frame a frame como uma pintura emergente.
