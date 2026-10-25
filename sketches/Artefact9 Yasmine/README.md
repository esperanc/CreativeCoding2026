---
title: Moving Staircases
tags: [AI, Claude, 3D, webgl, fantasy]
collection: artefato da semana/9
---

# Moving Staircases

A great stone hall where the staircases never stay put, in the spirit of the
moving staircases of Hogwarts in the Harry Potter movies. A spiral staircase 
turns slowly around its pole, three straight flights swing back and forth on 
their pivots (two of them hang from floating balconies), and dozens of candles 
drift through the air, four of them really lighting the room. Drag to look 
around, scroll to zoom, right-drag to pan.

## Why this idea

I wanted to recreate the Great Hall of the famous Hogwarts Castle from Harry 
Potter, which is my favorite movie series. 

## How it works (WEBGL, 3D primitives)

- `createCanvas(w, h, WEBGL)`, with `box`, `cylinder`, `plane` and
`ellipsoid` as the only shapes.
- Spiral staircase : each step is drawn with `translate` (up), `rotateY`
(turn), `translate` (out), the same "rotate, then push outward". 
The whole staircase turns with one `rotateY(time)`.
- Swinging flights : each flight is a group: move to the pivot, rotate,
then draw its steps in that rotated space. Changing one angle moves every 
step at once.
- Hall : a ring of pillars and lintels, again `rotateY` then `translate`,
wide enough that the camera stays inside it.
- Light : a dim `ambientLight`, a faint `directionalLight` for moonlight
and four `pointLight`s attached to four candles, with `lightFalloff()` so
they fade with distance (p5 allows five lights of each type per shape).
Flames use `emissiveMaterial`, stone uses `specularMaterial` and
`shininess`.
- Camera : `camera()` and `perspective()` set once in `setup()`, the
`orbitControl()` to explore.

## Interaction

Drag to rotate the view, scroll to zoom, right-drag to pan.

## AI usage

Built with the help of Claude. I chose the moving-staircase idea. Claude helped 
me write the code and comments. I reviewed how the scene is built and checked 
the layout and proportions.

Author: Yasmine
