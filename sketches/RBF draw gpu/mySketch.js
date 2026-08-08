let points = [], picked, dragged, anchors, values; 
const pickRadius = 10;
const cellSize = 10;
//const kernel = "thin-plate";
let img, imgBuf, rbf, myShader;
let gui;


function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);
	pixelDensity(1);
	let nx = Math.ceil(width/cellSize);
	let ny = Math.ceil(height/cellSize);
	img = createImage(nx,ny);
	img.loadPixels();
	imgBuf = img.pixels;
	background(100);
	gui = new GuiBlock();
	gui.addSelect ("kernel", ['linear',
    'cubic',
    'quintic',
    'thin-plate',
    'gaussian',
    'inverse-multiquadric',
    'multiquadric'], "thin-plate")
  gui.change(computeRBF)
  makeShader()
}

function makeShader() {
  const {vert,frag} = makeShaderSource(gui.kernel);
  myShader = createShader(vert, frag);
}

function computeRBF () {
	if (points.length < 2) {
		rbf = null;
		return;
	}
	const [w, h] = [width, height];
	const D = 2;
	anchors = [
		[-w * D, -h * D],
		[-w * D, h * (D+1)],
		[w * (D+1), h * (D+1)],
		[w * (D+1), -h * D], 
		...points
	];
	const V = -1000;
	values = [V, V, V, V]
	for (let i = 0; i < points.length; i++) values.push(0)
	rbf = RBF(anchors, values, gui.kernel);
	makeShader()
}

function computeImage () {
	for (let y = 0; y < img.height; y++) {
		for (let x = 0; x < img.width; x++) {
			let addr = (y * img.width + x) * 4;
			let val = rbf([x*cellSize,y*cellSize]);
			if (val < 0) {
				imgBuf[addr] = imgBuf[addr+3] = 0;
			}
			else {
				imgBuf[addr] = imgBuf[addr+3] = 255;
			}
		}
	}	
	img.updatePixels();
}

function mousePressed() {
	picked = null;
	dragged = false;
	let [mx,my] = [mouseX, mouseY];
	for (let p of points) {
		let [x,y] = p;
		if (dist (x,y,mx,my) < pickRadius) picked = p;
	}
	if (!picked) {
		picked = [mx, my];
		points.push(picked)
		dragged = true;
	}
	computeRBF();
}

function mouseDragged() {
	if (!picked) return;
	dragged = true;
	let [dx,dy] = [mouseX - pmouseX, mouseY - pmouseY];
	picked[0] += dx;
	picked[1] += dy;
	computeRBF()
}

function mouseReleased() {
	if (picked && !dragged) {
		let i = points.indexOf(picked);
		if (i >= 0) {
			points.splice(i,1);
			computeRBF();
		}
	}
	picked = null;
}

function draw() {
	background(100);
	translate(-width/2,-height/2);
	fill ('white');
	if (rbf) {
		push()
		shader (myShader);
		myShader.setUniform('u_height', height);
		myShader.setUniform('u_npts', anchors.length);
		myShader.setUniform('u_color', [1,0,0]);
		myShader.setUniform('u_pts', anchors.flat());
		myShader.setUniform('u_weights', rbf.w);
		myShader.setUniform('u_epsilon', rbf.epsilon);
		noStroke();
		rect(0,0,width,height);
		resetShader();
		pop();
		//computeImage();
		//image (img, 0, 0, img.width*cellSize, img.height*cellSize)
	}
	for (let p of points) {
		let [x,y] = p;
		if (p == picked) stroke('red'); else noStroke();
		circle (x, y, pickRadius*2)
	}
}