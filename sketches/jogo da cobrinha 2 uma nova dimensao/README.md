---
title: Jogo da Cobrinha 2 - Uma nova dimensão
tags: [generative, AI, Claude, Snake, Game, 3D, Model, Graphs, Algorithms]
collection: artefato da semana/10
---

# Cobra 3D autônoma

Um jogo da cobrinha que se joga sozinho, num espaço tridimensional. A cobra caça maçãs dentro de uma gaiola de arestas finas, cresce a cada uma que come e, quando enche o espaço ou fica sem saída, o mundo reinicia. Ninguém controla nada: o usuário só observa e, se quiser, orbita a câmera.

## A ideia

O jogo da cobrinha clássico vive numa grade 2D e depende de um jogador. Aqui duas coisas mudam:

1. **A grade vira um reticulado 3D** de 7 × 7 × 7 células. A cobra anda de célula em célula, nas seis direções (cima, baixo, esquerda, direita, frente, trás).
2. **O jogador vira um algoritmo.** A cobra escolhe sozinha o próximo passo, e o interesse está em assistir às decisões dela.

O corpo da cobra não é uma fila de cubos. É **um tubo contínuo e liso**, cuja forma é refeita a cada quadro conforme ela se move. Esse é o centro do sketch e a razão de o 3D valer a pena: a cobra é uma malha viva.

## Como o sketch funciona

### O mundo

- Um reticulado de `N = 7` células por lado, com `CELULA = 46` unidades de aresta.
- A **gaiola** é a moldura do reticulado: 12 caixas finas empacotadas com `buildGeometry()` uma única vez, no `setup()`.
- A **maçã** aparece numa célula livre aleatória e flutua e gira devagar. Quando é comida, outra surge.

### A cobra como malha

A cobra é guardada como uma lista de células, da cabeça ao rabo. Para desenhá-la, o sketch segue estes passos:

1. Converte as células em pontos do espaço e **interpola** a cabeça e o rabo entre uma célula e a seguinte, para o movimento ser fluido e não aos saltos.
2. **Suaviza** o caminho com subdivisão de Chaikin, que corta os cantos e transforma as quinas em curvas.
3. **Varre um círculo** ao longo do caminho, em `tubo()`: a cada ponto cria um anel de vértices, transportando o quadro de referência de um anel para o seguinte (transporte paralelo) para o tubo não torcer.
4. **Costura as faces** entre anéis vizinhos, com índices em sentido anti-horário visto de fora, como a aula ensina.
5. **Fecha as pontas** com anéis de raio decrescente, e define o perfil do raio: cabeça mais grossa e cauda afinando.
6. Chama `computeNormals(SMOOTH)`, para o corpo ficar liso, sem facetas.

Como o tubo muda o tempo todo, a malha anterior é descartada com `freeGeometry()` antes de criar a nova. É o caso citado em aula: uma malha reconstruída a cada quadro vaza memória de vídeo se não for liberada.

### A maçã

A maçã e o caule são sólidos de revolução feitos à mão em `revolucao()`: um perfil `[raio, y]` girado em torno do eixo y, como o vaso da aula. O perfil da maçã tem uma covinha no topo e outra embaixo.

Esses perfis têm raio mínimo de 0,05 nos polos, e não zero. Uma versão anterior usava `sphere()` e `cylinder()` e gerava no console o aviso `face has colinear sides or a repeated vertex`: os polos dessas primitivas têm vértices repetidos, e o `computeNormals(SMOOTH)` os funde, deixando triângulos degenerados.

### O cérebro da cobra

A cada passo (`PASSO = 230` ms), a função `decidir()` escolhe a próxima célula:

1. **Busca o menor caminho até a maçã** (busca em largura no reticulado), sem atravessar o próprio corpo.
2. **Verifica se é seguro.** Simula o corpo depois de comer e confirma que a cabeça ainda alcançaria o próprio rabo. Se sim, segue pela maçã.
3. Se não for seguro, **persegue o rabo**, que sempre abre espaço, para ganhar tempo.
4. Se isso também falhar, escolhe o **vizinho com mais espaço livre** ao redor (preenchimento por inundação).
5. Se não houver nenhum movimento possível, o mundo **reinicia**. Ele também reinicia quando a cobra chega a `MAX = 40` células.

O placar no canto mostra maçãs comidas, recorde, tamanho atual e número da rodada.

### Luz e material

A cena usa `ambientLight`, uma `directionalLight` fixa e uma `pointLight` azulada que orbita a gaiola. A cobra é verde com `specularMaterial` e `shininess`. A maçã é vermelha e brilhante, e o caule é fosco. O modelo não traz cor ou material próprio: `fill()` e os materiais são decididos no sketch, como na aula.

### Exportar

Com o sketch rodando, as teclas **O** e **S** salvam a malha da cobra **naquele instante** em `cobra.obj` e `cobra.stl` (binário), via `saveObj()` e `saveStl()`. Dá para fotografar a cobra em qualquer pose e abrir o resultado em outro programa.

## Uma ideia que ficou pelo caminho: tubos como obstáculos

Numa fase posterior do desenvolvimento, para dar mais desafio, o espaço ganhou **tubos fixos como obstáculos**. Eram caminhos aleatórios pelo reticulado, suavizados e transformados em canos coloridos pela mesma função `tubo()`. A cobra tinha de contornar os canos e o próprio corpo para chegar às maçãs.

A ideia funcionava, mas foi **descontinuada em favor da visualização**. Com os canos, a cena ficava carregada e disputava a atenção com o que importa: a cobra se movendo, crescendo e desenhando curvas no espaço. Sem eles, o corpo é lido com clareza, e a busca de caminho continua interessante porque, quando a cobra fica longa, o maior obstáculo passa a ser ela mesma.

Um vestígio ficou no código: o conjunto `obst` existe, vazio, e a busca de caminho o consulta. Se quiser reativar o desafio, basta povoá-lo com as células a evitar.

## Parâmetros para experimentar

Ficam no início do `sketch.js`:

| Constante | Valor | O que controla |
|---|---|---|
| `N` | 7 | lado do reticulado, em células |
| `CELULA` | 46 | tamanho de cada célula |
| `LADOS` | 12 | lados da seção do tubo; menos é mais leve, mais é mais redondo |
| `PASSO` | 230 | milissegundos entre um passo e o seguinte |
| `MAX` | 40 | tamanho em que o mundo reinicia |

O raio do corpo e o perfil de afinamento estão em `malhaCobra()`. Como a malha da cobra é refeita a cada quadro, o custo cresce com o comprimento: se o sketch pesar, reduza `LADOS` ou `MAX`.

## Conceitos da aula usados

- `p5.Geometry` construída ponto a ponto: `vertices` e `faces`, com a ordem dos índices.
- `computeNormals(SMOOTH)`, e o motivo de os vértices repetidos importarem.
- `buildGeometry()` para a gaiola, calculada uma vez no `setup()`.
- Sólido de revolução feito à mão, para a maçã e o caule.
- `freeGeometry()` para malhas reconstruídas a cada quadro.
- `fill()`, `specularMaterial()`, `shininess()` e luzes sobre uma malha sem material próprio.
- `saveObj()` e `saveStl()` para o caminho de volta.
