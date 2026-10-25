---
title: Uma Bagatela
tags: [AI, Claude, webgl, 3d, santos-dumont, 14-bis, historia, brasil, jogo]
collection: artefato da semana/9
---

Campo de Bagatelle, Paris, 23 de outubro de 1906. O 14-bis de Alberto
Santos Dumont está na grama: células de pipa de bambu e seda, motor
Antoinette atrás com a hélice empurrando, o piloto em pé num cesto de
vime e, na frente, a célula móvel que hoje chamamos de canard. Os
comissários do Aéro-Club de France esperam com os pratos na mão. Um
prato vai ao chão quando as rodas saem da grama e outro quando elas
voltam, e a distância entre os dois é o voo.

Quem pilota é você. Naquele dia foram cerca de 60 metros, a uns dois
metros do chão. Em 12 de novembro foram 220 metros em 21,5 segundos. O
14-bis tem pouca sobra de potência, se sustenta melhor rente ao chão e
tem o nariz instável, então é preciso corrigir o tempo todo. No fim, um
recorte de jornal compara o seu voo com o que aconteceu em 1906: o pulo
de 4 a 7 metros de 13 de setembro, que terminou com pouso de nariz e a
hélice partida; a Taça Archdeacon, para mais de 25 metros; o prêmio do
Aéro-Club, para mais de 100; e o recorde de 220.

Interação:
- **Espaço** ou o botão do recorte: dar a partida (em movimento, o
  Espaço corta a ignição; no fim, começa outra tentativa);
- **↑ / ↓** (ou W / S, ou arrastar para cima e para baixo): o canard,
  que levanta e abaixa o nariz. É preciso puxar quando passar de uns
  35 km/h;
- **← / →** (ou A / D, ou arrastar para os lados): leme, contra o vento
  que empurra o avião para a plateia;
- **V**: troca a câmera (lateral, perseguição, público, piloto);
- **R**: recomeça;
- antes da partida, arrastar gira a câmera em volta do avião.

O canvas é quadrado e se adapta à janela. Não há semente fixa de
aleatoriedade: o vento, a plateia e as árvores mudam a cada execução. As
melhores marcas da sessão ficam no "livro de atas".

Técnicas usadas:
- modo `WEBGL` e só primitivas 3D: `box()` para o bambu, a seda, o
  motor, a mesa e a barreira; `cylinder()` para o cesto, os cilindros
  do motor, os pratos, as pessoas, os chapéus e os troncos; `sphere()`
  e `ellipsoid()` para cabeças, copas e a cúpula do pavilhão; `torus()`
  para as rodas; `plane()` para o chão, as placas e a faixa;
- as células de Hargrave são caixas abertas na frente e atrás:
  superfícies e paredes de seda com o quadro de bambu nas arestas.
  Cada asa tem três células e é girada com `rotateX()` para ter
  diedro;
- as partes fixas (avião, plateia, árvores) são gravadas uma vez com
  `buildGeometry()`, cada peça com a sua cor de `fill()`, e desenhadas
  com `model()`. As que se mexem (canard, hélice e rodas) também, cada
  uma no seu próprio sistema de coordenadas;
- hierarquia de transformações com `push()`/`pop()`: posição no campo →
  rumo (`rotateY`) → inclinação nas curvas (`rotateX`) → arfagem em
  torno do ponto de contato das rodas (`rotateZ`) → peças móveis
  encaixadas no avião;
- física simplificada: sustentação e arrasto proporcionais a v², com
  coeficiente de sustentação linear no ângulo de ataque até o estol;
  arrasto induzido menor perto do chão (efeito solo); tração que cai
  com a velocidade; atrito de rolagem. A arfagem é de segunda ordem,
  com amortecimento e uma parcela instável, como num canard. O vento e
  as rajadas vêm de `noise()`;
- quatro câmeras com `camera()` e `perspective()`, suavizadas com
  `lerp()`, e órbita em coordenadas esféricas antes da partida;
- luz ambiente e duas `directionalLight()` (sol baixo de outono e luz
  fria de preenchimento);
- céu numa esfera grande com textura de gradiente; chão, placas de
  distância e faixa do Aéro-Club com texturas desenhadas em
  `createGraphics()`; sombra do avião em elipses translúcidas
  deslocadas na direção do sol;
- painel de instrumentos, avisos e recorte de jornal em HTML por cima
  do canvas (`createDiv()`), com a fonte Playfair Display do Google
  Fonts.

Inspirações:
- as fotografias dos voos de Bagatelle em 1906, que mostram o 14-bis de
  lado, rente à grama, com a plateia de chapéu atrás; daí a câmera
  lateral, a plateia e o recorte de jornal. A página traz uma foto de
  12 de novembro e os dados do voo de 23 de outubro —
  https://www.thisdayinaviation.com/23-october-1906/
- o modelo do 14-bis no simulador de voo livre FlightGear: daí vem a
  ideia de pôr o avião de 1906 para ser pilotado no computador, aqui
  com controles bem mais simples —
  https://wiki.flightgear.org/Santos-Dumont_14-bis

Fontes dos dados (medidas, motor, células, voos e prêmios):
- https://en.wikipedia.org/wiki/Santos-Dumont_14-bis
- https://www.thisdayinaviation.com/23-october-1906/
- 60 m a cerca de 2 m de altura em 23/10 e 220 m em 21,5 s:
  https://militares.estrategia.com/portal/mundo-militar/datas-comemorativas/23-de-outubro-primeiro-voo-do-14-bis-de-santos-dumont-em-paris/

Autor: Henrique Almico Dias da Silva
