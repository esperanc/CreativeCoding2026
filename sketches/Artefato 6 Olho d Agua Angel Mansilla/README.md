---
collection: artefato da semana/6
---

# Olho d’água

Autor: Angel Mansilla  
DRE: 123691897

A ideia foi fazer um pântano que esconde um olho, o nome brinca com [olho-d’água](https://pt.wikipedia.org/wiki/Nascente), que é como se chama uma nascente, e aqui a nascente fica no fundo da pupila, então no começo parece só um brejo parado, coberto de lentilha-d’água e [vitórias-régias](https://pt.wikipedia.org/wiki/Vit%C3%B3ria-r%C3%A9gia).

Cada toque na água faz uma onda que afasta as plantas, e pelas clareiras vai aparecendo o fundo até dar para reconhecer a íris e a pupila, aí o olho acorda, pisca, e a corrente da nascente leva as vitórias-régias para as margens, onde elas viram os cílios, sem nenhuma folha ter um lugar marcado, os cílios surgem do encontro entre a corrente, a margem e as folhas vizinhas.

Toda a água da cena são 4.000 parcelas, nenhuma surge nem some, elas só mudam de estado ao longo do dia, virando gelo, vapor, nuvem, chuva e neve, e cada parcela e cada planta é um agente com regras locais, como na aula de agentes, o botão Agentes mostra esse nível de baixo.

Em volta coloquei uma estrada com carros e pessoas, um avião que passa entre as nuvens e uma placa, e quando o olho está acordado ele fixa os veículos, junta luz na pupila e dispara um raio que os pulveriza, enquanto quem está na estrada sai correndo desesperado.

Toque na água para abrir clareiras, gire a roda do tempo ou arraste o sol e a lua para mudar a hora, espaço pausa, as setas mudam a hora aos poucos, V mostra os agentes e R recomeça o pântano, é só abrir `index.html`, o p5.js está junto na pasta, então não precisa de internet.

Está tudo feito por código em p5.js, usando agentes, `random()`, `noise()`, campos de fluxo e ruído de Worley, e o lago e as nuvens são pintados com WebGL2 para ficar na resolução da tela.

## Participação da IA

Eu escrevi a ideia e pedi ao **Claude Code** que a implementasse, depois fui pedindo cada acréscimo e ajuste olhando o resultado, a interface, as nuvens, a chuva, o sol e a lua, a estrada, o avião, a placa, o raio e a fuga das pessoas, as ideias e as escolhas foram minhas, o Claude Code escreveu o código, testou no navegador e ajudou com este texto, e o Codex ajudou a corrigir o caminhar das pessoas e o visual delas e dos carros.

## Prompt principal

> Transforme o lago existente em um pântano que esconde um olho. O visitante descobre esse olho ao clicar na água e afastar a vegetação. As vitórias-régias, inicialmente espalhadas, se reorganizam nas margens e passam a formar os cílios.

Esse foi o começo do pedido, que seguia com os detalhes de cada etapa, o pântano do início, os cliques abrindo clareiras, as vitórias-régias virando cílios com regras locais e a pupila que segue o toque e pisca quando o olho é descoberto.
