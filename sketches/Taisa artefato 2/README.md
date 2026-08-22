---
tags: [static, generative, stained glass, colorful]
collection: artefato da semana/2
---

# Vitral aleatório
## Descrição
O sketch representa um vitral generativo, formado por diferentes pedaços de vidro colorido separados por linhas escuras, simulando a estrutura de um vitral tradicional.

O desenho é estático, ou seja, ele é construído uma única vez durante a execução do programa e não possui animação. Entretanto, ele é generativo, pois utiliza valores aleatórios para determinar diferentes características da composição.

A imagem é construída a partir de uma malha de pontos distribuídos pelo canvas. Os pontos internos sofrem pequenos deslocamentos aleatórios, fazendo com que as formas não sejam sempre iguais. As regiões formadas por esses pontos são divididas em triângulos, e suas cores também são escolhidas aleatoriamente a partir de uma paleta pré-definida.

Dessa forma, cada execução do programa pode produzir um vitral diferente, mesmo mantendo a mesma lógica de construção.

## Prompt utilizado

Crie um sketch estático (sem animação) em p5.js. Apresente o resultado sob a forma de um único script em javascript a ser colado num ambiente de desenvolvimento como o editor.p5js.org. O sketch deve usar as primitivas vistas em sala, vou te enviar depois. É permitido usar comandos de estilização como stroke, fill, strokeWeight, etc. O programa fonte deve ser documentado para ser explicado para uma plateia de iniciantes em programação de computadores. Se assegure que o sketch não gera sempre a mesma imagem e nem use um tamanho fixo, mas se adeque ao tamanho da janela disponível. Use windowWidth/windowHeight para criar o canvas, por exemplo. Em resumo, quero um sketch estático, mas generativo. no caso, o tema seriam vitrais.
Primitivas:
background(cor): pinta todo o canvas com a cor cor.
point(x, y): desenha um ponto em (x, y).
line(x1, y1, x2, y2): desenha uma linha de (x1, y1) até (x2, y2).
rect(x, y, width, height): desenha um retângulo com canto superior esquerdo em (x, y), largura width e altura height.
ellipse(x, y, width, height): desenha uma elipse com centro em (x, y), largura width e altura height.
triangle(x1, y1, x2, y2, x3, y3): desenha um triângulo com vértices em (x1, y1), (x2, y2) e (x3, y3).
circle(x, y, diameter): desenha um círculo com centro em (x, y) e diâmetro diameter.
square(x, y, size): desenha um quadrado com canto superior esquerdo em (x, y) e lado size.
quad(x1, y1, x2,y2, x3,y3, x4,y4): desenha um quadrilátero com vértices em (x1, y1), (x2, y2), (x3, y3) e (x4, y4).
arc(x, y, width, height, start, stop, [mode]): desenha um arco de elipse
bezier(x1, y1, x2,y2, x3,y3, x4,y4): desenha uma curva de Bézier

Aluna: Taísa Evangelista de Oliveira Martello DRE: 120024033
