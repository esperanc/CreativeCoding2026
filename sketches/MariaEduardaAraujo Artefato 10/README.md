---
title: Leão Geométrico
tags: [AI, Gemini, 3D, WebGL, modelagem, anatomia]
collection: artefato da semana/10
---

# Artefato 10 - Modelagem 3D

**Autora:** Maria Eduarda Araújo  
**DRE:** 119054059  

## Sobre o Projeto
Para o artefato de modelagem em WebGL, o objetivo foi levar as primitivas 3D com uma expressividade geométrica, desenvolvendo um Leão animado focado em anatomia e volumetria fluida.

O corpo do leão foi unificado em uma estrutura contínua e optei por dão colocar exoesqueleto ou coisa similar porque achei que ficou esquisito. Tentei fazer uma certa integração do abdômen ao peitoral de forma suave. A juba foi refinada para um sistema orgânico de duas camadas radiais de primitivas `cone`. A camada externa usa um leve deslocamento no eixo X (`-15`) e intercala funções `sin()` e `cos()` para criar um caimento natural e um balançozinho que simula a passagem do vento.

Na cabeça, useii uma lógica de pálpebras que pisca ritmicamente utilizando uma verificação de módulo (`frameCount % 120 < 8`) associada ao `scale()` do eixo Y das esferas oculares. A mandíbula inferior, coloquei dentes afiados (que são simplismente pequenos cones inseridos na hierarquia do focinho), também abre e fecha organicamente seguindo uma curva trigonométrica.

A inspiração pro meu projeto foi porque levei meu irmãozinho no zoologico no domingo e o animal favorito dele foi o leão.
