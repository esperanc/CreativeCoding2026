let gl, drawPointsArrays, drawPointsProgramInfo, countPointsProgramInfo,
	drawPointsBufferInfo;
let tfBufferInfo1, tfBufferInfo2, tfProgramInfo, fb1, fb2;
let currentSet, nextSet;
const gridSize = 1000;
const batchSize = 500000;
let iterations;
let lutFloat, defLutFloat, lutTex;
let parameters, histogram, countMax;
const numBins = 1024;
const countMultiplier = 4;
let infoBox, paletteBox, plotBox;
let debugMode, squareMode = false;
const palettes = [
	["black", "white"],
	["#2b2805", "#a61442", "#b3670c", "#5d97fc", "#12cbde", "#17f391", "#f4dbff"],
	["#3f0749", "#0d6678", "#1c916c", "#6e93fb", "#a3c40e", "#ffb8bb", "#ffe0bc"],
	["#4b0c12", "#423cd3", "#5c8d1c", "#eb3ced", "#eda314", "#82dbff", "#84ffea"],
	["#49100d", "#3c691e", "#cd1ab3", "#12afaa", "#61befe", "#c8c7ff", "#ffe1ae"],
	["#052e2e", "#316b27", "#d3441c", "#bd930e", "#c49efe", "#a8d2ff", "#ffd9ed"],
	["#102f15", "#125aaa", "#dc1b74", "#f06c1d", "#d3b20c", "#16e8f3", "#f0ddff"],
	["#59032c", "#9e4108", "#9f7f0b", "#66b91f", "#0fd9bf", "#98e2ff", "#e7eeff"],
	["#4f1d02", "#775e08", "#54971f", "#12b9a3", "#3acdfd", "#c5d4ff", "#f7e7ff"],
	["#3a2c02", "#3f7119", "#129885", "#13b0dd", "#a2b9fe", "#ecc4ff", "#ffe7ed"],
	["#1c3609", "#0e7163", "#0d90b6", "#7c99fd", "#e09cfe", "#ffc2d3", "#ffe9df"],
	["#04372f", "#096c89", "#5774f9", "#d26cfb", "#fe97b8", "#ffc7ae", "#ffedbc"],
	["#023443", "#3647e2", "#be28f0", "#fd5f9b", "#fea176", "#fecf3d", "#cfffb5"],
	["#161d77", "#9112b9", "#e81a7d", "#fb7226", "#e3b50d", "#85f717", "#b7fff0"],
	["#48045e", "#b00b5d", "#d1590f", "#c39b0b", "#75d91b", "#12f6d9", "#d8f3ff"]
]
const maxDemoModeIterations = 400;
let palette, lutPower = 1,
	displayScale = 1,
	symmetry, refSymmetry = true, 
	autoDemo = false;

function setDebug() {
	let display = debugMode ? "block" : "none";
	for (let box of [ /*infoBox,*/ paletteBox, plotBox]) {
		box.elt.style.display = display;
	}
}

function mouseWheel (evt) {
	if (event.delta > 0) displayScale *= 1.1;
	else displayScale /= 1.1;
}

function keyPressed() {
	if (key == "d" || key == "D") {
		debugMode = !debugMode;
		setDebug()
	} else if (key == ">" || key == ".") displayScale *= 1.1;
	else if (key == "<" || key == ",") displayScale /= 1.1;
	else if (key == "+" || key == "=") lutPower *= 1.5;
	else if (key == "-" || key == "_") lutPower /= 1.5;
	else if (key == "p" || key == "P") {
		setPalette();
	} else if (key >= '3' && key <= '9') {
		symmetry = int(key);
		generate()
	} else if (key.toUpperCase() == 'R') {
		refSymmetry = !refSymmetry;
		generate();
	}else if (key.toUpperCase() == 'Q') {
		squareMode = !squareMode;
		if (squareMode) resizeCanvas(gridSize, gridSize);
		else resizeCanvas(windowWidth, windowHeight);
	}
	else if (key == "a" || key == "A") 
		autoDemo = !autoDemo;
	else if (key == "s" || key == "S") {
		save("icon.png")
	}

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


function mousePressed() {
	symmetry = undefined;
	generate();
}

function randomPoints() {
	let rp = [];
	for (let i = 0; i < batchSize; i++) {
		rp.push(random(-1, 1), random(-1, 1));
	}
	return rp
}

function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);
	//createCanvas(gridSize, gridSize, WEBGL); // For saving images
	gl = drawingContext;
	displayScale = min(width, height) / gridSize * 2;
	infoBox = createDiv();
	infoBox.elt.style = "background:white;border:1px solid black";
	infoBox.position(10, 20);
	infoBox.html("Info")
	plotBox = createDiv();
	plotBox.elt.style = "background:white";
	plotBox.position(gridSize, 0);
	paletteBox = createDiv();
	paletteBox.position(10, 600);
	paletteBox.html("palette");
	debugMode = false;
	setDebug();

	this.focus(); // make sketch receive the keyboard focus

	const floatExtension = gl.getExtension("EXT_color_buffer_float");
	if (!floatExtension) throw "No floating point fbo extension";


	//---------------------------
	// Transform feedback shader
	//---------------------------
	tfProgramInfo = twgl.createProgramInfo(gl, [tfVS, tfFS], {
		transformFeedbackVaryings: [
			"newPosition",
		],
	});

	// let randomPoints = [];
	// for (let i = 0; i < batchSize; i++) {
	// 	randomPoints.push(random(-1,1), random(-1,1));
	// }

	const tfBufferInfo1 = twgl.createBufferInfoFromArrays(gl, {
		oldPosition: {
			numComponents: 2,
			data: new Float32Array(randomPoints())
		},
		newPosition: {
			numComponents: 2,
			data: batchSize * 2
		},
	});

	const tfBufferInfo2 = twgl.createBufferInfoFromArrays(gl, {
		oldPosition: {
			numComponents: 2,
			buffer: tfBufferInfo1.attribs.newPosition.buffer
		},
		newPosition: {
			numComponents: 2,
			buffer: tfBufferInfo1.attribs.oldPosition.buffer
		},
	});


	const tf1 = twgl.createTransformFeedback(gl, tfProgramInfo, tfBufferInfo1);
	const tf2 = twgl.createTransformFeedback(gl, tfProgramInfo, tfBufferInfo2);

	//----------------------------------------
	// Counting points shader
	//----------------------------------------

	countPointsProgramInfo = twgl.createProgramInfo(gl, [countPointVS, countPointFS]);

	const countPointsBufferInfo1 = twgl.createBufferInfoFromArrays(gl, {
		position: {
			numComponents: 2,
			buffer: tfBufferInfo1.attribs.newPosition.buffer
		},
	});

	const countPointsBufferInfo2 = twgl.createBufferInfoFromArrays(gl, {
		position: {
			numComponents: 2,
			buffer: tfBufferInfo2.attribs.newPosition.buffer
		},
	});


	const attachments = [{
		min: gl.NEAREST,
		mag: gl.NEAREST,
		format: gl.RGBA,
		internalFormat: gl.RGBA32F, // 32-bit float per channel.
		type: gl.FLOAT,
	}, ];

	countPointsFB = twgl.createFramebufferInfo(gl, attachments, gridSize, gridSize);
	let stat = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
	if (stat != gl.FRAMEBUFFER_COMPLETE) throw ("fbo not complete");

	currentSet = {
		tf: tf1,
		tfBufferInfo: tfBufferInfo1,
		countPointsBufferInfo: countPointsBufferInfo1,
	};
	nextSet = {
		tf: tf2,
		tfBufferInfo: tfBufferInfo2,
		countPointsBufferInfo: countPointsBufferInfo2,
	};

	//console.log ([...Object.keys(currentSet.tfBufferInfo.attribs)]);
	//--------------------------------
	// Histogram shader
	//--------------------------------

	histProgramInfo = twgl.createProgramInfo(gl, [histVS, histFS]);
	const dummyArrays = {
		a_dummy: {
			numComponents: 1,
			data: [0]
		},
	}
	dummyBufferInfo = twgl.createBufferInfoFromArrays(gl, dummyArrays);
	const histogramTex = twgl.createTexture(gl, {
		target: gl.TEXTURE_2D,
		width: numBins,
		height: 1,
		min: gl.NEAREST,
		mag: gl.NEAREST,
		format: gl.RGBA,
		wrapS: gl.CLAMP_TO_EDGE,
		wrapT: gl.CLAMP_TO_EDGE,
		internalFormat: gl.RGBA32F,
		type: gl.FLOAT,
	});
	histogramFb = twgl.createFramebufferInfo(gl, [{
		attachment: histogramTex
	}], numBins, 1);
	histData = new Float32Array(numBins * 4); // RGBA per texel.
	lutFloat = new Float32Array(numBins);
	defLutFloat = new Float32Array(numBins);
	for (let i = 0; i < numBins; i++)
		lutFloat[i] = defLutFloat[i] = smootherStep(0, numBins / 2, i) ** 0.2;
	lutTex = twgl.createTexture(gl, {
		src: lutFloat,
		width: numBins,
		height: 1,
		format: gl.RED,
		internalFormat: gl.R32F,
		type: gl.FLOAT,
		wrapS: gl.CLAMP_TO_EDGE,
		wrapT: gl.CLAMP_TO_EDGE,
		min: gl.NEAREST,
		mag: gl.NEAREST,
	});


	//--------------------------------
	// draw points shader
	//--------------------------------
	drawPointsProgramInfo = twgl.createProgramInfo(gl, [drawVS, drawFS]);
	displayProgramInfo = twgl.createProgramInfo(gl, [drawVS, displayFS]);
	const dpArray = {
		position: {
			data: [1, 1, 1, 0, 0, 0, 0, 1],
			numComponents: 2
		}
	};
	drawPointsBufferInfo = twgl.createBufferInfoFromArrays(gl, dpArray);
	drawPointsFB = twgl.createFramebufferInfo(gl, [{
		format: gl.RGBA,
	}], gridSize, gridSize);


	// Create palette texture

	paletteTex = twgl.createTexture(gl, {
		width: numBins,
		height: 1,
		format: gl.RGBA,
		type: gl.UNSIGNED_BYTE,
		min: gl.NEAREST,
		mag: gl.NEAREST,
		wrapS: gl.CLAMP_TO_EDGE,
		wrapT: gl.CLAMP_TO_EDGE,
	});

	pg = createGraphics(numBins, 40);
	pg.canvas.style.display = "block";
	pi = pg.createImage(numBins, 1);
	paletteBox.elt.append(pg.canvas);

	generate()

}

let initialized, tries;

function generate() {

	initialized = false;
	tries = 0;

	iterations = 0;

	// Reinit positions
	twgl.setAttribInfoBufferFromArray(gl, currentSet.tfBufferInfo.attribs.oldPosition, new Float32Array(randomPoints()));


	// Clear count buffer
	twgl.bindFramebufferInfo(gl, countPointsFB);
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	twgl.bindFramebufferInfo(gl, null);
	setPalette()
}

function setPalette() {
	// set palette
	palette = [...random(palettes)];
	//if (random() < 0.5) 
	palette.reverse();
	const paletteValues = [];
	for (let i = 0; i < numBins; i++) {
		let j = i * 4;
		let k = i / (numBins - 1) * (palette.length - 1);
		let color1 = color(palette[floor(k)]);
		let color2 = color(palette[min(palette.length - 1, floor(k) + 1)]);
		let alpha = k - floor(k);
		let c = lerpColor(color1, color2, alpha);
		paletteValues[j] = red(c);
		paletteValues[j + 1] = green(c);
		paletteValues[j + 2] = blue(c);
		paletteValues[j + 3] = 255;
	}

	twgl.setTextureFromArray(gl, paletteTex, paletteValues, {
		width: numBins,
		height: 1,
		format: gl.RGBA,
		type: gl.UNSIGNED_BYTE,
		min: gl.NEAREST,
		mag: gl.NEAREST,
		wrapS: gl.CLAMP_TO_EDGE,
		wrapT: gl.CLAMP_TO_EDGE,
	});

	pi.loadPixels();
	for (let i = 0; i < pi.pixels.length; i++) pi.pixels[i] = paletteValues[i];
	pi.updatePixels();
	pg.image(pi, 0, 0, numBins, 40);
}

function draw() {
	if (!initialized) {
		for (let i = 0; i < 20; i++) {

			tries++;
			infoBox.html(`Finding a good one. Try ${tries}.`);
			cpuVersion.randomize(symmetry, refSymmetry);
			if (!cpuVersion.isBad()) {
				parameters = cpuVersion.parameters();
				initialized = true;
				return;
			}
		}
		return;
	}

	++iterations;
	if (autoDemo && iterations > maxDemoModeIterations) {
		generate();
		return;
	}
	let {
		tf,
		tfBufferInfo,
		countPointsBufferInfo,
	} = currentSet;

	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	// Update points

	gl.enable(gl.RASTERIZER_DISCARD);

	gl.useProgram(tfProgramInfo.program);
	gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
	gl.beginTransformFeedback(gl.POINTS);
	twgl.setBuffersAndAttributes(gl, tfProgramInfo, tfBufferInfo);
	let [a, b, c, d, e, n] = parameters;
	twgl.setUniforms(tfProgramInfo, {
		a,
		b,
		c,
		d,
		e,
		n
	});
	twgl.drawBufferInfo(gl, tfBufferInfo, gl.POINTS);
	gl.endTransformFeedback();
	gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

	gl.disable(gl.RASTERIZER_DISCARD);

	// count points
	twgl.bindFramebufferInfo(gl, countPointsFB);
	gl.useProgram(countPointsProgramInfo.program);
	twgl.setUniforms(countPointsProgramInfo, {
		u_maxCoord: cpuVersion.gridMax * 1.1
	});
	twgl.setBuffersAndAttributes(gl, countPointsProgramInfo, countPointsBufferInfo);

	// Enable additive blending so that multiple fragments add their contributions.
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.ONE, gl.ONE);

	twgl.drawBufferInfo(gl, countPointsBufferInfo, gl.POINTS);
	twgl.bindFramebufferInfo(gl, null);

	gl.disable(gl.BLEND);

	infoBox.html(`${autoDemo?"DEMO MODE ":""}${iterations} iterations`);

	// Histogram maybe
	if (iterations % 50 == 0) {
		twgl.bindFramebufferInfo(gl, histogramFb);
		gl.viewport(0, 0, numBins, 1);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		// Enable additive blending so that multiple fragments add their contributions.
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE);

		gl.useProgram(histProgramInfo.program);
		twgl.setUniforms(histProgramInfo, {
			u_gridSize: gridSize,
			u_numBins: numBins,
			u_maxCount: iterations * countMultiplier,
			u_image: countPointsFB.attachments[0],
		});
		twgl.setBuffersAndAttributes(gl, histProgramInfo, dummyBufferInfo);
		// Draw one point per image pixel.
		gl.drawArraysInstanced(gl.POINTS, 0, 1, gridSize * gridSize);
		gl.disable(gl.BLEND);

		gl.readPixels(0, 0, numBins, 1, gl.RGBA, gl.FLOAT, histData);
		let data = [];
		for (let i = 0; i < numBins; i++) data[i] = histData[i * 4];

		const cdf = new Float32Array(numBins);
		cdf[0] = data[0];
		for (let i = 1; i < numBins; i++) {
			cdf[i] = cdf[i - 1] + data[i];
		}
		const totalPixels = gridSize * gridSize;
		// Find the first nonzero CDF value.
		let cdfMin = 0;
		for (let i = 0; i < numBins; i++) {
			if (cdf[i] > 0) {
				cdfMin = cdf[i];
				break;
			}
		}
		// Build the lookup table (LUT) using the histogram equalization formula.
		// Compute normalized LUT values in [0,1] directly.
		for (let i = 0; i < numBins; i++) {
			let normalized = (cdf[i] - cdfMin) / (totalPixels - cdfMin);
			normalized = Math.min(Math.max(normalized, 0.0), 1.0);
			lutFloat[i] = normalized;
		}

		twgl.setTextureFromArray(gl, lutTex, lutFloat, {
			width: numBins,
			height: 1,
			format: gl.RED,
			internalFormat: gl.R32F,
			type: gl.FLOAT,
			min: gl.NEAREST,
			mag: gl.NEAREST,
		});

		plotBox.html("");
		plotBox.elt.append(
			Plot.plot({
				y: {
					grid: true,
				},
				x: {
					ticks: 20,
				},
				marks: [
					Plot.line(lutFloat, {
						x: (d, i) => i,
						y: d => d
					}),
					Plot.line(defLutFloat, {
						x: (d, i) => i,
						y: d => d
					})
				]
			})
		)
	}

	// draw points
	twgl.bindFramebufferInfo(gl, drawPointsFB);
	gl.useProgram(drawPointsProgramInfo.program);
	twgl.setUniforms(drawPointsProgramInfo, {
		u_texture: countPointsFB.attachments[0],
		u_lut: lutTex,
		u_palette: paletteTex,
		u_maxCount: iterations * countMultiplier,
		u_lutPower: lutPower,
	})
	twgl.setBuffersAndAttributes(gl, drawPointsProgramInfo, drawPointsBufferInfo);
	twgl.drawBufferInfo(gl, drawPointsBufferInfo, gl.TRIANGLE_FAN);

	twgl.bindFramebufferInfo(gl, null);
	gl.useProgram(displayProgramInfo.program);
	twgl.setUniforms(displayProgramInfo, {
		u_texture: drawPointsFB.attachments[0],
		u_gridSize: gridSize,
		u_scale: displayScale,
		u_size: [width * pixelDensity(), height * pixelDensity()]
	});
	twgl.setBuffersAndAttributes(gl, displayProgramInfo, drawPointsBufferInfo);
	twgl.drawBufferInfo(gl, drawPointsBufferInfo, gl.TRIANGLE_FAN);

	[nextSet, currentSet] = [currentSet, nextSet];

}

function smootherStep(edge0, edge1, x) {
	// Scale, and clamp x to 0..1 range
	x = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));

	return x * x * x * (x * (6.0 * x - 15.0) + 10.0);
}