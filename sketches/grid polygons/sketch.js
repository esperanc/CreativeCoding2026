const gridDim = 16;
const margin = 50;
const maxTries = 700;

// Teste de interseção de segmentos
function segmentIntersect(a, b, c, d) {
  // produto vetorial: sinal indica de que lado de p->q está r
  const cross = (p, q, r) =>
    (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);

  // assume r colinear com p-q: verifica se está dentro do retângulo delimitador
  const onSeg = (p, q, r) =>
    Math.min(p[0], q[0]) <= r[0] && r[0] <= Math.max(p[0], q[0]) &&
    Math.min(p[1], q[1]) <= r[1] && r[1] <= Math.max(p[1], q[1]);

  const d1 = cross(c, d, a);
  const d2 = cross(c, d, b);
  const d3 = cross(a, b, c);
  const d4 = cross(a, b, d);

  // caso geral: a e b em lados opostos de c-d, e c e d em lados opostos de a-b
  if (((d1 > 0) !== (d2 > 0)) && d1 !== 0 && d2 !== 0 &&
      ((d3 > 0) !== (d4 > 0)) && d3 !== 0 && d4 !== 0) return true;

  // casos colineares / extremidade tocando o outro segmento
  if (d1 === 0 && onSeg(c, d, a)) return true;
  if (d2 === 0 && onSeg(c, d, b)) return true;
  if (d3 === 0 && onSeg(a, b, c)) return true;
  if (d4 === 0 && onSeg(a, b, d)) return true;

  return false;
}

class Grid {
  constructor (nx, ny, cell) {
    let mx = (width-nx*cell)/2;
    let my = (height-ny*cell)/2;
    let n = (nx+1)*(ny+1)
    Object.assign(this, {nx,ny,cell,mx,my,n})
    this.edges = new Set()
    this.pEdges = new Map()
  }
  pcode (i,j) {
    return i*(this.nx+1)+j
  }
  pcodeToGridCoords(p) {
    let j = p % (this.nx+1);
    let i = floor(p/(this.nx+1))
    return [i,j]
  }
  pcodeToCoords(p) {
    return this.coords(...this.pcodeToGridCoords(p))
  }
  coords (i,j) {
    return [this.mx+this.cell*i, this.my+this.cell*j]
  }
  ecode (p1,p2) {
    if (p1>p2) [p1,p2] = [p2,p1]; // Canonize edge codes
    return p1*(this.n+1)+p2
  }
  ecodeToPcode(e) {
    let p2 = e % (this.n+1);
    let p1 = floor(e/(this.n+1))
    return [p1,p2]
  }
  addEdge(p1,p2) {
    let e = this.ecode(p1,p2);
    this.edges.add(e);
    {
      let pedges = this.pEdges.get(p1) || []
      pedges.push (e)
      this.pEdges.set(p1,pedges)
    }
    {
      let pedges = this.pEdges.get(p2) || []
      pedges.push (e)
      this.pEdges.set(p2,pedges)
    }
  }
  randomEdge(len) {
    let p1 = floor(random(this.n));
    let [i,j] = this.pcodeToGridCoords(p1);
    
    let imin = max(0, i-len);
    let imax = min(i+len,this.nx);
    let jmin = max(0, j-len);
    let jmax = min(j+len,this.ny);
    let i2, j2;
    if (random()<0.5) {
      i2 = round(random(imin,imax))
      j2 = random([jmin,jmax])
    }
    else {
      i2 = random([imin,imax])
      j2 = round(random(jmin,jmax))
    }
    let p2 = this.pcode(i2,j2)
    return this.ecode(p1,p2)
  }
}

let grid;

function setup() {
  createCanvas(windowWidth, windowHeight);
  const aspect = width/height;
  
  // Create grid
  if (aspect > 1) {
    let ny = gridDim;
    let nx = floor (gridDim * aspect);
    let cell = (height-margin*2)/gridDim;
    grid = new Grid(nx,ny,cell)
  }
  else {
    let nx = gridDim;
    let ny = floor (gridDim / aspect);
    let cell = (width-margin/2)/gridDim;
    grid = new Grid(nx,ny,cell)
  }
  
  // Border edges
  for (let i = 0; i < grid.nx; i++) {
    grid.addEdge(grid.pcode(i,0),grid.pcode(i+1,0));
    grid.addEdge(grid.pcode(i,grid.ny),grid.pcode(i+1,grid.ny));
  }
  for (let j = 0; j < grid.ny; j++) {
    grid.addEdge(grid.pcode(0,j),grid.pcode(0,j+1));
    grid.addEdge(grid.pcode(grid.nx,j),grid.pcode(grid.nx,j+1));
  }
}

function splitEdge (e) {
  let [p1,p2] = grid.ecodeToPcode(e);
  let [i1,j1] = grid.pcodeToGridCoords(p1);
  let [i2,j2] = grid.pcodeToGridCoords(p2);
  let [di,dj] = [i2-i1,j2-j1]
  if (abs(di) == abs(dj) || i1 == i2 || j1 == j2) {
    let n = max(abs(di),abs(dj));
    let [i,j] = [i1,j1];
    let result = [];
    di /= n;
    dj /= n;
    for (let k = 1; k <= n; k++) {
      let p1 = grid.pcode(i1+di*(k-1),j1+dj*(k-1));
      let p2 = grid.pcode(i1+di*(k),j1+dj*(k));
      result.push(grid.ecode(p1,p2))
    }
    return result;
  }
  else return [e]
}

function addRandomEdge() {
  const len = 3;
  let e = grid.randomEdge(len);
  if (grid.edges.has(e)) return null; // Duplicate edge
  let [p1,p2] = grid.ecodeToPcode(e);
  if (p1 == p2) return null; // Degenerate edge
  let a = grid.pcodeToGridCoords(p1)
  let b = grid.pcodeToGridCoords(p2)
  let elen = max(abs(a[0]-b[0]), abs(a[1]-b[1]));
  if (elen < len) return; // Small edge
  for (let e2 of grid.edges) {
    let [p3,p4] = grid.ecodeToPcode(e2);
    if (p3 == p1 || p3 == p2 || p4 == p1 || p4 == p2) continue;
    let c = grid.pcodeToGridCoords(p3)
    let d = grid.pcodeToGridCoords(p4)
    if (segmentIntersect(a,b,c,d)) return null;
  }
  for (let e1 of splitEdge(e)) {
    let [p1,p2] = grid.ecodeToPcode(e1);
    grid.addEdge(p1,p2)
  }
}


function trimEdges () {
  let toTrim = [];
  for (let e of grid.edges) {
    let [p1,p2] = grid.ecodeToPcode(e);
    let pedges1 = grid.pEdges.get(p1);
    let pedges2 = grid.pEdges.get(p2);
    if (pedges1.length < 2 || pedges2.length < 2) {
      toTrim.push(e);
      pedges1.splice(pedges1.indexOf(p1),1)
      pedges2.splice(pedges2.indexOf(p2),1)
    }
  }
  for (let e of toTrim) {
    grid.edges.delete(e)
  }
}
function draw() {
  background(200)

  if (frameCount < maxTries) {
    addRandomEdge();
  } 
  else if (frameCount === maxTries) {
    print ("stopped");
  }
  else if (frameCount < maxTries+10) {
    trimEdges()
  }
  
  // Draw edges
  for (let e of grid.edges) {
    let [p1,p2] = grid.ecodeToPcode(e);
    line (...grid.pcodeToCoords(p1), ...grid.pcodeToCoords(p2))
  }

  for (let p = 0; p < grid.n; p++) {
    circle (...grid.pcodeToCoords(p),5)
  }
  
}

