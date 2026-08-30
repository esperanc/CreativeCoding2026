---
collection: artefato da semana/3
---

# Composição Geométrica em Malha Trihexagonal

Este sketch cria uma composição geométrica abstrata utilizando exclusivamente a primitiva `triangle()` do p5.js. O objetivo foi explorar princípios de geometria analítica, repetição estruturada e encaixe topológico para gerar um mosaico contínuo que preenche toda a tela.

## Como o sketch funciona
- O código utiliza laços de repetição para construir uma grade estruturada que se adapta automaticamente ao tamanho da janela.
- Toda a arte é desenhada utilizando apenas a função nativa `triangle()`. Os ângulos e vértices são calculados matematicamente usando seno e cosseno para garantir um encaixe sem espaços vazios.
- A malha visual intercala hexágonos e triângulos. O que aparentam ser hexágonos maciços são, na verdade, construções de 6 triângulos equiláteros menores que compartilham o mesmo centro.
- As formas recebem cores sorteadas a cada execução, criando um forte contraste visual: tons frios para as subpartes dos hexágonos e tons quentes para os outros triângulos .
- O tamanho base da malha geométrica é sorteado aleatoriamente toda vez que o programa é executado (`random(30, 60)`), e não se utilizam linhas de contorno (`noStroke()`) para reforçar a estética de um mosaico limpo e contínuo.

## Autor
Artur Taboada Dios Carvalho

## Como visualizar este projeto

**Usando o ambiente online (p5front)**
1. Acesse o ambiente de desenvolvimento utilizado na disciplina: [https://esperanc.github.io/p5front/](https://esperanc.github.io/p5front/).
2. Copie todo o conteúdo do arquivo `sketch.js` deste zip e cole na área de edição de código do site.
3. O resultado será renderizado na tela de visualização após o botão "Run" ser clicado.
