---
title: Escultura Orbital de Cristal 3D
tags: [AI, Gemini, webgl, 3d, p5js, generative-art]
collection: artefato da semana/9
---

# Escultura Orbital de Cristal 3D

Este artefato explora a **computação gráfica 3D no p5.js utilizando o modo WEBGL**, construindo uma escultura gerativa dinâmica através da composição de primitivas tridimensionais, iluminação vetorial e controle de câmera interativo.

## 📐 Primitivas e Conceitos 3D Utilizados (Aula 9)

1. **Primitivas Tridimensionais do p5.js:**
   - `sphere()`: Utilizada para o núcleo central e corpos celestes.
   - `box()`: Utilizada no núcleo cúbico modular e nos satélites periféricos.
   - `torus()`: Utilizada para a criação dos anéis de órbita concêntricos (com detalhes dentro dos limites de buffer de WebGL).
   - `cylinder()`: Utilizada para criar as hastes estruturais de conexão espacial.
   - `cone()`: Utilizada nos raios estelares 3D e elementos direcionais.

2. **Desativação de Stroke (`noStroke()`):**
   - No modo WebGL do p5.js, objetos 3D com iluminação se beneficiam de `noStroke()`, o que remove contornos escuros e previne limitações de buffers de stroke em objetos com múltiplos vértices (como o `torus`).

3. **Renderização WebGL sem Dependência de Fontes Externas:**
   - A interface de usuário (UI) foi implementada através de uma camada HTML/CSS transparente sobreposta. Isso garante que o canvas WebGL 3D seja inicializado e renderizado imediatamente em qualquer navegador sem travamentos de preload.

4. **Iluminação Tridimensional (Lighting System):**
   - `ambientLight()`: Proporciona uma iluminação de preenchimento suave no ambiente.
   - `directionalLight()`: Simula uma luz dourada distante orientada no espaço.
   - `pointLight()`: Luzes pontuais orbitantes com cores contrastantes (azul e rosa neon) que projetam destaques e sombras dinâmicas.

5. **Propriedades de Superfície e Materiais:**
   - `specularMaterial()` e `shininess()`: Criam o efeito de brilho e reflexo cristalino nas superfícies 3D.
   - `ambientMaterial()`: Aplica cores vibrantes e difusas aos elementos geométricos.

6. **Transformações e Câmera Interativa:**
   - Navegação 3D habilitada através da função `orbitControl()`, permitindo rotacionar a câmera livremente e aplicar zoom.
   - Matrizes de transformação 3D (`translate`, `rotateX`, `rotateY`, `rotateZ`, `push`, `pop`).

## 🕹️ Interatividade
- **Arrastar o Mouse (Botão Esquerdo):** Rotaciona a câmera 3D ao redor da escultura.
- **Scroll do Mouse:** Aplica zoom de aproximação ou afastamento na cena 3D.
- **Teclas `1`, `2`, `3`:** Alternam entre os 3 modos de composição tridimensional:
  - **Modo 1:** Esfera & Toros Orbitais Concentricos.
  - **Modo 2:** Núcleo Cúbico Modular com Hastes Cilíndricas.
  - **Modo 3:** Estrela Radiante de Cones Tridimensionais.

## 🛠️ Especificações Técnicas
- **p5.js Versão 2 via CDN:** Carregado externamente via jsDelivr (`https://cdn.jsdelivr.net/npm/p5@2.0.0/lib/p5.min.js`).
- **Nenhum arquivo ou biblioteca local incluído no arquivo ZIP.**
