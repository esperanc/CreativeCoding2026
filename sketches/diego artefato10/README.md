# Painel Eletromecânico de Sinais & Indicadores Analógicos 3D

**Coleção:** artefato da semana/10  
**Ferramenta:** AI Gemini  
**Autor:** [Seu Nome Aqui]  

## 1. Conceito do Artefato
Este trabalho é uma escultura digital interativa em 3D criada com **p5.js em modo WebGL**, explorando o material da Aula 10 (iluminação 3D, materiais especulares/emissivos e controle orbital de câmera).

O artefato simula um **Console Eletromecânico Retro-Futurista de Análise de Sinais**.

A composição combina:
- **Medidores Analógicos VU:** Mostradores côncavos com agulhas de deflexão dinâmica e tampas de vidro translúcido.
- **Seleitores Rotativos de Bronze (Knobs):** Chaves com acabamento metálico estriado que respondem a cliques do usuário.
- **Tubo Indicador de Válvula / Nixie:** Encapsulamento de vidro borossilicato com filamentos incandescentes aquecidos por emissão de luz.
- **Tela de Osciloscópio Vetorial:** Mostrador de fósforo verde exibindo ondas de interferência harmônica em tempo real.

## 2. Técnicas de WebGL & Iluminação Aplicadas (Aula 10)
- **Modo WebGL Responsivo:** Inicialização via `createCanvas(windowWidth, windowHeight, WEBGL)` com escalonamento dinâmico em `draw()` e readequação em `windowResized()`.
- **Câmera Orbital:** Implementação de `orbitControl()` permitindo rotação, translação e zoom livre ao redor do console.
- **Sistema Multicamadas de Luzes:**
  - `ambientLight()`: Proporciona a iluminação de base do laboratório.
  - `directionalLight()`: Simula iluminação chave dourada vinda do topo.
  - `pointLight()` ciano e âmbar: Fontes pontuais de destaque criando reflexos dinâmicos nos metais e vidros.
- **Propriedades de Materiais Avançados:**
  - `ambientMaterial()` e `specularMaterial()` para definir brilho de alumínio e bronze.
  - `shininess()` ajustado para diferentes texturas (metais foscos vs. vidro alto brilho).
  - `emissiveMaterial()` para áreas retroiluminadas e filamentos energizados.

## 3. Instruções de Interação
- **Girar / Orbitar:** Clique e arraste com o botão esquerdo do mouse para visualizar a estrutura 3D de qualquer ângulo.
- **Zoom:** Utilize a roda do mouse (scroll) para aproximar ou afastar a câmera.
- **Alterar Frequências:** Clique em qualquer ponto da tela com o mouse para girar os seletores rotativos de bronze em incrementos angulares.
