---
title: Leviathan Abissal
tags: [AI, Gemini, WebGL, buildGeometry, ProceduralAnimation, InverseKinematics]
collection: projeto final/Thalisson Braga/1
---

# Leviathan Abissal e Cinemática Procedural (Etapa 1 / 3)

Este projeto final desenvolve, ao longo de três semanas, uma simulação interativa de uma criatura abissal colossal (Leviathan biomecânico/quitinoso) nadando em uma fossa oceânica profunda no modo WebGL do p5.js v2.

## O que foi implementado nesta Etapa 1
- **Locomoção Vertebral por Cinemática de Cadeia (32 Segmentos)**: O corpo da criatura não usa animações pré-gravadas; cada vértebra calcula sua posição e matriz de orientação 3D (vetores *Forward*, *Up* e *Right* via produto vetorial) seguindo a vértebra anterior com restrição de distância rígida e propagação de onda muscular hidrodinâmica.
- **Morfologia Quitinosa com `buildGeometry()`**: Construção manual de malhas poligonais (`TRIANGLES`) com cálculo de vetores normais (`computeNormals()`) para o crânio blindado, mandíbulas inferiores bipartidas, vértebras com quilha dorsal, costelas arqueadas, barbatanas peitorais e leque caudal.
- **Bioluminescência Progressiva**: Órgãos luminosos ao longo da espinha dorsal que disparam pulsos de luz ciano/elétrica da cabeça até a cauda, iluminando dinamicamente a carapaça escura.
- **Ecossistema Abissal**: Cúpula oceânica profunda, chaminés hidrotermais vulcânicas (*black smokers*) e suspensão de neve marinha/plâncton luminescente.

## Planejamento para as Próximas Etapas (Até a 3ª Entrega)

### Etapa 2 (Semana 2) - Tentáculos com Física de Verlet e Cardume de Boids 3D
- Implementar **apêndices e filamentos sensoriais secundários** saindo das costelas e da cabeça utilizando integração física de Verlet 3D (com inércia e arrasto da água).
- Adicionar um **cardume de peixes abissais bioluminescentes** governados pelo algoritmo de *Flocking / Boids* (separação, alinhamento, coesão e evasão de predador quando o Leviathan se aproxima).
- Implementar o bote da mandíbula: abertura reativa das presas inferiores quando a cabeça se aproxima da isca ou do cardume.

### Etapa 3 (Semana 3) - Shaders Submarinos, Câmeras de Perseguição e Áudio Abissal
- Desenvolver um **shader customizado de cáusticas submarinas e atenuação de neblina abissal (*depth fog*)** para aumentar a sensação de escala colossal.
- Adicionar modos de câmera selecionáveis: **Câmera Livre (`orbitControl`)**, **Câmera Dorsal (montada atrás do crânio do Leviathan)** e **Câmera Submarino/ROV (com holofote cônico `spotLight` controlado pelo jogador)**.
- Integrar **áudio procedural via Web Audio API** gerando reverberações graves hidrofônicas, estalos de sonar e o som de deslocamento de água proporcional à velocidade da criatura.

## Controles da Etapa 1
- **Arrastar com o mouse**: Rotaciona a câmera ao redor da fossa abissal (`orbitControl`).
- **Mover o cursor**: No modo de caça, guia a **Isca Bioluminescente** que o Leviathan persegue pelo espaço 3D.
- **Duplo clique**: Alterna entre o **Nado Autônomo (Patrulha em Oito/Espiral)** e o **Modo de Caça (Perseguição ao Cursor)** com abertura agressiva das mandíbulas.
- **Tecla `S`**: Salva um frame como `thumbnail.png` para validação no p5Front.
