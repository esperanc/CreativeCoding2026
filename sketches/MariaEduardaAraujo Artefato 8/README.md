---
title: Colinas e céu
tags: [AI, Gemini, imagem, generativa, cors, perlin noise]
collection: artefato da semana/8
---

# Artefato 8: Imagem Viva

**Autora:** Maria Eduarda Araújo  
**DRE:** 119054059  

## Sobre o Projeto
Para o artefato desta semana o tema exigia a incorporação de uma imagem da internet usando CORS, decidi criar uma obra generativa mais natural de meio ambiente e ceu e tals. 

A base visual do sketch é uma paisagem extraída do servidor permissivo `picsum.photos`. Contudo, a imagem estática original nunca é desenhada na tela. Em vez disso, 300 agentes autônomos navegam organicamente pelo *canvas* utilizando Ruído de Perlin. A cada *frame*, eles utilizam o método `get()` para ler a cor do pixel exato onde se encontram, recriando a paisagem de forma impressionista com pinceladas translúcidas e alongadas.

## Regras Técnicas Cumpridas
* **Apenas Arquivos Remotos (CORS):** Nenhuma imagem foi carregada a partir de arquivos locais e não há fotos dentro do pacote. A paisagem é extraída diretamente via API.
* **p5.js v2 (Assíncrono):** A lógica foi estruturada utilizando `async function setup()` e `await loadImage()`, respeitando a arquitetura da versão 2.0. O ambiente hospeda a biblioteca via CDN.

## Processo de Criação
Utilizei a inteligência artificial (Gemini) para formatar a estrutura de agentes ("pincéis") e a atualização arquitetural do p5.js v2. O prompt guiou a IA para evitar exibir a imagem como um fundo estático, explorando a matemática espacial e o mapeamento de cores (`get()`) para criar uma pintura fluida que honrasse as colinas verdes e o céu azul da referência original.
