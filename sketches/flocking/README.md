---
collection: artefato da semana/6
---

# Emergência em Programação Criativa: Algoritmo de Flocking (Boids)

Projeto desenvolvido para explorar o conceito de **emergência** em programação criativa e artes computacionais utilizando a biblioteca **p5.js**.

## 📌 O Conceito de Emergência

O fenômeno da **emergência** ocorre quando comportamentos, padrões ou estruturas globais complexas surgem a partir de regras locais simples executadas por elementos individuais, sem a existência de um controle centralizado ou um "orquestrador".

Neste projeto, não existe uma instrução explícita no código dizendo como o "bando" deve se comportar como um todo. O movimento orgânico coletivo surge naturalmente da interação contínua entre as partículas individuais.

## 🛠️ Como Funciona o Sistema

O projeto é baseado no algoritmo *Boids*, criado por Craig Reynolds em 1986. Cada partícula observa apenas os vizinhos dentro de um raio de percepção limitado e ajusta seu movimento com base em três regras fundamentais:

1. **Separação:** Mantém uma distância mínima para evitar colisão com os vizinhos mais próximos.
2. **Alinhamento:** Iguala sua direção e velocidade à direção média dos seus vizinhos.
3. **Coesão:** Move-se em direção ao centro de massa (posição média) dos seus vizinhos.

Além das regras clássicas, foi adicionado um comportamento de **esquiva em relação ao cursor do mouse**, onde a interação do usuário atua como um obstáculo ou predador, forçando o bando a se dispersar e reorganizar espontaneamente.

## 🚀 Tecnologias Utilizadas

* [p5.js](https://p5js.org/) — Biblioteca JavaScript para programação criativa
* JavaScript (ES6+)
* HTML5 / Canvas

## 💻 Como Executar

1. Acesse o [p5.js Web Editor](https://esperanc.github.io/p5front/).
2. Copie o código do arquivo `sketch.js` deste repositório e cole no editor.
3. Clique no botão **Run** (▶) para visualizar a simulação.
