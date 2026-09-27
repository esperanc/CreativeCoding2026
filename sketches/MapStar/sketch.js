const DENSITY = [1000, 2000, 6000, 9000];

const DIRECTIONS = [
  [0, -1], [1, -1], [1, 0], [1, 1],
  [0, 1], [-1, 1], [-1, 0], [-1, -1]
];

const MAP_STEPS_PER_FRAME = 200;
const SEARCH_STEPS_PER_FRAME = 50;
const PATH_STEPS_PER_FRAME = 10;
const LAND_DIAMETER = 4;

let clusters = [];
let landPoints = [];
let colors = [];
let markers = [];

let search;
let phase;
let pathIndex;

function setup() {
  createCanvas(windowWidth, windowHeight);
  resetMap();
}

function resetMap() {
  clusters = [];
  landPoints = [];
  markers = [];

  search = null;
  pathIndex = 0;
  phase = "building";

  drawOcean();

  const greenGrass = color("#548249");
  const darkGrass = color("#3E6538");
  const earthBrown = color("#59432F");
  const earthLightBrown = color("#8A7050");

  for (const shade of [
    greenGrass,
    darkGrass,
    earthBrown,
    earthLightBrown
  ]) {
    shade.setAlpha(90);
  }

  colors = [
    ...Array(4).fill(greenGrass),
    ...Array(3).fill(darkGrass),
    earthBrown,
    earthLightBrown
  ];

  addClusters();
  loop();
}

function drawOcean() {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.hypot(centerX, centerY);

  const gradient = drawingContext.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, radius
  );

  gradient.addColorStop(0, "#1C425D");
  gradient.addColorStop(0.5, "#173A56");
  gradient.addColorStop(1, "#12324F");

  drawingContext.save();
  drawingContext.fillStyle = gradient;
  drawingContext.fillRect(0, 0, width, height);
  drawingContext.restore();
}

function addClusters() {
  const columns = 3;
  const rows = 3;

  const cellWidth = width / columns;
  const cellHeight = height / rows;
  const radius = Math.hypot(cellWidth, cellHeight) * 1.5;

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const densityScale = (width * height) / (400 * 400);
      const centerX = (column + 0.5) * cellWidth;
      const centerY = (row + 0.5) * cellHeight;

      clusters.push(
        new Cluster(
          centerX,
          centerY,
          Math.round(random(DENSITY) * densityScale),
          radius
        )
      );
    }
  }
}

function draw() {
  if (phase === "building") {
    let allEnded = true;

    for (const cluster of clusters) {
      for (let i = 0; i < MAP_STEPS_PER_FRAME; i++) {
        cluster.stepForward();
      }

      if (!cluster.ended()) {
        allEnded = false;
      }
    }

    if (allEnded) {
      startSearch();
    }

    return;
  }

  if (phase === "searching") {
    for (let i = 0; i < SEARCH_STEPS_PER_FRAME; i++) {
      if (search.status !== "searching") {
        break;
      }

      search.drawStep();
    }

    drawMarkers();

    if (search.status === "found") {
      phase = "path";
    } else if (search.status === "no-path") {
      finishMap("No path between the markers.");
    }

    return;
  }

  if (phase === "path") {
    push();
    noStroke();
    fill("#201D19");

    for (let i = 0; i < PATH_STEPS_PER_FRAME; i++) {
      if (pathIndex >= search.path.length) {
        break;
      }

      const point = search.path[pathIndex];
      circle(point.x, point.y, 3);
      pathIndex++;
    }

    pop();

    drawMarkers();

    if (pathIndex >= search.path.length) {
      finishMap("Path found.");
    }
  }
}

function startSearch() {
  const unique = new Map();

  for (const point of landPoints) {
    const key = `${point.x.toFixed(6)},${point.y.toFixed(6)}`;
    unique.set(key, point);
  }

  const points = [...unique.values()];

  if (points.length < 2) {
    finishMap("Not enough land points.");
    return;
  }

  const startIndex = floor(random(points.length));
  const start = points.splice(startIndex, 1)[0];
  const goal = random(points);

  markers = [start, goal];

  search = new AStar(
    landPoints,
    start,
    goal,
    LAND_DIAMETER / 2
  );

  phase = "searching";
  drawMarkers();
}

function drawMarkers() {
  push();
  noStroke();
  fill("#E53935");

  for (const point of markers) {
    circle(point.x, point.y, 10);
  }

  pop();
}

function finishMap(message) {
  phase = "done";
  console.log(message);
  noLoop();
}

function keyPressed() {
  if (key === "r" || key === "R") {
    resetMap();
  }
}