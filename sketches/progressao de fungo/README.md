---
title: Progressão de fungo
tags: [ai, generative, claude]
collection: artefato da semana/6
---

Autora: Rafaella Lenzi Romano

# Progressão de fungo

Uma estrutura que cresce a partir de um ponto central e se ramifica como um micélio, sem que nenhum ramo tenha sido desenhado no código.


## Como funciona

O sketch usa agregação limitada por difusão (DLA). Um agente nasce perto da estrutura e anda aleatoriamente em uma das oito direções. Quando encosta em uma célula ocupada, ele pode grudar ali e passa a fazer parte do fungo. Então nasce outro agente, e o processo se repete.

- **Estado:** a posição do agente e uma grade que marca as células ocupadas
- **Regra:** andar ao acaso; ao encostar na estrutura, grudar com certa probabilidade
- **Rastro:** só a célula onde o agente grudou

## Onde está a emergência

A regra não fala em ramos. Eles aparecem porque as pontas que já se projetaram para fora têm mais chance de capturar os agentes do que os vãos entre elas. Pontas crescem mais, viram ramos e geram novas pontas. A forma final só pode ser conhecida rodando.

## Parâmetros

- `PROB_GRUDAR`: com 1, os ramos ficam finos e espetados; valores menores deixam o fungo mais denso e compacto
- `CEL`: tamanho de cada célula em pixels
- `PASSOS_POR_FRAME`: velocidade de crescimento

A cor vai do vermelho (centro, células mais antigas) ao azul (bordas, mais recentes).
