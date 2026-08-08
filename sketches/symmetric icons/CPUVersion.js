let cpuIterations = 0;

// // Raise a complex number z (as vec2) to an integer power n using de Moivre’s theorem.
const cpow = (z, n) => {
	// Compute the polar coordinates of z
	let r = z.mag();
	let theta = atan2(z.y, z.x);
	// Raise the modulus to the power n
	let rn = r**n;
	// Multiply the angle by n
	let ntheta = n*theta;
	return createVector(rn * cos(ntheta), rn * sin(ntheta));
}

// Return the conjugate of z
const cconj = (z) => createVector (z.x, -z.y);

const cpuVersion = (() => {
	
	let result;
	let z;
	let a, b, c, d, e, n;
	
	const iterate = () => {
		let term1 = z.copy().mult(a + b * z.magSq() + c*(cpow(z,n).x));
		let term2 = cpow(cconj(z),n-1).mult(d);
		let term3 = createVector(-z.y*e, z.x*e);//cmult(z, createVector(0,e)); 
		z = term1.add(term2).add(term3);
	}
	
	const sgSize = 100;
	const sgSizeSq = sgSize*sgSize;
	let sgrid = new Uint16Array(sgSizeSq);
	let gridMax;

	function randomize(symmetry, refSymmetry = true) {
		[a, b, c, d, e, n] = [
			int(random(-1,1)*500)/100,
			int(random(-1,1)*500)/100,
			int(random(-1,1)*500)/100,
			int(random(-1,1)*500)/100,
			refSymmetry ? 0 : int(random(-1,1)*500)/100,
			symmetry || int(random()<0.7 ? random(3,10) : random(10,30)),
		];
		z = createVector(0.1, 0.3);
	}
	
	
	function probeBatch(batchSize = 1000)  {
		for (let i = 0; i < batchSize; i++) {
			iterate();
			gridMax = max(gridMax,abs(z.x),abs(z.y));
			if (gridMax > 2) throw `not converging: gridMax=${gridMax}`;
			const ix = int((z.x+1) * sgSize/2);
			const iy = int((z.y+1) * sgSize/2); 
			const j = iy * sgSize + ix;
			if (j < sgSizeSq) {
				++sgrid[j];
			}
		}
	}
	
	function isBad() {
		sgrid.fill(0);
		gridMax = 0;
		try {
			probeBatch(1000);
		} catch (err) {
			return true;
		}
		let nonzero = 0;
		let countMax = 0;
		let qcount = [0,0,0,0]
		for (let i = 0; i < sgSizeSq; i++) {
			const cell = sgrid[i];
			if (cell) {
				nonzero++;
				let iq = int(i < sgSizeSq/2)*2 + int((i%sgSize)<sgSize/2);
				qcount[iq]++;
				countMax = max(countMax,cell)
			}
		}
		let bad = nonzero < 600 || min(...qcount) < max(...qcount)/4;
		if (!bad) {
			try {
				probeBatch(20000);	
			} catch (err) {
				return true;
			}
		}
		result.nonZero = nonzero;
		result.countMax = countMax;
		result.qCount = qcount; 
		result.gridMax = gridMax;
		return bad;
	}
	
	function parameters () {
		return [a, b, c, d, e, n];
	}
	
	result = { randomize, isBad, parameters }
	return result;
	
}) ();

