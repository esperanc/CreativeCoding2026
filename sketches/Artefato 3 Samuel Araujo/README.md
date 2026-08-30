---
collection: artefato da semana/3
---

# Decolagem

**Autor:** Samuel Vitor  
**Disciplina:** Programação Criativa  
**Atividade:** Artefato 3 — Layout

## Conceito

O sketch mostra um foguete subindo no céu a 45º, atrás dele o rastro de fumaça concentrado que vai se espalhando e perdendo opacidade.

## Criação

O mais interessante foi perceber que “layout geométrico” não precisa significar uma composição cheia de cálculos aparecendo na tela. Uma regra simples já pode organizar o desenho inteiro. Nesse caso, defini dois pontos e usei uma linha imaginária entre eles para controlar a posição, o tamanho e a direção dos elementos.
Eu comecei complicando bastante a ideia. O foguete resolveu isso de uma forma bem mais direta. O lerp() distribui a fumaça pelo caminho, o tamanho dos círculos muda gradualmente e o atan2() aponta o foguete na direção correta. No fim, gostei mais da versão simples

A composição se adapta automaticamente ao tamanho da janela.

## Requisitos técnicos

- canvas responsivo com `windowWidth` e `windowHeight`;
- layout definido por posição, dimensão e direção;
- redimensionamento automático;
- compatibilidade com p5.js 2.2.3 e p5Front.
