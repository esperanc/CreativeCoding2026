---
collection: artefato da semana/3
---

# Artefato 3

**Nome:** Laura Daflon dos Santos Santana Meira
**DRE:** 120053993

## Descrição

O presente sketch foi desenvolvido em p5.js com a proposta de explorar conceitos de posição, direção e tamanho por meio da construção de espirais compostas por quadrados.

A composição é formada por diferentes camadas de espirais, todas originadas a partir do centro da tela. Cada quadrado possui uma rotação aleatória e recebe cores de diferentes paletas, criando uma sobreposição de formas e cores com aparência psicodélica.

## Construção

A posição de cada quadrado é calculada a partir de coordenadas polares, utilizando um raio e um ângulo para determinar suas coordenadas no canvas. Ao longo de cada espiral, o raio é progressivamente aumentado enquanto o ângulo também é atualizado. Dessa forma, os quadrados se afastam gradualmente do centro e formam trajetórias espirais.

Também são utilizadas transformações como `translate()` e `rotate()` para posicionar e rotacionar individualmente cada elemento. As funções `push()` e `pop()` permitem que essas transformações sejam aplicadas a cada quadrado sem interferir nos demais elementos do desenho.

Diferentes espirais utilizam tamanhos, velocidades de crescimento, níveis de transparência e paletas de cores distintas. O tamanho dos elementos também é calculado de maneira proporcional às dimensões da tela, permitindo que a composição se adapte a diferentes resoluções.

## Recursos utilizados

- p5.js
- Coordenadas polares para definição das posições
- `cos()` e `sin()` para cálculo das coordenadas
- `translate()` para deslocamento do sistema de coordenadas
- `rotate()` para rotação dos quadrados
- `push()` e `pop()` para isolamento das transformações
- `random()` para variação de cores, opacidade e rotação
- `color()` e `setAlpha()` para controle das cores e transparência
- `windowWidth` e `windowHeight` para adaptação ao tamanho da tela
