---
title: Ele
tags: [AI, Claude, typography, horror, sound, 3d]
collection: artefato da semana/7
---

# Ele

Autor: Angel Mansilla  
DRE: 123691897

A ideia partiu do vídeo [I made a horror game that's IMPOSSIBLE to SCREENSHOT!](https://www.youtube.com/watch?v=RNhiT-SmR1Q), do canal Branta Games, em que um jogo de terror é feito só de chiado preto e branco e a cena só aparece quando as coisas se movem ([o jogo se chama Motus](https://brantagames.itch.io/motus)). Quis fazer isso com palavras: a tela inteira é uma página de texto, e não existe nenhum desenho, só letras numa grade. Depois veio a ideia de que quem anda pela casa não enxerga e só descobre o que tem em volta jogando uma pedra e ouvindo onde ela cai.

Você começa num porão trancado com um cadeado. Cada coisa da casa é escrita com o próprio nome: a parede é feita de "parede parede", o chão de "chão", a cadeira de "cadeira". Sem som, tudo fica num cinza apagado e as palavras se confundem umas com as outras. Quando você joga a pedra, ela quica nas paredes e cai no chão, e a onda do som passa pela casa acendendo cada coisa na sua cor. A chave do cadeado está pendurada no fundo da casa, ao lado dele, um homem vermelho escrito "ele ele ele", de costas, virado para a parede. Bilhetes nas paredes contam o que aconteceu ali.

Pelo caminho aparecem almas azuis, pequenas, escritas "alma alma". Elas têm a mesma regra que ele: vêm até você pela casa, depressa, enquanto você não está olhando, e congelam quando você olha. Quando uma delas chega do seu lado, ou quando você chega até ela, ela fala, com um som de bipes inspirado nas falas de [Deltarune](https://deltarune.com/), e some assim que sai da sua vista. Elas são o que sobrou de quem viveu com ele: ele é alguém da família que fez mal dentro de casa, e as almas falam disso de forma vaga e dolorida, sem descrever nada, mas cada uma deixa uma pista. Uma delas diz: "ele dizia que esta casa era nossa... e que nós éramos dele. calei por tanto tempo que a minha voz se desfez em poeira. enquanto os olhos estão nele, ele não caminha."

Pedras jogadas perto dele o acordam, e pegar a chave também. Os passos contam: de longe, cada passo deixa ele um pouco mais alerta; perto dele, um passo só já o acorda. Acordado, ele segue você pela casa, mas só se mexe quando não está sendo encarado, e é preciso voltar até a porta do porão sem tirar os olhos dele. Se ele te alcança, a grade inteira forma um "ele" gigante; se você abre o cadeado, forma "saída".

## Como jogar

1. Abra o `index.html` no navegador (Chrome, Edge ou Firefox), com a internet ligada: o p5.js 2 e a fonte Courier Prime vêm de CDN.
2. A primeira tela explica os comandos. Aperte E, a barra de espaço ou clique para continuar; depois aparece o primeiro bilhete, que conta a história.
3. Ande com as teclas W, A, S e D (W para a frente, S para trás, A e D para os lados). Para olhar e virar, arraste o mouse com o botão apertado.
4. Aperte a barra de espaço para jogar uma pedra. Por onde o som passa, cada coisa acende na sua cor e fica mais fácil de ler.
5. A frase no alto da tela lembra o que você está buscando. Quando aparecer "E ·" no meio da tela, a tecla E lê o bilhete, pega a chave ou abre o cadeado. Os bilhetes nas paredes explicam o resto.
6. Não jogue pedras perto dele: o barulho o acorda, e pegar a chave também. Os seus passos também são ouvidos: se aparecer "algo se mexeu no fundo da casa", ele está perto; chegando perto dele, ele acorda. Se ele acordar, fique de frente para ele e ande para trás com a tecla S até a porta do porão.

A barra de baixo lembra todos os comandos (H esconde e mostra). P pausa e R recomeça. A tecla V mostra o mapa do movimento, que deixa ver a técnica por trás: o que está em cinza desliza para a esquerda, o que está em laranja desliza para a direita e o preto ferve.

## Como foi feito

A casa é uma cena 3D desenhada escondida, em WEBGL e em baixa resolução, com um pixel para cada letra da grade, e ela nunca aparece na tela. Um shader pequeno grava em cada pixel a distância até quem joga, o nome da coisa e a distância até onde a pedra caiu, e o sketch lê isso com `loadPixels()`. Cada linha de texto é montada letra a letra: coisas diferentes deslizam em sentidos opostos, e as trocas só acontecem entre palavras, então nenhuma palavra se quebra. Nos finais, a palavra gigante é escrita numa imagem do tamanho da grade e só as células que caem dentro das letras acendem, como a letra usada como máscara na aula de tipografia. O som é feito no próprio navegador, com Web Audio. Da disciplina usei arrays, objetos, vetores e transformações, `random()` e a aula de tipografia: medir a fonte antes de desenhar, compor o texto letra a letra, tratar o texto como palavras e amostrar pixels.

## Participação da IA

Usei o Claude Code (Claude) para desenvolver o trabalho. As ideias e as escolhas principais foram minhas: o efeito do vídeo feito com palavras, a pessoa cega e a pedra que revela a casa, a fuga com chave e cadeado, os bilhetes, as almas azuis que falam com som de bipes, as cores de cada tipo de coisa e o visual dele, a partir de uma imagem de referência de um boneco em pixels. O Claude escreveu o código, testou no navegador e sugeriu algumas soluções que eu aceitei, como as coisas aparecerem escritas com o próprio nome, a regra de ele só andar quando não é encarado, a paleta de cores e os finais com a palavra gigante. Os textos dos bilhetes, das falas das almas (a partir do que eu pedi para elas sentirem) e dos finais foram escritos pelo Claude, e ele ajudou com este README.
