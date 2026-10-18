---
title: Olhos Emprestados
tags: [AI, Claude, imagem, pixels, visão, interação, pintura]
collection: artefato da semana/8
---

# Olhos Emprestados

Autor: Angel Mansilla  
DRE: 123691897

Oito famosos com problema de visão estão na fila pra ver a Mona Lisa, e dá pra ver o quadro pelos olhos de cada um. Pro Stevie Wonder a tela fica preta, porque ele é cego desde bebê. Essa é a piada.

## Como usar

Abre o `index.html` no Chrome, Edge ou Firefox. Precisa de internet, porque o p5.js 2 (versão 2.3.4) vem do jsDelivr, as fontes vêm do Google Fonts e os quadros vêm da Wikimedia. Na pasta não tem nenhuma imagem além da miniatura.

Aperta Espaço e o primeiro da fila vai até o quadro. Quando ele chega, você passa a ver o quadro como ele vê. Aperta Espaço de novo e ele volta pro fim da fila. Esse é o único comando.

## O que cada um vê

1. **Bono** (glaucoma): só o meio fica nítido, o resto escurece. Fica tudo meio roxo por causa dos óculos.
2. **Claude Monet** (catarata): tudo amarelado e embaçado, quase sem azul.
3. **Stevie Wonder** (cego desde bebê): nada.
4. **Brad Pitt** (não reconhece rostos): quando ele olha pro rosto, o rosto se desmonta em pedaços.
5. **John Dalton** (daltonismo): verde e vermelho ficam quase da mesma cor.
6. **Judi Dench** (degeneração macular): uma mancha cobre o ponto pra onde ela olha, então o sorriso some.
7. **Jorge Luis Borges** (cegueira progressiva): tudo vira uma neblina clara, só o amarelo ainda aparece.
8. **Johnny Depp** (míope e quase cego de um olho): de longe tudo borra. Ele chega perto pra ver e o segurança manda ele se afastar.

O olhar de cada um passeia sozinho pelo quadro. Isso tudo é uma aproximação, não uma simulação médica.

## Como fiz

A Mona Lisa vem da internet com `loadImage()`. Quase todas as visões mexem direto nos pixels da imagem, como na aula 7, com `loadPixels()`, o array `pixels` e `updatePixels()`.

O Monet perde o azul e fica borrado com `filter(BLUR)`. O Dalton usa uma fórmula de daltonismo feita por pesquisadores da UFRGS. O Borges só deixa os amarelos acesos. As manchas do Bono e da Judi são formas feitas com `noise()` que recortam a imagem. O rosto do Brad Pitt é cortado em pedaços com `image()`. O Depp é um zoom que vai ficando nítido.

A sala, a fila e as pessoas são desenhadas com formas do p5. A fila é um array: quem vai ver o quadro sai do começo e volta pro fim.

## IA

Fiz com o Claude Code (modelo Claude Opus 5.5). A ideia, a fila e a piada do Stevie Wonder foram minhas. Pedi pro Claude escolher os famosos e fui pedindo as mudanças: a fila andar com o Espaço, quadros de verdade na parede, fontes melhores, só o Espaço como comando, o Stevie em terceiro, e fui apontando o que melhorar nas figuras. O Claude propôs a sala parecida com a do Louvre e a câmera que entra pelos olhos, escolheu os quadros, as fontes e a ordem da fila, escreveu o código, testou no navegador, conferiu os fatos sobre cada famoso e escreveu este README.

## Créditos

- *Mona Lisa*, Leonardo da Vinci (Louvre, domínio público): https://commons.wikimedia.org/wiki/File:Mona_Lisa,_by_Leonardo_da_Vinci,_from_C2RMF_retouched.jpg
- *A Rendeira*, Johannes Vermeer (Louvre, domínio público): https://commons.wikimedia.org/wiki/File:Johannes_Vermeer_-_The_lacemaker_(c.1669-1671).jpg
- *A Liberdade guiando o povo*, Eugène Delacroix (Louvre, domínio público): https://commons.wikimedia.org/wiki/File:Eug%C3%A8ne_Delacroix_-_Le_28_Juillet._La_Libert%C3%A9_guidant_le_peuple.jpg
- *Mulher ao espelho*, Ticiano (Louvre, domínio público): https://commons.wikimedia.org/wiki/File:Portrait_d%27une_Femme_%C3%A0_sa_Toilette,_by_Titian,_from_C2RMF_retouched.jpg
- Fontes de letra Cormorant Garamond e Inter, do Google Fonts: https://fonts.google.com/specimen/Cormorant+Garamond e https://fonts.google.com/specimen/Inter
- Fórmula do daltonismo (Machado, Oliveira e Fernandes, 2009): https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html
- Stevie Wonder: https://www.biography.com/musicians/stevie-wonder-blindness-vision-loss
- Bono: https://www.nbcnews.com/health/bono-explains-sunglasses-u2-singer-says-he-has-glaucoma-1D80225189
- Judi Dench: https://www.expressandstar.com/whats-on/arts-and-entertainment/dame-judi-dench-it-has-become-impossible-to-read-my-scripts-5877553
- Claude Monet: https://sciencehistory.org/stories/magazine/could-claude-monet-see-like-a-bee/
- John Dalton: https://blog.scienceandindustrymuseum.org.uk/john-dalton-colour-blindness/
- Brad Pitt: https://www.cbsnews.com/amp/news/brad-pitt-face-blindness-prosopagnosia-neurological-disorder-cant-recognize-faces
- Johnny Depp: https://www.everythingzoomer.com/general/2013/06/19/johnny-depp-is-almost-blind/
- Jorge Luis Borges: https://blog.alexwaterhousehayward.com/2014/06/los-colores-de-jorge-luis-borges.html
- Aula "7 - Imagem" da disciplina: https://github.com/esperanc/CreativeCoding2026
- p5.js: https://p5js.org/
