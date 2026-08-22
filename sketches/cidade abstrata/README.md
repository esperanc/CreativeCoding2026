---
collection: artefato da semana/2
---

# Cidade Abstrata ao Crepúsculo com Ondas de Bézier

**Autor:** Thalisson Braga Lisboa de Oliveira - 123671198

## Sobre o Projeto
Este sketch foi desenvolvido para a disciplina de Programação Criativa (Aula 2) e explora a geração procedural de uma paisagem urbana. A cada execução do código, uma nova metrópole é desenhada contra um céu de crepúsculo recortado por "ondas" espessas e translúcidas, garantindo que a imagem gerada seja única a cada recarregamento da página.

Para chegar a este resultado, idealizei o conceito de uma cidade ancorada na base da tela, recortada por correntes de vento ou auroras. Utilizei inteligência artificial como ferramenta de apoio para me auxiliar no processo de iteração e construção da lógica em p5.js, ajustando parâmetros como a sobreposição das curvas de Bézier, a transparência das cores e o laço de repetição das janelas acesas até alcançar o visual desejado, seguindo a dinâmica proposta para a atividade.

## Conceitos Aplicados
Para atender aos requisitos do "Artefato da Semana", o código faz uso dos seguintes recursos técnicos abordados em sala de aula:

* **Responsividade:** O canvas não possui tamanho fixo. Utilizei `windowWidth` e `windowHeight` dentro da função `createCanvas()` para garantir que a arte ocupe perfeitamente qualquer tamanho de janela.
* **Arte Generativa:** Através do uso extensivo da função `random()`, o programa sorteia a cada execução:
  * A altura, largura e cor dos prédios.
  * Quais janelas estarão com as luzes acesas (probabilidade de 30%).
  * A posição dos pontos de controle e a espessura das curvas de Bézier no fundo.
* **Múltiplas Primitivas:** O sketch vai além de uma única forma e utiliza uma combinação de primitivas:
  * `rect()` para o fundo, o degradê do céu e os blocos dos prédios.
  * `circle()` para compor a lua/sol no céu.
  * `square()` para desenhar as janelas iluminadas.
  * `bezier()` para desenhar as ondas fluidas e translúcidas que atravessam o horizonte.
* **Controle de Loop:** A função `noLoop()` foi utilizada no `setup()` para garantir que o resultado seja uma arte estática ao invés de uma animação caótica.

## Como visualizar
Para ver o projeto, você pode abrir o arquivo fonte em um ambiente de desenvolvimento como o [Editor Web do p5.js](https://editor.p5js.org/) ou apenas abrir o arquivo `index.html` no seu navegador (caso esteja usando o p5Front). Atualize a página algumas vezes para ver o algoritmo gerando novas composições procedurais.
