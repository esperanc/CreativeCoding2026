const cell = 40;
const nShapes = 12;

function setup() {
	const canvas = createCanvas(windowWidth, windowHeight);
	generate();
}

function mousePressed() {
	generate()
}

function generate() {
	//pixelDensity(1)
	background(255)
	const S = min (width,height);
	noFill ();
	strokeWeight (3)
	rectMode(CENTER);
	
	const drand = (...args) => floor(random(...args) / cell) * cell;
	for (let i = 0; i < nShapes; i++) {
		const r = drand(S/10,S*0.8);
		const x = drand(width);
		const y = drand(height);
		switch (random(["circle","circle","rectangle"])) {
			case "circle" : circle (x,y,r); break;
			case "rectangle" : rect (x,y,r,drand(S/10,S*0.8)); break;
		}
	}
	line(0,random(height), width, random(height));
	line(random(width),0, random(width), height);

	loadPixels();
	const dens = pixelDensity();
	const start = Date.now()
	const components = imageComponents(pixels, width*dens, height*dens, blackWhite(5));
	//print (Date.now() - start);

	colorMode(HWB,100)
	const seedHue = random(100);
	const centralHues = random([
		[seedHue, (seedHue+50)%100], // Complementary colors
		[seedHue, (seedHue+33.3)%100, (seedHue+66.6)%100] // Triadic colors
	]);
	for (let comp of components) {
		if (comp[0].pixelClass == 0) continue;
		const hue = random(centralHues);
		const clr = color (random(hue-1,hue+1),random(20,80),random(5,20));
		paintComponent (pixels, width*dens,height*dens,comp,clr)
	}
	updatePixels()
}
