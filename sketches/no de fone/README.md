---
title: Nó de fone
tags: [AI, Claude, WEBGL, p5.js v2, geometria própria]
collection: artefato da semana/10
---

# Nó de fone

Um fone de ouvido com fio, daqueles que a gente guarda no bolso e que sempre voltam emaranhados. O sketch gera o cabo, o plug de 3,5 mm, o divisor em Y e os dois fones **vértice a vértice**, em modo WEBGL, e mostra tudo girando devagar sob luzes coloridas.

**Feito com auxílio de IA (AI — Claude, da Anthropic).**

## Como interagir

- Arraste o mouse para girar e use a roda para aproximar (`orbitControl`).
- Duplo clique, ou a tecla `N`, gera um novo emaranhado (outra semente).

## Como funciona

- **Caminho do cabo:** um passeio aleatório com inércia, puxado de volta ao centro, suavizado com splines de Catmull-Rom. Três trechos: o cabo principal e os dois ramos depois do Y.
- **Tubo:** a malha é construída com um referencial de transporte paralelo, para o fio não torcer, com normais por vértice para o sombreamento suave.
- **Peças torneadas:** plug, Y e fones são perfis de revolução construídos à mão em torno do eixo local do cabo.
- **WEBGL:** `buildGeometry()` com `beginShape(TRIANGLES)`, `normal()` e `vertex()`, `model()`, luzes (`ambientLight`, `directionalLight`, `pointLight`), `specularMaterial()` e `shininess()`.

A biblioteca p5.js (v2.2.3) é carregada de CDN; o zip não a contém.
