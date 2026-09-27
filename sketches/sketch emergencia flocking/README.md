---
collection: artefato da semana/6
---

# Flocking — Emergência em Programação Criativa

**Autora:** Gabi

## Descrição

Este sketch é uma simulação de *flocking* (cardume), inspirada no clássico
modelo de **Craig Reynolds (1987)**, criado para explorar o conceito de
**emergência** discutido na aula sobre agentes da disciplina EEL670 —
Linguagens de Programação.

Cada agente (boid) do sketch segue apenas **três regras locais**, baseadas
unicamente na posição e velocidade de seus vizinhos mais próximos:

1. **Separação** — afasta-se de vizinhos muito próximos, evitando colisões.
2. **Alinhamento** — ajusta sua velocidade para acompanhar a direção média
   dos vizinhos.
3. **Coesão** — move-se em direção ao centro de massa dos vizinhos.

Nenhum boid tem conhecimento do cardume como um todo, nem existe qualquer
regra global do tipo "forme um V" ou "siga o líder". O comportamento
coletivo de cardume — grupos que se formam, se dividem, contornam
obstáculos imaginários e se reorganizam continuamente — **emerge** apenas
da interação repetida dessas regras simples e locais entre centenas de
agentes independentes. É exatamente esse tipo de padrão não previsto
explicitamente pela programadora, mas resultante da dinâmica do sistema,
que caracteriza a emergência em programação criativa.

## Interação

- Clique em qualquer lugar da tela para adicionar novos boids ao cardume
  naquele ponto, perturbando o sistema e observando como ele se
  reorganiza.

## Tecnologia

Feito com [p5.js](https://p5js.org/) (carregado via CDN em `index.html`).
Arquivos do sketch: `index.html` e `sketch.js`.
