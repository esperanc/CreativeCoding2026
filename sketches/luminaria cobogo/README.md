---
title: Luminária Cobogó
tags: [AI, Claude, WebGL 3D, shader, cobogó, luminária, paramétrico]
collection: artefato da semana/10
---

Luminária Cobogó
Uma luminária paramétrica feita de cobogós, acesa numa sala à noite. Você escolhe o formato, o desenho e o tamanho da peça, e a luz que passa pelos vazados projeta o desenho nas paredes, no teto e nos móveis.

Feita com p5.js 2 no modo WEBGL. Continua os cobogós paramétricos do artefato da semana 9: lá eles formavam uma parede; aqui viram um objeto que se ilumina.

A ideia
O cobogó é o bloco vazado da arquitetura brasileira, criado em Recife na década de 1920. Ele deixa passar o ar e a luz, mas filtra o sol, e a sombra que ele desenha no chão faz parte da arquitetura. Esta luminária inverte o caminho: a luz agora vem de dentro, e o cobogó desenha a sombra na sala em volta.

A peça foi pensada para ser impressa em 3D. Por isso o sketch também estima o material, o tempo de impressão e o preço de cada combinação.

Como funciona
1. A peça
O corpo é uma única malha construída com buildGeometry():

Cada face do prisma é um retângulo com uma grade de vazados. Os furos são feitos com beginContour(), e o p5 triangula a face com eles.
A face é desenhada no plano XY e levada para o lugar com applyMatrix(), que a gira para a direção certa e a encosta no prisma.
Uma segunda face, um pouco menor, forma o lado de dentro. As paredes de cada furo ligam a face de fora à de dentro, então a peça tem espessura de verdade (3,5 mm).
Embaixo (luminária de mesa) ou em cima (pendente) fica uma placa com o furo do bocal.
Cada desenho é uma função que devolve os vazados de um módulo, em coordenadas de 0 a 1. O mesmo desenho serve para qualquer formato e tamanho da peça.

2. As sombras
O p5 ilumina cada forma separadamente e não projeta sombras. Por isso a sala é desenhada com um shader próprio, que calcula a sombra em cada ponto:

Para cada ponto da parede, o shader traça o raio que vem da lâmpada até ele.
Pelo ângulo do raio, descobre por qual face da luminária ele sai e em que altura.
Consulta uma máscara do desenho: um createGraphics() com os furos pintados de branco sobre o preto.
Se o raio passou por um furo, o ponto recebe luz quente, mais fraca quanto mais longe da lâmpada. Se bateu na cerâmica, fica na sombra.
O aparador também faz sombra: o shader testa se o raio atravessa a caixa do móvel antes de chegar à parede.

3. Os números
Com a área e o volume da peça, o sketch estima quanto PLA a impressão gastaria (paredes externas sólidas, miolo com preenchimento parcial) e quantas horas levaria. Somando filamento, máquina, mão de obra, kit elétrico e embalagem, chega a um preço de venda. Os custos vêm de uma oficina de impressão 3D real; parte deles ainda é estimativa.

Parâmetros
Parâmetro	Opções
Formato	hexagonal, quadrada, octogonal ou cilíndrica
Desenho do cobogó	Pétalas, Círculo, Losango, Ampulheta, Quadras, Ondas, Arco, Folha, Cata-vento, Meia-lua, Gota, Ogivas
Tamanho	P (12 × 18 cm), M (16 × 24 cm), G (22 × 32 cm)
Escala do desenho	cobogós grandes (≈ 6 cm), médios (≈ 4,5 cm) ou finos (≈ 3,4 cm)
Uso	luminária de mesa ou pendente
Cor	terracota, branco cal, concreto, verde musgo, azul azulejo, ocre, grafite
Acabamento	fosco ou acetinado
A forma cilíndrica é um prisma com muitas faces. O número de faces depende da escala do desenho, para os cobogós não ficarem esticados.

Interação
Arrastar: gira a câmera. Roda do mouse: aproxima. Botão direito: desloca.
Dia / Noite: muda a luz ambiente. À noite, só a luminária ilumina a sala.
Surpreenda-me: sorteia uma combinação.
Salvar imagem ou tecla S: baixa um PNG.
Feito com auxílio de AI (Claude).
