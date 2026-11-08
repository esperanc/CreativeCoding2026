---
title: Fish of Triangles
tags: [AI, ChatGPT, 3D, WebGL, geometry, marine]
collection: artefato da semana/10
---

# Fish of triangles

A short, articulated underwater study based on a fish whose body is hand-built as a triangular mesh. The scene begins from a distance, then cuts to a close-up where you can see its edges, vertices, and normals.

## Idea

I wanted to create an underwater journey that gradually transforms into a study of 3D geometry. The fish’s body is generated in the sketch from rings of vertices connected by triangular faces.

## How It Works

- The sketch uses `createCanvas(..., WEBGL)` and loads p5.js 2.3.2 from a CDN
- `buildFishBody()` creates a `p5.Geometry` object. Each cross-section is a ring of vertices; neighboring rings are connected by two triangles per cell
- The snout and tail are closed using additional central vertices and triangular faces
- `computeNormals(SMOOTH)` calculates the vertex normals used for smooth shading
- The fish is animated with slight rotations, while its pectoral fins and tail move to suggest that it is swimming
- In close-up view, `drawMeshEdges()` displays the triangular mesh, and `drawVertexNormals()` draws short lines extending from the vertices in the normal directions
- The camera zooms in as the dive progresses. Vertical mouse movement controls the dive, horizontal movement changes the viewing angle

## Interaction

- Move the mouse vertically to switch from a distant view to a close-up
- Move the mouse horizontally to rotate around the fish
- If you don't use the mouse, the dive continues automatically

## Using AI

Created with the help of ChatGPT (AI). I chose the theme of underwater fish. ChatGPT helped me implement the custom geometry and interaction, and I revised the concept and structure of the sketch.

Author: Yasmine
