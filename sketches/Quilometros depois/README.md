---
title: Quilômetros Depois
tags: [AI, ChatGPT, p5.js, WebGL, narrativa, estrada, 3D]
collection: projeto final/ARTHUR FREITAS RAMOS/1
---

# Quilômetros Depois

**Arthur Freitas Ramos · Creative Coding · Entrega 1 de 3**

Uma estrada. Dois viajantes. Algo que ainda não se revela.

## Conceito

Uma narrativa tridimensional em que o tempo é medido pela distância. O observador avança por uma estrada e encontra os mesmos dois personagens, em momentos diferentes, junto de uma caixa laranja. Os trechos vazios entre os encontros deixam espaço para imaginar o que aconteceu fora de campo.

A estrada retoma um motivo dos primeiros exercícios da disciplina e o transforma no eixo temporal da história. Não se pode voltar ao que já passou. O cenário tem aparência de maquete geométrica: árvores facetadas, montanhas de poucos polígonos, personagens montados com primitivas e materiais de cores sólidas. A intenção é despertar curiosidade e mistério.

## Cenário — refinamento da primeira entrega

A paisagem foi ampliada dentro da mesma Entrega 1. O terreno plano dá lugar a um vale com colinas trianguladas, bosques e três camadas de montanhas. A distribuição dos elementos varia entre execuções, mantendo clareiras nos encontros para preservar a leitura dos personagens e da caixa.

- Pinheiros, árvores de copa arredondada e árvores alongadas, em verdes e tons dourados.
- Arbustos, pedras, tufos de capim e pequenas flores claras e amarelas no acostamento.
- Cercas de madeira em trechos alternados, bordas de cascalho e balizadores com refletores noturnos.
- Nuvens facetadas com deslocamento lento, halo solar, aves ao longe e pequenos pontos de luz na vegetação durante a noite.
- Copas e capim com movimentos discretos de vento.
- Paleta de céu e vegetação refinada, com névoa para separar os planos da paisagem.

O relevo e os elementos se reciclam ao longo do caminho. A altura de cada árvore e arbusto é calculada sobre os mesmos triângulos do terreno, mantendo as bases apoiadas nas encostas. As geometrias compostas são construídas com `buildGeometry()` e reutilizadas com `model()`; os trechos de relevo descartados liberam seus buffers antes da substituição. Elementos distantes usam menos detalhes de composição para controlar o custo de renderização.

## Narrativa desta versão

1. **O encontro, na margem direita:** ao amanhecer, o viajante azul se aproxima da caixa e aponta para ela. O viajante creme observa à distância. Curiosidade e cautela se expressam pela posição e pela inclinação dos corpos.
2. **A investigação, na margem esquerda:** durante o dia, os dois se aproximam do objeto. O azul testa a tampa, que não abre. O outro examina a caixa. Uma linha muito discreta na tampa antecipa o próximo encontro.
3. **O primeiro brilho, na margem direita:** ao anoitecer, a caixa pulsa. Os viajantes recuam, um deles junto de uma placa, e continuam observando. A caixa ilumina o chão e interfere nos materiais próximos.

Depois de passarmos pelo último quadro, uma luz fora de campo deixa um reflexo alaranjado na estrada e se dissipa. O título e o nome do autor aparecem sobre a viagem noturna. A estrada continua; a caixa permanece fechada. Este encerramento é provisório e será expandido pelas próximas cenas.

As cenas não têm títulos na tela nem diálogos. Os nomes acima são apenas documentação do roteiro.

## Como experimentar

- A viagem começa automaticamente ao abrir a página.
- **Mova o mouse** para olhar suavemente para os lados e um pouco para cima ou para baixo.
- Não é preciso interagir para acompanhar a história. A câmera sugere a direção dos encontros, preservando uma pequena margem de olhar.
- A velocidade diminui na aproximação das cenas e volta a aumentar nos intervalos. O avanço nunca é interrompido pelo usuário.
- Para assistir novamente, recarregue a página.

A primeira entrega é silenciosa. Não possui comandos de teclado, ações por clique, pontuação ou botão de início. A duração resulta do percurso e do ritmo das cenas, sem uma duração mínima imposta.

## Executar localmente

Abra um terminal nesta pasta e execute:

```sh
python3 -m http.server 8000
```

Depois acesse [http://localhost:8000](http://localhost:8000) em um navegador de computador com WebGL habilitado. Encerre o servidor com `Ctrl+C` quando terminar.

Também é possível abrir `index.html` diretamente no navegador: não há recursos locais carregados por `fetch`. O servidor local é recomendado para desenvolvimento.

É necessária conexão com a internet para carregar **p5.js 2.2.3 pelo CDN jsDelivr**. A versão está fixada para evitar mudanças inesperadas. A biblioteca não é distribuída nesta pasta. Caso o CDN falhe, a página informa o problema de carregamento.

## Arquivos

Todos os arquivos de entrega ficam diretamente na raiz:

```text
index.html      página, metadados, introdução e créditos
style.css       apresentação, céu, tipografia e sobreposição de luz
sketch.js       mundo WebGL, estrada, narrativa, câmera e personagens
README.md       conceito, execução, processo e plano das três entregas
thumbnail.png   captura real do sketch em execução
```

Não foi gerado ZIP. Por decisão do autor, o projeto será desenvolvido de forma contínua e o empacotamento será feito por ele. O thumbnail será atualizado junto das futuras versões.

## Tecnologias e conteúdos da disciplina

- **JavaScript e p5.js 2 / WebGL:** canvas tridimensional, perspectiva e câmera.
- **Transformações hierárquicas:** corpos articulados com `push`, `pop`, translações e rotações.
- **Primitivas geométricas:** caixas, esferas facetadas, cones e elipses. Não há modelos 3D, texturas ou imagens de cenário externas.
- **Geometria procedural reutilizável:** `buildGeometry`, `model`, normais planas e malhas triangulares para árvores, vegetação, nuvens e relevo.
- **Luz e materiais:** luz ambiente e direcional, luz pontual na caixa, materiais emissivos para legibilidade noturna e sombras de contato simplificadas.
- **Interpolação:** transições de cor, velocidade, direção de olhar, poses e pulsos de luz.
- **Aleatoriedade com semente por sessão:** posicionamento da vegetação, pedras, montanhas e estrelas. A ordem da narrativa é fixa.
- **Movimento com `deltaTime`:** velocidade em unidades por segundo; limite de 50 ms por atualização evita saltos grandes ao retornar à aba.
- **Reciclagem:** um conjunto fixo de segmentos e elementos de terreno é reposicionado à frente do observador.
- **Composição e perspectiva:** estrada, faixas e balizadores sugerem profundidade; cada encontro possui uma clareira e espaço de observação.

O alvo desta etapa é computador. O canvas acompanha o tamanho da janela e seu redimensionamento; controles por toque e composição para celular não fazem parte do escopo atual.

## Organização para continuidade

O código permanece em um `sketch.js`, dividido em responsabilidades:

| Sistema | Responsabilidade |
| --- | --- |
| `CONFIG` e `PALETTE` | Escalas, velocidade, distâncias e cores |
| `RoadManager` | Desenho e reciclagem dos trechos de estrada |
| `StoryManager` / `StoryScene` | Encontros por distância, desaceleração e encerramento |
| `Character` | Um corpo reutilizável, com roupa, escala e poses parametrizadas |
| `DayNightCycle` | Céu e iluminação sincronizados com o percurso |
| `CameraController` | Olhar pelo mouse e orientação suave para as cenas |
| `Environment` | Bosques, flores, cercas, nuvens, aves, sol, lua e estrelas |
| `Terrain` | Colinas trianguladas, altura dos elementos e reciclagem das malhas |
| `SceneryAssets` | Geometrias compostas compartilhadas pelos elementos do cenário |
| `Interface` | Introdução, indicação de percurso e créditos |

O chão está em `y = 0`; valores negativos de `y` apontam para o céu. O caminho à frente usa `z` negativo. A câmera permanece perto da origem e o mundo se desloca em sua direção. Para posicionar uma cena, subtrai-se sua distância narrativa da distância percorrida. Apenas um quadro de personagens é desenhado por vez, evitando versões simultâneas dos viajantes.

## Evolução e plano das três entregas

Esta é a primeira versão do trabalho final. Ela estabelece a base técnica e retoma a estrada dos exercícios anteriores com função narrativa, acrescentando personagens recorrentes, passagem de tempo e uma sequência de acontecimentos.

### Entrega 1 — O encontro · implementada

- Estrada contínua e reciclável; movimento automático com desacelerações.
- Maquete geométrica e personagens com identidade visual constante.
- Três cenas: encontro, investigação e primeiro brilho.
- Transição de amanhecer para dia, entardecer e noite.
- Olhar pelo mouse, introdução breve e encerramento aberto.
- Refinamento do cenário: vale, vegetação variada, flores, cercas, nuvens, aves e atmosfera noturna.

### Entrega 2 — A disputa · planejada

- Preservar e aprimorar as três primeiras cenas.
- Melhorar a qualidade dos personagens, articulações e expressividade dos gestos.
- Acrescentar disputa pela caixa, tentativa de transporte em carrinho e acidente.
- Animar puxar, carregar, cair e ajudar usando o mesmo sistema de personagens.
- Refinar transições, iluminação, variações do cenário e comportamentos secundários.
- Avaliar pequenas respostas à atenção do observador, sem tornar obrigatória a interação.

### Entrega 3 — A abertura · planejada

- Revisar as seis cenas anteriores e concluir a história.
- Acrescentar reconciliação e abertura conjunta da caixa.
- Fazer a esfera luminosa subir e se transformar no novo sol.
- Criar uma conclusão e continuidade coerentes com a estrada.
- Adicionar áudio opcional, ativado pelo usuário, partículas e efeitos finais.
- Finalizar personagens, créditos, desempenho e documentação de todo o processo.

As próximas etapas são intenções de desenvolvimento, não funcionalidades já presentes. Roteiro, gestos e enquadramentos poderão ser ajustados pelo autor durante a evolução do projeto.

## Uso de IA

O projeto foi desenvolvido com auxílio do ChatGPT/Codex na ideação, no planejamento, na estruturação e implementação do código e na verificação técnica. Arthur Freitas Ramos definiu o conceito, a direção estética, a seleção da narrativa e o escopo das entregas, orientando e revisando o desenvolvimento.

## Referências

A direção artística parte do roteiro do autor e dos exercícios anteriores da disciplina, incluindo a estrada em perspectiva e a experiência de modelagem procedural “Arqueologia do Cursor”. A caixa laranja também retoma a necessidade de contraste e legibilidade aprendida nesse processo. Não foram usados modelos, imagens, músicas ou trabalhos de outros alunos como assets.

Referências técnicas consultadas:

- [Documentação do p5.js](https://p5js.org/reference/): primitivas, transformações, câmera e execução do sketch.
- [Materiais no p5.js](https://p5js.org/examples/3D-Materials/): relação entre formas geométricas e iluminação.
- [Material emissivo](https://p5js.org/reference/p5/emissiveMaterial/): manter o objeto visível mesmo em uma cena noturna. O material por si só não ilumina outras formas; a cena combina esse material com uma luz pontual e elipses translúcidas no chão.
- [buildGeometry](https://p5js.org/reference/p5/buildGeometry/) e [clearColors](https://p5js.org/reference/p5.Geometry/clearColors/): construir formas compostas uma vez e reutilizá-las com materiais adequados ao horário da narrativa.

## Verificação desta versão

Verificação realizada em 13/11/2026, no Google Chrome com WebGL, usando o p5.js real carregado pelo CDN:

- Percurso completo do início aos créditos sem mouse, teclado ou cliques; os três encontros ocorreram na ordem esperada. A estrada seguiu avançando após o encerramento.
- Console sem erros ou avisos durante o percurso e na inspeção visual da versão final.
- Aproximadamente 60 FPS no computador de teste; isso não constitui garantia de desempenho em todo equipamento.
- Movimento simulado a 30, 60 e 120 FPS com diferença inferior a 0,02 segundo até a mesma distância final; aproximadamente 15 segundos na faixa principal de leitura de cada encontro.
- Verificação da atualização de movimento com intervalos de 1 e 10 segundos: ambos limitados a 50 ms de avanço, sem saltar cenas. Intervalos negativos são tratados como zero.
- Movimento do mouse para os dois lados e redimensionamento em 1920 × 1080, 1440 × 900 e 1024 × 768.
- Número de segmentos e grupos de cenário permanece limitado: 16 segmentos de estrada, 16 trechos de relevo e 36 grupos recicláveis de vegetação e detalhes.
- Após o refinamento do cenário, o percurso completo foi repetido com os três encontros e créditos, mantendo aproximadamente 60 FPS no computador de teste e console sem erros ou avisos.
- A malha do relevo foi conferida contra a função de altura usada pelos objetos, sem diferença nos vértices; todas as normais do chão apontam para cima. Em uma verificação estendida até 24.000 unidades de percurso, o cache gráfico variou entre 64 e 73 geometrias, com liberação dos trechos substituídos.
- Capturas revisadas de encontro, investigação, brilho, reflexo final e créditos. `thumbnail.png` é uma captura da primeira cena renderizada pelo próprio sketch, sem interface do navegador.
- Mensagem de erro conferida com o carregamento do CDN bloqueado propositalmente.
- Abertura direta de `index.html` também conferida no Chrome.

A execução no p5Front e o empacotamento não foram realizados; ficam sob responsabilidade do autor, conforme o escopo combinado. Não foi testado em outros navegadores nem em celular.
