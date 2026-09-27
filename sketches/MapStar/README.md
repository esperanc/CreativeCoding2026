---
collection: artefato da semana/6
---

# MapStar
> Autora: Laura Daflon
> DRE: 120053993

## Sobre
Projeto de arte generativa desenvolvido em p5.js. Um mapa se forma progressivamente a partir de caminhadas aleatórias, criando agrupamentos de terra sobre um oceano com gradiente radial. A cada execução, surge uma paisagem diferente, cujo formato não é conhecido antecipadamente.
Funcionamento
1. A tela é dividida em nove regiões, cada uma com um cluster de origem.
2. Cada cluster desenha pequenos círculos por meio de movimentos aleatórios. Tons de verde e marrom com transparência criam as texturas do terreno.
3. As posições desenhadas são armazenadas em landPoints.
4. Quando a construção termina, dois pontos distintos de terra são sorteados e recebem marcadores vermelhos.
5. A busca A* explora o terreno progressivamente, deixando pequenos pontos claros nas posições visitadas.
6. Se houver uma conexão, o caminho encontrado é destacado em escuro. Caso contrário, a busca termina sem traçar uma rota.
O raio dos clusters e a quantidade de tentativas de movimento são proporcionais ao tamanho do canvas. As regiões de crescimento podem se sobrepor, mas isso não garante que todas as ilhas estejam conectadas.

## Algoritmo A*
O A* combina o custo percorrido desde a origem com uma estimativa da distância restante até o destino. Neste projeto, os nós são posições de landPoints, e dois nós são conectados quando seus círculos de terreno se tocam ou se sobrepõem.
A distância euclidiana é usada tanto para calcular o custo dos deslocamentos quanto para estimar a distância até o destino. O resultado, quando existe, é o menor caminho no grafo construído a partir desses pontos.
Os pontos claros representam a exploração do algoritmo e podem formar ramificações; o caminho final é exibido separadamente em escuro.

## Tecnologias
- JavaScript
- p5.js
- Canvas 2D para o gradiente radial
- Algoritmo A* com fila de prioridade
