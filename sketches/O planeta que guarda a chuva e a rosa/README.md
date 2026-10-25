---
title: O planeta que guarda a chuva
tags: [AI, ChatGPT, WebGL, 3D, planetas, chuva, rosa, redoma, animação, interação]
collection: artefato da semana/9
---

# O planeta que guarda a chuva

**Autor:** Henrique Kezen V. H. Leite  
**Produzido com auxílio de AI — ChatGPT.**

## Conceito

Um pequeno mundo guarda toda a chuva que ainda não chegou ao chão. Um oceano descontínuo de gotas o envolve; uma única árvore cresce de cabeça para baixo. Ao permitir que parte da água caia, o visitante abre uma passagem nesse invólucro. As gotas atingem o planeta, deixam ondulações e voltam a se formar, mantendo a possibilidade de uma nova chuva. Sobre a superfície repousa uma pequena rosa, protegida por uma campânula de vidro inicialmente fechada. O visitante pode abrir ou fechar a redoma. A chuva só desperta a rosa quando a redoma está aberta: ela cresce, abre as pétalas e, após um período, começa a murchar. Fechar a redoma interrompe a evolução da flor no estado em que ela se encontra; reabri-la permite que a transformação continue.

A atmosfera de pequenos mundos de *O Pequeno Príncipe* orienta o tom contemplativo, mas a composição, a árvore e o comportamento são próprios. Não foram usados personagens, ilustrações, texturas ou modelos externos.

## Executar e interagir

Importe este ZIP no [p5Front](https://esperanc.github.io/p5front/) pelo botão **Import…**, execute com **Run** e confira título, coleção, tags e miniatura no botão **ⓘ**. Para atualizar a miniatura da versão com rosa e redoma, use **Capture from canvas** nesse painel, depois exporte novamente o ZIP antes de entregá-lo.

Alternativamente, extraia o ZIP, abra um terminal na pasta e execute `python -m http.server 8000`. Abra `http://localhost:8000` no navegador. A conexão com a internet é necessária para carregar o p5.js pelo CDN; não há outras dependências externas de execução.

- **Arrastar:** gira a câmera em torno do planeta, com mouse ou dedo.
- **Roda do mouse / pinça com dois dedos:** aproxima ou afasta, dentro de limites.
- **Deixar chover:** libera um grupo de gotas de uma passagem na parte superior do invólucro. Durante o ciclo, o botão fica desabilitado. Com a redoma fechada, ocorre apenas a chuva: a rosa não floresce nem reinicia seu ciclo. Com a redoma aberta no momento do clique, a rosa inicia (ou reinicia) seu ciclo de vida.
- **Abrir redoma / Fechar redoma:** o botão alterna a proteção da rosa. A redoma começa **fechada**; sua abertura e fechamento são animados. Quando está fechada, a flor não avança de estado, mesmo que esteja no meio do florescimento ou do murchamento. Abrir novamente retoma o ciclo de onde parou.
- **Ver a rosa:** aproxima o enquadramento da redoma para acompanhar o florescimento, a pausa e o murchamento da flor.
- **Vista inicial:** recupera o enquadramento de abertura.
- **Recomposição:** as gotas reaparecem gradualmente; ao concluir o ciclo, a chuva pode ser acionada novamente.

## Evolução do projeto

O sketch nasceu a partir do **prompt original**, transcrito integralmente na seção **Prompts e histórico de solicitações**. Duas solicitações posteriores acrescentaram, nessa ordem:

1. **Rosa e ciclo de vida:** uma flor pequena sob uma redoma inspirada na atmosfera de *O Pequeno Príncipe*. Após a chuva, ela cresce, desabrocha, permanece viva por algum tempo e murcha.
2. **Redoma interativa:** controle para abrir e fechar o vidro. Ela começa fechada e impede a evolução da rosa enquanto estiver assim. A transformação só começa com uma nova chuva acionada com a redoma aberta; se o visitante fechar a redoma durante o processo, o tempo biológico da rosa fica pausado até a reabertura.

As duas solicitações estão **reproduzidas literalmente**, identificadas como prompts auxiliares feitos **depois** do prompt original, no fim deste README. O botão **Ver a rosa** foi adicionado como detalhe de implementação para melhorar a observação da interação.

## Construção 3D

O sketch usa `createCanvas(..., WEBGL)` e p5.js **2.2.3** via https://cdn.jsdelivr.net/npm/p5@2.2.3/lib/p5.min.js. A biblioteca não está incluída no ZIP.

- `sphere`: planeta facetado, pedras, musgo, frutos e estrelas.
- `ellipsoid`: pedras achatadas, folhagem e gotas.
- `cylinder`: tronco, galhos e raízes.
- `torus`: ondulações no contato da água com a superfície e bordas da redoma.
- `cone`: cálice da rosa.
- `cylinder` sem tampas e segmentos de meia esfera com `beginShape`: campânula de vidro sem textura.
- `push`, `pop`, `translate`, `rotate`, `rotateX/Y/Z`: montagem e orientação dos componentes.
- `camera` e `perspective`: câmera orbital com limites de distância e elevação.
- `ambientLight`, `directionalLight`, `pointLight`, `specularMaterial` e `shininess`: volume e iluminação dos objetos.

A iluminação não produz sombras projetadas. O aspecto de volume vem das normais, das luzes e das cores dos materiais.

## Organização e desempenho

As funções `construirPlaneta`, `construirArvore` e `construirGotas` constroem a cena. `galho` orienta um cilindro entre dois pontos. `desenharReservadas` controla a chuva e o reaparecimento; `desenharImpactos` orienta as ondulações pela normal da superfície. `desenharFlor`, `desenharRedomaMovel` e `desenharCampanula` compõem a rosa e a redoma móvel. `alternarRedoma` troca a posição aberta/fechada do vidro. `configurarInteracao` trata mouse e toque.

O desenho usa 2.300 gotas em telas largas ou 1.500 se iniciado em uma tela estreita. As malhas das gotas têm poucos segmentos. Elementos estáticos são reunidos uma vez em `buildGeometry()` e desenhados com `model()`. São malhas construídas a partir das próprias primitivas, não modelos importados.

Um pequeno shader aplica oscilações espaciais suaves às gotas suspensas na GPU e calcula seus reflexos. Isso evita desenhar milhares de primitivas separadamente a cada quadro. As gotas selecionadas para a chuva são animadas individualmente. Suas trajetórias são radiais, aceleradas por uma interpolação quadrática, em coordenadas do mundo. Girar a câmera não altera o destino da água. É uma interpretação poética, não uma simulação hidrodinâmica.

O ciclo da chuva tem dez segundos de tempo simulado, incluindo liberação escalonada, impactos, pausa e recomposição. **A redoma inicia fechada.** O ciclo da rosa só começa quando o botão **Deixar chover** é acionado com a redoma aberta. Nesse caso, a flor cresce e abre em aproximadamente seis segundos de **tempo biológico**, começa a murchar aos dezessete segundos e termina de secar por volta dos trinta segundos. Esse relógio avança apenas enquanto a redoma estiver aberta: fechá-la congela a evolução da flor, e abri-la novamente a retoma do mesmo ponto. A chuva não fica pausada pela redoma; com ela fechada, uma nova chuva não altera a rosa, inclusive se a flor já tiver iniciado outro ciclo. Uma chuva acionada com a redoma aberta reinicia o florescimento. O avanço por quadro é limitado para evitar saltos ao retornar de uma aba inativa; em dispositivos muito lentos o ciclo pode levar mais tempo real. A renderização mira 40 quadros por segundo, sem garantia de desempenho idêntico em todos os aparelhos.

## Arquivos

- `index.html`: página, controles e referência ao p5.js no CDN.
- `style.css`: composição visual e adaptação para celular.
- `sketch.js`: cena WebGL, primitivas, animação, shader e interação.
- `README.md`: metadados, autoria, explicação, prompt original integral e prompts auxiliares posteriores.
- `thumbnail.png`: captura real da versão inicial do planeta, ainda **sem a rosa/redoma**. O arquivo PNG é válido, mas precisa ser substituído por uma captura da versão atual no p5Front antes da entrega definitiva.

A miniatura não é usada como textura nem carregada pela cena.

## Referências

- Aula de 3D: https://esperanc.github.io/CreativeCoding2026/8%20-%203D/slides.md
- Referência p5.js: https://p5js.org/reference/
- Geometria a partir de primitivas: https://p5js.org/reference/p5/buildGeometry/

## Validação da versão com redoma (20/10/2026)

**Verificações realizadas neste pacote:**

- O `sketch.js` passou na análise sintática com `node --check`.
- O ZIP foi auditado: `index.html`, `sketch.js`, `style.css`, `README.md` e `thumbnail.png` estão na raiz. **Não contém a biblioteca p5.js**, nem arquivos minificados dessa biblioteca, nem modelos 3D externos.
- O HTML referencia `https://cdn.jsdelivr.net/npm/p5@2.2.3/lib/p5.min.js`, ou seja, p5.js **versão 2** carregada por CDN, sem cópia local.
- O preâmbulo YAML do README contém as palavras-chaves `AI` e `ChatGPT` e a coleção exata `artefato da semana/9`.
- Uma bateria de testes JavaScript executou a lógica do sketch com funções gráficas simuladas, em configurações de 2.300 gotas (desktop) e 1.500 gotas (tela móvel). Passaram a inicialização, chuva com redoma fechada, ausência de mudança na rosa protegida, novo florescimento com redoma aberta, pausa ao fechar durante o ciclo, retomada ao reabrir, murchamento, secagem, repetição da chuva e resposta da câmera ao zoom.
- A rotação sutil das folhas foi ajustada para depender do relógio biológico da rosa, de forma que a flor também pare visualmente quando estiver protegida.
- Layout e presença dos quatro botões verificados no Chromium com larguras de 1200 e 390 pixels, sem transbordamento horizontal.

**Verificações que ainda exigem o navegador do aluno:**

- **Renderização WebGL completa da versão com rosa:** não confirmada. O ambiente de execução deste teste bloqueou requisições HTTP ao CDN do p5.js e ao p5Front. Os testes simulados verificam a lógica, mas não substituem um teste gráfico real.
- **Importação e leitura efetiva do painel ⓘ no p5Front:** não confirmadas nesta versão. O formato dos arquivos foi comparado com a documentação do p5Front, mas não houve importação real.
- **Miniatura atual:** `thumbnail.png` ainda é uma captura válida da versão anterior, sem a rosa e a redoma. Depois de executar a versão atual no p5Front, abra **ⓘ → Capture from canvas** e exporte o ZIP novamente para registrar uma miniatura representativa da entrega final.

## Verificações da versão original (antes da inclusão da rosa)

- Renderização WebGL e p5.js 2.2.3 confirmadas em Chromium.
- Ciclo completo de chuva: as 110 gotas selecionadas no teste de desktop atingiram o planeta; a água se recompôs e o botão voltou a ficar disponível.
- Rotação com mouse; rotação por toque e aproximação por pinça verificadas em emulação móvel de 390 pixels, com 1.500 gotas.
- Layout sem transbordamento horizontal na largura móvel testada.
- Importação do ZIP no p5Front: título, tags, coleção e miniatura reconhecidos no painel de informações.
- Execução dentro do p5Front: WebGL iniciado, p5.js 2.2.3 confirmado e chuva acionada com impactos observados.
- Nenhum erro de JavaScript observado nos testes de execução.

Os testes usaram um navegador automatizado e renderização gráfica por software. O teste de celular foi uma emulação de viewport e eventos de toque, não uma medição de fluidez em um telefone físico. O desempenho real varia conforme a GPU e o navegador.

## Prompts e histórico de solicitações

### Prompt original — transcrição integral (primeira solicitação)

O campo de preâmbulo veio sem os metadados na mensagem abaixo. O início deste README usa os valores já definidos na conversa: título do projeto, tags AI/ChatGPT e coleção `artefato da semana/9`. **Este é o prompt original, anterior à rosa e à redoma interativa.**

```markdown
Crie um sketch de programação criativa chamado **“O planeta que guarda a chuva”**, usando **p5.js versão 2, modo WEBGL e primitivas 3D**, para o artefato da semana 9.

**Conceito**

Um pequeno planeta solitário guarda ao seu redor toda a chuva que nunca chegou ao chão. Milhares de gotas permanecem suspensas no espaço, formando um oceano descontínuo que envolve esse mundo. Na parte inferior do planeta, uma única árvore cresce de cabeça para baixo.

Quero uma atmosfera poética, delicada e um pouco melancólica, inspirada na sensação dos pequenos mundos de *O Pequeno Príncipe*, com composição e elementos próprios. A cena deve transmitir a ideia visualmente, sem depender de um texto explicando a metáfora.

**Composição visual**

- Um pequeno planeta central, com superfície irregular e aparência de miniatura artesanal, construído com uma esfera e volumes menores.
- Uma árvore invertida na parte inferior: tronco e galhos se projetam para baixo, com uma copa pequena e estilizada. Ela deve parecer enraizada no planeta.
- Uma nuvem de gotas suspensas envolvendo o planeta. Sua distribuição deve sugerir o contorno de uma enorme gota de água, dentro da qual o mundo está guardado.
- Preserve espaços entre as gotas para permitir enxergar o planeta e a árvore. Evite uma superfície transparente contínua que esconda a composição ou cause problemas de renderização.
- Fundo azul muito escuro, poucas estrelas e uma paleta contida: tons terrosos no planeta, azul e turquesa na água e pequenos detalhes quentes.
- Iluminação suave que revele o volume e produza reflexos nas gotas. Evite aparência de neon ou de painel tecnológico.
- A câmera inicial deve mostrar claramente a árvore invertida, a profundidade e a forma do conjunto.

**Movimento e interação**

- As gotas flutuam lentamente, com pequenas oscilações individuais, preservando a forma geral do oceano suspenso.
- Arrastar o mouse ou o dedo gira a câmera ao redor da cena. Permita aproximação e afastamento com limites adequados.
- Um botão discreto, **“Deixar chover”**, abre temporariamente uma passagem na camada de água: um grupo de gotas abandona suas posições e cai em direção à superfície do planeta.
- Ao tocar o solo, essas gotas produzem pequenas ondulações ou respingos estilizados.
- Depois, novas gotas se formam gradualmente nas posições que ficaram vazias, permitindo repetir a interação.
- A chuva deve funcionar de qualquer posição da câmera. Sua trajetória pertence ao espaço 3D da cena.
- Priorize movimentos suaves e contemplativos.

**Implementação**

Use `createCanvas(..., WEBGL)` e construa os elementos principalmente com primitivas como `sphere`, `ellipsoid`, `cylinder`, `cone` e `torus`. Explore transformações com `push`, `pop`, `translate`, `rotate` e `scale`, além de câmera, luzes e materiais.

Não dependa de modelos 3D externos. Ajuste a quantidade de gotas e o detalhamento das malhas para manter boa fluidez, inclusive no celular. Não presuma que a iluminação padrão do p5 gera sombras projetadas.

Organize o código em funções claras, com comentários em português que expliquem a construção da cena e a animação.

**Entrega e validação**

Entregue um único ZIP, com `index.html`, `sketch.js`, eventuais estilos, `README.md` e `thumbnail.png` diretamente na raiz.

Carregue **p5.js versão 2 exclusivamente por CDN**. Não inclua a biblioteca no ZIP.

O README deve começar com:

---

Inclua meu nome, **Henrique Kezen V. H. Leite**, a descrição do conceito, instruções de execução e interação, as primitivas e técnicas utilizadas e **este prompt integralmente**.

A `thumbnail.png` deve ser uma captura representativa do sketch funcionando.

Teste a renderização WebGL, a câmera, a chuva, a recomposição das gotas e a adaptação da interface a telas pequenas. Verifique se há erros de JavaScript. Valide também a importação do ZIP e seus metadados no p5Front, em [https://esperanc.github.io/p5front/](https://esperanc.github.io/p5front/). Se alguma validação não puder ser realizada, informe isso explicitamente.
```


### Prompts auxiliares — enviados posteriormente ao prompt original

Os textos abaixo foram enviados **depois da criação do primeiro sketch** e são registrados na ordem em que apareceram na conversa, sem substituir nem alterar o prompt original.

**Prompt auxiliar 1 — inclusão da flor e do ciclo de vida (posterior ao prompt original):**

> podia ter aquela flor dentro de uma parada do pequeno principe ai quando apertamos o deixar de chover a flor floresce, antes disso ela deve ser bem pequena e depois de algum tempo pos chuva ela vai morrendo

**Prompt auxiliar 2 — redoma interativa e pausa do estado da flor (posterior ao prompt auxiliar 1):**

> a redoma fica fechada direto? coloque um botao pra abrir e fechar a redoma se a redoma estiver fechado nao muda estado apenas se ela estiver aberta ela inicialmente fica fechada

**Implementação das adições:** o primeiro pedido originou a rosa modelada em 3D, seu florescimento e seu murchamento graduais; o segundo trouxe o botão **Abrir redoma / Fechar redoma**, a posição inicial fechada, a animação de abertura e a suspensão do relógio da flor quando protegida. O comando **Ver a rosa** permite observar essas mudanças de perto.
