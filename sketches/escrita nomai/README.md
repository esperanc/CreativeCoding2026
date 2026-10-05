---
title: Escrita Nomai Procedural
tags: [AI, Gemini, typography, generative, outer-wilds, math]
collection: artefato da semana/7
---

# Artefato 7 - Tipografia (Escrita Nomai)

**Aluno:** Thalisson Braga

## Sobre o Projeto
Para este artefato de Tipografia, decidi fugir das abordagens tradicionais e clichês abordadas em aula (como o uso de `textToPoints` para gerar partículas a partir do contorno de fontes). Em vez disso, criei um sistema de **Tipografia Procedural Animada**.

A inspiração visual é a escrita da raça alienígena "Nomai", do aclamado jogo *Outer Wilds*. No universo do jogo, os textos são lidos do centro para as bordas e se ramificam a partir de nós centrais, formando espirais e redes complexas. O algoritmo desenvolvido gera essas estruturas de forma orgânica, "escrevendo" os textos ao longo de curvas matemáticas à medida que a variável de tempo avança. 

Cada clique na tela gera uma nova formação tipográfica única, alterando o sentido da rotação, os ângulos, os trechos de texto e as taxas de ramificação.

## Matemática e Geometria Aplicadas
A base da tipografia não utiliza geometrias prontas de fontes, mas sim o posicionamento e rotação matemática de cada caractere:

1. **Espirais com Decaimento:** A estrutura base calcula o caminho de uma espiral onde o raio cresce, mas a taxa de abertura sofre um leve decaimento (simulando formas mais orgânicas e menos mecânicas).
2. **Cálculo ao longo do Arco:** Para garantir que as letras não se sobreponham na curva, o algoritmo acumula a distância percorrida e utiliza a largura exata de cada caractere (via `textWidth()`) para saber o ponto exato da curva onde a próxima letra deve nascer.
3. **Rotação pela Tangente:** A rotação individual de cada letra acompanha perfeitamente a inclinação da curva naquele ponto específico.
4. **Camadas de Renderização:** O sketch utiliza `createGraphics()` para renderizar um fundo texturizado e otimizar o processo, separando a malha de fundo estática da animação da escrita.

## Conformidade com as Regras da Semana
* **Uso de IA:** A concepção do código matemático e a estruturação do script foram feitas com o auxílio da IA Gemini (declarado nas tags do cabeçalho).
* **Versão do p5.js:** O arquivo `index.html` importa estritamente o `p5.js` versão 2 a partir do CDN oficial (`https://cdn.jsdelivr.net/npm/p5@2.0.0/lib/p5.js`).
* **Fontes Nativas:** Para evitar problemas de CORS, links quebrados em CDNs ou inclusão de arquivos proibidos no ZIP, o sketch utiliza apenas a fonte nativa do sistema do usuário (`Georgia`), respeitando integralmente a regra 3.
* O pacote `.zip` entregue é limpo, contendo apenas o código fonte (`index.html`, `sketch.js`, `style.css`) e este `README.md`.
