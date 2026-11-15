---
title: Descanso à beira-mar
tags: [Generativo, Gemini Argon, Praia]
collection: projeto final/Luiz Henrique Pacheco/1
---

🌊🌊🌊🌊🌊 Orla da Praia Procedural🌊🌊🌊🌊🌊🌊

Uma experiência de arte generativa contemplativa que simula a visão aérea (top-down) de uma orla marítima. Projetado para proporcionar relaxamento visual, o sketch combina ruído de Perlin (Perlin Noise) e funções trigonométricas assimétricas para criar costas únicas e o movimento orgânico do quebrar das ondas na areia.

Funcionalidades Principais

- A cada execução (ou duplo clique), um novo recorte costeiro é gerado aleatoriamente com distribuição natural de guarda-sóis, esteiras, coqueiros que balançam ao vento e gaivotas sobrevoando a orla.

Ciclo de Iluminação em Tempo Real: O sketch lê automaticamente o relógio do sistema (hour()) para ajustar a paleta de cores e sombras sem necessidade de intervenção manual:

☀️ Dia (06h00 – 15h59): Sol Tropical — águas azul-turquesa vibrantes e areia clara.

🌅 Tarde (16h00 – 18h59): Entardecer Dourado — tons quentes de âmbar, sombras alongadas e reflexos dourados.

🌙 Noite (19h00 – 05h59): Luar Sereno — tons profundos de azul-noturno e reflexos prateados na água.

Próximos passos:

- Gostaria de implementar o audio das ondas batendo na areia para dar ainda mais sensação de relaxamento e talvez ser uma aba que possa ser deixada ao fundo no monitor enquanto o usuário faz alguma outra atividade.

- Penso também em implementar um sistema de pomodoro, onde a cada 30min o som das ondas é trocado por sons de chuva para indicar o momento de descanso. Mudaria a animação para terem gotas d'água e um timer ao canto da tela. Mas fico em dúvida se algo assim quebraria a intenção da arte pela arte.
