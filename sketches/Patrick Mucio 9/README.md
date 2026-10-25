---
collection: artefato da semana/9
---

AI ChatGPT
artefato da semana/9

# Artefato 9 — Jardim Orbital 3D

## Ideia
Uma escultura cinética espacial: um cristal luminoso gira entre dois anéis, enquanto satélites orbitam sobre um pedestal geométrico. A composição muda com o tempo e pode ser explorada de vários ângulos.

## Recursos técnicos
- p5.js **2.3.4**, carregado por CDN diretamente em `index.html`.
- Renderização `createCanvas(900, 570, WEBGL)`.
- Primitivas 3D: `sphere()`, `box()`, `cone()`, `cylinder()`, `torus()` e `ellipsoid()`.
- Transformações e animação: `translate()`, `rotateX()`, `rotateY()`, `rotateZ()` e `sin()`.
- Iluminação: `ambientLight()`, `directionalLight()` e `pointLight()`.
- Interação por mouse: `orbitControl()`.

## Controles
- **Mouse pressionado e arrastado:** gira a câmera.
- **Roda do mouse:** zoom.
- **Espaço:** pausa/retoma a animação.
- **C:** alterna entre três paletas de cores.
- **S:** salva uma imagem PNG do sketch.
- **R:** restaura a visão inicial.

## Como executar
Abra `index.html` no navegador com conexão à internet. Como a biblioteca é carregada por CDN, não é necessário instalar nada.

## Estrutura
- `index.html`: página HTML e chamada para p5.js na versão 2.3.4.
- `sketch.js`: código completo do projeto.
- `thumbnail.png`: miniatura de apresentação do artefato.
- `README.md`: documentação e metadados.

## Uso de IA
Este projeto foi elaborado com auxílio da ferramenta **ChatGPT**, incluindo a proposta visual, o código e a documentação.
