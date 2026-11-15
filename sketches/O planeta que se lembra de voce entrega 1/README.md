---
title: O planeta que se lembra de você
tags: [AI, ChatGPT, p5.js, WEBGL, 3D, memória, constelação, interação, persistência, rosa]
collection: projeto final/Henrique Kezen V. H. Leite/1
---

# O planeta que se lembra de você

**Autor:** Henrique Kezen V. H. Leite  
**Produzido com auxílio de AI — ChatGPT.**

## Conceito

Um pequeno planeta é capaz de se lembrar de quem o visita. Aproximar-se da rosa, abrir sua redoma e permitir que a chuva alcance o mundo não desaparecem quando a ação termina: cada acontecimento acende uma estrela colorida. Ligadas na ordem em que nasceram, essas estrelas formam uma constelação particular, construída pela relação entre visitante e planeta.

A atmosfera e a ideia de “cativar” de *O Pequeno Príncipe* orientam o trabalho, sem reproduzir personagens ou cenas do livro. A obra interpreta o vínculo como uma transformação mútua: o visitante muda o céu, enquanto a rosa aprende gradualmente a reconhecer sua presença.

Esta é a primeira de três entregas do projeto final. Ela funciona como uma obra completa, mas estabelece a memória persistente que sustentará as transformações das próximas etapas.

## Interação

- **Arrastar:** gira a câmera em torno do planeta.
- **Roda do mouse ou pinça:** aproxima e afasta a câmera.
- **Aproximar-se da rosa:** enquadra a redoma. Permanecer observando por cerca de dois segundos registra uma memória rosada.
- **Abrir/fechar redoma:** permite ou interrompe o tempo biológico da rosa. A primeira abertura da visita registra uma memória dourada.
- **Deixar chover:** libera parte das gotas suspensas. A primeira chuva da visita registra uma memória azul. A rosa só desperta se a redoma estiver aberta.
- **Ver o planeta:** restaura o enquadramento inicial.
- **Apagar memória:** após confirmação, remove a constelação armazenada neste navegador e reinicia a experiência.

## As quatro memórias

- **Branca — visita:** aparece no primeiro acesso e em cada nova visita válida.
- **Rosada — observação:** nasce quando o visitante realmente permanece diante da rosa.
- **Dourada — abertura:** registra o instante em que a proteção é retirada.
- **Azul — chuva:** preserva a decisão de permitir que a água caia.

Cada ação só gera uma estrela por visita. As estrelas existem no espaço tridimensional da cena, pulsam suavemente e são ligadas cronologicamente. Suas posições são persistentes: atualizar a página não redesenha a constelação.

## Memória e privacidade

O histórico é armazenado exclusivamente no `localStorage` do navegador, sob uma chave própria do projeto. Nenhum dado é transmitido para servidores. O estado contém a versão do formato, a sessão atual, o horário da última visita, a sequência de memórias e as ações já registradas.

Uma sessão permanece válida por trinta minutos. Recarregar a página imediatamente não cria outra visita nem duplica ações. Depois desse intervalo, um novo acesso inicia outra visita e acrescenta uma estrela branca mais intensa. Dados ausentes, incompatíveis ou corrompidos são descartados com segurança. Se o armazenamento estiver bloqueado, o sketch continua funcionando durante a sessão, mas avisa que não poderá preservá-la.

## A rosa e a familiaridade

A quantidade de memórias produz internamente uma familiaridade contínua, calculada por `1 - exp(-memórias / 8)`. Esse valor nunca aparece como placar ou barra. Ele altera discretamente a postura, o movimento e a abertura inicial da rosa. Conforme a constelação cresce, a flor torna-se mais ereta, responde com mais confiança à chuva e se inclina suavemente em relação à câmera.

## Construção e técnicas

O sketch usa `createCanvas(..., WEBGL)` com p5.js 2.2.3 carregado por CDN. Não há imagens, texturas ou modelos externos.

- `sphere`, `ellipsoid`, `cylinder`, `cone` e `torus` constroem planeta, pedras, árvore, gotas, rosa, redoma, estrelas e impactos.
- `buildGeometry()` reúne planeta, árvore, gotas estáticas e estrelas decorativas em malhas reutilizáveis.
- Um shader de vértices move milhares de gotas com pequenas fases espaciais na GPU.
- `camera()` e `perspective()` implementam a câmera orbital com limites de distância e elevação.
- Luzes direcionais e pontuais, materiais e normais produzem volume sem modelos ou texturas.
- A constelação usa posições 3D determinísticas derivadas de cada memória, linhas cronológicas e animações de nascimento.
- Eventos de ponteiro tratam mouse, toque e gesto de pinça.

O código limita `deltaTime`, usa `pixelDensity(1)`, reduz a quantidade de gotas em telas estreitas e exibe no máximo 36 estrelas simultaneamente. O histórico completo continua preservado quando esse limite visual é ultrapassado.

## Organização

- Persistência e validação dos dados.
- Sessões e registro de ações únicas.
- Constelação e animação das novas estrelas.
- Construção estática do planeta e da árvore.
- Chuva, impactos e recomposição da água.
- Ciclo biológico da rosa e movimento da redoma.
- Câmera, mouse, toque e interface.

## Ideias para o projeto final

### Entrega 2 — O planeta se transforma

O histórico de cuidado começará a alterar permanentemente a matéria do planeta. A chuva poderá deixar veios azulados, raízes poderão se expandir, vegetação e frutos poderão surgir e períodos excessivos sob a redoma poderão mudar a postura da rosa. Chuva, proteção e observação produzirão consequências visuais diferentes, ainda sem barras ou condições explícitas de vitória.

### Entrega 3 — O planeta guarda a relação

O tempo real entre visitas passará a influenciar o mundo. Ausências longas, diferentes trajetórias de transformação, uma constelação mais elaborada e a possibilidade de revisitar marcas formarão a versão final. Materiais, iluminação, transições, desempenho e uma possível paisagem sonora também serão refinados. Não haverá vitória ou derrota: cada histórico produzirá uma versão particular do planeta.

## Arquivos

- `index.html`: estrutura da nova experiência e carregamento do p5.js por CDN.
- `style.css`: identidade visual e adaptação para telas pequenas.
- `sketch.js`: cena WEBGL, persistência, constelação, rosa, chuva e interação.
- `thumbnail.png`: captura representativa desta primeira entrega.
- `README.md`: metadados, conceito, instruções, planejamento e prompt integral.

## Limitações conhecidas

- A memória pertence ao navegador e à origem em que o sketch é executado. Apagar os dados do site, usar navegação privada ou abrir a obra em outra origem cria outro histórico.
- A iluminação do p5.js não produz sombras projetadas nesta cena.
- O desempenho real varia conforme navegador e GPU.

## Validação

### Verificações realizadas

- `sketch.js` passou na análise sintática com `node --check`.
- A cena foi renderizada integralmente em Chromium com WebGL por software e p5.js 2.2.3. A cópia local usada exclusivamente durante o teste foi removida; o ZIP final contém apenas a referência ao CDN.
- Foram acionadas e observadas as quatro memórias: visita branca, observação rosada, abertura dourada e chuva azul.
- A constelação permaneceu com as mesmas quatro estrelas e posições depois de atualizar a página.
- Repetir observação, abertura e chuva na mesma sessão manteve a contagem em quatro memórias.
- Um teste automatizado com treze asserções verificou criação inicial, ações únicas, recarregamento, nova visita após 31 minutos, recuperação de JSON corrompido e lógica do comando de apagar memória.
- Um estado propositalmente corrompido foi carregado no navegador; o sketch descartou os dados inválidos, iniciou uma memória válida e continuou renderizando.
- Uma sessão envelhecida artificialmente em 31 minutos produziu uma segunda visita e uma nova estrela branca maior.
- Rotação por arraste, aproximação com rolagem, foco na rosa, abertura da redoma, chuva, florescimento e retorno à vista geral foram exercitados no navegador.
- O layout foi inspecionado em janelas de 1200 × 820 e 500 × 844 pixels, sem transbordamento horizontal. Em telas compactas, a constelação é aproximada do planeta para não desaparecer pelas bordas.
- `thumbnail.png` é uma captura real do sketch executando com as quatro memórias conectadas.
- A estrutura final contém apenas `index.html`, `style.css`, `sketch.js`, `README.md` e `thumbnail.png`.

### Verificações externas pendentes

- A importação no p5Front e a leitura do painel ⓘ não puderam ser executadas neste ambiente.
- O navegador gráfico de teste bloqueou o CDN por uma restrição de certificado da infraestrutura. A renderização foi validada com a mesma versão 2.2.3 obtida do pacote oficial, e o HTML final voltou a apontar para `https://cdn.jsdelivr.net/npm/p5@2.2.3/lib/p5.min.js`.
- A largura exata de 390 pixels e o gesto físico de pinça não foram executados; a folha de estilos possui regras específicas para larguras de até 390 pixels e o tratamento de dois ponteiros permanece implementado.

## Prompt da primeira entrega

O texto abaixo é a solicitação integral usada para produzir esta etapa.

```markdown
Crie a **primeira entrega do projeto final de programação criativa**, chamada **“O planeta que se lembra de você”**, usando **p5.js versão 2 em modo WEBGL**.

Use como base o ZIP anexado do artefato anterior, **“O planeta que guarda a chuva”**. Reaproveite e melhore o código útil da cena 3D — planeta, chuva, rosa, redoma, árvore, câmera, shader, iluminação e otimizações —, mas trate esta como **uma entrega inteiramente nova**.

O projeto deve ter:

- novo conceito;
- novo título;
- nova identidade visual;
- nova interface;
- nova lógica de interação;
- novo `README.md`;
- nova `thumbnail.png`;
- novos metadados;
- novo ZIP de entrega.

Não reutilize o README, a thumbnail, a coleção ou a apresentação visual do trabalho anterior. O código pode ser reaproveitado e refatorado porque esta obra é uma evolução técnica daquele experimento, mas todo o restante deve ser produzido especificamente para o projeto final.

# Conceito

Um pequeno planeta é capaz de se lembrar de quem o visita.

Cada ação significativa realizada pelo visitante transforma-se em uma estrela colorida permanente. Essas estrelas surgem no espaço ao redor do planeta e são ligadas cronologicamente, formando uma constelação particular. A constelação funciona como o registro visual da relação construída entre o visitante e aquele mundo.

A inspiração vem da atmosfera e da ideia de “cativar” presente em *O Pequeno Príncipe*, mas a obra deve possuir composição, comportamento e narrativa próprios. Não quero uma reprodução literal do livro, personagens reconhecíveis ou uma coleção de referências. A relação com a obra deve aparecer principalmente no conceito de que criar um vínculo deixa marcas tanto em quem observa quanto naquilo que é observado.

A obra deve transmitir que o planeta não guarda apenas eventos: ele gradualmente aprende a reconhecer o visitante.

# Escopo desta primeira entrega

Esta entrega deve apresentar uma obra funcional e completa por si mesma, embora seja apenas o primeiro estágio de um projeto que continuará evoluindo nas duas semanas seguintes.

O núcleo desta etapa é a criação da **memória persistente do planeta**, representada por estrelas coloridas.

Implemente quatro tipos de memória:

- **Visita:** ao iniciar uma nova visita válida, surge uma estrela branca.
- **Observação da rosa:** ao aproximar a câmera da rosa e permanecer observando-a por aproximadamente dois segundos, surge uma estrela rosada.
- **Abertura da redoma:** ao abrir a redoma pela primeira vez naquela visita, surge uma estrela dourada.
- **Chuva:** ao liberar a chuva pela primeira vez naquela visita, surge uma estrela azul ou turquesa.

Cada tipo de ação deve criar no máximo uma estrela por visita. Apertar repetidamente o mesmo botão não pode gerar várias estrelas iguais.

# Definição de visita

A primeira execução da obra cria a primeira visita.

Uma nova visita deve ser reconhecida somente quando tiver passado um intervalo mínimo desde a sessão anterior. Use aproximadamente **30 minutos** como intervalo padrão. Atualizar a página imediatamente não deve criar uma nova estrela branca nem permitir duplicar todas as memórias da mesma sessão.

Armazene um identificador da sessão, o horário da visita e quais ações já foram registradas nela. Uma visita posterior válida deve criar uma estrela branca um pouco maior ou visualmente mais intensa que a estrela da primeira visita.

Inclua um comando discreto chamado **“Apagar memória”**, destinado a testes e apresentações. Ele deve pedir confirmação antes de remover os dados persistentes e restaurar a experiência inicial.

Se o armazenamento local estiver indisponível, a obra ainda deve funcionar durante a sessão atual e informar discretamente que a memória não poderá ser preservada depois que a página for fechada.

Nenhum dado deve ser enviado para servidores. Toda a memória deve existir apenas no navegador do visitante.

# Persistência

Use `localStorage` com uma chave específica e suficientemente única para este projeto.

Armazene, no mínimo:

- versão do formato dos dados;
- identificador ou instante inicial da sessão atual;
- horário da última visita;
- sequência cronológica das memórias;
- tipo de cada memória;
- posição espacial de cada estrela;
- ações já realizadas na sessão;
- quantidade total de visitas.

Implemente validação dos dados carregados. Caso o conteúdo salvo esteja ausente, incompleto, incompatível ou corrompido, inicialize um estado válido sem interromper o sketch.

A disposição das estrelas precisa permanecer igual depois de atualizar ou reabrir a página. Não gere posições diferentes a cada carregamento.

# Constelação de memórias

As estrelas de memória devem existir no espaço tridimensional da cena, e não como elementos HTML sobrepostos à tela.

Cada memória deve possuir:

- posição 3D persistente;
- cor correspondente ao tipo de ação;
- brilho ou pulsação suave;
- tamanho com pequena variação;
- instante ou ordem de criação.

Ligue as estrelas de memória por linhas finas e discretas, seguindo a ordem cronológica em que surgiram. A constelação deve crescer progressivamente, sem aparecer pronta desde o começo.

Ao criar uma nova memória:

1. faça a estrela surgir suavemente;
2. aumente seu brilho por um instante;
3. desenhe gradualmente a ligação com a memória anterior;
4. preserve o movimento contemplativo da cena.

As estrelas de memória precisam ser visualmente distinguíveis das estrelas decorativas do fundo. Evite aparência de neon, interface tecnológica, mapa de rede ou painel de dados. A constelação deve parecer poética, delicada e integrada ao pequeno universo.

Distribua as memórias de maneira que as primeiras estrelas sejam visíveis no enquadramento inicial. As posições podem ser calculadas de forma pseudoaleatória, mas devem usar uma semente derivada da própria memória para permanecer determinísticas.

Evite crescimento visual ilimitado. Defina uma quantidade máxima razoável de estrelas visíveis, preservando os dados históricos. Caso esse limite seja alcançado, memórias antigas podem perder intensidade ou integrar uma névoa estelar discreta, sem simplesmente quebrar a composição.

# A rosa reconhece o visitante

A rosa deve responder gradualmente à quantidade de memórias acumuladas. Essa resposta não deve usar níveis explícitos, barras, pontos ou mensagens de gamificação.

Calcule internamente uma variável contínua de familiaridade. Uma possibilidade é:

`familiaridade = 1 - exp(-quantidadeDeMemorias / 8)`

Use essa familiaridade para produzir mudanças sutis:

- inicialmente, a rosa é pequena, fechada e levemente recolhida;
- conforme a constelação cresce, ela se torna mais ereta;
- começa a inclinar-se discretamente na direção da câmera;
- apresenta movimento orgânico mais perceptível;
- quando recebe chuva com a redoma aberta, floresce com mais confiança e amplitude;
- visitantes recorrentes devem perceber que a rosa reage de forma diferente, sem que o programa explique isso numericamente.

A rosa não deve seguir a câmera de forma mecânica ou instantânea. Use interpolação suave e limite o ângulo de inclinação para que o movimento pareça orgânico.

Mantenha a lógica principal da redoma:

- ela começa fechada;
- pode ser aberta e fechada;
- a chuva somente desperta a rosa quando a redoma está aberta;
- fechar a redoma interrompe temporariamente o ciclo biológico;
- reabrir permite que ele continue;
- a primeira abertura válida da sessão registra a memória dourada;
- fechar a redoma não precisa criar uma nova estrela nesta etapa.

Mantenha também o ciclo de crescimento, florescimento e murchamento, mas refatore-o para que a familiaridade influencie suavemente a postura e o florescimento.

# Chuva e planeta

Reaproveite o sistema existente de gotas suspensas e chuva radial, preservando as otimizações com `buildGeometry()` e shader quando forem úteis.

Melhore o que for necessário para integrar a chuva ao novo projeto:

- mantenha o movimento lento das gotas;
- preserve a abertura temporária no invólucro de água;
- mantenha os impactos ou ondulações na superfície;
- permita repetir a chuva depois da recomposição;
- registre apenas a primeira chuva de cada visita como memória azul;
- a chuva deve funcionar independentemente da posição da câmera;
- a constelação não pode ser afetada indevidamente pelo shader das gotas.

O planeta, a árvore invertida, a rosa e a água podem manter a linguagem visual do artefato anterior, mas devem receber refinamentos de composição, iluminação, materiais e enquadramento para pertencerem à nova obra.

# Direção visual

Crie uma nova identidade visual para **“O planeta que se lembra de você”**.

A atmosfera deve ser:

- contemplativa;
- delicada;
- melancólica sem ser sombria demais;
- artesanal;
- inspirada em pequenos mundos;
- distante de interfaces tecnológicas ou de videogames convencionais.

Use:

- fundo azul muito escuro;
- tons terrosos no planeta;
- azul e turquesa na água;
- rosa envelhecido na flor;
- branco, rosa, dourado e azul nas memórias;
- iluminação suave;
- bastante espaço negativo;
- tipografia elegante e discreta.

A interface não deve copiar o layout editorial do artefato anterior. Refaça o HTML e o CSS com uma composição nova e responsiva.

Os controles podem incluir:

- **Aproximar-se da rosa**;
- **Abrir redoma / Fechar redoma**;
- **Deixar chover**;
- **Vista do planeta**;
- **Apagar memória**.

Use textos de estado curtos e poéticos, sem explicar excessivamente a metáfora. A obra precisa ser compreendida principalmente pelo comportamento visual.

A interface deve funcionar em desktop e celular. Arrastar deve girar a câmera; roda do mouse ou gesto de pinça deve controlar a aproximação. Os botões devem continuar utilizáveis em telas pequenas sem cobrir o planeta.

# Som e recursos externos

Não é necessário implementar áudio nesta primeira entrega.

Não use imagens, modelos 3D ou texturas externas. Construa os elementos com primitivas, geometrias próprias, shaders e materiais do p5.js.

Não inclua a biblioteca p5.js no ZIP.

# Arquitetura do código

Organize o código em partes claras, separando responsabilidades como:

- inicialização e renderização;
- construção do planeta;
- construção da árvore;
- construção da rosa e da redoma;
- partículas e chuva;
- câmera e gestos;
- armazenamento persistente;
- gerenciamento de sessões;
- criação das memórias;
- renderização da constelação;
- cálculo de familiaridade;
- interface e textos de estado.

Evite concentrar toda a nova lógica em `draw()`.

Comente em português principalmente:

- decisões menos óbvias;
- estrutura dos dados persistentes;
- definição de uma nova sessão;
- posicionamento determinístico das estrelas;
- crescimento da constelação;
- cálculo de familiaridade;
- tratamento de dados corrompidos;
- relação entre câmera e rosa.

Não encha o código com comentários que apenas repitam literalmente cada linha.

# Desempenho

Preserve ou melhore as otimizações do artefato anterior.

Considere:

- `pixelDensity(1)` quando necessário;
- malhas de baixa complexidade;
- geometrias estáticas reunidas com `buildGeometry()`;
- quantidade reduzida de primitivas desenhadas individualmente;
- número menor de gotas em telas pequenas;
- limite para quantidade de estrelas e linhas visíveis;
- limitação de `deltaTime` após retorno de abas inativas;
- ausência de criação desnecessária de vetores e objetos a cada quadro.

O projeto deve permanecer fluido em computadores comuns e utilizável em celulares razoáveis.

# Limite desta entrega

Implemente apenas o escopo da **entrega 1**.

Não implemente ainda todas as transformações ambientais, consequências de ausência prolongada, múltiplas trajetórias finais ou áudio completo. Entretanto, organize o código para permitir essas expansões sem precisar reescrever toda a arquitetura.

A primeira entrega precisa parecer uma obra funcional, e não uma demonstração técnica incompleta.

# Planejamento das próximas entregas

Registre no README que o projeto deverá evoluir da seguinte maneira.

## Entrega 2 — O planeta se transforma

Pretendo fazer com que o histórico de cuidado produza mudanças persistentes na matéria do planeta:

- a chuva deixará veios azulados ou marcas na superfície;
- raízes poderão se expandir;
- vegetação e pequenos frutos poderão surgir;
- períodos excessivos sob a redoma poderão alterar a postura da rosa;
- chuva, proteção e observação produzirão resultados visuais diferentes;
- o planeta começará a revelar consequências das escolhas acumuladas.

Essas mudanças continuarão sem barras de estado ou condições explícitas de vitória.

## Entrega 3 — O planeta guarda a relação

Pretendo acrescentar:

- influência do tempo real transcorrido entre visitas;
- reação visual a ausências longas;
- diferentes trajetórias de transformação;
- constelação mais elaborada;
- possibilidade de revisitar as marcas deixadas;
- transições e enquadramentos mais refinados;
- polimento de materiais, iluminação e desempenho;
- paisagem sonora opcional, caso ela fortaleça a obra;
- experiência final responsiva e devidamente testada.

O resultado final não deverá possuir vitória ou derrota. Cada histórico de interação deverá produzir uma versão particular do planeta.

# Arquivos da entrega

Entregue um único arquivo ZIP com os seguintes arquivos diretamente na raiz:

- `index.html`
- `sketch.js`
- `style.css`
- `README.md`
- `thumbnail.png`

Arquivos JavaScript adicionais podem ser usados se melhorarem claramente a organização, desde que também estejam na raiz ou em uma estrutura simples suportada pelo p5Front.

Não coloque uma pasta externa envolvendo o projeto dentro do ZIP.

O arquivo da miniatura deve se chamar exatamente **`thumbnail.png`**. Não use nomes como `thumbnail (1).png`. A miniatura precisa ser uma captura real e representativa desta primeira entrega, mostrando o planeta e pelo menos algumas estrelas coloridas conectadas.

# p5.js

Use **p5.js versão 2**, carregado exclusivamente por CDN.

Utilize, por exemplo:

`https://cdn.jsdelivr.net/npm/p5@2.2.3/lib/p5.min.js`

Não inclua `p5.js`, `p5.min.js` ou uma cópia da biblioteca no ZIP.

# README.md

O `README.md` deve começar exatamente com um preâmbulo YAML válido semelhante a:

---
title: O planeta que se lembra de você
tags: [AI, ChatGPT, p5.js, WEBGL, 3D, memória, constelação, interação, persistência, rosa]
collection: projeto final/Henrique Kezen V. H. Leite/1
---

Confirme que **“Henrique Kezen V. H. Leite”** corresponde exatamente ao nome exibido no Classroom. Se o nome da plataforma for diferente, use no campo `collection` a grafia exata apresentada pelo Classroom.

Depois do preâmbulo, o README deve conter:

- título da obra;
- nome do autor: **Henrique Kezen V. H. Leite**;
- indicação de que houve auxílio de AI — ChatGPT;
- conceito;
- relação conceitual com a ideia de cativar, sem afirmar que a obra reproduz personagens do livro;
- descrição do que está implementado nesta primeira entrega;
- instruções de execução;
- instruções de interação;
- explicação das quatro cores de memória;
- funcionamento das sessões e da persistência local;
- explicação de que nenhum dado é enviado para servidores;
- técnicas de p5.js e WEBGL utilizadas;
- arquitetura e decisões de desempenho;
- limitações conhecidas;
- seção **“Ideias para o projeto final”**;
- planejamento explícito das entregas 2 e 3;
- lista dos arquivos do ZIP;
- verificações realizadas;
- este prompt reproduzido integralmente em uma seção chamada **“Prompt da primeira entrega”**.

Não afirme que algum teste foi realizado caso ele não tenha sido efetivamente executado.

# Validação obrigatória

Antes de finalizar o ZIP:

1. Verifique a sintaxe de todos os arquivos JavaScript.
2. Execute o projeto em navegador.
3. Confirme que o p5.js carregado pertence à versão 2.
4. Confirme que não há erros no console.
5. Teste a câmera com mouse.
6. Teste zoom com roda do mouse.
7. Teste interação por toque ou emulação móvel.
8. Teste abertura e fechamento da redoma.
9. Teste chuva com a redoma aberta e fechada.
10. Teste criação de cada uma das quatro cores de estrela.
11. Confirme que a mesma ação não cria várias estrelas na mesma visita.
12. Atualize a página e verifique que a constelação mantém as mesmas estrelas e posições.
13. Confirme que atualizar imediatamente não inicia uma nova visita.
14. Teste o comando “Apagar memória”.
15. Teste comportamento com dados inválidos no `localStorage`.
16. Teste layout em tela larga e em largura próxima de 390 pixels.
17. Confirme que `thumbnail.png` existe com esse nome exato.
18. Inspecione o conteúdo final do ZIP.
19. Confirme que a biblioteca p5.js não está incluída.
20. Importe o ZIP no p5Front.
21. Verifique se título, tags, coleção e thumbnail são reconhecidos.
22. Execute dentro do p5Front e observe possíveis mensagens de erro que outras plataformas podem omitir.

Caso alguma validação não possa ser realizada no ambiente disponível, declare isso objetivamente no README em vez de alegar sucesso.

Ao terminar, entregue o ZIP completo da primeira etapa do projeto final.
```
