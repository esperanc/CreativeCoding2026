---
title: Relicário de Órbitas
tags: [AI, ChatGPT, WebGL, 3D, generative, sculpture, orbit]
collection: artefato da semana/9
---

# Relicário de Órbitas

**Autor:** Paulo Vitor

`Relicário de Órbitas` é uma escultura cinética generativa feita em p5.js no modo WebGL. Um núcleo luminoso permanece no centro enquanto diferentes “relíquias” — caixas, cones, esferas e toros — percorrem órbitas inclinadas. Cada execução sorteia dimensões, cores, velocidades, sentidos e planos orbitais, produzindo uma estrutura tridimensional diferente.

A ideia é representar um arquivo que não guarda objetos em prateleiras: ele preserva fragmentos mantendo-os em movimento. As peças parecem organizadas quando vistas de um ângulo, mas se tornam um sistema instável quando a câmera muda.

## Interação

- **Mover o mouse:** altera o ângulo de observação da escultura.
- **Clique ou tecla R:** gera um novo relicário.
- **Barra de espaço:** pausa ou retoma o movimento.
- **Tecla S:** salva uma imagem do canvas.

## Recursos tridimensionais

O sketch cria o canvas com `WEBGL` e utiliza as primitivas `sphere()`, `box()`, `cone()` e `torus()`. Também emprega transformações (`translate`, `rotateX`, `rotateY` e `rotateZ`), iluminação direcional e pontual, materiais e câmera em perspectiva.

## Requisitos técnicos

O canvas usa `windowWidth` e `windowHeight` e se adapta ao redimensionamento da janela. A biblioteca p5.js versão 2 é importada por CDN no `index.html`; nenhuma cópia da biblioteca está incluída no ZIP.

## Uso de IA

O trabalho foi criado com auxílio do **ChatGPT** na concepção, programação, documentação e verificação técnica.
