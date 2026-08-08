let wgNames;
let igroup = 0;

const nParticles = 100;
const speed = 0.004;
const noiseScale = 1;
const radius = 0.01;
const particleAlpha = "30";
const palettes = [
	["#fffdfd", "#b9fcc8", "#7ecff8", "#b56cef", "#aa2938"],
	["#fbfffd", "#e1e8fc", "#f9a7ca", "#ca8326", "#3b6f2e"],
	["#fefeff", "#fde2dc", "#c6cd39", "#2da9a0", "#245cb6"]
];
let palette;
//palette = ['white','red','yellow']
const gradientColor = (t) => {
	t = max(0, min(0.999, (t - 0.2) / 0.7))
	const u = t * (palette.length - 1);
	const i = floor(u)
	const a = u % 1;
	return lerpColor(color(palette[i]), color(palette[i + 1]), u)
}
let seed = 0;
let particles;
let matSet, instance, matrices, frameParameters;
let zoomFactor = 0.5;
let fadeFactor = 5;
let colorScheme = "COLOR";


class Particle {
	constructor() {
		this.newParticle()
	}
	newParticle() {
		this.pos = [random(), random()];
		this.life = random(1000, 2000);
		this.color = 255;
	}
	move() {
		if (this.life-- < 0) this.newParticle();
		let [x, y] = this.pos;
		this.color = gradientColor(noise(x * noiseScale, y * noiseScale, seed))
		const ang = noise(x * noiseScale, y * noiseScale, seed) * TAU * 2;
		x += speed * cos(ang);
		if (x < 0 || x >= 1) x = random();
		y += speed * sin(ang);
		if (y < 0 || y >= 1) y = random();
		this.pos = [x, y]
	}
}



function initParticles() {
	seed = random();
	particles = [];
	for (let i = 0; i < nParticles; i++) particles.push(new Particle())
}

function setup() {
	const canvas = createCanvas(windowWidth, windowHeight);
	canvas.elt.setAttribute("tabindex", 1);
	canvas.elt.focus()
	wgNames = shuffle(Object.keys(wg), true);
	generate()
}

function generate(newGroup = true, newSeed = true, newParameters = true, newPalette = true) {
	background(colorScheme == "BW" || colorScheme === "COLOR" ? 0 : 255)
	if (newSeed) seed = random();
	if (newPalette || !palette) palette = random (palettes);
	initParticles();
	if (newParameters || !frameParameters) genCoordFrameParameters();
	if (newGroup || !matrices) {
		igroup = (igroup + 1) % wgNames.length;
	}
	buildMatrices();
}

function keyPressed() {
  if (key == "F") { // Increase fade factor
    fadeFactor = min (20,fadeFactor+1)
  }
  else if (key == "f") {
    fadeFactor = max (1,fadeFactor-1)
  } else 	if (key == "+") { // Zoom in
		zoomFactor *= 1.2;
		generate(false, false, false, false)
	} else if (key == "-") { // Zoom out
		zoomFactor /= 1.2;
		generate(false, false, false, false)
  } else if (key == "G" || key == "g") { // New group, same field
		generate(true, false, false, false)
	} else if (key == ">") {
		frameParameters.dscale *= 1.2;
		generate(false, false, false, false)
	} else if (key == "<") {
		frameParameters.dscale /= 1.2;
		generate(false, false, false, false)
	} else if ("Cc".includes(key)) { // Color scheme cycle
		colorScheme = colorScheme == "BW" ? 
		  "WB" : (colorScheme == "WB" ? 
		    "COLOR" : "BW");
		generate(false, false, false, true)
	} else if (key == " ") generate()
}

function mousePressed() {
	generate()
}

function genCoordFrameParameters() {
	const ang = random(360);
	const dx = 0 //random(-0.5,0.5)*sz/60;
	const dy = 0 //random(-0.5,0.5)*sz/60;
	const ang2 = random(360);
	const dscale = random(0.5, 1);
	frameParameters = {
		ang,
		ang2,
		dx,
		dy,
		dscale
	};
}

function buildMatrices() {
	const groupName = wgNames[igroup];
	const sz = min(width, height);
	const {
		ang,
		ang2,
		dx,
		dy,
		dscale
	} = frameParameters;
	let tileSize, instanceSize;
	if (['p3', 'p3m1', 'p31m', 'p6', 'p6m'].includes(groupName)) {
		tileSize = sz / 4;
		instanceSize = 0.4;
	} else {
		tileSize = sz / 6;
		instanceSize = 1.2;
	}

	const frame = mul(makeTranslation(Vec(width / 2, height / 2)),
		makeScaling(Vec(tileSize, tileSize)),
		makeRotation(Vec(0, 0), ang2)
	);
	instance = mul(makeTranslation(Vec(dx, dy)),
		makeScaling(Vec(instanceSize * dscale, instanceSize * dscale)),
		makeRotation(Vec(0.5, 0.5), ang))

	textSize(1);
	matSet = new Set();
	matrices = [];
	let batch = [frame];
	matrices.push(frame)
	testTile(frame);
	const levels = 200;
	for (let i = 0; i < levels; i++) {
		const nextBatch = [];
		for (let mat of batch) {
			for (let mat2 of wg[groupName]) {
				let m = mul(mat, mat2);
				if (testTile(m)) {
					nextBatch.push(m);
					matrices.push(m);
				}
			}
		}
		if (nextBatch.length == 0) break;
		batch = nextBatch;
	}
}

function testTile(m) {
	const mat = mul(m, instance)
	const p = transformPoint(Vec(0.1, 0.3), mat);
	if (p.x < -width / 4 || p.x > width * 1.25 ||
		p.y < -height / 5 || p.y > height * 1.35) return false;
	const h = hash(p);
	if (matSet.has(h)) return false;
	matSet.add(h)
	return true;
}

function draw() {

	background(colorScheme == "BW" || colorScheme === "COLOR" ? 0 : 255, fadeFactor);

	// DEBUG
	const s = zoomFactor;
	const [dx, dy] = [width / 5, height / 5]
	noFill()
	stroke(colorScheme == "WB" ? 0 : 255)
	strokeWeight(1 / s)
	translate(width / 2, height / 2);
	scale(s)
	translate(-width / 2, -height / 2)
	rect(0, 0, width, height);
	// const hue = (frameCount%1000)/1000*256
	// fill(hue,128,128)
	noStroke();
	fill (colorScheme == "WB" ? 0 : 255, 90)
	for (let m of matrices) {
		const mat = mul(m, instance);
		push();
		applyMat3(mat);
		scale(2)
		for (let particle of particles) {
			if (colorScheme === "COLOR") fill(particle.color)
			circle(...particle.pos, radius)
		}
		pop();
	}
	for (let particle of particles) particle.move()

}

function hash(p) {
	return Math.round(p.x * 1000) + "," + Math.round(p.y * 1000)
}

function applyMat3([a, b, _, c, d, __, e, f, ___]) {
	applyMatrix(a, b, c, d, e, f)
}