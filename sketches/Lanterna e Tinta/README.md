---
title: Lanterna e Tinta
tags: [AI, Claude, WEBGL, p5.Geometry, buildGeometry, chase, game]
collection: artefato da semana/10
---

Aluna: Júlia Vilela

Artefato feito com auxílio de AI (Claude), em modo WEBGL com p5.js 2.

Uma lanterninha de papel foge de três bolhas de tinta num piso de pedra. Por onde a lanterna passa, as lajotas acendem; por onde a tinta passa, elas apagam. Quando 65% do piso estiver aceso, o nível sobe e as bolhas ficam mais rápidas. Você tem 5 vidas.

As três bolhas perseguem de jeitos diferentes:

* A **verde** vai direto até a lanterna.
* A **roxa** mira onde a lanterna vai estar daqui a quase um segundo.
* A **vinho** tenta fechar o cerco pelo lado oposto ao da verde.

Quando alguma chega perto, todas passam a ir direto. Se você ficar 5 segundos sem mexer, a lanterna passa a fugir sozinha, escolhendo a cada instante a direção com mais caminho livre, mais tinta para limpar e menos bolhas por perto.

## Interação

* Setas ou WASD movem a lanterna.
* Clique ou arraste: a lanterna vai até o ponto do piso sob o mouse. O ponto é calculado com um raio que sai da câmera até o plano do chão.
* Espaço dá um pulo de velocidade, com recarga de pouco mais de 2 segundos.
* `R` recomeça.
* `E` salva a cena em STL (`lanterna-e-tinta.stl`). `O` salva em OBJ (`lanterna-e-tinta.obj`).

## Tecnologia

* p5.js 2.x carregada por CDN (`cdn.jsdelivr.net/npm/p5@2`), sem a biblioteca no zip.
* Nenhuma fonte e nenhum arquivo de imagem. O texto na tela é HTML comum.

