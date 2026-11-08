---
title: O peso de quem não está
tags: [AI, ChatGPT, WebGL, geometria, interação, memória]
collection: artefato da semana/10
---

# O peso de quem não está

**Autor:** Henrique Kezen V. H. Leite  
**Programação com auxílio de IA:** ChatGPT  
**Biblioteca:** p5.js 2.2.3, carregada exclusivamente por CDN.

## Conceito

Um banco conserva o peso de quem passou por ele. O estofado cede sem que ninguém apareça: duas presenças chegam em momentos diferentes, compartilham o assento e partem. A espuma demora a recuperar sua forma. O intervalo entre a partida e o desaparecimento da marca é a matéria deste trabalho.

O visitante também pode deixar uma presença. Suas marcas se misturam às da sequência automática numa única superfície contínua. A estrutura de madeira permanece rígida, em contraste com o tecido que guarda uma memória passageira do contato.

## Execução e interação

Importe o ZIP no [p5Front](https://esperanc.github.io/p5front/) e execute `index.html`. Também é possível extrair os arquivos para uma pasta, iniciar um servidor local (por exemplo, `python -m http.server 8000`) e abrir `http://localhost:8000` no navegador. É necessária conexão à internet para carregar o p5.js pelo CDN e suporte a WebGL.

- **Clique ou toque no assento:** cria uma presença no ponto atingido. Ela chega gradualmente, permanece e desaparece lentamente.
- **Arraste sobre a cena:** gira a câmera. Movimentos maiores que seis pixels são tratados como arraste, sem criar uma presença ao soltar.
- **Roda do mouse ou pinça com dois dedos:** aproxima ou afasta a câmera dentro de limites.
- **Vista inicial:** restaura o enquadramento.
- **Recomeçar:** limpa as marcas e reinicia a sequência.
- **Pausar / Continuar:** interrompe ou retoma o tempo da animação; a câmera permanece disponível. Presenças criadas durante a pausa começam a se desenvolver ao continuar.

A sequência automática dura 36 segundos e se repete. As marcas são limitadas em profundidade e as presenças adicionadas pelo visitante são limitadas a oito simultâneas para manter a interação leve.

## Geometria e técnicas

O assento é um `p5.Geometry` próprio, com vértices, faces triangulares indexadas e coordenadas UV. Sua parte superior é uma grade de 84 × 32 células no computador e 60 × 24 em telas inicialmente estreitas. Anéis laterais e uma base fecham o volume do estofado. As células compartilham vértices, permitindo normais contínuas.

A cada atualização, campos suaves de pressão são combinados. Cada presença tem duas regiões largas de apoio e uma área de contato adicional à frente. A soma passa por uma função de saturação para evitar que marcas sobrepostas atravessem a estrutura. Um sistema de mola amortecida aproxima os vértices do deslocamento desejado; o envelope temporal da presença produz uma recuperação lenta. É uma aproximação expressiva de espuma com memória, não uma simulação física completa de tecido.

As posições dos vértices são realmente modificadas. `computeNormals()` recalcula as normais da malha compartilhada para que a iluminação acompanhe as depressões. `freeGeometry()` libera os buffers anteriores antes de reenviar a geometria alterada por `model()`, evitando acumulação de modelos na GPU. A madeira e as ferragens são agrupadas uma única vez com `buildGeometry()`.

A textura do tecido é gerada pelo próprio sketch com `createGraphics()` e aplicada por UVs. Não há modelos ou fotografias externos. A sombra de contato é uma textura procedural sobre um plano: não é uma sombra projetada automaticamente pelas luzes. Ela permanece sob o banco e não simula oclusão física entre todas as peças.

A câmera usa perspectiva e coordenadas esféricas. Para localizar o toque, um raio sai da câmera e é intersectado com os triângulos atuais do assento pelo algoritmo de Möller–Trumbore. A seleção acompanha tanto a câmera quanto a deformação da malha.

## Relação com o material da disciplina

Foi consultado o material [Modelagem 3D](https://esperanc.github.io/SlideDown/index.html?p=9%20-%20Modelagem%203D&f=https%3A%2F%2Fesperanc.github.io%2FCreativeCoding2026), no repositório público da disciplina. O arquivo está identificado como “Aula 9 — Modelagem 3D”; seus exemplos e as quatro sugestões finais correspondem às referências citadas no enunciado do artefato da semana 10.

As técnicas aplicadas são a construção manual de `p5.Geometry`, faces por índices, cálculo de normais, UVs, agrupamento com `buildGeometry()`, exibição com `model()` e gerenciamento com `freeGeometry()`. Os objetos de exemplo dos slides não são utilizados na composição.

Referências técnicas: [p5.Geometry](https://p5js.org/reference/p5/p5.Geometry/), [buildGeometry](https://p5js.org/reference/p5/buildGeometry/) e [freeGeometry](https://p5js.org/reference/p5/freeGeometry/).

## Validação

Validação executada em Chromium com renderização WebGL por software:

- p5.js 2.2.3 carregado pelo CDN; contexto WebGL 2 confirmado.
- Malha do computador: 3.502 vértices e 7.000 faces; malha móvel reduzida: 2.030 vértices.
- Sequência verificada aos 6, 13 e 34 segundos simulados: primeiro uma marca, depois duas, e recuperação final com deslocamento residual inferior a 0,001 unidade.
- Clique no assento, clique após girar a câmera, arraste sem criar presença, limites de zoom, reinício e pausa/continuação verificados.
- Tela de 390 px com toque, arraste e pinça em emulação móvel; redimensionamento para 320 px sem transbordamento horizontal.
- ZIP importado no p5Front: título, tags, coleção e miniatura reconhecidos. O sketch foi executado dentro do p5Front e a deformação foi observada.
- Nenhum erro de JavaScript nos testes locais ou na execução no p5Front.

**Limitação:** não houve teste em aparelho móvel físico. A renderização por software do ambiente de teste é mais lenta que uma GPU; os testes confirmam funcionamento e adaptação da interface, não uma taxa de quadros garantida em todos os dispositivos.

`thumbnail.png` é uma captura da obra executada em navegador, com a malha do assento deformada. Não é uma ilustração gerada separadamente.

## Prompt utilizado

O texto abaixo registra integralmente o pedido de implementação.

```text
Crie um sketch de programação criativa chamado “O peso de quem não está”, usando p5.js versão 2, modo WEBGL e as técnicas apresentadas no material da aula 10.

Conceito

Um banco vazio conserva o peso das pessoas que passaram por ele. Ninguém aparece na cena: as presenças são percebidas apenas pelas deformações do assento, como se corpos invisíveis ocupassem seus lugares.

Quero explorar a ideia de que uma ausência também deixa marcas. A cena deve transmitir isso visualmente, sem depender de textos explicativos.

Composição

* Um banco comprido, com estrutura firme e assento estofado contínuo, capaz de apresentar deformações localizadas.
* Aparência delicada e levemente envelhecida, com cores discretas e iluminação suave.
* Fundo simples, com espaço vazio suficiente para reforçar a sensação de solidão.
* Enquadramento em perspectiva que permita perceber a profundidade das marcas no assento.
* Evite personagens visíveis, silhuetas humanas, efeitos de neon e elementos decorativos sem função na proposta.

Movimento e interação

Em repouso, a cena deve apresentar uma sequência lenta: uma presença afunda um lado do assento; depois, outra ocupa o lugar ao lado. A primeira desaparece, mas sua marca permanece por algum tempo antes de se desfazer.

Ao clicar ou tocar em uma região do assento, o usuário deve criar uma nova presença naquele ponto. A deformação precisa surgir gradualmente, permanecer por alguns instantes e retornar suavemente à forma original.

As marcas próximas devem interagir de maneira contínua, sem parecer buracos independentes. O banco deve transmitir peso, resistência e memória por meio do movimento.

Permita girar a câmera com um gesto distinto da criação de presenças, diferenciando clique de arraste e mantendo os controles utilizáveis no celular.

Implementação

Consulte o material da aula 10 antes de definir a construção da geometria. Se ele não estiver disponível, solicite-o antes de implementar.

A superfície deformável deve ser uma malha 3D cuja geometria seja efetivamente modificada. As deformações devem responder às presenças, evitando ondulações aleatórias sem relação com o conceito.

Use iluminação e normais adequadas para tornar as mudanças de volume legíveis. Não presuma que a iluminação padrão do p5.js produza sombras projetadas.

Organize o código em funções claras, com comentários em português, mantendo-o compreensível para um estudante. Priorize fluidez e limite o detalhamento da malha quando necessário.

Entrega

Entregue um único ZIP com os arquivos do sketch diretamente na raiz, incluindo index.html, sketch.js, eventuais estilos, README.md e thumbnail.png.

Carregue p5.js versão 2 exclusivamente por CDN. Não inclua a biblioteca no ZIP.

O README deve começar com este preâmbulo:

⸻

title: O peso de quem não está
tags: [AI, ChatGPT, WebGL, geometria, interação, memória]
collection: artefato da semana/10

Inclua o nome Henrique Kezen V. H. Leite, uma descrição do conceito, instruções de execução e interação, as técnicas utilizadas e este prompt integralmente.

A thumbnail.png deve ser uma captura representativa do próprio sketch funcionando.

Teste a renderização WebGL, as deformações, a recuperação do assento, os controles da câmera e a interação em telas pequenas. Verifique erros de JavaScript e valide a importação do ZIP, os metadados e a miniatura no p5Front. Informe explicitamente qualquer validação que não puder realizar.
```
