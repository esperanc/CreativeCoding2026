function circlePattern (pg, sz = 0.5) {
  let d = sz * pg.width;
  pg.circle (pg.width/2, pg.height/2, d)
}

function staggeredPattern (pg, sz = 0.5) {
  let d = sz * pg.width;
  pg.circle (pg.width/2, 0, d)
  pg.circle (pg.width/2, pg.height, d)
  pg.circle (0, pg.height/2, d)
  pg.circle (pg.width, pg.height/2, d)
}

function diagonalPattern (pg, sz = 0.4) {
  let w = sz * pg.width;
  let h = pg.height*2;
  let c = sqrt(2)/2*pg.width-w;
  pg.translate(pg.width/2, pg.height/2);
  pg.rotate(PI/4)
  pg.rect(-w/2,-h/2,w,h)
  pg.rect(-w-w/2 - c,-h/2,w,h)
  pg.rect(w/2+c,-h/2,w,h)
}

