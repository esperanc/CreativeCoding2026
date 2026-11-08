---
title: Aqui Está a Sua Mão
tags: [AI, Claude, webgl, 3d, malha, obj, p5.Geometry, metalinguagem, humor]
collection: artefato da semana/10
---

Um chat em que a IA se representa trabalhando. O pedido é simples:
"Faça uma mão." A IA responde com toda a confiança ("Claro! Aqui está
uma mão humana anatomicamente correta, com cinco dedos, modelada
vértice a vértice:") e escreve o arquivo OBJ linha por linha, enquanto
a malha se monta ao lado: primeiro os vértices, como pontos, depois as
faces. A mão sai com seis ou sete dedos.

Cada reclamação recebe um pedido de desculpas cada vez mais caprichado
("Você tem toda a razão, e agradeço muito por apontar isso!") e uma
"versão corrigida", com nome de arquivo cada vez mais desesperado
(`mao_corrigida_final_v2.obj`, `mao_final_DE_VERDADE.obj`...). O
defeito apontado some e aparecem outros, a confiança declarada sobe de
97% para 100% (verificado), e depois de algumas rodadas a IA às vezes
jura que corrigiu o que não corrigiu. O contador de pedidos de
desculpas fica no topo.

Os defeitos são os erros de verdade de quem escreve uma malha à mão:
- dedos a mais, a menos, grudados, dois polegares, um dedo comprido
  demais, articulações dobrando para trás;
- um dedo com as faces na ordem errada: a normal aponta para dentro e
  a luz acende pelo lado errado;
- mão sem normais: o OBJ não traz `vn` e ninguém chamou
  `computeNormals()`, então a luz não tem com o que trabalhar e a mão
  sai preta;
- normais `FLAT` onde deviam ser `SMOOTH`: a mão sai facetada, "como
  um cristal";
- faces faltando: um buraco na palma.

Interação:
- as respostas do usuário são botões no pé do chat: uma para cada
  defeito visível ("Tem 7 dedos.", "Está toda preta.", "Tem um dedo do
  avesso."...), mais "Isso não é uma mão." e "Está ótima, obrigado.";
- "Baixar ....obj" salva a mão atual com `saveObj()`, para abrir em
  qualquer programa 3D;
- arrastar sobre a mão gira a vista (`orbitControl`); a roda aproxima.

O canvas é quadrado e se adapta à janela. Não há semente fixa de
aleatoriedade: cada mão e cada sequência de defeitos são sorteadas de
novo.

Técnicas usadas:
- a mão é gerada por código como duas listas, vértices e faces (trios
  de índices): a palma é uma pilha de anéis de seção de superelipse,
  do pulso aos nós dos dedos; cada dedo é um tubo de seção elíptica
  que segue um eixo com três falanges, dobrado nas articulações, com a
  ponta arredondada por anéis que encolhem; as aberturas são fechadas
  por tampas em leque. Anéis vizinhos são costurados com dois
  triângulos por célula, a mesma conta de grade `j * (n + 1) + i` da
  superfície e do sólido de revolução;
- a ordem dos índices de cada face é escolhida para a normal apontar
  para fora (sentido anti-horário visto de fora), conferida pelo sinal
  do volume da malha fechada; o dedo "do avesso" só inverte essa ordem;
- as listas viram texto OBJ (`v x y z`, `f a b c`, índices a partir
  de 1, com comentários confiantes da IA, como `# dedos: 5
  (conferido)`). O texto aparece no chat e, ao terminar, vira um
  `Blob` lido com `loadModel(url, { fileType: ".obj", normalize: false })`;
- enquanto o texto é escrito, a malha aparece aos poucos: os vértices
  como pontos (`beginShape(POINTS)`) e as faces num `p5.Geometry`
  parcial, refeito a cada poucos quadros e liberado com
  `freeGeometry()`;
- `computeNormals(SMOOTH)` para a mão "certa", `computeNormals(FLAT)`
  para a facetada e nenhuma chamada para a preta;
- `saveObj()` para baixar a malha;
- grade de chão de programa 3D com `line()`, luz ambiente, duas
  `directionalLight()` e `specularMaterial()`;
- chat em HTML sobre o canvas (`createDiv`, `createButton`), com as
  fontes IBM Plex do Google Fonts.

Inspirações:
- as mãos de seis dedos das imagens geradas por IA, que viraram a
  piada mais conhecida sobre o assunto; a matéria explica por que os
  modelos erram tanto as mãos —
  https://petapixel.com/2023/03/02/why-ai-image-generators-cant-get-hands-right/
- o hábito dos assistentes de pedir desculpas e concordar com tudo
  ("Você tem toda a razão!"), discutido como bajulação (sycophancy) dos
  modelos de linguagem —
  https://www.anthropic.com/research/towards-understanding-sycophancy-in-language-models
- "A Traição das Imagens" ("Isto não é um cachimbo"), de René Magritte
  (1929): uma imagem que contradiz o próprio texto. Aqui é o contrário:
  o texto insiste que a imagem é o que ela não é —
  https://en.wikipedia.org/wiki/The_Treachery_of_Images

Autor: Henrique Almico Dias da Silva
