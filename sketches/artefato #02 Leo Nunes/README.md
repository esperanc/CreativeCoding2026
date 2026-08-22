---
title: Jogo da Vida de Conway ArcoIris Piscante
tags: [square, ai, chatgpt, generative]
collection: artefato da semana/2
---

Um sketch feito pelo ChatGPT com modificações do Aluno.

Autor: Leonardo Nunes Guimarães Costa



Prompt usado:just made an p5 incomplete code, please complete it, its for a conways game of life 

function setup() {
     createCanvas(windowWidth, windowHeight);
      state = randomState(100) 
} 
function randomState(cellSize){} 
function drawCell(x,y,nxtState,cellSize){ 
    if(nxtState == 0){ 
        fill(black); } 
    else{ 
        fill(white); 
    } 
    square((x-1)*cellSize,(y-1)*cellSize,cellSize) 
} 
function updateState (currentState){} 
function draw() {
     background(220); updateState(state) 
}

Inicialmente pensei em fazer uma versão mais interativa(com vários botões), implementação que ja fiz em outras linguagens, mas confesso que depois de experimentar com as cores a criatividade do que fazer a mais esgotou, portanto decidi entregar esta versão rasa, mas que me hipnotizou. Depois que vi que era pra ser um trabalho "Estático", mas mexi no código para ele começar assim.

Controles:
    Barra de Espaço: Pausa
    Clique do Mouse: Aciona uma Célula
