---
tags: [AI, automato celular]
collection: projeto final/Arthur Cury Sampaio/1
---

# Automato Celular Organico - Parte 1

Para essa primeira entrega do trabalho final eu decidi fazer um automato celular, puxando a ideia do Game of Life clássico, mas tentando deixar o visual mais organico e menos travado naquele padrão preto e branco. 

Nessa primeira versao eu fiz uma grid onde cada celula guarda nao so se ta viva ou morta, mas tambem a idade dela e uma energia residual. Com isso, conforme elas sobrevivem, a cor vai mudando aos poucos ( do ciano pro roxo ) e quando morrem elas deixam um rastro que vai sumindo devagar. Usei Perlin Noise pra gerar o estado inicial e parecer mais natural, e tambem coloquei uma chance pequena das celulas muito velhas morrerem do nada pra tela nao ficar travada naquelas formas estaticas eternas. Da pra clicar e arrastar o mouse na tela pra criar mais celulas e apertar 'R' pra resetar tudo.

## O que pretendo acrescentar ate a 3a entrega:

A ideia é usar essa base pra expandir bastante nas proximas semanas. O que eu planejo fazer é:

- Na parte 2: colocar mais de um tipo de celula na mesma grid pra simular um ecossistema de verdade ( tipo presa e predador, ou especies que competem por espaco ) com cores e regras de vizinhanca diferentes pra cada uma. Tambem quero tentar fazer areas do mapa terem mais "nutrientes" que outras usando outra camada de noise no fundo.
- Na parte 3: criar uma interfacezinha com sliders ou atalhos pra conseguir mexer nas regras em tempo real ( mudar velocidade, taxa de nascimento, decaimento do rastro ) e adicionar outros tipos de interacao no mouse, tipo poder desenhar paredes/obstaculos onde as celulas nao conseguem nascer ou jogar algum evento que muda o comportamento delas.

Usei IA pra me ajudar a estruturar a logica do rastro de energia das celulas na matriz e ajustar a transicao de cores no modo HSB.
