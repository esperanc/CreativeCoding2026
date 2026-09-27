---
title: bolor limoso
collection: artefato da semana/6
---

# Bolor Limoso — *Physarum polycephalum*

**Artefato da Semana: Emergência**
Programação Criativa · p5.js
Autora: Dala Kezen

---

## Sobre o projeto

Este sketch simula o bolor limoso *Physarum polycephalum*, um organismo unicelular sem cérebro nem sistema nervoso. Mesmo assim, ele constrói redes de transporte eficientes entre fontes de alimento. Em 2010, pesquisadores japoneses colocaram o bolor sobre um mapa da região de Tóquio, com flocos de aveia no lugar das cidades. A rede que ele formou ficou muito parecida com a malha ferroviária real da região (Tero et al., 2010).

A simulação usa alguns milhares de agentes. Cada um é uma "partícula" do plasmódio e segue apenas regras locais. A rede que aparece na tela não está desenhada em nenhuma parte do código: ela **emerge**.

## Por que isto é emergência

Emergência é quando um comportamento global complexo surge da interação de muitas partes simples, sem ter sido programado explicitamente. Neste código, nenhuma linha diz "forme uma rede", "ligue os alimentos" ou "abandone as rotas inúteis". Cada agente só enxerga alguns pixels à sua frente e não sabe que existe uma rede. Os tubos, as ramificações, os circuitos fechados e a reorganização da rede quando um alimento acaba surgem todos da soma dessas decisões locais.

## Regras locais

Cada agente segue quatro regras:

1. **Farejar:** lê a concentração do rastro químico em três pontos à sua frente (esquerda, centro e direita).
2. **Virar:** gira em direção ao ponto de maior concentração.
3. **Andar e depositar:** avança um passo, se a célula da frente estiver livre (cabe um agente por célula), e deposita rastro onde pisou.
4. **Crescer:** de vez em quando, um agente "brota" outro ao seu lado. O plasmódio parte de uma gota pequena e cresce pela própria rede.

O ambiente segue duas regras:

5. **Difusão e evaporação:** o rastro se espalha para as células vizinhas e evapora um pouco a cada quadro.
6. **Alimento e sal:** o alimento libera atrativo e torna mais valioso o rastro que estiver perto dele. O sal repele os agentes. Onde não há rastro, o alimento não age, e o agente continua explorando em linha reta.

## O que emerge

- Tubos de transporte que se engrossam onde há mais tráfego e desaparecem onde não há.
- Redes que ligam as fontes de alimento, com circuitos redundantes, como no organismo real.
- Reorganização espontânea: quando um alimento se esgota, os tubos que levavam até ele se desfazem e a rede se redistribui.
- Morfologias diferentes (rede, malha larga, malha fina) mudando só os números das regras locais (teclas 1, 2 e 3).

## Interação

| Comando | Ação |
|---|---|
| Clique | Coloca alimento (floco de aveia); a rede cresce até ele |
| SHIFT + arrastar | Espalha sal (repelente); a rede contorna a barreira |
| 1 / 2 / 3 | Troca as regras locais (rede de transporte, malha larga, malha fina) |
| T | Modo Tóquio: cidades da região de Kanto como alimento, com o mar como sal |
| R | Reinicia a partir de uma gota no centro |
| D | Reinicia com os agentes espalhados ao acaso |
| A | Liga ou desliga o consumo do alimento |
| C | Remove todo o alimento e o sal |
| Espaço | Pausa |
| S | Salva a tela em PNG |
| H | Mostra ou oculta a ajuda |

**Sugestão de demonstração:** pressione **D** e observe a malha caótica se organizar em rede. Depois clique em três ou quatro pontos distantes e observe a rede migrar até eles. Para a referência histórica, pressione **T**.

## Como executar

- **Editor do p5.js (editor.p5js.org):** crie um sketch novo e substitua o conteúdo de `index.html`, `sketch.js` e `style.css` pelos arquivos deste zip.
- **Localmente:** abra `index.html` em um navegador com acesso à internet.

A biblioteca p5.js **não** está incluída no zip. Ela é carregada por CDN (`p5@1.11.1` via jsDelivr) no `index.html`, conforme a orientação da disciplina.

## Arquivos

- `index.html`: página que carrega o p5.js por CDN e o sketch
- `sketch.js`: toda a simulação, comentada em português
- `style.css`: estilo da página (tela cheia, fundo escuro)
- `README.md`: este documento

## Notas técnicas

- A simulação roda numa grade de até cerca de 300 mil células, ampliada para a tela, o que mantém a animação em torno de 60 quadros por segundo.
- O modelo de agentes segue Jones (2010), incluindo a regra de ocupação (um agente por célula), que cria a pressão responsável pelo crescimento do plasmódio.
- No modo Tóquio, as posições das cidades e o litoral são **aproximados e esquemáticos**, inspirados no experimento de Tero et al. (2010). Não são um mapa fiel.

## Referências

- JONES, J. Characteristics of pattern formation and evolution in approximations of *Physarum* transport networks. *Artificial Life*, v. 16, n. 2, p. 127–153, 2010.
- TERO, A. et al. Rules for biologically inspired adaptive network design. *Science*, v. 327, n. 5964, p. 439–442, 2010.
- NAKAGAKI, T.; YAMADA, H.; TÓTH, Á. Maze-solving by an amoeboid organism. *Nature*, v. 407, p. 470, 2000.

---

## Prompt utilizado

Este projeto foi desenvolvido com auxílio do Claude (Anthropic), a partir do seguinte prompt:

> Realize o artefato da semana, incluindo um ReadMe que inclua esse prompt. O tema será bolor limoso.Regras locais: milhares de agentes depositam um rastro químico, farejam à frente e viram em direção à maior concentração. O rastro difunde e evapora.
> O que emerge: redes de transporte orgânicas e eficientes que se reorganizam sozinhas. É o caso clássico de "rede ferroviária de Tóquio feita por bolor". Visualmente, é a mais impactante das seis.
> Interação: cliques depositam "alimento", e a rede se reconecta até ele.
