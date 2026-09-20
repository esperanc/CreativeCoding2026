---
title: Violin Strings
tags: [p5js, generative, interactive, noise, music, violin, physics]
collection: artefato da semana/5
---

# Violin Strings

A visualisation of how the strings of a violin vibrate when they are bowed.

I play the violin, so I wanted to explore something I know from playing the
instrument: a string does not simply move as one smooth wave. Its vibration
is made up of several harmonics, or overtones, which combine to create the
sound we hear.

The four horizontal lines represent the four violin strings (G, D, A and E).
Each string is animated as a combination of several harmonics. Moving the
mouse left and right changes the simulated position of the bow along the
strings, which changes which harmonics are excited. Moving the mouse up and
down changes the energy of the vibration.

The small irregularities in the movement are created with Perlin noise.
Rather than adding completely random movement, the noise produces a more
coherent and organic variation inspired by the tiny irregularities produced
by the bow hair gripping and releasing the string.

## Why this idea

I have played the violin for more than 10 years and I wanted to
build from something I actually understand.
A bowed string is genuinely governed by position: the excitation of harmonic 
*k* at bow position *u* follows `abs(sin(k * PI * u))`, which is exactly 
zero at that harmonic's nodes. Bow exactly at the midpoint and every even 
harmonic vanishes; that's real acoustics, the same principle behind *sul ponticello* 
(bowing near the bridge for a bright, harmonic-rich tone) versus bowing over 
the fingerboard (a warmer, fundamental-heavy tone).

## How it works

- Position -> harmonic content : the bow's horizontal position
is mapped to a value `bowU` between 0 and 1 along each string; each
harmonic's amplitude is scaled by `abs(sin(k * PI * bowU))`, the physical
node/antinode rule.
- Noise -> organic imperfection : instead of a perfectly clean
sine wave, each harmonic on each string reads its own slice of Perlin
noise (`noise(k, stringIndex, time)`) to drift its amplitude and phase
slightly over time -- coherent, breathing irregularity rather than
`random()` static.
- Smoothing: `lerp()` eases the bow's tracked position and energy toward
the mouse instead of snapping instantly, so the interaction feels weighted
rather than jumpy.
- Layout: string positions and margins are computed as proportions of
`windowWidth`/`windowHeight`, so the composition adapts to any window size.
- Drawing uses `beginShape()`/`vertex()` for each string's curve, with
`push()`/`pop()` kept implicit through function-local state, and
`stroke()`/`fill()` for the warm, instrument-wood colour palette.

## Interaction

- Move the mouse left/right : changes where the bow touches the strings, which changes which harmonics dominate.
- Move the mouse up/down : changes bow energy (pressure), from a faint touch to a fully driven string.

## AI usage

This sketch was built with the help of Claude. I had the idea of the concept
to represent my own instrument. Claude proposed the harmonic excitation by
bow position model.

Author: Yasmine
