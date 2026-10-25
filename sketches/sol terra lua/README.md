---
title: Sol, Terra, Lua
tags: [AI, Gemini]
collection: artefato da semana/9
---

## Autor: Nick Correa
## IA Utilizada: Gemini

OBS: O canvas é interativo com mouse, você poder arrastar (panorâmica) com o botão direito, dar zoom com o scroll do mouse, e rotacionar seu ponto de vista com o botão esquerdo.

# Artefato 3D - Sistema Sol, Terra e Lua

Modelo 3D simplificado e interativo focado no movimento orbital e de rotação do Sol, da Terra e da Lua, desenvolvido em p5.js (modo WEBGL) para a Aula 9.

### Dinâmica:
- **Sol**: Posicionado no centro, emitindo luz e girando em seu próprio eixo.
- **Terra**: Orbita ao redor do Sol e gira no seu próprio eixo.
- **Lua**: Orbita ao redor da Terra enquanto acompanha sua trajetória solar e gira no próprio eixo.

### Primitivas 3D:
- `sphere` (Sol, Terra e Lua)
- `torus` (Linhas guias das órbitas)

A Terra possui uma textura gerada de forma procedural.