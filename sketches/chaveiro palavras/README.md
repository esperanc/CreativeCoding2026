---
title: Chaveiro de Palavras
tags: [AI, Claude, WebGL, modelagem, buildGeometry, fechadura]
collection: artefato da semana/10
---

# Chaveiro de Palavras

Uma fechadura de pinos (tipo Yale) desenhada em corte, como uma planta técnica em 3D.
Você digita uma palavra de 5 letras e ela vira uma chave: cada letra define a
profundidade de um corte da lâmina. A chave entra na fechadura, os pinos sobem
apoiados no perfil dos cortes e o cilindro só gira se todos os pinos pararem
exatamente na linha de corte — ou seja, se a palavra "cortar" igual ao segredo.

Como só existem 6 profundidades, letras diferentes caem no mesmo corte
(A G M S Y · B H N T Z · C I O U · D J P V · E K Q W · F L R X), então várias
palavras abrem a mesma fechadura, como chaves falsas.

## Modelagem
- A chave é uma `p5.Geometry` construída à mão com `buildGeometry()`:
  o perfil da lâmina é uma função linear por partes (cortes, cristas e ponta),
  extrudada em faixas de triângulos com `beginShape(TRIANGLES)`, `vertex()` e
  `normal()` explícitas; o ombro e o sulco são caixas e a cabeça é um anel
  gerado por setores.
- A geometria é refeita a cada letra digitada e pode ser exportada com
  `saveObj()` (botão "Exportar chave .obj").
- A fechadura usa primitivas (`cylinder()`, `cone()`, `box()`), molas em hélice
  feitas com `vertex()` e plug/carcaça translúcidos em wireframe.
- Iluminação com `ambientLight()`, `directionalLight()`, `pointLight()` e
  `specularMaterial()`; câmera com `orbitControl()`.

## Controles
- **Campo "Palavra":** digite até 5 letras para cortar uma nova chave.
- **Enter / botão Inserir:** insere ou retira a chave.
- **Trocar segredo:** sorteia outra palavra-segredo para a fechadura.
- **Exportar chave .obj:** baixa o modelo da chave atual.
- **Mouse:** arraste para girar a câmera, role para aproximar.

Depois de inserir, a leitura dos pinos mostra ✓ (certo), ▲ (corte raso demais)
ou ▼ (corte fundo demais) — dá para descobrir o segredo por tentativa.

## Arquivos
- `index.html`: página e carregamento do p5.js **2.3.4** via CDN jsDelivr.
- `sketch.js`: código do sketch (modo `WEBGL`).
- `Thumbnail.png`: miniatura.

O zip não contém a biblioteca p5.js.

## Uso de IA
Feito com auxílio de IA (**Claude**), na ideia, no código e na documentação.
