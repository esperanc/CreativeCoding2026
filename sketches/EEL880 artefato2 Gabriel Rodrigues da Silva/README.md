---
title: Versão 2 - Composição no estilo cyberpunk com quads
tags: [quads, ai, gemini, generative, cyberpunk]
collection: artefato da semana/2
---

Uma continuação do sketch da aula 1 feito pelo Gemini (agora usando as primitivas da aula 2).

Autor: Gabriel Rodrigues da Silva
DRE: 121044858

Para a construção desse trabalho, foram usados vários prompts, partindo de um código inicial gerado pelo Gemini 3.1 Pro.

Prompt inicial utilizado:

```plain
"Quero fazer uma continuação do meu trabalho. Crie um sketch estático e generativo em p5.js. O canvas deve agora ocupar todo o espaço disponível do navegador usando windowWidth e windowHeight. Mantenha a estética Cyberpunk e o desenho do celular moderno no canto superior esquerdo, mas faça as seguintes evoluções:

No fundo, pare de usar quad() e gere dezenas de formas geométricas variadas da nova aula (ellipse, rect, triangle).

Implemente um algoritmo para garantir que nenhuma dessas formas geradas no fundo se sobreponha à outra.

Por fim, adicione a função windowResized() para recriar o canvas e redesenhar a arte automaticamente se o usuário mudar o tamanho da janela. Documente o código de forma didática focando nessas novidades."
