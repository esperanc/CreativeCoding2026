---
title: Um Pequeno Passo
tags: [AI, Claude, 3d, webgl, lua, apollo 11, zenão, animação, humor]
collection: artefato da semana/9
---

# Um Pequeno Passo

Autor: Angel Mansilla  
DRE: 123691897

O Neil Armstrong desce do módulo lunar, fala "um pequeno passo para o homem, um grande passo para a humanidade" e vai pisar na Lua. Só que nessa hora ele lembra do paradoxo de Zenão: antes de chegar no chão, o pé tem que andar metade do caminho, depois metade do que falta, e assim por diante. Então ele nunca chega.

A cada metade a câmera chega 2 vezes mais perto do pé e um contador mostra quanto falta. O zoom vai de uma pedrinha até os átomos. No final dá pra ver o verdadeiro motivo de ele não conseguir descer.

## Como usar

Abre o `index.html` no navegador. Precisa de internet, porque o p5.js 2 (versão 2.3.4) vem do jsDelivr e as fontes vêm do Google Fonts. O filme dura mais ou menos 1 minuto e 20 segundos. No fim, aperta Espaço pra ver de novo.

## Como fiz

Usei o modo WEBGL do p5.js e as primitivas 3D da aula (box, sphere, ellipsoid, cylinder, cone, torus e plane) pra montar o módulo lunar, os astronautas, o chão e as pedras. O astronauta é montado com push, translate e rotate, e a câmera vai chegando mais perto a cada metade. A areia do chão, com as crateras pequenas, é uma textura feita no código e aplicada com um shader.

## Créditos

- Apollo 11, NASA: https://www.nasa.gov/mission/apollo-11/
- Paradoxos de Zenão: https://pt.wikipedia.org/wiki/Paradoxos_de_Zen%C3%A3o
- Aula de 3D da disciplina: https://github.com/esperanc/CreativeCoding2026
- p5.js: https://p5js.org/
