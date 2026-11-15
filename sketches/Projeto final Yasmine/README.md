---
title: Through the Looking Glass
tags: [AI, Claude, WEBGL, 3D, animation, storytelling, fantasy, fragrance]
collection: projeto final/Yasmine Aissa/1
---

# Through the Looking Glass

## Concept

For my final project, I want to create a short cinematic advertisement for a fictional perfume. The inspiration comes from the aesthetics of fairy tales : an old house, a mysterious mirror, a snow-covered forest, a white owl, and an enchanted red apple.

The idea is to tell a visual story. The mirror acts as a gateway to a fantasy world. An owl guides the main character through the forest towards a glowing apple, which will eventually be revealed as the symbol of the perfume.

The working title is **Through the Looking Glass**. The perfume's name and visual identity may still change during the development process.

## First Implementation — Part 1

This first version is a 44-second horizontal (16:9) film that establishes the atmosphere and the narrative structure, in four scenes:

1. **The house** : an old room with a rug, a bookshelf, an armchair, a lamp, a moonlit window and a mysterious mirror. The camera moves towards the mirror while a silhouette raises her hand to it and the glass starts to glow.
2. **The mirror** : a flash of white light hides the crossing into another world.
3. **The forest** : a snowy pine forest with falling snow and a mist effect (distant trees fade into the colour of the fog). The silhouette walks along a winding path, guided by a white owl with flapping wings. A red glow can be seen far ahead.
4. **The apple** : the glowing red apple, with a halo and floating sparkles, while the owl circles it. The title appears at the end.

The project uses p5.js in WEBGL mode. Everything is created in code with 3D primitives (boxes, planes, spheres, ellipsoids, cylinders), transformations, materials, lights and animation. A simple timeline controls the cameras, lights and movements. This first submission is a visual study : the main character is still a simple silhouette, and the owl and the environment will be refined.

## What I Plan to Add by the Third Submission

1. **Part 2** : improve the 3D models of the main character, the owl and the perfume bottle, develop the mirror-crossing sequence and the labyrinth, improve the choreography and the camera movements.

2. **Part 3** : create the visual transformation of the apple into a perfume bottle, finalize the perfume's visual identity, add post-processing effects using shaders, improve the snow and mist effects and synchronize the final editing with an original or royalty-free soundtrack (there is no sound yet).

I want the final result to feel like a real perfume advertisement, with short cinematic shots, carefully composed framing, expressive lighting, and a consistent atmosphere.

## How to Use

Open `index.html` in your browser, or upload the ZIP file to p5Front and press Run. The film starts by itself.

- Space or click : pause / play
- R : restart

The sketch uses p5.js 2.3.2 via jsDelivr, so an internet connection is required.

## How It Was Made

I used p5.js in WEBGL mode. The house, mirror, trees, owl and apple are built directly in the code from 3D primitives, with transformations, materials and lighting. A timeline of about 44 seconds organizes the four scenes. Snow and sparkles are animated, and the end title is a 2D texture drawn once and placed in the 3D scene.

## Use of AI

I used Claude (Anthropic) to write the code and to explore procedural modeling techniques. The artistic direction, the narrative concept and the atmosphere (the fairy-tale universe, the mirror, the owl and the apple) were defined by me. This is a first implementation that will be developed and refined in the next submissions.

Author: Yasmine
