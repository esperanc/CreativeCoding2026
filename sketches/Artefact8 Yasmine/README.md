---
title : Core Sample
tags : [AI, Claude, image, geology, interactive]
collection : artefato da semana/8
---

# Core Sample

I chose a photo to be read as a geological cross-section. A drill follows 
the mouse across the picture. When it stops, it descends and pulls out a 
core sample made of the pixels under it. The layers of the core (cut wherever 
the colour jumps) appear on the right next to a brightness log, the way a well 
log sits beside a core in a geology report. Click to keep a sample : kept cores 
line up in the order they sit in the photo, so you can compare the layers from 
one place to the next. Press C to clear them. If nobody touches the mouse, the 
drill goes on drilling and keeping samples by itself.

## Why this idea

I started with the idea of using a desert or cliff photo. I found one on picsum 
where variations in colour and texture can resemble geological strata. This inspired 
Claude to suggest turning the image into a geological core sample. I liked the idea 
of transforming a photograph into something resembling a geological survey : each 
column of pixels becomes a depth profile, with layers identified by colour changes 
and a brightness log showing how the image varies with depth.

## How it works

- `loadImage()` with `await` in an `async setup()`, from a CORS-enabled URL
- The photo is shrunk to 300 px wide with `resize()` and `loadPixels()` is
called once, then pixels are read with the index
`4 * (y * width + x)`.
- Each row of the column is averaged over a 3x3 neighbourhood to remove noise
(0.222 r + 0.707 g + 0.071 b)
- Layers : walk down the column keeping a running average colour. When a pixel
differs from it by more than a threshold (and the layer is thick enough),
start a new layer
- The drill position is eased with `lerp()`, moving to a new column lifts the
drill and restarts the hole
- The depth scale (0 to 80 m) is nominal; it only gives the core a ruler
## Interaction

- Move the mouse left and right to place the drill
- Click to keep the current core
- Press C to clear the kept cores

## AI usage

Built with the help of Claude. I had the idea based on a desert or cliff 
photo that used the pixel-as-data part of the lecture. Then, I chose the 
core-sampling one. Claude helped me write the code and I wrote the comments
and I checked the layer logic in p5front.

Author: Yasmine
