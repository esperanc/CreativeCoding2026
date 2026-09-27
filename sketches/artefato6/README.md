---
title: Ecossistema Autônomo Slither.io
tags: [emergencia, agentes, p5js, slitherio]
collection: artefato da semana/6
---

Uma simulação baseada em Slither.io para explorar o conceito de emergência por meio da interação entre agentes autônomos. Cada cobra segue regras locais simples para procurar alimento, avaliar caminhos, evitar outras cobras e crescer. Ao colidir com o corpo de outra cobra, ela morre e se transforma em alimento, alterando o ambiente para os demais agentes.

A combinação dessas regras gera comportamentos que não foram programados diretamente, como competição por recursos, aglomerações, diferenças de crescimento, mortes em cadeia e oscilações na população. Pequenas diferenças entre os agentes também influenciam suas decisões, fazendo com que algumas cobras assumam mais riscos enquanto outras priorizam caminhos mais seguros.

Controles:
- Clique do mouse: cria uma concentração de alimento na posição escolhida.
- Tecla F: adiciona novas partículas de alimento ao ambiente.
- Tecla S: adiciona uma nova cobra à simulação.
- Tecla R: reinicia completamente o ecossistema.

Os controles permitem interferir nas condições do ambiente sem determinar diretamente o comportamento dos agentes. Por exemplo, criar uma concentração de alimento pode atrair várias cobras para uma mesma região, aumentando a competição e a possibilidade de colisões e mortes em cadeia.

Autor: Pedro Elias

Prompt usado: Crie em p5.js uma simulação inspirada em Slither.io para explorar o conceito de emergência apresentado na aula. Faça múltiplas cobras controladas por agentes autônomos que se movimentam pelo ambiente em busca de pequenas partículas de alimento geradas naturalmente. As cobras devem crescer ao comer, avaliar diferentes direções para buscar alimento e evitar colisões com outras cobras. Quando uma cobra atingir o corpo de outra, ela deve morrer e seu corpo deve se dissolver em novas partículas de alimento, que poderão atrair as cobras restantes. Faça com que novas cobras possam surgir gradualmente e que pequenas diferenças de comportamento entre os agentes produzam competição, aglomerações e outros padrões emergentes sem determinar diretamente o resultado da simulação. Inclua também controles para adicionar alimento, adicionar novas cobras, reiniciar a simulação e criar concentrações de alimento com o mouse.
