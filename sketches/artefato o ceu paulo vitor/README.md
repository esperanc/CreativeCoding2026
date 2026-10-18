---
title: O Céu que os Prédios Esqueceram
tags: [AI, ChatGPT, imagem, CORS, arquitetura, fragmentação, interação]
collection: artefato da semana/8
---

# O Céu que os Prédios Esqueceram

**Autor:** Paulo Vitor

Este sketch usa uma fotografia de prédios vistos de baixo como matéria-prima para uma máquina de memória visual. A imagem é separada em faixas horizontais: as partes mais escuras se afastam mais, como se a arquitetura estivesse sendo repelida pelo vazio luminoso. O resultado não é apenas um filtro; a geometria da composição nasce dos valores de luminosidade encontrados na própria fotografia.

O cursor funciona como uma lente de restauração. Perto dele, as faixas voltam gradualmente à posição original; longe dele, continuam sujeitas à oscilação e ao deslocamento. Assim, a mesma foto alterna entre documento, ruína digital e reconstrução.

## Imagem remota

- Fotografia de **Anthony DELANOIX**, disponibilizada pelo Lorem Picsum: https://picsum.photos/id/1048/info
- Página da fotografia original: https://unsplash.com/photos/b5POxb2aL9o
- URL carregada pelo sketch: https://picsum.photos/id/1048/1200/800

A fotografia **não está incluída neste projeto**. Ela é obtida durante a execução por uma URL pública com CORS. O único PNG do pacote é `thumbnail.png`, usado exclusivamente como metadado de pré-visualização do p5Front.

## Interação

- **Mover o mouse:** restaura localmente a fotografia e altera o campo de distorção.
- **Clique ou tecla R:** cria uma nova configuração de deslocamentos.
- **Tecla S:** salva uma captura da composição atual.

## Requisitos técnicos

O canvas se adapta à janela com `windowWidth` e `windowHeight`. A biblioteca p5.js versão 2 é carregada por CDN no `index.html`; nenhuma cópia da biblioteca, fonte ou fotografia faz parte do ZIP.

## Uso de IA

O projeto foi desenvolvido com auxílio do **ChatGPT** para concepção, programação, documentação e testes.
