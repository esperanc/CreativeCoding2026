---
collection: artefato da semana/2
---

# Composição com Triângulos Rotativos Aleatórios

Este sketch cria uma composição abstrata utilizando a primitiva `triangle()` do p5.js. O objetivo foi explorar princípios de recursão, geometria analítica e aleatoriedade para gerar padrões dinâmicos espalhados pela tela.

## Como o sketch funciona
- O código utiliza um laço de repetição para gerar múltiplas composições (vários grupos de triângulos) espalhadas em posições aleatórias pela tela.
- Uma função recursiva chamada `giro()` é responsável por rotacionar os triângulos no sentido anti-horário ao redor de um eixo fixo, calculando os vértices matematicamente sem mover o centro do canvas.
- O tamanho dos triângulos alterna a cada passo (entre o tamanho original e um tamanho reduzido), criando um efeito visual que pode remeter a uma estrela/flor.
- Cada grupo de triângulos recebe uma paleta de cores gerada de forma completamente aleatória para garantir grande variação visual.
- Não se utiliza bordas (`noStroke()`) para obter um visual mais limpo e contínuo.

## Autor
Artur Taboada Dios Carvalho

## Como visualizar este projeto

**Usando o ambiente online (p5front)**
1. Acesse o ambiente de desenvolvimento utilizado na disciplina: [https://esperanc.github.io/p5front/](https://esperanc.github.io/p5front/).
2. Copie todo o conteúdo do arquivo `sketch.js` deste zip e cole na área de edição de código do site.
3. O resultado será renderizado na tela de visualização após o botão "Run" ser clicado.
