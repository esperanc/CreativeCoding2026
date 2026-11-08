---
title: Fita Emaranhada
tags: [AI, Claude, WEBGL, 3D, fita, geometria]
collection: artefato da semana/10
---

A obra é uma fita magnética de cassete solta, ondulando como um nó tridimensional em WEBGL. A fita não é uma primitiva do p5.js: é uma geometria construída vértice a vértice com buildGeometry, em que cada segmento tem seção retangular (duas faces e duas bordas) e os triângulos são gerados ao longo de um caminho formado pela soma de senóides em frequências diferentes, com um desvio de noise. A orientação da seção é propagada ponto a ponto (transporte paralelo do quadro de referência) e recebe uma torção crescente com variação de noise, o que faz a fita girar sobre si mesma. As normais são calculadas com computeNormals e a geometria é refeita a cada quadro, de modo que o nó se desfaz e se refaz devagar. Luzes ambiente, direcional quente e pontual azulada, junto de um material especular marrom, fazem a fita brilhar como plástico. A câmera gira lentamente e pode ser controlada com o mouse (orbitControl). A IA (Claude) foi utilizada como ferramenta de apoio no desenvolvimento do código em p5.js, auxiliando na ideia do tema, na construção da geometria da fita e no cálculo do quadro de referência ao longo do caminho. A partir dessas sugestões, o código foi adaptado e refinado para alcançar o resultado visual desejado.

**Prompt sugestivo:**

> Crie um sketch em p5.js (versão 2, carregado por CDN), em canvas WEBGL do tamanho da janela, que mostre uma fita de cassete emaranhada. Construa a fita com buildGeometry: ela segue um caminho 3D (soma de senóides com desvio de noise), tem seção retangular fina e torção ao longo do comprimento, usando transporte paralelo para orientar a seção. Chame computeNormals e refaça a geometria a cada quadro com liberação da anterior (freeGeometry), para que o nó ondule devagar. Use ambientLight, directionalLight, pointLight e specularMaterial marrom com shininess, fundo escuro, rotação lenta e orbitControl.
