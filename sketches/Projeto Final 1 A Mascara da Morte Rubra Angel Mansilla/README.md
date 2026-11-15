---
title: Projeto Final Parte 1: A Máscara da Morte Rubra
tags: [AI, Claude, 2d, shader, filme, animação, música, teatro de varetas, papel recortado, Edgar Allan Poe]
collection: projeto final/Angel Mansilla/1
---

# A Máscara da Morte Rubra

Projeto final, parte 1  
Autor: Angel Mansilla  
DRE: 123691897

Eu gosto muito da obra do Edgar Allan Poe, então pro projeto final quis adaptar um conto dele que eu curto bastante, [A Máscara da Morte Rubra](https://pt.wikipedia.org/wiki/A_M%C3%A1scara_da_Morte_Rubra). Tentei trazer a visão que eu tenho desse conto: a peste matando os pobres lá embaixo, enquanto o príncipe e os amigos dele ficam trancados num castelo que ninguém consegue alcançar, fazendo um baile como se nada estivesse acontecendo, até a morte entrar mesmo assim.

A primeira ideia era fazer um stop motion 2D, mas achei que ficava mais legal como um teatro de varetas, com bonecos de papel recortado que alguém segura por baixo do palco. Fui de 2D porque no Diamante Bruto o 3D me deu muito retrabalho com encaixe e ângulo de câmera.

O filme tem 2 minutos e 56 segundos. Começa na vila morrendo da peste, daí a corte entra no castelo e vem o baile nas sete salas, o relógio de ébano que faz todo mundo parar, as doze badaladas da meia-noite e o mascarado, que vai dançando pelas salas com uma dama que só aparece na sombra dele na parede, até chegar na sala preta. No final eu quis fugir do óbvio: em vez de só cair, o príncipe é tirado pra uma última valsa com a morte, e quem tenta agarrar o mascarado vira boneco dele e dança de mãos dadas até cair.

## Como usar

Abre o `index.html` no navegador, ou carrega o ZIP no p5Front e aperta Run, daí é só clicar na cortina pra começar. Precisa de internet, porque o p5.js 2 (versão 2.3.4) vem do jsDelivr. O som é todo gerado no código, então não tem arquivo de áudio. Espaço pausa, as setas voltam ou avançam 5 segundos e R recomeça.

## Como fiz

Tudo é desenhado no canvas 2D. Cada peça de papel tem borda de tesoura, textura e uma sombra curta, e os bonecos são peças presas por tachinhas que giram em volta de um pivô. As partes com vareta seguem a dança e as soltas balançam atrasadas, então quando o relógio toca as mãos param e o resto ainda balança um pouco. As danças seguem o compasso da música, e pros bonecos darem as mãos de verdade o braço dobra no cotovelo sozinho até a mão chegar no lugar certo. A vila é um cenário bem maior que a tela, e a câmera vai do plano geral até os pobres e depois sobe pela pedra até o portão do castelo. As legendas são amarelas e vão se corrompendo, como se a peste estivesse comendo as letras.

Por cima de tudo tem um shader de filtro, feito com `createFilterShader()` da aula 10, que faz a luz colorida dos vitrais, o foco curto, o grão e a palidez nas badaladas, e os raios de luz que entram pelos vitrais são outro shader. A música, uma valsa e o Dies irae, é feita com Web Audio. O código tá dividido em `papel.js` (as peças de papel), `bonecos.js`, `cenario.js` (as salas), `fora.js` (a vila e o rochedo), `som.js` e `sketch.js`, que tem o roteiro.

## O que vem nas próximas entregas

- Entrega 2: assistir o filme inteiro com calma pra acertar ritmo e movimento, dar mais gestos aos bonecos (virar a cabeça pro mascarado, a multidão abrindo caminho) e colocar os braseiros nos tripés atrás dos vitrais, que no conto são a única luz das salas.
- Entrega 3: acabamento, com legendas que dá pra desligar, tela cheia, créditos no final e ajuste do som e do desempenho pra rodar bem em computador mais fraco.

## IA

Usei o Claude pra escrever o código e testar o filme. Eu dirigi: escolhi o conto, troquei o stop motion pelo teatro de varetas, desenhei a vila com o castelo inalcançável e fui pedindo e aprovando as mudanças, como as badaladas menos apressadas, as legendas que se corrompem, o mascarado dançando pelas salas e um final menos chato pra morte do príncipe e da corte.

## Créditos

- A Máscara da Morte Rubra (The Masque of the Red Death), de Edgar Allan Poe, 1842, domínio público: https://pt.wikipedia.org/wiki/A_M%C3%A1scara_da_Morte_Rubra
- Dies irae, canto medieval, domínio público: https://pt.wikipedia.org/wiki/Dies_irae
- Aula 10 - Shaders: https://github.com/esperanc/CreativeCoding2026/blob/main/10%20-%20Shaders/slides.md
- p5.js: https://p5js.org/
