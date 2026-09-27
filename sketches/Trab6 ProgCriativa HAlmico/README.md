---
title: Trab6-ProgCriativa-HAlmico
collection: artefato da semana/6
---

title: Polycephalum tags: [p5js, generative, claude, agentes, emergencia, physarum, estigmergia]
Uma placa de Petri com gel de ágar e alguns flocos de aveia. Sobre ela, 16 mil agentes — cada um, uma "gotinha" do bolor limoso Physarum polycephalum. No início eles estão espalhados ao acaso e formam só uma espuma sem direção; em poucos segundos essa espuma se reorganiza sozinha numa rede de transporte que liga todos os flocos de aveia, com veias principais grossas e ramos finos que vão sendo abandonados. A simulação congela no resultado final. Um clique reinicia com uma nova placa.
Onde está a emergência. Nenhuma linha do código descreve uma rede, um caminho ou uma ligação entre flocos. O programa só diz o que UM agente faz, olhando apenas para três pontos à sua frente:
farejar a quantidade de rastro à frente, à esquerda e à direita;
girar um pouco na direção que tem mais rastro;
dar um passo (ou, se bateria no vidro, ficar e sortear outra direção);
deixar um pouco de rastro onde está.
A tela é a memória coletiva: nenhum agente lembra de nada, mas todos leem o que os outros deixaram (estigmergia, o mesmo mecanismo das trilhas de feromônio das formigas). A rede aparece do equilíbrio entre duas forças: caminhos com mais rastro atraem mais agentes, que depositam mais rastro (realimentação positiva), enquanto a evaporação apaga tudo o que deixa de ser usado (realimentação negativa). A aveia é só uma fonte constante de rastro, e as trilhas que ligam fontes são as que continuam sendo reforçadas. A forma final muda a cada execução e não dá para prevê-la olhando o código — só rodando.
O canvas é quadrado e se adapta ao tamanho da janela. A simulação roda numa grade de resolução fixa (300×300), então redimensionar a janela só muda a escala do desenho, não o comportamento. Não há semente fixa de aleatoriedade.
Técnicas usadas:
modelo de agentes com sensores de Jeff Jones: estado mínimo (posição e ângulo), regra local de farejar–girar–andar–depositar;
grade de rastro com difusão parcial (mistura de cada célula com a média 3×3 das vizinhas, feita em duas passadas separáveis) e evaporação a cada passo;
agentes guardados em arrays tipados (Float32Array), já que são milhares e cada um guarda só três números; direções dos sensores laterais obtidas por identidades trigonométricas, com duas chamadas de cos/sin por agente em vez de seis;
cor em duas camadas: o rastro espalhado tinge o gel de amarelo (o halo); a densidade de agentes por célula, suavizada no tempo por uma média móvel, desenha a veia nítida. Os dois valores passam por 1 − e^(−v/k), que comprime valores altos sem saturar;
desenho da grade inteira por pixels de uma p5.Image (loadPixels/updatePixels), ampliada com image();
textura do ágar com noise() calculado uma única vez;
flocos de aveia distribuídos por "melhor candidato", para não caírem amontoados.
Referências sobre o algoritmo:
Jeff Jones, Characteristics of pattern formation and evolution in approximations of Physarum transport networks, Artificial Life, 2010 — http://eprints.uwe.ac.uk/15260/1/artl.2010.16.2.pdf
Sage Jenson, Physarum — https://sagejenson.com/physarum
Autor: Henrique Almico Dias da Silva
