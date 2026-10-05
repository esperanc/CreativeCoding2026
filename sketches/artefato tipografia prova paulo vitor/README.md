---
title: Prova de que Estive Aqui
tags: [AI, ChatGPT, typography, fingerprint, redaction, interactive]
collection: artefato da semana/7
---

# Prova de que Estive Aqui

**Autor:** Paulo Vitor Couto  
**Auxílio de AI:** ChatGPT

## Conceito

O sketch apresenta um dossiê fictício que tenta apagar a identidade de uma pessoa. A impressão digital à direita é construída exclusivamente com pequenas frases posicionadas sobre curvas concêntricas. À esquerda, trechos do depoimento foram cobertos por blocos tipográficos feitos com o caractere `█`.

O cursor funciona como uma luz forense. Ao se aproximar da impressão, as letras ficam maiores e vermelhas, tornando as frases legíveis. Ao passar pelos trechos censurados, a luz troca os blocos pelo conteúdo escondido. A imagem discute a tensão entre apagar um registro e deixar rastros: quanto mais o documento tenta esconder alguém, mais a tipografia reconstrói sua presença.

## Por que a base é tipográfica

- As cristas da impressão digital são sequências de caracteres, não linhas ou imagens.
- As tarjas de censura são formadas por glifos `█`, não retângulos.
- A moldura, as divisões, o código de barras, as marcas da lupa e todos os elementos informativos são compostos com texto.
- Não são usados `textToPoints`, `textToContours`, imagens externas ou arquivos de fonte.

As únicas formas geométricas preenchidas são o fundo da mesa e o papel, que funcionam como suporte. A imagem e sua narrativa são produzidas por texto.

## Interação

- **Mover o mouse:** investiga a impressão digital e revela trechos censurados.
- **Clique ou tecla R:** gera outro dossiê, com frases, falhas e número de processo diferentes.
- **Tecla S:** salva a composição atual em PNG.

## Requisitos técnicos

O canvas usa `windowWidth` e `windowHeight` e se adapta ao espaço disponível. O `index.html` carrega **p5.js 2.3.2** por CDN. O ZIP não contém a biblioteca p5.js, p5.sound.js ou arquivos de fonte.

## Arquivos

`index.html`, `style.css`, `sketch.js`, `README.md` e `thumbnail.png`, todos diretamente na raiz do ZIP.
