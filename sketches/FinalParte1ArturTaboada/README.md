---
title: Reconstituição
tags: [AI, Claude, fracture, shape-matching, inverse-problem, geometry, generative, p5js]
collection: projeto final/Artur Taboada Dios Carvalho/1
---

# Reconstituição

Um disco de vidro é atingido num ponto. Ele trinca, os cacos se afastam — e então o programa remonta o disco inteiro olhando **apenas para o formato das bordas quebradas**. A partir do momento em que os cacos se separam, quem remonta não sabe mais de onde veio nenhum deles: não recebe posição, não recebe rotação, não recebe vizinhança. Recebe um saco de contornos.

A tese que o sketch quer tornar visível é esta: **a informação que permite remontar um objeto quebrado não está em lugar nenhum além da aspereza da fratura.** Uma superfície de ruptura frágil não é lisa — é rugosa, e a rugosidade é a *mesma* dos dois lados da quebra, porque os dois lados eram o mesmo lugar um instante antes. É por isso que um restaurador diz que dois cacos eram vizinhos sem nunca ter visto a peça inteira. Tirada a aspereza, não sobra nada: duas bordas lisas de mesmo comprimento são indistinguíveis.

O disco tem uma borda lisa, que não é fratura, e ela está lá de propósito — é o contraexemplo dentro da própria peça. Nenhuma linha do programa fala em "aro" ou em "borda original"; mesmo assim ela nunca é usada para remontar nada, porque não tem o que dizer. Como isso acontece sozinho é a parte mais interessante do código, e está contada abaixo.

## Como o sketch funciona

**A quebra não é Voronoi.** Voronoi é o atalho de sempre e produz um padrão que não se parece com nada quebrado. O padrão aqui é o do impacto em placa frágil: trincas radiais partindo do ponto atingido e trincas circunferenciais ligando radiais vizinhas, com os anéis cada vez mais largos conforme se afastam — cacos miúdos perto da pancada, cacos grandes na periferia. É o desenho que qualquer um reconhece num para-brisa. Algumas trincas circunferenciais não vão até o fim, e onde elas falham dois cacos saem grudados num só; é o que tira a regularidade do leque.

**A aspereza é auto-afim.** Cada trinca é uma soma de harmônicos com amplitude caindo com a frequência segundo um expoente, que é o jeito usual de escrever uma curva auto-afim. Em fratura frágil esse expoente ronda 0,8, medido assim em vidro, metal e rocha. Vale registrar que o número de harmônicos foi decidido pela aparência e confirmado pela medição: com poucos, o primeiro domina e a trinca serpenteia feito rio — na tela virava peça de quebra-cabeça, não vidro partido. Com muitos, o desenho fica certo **e** o casamento fica mais fácil, porque a informação que identifica uma borda está no número de ondulações independentes, não no tamanho delas.

**O desgaste existe para o problema não ser de brincadeira.** Depois de separado, cada caco é amassado por conta própria. Sem isso, dois cacos vizinhos teriam a borda idêntica ao bit e o casamento seria exato — o que não acontece com nada que se quebra de verdade.

**O que o solucionador recebe** é uma lista de polilinhas fechadas, em ordem sorteada, cada uma centrada no próprio centroide e girada por um ângulo aleatório. A linha que faz essa entrega está escrita de propósito para ser auditável: `resolver(sacola.contornos)`, e nada mais atravessa.

**Como ele trabalha**, em cinco passos:

1. Reamostra cada contorno a passo constante e guarda, em cada ponto, quanto a tangente girou desde ali — um número que não muda se o caco for girado ou arrastado.
2. **Peneira:** para cada par de cacos, procura trechos em que esse giro acumulado corre junto nos dois, um deles lido ao contrário.
3. **Confere:** em cada trecho candidato, acha por mínimos quadrados o movimento rígido que põe uma borda sobre a outra e mede o que sobra, em pixels. Depois estica o trecho pelas pontas até as duas bordas se afastarem.
4. **Desambigua:** trechos rivais pela mesma beirada se anulam, a não ser que um seja bem mais longo que os outros.
5. **Monta:** aceita os pares do mais longo para o mais curto, sem fechar ciclo, e percorre a árvore encaixando um caco de cada vez.

**Não existe etapa de achar cantos**, e o passo 3 explica por quê: o canto aparece sozinho, como a posição em que duas bordas param de concordar. Procurá-lo antes seria procurar o que já vem de brinde — e, como a seção sobre IA conta, também não funciona.

**A busca acontece na tela, aos poucos.** Resolver a quebra inteira de uma vez levava um quarto de segundo aqui e bem mais numa máquina lenta, e isso aparecia como uma tela branca no começo: o navegador não desenha quadro nenhum enquanto uma função não devolve. A varredura passou a ser feita alguns pares por quadro, com o ritmo calculado para a quebra inteira caber em cerca de duzentos quadros, qualquer que seja o número de cacos. O arranque caiu de 250 ms para menos de 20 ms — um quadro.

Não foi só conserto de desempenho, e o ganho maior é outro: a busca é a parte mais interessante do programa e estava acontecendo escondida. Agora ela é a terceira fase. Um fio liga o par de cacos que está sendo comparado naquele instante, e cada trecho dado por coincidente pisca em azul e some em menos de um segundo. São as **tentativas** — por volta de oitenta e cinco delas numa quebra típica, contra cerca de vinte que sobrevivem às peneiras. O contraste entre os muitos piscas azuis e os poucos fios dourados que ficam no encaixe é a melhor explicação que achei do que o programa faz.

**O aro cai fora no passo 4.** Um trecho áspero de fratura casa com um caco só, o que estava do outro lado. Um trecho liso casa com todo mundo que também tenha um trecho liso, porque não tem o que os distinga. Jogar fora os trechos reivindicados por vários parceiros elimina a borda original sem jamais mencioná-la.

## O que foi medido

Vinte e cinco quebras seguidas, em navegador, somando 522 cacos:

| | |
|---|---|
| cacos por quebra | 21,1 em média |
| cacos devolvidos ao lugar certo | 526 de 528 — **99,6%** |
| quebras remontadas por inteiro | 23 de 25 |
| pior quebra isolada | 95% dos cacos recuperados |
| pares de vizinhança aceitos | 501 |
| pares aceitos que estavam **errados** | **nenhum** |
| erro de posição depois de alinhar | 0,95 px |
| tempo para resolver uma quebra | 262 ms, repartidos por ~200 quadros |
| tempo do arranque, antes do primeiro quadro | cerca de 11 ms |

Nenhum falso positivo em 501 decisões é o número de que mais me orgulho, e ele não veio de sorte: veio de exigir que cada casamento passasse por três provas independentes — o giro acumulado, a distância em pixels e a unicidade.

## O que não volta

Quase tudo volta: em 25 quebras, 23 fecharam completas. O caco que sobra, quando sobra, é sempre do mesmo tipo — um dos miúdos do centro, pulverizados pela pancada. Isso não é defeito, é consequência direta da tese. Uma borda curta carrega poucas ondulações, e poucas ondulações não bastam para identificar ninguém. É exatamente o que acontece numa bancada de restauro, onde a caixinha de lascas sem destino fica para sempre ao lado da peça remontada.

E o disco volta a ficar inteiro **torto**. Encaixe é informação relativa: os cacos sabem quem era vizinho de quem e não sabem que lado era para cima. Medindo o giro entre a reconstituição e a verdade nas 25 quebras, ele cai em qualquer lugar do círculo — 77°, −73°, −126°, 175°, −36°… A inclinação com que a peça termina não é um erro do programa: é a parte da pergunta que não tem resposta.

## Inspiração

A referência direta é a bancada de restauro arqueológico, onde a reconstituição de uma peça é feita por tentativa sobre o formato das fraturas, e onde a regra de ouro é que a quebra é a assinatura. A segunda é o *kintsugi*, pela ideia de que a linha da quebra pode ser o que há de mais informativo numa peça, em vez do que se esconde — daí os trechos casados acenderem em dourado no momento do encaixe, e só então.

## O que vem nas próximas entregas

**Etapa 2 — tornar o problema difícil de verdade.** Hoje a montagem é uma árvore: pares que fechariam ciclo são recusados, o que joga fora justamente a informação mais forte que existe. Se A encaixa em B, B em C e C em A, os três giros têm de somar zero, e um casamento falso quase nunca passa nesse teste. Com coerência de ciclos dá para (a) aceitar evidências fracas que hoje são descartadas, recuperando os cacos miúdos do centro, e (b) misturar na mesa os cacos de **dois** discos diferentes e tirar de letra, que é o problema real do arqueólogo. Junto vêm: peças faltando de propósito, a pancada no lugar em que o usuário clicar e com a força que ele der, e materiais diferentes — vidro temperado se estilhaça em grãos quase iguais, cerâmica racha em radiais longas, gelo lasca em conchas.

**Etapa 3 — sair do plano e fechar o argumento.** A remontagem passa a ser de uma casca fina curva, quebrada em três dimensões: as bordas viram curvas no espaço, o casamento passa a comparar torção além de curvatura, e o encaixe vira um movimento rígido de seis graus de liberdade. E, se couber, a conclusão natural do tema: **inferir o caco que falta**. Fechada a remontagem, o buraco que sobra tem um contorno conhecido, e dele se pode deduzir a forma exata da peça perdida — que é literalmente o que um restaurador faz quando modela a reposição. Essa peça inferida seria exportável.

## Sobre o uso de IA

O artefato foi desenvolvido com auxílio do Claude (AI), a partir da minha escolha de tema e de muitas rodadas de medição em navegador. Este projeto foi, de longe, o que mais exigiu derrubar ideias por medição, e vale registrar quatro:

**Achar cantos não funciona.** A primeira versão cortava cada contorno em arestas pelos cantos, para comparar aresta com aresta. Medindo o ângulo em cada canto verdadeiro: a mediana é 88°, ótima — mas os mais fracos viram 5°, enquanto a aspereza no meio de uma trinca chega a virar 42°. As duas populações se sobrepõem e não existe limiar que as separe. O método inteiro foi para o lixo.

**Curvatura é ruidosa demais.** A segunda versão comparava curvatura ponto a ponto. As duas reamostragens caem em pontos ligeiramente diferentes da mesma borda, e só essa defasagem já produz uma discordância do tamanho do sinal — havia pares de vizinhos verdadeiros cuja corrida dava zero. A troca pelo giro *acumulado* resolveu: é uma soma em vez de uma diferença, e somar alisa o ruído em vez de amplificá-lo.

**O aro encaixa mesmo, e isso não é bug.** A corrida falsa mais longa ficava inteira sobre a borda do disco — o raio dos seus pontos variava entre 228 e 230 num disco de 231 — com resíduo de 1,3 px, igual ao de um encaixe verdadeiro. Levei um tempo tentando consertar uma coisa que estava certa: duas partes do mesmo círculo *encaixam*, porque um círculo girado sobre si próprio continua sendo ele. O que falta ao aro não é semelhança, é informação, e isso exigiu um critério de natureza diferente — o da unicidade.

**Quase acertei e estava errado, duas vezes seguidas.** Devolver só a corrida mais longa de cada par parecia óbvio; nos pares que eram *mesmo* vizinhos, a mais longa costumava ser a do aro, e o trecho de fratura, que é o que presta, ficava de fora. E a primeira versão da desambiguação derrubava as duas reivindicações rivais, o que fazia uma corrida falsa encostada numa verdadeira levar a verdadeira junto: sobravam sete de oitenta. As duas só apareceram porque eu estava contando quantos pares aceitos eram *de fato* vizinhos, e não só olhando se a tela ficava bonita.

Por fim, duas correções de desempenho, que acabaram mudando o trabalho. A varredura de todo ponto contra todo ponto levava 2.150 ms por quebra. Indexando os pontos por uma etiqueta — quanto a tangente gira nos dezesseis passos seguintes —, cada ponto passa a ser comparado só com os poucos de etiqueta parecida, e o tempo caiu para 230 ms, sem perder um único casamento. Mesmo assim, 230 ms gastos de uma vez só travam o navegador, e o sintoma era uma tela branca ao apertar "Run". Reparti a varredura em alguns pares por quadro — e, ao fazer isso, percebi que estava escondendo justamente o que havia de mais interessante para quem assiste. A busca virou uma fase visível, que é hoje o trecho mais longo do ciclo.

## Autor

Artur Taboada Dios Carvalho

## Como visualizar este projeto

**Usando o ambiente online (p5front)**

1. Acesse o ambiente de desenvolvimento utilizado na disciplina: [https://esperanc.github.io/p5front/](https://esperanc.github.io/p5front/).
2. Copie todo o conteúdo do arquivo `sketch.js` deste zip e cole na área de edição de código do site.
3. O resultado será renderizado na tela de visualização após o botão "Run" ser clicado. Cada ciclo leva cerca de dez segundos e tem seis tempos: o disco inteiro; a trinca correndo a partir do ponto atingido; os cacos se afastando; **a busca**, em que um fio liga o par que está sendo comparado e cada trecho tentado pisca em azul; a remontagem, com os trechos que sobreviveram acendendo em dourado; e o repouso. Vale esperar o ciclo todo pelo menos uma vez, e vale olhar com atenção a quarta parte, que é onde o programa decide tudo. Cada clique na tela — ou a tecla `R` — atinge um disco novo.

### Controles

| tecla / gesto | ação |
|---|---|
| clique ou `R` | atinge outro disco |
| `espaço` | pausa |
| `A` | avança para a próxima fase |
| `E` | acende ou apaga os trechos casados |
| `D` | mostra a conferência: quantos cacos voltaram ao lugar, quantos pares foram aceitos e quantos estavam certos |
| `S` | salva a imagem num PNG |

Nenhuma biblioteca externa além do p5.js é necessária, e o sketch não carrega nenhum arquivo: toda a geometria nasce em código.
