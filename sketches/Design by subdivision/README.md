---
tags: [catmull-clark, subdivision, hansmeyer, generative]
---

This sketch is inspired by Michael Hansmeyer's work on design by subdivision, 
in particular his Extended Catmull-Clark subdivision scheme, as detailed in the article
"Design by Subdivision" (http://archive.bridgesmathart.org/2010/bridges2010-167.pdf)
presented at the Bridges 2010 conference. Only the basic features 
of this scheme were implemented, but enough to produce some interesting results.

Several other mesh operators are also implemented, including the original 
Catmull-Clark subdivision algorithm (https://en.wikipedia.org/wiki/Catmull%E2%80%93Clark_subdivision_surface), 
the Doo-Sabin subdivision algorithm (http://graphics.cs.ucdavis.edu/education/CAGDNotes/Doo-Sabin/Doo-Sabin.html), 
vertex cutting, face extrusion, face center extrusion and the dual operator.

By default, the sketch starts in demo mode, where interesting results are 
shown in rotation. Hit 'd' to toggle. 

The several operations on solids, starting from one of the 5 platonic polyhedra,
can be applied in cascade using the interface panel.
