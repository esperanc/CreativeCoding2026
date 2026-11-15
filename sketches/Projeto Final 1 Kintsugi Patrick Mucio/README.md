---
title: Kintsugi Generativo
tags: [AI, Claude, kintsugi, emergência, cerâmica, fissuras, generative-art, interativo]
collection: projeto final/PATRICK MUCIO RODRIGUES PEREIRA/1
---

# Kintsugi Generativo — o que quebra, brilha

**Nome:** PATRICK MUCIO RODRIGUES PEREIRA
**Projeto final — parte 1 (1ª entrega)**

*Kintsugi* (金継ぎ, "emenda de ouro") é a técnica japonesa de consertar cerâmica
quebrada com laca e pó de ouro. A rachadura não é escondida: ela passa a fazer parte
da história do objeto e o torna mais valioso.

Neste sketch, um **prato de cerâmica é gerado por código**: o esmalte, a paleta
(celadon, porcelana azul, tenmoku, terracota, shino, índigo) e a decoração pintada
(pétalas, ondas ou escamas *seigaiha*) mudam a cada prato. Cada clique é um **impacto**:
fissuras nascem do ponto clicado, se ramificam e se propagam. Quando cada fissura para,
**o ouro escorre por dentro dela**, segmento por segmento, e brilhos percorrem as emendas.

## Como funciona

- **Fissuras como agentes:** cada fissura é um agente que caminha em passos curtos.
  A cada passo a direção sofre uma pequena perturbação gaussiana e uma leve atração
  para fora do prato (trincas reais tendem a correr para a borda).
- **Ramificação:** com uma pequena probabilidade a fissura se divide. O ramo filho
  herda parte da "energia" que sobrou e fica mais fino.
- **Parada:** uma grade de ocupação (320×320) registra por onde as fissuras já passaram.
  Uma fissura para quando **encontra outra fissura**, chega à **borda** ou perde energia.
  O padrão final de cacos não foi desenhado: ele **emerge** dessas regras locais
  (conceito de emergência do artefato 6).
- **Ouro:** depois que uma fissura termina, o ouro a percorre com um pequeno atraso,
  com brilho (`shadowBlur`) e tons de ouro que variam com o ruído de Perlin.
- **Camadas:** o prato (estático), as fissuras e o ouro ficam em três `createGraphics`
  separados e desenhados de forma incremental, então o sketch continua leve mesmo com
  milhares de segmentos. Tudo é calculado em coordenadas normalizadas (raio = 1).
  Por isso, ao redimensionar a janela, o prato e todas as fissuras são redesenhados
  no novo tamanho.
- O canvas usa `windowWidth`/`windowHeight` e o prato se encaixa no espaço disponível.

## Interação

| Ação | Efeito |
|---|---|
| Clique no prato | impacto naquele ponto |
| `ESPAÇO` | impacto em um ponto aleatório |
| `N` | novo prato (nova semente, esmalte e decoração) |
| `A` | liga/desliga o modo automático (o prato se quebra e se refaz sozinho) |
| `S` | salva a imagem em PNG |

## Técnico

- p5.js **2.4.0** carregado por CDN (jsDelivr). A biblioteca **não** está no zip.
- Sem imagens nem fontes externas: tudo é desenhado por código.
- Feito com auxílio de IA (**Claude**, Anthropic), que ajudou na ideia, no código
  e na revisão.

## Ideias para o projeto final (até a 3ª entrega)

O tema geral é **"reparo"**: transformar a quebra em algo belo. Até a entrega final
pretendo acrescentar:

1. **Cacos de verdade (parte 2):** usar as fissuras fechadas para recortar o prato em
   polígonos (fragmentos). Os cacos se separam e caem com uma física simples e depois
   voltam ao lugar, colados com ouro. O usuário poderá arrastar os cacos para
   remontar o prato.
2. **Som:** usar p5.sound para o estalo da cerâmica no impacto (com intensidade de acordo
   com a força) e um som suave de sino enquanto o ouro escorre. Também quero quebrar o
   prato com o **microfone**: um som alto (palma, grito) gera um impacto.
3. **3D / WebGL (parte 3):** levar o prato para uma tigela em WebGL, com iluminação
   e as emendas douradas em relevo, para girar e observar de vários ângulos.
4. **Tipografia:** o usuário escreve uma lembrança ou "algo que se quebrou", e o texto
   é gravado ao longo das linhas de ouro (`textToPoints` com fonte de CDN).
5. **Galeria de reparos:** guardar os pratos consertados (semente + impactos) e
   mostrar uma "coleção" com todos eles, ou exportar um cartão de cada prato.
6. **Envelhecimento:** com o tempo, o prato pode receber microfissuras, manchas de chá
   e desgaste do esmalte, para que cada peça conte sua própria história.
