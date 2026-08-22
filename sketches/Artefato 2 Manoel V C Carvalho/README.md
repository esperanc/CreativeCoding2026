---
title: Rectangle, trinagle, elipse and lines
tags: [Generative, color, IA]
collection: artefato da semana/2
---

Sketche feito utilizando os comandos rect, elipse, triangle e line. Além de definição de cores do background e fill's.

Utilizou-se o Chat GPT para tornar o sketch estático mas generativo, utilizando o prompt a segui:

Tornar o código a seguir, do p5front em Estático mas generativo, assegurando que o sketch não gera sempre a mesma imagem. Manter o código original sem modificação, apenas incluindo o código para o sketch se tornar generativo: 

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(10);
  
  // Rectangle
  fill(175);
  stroke (175)
  rect (0, 0, 650, 275)
  
  // Elipse
  fill( 128, 0, 0);
  ellipse(560, 275, 100, 100);
  
   // Triangle
  fill(10);
  triangle(500, 200, 500, 275, 380, 275);
  
  // Triangle
  fill(175);
  triangle(500, 350, 500, 275, 380, 275);
  
  // Elipse
  fill(120, 0, 40);
  ellipse(300, 275, 150, 150);
  
  // Elipse
  fill(220, 20, 60);
  ellipse(120, 275, 200, 200);
  
  // Line
  stroke(120, 0, 40);
  strokeWeight(5);
  line(0, 0, 800, 700)
  
  // Line
  stroke(220, 20, 60);
  strokeWeight(5);
  line(0, 150, 500, 600)
  
}

Autor: Manoel V C Carvalho
