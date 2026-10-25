---
title: Oceano de Tração
tags: [AI, Claude, 3D, webgl, tensegridade, relaxacao-dinamica, generative]
collection: artefato da semana/9
---

# Oceano de Tração

Numa **tensegridade** as barras rígidas não se tocam. Nenhuma delas encosta em outra: cada uma flutua, presa apenas por cabos, que não empurram nada — só puxam. O conjunto fica de pé porque a compressão das barras e a tração dos cabos se cancelam exatamente. Buckminster Fuller chamou isso de "ilhas de compressão num oceano de tração"; Kenneth Snelson passou a vida fazendo esculturas assim.

A forma desta estrutura não foi desenhada. O programa recebe a **topologia** — quem se liga a quem, e se o elo é barra ou cabo — e **três comprimentos**. Mais nada: nenhuma coordenada, nenhum ângulo. Todo o resto é descoberto.

## Como o sketch funciona
- A geometria é achada por **relaxação dinâmica**, o método com que se projetam estruturas de cabos de verdade. Parte-se de um palpite errado de propósito — um cilindro com metade da torção de que a estrutura precisa, mais ruído —, cada peça puxa ou empurra as suas duas pontas, o sistema perde energia a cada passo, e para onde as forças se cancelam. Onde ele para é a resposta.
- A diferença entre as duas peças cabe numa linha: **o cabo desiste quando está frouxo**. Esticado, puxa; encolhido, não faz força nenhuma. A barra responde nos dois sentidos. Dessa assimetria — e apenas dela — nasce uma forma rígida feita de peças que não se encostam.
- A **protensão** é o que enrijece tudo: a barra pede para ser 6% mais longa do que cabe, o cabo 15% mais curto. Essa briga não tem nada de decorativo, como se vê abaixo.
- **As barras são sólidas e não se atravessam.** Essa é a peça de física sem a qual a estrutura não existe. O par de pontos mais próximos entre dois segmentos no espaço é calculado analiticamente, e a força de recusa é repartida entre as quatro pontas conforme onde o encontro acontece.
- O programa **confere o próprio resultado**. A relaxação nem sempre acerta: existe um segundo equilíbrio em que um módulo vira ao contrário e as barras ficam quase encostadas — também um ponto de força zero, mas não uma tensegridade. Em vez de aceitar o que vier, o sketch testa se todo cabo está puxando, toda barra comprimida e nenhum módulo virado; se não presta, desmonta e recomeça. Dá para assistir: às vezes ele tenta duas ou três vezes antes de fechar.
- Nada fica parado. A protensão **respira** num ciclo lento, e a estrutura responde mudando de forma. A **cor dos cabos** mostra quanto cada um está puxando, normalizada entre a menor e a maior tração do momento — é assim que o campo de forças, que é invisível, fica à vista. Num mastro de três módulos os 21 cabos se repartem em apenas quatro valores de tração: a simetria da estrutura se mostrando sozinha.
- Nenhuma medida é fixa em pixels. O raio é escolhido para que o mastro caiba na janela, a partir da altura total medida no resultado da relaxação (cerca de 1,63 raio por módulo), e `windowResized()` refaz tudo. Funciona de 390×780 a 2560×620.

## O que foi medido
Tudo abaixo saiu de ensaios no navegador, não de estimativa:

- **60 montagens em 60**, de 1 a 5 módulos, todas terminando em tensegridade válida — todos os cabos tracionados, todas as barras comprimidas.
- **A torção emerge.** Para o prisma de três barras a teoria prevê que os triângulos das pontas se fechem a 150° um do outro. Esse número não entra em lugar nenhum do solucionador, que só conhece comprimentos e ligações. Medido no resultado: **150,9° / 149,4° / 150,3° / 150,0°** para 2, 3, 4 e 5 módulos. O módulo solitário dá 137,4°, e com razão: sem vizinhos, as condições de contorno são outras.
- **A folga entre as barras é obra dos cabos, não minha.** A repulsão existe para proibir o colapso durante a montagem, mas na estrutura pronta ela simplesmente **não age**: zero pares dentro do limiar, e as duas barras mais próximas ficam a 46 unidades de distância contra um limiar de 14,6. A menor distância entre barras se mantém em **14,9% do comprimento da barra** em todas as configurações.
- **A respiração não quebra o equilíbrio**: 90 amostras ao longo de três ciclos completos, nenhuma inválida.
- A física custa **12 µs por passo**, e são 14 passos por quadro — irrelevante diante do desenho.

## Inspiração
A referência é **Kenneth Snelson**, que em 1948 construiu a primeira dessas estruturas, e **Buckminster Fuller**, que lhe deu o nome (*tensional integrity*) e a frase que batiza este artefato. O que me interessou não foi a forma, e sim o fato de que ela **não pode ser desenhada** — só encontrada. Um escultor não decide onde a barra fica; ele decide os comprimentos, amarra, e a estrutura escolhe sozinha a única posição em que as forças fecham. Esse é exatamente o papel que o programa cumpre aqui.

A escolha do tema foi por exclusão. A aula percorreu o 3D como **posicionar primitivas por transformações e iluminá-las**: sistema solar hierárquico, colunata radial, vitrine de primitivas, níveis de detalhe da malha, as quatro luzes, materiais, textura, faixa com `TRIANGLE_STRIP`, terreno de ruído com `buildGeometry`, e o retrato ondulando numa grade texturizada. As quatro sugestões de exploração — anéis no sistema solar, escultura de caixas com figura diferente de cada lado, altura de terreno pelo brilho da imagem, luz pontual seguindo o mouse — seguem a mesma lógica. Aqui as primitivas são as mesmas (`cylinder` para as peças, `sphere` para as juntas, `rotate` em torno de um eixo arbitrário para deitar cada haste na direção certa, `ambientLight`, `directionalLight`, `pointLight`, `specularMaterial`, `ambientMaterial`, `emissiveMaterial`, `orbitControl`), mas elas não compõem a cena: **elas mostram o resultado de um cálculo**. Nenhum `translate` neste sketch leva um objeto a um lugar escolhido por mim.

E o modo WEBGL não é um requisito cumprido, é a razão de ser da peça. Uma tensegridade é um objeto cujo conteúdo inteiro é espacial: numa imagem plana ela vira um emaranhado de riscos cruzados, e a única coisa que importa — que as barras passam perto umas das outras sem jamais se tocarem — é justamente o que a projeção destrói. Só orbitando em volta é que a estrutura se explica. Em duas dimensões ela não é difícil de desenhar: é impossível de existir.

## Sobre o uso de IA
Desenvolvido com auxílio do **Claude** (AI), a partir da minha escolha de tema e de muitas rodadas de ensaio em navegador. Três erros só apareceram rodando o código, e os três são instrutivos:

O primeiro quebrava tudo antes de começar. `const TORCAO = (5 * PI) / 6;` no topo do arquivo falha, porque **as constantes do p5 só passam a existir quando a biblioteca cria a instância do sketch**, e isso acontece depois que o arquivo é lido — o `setup()` nem chegava a ser definido. Constante de módulo precisa de `Math.PI`.

O segundo era de física, e mais interessante. Com protensão fraca (cabo a 0,95) a relaxação convergia para uma configuração com **os 21 cabos frouxos** — que é um equilíbrio perfeitamente legítimo, já que cabo frouxo não faz força, e completamente inútil. Uma varredura de valores mostrou que só a partir de 0,90 a estrutura fecha com todos os cabos puxando ao mesmo tempo. O diagnóstico também revelou por que: sem protensão suficiente o mastro se alongava 48% além do projeto e a torção caía de 150° para 120°.

O terceiro foi uma hipótese minha que o ensaio derrubou. Imaginei que **tensionar os cabos progressivamente**, como faz um montador de verdade, ajudaria a estrutura a encontrar a posição certa. Testado, foi muito pior: a taxa de acerto caiu de 11/12 para 1/12, porque assentar frouxo deixa a estrutura torta e o aperto depois só a trava naquela posição. Aplicar a protensão inteira de uma vez é melhor — o contrário do que a intuição dizia.

## Autor
Artur Taboada Dios Carvalho

## Como visualizar este projeto

**Usando o ambiente online (p5front)**
1. Acesse o ambiente de desenvolvimento utilizado na disciplina: [https://esperanc.github.io/p5front/](https://esperanc.github.io/p5front/).
2. Copie todo o conteúdo do arquivo `sketch.js` deste zip e cole na área de edição de código do site.
3. Clique em "Run". A estrutura leva alguns segundos para se montar, e vale ficar olhando essa parte: é possível ver o conjunto embaralhado procurar a posição e, de vez em quando, desistir e recomeçar.

Depois de montada, **arraste para girar em volta** — é a única maneira de ver que as barras não se tocam. A roda do mouse aproxima e afasta, `espaço` desmonta tudo para ver a montagem de novo, as teclas `1` a `5` mudam o número de módulos do mastro e `C` esconde os cabos, deixando só as barras flutuando.

Nenhuma biblioteca além do p5.js é necessária, e nenhum arquivo externo acompanha o projeto.
