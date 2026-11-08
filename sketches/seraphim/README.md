---
title: Serafim e Ophanim Cinético
collection: artefato da semana/10
---

# Serafim e Ophanim Cinético

Artefato interativo em modo WebGL utilizando a biblioteca p5.js v2. O projeto modela uma representação procedural e biblicamente precisa de um Serafim/Ophanim, unindo uma cinemática de íris mecânica tridimensional (com 6 asas articuladas que protegem o núcleo) a rodas de Ophanim concêntricas cravadas de olhos 3D, ambientadas em um Santuário Empíreo em 360 graus.

## Conceito e Desenvolvimento
Fugindo de sólidos de revolução triviais e superfícies onduladas padrão, todas as formas complexas do artefato foram construídas na unha via malhas de triângulos (`TRIANGLES`) encapsuladas em objetos `p5.Geometry` reutilizáveis:
- **Asas e Penas Chanfradas (`buildGeometry`)**: Cada asa é formada por camadas de lâminas curvadas com crista dorsal saliente e cálculo explícito de normais para conferir acabamento usinado/metálico sob iluminação especular.
- **Rodas de Ophanim e Engastes**: Anéis com secção transversal em diamante e cavidades para olhos com pálpebras articuladas que reagem dinamicamente à abertura da entidade.
- **Cenário Empíreo Integrado**: Cúpula celeste com gradiente por vértice, feixes de luz divina (*God Rays*), monólitos flutuantes dispostos em anel arquitetônico e brasas ascendentes geradas deterministicamente no espaço 3D.

## Controles
- **Arrastar com o mouse**: Rotaciona a câmera tridimensional livremente (`orbitControl`).
- **Mover o cursor**: O olho central vigia e acompanha a posição do mouse em tempo real.
- **Duplo clique**: Alterna entre a pulsação automática do Serafim e o controle manual da abertura das asas/pálpebras através da posição horizontal do mouse (`mouseX`).
