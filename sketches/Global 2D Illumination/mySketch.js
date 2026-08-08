let paintShader, colorShader, floodShader, illumShader,
		distanceShader, distanceShowShader, blurShader,
		prev, next, sz;
let show = 'illum';
let cnv;

function setup() {
	cnv = createCanvas(windowWidth, windowHeight, WEBGL);
	pixelDensity(1);
	sz = min (width,height);
	paintShader = createShader(vertexShaderSrc, paintShaderSrc);
	voronoiShader = createShader(vertexShaderSrc, voronoiShaderSrc);
	floodShader = createShader(vertexShaderSrc, floodShaderSrc);
	distanceShader = createShader(vertexShaderSrc, distanceShaderSrc);
	distanceShowShader = createShader(vertexShaderSrc, distanceShowShaderSrc);
	illumShader = createShader(vertexShaderSrc, illumShaderSrc);
	blurShader = createShader(vertexShaderSrc, blurShaderSrc);
	prev = createFramebuffer({ format: FLOAT, depth: false, textureFiltering: NEAREST, antialias : false });
  next = createFramebuffer({ format: FLOAT, depth: false, textureFiltering: NEAREST, antialias : false  });
}

let t = 8;
function mouseClicked() {
	t++;
}

function keyPressed() {
	if (key=='S' || key=='s') save(cnv, 'myCanvas.jpg');
	else if (show == 'voronoi') show = 'distance';
	else if (show == 'distance') show = 'illum';
	else if (show == 'illum') show = 'voronoi';
}

function draw() {
	
	let t =  millis() * 0.0001;
	noStroke();
	
	// Paint pixels according to the following scheme:
	// r/g: the coordinates of the closest region pixel
	// a: id of region if > 0
	//    0 if empty space, 
	//    -1 if pixel was visited during the jump flood)
	shader(paintShader);
	prev.begin();
	clear();
	noiseSeed(0.5);
	paintShader.setUniform("u_color", [0,0,0,1]);
  for (let i = 0; i < 20; i += 1) {
		paintShader.setUniform("u_color", [0,0,0,i+1]);
		let [x,y] = [
			map(noise(i*10, 0, t), 0, 1, -width/2,width/2),
      map(noise(i*10, 100, t), 0, 1, -height/2,height/2)
		];
		let vec = createVector(20,0);
		push();
		translate (x,y);
	  rotate(map(noise(i*10,1000,t*4), 0, 1, -PI,PI));
		rect(-40,-5,80,10);
    pop()
  }
	prev.end();
	
	// The jump flood passes
	for (let i = 12; i >= 0; i--) {
		next.begin();
		clear();
		shader(floodShader);
		floodShader.setUniform('u_tex', prev.color);
		floodShader.setUniform('u_step',  1<<i); 
		floodShader.setUniform('u_pixel', [1/width,1/height]);
		plane(width, height);
		next.end();
		[next,prev] = [prev, next];
	}
	
	// display
	if (show == 'voronoi') {
		shader(voronoiShader);
		voronoiShader.setUniform('u_tex', prev.color);
		voronoiShader.setUniform('u_pixel', [1/width,1/height]);
		plane(width, height);
	}
	else {
		// Compute distance field
		next.begin()
		clear();
		shader(distanceShader);
		distanceShader.setUniform('u_tex', prev.color);
		distanceShader.setUniform('u_pixel', [1/width,1/height]);
		plane(width, height);
		next.end();
		// Display the distances
		prev.begin();
		clear();
		if (show == 'distance') {
			shader(distanceShowShader);
			distanceShowShader.setUniform('u_tex', next.color);
			plane(width, height);
		}
		else {
			shader(illumShader);
			illumShader.setUniform('u_tex', next.color);
			illumShader.setUniform('u_pixel', [1/width,1/height]);
			illumShader.setUniform('u_time', t);
			plane(width, height);
		}
		prev.end();
		
		next.begin();
		shader(blurShader);
		blurShader.setUniform('u_tex', prev.color);
		blurShader.setUniform('u_pixel', [1/width,1/height]);
		plane(width, height);
		next.end();
		
		shader(blurShader);
		blurShader.setUniform('u_tex', next.color);
		blurShader.setUniform('u_pixel', [1/width,1/height]);
		plane(width, height);
		
	}
}
