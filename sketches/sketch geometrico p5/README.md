---
collection: artefato da semana/3
---

# Campo Geométrico Direcional

**Autor:** Henrique Kezen V. H. Leite

Este sketch em p5.js explora posição, dimensão e direção por meio de uma grade adaptativa de segmentos orientados.

Cada segmento possui uma posição fixa na grade, mas sua inclinação é calculada em tempo real para apontar para um ponto de referência definido pelo cursor. A direção de cada elemento é obtida pelo vetor entre sua posição `(x, y)` e o ponto `(mouseX, mouseY)`, usando `atan2`.

A dimensão dos segmentos também varia de acordo com a distância até o ponto de referência. Além disso, círculos concêntricos reforçam visualmente a relação geométrica de distância ao centro comum.

O canvas usa `windowWidth` e `windowHeight`, portanto a composição se adapta ao tamanho da janela.
