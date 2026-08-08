/**
 * Submitted to the #WCCChallenge curation on OpenProcessing for prompt "liquid"
 **/

let myShader;
let bubbles = [];
let colors = [];
let vel = []
const max_n = 40;
const n = 30;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
	pixelDensity(1);
  myShader = createShader(vert, frag);
	for (let i = 0; i < max_n; i++) {
		bubbles.push (random(-1,1), random(-1,1), random(0.01,0.2));
		colors.push (random(0.4,1), random(0.4,1), random(0.4,1))
		vel.push(random([-1,1])*random(0.002,0.004))
	}
}

function draw() {
	for (let i = 0; i < n; i++) {
		let j = i*3+1;
		if (bubbles[j] > 1.1) { 
			bubbles[j] = 1.1;
			bubbles[j-1] = random(-1,1);
			vel [i] = -abs(vel[i])
		}
    if (bubbles[j] < -1.1) { 
			bubbles[j] = -1.1;
			bubbles[j-1] = random(-1,1);
			vel [i] = abs(vel[i])
		}
		bubbles[j] += vel[i];
	}
	background(220);
	shader (myShader);
	myShader.setUniform ("aspect", width/height); 
	myShader.setUniform ("time", millis()/1000); 
	myShader.setUniform ("bubble", bubbles);
	myShader.setUniform ("color", colors); 
	myShader.setUniform ("n_bubbles", n);
	noStroke();
	plane(width,height)
}
