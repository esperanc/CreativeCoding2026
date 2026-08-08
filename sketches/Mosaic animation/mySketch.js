let ot;

let myShader;

function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);
	myShader = createShader(vert, frag);
	generate();
}

function mouseClicked() {
	generate()
}

let grid, anim, createTile, createAnimatedTile, bkgColor, shaderSettingBkg;

function generate() {
	grid = new FlexGrid(min(width, height) / 8);
	let n = grid.cellCount;
	let pal = random(palettes);
	let pa = pal.slice(0, int(pal.length / 2));
	let pb = pal.slice(int(pal.length / 2));
	if (random() < 0.5)[pa, pb] = [pb, pa];
	bkgColor = random(pb);
	let de = random([
		['parallelHalfCircles', 'doubleHalfCircles'],
		['leaf'],
		['quarterArc'],
		['quarterCircle'],
		['halfCircle','circle'],
		['quarterCircle', 'doubleQuarterCircles','tripleQuarterCircles']
	]).map(i => drawLib[i]);
	const srcPoints = [createVector(-1,0),createVector(1,0),
										 createVector(0,-1),createVector(0,1)];
	const dstPoints = [createVector(1,0),createVector(-1,0),
										 createVector(0,1),createVector(0,-1)];
	const corners = [createVector(-0.5,-0.5), createVector(-0.5,0.5), 
									createVector(0.5,-0.5), createVector(0.5,0.5),]
	const origin = createVector(0,0);
	shaderSettingBkg = random(shaderSettings);
	let shaderCbBg = shaderTileCallback (shaderSettingBkg), shaderCbFg = shaderTileCallback (random(shaderSettings));
	createTile = () => {
		// let shaderCbBg = shaderTileCallback (random(shaderSettings));
		// let shaderCbFg = shaderTileCallback (random(shaderSettings));
		let bgTile = new Tile(drawLib.square, random(pb), null, shaderCbBg);
		let fgTile = new Tile(random(de), random(pa), new Rotate(random([0,PI/2,PI,3*PI/2])), shaderCbFg);
		return new CompositeTile(bgTile,fgTile);
	}
	createAnimatedTile = (ct1,ct2) => {
		let fgTransf, bgTransf;
		let ipt = random([0,1,2,3]);
		if (random()<0.33) {
			fgTransf = new TimedTranslate(srcPoints[ipt],origin);
			bgTransf = new TimedTranslate(origin,dstPoints[ipt]);
		}
		else if (random()<0.5) {
			let aroundPoint = corners[ipt]
			fgTransf = new TimedRotate(-PI/2,0,aroundPoint);
			bgTransf = new TimedRotate(0,PI/2,aroundPoint);
		} else {
			let aroundPoint = corners[ipt]
			fgTransf = new TimedRotate(PI/2,0,aroundPoint);
			bgTransf = new TimedRotate(0,-PI/2,aroundPoint);
		}
		
		let tile = new OverlayTile(ct1,ct2,bgTransf,fgTransf);
		let anim = simpleAnim({inDelay:random(0,10),inDuration:random(0.5,1)})
		return {ct1,ct2,tile,anim}
	}
	for (let i = 0; i < n; i++) {
		grid.placeElement(
			i < n / 2 ? random([1, 2]) : 1, createAnimatedTile(createTile(),createTile())
		);
	}
}



function draw() {
	shader(myShader);
	noStroke()
	let t = millis() * 0.001;
	let lightDir = createVector(0.5, 0.5, 0.5).rotate(t).normalize();
	myShader.setUniform('u_light_dir', lightDir.array());
	myShader.setUniform('u_resolution', [width, height]);
	// let u_cell_bkg, u_cell_fill;
	//print (shaderSettingBkg);
	for (let [variable, value] of shaderSettingBkg) {
		myShader.setUniform(variable, value);
	}
	myShader.setUniform('u_color', glColor(bkgColor));
	rect(-width / 2, -height / 2, width, height);
	for (let el of grid.elements) {
		push();
		grid.elementTransform(el);
		let {ct1,ct2,tile,anim} = el.data;
		let t = anim();
		tile.draw(t);
		if (t == 1 && random()<0.001) {
			grid.elements[el.idx].data = createAnimatedTile(ct2,createTile())
		}
		pop()
	}
}

function glColor(c) {
	return [red(c) / 255, green(c) / 255, blue(c) / 255];
}

function inOutAnim({inDelay=0,inDuration=1,outDelay=0,outDuration=1} = {}) {
	let t0 = millis()/1000;
	let duration = inDelay+inDuration+outDelay+outDuration;
	return ()=> {
		let t = (millis()/1000 - t0)%duration;
		let dt = inDelay;
		if (t < inDelay) return 0;
		t -= inDelay;
		if (t < inDuration) return t / inDuration;
		t -= inDuration;
		if (t < outDelay) return 1;
		t -= outDelay;
		return (outDuration-t) / outDuration;
	}
}

function simpleAnim({inDelay=0,inDuration=1} = {}) {
	let t0 = millis()/1000;
	let duration = inDelay+inDuration;
	return ()=> {
		let t = millis()/1000 - t0;
		let dt = inDelay;
		if (t < inDelay) return 0;
		t -= inDelay;
		if (t < inDuration) return t / inDuration;
		return 1;
	}
}


function shaderTileCallback (settings) {
	return (tile) => {
		for (let [variable, value] of settings) {
			myShader.setUniform(variable, value);
		}
		myShader.setUniform('u_color', glColor(tile.fillColor))
	}
}

class FlexGrid {
	constructor(cellSize) {
		let ncols = floor(width / cellSize);
		let nrows = floor(height / cellSize);
		let dx = floor((width - ncols * cellSize) / 2);
		let dy = floor((height - nrows * cellSize) / 2);
		let grid = [];
		let free = new Set();
		for (let i = 0; i < ncols * nrows; i++) free.add(i);
		let elements = [];
		Object.assign(this, {
			nrows,
			ncols,
			dx,
			dy,
			grid,
			free,
			elements,
			cellSize
		})
	}
	get cellCount() {
		return this.ncols * this.nrows;
	}
	elementTransform(el) {
		translate(-width / 2 + this.dx + (el.col + el.sz / 2) * this.cellSize,
			-height / 2 + this.dy + (el.row + el.sz / 2) * this.cellSize);
		scale(this.cellSize * el.sz);
	}
	placeElement(sz, data) {
		let {
			grid,
			nrows,
			ncols,
			elements,
			free
		} = this;
		let freeIndices = shuffle([...free], true);
		for (let cellIndex of freeIndices) {
			let row = int(cellIndex / ncols);
			if (row + sz > nrows) continue;
			let col = cellIndex % ncols;
			if (col + sz > ncols) continue;
			let ok = true;
			for (let i = 0; i < sz && ok; i++) {
				for (let j = 0; j < sz && ok; j++) {
					let index = (row + i) * ncols + col + j;
					if (grid[index]) ok = false;
				}
			}
			if (ok) {
				elements.push({
					idx: elements.length,
					row,
					col,
					sz,
					data
				});
				for (let i = 0; i < sz && ok; i++) {
					for (let j = 0; j < sz && ok; j++) {
						let index = (row + i) * ncols + col + j;
						grid[index] = true;
						free.delete(index);
					}
				}
				return true;
			}
		}
		return false
	}
}