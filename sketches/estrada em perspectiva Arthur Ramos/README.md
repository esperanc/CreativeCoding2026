---
title: Estrada em Perspectiva
tags: [p5js, quad, perspectiva, paisagem]
collection: artefato da semana/1
---

# Estrada em Perspectiva

Este sketch estático cria uma paisagem de estrada durante o pôr do sol usando `quad()` como única primitiva de desenho. Os quadriláteros formam o céu, o brilho do sol, as montanhas, o terreno, a estrada, as faixas e os postes.

A sensação de profundidade aparece porque as bordas da estrada e os demais elementos convergem para um ponto próximo ao centro do horizonte. Os objetos mais distantes são menores e ficam mais próximos uns dos outros, enquanto os objetos na parte inferior são maiores.

O trabalho explora especialmente trapézios, paralelogramos e quadriláteros irregulares. Com isso, o comando `quad()` não funciona apenas como substituto de um retângulo, mas como ferramenta para construir perspectiva.

**Autor:** Arthur Ramos

## Como executar

Abra o arquivo `index.html` em um navegador com acesso à internet ou copie o conteúdo de `sketch.js` para o editor do p5.js.

## Regra visual

Todas as formas visíveis da composição são desenhadas com `quad()`. Os demais comandos são usados apenas para configurar cores, contornos e a tela.

OBS: A ideia foi inspirada na estrada que eu dirigi hoje voltando da serra do Rio de Janeiro
