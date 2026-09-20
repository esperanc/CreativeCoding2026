---
collection: artefato da semana/5
---

# A Sala dos Macacos Infinitos

Autor: Angel Mansilla  
DRE: 123691897

A ideia veio do [Teorema do Macaco Infinito](https://pt.wikipedia.org/wiki/Teorema_do_macaco_infinito), macacos apertando teclas ao acaso poderiam, com tempo infinito, escrever qualquer texto finito, e a sala usa fileiras que diminuem até sumir para passar essa sensação de infinito.

Cada macaco escreve uma sequência diferente, cada um no seu ritmo, e, conforme as 22 linhas são preenchidas, a folha sobe pela máquina, levando cerca de 30 segundos até ficar pronta, só então ela vai para a pilha. Cada mesa guarda até 50 páginas, depois disso, as mais antigas dão lugar às novas. Toque na folha da máquina para acompanhar o texto ou no topo da pilha para ler a última página pronta, se tocar fora ou apertar ESC, a folha fecha, e R gera uma nova sala.

A roda do mouse leva a câmera para a frente ou para trás pelo corredor, e as fileiras que saem de vista dão lugar a novas fileiras no fundo, então a sala continua.

Está tudo desenhado por código em p5.js, usando formas, curvas, laços, transformações, `random()` e `noise()`, pensando em cada macaco como um agente. O `createGraphics()` guarda os desenhos para não refazer todos os detalhes a cada quadro, e usei o Codex como apoio no desenvolvimento e nos testes.

É só abrir `index.html` com internet para carregar o p5.js, a sala é uma simulação infinita, então tente encontrar algum dos grandes textos escritos, talvez você precise de um tempo infinito.
