function circleCurve (r, n) {
  const pts = []
  const dang = TAU / n
  for (let i = 0; i < n; i++) {
    const ang = i * dang;
    const [s,c] = [sin(ang),cos(ang)]
    pts.push (createVector (c*r,s*r))
  }
  return pts;
}

function curveLength(pts, len = [], closed = false) {
  let l = 0;
  len [0] = 0;
  for (let i = 1; i < pts.length; i++) {
    let dlen = pts[i].copy().sub(pts[i-1]).mag();
    l += dlen; 
    len [i] = l;
  }
  if (closed) {
    let dlen = pts[0].copy().sub(pts[pts.length-1]).mag();
    l += dlen;
    len[pts.length] = l;
  }
  return l;
}

function quadTube (pts, curve, close = false, tex_rate_s = 4, tex_rate_t = 4) {
  let sectionLen = [];
  let pathLen = [];
  const sectionPerimeter = curveLength(curve, sectionLen, true);
  const pathPerimeter = curveLength(pts, pathLen, close);
  const k = pts.length
  if (k < 2) return; 
  let prev_dir = close ? 
    pts[0].copy().sub(pts[k-1]) : 
    pts[1].copy().sub(pts[0]);
    
  let prev_p = null;
  let prev_ring = null;
  let prev_t = 0, t = 0;
  beginShape(QUAD_STRIP);
  const imax = close ? k+1 : k;
  for (let i=0; i < imax; i++) {
    const p = pts[i%k];
    let dir;
    if (i == k-1 && !close) 
      dir = prev_dir.copy();
    else {
      const next_p = pts[(i+1)%k]
      dir = next_p.copy().sub(p)
    }
    t = pathLen[i]/pathPerimeter * tex_rate_t; 
    let ring = ringVectors (dir.copy().add(prev_dir).normalize(), curve);
    let prev_s = 0;
    if (prev_ring) {
      for (let j = 0; j <= ring.length; j++) {
        let jj = j % ring.length;
        let v1 = prev_ring[jj];
        let v2 = ring[jj];
        let s = sectionLen[j] / sectionPerimeter * tex_rate_s;
        let norm = v1.copy().normalize()
        normal (norm.x, norm.y, norm.z);
        let a = prev_p.copy().add(v1)
        vertex(a.x,a.y,a.z, s, prev_t);
        norm = v2.copy().normalize()
        normal (norm.x, norm.y, norm.z)
        let b = p.copy().add(v2)
        vertex (b.x, b.y, b.z, s, t)
      }
      
    }
    prev_t = t;
    prev_dir = dir
    prev_ring = ring
    prev_p = p
  }
  endShape()
}

function ringVectors (dir, curve) {
  const normal = dir.copy().normalize();
  let arbitrary;
  if (abs(normal.z) > 0.99) {
    arbitrary = createVector(1, 0, 1);
  } else {
    arbitrary = createVector(0, 0, 1);
  }
  const u = p5.Vector.cross(normal, arbitrary).normalize();
  const v = p5.Vector.cross(normal, u).normalize();
  let vectors = []
  for (let p of curve) {
    let vU = p5.Vector.mult(u, p.x)
    let vV = p5.Vector.mult(v, p.y);
    vectors.push (p5.Vector.add(vU,vV));
  }
  return vectors
}