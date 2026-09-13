---
title: Trab4-ProgCriativa-HAlmico
collection: artefato da semana/4
---

title: Colcha e Olho tags: [p5js, generative, claude, colcha, olho, ruido]
Composição generativa: uma colcha de retalhos emoldura a cena — uma moldura amarela com friso de costura, uma faixa de retalhos coloridos costurados entre si — enquanto no centro um grande motivo de olho/espiral em traço vinho domina a composição. Ao redor, uma lua crescente hachurada, uma pequena grade de janelas quadriculadas e marcas de faísca espalhadas pelo fundo, sobre um campo de cor que se comporta como um terreno, com transições orgânicas entre azul-acinzentado, verde-musgo e bege.
O canvas é quadrado e se adapta ao tamanho da janela disponível; não há semente fixa de aleatoriedade, então cada execução gera uma variação nova da mesma composição.
Técnicas usadas:
deslocamento de vértices por ruído coerente (noise()), consultado na posição de cada ponto, para um tremor suave e orgânico nas bordas da moldura e dos retalhos — em vez de vértices deslocados de forma independente, o que resultaria numa borda serrilhada;
o fundo lido como um terreno: noise(x, y) tratado como "altitude" e convertido em cor por faixas, para uma transição orgânica entre as zonas de cor;
coordenadas polares para o motivo de olho/espiral — uma "rosácea" (raio como função periódica do ângulo) para o contorno externo, e uma espiral (ângulo e raio crescendo juntos) para o redemoinho interno, ambas com uma perturbação de ruído somada à fórmula; o contorno externo consulta o ruído em (cos(ângulo), sin(ângulo)) para fechar sem descontinuidade;
vetores (direção, perpendicular, interpolação) para desenhar a costura ao longo de uma borda;
transformações afins (translate/rotate/scale + push()/pop()) para posicionar as marcas de faísca e as células da grade de janelas a partir de uma forma local única;
beginShape()/vertex()/endShape() para os polígonos de vértices variáveis (moldura, contorno do olho, espiral).
Inspiração: três obras de Ivo Almico, vistas em posts do Instagram —
https://www.instagram.com/p/CbGDDStOByh/ — uma aquarela: fundo em blocos de cor suave, emoldurado por uma faixa de retalhos coloridos com marcas de costura nas bordas, dentro de uma moldura amarela com friso verde. Inspirou diretamente a moldura, a faixa de retalhos e a técnica de costura, além da paleta de cor do fundo.
https://www.instagram.com/p/CPdbeXXhpBc/ — uma pintura mais abstrata: sobre um fundo tipo colcha de retalhos, um traço grosso em tom vinho desenha formas de olho/espiral e pequenas marcas de "faísca" (asterisco), com uma pequena grade quadriculada ao lado. Inspirou o motivo central de olho/espiral, as faíscas e a grade de janelas.
https://www.instagram.com/p/DAwuoo5JYsE/ — um desenho recente: lua amarela crescente com hachura diagonal na parte escura, sobre um céu com estrelas em forma de asterisco. Inspirou a lua hachurada.

https://iaalmico.wixsite.com/almico

Cada um desses elementos foi reinterpretado como uma construção generativa (curvas em coordenadas polares, ruído coerente, transformações), não copiado diretamente das imagens.
Autor: Henrique Almico Dias da Silva
Prompt usado: Use redes sociais e páginas web como inspiração para o próximo artefato. Inclua no README os links para a(s) obra(s) usadas como inspiração e esclareça a ligação entre elas e o sketch.
