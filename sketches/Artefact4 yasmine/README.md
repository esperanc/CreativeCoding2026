---
collection: artefato da semana/4
---

# Pli — An Interactive Tribute to *Movement in Squares*

Author : Yasmine
Course : Topics and Special Topics in Digital Systems — Artefacto 4

## Inspiration

This sketch is inspired by “Movement in Squares” (1961), a painting by
British artist Bridget Riley, a leading figure in the Op Art movement.

- Artwork (Arts Council Collection): https://artscouncilcollection.org.uk/artwork/movement-squares

## Connection between the sketch and the artwork

In the original painting, Riley constructs a grid of black and
white squares whose height remains constant, but whose width gradually decreases
as they approach the center of the canvas. This variation
in width creates the optical illusion that the picture plane is folding or
pinches, as if the flat surface of the painting were wrinkling under the effect
of an invisible force.

This sketch directly echoes this geometric principle : in each row,
the squares are drawn side by side, and the width of each square depends
on its distance from a fold line, exactly as in the painting. The
difference is that, in Riley’s work, the fold is frozen on the canvas. 
Here, the fold becomes a dynamic parameter:

- moving the mouse horizontally **shifts the
- Moving the mouse horizontally moves the fold in the image
- Moving the mouse vertically changes the intensity of the pinch

## Technical concepts used 

- `map()`: converts the distance to the fold into a width factor
- `lerp()`: smooths the movement of the fold from one frame to the next, for a fluid motion rather than an abrupt jump toward the mouse
- `constrain()`: keeps the width factor within a valid range

## Use of AI

This sketch was developed with the help of Claude. Our discussion
focused on : choosing a source of inspiration consistent with the 
geometric concepts covered in class, designing the interactive mechanism. 

## Files

- `index.html` : loads p5.js from a CDN 
- `sketch.js` : commented source code for the sketch
- `image_squares.png` : preview of the generated rendering
- `README.md` : this file
