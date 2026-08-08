let grid, cellSize, ncols, nrows, ncells, marginLeft, marginTop;
let n,
  minMargin = 0.03;

// These are palettes based on Bauhaus posters and variations obtained
// by rotating the H channel of these colors in OKLCH space
// See (https://editor.p5js.org/claudio.esperanca/sketches/Otnfnc5gr)
let basePalettes = [
  // Original
  ["#E8DBC3", "#6E737D", "#131B1D", "#DD7E5C", "#EBA32A", "#686F4B", "#505382"],
  // Variations
  ["#e8dbc3", "#6e737d", "#131b1d", "#dd7e5d", "#eca32b", "#686f4b", "#505382"],
  ["#f3d4d4", "#687676", "#161b16", "#cb7cbb", "#ff8aa0", "#84624e", "#116372"],
  ["#d0e3cd", "#787079", "#17191f", "#b09c2d", "#8dc75d", "#477569", "#744767"],
  ["#c7e4d8", "#7b6f74", "#1a181e", "#89a94b", "#45d091", "#437478", "#7c4552"],
];

let palette;

const idx = (col, row) => row * ncols + col;
const col = (idx) => idx % ncols;
const row = (idx) => floor(idx / ncols);

function setup() {
  createCanvas(windowWidth, windowHeight);
  generate();
}

function mouseClicked() {
  generate();
}

function generate() {
  let n = random([ 8, 9, 10, 12, 14]);

  const presetPalette = random(basePalettes);
  palette = shuffle(presetPalette);//.slice(floor(random(0, 5)));

  if (width < height) {
    ncols = n;
    cellSize = round((width * (1 - 2 * minMargin)) / n);
    nrows = floor((height * (1 - 2 * minMargin)) / cellSize);
  } else {
    nrows = n;
    cellSize = round((height * (1 - 2 * minMargin)) / n);
    ncols = floor((width * (1 - 2 * minMargin)) / cellSize);
  }
  marginLeft = round((width - ncols * cellSize) / 2);
  marginTop = round((height - nrows * cellSize) / 2);
  grid = [];
  ncells = nrows * ncols;
  for (let i = 0; i < ncells; i++) grid[i] = -1;
  let ncolors = palette.length;
  let fillCount = ncells;
  let fillColor = 0;
  let frag = random([0.25, 0.25, 0.5, 0.75, 1]);
  let fillQuota = max(1, floor((ncells / ncolors) * frag));
  while (fillCount > fillQuota) {
    const filled = fillGrid(fillQuota, fillColor);
    fillCount -= filled;
    fillColor = (fillColor + 1) % ncolors;
  }
  for (let i = 0; i < ncells; i++) if (grid[i] == -1) grid[i] = fillColor;
}

function fillGrid(count, c) {
  const empty = [];
  for (let i = 0; i < ncells; i++) if (grid[i] == -1) empty.push(i);
  if (empty.length == 0) return 0;
  let seed = empty[floor(random(empty.length))];
  const rotateDir = (dir) => [...dir.slice(1), dir[0]];
  let dir = [
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [0, -1],
    [1, -1],
  ];
  for (let k = floor(random(8)); k >= 0; k--) dir = rotateDir(dir);
  let filled = 0;
  let queue = [seed];
  const ffill = () => {
    while (filled < count && queue.length > 0) {
      seed = queue.shift();
      if (grid[seed] == -1) {
        grid[seed] = c;
        filled++;
        let i = col(seed);
        let j = row(seed);
        for (let [dcol, drow] of dir) {
          let [ii, jj] = [i + dcol, j + drow];
          if (ii >= 0 && ii < ncols && jj >= 0 && jj < nrows)
            queue.push(idx(ii, jj));
        }
      }
    }
  };
  ffill();
  return filled;
}

function neighbors(col, row) {
  const left = max(col - 1, 0);
  const right = min(col + 1, ncols - 1);
  const up = max(row - 1, 0);
  const down = min(row + 1, nrows - 1);
  const go = (col, row) => grid[idx(col, row)];
  return {
    NE: go(left, up),
    E: go(left, row),
    SE: go(left, down),
    N: go(col, up),
    C: go(col, row),
    S: go(col, down),
    NW: go(right, up),
    W: go(right, row),
    SW: go(right, down),
  };
}

function draw() {
  background(255);
  textAlign(CENTER, CENTER);
  for (let i = 0; i < ncols; i++) {
    let x = i * cellSize + marginLeft;
    for (let j = 0; j < nrows; j++) {
      let y = j * cellSize + marginTop;
      //square(x,y,cellSize);
      let { NE, N, NW, E, C, W, SE, S, SW } = neighbors(i, j);
      let ne = +(NE == N && NE == E && NE != C),
        nw = +(NW == N && NW == W && NW != C),
        se = +(SE == S && SE == E && SE != C),
        sw = +(SW == S && SW == W && SW != C);

      let r = cellSize / 2;
      let xx = x + r,
        yy = y + r;
      let dirCode = "" + ne + nw + se + sw;
      push();
      noStroke();
      switch (dirCode) {
        case "1111": // All corners
          fill(palette[NE]);
          triangle(xx - r, yy - r, xx, yy - r, xx - r, yy);
          fill(palette[NW]);
          triangle(xx + r, yy - r, xx, yy - r, xx + r, yy);
          fill(palette[SE]);
          triangle(xx - r, yy + r, xx, yy + r, xx - r, yy);
          fill(palette[SW]);
          triangle(xx + r, yy + r, xx, yy + r, xx + r, yy);
          fill(palette[C]);
          circle(xx, yy, cellSize);
          break;
        case "1110": // All but SW
          fill(palette[NE]);
          triangle(xx - r, yy - r, xx, yy - r, xx - r, yy);
          fill(palette[NW]);
          triangle(xx + r, yy - r, xx, yy - r, xx + r, yy);
          fill(palette[SE]);
          triangle(xx - r, yy + r, xx, yy + r, xx - r, yy);
          fill(palette[C]);
          triangle(xx + r, yy + r, xx, yy + r, xx + r, yy);
          fill(palette[C]);
          circle(xx, yy, cellSize);
          break;
        case "1101": // All but SE
          fill(palette[NE]);
          triangle(xx - r, yy - r, xx, yy - r, xx - r, yy);
          fill(palette[NW]);
          triangle(xx + r, yy - r, xx, yy - r, xx + r, yy);
          fill(palette[C]);
          triangle(xx - r, yy + r, xx, yy + r, xx - r, yy);
          fill(palette[SW]);
          triangle(xx + r, yy + r, xx, yy + r, xx + r, yy);
          fill(palette[C]);
          circle(xx, yy, cellSize);
          break;
        case "1011": // All but NW
          fill(palette[NE]);
          triangle(xx - r, yy - r, xx, yy - r, xx - r, yy);
          fill(palette[C]);
          triangle(xx + r, yy - r, xx, yy - r, xx + r, yy);
          fill(palette[SE]);
          triangle(xx - r, yy + r, xx, yy + r, xx - r, yy);
          fill(palette[SW]);
          triangle(xx + r, yy + r, xx, yy + r, xx + r, yy);
          fill(palette[C]);
          circle(xx, yy, cellSize);
          break;
        case "0111": // All but NE
          fill(palette[C]);
          triangle(xx - r, yy - r, xx, yy - r, xx - r, yy);
          fill(palette[NW]);
          triangle(xx + r, yy - r, xx, yy - r, xx + r, yy);
          fill(palette[SE]);
          triangle(xx - r, yy + r, xx, yy + r, xx - r, yy);
          fill(palette[SW]);
          triangle(xx + r, yy + r, xx, yy + r, xx + r, yy);
          fill(palette[C]);
          circle(xx, yy, cellSize);
          break;
        case "0011": // SE + SW
          fill(palette[C]);
          triangle(xx - r, yy - r, xx, yy - r, xx - r, yy);
          fill(palette[C]);
          triangle(xx + r, yy - r, xx, yy - r, xx + r, yy);
          fill(palette[SE]);
          triangle(xx - r, yy + r, xx, yy + r, xx - r, yy);
          fill(palette[SW]);
          triangle(xx + r, yy + r, xx, yy + r, xx + r, yy);
          fill(palette[C]);
          circle(xx, yy, cellSize);
          break;
        case "1010": // NE+SE
          fill(palette[NE]);
          triangle(xx - r, yy - r, xx, yy - r, xx - r, yy);
          fill(palette[C]);
          triangle(xx + r, yy - r, xx, yy - r, xx + r, yy);
          fill(palette[SE]);
          triangle(xx - r, yy + r, xx, yy + r, xx - r, yy);
          fill(palette[C]);
          triangle(xx + r, yy + r, xx, yy + r, xx + r, yy);
          fill(palette[C]);
          circle(xx, yy, cellSize);
          break;
        case "1100": // NE+NW
          fill(palette[NE]);
          triangle(xx - r, yy - r, xx, yy - r, xx - r, yy);
          fill(palette[NW]);
          triangle(xx + r, yy - r, xx, yy - r, xx + r, yy);
          fill(palette[C]);
          triangle(xx - r, yy + r, xx, yy + r, xx - r, yy);
          fill(palette[C]);
          triangle(xx + r, yy + r, xx, yy + r, xx + r, yy);
          fill(palette[C]);
          circle(xx, yy, cellSize);
          break;
        case "0101": // NW+SW
          fill(palette[C]);
          triangle(xx - r, yy - r, xx, yy - r, xx - r, yy);
          fill(palette[NW]);
          triangle(xx + r, yy - r, xx, yy - r, xx + r, yy);
          fill(palette[C]);
          triangle(xx - r, yy + r, xx, yy + r, xx - r, yy);
          fill(palette[SW]);
          triangle(xx + r, yy + r, xx, yy + r, xx + r, yy);
          fill(palette[C]);
          circle(xx, yy, cellSize);
          break;
        case "1001": // NE+SW
          fill(palette[NE]);
          triangle(xx - r, yy - r, xx, yy - r, xx - r, yy);
          fill(palette[C]);
          triangle(xx + r, yy - r, xx, yy - r, xx + r, yy);
          fill(palette[C]);
          triangle(xx - r, yy + r, xx, yy + r, xx - r, yy);
          fill(palette[SW]);
          triangle(xx + r, yy + r, xx, yy + r, xx + r, yy);
          fill(palette[C]);
          circle(xx, yy, cellSize);
          break;
        case "0110": // NW+SE
          fill(palette[C]);
          triangle(xx - r, yy - r, xx, yy - r, xx - r, yy);
          fill(palette[NW]);
          triangle(xx + r, yy - r, xx, yy - r, xx + r, yy);
          fill(palette[SE]);
          triangle(xx - r, yy + r, xx, yy + r, xx - r, yy);
          fill(palette[C]);
          triangle(xx + r, yy + r, xx, yy + r, xx + r, yy);
          fill(palette[C]);
          circle(xx, yy, cellSize);
          break;
        case "0001": // SW
          fill(palette[C]);
          square(x, y, cellSize);
          fill(palette[SW]);
          //triangle(xx+r,yy+r,xx,yy+r,xx+r,yy);
          square(xx, yy, r);
          fill(palette[C]);
          circle(xx, yy, cellSize);
          break;
        case "0010": // SE
          fill(palette[C]);
          square(x, y, cellSize);
          fill(palette[SE]);
          //triangle(xx-r,yy+r,xx,yy+r,xx-r,yy);
          square(xx - r, yy, r);
          fill(palette[C]);
          circle(xx, yy, cellSize);
          break;
        case "0100": // NW
          fill(palette[C]);
          square(x, y, cellSize);
          fill(palette[NW]);
          //triangle(xx+r,yy-r,xx,yy-r,xx+r,yy);
          square(xx, yy - r, r);
          fill(palette[C]);
          circle(xx, yy, cellSize);
          break;
        case "1000": // NE
          fill(palette[C]);
          square(x, y, cellSize);
          fill(palette[NE]);
          //triangle(xx-r,yy-r,xx,yy-r,xx-r,yy);
          square(xx - r, yy - r, r);
          fill(palette[C]);
          circle(xx, yy, cellSize);
          break;
        case "0000":
          fill(palette[C]);
          square(x, y, cellSize);
          break;
      }
      pop();
    }
  }
	copy (marginLeft,marginTop,cellSize*ncols,cellSize*nrows,0,0,width,height)
}
