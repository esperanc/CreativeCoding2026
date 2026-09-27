---
title: Ribbon of Light
collection: artefato da semana/6
---

# Ribbon of Light

A rhythmic-gymnastics ribbon that draws its own loops and spirals. 
Move the mouse to lead the ribbon and watch the flowing curves appear.
Every so often, golden sparkles break off the ribbon where it's
moving fastest.

## Why this idea, and where the emergence is

When I was a child, I did gymnastics, and ribbon routines were always my favorite. 
I love the way a simple knot in the gymnast’s hand transforms into a flowing shape behind her. 
The ribbon is a chain of 55 knots, and the only rule is that each knot moves a little closer 
to the knot before it with each frame. The sparks form a second layer of emergence: each is a
tiny agent in its own right, with a position, velocity, and lifetime, that only appears when 
the head of the ribbon moves quickly. No spark is aware of the other sparks, but together they
form a trail of dust.

## How it works

- The chain: `ribbon[i]` moves toward `ribbon[i-1]` with `lerp()` every
frame; nothing about the resulting shape is decided in advance.
- The trail: instead of clearing the background each frame, 
low-alpha rectangle is drawn over it, so old ribbon positions fade
instead of vanishing, the same "don't call `background()` inside
`draw()`" trick from the lecture.
- The sparkles: a small particle system, position, velocity, gravity,
fading life, spawned near the ribbon's head only when it's moving
fast enough, each one independent of the others.
- Idle motion: before the mouse moves, the head follows a slow Lissajous
path so the piece is never static.

## Interaction

Move the mouse to lead the ribbon.

## AI usage

Built with the help of Claude. I had the idea of the ribbon since I used to do 
gymnastics and Claude proposed the follow-the-previous-point chain for the ribbon 
and the small particle system for the sparkles, and helped me write the code. 
and trail fade.

Author: Yasmine
