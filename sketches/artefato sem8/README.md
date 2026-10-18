---
title: Mosaico de Partículas e Decomposição Cromática
tags: [AI, Gemini, p5js, image-processing, cors, generative-art]
collection: artefato da semana/8
---

# Mosaico de Partículas e Decomposição Cromática

Este artefato explora a **reinterpretação generativa de imagens remotas obtidas via web com suporte a CORS**, transformando fotografia digital em um sistema físico-vetorial interativo.

## 🖼️ Fonte da Imagem Remota e Suporte a CORS
Conforme as especificações do trabalho:
- **Nenhum arquivo de imagem local é incluído no projeto ou arquivo ZIP.**
- A imagem é obtida dinamicamente via requisição HTTP do servidor público **Lorem Picsum** (`https://picsum.photos/`), que disponibiliza cabeçalhos `Access-Control-Allow-Origin: *` (CORS ativado).
- Isso permite que o canvas do p5.js faça a leitura individual de matrizes de pixels (`loadPixels()`) sem ser bloqueado pelas políticas de segurança dos navegadores.

## 💡 Conceito e Mecânica do Sketch
1. **Amostragem da Matriz de Pixels:** A imagem baixada é analisada em uma grade adaptativa. Para cada amostra, são extraídas as componentes RGB, a luminosidade média e as coordenadas de origem.
2. **Sistema Físico de Partículas:** Cada ponto da imagem transforma-se em um elemento vetorial com força elástica de mola que busca retornar à sua posição de origem.
3. **Repulsão e Distorção Interativa:** Ao aproximar o cursor do mouse, as partículas sofrem forças de campo que dispersam a imagem temporariamente.
4. **Três Modos de Renderização Estilizada:**
   - **Modo 1 (Teclado 1):** Pontilhismo Flutuante (círculos variando em escala conforme o brilho do pixel).
   - **Modo 2 (Teclado 2):** Traços de Pincel Vetoriais orientados pelo valor de luminosidade.
   - **Modo 3 (Teclado 3):** Mosaico Halftone Geométrico (anéis e quadrados rotacionados).

## 🕹️ Interatividade
- **Mover o Mouse:** Distorce a imagem e dispersa as partículas com um campo repulsivo.
- **Clique do Mouse:** Faz a requisição de uma **nova imagem aleatória** via CORS diretamente do Picsum.
- **Teclas `1`, `2`, `3`:** Alternam entre os modos de renderização em tempo real.

## 🛠️ Especificações Técnicas
- **p5.js Versão 2 via CDN:** Carregado externamente via jsDelivr (`https://cdn.jsdelivr.net/npm/p5@2.0.0/lib/p5.min.js`).
- **Nenhum arquivo de imagem ou biblioteca local incluído no pacote ZIP.**
