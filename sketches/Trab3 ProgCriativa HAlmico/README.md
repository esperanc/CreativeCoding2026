---
title: Layout neoconcreto — posição, dimensão e inclinação
tags: [p5js, generative, neoconcreto, claude, layout, transformacoes]
collection: artefato da semana/3
---

Terceiro artefato da série (extensão dos dois anteriores). O tema
desta semana é layout: cada forma tem sua posição, dimensões e
inclinação especificadas por uma regra geométrica explícita, usando
os conceitos vistos em aula — em vez de sorteadas de forma
totalmente livre.

Técnicas usadas:
- `translate()` / `rotate()` / `scale()` com `push()`/`pop()` para
  posicionar, orientar e dimensionar cada forma (substituindo a
  rotação manual do primeiro artefato).
- `lerp()`, `map()`, `norm()` e `constrain()` para a série principal
  de formas ao longo da diagonal (posição, tamanho em forma de sino
  e ângulo variam com um único parâmetro `t`).
- Coordenadas polares (ângulo igualmente espaçado + raio em faixas)
  para os fragmentos menores e para os raios ao redor do ponto focal.
- `p5.Vector` (`lerp`, `sub`, `normalize`, `add`, `mult`) para a
  geometria da diagonal.

Mantém o canvas quadrado adaptável à janela (`windowWidth`/
`windowHeight`, com `windowResized()`) e a ausência de semente fixa,
então cada execução gera uma composição nova.

Autor: Henrique Almico Dias da Silva

Prompt usado: Crie uma nova versão do sketch anterior que siga uma especificação geométrica de posição, dimensão e inclinação/direção, usando os conceitos vistos em aula: interpolação (lerp), mapeamento de faixas (map), coordenadas polares, vetores (p5.Vector) e transformações afins (translate, rotate, scale, push/pop). Envie apenas um arquivo zip com o sketch, sem pastas dentro.
