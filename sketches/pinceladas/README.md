---
title: Pinceladas
tags: [AI, Claude, imagem, pintura, pinceladas, picsum]
collection: artefato da semana/8
---

A obra transforma uma foto sorteada do picsum.photos, carregada pela internet a cada execução, numa pintura feita aos poucos por pinceladas. A foto é desfocada em três níveis e, em cada um, pinceladas curvas começam em pontos sorteados e caminham perpendicularmente ao gradiente da luminância, ou seja, acompanham os contornos, e param quando a cor deixa de se aproximar da foto. Primeiro entram pinceladas largas que cobrem o papel, depois só se pintam, com pincéis cada vez menores, os lugares onde a tela ainda difere da foto. Cada pincelada é feita de várias cerdas com pequenas variações de cor, e as maiores recebem um brilho de tinta. Segurando o mouse pressionado dá para espiar a foto original; a tecla espaço sorteia outra foto e S salva a imagem. A IA (Claude) foi utilizada como ferramenta de apoio no desenvolvimento do código em p5.js, auxiliando no carregamento assíncrono da imagem, no cálculo do gradiente e do desfoque e na organização das camadas de pinceladas. A partir dessas sugestões, o código foi adaptado e refinado para alcançar o resultado visual desejado.

**Prompt sugestivo:**

> Crie um sketch em p5.js (versão 2), em um canvas de 900×900, que carregue em setup (async/await) uma foto de https://picsum.photos (por id, 900×900, servidor com CORS) sem incluir nenhum arquivo de imagem no projeto, e a reproduza como uma pintura feita por pinceladas, no estilo da pintura "impressionista" por camadas de Hertzmann. Use três camadas com pincéis, em cada uma, desfoque a foto proporcionalmente ao raio, sorteie pontos numa grade com jitter e, nas camadas finas, só pinte onde a tela difere da foto. Cada pincelada segue a direção perpendicular ao gradiente da luminância, com direção suavizada, comprimento máximo e parada quando a cor da pincelada não melhora a tela. Desenhe cada pincelada como várias cerdas paralelas com pequenas variações de cor e, nas grandes, um leve brilho. Anime a pintura por tempo sobre um fundo cor de papel com textura. Segurar o mouse mostra a foto original, espaço sorteia outra foto e S salva a imagem.
