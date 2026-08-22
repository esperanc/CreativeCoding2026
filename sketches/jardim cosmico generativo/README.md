---
collection: artefato da semana/2
---

# Jardim Cósmico Generativo

**Autor:** Henrique Kezen V. H. Leite

## Descrição

Este sketch cria uma paisagem espacial generativa usando p5.js. A composição combina estrelas, constelações, órbitas, planetas, formas geométricas e uma silhueta no primeiro plano.

Cada execução utiliza uma nova semente aleatória, portanto a imagem gerada não é sempre a mesma. Também é possível gerar uma nova composição clicando com o mouse ou pressionando `Espaço`/`R`.

## Responsividade

O canvas é criado com `windowWidth` e `windowHeight`, ocupando todo o espaço disponível da janela. Os tamanhos dos elementos são calculados proporcionalmente a `min(width, height)`, evitando depender de dimensões fixas. Quando a janela é redimensionada, o canvas também é redimensionado e uma nova composição é gerada.

## Primitivas e recursos utilizados

O trabalho utiliza diferentes primitivas e recursos do p5.js, incluindo:

- `circle()`
- `rect()`
- `triangle()`
- `line()`
- `arc()`
- `beginShape()` / `vertex()` / `endShape()`
- transformações com `translate()` e `rotate()`
- transparência de cores
- geração aleatória com `random()` e `randomSeed()`

## Interação

- Clique do mouse: gera uma nova composição.
- Tecla `R`: gera uma nova composição.
- Barra de espaço: gera uma nova composição.
- Redimensionar a janela: adapta o canvas ao novo tamanho e gera outra composição.
