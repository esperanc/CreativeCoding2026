---
title: Sombra Construída
tags: [AI, Claude, webgl, 3d, geometry, mesh, shadow-volume]
collection: artefato da semana/10
---

# Sombra Construída

O renderizador do p5 não faz sombra. As luzes acendem as superfícies voltadas para elas e ignoram por completo o que está atrás: um objeto não escurece outro, e nada projeta nada no chão. Isso não é um descuido da biblioteca, é uma conta que o motor não faz — saber se a luz chega a um ponto exigiria perguntar se alguma outra parte da cena está no caminho, e nenhuma luz do p5 pergunta isso.

Então aqui a sombra é **construída**. Não desenhada, não simulada, não aproximada com um borrão escuro no chão: modelada, com uma lista de vértices e uma lista de faces, como qualquer outra malha. O que se vê no meio da cena não é um efeito de iluminação — é um sólido, de casca fechada e orientada, que por acaso ocupa exatamente a região do espaço onde a luz não chega. Apertando a tecla `O` ele sai num arquivo `.obj` que abre no Blender.

## Como o sketch funciona

- **O objeto é uma superfície estrelada.** Para cada direção do espaço existe um raio, e a casca é o conjunto desses pontos: a esfera mais o que cada braço puxa naquela direção. Como o raio é sempre positivo, a malha fecha sozinha e nunca se atravessa — e isso não é enfeite, é a garantia de que a pergunta "onde a luz não chega" tem resposta única.

- **Cada execução traz uma peça diferente.** Sorteia-se quantos braços o objeto tem, para que lado eles apontam e de que ponto do percurso a lâmpada parte; a tecla `R` sorteia outra. O que não se sorteia é a sombra: ela continua sendo a resposta exata à mesma pergunta, e muda porque a pergunta mudou. O giro dos braços é aplicado às **direções** antes de a casca nascer, e não à malha pronta — assim a grade de triângulos acompanha a nova forma, e a sombra sai do objeto de verdade, não de uma cópia girada depois.

- **O raio é uma soma, não um máximo.** A versão óbvia da conta toma o braço que mais puxa em cada direção, e isso tem quina: no meio do caminho entre dois braços a função troca de dono e a superfície ganha uma dobra. A grade de triângulos atravessa essa dobra na diagonal e o resultado aparece como degrau — um serrilhado grosso que não some aumentando a resolução. Somando as contribuições, os braços se misturam num vale liso e a casca fica sem quina nenhuma. Uma superfície lisa é o que torna possível o passo seguinte.

- **A malha é soldada antes de qualquer coisa.** A grade de uma volta fechada nasce com a emenda duplicada: os vértices do começo e do fim ocupam o mesmo lugar sem serem o mesmo vértice. O método abaixo mede uma grandeza em cada vértice, e na emenda não soldada essa grandeza teria dois valores no mesmo ponto — a curva da silhueta se rasgaria exatamente ali. É a mesma soldagem que o `computeNormals(SMOOTH)` faz por dentro, usada aqui para outro fim. Nas duas fileiras dos polos a célula da grade também não é um quadrado, e sim um triângulo, de modo que ali só se emite um triângulo por célula: emitir dois deixaria um de área zero, do qual o p5 reclama uma vez por face depois de soldar.

- **A silhueta sai de um campo, não das arestas.** Em cada vértice mede-se o cosseno entre a normal e a direção que vem da lâmpada: negativo quer dizer virado para a luz, positivo quer dizer de costas. A silhueta é onde esse número passa por zero. Dentro de cada triângulo o campo varia linearmente, então o zero é um segmento de reta, e o ponto em que ele corta uma aresta sai de uma regra de três entre os valores das pontas. Dois triângulos vizinhos calculam o **mesmo** ponto para a aresta que dividem, porque partem dos mesmos dois números — é por isso que a curva fecha sem fenda. O algoritmo clássico de volume de sombra percorre as arestas da malha e por isso só consegue uma silhueta poligonal, do tamanho da faceta; esta corta os triângulos por dentro e sai lisa, de modo que a sombra deixa de denunciar a resolução do objeto.

- **O sólido tem três partes e uma regra de orientação.** A parte escura da casca é recortada ao longo da curva — cada triângulo cai num de quatro casos, e nos dois do meio o pedaço escuro é um triângulo ou um quadrilátero. Esse recorte, com a volta invertida, é a tampa de cima; o mesmo recorte projetado no chão é a de baixo, que é exatamente a sombra achatada de sempre; e as paredes ligam uma à outra ao longo do contorno. A ordem dos índices não é escolha de gosto: ao longo da curva a tampa e a parede dividem a mesma aresta e precisam percorrê-la em sentidos **opostos**, ou a casca deixa de ser orientável. Das combinações possíveis, uma só funciona.

- **A sombra é refeita quando a luz anda.** Construir custa alguns milissegundos e a lâmpada se move devagar, então o sólido só é reconstruído quando o ângulo mudou o bastante para a diferença aparecer; a malha anterior é devolvida com `freeGeometry()`. Entre uma reconstrução e outra, a cena roda sem nenhum custo a mais.

- **O sólido é desenhado sem material.** Com as luzes ligadas, um `fill()` sem `ambientMaterial()` sai como cor chapada, que ignora as lâmpadas. É o certo aqui por teimosia de coerência: iluminar uma sombra seria absurdo, e a tampa de cima, que encara a lâmpada em cheio, sairia clara. Opaco e chapado, o sólido se lê como escultura — o que informa a sua forma é o contorno, que muda quando se gira a câmera, como num teatro de sombras. A metade escura do objeto é pintada quase exatamente com a mesma cor, de modo que a emenda entre um e outro não se nota.

- **A iluminação é de uma lâmpada só**, com um resto de luz ambiente fazendo as vezes do céu. Duas ou três luzes deixariam a cena mais bonita e acabariam com o assunto: com várias fontes não existe *a* sombra.

- **A lâmpada vai e volta num arco, em vez de dar a volta inteira.** Não é economia. Dando a volta completa ela passa por trás do objeto, e nesse momento o sólido aponta para a câmera e engole o quadro inteiro de preto — medindo, a tela chegava a 50% de pixels escuros, contra 14% a 30% ao longo do arco. Oscilando em torno da direção de quem olha, a lâmpada fica sempre atrás do observador, que é como se posiciona uma luz para estudar uma sombra, e o sólido se afasta pelo fundo. Para ver de outro lado, gira-se a câmera — que é o movimento certo para isso.

- Todas as medidas derivam de `min(windowWidth, windowHeight)` e `windowResized()` reconstrói tudo, de modo que a cena cabe em qualquer formato de tela.

### Controles

| tecla / gesto | ação |
|---|---|
| arrastar | gira a câmera em volta da cena |
| roda do mouse | aproxima e afasta |
| `R` | sorteia outra peça |
| `3` a `8` | número de braços, mantendo a inclinação sorteada |
| `L` | põe a câmera **na lâmpada** |
| `P` | pausa o giro da luz |
| `C` | mostra só o contorno da silhueta |
| `V` | deixa o sólido translúcido, para ver por dentro |
| `M` | mostra o esqueleto: contorno, raios e chão |
| `S` | salva a imagem num PNG |
| `O` | exporta a sombra como arquivo `.obj` |

Vale insistir em duas delas. A tecla `L` põe a câmera no lugar **exato** da lâmpada, e dali o sólido desaparece por completo atrás do objeto — não por truque de desenho, mas porque é isto que uma sombra é: o pedaço de espaço que o objeto esconde de quem está na luz. Tem de ser o lugar exato; de um palmo atrás, a projeção parte de outro centro e o sólido reaparece pelas beiradas. E a tecla `O` é o argumento inteiro numa tecla: se a sombra fosse um efeito de iluminação não haveria o que exportar; como ela é uma `p5.Geometry` igual a qualquer outra, ela sabe se gravar em disco, e o arquivo que sai é uma peça fechada que se pode medir, cortar ao meio ou mandar imprimir.

## Inspiração

A técnica tem nome e idade: **volume de sombra**, de Frank Crow, 1977 — a ideia de que a região escura atrás de um objeto pode ser tratada como um sólido, em vez de um efeito. Crow a propôs para jogos, onde ela resolve sombras exatas sem traçar raios; aqui ela é usada ao contrário, não para render mais rápido mas para que a sombra exista como coisa.

A segunda referência é mais velha e vem do desenho à mão. Em geometria descritiva, a sombra de um corpo em perspectiva se acha traçando um raio de luz por ponto do contorno até o plano do chão e ligando os pés desses raios. É literalmente o que a tecla `M` desenha: o contorno em cima, a sua projeção embaixo, e o feixe de retas entre os dois. Essas retas são as geratrizes da parede — o sólido inteiro é uma superfície regrada, feita de segmentos, e é por isso que ele pode ser escrito com dois triângulos por pedaço do contorno. O que o sketch faz é esse desenho de prancheta, só que fechado e em três dimensões.

A escolha do tema. Os caminhos mais trilhados da modelagem 3D em programação criativa — sólidos de revolução, poliedros e cristais, terrenos de ruído, nuvens de cubos, planetas, nós toroidais, árvores e conchas — tratam todos a malha como **a forma que se quer ver**. Aqui a malha construída à mão não é a forma que se quer ver: é a ausência dela. O objeto que faz a sombra é só o pretexto, e nenhuma linha do programa decide como a sombra deve parecer. A forma que aparece é consequência de onde a lâmpada está.

## Sobre o uso de IA

O artefato foi desenvolvido com auxílio do Claude (AI), a partir da minha escolha de tema e de sucessivas rodadas de teste em navegador. Duas percepções aqui só apareceram rodando o sketch de verdade, e nenhuma delas se resolveria raciocinando sobre o código:

A primeira foi que `createCamera()`, no p5 2, **cria** a câmera mas não a põe em uso. Sem `setCamera()`, tudo o que se pede a ela é guardado e ignorado, e a cena continua sendo desenhada pela câmera padrão. O sintoma é desconcertante justamente por ser silencioso: mover a câmera não dá erro nenhum, simplesmente não faz efeito — afastar de dez para quarenta raios dava a mesma imagem, pixel por pixel.

A segunda foi a orientação da casca. Ao longo do contorno, a tampa e a parede dividem a mesma aresta, e as duas combinações que pareciam naturais percorriam essa aresta no **mesmo** sentido, o que deixa trechos do sólido virados do avesso. O defeito não aparece na imagem e passa até por um teste de volume com sinal, porque pedaços invertidos ainda somam a favor; só ficou visível contando as arestas dirigidas e exigindo que cada uma apareça uma vez em cada sentido.

## Autor

Artur Taboada Dios Carvalho

## Como visualizar este projeto

**Usando o ambiente online (p5front)**

1. Acesse o ambiente de desenvolvimento utilizado na disciplina: [https://esperanc.github.io/p5front/](https://esperanc.github.io/p5front/).
2. Copie todo o conteúdo do arquivo `sketch.js` deste zip e cole na área de edição de código do site.
3. O resultado será renderizado na tela de visualização após o botão "Run" ser clicado. Cada clique em "Run" — ou cada toque na tecla `R` — sorteia uma peça diferente. Vale arrastar o mouse para girar em volta do sólido, e vale apertar `L` pelo menos uma vez: é a vista em que a sombra prova que é sombra.

Nenhuma biblioteca externa além do p5.js é necessária.
