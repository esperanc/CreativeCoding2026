---
title: Partitura para um Instrumento Impossível
tags: [p5js, arte-generativa, partitura-grafica, musica, notacao]
collection: artefato da semana/5
---

# Partitura para um Instrumento Impossível

**Autor:** Arthur Ramos

Este sketch cria uma partitura gráfica para um instrumento que não existe. Em vez de notas musicais tradicionais, a folha usa blocos, linhas, curvas, pausas, sinais de intensidade e outros símbolos inventados. Cada execução organiza esses elementos de uma maneira diferente, como se o programa compusesse uma nova peça visual.

O trabalho é estático, mas generativo. Ele não produz sempre a mesma imagem: a quantidade, a posição, o tamanho e a cor dos sinais são definidos aleatoriamente. Um clique gera outra partitura. O desenho também é responsivo e usa `windowWidth` e `windowHeight`, adaptando a folha ao espaço disponível.

## Como executar

Abra `index.html` em um navegador com acesso à internet ou copie o conteúdo de `sketch.js` para o editor do p5.js.

## Interação

- **Clique do mouse:** gera uma nova partitura.
- **Tecla R:** gera uma nova partitura.
- **Tecla S:** salva a imagem atual em PNG.
- **Redimensionar a janela:** adapta e recompõe o desenho.
