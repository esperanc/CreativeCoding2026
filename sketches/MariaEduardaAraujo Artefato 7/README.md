---
title: Oceano Topográfico Tipográfico
tags: [Typography, perlin noise, generative text, AI, Gemini]
collection: artefato da semana/7
---

# Artefato 7: Tipografia

**Autora:** Maria Eduarda Araújo  
**DRE:** 119054059  

## Sobre o Projeto
Para o artefato com o tema "Tipografia", o meu objetivo foi fugir aos clichés de desenhar contornos de palavras estáticas ou utilizar a biblioteca de som. Então a ideia foi fazer é um "Oceano Topográfico Tipográfico", onde o texto não funciona apenas para ser lido, mas atua como a própria matéria-prima (os píxeis) da imagem gerada.

O sketch utiliza uma *string* de caracteres organizada por peso visual e densidade (do espaço vazio aos símbolos como `%` e `@`). Através de laços de repetição que formam uma grelha no ecrã, cada célula avalia a sua posição utilizando uma combinação de funções trigonométricas (`sin`) e Ruído de Perlin (`noise`). 

Dependendo da "elevação" matemática dessa coordenada, o algoritmo seleciona o caractere apropriado para ser desenhado, alterando dinamicamente o seu tamanho e a sua coloração (num gradiente de azuis profundos a cianos brilhantes). O resultado é a emergência de um mar tridimensional feito puramente de tipografia padrão do sistema (`monospace`).

## Regras Técnicas Cumpridas
* **p5.js v2 via CDN:** A biblioteca é carregada exclusivamente pelo CDN no `index.html`. Nenhum ficheiro da biblioteca p5.js ou p5.sound.js está incluído no arquivo zip.
* **Preâmbulo:** O ficheiro README conta com o cabeçalho descritivo YAML solicitando identificação de uso de IA (Gemini) e a respetiva coleção ("artefato da semana/7").
* **Sem Fontes Externas:** A fim de evitar bloqueios de CDN, foi utilizada uma abordagem nativa, recorrendo apenas à fonte `monospace` incorporada pelo browser, anulando a necessidade de importar ficheiros `.ttf` ou `.otf`.

## Processo de Criação
Utilizei a inteligência artificial (Gemini) para ajudar a estruturar a lógica matemática complexa da grelha textual. Solicitei especificamente que a resposta aliasse o conhecimento de Artefatos anteriores (como o *Flow Field* do Artefato 6 e a distribuição por grade do Artefacto 3) com o novo requisito da tipografia, resultando num código otimizado, inteiramente responsivo e visualmente hipnótico.
