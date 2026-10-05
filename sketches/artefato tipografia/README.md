---
title: Fluidez Reológica e Densidometria Tipográfica
tags: [AI, Gemini, typography, p5js, generative-art, vector-field]
collection: artefato da semana/7
---

# Fluidez Reológica e Densidometria Tipográfica

Este artefato explora a **tipografia como matéria fluida e volumétrica**, afastando-se das abordagens tradicionais (como chuva de texto estilo Matrix, filtros ASCII simples ou partículas isoladas que formam contornos).

## 💡 Conceito
O projeto constrói um **chiaroscuro volumétrico e uma paisagem fluida composta exclusivamente por texto**. O espaço gráfico é gerado através de dois sistemas tipográficos interdependentes:

1. **Campo Densidométrico de Micro-Texto:** Uma grelha tipográfica contínua onde a luz, a sombra e a sensação de profundidade tridimensional são sintetizadas apenas pela variação do peso visual, rotação, espaçamento e opacidade dos caracteres.
2. **Cintas Semânticas Reológicas:** Frases dinâmicas que se comportam como um fluido não-newtoniano. À medida que navegam pelo campo de vetores, as letras esticam, comprimem e rodam individualmente, criando uma ilusão de deformação orgânica e volume.

## 🕹️ Interatividade
* **Mover o Rato:** Funciona como uma lente de distorção viscosa e vórtice de força no campo tipográfico.
* **Clique do Rato:** Dispara uma onda de choque que reorganiza temporariamente a densidade do texto no ponto de impacto.
* **Teclado (Digitação):** Digite qualquer letra para injetar novos caracteres na matriz tipográfica em tempo real.
* **Teclas `1`, `2`, `3`:** Alternam entre diferentes paletas de iluminação tipográfica (*Cyber Monochromic*, *Pergaminho Ocre* e *Cyan Neon*).

## 🛠️ Especificações Técnicas
* **p5.js v2 via CDN:** Biblioteca carregada externamente via jsDelivr (`p5@2.0.0`).
* **Fonte Tipográfica via CDN:** Fonte *Roboto Mono* carregada via Google Fonts CDN (sem ficheiros de fonte incluídos no arquivo local/zip).
