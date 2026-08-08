//
// Functions to draw simple geometric elements within a 1x1 square
//
const drawLib = {
	square: () => square(-0.5,-0.5,1), // 0 -> square
	circle: () => ellipse(0,0,1,1,50),  // 1 -> circle
  quarterCircle: () => arc(-0.5,-0.5,2,2,0,PI/2), // 2 -> quarter circle
	quarterArc: () => { // 3 -> Quarter circle with a hole
		beginShape();
		let c = createVector(-0.5,-0.5);
		let v = createVector(1,0);
		const n = 20;
		for (let i = 0; i <= n; i++) {
			let p = c.copy().add(v.copy().rotate(i*PI/2/n))
			vertex(p.x,p.y,0,p.x,p.y)
		}
		c = createVector(-0.5,-0.5);
		v = createVector (0.5,0);
		for (let i = n; i >= 0; i--) {
			let p = c.copy().add(v.copy().rotate(i*PI/2/n))
			vertex(p.x,p.y,0,p.x,p.y)
		}
		endShape (CLOSE);
	},
	leaf: () => { // 4 -> Leaf
		beginShape();
		let c = createVector(-0.5,-0.5);
		let v = createVector(1,0);
		const n = 20;
		for (let i = 0; i < n; i++) {
			let p = c.copy().add(v.copy().rotate(i*PI/2/n))
			vertex(p.x,p.y,0,p.x,p.y)
		}
		c = createVector(0.5,0.5);
		v = createVector (-1,0);
		for (let i = 0; i < n; i++) {
			let p = c.copy().add(v.copy().rotate(i*PI/2/n))
			vertex(p.x,p.y,0,p.x,p.y)
		}
		endShape (CLOSE);
	},
	halfCircle: () => arc(0,-0.5,1,1,0,PI), // 5-> half circle
	doubleHalfCircles: () => {  // 6 -> 2 half circles back to back
  	arc(0,-0.5,1,1,0,PI);
  	arc(0,0.5,1,1,PI,TWO_PI);
	},
	parallelHalfCircles: () => {  // 7 -> 2 identical half circles
  	arc(0,-0.5,1,1,0,PI);
  	arc(0,0.0,1,1,0,PI);
	},
	doubleQuarterCircles: () => {  // 8 -> 2 quarter circles in opposite corners
  	arc(-0.5,-0.5,1,1,0,PI/2);
  	arc(0.5,0.5,1,1,-PI,-PI/2);
	},
	tripleQuarterCircles: () => {  // 9 -> 3 quarter circles in opposite corners
  	arc(-0.5,-0.5,1,1,0,PI/2);
		arc(0.5,-0.5,1,1,PI/2,PI);
  	arc(0.5,0.5,1,1,-PI,-PI/2);
	},
}

const drawLibArray = Object.values(drawLib);