---
title: Ponte noturna
tags: [AI, claude]
collection: artefato da semana/8
---

A minha ideia foi tentar fazer alguma coisa relacionada ao claro e escuro, e eu escolhi essa imagem por ter um bom contraste entre a noite e as luzes da ponte. A imagem é exibida naturalmente em preto e branco, e é possível passar o mouse por ela para devolver as cores para um pedaço da imagem. Contudo, ela é dividida em uma grade, e os elementos da grade rotacionam.

A velocidade de rotação de cada elemento depende do brilho da sua cor, então os pontos mais claros giram mais rápido que os mais escuros. Assim, as luzes da ponte giram com força, enquanto o céu noturno quase não se mexe. Enquanto giram, os elementos também crescem e arredondam os cantos, parecendo saltar da foto. Quando o mouse se afasta, eles perdem a cor aos poucos e voltam devagar para o lugar.

O fundo é uma cópia da foto em tons de cinza feita com filter(GRAY). A grade usa blocos de 12 por 12 pixels, e cada bloco guarda a cor do pixel do seu centro. O brilho dessa cor é convertido em velocidade de rotação com map, e um valor de ativação suavizado com lerp controla o quanto cada bloco está colorido, girando e crescendo, para que a transição não seja brusca.
