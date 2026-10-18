---
title: Paisagem Bordada pela Rede
tags: [AI, ChatGPT, imagem, animação, p5.js, CORS, bordado]
collection: artefato da semana/8
---

# Paisagem Bordada pela Rede

**Autor:** Arthur Ramos  
**Tecnologia:** p5.js 2.2.3  
**Auxílio de IA:** ChatGPT

## Descrição

Este sketch transforma uma fotografia remota em uma tapeçaria interativa. A imagem original não é desenhada no canvas. Depois de carregar a fotografia pela internet, o programa cria uma cópia reduzida, consulta suas cores com `loadPixels()` e substitui cada pixel amostrado por duas linhas diagonais. O conjunto dessas pequenas marcas forma milhares de pontos-cruz e faz a paisagem reaparecer como um bordado.

O mouse funciona como uma agulha ao contrário: sua aproximação afasta os pontos e abre falhas temporárias no tecido. Cada ponto é ligado à posição original por uma força de mola, por isso o bordado se recompõe lentamente. Um clique provoca um desfiado mais forte.

O desenho se adapta ao tamanho da janela com `windowWidth` e `windowHeight`. A quantidade de pontos também é calculada de acordo com o espaço disponível.

## Como interagir

- Mova o mouse sobre a imagem para afastar os fios.
- Clique para produzir um desfiado mais forte.
- Pressione `Espaço` para pausar ou continuar o movimento.
- Pressione `R` para refazer as pequenas inclinações dos pontos.
- Pressione `S` para salvar a composição atual.

## Requisitos técnicos

- O projeto usa p5.js **versão 2.2.3**, carregada pelo CDN jsDelivr no arquivo `index.html`.
- A biblioteca p5.js não está incluída no ZIP.
- A imagem-base também não está incluída no ZIP.
- É necessário estar conectado à internet ao abrir o sketch.
- Os arquivos do projeto estão diretamente na raiz do ZIP.

## Processo com IA

O ChatGPT foi usado para desenvolver e comentar o código.

