---
collection: artefato da semana/2
---

# Gaia Respira

**Autor:** Samuel Vitor  
**Disciplina:** Programação Criativa  
**Atividade:** Artefato da semana 2

## Estado do trabalho

Versão inicial para desenvolvimento artístico. O ZIP de entrega e o `thumbnail.png` serão produzidos depois que a composição final estiver definida.

## Conceito

O sketch apresenta Gaia como uma paisagem-corpo abstrata. Três morros de alturas e larguras diferentes fazem parte de uma única formação contínua e assimétrica, sem detalhes anatômicos explícitos. A perspectiva baixa aproxima quem observa do terreno sem representar literalmente uma parte do corpo.

O slider controla o pulso vertical da paisagem. A mudança não acontece instantaneamente: uma simulação fortemente amortecida cria peso, inércia e acomodação sem balanço excessivo. Para sugerir matéria macia com volume preservado, a formação se estreita quando cresce e se espalha quando baixa. Uma deformação secundária discreta acompanha o movimento dos três morros.

## Requisitos técnicos

- canvas responsivo criado com `windowWidth` e `windowHeight`;
- nova composição a cada execução;
- slider para controlar os montes;
- física de mola e amortecimento;
- desenho feito apenas com `rect()`, `circle()`, `ellipse()`, `arc()` e `line()`;
- compatibilidade com p5.js 2.2.3 e p5Front;
- redimensionamento automático da composição.
