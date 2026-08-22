---
collection: artefato da semana/2
---

# Gatinho Generativo

**Aluna:** Gabriela Oliveira de Alcantara

## Descrição do Projeto
Este trabalho foi desenvolvido para a segunda aula de programação criativa. O sketch desenha um gatinho de forma generativa utilizando primitivas gráficas do p5.js, como `ellipse`, `triangle` e `line`.

### Regras Aplicadas:
- **Responsividade:** O canvas é criado utilizando `windowWidth` e `windowHeight` para se adequar dinamicamente ao espaço disponível na janela. O gatinho é desenhado com base em proporções relativas usando `min(width, height)`, garantindo que ele não sofra distorção independentemente da razão de aspecto da janela.
- **Arte Generativa:** A imagem nunca é idêntica. A cor de fundo da tela, a pelagem do gatinho e as cores das pupilas são sorteadas através da função `random()` a cada nova execução do código ou quando a janela é redimensionada.
- **Primitivas:** Todo o desenho foi feito utilizando apenas as formas geométricas básicas vistas em sala de aula.
