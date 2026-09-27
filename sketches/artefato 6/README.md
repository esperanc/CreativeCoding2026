---
title: O Arquivo que se Organiza Sozinho
tags: [p5.js, arte generativa, emergência, agentes, auto-organização]
collection: artefato da semana/6
---

# O Arquivo que se Organiza Sozinho

**Autor:** Arthur Ramos  
**Artefato da Semana 6 — Emergência**

## Descrição

Este sketch representa um arquivo inicialmente desorganizado. Pequenos documentos coloridos ficam espalhados pelo espaço e agentes autônomos circulam entre eles. Sem mapa, chefe ou posição final predefinida, os agentes recolhem documentos isolados e os soltam perto de outros da mesma categoria. Aos poucos, surgem ilhas de cor que não foram desenhadas diretamente no código.

## Onde está a emergência?

Cada agente conhece apenas o que está perto dele. As regras locais são:

1. caminhar com pequenas mudanças aleatórias de direção;
2. quando estiver vazio, recolher um documento isolado que encontrar;
3. quando estiver carregando, procurar documentos da mesma cor na vizinhança;
4. soltar a carga ao lado de um documento semelhante, se houver espaço;
5. atravessar uma borda e reaparecer na borda oposta.

Nenhuma regra manda criar círculos, pilhas ou regiões específicas. Mesmo assim, o acúmulo dessas decisões individuais produz agrupamentos globais. A forma, a quantidade e a posição das ilhas mudam a cada execução.

## Interação

- **Clique ou toque:** espalha novos documentos perto do cursor.
- **Espaço:** pausa ou continua o sistema.
- **A:** mostra ou esconde os agentes e seus rastros.
- **R:** reinicia com outra distribuição aleatória.
- **S:** salva a imagem atual em PNG.

## Adaptação à tela

O canvas é criado com `windowWidth` e `windowHeight`. Quantidade de agentes, quantidade de documentos, dimensões e raios de percepção são calculados a partir da área disponível. Ao redimensionar a janela, uma nova simulação adequada ao novo espaço é iniciada.

## Arquivos

- `index.html` — página que carrega o p5.js e o sketch;
- `style.css` — remove margens e ocupa toda a janela;
- `sketch.js` — regras, simulação e desenho;
- `thumbnail.png` — imagem representativa do processo.


## Prompt usado

"Crie um sketch generativo e responsivo em p5.js sobre o conceito de emergência. A ideia é representar um arquivo que se organiza sozinho: vários documentos coloridos começam espalhados pela tela, enquanto pequenos agentes se movimentam livremente. Cada agente deve recolher documentos isolados e soltá-los perto de outros da mesma cor. Nenhum agente conhece a organização completa, mas essas regras locais devem fazer surgir grupos de documentos ao longo do tempo. O canvas deve usar windowWidth e windowHeight e gerar uma composição diferente a cada execução. Comente o código para facilitar a compreensão."
