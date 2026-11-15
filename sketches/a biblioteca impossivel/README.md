---
title: A Biblioteca Impossível
tags: [generative, AI, Claude, Monks, Escher, Geometry, Penrose, Multiverse, Feromone, Illusion]
collection: projeto final/Diogo dos Santos Machado Vieira/1
---

# Biblioteca impossível

Uma escada de Penrose construída com geometria 3D **real e descontínua**, habitada por monges que sobem e descem sem fim. Feita em p5.js 2.0.3 (WEBGL) como trabalho final de disciplina de programação criativa.

A peça junta três camadas que se explicam entre si:

1. **Uma ilusão de percepção:** o anel parece fechar só de um ponto de vista exato.
2. **Um sistema de agentes:** 40 monges com regras locais, sem coordenação global.
3. **Emergência medida:** faixas de circulação e trilhas surgem sozinhas, e um painel mostra números.

### Controles

| Controle | O que faz |
|---|---|
| Arrastar | Gira a câmera (elevação limitada) |
| `P` | Alterna projeção ortogonal e perspectiva |
| `R` | Volta ao ponto ideal da ilusão |
| `T` | Alterna a vizinhança dos agentes entre "mundo" e "tela" |
| Slider **Revelar** | Separa os quatro lances e os pinta de cores diferentes |
| Slider **Viés à direita** | Liga uma regra explícita de manter a direita |
| Slider **Feromônio** | Liga a estigmergia nos degraus |
| Sliders **az** e **el** | Ajuste fino (±3°) do ponto ideal |

## Concepção

### A ideia

A escada de Penrose (Penrose e Penrose, 1958), popularizada por Escher em *Ascendente e Descendente* (1960), é um objeto que não existe: um circuito de degraus que sobe o tempo todo e volta ao ponto de partida. Em vez de desenhar a ilusão em 2D, o projeto a constrói em 3D de verdade. Uma peça de geometria real, com a trapaça escondida em um único deslocamento, e que se desfaz quando a câmera sai do lugar certo.

O ponto de partida foi escolher algo em que os conceitos de 3D da disciplina fossem **necessários** para a ilusão funcionar, e não enfeite. Existe um objeto só, e tudo que se acrescentou serve a ele.

### Por que a ilusão funciona

O circuito não é fechado. É uma espiral de quatro lances (10, 10, 6 e 6 degraus) ligados por quatro patamares de canto, com 36 blocos no total (32 degraus e 4 patamares). Ao fim da volta, o último patamar fica deslocado do início em:

```
D = (4s, 4s, 32h)
```

onde `h` é a subida de um degrau e `s` é o seu passo. A diferença entre os lances (10 contra 6 degraus) é o que dá o deslocamento horizontal `4s`, e os 32 degraus dão a subida `32h`.

Em projeção **ortogonal**, quaisquer pontos que diferem por um vetor paralelo à direção de visão caem no mesmo lugar da tela. Então basta que `D` seja paralelo à câmera. Isso fixa a geometria:

- Azimute da câmera: 45° (porque `Dx = Dy`).
- Elevação: `tan(el) = 32h / (√2 · 4s)`. Com a razão `s/h = 8/√6`, isso dá `tan(el) = √3`, ou seja, **60°**.

Por isso a escada tem degraus rasos (passo cerca de 3,3 vezes a subida): é o custo de manter degraus contínuos e a emenda fechando exatamente a 60°. Na projeção em **perspectiva**, a profundidade denuncia o deslocamento e a ilusão quebra. O projeto usa essa quebra de propósito (tecla `P`).

### A regra de cor da costura

O fim do circuito, mais perto da câmera, mostra a parede lateral do último patamar por cima do primeiro degrau. Para essa costura não aparecer, o **primeiro degrau** (piso e lateral visível) recebe o mesmo tom da parede lateral do último patamar, sem degradê. É a mesma lógica de Escher: duas superfícies a profundidades diferentes só lêem como uma se tiverem o mesmo tom.

### Geometria

- `blocos()` gera a lista de blocos do circuito (degraus e patamares) e o primeiro degrau "virtual" do próximo ciclo.
- `fita(a, B)` transforma **cada lance em um sólido só**: um perfil em dente de serra extrudado pela largura, montado à mão em um `p5.Geometry` (vértices, faces e normais). A primeira versão usava uma caixa por degrau, e as laterais liam como tijolos separados. A fita deixa a lateral uma faixa contínua.
- Os quatro lances são geometrias separadas. Isso permite deslocá-los no modo revelação e é o que o deslocamento `D` faz de fato.

### Shader

Um shader GLSL próprio (`VERT` e `FRAG`) substitui as luzes do p5. Ele calcula o tom por **orientação da face** a partir da normal: topo claro, uma lateral média, a outra escura. Como duas faces iguais têm o mesmo tom, mesmo em posições diferentes, a emenda desaparece. A cor de vértice (RGB) leva dois usos:

- o **degradê dos pisos** (mais escuros junto ao espelho do degrau), que é a única pista de onde cada degrau começa;
- a **cor dos livros**, multiplicada pelo tom do carvalho.

### Câmera

Órbita própria com `camera()` e elevação limitada. Perto do ponto ideal (menos de cerca de 6°), a câmera encaixa sozinha com easing. O modelo é construído com Z para cima, e uma `rotateX(HALF_PI)` o converte para o Y para baixo do p5.

### Modo revelação

O slider afasta os quatro lances na vertical, pinta cada um de uma cor (`TINTS`) e recua a câmera. Dá para girar e ver que se trata de uma espiral, não de um anel. O encaixe da câmera fica desligado enquanto o slider está fora de zero.

## O sistema de agentes

Quarenta monges, vinte subindo e vinte descendo, caminham pelo circuito. Cada um tem posição ao longo do caminho (`s`), posição lateral (`l`), velocidade e direção. As regras são **só locais**:

- anda na própria velocidade preferida;
- freia se há alguém à frente, na mesma faixa lateral, dentro do alcance de visão;
- desvia lateralmente para o lado com mais espaço;
- tem um pequeno ruído lateral, para quebrar a simetria.

Quando um monge completa a volta, a posição salta em `D`. Na tela esse salto não aparece, e é isso que faz a caminhada parecer infinita. O caminho dos agentes usa uma normal lateral com quina (miter) nos cantos e muda de altura exatamente na borda entre blocos, para não haver saltos.

### Emergência medida

O painel mostra quatro números, atualizados a cada 20 quadros:

| Medida | Como é calculada |
|---|---|
| Fluxo | Travessias da emenda nos últimos 10 s |
| Velocidade média | Média das velocidades dos 40 agentes |
| Segregação em faixas | Distância lateral entre o centro de quem sobe e o de quem desce, como porcentagem do máximo |
| Sobreposições | Pares de monges fisicamente no mesmo lugar |

A pergunta que o painel permite responder é: **faixas de circulação surgem sem que nenhuma regra as mencione?** Compare a segregação com tudo desligado, com o viés à direita (uma regra explícita) e com o feromônio.

### Estigmergia (slider Feromônio)

Cada monge deposita feromônio na célula (bloco) e na faixa lateral (esquerda, centro, direita) onde está, em campos separados por população. O feromônio evapora com constante de tempo de cerca de 6 s. Com o slider ligado, o monge olha a célula à frente e vai para a faixa com mais rastro da própria população, evitando o rastro da outra. O feromônio aparece como marcas translúcidas sobre os pisos.

### Percepção pela tela (tecla T)

No modo "mundo", o monge vê quem está à frente no caminho. No modo "tela", só vê quem também está perto dele **na projeção 2D**. No ponto ideal isso não muda nada, porque a emenda não aparece na projeção. Fora dele, o anel se abre na tela, quem está do outro lado da emenda deixa de ser visto, e as sobreposições tendem a subir. É o ponto em que a ilusão de percepção e o sistema de agentes se encontram.

## Estilo: biblioteca

- **Paleta:** pisos em carvalho, fundo de pergaminho no tema claro e madeira escura no tema escuro.
- **Estantes baixas:** livros em pé nas bordas externas dos degraus e dos patamares (e na frente dos patamares de canto). O padrão e a cor de cada livro dependem só do índice do bloco, então o bloco virtual 36 equivale ao 0 e a emenda continua invisível.
- **Monges:** feitos de primitivas (hábito em dois cilindros, cordão, capuz, rosto e mãos), virados para o sentido da caminhada. Quem sobe usa hábito escuro e quem desce usa hábito claro, como os dois grupos da litografia de Escher.

## O fundo: outras realidades

Ao longe, em névoa, aparecem silhuetas de outras estruturas impossíveis, como se fossem outras realidades onde a mesma ilusão acontece:

- **Anéis de Penrose com outras proporções** (8/4, 9/3, 14/6 e 7/5 degraus por lance). Cada um recebe a razão passo/subida `s = 2(n1+n3)h / (√6 (n1−n3))`, que faz o seu deslocamento ficar paralelo à mesma visão ideal.
- **Triângulos de Penrose**, feitos de três barras (x, y, z) cujo fim fica deslocado em `(L, L, √6·L)`, o mesmo princípio da escada.
- **Uma torre**, com o anel principal empilhado duas vezes.

Todas fecham no mesmo ponto de vista e **se desfazem juntas** quando a câmera sai dele. Elas ficam em posições de tela fixadas no ponto ideal e em profundidades diferentes, então ao girar aparece paralaxe. A névoa é um uniform do shader (`uFog` e `uFogCol`): quanto mais longe, mais a cor se aproxima da cor do fundo, e a estrutura interna vira só um traço de tom. Em perspectiva, o afastamento também as diminui.

## Conceitos da disciplina usados

| Conceito | Onde aparece |
|---|---|
| Projeção ortogonal e perspectiva | A própria ilusão, e sua quebra com `P` |
| Câmera (`camera`) e órbita | Controle do ponto de vista, com limites e encaixe |
| Geometria customizada (`p5.Geometry`) | A fita de cada lance e as estantes |
| Normais | Base do tom por face no shader |
| Transformações e hierarquia (`push`/`pop`, `translate`, `rotate`, `scale`) | Conversão Z para cima, monges, marcas de feromônio |
| Shader (GLSL) | Tom por face, degradê de piso, cores de livros e de lances |
| Atributos de vértice | Normais e cor de vértice no shader |
| Buffer de profundidade | Faz a peça mais próxima cobrir a mais distante, base da costura |
| Animação e easing | Encaixe da câmera, passos dos monges |
| Agentes e emergência | Contrafluxo, faixas, estigmergia e vizinhança pela tela |

Observação: as luzes do p5 (`directionalLight` etc.) **não** são usadas. O tom das faces é calculado no shader, de forma fixa por orientação, porque a ilusão exige que faces iguais tenham o mesmo tom em qualquer posição.

## Decisões e o que foi descartado

- **Terraços planos:** uma versão trazia terraços planos nos lances longos para fechar a conta. Eles quebravam a leitura de uma escada contínua, então foram trocados por lances só de degraus, com degraus mais rasos.
- **Hachura de gravura:** a primeira versão desenhava hachura nas laterais, como uma gravura. O olho a lia como textura de material e perdia o volume, então foi trocada por tons chapados.
- **Caixas por degrau:** foram trocadas pela fita contínua, pela razão já descrita.
- **Contorno por aresta:** foi removido, porque criava linhas de tijolo nas laterais.

## Ideias para continuar

- Sombras suaves de contato entre livros e degraus.
- Uma regra de leitura: monges que param para "ler" em certos livros, gerando engarrafamentos emergentes.
- Gravar as métricas ao longo do tempo e mostrar um gráfico de segregação contra feromônio.

## Referências

- L. S. Penrose e R. Penrose, "Impossible objects: a special type of visual illusion", *British Journal of Psychology*, 1958.
- M. C. Escher, *Ascendente e Descendente* (litografia), 1960.
- P.-P. Grassé, sobre estigmergia (1959).
- D. Helbing e P. Molnár, modelo de forças sociais para o movimento de pedestres, 1995.
- Documentação do p5.js 2.0 (`p5.Geometry`, shaders, `camera`, `ortho`).
