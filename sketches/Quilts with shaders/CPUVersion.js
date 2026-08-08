let cpuIterations = 0;

const cpuVersion = (() => {
	let a, b, c, d, k, x, y;

	const func = (x, y) =>
		a * sin(TAU * x) + b * sin(TAU * x) * cos(TAU * y) + c * sin(4 * PI * x) + d * sin(6 * PI * x) * cos(4 * PI * y) + k * x;

	const iterate = () => {
		let x1 = func(x, y);
		let y1 = func(y, x);
		[x, y] = [x1 - floor(x1), y1 - floor(y1)];
	}

	const gridSize = 50;
	const gmax = gridSize*gridSize;
	let grid = new Uint16Array(gmax);
	let count, countMax, popMap = new Map();

	function randomize() {
		[a, b, c, d, k] = [
			random(-1,1),random(-1,1),random(-1,1),random(-1,1),
			//random(-4,4),random(-4,4),random(-4,4),random(-4,4),
			int(random(-4, 4))
		];
		grid.fill(0);
		count = 0;
		countMax = 0;
		cpuIterations = 0;
		[x, y] = [0.1, 0.3];
	}
	
	function iterateBatch(batchSize=5000) {
		for (let i = 0; i < batchSize; i++) {
			iterate();
			const ix = int(x * gridSize);
			const iy = int(y * gridSize);
			const j = iy * gridSize + ix;
			++grid[j];
		}
		cpuIterations += batchSize;
	}

	function makePopMap() {
		popMap.clear();
		countMax = 0;
		for (let i = 0; i < gmax; i++) {
			const cell = grid[i];
			countMax = max(countMax,cell);
			if (popMap.has(cell)) popMap.set(cell, popMap.get(cell) + 1);
			else popMap.set(cell, 1)
		}
	}
	
	function isBad() {
		makePopMap();
		const threshold = 10;
		return [...popMap.keys()].some(x => x > threshold);
	}
	
	function parameters () {
		return [a,b,c,d,k];
	}
	
	function popHistogram (bins = 20) {
		countMax = 0;
		for (let i = 0; i < gmax; i++) {
			const cell = grid[i];
			countMax = max(countMax,cell);
		}
		return makeHistogram(grid,0,countMax,bins)
	}
	
	return { randomize, iterateBatch, isBad, parameters, popHistogram, grid }
	
}) ();

function makeHistogram (samples,minSample,maxSample,bins) {
  let delta = (maxSample-minSample)/(bins-1);
  let histo = new Array(bins);
  //print ({samples,minSample,maxSample,bins,delta});
  for (let i = 0; i < bins; i++) histo[i] = 0;
  let maxCount = 0;
  for (let s of samples) {
    let bin = floor((s-minSample) / delta);
    histo[bin]++
    maxCount = max(maxCount, histo[bin]);
  }
  return {histogram:histo,maxCount,minSample,maxSample};
}