---
title: Biomas Brasileiros
tags: [AI, gemini, 2d, 3d]
collection: projeto final/Nick Correa/1
---

## Projeto Biomas Brasileiros
### Contexto Socioambiental: Por que esse tema?

Mais do que um exercício de computação gráfica, a construção digital desses ambientes nasce como um registro visual e instrumento de sensibilização diante da crise socioambiental enfrentada pelo Brasil:

* **Queimadas e Devastação na Amazônia:** O avanço contínuo de queimadas criminosas e do desmatamento tem transformado vastas áreas de floresta tropical em cinzas, comprometendo a biodiversidade, destruindo corredores ecológicos e alterando o regime de chuvas (os "rios voadores") que abastece outras regiões do país, como o Cerrado e o Pantanal.
* **Exploração Predatória e Perda de Terras Raras Naturais:** A corrida global por minerais estratégicos e **terras raras**, somada ao garimpo ilegal e à mineração sem controle ambiental, pressiona áreas de preservação permanente e unidades de conservação. Essa exploração acelera a supressão da vegetação nativa, contamina bacias hidrográficas com metais pesados e degrada solos que levaram milênios para se formar.
* **Chacinas e Violência contra os Povos Indígenas:** Os povos originários são os principais guardiões da integridade desses biomas — especialmente na Amazônia e no Cerrado. No entanto, comunidades indígenas enfrentam invasões constantes de seus territórios por grileiros, madeireiros e garimpeiros, resultando em conflitos fundiários, contaminação de rios, expulsão de suas terras e chacinas brutais.

Ao permitir que o usuário caminhe virtualmente por representações de cada bioma, o projeto busca dar visibilidade à riqueza natural e cultural que está sob ameaça direta, reforçando que a preservação da floresta e dos campos é indissociável da proteção à vida e à demarcação das terras indígenas.

### Ideia Geral do Projeto

O projeto propõe uma experiência visual em duas formas de navegação:

1. **Mapa Cartográfico Interativo (2D):** Na tela inicial, o usuário visualiza o mapa do Brasil dividido nas seis regiões de biomas, diferenciadas por cores e acompanhadas de legenda interativa. Ao passar o cursor e clicar sobre qualquer região, o sistema identifica o polígono correspondente e carrega a sub-cena daquele ecossistema.
2. **Exploração Imersiva (3D):** Dentro de cada bioma, o ambiente é renderizado em 3D com iluminação direcional, relevo e elementos naturais característicos daquela paisagem. O visitante pode caminhar livremente pelo cenário utilizando as teclas `WASD` (ou setas), correr (`Shift`), pular (`Espaço`) e movimentar a câmera em 360° com o mouse.

A arquitetura foi estruturada de forma modular, separando o controlador principal e o mapa (`sketch.js`) de seis scripts independentes, permitindo que cada ecossistema seja construído, detalhado e atualizado de maneira isolada.
