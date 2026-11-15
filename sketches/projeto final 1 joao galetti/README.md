---
title: Laços
tags: [AI, Claude, música, som, Web Audio, música generativa, fita magnética, Brian Eno, interativo]
collection: projeto final/João Galetti/1
---

# Laços

*Música para fitas que não terminam.*

Em 1978, para compor *Music for Airports*, Brian Eno gravou algumas notas
cantadas em pedaços de fita magnética, fechou cada pedaço num laço e pôs
todos para tocar ao mesmo tempo. Os laços tinham comprimentos diferentes,
e nenhum comprimento era múltiplo de outro, então as notas se encontravam
em combinações que quase nunca se repetiam. Fiz um estúdio desses na
tela, onde a geometria aparece e pode ser mexida.

Numa fita, **tempo é distância**: a fita corre a 19 cm/s, então um laço
que dá a volta num pedestal mais longe demora mais para passar de novo pela
cabeça de leitura. Cada canal do gravador lê um laço que sai dos roletes,
abraça um ou dois pedestais espalhados pela sala e volta. As notas são
marcas de lápis de cera sobre a fita, e o comprimento da marca é a duração
da nota. **Arrastar um pedestal muda o comprimento de todos os laços que
passam por ele**, e com isso muda a música.

> Clique para ligar o gravador. Fones ou caixas de som ajudam.

## Como funciona

**Geometria.** Cada laço é o envoltório convexo dos círculos que a fita
abraça: os dois roletes do canal e os pedestais. O envoltório é calculado
sobre pontos amostrados nos círculos e reamostrado a passo constante. O
perímetro dá o período do laço (entre ~15 e ~45 s), e a cabeça de leitura
fica no ponto em que a fita passa entre os roletes. Ao montar a sessão,
cada canal escolhe os pedestais que dão um período longe dos outros e
longe de razões simples (1:1, 2:1, 3:2…), para que os laços não se
realinhem. A escolha também evita que uma fita passe raspando num pedestal
que ela não abraça.

**Notas.** As marcas ficam presas ao material da fita, não ao espaço. Uma
nota soa enquanto sua marca está sobre a cabeça. Os canais de **voz** têm
notas longas (2,5 a 6,5 s), e os de **piano** têm marcas curtas em X, que
são só o ataque. As alturas saem de uma escala sorteada por sessão
("aeroporto", com as notas de Eno: Fá, Láb, Dó, Réb, Mib…; ou lídio,
pentatônica, dórico, mixolídio), escolhidas para que qualquer encontro de
notas soe bem.

**Som (Web Audio, nativo do navegador).**
- *Voz*: três dentes-de-serra levemente desafinados e um triângulo passam
  por filtros de formantes ("a", "o" ou "u", um por canal), com um pouco
  de respiração (ruído filtrado) e um vibrato que chega devagar, como numa
  voz que sustenta a nota.
- *Piano*: seis parciais senoidais levemente inarmônicas, cada uma com seu
  tempo de decaimento, e uma batida curta de martelo.
- *Fita*: um único nó (`ConstantSource`) controla a afinação de todas as
  vozes ao mesmo tempo, como a velocidade de um gravador. Fita mais rápida
  soa mais aguda, e fita que para soa como um disco perdendo força. Também
  há *wow* e *flutter* (duas oscilações lentas na afinação) e um chiado
  baixo.
- Reverberação por convolução com uma resposta de sala sintetizada (5,5 s,
  com a cauda escurecendo) e um compressor no fim da cadeia.

**Partitura.** Na faixa escura do alto, cada nota que soa é desenhada
enquanto acontece, com a cor da marca de lápis do seu canal: os últimos
90 segundos, nota por nota. Ali aparecem os acordes que ninguém compôs,
que surgem do encontro de laços de comprimentos diferentes.

**O gravador.** Cada canal tem uma etiqueta de fita crepe com as notas
escritas à mão, um VU que responde à voz do canal, o período do laço e uma
luz de liga/desliga. A fita tem brilho de óxido, sombra, marcas finas que
mostram o movimento e uma emenda prateada. O laço que está cantando acende
de leve na cor do seu lápis.

## Interação

- **clique**: liga o gravador (o navegador só permite som depois de um clique)
- **arraste os pedestais**: muda o comprimento dos laços e, com ele, o ritmo
- **clique numa fita**, no botão do canal ou nas teclas **1–7**: liga/desliga o canal
- **↑ ↓** ou **rolagem**: velocidade da fita, de semitom em semitom (de −12 a +12)
- **0**: volta à velocidade original
- **espaço**: para ou solta a fita
- **N**: outra sessão (outros pedestais, laços, notas e escala)
- **S**: salva a imagem
- `?seed=N` na URL fixa a sessão

## Detalhes técnicos

- p5.js v2 via CDN (jsDelivr), modo 2D; nada da biblioteca no zip. O som
  usa só a Web Audio API do próprio navegador, sem bibliotecas. Fontes
  IBM Plex e Caveat via Google Fonts.
- Sessões reprodutíveis por semente (mulberry32).
- Testado em navegador headless (Playwright): sem erros no console; o pico
  do sinal de saída ficou entre 0,1 e 0,45, sem clipar. Também testei
  variação de velocidade, parada da fita, arraste dos pedestais e telas
  largas e em retrato.

## O que vem nas próximas entregas

**2ª entrega: compor com a fita**
- **Gravar a própria voz** num trecho de um laço, com o microfone (`getUserMedia`).
  O laço passa a cantar com a sua voz, sujeita à velocidade da fita.
- **Lápis de cera e tesoura**: desenhar novas marcas na fita com o mouse,
  apagar marcas, cortar um trecho e emendar invertido (fita tocada ao
  contrário).
- **Laçar e soltar pedestais**: incluir ou tirar um pedestal de um laço,
  criar pedestais novos e mudar a forma do laço sem limite de dois
  pedestais.

**3ª entrega: os outros estúdios**
- **Frippertronics**: dois gravadores com a mesma fita passando do primeiro
  para o segundo, criando eco que se repete e decai. A distância entre a
  cabeça de gravação e a de leitura é o tempo do eco, e dá para ver isso
  na tela.
- **Fase à la Steve Reich**: dois laços idênticos em velocidades
  ligeiramente diferentes, que se defasam devagar.
- Uma vista **3D (WEBGL)** do estúdio, com as fitas em alturas diferentes
  e a câmera passeando entre os pedestais.
- Exportar a sessão: gravar o áudio (`MediaRecorder`), salvar a partitura e
  compartilhar a posição dos pedestais pela URL.

Autor: **João Galetti**. Feito com o auxílio de AI (Claude, da Anthropic),
com verificação visual e do sinal de áudio de cada iteração via Playwright.
