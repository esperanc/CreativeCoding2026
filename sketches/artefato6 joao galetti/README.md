---
collection: artefato da semana/6
---

# Micélio

Sketch em p5.js feito para o artefato 6 da disciplina, sobre **emergência em agentes**.

## A ideia

Cada linha do desenho é o rastro de um agente independente — uma "ponta de hifa"
de um micélio. Nenhum agente conhece a rede inteira, nem sabe que forma final vai
resultar do seu trabalho. Cada um só reage ao que consegue sentir perto de si:

- **Estado**: posição, direção, um "vigor" (energia que se esgota aos poucos) e a
  espessura do fio que está deixando para trás.
- **Regra**: ande para frente, curvando-se sutilmente; se houver um nutriente
  próximo, incline-se em direção a ele; se a região logo à frente já estiver densa
  demais de outros fios, vire para o lado mais livre; de vez em quando, com uma
  pequena probabilidade, divida-se em dois agentes.
- **Rastro**: o próprio traço colorido, acumulado num buffer que nunca é apagado —
  é a "memória" que os outros agentes leem para decidir por onde não crescer.

A rede ramificada que liga as origens (os pontos de onde tudo começa a crescer)
aos nutrientes espalhados pela tela não foi desenhada por ninguém: ela é a
consequência de repetir essa regra local, individualmente e sem coordenação
central, milhares de vezes. É esse o sentido de emergência explorado aqui — o
comportamento coletivo surge do processo, não de um plano.

Depois que a rede termina de crescer, pulsos de luz nascem periodicamente nas
origens e viajam por toda a estrutura já formada, como um lembrete de que a rede
continua "viva" mesmo parada.

Cada vez que a página é aberta (ou quando se clica no desenho / aperta espaço), uma
nova semente aleatória é sorteada e uma rede totalmente diferente cresce diante dos
seus olhos — o processo é sempre o mesmo, o resultado nunca é.

## Como rodar

Abra `index.html` num navegador (idealmente servido por um servidor local, já que
a página busca o próprio `sketch.js` via `fetch` para exibir o código-fonte abaixo
do desenho). Todo o sketch usa apenas p5.js, carregado via CDN.

## Autoria

João Galetti
