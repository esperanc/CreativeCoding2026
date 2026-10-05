---
title: Antônimos
tags: [AI, Claude, typography, shadow, antonyms, surface]
collection: artefato da semana/7
---

Sketch feito com auxílio de AI (Claude). Uma palavra fica de pé e o sol percorre um dia inteiro, das 06h às 18h. A sombra projetada é feita de texto: o antônimo da palavra (LUZ projeta "sombra", CHEIO projeta "vazio", e assim por diante). De manhã e à tarde a sombra se estica; ao meio-dia ela encolhe e se inverte sob a palavra.

A forma da palavra vem de `textToContours`. A sombra de uma figura plana é uma transformação afim dela mesma, então os contornos são projetados na superfície escolhida e usados como máscara (`clip`) para preencher a região com linhas de texto.

## Superfícies

A tecla `G` alterna entre três superfícies onde a sombra pode cair:

* **Chão:** plano horizontal sob as letras.
* **Rampa:** chão inclinado que sobe para o fundo, o que curva e alonga a sombra.
* **Parede:** o observador passa a olhar para o sol e a sombra cai numa parede atrás das letras. Ela só aparece acima do pé da parede, por isso some quando o sol está alto.

## Interação

* Arraste horizontalmente para controlar a hora do dia.
* Toque ou clique (sem arrastar), ou use a seta direita, para o próximo par de antônimos. A seta esquerda volta ao anterior.
* `G` alterna entre as superfícies (chão, rampa, parede).
* Espaço pausa e retoma o dia.
