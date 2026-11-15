---
title: Sistema em 60 Hz
tags: [AI, Claude, 2D, simulação, sistema elétrico, agentes, frequência, osciloscópio]
collection: projeto final/Carolina Abdu/1
---

A obra é uma simulação interativa de um sistema elétrico em 2D, em que o mapa mostra o que acontece quando a demanda muda. Uma hidrelétrica, uma usina solar, três térmicas (A, B e uma turbina de pico) e três cargas (cidade, indústria e litoral) ficam ligadas por nove linhas. Cada usina é um agente: reage ao desvio de frequência, respeita uma rampa de subida e, no caso das térmicas, tem um tempo de partida visível na tela. A frequência vem de um balanço simples entre geração e carga e aparece num osciloscópio, cuja senoide deriva e muda de cor quando se afasta de 60 Hz, junto de um histórico de frequência com faixas de alarme. Quando a demanda sobe, térmicas partem; quando cai muito, elas desligam, a solar é limitada e a hidrelétrica reduz a geração e verte água na barragem. O fluxo de potência é calculado nas linhas (aproximação DC), que mudam de verde para vermelho, ganham brilho e vibram ao passar de 100% da capacidade, enquanto partículas mostram o sentido do fluxo. O dia típico acorda a cidade pela manhã, deixa a solar sustentar o meio-dia e a perde no fim da tarde, e o gráfico da carga líquida mostra o efeito da curva do pato. No modo livre, a hora, a demanda extra, um pico de +200 MW e uma nuvem sobre a solar podem ser controlados pelos botões e barras. A IA (Claude) foi utilizada como ferramenta de apoio no desenvolvimento do código em p5.js, auxiliando na modelagem da frequência e do despacho, no cálculo do fluxo nas linhas e na organização do painel. A partir dessas sugestões, o código foi adaptado e refinado para alcançar o resultado visual desejado.

**Prompt sugestivo:**

> Crie um sketch em p5.js (versão 2, por CDN) de uma simulação didática de um sistema elétrico em 2D: um mapa com 6 barras e 9 linhas, uma hidrelétrica, uma usina solar, três térmicas e três cargas. A frequência (60 Hz) deve variar conforme o balanço entre geração e carga, e aparecer num osciloscópio com histórico. As usinas são agentes com rampa, controle por desvio de frequência e tempo de partida; térmicas partem quando a demanda sobe e desligam quando cai, a solar é limitada e a hidro verte água quando sobra geração. Calcule o fluxo nas linhas (fluxo DC) e mostre o carregamento por cor, brilho e vibração. Inclua um dia típico (demanda com pico da manhã, solar ao meio-dia e pico da noite, com gráfico de geração e carga líquida) e um modo livre com controles de hora, demanda extra, pico de demanda e nuvem.

**Ideias para o trabalho final e o que será acrescentado até a 3ª entrega:**

Esta é a 1ª entrega: o núcleo da simulação (frequência, despacho das usinas, fluxo nas linhas e dia típico com curva do pato). O objetivo é transformar a simulação numa peça visual e didática, em que se entenda o sistema elétrico só de olhar.

- Caso estocástico: falhas aleatórias de usinas e de linhas, vento e nuvens imprevisíveis e picos de demanda sem aviso. O sistema reage ao imprevisto, e um placar mede por quanto tempo ele aguenta sem cortar carga.
- Contingência de linha (critério N-1): ao perder uma linha, o fluxo se redistribui e outras linhas sobrecarregam, com risco de efeito cascata.
- Mais fontes: usina eólica e baterias, que mostram como o armazenamento suaviza a queda da solar no fim da tarde.
- Visual e som: shaders (aula 10) para o brilho das linhas e a persistência do osciloscópio, e um zumbido cujo tom acompanha a frequência.
- Mapa mais autoral: relevo desenhado com ruído (aula 4), nuvens que passam de fato sobre a usina solar e dia e noite mais marcados.
- Interface: cenários prontos (dia comum, onda de calor, seca com reservatório baixo), botão para reiniciar e ajuste da dificuldade.
- Polimento: mensagens didáticas durante os eventos, atalhos de teclado e revisão do desempenho.

Plano de entregas: 2ª entrega com o caso estocástico e a contingência de linha; 3ª entrega com as novas fontes, shaders, som, cenários e o polimento final.
